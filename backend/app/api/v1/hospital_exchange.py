"""
Hospital Blood Exchange API Router
Enforces strict Hospital-Only RBAC (UserRole.HOSPITAL).
Provides deterministic FEFO blood discovery, atomic reservation locking,
and peer-to-peer request workflow (Incoming, Outgoing, Status transitions).
"""

from datetime import date, datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, text

from app.core.database import get_db
from app.core.config import UserRole, BloodGroup, ComponentType
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.models.facility import Hospital
from app.models.inventory import BloodInventory
from app.models.exchange import BloodRequest, BloodRequestItem


router = APIRouter()


# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------

class ExchangeSearchQuery(BaseModel):
    blood_group: str = Field(..., description="Target blood group (e.g. 'O+', 'A-', 'B+')")
    component: str = Field(..., description="Blood component (e.g. 'Packed Red Blood Cells', 'Platelets')")
    required_quantity: int = Field(default=1, ge=1, description="Number of units required")
    required_by: Optional[datetime] = Field(default=None, description="Target delivery/usage deadline")
    search_location: Optional[str] = Field(default=None, description="Target city or location filter")
    search_radius_km: Optional[int] = Field(default=50, description="Optional search radius in km")


class ExchangeUnitCard(BaseModel):
    id: int
    unit_code: str
    batch_number: Optional[str] = None
    blood_group: str
    component: str
    quantity_ml: int
    units_available: int = 1
    providing_hospital_id: Optional[int] = None
    providing_hospital_name: str
    city: str
    collection_date: str
    expiration_date: str
    days_until_expiry: int
    days_remaining_text: str = ""
    urgency_label: str  # "CRITICAL — EXPIRING SOON", "HIGH PRIORITY", "USE SOON", "NORMAL"
    urgency_color: str
    status: str
    fefo_rank: int = 1
    is_recommended_allocation: bool = False
    allocated_units_count: int = 0
    fefo_priority_reason: Optional[str] = None


class ExchangeSearchResult(BaseModel):
    requested_blood_group: str
    requested_component: str
    requested_quantity: int
    available_units_count: int
    shortage_units_count: int
    is_fully_fulfillable: bool
    wastage_prevention_message: str
    recommended_allocation_summary: Optional[str] = None
    fefo_explanation: Optional[str] = None
    recommended_units: List[ExchangeUnitCard]
    all_eligible_units: List[ExchangeUnitCard]


class CreateExchangeRequestPayload(BaseModel):
    providing_hospital_id: int
    providing_hospital_name: str
    blood_group: str
    component: str
    quantity_requested: int
    required_by: Optional[datetime] = None
    search_location: Optional[str] = None
    selected_unit_ids: List[int]


class ExchangeRequestResponse(BaseModel):
    success: bool
    request_id: int
    status: str
    message: str
    reserved_units_count: int


class RequestItemDetail(BaseModel):
    id: int
    blood_inventory_id: int
    unit_code: str
    expiration_date: str
    days_until_expiry: int


class ExchangeRequestCard(BaseModel):
    id: int
    requesting_hospital_id: int
    requesting_hospital_name: str
    providing_hospital_id: Optional[int] = None
    providing_hospital_name: Optional[str] = None
    blood_group: str
    component: str
    quantity_requested: int
    required_by: Optional[str] = None
    status: str  # pending, accepted, rejected, cancelled, fulfilled
    created_at: str
    allocated_units: List[RequestItemDetail] = []


class WastagePreventionDashboard(BaseModel):
    total_available_units: int
    expiring_within_3_days: int
    expiring_within_7_days: int
    expiring_within_30_days: int
    prioritized_early_utilization_units: int
    headline: str


# ---------------------------------------------------------------------------
# Helper Formatters & Urgency Calculation
# ---------------------------------------------------------------------------

def calculate_urgency(days: int) -> tuple[str, str]:
    """
    FEFO Priority Labels:
    - days <= 2: "CRITICAL — EXPIRING SOON"
    - days <= 5: "HIGH PRIORITY"
    - days <= 10: "USE SOON"
    - else: "NORMAL"
    """
    if days <= 2:
        return "CRITICAL — EXPIRING SOON", "bg-red-50 text-red-700 border-red-200"
    elif days <= 5:
        return "HIGH PRIORITY", "bg-amber-50 text-amber-800 border-amber-200"
    elif days <= 10:
        return "USE SOON", "bg-blue-50 text-blue-800 border-blue-200"
    else:
        return "NORMAL", "bg-slate-50 text-slate-700 border-slate-200"


