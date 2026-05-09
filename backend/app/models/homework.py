from sqlalchemy import Column, String, Text, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class Homework(Base):
    __tablename__ = "homeworks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    course_id = Column(UUID(as_uuid=True))
    deadline = Column(DateTime)
    max_score = Column(Float, default=100.0)
    status = Column(String(20), default="active")
    created_at = Column(DateTime, default=func.current_timestamp())
    updated_at = Column(DateTime, default=func.current_timestamp(), onupdate=func.current_timestamp())
    
    __table_args__ = (
        {'schema': 'public'},
    )

class HomeworkSubmission(Base):
    __tablename__ = "homework_submissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    homework_id = Column(UUID(as_uuid=True))
    student_id = Column(UUID(as_uuid=True))
    content = Column(Text)
    submitted_at = Column(DateTime, default=func.current_timestamp())
    score = Column(Float)
    feedback = Column(Text)
    status = Column(String(20), default="submitted")
    
    __table_args__ = (
        {'schema': 'public'},
    )