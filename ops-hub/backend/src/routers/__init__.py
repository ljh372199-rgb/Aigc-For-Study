"""
路由模块

定义 API 路由
"""

from src.routers.metrics import router as metrics_router
from src.routers.logs import router as logs_router
from src.routers.alerts import router as alerts_router

__all__ = ["metrics_router", "logs_router", "alerts_router"]
