from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Boolean, Float, Enum as SQLEnum
from app.core.config import AvailabilityStatus, BloodGroup, ComponentType
from app.core.database import Base


class BloodInventory(Base):
    __tablename__ = "blood_inventory"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("blood_banks.id"), nullable=False, index=True)
    blood_group = Column(SQLEnum(BloodGroup), nullable=False, index=True)
    component = Column(SQLEnum(ComponentType), nullable=False, index=True)
    units_available = Column(Integer, nullable=False, default=0)
    reserved_units = Column(Integer, nullable=False, default=0)
    issued_units = Column(Integer, nullable=False, default=0)
    expired_units = Column(Integer, nullable=False, default=0)
    batch_number = Column(String, unique=True, index=True, nullable=False)
    
    # Clearly distinguished availability state (Rule 10)
    status = Column(
        SQLEnum(AvailabilityStatus),
        default=AvailabilityStatus.REPORTED,
        nullable=False,
        index=True
    )
    
    collected_date = Column(Date, nullable=False)
    processing_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=False, index=True)
    temperature_celsius = Column(Float, default=4.0, nullable=False)
    is_quarantined = Column(Boolean, default=False, nullable=False)
    
    # Audit verification details
    last_verified_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    # Ingestion provenance
    source_tag = Column(String, default="DIRECT_BANK_LOG", nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
