/* ============================================================
   Generates lightweight placeholder PNGs (brand-colored gradients)
   so the build and the WebGL gallery work out of the box.
   Replace these with real photos — see public/assets/images/README.md.

   Run with:  node scripts/gen-placeholders.mjs
   ============================================================ */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// --- minimal PNG encoder (RGBA, no filtering) ---
const crcTable = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePNG(width, height, pixels /* (x,y)=>[r,g,b] */) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  const raw = Buffer.alloc((width * 3 + 1) * height);
  let o = 0;
  for (let y = 0; y < height; y++) {
    raw[o++] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b] = pixels(x, y);
      raw[o++] = r;
      raw[o++] = g;
      raw[o++] = b;
    }
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const INK = [10, 10, 12];
const VOLT = [215, 255, 62];
const EMBER = [255, 90, 44];

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

// A visible duotone-style gradient with a diagonal accent sweep + a soft
// light spot, so the gallery reads as "photos" until real images replace it.
function gradientFactory(seed) {
  const accent = seed % 2 === 0 ? VOLT : EMBER;
  const dark = [22, 22, 28];
  const light = [120, 122, 134];
  return (x, y, w, h) => {
    const nx = x / w;
    const ny = y / h;
    const diag = (nx + ny) / 2;
    // Vertical charcoal gradient (clearly visible tonal range).
    let col = mix(light, dark, ny * 0.85 + 0.05);
    // Diagonal accent band.
    const sweep = Math.max(0, Math.sin((diag + seed * 0.17) * Math.PI * 1.6)) * 0.45;
    col = mix(col, accent, sweep);
    // Soft radial highlight (fake subject lighting).
    const cx = 0.5 + (seed % 2 === 0 ? 0.12 : -0.12);
    const d = Math.hypot(nx - cx, ny - 0.4);
    const glow = Math.max(0, 1 - d * 1.8) * 0.25;
    col = mix(col, [235, 232, 223], glow);
    return col;
  };
}

function write(path, w, h, factory) {
  const png = encodePNG(w, h, (x, y) => factory(x, y, w, h));
  writeFileSync(path, png);
  console.log(`  wrote ${path}  (${(png.length / 1024).toFixed(0)} KB)`);
}

const imgDir = resolve(root, 'public/assets/images');
mkdirSync(imgDir, { recursive: true });

console.log('Generating placeholder images…');
for (let i = 1; i <= 4; i++) {
  write(resolve(imgDir, `transformation-${i}.png`), 900, 1200, gradientFactory(i));
}
write(resolve(root, 'public/og-image.png'), 1200, 630, gradientFactory(2));
write(resolve(root, 'public/apple-touch-icon.png'), 180, 180, gradientFactory(1));
console.log('Done.');
