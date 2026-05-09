from typing import Optional
from dotenv import load_dotenv

load_dotenv()

class Settings:
    APP_NAME: str = "Ops Platform API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    PROMETHEUS_URL: str = "http://localhost:29090"
    LOKI_URL: str = "http://localhost:3100"

    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    API_V1_PREFIX: str = "/api/v1"

settings = Settings()
