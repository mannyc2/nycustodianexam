import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { expect, test, type Page } from "@playwright/test"
import {
  offlinePackPointerCacheName,
  offlinePackPointerPath
} from "../src/offline-packs/manager.ts"
import { reviewAcknowledgementId } from "../src/review/persistence.ts"
import { appDatabaseName, appDatabaseStores } from "../src/study-storage/app-database.ts"
import {
  attemptId,
  questionId,
  questionReceipt
} from "./question-player-fixtures.ts"
import { waitForActiveServiceWorker } from "./service-worker-fixtures.ts"

const readPacks = (page: Page): Promise<ReadonlyArray<Record<string, unknown>>> =>
  page.evaluate(({ databaseName, storeName }) => new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction(storeName, "readonly")
      const getAll = transaction.objectStore(storeName).getAll()
      getAll.onsuccess = () => resolve(getAll.result as ReadonlyArray<Record<string, unknown>>)
      getAll.onerror = () => reject(getAll.error)
      transaction.oncomplete = () => database.close()
    }
  }), { databaseName: appDatabaseName, storeName: appDatabaseStores.offlinePacks })

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)])
    )
  }
  return value
}

const transferEnvelope = (payload: Readonly<Record<string, unknown>>) => ({
  schemaVersion: 1,
  format: "nycustodian-local-data",
  checksumAlgorithm: "SHA-256",
  payload,
  checksum: createHash("sha256").update(JSON.stringify(canonicalize(payload))).digest("hex")
})

test("correction drafts save explicitly, restore locally, and never POST while intake is dormant", async ({
  page
}) => {
  let statusRequests = 0
  let posts = 0
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname
    if (path === "/api/corrections/status") statusRequests += 1
    if (path === "/api/corrections" && request.method() === "POST") posts += 1
  })
  await page.route("**/api/corrections/status", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ schemaVersion: 1, mode: "disabled", acceptsReports: false })
  }))

  await page.goto("/report/")
  await expect(page.getByText("No saved local draft was found. Nothing has been sent.")).toBeVisible()
  await expect(page.getByRole("group", { name: "Correction report details" })).toBeVisible()
  await page.getByRole("button", { name: "Submit explicitly" }).click()
  await expect(page.getByRole("heading", { name: "Report not submitted" })).toBeFocused()
  await expect(page.getByLabel("Short summary")).toHaveAttribute("aria-invalid", "true")
  await expect(page.getByText("Enter a short summary.")).toBeVisible()
  await expect(page.getByLabel("Details")).toHaveAttribute("aria-invalid", "true")
  await expect(page.getByText("Enter the correction details.")).toBeVisible()
  await expect(page.getByLabel(/I did not include secure exam questions/))
    .toHaveAttribute("aria-invalid", "true")
  expect(statusRequests).toBe(0)
  expect(posts).toBe(0)
  await page.getByLabel("Public page path").fill("//")
  await page.getByRole("button", { name: "Submit explicitly" }).click()
  await expect(page.getByText(
    "Enter a root-relative public path without a domain, query, or fragment."
  )).toBeVisible()
  expect(statusRequests).toBe(0)
  await page.getByLabel("Public page path").fill("/ny/")
  await page.getByLabel("Short summary").fill("Announcement date correction")
  await page.getByLabel("Details").fill("The public announcement shows a different date.")
  await page.getByLabel("Optional public source URL").fill("https://example.gov/announcement")
  await page.getByLabel(/I did not include secure exam questions/).check()
  await page.getByRole("button", { name: "Save local draft" }).click()
  await expect(page.getByText("Draft saved only on this device. It was not submitted.")).toBeVisible()
  expect(statusRequests).toBe(0)
  expect(posts).toBe(0)

  await page.reload()
  await expect(page.getByLabel("Short summary")).toHaveValue("Announcement date correction")
  await expect(page.getByText("Your explicitly saved local draft was restored. Nothing was sent."))
    .toBeVisible()
  expect(statusRequests).toBe(0)
  expect(posts).toBe(0)

  await page.getByRole("button", { name: "Submit explicitly" }).click()
  await expect(page.getByText(
    "Online intake is not activated. Your report remains a local draft and was not submitted."
  )).toBeVisible()
  await expect.poll(() => statusRequests).toBe(1)
  expect(posts).toBe(0)
})

