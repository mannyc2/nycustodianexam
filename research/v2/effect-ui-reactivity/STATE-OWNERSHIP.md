# State ownership model

## Five ownership layers

### 1. Durable domain and content state

Authoritative after IndexedDB transaction completion:

- immutable content objects and active pack version;
- append-only attempt event keyed by stable attempt ID;
- materialized progress/review queue derived from committed attempts;
- persisted study-session draft when intentionally supported;
- durable flag state when product semantics require it;
- active session version and restoration metadata.

This state is not owned by Ref, Atom, a component, or DOM attributes.

### 2. Effect workflow and lifecycle state

Owned by use cases, services, fibers, and Scopes:

- restoration in progress;
- commit request and persistence transaction lifecycle;
- typed commit rejection, timeout, interruption, or unknown outcome;
- idempotent reconciliation by attempt ID;
- pack download/verification/activation workflow;
- online/offline observers;
- timer fibers when the timer has workflow semantics;
- route/island resource acquisition and cleanup.

### 3. Renderer-neutral screen snapshot

Immutable data sufficient to render one state without reading the DOM:

- phase: restoring, ready, committing, commit-failed, revealed, disposed;
- selected option ID;
- stable attempt ID for retry;
- typed user-facing error projection;
- revealed result only after durable settlement;
- flag state;
- current item/session identifiers and index;
- timer display value;
- offline and pack-progress presentation;
- semantic hazard markers;
- semantic viewport state when it must persist/share;
- live-region message and focus intent;
- monotonically increasing revision.

The snapshot is ordinary TypeScript. It may be projected through Atom later, but Atom is not required.

### 4. Renderer-local high-frequency interaction state

Kept out of Effect and the durable model until it becomes a semantic command:

- pointer coordinates during drag;
- hover/pressed state already represented by browser/CSS;
- pan velocity and transient transform matrix;
- pinch gesture deltas;
- animation frame bookkeeping;
- text selection/caret mechanics;
- temporary SVG hit-test caches;
- ResizeObserver/IntersectionObserver measurements.

A completed hazard marker becomes `PlaceMarker(scenePoint)`; raw pointer movement does not.

### 5. DOM and accessibility effects

Owned by the renderer adapter:

- native control values and disabled state;
- semantic element creation/update;
- focus after render;
- live-region text;
- scroll into view;
- selection restoration;
- listener attachment/removal;
- observer attachment/removal;
- renderer-root mount/unmount.

These effects are explicit and testable. They are not hidden inside the domain use case.

## Required state mapping

| Concern | Authoritative owner | Screen projection | Renderer-local portion | Persistence rule |
|---|---|---|---|---|
| selected but uncommitted answer | screen/session draft model | selected option ID, commit enabled | native radio focus/pressed behavior | may persist as resumable draft; never append attempt yet |
| commit in progress | Effect use case | committing phase, controls locked | button visual state | no reveal |
| durable commit success | IndexedDB attempt event | transition permits grading/reveal | none | wait for transaction completion or reconcile committed ID |
| typed commit failure | Effect error channel | commit-failed, retryable error, error focus intent | focus error panel after render | selection and attempt ID retained; no reveal |
| retry | use case plus stable attempt ID | retry label/phase | none | same semantic attempt uses same ID |
| revealed explanation | result authorized by settled commit | result and explanation | focus outcome, live announcement | impossible before durable gate |
| flag | product/session policy | `flagged` boolean | button `aria-pressed` | draft or durable session as specified; independent of correctness |
| current session | durable session record plus use case | item/version/index | none | active content version retained across pack update |
| timer | Clock-driven scoped workflow if authoritative; local display otherwise | elapsed/remaining value | animation interpolation | persist only checkpoint/semantic timing data |
| offline status | browser event source behind service | online/offline/retrying status | icon/announcement | no false durability assumption |
| pack progress | download/verification stream | phase, counts, bytes, error | progress animation | activate only after verified atomic completion |
| hazard markers | semantic scene coordinate model | committed marker list | drag preview/hit test | persist marker command/result, not every pointer move |
| viewport transform | local unless session semantics require restore | normalized transform if shared/restored | gesture deltas/velocity | checkpoint only when useful |
| route/island disposal | child Scope/runtime owner | disposed phase only for tests | remove root/listeners/observers | close resources deterministically |

## Commit-before-reveal transition

```text
Ready(selected, attemptId?)
  -> CommitRequested(stableAttemptId)
  -> Effect persistence use case
     -> transaction complete: Committed
     -> outcome unknown: read attempt by stableAttemptId
        -> found identical: Committed
        -> absent/conflict: CommitFailed
     -> rejected/aborted: CommitFailed
  -> only Committed may request/derive grading result
  -> Revealed(result)
```

A UI component cannot skip this transition by setting a `revealed` boolean. The renderer receives a snapshot whose type/phase makes result data absent before settlement.
