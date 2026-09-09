import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./exams-overview-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1248, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/exams/');
    await expect(page.getByRole('searchbox')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    for (const [name, locator] of [
      ['hero', page.locator('.exams-page > .page-header-prominent')],
      ['registry', page.locator('#exams-board')],
      ['cards', page.locator('.record-list')]
    ]) {
      const file = `${name}-${width}.png`;
      await locator.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      captures.push({ file, width, bounds: await locator.boundingBox() });
    }
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Exams overflow');
    const actions = page.locator('.exam-card-coverage a:visible');
    await expect(actions).toHaveCount(width === 384 ? 3 : 0);
    if (width === 384) {
      await actions.first().click();
      await expect(page.locator('#covers')).toBeFocused();
      await expect(page.locator('#study-coverage-heading')).toBeInViewport();
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
