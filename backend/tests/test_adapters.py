from app.adapters.eraktkosh_synthetic import ERaktKoshSyntheticAdapter
from app.core.config import AvailabilityStatus, UserRole


def test_eraktkosh_synthetic_adapter_contract():
    adapter = ERaktKoshSyntheticAdapter(seed=123)
    meta = adapter.get_adapter_metadata()
    
    # Strictly check compliance disclosures
    assert meta["is_synthetic"] is True
    assert meta["real_time_feed"] is False
    assert "not access or claim access" in meta["compliance_disclaimer"].lower() or "no unauthorized" in meta["compliance_disclaimer"].lower()
    
    # Fetch regional stock
    records = adapter.search_regional_stock(state="Delhi", district="Central Delhi")
    assert len(records) > 0
    first = records[0]
    assert first["status"] == AvailabilityStatus.REPORTED.value
    assert first["data_source"] == "SYNTHETIC_ERAKTKOSH_COMPATIBLE_FEED"
    assert "units_available" in first
    assert "batch_number" in first


def test_sync_and_confirm_inventory_flow(client):
    # 1. Register Blood Bank user and Patient user
    client.post("/api/v1/auth/register", json={
        "email": "lab.tech@redcross.org",
        "password": "LabPassword123!",
        "full_name": "Lab Technician Mohan",
        "role": "BLOOD_BANK"
    })
    bb_login = client.post("/api/v1/auth/login", json={
        "email": "lab.tech@redcross.org",
        "password": "LabPassword123!"
    })
    bb_token = bb_login.json()["access_token"]
    bb_headers = {"Authorization": f"Bearer {bb_token}"}

    client.post("/api/v1/auth/register", json={
        "email": "patient.arun@example.com",
        "password": "PatientPassword123!",
        "full_name": "Arun Kumar",
        "role": "PATIENT"
    })
    pat_login = client.post("/api/v1/auth/login", json={
        "email": "patient.arun@example.com",
        "password": "PatientPassword123!"
    })
    pat_token = pat_login.json()["access_token"]
    pat_headers = {"Authorization": f"Bearer {pat_token}"}

    # 2. Sync synthetic e-RaktKosh compatible feed as Blood Bank staff
    sync_res = client.post("/api/v1/inventory/sync-eraktkosh", headers=bb_headers)
    assert sync_res.status_code == 200
    sync_data = sync_res.json()
    assert sync_data["status"] == "COMPLETED"
    assert sync_data["synced_units_count"] > 0
    assert sync_data["availability_classification"] == AvailabilityStatus.REPORTED.value

    # 3. Retrieve inventory items
    inv_res = client.get("/api/v1/inventory", headers=pat_headers)
    assert inv_res.status_code == 200
    items = inv_res.json()
    assert len(items) > 0

    first_item = items[0]
    assert first_item["status"] == AvailabilityStatus.REPORTED.value
    assert first_item["last_verified_by_user_id"] is None

    # 4. Patient attempts to confirm physical inventory - MUST BE REJECTED (HTTP 403)
    patient_confirm = client.post(f"/api/v1/inventory/{first_item['id']}/confirm", headers=pat_headers)
    assert patient_confirm.status_code == 403

    # 5. Blood Bank staff confirms physical inventory
    confirm_res = client.post(
        f"/api/v1/inventory/{first_item['id']}/confirm",
        json={"units_verified": 10, "temperature_verified_celsius": 4.1},
        headers=bb_headers
    )
    assert confirm_res.status_code == 200
    confirmed_item = confirm_res.json()
    assert confirmed_item["status"] == AvailabilityStatus.CONFIRMED.value
    assert confirmed_item["units_available"] == 10
    assert confirmed_item["last_verified_by_user_id"] is not None

    # 6. Check summary endpoint
    summary_res = client.get("/api/v1/inventory/summary", headers=pat_headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_confirmed_units"] >= 10
    assert summary["total_reported_units"] > 0
    assert "Not real-time" in summary["compliance_disclosure"]
