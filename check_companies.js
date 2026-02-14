const mongoose = require('mongoose');
const Company = require('./models/Company');
const dotenv = require('dotenv');

dotenv.config();

const checkCompanies = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pdms_db');
        console.log('Connected to MongoDB...\n');

        const companies = await Company.find({});

        console.log(`=== Total Companies: ${companies.length} ===\n`);

        if (companies.length === 0) {
            console.log('No companies found in database.');
        } else {
            companies.forEach((company, index) => {
                console.log(`${index + 1}. ${company.name}`);
                console.log(`   Industry: ${company.industry}`);
                console.log(`   Location: ${company.location.city}, ${company.location.state}`);
                console.log(`   Email: ${company.email}`);
                console.log(`   Status: ${company.status}`);
                console.log(`   Verified: ${company.isVerified}`);
                console.log('');
            });
        }

        process.exit();
    } catch (err) {
        console.error('Error checking companies:', err);
        process.exit(1);
    }
};

checkCompanies();
