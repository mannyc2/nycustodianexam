import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./print-output/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1053, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://127.0.0.1:4187/offline/');
  await page.getByRole('button', { name: /^Download (the .* copy|and check)$/ }).click();
  await expect(page.getByText(/Download complete and checked/)).toBeVisible({ timeout: 120000 });
  await page.getByRole('button', { name: /Turn on this saved copy/ }).click();
  await expect(page.getByText(/now in use for new sessions/)).toBeVisible();
  for (const entry of [
    { id: 'letter-large-wide', product: 'Original multiple-choice practice', count: 10, large: true, paper: 'us-letter' },
    { id: 'a4-large-wide', product: 'Original multiple-choice practice', count: 10, large: true, paper: 'a4' },
    { id: 'letter-tool-families', product: 'Tool-family contrast cards', count: 9, large: false, paper: 'us-letter' }
  ]) {
    await page.emulateMedia({ media: 'screen' });
    await page.goto('http://127.0.0.1:4187/print/');
    if (!entry.large) await page.getByRole('radio', { name: entry.product, exact: true }).check();
    await page.locator('#print-count').fill(String(entry.count));
    await page.locator('#print-paper').selectOption(entry.paper);
    await page.locator('#print-margin').selectOption(entry.large ? 'wide' : 'standard');
    await page.getByLabel('Large print (at least 18pt)', { exact: true }).setChecked(entry.large);
    await page.getByText('Repeat this exact set', { exact: true }).click();
    await page.locator('#print-seed').fill('print-pagination-review');
    await page.getByRole('button', { name: 'Generate preview', exact: true }).click();
    await expect(page.getByRole('heading', { name: entry.product, exact: true, level: 1 })).toBeVisible({ timeout: 30000 });
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.print-preview-actions')).toBeHidden();
    const images = await page.locator('.print-preview img').evaluateAll(images => images.map(image => ({ loaded: image.complete && image.naturalWidth > 0, filter: getComputedStyle(image).filter })));
    if (images.some(image => !image.loaded || image.filter !== 'grayscale(1)')) throw new Error('Print image missing or not grayscale');
    const file = output + entry.id + '.pdf';
    await page.pdf({ path: file, preferCSSPageSize: true, printBackground: false });
    const info = execFileSync('pdfinfo', [file], { encoding: 'utf8' });
    const text = execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
    if (!text.includes(entry.product)) throw new Error('PDF text is not searchable');
    captures.push({ ...entry, images: images.length, pages: Number(info.match(/Pages:\s+(\d+)/)[1]), pageSize: info.match(/Page size:\s+(.+)/)[1], searchableText: true, backgrounds: false });
  }
} finally { await browser.close(); }
await writeFile(output + 'extended-manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
