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
  const ver = pkg.version || '0.7.8';
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
      name: `v${ver}: 侧栏徽标尊贵加大、二维透视矩阵全量规范万单位、前五名榜单直观重构、多格式覆盖安装修复`,
      body: `## 衡绩员工绩点考核系统 v${ver}\n\n### 💡 核心体验升级与更新说明：\n1. **侧边栏品牌徽标尊贵加大**：侧边栏“衡”字主徽标尺寸升级加大至 52px，搭配 21px 醒目品牌字体，视觉中心更为稳重大气；\n2. **二维透视矩阵绩点全量规范以“万”为单位**：修正透视矩阵计算，各项目分润与右侧【个人累加】、底行【项目累加】全量以“万元”为标准单位严格对齐，表头清晰标示“个人累加 (万)”与“绩点单位：万元”；\n3. **当月个人绩点前五名直观排行榜重构**：全新设计前五名排行榜体验，金银铜牌勋章、员工专属头像与团队标签、高辨识度进度柱状对比条、万元清晰大字号数值，直观震撼一目了然；\n4. **覆盖安装与多格式安装进程全面修复**：彻底修复覆盖安装、MSI安装、单文件覆盖、解压覆盖退出后无安装进程的问题，独立弹出高可靠向导控制台，安装进程全程清晰可见无缝接管；\n5. **四重分发矩阵与统一命名规范**：\n   - **EXE 安装版**：\`hengji-${ver}.exe\`（NSIS 交互安装向导）；\n   - **MSI 安装包**：\`hengji-${ver}.msi\`（Windows Installer 标准向导）；\n   - **ZIP 绿色版**：\`hengji-${ver}.zip\`（解压即用）；\n   - **便携单文件**：\`hengji-portable-${ver}.exe\`（免安装单文件版）。`,
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
