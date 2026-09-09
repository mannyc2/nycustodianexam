import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./print-preview-state-screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [779, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    const capture = async (state, target) => {
      await page.evaluate(() => document.fonts.ready);
      const file = `${state}-${width}.png`;
      await target.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Preview overflow');
      captures.push({ file, width, state });
    };
    await page.goto('http://127.0.0.1:4187/print/');
    await page.getByLabel('Number of questions').fill('2');
    await page.getByRole('button', { name: 'Generate preview', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Original multiple-choice practice', exact: true })).toBeFocused();
    await capture('ready-header', page.locator('.print-preview-header'));
    await expect(page.getByRole('button', { name: 'Open system print', exact: true })).toBeDisabled();
    await capture('inspection-actions', page.locator('.print-preview-actions'));
    await page.getByRole('checkbox').check();
    await page.evaluate(() => { window.print = () => { throw new Error('Capture unavailable system print'); }; });
    await page.getByRole('button', { name: 'Open system print', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'System print did not open', exact: true })).toBeFocused();
    await capture('system-print-failure', page.locator('[aria-labelledby="print-request-error-heading"]'));
    const originalUrl = page.url();
    await page.evaluate(() => {
      const put = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function(value, key) {
        if (this.name === 'print-jobs') {
          IDBObjectStore.prototype.put = put;
          throw new DOMException('Capture regeneration failure', 'QuotaExceededError');
        }
        return key === undefined ? put.call(this, value) : put.call(this, value, key);
      };
    });
    await page.getByRole('button', { name: 'Regenerate this packet', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Print preview was not regenerated', exact: true })).toBeFocused();
    if (page.url() !== originalUrl) throw new Error('Failed regeneration changed URL');
    await capture('regeneration-failure', page.locator('[aria-labelledby="print-regenerate-error-heading"]'));
    await page.evaluate(() => new Promise((resolve, reject) => {
      const open = indexedDB.open('nycustodian-study-v1');
      open.onerror = () => reject(open.error);
      open.onsuccess = () => {
        const db = open.result;
        const tx = db.transaction('print-jobs', 'readwrite');
        const store = tx.objectStore('print-jobs');
        const rows = store.getAll();
        rows.onsuccess = () => { for (const row of rows.result) store.put({ ...row, status: 'stale', updatedAt: Date.now() }); };
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onabort = () => { db.close(); reject(tx.error); };
      };
    }));
    await page.reload();
    await expect(page.getByRole('heading', { name: 'This job references corrected or removed content', exact: true })).toBeVisible();
    await page.getByRole('checkbox').check();
    await expect(page.getByRole('button', { name: 'Open system print', exact: true })).toBeDisabled();
    await capture('stale', page.locator('[aria-labelledby="stale-print-heading"]'));
    await page.getByRole('link', { name: 'Review regeneration options', exact: true }).click();
    await expect(page.locator('#print-preview-actions')).toBeFocused();
    await page.getByRole('button', { name: 'Regenerate this packet', exact: true }).click();
    await expect.poll(() => page.url()).not.toBe(originalUrl);
    await expect(page.getByRole('checkbox')).not.toBeChecked();
    await page.addInitScript(() => { indexedDB.open = () => { throw new DOMException('Capture storage unavailable', 'SecurityError'); }; });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Print preview unavailable', exact: true })).toBeFocused();
    await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
    await capture('restore-unavailable', page.locator('[data-print-preview] .status-panel-danger'));
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
