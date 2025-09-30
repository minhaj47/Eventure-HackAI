# Eventure-HackAI 🎉

**AI-Powered Event Management Platform** - A comprehensive solution for event creation, management, and automation with Google Classroom integration, SmythOS AI capabilities, and automated notification systems.

![Project Banner](https://img.shields.io/badge/Eventure--HackAI-AI%20Event%20Management-blue?style=for-the-badge)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Activity Flow](#activity-flow)
- [Tech Stack](#tech-stack)
- [API Documentation](#api-documentation)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

Eventure-HackAI is an intelligent event management platform that leverages AI to streamline event planning, automate communications, and integrate seamlessly with Google services. The platform provides end-to-end event management capabilities from creation to participant engagement.

### Key Capabilities:
- 🤖 **AI-Powered Email Generation** - Smart content creation using SmythOS
- 📊 **Google Sheets Integration** - Contact extraction and management
- 🏫 **Google Classroom Integration** - Educational event management
- 📝 **Google Forms Generation** - Automated registration forms
- 🔔 **Automated Notifications** - Smart reminders and updates
- 👤 **User Authentication** - Secure login with Google OAuth

## ✨ Features

### 🎯 Core Features
- **Event Creation & Management** - Create, update, delete, and manage events
- **AI Assistant** - SmythOS-powered intelligent assistant for event planning
- **Participant Management** - Track attendees and manage registrations
- **Automated Email Generation** - AI-generated professional emails and invitations
- **Google Classroom Integration** - Sync with Google Classroom for educational events
- **Contact Management** - Extract and organize contacts from Google Sheets
- **Form Generation** - Automatically create Google Forms for event registration

### 🔧 Advanced Features
- **Bulk Notifications** - Send updates to multiple participants
- **Event Reminders** - Automated reminder system
- **Real-time Updates** - Live event information synchronization
- **Multi-platform Integration** - Google services ecosystem integration
- **Responsive Design** - Mobile-friendly interface
- **Security** - JWT authentication and secure API endpoints

## 🏗️ System Architecture

### Frontend (Next.js 15)
```
┌─────────────────────────────────────────┐
│                Frontend                 │
├─────────────────────────────────────────┤
│ • Next.js 15 with React 19             │
│ • TypeScript for type safety           │
│ • Tailwind CSS for styling             │
│ • NextAuth.js for authentication       │
│ • Google APIs integration              │
└─────────────────────────────────────────┘
```

### Backend (Express.js)
```
┌─────────────────────────────────────────┐
│                Backend                  │
├─────────────────────────────────────────┤
│ • Express.js 5 REST API                │
│ • MongoDB with Mongoose ODM            │
│ • JWT Authentication                   │
│ • SmythOS AI Integration               │
│ • Google Services APIs                 │
│ • Cloudinary for file uploads          │
└─────────────────────────────────────────┘
```

## 📊 Database Schema

![ER Diagram](er_iman.pdf)

### Core Models:

#### User Model
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  googleId: String,
  image: String,
  authProvider: String,
  assistantImage: String,
  assistantName: String
}
```

#### Event Model
```javascript
{
  userId: ObjectId,
  eventName: String,
  description: String,
  dateTime: Date,
  location: String,
  maxParticipants: Number,
  currentParticipants: Number,
  eventType: String,
  classroomData: Object,
  registrationFormUrl: String,
  registrationFormEditUrl: String
}
```

#### Course Model
```javascript
{
  courseId: String,
  name: String,
  section: String,
  descriptionHeading: String,
  description: String,
  room: String,
  ownerId: String,
  creationTime: String,
  updateTime: String,
  courseState: String,
  alternateLink: String
}
```

## 🔄 Activity Flow

![Activity Diagram](activity_dg_iman.svg)

The activity diagram illustrates the complete user journey from authentication through event creation, management, and participant engagement.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js
- **UI Components**: Lucide React Icons
- **Google APIs**: Google APIs for Sheets, Forms, and Classroom

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcryptjs
- **AI Integration**: SmythOS, Google Generative AI
- **Cloud Storage**: Cloudinary
- **File Processing**: Multer

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (reverse proxy)
- **Process Management**: PM2
- **Environment**: dotenv for configuration

## 📚 API Documentation

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/signup` | User registration | ❌ |
| POST | `/signin` | User login | ❌ |
| POST | `/google` | Google OAuth login | ❌ |
| GET | `/logout` | User logout | ❌ |
| GET | `/me` | Get current user | ✅ |

### Event Routes (`/api/event`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/all` | Get user's events | ✅ |
| POST | `/add` | Create new event | ✅ |
| PUT | `/update/:eventId` | Update event | ✅ |
| DELETE | `/delete/:eventId` | Delete event | ✅ |
| GET | `/participants/:eventId` | Get event participants | ✅ |
| POST | `/send-update` | Send event update | ❌ |
| POST | `/bulk-notification` | Send bulk notifications | ❌ |
| POST | `/send-reminder` | Send event reminders | ❌ |
| POST | `/generate-google-form` | Generate Google Form | ✅ |
| POST | `/:eventId/generate-registration-form` | Generate registration form | ✅ |
| GET | `/google-form-config` | Check Google Form config | ✅ |

### User Routes (`/api/user`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/current` | Get current user info | ✅ |
| POST | `/update` | Update user profile | ✅ |
| POST | `/asktoassistant` | Ask AI assistant | ✅ |

### Email Routes (`/api/email`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/generate_email_body` | Generate AI email | ❌ |
| POST | `/send_single_email` | Send single email | ❌ |

### Classroom Routes (`/api/classroom`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/create` | Create Google Classroom | ✅ |
| POST | `/add_classroom_announcement` | Add classroom announcement | ✅ |

### Contact Routes (`/api/contact`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/extract_all_contacts` | Extract contacts from sheets | ❌ |

### Proxy Routes (`/api/proxy`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Proxy image requests | ❌ |

## 🚀 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Google Cloud Platform account
- SmythOS account
- Cloudinary account

### 1. Clone the Repository
```bash
git clone https://github.com/minhaj47/Eventure-HackAI.git
cd Eventure-HackAI
```

### 2. Install Dependencies

**Backend Setup:**
```bash
cd backend
npm install
```

**Frontend Setup:**
```bash
cd ../frontend
npm install
```

### 3. Environment Configuration

**Backend Environment (`.env`):**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/eventure
PORT=5000

# Authentication
JWT_SECRET=your-super-secret-jwt-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# SmythOS
SMYTHOS_API_URL=your-smythos-agent-url
SMYTHOS_API_KEY=your-smythos-api-key
SMYTHOS_GOOGLE_FORM_URL=your-smythos-form-agent-url

# CORS
FRONTEND_URL=http://localhost:3000
```

**Frontend Environment (`.env.local`):**
```env
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:5000

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 4. Start the Application

**Development Mode:**
```bash
# Start backend (terminal 1)
cd backend
npm run dev

# Start frontend (terminal 2)
cd frontend
npm run dev
```

**Production Mode:**
```bash
# Build and start backend
cd backend
npm start

# Build and start frontend
cd frontend
npm run build
npm start
```

### 5. Docker Deployment (Optional)
```bash
# Run with Docker Compose
docker-compose up -d
```

## 🔧 Environment Setup

For detailed environment setup instructions, see:
- [Google Authentication Setup](GOOGLE_AUTH_SETUP.md)
- [Frontend Environment Setup](frontend/ENV_SETUP.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

## 📖 Usage

### 1. User Registration/Login
- Sign up with email/password or Google OAuth
- Authenticate to access protected features

### 2. Event Creation
- Navigate to the dashboard
- Click "Create Event"
- Fill in event details
- Generate registration forms automatically

### 3. AI Assistant
- Use the AI assistant for event planning suggestions
- Generate professional emails and invitations
- Get recommendations for event improvements

### 4. Google Classroom Integration
- Connect your Google Classroom
- Sync events with classroom courses
- Manage educational events seamlessly

### 5. Participant Management
- View event participants
- Send bulk notifications
- Extract contacts from Google Sheets
- Generate and share registration forms

## 🔍 API Testing

Test the API endpoints using the provided test scripts:

```bash
# Test backend integration
node test-backend-integration.js

# Test complete flow
node test-complete-flow.js

# Test API endpoints
node test-api.js
```

## 🐳 Docker Support

The project includes Docker configuration for easy deployment:

```yaml
# docker-compose.yml includes:
- Frontend service (Next.js)
- Backend service (Express.js)
- Nginx reverse proxy
- MongoDB database
```

## 📄 Documentation

- **[Integration Guide](INTEGRATION_GUIDE.md)** - Complete integration walkthrough
- **[API Documentation](GOOGLE_FORM_API.md)** - Detailed API reference
- **[Deployment Guide](DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Event Update API](backend/EVENT_UPDATE_API.md)** - Event notification API details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- 📧 Team Lead: [abdullahalmahadiapurbo@gmail.com](mailto:abdullahalmahadiapurbo@gmail.com)
- 💬 GitHub Issues: [Create an issue](https://github.com/minhaj47/Eventure-HackAI/issues)

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SmythOS** - AI integration platform
- **Google Cloud Platform** - Cloud services and APIs
- **MongoDB** - Database solution
- **Vercel** - Frontend hosting platform
- **Railway** - Backend hosting platform

---

**Made with ❤️ by Team Iman**

### 👥 Team Members:
- **[Abdullah Al Mahadi](https://github.com/md-abdullah-92)** - Team Lead & Backend Developer
- **[Minhaj](https://github.com/minhaj47)** - Repository Owner & Developer
- **[Mahfuj](https://github.com/mahfujalam77452)** - Full Stack Developer

![GitHub stars](https://img.shields.io/github/stars/minhaj47/Eventure-HackAI?style=social)
![GitHub forks](https://img.shields.io/github/forks/minhaj47/Eventure-HackAI?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/minhaj47/Eventure-HackAI?style=social)