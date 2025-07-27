#!/usr/bin/env node
/**
 * Production startup script for PC Builder AI Frontend
 */

const path = require('path');
const { spawn } = require('child_process');

// Get port from environment or use default
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

console.log('Starting PC Builder AI Frontend...');
console.log(`Host: ${HOST}`);
console.log(`Port: ${PORT}`);

// Check if standalone build exists
const standalonePath = path.join(__dirname, 'build', 'standalone');
const serverPath = path.join(standalonePath, 'server.js');

try {
  require('fs').accessSync(serverPath);
  console.log('Using standalone build');
  
  // Start the standalone server
  const server = spawn('node', [serverPath], {
    cwd: standalonePath,
    env: {
      ...process.env,
      PORT: PORT,
      HOSTNAME: HOST
    },
    stdio: 'inherit'
  });
  
  server.on('error', (err) => {
    console.error('Failed to start frontend server:', err);
    process.exit(1);
  });
  
  server.on('close', (code) => {
    console.log(`Frontend server exited with code ${code}`);
    process.exit(code);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('Shutting down frontend server...');
    server.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('Shutting down frontend server...');
    server.kill('SIGTERM');
  });
  
} catch (error) {
  console.error('Standalone build not found. Please run "yarn build" first.');
  process.exit(1);
}