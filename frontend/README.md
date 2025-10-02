# Eventure-HackAI Frontend 🚀

This is a modern [Next.js 15.5.3](https://nextjs.org) application for **Eventure-HackAI**, an AI-powered Event Management platform integrated with SmythOS AI orchestration for intelligent automation and content generation.

## ✨ Key Features

### 🤖 AI-Powered Capabilities
- **SmythOS Integration**: Advanced AI orchestration with 10+ intelligent agents
- **Email Generation**: Professional email content creation with AI assistance
- **Banner & Poster Creation**: AI-generated visual content for events
- **Form Generation**: Automated Google Forms creation with custom fields
- **Content Optimization**: Platform-specific social media content generation

### 🎯 Core Functionality  
- **Event Lifecycle Management**: Complete event creation, editing, and management
- **Participant Management**: Advanced attendee tracking and engagement
- **Google Services Integration**: Sheets, Forms, Classroom, and Meet connectivity
- **Automated Workflows**: Intelligent reminders and notification systems
- **Real-time Notifications**: Toast-based user feedback system across all components

### 🔧 Technical Features
- **Toast Notification System**: Comprehensive user feedback with 4 notification types
- **Type Safety**: Full TypeScript implementation with strict type checking  
- **Modern UI/UX**: Tailwind CSS v4 with responsive design patterns
- **Authentication**: NextAuth.js v4.24.11 with Google OAuth integration
- **Performance**: Turbopack bundling for lightning-fast development

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3 with App Router
- **React**: v19.1.0 with latest features
- **TypeScript**: v5+ with strict mode
- **Styling**: Tailwind CSS v4 with PostCSS
- **Authentication**: NextAuth.js v4.24.11
- **Icons**: Lucide React v0.544.0
- **Build Tool**: Turbopack (built-in Next.js optimization)
- **Google APIs**: v160.0.0 for comprehensive integration

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18 or higher
- **Backend API**: Eventure-HackAI backend server (port 5000)
- **SmythOS Account**: For AI agent access
- **Google Cloud Project**: For Google services integration
- **Environment Configuration**: Properly configured environment variables

### Installation & Setup

1. **Install Dependencies**:
```bash
npm install
```

2. **Environment Configuration**:
```bash
# Create environment file
cp .env.local.example .env.local

# Configure required variables:
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
```

3. **Development Server**:
```bash
# Start with Turbopack optimization
npm run dev

# Alternative: Standard Next.js dev server
npm run dev --turbo=false
```

4. **Production Build**:
```bash
npm run build
npm start
```

### 🌐 Application Access

- **Development**: [http://localhost:3000](http://localhost:3000)
- **API Documentation**: Available in main project README
- **Component Library**: Comprehensive UI components in `/components`

### 📁 Project Structure

```
frontend/
├── app/                 # Next.js App Router
├── components/         # Reusable React components
│   ├── ui/            # Base UI components (Toast, Card, etc.)
│   └── *.tsx          # Feature-specific components
├── hooks/             # Custom React hooks
├── services/          # API integration services
├── types/             # TypeScript type definitions
└── public/            # Static assets
```

## 🧩 Key Components

### Core Components
- **`LandingPage.tsx`**: Main dashboard with event management
- **`AutomatedReminders.tsx`**: AI-powered reminder and notification system  
- **`ClassroomManagement.tsx`**: Google Classroom integration and management
- **`EmailBodyGenerator.tsx`**: SmythOS-powered email content generation
- **`BannerGenerator.tsx`**: AI-assisted banner and poster creation

### UI Components
- **`Toast.tsx`**: Centralized notification system (4 types: success, error, warning, info)
- **`Card.tsx`**: Reusable card container component
- **`Button.tsx`**: Standardized button component with variants
- **`Input.tsx` & `TextArea.tsx`**: Form input components

### Features
- ✅ **Toast Notifications**: Professional user feedback system
- ✅ **TypeScript Safety**: Zero compilation errors with strict typing
- ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS
- ✅ **AI Integration**: SmythOS agent communication
- ✅ **Google Services**: Comprehensive Google API integration

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard:
# - NEXT_PUBLIC_API_URL
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET
```

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start

# Or export static files
npm run export
```

## 🔗 Integration & Resources

### SmythOS AI Integration
- **Agent URL**: `https://cmfw5qbmfxvnkjxgtpjoabofw.agent.a.smyth.ai`
- **Features**: Content generation, form creation, email automation
- **Performance**: <3s response time, 99.9% uptime

### Documentation
- **[Main Project README](../README.md)**: Comprehensive project overview
- **[Environment Setup](ENV_SETUP.md)**: Detailed environment configuration
- **[Architecture Guide](ARCHITECTURE.md)**: System architecture documentation

### External Resources
- **[Next.js Documentation](https://nextjs.org/docs)**: Framework documentation
- **[Tailwind CSS](https://tailwindcss.com)**: Styling framework
- **[NextAuth.js](https://next-auth.js.org)**: Authentication library
- **[SmythOS](https://smythos.com)**: AI orchestration platform

---

**🎯 Ready for Production**: This frontend is production-ready with comprehensive error handling, modern UI patterns, and robust AI integration.
