import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { expect, test, type Page } from "@playwright/test"
import {
  offlinePackPointerCacheName,
  offlinePackPointerPath
} from "../src/offline-packs/manager.ts"
import {
  decodeGeneratedOfflinePackDescriptor,
  decodeOfflinePackDescriptor,
  offlinePackCacheName,
  offlinePackClaimId,
  offlinePackContentFingerprintSource,
  offlinePackOperationId,
  offlinePackOrphanCacheId,
  offlinePackRetirementId,
  offlinePackShellBuildFingerprintSource,
  type OfflinePackDescriptor
} from "../src/offline-packs/model.ts"
import { reviewAcknowledgementId } from "../src/review/persistence.ts"
import {
  appDatabaseName,
  appDatabaseStores,
  appDatabaseVersion
} from "../src/study-storage/app-database.ts"
import {
  verifiedContentCacheKey,
  verifiedContentCacheName
} from "../src/verified-content.ts"
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

const readStoreRecords = (
  page: Page,
  storeName: string
): Promise<ReadonlyArray<Record<string, unknown>>> => page.evaluate(
  ({ databaseName, storeName }) => new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction(storeName, "readonly")
      const records = transaction.objectStore(storeName).getAll()
      records.onsuccess = () => resolve(records.result)
      records.onerror = () => reject(records.error)
      transaction.oncomplete = () => database.close()
      transaction.onabort = () => reject(transaction.error)
    }
  }),
  { databaseName: appDatabaseName, storeName }
)

interface BrowserPackFixture {
  readonly id: string
  readonly packId: string
  readonly generation: string
  readonly contentFingerprint: string
  readonly shellBuildFingerprint: string
  readonly descriptor: OfflinePackDescriptor
  readonly status: "active" | "retained"
  readonly cacheName: string
  readonly downloadedBytes: number
  readonly stagedAt: number
  readonly verifiedAt: number
  readonly activatedAt: number
  readonly detail: null
}

const packFixture = (
  descriptor: OfflinePackDescriptor,
  generation: string,
  status: BrowserPackFixture["status"],
  activatedAt = 1_700_000_000_000
): BrowserPackFixture => {
  if (descriptor.estimatedDownloadBytes === null) {
    throw new Error("Browser pack fixture requires a finalized descriptor")
  }
  return {
    id: offlinePackClaimId(descriptor.id, generation),
    packId: descriptor.id,
    generation,
    contentFingerprint: createHash("sha256")
      .update(offlinePackContentFingerprintSource(descriptor))
      .digest("hex"),
    shellBuildFingerprint: createHash("sha256")
      .update(offlinePackShellBuildFingerprintSource(descriptor))
      .digest("hex"),
    descriptor,
    status,
    cacheName: offlinePackCacheName(descriptor, generation),
    downloadedBytes: descriptor.estimatedDownloadBytes,
    stagedAt: activatedAt,
    verifiedAt: activatedAt,
    activatedAt,
    detail: null
  }
}

const generatedLaunchDescriptor = async (): Promise<OfflinePackDescriptor> => {
  const offlineHtml = await readFile(
    fileURLToPath(new URL("../dist/offline/index.html", import.meta.url)),
    "utf8"
  )
  const serialized = offlineHtml.match(
    /<script id="offline-pack-descriptor" type="application\/json">([\s\S]*?)<\/script>/
  )?.[1]
  if (serialized === undefined) throw new Error("Generated offline pack descriptor is unavailable")
  const descriptor = decodeGeneratedOfflinePackDescriptor(JSON.parse(serialized) as unknown)
  if (descriptor.estimatedDownloadBytes === null) {
    throw new Error("Generated offline pack descriptor is not finalized")
  }
  return decodeOfflinePackDescriptor(descriptor)
}

const decodeGeneratedAttribute = (value: string): string => value
  .replaceAll("&quot;", "\"")
  .replaceAll("&#39;", "'")
  .replaceAll("&lt;", "<")
  .replaceAll("&gt;", ">")
  .replaceAll("&amp;", "&")

const generatedAtlasImageAlternative = async (atlasPath: string): Promise<string> => {
  const atlasHtml = await readFile(
    fileURLToPath(new URL(`../dist${atlasPath}index.html`, import.meta.url)),
    "utf8"
  )
  const encodedAlternative = atlasHtml.match(/<img\b[^>]*\balt="([^"]+)"/)?.[1]
  if (encodedAlternative === undefined) {
    throw new Error(`Generated atlas page ${atlasPath} has no image alternative`)
  }
  return decodeGeneratedAttribute(encodedAlternative)
}

const routeOfflineDescriptor = async (
  page: Page,
  current: () => OfflinePackDescriptor
): Promise<void> => {
  await page.route("**/offline/**", async (route) => {
    const response = await route.fetch()
    const html = await response.text()
    const serialized = JSON.stringify(current())
      .replaceAll("<", "\\u003c")
      .replaceAll("\u2028", "\\u2028")
      .replaceAll("\u2029", "\\u2029")
    const pattern = /(<script id="offline-pack-descriptor" type="application\/json">)[\s\S]*?(<\/script>)/
    if (!pattern.test(html)) throw new Error("Routed offline document has no descriptor payload")
    await route.fulfill({
      response,
      body: html.replace(pattern, `$1${serialized}$2`)
    })
  })
}

const sentinelDescriptor = (): OfflinePackDescriptor => decodeOfflinePackDescriptor({
  schemaVersion: 1,
  id: "race-sentinel-release-v1-en",
  releaseId: "race-sentinel-release-v1",
  packVersion: 1,
  locale: "en",
  label: "Race sentinel pack",
  lifecycle: "published",
  publicationTime: "2026-08-25T00:00:00.000Z",
  compatibility: [{
    profileId: "race-sentinel-profile",
    label: "Race sentinel profile",
    compatibilityKey: "race-sentinel-profile-v1"
  }],
  counts: { profiles: 1, sources: 0, tools: 0, questions: 0, hazardScenes: 0 },
  totalBytes: 1,
  receipts: [{
    kind: "artifact",
    path: "/race-sentinel.json",
    bytes: 1,
    sha256: "0".repeat(64)
  }],
  applicationShellManifestPath: "/offline-pack-shell-manifest.json",
  applicationShellManifestReceipt: {
    path: "/offline-pack-shell-manifest.json",
    bytes: 1,
    sha256: "0".repeat(64)
  },
  applicationShellBytes: 2,
  estimatedDownloadBytes: 3,
  requiredNavigation: ["/status/"]
})

const priorPackDescriptor = (): OfflinePackDescriptor => decodeOfflinePackDescriptor({
  schemaVersion: 1,
  id: "prior-release-v0-en",
  releaseId: "prior-release-v0",
  packVersion: 0,
  locale: "en",
  label: "Prior verified pack",
  lifecycle: "published",
  publicationTime: "2025-08-25T00:00:00.000Z",
  compatibility: [{ profileId: "profile", label: "Profile", compatibilityKey: "profile-v1" }],
  counts: { profiles: 1, sources: 0, tools: 0, questions: 0, hazardScenes: 0 },
  totalBytes: 1,
  receipts: [{
    kind: "artifact",
    path: "/prior.json",
    bytes: 1,
    sha256: "0".repeat(64)
  }],
  applicationShellManifestPath: "/offline-pack-shell-manifest.json",
  applicationShellManifestReceipt: {
    path: "/offline-pack-shell-manifest.json",
    bytes: 1,
    sha256: "0".repeat(64)
  },
  applicationShellBytes: 2,
  estimatedDownloadBytes: 3,
  requiredNavigation: ["/prior/"]
})

const retiredPackDescriptor = (): OfflinePackDescriptor => decodeOfflinePackDescriptor({
  schemaVersion: 1,
  id: "retired-release-v0-en",
  releaseId: "retired-release-v0",
  packVersion: 0,
  locale: "en",
  label: "Retired historical pack",
  lifecycle: "retired",
  publicationTime: "2024-08-25T00:00:00.000Z",
  compatibility: [{ profileId: "profile", label: "Profile", compatibilityKey: "profile-v1" }],
  counts: { profiles: 1, sources: 0, tools: 0, questions: 0, hazardScenes: 0 },
  totalBytes: 1,
  receipts: [{
    kind: "artifact",
    path: "/retired.json",
    bytes: 1,
    sha256: "0".repeat(64)
  }],
  applicationShellManifestPath: "/offline-pack-shell-manifest.json",
  applicationShellManifestReceipt: {
    path: "/offline-pack-shell-manifest.json",
    bytes: 1,
    sha256: "0".repeat(64)
  },
  applicationShellBytes: 2,
  estimatedDownloadBytes: 3,
  requiredNavigation: ["/retired/"]
})

