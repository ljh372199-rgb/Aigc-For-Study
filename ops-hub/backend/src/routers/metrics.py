"""
Prometheus 指标路由

提供指标查询相关的 API 端点
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from src.services.prometheus_service import prometheus_service

router = APIRouter(prefix="/metrics", tags=["metrics"])


class QueryRequest(BaseModel):
    """Prometheus 查询请求模型"""
    query: str
    time: Optional[str] = None
    timeout: Optional[int] = None


class QueryRangeRequest(BaseModel):
    """Prometheus 范围查询请求模型"""
    query: str
    start: str
    end: str
    step: str = "15s"
    timeout: Optional[int] = None


@router.get("/query")
async def query_metrics(
    query: str = Query(..., description="PromQL 查询语句"),
    time: Optional[str] = Query(None, description="时间点"),
    timeout: Optional[int] = Query(None, description="超时时间（秒）")
):
    """
    查询单个时间点的指标数据

    - **query**: PromQL 查询语句
    - **time**: 可选的时间戳
    - **timeout**: 可选的请求超时时间
    """
    try:
        result = await prometheus_service.query(query, time, timeout)
        return {
            "status": "success",
            "data": result,
            "formatted": prometheus_service.format_metrics(result)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prometheus 查询失败: {str(e)}")


@router.post("/query")
async def query_metrics_post(request: QueryRequest):
    """
    使用 POST 方法查询指标数据

    - **request**: 包含查询参数的对象
    """
    try:
        result = await prometheus_service.query(
            request.query,
            request.time,
            request.timeout
        )
        return {
            "status": "success",
            "data": result,
            "formatted": prometheus_service.format_metrics(result)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prometheus 查询失败: {str(e)}")


@router.get("/query_range")
async def query_metrics_range(
    query: str = Query(..., description="PromQL 查询语句"),
    start: str = Query(..., description="开始时间戳"),
    end: str = Query(..., description="结束时间戳"),
    step: str = Query("15s", description="查询步长"),
    timeout: Optional[int] = Query(None, description="超时时间（秒）")
):
    """
    查询时间范围内的指标数据

    - **query**: PromQL 查询语句
    - **start**: 开始时间戳
    - **end**: 结束时间戳
    - **step**: 查询步长
    - **timeout**: 可选的请求超时时间
    """
    try:
        result = await prometheus_service.query_range(
            query, start, end, step, timeout
        )
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prometheus 范围查询失败: {str(e)}")


@router.get("/targets")
async def get_targets():
    """
    获取 Prometheus 抓取目标列表

    返回所有配置的抓取目标及其状态信息
    """
    try:
        result = await prometheus_service.get_targets()
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取目标失败: {str(e)}")


@router.get("/rules")
async def get_rules(
    type_: str = Query("alert", description="规则类型（alert/record）")
):
    """
    获取告警规则列表

    - **type**: 规则类型，默认为 'alert'
    """
    try:
        result = await prometheus_service.get_rules(type_)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取规则失败: {str(e)}")


@router.get("/alerts")
async def get_alerts():
    """
    获取当前触发的告警列表

    返回所有活跃的告警及其状态
    """
    try:
        result = await prometheus_service.get_alerts()
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取告警失败: {str(e)}")


@router.get("/series")
async def get_series(
    match: list[str] = Query(..., description="匹配规则列表")
):
    """
    获取指标系列列表

    - **match**: 匹配规则列表
    """
    try:
        result = await prometheus_service.get_series(match)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取系列失败: {str(e)}")