test("a remotely accepted report never blindly resubmits when local receipt persistence fails", async ({
  page
}) => {
  let posts = 0
  await page.route("**/api/corrections/status", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ schemaVersion: 1, mode: "active-v1", acceptsReports: true })
  }))
  await page.route("**/api/corrections", async (route) => {
    posts += 1
    const request = route.request().postDataJSON() as { readonly clientReceiptId: string }
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({
        schemaVersion: 1,
        status: "accepted",
        clientReceiptId: request.clientReceiptId
      })
    })
  })

  await page.goto("/report/")
  await expect(page.getByText("No saved local draft was found. Nothing has been sent.")).toBeVisible()
  await page.getByLabel("Public page path").fill("/ny/")
  await page.getByLabel("Short summary").fill("Accepted correction")
  await page.getByLabel("Details").fill("A public source supports this factual correction.")
  await page.getByLabel(/I did not include secure exam questions/).check()
  await page.evaluate(() => {
    const owner = window as typeof window & {
      __nycustodianOriginalIdbPut?: typeof IDBObjectStore.prototype.put
    }
    owner.__nycustodianOriginalIdbPut = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function(value, key) {
      if (
        this.name === "correction-drafts" &&
        (value as { readonly submissionState?: unknown }).submissionState === "accepted"
      ) {
        this.transaction.abort()
      }
      return owner.__nycustodianOriginalIdbPut!.call(this, value, key)
    }
  })

  await page.getByRole("button", { name: "Submit explicitly" }).click()
  await expect(page.getByRole("heading", {
    name: "Report accepted; local receipt not yet retained"
  })).toBeFocused()
  await expect(page.getByText(/Do not submit this report again/)).toBeVisible()
  expect(posts).toBe(1)

  await page.evaluate(() => {
    const owner = window as typeof window & {
      __nycustodianOriginalIdbPut?: typeof IDBObjectStore.prototype.put
    }
    if (owner.__nycustodianOriginalIdbPut === undefined) throw new Error("Missing IDB put owner")
    IDBObjectStore.prototype.put = owner.__nycustodianOriginalIdbPut
    delete owner.__nycustodianOriginalIdbPut
  })
  await page.getByRole("button", { name: "Retry local receipt save" }).click()
  await expect(page.getByRole("heading", { name: "Report receipt retained on this device" }))
    .toBeFocused()
  await expect(page.getByText(/No network submission occurred/)).toBeVisible()
  expect(posts).toBe(1)
})

test("IndexedDB preferences remain authoritative when the fast boot mirror is unavailable", async ({
  page
}) => {
  await page.goto("/settings/")
  await expect(page.getByText(/Default preferences are shown/)).toBeVisible()
  await page.evaluate(() => {
    const owner = window as typeof window & {
      __nycustodianOriginalStorageSet?: typeof Storage.prototype.setItem
    }
    owner.__nycustodianOriginalStorageSet = Storage.prototype.setItem
    Storage.prototype.setItem = function() {
      throw new DOMException("denied", "SecurityError")
    }
  })
  await page.getByLabel("Prefer larger application text").check()
  await page.getByRole("button", { name: "Save preferences locally" }).click()
  await expect(page.getByRole("heading", { name: "Preferences saved" })).toBeFocused()
  await expect(page.getByText(/Preferences saved in IndexedDB and applied in this tab/)).toBeVisible()
  await expect(page.getByText(/fast reload\/cross-tab preference mirror is unavailable/)).toBeVisible()
  await expect(page.locator("html")).toHaveAttribute("data-large-text", "")
  await page.evaluate(() => {
    const owner = window as typeof window & {
      __nycustodianOriginalStorageSet?: typeof Storage.prototype.setItem
    }
    if (owner.__nycustodianOriginalStorageSet === undefined) throw new Error("Missing storage owner")
    Storage.prototype.setItem = owner.__nycustodianOriginalStorageSet
    delete owner.__nycustodianOriginalStorageSet
  })
})

