import googleFormService from './services/googleFormService.js';

async function testSmythOS() {
    console.log('=== TESTING GOOGLE FORM SERVICE ===');
    
    try {
        const result = await googleFormService.createGoogleForm({
            formTitle: 'Test Form - ' + new Date().toISOString(),
            formDescription: 'This is a test form to check form service',
            editorEmail: 'test@example.com'
        });
        
        console.log('=== SERVICE RESULT ===');
        console.log('Success:', result.success);
        console.log('Message:', result.message);
        console.log('Data:', JSON.stringify(result.data, null, 2));
        
        if (result.success && result.data && result.data.formUrl) {
            console.log('✅ SUCCESS: Form URL found:', result.data.formUrl);
            console.log('✅ Edit URL found:', result.data.editFormUrl);
        } else {
            console.log('❌ FAILURE: No form URL in response');
        }
        
    } catch (error) {
        console.error('=== SERVICE ERROR ===');
        console.error('Error:', error);
    }
}

testSmythOS().then(() => {
    console.log('Test completed');
    process.exit(0);
}).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
});