# Effect v4 UI state and rendering architecture

Research cutoff: 2026-08-21

## Executive decision

The application should keep question-player and hazard-player state renderer-neutral. Effect should own asynchronous use cases, typed failures, service dependencies, persistence workflows, concurrency, and resource lifetime. The renderer should receive immutable screen models and emit user intents. It should not own durable study state, scoring rules, or the commit-before-reveal decision.

No framework is selected by this research lane.

The recommended implementation sequence is:

1. Keep static acquisition and reference pages standards-first, with semantic HTML and direct DOM enhancement only where needed.
2. Build one complete question-player controller and test suite without a renderer dependency.
3. render that same controller through two matched adapters: disciplined direct DOM and standalone `lit-html`.
4. Extend both adapters with the hazard-player interaction model before choosing between them.
5. Escalate to Solid only when the matched spike proves that a small template renderer is insufficient or when several complex interactive islands require a component and owner-lifecycle model.
6. Do not adopt React or Preact from the current evidence. React has an official Effect Atom binding, but the product has no React ecosystem requirement. Preact has no official Effect Atom binding at the pinned Effect source coordinate.
7. Treat Effect Atom as an optional reactive projection layer, not as a renderer and not as the durable source of truth.

The invariant is enforced in application logic:

`IndexedDB transaction completes successfully -> committed attempt is observable -> reveal state may be constructed`

A renderer, Atom subscription, invalidation event, request-success callback, or optimistic local write is not sufficient evidence of durable completion.

## Evidence status

- [CONFIRMED] The maintained product contract requires semantic HTML, DOM-free application tests, explicit submit, durable persistence before reveal, typed recovery on persistence failure, and scope-owned cleanup.
- [CONFIRMED] Effect `4.0.0-rc.111` exports its current Atom family from `effect/unstable/reactivity`.
- [CONFIRMED] The same upstream commit contains coordinated `@effect/atom-react`, `@effect/atom-solid`, and `@effect/atom-vue` packages at `4.0.0-rc.111`.
- [CONFIRMED] Effect Atom nodes can run scoped Effects and Streams, register finalizers, interrupt running fibers when their node is disposed, and expose results as `AsyncResult`.
- [CONFIRMED] `AtomRegistry` is an independent in-memory reactive runtime with subscriptions, mounting, reset, disposal, and scope-aware conversions.
- [CONFIRMED] `Reactivity.mutation` invalidates keys after a successful Effect; it does not provide durable storage or decide when answer reveal is allowed.
- [OBSERVED] Official React, Solid, and Vue bindings map Atom subscriptions and registry disposal into their framework lifecycles.
- [BLOCKED] No Bun fixture, target application dependency graph, bundle build, or runtime spike could be executed in this lane.
- [BLOCKED] The exact prior E01 and E03 raw reports were unavailable. Only their normalized repository summaries were used.

## Product complexity test

A renderer decision based on a counter, fetch example, or isolated form is invalid for this product. The minimum test is the maintained question-player contract plus the hazard-player extension.

### Question player

The real screen must support:

- editable single-choice selection before submit;
- explicit submit;
- an in-flight durable commit state;
- typed, recoverable persistence failure;
- idempotent retry;
- no correctness, key, rationale, or answer-bearing metadata in the pre-commit DOM or accessibility tree;
- immutable answer state after successful commit;
- post-commit correctness, explanations, distractor rationales, sources, and review actions;
- focus movement to the outcome and live announcements for save and failure states;
- reload restoration from the committed attempt and pinned content versions.

### Hazard player

The real extension must support:

- an unannotated pre-answer scene with no target-count leak;
- pointer, keyboard, and explicit controls for pan, zoom, add, select, move, and remove mark;
- stable identities for a changing collection of marks;
- neutral pre-answer mark presentation;
- zero marks as a valid submission;
- an explicit submit and the same durable commit boundary;
- one-to-one target matching and duplicate handling;
- synchronized visual and text results;
- non-color-only post-commit feedback;
- a nonvisual path with neutral zone descriptions before commit and full interpretation after commit.

High-frequency pointer motion is not application state. It stays inside the renderer/controller for the active gesture. A semantic mark operation is emitted only when a gesture is committed, such as pointer-up or keyboard confirmation.

