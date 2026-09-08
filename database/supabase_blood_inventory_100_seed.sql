-- ============================================================================
-- LifeLink / Supabase PostgreSQL Blood Inventory Schema & 100 Seed Records
-- DEMO DATA ONLY: Synthetic data for academic demonstration & project testing.
-- ============================================================================

-- 1. CREATE TABLE STATEMENT
CREATE TABLE IF NOT EXISTS blood_inventory (
    id VARCHAR(20) PRIMARY KEY,
    blood_group VARCHAR(5) NOT NULL CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    rh_type VARCHAR(10) NOT NULL CHECK (rh_type IN ('Positive', 'Negative')),
    component VARCHAR(50) NOT NULL CHECK (component IN ('Packed Red Blood Cells', 'Whole Blood', 'Platelets', 'Fresh Frozen Plasma')),
    quantity_ml INTEGER NOT NULL CHECK (quantity_ml > 0),
    collection_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    screening_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (screening_status IN ('cleared', 'pending')),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'used', 'expired')),
    blood_bank_id VARCHAR(20) NOT NULL,
    blood_bank_name VARCHAR(150) NOT NULL,
    city VARCHAR(100) NOT NULL,
    storage_location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for high-performance deterministic FEFO sorting and filtering
CREATE INDEX IF NOT EXISTS idx_blood_inventory_fefo
ON blood_inventory (blood_group, component, status, screening_status, expiration_date ASC);

