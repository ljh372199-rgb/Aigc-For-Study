from fastapi import APIRouter, Query
from typing import Optional, Dict, Any
from datetime import datetime

from app.core.models import (
    ApiResponse,
    Alert,
    AlertListResponse,
    AlertStatus,
    AlertSeverity
)

router = APIRouter(prefix="/alerts", tags=["Alerts"])


MOCK_ALERTS = [
    Alert(
        id="alert-001",
        name="High Error Rate",
        status=AlertStatus.FIRING,
        severity=AlertSeverity.CRITICAL,
        description="Error rate exceeds 5% in the last 5 minutes",
        service="api-gateway",
        created_at=datetime.now() - timedelta(hours=2),
        updated_at=datetime.now() - timedelta(minutes=30)
    ),
    Alert(
        id="alert-002",
        name="High Latency",
        status=AlertStatus.FIRING,
        severity=AlertSeverity.WARNING,
        description="Response time exceeds 500ms",
        service="user-service",
        created_at=datetime.now() - timedelta(hours=1),
        updated_at=datetime.now() - timedelta(minutes=15)
    ),
    Alert(
        id="alert-003",
        name="Service Down",
        status=AlertStatus.RESOLVED,
        severity=AlertSeverity.CRITICAL,
        description="Order service was unavailable",
        service="order-service",
        created_at=datetime.now() - timedelta(days=1),
        updated_at=datetime.now() - timedelta(hours=12)
    ),
    Alert(
        id="alert-004",
        name="Memory Usage High",
        status=AlertStatus.PENDING,
        severity=AlertSeverity.WARNING,
        description="Memory usage above 80%",
        service="payment-service",
        created_at=datetime.now() - timedelta(minutes=30),
        updated_at=datetime.now() - timedelta(minutes=10)
    ),
    Alert(
        id="alert-005",
        name="Disk Space Low",
        status=AlertStatus.FIRING,
        severity=AlertSeverity.INFO,
        description="Disk usage above 70%",
        service="auth-service",
        created_at=datetime.now() - timedelta(hours=6),
        updated_at=datetime.now() - timedelta(hours=1)
    )
]

from datetime import timedelta


@router.get("", response_model=ApiResponse[AlertListResponse])
async def get_alerts(
    status: Optional[AlertStatus] = Query(None, description="Filter by alert status"),
    severity: Optional[AlertSeverity] = Query(None, description="Filter by severity"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page")
) -> Dict[str, Any]:
    filtered_alerts = MOCK_ALERTS.copy()

    if status:
        filtered_alerts = [a for a in filtered_alerts if a.status == status]
    if severity:
        filtered_alerts = [a for a in filtered_alerts if a.severity == severity]

    total = len(filtered_alerts)
    total_pages = (total + page_size - 1) // page_size

    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_alerts = filtered_alerts[start_idx:end_idx]

    return ApiResponse(
        success=True,
        message="Alerts retrieved successfully",
        data=AlertListResponse(
            items=paginated_alerts,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    )


@router.get("/{alert_id}", response_model=ApiResponse[Alert])
async def get_alert(alert_id: str) -> Dict[str, Any]:
    alert = next((a for a in MOCK_ALERTS if a.id == alert_id), None)

    if not alert:
        return ApiResponse(
            success=False,
            message=f"Alert {alert_id} not found",
            data=None,
            error="Alert not found"
        )

    return ApiResponse(
        success=True,
        message="Alert retrieved successfully",
        data=alert
    )
