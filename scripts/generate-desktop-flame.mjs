/**
 * Create Windows desktop/PWA icons from the existing white flame artwork.
 *
 * The current icon-512x512.png is the approved flame but its black canvas is
 * opaque on Windows. Convert only those black background pixels to alpha and
 * keep the same white silhouette, spacing and feathered edges. The original
 * PWA icons for mobile, site favicon and Apple touch icon are untouched.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const sourcePath = path.join(root, 'public/icon-512x512.png');
const outDir = path.join(root, 'public/icons');

const { data: source, info } = await sharp(sourcePath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

if (info.width !== 512 || info.height !== 512 || info.channels !== 4) {
  throw new Error('[desktop-icon] Unexpected source dimensions or channels');
}

const whiteFlame = Buffer.alloc(source.length);
for (let offset = 0; offset < source.length; offset += 4) {
  // Original artwork is a white flame against black; map luminance to alpha
  // while retaining any source transparency and soft antialiased edges.
  const intensity = Math.max(source[offset], source[offset + 1], source[offset + 2]);
  whiteFlame[offset] = 255;
  whiteFlame[offset + 1] = 255;
  whiteFlame[offset + 2] = 255;
  whiteFlame[offset + 3] = Math.round((intensity * source[offset + 3]) / 255);
}

await fs.mkdir(outDir, { recursive: true });
for (const size of [192, 512]) {
  const filename = `desktop-flame-${size}.png`;
  const dest = path.join(outDir, filename);
  const tmp = path.join(outDir, `.${filename}.tmp`);

  await sharp(whiteFlame, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .png({ compressionLevel: 9 })
    .toFile(tmp);

  await fs.rename(tmp, dest);
  console.log(`[desktop-icon] transparent ${size}x${size}: public/icons/${filename}`);
}
