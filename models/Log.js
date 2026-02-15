const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
    user: {
        type: String, // Storing User ID or Email for reference
        required: true
    },
    action: {
        type: String, // e.g., 'LOGIN', 'DELETE_USER', 'VERIFY_COMPANY'
        required: true
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'WARNING', 'CRITICAL'],
        default: 'SUCCESS'
    },
    ip: {
        type: String
    },
    details: {
        type: Object // Flexible field for extra info
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Log', LogSchema);