## Current Effect v4 reactivity reality

### `effect/unstable/reactivity`

At the pinned upstream commit, the entry point exports:

- `AsyncResult`;
- `Atom`;
- `AtomHttpApi`;
- `AtomRef`;
- `AtomRegistry`;
- `AtomRpc`;
- `Hydration`;
- `Reactivity`.

The path is explicitly unstable. Project code should not spread these imports through domain and renderer modules. Any adoption should be contained behind a small project-owned adapter so an Effect release-candidate change does not rewrite the screen model or persistence contract.

### Atom

An `Atom<A>` describes a reactive value evaluated by a registry. It carries read behavior, equality, lazy/keep-alive metadata, refresh behavior, and optional idle lifetime. A writable Atom adds a typed write function.

Relevant constructors and capabilities include:

- plain writable state from a value;
- synchronous derived state from an Atom read context;
- Effect-backed state exposed as `AsyncResult`;
- Stream-backed state exposed as `AsyncResult`;
- function Atoms that start an Effect or Stream when written;
- reset and interrupt controls for function Atoms;
- context/runtime construction from Layers;
- families for memoized keyed Atoms;
- finalizers, subscriptions, streams, refresh, and writes through Atom contexts.

This is useful for reactive projection and async orchestration. It does not turn every domain transition into an Atom concern. The question transition rules remain simpler and more testable as plain tagged states and pure transition functions.

### Atom lifetime and Effect Scope

When an Effect-backed Atom runs, the implementation creates a Scope, provides the registry and scheduler, registers a Scope-close finalizer, and registers cancellation of the running fiber. When the Atom node is disposed, the associated scope and work are cleaned up. `AtomRegistry.layerOptions` similarly disposes the registry when its Layer scope closes. `AtomRegistry.mount` and `toStream` release their subscriptions through Scope finalizers.

This lifecycle integration is valuable for screen queries, subscriptions, preview streams, and other genuinely cancelable work.

It requires care around IndexedDB commits. Interrupting an Effect wrapper does not prove that an already-started browser transaction rolled back. The persistence adapter must define the point after which cancellation is masked, await transaction settlement, or return an unknown-outcome error that is reconciled by idempotency key. Atom node disposal must not be interpreted as a durable rollback signal.

### AtomRegistry

Each registry is an independent reactive state container. The same Atom can have different values in different registries. A registry supports reads, writes, refresh, subscriptions, mounting, reset, disposal, initial values, scheduling, and idle cleanup.

Recommended ownership is one registry per mounted interactive application island or session boundary when Atom is actually used. A global default registry is convenient in framework bindings but is not the preferred product boundary because it makes test isolation, route disposal, and session-version pinning less explicit.

### Reactivity

`Reactivity` is process-local key-based invalidation. It can:

- register handlers for keys;
- invalidate keys;
- wrap a successful mutation and then invalidate;
- rerun a query after invalidation;
- expose reruns as a Stream;
- batch invalidations.

It is a cache/query coherence mechanism. It is not persistence. For answer submission, a useful order is:

1. persist the attempt in one IndexedDB transaction;
2. observe transaction completion;
3. return the committed attempt;
4. invalidate progress and review query keys;
5. construct and publish the reveal state.

The invalidation may be implemented with `Reactivity.mutation`, but reveal remains an explicit state transition from the committed result.

## Official Atom bindings

### React

The React binding uses `useSyncExternalStore` to connect registry subscription and snapshots to React. It provides hooks for reading, writing, mounting, refreshing, subscribing, Suspense, and AtomRefs. Its provider creates a registry, schedules registry work through React's scheduler, and delays disposal briefly to tolerate quick remounts. The pinned package peers on React 19.2 and scheduler 0.27.

This is a real integration, but it introduces React's runtime, scheduler, component lifecycle, and ecosystem assumptions. The current product contract does not require those assumptions. Binding quality is not enough to justify renderer adoption.

### Solid

The Solid binding maps Atom values to accessors, registers cleanup with Solid owners, exposes AsyncResult through resources, and disposes a provider-owned registry when the owner is cleaned up. Solid's fine-grained update and keyed-list model map naturally to the hazard player's changing mark set.

