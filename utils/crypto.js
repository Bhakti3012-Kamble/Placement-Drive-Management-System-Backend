const crypto = require('crypto');

// Generate random token
exports.generateToken = () => {
    return crypto.randomBytes(20).toString('hex');
};

// Hash token
exports.hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};
