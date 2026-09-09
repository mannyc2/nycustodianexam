import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL(process.env.PRINT_CAPTURE_OUTPUT ?? './print-hazard-output/', import.meta.url));
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
    { id: 'letter-hazard-worksheet', product: 'Blank hazard worksheet', count: 2, large: false, paper: 'us-letter' },
    { id: 'letter-hazard-answers', product: 'Annotated hazard-answer packet', count: 2, large: false, paper: 'us-letter' },
    { id: 'a4-hazard-answers-large', product: 'Annotated hazard-answer packet', count: 2, large: true, paper: 'a4' },
    { id: 'a4-hazard-text', product: 'Text-equivalent/nonvisual set', title: 'Text-equivalent hazard set', count: 2, large: false, paper: 'a4' }
  ]) {
    await page.emulateMedia({ media: 'screen' });
    await page.goto('http://127.0.0.1:4187/print/');
    await page.getByRole('radio', { name: entry.product, exact: true }).check();
    await page.locator('#print-count').fill(String(entry.count));
    await page.locator('#print-paper').selectOption(entry.paper);
    await page.locator('#print-margin').selectOption(entry.large ? 'wide' : 'standard');
    await page.getByLabel('Large print (at least 18pt)', { exact: true }).setChecked(entry.large);
    await page.getByText('Repeat this exact set', { exact: true }).click();
    await page.locator('#print-seed').fill('print-pagination-review');
    await page.getByRole('button', { name: 'Generate preview', exact: true }).click();
    await expect(page.getByRole('heading', { name: entry.title ?? entry.product, exact: true, level: 1 })).toBeVisible({ timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.print-preview-actions')).toBeHidden();
    await expect(page.locator('.print-preview h1')).toHaveCSS('outline-style', 'none');
    await page.locator('.print-preview img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
    for (const image of await page.locator('.print-preview img').all()) await expect(image).toHaveCSS('filter', 'grayscale(1)');
    const images = await page.locator('.print-preview img').evaluateAll(images => images.map(image => ({ loaded: image.complete && image.naturalWidth > 0, filter: getComputedStyle(image).filter })));
    if (images.some(image => !image.loaded || image.filter !== 'grayscale(1)')) throw new Error('Print image missing or not grayscale: ' + JSON.stringify(images));
    const typography = await page.locator('.print-preview').evaluate(preview => ({
      headings: [...preview.querySelectorAll('h1,h2,h3,h4')].map(node => ({ text: node.textContent, pixels: parseFloat(getComputedStyle(node).fontSize) })),
      urls: [...preview.querySelectorAll('.print-section a[href]')].map(node => parseFloat(getComputedStyle(node, '::after').fontSize))
    }));
    const minimum = entry.large ? 24 : 16;
    if (typography.headings.some(heading => heading.pixels < minimum) || typography.urls.some(size => size < minimum)) throw new Error('Printed type is below the selected size: ' + JSON.stringify(typography));
    const file = output + entry.id + '.pdf';
    await page.pdf({ path: file, preferCSSPageSize: true, printBackground: false });
    const info = execFileSync('pdfinfo', [file], { encoding: 'utf8' });
    const text = execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
    if (!text.includes(entry.title ?? entry.product)) throw new Error('PDF text is not searchable');
    captures.push({ ...entry, typography, images: images.length, pages: Number(info.match(/Pages:\s+(\d+)/)[1]), pageSize: info.match(/Page size:\s+(.+)/)[1], searchableText: true, backgrounds: false });
  }
} finally { await browser.close(); }
await writeFile(output + 'hazard-manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
