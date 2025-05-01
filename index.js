const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Create the public directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Handle 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 