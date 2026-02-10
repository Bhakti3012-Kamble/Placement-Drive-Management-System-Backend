const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');

const fs = require('fs');

const clearDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/pdms_db');
        console.log('MongoDB Connected');

        const userResult = await User.deleteMany({});
        console.log(`Deleted ${userResult.deletedCount} users.`);

        const studentResult = await Student.deleteMany({});
        console.log(`Deleted ${studentResult.deletedCount} student profiles.`);

        await mongoose.disconnect();
        console.log('Database cleared.');
        process.exit();
    } catch (err) {
        console.error('Error clearing DB:', err);
        fs.writeFileSync('db_error.log', err.stack || err.message);
        process.exit(1);
    }
};

clearDB();