const seedPackFixtures = async (
  page: Page,
  records: ReadonlyArray<BrowserPackFixture>,
  activeClaimId: string
): Promise<void> => {
  const active = records.find((record) => record.id === activeClaimId && record.status === "active")
  if (active === undefined) throw new Error("Pack fixtures require one exact active claim")
  const operations = records.map((record) => ({
    id: offlinePackOperationId("activate", record.id),
    claimId: record.id,
    packId: record.packId,
    generation: record.generation,
    contentFingerprint: record.contentFingerprint,
    shellBuildFingerprint: record.shellBuildFingerprint,
    kind: "activate" as const,
    phase: "complete" as const,
    startedAt: record.verifiedAt,
    updatedAt: record.activatedAt,
    detail: null
  }))
  const activeMeta = {
    id: "active-offline-pack",
    claimId: active.id,
    packId: active.packId,
    generation: active.generation,
    contentFingerprint: active.contentFingerprint,
    shellBuildFingerprint: active.shellBuildFingerprint,
    releaseId: active.descriptor.releaseId,
    packVersion: active.descriptor.packVersion,
    activatedAt: active.activatedAt
  }
  await page.evaluate(async ({
    activeMeta,
    databaseName,
    databaseVersion,
    metaStore,
    operationStore,
    packStore,
    records,
    operations,
    storeNames
  }) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(databaseName, databaseVersion)
      request.onupgradeneeded = () => {
        for (const storeName of storeNames) {
          if (!request.result.objectStoreNames.contains(storeName)) {
            request.result.createObjectStore(storeName, { keyPath: "id" })
          }
        }
      }
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const database = request.result
        const transaction = database.transaction(
          [metaStore, operationStore, packStore],
          "readwrite"
        )
        const packs = transaction.objectStore(packStore)
        const durableOperations = transaction.objectStore(operationStore)
        for (const record of records) packs.put(record)
        for (const operation of operations) durableOperations.put(operation)
        transaction.objectStore(metaStore).put(activeMeta)
        transaction.oncomplete = () => {
          database.close()
          resolve()
        }
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)
      }
    })
    await Promise.all(records.map(({ cacheName }) => caches.open(cacheName)))
  }, {
    activeMeta,
    databaseName: appDatabaseName,
    databaseVersion: appDatabaseVersion,
    metaStore: appDatabaseStores.meta,
    operationStore: appDatabaseStores.offlinePackOperations,
    packStore: appDatabaseStores.offlinePacks,
    records,
    operations,
    storeNames: Object.values(appDatabaseStores)
  })
}

const primeSimulationResultReceipts = async (page: Page): Promise<void> => {
  const raw = await page.locator("#simulation-bootstrap-data").textContent()
  if (raw === null) throw new Error("Simulation bootstrap was unavailable")
  const bootstrap = JSON.parse(raw) as {
    readonly inventory: ReadonlyArray<{
      readonly receipt: {
        readonly postcommitPath: string
        readonly postcommitBytes: number
        readonly postcommitSha256: string
      }
    }>
  }
  const origin = new URL(page.url()).origin
  const entries = await Promise.all(bootstrap.inventory.map(async ({ receipt }) => {
    const bytes = await readFile(fileURLToPath(
      new URL(`../dist${receipt.postcommitPath}`, import.meta.url)
    ))
    if (bytes.byteLength !== receipt.postcommitBytes) {
      throw new Error(`Browser fixture bytes do not match ${receipt.postcommitPath}`)
    }
    return {
      body: bytes.toString("base64"),
      cacheKey: verifiedContentCacheKey(origin, {
        path: receipt.postcommitPath,
        sha256: receipt.postcommitSha256
      }),
      receipt
    }
  }))
  await page.evaluate(async ({ cacheName, entries }) => {
    const cache = await caches.open(cacheName)
    await Promise.all(entries.map(async ({ body, cacheKey, receipt }) => {
      const bytes = Uint8Array.from(atob(body), (character) => character.charCodeAt(0))
      await cache.put(cacheKey, new Response(bytes, {
        headers: {
          "content-type": "application/json",
          "x-nycustodian-verified-bytes": String(receipt.postcommitBytes),
          "x-nycustodian-verified-kind": "postcommit",
          "x-nycustodian-verified-path": receipt.postcommitPath,
          "x-nycustodian-verified-protocol": "1",
          "x-nycustodian-verified-sha256": receipt.postcommitSha256
        },
        status: 200
      }))
    }))
  }, { cacheName: verifiedContentCacheName, entries })
}

const createPinnedSessionTemplate = async (
  page: Page,
  generation: string,
  seed: string
): Promise<{
  readonly session: Record<string, unknown>
  readonly target: BrowserPackFixture
}> => {
  await page.goto("/simulations/")
  const target = packFixture(await generatedLaunchDescriptor(), generation, "active")
  await seedPackFixtures(page, [target], target.id)
  await primeSimulationResultReceipts(page)
  await page.locator("details", { has: page.getByLabel("Set code (seed)") }).evaluate((node) => { (node as HTMLDetailsElement).open = true })
  await page.getByLabel("Set code (seed)").fill(seed)
  await page.getByRole("button", { name: "Start simulation" }).click()
  await expect(page).toHaveURL(/\/simulations\/session\/sim-[a-z0-9-]+\/question\/1\/$/)
  const sessions = await readStoreRecords(page, appDatabaseStores.simulationSessions)
  expect(sessions).toHaveLength(1)
  expect(sessions[0]).toMatchObject({
    schemaVersion: 2,
    status: "active",
    packClaim: {
      claimId: target.id,
      packId: target.packId,
      generation: target.generation,
      contentFingerprint: target.contentFingerprint,
      shellBuildFingerprint: target.shellBuildFingerprint,
      releaseId: target.descriptor.releaseId,
      packVersion: target.descriptor.packVersion
    }
  })
  const session = sessions[0]!
  await page.evaluate(({ databaseName, sessionId, sessionStore }) => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(databaseName)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction(sessionStore, "readwrite")
      transaction.objectStore(sessionStore).delete(sessionId)
      transaction.oncomplete = () => {
        database.close()
        resolve()
      }
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    }
  }), {
    databaseName: appDatabaseName,
    sessionId: session.id as string,
    sessionStore: appDatabaseStores.simulationSessions
  })
  return { session, target }
}

const makePackRemovable = async (
  page: Page,
  target: BrowserPackFixture
): Promise<{ readonly active: BrowserPackFixture; readonly target: BrowserPackFixture }> => {
  const retained = { ...target, status: "retained" as const }
  const active = packFixture(
    sentinelDescriptor(),
    `sentinel-${target.generation}`,
    "active",
    target.activatedAt + 1
  )
  await seedPackFixtures(page, [retained, active], active.id)
  return { active, target: retained }
}

const removalTransactionStores = {
  hazardAttempts: appDatabaseStores.hazardAttempts,
  meta: appDatabaseStores.meta,
  operations: appDatabaseStores.offlinePackOperations,
  packs: appDatabaseStores.offlinePacks,
  questionAttempts: appDatabaseStores.questionAttempts,
  sessions: appDatabaseStores.simulationSessions
} as const

const installPinBeforeRemovalClaim = (
  page: Page,
  session: Record<string, unknown>
): Promise<void> => page.evaluate(({ session, stores }) => {
  localStorage.removeItem("pack-removal-pin-first")
  const original = IDBDatabase.prototype.transaction
  let intercepted = false
  const open = (
    database: IDBDatabase,
    storeNames: string | Iterable<string>,
    mode?: IDBTransactionMode,
    options?: IDBTransactionOptions
  ): IDBTransaction => options === undefined
    ? original.call(database, storeNames, mode)
    : original.call(database, storeNames, mode, options)
  IDBDatabase.prototype.transaction = function(
    storeNames: string | Iterable<string>,
    mode?: IDBTransactionMode,
    options?: IDBTransactionOptions
  ): IDBTransaction {
    const names = typeof storeNames === "string" ? [storeNames] : [...storeNames]
    const removalClaim = mode === "readwrite" &&
      names.includes(stores.packs) &&
      names.includes(stores.operations) &&
      names.includes(stores.questionAttempts) &&
      names.includes(stores.hazardAttempts) &&
      names.includes(stores.sessions)
    if (removalClaim && !intercepted) {
      intercepted = true
      IDBDatabase.prototype.transaction = original
      const pin = open(this, [stores.meta, stores.packs, stores.sessions], "readwrite")
      pin.objectStore(stores.sessions).put(session)
      pin.oncomplete = () => localStorage.setItem("pack-removal-pin-first", "committed")
      pin.onerror = () => localStorage.setItem("pack-removal-pin-first", "failed")
      pin.onabort = () => localStorage.setItem("pack-removal-pin-first", "aborted")
    }
    return open(this, storeNames, mode, options)
  }
}, { session, stores: removalTransactionStores })

