const DB_NAME = "r2-question-player"
const DB_VERSION = 1
const SESSION_KEY = "active"

export class CommitRejected extends Error {
  constructor(message = "Injected transaction rejection") {
    super(message)
    this.name = "CommitRejected"
    this._tag = "CommitRejected"
  }
}

export class CommitOutcomeUnknown extends Error {
  constructor(message = "Transaction completed but caller lost the outcome") {
    super(message)
    this.name = "CommitOutcomeUnknown"
    this._tag = "CommitOutcomeUnknown"
  }
}

const request = (req) => new Promise((resolve, reject) => {
  req.onsuccess = () => resolve(req.result)
  req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed"))
})

const transactionDone = (tx) => new Promise((resolve, reject) => {
  tx.oncomplete = () => resolve()
  tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"))
  tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"))
})

export async function resetDatabase() {
  await new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error ?? new Error("Database delete failed"))
    req.onblocked = () => reject(new Error("Database delete blocked"))
  })
}

export async function openPersistence() {
  const db = await new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const next = req.result
      if (!next.objectStoreNames.contains("attempts")) next.createObjectStore("attempts", { keyPath: "attemptId" })
      if (!next.objectStoreNames.contains("sessions")) next.createObjectStore("sessions")
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error("Database open failed"))
  })

  let closed = false
  const requireOpen = () => {
    if (closed) throw new Error("Persistence is closed")
  }

  const restoreSession = async () => {
    requireOpen()
    const tx = db.transaction("sessions", "readonly")
    const value = await request(tx.objectStore("sessions").get(SESSION_KEY))
    await transactionDone(tx)
    return value ?? null
  }

  const saveSession = async (session) => {
    requireOpen()
    const tx = db.transaction("sessions", "readwrite")
    tx.objectStore("sessions").put(session, SESSION_KEY)
    await transactionDone(tx)
  }

  const findAttempt = async (attemptId) => {
    requireOpen()
    const tx = db.transaction("attempts", "readonly")
    const value = await request(tx.objectStore("attempts").get(attemptId))
    await transactionDone(tx)
    return value ?? null
  }

  const commitAttempt = async (attempt, mode = "success") => {
    requireOpen()
    if (mode === "reject") throw new CommitRejected()

    const tx = db.transaction(["attempts", "sessions"], "readwrite")
    const attempts = tx.objectStore("attempts")
    const existing = await request(attempts.get(attempt.attemptId))
    if (existing) {
      if (existing.questionId !== attempt.questionId || existing.selectedOptionId !== attempt.selectedOptionId) {
        tx.abort()
        throw new Error("Idempotency key collision")
      }
    } else {
      attempts.add(attempt)
    }
    tx.objectStore("sessions").put({
      selectedOptionId: attempt.selectedOptionId,
      attemptId: attempt.attemptId,
      flagged: attempt.flagged
    }, SESSION_KEY)
    await transactionDone(tx)

    if (mode === "unknown") throw new CommitOutcomeUnknown()
    return existing ?? attempt
  }

  const clearSessionForNext = async () => {
    requireOpen()
    const tx = db.transaction("sessions", "readwrite")
    tx.objectStore("sessions").delete(SESSION_KEY)
    await transactionDone(tx)
  }

  return Object.freeze({
    restoreSession,
    saveSession,
    findAttempt,
    commitAttempt,
    clearSessionForNext,
    close() {
      if (!closed) {
        closed = true
        db.close()
      }
    }
  })
}