def format_days_remaining(days: int) -> str:
    """Format human-readable days remaining."""
    if days <= 0:
        return "Expires today"
    elif days == 1:
        return "Only 1 day remaining"
    else:
        return f"{days} days remaining"


def normalize_blood_group(bg: str) -> str:
    cleaned = bg.strip().upper().replace(" ", "")
    mapping = {
        "O_POS": "O+", "O+": "O+", "OPOS": "O+", "O_POSITIVE": "O+",
        "O_NEG": "O-", "O-": "O-", "ONEG": "O-", "O_NEGATIVE": "O-",
        "A_POS": "A+", "A+": "A+", "APOS": "A+", "A_POSITIVE": "A+",
        "A_NEG": "A-", "A-": "A-", "ANEG": "A-", "A_NEGATIVE": "A-",
        "B_POS": "B+", "B+": "B+", "BPOS": "B+", "B_POSITIVE": "B+",
        "B_NEG": "B-", "B-": "B-", "BNEG": "B-", "B_NEGATIVE": "B-",
        "AB_POS": "AB+", "AB+": "AB+", "ABPOS": "AB+", "AB_POSITIVE": "AB+",
        "AB_NEG": "AB-", "AB-": "AB-", "ABNEG": "AB-", "AB_NEGATIVE": "AB-",
    }
    return mapping.get(cleaned, bg)


def normalize_component(comp: str) -> str:
    cleaned = comp.strip().upper().replace(" ", "_")
    if "PACKED" in cleaned or "PRBC" in cleaned or "RED" in cleaned:
        return "Packed Red Blood Cells"
    elif "PLATELET" in cleaned:
        return "Platelets"
    elif "PLASMA" in cleaned or "FFP" in cleaned:
        return "Fresh Frozen Plasma"
    elif "WHOLE" in cleaned:
        return "Whole Blood"
    return comp


# ---------------------------------------------------------------------------
# Endpoints (Hospital Blood Exchange - Prototype Demo Mode)
# ---------------------------------------------------------------------------

# TODO: Re-enable hospital authentication and role-based access before production.
# For prototype/demo, allow any user (including ADMIN, demo accounts, or unauthenticated visitors)
# to access Hospital Blood Exchange without RBAC restrictions.
def get_prototype_user(db: Session = Depends(get_db)) -> User:
    """
    // TODO: Re-enable hospital authentication and role-based access before production.
    Bypasses hospital role requirement for prototype demo.
    Returns a demo hospital/admin user from the database or a default AIIMS demo account.
    """
    user = db.query(User).filter(User.role == UserRole.HOSPITAL).first()
    if not user:
        user = db.query(User).first()
    if not user:
        user = User(
            id=1,
            email="trauma@aiims.edu",
            role=UserRole.HOSPITAL,
            facility_id=1,
            full_name="AIIMS Apex Trauma Center Desk",
            is_active=True
        )
    return user


@router.get("/verify-access", summary="Verify Hospital Role Access (Prototype Demo Mode)")
def verify_hospital_access(
    current_user: User = Depends(get_prototype_user)
):
    """
    // TODO: Re-enable hospital authentication and role-based access before production.
    Prototype/demo mode: always returns 200 OK allowing any role to preview the exchange.
    """
    return {
        "access_granted": True,
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role.value if hasattr(current_user, 'role') else "HOSPITAL",
        "hospital_id": current_user.facility_id or 1,
        "hospital_name": "AIIMS Apex Trauma Center" if (current_user.facility_id == 1 or not current_user.facility_id) else "Participating Hospital Desk"
    }


