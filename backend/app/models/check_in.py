from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base

class DailyCheckIn(Base):
    __tablename__ = "daily_check_ins"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    plan_id = Column(UUID(as_uuid=True), ForeignKey("learning_plans.id"))
    check_in_date = Column(Date, nullable=False)
    duration_minutes = Column(Integer, default=0)
    content = Column(Text)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    
    user = relationship("User", backref="check_ins")
    plan = relationship("LearningPlan")
