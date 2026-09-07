from app.core.config import UserRole


def test_register_and_login_patient_with_phone_masking(client):
    # 1. Register a Patient
    reg_payload = {
        "email": "rahul.sharma@example.com",
        "password": "SecurePassword123!",
        "full_name": "Rahul Sharma",
        "role": "PATIENT",
        "phone": "+91 9876543210"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data["email"] == "rahul.sharma@example.com"
    assert user_data["role"] == "PATIENT"
    # Verify sensitive phone is masked (Rule 8)
    assert user_data["phone_masked"] == "+91 ******3210"
    assert "password" not in user_data
    assert "hashed_password" not in user_data

    # 2. Duplicate registration should be rejected
    dup_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert dup_res.status_code == 400

    # 3. Successful Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "rahul.sharma@example.com",
        "password": "SecurePassword123!"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["role"] == "PATIENT"

    # 4. Access /me profile with Bearer token
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == "rahul.sharma@example.com"


def test_login_invalid_password(client):
    reg_payload = {
        "email": "doctor@cityhospital.org",
        "password": "StrongPassword999",
        "full_name": "Dr. Ananya Roy",
        "role": "HOSPITAL"
    }
    client.post("/api/v1/auth/register", json=reg_payload)

    login_res = client.post("/api/v1/auth/login", json={
        "email": "doctor@cityhospital.org",
        "password": "WrongPassword!"
    })
    assert login_res.status_code == 401


def test_rbac_admin_vs_hospital_permission(client):
    # Register an Admin
    admin_reg = client.post("/api/v1/auth/register", json={
        "email": "admin@smartblood.gov",
        "password": "AdminPassword123!",
        "full_name": "System Administrator",
        "role": "ADMIN"
    })
    assert admin_reg.status_code == 201

    admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin@smartblood.gov",
        "password": "AdminPassword123!"
    })
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # Register a Hospital User
    hosp_reg = client.post("/api/v1/auth/register", json={
        "email": "officer@apollo.org",
        "password": "HospitalPassword123!",
        "full_name": "Hospital Logistics Officer",
        "role": "HOSPITAL"
    })
    assert hosp_reg.status_code == 201

    hosp_login = client.post("/api/v1/auth/login", json={
        "email": "officer@apollo.org",
        "password": "HospitalPassword123!"
    })
    hosp_token = hosp_login.json()["access_token"]
    hosp_headers = {"Authorization": f"Bearer {hosp_token}"}

    bank_payload = {
        "name": "Central Red Cross Blood Bank",
        "license_number": "BB-DL-2026-001",
        "district": "Central Delhi",
        "state": "Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "contact_number": "+91 11 23456789",
        "storage_capacity": 1000,
        "cold_chain_verified": True
    }

    # Hospital user trying to create a blood bank must be blocked (HTTP 403 Forbidden)
    forbidden_res = client.post("/api/v1/facilities/blood-banks", json=bank_payload, headers=hosp_headers)
    assert forbidden_res.status_code == 403
    assert "Access denied" in forbidden_res.json()["detail"]

    # Admin user creating the blood bank must succeed (HTTP 201 Created)
    created_res = client.post("/api/v1/facilities/blood-banks", json=bank_payload, headers=admin_headers)
    assert created_res.status_code == 201
    assert created_res.json()["name"] == "Central Red Cross Blood Bank"

    # Both users should be able to view the list of blood banks
    list_res = client.get("/api/v1/facilities/blood-banks", headers=hosp_headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1
