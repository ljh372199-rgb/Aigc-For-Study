from sqlalchemy import Column, String, DateTime, ForeignKey, UUID
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class CourseClassBinding(Base):
    __tablename__ = "course_class_bindings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = Column(UUID(as_uuid=True), nullable=False)
    class_id = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(DateTime, default=func.current_timestamp())