test("saved preferences apply on reload and across tabs, while reset reports the committed count", async ({
  context,
  page
}) => {
  await page.goto("/settings/")
  await expect(page.getByText(/Default preferences are shown/)).toBeVisible()
  await page.getByLabel("Prefer larger application text").check()
  await page.getByLabel("Reduce nonessential application motion").check()
  await page.getByRole("button", { name: "Save preferences locally" }).click()
  await expect(page.getByText("Preferences saved in IndexedDB on this device.")).toBeVisible()
  await expect(page.locator("html")).toHaveAttribute("data-large-text", "")
  await expect(page.locator("html")).toHaveAttribute("data-reduce-motion", "")

  const peer = await context.newPage()
  await peer.goto("/")
  await expect(peer.locator("html")).toHaveAttribute("data-large-text", "")
  await expect(peer.locator("html")).toHaveAttribute("data-reduce-motion", "")

  await page.reload()
  await expect(page.getByLabel("Prefer larger application text")).toBeChecked()
  await expect(page.getByLabel("Reduce nonessential application motion")).toBeChecked()
  await page.getByLabel("Reset scope").selectOption("preferences")
  await page.getByRole("button", { name: "Preview reset" }).click()
  await expect(page.getByRole("heading", { name: "Reset preview: 1 record(s)" })).toBeVisible()

  await peer.evaluate(({ databaseName, storeName }) => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(databaseName)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction(storeName, "readwrite")
      transaction.objectStore(storeName).delete("site-preferences")
      transaction.oncomplete = () => { database.close(); resolve() }
      transaction.onerror = () => reject(transaction.error)
    }
  }), { databaseName: appDatabaseName, storeName: appDatabaseStores.preferences })

  await page.getByLabel("Delete exactly this reset scope from this device").check()
  await page.getByRole("button", { name: "Confirm scoped reset" }).click()
  await expect(page.getByText(/Scoped reset completed for 0 record\(s\)/)).toBeVisible()
  await expect(page.locator("html")).not.toHaveAttribute("data-large-text", "")
  await expect(peer.locator("html")).not.toHaveAttribute("data-large-text", "")
})

