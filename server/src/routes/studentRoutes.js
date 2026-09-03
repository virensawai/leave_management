const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { submitLeaveValidator } = require('../validators/leaveValidators');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');

// All student routes require authentication + student role
router.use(authenticate, requireRole('student'));

// GET /api/student/dashboard
router.get('/dashboard', studentController.getDashboard);

// POST /api/leaves — Submit leave application
router.post('/leaves', submitLeaveValidator, validate, studentController.submitLeave);

// GET /api/leaves/my — Get own leave applications
router.get('/leaves/my', studentController.getMyLeaves);

// GET /api/leaves/:id — Get single leave detail
router.get('/leaves/:id', studentController.getLeaveDetail);

// PATCH /api/leaves/:id/cancel — Cancel a pending leave
router.patch('/leaves/:id/cancel', studentController.cancelLeave);

module.exports = router;
