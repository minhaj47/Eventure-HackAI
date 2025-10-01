/**
 * Mock Google Form Service for development and testing
 * This provides simulated form creation when the external SmythOS API is unavailable
 */
class MockGoogleFormService {
    constructor() {
        this.mockDelay = 2000; // 2 second delay to simulate realistic API call
    }

    /**
     * Create a mock Google Form
     * @param {Object} formData - Form configuration data
     * @returns {Promise<Object>} Mock form creation response
     */
    async createGoogleForm(formData) {
        const { formTitle, formDescription, editorEmail, customFields } = formData;

        console.log('=== MOCK GOOGLE FORM CREATION START ===');
        console.log('Using mock service (SmythOS unavailable)');
        console.log('Form Title:', formTitle);
        if (customFields && customFields.length > 0) {
            console.log('Custom Fields:', customFields.length, 'fields provided');
            customFields.forEach((field, index) => {
                console.log(`  ${index + 1}. ${field.label} (${field.type})${field.required ? ' - Required' : ' - Optional'}`);
            });
        } else {
            console.log('Custom Fields: Using default form fields');
        }

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, this.mockDelay));

        // Generate mock form URLs
        const formId = 'mock_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const mockFormUrl = `https://forms.google.com/mock/${formId}`;
        const mockEditUrl = `https://docs.google.com/forms/d/${formId}/edit`;

        const mockResponse = {
            formTitle: formTitle || 'Mock Registration Form',
            formUrl: mockFormUrl,
            editFormUrl: mockEditUrl,
            formId: formId,
            instructions: 'Mock form created successfully! This is a simulated response for development.',
            editorGranted: !!editorEmail
        };

        console.log('=== MOCK GOOGLE FORM CREATION SUCCESS ===');
        console.log('Mock Form URL:', mockResponse.formUrl);
        console.log('Mock Edit URL:', mockResponse.editFormUrl);

        return {
            success: true,
            data: mockResponse,
            message: 'Mock Google Form created successfully (development mode)',
            isMock: true
        };
    }

    /**
     * Create a mock Google Form for an event
     * @param {Object} eventData - Event data
     * @returns {Promise<Object>} Mock form creation response
     */
    async createEventRegistrationForm(eventData) {
        const { title, description, organizerEmail } = eventData;

        console.log('=== MOCK EVENT REGISTRATION FORM CREATION ===');
        
        const formTitle = `${title} - Registration Form (Mock)`;
        const formDescription = description 
            ? `Mock registration form for ${title}. ${description}`
            : `Mock registration form for ${title}`;

        return this.createGoogleForm({
            formTitle,
            formDescription,
            editorEmail: organizerEmail
        });
    }

    /**
     * Validate configuration (always returns valid for mock)
     * @returns {Object} Validation result
     */
    validateConfiguration() {
        return {
            isValid: true,
            issues: [],
            configuration: {
                endpoint: 'Mock Service',
                requiresApiKey: false,
                isMock: true
            }
        };
    }
}

export default MockGoogleFormService;