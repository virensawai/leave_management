/**
 * Migration: Add department column to users table and seed HODs for all branches:
 * CSE, CSE(AIML), AIDS, EXTC, EE, ME, CIVIL
 */
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '../../../../.env') });

async function migrate() {
  let sslConfig = undefined;
  if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
    sslConfig = {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    };
    if (process.env.DB_CA_PATH) {
      const rootDir = path.join(__dirname, '../../../../');
      const caFullPath = path.isAbsolute(process.env.DB_CA_PATH)
        ? process.env.DB_CA_PATH
        : path.join(rootDir, process.env.DB_CA_PATH);
      if (fs.existsSync(caFullPath)) {
        sslConfig.ca = fs.readFileSync(caFullPath);
      }
    }
  }

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'leave_management',
    multipleStatements: true,
    ...(sslConfig ? { ssl: sslConfig } : {}),
  });

  console.log('Connected to database for migration...');

  // 1. Check if department column exists in users table
  const [columns] = await connection.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'department'`,
    [process.env.DB_NAME || 'leave_management']
  );

  if (columns.length === 0) {
    console.log('Adding department column to users table...');
    await connection.query(
      `ALTER TABLE users ADD COLUMN department VARCHAR(50) DEFAULT NULL AFTER role`
    );
    console.log('✓ department column added to users table');
  } else {
    console.log('department column already exists in users table.');
  }

  // 2. Standardize existing students to 'CSE'
  await connection.query(
    `UPDATE students SET department = 'CSE' WHERE department = 'Computer Science'`
  );
  console.log('✓ Updated existing students department to CSE');

  // 3. Define the 7 Branch HODs
  // Admin@123 password hash
  const hodPasswordHash = '$2b$10$AQGzikDXfm5JBVxJdx8IhOtGptcSY.uauUxkzrMTQYlnbKPZF6nz2';
  const studentPasswordHash = '$2b$10$PwZW.jyRw1ox7MgXCezwWeoVvEOKCykxVc.wpUNhqlSzGX23ZTmpq';

  const hods = [
    { name: 'Dr. Rajesh Sharma', email: 'hod.cse@college.local', department: 'CSE' },
    { name: 'Dr. Rajesh Sharma', email: 'hod@college.local', department: 'CSE' }, // legacy compatibility
    { name: 'Dr. Sunita Patil', email: 'hod.aiml@college.local', department: 'CSE(AIML)' },
    { name: 'Dr. Amit Deshmukh', email: 'hod.aids@college.local', department: 'AIDS' },
    { name: 'Dr. Snehal Kulkarni', email: 'hod.extc@college.local', department: 'EXTC' },
    { name: 'Dr. Manoj Verma', email: 'hod.ee@college.local', department: 'EE' },
    { name: 'Dr. Vikram Shinde', email: 'hod.me@college.local', department: 'ME' },
    { name: 'Dr. Priya Joshi', email: 'hod.civil@college.local', department: 'CIVIL' },
  ];

  for (const hod of hods) {
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [hod.email]);
    if (existing.length > 0) {
      await connection.query(
        'UPDATE users SET name = ?, role = "hod", department = ? WHERE email = ?',
        [hod.name, hod.department, hod.email]
      );
      console.log(`✓ Updated HOD: ${hod.name} (${hod.department}) - ${hod.email}`);
    } else {
      await connection.query(
        'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, "hod", ?)',
        [hod.name, hod.email, hodPasswordHash, hod.department]
      );
      console.log(`✓ Created HOD: ${hod.name} (${hod.department}) - ${hod.email}`);
    }
  }

  // 4. Seed sample students for CSE(AIML) and AIDS so we have data across branches
  const sampleBranchStudents = [
    {
      name: 'Tanvi Shah',
      email: 'tanvi.aiml@college.local',
      roll_no: 'AIML2024001',
      section: 'A',
      department: 'CSE(AIML)',
      semester: 4,
      leave: {
        leave_type: 'sick',
        from_date: '2026-09-10',
        to_date: '2026-09-12',
        reason: 'Viral fever, doctor prescribed 3 days complete rest.',
      }
    },
    {
      name: 'Kunal Patil',
      email: 'kunal.aids@college.local',
      roll_no: 'AIDS2024001',
      section: 'A',
      department: 'AIDS',
      semester: 4,
      leave: {
        leave_type: 'academic',
        from_date: '2026-09-14',
        to_date: '2026-09-15',
        reason: 'Attending national data science seminar at COEP.',
      }
    }
  ];

  for (const st of sampleBranchStudents) {
    const [uRows] = await connection.query('SELECT id FROM users WHERE email = ?', [st.email]);
    let userId;
    if (uRows.length === 0) {
      const [uRes] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, "student", ?)',
        [st.name, st.email, studentPasswordHash, st.department]
      );
      userId = uRes.insertId;
      console.log(`✓ Created sample student user: ${st.name} (${st.department})`);
    } else {
      userId = uRows[0].id;
    }

    const [sRows] = await connection.query('SELECT id FROM students WHERE user_id = ?', [userId]);
    let studentId;
    if (sRows.length === 0) {
      const [sRes] = await connection.query(
        'INSERT INTO students (user_id, roll_no, section, department, semester) VALUES (?, ?, ?, ?, ?)',
        [userId, st.roll_no, st.section, st.department, st.semester]
      );
      studentId = sRes.insertId;
      console.log(`✓ Created sample student profile for ${st.roll_no}`);
    } else {
      studentId = sRows[0].id;
    }

    // Insert sample pending leave
    const [lRows] = await connection.query(
      'SELECT id FROM leave_applications WHERE student_id = ? AND from_date = ?',
      [studentId, st.leave.from_date]
    );
    if (lRows.length === 0) {
      await connection.query(
        `INSERT INTO leave_applications (student_id, leave_type, from_date, to_date, reason, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [studentId, st.leave.leave_type, st.leave.from_date, st.leave.to_date, st.leave.reason]
      );
      console.log(`✓ Created pending leave for ${st.name} (${st.department})`);
    }
  }

  await connection.end();
  console.log('\n✓ Migration and branch seeding completed successfully!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
