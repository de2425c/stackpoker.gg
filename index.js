const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { spawn } = require('child_process');
const app = express();
const port = process.env.PORT || 3000;
const pythonPort = process.env.PYTHON_PORT || 8000;

// Create public directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Start Python backend
let pythonProcess = null;

function startPythonBackend() {
  console.log('Starting Python backend...');
  
  // Check if we're in a production environment
  if (process.env.NODE_ENV === 'production') {
    console.log('Running in production mode, assuming Python backend is managed separately');
    return;
  }
  
  // Start the Python backend using uvicorn
  pythonProcess = spawn('uvicorn', [
    'parser_backend.main:app',
    '--host', '0.0.0.0',
    '--port', pythonPort
  ]);
  
  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python backend: ${data}`);
  });
  
  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python backend error: ${data}`);
  });
  
  pythonProcess.on('close', (code) => {
    console.log(`Python backend exited with code ${code}`);
    if (code !== 0) {
      console.log('Restarting Python backend in 5 seconds...');
      setTimeout(startPythonBackend, 5000);
    }
  });
}

// Start the Python backend
startPythonBackend();

// Handle process termination
process.on('SIGINT', () => {
  if (pythonProcess) {
    console.log('Shutting down Python backend...');
    pythonProcess.kill();
  }
  process.exit(0);
});

// Serve static files from the public directory
app.use(express.static('public'));

// Set up proxy for API routes
app.use('/api', createProxyMiddleware({ 
  target: `http://localhost:${pythonPort}`,
  pathRewrite: {
    '^/api': '/' // rewrite path
  },
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Python backend service unavailable' });
  }
}));

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle 404 errors - this should be AFTER all other routes
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Node.js server running at http://localhost:${port}`);
  console.log(`Proxying API requests to Python backend at http://localhost:${pythonPort}`);
}); 