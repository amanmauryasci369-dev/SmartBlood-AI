import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token
from app.models.user import User
from app.core.config import UserRole

client = TestClient(app)


def test_unauthenticated_access_rejected():
    """Unauthenticated users cannot access hospital exchange."""
    res = client.get("/api/v1/hospital-exchange/verify-access")
    assert res.status_code in [401, 403]


def test_patient_access_forbidden():
    """Patients cannot access hospital exchange (Rule 1)."""
    patient_token = create_access_token("5", "PATIENT", "patient@example.com")
    headers = {"Authorization": f"Bearer {patient_token}"}
    res = client.get("/api/v1/hospital-exchange/verify-access", headers=headers)
    assert res.status_code == 403
    assert "Access denied" in res.json()["detail"]


def test_hospital_access_allowed():
    """Authenticated hospital staff can access hospital exchange (Rule 1)."""
    hosp_token = create_access_token("3", "HOSPITAL", "trauma@aiims.edu", facility_id=1)
    headers = {"Authorization": f"Bearer {hosp_token}"}
    res = client.get("/api/v1/hospital-exchange/verify-access", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["access_granted"] is True
    assert data["role"] == "HOSPITAL"


def test_deterministic_fefo_search_and_demo_scenario():
    """
    Demo Scenario (Rule 18):
    Hospital A searches:
      Blood Group: O+
      Component: Packed Red Blood Cells
      Quantity: 3
    Units must be strictly ordered by expiration_date ASC:
      BL-1001 (expires in 2 days)
      BL-1002 (expires in 5 days)
      BL-1003 (expires in 8 days)
      BL-1004 (expires in 18 days)
    Recommended units must be BL-1001, BL-1002, BL-1003.
    """
    hosp_token = create_access_token("3", "HOSPITAL", "trauma@aiims.edu", facility_id=1)
    headers = {"Authorization": f"Bearer {hosp_token}"}
    
    res = client.get(
        "/api/v1/hospital-exchange/search?blood_group=O%2B&component=Packed+Red+Blood+Cells&required_quantity=3",
        headers=headers
    )
    assert res.status_code == 200
    data = res.json()
    
    assert data["requested_blood_group"] == "O+"
    assert data["requested_component"] == "Packed Red Blood Cells"
    assert data["requested_quantity"] == 3
    assert len(data["recommended_units"]) == 3
    
    # Check strict FEFO ordering across all eligible units
    all_units = data["all_eligible_units"]
    assert len(all_units) >= 4
    
    # Confirm dates are non-decreasing
    days = [u["days_until_expiry"] for u in all_units]
    assert days == sorted(days), f"FEFO violation: {days} is not sorted ascending!"
    
    # Confirm mandatory demo units are top 4
    codes = [u["unit_code"] for u in all_units[:4]]
    assert codes[0] == "BL-1001", f"Expected BL-1001 first, got {codes[0]}"
    assert codes[1] == "BL-1002", f"Expected BL-1002 second, got {codes[1]}"
    assert codes[2] == "BL-1003", f"Expected BL-1003 third, got {codes[2]}"
    assert codes[3] == "BL-1004", f"Expected BL-1004 fourth, got {codes[3]}"
    
    # Confirm urgency labels
    assert all_units[0]["urgency_label"] == "Critical Expiry"
    assert all_units[1]["urgency_label"] == "Expiring Soon"
    assert all_units[2]["urgency_label"] == "Use Soon"
    assert all_units[3]["urgency_label"] == "Normal"


def test_atomic_reservation_and_prevent_double_booking():
    """
    Prevent Double Booking (Rule 8, 9, 10):
    1. Hospital A reserves BL-1005 (ID 1005).
    2. Status becomes 'reserved'.
    3. Simultaneous/subsequent attempt by another hospital for unit 1005 returns 409 Conflict.
    4. Rejecting the request releases unit 1005 back to 'available'.
    """
    hosp_token = create_access_token("3", "HOSPITAL", "trauma@aiims.edu", facility_id=1)
    headers = {"Authorization": f"Bearer {hosp_token}"}

    # 1. Hospital A reserves unit 1005
    payload = {
        "providing_hospital_id": 4,
        "providing_hospital_name": "Fortis Care Medical Institute",
        "blood_group": "A+",
        "component": "Packed Red Blood Cells",
        "quantity_requested": 1,
        "selected_unit_ids": [1005]
    }
    res = client.post("/api/v1/hospital-exchange/request", json=payload, headers=headers)
    assert res.status_code == 200
    req_data = res.json()
    assert req_data["success"] is True
    request_id = req_data["request_id"]

    # 2. Attempt to double book unit 1005
    conflict_payload = {
        "providing_hospital_id": 4,
        "providing_hospital_name": "Fortis Care Medical Institute",
        "blood_group": "A+",
        "component": "Packed Red Blood Cells",
        "quantity_requested": 1,
        "selected_unit_ids": [1005]
    }
    conflict_res = client.post("/api/v1/hospital-exchange/request", json=conflict_payload, headers=headers)
    assert conflict_res.status_code == 409
    assert "This blood unit is no longer available. It may have been reserved by another hospital." in conflict_res.json()["detail"]

    # 3. Rejecting the request releases unit 1005 back to 'available'
    reject_res = client.post(f"/api/v1/hospital-exchange/requests/{request_id}/reject", headers=headers)
    assert reject_res.status_code == 200
    assert reject_res.json()["status"] == "rejected"

    # Now reserving it again should succeed!
    retry_res = client.post("/api/v1/hospital-exchange/request", json=payload, headers=headers)
    assert retry_res.status_code == 200
    assert retry_res.json()["success"] is True

