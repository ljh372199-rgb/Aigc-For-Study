from sqlalchemy import Column, String, Text, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class Course(Base):
    __tablename__ = "courses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    cover_image = Column(String(255))
    teacher_id = Column(UUID(as_uuid=True))
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    __table_args__ = (
        {'schema': 'public'},
    )

class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True))
    student_id = Column(UUID(as_uuid=True))
    enrollment_date = Column(DateTime, default=func.current_timestamp())
    status = Column(String(20), default="active")
    
    __table_args__ = (
        {'schema': 'public'},
    )