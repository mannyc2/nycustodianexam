import { expect, test, type Page } from "@playwright/test"
import { appDatabaseName } from "../src/study-storage/app-database.ts"

const visualPath = "/hazards/session/launch-v1/scene/1/"
const nonvisualPath = "/hazards/session/launch-v1-nonvisual/scene/1/"
const postcommitPath = "/content/vertical-slice/scenes/s001.postcommit.json"
const attemptsStore = "hazard-attempts"
const visualAttemptId = "launch-v1:v2:launch-v1:hazard-visual:1"
const nonvisualAttemptId = "launch-v1:v2:launch-v1-nonvisual:hazard-nonvisual:1"
const postcommitBytes = 3_731
const postcommitSha256 = "8c86b391298a92ca1e35a590a0b4831c2fe50947d7d21e9ed9f366508cc8b196"
const assetMasterSha256 = "5648c401bd764f44b1f23e1dbaa5aac3e79c4292990e68c98f1d47947037ff0d"
const visualImagePath = "/content/assets/derivatives/scenes/s001-web.png"

interface StoredHazardReceipt {
  readonly releaseId: string
  readonly packVersion: number
  readonly sessionId: string
  readonly position: number
  readonly postcommitPath: string
  readonly postcommitBytes: number
  readonly postcommitSha256: string
  readonly sceneId: string
  readonly mode: "visual" | "nonvisual"
  readonly assetRevision: number
  readonly assetMasterSha256: string
}

const hazardReceipt = (mode: "visual" | "nonvisual"): StoredHazardReceipt => ({
  releaseId: "launch-v1",
  packVersion: 2,
  sessionId: mode === "visual" ? "launch-v1" : "launch-v1-nonvisual",
  position: 1,
  postcommitPath,
  postcommitBytes,
  postcommitSha256,
  sceneId: "s001",
  mode,
  assetRevision: 1,
  assetMasterSha256
})

interface StoredHazardMarker {
  readonly id: string
  readonly x: number
  readonly y: number
}

interface StoredHazardAttempt {
  readonly id: string
  readonly sceneId: string
  readonly mode: "visual" | "nonvisual"
  readonly markers: ReadonlyArray<StoredHazardMarker>
  readonly selectedZoneOrders: ReadonlyArray<number>
  readonly zeroHazardsConfirmed: boolean
  readonly committedAt: number
  readonly receipt: StoredHazardReceipt
  readonly allowedZoneOrders: ReadonlyArray<number>
  readonly evaluation?: {
    readonly payload: { readonly opaqueAssetId: string }
    readonly postcommitBase64: string
    readonly retainedVisualAsset: {
      readonly receipt: {
        readonly path: string
        readonly bytes: number
        readonly sha256: string
      }
      readonly dataUrl: string
    } | null
  }
}

const gotoReadyVisualHazard = async (page: Page): Promise<void> => {
  await page.goto(visualPath)
  await expect(page.getByRole("button", { name: "Add marker at center" })).toBeEnabled()
  await expect(page.getByRole("button", { name: "Submit scene response" })).toBeVisible()
}

const gotoReadyNonvisualHazard = async (page: Page): Promise<void> => {
  await page.goto(nonvisualPath)
  await expect(page.getByRole("checkbox").first()).toBeEnabled()
  await expect(page.getByRole("button", { name: "Submit scene response" })).toBeVisible()
}

const readHazardAttempt = (
  page: Page,
  expectedAttemptId: string
): Promise<StoredHazardAttempt | undefined> =>
  page.evaluate(
    ({ attemptId, database, store }) =>
      new Promise<StoredHazardAttempt | undefined>((resolve, reject) => {
        const open = indexedDB.open(database)
        open.onerror = () => reject(open.error)
        open.onsuccess = () => {
          const connection = open.result
          const transaction = connection.transaction(store, "readonly")
          const request = transaction.objectStore(store).get(attemptId)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve(request.result as StoredHazardAttempt | undefined)
          transaction.oncomplete = () => connection.close()
          transaction.onabort = () => {
            connection.close()
            reject(transaction.error ?? new Error("Hazard attempt read was aborted"))
          }
        }
      }),
    { attemptId: expectedAttemptId, database: appDatabaseName, store: attemptsStore }
  )

