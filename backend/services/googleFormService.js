import axios from 'axios';

/**
 * Service for creating Google Forms via SmythOS API
 */
class GoogleFormService {
    constructor() {
        this.smythosEndpoint = process.env.SMYTHOS_GOOGLE_FORM_URL || 'https://cmfw5qbmfxvnkjxgtpjoabofw.agent.pa.smyth.ai/api/generate_google_form';
        // No API key required for SmythOS Google Form generation
    }

    /**
     * Create a Google Form for event registration
     * @param {Object} formData - Form configuration data
     * @param {string} formData.formTitle - Title of the form
     * @param {string} [formData.formDescription] - Optional description
     * @param {string} [formData.editorEmail] - Optional editor email
     * @returns {Promise<Object>} Form creation response
     */
    async createGoogleForm(formData) {
        try {
            const { formTitle, formDescription, editorEmail } = formData;

            if (!formTitle) {
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

            console.log('Creating Google Form with SmythOS:', {
                endpoint: this.smythosEndpoint,
                payload: requestPayload
            });

            const response = await axios.post(this.smythosEndpoint, requestPayload, {
                headers,
                timeout: 30000 // 30 second timeout
            });

            // Parse the response - SmythOS returns text/plain
            const responseData = this.parseSmythosResponse(response.data);

            // Check if SmythOS returned an error
            if (responseData._error || (responseData.result && responseData.result._error)) {
                throw new Error(responseData._error || responseData.result._error || 'SmythOS API error');
            }

            return {
                success: true,
                data: responseData,
                message: 'Google Form created successfully'
            };

        } catch (error) {
            console.error('Error creating Google Form:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            throw {
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status || 500
            };
        }
    }

    /**
     * Parse SmythOS response (text/plain format)
     * @param {string} responseText - Raw response from SmythOS
     * @returns {Object} Parsed response object
     */
    parseSmythosResponse(responseText) {
        try {
            // Try to parse as JSON first
            if (typeof responseText === 'object') {
                // Check if it's the new SmythOS format with nested structure
                if (responseText.result && responseText.result.Output && responseText.result.Output.formDetails) {
                    const formDetails = responseText.result.Output.formDetails;
                    return {
                        formTitle: formDetails.formTitle || '',
                        formUrl: formDetails.formUrl || '',
                        editFormUrl: formDetails.editFormUrl || '',
                        formId: formDetails.formId || '',
                        instructions: formDetails.instructions || '',
                        editorGranted: formDetails.editorGranted || null
                    };
                }
                return responseText;
            }

            // If it's a string, try to extract JSON from it
            const jsonMatch = responseText.match(/\{.*\}/s);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return this.parseSmythosResponse(parsed); // Recursively parse
            }

            // If no JSON found, create a structured response from the text
            const lines = responseText.split('\n').filter(line => line.trim());
            const result = {
                formTitle: '',
                formUrl: '',
                editFormUrl: '',
                formId: '',
                instructions: responseText
            };

            // Extract URLs and information from the text
            lines.forEach(line => {
                if (line.includes('Form URL:') || line.includes('formUrl')) {
                    const urlMatch = line.match(/https:\/\/[^\s]+/);
                    if (urlMatch) result.formUrl = urlMatch[0];
                }
                if (line.includes('Edit URL:') || line.includes('editFormUrl')) {
                    const urlMatch = line.match(/https:\/\/[^\s]+/);
                    if (urlMatch) result.editFormUrl = urlMatch[0];
                }
                if (line.includes('Form ID:') || line.includes('formId')) {
                    const idMatch = line.match(/[a-zA-Z0-9_-]{20,}/);
                    if (idMatch) result.formId = idMatch[0];
                }
            });

            return result;

        } catch (parseError) {
            console.warn('Could not parse SmythOS response as JSON:', parseError.message);
            return {
                formTitle: '',
                formUrl: '',
                editFormUrl: '',
                formId: '',
                instructions: responseText,
                rawResponse: responseText
            };
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

        const formTitle = `${title} - Registration Form`;
        const formDescription = description 
            ? `Registration form for ${title}. ${description}`
            : `Please fill out this form to register for ${title}`;

        return this.createGoogleForm({
            formTitle,
            formDescription,
            editorEmail: organizerEmail
        });
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
