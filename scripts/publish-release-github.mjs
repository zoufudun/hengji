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
  const tag = 'v0.7.7';
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
      name: `v0.7.7: MSI安装修复、顶部栏精简、弹窗现代彩瓣徽标、新增ZIP绿色解压版发布`,
      body: `## 衡绩员工绩点考核系统 v0.7.7\n\n### 💡 核心体验升级与更新说明：\n1. **MSI 安装包交互向导修复**：修正 Windows Installer 交互向导与参数配置（关闭静默 oneClick，开启图形安装向导），解决用户双击 MSI 文件后无反应的系统问题，支持标准交互安装与桌面快捷方式创建；\n2. **顶部导航栏极简净化**：移除顶部冗余的【关于】与【操作手册】按钮，工作台视图更为整洁聚焦；\n3. **弹窗徽标品牌升级**：版本更新与关于弹窗顶部标识升级为现代八彩花瓣艺术图标（高分辨率品牌原图），主界面侧栏继续保留大号金黄“衡”字印章；\n4. **新增 ZIP 绿色解压版**：正式引入 \`衡绩员工绩点考核系统-0.7.7.zip\`，用户下载后直接解压即可运行，零依赖、免安装、双击即用；\n5. **四重分发矩阵与一键覆盖安装**：\n   - **EXE 安装版**：\`衡绩员工绩点考核系统-Setup-0.7.7.exe\`（NSIS 安装向导）；\n   - **MSI 安装包**：\`衡绩员工绩点考核系统-0.7.7.msi\`（Windows Installer 标准向导）；\n   - **ZIP 绿色版**：\`衡绩员工绩点考核系统-0.7.7.zip\`（下载解压即用）；\n   - **便携单文件**：\`衡绩员工绩点考核系统-0.7.7.exe\`（单文件免安装）；\n   - 客户端内支持一键静默自动覆盖安装并无缝重启。`,
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

  // 待上传资产映射列表（中文原名 + ASCII 别名）
  const filesToUpload = [
    { src: 'dist-desktop/衡绩员工绩点考核系统-Setup-0.7.7.exe', name: '衡绩员工绩点考核系统-Setup-0.7.7.exe' },
    { src: 'dist-desktop/衡绩员工绩点考核系统-Setup-0.7.7.exe', name: 'hengji-Setup-0.7.7.exe' },
    { src: 'dist-desktop/衡绩员工绩点考核系统-0.7.7.msi', name: '衡绩员工绩点考核系统-0.7.7.msi' },
    { src: 'dist-desktop/衡绩员工绩点考核系统-0.7.7.msi', name: 'hengji-0.7.7.msi' },
    { src: 'dist-desktop/衡绩员工绩点考核系统-0.7.7.zip', name: '衡绩员工绩点考核系统-0.7.7.zip' },
    { src: 'dist-desktop/衡绩员工绩点考核系统-0.7.7.zip', name: 'hengji-0.7.7.zip' },
    { src: 'dist-desktop/衡绩员工绩点考核系统-0.7.7.exe', name: '衡绩员工绩点考核系统-0.7.7.exe' },
    { src: 'dist-desktop/衡绩员工绩点考核系统-0.7.7.exe', name: 'hengji-0.7.7.exe' },
    { src: 'dist-desktop/衡绩员工绩点考核系统-0.7.7.exe', name: 'hengji-portable.exe' }
  ];

  const existingAssets = release.assets || [];

  for (const item of filesToUpload) {
    if (!fs.existsSync(item.src)) {
      console.warn(`File not found: ${item.src}, skipping`);
      continue;
    }

    const matchedAsset = existingAssets.find(a => a.name === item.name);
    if (matchedAsset) {
      console.log(`Asset ${item.name} already exists (id ${matchedAsset.id}), deleting old asset...`);
      await fetch(`https://api.github.com/repos/${repo}/releases/assets/${matchedAsset.id}`, {
        method: 'DELETE',
        headers
      });
    }

    console.log(`Uploading ${item.name} (${(fs.statSync(item.src).size / 1024 / 1024).toFixed(2)} MB)...`);
    const fileBuffer = fs.readFileSync(item.src);
    const uploadUrl = `https://uploads.github.com/repos/${repo}/releases/${release.id}/assets?name=${encodeURIComponent(item.name)}`;
    const contentType = item.name.endsWith('.msi')
      ? 'application/x-msi'
      : item.name.endsWith('.zip')
      ? 'application/zip'
      : 'application/vnd.microsoft.portable-executable';
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
      console.error(`Failed to upload ${item.name}: ${uploadRes.status} ${err}`);
    } else {
      const uploaded = await uploadRes.json();
      console.log(`✔ Successfully uploaded ${item.name} (${uploaded.browser_download_url})`);
    }
  }

  console.log('\n🎉 All v0.7.7 assets uploaded successfully to GitHub Releases!');
  console.log(`Release URL: ${release.html_url}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
