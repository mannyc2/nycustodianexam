import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./utility-summary-screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1248, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    const capture = async (name, target) => {
      await page.evaluate(() => document.fonts.ready);
      await target.screenshot({ path: output + `${name}-${width}.png`, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Horizontal overflow');
      captures.push({ name, width });
    };
    await page.goto('http://127.0.0.1:4187/settings/');
    await expect(page.locator('[data-saved-work-summary]')).toContainText('0 question answers');
    await capture('settings-empty', page.locator('.settings-data > .section-header'));
    await page.goto('http://127.0.0.1:4187/practice/session/launch-v1/question/1/');
    await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: 'Save answer', exact: true }).click();
    await expect(page.locator('.feedback-rationales')).toBeVisible();
    await page.goto('http://127.0.0.1:4187/settings/');
    await expect(page.locator('[data-saved-work-summary]')).toContainText('1 question answer');
    await capture('settings-saved', page.locator('.settings-data > .section-header'));
    await page.goto('http://127.0.0.1:4187/offline/');
    await expect(page.locator('.offline-summary')).toContainText('No copy turned on');
    await capture('offline-empty', page.locator('[data-offline-header]'));
    await page.getByRole('button', { name: /^Download (the .* copy|and check)$/ }).click();
    await expect(page.getByText(/Download complete and checked/)).toBeVisible({ timeout: 120000 });
    await expect(page.locator('.offline-summary')).toContainText('No copy turned on');
    await capture('offline-staged', page.locator('[data-offline-header]'));
    await page.getByRole('button', { name: /Turn on this saved copy/ }).click();
    await expect(page.getByRole('heading', { name: 'Your practice material is available offline.', exact: true })).toBeVisible();
    await expect(page.locator('.offline-summary')).toContainText('90 questions · 18 scenes · 65 tools');
    await capture('offline-active', page.locator('[data-offline-header]'));
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
