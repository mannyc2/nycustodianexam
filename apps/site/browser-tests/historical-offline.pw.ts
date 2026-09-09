import { expect } from "@playwright/test"
import { Schema } from "effect"
import { test } from "./offline-origin-fixture.ts"
import historical from "../../../content/authoring/compatibility/launch-v1-v3-review.json" with { type: "json" }
import { ReviewQueueBootstrap } from "../src/review/model.ts"
import { questionAttemptId, hazardAttemptId } from "../src/attempt-receipt.ts"
import { assemblePracticeQuestions } from "../src/practice/question-set.ts"
import { practiceInventoryFromReview } from "../src/practice/review-source.ts"
import { assembleHazardDrill } from "../src/practice/hazard-set.ts"

test("historical custom question and hazard feedback open from a new download after origin shutdown", async ({ page, offlineOrigin }) => {
  test.setTimeout(120000)
  const inventory = Schema.decodeUnknownSync(ReviewQueueBootstrap)(historical.reviewQueue)
  const question = assemblePracticeQuestions(practiceInventoryFromReview(inventory.questions), {
    categories: [...new Set(inventory.questions.map(source => source.category!))], length: 45, seed: "before-upgrade-offline"
  })[0]!
  const hazard = assembleHazardDrill(inventory.scenes, { seed: "before-upgrade-offline", length: 3, mode: "visual" })[0]!
  await page.goto(offlineOrigin.url + "/offline/")
  await page.getByRole("button", { name: /^Download (the .* copy|and check)$/ }).click()
  await expect(page.getByText(/Download complete and checked/)).toBeVisible({ timeout: 90000 })
  await page.getByRole("button", { name: /Turn on this saved copy/ }).click()
  await expect(page.getByText(/now in use for new sessions/)).toBeVisible()
  await page.goto(offlineOrigin.url + "/practice/")
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  await page.evaluate(async records => {
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.open("nycustodian-study-v1")
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const db = request.result
        const tx = db.transaction(["attempts", "hazard-attempts"], "readwrite")
        tx.objectStore("attempts").put(records.question)
        tx.objectStore("hazard-attempts").put(records.hazard)
        tx.oncomplete = () => { db.close(); resolve() }
        tx.onabort = () => { db.close(); reject(tx.error) }
      }
    })
  }, {
    question: { id: questionAttemptId(question.receipt), questionId: question.source.id, receipt: question.receipt,
      selectedOptionId: question.source.optionIds[0]!, optionIds: question.source.optionIds, reviewIntent: "flagged", committedAt: 100 },
    hazard: { id: hazardAttemptId(hazard.receipt), sceneId: hazard.source.scene.id, mode: "visual", receipt: hazard.receipt,
      markers: [], selectedZoneOrders: [], zeroHazardsConfirmed: true, committedAt: 101,
      allowedZoneOrders: hazard.source.scene.neutralPreAnswer.zones.map(zone => zone.order) }
  })
  await page.evaluate(async () => { await navigator.serviceWorker.ready })
  await page.reload()
  await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true)
  await offlineOrigin.disconnect()
  await page.goto(offlineOrigin.url + "/review/")
  const links = page.getByRole("link", { name: "Read explanation", exact: true })
  await expect(links).toHaveCount(2)
  const paths = await links.evaluateAll(nodes => nodes.map(node => (node as HTMLAnchorElement).href))
  for (const path of paths) {
    const url = new URL(path)
    expect(url.pathname).toMatch(/^\/history\/launch-v1-v3\//)
    // Different parameter order must still find the downloaded canonical HTML.
    url.searchParams.sort()
    await page.goto(url.href)
    await expect(page.getByRole("heading", { name: url.pathname.includes("/hazards/") ? "Scene explanation and evidence" : "Answer explanations", exact: true })).toBeVisible()
    await page.reload()
    await expect(page.getByRole("heading", { name: url.pathname.includes("/hazards/") ? "Scene explanation and evidence" : "Answer explanations", exact: true })).toBeVisible()
  }
})
