from typing import Generator
from sqlalchemy.orm import Session
from fastapi import Depends, HTTPException

from app.core.database import SessionLocal
from app.core.security import get_current_user
from app.models.user import User

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.status != "active":
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