const installRemovalBeforePinAttempt = (
  page: Page,
  session: Record<string, unknown>
): Promise<void> => page.evaluate(({ session, stores }) => {
  localStorage.removeItem("pack-removal-claim-first")
  const original = IDBDatabase.prototype.transaction
  let intercepted = false
  const open = (
    database: IDBDatabase,
    storeNames: string | Iterable<string>,
    mode?: IDBTransactionMode,
    options?: IDBTransactionOptions
  ): IDBTransaction => options === undefined
    ? original.call(database, storeNames, mode)
    : original.call(database, storeNames, mode, options)
  IDBDatabase.prototype.transaction = function(
    storeNames: string | Iterable<string>,
    mode?: IDBTransactionMode,
    options?: IDBTransactionOptions
  ): IDBTransaction {
    const names = typeof storeNames === "string" ? [storeNames] : [...storeNames]
    const removalClaim = mode === "readwrite" &&
      names.includes(stores.packs) &&
      names.includes(stores.operations) &&
      names.includes(stores.questionAttempts) &&
      names.includes(stores.hazardAttempts) &&
      names.includes(stores.sessions)
    if (!removalClaim || intercepted) return open(this, storeNames, mode, options)
    intercepted = true
    IDBDatabase.prototype.transaction = original
    const removal = open(this, storeNames, mode, options)
    const pin = open(this, [stores.meta, stores.packs, stores.sessions], "readwrite")
    const claim = session.packClaim as { readonly claimId: string }
    const packRequest = pin.objectStore(stores.packs).get(claim.claimId)
    const metaRequest = pin.objectStore(stores.meta).get("active-offline-pack")
    const attempt = () => {
      if (packRequest.readyState !== "done" || metaRequest.readyState !== "done") return
      const pack = packRequest.result as { readonly id?: unknown; readonly status?: unknown } | undefined
      const meta = metaRequest.result as { readonly claimId?: unknown } | undefined
      if (pack?.status === "active" && meta?.claimId === claim.claimId) {
        pin.objectStore(stores.sessions).put(session)
        localStorage.setItem("pack-removal-claim-first", "unexpected-commit")
      } else {
        localStorage.setItem(
          "pack-removal-claim-first",
          `rejected:${String(pack?.status ?? "missing")}:${String(meta?.claimId ?? "missing")}`
        )
      }
    }
    packRequest.onsuccess = attempt
    metaRequest.onsuccess = attempt
    packRequest.onerror = () => localStorage.setItem("pack-removal-claim-first", "read-failed")
    metaRequest.onerror = () => localStorage.setItem("pack-removal-claim-first", "read-failed")
    pin.onabort = () => localStorage.setItem("pack-removal-claim-first", "aborted")
    return removal
  }
}, { session, stores: removalTransactionStores })

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
  await expect(page.getByText("No saved draft was found on this device. Nothing has been sent.")).toBeVisible()
  await expect(page.getByRole("group", { name: "Correction report details" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Submit report" })).toHaveCount(0)
  await expect(page.getByText(
    "Reports cannot be sent unless online intake is on. Save your draft on this device, or check whether sending is available."
  )).toBeVisible()
  expect(statusRequests).toBe(0)
  expect(posts).toBe(0)
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
  await expect(page.getByText("Your saved draft was restored. Nothing was sent."))
    .toBeVisible()
  expect(statusRequests).toBe(0)
  expect(posts).toBe(0)

  await page.getByRole("button", { name: "Check whether reports can be sent" }).click()
  await expect(page.getByText(
    "Reports cannot be sent right now — online intake is off. Your draft stays on this device until you delete it."
  )).toBeVisible()
  await expect(page.getByRole("button", { name: "Submit report" })).toHaveCount(0)
  await expect.poll(() => statusRequests).toBe(1)
  expect(posts).toBe(0)
})

test("a correction submit never reaches the network until its pre-submit draft persists", async ({
  page
}) => {
  let statusChecks = 0
  let posts = 0
  let postedReport: Readonly<Record<string, unknown>> | null = null
  await page.route("**/api/corrections/status", (route) => {
    statusChecks += 1
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ schemaVersion: 1, mode: "active-v1", acceptsReports: true })
    })
  })
  await page.route("**/api/corrections", async (route) => {
    posts += 1
    postedReport = route.request().postDataJSON() as Readonly<Record<string, unknown>>
    const clientReceiptId = postedReport.clientReceiptId
    if (typeof clientReceiptId !== "string") throw new Error("Correction report omitted its receipt ID")
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({
        schemaVersion: 1,
        status: "accepted",
        clientReceiptId
      })
    })
  })

  await page.goto("/report/")
  await expect(page.getByText("No saved draft was found on this device. Nothing has been sent.")).toBeVisible()
  await page.getByRole("button", { name: "Check whether reports can be sent" }).click()
  await expect(page.getByRole("button", { name: "Submit report" })).toBeVisible()
  await expect.poll(() => statusChecks).toBe(1)
  await page.getByRole("button", { name: "Submit report" }).click()
  await expect(page.getByRole("heading", { name: "Report not submitted" })).toBeFocused()
  await expect(page.getByLabel("Short summary")).toHaveAttribute("aria-invalid", "true")
  await expect(page.getByText("Enter a short summary.")).toBeVisible()
  await expect(page.getByLabel("Details")).toHaveAttribute("aria-invalid", "true")
  await expect(page.getByText("Enter the correction details.")).toBeVisible()
  await expect(page.getByLabel(/I did not include secure exam questions/))
    .toHaveAttribute("aria-invalid", "true")
  expect(statusChecks).toBe(1)
  expect(posts).toBe(0)
  const category = page.getByLabel("Concern category")
  const pagePath = page.getByLabel("Public page path")
  const summary = page.getByLabel("Short summary")
  const details = page.getByLabel("Details")
  const publicSource = page.getByLabel("Optional public source URL")
  const affirmation = page.getByLabel(/I did not include secure exam questions/)
  await category.selectOption("accessibility")
  await pagePath.fill("/atlas/tool/pipe-wrench/")
  await summary.fill("Keyboard description correction")
  await details.fill("The public text alternative omits an observable handle detail.")
  await publicSource.fill("https://example.gov/public-guidance")
  await affirmation.check()

  await page.evaluate((draftStore) => {
    const owner = window as typeof window & {
      __nycustodianOriginalCorrectionDraftPut?: typeof IDBObjectStore.prototype.put
    }
    owner.__nycustodianOriginalCorrectionDraftPut = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function(value, key) {
      if (this.name === draftStore) {
        throw new DOMException("quota exhausted", "QuotaExceededError")
      }
      return owner.__nycustodianOriginalCorrectionDraftPut!.call(this, value, key)
    }
  }, appDatabaseStores.correctionDrafts)

  await page.getByRole("button", { name: "Submit report" }).click()
  await expect(page.getByRole("heading", { name: "Report not submitted" })).toBeFocused()
  await expect(page.getByText(
    "The draft could not be written to this device\u2019s storage before sending, so nothing was sent."
  )).toBeVisible()
  await expect(page.getByText("quota exhausted")).toBeHidden()
  await page.getByText("Technical details").first().click()
  await expect(page.getByText("quota exhausted")).toBeVisible()
  await expect(category).toHaveValue("accessibility")
  await expect(pagePath).toHaveValue("/atlas/tool/pipe-wrench/")
  await expect(summary).toHaveValue("Keyboard description correction")
  await expect(details).toHaveValue(
    "The public text alternative omits an observable handle detail."
  )
  await expect(publicSource).toHaveValue("https://example.gov/public-guidance")
  await expect(affirmation).toBeChecked()
  await expect(page.getByRole("heading", {
    name: /Report (?:accepted|receipt saved)/
  })).toHaveCount(0)
  expect(statusChecks).toBe(1)
  expect(posts).toBe(0)
  expect(postedReport).toBeNull()
  expect(await readStoreRecords(page, appDatabaseStores.correctionDrafts)).toEqual([])

  await page.evaluate(() => {
    const owner = window as typeof window & {
      __nycustodianOriginalCorrectionDraftPut?: typeof IDBObjectStore.prototype.put
    }
    if (owner.__nycustodianOriginalCorrectionDraftPut === undefined) {
      throw new Error("Missing correction-draft IDB put owner")
    }
    IDBObjectStore.prototype.put = owner.__nycustodianOriginalCorrectionDraftPut
    delete owner.__nycustodianOriginalCorrectionDraftPut
  })
  await page.getByRole("button", { name: "Submit report" }).click()

  await expect(page.getByRole("heading", { name: "Report receipt saved on this device" }))
    .toBeFocused()
  await expect.poll(() => statusChecks).toBe(2)
  expect(posts).toBe(1)
  expect(postedReport).toMatchObject({
    category: "accessibility",
    subject: { pagePath: "/atlas/tool/pipe-wrench/" },
    summary: "Keyboard description correction",
    details: "The public text alternative omits an observable handle detail.",
    publicSourceUrl: "https://example.gov/public-guidance",
    affirmsNoSecureExamMaterial: true
  })
  expect(await readStoreRecords(page, appDatabaseStores.correctionDrafts)).toEqual([
    expect.objectContaining({
      category: "accessibility",
      pagePath: "/atlas/tool/pipe-wrench/",
      summary: "Keyboard description correction",
      details: "The public text alternative omits an observable handle detail.",
      publicSourceUrl: "https://example.gov/public-guidance",
      affirmsNoSecureExamMaterial: true,
      submissionState: "accepted"
    })
  ])
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
  await expect(page.getByText("No saved draft was found on this device. Nothing has been sent.")).toBeVisible()
  await page.getByRole("button", { name: "Check whether reports can be sent" }).click()
  await expect(page.getByRole("button", { name: "Submit report" })).toBeVisible()
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

  await page.getByRole("button", { name: "Submit report" }).click()
  await expect(page.getByRole("heading", {
    name: "Report accepted — receipt not saved on this device yet"
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
  await page.getByRole("button", { name: "Retry saving the receipt" }).click()
  await expect(page.getByRole("heading", { name: "Report receipt saved on this device" }))
    .toBeFocused()
  await expect(page.getByText(/Nothing new was sent/)).toBeVisible()
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
  await page.getByRole("button", { name: "Save preferences" }).click()
  await expect(page.getByRole("heading", { name: "Preferences saved" })).toBeFocused()
  await expect(page.getByText(/Preferences saved on this device and applied in this tab/)).toBeVisible()
  await expect(page.getByText(/quick-apply copy of your display choices/)).toBeVisible()
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

test("a failed preference write restores authoritative controls and applied document state", async ({
  page
}) => {
  await page.goto("/settings/")
  await expect(page.getByText(/Default preferences are shown/)).toBeVisible()
  const largeText = page.getByLabel("Prefer larger application text")
  const reduceMotion = page.getByLabel("Reduce nonessential application motion")
  const save = page.getByRole("button", { name: "Save preferences" })

  await largeText.check()
  await save.click()
  await expect(page.getByRole("heading", { name: "Preferences saved" })).toBeFocused()
  await expect(page.locator("html")).toHaveAttribute("data-large-text", "")
  await expect(page.locator("html")).not.toHaveAttribute("data-reduce-motion", "")
  const [authoritative] = await readStoreRecords(page, appDatabaseStores.preferences)
  expect(authoritative).toMatchObject({ largeText: true, reduceMotion: false })

  await largeText.uncheck()
  await reduceMotion.check()
  await page.evaluate((preferenceStore) => {
    const owner = window as typeof window & {
      __nycustodianOriginalPreferencePut?: typeof IDBObjectStore.prototype.put
    }
    owner.__nycustodianOriginalPreferencePut = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function(value, key) {
      if (this.name === preferenceStore) {
        const draft = value as { readonly largeText?: unknown; readonly reduceMotion?: unknown }
        document.documentElement.toggleAttribute("data-large-text", draft.largeText === true)
        document.documentElement.toggleAttribute("data-reduce-motion", draft.reduceMotion === true)
        throw new DOMException("quota exhausted", "QuotaExceededError")
      }
      return owner.__nycustodianOriginalPreferencePut!.call(this, value, key)
    }
  }, appDatabaseStores.preferences)

  await save.click()
  await expect(page.getByRole("heading", { name: "This didn’t finish" })).toBeFocused()
  await expect(page.getByText(/controls show the preferences still saved on this device/))
    .toBeVisible()
  await expect(largeText).toBeChecked()
  await expect(reduceMotion).not.toBeChecked()
  await expect(page.locator("html")).toHaveAttribute("data-large-text", "")
  await expect(page.locator("html")).not.toHaveAttribute("data-reduce-motion", "")

  await page.evaluate(() => {
    const owner = window as typeof window & {
      __nycustodianOriginalPreferencePut?: typeof IDBObjectStore.prototype.put
    }
    if (owner.__nycustodianOriginalPreferencePut === undefined) {
      throw new Error("Missing preference IDB put owner")
    }
    IDBObjectStore.prototype.put = owner.__nycustodianOriginalPreferencePut
    delete owner.__nycustodianOriginalPreferencePut
  })

  await largeText.uncheck()
  await reduceMotion.check()
  await page.evaluate((preferenceStore) => {
    const owner = window as typeof window & {
      __nycustodianOriginalPreferenceGet?: typeof IDBObjectStore.prototype.get
      __nycustodianOriginalPreferencePut?: typeof IDBObjectStore.prototype.put
    }
    owner.__nycustodianOriginalPreferenceGet = IDBObjectStore.prototype.get
    owner.__nycustodianOriginalPreferencePut = IDBObjectStore.prototype.put
    IDBObjectStore.prototype.put = function(value, key) {
      if (this.name === preferenceStore) {
        const draft = value as { readonly largeText?: unknown; readonly reduceMotion?: unknown }
        document.documentElement.toggleAttribute("data-large-text", draft.largeText === true)
        document.documentElement.toggleAttribute("data-reduce-motion", draft.reduceMotion === true)
        throw new DOMException("quota exhausted", "QuotaExceededError")
      }
      return owner.__nycustodianOriginalPreferencePut!.call(this, value, key)
    }
    IDBObjectStore.prototype.get = function(query) {
      if (this.name === preferenceStore) {
        throw new DOMException("preference read unavailable", "InvalidStateError")
      }
      return owner.__nycustodianOriginalPreferenceGet!.call(this, query)
    }
  }, appDatabaseStores.preferences)

  await save.click()
  await expect(page.getByRole("heading", { name: "This didn’t finish" })).toBeFocused()
  await expect(page.getByText(/controls show the last known saved values/))
    .toBeVisible()
  await expect(largeText).toBeChecked()
  await expect(reduceMotion).not.toBeChecked()
  await expect(page.locator("html")).toHaveAttribute("data-large-text", "")
  await expect(page.locator("html")).not.toHaveAttribute("data-reduce-motion", "")

  await page.evaluate(() => {
    const owner = window as typeof window & {
      __nycustodianOriginalPreferenceGet?: typeof IDBObjectStore.prototype.get
      __nycustodianOriginalPreferencePut?: typeof IDBObjectStore.prototype.put
    }
    if (
      owner.__nycustodianOriginalPreferenceGet === undefined ||
      owner.__nycustodianOriginalPreferencePut === undefined
    ) {
      throw new Error("Missing preference IDB method owner")
    }
    IDBObjectStore.prototype.get = owner.__nycustodianOriginalPreferenceGet
    IDBObjectStore.prototype.put = owner.__nycustodianOriginalPreferencePut
    delete owner.__nycustodianOriginalPreferenceGet
    delete owner.__nycustodianOriginalPreferencePut
  })
  expect(await readStoreRecords(page, appDatabaseStores.preferences)).toEqual([authoritative])
})

test("saved preferences apply on reload and across tabs, while reset reports the committed count", async ({
  context,
  page
}) => {
  await page.goto("/settings/")
  await expect(page.getByText(/Default preferences are shown/)).toBeVisible()
  await page.getByLabel("Prefer larger application text").check()
  await page.getByLabel("Reduce nonessential application motion").check()
  await page.getByRole("button", { name: "Save preferences" }).click()
  await expect(page.getByText("Preferences saved on this device.")).toBeVisible()
  await expect(page.locator("html")).toHaveAttribute("data-large-text", "")
  await expect(page.locator("html")).toHaveAttribute("data-reduce-motion", "")

  const peer = await context.newPage()
  await peer.goto("/")
  await expect(peer.locator("html")).toHaveAttribute("data-large-text", "")
  await expect(peer.locator("html")).toHaveAttribute("data-reduce-motion", "")

  await page.reload()
  await expect(page.getByLabel("Prefer larger application text")).toBeChecked()
  await expect(page.getByLabel("Reduce nonessential application motion")).toBeChecked()
  await page.getByLabel("What to delete").selectOption("preferences")
  await page.getByRole("button", { name: "Preview delete" }).click()
  await expect(page.getByRole("heading", { name: "Delete preview: 1 record(s)" })).toBeVisible()

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

  await page.getByLabel("Delete exactly these previewed records from this device").check()
  await page.getByRole("button", { name: "Delete these records" }).click()
  await expect(page.getByText(/Delete complete: 0 record\(s\) removed/)).toBeVisible()
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
  await page.getByRole("button", { name: "Check and preview import" }).click()
  await expect(page.getByRole("heading", { name: "This didn’t finish" })).toBeFocused()
  await expect(page.getByRole("heading", { name: "Import preview — nothing written yet" })).toHaveCount(0)

  await importInput.setInputFiles({
    name: "portable-duplicate.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(transferEnvelope({
      ...payload,
      preferences: [preference, preference]
    })))
  })
  await page.getByRole("button", { name: "Check and preview import" }).click()
  await expect(page.getByText(
    "The file could not be read or checked, so nothing was imported."
  )).toBeVisible()
  await page.getByRole("alert").getByText("Technical details").click()
  await expect(page.getByText(/duplicate record IDs within one store/)).toBeVisible()
  await expect(page.getByRole("heading", { name: "Import preview — nothing written yet" })).toHaveCount(0)

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
  await page.getByRole("button", { name: "Check and preview import" }).click()
  await page.getByRole("alert").getByText("Technical details").click()
  await expect(page.getByText(/finite, non-negative safe-integer timestamp/)).toBeVisible()
  await expect(page.getByRole("heading", { name: "Import preview — nothing written yet" })).toHaveCount(0)

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
  await page.getByRole("button", { name: "Check and preview import" }).click()
  await page.getByRole("alert").getByText("Technical details").click()
  await expect(page.getByText(/invalid receipt identity/)).toBeVisible()
  await expect(page.getByRole("heading", { name: "Import preview — nothing written yet" })).toHaveCount(0)

  await importInput.setInputFiles({
    name: "portable.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(transferEnvelope(payload)))
  })
  await page.getByRole("button", { name: "Check and preview import" }).click()
  await expect(page.getByRole("heading", { name: "Import preview — nothing written yet" })).toBeFocused()
  await expect(page.getByText("The file checked out. Review the preview below — nothing has been written yet."))
    .toBeVisible()
  await expect(
    page.getByText("Unknown references set aside").locator("xpath=following-sibling::dd[1]")
  ).toHaveText("1")
  await page.getByLabel("Apply exactly this preview without overwriting existing records").check()
  await page.getByRole("button", { name: "Apply import" }).click()
  await expect(page.getByRole("heading", { name: "Import complete" })).toBeFocused()
  await expect(page.getByText(
    "Import complete: 1 added, 0 already present, 1 set aside for review. Nothing already saved was overwritten."
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
  await page.getByRole("button", { name: "Download export file" }).click()
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
  await page.getByRole("button", { name: "Check and preview import" }).click()
  await expect(page.getByRole("heading", { name: "Import preview — nothing written yet" })).toBeFocused()

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

  await page.getByLabel("Apply exactly this preview without overwriting existing records").check()
  await page.getByRole("button", { name: "Apply import" }).click()
  await expect(page.getByText(
    "Import complete: 0 added, 0 already present, 2 set aside for review. Nothing already saved was overwritten."
  )).toBeVisible()
  await expect(page.getByRole("heading", { name: "Import complete" })).toBeFocused()

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

test("offline-pack reconciliation quarantines malformed rows without risking valid or orphan caches", async ({
  browserName,
  page
}) => {
  test.skip(browserName !== "chromium", "The Cache API reconciliation proof is Chromium-only")

  await page.goto("/settings/")
  await expect(page.getByText(/Default preferences are shown/)).toBeVisible()
  const active = packFixture(priorPackDescriptor(), "reconcile-valid-generation", "active", 11)
  await seedPackFixtures(page, [active], active.id)

  const corruptOwnedCacheName = "nycustodian-pack-malformed-owned-generation"
  const malformedPack = {
    id: "malformed-offline-pack",
    cacheName: corruptOwnedCacheName,
    descriptor: null,
    status: "staging"
  }
  const malformedRunningOperation = {
    id: "malformed-running-offline-pack-operation",
    claimId: active.id,
    packId: active.packId,
    kind: "stage",
    phase: "running",
    startedAt: 12,
    updatedAt: 12,
    detail: null
  }
  const orphanCacheName = "nycustodian-pack-v1-untrusted-orphan"
  await page.evaluate(async ({
    activeCacheName,
    corruptOwnedCacheName,
    databaseName,
    malformedPack,
    malformedRunningOperation,
    operationStore,
    orphanCacheName,
    packStore,
    pointerCacheName,
    pointerPath
  }) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(databaseName)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const database = request.result
        const transaction = database.transaction([operationStore, packStore], "readwrite")
        transaction.objectStore(packStore).put(malformedPack)
        transaction.objectStore(operationStore).put(malformedRunningOperation)
        transaction.oncomplete = () => {
          database.close()
          resolve()
        }
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)
      }
    })

    const valid = await caches.open(activeCacheName)
    await valid.put("/valid-pack-marker", new Response("valid-pack-bytes"))
    const corruptOwned = await caches.open(corruptOwnedCacheName)
    await corruptOwned.put("/corrupt-pack-marker", new Response("must-be-cleaned"))
    const orphan = await caches.open(orphanCacheName)
    await orphan.put("/orphan-marker", new Response("untrusted-orphan-bytes"))
    const pointer = await caches.open(pointerCacheName)
    await pointer.put(pointerPath, new Response(activeCacheName))
  }, {
    activeCacheName: active.cacheName,
    corruptOwnedCacheName,
    databaseName: appDatabaseName,
    malformedPack,
    malformedRunningOperation,
    operationStore: appDatabaseStores.offlinePackOperations,
    orphanCacheName,
    packStore: appDatabaseStores.offlinePacks,
    pointerCacheName: offlinePackPointerCacheName,
    pointerPath: offlinePackPointerPath
  })

  await page.goto("/offline/")
  await expect(page.getByText("Prior verified pack v0")).toBeVisible()
  await expect(page.getByRole("status")).toContainText(
    "Checked the downloads saved on this device. Nothing was downloaded or changed."
  )

  expect(await readPacks(page)).toEqual([active])
  expect(await readStoreRecords(page, appDatabaseStores.offlinePackOperations)).toEqual([
    expect.objectContaining({
      id: offlinePackOperationId("activate", active.id),
      claimId: active.id,
      phase: "complete"
    })
  ])
  const quarantined = await readStoreRecords(page, appDatabaseStores.migrationQuarantine)
  expect(quarantined).toHaveLength(2)
  expect(quarantined).toEqual(expect.arrayContaining([
    expect.objectContaining({
      sourceDatabase: appDatabaseName,
      sourceStore: appDatabaseStores.offlinePacks,
      targetStore: appDatabaseStores.offlinePacks,
      reason: "invalid-source-record",
      legacyRecord: malformedPack
    }),
    expect.objectContaining({
      sourceDatabase: appDatabaseName,
      sourceStore: appDatabaseStores.offlinePackOperations,
      targetStore: appDatabaseStores.offlinePackOperations,
      reason: "invalid-source-record",
      legacyRecord: malformedRunningOperation
    })
  ]))
  expect((await readStoreRecords(page, appDatabaseStores.meta))
    .find((record) => record.id === "active-offline-pack")).toMatchObject({
      claimId: active.id,
      generation: active.generation,
      contentFingerprint: active.contentFingerprint,
      shellBuildFingerprint: active.shellBuildFingerprint
    })
  expect((await readStoreRecords(page, appDatabaseStores.meta))
    .some((record) => record.id === offlinePackOrphanCacheId(corruptOwnedCacheName))).toBe(false)

  expect(await page.evaluate(async ({
    activeCacheName,
    corruptOwnedCacheName,
    orphanCacheName,
    pointerCacheName,
    pointerPath
  }) => {
    const valid = await caches.open(activeCacheName)
    const orphan = await caches.open(orphanCacheName)
    const pointer = await caches.open(pointerCacheName)
    return {
      activeMarker: await (await valid.match("/valid-pack-marker"))?.text(),
      corruptOwnedCachePresent: await caches.has(corruptOwnedCacheName),
      orphanMarker: await (await orphan.match("/orphan-marker"))?.text(),
      pointer: await (await pointer.match(pointerPath))?.text()
    }
  }, {
    activeCacheName: active.cacheName,
    corruptOwnedCacheName,
    orphanCacheName,
    pointerCacheName: offlinePackPointerCacheName,
    pointerPath: offlinePackPointerPath
  })).toEqual({
    activeMarker: "valid-pack-bytes",
    corruptOwnedCachePresent: false,
    orphanMarker: "untrusted-orphan-bytes",
    pointer: active.cacheName
  })
})

