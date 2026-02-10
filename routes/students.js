const express = require('express');
const {
    getStudentProfile,
    updateStudentProfile,
    applyForJob,
    uploadDocuments,
    updateApplicationStatus,
    studentUpdateApplicationStatus,
    getNotifications,
    markNotificationRead,
    deleteNotification,
    getAllStudents,
    bulkUpdateApplicationStatus
} = require('../controllers/students');
const { studentProfileValidation, applicationStatusValidation } = require('../validators/student');
const validate = require('../middleware/validate');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin'), getAllStudents);
router.get('/notifications', protect, authorize('student'), getNotifications);
router.put('/notifications/:id/read', protect, authorize('student'), markNotificationRead);
router.delete('/notifications/:id', protect, authorize('student'), deleteNotification);
router.get('/me', protect, authorize('student'), getStudentProfile);
router.put('/me', protect, authorize('student'), studentProfileValidation, validate, updateStudentProfile);
router.post('/apply/:jobId', protect, authorize('student'), applyForJob);
router.put('/documents', protect, authorize('student'), uploadDocuments);
router.put('/application/bulk', protect, authorize('company', 'admin'), bulkUpdateApplicationStatus);
router.put('/application/:jobId/:studentId', protect, authorize('company', 'admin'), applicationStatusValidation, validate, updateApplicationStatus);
router.put('/applications/:jobId/status', protect, authorize('student'), studentUpdateApplicationStatus);

module.exports = router;
