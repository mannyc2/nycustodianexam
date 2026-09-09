import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./simulation-hazard-screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1008, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/offline/');
    await page.getByRole('button', { name: /^Download (the .* copy|and check)$/ }).click();
    await expect(page.getByText(/Download complete and checked/)).toBeVisible({ timeout: 120000 });
    await page.getByRole('button', { name: /Turn on this saved copy/ }).click();
    await expect(page.getByText(/now in use for new sessions/)).toBeVisible();
    for (const mode of ['visual', 'keyboard']) {
      await page.goto('http://127.0.0.1:4187/simulations/');
      await page.getByRole('radio', { name: mode === 'visual' ? 'Visual hazard scenes' : 'Hazard scenes — keyboard, no image', exact: true }).check();
      await page.locator('input[name="simulation-length"][value="1"]').check();
      await page.locator('details', { has: page.getByLabel('Set code (seed)') }).evaluate(node => { node.open = true; });
      await page.getByLabel('Set code (seed)').fill('simulation-hazard-visual-review');
      await page.getByRole('button', { name: 'Start simulation', exact: true }).click();
      const flag = page.getByRole('button', { name: 'Flag this item', exact: true });
      await expect(flag).toBeEnabled({ timeout: 30000 });
      if (mode === 'visual') {
        await page.getByRole('button', { name: 'Add marker at center', exact: true }).click();
        await expect(page.getByText('1 marker placed.', { exact: true })).toBeVisible();
      } else {
        await page.locator('.hazard-player__zones input[type="checkbox"]').first().check();
      }
      await expect(flag).toBeEnabled();
      await flag.click();
      await expect(page.getByRole('button', { name: 'Flagged for review', exact: true })).toBeEnabled();
      await page.reload();
      await expect(page.getByRole('button', { name: 'Flagged for review', exact: true })).toBeEnabled();
      const zeroControl = page.getByRole('checkbox', { name: 'I found no concerning locations or zones in this scene', exact: true });
      const geometry = await zeroControl.evaluate(input => ({ input: input.getBoundingClientRect().width, label: input.closest('label').getBoundingClientRect().height }));
      if (geometry.input < 20 || geometry.label < 44) throw new Error('Undersized no-concerns control');
      await page.evaluate(() => document.fonts.ready);
      await page.locator('.simulation-workspace').screenshot({ path: output + `${mode}-player-${width}.png`, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`${mode} player overflow at ${width}`);
      await page.getByRole('button', { name: 'Review and submit simulation', exact: true }).click();
      await page.getByRole('button', { name: 'Submit final answers', exact: true }).click();
      await expect(page.getByRole('heading', { name: /^Practice accuracy:/ })).toBeFocused({ timeout: 30000 });
      await expect(page.getByRole('heading', { name: 'Hazard practice metrics', exact: true })).toBeVisible();
      await page.locator('.result-list > li').first().screenshot({ path: output + `${mode}-result-${width}.png`, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`${mode} results overflow at ${width}`);
      captures.push({ width, mode, submitted: 1, flagged: 1, restoredBeforeSubmission: true });
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
