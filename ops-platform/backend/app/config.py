import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "Ops Platform API")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    PROMETHEUS_URL: str = os.getenv("PROMETHEUS_URL", "http://prometheus:9090")
    LOKI_URL: str = os.getenv("LOKI_URL", "http://loki:3100")
    ALERTMANAGER_URL: str = os.getenv("ALERTMANAGER_URL", "http://alertmanager:9093")

    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://frontend:80",
    ]

    API_V1_PREFIX: str = "/api/v1"

settings = Settings()
