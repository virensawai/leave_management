/**
 * Standardized API response helpers.
 * Every API response uses one of these to maintain consistency.
 */

function success(res, message, data = null, statusCode = 200) {
  const response = { success: true, message };
  if (data !== null) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
}

function error(res, message, errorCode = 'SERVER_ERROR', statusCode = 500) {
  return res.status(statusCode).json({
    success: false,
    message,
    error: errorCode,
  });
}

function validationError(res, message, errors = []) {
  return res.status(400).json({
    success: false,
    message,
    error: 'VALIDATION_ERROR',
    errors,
  });
}

module.exports = { success, error, validationError };