for (const failure of ["missing", "corrupt"] as const) {
  test(`a ${failure} released scene image blocks visual marker and submit controls`, async ({
    context,
    page
  }) => {
    await context.route(`**${visualImagePath}`, async (route) => {
      if (failure === "missing") {
        await route.fulfill({ body: "missing", status: 404 })
        return
      }
      await route.fulfill({
        body: "not the hash-bound PNG bytes",
        contentType: "image/png",
        status: 200
      })
    })

    await page.goto(visualPath)
    await expect(page.getByRole("heading", { name: "Released scene image unavailable" }))
      .toBeVisible()
    expect(
      await page.getByRole("button", { name: "Add marker at center" }).evaluateAll(
        (buttons) => buttons.filter((button) => !(button as HTMLButtonElement).disabled).length
      )
    ).toBe(0)
    expect(
      await page.getByRole("button", { name: "Submit scene response" }).evaluateAll(
        (buttons) => buttons.filter((button) => !(button as HTMLButtonElement).disabled).length
      )
    ).toBe(0)
    expect(await readHazardAttempt(page, visualAttemptId)).toBeUndefined()
  })
}

test("phone and keyboard users can pan a zoomed scene and reset the whole-image view", async ({
  page
}) => {
  await page.setViewportSize({ height: 720, width: 320 })
  await gotoReadyVisualHazard(page)

  const viewport = page.locator(".hazard-player__viewport")
  const panRight = page.getByRole("button", { name: "Pan right" })
  const panDown = page.getByRole("button", { name: "Pan down" })
  await expect(panRight).toBeDisabled()
  await expect(panDown).toBeDisabled()

  await page.getByRole("button", { name: "Zoom in" }).focus()
  await page.keyboard.press("Enter")
  await expect(page.getByText("125% view", { exact: true })).toBeVisible()
  await expect(panRight).toBeEnabled()
  await expect(panDown).toBeEnabled()

  await panRight.focus()
  await page.keyboard.press("Enter")
  await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
  await panDown.focus()
  await page.keyboard.press("Space")
  await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
  await expect(page.getByText("No markers placed.", { exact: true })).toBeVisible()

  await page.getByRole("button", { name: "Reset view" }).focus()
  await page.keyboard.press("Enter")
  await expect(page.getByText("100% view", { exact: true })).toBeVisible()
  await expect.poll(() => viewport.evaluate((element) => ({
    fitsHorizontally: element.scrollWidth <= element.clientWidth + 1,
    fitsVertically: element.scrollHeight <= element.clientHeight + 1,
    left: element.scrollLeft,
    top: element.scrollTop
  }))).toEqual({ fitsHorizontally: true, fitsVertically: true, left: 0, top: 0 })
})

