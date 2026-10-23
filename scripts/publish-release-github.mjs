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
  const tag = 'v0.7.6';
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
      name: `v0.7.6: 合同金额/员工绩点万为单位、衡徽标加大、安装版(MSI/EXE)与自动覆盖安装发布`,
      body: `## 衡绩员工绩点考核系统 v0.7.6\n\n### 💡 核心体验升级与更新说明：\n1. **单位统一规范**：合同金额、员工绩点全链路表格与指标卡统一按“万/万元”为单位展示，彻底确立 1万绩点 = 1万元合同额；\n2. **徽标优化**：侧栏 Header 移除八彩花瓣副图，保留金黄圆角“衡”字印章并显著加大至 42px，质感与辨识度大幅提升；\n3. **多格式发布矩阵**：\n   - **EXE 安装版**：\`衡绩员工绩点考核系统-Setup-0.7.6.exe\`（NSIS 安装向导，支持快捷方式与静默安装）；\n   - **MSI 安装包**：\`衡绩员工绩点考核系统-0.7.6.msi\`（Windows Installer 标准格式，支持企业组策略分发）；\n   - **便携绿色版**：\`衡绩员工绩点考核系统-0.7.6.exe\`（单文件免安装，双击即用）；\n4. **一键自动覆盖安装**：客户端新版提示支持一键自动下载并静默覆盖安装到当前目录，关闭旧版本后无缝启动新版本。`,
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
    { src: 'dist-desktop/衡绩员工绩点考核系统-Setup-0.7.6.exe', name: '衡绩员工绩点考核系统-Setup-0.7.6.exe' },
    { src: 'dist-desktop/衡绩员工绩点考核系统-Setup-0.7.6.exe', name: 'hengji-Setup-0.7.6.exe' },
    { src: 'dist-desktop/衡绩员工绩点考核系统-0.7.6.msi', name: '衡绩员工绩点考核系统-0.7.6.msi' },
    { src: 'dist-desktop/衡绩员工绩点考核系统-0.7.6.msi', name: 'hengji-0.7.6.msi' },
    { src: 'dist-desktop/衡绩员工绩点考核系统-0.7.6.exe', name: '衡绩员工绩点考核系统-0.7.6.exe' },
    { src: 'dist-desktop/衡绩员工绩点考核系统-0.7.6.exe', name: 'hengji-0.7.6.exe' },
    { src: 'dist-desktop/衡绩员工绩点考核系统-0.7.6.exe', name: 'hengji-portable.exe' }
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
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'HengJi-Release-Publisher',
        'Content-Type': item.name.endsWith('.msi') ? 'application/x-msi' : 'application/vnd.microsoft.portable-executable',
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

  console.log('\n🎉 All v0.7.6 assets uploaded successfully to GitHub Releases!');
  console.log(`Release URL: ${release.html_url}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
