import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./home-final-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1248, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/');
    await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Home overflows');
    for (const [name, locator] of [
      ['hero', page.locator('.home-hero')],
      ['coverage', page.getByRole('region', { name: 'What the test covers', exact: true })],
      ['ways', page.getByRole('region', { name: 'Ways to study', exact: true })],
      ['cycle', page.locator('.home-cycle-grid')],
      ['trust', page.locator('.home-trust-list')],
      ['footer', page.locator('footer')]
    ]) {
      await expect(locator).toBeVisible();
      await locator.screenshot({ path: output + `${name}-${width}.png`, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      captures.push({ file: `${name}-${width}.png`, width, bounds: await locator.boundingBox() });
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: output + `home-${width}.png`, fullPage: true });
    if (width === 384) {
      const links = page.locator('.home-areas-section .home-scope-row > a');
      for (const link of await links.all()) {
        await expect(link).toHaveCSS('text-decoration-line', 'underline');
        if ((await link.boundingBox()).height < 44) throw new Error('Compact subject link target is too short');
      }
    }
    await page.getByRole('link', { name: 'Start practicing', exact: true }).click();
    await expect(page).toHaveURL(/\/practice\/$/);
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
