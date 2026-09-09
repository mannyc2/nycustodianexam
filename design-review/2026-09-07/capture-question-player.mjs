import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./question-player-screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1053, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/practice/');
    await page.locator('[data-study-hub] .study-hero a.button-primary').click();
    await expect(page.getByRole('button', { name: 'Flag for review', exact: true })).toBeEnabled();
    for (const state of ['unanswered', 'selected', 'answered']) {
      if (state === 'selected') await page.getByRole('radio').first().check();
      if (state === 'answered') {
        await page.getByRole('button', { name: 'Save answer', exact: true }).click();
        await expect(page.locator('.feedback-rationales')).toBeVisible();
      }
      const player = page.locator('.study-player.question-card');
      await page.evaluate(() => document.fonts.ready);
      const file = `${state}-${width}.png`;
      await player.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      captures.push({ file, width, state, bounds: await player.boundingBox(), route: new URL(page.url()).pathname });
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
