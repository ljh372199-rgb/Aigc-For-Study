from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from uuid import UUID
from datetime import datetime

class CareerBase(BaseModel):
    name: str
    description: Optional[str] = None
    skills_required: Optional[List[str]] = None

class CareerCreate(CareerBase):
    pass

class CareerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: Optional[str] = None
    skills_required: Optional[List[Any]] = None
    created_at: datetime
