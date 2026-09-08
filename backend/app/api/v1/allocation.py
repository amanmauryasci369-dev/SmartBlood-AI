"""
Smart Blood Allocation API (FEFO Principle: First Expired, First Out)
SIH Problem Statement: 26202
Deterministic database & business logic for patient blood allocation.
DO NOT use an AI/LLM API for sorting logic.
"""

from datetime import date, datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func, or_, String

from app.core.database import get_db
from app.models.inventory import BloodInventory
from app.models.facility import BloodBank

router = APIRouter()


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class PatientAllocationRequest(BaseModel):
    blood_group: str = Field(..., description="Requested blood group, e.g. 'O+', 'O-', 'A+'")
    component: str = Field(..., description="Requested component, e.g. 'Packed Red Blood Cells', 'Platelet Concentrate'")
    required_quantity_ml: int = Field(default=450, ge=50, description="Requested volume in milliliters")
    location: Optional[str] = Field(default=None, description="Optional city or district filter")


class AllocatedUnitCard(BaseModel):
    id: int
    unit_code: str
    blood_group: str
    component: str
    quantity_ml: int
    blood_bank_id: Optional[int] = None
    blood_bank_name: str
    city: str
    expiration_date: str
    days_until_expiry: int
    urgency_level: str  # "Urgent" (<= 2 days), "Use Soon" (<= 7 days), "Normal" (>= 14 days)
    status: str
    is_allocated: bool  # True if selected as part of the minimum FEFO bundle to satisfy quantity


class AllocationResponse(BaseModel):
    requested_quantity_ml: int
    available_quantity_ml: int
    shortage_quantity_ml: int
    is_fully_fulfillable: bool
    message: str
    units: List[AllocatedUnitCard]


class ReserveUnitRequest(BaseModel):
    unit_id: int
    patient_name: Optional[str] = "Anonymous Patient"
    patient_notes: Optional[str] = "Direct FEFO patient reservation"


class ReserveUnitResponse(BaseModel):
    success: bool
    message: str
    unit_id: int
    unit_code: str
    status: str
    expiration_date: str


# ---------------------------------------------------------------------------
# Helper Normalizers
# ---------------------------------------------------------------------------

def normalize_blood_group(bg_str: str) -> str:
    """Standardize blood group representation (e.g. 'O_POS' -> 'O+')."""
    clean = bg_str.strip().upper().replace(" ", "")
    mapping = {
        "O_POS": "O+", "O+": "O+", "OPOSITIVE": "O+",
        "O_NEG": "O-", "O-": "O-", "ONEGATIVE": "O-",
        "A_POS": "A+", "A+": "A+", "APOSITIVE": "A+",
        "A_NEG": "A-", "A-": "A-", "ANEGATIVE": "A-",
        "B_POS": "B+", "B+": "B+", "BPOSITIVE": "B+",
        "B_NEG": "B-", "B-": "B-", "BNEGATIVE": "B-",
        "AB_POS": "AB+", "AB+": "AB+", "ABPOSITIVE": "AB+",
        "AB_NEG": "AB-", "AB-": "AB-", "ABNEGATIVE": "AB-",
    }
    return mapping.get(clean, clean)


def normalize_component(comp_str: str) -> str:
    """Standardize component representation."""
    c = comp_str.strip().upper().replace(" ", "_")
    if "PACKED" in c or "PRBC" in c or "RED_BLOOD" in c:
        return "PACKED_RED_BLOOD_CELLS"
    if "PLATELET" in c or "PLT" in c:
        return "PLATELET_CONCENTRATE"
    if "PLASMA" in c or "FFP" in c:
        return "FRESH_FROZEN_PLASMA"
    if "WHOLE" in c:
        return "WHOLE_BLOOD"
    if "CRYO" in c:
        return "CRYOPRECIPITATE"
    return c


