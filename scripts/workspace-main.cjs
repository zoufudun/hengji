const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { encryptWorkspace, decryptWorkspace } = require('./workspace-crypto.cjs');
let session = null;

function cleanName(value) { return String(value || '未命名工作区').trim().slice(0, 80) || '未命名工作区'; }

function atomicWrite(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const temporary = `${filePath}.tmp`;
  fs.writeFileSync(temporary, content, { encoding: 'utf8' });
  if (fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath); } catch {}
  }
  try {
    fs.renameSync(temporary, filePath);
  } catch {
    fs.copyFileSync(temporary, filePath);
    try { fs.unlinkSync(temporary); } catch {}
  }
}

function saveSession(payload) {
  if (!session) throw new Error('尚未打开工作区');
  if (payload.revision !== session.revision) throw new Error('工作区已在其他操作中更新，请重新打开');
  const next = {
    name: cleanName(payload.name || session.name),
    revision: session.revision + 1,
    actorId: payload.actorId || 'admin',
    workspaceType: payload.workspaceType || session.workspaceType || 'general',
    ownerEmployeeId: payload.ownerEmployeeId || session.ownerEmployeeId || '',
    ownerEmployeeName: payload.ownerEmployeeName || session.ownerEmployeeName || '',
    state: payload.state,
    projectGroups: Array.isArray(payload.projectGroups) ? payload.projectGroups : []
  };
  const backup = `${session.filePath}.backup`;
  if (fs.existsSync(session.filePath)) fs.copyFileSync(session.filePath, backup);
  atomicWrite(session.filePath, encryptWorkspace(next, session.password));
  session = { ...session, ...next };
  return publicSession();
}

function publicSession() {
  if (!session) return { open: false };
  return {
    open: true,
    name: session.name,
    revision: session.revision,
    actorId: session.actorId,
    workspaceType: session.workspaceType || 'general',
    ownerEmployeeId: session.ownerEmployeeId || '',
    ownerEmployeeName: session.ownerEmployeeName || '',
    state: session.state,
    projectGroups: session.projectGroups || [],
    filePath: session.filePath
  };
}

function restoreFocus(win) {
  if (win && !win.isDestroyed()) {
    win.focus();
    win.webContents.focus();
  }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 720,
    show: true,
    title: '衡绩 · 员工绩点考核系统',
    backgroundColor: '#f3f5f2',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'workspace-preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      devTools: !app.isPackaged
    }
  });
  win.removeMenu();
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (event) => event.preventDefault());
  win.webContents.on('will-redirect', (event) => event.preventDefault());
  win.on('focus', () => { restoreFocus(win); });
  win.loadFile(path.join(__dirname, '..', 'build', 'desktop', 'desktop.html'));
}

