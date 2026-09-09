import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL(process.env.HAZARD_CAPTURE_OUTPUT ?? './hazard-builder-screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1053, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/hazards/');
    const builder = page.locator('[data-hazard-builder]');
    await expect(builder.getByRole('heading', { name: 'Build a hazard drill', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Start visual scene 1', exact: true })).toHaveCount(0);
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Page overflows');
    for (const state of ['visual-one', 'visual-all', 'keyboard-five']) {
      if (state === 'visual-all') await builder.getByRole('radio', { name: '18 scenes — all available' }).check();
      if (state === 'keyboard-five') {
        await builder.getByRole('radio', { name: '5 scenes', exact: true }).check();
        await builder.getByRole('radio', { name: /^Read and select zones/ }).check();
      }
      await page.evaluate(() => document.fonts.ready);
      const file = `${state}-${width}.png`;
      await builder.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: output + `${state}-${width}-viewport.png` });
      const summary = builder.getByRole('region', { name: 'Your drill, before you start', exact: true });
      await expect(summary).toContainText('on this device');
      await summary.screenshot({ path: output + `${state}-${width}-summary.png`, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      captures.push({ file, width, state, bounds: await builder.boundingBox() });
    }
    await context.close();
    const fallbackContext = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled: false });
    const fallback = await fallbackContext.newPage();
    await fallback.goto('http://127.0.0.1:4187/hazards/');
    await expect(fallback.getByRole('link', { name: 'Start visual scene 1', exact: true })).toBeVisible();
    await expect(fallback.getByRole('link', { name: 'Start keyboard scene 1 (no image)', exact: true })).toBeVisible();
    await fallback.screenshot({ path: output + `no-javascript-${width}.png`, fullPage: true });
    await fallback.getByRole('link', { name: 'Start visual scene 1', exact: true }).click();
    await expect(fallback).toHaveURL(/\/hazards\/session\/.+\/scene\/1\//);
    captures.push({ file: `no-javascript-${width}.png`, width, state: 'no-javascript', directSceneNavigation: true });
    await fallbackContext.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
