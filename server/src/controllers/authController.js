const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const studentModel = require('../models/studentModel');
const { success, error } = require('../utils/response');

const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Register a new student account.
 */
async function register(req, res, next) {
  try {
    const { name, email, password, roll_no, section, department, semester } = req.body;

    // Check if email already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return error(res, 'An account with this email already exists', 'DUPLICATE_ERROR', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const userId = await userModel.create({
      name,
      email,
      passwordHash,
      role: 'student',
      department,
    });

    // Create student profile
    await studentModel.create({
      userId,
      rollNo: roll_no,
      section,
      department,
      semester: parseInt(semester, 10),
    });

    // Generate JWT
    const token = jwt.sign(
      { userId, role: 'student', department },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return success(res, 'Registration successful', {
      token,
      user: { id: userId, name, email, role: 'student', department },
    }, 201);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 * Authenticate user and return JWT.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await userModel.findByEmail(email);
    if (!user) {
      return error(res, 'Invalid email or password', 'AUTH_FAILED', 401);
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return error(res, 'Invalid email or password', 'AUTH_FAILED', 401);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return success(res, 'Login successful', {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * Get current authenticated user info + student profile if applicable.
 */
async function getMe(req, res, next) {
  try {
    const user = await userModel.findById(req.user.userId);
    if (!user) {
      return error(res, 'User not found', 'NOT_FOUND', 404);
    }

    let studentProfile = null;
    if (user.role === 'student') {
      studentProfile = await studentModel.findByUserId(user.id);
    }

    return success(res, 'User info retrieved', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        created_at: user.created_at,
      },
      student: studentProfile
        ? {
            student_id: studentProfile.id,
            roll_no: studentProfile.roll_no,
            section: studentProfile.section,
            department: studentProfile.department,
            semester: studentProfile.semester,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, getMe };
