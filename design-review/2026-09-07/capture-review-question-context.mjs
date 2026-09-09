import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./review-question-context/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1053, 384]) for (const mode of ['visual', 'nonvisual']) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/practice/session/launch-v1/question/91/');
    await expect(page.getByRole('radio', { name: 'Pipe wrench', exact: true })).toBeEnabled();
    if (mode === 'nonvisual') await page.getByRole('button', { name: 'Use nonvisual version', exact: true }).click();
    await page.getByRole('radio', { name: 'Pipe wrench', exact: true }).check();
    await page.getByRole('button', { name: 'Flag for review', exact: true }).click();
    await page.getByRole('button', { name: 'Save answer', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Answer explanations', exact: true })).toBeVisible();
    await page.goto('http://127.0.0.1:4187/review/session/launch-v1/item/91/');
    await expect(page.locator('.review-question-context')).toContainText('Flagged for review; Answered incorrectly');
    await expect(page.getByRole('link', { name: 'Return to Review', exact: true })).toHaveAttribute('href', '/review/');
    await expect(page.locator('.question-nonvisual-body')).toHaveCount(mode === 'nonvisual' ? 1 : 0);
    await expect(page.locator('.question-illustration')).toHaveCount(mode === 'visual' ? 1 : 0);
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
    await page.evaluate(() => window.scrollTo(0, 0));
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error('Horizontal overflow');
    const file = `review-${mode}-${width}.png`;
    await page.screenshot({ path: output + file, fullPage: true });
    captures.push({ file, width, mode, route: new URL(page.url()).pathname, overflow });
    await context.close();
  }
  await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
} finally { await browser.close(); }
if (errors.length) throw new Error(errors.join('\n'));
