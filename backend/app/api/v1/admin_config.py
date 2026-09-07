from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.system_config import SystemConfiguration


router = APIRouter()


class ConfigItemUpdate(BaseModel):
    key: str
    value: str
    description: Optional[str] = None


class BatchConfigUpdate(BaseModel):
    configs: List[ConfigItemUpdate]


@router.get("/admin/configuration", summary="Get all dynamic system configurations")
def get_system_configurations(
    db: Session = Depends(get_db)
):
    """
    Returns configurable threshold parameters for:
    - Inventory Stale Window (Hours)
    - Expiry Warning Threshold (Days)
    - Expiry Critical Threshold (Days)
    - Shortage Buffer Multiplier
    - Minimum Safety Stock (Units)
    - Wastage-Risk Threshold
    """
    configs = db.query(SystemConfiguration).all()
    res = {}
    for c in configs:
        res[c.key] = {
            "key": c.key,
            "value": c.value,
            "data_type": c.data_type,
            "category": c.category,
            "description": c.description,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None
        }
    return res


@router.put("/admin/configuration", summary="Update dynamic system configurations (Admin only)")
def update_system_configurations(
    payload: BatchConfigUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates one or more administrative configuration parameters."""
    user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
    if user_role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only system administrators can alter operational system configurations."
        )

    updated_keys = []
    for item in payload.configs:
        cfg = db.query(SystemConfiguration).filter(SystemConfiguration.key == item.key).first()
        if cfg:
            cfg.value = item.value
            if item.description:
                cfg.description = item.description
            updated_keys.append(cfg.key)
        else:
            new_cfg = SystemConfiguration(
                key=item.key,
                value=item.value,
                description=item.description or "Configured by Admin",
                category="ADMIN_CUSTOM"
            )
            db.add(new_cfg)
            updated_keys.append(new_cfg.key)

    db.commit()
    return {
        "status": "success",
        "updated_keys": updated_keys,
        "message": f"Successfully updated {len(updated_keys)} configuration parameter(s)."
    }
