from typing import Optional, List, Any, Dict, Generic, TypeVar
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

T = TypeVar('T')


class AlertSeverity(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"


class AlertStatus(str, Enum):
    FIRING = "firing"
    RESOLVED = "resolved"
    PENDING = "pending"


class ServiceStatus(str, Enum):
    HEALTHY = "healthy"
    DEGRADED = "degraded"
    DOWN = "down"
    UNKNOWN = "unknown"


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Success"
    data: Optional[T] = None
    error: Optional[str] = None


class DashboardStats(BaseModel):
    total_requests: int = 0
    avg_response_time: float = 0.0
    error_rate: float = 0.0
    active_alerts: int = 0
    service_health: Dict[str, str] = Field(default_factory=dict)


class MetricPoint(BaseModel):
    timestamp: int
    value: float


class MetricData(BaseModel):
    metric_name: str
    labels: Dict[str, str] = Field(default_factory=dict)
    points: List[MetricPoint] = Field(default_factory=list)


class Alert(BaseModel):
    id: str
    name: str
    status: AlertStatus
    severity: AlertSeverity
    description: str
    service: str
    created_at: datetime
    updated_at: Optional[datetime] = None


class AlertListResponse(BaseModel):
    items: List[Alert]
    total: int
    page: int
    page_size: int
    total_pages: int


class LogEntry(BaseModel):
    timestamp: datetime
    stream: Dict[str, str] = Field(default_factory=dict)
    labels: Dict[str, str] = Field(default_factory=dict)
    message: str


class LogQueryResponse(BaseModel):
    results: List[LogEntry]
    total: int
    limit: int


class Service(BaseModel):
    name: str
    status: ServiceStatus
    uptime: Optional[float] = None
    version: Optional[str] = None
    endpoints: List[str] = Field(default_factory=list)
    metrics: Dict[str, float] = Field(default_factory=dict)
    last_updated: Optional[datetime] = None


class ServiceListResponse(BaseModel):
    services: List[Service]
    total: int
