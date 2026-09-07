from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.core.config import BloodGroup, ComponentType, AvailabilityStatus


class BloodSearchQuery(BaseModel):
    blood_group: BloodGroup
    component: ComponentType
    quantity: int = Field(default=1, ge=1, le=50)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_distance_km: float = Field(default=50.0, ge=1.0, le=500.0)
    emergency_level: str = "NORMAL"  # CRITICAL, HIGH, MEDIUM, NORMAL


class BloodSearchResultItem(BaseModel):
    blood_bank_id: int
    blood_bank_name: str
    district: str
    state: str
    blood_group: BloodGroup
    component: ComponentType
    available_units: int
    status: AvailabilityStatus
    distance_km: float
    estimated_transit_minutes: int
    last_updated: str
    cold_chain_verified: bool
    contact_desk: str
    availability_disclaimer: str


class ShortageRiskResponse(BaseModel):
    blood_bank_id: int
    blood_bank_name: str
    blood_group: BloodGroup
    component: ComponentType
    current_stock: int
    incoming_supply: int
    predicted_demand: int
    expected_expiry_loss: int
    projected_stock: int
    shortage_risk_tier: str  # LOW, MEDIUM, HIGH, CRITICAL
    prediction_horizon: str
    recommended_action: str
    calculation_formula: str


class DonorMatchItem(BaseModel):
    rank: int
    donor_id: int
    public_donor_tag: str
    blood_group: BloodGroup
    district: str
    distance_km: float
    is_eligible: bool
    response_probability: float
    overall_match_score: float
    score_breakdown: Dict[str, float]
    contact_proxy_channel: str


class AnomalyReport(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    reason: str
    detected_drop_rate: Optional[float] = None
    historical_baseline_mean: Optional[float] = None
    timestamp: str


class SmartAlertItem(BaseModel):
    id: int
    severity: str  # CRITICAL, WARNING, ATTENTION, OPPORTUNITY
    alert_type: str
    title: str
    description: str
    recommended_action: Optional[str] = None
    confidence: Optional[str] = "HIGH"
    created_at: datetime
    is_resolved: bool

    model_config = ConfigDict(from_attributes=True)


class AIInsightCard(BaseModel):
    id: str
    severity: str  # CRITICAL, WARNING, ATTENTION, OPPORTUNITY
    title: str
    explanation: str
    recommended_action: str
    confidence: str
    timestamp: str
    data_sources_used: List[str]


class AnalyticsTrendData(BaseModel):
    dates: List[str]
    collections: List[int]
    issues: List[int]
    predicted_demand: List[int]
    expiries: List[int]
    blood_group_distribution: Dict[str, int]
