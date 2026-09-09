import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./hazard-final-audit/recovery/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const state of ['missing-image', 'zero-confirmation', 'feedback-failure']) {
    const width = 384;
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    if (state === 'missing-image') await page.route('**/content/assets/derivatives/scenes/*.png', route => route.abort());
    if (state === 'feedback-failure') await page.route('**/*.postcommit.json', route => route.abort());
    await page.goto('http://127.0.0.1:4187/hazards/session/launch-v1/scene/1/');
    if (state === 'missing-image') {
      await expect(page.getByRole('button', { name: 'Add marker at center', exact: true })).toHaveCount(0);
      await expect(page.locator('.feedback-error')).toBeVisible();
    } else {
      await expect(page.getByRole('button', { name: 'Save marks', exact: true })).toBeEnabled();
      await page.getByRole('button', { name: 'Save marks', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Submit without marking a concern?' })).toBeFocused();
      if (state === 'feedback-failure') {
        await page.getByRole('button', { name: 'Confirm and save no marks', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Retry feedback', exact: true })).toBeVisible();
      }
    }
    const card = page.locator('.study-player.hazard-player');
    const file = `${state}-${width}.png`;
    await card.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Horizontal overflow');
    captures.push({ file, width, state, bounds: await card.boundingBox() });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
