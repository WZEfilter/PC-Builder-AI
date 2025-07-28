const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 80;

console.log('🚀 Starting PC Builder AI for Emergent deployment...');

// Start backend process
const backend = spawn('python', ['server.py'], {
  cwd: path.join(__dirname, 'backend'),
  env: {
    ...process.env,
    PATH: process.env.PATH,
    PYTHONPATH: path.join(__dirname, 'backend'),
    BACKEND_PORT: '8001',
    BACKEND_HOST: '0.0.0.0',
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

// Log backend output
backend.stdout.on('data', (data) => {
  console.log(`[Backend] ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.error(`[Backend Error] ${data.toString().trim()}`);
});

// Start frontend process
let frontend;
const frontendBuildPath = path.join(__dirname, 'frontend', 'build');
const frontendStandalonePath = path.join(frontendBuildPath, 'standalone');

// Check if standalone build exists
const fs = require('fs');
if (fs.existsSync(path.join(frontendStandalonePath, 'server.js'))) {
  console.log('📦 Using Next.js standalone build');
  frontend = spawn('node', ['server.js'], {
    cwd: frontendStandalonePath,
    env: {
      ...process.env,
      PORT: '3000',
      HOSTNAME: '0.0.0.0',
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });
} else {
  console.log('🔄 Building and starting Next.js...');
  // Build first
  const build = spawn('yarn', ['build'], {
    cwd: path.join(__dirname, 'frontend'),
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
    stdio: 'inherit'
  });
  
  build.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Frontend build complete, starting server...');
      frontend = spawn('yarn', ['start'], {
        cwd: path.join(__dirname, 'frontend'),
        env: {
          ...process.env,
          PORT: '3000',
          HOST: '0.0.0.0',
        },
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      // Log frontend output
      frontend.stdout.on('data', (data) => {
        console.log(`[Frontend] ${data.toString().trim()}`);
      });
      
      frontend.stderr.on('data', (data) => {
        console.error(`[Frontend Error] ${data.toString().trim()}`);
      });
    } else {
      console.error('❌ Frontend build failed');
    }
  });
}

// Log frontend output if it exists
if (frontend) {
  frontend.stdout.on('data', (data) => {
    console.log(`[Frontend] ${data.toString().trim()}`);
  });
  
  frontend.stderr.on('data', (data) => {
    console.error(`[Frontend Error] ${data.toString().trim()}`);
  });
}

// Wait for services to start
setTimeout(() => {
  console.log('⏳ Waiting for services to start...');
  
  // Proxy API requests to backend
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8001',
    changeOrigin: true,
    timeout: 60000,
    onError: (err, req, res) => {
      console.error('Backend proxy error:', err.message);
      res.status(502).json({ error: 'Backend service unavailable' });
    }
  }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      message: 'PC Builder AI is running',
      timestamp: new Date().toISOString()
    });
  });

  // Proxy all other requests to frontend
  app.use('/', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true,
    timeout: 60000,
    onError: (err, req, res) => {
      console.error('Frontend proxy error:', err.message);
      res.status(502).send(`
        <html>
          <head><title>PC Builder AI - Starting...</title></head>
          <body>
            <h1>PC Builder AI is starting...</h1>
            <p>Please wait a moment while the application loads.</p>
            <script>setTimeout(() => location.reload(), 3000);</script>
          </body>
        </html>
      `);
    }
  }));

  // Start the proxy server
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ PC Builder AI proxy server running on port ${PORT}`);
    console.log(`🎯 Backend: http://localhost:8001`);
    console.log(`🎯 Frontend: http://localhost:3000`);
    console.log(`🌍 Application: http://localhost:${PORT}`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully...');
    server.close(() => {
      backend.kill('SIGTERM');
      frontend.kill('SIGTERM');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully...');
    server.close(() => {
      backend.kill('SIGINT');
      frontend.kill('SIGINT');
      process.exit(0);
    });
  });

}, 2000);

// Handle backend process events
backend.on('error', (err) => {
  console.error('❌ Backend process error:', err);
});

backend.on('exit', (code) => {
  console.log(`⚠️ Backend process exited with code ${code}`);
});

// Handle frontend process events
frontend.on('error', (err) => {
  console.error('❌ Frontend process error:', err);
});

frontend.on('exit', (code) => {
  console.log(`⚠️ Frontend process exited with code ${code}`);
});

console.log('🎉 PC Builder AI initialization complete!');