test("an already-offline pack request performs no work and succeeds only after explicit online retry", async ({
  browserName,
  page
}) => {
  test.skip(browserName !== "chromium", "The Cache API mutation proof is Chromium-only")
  test.setTimeout(300_000)
  const currentDescriptor = await generatedLaunchDescriptor()

  await page.goto("/settings/")
  await expect(page.getByText(/Default preferences are shown/)).toBeVisible()
  const prior = packFixture(priorPackDescriptor(), "known-offline-prior-generation", "active", 21)
  await seedPackFixtures(page, [prior], prior.id)
  await page.goto("/offline/")
  await expect(page.getByText("Prior verified pack v0")).toBeVisible()
  await expect(page.getByRole("status")).toContainText(
    "Checked the downloads saved on this device. Nothing was downloaded or changed."
  )

  const before = {
    packs: await readPacks(page),
    operations: await readStoreRecords(page, appDatabaseStores.offlinePackOperations),
    cacheNames: await page.evaluate(() => caches.keys()),
    pointer: await page.evaluate(async ({ cacheName, path }) => {
      const cache = await caches.open(cacheName)
      return await (await cache.match(path))?.text()
    }, { cacheName: offlinePackPointerCacheName, path: offlinePackPointerPath })
  }
  expect(before.pointer).toBe(prior.cacheName)

  await page.evaluate(() => {
    const owner = window as typeof window & {
      __nycustodianPackOnline?: boolean
      __nycustodianPackMetrics?: {
        cacheDeletes: number
        cacheEntryDeletes: number
        cachePuts: number
        fetches: number
      }
    }
    owner.__nycustodianPackOnline = false
    owner.__nycustodianPackMetrics = {
      cacheDeletes: 0,
      cacheEntryDeletes: 0,
      cachePuts: 0,
      fetches: 0
    }
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => owner.__nycustodianPackOnline
    })
    const originalFetch = window.fetch
    Object.defineProperty(window, "fetch", {
      configurable: true,
      value: (input: RequestInfo | URL, init?: RequestInit) => {
        owner.__nycustodianPackMetrics!.fetches += 1
        return originalFetch(input, init)
      }
    })
    const originalStorageDelete = CacheStorage.prototype.delete
    CacheStorage.prototype.delete = function(cacheName: string): Promise<boolean> {
      owner.__nycustodianPackMetrics!.cacheDeletes += 1
      return originalStorageDelete.call(this, cacheName)
    }
    const originalPut = Cache.prototype.put
    Cache.prototype.put = function(request: RequestInfo | URL, response: Response): Promise<void> {
      owner.__nycustodianPackMetrics!.cachePuts += 1
      return originalPut.call(this, request, response)
    }
    const originalDelete = Cache.prototype.delete
    Cache.prototype.delete = function(
      request: RequestInfo | URL,
      options?: CacheQueryOptions
    ): Promise<boolean> {
      owner.__nycustodianPackMetrics!.cacheEntryDeletes += 1
      return originalDelete.call(this, request, options)
    }
  })

  const requestPack = page.getByRole("button", { name: "Download for offline use" })
  await requestPack.click()
  await expect(page.getByRole("heading", { name: "This offline action stopped" }))
    .toBeFocused()
  await expect(page.getByText("Go online before downloading or updating.")).toBeVisible()
  await expect(page.getByRole("status")).toContainText(
    "Update failed — your old copy, if you had one, still works."
  )
  expect(await readPacks(page)).toEqual(before.packs)
  expect(await readStoreRecords(page, appDatabaseStores.offlinePackOperations))
    .toEqual(before.operations)
  expect(await page.evaluate(() => caches.keys())).toEqual(before.cacheNames)
  expect(await page.evaluate(async ({ cacheName, path }) => {
    const cache = await caches.open(cacheName)
    return await (await cache.match(path))?.text()
  }, { cacheName: offlinePackPointerCacheName, path: offlinePackPointerPath })).toBe(prior.cacheName)
  expect(await page.evaluate(() => {
    const owner = window as typeof window & {
      __nycustodianPackMetrics?: Readonly<Record<string, number>>
    }
    return owner.__nycustodianPackMetrics
  })).toEqual({
    cacheDeletes: 0,
    cacheEntryDeletes: 0,
    cachePuts: 0,
    fetches: 0
  })

  await page.evaluate(() => {
    const owner = window as typeof window & { __nycustodianPackOnline?: boolean }
    owner.__nycustodianPackOnline = true
  })
  await requestPack.click()
  await expect(page.getByRole("status")).toContainText(
    "Download complete and checked. It is not in use yet — turn it on when you are ready.",
    { timeout: 120_000 }
  )
  const completion = page.getByRole("heading", { name: "Download checked" })
  await expect(completion).toBeVisible()
  await expect(completion).not.toBeFocused()
  const packs = await readPacks(page)
  expect(packs.find((pack) => pack.id === prior.id)?.status).toBe("active")
  expect(packs.some((pack) =>
    pack.packId === currentDescriptor.id && pack.status === "staged"))
    .toBe(true)
  expect((await readStoreRecords(page, appDatabaseStores.meta))
    .find((record) => record.id === "active-offline-pack")).toMatchObject({
      claimId: prior.id,
      generation: prior.generation
    })
  expect(await page.evaluate(() => {
    const owner = window as typeof window & {
      __nycustodianPackMetrics?: Readonly<{ readonly fetches: number }>
    }
    return owner.__nycustodianPackMetrics?.fetches ?? 0
  })).toBeGreaterThan(0)
})

