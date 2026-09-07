from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum, Text
from app.core.config import BloodGroup, ComponentType
from app.core.database import Base


class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id = Column(Integer, primary_key=True, index=True)
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    blood_group = Column(SQLEnum(BloodGroup), nullable=False, index=True)
    component = Column(SQLEnum(ComponentType), nullable=False, index=True)
    units_required = Column(Integer, nullable=False)
    
    # Priority triage
    urgency_level = Column(String, default="CRITICAL_IMMEDIATE", nullable=False)  # CRITICAL_IMMEDIATE, URGENT_UNDER_4H, ELECTIVE
    clinical_notes = Column(Text, nullable=True)  # Anonymized medical context

    status = Column(String, default="PENDING_COORDINATION", nullable=False, index=True)
    allocated_blood_bank_id = Column(Integer, ForeignKey("blood_banks.id"), nullable=True)
    allocated_units = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    resolved_at = Column(DateTime, nullable=True)


class TransferLog(Base):
    __tablename__ = "transfer_logs"

    id = Column(Integer, primary_key=True, index=True)
    emergency_request_id = Column(Integer, ForeignKey("emergency_requests.id"), nullable=True)
    source_bank_id = Column(Integer, ForeignKey("blood_banks.id"), nullable=False)
    destination_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False)
    
    blood_group = Column(SQLEnum(BloodGroup), nullable=False)
    component = Column(SQLEnum(ComponentType), nullable=False)
    units = Column(Integer, nullable=False)
    
    transfer_reason = Column(String, default="EMERGENCY_SOS_FULFILLMENT", nullable=False)  # EMERGENCY_SOS_FULFILLMENT or WASTAGE_PREVENTION
    distance_km = Column(Float, nullable=False)
    estimated_transit_mins = Column(Integer, nullable=False)
    
    status = Column(String, default="RECOMMENDED", nullable=False)  # RECOMMENDED, DISPATCHED, DELIVERED
    dispatch_token = Column(String, unique=True, index=True, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    dispatched_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
