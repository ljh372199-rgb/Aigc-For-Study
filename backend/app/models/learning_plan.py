from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
import enum

from app.core.database import Base

class PlanStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"

class LearningPlan(Base):
    __tablename__ = "learning_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    career_goal_id = Column(UUID(as_uuid=True), ForeignKey("career_goals.id"))
    title = Column(String(200))
    plan_data = Column(JSON)
    status = Column(String(20), default=PlanStatus.DRAFT.value)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", backref="learning_plans")
    career_goal = relationship("CareerGoal")
