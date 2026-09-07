-- SmartBlood AI Initial Seed SQL
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Regional Transfusion Command Administrator'),
('BLOOD_BANK', 'Blood Bank Laboratory Verification Officer'),
('HOSPITAL', 'Hospital Emergency & Transfusion Department'),
('DONOR', 'Registered Voluntary Blood Donor'),
('PATIENT', 'Patient Family / Emergency Seeker')
ON CONFLICT (name) DO NOTHING;
