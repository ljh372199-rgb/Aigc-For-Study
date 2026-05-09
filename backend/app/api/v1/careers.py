from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.models.user import User
from app.models.career import CareerGoal
from app.schemas.career import CareerCreate, CareerResponse
from app.core.security import require_role
from app.api.deps import get_db, get_current_active_user

router = APIRouter()

@router.get("/", response_model=List[CareerResponse])
def list_careers(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return db.query(CareerGoal).offset(skip).limit(limit).all()

@router.get("/{career_id}", response_model=CareerResponse)
def get_career(
    career_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    career = db.query(CareerGoal).filter(CareerGoal.id == career_id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career goal not found")
    return career

@router.post("/", response_model=CareerResponse, status_code=status.HTTP_201_CREATED)
def create_career(
    career_in: CareerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    career = CareerGoal(**career_in.model_dump())
    db.add(career)
    db.commit()
    db.refresh(career)
    return career