test("portable import previews unknown references, commits atomically, and exports a checked envelope", async ({
  page
}) => {
  await page.goto("/settings/")
  await expect(page.getByText(/Default preferences are shown/)).toBeVisible()
  const preference = {
    id: "site-preferences",
    schemaVersion: 1,
    preferredLocale: "en",
    lowDataMode: false,
    largeText: true,
    reduceMotion: true,
    updatedAt: 1
  } as const
  const payload = {
    schemaVersion: 1,
    exportedAt: 1,
    includesCorrectionDrafts: false,
    questionAttempts: [{
      id: "primary:unknown-question",
      questionId: "unknown-question",
      selectedOptionId: "option-a",
      reviewIntent: "unflagged",
      committedAt: 1
    }],
    hazardAttempts: [],
    reviewAcknowledgements: [],
    preferences: [preference],
    correctionDrafts: []
  }
  const importInput = page.getByLabel("Local export JSON")
  await importInput.setInputFiles({
    name: "portable-excess-property.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(transferEnvelope({
      ...payload,
      preferences: [{ ...preference, unexpected: true }]
    })))
  })
  await page.getByRole("button", { name: "Validate and preview import" }).click()
  await expect(page.getByRole("heading", { name: "Local-data operation stopped" })).toBeFocused()
  await expect(page.getByRole("heading", { name: "No-write import preview" })).toHaveCount(0)

  await importInput.setInputFiles({
    name: "portable-duplicate.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(transferEnvelope({
      ...payload,
      preferences: [preference, preference]
    })))
  })
  await page.getByRole("button", { name: "Validate and preview import" }).click()
  await expect(page.getByText(/duplicate record IDs within one store/)).toBeVisible()
  await expect(page.getByRole("heading", { name: "No-write import preview" })).toHaveCount(0)

  await importInput.setInputFiles({
    name: "portable-invalid-time.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(transferEnvelope({
      ...payload,
      questionAttempts: [{
        id: attemptId,
        questionId,
        selectedOptionId: "pipe-wrench",
        reviewIntent: "unflagged",
        committedAt: -1,
        receipt: questionReceipt,
        optionIds: ["adjustable-wrench", "combination-wrench", "pipe-wrench", "slip-joint-pliers"]
      }]
    })))
  })
  await page.getByRole("button", { name: "Validate and preview import" }).click()
  await expect(page.getByText(/invalid commit time/)).toBeVisible()
  await expect(page.getByRole("heading", { name: "No-write import preview" })).toHaveCount(0)

  await importInput.setInputFiles({
    name: "portable-semantic-invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(transferEnvelope({
      ...payload,
      questionAttempts: [{
        id: "forged-attempt-id",
        questionId,
        selectedOptionId: "pipe-wrench",
        reviewIntent: "unflagged",
        committedAt: 1,
        receipt: questionReceipt,
        optionIds: ["adjustable-wrench", "combination-wrench", "pipe-wrench", "slip-joint-pliers"]
      }]
    })))
  })
  await page.getByRole("button", { name: "Validate and preview import" }).click()
  await expect(page.getByText(/invalid receipt identity/)).toBeVisible()
  await expect(page.getByRole("heading", { name: "No-write import preview" })).toHaveCount(0)

  await importInput.setInputFiles({
    name: "portable.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(transferEnvelope(payload)))
  })
  await page.getByRole("button", { name: "Validate and preview import" }).click()
  await expect(page.getByRole("heading", { name: "No-write import preview" })).toBeFocused()
  await expect(page.getByText("Checksum and schema validation passed. Review the no-write preview below."))
    .toBeVisible()
  await expect(
    page.getByText("Unknown references to quarantine").locator("xpath=following-sibling::dd[1]")
  ).toHaveText("1")
  await page.getByLabel("Apply this exact preview without overwriting existing records").check()
  await page.getByRole("button", { name: "Apply validated import" }).click()
  await expect(page.getByRole("heading", { name: "Portable import complete" })).toBeFocused()
  await expect(page.getByText(
    "Import committed atomically: 1 inserted, 0 matched, 1 quarantined. No existing record was overwritten."
  )).toBeVisible()
  await expect(page.locator("html")).toHaveAttribute("data-large-text", "")
  expect(await page.evaluate(({ databaseName, storeName }) => new Promise<number>((resolve, reject) => {
    const request = indexedDB.open(databaseName)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction(storeName, "readonly")
      const count = transaction.objectStore(storeName).count()
      count.onsuccess = () => resolve(count.result)
      count.onerror = () => reject(count.error)
      transaction.oncomplete = () => database.close()
    }
  }), { databaseName: appDatabaseName, storeName: appDatabaseStores.transferQuarantine }))
    .toBe(1)

  const downloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "Download validated export" }).click()
  const download = await downloadPromise
  const path = await download.path()
  if (path === null) throw new Error("Portable export has no local download path")
  const exported = JSON.parse(await readFile(path, "utf8")) as {
    readonly checksum: string
    readonly payload: Readonly<Record<string, unknown>>
  }
  expect(exported.checksum).toBe(
    createHash("sha256").update(JSON.stringify(canonicalize(exported.payload))).digest("hex")
  )
  expect(exported.payload.correctionDrafts).toEqual([])
})

