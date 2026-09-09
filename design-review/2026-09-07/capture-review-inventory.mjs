import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const includeHazards = process.env.REVIEW_INCLUDE_HAZARDS === '1';
const output = fileURLToPath(new URL(includeHazards ? './review-mixed-audit/' : './review-inventory-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const errors = [], captures = [];
try {
  const context = await browser.newContext({ viewport: { width: 1248, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(String(error)));
  await page.clock.setFixedTime(new Date('2026-09-07T12:00:00Z'));
  await page.goto('http://127.0.0.1:4187/practice/');
  await expect(page.getByRole('heading', { name: 'No saved activity yet', exact: true })).toBeVisible();
  await page.locator('.study-hero .button-primary').click();
  for (let index = 0; index < 7; index++) {
    await page.getByRole('button', { name: 'Flag for review', exact: true }).click();
    await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: 'Save answer', exact: true }).click();
    await expect(page.locator('.feedback-rationales')).toBeVisible();
    if (index < 6) await page.getByRole('link', { name: 'Next question', exact: true }).click();
  }
  if (includeHazards) {
    for (const position of [1, 3]) {
      await page.goto(`http://127.0.0.1:4187/hazards/session/launch-v1/scene/${position}/`);
      await expect(page.getByRole('button', { name: 'Save marks', exact: true })).toBeEnabled();
      await page.getByRole('button', { name: 'Save marks', exact: true }).click();
      await page.getByRole('button', { name: 'Confirm and save no marks', exact: true }).click();
      await expect(page.locator('.hazard-player__results')).toBeVisible();
    }
  }
  // Explicit failure fixture: corrupt one saved receipt, preserving the response.
  await page.evaluate(() => new Promise((resolve, reject) => {
    const open = indexedDB.open('nycustodian-study-v1');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result, tx = db.transaction('attempts', 'readwrite'), store = tx.objectStore('attempts');
      const request = store.getAll();
      request.onsuccess = () => {
        const record = request.result.at(-1);
        store.put({ ...record, receipt: { ...record.receipt, postcommitSha256: 'f'.repeat(64) } });
      };
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
    };
  }));
  await page.goto('http://127.0.0.1:4187/review/');
  await expect(page.getByRole('heading', { name: `${includeHazards ? 8 : 6} items to review`, exact: true })).toBeVisible();
  await page.locator('.review-item-card').filter({ has: page.locator('a[href*="/practice/session/"]') }).first().getByRole('button', { name: 'Finish review', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm finish review', exact: true }).click();
  await expect(page.getByRole('heading', { name: `${includeHazards ? 7 : 5} items to review`, exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Unavailable saved attempts', exact: true }).getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('region', { name: 'Review history', exact: true }).getByRole('listitem')).toHaveCount(1);
  await expect(page.locator('.study-hero .figure-strip > div').filter({ hasText: 'Unavailable attempts' }).locator('dd')).toHaveText('1');
  for (const width of [1248, 384]) {
    await page.setViewportSize({ width, height: 900 });
    await expect.poll(() => page.locator(".study-hero .figure-strip").evaluate(element => getComputedStyle(element).gridTemplateColumns.split(" ").length)).toBe(width === 384 ? 2 : 4);
    for (const filter of ['All', 'Missed', 'Flagged']) {
      await page.getByRole('tab', { name: new RegExp(`^${filter} `) }).click();
      if (includeHazards) await expect(page.locator('.review-item-card').filter({ has: page.locator('a[href*="/hazards/session/"]') })).toHaveCount(filter === 'Flagged' ? 0 : 2);
      await page.evaluate(async () => { await document.fonts.ready; });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Review overflows');
      const file = `${filter.toLowerCase()}-${width}.png`;
      await page.locator('[aria-labelledby="review-due-heading"]').screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      captures.push({ file, width, filter, visibleItems: await page.locator('.review-queue-list > li').count() });
    }
    await page.getByRole('tab', { name: /^All / }).click();
    await page.getByRole('button', { name: 'Finish review', exact: true }).first().click();
    for (const [name, locator] of [
      ['confirmation', page.getByRole('group', { name: 'Confirm finished review', exact: true })],
      ['unavailable', page.getByRole('region', { name: 'Unavailable saved attempts', exact: true })],
      ['history', page.getByRole('region', { name: 'Review history', exact: true })],
      ['hero', page.locator('.study-hero')]
    ]) {
      const file = `${name}-${width}.png`;
      await locator.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      captures.push({ file, width });
    }
    await page.getByRole('button', { name: 'Keep in review', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Finish review', exact: true }).first()).toBeFocused();
  }
  if (includeHazards) {
    await page.locator('.review-item-card').filter({ has: page.locator('a[href*="/hazards/session/"]') }).first().getByRole('link', { name: 'Read explanation', exact: true }).click();
    await expect(page.locator('.hazard-player__results')).toBeVisible();
    await expect(page.locator('.hazard-player__workspace img').first()).toBeVisible();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ fixture: `Seven real flagged question saves; one deliberately mismatched receipt; one question review finished. ${includeHazards ? 'Two real visual hazard responses with confirmed empty marks, preserving missed-hazard feedback.' : 'No hazard responses in this fixture.'}`, captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
