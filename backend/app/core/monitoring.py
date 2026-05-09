"""
Metrics middleware for automatic HTTP request tracking.
"""
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from fastapi import FastAPI
import time
import re
from typing import Callable, Set

from app.core.metrics import (
    REQUEST_COUNT,
    REQUEST_DURATION,
    ACTIVE_REQUESTS,
    HTTP_REQUEST_BUCKETS
)


class MetricsMiddleware(BaseHTTPMiddleware):
    """
    Middleware for collecting Prometheus metrics for all HTTP requests.

    Features:
    - Automatically tracks all HTTP requests
    - Normalizes endpoint paths (replaces IDs with {id})
    - Tracks request duration
    - Skips /metrics endpoint to avoid recursion
    """

    SKIP_PATHS: Set[str] = {"/metrics", "/health"}

    PATH_PARAM_PATTERN = re.compile(r'/[\w-]+/[\w-]+/[\w-]+|/\d+/|/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}')

    @staticmethod
    def normalize_path(path: str) -> str:
        """
        Normalize endpoint path by replacing dynamic segments with placeholders.

        Examples:
        - /api/v1/users/123 -> /api/v1/users/{id}
        - /api/v1/courses/abc-123/content -> /api/v1/courses/{id}/content

        Args:
            path: Original request path

        Returns:
            Normalized path with placeholders
        """
        normalized = path

        normalized = re.sub(
            r'/[\w-]+/[\w-]+/[\w-]+$',
            '/{resource}/{id}/{subresource}',
            normalized
        )

        normalized = re.sub(
            r'/[\w-]+/\d+(/|$)',
            r'/{id}\1',
            normalized
        )

        normalized = re.sub(
            r'/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(/|$)',
            r'/{uuid}\1',
            normalized
        )

        normalized = re.sub(
            r'/\d+',
            '/{id}',
            normalized
        )

        return normalized

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process the request and collect metrics.

        Args:
            request: Incoming request
            call_next: Next middleware/handler in chain

        Returns:
            Response from the handler
        """
        path = request.url.path

        if path in self.SKIP_PATHS:
            return await call_next(request)

        method = request.method
        normalized_path = self.normalize_path(path)

        ACTIVE_REQUESTS.labels(method=method, endpoint=normalized_path).inc()

        start_time = time.time()

        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            raise
        finally:
            duration = time.time() - start_time

            ACTIVE_REQUESTS.labels(method=method, endpoint=normalized_path).dec()

            REQUEST_COUNT.labels(
                method=method,
                endpoint=normalized_path,
                status_code=str(status_code)
            ).inc()

            REQUEST_DURATION.labels(
                method=method,
                endpoint=normalized_path
            ).observe(duration)

        return response


def setup_metrics_middleware(app: FastAPI) -> None:
    """
    Configure and add metrics middleware to FastAPI application.

    Args:
        app: FastAPI application instance
    """
    app.add_middleware(MetricsMiddleware)
