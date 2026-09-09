import { createHash } from "node:crypto"
import { expect, test, type Page } from "@playwright/test"
import {
  decodeGeneratedOfflinePackDescriptor,
  decodeOfflinePackDescriptor,
  decodeOfflinePackRecord,
  offlinePackCacheName,
  offlinePackClaimId,
  offlinePackContentFingerprintSource,
  offlinePackOperationId,
  offlinePackShellBuildFingerprintSource,
  type OfflinePackDescriptor
} from "../src/offline-packs/model.ts"
import { appDatabaseName, appDatabaseStores } from "../src/study-storage/app-database.ts"
import { canonicalJson } from "../src/settings/data-transfer.ts"
import { gotoReadyQuestion, readStoredAttempt } from "./question-player-fixtures.ts"

const readRecords = (page: Page, storeName: string): Promise<ReadonlyArray<Record<string, unknown>>> =>
  page.evaluate(({ databaseName, storeName }) => new Promise((resolve, reject) => {
    const open = indexedDB.open(databaseName)
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const database = open.result
      const transaction = database.transaction(storeName, "readonly")
      const records = transaction.objectStore(storeName).getAll()
      transaction.oncomplete = () => { database.close(); resolve(records.result) }
      transaction.onerror = () => { database.close(); reject(transaction.error) }
      transaction.onabort = () => { database.close(); reject(transaction.error) }
    }
  }), { databaseName: appDatabaseName, storeName })

