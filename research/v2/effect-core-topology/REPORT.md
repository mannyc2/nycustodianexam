# R2.1 report - Effect v4 core architecture and Bun topology

## Executive conclusion

Recommendation status: INFERRED.

Adopt a four-workspace starting graph:

```text
apps/
  site/
  content-compiler/
packages/
  content/
  study/
```

This is not a scaffold or implementation. It is the smallest graph that currently
has defensible runtime, build, reuse, and ownership boundaries:

- `packages/content` owns portable schemas and deterministic content/profile
  compatibility rules.
- `packages/study` owns portable study/session/attempt/progress/review schemas,
  pure policies, and narrow service contracts.
- `apps/site` owns static-site integration, browser bootstrap, DOM/renderer
  boundary, IndexedDB implementations, service-worker entry, and host wiring.
- `apps/content-compiler` owns the finite Bun executable that validates and emits
  immutable content packs.

Do not create `apps/worker` until a correction endpoint or another non-static
responsibility is approved. Do not create `packages/core`, `packages/domain`,
`packages/ports`, `packages/adapters`, one package per service, or a platform
package merely to mirror an architecture diagram.

## Evidence status

CONFIRMED:

- current v4 service definitions use `Context.Service`;
- reusable effectful functions use named `Effect.fn`;
- expected boundary failures can use `Schema.TaggedError`;
- Layers are explicit and dependencies are composed with `Layer.provide`;
- `Context.Reference` supplies overridable defaults;
- `ManagedRuntime` is a resource-owning imperative bridge;
- `BunRuntime.runMain` is the Bun process entry;
- `Layer.launch` represents a long-running Layer as an Effect;
- Effect v4 source/package metadata is `4.0.0-rc.111` at the pinned commit.

INFERRED:

- the four-workspace graph;
- exact module placement inside those workspaces;
- the proposed cohesive service boundaries;
- app ownership of current platform implementations.

BLOCKED:

- Bun installation;
- generated `bun.lock`;
- installed `node_modules/effect/AGENTS.md`;
- compile, test, BunRuntime, browser, and lifecycle observations.

UNKNOWN:

- the missing raw E04/E08 reports;
- final IndexedDB provider/transaction implementation;
- renderer choice;
- final browser/platform package selection;
- measured bundle impact;
- whether the optional Worker is justified.

## Architecture principles

### 1. Start with programs and data, not services

Keep deterministic operations as ordinary TypeScript:

- profile/content compatibility;
- session candidate filtering and deterministic assembly;
- progress projection from attempt events;
- review due-date calculation from explicit time;
- pack closure/checksum comparison after bytes are available;
- screen-state transitions.

Use Schema models at encoded, persisted, imported, and network boundaries.

Create a service only when a capability has meaningful dependency, failure,
lifecycle, resource, concurrency, host, or substitution semantics.

### 2. One atomic attempt capability owns commit-before-reveal

The browser storage implementation must expose a domain-level operation equivalent
to:

```text
commitAttemptAndCheckpoint
```

That one operation atomically writes:

- immutable attempt event;
- materialized progress updates;
- review-queue changes;
- session checkpoint;
- idempotency identity.

Portable study code must not receive a raw `IDBTransaction`. The operation returns
success only after the transaction commits. Correctness/explanation reveal is
downstream of that success.

### 3. Focused Layers, one root per host

Layers belong with their implementation owner. Compose one named root per host:

- browser window root;
- service-worker root;
- Bun compiler root;
- optional Worker root;
- test root.

Do not build a Layer or ManagedRuntime per click, message, request, transaction, or
test assertion. Do not import a universal root runtime from portable packages.

### 4. Scope background work to a real owner

Background fibers belong in a host-owned scoped Layer or event-specific Effect.
Ordinary background work should use child/scoped/in-scope fibers. Detached fibers
need a documented lifetime and failure policy.

Finalizers are cleanup, not durability. Browser unload, service-worker termination,
and edge eviction can prevent finalizers from running, so writes remain atomic and
workflows idempotent.

### 5. Keep errors local and translatable

Use narrow error families at service boundaries. Translate host exceptions once in
the app implementation. Use Option for absence where absence is expected, typed
errors where recovery policy exists, defects for impossible invariants, and preserve
interruption.

### 6. Time and randomness must preserve determinism

