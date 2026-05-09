from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import json

class Settings(BaseSettings):
    APP_NAME: str = "Aigc For Study"
    APP_ENV: str = "development"
    DEBUG: bool = True
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    
    DATABASE_URL: str = "postgresql://aigc:aigc@localhost:5432/aigc_dev"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    REDIS_URL: str = "redis://localhost:6379/0"
    
    RABBITMQ_URL: str = "amqp://guest:guest@localhost:5672/"
    
    AI_PROVIDER: str = "deepseek"
    DEEPSEEK_API_KEY: Optional[str] = None
    DEEPSEEK_MODEL: str = "deepseek-chat"
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com"
    
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    CLAUDE_API_KEY: Optional[str] = None
    CLAUDE_MODEL: str = "claude-3-opus-20240229"
    
    STORAGE_TYPE: str = "local"
    STORAGE_PATH: str = "/app/uploads"
    UPLOAD_MAX_SIZE: int = 10485760
    
    JWT_SECRET_KEY: str = "jwt-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    LOG_LEVEL: str = "DEBUG"
    LOG_FORMAT: str = "json"
    
    _cors_origins_raw: Optional[str] = None
    
    @property
    def CORS_ORIGINS(self) -> List[str]:
        if self._cors_origins_raw:
            try:
                return json.loads(self._cors_origins_raw)
            except json.JSONDecodeError:
                return [o.strip() for o in self._cors_origins_raw.split(",")]
        return ["http://localhost:3000", "http://localhost:8080"]
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if hasattr(self, 'model_fields'):
            for field_name in ['CORS_ORIGINS']:
                if field_name in self.model_fields:
                    delattr(self.__class__, field_name)
        if 'CORS_ORIGINS' in kwargs:
            self._cors_origins_raw = kwargs['CORS_ORIGINS']

settings = Settings()
