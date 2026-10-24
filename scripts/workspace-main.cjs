const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
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

// 获取默认的非系统盘安装目录（优先当前非系统盘目录，其次 D:\ / E:\ / F:\）
function getDefaultInstallDir() {
  const currentDir = path.dirname(process.execPath);
  const upperCurrent = currentDir.toUpperCase();
  if (
    !upperCurrent.startsWith('C:') &&
    !upperCurrent.includes('\\TEMP\\') &&
    !upperCurrent.includes('\\NODE_MODULES\\') &&
    !upperCurrent.includes('\\DIST-DESKTOP')
  ) {
    return currentDir;
  }

  const nonSystemDrives = ['D:\\', 'E:\\', 'F:\\', 'G:\\'];
  for (const drive of nonSystemDrives) {
    try {
      if (fs.existsSync(drive)) {
        return path.join(drive, '衡绩员工绩点考核系统');
      }
    } catch {}
  }

  return path.join(app.getPath('documents') || 'D:\\', '衡绩员工绩点考核系统');
}

function getDefaultDownloadDir() {
  const nonSystemDrives = ['D:\\', 'E:\\', 'F:\\'];
  for (const drive of nonSystemDrives) {
    try {
      if (fs.existsSync(drive)) return drive;
    } catch {}
  }
  return app.getPath('downloads') || app.getPath('desktop') || os.tmpdir();
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

  ipcMain.handle('workspace:get-default-install-dir', () => {
    return getDefaultInstallDir();
  });

  ipcMain.handle('workspace:choose-install-dir', async (_event, currentPath) => {
    const win = BrowserWindow.fromWebContents(_event.sender) || BrowserWindow.getFocusedWindow();
    let defaultPath = typeof currentPath === 'string' && currentPath.trim() ? currentPath.trim() : getDefaultInstallDir();
    try {
      if (!fs.existsSync(defaultPath)) {
        const parentDir = path.dirname(defaultPath);
        defaultPath = fs.existsSync(parentDir) ? parentDir : getDefaultDownloadDir();
      }
    } catch {
      defaultPath = getDefaultDownloadDir();
    }
    const result = await dialog.showOpenDialog(win, {
      title: '选择安装目标地址（建议选择 D 盘等非系统盘）',
      defaultPath,
      properties: ['openDirectory', 'createDirectory']
    });
    restoreFocus(win);
    if (result.canceled || !result.filePaths || result.filePaths.length === 0) return null;
    let chosen = result.filePaths[0];
    // 如果用户直接选择了盘符根目录（如 D:\），自动追加子目录名称保持整洁
    if (/^[A-Za-z]:\\?$/.test(chosen.trim())) {
      chosen = path.join(chosen.trim(), '衡绩员工绩点考核系统');
    }
    return chosen;
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
        `hengji-portable.exe`
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

  function sendProgress(win, data) {
    try {
      if (win && !win.isDestroyed() && win.webContents) {
        win.webContents.send('workspace:update-progress', data);
      }
    } catch {}
  }

  async function downloadStreamFromUrl(url, destFile, onChunkProgress) {
    const controller = new AbortController();
    let connectTimer = setTimeout(() => controller.abort(new Error('连接超时')), 9000);
    let stallTimer = null;

    const resetStallTimer = () => {
      if (stallTimer) clearTimeout(stallTimer);
      stallTimer = setTimeout(() => controller.abort(new Error('下载流传输超时')), 15000);
    };

    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Hengji-Desktop-Updater/1.0'
        }
      });
      clearTimeout(connectTimer);
      connectTimer = null;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = String(response.headers.get('content-type') || '').toLowerCase();
      if (contentType.includes('text/html')) {
        throw new Error('返回了 HTML 页面而非二进制安装包');
      }

      const totalBytes = parseInt(response.headers.get('content-length') || '0', 10) || 0;
      if (totalBytes > 0 && totalBytes < 512 * 1024) {
        throw new Error('文件体积异常');
      }

      const tempPart = `${destFile}.part-${Date.now()}`;
      const fileStream = fs.createWriteStream(tempPart);
      let transferred = 0;
      let lastReportTime = 0;

      resetStallTimer();

      if (response.body && typeof response.body.getReader === 'function') {
        const reader = response.body.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          resetStallTimer();
          if (value && value.byteLength > 0) {
            transferred += value.byteLength;
            fileStream.write(Buffer.from(value));
            const now = Date.now();
            if (now - lastReportTime > 120) {
              lastReportTime = now;
              const percent = totalBytes > 0 ? Math.min(99, Math.round((transferred / totalBytes) * 100)) : 50;
              onChunkProgress({
                percent,
                transferredMB: (transferred / 1024 / 1024).toFixed(1),
                totalMB: totalBytes > 0 ? (totalBytes / 1024 / 1024).toFixed(1) : '未知'
              });
            }
          }
        }
      } else {
        const arrayBuf = await response.arrayBuffer();
        transferred = arrayBuf.byteLength;
        fileStream.write(Buffer.from(arrayBuf));
      }

      if (stallTimer) clearTimeout(stallTimer);
      await new Promise((resolve, reject) => {
        fileStream.end((err) => (err ? reject(err) : resolve()));
      });

      const finalStat = fs.statSync(tempPart);
      if (finalStat.size < 1024 * 1024) {
        try { fs.unlinkSync(tempPart); } catch {}
        throw new Error('下载的文件不完整');
      }

      if (fs.existsSync(destFile)) {
        try { fs.unlinkSync(destFile); } catch {}
      }
      fs.renameSync(tempPart, destFile);
      return true;
    } catch (err) {
      if (connectTimer) clearTimeout(connectTimer);
      if (stallTimer) clearTimeout(stallTimer);
      throw err;
    }
  }

  async function obtainUpdateFile({ ver, format, targetDir, win }) {
    const filenames = getAssetFilenames(ver, format);
    const primaryFilename = filenames[0];
    const destDir = targetDir || getDefaultDownloadDir();
    try { fs.mkdirSync(destDir, { recursive: true }); } catch {}
    const targetPath = path.join(destDir, primaryFilename);

    sendProgress(win, {
      status: 'locating',
      format,
      percent: 5,
      message: `正在准备 ${primaryFilename}...`
    });

    const execDir = path.dirname(process.execPath);
    const searchDirs = [
      execDir,
      path.join(execDir, '..'),
      path.join(execDir, '..', 'dist-desktop'),
      path.join(__dirname, '..', 'dist-desktop'),
      path.join(__dirname, '..', '..', 'dist-desktop'),
      path.join(__dirname, '..', '..', '..', 'dist-desktop'),
      path.join(process.cwd(), 'dist-desktop'),
      destDir,
      'D:\\',
      app.getPath('downloads'),
      app.getPath('desktop'),
      os.tmpdir()
    ].filter(Boolean);

    for (const fn of filenames) {
      for (const dir of searchDirs) {
        try {
          const src = path.join(dir, fn);
          if (fs.existsSync(src)) {
            const stats = fs.statSync(src);
            if (stats.size > 1024 * 1024) {
              if (path.resolve(src) !== path.resolve(targetPath)) {
                fs.copyFileSync(src, targetPath);
              }
              sendProgress(win, {
                status: 'done',
                format,
                percent: 100,
                transferredMB: (stats.size / 1024 / 1024).toFixed(1),
                totalMB: (stats.size / 1024 / 1024).toFixed(1),
                message: `安装包已就绪: ${targetPath}`
              });
              return { filePath: targetPath, folder: destDir, fileName: primaryFilename };
            }
          }
        } catch {}
      }
    }

    // 构建多源高速下载通道（国内加速镜像优先 + 官方源兜底）
    const candidateUrls = [];
    for (const fn of filenames) {
      const githubReleaseUrl = `https://github.com/zoufudun/hengji/releases/download/v${ver}/${encodeURIComponent(fn)}`;
      candidateUrls.push(
        `https://ghfast.top/${githubReleaseUrl}`,
        `https://gh-proxy.com/${githubReleaseUrl}`,
        `https://mirror.ghproxy.com/${githubReleaseUrl}`,
        githubReleaseUrl
      );
    }

    let downloaded = false;
    let lastError = null;
    for (let i = 0; i < candidateUrls.length; i++) {
      const url = candidateUrls[i];
      try {
        sendProgress(win, {
          status: 'downloading',
          format,
          percent: 8,
          message: `正在连接高速下载通道 (${i + 1}/${candidateUrls.length})...`
        });
        await downloadStreamFromUrl(url, targetPath, ({ percent, transferredMB, totalMB }) => {
          sendProgress(win, {
            status: 'downloading',
            format,
            percent,
            transferredMB,
            totalMB,
            message: `正在下载 ${primaryFilename}: ${percent}% (${transferredMB} MB / ${totalMB} MB)`
          });
        });
        downloaded = true;
        break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!downloaded) {
      sendProgress(win, {
        status: 'error',
        format,
        message: `下载失败: ${lastError ? lastError.message : '无法连接下载服务器'}`
      });
      throw new Error(`未能下载 ${primaryFilename}，请检查网络连接或稍后重试`);
    }

    const finalStats = fs.statSync(targetPath);
    sendProgress(win, {
      status: 'done',
      format,
      percent: 100,
      transferredMB: (finalStats.size / 1024 / 1024).toFixed(1),
      totalMB: (finalStats.size / 1024 / 1024).toFixed(1),
      message: `下载完成: ${targetPath}`
    });

    return {
      filePath: targetPath,
      folder: destDir,
      fileName: primaryFilename
    };
  }

  ipcMain.handle('workspace:download-update', async (_event, payload) => {
    const win = BrowserWindow.fromWebContents(_event.sender) || BrowserWindow.getFocusedWindow();
    const ver = (payload && payload.version) ? String(payload.version).replace(/^v/, '') : '0.7.9';
    const format = payload && payload.format ? String(payload.format).toLowerCase() : 'setup';
    const targetDir = (payload && payload.targetDir && String(payload.targetDir).trim())
      ? String(payload.targetDir).trim()
      : getDefaultDownloadDir();

    const result = await obtainUpdateFile({ ver, format, targetDir, win });

    return {
      success: true,
      filePath: result.filePath,
      folder: result.folder,
      fileName: result.fileName,
      format
    };
  });

  ipcMain.handle('workspace:install-update', async (_event, payload) => {
    const win = BrowserWindow.fromWebContents(_event.sender) || BrowserWindow.getFocusedWindow();
    const ver = (payload && payload.version) ? String(payload.version).replace(/^v/, '') : '0.7.9';
    const format = payload && payload.format ? String(payload.format).toLowerCase() : 'setup';
    const currentExe = process.execPath;
    const targetInstallDir = (payload && payload.installDir && String(payload.installDir).trim())
      ? String(payload.installDir).trim()
      : getDefaultInstallDir();

    try {
      fs.mkdirSync(targetInstallDir, { recursive: true });
    } catch {}

    let installerPath = (payload && payload.filePath && fs.existsSync(payload.filePath))
      ? payload.filePath
      : null;

    if (!installerPath) {
      const obtained = await obtainUpdateFile({
        ver,
        format,
        targetDir: getDefaultDownloadDir(),
        win
      });
      installerPath = obtained.filePath;
    }

    sendProgress(win, {
      status: 'installing',
      format,
      percent: 100,
      message: `正在启动安装程序并更新至 ${targetInstallDir}...`
    });

    // 四种安装方式均采用无终端窗口 (windowsHide: true) 原生启动，绝不弹出黑框或蓝框命令行终端
    if (format === 'setup') {
      // 1. EXE 安装版 (NSIS 原生图形向导，自动预填所选非系统盘目录)
      const child = spawn(installerPath, [`/D=${targetInstallDir}`], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true
      });
      child.unref();
    } else if (format === 'msi') {
      // 2. MSI 安装包 (Windows Installer 原生图形向导，传入用户选择的非系统盘安装地址)
      const child = spawn('msiexec.exe', [
        '/i',
        installerPath,
        `APPLICATIONFOLDER=${targetInstallDir}`,
        `INSTALLDIR=${targetInstallDir}`,
        `TARGETDIR=${targetInstallDir}`,
        'WixAppFolder=WixPerMachineFolder',
        'ALLUSERS=1'
      ], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true
      });
      child.unref();
    } else if (format === 'portable') {
      // 3. 便携单文件覆盖更新（后台静默替换并重启，windowsHide: true 绝不弹出终端窗口）
      const isPackagedExe = app.isPackaged && !currentExe.toLowerCase().endsWith('electron.exe');
      const targetExe = isPackagedExe
        ? currentExe
        : path.join(targetInstallDir, `衡绩员工绩点考核系统-${ver}.exe`);
      const srcEscaped = installerPath.replace(/'/g, "''");
      const dstEscaped = targetExe.replace(/'/g, "''");
      const psScript = `
Start-Sleep -Milliseconds 1500
$retry = 0
while ($retry -lt 15) {
  try {
    Copy-Item -LiteralPath '${srcEscaped}' -Destination '${dstEscaped}' -Force -ErrorAction Stop
    break
  } catch {
    $retry++
    Start-Sleep -Milliseconds 800
  }
}
Start-Process -FilePath '${dstEscaped}'
`;
      const child = spawn('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-WindowStyle',
        'Hidden',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        psScript
      ], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true
      });
      child.unref();
    } else {
      // 4. ZIP 绿色解压覆盖版（后台静默解压至目标目录并自动启动，windowsHide: true 绝不弹出终端窗口）
      const srcEscaped = installerPath.replace(/'/g, "''");
      const dirEscaped = targetInstallDir.replace(/'/g, "''");
      const fallbackExeEscaped = currentExe.replace(/'/g, "''");
      const psScript = `
Start-Sleep -Milliseconds 1500
try {
  Expand-Archive -LiteralPath '${srcEscaped}' -DestinationPath '${dirEscaped}' -Force -ErrorAction Stop
} catch {}
$exeCandidate = Join-Path '${dirEscaped}' '衡绩员工绩点考核系统.exe'
if (Test-Path -LiteralPath $exeCandidate) {
  Start-Process -FilePath $exeCandidate
} elseif (Test-Path -LiteralPath '${fallbackExeEscaped}') {
  Start-Process -FilePath '${fallbackExeEscaped}'
}
`;
      const child = spawn('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-WindowStyle',
        'Hidden',
        '-ExecutionPolicy',
        'Bypass',
        '-Command',
        psScript
      ], {
        detached: true,
        stdio: 'ignore',
        windowsHide: true
      });
      child.unref();
    }

    setTimeout(() => {
      app.quit();
    }, 350);

    return {
      success: true,
      installDir: targetInstallDir,
      message: '已启动无终端静默更新流程...'
    };
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
