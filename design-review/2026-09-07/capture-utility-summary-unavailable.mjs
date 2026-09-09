import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./utility-summary-unavailable-screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1248, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.addInitScript(() => { indexedDB.open = () => { throw new DOMException('Storage blocked', 'SecurityError'); }; });
    for (const route of ['settings', 'offline']) {
      await page.goto(`http://127.0.0.1:4187/${route}/`);
      const target = route === 'settings' ? page.locator('.settings-data > .section-header') : page.locator('[data-offline-header]');
      await expect(target).toContainText(route === 'settings' ? 'Saved-work counts unavailable.' : 'Saved copies could not be checked.');
      await page.evaluate(() => document.fonts.ready);
      const file = `${route}-${width}.png`;
      await target.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      captures.push({ file, width, storage: 'unavailable' });
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
