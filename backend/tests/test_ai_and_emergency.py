from app.ml.demand_forecast import get_or_train_demand_model, predict_demand
from app.ml.expiry_risk import get_or_train_expiry_model, assess_expiry_risk
from app.models.facility import BloodBank, Hospital
from app.models.inventory import BloodInventory
from app.core.config import BloodGroup, ComponentType, AvailabilityStatus
from datetime import date, timedelta


def test_real_ml_demand_forecast_metrics_and_inference():
    # 1. Train or load real Scikit-Learn model
    model, metrics = get_or_train_demand_model()
    assert metrics["model_type"] == "RandomForestRegressor"
    assert "metrics" in metrics
    # Genuine evaluated metrics (Rule 12 & 13)
    assert metrics["metrics"]["mean_absolute_error"] > 0
    assert metrics["metrics"]["root_mean_squared_error"] > 0
    assert -1.0 <= metrics["metrics"]["r2_score"] <= 1.0

    # 2. Test prediction with dengue surge factor
    pred = predict_demand(
        component="PLATELET_CONCENTRATE",
        blood_group="O+",
        has_trauma_center=True,
        bed_capacity=800,
        rolling_7d_avg=30.0,
        current_stock=10.0,
        dengue_outbreak_factor=2.5
    )
    assert pred["availability_classification"] == "PREDICTED_AVAILABILITY"
    assert pred["predicted_7d_demand_units"] > 0
    # Rule 14: Every AI recommendation must provide an explanation
    assert len(pred["explainability"]["top_drivers"]) > 0
    assert any("dengue" in d.lower() for d in pred["explainability"]["top_drivers"])


def test_real_ml_expiry_classifier_metrics_and_inference():
    # 1. Train or load real Scikit-Learn classifier
    model, metrics = get_or_train_expiry_model()
    assert metrics["model_type"] == "RandomForestClassifier"
    assert "accuracy" in metrics["metrics"]
    assert metrics["metrics"]["accuracy"] > 0.60
    assert metrics["metrics"]["f1_macro"] > 0.60

    # 2. Assess critical shelf-life unit (e.g. Platelet with 1 day remaining)
    risk = assess_expiry_risk(
        days_until_expiry=1.0,
        component_code=3,
        total_shelf_life_days=5,
        temperature_deviation=2.1,
        facility_daily_turnover=2.0,
        current_stock_of_group=15.0
    )
    assert risk["risk_tier"] in ["MEDIUM_RISK", "HIGH_RISK"]
    assert len(risk["explainability"]["primary_factors"]) > 0


def test_emergency_sos_routing_and_dispatch_flow(client, db_session):
    # 1. Seed facilities and inventory
    hosp = Hospital(
        name="AIIMS Trauma Emergency Hospital",
        license_number="HOSP-AIIMS-01",
        district="South Delhi",
        state="Delhi",
        latitude=28.5672,
        longitude=77.2100,
        contact_number="+91 11 26588500",
        has_trauma_center=True,
        bed_capacity=1000
    )
    bank_near = BloodBank(
        name="Safdarjung Regional Blood Center",
        license_number="BB-NEAR-01",
        district="South Delhi",
        state="Delhi",
        latitude=28.5701,  # ~0.4 km away
        longitude=77.2078,
        contact_number="+91 11 26165060",
        storage_capacity=1200,
        cold_chain_verified=True
    )
    bank_far = BloodBank(
        name="Noida Combined Blood Bank",
        license_number="BB-FAR-01",
        district="Gautam Buddha Nagar",
        state="Uttar Pradesh",
        latitude=28.5708,  # ~14 km away
        longitude=77.3489,
        contact_number="+91 120 2456789",
        storage_capacity=600,
        cold_chain_verified=True
    )
    db_session.add_all([hosp, bank_near, bank_far])
    db_session.commit()

    # Add confirmed O- stock to near bank, and reported stock to far bank
    today = date.today()
    inv_near = BloodInventory(
        facility_id=bank_near.id,
        blood_group=BloodGroup.O_NEG,
        component=ComponentType.PRBC,
        units_available=8,
        batch_number="BATCH-CONF-001",
        status=AvailabilityStatus.CONFIRMED,
        collected_date=today - timedelta(days=10),
        expiry_date=today + timedelta(days=25),
        temperature_celsius=4.0
    )
    inv_far = BloodInventory(
        facility_id=bank_far.id,
        blood_group=BloodGroup.O_NEG,
        component=ComponentType.PRBC,
        units_available=15,
        batch_number="BATCH-REP-002",
        status=AvailabilityStatus.REPORTED,
        collected_date=today - timedelta(days=5),
        expiry_date=today + timedelta(days=30),
        temperature_celsius=4.0
    )
    db_session.add_all([inv_near, inv_far])
    db_session.commit()

    # 2. Register hospital user
    client.post("/api/v1/auth/register", json={
        "email": "trauma.chief@aiims.edu",
        "password": "EmergencyPassword123!",
        "full_name": "Dr. Vivek Sharma",
        "role": "HOSPITAL",
        "facility_type": "HOSPITAL",
        "facility_id": hosp.id
    })
    login_res = client.post("/api/v1/auth/login", json={
        "email": "trauma.chief@aiims.edu",
        "password": "EmergencyPassword123!"
    })
    hosp_token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {hosp_token}"}

    # 3. Trigger Emergency SOS
    sos_payload = {
        "hospital_id": hosp.id,
        "blood_group": "O-",
        "component": "PACKED_RED_BLOOD_CELLS",
        "units_required": 4,
        "urgency_level": "CRITICAL_IMMEDIATE",
        "clinical_notes": "Massive hemorrhage following road traffic collision. Immediate transfusion indicated."
    }
    sos_res = client.post("/api/v1/emergency/sos", json=sos_payload, headers=headers)
    assert sos_res.status_code == 201
    sos_data = sos_res.json()
    assert sos_data["status"] == "RECOMMENDED_ACTION"
    assert len(sos_data["recommendations"]) == 2
    
    # Near bank should rank #1 because it has CONFIRMED units and is only ~0.4 km away
    top_rec = sos_data["recommendations"][0]
    assert top_rec["blood_bank_id"] == bank_near.id
    assert top_rec["confirmed_units"] == 8
    assert top_rec["distance_km"] < 2.0
    # Rule 14: Explainability present
    assert "CONFIRMED units" in top_rec["explanation"]
    assert "CLINICAL ADVISORY" in sos_data["clinical_decision_support_disclaimer"]

    # 4. Accept recommendation and dispatch
    accept_payload = {
        "selected_blood_bank_id": bank_near.id,
        "allocated_units": 4
    }
    accept_res = client.post(
        f"/api/v1/emergency/{sos_data['emergency_request_id']}/accept",
        json=accept_payload,
        headers=headers
    )
    assert accept_res.status_code == 200
    transfer_data = accept_res.json()
    assert transfer_data["status"] == "DISPATCHED"
    assert transfer_data["units"] == 4
    assert transfer_data["dispatch_token"].startswith("DISP-")
