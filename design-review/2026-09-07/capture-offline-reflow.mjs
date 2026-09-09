import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./offline-reflow-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [320, 384, 1248]) {
    for (const state of ['empty', 'unavailable', 'no-script']) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', javaScriptEnabled: state !== 'no-script' });
      if (state === 'unavailable') await context.addInitScript(() => { IDBFactory.prototype.open = () => { throw new DOMException('Capture fixture: storage unavailable', 'InvalidStateError'); }; });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(String(error)));
      await page.goto('http://127.0.0.1:4187/offline/');
      const header = page.locator('[data-offline-header]');
      await expect(header.getByRole('heading', { level: 1 })).toBeVisible();
      if (state === 'empty') await expect(header.locator('.offline-summary')).toBeVisible();
      if (state === 'unavailable') await expect(header.getByRole('status')).toHaveText('Saved copies could not be checked.');
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      if (overflow) throw new Error(`${state} overflows at ${width}`);
      const file = `${state}-${width}.png`;
      await header.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      captures.push({ file, width, state, bounds: await header.boundingBox() });
      await context.close();
    }
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
