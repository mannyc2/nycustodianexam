# Renderer migration triggers

Renderer adoption is evidence-driven. Crossing one trigger starts the matched spike; it does not automatically select a framework.

## Direct DOM to lit-html evaluation trigger

Run or update the lit-html spike when any two conditions persist across two feature changes, or any one condition causes an accessibility/data-loss defect:

- one screen has more than about 8 materially different conditional render branches;
- the same semantic state is reconciled in 3 or more separate DOM update sites;
- keyed insertion/reorder/removal logic exceeds one reviewed helper or causes identity/focus defects;
- a change requires replacing a whole interactive region rather than updating stable nodes;
- listener attachment/removal cannot be proven one-for-one in tests;
- focus/live-region behavior regresses twice in a rolling 10-change window;
- state-transition tests require DOM reads to determine application state;
- a view change produces repeated stale-node, duplicate-listener, or lost-focus defects;
- simulation grid/hazard overlays need declarative keyed structures that direct DOM code begins diffing manually.

## lit-html to Solid evaluation trigger

Evaluate Solid only when one of these remains after a disciplined lit implementation:

- local derived state forms a real fine-grained dependency graph rather than a small snapshot;
- high-frequency partial updates cause unacceptable measured work with template rerenders;
- component composition/lifetime is repeated across at least 3 complex islands;
- keyed nested collections and conditional ownership dominate view code;
- reusable interactive primitives require framework lifecycle rather than ordinary functions/native controls;
- the team begins building signals, memoization, scheduling, or component ownership around lit.

## Stop trigger for direct DOM

Stop adding infrastructure immediately if direct-DOM code introduces any of:

- virtual-node descriptions or generic tree diffing;
- a dependency graph that tracks reads and reruns writers;
- a component lifecycle registry;
- generic delegated event/action routing across the application;
- custom form-control semantics or keyboard behavior;
- a general scheduler/batching system;
- a reusable templating language with directives.

At that point, use a maintained renderer rather than continue a custom framework.

## Measurement gates

The candidate must pass all qualitative gates:

- semantic initial HTML and crawlable fallback;
- no precommit answer leakage;
- durable commit-before-reveal;
- keyboard/focus/live-region parity;
- deterministic teardown without leaks;
- same renderer-neutral model and tests;
- static/offline/service-worker compatibility.

Numeric bundle and latency limits are provisional until R2.5. Compare production closures with the same Vite settings, minification, source-map policy, browser, cache state, and measurement script. Do not compare package marketing sizes or unbundled source bytes.

## Developer-error signal

For each fixture change, record:

- number of view-specific edits;
- new reconciliation branches;
- focus/listener defects caught in review/tests;
- time to implement the same accepted behavior;
- bundle delta and interaction timing.

A renderer is justified when it repeatedly lowers error rate and maintenance cost without violating bundle, accessibility, and static-acquisition constraints.
