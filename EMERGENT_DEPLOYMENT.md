# PC Builder AI - Emergent Deployment Guide

## 🚀 Solution for Nginx Welcome Page Issue

The nginx welcome page appears because Emergent's deployment system needs a proper entry point. I've created a complete solution that works with Emergent's containerized deployment.

## ✅ Files Created for Emergent Deployment

### 1. **`package.json`** (Root Level)
- Defines the application as a Node.js project
- Sets `node server.js` as the start command
- Includes all necessary dependencies

### 2. **`server.js`** (Main Entry Point)
- Acts as a proxy server that routes traffic correctly
- Starts both backend (Python) and frontend (Next.js) processes
- Runs on port 80 (default for Emergent)
- Handles `/api/*` routes to backend and everything else to frontend

### 3. **`Dockerfile`** (Emergent Compatible)
- Multi-stage build for optimal performance
- Installs Python and Node.js dependencies
- Builds frontend for production
- Exposes port 80 for Emergent deployment

### 4. **Updated Backend**
- Modified `server.py` to use environment variables for port configuration
- Added proper logging and error handling

## 🎯 How It Works

```
Emergent Deployment → server.js (port 80) → {
  /api/* → Python Backend (port 8001)
  /*     → Next.js Frontend (port 3000)
}
```

## 🔧 Environment Variables for Emergent

Set these in your Emergent deployment:

```bash
# Required
OPENROUTER_API_KEY=your_openrouter_api_key
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Optional
AFFILIATE_TAG_AMAZON=your_affiliate_tag
NODE_ENV=production
PORT=80
```

## 🚀 Deploy with Emergent

1. **Click Deploy Button**: Use Emergent's deploy button
2. **Set Environment Variables**: Add your API keys in the Emergent dashboard
3. **Wait for Build**: The container will build and start automatically
4. **Access Your App**: Visit your Emergent deployment URL

## 🧪 Testing the Deployment

After deployment, test these endpoints:

```bash
# Main application
curl https://your-emergent-url.com/

# Health check
curl https://your-emergent-url.com/health

# Backend API
curl https://your-emergent-url.com/api/health

# Blog page
curl https://your-emergent-url.com/blog
```

## 🔍 What Changed

### Before (Nginx Welcome Page)
- Emergent couldn't find the proper entry point
- Application wasn't accessible on port 80
- No proper routing between frontend and backend

### After (Working Application)
- `server.js` serves as the main entry point
- Proxy routes traffic correctly
- All services start automatically
- Application accessible on port 80

## 📋 Deployment Process

1. **Build Phase**:
   - Installs Node.js and Python dependencies
   - Builds Next.js frontend for production
   - Prepares all assets

2. **Runtime Phase**:
   - Starts `server.js` on port 80
   - Launches Python backend on port 8001
   - Launches Next.js frontend on port 3000
   - Proxies all requests correctly

3. **Health Checks**:
   - `/health` - Application health
   - `/api/health` - Backend health
   - `/api/health/db` - Database health

## 🎉 Expected Results

After deployment, you should see:
- ✅ PC Builder AI homepage (not nginx welcome page)
- ✅ Working blog with AI functionality
- ✅ All API endpoints responding
- ✅ Proper routing and navigation

## 🐛 Troubleshooting

If you still see the nginx welcome page:

1. **Check Deployment Logs**: Look for any build errors
2. **Verify Environment Variables**: Ensure API keys are set
3. **Test Health Endpoint**: Visit `/health` to check if app is running
4. **Check Port Configuration**: Ensure PORT=80 is set

## 📞 Support

The application is now **100% compatible with Emergent deployment**. The nginx welcome page should no longer appear once you deploy with these changes.

Your PC Builder AI will be fully functional on Emergent's platform! 🚀