test("a damaged preferences record can be deleted without losing saved answers, then autosave recovers", async ({ page }) => {
  await gotoReadyQuestion(page)
  await page.getByRole("radio").first().check()
  await page.getByRole("button", { name: "Save answer", exact: true }).click()
  await expect(page.locator(".feedback-rationales")).toBeVisible()
  const savedAttempt = await readStoredAttempt(page)
  expect(savedAttempt).toBeDefined()

  await page.evaluate(({ databaseName, storeName }) => new Promise<void>((resolve, reject) => {
    const open = indexedDB.open(databaseName)
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const database = open.result
      const transaction = database.transaction(storeName, "readwrite")
      transaction.objectStore(storeName).put({
        id: "site-preferences", schemaVersion: 1, preferredLocale: "en",
        lowDataMode: false, largeText: "damaged", reduceMotion: false, updatedAt: 1
      })
      transaction.oncomplete = () => { database.close(); resolve() }
      transaction.onerror = () => { database.close(); reject(transaction.error) }
      transaction.onabort = () => { database.close(); reject(transaction.error) }
    }
  }), { databaseName: appDatabaseName, storeName: appDatabaseStores.preferences })

  await page.goto("/settings/")
  await expect(page.getByRole("alert")).toContainText("Saved settings could not be read")
  await expect(page.getByRole("checkbox", { name: "Larger text", exact: true })).toBeDisabled()
  await page.getByRole("button", { name: "Choose what to delete", exact: true }).click()
  await page.getByLabel("What to delete").selectOption("preferences")
  await page.getByRole("button", { name: "Preview delete", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Delete preview — nothing changed yet", exact: true })).toBeFocused()
  await expect(page.getByText("1 record(s) in the selected scope will be removed.", { exact: true })).toBeVisible()
  await page.getByRole("checkbox", { name: "Delete exactly these previewed records from this device", exact: true }).check()
  await page.getByRole("button", { name: "Delete these records", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Delete complete", exact: true })).toBeVisible()
  expect(await readRecords(page, appDatabaseStores.preferences)).toEqual([])
  expect(await readStoredAttempt(page)).toEqual(savedAttempt)

  const reduceMotion = page.getByRole("checkbox", { name: "Reduce motion", exact: true })
  await expect(reduceMotion).toBeEnabled()
  await reduceMotion.check()
  await expect(page.locator(".preference-status").filter({ hasText: "Saved on this device." })).toBeVisible()
  await page.reload()
  await expect(reduceMotion).toBeChecked()
  expect(await readStoredAttempt(page)).toEqual(savedAttempt)
})

test("an imported preference survives a failed reload without allowing stale autosave", async ({ page }) => {
  await page.goto("/settings/")
  await expect(page.getByText(/Default preferences are shown/)).toBeVisible()
  const preference = {
    id: "site-preferences", schemaVersion: 1, preferredLocale: "en",
    lowDataMode: false, largeText: true, reduceMotion: true, updatedAt: 1
  }
  const payload = {
    schemaVersion: 1, exportedAt: 1, includesCorrectionDrafts: false,
    questionAttempts: [], hazardAttempts: [], reviewAcknowledgements: [],
    preferences: [preference], correctionDrafts: []
  }
  await page.getByRole("button", { name: "Choose a file", exact: true }).click()
  await page.getByLabel("Local export JSON").setInputFiles({
    name: "preferences.json", mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({
      schemaVersion: 1, format: "nycustodian-local-data", checksumAlgorithm: "SHA-256", payload,
      checksum: createHash("sha256").update(canonicalJson(payload)).digest("hex")
    }))
  })
  await page.getByRole("button", { name: "Check and preview import" }).click()
  await expect(page.getByRole("heading", { name: "Import preview — nothing written yet" })).toBeVisible()
  await page.getByLabel("Apply exactly this preview without overwriting existing records").check()
  await page.evaluate((preferenceStore) => {
    const original = IDBObjectStore.prototype.get
    IDBObjectStore.prototype.get = function(query) {
      if (this.name === preferenceStore) {
        IDBObjectStore.prototype.get = original
        throw new DOMException("Preference reload unavailable", "InvalidStateError")
      }
      return original.call(this, query)
    }
  }, appDatabaseStores.preferences)
  await page.getByRole("button", { name: "Apply import", exact: true }).click()
  await expect(page.getByRole("alert")).toContainText("Import saved. Preferences could not reload")
  const largeText = page.getByRole("checkbox", { name: "Larger text", exact: true })
  const reduceMotion = page.getByRole("checkbox", { name: "Reduce motion", exact: true })
  await expect(largeText).toBeDisabled()
  await expect(reduceMotion).toBeDisabled()
  expect(await readRecords(page, appDatabaseStores.preferences)).toEqual([preference])
  await page.reload()
  await expect(largeText).toBeEnabled()
  await expect(largeText).toBeChecked()
  await expect(reduceMotion).toBeChecked()
  await expect(page.locator("html")).toHaveAttribute("data-large-text", "")
  expect(await readRecords(page, appDatabaseStores.preferences)).toEqual([preference])
})

const packRecord = (descriptor: OfflinePackDescriptor, generation: string, status: "active" | "retained") =>
  decodeOfflinePackRecord({
    id: offlinePackClaimId(descriptor.id, generation), packId: descriptor.id, generation,
    contentFingerprint: createHash("sha256").update(offlinePackContentFingerprintSource(descriptor)).digest("hex"),
    shellBuildFingerprint: createHash("sha256").update(offlinePackShellBuildFingerprintSource(descriptor)).digest("hex"),
    descriptor, status, cacheName: offlinePackCacheName(descriptor, generation),
    downloadedBytes: descriptor.estimatedDownloadBytes, stagedAt: 1, verifiedAt: 1,
    activatedAt: 1, detail: null
  })

test("a failed second removal preview clears the first confirmation and preserves both copies", async ({ page }) => {
  await page.goto("/offline/")
  await expect(page.getByRole("heading", { name: "Nothing downloaded yet", exact: true })).toBeVisible()
  const raw = await page.locator("#offline-pack-descriptor").textContent()
  if (raw === null) throw new Error("Missing generated offline descriptor")
  const descriptor = decodeOfflinePackDescriptor(decodeGeneratedOfflinePackDescriptor(JSON.parse(raw)))
  const first = packRecord(descriptor, "preview-recovery-a", "active")
  const second = packRecord(descriptor, "preview-recovery-b", "retained")
  const records = [first, second]
  const operations = records.map((record) => ({
    id: offlinePackOperationId("activate", record.id), claimId: record.id, packId: record.packId,
    generation: record.generation, contentFingerprint: record.contentFingerprint,
    shellBuildFingerprint: record.shellBuildFingerprint, kind: "activate", phase: "complete",
    startedAt: 1, updatedAt: 1, detail: null
  }))
  const activeMeta = {
    id: "active-offline-pack", claimId: first.id, packId: first.packId, generation: first.generation,
    contentFingerprint: first.contentFingerprint, shellBuildFingerprint: first.shellBuildFingerprint,
    releaseId: descriptor.releaseId, packVersion: descriptor.packVersion, activatedAt: 1
  }
  await page.evaluate(async ({ databaseName, stores, records, operations, activeMeta }) => {
    await new Promise<void>((resolve, reject) => {
      const open = indexedDB.open(databaseName)
      open.onerror = () => reject(open.error)
      open.onsuccess = () => {
        const database = open.result
        const transaction = database.transaction([stores.offlinePacks, stores.offlinePackOperations, stores.meta], "readwrite")
        for (const record of records) transaction.objectStore(stores.offlinePacks).put(record)
        for (const operation of operations) transaction.objectStore(stores.offlinePackOperations).put(operation)
        transaction.objectStore(stores.meta).put(activeMeta)
        transaction.oncomplete = () => { database.close(); resolve() }
        transaction.onerror = () => { database.close(); reject(transaction.error) }
        transaction.onabort = () => { database.close(); reject(transaction.error) }
      }
    })
    await Promise.all(records.map((record) => caches.open(record.cacheName)))
  }, { databaseName: appDatabaseName, stores: appDatabaseStores, records, operations, activeMeta })
  await page.reload()
  const firstRow = page.locator('.pack-record-list > [data-pack-state="active"]')
  const secondRow = page.locator('.pack-record-list > [data-pack-state="retained"]')
  await expect(firstRow).toBeVisible()
  await expect(secondRow).toBeVisible()
  const before = await readRecords(page, appDatabaseStores.offlinePacks)
  const operationsBefore = await readRecords(page, appDatabaseStores.offlinePackOperations)
  await firstRow.getByRole("button", { name: "Preview removal", exact: true }).click()
  await expect(page.getByRole("button", { name: "Remove this copy", exact: true })).toBeEnabled()

  await page.evaluate(({ packs, attempts }) => {
    const original = IDBDatabase.prototype.transaction
    IDBDatabase.prototype.transaction = function(storeNames, mode, options) {
      const stores = typeof storeNames === "string" ? [storeNames] : Array.from(storeNames)
      if (mode === "readonly" && stores.includes(packs) && stores.includes(attempts)) {
        IDBDatabase.prototype.transaction = original
        throw new DOMException("Removal impact read unavailable", "InvalidStateError")
      }
      return original.call(this, storeNames, mode, options)
    }
  }, { packs: appDatabaseStores.offlinePacks, attempts: appDatabaseStores.questionAttempts })
  await secondRow.getByRole("button", { name: "Preview removal", exact: true }).click()
  await expect(page.getByRole("heading", { name: "This offline action stopped", exact: true })).toBeFocused()
  await expect(page.getByRole("alert")).toContainText("The removal preview could not be read. Nothing was removed.")
  await expect(page.getByRole("button", { name: "Remove this copy", exact: true })).toHaveCount(0)
  expect(await readRecords(page, appDatabaseStores.offlinePacks)).toEqual(before)
  expect(await readRecords(page, appDatabaseStores.offlinePackOperations)).toEqual(operationsBefore)
  expect(await page.evaluate(async (names) => Promise.all(names.map((name) => caches.has(name))), records.map((record) => record.cacheName))).toEqual([true, true])
})

test("canceling a delete preview preserves preferences and clears confirmation", async ({ page }) => {
  await page.goto("/settings/")
  const preference = page.getByRole("checkbox", { name: "Larger text", exact: true })
  await expect(preference).toBeEnabled()
  await preference.check()
  await expect(preference).toBeEnabled()
  const trigger = page.getByRole("button", { name: "Choose what to delete", exact: true })
  await trigger.click()
  await page.getByLabel("What to delete").selectOption("preferences")
  await page.getByRole("button", { name: "Preview delete", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Delete preview — nothing changed yet" })).toBeVisible()
  await page.getByLabel("Delete exactly these previewed records from this device").check()
  await page.locator("#settings-delete").getByRole("button", { name: "Cancel", exact: true }).click()
  await expect(trigger).toBeFocused()
  await expect(page.locator("#settings-delete")).toBeHidden()
  await trigger.click()
  await expect(page.getByRole("button", { name: "Delete these records", exact: true })).toHaveCount(0)
  await page.getByRole("button", { name: "Preview delete", exact: true }).click()
  await expect(page.getByLabel("Delete exactly these previewed records from this device")).not.toBeChecked()
  await expect(page.getByRole("button", { name: "Delete these records", exact: true })).toBeDisabled()
  await page.reload()
  await expect(preference).toBeChecked()
})

test("unreadable Offline storage offers references without claiming no copies exist", async ({ page }) => {
  await page.addInitScript(() => {
    indexedDB.open = () => { throw new DOMException("Storage blocked", "SecurityError") }
  })
  await page.goto("/offline/")
  await expect(page.getByRole("heading", { name: "Saved downloads could not be checked", exact: true })).toBeVisible()
  await expect(page.getByText("This does not mean there are no saved copies.", { exact: true })).toBeVisible()
  await expect(page.getByRole("button", { name: /^Download/ })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Check again", exact: true })).toBeVisible()
  await page.getByRole("link", { name: "Read tool references", exact: true }).click()
  await expect(page).toHaveURL(/\/atlas\/$/)
  await expect(page.getByRole("heading", { name: "Tool atlas", exact: true })).toBeVisible()
})
