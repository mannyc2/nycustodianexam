import { Clock, Context, Effect, Layer, Schema } from "effect"
import {
  QuestionAttemptReceipt,
  questionAttemptId,
  sameQuestionReceipt,
  type QuestionAttemptReceipt as QuestionAttemptReceiptValue
} from "../attempt-receipt.ts"
import {
  AppDatabase,
  appDatabaseStores,
  type AppDatabaseError
} from "../study-storage/app-database.ts"

const OptionIds = Schema.Array(Schema.NonEmptyString).check(
  Schema.makeFilter((optionIds) =>
    optionIds.length > 0 && new Set(optionIds).size === optionIds.length
      ? undefined
      : "a non-empty list of unique option IDs"
  )
)

export class AttemptRecord extends Schema.Class<AttemptRecord>("AttemptRecord")({
  id: Schema.NonEmptyString,
  questionId: Schema.NonEmptyString,
  selectedOptionId: Schema.NonEmptyString,
  reviewIntent: Schema.Union([Schema.Literal("unflagged"), Schema.Literal("flagged")]),
  committedAt: Schema.Number,
  receipt: Schema.optionalKey(QuestionAttemptReceipt),
  optionIds: Schema.optionalKey(OptionIds)
}) {}

export class PersistenceError extends Schema.TaggedError<PersistenceError>()("PersistenceError", {
  operation: Schema.String,
  detail: Schema.String,
  cause: Schema.Unknown
}) {}

export interface CommitAttemptInput {
  readonly receipt: QuestionAttemptReceiptValue
  readonly optionIds: ReadonlyArray<string>
  readonly selectedOptionId: string
  readonly reviewIntent: "unflagged" | "flagged"
}

export interface FindAttemptInput {
  readonly receipt: QuestionAttemptReceiptValue
  readonly optionIds: ReadonlyArray<string>
}

export class StudyPersistence extends Context.Service<
  StudyPersistence,
  {
    readonly commitAttempt: (
      input: CommitAttemptInput
    ) => Effect.Effect<AttemptRecord, PersistenceError>
    readonly findAttempt: (
      input: FindAttemptInput
    ) => Effect.Effect<AttemptRecord | undefined, PersistenceError>
    readonly listAttempts: () => Effect.Effect<ReadonlyArray<AttemptRecord>, PersistenceError>
  }
>()("@nycustodian/site/StudyPersistence") {}

const attemptsStore = appDatabaseStores.questionAttempts
const sessionsStore = appDatabaseStores.questionSessions

const persistenceError = (operation: string, cause: unknown): PersistenceError =>
  new PersistenceError({
    operation,
    detail: cause instanceof Error ? cause.message : "IndexedDB operation failed",
    cause
  })

const databasePersistenceError = (cause: AppDatabaseError): PersistenceError =>
  new PersistenceError({
    operation: cause.operation,
    detail: cause.detail,
    cause
  })

const sameStrings = (left: ReadonlyArray<string>, right: ReadonlyArray<string>): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

export const hasBoundQuestionReceipt = (
  attempt: AttemptRecord
): attempt is AttemptRecord & {
  readonly receipt: QuestionAttemptReceiptValue
  readonly optionIds: ReadonlyArray<string>
} => attempt.receipt !== undefined && attempt.optionIds !== undefined

const validateExpectation = (
  input: FindAttemptInput
): PersistenceError | undefined => {
  try {
    Schema.decodeUnknownSync(QuestionAttemptReceipt)(input.receipt)
    Schema.decodeUnknownSync(OptionIds)(input.optionIds)
  } catch (cause) {
    return persistenceError("validate-attempt-coordinate", cause)
  }
  if (input.receipt.questionId.length === 0) {
    return persistenceError(
      "validate-attempt-coordinate",
      new Error("The question attempt receipt has no question identity")
    )
  }
  return undefined
}

const validateCommitInput = (input: CommitAttemptInput): PersistenceError | undefined => {
  const invalidExpectation = validateExpectation(input)
  if (invalidExpectation !== undefined) return invalidExpectation
  if (!input.optionIds.includes(input.selectedOptionId)) {
    return persistenceError(
      "validate-commit",
      new Error("The selected answer is not in the exact released option closure")
    )
  }
  return undefined
}

const validateStoredAttempt = (attempt: AttemptRecord): AttemptRecord => {
  if (attempt.optionIds !== undefined) {
    Schema.decodeUnknownSync(OptionIds)(attempt.optionIds)
    if (!attempt.optionIds.includes(attempt.selectedOptionId)) {
      throw new Error("A saved question attempt is outside its option closure")
    }
  }
  if (attempt.receipt !== undefined) {
    if (
      attempt.questionId !== attempt.receipt.questionId ||
      attempt.id !== questionAttemptId(attempt.receipt)
    ) {
      throw new Error("A saved question attempt has an invalid receipt identity")
    }
  } else if (attempt.id !== `primary:${attempt.questionId}`) {
    throw new Error("A legacy question attempt has an invalid durable identity")
  }
  return attempt
}

const matchesExpectation = (attempt: AttemptRecord, input: FindAttemptInput): boolean =>
  hasBoundQuestionReceipt(attempt) &&
  sameQuestionReceipt(attempt.receipt, input.receipt) &&
  sameStrings(attempt.optionIds, input.optionIds)

const sameCommittedInput = (attempt: AttemptRecord, input: CommitAttemptInput): boolean =>
  matchesExpectation(attempt, input) &&
  attempt.selectedOptionId === input.selectedOptionId &&
  attempt.reviewIntent === input.reviewIntent

