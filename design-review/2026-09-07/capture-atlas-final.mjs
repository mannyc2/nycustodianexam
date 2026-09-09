import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./atlas-final-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1042, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/atlas/');
    await expect(page.locator('[data-tool-family]')).toHaveCount(65);
    const select = async family => {
      if (width === 384) await page.getByRole('combobox', { name: 'Family', exact: true }).selectOption(family);
      else await page.locator(`[data-atlas-family="${family}"]`).click();
    };
    for (const state of ['all', 'rigid hand tools', 'missing-images']) {
      if (state === 'missing-images') {
        await page.route('**/content/assets/**', route => route.abort());
        await page.reload();
      } else await select(state);
      for (const card of await page.locator('[data-tool-family]:visible').all()) await card.scrollIntoViewIfNeeded();
      if (state === 'missing-images') await expect(page.locator('[data-tool-family]:visible [data-atlas-image-notice]').first()).toBeVisible();
      else await page.locator('[data-tool-family]:visible img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
      await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
      const region = page.locator('.atlas-browser');
      const bounds = await region.boundingBox();
      if (width === 1042 && Math.abs(bounds.width - 990) > 1) throw new Error(`Mismatched desktop content bounds: ${bounds.width}`);
      const file = `${state.replaceAll(' ', '-')}-${width}.png`;
      await region.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Overflow ${state}`);
      captures.push({ file, width, state, bounds, records: await page.locator('[data-tool-family]:visible').count() });
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
