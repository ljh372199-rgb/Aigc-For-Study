"""
Alertmanager 告警服务模块

提供与 Alertmanager API 交互的功能
"""

from typing import Any, Optional
import httpx
from src.config import settings


class AlertmanagerService:
    """
    Alertmanager 告警服务类

    封装 Alertmanager API 的常用操作
    """

    def __init__(self):
        self.base_url = settings.get_alertmanager_api()
        self.timeout = 30.0

    async def get_alerts(
        self,
        active: bool = True,
        silenced: bool = True,
        inhibited: bool = True,
        unprocessed: bool = True,
        filter_: Optional[list[str]] = None
    ) -> list[dict[str, Any]]:
        """
        获取告警列表

        Args:
            active: 是否包含活跃告警
            silenced: 是否包含已静默的告警
            inhibited: 是否包含被抑制的告警
            unprocessed: 是否包含未处理的告警
            filter_: 告警过滤器

        Returns:
            list: 告警列表
        """
        params = {
            "active": str(active).lower(),
            "silenced": str(silenced).lower(),
            "inhibited": str(inhibited).lower(),
            "unprocessed": str(unprocessed).lower()
        }

        if filter_:
            params["filter"] = filter_

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/alerts",
                params=params
            )
            response.raise_for_status()
            return response.json()

    async def get_silences(self) -> list[dict[str, Any]]:
        """
        获取静默列表

        Returns:
            list: 静默规则列表
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/silences")
            response.raise_for_status()
            return response.json()

    async def get_silence(self, silence_id: str) -> dict[str, Any]:
        """
        获取指定静默详情

        Args:
            silence_id: 静默 ID

        Returns:
            dict: 静默详情
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/silence/{silence_id}")
            response.raise_for_status()
            return response.json()

    async def create_silence(
        self,
        matchers: list[dict[str, Any]],
        starts_at: str,
        ends_at: str,
        created_by: str,
        comment: str
    ) -> dict[str, Any]:
        """
        创建静默规则

        Args:
            matchers: 匹配器列表
            starts_at: 开始时间（RFC3339 格式）
            ends_at: 结束时间（RFC3339 格式）
            created_by: 创建者名称
            comment: 备注信息

        Returns:
            dict: 创建结果，包含 silence_id
        """
        payload = {
            "matchers": matchers,
            "startsAt": starts_at,
            "endsAt": ends_at,
            "createdBy": created_by,
            "comment": comment
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/silences",
                json=payload
            )
            response.raise_for_status()
            return response.json()

    async def delete_silence(self, silence_id: str) -> dict[str, Any]:
        """
        删除静默规则

        Args:
            silence_id: 静默 ID

        Returns:
            dict: 删除结果
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.delete(f"{self.base_url}/silence/{silence_id}")
            response.raise_for_status()
            if response.status_code == 204:
                return {"status": "success", "message": "Silence deleted"}
            return response.json()

    async def get_status(self) -> dict[str, Any]:
        """
        获取 Alertmanager 状态信息

        Returns:
            dict: 状态信息
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{settings.alertmanager_url}/api/v1/status")
            response.raise_for_status()
            return response.json()

    async def get_receivers(self) -> list[dict[str, Any]]:
        """
        获取接收者列表

        Returns:
            list: 接收者配置列表
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/receivers")
            response.raise_for_status()
            return response.json()


alertmanager_service = AlertmanagerService()
