const { validationResult } = require('express-validator');
const { validationError } = require('../utils/response');

/**
 * Middleware: Check express-validator results and return errors if any.
 * Place after validator arrays in route definitions.
 */
function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));

    return validationError(res, 'Validation failed', errorMessages);
  }

  next();
}

module.exports = validate;
