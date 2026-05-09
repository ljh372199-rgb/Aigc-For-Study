from fastapi import APIRouter
from typing import Dict, Any

from app.core.models import ApiResponse, Service, ServiceListResponse, ServiceStatus
from datetime import datetime

router = APIRouter(prefix="/services", tags=["Services"])


MOCK_SERVICES = [
    Service(
        name="api-gateway",
        status=ServiceStatus.HEALTHY,
        uptime=99.95,
        version="2.1.0",
        endpoints=["https://api.example.com", "https://api.example.com/v2"],
        metrics={
            "requests_per_second": 1523.45,
            "error_rate": 0.02,
            "avg_response_time": 45.2
        },
        last_updated=datetime.now()
    ),
    Service(
        name="auth-service",
        status=ServiceStatus.HEALTHY,
        uptime=99.99,
        version="1.5.2",
        endpoints=["https://auth.example.com"],
        metrics={
            "requests_per_second": 856.78,
            "error_rate": 0.01,
            "avg_response_time": 23.5
        },
        last_updated=datetime.now()
    ),
    Service(
        name="user-service",
        status=ServiceStatus.HEALTHY,
        uptime=99.87,
        version="3.0.1",
        endpoints=["https://users.example.com"],
        metrics={
            "requests_per_second": 423.12,
            "error_rate": 0.03,
            "avg_response_time": 67.8
        },
        last_updated=datetime.now()
    ),
    Service(
        name="order-service",
        status=ServiceStatus.DEGRADED,
        uptime=98.45,
        version="2.8.0",
        endpoints=["https://orders.example.com"],
        metrics={
            "requests_per_second": 234.56,
            "error_rate": 2.5,
            "avg_response_time": 250.3
        },
        last_updated=datetime.now()
    ),
    Service(
        name="payment-service",
        status=ServiceStatus.HEALTHY,
        uptime=99.92,
        version="1.2.5",
        endpoints=["https://payments.example.com"],
        metrics={
            "requests_per_second": 178.90,
            "error_rate": 0.05,
            "avg_response_time": 112.4
        },
        last_updated=datetime.now()
    )
]


@router.get("", response_model=ApiResponse[ServiceListResponse])
async def get_services() -> Dict[str, Any]:
    return ApiResponse(
        success=True,
        message="Services retrieved successfully",
        data=ServiceListResponse(
            services=MOCK_SERVICES,
            total=len(MOCK_SERVICES)
        )
    )


@router.get("/{name}", response_model=ApiResponse[Service])
async def get_service(name: str) -> Dict[str, Any]:
    service = next((s for s in MOCK_SERVICES if s.name == name), None)

    if not service:
        return ApiResponse(
            success=False,
            message=f"Service {name} not found",
            data=None,
            error="Service not found"
        )

    return ApiResponse(
        success=True,
        message=f"Service {name} retrieved successfully",
        data=service
    )
