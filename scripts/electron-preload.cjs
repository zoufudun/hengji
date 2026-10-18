const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('meritDesktop', {
  load: () => ipcRenderer.invoke('workspace:load'),
  save: payload => ipcRenderer.invoke('workspace:save', payload),
  exportCsv: payload => ipcRenderer.invoke('workspace:export', payload),
  showData: () => ipcRenderer.invoke('workspace:showData')
});
