import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./print-download-recovery-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1053, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/print/');
    await page.getByLabel('Number of questions').fill('3');
    await page.getByText('Repeat this exact set', { exact: true }).click();
    await page.locator('#print-seed').fill('illustrated-print-158');
    await page.getByRole('button', { name: 'Generate preview', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Print preview was not generated', exact: true })).toBeFocused();
    await page.evaluate(() => document.fonts.ready);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw new Error(`Overflow at ${width}px`);
    await page.locator('.print-builder .status-panel').screenshot({ path: output + `${width}.png` });
    captures.push({ width, file: `${width}.png`, focus: 'Print preview was not generated', overflow });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
