import { expect, test } from "@playwright/test"
import {
  attemptId,
  gotoReadyQuestion,
  installAnnouncementRecorder,
  questionReceipt,
  questionPath,
  questionPostcommitPath,
  readStoredAttempt,
  recordedAnnouncements
} from "./question-player-fixtures.ts"

test("commit is durable before feedback fetch and survives reload", async ({ context, page }) => {
  await gotoReadyQuestion(page)

  let attemptObservedAtFetch: Awaited<ReturnType<typeof readStoredAttempt>>
  let postcommitRequests = 0
  await context.route(`**${questionPostcommitPath}`, async (route) => {
    postcommitRequests += 1
    attemptObservedAtFetch = await readStoredAttempt(page)
    await route.continue()
  })

  await page.getByRole("radio", { name: "Scrub brush" }).check()
  await page.getByRole("button", { name: "Submit answer" }).click()

  await expect(page.getByRole("heading", { name: /^Correct — / })).toBeFocused()
  expect(attemptObservedAtFetch).toMatchObject({
    id: attemptId,
    questionId: "q001",
    selectedOptionId: "b",
    receipt: questionReceipt,
    optionIds: [
      "a",
      "b",
      "c",
      "d"
    ]
  })

  const committed = await readStoredAttempt(page)
  expect(committed).toMatchObject({
    reviewIntent: "unflagged",
    selectedOptionId: "b"
  })
  expect(committed?.committedAt).toEqual(expect.any(Number))

  await page.reload()
  await expect(page).toHaveURL(questionPath)
  await expect(page.getByRole("heading", { name: /^Correct — / })).toBeFocused()
  expect(await readStoredAttempt(page)).toEqual(committed)
  expect(postcommitRequests).toBeGreaterThanOrEqual(1)
})

test("schema-valid bytes with the wrong digest stay unrevealed until a clean retry", async ({
  context,
  page
}) => {
  await gotoReadyQuestion(page)

  let attemptObservedAtFetch: Awaited<ReturnType<typeof readStoredAttempt>>
  let postcommitRequests = 0
  await context.route(`**${questionPostcommitPath}`, async (route) => {
    postcommitRequests += 1
    if (postcommitRequests > 1) {
      await route.continue()
      return
    }

    attemptObservedAtFetch = await readStoredAttempt(page)
    const response = await route.fetch()
    const originalBody = await response.text()
    const corruptBody = originalBody.replace(
      "Scrubs or washes",
      "Scrubs or rinses"
    )
    if (
      corruptBody === originalBody ||
      new TextEncoder().encode(corruptBody).byteLength !==
        new TextEncoder().encode(originalBody).byteLength
    ) {
      throw new Error("Digest-corruption fixture must change content without changing byte length")
    }
    await route.fulfill({
      body: corruptBody,
      headers: { ...response.headers(), "content-type": "application/json" },
      status: response.status()
    })
  })

  await page.getByRole("radio", { name: "Scrub brush" }).check()
  await page.getByRole("button", { name: "Submit answer" }).click()

  await expect(page.getByRole("heading", { name: "Your answer is saved" })).toBeFocused()
  await expect(page.getByRole("heading", { name: /^Correct — / })).toHaveCount(0)
  await expect(page.getByText(/Scrubs or rinses/)).toHaveCount(0)
  expect(attemptObservedAtFetch).toMatchObject({
    id: attemptId,
    selectedOptionId: "b",
    receipt: questionReceipt
  })

  await page.getByRole("button", { name: "Retry explanation" }).click()
  await expect(page.getByRole("heading", { name: /^Correct — / })).toBeFocused()
  expect(postcommitRequests).toBe(2)
  expect(await readStoredAttempt(page)).toEqual(attemptObservedAtFetch)
})

