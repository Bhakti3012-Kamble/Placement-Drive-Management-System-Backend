const express = require('express');
const {
    getAdminStats,
    getAllUsers,
    deleteUser,
    getAllCompanies,
    getAccessLogs,
    verifyCompany,
    getAllJobs,
    updateJobStatus,
    updateUser
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);

router.route('/users/:id')
    .delete(deleteUser)
    .put(updateUser);

// Companies routes
router.get('/companies', getAllCompanies);
router.put('/companies/:id/verify', verifyCompany);

// Jobs routes
router.get('/jobs', getAllJobs);
router.put('/jobs/:id/status', updateJobStatus);

// Logs
router.get('/logs', getAccessLogs);

module.exports = router;
