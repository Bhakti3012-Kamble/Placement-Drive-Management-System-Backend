const Job = require('../models/Job');
const Student = require('../models/Student');
const User = require('../models/User');
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
    removeFields.forEach(param => delete reqQuery[param]);

    // Build query object explicitly
    const queryObj = {};

    // Handle CTC filters
    if (reqQuery.ctc) {
        queryObj.ctc = {};
        if (reqQuery.ctc.gte) queryObj.ctc.$gte = Number(reqQuery.ctc.gte);
        if (reqQuery.ctc.gt) queryObj.ctc.$gt = Number(reqQuery.ctc.gt);
        if (reqQuery.ctc.lte) queryObj.ctc.$lte = Number(reqQuery.ctc.lte);
        if (reqQuery.ctc.lt) queryObj.ctc.$lt = Number(reqQuery.ctc.lt);
    }

    // Handle Industry filter (support both single string and array/in)
    if (reqQuery.industry) {
        if (typeof reqQuery.industry === 'object' && reqQuery.industry.in) {
            const industries = typeof reqQuery.industry.in === 'string'
                ? reqQuery.industry.in.split(',')
                : reqQuery.industry.in;
            queryObj.industry = { $in: industries };
        } else if (typeof reqQuery.industry === 'string') {
            queryObj.industry = reqQuery.industry;
        }
    }

    // Handle Location filter
    if (reqQuery.location) {
        queryObj.location = { $regex: reqQuery.location, $options: 'i' };
    }

    // Handle Type filter
    if (reqQuery.type) {
        queryObj.type = reqQuery.type;
    }

    // Finding resource
    query = Job.find(queryObj).populate('company', 'name email');

    // Search by keyword
    if (req.query.search) {
        // Find matching companies first
        const matchedUsers = await User.find({
            name: { $regex: req.query.search, $options: 'i' },
            role: 'company'
        });
        const companyIds = matchedUsers.map(u => u._id);

        query = query.find({
            $or: [
                { title: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } },
                { company: { $in: companyIds } }
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
        total,
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

// @desc    Get all applications for a company (across all jobs)
// @route   GET /api/v1/jobs/applications/all
// @access  Private/Company/Admin
exports.getCompanyApplications = asyncHandler(async (req, res, next) => {
    // 1. Get all jobs for this company
    const jobs = await Job.find({ company: req.user.id });
    const jobIds = jobs.map(job => job._id);

    // 2. Find students who applied to ANY of these jobs
    const students = await Student.find({
        'applications.job': { $in: jobIds }
    }).populate('user', 'name email');

    // 3. Flatten applications
    let allApplications = [];

    students.forEach(student => {
        student.applications.forEach(app => {
            // Check if this application belongs to one of the company's jobs
            const job = jobs.find(j => j._id.equals(app.job));

            if (job) {
                allApplications.push({
                    _id: app._id, // Application ID (if needed)
                    studentId: student._id,
                    jobId: job._id,
                    jobTitle: job.title,
                    name: student?.user?.name || 'Unknown',
                    email: student?.user?.email || 'Unknown',
                    cgpa: student.cgpa,
                    resume: student.resume,
                    status: app.status,
                    appliedAt: app.appliedAt
                });
            }
        });
    });

    // Optional: Sort by appliedAt desc
    allApplications.sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt));

    res.status(200).json({
        success: true,
        count: allApplications.length,
        data: allApplications
    });
});


// @desc    Get recruiter stats (active jobs, total applicants, shortlisted)
// @route   GET /api/v1/jobs/stats
// @access  Private/Company/Admin
exports.getRecruiterStats = asyncHandler(async (req, res, next) => {
    const jobs = await Job.find({ company: req.user.id });
    const jobIds = jobs.map(job => job._id);

    const activeJobs = jobs.filter(job => job.status === 'open').length;

    const students = await Student.find({
        'applications.job': { $in: jobIds }
    });

    let totalApplicants = 0;
    let shortlistedCount = 0;
    let acceptedCount = 0;
    let rejectedCount = 0;

    students.forEach(student => {
        student.applications.forEach(app => {
            if (jobIds.some(id => id.equals(app.job))) {
                totalApplicants++;
                if (app.status === 'shortlisted') shortlistedCount++;
                if (app.status === 'accepted') acceptedCount++;
                if (app.status === 'rejected') rejectedCount++;
            }
        });
    });

    res.status(200).json({
        success: true,
        data: {
            activeJobs,
            totalJobs: jobs.length,
            totalApplicants,
            shortlistedCount,
            acceptedCount,
            rejectedCount
        }
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
