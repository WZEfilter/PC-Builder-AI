const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting PC Builder AI...');
console.log('📊 Environment:', process.env.NODE_ENV || 'development');
console.log('🌐 Port:', PORT);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS middleware
app.use(cors({
  origin: true,
  credentials: true
}));

// JSON parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (immediate response)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'PC Builder AI is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Serve static files from frontend build if available
const frontendBuildPath = path.join(__dirname, 'frontend', 'build');
if (fs.existsSync(frontendBuildPath)) {
  console.log('📦 Serving static files from build directory');
  app.use(express.static(frontendBuildPath));
}

// Start backend service
let backendProcess;
function startBackend() {
  console.log('🔧 Starting backend service...');
  
  backendProcess = spawn('python', ['server.py'], {
    cwd: path.join(__dirname, 'backend'),
    env: {
      ...process.env,
      PYTHONPATH: path.join(__dirname, 'backend'),
      BACKEND_PORT: '8001',
      BACKEND_HOST: '0.0.0.0',
    },
    stdio: 'pipe'
  });

  backendProcess.stdout.on('data', (data) => {
    console.log(`[Backend] ${data.toString().trim()}`);
  });

  backendProcess.stderr.on('data', (data) => {
    console.error(`[Backend] ${data.toString().trim()}`);
  });

  backendProcess.on('error', (err) => {
    console.error('❌ Backend error:', err.message);
  });

  backendProcess.on('exit', (code) => {
    console.log(`⚠️ Backend exited with code ${code}`);
  });
}

// Start frontend service
let frontendProcess;
function startFrontend() {
  console.log('🔧 Starting frontend service...');
  
  const frontendStandalonePath = path.join(__dirname, 'frontend', 'build', 'standalone');
  
  if (fs.existsSync(path.join(frontendStandalonePath, 'server.js'))) {
    console.log('📦 Using Next.js standalone build');
    frontendProcess = spawn('node', ['server.js'], {
      cwd: frontendStandalonePath,
      env: {
        ...process.env,
        PORT: '3001',
        HOSTNAME: '0.0.0.0',
      },
      stdio: 'pipe'
    });
  } else {
    console.log('🔨 Building and starting Next.js...');
    // Try to build first
    const buildProcess = spawn('yarn', ['build'], {
      cwd: path.join(__dirname, 'frontend'),
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
      stdio: 'inherit'
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Frontend build complete');
        frontendProcess = spawn('yarn', ['start'], {
          cwd: path.join(__dirname, 'frontend'),
          env: {
            ...process.env,
            PORT: '3001',
            HOST: '0.0.0.0',
          },
          stdio: 'pipe'
        });
      } else {
        console.error('❌ Frontend build failed, serving static files only');
      }
    });
  }

  if (frontendProcess) {
    frontendProcess.stdout.on('data', (data) => {
      console.log(`[Frontend] ${data.toString().trim()}`);
    });

    frontendProcess.stderr.on('data', (data) => {
      console.error(`[Frontend] ${data.toString().trim()}`);
    });

    frontendProcess.on('error', (err) => {
      console.error('❌ Frontend error:', err.message);
    });

    frontendProcess.on('exit', (code) => {
      console.log(`⚠️ Frontend exited with code ${code}`);
    });
  }
}

// API proxy middleware
const apiProxy = createProxyMiddleware({
  target: 'http://localhost:8001',
  changeOrigin: true,
  timeout: 30000,
  onError: (err, req, res) => {
    console.error('API proxy error:', err.message);
    res.status(502).json({ 
      error: 'Backend service unavailable',
      message: 'Please try again in a moment'
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API] ${req.method} ${req.url}`);
  }
});

// Frontend proxy middleware
const frontendProxy = createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  timeout: 30000,
  onError: (err, req, res) => {
    console.error('Frontend proxy error:', err.message);
    
    // Fallback to static files or error page
    const staticPath = path.join(__dirname, 'frontend', 'build', 'index.html');
    if (fs.existsSync(staticPath)) {
      res.sendFile(staticPath);
    } else {
      res.status(502).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>PC Builder AI - Loading...</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              .loader { border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 2s linear infinite; margin: 20px auto; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
          </head>
          <body>
            <h1>PC Builder AI is starting...</h1>
            <div class="loader"></div>
            <p>Please wait while the application loads...</p>
            <script>setTimeout(() => location.reload(), 5000);</script>
          </body>
        </html>
      `);
    }
  }
});

// Set up routes
app.use('/api', apiProxy);

// For all other routes, try frontend proxy or static files
app.use('*', (req, res, next) => {
  // Check if it's a static file request
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
    next();
  } else {
    frontendProxy(req, res, next);
  }
});

// Start services
startBackend();
startFrontend();

// Start the main server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ PC Builder AI running on port ${PORT}`);
  console.log(`🌍 Access your app at: http://localhost:${PORT}`);
  console.log(`🎯 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    if (backendProcess) backendProcess.kill('SIGTERM');
    if (frontendProcess) frontendProcess.kill('SIGTERM');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    if (backendProcess) backendProcess.kill('SIGINT');
    if (frontendProcess) frontendProcess.kill('SIGINT');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

console.log('🎉 PC Builder AI initialization complete!');