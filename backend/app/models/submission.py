from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base
from app.models.assignment import SubmissionStatus

class AssignmentSubmission(Base):
    __tablename__ = "assignment_submissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id"), nullable=False)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content = Column(Text)
    attachments = Column(JSON)
    score = Column(Float)
    feedback = Column(Text)
    status = Column(String(20), default=SubmissionStatus.SUBMITTED.value)
    submitted_at = Column(DateTime, server_default=func.now())
    graded_at = Column(DateTime)

    assignment = relationship("Assignment", backref="submissions")
    student = relationship("User", backref="submissions")
