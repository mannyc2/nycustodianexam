import { expect, test, type Page } from "@playwright/test"
import {
  appDatabaseName,
  appDatabaseStores,
  legacyAppDatabaseNames
} from "../src/study-storage/app-database.ts"

const visualHazardPath = "/hazards/session/launch-v1/scene/1/"
const nonvisualHazardPath = "/hazards/session/launch-v1-nonvisual/scene/1/"
const previousAppDatabaseVersion = 2
const currentAppDatabaseVersion = 5

interface DatabaseSeed {
  readonly databaseName: string
  readonly version: number
  readonly stores: Readonly<Record<string, ReadonlyArray<Readonly<Record<string, unknown>>>>>
}

const previousAppDatabaseStores = (
  questionAttempts: ReadonlyArray<Readonly<Record<string, unknown>>> = [],
  questionSessions: ReadonlyArray<Readonly<Record<string, unknown>>> = []
): DatabaseSeed["stores"] => ({
  [appDatabaseStores.meta]: [],
  [appDatabaseStores.questionAttempts]: questionAttempts,
  [appDatabaseStores.questionSessions]: questionSessions,
  [appDatabaseStores.hazardAttempts]: [],
  [appDatabaseStores.hazardSessions]: [],
  [appDatabaseStores.reviewAcknowledgements]: []
})

const seedDatabase = (page: Page, seed: DatabaseSeed): Promise<void> =>
  page.evaluate(
    ({ databaseName, version, stores }) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(databaseName, version)
        request.onupgradeneeded = () => {
          for (const storeName of Object.keys(stores)) {
            if (!request.result.objectStoreNames.contains(storeName)) {
              request.result.createObjectStore(storeName, { keyPath: "id" })
            }
          }
        }
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const database = request.result
          const storeNames = Object.keys(stores)
          const transaction = database.transaction(storeNames, "readwrite")
          for (const storeName of storeNames) {
            const store = transaction.objectStore(storeName)
            for (const record of stores[storeName] ?? []) store.put(record)
          }
          transaction.oncomplete = () => {
            database.close()
            resolve()
          }
          transaction.onerror = () => {
            database.close()
            reject(transaction.error)
          }
          transaction.onabort = () => {
            database.close()
            reject(transaction.error ?? new Error("Database seed transaction aborted"))
          }
        }
      }),
    seed
  )

const readStore = (
  page: Page,
  storeName: string
): Promise<ReadonlyArray<Readonly<Record<string, unknown>>>> =>
  page.evaluate(
    ({ databaseName, store }) =>
      new Promise<ReadonlyArray<Readonly<Record<string, unknown>>>>((resolve, reject) => {
        const request = indexedDB.open(databaseName)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const database = request.result
          const transaction = database.transaction(store, "readonly")
          const getAll = transaction.objectStore(store).getAll()
          getAll.onsuccess = () => resolve(
            getAll.result as ReadonlyArray<Readonly<Record<string, unknown>>>
          )
          getAll.onerror = () => reject(getAll.error)
          transaction.oncomplete = () => database.close()
          transaction.onabort = () => {
            database.close()
            reject(transaction.error ?? new Error("Database read transaction aborted"))
          }
        }
      }),
    { databaseName: appDatabaseName, store: storeName }
  )

const readAppDatabaseMetadata = (
  page: Page
): Promise<Readonly<{ readonly version: number; readonly stores: ReadonlyArray<string> }>> =>
  page.evaluate(
    (databaseName) =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const database = request.result
          resolve({
            version: database.version,
            stores: Array.from(database.objectStoreNames).sort()
          })
          database.close()
        }
      }),
    appDatabaseName
  )

const holdAppDatabaseOpen = (page: Page): Promise<void> =>
  page.evaluate(
    ({ databaseName, version }) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(databaseName, version)
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          ;(window as typeof window & {
            __nycustodianBlockingDatabase?: IDBDatabase
          }).__nycustodianBlockingDatabase = request.result
          resolve()
        }
      }),
    { databaseName: appDatabaseName, version: previousAppDatabaseVersion }
  )

const closeHeldAppDatabase = (page: Page): Promise<void> =>
  page.evaluate(() => {
    const owner = window as typeof window & {
      __nycustodianBlockingDatabase?: IDBDatabase
    }
    owner.__nycustodianBlockingDatabase?.close()
    delete owner.__nycustodianBlockingDatabase
  })

const openStorageOrigin = async (page: Page): Promise<void> => {
  await page.goto("/content/release/current.json")
}