Solid is therefore the strongest full-framework fallback. It is still a fallback, not the default: it requires JSX/compiler adoption, a component model, and a second reactive vocabulary. It should be selected only after the direct DOM and `lit-html` spike demonstrates a concrete need.

### Vue

The Vue binding uses refs, computed values, injection, and watch cleanup. It confirms that the Atom layer is renderer-portable. Vue is not otherwise aligned with the repository's current direction and is not a realistic shortlist candidate.

### Preact

There is no official Preact Atom package in the pinned Effect repository. Preact can alias React packages through `preact/compat`, but that does not establish support for the Effect React binding's peer constraints, React scheduler use, Suspense, hydration, or delayed registry disposal. A custom controller subscription works with Preact, but then Preact gains no Effect-native integration advantage over `lit-html` or direct DOM.

## Renderer comparison

### Direct DOM

Direct DOM remains the default for static content and small enhancements. It can also pass the player test when disciplined:

- build a stable semantic DOM skeleton;
- use one event-delegation root where practical;
- render only from the immutable screen snapshot;
- centralize all state-to-DOM patching;
- keep correctness data absent until the reveal state exists;
- register listeners and observers through a screen Scope;
- preserve keyed mark identity explicitly;
- never read business state back from classes, attributes, or input nodes.

Its risk is not lack of capability. Its risk is a growing project-owned reconciler: conditional reveal regions, changing option/mark collections, listener replacement, focus preservation, live regions, and synchronized visual/text output.

### Standalone `lit-html`

Standalone `lit-html` adds declarative templates, event bindings, conditional content, and keyed/repeated rendering without selecting a full component framework. It can subscribe to the same renderer-neutral controller as direct DOM. It does not require Atom, and Atom does not require it.

This is the preferred challenger in the first spike because it targets the exact failure mode of direct DOM: manual reconciliation. It still leaves application state, Effect workflows, focus requests, and accessibility semantics under project control.

### Solid

Solid is justified when the product develops a reusable graph of interactive components, multiple independently updating regions, and several keyed collections whose lifecycles are cumbersome in a template-only island. It is especially plausible for the hazard player, but the hazard test must prove the need rather than merely suggest it.

### React

React is justified only by an external product constraint such as an existing React codebase, a required accessible component ecosystem, a React-skilled team standard, or a server-rendering architecture that already depends on React. None is present in the immutable product corpus.

### Preact

Preact may reduce React-like runtime cost, but it lacks an official Effect Atom bridge and would introduce either a project-owned adapter or a compatibility configuration. It is not a useful compromise unless a React-like component API becomes a requirement and its compatibility surface is verified in a pinned fixture.

## State ownership model

The application should distinguish five kinds of state:

1. Durable records in IndexedDB: attempt events, materialized progress, review state, pinned content/session references, and idempotency records.
2. Renderer-neutral screen state: selected option, commit phase, typed error, committed result, reveal payload, semantic hazard marks, and review phase.
3. Effect workflow state: running command fibers, service dependencies, retry/recovery logic, transaction settlement, query invalidation, telemetry, and Scope lifetime.
4. Optional reactive projection: Atom or another store that publishes screen snapshots and derived reads to multiple consumers.
5. Renderer-local state: hover, pressed state, pointer capture, in-progress gesture geometry, pan/zoom animation, layout measurements, and concrete DOM focus handles.

State may flow down from durable records into a screen snapshot and then into a renderer. User intent flows up. The renderer may report a semantic action, but it never decides that persistence succeeded or that reveal is legal.

## Commit-before-reveal protocol

A correct submission protocol is:

1. Generate or reuse a stable command/attempt id.
2. Freeze the submitted selection and enter `Committing`.
3. Start the repository transaction.
4. Write the immutable attempt event and all transactionally coupled materialized state.
5. Resolve only from the transaction's successful completion event, not from an individual request's success callback.
6. Return a committed record carrying the pinned question, content-pack, profile, selection, and attempt identifiers.
7. Optionally invalidate progress/review queries.
8. Construct the reveal payload and transition to `Revealed`.
9. Ask the renderer to announce success and focus the outcome.

On a confirmed transaction failure, return to editable `Selected` with a typed error and the same retry/idempotency context. Do not reveal.

