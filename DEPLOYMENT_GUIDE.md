# Eventure-HackAI Deployment Guide

This guide provides step-by-step instructions to deploy your Eventure-HackAI application to various cloud platforms.

## Project Architecture

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS
- **Backend**: Express.js 5 with MongoDB, JWT Authentication
- **Features**: Google Classroom integration, Form generation, AI content generation, Slack integration

## Prerequisites

Before deploying, ensure you have:
- [ ] MongoDB database (Atlas recommended for production)
- [ ] Environment variables configured
- [ ] Google OAuth credentials
- [ ] SmythOS API keys
- [ ] Domain name (optional but recommended)

## Environment Variables Setup

### Backend Environment Variables (.env)
Create a `.env` file in the `backend/` directory:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventure
PORT=8000

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# SmythOS API
SMYTHOS_API_URL=https://cmfw5qbmfxvnkjxgtpjoabofw.agent.pa.smyth.ai
SMYTHOS_API_KEY=your-smythos-api-key

# CORS Origin
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend Environment Variables (.env.local)
Create a `.env.local` file in the `frontend/` directory:

```env
# Backend API
NEXT_PUBLIC_API_URL=https://your-backend-domain.com

# NextAuth.js
NEXTAUTH_URL=https://your-frontend-domain.com
NEXTAUTH_SECRET=your-nextauth-secret

# Google OAuth (same as backend)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Deployment Options

## Option 1: Vercel + Railway (Recommended)

### Deploy Frontend to Vercel

1. **Connect to Vercel**:
   ```bash
   npm install -g vercel
   cd frontend
   vercel
   ```

2. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Environment Variables in Vercel**:
   - Go to your Vercel dashboard
   - Navigate to Settings → Environment Variables
   - Add all frontend environment variables

### Deploy Backend to Railway

1. **Connect to Railway**:
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Deploy**:
   ```bash
   cd backend
   railway up
   ```

3. **Configure Railway**:
   - Set environment variables in Railway dashboard
   - Configure custom domain if needed

## Option 2: Docker + DigitalOcean/AWS

### Create Docker Files

1. **Backend Dockerfile**:
```dockerfile
# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
```

2. **Frontend Dockerfile**:
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public

RUN npm install --production

EXPOSE 3000

CMD ["npm", "start"]
```

3. **Docker Compose** (for local testing):
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - ./frontend/.env.local
    depends_on:
      - backend
```

### Deploy to DigitalOcean App Platform

1. **Connect Repository**:
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository

2. **Configure Services**:
   - **Backend Service**:
     - Source: `backend/`
     - Build Command: `npm install`
     - Run Command: `npm start`
     - Port: 8000
   
   - **Frontend Service**:
     - Source: `frontend/`
     - Build Command: `npm run build`
     - Run Command: `npm start`
     - Port: 3000

3. **Environment Variables**:
   - Add all required environment variables
   - Ensure CORS settings allow frontend domain

## Option 3: Manual VPS Deployment

### Server Setup (Ubuntu 20.04+)

1. **Install Dependencies**:
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y

# Install SSL certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
```

2. **Clone and Setup Project**:
```bash
git clone https://github.com/minhaj47/Eventure-HackAI.git
cd Eventure-HackAI

# Setup backend
cd backend
npm install
# Add your .env file
pm2 start index.js --name "eventure-backend"

# Setup frontend
cd ../frontend
npm install
npm run build
pm2 start npm --name "eventure-frontend" -- start
```

3. **Configure Nginx**:
```nginx
# /etc/nginx/sites-available/eventure
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **Enable Site and SSL**:
```bash
sudo ln -s /etc/nginx/sites-available/eventure /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL
sudo certbot --nginx -d your-domain.com
```

## Database Setup (MongoDB Atlas)

1. **Create Cluster**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a new cluster (M0 free tier available)
   - Create database user
   - Configure IP whitelist (0.0.0.0/0 for all IPs)

2. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password

## Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB database accessible
- [ ] Google OAuth credentials set up
- [ ] SmythOS API keys working
- [ ] CORS configured for frontend domain
- [ ] Build process completes without errors
- [ ] Health checks implemented
- [ ] Error monitoring set up (optional: Sentry)

## Post-deployment Steps

1. **Test Functionality**:
   - [ ] User authentication works
   - [ ] Event creation functions
   - [ ] Google Classroom integration
   - [ ] Form generation
   - [ ] AI content generation
   - [ ] File uploads work

2. **Performance Optimization**:
   - Enable compression in Nginx
   - Configure CDN (Cloudflare recommended)
   - Set up caching strategies
   - Monitor application performance

3. **Security**:
   - Configure firewall rules
   - Set up regular backups
   - Monitor security logs
   - Update dependencies regularly

## Troubleshooting

### Common Issues:

1. **CORS Errors**:
   - Check FRONTEND_URL in backend .env
   - Verify CORS middleware configuration

2. **Database Connection**:
   - Verify MongoDB connection string
   - Check IP whitelist in Atlas
   - Ensure database user has proper permissions

3. **Build Failures**:
   - Check Node.js version compatibility
   - Clear node_modules and reinstall
   - Verify all dependencies are listed in package.json

4. **Authentication Issues**:
   - Verify Google OAuth credentials
   - Check redirect URIs in Google Console
   - Ensure NEXTAUTH_URL is correct

## Monitoring and Maintenance

1. **Set up monitoring**:
   - Use PM2 for process monitoring
   - Configure log rotation
   - Set up uptime monitoring (UptimeRobot)

2. **Regular maintenance**:
   - Update dependencies monthly
   - Monitor database performance
   - Review and rotate secrets
   - Backup database regularly

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test API endpoints manually
4. Check database connectivity

Remember to update this guide as your application evolves and new deployment requirements emerge.