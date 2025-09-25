# Google Form Generation API Documentation

## Overview

The Eventure-HackAI backend now includes Google Form generation capabilities through SmythOS integration. This allows users to automatically create Google Forms for event registration with predefined fields (Name, Email, WhatsApp, Telegram).

## New API Endpoints

### 1. Generate Google Form (General)

**Endpoint:** `POST /api/event/generate-google-form`

**Authentication:** Required (JWT Token)

**Description:** Creates a general Google Form with custom title and description.

**Request Body:**
```json
{
  "formTitle": "Event Registration Form",
  "formDescription": "Please fill out this form to register", // optional
  "editorEmail": "organizer@example.com" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "formTitle": "Event Registration Form",
    "formUrl": "https://docs.google.com/forms/d/FORM_ID/viewform",
    "editFormUrl": "https://docs.google.com/forms/d/FORM_ID/edit",
    "formId": "FORM_ID",
    "instructions": "Your Google Form is ready! Share the form URL..."
  },
  "message": "Google Form created successfully"
}
```

### 2. Generate Event Registration Form

**Endpoint:** `POST /api/event/:eventId/generate-registration-form`

**Authentication:** Required (JWT Token)

**Description:** Creates a Google Form specifically for an existing event, using event details.

**URL Parameters:**
- `eventId`: MongoDB ObjectId of the event

**Request Body:**
```json
{
  "editorEmail": "organizer@example.com" // optional, defaults to authenticated user's email
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "formTitle": "Event Name - Registration Form",
    "formUrl": "https://docs.google.com/forms/d/FORM_ID/viewform",
    "editFormUrl": "https://docs.google.com/forms/d/FORM_ID/edit",
    "formId": "FORM_ID",
    "instructions": "Your Google Form is ready! Share the form URL..."
  },
  "message": "Google Form created successfully",
  "event": {
    "id": "event_id",
    "name": "Event Name",
    "description": "Event description"
  }
}
```

**Note:** This endpoint automatically updates the event record with the form URLs:
- `registrationFormUrl`: Public form URL for sharing
- `registrationFormEditUrl`: Edit URL for organizers

### 3. Check Google Form Configuration

**Endpoint:** `GET /api/event/google-form-config`

**Authentication:** Required (JWT Token)

**Description:** Validates the SmythOS Google Form service configuration.

**Response:**
```json
{
  "success": true,
  "configuration": {
    "isValid": true,
    "issues": [],
    "configuration": {
      "endpoint": "https://your-agent-id.agent.pa.smyth.ai/api/generate_google_form",
      "hasApiKey": true
    }
  }
}
```

## Environment Variables

Add these variables to your `.env` file:

```bash
# SmythOS Google Form Configuration (No API key required)
SMYTHOS_GOOGLE_FORM_URL="https://your-agent-id.agent.pa.smyth.ai/api/generate_google_form"
```

## Usage Examples

### Frontend Integration (React/Next.js)

```javascript
// Generate a general Google Form
const createGoogleForm = async (formData) => {
  try {
    const response = await fetch('/api/event/generate-google-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        formTitle: formData.title,
        formDescription: formData.description,
        editorEmail: formData.editorEmail
      })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Form created:', result.data.formUrl);
      // Open form URL or show success message
    }
  } catch (error) {
    console.error('Error creating form:', error);
  }
};

// Generate registration form for specific event
const createEventRegistrationForm = async (eventId, editorEmail) => {
  try {
    const response = await fetch(`/api/event/${eventId}/generate-registration-form`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ editorEmail })
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('Registration form created:', result.data.formUrl);
      // Update UI with form links
    }
  } catch (error) {
    console.error('Error creating registration form:', error);
  }
};
```

### Backend Integration (Node.js)

```javascript
import googleFormService from './services/googleFormService.js';

// Direct service usage
const createForm = async () => {
  try {
    const result = await googleFormService.createGoogleForm({
      formTitle: "My Event Registration",
      formDescription: "Please register for our event",
      editorEmail: "organizer@example.com"
    });

    console.log('Form created:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Form Fields

The generated Google Forms automatically include these fields:
- **Name** (Text input, required)
- **Email** (Email input, required)
- **WhatsApp Number** (Text input, optional)
- **Telegram Username** (Text input, optional)

## Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Form title is required"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Event not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to generate Google Form"
}
```

### Configuration Issues

If SmythOS is not properly configured:
```json
{
  "success": false,
  "configuration": {
    "isValid": false,
    "issues": [
      "SMYTHOS_GOOGLE_FORM_URL is not properly configured",
      "SMYTHOS_API_KEY is not set (optional but recommended)"
    ]
  }
}
```

## Security Considerations

1. **Authentication Required:** All endpoints require valid JWT authentication
2. **User Authorization:** Users can only create forms for their own events
3. **Input Validation:** All inputs are validated and sanitized
4. **Rate Limiting:** Consider implementing rate limiting for form generation
5. **API Key Protection:** Store SmythOS API key securely in environment variables

## Testing

### Manual Testing with cURL

```bash
# Generate general Google Form
curl -X POST http://localhost:5000/api/event/generate-google-form \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "formTitle": "Test Registration Form",
    "formDescription": "This is a test form",
    "editorEmail": "test@example.com"
  }'

# Generate event registration form
curl -X POST http://localhost:5000/api/event/EVENT_ID/generate-registration-form \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "editorEmail": "organizer@example.com"
  }'

# Check configuration
curl -X GET http://localhost:5000/api/event/google-form-config \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Integration with Event Management

When a registration form is generated for an event:

1. The event record is automatically updated with form URLs
2. The form title includes the event name
3. The form description includes event details
4. The organizer gets edit access to the form

This seamless integration allows event organizers to quickly create and manage registration forms for their events.

## Next Steps

1. **Frontend UI:** Create user interface components for form generation
2. **Form Analytics:** Add tracking for form submissions and analytics
3. **Custom Fields:** Allow users to add custom fields to forms
4. **Templates:** Create predefined form templates for different event types
5. **Bulk Operations:** Support generating forms for multiple events
