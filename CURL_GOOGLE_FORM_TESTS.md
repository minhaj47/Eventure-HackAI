# cURL Commands for Google Form API Testing

## Prerequisites

1. **Backend server running** on `http://localhost:5000`
2. **Valid JWT token** for authentication
3. **Valid event ID** for event-specific form generation

## Environment Variables

```bash
# Set these variables for easier testing
export BASE_URL="http://localhost:5000"
export JWT_TOKEN="your-jwt-token-here"
export EVENT_ID="your-event-id-here"
```

## 1. Check Google Form Configuration

Test the configuration validation endpoint:

```bash
curl -X GET "${BASE_URL}/api/event/google-form-config" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "configuration": {
    "isValid": true,
    "issues": [],
    "configuration": {
      "endpoint": "https://your-agent-id.agent.pa.smyth.ai/api/generate_google_form",
      "requiresApiKey": false
    }
  }
}
```

## 2. Generate General Google Form

Create a general Google Form with custom title and description:

```bash
curl -X POST "${BASE_URL}/api/event/generate-google-form" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "formTitle": "Test Registration Form",
    "formDescription": "This is a test form created via API",
    "editorEmail": "test@example.com"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
```

**Minimal request (only required fields):**
```bash
curl -X POST "${BASE_URL}/api/event/generate-google-form" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "formTitle": "Simple Test Form"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "formTitle": "Test Registration Form",
    "formUrl": "https://docs.google.com/forms/d/FORM_ID/viewform",
    "editFormUrl": "https://docs.google.com/forms/d/FORM_ID/edit",
    "formId": "FORM_ID",
    "instructions": "Your Google Form is ready! Share the form URL..."
  },
  "message": "Google Form created successfully"
}
```

## 3. Generate Event Registration Form

Create a registration form for a specific event:

```bash
curl -X POST "${BASE_URL}/api/event/${EVENT_ID}/generate-registration-form" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "editorEmail": "organizer@example.com"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
```

**Without editor email (uses authenticated user's email):**
```bash
curl -X POST "${BASE_URL}/api/event/${EVENT_ID}/generate-registration-form" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
```

**Expected Response:**
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

## 4. Error Testing

### Test without authentication (should fail with 401):
```bash
curl -X GET "${BASE_URL}/api/event/google-form-config" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
```

**Expected:** `401 Unauthorized`

### Test with missing form title:
```bash
curl -X POST "${BASE_URL}/api/event/generate-google-form" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "formDescription": "Form without title"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
```

**Expected:** `400 Bad Request`

### Test with invalid event ID:
```bash
curl -X POST "${BASE_URL}/api/event/invalid-event-id/generate-registration-form" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'
```

**Expected:** `404 Not Found` or `400 Bad Request`

## 5. Complete Test Script

Save this as `test-google-form-curl.sh`:

```bash
#!/bin/bash

# Configuration
BASE_URL="http://localhost:5000"
JWT_TOKEN="your-jwt-token-here"
EVENT_ID="your-event-id-here"

echo "🚀 Testing Google Form API with cURL"
echo "=================================="

# Test 1: Configuration check
echo -e "\n1️⃣ Testing configuration check..."
curl -X GET "${BASE_URL}/api/event/google-form-config" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

# Test 2: Generate general form
echo -e "\n2️⃣ Testing general form generation..."
curl -X POST "${BASE_URL}/api/event/generate-google-form" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{
    "formTitle": "cURL Test Form",
    "formDescription": "Generated via cURL test script",
    "editorEmail": "test@example.com"
  }' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

# Test 3: Generate event form (if EVENT_ID is set)
if [ "$EVENT_ID" != "your-event-id-here" ]; then
  echo -e "\n3️⃣ Testing event registration form..."
  curl -X POST "${BASE_URL}/api/event/${EVENT_ID}/generate-registration-form" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    -d '{"editorEmail": "organizer@example.com"}' \
    -w "\nHTTP Status: %{http_code}\n" \
    -s | jq '.'
else
  echo -e "\n3️⃣ Skipping event form test (EVENT_ID not set)"
fi

# Test 4: Authentication error
echo -e "\n4️⃣ Testing authentication error..."
curl -X GET "${BASE_URL}/api/event/google-form-config" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

# Test 5: Validation error
echo -e "\n5️⃣ Testing validation error..."
curl -X POST "${BASE_URL}/api/event/generate-google-form" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -d '{"formDescription": "Missing title"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  -s | jq '.'

echo -e "\n✅ All tests completed!"
```

## 6. Quick Test Commands

For quick testing without setting up variables:

```bash
# Replace YOUR_JWT_TOKEN with actual token
TOKEN="YOUR_JWT_TOKEN"

# Test configuration
curl -X GET "http://localhost:5000/api/event/google-form-config" \
  -H "Authorization: Bearer $TOKEN" | jq

# Test form generation
curl -X POST "http://localhost:5000/api/event/generate-google-form" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"formTitle":"Quick Test Form"}' | jq
```

## Notes

- **jq**: Used for pretty-printing JSON responses (install with `sudo apt install jq`)
- **JWT Token**: Get from your authentication system or use the test script
- **Event ID**: Use a valid MongoDB ObjectId from your events collection
- **SmythOS**: Ensure your SmythOS agent endpoint is configured in `.env`

## Troubleshooting

1. **401 Unauthorized**: Check JWT token validity
2. **404 Not Found**: Verify event ID exists in database
3. **500 Internal Server Error**: Check SmythOS configuration and server logs
4. **Connection refused**: Ensure backend server is running on port 5000
