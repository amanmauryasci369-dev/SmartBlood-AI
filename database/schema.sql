-- SmartBlood AI PostgreSQL Database Schema
-- SIH Problem Statement: 26202

CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'PATIENT',
    phone_masked VARCHAR(50),
    facility_type VARCHAR(50),
    facility_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blood_banks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    contact_number VARCHAR(50) NOT NULL,
    storage_capacity INTEGER DEFAULT 500,
    cold_chain_verified BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    contact_number VARCHAR(50) NOT NULL,
    has_trauma_center BOOLEAN DEFAULT FALSE,
    bed_capacity INTEGER DEFAULT 200,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    public_donor_tag VARCHAR(100) UNIQUE NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    district VARCHAR(100) NOT NULL,
    latitude FLOAT,
    longitude FLOAT,
    last_donation_date DATE,
    is_eligible BOOLEAN DEFAULT TRUE,
    total_donations INTEGER DEFAULT 0,
    emergency_donor_opt_in BOOLEAN DEFAULT FALSE,
    response_probability FLOAT DEFAULT 0.85,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blood_inventory (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES blood_banks(id) ON DELETE CASCADE,
    unit_code VARCHAR(100) UNIQUE,
    blood_group VARCHAR(10) NOT NULL,
    component VARCHAR(50) NOT NULL,
    quantity_ml INTEGER NOT NULL DEFAULT 450,
    units_available INTEGER NOT NULL DEFAULT 1,
    reserved_units INTEGER NOT NULL DEFAULT 0,
    issued_units INTEGER NOT NULL DEFAULT 0,
    expired_units INTEGER NOT NULL DEFAULT 0,
    batch_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    screening_status VARCHAR(50) NOT NULL DEFAULT 'cleared',
    blood_bank_name VARCHAR(255),
    city VARCHAR(100),
    collected_date DATE NOT NULL,
    processing_date DATE,
    expiry_date DATE NOT NULL,
    expiration_date DATE,
    temperature_celsius FLOAT DEFAULT 4.0,
    is_quarantined BOOLEAN DEFAULT FALSE,
    source_tag VARCHAR(100) DEFAULT 'DIRECT_BANK_LOG',
    last_verified_by_user_id INTEGER REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS component_shelf_life_rules (
    id SERIAL PRIMARY KEY,
    component VARCHAR(50) UNIQUE NOT NULL,
    storage_method VARCHAR(255) NOT NULL,
    shelf_life_value INTEGER NOT NULL,
    shelf_life_unit VARCHAR(50) DEFAULT 'DAYS' NOT NULL,
    regulatory_reference VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wastage_records (
    id SERIAL PRIMARY KEY,
    blood_bank_id INTEGER REFERENCES blood_banks(id) ON DELETE CASCADE,
    blood_group VARCHAR(10) NOT NULL,
    component VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    reason VARCHAR(50) NOT NULL, -- EXPIRY, TTI_REACTIVE, DAMAGED, QUALITY_CONTROL, OTHER
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reference_inventory_id INTEGER REFERENCES blood_inventory(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospital_blood_requests (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(100) UNIQUE NOT NULL,
    requesting_hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
    target_hospital_id INTEGER REFERENCES hospitals(id),
    blood_group VARCHAR(10) NOT NULL,
    component VARCHAR(50) NOT NULL,
    quantity INTEGER NOT NULL,
    emergency_level VARCHAR(50) DEFAULT 'CRITICAL' NOT NULL,
    required_by TIMESTAMP WITH TIME ZONE,
    location VARCHAR(255),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    confirmed_by_user_id INTEGER REFERENCES users(id),
    fulfilled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hospital_request_messages (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES hospital_blood_requests(id) ON DELETE CASCADE,
    sender_hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
    sender_user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'COMMUNICATION' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_configurations (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL' NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS blood_requests (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
    blood_group VARCHAR(10) NOT NULL,
    component VARCHAR(50) NOT NULL,
    units_required INTEGER NOT NULL,
    urgency_level VARCHAR(50) NOT NULL DEFAULT 'CRITICAL_IMMEDIATE',
    clinical_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_COORDINATION',
    allocated_blood_bank_id INTEGER REFERENCES blood_banks(id),
    allocated_units INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS demand_history (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
    blood_group VARCHAR(10) NOT NULL,
    component VARCHAR(50) NOT NULL,
    consumption_date DATE NOT NULL,
    units_consumed INTEGER NOT NULL,
    was_emergency_surge BOOLEAN DEFAULT FALSE,
    seasonal_dengue_index FLOAT DEFAULT 1.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS forecasts (
    id SERIAL PRIMARY KEY,
    hospital_id INTEGER REFERENCES hospitals(id),
    blood_group VARCHAR(10) NOT NULL,
    component VARCHAR(50) NOT NULL,
    horizon_days INTEGER NOT NULL,
    predicted_demand_units FLOAT NOT NULL,
    recommended_safety_stock INTEGER NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    mae_score FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shortage_predictions (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES blood_banks(id),
    blood_group VARCHAR(10) NOT NULL,
    component VARCHAR(50) NOT NULL,
    current_stock INTEGER NOT NULL,
    incoming_supply INTEGER NOT NULL DEFAULT 0,
    predicted_demand INTEGER NOT NULL,
    expected_expiry_loss INTEGER NOT NULL DEFAULT 0,
    projected_stock INTEGER NOT NULL,
    shortage_risk_tier VARCHAR(20) NOT NULL,
    recommended_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donor_matches (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES blood_requests(id) ON DELETE CASCADE,
    donor_id INTEGER REFERENCES donors(id) ON DELETE CASCADE,
    match_score FLOAT NOT NULL,
    compatibility_score FLOAT NOT NULL,
    eligibility_score FLOAT NOT NULL,
    distance_km FLOAT NOT NULL,
    response_probability FLOAT NOT NULL,
    rank INTEGER NOT NULL,
    is_notified BOOLEAN DEFAULT FALSE,
    response_status VARCHAR(50) DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS redistribution_recommendations (
    id SERIAL PRIMARY KEY,
    source_bank_id INTEGER REFERENCES blood_banks(id),
    destination_hospital_id INTEGER REFERENCES hospitals(id),
    blood_group VARCHAR(10) NOT NULL,
    component VARCHAR(50) NOT NULL,
    units_recommended INTEGER NOT NULL,
    days_until_expiry INTEGER NOT NULL,
    distance_km FLOAT NOT NULL,
    estimated_transit_mins INTEGER NOT NULL,
    wastage_prevention_score FLOAT NOT NULL,
    explanation TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'RECOMMENDED'
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    severity VARCHAR(20) NOT NULL, -- CRITICAL, WARNING, ATTENTION, OPPORTUNITY
    alert_type VARCHAR(50) NOT NULL, -- SHORTAGE, EXPIRY, ANOMALY, EMERGENCY, STALE_DATA
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_facility_id INTEGER,
    recommended_action TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(100),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_group_comp ON blood_inventory(blood_group, component, status);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON blood_inventory(expiry_date);
CREATE INDEX IF NOT EXISTS idx_requests_status ON blood_requests(status, urgency_level);
CREATE INDEX IF NOT EXISTS idx_demand_date ON demand_history(consumption_date, hospital_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity, is_resolved);
