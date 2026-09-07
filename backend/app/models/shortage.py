from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from app.core.database import Base


class ShortagePrediction(Base):
    __tablename__ = "shortage_predictions"

    id = Column(Integer, primary_key=True, index=True)
    facility_id = Column(Integer, ForeignKey("blood_banks.id"), nullable=False)
    blood_group = Column(String(10), nullable=False, index=True)
    component = Column(String(50), nullable=False, index=True)
    
    # Quantitative Shortage Formula Attributes
    # Projected Stock = Current + Incoming - Predicted Demand - Expected Expiry Loss
    current_stock = Column(Integer, nullable=False)
    incoming_supply = Column(Integer, default=0, nullable=False)
    predicted_demand = Column(Integer, nullable=False)
    expected_expiry_loss = Column(Integer, default=0, nullable=False)
    projected_stock = Column(Integer, nullable=False)
    
    # Tiers: LOW, MEDIUM, HIGH, CRITICAL
    shortage_risk_tier = Column(String(20), nullable=False, index=True)
    prediction_horizon_days = Column(Integer, default=7, nullable=False)
    recommended_action = Column(Text, nullable=False)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
