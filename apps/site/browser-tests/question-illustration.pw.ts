import { expect, test } from "@playwright/test"
import tools from "../../../content/authoring/visuals/releases/tools.json" with { type: "json" }

// Synthetic presentation fixture only: it is never submitted or released.
test("question illustration uses neutral responsive assets and recovers from image failure", async ({ page }) => {
  await page.setViewportSize({ width: 384, height: 900 })
  const tool = tools[0]!
  const illustration = {
    masterSha256: tool.master.sha256,
    neutralDescription: "An isolated tool against a plain background.",
    derivatives: tool.derivatives.map(({ kind, path, bytes, sha256 }) => ({ kind, path, bytes, sha256 }))
  }
  const path = "/practice/session/launch-v1/question/1/"
  await page.route(`**${path}`, async route => {
    const response = await route.fetch()
    const body = (await response.text()).replace(/(<script id="question-data" type="application\/json">)([\s\S]*?)(<\/script>)/, (_, start, json, end) =>
      start + JSON.stringify({ ...JSON.parse(json), illustration }) + end)
    await route.fulfill({ response, body })
  })
  await page.route("**/content/assets/derivatives/tools/t001-*.png", route => route.abort())
  await page.goto(path)
  await expect(page.getByText("Illustrated question", { exact: false })).toBeVisible()
  const retry = page.getByRole("button", { name: "Try image again" })
  await expect(retry).toBeVisible()
  await page.unroute("**/content/assets/derivatives/tools/t001-*.png")
  await retry.click()
  const image = page.getByRole("img", { name: illustration.neutralDescription })
  await expect(image).toBeVisible()
  await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  expect(await image.evaluate(node => (node as HTMLImageElement).currentSrc)).toContain("t001-phone.png")
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(384)
})

test("released illustrated question saves, reloads, and opens from Review", async ({ page }) => {
  await page.goto("/practice/session/launch-v1/question/91/")
  const image = page.locator(".question-illustration img")
  await expect(image).toBeVisible()
  await expect.poll(() => image.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
  await page.getByRole("button", { name: "Flag for review", exact: true }).click()
  await page.getByRole("radio", { name: "Adjustable wrench", exact: true }).check()
  await page.getByRole("button", { name: "Save answer", exact: true }).click()
  await expect(page.getByRole("heading", { name: /Correct.*Adjustable wrench/ })).toBeVisible()
  await expect(image).toBeVisible()
  await page.reload()
  await expect(page.getByRole("heading", { name: /Correct.*Adjustable wrench/ })).toBeVisible()
  await expect(image).toBeVisible()
  await page.goto("/review/")
  await page.getByRole("link", { name: "Read explanation", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Which tool is shown in the illustration?", exact: true })).toBeVisible()
  await expect(page.locator(".question-illustration img")).toBeVisible()
})
