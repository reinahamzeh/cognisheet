import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import path from 'path';
import fs from 'fs';
import next from 'next';

// Types
interface FileUploadRequest {
  fileContent: string;
  fileName: string;
}

interface QueryData {
  message: string;
}

interface QueryResult {
  result: string;
}

// Initialize Next.js
const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new SocketIOServer(server);

// Middleware
app.use(express.json());

// Mock file handling API (since we can't use Electron's file dialog)
app.post('/api/upload', (req: Request<{}, {}, FileUploadRequest>, res: Response) => {
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
io.on('connection', (socket: Socket) => {
  console.log('Client connected');
  
  socket.on('query', (data: QueryData) => {
    console.log('Received query:', data);
    
    // Process the query and send back results
    // This is a simple mock response
    setTimeout(() => {
      const result: QueryResult = {
        result: `Processed query: "${data.message}"`
      };
      socket.emit('query-result', result);
    }, 500);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;

nextApp.prepare().then(() => {
  // Handle all other routes with Next.js
  app.all('*', (req: Request, res: Response) => {
    return handle(req, res);
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}); 