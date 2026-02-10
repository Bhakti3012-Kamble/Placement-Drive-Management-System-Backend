const http = require('http');

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/auth/cleanup/users',
    method: 'GET'
};

const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.success) {
                console.log('User Emails:');
                json.data.forEach(u => console.log(u.email));
            } else {
                console.log('Error:', json);
            }
        } catch (e) {
            console.log('Raw data:', data);
        }
    });
});

req.end();
