# State ownership model

## Rule

Every state value has one authoritative owner. Reactive stores and renderers may project that value, but they do not become additional authorities.

The required data flow is:

`IndexedDB -> application model -> optional reactive projection -> renderer`

User actions flow in the opposite direction as semantic intents. Only the application and persistence layers can authorize a reveal.

## Ownership layers

| Layer | Owns | Must not own |
|---|---|---|
| Durable IndexedDB model | Attempt events, materialized progress, review state, pinned session/content/profile versions, idempotency records, settings that survive reload | DOM nodes, focus handles, animation state, correctness presentation |
| Renderer-neutral application state | Current public question, selected option, submission phase, typed commit error, stable command id, committed attempt, reveal payload, semantic hazard marks, review phase | Browser transaction objects, concrete DOM nodes, pointer-move samples |
| Effect workflow | Service access, transaction command, retry and reconciliation, interruption policy, query invalidation, logging, tracing, Scope and child-fiber lifetime | CSS classes, element identity, pixel layout |
| Optional Atom projection | Subscription fan-out, derived values, async query projection, framework bridge, scoped cache lifetime | Durable truth, business transition rules, transaction success definition |
| Renderer-local state | Hover, active/pressed state, pointer capture, in-progress drag, transient pan/zoom, ResizeObserver values, animation, actual focus target | Selected answer authority, scoring, commit result, reveal authorization |

## Question-player states

The pre-commit and post-commit data shapes must be separate. `RecoveringCommitOutcome` is a technical substate of the product-level `COMMITTING` phase; it does not add a new answer or reveal phase.

```ts
type QuestionScreen =
  | Ready
  | Selected
  | Committing
  | RecoveringCommitOutcome
  | Revealed
  | Reviewed
```

### `Ready`

Application-owned:

- public question identifier and version;
- prompt, option labels, and neutral media description;
- pinned session/content/profile identifiers;
- no selected option;
- no reveal payload.

Renderer-local:

- focus and hover;
- layout and image loading state;
- no answer correctness metadata.

### `Selected`

Application-owned:

- selected option id;
- optional confirmed retryable commit error;
- stable command id once a submit attempt has been prepared;
- selection remains editable only when no commit may have succeeded.

Renderer-local:

- checked radio presentation derived from the snapshot;
- pressed/hover styling.

### `Committing`

Application-owned:

- frozen submitted option;
- command id;
- start metadata needed for observability;
- no reveal payload.

Effect-owned:

- repository fiber;
- transaction settlement;
- interruption masking or unknown-outcome conversion;
- typed error mapping.

Renderer-local:

- disabled controls and progress presentation;
- live announcement implementation.

### `RecoveringCommitOutcome`

This state is required when the process lost the transaction result but cannot prove rollback.

Application-owned:

- frozen selection and command id;
- recovery attempt state;
- no reveal payload.

Effect-owned:

- read-back by command id;
- transition to `Revealed` when a committed attempt is found;
- transition to editable `Selected` only after absence or abort is confirmed.

The renderer must not allow a conflicting selection while the outcome is uncertain.

### `Revealed`

Application-owned:

- committed attempt identity;
- immutable submitted option;
- correctness result;
- explanation and distractor rationales;
- source references;
- review action availability;
- pinned content and profile versions.

Renderer-local:

- concrete focus target;
- expanded/collapsed optional detail presentation;
- animation that does not change domain state.

### `Reviewed`

Application-owned:

- review disposition and durable result where required;
- navigation eligibility.

Renderer-local:

- focus and transition animation.

## Hazard-player ownership

### Application-owned semantic state

- stable mark ids;
- committed mark coordinates in scene space;
- mark add/move/remove order when it affects attempt reproduction;
- selected semantic mark when keyboard commands act on it;
- explicit submit phase;
- committed score and target matches only after durability succeeds;
- synchronized result model used by both image and text views.

### Renderer-local high-frequency state

- raw pointer coordinates;
- active pointer id and capture;
- in-progress drag delta;
- kinetic pan and zoom animation;
- hover target;
- viewport matrix and layout measurements while a gesture is active;
- transient ghost mark before confirmation.

The renderer emits one semantic command after a gesture is committed. Pointer-move events must not publish a new application snapshot unless the product deliberately chooses live collaborative state, which is outside the current scope.

## Semantic UI effects

Focus and announcements cross the application/renderer boundary as semantic requests:

```ts
type UiRequest =
  | { readonly _tag: "AnnounceSaving" }
  | { readonly _tag: "AnnounceCommitFailure"; readonly message: string }
  | { readonly _tag: "FocusOutcome" }
  | { readonly _tag: "FocusCommitError" }
```

The application decides when the request is semantically required. The renderer decides how to locate the concrete element and perform the DOM operation.

## Atom ownership rules

Atom may be adopted when it provides one of these concrete benefits:

- two or more independent consumers need the same snapshot or derived value;
- a scoped Effect or Stream should start while observed and stop when unused;
- framework bindings remove a measured amount of adapter code;
- keyed async query invalidation is needed across components.

Atom must not:

- replace the durable repository;
- encode correctness data into pre-commit screen state;
- make `AsyncResult.Success` synonymous with IndexedDB durability unless the underlying Effect resolves on transaction completion;
- duplicate state already owned by a controller or framework store;
- own raw pointer-motion state;
- leak a global registry across independent sessions or tests without an explicit reason.

## Scope rules

A mounted interactive island owns one Effect Scope. That Scope owns:

- the controller subscription;
- DOM event listeners not delegated through the root;
- `ResizeObserver`, `IntersectionObserver`, and media listeners;
- AtomRegistry when used;
- query subscriptions and streams;
- cancelable child work.

Closing the Scope detaches UI resources. It does not silently assert that an already-started IndexedDB transaction rolled back.

## Testable ownership assertions

1. The application transition suite runs with no DOM implementation.
2. The renderer suite can replace the persistence service with a deterministic fake.
3. Serialized pre-commit DOM contains no correct option, rationale, correctness class, or answer-bearing hidden text.
4. A confirmed persistence failure leaves the answer editable and unrevealed.
5. An unknown persistence outcome locks conflicting edits until read-back resolves.
6. A successful transaction completion is the earliest event that can construct `Revealed`.
7. Repeated mount/unmount closes all listeners, subscriptions, observers, roots, and Atom nodes.
8. Pointer motion does not mutate the application model until a semantic mark command is committed.
