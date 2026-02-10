const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student'); // Assuming Student model exists to clean up profile too

dotenv.config({ path: './.env' });

const deleteUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const email = 'bhakti.kamble1209@gmail.com';

        const user = await User.findOne({ email });

        if (!user) {
            console.log(`User with email ${email} not found.`);
        } else {
            // Delete associated student profile first
            const student = await Student.findOne({ user: user._id });
            if (student) {
                await Student.deleteOne({ _id: student._id });
                console.log(`Student profile for ${email} deleted.`);
            }

            await User.deleteOne({ _id: user._id });
            console.log(`User ${email} deleted successfully.`);
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

deleteUser();
