const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('meritDesktop', {
  status: () => ipcRenderer.invoke('workspace:status'),
  chooseOpen: () => ipcRenderer.invoke('workspace:choose-open'),
  open: payload => ipcRenderer.invoke('workspace:open', payload),
  create: payload => ipcRenderer.invoke('workspace:create', payload),
  save: payload => ipcRenderer.invoke('workspace:save', payload),
  saveAs: payload => ipcRenderer.invoke('workspace:save-as', payload),
  exportBase: payload => ipcRenderer.invoke('workspace:export-base', payload),
  importBase: () => ipcRenderer.invoke('workspace:import-base'),
  lock: () => ipcRenderer.invoke('workspace:lock'),
  exportCsv: payload => ipcRenderer.invoke('workspace:export-csv', payload),
  showData: () => ipcRenderer.invoke('workspace:show-file'),
  refocusWindow: () => ipcRenderer.invoke('workspace:refocus-window'),
  openUrl: (url) => ipcRenderer.invoke('workspace:open-url', url)
});

