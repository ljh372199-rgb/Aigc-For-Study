from typing import Optional, List, Dict, Any
import requests
from datetime import datetime

from app.config import settings


class LokiClient:
    def __init__(self):
        self.url = settings.LOKI_URL
        self.headers = {"Content-Type": "application/json"}

    def query_range(
        self,
        query: str,
        start: Optional[int] = None,
        end: Optional[int] = None,
        limit: int = 100,
        direction: str = "forward",
        step: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        try:
            params = {
                "query": query,
                "limit": limit,
                "direction": direction
            }

            if start is not None:
                params["start"] = start
            if end is not None:
                params["end"] = end
            if step is not None:
                params["step"] = step

            response = requests.get(
                f"{self.url}/loki/api/v1/query_range",
                headers=self.headers,
                params=params,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Loki query_range error: {e}")
            return None
        except Exception as e:
            print(f"Loki query_range unexpected error: {e}")
            return None

    def query(
        self,
        query: str,
        limit: int = 100,
        time: Optional[int] = None
    ) -> Optional[Dict[str, Any]]:
        try:
            params = {
                "query": query,
                "limit": limit
            }

            if time is not None:
                params["time"] = time

            response = requests.get(
                f"{self.url}/loki/api/v1/query",
                headers=self.headers,
                params=params,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Loki query error: {e}")
            return None
        except Exception as e:
            print(f"Loki query unexpected error: {e}")
            return None

    def labels(self, start: Optional[int] = None, end: Optional[int] = None) -> Optional[Dict[str, Any]]:
        try:
            params = {}
            if start is not None:
                params["start"] = start
            if end is not None:
                params["end"] = end

            response = requests.get(
                f"{self.url}/loki/api/v1/label",
                headers=self.headers,
                params=params,
                timeout=30
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            print(f"Loki labels error: {e}")
            return None


loki_client = LokiClient()
