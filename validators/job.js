const { body } = require('express-validator');

// Job creation/update validation
exports.jobValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Job title is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Job title must be between 3 and 100 characters'),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Job description is required')
        .isLength({ min: 10 })
        .withMessage('Job description must be at least 10 characters'),

    body('requirements')
        .isArray({ min: 1 })
        .withMessage('At least one requirement is needed'),

    body('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Location must be between 2 and 100 characters'),

    body('salary')
        .trim()
        .notEmpty()
        .withMessage('Salary is required'),

    body('deadline')
        .notEmpty()
        .withMessage('Deadline is required')
        .isISO8601()
        .withMessage('Deadline must be a valid date')
        .custom((value) => {
            if (new Date(value) < new Date()) {
                throw new Error('Deadline must be in the future');
            }
            return true;
        }),

    body('status')
        .optional()
        .isIn(['open', 'closed'])
        .withMessage('Status must be open or closed')
];
