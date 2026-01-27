const { body } = require('express-validator');

// Student profile validation
exports.studentProfileValidation = [
    body('rollNo')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Roll number is required')
        .isLength({ min: 1, max: 20 })
        .withMessage('Roll number must be between 1 and 20 characters'),

    body('branch')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Branch is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Branch must be between 2 and 50 characters'),

    body('cgpa')
        .optional()
        .isFloat({ min: 0, max: 10 })
        .withMessage('CGPA must be between 0 and 10'),

    body('skills')
        .optional()
        .isArray()
        .withMessage('Skills must be an array')
];

// Application status update validation
exports.applicationStatusValidation = [
    body('status')
        .notEmpty()
        .withMessage('Status is required')
        .isIn(['applied', 'shortlisted', 'accepted', 'rejected'])
        .withMessage('Status must be applied, shortlisted, accepted, or rejected')
];
