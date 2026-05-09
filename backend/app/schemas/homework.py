from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class HomeworkBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    max_score: Optional[float] = 100.0

class HomeworkCreate(HomeworkBase):
    course_id: UUID

class HomeworkUpdate(HomeworkBase):
    pass

class HomeworkResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    course_id: UUID
    deadline: Optional[datetime] = None
    max_score: float
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class HomeworkSubmissionCreate(BaseModel):
    content: str

class HomeworkSubmissionUpdate(BaseModel):
    score: Optional[float] = None
    feedback: Optional[str] = None
    status: Optional[str] = None

class HomeworkSubmissionResponse(BaseModel):
    id: UUID
    homework_id: UUID
    student_id: UUID
    content: str
    submitted_at: datetime
    score: Optional[float] = None
    feedback: Optional[str] = None
    status: str
    
    class Config:
        from_attributes = True