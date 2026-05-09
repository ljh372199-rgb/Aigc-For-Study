from typing import Optional, Any, Dict
from datetime import datetime, date
import uuid

def generate_uuid() -> str:
    return str(uuid.uuid4())

def format_datetime(dt: Optional[datetime]) -> Optional[str]:
    if dt:
        return dt.isoformat()
    return None

def format_date(d: Optional[date]) -> Optional[str]:
    if d:
        return d.isoformat()
    return None

def paginate(query, skip: int = 0, limit: int = 100):
    return query.offset(skip).limit(limit)

def success_response(data: Any = None, message: str = "success"):
    return {
        "code": 200,
        "message": message,
        "data": data
    }

def error_response(code: int, message: str, detail: Any = None):
    return {
        "code": code,
        "message": message,
        "detail": detail
    }
