# Frontend-Backend Integration Setup Guide

## Overview

Your Event Manager application now has complete frontend-backend integration with SmythOS AI APIs for email generation.

## What Was Implemented

### 1. Backend Connection

- ✅ **API Service**: Created `frontend/services/apiService.ts` with email generation function
- ✅ **Event Management**: Updated `useEvents.ts` hook for proper backend communication
- ✅ **Data Structure**: Aligned frontend EventData with backend (eventName, dateTime)

### 2. Email Generation Feature

- ✅ **AutomatedReminders Component**: Now uses backend SmythOS API for email generation
- ✅ **EmailBodyGenerator Component**: New standalone component for email generation
- ✅ **Error Handling**: Graceful fallback if API fails
- ✅ **User Experience**: Loading states, editing modes, copy functionality

### 3. Data Structure Alignment

- ✅ **EventCreationForm**: Fixed to use `eventName` and `dateTime` properties
- ✅ **useEventManager**: Updated to match backend API requirements
- ✅ **Type Safety**: Maintained proper TypeScript interfaces

## How to Test

### 1. Start Backend Server

```bash
cd backend
npm install
npm run dev
# Should run on http://localhost:5000
```

### 2. Start Frontend Server

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Edit .env.local if needed
npm run dev
# Should run on http://localhost:3000
```

### 3. Test Email Generation

1. Go to http://localhost:3000
2. Create a new event
3. Go to the "Mail" tab
4. Enter custom instructions (optional)
5. Click "Generate" - this now calls your SmythOS API!

### 4. Run Integration Test

```bash
# From project root
node test-backend-integration.js
```

## Features Now Available

### AI-Powered Email Generation

- Uses your backend SmythOS API endpoint: `/api/generate_email_body`
- Handles JSON response format with nested structure
- Customizable tone (professional, casual, formal)
- Template variable replacement (`{{recipientName}}`, `{{senderName}}`)
- Custom instructions support
- **NEW: Regenerate with Suggestions** - Improve emails with specific feedback
- Quick suggestion buttons for common improvements
- Edit and copy functionality
- Fallback template if API fails

### Smart Event Management

- Creates events through backend API
- Proper authentication with cookies
- Error handling with user feedback
- Auto-refresh event lists

### Enhanced UI/UX

- Loading states during API calls
- Professional email templates
- Copy to clipboard functionality
- Edit mode for generated content

## Backend API Integration Details

Your frontend now properly calls these backend endpoints:

- `POST /api/event/add` - Create events
- `GET /api/event/all` - Get user events
- `POST /api/generate_email_body` - Generate emails via SmythOS

## Next Steps

1. **Authentication**: Implement user authentication if needed
2. **Email Sending**: You mentioned implementing actual email sending later
3. **Google Sheets**: The Google Sheets integration is already implemented
4. **Error Monitoring**: Consider adding error tracking for production

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend allows `http://localhost:3000`
2. **API Not Found**: Check backend server is running on port 5000
3. **Email Generation Fails**: Check SmythOS API is accessible from backend

### Environment Variables

Frontend `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Backend `.env`:

```
PORT=5000
FRONTEND_URL=http://localhost:3000
```

## Code Changes Summary

### Modified Files:

- `frontend/services/apiService.ts` - Backend API integration
- `frontend/hooks/useEventManager.ts` - Data structure alignment
- `frontend/components/EventCreationForm.tsx` - Property name fixes
- `frontend/components/AutomatedReminders.tsx` - Backend email generation
- `frontend/components/EmailBodyGenerator.tsx` - New component

### New Files:

- `frontend/.env.local.example` - Environment configuration
- `test-backend-integration.js` - Integration testing

### 🔄 **Email Regeneration Feature**

The Mail tab now includes intelligent email regeneration:

1. **Generate Initial Email**: Create an email with your basic requirements
2. **Review & Improve**: If you want changes, click "Regenerate with Suggestions"
3. **Provide Feedback**: Enter specific improvements like:
   - "Make it more formal"
   - "Add RSVP deadline"
   - "Include dress code information"
   - "Make it shorter and more concise"
4. **Quick Suggestions**: Use pre-built suggestion buttons for common improvements
5. **AI Enhancement**: SmythOS will regenerate the email incorporating your feedback

**Example Workflow:**

```
1. Generate basic event invitation
2. Click "Regenerate with Suggestions"
3. Enter: "Add parking instructions and dress code"
4. AI generates improved email with parking and dress code details
```

Your Event Manager is now fully connected with your SmythOS-powered backend! 🎉
