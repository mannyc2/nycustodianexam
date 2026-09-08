import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const reviewRoot = fileURLToPath(new URL('./', import.meta.url));
const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));
const require = createRequire(path.join(repositoryRoot, 'apps/site/package.json'));
const { chromium, expect } = require('@playwright/test');
const baseURL = process.env.NYCUSTODIAN_REVIEW_URL ?? 'http://127.0.0.1:4187';
const output = path.join(reviewRoot, 'implementation-screenshots');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  ...(process.env.NYCUSTODIAN_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.NYCUSTODIAN_CHROMIUM_EXECUTABLE }
    : { channel: 'chromium' })
});
const captures = [];
const errors = [];

async function capture(page, name, state, width, fullPage = true) {
  await page.evaluate(async () => { await document.fonts.ready; });
  const file = `${name}-${width}.png`;
  await page.screenshot({ path: path.join(output, file), fullPage, animations: 'disabled' });
  captures.push({ file, viewportFile: `${name}-${width}-viewport.png`, route: new URL(page.url()).pathname, state, width, height: 900, fullPage });
  await page.screenshot({ path: path.join(output, `${name}-${width}-viewport.png`), fullPage: false, animations: 'disabled' });
  console.log(file);
}

try {
  for (const width of [1248, 384]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 }, locale: 'en-US', timezoneId: 'UTC',
      serviceWorkers: 'block', reducedMotion: 'reduce'
    });
    const page = await context.newPage();
    page.on('pageerror', (error) => errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-09-07T12:00:00Z'));

    for (const [name, route, ready] of [
      ['home', '/', null],
      ['practice-first-visit', '/practice/', 'No saved activity yet'],
      ['review-empty', '/review/', 'No review items are ready'],
    ]) {
      await page.goto(baseURL + route);
      await expect(page.locator('h1')).toBeVisible();
      if (ready) await expect(page.getByRole('heading', { name: ready, exact: true })).toBeVisible();
      await page.waitForLoadState('networkidle');
      await capture(page, name, 'First visit; no saved attempts or downloads', width, name !== 'atlas');
    }

    await page.goto(baseURL + '/practice/');
    await expect(page.getByRole('heading', { name: 'No saved activity yet', exact: true })).toBeVisible();
    await page.locator('[data-library-menu] summary').click();
    await capture(page, 'practice-library-open', 'First visit; Library disclosure open', width);
    await page.locator('[data-library-menu] summary').click();
    await page.locator('[data-study-hub] .study-hero a.button-primary').click();
    await expect(page.getByRole('button', { name: 'Save answer', exact: true })).toBeVisible();
    await capture(page, 'question-unanswered', 'First question of the actual 45-question set; no answer selected', width);
    await page.getByRole('button', { name: 'Flag for review', exact: true }).click();
    await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: 'Save answer', exact: true }).click();
    await expect(page.locator('.feedback-rationales')).toBeVisible();
    await capture(page, 'question-answered', 'One flagged answer saved using the real player', width);
    await page.goto(baseURL + '/practice/');
    await expect(page.getByRole('region', { name: 'Recent activity' }).getByRole('listitem')).toHaveCount(1);
    await capture(page, 'practice-returning', 'Returning learner with one real saved and flagged answer', width);
    await page.goto(baseURL + '/review/');
    await expect(page.getByRole('heading', { name: '1 item to review', exact: true })).toBeVisible();
    await capture(page, 'review-ready', 'One flagged answer ready for review', width);
    await page.getByRole('button', { name: 'Finish review', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Finish this review?', exact: true })).toBeVisible();
    await capture(page, 'review-confirmation', 'Finish review confirmation open; item remains in queue', width);
    await page.evaluate(() => {
      const transaction = IDBDatabase.prototype.transaction;
      IDBDatabase.prototype.transaction = function (stores, mode, options) {
        if (mode === 'readwrite' && Array.from(typeof stores === 'string' ? [stores] : stores).includes('review-events')) throw new DOMException('Capture fixture: write unavailable', 'QuotaExceededError');
        return transaction.call(this, stores, mode, options);
      };
    });
    await page.getByRole('button', { name: 'Confirm finish review', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your finished review was not saved', exact: true })).toBeVisible();
    await capture(page, 'review-finish-failed', 'Explicit fixture: acknowledgement transaction fails; saved attempt remains', width);
    await context.close();

    const failureContext = await browser.newContext({
      viewport: { width, height: 900 }, locale: 'en-US', timezoneId: 'UTC', serviceWorkers: 'block'
    });
    await failureContext.addInitScript(() => {
      IDBFactory.prototype.open = () => { throw new DOMException('Storage unavailable', 'InvalidStateError'); };
    });
    const failurePage = await failureContext.newPage();
    await failurePage.goto(baseURL + '/practice/');
    await expect(failurePage.getByRole('heading', { name: 'Your saved progress could not be read', exact: true })).toBeVisible();
    await capture(failurePage, 'practice-storage-unavailable', 'Explicit test fixture: IndexedDB open fails', width);
    await failurePage.goto(baseURL + '/review/');
    await expect(failurePage.getByRole('heading', { name: 'Review queue could not be built', exact: true })).toBeVisible();
    await capture(failurePage, 'review-read-failed', 'Explicit test fixture: IndexedDB open fails', width);
    await failureContext.close();
  }
} finally {
  await browser.close();
}
await writeFile(path.join(output, 'manifest.json'), JSON.stringify({
  browser: 'Chromium', locale: 'en-US', timezone: 'UTC',
  fixedTime: '2026-09-07T12:00:00Z', captures, pageErrors: errors
}, null, 2) + '\n');
if (errors.length) throw new Error(`Unexpected page errors: ${errors.join('; ')}`);
console.log(`Captured ${captures.length} implementation screenshots; no unexpected page errors.`);
