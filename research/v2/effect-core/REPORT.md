# Effect v4 Core Architecture

Status: BLOCKED - preliminary source-inspection draft, not a contract-complete lane

Evidence status: upstream API claims are CONFIRMED at the pinned source coordinate; project recommendations are INFERRED; no runtime or compile probes are OBSERVED.

| Field | Value |
| --- | --- |
| Repository | `mannyc2/nycustodianexam` |
| Source branch | `agent/chat-corpus-reconciliation` |
| Source head at branch creation | `8b0d26245c1d78fb0be4e79f874a7d8872056ceb` |
| Source head at final drift check | `645e885748c830f7a9cbbbe90ac0f31149bfc81c` |
| Output branch | `research/v2-effect-core` |
| Research cutoff | 2026-08-21 |
| Effect source snapshot | `Effect-TS/effect@436f10d1efccec308426532ff3f88df9a96434f3` |
| Effect package version at snapshot | `4.0.0-rc.111` |
| Bun runtime probe coordinate | None; no fixture or Bun probe was run |

## Completion blocker

The request supplied `<BASE_SHA>` instead of a concrete immutable SHA. At the initial GitHub checkpoint, the source branch resolved to `8b0d26245c1d78fb0be4e79f874a7d8872056ceb`; the named shared contract and prompt-curation files did not exist there. The output branch and draft PR were created from that head before extended research.

During the final drift check, the source branch had advanced to `645e885748c830f7a9cbbbe90ac0f31149bfc81c`. That merge introduced the shared contract, doctrine, skill adaptation, and lane prompt. The newly available contract and lane prompt both state that the lane must not run until the required source-SHA placeholder is replaced with a concrete SHA. Their placeholders remain unreplaced.

Therefore this branch cannot be certified as a completed v2 lane. It also lacks the contract's required pre-research `START-RECEIPT.md`, private Bun fixture, installed-package `AGENTS.md` reading, compile/runtime probes, and required raw results. The draft PR should remain draft and should not be merged as a completed lane.

The three governance files added after drift were read only to identify and document the blocker; they were not silently treated as part of the original immutable research base. The named E04 and E08 raw reports remain unavailable even at the later source head.

The substantive architecture below is retained as useful preliminary source-inspection work.

## Preliminary decision

Use Effect v4 as the application effect system, not as a reason to wrap every function or Web API.

Start with this workspace only:

```text
apps/
  site/
  content-compiler/
packages/
  content/
  study/
```

- `apps/site` owns Vite, semantic HTML and DOM integration, the browser root, the service-worker entry, IndexedDB implementations, network implementations, and static-asset deployment configuration.
- `apps/content-compiler` owns the finite Bun executable, source ingestion, filesystem access, publication gates, and generated pack output.
- `packages/content` owns portable Schemas, identifiers, immutable content-pack models, compatibility rules, integrity rules, and pure validation.
- `packages/study` owns the deterministic study state machine, answer-commit rules, review scheduling policy, progress derivation, and session transitions.

Do not add `apps/worker` until a real backend responsibility exists. Do not add a runtime package, shared package, package per service, or generic domain/application/ports/adapters tree.

## Effect-native conventions

### Services and Layers

- Define cohesive project capabilities with class-based `Context.Service`.
- Give each service a globally descriptive identifier that includes the workspace and file-level capability name.
- Access services with `yield* Service` inside generators so dependencies remain visible.
- Keep constructors and dependency wiring explicit. Effect v4 no longer auto-generates `.Default` or `.Live` Layers.
- Name the primary implementation `layer`; use descriptive variants such as `layerTest`, `layerMemory`, or `layerConfig` only when they are real alternatives.
- Use `Layer.provide` to hide implementation dependencies and `Layer.provideMerge` only when the caller intentionally needs both services.
- Compose one visible root Layer per runtime. Effect v4 shares Layer memoization across ordinary `Effect.provide` calls, but that is a safety net, not a replacement for an explicit graph.
- Reuse Layer values. Use `Layer.fresh` or `Effect.provide(..., { local: true })` only for deliberate isolation.

