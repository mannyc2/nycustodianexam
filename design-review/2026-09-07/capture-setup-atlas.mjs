import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./setup-atlas-screenshots/', import.meta.url));
const baseURL = process.env.NYCUSTODIAN_REVIEW_URL ?? 'http://127.0.0.1:4187';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
async function capture(page, name, width, state, selector) {
  await page.evaluate(async () => { await document.fonts.ready; });
  const file = `${name}-${width}.png`;
  if (selector) await page.locator(selector).screenshot({ path: output + file, animations: 'disabled' });
  else await page.screenshot({ path: output + file, fullPage: true, animations: 'disabled' });
  const viewportFile = `${name}-${width}-viewport.png`;
  await page.screenshot({ path: output + viewportFile, animations: 'disabled' });
  captures.push({ file, viewportFile, state, selector, width, bounds: selector ? await page.locator(selector).boundingBox() : null, route: new URL(page.url()).pathname });
  console.log(file);
}
try {
  for (const width of [1053, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', locale: 'en-US', timezoneId: 'UTC', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(baseURL + '/simulations/');
    await expect(page.getByRole('button', { name: 'Start simulation', exact: true })).toBeEnabled();
    await capture(page, 'simulation-setup', width, 'Whole bank, 45 items, untimed', '.simulation-setup-panel');
    await page.getByLabel('Timed practice', { exact: true }).check();
    await capture(page, 'simulation-timed', width, '120-minute timer, hidden and auto-submit options off', '.simulation-setup-panel');
    const mix = page.getByRole('group', { name: 'Content mix', exact: true });
    await mix.getByRole('checkbox', { name: /^Minor maintenance/ }).uncheck();
    await mix.getByRole('checkbox', { name: /^Health and safety/ }).uncheck();
    await mix.getByRole('checkbox', { name: /^Mixed-domain/ }).uncheck();
    await expect(page.getByRole('button', { name: 'Start simulation', exact: true })).toBeDisabled();
    await capture(page, 'simulation-length-replacement', width, '30 available; chosen 45 blocked pending explicit replacement', '.simulation-setup-panel');
    await page.getByRole('radio', { name: /^30 items/ }).check();
    await capture(page, 'simulation-all-matching', width, 'Explicitly selected all 30 matching questions', '.simulation-setup-panel');
    await page.getByRole('radio', { name: 'Visual hazard scenes', exact: true }).check();
    await capture(page, 'simulation-hazards', width, 'Visual hazard task; all 18 scenes available, length 1', '.simulation-setup-panel');
    await page.getByRole('radio', { name: 'Hazard scenes — keyboard, no image', exact: true }).check();
    await capture(page, 'simulation-written-zones', width, 'Written-zone task; same scene inventory, distinct construct', '.simulation-setup-panel');
    await page.goto(baseURL + '/print/');
    await expect(page.getByRole('button', { name: 'Generate preview', exact: true })).toBeEnabled();
    await capture(page, 'print-builder', width, 'Question worksheet configuration, ten products, no exam prerequisite', '.print-builder');
    await page.getByRole('radio', { name: 'Announcement-profile fact sheet', exact: true }).check();
    await capture(page, 'print-fact-sheet', width, 'Reviewed Nassau announcement document, one available fact sheet', '.print-builder');
    await context.close();
  }
  for (const width of [990, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(baseURL + '/atlas/');
    await expect(page.locator('[data-tool-family]')).toHaveCount(65);
    // Load lazy images before recording the full catalog element.
    for (const card of await page.locator('[data-tool-family]').all()) await card.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, 0));
    await capture(page, 'atlas-all', width, 'All 65 released records; nine families', '.atlas-browser');
    if (width < 768) await page.getByRole('combobox', { name: 'Family', exact: true }).selectOption('rigid hand tools');
    else await page.locator('[data-atlas-family="rigid hand tools"]').click();
    await capture(page, 'atlas-rigid', width, 'Rigid hand tools, 15 records', '.atlas-browser');
    await page.route('**/content/**', async route => route.request().resourceType() === 'image' ? route.abort() : route.continue());
    await page.reload();
    await expect(page.locator('[data-tool-family]:visible [data-atlas-image-notice]').first()).toBeVisible();
    await capture(page, 'atlas-images-unavailable', width, 'Image requests fail; records and family control remain available', '.atlas-browser');
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, pageErrors: errors, browser: 'Chromium' }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
