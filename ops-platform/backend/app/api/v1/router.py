from fastapi import APIRouter

from app.api.v1 import dashboard, metrics, alerts, logs, services

api_router = APIRouter()

api_router.include_router(dashboard.router)
api_router.include_router(metrics.router)
api_router.include_router(alerts.router)
api_router.include_router(logs.router)
api_router.include_router(services.router)
