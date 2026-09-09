import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./review-recovery-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
const base = 'http://127.0.0.1:4187';
async function capture(page, name, locator, width) {
  await page.evaluate(() => document.fonts.ready);
  if (name === 'read-failed' || name === 'finish-failed') {
    await expect(locator.locator('h1')).toHaveCSS('font-size', '18px');
    if (width === 598) {
      const tops = await locator.locator('.question-controls .button').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top));
      if (new Set(tops).size !== 1) throw new Error('Recovery action layout: ' + JSON.stringify(await locator.locator('.question-controls .button').evaluateAll(elements => elements.map(element => ({ text: element.textContent, bounds: element.getBoundingClientRect().toJSON(), size: getComputedStyle(element).fontSize, padding: getComputedStyle(element).padding })))) );
    }
  }
  const file = `${name}-${width}.png`;
  await locator.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Recovery page overflows');
  captures.push({ file, width, bounds: await locator.boundingBox() });
}
try {
  for (const width of [598, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto(base + '/practice/');
    await expect(page.getByRole('heading', { name: 'No saved activity yet', exact: true })).toBeVisible();
    await page.locator('.study-hero .button-primary').click();
    await page.getByRole('button', { name: 'Flag for review', exact: true }).click();
    await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: 'Save answer', exact: true }).click();
    await expect(page.locator('.feedback-rationales')).toBeVisible();
    await page.goto(base + '/review/');
    await page.getByRole('button', { name: 'Finish review', exact: true }).click();
    await page.evaluate(() => {
      const original = IDBDatabase.prototype.transaction;
      IDBDatabase.prototype.transaction = function (stores, mode, options) {
        if (mode === 'readwrite' && Array.from(typeof stores === 'string' ? [stores] : stores).includes('review-events')) throw new DOMException('Capture fixture: write unavailable', 'QuotaExceededError');
        return original.call(this, stores, mode, options);
      };
    });
    await page.getByRole('button', { name: 'Confirm finish review', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your finished review was not saved', exact: true })).toBeFocused();
    await expect(page.getByRole('button', { name: 'Finish review', exact: true })).toBeDisabled();
    await expect(page.getByRole('link', { name: 'Read explanation', exact: true })).toHaveAttribute('href', /\/practice\/session\//);
    await capture(page, 'finish-failed', page.locator('.review-error'), width);
    await capture(page, 'retained-item', page.locator('.review-item-card'), width);
    // Reload removes the transaction fault; the saved answer remains unchanged.
    await page.reload();
    await page.getByRole('button', { name: 'Finish review', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm finish review', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'No review items are ready', exact: true })).toBeFocused();
    await expect(page.getByRole('region', { name: 'Review history', exact: true }).getByRole('listitem')).toHaveCount(1);
    await expect(page.locator('.study-hero .question-controls, .study-hero .figure-strip')).toHaveCount(0);
    await capture(page, 'cleared-hero', page.locator('.study-hero'), width);
    if (width === 598) {
      const tops = await page.locator('.review-empty .button').evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top));
      if (new Set(tops).size !== 1) throw new Error('Cleared actions should fit one row');
    }
    await capture(page, 'cleared-panel', page.locator('.review-empty'), width);
    await context.close();
    const failedContext = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    await failedContext.addInitScript(() => { IDBFactory.prototype.open = () => { throw new DOMException('Capture fixture: read unavailable', 'InvalidStateError'); }; });
    const failedPage = await failedContext.newPage();
    failedPage.on('pageerror', error => errors.push(String(error)));
    await failedPage.goto(base + '/review/');
    await expect(failedPage.getByRole('heading', { name: 'Review queue could not be built', exact: true })).toBeFocused();
    await capture(failedPage, 'read-failed', failedPage.locator('.review-error'), width);
    await failedContext.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors, note: '598px viewport gives 566px recovery panels, matching the inner panels of the 608px reference specimens. Specimen annotations are not app content.' }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
