import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { expect, test, type BrowserContext, type Page } from "@playwright/test"
import {
  appDatabaseName,
  appDatabaseVersion,
  appDatabaseStores
} from "../src/study-storage/app-database.ts"
import {
  verifiedContentCacheKey,
  verifiedContentCacheName
} from "../src/verified-content.ts"
import { retainedImageMimeType } from "../src/retained-image.ts"
import {
  decodeGeneratedOfflinePackDescriptor,
  offlinePackCacheName,
  offlinePackClaimId,
  offlinePackContentFingerprintSource,
  offlinePackRetirementId,
  offlinePackShellBuildFingerprintSource
} from "../src/offline-packs/model.ts"

interface SimulationResultReceipt {
  readonly postcommitPath: string
  readonly postcommitBytes: number
  readonly postcommitSha256: string
}

interface SimulationAssetReceipt {
  readonly path: string
  readonly bytes: number
  readonly sha256: string
}

interface SeededSimulationPackClaim {
  readonly claimId: string
  readonly packId: string
  readonly generation: string
  readonly releaseId: string
  readonly packVersion: number
}

const seedActiveSimulationPack = async (
  page: Page
): Promise<SeededSimulationPackClaim> => {
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
  const generation = "browser-simulation-generation-v1"
  const claimId = offlinePackClaimId(descriptor.id, generation)
  const cacheName = offlinePackCacheName(descriptor, generation)
  const contentFingerprint = createHash("sha256")
    .update(offlinePackContentFingerprintSource(descriptor))
    .digest("hex")
  const shellBuildFingerprint = createHash("sha256")
    .update(offlinePackShellBuildFingerprintSource(descriptor))
    .digest("hex")
  const activatedAt = 1_700_000_000_000
  await page.evaluate(async ({
    activatedAt,
    cacheName,
    claimId,
    contentFingerprint,
    databaseName,
    databaseVersion,
    descriptor,
    generation,
    packStore,
    shellBuildFingerprint,
    storeNames,
    metaStore
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
        const transaction = database.transaction([metaStore, packStore], "readwrite")
        transaction.objectStore(packStore).put({
          id: claimId,
          packId: descriptor.id,
          generation,
          contentFingerprint,
          shellBuildFingerprint,
          descriptor,
          status: "active",
          cacheName,
          downloadedBytes: descriptor.estimatedDownloadBytes,
          stagedAt: activatedAt,
          verifiedAt: activatedAt,
          activatedAt,
          detail: null
        })
        transaction.objectStore(metaStore).put({
          id: "active-offline-pack",
          claimId,
          packId: descriptor.id,
          generation,
          contentFingerprint,
          shellBuildFingerprint,
          releaseId: descriptor.releaseId,
          packVersion: descriptor.packVersion,
          activatedAt
        })
        transaction.oncomplete = () => {
          database.close()
          resolve()
        }
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)
      }
    })
    await caches.open(cacheName)
  }, {
    activatedAt,
    cacheName,
    claimId,
    contentFingerprint,
    databaseName: appDatabaseName,
    databaseVersion: appDatabaseVersion,
    descriptor,
    generation,
    packStore: appDatabaseStores.offlinePacks,
    shellBuildFingerprint,
    storeNames: Object.values(appDatabaseStores),
    metaStore: appDatabaseStores.meta
  })
  return {
    claimId,
    packId: descriptor.id,
    generation,
    releaseId: descriptor.releaseId,
    packVersion: descriptor.packVersion
  }
}

