import os
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.webhooks import router as webhook_router

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Ops API 启动中...")
    yield
    logger.info("Ops API 关闭中...")


app = FastAPI(
    title="OPS API",
    description="AIGC For Study 运维管理 API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(webhook_router)


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ops-api",
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    return {
        "message": "OPS API 服务运行中",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/status")
async def status():
    return {
        "service": "ops-api",
        "status": "running",
        "environment": os.getenv("ENVIRONMENT", "staging")
    }
