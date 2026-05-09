from sqlalchemy import Column, String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSON
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class CareerGoal(Base):
    __tablename__ = "career_goals"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    skills_required = Column(JSON)
    created_at = Column(DateTime, default=func.now(), nullable=False)