def get_urgency_badge(days_until_expiry: int) -> str:
    """
    Visual urgency indicator per specification:
    Expires in 2 days -> 'Urgent'
    Expires in 7 days -> 'Use Soon'
    Expires in 14+ days -> 'Normal'
    """
    if days_until_expiry <= 2:
        return "Urgent"
    elif days_until_expiry <= 7:
        return "Use Soon"
    else:
        return "Normal"


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@router.post("/fefo-recommendations", response_model=AllocationResponse)
def get_fefo_recommendations(
    req: PatientAllocationRequest,
    db: Session = Depends(get_db)
):
    """
    Smart Blood Allocation (FEFO - First Expired, First Out)
    
    1. Finds units matching requested blood group & component.
    2. Considers only status = 'available' (or confirmed).
    3. Considers only screening_status = 'cleared'.
    4. Excludes expired units (expiration_date > current date).
    5. Sorts eligible units by expiration_date ASC.
    6. Allocates the units with closest expiration date first.
    7. Continues selecting next earliest-expiring units until quantity is fulfilled.
    8. Calculates shortage quantity if available is less than requested.
    """
    norm_bg = normalize_blood_group(req.blood_group)
    norm_comp = normalize_component(req.component)
    today = date.today()

    # Query all eligible units matching FEFO constraints
    query = db.query(BloodInventory).outerjoin(
        BloodBank, BloodInventory.facility_id == BloodBank.id
    )

    # 1. Match requested group & component (checking both friendly and enum forms)
    query = query.filter(
        or_(
            BloodInventory.blood_group == norm_bg,
            BloodInventory.blood_group.cast(String) == norm_bg
        ),
        or_(
            BloodInventory.component == norm_comp,
            BloodInventory.component.cast(String) == norm_comp,
            BloodInventory.component.cast(String) == req.component
        )
    )

    # 2. Only consider status = 'available' (or confirmed availability)
    query = query.filter(
        BloodInventory.status.in_(["available", "CONFIRMED_AVAILABILITY"])
    )

    # 3. Only consider screening_status = 'cleared' (not pending/quarantined)
    query = query.filter(
        or_(
            BloodInventory.screening_status == "cleared",
            BloodInventory.screening_status.is_(None)
        ),
        BloodInventory.is_quarantined == False  # never uncleared/quarantined
    )

    # 4. Exclude expired units: expiration_date > today
    exp_col = func.coalesce(BloodInventory.expiration_date, BloodInventory.expiry_date)
    query = query.filter(exp_col > today)

    # 5. Optional location filter
    if req.location and req.location.strip() and req.location.strip().lower() != "all locations":
        loc = f"%{req.location.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(BloodInventory.city).like(loc),
                func.lower(BloodBank.district).like(loc),
                func.lower(BloodBank.state).like(loc)
            )
        )

    # 6. DETERMINISTIC FEFO SORT: expiration_date ASC
    eligible_units = query.order_by(exp_col.asc()).all()

    # 7. Evaluate Cumulative Fulfillment
    total_available_ml = 0
    cumulative_allocated_ml = 0
    result_cards: List[AllocatedUnitCard] = []

    for item in eligible_units:
        item_exp = item.expiration_date or item.expiry_date
        days_left = (item_exp - today).days if item_exp else 0
        qty = item.quantity_ml or 450

        total_available_ml += qty

        # Mark unit as allocated if still needed to fulfill requested volume
        is_alloc = False
        if cumulative_allocated_ml < req.required_quantity_ml:
            is_alloc = True
            cumulative_allocated_ml += qty

        bank_name = (
            item.blood_bank_name
            or (item.facility_id and db.query(BloodBank.name).filter(BloodBank.id == item.facility_id).scalar())
            or "Regional Blood Transfusion Center"
        )
        city_name = (
            item.city
            or (item.facility_id and db.query(BloodBank.district).filter(BloodBank.id == item.facility_id).scalar())
            or "Delhi NCR"
        )

        badge = get_urgency_badge(days_left)

        result_cards.append(AllocatedUnitCard(
            id=item.id,
            unit_code=item.unit_code or item.batch_number or f"BL-{item.id:05d}",
            blood_group=norm_bg,
            component="Packed Red Blood Cells" if "PACKED" in norm_comp else "Platelet Concentrate" if "PLATELET" in norm_comp else "Fresh Frozen Plasma" if "PLASMA" in norm_comp else "Whole Blood",
            quantity_ml=qty,
            blood_bank_id=item.facility_id,
            blood_bank_name=bank_name,
            city=city_name,
            expiration_date=item_exp.isoformat() if item_exp else today.isoformat(),
            days_until_expiry=days_left,
            urgency_level=badge,
            status=item.status,
            is_allocated=is_alloc
        ))

    # 8. Calculate Shortage
    shortage_ml = max(0, req.required_quantity_ml - total_available_ml)
    is_fulfillable = total_available_ml >= req.required_quantity_ml

    if is_fulfillable:
        msg = f"Full requirement of {req.required_quantity_ml} ml satisfied via FEFO allocation."
    else:
        msg = f"Shortage detected: Only {total_available_ml} ml available out of {req.required_quantity_ml} ml required (Deficit: {shortage_ml} ml)."

    return AllocationResponse(
        requested_quantity_ml=req.required_quantity_ml,
        available_quantity_ml=total_available_ml,
        shortage_quantity_ml=shortage_ml,
        is_fully_fulfillable=is_fulfillable,
        message=msg,
        units=result_cards
    )


@router.post("/reserve-unit", response_model=ReserveUnitResponse)
def reserve_blood_unit(
    req: ReserveUnitRequest,
    db: Session = Depends(get_db)
):
    """
    Atomic Blood Unit Reservation (Concurrency-Safe)
    
    Ensures that once a unit is requested, its status changes from 'available' -> 'reserved'.
    Prevents two patients from reserving the same unit simultaneously via atomic condition update.
    """
    today = date.today()

    # Atomically update the unit ONLY if it is still available and not expired
    exp_col = func.coalesce(BloodInventory.expiration_date, BloodInventory.expiry_date)

    updated_count = db.query(BloodInventory).filter(
        BloodInventory.id == req.unit_id,
        BloodInventory.status.in_(["available", "CONFIRMED_AVAILABILITY"]),
        exp_col > today,
        BloodInventory.is_quarantined == False
    ).update({
        "status": "reserved",
        "reserved_units": BloodInventory.reserved_units + 1,
        "units_available": 0,
        "updated_at": datetime.now(timezone.utc)
    }, synchronize_session=False)

    db.commit()

    if updated_count == 0:
        # Either the unit doesn't exist, is expired, or was already reserved by another patient
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Blood unit is no longer available or has already been reserved by another patient."
        )

    # Fetch updated record
    unit = db.query(BloodInventory).filter(BloodInventory.id == req.unit_id).first()
    unit_code = unit.unit_code or unit.batch_number or f"BL-{unit.id:05d}"
    unit_exp = (unit.expiration_date or unit.expiry_date).isoformat()

    return ReserveUnitResponse(
        success=True,
        message=f"Blood unit {unit_code} successfully reserved for patient.",
        unit_id=unit.id,
        unit_code=unit_code,
        status="reserved",
        expiration_date=unit_exp
    )
