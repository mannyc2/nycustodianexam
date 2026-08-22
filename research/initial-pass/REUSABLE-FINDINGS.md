# Reusable findings from the initial pass

These findings survived normalization because they are product invariants, platform truths, useful research methods, or version-neutral architecture principles. They are not all final implementation decisions.

## 1. Durable commit before reveal

The maintained product contract and the stronger architecture reports agree:

```text
select
  -> begin commit
  -> one IndexedDB transaction writes the authoritative attempt/projections/checkpoint
  -> transaction completes
  -> reveal
```

A normal persistent session must not reveal based only on an in-memory state transition and then discover that persistence failed. An explicitly labeled nonpersistent/ephemeral mode would be a separate product decision.

## 2. Effect versus pure code

The useful boundary is capability-driven:

- pure deterministic transitions remain ordinary functions;
- Effect owns asynchronous workflows, typed operational errors, resource lifetime, concurrency, retries, time, randomness, persistence, network access, and runtime-specific capabilities;
- Effect is not a reason to wrap every calculation;
- Effect is not the DOM renderer.

This principle must be re-expressed using current Effect v4 idioms rather than copied from v3 APIs.

## 3. Services and Layers

Reusable service guidance:

- model cohesive capabilities, not functions;
- keep low-level browser APIs inside implementations;
- preserve domain-level atomic operations such as committing an attempt or activating a pack;
- compose implementations at runtime roots;
- avoid rebuilding Layers per event;
- avoid one giant application service and one service per noun/function.

Exact service declarations, Layer APIs, runtime construction, and package boundaries require a v4 redo.

## 4. Content compiler boundary

Retain the E05 architecture:

```text
parse unknown
  -> Effect Schema structural decode
  -> normalized records
  -> registry construction
  -> explicit relational publication gates
  -> generated artifacts
  -> output Schema validation
  -> canonical encoding/hashing
  -> publish manifest last
```

Schema should validate values. Registry passes should validate relationships and publication eligibility.

## 5. IndexedDB and pack updates

Reusable storage findings:

- one physical IndexedDB can support transactions spanning the logically related stores;
- expose multiple cohesive domain services over a private database capability;
- append attempt events and maintain rebuildable projections;
- keep browser transactions short;
- do not await network work inside a live transaction;
- stage immutable pack objects first;
- validate closure/checksums;
- atomically flip an active generation/version pointer;
- pin active sessions to exact content/profile versions;
- retain previous valid content for rollback/recovery;
- BroadcastChannel is notification/invalidation, not authority;
- Web Locks can coordinate cooperative work but database constraints remain authoritative;
- fiber interruption must not be described as cancellation of an operation the underlying browser API cannot actually stop.

The adapter/provider choice must be redone for latest Effect v4.

## 6. Browser and Effect Platform boundary

Retain the decision rule, not the v3 package list:

- use a project service when operations have domain semantics, alternate runtime implementations, resource lifetime, error translation, testing needs, or atomicity;
- keep deterministic value APIs and DOM mechanics native when a service would only rename a global;
- using native Web APIs inside an Effect service is still Effect architecture;
- preserve browser/build/Cloudflare runtime differences rather than forcing false portability.

## 7. Static pages and interactive boundaries

The bundling report provides a strong hypothesis and measurement plan:

- static acquisition/reference pages should not eagerly import the Effect runtime;
- interactive study surfaces should have explicit entry/lazy boundaries;
- optional HttpClient/Stream/offline features should not leak into the initial player closure without measurement;
- measure emitted files, not package install size;
- gzip/Brotli each emitted file separately and sum route closures;
- keep source maps out of transfer budgets;
- test isolated fixtures and the integrated route graph.

All byte budgets and version-specific measurements are provisional until rerun with latest Effect v4, Bun workspaces, and the selected Vite/Cloudflare build.

## 8. UI state and renderer experiment

Reusable UI findings:

- domain state, asynchronous workflow state, screen/view state, and DOM mechanics have different owners;
- DOM events should become semantic commands/actions;
- view rendering consumes explicit snapshots/results;
- focus and live-region effects occur after rendering and remain renderer concerns;
- scopes/lifecycles must own listeners, subscriptions, and child work;
- high-frequency pointer movement should remain local to the hazard controller until it becomes a semantic mark action;
- direct DOM should be judged by a complete question-player spike, not a toy counter;
- a declarative renderer should be adopted when reconciliation, listener ownership, keyed lists, accessibility state, or component composition becomes the dominant complexity.

The renderer candidate and v4 state/reactivity integration must be researched again.

## 9. Testing and failure injection

Retain:

- pure transition/property tests;
- Effect service/use-case tests with test implementations;
- deterministic clock/random inputs;
- real-browser IndexedDB tests;
- cross-tab tests;
- service-worker restart/lifecycle tests;
- interruption/finalizer tests;
- injected failure after each durable pack-update transition;
- build determinism and per-route bundle gates;
- accessibility assertions that answer-bearing content is absent before commitment.

The actual test runner and Bun workspace commands remain open.

## 10. Deterministic tool geometry

The complete raw geometry evidence is now available in this branch. Its current status remains research/POC, not approved content.
