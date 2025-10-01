import axios from 'axios';
import MockGoogleFormService from './mockGoogleFormService.js';

/**
 * Service for creating Google Forms via SmythOS API
 */
class GoogleFormService {
    constructor() {
        this.smythosEndpoint = 'https://cmfw5qbmfxvnkjxgtpjoabofw.agent.a.smyth.ai/api/generate_google_form';
        this.mockService = new MockGoogleFormService();
        this.useMockFallback = process.env.NODE_ENV === 'development' || process.env.USE_MOCK_FORMS === 'true';
    }

    /**
     * Create a Google Form for event registration
     * @param {Object} formData - The form data
     * @param {string} formData.formTitle - The title for the Google Form
     * @param {string} [formData.formDescription] - Optional description for the form
     * @param {string} [formData.editorEmail] - Optional editor email
     * @param {Array} [formData.customFields] - Optional array of custom fields to add to the form
     * @returns {Promise<Object>} Form creation response
     */
    async createGoogleForm(formData) {
        try {
            const { formTitle, formDescription, editorEmail, customFields } = formData;

            console.log('Creating Google Form via SmythOS API...');
            console.log('Form Title:', formTitle);
            if (customFields && customFields.length > 0) {
                console.log('Custom Fields:', customFields.length, 'fields provided');
                customFields.forEach((field, index) => {
                    console.log(`  ${index + 1}. ${field.label} (${field.type})${field.required ? ' - Required' : ' - Optional'}`);
                });
            } else {
                console.log('Custom Fields: Using default form fields');
            }            if (!formTitle) {
                throw new Error('Form title is required');
            }

            // SmythOS API expects specific field structure for Google Form generation
            const requestPayload = {
                formTitle: formTitle,
                formDescription: formDescription || `Registration form for ${formTitle}`,
                editorEmail: editorEmail || '',
                customFields: customFields || [
                    { type: 'text', label: 'Name', required: true },
                    { type: 'email', label: 'Email', required: true },
                    { type: 'text', label: 'WhatsApp Number', required: false },
                    { type: 'text', label: 'Telegram Username', required: false }
                ]
            };

            console.log('=== SENDING REQUEST TO SMYTHOS ===');
            console.log('Endpoint:', this.smythosEndpoint);
            console.log('Payload:', JSON.stringify(requestPayload, null, 2));

            const response = await axios.post(this.smythosEndpoint, requestPayload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 seconds
            });

            console.log('SmythOS API response received:', JSON.stringify(response.data, null, 2));

            // Parse the response - SmythOS returns text/plain
            const responseData = this.parseSmythosResponse(response.data);

            // Check if SmythOS returned an error
            if (responseData._error || (responseData.result && responseData.result._error)) {
                const errorMessage = responseData._error || responseData.result._error || 'SmythOS API error';
                console.error('SmythOS returned an error:', errorMessage);
                throw new Error(errorMessage);
            }

            // Only use mock fallback if SmythOS explicitly returns new API format without URLs
            if (responseData._newApiFormat) {
                console.log('SmythOS returned new API format without direct URLs');
                
                // Try mock service as fallback only if explicitly enabled
                if (this.useMockFallback) {
                    try {
                        const mockResult = await this.mockService.createGoogleForm(formData);
                        console.log('Using mock service as fallback for new API format');
                        return mockResult;
                    } catch (mockError) {
                        console.error('Mock service fallback failed:', mockError);
                    }
                }
                
                // Return the original response even without URLs
                return {
                    success: true,
                    data: responseData,
                    message: 'Google Form created successfully (new API format, URLs not available)'
                };
            }

            // Log the parsed response for debugging
            console.log('=== FINAL PARSED RESPONSE ===');
            console.log('formUrl:', responseData.formUrl);
            console.log('editFormUrl:', responseData.editFormUrl);
            console.log('formId:', responseData.formId);

            return {
                success: true,
                data: responseData,
                message: 'Google Form created successfully'
            };

        } catch (error) {
            console.error('Google Form creation error:', error.message);

            // If we're in development or using mock fallback, try mock service
            if (this.useMockFallback) {
                console.log('Falling back to mock service...');
                try {
                    return await this.mockService.createGoogleForm(formData);
                } catch (mockError) {
                    console.error('Mock service also failed:', mockError);
                }
            }

            throw {
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status || 500,
                code: error.code
            };
        }
    }

    /**
     * Parse SmythOS response which can be JSON string or object
     * @param {string|Object} responseData - Raw response from SmythOS
     * @returns {Object} Parsed response data
     */
    parseSmythosResponse(responseData) {
        console.log('=== PARSING SMYTHOS RESPONSE ===');
        console.log('Response Type:', typeof responseData);
        console.log('Response Data:', JSON.stringify(responseData, null, 2));
        
        try {
            // Handle object responses (most common from SmythOS)
            if (typeof responseData === 'object' && responseData !== null) {
                console.log('Processing object response...');
                
                // Check if it's an array response (new SmythOS format)
                if (Array.isArray(responseData)) {
                    console.log('Array response detected, looking for APIOutput element...');
                    
                    const apiOutput = responseData.find(item => 
                        item.name === 'APIOutput' && 
                        item.result && 
                        item.result.Output && 
                        item.result.Output.formDetails
                    );
                    
                    if (apiOutput) {
                        console.log('Found APIOutput with formDetails');
                        const formDetails = apiOutput.result.Output.formDetails;
                        return {
                            formTitle: formDetails.formTitle || '',
                            formUrl: formDetails.formUrl || '',
                            editFormUrl: formDetails.editFormUrl || '',
                            formId: formDetails.formId || '',
                            instructions: formDetails.instructions || ''
                        };
                    }
                }
                
                // Check if it has nested result structure (old SmythOS format)
                if (responseData.result && responseData.result.Output && responseData.result.Output.formDetails) {
                    console.log('Found nested formDetails structure');
                    const formDetails = responseData.result.Output.formDetails;
                    return {
                        formTitle: formDetails.formTitle || '',
                        formUrl: formDetails.formUrl || '',
                        editFormUrl: formDetails.editFormUrl || '',
                        formId: formDetails.formId || '',
                        instructions: formDetails.instructions || ''
                    };
                }

                // Handle new SmythOS response format with Response.replies
                if (responseData.result && responseData.result.Response && responseData.result.Response.replies) {
                    console.log('Found new SmythOS response format with replies');
                    console.log('Response structure:', JSON.stringify(responseData.result.Response, null, 2));
                    
                    // For now, return a basic structure since the new API doesn't directly provide URLs
                    // This indicates the form was created but we need to handle it differently
                    return {
                        formTitle: 'Form Created Successfully',
                        formUrl: '', // New API format doesn't provide direct URLs
                        editFormUrl: '',
                        formId: responseData.result.Response.writeControl?.requiredRevisionId || '',
                        instructions: 'Google Form has been created successfully. The new API format is being processed.',
                        _newApiFormat: true,
                        _rawResponse: responseData.result.Response
                    };
                }
                
                // Check if response has direct form URLs at top level
                if (responseData.formUrl || responseData.editFormUrl) {
                    console.log('Found form URLs at top level of response');
                    return {
                        formTitle: responseData.formTitle || '',
                        formUrl: responseData.formUrl || '',
                        editFormUrl: responseData.editFormUrl || '',
                        formId: responseData.formId || '',
                        instructions: responseData.instructions || ''
                    };
                }

                // Direct object response
                console.log('Using direct object response (no URLs found)');
                console.log('Response keys:', Object.keys(responseData));
                return responseData;
            }

            // Handle string responses
            if (typeof responseData === 'string') {
                console.log('Processing string response...');
                let cleanedData = responseData.trim();
                
                // Try to find JSON in the string
                const jsonMatch = cleanedData.match(/\{.*\}/s);
                if (jsonMatch) {
                    console.log('Found JSON in string, parsing...');
                    const parsed = JSON.parse(jsonMatch[0]);
                    return this.parseSmythosResponse(parsed); // Recursive call
                }
                
                // Parse as plain text response
                console.log('Parsing as plain text response...');
                const result = {
                    formTitle: '',
                    formUrl: '',
                    editFormUrl: '',
                    formId: '',
                    instructions: cleanedData
                };
                
                // Extract URLs from text
                const lines = cleanedData.split('\n');
                lines.forEach(line => {
                    if (line.includes('Form URL:') || line.includes('formUrl')) {
                        const urlMatch = line.match(/https:\/\/[^\s]+/);
                        if (urlMatch) result.formUrl = urlMatch[0];
                    }
                    if (line.includes('Edit URL:') || line.includes('editFormUrl')) {
                        const urlMatch = line.match(/https:\/\/[^\s]+/);
                        if (urlMatch) result.editFormUrl = urlMatch[0];
                    }
                });
                
                return result;
            }

            // Fallback
            console.log('Using fallback response format');
            return { data: responseData };

        } catch (parseError) {
            console.error('=== PARSING ERROR ===');
            console.error('Parse error:', parseError.message);
            console.error('Raw response data:', responseData);
            
            return {
                _error: 'Failed to parse SmythOS response',
                rawResponse: responseData,
                parseError: parseError.message
            };
        }
    }

    /**
     * Generate Google Form for event registration
     * This method creates a form with registration fields for an event
     * @param {Object} eventData - Event information
     * @returns {Promise<Object>} Form creation response with URLs and metadata
     */
    async generateEventRegistrationForm(eventData) {
        try {
            const {
                eventTitle,
                eventDescription,
                eventDate,
                eventTime,
                eventLocation,
                organizerName,
                registrationFields = []
            } = eventData;

            // Create form title and description
            const formTitle = `${eventTitle} - Registration Form`;
            const formDescription = `Registration for ${eventTitle}\n\nEvent Details:\n- Date: ${eventDate}\n- Time: ${eventTime}\n- Location: ${eventLocation}\n- Organizer: ${organizerName}\n\n${eventDescription || ''}`;

            // Call the main form creation method
            const result = await this.createGoogleForm({
                formTitle,
                formDescription
            });

            console.log('Event registration form created successfully');
            return result;

        } catch (error) {
            console.error('Error generating event registration form:', error);
            throw error;
        }
    }

    /**
     * Create a Google Form specifically for an event
     * @param {Object} eventData - Event data
     * @param {string} eventData.title - Event title
     * @param {string} [eventData.description] - Event description
     * @param {string} [eventData.organizerEmail] - Organizer email for edit access
     * @param {Array} [eventData.customFields] - Custom fields for the registration form
     * @returns {Promise<Object>} Form creation response
     */
    async createEventRegistrationForm(eventData) {
        const { title, description, organizerEmail, customFields } = eventData;

        const formTitle = `${title} - Registration Form`;
        const formDescription = description 
            ? `Registration form for ${title}. ${description}`
            : `Please fill out this form to register for ${title}`;

        console.log('Creating event registration form with custom fields:', customFields ? customFields.length : 0);

        return await this.createGoogleForm({
            formTitle,
            formDescription,
            editorEmail: organizerEmail,
            customFields: customFields // Pass custom fields to main form creation method
        });
    }
}

export default new GoogleFormService();