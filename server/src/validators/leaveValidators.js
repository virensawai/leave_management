const { body } = require('express-validator');

const VALID_LEAVE_TYPES = ['sick', 'casual', 'academic', 'family', 'other'];

const submitLeaveValidator = [
  body('leave_type')
    .trim()
    .notEmpty().withMessage('Leave type is required')
    .isIn(VALID_LEAVE_TYPES).withMessage(`Leave type must be one of: ${VALID_LEAVE_TYPES.join(', ')}`),

  body('from_date')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date (YYYY-MM-DD)')
    .toDate(),

  body('to_date')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid date (YYYY-MM-DD)')
    .toDate(),

  body('reason')
    .trim()
    .notEmpty().withMessage('Reason is required')
    .isLength({ min: 10 }).withMessage('Reason must be at least 10 characters')
    .isLength({ max: 1000 }).withMessage('Reason must be at most 1000 characters'),

  // Custom validator: from_date must not be after to_date
  body('to_date').custom((value, { req }) => {
    const fromDate = new Date(req.body.from_date);
    const toDate = new Date(value);
    if (fromDate > toDate) {
      throw new Error('End date cannot be before start date');
    }
    return true;
  }),
];

module.exports = { submitLeaveValidator };
