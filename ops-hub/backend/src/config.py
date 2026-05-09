"""
配置模块

定义应用程序的配置参数，从环境变量中读取
"""

import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """
    应用程序配置类

    从环境变量中读取配置，提供默认值
    """

    def __init__(self):
        self.prometheus_url: str = os.getenv("PROMETHEUS_URL", "http://localhost:29090")
        self.loki_url: str = os.getenv("LOKI_URL", "http://localhost:23100")
        self.alertmanager_url: str = os.getenv("ALERTMANAGER_URL", "http://localhost:29093")
        self.api_prefix: str = os.getenv("API_PREFIX", "/api/v1")
        self.cors_origins: list[str] = os.getenv("CORS_ORIGINS", "*").split(",")
        self.debug: bool = os.getenv("DEBUG", "false").lower() == "true"
        self.log_level: str = os.getenv("LOG_LEVEL", "info")

    def get_prometheus_api(self) -> str:
        """
        获取 Prometheus API 基础路径

        Returns:
            str: Prometheus API 端点
        """
        return f"{self.prometheus_url}/api/v1"

    def get_loki_api(self) -> str:
        """
        获取 Loki API 基础路径

        Returns:
            str: Loki API 端点
        """
        return f"{self.loki_url}/loki/api/v1"

    def get_alertmanager_api(self) -> str:
        """
        获取 Alertmanager API 基础路径

        Returns:
            str: Alertmanager API 端点
        """
        return f"{self.alertmanager_url}/api/v2"


settings = Settings()