test("visual markers are durable before feedback fetch and restore exactly", async ({
  context,
  page
}) => {
  await gotoReadyVisualHazard(page)

  let attemptObservedAtFetch: StoredHazardAttempt | undefined
  let postcommitRequests = 0
  await context.route(`**${postcommitPath}`, async (route) => {
    postcommitRequests += 1
    attemptObservedAtFetch = await readHazardAttempt(page, visualAttemptId)
    await route.continue()
  })

  await page.getByRole("button", { name: "Add marker at center" }).click()
  expect(postcommitRequests).toBe(0)
  await page.getByRole("button", { name: "Submit scene response" }).click()

  await expect(page.getByRole("heading", {
    name: "You found 0 of 1 hazard in this scene. 1 extra or repeated mark was counted."
  })).toBeFocused()
  expect(attemptObservedAtFetch).toMatchObject({
    id: visualAttemptId,
    sceneId: "s001",
    mode: "visual",
    markers: [{ id: "marker-1", x: 0.5, y: 0.5 }],
    selectedZoneOrders: [],
    zeroHazardsConfirmed: false,
    receipt: hazardReceipt("visual"),
    allowedZoneOrders: [1, 2, 3, 4]
  })
  expect(attemptObservedAtFetch?.evaluation).toBeUndefined()
  const committed = await readHazardAttempt(page, visualAttemptId)
  expect(committed?.committedAt).toEqual(expect.any(Number))
  expect(committed?.evaluation).toMatchObject({
    payload: { opaqueAssetId: "s001" },
    retainedVisualAsset: {
      receipt: { path: visualImagePath }
    }
  })
  expect(committed?.evaluation?.retainedVisualAsset?.dataUrl).toMatch(
    /^data:image\/png;base64,/
  )
  await expect(page.getByText("Reviewed scene overlay.", { exact: false })).toBeVisible()
  await expect(page.locator(".hazard-result-overlay img")).toHaveAttribute(
    "src",
    /^data:image\/png;base64,/
  )
  await expect(page.locator("[data-marker-kind]")).toHaveCount(1)
  await expect(page.locator("[data-marker-kind]")).toHaveAttribute(
    "data-marker-kind",
    "false_positive"
  )
  await expect(page.getByText(
    "This mark does not match a recorded condition. It counts as an extra mark, but the site cannot say what that object means.",
    { exact: true }
  )).toBeVisible()
  expect(await page.locator(".hazard-player__results").evaluate((results) => {
    const sources = results.querySelector(".feedback-sources")
    const equivalentHeading = results.querySelector("#complete-zoned-equivalent-heading")
    if (sources === null || equivalentHeading === null) return false
    return (sources.compareDocumentPosition(equivalentHeading) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
  })).toBe(true)
  await expect(page.locator("[data-marker-kind]")).toHaveAttribute("data-marker-x", "0.5")
  await expect(page.locator("[data-marker-kind]")).toHaveAttribute("data-marker-y", "0.5")
  expect(postcommitRequests).toBe(1)

  await page.evaluate(async () => {
    await Promise.all((await caches.keys()).map((cacheName) => caches.delete(cacheName)))
    await Promise.all(
      (await navigator.serviceWorker.getRegistrations()).map((registration) =>
        registration.unregister()
      )
    )
  })
  let removedVisualRequests = 0
  let removedPostcommitRequests = 0
  await context.route(`**${visualImagePath}`, async (route) => {
    removedVisualRequests += 1
    await route.fulfill({ body: "removed", status: 404 })
  })
  await context.route(`**${postcommitPath}`, async (route) => {
    removedPostcommitRequests += 1
    await route.fulfill({ body: "removed", status: 404 })
  })
  await page.reload()
  await expect(page).toHaveURL(visualPath)
  await expect(page.getByRole("heading", {
    name: "You found 0 of 1 hazard in this scene. 1 extra or repeated mark was counted."
  })).toBeFocused()
  await expect(page.getByRole("heading", { name: "Released scene image unavailable" }))
    .toHaveCount(0)
  expect(await readHazardAttempt(page, visualAttemptId)).toEqual(committed)
  await expect(page.locator(".hazard-result-overlay img")).toHaveAttribute(
    "src",
    committed?.evaluation?.retainedVisualAsset?.dataUrl ?? ""
  )
  expect(removedVisualRequests).toBe(0)
  expect(removedPostcommitRequests).toBe(0)
})

test("the verified visual Blob URL survives BFCache and is revoked on true unload", async ({
  browserName,
  page
}) => {
  test.skip(browserName !== "chromium", "This regression exercises Chromium's BFCache path")

  const revokedUrlStorageKey = "nycustodian-browser-test-revoked-visual-asset-urls"
  await page.goto("/content/release/current.json")
  await page.evaluate((storageKey) => localStorage.removeItem(storageKey), revokedUrlStorageKey)
  await page.addInitScript(({ storageKey }) => {
    const originalCreateObjectURL = URL.createObjectURL.bind(URL)
    const originalRevokeObjectURL = URL.revokeObjectURL.bind(URL)
    const blobUrlLifecycle = {
      created: [] as string[],
      revoked: [] as string[]
    }

    URL.createObjectURL = (object: Blob | MediaSource): string => {
      const url = originalCreateObjectURL(object)
      blobUrlLifecycle.created.push(url)
      return url
    }
    URL.revokeObjectURL = (url: string): void => {
      blobUrlLifecycle.revoked.push(url)
      try {
        let revokedAcrossDocuments: string[] = []
        const stored = localStorage.getItem(storageKey)
        if (stored !== null) revokedAcrossDocuments = JSON.parse(stored) as string[]
        revokedAcrossDocuments.push(url)
        localStorage.setItem(storageKey, JSON.stringify(revokedAcrossDocuments))
      } catch {
        // A malformed test-only diagnostic must not prevent the real revocation.
      } finally {
        originalRevokeObjectURL(url)
      }
    }

    ;(window as typeof window & {
      __nycustodianVisualBlobUrls?: typeof blobUrlLifecycle
    }).__nycustodianVisualBlobUrls = blobUrlLifecycle
  }, { storageKey: revokedUrlStorageKey })

  await gotoReadyVisualHazard(page)
  const sceneImage = page.locator("[data-hazard-player] img")
  const firstVisualAssetUrl = await sceneImage.getAttribute("src")
  expect(firstVisualAssetUrl).toMatch(/^blob:/)
  expect(await page.evaluate(() =>
    (window as typeof window & {
      __nycustodianVisualBlobUrls?: {
        readonly created: readonly string[]
        readonly revoked: readonly string[]
      }
    }).__nycustodianVisualBlobUrls
  )).toEqual({ created: [firstVisualAssetUrl], revoked: [] })

  await page.getByRole("button", { name: "Add marker at center" }).click()
  await expect(page.getByText("1 marker placed.", { exact: true })).toBeVisible()
  await page.evaluate(() => {
    const lifecycle = {
      pagehide: [] as boolean[],
      pageshow: [] as boolean[]
    }
    window.addEventListener("pagehide", (event) => lifecycle.pagehide.push(event.persisted))
    window.addEventListener("pageshow", (event) => lifecycle.pageshow.push(event.persisted))
    ;(window as typeof window & {
      __nycustodianVisualBfcacheLifecycle?: typeof lifecycle
    }).__nycustodianVisualBfcacheLifecycle = lifecycle
  })

  await page.goto("/atlas/")
  await expect(page.getByRole("heading", { name: "Recognize a tool by use and construction." }))
    .toBeVisible()
  await page.goBack({ waitUntil: "commit" })

  await expect(page).toHaveURL(visualPath)
  await expect(sceneImage).toHaveAttribute("src", firstVisualAssetUrl ?? "")
  await expect(page.getByText("1 marker placed.", { exact: true })).toBeVisible()
  expect(await page.evaluate(() => ({
    blobUrls: (window as typeof window & {
      __nycustodianVisualBlobUrls?: unknown
    }).__nycustodianVisualBlobUrls,
    navigation: (window as typeof window & {
      __nycustodianVisualBfcacheLifecycle?: unknown
    }).__nycustodianVisualBfcacheLifecycle
  }))).toEqual({
    blobUrls: { created: [firstVisualAssetUrl], revoked: [] },
    navigation: { pagehide: [true], pageshow: [true] }
  })
  expect(await page.evaluate((storageKey) => localStorage.getItem(storageKey), revokedUrlStorageKey))
    .toBeNull()

  await page.reload()
  await expect(page.getByRole("button", { name: "Add marker at center" })).toBeEnabled()
  expect(
    await page.evaluate((storageKey) => {
      const stored = localStorage.getItem(storageKey)
      return stored === null ? [] : JSON.parse(stored) as string[]
    }, revokedUrlStorageKey)
  ).toContain(firstVisualAssetUrl)
  expect(await sceneImage.getAttribute("src")).toMatch(/^blob:/)
  expect(await sceneImage.getAttribute("src")).not.toBe(firstVisualAssetUrl)
})

test("zero marks require neutral confirmation before durable commit and fetch", async ({
  context,
  page
}) => {
  await gotoReadyVisualHazard(page)

  let attemptObservedAtFetch: StoredHazardAttempt | undefined
  let postcommitRequests = 0
  await context.route(`**${postcommitPath}`, async (route) => {
    postcommitRequests += 1
    attemptObservedAtFetch = await readHazardAttempt(page, visualAttemptId)
    await route.continue()
  })

  await page.getByRole("button", { name: "Submit scene response" }).click()
  await expect(
    page.getByRole("heading", { name: "Submit without marking a concern?" })
  ).toBeFocused()
  expect(postcommitRequests).toBe(0)
  expect(await readHazardAttempt(page, visualAttemptId)).toBeUndefined()

  await page.getByRole("button", { name: "Confirm and save no marks" }).click()
  await expect(page.getByRole("heading", { name: /You found \d+ of \d+|no hazard to find|Response saved/ })).toBeFocused()
  expect(attemptObservedAtFetch).toMatchObject({
    id: visualAttemptId,
    markers: [],
    selectedZoneOrders: [],
    zeroHazardsConfirmed: true
  })
  expect(postcommitRequests).toBe(1)
})

test("an IndexedDB write failure focuses recovery and never requests or reveals feedback", async ({
  page
}) => {
  await gotoReadyVisualHazard(page)

  let postcommitRequests = 0
  page.on("request", (request) => {
    if (request.url().endsWith(postcommitPath)) postcommitRequests += 1
  })
  await page.evaluate(() => {
    const originalTransaction = IDBDatabase.prototype.transaction
    IDBDatabase.prototype.transaction = function(storeNames, mode, options) {
      if (mode === "readwrite") {
        throw new DOMException("Injected hazard transaction failure", "AbortError")
      }
      return Reflect.apply(originalTransaction, this, [storeNames, mode, options]) as IDBTransaction
    }
  })

  await page.getByRole("button", { name: "Add marker at center" }).click()
  await page.getByRole("button", { name: "Submit scene response" }).click()

  await expect(page.getByRole("heading", { name: "Your response was not saved" })).toBeFocused()
  await expect(page.getByRole("heading", { name: /You found \d+ of \d+|no hazard to find|Response saved/ })).toHaveCount(0)
  await expect(page.getByText("wide shallow wet patch", { exact: false })).toHaveCount(0)
  expect(postcommitRequests).toBe(0)
  expect(await readHazardAttempt(page, visualAttemptId)).toBeUndefined()
  await expect(page.getByRole("button", { name: "Retry saving response" })).toBeEnabled()
})

test("keyboard-only nonvisual zone selection commits before feedback", async ({ context, page }) => {
  await gotoReadyNonvisualHazard(page)

  let attemptObservedAtFetch: StoredHazardAttempt | undefined
  let postcommitRequests = 0
  await context.route(`**${postcommitPath}`, async (route) => {
    postcommitRequests += 1
    attemptObservedAtFetch = await readHazardAttempt(page, nonvisualAttemptId)
    await route.continue()
  })

  await expect(page.locator("[data-hazard-player] img")).toHaveCount(0)
  const firstZone = page.getByRole("checkbox").first()
  await firstZone.focus()
  await page.keyboard.press("Space")
  await expect(firstZone).toBeChecked()
  expect(postcommitRequests).toBe(0)

  const zoneCount = await page.getByRole("checkbox").count()
  for (let index = 0; index < zoneCount; index += 1) await page.keyboard.press("Tab")
  await expect(page.getByRole("button", { name: "Submit scene response" })).toBeFocused()
  await page.keyboard.press("Enter")

  await expect(page.getByRole("heading", { name: /You found \d+ of \d+|no hazard to find|Response saved/ })).toBeFocused()
  expect(attemptObservedAtFetch).toMatchObject({
    id: nonvisualAttemptId,
    mode: "nonvisual",
    markers: [],
    selectedZoneOrders: [1],
    zeroHazardsConfirmed: false,
    receipt: hazardReceipt("nonvisual"),
    allowedZoneOrders: [1, 2, 3, 4]
  })
  expect(attemptObservedAtFetch?.evaluation).toBeUndefined()
  expect(await readHazardAttempt(page, nonvisualAttemptId)).toMatchObject({
    evaluation: {
      payload: { opaqueAssetId: "s001" },
      retainedVisualAsset: null
    }
  })
  await expect(page.getByRole("heading", { name: "Full scene description by zone" })).toBeVisible()
  expect(postcommitRequests).toBe(1)
})

test("a mismatched postcommit artifact leaves the durable response saved but unrevealed", async ({
  context,
  page
}) => {
  await gotoReadyVisualHazard(page)

  await context.route(`**${postcommitPath}`, async (route) => {
    const response = await route.fetch()
    const payload = await response.json() as Record<string, unknown>
    await route.fulfill({ response, json: { ...payload, opaqueAssetId: "s999" } })
  })

  await page.getByRole("button", { name: "Add marker at center" }).click()
  await page.getByRole("button", { name: "Submit scene response" }).click()

  await expect(page.getByRole("heading", { name: "Your response is saved" })).toBeFocused()
  await expect(page.getByText(
    "Your response is saved, but the exact scene feedback could not be checked and loaded. Reconnect if you are offline, then try again."
  )).toBeVisible()
  await expect(page.getByRole("heading", { name: /You found \d+ of \d+|no hazard to find|Response saved/ })).toHaveCount(0)
  await expect(page.getByText("wide shallow wet patch", { exact: false })).toHaveCount(0)
  expect(await readHazardAttempt(page, visualAttemptId)).toMatchObject({
    id: visualAttemptId,
    markers: [{ id: "marker-1", x: 0.5, y: 0.5 }]
  })
  await expect(page.getByRole("button", { name: "Retry feedback" })).toBeEnabled()
})
