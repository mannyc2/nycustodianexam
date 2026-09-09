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
    const reviewUrl = new URL(firstUrl)
    reviewUrl.searchParams.set("review", "1")
    await page.goto(reviewUrl.href)
    await expect(page.getByRole("heading", { name: "Saved response unavailable" })).toBeVisible()
    await expect(page.getByRole("navigation", { name: "Hazard scene navigation", exact: true })).toHaveCount(0)
    await expect(page.getByRole("button", { name: /Save marks|Save response/ })).toHaveCount(0)
    await page.goto(firstUrl)
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
    await expect(history.getByRole("link", { name: /Open saved feedback/ })).toHaveAttribute("href", reviewUrl.pathname + reviewUrl.search)
    await history.getByRole("link", { name: /Open saved feedback/ }).click()
    await expect(page.getByRole("heading", { name: "Review your saved response" })).toBeVisible()
    await expect(page.getByRole("button", { name: /Save marks|Save response/ })).toHaveCount(0)
    if (mode === "nonvisual") await expect(page.getByText(/Your written-zone choices are saved separately/)).toBeVisible()
    if (mode === "visual") {
      await page.goto("/review/")
      await page.getByRole("link", { name: "Read explanation", exact: true }).click()
      await expect(page.getByRole("heading", { name: /You found \d+ of \d+|no hazard to find|Response saved/ })).toBeVisible()
    }
  })
}

for (const mode of ["visual", "nonvisual"] as const) {
test(`a cached ${mode} drill and saved review reopen offline with reordered parameters`, async ({ page, context, browserName, offlineOrigin }) => {
  test.setTimeout(120_000)
  await page.goto(offlineOrigin.url + "/offline/")
  await page.getByRole("button", { name: /^Download (the .* copy|and check)$/ }).click()
  await expect(page.getByText(/Download complete and checked/)).toBeVisible({ timeout: 90_000 })
  await page.getByRole("button", { name: /Turn on this saved copy/ }).click()
  await expect(page.getByText(/now in use for new sessions/)).toBeVisible()
  await page.goto(offlineOrigin.url + "/hazards/")
  const builder = page.getByRole("region", { name: "Build a hazard drill" })
  if (mode === "nonvisual") await builder.getByRole("radio", { name: /^Read and select zones/ }).check()
  await builder.getByRole("button", { name: "Start drill", exact: true }).click()
  await expect(page.locator(".player-position")).toHaveText("Scene 1 of 1 · Original scene")
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  if (mode === "nonvisual") await expect(page.getByRole("checkbox").first()).toBeEnabled()
  else await expect(page.getByRole("button", { name: "Add marker at center", exact: true })).toBeEnabled()
  const url = new URL(page.url())
  const set = url.searchParams.get("set")!
  url.search = `?position=1&set=${set}`
  await offlineOrigin.disconnect()
  if (browserName !== "webkit") await context.setOffline(true)
  await page.goto(url.href)
  await expect(page.locator(".player-position")).toHaveText("Scene 1 of 1 · Original scene")
  if (mode === "nonvisual") await expect(page.getByRole("checkbox").first()).toBeEnabled()
  else await expect(page.getByRole("button", { name: "Add marker at center", exact: true })).toBeEnabled()
  if (mode === "nonvisual") {
    await page.getByRole("checkbox").first().check()
    await page.getByRole("button", { name: "Save response", exact: true }).click()
  } else {
    await page.getByRole("button", { name: "Save marks", exact: true }).click()
    await page.getByRole("button", { name: "Confirm and save no marks", exact: true }).click()
  }
  await expect(page.getByRole("heading", { name: /You found \d+ of \d+|no hazard to find|Response saved/ })).toBeVisible()
  url.search = `?review=1&position=1&set=${set}`
  await page.goto(url.href)
  await expect(page.getByRole("heading", { name: "Review your saved response" })).toBeVisible()
  await expect(page.getByRole("heading", { name: /You found \d+ of \d+|no hazard to find|Response saved/ })).toBeVisible()
  await expect(page.getByRole("navigation", { name: "Hazard scene navigation", exact: true })).toHaveCount(0)
  await expect(page.getByRole("button", { name: /Save marks|Save response/ })).toHaveCount(0)
  if (mode === "visual") await expect(page.locator(".hazard-player__image-layer img")).toBeVisible()
})
}
