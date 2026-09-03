const { pool } = require('../db/connection');

/**
 * Create a student profile linked to a user.
 */
async function create({ userId, rollNo, section, department, semester }) {
  const [result] = await pool.execute(
    'INSERT INTO students (user_id, roll_no, section, department, semester) VALUES (?, ?, ?, ?, ?)',
    [userId, rollNo, section, department, semester]
  );
  return result.insertId;
}

/**
 * Find student profile by user ID (joined with user data).
 */
async function findByUserId(userId) {
  const [rows] = await pool.execute(
    `SELECT s.id, s.user_id, s.roll_no, s.section, s.department, s.semester,
            u.name, u.email, u.role
     FROM students s
     JOIN users u ON s.user_id = u.id
     WHERE s.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
}

/**
 * Find student profile by student ID.
 */
async function findById(studentId) {
  const [rows] = await pool.execute(
    `SELECT s.id, s.user_id, s.roll_no, s.section, s.department, s.semester,
            u.name, u.email
     FROM students s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = ?`,
    [studentId]
  );
  return rows[0] || null;
}

/**
 * Get all students with user info (for HOD).
 */
async function findAll() {
  const [rows] = await pool.execute(
    `SELECT s.id, s.user_id, s.roll_no, s.section, s.department, s.semester,
            u.name, u.email
     FROM students s
     JOIN users u ON s.user_id = u.id
     ORDER BY s.roll_no ASC`
  );
  return rows;
}

module.exports = { create, findByUserId, findById, findAll };
