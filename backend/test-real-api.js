import axios from 'axios';

async function testRealGoogleFormAPI() {
    console.log('=== TESTING REAL GOOGLE FORM API ===');
    console.log('Testing SmythOS API integration with database storage...\n');
    
    try {
        // Test data for form creation
        const testFormData = {
            formTitle: 'Test Event Registration - ' + new Date().toISOString().split('T')[0],
            formDescription: 'This is a test form to verify SmythOS API integration',
            editorEmail: 'test@example.com'
        };

        console.log('1. Testing direct Google Form creation...');
        console.log('Form Data:', JSON.stringify(testFormData, null, 2));
        
        const formResponse = await axios.post('http://localhost:8000/api/events/generate-google-form', testFormData, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 60000 // 60 seconds for real API
        });
        
        console.log('\n✅ FORM CREATION SUCCESS:');
        console.log('Status:', formResponse.status);
        console.log('Response:', JSON.stringify(formResponse.data, null, 2));
        
        // Check if we got valid form URLs
        if (formResponse.data.success && formResponse.data.data && formResponse.data.data.formUrl) {
            console.log('\n📋 FORM DETAILS:');
            console.log('Form URL:', formResponse.data.data.formUrl);
            console.log('Edit URL:', formResponse.data.data.editFormUrl);
            console.log('Form ID:', formResponse.data.data.formId);
            
            // Now test event creation with form
            console.log('\n2. Testing event creation with automatic form generation...');
            
            const eventData = {
                eventName: 'SmythOS Integration Test Event',
                dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                location: 'Test Location',
                eventType: 'Conference',
                description: 'Testing SmythOS integration with event creation and database storage',
                autoCreateForm: true,
                organizerEmail: 'organizer@test.com'
            };
            
            const eventResponse = await axios.post('http://localhost:8000/api/events/add', eventData, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer test-token' // You might need a real token
                },
                timeout: 60000
            });
            
            console.log('\n✅ EVENT CREATION SUCCESS:');
            console.log('Status:', eventResponse.status);
            console.log('Event ID:', eventResponse.data.event._id);
            console.log('Event Name:', eventResponse.data.event.eventName);
            console.log('Registration Form URL:', eventResponse.data.event.registrationFormUrl);
            console.log('Edit Form URL:', eventResponse.data.event.registrationFormEditUrl);
            console.log('Form Generation Result:', JSON.stringify(eventResponse.data.formGeneration, null, 2));
            
            if (eventResponse.data.event.registrationFormUrl) {
                console.log('\n🎉 SUCCESS: Form URLs stored in database!');
                console.log('The SmythOS API is working and forms are being saved to events.');
            } else {
                console.log('\n⚠️  WARNING: Event created but no form URLs stored in database.');
            }
            
        } else {
            console.log('\n❌ No valid form URL returned from SmythOS API');
            console.log('This might indicate an issue with the SmythOS service');
        }
        
    } catch (error) {
        console.error('\n❌ ERROR TESTING GOOGLE FORM API:');
        console.error('Error Type:', error.constructor.name);
        console.error('Error Message:', error.message);
        
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.error('No response received - network error');
        }
        
        if (error.code === 'ECONNABORTED') {
            console.error('Request timed out - SmythOS API may be slow or unavailable');
        }
        
        console.log('\n🔄 Falling back to test mock service...');
        
        // Test with mock service by changing environment
        try {
            console.log('Testing mock service as fallback...');
            
            const mockTestData = {
                ...testFormData,
                formTitle: testFormData.formTitle + ' (Mock Test)'
            };
            
            // This should use mock service if SmythOS fails
            const mockResponse = await axios.post('http://localhost:8000/api/events/generate-google-form', mockTestData, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            });
            
            console.log('Mock service response:', JSON.stringify(mockResponse.data, null, 2));
            
            if (mockResponse.data.isMock) {
                console.log('✅ Mock service is working as fallback');
            }
            
        } catch (mockError) {
            console.error('❌ Mock service also failed:', mockError.message);
            if (mockError.response) {
                console.error('Mock error response:', mockError.response.data);
            }
        }
    }
}

// Run the test
testRealGoogleFormAPI().then(() => {
    console.log('\n=== TEST COMPLETED ===');
    process.exit(0);
}).catch(err => {
    console.error('Test script error:', err);
    process.exit(1);
});