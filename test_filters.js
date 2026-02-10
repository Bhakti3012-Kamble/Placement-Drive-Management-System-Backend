const http = require('http');

const baseUrl = 'http://localhost:5000/api/v1/jobs';

const fetchUrl = (url) => {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', (err) => reject(err));
    });
};

const runTests = async () => {
    console.log('--- STARTING FILTER VERIFICATION TESTS ---');

    // 1. Test Search by Company Name (TechCorp)
    try {
        console.log('\nTesting Search (keyword: "TechCorp")...');
        const res = await fetchUrl(`${baseUrl}?search=TechCorp`);
        console.log(`- Result count: ${res.data.length}`);
        res.data.forEach(job => {
            console.log(`  - Job: ${job.title} | Company: ${job.company?.name}`);
        });
    } catch (err) {
        console.error('Search test failed:', err.message);
    }

    // 2. Test Industry Filter (FinTech)
    try {
        console.log('\nTesting Industry Filter (industry[in]=FinTech)...');
        const res = await fetchUrl(`${baseUrl}?industry[in]=FinTech`);
        console.log(`- Result count: ${res.data.length}`);
        res.data.forEach(job => {
            console.log(`  - Job: ${job.title} | Industry: ${job.industry}`);
        });
    } catch (err) {
        console.error('Industry test failed:', err.message);
    }

    // 3. Test CTC Filter (ctc[gte]=10)
    try {
        console.log('\nTesting CTC Filter (ctc[gte]=10)...');
        const res = await fetchUrl(`${baseUrl}?ctc[gte]=10`);
        console.log(`- Result count: ${res.data.length}`);
        res.data.forEach(job => {
            console.log(`  - Job: ${job.title} | CTC: ${job.ctc} LPA`);
        });
    } catch (err) {
        console.error('CTC test failed:', err.message);
    }

    console.log('\n--- VERIFICATION COMPLETE ---');
};

runTests();
