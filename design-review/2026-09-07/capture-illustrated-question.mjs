import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./illustrated-question-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1053, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/practice/session/launch-v1/question/91/');
    await expect(page.getByRole('radio', { name: 'Adjustable wrench', exact: true })).toBeEnabled();
    await page.locator('.question-illustration img').evaluate(image => image.decode());
    await page.evaluate(() => document.fonts.ready);
    for (const state of ['unanswered', 'zoomed', 'description', 'image-unavailable', 'image-retried', 'answered']) {
      if (state === 'zoomed') {
        await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
        await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
      }
      if (state === 'description') {
        await page.getByRole('button', { name: 'Reset view', exact: true }).click();
        await page.getByText('Read image description', { exact: true }).click();
      }
      if (state === 'image-unavailable') {
        await page.route('**/content/assets/**', route => route.abort());
        await page.reload();
        await expect(page.getByRole('button', { name: 'Try image again', exact: true })).toBeVisible();
      }
      if (state === 'image-retried') {
        await page.unroute('**/content/assets/**');
        await page.getByRole('button', { name: 'Try image again', exact: true }).focus();
        await page.keyboard.press('Enter');
        await page.locator('.question-illustration img').evaluate(image => image.decode());
        await expect(page.locator('.question-illustration')).toBeFocused();
      }
      if (state === 'answered') {
        await page.getByRole('radio', { name: 'Adjustable wrench', exact: true }).check();
        await page.getByRole('button', { name: 'Save answer', exact: true }).click();
        await expect(page.getByRole('heading', { name: /Correct.*Adjustable wrench/ })).toBeVisible();
      }
      const card = page.locator('.question-card');
      const file = `${state}-${width}.png`;
      await card.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      captures.push({ file, width, bounds: await card.boundingBox() });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Question overflow');
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
