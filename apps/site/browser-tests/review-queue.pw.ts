import { expect, test, type Page } from "@playwright/test"
import {
  appDatabaseName,
  appDatabaseStores
} from "../src/study-storage/app-database.ts"
import {
  attemptId,
  questionPostcommitPath,
  questionReceipt,
  readStoredAttempt,
  type StoredAttempt
} from "./question-player-fixtures.ts"

const optionIds = [
  "adjustable-wrench",
  "combination-wrench",
  "pipe-wrench",
  "slip-joint-pliers"
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
    selectedOptionId: "adjustable-wrench",
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
  await expect(page.getByRole("heading", { name: "Saved attempts needing attention" }))
    .toBeVisible()
  await expect(page.getByText(
    "A saved question receipt does not match this exact released item. It was not reinterpreted.",
    { exact: true }
  )).toBeVisible()
  await expect(page.getByRole("link", { name: "Open saved feedback" })).toHaveCount(0)
  await expect(page.getByRole("button", { name: "Acknowledge review" })).toHaveCount(0)
  expect(postcommitRequests).toBe(0)
  expect(await readStoredAttempt(page)).toEqual(mismatchedAttempt)
})
