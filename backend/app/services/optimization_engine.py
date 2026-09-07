from datetime import date, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import AvailabilityStatus, BloodGroup, ComponentType
from app.models.facility import BloodBank, Hospital
from app.models.inventory import BloodInventory
from app.services.emergency_routing import calculate_haversine_distance, estimate_transit_time_minutes


def compute_proactive_rebalance_plan(db: Session) -> List[Dict[str, Any]]:
    """
    Algorithmic resource optimization engine.
    Finds units with imminent expiration risks in peripheral or low-burn facilities,
    and pairs them with major trauma/transfusion centers having high turnover.
    Reduces critical blood spoilage across the regional cluster.
    """
    today = date.today()
    critical_expiry_window = today + timedelta(days=5)

    # 1. Locate units expiring within 5 days
    expiring_units = db.query(BloodInventory).filter(
        BloodInventory.expiry_date <= critical_expiry_window,
        BloodInventory.expiry_date >= today,
        BloodInventory.units_available > 0
    ).all()

    if not expiring_units:
        return []

    # 2. Get high-consumption hospitals / trauma centers
    high_demand_hospitals = db.query(Hospital).filter(
        Hospital.has_trauma_center == True,
        Hospital.is_active == True
    ).all()

    if not high_demand_hospitals:
        high_demand_hospitals = db.query(Hospital).filter(Hospital.is_active == True).limit(3).all()

    proposals = []

    for item in expiring_units:
        source_bank = db.query(BloodBank).filter(BloodBank.id == item.facility_id).first()
        if not source_bank:
            continue

        days_left = (item.expiry_date - today).days

        for hosp in high_demand_hospitals:
            dist = calculate_haversine_distance(source_bank.latitude, source_bank.longitude, hosp.latitude, hosp.longitude)
            transit_mins = estimate_transit_time_minutes(dist, is_emergency=False)

            # Skip if destination is too far (e.g. > 100km for urgent expiring stock)
            if dist > 80.0:
                continue

            saved_units = item.units_available
            explanation = (
                f"Proactive Wastage Prevention: Unit batch {item.batch_number} ({item.blood_group.value} {item.component.value}) "
                f"at {source_bank.name} expires in {days_left} days. Rebalancing to {hosp.name} "
                f"avoids spoilage by matching with high trauma/surgical consumption ({dist} km transfer, ~{transit_mins} mins)."
            )

            proposals.append({
                "rebalance_id": f"REBAL-{item.id}-{hosp.id}",
                "source_bank_id": source_bank.id,
                "source_bank_name": source_bank.name,
                "destination_hospital_id": hosp.id,
                "destination_hospital_name": hosp.name,
                "blood_group": item.blood_group.value,
                "component": item.component.value,
                "units_to_transfer": saved_units,
                "days_until_expiry": days_left,
                "distance_km": dist,
                "estimated_transit_mins": transit_mins,
                "wastage_prevention_score": round(max(0.1, 1.0 - (days_left / 7.0)) * 100, 1),
                "explanation": explanation,
                "recommended_action": "EXECUTE_PROACTIVE_TRANSFER"
            })

    # Sort by wastage prevention score (most urgent first)
    proposals.sort(key=lambda p: p["wastage_prevention_score"], reverse=True)
    return proposals