test("portable apply rechecks a drifted parent and quarantines its dependent acknowledgement", async ({
  page
}) => {
  await page.goto("/settings/")
  await expect(page.getByText(/Default preferences are shown/)).toBeVisible()
  const optionIds = [
    "adjustable-wrench",
    "combination-wrench",
    "pipe-wrench",
    "slip-joint-pliers"
  ]
  const incomingAttempt = {
    id: attemptId,
    questionId,
    selectedOptionId: "pipe-wrench",
    reviewIntent: "unflagged",
    committedAt: 1,
    receipt: questionReceipt,
    optionIds
  } as const
  const acknowledgement = {
    id: reviewAcknowledgementId({
      itemId: questionId,
      attemptId,
      reasonIds: ["incorrect-answer"]
    }),
    itemId: questionId,
    attemptId,
    reasonIds: ["incorrect-answer"],
    acknowledgedAt: 2
  } as const
  const payload = {
    schemaVersion: 1,
    exportedAt: 2,
    includesCorrectionDrafts: false,
    questionAttempts: [incomingAttempt],
    hazardAttempts: [],
    reviewAcknowledgements: [acknowledgement],
    preferences: [],
    correctionDrafts: []
  } as const
  await page.getByLabel("Local export JSON").setInputFiles({
    name: "portable-dependent-ack.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(transferEnvelope(payload)))
  })
  await page.getByRole("button", { name: "Validate and preview import" }).click()
  await expect(page.getByRole("heading", { name: "No-write import preview" })).toBeFocused()

  await page.evaluate(({ databaseName, storeName, record }) => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(databaseName)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction(storeName, "readwrite")
      transaction.objectStore(storeName).put(record)
      transaction.oncomplete = () => { database.close(); resolve() }
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    }
  }), {
    databaseName: appDatabaseName,
    storeName: appDatabaseStores.questionAttempts,
    record: { ...incomingAttempt, selectedOptionId: "adjustable-wrench", committedAt: 3 }
  })

  await page.getByLabel("Apply this exact preview without overwriting existing records").check()
  await page.getByRole("button", { name: "Apply validated import" }).click()
  await expect(page.getByText(
    "Import committed atomically: 0 inserted, 0 matched, 2 quarantined. No existing record was overwritten."
  )).toBeVisible()
  await expect(page.getByRole("heading", { name: "Portable import complete" })).toBeFocused()

  const counts = await page.evaluate(({ databaseName, acknowledgementStore, quarantineStore }) =>
    new Promise<{ readonly acknowledgements: number; readonly quarantined: number }>((resolve, reject) => {
      const request = indexedDB.open(databaseName)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const database = request.result
        const transaction = database.transaction(
          [acknowledgementStore, quarantineStore],
          "readonly"
        )
        const acknowledgements = transaction.objectStore(acknowledgementStore).count()
        const quarantined = transaction.objectStore(quarantineStore).count()
        transaction.oncomplete = () => {
          database.close()
          resolve({ acknowledgements: acknowledgements.result, quarantined: quarantined.result })
        }
        transaction.onerror = () => reject(transaction.error)
      }
    }), {
      databaseName: appDatabaseName,
      acknowledgementStore: appDatabaseStores.reviewAcknowledgements,
      quarantineStore: appDatabaseStores.transferQuarantine
    })
  expect(counts).toEqual({ acknowledgements: 0, quarantined: 2 })
})

