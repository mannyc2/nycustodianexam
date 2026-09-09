import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(new URL("../../apps/site/package.json", import.meta.url));
const { chromium, expect } = require("@playwright/test");
const output = fileURLToPath(new URL("./nonvisual-question-audit/", import.meta.url));
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: "chromium" });
const captures = [], errors = [];
try {
  for (const width of [1053, 384]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: "block" });
    const page = await context.newPage();
    page.on("pageerror", error => errors.push(String(error)));
    await page.goto("http://127.0.0.1:4187/practice/session/launch-v1/question/91/");
    await page.getByRole("button", { name: "Use nonvisual version", exact: true }).click();
    for (const state of ["unanswered", "answered", "review"]) {
      if (state === "answered") {
        await page.getByRole("button", { name: "Flag for review", exact: true }).click();
        await page.getByRole("radio", { name: "Pipe wrench", exact: true }).check();
        await page.getByRole("button", { name: "Save answer", exact: true }).click();
        await expect(page.getByText("Answered using the nonvisual version.", { exact: true })).toBeVisible();
      }
      if (state === "review") {
        await page.goto("http://127.0.0.1:4187/review/");
        await expect(page.getByRole("link", { name: "Read explanation", exact: true })).toBeVisible();
      }
      await page.evaluate(async () => { await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); });
      const target = state === "review" ? page.locator("main") : page.locator(".question-card");
      const file = `${state}-${width}.png`;
      await target.screenshot({ path: output + file });
      captures.push({ file, width, bounds: await target.boundingBox() });
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error("Question overflow");
    }
    await context.close();
  }
} finally { await browser.close(); }
await writeFile(output + "manifest.json", JSON.stringify({ captures, errors }, null, 2) + "\n");
if (errors.length) throw new Error(errors.join("\n"));
