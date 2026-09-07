from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
from app.core.config import BloodGroup, ComponentType


class EmergencyRequestCreate(BaseModel):
    hospital_id: int
    blood_group: BloodGroup
    component: ComponentType
    units_required: int = Field(..., ge=1, le=50)
    urgency_level: str = "CRITICAL_IMMEDIATE"  # CRITICAL_IMMEDIATE, URGENT_UNDER_4H, ELECTIVE
    clinical_notes: Optional[str] = None


class FacilityRecommendation(BaseModel):
    rank: int
    blood_bank_id: int
    blood_bank_name: str
    district: str
    distance_km: float
    estimated_transit_mins: int
    confirmed_units: int
    reported_units: int
    cold_chain_verified: bool
    shelf_life_status: str
    overall_match_score: float
    explanation: str
    recommended_action: str


class EmergencySOSResponse(BaseModel):
    emergency_request_id: int
    hospital_id: int
    blood_group: BloodGroup
    component: ComponentType
    units_required: int
    urgency_level: str
    status: str
    recommendations: List[FacilityRecommendation]
    clinical_decision_support_disclaimer: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransferAcceptRequest(BaseModel):
    selected_blood_bank_id: int
    allocated_units: int
    notes: Optional[str] = None


class TransferLogResponse(BaseModel):
    id: int
    emergency_request_id: Optional[int] = None
    source_bank_id: int
    destination_hospital_id: int
    blood_group: BloodGroup
    component: ComponentType
    units: int
    transfer_reason: str
    distance_km: float
    estimated_transit_mins: int
    status: str
    dispatch_token: str
    created_at: datetime
    dispatched_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
