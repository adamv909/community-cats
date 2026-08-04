import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// Cat paw print SVG icon — emerald on dark teal background
function makeSvg(size) {
  const s = size
  const cx = s / 2

  // Scale everything relative to 512
  const r = s / 512

  // Background rounded rect
  // Paw pad (main palm) — large ellipse at bottom center
  // Four toe beans above
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f766e"/>
      <stop offset="100%" stop-color="#0d9488"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="${s}" height="${s}" rx="${s * 0.22}" fill="url(#bg)"/>

  <!-- Main pad (palm) -->
  <ellipse cx="${cx}" cy="${s * 0.62}" rx="${s * 0.22}" ry="${s * 0.19}" fill="white" opacity="0.95"/>

  <!-- Top-left toe -->
  <ellipse cx="${s * 0.27}" cy="${s * 0.37}" rx="${s * 0.092}" ry="${s * 0.11}" fill="white" opacity="0.95"/>

  <!-- Top-center-left toe -->
  <ellipse cx="${s * 0.41}" cy="${s * 0.295}" rx="${s * 0.092}" ry="${s * 0.11}" fill="white" opacity="0.95"/>

  <!-- Top-center-right toe -->
  <ellipse cx="${s * 0.59}" cy="${s * 0.295}" rx="${s * 0.092}" ry="${s * 0.11}" fill="white" opacity="0.95"/>

  <!-- Top-right toe -->
  <ellipse cx="${s * 0.73}" cy="${s * 0.37}" rx="${s * 0.092}" ry="${s * 0.11}" fill="white" opacity="0.95"/>
</svg>`
}

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
]

for (const { name, size } of sizes) {
  const svg = makeSvg(size)
  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(root, 'public/icons', name))
  console.log(`✓ ${name}`)
}

// Also write favicon.ico as a 32x32 png copy (browsers accept png as ico)
import { copyFileSync } from 'fs'
copyFileSync(
  join(root, 'public/icons/favicon-32.png'),
  join(root, 'public/favicon.ico')
)
console.log('✓ favicon.ico')
