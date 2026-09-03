const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches decoded user info to req.user = { userId, role }
 */
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'Authentication required', 'AUTH_REQUIRED', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Token has expired. Please login again.', 'TOKEN_EXPIRED', 401);
    }
    return error(res, 'Invalid or malformed token', 'AUTH_ERROR', 401);
  }
}

/**
 * Middleware factory: Restrict access to specific roles.
 * Usage: requireRole('hod'), requireRole('student')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'Authentication required', 'AUTH_REQUIRED', 401);
    }

    if (!roles.includes(req.user.role)) {
      return error(res, 'You do not have permission to access this resource', 'FORBIDDEN', 403);
    }

    next();
  };
}

module.exports = { authenticate, requireRole };
