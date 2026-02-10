const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const Job = require('./models/Job');

dotenv.config({ path: './.env' });

const scheduleInterview = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Find a student
        const student = await Student.findOne().populate('user');
        if (!student) {
            console.log('No students found to schedule interview for.');
            process.exit(0);
        }

        console.log(`Scheduling interview for student: ${student.user.name}`);

        // Find a job or ensure student has an application
        let job = await Job.findOne();
        if (!job) {
            console.log('No jobs found. Creating a dummy company and job...');

            // Create dummy company
            let company = await User.findOne({ email: 'company@test.com' });
            if (!company) {
                company = await User.create({
                    name: 'Test Company',
                    email: 'company@test.com',
                    password: 'password123',
                    role: 'company'
                });
            }

            // Create dummy job
            job = await Job.create({
                title: 'Software Engineer Intern',
                description: 'Great opportunity',
                company: company._id,
                requirements: ['React', 'Node.js'],
                location: 'Remote',
                salary: '12 LPA',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            });
            console.log('Dummy job created.');
        }

        // Check if student has applied to this job, if not apply
        let application = student.applications.find(app => app.job.toString() === job._id.toString());
        if (!application) {
            console.log(`Applying student to job: ${job.title}`);
            student.applications.push({
                job: job._id,
                status: 'shortlisted',
                appliedAt: new Date(),
                interviewDate: new Date(Date.now() + 86400000), // Tomorrow
                interviewRound: 'Technical Round 1'
            });
        } else {
            console.log(`Updating existing application for job: ${job.title}`);
            application.status = 'shortlisted';
            application.interviewDate = new Date(Date.now() + 86400000); // Tomorrow
            application.interviewRound = 'Technical Round 1';
        }

        await student.save();
        console.log('Interview scheduled successfully!');
        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

scheduleInterview();
