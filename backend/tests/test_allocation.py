from datetime import date, timedelta
import pytest
from app.models.inventory import BloodInventory
from app.models.facility import BloodBank
from app.core.config import BloodGroup, ComponentType


def get_or_create_bank(db_session):
    bank = db_session.query(BloodBank).first()
    if not bank:
        bank = BloodBank(
            name="Test Blood Bank Delhi",
            license_number="DL-TEST-001",
            district="Central Delhi",
            state="Delhi",
            latitude=28.6139,
            longitude=77.2090,
            contact_number="+91 11 23716441",
            storage_capacity=500,
            cold_chain_verified=True,
            is_active=True
        )
        db_session.add(bank)
        db_session.commit()
        db_session.refresh(bank)
    return bank


def test_fefo_allocation_deterministic_sorting(client, db_session):
    """Verify that eligible blood units are strictly sorted by nearest expiration date (FEFO)."""
    today = date.today()
    bank = get_or_create_bank(db_session)

    # Insert 3 available units with different expiration dates out of order
    # Unit A: expires in 10 days
    # Unit B: expires in 2 days (should be 1st)
    # Unit C: expires in 5 days (should be 2nd)
    unit_a = BloodInventory(
        facility_id=bank.id,
        unit_code="BL-FEFO-010",
        blood_group=BloodGroup.O_POS,
        component=ComponentType.PRBC,
        quantity_ml=450,
        units_available=1,
        batch_number="BATCH-FEFO-10D",
        status="available",
        screening_status="cleared",
        blood_bank_name="Test Blood Bank Delhi",
        city="New Delhi",
        collected_date=today - timedelta(days=10),
        expiry_date=today + timedelta(days=10),
        expiration_date=today + timedelta(days=10),
        temperature_celsius=4.0
    )
    unit_b = BloodInventory(
        facility_id=bank.id,
        unit_code="BL-FEFO-002",
        blood_group=BloodGroup.O_POS,
        component=ComponentType.PRBC,
        quantity_ml=450,
        units_available=1,
        batch_number="BATCH-FEFO-2D",
        status="available",
        screening_status="cleared",
        blood_bank_name="Test Blood Bank Delhi",
        city="New Delhi",
        collected_date=today - timedelta(days=10),
        expiry_date=today + timedelta(days=2),
        expiration_date=today + timedelta(days=2),
        temperature_celsius=4.0
    )
    unit_c = BloodInventory(
        facility_id=bank.id,
        unit_code="BL-FEFO-005",
        blood_group=BloodGroup.O_POS,
        component=ComponentType.PRBC,
        quantity_ml=450,
        units_available=1,
        batch_number="BATCH-FEFO-5D",
        status="available",
        screening_status="cleared",
        blood_bank_name="Test Blood Bank Delhi",
        city="New Delhi",
        collected_date=today - timedelta(days=10),
        expiry_date=today + timedelta(days=5),
        expiration_date=today + timedelta(days=5),
        temperature_celsius=4.0
    )

    db_session.add_all([unit_a, unit_b, unit_c])
    db_session.commit()

    # Query FEFO recommendation for 450 ml O+ PRBC
    res = client.post("/api/v1/allocation/fefo-recommendations", json={
        "blood_group": "O+",
        "component": "Packed Red Blood Cells",
        "required_quantity_ml": 450
    })

    assert res.status_code == 200
    data = res.json()
    assert len(data["units"]) >= 3
    
    # Filter only our test units
    test_units = [u for u in data["units"] if u["unit_code"].startswith("BL-FEFO-")]
    assert len(test_units) == 3
    # Strict FEFO check: unit_b (2 days) MUST be first, unit_c (5 days) second, unit_a (10 days) third
    assert test_units[0]["unit_code"] == "BL-FEFO-002"
    assert test_units[0]["days_until_expiry"] == 2
    assert test_units[0]["urgency_level"] == "Urgent"
    assert test_units[0]["is_allocated"] is True

    assert test_units[1]["unit_code"] == "BL-FEFO-005"
    assert test_units[1]["days_until_expiry"] == 5
    assert test_units[1]["urgency_level"] == "Use Soon"

    assert test_units[2]["unit_code"] == "BL-FEFO-010"
    assert test_units[2]["days_until_expiry"] == 10


