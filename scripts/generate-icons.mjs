import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputDir = join(__dirname, '../public/icons');

// Icon sizes for PWA
const sizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 120, name: 'icon-120x120.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 167, name: 'icon-167x167.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
];

// SVG icon source
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2d1f4e"/>
      <stop offset="100%" style="stop-color:#1a1a2e"/>
    </linearGradient>
    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#a78bfa"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bgGradient)"/>
  <g transform="translate(96, 96) scale(13.33)">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" stroke="url(#iconGradient)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="7" y1="2" x2="7" y2="22" stroke="url(#iconGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="17" y1="2" x2="17" y2="22" stroke="url(#iconGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="2" y1="12" x2="22" y2="12" stroke="url(#iconGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="2" y1="7" x2="7" y2="7" stroke="url(#iconGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="2" y1="17" x2="7" y2="17" stroke="url(#iconGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="17" y1="17" x2="22" y2="17" stroke="url(#iconGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="17" y1="7" x2="22" y2="7" stroke="url(#iconGradient)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

// Maskable icon (with more padding for safe zone)
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="bgGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2d1f4e"/>
      <stop offset="100%" style="stop-color:#1a1a2e"/>
    </linearGradient>
    <linearGradient id="iconGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#a78bfa"/>
      <stop offset="100%" style="stop-color:#8b5cf6"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#bgGradient2)"/>
  <g transform="translate(128, 128) scale(10.67)">
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" stroke="url(#iconGradient2)" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="7" y1="2" x2="7" y2="22" stroke="url(#iconGradient2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="17" y1="2" x2="17" y2="22" stroke="url(#iconGradient2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="2" y1="12" x2="22" y2="12" stroke="url(#iconGradient2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="2" y1="7" x2="7" y2="7" stroke="url(#iconGradient2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="2" y1="17" x2="7" y2="17" stroke="url(#iconGradient2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="17" y1="17" x2="22" y2="17" stroke="url(#iconGradient2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="17" y1="7" x2="22" y2="7" stroke="url(#iconGradient2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

async function generateIcons() {
  await mkdir(outputDir, { recursive: true });

  // Generate regular icons
  for (const { size, name } of sizes) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(join(outputDir, name));
    console.log(`Generated: ${name}`);
  }

  // Generate maskable icons
  await sharp(Buffer.from(maskableSvg))
    .resize(192, 192)
    .png()
    .toFile(join(outputDir, 'maskable-icon-192x192.png'));
  console.log('Generated: maskable-icon-192x192.png');

  await sharp(Buffer.from(maskableSvg))
    .resize(512, 512)
    .png()
    .toFile(join(outputDir, 'maskable-icon-512x512.png'));
  console.log('Generated: maskable-icon-512x512.png');

  // Generate favicon.ico compatible PNG
  await sharp(Buffer.from(svgIcon))
    .resize(48, 48)
    .png()
    .toFile(join(outputDir, 'favicon.png'));
  console.log('Generated: favicon.png');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
