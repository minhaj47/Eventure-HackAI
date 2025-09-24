# Event Update API Documentation

This document describes the event update notification system integrated with SmythOS agents for sending automated emails to Google Sheets contacts.

## Environment Setup

Add the following environment variable to your `.env` file:

```env
SMYTHOS_AGENT_URL=https://your-agent-url.com
```

## API Endpoints

### 1. Send Custom Event Update

**Endpoint:** `POST /api/event/send-update`

**Description:** Send a custom event update notification to contacts in a Google Sheet.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "sheetLink": "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit",
  "emailSubject": "Important Event Update",
  "emailBody": "<h1>Custom HTML email content</h1><p>Your message here...</p>"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event update sent successfully",
  "data": {
    // SmythOS agent response data
  }
}
```

### 2. Send Bulk Event Notification

**Endpoint:** `POST /api/event/bulk-notification`

**Description:** Send a formatted notification for a specific event using event data from the database.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "eventId": "60d5ecb74b24a12345678901",
  "sheetLink": "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit",
  "customMessage": "Please note the venue has changed. See details below."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event update sent successfully",
  "data": {
    // SmythOS agent response data
  }
}
```

### 3. Send Event Reminder

**Endpoint:** `POST /api/event/send-reminder`

**Description:** Send an automated reminder for an upcoming event.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "eventId": "60d5ecb74b24a12345678901",
  "sheetLink": "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event update sent successfully",
  "data": {
    // SmythOS agent response data
  }
}
```

## Usage Examples

### Using with cURL

```bash
# Send custom event update
curl -X POST http://localhost:8000/api/event/send-update \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "sheetLink": "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit",
    "emailSubject": "Event Update",
    "emailBody": "<h1>Important Update</h1><p>Event details have changed.</p>"
  }'

# Send bulk notification
curl -X POST http://localhost:8000/api/event/bulk-notification \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "60d5ecb74b24a12345678901",
    "sheetLink": "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit",
    "customMessage": "Venue has changed to Main Hall."
  }'

# Send reminder
curl -X POST http://localhost:8000/api/event/send-reminder \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "60d5ecb74b24a12345678901",
    "sheetLink": "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
  }'
```

### Using with JavaScript/Axios

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';
const token = 'your_jwt_token';

// Send custom event update
async function sendCustomUpdate() {
  try {
    const response = await axios.post(`${API_BASE_URL}/event/send-update`, {
      sheetLink: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
      emailSubject: 'Event Update',
      emailBody: '<h1>Important Update</h1><p>Event details have changed.</p>'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Update sent:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Send bulk notification
async function sendBulkNotification(eventId, sheetLink, customMessage) {
  try {
    const response = await axios.post(`${API_BASE_URL}/event/bulk-notification`, {
      eventId,
      sheetLink,
      customMessage
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Notification sent:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Send reminder
async function sendReminder(eventId, sheetLink) {
  try {
    const response = await axios.post(`${API_BASE_URL}/event/send-reminder`, {
      eventId,
      sheetLink
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Reminder sent:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

## Google Sheets Setup

1. Create a Google Sheet with contact information
2. Ensure the sheet has columns for email addresses
3. Share the sheet with your SmythOS agent service account
4. Use the sheet ID in your API calls

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid JWT token)
- `404` - Not Found (event not found)
- `500` - Internal Server Error (SmythOS agent error)

## Features

- **Automated Email Generation**: Beautiful HTML email templates with event details
- **Flexible Messaging**: Support for custom messages and formatting
- **Smart Reminders**: Automatic calculation of time until event
- **Validation**: Input validation for required fields
- **Error Handling**: Comprehensive error handling and logging
- **Authentication**: JWT-based authentication for security

## Notes

- All endpoints require authentication via JWT token
- The `sheetLink` parameter should be the full Google Sheets URL
- Event reminders can only be sent for future events
- Email templates are responsive and mobile-friendly
- The service integrates with your existing event management system
