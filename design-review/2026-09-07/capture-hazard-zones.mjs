import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./hazard-zone-screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1053, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/hazards/session/launch-v1-nonvisual/scene/1/');
    await expect(page.locator('input[name=hazard-zone]').first()).toBeEnabled();
    const card = page.locator('.study-player.hazard-player');
    for (const state of ['empty', 'marked', 'saved']) {
      if (state === 'marked') await page.locator('input[name=hazard-zone]').first().check();
      if (state === 'saved') {
        await page.getByRole('button', { name: 'Save response', exact: true }).click();
        await expect(page.locator('.hazard-player__results')).toBeVisible();
      }
      await page.evaluate(() => document.fonts.ready);
      const file = `${state}-${width}.png`;
      await card.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      const overflowing = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      if (overflowing) throw new Error(`Horizontal overflow at ${width}`);
      captures.push({ file, width, state, bounds: await card.boundingBox() });
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
