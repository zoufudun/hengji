import fs from 'fs';
import path from 'path';
import { execSync, execFileSync } from 'child_process';

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
  const ver = pkg.version || '0.7.13';
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
      name: `v${ver}: 修复核算员总表“查看明细”具体细目下钻与联动跳转、白屏保护及多周期按月数据包流转`,
      body: `## 衡绩员工绩点考核系统 v${ver}\n\n### 💡 核心修复与体验升级说明：\n1. **修复核算员“查看明细”居中弹窗与具体绩效分配细目下钻**：\n   - 补全 \`.modal-mask\` 与 \`.modal-container\` 固定居中弹窗样式，点击全员跨项目绩效总表（标准视图与多月平铺矩阵）中的“查看明细”立即居中弹出员工全景档案；\n   - 档案首屏新增逐月、逐项目**具体绩效分配细目流水表**（含考核月份、工作令号、项目名称、当月分润比例、获得绩点、折合金额、工作履职内容及合计行），支持“当前所选周期”与“全周期全部细目”切换及单人细目 CSV 导出；\n2. **一键转到【全量明细流水】页按工号筛选与快速返回**：\n   - 下钻档案新增“转到【全量明细流水】页查看”按钮，自动按工号/姓名过滤展示该员工全部细目流水（顶部提供筛选提示栏与一键返回总表按钮）；\n3. **修复综合管理切换核算员导出数据包报错与白屏保护**：\n   - 修正工作区切换及导出流程中 \`exportProjectMeritPackage\` 的参数签名错误，集成 \`Badge\` 组件与 \`SafeAuditorBoundary\` 错误边界保护；\n4. **延续按月/完整数据包导出与多周期合并能力**：\n   - 支持按月导出与完整导出项目数据包，核算员多包合并严格基于“员工工号 + 月份”归集，支持按月/季度/年度/全周期及所有月份平铺矩阵自由切换；\n5. **四大离线客户端分发包同步更新**：\n   - **EXE 安装版**：\`hengji-${ver}.exe\`（NSIS 标准交互安装向导，支持平滑升级）；\n   - **MSI 企业级包**：\`hengji-${ver}.msi\`（Windows Installer 标准包，支持自定义非系统盘）；\n   - **Portable 便携单文件**：\`hengji-portable-${ver}.exe\`（绿色免安装单文件版）；\n   - **ZIP 绿色压缩包**：\`hengji-${ver}.zip\`（解压即用免安装包）。`,
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

  const forceReupload = process.argv.includes('--force');

  for (const item of filesToUpload) {
    if (!fs.existsSync(item.src)) {
      console.warn(`File not found: ${item.src}, skipping`);
      continue;
    }

    const fileSize = fs.statSync(item.src).size;
    const matchedAsset = existingAssets.find(a => a.name === item.name);
    if (matchedAsset) {
      if (!forceReupload && matchedAsset.size === fileSize) {
        console.log(`✔ Asset ${item.name} (${(matchedAsset.size / 1024 / 1024).toFixed(2)} MB) already uploaded, skipping.`);
        continue;
      }
      console.log(`Deleting existing release asset ${item.name} (id: ${matchedAsset.id})...`);
      await fetch(`https://api.github.com/repos/${repo}/releases/assets/${matchedAsset.id}`, {
        method: 'DELETE',
        headers
      });
    }

    console.log(`Uploading ${item.name} (${(fileSize / 1024 / 1024).toFixed(2)} MB)...`);
    const uploadUrl = `https://uploads.github.com/repos/${repo}/releases/${release.id}/assets?name=${encodeURIComponent(item.name)}`;
    const contentType = item.name.endsWith('.msi')
      ? 'application/x-msi'
      : item.name.endsWith('.zip')
      ? 'application/zip'
      : 'application/vnd.microsoft.portable-executable';

    const curlBin = fs.existsSync('D:\\Soft\\Git\\mingw64\\bin\\curl.exe')
      ? 'D:\\Soft\\Git\\mingw64\\bin\\curl.exe'
      : 'curl.exe';

    let success = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const curlArgs = [
          '-s', '-S',
          '--http1.1',
          '--connect-timeout', '60',
          '-X', 'POST',
          '-H', `Authorization: token ${token}`,
          '-H', 'User-Agent: HengJi-Release-Publisher',
          '-H', `Content-Type: ${contentType}`,
          '-H', `Content-Length: ${fileSize}`,
          '--data-binary', `@${item.src}`,
          uploadUrl
        ];
        const resText = execFileSync(curlBin, curlArgs, { encoding: 'utf8', timeout: 1200000 });
        const uploaded = JSON.parse(resText);
        if (uploaded.id && uploaded.name) {
          console.log(`✔ Successfully uploaded ${item.name} (${uploaded.browser_download_url})`);
          success = true;
          break;
        } else {
          console.error(`Attempt ${attempt} upload response error for ${item.name}:`, resText);
        }
      } catch (e) {
        console.warn(`Attempt ${attempt} network error for ${item.name}:`, e.message);
      }

      // Check if GitHub actually received it or created a conflicting asset
      try {
        const verifyRes = await fetch(`https://api.github.com/repos/${repo}/releases/${release.id}/assets`, { headers });
        if (verifyRes.ok) {
          const remoteAssets = await verifyRes.json();
          const found = remoteAssets.find(a => a.name === item.name);
          if (found) {
            if (found.state === 'uploaded' && Math.abs(found.size - fileSize) < 10) {
              console.log(`✔ Verified ${item.name} is uploaded and intact on GitHub (${found.browser_download_url})`);
              success = true;
              break;
            } else {
              console.log(`Cleaning up partial/conflicting asset ${item.name} (id: ${found.id})...`);
              await fetch(`https://api.github.com/repos/${repo}/releases/assets/${found.id}`, { method: 'DELETE', headers });
            }
          }
        }
      } catch (checkErr) {
        console.warn(`Could not verify remote asset status:`, checkErr.message);
      }

      if (attempt < 3) {
        console.log(`Retrying in 5 seconds...`);
        await new Promise(r => setTimeout(r, 5000));
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
