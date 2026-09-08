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
    short_name: Optional[str] = None
    parent_hospital: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    region: Optional[str] = None
    category: Optional[str] = "Government"
    organization_type: Optional[str] = "Government"
    email: Optional[str] = None
    website: Optional[str] = None
    source_name: Optional[str] = "Delhi Government / DSACS"
    source_url: Optional[str] = "https://dsacs.delhi.gov.in/"
    source_type: Optional[str] = "OFFICIAL"
    source_verified: bool = True
    last_verified_at: Optional[str] = None
    data_status: Optional[str] = "VERIFIED"


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

