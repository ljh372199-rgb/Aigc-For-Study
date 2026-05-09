#!/usr/bin/env python3

import os
import sys
import json
import asyncio
import signal
import logging
from datetime import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum

import httpx
import redis
import docker
from docker.errors import NotFound

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ServiceStatus(Enum):
    HEALTHY = "healthy"
    UNHEALTHY = "unhealthy"
    RECOVERING = "recovering"
    RESTARTED = "restarted"
    FAILED = "failed"


class EventType(Enum):
    HEALTH_CHECK = "health_check"
    RECOVERY_STARTED = "recovery_started"
    RECOVERY_SUCCESS = "recovery_success"
    RECOVERY_FAILED = "recovery_failed"
    SERVICE_DOWN = "service_down"
    SERVICE_UP = "service_up"


@dataclass
class ServiceConfig:
    name: str
    container_name: str
    health_url: Optional[str] = None
    port: Optional[int] = None
    protocol: str = "http"


@dataclass
class HealthEvent:
    timestamp: str
    service: str
    event_type: str
    status: str
    details: Optional[str] = None
    retry_count: Optional[int] = None


class RedisEventLogger:
    def __init__(self, redis_client: redis.Redis):
        self.redis = redis_client
        self.event_key = "ops:auto_recovery:events"
        self.max_events = 1000

    def log_event(self, event: HealthEvent):
        try:
            event_data = json.dumps(asdict(event), ensure_ascii=False)
            pipe = self.redis.pipeline()
            pipe.lpush(self.event_key, event_data)
            pipe.ltrim(self.event_key, 0, self.max_events - 1)
            pipe.execute()
            logger.info(f"事件已记录到 Redis: {event.event_type} - {event.service}")
        except Exception as e:
            logger.error(f"记录事件到 Redis 失败: {e}")

    def get_recent_events(self, count: int = 100) -> List[Dict]:
        try:
            events = self.redis.lrange(self.event_key, 0, count - 1)
            return [json.loads(e) for e in events]
        except Exception as e:
            logger.error(f"获取事件失败: {e}")
            return []


class ServiceMonitor:
    def __init__(
        self,
        config: ServiceConfig,
        docker_client: docker.DockerClient,
        redis_client: Optional[redis.Redis] = None,
        max_retries: int = 3,
        retry_interval: int = 10
    ):
        self.config = config
        self.docker_client = docker_client
        self.redis_client = redis_client
        self.max_retries = max_retries
        self.retry_interval = retry_interval
        self.status = ServiceStatus.HEALTHY
        self.retry_count = 0
        self.event_logger = RedisEventLogger(redis_client) if redis_client else None

    def _log_event(self, event_type: EventType, details: str = None, status: ServiceStatus = None):
        if self.event_logger:
            event = HealthEvent(
                timestamp=datetime.now().isoformat(),
                service=self.config.name,
                event_type=event_type.value,
                status=(status or self.status).value,
                details=details,
                retry_count=self.retry_count
            )
            self.event_logger.log_event(event)

    async def check_http_health(self, client: httpx.AsyncClient) -> bool:
        if not self.config.health_url:
            return True
        
        try:
            response = await client.get(
                self.config.health_url,
                timeout=5.0
            )
            return response.status_code == 200
        except Exception as e:
            logger.warning(f"{self.config.name} HTTP 健康检查失败: {e}")
            return False

    async def check_port_health(self) -> bool:
        if not self.config.port:
            return True
        
        try:
            reader, writer = await asyncio.wait_for(
                asyncio.open_connection('localhost', self.config.port),
                timeout=5.0
            )
            writer.close()
            await writer.wait_closed()
            return True
        except Exception as e:
            logger.warning(f"{self.config.name} 端口健康检查失败: {e}")
            return False

    async def check_container_status(self) -> bool:
        try:
            container = self.docker_client.containers.get(self.config.container_name)
            return container.status == "running"
        except NotFound:
            logger.error(f"容器 {self.config.container_name} 不存在")
            return False
        except Exception as e:
            logger.error(f"检查容器状态失败 {self.config.name}: {e}")
            return False

    async def restart_container(self) -> bool:
        try:
            self.status = ServiceStatus.RECOVERING
            self._log_event(EventType.RECOVERY_STARTED, "开始重启容器")
            
            container = self.docker_client.containers.get(self.config.container_name)
            logger.info(f"重启容器 {self.config.container_name}...")
            
            container.restart(timeout=30)
            
            await asyncio.sleep(5)
            
            if await self.check_container_status():
                self.status = ServiceStatus.HEALTHY
                self.retry_count = 0
                self._log_event(EventType.RECOVERY_SUCCESS, "容器重启成功")
                logger.info(f"容器 {self.config.container_name} 重启成功")
                return True
            else:
                raise Exception("重启后容器未运行")
                
        except NotFound:
            logger.error(f"容器 {self.config.container_name} 不存在，无法重启")
            self.status = ServiceStatus.FAILED
            self._log_event(EventType.RECOVERY_FAILED, "容器不存在")
            return False
        except Exception as e:
            logger.error(f"重启容器 {self.config.container_name} 失败: {e}")
            self.status = ServiceStatus.UNHEALTHY
            self._log_event(EventType.RECOVERY_FAILED, str(e))
            return False

    async def health_check(self) -> bool:
        container_healthy = await self.check_container_status()
        
        if not container_healthy:
            self.status = ServiceStatus.UNHEALTHY
            self._log_event(EventType.SERVICE_DOWN, "容器未运行")
            return False
        
        if self.config.health_url:
            async with httpx.AsyncClient() as client:
                http_healthy = await self.check_http_health(client)
                if not http_healthy:
                    self.status = ServiceStatus.UNHEALTHY
                    self._log_event(EventType.SERVICE_DOWN, "HTTP 健康检查失败")
                    return False
        
        if self.config.port:
            port_healthy = await self.check_port_health()
            if not port_healthy:
                self.status = ServiceStatus.UNHEALTHY
                self._log_event(EventType.SERVICE_DOWN, f"端口 {self.config.port} 不可访问")
                return False
        
        if self.status == ServiceStatus.UNHEALTHY:
            self.status = ServiceStatus.HEALTHY
            self._log_event(EventType.SERVICE_UP, "服务恢复")
        
        return True

    async def attempt_recovery(self) -> bool:
        if self.retry_count >= self.max_retries:
            logger.warning(f"{self.config.name} 已达到最大重试次数 ({self.max_retries})")
            self._log_event(
                EventType.RECOVERY_FAILED,
                f"已达到最大重试次数 {self.max_retries}",
                ServiceStatus.FAILED
            )
            return False
        
        self.retry_count += 1
        logger.info(f"尝试恢复 {self.config.name} (尝试 {self.retry_count}/{self.max_retries})")
        
        if await self.restart_container():
            return True
        
        if self.retry_count < self.max_retries:
            logger.info(f"等待 {self.retry_interval} 秒后重试...")
            await asyncio.sleep(self.retry_interval)
        
        return False


