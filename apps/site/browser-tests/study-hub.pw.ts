import { expect, test } from "@playwright/test"
import { appDatabaseName, appDatabaseStores } from "../src/study-storage/app-database.ts"
import type { StudyBootstrap } from "../src/study/model.ts"

test("a storage read failure is shown as unavailable rather than a new learner", async ({ page }) => {
  await page.addInitScript(() => {
    IDBFactory.prototype.open = () => { throw new DOMException("Storage unavailable", "InvalidStateError") }
  })
  await page.goto("/practice/")
  await expect(page.getByRole("heading", { name: "Your saved progress could not be read", exact: true })).toBeFocused()
  await expect(page.locator(".study-hero .figure-strip")).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "No saved activity in this release yet", exact: true })).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "Saved activity could not be read", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Retry reading progress", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Your saved progress could not be read", exact: true })).toBeFocused()
})

test("saved activity expands and filters with keyboard focus on an empty result", async ({ page }) => {
  await page.goto("/practice/")
  await expect(page.getByRole("heading", { name: "No saved activity in this release yet" })).toBeVisible()
  await page.evaluate(({ databaseName, storeName }) => new Promise<void>((resolve, reject) => {
    const data = document.querySelector("#study-bootstrap-data")?.textContent
    if (!data) throw new Error("Missing study fixture bootstrap")
    const bootstrap = JSON.parse(data) as StudyBootstrap
    const open = indexedDB.open(databaseName)
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const database = open.result
      const transaction = database.transaction(storeName, "readwrite")
      const store = transaction.objectStore(storeName)
      bootstrap.reviewQueue.questions.slice(0, 12).forEach((source, index) => {
        const receipt = source.receipt
        store.put({
          id: `${receipt.releaseId}:v${receipt.packVersion}:${receipt.sessionId}:question:${receipt.position}`,
          questionId: source.id,
          selectedOptionId: source.optionIds[0],
          reviewIntent: "flagged",
          committedAt: Date.UTC(2026, 7, 20 + index),
          receipt,
          optionIds: source.optionIds
        })
      })
      transaction.oncomplete = () => { database.close(); resolve() }
      transaction.onerror = () => { database.close(); reject(transaction.error) }
      transaction.onabort = () => { database.close(); reject(transaction.error) }
    }
  }), { databaseName: appDatabaseName, storeName: appDatabaseStores.questionAttempts })
  await page.reload()
  const history = page.getByRole("region", { name: "Recent activity" })
  await expect(history.getByRole("listitem")).toHaveCount(6)
  await history.getByRole("button", { name: "Show all", exact: true }).click()
  await expect(history.getByRole("listitem")).toHaveCount(12)
  await history.getByRole("button", { name: "Show fewer", exact: true }).click()
  await expect(history.getByRole("listitem")).toHaveCount(6)
  await history.getByRole("tab", { name: /Hazards\s*0/ }).click()
  await expect(history.getByRole("heading", { name: "No hazards in this history" })).toBeFocused()
  await history.getByRole("button", { name: "Show all activity", exact: true }).click()
  await expect(history.getByRole("listitem")).toHaveCount(6)
  await history.getByRole("tab", { name: /All activity\s*12/ }).focus()
  await page.keyboard.press("ArrowRight")
  await expect(history.getByRole("tab", { name: /Questions\s*12/ })).toBeFocused()
  await expect(history.getByRole("tab", { name: /Questions\s*12/ })).toHaveAttribute("aria-selected", "true")
})

test("a generated practice answer appears in Study and can be durably finished in Review", async ({ page }) => {
  await page.goto("/practice/")
  await expect(page.getByRole("heading", { name: "No saved activity in this release yet" })).toBeVisible()
  const firstPractice = page.locator("[data-study-hub] .study-hero a.button-primary")
  await expect(page.getByRole("heading", { name: "Start with a set of 45.", exact: true })).toBeVisible()
  await expect(firstPractice).toHaveText("Start a 45-question set")
  const sessionPath = await firstPractice.getAttribute("href")
  expect(sessionPath).toMatch(/^\/practice\/session\/ps-[a-z0-9]+\/question\/1\/$/)
  await firstPractice.click()
  await expect(page.getByRole("button", { name: "Flag for review", exact: true })).toBeEnabled()
  await page.getByRole("button", { name: "Flag for review", exact: true }).click()
  await page.getByRole("radio").first().check()
  await page.getByRole("button", { name: "Save answer", exact: true }).click()
  await expect(page.locator(".feedback-rationales")).toBeVisible()

  await page.goto("/practice/")
  await expect(page.getByRole("heading", { name: "Keep building your practice." })).toBeVisible()
  const history = page.getByRole("region", { name: "Recent activity" })
  await expect(history.getByRole("listitem")).toHaveCount(1)
  await expect(history).toContainText("Answer saved · flagged")
  await expect(history.getByRole("link", { name: /Open saved feedback/ })).toHaveAttribute("href", sessionPath!)

  await page.goto("/review/")
  await expect(page.getByRole("heading", { name: "1 item to review", exact: true })).toBeVisible()
  await page.getByRole("tab", { name: /Flagged\s*1/, exact: true }).click()
  await expect(page.getByRole("link", { name: "Read explanation", exact: true })).toHaveAttribute("href", sessionPath!)
  await page.getByRole("link", { name: "Read explanation", exact: true }).click()
  await expect(page.locator(".feedback-rationales")).toBeVisible()
  await page.goto("/review/")
  await expect(page.getByRole("heading", { name: "1 item to review", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Finish review", exact: true }).click()
  await expect(page.getByRole("heading", { name: "Finish this review?", exact: true })).toBeFocused()
  await expect(page.getByRole("heading", { name: "1 item to review", exact: true })).toBeVisible()
  await expect(page.getByRole("region", { name: "Review history" })).toContainText("No finished reviews yet")
  await page.getByRole("button", { name: "Keep in review", exact: true }).click()
  await expect(page.getByRole("button", { name: "Finish review", exact: true })).toBeFocused()
  await page.reload()
  await expect(page.getByRole("heading", { name: "1 item to review", exact: true })).toBeVisible()
  await page.getByRole("button", { name: "Finish review", exact: true }).click()
  await page.getByRole("button", { name: "Confirm finish review", exact: true }).click()
  await expect(page.getByRole("heading", { name: "No review items are ready", exact: true })).toBeFocused()
  await expect(page.getByRole("region", { name: "Review history" })).toContainText("Review finished")
  await page.reload()
  await expect(page.getByRole("heading", { name: "No review items are ready", exact: true })).toBeVisible()
  await expect(page.getByRole("region", { name: "Review history" }).getByRole("listitem")).toHaveCount(1)
})
