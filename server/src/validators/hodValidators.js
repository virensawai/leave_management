const { body } = require('express-validator');

const rejectLeaveValidator = [
  body('rejection_reason')
    .trim()
    .notEmpty().withMessage('Rejection reason is required')
    .isLength({ min: 5 }).withMessage('Rejection reason must be at least 5 characters')
    .isLength({ max: 500 }).withMessage('Rejection reason must be at most 500 characters'),
];

module.exports = { rejectLeaveValidator };
