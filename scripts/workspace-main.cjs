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

  function getAssetFilenames(ver, format = 'setup') {
    const fmt = String(format).toLowerCase();
    if (fmt === 'msi') {
      return [`hengji-${ver}.msi`, `衡绩员工绩点考核系统-${ver}.msi`];
    }
    if (fmt === 'zip') {
      return [`hengji-${ver}.zip`, `衡绩员工绩点考核系统-${ver}.zip`];
    }
    if (fmt === 'portable') {
      return [
        `hengji-portable-${ver}.exe`,
        `hengji-portable.exe`,
        `hengji-${ver}.exe`,
        `衡绩员工绩点考核系统-${ver}.exe`
      ];
    }
    // 'setup' / 'exe' / default
    return [
      `hengji-${ver}.exe`,
      `hengji-Setup-${ver}.exe`,
      `衡绩员工绩点考核系统-Setup-${ver}.exe`,
      `衡绩员工绩点考核系统-${ver}.exe`
    ];
  }

  async function resolveReleaseAssetUrl(ver, format = 'setup') {
    try {
      const apiRes = await fetch(`https://api.github.com/repos/zoufudun/hengji/releases/tags/v${ver}`, {
        headers: { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Hengji-Desktop-App' }
      });
      if (apiRes.ok) {
        const relData = await apiRes.json();
        const assets = Array.isArray(relData.assets) ? relData.assets : [];
        const fmt = String(format).toLowerCase();
        if (fmt === 'zip') {
          const zip = assets.find(a => typeof a.name === 'string' && a.name.toLowerCase().endsWith('.zip'));
          if (zip && zip.browser_download_url) return zip.browser_download_url;
        } else if (fmt === 'msi') {
          const msi = assets.find(a => typeof a.name === 'string' && a.name.toLowerCase().endsWith('.msi'));
          if (msi && msi.browser_download_url) return msi.browser_download_url;
        } else if (fmt === 'portable') {
          const portable = assets.find(a => typeof a.name === 'string' && (a.name.toLowerCase().includes('portable') || a.name.toLowerCase().endsWith('.exe')));
          if (portable && portable.browser_download_url) return portable.browser_download_url;
        } else {
          const setup = assets.find(a => typeof a.name === 'string' && (a.name.toLowerCase().includes('setup') || a.name.toLowerCase() === `hengji-${ver}.exe`));
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
    const ver = (payload && payload.version) ? String(payload.version).replace(/^v/, '') : '0.7.8';
    const format = payload && payload.format ? String(payload.format).toLowerCase() : 'setup';
    const filenames = getAssetFilenames(ver, format);
    const filename = filenames[0];

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
    const searchDirs = [
      path.join(__dirname, '..', 'dist-desktop'),
      path.join(process.cwd(), 'dist-desktop'),
      path.join(__dirname, '..'),
      targetDir,
      app.getPath('downloads'),
      app.getPath('desktop')
    ].filter(Boolean);

    let copiedFromLocal = false;
    for (const fn of filenames) {
      for (const dir of searchDirs) {
        const src = path.join(dir, fn);
        if (fs.existsSync(src) && path.resolve(src) !== path.resolve(targetPath)) {
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
      if (copiedFromLocal) break;
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
        for (const altFn of filenames) {
          if (altFn === filename) continue;
          const altUrl = `https://github.com/zoufudun/hengji/releases/download/v${ver}/${encodeURIComponent(altFn)}`;
          try {
            const r = await fetch(altUrl, { redirect: 'follow' });
            if (r.ok) {
              response = r;
              break;
            }
          } catch {}
        }
      }
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
    const ver = (payload && payload.version) ? String(payload.version).replace(/^v/, '') : '0.7.8';
    const format = payload && payload.format ? String(payload.format).toLowerCase() : 'setup';
    const currentExe = process.execPath;
    const currentDir = path.dirname(currentExe);

    // 1. 查找或获取针对该格式的安装包
    const candidateFilenames = getAssetFilenames(ver, format);
    let installerPath = null;
    const searchDirs = [
      path.join(__dirname, '..', 'dist-desktop'),
      path.join(process.cwd(), 'dist-desktop'),
      'D:\\',
      app.getPath('downloads'),
      app.getPath('desktop')
    ].filter(Boolean);

    for (const fn of candidateFilenames) {
      for (const d of searchDirs) {
        const cand = path.join(d, fn);
        if (fs.existsSync(cand)) {
          try {
            if (fs.statSync(cand).size > 1024 * 1024) {
              installerPath = cand;
              break;
            }
          } catch {}
        }
      }
      if (installerPath) break;
    }

    // 若本地未找到打包产物，从远端高速下载到系统临时目录
    if (!installerPath) {
      const ext = format === 'msi' ? '.msi' : format === 'zip' ? '.zip' : '.exe';
      const tempFilename = candidateFilenames[0] || `hengji-installer-${ver}-${Date.now()}${ext}`;
      const tempPath = path.join(os.tmpdir(), tempFilename);

      let fetchUrl = (payload && payload.downloadUrl && String(payload.downloadUrl).startsWith('http')) ? payload.downloadUrl : null;
      if (!fetchUrl) {
        fetchUrl = await resolveReleaseAssetUrl(ver, format);
      }
      if (!fetchUrl) {
        fetchUrl = `https://github.com/zoufudun/hengji/releases/download/v${ver}/${encodeURIComponent(candidateFilenames[0])}`;
      }
      let response = await fetch(fetchUrl, { redirect: 'follow' });
      if (!response.ok) {
        for (const altFn of candidateFilenames) {
          if (altFn === candidateFilenames[0]) continue;
          const altUrl = `https://github.com/zoufudun/hengji/releases/download/v${ver}/${encodeURIComponent(altFn)}`;
          try {
            const r = await fetch(altUrl, { redirect: 'follow' });
            if (r.ok) {
              response = r;
              break;
            }
          } catch {}
        }
      }
      if (!response.ok) {
        throw new Error(`下载安装包失败 (HTTP ${response.status})：无法获取更新包`);
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(tempPath, buffer);
      installerPath = tempPath;
    }

    // 2. 生成可视化的自动化覆盖安装脚本 (bat)，保证用户能看到清晰的安装进程并处理好文件锁
    const scriptPath = path.join(os.tmpdir(), `hengji-apply-update-${Date.now()}.bat`);
    let scriptContent = '';

    if (format === 'setup') {
      scriptContent = `@echo off
chcp 65001 >nul
title 衡绩员工绩点考核系统 - 覆盖安装向导 (v${ver})
color 1F
echo ========================================================
echo       衡绩员工绩点考核系统 - 正在启动覆盖安装向导
echo ========================================================
echo.
echo [1/2] 正在等待原程序完全退出以释放文件占用...
timeout /t 2 /nobreak >nul
echo [2/2] 正在启动安装向导，请在向导界面中完成安装...
start "" "${installerPath}" /D=${currentDir}
timeout /t 3 /nobreak >nul
del "%~f0" >nul 2>&1
exit
`;
    } else if (format === 'msi') {
      scriptContent = `@echo off
chcp 65001 >nul
title 衡绩员工绩点考核系统 - MSI 安装向导 (v${ver})
color 1F
echo ========================================================
echo       衡绩员工绩点考核系统 - 正在启动 MSI 安装向导
echo ========================================================
echo.
echo [1/2] 正在等待原程序完全退出以释放文件占用...
timeout /t 2 /nobreak >nul
echo [2/2] 正在启动 Windows Installer 安装程序...
msiexec.exe /i "${installerPath}"
timeout /t 3 /nobreak >nul
del "%~f0" >nul 2>&1
exit
`;
    } else if (format === 'portable') {
      scriptContent = `@echo off
chcp 65001 >nul
title 衡绩员工绩点考核系统 - 便携单文件覆盖更新 (v${ver})
color 2F
echo ========================================================
echo       衡绩员工绩点考核系统 - 便携单文件覆盖更新
echo ========================================================
echo.
echo [1/3] 正在等待原程序完全退出释放文件锁...
timeout /t 2 /nobreak >nul
set RETRY=0
:retry_copy
echo [2/3] 正在覆盖更新主程序文件...
copy /y "${installerPath}" "${currentExe}" >nul
if errorlevel 1 (
    set /a RETRY+=1
    if %RETRY% leq 12 (
        echo 文件仍被占用，等待 1 秒后重试 (%RETRY%/12)...
        timeout /t 1 /nobreak >nul
        goto retry_copy
    ) else (
        echo 覆盖更新失败：文件可能被其它进程占用，请关闭后手动复制。
        pause
        exit /b 1
    )
)
echo [3/3] 单文件覆盖更新成功！正在自动启动新版本...
start "" "${currentExe}"
timeout /t 2 /nobreak >nul
del "%~f0" >nul 2>&1
exit
`;
    } else {
      // zip 绿色解压版
      scriptContent = `@echo off
chcp 65001 >nul
title 衡绩员工绩点考核系统 - 绿色版解压覆盖 (v${ver})
color 6F
echo ========================================================
echo       衡绩员工绩点考核系统 - 绿色版解压覆盖更新
echo ========================================================
echo.
echo [1/3] 正在等待原程序完全退出释放文件锁...
timeout /t 2 /nobreak >nul
echo [2/3] 正在解压新版本文件并覆盖到当前程序目录...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path '${installerPath.replace(/'/g, "''")}' -DestinationPath '${currentDir.replace(/'/g, "''")}' -Force"
echo [3/3] 解压覆盖完成！正在自动启动新版本...
start "" "${currentExe}"
timeout /t 2 /nobreak >nul
del "%~f0" >nul 2>&1
exit
`;
    }

    fs.writeFileSync(scriptPath, scriptContent, 'utf8');

    // 3. 独立弹出新窗口执行更新安装向导脚本
    const { spawn } = require('child_process');
    const child = spawn('cmd.exe', ['/c', 'start', '""', scriptPath], {
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    // 4. 退出当前软件以释放文件锁
    setTimeout(() => {
      app.quit();
    }, 400);

    return { success: true, message: '正在自动启动安装向导并更新版本...' };
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
