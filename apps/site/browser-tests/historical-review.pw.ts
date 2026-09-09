import historicalV4 from "../../../content/authoring/compatibility/launch-v1-v4-review.json" with { type: "json" }
import { Schema } from "effect"
import { ReviewQueueBootstrap } from "../src/review/model.ts"
import { readFile } from "node:fs/promises"
import { expect, test, type Page } from "@playwright/test"
import historical from "../../../content/authoring/compatibility/launch-v1-v3-review.json" with { type: "json" }
import { questionAttemptId } from "../src/attempt-receipt.ts"
import { assemblePracticeQuestions } from "../src/practice/question-set.ts"
import { practiceInventoryFromReview } from "../src/practice/review-source.ts"

const roundTripSavedRecord = async (page: Page, store: string) => {
  await page.goto("/settings/")
  const downloadPromise = page.waitForEvent("download")
  await page.getByRole("button", { name: "Export a file", exact: true }).click()
  const path = await (await downloadPromise).path()
  if (path === null) throw new Error("Export download is missing")
  const buffer = await readFile(path)
  await page.evaluate(storeName => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("nycustodian-study-v1")
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction(storeName, "readwrite")
      tx.objectStore(storeName).clear()
      tx.oncomplete = () => { db.close(); resolve() }
      tx.onabort = () => { db.close(); reject(tx.error) }
    }
  }), store)
  await page.getByRole("button", { name: "Choose a file", exact: true }).click()
  await page.getByLabel("Local export JSON").setInputFiles({ name: "historical-export.json", mimeType: "application/json", buffer })
  await page.getByRole("button", { name: "Check and preview import" }).click()
  await expect(page.getByRole("heading", { name: "Import preview — nothing written yet" })).toBeVisible()
  await page.getByLabel("Apply exactly this preview without overwriting existing records").check()
  await page.getByRole("button", { name: "Apply import" }).click()
  await expect(page.getByText("Import saved: 1 added, 0 already present, 0 set aside. Existing records kept.")).toBeVisible()
  await page.goto("/practice/")
}

for (const kind of ["canonical", "preset", "custom"] as const) {
  test(`version-3 ${kind} answer opens its exact historical explanation`, async ({ page }) => {
    const decodedHistory = Schema.decodeUnknownSync(ReviewQueueBootstrap)(historical.reviewQueue)
    const inventory = decodedHistory.questions
    const custom = assemblePracticeQuestions(practiceInventoryFromReview(inventory), {
      categories: [...new Set(inventory.map(source => source.category!))], length: 45, seed: "saved-before-upgrade"
    })[0]!
    const source = kind === "canonical" ? inventory[0]! : kind === "preset" ? historical.reviewQueue.practiceQuestions[0]! : custom.source
    const receipt = kind === "custom" ? custom.receipt : source.receipt
    const id = questionAttemptId(receipt)
    await page.goto("/practice/")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await page.evaluate(async attempt => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("nycustodian-study-v1")
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const db = request.result
          const tx = db.transaction("attempts", "readwrite")
          tx.objectStore("attempts").put(attempt)
          tx.oncomplete = () => { db.close(); resolve() }
          tx.onabort = () => { db.close(); reject(tx.error) }
        }
      })
    }, { id, questionId: source.id, selectedOptionId: source.optionIds[0]!, optionIds: source.optionIds, reviewIntent: "flagged", committedAt: Date.now(), receipt })
    await roundTripSavedRecord(page, "attempts")
    const activityLink = page.getByRole("link", { name: /Open saved feedback/ })
    await expect(activityLink).toHaveAttribute("href", /^\/history\/launch-v1-v3\//)
    await activityLink.click()
    await expect(page.locator("[data-question-player]")).toHaveAttribute("data-question-attempt-id", id)
    await expect(page.getByRole("heading", { name: "Answer explanations", exact: true })).toBeVisible()
    await page.goto("/review/")
    const link = page.getByRole("link", { name: "Read explanation", exact: true })
    await expect(link).toHaveCount(1)
    await expect(link).toHaveAttribute("href", /^\/history\/launch-v1-v3\//)
    await link.click()
    await expect(page.locator("[data-question-player]")).toHaveAttribute("data-question-attempt-id", id)
    await expect(page.getByRole("heading", { name: "Answer explanations", exact: true })).toBeVisible()
    await page.reload()
    await expect(page.locator("[data-question-player]")).toHaveAttribute("data-question-attempt-id", id)
    await expect(page.getByRole("heading", { name: "Answer explanations", exact: true })).toBeVisible()
  })
}

