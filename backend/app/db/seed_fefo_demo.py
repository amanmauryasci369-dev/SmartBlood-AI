"""
Seed script to ensure FEFO demo inventory units exist in backend/smartblood.db.
Contains the exact requested demo units:
- BL-1024 | O+ | PRBC | AIIMS Main Blood Bank | 8 units | 2026-09-10
- BL-1031 | O+ | PRBC | Safdarjung Hospital | 12 units | 2026-09-15
- BL-1048 | O+ | PRBC | Moolchand Hospital | 6 units | 2026-09-20
- BL-1062 | O+ | PRBC | Apollo Hospital | 10 units | 2026-09-28
Plus diverse unexpired records across A+, B+, O-, AB+ and other components (Platelets, FFP, Whole Blood).
"""

import sqlite3
from datetime import date, datetime, timezone

def run_seed():
    conn = sqlite3.connect('backend/smartblood.db')
    c = conn.cursor()

    now_iso = datetime.now(timezone.utc).isoformat()

    demo_records = [
        # The 4 exact prompt-specified O+ PRBC records
        {
            "batch_number": "BL-1024",
            "unit_code": "BL-1024",
            "facility_id": 1,
            "hospital_name": "AIIMS Main Blood Bank",
            "blood_bank_name": "AIIMS Main Blood Bank",
            "city": "Delhi",
            "blood_group": "O_POS",
            "component": "PRBC",
            "units_available": 8,
            "quantity_ml": 450,
            "collected_date": "2026-09-02",
            "expiry_date": "2026-09-10",
            "expiration_date": "2026-09-10",
            "status": "available",
            "screening_status": "cleared",
            "storage_status": "proper",
            "is_quarantined": 0
        },
        {
            "batch_number": "BL-1031",
            "unit_code": "BL-1031",
            "facility_id": 4,
            "hospital_name": "Safdarjung Hospital",
            "blood_bank_name": "Safdarjung Hospital",
            "city": "Delhi",
            "blood_group": "O_POS",
            "component": "PRBC",
            "units_available": 12,
            "quantity_ml": 450,
            "collected_date": "2026-09-05",
            "expiry_date": "2026-09-15",
            "expiration_date": "2026-09-15",
            "status": "available",
            "screening_status": "cleared",
            "storage_status": "proper",
            "is_quarantined": 0
        },
        {
            "batch_number": "BL-1048",
            "unit_code": "BL-1048",
            "facility_id": 19,
            "hospital_name": "Moolchand Hospital",
            "blood_bank_name": "Moolchand Hospital",
            "city": "Delhi",
            "blood_group": "O_POS",
            "component": "PRBC",
            "units_available": 6,
            "quantity_ml": 450,
            "collected_date": "2026-09-08",
            "expiry_date": "2026-09-20",
            "expiration_date": "2026-09-20",
            "status": "available",
            "screening_status": "cleared",
            "storage_status": "proper",
            "is_quarantined": 0
        },
        {
            "batch_number": "BL-1062",
            "unit_code": "BL-1062",
            "facility_id": 18,
            "hospital_name": "Apollo Hospital",
            "blood_bank_name": "Apollo Hospital",
            "city": "Delhi",
            "blood_group": "O_POS",
            "component": "PRBC",
            "units_available": 10,
            "quantity_ml": 450,
            "collected_date": "2026-09-01",
            "expiry_date": "2026-09-28",
            "expiration_date": "2026-09-28",
            "status": "available",
            "screening_status": "cleared",
            "storage_status": "proper",
            "is_quarantined": 0
        },
        # Additional realistic unexpired inventory for other groups and components
        {
            "batch_number": "BL-2011",
            "unit_code": "BL-2011",
            "facility_id": 1,
            "hospital_name": "AIIMS Main Blood Bank",
            "blood_bank_name": "AIIMS Main Blood Bank",
            "city": "Delhi",
            "blood_group": "A_POS",
            "component": "PRBC",
            "units_available": 6,
            "quantity_ml": 450,
            "collected_date": "2026-09-03",
            "expiry_date": "2026-09-11",
            "expiration_date": "2026-09-11",
            "status": "available",
            "screening_status": "cleared",
            "storage_status": "proper",
            "is_quarantined": 0
        },
        {
            "batch_number": "BL-2012",
            "unit_code": "BL-2012",
            "facility_id": 4,
            "hospital_name": "Safdarjung Hospital",
            "blood_bank_name": "Safdarjung Hospital",
            "city": "Delhi",
            "blood_group": "A_POS",
            "component": "PRBC",
            "units_available": 14,
            "quantity_ml": 450,
            "collected_date": "2026-09-06",
            "expiry_date": "2026-09-17",
            "expiration_date": "2026-09-17",
            "status": "available",
            "screening_status": "cleared",
            "storage_status": "proper",
            "is_quarantined": 0
        },
        {
            "batch_number": "BL-3011",
            "unit_code": "BL-3011",
            "facility_id": 3,
            "hospital_name": "Lok Nayak Hospital",
            "blood_bank_name": "Lok Nayak Hospital",
            "city": "Delhi",
            "blood_group": "B_POS",
            "component": "PRBC",
            "units_available": 5,
            "quantity_ml": 450,
            "collected_date": "2026-09-04",
            "expiry_date": "2026-09-12",
            "expiration_date": "2026-09-12",
            "status": "available",
            "screening_status": "cleared",
            "storage_status": "proper",
            "is_quarantined": 0
        },
        {
            "batch_number": "BL-3012",
            "unit_code": "BL-3012",
            "facility_id": 1,
            "hospital_name": "AIIMS Main Blood Bank",
            "blood_bank_name": "AIIMS Main Blood Bank",
            "city": "Delhi",
            "blood_group": "B_POS",
            "component": "PRBC",
            "units_available": 9,
            "quantity_ml": 450,
            "collected_date": "2026-09-07",
            "expiry_date": "2026-09-22",
            "expiration_date": "2026-09-22",
            "status": "available",
            "screening_status": "cleared",
            "storage_status": "proper",
            "is_quarantined": 0
        },
        {
            "batch_number": "BL-4011",
            "unit_code": "BL-4011",
            "facility_id": 4,
            "hospital_name": "Safdarjung Hospital",
            "blood_bank_name": "Safdarjung Hospital",
            "city": "Delhi",
            "blood_group": "O_NEG",
            "component": "PRBC",
            "units_available": 4,
            "quantity_ml": 450,
            "collected_date": "2026-09-04",
            "expiry_date": "2026-09-11",
            "expiration_date": "2026-09-11",
            "status": "available",
            "screening_status": "cleared",
            "storage_status": "proper",
            "is_quarantined": 0
        },
        {
            "batch_number": "BL-4012",
            "unit_code": "BL-4012",
            "facility_id": 1,
            "hospital_name": "AIIMS Main Blood Bank",
            "blood_bank_name": "AIIMS Main Blood Bank",
            "city": "Delhi",
            "blood_group": "O_NEG",
            "component": "PRBC",
            "units_available": 7,
            "quantity_ml": 450,
            "collected_date": "2026-09-06",
            "expiry_date": "2026-09-18",
            "expiration_date": "2026-09-18",
            "status": "available",
            "screening_status": "cleared",
            "storage_status": "proper",
            "is_quarantined": 0
        },
        # Platelets (short 5-day shelf life)
        {
            "batch_number": "PLT-5011",
            "unit_code": "PLT-5011",
            "facility_id": 1,
            "hospital_name": "AIIMS Main Blood Bank",
            "blood_bank_name": "AIIMS Main Blood Bank",
            "city": "Delhi",
            "blood_group": "O_POS",
            "component": "PLATELETS",
            "units_available": 4,
            "quantity_ml": 250,
            "collected_date": "2026-09-07",
            "expiry_date": "2026-09-11",
            "expiration_date": "2026-09-11",
            "status": "available",
            "screening_status": "cleared",
            "storage_status": "proper",
            "is_quarantined": 0
        },
        {
            "batch_number": "PLT-5012",
            "unit_code": "PLT-5012",
            "facility_id": 4,
            "hospital_name": "Safdarjung Hospital",
            "blood_bank_name": "Safdarjung Hospital",
            "city": "Delhi",
            "blood_group": "O_POS",
            "component": "PLATELETS",
            "units_available": 8,
            "quantity_ml": 250,
            "collected_date": "2026-09-08",
            "expiry_date": "2026-09-13",
            "expiration_date": "2026-09-13",
            "status": "available",
            "screening_status": "cleared",
            "storage_status": "proper",
            "is_quarantined": 0
        }
    ]

    for rec in demo_records:
        # Check if batch exists
        c.execute("SELECT id FROM blood_inventory WHERE batch_number = ? OR unit_code = ?", (rec["batch_number"], rec["unit_code"]))
        row = c.fetchone()
        if row:
            inv_id = row[0]
            c.execute("""
                UPDATE blood_inventory SET
                    facility_id = ?, hospital_name = ?, blood_bank_name = ?, city = ?,
                    blood_group = ?, component = ?, units_available = ?, quantity_ml = ?,
                    collected_date = ?, expiry_date = ?, expiration_date = ?, status = ?,
                    screening_status = ?, storage_status = ?, is_quarantined = ?, updated_at = ?
                WHERE id = ?
            """, (
                rec["facility_id"], rec["hospital_name"], rec["blood_bank_name"], rec["city"],
                rec["blood_group"], rec["component"], rec["units_available"], rec["quantity_ml"],
                rec["collected_date"], rec["expiry_date"], rec["expiration_date"], rec["status"],
                rec["screening_status"], rec["storage_status"], rec["is_quarantined"], now_iso,
                inv_id
            ))
            print(f"Updated {rec['batch_number']} (ID: {inv_id})")
        else:
            c.execute("""
                INSERT INTO blood_inventory (
                    facility_id, unit_code, batch_number, hospital_name, blood_bank_name, city,
                    blood_group, component, units_available, quantity_ml, reserved_units, issued_units,
                    expired_units, collected_date, expiry_date, expiration_date, status,
                    screening_status, storage_status, is_quarantined, temperature_celsius,
                    source_tag, inventory_status, critical_threshold, created_at, updated_at
                ) VALUES (
                    ?, ?, ?, ?, ?, ?,
                    ?, ?, ?, ?, 0, 0,
                    0, ?, ?, ?, ?,
                    ?, ?, ?, 4.0,
                    'HOSPITAL_EXCHANGE_FEFO', 'AVAILABLE_CLEARED', 3, ?, ?
                )
            """, (
                rec["facility_id"], rec["unit_code"], rec["batch_number"], rec["hospital_name"], rec["blood_bank_name"], rec["city"],
                rec["blood_group"], rec["component"], rec["units_available"], rec["quantity_ml"],
                rec["collected_date"], rec["expiry_date"], rec["expiration_date"], rec["status"],
                rec["screening_status"], rec["storage_status"], rec["is_quarantined"], now_iso, now_iso
            ))
            print(f"Inserted {rec['batch_number']}")

    conn.commit()
    conn.close()
    print("FEFO demo seeding completed successfully.")

if __name__ == "__main__":
    run_seed()
