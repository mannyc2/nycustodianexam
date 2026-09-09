import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./print-output/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const paper of ['us-letter', 'a4']) {
    const context = await browser.newContext({ viewport: { width: 1053, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/print/');
    await page.getByLabel('Number of questions').fill('45');
    await page.locator('#print-paper').selectOption(paper);
    await page.getByText('Repeat this exact set', { exact: true }).click();
    await page.locator('#print-seed').fill('print-pagination-review');
    await page.getByRole('button', { name: 'Generate preview', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Original multiple-choice practice' })).toBeVisible({ timeout: 30000 });
    await page.screenshot({ path: output + `${paper}-screen.png` });
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.site-header')).toBeHidden();
    await expect(page.locator('.site-footer')).toBeHidden();
    await expect(page.locator('.print-preview-actions')).toBeHidden();
    await page.pdf({ path: output + `${paper}-45-questions.pdf`, preferCSSPageSize: true, printBackground: true });
    captures.push({ paper, questionCount: 45, seed: 'print-pagination-review', pdf: `${paper}-45-questions.pdf` });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
