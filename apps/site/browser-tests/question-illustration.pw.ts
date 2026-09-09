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