const primeSimulationResultCache = async (
  page: Page
): Promise<SeededSimulationPackClaim> => {
  const raw = await page.locator("#simulation-bootstrap-data").textContent()
  if (raw === null) throw new Error("Simulation bootstrap was unavailable")
  const bootstrap = JSON.parse(raw) as {
    readonly inventory: ReadonlyArray<{ readonly receipt: SimulationResultReceipt }>
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
      const decoded = Uint8Array.from(atob(body), (character) => character.charCodeAt(0))
      await cache.put(cacheKey, new Response(decoded, {
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
  return seedActiveSimulationPack(page)
}

const primeSimulationHazardClosure = async (
  page: Page
): Promise<SeededSimulationPackClaim> => {
  const raw = await page.locator("#simulation-bootstrap-data").textContent()
  if (raw === null) throw new Error("Simulation bootstrap was unavailable")
  const bootstrap = JSON.parse(raw) as {
    readonly hazards: ReadonlyArray<{
      readonly visualReceipt: SimulationResultReceipt
      readonly nonvisualReceipt: SimulationResultReceipt
      readonly visualAsset: SimulationAssetReceipt
    }>
  }
  const receipts = [
    ...bootstrap.hazards.flatMap(({ nonvisualReceipt, visualReceipt }) => [
      {
        path: visualReceipt.postcommitPath,
        bytes: visualReceipt.postcommitBytes,
        sha256: visualReceipt.postcommitSha256,
        kind: "postcommit" as const
      },
      {
        path: nonvisualReceipt.postcommitPath,
        bytes: nonvisualReceipt.postcommitBytes,
        sha256: nonvisualReceipt.postcommitSha256,
        kind: "postcommit" as const
      }
    ]),
    ...bootstrap.hazards.map(({ visualAsset }) => ({
      ...visualAsset,
      kind: "asset" as const
    }))
  ]
  const unique = [...new Map(receipts.map((receipt) => [
    `${receipt.kind}:${receipt.path}:${receipt.sha256}`,
    receipt
  ])).values()]
  const origin = new URL(page.url()).origin
  const entries = await Promise.all(unique.map(async (receipt) => {
    const bytes = await readFile(fileURLToPath(new URL(`../dist${receipt.path}`, import.meta.url)))
    if (bytes.byteLength !== receipt.bytes) {
      throw new Error(`Browser fixture bytes do not match ${receipt.path}`)
    }
    return {
      body: bytes.toString("base64"),
      cacheKey: verifiedContentCacheKey(origin, receipt),
      contentType: receipt.kind === "postcommit"
        ? "application/json"
        : retainedImageMimeType(receipt.path),
      receipt
    }
  }))
  await page.evaluate(async ({ cacheName, entries }) => {
    const cache = await caches.open(cacheName)
    await Promise.all(entries.map(async ({ body, cacheKey, contentType, receipt }) => {
      const decoded = Uint8Array.from(atob(body), (character) => character.charCodeAt(0))
      await cache.put(cacheKey, new Response(decoded, {
        headers: {
          "content-type": contentType,
          "x-nycustodian-verified-bytes": String(receipt.bytes),
          "x-nycustodian-verified-kind": receipt.kind,
          "x-nycustodian-verified-path": receipt.path,
          "x-nycustodian-verified-protocol": "1",
          "x-nycustodian-verified-sha256": receipt.sha256
        },
        status: 200
      }))
    }))
  }, { cacheName: verifiedContentCacheName, entries })
  return seedActiveSimulationPack(page)
}

const readStore = (
  page: Page,
  storeName: string
): Promise<ReadonlyArray<Readonly<Record<string, unknown>>>> =>
  page.evaluate(
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

const retireActiveSimulationPack = (page: Page): Promise<void> => page.evaluate(
  ({ databaseName, metaStore, packStore }) => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(databaseName)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction([metaStore, packStore], "readwrite")
      const packs = transaction.objectStore(packStore)
      const records = packs.getAll()
      records.onerror = () => reject(records.error)
      records.onsuccess = () => {
        const active = records.result.find((record) => record.status === "active")
        if (active === undefined) {
          transaction.abort()
          reject(new Error("No active simulation pack was available to retire"))
          return
        }
        packs.put({ ...active, status: "retained" })
        const meta = transaction.objectStore(metaStore)
        meta.put({
          id: `offline-pack-retirement:${encodeURIComponent(active.packId)}`,
          packId: active.packId,
          releaseId: active.descriptor.releaseId,
          packVersion: active.descriptor.packVersion,
          lifecycle: "retired",
          observedAt: Date.now()
        })
        meta.delete("active-offline-pack")
      }
      transaction.oncomplete = () => {
        database.close()
        resolve()
      }
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error ?? new Error("Retirement aborted"))
    }
  }),
  {
    databaseName: appDatabaseName,
    metaStore: appDatabaseStores.meta,
    packStore: appDatabaseStores.offlinePacks
  }
)

const expireSimulationTimer = (
  page: Page,
  autoSubmit: boolean
): Promise<void> => page.evaluate(
  ({ databaseName, sessionsStore, autoSubmit }) => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(databaseName)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction(sessionsStore, "readwrite")
      const store = transaction.objectStore(sessionsStore)
      const records = store.getAll()
      records.onerror = () => reject(records.error)
      records.onsuccess = () => {
        const record = records.result[0]
        if (record === undefined) {
          transaction.abort()
          reject(new Error("No simulation session to expire"))
          return
        }
        store.put({
          ...record,
          createdAt: Date.now() - 5_000,
          timing: {
            ...record.timing,
            mode: "timed",
            durationSeconds: 1,
            autoSubmit
          }
        })
      }
      transaction.oncomplete = () => {
        database.close()
        resolve()
      }
      transaction.onerror = () => reject(transaction.error)
      transaction.onabort = () => reject(transaction.error)
    }
  }),
  { databaseName: appDatabaseName, sessionsStore: appDatabaseStores.simulationSessions, autoSubmit }
)

const observeHazardAnswerReads = (context: BrowserContext): Promise<unknown> =>
  context.addInitScript(
    ({ databaseName, submissionsStore }) => {
      const durableSubmissionExists = () => new Promise<boolean>((resolve) => {
        const request = indexedDB.open(databaseName)
        request.onerror = () => resolve(false)
        request.onsuccess = () => {
          const database = request.result
          if (!database.objectStoreNames.contains(submissionsStore)) {
            database.close()
            resolve(false)
            return
          }
          const transaction = database.transaction(submissionsStore, "readonly")
          const records = transaction.objectStore(submissionsStore).getAll()
          records.onsuccess = () => resolve(records.result.some(
            (record) => record.status === "submitted" || record.status === "evaluated"
          ))
          records.onerror = () => resolve(false)
          transaction.oncomplete = () => database.close()
        }
      })
      const originalArrayBuffer = Response.prototype.arrayBuffer
      Object.defineProperty(Response.prototype, "arrayBuffer", {
        configurable: true,
        value: async function(this: Response): Promise<ArrayBuffer> {
          const path = this.headers.get("x-nycustodian-verified-path")
          if (path?.includes("/scenes/") && path.endsWith(".postcommit.json")) {
            const observations = JSON.parse(
              localStorage.getItem("simulation-hazard-durable-at-answer-read") ?? "[]"
            ) as Array<boolean>
            observations.push(await durableSubmissionExists())
            localStorage.setItem(
              "simulation-hazard-durable-at-answer-read",
              JSON.stringify(observations)
            )
          }
          return originalArrayBuffer.call(this)
        }
      })
    },
    { databaseName: appDatabaseName, submissionsStore: appDatabaseStores.simulationSubmissions }
  )

