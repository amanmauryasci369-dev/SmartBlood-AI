from datetime import date, timedelta, datetime, timezone
import pytest
from app.core.database import SessionLocal, Base, engine
from app.models.facility import Hospital, BloodBank
from app.models.inventory import BloodInventory
from app.models.shelf_life import ComponentShelfLifeRule
from app.models.wastage import WastageRecord
from app.models.hospital_network import HospitalBloodRequest, HospitalRequestMessage
from app.services.fefo_service import FEFOService
from app.services.wastage_engine import WastageEngine
from app.ml.wastage_predictor import WastageRiskPredictor
from app.services.hospital_network_service import HospitalNetworkService
from app.services.source_ranking_service import IntelligentSourceRankingService


@pytest.fixture(scope="module")
def db():
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    yield session
    session.close()


# 1. Test days-to-expiry calculation
def test_days_to_expiry_calculation():
    today = date.today()
    in_5_days = today + timedelta(days=5)
    past_2_days = today - timedelta(days=2)
    today_date = today

    res_future = FEFOService.calculate_expiry_status(in_5_days, ref_date=today)
    res_past = FEFOService.calculate_expiry_status(past_2_days, ref_date=today)
    res_today = FEFOService.calculate_expiry_status(today_date, ref_date=today)

    assert res_future["days_to_expiry"] == 5
    assert res_past["days_to_expiry"] == -2
    assert res_today["days_to_expiry"] == 0


# 2. Test expiry status tiers
def test_expiry_status_tiers():
    today = date.today()
    assert FEFOService.calculate_expiry_status(today + timedelta(days=10), ref_date=today)["status"] == "SAFE"
    assert FEFOService.calculate_expiry_status(today + timedelta(days=5), ref_date=today)["status"] == "APPROACHING_EXPIRY"
    assert FEFOService.calculate_expiry_status(today + timedelta(days=2), ref_date=today)["status"] == "HIGH_EXPIRY_RISK"
    assert FEFOService.calculate_expiry_status(today + timedelta(days=0), ref_date=today)["status"] == "HIGH_EXPIRY_RISK"
    assert FEFOService.calculate_expiry_status(today - timedelta(days=1), ref_date=today)["status"] == "EXPIRED"


# 3. Test FEFO priority ordering (earliest expiry first: A -> B -> C)
def test_fefo_ordering(db):
    items = FEFOService.get_fefo_prioritized_inventory(db, include_expired=False)
    assert len(items) > 0

    # Ensure strictly sorted by expiry_date ascending
    for i in range(len(items) - 1):
        assert items[i]["expiry_date"] <= items[i+1]["expiry_date"]
        assert items[i]["priority"] == i + 1


# 4. Test wastage calculation (utilization rate & wastage rate math)
def test_wastage_rate_and_utilization_math(db):
    res = WastageEngine.get_wastage_analytics(db)
    kpis = res["kpis"]
    assert "utilization_rate_pct" in kpis
    assert "wastage_rate_pct" in kpis
    assert kpis["total_collected"] >= (kpis["total_issued"] + kpis["total_discarded"])
    assert 0 <= kpis["utilization_rate_pct"] <= 100
    assert 0 <= kpis["wastage_rate_pct"] <= 100


# 5. Test wastage prediction baseline model
def test_wastage_prediction_baseline_model():
    # Urgent expiry scenario
    pred_urgent = WastageRiskPredictor.predict_risk(
        current_inventory=10,
        days_to_expiry=2,
        daily_utilization_velocity=1.0,
        predicted_7d_demand=7.0,
        component="PLATELETS"
    )
    assert pred_urgent["risk"] == "HIGH_WASTAGE_RISK"
    assert pred_urgent["recommendation"] == "CONSIDER_AUTHORIZED_REDISTRIBUTION"
    assert pred_urgent["model_type"] == "Baseline Risk Model"

    # Safe buffer scenario
    pred_safe = WastageRiskPredictor.predict_risk(
        current_inventory=5,
        days_to_expiry=25,
        daily_utilization_velocity=2.0,
        predicted_7d_demand=14.0,
        component="PRBC"
    )
    assert pred_safe["risk"] == "LOW_WASTAGE_RISK"
    assert pred_safe["recommendation"] == "MONITOR"


