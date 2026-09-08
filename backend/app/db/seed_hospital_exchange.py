"""
Seed script for Hospital Blood Exchange module.
Populates 12 fictional hospitals and 100 synthetic blood inventory records
with diverse shelf-life distributions and the exact mandatory demo units.
"""

from datetime import date, timedelta
from app.core.database import SessionLocal, Base, engine
from app.models.facility import Hospital
from app.models.inventory import BloodInventory
from app.models.exchange import BloodRequest, BloodRequestItem
from app.core.config import BloodGroup, ComponentType
from sqlalchemy import text


def ensure_columns():
    with engine.connect() as conn:
        # Check SQLite columns
        result = conn.execute(text("PRAGMA table_info(blood_inventory);")).fetchall()
        existing = {row[1] for row in result}
        
        needed = {
            "unit_code": "TEXT",
            "quantity_ml": "INTEGER DEFAULT 450",
            "screening_status": "TEXT DEFAULT 'cleared'",
            "storage_status": "TEXT DEFAULT 'proper'",
            "blood_bank_name": "TEXT",
            "hospital_id": "INTEGER",
            "hospital_name": "TEXT",
            "city": "TEXT",
            "expiration_date": "DATE"
        }
        for col, col_type in needed.items():
            if col not in existing:
                try:
                    conn.execute(text(f"ALTER TABLE blood_inventory ADD COLUMN {col} {col_type};"))
                    conn.commit()
                    print(f"Added column {col} to blood_inventory")
                except Exception as e:
                    print(f"Column {col} add note: {e}")


