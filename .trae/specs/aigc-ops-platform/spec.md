# Aigc For Study 运维平台构建规范

**版本:** v1.0  
**制定日期:** 2026-05-09  
**项目背景:** 基于 Aigc For Study AI学习平台构建标准化运维平台  
**目标交付日期:** 2026-05-20 (MVP运维平台)

---

## 1. 项目概述

### 1.1 运维平台目标

构建一套完整的运维管理平台，实现对 Aigc For Study 系统的全面监控、告警、日志分析和自动化运维能力，确保系统稳定可靠运行。

### 1.2 核心价值

- **实时监控**: 对 API、Web、数据库、Redis 等服务进行实时健康监控
- **智能告警**: 多渠道告警通知，及时发现和处理问题
- **日志分析**: 集中日志收集、存储和可视化分析
- **自动化运维**: 减少人工操作，提高运维效率
- **故障自愈**: 关键服务自动重启和恢复

### 1.3 现有系统分析

**当前系统架构:**
- **API 服务**: FastAPI 后端 (端口 38000/38001)
- **Web 服务**: React 前端 (端口 38010/38002)
- **数据库**: PostgreSQL 15 (端口 5433/5434)
- **缓存**: Redis 7 (端口 6380/6381)
- **部署方式**: Docker Compose
- **CI/CD**: GitHub Actions

**已有运维能力:**
- 基础健康检查端点 `/health`
- Docker 日志查看
- 备份脚本 `backup.sh`
- 部署脚本 `deploy.sh`
- 环境配置文档

**待完善运维能力:**
- 详细指标监控 (CPU、内存、响应时间等)
- 告警系统 (Prometheus Alertmanager)
- 日志集中管理 (ELK/Loki)
- 自动化故障恢复
- 运维管理界面

---

## 2. 运维平台架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                    运维平台整体架构                           │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│                      数据采集层                             │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Node Exporter│  │ cAdvisor      │  │ 应用指标     │    │
│  │ (系统指标)    │  │ (容器指标)    │  │ (自定义)     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                      数据存储层                             │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Prometheus   │  │ Loki         │  │ Elasticsearch│    │
│  │ (时序指标)    │  │ (日志存储)   │  │ (日志分析)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                      告警管理层                             │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Alertmanager │  │ 告警规则     │  │ 告警渠道     │    │
│  │ (告警聚合)    │  │ (阈值/趋势)  │  │ (邮件/钉钉)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────────┐
│                      可视化层                               │
├────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Grafana     │  │ Kibana       │  │ 自建 Dashboard│   │
│  │ (指标可视化) │  │ (日志分析)   │  │ (运维面板)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────────────────────────────────────────────────────┘
```

### 2.2 组件选型

| 组件类型 | 选型 | 版本 | 说明 |
|---------|------|------|------|
| 指标采集 | Node Exporter | 1.6+ | 主机系统指标 (CPU、内存、磁盘、网络) |
| 容器监控 | cAdvisor | 0.47+ | Docker 容器指标 |
| 时序存储 | Prometheus | 2.48+ | 指标存储和查询 |
| 日志收集 | Promtail | 2.9+ | 日志采集，传输到 Loki |
| 日志存储 | Loki | 2.9+ | 日志存储，专为 Prometheus 设计 |
| 告警管理 | Alertmanager | 0.26+ | 告警聚合、去重、路由 |
| 可视化 | Grafana | 10.2+ | 指标和日志可视化 |
| 告警渠道 | 自定义 Webhook | - | 集成钉钉/企业微信/邮件 |

### 2.3 端口规划

| 服务 | 端口 | 用途 |
|------|------|------|
| Prometheus | 29090 | 指标数据采集 |
| Grafana | 23000 | 监控可视化界面 |
| Loki | 23100 | 日志存储查询 |
| Alertmanager | 29093 | 告警管理界面 |
| Node Exporter | 29100 | 主机指标 |
| cAdvisor | 29180 | 容器指标 |

---

## 3. 详细功能设计

### 3.1 监控告警系统

#### 3.1.1 监控指标

**系统级指标 (Node Exporter):**

| 指标名称 | 说明 | 告警阈值 |
|---------|------|----------|
| node_cpu_usage | CPU 使用率 | > 80% 持续 5 分钟 |
| node_memory_usage | 内存使用率 | > 85% 持续 5 分钟 |
| node_disk_usage | 磁盘使用率 | > 90% |
| node_load_average | 系统负载 | > CPU 核心数 * 0.7 |
| node_network_receive_bytes | 网络入流量 | 异常波动 |
| node_network_transmit_bytes | 网络出流量 | 异常波动 |

**应用级指标 (自定义):**

| 指标名称 | 说明 | 告警阈值 |
|---------|------|----------|
| api_request_total | API 请求总数 | - |
| api_request_duration_seconds | API 响应时间 | p99 > 3s |
| api_error_rate | API 错误率 | > 1% |
| db_connections | 数据库连接数 | > 80% 最大连接 |
| db_query_duration | 数据库查询时间 | > 1s |
| redis_memory_usage | Redis 内存使用 | > 256MB |
| ai_api_latency | AI API 延迟 | > 30s |
| ai_api_errors | AI API 错误 | > 5% |

**容器级指标 (cAdvisor):**

| 指标名称 | 说明 | 告警阈值 |
|---------|------|----------|
| container_cpu_usage_seconds | 容器 CPU 使用 | > 80% 限制 |
| container_memory_usage_bytes | 容器内存使用 | > 90% 限制 |
| container_network_receive_bytes | 容器网络入量 | 异常 |
| container_fs_reads_bytes | 容器磁盘读 | 异常 |
| container_fs_writes_bytes | 容器磁盘写 | 异常 |

#### 3.1.2 告警规则

**告警级别定义:**

| 级别 | 名称 | 说明 | 响应时间 |
|------|------|------|----------|
| P0 | Critical | 服务不可用 | 5 分钟内 |
| P1 | High | 核心功能受损 | 30 分钟内 |
| P2 | Medium | 非核心异常 | 2 小时内 |
| P3 | Low | 轻微问题 | 24 小时内 |

**告警规则清单:**

```yaml
# P0 - 服务宕机
- alert: ServiceDown
  expr: up{job="api"} == 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "API 服务不可用"
    description: "API 服务已经宕机超过 1 分钟"

