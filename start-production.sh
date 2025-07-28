#!/bin/bash

# Production startup script for PC Builder AI

echo "Starting PC Builder AI in production mode..."

# Set production environment
export NODE_ENV=production

# Check if running in Docker/Kubernetes
if [ -f /.dockerenv ] || [ -n "${KUBERNETES_SERVICE_HOST}" ]; then
    echo "Running in containerized environment"
    
    # Use production ports for containerized deployment
    export FRONTEND_PORT=${PORT:-3000}
    export BACKEND_PORT=${BACKEND_PORT:-8001}
    
    # Build frontend for production
    cd /app/frontend
    echo "Building frontend for production..."
    yarn build
    
    # Start services with supervisor
    cd /app
    echo "Starting services with supervisor..."
    supervisord -c supervisord.conf
else
    echo "Running in development environment"
    
    # Use development ports
    export FRONTEND_PORT=3000
    export BACKEND_PORT=8001
    
    # Start services with supervisor
    supervisord -c supervisord.conf
fi

echo "PC Builder AI started successfully"