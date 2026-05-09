"""
Prometheus 服务模块

提供与 Prometheus API 交互的功能
"""

from typing import Any, Optional
import httpx
from src.config import settings


class PrometheusService:
    """
    Prometheus 服务类

    封装 Prometheus API 的常用操作
    """

    def __init__(self):
        self.base_url = settings.get_prometheus_api()
        self.timeout = 30.0

    async def query(
        self,
        query: str,
        time: Optional[str] = None,
        timeout: Optional[int] = None
    ) -> dict[str, Any]:
        """
        查询单个时间点的指标数据

        Args:
            query: PromQL 查询语句
            time: 可选的时间戳
            timeout: 可选的请求超时时间

        Returns:
            dict: Prometheus API 响应
        """
        params = {"query": query}
        if time:
            params["time"] = time
        if timeout:
            params["timeout"] = f"{timeout}s"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/query",
                params=params
            )
            response.raise_for_status()
            return response.json()

    async def query_range(
        self,
        query: str,
        start: str,
        end: str,
        step: str = "15s",
        timeout: Optional[int] = None
    ) -> dict[str, Any]:
        """
        查询时间范围内的指标数据

        Args:
            query: PromQL 查询语句
            start: 开始时间戳
            end: 结束时间戳
            step: 查询步长
            timeout: 可选的请求超时时间

        Returns:
            dict: Prometheus API 响应
        """
        params = {
            "query": query,
            "start": start,
            "end": end,
            "step": step
        }
        if timeout:
            params["timeout"] = f"{timeout}s"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/query_range",
                params=params
            )
            response.raise_for_status()
            return response.json()

    async def get_targets(self) -> dict[str, Any]:
        """
        获取 Prometheus 抓取目标列表

        Returns:
            dict: 包含所有抓取目标的信息
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/targets")
            response.raise_for_status()
            return response.json()

    async def get_rules(self, type_: str = "alert") -> dict[str, Any]:
        """
        获取告警规则列表

        Args:
            type_: 规则类型，默认为 'alert'

        Returns:
            dict: 包含所有告警规则的信息
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/rules",
                params={"type": type_}
            )
            response.raise_for_status()
            return response.json()

    async def get_alerts(self) -> dict[str, Any]:
        """
        获取当前触发的告警列表

        Returns:
            dict: 包含所有活跃告警的信息
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(f"{self.base_url}/alerts")
            response.raise_for_status()
            return response.json()

    async def get_series(self, match[]: list[str]) -> dict[str, Any]:
        """
        获取指标系列列表

        Args:
            match: 匹配规则列表

        Returns:
            dict: 包含匹配到的指标系列
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/series",
                params={"match[]": match}
            )
            response.raise_for_status()
            return response.json()

    @staticmethod
    def format_metrics(data: dict[str, Any]) -> list[dict[str, Any]]:
        """
        格式化 Prometheus 指标数据为统一格式

        Args:
            data: Prometheus API 返回的原始数据

        Returns:
            list: 格式化后的指标列表
        """
        formatted = []
        result = data.get("data", {}).get("result", [])

        for item in result:
            metric = item.get("metric", {})
            values = item.get("values", [])
            value = item.get("value")

            formatted_item = {
                "metric": metric,
                "labels": metric,
                "timestamp": None,
                "value": None
            }

            if value:
                formatted_item["timestamp"] = float(value[0])
                formatted_item["value"] = float(value[1])

            if values:
                formatted_item["time_series"] = [
                    {"timestamp": float(v[0]), "value": float(v[1])}
                    for v in values
                ]

            formatted.append(formatted_item)

        return formatted


prometheus_service = PrometheusService()
