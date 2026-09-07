from datetime import date, datetime, timedelta, timezone
from app.core.config import UserRole, BloodGroup, ComponentType, AvailabilityStatus
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import User
from app.models.facility import BloodBank, Hospital
from app.models.inventory import BloodInventory
from app.models.donor import DonorProfile
from app.models.shelf_life import ComponentShelfLifeRule
from app.models.wastage import WastageRecord
from app.models.system_config import SystemConfiguration


def seed_database():
    """Seed comprehensive demo network for SIH presentation."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    today = date.today()
    now = datetime.now(timezone.utc)

    try:
        # 1. Seed Facilities
        if db.query(BloodBank).count() == 0:
            banks = [
                BloodBank(
                    name="Delhi Red Cross Regional Transfusion Centre",
                    license_number="BB-DL-001",
                    district="Central Delhi",
                    state="Delhi",
                    latitude=28.6250,
                    longitude=77.2183,
                    contact_number="+91 11 23716441",
                    storage_capacity=1500,
                    cold_chain_verified=True,
                    is_active=True
                ),
                BloodBank(
                    name="Safdarjung Hospital Regional Blood Centre",
                    license_number="BB-DL-002",
                    district="South Delhi",
                    state="Delhi",
                    latitude=28.5701,
                    longitude=77.2078,
                    contact_number="+91 11 26165060",
                    storage_capacity=1200,
                    cold_chain_verified=True,
                    is_active=True
                ),
                BloodBank(
                    name="Noida District Combined Blood Bank",
                    license_number="BB-UP-001",
                    district="Gautam Buddha Nagar",
                    state="Uttar Pradesh",
                    latitude=28.5708,
                    longitude=77.3489,
                    contact_number="+91 120 2456789",
                    storage_capacity=800,
                    cold_chain_verified=True,
                    is_active=True
                ),
                BloodBank(
                    name="Gurugram Civil Hospital Blood Center",
                    license_number="BB-HR-001",
                    district="Gurugram",
                    state="Haryana",
                    latitude=28.4595,
                    longitude=77.0266,
                    contact_number="+91 124 2320102",
                    storage_capacity=750,
                    cold_chain_verified=True,
                    is_active=True
                )
            ]
            db.add_all(banks)
            db.commit()

        if db.query(Hospital).count() == 0:
            hospitals = [
                Hospital(
                    name="AIIMS Apex Trauma Center",
                    license_number="HOSP-DL-001",
                    district="South Delhi",
                    state="Delhi",
                    latitude=28.5672,
                    longitude=77.2100,
                    contact_number="+91 11 26588500",
                    has_trauma_center=True,
                    bed_capacity=1200,
                    is_active=True
                ),
                Hospital(
                    name="Lok Nayak Jai Prakash Narayan Hospital",
                    license_number="HOSP-DL-002",
                    district="Central Delhi",
                    state="Delhi",
                    latitude=28.6369,
                    longitude=77.2410,
                    contact_number="+91 11 23236000",
                    has_trauma_center=True,
                    bed_capacity=2000,
                    is_active=True
                ),
                Hospital(
                    name="Fortis Memorial Research Institute",
                    license_number="HOSP-HR-001",
                    district="Gurugram",
                    state="Haryana",
                    latitude=28.4554,
                    longitude=77.0722,
                    contact_number="+91 124 4962200",
                    has_trauma_center=False,
                    bed_capacity=450,
                    is_active=True
                )
            ]
            db.add_all(hospitals)
            db.commit()

        # 2. Seed Users across all 5 roles
        demo_users = [
            {
                "email": "admin@smartblood.gov",
                "password": "AdminPassword123!",
                "full_name": "Dr. Rajesh Verma (Regional Director)",
                "role": UserRole.ADMIN,
                "phone_masked": "+91 ******8890"
            },
            {
                "email": "bloodbank@redcross.org",
                "password": "BankPassword123!",
                "full_name": "Sunita Rao (Lead Transfusionist)",
                "role": UserRole.BLOOD_BANK,
                "facility_type": "BLOOD_BANK",
                "facility_id": 1,
                "phone_masked": "+91 ******4412"
            },
            {
                "email": "trauma@aiims.edu",
                "password": "HospitalPassword123!",
                "full_name": "Dr. Vikram Sethi (Trauma Chief)",
                "role": UserRole.HOSPITAL,
                "facility_type": "HOSPITAL",
                "facility_id": 1,
                "phone_masked": "+91 ******6621"
            },
            {
                "email": "donor.priya@example.com",
                "password": "DonorPassword123!",
                "full_name": "Priya Nair",
                "role": UserRole.DONOR,
                "phone_masked": "+91 ******2314"
            },
            {
                "email": "patient.rahul@example.com",
                "password": "PatientPassword123!",
                "full_name": "Rahul Mehra",
                "role": UserRole.PATIENT,
                "phone_masked": "+91 ******9981"
            }
        ]

        for u in demo_users:
            if not db.query(User).filter(User.email == u["email"]).first():
                user_obj = User(
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    full_name=u["full_name"],
                    role=u["role"],
                    phone_masked=u["phone_masked"],
                    facility_type=u.get("facility_type"),
                    facility_id=u.get("facility_id"),
                    is_active=True
                )
                db.add(user_obj)
                db.commit()
                db.refresh(user_obj)

                if u["role"] == UserRole.DONOR:
                    # Create masked donor profile
                    donor = DonorProfile(
                        user_id=user_obj.id,
                        blood_group="O+",
                        last_donation_date=date.today() - timedelta(days=95),
                        is_eligible=True,
                        total_donations=4,
                        public_donor_tag=f"DONOR-DL-{user_obj.id:04d}",
                        emergency_donor_opt_in=True,
                        preferred_district="Central Delhi"
                    )
                    db.add(donor)
                    db.commit()

        # 3. Seed Realistic Multi-Facility Inventory
        if db.query(BloodInventory).count() == 0:
            today = date.today()
            banks_in_db = db.query(BloodBank).all()

            inventory_batches = []
            for b in banks_in_db:
                # Add confirmed units
                inventory_batches.extend([
                    # Critical Universal Donor O- Negative (PRBC)
                    BloodInventory(
                        facility_id=b.id,
                        blood_group=BloodGroup.O_NEG,
                        component=ComponentType.PRBC,
                        units_available=8 if b.id == 2 else 4,
                        batch_number=f"PRBC-ONEG-{b.id}-101",
                        status=AvailabilityStatus.CONFIRMED,
                        collected_date=today - timedelta(days=12),
                        expiry_date=today + timedelta(days=23),
                        temperature_celsius=4.0,
                        source_tag="DIRECT_LAB_VERIFIED"
                    ),
                    # High-Demand O+ Positive
                    BloodInventory(
                        facility_id=b.id,
                        blood_group=BloodGroup.O_POS,
                        component=ComponentType.PRBC,
                        units_available=18,
                        batch_number=f"PRBC-OPOS-{b.id}-102",
                        status=AvailabilityStatus.CONFIRMED,
                        collected_date=today - timedelta(days=8),
                        expiry_date=today + timedelta(days=27),
                        temperature_celsius=3.9,
                        source_tag="DIRECT_LAB_VERIFIED"
                    ),
                    # Platelets (short shelf-life demo case - 2 days remaining!)
                    BloodInventory(
                        facility_id=b.id,
                        blood_group=BloodGroup.A_POS,
                        component=ComponentType.PLATELETS,
                        units_available=7,
                        batch_number=f"PLT-APOS-{b.id}-201",
                        status=AvailabilityStatus.CONFIRMED,
                        collected_date=today - timedelta(days=3),
                        expiry_date=today + timedelta(days=2),  # Expiring soon!
                        temperature_celsius=22.0,
                        source_tag="DIRECT_LAB_VERIFIED"
                    ),
                    # Fresh Frozen Plasma (FFP)
                    BloodInventory(
                        facility_id=b.id,
                        blood_group=BloodGroup.AB_POS,
                        component=ComponentType.FFP,
                        units_available=22,
                        batch_number=f"FFP-ABPOS-{b.id}-301",
                        status=AvailabilityStatus.CONFIRMED,
                        collected_date=today - timedelta(days=40),
                        expiry_date=today + timedelta(days=325),
                        temperature_celsius=-22.0,
                        source_tag="DIRECT_LAB_VERIFIED"
                    ),
                    # Reported Availability feed from synthetic adapter (unconfirmed)
                    BloodInventory(
                        facility_id=b.id,
                        blood_group=BloodGroup.B_POS,
                        component=ComponentType.PRBC,
                        units_available=14,
                        batch_number=f"SYN-FEED-BPOS-{b.id}-401",
                        status=AvailabilityStatus.REPORTED,
                        collected_date=today - timedelta(days=4),
                        expiry_date=today + timedelta(days=31),
                        temperature_celsius=4.2,
                        source_tag="SYNTHETIC_ERAKTKOSH_COMPATIBLE_FEED"
                    )
                ])

            db.add_all(inventory_batches)
            db.commit()

        # 5. Seed Component Shelf-Life Rules (Step 2)
        if db.query(ComponentShelfLifeRule).count() == 0:
            rules = [
                ComponentShelfLifeRule(
                    component="PRBC",
                    storage_method="2°C to 6°C in specialized blood bank refrigerator with continuous temperature logging",
                    shelf_life_value=42,
                    shelf_life_unit="DAYS",
                    regulatory_reference="DGHS / NACO Technical Manual 3rd Edition; CPDA-1/SAGM anticoagulant solution",
                    active=True
                ),
                ComponentShelfLifeRule(
                    component="PLATELETS",
                    storage_method="20°C to 24°C in platelet incubator with continuous horizontal agitation (60 RPM)",
                    shelf_life_value=5,
                    shelf_life_unit="DAYS",
                    regulatory_reference="DGHS Standards for Blood Banks and Transfusion Services; AABB Standards",
                    active=True
                ),
                ComponentShelfLifeRule(
                    component="FFP",
                    storage_method="Deep frozen at -18°C or colder in plasma ultra-low freezer",
                    shelf_life_value=365,
                    shelf_life_unit="DAYS",
                    regulatory_reference="DGHS National Blood Policy Guidelines; CDSCO Form 28-C",
                    active=True
                ),
                ComponentShelfLifeRule(
                    component="CRYOPRECIPITATE",
                    storage_method="Frozen at -18°C or colder; thawed at 37°C prior to transfusion",
                    shelf_life_value=365,
                    shelf_life_unit="DAYS",
                    regulatory_reference="DGHS Blood Transfusion Safety Regulations",
                    active=True
                ),
                ComponentShelfLifeRule(
                    component="WHOLE_BLOOD",
                    storage_method="2°C to 6°C in cold storage with CPDA-1 solution",
                    shelf_life_value=35,
                    shelf_life_unit="DAYS",
                    regulatory_reference="Drugs & Cosmetics Act, 1940 (Rules 122F-122P)",
                    active=True
                )
            ]
            db.add_all(rules)
            db.commit()

        # 6. Seed Dynamic System Configurations (Step 18)
        if db.query(SystemConfiguration).count() == 0:
            configs = [
                SystemConfiguration(
                    key="INVENTORY_STALE_HOURS",
                    value="24",
                    data_type="INT",
                    category="INVENTORY",
                    description="Maximum elapsed hours without lab confirmation before inventory is flagged as stale"
                ),
                SystemConfiguration(
                    key="EXPIRY_WARNING_DAYS",
                    value="7",
                    data_type="INT",
                    category="EXPIRY",
                    description="Days remaining threshold triggering APPROACHING_EXPIRY status tier"
                ),
                SystemConfiguration(
                    key="EXPIRY_CRITICAL_DAYS",
                    value="3",
                    data_type="INT",
                    category="EXPIRY",
                    description="Days remaining threshold triggering HIGH_EXPIRY_RISK status tier"
                ),
                SystemConfiguration(
                    key="SHORTAGE_THRESHOLD_MULTIPLIER",
                    value="1.2",
                    data_type="FLOAT",
                    category="PREDICTION",
                    description="Safety buffer multiplier applied to forecasted demand when computing shortage risk"
                ),
                SystemConfiguration(
                    key="MIN_SAFETY_STOCK_UNITS",
                    value="5",
                    data_type="INT",
                    category="SAFETY_STOCK",
                    description="Minimum acceptable threshold of confirmed compatible units before critical alert triggers"
                ),
                SystemConfiguration(
                    key="WASTAGE_RISK_THRESHOLD",
                    value="0.15",
                    data_type="FLOAT",
                    category="WASTAGE",
                    description="Predicted wastage risk probability above which clinical alerts are escalated"
                )
            ]
            db.add_all(configs)
            db.commit()

        # 7. Seed Wastage Records (Step 6)
        if db.query(WastageRecord).count() == 0:
            banks = db.query(BloodBank).all()
            records = []
            reasons = ["EXPIRY", "TTI_REACTIVE", "DAMAGED", "QUALITY_CONTROL", "OTHER"]
            for idx, bank in enumerate(banks):
                records.extend([
                    WastageRecord(
                        blood_bank_id=bank.id,
                        blood_group=BloodGroup.O_POS,
                        component=ComponentType.PLATELETS,
                        quantity=3,
                        reason="EXPIRY",
                        recorded_at=today - timedelta(days=5),
                        notes="Platelet units exceeded 5-day shelf life during weekend routine hold"
                    ),
                    WastageRecord(
                        blood_bank_id=bank.id,
                        blood_group=BloodGroup.B_POS,
                        component=ComponentType.PRBC,
                        quantity=2,
                        reason="TTI_REACTIVE",
                        recorded_at=today - timedelta(days=12),
                        notes="ELISA screening reactive for HBsAg; standard biohazard disposal per protocol"
                    ),
                    WastageRecord(
                        blood_bank_id=bank.id,
                        blood_group=BloodGroup.A_POS,
                        component=ComponentType.FFP,
                        quantity=1,
                        reason="DAMAGED",
                        recorded_at=today - timedelta(days=18),
                        notes="Bag port rupture during sub-zero storage handling"
                    ),
                    WastageRecord(
                        blood_bank_id=bank.id,
                        blood_group=BloodGroup.AB_POS,
                        component=ComponentType.PRBC,
                        quantity=1,
                        reason="QUALITY_CONTROL",
                        recorded_at=today - timedelta(days=22),
                        notes="Underfilled collection volume (<315ml) failing hemovigilance QC standard"
                    ),
                    WastageRecord(
                        blood_bank_id=bank.id,
                        blood_group=BloodGroup.O_NEG,
                        component=ComponentType.PLATELETS,
                        quantity=2,
                        reason="EXPIRY",
                        recorded_at=today - timedelta(days=28),
                        notes="No matching emergency requisition within 120-hour window"
                    )
                ])
            db.add_all(records)
            db.commit()

        print("Database seeded successfully with realistic demo network, shelf-life rules, configs, and wastage history!")

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
