const Job = require('../models/Job');
const Student = require('../models/Student');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all jobs
// @route   GET /api/v1/jobs
// @access  Public (or Protected)
exports.getJobs = asyncHandler(async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Job.find(JSON.parse(queryStr)).populate('company', 'name email');

    // Search by keyword
    if (req.query.search) {
        query = query.find({
            $or: [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ]
        });
    }

    // Select Fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Job.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const jobs = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        };
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        };
    }

    res.status(200).json({
        success: true,
        count: jobs.length,
        pagination,
        data: jobs
    });
});

// @desc    Create a job/drive
// @route   POST /api/v1/jobs
// @access  Private/Company/Admin
exports.createJob = asyncHandler(async (req, res, next) => {
    req.body.company = req.user.id;
    const job = await Job.create(req.body);
    res.status(201).json({ success: true, data: job });
});

// @desc    Get single job
// @route   GET /api/v1/jobs/:id
// @access  Public
exports.getJob = asyncHandler(async (req, res, next) => {
    const job = await Job.findById(req.params.id).populate('company', 'name email');
    if (!job) {
        return next(new ErrorResponse('Job not found', 404));
    }
    res.status(200).json({ success: true, data: job });
});

// @desc    Get applications for a job
// @route   GET /api/v1/jobs/:id/applications
// @access  Private/Company/Admin
exports.getJobApplications = asyncHandler(async (req, res, next) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        return next(new ErrorResponse('Job not found', 404));
    }

    // Make sure user is job owner
    if (job.company.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to view applications for this job', 401));
    }

    const students = await Student.find({
        'applications.job': req.params.id
    }).populate('user', 'name email');

    // Filter and format applications
    const applications = students.map(student => {
        const app = student.applications.find(a => a.job.toString() === req.params.id);
        return {
            studentId: student._id,
            name: student?.user?.name || 'Unknown',
            email: student?.user?.email || 'Unknown',
            cgpa: student.cgpa,
            resume: student.resume,
            status: app.status,
            appliedAt: app.appliedAt
        };
    });

    res.status(200).json({
        success: true,
        count: applications.length,
        data: applications
    });
});

// @desc    Update job
// @route   PUT /api/v1/jobs/:id
// @access  Private/Company/Admin
exports.updateJob = asyncHandler(async (req, res, next) => {
    let job = await Job.findById(req.params.id);

    if (!job) {
        return next(new ErrorResponse('Job not found', 404));
    }

    // Make sure user is job owner or admin
    if (job.company.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to update this job', 401));
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({ success: true, data: job });
});

// @desc    Delete job
// @route   DELETE /api/v1/jobs/:id
// @access  Private/Company/Admin
exports.deleteJob = asyncHandler(async (req, res, next) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        return next(new ErrorResponse('Job not found', 404));
    }

    // Make sure user is job owner or admin
    if (job.company.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to delete this job', 401));
    }

    await job.deleteOne();

    res.status(200).json({ success: true, data: {} });
});
