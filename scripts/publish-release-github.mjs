import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function getGitHubToken() {
  const creds = execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n' }).toString();
  let token = '';
  for (const line of creds.split('\n')) {
    if (line.startsWith('password=')) {
      token = line.replace('password=', '').trim();
    }
  }
  if (!token) {
    throw new Error('Could not find GitHub token from git credentials');
  }
  return token;
}

async function main() {
  const token = await getGitHubToken();
  const repo = 'zoufudun/hengji';
  const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
  const ver = pkg.version || '0.7.9';
  const tag = `v${ver}`;
  const headers = {
    'Authorization': `token ${token}`,
    'User-Agent': 'HengJi-Release-Publisher',
    'Accept': 'application/vnd.github.v3+json'
  };

  console.log(`Checking existing release for tag ${tag} in ${repo}...`);
  let release = null;
  const checkRes = await fetch(`https://api.github.com/repos/${repo}/releases/tags/${tag}`, { headers });
  if (checkRes.ok) {
    release = await checkRes.json();
    console.log(`Found existing release: ${release.id} (${release.tag_name})`);
  } else if (checkRes.status === 404) {
    console.log(`Release ${tag} not found, creating new release...`);
    const createBody = {
      tag_name: tag,
      target_commitish: 'main',
      name: `v${ver}: 点击下载弹出四种安装方式选择、MSI非系统盘安装地址自定义、消除终端弹窗、启动页新增关于与检测新版`,
      body: `## 衡绩员工绩点考核系统 v${ver}\n\n### 💡 核心体验升级与更新说明：\n1. **点击下载弹出四种安装方式选择与多源高速下载**：修复检测到新版后点击下载转圈无法下载的问题，内置本地智能识别与多加速源自动切换及实时百分比进度条；点击下载立即弹出四种安装方式选择器（EXE安装版、MSI安装包、便携单文件、ZIP绿色版）；\n2. **MSI安装及全格式自定义安装路径（默认非系统盘）**：新增安装目标地址设置栏与文件夹浏览选择器，默认指向 \`D:\\衡绩员工绩点考核系统\` 等非系统盘，绝不默认装入系统盘；MSI 安装向导全程开启安装目录修改界面；\n3. **彻底消除终端命令行弹窗**：全面重构四种安装方式的底层执行机制，采用原生 GUI 进程直启与无窗口后台任务（\`windowsHide: true\`），点击覆盖安装、MSI安装、单文件覆盖、解压覆盖均平滑静默运行，不再弹出黑框/蓝框终端窗口；\n4. **安全工作区初始页新增“关于”与“检测新版”**：在“选择你的安全工作区”初始画面新增“关于系统”与“检测新版”快捷入口，无需进入工作区即可直接查看系统关于页面并实时检测与升级新版本；\n5. **四重分发矩阵与统一命名规范**：\n   - **EXE 安装版**：\`hengji-${ver}.exe\`（NSIS 交互安装向导）；\n   - **MSI 安装包**：\`hengji-${ver}.msi\`（Windows Installer 标准向导，可选安装目录）；\n   - **ZIP 绿色版**：\`hengji-${ver}.zip\`（解压即用）；\n   - **便携单文件**：\`hengji-portable-${ver}.exe\`（免安装单文件版）。`,
      draft: false,
      prerelease: false
    };
    const createRes = await fetch(`https://api.github.com/repos/${repo}/releases`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(createBody)
    });
    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Failed to create release: ${createRes.status} ${err}`);
    }
    release = await createRes.json();
    console.log(`Successfully created release: ${release.id}`);
  } else {
    throw new Error(`Failed to check release: ${checkRes.status} ${await checkRes.text()}`);
  }

  // 待上传官方统一资产列表
  const filesToUpload = [
    { src: `dist-desktop/hengji-${ver}.msi`, name: `hengji-${ver}.msi` },
    { src: `dist-desktop/hengji-${ver}.exe`, name: `hengji-${ver}.exe` },
    { src: `dist-desktop/hengji-${ver}.zip`, name: `hengji-${ver}.zip` },
    { src: `dist-desktop/hengji-portable-${ver}.exe`, name: `hengji-portable-${ver}.exe` }
  ];

  // 刷新获取当前已有资产
  const relRes = await fetch(`https://api.github.com/repos/${repo}/releases/${release.id}`, { headers });
  const currentRelease = relRes.ok ? await relRes.json() : release;
  const existingAssets = currentRelease.assets || [];

  for (const item of filesToUpload) {
    if (!fs.existsSync(item.src)) {
      console.warn(`File not found: ${item.src}, skipping`);
      continue;
    }

    const fileSize = fs.statSync(item.src).size;
    const matchedAsset = existingAssets.find(a => a.name === item.name);
    if (matchedAsset) {
      if (Math.abs(matchedAsset.size - fileSize) < 1024) {
        console.log(`✔ Asset ${item.name} (${(matchedAsset.size / 1024 / 1024).toFixed(2)} MB) already uploaded, skipping.`);
        continue;
      }
      console.log(`Asset ${item.name} exists with different size, deleting old asset...`);
      await fetch(`https://api.github.com/repos/${repo}/releases/assets/${matchedAsset.id}`, {
        method: 'DELETE',
        headers
      });
    }

    console.log(`Uploading ${item.name} (${(fileSize / 1024 / 1024).toFixed(2)} MB)...`);
    const fileBuffer = fs.readFileSync(item.src);
    const uploadUrl = `https://uploads.github.com/repos/${repo}/releases/${release.id}/assets?name=${encodeURIComponent(item.name)}`;
    const contentType = item.name.endsWith('.msi')
      ? 'application/x-msi'
      : item.name.endsWith('.zip')
      ? 'application/zip'
      : 'application/vnd.microsoft.portable-executable';

    let success = false;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `token ${token}`,
            'User-Agent': 'HengJi-Release-Publisher',
            'Content-Type': contentType,
            'Content-Length': String(fileBuffer.length)
          },
          body: fileBuffer
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.text();
          console.error(`Attempt ${attempt} failed for ${item.name}: ${uploadRes.status} ${err}`);
        } else {
          const uploaded = await uploadRes.json();
          console.log(`✔ Successfully uploaded ${item.name} (${uploaded.browser_download_url})`);
          success = true;
          break;
        }
      } catch (e) {
        console.warn(`Attempt ${attempt} network error for ${item.name}:`, e.message);
      }
      if (attempt < 3) {
        console.log(`Retrying in 3 seconds...`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
    if (!success) {
      throw new Error(`Failed to upload ${item.name} after 3 attempts`);
    }
  }

  console.log(`\n🎉 All v${ver} assets uploaded successfully to GitHub Releases!`);
  console.log(`Release URL: ${release.html_url}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
