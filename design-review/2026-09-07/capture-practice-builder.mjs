import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL(process.env.PRACTICE_CAPTURE_OUTPUT ?? './practice-builder-screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1053, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/practice/#practice-builder');
    const builder = page.locator('#practice-builder');
    await expect(builder).toBeFocused();
    await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
    await page.screenshot({ path: output + `entry-${width}.png` });
    await expect(page.getByRole('heading', { name: 'Build a practice set', exact: true })).toBeInViewport();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Page overflows');
    for (const state of ['default', 'unavailable', 'all-matching']) {
      if (state === 'unavailable') {
        for (const name of [/^Cleaning tools/, /^Minor maintenance/, /^Mixed-domain/]) await builder.getByRole('checkbox', { name }).uncheck();
      }
      if (state === 'all-matching') await builder.getByRole('radio', { name: '5 questions — all matching' }).check();
      await page.evaluate(() => document.fonts.ready);
      const file = `${state}-${width}.png`;
      await builder.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { visibility: hidden; }' });
      await page.screenshot({ path: output + `${state}-${width}-viewport.png` });
      captures.push({ file, width, state, bounds: await builder.boundingBox() });
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
