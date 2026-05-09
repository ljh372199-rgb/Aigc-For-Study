"""
Prometheus metrics definitions for monitoring application performance.
"""
from prometheus_client import Counter, Histogram, Gauge, REGISTRY
from prometheus_client.core import CollectorRegistry
from typing import Optional, Dict, Any
import time
from functools import wraps
import contextlib

HTTP_REQUEST_BUCKETS = (0.01, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0)
DB_QUERY_BUCKETS = (0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0)
REDIS_OP_BUCKETS = (0.0001, 0.0005, 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5)
AI_API_BUCKETS = (1, 2, 5, 10, 20, 30, 60, 120, 300)

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "status_code"]
)

REQUEST_DURATION = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["method", "endpoint"],
    buckets=HTTP_REQUEST_BUCKETS
)

ACTIVE_REQUESTS = Gauge(
    "http_active_requests",
    "Number of active HTTP requests",
    ["method", "endpoint"]
)

DB_POOL_SIZE = Gauge(
    "db_connection_pool_size",
    "Database connection pool size",
    ["pool_name"]
)

DB_POOL_CHECKED_OUT = Gauge(
    "db_connection_pool_checked_out",
    "Number of checked out connections from the pool",
    ["pool_name"]
)

DB_QUERY_DURATION = Histogram(
    "db_query_duration_seconds",
    "Database query duration in seconds",
    ["query_type", "table"],
    buckets=DB_QUERY_BUCKETS
)

REDIS_OPERATIONS = Counter(
    "redis_operations_total",
    "Total number of Redis operations",
    ["operation", "status"]
)

REDIS_OPERATION_DURATION = Histogram(
    "redis_operation_duration_seconds",
    "Redis operation duration in seconds",
    ["operation"],
    buckets=REDIS_OP_BUCKETS
)

AI_API_REQUESTS = Counter(
    "ai_api_requests_total",
    "Total number of AI API requests",
    ["provider", "model", "status"]
)

AI_API_LATENCY = Histogram(
    "ai_api_latency_seconds",
    "AI API request latency in seconds",
    ["provider", "model"],
    buckets=AI_API_BUCKETS
)

AI_API_ERRORS = Counter(
    "ai_api_errors_total",
    "Total number of AI API errors",
    ["provider", "model", "error_type"]
)


def track_request(method: str, endpoint: str, status_code: int, duration: float) -> None:
    """
    Track an HTTP request.

    Args:
        method: HTTP method (GET, POST, etc.)
        endpoint: Normalized endpoint path
        status_code: HTTP status code
        duration: Request duration in seconds
    """
    REQUEST_COUNT.labels(method=method, endpoint=endpoint, status_code=str(status_code)).inc()
    REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)


def track_db_query(query_type: str, table: str, duration: float) -> None:
    """
    Track a database query.

    Args:
        query_type: Type of query (select, insert, update, delete)
        table: Table name
        duration: Query duration in seconds
    """
    DB_QUERY_DURATION.labels(query_type=query_type, table=table).observe(duration)


def track_redis(operation: str, status: str, duration: float) -> None:
    """
    Track a Redis operation.

    Args:
        operation: Redis operation type (get, set, delete, etc.)
        status: Operation status (success, error)
        duration: Operation duration in seconds
    """
    REDIS_OPERATIONS.labels(operation=operation, status=status).inc()
    REDIS_OPERATION_DURATION.labels(operation=operation).observe(duration)


def track_ai_request(provider: str, model: str, status: str, duration: float) -> None:
    """
    Track an AI API request.

    Args:
        provider: AI provider (openai, anthropic, deepseek)
        model: Model name
        status: Request status (success, error)
        duration: Request duration in seconds
    """
    AI_API_REQUESTS.labels(provider=provider, model=model, status=status).inc()
    AI_API_LATENCY.labels(provider=provider, model=model).observe(duration)


def track_ai_error(provider: str, model: str, error_type: str) -> None:
    """
    Track an AI API error.

    Args:
        provider: AI provider
        model: Model name
        error_type: Type of error
    """
    AI_API_ERRORS.labels(provider=provider, model=model, error_type=error_type).inc()


@contextlib.contextmanager
def track_request_context(method: str, endpoint: str):
    """
    Context manager for tracking request metrics.

    Args:
        method: HTTP method
        endpoint: Normalized endpoint path

    Yields:
        Dictionary that can be used to set status_code
    """
    ACTIVE_REQUESTS.labels(method=method, endpoint=endpoint).inc()
    start_time = time.time()
    result = {"status_code": 200}

    try:
        yield result
    except Exception:
        result["status_code"] = 500
        raise
    finally:
        duration = time.time() - start_time
        ACTIVE_REQUESTS.labels(method=method, endpoint=endpoint).dec()
        track_request(method, endpoint, result["status_code"], duration)


def track_instrumented_call(metric_name: str, labels: Dict[str, str]):
    """
    Decorator for tracking instrumented function calls.

    Args:
        metric_name: Name of the metric to use
        labels: Labels for the metric

    Returns:
        Decorator function
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start_time
        return wrapper
    return decorator


class MetricsContext:
    """Context manager for tracking various operations."""

    def __init__(
        self,
        metric_type: str,
        labels: Dict[str, str],
        buckets: tuple = HTTP_REQUEST_BUCKETS
    ):
        self.metric_type = metric_type
        self.labels = labels
        self.start_time = None
        self.duration = None

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.duration = time.time() - self.start_time
        return False

    def observe(self, value: float) -> None:
        """Observe a duration value."""
        if self.metric_type == "http":
            REQUEST_DURATION.labels(**self.labels).observe(value)
        elif self.metric_type == "db":
            DB_QUERY_DURATION.labels(**self.labels).observe(value)
        elif self.metric_type == "redis":
            REDIS_OPERATION_DURATION.labels(**self.labels).observe(value)
        elif self.metric_type == "ai":
            AI_API_LATENCY.labels(**self.labels).observe(value)
