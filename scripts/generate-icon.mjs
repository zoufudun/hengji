import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f2b20" />
      <stop offset="50%" stop-color="#184a3b" />
      <stop offset="100%" stop-color="#091e16" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#facc15" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>
    <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Outer background rounded squircle -->
  <rect x="10" y="10" width="236" height="236" rx="56" fill="url(#bgGrad)" filter="url(#shadow)" stroke="url(#goldGrad)" stroke-width="3" stroke-opacity="0.8" />

  <!-- Inner border ring -->
  <rect x="18" y="18" width="220" height="220" rx="48" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-opacity="0.2" />

  <!-- Top Crown / Balance Scales Accent -->
  <path d="M110 44 L128 34 L146 44 L138 52 L118 52 Z" fill="url(#goldGrad)" />
  <circle cx="128" cy="30" r="4.5" fill="url(#goldGrad)" />
  <circle cx="98" cy="48" r="3" fill="url(#goldGrad)" opacity="0.8" />
  <circle cx="158" cy="48" r="3" fill="url(#goldGrad)" opacity="0.8" />

  <!-- Center Typography: 衡绩 -->
  <g font-family="'Microsoft YaHei', 'PingFang SC', 'Source Han Sans CN', sans-serif" font-weight="900" text-anchor="middle">
    <!-- 衡 -->
    <text x="86" y="148" font-size="82" fill="#ffffff" letter-spacing="-1">衡</text>
    <text x="86" y="148" font-size="82" fill="url(#goldGrad)" opacity="0.25" letter-spacing="-1">衡</text>
    <!-- 绩 -->
    <text x="170" y="148" font-size="82" fill="url(#goldGrad)" letter-spacing="-1">绩</text>
  </g>

  <!-- Bottom Badge: 绩点考核 -->
  <rect x="52" y="178" width="152" height="28" rx="14" fill="url(#badgeGrad)" stroke="url(#goldGrad)" stroke-width="1" stroke-opacity="0.7" />
  <text x="128" y="197" font-family="'Microsoft YaHei', 'PingFang SC', sans-serif" font-size="13" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="4">绩点考核</text>
</svg>
`;

async function makeIco() {
  fs.mkdirSync('build', { recursive: true });
  fs.mkdirSync('app/public', { recursive: true });

  const svgBuf = Buffer.from(svg);
  const png256 = await sharp(svgBuf).resize(256, 256).png().toBuffer();
  const png128 = await sharp(svgBuf).resize(128, 128).png().toBuffer();
  const png64 = await sharp(svgBuf).resize(64, 64).png().toBuffer();
  const png48 = await sharp(svgBuf).resize(48, 48).png().toBuffer();
  const png32 = await sharp(svgBuf).resize(32, 32).png().toBuffer();
  const png16 = await sharp(svgBuf).resize(16, 16).png().toBuffer();

  fs.writeFileSync('build/icon.png', png256);
  fs.writeFileSync('app/icon.png', png256);

  // Build multi-image ICO format (supports Vista PNG icons)
  const images = [
    { size: 256, buffer: png256 },
    { size: 128, buffer: png128 },
    { size: 64, buffer: png64 },
    { size: 48, buffer: png48 },
    { size: 32, buffer: png32 },
    { size: 16, buffer: png16 }
  ];

  const count = images.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO type
  header.writeUInt16LE(count, 4); // Number of images

  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0); // Width (0 means 256)
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1); // Height (0 means 256)
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(img.buffer.length, 8); // Image size in bytes
    entry.writeUInt32LE(offset, 12); // Offset of image data
    offset += img.buffer.length;
    entries.push(entry);
  }

  const icoBuffer = Buffer.concat([header, ...entries, ...images.map(img => img.buffer)]);
  fs.writeFileSync('build/icon.ico', icoBuffer);
  fs.writeFileSync('app/favicon.ico', icoBuffer);
  console.log('✓ Successfully generated build/icon.ico, build/icon.png, app/favicon.ico');
}

makeIco().catch(console.error);
