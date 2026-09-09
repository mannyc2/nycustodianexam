import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./simulation-nonvisual-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1008, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/offline/');
    await page.getByRole('button', { name: /^Download (the .* copy|and check)$/ }).click();
    await expect(page.getByText(/Download complete and checked/)).toBeVisible({ timeout: 120000 });
    await page.getByRole('button', { name: /Turn on this saved copy/ }).click();
    await expect(page.getByText(/now in use for new sessions/)).toBeVisible();
    await page.goto('http://127.0.0.1:4187/simulations/');
    await page.getByRole('group', { name: 'Set length' }).getByRole('radio', { name: /^90 items/ }).check();
    await page.locator('details', { has: page.getByLabel('Set code (seed)') }).evaluate(node => { node.open = true; });
    await page.getByLabel('Set code (seed)').fill('nonvisual-simulation');
    await page.getByRole('button', { name: 'Start simulation', exact: true }).click();
    await expect(page).toHaveURL(/\/question\/1\/$/);
    const coordinate = await page.evaluate(() => new Promise((resolve, reject) => {
      const request = indexedDB.open('nycustodian-study-v1');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction('simulation-sessions', 'readonly');
        const query = tx.objectStore('simulation-sessions').getAll();
        query.onsuccess = () => {
          const session = query.result[0], item = session.items.find(item => item.question?.id === 'q091');
          if (!item) reject(new Error('The deterministic fixture omitted q091'));
          else resolve({ id: session.id, position: item.position });
        };
        tx.oncomplete = () => db.close();
      };
    }));
    await page.goto(`http://127.0.0.1:4187/simulations/session/${coordinate.id}/question/${coordinate.position}/`);
    await page.getByRole('button', { name: 'Use nonvisual version', exact: true }).click();
    await expect(page.getByText('Saved on this device', { exact: true })).toBeVisible();
    await page.getByRole('radio', { name: 'Adjustable wrench', exact: true }).check();
    await expect(page.getByText('Saved on this device', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText('Nonvisual version', { exact: true })).toBeVisible();
    for (const state of ['player', 'result']) {
      if (state === 'result') {
        await page.getByRole('button', { name: 'Review and submit simulation', exact: true }).click();
        await page.getByRole('button', { name: 'Submit final answers', exact: true }).click();
        await expect(page).toHaveURL(/\/results\/$/);
        await expect(page.getByText('Answered using the nonvisual version.', { exact: true })).toBeVisible();
      }
      await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
      const target = state === 'player' ? page.locator('.question-card') : page.locator('.result-list > li').filter({ has: page.locator(`#result-question-${coordinate.position}`) });
      const file = `${state}-${width}.png`;
      await target.screenshot({ path: output + file });
      captures.push({ file, width, position: coordinate.position, bounds: await target.boundingBox() });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Simulation overflow');
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
