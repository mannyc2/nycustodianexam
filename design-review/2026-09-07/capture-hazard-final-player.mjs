import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./hazard-final-audit/player/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1042, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/hazards/session/launch-v1/scene/1/');
    await expect(page.getByRole('button', { name: 'Add marker at center', exact: true })).toBeEnabled();
    const card = page.locator('.study-player.hazard-player');
    for (const state of ['empty', 'marked', 'saved']) {
      if (state === 'marked') {
        const scene = page.locator('.hazard-player__image-layer');
        const bounds = await scene.boundingBox();
        if (!bounds) throw new Error('Scene image bounds unavailable');
        await scene.click({ position: { x: bounds.width * 0.5, y: bounds.height * 0.7 } });
        await scene.click({ position: { x: bounds.width * 0.9, y: bounds.height * 0.65 } });
      }
      if (state === 'saved') {
        await page.getByRole('button', { name: 'Save marks', exact: true }).click();
        await expect(page.locator('.hazard-player__results')).toBeVisible();
        await expect(page.locator('.hazard-player__marker-list')).toContainText('Hazard found.');
        await expect(page.locator('.hazard-player__marker-list')).toContainText('Safe as shown.');
      }
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].filter(image => image.complete && image.naturalWidth > 0).map(image => image.decode()));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const file = `${state}-${width}.png`;
      await card.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      const overflowing = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      if (overflowing) throw new Error(`Horizontal overflow at ${width}`);
      captures.push({ file, width, state, bounds: await card.boundingBox() });
      if (state === 'saved') {
        const markers = page.locator('.hazard-player__markers');
        const markerFile = `saved-markers-${width}.png`;
        await markers.screenshot({ path: output + markerFile });
        captures.push({ file: markerFile, width, state: 'saved-markers', bounds: await markers.boundingBox() });
      }
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
