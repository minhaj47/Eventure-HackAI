# Google Form API Updates - Custom Fields Implementation

## Overview
Updated the Google Form generation API to support custom fields based on the specification provided. The system now uses default registration fields as shown in the UI mockup.

## Changes Made

### 1. API Specification Updates
- **File**: `backend/backend.json`
- **Changes**: Added `customFields` parameter to the API specification
- **Schema**: Added `editorEmail` and `customFields` array to the request body

### 2. Backend Service Updates

#### Google Form Service (`backend/services/googleFormService.js`)
- Added support for `customFields` parameter
- Enhanced logging to show field details when custom fields are provided
- Maintains backward compatibility with existing API calls

#### Mock Service (`backend/services/mockGoogleFormService.js`)
- Updated to handle custom fields for development/testing
- Added detailed logging for field structure

#### Controller (`backend/controllers/event.controller.js`)
- Updated `generateGoogleForm` to accept and process `customFields`
- Added request logging for debugging

### 3. Frontend Updates

#### Type Definitions (`frontend/services/googleFormApi.ts`)
- Added `CustomField` interface:
  ```typescript
  interface CustomField {
    type: string;
    label: string;
    required?: boolean;
    options?: string[];
    [key: string]: unknown;
  }
  ```
- Updated `GoogleFormRequest` to include `customFields?: CustomField[]`

#### UI Component (`frontend/components/GoogleFormGenerator.tsx`)
- **Default Fields**: Pre-populated with standard registration fields:
  - Full Name (text, required)
  - Email Address (email, required)
  - WhatsApp Number (text, optional)
  - Organization (text, optional)

- **Enhanced UI**:
  - Field management interface with add/remove functionality
  - Field type selection (text, email, number, textarea, select, checkbox)
  - Required field toggle
  - Show/hide fields section

### 4. Default Registration Fields
Based on the UI mockup provided, the system now defaults to these fields:

```javascript
[
  { type: 'text', label: 'Full Name', required: true },
  { type: 'email', label: 'Email Address', required: true },
  { type: 'text', label: 'WhatsApp Number', required: false },
  { type: 'text', label: 'Organization', required: false }
]
```

## API Usage

### Basic Form Generation (Legacy Support)
```json
{
  "formTitle": "Event Registration"
}
```

### Form with Default Registration Fields
```json
{
  "formTitle": "Event Registration",
  "formDescription": "Please fill out this registration form",
  "editorEmail": "organizer@example.com",
  "customFields": [
    { "type": "text", "label": "Full Name", "required": true },
    { "type": "email", "label": "Email Address", "required": true },
    { "type": "text", "label": "WhatsApp Number", "required": false },
    { "type": "text", "label": "Organization", "required": false }
  ]
}
```

### Custom Fields Example
```json
{
  "formTitle": "Advanced Registration",
  "customFields": [
    { "type": "select", "label": "Dietary Preferences", "required": false, "options": ["Vegan", "Vegetarian"] },
    { "type": "textarea", "label": "Special Requirements", "required": false },
    { "type": "checkbox", "label": "Agree to terms", "required": true }
  ]
}
```

## Testing
- ✅ API endpoint validation working
- ✅ Default fields integration successful
- ✅ Custom fields processing working
- ✅ Backward compatibility maintained
- ✅ Enhanced logging implemented

## Deployment Notes
- No breaking changes - fully backward compatible
- Environment variables unchanged
- Database schema unchanged
- SmythOS integration enhanced to handle custom fields

The API now provides a flexible form generation system while maintaining the standard registration field structure as the default configuration.