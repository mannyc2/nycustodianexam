# R2.2 — Effect v4 UI state, reactivity, lifecycle, and renderer integration

You are a fresh repository-backed research agent for `mannyc2/nycustodianexam`.

Determine how the complex browser UI should consume latest Effect v4 application logic without turning Effect into a home-grown renderer, and define an objective renderer-selection spike.

No previous conversation is an input. GitHub and the repository corpus are the durable source of project context.

## Immutable source

```text
Repository:
  mannyc2/nycustodianexam

Source branch:
  agent/chat-corpus-reconciliation

Required source SHA:
  {{POST_CURATION_SOURCE_SHA}}

Output branch:
  research/v2-effect-ui-reactivity

Allowed paths:
  research/v2/effect-ui-reactivity/**

Draft PR base:
  agent/chat-corpus-reconciliation
```

This prompt is not runnable until the SHA placeholder is replaced.

## Mandatory shared contract

Read and obey completely:

- `prompts/research-v2/00-SHARED-RESEARCH-CONTRACT.md`;
- `research/prompt-curation/EFFECT-V4-BUN-RESEARCH-DOCTRINE.md`;
- `research/prompt-curation/EFFECT-SKILL-ADAPTATION.md`.

Use the connected **`@GitHub`** capability directly. Before extended research, create the branch, commit/push `START-RECEIPT.md`, and open the draft PR. Stop if GitHub writes are unavailable.

You may change only the allowed path. Do not implement the application or edit maintained authority.

## Required additional reading

Read:

- `product/FEATURE_SPEC.md`, especially question player, hazard player, simulation, offline manager, accessibility, and page-state sections;
- `docs/LANDSCAPE.md` accessibility/design sections;
- the two raw first-pass UI reports E01/E03;
- `research/initial-pass/NORMALIZATION.md`;
- the latest upstream `effect/unstable/reactivity` source and every current `@effect/atom-*` package relevant to compared renderers.

## Objective

Separate:

1. durable domain/content state;
2. Effect workflow/lifecycle state;
3. renderer-neutral screen state;
4. renderer-local high-frequency interaction state;
5. actual DOM and accessibility effects.

Evaluate current v4 rather than carrying forward SubscriptionRef/lit-html assumptions.

## Research questions

### 1. Current v4 state/reactivity surface

Establish current contracts, stability, package status, and bundle implications for:

- Ref and synchronized mutable state;
- PubSub;
- Stream event sources;
- `effect/unstable/reactivity`;
- Atom concepts;
- `@effect/atom-react`;
- `@effect/atom-solid`;
- `@effect/atom-vue`;
- any framework-neutral registry/subscription APIs;
- lifecycle/disposal semantics.

Determine which APIs are appropriate for production despite v4 being required. Do not make unstable reactivity mandatory merely because it is Effect-native.

### 2. State ownership model

Design an explicit state/command/result model for:

- selected but uncommitted answer;
- commit in progress;
- durable commit success;
- typed commit failure and retry;
- revealed explanation;
- flag state;
- current session;
- timer;
- offline status;
- pack download progress;
- hazard markers and viewport transform;
- route/island disposal.

Do not mirror every DOM property into an Effect Ref. Keep pointer-move/pan/zoom scratch state local until it becomes a semantic command.

### 3. Renderer comparison

Compare at minimum:

- direct semantic DOM controller;
- Web Components/custom elements;
- a tiny declarative renderer such as lit-html;
- Preact;
- Solid;
- React;
- current Effect Atom integrations.

Evaluate:

- semantic initial HTML;
- hydration/enhancement;
- accessibility and focus;
- lifecycle ownership;
- listener/subscription cleanup;
- keyed lists and simulation grid;
- hazard SVG interaction;
- testability;
- bundle closure;
- service-worker/offline behavior;
- static atlas/profile compatibility;
- package placement;
- v4 integration/stability;
- migration cost.

Do not choose a renderer by ecosystem size or personal familiarity.

### 4. Effect/renderer boundary

Develop patterns for:

```text
DOM / renderer event
  -> semantic command
  -> Effect use case
  -> typed result or screen-state snapshot
  -> render
  -> focus/live-region/scroll effect
```

Determine whether ManagedRuntime, Atom registry, streams, callbacks, or a small dispatch bridge should connect the layers.

### 5. No custom UI framework

List anti-patterns that would indicate the direct-DOM implementation is recreating:

- virtual DOM/diffing;
- reactive dependency tracking;
- component lifecycle;
- event delegation framework;
- custom form semantics;
- home-grown accessibility primitives.

## Required question-player spike design

Specify and, where feasible in research fixtures, prototype the smallest complete spike that includes:

- static semantic initial HTML;
- Schema-decoded fixture;
- restoration;
- selection;
- explicit durable commit;
- injected IndexedDB success/failure;
- no reveal on failure;
- idempotent retry;
- reveal;
- focus move and live-region announcement;
- flag;
- next item;
- scope disposal/navigation;
- browser test;
- bundle measurement.

The same renderer-neutral use case/state model must be exercisable through at least:

- direct DOM;
- one declarative candidate.

This is a research fixture, not product code.

## Migration triggers

Define measurable triggers for adopting a declarative renderer:

- number/complexity of render branches;
- duplicated state reconciliation;
- listener/subscription leaks;
- focus/accessibility drift;
- keyed-list update complexity;
- state transition tests blocked by view coupling;
- size/latency cost;
- developer-error rate in fixture changes.

## Required outputs

```text
V4-REACTIVITY-MAP.md
STATE-OWNERSHIP.md
RENDERER-COMPARISON.csv
EFFECT-RENDERER-BOUNDARY.md
QUESTION-PLAYER-SPIKE-SPEC.md
MIGRATION-TRIGGERS.md
ANTI-CUSTOM-FRAMEWORK.md
fixtures/
raw-results/
```

Keep the final renderer recommendation provisional until the full browser spike and bundling lane can be reconciled.
