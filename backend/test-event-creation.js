import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

async function testEventCreation() {
    console.log('=== TESTING EVENT CREATION WITH FORM STORAGE ===');
    
    const eventData = {
        eventName: 'Test Event - ' + new Date().toISOString(),
        dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        location: 'Test Location',
        eventType: 'conference',
        description: 'This is a test event to verify form storage',
        organizerEmail: 'test@example.com',
        autoCreateForm: true
    };
    
    console.log('Event Data:', JSON.stringify(eventData, null, 2));
    
    try {
        console.log('Creating event...');
        const response = await axios.post(`${API_BASE_URL}/api/event/add`, eventData, {
            headers: {
                'Content-Type': 'application/json'
            },
            // Note: This requires authentication, but for testing we'll see what happens
        });
        
        console.log('=== EVENT CREATION RESPONSE ===');
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        const createdEvent = response.data.event;
        if (createdEvent) {
            console.log('=== FORM STORAGE CHECK ===');
            console.log('Registration Form URL:', createdEvent.registrationFormUrl || 'NOT SET');
            console.log('Edit Form URL:', createdEvent.registrationFormEditUrl || 'NOT SET');
            
            if (createdEvent.registrationFormUrl) {
                console.log('✅ SUCCESS: Forms stored correctly!');
            } else {
                console.log('❌ FAILURE: Forms not stored');
            }
        }
        
    } catch (error) {
        console.error('=== EVENT CREATION ERROR ===');
        console.error('Error status:', error.response?.status);
        console.error('Error message:', error.response?.data?.message);
        console.error('Full error:', error.message);
    }
}

testEventCreation().then(() => {
    console.log('Test completed');
    process.exit(0);
}).catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
});