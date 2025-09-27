import axios from 'axios';

async function testSmythosConnection() {
    const endpoint = 'https://cmfw5qbmfxvnkjxgtpjoabofw.agent.a.smyth.ai/api/generate_google_form';
    
    console.log('Testing SmythOS API connection...');
    console.log('Endpoint:', endpoint);
    
    const testPayload = {
        formTitle: "Test Connection Form",
        formDescription: "Testing API connectivity"
    };
    
    try {
        console.log('Sending test request...');
        const startTime = Date.now();
        
        const response = await axios.post(endpoint, testPayload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 120000, // 2 minutes
            validateStatus: function (status) {
                return status >= 200 && status < 300;
            }
        });
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log('✅ SUCCESS!');
        console.log('Response time:', duration + 'ms');
        console.log('Response status:', response.status);
        console.log('Response data preview:', JSON.stringify(response.data).substring(0, 200) + '...');
        
        // Parse the response to see if it contains valid form data
        if (Array.isArray(response.data)) {
            const apiOutput = response.data.find(item => item.name === 'APIOutput');
            if (apiOutput?.result?.Output?.formDetails) {
                const formDetails = apiOutput.result.Output.formDetails;
                console.log('📋 Form Details Found:');
                console.log('- Form Title:', formDetails.formTitle);
                console.log('- Form URL:', formDetails.formUrl ? '✅ Present' : '❌ Missing');
                console.log('- Edit URL:', formDetails.editFormUrl ? '✅ Present' : '❌ Missing');
            }
        }
        
    } catch (error) {
        console.log('❌ FAILED!');
        console.log('Error type:', error.constructor.name);
        console.log('Error code:', error.code);
        console.log('Error message:', error.message);
        
        if (error.code === 'ETIMEDOUT') {
            console.log('🔄 Suggestion: The API is taking longer than 2 minutes. This might be normal for the first request.');
        } else if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
            console.log('🌐 Suggestion: Check internet connection or try again later.');
        }
    }
}

// Run the test
testSmythosConnection();