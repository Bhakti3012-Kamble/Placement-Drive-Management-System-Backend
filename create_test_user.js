const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config({ path: './.env' });

const createTestUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = 'test@pms.com';
        const password = 'password123';

        // Check if exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('Test user already exists. Removing...');
            // Determine if using deleteOne (Mongoose 5/6) or remove (older)
            // Using deleteOne is safer
            await User.deleteOne({ _id: user._id });
        }

        user = await User.create({
            name: 'Test Student',
            email,
            password, // This will trigger pre-save hook to hash
            role: 'student'
        });

        console.log(`Test user created: ${email} / ${password}`);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

createTestUser();
