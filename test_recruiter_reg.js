const axios = require('axios');

const testRegistration = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/v1/auth/register', {
            name: 'Test Recruiter',
            email: 'recruiter_test_' + Date.now() + '@company.com',
            password: 'password123',
            role: 'company'
        });
        console.log('Registration Success:', res.data);
    } catch (err) {
        console.log('Registration Failed:');
        if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.log('Error:', err.message);
        }
    }
};

testRegistration();
