from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime
from app.core.database import Base


class BloodBank(Base):
    __tablename__ = "blood_banks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    license_number = Column(String, unique=True, nullable=False)
    district = Column(String, nullable=False, index=True)
    state = Column(String, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_number = Column(String, nullable=False)
    storage_capacity = Column(Integer, default=500, nullable=False)
    cold_chain_verified = Column(Boolean, default=True, nullable=False)
    # Geographic & Master Identification Details
    short_name = Column(String, nullable=True)
    parent_hospital = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    pincode = Column(String, nullable=True)
    region = Column(String, nullable=True)
    category = Column(String, default="Government", nullable=True)
    organization_type = Column(String, default="Government", nullable=True)
    email = Column(String, nullable=True)
    website = Column(String, nullable=True)
    
    # Official Provenance & Verification
    source_name = Column(String, default="Delhi Government / DSACS", nullable=True)
    source_url = Column(String, default="https://dsacs.delhi.gov.in/", nullable=True)
    source_type = Column(String, default="OFFICIAL", nullable=True)
    source_verified = Column(Boolean, default=True, nullable=False)
    last_verified_at = Column(String, nullable=True)
    data_status = Column(String, default="VERIFIED", nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    license_number = Column(String, unique=True, nullable=False)
    district = Column(String, nullable=False, index=True)
    state = Column(String, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_number = Column(String, nullable=False)
    has_trauma_center = Column(Boolean, default=False, nullable=False)
    bed_capacity = Column(Integer, default=200, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
