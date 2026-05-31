const { contextBridge, ipcRenderer, shell } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getConfig:    ()       => ipcRenderer.invoke('get-config'),
  saveConfig:   (config) => ipcRenderer.invoke('save-config', config),
  pickExcelFile: ()      => ipcRenderer.invoke('pick-excel-file'),
  loadExcel:    (path)   => ipcRenderer.invoke('load-excel', path),
  saveRow:      (params) => ipcRenderer.invoke('save-row', params),
  deleteRow:    (params) => ipcRenderer.invoke('delete-row', params),
  newExcelFile: ()       => ipcRenderer.invoke('new-excel-file'),
  openPath:     (p)      => shell.openPath(p),
  openExternal: (url)    => shell.openExternal(url),
})
