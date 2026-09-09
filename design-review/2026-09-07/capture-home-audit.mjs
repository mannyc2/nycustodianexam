import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../apps/site/package.json', import.meta.url));
const { chromium, expect } = require('@playwright/test');
const output = fileURLToPath(new URL(process.env.HOME_CAPTURE_OUTPUT ?? './home-final-audit/', import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const captures = [], errors = [], typography = [];
try {
  for (const width of [1248, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(String(error)));
    await page.goto('http://127.0.0.1:4187/');
    await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
    const heading = page.locator('.home-hero h1');
    await expect(heading).toHaveCSS('font-size', width === 384 ? '26px' : '46px');
    const cdp = await context.newCDPSession(page);
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    const { root } = await cdp.send('DOM.getDocument');
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector: '.home-hero h1' });
    const { fonts } = await cdp.send('CSS.getPlatformFontsForNode', { nodeId });
    typography.push({ width, fonts, computed: await heading.evaluate(element => {
      const style = getComputedStyle(element);
      return { fontFamily: style.fontFamily, fontSize: style.fontSize, fontWeight: style.fontWeight, lineHeight: style.lineHeight, letterSpacing: style.letterSpacing, textWrap: style.textWrap };
    }) });
    await cdp.detach();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Home overflows');
    for (const [name, locator] of [
      ['hero', page.locator('.home-hero')],
      ['coverage', page.getByRole('region', { name: 'What the test covers', exact: true })],
      ['ways', page.getByRole('region', { name: 'Ways to study', exact: true })],
      ['cycle', page.locator('.home-cycle-grid')],
      ['trust', page.locator('.home-trust-list')],
      ['footer', page.locator('footer')]
    ]) {
      await expect(locator).toBeVisible();
      await locator.screenshot({ path: output + `${name}-${width}.png`, style: '.site-header-inner > .nav-primary, .site-header-inner > .nav-utility { opacity: 0; }' });
      captures.push({ file: `${name}-${width}.png`, width, bounds: await locator.boundingBox() });
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({ path: output + `home-${width}.png`, fullPage: true });
    if (width === 384) {
      await expect(page.locator('.home-trust-list > div:visible')).toHaveCount(3);
      await expect(page.locator('footer')).toContainText('Original practice. No secure or recalled exam material.');
      await expect(page.locator('footer').getByRole('link', { name: 'Use offline', exact: true })).toBeVisible();
      const links = page.locator('.home-areas-section .home-scope-row > a');
      for (const link of await links.all()) {
        await expect(link).toHaveCSS('text-decoration-line', 'underline');
        if ((await link.boundingBox()).height < 44) throw new Error('Compact subject link target is too short');
      }
    }
    await page.getByRole('link', { name: 'Start practicing', exact: true }).click();
    await expect(page).toHaveURL(/\/practice\/$/);
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + 'manifest.json', JSON.stringify({ captures, typography, errors }, null, 2) + '\n');
if (errors.length) throw new Error(errors.join('\n'));
