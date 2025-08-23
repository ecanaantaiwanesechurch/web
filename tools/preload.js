const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  loadConfigFile: (filePath) => ipcRenderer.invoke('load-config-file', filePath),
  saveConfigFile: (filePath, content) => ipcRenderer.invoke('save-config-file', filePath, content),
  showOpenDialog: () => ipcRenderer.invoke('show-open-dialog'),
  showSaveDialog: (defaultName) => ipcRenderer.invoke('show-save-dialog', defaultName),

  // JSON-specific operations
  loadJsonFile: (filePath) => ipcRenderer.invoke('load-json-file', filePath),
  saveJsonFile: (filePath, jsonData) => ipcRenderer.invoke('save-json-file', filePath, jsonData),

  // Menu events
  onMenuLoadConfig: (callback) => ipcRenderer.on('menu-load-config', callback),
  onMenuSaveConfig: (callback) => ipcRenderer.on('menu-save-config', callback),
  onNavigateTo: (callback) => ipcRenderer.on('navigate-to', callback),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});