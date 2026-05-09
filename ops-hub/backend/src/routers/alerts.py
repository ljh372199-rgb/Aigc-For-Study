"""
Alertmanager 告警路由

提供告警和静默管理相关的 API 端点
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from src.services.alertmanager_service import alertmanager_service

router = APIRouter(prefix="/alerts", tags=["alerts"])


class Matcher(BaseModel):
    """告警匹配器模型"""
    name: str = Field(..., description="标签名称")
    value: str = Field(..., description="标签值")
    isRegex: bool = Field(False, description="是否使用正则表达式")
    isEqual: bool = Field(True, description="是否等于匹配")


class CreateSilenceRequest(BaseModel):
    """创建静默请求模型"""
    matchers: list[Matcher] = Field(..., description="匹配器列表")
    starts_at: str = Field(..., description="开始时间（RFC3339 格式）")
    ends_at: str = Field(..., description="结束时间（RFC3339 格式）")
    created_by: str = Field(..., description="创建者名称")
    comment: str = Field(..., description="备注信息")


@router.get("")
async def get_alerts(
    active: bool = Query(True, description="包含活跃告警"),
    silenced: bool = Query(True, description="包含已静默的告警"),
    inhibited: bool = Query(True, description="包含被抑制的告警"),
    unprocessed: bool = Query(True, description="包含未处理的告警"),
    filter_: Optional[list[str]] = Query(None, alias="filter", description="告警过滤器")
):
    """
    获取告警列表

    - **active**: 是否包含活跃告警
    - **silenced**: 是否包含已静默的告警
    - **inhibited**: 是否包含被抑制的告警
    - **unprocessed**: 是否包含未处理的告警
    - **filter**: 告警过滤器
    """
    try:
        result = await alertmanager_service.get_alerts(
            active, silenced, inhibited, unprocessed, filter_
        )
        return {
            "status": "success",
            "data": result,
            "count": len(result)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取告警失败: {str(e)}")


@router.get("/silences")
async def get_silences():
    """
    获取静默列表

    返回所有配置的静默规则
    """
    try:
        result = await alertmanager_service.get_silences()
        return {
            "status": "success",
            "data": result,
            "count": len(result)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取静默失败: {str(e)}")


@router.get("/silences/{silence_id}")
async def get_silence(silence_id: str):
    """
    获取指定静默详情

    - **silence_id**: 静默 ID
    """
    try:
        result = await alertmanager_service.get_silence(silence_id)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取静默详情失败: {str(e)}")


@router.post("/silences")
async def create_silence(request: CreateSilenceRequest):
    """
    创建静默规则

    - **request**: 静默配置对象
    """
    try:
        matchers = [
            {
                "name": m.name,
                "value": m.value,
                "isRegex": m.isRegex,
                "isEqual": m.isEqual
            }
            for m in request.matchers
        ]

        result = await alertmanager_service.create_silence(
            matchers=matchers,
            starts_at=request.starts_at,
            ends_at=request.ends_at,
            created_by=request.created_by,
            comment=request.comment
        )

        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建静默失败: {str(e)}")


@router.delete("/silences/{silence_id}")
async def delete_silence(silence_id: str):
    """
    删除静默规则

    - **silence_id**: 静默 ID
    """
    try:
        result = await alertmanager_service.delete_silence(silence_id)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除静默失败: {str(e)}")


@router.get("/receivers")
async def get_receivers():
    """
    获取接收者列表

    返回所有配置的告警接收者
    """
    try:
        result = await alertmanager_service.get_receivers()
        return {
            "status": "success",
            "data": result,
            "count": len(result)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取接收者失败: {str(e)}")


@router.get("/status")
async def get_status():
    """
    获取 Alertmanager 状态信息

    返回 Alertmanager 的当前状态和版本信息
    """
    try:
        result = await alertmanager_service.get_status()
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取状态失败: {str(e)}")
