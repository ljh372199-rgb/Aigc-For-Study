from fastapi import APIRouter, Query
from typing import Optional, Dict, Any, List
from datetime import datetime

from app.core.models import ApiResponse, LogEntry, LogQueryResponse
from app.core.loki import loki_client

router = APIRouter(prefix="/logs", tags=["Logs"])


@router.get("", response_model=ApiResponse[LogQueryResponse])
async def query_logs(
    query: str = Query("*", description="LogQL query"),
    start: Optional[int] = Query(None, description="Start timestamp (Unix epoch nanoseconds)"),
    end: Optional[int] = Query(None, description="End timestamp (Unix epoch nanoseconds)"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of log entries"),
    direction: str = Query("forward", description="Query direction: forward or backward")
) -> Dict[str, Any]:
    if start is None:
        start = int((datetime.now().timestamp() - 3600) * 1e9)
    if end is None:
        end = int(datetime.now().timestamp() * 1e9)

    result = loki_client.query_range(
        query=query,
        start=start,
        end=end,
        limit=limit,
        direction=direction
    )

    log_entries = []
    if result and result.get("status") == "success":
        for stream in result.get("data", {}).get("result", []):
            stream_labels = stream.get("stream", {})
            for timestamp, message in stream.get("values", []):
                log_entries.append(LogEntry(
                    timestamp=datetime.fromtimestamp(int(timestamp) / 1e9),
                    stream=stream_labels,
                    labels=stream_labels,
                    message=message
                ))

    log_entries.sort(key=lambda x: x.timestamp, reverse=(direction == "backward"))

    return ApiResponse(
        success=True,
        message="Logs retrieved successfully",
        data=LogQueryResponse(
            results=log_entries,
            total=len(log_entries),
            limit=limit
        )
    )


@router.get("/services/{service_name}", response_model=ApiResponse[LogQueryResponse])
async def get_service_logs(
    service_name: str,
    start: Optional[int] = Query(None, description="Start timestamp"),
    end: Optional[int] = Query(None, description="End timestamp"),
    limit: int = Query(50, ge=1, le=500, description="Maximum number of log entries"),
    direction: str = Query("backward", description="Query direction")
) -> Dict[str, Any]:
    if start is None:
        start = int((datetime.now().timestamp() - 3600) * 1e9)
    if end is None:
        end = int(datetime.now().timestamp() * 1e9)

    query = f'{{service="{service_name}"}}'

    result = loki_client.query_range(
        query=query,
        start=start,
        end=end,
        limit=limit,
        direction=direction
    )

    log_entries = []
    if result and result.get("status") == "success":
        for stream in result.get("data", {}).get("result", []):
            stream_labels = stream.get("stream", {})
            for timestamp, message in stream.get("values", []):
                log_entries.append(LogEntry(
                    timestamp=datetime.fromtimestamp(int(timestamp) / 1e9),
                    stream=stream_labels,
                    labels=stream_labels,
                    message=message
                ))

    log_entries.sort(key=lambda x: x.timestamp, reverse=(direction == "backward"))

    return ApiResponse(
        success=True,
        message=f"Logs for service {service_name} retrieved successfully",
        data=LogQueryResponse(
            results=log_entries,
            total=len(log_entries),
            limit=limit
        )
    )
