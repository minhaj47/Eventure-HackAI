# Google Authentication Setup Guide

## Overview

Your authentication system has been updated to support Google OAuth through NextAuth.js on the frontend and a custom JWT-based backend. The system now stores user IDs and can handle both local authentication and Google OAuth.

## Backend Changes Made

### 1. Updated User Model

- Added `googleId` field for storing Google user IDs
- Added `image` field for user profile pictures
- Added `authProvider` field to distinguish between 'local' and 'google' users
- Made `password` field optional for Google OAuth users

### 2. New Authentication Controller

- Added `googleAuth` endpoint to handle Google OAuth users
- Added `getCurrentUser` endpoint to retrieve current user data
- Updated existing controllers to handle both auth types

### 3. Enhanced Authentication Middleware

- Better error handling and user validation
- Adds user data to request object for convenience

### 4. New Routes

- `POST /api/auth/google` - Handle Google OAuth login
- `GET /api/auth/me` - Get current authenticated user

## Frontend Changes Made

### 1. Enhanced NextAuth Configuration

- Automatic backend synchronization on Google sign-in
- Better error handling

### 2. New Authentication Hook (`useAuth`)

- `loginWithGoogle()` - Handle Google OAuth flow
- `logout()` - Logout from both frontend and backend
- `getCurrentUser()` - Fetch current user from backend
- `syncGoogleAuthWithBackend()` - Manual sync function

### 3. Authentication Component

- Ready-to-use `AuthButton` component
- Displays user info when authenticated
- Google sign-in button when not authenticated

## Setup Instructions

### 1. Environment Variables

**Backend (.env):**

```env
MONGODB_URI=mongodb://localhost:27017/event-manager
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local):**

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - Add your production domain when deploying

### 3. Using the Authentication System

#### In Components:

```tsx
import { useAuth } from "../hooks/useAuth";
import { AuthButton } from "../components";

function MyComponent() {
  const { user, isAuthenticated, loginWithGoogle, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div>
        <p>Welcome, {user?.name}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return <AuthButton />;
}
```

#### Protected API Routes:

```tsx
// Frontend API call with authentication
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/protected-route`,
  {
    method: "GET",
    credentials: "include", // Important for sending cookies
  }
);
```

#### Backend Protected Routes:

```javascript
import isAuth from "../middlewares/isAuth.js";

// Protect routes that need authentication
router.get("/protected", isAuth, (req, res) => {
  // req.userId contains the authenticated user's ID
  // req.user contains the full user object
  res.json({ user: req.user });
});
```

## User ID Storage

The system now properly stores and retrieves user IDs:

1. **Google Users**: Google ID is stored in `googleId` field, MongoDB `_id` used internally
2. **Local Users**: Only MongoDB `_id` used
3. **JWT Tokens**: Contain the MongoDB `_id` as `userId`
4. **Frontend Sessions**: NextAuth provides Google's `sub` as user ID
5. **Backend Sync**: Google users are synced with backend on sign-in

## Migration for Existing Users

If you have existing local users who want to link their Google accounts:

- When a Google user signs in with an email that matches an existing local account, the system will automatically link the accounts

## Security Features

- JWT tokens with expiration
- HTTP-only cookies for token storage
- CORS protection
- User validation on each request
- Automatic token cleanup on logout

## Testing

1. Start backend: `npm run dev` (in backend folder)
2. Start frontend: `npm run dev` (in frontend folder)
3. Visit `http://localhost:3000`
4. Test Google sign-in flow
5. Check that user data is properly stored in MongoDB

## Next Steps

1. Set up your Google OAuth credentials
2. Configure environment variables
3. Test the authentication flow
4. Update any existing components to use the new `AuthButton` component
5. Protect routes that need authentication using the `isAuth` middleware
