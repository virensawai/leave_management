const leaveModel = require('../models/leaveModel');
const studentModel = require('../models/studentModel');
const { success, error } = require('../utils/response');

/**
 * GET /api/hod/dashboard
 * Get overall leave statistics for the HOD dashboard.
 */
async function getDashboard(req, res, next) {
  try {
    const stats = await leaveModel.getAllStats();

    return success(res, 'HOD dashboard data retrieved', {
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
 * GET /api/hod/leaves
 * Get all leave applications with filters, search, and pagination.
 * All filtering is performed server-side.
 */
async function getLeaves(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      leave_type,
      section,
      search,
      from_date,
      to_date,
    } = req.query;

    const result = await leaveModel.findAll({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      status,
      leaveType: leave_type,
      section,
      search,
      fromDate: from_date,
      toDate: to_date,
    });

    return success(res, 'Leave applications retrieved', result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/hod/leaves/:id
 * Get full leave application details including student information.
 */
async function getLeaveDetail(req, res, next) {
  try {
    const leaveId = parseInt(req.params.id, 10);
    if (isNaN(leaveId)) {
      return error(res, 'Invalid leave application ID', 'VALIDATION_ERROR', 400);
    }

    const leave = await leaveModel.findById(leaveId);
    if (!leave) {
      return error(res, 'Leave application not found', 'NOT_FOUND', 404);
    }

    return success(res, 'Leave application retrieved', { leave });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/hod/leaves/:id/approve
 * Approve a pending leave application.
 */
async function approveLeave(req, res, next) {
  try {
    const leaveId = parseInt(req.params.id, 10);
    if (isNaN(leaveId)) {
      return error(res, 'Invalid leave application ID', 'VALIDATION_ERROR', 400);
    }

    const leave = await leaveModel.findById(leaveId);
    if (!leave) {
      return error(res, 'Leave application not found', 'NOT_FOUND', 404);
    }

    if (leave.status !== 'pending') {
      return error(
        res,
        `Cannot approve a leave application that is already ${leave.status}`,
        'INVALID_STATE',
        400
      );
    }

    const approved = await leaveModel.approve(leaveId, req.user.userId);
    if (!approved) {
      return error(res, 'Failed to approve. The application may have already been processed.', 'CONFLICT', 409);
    }

    return success(res, 'Leave application approved successfully');
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/hod/leaves/:id/reject
 * Reject a pending leave application with a required reason.
 */
async function rejectLeave(req, res, next) {
  try {
    const leaveId = parseInt(req.params.id, 10);
    if (isNaN(leaveId)) {
      return error(res, 'Invalid leave application ID', 'VALIDATION_ERROR', 400);
    }

    const leave = await leaveModel.findById(leaveId);
    if (!leave) {
      return error(res, 'Leave application not found', 'NOT_FOUND', 404);
    }

    if (leave.status !== 'pending') {
      return error(
        res,
        `Cannot reject a leave application that is already ${leave.status}`,
        'INVALID_STATE',
        400
      );
    }

    const { rejection_reason } = req.body;

    const rejected = await leaveModel.reject(leaveId, req.user.userId, rejection_reason);
    if (!rejected) {
      return error(res, 'Failed to reject. The application may have already been processed.', 'CONFLICT', 409);
    }

    return success(res, 'Leave application rejected');
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/hod/students
 * Get all students list.
 */
async function getStudents(req, res, next) {
  try {
    const students = await studentModel.findAll();
    return success(res, 'Students retrieved', { students });
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard, getLeaves, getLeaveDetail, approveLeave, rejectLeave, getStudents };
