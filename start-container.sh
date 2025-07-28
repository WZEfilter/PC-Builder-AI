#!/bin/bash

echo "Starting PC Builder AI in container..."

# Set environment variables
export NODE_ENV=production
export PATH="/usr/local/bin:$PATH"

# Create necessary directories
mkdir -p /var/log/supervisor
mkdir -p /var/log/nginx
mkdir -p /var/run

# Configure nginx
echo "Configuring nginx..."
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t
if [ $? -ne 0 ]; then
    echo "Nginx configuration test failed"
    exit 1
fi

# Start nginx
echo "Starting nginx..."
service nginx start

# Install frontend dependencies and start if needed
cd /app/frontend
if [ -f package.json ]; then
    echo "Installing frontend dependencies..."
    npm install --production
fi

# Start backend
echo "Starting backend..."
cd /app/backend
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
    print(f'Missing required environment variables: {missing_vars}')
    sys.exit(1)

print('Environment variables validated successfully')
"

# Start supervisord
echo "Starting supervisord..."
cd /app
supervisord -c supervisord.conf -n