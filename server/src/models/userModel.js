const { pool } = require('../db/connection');

/**
 * Find a user by email.
 */
async function findByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, password_hash, role, department FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

/**
 * Find a user by ID (without password hash).
 */
async function findById(id) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, role, department, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

/**
 * Create a new user. Returns the insert ID.
 */
async function create({ name, email, passwordHash, role = 'student', department = null }) {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)',
    [name, email, passwordHash, role, department]
  );
  return result.insertId;
}

module.exports = { findByEmail, findById, create };
