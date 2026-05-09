from pydantic import BaseModel, ConfigDict
from typing import Optional
from uuid import UUID
from datetime import datetime, date

class CheckInBase(BaseModel):
    plan_id: Optional[UUID] = None
    duration_minutes: int = 0
    content: Optional[str] = None

class CheckInCreate(CheckInBase):
    check_in_date: date

class CheckInUpdate(BaseModel):
    duration_minutes: Optional[int] = None
    content: Optional[str] = None

class CheckInResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    plan_id: Optional[UUID] = None
    check_in_date: date
    duration_minutes: int
    content: Optional[str] = None
    created_at: datetime
    updated_at: datetime
