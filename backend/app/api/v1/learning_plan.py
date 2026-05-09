from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.models.user import User
from app.models.learning_plan import LearningPlan
from app.schemas.learning_plan import LearningPlanCreate, LearningPlanUpdate, LearningPlanResponse
from app.core.security import require_role
from app.api.deps import get_db, get_current_active_user

router = APIRouter()

@router.post("/", response_model=LearningPlanResponse, status_code=status.HTTP_201_CREATED)
def create_learning_plan(
    plan_in: LearningPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    plan = LearningPlan(
        user_id=current_user.id,
        career_goal_id=plan_in.career_goal_id,
        title=plan_in.title,
        status="active"
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan

@router.get("/", response_model=List[LearningPlanResponse])
def list_learning_plans(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role == "admin":
        return db.query(LearningPlan).offset(skip).limit(limit).all()
    return db.query(LearningPlan).filter(LearningPlan.user_id == current_user.id).offset(skip).limit(limit).all()

@router.get("/{plan_id}", response_model=LearningPlanResponse)
def get_learning_plan(
    plan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    plan = db.query(LearningPlan).filter(LearningPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Learning plan not found")
    if current_user.role != "admin" and plan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return plan

@router.put("/{plan_id}", response_model=LearningPlanResponse)
def update_learning_plan(
    plan_id: UUID,
    plan_update: LearningPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    plan = db.query(LearningPlan).filter(LearningPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Learning plan not found")
    if current_user.role != "admin" and plan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in plan_update.model_dump(exclude_unset=True).items():
        setattr(plan, field, value)

    db.commit()
    db.refresh(plan)
    return plan

@router.delete("/{plan_id}")
def delete_learning_plan(
    plan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    plan = db.query(LearningPlan).filter(LearningPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Learning plan not found")
    if current_user.role != "admin" and plan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db.delete(plan)
    db.commit()
    return {"message": "Learning plan deleted"}
