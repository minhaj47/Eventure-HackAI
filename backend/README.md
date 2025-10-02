# Eventure-HackAI Backend API 🔧

**Express.js 5.1.0 REST API** - Robust backend service for the Eventure-HackAI platform with SmythOS AI integration, MongoDB database, and comprehensive Google services connectivity.

## ✨ Key Features

### 🤖 AI Integration
- **SmythOS Orchestration**: Advanced AI agent communication
- **Google Generative AI**: v0.24.1 for intelligent content generation
- **Multi-Agent Workflows**: Seamless AI task coordination
- **Real-time Processing**: Fast AI response integration

### 🔐 Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **bcryptjs Hashing**: Password security with salt rounds
- **Google OAuth**: Integration with NextAuth.js frontend
- **CORS Configuration**: Secure cross-origin request handling

### 📊 Database & Storage
- **MongoDB**: Document-based data storage with Mongoose ODM v8.16.4
- **Cloudinary**: File upload and image management v2.7.0
- **Multer**: Efficient file processing v2.0.2
- **Data Validation**: Comprehensive schema validation

## 🛠️ Tech Stack

- **Runtime**: Node.js with ES Modules (`"type": "module"`)
- **Framework**: Express.js 5.1.0
- **Database**: MongoDB with Mongoose 8.16.4
- **Authentication**: JWT + bcryptjs 3.0.2
- **File Upload**: Cloudinary 2.7.0 + Multer 2.0.2
- **HTTP Client**: Axios 1.10.0
- **Date Handling**: Moment.js 2.30.1
- **Development**: Nodemon 3.1.10

## 📋 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /signup` - User registration
- `POST /signin` - User login
- `POST /google` - Google OAuth integration
- `GET /logout` - User logout
- `GET /me` - Current user profile

### Event Management (`/api/event`)
- `GET /all` - Retrieve user events
- `POST /add` - Create new event
- `PUT /update/:eventId` - Update event details
- `DELETE /delete/:eventId` - Delete event
- `POST /generate-google-form` - AI form generation

### AI Services (`/api/email`, `/api/classroom`)
- `POST /generate_email_body` - SmythOS email generation
- `POST /send_single_email` - Email delivery
- `POST /create` - Google Classroom creation
- `POST /add_classroom_announcement` - Classroom announcements

### Utility Services (`/api/contact`, `/api/proxy`)
- `POST /extract_all_contacts` - Google Sheets integration
- `GET /image` - Image proxy service
- `POST /upload` - File upload to Cloudinary

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18 or higher
- **MongoDB**: Local or Atlas instance
- **Google Cloud Project**: For APIs access
- **SmythOS Account**: AI agent configuration
- **Cloudinary Account**: File storage service

### Installation

1. **Install Dependencies**:
```bash
cd backend
npm install
```

2. **Environment Configuration**:
```bash
# Create .env file with required variables
PORT=5000
MONGODB_URI=mongodb://localhost:27017/eventure
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# SmythOS AI
SMYTHOS_API_URL=https://cmfw5qbmfxvnkjxgtpjoabofw.agent.a.smyth.ai
SMYTHOS_GOOGLE_FORM_URL=https://cmfw5qbmfxvnkjxgtpjoabofw.agent.a.smyth.ai/api/generate_google_form
SMYTHOS_GOOGLE_MEET_URL=https://cmfw5qbmfxvnkjxgtpjoabofw.agent.a.smyth.ai/api/create_google_meet

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

3. **Development Server**:
```bash
# Start with nodemon (auto-restart)
npm run dev

# Start production server
npm start

# Alternative development mode
npm run dev-fallback
```

## 📁 Project Structure

```
backend/
├── index.js              # Main application entry point
├── config/               # Configuration modules
│   ├── cloudinary.js    # Cloudinary setup
│   ├── db.js            # MongoDB connection
│   └── token.js         # JWT configuration
├── controllers/         # Route controllers
│   ├── auth.controller.js
│   ├── event.controller.js
│   ├── email.controller.js
│   └── classroom.controller.js
├── middlewares/         # Express middleware
│   ├── isAuth.js       # Authentication middleware
│   └── multer.js       # File upload middleware
├── models/             # Mongoose data models
│   ├── user.model.js
│   ├── event.model.js
│   └── course.model.js
├── routes/             # API route definitions
└── services/           # External service integrations
```

## 🔧 Development

### Scripts
```bash
npm run dev        # Development with nodemon
npm start          # Production server
npm run dev-fallback  # Alternative dev mode with --watch
```

### Key Features
- **ES Modules**: Modern JavaScript module system
- **Auto-restart**: Nodemon for development efficiency
- **Error Handling**: Comprehensive error management
- **Request Logging**: Detailed API request tracking
- **CORS Security**: Configurable cross-origin policies

## 🧪 Testing

```bash
# Test API endpoints
cd ../
node test-backend-integration.js

# Test specific features
node test-google-form-api.js
node test-announcement-api.js
```

## 🚀 Deployment

### Environment Variables
Ensure all production environment variables are configured:
- Database connection strings
- API keys and secrets
- SmythOS agent URLs
- CORS origins for frontend domain

### Production Considerations
- **Database**: Use MongoDB Atlas for production
- **Security**: Rotate JWT secrets regularly
- **Monitoring**: Implement logging and monitoring
- **Scaling**: Consider load balancing for high traffic

---

**🎯 Production Ready**: Robust, scalable backend with AI integration and comprehensive API coverage.