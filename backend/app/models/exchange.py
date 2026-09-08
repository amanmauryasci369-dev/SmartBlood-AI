from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class BloodRequest(Base):
    __tablename__ = "blood_requests"

    id = Column(Integer, primary_key=True, index=True)
    requesting_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=False, index=True)
    requesting_hospital_name = Column(String, nullable=True)
    providing_hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True, index=True)
    providing_hospital_name = Column(String, nullable=True)
    
    blood_group = Column(String, nullable=False, index=True)
    component = Column(String, nullable=False, index=True)
    quantity_requested = Column(Integer, nullable=False)
    required_by = Column(DateTime, nullable=True)
    search_location = Column(String, nullable=True)
    
    # Lifecycle: pending, accepted, rejected, cancelled, fulfilled
    status = Column(String, default="pending", nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    items = relationship("BloodRequestItem", back_populates="request", cascade="all, delete-orphan")


class BloodRequestItem(Base):
    __tablename__ = "blood_request_items"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("blood_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    blood_inventory_id = Column(Integer, ForeignKey("blood_inventory.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity_allocated = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    request = relationship("BloodRequest", back_populates="items")
