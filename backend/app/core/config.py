import os
from enum import Enum
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    BLOOD_BANK = "BLOOD_BANK"
    HOSPITAL = "HOSPITAL"
    DONOR = "DONOR"
    PATIENT = "PATIENT"


class AvailabilityStatus(str, Enum):
    """
    Clear architectural taxonomy strictly distinguishing:
    1. REPORTED_AVAILABILITY - Unconfirmed raw feed from blood bank or adapter.
    2. PREDICTED_AVAILABILITY - ML model projected supply for future planning.
    3. RECOMMENDED_ACTION - Algorithmic dispatch / transfer advisory.
    4. CONFIRMED_AVAILABILITY - Physically verified and reserved by authorized clinical staff.
    """
    REPORTED = "REPORTED_AVAILABILITY"
    PREDICTED = "PREDICTED_AVAILABILITY"
    RECOMMENDED = "RECOMMENDED_ACTION"
    CONFIRMED = "CONFIRMED_AVAILABILITY"


class ComponentType(str, Enum):
    WHOLE_BLOOD = "WHOLE_BLOOD"
    PRBC = "PACKED_RED_BLOOD_CELLS"
    FFP = "FRESH_FROZEN_PLASMA"
    PLATELETS = "PLATELET_CONCENTRATE"
    CRYOPRECIPITATE = "CRYOPRECIPITATE"


class BloodGroup(str, Enum):
    A_POS = "A+"
    A_NEG = "A-"
    B_POS = "B+"
    B_NEG = "B-"
    AB_POS = "AB+"
    AB_NEG = "AB-"
    O_POS = "O+"
    O_NEG = "O-"


class Settings(BaseSettings):
    PROJECT_NAME: str = "SmartBlood AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "smartblood-ai-super-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database (PostgreSQL compatible, fallback to SQLite for local development)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./smartblood.db")
    
    # Data & Integration Adapters
    # Development uses synthetic e-RaktKosh compatible adapter (Rule 4, 5, 11)
    USE_SYNTHETIC_ERAKTKOSH_DATA: bool = True
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env")


settings = Settings()
