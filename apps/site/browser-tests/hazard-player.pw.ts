import { expect, test, type Page } from "@playwright/test"
import { appDatabaseName } from "../src/study-storage/app-database.ts"

const visualPath = "/hazards/session/launch-v1/scene/1/"
const nonvisualPath = "/hazards/session/launch-v1-nonvisual/scene/1/"
const postcommitPath = "/content/vertical-slice/scenes/s001.postcommit.json"
const attemptsStore = "hazard-attempts"
const visualAttemptId = "launch-v1:v1:launch-v1:hazard-visual:1"
const nonvisualAttemptId = "launch-v1:v1:launch-v1-nonvisual:hazard-nonvisual:1"
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
  packVersion: 1,
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

  await expect(page.getByRole("heading", { name: "Scene response recorded" })).toBeFocused()
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
  const committed = await readHazardAttempt(page, visualAttemptId)
  expect(committed?.committedAt).toEqual(expect.any(Number))
  expect(postcommitRequests).toBe(1)

  await page.reload()
  await expect(page).toHaveURL(visualPath)
  await expect(page.getByRole("heading", { name: "Scene response recorded" })).toBeFocused()
  expect(await readHazardAttempt(page, visualAttemptId)).toEqual(committed)
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
  await expect(page.getByRole("heading", { name: "Scene response recorded" })).toBeFocused()
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
  await expect(page.getByRole("heading", { name: "Scene response recorded" })).toHaveCount(0)
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

  await expect(page.getByRole("heading", { name: "Scene response recorded" })).toBeFocused()
  expect(attemptObservedAtFetch).toMatchObject({
    id: nonvisualAttemptId,
    mode: "nonvisual",
    markers: [],
    selectedZoneOrders: [1],
    zeroHazardsConfirmed: false,
    receipt: hazardReceipt("nonvisual"),
    allowedZoneOrders: [1, 2, 3, 4]
  })
  await expect(page.getByRole("heading", { name: "Complete zoned text equivalent" })).toBeVisible()
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
  await expect(page.getByRole("heading", { name: "Scene response recorded" })).toHaveCount(0)
  await expect(page.getByText("wide shallow wet patch", { exact: false })).toHaveCount(0)
  expect(await readHazardAttempt(page, visualAttemptId)).toMatchObject({
    id: visualAttemptId,
    markers: [{ id: "marker-1", x: 0.5, y: 0.5 }]
  })
  await expect(page.getByRole("button", { name: "Retry feedback" })).toBeEnabled()
})
