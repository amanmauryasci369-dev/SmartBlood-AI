from datetime import datetime, date, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import AvailabilityStatus, BloodGroup, ComponentType, UserRole
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.models.facility import BloodBank
from app.models.inventory import BloodInventory
from app.models.audit import AuditLog
from app.adapters.eraktkosh_synthetic import ERaktKoshSyntheticAdapter
from app.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemResponse,
    InventoryConfirmRequest,
    StockSummaryResponse,
    BloodGroupStockCount
)

router = APIRouter()
adapter = ERaktKoshSyntheticAdapter()


@router.get("", response_model=List[InventoryItemResponse])
def get_inventory(
    facility_id: Optional[int] = None,
    blood_group: Optional[BloodGroup] = None,
    component: Optional[ComponentType] = None,
    status_filter: Optional[AvailabilityStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve blood inventory with strict status distinction filters."""
    query = db.query(BloodInventory)
    if facility_id:
        query = query.filter(BloodInventory.facility_id == facility_id)
    if blood_group:
        query = query.filter(BloodInventory.blood_group == blood_group)
    if component:
        query = query.filter(BloodInventory.component == component)
    if status_filter:
        query = query.filter(BloodInventory.status == status_filter)
    
    return query.order_by(BloodInventory.expiry_date.asc()).all()


@router.post("", response_model=InventoryItemResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_item(
    item_in: InventoryItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.BLOOD_BANK]))
):
    """Add a direct inventory item log at a blood bank."""
    bank = db.query(BloodBank).filter(BloodBank.id == item_in.facility_id).first()
    if not bank:
        raise HTTPException(status_code=404, detail="Target blood bank facility does not exist.")

    # Check unique batch number
    existing = db.query(BloodInventory).filter(BloodInventory.batch_number == item_in.batch_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="A batch with this batch number already exists.")

    item = BloodInventory(
        **item_in.model_dump(),
        status=AvailabilityStatus.REPORTED  # Starts as reported until laboratory confirmation
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.post("/sync-eraktkosh")
def sync_eraktkosh_synthetic(
    district: Optional[str] = "Central Delhi",
    state: Optional[str] = "Delhi",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.BLOOD_BANK]))
):
    """
    Sync synthetic e-RaktKosh compatible inventory feeds for testing/demonstration.
    Strictly tags ingested stock as REPORTED_AVAILABILITY (Rule 4, 5, 10, 11).
    """
    metadata = adapter.get_adapter_metadata()
    stock_records = adapter.search_regional_stock(state=state, district=district)
    
    synced_count = 0
    for record in stock_records:
        # Ensure facility exists in database
        bank = db.query(BloodBank).filter(BloodBank.license_number == record["facility_identifier"]).first()
        if not bank:
            bank = BloodBank(
                name=record["facility_name"],
                license_number=record["facility_identifier"],
                district=record["district"],
                state=record["state"],
                latitude=28.6250,
                longitude=77.2183,
                contact_number="+91 11 23716441",
                storage_capacity=1000,
                cold_chain_verified=True,
                is_active=True
            )
            db.add(bank)
            db.commit()
            db.refresh(bank)

        # Check if batch exists, or create
        existing = db.query(BloodInventory).filter(BloodInventory.batch_number == record["batch_number"]).first()
        if not existing:
            inv = BloodInventory(
                facility_id=bank.id,
                blood_group=BloodGroup(record["blood_group"]),
                component=ComponentType(record["component"]),
                units_available=record["units_available"],
                batch_number=record["batch_number"],
                status=AvailabilityStatus.REPORTED,  # Marked as REPORTED
                collected_date=date.fromisoformat(record["collected_date"]),
                expiry_date=date.fromisoformat(record["expiry_date"]),
                temperature_celsius=record["temperature_storage_celsius"],
                source_tag=record["data_source"]
            )
            db.add(inv)
            synced_count += 1
            
    db.commit()

    return {
        "status": "COMPLETED",
        "synced_units_count": synced_count,
        "adapter_used": metadata["adapter_name"],
        "data_source": metadata["data_source"],
        "availability_classification": AvailabilityStatus.REPORTED.value,
        "disclaimer": "Data synchronized from synthetic e-RaktKosh compatible generator. Not real-time."
    }


@router.post("/{item_id}/confirm", response_model=InventoryItemResponse)
def confirm_inventory_unit(
    item_id: int,
    confirm_req: Optional[InventoryConfirmRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN, UserRole.BLOOD_BANK]))
):
    """
    Authorized laboratory verification workflow.
    Transitions unit from REPORTED_AVAILABILITY to CONFIRMED_AVAILABILITY.
    """
    item = db.query(BloodInventory).filter(BloodInventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Blood inventory unit not found.")

    if confirm_req and confirm_req.units_verified is not None:
        item.units_available = confirm_req.units_verified
    if confirm_req and confirm_req.temperature_verified_celsius is not None:
        item.temperature_celsius = confirm_req.temperature_verified_celsius

    item.status = AvailabilityStatus.CONFIRMED
    item.last_verified_by_user_id = current_user.id
    item.verified_at = datetime.now(timezone.utc)

    # Record confirmation audit trail
    audit = AuditLog(
        user_id=current_user.id,
        action="INVENTORY_CONFIRMED",
        resource_type="BLOOD_INVENTORY",
        resource_id=str(item.id),
        details=f"Unit batch {item.batch_number} verified and transitioned to CONFIRMED_AVAILABILITY."
    )
    db.add(audit)
    db.commit()
    db.refresh(item)
    return item


@router.get("/summary", response_model=StockSummaryResponse)
def get_stock_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Regional summary distinguishing reported vs confirmed units and expiry urgency."""
    today = date.today()
    in_48h = today + timedelta(days=2)

    total_reported = db.query(func.sum(BloodInventory.units_available)).filter(
        BloodInventory.status == AvailabilityStatus.REPORTED
    ).scalar() or 0

    total_confirmed = db.query(func.sum(BloodInventory.units_available)).filter(
        BloodInventory.status == AvailabilityStatus.CONFIRMED
    ).scalar() or 0

    total_expiring = db.query(func.sum(BloodInventory.units_available)).filter(
        BloodInventory.expiry_date <= in_48h,
        BloodInventory.expiry_date >= today
    ).scalar() or 0

    breakdown = []
    for group in BloodGroup:
        rep = db.query(func.sum(BloodInventory.units_available)).filter(
            BloodInventory.blood_group == group,
            BloodInventory.status == AvailabilityStatus.REPORTED
        ).scalar() or 0

        conf = db.query(func.sum(BloodInventory.units_available)).filter(
            BloodInventory.blood_group == group,
            BloodInventory.status == AvailabilityStatus.CONFIRMED
        ).scalar() or 0

        exp = db.query(func.sum(BloodInventory.units_available)).filter(
            BloodInventory.blood_group == group,
            BloodInventory.expiry_date <= in_48h,
            BloodInventory.expiry_date >= today
        ).scalar() or 0

        breakdown.append(BloodGroupStockCount(
            blood_group=group,
            reported_units=rep,
            confirmed_units=conf,
            expiring_within_48h=exp
        ))

    return StockSummaryResponse(
        total_reported_units=total_reported,
        total_confirmed_units=total_confirmed,
        total_expiring_within_48h=total_expiring,
        breakdown_by_group=breakdown,
        compliance_disclosure="Stock availability distinguishes reported vs confirmed units. Not real-time."
    )
