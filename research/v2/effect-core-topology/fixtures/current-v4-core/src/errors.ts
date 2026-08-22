import { Schema } from "effect"

export class StorageTransactionError extends Schema.TaggedError<StorageTransactionError>()(
  "StorageTransactionError",
  {
    operation: Schema.Literal("commitAttempt"),
    cause: Schema.Defect()
  }
) {}

export class DuplicateAttemptError extends Schema.TaggedError<DuplicateAttemptError>()(
  "DuplicateAttemptError",
  {
    attemptId: Schema.String
  }
) {}

export class PackChecksumError extends Schema.TaggedError<PackChecksumError>()(
  "PackChecksumError",
  {
    objectId: Schema.String,
    expected: Schema.String,
    actual: Schema.String
  }
) {}
