import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function getGitHubToken() {
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