app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion,MediaRouter');
app.whenReady().then(() => {
  ipcMain.handle('workspace:status', () => ({ ...publicSession(), hasLegacyData: fs.existsSync(path.join(app.getPath('userData'), 'merit-data.json')) }));

  ipcMain.handle('workspace:refocus-window', (_event) => {
    const win = BrowserWindow.fromWebContents(_event.sender) || BrowserWindow.getFocusedWindow();
    restoreFocus(win);
    return true;
  });

  ipcMain.handle('workspace:choose-open', async (_event) => {
    const win = BrowserWindow.fromWebContents(_event.sender) || BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(win, {
      title: '打开衡绩工作区',
      properties: ['openFile'],
      filters: [{ name: '衡绩加密工作区', extensions: ['hengji'] }]
    });
    restoreFocus(win);
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('workspace:open', (_event, { filePath, password }) => {
    if (!filePath) throw new Error('请选择工作区文件');
    if (!fs.existsSync(filePath)) throw new Error('所选工作区文件不存在');
    const pwd = typeof password === 'string' ? password.trim() : '';
    const decoded = decryptWorkspace(fs.readFileSync(filePath, 'utf8'), pwd);
    if (!decoded.state || !Array.isArray(decoded.state.employees) || !Array.isArray(decoded.state.projects) || !Array.isArray(decoded.state.plans)) {
      throw new Error('工作区数据不完整');
    }
    session = {
      filePath,
      password: pwd,
      name: cleanName(decoded.name || path.basename(filePath, '.hengji')),
      revision: decoded.revision || 0,
      actorId: decoded.actorId || 'admin',
      workspaceType: decoded.workspaceType || 'general',
      ownerEmployeeId: decoded.ownerEmployeeId || '',
      ownerEmployeeName: decoded.ownerEmployeeName || '',
      state: decoded.state,
      projectGroups: decoded.projectGroups || []
    };
    return publicSession();
  });

  ipcMain.handle('workspace:create', async (_event, payload) => {
    const win = BrowserWindow.fromWebContents(_event.sender) || BrowserWindow.getFocusedWindow();
    let defaultDir = app.getPath('documents');
    try {
      if (fs.existsSync('D:\\')) defaultDir = 'D:\\';
    } catch {}
    const defaultPath = path.join(defaultDir, `${cleanName(payload.name)}.hengji`);
    const result = await dialog.showSaveDialog(win, {
      title: '选择工作区保存位置（建议非系统盘）',
      defaultPath,
      filters: [{ name: '衡绩加密工作区', extensions: ['hengji'] }]
    });
    restoreFocus(win);
    if (result.canceled || !result.filePath) return null;
    const initial = {
      name: cleanName(payload.name),
      revision: 1,
      actorId: 'admin',
      workspaceType: payload.workspaceType || 'general',
      ownerEmployeeId: payload.ownerEmployeeId || '',
      ownerEmployeeName: payload.ownerEmployeeName || '',
      state: payload.state,
      projectGroups: payload.projectGroups || []
    };
    const password = typeof payload.password === 'string' ? payload.password.trim() : '';
    atomicWrite(result.filePath, encryptWorkspace(initial, password));
    session = { filePath: result.filePath, password, ...initial };
    return publicSession();
  });

  ipcMain.handle('workspace:save', (_event, payload) => saveSession(payload));

  ipcMain.handle('workspace:save-as', async (_event, payload) => {
    if (!session) throw new Error('尚未打开工作区');
    const win = BrowserWindow.fromWebContents(_event.sender) || BrowserWindow.getFocusedWindow();
    const defaultDir = path.dirname(session.filePath);
    const result = await dialog.showSaveDialog(win, {
      title: '工作区另存为',
      defaultPath: path.join(defaultDir, `${cleanName(payload.name || session.name)}.hengji`),
      filters: [{ name: '衡绩加密工作区', extensions: ['hengji'] }]
    });
    restoreFocus(win);
    if (result.canceled || !result.filePath) return null;
    session.filePath = result.filePath;
    return saveSession({ ...payload, revision: session.revision });
  });

  ipcMain.handle('workspace:export-base', async (_event, payload) => {
    if (!session) throw new Error('尚未打开工作区');
    const win = BrowserWindow.fromWebContents(_event.sender) || BrowserWindow.getFocusedWindow();
    const defaultDir = path.dirname(session.filePath);
    const result = await dialog.showSaveDialog(win, {
      title: '导出可共享的员工与专业组基础库',
      defaultPath: path.join(defaultDir, `${cleanName(session.name)}-共享基础库.hjbase`),
      filters: [{ name: '衡绩共享基础库', extensions: ['hjbase'] }]
    });
    restoreFocus(win);
    if (result.canceled || !result.filePath) return false;
    const base = {
      format: 'hengji-public-base',
      version: 1,
      exportedAt: new Date().toISOString(),
      employees: payload.state.employees.map(({ id, name, department, group, position, groupRole, email, role, active }) => ({ id, name, department, group, position, groupRole, email, role, active }))
    };
    atomicWrite(result.filePath, JSON.stringify(base, null, 2));
    return true;
  });

  ipcMain.handle('workspace:import-base', async (_event) => {
    const win = BrowserWindow.fromWebContents(_event.sender) || BrowserWindow.getFocusedWindow();
    const result = await dialog.showOpenDialog(win, {
      title: '导入员工与专业组基础库',
      properties: ['openFile'],
      filters: [{ name: '衡绩共享基础库', extensions: ['hjbase'] }]
    });
    restoreFocus(win);
    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return null;
    const base = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'));
    if (base.format !== 'hengji-public-base' || !Array.isArray(base.employees)) throw new Error('共享基础库格式不正确');
    return { employees: base.employees, projectGroups: [] };
  });

  ipcMain.handle('workspace:lock', () => { session = null; return true; });
  ipcMain.handle('workspace:show-file', () => { if (session) shell.showItemInFolder(session.filePath); });

  ipcMain.handle('workspace:export-csv', async (_event, { content, defaultPath }) => {
    const win = BrowserWindow.fromWebContents(_event.sender) || BrowserWindow.getFocusedWindow();
    const result = await dialog.showSaveDialog(win, {
      defaultPath,
      filters: [{ name: 'CSV 表格', extensions: ['csv'] }]
    });
    restoreFocus(win);
    if (result.canceled || !result.filePath) return false;
    fs.writeFileSync(result.filePath, `\ufeff${content}`, 'utf8');
    return true;
  });

  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
