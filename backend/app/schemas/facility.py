from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class BloodBankBase(BaseModel):
    name: str = Field(..., min_length=2)
    license_number: str = Field(..., min_length=3)
    district: str
    state: str
    latitude: float
    longitude: float
    contact_number: str
    storage_capacity: int = 500
    cold_chain_verified: bool = True
    is_active: bool = True


class BloodBankCreate(BloodBankBase):
    pass


class BloodBankResponse(BloodBankBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HospitalBase(BaseModel):
    name: str = Field(..., min_length=2)
    license_number: str = Field(..., min_length=3)
    district: str
    state: str
    latitude: float
    longitude: float
    contact_number: str
    has_trauma_center: bool = False
    bed_capacity: int = 200
    is_active: bool = True


class HospitalCreate(HospitalBase):
    pass


class HospitalResponse(HospitalBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

