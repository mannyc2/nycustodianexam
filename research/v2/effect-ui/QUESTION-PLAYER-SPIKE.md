# Question-player spike design

## Purpose

The spike chooses between disciplined direct DOM and standalone `lit-html` for the first interactive player. It is not a production implementation and it does not compare toy examples.

Both renderer arms must use:

- the same immutable fixture data;
- the same renderer-neutral controller;
- the same fake and real persistence ports;
- the same behavioral and accessibility tests;
- the same mount and disposal harness;
- the same hazard-player extension.

No renderer-specific state machine is allowed.

## Fixture

Use one fixed single-choice question with:

- four options;
- one image or tool illustration with neutral pre-answer description;
- one correct answer;
- a general explanation;
- one distractor rationale per incorrect option;
- source references;
- pinned question, content-pack, and announcement-profile versions.

The public fixture given to pre-commit rendering excludes the key, correctness, and rationales. A separate reveal fixture is available only through the successful commit result.

## Screen model

`RecoveringCommitOutcome` below is an internal refinement of the product-level `COMMITTING` phase. It keeps the submitted choice locked while the repository determines whether an interrupted or detached transaction committed.

```ts
type QuestionScreen =
  | {
      readonly _tag: "Ready"
      readonly publicQuestion: QuestionPublicView
    }
  | {
      readonly _tag: "Selected"
      readonly publicQuestion: QuestionPublicView
      readonly selectedOptionId: OptionId
      readonly commandId: Option<AttemptCommandId>
      readonly commitError: Option<RetryableCommitError>
    }
  | {
      readonly _tag: "Committing"
      readonly publicQuestion: QuestionPublicView
      readonly selectedOptionId: OptionId
      readonly commandId: AttemptCommandId
    }
  | {
      readonly _tag: "RecoveringCommitOutcome"
      readonly publicQuestion: QuestionPublicView
      readonly selectedOptionId: OptionId
      readonly commandId: AttemptCommandId
    }
  | {
      readonly _tag: "Revealed"
      readonly publicQuestion: QuestionPublicView
      readonly selectedOptionId: OptionId
      readonly committedAttempt: CommittedQuestionAttempt
      readonly reveal: QuestionReveal
    }
  | {
      readonly _tag: "Reviewed"
      readonly committedAttempt: CommittedQuestionAttempt
      readonly reveal: QuestionReveal
      readonly review: ReviewDisposition
    }
```

The `QuestionReveal` type is not a property of any pre-commit variant.

## Intent model

```ts
type QuestionIntent =
  | { readonly _tag: "SelectOption"; readonly optionId: OptionId }
  | { readonly _tag: "Submit" }
  | { readonly _tag: "RetryCommit" }
  | { readonly _tag: "ResolveUnknownOutcome" }
  | { readonly _tag: "MarkReviewed"; readonly disposition: ReviewDisposition }
```

The pure transition function returns the next state plus zero or more semantic commands. Effect executes those commands and feeds typed outcomes back into the transition function.

## Controller port

```ts
interface QuestionPlayerController {
  readonly getSnapshot: () => QuestionScreen
  readonly subscribe: (
    listener: (screen: QuestionScreen, requests: ReadonlyArray<UiRequest>) => void
  ) => () => void
  readonly dispatch: (intent: QuestionIntent) => void
  readonly dispose: () => Promise<void>
}
```

The controller has no DOM, Lit, Solid, React, Preact, or Atom types in its public contract.

## Commit command

```ts
interface CommitQuestionAttempt {
  readonly commandId: AttemptCommandId
  readonly sessionId: StudySessionId
  readonly questionId: QuestionId
  readonly questionVersion: QuestionVersion
  readonly contentPackVersion: ContentPackVersion
  readonly profileVersion: AnnouncementProfileVersion
  readonly selectedOptionId: OptionId
  readonly committedAt: DateTime.Utc
}
```

The repository success type means that the IndexedDB transaction completed successfully. An individual object-store request success is not enough.

### Success path

1. `Submit` allocates or reuses a command id.
2. State becomes `Committing`; selection is frozen.
3. The repository runs one transaction for the immutable attempt event and coupled materialized updates.
4. The transaction completion event resolves the Effect.
5. The committed result is read or returned.
6. The controller obtains the reveal payload for the pinned question version.
7. State becomes `Revealed`.
8. The controller emits `AnnounceSaved` and `FocusOutcome` requests.

### Confirmed failure path

1. The repository returns a typed confirmed failure or abort.
2. State returns to `Selected` with the same option and a retryable error.
3. Reveal remains absent.
4. Selection is editable.
5. The renderer announces the failure and focuses the error summary or submit control according to the accessibility design.

### Unknown-outcome path

1. The repository cannot prove whether the transaction committed.
2. State becomes `RecoveringCommitOutcome` with selection frozen.
3. The controller queries by command id.
4. A found attempt transitions to `Revealed`.
5. A confirmed absent attempt transitions to editable `Selected` with a recovery message.
6. No reveal occurs before read-back confirms the committed record.

### Duplicate submit path

While `Committing` or `RecoveringCommitOutcome`, additional submit input is ignored or coalesced. The repository also enforces idempotency by command id. The fixed test must show one durable attempt, not merely one UI callback.

## Direct DOM arm

Requirements:

- create a stable form/fieldset/radio DOM skeleton;
- attach one delegated input/click handler at the root where practical;
- patch from the complete snapshot in one module;
- use stable node identity for options and post-commit regions;
- never infer selected or committed state from the DOM;
- never install a listener during every render without replacing or releasing it;
- expose instrumentation counters for listeners, subscriptions, patch branches, and created nodes;
- dispose through the controller Scope.

The arm fails the architecture gate if it grows a second generic reconciliation system, a hidden DOM-as-state convention, or separate state logic for the hazard extension.

## `lit-html` arm

Requirements:

- subscribe to the same controller;
- render one template from each snapshot;
- use stable keys for changing collections;
- use declarative event handlers that dispatch semantic intents;
- keep focus and live-announcement execution in a post-render adapter;
- prohibit unsafe HTML for content prose;
- expose the same instrumentation counters where meaningful;
- dispose the root subscription and template root through the controller Scope.

The arm fails if it pushes domain state into directives or makes template evaluation responsible for persistence and reveal decisions.

## Required markup behavior

### Pre-commit

- use a real `form`, `fieldset`, `legend`, and radio inputs;
- option labels are the only answer choices exposed;
- no correctness class, `data-*` key, hidden rationale, answer-bearing accessible label, or pre-rendered explanation;
- selection can change until explicit submit;
- submit is disabled only when no option is selected or a commit/recovery is active.

### Committing

- submitted radios and submit control are frozen;
- a polite status announces saving;
- no correctness content is inserted;
- repeated submit cannot create another command.

### Failure

- the selected answer remains visible;
- controls are re-enabled only for a confirmed failure;
- error text identifies the recoverable save problem without falsely claiming the attempt did not commit when the outcome is unknown;
- retry reuses the command id where required.

### Revealed

- outcome heading or summary receives programmatic focus with a stable target;
- correctness is not color-only;
- explanation, distractor rationales, and sources are present;
- answer controls cannot change the committed selection;
- review action is available.

## Fixed tests

### Pure application tests

- Ready -> Selected on option choice.
- Selected -> Selected when changing choice.
- Selected -> Committing only on explicit submit.
- double submit creates one command.
- confirmed failure -> Selected with no reveal.
- retry preserves idempotency context.
- unknown outcome -> RecoveringCommitOutcome with frozen choice.
- read-back found -> Revealed.
- read-back absent -> editable Selected.
- transaction complete -> Revealed.
- request success without transaction complete -> not Revealed.
- Revealed cannot accept a new selection.
- reload from committed attempt restores Revealed with pinned versions.

### Renderer contract tests

- direct DOM and Lit produce equivalent semantic roles, names, states, and text.
- pre-commit serialized DOM contains no key, correctness, rationale, or explanation.
- status and error announcements occur once.
- focus moves to the outcome only after reveal.
- 100 mount/unmount cycles leave zero controller subscriptions and no duplicate event dispatch.
- keyboard interaction changes selection and submits correctly.
- browser back/forward or island disposal does not update detached DOM.

### Persistence tests

- the Effect resolves only on transaction completion.
- abort maps to a typed confirmed failure.
- interrupted/unknown outcome maps to recovery, not false failure.
- retry with the same command id creates at most one attempt.
- coupled attempt/progress writes are atomic.

## Hazard-player extension

After the question tests pass, extend each renderer arm with the same hazard controller.

### Semantic model

```ts
type HazardMark = {
  readonly id: HazardMarkId
  readonly point: ScenePoint
}

type HazardIntent =
  | { readonly _tag: "AddMark"; readonly point: ScenePoint }
  | { readonly _tag: "MoveMark"; readonly markId: HazardMarkId; readonly point: ScenePoint }
  | { readonly _tag: "RemoveMark"; readonly markId: HazardMarkId }
  | { readonly _tag: "SelectMark"; readonly markId: HazardMarkId }
  | { readonly _tag: "Submit" }
```

Raw pointer moves do not appear in `HazardIntent`.

### Extension tests

- zero marks can be submitted;
- no target count or target geometry appears before commit;
- pointer pan/zoom emits no application-state update per pointer move;
- add, move, and remove emit one semantic command per completed action;
- 30 stable keyed marks retain identity during edits;
- keyboard controls can add, select, move, and remove marks;
- visual marks and textual mark list remain synchronized;
- duplicate and decoy results appear only after durable commit;
- results are not color-only;
- post-commit visual and nonvisual views encode the same score model;
- 100 mount/unmount cycles release pointer listeners, observers, subscriptions, and renderer roots.

## Measurements

Record for each arm:

- renderer-only source lines;
- number of state-specific patch branches;
- number of manual listener install/remove sites;
- number of manual keyed-identity maps;
- defects found by the fixed suite;
- mount/unmount leak counters;
- production route closure in raw, gzip, and Brotli bytes;
- render time for the fixed question transitions;
- mark update and pan/zoom frame timing on a named reference device;
- number of application snapshot emissions during a 500-event pointer gesture.

No metric is valid unless both arms implement the same behavior and tests.

## Decision

Use the rules in `MIGRATION-CRITERIA.md`.

- Direct DOM wins only when it passes every invariant without creating a project-owned reconciler and remains comparably small.
- `lit-html` wins when it removes measurable reconciliation/listener complexity within the accepted route budget.
- Solid receives a spike only when neither arm meets the gates or the product accumulates several independently updating complex islands.