-- 2. INSERT STATEMENTS (100 SYNTHETIC BLOOD-UNIT RECORDS: BL-1001 to BL-1100)
INSERT INTO blood_inventory (
    id, blood_group, rh_type, component, quantity_ml,
    collection_date, expiration_date, screening_status, status,
    blood_bank_id, blood_bank_name, city, storage_location, created_at
)
VALUES
    ('BL-1001', 'O+', 'Positive', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '35 days')::DATE, (CURRENT_DATE - INTERVAL '5 days')::DATE, 'cleared', 'expired', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '35 days')),
    ('BL-1002', 'O+', 'Positive', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '6 days')::DATE, 'cleared', 'reserved', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1003', 'O+', 'Positive', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '14 days')::DATE, 'cleared', 'used', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1004', 'O+', 'Positive', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '2 days')::DATE, (CURRENT_DATE + INTERVAL '10 days')::DATE, 'pending', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '2 days')),
    ('BL-1005', 'O+', 'Positive', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '1 days')::DATE, 'cleared', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1006', 'O+', 'Positive', 'Platelets', 250, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '3 days')::DATE, 'cleared', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1007', 'O+', 'Positive', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '5 days')::DATE, 'cleared', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1008', 'O+', 'Positive', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '7 days')::DATE, 'cleared', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1009', 'O+', 'Positive', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '9 days')::DATE, 'cleared', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1010', 'O+', 'Positive', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '12 days')::DATE, 'cleared', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1011', 'O+', 'Positive', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '18 days')::DATE, 'cleared', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1012', 'O+', 'Positive', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '26 days')::DATE, 'cleared', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1013', 'O-', 'Negative', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '35 days')::DATE, (CURRENT_DATE - INTERVAL '5 days')::DATE, 'cleared', 'expired', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '35 days')),
    ('BL-1014', 'O-', 'Negative', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '6 days')::DATE, 'cleared', 'reserved', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1015', 'O-', 'Negative', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '14 days')::DATE, 'cleared', 'used', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1016', 'O-', 'Negative', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '2 days')::DATE, (CURRENT_DATE + INTERVAL '10 days')::DATE, 'pending', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '2 days')),
    ('BL-1017', 'O-', 'Negative', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '1 days')::DATE, 'cleared', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1018', 'O-', 'Negative', 'Platelets', 250, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '3 days')::DATE, 'cleared', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1019', 'O-', 'Negative', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '5 days')::DATE, 'cleared', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1020', 'O-', 'Negative', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '7 days')::DATE, 'cleared', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1021', 'O-', 'Negative', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '9 days')::DATE, 'cleared', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1022', 'O-', 'Negative', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '12 days')::DATE, 'cleared', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1023', 'O-', 'Negative', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '18 days')::DATE, 'cleared', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1024', 'O-', 'Negative', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '26 days')::DATE, 'cleared', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1025', 'A+', 'Positive', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '35 days')::DATE, (CURRENT_DATE - INTERVAL '5 days')::DATE, 'cleared', 'expired', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '35 days')),
    ('BL-1026', 'A+', 'Positive', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '6 days')::DATE, 'cleared', 'reserved', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1027', 'A+', 'Positive', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '14 days')::DATE, 'cleared', 'used', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1028', 'A+', 'Positive', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '2 days')::DATE, (CURRENT_DATE + INTERVAL '10 days')::DATE, 'pending', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '2 days')),
    ('BL-1029', 'A+', 'Positive', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '1 days')::DATE, 'cleared', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1030', 'A+', 'Positive', 'Platelets', 250, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '3 days')::DATE, 'cleared', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1031', 'A+', 'Positive', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '5 days')::DATE, 'cleared', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1032', 'A+', 'Positive', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '7 days')::DATE, 'cleared', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1033', 'A+', 'Positive', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '9 days')::DATE, 'cleared', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1034', 'A+', 'Positive', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '12 days')::DATE, 'cleared', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1035', 'A+', 'Positive', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '18 days')::DATE, 'cleared', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1036', 'A+', 'Positive', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '26 days')::DATE, 'cleared', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1037', 'A-', 'Negative', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '35 days')::DATE, (CURRENT_DATE - INTERVAL '5 days')::DATE, 'cleared', 'expired', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '35 days')),
    ('BL-1038', 'A-', 'Negative', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '6 days')::DATE, 'cleared', 'reserved', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1039', 'A-', 'Negative', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '14 days')::DATE, 'cleared', 'used', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1040', 'A-', 'Negative', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '2 days')::DATE, (CURRENT_DATE + INTERVAL '10 days')::DATE, 'pending', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '2 days')),
    ('BL-1041', 'A-', 'Negative', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '1 days')::DATE, 'cleared', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1042', 'A-', 'Negative', 'Platelets', 250, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '3 days')::DATE, 'cleared', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1043', 'A-', 'Negative', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '5 days')::DATE, 'cleared', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1044', 'A-', 'Negative', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '7 days')::DATE, 'cleared', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1045', 'A-', 'Negative', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '9 days')::DATE, 'cleared', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1046', 'A-', 'Negative', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '12 days')::DATE, 'cleared', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1047', 'A-', 'Negative', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '18 days')::DATE, 'cleared', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1048', 'A-', 'Negative', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '26 days')::DATE, 'cleared', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1049', 'B+', 'Positive', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '35 days')::DATE, (CURRENT_DATE - INTERVAL '5 days')::DATE, 'cleared', 'expired', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '35 days')),
    ('BL-1050', 'B+', 'Positive', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '6 days')::DATE, 'cleared', 'reserved', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1051', 'B+', 'Positive', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '14 days')::DATE, 'cleared', 'used', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1052', 'B+', 'Positive', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '2 days')::DATE, (CURRENT_DATE + INTERVAL '10 days')::DATE, 'pending', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '2 days')),
    ('BL-1053', 'B+', 'Positive', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '1 days')::DATE, 'cleared', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1054', 'B+', 'Positive', 'Platelets', 250, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '3 days')::DATE, 'cleared', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1055', 'B+', 'Positive', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '5 days')::DATE, 'cleared', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1056', 'B+', 'Positive', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '7 days')::DATE, 'cleared', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1057', 'B+', 'Positive', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '9 days')::DATE, 'cleared', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1058', 'B+', 'Positive', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '12 days')::DATE, 'cleared', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1059', 'B+', 'Positive', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '18 days')::DATE, 'cleared', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1060', 'B+', 'Positive', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '26 days')::DATE, 'cleared', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1061', 'B-', 'Negative', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '35 days')::DATE, (CURRENT_DATE - INTERVAL '5 days')::DATE, 'cleared', 'expired', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '35 days')),
    ('BL-1062', 'B-', 'Negative', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '6 days')::DATE, 'cleared', 'reserved', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1063', 'B-', 'Negative', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '14 days')::DATE, 'cleared', 'used', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1064', 'B-', 'Negative', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '2 days')::DATE, (CURRENT_DATE + INTERVAL '10 days')::DATE, 'pending', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '2 days')),
    ('BL-1065', 'B-', 'Negative', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '1 days')::DATE, 'cleared', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1066', 'B-', 'Negative', 'Platelets', 250, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '3 days')::DATE, 'cleared', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1067', 'B-', 'Negative', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '5 days')::DATE, 'cleared', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1068', 'B-', 'Negative', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '7 days')::DATE, 'cleared', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1069', 'B-', 'Negative', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '9 days')::DATE, 'cleared', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1070', 'B-', 'Negative', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '12 days')::DATE, 'cleared', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1071', 'B-', 'Negative', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '18 days')::DATE, 'cleared', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1072', 'B-', 'Negative', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '26 days')::DATE, 'cleared', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1073', 'AB+', 'Positive', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '35 days')::DATE, (CURRENT_DATE - INTERVAL '5 days')::DATE, 'cleared', 'expired', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '35 days')),
    ('BL-1074', 'AB+', 'Positive', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '6 days')::DATE, 'cleared', 'reserved', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1075', 'AB+', 'Positive', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '14 days')::DATE, 'cleared', 'used', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1076', 'AB+', 'Positive', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '2 days')::DATE, (CURRENT_DATE + INTERVAL '10 days')::DATE, 'pending', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '2 days')),
    ('BL-1077', 'AB+', 'Positive', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '1 days')::DATE, 'cleared', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1078', 'AB+', 'Positive', 'Platelets', 250, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '3 days')::DATE, 'cleared', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1079', 'AB+', 'Positive', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '5 days')::DATE, 'cleared', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1080', 'AB+', 'Positive', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '7 days')::DATE, 'cleared', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1081', 'AB+', 'Positive', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '9 days')::DATE, 'cleared', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1082', 'AB+', 'Positive', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '12 days')::DATE, 'cleared', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1083', 'AB+', 'Positive', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '18 days')::DATE, 'cleared', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1084', 'AB+', 'Positive', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '26 days')::DATE, 'cleared', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1085', 'AB-', 'Negative', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '35 days')::DATE, (CURRENT_DATE - INTERVAL '5 days')::DATE, 'cleared', 'expired', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '35 days')),
    ('BL-1086', 'AB-', 'Negative', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '6 days')::DATE, 'cleared', 'reserved', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1087', 'AB-', 'Negative', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '14 days')::DATE, 'cleared', 'used', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1088', 'AB-', 'Negative', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '2 days')::DATE, (CURRENT_DATE + INTERVAL '10 days')::DATE, 'pending', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '2 days')),
    ('BL-1089', 'AB-', 'Negative', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '1 days')::DATE, 'cleared', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1090', 'AB-', 'Negative', 'Platelets', 250, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '3 days')::DATE, 'cleared', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1091', 'AB-', 'Negative', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '5 days')::DATE, 'cleared', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1092', 'AB-', 'Negative', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '25 days')::DATE, (CURRENT_DATE + INTERVAL '7 days')::DATE, 'cleared', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '25 days')),
    ('BL-1093', 'AB-', 'Negative', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '9 days')::DATE, 'cleared', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1094', 'AB-', 'Negative', 'Platelets', 250, (CURRENT_DATE - INTERVAL '20 days')::DATE, (CURRENT_DATE + INTERVAL '12 days')::DATE, 'cleared', 'available', 'BB-005', 'Demo Blood Bank Greater Noida', 'Greater Noida', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '20 days')),
    ('BL-1095', 'AB-', 'Negative', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '18 days')::DATE, 'cleared', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1096', 'AB-', 'Negative', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '10 days')::DATE, (CURRENT_DATE + INTERVAL '26 days')::DATE, 'cleared', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '10 days')),
    ('BL-1097', 'O+', 'Positive', 'Packed Red Blood Cells', 350, (CURRENT_DATE - INTERVAL '28 days')::DATE, (CURRENT_DATE + INTERVAL '2 days')::DATE, 'cleared', 'available', 'BB-001', 'Demo Blood Bank Delhi', 'Delhi', 'Refrigerator A', (CURRENT_TIMESTAMP - INTERVAL '28 days')),
    ('BL-1098', 'O-', 'Negative', 'Whole Blood', 450, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE + INTERVAL '4 days')::DATE, 'cleared', 'available', 'BB-002', 'Demo Blood Bank Noida', 'Noida', 'Refrigerator B', (CURRENT_TIMESTAMP - INTERVAL '30 days')),
    ('BL-1099', 'A+', 'Positive', 'Platelets', 250, (CURRENT_DATE - INTERVAL '3 days')::DATE, (CURRENT_DATE + INTERVAL '2 days')::DATE, 'cleared', 'available', 'BB-003', 'Demo Blood Bank Ghaziabad', 'Ghaziabad', 'Storage C', (CURRENT_TIMESTAMP - INTERVAL '3 days')),
    ('BL-1100', 'B+', 'Positive', 'Fresh Frozen Plasma', 200, (CURRENT_DATE - INTERVAL '60 days')::DATE, (CURRENT_DATE + INTERVAL '28 days')::DATE, 'cleared', 'available', 'BB-004', 'Demo Blood Bank Faridabad', 'Faridabad', 'Freezer A', (CURRENT_TIMESTAMP - INTERVAL '60 days'));