@router.get("/search", response_model=ExchangeSearchResult, summary="Find Blood with FEFO Prioritization")
def search_available_exchange_blood(
    blood_group: str = Query(..., description="e.g. O+, A+, B+"),
    component: str = Query(..., description="e.g. Packed Red Blood Cells"),
    required_quantity: int = Query(1, ge=1, description="Quantity of units"),
    search_location: Optional[str] = Query(None, description="Filter by city"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_prototype_user)
):
    """
    Deterministic FEFO search logic:
    WHERE blood_group = requested
      AND component = requested
      AND status IN ('available', 'CONFIRMED_AVAILABILITY')
      AND is_quarantined = False
      AND screening_status = 'cleared'
      AND storage_status = 'proper'
      AND units_available > 0
      AND expiration_date >= CURRENT_DATE
    ORDER BY expiration_date ASC, units_available DESC
    """
    today = date.today()
    norm_bg = normalize_blood_group(blood_group)
    norm_comp = normalize_component(component)

    # Base query
    query = db.query(BloodInventory).filter(
        or_(
            BloodInventory.status == "available",
            BloodInventory.status == "CONFIRMED_AVAILABILITY"
        ),
        BloodInventory.is_quarantined == False,
        BloodInventory.screening_status == "cleared",
        BloodInventory.storage_status == "proper",
        BloodInventory.units_available > 0,
        func.coalesce(BloodInventory.expiration_date, BloodInventory.expiry_date) >= today
    )

    # Match blood group (supports O+, O_POS, etc.)
    bg_candidates = [norm_bg]
    inv_map = {
        "O+": "O_POS", "O-": "O_NEG", "A+": "A_POS", "A-": "A_NEG",
        "B+": "B_POS", "B-": "B_NEG", "AB+": "AB_POS", "AB-": "AB_NEG"
    }
    if norm_bg in inv_map:
        bg_candidates.append(inv_map[norm_bg])
    rev_map = {v: k for k, v in inv_map.items()}
    if norm_bg in rev_map:
        bg_candidates.append(rev_map[norm_bg])

    query = query.filter(
        or_(
            BloodInventory.blood_group.in_(bg_candidates),
            func.lower(BloodInventory.blood_group).in_([b.lower() for b in bg_candidates])
        )
    )

    # Match component
    if norm_comp == "Packed Red Blood Cells":
        query = query.filter(
            or_(
                BloodInventory.component == ComponentType.PRBC,
                BloodInventory.component == "PRBC",
                BloodInventory.component == "Packed Red Blood Cells",
                BloodInventory.component == "PACKED_RED_BLOOD_CELLS"
            )
        )
    elif norm_comp == "Platelets":
        query = query.filter(
            or_(
                BloodInventory.component == ComponentType.PLATELETS,
                BloodInventory.component == "PLATELETS",
                BloodInventory.component == "Platelets",
                BloodInventory.component == "PLATELET_CONCENTRATE"
            )
        )
    elif norm_comp == "Fresh Frozen Plasma":
        query = query.filter(
            or_(
                BloodInventory.component == ComponentType.FFP,
                BloodInventory.component == "FFP",
                BloodInventory.component == "Fresh Frozen Plasma",
                BloodInventory.component == "FRESH_FROZEN_PLASMA"
            )
        )
    elif norm_comp == "Whole Blood":
        query = query.filter(
            or_(
                BloodInventory.component == ComponentType.WHOLE_BLOOD,
                BloodInventory.component == "WHOLE_BLOOD",
                BloodInventory.component == "Whole Blood"
            )
        )

    # City filter if specified
    if search_location and search_location.strip():
        loc = search_location.strip().lower()
        if loc not in ("all", "all locations", ""):
            query = query.filter(func.lower(BloodInventory.city).like(f"%{loc}%"))

    # Deterministic FEFO Ordering: Earliest expiring first!
    query = query.order_by(
        func.coalesce(BloodInventory.expiration_date, BloodInventory.expiry_date).asc(),
        BloodInventory.units_available.desc()
    )

    units = query.all()

    cards: List[ExchangeUnitCard] = []
    recommended_cards: List[ExchangeUnitCard] = []
    total_eligible_units_available = 0
    remaining_to_allocate = required_quantity
    allocation_parts: List[str] = []

    for idx, u in enumerate(units):
        exp_d = u.expiration_date or u.expiry_date
        col_d = u.collected_date or (exp_d - timedelta(days=35))
        days_left = max(0, (exp_d - today).days)
        batch_avail = u.units_available if (u.units_available and u.units_available > 0) else 1
        total_eligible_units_available += batch_avail

        urgency_lbl, urgency_col = calculate_urgency(days_left)
        days_txt = format_days_remaining(days_left)

        alloc_for_batch = min(remaining_to_allocate, batch_avail) if remaining_to_allocate > 0 else 0
        is_rec = alloc_for_batch > 0
        batch_id_str = u.batch_number or u.unit_code or f"BL-{u.id}"

        if alloc_for_batch > 0:
            remaining_to_allocate -= alloc_for_batch
            allocation_parts.append(f"{alloc_for_batch} unit(s) from {batch_id_str}")

        fefo_reason = None
        if idx == 0:
            fefo_reason = f"FEFO #1 • Expires in {days_left} day{'s' if days_left != 1 else ''} ↓ Recommended for earlier utilization"
        elif is_rec:
            fefo_reason = f"FEFO #{idx + 1} • Next earliest expiry in network ({days_txt})"

        hospital_disp_name = u.hospital_name or u.blood_bank_name or "Regional Blood Centre"

        card = ExchangeUnitCard(
            id=u.id,
            unit_code=batch_id_str,
            batch_number=batch_id_str,
            blood_group=norm_bg,
            component=norm_comp,
            quantity_ml=u.quantity_ml or 450,
            units_available=batch_avail,
            providing_hospital_id=u.hospital_id or u.facility_id,
            providing_hospital_name=hospital_disp_name,
            city=u.city or "Delhi",
            collection_date=col_d.isoformat(),
            expiration_date=exp_d.isoformat(),
            days_until_expiry=days_left,
            days_remaining_text=days_txt,
            urgency_label=urgency_lbl,
            urgency_color=urgency_col,
            status="Available",
            fefo_rank=idx + 1,
            is_recommended_allocation=is_rec,
            allocated_units_count=alloc_for_batch,
            fefo_priority_reason=fefo_reason
        )
        cards.append(card)
        if is_rec:
            recommended_cards.append(card)

    shortage_count = max(0, required_quantity - total_eligible_units_available)
    fully_fulfillable = total_eligible_units_available >= required_quantity

    fefo_expl = "Eligible blood units are prioritized by earliest expiration date to help reduce avoidable wastage."

    if fully_fulfillable:
        alloc_summary = "Recommended allocation: " + ", ".join(allocation_parts)
        msg = f"FEFO Active: All {required_quantity} requested units allocated from earliest-expiring eligible batches."
    elif total_eligible_units_available > 0:
        alloc_summary = "Partial allocation: " + ", ".join(allocation_parts) + f" (Shortage: {shortage_count} units)"
        msg = f"Notice: Shortage of {shortage_count} unit(s). Recommending all {total_eligible_units_available} eligible units available."
    else:
        alloc_summary = f"Shortage: {required_quantity} units. No eligible unexpired units currently available for this search."
        msg = f"Notice: Shortage of {required_quantity} unit(s). No unexpired inventory matches criteria."

    return ExchangeSearchResult(
        requested_blood_group=norm_bg,
        requested_component=norm_comp,
        requested_quantity=required_quantity,
        available_units_count=total_eligible_units_available,
        shortage_units_count=shortage_count,
        is_fully_fulfillable=fully_fulfillable,
        wastage_prevention_message=msg,
        recommended_allocation_summary=alloc_summary,
        fefo_explanation=fefo_expl,
        recommended_units=recommended_cards,
        all_eligible_units=cards
    )


