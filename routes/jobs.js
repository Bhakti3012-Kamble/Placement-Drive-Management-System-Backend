const express = require('express');
const {
    getJobs,
    getJob,
    createJob,
    getJobApplications,
    updateJob,
    deleteJob
} = require('../controllers/jobs');
const { jobValidation } = require('../validators/job');
const validate = require('../middleware/validate');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(getJobs)
    .post(protect, authorize('company', 'admin'), jobValidation, validate, createJob);

router.route('/:id')
    .get(getJob)
    .put(protect, authorize('company', 'admin'), jobValidation, validate, updateJob)
    .delete(protect, authorize('company', 'admin'), deleteJob);

router.get('/:id/applications', protect, authorize('company', 'admin'), getJobApplications);

module.exports = router;
