from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class ExerciseBase(BaseModel):
    topic: str
    content: str
    type: str = "short_answer"
    answer: Optional[str] = None
    options: Optional[List[str]] = None
    difficulty: str = "medium"

class ExerciseCreate(ExerciseBase):
    plan_id: Optional[UUID] = None

class ExerciseGenerate(BaseModel):
    plan_id: Optional[UUID] = None
    topic: str
    count: int = 5
    difficulty: str = "medium"

class ExerciseSubmit(BaseModel):
    answer: str

class ExerciseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    plan_id: Optional[UUID] = None
    topic: Optional[str] = None
    content: str
    type: str
    answer: Optional[str] = None
    options: Optional[List[Any]] = None
    difficulty: str
    result: Optional[Dict[str, Any]] = None
    student_id: Optional[UUID] = None
    submitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
