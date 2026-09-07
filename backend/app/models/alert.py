from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    # Severity: CRITICAL, WARNING, ATTENTION, OPPORTUNITY
    severity = Column(String(20), nullable=False, index=True)
    # Type: SHORTAGE, EXPIRY, ANOMALY, EMERGENCY, STALE_DATA
    alert_type = Column(String(50), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    target_facility_id = Column(Integer, nullable=True)
    recommended_action = Column(Text, nullable=True)
    confidence_score = Column(String(20), default="HIGH", nullable=True)
    is_resolved = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
