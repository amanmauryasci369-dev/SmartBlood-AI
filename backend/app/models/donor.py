from datetime import datetime, timezone, date
from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, Boolean
from app.core.database import Base


class DonorProfile(Base):
    __tablename__ = "donor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    blood_group = Column(String, nullable=False, index=True)
    last_donation_date = Column(Date, nullable=True)
    is_eligible = Column(Boolean, default=True, nullable=False)
    total_donations = Column(Integer, default=0, nullable=False)
    
    # Anonymized public identifier so donor identity is never leaked in search queries (Rule 8)
    public_donor_tag = Column(String, unique=True, index=True, nullable=False)
    
    # Emergency on-call opt-in status
    emergency_donor_opt_in = Column(Boolean, default=False, nullable=False)
    preferred_district = Column(String, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
