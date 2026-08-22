# R2.2 report - Effect v4 UI reactivity and renderer integration

## Executive result

Use a renderer-neutral application model and keep five distinct ownership layers:

1. durable domain/content state in IndexedDB and immutable content packs;
2. Effect workflow and lifecycle state around services, failures, cancellation, and scopes;
3. immutable renderer-neutral screen snapshots and semantic commands;
4. renderer-local high-frequency interaction scratch state;
5. actual DOM, focus, live-region, scroll, selection, and viewport effects.

Do not use Effect as a DOM renderer. Do not mirror every DOM property into `Ref`, Atom, or Stream. Do not make the unstable v4 reactivity namespace a project-wide requirement.

The provisional renderer posture is:

- direct semantic DOM remains the baseline for static pages and bounded interactive islands;
- `lit-html@3.3.3` is the first small declarative candidate for a matched production spike;
- Solid is the next escalation candidate if keyed structures, conditional branches, or local reactivity materially exceed the direct/lit threshold;
- React, Preact, Vue, and Web Components remain alternatives, not defaults;
- Effect Atom integrations are integration options after a renderer is selected, not reasons to select one.

A final renderer choice is BLOCKED pending a successful Bun install, native-browser execution with native IndexedDB, and Vite production bundle closure.

## Immutable and upstream coordinates

- repository source: `agent/chat-corpus-reconciliation` at `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`;
- Effect cohort: `effect@4.0.0-rc.111`, tag commit `648f566d7557e33abd8da8546c42aa93343e2db9`;
- Atom bindings: `@effect/atom-react`, `@effect/atom-solid`, and `@effect/atom-vue` all `4.0.0-rc.111`;
- Bun coordinate: `bun-v1.4.0`, tag commit `34cbb9a40b4bd1bd767d134a7065e66c2432a676`;
- candidate fixture: `lit-html@3.3.3`, tag commit `20afabd3c5bfd49fdcdf1b8518e05c7f99a46db6`;
- bundler fixture: `vite@8.2.1`.

`effect/unstable/reactivity` is explicitly unstable. Effect v4 itself was an RC at the selected coordinate. Project code must isolate these APIs behind a small adapter so removal does not rewrite domain, persistence, or screen-state code.

## Current v4 state and reactivity findings

### Stable primitives

`Ref` is fiber-safe mutable process state with atomic update operations. It is suitable for a small amount of in-memory workflow state, but it is not durable authority and it does not provide renderer lifecycle by itself.

`SynchronizedRef` serializes effectful updates. Use it only when an in-memory state transition must perform effectful work under mutual exclusion. It is too heavy as a generic UI field store.

`PubSub` broadcasts values to scoped subscribers and exposes bounded, dropping, sliding, unbounded, and replay choices. It fits event fan-out where every subscriber has independent consumption. It is not a current-value screen store.

`Stream` fits effectful event sources, backpressure, and scoped resource acquisition. It is appropriate for online/offline events, progress streams, or timer ticks when those are genuinely streams. It should not be introduced for one-shot button commands.

`ManagedRuntime` builds a Layer once, caches its context, runs many effects, and provides explicit disposal. The UI should have one application runtime root or one intentionally bounded island runtime, never a runtime or Layer per event.

### Unstable Reactivity and Atom

The v4 Reactivity service is invalidation-oriented. It tracks keys, batches invalidations, reruns scoped queries or streams, and invalidates mutations only after successful completion. It is not a durable store and should not be interpreted as a universal UI state container.

`AtomRef` is a process-local observable mutable cell independent of an Atom registry. `AtomRegistry` owns cached atom values, dependencies, mounts, subscriptions, refreshes, resets, idle time-to-live, and disposal. Its cache and value graph are registry-local.

The framework bindings are lifecycle bridges:

- React uses `useSyncExternalStore` and mount cleanup, with delayed disposal behavior intended to tolerate React remount patterns;
- Solid bridges registry values to signals and disposes through owner cleanup;
- Vue bridges through Vue watches and cleanup, using an injected or default registry.

These are useful only after a renderer/framework need exists. They do not replace IndexedDB, semantic commands, typed use cases, or an explicit focus/accessibility adapter.

## State ownership result

The complete mapping is in `STATE-OWNERSHIP.md`. The most important rules are:

- selected-but-uncommitted answer is renderer-neutral screen state and may be session-draft persisted, but it is not an attempt event;
- commit progress and typed failure are workflow/screen state;
- revealed correctness and explanation are impossible before durable transaction success or idempotency-key reconciliation of an already committed record;
- retry preserves the same attempt ID for the same semantic selection;
- changing the selection invalidates the previous attempt ID;
- timer ticks, offline signals, and pack progress are streams only when there is a real producer lifecycle;
- hazard pointer movement, pan velocity, and transient zoom are local interaction state until converted to a semantic marker or viewport command;
- route/island disposal closes the child Scope, subscriptions, listeners, observers, and renderer root.

## Renderer comparison result

Direct DOM has the smallest dependency surface and the best fit for semantic initial HTML. It remains viable while updates are explicit, bounded, and tested. Its risk is not raw line count; its risk is the accidental invention of diffing, dependency tracking, lifecycle registries, event delegation infrastructure, or accessibility primitives.

Web Components provide a platform lifecycle and encapsulation boundary but introduce upgrade timing, shadow-DOM accessibility/testing choices, and custom-element API design. They are useful for independently distributable widgets, not as a default application architecture.

lit-html supplies keyed templates and declarative conditional/list updates without a component framework. Its client render API does not by itself hydrate arbitrary server HTML; official hydration uses additional SSR client machinery. For this product, enhancement can keep static semantic fallback and replace or own a bounded island after load rather than claim zero-cost hydration.

Preact reduces React-style cost but still introduces component/root/hydration semantics without a current ecosystem requirement. React adds the largest conceptual and runtime surface and is not justified by popularity. Vue has similar component/runtime implications. Solid has the strongest fallback case because fine-grained local reactivity and direct DOM generation fit complex simulations, but adoption still requires measured need.

The Atom bindings should be compared as renderer integrations, not standalone renderers.

## Question-player evidence

The fixture uses one immutable state machine and controller with direct DOM, an actual lit-html source adapter, and a standards-only whole-region replacement negative control.

Observed in Node and policy-safe Chromium:

- no reveal after injected commit rejection;
- typed retry state and error focus;
- stable attempt ID across retry;
- selection change invalidates the prior ID;
- unknown post-transaction outcome is reconciled by reading the attempt ID;
- outcome focus and polite live-region announcement after success;
- restoration, flagging, next-item reset, and disposal;
- no answer key or explanation literal in served precommit files.

The negative-control renderer exposed a real focus defect: it focused an element and then acknowledgement rerender replaced that element. The corrected fixture acknowledges, rerenders, resolves the replacement node, and then focuses it. This demonstrates why whole-region replacement and home-grown template rendering should not be the production direct-DOM strategy.

Observed source closure, not a production bundle:

- direct: 20,620 raw bytes / 5,553 gzip bytes;
- native-template negative control: 21,662 / 5,864;
- lit first-party source excluding the `lit-html` dependency: 21,001 / 5,612.

These numbers cannot decide the renderer because the lit dependency and Vite transformation are absent.

## Blocked evidence

The isolated runner had no Bun executable and no package-network DNS. Package install, `bun.lock`, installed `effect/AGENTS.md`, Effect Schema typecheck/runtime, lit-html execution, and Vite build were therefore BLOCKED.

The managed Chromium policy contains a wildcard URL blocklist. Every local HTTP and file navigation failed before application load. `about:blank` has an opaque origin and native IndexedDB returned `SecurityError`. The policy-safe harness therefore used an asynchronous IndexedDB-shaped in-page test double. That is DOM/lifecycle evidence, not native IndexedDB transaction proof.

No blocked result is promoted to OBSERVED or CONFIRMED.

## Recommendation and handoff

1. Implement renderer-neutral question/session commands and snapshots before selecting a renderer.
2. Create one long-lived application `ManagedRuntime`; create and close child scopes per interactive route/island.
3. Keep durable commit-before-reveal inside an Effect use case, behind a typed persistence service.
4. Begin implementation with disciplined direct DOM for low-complexity islands.
5. Rerun the committed matched Vite fixture under Bun with native browser/IndexedDB access.
6. Adopt lit-html only if it materially reduces branch reconciliation and focus/listener defects at an acceptable measured closure.
7. Escalate to Solid only when the migration triggers are met.
8. Keep Atom optional and localized; never use it as durable or cross-tab authority.
9. Reconcile numeric bundle gates with R2.5 before final architecture synthesis.
