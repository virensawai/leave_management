-- =====================================================
-- College Student Leave Management System
-- Seed Data (Development Only)
-- =====================================================
-- Demo Credentials:
--   HOD:     hod@college.local     / Admin@123
--   Students: aarav@college.local  / Student@123
--             priya@college.local  / Student@123
--             rahul@college.local  / Student@123
--             ananya@college.local / Student@123
--             vikram@college.local / Student@123
-- =====================================================

USE leave_management;

-- =====================================================
-- Insert Users (INSERT IGNORE prevents duplicate error)
-- =====================================================

-- HOD user
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
('Dr. Sharma', 'hod@college.local', '$2b$10$AQGzikDXfm5JBVxJdx8IhOtGptcSY.uauUxkzrMTQYlnbKPZF6nz2', 'hod');

-- Student users
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
('Aarav Patel',   'aarav@college.local',  '$2b$10$PwZW.jyRw1ox7MgXCezwWeoVvEOKCykxVc.wpUNhqlSzGX23ZTmpq', 'student'),
('Priya Singh',   'priya@college.local',  '$2b$10$PwZW.jyRw1ox7MgXCezwWeoVvEOKCykxVc.wpUNhqlSzGX23ZTmpq', 'student'),
('Rahul Kumar',   'rahul@college.local',  '$2b$10$PwZW.jyRw1ox7MgXCezwWeoVvEOKCykxVc.wpUNhqlSzGX23ZTmpq', 'student'),
('Ananya Reddy',  'ananya@college.local', '$2b$10$PwZW.jyRw1ox7MgXCezwWeoVvEOKCykxVc.wpUNhqlSzGX23ZTmpq', 'student'),
('Vikram Joshi',  'vikram@college.local', '$2b$10$PwZW.jyRw1ox7MgXCezwWeoVvEOKCykxVc.wpUNhqlSzGX23ZTmpq', 'student');

-- =====================================================
-- Insert Student Profiles
-- =====================================================

INSERT IGNORE INTO students (user_id, roll_no, section, department, semester) VALUES
((SELECT id FROM users WHERE email = 'aarav@college.local'),  'CS2024001', 'A', 'Computer Science', 4),
((SELECT id FROM users WHERE email = 'priya@college.local'),  'CS2024002', 'A', 'Computer Science', 4),
((SELECT id FROM users WHERE email = 'rahul@college.local'),  'CS2024003', 'B', 'Computer Science', 4),
((SELECT id FROM users WHERE email = 'ananya@college.local'), 'CS2024004', 'B', 'Computer Science', 4),
((SELECT id FROM users WHERE email = 'vikram@college.local'), 'CS2024005', 'A', 'Computer Science', 4);

-- =====================================================
-- Insert Sample Leave Applications
-- Only insert if not already present for the student
-- =====================================================

-- Aarav: 1 approved, 1 pending
INSERT INTO leave_applications (student_id, leave_type, from_date, to_date, reason, status, reviewed_by, reviewed_at)
SELECT s.id, 'sick', '2026-08-10', '2026-08-12',
       'Had a high fever and was advised bed rest by the doctor. Attaching medical certificate.',
       'approved', u.id, '2026-08-10 10:30:00'
FROM students s, users u
WHERE s.roll_no = 'CS2024001' AND u.email = 'hod@college.local'
  AND NOT EXISTS (SELECT 1 FROM leave_applications WHERE student_id = s.id AND from_date = '2026-08-10');

INSERT INTO leave_applications (student_id, leave_type, from_date, to_date, reason, status)
SELECT s.id, 'casual', '2026-09-15', '2026-09-16',
       'Need to attend a family function in my hometown. Will ensure all pending assignments are submitted beforehand.',
       'pending'
FROM students s
WHERE s.roll_no = 'CS2024001'
  AND NOT EXISTS (SELECT 1 FROM leave_applications WHERE student_id = s.id AND from_date = '2026-09-15');

-- Priya: 1 rejected
INSERT INTO leave_applications (student_id, leave_type, from_date, to_date, reason, status, rejection_reason, reviewed_by, reviewed_at)
SELECT s.id, 'casual', '2026-08-20', '2026-08-25',
       'Planning a short vacation with family.',
       'rejected',
       'Leave duration is too long and coincides with mid-semester exams. Please reschedule.',
       u.id, '2026-08-19 14:00:00'
FROM students s, users u
WHERE s.roll_no = 'CS2024002' AND u.email = 'hod@college.local'
  AND NOT EXISTS (SELECT 1 FROM leave_applications WHERE student_id = s.id AND from_date = '2026-08-20');

-- Rahul: 1 approved, 1 pending
INSERT INTO leave_applications (student_id, leave_type, from_date, to_date, reason, status, reviewed_by, reviewed_at)
SELECT s.id, 'academic', '2026-08-05', '2026-08-06',
       'Participating in the inter-college coding hackathon organized by IIT Delhi.',
       'approved', u.id, '2026-08-04 09:15:00'
FROM students s, users u
WHERE s.roll_no = 'CS2024003' AND u.email = 'hod@college.local'
  AND NOT EXISTS (SELECT 1 FROM leave_applications WHERE student_id = s.id AND from_date = '2026-08-05');

INSERT INTO leave_applications (student_id, leave_type, from_date, to_date, reason, status)
SELECT s.id, 'family', '2026-09-20', '2026-09-22',
       'Sister\'s wedding ceremony. Need to travel to Jaipur for the function.',
       'pending'
FROM students s
WHERE s.roll_no = 'CS2024003'
  AND NOT EXISTS (SELECT 1 FROM leave_applications WHERE student_id = s.id AND from_date = '2026-09-20');

-- Ananya: 1 cancelled
INSERT INTO leave_applications (student_id, leave_type, from_date, to_date, reason, status)
SELECT s.id, 'sick', '2026-08-28', '2026-08-28',
       'Was feeling unwell in the morning but recovered by afternoon. Cancelling this application.',
       'cancelled'
FROM students s
WHERE s.roll_no = 'CS2024004'
  AND NOT EXISTS (SELECT 1 FROM leave_applications WHERE student_id = s.id AND from_date = '2026-08-28');

-- Ananya: 1 pending
INSERT INTO leave_applications (student_id, leave_type, from_date, to_date, reason, status)
SELECT s.id, 'other', '2026-09-25', '2026-09-26',
       'Need to visit the passport office for document verification. Appointment is already scheduled.',
       'pending'
FROM students s
WHERE s.roll_no = 'CS2024004'
  AND NOT EXISTS (SELECT 1 FROM leave_applications WHERE student_id = s.id AND from_date = '2026-09-25');

-- Vikram: 1 approved
INSERT INTO leave_applications (student_id, leave_type, from_date, to_date, reason, status, reviewed_by, reviewed_at)
SELECT s.id, 'family', '2026-08-15', '2026-08-17',
       'Family emergency — grandmother hospitalized. Need to travel immediately.',
       'approved', u.id, '2026-08-15 08:00:00'
FROM students s, users u
WHERE s.roll_no = 'CS2024005' AND u.email = 'hod@college.local'
  AND NOT EXISTS (SELECT 1 FROM leave_applications WHERE student_id = s.id AND from_date = '2026-08-15');
