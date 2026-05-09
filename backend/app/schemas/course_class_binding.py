from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List


class BindClassRequest(BaseModel):
    class_id: UUID


class ClassBindingResponse(BaseModel):
    id: UUID
    course_id: UUID
    class_id: UUID
    class_name: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class CourseWithClassesResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    teacher_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime
    classes: List[dict] = []
    
    class Config:
        from_attributes = True
