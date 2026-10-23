const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
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

  ipcMain.handle('workspace:open-url', (_event, url) => {
    if (typeof url === 'string' && (url.startsWith('http://') || url.startsWith('https://'))) {
      shell.openExternal(url);
      return true;
    }
    return false;
  });

  async function resolveReleaseAssetUrl(ver, format = 'exe') {
    try {
      const apiRes = await fetch(`https://api.github.com/repos/zoufudun/hengji/releases/tags/v${ver}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Hengji-Desktop-App' }
      });
      if (apiRes.ok) {
        const relData = await apiRes.json();
        const assets = Array.isArray(relData.assets) ? relData.assets : [];
        if (format === 'zip') {
          const zip = assets.find(a => typeof a.name === 'string' && a.name.toLowerCase().endsWith('.zip'));
          if (zip && zip.browser_download_url) return zip.browser_download_url;
        } else if (format === 'msi') {
          const msi = assets.find(a => typeof a.name === 'string' && a.name.toLowerCase().endsWith('.msi'));
          if (msi && msi.browser_download_url) return msi.browser_download_url;
        } else if (format === 'setup' || format === 'installer') {
          const setup = assets.find(a => typeof a.name === 'string' && (a.name.toLowerCase().includes('setup') || a.name.toLowerCase().endsWith('.msi')));
          if (setup && setup.browser_download_url) return setup.browser_download_url;
        }
        const exe = assets.find(a => typeof a.name === 'string' && a.name.toLowerCase().endsWith('.exe'));
        if (exe && exe.browser_download_url) return exe.browser_download_url;
      }
    } catch (err) {
      console.warn('resolveReleaseAssetUrl error:', err);
    }
    return null;
  }

  ipcMain.handle('workspace:download-update', async (_event, payload) => {
    const ver = (payload && payload.version) ? String(payload.version).replace(/^v/, '') : '0.7.7';
    const format = payload && payload.format ? String(payload.format).toLowerCase() : 'exe';
    let filename = format === 'msi'
      ? `衡绩员工绩点考核系统-${ver}.msi`
      : format === 'zip'
      ? `衡绩员工绩点考核系统-${ver}.zip`
      : format === 'setup'
      ? `衡绩员工绩点考核系统-Setup-${ver}.exe`
      : `衡绩员工绩点考核系统-${ver}.exe`;

    // 优先下载/保存至 D:\ 盘，如无 D盘 则降级至系统下载目录
    let targetDir = 'D:\\';
    try {
      if (!fs.existsSync(targetDir)) {
        targetDir = app.getPath('downloads') || app.getPath('desktop') || 'C:\\';
      }
    } catch {
      targetDir = app.getPath('downloads') || app.getPath('desktop') || 'C:\\';
    }

    const targetPath = path.join(targetDir, filename);

    // 查找本地已有的桌面版安装程序包进行高速直拷（离线环境百分百可靠）
    const candidateLocalSources = [
      path.join(__dirname, '..', 'dist-desktop', filename),
      path.join(__dirname, '..', 'dist-desktop', `衡绩员工绩点考核系统-Setup-${ver}.exe`),
      path.join(__dirname, '..', 'dist-desktop', `衡绩员工绩点考核系统-${ver}.msi`),
      path.join(__dirname, '..', 'dist-desktop', `衡绩员工绩点考核系统-${ver}.zip`),
      path.join(__dirname, '..', 'dist-desktop', `衡绩员工绩点考核系统-${ver}.exe`),
      path.join(__dirname, '..', filename),
      path.join(process.cwd(), 'dist-desktop', filename),
      path.join(process.cwd(), 'dist-desktop', `衡绩员工绩点考核系统-Setup-${ver}.exe`),
      path.join(process.cwd(), 'dist-desktop', `衡绩员工绩点考核系统-${ver}.msi`),
      path.join(process.cwd(), 'dist-desktop', `衡绩员工绩点考核系统-${ver}.zip`),
      path.join(process.cwd(), 'dist-desktop', `衡绩员工绩点考核系统-${ver}.exe`),
      app.isPackaged ? process.execPath : null
    ].filter(Boolean);

    let copiedFromLocal = false;
    for (const src of candidateLocalSources) {
      if (fs.existsSync(src)) {
        try {
          const stats = fs.statSync(src);
          if (stats.size > 1024 * 1024) {
            fs.copyFileSync(src, targetPath);
            copiedFromLocal = true;
            break;
          }
        } catch (e) {
          console.warn('Check local source error:', src, e);
        }
      }
    }

    if (!copiedFromLocal) {
      let fetchUrl = (payload && payload.downloadUrl && String(payload.downloadUrl).startsWith('http')) ? payload.downloadUrl : null;
      if (!fetchUrl) {
        fetchUrl = await resolveReleaseAssetUrl(ver, format);
      }
      if (!fetchUrl) {
        fetchUrl = `https://github.com/zoufudun/hengji/releases/download/v${ver}/${encodeURIComponent(filename)}`;
      }
      let response = await fetch(fetchUrl, { redirect: 'follow' });
      if (!response.ok) {
        throw new Error(`下载失败 (HTTP ${response.status})：未能从官方渠道获取 ${filename}`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(targetPath, buffer);
    }

    try {
      shell.showItemInFolder(targetPath);
    } catch (e) {
      console.warn('shell.showItemInFolder error:', e);
    }

    return {
      success: true,
      filePath: targetPath,
      folder: targetDir,
      fileName: filename
    };
  });

  ipcMain.handle('workspace:install-update', async (_event, payload) => {
    const ver = (payload && payload.version) ? String(payload.version).replace(/^v/, '') : '0.7.7';
    const currentExe = process.execPath;
    const currentDir = path.dirname(currentExe);
    const currentPid = process.pid;

    // 1. 优先获取安装包（Setup.exe 或 .msi 或 .zip 或 portable.exe）
    let installerPath = null;
    const localCandidateInstallers = [
      path.join(__dirname, '..', 'dist-desktop', `衡绩员工绩点考核系统-Setup-${ver}.exe`),
      path.join(process.cwd(), 'dist-desktop', `衡绩员工绩点考核系统-Setup-${ver}.exe`),
      path.join(__dirname, '..', 'dist-desktop', `衡绩员工绩点考核系统-${ver}.msi`),
      path.join(process.cwd(), 'dist-desktop', `衡绩员工绩点考核系统-${ver}.msi`),
      path.join(__dirname, '..', 'dist-desktop', `衡绩员工绩点考核系统-${ver}.zip`),
      path.join(process.cwd(), 'dist-desktop', `衡绩员工绩点考核系统-${ver}.zip`),
      path.join(__dirname, '..', 'dist-desktop', `衡绩员工绩点考核系统-${ver}.exe`),
      path.join(process.cwd(), 'dist-desktop', `衡绩员工绩点考核系统-${ver}.exe`),
      path.join('D:\\', `衡绩员工绩点考核系统-${ver}.exe`),
      path.join('D:\\', `衡绩员工绩点考核系统-Setup-${ver}.exe`),
      path.join('D:\\', `衡绩员工绩点考核系统-${ver}.msi`),
      path.join('D:\\', `衡绩员工绩点考核系统-${ver}.zip`)
    ];

    for (const src of localCandidateInstallers) {
      if (fs.existsSync(src)) {
        try {
          if (fs.statSync(src).size > 1024 * 1024) {
            installerPath = src;
            break;
          }
        } catch {}
      }
    }

    // 若本地未找到打包产物，从远端高速下载到系统临时目录
    if (!installerPath) {
      const ext = (payload && payload.format === 'msi') ? '.msi' : (payload && payload.format === 'zip') ? '.zip' : '.exe';
      const tempFilename = `hengji-installer-${ver}-${Date.now()}${ext}`;
      const tempPath = path.join(os.tmpdir(), tempFilename);

      let fetchUrl = (payload && payload.downloadUrl && String(payload.downloadUrl).startsWith('http')) ? payload.downloadUrl : null;
      if (!fetchUrl) {
        fetchUrl = await resolveReleaseAssetUrl(ver, payload?.format || 'setup');
      }
      if (!fetchUrl) {
        fetchUrl = `https://github.com/zoufudun/hengji/releases/download/v${ver}/%E8%A1%A1%E7%BB%A9%E5%91%98%E5%B7%A5%E7%BB%A9%E7%82%B9%E8%80%83%E6%A0%B8%E7%B3%BB%E7%BB%9F-Setup-${ver}.exe`;
      }
      let response = await fetch(fetchUrl, { redirect: 'follow' });
      if (!response.ok) {
        // Fallback to release exe
        const fallbackUrl = `https://github.com/zoufudun/hengji/releases/download/v${ver}/%E8%A1%A1%E7%BB%A9%E5%91%98%E5%B7%A5%E7%BB%A9%E7%82%B9%E8%80%83%E6%A0%B8%E7%B3%BB%E7%BB%9F-${ver}.exe`;
        response = await fetch(fallbackUrl, { redirect: 'follow' });
      }
      if (!response.ok) {
        throw new Error(`下载安装包失败 (HTTP ${response.status})`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(tempPath, buffer);
      installerPath = tempPath;
    }

    // 2. 生成自动化安装覆盖并启动新版本的 PowerShell 脚本
    const scriptPath = path.join(os.tmpdir(), `hengji-apply-update-${Date.now()}.ps1`);
    const isSetupExe = installerPath.toLowerCase().endsWith('.exe') && (installerPath.toLowerCase().includes('setup') || installerPath.toLowerCase().includes('install'));
    const isMsi = installerPath.toLowerCase().endsWith('.msi');
    const isZip = installerPath.toLowerCase().endsWith('.zip');

    const scriptContent = `
$ErrorActionPreference = "SilentlyContinue"
$pidToWait = ${currentPid}
$targetDir = "${currentDir.replace(/\\/g, '\\\\')}"
$currentExe = "${currentExe.replace(/\\/g, '\\\\')}"
$installer = "${installerPath.replace(/\\/g, '\\\\')}"

# 等待旧主程序进程完全退出以释放文件占用
Wait-Process -Id $pidToWait -Timeout 25
Start-Sleep -Seconds 1

# 安装版本覆盖到当前目录
if ("${isSetupExe}" -eq "True") {
    Start-Process -FilePath $installer -ArgumentList "/S", "/D=$targetDir" -Wait
    Start-Sleep -Seconds 2
} elseif ("${isMsi}" -eq "True") {
    Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", "\`"$installer\`"", "/qn", "TARGETDIR=\`"$targetDir\`"" -Wait
    Start-Sleep -Seconds 2
} elseif ("${isZip}" -eq "True") {
    # 绿色压缩包直接解压覆盖当前目录
    Expand-Archive -Path $installer -DestinationPath $targetDir -Force
    Start-Sleep -Seconds 1
} else {
    # 便携单文件直接覆盖
    Copy-Item -Path $installer -Destination $currentExe -Force
    Start-Sleep -Seconds 1
}

# 启动覆盖安装后的新版本
$cand1 = Join-Path $targetDir "衡绩员工绩点考核系统.exe"
$cand2 = Join-Path $targetDir "衡绩员工绩点考核系统-${ver}.exe"
$cand3 = Join-Path $targetDir (Split-Path $currentExe -Leaf)
if (Test-Path $cand1) {
    Start-Process -FilePath $cand1
} elseif (Test-Path $cand2) {
    Start-Process -FilePath $cand2
} elseif (Test-Path $cand3) {
    Start-Process -FilePath $cand3
} elseif (Test-Path $currentExe) {
    Start-Process -FilePath $currentExe
}

Start-Sleep -Seconds 2
Remove-Item -Path $MyInvocation.MyCommand.Path -Force
`;

    fs.writeFileSync(scriptPath, scriptContent, 'utf8');

    // 3. 以后台独立分离进程方式执行更新安装器
    const { spawn } = require('child_process');
    const child = spawn('powershell.exe', [
      '-NoProfile',
      '-ExecutionPolicy', 'Bypass',
      '-WindowStyle', 'Hidden',
      '-File', scriptPath
    ], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    // 4. 退出当前软件以释放文件锁
    setTimeout(() => {
      app.quit();
    }, 400);

    return { success: true, message: '正在自动安装覆盖并重启新版本...' };
  });

  ipcMain.handle('workspace:show-item-in-folder', (_event, filePath) => {
    if (filePath && typeof filePath === 'string' && fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath);
      return true;
    }
    return false;
  });

  ipcMain.handle('workspace:open-path', async (_event, filePath) => {
    if (filePath && typeof filePath === 'string' && fs.existsSync(filePath)) {
      await shell.openPath(filePath);
      return true;
    }
    return false;
  });

  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
