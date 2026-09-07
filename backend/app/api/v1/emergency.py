import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import UserRole, AvailabilityStatus
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.user import User
from app.models.facility import Hospital, BloodBank
from app.models.emergency import EmergencyRequest, TransferLog
from app.models.inventory import BloodInventory
from app.models.audit import AuditLog
from app.services.emergency_routing import generate_emergency_recommendations
from app.schemas.emergency import (
    EmergencyRequestCreate,
    EmergencySOSResponse,
    TransferAcceptRequest,
    TransferLogResponse
)

router = APIRouter()


@router.post("/sos", response_model=EmergencySOSResponse, status_code=status.HTTP_201_CREATED)
def trigger_emergency_sos(
    sos_in: EmergencyRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.HOSPITAL, UserRole.ADMIN]))
):
    """
    Trigger emergency SOS blood coordination workflow.
    Executes real-time multi-criteria spatial matching and returns explainable recommendations.
    """
    hospital = db.query(Hospital).filter(Hospital.id == sos_in.hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Requesting hospital not found.")

    # Create emergency request record
    req = EmergencyRequest(
        hospital_id=hospital.id,
        blood_group=sos_in.blood_group,
        component=sos_in.component,
        units_required=sos_in.units_required,
        urgency_level=sos_in.urgency_level,
        clinical_notes=sos_in.clinical_notes,
        status="RECOMMENDED_ACTION"
    )
    db.add(req)
    db.commit()
    db.refresh(req)

    # Generate multi-criteria AI recommendations with full explainability
    recommendations = generate_emergency_recommendations(
        hospital=hospital,
        blood_group=sos_in.blood_group,
        component=sos_in.component,
        units_required=sos_in.units_required,
        db=db
    )

    # Record Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="EMERGENCY_SOS_TRIGGERED",
        resource_type="EMERGENCY_REQUEST",
        resource_id=str(req.id),
        details=f"SOS triggered for {sos_in.units_required} units of {sos_in.blood_group.value} {sos_in.component.value} with {len(recommendations)} recommendations generated."
    )
    db.add(audit)
    db.commit()

    return EmergencySOSResponse(
        emergency_request_id=req.id,
        hospital_id=hospital.id,
        blood_group=req.blood_group,
        component=req.component,
        units_required=req.units_required,
        urgency_level=req.urgency_level,
        status=req.status,
        recommendations=recommendations,
        clinical_decision_support_disclaimer=(
            "CLINICAL ADVISORY: AI routing outputs are decision-support recommendations. "
            "Verification and patient cross-matching must be conducted by authorized medical officers."
        ),
        created_at=req.created_at
    )


@router.post("/{request_id}/accept", response_model=TransferLogResponse)
def accept_emergency_recommendation(
    request_id: int,
    accept_in: TransferAcceptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.HOSPITAL, UserRole.ADMIN]))
):
    """
    Accept an AI recommendation, reserves the units, and dispatches transit ticket.
    """
    req = db.query(EmergencyRequest).filter(EmergencyRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Emergency request ticket not found.")

    bank = db.query(BloodBank).filter(BloodBank.id == accept_in.selected_blood_bank_id).first()
    if not bank:
        raise HTTPException(status_code=404, detail="Selected blood bank not found.")

    hospital = db.query(Hospital).filter(Hospital.id == req.hospital_id).first()

    from app.services.emergency_routing import calculate_haversine_distance, estimate_transit_time_minutes
    dist = calculate_haversine_distance(hospital.latitude, hospital.longitude, bank.latitude, bank.longitude)
    transit = estimate_transit_time_minutes(dist, is_emergency=True)

    token = f"DISP-{uuid.uuid4().hex[:8].upper()}"

    # Create transfer log
    transfer = TransferLog(
        emergency_request_id=req.id,
        source_bank_id=bank.id,
        destination_hospital_id=hospital.id,
        blood_group=req.blood_group,
        component=req.component,
        units=accept_in.allocated_units,
        transfer_reason="EMERGENCY_SOS_FULFILLMENT",
        distance_km=dist,
        estimated_transit_mins=transit,
        status="DISPATCHED",
        dispatch_token=token,
        dispatched_at=datetime.now(timezone.utc)
    )
    db.add(transfer)

    # Update emergency request status
    req.status = "DISPATCH_CONFIRMED"
    req.allocated_blood_bank_id = bank.id
    req.allocated_units = accept_in.allocated_units
    req.resolved_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(transfer)

    return transfer


@router.get("/active-sos")
def get_active_emergencies(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """List all active or recent emergency requests."""
    return db.query(EmergencyRequest).order_by(EmergencyRequest.created_at.desc()).limit(20).all()


@router.get("/source-ranking", summary="Evaluate multi-source ranking across blood banks, hospitals, and donors")
def get_source_ranking(
    hospital_id: int = 1,
    blood_group: str = "O_NEG",
    component: str = "PRBC",
    units_required: int = 4,
    emergency_level: str = "CRITICAL",
    db: Session = Depends(get_db)
):
    """
    Combines local stock, regional blood banks, peer hospital network,
    masked donors, and ML forecast into a unified ranked source evaluation.
    """
    from app.services.source_ranking_service import IntelligentSourceRankingService
    return IntelligentSourceRankingService.rank_emergency_sources(
        db,
        requesting_hospital_id=hospital_id,
        blood_group=blood_group,
        component=component,
        units_required=units_required,
        emergency_level=emergency_level
    )
