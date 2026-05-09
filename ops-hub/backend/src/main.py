"""
Ops Hub Backend - 运维监控平台后端主应用

提供统一的 API 接口访问 Prometheus、Loki 和 Alertmanager
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
from src.routers import metrics_router, logs_router, alerts_router

app = FastAPI(
    title="Ops Hub Backend",
    description="运维监控平台后端服务 - 提供 Prometheus、Loki、Alertmanager 统一 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

origins = ["*"]
if settings.cors_origins and settings.cors_origins != ["*"]:
    origins = settings.cors_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(metrics_router, prefix="/api/v1")
app.include_router(logs_router, prefix="/api/v1")
app.include_router(alerts_router, prefix="/api/v1")


@app.get("/", tags=["root"])
async def root():
    """
    根路径

    返回欢迎信息
    """
    return {
        "message": "Welcome to Ops Hub Backend",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "version_info": "/version"
    }


@app.get("/health", tags=["health"])
async def health_check():
    """
    健康检查端点

    返回服务健康状态
    """
    return {
        "status": "healthy",
        "service": "ops-hub-backend",
        "version": "1.0.0"
    }


@app.get("/version", tags=["info"])
async def version_info():
    """
    获取后端版本信息

    返回版本详细信息
    """
    return {
        "version": "1.0.0",
        "api_version": "v1",
        "services": {
            "prometheus": {
                "url": settings.prometheus_url,
                "status": "configured"
            },
            "loki": {
                "url": settings.loki_url,
                "status": "configured"
            },
            "alertmanager": {
                "url": settings.alertmanager_url,
                "status": "configured"
            }
        },
        "debug": settings.debug,
        "log_level": settings.log_level
    }


@app.get("/api/v1/info", tags=["info"])
async def api_info():
    """
    API 信息端点

    返回 API 路由信息
    """
    return {
        "api_version": "v1",
        "endpoints": {
            "metrics": "/api/v1/metrics",
            "logs": "/api/v1/logs",
            "alerts": "/api/v1/alerts"
        },
        "websocket": {
            "log_stream": "/api/v1/logs/stream"
        }
    }