for (const kind of ["visual", "custom", "nonvisual"] as const) {
  test(`version-3 ${kind} hazard response retains its feedback`, async ({ page }) => {
    const { assembleHazardDrill } = await import("../src/practice/hazard-set.ts")
    const { hazardAttemptId } = await import("../src/attempt-receipt.ts")
    const inventory = Schema.decodeUnknownSync(ReviewQueueBootstrap)(historical.reviewQueue).scenes
    const custom = assembleHazardDrill(inventory, { seed: "old-hazard", length: 3, mode: "visual" })[0]!
    const source = kind === "custom" ? custom.source : inventory[0]!
    const receipt = kind === "custom" ? custom.receipt : kind === "nonvisual" ? source.nonvisualReceipt : source.visualReceipt
    const id = hazardAttemptId(receipt)
    await page.goto("/practice/")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await page.evaluate(async attempt => {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("nycustodian-study-v1")
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const db = request.result
          const tx = db.transaction("hazard-attempts", "readwrite")
          tx.objectStore("hazard-attempts").put(attempt)
          tx.oncomplete = () => { db.close(); resolve() }
          tx.onabort = () => { db.close(); reject(tx.error) }
        }
      })
    }, { id, sceneId: source.scene.id, mode: receipt.mode, markers: [], selectedZoneOrders: [], zeroHazardsConfirmed: true,
      committedAt: Date.now(), receipt, allowedZoneOrders: source.scene.neutralPreAnswer.zones.map(zone => zone.order) })
    await roundTripSavedRecord(page, "hazard-attempts")
    const activityLink = page.getByRole("link", { name: /Open saved feedback/ })
    await expect(activityLink).toHaveAttribute("href", /^\/history\/launch-v1-v3\//)
    await activityLink.click()
    await expect(page.getByRole("heading", { name: "Scene explanation and evidence", exact: true })).toBeVisible()
    if (kind !== "nonvisual") {
      await page.goto("/review/")
      await page.getByRole("link", { name: "Read explanation", exact: true }).click()
    }
    await expect(page).toHaveURL(/\/history\/launch-v1-v3\//)
    await expect(page.getByRole("heading", { name: "Scene explanation and evidence", exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByRole("heading", { name: "Scene explanation and evidence", exact: true })).toBeVisible()
  })
}


test("version-4 illustrated answer keeps its original stimulus and feedback after export/import", async ({ page }) => {
  const source = historicalV4.reviewQueue.questions.find(question => question.id === "q091")!
  const id = questionAttemptId(source.receipt)
  await page.goto("/practice/")
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await page.evaluate(attempt => new Promise<void>((resolve, reject) => {
    const request = indexedDB.open("nycustodian-study-v1")
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const tx = db.transaction("attempts", "readwrite")
      tx.objectStore("attempts").put(attempt)
      tx.oncomplete = () => { db.close(); resolve() }
      tx.onabort = () => { db.close(); reject(tx.error) }
    }
  }), { id, questionId: source.id, selectedOptionId: "c", optionIds: source.optionIds,
    reviewIntent: "flagged", committedAt: Date.now(), receipt: source.receipt })
  await roundTripSavedRecord(page, "attempts")
  await page.goto("/review/")
  const link = page.getByRole("link", { name: "Read explanation", exact: true })
  await expect(link).toHaveAttribute("href", "/history/launch-v1-v4/review/session/launch-v1/item/91/")
  await link.click()
  await expect(page.getByRole("heading", { name: /Correct.*Adjustable wrench/ })).toBeVisible()
  await expect(page.locator("[data-question-player]")).toHaveAttribute("data-question-attempt-id", id)
  const original = JSON.parse(await page.locator("#question-data").textContent() ?? "null")
  const restoredReceipt = JSON.parse(await page.locator("#question-receipt-data").textContent() ?? "null")
  expect(restoredReceipt).toEqual(source.receipt)
  expect(original.version).toBe(1)
  expect(original.illustration.nonvisualEquivalent).toBeUndefined()
  await page.reload()
  await expect(page.getByRole("heading", { name: /Correct.*Adjustable wrench/ })).toBeVisible()
  await page.goto("/practice/session/launch-v1/question/91/")
  const current = JSON.parse(await page.locator("#question-data").textContent() ?? "null")
  expect(current.version).toBe(2)
  expect(current.illustration.nonvisualEquivalent.observations).toHaveLength(4)
  await expect(page.getByRole("button", { name: "Save answer", exact: true })).toBeVisible()
})
