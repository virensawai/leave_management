const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/register — Register a new student
router.post('/register', registerValidator, validate, authController.register);

// POST /api/auth/login — Login
router.post('/login', loginValidator, validate, authController.login);

// GET /api/auth/me — Get current user info (requires authentication)
router.get('/me', authenticate, authController.getMe);

module.exports = router;