On an unknown outcome, do not unlock a different selection and do not reveal. Reconcile by command id. A found committed record permits reveal; a confirmed absence permits editable retry.

On screen disposal after the transaction starts, cleanup may detach subscribers and DOM resources, but persistence settlement remains governed by the repository contract. Reload must reconstruct the correct state from IndexedDB.

## Recommended boundaries

### Application layer

Expose renderer-neutral use cases such as:

```ts
interface QuestionPlayer {
  readonly getSnapshot: () => QuestionScreen
  readonly subscribe: (listener: (screen: QuestionScreen) => void) => () => void
  readonly selectOption: (optionId: OptionId) => void
  readonly submit: () => void
  readonly retryCommit: () => void
  readonly markReviewed: () => void
  readonly dispose: () => Promise<void>
}
```

The exact imperative facade is not normative. The normative part is that it exposes screen state and semantic intents without DOM types or renderer imports.

### Persistence layer

Expose a command whose success means durable transaction completion:

```ts
interface AttemptRepository {
  readonly commitQuestionAttempt: (
    command: CommitQuestionAttempt
  ) => Effect.Effect<CommittedQuestionAttempt, AttemptCommitError>

  readonly findByCommandId: (
    commandId: AttemptCommandId
  ) => Effect.Effect<Option<CommittedQuestionAttempt>, AttemptReadError>
}
```

The repository must document cancellation and unknown-outcome behavior.

### Renderer adapter

A renderer adapter:

- subscribes once;
- renders only the provided snapshot;
- translates DOM events into semantic intents;
- executes semantic focus and announcement requests;
- owns pointer/animation/layout transients;
- releases listeners, subscriptions, observers, and roots on disposal.

### Atom adapter

When justified, a project-owned adapter may expose the controller snapshot as an Atom and map commands to Effect-backed function Atoms. Keep this adapter narrow. The persistence service and screen reducer must remain usable without Atom.

## Adoption recommendation

### Adopt now as architecture

- renderer-neutral tagged screen states;
- pure state transitions for synchronous behavior;
- Effect services for persistence and async use cases;
- explicit Scope ownership for listeners, observers, subscriptions, and child work;
- durable transaction completion as the reveal gate;
- stable command ids and unknown-outcome reconciliation;
- renderer-local high-frequency gesture state;
- direct DOM for static and simple pages.

### Prototype before adoption

- direct DOM question/hazard adapter;
- standalone `lit-html` question/hazard adapter;
- optional Atom projection of the same controller;
- bundle and lifecycle measurements in a real Bun fixture.

### Defer

- Solid until the matched spike crosses the escalation gates;
- React until an external React requirement exists;
- Preact until a React-like requirement exists and Effect integration is verified;
- broad Atom adoption until at least two independent consumers or a real async reactive-query need exists.

## Risks and controls

### Unstable Atom API

Control: pin the exact Effect cohort, wrap imports, add compile-time contract tests, and re-run source review before dependency adoption and before v4 final.

### Duplicate state systems

Control: one authoritative renderer-neutral snapshot. Do not mirror the same state in a reducer, Atom, Solid signal, and DOM dataset.

### Cancellation mistaken for rollback

Control: define the IndexedDB transaction settlement boundary; mask or reconcile after writes begin; use stable command ids.

### Pre-answer correctness leak

Control: separate `QuestionPublicView` from `QuestionReveal`; scan precommit DOM and accessible names; prohibit correctness classes, data attributes, hidden text, and pre-rendered rationales.

### Manual DOM drift

Control: matched renderer spike, centralized patching, keyed-identity tests, mount/unmount leak tests, and objective migration criteria.

### Framework selected by binding availability

Control: require the product complexity and measurement gates in `MIGRATION-CRITERIA.md` and `DECISION-MATRIX.csv`.

## Final recommendation

Use Effect v4 as the application and workflow system, not as the view layer. Keep the screen contract portable. Begin with direct DOM for the site generally and decide the interactive player between disciplined direct DOM and standalone `lit-html` through one matched, full-complexity spike. Treat Solid as the next escalation point, not the starting point. Do not adopt React, Preact, or Effect Atom merely because a binding or package exists.