class AutoRecoveryService:
    def __init__(
        self,
        check_interval: int = 60,
        max_retries: int = 3,
        retry_interval: int = 10,
        redis_url: str = "redis://localhost:6379/0"
    ):
        self.check_interval = check_interval
        self.running = False
        self.shutdown_event = asyncio.Event()
        
        self.docker_client = docker.from_env()
        
        try:
            self.redis_client = redis.from_url(redis_url, decode_responses=True)
            self.redis_client.ping()
            logger.info("Redis 连接成功")
        except Exception as e:
            logger.warning(f"Redis 连接失败: {e}，事件日志将被禁用")
            self.redis_client = None
        
        self.monitors: List[ServiceMonitor] = []
        self._setup_monitors(max_retries, retry_interval)

    def _setup_monitors(self, max_retries: int, retry_interval: int):
        service_configs = [
            ServiceConfig(
                name="API",
                container_name="aigc-api-staging",
                health_url="http://localhost:38000/health",
                port=38000
            ),
            ServiceConfig(
                name="Web",
                container_name="aigc-web-staging",
                health_url="http://localhost:38010",
                port=38010
            ),
            ServiceConfig(
                name="DB",
                container_name="aigc-db-staging",
                port=5432
            ),
            ServiceConfig(
                name="Redis",
                container_name="aigc-redis-staging",
                port=6379
            ),
        ]
        
        for config in service_configs:
            monitor = ServiceMonitor(
                config=config,
                docker_client=self.docker_client,
                redis_client=self.redis_client,
                max_retries=max_retries,
                retry_interval=retry_interval
            )
            self.monitors.append(monitor)
            logger.info(f"已配置监控: {config.name}")

    async def check_all_services(self):
        tasks = [monitor.health_check() for monitor in self.monitors]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for monitor, result in zip(self.monitors, results):
            if isinstance(result, Exception):
                logger.error(f"监控 {monitor.config.name} 时发生异常: {result}")
            elif not result:
                logger.warning(f"服务 {monitor.config.name} 健康检查失败")
                await monitor.attempt_recovery()

    async def run(self):
        self.running = True
        logger.info("自动恢复服务已启动")
        
        while self.running:
            try:
                await self.check_all_services()
                await asyncio.sleep(self.check_interval)
            except asyncio.CancelledError:
                logger.info("收到取消信号，停止服务...")
                break
            except Exception as e:
                logger.error(f"监控循环异常: {e}")
                await asyncio.sleep(self.check_interval)

    def stop(self):
        self.running = False
        self.shutdown_event.set()
        logger.info("自动恢复服务正在停止...")


def signal_handler(service: AutoRecoveryService):
    def handler(signum, frame):
        logger.info(f"收到信号 {signum}，准备关闭...")
        service.stop()
    return handler


def main():
    check_interval = int(os.getenv("CHECK_INTERVAL", "60"))
    max_retries = int(os.getenv("MAX_RETRIES", "3"))
    retry_interval = int(os.getenv("RETRY_INTERVAL", "10"))
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    logger.info("=" * 50)
    logger.info("自动恢复服务配置:")
    logger.info(f"  检查间隔: {check_interval} 秒")
    logger.info(f"  最大重试次数: {max_retries}")
    logger.info(f"  重试间隔: {retry_interval} 秒")
    logger.info(f"  Redis URL: {redis_url}")
    logger.info("=" * 50)
    
    service = AutoRecoveryService(
        check_interval=check_interval,
        max_retries=max_retries,
        retry_interval=retry_interval,
        redis_url=redis_url
    )
    
    signal.signal(signal.SIGINT, signal_handler(service))
    signal.signal(signal.SIGTERM, signal_handler(service))
    
    try:
        asyncio.run(service.run())
    except KeyboardInterrupt:
        logger.info("收到键盘中断，停止服务...")
    finally:
        service.stop()
        if service.docker_client:
            service.docker_client.close()
        logger.info("自动恢复服务已停止")


if __name__ == "__main__":
    main()
