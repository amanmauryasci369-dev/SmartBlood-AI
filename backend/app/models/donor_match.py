from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from app.core.database import Base


class DonorMatch(Base):
    __tablename__ = "donor_matches"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("emergency_requests.id"), nullable=False, index=True)
    donor_id = Column(Integer, ForeignKey("donors.id"), nullable=False, index=True)
    
    # Transparent score breakdown (Module 7):
    # Donor Score = Compatibility + Eligibility + Distance + Availability + Response Probability
    overall_score = Column(Float, nullable=False)
    compatibility_score = Column(Float, nullable=False)
    eligibility_score = Column(Float, nullable=False)
    distance_km = Column(Float, nullable=False)
    availability_score = Column(Float, nullable=False)
    response_probability = Column(Float, nullable=False)
    
    rank = Column(Integer, nullable=False)
    is_notified = Column(Boolean, default=False, nullable=False)
    response_status = Column(String(50), default="PENDING", nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
