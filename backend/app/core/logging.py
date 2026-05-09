"""
Simple logging configuration.
"""
import logging
import sys
from datetime import datetime, timezone
from typing import Optional, Dict, Any, MutableMapping

from app.core.config import settings


def setup_logging(
    service_name: Optional[str] = None,
    log_level: Optional[str] = None,
    environment: Optional[str] = None
) -> None:
    """
    Configure basic logging for the application.
    """
    service_name = service_name or settings.APP_NAME
    log_level = log_level or settings.LOG_LEVEL
    environment = environment or settings.APP_ENV

    log_level_value = getattr(logging, log_level.upper(), logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(log_level_value)

    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level_value)
    
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    logging.getLogger("uvicorn").setLevel(log_level_value)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").setLevel(log_level_value)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


_loggers: Dict[str, logging.Logger] = {}


def get_logger(name: str) -> logging.Logger:
    """
    Get a configured logger instance.
    """
    if name not in _loggers:
        logger = logging.getLogger(name)
        _loggers[name] = logger
    return _loggers[name]