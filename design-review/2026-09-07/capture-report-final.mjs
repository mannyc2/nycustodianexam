import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./report-final-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1053, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    let posts = 0;
    let intakeActive = false;
    await page.route('**/api/corrections', route => { posts++; return route.abort(); });
    await page.route('**/api/corrections/status', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ schemaVersion: 1, mode: intakeActive ? 'active-v1' : 'disabled', acceptsReports: intakeActive }) }));
    await page.goto('http://127.0.0.1:4187/report/');
    await expect(page.getByText('No saved draft was found on this device. Nothing has been sent.')).toBeVisible();
    for (const state of ['empty', 'restored', 'intake-off', 'validation-error']) {
      if (state === 'restored') {
        await page.getByLabel('Public page path').fill('/atlas/tool/adjustable-wrench/');
        await page.getByLabel('Short summary').fill('The tool caption is difficult to read on a small screen.');
        await page.getByLabel('Details', { exact: true }).fill('Please review the caption spacing on the public tool page at a compact viewport. This local draft is a UI verification example.');
        await page.getByRole('button', { name: 'Save local draft', exact: true }).click();
        await expect(page.getByText(/Draft saved in this browser/)).toBeVisible();
        await page.reload();
        await expect(page.getByText('Your saved draft was restored. Nothing was sent.')).toBeVisible();
      }
      if (state === 'intake-off') {
        await page.getByRole('button', { name: 'Check whether reports can be sent', exact: true }).click();
        await expect(page.getByText(/online intake is off/)).toBeVisible();
      }
      if (state === 'validation-error') {
        intakeActive = true;
        await page.getByRole('button', { name: 'Check again', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Submit report', exact: true })).toBeVisible();
        await page.getByLabel('Short summary').fill('');
        await page.getByLabel('Details', { exact: true }).fill('');
        await page.getByRole('button', { name: 'Submit report', exact: true }).click();
        await expect(page.getByRole('heading', { name: 'Report not submitted', exact: true })).toBeFocused();
      }
      await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
      await page.screenshot({ path: output + `${state}-${width}.png`, fullPage: true });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Report horizontal overflow');
      captures.push({ width, state, posts });
    }
    if (posts !== 0) throw new Error('Local drafting attempted a POST');
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
