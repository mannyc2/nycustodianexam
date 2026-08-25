export interface D1Result<Row = unknown> {
  readonly results?: ReadonlyArray<Row>
  readonly success: boolean
}

export interface D1PreparedStatement {
  readonly bind: (...values: ReadonlyArray<unknown>) => D1PreparedStatement
}

export interface D1Database {
  readonly prepare: (query: string) => D1PreparedStatement
  readonly batch: (
    statements: ReadonlyArray<D1PreparedStatement>
  ) => Promise<ReadonlyArray<D1Result>>
}

export interface RateLimitResult {
  readonly success: boolean
}

export interface RateLimiter {
  readonly limit: (input: { readonly key: string }) => Promise<RateLimitResult>
}

export interface CorrectionWorkerEnv {
  readonly CORRECTION_INTAKE_MODE?: "disabled" | "active-v1"
  readonly CORRECTION_RATE_LIMIT_IDENTITY_MODE?: "disabled" | "ephemeral-network-hash-v1"
  readonly CORRECTION_RATE_KEY_SECRET?: string
  readonly CORRECTIONS_DB?: D1Database
  readonly CORRECTIONS_CLIENT_RATE_LIMITER?: RateLimiter
  readonly CORRECTIONS_GLOBAL_RATE_LIMITER?: RateLimiter
}