Create a service when there is a meaningful capability boundary, replaceable implementation, lifecycle, or side effect. Keep deterministic transformations and state transitions as ordinary functions.

### `Effect.fn` and `Effect.gen`

- Use named `Effect.fn` for reusable functions that return Effects, including service methods and use cases.
- Use `Effect.gen` for one effect value: a root program, a Layer constructor, a test body, or local orchestration.
- Do not write a normal function whose only body returns `Effect.gen`.
- Use `Effect.fnUntraced` only for measured hot paths or internal helpers already covered by a useful parent span.
- Use `return yield*` for terminal failures and interruption in generators.
- Do not use JavaScript `try`/`catch` to handle failures yielded from Effects.

### Error taxonomy

Use `Schema.TaggedError` for expected failures that cross a service, package, persistence, worker-message, or HTTP boundary. Keep each error stable, serializable, and actionable.

Recommended families are:

- decode and validation failures;
- manifest, checksum, version, and compatibility failures;
- storage, migration, quota, and transaction failures;
- pack discovery and object-download failures;
- study-command conflicts and invalid persisted state.

Normalize unknown platform exceptions once at the adapter boundary. Preserve interruption as interruption. Reserve defects for violated internal invariants and programmer errors.

Avoid one catch-all `AppError`, string errors, raw arbitrary causes in durable records, and recovery that hides all failure variants. A parent error with a tagged `reason` union is appropriate only when callers should handle one subsystem abstraction while retaining precise reasons.

### Scope and resource ownership

- A Layer owns process-, page-, or test-suite-lived resources.
- `Effect.scoped` and `Effect.acquireRelease` own operation- or session-lived resources.
- IndexedDB transactions, streams, locks, listeners, and temporary compilation resources belong to the narrowest lifetime that uses them.
- `Scope.Scope` remains an explicit v4 service requirement for scoped operations; `Scope.provide` is the v4 name for supplying an existing scope.
- Browser, service-worker, and edge shutdown finalizers are best effort. Durable correctness must come from atomic transactions, append-before-reveal, idempotency, and recoverable state, not from unload cleanup.

### Structured concurrency

- Use `Effect.forkChild` for work owned by the current fiber.
- Use `Effect.forkScoped` or `Effect.forkIn` when a Scope owns the child.
- Prefer higher-level bounded concurrency combinators when the result set is known.
- Treat `Effect.forkDetach` as exceptional. A detached fiber needs an explicit host lifetime and failure-observation policy.
- Do not create fire-and-forget Promises or fibers from DOM, service-worker, Worker, or test callbacks.

Pack downloads, validation, and staging may run concurrently, but activation is one serialized transaction. An active study session keeps its selected pack version even when a newer pack becomes available.

## Time, randomness, and dates

- Use `Clock.currentTimeMillis` or `DateTime.now` for persisted instants.
- Use monotonic clock readings only to measure elapsed duration; never persist them.
- Use Effect sleep and Clock in retry, timeout, scheduling, and testable time-dependent logic.
- Use `Random.withSeed` for reproducible tests and ephemeral simulations.
- For durable replay across future Effect upgrades, define and version the product's own pure seed derivation and PRNG algorithm. Do not assume an Effect implementation will remain byte-for-byte stable forever.
- Do not use Effect Random for security tokens or identifiers. Use Web Crypto at the owning platform boundary.
- Persist UTC or epoch instants. Persist an explicit IANA zone only when calendar interpretation is part of the product meaning. Provide `DateTime.CurrentTimeZone` at a root rather than reading accidental host-local time throughout the core.

## Runtime ownership

