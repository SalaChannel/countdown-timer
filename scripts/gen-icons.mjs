// 砂時計アイコン(PNG)を外部ライブラリなしで生成: node scripts/gen-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};
const png = (size, rgb) => {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8bit RGB
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const o = y * (size * 3 + 1) + 1 + x * 3;
      raw[o] = rgb(x, y)[0]; raw[o + 1] = rgb(x, y)[1]; raw[o + 2] = rgb(x, y)[2];
    }
  }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
};

// 単位座標(0..1)での色判定。フルブリード背景（iOSが角丸を付ける）
const BG = [14, 124, 134], FRAME = [255, 255, 255], SAND = [255, 196, 86];
function sample(u, v) {
  const cx = 0.5, dx = Math.abs(u - cx);
  const top = 0.24, bot = 0.76, mid = 0.5;
  // ガラス外形: 上下は幅0.24、中央くびれ幅0.025
  const half = (y) => 0.025 + 0.215 * Math.min(1, Math.abs(y - mid) / (mid - top));
  const inGlass = v >= top && v <= bot && dx <= half(v);
  // 上下の板
  const cap = (v >= 0.19 && v <= 0.24 || v >= 0.76 && v <= 0.81) && dx <= 0.28;
  if (cap) return FRAME;
  if (!inGlass) return BG;
  const inner = v >= top + 0.03 && v <= bot - 0.03 && dx <= half(v) - 0.03;
  if (!inner) return FRAME;
  // 砂: 上は半分程度、下は山、中央に細い筋
  if (v > 0.36 && v < mid) return SAND;
  if (Math.abs(v - mid) < 0.16 && dx < 0.012 && v <= 0.62) return SAND;
  if (v > 0.6 && v < bot - 0.03 && dx <= (v - 0.6) * 1.1 + 0.02) return SAND;
  return [BG[0] + 20, BG[1] + 20, BG[2] + 20];
}
function render(size) {
  const SS = 3;
  return png(size, (x, y) => {
    let r = 0, g = 0, b = 0;
    for (let i = 0; i < SS; i++) for (let j = 0; j < SS; j++) {
      const c = sample((x + (i + .5) / SS) / size, (y + (j + .5) / SS) / size);
      r += c[0]; g += c[1]; b += c[2];
    }
    const n = SS * SS;
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
  });
}
mkdirSync(new URL('../icons/', import.meta.url), { recursive: true });
for (const s of [180, 192, 512]) {
  writeFileSync(new URL(`../icons/icon-${s}.png`, import.meta.url), render(s));
}
console.log('icons generated');
