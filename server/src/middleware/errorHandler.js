const { error } = require('../utils/response');

/**
 * Global error handling middleware.
 * Catches unhandled errors and returns a safe response without exposing internals.
 */
function errorHandler(err, req, res, _next) {
  console.error('Unhandled error:', err.message);

  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Handle specific error types
  if (err.name === 'JsonWebTokenError') {
    return error(res, 'Invalid token', 'AUTH_ERROR', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return error(res, 'Token has expired', 'TOKEN_EXPIRED', 401);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return error(res, 'A record with this information already exists', 'DUPLICATE_ERROR', 409);
  }

  return error(res, 'Internal server error', 'SERVER_ERROR', 500);
}

module.exports = errorHandler;
