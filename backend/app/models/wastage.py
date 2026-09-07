from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum as SQLEnum, Text
from app.core.config import BloodGroup, ComponentType
from app.core.database import Base


class WastageRecord(Base):
    __tablename__ = "wastage_records"

    id = Column(Integer, primary_key=True, index=True)
    blood_bank_id = Column(Integer, ForeignKey("blood_banks.id"), nullable=False, index=True)
    blood_group = Column(SQLEnum(BloodGroup), nullable=False, index=True)
    component = Column(SQLEnum(ComponentType), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    
    # Standardized discard reasons (Step 6)
    reason = Column(String, nullable=False, index=True)  # EXPIRY, TTI_REACTIVE, DAMAGED, QUALITY_CONTROL, OTHER
    recorded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    reference_inventory_id = Column(Integer, ForeignKey("blood_inventory.id"), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
