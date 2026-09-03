const studentModel = require('../models/studentModel');
const leaveModel = require('../models/leaveModel');
const { success, error } = require('../utils/response');

/**
 * GET /api/student/dashboard
 * Get student dashboard statistics.
 */
async function getDashboard(req, res, next) {
  try {
    const student = await studentModel.findByUserId(req.user.userId);
    if (!student) {
      return error(res, 'Student profile not found', 'NOT_FOUND', 404);
    }

    const stats = await leaveModel.getStudentStats(student.id);

    return success(res, 'Dashboard data retrieved', {
      student: {
        name: student.name,
        roll_no: student.roll_no,
        section: student.section,
        department: student.department,
        semester: student.semester,
      },
      stats: {
        total: Number(stats.total) || 0,
        pending: Number(stats.pending) || 0,
        approved: Number(stats.approved) || 0,
        rejected: Number(stats.rejected) || 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/leaves
 * Submit a new leave application.
 * Student identity is derived from authenticated user, NOT from request body.
 */
async function submitLeave(req, res, next) {
  try {
    const student = await studentModel.findByUserId(req.user.userId);
    if (!student) {
      return error(res, 'Student profile not found', 'NOT_FOUND', 404);
    }

    const { leave_type, from_date, to_date, reason } = req.body;

    const leaveId = await leaveModel.create({
      studentId: student.id,
      leaveType: leave_type,
      fromDate: from_date,
      toDate: to_date,
      reason,
    });

    return success(res, 'Leave application submitted successfully', { id: leaveId }, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/leaves/my
 * Get all leave applications for the authenticated student.
 */
async function getMyLeaves(req, res, next) {
  try {
    const student = await studentModel.findByUserId(req.user.userId);
    if (!student) {
      return error(res, 'Student profile not found', 'NOT_FOUND', 404);
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await leaveModel.findByStudentId(student.id, { page, limit });

    return success(res, 'Leave applications retrieved', result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/leaves/:id
 * Get a single leave application detail.
 * Only the owning student can access their own application.
 */
async function getLeaveDetail(req, res, next) {
  try {
    const student = await studentModel.findByUserId(req.user.userId);
    if (!student) {
      return error(res, 'Student profile not found', 'NOT_FOUND', 404);
    }

    const leaveId = parseInt(req.params.id, 10);
    if (isNaN(leaveId)) {
      return error(res, 'Invalid leave application ID', 'VALIDATION_ERROR', 400);
    }

    const leave = await leaveModel.findById(leaveId);
    if (!leave) {
      return error(res, 'Leave application not found', 'NOT_FOUND', 404);
    }

    // Verify ownership — student can only view their own applications
    if (leave.student_id !== student.id) {
      return error(res, 'You do not have permission to view this application', 'FORBIDDEN', 403);
    }

    return success(res, 'Leave application retrieved', { leave });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/leaves/:id/cancel
 * Cancel a pending leave application.
 * Only the owning student can cancel, and only if it's still pending.
 */
async function cancelLeave(req, res, next) {
  try {
    const student = await studentModel.findByUserId(req.user.userId);
    if (!student) {
      return error(res, 'Student profile not found', 'NOT_FOUND', 404);
    }

    const leaveId = parseInt(req.params.id, 10);
    if (isNaN(leaveId)) {
      return error(res, 'Invalid leave application ID', 'VALIDATION_ERROR', 400);
    }

    const leave = await leaveModel.findById(leaveId);
    if (!leave) {
      return error(res, 'Leave application not found', 'NOT_FOUND', 404);
    }

    // Verify ownership
    if (leave.student_id !== student.id) {
      return error(res, 'You do not have permission to cancel this application', 'FORBIDDEN', 403);
    }

    if (leave.status !== 'pending') {
      return error(res, `Cannot cancel a leave application that is already ${leave.status}`, 'INVALID_STATE', 400);
    }

    const cancelled = await leaveModel.cancel(leaveId, student.id);
    if (!cancelled) {
      return error(res, 'Failed to cancel the application. It may have already been processed.', 'CONFLICT', 409);
    }

    return success(res, 'Leave application cancelled successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, submitLeave, getMyLeaves, getLeaveDetail, cancelLeave };
