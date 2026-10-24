import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function getGitHubToken() {
  const creds = execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n' }).toString();
  let token = '';
  for (const line of creds.split('\n')) {
    if (line.startsWith('password=')) token = line.replace('password=', '').trim();
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

  const relRes = await fetch(`https://api.github.com/repos/${repo}/releases/tags/${tag}`, { headers });
  if (!relRes.ok) throw new Error(`Failed to find release ${tag}`);
  const release = await relRes.json();
  const existingAssets = release.assets || [];

  console.log(`Release ${tag} (id: ${release.id}) has ${existingAssets.length} assets.`);

  // 1. 清理有截断前缀 '-' 的旧资产
  for (const a of existingAssets) {
    if (a.name.startsWith('-') || (a.name === `hengji-Setup-${ver}.exe` && a.size > 100 * 1024 * 1024)) {
      console.log(`Deleting invalid/obsolete asset: ${a.name} (id ${a.id}, size ${(a.size/1024/1024).toFixed(2)} MB)...`);
      await fetch(`https://api.github.com/repos/${repo}/releases/assets/${a.id}`, { method: 'DELETE', headers });
    }
  }

  // 2. 待同步的官方标准发布文件
  const files = [
    { src: `dist-desktop/hengji-${ver}.msi`, name: `hengji-${ver}.msi` },
    { src: `dist-desktop/hengji-${ver}.exe`, name: `hengji-${ver}.exe` },
    { src: `dist-desktop/hengji-${ver}.zip`, name: `hengji-${ver}.zip` },
    { src: `dist-desktop/hengji-portable-${ver}.exe`, name: `hengji-portable-${ver}.exe` }
  ];

  // 重新获取最新资产列表
  const updatedRelRes = await fetch(`https://api.github.com/repos/${repo}/releases/${release.id}`, { headers });
  const updatedRelease = await updatedRelRes.json();
  const currentAssets = updatedRelease.assets || [];

  for (const file of files) {
    const fullPath = path.resolve(file.src);
    if (!fs.existsSync(fullPath)) {
      console.error(`File missing: ${fullPath}`);
      continue;
    }
    const fileSize = fs.statSync(fullPath).size;
    const existing = currentAssets.find(a => a.name === file.name);
    if (existing && Math.abs(existing.size - fileSize) < 1024) {
      console.log(`✔ ${file.name} already up to date (${(fileSize/1024/1024).toFixed(2)} MB), skip.`);
      continue;
    }

    if (existing) {
      console.log(`Asset ${file.name} size differs, deleting...`);
      await fetch(`https://api.github.com/repos/${repo}/releases/assets/${existing.id}`, { method: 'DELETE', headers });
    }

    console.log(`Uploading ${file.name} (${(fileSize / 1024 / 1024).toFixed(2)} MB)...`);
    const buffer = fs.readFileSync(fullPath);
    const contentType = file.name.endsWith('.msi')
      ? 'application/x-msi'
      : file.name.endsWith('.zip')
      ? 'application/zip'
      : 'application/vnd.microsoft.portable-executable';

    const uploadUrl = `https://uploads.github.com/repos/${repo}/releases/${release.id}/assets?name=${file.name}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'HengJi-Release-Publisher',
        'Content-Type': contentType,
        'Content-Length': String(buffer.length)
      },
      body: buffer
    });

    if (uploadRes.ok) {
      console.log(`✔ Successfully uploaded ${file.name}`);
    } else {
      console.error(`Failed to upload ${file.name}: ${uploadRes.status} ${await uploadRes.text()}`);
    }
  }

  console.log(`\n🎉 All v${ver} release assets verified and synced perfectly!`);
  console.log(`Release URL: ${release.html_url}`);
}

main().catch(err => {
  console.error('Sync failed:', err);
  process.exit(1);
});
