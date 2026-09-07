from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.shelf_life import ComponentShelfLifeRule
from app.services.fefo_service import FEFOService


router = APIRouter()


class ShelfLifeRuleCreate(BaseModel):
    component: str
    storage_method: str
    shelf_life_value: int
    shelf_life_unit: str = "DAYS"
    regulatory_reference: str
    active: bool = True


class ShelfLifeRuleUpdate(BaseModel):
    storage_method: Optional[str] = None
    shelf_life_value: Optional[int] = None
    shelf_life_unit: Optional[str] = None
    regulatory_reference: Optional[str] = None
    active: Optional[bool] = None


@router.get("/inventory/fefo", summary="Get inventory ordered by First-Expire-First-Out (FEFO)")
def get_inventory_fefo(
    blood_bank_id: Optional[int] = Query(None, description="Filter by blood bank facility ID"),
    blood_group: Optional[str] = Query(None, description="Filter by ABO/Rh blood group"),
    component: Optional[str] = Query(None, description="Filter by component type"),
    include_expired: bool = Query(False, description="Whether to include already expired batches"),
    db: Session = Depends(get_db)
):
    """
    Returns blood inventory strictly prioritized by expiry date (earliest first).
    Decision support only.
    """
    return FEFOService.get_fefo_prioritized_inventory(
        db,
        blood_bank_id=blood_bank_id,
        blood_group=blood_group,
        component=component,
        include_expired=include_expired
    )


@router.get("/expiry-risk", summary="Get aggregate expiry-risk dashboard metrics and decision support")
def get_expiry_risk_summary(
    blood_bank_id: Optional[int] = Query(None, description="Filter by blood bank facility ID"),
    db: Session = Depends(get_db)
):
    """
    Returns aggregated expiry risk breakdown by blood group, component, blood bank,
    and days-to-expiry distribution curve.
    """
    return FEFOService.get_expiry_risk_summary(db, blood_bank_id=blood_bank_id)


@router.get("/shelf-life-rules", summary="List regulatory component shelf-life rules")
def list_shelf_life_rules(
    active_only: bool = Query(True, description="Filter only active rules"),
    db: Session = Depends(get_db)
):
    """Returns official regulatory storage standards and shelf life specifications."""
    query = db.query(ComponentShelfLifeRule)
    if active_only:
        query = query.filter(ComponentShelfLifeRule.active == True)
    return query.all()


@router.post("/shelf-life-rules", summary="Create or update component shelf life rule (Admin only)")
def create_or_update_shelf_life_rule(
    rule_in: ShelfLifeRuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Authorized administrators can configure regulatory shelf life standards."""
    if current_user.role.value != "ADMIN" if hasattr(current_user.role, "value") else str(current_user.role) != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system administrators may configure regulatory shelf-life rules."
        )

    existing = db.query(ComponentShelfLifeRule).filter(
        ComponentShelfLifeRule.component == rule_in.component.upper()
    ).first()

    if existing:
        existing.storage_method = rule_in.storage_method
        existing.shelf_life_value = rule_in.shelf_life_value
        existing.shelf_life_unit = rule_in.shelf_life_unit
        existing.regulatory_reference = rule_in.regulatory_reference
        existing.active = rule_in.active
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_rule = ComponentShelfLifeRule(
            component=rule_in.component.upper(),
            storage_method=rule_in.storage_method,
            shelf_life_value=rule_in.shelf_life_value,
            shelf_life_unit=rule_in.shelf_life_unit,
            regulatory_reference=rule_in.regulatory_reference,
            active=rule_in.active
        )
        db.add(new_rule)
        db.commit()
        db.refresh(new_rule)
        return new_rule
