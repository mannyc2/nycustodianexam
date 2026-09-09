import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./offline-unavailable-screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [608, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.addInitScript(() => {
      indexedDB.open = () => { throw new DOMException('Storage blocked for recovery capture', 'SecurityError'); };
    });
    await page.goto('http://127.0.0.1:4187/offline/');
    await expect(page.getByRole('heading', { name: 'Saved downloads could not be checked', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Check again', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Download/ })).toHaveCount(0);
    const file = `storage-unavailable-${width}.png`;
    await page.locator('.pack-downloads').screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Horizontal overflow');
    captures.push({ file, width, state: 'storage-unavailable' });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
