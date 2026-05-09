from fastapi import APIRouter, Query
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta

from app.core.models import ApiResponse, MetricData, MetricPoint
from app.core.prometheus import prometheus_client

router = APIRouter(prefix="/metrics", tags=["Metrics"])


@router.get("/query", response_model=ApiResponse[List[MetricData]])
async def query_metrics(
    metric: str = Query(..., description="Prometheus metric name"),
    start: Optional[int] = Query(None, description="Start timestamp (Unix epoch)"),
    end: Optional[int] = Query(None, description="End timestamp (Unix epoch)"),
    step: str = Query("15s", description="Query resolution step"),
    filters: Optional[str] = Query(None, description="Additional label filters")
) -> Dict[str, Any]:
    start_time = datetime.fromtimestamp(start) if start else None
    end_time = datetime.fromtimestamp(end) if end else None

    query_string = metric
    if filters:
        query_string = f'{metric}{{{filters}}}'

    result = prometheus_client.query_range(
        query=query_string,
        start_time=start_time,
        end_time=end_time,
        step=step
    )

    metrics_data = []
    if result:
        for metric_result in result:
            metric_data = MetricData(
                metric_name=metric_result.get("metric", {}).get("__name__", metric),
                labels={k: v for k, v in metric_result.get("metric", {}).items() if k != "__name__"},
                points=[]
            )

            values = metric_result.get("values", [])
            for timestamp, value in values:
                metric_data.points.append(MetricPoint(
                    timestamp=int(timestamp),
                    value=float(value)
                ))

            metrics_data.append(metric_data)

    return ApiResponse(
        success=True,
        message="Metrics query successful",
        data=metrics_data
    )


@router.get("/instant", response_model=ApiResponse[List[Dict[str, Any]]])
async def instant_query(
    metric: str = Query(..., description="Prometheus metric name"),
    filters: Optional[str] = Query(None, description="Additional label filters")
) -> Dict[str, Any]:
    query_string = metric
    if filters:
        query_string = f'{metric}{{{filters}}}'

    result = prometheus_client.query(query_string)

    return ApiResponse(
        success=True,
        message="Instant query successful",
        data=result if result else []
    )