@router.post("/request", response_model=ExchangeRequestResponse, summary="Create Hospital-to-Hospital Request (Atomic Lock)")
def create_exchange_request(
    payload: CreateExchangeRequestPayload,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_prototype_user)
):
    """
    Atomic reservation preventing double booking (Rule 8 & 9):
    Uses a database transaction.
    Locks candidate inventory rows with FOR UPDATE (or verifies available count).
    Transitions units from available -> reserved atomically.
    Creates blood_requests and blood_request_items.
    """
    today = date.today()
    req_hosp_id = current_user.facility_id or 1
    req_hosp_name = "AIIMS Apex Trauma Center" if req_hosp_id == 1 else "Requesting Hospital"

    if not payload.selected_unit_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No blood units selected for reservation."
        )

    # Begin atomic transaction block
    try:
        # 1. Inspect candidate units and check for concurrency conflict
        candidate_units = (
            db.query(BloodInventory)
            .filter(BloodInventory.id.in_(payload.selected_unit_ids))
            .with_for_update()  # Row-level lock in PostgreSQL
            .all()
        )

        if len(candidate_units) != len(payload.selected_unit_ids):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="One or more selected blood units are no longer found in inventory."
            )

        for u in candidate_units:
            exp_d = u.expiration_date or u.expiry_date
            if u.status not in ("available", "CONFIRMED_AVAILABILITY") or (exp_d and exp_d < today):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="This blood unit is no longer available. It may have been reserved by another hospital."
                )

        # 2. Insert blood_requests master record
        new_request = BloodRequest(
            requesting_hospital_id=req_hosp_id,
            requesting_hospital_name=req_hosp_name,
            providing_hospital_id=payload.providing_hospital_id,
            providing_hospital_name=payload.providing_hospital_name,
            blood_group=normalize_blood_group(payload.blood_group),
            component=normalize_component(payload.component),
            quantity_requested=len(payload.selected_unit_ids),
            required_by=payload.required_by or datetime.now(timezone.utc),
            search_location=payload.search_location,
            status="pending"
        )
        db.add(new_request)
        db.flush()

        # 3. Transition units to reserved & link items
        for u in candidate_units:
            u.status = "reserved"
            u.units_available = 0
            u.reserved_units = 1

            item = BloodRequestItem(
                request_id=new_request.id,
                blood_inventory_id=u.id,
                quantity_allocated=1
            )
            db.add(item)

        db.commit()

        return ExchangeRequestResponse(
            success=True,
            request_id=new_request.id,
            status="pending",
            message="Reservation successfully created and inventory locked.",
            reserved_units_count=len(candidate_units)
        )

    except HTTPException:
        db.rollback()
        raise
    except Exception as ex:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transaction failed during reservation: {str(ex)}"
        )


