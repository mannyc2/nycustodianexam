import { expect, test, type Page } from "@playwright/test"
import {
  appDatabaseName,
  appDatabaseStores
} from "../src/study-storage/app-database.ts"
import {
  attemptId,
  questionPostcommitPath,
  questionReceipt,
  gotoReadyQuestion,
  readStoredAttempt,
  type StoredAttempt
} from "./question-player-fixtures.ts"
import { verifiedContentCacheName } from "../src/verified-content.ts"

const optionIds = [
  "a",
  "b",
  "c",
  "d"
] as const

const seedQuestionAttempt = (page: Page, attempt: StoredAttempt): Promise<void> =>
  page.evaluate(
    ({ databaseName, record, stores }) =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(databaseName, 2)
        request.onupgradeneeded = () => {
          for (const storeName of stores) {
            if (!request.result.objectStoreNames.contains(storeName)) {
              request.result.createObjectStore(storeName, { keyPath: "id" })
            }
          }
        }
        request.onerror = () => reject(request.error)
        request.onsuccess = () => {
          const database = request.result
          const transaction = database.transaction("attempts", "readwrite")
          transaction.objectStore("attempts").put(record)
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
            reject(transaction.error ?? new Error("Question attempt seed was aborted"))
          }
        }
      }),
    {
      databaseName: appDatabaseName,
      record: attempt,
      stores: Object.values(appDatabaseStores)
    }
  )

test("an exact receipt mismatch is quarantined without loading or substituting feedback", async ({
  context,
  page
}) => {
  await page.goto("/content/release/current.json")
  const mismatchedAttempt: StoredAttempt = {
    id: attemptId,
    questionId: questionReceipt.questionId,
    selectedOptionId: "a",
    reviewIntent: "flagged",
    committedAt: 1,
    receipt: {
      ...questionReceipt,
      postcommitSha256: "f".repeat(64)
    },
    optionIds
  }
  await seedQuestionAttempt(page, mismatchedAttempt)

  let postcommitRequests = 0
  await context.route(`**${questionPostcommitPath}`, async (route) => {
    postcommitRequests += 1
    await route.abort("blockedbyclient")
  })

  await page.goto("/review/")

  await expect(page.getByRole("heading", { name: "0 items to review" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Unavailable saved attempts" }))
    .toBeVisible()
  const unavailable = page.getByRole("region", { name: "Unavailable saved attempts" })
  await expect(unavailable.getByRole("listitem")).toContainText("This saved attempt can’t be displayed.")
  await expect(unavailable.getByRole("listitem")).toContainText("Jan 1, 1970")
  await expect(unavailable).not.toContainText("does not match")
  await expect(unavailable.getByRole("link")).toHaveCount(0)
  await expect(unavailable.getByRole("button")).toHaveCount(0)
  await expect(page.getByRole("link", { name: "Read explanation", exact: true })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Finish review" })).toHaveCount(0)
  expect(postcommitRequests).toBe(0)
  expect(await readStoredAttempt(page)).toEqual(mismatchedAttempt)
  await page.goto("/practice/")
  await expect(page.getByRole("region", { name: "Unavailable saved attempts" })).toContainText("This saved attempt can’t be displayed.")
  await expect(page.getByRole("heading", { name: "No saved activity in this release yet", exact: true })).toHaveCount(0)
  expect(await readStoredAttempt(page)).toEqual(mismatchedAttempt)
  expect(postcommitRequests).toBe(0)
})

test.describe("review history when feedback becomes unavailable", () => {
  // Keep the feedback failure at the network boundary in every browser engine.
  test.use({ serviceWorkers: "block" })

  test("finishing one of several reviews retains keyboard focus and unavailable feedback preserves finished history", async ({ context, page }) => {
    await gotoReadyQuestion(page)
    for (let position = 1; position <= 2; position += 1) {
      await page.getByRole("button", { name: "Flag for review", exact: true }).click()
      await page.getByRole("radio").first().check()
      await page.getByRole("button", { name: "Save answer", exact: true }).click()
      await expect(page.locator(".feedback-rationales")).toBeVisible()
      if (position === 1) await page.getByRole("link", { name: /^Next question/ }).click()
    }
    const savedAttempt = await readStoredAttempt(page)
    await page.goto("/review/")
    await expect(page.getByRole("heading", { name: "2 items to review", exact: true })).toBeVisible()
    await page.getByRole("button", { name: "Finish review", exact: true }).first().click()
    await page.getByRole("button", { name: "Confirm finish review", exact: true }).click()
    await expect(page.getByRole("heading", { name: "1 item to review", exact: true })).toBeVisible()
    await expect(page.getByRole("heading", { name: "What is ready", exact: true })).toBeFocused()
    const history = page.getByRole("region", { name: "Review history", exact: true })
    await expect(history.getByRole("listitem")).toHaveCount(1)
    await expect(history).toContainText("Review finished")
    const finishedDate = await history.locator("time").getAttribute("datetime")

    await page.evaluate((name) => caches.delete(name), verifiedContentCacheName)
    await context.route("**/*.postcommit.json", (route) => route.abort("blockedbyclient"))
    await page.reload()
    await expect(page.getByRole("region", { name: "Unavailable saved attempts", exact: true })).toBeVisible()
    await expect(history.getByRole("listitem")).toHaveCount(1)
    await expect(history).toContainText("Review finished")
    await expect(history).toContainText("Explanation unavailable")
    await expect(history.locator("time")).toHaveAttribute("datetime", finishedDate!)
    await expect(history.getByRole("link")).toHaveCount(0)
    await expect(page.getByRole("heading", { name: "No finished reviews yet", exact: true })).toHaveCount(0)
    expect(await readStoredAttempt(page)).toEqual(savedAttempt)

    await page.goto("/practice/")
    await expect(page.getByRole("region", { name: "Unavailable saved attempts", exact: true })).toBeVisible()
    await expect(page.locator(".figure-strip > div").filter({ has: page.locator("dt", { hasText: "Finished reviews" }) }).locator("dd")).toHaveText("1")
    const activity = page.getByRole("region", { name: "Recent activity", exact: true })
    await expect(activity.locator(".history-row")).toHaveCount(1)
    await expect(activity.locator(".history-row")).toContainText("Review finished")
    await expect(activity.locator(".history-row").getByRole("link")).toHaveCount(0)
  })
})
