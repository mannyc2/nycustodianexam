import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./nonvisual-nojs-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [];
try {
  for (const width of [1053, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled: false });
    const page = await context.newPage();
    const feedbackRequests = [];
    page.on('request', request => { if (request.url().includes('.postcommit.json')) feedbackRequests.push(request.url()); });
    await page.goto('http://127.0.0.1:4187/practice/session/launch-v1/question/91/');
    await page.getByText('Read nonvisual version', { exact: true }).click();
    await expect(page.locator('.question-nonvisual-body li')).toHaveCount(4);
    await expect(page.getByRole('radio').first()).toBeDisabled();
    await page.locator('.question-illustration img').evaluate(image => image.decode());
    // Page-script callbacks are disabled here; poll native font status and let the screenshot action await layout stability.
    await expect.poll(() => page.evaluate(() => document.fonts.status)).toBe('loaded');
    const file = `expanded-${width}.png`;
    await page.locator('.question-card').screenshot({ path: output + file });
    if (feedbackRequests.length) throw new Error('No-JavaScript reading requested feedback');
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('No-JavaScript overflow');
    captures.push({ file, width, feedbackRequests });
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures }, null, 2) + '\n');
