import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./print-illustrated-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const paper of ['us-letter', 'a4']) for (const large of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 1053, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/offline/');
    await page.getByRole('button', { name: /^Download (the .* copy|and check)$/ }).click();
    await expect(page.getByText(/Download complete and checked/)).toBeVisible({ timeout: 120000 });
    await page.goto('http://127.0.0.1:4187/print/');
    await page.getByLabel('Number of questions').fill('3');
    await page.locator('#print-paper').selectOption(paper);
    await page.locator('#print-margin').selectOption(large ? 'wide' : 'standard');
    await page.getByLabel('Large print (at least 18pt)', { exact: true }).setChecked(large);
    await page.getByText('Repeat this exact set', { exact: true }).click();
    await page.locator('#print-seed').fill('illustrated-print-158');
    await page.getByRole('button', { name: 'Generate preview', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Original multiple-choice practice', exact: true, level: 1 })).toBeVisible();
    const image = page.locator('img.print-question-image');
    await expect(image).toHaveCount(1);
    await expect(image).toHaveAttribute('src', /^data:image\/png;base64,/);
    await page.reload();
    await expect(image).toBeVisible();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(image => image.decode()));
    });
    await page.emulateMedia({ media: 'print' });
    const id = `${paper}-${large ? 'large-wide' : 'normal'}`;
    const file = output + id + '.pdf';
    await page.pdf({ path: file, preferCSSPageSize: true, printBackground: false });
    const info = execFileSync('pdfinfo', [file], { encoding: 'utf8' });
    const text = execFileSync('pdftotext', ['-layout', file, '-'], { encoding: 'utf8' });
    if (!text.includes('Which tool is shown in the illustration?')) throw new Error('Illustrated question missing from PDF');
    execFileSync('pdftoppm', ['-scale-to', '1100', '-png', file, output + id]);
    captures.push({ id, paper, large, seed: 'illustrated-print-158', questionIds: ['q048', 'q091', 'q024'], retainedImages: 1, pages: Number(info.match(/Pages:\s+(\d+)/)[1]), pageSize: info.match(/Page size:\s+(.+)/)[1], searchableText: true });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
