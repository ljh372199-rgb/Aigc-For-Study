from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base

class AssignmentType(str, enum.Enum):
    HOMEWORK = "homework"
    EXAM = "exam"

class SubmissionStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    GRADED = "graded"
    RETURNED = "returned"

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    deadline = Column(DateTime)
    max_score = Column(Float, default=100.0)
    type = Column(String(20), default=AssignmentType.HOMEWORK.value)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    teacher = relationship("User", backref="assignments")
