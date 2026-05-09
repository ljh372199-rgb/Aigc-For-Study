from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import date

from app.models.user import User
from app.models.check_in import DailyCheckIn
from app.schemas.check_in import CheckInCreate, CheckInUpdate, CheckInResponse
from app.core.security import require_role
from app.api.deps import get_db, get_current_active_user

router = APIRouter()

@router.post("/", response_model=CheckInResponse, status_code=status.HTTP_201_CREATED)
def create_check_in(
    check_in: CheckInCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["student"]))
):
    existing = db.query(DailyCheckIn).filter(
        DailyCheckIn.user_id == current_user.id,
        DailyCheckIn.check_in_date == check_in.check_in_date
    ).first()
    
    if existing:
        existing.duration_minutes = check_in.duration_minutes
        existing.content = check_in.content
        db.commit()
        db.refresh(existing)
        return existing
    
    check_in_obj = DailyCheckIn(
        user_id=current_user.id,
        plan_id=check_in.plan_id,
        check_in_date=check_in.check_in_date,
        duration_minutes=check_in.duration_minutes,
        content=check_in.content
    )
    db.add(check_in_obj)
    db.commit()
    db.refresh(check_in_obj)
    return check_in_obj

@router.get("/", response_model=List[CheckInResponse])
def list_check_ins(
    skip: int = 0,
    limit: int = 100,
    plan_id: UUID = None,
    start_date: date = None,
    end_date: date = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(DailyCheckIn)
    
    if current_user.role != "admin":
        query = query.filter(DailyCheckIn.user_id == current_user.id)
    
    if plan_id:
        query = query.filter(DailyCheckIn.plan_id == plan_id)
    if start_date:
        query = query.filter(DailyCheckIn.check_in_date >= start_date)
    if end_date:
        query = query.filter(DailyCheckIn.check_in_date <= end_date)
    
    return query.order_by(DailyCheckIn.check_in_date.desc()).offset(skip).limit(limit).all()

@router.get("/{check_in_id}", response_model=CheckInResponse)
def get_check_in(
    check_in_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    check_in = db.query(DailyCheckIn).filter(DailyCheckIn.id == check_in_id).first()
    if not check_in:
        raise HTTPException(status_code=404, detail="Check-in not found")
    if current_user.role != "admin" and check_in.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return check_in

@router.put("/{check_in_id}", response_model=CheckInResponse)
def update_check_in(
    check_in_id: UUID,
    check_in_update: CheckInUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    check_in = db.query(DailyCheckIn).filter(DailyCheckIn.id == check_in_id).first()
    if not check_in:
        raise HTTPException(status_code=404, detail="Check-in not found")
    if current_user.role != "admin" and check_in.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    for field, value in check_in_update.model_dump(exclude_unset=True).items():
        setattr(check_in, field, value)
    
    db.commit()
    db.refresh(check_in)
    return check_in
