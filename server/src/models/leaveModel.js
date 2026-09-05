const { pool } = require('../db/connection');

/**
 * Create a new leave application.
 */
async function create({ studentId, leaveType, fromDate, toDate, reason }) {
  const [result] = await pool.execute(
    `INSERT INTO leave_applications (student_id, leave_type, from_date, to_date, reason)
     VALUES (?, ?, ?, ?, ?)`,
    [studentId, leaveType, fromDate, toDate, reason]
  );
  return result.insertId;
}

/**
 * Find a leave application by ID.
 */
async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT la.*, u.name AS student_name, s.roll_no, s.section, s.department, s.semester,
            reviewer.name AS reviewed_by_name
     FROM leave_applications la
     JOIN students s ON la.student_id = s.id
     JOIN users u ON s.user_id = u.id
     LEFT JOIN users reviewer ON la.reviewed_by = reviewer.id
     WHERE la.id = ?`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Find all leave applications for a specific student.
 */
async function findByStudentId(studentId, { page = 1, limit = 10 } = {}) {
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT la.id, la.leave_type, la.from_date, la.to_date, la.reason,
            la.status, la.rejection_reason, la.created_at
     FROM leave_applications la
     WHERE la.student_id = ?
     ORDER BY la.created_at DESC
     LIMIT ? OFFSET ?`,
    [studentId, Number(limit), Number(offset)]
  );

  const [countResult] = await pool.execute(
    'SELECT COUNT(*) AS total FROM leave_applications WHERE student_id = ?',
    [studentId]
  );

  return {
    leaves: rows,
    total: countResult[0].total,
    page,
    limit,
    totalPages: Math.ceil(countResult[0].total / limit),
  };
}

/**
 * Get leave statistics for a student.
 */
async function getStudentStats(studentId) {
  const [rows] = await pool.execute(
    `SELECT
       COUNT(*) AS total,
       SUM(status = 'pending') AS pending,
       SUM(status = 'approved') AS approved,
       SUM(status = 'rejected') AS rejected,
       SUM(status = 'cancelled') AS cancelled
     FROM leave_applications
     WHERE student_id = ?`,
    [studentId]
  );
  return rows[0];
}

/**
 * Get overall leave statistics (for HOD, optionally filtered by department).
 */
async function getAllStats(department) {
  let query = `
    SELECT
      COUNT(*) AS total,
      SUM(la.status = 'pending') AS pending,
      SUM(la.status = 'approved') AS approved,
      SUM(la.status = 'rejected') AS rejected,
      SUM(la.status = 'cancelled') AS cancelled
    FROM leave_applications la
  `;
  const params = [];
  if (department) {
    query += ` JOIN students s ON la.student_id = s.id WHERE s.department = ?`;
    params.push(department);
  }
  const [rows] = await pool.execute(query, params);
  return rows[0];
}

/**
 * Find all leave applications with filters (for HOD).
 * All filtering is done server-side with parameterized queries.
 */
async function findAll({ page = 1, limit = 10, department, status, leaveType, section, search, fromDate, toDate } = {}) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];

  if (department) {
    conditions.push('s.department = ?');
    params.push(department);
  }

  if (status) {
    conditions.push('la.status = ?');
    params.push(status);
  }

  if (leaveType) {
    conditions.push('la.leave_type = ?');
    params.push(leaveType);
  }

  if (section) {
    conditions.push('s.section = ?');
    params.push(section);
  }

  if (search) {
    conditions.push('(u.name LIKE ? OR s.roll_no LIKE ?)');
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  if (fromDate) {
    conditions.push('la.from_date >= ?');
    params.push(fromDate);
  }

  if (toDate) {
    conditions.push('la.to_date <= ?');
    params.push(toDate);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT la.id, la.leave_type, la.from_date, la.to_date, la.reason,
           la.status, la.rejection_reason, la.created_at,
           u.name AS student_name, s.roll_no, s.section, s.department
    FROM leave_applications la
    JOIN students s ON la.student_id = s.id
    JOIN users u ON s.user_id = u.id
    ${whereClause}
    ORDER BY
      CASE la.status WHEN 'pending' THEN 0 ELSE 1 END,
      la.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM leave_applications la
    JOIN students s ON la.student_id = s.id
    JOIN users u ON s.user_id = u.id
    ${whereClause}
  `;

  const [rows] = await pool.query(query, [...params, Number(limit), Number(offset)]);
  const [countResult] = await pool.execute(countQuery, params);

  return {
    leaves: rows,
    total: countResult[0].total,
    page,
    limit,
    totalPages: Math.ceil(countResult[0].total / limit),
  };
}

/**
 * Update leave application status to 'approved'.
 */
async function approve(leaveId, reviewedBy) {
  const [result] = await pool.execute(
    `UPDATE leave_applications
     SET status = 'approved', reviewed_by = ?, reviewed_at = NOW()
     WHERE id = ? AND status = 'pending'`,
    [reviewedBy, leaveId]
  );
  return result.affectedRows > 0;
}

/**
 * Update leave application status to 'rejected' with reason.
 */
async function reject(leaveId, reviewedBy, rejectionReason) {
  const [result] = await pool.execute(
    `UPDATE leave_applications
     SET status = 'rejected', rejection_reason = ?, reviewed_by = ?, reviewed_at = NOW()
     WHERE id = ? AND status = 'pending'`,
    [rejectionReason, reviewedBy, leaveId]
  );
  return result.affectedRows > 0;
}

/**
 * Cancel a pending leave application (by student).
 */
async function cancel(leaveId, studentId) {
  const [result] = await pool.execute(
    `UPDATE leave_applications
     SET status = 'cancelled'
     WHERE id = ? AND student_id = ? AND status = 'pending'`,
    [leaveId, studentId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  create,
  findById,
  findByStudentId,
  getStudentStats,
  getAllStats,
  findAll,
  approve,
  reject,
  cancel,
};
