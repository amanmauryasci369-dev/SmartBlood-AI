-- ==============================================================================
-- LifeLink: Smart Blood Allocation & FEFO Inventory Engine (Supabase / PostgreSQL)
-- ==============================================================================
-- Follows the FEFO principle: First Expired, First Out.
-- Deterministic sorting logic based on expiration_date ASC.
-- Prevents concurrent double-booking using PostgreSQL atomic conditional locking.

-- 1. Create or Update the blood_inventory table
CREATE TABLE IF NOT EXISTS blood_inventory (
    id SERIAL PRIMARY KEY,
    unit_code VARCHAR(100) UNIQUE NOT NULL,               -- e.g. 'BL-10042'
    blood_group VARCHAR(10) NOT NULL,                    -- 'O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'
    component VARCHAR(50) NOT NULL,                      -- 'Packed Red Blood Cells', 'Platelet Concentrate', etc.
    quantity_ml INTEGER NOT NULL DEFAULT 450,            -- Volume in milliliters (e.g. 450 ml)
    expiration_date DATE NOT NULL,                       -- Expiry date for FEFO sorting
    blood_bank_id INTEGER,                               -- Reference to facility if available
    blood_bank_name VARCHAR(255) NOT NULL,               -- Name of the blood bank
    city VARCHAR(100) NOT NULL,                          -- Location / City
    status VARCHAR(50) NOT NULL DEFAULT 'available',     -- 'available', 'reserved', 'used', 'expired'
    screening_status VARCHAR(50) NOT NULL DEFAULT 'cleared', -- 'cleared', 'pending', 'reactive'
    temperature_celsius FLOAT DEFAULT 4.0,               -- Storage cold-chain reading
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Performance Index for FEFO Allocation Queries
-- Enables high-speed index scans for matching group + component + cleared + available sorted by expiration date
CREATE INDEX IF NOT EXISTS idx_blood_fefo_allocation 
ON blood_inventory (blood_group, component, status, screening_status, expiration_date ASC);

CREATE INDEX IF NOT EXISTS idx_blood_city 
ON blood_inventory (city);

-- 3. Atomic Reservation Function (Concurrency-Safe)
-- Prevents two patients from reserving the same blood unit simultaneously.
CREATE OR REPLACE FUNCTION reserve_blood_unit_atomic(
    p_unit_id INT,
    p_patient_note TEXT DEFAULT 'Reserved by patient request'
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    reserved_unit_code VARCHAR(100),
    reserved_expiration_date DATE
) AS $$
DECLARE
    v_unit_code VARCHAR(100);
    v_exp_date DATE;
    v_rows_updated INT;
BEGIN
    -- Perform an atomic conditional update directly
    UPDATE blood_inventory
    SET 
        status = 'reserved',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_unit_id
      AND status = 'available'
      AND screening_status = 'cleared'
      AND expiration_date > CURRENT_DATE
    RETURNING unit_code, expiration_date INTO v_unit_code, v_exp_date;

    GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

    IF v_rows_updated > 0 THEN
        RETURN QUERY SELECT TRUE, 'Unit successfully reserved.'::TEXT, v_unit_code, v_exp_date;
    ELSE
        RETURN QUERY SELECT FALSE, 'Unit is no longer available or was already reserved by another patient.'::TEXT, NULL::VARCHAR, NULL::DATE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 4. Realistic Seed Data for Demo & Evaluation
-- Covering various expiration horizons (2 days, 4 days, 7 days, 21 days, expired, and uncleared)
INSERT INTO blood_inventory (
    unit_code, blood_group, component, quantity_ml, expiration_date, 
    blood_bank_id, blood_bank_name, city, status, screening_status
) VALUES
-- O+ Packed Red Blood Cells (Demonstrating FEFO prioritization)
('BL-10042', 'O+', 'Packed Red Blood Cells', 450, CURRENT_DATE + INTERVAL '2 days', 1, 'Demo Blood Bank Delhi', 'New Delhi', 'available', 'cleared'),
('BL-10043', 'O+', 'Packed Red Blood Cells', 450, CURRENT_DATE + INTERVAL '5 days', 1, 'Central Red Cross Blood Center', 'New Delhi', 'available', 'cleared'),
('BL-10044', 'O+', 'Packed Red Blood Cells', 450, CURRENT_DATE + INTERVAL '12 days', 2, 'Safdarjung Transfusion Depot', 'New Delhi', 'available', 'cleared'),
('BL-10045', 'O+', 'Packed Red Blood Cells', 450, CURRENT_DATE + INTERVAL '25 days', 3, 'AIIMS Apex Blood Bank', 'New Delhi', 'available', 'cleared'),

-- O- Packed Red Blood Cells (Universal Donor)
('BL-10050', 'O-', 'Packed Red Blood Cells', 450, CURRENT_DATE + INTERVAL '3 days', 1, 'Demo Blood Bank Delhi', 'New Delhi', 'available', 'cleared'),
('BL-10051', 'O-', 'Packed Red Blood Cells', 450, CURRENT_DATE + INTERVAL '9 days', 2, 'Safdarjung Transfusion Depot', 'New Delhi', 'available', 'cleared'),

-- A+ Platelet Concentrate (Short shelf-life)
('BL-10060', 'A+', 'Platelet Concentrate', 300, CURRENT_DATE + INTERVAL '1 day', 1, 'Demo Blood Bank Delhi', 'New Delhi', 'available', 'cleared'),
('BL-10061', 'A+', 'Platelet Concentrate', 300, CURRENT_DATE + INTERVAL '3 days', 3, 'AIIMS Apex Blood Bank', 'New Delhi', 'available', 'cleared'),

-- B+ Fresh Frozen Plasma (Long shelf-life)
('BL-10070', 'B+', 'Fresh Frozen Plasma', 250, CURRENT_DATE + INTERVAL '180 days', 2, 'Safdarjung Transfusion Depot', 'New Delhi', 'available', 'cleared'),

-- AB+ Whole Blood
('BL-10080', 'AB+', 'Whole Blood', 450, CURRENT_DATE + INTERVAL '16 days', 1, 'Demo Blood Bank Delhi', 'New Delhi', 'available', 'cleared'),

-- Units that should NEVER be allocated (for validation testing):
('BL-99991', 'O+', 'Packed Red Blood Cells', 450, CURRENT_DATE - INTERVAL '1 day', 1, 'Demo Blood Bank Delhi', 'expired', 'cleared'),           -- Expired
('BL-99992', 'O+', 'Packed Red Blood Cells', 450, CURRENT_DATE + INTERVAL '4 days', 1, 'Demo Blood Bank Delhi', 'available', 'pending'),       -- Uncleared
('BL-99993', 'O+', 'Packed Red Blood Cells', 450, CURRENT_DATE + INTERVAL '6 days', 2, 'Safdarjung Depot', 'reserved', 'cleared')              -- Already Reserved
ON CONFLICT (unit_code) DO UPDATE 
SET expiration_date = EXCLUDED.expiration_date,
    status = EXCLUDED.status,
    screening_status = EXCLUDED.screening_status;
