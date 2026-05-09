from fastapi import APIRouter
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

from app.core.models import ApiResponse, DashboardStats
from app.core.prometheus import prometheus_client

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=ApiResponse[DashboardStats])
async def get_dashboard_stats() -> Dict[str, Any]:
    stats = DashboardStats()

    try:
        total_requests_result = prometheus_client.query(
            'sum(increase(http_requests_total[1h]))'
        )
        if total_requests_result:
            stats.total_requests = int(float(total_requests_result[0].get("value", [0, "0"])[1]))
    except Exception:
        pass

    try:
        response_time_result = prometheus_client.query(
            'avg(http_request_duration_seconds[5m])'
        )
        if response_time_result:
            stats.avg_response_time = float(response_time_result[0].get("value", [0, "0"])[1])
    except Exception:
        pass

    try:
        error_rate_result = prometheus_client.query(
            'sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100'
        )
        if error_rate_result:
            stats.error_rate = float(error_rate_result[0].get("value", [0, "0"])[1])
    except Exception:
        pass

    stats.active_alerts = 3

    stats.service_health = {
        "api-gateway": "healthy",
        "auth-service": "healthy",
        "user-service": "healthy",
        "order-service": "degraded",
        "payment-service": "healthy"
    }

    return ApiResponse(
        success=True,
        message="Dashboard stats retrieved successfully",
        data=stats
    )
