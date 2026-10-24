import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const pkg = JSON.parse(fs.readFileSync(path.resolve('package.json'), 'utf8'));
const ver = pkg.version || '0.7.9';
const unpackedDir = path.resolve('dist-desktop/win-unpacked');
const zipName = `hengji-${ver}.zip`;
const aliasName = `衡绩员工绩点考核系统-${ver}.zip`;
const outZipPath = path.resolve('dist-desktop', zipName);
const outAliasPath = path.resolve('dist-desktop', aliasName);

if (!fs.existsSync(unpackedDir)) {
  console.error('win-unpacked directory not found:', unpackedDir);
  process.exit(1);
}

// 查找 7za.exe
const candidate7z = [
  'C:\\Users\\Phodon\\AppData\\Local\\electron-builder\\Cache\\7zip@1.0.0\\7zip-win-x64-a34pt\\bin\\7za.exe',
  'C:\\Program Files\\7-Zip\\7z.exe',
  '7z.exe',
  '7za.exe'
];

let tool7z = candidate7z.find(p => fs.existsSync(p));

console.log(`Packaging ZIP release ${zipName} from win-unpacked...`);

if (fs.existsSync(outZipPath)) fs.unlinkSync(outZipPath);
if (fs.existsSync(outAliasPath)) fs.unlinkSync(outAliasPath);

if (tool7z) {
  console.log(`Using 7-Zip: ${tool7z}`);
  execFileSync(tool7z, ['a', '-tzip', '-mx=7', outZipPath, '.'], {
    cwd: unpackedDir,
    stdio: 'inherit'
  });
} else {
  console.log('Using PowerShell Compress-Archive fallback...');
  execFileSync('powershell.exe', [
    '-NoProfile',
    '-Command',
    `Compress-Archive -Path '${unpackedDir}\\*' -DestinationPath '${outZipPath}' -Force`
  ], { stdio: 'inherit' });
}

fs.copyFileSync(outZipPath, outAliasPath);
const stats = fs.statSync(outZipPath);
console.log(`✔ Created ${zipName} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
console.log(`✔ Created ${aliasName}`);