| Runtime | Owner | Root and lifetime |
| --- | --- | --- |
| Static acquisition/reference page | Browser host | No Effect runtime until interactive code is loaded. |
| Interactive browser window | `apps/site` | One root program through `BrowserRuntime.runMain`. Register listeners as scoped resources and run long-lived consumers as child/scoped fibers. |
| Imperative browser integration | `apps/site` | A single `ManagedRuntime` is an allowed alternative only when an external callback API must repeatedly invoke the same Layer-backed services. Do not combine it with a second root for the same graph, and dispose it. |
| Service worker | `apps/site` service-worker entry | Separate global realm. Native event handlers bridge each event to Effect through `respondWith` and `waitUntil`. Never reuse the window runtime. Any module-level cache must be safe if the user agent terminates it without disposal. |
| Content compiler | `apps/content-compiler` | One finite program through `BunRuntime.runMain`, with only the Bun FileSystem, Path, and other capabilities actually required. |
| Vite configuration/build glue | Root or `apps/site` | Plain TypeScript unless it becomes a meaningful resourceful workflow. Invoke the compiler as its own app rather than hiding a second runtime in configuration. |
| Cloudflare static deployment | Cloudflare Workers Static Assets | No Worker script and no Effect runtime. |
| Future Cloudflare Worker | A future `apps/worker` | Native module `fetch` handler plus a narrow Effect use case. The request Promise, abort signal, and `ctx.waitUntil` own work. There is no official v4 Cloudflare platform package in the inspected snapshot. |
| Unit/integration tests | Test file or suite | `@effect/vitest` at the exact same Effect version. Use scoped `it.effect` tests and explicit test Layers; do not import a production global runtime. |

`ManagedRuntime` is an integration adapter, not a dependency-injection container. It builds one Layer lazily, caches its Context, owns the Layer Scope, and must be disposed. Do not create one per click, request, transaction, or test.

## Project capability boundaries

Use these initial project services:

- `ContentStore`: validated immutable objects, staged packs, atomic activation, rollback, and version snapshots.
- `StudyStore`: append-only attempts, durable answer commit and session checkpoint, materialized progress, review state, settings, and correction drafts.
- `PackSource`: manifest discovery and immutable object retrieval; no persistence or activation policy.
- `LocalDatabase`: app-internal IndexedDB open/close/migration capability used by the browser implementations of the two stores.

Use Effect's built-in Clock, Random, DateTime, logging, Bun FileSystem, and Bun Path capabilities directly. Do not create project wrappers without additional product semantics.

The current `@effect/platform-browser` IndexedDB persistence implementation uses `effect/unstable/persistence` and provides a generic key/value persistence model. It is not the default recommendation for this product's multi-store atomic activation, append-only attempts, and checkpoint transactions. Keep the storage decision app-local and validate it in the dedicated persistence research pass.

## Dependency and stability policy

- Pin `effect`, `@effect/platform-browser`, `@effect/platform-bun`, and `@effect/vitest` to one exact matching v4 version through the Bun root catalog.
- Use `workspace:*` for internal package edges.
- Do not add the old common `@effect/platform` package for v4.
- Treat every `effect/unstable/*` import as an explicit architecture choice. Keep unstable platform integration out of portable packages unless it is central to their contract and covered by compatibility tests.
- Re-resolve the official Effect source immediately before implementation. This report is pinned to a release-candidate snapshot, not a promise that APIs will remain unchanged before v4 GA.

## Preliminary implementation gates

Before application code is added:

1. Resolve and stamp a concrete repository source SHA in the lane prompt.
2. Authorize a clean retry branch because the required branch already exists and force-push is prohibited.
3. Recheck the exact Effect v4 release and align every Effect ecosystem dependency.
4. Establish an exact Bun runtime coordinate in a committed private fixture and run the required probes.
5. Read the installed `node_modules/effect/AGENTS.md` completely and follow its linked package guidance.
6. Confirm the package graph still has a real reason for every boundary.
7. Select the IndexedDB adapter and transaction model in the dedicated persistence pass.
8. Define stable Schema versions for persisted and cross-realm messages.
9. Define root Layers separately for window, service worker, compiler, and tests.
10. Keep Cloudflare deployment static unless a concrete server responsibility is approved.

The proposed graph, service matrix, anti-patterns, and source inventory are retained in the sibling deliverables, but they are not a substitute for a compliant rerun with probes and raw results.
