from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.core.security import require_role
from app.api.deps import get_db, get_current_active_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    merged_user = db.merge(current_user)
    
    if user_update.username:
        existing = db.query(User).filter(
            User.username == user_update.username,
            User.id != merged_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already exists")
        merged_user.username = user_update.username

    if user_update.email:
        existing = db.query(User).filter(
            User.email == user_update.email,
            User.id != merged_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
        merged_user.email = user_update.email

    if user_update.status:
        merged_user.status = user_update.status

    db.commit()
    return merged_user

@router.put("/me/profile", response_model=UserResponse)
def update_my_profile(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    merged_user = db.merge(current_user)
    
    if user_update.username:
        existing = db.query(User).filter(
            User.username == user_update.username,
            User.id != merged_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username already exists")
        merged_user.username = user_update.username

    if user_update.email:
        existing = db.query(User).filter(
            User.email == user_update.email,
            User.id != merged_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
        merged_user.email = user_update.email

    if user_update.status:
        merged_user.status = user_update.status

    db.commit()
    return merged_user

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["teacher", "admin"]))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    role: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.offset(skip).limit(limit).all()
