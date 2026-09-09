import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./offline-state-screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1248, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/offline/');
    await page.getByRole('button', { name: /^Download (the .* copy|and check)$/ }).click();
    await expect(page.getByText(/Download complete and checked/)).toBeVisible({ timeout: 120000 });
    await page.getByRole('button', { name: /Turn on this saved copy/ }).click();
    await expect(page.getByText(/now in use for new sessions/)).toBeVisible();
    for (const state of ['active', 'removal-preview']) {
      if (state === 'removal-preview') {
        await page.getByRole('button', { name: 'Preview removal', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Remove this copy?', exact: true })).toBeFocused();
      }
      const target = state === 'active' ? page.locator('main') : page.getByRole('region', { name: 'Remove this copy?', exact: true });
      const file = `${state}-${width}.png`;
      await target.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Horizontal overflow');
      captures.push({ file, width, state, bounds: await target.boundingBox() });
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
