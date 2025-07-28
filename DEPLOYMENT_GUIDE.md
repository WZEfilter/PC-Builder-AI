# PC Builder AI - Deployment Guide

## Nginx Welcome Page Issue

If you're seeing the "Welcome to nginx!" page instead of the application, this means nginx is serving its default page instead of proxying to your application. This is a common deployment issue.

## Root Cause
The deployment environment is using nginx as a reverse proxy, but it's not configured to route traffic to your application running on ports 3000 (frontend) and 8001 (backend).

## Solutions

### Option 1: Use the Provided Nginx Configuration
Copy the `nginx.conf` file from the project root to your deployment environment:

```bash
# Copy nginx configuration
cp /app/nginx.conf /etc/nginx/sites-available/pcbuilderai
ln -s /etc/nginx/sites-available/pcbuilderai /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### Option 2: Update Existing Nginx Configuration
Add this to your existing nginx configuration:

```nginx
server {
    listen 80 default_server;
    server_name _;
    
    # Frontend routes
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Backend API routes
    location /api {
        proxy_pass http://localhost:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option 3: Use Production Startup Script
Use the provided production startup script:

```bash
chmod +x /app/start-production.sh
./start-production.sh
```

## Port Configuration
The application runs on these ports:
- **Frontend**: Port 3000
- **Backend**: Port 8001
- **MongoDB**: Port 27017 (local) or Atlas (production)

## Environment Variables for Deployment
```bash
# Required
OPENROUTER_API_KEY=your_openrouter_api_key
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Optional
AFFILIATE_TAG_AMAZON=your_affiliate_tag
NODE_ENV=production
```

## Production Build Commands
```bash
# Build frontend for production
cd /app/frontend
NODE_ENV=production yarn build

# Start services
cd /app
supervisord -c supervisord.conf
```

## Troubleshooting

### Check if Application is Running
```bash
# Check services
supervisorctl status

# Test backend
curl http://localhost:8001/api/health

# Test frontend
curl -I http://localhost:3000
```

### Check Nginx Status
```bash
# Check nginx configuration
nginx -t

# Check nginx status
systemctl status nginx

# Check nginx logs
tail -f /var/log/nginx/error.log
```

### Check Application Logs
```bash
# Backend logs
tail -f /var/log/supervisor/backend.out.log

# Frontend logs
tail -f /var/log/supervisor/frontend.out.log
```

## Quick Fix for Nginx Issue

If you're still seeing the nginx welcome page:

1. **Remove default nginx site**:
   ```bash
   rm -f /etc/nginx/sites-enabled/default
   ```

2. **Copy provided nginx config**:
   ```bash
   cp /app/nginx.conf /etc/nginx/sites-available/pcbuilderai
   ln -s /etc/nginx/sites-available/pcbuilderai /etc/nginx/sites-enabled/
   ```

3. **Restart nginx**:
   ```bash
   nginx -t && systemctl reload nginx
   ```

4. **Ensure your application is running**:
   ```bash
   supervisorctl status
   ```

The nginx welcome page should now be replaced with your PC Builder AI application.

## Health Check Endpoints
- **Application**: `http://your-domain/health`
- **Backend**: `http://your-domain/api/health`
- **Database**: `http://your-domain/api/health/db`

These endpoints will help you verify that all components are working correctly after deployment.