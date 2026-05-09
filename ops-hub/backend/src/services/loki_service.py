"""
Loki 日志服务模块

提供与 Loki API 交互的功能
"""

from typing import Any, Optional
import httpx
from src.config import settings


class LokiService:
    """
    Loki 日志服务类

    封装 Loki API 的常用操作
    """

    def __init__(self):
        self.base_url = settings.get_loki_api()
        self.timeout = 30.0

    async def query(
        self,
        query: str,
        limit: int = 100,
        start: Optional[str] = None,
        end: Optional[str] = None,
        direction: str = "backward",
        quiet: bool = False
    ) -> dict[str, Any]:
        """
        查询日志条目

        Args:
            query: LogQL 查询语句
            limit: 返回的最大日志条目数
            start: 开始时间（纳秒时间戳或 RFC3339 格式）
            end: 结束时间（纳秒时间戳或 RFC3339 格式）
            direction: 查询方向，'forward' 或 'backward'
            quiet: 是否静默模式

        Returns:
            dict: Loki API 响应
        """
        params = {
            "query": query,
            "limit": limit,
            "direction": direction,
            "quiet": str(quiet).lower()
        }

        if start:
            params["start"] = start
        if end:
            params["end"] = end

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/query",
                params=params
            )
            response.raise_for_status()
            return response.json()

    async def labels(self, start: Optional[str] = None, end: Optional[str] = None) -> dict[str, Any]:
        """
        获取标签列表

        Args:
            start: 开始时间
            end: 结束时间

        Returns:
            dict: 包含所有可用标签的响应
        """
        params = {}
        if start:
            params["start"] = start
        if end:
            params["end"] = end

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/labels",
                params=params
            )
            response.raise_for_status()
            return response.json()

    async def series(
        self,
        start: str,
        end: Optional[str] = None,
        match: Optional[list[str]] = None
    ) -> dict[str, Any]:
        """
        获取日志流信息

        Args:
            start: 开始时间（纳秒时间戳）
            end: 结束时间（纳秒时间戳）
            match: 匹配规则列表

        Returns:
            dict: 包含日志流信息的响应
        """
        params = {"start": start}
        if end:
            params["end"] = end
        if match:
            params["match"] = match

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/series",
                params=params
            )
            response.raise_for_status()
            return response.json()

    async def query_range(
        self,
        query: str,
        start: str,
        end: str,
        limit: int = 100,
        step: str = "15s",
        direction: str = "backward"
    ) -> dict[str, Any]:
        """
        查询时间范围内的日志

        Args:
            query: LogQL 查询语句
            start: 开始时间（纳秒时间戳）
            end: 结束时间（纳秒时间戳）
            limit: 返回的最大条目数
            step: 查询步长
            direction: 查询方向

        Returns:
            dict: Loki API 响应
        """
        params = {
            "query": query,
            "start": start,
            "end": end,
            "limit": limit,
            "step": step,
            "direction": direction
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/query_range",
                params=params
            )
            response.raise_for_status()
            return response.json()

    async def label_values(self, label: str) -> dict[str, Any]:
        """
        获取指定标签的值

        Args:
            label: 标签名称

        Returns:
            dict: 包含标签值的响应
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/label/{label}/values")
            response.raise_for_status()
            return response.json()

    def format_logs(self, data: dict[str, Any]) -> list[dict[str, Any]]:
        """
        格式化 Loki 日志数据为统一格式

        Args:
            data: Loki API 返回的原始数据

        Returns:
            list: 格式化后的日志列表
        """
        formatted = []
        result = data.get("data", {}).get("result", [])

        for stream in result:
            stream_labels = stream.get("stream", {})
            values = stream.get("values", [])

            for timestamp, log_line in values:
                formatted.append({
                    "labels": stream_labels,
                    "timestamp": int(timestamp),
                    "time": timestamp,
                    "message": log_line,
                    "ns_timestamp": timestamp
                })

        return formatted


loki_service = LokiService()