test("the sole unpinned active pack can be removed with its durable pointer and cache", async ({
  browserName,
  page
}) => {
  test.skip(browserName !== "chromium", "The Cache API removal proof is Chromium-only")
  test.setTimeout(180_000)

  await page.goto("/robots.txt")
  const active = packFixture(priorPackDescriptor(), "sole-active-generation", "active", 31)
  await seedPackFixtures(page, [active], active.id)
  await page.evaluate(async ({ cacheName, pointerCacheName, pointerPath }) => {
    const cache = await caches.open(cacheName)
    await cache.put("/sole-active-marker", new Response("sole-active-bytes"))
    const pointer = await caches.open(pointerCacheName)
    await pointer.put(pointerPath, new Response(cacheName))
  }, {
    cacheName: active.cacheName,
    pointerCacheName: offlinePackPointerCacheName,
    pointerPath: offlinePackPointerPath
  })

  await page.goto("/offline/")
  const activeItem = page.getByRole("listitem").filter({
    hasText: `${active.descriptor.label} v${active.descriptor.packVersion}`
  })
  await expect(activeItem).toContainText("Ready offline")
  const remove = activeItem.getByRole("button", { name: "Preview and remove" })
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("0 saved attempt(s)")
    await dialog.accept()
  })
  await remove.click()

  await expect(activeItem).toHaveCount(0)
  const completion = page.getByRole("heading", { name: "Download removed" })
  await expect(completion).toBeVisible()
  await expect(completion).not.toBeFocused()
  await expect(page.getByRole("heading", { name: "Downloads on this device" })).toBeFocused()
  await expect(page.getByRole("status")).toContainText(
    "The download was removed. Your study history stayed on this device."
  )
  expect((await readPacks(page)).some((pack) => pack.id === active.id)).toBe(false)
  expect((await readStoreRecords(page, appDatabaseStores.meta))
    .some((record) => record.id === "active-offline-pack")).toBe(false)
  expect((await readStoreRecords(page, appDatabaseStores.offlinePackOperations))
    .find((operation) => operation.id === offlinePackOperationId("remove", active.id)))
    .toMatchObject({
      claimId: active.id,
      kind: "remove",
      phase: "complete",
      detail: null
    })
  expect(await page.evaluate(async ({ cacheName, pointerCacheName, pointerPath }) => {
    const pointer = await caches.open(pointerCacheName)
    return {
      packCachePresent: await caches.has(cacheName),
      pointer: await (await pointer.match(pointerPath))?.text()
    }
  }, {
    cacheName: active.cacheName,
    pointerCacheName: offlinePackPointerCacheName,
    pointerPath: offlinePackPointerPath
  })).toEqual({ packCachePresent: false, pointer: undefined })
})

