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

for (const mode of ["visual", "nonvisual"] as const) {
  test(`Hazard ${mode} cleanup removes its navigation portal and document click handler`, async ({ page }) => {
    await page.addInitScript(() => {
      const listeners = new Set<EventListenerOrEventListenerObject>()
      let removed = 0
      const add = document.addEventListener.bind(document)
      const remove = document.removeEventListener.bind(document)
      document.addEventListener = (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => {
        if (type === "click" && listener) listeners.add(listener)
        if (listener) add(type, listener, options)
      }
      document.removeEventListener = (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions) => {
        if (type === "click" && listener && listeners.delete(listener)) removed++
        if (listener) remove(type, listener, options)
      }
      Object.assign(window, { hazardLifecycle: () => ({ active: listeners.size, removed }) })
    })
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.goto(`/hazards/session/${mode === "visual" ? "launch-v1" : "launch-v1-nonvisual"}/scene/1/`)
    const ready = mode === "visual" ? page.getByRole("button", { name: "Add marker at center", exact: true }) : page.getByRole("checkbox").first()
    await expect(ready).toBeEnabled()
    const navigation = page.getByRole("navigation", { name: "Hazard scene navigation", exact: true })
    await expect(navigation.getByRole("link", { name: "Next scene →", exact: true })).toBeVisible()
    const counts = () => page.evaluate(() => (window as unknown as { hazardLifecycle: () => { active: number; removed: number } }).hazardLifecycle())
    const before = await counts()
    expect(before.active).toBeGreaterThan(0)
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })))
    expect(await counts()).toEqual(before)
    await expect(ready).toBeEnabled()
    await page.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }))
      window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }))
    })
    await expect(page.locator("[data-hazard-player]")).toBeEmpty()
    await expect(navigation).toBeEmpty()
    expect(await counts()).toEqual({ active: before.active - 1, removed: before.removed + 1 })
    await page.reload()
    await expect(ready).toBeEnabled()
    await expect(navigation.getByRole("link", { name: "Next scene →", exact: true })).toBeVisible()
    expect(await counts()).toEqual(before)
    expect(errors).toEqual([])
  })
}

for (const fixture of [
  { path: "/simulations/", owner: "[data-simulation-setup]", control: "Set code (seed)", value: "lifecycle-seed", disclosure: "Repeat this exact set" },
  { path: "/report/", owner: "[data-correction-form]", control: "Short summary", value: "Lifecycle draft", disclosure: "" },
  { path: "/print/", owner: "[data-print-builder]", control: "Set code", value: "lifecycle-print", disclosure: "Repeat this exact set" },
  { path: "/hazards/", owner: "[data-hazard-builder]", control: "Drill code", value: "lifecycle-drill", disclosure: "Repeat a drill" }
]) {
  test(`${fixture.path} retains local edits during persisted pagehide and remounts after cleanup`, async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.goto(fixture.path)
    if (fixture.disclosure) await page.getByText(fixture.disclosure, { exact: true }).click()
    const control = page.locator(fixture.owner).getByLabel(fixture.control, { exact: fixture.path !== "/print/" })
    await expect(control).toBeEnabled()
    await control.fill(fixture.value)
    await page.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true }))
      window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }))
    })
    await expect(control).toHaveValue(fixture.value)
    await control.fill(`${fixture.value}-edited`)
    await expect(control).toHaveValue(`${fixture.value}-edited`)
    await page.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }))
      window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }))
    })
    await expect(page.locator(fixture.owner)).toBeEmpty()
    await page.reload()
    await expect(control).toBeEnabled()
    if (fixture.disclosure) await page.getByText(fixture.disclosure, { exact: true }).click()
    await control.fill("Fresh document")
    await expect(control).toHaveValue("Fresh document")
    expect(errors).toEqual([])
  })
}

