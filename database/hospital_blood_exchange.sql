-- ============================================================================
-- LifeLink - Hospital Blood Exchange Database Schema & Synthetic Seed Data
-- Module: Hospital-to-Hospital (H2H) FEFO Wastage Reduction Network
-- Target: Supabase / PostgreSQL
-- ============================================================================

-- 1. Ensure Table: hospitals
CREATE TABLE IF NOT EXISTS hospitals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Ensure Table: blood_inventory with H2H fields
CREATE TABLE IF NOT EXISTS blood_inventory (
    id SERIAL PRIMARY KEY,
    unit_code VARCHAR(50) UNIQUE,
    blood_group VARCHAR(10) NOT NULL,
    rh_type VARCHAR(10) DEFAULT 'Positive',
    component VARCHAR(50) NOT NULL,
    quantity INTEGER DEFAULT 450,
    quantity_ml INTEGER DEFAULT 450,
    collection_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'available',           -- available, reserved, used, expired, quarantined
    screening_status VARCHAR(50) DEFAULT 'cleared',   -- cleared, pending, failed
    storage_status VARCHAR(50) DEFAULT 'proper',       -- proper, temperature_excursion, quarantine
    hospital_id INTEGER REFERENCES hospitals(id) ON DELETE SET NULL,
    hospital_name VARCHAR(255),
    city VARCHAR(100),
    storage_location VARCHAR(100) DEFAULT 'Main Cold Bank (2-6°C)',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: blood_requests
CREATE TABLE IF NOT EXISTS blood_requests (
    id SERIAL PRIMARY KEY,
    requesting_hospital_id INTEGER REFERENCES hospitals(id) ON DELETE CASCADE,
    requesting_hospital_name VARCHAR(255),
    providing_hospital_id INTEGER REFERENCES hospitals(id) ON DELETE SET NULL,
    providing_hospital_name VARCHAR(255),
    blood_group VARCHAR(10) NOT NULL,
    component VARCHAR(50) NOT NULL,
    quantity_requested INTEGER NOT NULL,
    required_by TIMESTAMP WITH TIME ZONE,
    search_location VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- pending, accepted, rejected, cancelled, fulfilled
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: blood_request_items
CREATE TABLE IF NOT EXISTS blood_request_items (
    id SERIAL PRIMARY KEY,
    request_id INTEGER REFERENCES blood_requests(id) ON DELETE CASCADE,
    blood_inventory_id INTEGER REFERENCES blood_inventory(id) ON DELETE CASCADE,
    quantity_allocated INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for ultra-fast FEFO search query performance
CREATE INDEX IF NOT EXISTS idx_h2h_inventory_fefo 
ON blood_inventory (blood_group, component, status, screening_status, storage_status, expiration_date);

CREATE INDEX IF NOT EXISTS idx_h2h_requests_hosp 
ON blood_requests (requesting_hospital_id, providing_hospital_id, status);

-- ============================================================================
-- ATOMIC CONCURRENCY FUNCTION: Prevent Double Booking
-- ============================================================================
CREATE OR REPLACE FUNCTION h2h_reserve_blood_units_atomic(
    p_requesting_hospital_id INT,
    p_requesting_hospital_name VARCHAR,
    p_providing_hospital_id INT,
    p_providing_hospital_name VARCHAR,
    p_blood_group VARCHAR,
    p_component VARCHAR,
    p_quantity_requested INT,
    p_required_by TIMESTAMP WITH TIME ZONE,
    p_search_location VARCHAR,
    p_inventory_ids INT[]
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_unit_id INT;
    v_available_count INT;
    v_new_request_id INT;
BEGIN
    -- 1. Explicitly lock the requested inventory rows FOR UPDATE to prevent race conditions
    SELECT COUNT(*) INTO v_available_count
    FROM blood_inventory
    WHERE id = ANY(p_inventory_ids)
      AND status = 'available'
      AND screening_status = 'cleared'
      AND storage_status = 'proper'
      AND expiration_date > CURRENT_DATE
    FOR UPDATE;

    -- 2. Verify all selected units are still strictly available
    IF v_available_count < ARRAY_LENGTH(p_inventory_ids, 1) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'CONCURRENT_DOUBLE_BOOKING_PREVENTED',
            'message', 'One or more selected blood units are no longer available. They may have just been reserved by another hospital.'
        );
    END IF;

    -- 3. Create the master blood request record
    INSERT INTO blood_requests (
        requesting_hospital_id,
        requesting_hospital_name,
        providing_hospital_id,
        providing_hospital_name,
        blood_group,
        component,
        quantity_requested,
        required_by,
        search_location,
        status
    ) VALUES (
        p_requesting_hospital_id,
        p_requesting_hospital_name,
        p_providing_hospital_id,
        p_providing_hospital_name,
        p_blood_group,
        p_component,
        p_quantity_requested,
        p_required_by,
        p_search_location,
        'pending'
    ) RETURNING id INTO v_new_request_id;

    -- 4. Mark all units as 'reserved' and link in blood_request_items
    FOREACH v_unit_id IN ARRAY p_inventory_ids LOOP
        UPDATE blood_inventory
        SET status = 'reserved'
        WHERE id = v_unit_id;

        INSERT INTO blood_request_items (
            request_id,
            blood_inventory_id,
            quantity_allocated
        ) VALUES (
            v_new_request_id,
            v_unit_id,
            1
        );
    END LOOP;

    RETURN jsonb_build_object(
        'success', true,
        'request_id', v_new_request_id,
        'status', 'pending',
        'units_reserved', ARRAY_LENGTH(p_inventory_ids, 1),
        'message', 'Reservation successfully created and inventory locked.'
    );
END;
$$;

-- ============================================================================
-- 5. SEED DATA: 12 Fictional Participating Hospitals (Delhi NCR Hub)
-- ============================================================================
INSERT INTO hospitals (id, name, city, address, contact_email, contact_phone, status)
VALUES
  (1, 'AIIMS Apex Trauma Center', 'Delhi', 'Ring Road, Ansari Nagar, New Delhi', 'trauma@aiims.edu', '+91-11-26588500', 'active'),
  (2, 'CityCare Super Specialty Hospital', 'Delhi', 'Sector 12, Dwarka, New Delhi', 'blooddesk@citycare.org', '+91-11-45678901', 'active'),
  (3, 'Metro Trauma & Emergency Hospital', 'Noida', 'Sector 62, Noida, Uttar Pradesh', 'emergency@metronoida.com', '+91-120-2400111', 'active'),
  (4, 'Fortis Care Medical Institute', 'Ghaziabad', 'Raj Nagar Extension, Ghaziabad', 'transfusion@fortiscare.org', '+91-120-4999888', 'active'),
  (5, 'Apex Multi-Specialty Hospital', 'Faridabad', 'Neelam Bata Road, NIT Faridabad', 'apex.blood@apexfbd.com', '+91-129-2233445', 'active'),
  (6, 'Maxima Heart & Trauma Center', 'Delhi', 'Saket District Centre, New Delhi', 'maxima.transfusion@maxima.org', '+91-11-26515050', 'active'),
  (7, 'Indraprastha Medical Institute', 'Delhi', 'Sarita Vihar, Delhi Mathura Road', 'bloodbank@indraprastha.in', '+91-11-26925858', 'active'),
  (8, 'Medanta LifeCare Hospital', 'Gurugram', 'Sector 38, Gurugram, Haryana', 'transfusion@medantalifecare.org', '+91-124-4141414', 'active'),
  (9, 'Apollo Regional Blood Center', 'Noida', 'Sector 26, Noida, Gautam Buddha Nagar', 'apollo.noida@apollo.org', '+91-120-4012000', 'active'),
  (10, 'Columbia Asia Care Hospital', 'Gurugram', 'Palam Vihar, Gurugram, Haryana', 'blooddesk@columbiaasia.org', '+91-124-6165666', 'active'),
  (11, 'Venkateshwar Super Specialty', 'Delhi', 'Sector 18A, Dwarka, New Delhi', 'transfusion@venkateshwar.org', '+91-11-48555555', 'active'),
  (12, 'Jaypee Trauma & Surgical Hospital', 'Noida', 'Sector 128, Wish Town, Noida', 'trauma@jaypeehospital.com', '+91-120-4122222', 'active')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  city = EXCLUDED.city,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone;

-- Reset sequence to continue safely
SELECT setval('hospitals_id_seq', (SELECT MAX(id) FROM hospitals));

-- ============================================================================
-- 6. SEED DATA: 100 Blood Inventory Records with FEFO Multi-Tier Shelf Lives
-- Includes the mandatory demo scenario units:
-- Hospital B (CityCare): BL-1001 (O+ PRBC, 2 days), BL-1002 (O+ PRBC, 5 days)
-- Hospital C (Metro Trauma): BL-1003 (O+ PRBC, 8 days)
-- Hospital D (Apex Hospital): BL-1004 (O+ PRBC, 18 days)
-- ============================================================================

INSERT INTO blood_inventory (
  id, unit_code, blood_group, rh_type, component, quantity, quantity_ml,
  collection_date, expiration_date, status, screening_status, storage_status,
  hospital_id, hospital_name, city, storage_location
) VALUES
  -- -------------------------------------------------------------------------
  -- Mandatory Evaluation Demo Scenario: O+ Packed Red Blood Cells (FEFO Rank 1 to 4)
  -- -------------------------------------------------------------------------
  (1001, 'BL-1001', 'O+', 'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 40, CURRENT_DATE + 2,  'available', 'cleared', 'proper', 2, 'CityCare Super Specialty Hospital', 'Delhi', 'Cold Storage A-1'),
  (1002, 'BL-1002', 'O+', 'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 37, CURRENT_DATE + 5,  'available', 'cleared', 'proper', 2, 'CityCare Super Specialty Hospital', 'Delhi', 'Cold Storage A-2'),
  (1003, 'BL-1003', 'O+', 'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 34, CURRENT_DATE + 8,  'available', 'cleared', 'proper', 3, 'Metro Trauma & Emergency Hospital', 'Noida', 'Cold Storage B-1'),
  (1004, 'BL-1004', 'O+', 'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 24, CURRENT_DATE + 18, 'available', 'cleared', 'proper', 5, 'Apex Multi-Specialty Hospital', 'Faridabad', 'Cold Storage C-3'),

  -- -------------------------------------------------------------------------
  -- Category A: CRITICAL EXPIRY (0 to 2 days) - Immediate FEFO Prioritization
  -- -------------------------------------------------------------------------
  (1005, 'BL-1005', 'A+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 40, CURRENT_DATE + 2,  'available', 'cleared', 'proper', 4, 'Fortis Care Medical Institute', 'Ghaziabad', 'Cold Storage A-3'),
  (1006, 'BL-1006', 'B+',  'Positive', 'Platelets',              250, 250, CURRENT_DATE - 4,  CURRENT_DATE + 1,  'available', 'cleared', 'proper', 6, 'Maxima Heart & Trauma Center', 'Delhi', 'Agitator Unit 1'),
  (1007, 'BL-1007', 'O-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 41, CURRENT_DATE + 1,  'available', 'cleared', 'proper', 3, 'Metro Trauma & Emergency Hospital', 'Noida', 'Cold Storage A-4'),
  (1008, 'BL-1008', 'AB+', 'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 33, CURRENT_DATE + 2,  'available', 'cleared', 'proper', 7, 'Indraprastha Medical Institute', 'Delhi', 'Cold Storage B-2'),
  (1009, 'BL-1009', 'A-',  'Negative', 'Platelets',              250, 250, CURRENT_DATE - 4,  CURRENT_DATE + 1,  'available', 'cleared', 'proper', 8, 'Medanta LifeCare Hospital', 'Gurugram', 'Agitator Unit 2'),
  (1010, 'BL-1010', 'B-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 40, CURRENT_DATE + 2,  'available', 'cleared', 'proper', 9, 'Apollo Regional Blood Center', 'Noida', 'Cold Storage A-5'),
  (1011, 'BL-1011', 'O+',  'Positive', 'Platelets',              250, 250, CURRENT_DATE - 3,  CURRENT_DATE + 2,  'available', 'cleared', 'proper', 2, 'CityCare Super Specialty Hospital', 'Delhi', 'Agitator Unit 1'),
  (1012, 'BL-1012', 'A+',  'Positive', 'Fresh Frozen Plasma',    300, 300, CURRENT_DATE - 363, CURRENT_DATE + 2, 'available', 'cleared', 'proper', 11, 'Venkateshwar Super Specialty', 'Delhi', 'Deep Freezer -40C'),

  -- -------------------------------------------------------------------------
  -- Category B: EXPIRING SOON (3 to 7 days)
  -- -------------------------------------------------------------------------
  (1013, 'BL-1013', 'A+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 38, CURRENT_DATE + 4,  'available', 'cleared', 'proper', 2, 'CityCare Super Specialty Hospital', 'Delhi', 'Cold Storage A-2'),
  (1014, 'BL-1014', 'B+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 37, CURRENT_DATE + 5,  'available', 'cleared', 'proper', 3, 'Metro Trauma & Emergency Hospital', 'Noida', 'Cold Storage B-3'),
  (1015, 'BL-1015', 'O+',  'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 30, CURRENT_DATE + 5,  'available', 'cleared', 'proper', 4, 'Fortis Care Medical Institute', 'Ghaziabad', 'Cold Storage B-1'),
  (1016, 'BL-1016', 'O-',  'Negative', 'Platelets',              250, 250, CURRENT_DATE - 2,  CURRENT_DATE + 3,  'available', 'cleared', 'proper', 6, 'Maxima Heart & Trauma Center', 'Delhi', 'Agitator Unit 3'),
  (1017, 'BL-1017', 'AB-', 'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 36, CURRENT_DATE + 6,  'available', 'cleared', 'proper', 8, 'Medanta LifeCare Hospital', 'Gurugram', 'Cold Storage C-1'),
  (1018, 'BL-1018', 'A-',  'Negative', 'Fresh Frozen Plasma',    300, 300, CURRENT_DATE - 360, CURRENT_DATE + 5, 'available', 'cleared', 'proper', 9, 'Apollo Regional Blood Center', 'Noida', 'Deep Freezer -40C'),
  (1019, 'BL-1019', 'B-',  'Negative', 'Whole Blood',            450, 450, CURRENT_DATE - 29, CURRENT_DATE + 6,  'available', 'cleared', 'proper', 10, 'Columbia Asia Care Hospital', 'Gurugram', 'Cold Storage B-4'),
  (1020, 'BL-1020', 'O+',  'Positive', 'Fresh Frozen Plasma',    300, 300, CURRENT_DATE - 359, CURRENT_DATE + 6, 'available', 'cleared', 'proper', 12, 'Jaypee Trauma & Surgical Hospital', 'Noida', 'Deep Freezer -40C'),
  (1021, 'BL-1021', 'A+',  'Positive', 'Platelets',              250, 250, CURRENT_DATE - 2,  CURRENT_DATE + 3,  'available', 'cleared', 'proper', 5, 'Apex Multi-Specialty Hospital', 'Faridabad', 'Agitator Unit 1'),
  (1022, 'BL-1022', 'B+',  'Positive', 'Fresh Frozen Plasma',    300, 300, CURRENT_DATE - 358, CURRENT_DATE + 7, 'available', 'cleared', 'proper', 7, 'Indraprastha Medical Institute', 'Delhi', 'Deep Freezer -40C'),

  -- -------------------------------------------------------------------------
  -- Category C: USE SOON (8 to 14 days)
  -- -------------------------------------------------------------------------
  (1023, 'BL-1023', 'O+',  'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 32, CURRENT_DATE + 10, 'available', 'cleared', 'proper', 3, 'Metro Trauma & Emergency Hospital', 'Noida', 'Cold Storage A-1'),
  (1024, 'BL-1024', 'A+',  'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 25, CURRENT_DATE + 10, 'available', 'cleared', 'proper', 4, 'Fortis Care Medical Institute', 'Ghaziabad', 'Cold Storage B-2'),
  (1025, 'BL-1025', 'B+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 31, CURRENT_DATE + 11, 'available', 'cleared', 'proper', 6, 'Maxima Heart & Trauma Center', 'Delhi', 'Cold Storage B-5'),
  (1026, 'BL-1026', 'AB+', 'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 30, CURRENT_DATE + 12, 'available', 'cleared', 'proper', 8, 'Medanta LifeCare Hospital', 'Gurugram', 'Cold Storage C-2'),
  (1027, 'BL-1027', 'O-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 32, CURRENT_DATE + 10, 'available', 'cleared', 'proper', 9, 'Apollo Regional Blood Center', 'Noida', 'Cold Storage A-3'),
  (1028, 'BL-1028', 'A-',  'Negative', 'Whole Blood',            450, 450, CURRENT_DATE - 23, CURRENT_DATE + 12, 'available', 'cleared', 'proper', 11, 'Venkateshwar Super Specialty', 'Delhi', 'Cold Storage B-1'),
  (1029, 'BL-1029', 'B-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 29, CURRENT_DATE + 13, 'available', 'cleared', 'proper', 12, 'Jaypee Trauma & Surgical Hospital', 'Noida', 'Cold Storage C-4'),
  (1030, 'BL-1030', 'O+',  'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 21, CURRENT_DATE + 14, 'available', 'cleared', 'proper', 2, 'CityCare Super Specialty Hospital', 'Delhi', 'Cold Storage B-3'),
  (1031, 'BL-1031', 'A+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 29, CURRENT_DATE + 13, 'available', 'cleared', 'proper', 7, 'Indraprastha Medical Institute', 'Delhi', 'Cold Storage A-4'),
  (1032, 'BL-1032', 'AB-', 'Negative', 'Whole Blood',            450, 450, CURRENT_DATE - 21, CURRENT_DATE + 14, 'available', 'cleared', 'proper', 10, 'Columbia Asia Care Hospital', 'Gurugram', 'Cold Storage B-2'),

  -- -------------------------------------------------------------------------
  -- Category D: NORMAL SHELF LIFE (15+ days)
  -- -------------------------------------------------------------------------
  (1033, 'BL-1033', 'O+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 20, CURRENT_DATE + 22, 'available', 'cleared', 'proper', 4, 'Fortis Care Medical Institute', 'Ghaziabad', 'Cold Storage A-2'),
  (1034, 'BL-1034', 'A+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 18, CURRENT_DATE + 24, 'available', 'cleared', 'proper', 6, 'Maxima Heart & Trauma Center', 'Delhi', 'Cold Storage A-5'),
  (1035, 'BL-1035', 'B+',  'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 12, CURRENT_DATE + 23, 'available', 'cleared', 'proper', 8, 'Medanta LifeCare Hospital', 'Gurugram', 'Cold Storage B-3'),
  (1036, 'BL-1036', 'O-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 15, CURRENT_DATE + 27, 'available', 'cleared', 'proper', 2, 'CityCare Super Specialty Hospital', 'Delhi', 'Cold Storage A-1'),
  (1037, 'BL-1037', 'AB+', 'Positive', 'Fresh Frozen Plasma',    300, 300, CURRENT_DATE - 60, CURRENT_DATE + 305, 'available', 'cleared', 'proper', 9, 'Apollo Regional Blood Center', 'Noida', 'Deep Freezer -40C'),
  (1038, 'BL-1038', 'A-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 16, CURRENT_DATE + 26, 'available', 'cleared', 'proper', 3, 'Metro Trauma & Emergency Hospital', 'Noida', 'Cold Storage A-6'),
  (1039, 'BL-1039', 'B-',  'Negative', 'Fresh Frozen Plasma',    300, 300, CURRENT_DATE - 90, CURRENT_DATE + 275, 'available', 'cleared', 'proper', 5, 'Apex Multi-Specialty Hospital', 'Faridabad', 'Deep Freezer -40C'),
  (1040, 'BL-1040', 'O+',  'Positive', 'Fresh Frozen Plasma',    300, 300, CURRENT_DATE - 45, CURRENT_DATE + 320, 'available', 'cleared', 'proper', 11, 'Venkateshwar Super Specialty', 'Delhi', 'Deep Freezer -40C'),
  (1041, 'BL-1041', 'A+',  'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 10, CURRENT_DATE + 25, 'available', 'cleared', 'proper', 12, 'Jaypee Trauma & Surgical Hospital', 'Noida', 'Cold Storage B-1'),
  (1042, 'BL-1042', 'O+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 12, CURRENT_DATE + 30, 'available', 'cleared', 'proper', 7, 'Indraprastha Medical Institute', 'Delhi', 'Cold Storage A-3'),

  -- -------------------------------------------------------------------------
  -- Category E: EXPIRED UNITS (Should be EXCLUDED from search results)
  -- -------------------------------------------------------------------------
  (1043, 'BL-1043', 'O+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 45, CURRENT_DATE - 3,  'expired',   'cleared', 'proper', 2, 'CityCare Super Specialty Hospital', 'Delhi', 'Quarantine Shelf Q-1'),
  (1044, 'BL-1044', 'A+',  'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 40, CURRENT_DATE - 5,  'expired',   'cleared', 'proper', 3, 'Metro Trauma & Emergency Hospital', 'Noida', 'Quarantine Shelf Q-2'),
  (1045, 'BL-1045', 'B+',  'Positive', 'Platelets',              250, 250, CURRENT_DATE - 7,  CURRENT_DATE - 2,  'expired',   'cleared', 'proper', 4, 'Fortis Care Medical Institute', 'Ghaziabad', 'Quarantine Shelf Q-3'),
  (1046, 'BL-1046', 'O-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 44, CURRENT_DATE - 2,  'expired',   'cleared', 'proper', 6, 'Maxima Heart & Trauma Center', 'Delhi', 'Quarantine Shelf Q-1'),
  (1047, 'BL-1047', 'AB+', 'Positive', 'Platelets',              250, 250, CURRENT_DATE - 8,  CURRENT_DATE - 3,  'expired',   'cleared', 'proper', 8, 'Medanta LifeCare Hospital', 'Gurugram', 'Quarantine Shelf Q-2'),

  -- -------------------------------------------------------------------------
  -- Category F: RESERVED UNITS (Should be EXCLUDED from available search results)
  -- -------------------------------------------------------------------------
  (1048, 'BL-1048', 'O+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 35, CURRENT_DATE + 7,  'reserved',  'cleared', 'proper', 2, 'CityCare Super Specialty Hospital', 'Delhi', 'Hold Bay H-1'),
  (1049, 'BL-1049', 'A+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 32, CURRENT_DATE + 10, 'reserved',  'cleared', 'proper', 3, 'Metro Trauma & Emergency Hospital', 'Noida', 'Hold Bay H-2'),
  (1050, 'BL-1050', 'B+',  'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 20, CURRENT_DATE + 15, 'reserved',  'cleared', 'proper', 9, 'Apollo Regional Blood Center', 'Noida', 'Hold Bay H-3'),
  (1051, 'BL-1051', 'O-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 38, CURRENT_DATE + 4,  'reserved',  'cleared', 'proper', 5, 'Apex Multi-Specialty Hospital', 'Faridabad', 'Hold Bay H-1'),

  -- -------------------------------------------------------------------------
  -- Category G: USED / ISSUED UNITS (Should be EXCLUDED)
  -- -------------------------------------------------------------------------
  (1052, 'BL-1052', 'O+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 30, CURRENT_DATE + 12, 'used',      'cleared', 'proper', 7, 'Indraprastha Medical Institute', 'Delhi', 'Transfused'),
  (1053, 'BL-1053', 'A-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 28, CURRENT_DATE + 14, 'used',      'cleared', 'proper', 8, 'Medanta LifeCare Hospital', 'Gurugram', 'Transfused'),
  (1054, 'BL-1054', 'B-',  'Negative', 'Whole Blood',            450, 450, CURRENT_DATE - 25, CURRENT_DATE + 10, 'used',      'cleared', 'proper', 11, 'Venkateshwar Super Specialty', 'Delhi', 'Transfused'),

  -- -------------------------------------------------------------------------
  -- Category H: SCREENING PENDING / FAILED (Should be EXCLUDED)
  -- -------------------------------------------------------------------------
  (1055, 'BL-1055', 'O+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 5,  CURRENT_DATE + 37, 'available', 'pending', 'proper', 2, 'CityCare Super Specialty Hospital', 'Delhi', 'Serology Testing Lab'),
  (1056, 'BL-1056', 'A+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 3,  CURRENT_DATE + 39, 'available', 'pending', 'proper', 3, 'Metro Trauma & Emergency Hospital', 'Noida', 'Serology Testing Lab'),
  (1057, 'BL-1057', 'B+',  'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 6,  CURRENT_DATE + 29, 'available', 'failed',  'proper', 4, 'Fortis Care Medical Institute', 'Ghaziabad', 'Biohazard Disposal'),
  (1058, 'BL-1058', 'O-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 4,  CURRENT_DATE + 38, 'available', 'failed',  'proper', 6, 'Maxima Heart & Trauma Center', 'Delhi', 'Biohazard Disposal'),

  -- -------------------------------------------------------------------------
  -- Category I: IMPROPER STORAGE / TEMPERATURE EXCURSION (Should be EXCLUDED)
  -- -------------------------------------------------------------------------
  (1059, 'BL-1059', 'O+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 15, CURRENT_DATE + 27, 'available', 'cleared', 'temperature_excursion', 2, 'CityCare Super Specialty Hospital', 'Delhi', 'Alarm Room'),
  (1060, 'BL-1060', 'AB-', 'Negative', 'Whole Blood',            450, 450, CURRENT_DATE - 12, CURRENT_DATE + 23, 'available', 'cleared', 'quarantine',            8, 'Medanta LifeCare Hospital', 'Gurugram', 'Inspection Bay'),

  -- -------------------------------------------------------------------------
  -- Additional Units (Shelf-life > 20 days so demo scenario units take priority)
  (1061, 'BL-1061', 'O+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 20, CURRENT_DATE + 21, 'available', 'cleared', 'proper', 6, 'Maxima Heart & Trauma Center', 'Delhi', 'Cold Storage A-1'),
  (1062, 'BL-1062', 'O+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 18, CURRENT_DATE + 25, 'available', 'cleared', 'proper', 9, 'Apollo Regional Blood Center', 'Noida', 'Cold Storage B-2'),
  (1063, 'BL-1063', 'O+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 15, CURRENT_DATE + 28, 'available', 'cleared', 'proper', 11, 'Venkateshwar Super Specialty', 'Delhi', 'Cold Storage A-4'),
  (1064, 'BL-1064', 'O+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 12, CURRENT_DATE + 32, 'available', 'cleared', 'proper', 12, 'Jaypee Trauma & Surgical Hospital', 'Noida', 'Cold Storage C-1'),
  (1065, 'BL-1065', 'O+',  'Positive', 'Platelets',              250, 250, CURRENT_DATE - 2,  CURRENT_DATE + 3,  'available', 'cleared', 'proper', 3, 'Metro Trauma & Emergency Hospital', 'Noida', 'Agitator Unit 1'),
  (1066, 'BL-1066', 'O+',  'Positive', 'Fresh Frozen Plasma',    300, 300, CURRENT_DATE - 120, CURRENT_DATE + 245, 'available', 'cleared', 'proper', 4, 'Fortis Care Medical Institute', 'Ghaziabad', 'Deep Freezer -40C'),
  (1067, 'BL-1067', 'A+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 39, CURRENT_DATE + 3,  'available', 'cleared', 'proper', 8, 'Medanta LifeCare Hospital', 'Gurugram', 'Cold Storage A-2'),
  (1068, 'BL-1068', 'A+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 35, CURRENT_DATE + 7,  'available', 'cleared', 'proper', 10, 'Columbia Asia Care Hospital', 'Gurugram', 'Cold Storage A-3'),
  (1069, 'BL-1069', 'A+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 30, CURRENT_DATE + 12, 'available', 'cleared', 'proper', 2, 'CityCare Super Specialty Hospital', 'Delhi', 'Cold Storage A-5'),
  (1070, 'BL-1070', 'A+',  'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 24, CURRENT_DATE + 11, 'available', 'cleared', 'proper', 5, 'Apex Multi-Specialty Hospital', 'Faridabad', 'Cold Storage B-1'),
  (1071, 'BL-1071', 'B+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 38, CURRENT_DATE + 4,  'available', 'cleared', 'proper', 7, 'Indraprastha Medical Institute', 'Delhi', 'Cold Storage B-2'),
  (1072, 'BL-1072', 'B+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 33, CURRENT_DATE + 9,  'available', 'cleared', 'proper', 9, 'Apollo Regional Blood Center', 'Noida', 'Cold Storage B-4'),
  (1073, 'BL-1073', 'B+',  'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 27, CURRENT_DATE + 8,  'available', 'cleared', 'proper', 11, 'Venkateshwar Super Specialty', 'Delhi', 'Cold Storage B-3'),
  (1074, 'BL-1074', 'B+',  'Positive', 'Platelets',              250, 250, CURRENT_DATE - 1,  CURRENT_DATE + 4,  'available', 'cleared', 'proper', 12, 'Jaypee Trauma & Surgical Hospital', 'Noida', 'Agitator Unit 2'),
  (1075, 'BL-1075', 'AB+', 'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 37, CURRENT_DATE + 5,  'available', 'cleared', 'proper', 2, 'CityCare Super Specialty Hospital', 'Delhi', 'Cold Storage C-1'),
  (1076, 'BL-1076', 'AB+', 'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 26, CURRENT_DATE + 9,  'available', 'cleared', 'proper', 6, 'Maxima Heart & Trauma Center', 'Delhi', 'Cold Storage B-2'),
  (1077, 'BL-1077', 'AB+', 'Positive', 'Fresh Frozen Plasma',    300, 300, CURRENT_DATE - 150, CURRENT_DATE + 215, 'available', 'cleared', 'proper', 3, 'Metro Trauma & Emergency Hospital', 'Noida', 'Deep Freezer -40C'),
  (1078, 'BL-1078', 'O-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 39, CURRENT_DATE + 3,  'available', 'cleared', 'proper', 4, 'Fortis Care Medical Institute', 'Ghaziabad', 'Cold Storage A-1'),
  (1079, 'BL-1079', 'O-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 36, CURRENT_DATE + 6,  'available', 'cleared', 'proper', 8, 'Medanta LifeCare Hospital', 'Gurugram', 'Cold Storage A-4'),
  (1080, 'BL-1080', 'O-',  'Negative', 'Whole Blood',            450, 450, CURRENT_DATE - 28, CURRENT_DATE + 7,  'available', 'cleared', 'proper', 10, 'Columbia Asia Care Hospital', 'Gurugram', 'Cold Storage B-1'),
  (1081, 'BL-1081', 'A-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 38, CURRENT_DATE + 4,  'available', 'cleared', 'proper', 7, 'Indraprastha Medical Institute', 'Delhi', 'Cold Storage A-3'),
  (1082, 'BL-1082', 'A-',  'Negative', 'Whole Blood',            450, 450, CURRENT_DATE - 26, CURRENT_DATE + 9,  'available', 'cleared', 'proper', 9, 'Apollo Regional Blood Center', 'Noida', 'Cold Storage B-2'),
  (1083, 'BL-1083', 'B-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 37, CURRENT_DATE + 5,  'available', 'cleared', 'proper', 5, 'Apex Multi-Specialty Hospital', 'Faridabad', 'Cold Storage B-3'),
  (1084, 'BL-1084', 'B-',  'Negative', 'Platelets',              250, 250, CURRENT_DATE - 3,  CURRENT_DATE + 2,  'available', 'cleared', 'proper', 2, 'CityCare Super Specialty Hospital', 'Delhi', 'Agitator Unit 1'),
  (1085, 'BL-1085', 'AB-', 'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 39, CURRENT_DATE + 3,  'available', 'cleared', 'proper', 11, 'Venkateshwar Super Specialty', 'Delhi', 'Cold Storage C-2'),
  (1086, 'BL-1086', 'AB-', 'Negative', 'Fresh Frozen Plasma',    300, 300, CURRENT_DATE - 180, CURRENT_DATE + 185, 'available', 'cleared', 'proper', 12, 'Jaypee Trauma & Surgical Hospital', 'Noida', 'Deep Freezer -40C'),
  (1087, 'BL-1087', 'O+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 25, CURRENT_DATE + 24, 'available', 'cleared', 'proper', 3, 'Metro Trauma & Emergency Hospital', 'Noida', 'Cold Storage A-2'),
  (1088, 'BL-1088', 'O+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 15, CURRENT_DATE + 27, 'available', 'cleared', 'proper', 8, 'Medanta LifeCare Hospital', 'Gurugram', 'Cold Storage A-5'),
  (1089, 'BL-1089', 'A+',  'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 18, CURRENT_DATE + 17, 'available', 'cleared', 'proper', 4, 'Fortis Care Medical Institute', 'Ghaziabad', 'Cold Storage B-2'),
  (1090, 'BL-1090', 'B+',  'Positive', 'Fresh Frozen Plasma',    300, 300, CURRENT_DATE - 200, CURRENT_DATE + 165, 'available', 'cleared', 'proper', 6, 'Maxima Heart & Trauma Center', 'Delhi', 'Deep Freezer -40C'),
  (1091, 'BL-1091', 'O-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 24, CURRENT_DATE + 18, 'available', 'cleared', 'proper', 7, 'Indraprastha Medical Institute', 'Delhi', 'Cold Storage A-2'),
  (1092, 'BL-1092', 'A-',  'Negative', 'Platelets',              250, 250, CURRENT_DATE - 1,  CURRENT_DATE + 4,  'available', 'cleared', 'proper', 5, 'Apex Multi-Specialty Hospital', 'Faridabad', 'Agitator Unit 3'),
  (1093, 'BL-1093', 'AB+', 'Positive', 'Whole Blood',            450, 450, CURRENT_DATE - 15, CURRENT_DATE + 20, 'available', 'cleared', 'proper', 9, 'Apollo Regional Blood Center', 'Noida', 'Cold Storage B-1'),
  (1094, 'BL-1094', 'O+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 10, CURRENT_DATE + 32, 'available', 'cleared', 'proper', 10, 'Columbia Asia Care Hospital', 'Gurugram', 'Cold Storage A-1'),
  (1095, 'BL-1095', 'B+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 21, CURRENT_DATE + 21, 'available', 'cleared', 'proper', 2, 'CityCare Super Specialty Hospital', 'Delhi', 'Cold Storage B-1'),
  (1096, 'BL-1096', 'O+',  'Positive', 'Platelets',              250, 250, CURRENT_DATE - 1,  CURRENT_DATE + 4,  'available', 'cleared', 'proper', 11, 'Venkateshwar Super Specialty', 'Delhi', 'Agitator Unit 2'),
  (1097, 'BL-1097', 'A+',  'Positive', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 14, CURRENT_DATE + 28, 'available', 'cleared', 'proper', 12, 'Jaypee Trauma & Surgical Hospital', 'Noida', 'Cold Storage A-3'),
  (1098, 'BL-1098', 'O-',  'Negative', 'Whole Blood',            450, 450, CURRENT_DATE - 11, CURRENT_DATE + 24, 'available', 'cleared', 'proper', 6, 'Maxima Heart & Trauma Center', 'Delhi', 'Cold Storage B-3'),
  (1099, 'BL-1099', 'B-',  'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 16, CURRENT_DATE + 26, 'available', 'cleared', 'proper', 4, 'Fortis Care Medical Institute', 'Ghaziabad', 'Cold Storage B-5'),
  (1100, 'BL-1100', 'AB-', 'Negative', 'Packed Red Blood Cells', 450, 450, CURRENT_DATE - 12, CURRENT_DATE + 30, 'available', 'cleared', 'proper', 8, 'Medanta LifeCare Hospital', 'Gurugram', 'Cold Storage C-3')
ON CONFLICT (id) DO UPDATE SET
  unit_code = EXCLUDED.unit_code,
  blood_group = EXCLUDED.blood_group,
  component = EXCLUDED.component,
  expiration_date = EXCLUDED.expiration_date,
  status = EXCLUDED.status,
  screening_status = EXCLUDED.screening_status,
  storage_status = EXCLUDED.storage_status,
  hospital_id = EXCLUDED.hospital_id,
  hospital_name = EXCLUDED.hospital_name,
  city = EXCLUDED.city;

SELECT setval('blood_inventory_id_seq', (SELECT MAX(id) FROM blood_inventory));
