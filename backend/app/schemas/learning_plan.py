from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class LearningPlanBase(BaseModel):
    career_goal_id: UUID
    title: Optional[str] = None

class LearningPlanCreate(LearningPlanBase):
    pass

class LearningPlanUpdate(BaseModel):
    title: Optional[str] = None
    plan_data: Optional[Dict[str, Any]] = None
    status: Optional[str] = None

class LearningPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    career_goal_id: Optional[UUID] = None
    title: Optional[str] = None
    plan_data: Optional[Dict[str, Any]] = None
    status: str
    created_at: datetime
    updated_at: datetime
