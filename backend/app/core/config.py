# backend/app/core/config.py

import os
from pydantic_settings import BaseSettings
from typing import List, Union, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "MC Worlds Tournament Backend"
    API_V1_STR: str = "/api/v1" # API versiyon prefix'i

    DATABASE_URL: str

    # JWT Ayarları (varsayılan değerler .env dosyasından okunacak)
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS Ayarları
    BACKEND_CORS_ORIGINS: Optional[List[str]] = None
    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'

settings = Settings()