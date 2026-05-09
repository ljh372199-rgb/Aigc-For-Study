from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class AssignmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    max_score: float = 100.0
    type: str = "homework"

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    max_score: Optional[float] = None

class AssignmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    teacher_id: UUID
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    max_score: float
    type: str
    created_at: datetime
    updated_at: datetime

class SubmissionBase(BaseModel):
    content: Optional[str] = None
    attachments: Optional[List[str]] = None

class SubmissionCreate(SubmissionBase):
    pass

class SubmissionUpdate(BaseModel):
    score: Optional[float] = None
    feedback: Optional[str] = None
    status: Optional[str] = None

class SubmissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    assignment_id: UUID
    student_id: UUID
    content: Optional[str] = None
    attachments: Optional[List[Any]] = None
    score: Optional[float] = None
    feedback: Optional[str] = None
    status: str
    submitted_at: datetime
    graded_at: Optional[datetime] = None