-- ============================================================================
-- 3. SQL QUERY TO RETRIEVE AVAILABLE BLOOD
-- ============================================================================
-- Basic query fetching all active records marked as 'available'
SELECT 
    id,
    blood_group,
    component,
    quantity_ml,
    expiration_date,
    blood_bank_name,
    city,
    storage_location,
    status
FROM blood_inventory
WHERE status = 'available';


-- ============================================================================
-- 4. SQL QUERY THAT EXCLUDES EXPIRED, RESERVED, USED, AND SCREENING-PENDING UNITS
-- ============================================================================
-- Ensures strictly eligible, cleared, active, unexpired units only
SELECT 
    id,
    blood_group,
    rh_type,
    component,
    quantity_ml,
    expiration_date,
    screening_status,
    status,
    blood_bank_name,
    city
FROM blood_inventory
WHERE status = 'available'
  AND screening_status = 'cleared'
  AND expiration_date > CURRENT_DATE
  AND status NOT IN ('expired', 'reserved', 'used');


-- ============================================================================
-- 5. SQL QUERY THAT SORTS ELIGIBLE UNITS BY NEAREST EXPIRATION DATE FIRST (FEFO)
-- ============================================================================
-- Implements First Expired, First Out (FEFO) allocation principle
SELECT 
    id,
    blood_group,
    component,
    quantity_ml,
    expiration_date,
    blood_bank_name,
    city,
    storage_location
