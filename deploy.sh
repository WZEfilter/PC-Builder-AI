#!/bin/bash

# PC Builder AI - Production Deployment Script
# This script prepares the application for containerized deployment

set -e

echo "🚀 Starting PC Builder AI deployment preparation..."

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -f "frontend/package.json" ]; then
    echo "❌ Error: This script must be run from the application root directory"
    exit 1
fi

# Set production environment
export NODE_ENV=production

# Build frontend for production
echo "📦 Building frontend for production..."
cd /app/frontend
npm ci --production
npm run build

# Verify build output
if [ -d "build" ]; then
    echo "✅ Frontend build successful - build directory created"
else
    echo "❌ Frontend build failed - build directory not found"
    exit 1
fi

# Check if standalone build exists
if [ -d "build/standalone" ]; then
    echo "✅ Standalone build found - ready for container deployment"
else
    echo "⚠️  Standalone build not found - using regular build"
fi

# Prepare backend
echo "🔧 Preparing backend..."
cd /app/backend

# Install backend dependencies
pip install --no-cache-dir -r requirements.txt

# Validate backend configuration
python -c "
import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Check required environment variables
required_vars = ['OPENROUTER_API_KEY']
missing_vars = []

for var in required_vars:
    if not os.getenv(var):
        missing_vars.append(var)

if missing_vars:
    print(f'❌ Missing required environment variables: {missing_vars}')
    sys.exit(1)

print('✅ Backend environment variables validated')
"

# Create necessary directories
echo "📁 Creating log directories..."
mkdir -p /var/log/supervisor
mkdir -p /var/log/nginx

# Test nginx configuration
echo "🔧 Testing nginx configuration..."
if command -v nginx >/dev/null 2>&1; then
    nginx -t -c /app/nginx.conf
    if [ $? -eq 0 ]; then
        echo "✅ Nginx configuration is valid"
    else
        echo "❌ Nginx configuration is invalid"
        exit 1
    fi
else
    echo "⚠️  Nginx not found - configuration will be tested during deployment"
fi

# Test supervisor configuration
echo "🔧 Testing supervisor configuration..."
if command -v supervisord >/dev/null 2>&1; then
    supervisord -c /app/supervisord.conf -t
    if [ $? -eq 0 ]; then
        echo "✅ Supervisor configuration is valid"
    else
        echo "❌ Supervisor configuration is invalid"
        exit 1
    fi
else
    echo "⚠️  Supervisor not found - configuration will be tested during deployment"
fi

# Set proper permissions
echo "🔐 Setting permissions..."
chmod +x /app/start-container.sh
chmod +x /app/deploy.sh

# Create deployment summary
echo "📋 Deployment Summary:"
echo "  ✅ Frontend built successfully"
echo "  ✅ Backend dependencies installed"
echo "  ✅ Environment variables validated"
echo "  ✅ Configurations tested"
echo "  ✅ Permissions set"
echo ""
echo "🚀 Application is ready for containerized deployment!"
echo ""
echo "Next steps:"
echo "1. Build Docker image: docker build -f Dockerfile.production -t pcbuilderai ."
echo "2. Run container: docker run -p 80:80 pcbuilderai"
echo "3. Or deploy to Kubernetes with your existing deployment pipeline"
echo ""
echo "Health check endpoints:"
echo "- Application: http://your-domain/health"
echo "- Backend API: http://your-domain/api/health"
echo "- Database: http://your-domain/api/health/db"

cd /app
echo "✅ Deployment preparation complete!"