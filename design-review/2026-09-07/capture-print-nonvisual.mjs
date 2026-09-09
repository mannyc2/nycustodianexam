import { mkdir, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./print-nonvisual-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const paper of ['us-letter', 'a4']) for (const large of [false, true]) {
    const context = await browser.newContext({ viewport: { width: 1053, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/print/');
    const bootstrap = JSON.parse(await page.locator('#print-builder-data').textContent());
    const equivalent = bootstrap.questions.find(question => question.id === 'q091').illustration.nonvisualEquivalent;
    await page.getByLabel('Number of questions').fill('3');
    await page.locator('#print-paper').selectOption(paper);
    await page.locator('#print-margin').selectOption(large ? 'wide' : 'standard');
    await page.getByLabel('Large print (at least 18pt)', { exact: true }).setChecked(large);
    await page.getByText('Repeat this exact set', { exact: true }).click();
    await page.locator('#print-seed').fill('nonvisual-print-21');
    await page.getByLabel('Use authored nonvisual versions for illustrated questions', { exact: true }).check();
    await page.getByRole('button', { name: 'Generate preview', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Original multiple-choice practice — nonvisual', exact: true, level: 1 })).toBeVisible();
    const estimatedPages = Number(await page.locator('div').filter({ has: page.locator('dt', { hasText: /^Estimated page count$/ }) }).filter({ has: page.locator('dd') }).last().locator('dd').innerText());
    await expect(page.locator('img.print-question-image')).toHaveCount(0);
    await expect(page.locator('.print-observation-list li')).toHaveCount(4);
    await page.reload();
    await expect(page.locator('.print-observation-list li')).toHaveCount(4);
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
    const searchableText = text.replace(/\s+/g, ' ');
    for (const fact of [equivalent.prompt, ...equivalent.observations]) {
      if (!searchableText.includes(fact)) throw new Error('Authored nonvisual text missing from PDF');
    }
    if (estimatedPages !== Number(info.match(/Pages:\s+(\d+)/)[1])) throw new Error('Sample page estimate differs from actual PDF');
    execFileSync('pdftoppm', ['-scale-to', '1100', '-png', file, output + id]);
    captures.push({ id, paper, large, seed: 'nonvisual-print-21', questionIds: ['q045', 'q091', 'q037'], retainedImages: 0, estimatedPages, pages: Number(info.match(/Pages:\s+(\d+)/)[1]), pageSize: info.match(/Page size:\s+(.+)/)[1], searchableText: true });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
