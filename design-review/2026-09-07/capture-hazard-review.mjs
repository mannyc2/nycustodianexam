import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL('./hazard-review-current/', import.meta.url));
await mkdir(output, { recursive: true });
const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [];
try {
  for (const width of [1042, 384]) for (const mode of ['visual', 'nonvisual']) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    const path = `/hazards/session/${mode === 'visual' ? 'launch-v1' : 'launch-v1-nonvisual'}/scene/1/`;
    for (const state of ['missing', 'saved']) {
      if (state === 'saved') {
        await page.goto('http://127.0.0.1:4187' + path);
        if (mode === 'visual') {
          await expect(page.getByRole('button', { name: 'Add marker at center', exact: true })).toBeEnabled();
          const scene = page.locator('.hazard-player__image-layer');
          const box = await scene.boundingBox();
          if (!box) throw new Error('Missing image bounds');
          for (const [x, y] of [[0.5, 0.7], [0.9, 0.65]]) await scene.click({ position: { x: box.width * x, y: box.height * y } });
          await page.getByRole('button', { name: 'Save marks', exact: true }).click();
        } else {
          await page.locator('input[name=hazard-zone]').first().check();
          await page.getByRole('button', { name: 'Save response', exact: true }).click();
        }
        await expect(page.locator('.hazard-player__results')).toBeVisible();
      }
      await page.goto('http://127.0.0.1:4187' + path + '?review=1');
      await expect(page.getByRole('heading', { name: state === 'saved' ? 'Review your saved response' : 'Saved response unavailable', exact: true })).toBeVisible();
      await expect(page.getByRole('button', { name: /Save marks|Save response/ })).toHaveCount(0);
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(image => image.complete && image.naturalWidth > 0).map(image => image.decode())); });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error(`Overflow: ${width} ${mode} ${state}`);
      for (const area of ['page', 'context']) {
        const file = `${mode}-${state}-${width}-${area}.png`;
        if (area === 'page') await page.screenshot({ path: output + file, fullPage: true });
        else await page.getByRole('heading', { name: state === 'saved' ? 'Review your saved response' : 'Saved response unavailable', exact: true }).locator('..').screenshot({ path: output + file });
        captures.push({ file, width, mode, state, area, path: path + '?review=1', sha256: createHash('sha256').update(await readFile(output + file)).digest('hex') });
      }
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ sourceCommit, captures, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