test("session start pushes history while Next replaces the current position", async ({ page }) => {
  await page.goto("/practice/")
  await page
    .getByLabel("Available whole-bank practice lengths")
    .getByRole("link", { name: "Start 90" })
    .click()
  await expect(page).toHaveURL("/practice/session/ps-84ce3cbb3913907fac6db8b7/question/1/")
  await expect(page.getByRole("radio").first()).toBeEnabled()

  await page.getByRole("link", { name: "Next question" }).click()
  await expect(page).toHaveURL("/practice/session/ps-84ce3cbb3913907fac6db8b7/question/2/")

  await page.goBack({ waitUntil: "commit" })
  await expect(page).toHaveURL("/practice/")
  await expect(page.getByRole("heading", { name: "Choose a practice set." }))
    .toBeVisible()
})

test("an injected IndexedDB write failure never reveals or requests feedback", async ({ page }) => {
  await gotoReadyQuestion(page)

  let postcommitRequests = 0
  page.on("request", (request) => {
    if (request.url().endsWith(questionPostcommitPath)) {
      postcommitRequests += 1
    }
  })

  await page.evaluate(() => {
    const originalTransaction = IDBDatabase.prototype.transaction
    IDBDatabase.prototype.transaction = function(storeNames, mode, options) {
      if (mode === "readwrite") {
        throw new DOMException("Injected browser-test transaction failure", "AbortError")
      }
      return Reflect.apply(originalTransaction, this, [storeNames, mode, options]) as IDBTransaction
    }
  })

  await page.getByRole("radio", { name: "Scrub brush" }).check()
  await page.getByRole("button", { name: "Submit answer" }).click()

  const errorHeading = page.getByRole("heading", { name: "Your answer was not saved" })
  await expect(errorHeading).toBeFocused()
  await expect(page.getByRole("heading", { name: /^Correct — / })).toHaveCount(0)
  await expect(page.getByText("Correct answer", { exact: true })).toHaveCount(0)
  expect(postcommitRequests).toBe(0)
  expect(await readStoredAttempt(page)).toBeUndefined()
})

test("keyboard selection drives focus and polite status announcements", async ({ page }) => {
  await gotoReadyQuestion(page)
  await installAnnouncementRecorder(page)

  const firstOption = page.getByRole("radio", { name: "Staple gun" })
  await firstOption.focus()
  await page.keyboard.press("ArrowDown")
  await expect(page.getByRole("radio", { name: "Scrub brush" })).toBeChecked()

  await page.keyboard.press("Tab")
  await expect(page.getByRole("button", { name: "Submit answer" })).toBeFocused()
  await page.keyboard.press("Enter")

  await expect(page.getByRole("heading", { name: /^Correct — / })).toBeFocused()
  await expect
    .poll(() => recordedAnnouncements(page))
    .toEqual(
      expect.arrayContaining([
        "Saving your answer before revealing feedback.",
        "Answer saved and feedback revealed."
      ])
    )

  const liveRegion = page.locator('[data-question-player] [aria-live="polite"]')
  await expect(liveRegion).toHaveAttribute("aria-atomic", "true")
  await expect(page.getByRole("group", { name: "Answer choices" })).toHaveAttribute(
    "aria-describedby",
    await liveRegion.getAttribute("id") ?? ""
  )
})

test("revealed safety evidence keeps its scope caveat and exact source excerpt adjacent", async ({
  page
}) => {
  await page.goto("/practice/session/launch-v1/question/90/")
  await expect(page.getByRole("radio", {
    name: "Remove the unsafe wrench from use and obtain a serviceable tool."
  })).toBeEnabled()
  await page.getByRole("radio", {
    name: "Remove the unsafe wrench from use and obtain a serviceable tool."
  }).check()
  await page.getByRole("button", { name: "Submit answer" }).click()

  await expect(page.getByRole("heading", { name: /^Correct — / })).toBeFocused()
  const caveat = page.locator(".claim-caveat").first()
  await expect(caveat).toContainText("Scope note:")
  await expect(caveat).toContainText(
    "29 CFR 1926.301(b) is a construction-industry provision cited as specific safety evidence"
  )

  await page.getByText("Where this comes from", { exact: true }).click()
  await expect(page.locator(".source-receipt-excerpt")).toContainText(
    "Wrenches, including adjustable, pipe, end, and socket wrenches shall not be used when jaws are sprung to the point that slippage occurs."
  )
  await expect(page.getByText("Occupational Safety and Health Administration", {
    exact: true
  })).toBeVisible()
  await expect(page.getByText("29 CFR 1926.301(b)", { exact: true }).last()).toBeVisible()
  await expect(page.getByText("2026-08-25", { exact: true })).toBeVisible()
})