test("builds a deterministic-capacity simulation, restores edits, and commits before reveal", async ({
  browserName,
  context,
  page
}) => {
  const postcommitRequests: Array<string> = []
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname
    if (pathname.endsWith(".postcommit.json")) postcommitRequests.push(pathname)
  })
  await context.addInitScript(
    ({ databaseName, submissionsStore }) => {
      const durableSubmissionExists = () => new Promise<boolean>((resolve) => {
        const request = indexedDB.open(databaseName)
        request.onerror = () => resolve(false)
        request.onsuccess = () => {
          const database = request.result
          if (!database.objectStoreNames.contains(submissionsStore)) {
            database.close()
            resolve(false)
            return
          }
          const transaction = database.transaction(submissionsStore, "readonly")
          const records = transaction.objectStore(submissionsStore).getAll()
          records.onsuccess = () => resolve(
            records.result.some((record) => record.status === "submitted" || record.status === "evaluated")
          )
          records.onerror = () => resolve(false)
          transaction.oncomplete = () => database.close()
        }
      })
      const remember = (key: string, durable: boolean): void => {
        const observations = JSON.parse(localStorage.getItem(key) ?? "[]") as Array<boolean>
        observations.push(durable)
        localStorage.setItem(key, JSON.stringify(observations))
      }
      const originalFetch = window.fetch.bind(window)
      const observedFetch = async (...args: Parameters<typeof window.fetch>) => {
        const input = args[0]
        const url = typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url
        if (url.includes("/questions/") && url.endsWith(".postcommit.json")) {
          remember(
            "simulation-durable-states-at-postcommit-fetch",
            await durableSubmissionExists()
          )
        }
        return originalFetch(...args)
      }
      Object.defineProperty(window, "fetch", { configurable: true, value: observedFetch })
      const originalArrayBuffer = Response.prototype.arrayBuffer
      Object.defineProperty(Response.prototype, "arrayBuffer", {
        configurable: true,
        value: async function(this: Response): Promise<ArrayBuffer> {
          const path = this.headers.get("x-nycustodian-verified-path")
          if (path?.includes("/questions/") && path.endsWith(".postcommit.json")) {
            remember(
              "simulation-durable-states-at-postcommit-read",
              await durableSubmissionExists()
            )
          }
          return originalArrayBuffer.call(this)
        }
      })
    },
    { databaseName: appDatabaseName, submissionsStore: appDatabaseStores.simulationSubmissions }
  )
  await page.goto("/simulations/")
  await expect(page.getByRole("heading", { name: "Create a site-designed practice simulation." })).toBeVisible()
  await expect(page.getByLabel("Profile")).toHaveValue("nys-entry-level-custodians-janitors")
  await expect(page.getByLabel("Profile").locator("option")).not.toHaveCount(0)
  const serializedBootstrap = await page.locator("#simulation-bootstrap-data").textContent()
  if (serializedBootstrap === null) throw new Error("Simulation bootstrap was unavailable")
  expect(serializedBootstrap).not.toContain("correctOptionId")
  expect(serializedBootstrap).not.toContain("rationales")
  expect(serializedBootstrap).not.toContain('"sources"')
  const bootstrap = JSON.parse(serializedBootstrap) as {
    readonly schemaVersion: number
    readonly advertisedLengths: ReadonlyArray<number>
    readonly inventory: ReadonlyArray<{ readonly question: { readonly id: string } }>
    readonly profiles: ReadonlyArray<{
      readonly id: string
      readonly version: number
      readonly compatibilityKey: string
    }>
  }
  expect(bootstrap.schemaVersion).toBe(2)
  expect(bootstrap.advertisedLengths).toEqual([45, 60, 90])
  expect(bootstrap.inventory).toHaveLength(90)
  expect(new Set(bootstrap.inventory.map(({ question }) => question.id)).size).toBe(90)
  const selectedProfile = bootstrap.profiles.find(
    ({ id }) => id === "nys-entry-level-custodians-janitors"
  )
  if (selectedProfile === undefined) throw new Error("Default simulation profile was unavailable")
  const activePackClaim = await primeSimulationResultCache(page)
  const lengthGroup = page.getByRole("group", { name: "Set length" })
  for (const advertisedLength of bootstrap.advertisedLengths) {
    await expect(lengthGroup.getByRole("radio", {
      name: new RegExp(`^${advertisedLength} items`)
    })).toBeEnabled()
  }
  await expect(lengthGroup.getByRole("radio", { name: /^90 items/ })).toBeChecked()
  await expect(page.getByRole("radio", { name: "Visual hazard scenes" })).toBeEnabled()
  await expect(page.getByRole("radio", { name: "Nonvisual zoned hazard equivalents" })).toBeEnabled()

  const contentMix = page.getByRole("group", { name: "Content mix" })
  const categoryOptions = (await contentMix.getByRole("checkbox").evaluateAll((elements) =>
    elements.map((element) => {
      const input = element as HTMLInputElement
      return {
        checked: input.checked,
        label: input.labels?.[0]?.textContent?.replace(/\s+/g, " ").trim() ?? ""
      }
    })
  )).map(({ checked, label }) => {
    const match = label.match(/^(.+) \((\d+) unique items?\)$/)
    if (match?.[1] === undefined || match[2] === undefined) {
      throw new Error(`Unexpected simulation category label: ${label}`)
    }
    return {
      accessibleName: label,
      category: match[1],
      checked,
      count: Number(match[2])
    }
  })
  expect(categoryOptions).not.toHaveLength(0)
  expect(categoryOptions.every(({ checked }) => checked)).toBe(true)
  expect(categoryOptions.reduce((total, { count }) => total + count, 0)).toBe(90)
  const smallestAdvertisedLength = Math.min(...bootstrap.advertisedLengths)
  const filteredCategory = [...categoryOptions]
    .filter(({ count }) => count < smallestAdvertisedLength)
    .sort((left, right) => left.count - right.count || left.category.localeCompare(right.category))[0]
  if (filteredCategory === undefined) {
    throw new Error("No category below the smallest advertised simulation length was available")
  }
  for (const option of categoryOptions) {
    if (option.accessibleName !== filteredCategory.accessibleName) {
      await contentMix.getByRole("checkbox", {
        name: option.accessibleName,
        exact: true
      }).uncheck()
    }
  }
  const category = contentMix.getByRole("checkbox", {
    name: filteredCategory.accessibleName,
    exact: true
  })
  await expect(category).toBeChecked()
  await expect(contentMix).toContainText(
    `Available unique items for selected mix: ${filteredCategory.count}`
  )
  for (const advertisedLength of bootstrap.advertisedLengths) {
    await expect(lengthGroup.getByRole("radio", {
      name: new RegExp(`^${advertisedLength} items`)
    })).toBeDisabled()
  }
  await expect(lengthGroup.getByRole("radio", {
    name: new RegExp(`^${filteredCategory.count} items`)
  })).toBeChecked()

  await category.uncheck()
  await expect(page.getByText("Select at least one content category to create a simulation.")).toBeVisible()
  await expect(page.getByRole("button", { name: "Start simulation" })).toBeDisabled()
  await category.check()

  await page.getByLabel("Timed practice").check()
  await page.getByLabel("Practice duration (minutes)").fill("120")
  await page.getByLabel("Start with timer hidden").check()
  await expect(page.getByLabel("Strictly auto-submit when practice time expires")).not.toBeChecked()

  await page.locator("details", { has: page.getByLabel("Set code (seed)") }).evaluate((node) => { (node as HTMLDetailsElement).open = true })
  await page.getByLabel("Set code (seed)").fill("browser-restoration-seed")
  await page.getByRole("button", { name: "Start simulation" }).click()
  await expect(page).toHaveURL(/\/simulations\/session\/sim-[a-z0-9-]+\/question\/1\/$/)
  expect(postcommitRequests).toEqual([])
  expect(await page.evaluate(() =>
    localStorage.getItem("simulation-durable-states-at-postcommit-fetch"))).toBeNull()
  expect(await page.evaluate(() =>
    localStorage.getItem("simulation-durable-states-at-postcommit-read"))).toBeNull()
  const firstPrompt = (await page.getByRole("heading", { level: 1 }).textContent())?.trim()
  expect(firstPrompt).toBeTruthy()
  await expect(page.getByText(/^Correct answer:/)).toHaveCount(0)
  await expect(page.getByText(/Rationale/)).toHaveCount(0)
  await expect(page.locator("[data-simulation-timer-hidden]")).toBeVisible()
  await page.getByRole("button", { name: "Show timer" }).click()
  await expect(page.getByRole("button", { name: "Hide timer" })).toBeEnabled()
  await page.reload()
  await expect(page.locator("[data-simulation-timer]")).toBeVisible()

  await expireSimulationTimer(page, false)
  await page.reload()
  await expect(page.getByText(/Answers remain editable because strict auto-submit is off/)).toBeVisible()
  expect(await readStore(page, appDatabaseStores.simulationSubmissions)).toHaveLength(0)

  const firstOption = page.locator('.question-card input[type="radio"]').first()
  const selectedOption = await firstOption.evaluate((element) => ({
    id: (element as HTMLInputElement).value,
    label: (element as HTMLInputElement).labels?.[0]?.textContent
      ?.replace(/\s+/g, " ").trim() ?? ""
  }))
  expect(selectedOption.id).not.toBe("")
  expect(selectedOption.label).not.toBe("")
  await firstOption.check()
  await expect(page.getByText("Saved on this device")).toBeVisible()
  await page.getByRole("button", { name: "Flag this question" }).click()
  await expect(page.getByText("Saved on this device")).toBeVisible()
  await expect(page.getByRole("button", { name: "Flagged for review" })).toHaveAttribute("aria-pressed", "true")

  await page.reload()
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(firstPrompt ?? "")
  await expect(page.getByLabel(selectedOption.label, { exact: true })).toBeChecked()
  await expect(page.getByRole("button", { name: "Flagged for review" })).toHaveAttribute("aria-pressed", "true")

  const sessionRecords = await readStore(page, appDatabaseStores.simulationSessions)
  expect(sessionRecords).toHaveLength(1)
  expect(sessionRecords[0]).toMatchObject({
    schemaVersion: 2,
    status: "active",
    actualLength: filteredCategory.count,
    advertisedLength: filteredCategory.count,
    seed: "browser-restoration-seed",
    profile: {
      id: "nys-entry-level-custodians-janitors",
      version: selectedProfile.version,
      compatibilityKey: selectedProfile.compatibilityKey
    },
    selectedCategories: [filteredCategory.category],
    distribution: [{ label: filteredCategory.category, count: filteredCategory.count }],
    responses: [{
      selectedOptionId: selectedOption.id,
      reviewIntent: "flagged"
    }],
    timing: {
      mode: "timed",
      durationSeconds: 1,
      timerVisible: true,
      autoSubmit: false
    },
    packClaim: {
      packId: activePackClaim.packId,
      generation: activePackClaim.generation,
      releaseId: activePackClaim.releaseId,
      packVersion: activePackClaim.packVersion
    }
  })
  const durablePackClaim = sessionRecords[0]?.packClaim as {
    readonly claimId?: unknown
    readonly contentFingerprint?: unknown
    readonly shellBuildFingerprint?: unknown
  } | undefined
  expect(durablePackClaim?.claimId).toBe(activePackClaim.claimId)
  expect(durablePackClaim?.contentFingerprint).toMatch(/^[a-f0-9]{64}$/)
  expect(durablePackClaim?.shellBuildFingerprint).toMatch(/^[a-f0-9]{64}$/)

  await page.getByRole("button", { name: "Review and submit simulation" }).click()
  expect(postcommitRequests).toEqual([])
  await expect(page.getByRole("heading", { name: "Submit final answers?" })).toBeFocused()
  await page.getByRole("button", { name: "Submit final answers" }).click()
  await expect(page).toHaveURL(/\/simulations\/session\/sim-[a-z0-9-]+\/results\/$/)
  await expect(page.getByRole("heading", { name: /Practice accuracy:/ })).toBeFocused()
  await expect(page.getByText(/not an official converted score or pass prediction/i)).toBeVisible()
  await expect(page.getByText(/Elapsed time \d+ min \d+ sec/)).toBeVisible()
  await expect(page.getByRole("heading", { name: "Actual generated distribution" })).toBeVisible()
  await page.getByRole("link", { name: "Review item 1", exact: true }).click()
  await expect(page).toHaveURL(/#result-question-1$/)
  await expect(page.locator("#result-question-1")).toBeFocused()
  const observedDurableStates = await page.evaluate(() => JSON.parse(
    localStorage.getItem("simulation-durable-states-at-postcommit-read") ?? "[]"
  ) as Array<boolean>)
  expect(observedDurableStates).toHaveLength(filteredCategory.count)
  expect(observedDurableStates.every(Boolean)).toBe(true)
  expect(postcommitRequests).toEqual([])
  expect(await page.evaluate(() =>
    localStorage.getItem("simulation-durable-states-at-postcommit-fetch"))).toBeNull()
  await expect(page.locator("[data-simulation-profile-id]")).toHaveAttribute(
    "data-simulation-profile-id",
    "nys-entry-level-custodians-janitors"
  )
  await expect(page.locator("[data-simulation-profile-version]")).toHaveAttribute(
    "data-simulation-profile-version",
    String(selectedProfile.version)
  )

  const submissions = await readStore(page, appDatabaseStores.simulationSubmissions)
  expect(submissions).toHaveLength(1)
  expect(submissions[0]).toMatchObject({ status: "evaluated" })

  if (browserName === "chromium") {
    await page.context().setOffline(true)
    await page.reload()
    await expect(page.getByRole("heading", { name: /Practice accuracy:/ })).toBeVisible()
  }
})