FROM blood_inventory
WHERE status = 'available'
  AND screening_status = 'cleared'
  AND expiration_date > CURRENT_DATE
ORDER BY 
    expiration_date ASC,
    id ASC;


-- ============================================================================
-- 6. SQL QUERY THAT CALCULATES DAYS REMAINING UNTIL EXPIRATION (WITH URGENCY BADGE)
-- ============================================================================
-- Computes remaining shelf-life in days and assigns visual priority tiers:
--   <= 3 days  -> URGENT (Expiring Soon)
--   4 - 7 days -> USE SOON (FEFO Priority)
--   8 - 14 days -> NORMAL
--   > 14 days  -> LONG SHELF-LIFE
SELECT 
    id,
    blood_group,
    component,
    quantity_ml,
    expiration_date,
    (expiration_date - CURRENT_DATE) AS days_until_expiry,
    CASE 
        WHEN (expiration_date - CURRENT_DATE) <= 3 THEN 'URGENT (Expiring Soon)'
        WHEN (expiration_date - CURRENT_DATE) <= 7 THEN 'USE SOON (FEFO Priority)'
        WHEN (expiration_date - CURRENT_DATE) <= 14 THEN 'NORMAL'
        ELSE 'LONG SHELF-LIFE'
    END AS urgency_status,
    blood_bank_name,
    city,
    storage_location
FROM blood_inventory
WHERE status = 'available'
  AND screening_status = 'cleared'
  AND expiration_date > CURRENT_DATE
ORDER BY 
    expiration_date ASC;


-- ============================================================================
-- BONUS: PATIENT BLOOD REQUEST ALLOCATION (FEFO WITH CUMULATIVE VOLUME TRACKING)
-- ============================================================================
-- Example: Patient requests 700 ml of 'O+' 'Packed Red Blood Cells'
SELECT 
    id,
    blood_group,
    component,
    quantity_ml,
    expiration_date,
    (expiration_date - CURRENT_DATE) AS days_until_expiry,
    SUM(quantity_ml) OVER (ORDER BY expiration_date ASC, id ASC) AS cumulative_volume_ml,
    blood_bank_name,
    city
FROM blood_inventory
WHERE blood_group = 'O+'
  AND component = 'Packed Red Blood Cells'
  AND status = 'available'
  AND screening_status = 'cleared'
  AND expiration_date > CURRENT_DATE
ORDER BY 
    expiration_date ASC;
