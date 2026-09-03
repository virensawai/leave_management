const express = require('express');
const router = express.Router();
const hodController = require('../controllers/hodController');
const { rejectLeaveValidator } = require('../validators/hodValidators');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');

// All HOD routes require authentication + hod role
router.use(authenticate, requireRole('hod'));

// GET /api/hod/dashboard
router.get('/dashboard', hodController.getDashboard);

// GET /api/hod/leaves — List all leaves with filters
router.get('/leaves', hodController.getLeaves);

// GET /api/hod/leaves/:id — Get leave detail
router.get('/leaves/:id', hodController.getLeaveDetail);

// PATCH /api/hod/leaves/:id/approve — Approve leave
router.patch('/leaves/:id/approve', hodController.approveLeave);

// PATCH /api/hod/leaves/:id/reject — Reject leave (requires reason)
router.patch('/leaves/:id/reject', rejectLeaveValidator, validate, hodController.rejectLeave);

// GET /api/hod/students — List all students
router.get('/students', hodController.getStudents);

module.exports = router;
