import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./simulation-final-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1008, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:8787/offline/');
    await page.getByRole('button', { name: /^Download (the .* copy|and check)$/ }).click();
    await expect(page.getByText(/Download complete and checked/)).toBeVisible({ timeout: 120000 });
    await page.getByRole('button', { name: /Turn on this saved copy/ }).click();
    await expect(page.getByText(/now in use for new sessions/)).toBeVisible();
    await page.goto('http://127.0.0.1:8787/simulations/');
    await page.getByRole('radio', { name: 'Timed practice', exact: true }).check();
    await page.getByRole('button', { name: 'Start simulation', exact: true }).click();
    await expect(page.locator('.simulation-main input[type="radio"]').first()).toBeEnabled({ timeout: 30000 });
    for (let position = 1; position <= 3; position++) {
      await page.locator('.simulation-main input[type="radio"]').first().check();
      await expect(page.getByRole('button', { name: 'Flag this question', exact: true })).toBeEnabled();
      if (position === 2) {
        await page.getByRole('button', { name: 'Flag this question', exact: true }).click();
        await expect(page.getByRole('button', { name: 'Flagged for review', exact: true })).toBeEnabled();
      }
      await page.getByRole('link', { name: 'Next item →', exact: true }).click();
    }
    await expect(page.locator('.simulation-navigator').getByRole('heading', { name: 'Item 4 of 45', exact: true })).toBeVisible();
    await expect(page.locator('.simulation-timer')).toBeVisible();
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight)).toBeGreaterThan(900);
    await page.screenshot({ path: output + `player-full-${width}.png`, fullPage: true });
    const workspace = page.locator('.simulation-workspace');
    await workspace.screenshot({ path: output + `player-${width}.png`, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
    await page.getByRole('checkbox', { name: 'Show the timer', exact: true }).uncheck();
    await expect(page.locator('[data-simulation-timer-hidden]')).toBeVisible();
    await page.locator('.simulation-timer').screenshot({ path: output + `timer-hidden-${width}.png` });
    await page.reload();
    await expect(page.locator('[data-simulation-timer-hidden]')).toBeVisible();
    await expect(page.getByRole('checkbox', { name: 'Show the timer', exact: true })).not.toBeChecked();
    await page.getByRole('button', { name: 'Review and submit simulation', exact: true }).click();
    await page.locator('.simulation-navigator').screenshot({ path: output + `confirmation-${width}.png` });
    await page.getByRole('button', { name: 'Submit final answers', exact: true }).click();
    await expect(page.getByRole('heading', { name: /^Practice accuracy:/ })).toBeFocused({ timeout: 30000 });
    await page.screenshot({ path: output + `results-${width}.png` });
    await page.locator('.result-list > li').first().screenshot({ path: output + `first-result-${width}.png`, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
    await expect(page.locator('.result-list > li')).toHaveCount(45);
    await page.getByRole('link', { name: 'Review item 4', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Question 4: Unanswered', exact: true })).toBeFocused();
    await page.locator('.result-list > li').nth(3).screenshot({ path: output + `unanswered-result-${width}.png`, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
    await page.getByRole('link', { name: 'Review item 2', exact: true }).click();
    await expect(page.locator('#result-question-2')).toBeFocused();
    await expect(page.locator('.result-list > li').nth(1)).toContainText('Your flag stays with this saved result.');
    await page.reload();
    await expect(page.locator('.result-list > li')).toHaveCount(45);
    await expect(page.locator('.simulation-results')).toContainText('3 answered · 42 unanswered');
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Results overflow');
    captures.push({ width, answered: 3, flagged: 1, submitted: 45, timed: true, hiddenTimerRestored: true, resultsRestored: true, itemLinkFocusVerified: true });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