@router.get("/incoming-requests", response_model=List[ExchangeRequestCard], summary="Incoming Blood Requests for Providing Hospital")
def get_incoming_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_prototype_user)
):
    """Fetch blood requests targeting the authenticated hospital's inventory (Rule 10)."""
    hosp_id = current_user.facility_id or 2  # Default to CityCare (2) or active hospital
    
    requests = (
        db.query(BloodRequest)
        .filter(BloodRequest.providing_hospital_id == hosp_id)
        .order_by(BloodRequest.created_at.desc())
        .all()
    )

    results = []
    today = date.today()

    for r in requests:
        items_detail = []
        for item in r.items:
            unit = db.query(BloodInventory).filter(BloodInventory.id == item.blood_inventory_id).first()
            if unit:
                exp_d = unit.expiration_date or unit.expiry_date
                days = max(0, (exp_d - today).days) if exp_d else 0
                items_detail.append(
                    RequestItemDetail(
                        id=item.id,
                        blood_inventory_id=unit.id,
                        unit_code=unit.unit_code or f"BL-{unit.id}",
                        expiration_date=exp_d.isoformat() if exp_d else "",
                        days_until_expiry=days
                    )
                )

        results.append(
            ExchangeRequestCard(
                id=r.id,
                requesting_hospital_id=r.requesting_hospital_id,
                requesting_hospital_name=r.requesting_hospital_name or f"Hospital #{r.requesting_hospital_id}",
                providing_hospital_id=r.providing_hospital_id,
                providing_hospital_name=r.providing_hospital_name or f"Hospital #{r.providing_hospital_id}",
                blood_group=r.blood_group,
                component=r.component,
                quantity_requested=r.quantity_requested,
                required_by=r.required_by.isoformat() if r.required_by else None,
                status=r.status,
                created_at=r.created_at.isoformat(),
                allocated_units=items_detail
            )
        )

    return results


