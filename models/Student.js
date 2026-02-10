const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    rollNo: {
        type: String,
        required: [true, 'Please add a roll number'],
        unique: true
    },
    branch: {
        type: String,
        required: [true, 'Please add a branch']
    },
    cgpa: {
        type: Number,
        required: [true, 'Please add CGPA']
    },
    university: {
        type: String,
        required: [true, 'Please add a university']
    },
    graduationYear: {
        type: Number,
        required: [true, 'Please add a graduation year']
    },
    semester: {
        type: Number,
        required: [true, 'Please add a semester']
    },
    phone: String,
    dob: Date,
    skills: [String],
    resume: {
        type: String,
        default: 'no-resume.pdf'
    },
    profilePic: {
        type: String,
        default: 'no-photo.jpg'
    },
    transcript: {
        type: String,
        default: 'no-transcript.pdf'
    },
    applications: [
        {
            job: {
                type: mongoose.Schema.ObjectId,
                ref: 'Job'
            },
            status: {
                type: String,
                enum: ['applied', 'shortlisted', 'accepted', 'rejected'],
                default: 'applied'
            },
            appliedAt: {
                type: Date,
                default: Date.now
            },
            interviewDate: {
                type: Date
            },
            interviewRound: {
                type: String
            }
        }
    ],
    notificationPreferences: {
        jobDrives: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false },
            inApp: { type: Boolean, default: true }
        },
        statusChanges: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true }
        },
        interviewReminders: {
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: true },
            inApp: { type: Boolean, default: true }
        }
    },
    privacySettings: {
        visibleToRecruiters: { type: Boolean, default: true },
        showPlacementStatus: { type: Boolean, default: false }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Student', StudentSchema);