test("a staged pack is rehashed before activation and serves atlas navigation and imagery offline", async ({
  browserName,
  context,
  page
}) => {
  test.skip(browserName !== "chromium", "Playwright exposes service-worker inspection only in Chromium")
  test.setTimeout(300_000)

  await page.goto("/settings/")
  await expect(page.getByText(/Default preferences are shown/)).toBeVisible()
  const zeroSha = "0".repeat(64)
  await page.evaluate(({ databaseName, storeName, sha }) => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(databaseName)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction(storeName, "readwrite")
      transaction.objectStore(storeName).put({
        id: "prior-release-v0-en",
        generation: "prior-generation",
        immutableFingerprint: sha,
        descriptor: {
          schemaVersion: 1,
          id: "prior-release-v0-en",
          releaseId: "prior-release-v0",
          packVersion: 0,
          locale: "en",
          label: "Prior verified pack",
          lifecycle: "retired",
          publicationTime: null,
          compatibility: [{ profileId: "profile", label: "Profile", compatibilityKey: "profile-v1" }],
          counts: { profiles: 1, sources: 0, tools: 0, questions: 0, hazardScenes: 0 },
          totalBytes: 1,
          receipts: [{ kind: "artifact", path: "/prior.json", bytes: 1, sha256: sha }],
          applicationShellManifestPath: "/offline-pack-shell-manifest.json",
          applicationShellManifestReceipt: {
            path: "/offline-pack-shell-manifest.json",
            bytes: 1,
            sha256: sha
          },
          applicationShellBytes: 2,
          estimatedDownloadBytes: 3,
          requiredNavigation: ["/prior/"]
        },
        status: "active",
        cacheName: "nycustodian-pack-prior-release-v0-en-prior-release-v0-0-en-prior-generation",
        downloadedBytes: 3,
        stagedAt: 1,
        verifiedAt: 2,
        activatedAt: 3,
        detail: null
      })
      transaction.oncomplete = () => { database.close(); resolve() }
      transaction.onerror = () => reject(transaction.error)
    }
  }), { databaseName: appDatabaseName, storeName: appDatabaseStores.offlinePacks, sha: zeroSha })

  await page.goto("/offline/")
  await expect(page.getByText("Prior verified pack v0")).toBeVisible()
  await page.getByRole("button", { name: "Download and verify pack" }).click()
  await expect(page.getByText(/Every declared object was checksum-verified/))
    .toBeVisible({ timeout: 120_000 })
  await expect(page.getByRole("heading", { name: "Offline pack verified" })).toBeFocused()
  const activate = page.getByRole("button", { name: "Activate verified pack" })
  await expect(activate).toBeVisible()

  let packs = await readPacks(page)
  const currentCacheName = packs.find((pack) => pack.id === "launch-v1-v1-en")?.cacheName
  if (typeof currentCacheName !== "string") throw new Error("Staged pack has no cache namespace")
  await page.evaluate(async (cacheName) => {
    const cache = await caches.open(cacheName)
    const original = await cache.match("/styles.css")
    if (original === undefined) throw new Error("The staged shell has no stylesheet")
    await cache.put("/styles.css", new Response("corrupt", {
      status: 200,
      headers: { "content-type": "text/css" }
    }))
  }, currentCacheName)
  await activate.click()
  await expect(page.getByRole("heading", { name: "Offline-pack operation stopped" })).toBeVisible()
  packs = await readPacks(page)
  expect(packs.find((pack) => pack.id === "prior-release-v0-en")?.status).toBe("active")
  expect(packs.find((pack) => pack.id === "launch-v1-v1-en")?.status).toBe("quarantined")
  expect(await page.evaluate((cacheName) => caches.has(cacheName), currentCacheName)).toBe(false)

  await page.getByRole("button", { name: "Retry download and verification" }).first().click()
  await expect(page.getByText(/Every declared object was checksum-verified/))
    .toBeVisible({ timeout: 120_000 })
  await expect(page.getByRole("heading", { name: "Offline pack verified" })).toBeFocused()
  packs = await readPacks(page)
  const replacementCacheName = packs.find((pack) => pack.id === "launch-v1-v1-en")?.cacheName
  if (typeof replacementCacheName !== "string") throw new Error("Restaged pack has no cache namespace")
  expect(replacementCacheName).not.toBe(currentCacheName)
  await activate.click()
  await expect(page.getByText(/verified pack is active for new sessions/)).toBeVisible()
  await expect(page.getByRole("heading", { name: "Offline pack activated" })).toBeFocused()
  packs = await readPacks(page)
  expect(packs.find((pack) => pack.id === "prior-release-v0-en")?.status).toBe("retained")
  expect(packs.find((pack) => pack.id === "launch-v1-v1-en")?.status).toBe("active")
  await expect(page.getByRole("button", {
    name: "Activate stored Prior verified pack version 0"
  })).toBeVisible()
  expect(await page.evaluate(async ({ cacheName, pointerPath }) => {
    const cache = await caches.open(cacheName)
    return await (await cache.match(pointerPath))?.text()
  }, { cacheName: offlinePackPointerCacheName, pointerPath: offlinePackPointerPath }))
    .toBe(replacementCacheName)

  const historicalAttemptId = "prior-release-v0:v0:prior-session:question:1"
  await page.evaluate(({ databaseName, stores, recordId, receipt }) => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(databaseName)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction([stores.attempts, stores.sessions], "readwrite")
      transaction.objectStore(stores.attempts).put({
        id: recordId,
        questionId: receipt.questionId,
        selectedOptionId: "pipe-wrench",
        reviewIntent: "unflagged",
        committedAt: 4,
        receipt,
        optionIds: ["adjustable-wrench", "combination-wrench", "pipe-wrench", "slip-joint-pliers"]
      })
      transaction.objectStore(stores.sessions).put({
        id: "active",
        latestAttemptId: recordId,
        updatedAt: 4
      })
      transaction.oncomplete = () => { database.close(); resolve() }
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    }
  }), {
    databaseName: appDatabaseName,
    stores: {
      attempts: appDatabaseStores.questionAttempts,
      sessions: appDatabaseStores.questionSessions
    },
    recordId: historicalAttemptId,
    receipt: {
      ...questionReceipt,
      releaseId: "prior-release-v0",
      packVersion: 0,
      sessionId: "prior-session"
    }
  })
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("1 historical attempt(s)")
    await dialog.accept()
  })
  const priorPack = page.getByRole("listitem").filter({ hasText: "Prior verified pack v0" })
  await priorPack.getByRole("button", { name: "Preview and remove" }).click()
  await expect(priorPack).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Offline pack removed" })).toBeFocused()
  expect(await page.evaluate(({ databaseName, stores, recordId }) => new Promise<{
    readonly attempt: boolean
    readonly latestProjection: boolean
  }>((resolve, reject) => {
    const request = indexedDB.open(databaseName)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction([stores.attempts, stores.sessions], "readonly")
      const attempt = transaction.objectStore(stores.attempts).get(recordId)
      const projection = transaction.objectStore(stores.sessions).get("active")
      transaction.oncomplete = () => {
        database.close()
        resolve({ attempt: attempt.result !== undefined, latestProjection: projection.result !== undefined })
      }
      transaction.onerror = () => reject(transaction.error)
    }
  }), {
    databaseName: appDatabaseName,
    stores: {
      attempts: appDatabaseStores.questionAttempts,
      sessions: appDatabaseStores.questionSessions
    },
    recordId: historicalAttemptId
  })).toEqual({ attempt: true, latestProjection: true })

  await waitForActiveServiceWorker(page)
  await page.reload()
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)
  await context.setOffline(true)
  await page.goto("/atlas/tool/pipe-wrench/", { waitUntil: "domcontentloaded" })
  await expect(page.getByRole("heading", { name: "Pipe wrench", exact: true })).toBeVisible()
  const image = page.getByRole("img", { name: /long-handled hand tool/ })
  await expect(image).toBeVisible()
  expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0)
})
