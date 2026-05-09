from typing import List, Dict, Any
from uuid import UUID

from app.services.ai.base import get_ai_service

ai_service = get_ai_service()

async def generate_learning_plan(
    career_goal: str,
    skills_required: List[str]
) -> Dict[str, Any]:
    return await ai_service.generate_learning_plan(career_goal, skills_required)

async def generate_exercises(
    topic: str,
    count: int = 5,
    difficulty: str = "medium"
) -> List[Dict[str, Any]]:
    return await ai_service.generate_exercises(topic, count, difficulty)

async def grade_exercise(
    content: str,
    answer: str
) -> Dict[str, Any]:
    return await ai_service.grade_exercise(content, answer)

async def grade_assignment(
    title: str,
    description: str,
    content: str
) -> Dict[str, Any]:
    return await ai_service.grade_assignment(title, description, content)

async def analyze_learning_progress(
    student_id: str
) -> Dict[str, Any]:
    return await ai_service.analyze_learning_progress(student_id)
