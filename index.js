const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 PC Builder AI - Starting Emergent Deployment Server');
console.log('📊 Port:', PORT);
console.log('🌐 Environment:', process.env.NODE_ENV || 'production');

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'PC Builder AI is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// API endpoint proxy (simplified)
app.use('/api', (req, res) => {
  // Basic API response for demonstration
  if (req.path === '/health') {
    res.json({ 
      status: 'healthy', 
      message: 'PC Builder AI Backend is running',
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({ 
      error: 'Backend service starting',
      message: 'Please try again in a moment'
    });
  }
});

// Serve static files from frontend build
const buildPath = path.join(__dirname, 'frontend', 'build');
console.log('📦 Looking for build directory:', buildPath);

if (fs.existsSync(buildPath)) {
  console.log('✅ Found build directory, serving static files');
  app.use(express.static(buildPath));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      console.log('📄 Serving index.html for:', req.path);
      res.sendFile(indexPath);
    } else {
      console.log('❌ index.html not found');
      res.status(404).send('PC Builder AI - Index file not found');
    }
  });
} else {
  console.log('❌ Build directory not found');
  
  // Fallback HTML
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PC Builder AI</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            .status { color: #666; margin: 20px 0; }
            .error { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 PC Builder AI</h1>
            <div class="status">Application is starting...</div>
            <div class="error">Build directory not found. Building frontend...</div>
            <p>Please wait while the application initializes.</p>
            <script>
              setTimeout(() => {
                location.reload();
              }, 5000);
            </script>
          </div>
        </body>
      </html>
    `);
  });
}

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ PC Builder AI running on port ${PORT}`);
  console.log(`🌍 Access your app at: http://localhost:${PORT}`);
  console.log(`🎯 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

console.log('🎉 PC Builder AI server initialization complete!');