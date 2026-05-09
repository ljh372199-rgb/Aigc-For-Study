from typing import Optional, List, Dict, Any
from prometheus_api_client import PrometheusConnect
from datetime import datetime, timedelta

from app.config import settings


class PrometheusClient:
    def __init__(self):
        self.prometheus = PrometheusConnect(
            url=settings.PROMETHEUS_URL,
            disable_ssl=True
        )

    def query(self, query: str) -> Optional[Dict[str, Any]]:
        try:
            result = self.prometheus.custom_query(query=query)
            return result
        except Exception as e:
            print(f"Prometheus query error: {e}")
            return None

    def query_range(
        self,
        query: str,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None,
        step: str = "15s"
    ) -> Optional[List[Dict[str, Any]]]:
        try:
            if start_time is None:
                start_time = datetime.now() - timedelta(hours=1)
            if end_time is None:
                end_time = datetime.now()

            result = self.prometheus.custom_query_range(
                query=query,
                start_time=start_time,
                end_time=end_time,
                step=step
            )
            return result
        except Exception as e:
            print(f"Prometheus query_range error: {e}")
            return None

    def get_metric_names(self) -> List[str]:
        try:
            return self.prometheus.all_metrics()
        except Exception as e:
            print(f"Prometheus get_metric_names error: {e}")
            return []

    def get_label_names(self) -> List[str]:
        try:
            return self.prometheus.get_label_values(label_name="__name__")
        except Exception as e:
            print(f"Prometheus get_label_names error: {e}")
            return []


prometheus_client = PrometheusClient()