test("trusted retirement demotes the active generation and blocks stale activation and staging", async ({
  browserName,
  page
}) => {
  test.skip(browserName !== "chromium", "The Cache API retirement proof is Chromium-only")
  test.setTimeout(300_000)

  const generated = await generatedLaunchDescriptor()
  const published = decodeOfflinePackDescriptor({
    ...generated,
    lifecycle: "published",
    publicationTime: "2026-08-25T00:00:00.000Z"
  })
  const retired = decodeOfflinePackDescriptor({ ...published, lifecycle: "retired" })
  if (published.applicationShellManifestReceipt === null) {
    throw new Error("Retirement browser fixture requires a finalized shell receipt")
  }
  const replacementShellSha = published.applicationShellManifestReceipt.sha256 === "f".repeat(64)
    ? "e".repeat(64)
    : "f".repeat(64)
  const staleShellPublished = decodeOfflinePackDescriptor({
    ...published,
    applicationShellManifestReceipt: {
      ...published.applicationShellManifestReceipt,
      sha256: replacementShellSha
    }
  })
  const active = packFixture(published, "published-before-retirement", "active", 41)
  const historicalAttempt = {
    id: `${published.releaseId}:v${published.packVersion}:retirement-history:question:1`,
    questionId,
    selectedOptionId: "pipe-wrench",
    reviewIntent: "unflagged",
    committedAt: 42,
    receipt: {
      ...questionReceipt,
      releaseId: published.releaseId,
      packVersion: published.packVersion,
      sessionId: "retirement-history"
    },
    optionIds: ["adjustable-wrench", "combination-wrench", "pipe-wrench", "slip-joint-pliers"]
  }

  await page.goto("/robots.txt")
  await seedPackFixtures(page, [active], active.id)
  await page.evaluate(async ({
    cacheName,
    databaseName,
    historicalAttempt,
    pointerCacheName,
    pointerPath,
    questionStore
  }) => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(databaseName)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const database = request.result
        const transaction = database.transaction(questionStore, "readwrite")
        transaction.objectStore(questionStore).put(historicalAttempt)
        transaction.oncomplete = () => {
          database.close()
          resolve()
        }
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)
      }
    })
    const cache = await caches.open(cacheName)
    await cache.put("/retired-history-marker", new Response("retained-history-bytes"))
    const pointer = await caches.open(pointerCacheName)
    await pointer.put(pointerPath, new Response(cacheName))
  }, {
    cacheName: active.cacheName,
    databaseName: appDatabaseName,
    historicalAttempt,
    pointerCacheName: offlinePackPointerCacheName,
    pointerPath: offlinePackPointerPath,
    questionStore: appDatabaseStores.questionAttempts
  })

  let trustedDescriptor = retired
  await routeOfflineDescriptor(page, () => trustedDescriptor)
  await page.goto("/offline/?trusted-release=retired")
  await expect(page.getByText("Retired release · English", { exact: true })).toBeVisible()
  const stored = page.getByRole("listitem").filter({
    hasText: `${active.descriptor.label} v${active.descriptor.packVersion}`
  })
  await expect(stored).toContainText("Kept for earlier sessions")
  await expect(page.getByRole("button", { name: /activate|download|retry/i })).toHaveCount(0)

  const meta = await readStoreRecords(page, appDatabaseStores.meta)
  expect(meta.some((record) => record.id === "active-offline-pack")).toBe(false)
  const retirement = meta.find((record) => record.id === offlinePackRetirementId(retired.id))
  expect(retirement).toMatchObject({
    id: offlinePackRetirementId(retired.id),
    packId: retired.id,
    releaseId: retired.releaseId,
    packVersion: retired.packVersion,
    lifecycle: "retired"
  })
  expect(retirement?.observedAt).toEqual(expect.any(Number))
  expect((retirement?.observedAt as number)).toBeGreaterThan(0)
  expect((await readPacks(page)).find((pack) => pack.id === active.id)?.status).toBe("retained")
  expect(await readStoreRecords(page, appDatabaseStores.questionAttempts)).toContainEqual(
    historicalAttempt
  )
  expect(await page.evaluate(async ({ cacheName, pointerCacheName, pointerPath }) => {
    const cache = await caches.open(cacheName)
    const pointer = await caches.open(pointerCacheName)
    return {
      history: await (await cache.match("/retired-history-marker"))?.text(),
      pointer: await (await pointer.match(pointerPath))?.text()
    }
  }, {
    cacheName: active.cacheName,
    pointerCacheName: offlinePackPointerCacheName,
    pointerPath: offlinePackPointerPath
  })).toEqual({ history: "retained-history-bytes", pointer: undefined })

  await page.evaluate(async () => {
    for (const registration of await navigator.serviceWorker.getRegistrations()) {
      await registration.unregister()
    }
  })
  trustedDescriptor = published
  await page.goto("/offline/?trusted-release=stale-activation")
  const retained = page.getByRole("listitem").filter({
    hasText: `${active.descriptor.label} v${active.descriptor.packVersion}`
  })
  await retained.getByRole("button", { name: /Turn on / }).click()
  await expect(page.getByRole("heading", { name: "This offline action stopped" }))
    .toBeFocused()
  await page.getByRole("alert").getByText("Technical details").click()
  await expect(page.getByText(/durable retirement marker/)).toBeVisible()
  expect((await readPacks(page)).find((pack) => pack.id === active.id)?.status).toBe("retained")

  await page.evaluate(async () => {
    for (const registration of await navigator.serviceWorker.getRegistrations()) {
      await registration.unregister()
    }
  })
  trustedDescriptor = staleShellPublished
  await page.goto("/offline/?trusted-release=stale-stage")
  const beforePacks = await readPacks(page)
  const beforeOperations = await readStoreRecords(page, appDatabaseStores.offlinePackOperations)
  await expect(page.getByText(/Update available/)).toBeVisible()
  await page.getByRole("button", { name: "Download the update" }).click()
  await expect(page.getByRole("heading", { name: "This offline action stopped" }))
    .toBeFocused()
  await page.getByRole("alert").getByText("Technical details").click()
  await expect(page.getByText(/durable retirement marker/)).toBeVisible()
  expect(await readPacks(page)).toEqual(beforePacks)
  expect(await readStoreRecords(page, appDatabaseStores.offlinePackOperations))
    .toEqual(beforeOperations)
  expect((await readStoreRecords(page, appDatabaseStores.meta))
    .some((record) => record.id === offlinePackRetirementId(retired.id))).toBe(true)
})

