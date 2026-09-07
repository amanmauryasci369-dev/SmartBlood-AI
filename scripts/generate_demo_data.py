import os
import random
import csv
from datetime import date, datetime, timedelta
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"
DATABASE_DIR = Path(__file__).parent.parent / "database"

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
COMPONENTS = ["PACKED_RED_BLOOD_CELLS", "PLATELET_CONCENTRATE", "FRESH_FROZEN_PLASMA", "WHOLE_BLOOD"]
URGENCY_LEVELS = ["CRITICAL_IMMEDIATE", "URGENT_UNDER_4H", "ELECTIVE"]

CITIES = [
    {"name": "Delhi", "state": "Delhi", "lat": 28.6139, "lon": 77.2090},
    {"name": "Noida", "state": "Uttar Pradesh", "lat": 28.5355, "lon": 77.3910},
    {"name": "Gurugram", "state": "Haryana", "lat": 28.4595, "lon": 77.0266},
    {"name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777},
    {"name": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946},
    {"name": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867},
    {"name": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639},
    {"name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707}
]


def generate_all_demo_data(seed: int = 42):
    random.seed(seed)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    DATABASE_DIR.mkdir(parents=True, exist_ok=True)

    print("Generating 50 Blood Banks...")
    blood_banks = []
    for i in range(1, 51):
        city = random.choice(CITIES)
        lat = city["lat"] + random.uniform(-0.08, 0.08)
        lon = city["lon"] + random.uniform(-0.08, 0.08)
        name_prefix = random.choice(["Red Cross Regional", "City Transfusion", "Apex Charitable", "Civil Hospital", "National Rotary"])
        blood_banks.append({
            "id": i,
            "name": f"{city['name']} {name_prefix} Blood Center #{i}",
            "license_number": f"BB-{city['state'][:2].upper()}-{2026:04d}-{i:03d}",
            "district": city["name"],
            "state": city["state"],
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "contact_number": f"+91 {random.randint(11, 99)} {random.randint(20000000, 29999999)}",
            "storage_capacity": random.choice([500, 800, 1200, 2000]),
            "cold_chain_verified": True if random.random() > 0.1 else False,
            "is_active": True
        })

    with open(DATA_DIR / "blood_banks.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=blood_banks[0].keys())
        writer.writeheader()
        writer.writerows(blood_banks)

    print("Generating 50 Hospitals...")
    hospitals = []
    for i in range(1, 51):
        city = random.choice(CITIES)
        lat = city["lat"] + random.uniform(-0.08, 0.08)
        lon = city["lon"] + random.uniform(-0.08, 0.08)
        has_trauma = True if random.random() > 0.45 else False
        name_prefix = random.choice(["Apex Trauma Hospital", "Memorial Medical Institute", "District Civil Hospital", "Super-Specialty Hospital", "Government Medical College"])
        hospitals.append({
            "id": i,
            "name": f"{city['name']} {name_prefix} #{i}",
            "license_number": f"HOSP-{city['state'][:2].upper()}-{i:03d}",
            "district": city["name"],
            "state": city["state"],
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "contact_number": f"+91 {random.randint(11, 99)} {random.randint(24000000, 29999999)}",
            "has_trauma_center": has_trauma,
            "bed_capacity": random.choice([250, 450, 750, 1200, 2000]),
            "is_active": True
        })

    with open(DATA_DIR / "hospitals.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=hospitals[0].keys())
        writer.writeheader()
        writer.writerows(hospitals)

    print("Generating 5,000 Privacy-Preserving Donors...")
    first_names = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Diya", "Saanvi", "Aanya", "Aadhya", "Pari", "Ananya", "Myra", "Riya", "Pooja", "Priya"]
    donors = []
    today = date.today()
    for i in range(1, 5001):
        city = random.choice(CITIES)
        lat = city["lat"] + random.uniform(-0.05, 0.05)
        lon = city["lon"] + random.uniform(-0.05, 0.05)
        last_donation_days = random.randint(15, 365)
        last_donation = today - timedelta(days=last_donation_days)
        is_eligible = last_donation_days >= 90
        phone_suffix = f"{random.randint(1000, 9999)}"

        donors.append({
            "id": i,
            "public_donor_tag": f"DONOR-{city['state'][:2].upper()}-{i:05d}",
            "blood_group": random.choice(BLOOD_GROUPS),
            "district": city["name"],
            "state": city["state"],
            "latitude": round(lat, 5),
            "longitude": round(lon, 5),
            "phone_masked": f"+91 ******{phone_suffix}",
            "last_donation_date": last_donation.isoformat(),
            "is_eligible": is_eligible,
            "total_donations": random.randint(1, 14),
            "emergency_donor_opt_in": True if random.random() > 0.3 else False,
            "response_probability": round(random.uniform(0.65, 0.98), 2)
        })

    with open(DATA_DIR / "donors.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=donors[0].keys())
        writer.writeheader()
        writer.writerows(donors)

    print("Generating 10,000 Inventory Records...")
    inventory = []
    for i in range(1, 10001):
        bank = random.choice(blood_banks)
        bg = random.choice(BLOOD_GROUPS)
        comp = random.choice(COMPONENTS)
        
        # Shelf life by component
        if comp == "PLATELET_CONCENTRATE":
            shelf_days = 5
            units = random.randint(2, 12)
            temp = 22.0
        elif comp == "PACKED_RED_BLOOD_CELLS":
            shelf_days = 35
            units = random.randint(4, 30)
            temp = 4.0
        elif comp == "FRESH_FROZEN_PLASMA":
            shelf_days = 365
            units = random.randint(8, 45)
            temp = -22.0
        else:
            shelf_days = 35
            units = random.randint(3, 20)
            temp = 4.0

        collected_offset = random.randint(1, min(shelf_days, 60))
        collected = today - timedelta(days=collected_offset)
        expires = collected + timedelta(days=shelf_days)

        status = "CONFIRMED_AVAILABILITY" if random.random() > 0.35 else "REPORTED_AVAILABILITY"

        inventory.append({
            "id": i,
            "facility_id": bank["id"],
            "blood_group": bg,
            "component": comp,
            "units_available": units,
            "batch_number": f"BATCH-{bank['id']:02d}-{bg.replace('+', 'P').replace('-', 'N')}-{i:05d}",
            "status": status,
            "collected_date": collected.isoformat(),
            "expiry_date": expires.isoformat(),
            "temperature_celsius": temp,
            "is_quarantined": False if random.random() > 0.05 else True,
            "source_tag": "SYNTHETIC_ERAKTKOSH_COMPATIBLE_FEED" if status == "REPORTED_AVAILABILITY" else "DIRECT_LAB_VERIFIED"
        })

    with open(DATA_DIR / "inventory.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=inventory[0].keys())
        writer.writeheader()
        writer.writerows(inventory)

    print("Generating 20,000 Longitudinal Historical Demand Records...")
    demand_history = []
    base_date = today - timedelta(days=365)
    for i in range(1, 20001):
        hosp = random.choice(hospitals)
        bg = random.choice(BLOOD_GROUPS)
        comp = random.choice(COMPONENTS)
        day_offset = random.randint(0, 365)
        rec_date = base_date + timedelta(days=day_offset)
        
        # Dengue surge in July-October (months 7-10) for platelets
        dengue_index = random.uniform(1.8, 3.2) if (7 <= rec_date.month <= 10 and comp == "PLATELET_CONCENTRATE") else 1.0
        base_burn = random.randint(4, 25)
        if hosp["has_trauma_center"] and bg in ["O-", "O+", "A+"]:
            base_burn = int(base_burn * 1.4)
            
        consumed = int(base_burn * dengue_index)

        demand_history.append({
            "id": i,
            "hospital_id": hosp["id"],
            "blood_group": bg,
            "component": comp,
            "consumption_date": rec_date.isoformat(),
            "units_consumed": consumed,
            "was_emergency_surge": True if dengue_index > 1.5 or hosp["has_trauma_center"] else False,
            "seasonal_dengue_index": round(dengue_index, 2)
        })

    with open(DATA_DIR / "demand_history.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=demand_history[0].keys())
        writer.writeheader()
        writer.writerows(demand_history)

    print("Generating 5,000 Historical & Active Blood Requests...")
    blood_requests = []
    for i in range(1, 5001):
        hosp = random.choice(hospitals)
        bg = random.choice(BLOOD_GROUPS)
        comp = random.choice(COMPONENTS)
        urgency = random.choices(URGENCY_LEVELS, weights=[0.3, 0.4, 0.3])[0]
        req_offset = random.randint(0, 180)
        req_date = today - timedelta(days=req_offset)
        status = random.choice(["FULFILLED", "FULFILLED", "DISPATCHED", "PENDING_COORDINATION"])

        blood_requests.append({
            "id": i,
            "hospital_id": hosp["id"],
            "blood_group": bg,
            "component": comp,
            "units_required": random.randint(1, 8),
            "urgency_level": urgency,
            "clinical_notes": f"Emergency triage admission #{i} at {hosp['district']}",
            "status": status,
            "allocated_blood_bank_id": random.randint(1, 50) if status != "PENDING_COORDINATION" else None,
            "allocated_units": random.randint(1, 8) if status != "PENDING_COORDINATION" else 0,
            "created_at": req_date.isoformat()
        })

    with open(DATA_DIR / "blood_requests.csv", "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=blood_requests[0].keys())
        writer.writeheader()
        writer.writerows(blood_requests)

    # Generate initial SQL seed script
    with open(DATABASE_DIR / "seed.sql", "w") as f:
        f.write("-- SmartBlood AI Initial Seed SQL\n")
        f.write("INSERT INTO roles (name, description) VALUES\n")
        f.write("('ADMIN', 'Regional Transfusion Command Administrator'),\n")
        f.write("('BLOOD_BANK', 'Blood Bank Laboratory Verification Officer'),\n")
        f.write("('HOSPITAL', 'Hospital Emergency & Transfusion Department'),\n")
        f.write("('DONOR', 'Registered Voluntary Blood Donor'),\n")
        f.write("('PATIENT', 'Patient Family / Emergency Seeker')\n")
        f.write("ON CONFLICT (name) DO NOTHING;\n")

    print("Data generation complete! All CSV assets saved to data/ and seed.sql created.")


if __name__ == "__main__":
    generate_all_demo_data()
