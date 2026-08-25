import { Schema } from "effect"

export const DurableTimestamp = Schema.Int.check(
  Schema.makeFilter((value) =>
    Number.isSafeInteger(value) && value >= 0
      ? undefined
      : "a finite, non-negative safe-integer timestamp"
  )
)

export const decodeDurableTimestamp = (value: unknown): number =>
  Schema.decodeUnknownSync(DurableTimestamp)(value)

export const NormalizedCoordinate = Schema.Number.check(
  Schema.makeFilter((value) =>
    Number.isFinite(value) && value >= 0 && value <= 1
      ? undefined
      : "a finite normalized coordinate between 0 and 1"
  )
)
