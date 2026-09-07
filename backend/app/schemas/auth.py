from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.core.config import UserRole


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Password with minimum 6 characters")
    full_name: str = Field(..., min_length=2)
    role: UserRole = Field(default=UserRole.PATIENT)
    phone: Optional[str] = Field(default=None, description="Optional contact number (will be masked in storage)")
    facility_type: Optional[str] = Field(default=None, description="BLOOD_BANK or HOSPITAL if facility staff")
    facility_id: Optional[int] = Field(default=None)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: UserRole
    user_id: int
    email: str
    full_name: str
    facility_type: Optional[str] = None
    facility_id: Optional[int] = None


class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
    role: Optional[str] = None
    email: Optional[str] = None
    facility_id: Optional[int] = None


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    is_active: bool
    phone_masked: Optional[str] = None
    facility_type: Optional[str] = None
    facility_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
