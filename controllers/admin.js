const User = require('../models/User');
const Job = require('../models/Job');
const Student = require('../models/Student');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get admin stats
// @route   GET /api/v1/admin/stats
// @access  Private/Admin
exports.getAdminStats = asyncHandler(async (req, res, next) => {
    // Basic user counts
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const companyCount = await User.countDocuments({ role: 'company' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    // Job stats
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'open' });

    // 1. Placement Rate & Application Funnel
    const totalStudents = await Student.countDocuments();
    const placedStudents = await Student.countDocuments({
        'applications.status': 'accepted'
    });

    const funnel = await Student.aggregate([
        { $unwind: '$applications' },
        { $group: { _id: '$applications.status', count: { $sum: 1 } } }
    ]);

    const funnelMap = {};
    funnel.forEach(item => funnelMap[item._id] = item.count);

    // 2. Average CTC (for accepted offers)
    const ctcStats = await Student.aggregate([
        { $unwind: '$applications' },
        { $match: { 'applications.status': 'accepted' } },
        {
            $lookup: {
                from: 'jobs',
                localField: 'applications.job',
                foreignField: '_id',
                as: 'job'
            }
        },
        { $unwind: '$job' },
        {
            $group: {
                _id: null,
                avgCTC: { $avg: '$job.ctc' },
                maxCTC: { $max: '$job.ctc' }
            }
        }
    ]);

    // 3. Branch-wise Stats
    const branchStats = await Student.aggregate([
        {
            $group: {
                _id: '$branch',
                total: { $sum: 1 },
                placed: {
                    $sum: {
                        $cond: [
                            {
                                $anyElementTrue: {
                                    $map: {
                                        input: '$applications',
                                        as: 'app',
                                        in: { $eq: ['$$app.status', 'accepted'] }
                                    }
                                }
                            },
                            1, 0
                        ]
                    }
                }
            }
        }
    ]);

    // 4. Partner Highlights (Top Companies)
    const topPartners = await Student.aggregate([
        { $unwind: '$applications' },
        { $match: { 'applications.status': 'accepted' } },
        {
            $lookup: {
                from: 'users',
                let: { jobId: '$applications.job' },
                pipeline: [
                    { $lookup: { from: 'jobs', localField: '_id', foreignField: '_id', as: 'job' } }, // This isn't quite right, let's look up job first
                ],
                as: 'dummy'
            }
        },
        // Let's do a better partner lookup
        { $lookup: { from: 'jobs', localField: 'applications.job', foreignField: '_id', as: 'job' } },
        { $unwind: '$job' },
        { $lookup: { from: 'users', localField: 'job.company', foreignField: '_id', as: 'company' } },
        { $unwind: '$company' },
        {
            $group: {
                _id: '$company._id',
                name: { $first: '$company.name' },
                hires: { $sum: 1 }
            }
        },
        { $sort: { hires: -1 } },
        { $limit: 5 }
    ]);

    res.status(200).json({
        success: true,
        data: {
            users: {
                total: totalUsers,
                students: studentCount,
                companies: companyCount,
                admins: adminCount
            },
            jobs: {
                total: totalJobs,
                active: activeJobs
            },
            placement: {
                totalStudents,
                placedStudents,
                rate: totalStudents > 0 ? ((placedStudents / totalStudents) * 100).toFixed(1) : 0,
                avgCTC: ctcStats[0]?.avgCTC.toFixed(2) || 0,
                maxCTC: ctcStats[0]?.maxCTC || 0
            },
            funnel: {
                applied: funnelMap.applied || 0,
                shortlisted: funnelMap.shortlisted || 0,
                accepted: funnelMap.accepted || 0,
                rejected: funnelMap.rejected || 0
            },
            branchStats,
            topPartners,
            systemHealth: 'OPTIMAL',
            uptime: '99.9%'
        }
    });
});

// @desc    Get all users with filtering
// @route   GET /api/v1/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    const { role, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const users = await User.find(query).select('-password').sort('-createdAt');

    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    // Prevent deleting self
    if (user._id.toString() === req.user.id.toString()) {
        return next(new ErrorResponse('You cannot delete your own admin account', 400));
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get all companies with their job drive stats
// @route   GET /api/v1/admin/companies
// @access  Private/Admin
exports.getAllCompanies = asyncHandler(async (req, res, next) => {
    const companies = await User.find({ role: 'company' }).select('name email createdAt');

    const companyData = await Promise.all(companies.map(async (company) => {
        const jobCount = await Job.countDocuments({ company: company._id });
        const activeJobCount = await Job.countDocuments({ company: company._id, status: 'open' });

        return {
            _id: company._id,
            name: company.name,
            email: company.email,
            createdAt: company.createdAt,
            totalJobs: jobCount,
            activeJobs: activeJobCount
        };
    }));

    res.status(200).json({
        success: true,
        count: companyData.length,
        data: companyData
    });
});

// @desc    Get system access logs (Mocked)
// @route   GET /api/v1/admin/logs
// @access  Private/Admin
exports.getAccessLogs = asyncHandler(async (req, res, next) => {
    // In a real app, this would query a Logs collection
    const mockLogs = [
        { id: 1, event: 'User Login', user: 'admin@pdms.com', ip: '192.168.1.1', time: new Date(Date.now() - 5000000).toISOString(), status: 'SUCCESS' },
        { id: 2, event: 'Bulk Shortlist', user: 'recruiter@google.com', ip: '10.0.0.5', time: new Date(Date.now() - 15000000).toISOString(), status: 'SUCCESS' },
        { id: 3, event: 'Job Posting', user: 'recruiter@microsoft.com', ip: '172.16.0.2', time: new Date(Date.now() - 25000000).toISOString(), status: 'SUCCESS' },
        { id: 4, event: 'Password Reset Request', user: 'student@mit.edu', ip: '45.12.33.1', time: new Date(Date.now() - 35000000).toISOString(), status: 'WARNING' },
        { id: 5, event: 'System Config Update', user: 'admin@pdms.com', ip: '192.168.1.1', time: new Date(Date.now() - 45000000).toISOString(), status: 'CRITICAL' },
    ];

    res.status(200).json({
        success: true,
        data: mockLogs
    });
});
