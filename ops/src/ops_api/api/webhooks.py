import os
import json
import logging
from datetime import datetime
from typing import List, Optional, Dict, Any

import httpx
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DingTalkSettings(BaseSettings):
    webhook_url: str = Field(default="", alias="DINGTALK_WEBHOOK_URL")
    
    class Config:
        env_file = ".env"
        extra = "allow"


class AlertLabels(BaseModel):
    alertname: str
    severity: Optional[str] = "warning"
    instance: Optional[str] = None
    job: Optional[str] = None
    service: Optional[str] = None


class AlertAnnotation(BaseModel):
    summary: Optional[str] = None
    description: Optional[str] = None


class Alert(BaseModel):
    status: str
    labels: AlertLabels
    annotations: AlertAnnotation = Field(default_factory=AlertAnnotation)
    starts_at: datetime = Field(default_factory=datetime.now)
    ends_at: Optional[datetime] = None
    generator_url: Optional[str] = None


class AlertmanagerPayload(BaseModel):
    version: str
    groupKey: str
    status: str
    receiver: str
    group_labels: Dict[str, Any] = Field(default_factory=dict)
    common_labels: Dict[str, Any] = Field(default_factory=dict)
    common_annotations: Dict[str, Any] = Field(default_factory=dict)
    external_url: Optional[str] = None
    alerts: List[Alert] = Field(default_factory=list)


class WebhookResponse(BaseModel):
    status: str
    message: str
    alerts_processed: int = 0


class DingTalkMessage(BaseModel):
    msgtype: str = "markdown"
    markdown: Dict[str, str]


class WebhookHandler:
    def __init__(self):
        self.settings = DingTalkSettings()
        self.dingtalk_client = httpx.AsyncClient(timeout=10.0)
        logger.info("Webhook 处理器已初始化")

    async def send_dingtalk_notification(self, title: str, content: str) -> bool:
        if not self.settings.webhook_url:
            logger.warning("DINGTALK_WEBHOOK_URL 未配置，跳过钉钉通知")
            return False

        message = DingTalkMessage(
            markdown={
                "title": title,
                "text": content
            }
        )

        try:
            response = await self.dingtalk_client.post(
                self.settings.webhook_url,
                json=message.model_dump()
            )
            response.raise_for_status()
            logger.info(f"钉钉通知发送成功: {title}")
            return True
        except httpx.HTTPError as e:
            logger.error(f"发送钉钉通知失败: {e}")
            return False
        except Exception as e:
            logger.error(f"发送钉钉通知时发生错误: {e}")
            return False

    def format_alert_for_dingtalk(self, alert: Alert) -> str:
        status_emoji = "🔴" if alert.status == "firing" else "✅"
        severity_emoji = {
            "critical": "🔴",
            "warning": "🟡",
            "info": "ℹ️"
        }.get(str(alert.labels.severity).lower(), "⚪")

        content_parts = [
            f"## {status_emoji} {alert.labels.alertname}",
            "",
            f"**状态:** {alert.status.upper()}",
            f"**严重性:** {severity_emoji} {alert.labels.severity or 'unknown'}",
        ]

        if alert.labels.instance:
            content_parts.append(f"**实例:** {alert.labels.instance}")
        if alert.labels.job:
            content_parts.append(f"**任务:** {alert.labels.job}")
        if alert.labels.service:
            content_parts.append(f"**服务:** {alert.labels.service}")

        if alert.annotations.summary:
            content_parts.append("")
            content_parts.append(f"**摘要:** {alert.annotations.summary}")

        if alert.annotations.description:
            content_parts.append("")
            content_parts.append(f"**描述:** {alert.annotations.description}")

        content_parts.append("")
        content_parts.append(f"*触发时间: {alert.starts_at.strftime('%Y-%m-%d %H:%M:%S')}*")

        return "\n".join(content_parts)

    async def process_alert(self, alert: Alert):
        title = f"[{alert.status.upper()}] {alert.labels.alertname}"
        content = self.format_alert_for_dingtalk(alert)

        await self.send_dingtalk_notification(title, content)

    async def process_alertmanager_webhook(self, payload: AlertmanagerPayload) -> Dict[str, Any]:
        logger.info(f"处理 Alertmanager webhook: {payload.status}, 告警数量: {len(payload.alerts)}")

        results = {
            "total": len(payload.alerts),
            "processed": 0,
            "failed": 0
        }

        for alert in payload.alerts:
            try:
                await self.process_alert(alert)
                results["processed"] += 1
            except Exception as e:
                logger.error(f"处理告警失败: {e}")
                results["failed"] += 1

        return results

    async def close(self):
        await self.dingtalk_client.aclose()


router = APIRouter(prefix="/webhook", tags=["webhooks"])
webhook_handler = WebhookHandler()


@router.post("/alertmanager", response_model=WebhookResponse)
async def receive_alertmanager_webhook(request: Request):
    try:
        body = await request.json()
        logger.info(f"收到 Alertmanager webhook: {json.dumps(body, default=str)[:500]}")
    except Exception as e:
        logger.error(f"解析 webhook 请求失败: {e}")
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    try:
        payload = AlertmanagerPayload(**body)
    except Exception as e:
        logger.error(f"验证 webhook payload 失败: {e}")
        raise HTTPException(status_code=422, detail="Invalid payload structure")

    results = await webhook_handler.process_alertmanager_webhook(payload)

    return WebhookResponse(
        status="success",
        message="Alerts processed",
        alerts_processed=results["processed"]
    )


@router.get("/health")
async def webhook_health():
    return {
        "status": "healthy",
        "handler": "webhook",
        "dingtalk_configured": bool(webhook_handler.settings.webhook_url)
    }


@router.post("/test")
async def test_webhook():
    test_alert = Alert(
        status="firing",
        labels=AlertLabels(
            alertname="TestAlert",
            severity="warning",
            instance="test.example.com",
            job="test-job",
            service="test-service"
        ),
        annotations=AlertAnnotation(
            summary="这是一条测试告警",
            description="这是一条来自自动化脚本的测试告警，用于验证 webhook 功能是否正常。"
        )
    )

    title = f"[TEST] {test_alert.labels.alertname}"
    content = webhook_handler.format_alert_for_dingtalk(test_alert)

    dingtalk_sent = await webhook_handler.send_dingtalk_notification(title, content)

    logger.info(f"测试 webhook 发送结果: dingtalk={dingtalk_sent}")

    return {
        "status": "success",
        "message": "Test alert sent",
        "dingtalk_sent": dingtalk_sent,
        "alert_preview": content[:200] + "..." if len(content) > 200 else content
    }
