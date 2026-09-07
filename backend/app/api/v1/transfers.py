from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.emergency import TransferLog
from app.schemas.emergency import TransferLogResponse
from app.services.optimization_engine import compute_proactive_rebalance_plan

router = APIRouter()


@router.get("/rebalance-proposals")
def get_rebalance_proposals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> List[Dict[str, Any]]:
    """
    Algorithmic resource optimization engine endpoint.
    Identifies units at risk of expiring and proposes transfers to high-consumption centers.
    """
    return compute_proactive_rebalance_plan(db)


@router.get("/logs", response_model=List[TransferLogResponse])
def get_transfer_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Retrieve history and live dispatch statuses of inter-facility transfers."""
    return db.query(TransferLog).order_by(TransferLog.created_at.desc()).limit(30).all()
