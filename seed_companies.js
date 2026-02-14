const mongoose = require('mongoose');
const Company = require('./models/Company');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedCompanies = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pdms_db');
        console.log('Connected to MongoDB...');

        // Clear existing company data
        await Company.deleteMany({});
        console.log('Cleared existing company data...');

        // Find or create company users
        let techCorpUser = await User.findOne({ email: 'hr@techcorp.com' });
        let finStreamUser = await User.findOne({ email: 'careers@finstream.com' });

        // Create users if they don't exist
        if (!techCorpUser) {
            techCorpUser = await User.create({
                name: 'TechCorp Solutions',
                email: 'hr@techcorp.com',
                password: 'password123',
                role: 'company'
            });
            console.log('TechCorp user created');
        }

        if (!finStreamUser) {
            finStreamUser = await User.create({
                name: 'FinStream Global',
                email: 'careers@finstream.com',
                password: 'password123',
                role: 'company'
            });
            console.log('FinStream user created');
        }

        // Create Companies
        const companies = [
            {
                name: 'TechCorp Solutions',
                email: 'hr@techcorp.com',
                website: 'https://www.techcorp.com',
                description: 'TechCorp Solutions is a leading software development company specializing in cutting-edge web and mobile applications. We work with Fortune 500 clients to deliver innovative digital solutions.',
                industry: 'IT/Software',
                location: {
                    address: '123 Tech Park, Whitefield',
                    city: 'Bangalore',
                    state: 'Karnataka',
                    country: 'India',
                    pincode: '560066'
                },
                contactPerson: {
                    name: 'Rajesh Kumar',
                    designation: 'HR Manager',
                    phone: '9876543210',
                    email: 'rajesh.kumar@techcorp.com'
                },
                companySize: '501-1000',
                foundedYear: 2010,
                linkedUser: techCorpUser._id,
                isVerified: true,
                verifiedAt: new Date(),
                status: 'active',
                socialLinks: {
                    linkedin: 'https://linkedin.com/company/techcorp',
                    twitter: 'https://twitter.com/techcorp',
                    facebook: 'https://facebook.com/techcorp'
                },
                benefits: [
                    'Health Insurance',
                    'Flexible Work Hours',
                    'Remote Work Options',
                    'Learning & Development Budget',
                    'Gym Membership'
                ],
                tags: ['Software', 'Web Development', 'Mobile Apps', 'Cloud Computing']
            },
            {
                name: 'FinStream Global',
                email: 'careers@finstream.com',
                website: 'https://www.finstream.com',
                description: 'FinStream Global is a premier financial services company providing innovative fintech solutions. We specialize in digital banking, payment systems, and financial analytics.',
                industry: 'Finance',
                location: {
                    address: '45 BKC, Bandra Kurla Complex',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    country: 'India',
                    pincode: '400051'
                },
                contactPerson: {
                    name: 'Priya Sharma',
                    designation: 'Talent Acquisition Lead',
                    phone: '9123456789',
                    email: 'priya.sharma@finstream.com'
                },
                companySize: '201-500',
                foundedYear: 2015,
                linkedUser: finStreamUser._id,
                isVerified: true,
                verifiedAt: new Date(),
                status: 'active',
                socialLinks: {
                    linkedin: 'https://linkedin.com/company/finstream',
                    twitter: 'https://twitter.com/finstream'
                },
                benefits: [
                    'Competitive Salary',
                    'Performance Bonuses',
                    'Health & Life Insurance',
                    'Stock Options',
                    'Professional Certifications'
                ],
                tags: ['FinTech', 'Banking', 'Payments', 'Analytics']
            },
            {
                name: 'InnovateTech Labs',
                email: 'hr@innovatetech.com',
                website: 'https://www.innovatetech.com',
                description: 'InnovateTech Labs is an AI and Machine Learning research company focused on developing next-generation intelligent systems for healthcare and education sectors.',
                industry: 'IT/Software',
                location: {
                    address: '78 Cyber City, Hitech City',
                    city: 'Hyderabad',
                    state: 'Telangana',
                    country: 'India',
                    pincode: '500081'
                },
                contactPerson: {
                    name: 'Amit Patel',
                    designation: 'Chief People Officer',
                    phone: '9988776655',
                    email: 'amit.patel@innovatetech.com'
                },
                companySize: '51-200',
                foundedYear: 2018,
                isVerified: true,
                verifiedAt: new Date(),
                status: 'active',
                socialLinks: {
                    linkedin: 'https://linkedin.com/company/innovatetech'
                },
                benefits: [
                    'Research Budget',
                    'Conference Sponsorship',
                    'Flexible Hours',
                    'Health Insurance',
                    'Relocation Assistance'
                ],
                tags: ['AI', 'Machine Learning', 'Research', 'Healthcare Tech']
            },
            {
                name: 'GreenEnergy Solutions',
                email: 'careers@greenenergy.com',
                website: 'https://www.greenenergy.com',
                description: 'GreenEnergy Solutions is committed to sustainable energy solutions. We develop solar and wind energy projects across India, contributing to a greener future.',
                industry: 'Other',
                location: {
                    address: '12 Industrial Area, Phase 2',
                    city: 'Pune',
                    state: 'Maharashtra',
                    country: 'India',
                    pincode: '411019'
                },
                contactPerson: {
                    name: 'Sneha Desai',
                    designation: 'Recruitment Manager',
                    phone: '9876512345',
                    email: 'sneha.desai@greenenergy.com'
                },
                companySize: '1-50',
                foundedYear: 2020,
                isVerified: false,
                status: 'active',
                benefits: [
                    'Environmental Impact',
                    'Health Insurance',
                    'Work-Life Balance',
                    'Team Outings'
                ],
                tags: ['Renewable Energy', 'Solar', 'Wind Energy', 'Sustainability']
            },
            {
                name: 'HealthPlus Diagnostics',
                email: 'hr@healthplus.com',
                website: 'https://www.healthplus.com',
                description: 'HealthPlus Diagnostics is a leading healthcare diagnostics company providing advanced medical testing and health screening services across major cities in India.',
                industry: 'Healthcare',
                location: {
                    address: '56 Medical District, Sector 18',
                    city: 'Gurgaon',
                    state: 'Haryana',
                    country: 'India',
                    pincode: '122015'
                },
                contactPerson: {
                    name: 'Dr. Vikram Singh',
                    designation: 'HR Director',
                    phone: '9765432109',
                    email: 'vikram.singh@healthplus.com'
                },
                companySize: '201-500',
                foundedYear: 2012,
                isVerified: true,
                verifiedAt: new Date(),
                status: 'active',
                socialLinks: {
                    linkedin: 'https://linkedin.com/company/healthplus',
                    facebook: 'https://facebook.com/healthplus'
                },
                benefits: [
                    'Medical Benefits',
                    'Life Insurance',
                    'Paid Time Off',
                    'Employee Wellness Programs',
                    'Training & Development'
                ],
                tags: ['Healthcare', 'Diagnostics', 'Medical Testing', 'Health Screening']
            }
        ];

        await Company.insertMany(companies);
        console.log(`${companies.length} companies seeded successfully!`);

        // Display the companies
        const allCompanies = await Company.find({});
        console.log('\n=== Companies in Database ===');
        allCompanies.forEach(company => {
            console.log(`- ${company.name} (${company.industry}) - ${company.location.city}`);
        });

        process.exit();
    } catch (err) {
        console.error('Error seeding companies:', err);
        process.exit(1);
    }
};

seedCompanies();
