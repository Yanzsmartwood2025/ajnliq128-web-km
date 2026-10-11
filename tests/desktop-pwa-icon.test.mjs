import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs/promises';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL('public/manifest.json', root), 'utf8'));

test('Windows uses new transparent white flame, mobile/Apple icon paths remain the same', () => {
  const icons = manifest.icons;
  for (const size of [192, 512]) {
    const any = icons.find(icon =>
      icon.src === `/icons/desktop-flame-${size}.png` && icon.sizes === `${size}x${size}`);
    assert.equal(any?.purpose, 'any');

    const mobile = icons.find(icon => icon.src === `/icon-${size}x${size}.png`);
    assert.equal(mobile?.purpose, 'maskable');
  }
  assert.ok(icons.some(icon => icon.src === '/apple-icon.png'));
  assert.ok(icons.some(icon => icon.src === '/icon-32x32.png'));
});

test('desktop flame PNGs have transparent corners and retain real visible artwork', async () => {
  for (const size of [192, 512]) {
    const location = new URL(`public/icons/desktop-flame-${size}.png`, root);
    const { data, info } = await sharp(location).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    assert.equal(info.width, size);
    assert.equal(info.height, size);
    assert.equal(info.channels, 4);
    const alpha = (x, y) => data[((y * size) + x) * 4 + 3];
    for (const [x,y] of [[0,0],[0,size-1],[size-1,0],[size-1,size-1]]) {
      assert.equal(alpha(x,y), 0, `corner ${x},${y} of ${size}`);
    }
    let visiblePixels = 0;
    for (let offset = 3; offset < data.length; offset += 4) {
      if (data[offset] > 170) visiblePixels++;
    }
    assert.ok(visiblePixels > size * size * 0.08, `white flame exists at ${size}`);
  }
});

test('site favicon and Apple assets are not replaced by the Windows-specific icon', async () => {
  const layout = await fs.readFile(new URL('app/layout.tsx', root), 'utf8');
  assert.match(layout, /apple:\s*'\/apple-icon\.png'/);
  assert.match(layout, /\{ url: '\/icon-32x32\.png', sizes: '32x32' \}/);
});