const commitAttempt = Effect.fn("StudyPersistence.commitAttempt")(function*(
  database: IDBDatabase,
  input: CommitAttemptInput,
  committedAt: number
) {
  const invalid = validateCommitInput(input)
  if (invalid !== undefined) return yield* invalid

  return yield* Effect.tryPromise({
    try: () =>
      new Promise<AttemptRecord>((resolve, reject) => {
        const transaction = database.transaction([attemptsStore, sessionsStore], "readwrite")
        const attempts = transaction.objectStore(attemptsStore)
        const sessions = transaction.objectStore(sessionsStore)
        const id = questionAttemptId(input.receipt)
        let committed: AttemptRecord | undefined
        const getRequest = attempts.get(id)

        getRequest.onsuccess = () => {
          try {
            const stored = getRequest.result as unknown
            if (stored !== undefined) {
              const existing = validateStoredAttempt(Schema.decodeUnknownSync(AttemptRecord)(stored))
              if (!sameCommittedInput(existing, input)) {
                transaction.abort()
                reject(new Error("This question attempt already has different immutable data"))
                return
              }
              committed = existing
            } else {
              committed = new AttemptRecord({
                id,
                questionId: input.receipt.questionId,
                selectedOptionId: input.selectedOptionId,
                reviewIntent: input.reviewIntent,
                committedAt,
                receipt: input.receipt,
                optionIds: [...input.optionIds]
              })
              attempts.put(committed)
            }

            sessions.put({
              id: "active",
              latestAttemptId: id,
              updatedAt: committed.committedAt
            })
          } catch (cause) {
            transaction.abort()
            reject(cause)
          }
        }
        getRequest.onerror = () => reject(getRequest.error)
        transaction.oncomplete = () => {
          if (committed === undefined) {
            reject(new Error("Attempt transaction completed without a record"))
            return
          }
          resolve(committed)
        }
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error ?? new Error("Attempt transaction aborted"))
      }),
    catch: (cause) => persistenceError("commit-attempt", cause)
  })
})

const findAttempt = Effect.fn("StudyPersistence.findAttempt")(function*(
  database: IDBDatabase,
  input: FindAttemptInput
) {
  const invalid = validateExpectation(input)
  if (invalid !== undefined) return yield* invalid

  return yield* Effect.tryPromise({
    try: () =>
      new Promise<AttemptRecord | undefined>((resolve, reject) => {
        const transaction = database.transaction(attemptsStore, "readonly")
        const request = transaction.objectStore(attemptsStore).get(questionAttemptId(input.receipt))
        request.onsuccess = () => {
          try {
            if (request.result === undefined) {
              resolve(undefined)
              return
            }
            const attempt = validateStoredAttempt(
              Schema.decodeUnknownSync(AttemptRecord)(request.result)
            )
            if (!matchesExpectation(attempt, input)) {
              reject(new Error("The saved question attempt does not match this release receipt"))
              return
            }
            resolve(attempt)
          } catch (cause) {
            reject(cause)
          }
        }
        request.onerror = () => reject(request.error)
        transaction.onabort = () => reject(transaction.error ?? new Error("Read transaction aborted"))
      }),
    catch: (cause) => persistenceError("find-attempt", cause)
  })
})

const listAttempts = Effect.fn("StudyPersistence.listAttempts")(function*(
  database: IDBDatabase
) {
  return yield* Effect.tryPromise({
    try: () =>
      new Promise<ReadonlyArray<AttemptRecord>>((resolve, reject) => {
        const transaction = database.transaction(attemptsStore, "readonly")
        const request = transaction.objectStore(attemptsStore).getAll()
        let decoded: ReadonlyArray<AttemptRecord> | undefined

        request.onsuccess = () => {
          try {
            decoded = request.result
              .map((record) =>
                validateStoredAttempt(Schema.decodeUnknownSync(AttemptRecord)(record))
              )
              .sort((left, right) =>
                left.committedAt - right.committedAt || left.id.localeCompare(right.id)
              )
          } catch (cause) {
            reject(cause)
          }
        }
        request.onerror = () => reject(request.error)
        transaction.oncomplete = () => {
          if (decoded === undefined) {
            reject(new Error("Attempt list transaction completed without validated records"))
            return
          }
          resolve(decoded)
        }
        transaction.onabort = () =>
          reject(transaction.error ?? new Error("Attempt list transaction aborted"))
      }),
    catch: (cause) => persistenceError("list-attempts", cause)
  })
})

export const studyPersistenceLive = Layer.effect(
  StudyPersistence,
  Effect.gen(function*() {
    const appDatabase = yield* AppDatabase
    const connection = appDatabase.connection.pipe(
      Effect.mapError(databasePersistenceError)
    )

    return StudyPersistence.of({
      commitAttempt: Effect.fn("StudyPersistence.commitAttempt.live")(function*(input) {
        const database = yield* connection
        const committedAt = yield* Clock.currentTimeMillis
        return yield* commitAttempt(database, input, committedAt)
      }),
      findAttempt: Effect.fn("StudyPersistence.findAttempt.live")(function*(input) {
        const database = yield* connection
        return yield* findAttempt(database, input)
      }),
      listAttempts: Effect.fn("StudyPersistence.listAttempts.live")(function*() {
        const database = yield* connection
        return yield* listAttempts(database)
      })
    })
  })
)