test("trusted retirement preserves a pinned simulation but blocks every new session", async ({
  page
}) => {
  await page.goto("/simulations/")
  const activePackClaim = await primeSimulationResultCache(page)
  await page.locator("details", { has: page.getByLabel("Set code (seed)") }).evaluate((node) => { (node as HTMLDetailsElement).open = true })
  await page.getByLabel("Set code (seed)").fill("before-retirement")
  await page.getByRole("button", { name: "Start simulation" }).click()
  await expect(page).toHaveURL(/\/simulations\/session\/sim-[a-z0-9-]+\/question\/1\/$/)
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()

  await retireActiveSimulationPack(page)
  await page.reload()

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  const packs = await readStore(page, appDatabaseStores.offlinePacks)
  expect(packs).toHaveLength(1)
  expect(packs[0]?.status).toBe("retained")
  const meta = await readStore(page, appDatabaseStores.meta)
  expect(meta.some((record) => record.id === "active-offline-pack")).toBe(false)
  expect(meta).toContainEqual(expect.objectContaining({
    id: offlinePackRetirementId(activePackClaim.packId),
    lifecycle: "retired",
    packId: activePackClaim.packId,
    releaseId: activePackClaim.releaseId,
    packVersion: activePackClaim.packVersion
  }))

  await page.goto("/simulations/")
  await page.locator("details", { has: page.getByLabel("Set code (seed)") }).evaluate((node) => { (node as HTMLDetailsElement).open = true })
  await page.getByLabel("Set code (seed)").fill("after-retirement")
  await page.getByRole("button", { name: "Start simulation" }).click()

  await expect(page.getByRole("heading", { name: "Simulation was not created" }))
    .toBeFocused()
  await expect(page.getByRole("alert")).toContainText(/active offline-pack pointer is unavailable/i)
  expect(await readStore(page, appDatabaseStores.simulationSessions)).toHaveLength(1)
})

