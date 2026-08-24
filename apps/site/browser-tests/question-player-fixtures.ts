import { expect, type Page } from "@playwright/test"

export const questionPath = "/practice/session/launch-v1/question/1/"
export const databaseName = "nycustodian-study-v1"
export const attemptsStore = "attempts"
export const questionId = "tool-selection-001"
export const attemptId = "launch-v1:v1:launch-v1:question:1"
export const questionPostcommitPath =
  "/content/vertical-slice/questions/tool-selection-001.postcommit.json"

export interface StoredQuestionReceipt {
  readonly releaseId: string
  readonly packVersion: number
  readonly sessionId: string
  readonly position: number
  readonly postcommitPath: string
  readonly postcommitBytes: number
  readonly postcommitSha256: string
  readonly questionId: string
}

export const questionReceipt: StoredQuestionReceipt = {
  releaseId: "launch-v1",
  packVersion: 1,
  sessionId: "launch-v1",
  position: 1,
  postcommitPath: questionPostcommitPath,
  postcommitBytes: 1_347,
  postcommitSha256: "00268da6b592b55cc3393590f1e661b7398a71661879053acaeb883a7b45c04c",
  questionId
}

export interface StoredAttempt {
  readonly id: string
  readonly questionId: string
  readonly selectedOptionId: string
  readonly reviewIntent: "unflagged" | "flagged"
  readonly committedAt: number
  readonly receipt: StoredQuestionReceipt
  readonly optionIds: ReadonlyArray<string>
}

export const gotoReadyQuestion = async (page: Page): Promise<void> => {
  await page.goto(questionPath)
  await expect(page.getByRole("radio", { name: "Adjustable wrench" })).toBeEnabled()
  await expect(page.getByRole("button", { name: "Commit answer" })).toBeVisible()
}

export const readStoredAttempt = (page: Page): Promise<StoredAttempt | undefined> =>
  page.evaluate(
    ({ expectedAttemptId, expectedDatabaseName, expectedStore }) =>
      new Promise<StoredAttempt | undefined>((resolve, reject) => {
        const open = indexedDB.open(expectedDatabaseName)
        open.onerror = () => reject(open.error)
        open.onsuccess = () => {
          const database = open.result
          const transaction = database.transaction(expectedStore, "readonly")
          const request = transaction.objectStore(expectedStore).get(expectedAttemptId)
          request.onerror = () => reject(request.error)
          request.onsuccess = () => resolve(request.result as StoredAttempt | undefined)
          transaction.oncomplete = () => database.close()
          transaction.onabort = () => {
            database.close()
            reject(transaction.error ?? new Error("Attempt read was aborted"))
          }
        }
      }),
    {
      expectedAttemptId: attemptId,
      expectedDatabaseName: databaseName,
      expectedStore: attemptsStore
    }
  )

export const installAnnouncementRecorder = (page: Page): Promise<void> =>
  page.evaluate(() => {
    const status = document.querySelector<HTMLElement>('[aria-live="polite"]')
    if (status === null) throw new Error("Question status live region is missing")

    const messages: string[] = []
    const capture = (value: string | null | undefined) => {
      const message = value?.trim()
      if (message !== undefined && message.length > 0 && !messages.includes(message)) {
        messages.push(message)
      }
    }
    new MutationObserver((records) => {
      for (const record of records) {
        capture(record.oldValue)
        record.addedNodes.forEach((node) => capture(node.textContent))
        record.removedNodes.forEach((node) => capture(node.textContent))
        capture(record.target.textContent)
      }
    }).observe(status, {
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      subtree: true
    })
    ;(window as typeof window & { __nycustodianAnnouncements?: string[] })
      .__nycustodianAnnouncements = messages
  })

export const recordedAnnouncements = (page: Page): Promise<readonly string[]> =>
  page.evaluate(
    () =>
      (window as typeof window & { __nycustodianAnnouncements?: string[] })
        .__nycustodianAnnouncements ?? []
  )