test("question input and saved Review survive their appropriate page lifecycle", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/practice/session/launch-v1/question/1/")
  const choice = page.getByRole("radio").first()
  await expect(choice).toBeEnabled()
  await choice.check()
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })))
  await expect(choice).toBeChecked()
  await page.getByRole("button", { name: "Flag for review", exact: true }).click()
  await page.getByRole("button", { name: "Save answer", exact: true }).click()
  await expect(page.locator(".feedback-rationales")).toBeVisible()
  const disposeAndReload = async () => {
    await page.evaluate(() => {
      window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }))
      window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }))
    })
    await expect(page.locator("[data-question-player]")).toBeEmpty()
    await page.reload()
    await expect(page.locator(".feedback-rationales")).toBeVisible()
    await expect(page.getByRole("button", { name: "Save answer", exact: true })).toHaveCount(0)
  }
  await disposeAndReload()
  await page.goto("/review/")
  await page.getByRole("link", { name: "Read explanation", exact: true }).first().click()
  await expect(page.locator(".feedback-rationales")).toBeVisible()
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })))
  await expect(page.locator(".feedback-rationales")).toBeVisible()
  await disposeAndReload()
  expect(errors).toEqual([])
})

test("saved Print preview restores the same packet after root cleanup", async ({ page }) => {
  await page.addInitScript(() => {
    const registered = new Map<string, Set<EventListenerOrEventListenerObject>>()
    const record = (type: string, listener: EventListenerOrEventListenerObject, adding: boolean) => {
      const set = registered.get(type) ?? new Set<EventListenerOrEventListenerObject>()
      if (adding) set.add(listener)
      else set.delete(listener)
      registered.set(type, set)
    }
    const add = window.addEventListener.bind(window)
    const remove = window.removeEventListener.bind(window)
    window.addEventListener = (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions) => {
      if (listener && (type === "beforeprint" || type === "afterprint")) record(type, listener, true)
      if (listener) add(type, listener, options)
    }
    window.removeEventListener = (type: string, listener: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions) => {
      if (listener) record(type, listener, false)
      if (listener) remove(type, listener, options)
    }
    const match = window.matchMedia.bind(window)
    window.matchMedia = (query) => {
      const media = match(query)
      if (query !== "print") return media
      const addMedia = media.addEventListener.bind(media)
      const removeMedia = media.removeEventListener.bind(media)
      media.addEventListener = (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) => {
        if (type === "change") record("print-media", listener, true)
        addMedia(type, listener, options)
      }
      media.removeEventListener = (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) => {
        if (type === "change") record("print-media", listener, false)
        removeMedia(type, listener, options)
      }
      return media
    }
    Object.assign(window, { printListenerCounts: () => ["beforeprint", "afterprint", "print-media"].map(type => registered.get(type)?.size ?? 0) })
  })
  const listenerCounts = () => page.evaluate(() => (window as unknown as { printListenerCounts: () => number[] }).printListenerCounts())
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/print/")
  await page.getByRole("radio", { name: "Blank answer sheet", exact: true }).check()
  await page.getByRole("button", { name: "Generate preview", exact: true }).click()
  await expect(page).toHaveURL(/\/print\/preview\/print-[a-f0-9-]+\/$/)
  const title = page.getByRole("heading", { level: 1, name: "Blank answer sheet", exact: true })
  await expect(title).toBeVisible()
  await expect.poll(listenerCounts).toEqual([1, 1, 1])
  const fingerprintNode = page.locator("[data-print-fingerprint]")
  const fingerprint = await fingerprintNode.getAttribute("data-print-fingerprint")
  expect(fingerprint).toBeTruthy()
  const path = page.url()
  await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })))
  await expect(title).toBeVisible()
  await expect(fingerprintNode).toHaveAttribute("data-print-fingerprint", fingerprint!)
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }))
    window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: false }))
    window.dispatchEvent(new Event("beforeprint"))
    window.dispatchEvent(new Event("afterprint"))
  })
  await expect(page.locator("[data-print-preview]")).toBeEmpty()
  expect(await listenerCounts()).toEqual([0, 0, 0])
  await page.reload()
  await expect(page).toHaveURL(path)
  await expect(title).toBeVisible()
  await expect.poll(listenerCounts).toEqual([1, 1, 1])
  await expect(fingerprintNode).toHaveAttribute("data-print-fingerprint", fingerprint!)
  expect(errors).toEqual([])
})