test("restores a visual hazard simulation and keeps evaluated feedback after pack removal", async ({
  context,
  page
}) => {
  const postcommitRequests: Array<string> = []
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname
    if (pathname.includes("/scenes/") && pathname.endsWith(".postcommit.json")) {
      postcommitRequests.push(pathname)
    }
  })
  await observeHazardAnswerReads(context)
  await page.goto("/simulations/")
  await primeSimulationHazardClosure(page)
  await page.getByRole("radio", { name: "Visual hazard scenes" }).check()
  await page.locator('input[name="simulation-length"][value="1"]').check()
  await page.locator("details", { has: page.getByLabel("Set code (seed)") }).evaluate((node) => { (node as HTMLDetailsElement).open = true })
  await page.getByLabel("Set code (seed)").fill("browser-visual-hazard")
  await expect(page.getByRole("button", { name: "Start simulation" })).toBeEnabled()
  await page.getByRole("button", { name: "Start simulation" }).click()

  await expect(page).toHaveURL(/\/simulations\/session\/sim-[a-z0-9-]+\/question\/1\/$/)
  await expect(page.locator(".hazard-player__image-layer img")).toBeVisible()
  expect(postcommitRequests).toEqual([])
  expect(await page.evaluate(() =>
    localStorage.getItem("simulation-hazard-durable-at-answer-read"))).toBeNull()

  const viewport = page.locator(".hazard-player__viewport")
  await expect(page.getByRole("button", { name: "Pan right" })).toBeDisabled()
  await page.getByRole("button", { name: "Zoom in" }).focus()
  await page.keyboard.press("Enter")
  await expect(page.getByText("125% view", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Pan right" }).focus()
  await page.keyboard.press("Enter")
  await expect.poll(() => viewport.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
  await page.getByRole("button", { name: "Pan down" }).focus()
  await page.keyboard.press("Space")
  await expect.poll(() => viewport.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
  await page.getByRole("button", { name: "Reset view" }).click()
  await expect(page.getByText("100% view", { exact: true })).toBeVisible()
  await expect.poll(() => viewport.evaluate((element) => ({
    left: element.scrollLeft,
    top: element.scrollTop
  }))).toEqual({ left: 0, top: 0 })

  await page.getByRole("button", { name: "Flag this item" }).click()
  await expect.poll(async () => {
    const sessions = await readStore(page, appDatabaseStores.simulationSessions)
    const responses = sessions[0]?.responses as ReadonlyArray<Record<string, unknown>> | undefined
    return responses?.[0]
  }).toMatchObject({
    markers: [],
    reviewIntent: "flagged",
    selectedOptionId: null,
    selectedZoneOrders: [],
    zeroHazardsConfirmed: false
  })
  await page.reload()
  await expect(page.getByRole("button", { name: "Flagged for review" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )
  await expect(page.getByRole("link", {
    name: "Hazard item 1, current, unanswered, flagged"
  })).toBeVisible()
  await expect(page.getByText("No markers placed.", { exact: true })).toBeVisible()

  await page.getByRole("button", { name: "Add marker at center" }).click()
  await expect(page.getByText("1 marker placed.")).toBeVisible()
  await expect.poll(async () => {
    const sessions = await readStore(page, appDatabaseStores.simulationSessions)
    const responses = sessions[0]?.responses as ReadonlyArray<unknown> | undefined
    return responses?.length ?? 0
  }).toBe(1)
  await page.reload()
  await expect(page.locator(".hazard-player__image-layer img")).toBeVisible()
  await expect(page.getByText("1 marker placed.")).toBeVisible()
  await expect(page.getByRole("button", { name: "Remove marker 1" })).toBeEnabled()

  await page.getByRole("button", { name: "Review and submit simulation" }).click()
  await page.getByRole("button", { name: "Submit final answers" }).click()
  await expect(page).toHaveURL(/\/simulations\/session\/sim-[a-z0-9-]+\/results\/$/)
  await expect(page.getByRole("heading", { name: /Practice accuracy:/ })).toBeFocused()
  await expect(page.getByRole("heading", { name: "Hazard practice metrics" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Marker feedback" })).toBeVisible()
  await expect(page.getByRole("heading", {
    name: "Scene explanation and complete post-submission description"
  })).toBeVisible()
  await expect(page.getByText("Reviewed scene overlay.", { exact: false })).toBeVisible()
  await expect(page.locator("[data-marker-kind]")).toHaveCount(1)
  const reviewedImage = page.locator(".hazard-result-overlay img")
  await expect(reviewedImage).toHaveAttribute("src", /^data:image\/png;base64,/)
  const reviewedImageDataUrl = await reviewedImage.getAttribute("src")
  const observations = await page.evaluate(() => JSON.parse(
    localStorage.getItem("simulation-hazard-durable-at-answer-read") ?? "[]"
  ) as Array<boolean>)
  expect(observations).toEqual([true])
  expect(postcommitRequests).toEqual([])

  const submissions = await readStore(page, appDatabaseStores.simulationSubmissions)
  const result = (submissions[0]?.results as ReadonlyArray<{
    readonly postcommit?: { readonly claim?: string }
    readonly retainedVisualAsset?: {
      readonly dataUrl?: string
      readonly receipt?: { readonly path?: string }
    }
  }> | undefined)?.[0]
  expect(result?.postcommit?.claim).toBeTruthy()
  expect(result?.retainedVisualAsset?.dataUrl).toBe(reviewedImageDataUrl)
  expect(result?.retainedVisualAsset?.receipt?.path).toBeTruthy()
  await page.evaluate((cacheName) => caches.delete(cacheName), verifiedContentCacheName)
  let currentImageRequests = 0
  await context.route(`**${result?.retainedVisualAsset?.receipt?.path ?? "missing-image"}`, async (
    route
  ) => {
    currentImageRequests += 1
    await route.fulfill({ body: "removed", status: 404 })
  })
  await page.reload()
  await expect(page.getByRole("heading", { name: /Practice accuracy:/ })).toBeVisible()
  await expect(page.getByText(result?.postcommit?.claim ?? "missing durable claim", {
    exact: true
  })).toBeVisible()
  await expect(page.locator(".hazard-result-overlay img")).toHaveAttribute(
    "src",
    reviewedImageDataUrl ?? ""
  )
  expect(postcommitRequests).toEqual([])
  expect(currentImageRequests).toBe(0)
})

test("restores a nonvisual zoned hazard simulation and its self-contained results", async ({
  context,
  page
}) => {
  const postcommitRequests: Array<string> = []
  page.on("request", (request) => {
    const pathname = new URL(request.url()).pathname
    if (pathname.includes("/scenes/") && pathname.endsWith(".postcommit.json")) {
      postcommitRequests.push(pathname)
    }
  })
  await observeHazardAnswerReads(context)
  await page.goto("/simulations/")
  await primeSimulationHazardClosure(page)
  await page.getByRole("radio", { name: "Nonvisual zoned hazard equivalents" }).check()
  await page.locator('input[name="simulation-length"][value="1"]').check()
  await page.locator("details", { has: page.getByLabel("Set code (seed)") }).evaluate((node) => { (node as HTMLDetailsElement).open = true })
  await page.getByLabel("Set code (seed)").fill("browser-nonvisual-hazard")
  await page.getByRole("button", { name: "Start simulation" }).click()

  await expect(page).toHaveURL(/\/simulations\/session\/sim-[a-z0-9-]+\/question\/1\/$/)
  await expect(page.locator(".hazard-player__image-layer img")).toHaveCount(0)
  await page.getByRole("button", { name: "Flag this item" }).click()
  await expect.poll(async () => {
    const sessions = await readStore(page, appDatabaseStores.simulationSessions)
    const responses = sessions[0]?.responses as ReadonlyArray<Record<string, unknown>> | undefined
    return responses?.[0]
  }).toMatchObject({
    markers: [],
    reviewIntent: "flagged",
    selectedOptionId: null,
    selectedZoneOrders: [],
    zeroHazardsConfirmed: false
  })
  await page.reload()
  await expect(page.getByRole("button", { name: "Flagged for review" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )
  await expect(page.getByRole("link", {
    name: "Hazard item 1, current, unanswered, flagged"
  })).toBeVisible()
  const firstZone = page.locator('.hazard-player__zones input[type="checkbox"]').first()
  await firstZone.check()
  await expect(firstZone).toBeChecked()
  await expect.poll(async () => {
    const sessions = await readStore(page, appDatabaseStores.simulationSessions)
    const responses = sessions[0]?.responses as ReadonlyArray<{
      readonly selectedZoneOrders?: ReadonlyArray<number>
    }> | undefined
    return responses?.[0]?.selectedZoneOrders ?? []
  }).toEqual([1])
  expect(postcommitRequests).toEqual([])
  expect(await page.evaluate(() =>
    localStorage.getItem("simulation-hazard-durable-at-answer-read"))).toBeNull()
  await page.reload()
  await expect(page.locator('.hazard-player__zones input[type="checkbox"]').first()).toBeChecked()

  await page.getByRole("button", { name: "Review and submit simulation" }).click()
  await page.getByRole("button", { name: "Submit final answers" }).click()
  await expect(page).toHaveURL(/\/simulations\/session\/sim-[a-z0-9-]+\/results\/$/)
  await expect(page.getByRole("heading", { name: "Hazard practice metrics" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Zone feedback" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Complete zoned text equivalent" })).toBeVisible()
  const observations = await page.evaluate(() => JSON.parse(
    localStorage.getItem("simulation-hazard-durable-at-answer-read") ?? "[]"
  ) as Array<boolean>)
  expect(observations).toEqual([true])
  expect(postcommitRequests).toEqual([])

  await page.evaluate((cacheName) => caches.delete(cacheName), verifiedContentCacheName)
  await page.reload()
  await expect(page.getByRole("heading", { name: "Zone feedback" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Complete zoned text equivalent" })).toBeVisible()
  expect(postcommitRequests).toEqual([])
})

test("does not create a session when offline result availability is not established", async ({
  context,
  page
}) => {
  const postcommitRequests: Array<string> = []
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith(".postcommit.json")) {
      postcommitRequests.push(request.url())
    }
  })
  await page.goto("/simulations/")
  await page.locator("details", { has: page.getByLabel("Set code (seed)") }).evaluate((node) => { (node as HTMLDetailsElement).open = true })
  await page.getByLabel("Set code (seed)").fill("preserved-after-closure-failure")
  await context.setOffline(true)
  await page.getByRole("button", { name: "Start simulation" }).click()

  await expect(page.getByRole("heading", { name: "Simulation was not created" })).toBeFocused()
  await expect(page.getByLabel("Set code (seed)")).toHaveValue(
    "preserved-after-closure-failure"
  )
  await expect(page).toHaveURL(/\/simulations\/$/)
  expect(await readStore(page, appDatabaseStores.simulationSessions)).toEqual([])
  expect(postcommitRequests).toEqual([])
})

test("retains an optimistic answer and flag through an IndexedDB failure and exact retry", async ({
  page
}) => {
  await page.goto("/simulations/")
  await primeSimulationResultCache(page)
  await page.locator("details", { has: page.getByLabel("Set code (seed)") }).evaluate((node) => { (node as HTMLDetailsElement).open = true })
  await page.getByLabel("Set code (seed)").fill("browser-save-retry")
  await page.getByRole("button", { name: "Start simulation" }).click()
  await expect(page).toHaveURL(/\/simulations\/session\/sim-[a-z0-9-]+\/question\/1\/$/)

  const option = page.locator(".question-card input[type=radio]").first()
  await option.check()
  await expect(page.getByText("Saved on this device")).toBeVisible()
  await page.evaluate((sessionsStore) => {
    const prototype = IDBObjectStore.prototype
    const original = prototype.put
    const injected = function(
      this: IDBObjectStore,
      value: unknown,
      key?: IDBValidKey
    ): IDBRequest<IDBValidKey> {
      const candidate = value as { readonly responses?: ReadonlyArray<unknown> }
      if (this.name === sessionsStore && (candidate.responses?.length ?? 0) > 0) {
        Object.defineProperty(prototype, "put", {
          configurable: true,
          writable: true,
          value: original
        })
        throw new DOMException("Injected local save failure", "QuotaExceededError")
      }
      return key === undefined ? original.call(this, value) : original.call(this, value, key)
    }
    Object.defineProperty(prototype, "put", {
      configurable: true,
      writable: true,
      value: injected
    })
  }, appDatabaseStores.simulationSessions)

  await page.getByRole("button", { name: "Flag this question" }).click()
  await expect(page.getByRole("heading", { name: "Response not saved" })).toBeFocused()
  await expect(option).toBeChecked()
  await expect(page.getByRole("button", { name: "Flagged for review" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )
  await page.getByRole("button", { name: "Retry this exact local save" }).click()
  await expect(page.getByText("Saved on this device")).toBeVisible()
  await page.reload()
  await expect(option).toBeChecked()
  await expect(page.getByRole("button", { name: "Flagged for review" })).toHaveAttribute(
    "aria-pressed",
    "true"
  )
})

test("strict practice auto-submit occurs only after explicit opt-in", async ({ page }) => {
  await page.goto("/simulations/")
  await primeSimulationResultCache(page)
  await page.getByLabel("Timed practice").check()
  await page.getByLabel("Practice duration (minutes)").fill("1")
  await page.getByLabel("Strictly auto-submit when practice time expires").check()
  await page.locator("details", { has: page.getByLabel("Set code (seed)") }).evaluate((node) => { (node as HTMLDetailsElement).open = true })
  await page.getByLabel("Set code (seed)").fill("browser-auto-submit")
  await page.getByRole("button", { name: "Start simulation" }).click()
  await expect(page).toHaveURL(/\/simulations\/session\/sim-[a-z0-9-]+\/question\/1\/$/)

  await expireSimulationTimer(page, true)
  await page.evaluate(() => {
    window.setTimeout(() => window.location.reload(), 0)
  })
  await expect(page).toHaveURL(/\/simulations\/session\/sim-[a-z0-9-]+\/results\/$/)
  await expect(page.getByRole("heading", { name: /Practice accuracy:/ })).toBeVisible()
  await page.reload()
  await expect(page).toHaveURL(/\/simulations\/session\/sim-[a-z0-9-]+\/results\/$/)
  await expect(page.getByRole("heading", { name: /Practice accuracy:/ })).toBeVisible()
  const submissions = await readStore(page, appDatabaseStores.simulationSubmissions)
  expect(submissions).toHaveLength(1)
  expect(submissions[0]).toMatchObject({ status: "evaluated" })
})

test("serves only scoped opaque local-product shells through Static Assets @cloudflare", async ({
  request
}) => {
  const question = await request.get("/simulations/session/sim-abcdefgh/question/2/")
  expect(question.status()).toBe(200)
  expect(await question.text()).toContain('data-route-id="simulation-player"')

  const results = await request.get("/simulations/session/sim-abcdefgh/results/")
  expect(results.status()).toBe(200)
  expect(await results.text()).toContain('data-route-id="simulation-results"')

  const print = await request.get("/print/preview/print-abcdefgh/")
  expect(print.status()).toBe(200)
  expect(await print.text()).toContain('data-route-id="print-preview"')

  const invalidPaths = [
    "/simulations/session/not-an-opaque-id/question/2/",
    "/simulations/session/sim-x/question/0/",
    "/simulations/session/sim-ABCDEFGH/question/not-a-position/",
    "/simulations/session/sim-invalid_underscore/results/",
    "/print/preview/not-an-opaque-id/",
    "/print/preview/print-x/",
    "/print/preview/print-UPPERCASE/"
  ] as const
  for (const path of invalidPaths) {
    const unknown = await request.get(path)
    expect(unknown.status(), path).toBe(404)
    expect(await unknown.text(), path).toContain('data-route-id="status"')
  }

  const head = await request.head("/simulations/session/sim-abcdefgh/question/2/")
  expect(head.status()).toBe(200)
  expect(await head.body()).toHaveLength(0)

  for (const method of ["POST", "PUT", "PATCH", "DELETE", "OPTIONS"] as const) {
    const response = await request.fetch("/simulations/session/sim-abcdefgh/question/2/", {
      data: "must-not-rewrite",
      method
    })
    expect(response.status(), method).not.toBe(200)
    expect(await response.text(), method).not.toContain('data-route-id="simulation-player"')
  }
})
