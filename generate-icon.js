/**
 * Generates pixel-art ghost app icons for BOO DAYS.
 * Run with: node generate-icon.js
 */
const sharp = require('sharp');
const path = require('path');

const _ = null;
const W = '#f0e6ff'; // white body
const P = '#4c1d95'; // dark purple outline
const B = '#0a0015'; // eyes
const K = '#f9a8d4'; // pink blush
const S = '#fbbf24'; // star gold

const GHOST = [
  [_, _, P, P, P, P, _, _],
  [_, P, W, W, W, W, P, _],
  [P, W, W, W, W, W, W, P],
  [P, W, B, W, W, B, W, P],
  [P, W, W, W, W, W, W, P],
  [P, W, K, W, W, K, W, P],
  [P, W, W, W, W, W, W, P],
  [P, W, W, W, W, W, W, P],
  [P, P, W, P, W, P, W, P],
  [_, P, P, _, P, _, P, _],
];

// Tiny 2x2 pixel stars scattered around the ghost
const STARS = [
  { col: 0, row: 1, color: S },
  { col: 10, row: 2, color: W },
  { col: 11, row: 7, color: S },
  { col: -1, row: 6, color: W },
];

function buildSvg({ size, px }) {
  const cols = GHOST[0].length;       // 8
  const rows = GHOST.length;          // 10
  const ghostW = cols * px;
  const ghostH = rows * px;
  const ox = Math.floor((size - ghostW) / 2);
  const oy = Math.floor((size - ghostH) / 2);

  let rects = '';

  // Stars (relative to ghost offset)
  STARS.forEach(({ col, row, color }) => {
    const sx = ox + col * px;
    const sy = oy + row * px;
    const starPx = Math.max(4, Math.floor(px * 0.3));
    rects += `<rect x="${sx}" y="${sy}" width="${starPx}" height="${starPx}" fill="${color}" opacity="0.75"/>`;
  });

  // Ghost pixels
  GHOST.forEach((rowArr, y) => {
    rowArr.forEach((color, x) => {
      if (!color) return;
      rects += `<rect x="${ox + x * px}" y="${oy + y * px}" width="${px}" height="${px}" fill="${color}"/>`;
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#1a0a2e"/>
  ${rects}
</svg>`;
}

async function run() {
  const targets = [
    { file: 'assets/icon.png',          size: 1024, px: 88 },
    { file: 'assets/adaptive-icon.png', size: 1024, px: 72 },
    { file: 'assets/splash-icon.png',   size: 1024, px: 60 },
    { file: 'assets/favicon.png',       size: 64,   px: 6  },
  ];

  for (const { file, size, px } of targets) {
    const svg = buildSvg({ size, px });
    await sharp(Buffer.from(svg)).png().toFile(path.join(__dirname, file));
    console.log(`✓ ${file}`);
  }
  console.log('\nAll icons generated!');
}

run().catch(err => { console.error(err); process.exit(1); });
