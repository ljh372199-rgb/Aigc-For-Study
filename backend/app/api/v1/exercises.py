from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime

from app.models.user import User
from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate, ExerciseGenerate, ExerciseSubmit, ExerciseResponse
from app.core.security import require_role
from app.api.deps import get_db, get_current_active_user

router = APIRouter()

@router.post("/generate", response_model=List[ExerciseResponse], status_code=status.HTTP_201_CREATED)
async def generate_exercises(
    exercise_in: ExerciseGenerate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    from app.services.ai_service import ai_service

    exercises_data = await ai_service.generate_exercises(
        topic=exercise_in.topic,
        count=exercise_in.count,
        difficulty=exercise_in.difficulty
    )

    exercises = []
    for ex_data in exercises_data:
        exercise = Exercise(
            plan_id=exercise_in.plan_id,
            topic=exercise_in.topic,
            content=ex_data["content"],
            type=ex_data.get("type", "short_answer"),
            answer=ex_data.get("answer", ""),
            options=ex_data.get("options"),
            difficulty=exercise_in.difficulty,
            student_id=current_user.id
        )
        db.add(exercise)
        exercises.append(exercise)

    db.commit()
    for ex in exercises:
        db.refresh(ex)

    return exercises

@router.get("/", response_model=List[ExerciseResponse])
def list_exercises(
    skip: int = 0,
    limit: int = 100,
    plan_id: UUID = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Exercise)

    if current_user.role == "student":
        query = query.filter(Exercise.student_id == current_user.id)

    if plan_id:
        query = query.filter(Exercise.plan_id == plan_id)

    return query.offset(skip).limit(limit).all()

@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(
    exercise_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise

@router.post("/{exercise_id}/submit", response_model=ExerciseResponse)
async def submit_exercise(
    exercise_id: UUID,
    submit_data: ExerciseSubmit,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    exercise.answer = submit_data.answer
    exercise.student_id = current_user.id
    exercise.submitted_at = datetime.utcnow()

    db.commit()
    db.refresh(exercise)

    return exercise

@router.post("/{exercise_id}/grade", response_model=ExerciseResponse)
async def grade_exercise(
    exercise_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    from datetime import datetime

    exercise = db.query(Exercise).filter(Exercise.id == exercise_id).first()
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")

    from app.services.ai_service import ai_service

    result = await ai_service.grade_exercise(
        content=exercise.content,
        answer=exercise.answer or ""
    )

    exercise.result = result
    db.commit()
    db.refresh(exercise)

    return exercise
