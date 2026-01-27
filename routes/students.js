const express = require('express');
const {
    getStudentProfile,
    updateStudentProfile,
    applyForJob,
    uploadResume,
    updateApplicationStatus,
    getAllStudents
} = require('../controllers/students');
const { studentProfileValidation, applicationStatusValidation } = require('../validators/student');
const validate = require('../middleware/validate');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllStudents);
router.get('/me', protect, authorize('student'), getStudentProfile);
router.put('/me', protect, authorize('student'), studentProfileValidation, validate, updateStudentProfile);
router.post('/apply/:jobId', protect, authorize('student'), applyForJob);
router.put('/resume', protect, authorize('student'), uploadResume);
router.put('/application/:jobId/:studentId', protect, authorize('company', 'admin'), applicationStatusValidation, validate, updateApplicationStatus);

module.exports = router;