test("a quota failure during pack caching preserves the prior active generation and exposes recovery", async ({
  browserName,
  page
}) => {
  test.skip(browserName !== "chromium", "The Cache API quota proof is Chromium-only")
  test.setTimeout(300_000)

  const descriptor = await generatedLaunchDescriptor()
  const failingPath = descriptor.receipts[0]?.path
  if (failingPath === undefined) throw new Error("Quota fixture requires one content receipt")
  await page.goto("/settings/")
  await expect(page.getByText(/Default preferences are shown/)).toBeVisible()
  const prior = packFixture(priorPackDescriptor(), "quota-prior-generation", "active", 51)
  await seedPackFixtures(page, [prior], prior.id)
  await page.goto("/offline/")
  await expect(page.getByText("Prior verified pack v0")).toBeVisible()
  await page.evaluate((failingPath) => {
    const originalPut = Cache.prototype.put
    Cache.prototype.put = function(request: RequestInfo | URL, response: Response): Promise<void> {
      const path = new URL(
        typeof request === "string" || request instanceof URL ? request : request.url,
        location.origin
      ).pathname
      if (path === failingPath) {
        return Promise.reject(new DOMException("quota exhausted", "QuotaExceededError"))
      }
      return originalPut.call(this, request, response)
    }
  }, failingPath)

  await page.getByRole("button", { name: "Download for offline use" }).click()
  const errorHeading = page.getByRole("heading", { name: "This offline action stopped" })
  await expect(errorHeading).toBeFocused()
  await errorHeading.locator("..").getByText("Technical details").click()
  await expect(errorHeading.locator("..").getByText(/quota is exhausted/)).toBeVisible()
  await expect(page.getByRole("heading", { name: "Download checked" })).toHaveCount(0)
  await expect(page.getByRole("link", { name: "Remove an unused download" }))
    .toHaveAttribute("href", "#stored-packs-heading")
  await expect(page.getByRole("link", { name: "export your local records" }))
    .toHaveAttribute("href", "/settings/#export-local-data")

  const packs = await readPacks(page)
  expect(packs.find((pack) => pack.id === prior.id)?.status).toBe("active")
  const failed = packs.find((pack) =>
    pack.packId === descriptor.id && pack.status === "quarantined"
  )
  expect(failed).toMatchObject({
    packId: descriptor.id,
    status: "quarantined"
  })
  if (typeof failed?.cacheName !== "string") throw new Error("Quota failure has no cache identity")
  expect(await page.evaluate((cacheName) => caches.has(cacheName), failed.cacheName)).toBe(false)
  expect((await readStoreRecords(page, appDatabaseStores.offlinePackOperations))
    .find((operation) => operation.claimId === failed.id)).toMatchObject({
      kind: "stage",
      phase: "failed"
    })
  expect((await readStoreRecords(page, appDatabaseStores.meta))
    .find((record) => record.id === "active-offline-pack")).toMatchObject({ claimId: prior.id })
  expect(await page.evaluate(async ({ cacheName, pointerPath }) => {
    const pointer = await caches.open(cacheName)
    return await (await pointer.match(pointerPath))?.text()
  }, { cacheName: offlinePackPointerCacheName, pointerPath: offlinePackPointerPath }))
    .toBe(prior.cacheName)
})

test("an insufficient storage estimate disables pack download and exposes no-write recovery", async ({
  page
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: {
        estimate: () => Promise.resolve({ quota: 1_000, usage: 999 }),
        persist: () => Promise.resolve(false),
        persisted: () => Promise.resolve(false)
      }
    })
  })
  await page.goto("/offline/")

  await expect(page.getByText(/enough space for this download/)).toBeVisible()
  await expect(page.getByRole("button", { name: "Download for offline use" })).toBeDisabled()
  await expect(page.getByRole("link", { name: "Remove an unused download" }))
    .toHaveAttribute("href", "#stored-packs-heading")
  await expect(page.getByRole("link", { name: "export your local records" }))
    .toHaveAttribute("href", "/settings/#export-local-data")
  expect(await readPacks(page)).toEqual([])
  expect(await readStoreRecords(page, appDatabaseStores.offlinePackOperations)).toEqual([])
})

