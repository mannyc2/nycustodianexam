import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./settings-delete-screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [608, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/settings/');
    await page.getByRole('checkbox', { name: 'Reduce motion', exact: true }).check();
    await page.getByRole('button', { name: 'Choose what to delete', exact: true }).click();
    await page.getByLabel('What to delete').selectOption('preferences');
    await page.getByRole('button', { name: 'Preview delete', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Delete preview — nothing changed yet' })).toBeVisible();
    await expect(page.getByText('1 record(s) in the selected scope will be removed.')).toBeVisible();
    const panel = page.locator('#settings-delete');
    const file = `preferences-preview-${width}.png`;
    await panel.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
    captures.push({ file, width, scope: 'preferences', records: 1, confirmed: false });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
