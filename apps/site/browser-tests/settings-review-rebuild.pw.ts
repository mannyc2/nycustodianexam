import { expect, test, type Page } from "@playwright/test"
import { questionAttemptId, type QuestionAttemptReceipt } from "../src/attempt-receipt.ts"
import {
  appDatabaseName,
  appDatabaseStores,
  appDatabaseVersion
} from "../src/study-storage/app-database.ts"

interface EmbeddedReviewQuestion {
  readonly id: string
  readonly optionIds: readonly [string, ...Array<string>]
  readonly receipt: QuestionAttemptReceipt
}

const readStore = (
  page: Page,
  storeName: string
): Promise<ReadonlyArray<Record<string, unknown>>> => page.evaluate(
  ({ databaseName, storeName }) => new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const database = request.result
      const transaction = database.transaction(storeName, "readonly")
      const records = transaction.objectStore(storeName).getAll()
      records.onsuccess = () => resolve(records.result)
      records.onerror = () => reject(records.error)
      transaction.oncomplete = () => database.close()
      transaction.onabort = () => reject(transaction.error)
    }
  }),
  { databaseName: appDatabaseName, storeName }
)

const seedQuestionAttempt = (
  page: Page,
  source: EmbeddedReviewQuestion
): Promise<void> => page.evaluate(
  ({ databaseName, databaseVersion, record, storeName, storeNames }) =>
    new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(databaseName, databaseVersion)
      request.onupgradeneeded = () => {
        for (const name of storeNames) {
          if (!request.result.objectStoreNames.contains(name)) {
            request.result.createObjectStore(name, { keyPath: "id" })
          }
        }
      }
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const database = request.result
        const transaction = database.transaction(storeName, "readwrite")
        transaction.objectStore(storeName).put(record)
        transaction.oncomplete = () => {
          database.close()
          resolve()
        }
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)
      }
    }),
  {
    databaseName: appDatabaseName,
    databaseVersion: appDatabaseVersion,
    record: {
      id: questionAttemptId(source.receipt),
      questionId: source.id,
      selectedOptionId: source.optionIds[0],
      reviewIntent: "flagged",
      committedAt: 1,
      receipt: source.receipt,
      optionIds: source.optionIds
    },
    storeName: appDatabaseStores.questionAttempts,
    storeNames: Object.values(appDatabaseStores)
  }
)

const readReviewInputs = async (page: Page) => ({
  acknowledgements: await readStore(page, appDatabaseStores.reviewAcknowledgements),
  hazardAttempts: await readStore(page, appDatabaseStores.hazardAttempts),
  questionAttempts: await readStore(page, appDatabaseStores.questionAttempts)
})

test("Settings rebuild exposes pending/error/complete focus and remains idempotent", async ({
  context,
  page
}) => {
  await page.goto("/settings/")
  await expect(page.getByText(/Default preferences are shown/)).toBeVisible()
  await expect(page.locator("#export-local-data")).toBeVisible()
  await expect(page.locator("#rebuild-review-projection")).toBeVisible()

  const source = await page.locator("#settings-bootstrap-data").evaluate((element) => {
    const value = JSON.parse(element.textContent ?? "null") as {
      readonly reviewQueue?: { readonly questions?: ReadonlyArray<EmbeddedReviewQuestion> }
    }
    const question = value.reviewQueue?.questions?.[0]
    if (question === undefined) throw new Error("Settings review bootstrap has no question")
    return question
  })
  await seedQuestionAttempt(page, source)
  const originalInputs = await readReviewInputs(page)

  let releasePostcommit!: () => void
  const postcommitGate = new Promise<void>((resolve) => {
    releasePostcommit = resolve
  })
  await context.route(`**${source.receipt.postcommitPath}`, async (route) => {
    await postcommitGate
    await route.continue()
  })

  const rebuild = page.getByRole("button", { name: "Rebuild review queue" })
  await rebuild.click()
  await expect(page.getByRole("status").filter({
    hasText: "Rebuilding the review queue from the events saved on this device…"
  })).toBeVisible()
  await expect(page.getByRole("button", { name: "Rebuilding review queue…" })).toBeDisabled()
  releasePostcommit()

  const completed = page.getByRole("heading", { name: "Review queue rebuild complete" })
  await expect(completed).toBeFocused()
  const completionStatus = page.getByRole("status").filter({
    hasText: "Read 1 saved attempt(s), found 1 due for review"
  })
  await expect(completionStatus).toContainText("Nothing in your history was changed")
  const firstCompletion = await completionStatus.textContent()
  expect(await readReviewInputs(page)).toEqual(originalInputs)

  await rebuild.click()
  await expect(completed).toBeFocused()
  expect(await completionStatus.textContent()).toBe(firstCompletion)
  expect(await readReviewInputs(page)).toEqual(originalInputs)

  await page.evaluate((attemptStore) => {
    const owner = window as typeof window & {
      __nycustodianOriginalReviewGetAll?: typeof IDBObjectStore.prototype.getAll
    }
    owner.__nycustodianOriginalReviewGetAll = IDBObjectStore.prototype.getAll
    IDBObjectStore.prototype.getAll = function(query, count) {
      if (this.name === attemptStore) {
        throw new DOMException("review read unavailable", "InvalidStateError")
      }
      return owner.__nycustodianOriginalReviewGetAll!.call(this, query, count)
    }
  }, appDatabaseStores.questionAttempts)

  await rebuild.click()
  const stopped = page.getByRole("heading", { name: "Review queue rebuild stopped" })
  await expect(stopped).toBeFocused()
  await expect(page.getByText(/No saved attempt or finished review was changed/))
    .toBeVisible()
  await expect(rebuild).toBeEnabled()

  await page.evaluate(() => {
    const owner = window as typeof window & {
      __nycustodianOriginalReviewGetAll?: typeof IDBObjectStore.prototype.getAll
    }
    if (owner.__nycustodianOriginalReviewGetAll === undefined) {
      throw new Error("Missing review getAll owner")
    }
    IDBObjectStore.prototype.getAll = owner.__nycustodianOriginalReviewGetAll
    delete owner.__nycustodianOriginalReviewGetAll
  })

  await rebuild.click()
  await expect(completed).toBeFocused()
  expect(await readReviewInputs(page)).toEqual(originalInputs)
})
