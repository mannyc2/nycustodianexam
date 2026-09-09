import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./atlas-record-screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1053, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    for (const state of ['tool-record', 'family-record', 'missing-images']) {
      if (state === 'missing-images') await page.route('**/content/assets/**', route => route.abort());
      await page.goto('http://127.0.0.1:4187/' + (state === 'tool-record' ? 'atlas/tool/pipe-wrench/' : state === 'family-record' ? 'atlas/family/articulated-hand-tools/' : 'atlas/'));
      await expect(page.locator('h1')).toBeVisible();
      if (state === 'missing-images') await expect(page.locator('[data-atlas-image-notice]').first()).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const file = `${state}-${width}.png`;
      await page.screenshot({ path: output + file });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Overflow: ${state} ${width}`);
      captures.push({ file, width, state, url: page.url() });
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