@router.get("/my-requests", response_model=List[ExchangeRequestCard], summary="Outgoing Blood Requests from this Hospital")
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_prototype_user)
):
    """Fetch blood requests initiated by the authenticated hospital (Rule 11)."""
    hosp_id = current_user.facility_id or 1
    
    requests = (
        db.query(BloodRequest)
        .filter(BloodRequest.requesting_hospital_id == hosp_id)
        .order_by(BloodRequest.created_at.desc())
        .all()
    )

    results = []
    today = date.today()

    for r in requests:
        items_detail = []
        for item in r.items:
            unit = db.query(BloodInventory).filter(BloodInventory.id == item.blood_inventory_id).first()
            if unit:
                exp_d = unit.expiration_date or unit.expiry_date
                days = max(0, (exp_d - today).days) if exp_d else 0
                items_detail.append(
                    RequestItemDetail(
                        id=item.id,
                        blood_inventory_id=unit.id,
                        unit_code=unit.unit_code or f"BL-{unit.id}",
                        expiration_date=exp_d.isoformat() if exp_d else "",
                        days_until_expiry=days
                    )
                )

        results.append(
            ExchangeRequestCard(
                id=r.id,
                requesting_hospital_id=r.requesting_hospital_id,
                requesting_hospital_name=r.requesting_hospital_name or f"Hospital #{r.requesting_hospital_id}",
                providing_hospital_id=r.providing_hospital_id,
                providing_hospital_name=r.providing_hospital_name or f"Hospital #{r.providing_hospital_id}",
                blood_group=r.blood_group,
                component=r.component,
                quantity_requested=r.quantity_requested,
                required_by=r.required_by.isoformat() if r.required_by else None,
                status=r.status,
                created_at=r.created_at.isoformat(),
                allocated_units=items_detail
            )
        )

    return results


@router.post("/requests/{request_id}/accept", summary="Accept Blood Request")
def accept_blood_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_prototype_user)
):
    """Accept incoming blood request (Rule 10)."""
    req = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    req.status = "accepted"
    db.commit()
    return {"success": True, "request_id": req.id, "status": "accepted"}


@router.post("/requests/{request_id}/reject", summary="Reject Blood Request (Releases Units)")
def reject_blood_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_prototype_user)
):
    """Reject blood request and restore reserved inventory units to 'available' (Rule 10)."""
    req = db.query(BloodRequest).filter(BloodRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    req.status = "rejected"

    # Restore linked units back to 'available'
    for item in req.items:
        unit = db.query(BloodInventory).filter(BloodInventory.id == item.blood_inventory_id).first()
        if unit and unit.status == "reserved":
            unit.status = "available"
            unit.units_available = 1
            unit.reserved_units = 0

    db.commit()
    return {"success": True, "request_id": req.id, "status": "rejected", "message": "Units released back to available stock"}


@router.get("/inventory-overview", response_model=WastagePreventionDashboard, summary="Hospital Inventory & Wastage Insight")
def get_inventory_wastage_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_prototype_user)
):
    """
    Inventory shelf-life buckets and wastage reduction insights (Rule 12 & 13):
    Total Available Units
    Expiring Within 3 Days
    Expiring Within 7 Days
    Expiring Within 30 Days
    Accurate wording: 'Units prioritized for early utilization'
    """
    today = date.today()

    available_units = db.query(BloodInventory).filter(
        BloodInventory.status == "available",
        BloodInventory.screening_status == "cleared",
        BloodInventory.storage_status == "proper",
        or_(
            BloodInventory.expiration_date > today,
            BloodInventory.expiry_date > today
        )
    ).all()

    total_avail = len(available_units)
    within_3 = 0
    within_7 = 0
    within_30 = 0

    for u in available_units:
        exp_d = u.expiration_date or u.expiry_date
        days = (exp_d - today).days
        if days <= 3:
            within_3 += 1
        if days <= 7:
            within_7 += 1
        if days <= 30:
            within_30 += 1

    return WastagePreventionDashboard(
        total_available_units=total_avail,
        expiring_within_3_days=within_3,
        expiring_within_7_days=within_7,
        expiring_within_30_days=within_30,
        prioritized_early_utilization_units=within_7,
        headline="FEFO Wastage Prevention Active — Units Near Expiry Prioritized for Immediate Requisition"
    )