# 6, 7, 8, 9. Test Hospital Blood Request Lifecycle (Create -> Accept -> Verification -> Fulfill)
def test_hospital_request_lifecycle(db):
    hospital_a = db.query(Hospital).first()
    hospital_b = db.query(Hospital).offset(1).first()
    assert hospital_a is not None and hospital_b is not None

    # Step 6: Create
    req = HospitalNetworkService.create_request(
        db,
        requesting_hospital_id=hospital_a.id,
        blood_group="O+",
        component="PACKED_RED_BLOOD_CELLS",
        quantity=3,
        emergency_level="CRITICAL",
        target_hospital_id=hospital_b.id,
        notes="Automated lifecycle test"
    )
    assert req.id is not None
    assert req.status == "PENDING"
    assert req.request_id.startswith("H2H-")

    # Step 7: Accept (moves to VERIFICATION_REQUIRED)
    req_accepted = HospitalNetworkService.accept_request(
        db,
        req_id=req.id,
        accepting_hospital_id=hospital_b.id,
        notes="Units held in blood bank cross-match rack"
    )
    assert req_accepted.status == "VERIFICATION_REQUIRED"

    # Step 8: Confirm Verification
    req_confirmed = HospitalNetworkService.confirm_verification(
        db,
        req_id=req.id,
        confirming_user_id=1,
        notes="Cross match compatible; agglutination negative"
    )
    assert req_confirmed.status == "CONFIRMED"

    # Step 9: Fulfill
    req_fulfilled = HospitalNetworkService.fulfill_request(
        db,
        req_id=req.id,
        notes="Transfer courier signed receipt"
    )
    assert req_fulfilled.status == "FULFILLED"


# Test Hospital Rejection workflow
def test_hospital_request_rejection(db):
    hospital_a = db.query(Hospital).first()
    hospital_b = db.query(Hospital).offset(1).first()

    req = HospitalNetworkService.create_request(
        db,
        requesting_hospital_id=hospital_a.id,
        blood_group="AB-",
        component="PACKED_RED_BLOOD_CELLS",
        quantity=2,
        target_hospital_id=hospital_b.id
    )
    req_rejected = HospitalNetworkService.reject_request(
        db,
        req_id=req.id,
        rejecting_hospital_id=hospital_b.id,
        reason="Insufficient reserve due to active trauma surgery"
    )
    assert req_rejected.status == "REJECTED"


# 10, 11, 12, 13, 14. Test Intelligent Multi-Source Ranking & Clinical Recommendation
def test_intelligent_source_ranking(db):
    hospital = db.query(Hospital).first()
    result = IntelligentSourceRankingService.rank_emergency_sources(
        db,
        requesting_hospital_id=hospital.id,
        blood_group="O-",
        component="PACKED_RED_BLOOD_CELLS",
        units_required=4,
        emergency_level="CRITICAL"
    )

    assert "ranked_sources" in result
    assert len(result["ranked_sources"]) > 0
    top = result["ranked_sources"][0]
    assert top["rank"] == 1
    assert "distance_km" in top
    assert "estimated_transit_mins" in top
    assert "ai_clinical_recommendation" in result
    assert "Clinical cross-match verification" in result["ai_clinical_recommendation"]


# Edge case: no inventory / partial inventory query
def test_edge_case_no_inventory(db):
    empty_items = FEFOService.get_fefo_prioritized_inventory(
        db,
        blood_group="INVALID_GROUP",
        include_expired=False
    )
    assert len(empty_items) == 0
