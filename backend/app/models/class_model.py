from sqlalchemy import Column, String, DateTime, ForeignKey, UUID, Boolean
from sqlalchemy.sql import func
from app.core.database import Base
import uuid

class Class(Base):
    __tablename__ = "classes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False)
    description = Column(String(500))
    teacher_id = Column(UUID(as_uuid=True))
    invite_code = Column(String(8), unique=True, nullable=False)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())


class ClassMember(Base):
    __tablename__ = "class_members"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    class_id = Column(UUID(as_uuid=True))
    student_id = Column(UUID(as_uuid=True))
    role = Column(String(20), default="student")  # student/teacher
    joined_at = Column(DateTime, default=func.current_timestamp())
    status = Column(String(20), default="active")