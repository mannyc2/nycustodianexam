import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./simulation-navigator-screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1008, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/offline/');
    await page.getByRole('button', { name: /^Download (the .* copy|and check)$/ }).click();
    await expect(page.getByText(/Download complete and checked/)).toBeVisible({ timeout: 120000 });
    await page.getByRole('button', { name: /Turn on this saved copy/ }).click();
    await expect(page.getByText(/now in use for new sessions/)).toBeVisible();
    await page.goto('http://127.0.0.1:4187/simulations/');
    await page.getByRole('button', { name: 'Start simulation', exact: true }).click();
    await expect(page.locator('.simulation-main input[type="radio"]').first()).toBeEnabled({ timeout: 30000 });
    for (let position = 1; position <= 3; position++) {
      await page.locator('.simulation-main input[type="radio"]').first().check();
      await expect(page.getByRole('button', { name: 'Flag this question', exact: true })).toBeEnabled();
      if (position === 2) {
        await page.getByRole('button', { name: 'Flag this question', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Flagged for review', exact: true })).toBeEnabled();
      }
      await page.getByRole('link', { name: 'Next item →', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Review and submit simulation', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Submit final answers?' })).toBeFocused();
    const navigator = page.locator('.simulation-navigator');
    const file = `confirmation-${width}.png`;
    await navigator.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
    captures.push({ file, width, bounds: await navigator.boundingBox(), answered: 3, flagged: 1, position: 4 });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
