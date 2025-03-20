const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Initialize Express app for backend services
const expressApp = express();
const server = http.createServer(expressApp);
const io = new Server(server);

// Start Express server on port 3000
server.listen(3000, () => {
  console.log('Backend server running on port 3000');
});

// Handle API routes
expressApp.use(express.json());

// File service endpoint
expressApp.post('/api/file/parse', (req, res) => {
  // This will be implemented to handle file parsing
  res.json({ success: true, message: 'File parsing endpoint' });
});

// Create the main browser window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5178');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from built files
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

// When Electron is ready, create the window
app.whenReady().then(() => {
  createWindow();

  // On macOS, recreate the window when dock icon is clicked
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers for file operations
ipcMain.handle('open-file-dialog', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'Spreadsheets', extensions: ['csv', 'xls', 'xlsx'] }
    ]
  });
  
  if (canceled) {
    return null;
  }
  
  return filePaths[0];
});

// IPC handler for reading file contents
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Socket.io for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('query', (data) => {
    // This will be implemented to handle NLP queries
    console.log('Received query:', data);
    // Process the query and send back results
    socket.emit('query-result', { result: 'Query processed' });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
}); 