test("Chromium back-forward cache restores the live island without restarting it", async ({
  browserName,
  page
}) => {
  test.skip(browserName !== "chromium", "This regression exercises Chromium's BFCache path")

  await gotoReadyQuestion(page)
  await page.getByRole("radio", { name: "Staple gun" }).check()
  await page.evaluate((expectedPostcommitPath) => {
    const lifecycle = {
      pagehide: [] as boolean[],
      pageshow: [] as boolean[],
      postcommitRequests: 0,
      restoreTransactions: 0
    }
    const originalTransaction = IDBDatabase.prototype.transaction
    IDBDatabase.prototype.transaction = function(storeNames, mode, options) {
      if (mode === "readonly") lifecycle.restoreTransactions += 1
      return Reflect.apply(originalTransaction, this, [storeNames, mode, options]) as IDBTransaction
    }
    const originalFetch = window.fetch
    const instrumentedFetch = (...input: Parameters<typeof window.fetch>) => {
      const request = input[0]
      const rawUrl = typeof request === "string"
        ? request
        : request instanceof URL
        ? request.href
        : request.url
      if (new URL(rawUrl, window.location.href).pathname === expectedPostcommitPath) {
        lifecycle.postcommitRequests += 1
      }
      return Reflect.apply(originalFetch, window, input) as ReturnType<typeof window.fetch>
    }
    Object.defineProperty(window, "fetch", { configurable: true, value: instrumentedFetch })
    window.addEventListener("pagehide", (event) => lifecycle.pagehide.push(event.persisted))
    window.addEventListener("pageshow", (event) => lifecycle.pageshow.push(event.persisted))
    ;(window as typeof window & { __nycustodianBfcacheLifecycle?: typeof lifecycle })
      .__nycustodianBfcacheLifecycle = lifecycle
  }, questionPostcommitPath)

  await page.goto("/atlas/")
  await expect(page.getByRole("heading", { name: "Recognize a tool by use and construction." }))
    .toBeVisible()
  await page.goBack({ waitUntil: "commit" })

  await expect(page).toHaveURL(questionPath)
  await expect(page.getByRole("radio", { name: "Staple gun" })).toBeChecked()
  const lifecycle = await page.evaluate(() =>
    (window as typeof window & {
      __nycustodianBfcacheLifecycle?: {
        readonly pagehide: readonly boolean[]
        readonly pageshow: readonly boolean[]
        readonly postcommitRequests: number
        readonly restoreTransactions: number
      }
    }).__nycustodianBfcacheLifecycle
  )
  expect(lifecycle).toEqual({
    pagehide: [true],
    pageshow: [true],
    postcommitRequests: 0,
    restoreTransactions: 0
  })

  await page.getByRole("radio", { name: "Scrub brush" }).check()
  await page.getByRole("button", { name: "Submit answer" }).click()
  await expect(page.getByRole("heading", { name: /^Correct — / })).toBeFocused()
  await expect.poll(() => page.evaluate(() =>
    (window as typeof window & {
      __nycustodianBfcacheLifecycle?: { readonly postcommitRequests: number }
    }).__nycustodianBfcacheLifecycle?.postcommitRequests
  )).toBe(1)
})