def seed_hospital_exchange():
    ensure_columns()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Seeding 12 Fictional Hospitals...")
        hospitals_data = [
            (1, 'AIIMS Apex Trauma Center', 'Delhi', 'Ring Road, Ansari Nagar, New Delhi', 'trauma@aiims.edu', '+91-11-26588500'),
            (2, 'CityCare Super Specialty Hospital', 'Delhi', 'Sector 12, Dwarka, New Delhi', 'blooddesk@citycare.org', '+91-11-45678901'),
            (3, 'Metro Trauma & Emergency Hospital', 'Noida', 'Sector 62, Noida, Uttar Pradesh', 'emergency@metronoida.com', '+91-120-2400111'),
            (4, 'Fortis Care Medical Institute', 'Ghaziabad', 'Raj Nagar Extension, Ghaziabad', 'transfusion@fortiscare.org', '+91-120-4999888'),
            (5, 'Apex Multi-Specialty Hospital', 'Faridabad', 'Neelam Bata Road, NIT Faridabad', 'apex.blood@apexfbd.com', '+91-129-2233445'),
            (6, 'Maxima Heart & Trauma Center', 'Delhi', 'Saket District Centre, New Delhi', 'maxima.transfusion@maxima.org', '+91-11-26515050'),
            (7, 'Indraprastha Medical Institute', 'Delhi', 'Sarita Vihar, Delhi Mathura Road', 'bloodbank@indraprastha.in', '+91-11-26925858'),
            (8, 'Medanta LifeCare Hospital', 'Gurugram', 'Sector 38, Gurugram, Haryana', 'transfusion@medantalifecare.org', '+91-124-4141414'),
            (9, 'Apollo Regional Blood Center', 'Noida', 'Sector 26, Noida, Gautam Buddha Nagar', 'apollo.noida@apollo.org', '+91-120-4012000'),
            (10, 'Columbia Asia Care Hospital', 'Gurugram', 'Palam Vihar, Gurugram, Haryana', 'blooddesk@columbiaasia.org', '+91-124-6165666'),
            (11, 'Venkateshwar Super Specialty', 'Delhi', 'Sector 18A, Dwarka, New Delhi', 'transfusion@venkateshwar.org', '+91-11-48555555'),
            (12, 'Jaypee Trauma & Surgical Hospital', 'Noida', 'Sector 128, Wish Town, Noida', 'trauma@jaypeehospital.com', '+91-120-4122222')
        ]

        hosp_map = {}
        for hid, name, city, addr, email, phone in hospitals_data:
            hosp = db.query(Hospital).filter(Hospital.id == hid).first()
            if not hosp:
                hosp = Hospital(
                    id=hid,
                    name=name,
                    license_number=f"HOSP-LIC-{hid:04d}",
                    district=city,
                    state="Delhi NCR",
                    latitude=28.6139 + (hid * 0.015),
                    longitude=77.2090 + (hid * 0.012),
                    contact_number=phone,
                    has_trauma_center=True,
                    bed_capacity=250 + (hid * 20),
                    is_active=True
                )
                db.add(hosp)
                db.flush()
            hosp_map[hid] = hosp.name

        today = date.today()
        print("Seeding 100 Blood Inventory Records with FEFO shelf lives...")

        # Mapping helper for component string to enum
        comp_map = {
            'Packed Red Blood Cells': ComponentType.PRBC,
            'Whole Blood': ComponentType.WHOLE_BLOOD,
            'Platelets': ComponentType.PLATELETS,
            'Fresh Frozen Plasma': ComponentType.FFP
        }

        # 100 Records
        raw_units = [
            # Mandatory Demo Units:
            (1001, 'BL-1001', 'O+', 'Packed Red Blood Cells', 450, -40, 2,  'available', 'cleared', 'proper', 2, 'Delhi'),
            (1002, 'BL-1002', 'O+', 'Packed Red Blood Cells', 450, -37, 5,  'available', 'cleared', 'proper', 2, 'Delhi'),
            (1003, 'BL-1003', 'O+', 'Packed Red Blood Cells', 450, -33, 9,  'available', 'cleared', 'proper', 6, 'Delhi'),
            (1004, 'BL-1004', 'O+', 'Packed Red Blood Cells', 450, -24, 18, 'available', 'cleared', 'proper', 7, 'Delhi'),
            (1005, 'BL-1005', 'O+', 'Packed Red Blood Cells', 450, -45, -2, 'expired',   'cleared', 'proper', 2, 'Delhi'),
            (1006, 'BL-1006', 'B+',  'Platelets',              250, -4,  1, 'available', 'cleared', 'proper', 6, 'Delhi'),
            (1007, 'BL-1007', 'O-',  'Packed Red Blood Cells', 450, -41, 1, 'available', 'cleared', 'proper', 3, 'Noida'),
            (1008, 'BL-1008', 'AB+', 'Whole Blood',            450, -33, 2, 'available', 'cleared', 'proper', 7, 'Delhi'),
            (1009, 'BL-1009', 'A-',  'Platelets',              250, -4,  1, 'available', 'cleared', 'proper', 8, 'Gurugram'),
            (1010, 'BL-1010', 'B-',  'Packed Red Blood Cells', 450, -40, 2, 'available', 'cleared', 'proper', 9, 'Noida'),
            (1011, 'BL-1011', 'O+',  'Platelets',              250, -3,  2, 'available', 'cleared', 'proper', 2, 'Delhi'),
            (1012, 'BL-1012', 'A+',  'Fresh Frozen Plasma',    300, -363, 2, 'available', 'cleared', 'proper', 11, 'Delhi'),

            # Expiring Soon (3-7d)
            (1013, 'BL-1013', 'A+',  'Packed Red Blood Cells', 450, -38, 4, 'available', 'cleared', 'proper', 2, 'Delhi'),
            (1014, 'BL-1014', 'B+',  'Packed Red Blood Cells', 450, -37, 5, 'available', 'cleared', 'proper', 3, 'Noida'),
            (1015, 'BL-1015', 'O+',  'Whole Blood',            450, -30, 5, 'available', 'cleared', 'proper', 4, 'Ghaziabad'),
            (1016, 'BL-1016', 'O-',  'Platelets',              250, -2,  3, 'available', 'cleared', 'proper', 6, 'Delhi'),
            (1017, 'BL-1017', 'AB-', 'Packed Red Blood Cells', 450, -36, 6, 'available', 'cleared', 'proper', 8, 'Gurugram'),
            (1018, 'BL-1018', 'A-',  'Fresh Frozen Plasma',    300, -360, 5, 'available', 'cleared', 'proper', 9, 'Noida'),
            (1019, 'BL-1019', 'B-',  'Whole Blood',            450, -29, 6, 'available', 'cleared', 'proper', 10, 'Gurugram'),
            (1020, 'BL-1020', 'O+',  'Fresh Frozen Plasma',    300, -359, 6, 'available', 'cleared', 'proper', 12, 'Noida'),
            (1021, 'BL-1021', 'A+',  'Platelets',              250, -2,  3, 'available', 'cleared', 'proper', 5, 'Faridabad'),
            (1022, 'BL-1022', 'B+',  'Fresh Frozen Plasma',    300, -358, 7, 'available', 'cleared', 'proper', 7, 'Delhi'),

            # Use Soon (8-14d)
            (1023, 'BL-1023', 'O+',  'Whole Blood',            450, -32, 10, 'available', 'cleared', 'proper', 3, 'Noida'),
            (1024, 'BL-1024', 'A+',  'Whole Blood',            450, -25, 10, 'available', 'cleared', 'proper', 4, 'Ghaziabad'),
            (1025, 'BL-1025', 'B+',  'Packed Red Blood Cells', 450, -31, 11, 'available', 'cleared', 'proper', 6, 'Delhi'),
            (1026, 'BL-1026', 'AB+', 'Packed Red Blood Cells', 450, -30, 12, 'available', 'cleared', 'proper', 8, 'Gurugram'),
            (1027, 'BL-1027', 'O-',  'Packed Red Blood Cells', 450, -32, 10, 'available', 'cleared', 'proper', 9, 'Noida'),
            (1028, 'BL-1028', 'A-',  'Whole Blood',            450, -23, 12, 'available', 'cleared', 'proper', 11, 'Delhi'),
            (1029, 'BL-1029', 'B-',  'Packed Red Blood Cells', 450, -29, 13, 'available', 'cleared', 'proper', 12, 'Noida'),
            (1030, 'BL-1030', 'O+',  'Whole Blood',            450, -21, 14, 'available', 'cleared', 'proper', 2, 'Delhi'),
            (1031, 'BL-1031', 'A+',  'Packed Red Blood Cells', 450, -29, 13, 'available', 'cleared', 'proper', 7, 'Delhi'),
            (1032, 'BL-1032', 'AB-', 'Whole Blood',            450, -21, 14, 'available', 'cleared', 'proper', 10, 'Gurugram'),

            # Normal (15+d)
            (1033, 'BL-1033', 'O+',  'Packed Red Blood Cells', 450, -20, 22, 'available', 'cleared', 'proper', 4, 'Ghaziabad'),
            (1034, 'BL-1034', 'A+',  'Packed Red Blood Cells', 450, -18, 24, 'available', 'cleared', 'proper', 6, 'Delhi'),
            (1035, 'BL-1035', 'B+',  'Whole Blood',            450, -12, 23, 'available', 'cleared', 'proper', 8, 'Gurugram'),
            (1036, 'BL-1036', 'O-',  'Packed Red Blood Cells', 450, -15, 27, 'available', 'cleared', 'proper', 2, 'Delhi'),
            (1037, 'BL-1037', 'AB+', 'Fresh Frozen Plasma',    300, -60, 305, 'available', 'cleared', 'proper', 9, 'Noida'),
            (1038, 'BL-1038', 'A-',  'Packed Red Blood Cells', 450, -16, 26, 'available', 'cleared', 'proper', 3, 'Noida'),
            (1039, 'BL-1039', 'B-',  'Fresh Frozen Plasma',    300, -90, 275, 'available', 'cleared', 'proper', 5, 'Faridabad'),
            (1040, 'BL-1040', 'O+',  'Fresh Frozen Plasma',    300, -45, 320, 'available', 'cleared', 'proper', 11, 'Delhi'),
            (1041, 'BL-1041', 'A+',  'Whole Blood',            450, -10, 25, 'available', 'cleared', 'proper', 12, 'Noida'),
            (1042, 'BL-1042', 'O+',  'Packed Red Blood Cells', 450, -12, 30, 'available', 'cleared', 'proper', 7, 'Ghaziabad'),

            # Expired Units
            (1043, 'BL-1043', 'O+',  'Packed Red Blood Cells', 450, -45, -3, 'expired',   'cleared', 'proper', 2, 'Noida'),
            (1044, 'BL-1044', 'A+',  'Whole Blood',            450, -40, -5, 'expired',   'cleared', 'proper', 3, 'Noida'),
            (1045, 'BL-1045', 'B+',  'Platelets',              250, -7,  -2, 'expired',   'cleared', 'proper', 4, 'Ghaziabad'),
            (1046, 'BL-1046', 'O-',  'Packed Red Blood Cells', 450, -44, -2, 'expired',   'cleared', 'proper', 6, 'Delhi'),
            (1047, 'BL-1047', 'AB+', 'Platelets',              250, -8,  -3, 'expired',   'cleared', 'proper', 8, 'Gurugram'),

            # Reserved Units
            (1048, 'BL-1048', 'O+',  'Packed Red Blood Cells', 450, -35, 7,  'reserved',  'cleared', 'proper', 2, 'Delhi'),
            (1049, 'BL-1049', 'A+',  'Packed Red Blood Cells', 450, -32, 10, 'reserved',  'cleared', 'proper', 3, 'Noida'),
            (1050, 'BL-1050', 'B+',  'Whole Blood',            450, -20, 15, 'reserved',  'cleared', 'proper', 9, 'Noida'),
            (1051, 'BL-1051', 'O-',  'Packed Red Blood Cells', 450, -38, 4,  'reserved',  'cleared', 'proper', 5, 'Faridabad'),

            # Used Units
            (1052, 'BL-1052', 'O+',  'Packed Red Blood Cells', 450, -30, 12, 'used',      'cleared', 'proper', 7, 'Delhi'),
            (1053, 'BL-1053', 'A-',  'Packed Red Blood Cells', 450, -28, 14, 'used',      'cleared', 'proper', 8, 'Gurugram'),
            (1054, 'BL-1054', 'B-',  'Whole Blood',            450, -25, 10, 'used',      'cleared', 'proper', 11, 'Delhi'),

            # Screening Pending / Failed
            (1055, 'BL-1055', 'O+',  'Packed Red Blood Cells', 450, -5,  37, 'available', 'pending', 'proper', 2, 'Delhi'),
            (1056, 'BL-1056', 'A+',  'Packed Red Blood Cells', 450, -3,  39, 'available', 'pending', 'proper', 3, 'Noida'),
            (1057, 'BL-1057', 'B+',  'Whole Blood',            450, -6,  29, 'available', 'failed',  'proper', 4, 'Ghaziabad'),
            (1058, 'BL-1058', 'O-',  'Packed Red Blood Cells', 450, -4,  38, 'available', 'failed',  'proper', 6, 'Delhi'),

            # Improper Storage Status
            (1059, 'BL-1059', 'O+',  'Packed Red Blood Cells', 450, -15, 27, 'available', 'cleared', 'temperature_excursion', 2, 'Delhi'),
            (1060, 'BL-1060', 'AB-', 'Whole Blood',            450, -12, 23, 'available', 'cleared', 'quarantine', 8, 'Gurugram'),

            # Additional Units (Normal shelf life > 20 days so demo units 1-4 take priority)
            (1061, 'BL-1061', 'O+',  'Packed Red Blood Cells', 450, -20, 21, 'available', 'cleared', 'proper', 6, 'Noida'),
            (1062, 'BL-1062', 'O+',  'Packed Red Blood Cells', 450, -18, 25, 'available', 'cleared', 'proper', 9, 'Noida'),
            (1063, 'BL-1063', 'O+',  'Packed Red Blood Cells', 450, -15, 28, 'available', 'cleared', 'proper', 11, 'Faridabad'),
            (1064, 'BL-1064', 'O+',  'Packed Red Blood Cells', 450, -12, 32, 'available', 'cleared', 'proper', 12, 'Noida'),
            (1065, 'BL-1065', 'O+',  'Platelets',              250, -2,  3,  'available', 'cleared', 'proper', 3, 'Noida'),
            (1066, 'BL-1066', 'O+',  'Fresh Frozen Plasma',    300, -120, 245, 'available', 'cleared', 'proper', 4, 'Ghaziabad'),
            (1067, 'BL-1067', 'A+',  'Packed Red Blood Cells', 450, -39, 3,  'available', 'cleared', 'proper', 8, 'Gurugram'),
            (1068, 'BL-1068', 'A+',  'Packed Red Blood Cells', 450, -35, 7,  'available', 'cleared', 'proper', 10, 'Gurugram'),
            (1069, 'BL-1069', 'A+',  'Packed Red Blood Cells', 450, -30, 12, 'available', 'cleared', 'proper', 2, 'Delhi'),
            (1070, 'BL-1070', 'A+',  'Whole Blood',            450, -24, 11, 'available', 'cleared', 'proper', 5, 'Faridabad'),
            (1071, 'BL-1071', 'B+',  'Packed Red Blood Cells', 450, -38, 4,  'available', 'cleared', 'proper', 7, 'Delhi'),
            (1072, 'BL-1072', 'B+',  'Packed Red Blood Cells', 450, -33, 9,  'available', 'cleared', 'proper', 9, 'Noida'),
            (1073, 'BL-1073', 'B+',  'Whole Blood',            450, -27, 8,  'available', 'cleared', 'proper', 11, 'Delhi'),
            (1074, 'BL-1074', 'B+',  'Platelets',              250, -1,  4,  'available', 'cleared', 'proper', 12, 'Noida'),
            (1075, 'BL-1075', 'AB+', 'Packed Red Blood Cells', 450, -37, 5,  'available', 'cleared', 'proper', 2, 'Delhi'),
            (1076, 'BL-1076', 'AB+', 'Whole Blood',            450, -26, 9,  'available', 'cleared', 'proper', 6, 'Delhi'),
            (1077, 'BL-1077', 'AB+', 'Fresh Frozen Plasma',    300, -150, 215, 'available', 'cleared', 'proper', 3, 'Noida'),
            (1078, 'BL-1078', 'O-',  'Packed Red Blood Cells', 450, -39, 3,  'available', 'cleared', 'proper', 4, 'Ghaziabad'),
            (1079, 'BL-1079', 'O-',  'Packed Red Blood Cells', 450, -36, 6,  'available', 'cleared', 'proper', 8, 'Gurugram'),
            (1080, 'BL-1080', 'O-',  'Whole Blood',            450, -28, 7,  'available', 'cleared', 'proper', 10, 'Gurugram'),
            (1081, 'BL-1081', 'A-',  'Packed Red Blood Cells', 450, -38, 4,  'available', 'cleared', 'proper', 7, 'Delhi'),
            (1082, 'BL-1082', 'A-',  'Whole Blood',            450, -26, 9,  'available', 'cleared', 'proper', 9, 'Noida'),
            (1083, 'BL-1083', 'B-',  'Packed Red Blood Cells', 450, -37, 5,  'available', 'cleared', 'proper', 5, 'Faridabad'),
            (1084, 'BL-1084', 'B-',  'Platelets',              250, -3,  2,  'available', 'cleared', 'proper', 2, 'Delhi'),
            (1085, 'BL-1085', 'AB-', 'Packed Red Blood Cells', 450, -39, 3,  'available', 'cleared', 'proper', 11, 'Delhi'),
            (1086, 'BL-1086', 'AB-', 'Fresh Frozen Plasma',    300, -180, 185, 'available', 'cleared', 'proper', 12, 'Noida'),
            (1087, 'BL-1087', 'O+',  'Packed Red Blood Cells', 450, -25, 24, 'available', 'cleared', 'proper', 3, 'Noida'),
            (1088, 'BL-1088', 'O+',  'Packed Red Blood Cells', 450, -15, 27, 'available', 'cleared', 'proper', 8, 'Gurugram'),
            (1089, 'BL-1089', 'A+',  'Whole Blood',            450, -18, 17, 'available', 'cleared', 'proper', 4, 'Ghaziabad'),
            (1090, 'BL-1090', 'B+',  'Fresh Frozen Plasma',    300, -200, 165, 'available', 'cleared', 'proper', 6, 'Delhi'),
            (1091, 'BL-1091', 'O-',  'Packed Red Blood Cells', 450, -24, 18, 'available', 'cleared', 'proper', 7, 'Delhi'),
            (1092, 'BL-1092', 'A-',  'Platelets',              250, -1,  4,  'available', 'cleared', 'proper', 5, 'Faridabad'),
            (1093, 'BL-1093', 'AB+', 'Whole Blood',            450, -15, 20, 'available', 'cleared', 'proper', 9, 'Noida'),
            (1094, 'BL-1094', 'O+',  'Packed Red Blood Cells', 450, -10, 32, 'available', 'cleared', 'proper', 10, 'Gurugram'),
            (1095, 'BL-1095', 'B+',  'Packed Red Blood Cells', 450, -21, 21, 'available', 'cleared', 'proper', 2, 'Delhi'),
            (1096, 'BL-1096', 'O+',  'Platelets',              250, -1,  4,  'available', 'cleared', 'proper', 11, 'Delhi'),
            (1097, 'BL-1097', 'A+',  'Packed Red Blood Cells', 450, -14, 28, 'available', 'cleared', 'proper', 12, 'Noida'),
            (1098, 'BL-1098', 'O-',  'Whole Blood',            450, -11, 24, 'available', 'cleared', 'proper', 6, 'Delhi'),
            (1099, 'BL-1099', 'B-',  'Packed Red Blood Cells', 450, -16, 26, 'available', 'cleared', 'proper', 4, 'Ghaziabad'),
            (1100, 'BL-1100', 'AB-', 'Packed Red Blood Cells', 450, -12, 30, 'available', 'cleared', 'proper', 8, 'Gurugram')
        ]

        count = 0
        for uid, code, bg_str, comp_str, qty, col_offset, exp_offset, st, scr, stor, hid, cty in raw_units:
            unit = db.query(BloodInventory).filter(BloodInventory.id == uid).first()
            if not unit:
                unit = BloodInventory(
                    id=uid,
                    unit_code=code,
                    facility_id=1,  # fallback facility reference
                    batch_number=f"BATCH-H2H-{code}",
                    blood_group=bg_str,
                    component=comp_map.get(comp_str, ComponentType.PRBC),
                    quantity_ml=qty,
                    units_available=1 if st == 'available' else 0,
                    reserved_units=1 if st == 'reserved' else 0,
                    collected_date=today + timedelta(days=col_offset),
                    expiry_date=today + timedelta(days=exp_offset),
                    expiration_date=today + timedelta(days=exp_offset),
                    status=st,
                    screening_status=scr,
                    storage_status=stor,
                    hospital_id=hid,
                    hospital_name=hosp_map.get(hid, 'Delhi Hospital'),
                    city=cty,
                    source_tag="H2H_HOSPITAL_NETWORK"
                )
                db.add(unit)
                count += 1
            else:
                # Update existing unit attributes
                unit.unit_code = code
                unit.blood_group = bg_str
                unit.component = comp_map.get(comp_str, ComponentType.PRBC)
                unit.quantity_ml = qty
                unit.collected_date = today + timedelta(days=col_offset)
                unit.expiry_date = today + timedelta(days=exp_offset)
                unit.expiration_date = today + timedelta(days=exp_offset)
                unit.status = st
                unit.screening_status = scr
                unit.storage_status = stor
                unit.hospital_id = hid
                unit.hospital_name = hosp_map.get(hid, 'Delhi Hospital')
                unit.city = cty

        db.commit()
        print(f"Successfully seeded/updated {len(raw_units)} blood inventory units for Hospital Blood Exchange.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding hospital exchange data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_hospital_exchange()
