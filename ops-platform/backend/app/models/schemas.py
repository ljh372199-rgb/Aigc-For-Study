from datetime import datetime
from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    code: int = 200
    message: str = "success"
    data: Optional[T] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_schema_extra = {
            "example": {
                "code": 200,
                "message": "success",
                "data": {},
                "timestamp": "2024-01-01T00:00:00"
            }
        }


class MetricPoint(BaseModel):
    timestamp: float
    value: float


class MetricData(BaseModel):
    metric_name: str
    labels: dict[str, str] = {}
    points: list[MetricPoint] = []
    unit: Optional[str] = None


class MetricQueryParams(BaseModel):
    metric: str
    start: Optional[float] = None
    end: Optional[float] = None
    step: str = "15s"
    filters: Optional[dict[str, str]] = None


class AlertLabels(BaseModel):
    alertname: str
    severity: str = "warning"
    instance: Optional[str] = None
    job: Optional[str] = None
    pod: Optional[str] = None


class AlertAnnotations(BaseModel):
    summary: Optional[str] = None
    description: Optional[str] = None


class AlertData(BaseModel):
    id: str
    name: str
    labels: AlertLabels
    annotations: AlertAnnotations
    state: str
    active_at: Optional[str] = None
    value: Optional[float] = None


class AlertQueryParams(BaseModel):
    status: Optional[str] = None
    severity: Optional[str] = None
    page: int = 1
    page_size: int = 20


class LogEntry(BaseModel):
    timestamp: str
    labels: dict[str, str] = {}
    message: str


class LogData(BaseModel):
    log_stream: str
    entries: list[LogEntry] = []
    total: int = 0


class LogQueryParams(BaseModel):
    query: str
    start: Optional[float] = None
    end: Optional[float] = None
    limit: int = 100


class ServiceStatus(BaseModel):
    status: str
    uptime: float
    version: Optional[str] = None


class ServiceData(BaseModel):
    name: str
    display_name: str
    status: ServiceStatus
    health_score: float = 100.0
    endpoints: dict[str, str] = {}
    tags: list[str] = []


class DashboardSummary(BaseModel):
    system_status: str
    total_services: int
    healthy_services: int
    active_alerts: int
    critical_alerts: int
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    recent_logs_count: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    total_pages: int