test("an exact simulation pin that commits before the removal claim blocks that claim", async ({
  page
}) => {
  test.setTimeout(180_000)
  const prepared = await createPinnedSessionTemplate(
    page,
    "pin-first-target-generation",
    "pin-first-session-seed"
  )
  const { active, target } = await makePackRemovable(page, prepared.target)
  expect(await readStoreRecords(page, appDatabaseStores.simulationSessions)).toEqual([])

  await page.goto("/offline/")
  const targetItem = page.getByRole("listitem").filter({
    hasText: `${target.descriptor.label} v${target.descriptor.packVersion}`
  })
  await expect(targetItem).toBeVisible()
  await installPinBeforeRemovalClaim(page, prepared.session)
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("0 saved attempt(s)")
    await dialog.accept()
  })
  await targetItem.getByRole("button", { name: "Preview and remove" }).click()
  await expect(page.getByRole("heading", { name: "This offline action stopped" }))
    .toBeFocused()
  await expect(page.getByText("The download could not be removed. Nothing was deleted.")).toBeVisible()
  await page.getByRole("alert").getByText("Technical details").click()
  await expect(page.getByText(/session pin/)).toBeVisible()
  await expect.poll(() => page.evaluate(() =>
    localStorage.getItem("pack-removal-pin-first"))).toBe("committed")

  const packs = await readPacks(page)
  expect(packs.find((pack) => pack.id === target.id)?.status).toBe("retained")
  expect(packs.find((pack) => pack.id === active.id)?.status).toBe("active")
  const sessions = await readStoreRecords(page, appDatabaseStores.simulationSessions)
  expect(sessions).toHaveLength(1)
  expect(sessions[0]).toMatchObject({
    id: prepared.session.id,
    schemaVersion: 2,
    status: "active",
    packClaim: { claimId: target.id }
  })
  expect((await readStoreRecords(page, appDatabaseStores.offlinePackOperations))
    .some((operation) => operation.id === offlinePackOperationId("remove", target.id))).toBe(false)
  expect((await readStoreRecords(page, appDatabaseStores.meta))
    .find((record) => record.id === "active-offline-pack")).toEqual({
      id: "active-offline-pack",
      claimId: active.id,
      packId: active.packId,
      generation: active.generation,
      contentFingerprint: active.contentFingerprint,
      shellBuildFingerprint: active.shellBuildFingerprint,
      releaseId: active.descriptor.releaseId,
      packVersion: active.descriptor.packVersion,
      activatedAt: active.activatedAt
    })
  expect(await page.evaluate((cacheName) => caches.has(cacheName), target.cacheName)).toBe(true)
})

test("a removal claim that reaches removing first rejects the queued session pin", async ({
  page
}) => {
  test.setTimeout(180_000)
  const prepared = await createPinnedSessionTemplate(
    page,
    "removal-first-target-generation",
    "removal-first-session-seed"
  )
  const { active, target } = await makePackRemovable(page, prepared.target)
  expect(await readStoreRecords(page, appDatabaseStores.simulationSessions)).toEqual([])

  await page.goto("/offline/")
  const targetItem = page.getByRole("listitem").filter({
    hasText: `${target.descriptor.label} v${target.descriptor.packVersion}`
  })
  await expect(targetItem).toBeVisible()
  await installRemovalBeforePinAttempt(page, prepared.session)
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("0 saved attempt(s)")
    await dialog.accept()
  })
  await targetItem.getByRole("button", { name: "Preview and remove" }).click()
  const completion = page.getByRole("heading", { name: "Download removed" })
  await expect(completion).toBeVisible()
  await expect(completion).not.toBeFocused()
  await expect(page.getByRole("status").filter({
    hasText: "The download was removed"
  })).toContainText("The download was removed. Your study history stayed on this device.")
  await expect(targetItem).toHaveCount(0)
  await expect.poll(() => page.evaluate(() =>
    localStorage.getItem("pack-removal-claim-first"))).toMatch(/^rejected:removing:/)

  expect((await readPacks(page)).some((pack) => pack.id === target.id)).toBe(false)
  expect(await readStoreRecords(page, appDatabaseStores.simulationSessions)).toEqual([])
  expect((await readStoreRecords(page, appDatabaseStores.offlinePackOperations))
    .find((operation) => operation.id === offlinePackOperationId("remove", target.id)))
    .toMatchObject({
      id: offlinePackOperationId("remove", target.id),
      claimId: target.id,
      packId: target.packId,
      generation: target.generation,
      contentFingerprint: target.contentFingerprint,
      shellBuildFingerprint: target.shellBuildFingerprint,
      kind: "remove",
      phase: "complete",
      detail: null
    })
  expect((await readStoreRecords(page, appDatabaseStores.meta))
    .find((record) => record.id === "active-offline-pack")).toEqual({
      id: "active-offline-pack",
      claimId: active.id,
      packId: active.packId,
      generation: active.generation,
      contentFingerprint: active.contentFingerprint,
      shellBuildFingerprint: active.shellBuildFingerprint,
      releaseId: active.descriptor.releaseId,
      packVersion: active.descriptor.packVersion,
      activatedAt: active.activatedAt
    })
  expect(await page.evaluate((cacheName) => caches.has(cacheName), target.cacheName)).toBe(false)
})

test("a staged pack is rehashed before activation and serves atlas navigation and imagery offline", async ({
  browserName,
  context,
  page
}) => {
  test.skip(browserName !== "chromium", "Playwright exposes service-worker inspection only in Chromium")
  test.setTimeout(300_000)
  const currentDescriptor = await generatedLaunchDescriptor()
  const atlasPath = "/atlas/tool/pipe-wrench/"
  const atlasImageAlternative = await generatedAtlasImageAlternative(atlasPath)

  await page.goto("/settings/")
  await expect(page.getByText(/Default preferences are shown/)).toBeVisible()
  const prior = packFixture(priorPackDescriptor(), "prior-generation", "active", 3)
  const retired = packFixture(retiredPackDescriptor(), "retired-generation", "retained", 2)
  await seedPackFixtures(page, [prior, retired], prior.id)

  await page.goto("/offline/")
  await expect(page.getByText("Prior verified pack v0")).toBeVisible()
  const retiredPack = page.getByRole("listitem").filter({
    hasText: "Retired historical pack v0"
  })
  await expect(retiredPack).toContainText("Kept for earlier sessions")
  await expect(retiredPack.getByRole("button", {
    name: /activate|download|retry/i
  })).toHaveCount(0)
  const cancelledRemoval = retiredPack.getByRole("button", { name: "Preview and remove" })
  page.once("dialog", async (dialog) => dialog.dismiss())
  await cancelledRemoval.click()
  await expect(page.getByRole("status")).toContainText(
    "Removal cancelled. Nothing changed."
  )
  await expect(cancelledRemoval).toBeFocused()

  await page.getByRole("button", { name: "Download for offline use" }).click()
  await expect(page.getByText(/Download complete and checked/))
    .toBeVisible({ timeout: 120_000 })
  let completion = page.getByRole("heading", { name: "Download checked" })
  await expect(completion).toBeVisible()
  await expect(completion).not.toBeFocused()
  const activate = page.getByRole("button", { name: "Turn on this download" })
  await expect(activate).toBeVisible()

  let packs = await readPacks(page)
  const currentClaim = packs.find((pack) =>
    pack.packId === currentDescriptor.id && pack.status === "staged"
  )
  const currentCacheName = currentClaim?.cacheName
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
  await expect(page.getByRole("heading", { name: "This offline action stopped" })).toBeVisible()
  packs = await readPacks(page)
  expect(packs.find((pack) => pack.id === prior.id)?.status).toBe("active")
  expect(packs.find((pack) => pack.id === currentClaim?.id)?.status).toBe("quarantined")
  expect(await page.evaluate((cacheName) => caches.has(cacheName), currentCacheName)).toBe(false)

  await page.getByRole("button", { name: "Retry the download" }).first().click()
  await expect(page.getByText(/Download complete and checked/))
    .toBeVisible({ timeout: 120_000 })
  completion = page.getByRole("heading", { name: "Download checked" })
  await expect(completion).toBeVisible()
  await expect(completion).not.toBeFocused()
  packs = await readPacks(page)
  const replacement = packs.find((pack) =>
    pack.packId === currentDescriptor.id && pack.status === "staged"
  )
  const replacementCacheName = replacement?.cacheName
  if (typeof replacementCacheName !== "string") throw new Error("Restaged pack has no cache namespace")
  expect(replacementCacheName).not.toBe(currentCacheName)
  await activate.click()
  await expect(page.getByText(/now in use for new sessions/)).toBeVisible()
  completion = page.getByRole("heading", { name: "Offline copy turned on" })
  await expect(completion).toBeVisible()
  await expect(completion).not.toBeFocused()
  packs = await readPacks(page)
  expect(packs.find((pack) => pack.id === prior.id)?.status).toBe("retained")
  expect(packs.find((pack) => pack.id === replacement?.id)?.status).toBe("active")
  await expect(page.getByRole("button", {
    name: "Turn on Prior verified pack version 0"
  })).toHaveCount(0)
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
    expect(dialog.message()).toContain("1 saved attempt(s)")
    await dialog.accept()
  })
  const priorPack = page.getByRole("listitem").filter({ hasText: "Prior verified pack v0" })
  await priorPack.getByRole("button", { name: "Preview and remove" }).click()
  await expect(priorPack).toHaveCount(0)
  completion = page.getByRole("heading", { name: "Download removed" })
  await expect(completion).toBeVisible()
  await expect(completion).not.toBeFocused()
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
  await page.goto(atlasPath, { waitUntil: "domcontentloaded" })
  await expect(page.getByRole("heading", { name: "Pipe wrench", exact: true })).toBeVisible()
  const image = page.getByRole("img", { name: atlasImageAlternative, exact: true })
  await expect(image).toBeVisible()
  expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0)
})
