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

test("Settings removes its paired refresh listeners when its root is disposed", async ({ page }) => {
  await page.addInitScript(() => {
    const tracked = new Map<string, Set<EventListenerOrEventListenerObject>>()
    const removed: string[] = []
    const pairedListeners = new Set<EventListenerOrEventListenerObject>()
    const add = window.addEventListener.bind(window)
    const remove = window.removeEventListener.bind(window)
    window.addEventListener = (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => {
      if (listener && (type === "focus" || type === "pageshow")) {
        const listeners = tracked.get(type) ?? new Set<EventListenerOrEventListenerObject>()
        listeners.add(listener)
        tracked.set(type, listeners)
        if (tracked.get("focus")?.has(listener) && tracked.get("pageshow")?.has(listener)) pairedListeners.add(listener)
      }
      if (listener) add(type, listener, options)
    }
    window.removeEventListener = (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions) => {
      if (listener && tracked.get(type)?.delete(listener) && pairedListeners.has(listener)) removed.push(type)
      if (listener) remove(type, listener, options)
    }
    Object.assign(window, { lifecycleListeners: {
      paired: () => [...(tracked.get("focus") ?? [])].filter((listener) => tracked.get("pageshow")?.has(listener)).length,
      removed
    } })
  })
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/settings/")
  await expect(page.getByRole("checkbox", { name: "Larger text", exact: true })).toBeEnabled()
  const paired = () => page.evaluate(() => (window as unknown as {
    lifecycleListeners: { paired: () => number }
  }).lifecycleListeners.paired())
  await expect.poll(paired).toBe(1)
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })))
  expect(await paired()).toBe(1)
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }))
    window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }))
    window.dispatchEvent(new Event("focus"))
    window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }))
  })
  await expect(page.locator("[data-settings]")).toBeEmpty()
  expect(await paired()).toBe(0)
  expect(await page.evaluate(() => (window as unknown as {
    lifecycleListeners: { removed: string[] }
  }).lifecycleListeners.removed)).toEqual(["focus", "pageshow"])
  await page.reload()
  await expect(page.getByRole("checkbox", { name: "Larger text", exact: true })).toBeEnabled()
  expect(await paired()).toBe(1)
  expect(errors).toEqual([])
})
