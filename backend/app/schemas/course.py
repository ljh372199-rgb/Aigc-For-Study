from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class CourseBase(BaseModel):
    title: str
    description: Optional[str] = None
    cover_image: Optional[str] = None

class CourseCreate(CourseBase):
    pass

class CourseUpdate(CourseBase):
    pass

class CourseResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    teacher_id: UUID
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class CourseEnrollmentResponse(BaseModel):
    id: UUID
    course_id: UUID
    student_id: UUID
    enrollment_date: datetime
    status: str
    
    class Config:
        from_attributes = True