const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
let dataFile;
const initialState = () => ({
  employees: [
    { id: 'admin', name: '管理员', department: '综合管理部', group: '', position: '系统管理员', email: '', role: 'admin', active: true }
  ],
  projects: [],
  plans: [],
  audit: []
});
function saveData(data) { const temp = `${dataFile}.tmp`; fs.writeFileSync(temp, JSON.stringify(data, null, 2), 'utf8'); fs.renameSync(temp, dataFile); }
function loadData() {
  try { return JSON.parse(fs.readFileSync(dataFile, 'utf8')); }
  catch { const data = { revision: 0, actorId: 'admin', state: initialState() }; saveData(data); return data; }
}
function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 720,
    title: '衡绩 · 员工绩点考核系统',
    backgroundColor: '#f3f5f2',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'electron-preload.cjs'), contextIsolation: true, nodeIntegration: false }
  });
  win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[Renderer Console L${level}] ${message} (${sourceId}:${line})`);
  });
  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('[did-fail-load]', errorCode, errorDescription, validatedURL);
  });
  win.removeMenu();
  const targetHtml = path.join(__dirname, '..', 'build', 'desktop', 'desktop.html');
  console.log('[Main] Loading targetHtml:', targetHtml, 'exists:', fs.existsSync(targetHtml));
  win.loadFile(targetHtml);
}
app.whenReady().then(() => {
  dataFile = path.join(app.getPath('userData'), 'merit-data.json');
  fs.mkdirSync(path.dirname(dataFile), { recursive: true });
  ipcMain.handle('workspace:load', () => ({ ...loadData(), dataFile }));
  ipcMain.handle('workspace:save', (_event, payload) => {
    const current = loadData();
    if (payload.revision !== current.revision) throw new Error('数据已在其他窗口更新，请重新打开程序');
    if (!payload.state || !Array.isArray(payload.state.employees) || !Array.isArray(payload.state.projects) || !Array.isArray(payload.state.plans)) throw new Error('数据格式无效');
    const next = { revision: current.revision + 1, actorId: payload.actorId || current.actorId, state: payload.state };
    if (fs.existsSync(dataFile)) fs.copyFileSync(dataFile, `${dataFile}.backup`);
    saveData(next); return { ...next, dataFile };
  });
  ipcMain.handle('workspace:export', async (_event, { content, defaultPath }) => {
    const result = await dialog.showSaveDialog({ defaultPath, filters: [{ name: 'CSV 表格', extensions: ['csv'] }] });
    if (result.canceled || !result.filePath) return false;
    fs.writeFileSync(result.filePath, `\ufeff${content}`, 'utf8'); return true;
  });
  ipcMain.handle('workspace:showData', () => shell.showItemInFolder(dataFile));
  createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