Use Effect Clock at effectful boundaries, but pass explicit instants into pure
scheduling/projection functions. Persist UTC/epoch values and explicit calendar
zones where needed.

Use a project-owned versioned pure PRNG for permanent session replay. Effect Random
is suitable for ordinary nondurable randomness, not for a forever-stable content
assembly algorithm.

## Service topology

Portable contracts in `packages/study`:

- `AttemptStore` - atomic attempt/checkpoint operation;
- `StudySnapshotStore` - domain-level session/progress reads, only if separate
  read semantics improve ownership;
- `PackAccess` - active immutable pack/version reads, if not represented by pure
  inputs at the call site;
- `CorrectionClient` - only if correction submission enters the study package;
  otherwise keep it private to `apps/site`.

App-owned implementations:

- IndexedDB attempt/content/pack stores;
- browser crypto/checksum byte acquisition;
- fetch/network transport;
- service-worker messaging;
- DOM/renderer integration;
- optional Worker transport;
- Bun filesystem/compiler source adapters.

Built-in dependencies:

- Clock, DateTime, Random, logging, tracing, metrics;
- Queue/PubSub/Stream only where the workflow genuinely needs in-process
  coordination or streaming.

## Runtime decisions

### Bun content compiler

Use a finite `Effect` program provided with a Bun-specific root Layer and executed
once with `BunRuntime.runMain`. Do not hide the compiler inside Vite callbacks.

### Browser window

Create one `ManagedRuntime` for the interactive application root when an imperative
DOM/renderer boundary needs repeated entry. Host callbacks call `runPromise` or
`runFork`; Effect code itself keeps composing Effects. Dispose the runtime when its
real owner ends.

Do not load the runtime on static pages with no interaction.

### Imperative renderer boundary

The renderer receives renderer-neutral screen state and emits user intents. It
does not own commit-before-reveal, storage rules, review scheduling, content
compatibility, or session determinism.

### Service worker

Use a separate root in the service-worker realm. Bridge host lifetime through
`respondWith`/`waitUntil` or equivalent event APIs. Never share window runtime or
module state as durable state.

### Cloudflare Worker

Default to Workers Static Assets with no Worker script. If correction submission is
approved, use a native fetch boundary plus a small Effect program or a measured
current platform abstraction. Do not make Worker code a dependency of static
generation.

### Tests

Use purpose-built test Layers. Use Effect TestClock for Effect-time behavior and
explicit seed inputs for deterministic pure policies. Bun test and the official
Effect testing integration have different responsibilities; R2.8 should choose the
test-runner stack.

## Topology alternatives

Three realistic options are recorded in `WORKSPACE-TOPOLOGY-OPTIONS.csv`.

Option A, four workspaces, is recommended now.

Option B merges `packages/study` into `apps/site`. It becomes preferable if no
second consumer, independent ownership, or compiler/test reuse appears and the
package would only add indirection.

Option C adds `apps/worker`. It becomes preferable only after a concrete deployed
endpoint is approved.

## Falsifiers

The four-workspace recommendation should be rejected or revised if any of these
conditions becomes true:

1. R2.4 proves storage contracts cannot remain portable without leaking a host
   transaction type; then storage ownership/package boundaries must be revisited.
2. R2.6 proves compiler and runtime content models need distinct publication
   packages rather than one `packages/content`.
3. R2.2 selects a renderer whose build/runtime boundary requires a separate
   workspace with a real independent public API.
4. R2.3 proves a Worker is mandatory for core acquisition or correction behavior.
5. R2.5 shows the package boundary forces materially harmful browser duplication.
6. Implementation analysis shows `packages/study` has only one private consumer
   and no ownership/reuse value; merge it into `apps/site`.
7. Current Effect v4 changes materially before implementation; rerun the API and
   compile probes against the selected exact cohort.

## Required follow-up

Before implementation acceptance:

1. run the committed fixture with Bun 1.4.0 in a network-enabled environment;
2. generate and commit the real text `bun.lock`;
3. read installed `node_modules/effect/AGENTS.md` completely;
4. compile, test, and execute all six probes;
5. reconcile R2.1 with R2.2-R2.8, especially storage, platform, bundling, schema,
   monorepo mechanics, and testing;
6. upgrade from `4.0.0-rc.111` deliberately if a newer v4 exists at scaffold time.
