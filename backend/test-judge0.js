const axios = require('axios');

async function testJudge0() {
    const options = {
        method: 'POST',
        url: 'https://ce.judge0.com/submissions/batch',
        params: {
            base64_encoded: 'false'
        },
        headers: {
            'Content-Type': 'application/json'
        },
        data: {
            submissions: [{
                language_id: 54,
                source_code: '#include <iostream>\nusing namespace std;\nint main() {\n  int a, b;\n  cin >> a >> b;\n  cout << a + b;\n  return 0;\n}',
                stdin: '2 3'
            }]
        }
    };

    try {
        console.log('Testing Judge0 API...');
        console.log('Request:', JSON.stringify(options.data, null, 2));
        const response = await axios.request(options);
        console.log('Success! Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response?.status, error.response?.statusText);
        console.error('Error details:', JSON.stringify(error.response?.data, null, 2));
    }
}

testJudge0();
