"""
FastAPI application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.core.monitoring import setup_metrics_middleware
import app.models

setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Application starting up", extra={"environment": settings.APP_ENV})
    yield
    logger.info("Application shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="Aigc For Study API - AI驱动的学习平台",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.DEBUG else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_metrics_middleware(app)

from app.api.v1 import (
    auth, users, careers, learning_plan, check_ins,
    exercises, assignments, analytics, courses, homework, classes
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["认证"])
app.include_router(users.router, prefix="/api/v1/users", tags=["用户"])
app.include_router(careers.router, prefix="/api/v1/careers", tags=["职业目标"])
app.include_router(learning_plan.router, prefix="/api/v1/learning-plans", tags=["学习方案"])
app.include_router(check_ins.router, prefix="/api/v1/check-ins", tags=["打卡"])
app.include_router(exercises.router, prefix="/api/v1/exercises", tags=["练习题"])
app.include_router(assignments.router, prefix="/api/v1/assignments", tags=["作业"])
app.include_router(courses.router, prefix="/api/v1/courses", tags=["课程"])
app.include_router(homework.router, prefix="/api/v1/homework", tags=["作业管理"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["统计"])
app.include_router(classes.router, prefix="/api/v1", tags=["班级"])


@app.get("/")
def root():
    return {"message": "Welcome to Aigc For Study API", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/health/liveness")
def liveness():
    return {"status": "alive"}


@app.get("/health/readiness")
def readiness():
    return {"status": "ready"}


@app.get("/health/detailed")
def detailed_health_check():
    from sqlalchemy import text
    from app.core.database import engine
    from app.core.config import settings
    import redis

    health_status = {
        "status": "healthy",
        "checks": {}
    }

    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        health_status["checks"]["database"] = {
            "status": "healthy",
            "url": settings.DATABASE_URL.split("@")[-1] if "@" in settings.DATABASE_URL else "configured"
        }
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = {
            "status": "unhealthy",
            "error": str(e)
        }

    try:
        redis_client = redis.from_url(settings.REDIS_URL)
        redis_client.ping()
        health_status["checks"]["redis"] = {
            "status": "healthy",
            "url": settings.REDIS_URL.split("//")[-1].split("/")[0] if "//" in settings.REDIS_URL else "configured"
        }
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["checks"]["redis"] = {
            "status": "unhealthy",
            "error": str(e)
        }

    if health_status["status"] == "unhealthy":
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail=health_status)

    return health_status


@app.get("/metrics")
async def metrics():
    """
    Prometheus metrics endpoint.
    Returns metrics in Prometheus text format for scraping.
    """
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
