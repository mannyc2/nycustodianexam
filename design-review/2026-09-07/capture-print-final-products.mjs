import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./print-final-products/', import.meta.url));
// Raster pages are regenerable review aids; PDFs and receipts are durable evidence.
const rasterOutput = join(tmpdir(), 'nycustodian-print-final-products-pages');
await mkdir(output, { recursive: true });
await mkdir(rasterOutput, { recursive: true });
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: fileURLToPath(new URL('../../', import.meta.url)), encoding: 'utf8' }).trim();
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  const context = await browser.newContext({ viewport: { width: 1053, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://127.0.0.1:4187/offline/');
  await page.getByRole('button', { name: /^Download (the .* copy|and check)$/ }).click();
  await expect(page.getByText(/Download complete and checked/)).toBeVisible({ timeout: 120000 });
  for (const product of [
    { id: 'blank-answer-sheet', title: 'Blank answer sheet', count: 45 },
    { id: 'answer-key', title: 'Answer key', count: 10 },
    { id: 'explanations-and-sources', title: 'Explanations and source references', count: 2 },
    { id: 'announcement-profile-fact-sheet', title: 'Announcement-profile fact sheet', count: 1 }
  ]) for (const paper of ['us-letter', 'a4']) for (const large of [false, true]) {
    await page.emulateMedia({ media: 'screen' });
    await page.goto('http://127.0.0.1:4187/print/');
    await page.locator(`input[name="print-product"][value="${product.id}"]`).check();
    await page.locator('#print-count').fill(String(product.count));
    await page.locator('#print-paper').selectOption(paper);
    await page.locator('#print-margin').selectOption(large ? 'wide' : 'standard');
    await page.getByLabel('Large print (at least 18pt)', { exact: true }).setChecked(large);
    await page.getByText('Repeat this exact set', { exact: true }).click();
    await page.locator('#print-seed').fill('final-print-products-v5');
    await page.getByRole('button', { name: 'Generate preview', exact: true }).click();
    await expect(page.getByRole('heading', { name: product.title, exact: true, level: 1 })).toBeVisible({ timeout: 30000 });
    const estimatedPages = Number(await page.locator('div').filter({ has: page.locator('dt', { hasText: /^Estimated page count$/ }) }).filter({ has: page.locator('dd') }).last().locator('dd').innerText());
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())); });
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.print-preview-actions')).toBeHidden();
    const id = `${product.id}-${paper}-${large ? 'large-wide' : 'normal'}`;
    const file = output + id + '.pdf';
    await page.pdf({ path: file, preferCSSPageSize: true, printBackground: false });
    const info = execFileSync('pdfinfo', [file], { encoding: 'utf8' });
    const text = execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
    if (!text.replace(/\s+/g, ' ').includes(product.title)) throw new Error('Missing searchable PDF title');
    execFileSync('pdftoppm', ['-scale-to', '1100', '-png', file, join(rasterOutput, id)]);
    const sha256 = createHash('sha256').update(await readFile(file)).digest('hex');
    captures.push({ id, sha256, product: product.id, count: product.count, paper, large, estimatedPages, pages: Number(info.match(/Pages:\s+(\d+)/)[1]), pageSize: info.match(/Page size:\s+(.+)/)[1], searchableText: true });
    await writeFile(output + 'manifest.json', JSON.stringify({ sourceCommit, rasterOutput, captures, errors }, null, 2) + '\n');
  }
  await context.close();
} finally { await browser.close(); }
if (errors.length) throw new Error(errors.join('\n'));
