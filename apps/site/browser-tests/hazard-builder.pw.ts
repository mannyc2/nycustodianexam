import { expect } from "@playwright/test"
import { test } from "./offline-origin-fixtures.ts"

for (const mode of ["visual", "nonvisual"] as const) {
  test(`custom ${mode} drill preserves order, saved feedback and history`, async ({ page }) => {
    await page.goto("/hazards/")
    const builder = page.getByRole("region", { name: "Build a hazard drill" })
    await builder.getByRole("radio", { name: "5 scenes", exact: true }).check()
    if (mode === "nonvisual") await builder.getByRole("radio", { name: /^Read and select zones/ }).check()
    await builder.getByText("Repeat a drill", { exact: true }).click()
    await builder.getByLabel("Drill code").fill("browser-hazard")
    await builder.getByRole("button", { name: "Start drill", exact: true }).click()
    await expect(page.locator(".player-position")).toHaveText("Scene 1 of 5 · Original scene")
    const firstUrl = page.url()
    if (mode === "nonvisual") {
      await page.getByRole("checkbox").first().check()
      await page.getByRole("button", { name: "Save response", exact: true }).click()
    } else {
      await expect(page.locator(".hazard-player__image-layer img")).toBeVisible()
      await page.getByRole("button", { name: "Save marks", exact: true }).click()
      await page.getByRole("button", { name: "Confirm and save no marks", exact: true }).click()
    }
    await expect(page.getByRole("heading", { name: /You found \d+ of \d+|no hazard to find|Response saved/ })).toBeVisible()
    await page.getByRole("link", { name: "Next scene →", exact: true }).click()
    await expect(page.locator(".player-position")).toHaveText("Scene 2 of 5 · Original scene")
    await page.getByRole("link", { name: "← Previous scene", exact: true }).click()
    await expect(page.getByRole("heading", { name: /You found \d+ of \d+|no hazard to find|Response saved/ })).toBeVisible()
    await page.goto("/practice/")
    const history = page.getByRole("region", { name: "Recent activity" })
    await expect(history.getByRole("link", { name: /Open saved feedback/ })).toHaveAttribute("href", new URL(firstUrl).pathname + new URL(firstUrl).search)
    if (mode === "visual") {
      await page.goto("/review/")
      await page.getByRole("link", { name: "Read explanation", exact: true }).click()
      await expect(page.getByRole("heading", { name: /You found \d+ of \d+|no hazard to find|Response saved/ })).toBeVisible()
    }
  })
}

test("a cached keyboard drill document reopens offline with reordered parameters", async ({ page, context, browserName, offlineOrigin }) => {
  test.setTimeout(120_000)
  await page.goto(offlineOrigin.url + "/offline/")
  await page.getByRole("button", { name: /^Download (the .* copy|and check)$/ }).click()
  await expect(page.getByText(/Download complete and checked/)).toBeVisible({ timeout: 90_000 })
  await page.getByRole("button", { name: /Turn on this saved copy/ }).click()
  await expect(page.getByText(/now in use for new sessions/)).toBeVisible()
  await page.goto(offlineOrigin.url + "/hazards/")
  const builder = page.getByRole("region", { name: "Build a hazard drill" })
  await builder.getByRole("radio", { name: /^Read and select zones/ }).check()
  await builder.getByRole("button", { name: "Start drill", exact: true }).click()
  await expect(page.locator(".player-position")).toHaveText("Scene 1 of 1 · Original scene")
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await expect(page.getByRole("checkbox").first()).toBeEnabled()
  const url = new URL(page.url())
  const set = url.searchParams.get("set")!
  url.search = `?position=1&set=${set}`
  if (browserName === "webkit") await offlineOrigin.disconnect()
  else await context.setOffline(true)
  await page.goto(url.href)
  await expect(page.locator(".player-position")).toHaveText("Scene 1 of 1 · Original scene")
  await expect(page.getByRole("checkbox").first()).toBeEnabled()
  await page.getByRole("checkbox").first().check()
  await page.getByRole("button", { name: "Save response", exact: true }).click()
  await expect(page.getByRole("heading", { name: /^Response saved/ })).toBeVisible()
})
