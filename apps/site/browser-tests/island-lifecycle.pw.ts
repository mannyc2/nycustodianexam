import { expect, test } from "@playwright/test"

// Synthetic pagehide exercises the cleanup contract without assuming a browser
// chose BFCache. Reload then proves a fresh document can initialize the island.
for (const fixture of [
  { path: "/practice/", owner: "[data-study-hub]", ready: "No saved activity yet" },
  { path: "/review/", owner: "[data-review-queue]", ready: "Your review queue is clear." },
  { path: "/offline/", owner: "[data-offline-pack-manager]", ready: "Nothing downloaded yet" }
]) {
  test(`${fixture.path} preserves persisted roots and cleans up before a fresh document mount`, async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.goto(fixture.path)
    const owner = page.locator(fixture.owner)
    const ready = page.getByRole("heading", { name: fixture.ready, exact: true })
    await expect(ready).toBeVisible()
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })))
    await expect(ready).toBeVisible()
    await page.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }))
      window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }))
      window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }))
      window.dispatchEvent(new Event("focus"))
    })
    await expect(owner).toBeEmpty()
    await page.reload()
    await expect(ready).toBeVisible()
    await expect(owner).toHaveCount(1)
    expect(errors).toEqual([])
  })
}
