# Renderer and Atom migration criteria

These are proposed project decision gates. Numeric thresholds are adoption policy, not observed measurements. No candidate has passed them in this documentation-only lane.

## Non-negotiable gates for every renderer

A candidate is rejected if any item fails:

1. All pure question and hazard transition tests pass without a DOM.
2. Reveal is impossible before IndexedDB transaction completion or committed-record read-back.
3. Confirmed persistence failure does not reveal and leaves the question recoverable.
4. Unknown commit outcome does not unlock a conflicting answer and does not reveal without reconciliation.
5. The pre-commit DOM and accessibility tree contain no key, correctness, rationale, target count, target geometry, or answer-bearing metadata.
6. Keyboard and nonvisual paths satisfy the maintained feature contract.
7. Focus and live announcements occur at the specified semantic transitions.
8. One hundred mount/unmount cycles produce no net listeners, controller subscriptions, observers, renderer roots, Atom nodes, or duplicate command dispatch.
9. High-frequency pointer motion stays renderer-local; a 500-event gesture produces no more than one semantic application update at gesture commit, excluding deliberate live accessibility output.
10. The renderer imports no persistence implementation and contains no scoring or reveal authorization rule.

## Matched-spike rule

Direct DOM and standalone `lit-html` must implement the same fixture and test suite before either is selected.

Collect:

- renderer-only logical source lines;
- manual DOM patch branches;
- listener install/remove sites;
- manual keyed-identity structures;
- behavioral and accessibility defects;
- mount/unmount leak counts;
- production route closure in raw, gzip, and Brotli bytes;
- reference-device transition and hazard-mark timings.

Generated code, shared controller code, tests, content fixtures, and CSS are excluded from renderer-only source-line comparison.

## Direct DOM adoption gate

Choose direct DOM for the player only when all conditions hold:

- every non-negotiable gate passes;
- there is one centralized state-to-DOM patch module;
- business state is never read back from DOM classes, attributes, datasets, or input nodes;
- options and hazard marks do not require a reusable general-purpose reconciler;
- listener ownership is explicit and disposal is complete;
- renderer-only source lines are no more than 15 percent greater than the `lit-html` arm;
- it has no more behavioral, accessibility, identity, or cleanup defects than the `lit-html` arm;
- the hazard extension does not add a second rendering convention.

Direct DOM remains the default for static pages and simple enhancements even when another renderer wins for the player island.

## Standalone `lit-html` adoption gate

Choose standalone `lit-html` for the player when all non-negotiable gates pass and at least one condition holds:

- renderer-only source lines are at least 20 percent lower than direct DOM; or
- it removes a manual keyed-identity structure; or
- it prevents at least one repeated listener, stale-node, conditional-region, or focus-preservation defect found in the direct DOM arm.

It must also:

- add no more than a provisional 10 KiB Brotli to the production interactive route closure relative to the direct DOM arm;
- use no unsafe HTML for authored content;
- keep focus and announcements in an explicit adapter;
- keep the application controller renderer-neutral.

If the target application later sets a stricter route budget, the stricter budget wins.

## Solid escalation gate

Run a Solid spike only when at least one trigger is documented:

- both direct DOM and `lit-html` fail a non-negotiable gate for reasons attributable to rendering/lifecycle complexity;
- at least three production screens contain independently updating, reusable interactive component graphs;
- the hazard player requires multiple keyed collections or nested lifecycles that the template-only adapter handles with project-owned infrastructure;
- measured update cost on the reference device misses the product target and fine-grained ownership is a plausible remedy.

Adopt Solid only when:

- it passes every non-negotiable gate;
- its component and owner model removes at least 20 percent of renderer/lifecycle code relative to the best earlier arm or fixes a documented defect class;
- JSX/compiler adoption is accepted as a project architecture change;
- its production route closure fits a separately approved budget;
- state is not duplicated across the application controller, Atom, and Solid signals;
- the official `@effect/atom-solid` package is revalidated against the exact Effect version selected for implementation.

Solid may be mounted as an interactive island. Its adoption does not require converting static acquisition pages.

## React adoption gate

Do not run a React spike without a written external requirement, such as:

- an existing React application to integrate with;
- a required React-only accessible component or editor ecosystem;
- a team-wide React operational standard;
- an already-selected React server-rendering architecture.

The existence of `@effect/atom-react` is not a requirement. If a trigger appears, remeasure React 19, scheduler, the Atom binding, hydration, Strict Mode/remount behavior, and route cost in the target application.

## Preact adoption gate

Do not run a Preact spike unless a React-like API is independently justified and Preact has a measurable cost advantage.

Before adoption, verify:

- whether a project-owned controller hook is sufficient;
- whether `@effect/atom-react` under `preact/compat` is supported or merely happens to compile;
- scheduler, Suspense, hydration, and disposal behavior;
- peer dependency and package-manager resolution;
- route closure and defect rates against Solid and `lit-html`.

No official Preact Atom binding was present at the pinned Effect coordinate, so Effect-native integration cannot be counted as a current advantage.

## Effect Atom adoption gate

Adopt Atom in a screen only when at least one trigger is measured:

- two or more independent consumers need the same snapshot or derived value;
- an Effect/Stream should be started while observed and finalized when unused;
- query invalidation or async result projection removes duplicate orchestration;
- an official framework binding removes meaningful adapter code.

All conditions must also hold:

- the application state machine remains usable and testable without Atom;
- the Atom layer is a projection, not a second source of truth;
- a screen-owned registry has explicit creation and disposal;
- registry reset/dispose, subscription cleanup, and running-effect interruption are tested;
- IndexedDB commit settlement remains defined by the repository, not Atom disposal;
- unstable imports are isolated behind a project-owned module;
- the exact Effect source and package cohort are rechecked at adoption time.

Do not adopt Atom solely to store one question screen for one renderer subscriber. A small controller subscription is lower risk in that case.

## Migration triggers after initial adoption

Migrate from direct DOM to `lit-html` when any two occur in production work:

- a second manual keyed collection is introduced;
- a third conditional region needs bespoke insertion/removal logic;
- listener replacement or stale-node defects recur;
- focus restoration requires DOM reconstruction workarounds;
- renderer-only source lines exceed the matched Lit adapter by more than 20 percent;
- the hazard visual and text views drift because updates are patched separately.

Migrate from `lit-html` to Solid only when the Solid escalation gate is met. Do not migrate because JSX is preferred stylistically.

Migrate from a controller subscription to Atom only when the Atom adoption gate is met. Do not migrate to make the architecture appear more Effect-native.

## Revalidation schedule

Re-run the relevant gates:

- when Effect moves from `4.0.0-rc.111` to another release candidate or final v4;
- when a renderer major version changes;
- when the first full hazard player is designed;
- when offline persistence and session restoration are integrated;
- before setting a global renderer standard for the repository.
