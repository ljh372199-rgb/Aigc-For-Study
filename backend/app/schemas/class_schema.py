from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class ClassCreate(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = Field(None, max_length=500)

class ClassResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    teacher_id: UUID
    invite_code: str
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ClassMemberResponse(BaseModel):
    id: UUID
    class_id: UUID
    student_id: UUID
    role: str
    joined_at: datetime
    status: str
    
    class Config:
        from_attributes = True

class JoinClassRequest(BaseModel):
    invite_code: str = Field(..., min_length=8, max_length=8)

class InviteCodeResponse(BaseModel):
    invite_code: str
    class_id: UUID
    class_name: str