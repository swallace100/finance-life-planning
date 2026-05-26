const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  pickExcelFile: () => ipcRenderer.invoke('pick-excel-file'),
  loadExcel: (filePath) => ipcRenderer.invoke('load-excel', filePath),
})
