# Frontend Environment Setup 🔧

**Next.js 15.5.3 Configuration Guide** - Complete environment setup for the Eventure-HackAI frontend with NextAuth.js, Google OAuth, and SmythOS integration.

## 📋 Required Environment Variables

Create a `.env.local` file in the **frontend** directory with the following variables:

```bash
# NextAuth.js v4.24.11 Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-min-32-chars

# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000

# Production Configuration (for deployment)
# NEXTAUTH_URL=https://your-frontend-domain.com
# NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## 🛠️ Development vs Production Configuration

### Development Environment
- **Frontend**: `http://localhost:3000` (Next.js dev server with Turbopack)
- **Backend**: `http://localhost:5000` (Express.js with nodemon)
- **Database**: Local MongoDB or MongoDB Atlas

### Production Environment  
- **Frontend**: Your Vercel/Netlify domain
- **Backend**: Your Railway/Render/AWS domain
- **Database**: MongoDB Atlas (recommended)

## How to Get Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret to your `.env.local` file

## NextAuth Secret

Generate a random secret for NextAuth:

```bash
openssl rand -base64 32
```

Or use any random string generator.

## Troubleshooting OAuth Issues

If you're experiencing OAuth authentication errors:

1. **Check Google OAuth Setup:**
   - Verify redirect URIs are correctly configured
   - Ensure OAuth consent screen is configured
   - Check that the Google+ API is enabled

2. **Verify Environment Variables:**
   - Make sure all required variables are set in `.env.local`
   - Restart the development server after adding environment variables

3. **Network Issues:**
   - Ensure backend server is running on port 5000
   - Check CORS configuration allows frontend domain
   - Verify firewall/network settings allow local connections

4. **Common Error Solutions:**
   - `AggregateError`: Usually indicates backend connection issues
   - `AccessDenied`: Check OAuth credentials and redirect URIs
   - `OAuthSignin`: Verify Google OAuth configuration
