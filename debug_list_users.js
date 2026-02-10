const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: './.env' });

const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    role: String
});

const User = mongoose.model('User', UserSchema);

const listUsers = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const users = await User.find({});
        console.log('Users in database:');
        if (users.length === 0) {
            console.log('No users found.');
        } else {
            users.forEach(user => {
                console.log(`- ${user.name} (${user.email}) [${user.role}]`);
            });
        }

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

listUsers();
