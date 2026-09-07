from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.config import UserRole
from app.core.database import get_db
from app.core.deps import get_current_user, require_roles
from app.models.facility import BloodBank, Hospital
from app.models.user import User
from app.schemas.facility import (
    BloodBankCreate,
    BloodBankResponse,
    HospitalCreate,
    HospitalResponse
)

router = APIRouter()


@router.get("/blood-banks", response_model=List[BloodBankResponse])
def list_blood_banks(
    district: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List blood banks, optionally filtered by district."""
    query = db.query(BloodBank).filter(BloodBank.is_active == True)
    if district:
        query = query.filter(BloodBank.district.ilike(f"%{district}%"))
    return query.all()


@router.post("/blood-banks", response_model=BloodBankResponse, status_code=status.HTTP_201_CREATED)
def create_blood_bank(
    bank_in: BloodBankCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    """Register a new blood bank facility (Admin only)."""
    existing = db.query(BloodBank).filter(BloodBank.license_number == bank_in.license_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Blood bank with this license number already exists."
        )
    bank = BloodBank(**bank_in.model_dump())
    db.add(bank)
    db.commit()
    db.refresh(bank)
    return bank


@router.get("/hospitals", response_model=List[HospitalResponse])
def list_hospitals(
    district: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List hospitals, optionally filtered by district."""
    query = db.query(Hospital).filter(Hospital.is_active == True)
    if district:
        query = query.filter(Hospital.district.ilike(f"%{district}%"))
    return query.all()


@router.post("/hospitals", response_model=HospitalResponse, status_code=status.HTTP_201_CREATED)
def create_hospital(
    hospital_in: HospitalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.ADMIN]))
):
    """Register a new hospital facility (Admin only)."""
    existing = db.query(Hospital).filter(Hospital.license_number == hospital_in.license_number).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hospital with this license number already exists."
        )
    hospital = Hospital(**hospital_in.model_dump())
    db.add(hospital)
    db.commit()
    db.refresh(hospital)
    return hospital
