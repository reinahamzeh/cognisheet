const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'api', {
    // File operations
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    
    // Socket.io connection (will be initialized in the renderer)
    connectToServer: () => {
      // This is just a placeholder - the actual connection will be made in the renderer
      return { connected: true };
    }
  }
); 