# Effect v4 test patterns

## Coordinates

- Effect repository coordinate inspected: `1144032cedda7b5eacc1ebf980d06957c7a59ddf`
- `effect`: `4.0.0-rc.111`
- `@effect/vitest`: `4.0.0-rc.111`
- `@effect/vitest` peer requirement observed in source: Vitest `>=4.1.0 <5.0.0`
- Bun selected project research coordinate: `1.4.0`

## Effect-aware tests

Use `@effect/vitest` for Effect-returning tests. Current source exposes `effect`, `live`, `layer`, `prop`, and helpers for scoped tests.

Prefer test Layers that substitute cohesive capabilities. Test use cases through their public Effect contracts instead of reaching into implementation state.

## Shared Layers

`layer(...)` can build a Layer once for a test group and make its services available to nested Effect tests. Use this when the Layer's lifecycle is part of the behavior being exercised or when construction cost warrants sharing.

Do not hide all test dependencies inside one universal test Layer. Keep ownership and failure injection visible.

## Time

Use `effect/testing/TestClock` for retry, timeout, schedule, debounce, due-review, and timer behavior. Fork the timed work, advance the test clock, then observe the resulting fiber/state. Do not sleep wall-clock time in deterministic tests.

## Randomness

Use `Random.withSeed` when the production algorithm legitimately consumes Effect Random. For pure session assembly, prefer an explicit deterministic seed/input and keep the pure algorithm independently testable.

## Property testing

Current `@effect/vitest` supports `prop` with Effect Schema or FastCheck arbitraries. High-value properties include:

- same deterministic session inputs produce identical ordered item/options;
- idempotent attempt retry cannot duplicate authoritative events;
- progress materialization from the same event log is deterministic;
- pack activation never exposes an incomplete generation;
- schema round-trips preserve canonical IDs and immutable versions.

## Interruption/finalizers

Test interruption at owned resource boundaries by recording acquisition/finalization in a test capability and asserting finalizers run once. Do not infer that interrupting a fiber cancels an underlying browser operation whose API is not cancellable.

## Logs, spans, and metrics

Test semantic observability at the capability boundary: emitted event kind, status, redaction, correlation ID shape, and absence of prohibited payload fields. Avoid snapshotting unstable timestamps or internal span implementation details.

## Bun test compatibility boundary

Ordinary Effect programs can be exercised from Bun test, and available R2.1 fixture source demonstrates this style with `Effect.runPromise` and a substituted Layer. That is not equivalent to official support for `@effect/vitest` under Bun test.

Recommendation:

- Effect-native service/use-case test API: `@effect/vitest`;
- Bun runtime/tooling integration: `bun test`;
- do not create an adapter that emulates `@effect/vitest` on top of Bun test unless a concrete measured maintenance benefit justifies it.

## HttpApi

Only test Effect HttpApi in-memory if the server architecture actually adopts it. The currently recommended correction endpoint direction is narrower, so do not introduce HttpApi test machinery merely for this lane.
