import { Schema } from "effect"

export const deterministicSeedMaxLength = 128

export const DeterministicSeed = Schema.Trim.pipe(
  Schema.check(
    Schema.isMinLength(1, { expected: "a non-empty deterministic seed" }),
    Schema.isMaxLength(deterministicSeedMaxLength, {
      expected: `a deterministic seed no longer than ${deterministicSeedMaxLength} code units`
    })
  )
)