# P0 - API 错误率过高
- alert: HighAPIErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "API 错误率过高"
    description: "API 5xx 错误率超过 5%"

# P1 - 响应时间过长
- alert: HighAPILatency
  expr: histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])) > 3
  for: 5m
  labels:
    severity: high
  annotations:
    summary: "API 响应时间过长"
    description: "API P99 响应时间超过 3 秒"

# P1 - CPU 使用率过高
- alert: HighCPUUsage
  expr: 100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
  for: 5m
  labels:
    severity: high
  annotations:
    summary: "CPU 使用率过高"
    description: "实例 {{ $labels.instance }} CPU 使用率超过 80%"

# P2 - 内存使用率过高
- alert: HighMemoryUsage
  expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 85
  for: 5m
  labels:
    severity: medium
  annotations:
    summary: "内存使用率过高"
    description: "实例 {{ $labels.instance }} 内存使用率超过 85%"

# P2 - 磁盘空间不足
- alert: DiskSpaceLow
  expr: node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} < 0.1
  for: 5m
  labels:
    severity: medium
  annotations:
    summary: "磁盘空间不足"
    description: "实例 {{ $labels.instance }} 磁盘空间剩余不足 10%"
```

#### 3.1.3 告警通知

**通知渠道配置:**

| 渠道 | 用途 | 触发条件 |
|------|------|----------|
| 钉钉机器人 | 即时通知 | P0, P1 |
| 邮件 | 详细报告 | 所有级别 |
| Slack | 团队协作 | P0, P1 |

**告警消息模板:**

```json
{
  "msgtype": "markdown",
  "markdown": {
    "title": "【{{ status }}】{{ alertname }}",
    "text": "## 🚨 {{ alertname }}\n\n**级别:** {{ severity }}\n**环境:** {{ environment }}\n**时间:** {{ starts_at }}\n\n### 详细信息\n{{ description }}\n\n### 当前值\n```\n{{ query }}\n```\n\n### 操作建议\n{{ annotations.suggestion }}"
  }
}
```

### 3.2 日志收集和分析

#### 3.2.1 日志采集

**日志来源:**

| 日志来源 | 路径 | 类型 | 采集方式 |
|---------|------|------|----------|
| API 日志 | `/app/logs/*.log` | JSON | Promtail |
| Nginx 日志 | `/var/log/nginx/*.log` | JSON | Promtail |
| Docker 日志 | `stdout/stderr` | JSON | Promtail |
| 数据库慢查询 | PostgreSQL 配置 | text | Filebeat |

**日志格式标准:**

```json
{
  "timestamp": "2026-05-09T10:00:00.000Z",
  "level": "INFO",
  "service": "api",
  "environment": "staging",
  "logger": "app.api.auth",
  "trace_id": "abc123",
  "user_id": "user-uuid",
  "message": "User login successful",
  "request_id": "req-uuid",
  "extra": {
    "ip": "192.168.1.1",
    "user_agent": "Mozilla/5.0...",
    "duration_ms": 150
  }
}
```

**日志级别定义:**

| 级别 | 用途 | 告警 |
|------|------|------|
| DEBUG | 详细调试信息 | 不告警 |
| INFO | 正常操作日志 | 不告警 |
| WARNING | 警告信息 | P3 |
| ERROR | 错误信息 | P2+ |
| CRITICAL | 严重错误 | P0+ |

#### 3.2.2 日志分析场景

**常用查询:**

```logql
# 错误日志查询
{job="api"} |= "ERROR" | json | level="ERROR"

# 慢请求查询 (> 3s)
{job="api"} | json | duration_ms > 3000

# 用户操作追踪
{job="api"} | json | user_id="user-uuid"

# AI API 延迟分析
{job="api"} |= "ai_api" | json | latency_ms > 30000

# 特定时间段分析
{job="api"} | json | timestamp > "2026-05-09T10:00:00Z" and timestamp < "2026-05-09T11:00:00Z"
```

**日志统计仪表盘:**

| 图表 | 说明 | 查询 |
|------|------|------|
| 日志量趋势 | 每分钟日志数 | `rate({job="api"}[1m])` |
| 错误率趋势 | 错误日志占比 | `rate({job="api"} |= "ERROR"[5m]) / rate({job="api"}[5m])` |
| 响应时间分布 | P50/P90/P99 | `histogram_quantile(0.99, rate(...))` |
| 日志来源分布 | 各服务日志量 | `sum by(service) (rate({job="api"}[5m]))` |

### 3.3 健康检查和自动恢复

#### 3.3.1 健康检查端点

**应用健康检查:**

```python
# /health/detailed
{
  "status": "healthy",
  "checks": {
    "database": {
      "status": "healthy",
      "latency_ms": 5
    },
    "redis": {
      "status": "healthy",
      "latency_ms": 1
    },
    "ai_service": {
      "status": "healthy",
      "latency_ms": 1500
    }
  },
  "version": "1.0.0",
  "uptime_seconds": 86400
}
```

#### 3.3.2 自动恢复机制

**故障检测和恢复流程:**

```
检测到故障 → 记录事件 → 执行恢复 → 验证结果 → 通知 → 记录日志
```

**自动恢复策略:**

| 故障类型 | 自动恢复操作 | 验证方式 |
|---------|-------------|----------|
| API 服务无响应 | docker-compose 重启 | 健康检查端点 |
| 数据库连接失败 | 等待 + 重试 (3次) | 连接测试 |
| Redis 不可用 | docker-compose 重启 | Ping 测试 |
| 磁盘空间不足 | 清理日志文件 | 磁盘检查 |
| AI API 超时 | 记录 + 降级 | 请求重试 |

**恢复脚本:**

```bash
#!/bin/bash
# auto-recovery.sh

SERVICE=$1
MAX_RETRIES=3
RETRY_INTERVAL=10

check_health() {
  curl -sf http://localhost:${PORT}/health > /dev/null
}

restart_service() {
  echo "Restarting $SERVICE..."
  docker-compose restart $SERVICE
  
  for i in $(seq 1 $MAX_RETRIES); do
    sleep $RETRY_INTERVAL
    if check_health; then
      echo "$SERVICE restarted successfully"
      return 0
    fi
  done
  
  echo "Failed to restart $SERVICE after $MAX_RETRIES attempts"
  return 1
}
```

#### 3.3.3 故障自愈配置

```yaml
# docker-compose.monitoring.yml
services:
  auto-recovery:
    image: aigc-ops:latest
    command: python auto_recovery.py
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - CHECK_INTERVAL=60
      - LOG_LEVEL=INFO
    restart: unless-stopped
    networks:
      - aigc-network
```

### 3.4 运维管理界面

#### 3.4.1 功能模块

**仪表盘概览:**

- 系统健康状态总览
- 实时性能指标 (QPS、延迟、错误率)
- 告警统计和趋势
- 服务依赖拓扑图
- 最近事件时间线

**服务管理:**

- 服务列表和状态
- 一键重启/停止/启动
- 配置管理
- 资源使用查看

**日志查询:**

- 实时日志流
- 日志搜索和过滤
- 日志下载
- 日志统计

**告警中心:**

- 告警列表和详情
- 告警处理历史
- 告警规则管理
- 通知渠道配置

**系统设置:**

- 告警阈值配置
- 通知规则配置
- 用户权限管理
- 集成配置

---

## 4. 技术实现方案

### 4.1 项目结构

```
ops/
├── docker-compose.ops.yml          # 运维服务编排
├── prometheus/
│   ├── prometheus.yml             # Prometheus 配置
│   └── alert_rules/               # 告警规则
│       ├── api_alerts.yml
│       ├── system_alerts.yml
│       └── container_alerts.yml
├── grafana/
│   ├── dashboards/                # Grafana 仪表盘
│   │   ├── overview.json
│   │   ├── api_metrics.json
│   │   └── system_metrics.json
│   └── provisioning/
│       └── dashboards.yaml
├── loki/
│   └── loki-config.yml           # Loki 配置
├── alertmanager/
│   └── alertmanager.yml          # Alertmanager 配置
├── scripts/
│   ├── setup-monitoring.sh       # 监控安装脚本
│   ├── auto-recovery.py          # 自动恢复脚本
│   └── log-analyzer.py           # 日志分析工具
└── src/
    └── ops_api/                  # 运维 API
        ├── main.py
        ├── api/
        ├── services/
        └── models/
```

### 4.2 依赖服务配置

#### 4.2.1 Prometheus 配置

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

alerting:
  alertmanagers:
    - static_configs:
        - targets:
            - alertmanager:9093

rule_files:
  - "alert_rules/*.yml"

scrape_configs:
  # Prometheus 自身
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  # Node Exporter (系统指标)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

  # cAdvisor (容器指标)
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  # API 服务 (自定义指标)
  - job_name: 'api'
    static_configs:
      - targets: ['api:8000']
    metrics_path: '/metrics'

  # PostgreSQL (通过 postgres_exporter)
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # Redis (通过 redis_exporter)
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

#### 4.2.2 Alertmanager 配置

```yaml
# alertmanager/alertmanager.yml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'default'
  routes:
    - match:
        severity: critical
      receiver: 'critical-notifications'
      continue: true
    - match:
        severity: high
      receiver: 'high-notifications'

receivers:
  - name: 'default'
    webhook_configs:
      - url: 'http://ops-api:8000/webhook/alert'

  - name: 'critical-notifications'
    webhook_configs:
      - url: 'http://ops-api:8000/webhook/alert'
        send_resolved: true
    # 钉钉配置
    # 邮件配置

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'high'
    equal: ['alertname', 'instance']
```

### 4.3 监控指标导出

#### 4.3.1 FastAPI 指标导出

```python
# backend/app/core/metrics.py
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from fastapi import APIRouter, Response

REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total HTTP requests',
    ['method', 'endpoint', 'status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency',
    ['method', 'endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.5, 1, 3, 5, 10]
)

DB_CONNECTION_POOL = Gauge(
    'db_connection_pool_size',
    'Database connection pool size',
    ['state']
)

REDIS_OPERATIONS = Counter(
    'redis_operations_total',
    'Redis operations total',
    ['operation', 'status']
)

AI_API_LATENCY = Histogram(
    'ai_api_latency_seconds',
    'AI API latency',
    ['provider', 'model'],
    buckets=[1, 5, 10, 20, 30, 60]
)

router = APIRouter(prefix="/metrics", tags=["监控"])

@router.get("")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

#### 4.3.2 中间件集成

```python
# backend/app/main.py
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.metrics import REQUEST_COUNT, REQUEST_LATENCY
import time

app = FastAPI(...)

@app.middleware("http")
async def metrics_middleware(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.url.path,
        status=response.status_code
    ).inc()
    
    REQUEST_LATENCY.labels(
        method=request.method,
        endpoint=request.url.path
    ).observe(duration)
    
    return response
```

### 4.4 日志集成

#### 4.4.1 结构化日志

```python
# backend/app/core/logging.py
import logging
import json
from datetime import datetime
from pythonjsonlogger import jsonlogger

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super().add_fields(log_record, record, message_dict)
        log_record['timestamp'] = datetime.utcnow().isoformat()
        log_record['service'] = 'api'
        log_record['environment'] = os.getenv('APP_ENV', 'development')
        log_record['level'] = record.levelname

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    handler = logging.StreamHandler()
    formatter = CustomJsonFormatter(
        '%(timestamp)s %(level)s %(name)s %(message)s'
    )
    handler.setFormatter(formatter)
    
    logger.addHandler(handler)
    return logger
```

#### 4.4.2 Promtail 配置

```yaml
# loki/promtail-config.yml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  # API 日志
  - job_name: api
    static_configs:
      - targets:
          - localhost
        labels:
          job: api
          __path__: /app/logs/*.log
    pipeline_stages:
      - json:
          expressions:
            timestamp: timestamp
            level: level
            message: message
            service: service
      - labels:
          level:
          service:

  # Docker 容器日志
  - job_name: containers
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
        refresh_interval: 5s
    relabel_configs:
      - source_labels: ['__meta_docker_container_name']
        regex: '/(.*)'
        target_label: container
```

---

## 5. 部署和运维

### 5.1 快速部署

```bash
# 一键部署运维平台
cd ops
./scripts/setup-monitoring.sh --env staging

# 仅启动监控组件
docker-compose -f docker-compose.ops.yml up -d prometheus grafana loki alertmanager

# 验证服务
curl http://localhost:29090/-/healthy  # Prometheus
curl http://localhost:23000/api/health  # Grafana
curl http://localhost:23100/ready  # Loki
curl http://localhost:29093/-/healthy  # Alertmanager
```

### 5.2 访问地址

| 服务 | 地址 | 默认账号 |
|------|------|----------|
| Grafana | http://124.223.78.206:23000 | admin/admin |
| Prometheus | http://124.223.78.206:29090 | - |
| Alertmanager | http://124.223.78.206:29093 | - |
| Loki | http://124.223.78.206:23100 | - |

### 5.3 日常运维

```bash
# 查看监控服务状态
docker-compose -f docker-compose.ops.yml ps

# 查看所有日志
docker-compose -f docker-compose.ops.yml logs -f

# 重启监控服务
docker-compose -f docker-compose.ops.yml restart prometheus grafana

# 手动触发告警测试
curl -X POST http://localhost:29093/-/reload

# 查看告警状态
curl http://localhost:29090/api/v1/alerts

# 清理 Loki 旧数据
docker-compose -f docker-compose.ops.yml exec loki \
  docker exec loki loki-admin prune --age=720h
```

---

## 6. 验收标准

### 6.1 功能验收

- [ ] Prometheus 成功采集所有指标
- [ ] Grafana 仪表盘正常显示
- [ ] Alertmanager 告警规则生效
- [ ] 告警通知正常发送
- [ ] Loki 日志采集和查询正常
- [ ] 自动恢复机制有效
- [ ] 健康检查端点正常

### 6.2 性能验收

- [ ] 指标采集延迟 < 15 秒
- [ ] 告警响应时间 < 1 分钟
- [ ] 日志查询响应时间 < 3 秒
- [ ] Grafana 页面加载时间 < 2 秒

### 6.3 文档验收

- [ ] 运维手册完整
- [ ] 故障排查指南可用
- [ ] 监控指标说明清晰
- [ ] 告警规则文档完善

---

## 7. 实施计划

### 阶段一: 基础监控 (Day 1)

| 任务 | 负责人 | 交付物 |
|------|--------|--------|
| Prometheus 部署 | 后端 | prometheus.yml |
| Node Exporter 部署 | 后端 | 主机指标 |
| cAdvisor 部署 | 后端 | 容器指标 |
| Grafana 部署 | 后端 | 仪表盘 |

### 阶段二: 应用监控 (Day 2)

| 任务 | 负责人 | 交付物 |
|------|--------|--------|
| FastAPI 指标集成 | 后端 | /metrics 端点 |
| PostgreSQL Exporter | 后端 | 数据库指标 |
| Redis Exporter | 后端 | 缓存指标 |
| 自定义仪表盘 | 后端 | Grafana dashboard |

### 阶段三: 日志系统 (Day 3)

| 任务 | 负责人 | 交付物 |
|------|--------|--------|
| Loki 部署 | 后端 | 日志存储 |
| Promtail 部署 | 后端 | 日志采集 |
| 结构化日志改造 | 后端 | JSON 日志 |
| 日志查询仪表盘 | 后端 | Grafana 日志视图 |

### 阶段四: 告警系统 (Day 4)

| 任务 | 负责人 | 交付物 |
|------|--------|--------|
| Alertmanager 部署 | 后端 | 告警聚合 |
| 告警规则编写 | 后端 | alert_rules/*.yml |
| 通知渠道配置 | 后端 | 钉钉/邮件 |
| 告警测试验证 | 后端 | 测试报告 |

### 阶段五: 自动化运维 (Day 5)

| 任务 | 负责人 | 交付物 |
|------|--------|--------|
| 健康检查 API | 后端 | /health/detailed |
| 自动恢复脚本 | 后端 | auto-recovery.py |
| 运维手册编写 | 后端 | docs/ops_manual.md |
| 故障演练 | 全团队 | 演练报告 |

---

## 8. 风险和应对

### 8.1 技术风险

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 监控影响性能 | 中 | 使用异步采集，控制采集频率 |
| 日志存储膨胀 | 高 | 设置合理的保留策略 |
| 告警风暴 | 高 | 使用 Alertmanager 抑制规则 |

### 8.2 运维风险

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 监控服务故障 | 中 | 监控自身健康状态 |
| 数据丢失 | 高 | 定期备份监控数据 |
| 安全风险 | 中 | 限制访问，加强认证 |

---

## 9. 附录

### 9.1 关键配置文件路径

```
ops/
├── docker-compose.ops.yml
├── prometheus/prometheus.yml
├── prometheus/alert_rules/
├── grafana/dashboards/
├── grafana/provisioning/
├── loki/loki-config.yml
├── alertmanager/alertmanager.yml
└── scripts/
```

### 9.2 常用命令速查

```bash
# 监控服务管理
docker-compose -f docker-compose.ops.yml up -d
docker-compose -f docker-compose.ops.yml logs -f prometheus
docker-compose -f docker-compose.ops.yml restart

# 指标查询
curl http://localhost:29090/api/v1/query?query=up

# 告警测试
curl -X POST http://localhost:29093/api/v1/alerts

# 日志查询 (Loki)
curl -G http://localhost:23100/loki/api/v1/query \
  --data-urlencode 'query={job="api"}'

# Grafana API
curl -u admin:admin http://localhost:23000/api/health
```

### 9.3 监控指标文档

详见: [监控指标说明文档](./docs/metrics_reference.md)

---

**文档变更记录**

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|----------|------|
| v1.0 | 2026-05-09 | 初始版本 | AIGC Ops Team |
