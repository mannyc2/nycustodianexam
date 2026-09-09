import { expect, type Page } from "@playwright/test"
import { fileURLToPath } from "node:url"
import { test } from "./offline-origin-fixture.ts"

const previousRoot = process.env.NYCUSTODIAN_PREVIOUS_RELEASE_DIST
const previousVersion = Number(process.env.NYCUSTODIAN_PREVIOUS_RELEASE_VERSION ?? 3)
const currentVersion = 5
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

// Explicit fixture input: independently retained v3 or v4 build; its descriptor is checked before use.
test(`installed version-${previousVersion} pack and saved simulation survive the version-${currentVersion} site update`, async ({ page, context, offlineOrigin }) => {
  test.skip(previousRoot === undefined, "Requires an independently retained previous release build")
  if (previousRoot === undefined) return
  expect([3, 4]).toContain(previousVersion)
  test.setTimeout(240000)
  offlineOrigin.serveRelease(previousRoot)
  await page.goto(offlineOrigin.url + "/offline/")
  expect(await page.locator("#offline-pack-descriptor").textContent()).toContain(`"packVersion":${previousVersion}`)
  await page.getByRole("button", { name: /^Download (the .* copy|and check)$/ }).click()
  await expect(page.getByText(/Download complete and checked/)).toBeVisible({ timeout: 90000 })
  await page.getByRole("button", { name: /Turn on this saved copy/ }).click()
  await expect(page.getByText(/now in use for new sessions/)).toBeVisible()
  const oldPacks = await records(page, "offline-packs")
  expect(oldPacks).toHaveLength(1)
  expect(oldPacks[0]?.status).toBe("active")
  await page.goto(offlineOrigin.url + `/practice/session/launch-v1/question/${previousVersion === 4 ? 91 : 1}/`)
  await page.getByRole("button", { name: "Flag for review", exact: true }).click()
  await page.getByRole("radio").first().check()
  await page.getByRole("button", { name: "Save answer", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Answer explanations", exact: true })).toBeVisible()
  const oldAttempts = await records(page, "attempts")
  expect(oldAttempts[0]?.receipt.packVersion).toBe(previousVersion)
  await page.goto(offlineOrigin.url + "/simulations/")
  if (previousVersion === 4) {
    await page.getByRole("group", { name: "Set length" }).getByRole("radio", { name: /^90 items/ }).check()
    await page.locator("details", { has: page.getByLabel("Set code (seed)") }).evaluate(node => { (node as HTMLDetailsElement).open = true })
    await page.getByLabel("Set code (seed)").fill("nonvisual-simulation")
  }
  await page.getByRole("button", { name: "Start simulation", exact: true }).click()
  await expect(page).toHaveURL(/\/simulations\/session\/sim-[a-z0-9-]+\/question\/1\/$/)
  if (previousVersion === 4) {
    const session = (await records(page, "simulation-sessions"))[0]!
    const illustrated = session.items.find((item: { question?: { id: string } }) => item.question?.id === "q091")
    expect(illustrated).toBeDefined()
    await page.goto(offlineOrigin.url + `/simulations/session/${session.id}/question/${illustrated.position}/`)
  }
  const simulationUrl = page.url()
  await page.locator('.question-card input[type="radio"]').first().check()
  await expect(page.getByText("Saved on this device", { exact: true })).toBeVisible()
  const oldSessions = await records(page, "simulation-sessions")
  expect(oldSessions[0]?.packVersion).toBe(previousVersion)
  const oldResponses = oldSessions[0]?.responses
  offlineOrigin.serveRelease(currentRoot)
  await page.evaluate(async () => { await (await navigator.serviceWorker.ready).update() })
  await expect.poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.waiting?.state)).toBe("installed")
  // Closing all controlled documents allows the browser's normal worker update.
  await page.close()
  const upgraded = await context.newPage()
  await upgraded.goto(offlineOrigin.url + "/offline/")
  await expect.poll(() => upgraded.locator("#offline-pack-descriptor").textContent()).toContain(`"packVersion":${currentVersion}`)
  await upgraded.getByRole("button", { name: /^Download (the .* copy|and check)$/ }).click()
  await expect(upgraded.getByText(/Download complete and checked/)).toBeVisible({ timeout: 90000 })
  await upgraded.getByRole("button", { name: /Turn on this saved copy/ }).click()
  await expect(upgraded.getByText(/now in use for new sessions/)).toBeVisible()
  const packs = await records(upgraded, "offline-packs")
  expect(packs.find(pack => pack.id === oldPacks[0]?.id)?.status).toBe("retained")
  expect(packs.find(pack => pack.status === "active")?.descriptor.packVersion).toBe(currentVersion)
  expect(await records(upgraded, "attempts")).toEqual(oldAttempts)
  await offlineOrigin.disconnect()
  await upgraded.goto(simulationUrl)
  await expect(upgraded.locator('.question-card input[type="radio"]').first()).toBeChecked()
  const resumed = await records(upgraded, "simulation-sessions")
  expect(resumed[0]?.packVersion).toBe(previousVersion)
  expect(resumed[0]?.items).toEqual(oldSessions[0]?.items)
  expect(resumed[0]?.responses).toEqual(oldResponses)
  expect(resumed[0]?.packClaim).toEqual(oldSessions[0]?.packClaim)
  await upgraded.getByRole("button", { name: "Review and submit simulation", exact: true }).click()
  await upgraded.getByRole("button", { name: "Submit final answers", exact: true }).click()
  await expect(upgraded).toHaveURL(/\/results\/$/)
  await expect(upgraded.getByRole("heading", { name: /^Practice accuracy:/ })).toBeVisible()
  const oldSubmission = (await records(upgraded, "simulation-submissions"))[0]
  expect(oldSubmission?.status).toBe("evaluated")
  await upgraded.goto(offlineOrigin.url + "/review/")
  await upgraded.getByRole("link", { name: "Read explanation", exact: true }).click()
  await expect(upgraded).toHaveURL(new RegExp(`/history/launch-v1-v${previousVersion}/`))
  await expect(upgraded.getByRole("heading", { name: "Answer explanations", exact: true })).toBeVisible()
  if (previousVersion === 4) {
    const original = JSON.parse(await upgraded.locator("#question-data").textContent() ?? "null")
    expect(original.id).toBe("q091")
    expect(original.version).toBe(1)
    expect(original.illustration.nonvisualEquivalent).toBeUndefined()
    await upgraded.goto(offlineOrigin.url + "/practice/session/launch-v1/question/91/")
    await upgraded.getByRole("button", { name: "Use nonvisual version", exact: true }).click()
    await upgraded.getByRole("radio", { name: "Adjustable wrench", exact: true }).check()
    await upgraded.getByRole("button", { name: "Save answer", exact: true }).click()
    await expect(upgraded.getByText("Answered using the nonvisual version.", { exact: true })).toBeVisible()
    await expect(upgraded.getByRole("heading", { name: /Correct.*Adjustable wrench/ })).toBeVisible()
    const all = await records(upgraded, "attempts")
    expect(all.find(attempt => attempt.receipt.packVersion === 4)).toEqual(oldAttempts[0])
    expect(all.find(attempt => attempt.receipt.packVersion === 5)?.presentation).toBe("nonvisual")
  }
})
