import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());

// Mock file handling API (since we can't use Electron's file dialog)
app.post('/api/upload', (req, res) => {
  const { fileContent, fileName } = req.body;
  
  if (!fileContent || !fileName) {
    return res.status(400).json({ success: false, error: 'Missing file content or name' });
  }
  
  // Return success with the file content
  res.json({ 
    success: true, 
    content: fileContent,
    fileName: fileName
  });
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('query', (data) => {
    console.log('Received query:', data);
    
    // Process the query and send back results
    // This is a simple mock response
    setTimeout(() => {
      socket.emit('query-result', { 
        result: `Processed query: "${data.message}"` 
      });
    }, 500);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// In production, serve static files from the dist directory
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start the server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 