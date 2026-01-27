const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    requirements: {
        type: [String],
        required: [true, 'Please add requirements']
    },
    location: {
        type: String,
        required: [true, 'Please add a location']
    },
    salary: {
        type: String,
        required: [true, 'Please add salary package']
    },
    deadline: {
        type: Date,
        required: [true, 'Please add a deadline']
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', JobSchema);
