from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base

class ExerciseType(str, enum.Enum):
    SINGLE_CHOICE = "single_choice"
    MULTI_CHOICE = "multi_choice"
    SHORT_ANSWER = "short_answer"

class Difficulty(str, enum.Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("learning_plans.id"))
    topic = Column(String(200))
    content = Column(Text, nullable=False)
    type = Column(String(20), default=ExerciseType.SHORT_ANSWER.value)
    answer = Column(Text)
    options = Column(JSON)
    difficulty = Column(String(20), default=Difficulty.MEDIUM.value)
    result = Column(JSON)
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    submitted_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    plan = relationship("LearningPlan")
    student = relationship("User")
