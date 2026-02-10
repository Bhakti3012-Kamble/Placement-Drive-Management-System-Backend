const path = require('path');
const Student = require('../models/Student');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Notification = require('../models/Notification');
const Job = require('../models/Job');

// @desc    Get current student profile
// @route   GET /api/v1/students/me
// @access  Private/Student
exports.getStudentProfile = asyncHandler(async (req, res, next) => {
    const student = await Student.findOne({ user: req.user.id })
        .populate('user', 'name email')
        .populate({
            path: 'applications.job',
            select: 'title company',
            populate: {
                path: 'company',
                select: 'name'
            }
        });

    if (!student) {
        return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({ success: true, data: student });
});

// @desc    Update student profile
// @route   PUT /api/v1/students/me
// @access  Private/Student
exports.updateStudentProfile = asyncHandler(async (req, res, next) => {
    let student = await Student.findOne({ user: req.user.id });

    // Fields allowed to be updated in Student model
    const studentFields = [
        'rollNo', 'branch', 'cgpa', 'university', 'graduationYear',
        'semester', 'phone', 'dob', 'skills', 'notificationPreferences', 'privacySettings'
    ];

    const studentUpdate = {};
    studentFields.forEach(field => {
        if (req.body[field] !== undefined) {
            studentUpdate[field] = req.body[field];
        }
    });

    if (!student) {
        // Create if not exists
        studentUpdate.user = req.user.id;
        student = await Student.create(studentUpdate);
    } else {
        student = await Student.findOneAndUpdate({ user: req.user.id }, studentUpdate, {
            new: true,
            runValidators: true
        });
    }

    // Update User name if provided
    if (req.body.name) {
        await User.findByIdAndUpdate(req.user.id, { name: req.body.name });
    }

    // Return populated student
    const updatedStudent = await Student.findById(student._id).populate('user', 'name email');

    res.status(200).json({ success: true, data: updatedStudent });
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

// @desc    Upload documents (resume, profilePic, transcript)
// @route   PUT /api/v1/students/documents
// @access  Private/Student
exports.uploadDocuments = asyncHandler(async (req, res, next) => {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
        return next(new ErrorResponse('Student profile not found', 404));
    }

    if (!req.files) {
        return next(new ErrorResponse('Please upload a file', 400));
    }

    const filesToUpload = ['resume', 'profilePic', 'transcript'];
    const uploadedFiles = {};
    const updates = {};

    for (const key of filesToUpload) {
        if (req.files[key]) {
            const file = req.files[key];

            // Validation
            if (key === 'profilePic') {
                if (!file.mimetype.startsWith('image')) {
                    return next(new ErrorResponse(`Please upload an image for ${key}`, 400));
                }
            } else {
                if (file.mimetype !== 'application/pdf') {
                    return next(new ErrorResponse(`Please upload a PDF for ${key}`, 400));
                }
            }

            if (file.size > 5 * 1024 * 1024) {
                return next(new ErrorResponse(`Please upload a file less than 5MB for ${key}`, 400));
            }

            // Create custom filename
            file.name = `${key}_${student._id}${path.parse(file.name).ext}`;

            // Move file
            await new Promise((resolve, reject) => {
                file.mv(`./public/uploads/${file.name}`, err => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            updates[key] = file.name;
            uploadedFiles[key] = file.name;
        }
    }

    if (Object.keys(updates).length === 0) {
        return next(new ErrorResponse('No valid files uploaded', 400));
    }

    const updatedStudent = await Student.findOneAndUpdate(
        { user: req.user.id },
        updates,
        { new: true, runValidators: true }
    );

    res.status(200).json({
        success: true,
        data: updatedStudent,
        files: uploadedFiles
    });
});

// @desc    Update application status
// @route   PUT /api/v1/students/application/:jobId/:studentId
// @access  Private/Company/Admin
exports.updateApplicationStatus = asyncHandler(async (req, res, next) => {
    const { jobId, studentId } = req.params;
    const { status, interviewDate, interviewRound } = req.body;

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
    if (interviewDate) application.interviewDate = interviewDate;
    if (interviewRound) application.interviewRound = interviewRound;
    await student.save();

    // Create in-app notification
    try {
        await Notification.create({
            recipient: student.user,
            title: `Application Status Updated: ${job.title}`,
            message: `The status of your application for "${job.title}" has been updated to ${status.toUpperCase()}.`,
            type: status === 'shortlisted' ? 'interview' : 'application',
            link: status === 'shortlisted' ? `/student/applications/offer/${jobId}` : '/student/applications'
        });
    } catch (err) {
        console.error('In-app notification could not be created');
    }

    // Send notification email
    try {
        const user = await User.findById(student.user);
        if (user) {
            let emailMessage = `Hello ${user.name},\n\nThe status of your application for "${job.title}" has been updated to: ${status.toUpperCase()}.`;

            if (interviewDate) {
                const date = new Date(interviewDate).toLocaleString();
                emailMessage += `\n\nInterview Scheduled:\nRound: ${interviewRound || 'General'}\nDate & Time: ${date}`;
            }

            emailMessage += `\n\nLog in to your dashboard for more details.`;

            await sendEmail({
                email: user.email,
                subject: `Application Status Updated: ${job.title}`,
                message: emailMessage
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

// @desc    Bulk update application status
// @route   PUT /api/v1/students/application/bulk
// @access  Private/Company/Admin
exports.bulkUpdateApplicationStatus = asyncHandler(async (req, res, next) => {
    const { studentIds, status, jobId } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || !jobId || !status) {
        return next(new ErrorResponse('Please provide studentIds, jobId, and status', 400));
    }

    const Job = require('../models/Job');
    const job = await Job.findById(jobId);

    if (!job) {
        return next(new ErrorResponse('Job not found', 404));
    }

    // Authorization check
    if (job.company.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized to update these applications', 401));
    }

    const results = [];

    for (const studentId of studentIds) {
        const student = await Student.findById(studentId);
        if (!student) continue;

        const application = student.applications.find(
            (app) => app.job.toString() === jobId
        );

        if (!application) continue;

        application.status = status;
        await student.save();

        // Create in-app notification
        try {
            const Notification = require('../models/Notification');
            await Notification.create({
                recipient: student.user,
                title: `Application Bulk Update: ${job.title}`,
                message: `Your application status for ${job.title} has been updated to: ${status}`,
                type: 'application',
                link: `/student/applications/${jobId}`
            });

            // Send email (optional: could be backgrounded if many students)
            const emailMessage = `Your application for ${job.title} at ${job.company.name} has been updated to: ${status}.\n\nLog in to the portal for more details.`;
            await sendEmail({
                email: student.user.email,
                subject: `Application Status Updated: ${job.title}`,
                message: emailMessage
            });
        } catch (err) {
            console.error(`Notification error for student ${studentId}:`, err.message);
        }

        results.push({ studentId, status: 'success' });
    }

    res.status(200).json({
        success: true,
        count: results.length,
        data: results
    });
});

// @desc    Student Accept/Decline Offer
// @route   PUT /api/v1/students/applications/:jobId/status
// @access  Private/Student
exports.studentUpdateApplicationStatus = asyncHandler(async (req, res, next) => {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
        return next(new ErrorResponse('Student profile not found', 404));
    }

    const application = student.applications.find(app => app.job.toString() === req.params.jobId);
    if (!application) {
        return next(new ErrorResponse('Application not found', 404));
    }

    // Students can only change status to accepted or rejected (declined) if currently shortlisted
    if (application.status !== 'shortlisted' && req.body.status !== 'accepted' && req.body.status !== 'rejected') {
        return next(new ErrorResponse('Invalid status transition', 400));
    }

    application.status = req.body.status;
    await student.save();

    res.status(200).json({
        success: true,
        message: `Application ${req.body.status} successfully`,
        data: application
    });
});

// @desc    Get all notifications for logged in student
// @route   GET /api/v1/students/notifications
// @access  Private/Student
exports.getNotifications = asyncHandler(async (req, res, next) => {
    const notifications = await Notification.find({ recipient: req.user.id }).sort('-createdAt');

    res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
    });
});

// @desc    Mark notification as read
// @route   PUT /api/v1/students/notifications/:id/read
// @access  Private/Student
exports.markNotificationRead = asyncHandler(async (req, res, next) => {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
        return next(new ErrorResponse('Notification not found', 404));
    }

    if (notification.recipient.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized', 401));
    }

    notification.read = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
});

// @desc    Delete notification
// @route   DELETE /api/v1/students/notifications/:id
// @access  Private/Student
exports.deleteNotification = asyncHandler(async (req, res, next) => {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
        return next(new ErrorResponse('Notification not found', 404));
    }

    if (notification.recipient.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized', 401));
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
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
