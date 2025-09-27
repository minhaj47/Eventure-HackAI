import MockGoogleFormService from './services/mockGoogleFormService.js';

async function testMockService() {
    console.log('Testing Mock Google Form Service...');
    
    const mockService = new MockGoogleFormService();
    
    try {
        // Test basic form creation
        console.log('\n1. Testing basic form creation...');
        const basicForm = await mockService.createGoogleForm({
            formTitle: "Test Event Registration",
            formDescription: "This is a test form",
            editorEmail: "test@example.com"
        });
        
        console.log('✅ Basic form creation result:', {
            success: basicForm.success,
            formUrl: basicForm.data?.formUrl,
            editUrl: basicForm.data?.editFormUrl,
            isMock: basicForm.isMock
        });
        
        // Test event registration form
        console.log('\n2. Testing event registration form...');
        const eventForm = await mockService.createEventRegistrationForm({
            title: "AI Conference 2025",
            description: "Annual AI conference with workshops and networking",
            organizerEmail: "organizer@conference.com"
        });
        
        console.log('✅ Event registration form result:', {
            success: eventForm.success,
            formUrl: eventForm.data?.formUrl,
            editUrl: eventForm.data?.editFormUrl,
            isMock: eventForm.isMock
        });
        
        // Test validation
        console.log('\n3. Testing configuration validation...');
        const validation = mockService.validateConfiguration();
        console.log('✅ Validation result:', validation);
        
        console.log('\n🎉 All mock service tests passed!');
        
    } catch (error) {
        console.error('❌ Mock service test failed:', error);
    }
}

testMockService();