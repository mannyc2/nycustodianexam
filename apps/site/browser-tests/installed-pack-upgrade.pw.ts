import { expect, type Page } from "@playwright/test"
import { fileURLToPath } from "node:url"
import { test } from "./offline-origin-fixture.ts"

const previousRoot = process.env.NYCUSTODIAN_PREVIOUS_RELEASE_DIST
const currentRoot = fileURLToPath(new URL("../dist/", import.meta.url))
const records = (page: Page, store: string) => page.evaluate(storeName => new Promise<Array<Record<string, any>>>((resolve, reject) => {
  const request = indexedDB.open("nycustodian-study-v1")
  request.onerror = () => reject(request.error)
  request.onsuccess = () => {
    const db = request.result
    const tx = db.transaction(storeName, "readonly")
    const read = tx.objectStore(storeName).getAll()
    read.onsuccess = () => resolve(read.result)
    read.onerror = () => reject(read.error)
    tx.oncomplete = () => db.close()
  }
}), store)

// Explicit fixture input: a build of immutable 78de1372bf360de74c7c00875789cf0e892fc8d9.
test("installed version-3 pack and saved simulation survive the version-4 site update", async ({ page, context, offlineOrigin }) => {
  test.skip(previousRoot === undefined, "Requires an independently built version-3 release")
  if (previousRoot === undefined) return
  test.setTimeout(240000)
  offlineOrigin.serveRelease(previousRoot)
  await page.goto(offlineOrigin.url + "/offline/")
  expect(await page.locator("#offline-pack-descriptor").textContent()).toContain('"packVersion":3')
  await page.getByRole("button", { name: /^Download (the .* copy|and check)$/ }).click()
  await expect(page.getByText(/Download complete and checked/)).toBeVisible({ timeout: 90000 })
  await page.getByRole("button", { name: /Turn on this saved copy/ }).click()
  await expect(page.getByText(/now in use for new sessions/)).toBeVisible()
  const oldPacks = await records(page, "offline-packs")
  expect(oldPacks).toHaveLength(1)
  expect(oldPacks[0]?.status).toBe("active")
  await page.goto(offlineOrigin.url + "/practice/session/launch-v1/question/1/")
  await page.getByRole("button", { name: "Flag for review", exact: true }).click()
  await page.getByRole("radio").first().check()
  await page.getByRole("button", { name: "Save answer", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Answer explanations", exact: true })).toBeVisible()
  const oldAttempts = await records(page, "attempts")
  expect(oldAttempts[0]?.receipt.packVersion).toBe(3)
  await page.goto(offlineOrigin.url + "/simulations/")
  await page.getByRole("button", { name: "Start simulation", exact: true }).click()
  await expect(page).toHaveURL(/\/simulations\/session\/sim-[a-z0-9-]+\/question\/1\/$/)
  const simulationUrl = page.url()
  await page.locator('.question-card input[type="radio"]').first().check()
  await expect(page.getByText("Saved on this device", { exact: true })).toBeVisible()
  const oldSessions = await records(page, "simulation-sessions")
  expect(oldSessions[0]?.packVersion).toBe(3)
  const oldResponses = oldSessions[0]?.responses
  offlineOrigin.serveRelease(currentRoot)
  await page.evaluate(async () => { await (await navigator.serviceWorker.ready).update() })
  await expect.poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.waiting?.state)).toBe("installed")
  // Closing all controlled documents allows the browser's normal worker update.
  await page.close()
  const upgraded = await context.newPage()
  await upgraded.goto(offlineOrigin.url + "/offline/")
  await expect.poll(() => upgraded.locator("#offline-pack-descriptor").textContent()).toContain('"packVersion":4')
  await upgraded.getByRole("button", { name: /^Download (the .* copy|and check)$/ }).click()
  await expect(upgraded.getByText(/Download complete and checked/)).toBeVisible({ timeout: 90000 })
  await upgraded.getByRole("button", { name: /Turn on this saved copy/ }).click()
  await expect(upgraded.getByText(/now in use for new sessions/)).toBeVisible()
  const packs = await records(upgraded, "offline-packs")
  expect(packs.find(pack => pack.id === oldPacks[0]?.id)?.status).toBe("retained")
  expect(packs.find(pack => pack.status === "active")?.descriptor.packVersion).toBe(4)
  expect(await records(upgraded, "attempts")).toEqual(oldAttempts)
  await offlineOrigin.disconnect()
  await upgraded.goto(simulationUrl)
  await expect(upgraded.locator('.question-card input[type="radio"]').first()).toBeChecked()
  const resumed = await records(upgraded, "simulation-sessions")
  expect(resumed[0]?.responses).toEqual(oldResponses)
  expect(resumed[0]?.packClaim).toEqual(oldSessions[0]?.packClaim)
  await upgraded.goto(offlineOrigin.url + "/review/")
  await upgraded.getByRole("link", { name: "Read explanation", exact: true }).click()
  await expect(upgraded).toHaveURL(/\/history\/launch-v1-v3\//)
  await expect(upgraded.getByRole("heading", { name: "Answer explanations", exact: true })).toBeVisible()
})
