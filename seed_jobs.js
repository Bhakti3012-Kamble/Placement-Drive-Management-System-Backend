const mongoose = require('mongoose');
const User = require('./models/User');
const Job = require('./models/Job');
const dotenv = require('dotenv');

dotenv.config();

const seedJobs = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pdms_db');
        console.log('Connected to MongoDB...');

        // Clear existing data to avoid unique email conflicts
        await User.deleteMany({ email: { $in: ['hr@techcorp.com', 'careers@finstream.com'] } });
        await Job.deleteMany({});
        console.log('Cleared existing test data...');
        const recruiter = await User.create({
            name: 'TechCorp Solutions',
            email: 'hr@techcorp.com',
            password: 'password123',
            role: 'company'
        });
        console.log('Recruiter created:', recruiter.email);

        const recruiter2 = await User.create({
            name: 'FinStream Global',
            email: 'careers@finstream.com',
            password: 'password123',
            role: 'company'
        });
        console.log('Recruiter 2 created:', recruiter2.email);

        // 2. Create Jobs
        const jobs = [
            {
                title: 'Software Engineer - Frontend',
                description: 'We are looking for a React developer with a passion for UI/UX.',
                company: recruiter._id,
                industry: 'Software & IT',
                location: 'Bangalore',
                type: 'Full-time',
                ctc: 12,
                minCgpa: 8.0,
                deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
                status: 'open'
            },
            {
                title: 'Backend Developer Intern',
                description: 'Expertise in Node.js and MongoDB required for this 6 month internship.',
                company: recruiter._id,
                industry: 'Software & IT',
                location: 'Remote',
                type: 'Internship',
                ctc: 3, // Repesents 3 LPA equivalent or stipend
                minCgpa: 7.5,
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                status: 'open'
            },
            {
                title: 'Data Analyst',
                description: 'Looking for analysts comfortable with SQL and Python.',
                company: recruiter2._id,
                industry: 'FinTech',
                location: 'Mumbai',
                type: 'Full-time',
                ctc: 9,
                minCgpa: 7.0,
                deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
                status: 'open'
            },
            {
                title: 'Product Designer',
                description: 'Join our design team to create beautiful workflows.',
                company: recruiter2._id,
                industry: 'Consulting',
                location: 'Pune',
                type: 'Full-time',
                ctc: 15,
                minCgpa: 6.5,
                deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
                status: 'open'
            }
        ];

        await Job.insertMany(jobs);
        console.log(`${jobs.length} jobs seeded successfully!`);

        process.exit();
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seedJobs();
