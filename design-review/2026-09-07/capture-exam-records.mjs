import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./exam-record-screenshots/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1248, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/exams/');
    const storageBefore = await page.evaluate(() => JSON.stringify({ ...localStorage }));
    const choices = page.locator('[data-exam-choice]');
    for (let index = 0; index < await choices.count(); index++) {
      const choice = choices.nth(index);
      await choice.click();
      const panel = page.locator('[data-exam-panel]:visible');
      await expect(panel).toBeFocused();
      for (const tab of ['Announcement facts', 'What it tests']) {
        await panel.getByRole('tab', { name: tab, exact: true }).click();
        await expect(panel.getByRole('tabpanel', { name: tab, exact: true })).toBeVisible();
        const file = `record-${index + 1}-${tab === 'Announcement facts' ? 'facts' : 'subjects'}-${width}.png`;
        await panel.screenshot({ path: output + file, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
        if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Horizontal overflow');
        captures.push({ file, width, record: await panel.getAttribute('id'), tab });
      }
    }
    if (await page.evaluate(() => JSON.stringify({ ...localStorage })) !== storageBefore) throw new Error('Reading exam records changed localStorage');
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
