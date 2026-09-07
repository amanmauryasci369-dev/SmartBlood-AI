from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.services.hospital_network_service import HospitalNetworkService


router = APIRouter()


class HospitalRequestCreate(BaseModel):
    requesting_hospital_id: int
    blood_group: str
    component: str
    quantity: int
    emergency_level: str = "CRITICAL"  # CRITICAL, HIGH, ROUTINE
    target_hospital_id: Optional[int] = None
    notes: Optional[str] = None
    location: Optional[str] = None


class HospitalRequestAccept(BaseModel):
    accepting_hospital_id: int
    notes: Optional[str] = None


class HospitalRequestReject(BaseModel):
    rejecting_hospital_id: int
    reason: str


class HospitalRequestConfirm(BaseModel):
    notes: Optional[str] = None


class HospitalRequestFulfill(BaseModel):
    notes: Optional[str] = None


class HospitalMessageCreate(BaseModel):
    sender_hospital_id: int
    message: str


@router.post("/hospital-requests", summary="Create a new Hospital-to-Hospital blood request")
def create_hospital_request(
    req_in: HospitalRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Initiates a peer blood requisition across the hospital network."""
    return HospitalNetworkService.create_request(
        db,
        requesting_hospital_id=req_in.requesting_hospital_id,
        blood_group=req_in.blood_group,
        component=req_in.component,
        quantity=req_in.quantity,
        emergency_level=req_in.emergency_level,
        target_hospital_id=req_in.target_hospital_id,
        notes=req_in.notes,
        location=req_in.location,
        user_id=current_user.id
    )


@router.get("/hospital-requests", summary="List Hospital-to-Hospital blood requests")
def list_hospital_requests(
    hospital_id: Optional[int] = Query(None, description="Filter by hospital ID"),
    status: Optional[str] = Query(None, description="Filter by request status"),
    db: Session = Depends(get_db)
):
    """Lists incoming, outgoing, and network-wide hospital requests."""
    return HospitalNetworkService.list_requests(
        db,
        hospital_id=hospital_id,
        status_filter=status
    )


@router.get("/hospital-requests/{id}", summary="Get detailed information for a hospital request")
def get_hospital_request_detail(
    id: int,
    db: Session = Depends(get_db)
):
    """Returns single requisition status with full communication audit thread."""
    req = HospitalNetworkService.get_request_by_id(db, id)
    if not req:
        raise HTTPException(status_code=404, detail="Hospital request not found")
    return req


@router.post("/hospital-requests/{id}/accept", summary="Peer hospital accepts request (moves to VERIFICATION_REQUIRED)")
def accept_hospital_request(
    id: int,
    payload: HospitalRequestAccept,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Accepts requisition and marks state as VERIFICATION_REQUIRED
    pending clinical cross-match testing.
    """
    try:
        return HospitalNetworkService.accept_request(
            db,
            req_id=id,
            accepting_hospital_id=payload.accepting_hospital_id,
            user_id=current_user.id,
            notes=payload.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/hospital-requests/{id}/reject", summary="Peer hospital rejects request with reason")
def reject_hospital_request(
    id: int,
    payload: HospitalRequestReject,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Declines requisition with explicit clinical rationale."""
    try:
        return HospitalNetworkService.reject_request(
            db,
            req_id=id,
            rejecting_hospital_id=payload.rejecting_hospital_id,
            reason=payload.reason,
            user_id=current_user.id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/hospital-requests/{id}/confirm", summary="Confirm clinical cross-match verification (CONFIRMED)")
def confirm_hospital_request_verification(
    id: int,
    payload: HospitalRequestConfirm,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Authorized lab personnel confirms clinical cross-match compatibility,
    enabling dispatch.
    """
    try:
        return HospitalNetworkService.confirm_verification(
            db,
            req_id=id,
            confirming_user_id=current_user.id,
            notes=payload.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/hospital-requests/{id}/fulfill", summary="Mark transfer delivered and fulfilled (FULFILLED)")
def fulfill_hospital_request(
    id: int,
    payload: HospitalRequestFulfill,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Marks requisition fulfilled, updating audit receipts and custody logs."""
    try:
        return HospitalNetworkService.fulfill_request(
            db,
            req_id=id,
            user_id=current_user.id,
            notes=payload.notes
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/hospital-communications/{request_id}", summary="Get message thread for a hospital request")
def get_hospital_communications(
    request_id: int,
    db: Session = Depends(get_db)
):
    """Returns conversation thread and status change audit for a requisition."""
    req = HospitalNetworkService.get_request_by_id(db, request_id)
    if not req:
        raise HTTPException(status_code=404, detail="Hospital request not found")
    return req["messages"]


@router.post("/hospital-communications/{request_id}/message", summary="Send message in hospital coordination thread")
def send_hospital_communication(
    request_id: int,
    payload: HospitalMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Posts a message to the internal coordination thread without exposing donor PII."""
    try:
        return HospitalNetworkService.post_message(
            db,
            req_id=request_id,
            sender_hospital_id=payload.sender_hospital_id,
            message=payload.message,
            user_id=current_user.id
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/hospital-network/overview", summary="Get peer hospital and blood bank resource network overview")
def get_hospital_network_overview(
    db: Session = Depends(get_db)
):
    """
    Returns discovered nearby hospitals, blood banks, and active peer requisitions.
    Distinguishes REPORTED, CONFIRMED, and RESERVED availability.
    """
    return HospitalNetworkService.get_network_overview(db)
