from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, Text
from app.core.config import BloodGroup, ComponentType
from app.core.database import Base


class HospitalBloodRequest(Base):
    __tablename__ = "hospital_blood_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String, unique=True, index=True, nullable=False)
    requesting_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    target_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True, index=True)
    
    blood_group = Column(SQLEnum(BloodGroup), nullable=False, index=True)
    component = Column(SQLEnum(ComponentType), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    
    emergency_level = Column(String, default="CRITICAL", nullable=False)  # CRITICAL, HIGH, ROUTINE
    required_by = Column(DateTime, nullable=True)
    location = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    # Lifecycle statuses (Step 10):
    # PENDING, SEARCHING, MATCH_FOUND, VERIFICATION_REQUIRED, ACCEPTED, REJECTED, CONFIRMED, FULFILLED, CANCELLED
    status = Column(String, default="PENDING", nullable=False, index=True)
    
    confirmed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    fulfilled_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )


class HospitalRequestMessage(Base):
    __tablename__ = "hospital_request_messages"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("hospital_blood_requests.id"), nullable=False, index=True)
    sender_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    sender_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    message = Column(Text, nullable=False)
    message_type = Column(String, default="COMMUNICATION", nullable=False)  # COMMUNICATION, STATUS_CHANGE, DISPATCH_NOTE
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
