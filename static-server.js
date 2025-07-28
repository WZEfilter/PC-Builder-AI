const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Starting PC Builder AI Static Server...');

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'PC Builder AI Static Server is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from frontend build
const buildPath = path.join(__dirname, 'frontend', 'build');
if (fs.existsSync(buildPath)) {
  console.log('📦 Serving static files from:', buildPath);
  app.use(express.static(buildPath));
  
  // Handle client-side routing
  app.get('*', (req, res) => {
    const indexPath = path.join(buildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('PC Builder AI - Application not found');
    }
  });
} else {
  console.log('❌ Build directory not found, serving basic response');
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PC Builder AI</title>
        </head>
        <body>
          <h1>PC Builder AI</h1>
          <p>Build directory not found. Please build the frontend first.</p>
        </body>
      </html>
    `);
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Static server running on port ${PORT}`);
});