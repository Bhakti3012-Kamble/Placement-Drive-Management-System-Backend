const mongoose = require('mongoose');
const User = require('./models/User');
const Student = require('./models/Student');
const Job = require('./models/Job');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const runverification = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
 
        // 1. Setup Data
        const companyEmail = 'testcomp@example.com';
        const studentEmail = 'teststud@example.com';

        // Cleanup
        await User.deleteMany({ email: { $in: [companyEmail, studentEmail] } });
        await Job.deleteMany({ title: 'Test Job Verification' });
        // Clean up students associated with the test user (need to find user id first if I didn't just delete them, but since I deleted users, I should delete orphan students or just rely on cascade if it existed, but here I'll just clean up by email query if possible or just skip strict cleanup for now as IDs changed)
        // For simplicity, let's just proceed.

        // 2. Create Company
        const company = await User.create({
            name: 'Test Company',
            email: companyEmail,
            password: 'password123',
            role: 'company'
        });
        console.log('1. Company Created:', company._id);

        // 3. Create Job
        const job = await Job.create({
            title: 'Test Job Verification',
            description: 'Test Description',
            company: company._id,
            industry: 'IT',
            location: 'Remote',
            ctc: 10,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });
        console.log('2. Job Created:', job._id);

        // 4. Create Student
        const studentUser = await User.create({
            name: 'Test Student',
            email: studentEmail,
            password: 'password123',
            role: 'student'
        });
        const studentProfile = await Student.create({
            user: studentUser._id,
            rollNo: 'TEST101',
            branch: 'CSE',
            cgpa: 8.5,
            university: 'Test Uni',
            graduationYear: 2024,
            semester: 8
        });
        console.log('3. Student Created:', studentProfile._id);

        // 5. Apply for Job (Simulate POST /api/v1/students/apply/:jobId)
        studentProfile.applications.push({ job: job._id });
        await studentProfile.save();
        console.log('4. Student Applied to Job');

        // 6. Recruiter Fetches Applications (Simulate GET /api/v1/jobs/:id/applications)
        // In controller: Student.find({ 'applications.job': req.params.id })
        const applicants = await Student.find({ 'applications.job': job._id });
        console.log(`5. Recruiter found ${applicants.length} applicants`);

        if (applicants.length === 0) throw new Error('No applicants found!');

        // 7. Update Status (Simulate PUT /api/v1/students/application/:jobId/:studentId)
        // Logic: application.status = status
        const app = studentProfile.applications.find(a => a.job.toString() === job._id.toString());
        app.status = 'shortlisted';
        await studentProfile.save();
        console.log('6. Status updated to Shortlisted');

        // Verify status
        const updatedStudent = await Student.findById(studentProfile._id);
        const updatedApp = updatedStudent.applications.find(a => a.job.toString() === job._id.toString());
        console.log('7. Verified Status in DB:', updatedApp.status);

        if (updatedApp.status !== 'shortlisted') throw new Error('Status update failed');

        console.log('SUCCESS: Recruiter Flow Verified!');
    } catch (err) {
        console.error('FAILED:', err);
    } finally {
        await mongoose.connection.close();
    }
};

runverification();
