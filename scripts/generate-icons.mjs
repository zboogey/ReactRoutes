// Generates the PWA PNG icons into public/icons (no dependencies).
// Run: node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'

const CRC = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}
function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6 // 8-bit RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
  ])
}

const inRoundRect = (x, y, x0, y0, x1, y1, r) => {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false
  const cx = Math.min(Math.max(x, x0 + r), x1 - r)
  const cy = Math.min(Math.max(y, y0 + r), y1 - r)
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r
}
// shopping bag, all coordinates in 0..1 (kept inside the maskable safe zone)
const inBag = (x, y) => {
  const d = Math.hypot(x - 0.5, y - 0.37)
  const handle = y <= 0.37 && d >= 0.075 && d <= 0.115
  const body = inRoundRect(x, y, 0.24, 0.37, 0.76, 0.78, 0.035)
  const holes = Math.hypot(x - 0.405, y - 0.45) <= 0.022 || Math.hypot(x - 0.595, y - 0.45) <= 0.022
  return handle || (body && !holes)
}

function draw(size, { rounded }) {
  const S = 4 // supersampling
  const out = Buffer.alloc(size * size * 4)
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0, a = 0
      for (let sy = 0; sy < S; sy++) for (let sx = 0; sx < S; sx++) {
        const x = (px + (sx + 0.5) / S) / size
        const y = (py + (sy + 0.5) / S) / size
        if (rounded && !inRoundRect(x, y, 0, 0, 1, 1, 0.22)) continue
        const c = inBag(x, y) ? 255 : 17
        r += c; g += c; b += c; a += 1
      }
      const i = (py * size + px) * 4
      if (a) { out[i] = r / a; out[i + 1] = g / a; out[i + 2] = b / a }
      out[i + 3] = Math.round((a / (S * S)) * 255)
    }
  }
  return encodePng(size, out)
}

mkdirSync('public/icons', { recursive: true })
const icons = [
  ['icon-192.png', 192, { rounded: true }],
  ['icon-512.png', 512, { rounded: true }],
  ['maskable-512.png', 512, { rounded: false }],
  ['apple-touch-icon.png', 180, { rounded: false }],
]
for (const [name, size, opts] of icons) {
  writeFileSync(`public/icons/${name}`, draw(size, opts))
  console.log('public/icons/' + name)
}
