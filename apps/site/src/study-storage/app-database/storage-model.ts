import { Context, Effect, Schema } from "effect"

export const appDatabaseName = "nycustodian-study-v1"
// M4 owns version 4. M5 deliberately advances to version 5 so users who have
// already opened the M4 database receive every M5 store on their next visit.
// Integration must make this map the exact union of M4's simulation/session/
// submission/print-job stores and the M5 stores below. A real-browser v4 -> v5
// seed must preserve those M4 records while creating every M5 store. The
// upgrade owner creates every declared missing store, so direct older -> v5
// upgrades remain complete after that rebase.
export const appDatabaseVersion = 5

export const appDatabaseStores = {
  meta: "meta",
  questionAttempts: "attempts",
  questionSessions: "sessions",
  hazardAttempts: "hazard-attempts",
  hazardSessions: "hazard-sessions",
  reviewAcknowledgements: "review-events",
  migrationQuarantine: "migration-quarantine",
  preferences: "preferences",
  correctionDrafts: "correction-drafts",
  offlinePacks: "offline-packs",
  offlinePackOperations: "offline-pack-operations",
  transferQuarantine: "transfer-quarantine"
} as const

export const legacyAppDatabaseNames = {
  hazard: "nycustodian-hazard-study-v1",
  review: "nycustodian-review-v1"
} as const

export const StudySessionRecord = Schema.Struct({
  id: Schema.NonEmptyString,
  latestAttemptId: Schema.NonEmptyString,
  updatedAt: Schema.Number
})

export type AppDatabaseStore =
  typeof appDatabaseStores[keyof typeof appDatabaseStores]

export interface LegacyStoreImport {
  readonly sourceStore: string
  readonly targetStore: AppDatabaseStore
  readonly decodeRecord: (record: unknown) => Readonly<{ readonly id: string }>
}

export interface LegacyDatabaseImport {
  readonly databaseName: string
  readonly stores: ReadonlyArray<LegacyStoreImport>
}

export interface LegacyImportReport {
  readonly imported: number
  readonly matched: number
  readonly quarantined: number
}

export class AppDatabaseError extends Schema.TaggedError<AppDatabaseError>()(
  "AppDatabaseError",
  {
    operation: Schema.NonEmptyString,
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export class AppDatabase extends Context.Service<
  AppDatabase,
  {
    readonly connection: Effect.Effect<IDBDatabase, AppDatabaseError>
    readonly importLegacyDatabase: (
      input: LegacyDatabaseImport
    ) => Effect.Effect<LegacyImportReport, AppDatabaseError>
  }
>()("@nycustodian/site/AppDatabase") {}

export const databaseError = (operation: string, cause: unknown): AppDatabaseError =>
  new AppDatabaseError({
    operation,
    detail: cause instanceof Error && cause.message.length > 0
      ? cause.message
      : "IndexedDB application database operation failed",
    cause
  })

export const databaseAbortError = (): DOMException =>
  new DOMException("IndexedDB operation interrupted", "AbortError")