test("upgrades the pre-quarantine database and resumably imports valid legacy records", async ({
  page
}) => {
  await openStorageOrigin(page)

  const questionAttempt = {
    id: "primary:q001",
    questionId: "q001",
    selectedOptionId: "o1",
    reviewIntent: "unflagged",
    committedAt: 1
  }
  await seedDatabase(page, {
    databaseName: appDatabaseName,
    version: previousAppDatabaseVersion,
    stores: previousAppDatabaseStores(
      [questionAttempt],
      [{
        id: "active",
        latestAttemptId: questionAttempt.id,
        updatedAt: 1
      }]
    )
  })

  const hazardAttempt = {
    id: "legacy-hazard-1",
    sceneId: "s001",
    mode: "visual",
    markers: [{ id: "marker-1", x: 0.5, y: 0.5 }],
    selectedZoneOrders: [],
    zeroHazardsConfirmed: false,
    committedAt: 2
  }
  await seedDatabase(page, {
    databaseName: legacyAppDatabaseNames.hazard,
    version: 1,
    stores: {
      [appDatabaseStores.hazardAttempts]: [
        hazardAttempt,
        { id: "malformed-hazard", unexpected: true }
      ],
      [appDatabaseStores.hazardSessions]: [{
        id: "active",
        latestAttemptId: hazardAttempt.id,
        updatedAt: 2
      }]
    }
  })

  const reviewAcknowledgement = {
    id: "review:6:item-1:9:attempt-1:8:reason-1",
    itemId: "item-1",
    attemptId: "attempt-1",
    reasonIds: ["reason-1"],
    acknowledgedAt: 3
  }
  await seedDatabase(page, {
    databaseName: legacyAppDatabaseNames.review,
    version: 1,
    stores: {
      [appDatabaseStores.reviewAcknowledgements]: [reviewAcknowledgement]
    }
  })

  await page.goto(visualHazardPath)
  await expect(page.getByRole("button", { name: "Add marker at center" })).toBeEnabled()

  expect(await readStore(page, appDatabaseStores.questionAttempts)).toContainEqual(
    questionAttempt
  )
  expect(await readAppDatabaseMetadata(page)).toEqual({
    version: currentAppDatabaseVersion,
    stores: [...Object.values(appDatabaseStores)].sort()
  })
  expect(await readStore(page, appDatabaseStores.hazardAttempts)).toEqual([hazardAttempt])
  expect(await readStore(page, appDatabaseStores.reviewAcknowledgements)).toEqual([
    reviewAcknowledgement
  ])
  expect(await readStore(page, appDatabaseStores.migrationQuarantine)).toContainEqual(
    expect.objectContaining({
      sourceDatabase: legacyAppDatabaseNames.hazard,
      sourceStore: appDatabaseStores.hazardAttempts,
      targetStore: appDatabaseStores.hazardAttempts,
      reason: "invalid-source-record",
      legacyRecord: { id: "malformed-hazard", unexpected: true }
    })
  )

  const lateHazardAttempt = {
    ...hazardAttempt,
    id: "legacy-hazard-2",
    committedAt: 4,
    markers: [{ id: "marker-2", x: 0.25, y: 0.75 }]
  }
  const conflictingHazardAttempt = {
    ...hazardAttempt,
    committedAt: 5,
    markers: [{ id: "conflicting-marker", x: 0.1, y: 0.1 }]
  }
  await seedDatabase(page, {
    databaseName: legacyAppDatabaseNames.hazard,
    version: 1,
    stores: {
      [appDatabaseStores.hazardAttempts]: [
        lateHazardAttempt,
        conflictingHazardAttempt
      ],
      [appDatabaseStores.hazardSessions]: []
    }
  })

  await page.reload()
  await expect(page.getByRole("button", { name: "Add marker at center" })).toBeEnabled()
  expect(await readStore(page, appDatabaseStores.hazardAttempts)).toEqual([
    hazardAttempt,
    lateHazardAttempt
  ])
  expect(await readStore(page, appDatabaseStores.migrationQuarantine)).toContainEqual(
    expect.objectContaining({
      sourceDatabase: legacyAppDatabaseNames.hazard,
      sourceStore: appDatabaseStores.hazardAttempts,
      targetStore: appDatabaseStores.hazardAttempts,
      reason: "destination-conflict",
      legacyRecord: conflictingHazardAttempt,
      destinationRecord: hazardAttempt
    })
  )
})

test("does not create absent legacy databases while checking for migration data", async ({
  page
}) => {
  await openStorageOrigin(page)
  await page.goto(visualHazardPath)
  await expect(page.getByRole("button", { name: "Add marker at center" })).toBeEnabled()

  const databaseNames = await page.evaluate(async () => {
    if (typeof indexedDB.databases !== "function") return undefined
    return (await indexedDB.databases()).map((database) => database.name)
  })
  if (databaseNames !== undefined) {
    expect(databaseNames).not.toContain(legacyAppDatabaseNames.hazard)
    expect(databaseNames).not.toContain(legacyAppDatabaseNames.review)
  }
})

test("fails closed and reloads after an older tab blocks the database upgrade", async ({
  context,
  page
}) => {
  await openStorageOrigin(page)
  await seedDatabase(page, {
    databaseName: appDatabaseName,
    version: previousAppDatabaseVersion,
    stores: previousAppDatabaseStores()
  })

  const blockingPage = await context.newPage()
  await openStorageOrigin(blockingPage)
  await holdAppDatabaseOpen(blockingPage)

  try {
    await page.goto(nonvisualHazardPath)
    await expect(page.getByRole("heading", { name: "Study storage is unavailable" }))
      .toBeVisible({ timeout: 8_000 })

    await closeHeldAppDatabase(blockingPage)
    await page.getByRole("button", { name: "Reload scene" }).click()
    await expect(page.getByRole("checkbox").first()).toBeEnabled()
    expect(await readAppDatabaseMetadata(page)).toEqual({
      version: currentAppDatabaseVersion,
      stores: [...Object.values(appDatabaseStores)].sort()
    })
  } finally {
    if (!blockingPage.isClosed()) {
      await closeHeldAppDatabase(blockingPage).catch(() => undefined)
      await blockingPage.close()
    }
  }
})

test("reopens the shared connection after a persisted page lifecycle", async ({ page }) => {
  await page.goto(visualHazardPath)
  await expect(page.getByRole("button", { name: "Add marker at center" })).toBeEnabled()

  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true }))
    window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true }))
  })

  await page.getByRole("button", { name: "Add marker at center" }).click()
  await page.getByRole("button", { name: "Submit scene response" }).click()
  await expect(page.getByRole("heading", { name: "Scene response recorded" })).toBeFocused()
  expect(await readStore(page, appDatabaseStores.hazardAttempts)).toHaveLength(1)
})
