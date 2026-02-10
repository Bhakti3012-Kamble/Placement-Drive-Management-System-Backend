const express = require('express');
const {
    getAdminStats,
    getAllUsers,
    deleteUser,
    getAllCompanies,
    getAccessLogs
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/companies', getAllCompanies);
router.get('/logs', getAccessLogs);

module.exports = router;
