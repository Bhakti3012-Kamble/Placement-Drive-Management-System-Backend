const path = require('path');
const Student = require('../models/Student');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get current student profile
// @route   GET /api/v1/students/me
// @access  Private/Student
exports.getStudentProfile = asyncHandler(async (req, res, next) => {
    const student = await Student.findOne({ user: req.user.id }).populate('user', 'name email');

    if (!student) {
        return next(new ErrorResponse('Student profile not found', 404));
    }

    res.status(200).json({ success: true, data: student });
});

// @desc    Update student profile
// @route   PUT /api/v1/students/me
// @access  Private/Student
exports.updateStudentProfile = asyncHandler(async (req, res, next) => {
    let student = await Student.findOne({ user: req.user.id });

    if (!student) {
        // Create if not exists
        req.body.user = req.user.id;
        student = await Student.create(req.body);
    } else {
        student = await Student.findOneAndUpdate({ user: req.user.id }, req.body, {
            new: true,
            runValidators: true
        });
    }

    res.status(200).json({ success: true, data: student });
});

// @desc    Apply for a job
// @route   POST /api/v1/students/apply/:jobId
// @access  Private/Student
exports.applyForJob = asyncHandler(async (req, res, next) => {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
        return next(new ErrorResponse('Student profile not found', 404));
    }

    // Check if already applied
    const alreadyApplied = student.applications.find(app => app.job.toString() === req.params.jobId);
    if (alreadyApplied) {
        return next(new ErrorResponse('Already applied for this job', 400));
    }

    student.applications.push({ job: req.params.jobId });
    await student.save();

    res.status(200).json({ success: true, message: 'Applied successfully' });
});

// @desc    Upload resume
// @route   PUT /api/v1/students/resume
// @access  Private/Student
exports.uploadResume = asyncHandler(async (req, res, next) => {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
        return next(new ErrorResponse('Student profile not found', 404));
    }

    if (!req.files) {
        return next(new ErrorResponse('Please upload a file', 400));
    }

    const file = req.files.resume;

    // Make sure the image is a pdf
    if (file.mimetype !== 'application/pdf') {
        return next(new ErrorResponse('Please upload a PDF file', 400));
    }

    // Check filesize
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return next(new ErrorResponse('Please upload a file less than 5MB', 400));
    }

    // Create custom filename
    file.name = `resume_${student._id}${path.parse(file.name).ext}`;

    file.mv(`./public/uploads/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse('Problem with file upload', 500));
        }

        try {
            await Student.findOneAndUpdate({ user: req.user.id }, { resume: file.name });

            res.status(200).json({
                success: true,
                data: file.name
            });
        } catch (dbErr) {
            next(dbErr);
        }
    });
});

// @desc    Update application status
// @route   PUT /api/v1/students/application/:jobId/:studentId
// @access  Private/Company/Admin
exports.updateApplicationStatus = asyncHandler(async (req, res, next) => {
    const { jobId, studentId } = req.params;
    const { status } = req.body;

    const student = await Student.findById(studentId);

    if (!student) {
        return next(new ErrorResponse('Student not found', 404));
    }

    const application = student.applications.find(app => app.job.toString() === jobId);

    if (!application) {
        return next(new ErrorResponse('Application not found', 404));
    }

    // Authorization check: User must be the job's company or admin
    const Job = require('../models/Job'); // Import Job model if not already at top
    const job = await Job.findById(jobId);

    if (!job) {
        return next(new ErrorResponse('Job not found', 404));
    }

    if (job.company.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to update this application', 401));
    }

    application.status = status;
    await student.save();

    // Send notification email
    try {
        const user = await User.findById(student.user);
        if (user) {
            await sendEmail({
                email: user.email,
                subject: `Application Status Updated: ${job.title}`,
                message: `Hello ${user.name},\n\nThe status of your application for "${job.title}" has been updated to: ${status.toUpperCase()}.\n\nLog in to your dashboard for more details.`
            });
        }
    } catch (err) {
        console.error('Notification email could not be sent');
    }

    res.status(200).json({
        success: true,
        message: 'Application status updated',
        data: application
    });
});

// @desc    Get all students
// @route   GET /api/v1/students
// @access  Private/Admin
exports.getAllStudents = asyncHandler(async (req, res, next) => {
    const students = await Student.find().populate('user', 'name email role');

    res.status(200).json({
        success: true,
        count: students.length,
        data: students
    });
});
