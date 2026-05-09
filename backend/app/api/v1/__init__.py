from fastapi import APIRouter

from app.api.v1 import auth, users, careers, learning_plan, check_ins, exercises, assignments, analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(careers.router, prefix="/careers", tags=["careers"])
api_router.include_router(learning_plan.router, prefix="/learning-plans", tags=["learning-plans"])
api_router.include_router(check_ins.router, prefix="/check-ins", tags=["check-ins"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])
api_router.include_router(assignments.router, prefix="/assignments", tags=["assignments"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