def test_fefo_excludes_expired_reserved_and_uncleared(client, db_session):
    """Never allocate expired, reserved, or uncleared blood units."""
    today = date.today()
    bank = get_or_create_bank(db_session)

    # Expired unit
    exp_unit = BloodInventory(
        facility_id=bank.id,
        unit_code="BL-EXPIRED-99",
        blood_group=BloodGroup.AB_NEG,
        component=ComponentType.PRBC,
        quantity_ml=450,
        batch_number="BATCH-EXPIRED-99",
        status="available",
        screening_status="cleared",
        collected_date=today - timedelta(days=50),
        expiry_date=today - timedelta(days=1),
        expiration_date=today - timedelta(days=1),
        temperature_celsius=4.0
    )
    # Uncleared unit
    uncleared_unit = BloodInventory(
        facility_id=bank.id,
        unit_code="BL-UNCLEARED-99",
        blood_group=BloodGroup.AB_NEG,
        component=ComponentType.PRBC,
        quantity_ml=450,
        batch_number="BATCH-UNCLEARED-99",
        status="available",
        screening_status="pending",
        is_quarantined=True,
        collected_date=today - timedelta(days=2),
        expiry_date=today + timedelta(days=10),
        expiration_date=today + timedelta(days=10),
        temperature_celsius=4.0
    )
    # Reserved unit
    reserved_unit = BloodInventory(
        facility_id=bank.id,
        unit_code="BL-RESERVED-99",
        blood_group=BloodGroup.AB_NEG,
        component=ComponentType.PRBC,
        quantity_ml=450,
        batch_number="BATCH-RESERVED-99",
        status="reserved",
        screening_status="cleared",
        collected_date=today - timedelta(days=2),
        expiry_date=today + timedelta(days=10),
        expiration_date=today + timedelta(days=10),
        temperature_celsius=4.0
    )

    db_session.add_all([exp_unit, uncleared_unit, reserved_unit])
    db_session.commit()

    res = client.post("/api/v1/allocation/fefo-recommendations", json={
        "blood_group": "AB-",
        "component": "Packed Red Blood Cells",
        "required_quantity_ml": 450
    })

    assert res.status_code == 200
    data = res.json()
    codes = [u["unit_code"] for u in data["units"]]
    assert "BL-EXPIRED-99" not in codes
    assert "BL-UNCLEARED-99" not in codes
    assert "BL-RESERVED-99" not in codes


def test_fefo_shortage_calculation(client, db_session):
    """When requested quantity exceeds available supply, return shortage calculation."""
    res = client.post("/api/v1/allocation/fefo-recommendations", json={
        "blood_group": "AB-",
        "component": "Cryoprecipitate",
        "required_quantity_ml": 5000  # Massive request exceeding inventory
    })

    assert res.status_code == 200
    data = res.json()
    assert data["requested_quantity_ml"] == 5000
    assert data["shortage_quantity_ml"] > 0
    assert data["is_fully_fulfillable"] is False
    assert "Shortage detected" in data["message"]


def test_atomic_unit_reservation_prevents_double_booking(client, db_session):
    """Test that a unit changes status from available -> reserved, and cannot be reserved twice."""
    today = date.today()
    bank = get_or_create_bank(db_session)

    unit = BloodInventory(
        facility_id=bank.id,
        unit_code="BL-ATOMIC-RESERVE-01",
        blood_group=BloodGroup.B_POS,
        component=ComponentType.PLATELETS,
        quantity_ml=300,
        units_available=1,
        batch_number="BATCH-ATOMIC-01",
        status="available",
        screening_status="cleared",
        collected_date=today - timedelta(days=1),
        expiry_date=today + timedelta(days=4),
        expiration_date=today + timedelta(days=4),
        temperature_celsius=22.0
    )
    db_session.add(unit)
    db_session.commit()
    db_session.refresh(unit)

    # First patient reservation -> SUCCESS
    res1 = client.post("/api/v1/allocation/reserve-unit", json={
        "unit_id": unit.id,
        "patient_name": "Patient 1"
    })
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["success"] is True
    assert data1["status"] == "reserved"

    # Second patient attempts to reserve SAME unit -> 409 CONFLICT (Race condition prevented!)
    res2 = client.post("/api/v1/allocation/reserve-unit", json={
        "unit_id": unit.id,
        "patient_name": "Patient 2"
    })
    assert res2.status_code == 409
    assert "already been reserved" in res2.json()["detail"]
