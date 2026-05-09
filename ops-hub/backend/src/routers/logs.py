"""
Loki 日志路由

提供日志查询相关的 API 端点
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from src.services.loki_service import loki_service

router = APIRouter(prefix="/logs", tags=["logs"])


class LogQueryRequest(BaseModel):
    """日志查询请求模型"""
    query: str
    limit: int = 100
    start: Optional[str] = None
    end: Optional[str] = None
    direction: str = "backward"


@router.get("/query")
async def query_logs(
    query: str = Query(..., description="LogQL 查询语句"),
    limit: int = Query(100, description="返回的最大日志条目数"),
    start: Optional[str] = Query(None, description="开始时间"),
    end: Optional[str] = Query(None, description="结束时间"),
    direction: str = Query("backward", description="查询方向（forward/backward）")
):
    """
    查询日志条目

    - **query**: LogQL 查询语句
    - **limit**: 返回的最大日志条目数
    - **start**: 开始时间
    - **end**: 结束时间
    - **direction**: 查询方向
    """
    try:
        result = await loki_service.query(
            query, limit, start, end, direction
        )
        formatted_logs = loki_service.format_logs(result)
        return {
            "status": "success",
            "data": result,
            "logs": formatted_logs,
            "count": len(formatted_logs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Loki 查询失败: {str(e)}")


@router.post("/query")
async def query_logs_post(request: LogQueryRequest):
    """
    使用 POST 方法查询日志

    - **request**: 包含查询参数的对象
    """
    try:
        result = await loki_service.query(
            request.query,
            request.limit,
            request.start,
            request.end,
            request.direction
        )
        formatted_logs = loki_service.format_logs(result)
        return {
            "status": "success",
            "data": result,
            "logs": formatted_logs,
            "count": len(formatted_logs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Loki 查询失败: {str(e)}")


@router.get("/labels")
async def get_labels(
    start: Optional[str] = Query(None, description="开始时间"),
    end: Optional[str] = Query(None, description="结束时间")
):
    """
    获取标签列表

    - **start**: 开始时间
    - **end**: 结束时间
    """
    try:
        result = await loki_service.labels(start, end)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取标签失败: {str(e)}")


@router.get("/label/{label}")
async def get_label_values(
    label: str = Query(..., description="标签名称")
):
    """
    获取指定标签的值列表

    - **label**: 标签名称
    """
    try:
        result = await loki_service.label_values(label)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取标签值失败: {str(e)}")


@router.get("/series")
async def get_series(
    start: str = Query(..., description="开始时间（纳秒时间戳）"),
    end: Optional[str] = Query(None, description="结束时间（纳秒时间戳）"),
    match: Optional[list[str]] = Query(None, description="匹配规则")
):
    """
    获取日志流信息

    - **start**: 开始时间
    - **end**: 结束时间
    - **match**: 匹配规则
    """
    try:
        result = await loki_service.series(start, end, match)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取日志流失败: {str(e)}")


@router.get("/query_range")
async def query_logs_range(
    query: str = Query(..., description="LogQL 查询语句"),
    start: str = Query(..., description="开始时间"),
    end: str = Query(..., description="结束时间"),
    limit: int = Query(100, description="返回的最大条目数"),
    step: str = Query("15s", description="查询步长"),
    direction: str = Query("backward", description="查询方向")
):
    """
    查询时间范围内的日志

    - **query**: LogQL 查询语句
    - **start**: 开始时间
    - **end**: 结束时间
    - **limit**: 返回的最大条目数
    - **step**: 查询步长
    - **direction**: 查询方向
    """
    try:
        result = await loki_service.query_range(
            query, start, end, limit, step, direction
        )
        formatted_logs = loki_service.format_logs(result)
        return {
            "status": "success",
            "data": result,
            "logs": formatted_logs,
            "count": len(formatted_logs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Loki 范围查询失败: {str(e)}")


@router.websocket("/stream")
async def log_stream_websocket(websocket: WebSocket):
    """
    WebSocket 实时日志流

    客户端可以连接到该端点接收实时日志流

    接收消息格式:
    - {"action": "start", "query": "...", "limit": 100}
    - {"action": "stop"}
    """
    await websocket.accept()

    active = True
    current_query = None
    current_limit = 100

    try:
        while active:
            data = await websocket.receive_json()
            action = data.get("action")

            if action == "start":
                current_query = data.get("query")
                current_limit = data.get("limit", 100)

                if not current_query:
                    await websocket.send_json({
                        "error": "query parameter is required"
                    })
                    continue

                try:
                    result = await loki_service.query(
                        current_query, current_limit
                    )
                    formatted_logs = loki_service.format_logs(result)

                    await websocket.send_json({
                        "status": "success",
                        "logs": formatted_logs,
                        "count": len(formatted_logs)
                    })
                except Exception as e:
                    await websocket.send_json({
                        "error": f"Query failed: {str(e)}"
                    })

            elif action == "stop":
                active = False
                await websocket.send_json({
                    "status": "stopped"
                })

    except WebSocketDisconnect:
        pass
    except Exception as e:
        try:
            await websocket.send_json({
                "error": f"WebSocket error: {str(e)}"
            })
        except:
            pass
