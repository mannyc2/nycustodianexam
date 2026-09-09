import { Schema } from "effect"
import { ReviewQueueBootstrap } from "../src/review/model.ts"
import { expect, test } from "@playwright/test"
import historical from "../../../content/authoring/compatibility/launch-v1-v3-review.json" with { type: "json" }
import { questionAttemptId } from "../src/attempt-receipt.ts"
import { assemblePracticeQuestions } from "../src/practice/question-set.ts"
import { practiceInventoryFromReview } from "../src/practice/review-source.ts"

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
    if (kind === "nonvisual") {
      await page.goto(`/history/launch-v1-v3${source.nonvisualItemUrl}`)
    } else {
      await page.goto("/review/")
      await page.getByRole("link", { name: "Read explanation", exact: true }).click()
    }
    await expect(page).toHaveURL(/\/history\/launch-v1-v3\//)
    await expect(page.getByRole("heading", { name: "Scene explanation and evidence", exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByRole("heading", { name: "Scene explanation and evidence", exact: true })).toBeVisible()
  })
}
