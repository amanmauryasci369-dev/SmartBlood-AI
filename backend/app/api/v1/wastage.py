from datetime import date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.wastage_engine import WastageEngine


router = APIRouter()


class DiscardRecordCreate(BaseModel):
    blood_bank_id: int
    blood_group: str
    component: str
    quantity: int
    reason: str  # EXPIRY, TTI_REACTIVE, DAMAGED, QUALITY_CONTROL, OTHER
    reference_inventory_id: Optional[int] = None
    notes: Optional[str] = None


@router.get("/wastage/analytics", summary="Get longitudinal blood utilization and wastage analytics")
def get_wastage_analytics(
    blood_bank_id: Optional[int] = Query(None, description="Filter by blood bank"),
    state: Optional[str] = Query(None, description="Filter by State"),
    district: Optional[str] = Query(None, description="Filter by District"),
    blood_group: Optional[str] = Query(None, description="Filter by Blood Group"),
    component: Optional[str] = Query(None, description="Filter by Component"),
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    db: Session = Depends(get_db)
):
    """
    Returns comprehensive utilization rate, wastage rate, discard reason breakdown,
    and historical trends.
    """
    return WastageEngine.get_wastage_analytics(
        db,
        blood_bank_id=blood_bank_id,
        state=state,
        district=district,
        blood_group=blood_group,
        component=component,
        start_date=start_date,
        end_date=end_date
    )


@router.get("/wastage/recommendations", summary="Get proactive wastage reduction recommendations")
def get_wastage_recommendations(
    blood_bank_id: Optional[int] = Query(None, description="Filter by blood bank"),
    db: Session = Depends(get_db)
):
    """
    Decision support recommendations for inventory approaching expiry
    combining remaining shelf life, demand forecasts, and trauma center absorption.
    """
    return WastageEngine.get_wastage_recommendations(db, blood_bank_id=blood_bank_id)


@router.post("/wastage/record", summary="Log an authorized component discard")
def record_discard_event(
    record_in: DiscardRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Records an authorized discard event with explicit clinical reason.
    Only authorized Blood Bank personnel or Admins may record discards.
    """
    user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if user_role not in ["ADMIN", "BLOOD_BANK"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only authorized blood bank personnel or system administrators can log discard events."
        )

    return WastageEngine.record_discard(
        db,
        blood_bank_id=record_in.blood_bank_id,
        blood_group=record_in.blood_group,
        component=record_in.component,
        quantity=record_in.quantity,
        reason=record_in.reason,
        reference_inventory_id=record_in.reference_inventory_id,
        notes=record_in.notes
    )
