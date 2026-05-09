from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class StudentProgress(BaseModel):
    total_study_time: int
    total_exercises: int
    completed_exercises: int
    total_assignments: int
    completed_assignments: int
    average_score: Optional[float] = None
    current_streak: int

class StudentStats(BaseModel):
    total_study_time: int
    exercise_accuracy: float
    strengths: List[str]
    weaknesses: List[str]
    recent_performance: List[Dict[str, Any]]

class ClassStats(BaseModel):
    total_students: int
    average_completion_rate: float
    average_score: float
    top_performers: List[Dict[str, Any]]
    struggling_students: List[Dict[str, Any]]

class AssignmentStats(BaseModel):
    total_submissions: int
    graded_submissions: int
    average_score: float
    score_distribution: Dict[str, int]
