import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export async function getGitHubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN.trim();
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN.trim();

  // 1. Try Windows Advapi32 CredRead for "GitHub - https://api.github.com/zoufudun"
  try {
    const psScript = [
      'Add-Type -TypeDefinition @"',
      'using System;',
      'using System.Runtime.InteropServices;',
      'using System.Text;',
      'public class CredMgr {',
      '    [DllImport("Advapi32.dll", SetLastError = true, EntryPoint = "CredReadW", CharSet = CharSet.Unicode)]',
      '    public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);',
      '    [DllImport("Advapi32.dll", SetLastError = true, EntryPoint = "CredFree")]',
      '    public static extern void CredFree(IntPtr cred);',
      '    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]',
      '    public struct CREDENTIAL {',
      '        public int Flags; public int Type; public string TargetName; public string Comment;',
      '        public long LastWritten; public int CredentialBlobSize; public IntPtr CredentialBlob;',
      '        public int Persist; public int AttributeCount; public IntPtr Attributes;',
      '        public string TargetAlias; public string UserName;',
      '    }',
      '    public static string GetPassword(string target) {',
      '        IntPtr credPtr;',
      '        if (CredRead(target, 1, 0, out credPtr)) {',
      '            try {',
      '                CREDENTIAL cred = (CREDENTIAL)Marshal.PtrToStructure(credPtr, typeof(CREDENTIAL));',
      '                if (cred.CredentialBlob != IntPtr.Zero && cred.CredentialBlobSize > 0) {',
      '                    byte[] blob = new byte[cred.CredentialBlobSize];',
      '                    Marshal.Copy(cred.CredentialBlob, blob, 0, cred.CredentialBlobSize);',
      '                    return Encoding.UTF8.GetString(blob);',
      '                }',
      '            } finally { CredFree(credPtr); }',
      '        }',
      '        return null;',
      '    }',
      '}',
      '"@',
      '[CredMgr]::GetPassword("GitHub - https://api.github.com/zoufudun")'
    ].join('\r\n');

    const tempPs = path.resolve('.temp_read_cred.ps1');
    fs.writeFileSync(tempPs, psScript, 'utf8');
    try {
      const out = execSync('pwsh -NoProfile -ExecutionPolicy Bypass -File .temp_read_cred.ps1', { timeout: 8000 }).toString().trim();
      if (out && out.length >= 20) {
        return out;
      }
    } finally {
      if (fs.existsSync(tempPs)) fs.unlinkSync(tempPs);
    }
  } catch (e) {}

  // 2. Fallback to git credential fill
  try {
    const creds = execSync('git credential fill', {
      input: 'protocol=https\nhost=github.com\n\n',
      timeout: 5000
    }).toString();
    for (const line of creds.split('\n')) {
      if (line.startsWith('password=')) {
        return line.replace('password=', '').trim();
      }
    }
  } catch (e) {}

  throw new Error('Could not find GitHub token from git credentials');
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
      name: `v${ver}: 官网全页面英文国际化支持、侧边栏双图标并排同大、更新团队联系邮箱、发布四种离线安装包`,
      body: `## 衡绩员工绩点考核系统 v${ver}\n\n### 💡 核心体验升级与更新说明：\n1. **官网全页面完整英文支持 (100% English i18n)**：针对国际化使用场景，官网顶部通告、导航栏、Hero、交互式六大模块预览窗口（全景驾驶舱、防透支排期、月底集中大表、项目组矩阵、花名册、绩效准则、核算员汇总、双向闭环矩阵、绩星殿堂、数据资产）、六大支柱、五步流程、四种安装包矩阵、更新日志与五步文档全部完成地道英文双语适配，切换 EN 即可秒速转为全英文浏览；\n2. **品牌双图标并排同大规范呈现**：左侧品牌徽标全面调整为“方印章 + 衡绩彩瓣花”并排横向平铺架构，两枚图标均保持 28px × 28px 相同大小，视觉对称优雅、层次分明；\n3. **团队署名与联系方式规范**：统一更新版权与关于说明为“TOPFIRE 研发团队”，联系邮箱更新为 \`phudoncou@outlook.com\`，规范全站联系入口；\n4. **四大离线客户端分发包发布**：\n   - **EXE 安装版**：\`hengji-${ver}.exe\`（NSIS 标准交互安装向导，支持平滑升级）；\n   - **MSI 企业级包**：\`hengji-${ver}.msi\`（Windows Installer 标准包，支持自定义非系统盘）；\n   - **Portable 便携单文件**：\`hengji-portable-${ver}.exe\`（绿色免安装单文件版）；\n   - **ZIP 绿色压缩包**：\`hengji-${ver}.zip\`（解压即用免安装包）。`,
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

if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('publish-release-github.mjs')) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}
