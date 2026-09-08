from datetime import date, datetime
from typing import Optional, List, Dict, Union
from pydantic import BaseModel, Field, ConfigDict
from app.core.config import AvailabilityStatus, BloodGroup, ComponentType


class InventoryItemBase(BaseModel):
    facility_id: int
    blood_group: BloodGroup
    component: ComponentType
    units_available: int = Field(..., ge=0)
    batch_number: str
    collected_date: date
    expiry_date: date
    temperature_celsius: float = 4.0
    is_quarantined: bool = False
    source_tag: str = "DIRECT_BANK_LOG"
    inventory_status: Optional[str] = "DEMO_SIMULATED"
    demo_notice: Optional[str] = "Simulated data for demonstration only"
    critical_threshold: Optional[int] = 5
    days_to_expiry: Optional[int] = None
    expiry_risk: Optional[str] = "LOW"
    stock_source: Optional[str] = "Simulated Demonstration Stock"
    stock_source_url: Optional[str] = "https://eraktkosh.mohfw.gov.in/"
    stock_last_updated: Optional[str] = None


class InventoryItemCreate(InventoryItemBase):
    pass


class InventoryItemResponse(InventoryItemBase):
    id: int
    status: Union[AvailabilityStatus, str]
    last_verified_by_user_id: Optional[int] = None
    verified_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InventoryConfirmRequest(BaseModel):
    units_verified: Optional[int] = None
    temperature_verified_celsius: Optional[float] = None
    notes: Optional[str] = None


class BloodGroupStockCount(BaseModel):
    blood_group: BloodGroup
    reported_units: int
    confirmed_units: int
    expiring_within_48h: int


class StockSummaryResponse(BaseModel):
    total_reported_units: int
    total_confirmed_units: int
    total_expiring_within_48h: int
    breakdown_by_group: List[BloodGroupStockCount]
    compliance_disclosure: str
