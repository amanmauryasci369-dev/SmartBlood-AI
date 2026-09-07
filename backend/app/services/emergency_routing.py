import math
from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.config import AvailabilityStatus, BloodGroup, ComponentType
from app.models.facility import BloodBank, Hospital
from app.models.inventory import BloodInventory
from app.schemas.emergency import FacilityRecommendation


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance in kilometers between two GPS coordinates."""
    r = 6371.0  # Earth's radius in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2 +
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(r * c, 2)


def estimate_transit_time_minutes(distance_km: float, is_emergency: bool = True) -> int:
    """
    Estimate ambulance / emergency dispatch transit time in urban/semi-urban traffic.
    Average emergency corridor speed ~ 35 km/h + 5 mins handling time.
    """
    speed_kmh = 35.0 if is_emergency else 25.0
    transit_mins = int((distance_km / speed_kmh) * 60) + 5
    return max(transit_mins, 8)


def generate_emergency_recommendations(
    hospital: Hospital,
    blood_group: BloodGroup,
    component: ComponentType,
    units_required: int,
    db: Session
) -> List[FacilityRecommendation]:
    """
    Intelligent multi-criteria emergency blood routing engine.
    Produces ranked blood bank candidates with complete transparent explainability.
    """
    blood_banks = db.query(BloodBank).filter(BloodBank.is_active == True).all()
    today = date.today()
    candidates = []

    for bank in blood_banks:
        dist_km = calculate_haversine_distance(hospital.latitude, hospital.longitude, bank.latitude, bank.longitude)
        transit_mins = estimate_transit_time_minutes(dist_km, is_emergency=True)

        # Query stock distinguishing confirmed vs reported
        confirmed_units = db.query(func.sum(BloodInventory.units_available)).filter(
            BloodInventory.facility_id == bank.id,
            BloodInventory.blood_group == blood_group,
            BloodInventory.component == component,
            BloodInventory.status == AvailabilityStatus.CONFIRMED,
            BloodInventory.expiry_date >= today
        ).scalar() or 0

        reported_units = db.query(func.sum(BloodInventory.units_available)).filter(
            BloodInventory.facility_id == bank.id,
            BloodInventory.blood_group == blood_group,
            BloodInventory.component == component,
            BloodInventory.status == AvailabilityStatus.REPORTED,
            BloodInventory.expiry_date >= today
        ).scalar() or 0

        total_units = confirmed_units + reported_units
        if total_units == 0:
            continue

        # Check nearest expiry date
        nearest_expiry = db.query(func.min(BloodInventory.expiry_date)).filter(
            BloodInventory.facility_id == bank.id,
            BloodInventory.blood_group == blood_group,
            BloodInventory.component == component,
            BloodInventory.expiry_date >= today
        ).scalar()

        days_remaining = (nearest_expiry - today).days if nearest_expiry else 10
        shelf_life_status = f"{days_remaining} days remaining"

        # Multi-factor scoring
        # 1. Stock sufficiency (confirmed units heavily favored)
        stock_score = min(1.0, confirmed_units / units_required) * 0.45 + min(1.0, reported_units / units_required) * 0.10
        
        # 2. Proximity score (decay with distance)
        proximity_score = max(0.0, 1.0 - (dist_km / 50.0)) * 0.30
        
        # 3. Quality & Cold-chain bonus
        quality_score = 0.15 if bank.cold_chain_verified else 0.05
        
        total_score = round((stock_score + proximity_score + quality_score) * 100, 1)

        # Build comprehensive explainability reasoning (Rule 14)
        reasons = []
        if confirmed_units >= units_required:
            reasons.append(f"Contains {confirmed_units} physically CONFIRMED units (sufficient for entire {units_required}-unit need).")
        elif confirmed_units > 0:
            reasons.append(f"Contains {confirmed_units} CONFIRMED units + {reported_units} REPORTED units.")
        else:
            reasons.append(f"Contains {reported_units} REPORTED units awaiting physical verification.")

        reasons.append(f"Proximity: {dist_km} km away, estimated emergency transit time {transit_mins} mins.")
        if bank.cold_chain_verified:
            reasons.append("Facility maintains audited continuous cold-chain verification.")
        reasons.append(f"Unit batch expires in {days_remaining} days, providing safe therapeutic window.")

        explanation = " ".join(reasons)
        action = f"RECOMMENDED_ACTION: Dispatch {min(units_required, total_units)} units via emergency corridor."

        candidates.append({
            "blood_bank_id": bank.id,
            "blood_bank_name": bank.name,
            "district": bank.district,
            "distance_km": dist_km,
            "estimated_transit_mins": transit_mins,
            "confirmed_units": confirmed_units,
            "reported_units": reported_units,
            "cold_chain_verified": bank.cold_chain_verified,
            "shelf_life_status": shelf_life_status,
            "overall_match_score": total_score,
            "explanation": explanation,
            "recommended_action": action
        })

    # Sort descending by match score
    candidates.sort(key=lambda c: c["overall_match_score"], reverse=True)

    recommendations = []
    for rank, cand in enumerate(candidates, 1):
        recommendations.append(FacilityRecommendation(
            rank=rank,
            **cand
        ))

    return recommendations
