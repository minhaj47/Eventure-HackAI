#!/bin/bash

# Eventure-HackAI Deployment Script
# This script deploys the application using Docker Compose

set -e

echo "🚀 Starting Eventure-HackAI Deployment..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to check if .env files exist
check_env_files() {
    if [ ! -f "backend/.env" ]; then
        echo "⚠️  Backend .env file not found. Creating template..."
        cat > backend/.env << EOF
# Database
MONGODB_URI=mongodb://root:password123@mongodb:27017/eventure?authSource=admin
PORT=8000

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key-change-this

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# SmythOS API
SMYTHOS_API_URL=https://cmfw5qbmfxvnkjxgtpjoabofw.agent.pa.smyth.ai
SMYTHOS_API_KEY=your-smythos-api-key

# CORS
FRONTEND_URL=http://localhost:3000
EOF
        echo "📝 Please edit backend/.env with your actual values before continuing."
    fi

    if [ ! -f "frontend/.env.local" ]; then
        echo "⚠️  Frontend .env.local file not found. Creating template..."
        cat > frontend/.env.local << EOF
# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-change-this

# Google OAuth (same as backend)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
EOF
        echo "📝 Please edit frontend/.env.local with your actual values before continuing."
    fi
}

# Function to build and start services
deploy_services() {
    echo "🔨 Building Docker images..."
    docker-compose build

    echo "🚀 Starting services..."
    docker-compose up -d

    echo "⏳ Waiting for services to be ready..."
    sleep 30

    echo "🔍 Checking service status..."
    docker-compose ps
}

# Function to show deployment status
show_status() {
    echo ""
    echo "📊 Deployment Status:"
    echo "===================="
    
    # Check if containers are running
    if docker-compose ps | grep -q "Up"; then
        echo "✅ Services are running!"
        echo ""
        echo "🌐 Access your application:"
        echo "   Frontend: http://localhost:3000"
        echo "   Backend API: http://localhost:8000"
        echo "   MongoDB: localhost:27017"
        echo ""
        echo "📋 Useful commands:"
        echo "   View logs: docker-compose logs -f [service-name]"
        echo "   Stop services: docker-compose down"
        echo "   Restart: docker-compose restart"
        echo "   Update: docker-compose pull && docker-compose up -d"
    else
        echo "❌ Some services failed to start. Check logs:"
        echo "   docker-compose logs"
    fi
}

# Function to setup development environment
setup_dev() {
    echo "🛠️  Setting up development environment..."
    
    # Install dependencies
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
    
    echo "📦 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
    
    echo "✅ Development environment ready!"
    echo "   Start backend: cd backend && npm run dev"
    echo "   Start frontend: cd frontend && npm run dev"
}

# Main deployment flow
main() {
    case "${1:-deploy}" in
        "deploy")
            check_env_files
            deploy_services
            show_status
            ;;
        "dev")
            setup_dev
            ;;
        "stop")
            echo "🛑 Stopping services..."
            docker-compose down
            ;;
        "logs")
            docker-compose logs -f
            ;;
        "restart")
            echo "🔄 Restarting services..."
            docker-compose restart
            show_status
            ;;
        "clean")
            echo "🧹 Cleaning up..."
            docker-compose down -v
            docker system prune -f
            ;;
        *)
            echo "Usage: $0 {deploy|dev|stop|logs|restart|clean}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Deploy with Docker Compose (default)"
            echo "  dev      - Setup development environment"
            echo "  stop     - Stop all services"
            echo "  logs     - Show service logs"
            echo "  restart  - Restart all services"
            echo "  clean    - Clean up containers and volumes"
            exit 1
            ;;
    esac
}

main "$@"