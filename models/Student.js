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
    skills: [String],
    resume: {
        type: String,
        default: 'no-resume.pdf'
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
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Student', StudentSchema);
