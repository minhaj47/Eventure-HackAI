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
     * Create a Google Form for event registration with retry logic
     * @param {Object} formData - Form configuration data
     * @param {string} formData.formTitle - Title of the form
     * @param {string} [formData.formDescription] - Optional description
     * @param {string} [formData.editorEmail] - Optional editor email
     * @param {number} [retryCount=0] - Current retry attempt
     * @returns {Promise<Object>} Form creation response
     */
    async createGoogleForm(formData, retryCount = 0) {
        try {
            const { formTitle, formDescription, editorEmail } = formData;

            console.log('=== GOOGLE FORM CREATION START ===');
            console.log('Form Title:', formTitle);
            console.log('Form Description:', formDescription || 'No description provided');
            console.log('Editor Email:', editorEmail || 'No editor email provided');

            if (!formTitle) {
                console.error('Form creation failed: Form title is required');
                throw new Error('Form title is required');
            }

            const requestPayload = {
                formTitle,
                ...(formDescription && { formDescription }),
                ...(editorEmail && { editorEmail })
            };

            const headers = {
                'Content-Type': 'application/json'
                // No API key required for SmythOS
            };

            console.log('=== SENDING REQUEST TO SMYTHOS ===');
            console.log('SmythOS Endpoint:', this.smythosEndpoint);
            console.log('Request Payload:', JSON.stringify(requestPayload, null, 2));
            console.log('Request Headers:', headers);

            const response = await axios.post(this.smythosEndpoint, requestPayload, {
                headers,
                timeout: 30000, // 30 seconds

            });

            console.log('=== SMYTHOS RESPONSE RECEIVED ===');
            console.log('Response Status:', response.status);
            console.log('Response Headers:', response.headers);
            console.log('Raw Response Data:', response.data);

            // Parse the response - SmythOS returns text/plain
            const responseData = this.parseSmythosResponse(response.data);

            console.log('=== PARSED RESPONSE DATA ===');
            console.log('Parsed Response:', JSON.stringify(responseData, null, 2));

            // Check if SmythOS returned an error
            if (responseData._error || (responseData.result && responseData.result._error)) {
                const errorMessage = responseData._error || responseData.result._error || 'SmythOS API error';
                console.error('SmythOS returned an error:', errorMessage);
                throw new Error(errorMessage);
            }

            console.log('=== GOOGLE FORM CREATION SUCCESS ===');
            console.log('Form URL:', responseData.formUrl || 'Not provided');
            console.log('Edit Form URL:', responseData.editFormUrl || 'Not provided');
            console.log('Form ID:', responseData.formId || 'Not provided');

            return {
                success: true,
                data: responseData,
                message: 'Google Form created successfully'
            };

        } catch (error) {
            console.error('=== GOOGLE FORM CREATION ERROR ===');
            console.error('Error Type:', error.constructor.name);
            console.error('Error Message:', error.message);
            console.error('Error Code:', error.code);
            console.error('Error Response Data:', error.response?.data);
            console.error('Error Response Status:', error.response?.status);
            console.error('Error Stack:', error.stack);
            console.error('Retry Count:', retryCount);

            // Check if this is a network error that we should retry
            const isRetryableError = (
                error.code === 'ECONNRESET' || 
                error.code === 'ECONNREFUSED' || 
                error.code === 'ENOTFOUND' || 
                error.code === 'ETIMEDOUT' ||
                error.message.includes('timeout') ||
                error.message.includes('socket hang up') ||
                error.message.includes('connect ECONNREFUSED')
            );

            // Retry up to 5 times for network errors with exponential backoff
            if (isRetryableError && retryCount < 5) {
                const backoffDelay = Math.min(10000 * Math.pow(2, retryCount), 60000); // 10s, 20s, 40s, 60s max
                console.log(`=== RETRYING REQUEST (Attempt ${retryCount + 1}/5) ===`);
                console.log(`Waiting ${backoffDelay/1000} seconds before retry...`);
                
                // Wait with exponential backoff before retrying
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
                
                return this.createGoogleForm(formData, retryCount + 1);
            }

            // If all retries failed and we're in development or mock mode, use fallback
            if (this.useMockFallback && isRetryableError) {
                console.log('=== FALLING BACK TO MOCK SERVICE ===');
                console.log('SmythOS API unavailable, using mock service for development');
                
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
                code: error.code,
                retryCount,
                isRetryableError
            };
        }
    }

    /**
     * Parse SmythOS response (text/plain format)
     * @param {string} responseText - Raw response from SmythOS
     * @returns {Object} Parsed response object
     */
    parseSmythosResponse(responseText) {
        console.log('=== PARSING SMYTHOS RESPONSE ===');
        console.log('Response Type:', typeof responseText);
        console.log('Response Length:', typeof responseText === 'string' ? responseText.length : 'N/A');
        
        try {
            // Try to parse as JSON first
            if (typeof responseText === 'object') {
                console.log('Response is already an object');
                console.log('Is array:', Array.isArray(responseText));
                
                // Check if it's an array (new SmythOS format)
                if (Array.isArray(responseText)) {
                    console.log('Response is an array, looking for APIOutput element');
                    
                    // Find the APIOutput element that contains form details
                    const apiOutputElement = responseText.find(item => 
                        item.name === 'APIOutput' && 
                        item.result && 
                        item.result.Output && 
                        item.result.Output.formDetails
                    );
                    
                    if (apiOutputElement) {
                        console.log('Found APIOutput element with formDetails');
                        const formDetails = apiOutputElement.result.Output.formDetails;
                        console.log('Form Details:', JSON.stringify(formDetails, null, 2));
                        
                        const result = {
                            formTitle: formDetails.formTitle || '',
                            formUrl: formDetails.formUrl || '',
                            editFormUrl: formDetails.editFormUrl || '',
                            formId: formDetails.formId || '',
                            instructions: formDetails.instructions || '',
                            editorGranted: formDetails.editorGranted || null
                        };
                        
                        console.log('Parsed array format result:', JSON.stringify(result, null, 2));
                        return result;
                    } else {
                        console.log('No APIOutput element found in array');
                        console.log('Array elements:', responseText.map(item => ({ id: item.id, name: item.name })));
                    }
                }
                
                console.log('Object keys:', Object.keys(responseText));
                
                // Check if it's the old SmythOS format with nested structure
                if (responseText.result && responseText.result.Output && responseText.result.Output.formDetails) {
                    console.log('Found nested SmythOS format with formDetails');
                    const formDetails = responseText.result.Output.formDetails;
                    console.log('Form Details:', JSON.stringify(formDetails, null, 2));
                    
                    const result = {
                        formTitle: formDetails.formTitle || '',
                        formUrl: formDetails.formUrl || '',
                        editFormUrl: formDetails.editFormUrl || '',
                        formId: formDetails.formId || '',
                        instructions: formDetails.instructions || '',
                        editorGranted: formDetails.editorGranted || null
                    };
                    
                    console.log('Parsed nested format result:', JSON.stringify(result, null, 2));
                    return result;
                }
                console.log('Using object as-is');
                return responseText;
            }

            console.log('Response is a string, attempting to extract JSON');
            // If it's a string, try to extract JSON from it
            const jsonMatch = responseText.match(/\{.*\}/s);
            if (jsonMatch) {
                console.log('Found JSON in string:', jsonMatch[0].substring(0, 200) + '...');
                const parsed = JSON.parse(jsonMatch[0]);
                console.log('Parsed JSON from string:', JSON.stringify(parsed, null, 2));
                return this.parseSmythosResponse(parsed); // Recursively parse
            }

            console.log('No JSON found, parsing as text response');
            // If no JSON found, create a structured response from the text
            const lines = responseText.split('\n').filter(line => line.trim());
            console.log('Text lines to parse:', lines.length);
            
            const result = {
                formTitle: '',
                formUrl: '',
                editFormUrl: '',
                formId: '',
                instructions: responseText
            };

            // Extract URLs and information from the text
            lines.forEach((line, index) => {
                console.log(`Line ${index}: ${line}`);
                
                if (line.includes('Form URL:') || line.includes('formUrl')) {
                    const urlMatch = line.match(/https:\/\/[^\s]+/);
                    if (urlMatch) {
                        result.formUrl = urlMatch[0];
                        console.log('Found Form URL:', urlMatch[0]);
                    }
                }
                if (line.includes('Edit URL:') || line.includes('editFormUrl')) {
                    const urlMatch = line.match(/https:\/\/[^\s]+/);
                    if (urlMatch) {
                        result.editFormUrl = urlMatch[0];
                        console.log('Found Edit URL:', urlMatch[0]);
                    }
                }
                if (line.includes('Form ID:') || line.includes('formId')) {
                    const idMatch = line.match(/[a-zA-Z0-9_-]{20,}/);
                    if (idMatch) {
                        result.formId = idMatch[0];
                        console.log('Found Form ID:', idMatch[0]);
                    }
                }
            });

            console.log('=== FINAL PARSED RESULT ===');
            console.log('Parsed result:', JSON.stringify(result, null, 2));
            return result;

        } catch (parseError) {
            console.error('=== PARSING ERROR ===');
            console.error('Parse error:', parseError.message);
            console.error('Parse error stack:', parseError.stack);
            
            const fallbackResult = {
                formTitle: '',
                formUrl: '',
                editFormUrl: '',
                formId: '',
                instructions: responseText,
                rawResponse: responseText,
                parseError: parseError.message
            };
            
            console.log('Fallback result:', JSON.stringify(fallbackResult, null, 2));
            return fallbackResult;
        }
    }

    /**
     * Create a Google Form specifically for an event
     * @param {Object} eventData - Event data
     * @param {string} eventData.title - Event title
     * @param {string} [eventData.description] - Event description
     * @param {string} [eventData.organizerEmail] - Organizer email for edit access
     * @returns {Promise<Object>} Form creation response
     */
    async createEventRegistrationForm(eventData) {
        const { title, description, organizerEmail } = eventData;

        console.log('=== EVENT REGISTRATION FORM CREATION ===');
        console.log('Event Title:', title);
        console.log('Event Description:', description || 'No description');
        console.log('Organizer Email:', organizerEmail || 'No organizer email');

        const formTitle = `${title} - Registration Form`;
        const formDescription = description 
            ? `Registration form for ${title}. ${description}`
            : `Please fill out this form to register for ${title}`;

        console.log('Generated Form Title:', formTitle);
        console.log('Generated Form Description:', formDescription);

        console.log('=== CALLING CREATE GOOGLE FORM ===');
        const result = await this.createGoogleForm({
            formTitle,
            formDescription,
            editorEmail: organizerEmail
        });

        console.log('=== EVENT REGISTRATION FORM RESULT ===');
        console.log('Success:', result.success);
        console.log('Form Data:', JSON.stringify(result.data, null, 2));

        return result;
    }

    /**
     * Validate SmythOS endpoint configuration
     * @returns {Object} Validation result
     */
    validateConfiguration() {
        const issues = [];

        if (!this.smythosEndpoint || this.smythosEndpoint.includes('your-agent-id')) {
            issues.push('SMYTHOS_GOOGLE_FORM_URL is not properly configured');
        }

        return {
            isValid: issues.length === 0,
            issues,
            configuration: {
                endpoint: this.smythosEndpoint,
                requiresApiKey: false
            }
        };
    }
}

export default new GoogleFormService();
