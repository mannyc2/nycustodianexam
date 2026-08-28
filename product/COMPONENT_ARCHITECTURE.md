# Component architecture

**Status:** maintained implementation contract for the site UI. This document
includes the `CODEX-ONLY-UIUX-V1` standard/focused shell amendment, which is
**NOT HUMAN-USABILITY-TESTED**. It
implements the product behavior in `FEATURE_SPEC.md` and the delivery boundary
in `ARCHITECTURE_CONSTRAINTS.md`. `ROUTES.md` is the canonical route inventory,
and `SCREEN_STATES.md` controls legal state/transition combinations; this
document assigns those routes and states to UI families. Exam facts and allowed
study scope remain controlled by `../docs/`.

Normative terms: **MUST** is release-blocking, **SHOULD** is the expected v1
default, and **MAY** is optional.

## 1. Accepted UI boundary

The site uses two cooperating presentation paths:

1. **Static acquisition and reference HTML.** The content compiler emits useful,
   crawlable semantic HTML. These documents remain renderer-independent, work
   without JavaScript for their primary reading and navigation purpose, and do
   not import React, Effect, or the study runtime.
2. **Bounded React 19 interactive islands.** React is selected for stateful
   study, local-progress, filtering, pack-management, and form workflows where
   component lifecycle and keyed state synchronization materially help. Each
   island mounts inside one explicit owner element and is lazy-loaded only on a
   route that needs it.

React is not the page router, the static generator, the durable store, the
application state machine, or an excuse to turn the site into a client-rendered
SPA. Effect is not a renderer. A static route with no island MUST have no React
or Effect module or preload edge in its production route closure.

Interactive routes receive a renderer-neutral immutable `ScreenSnapshot` and
send semantic commands to a renderer-neutral controller. Persistence,
commit-before-reveal, content validation, deterministic assembly, and typed
application failures remain outside React. React owns only view composition,
view-local lifecycle, and explicitly bounded presentation scratch.

## 2. Dependency direction and module shape

These are module responsibilities, not a preselection of workspace/package
names:

```text
reviewed data + application capabilities
                 |
                 v
renderer-neutral snapshots, commands, and view effects
                 |
                 v
React island adapter/provider
                 |
                 v
compound UI family + foundation patterns
                 |
                 v
semantic DOM + shared design tokens
```

The dependency rules are:

- Foundation modules MUST NOT import a domain compound, controller, persistence
  provider, Effect runtime, or content registry.
- Static HTML templates MAY share semantic class names and tokens with islands,
  but MUST NOT import React implementations to do so.
- Domain compounds MAY import foundation modules and their own public
  state/action/meta contract. They MUST NOT open IndexedDB, fetch packs, build an
  Effect runtime, or infer business state from the DOM.
- The provider/adapter is the only UI module that knows how a snapshot is
  subscribed to or how a semantic command is dispatched.
- Island boot modules own mount/unmount and resource cleanup. A component MUST
  NOT create a browser runtime, service worker, database connection, or global
  listener during render.
- High-frequency pointer coordinates, capture state, pan velocity, and live
  layout measurements MAY remain view-local. A stable learner action such as
  adding/removing a marker, selecting an option, flagging, or submitting MUST be
  a semantic command.

Imports are direct and narrow. Code imports the exact family or primitive module,
for example `question-player/QuestionPlayer` or `foundation/StatusMessage`.
Package-wide `ui/index.ts` files and other broad barrels are prohibited because
they hide route closure and encourage static pages to acquire interactive code.
A compound family may export one namespaced object from its own module; that
object is the family API, not a cross-family barrel.

## 3. Composition rules

### Compose structure; do not configure modes

Domain components MUST NOT expose boolean mode props such as:

```text
isPractice  isReview  isSimulation  isVisual  isTimed
showFeedback  showSources  showMarkers  useStickyActions
```

Those APIs create invalid combinations and hide what a route renders. Use
explicit variants that compose the applicable pieces. Boolean values are still
appropriate when they represent one intrinsic platform fact, such as a native
control's `disabled`, `required`, `checked`, or `aria-expanded` state. They are
not appropriate as feature-mode switches.

Static structure is composed with `children`. Product UI modules MUST NOT expose
`renderHeader`, `renderFooter`, `renderActions`, or other `renderX` props. Data
belongs in the provider contract or in an ordinary leaf prop; structure belongs
in children.

Complex interactive families use compound components. A family frame supplies
semantic structure; its children read the family contract rather than receiving
long chains of drilled state and callbacks. Route variants make their included
parts visible in source.

### React 19 conventions

- Read context with React 19 `use(Context)`, never `useContext()`.
- Receive `ref` as an ordinary prop, never through `forwardRef()`.
- Use the React 19 context provider shorthand, `<Context value={...}>`.
- Keep render pure. Subscriptions, focus delivery, announcements, observers, and
  cleanup live in effects owned by the provider or an explicit leaf.
- Use stable content identities for keys. Array position is not a valid key for
  options, questions, markers, zones, citations, or review reasons.
- Do not mirror a complete `ScreenSnapshot` into a second reducer. The adapter
  subscribes to the controller's authoritative projection and provides it.

## 4. Foundation inventory

Foundations are semantic patterns first. A static HTML template and a React leaf
may implement the same pattern without forcing one renderer on the other.

| Foundation | Contract |
| --- | --- |
| `DocumentShell.Standard` | Skip link, site header, learner-task plus utility/trust navigation, active-profile context where relevant, one `main`, and footer. |
| `DocumentShell.FocusedPlayer` | Skip link, independent/unofficial site identity, relevant profile context, one `main` containing a named session landmark/progress, and a truthful explicit exit. It omits global navigation and footer; it may label the exit `Save and exit` only when durable behavior supports that claim. |
| `PageHeader` | One route title plus optional lead, metadata, breadcrumbs, and composed actions. It never invents profile facts. |
| `Stack`, `Cluster`, `Grid`, `Split`, `Sidebar` | Layout-only wrappers used when no more meaningful HTML element applies. Spacing comes from tokens, not per-page numbers. |
| `Prose`, `DefinitionList`, `MetadataList` | Readable source/profile/instruction content with a bounded measure and real list semantics. |
| `Button`, `Link`, `IconButton` | Preserve native button/link distinctions. Icon-only controls require an accessible name and visible tooltip/help where ambiguity remains. |
| `Field`, `ChoiceGroup`, `CheckboxField`, `SelectField` | Native labels, descriptions, errors, and control relationships. Single-choice answers use radio semantics. |
| `ActionBar` | Composed primary/secondary actions. It may adopt the sticky layout defined in `DESIGN_SYSTEM.md` but does not choose actions by flags. |
| `StatusMessage`, `ErrorSummary`, `Notice`, `EmptyState` | Explicit, titled feedback with recovery actions. Error, warning, success, info, offline, and stale forms are named variants, not color-only tones. |
| `LiveRegion` | One bounded announcement endpoint per island. It does not contain full visual feedback or duplicate the focused outcome heading. |
| `ProgressMeter`, `PositionLabel` | Shows actual session progress or generated distribution only; never implies an official exam length or score. |
| `Disclosure`, `Dialog` | Prefer native semantics. Dialogs trap focus only while open, have a named close control, and restore focus to the invoker. |
| `Figure`, `ImageViewport` | Figure/caption and bounded pan/zoom structure. Pinch and drag are supplementary to explicit controls. |
| `VisuallyHidden` | Limited to accessible names/instructions that do not leak an answer. It MUST NOT hide answer-bearing precommit content. |

Do not create a wrapper component for every HTML element. Use native headings,
paragraphs, lists, tables, details, fieldsets, labels, buttons, and links directly
when they already express the contract.

## 5. Shared content compounds

Shared compounds render reviewed data consistently in static pages and islands.
The static and React implementations must obey the same field and status rules.

### `Fact`

Composition:

```text
Fact.Root
  Fact.Label
  Fact.Value
  Fact.Status
  Fact.Source
  Fact.VerifiedAt
  Fact.ProfileVersion
```

Named `VerifiedFact`, `NotPublishedFact`, `UnverifiedFact`, `ConflictingFact`,
`SupersededFact`, and `NotApplicableFact` compositions determine which pieces
appear. No `isConflicting` or `showSource` API is allowed. Conflicting facts
render every retained value and source; unavailable states never substitute
guessed text.

### Other shared compounds

| Family | Principal pieces |
| --- | --- |
| `ProfileCard` | identity, series level, competition type when known, six-state facts with effective history, content availability, last verification, and explicit select/details actions |
| `SourceCitation` | tier, title, publisher, exact locator/date, retained excerpt, online link state, and supported-claim relationship |
| `CorrectionNotice` | affected immutable version, correction summary, effective date, historical-result notice, and details action |
| `SessionSummary` | pinned profile/pack versions, actual length/distribution, mode label, seed/manifest reference where exposed, and resume/start action |
| `ContentAvailability` | available, missing-pack, stale-pack, retired-content, or invalid-content named composition with one truthful recovery path |
| `PageState` | named loading, empty, unavailable, offline-unavailable, and failure compositions that implement the behavior matrix in `DESIGN_SYSTEM.md` |

## 6. Domain compound families

### `QuestionPlayer`

The family API is composed from:

```text
QuestionPlayer.Provider
QuestionPlayer.Frame
QuestionPlayer.Header
QuestionPlayer.Position
QuestionPlayer.Prompt
QuestionPlayer.VisualBody
QuestionPlayer.NonvisualBody
QuestionPlayer.Choices
QuestionPlayer.FlagAction
QuestionPlayer.CommitAction
QuestionPlayer.CommitStatus
QuestionPlayer.Outcome
QuestionPlayer.Rationales
QuestionPlayer.ConfusionFeedback
QuestionPlayer.Sources
QuestionPlayer.ReviewActions
QuestionPlayer.Navigation
```

The route renders an explicit workflow variant:

- `PracticeQuestion` composes selection, explicit commit, commit status, and —
  only after the settled snapshot permits it — outcome, rationales, sources,
  review actions, and navigation.
- `ReviewQuestion` additionally composes the authored review reason and recovery
  context. It does not call a one-off success “mastery.”
- `SimulationQuestion` composes editable choices, flagging, position/navigation,
  and session-submit context. It never includes outcome, rationales, or sources
  before final simulation submission.

Modality is also explicit. `QuestionPlayer.VisualBody` composes the reviewed
image, neutral precommit description, zoom/reset controls, and linked equivalent.
`QuestionPlayer.NonvisualBody` composes the authored equivalent prompt and
ordered observable facts. Named route wrappers make both workflow and modality
visible:

| Workflow | Visual variant | Nonvisual variant |
| --- | --- | --- |
| Practice | `PracticeVisualQuestion` | `PracticeNonvisualQuestion` |
| Review | `ReviewVisualQuestion` | `ReviewNonvisualQuestion` |
| Simulation | `SimulationVisualQuestion` | `SimulationNonvisualQuestion` |

Each wrapper composes the corresponding `PracticeQuestion`, `ReviewQuestion`,
or `SimulationQuestion` structure with exactly one body. Routes do not pass
`isVisual`; they choose the named wrapper matching the discriminated snapshot.
Visual and nonvisual results remain separately identified.

### `HazardPlayer`

The family includes `Frame`, `SceneViewport`, `MarkerControls`, `MarkerList`,
`ZoneNavigator`, `CommitAction`, `CommitStatus`, `Results`, `ZoneFeedback`,
`Sources`, and `Navigation`.

| Workflow | Visual variant | Nonvisual variant |
| --- | --- | --- |
| Practice | `VisualHazardPractice` | `NonvisualHazardPractice` |
| Review | `VisualHazardReview` | `NonvisualHazardReview` |
| Simulation | `VisualHazardSimulation` | `NonvisualHazardSimulation` |

Practice variants compose the unannotated scene or neutral ordered zones,
explicit input controls, and postcommit synchronized feedback. Review variants
also compose the authored review reason and recovery action. Simulation variants
compose the same neutral input pieces but omit correctness until final session
submission.

The visual and nonvisual variants are different task constructs. They may share
concept tags and application commands; they MUST NOT be collapsed behind an
`isNonvisual` flag or reported as identical measurements. Zero marks is a valid
submission path with the required neutral confirmation. Pointer movement stays
local, while add/move/remove marker operations become semantic commands.

### Remaining families

| Family | Compound responsibility |
| --- | --- |
| `HomeDashboard` | selected-profile summary, resumable sessions, due-review summary, local progress availability, new-learner state, and projection recovery |
| `ExamSelector` | search/filter fields, possibility list, profile cards, ambiguity notice, and explicit select action |
| `AnnouncementChecker` | secure-content warning, public-detail fields, possible-profile results, and no-match recovery |
| `ToolAtlas` | search, filters, result count, tool list, comparison set, decisive-feature table, and reset action |
| `SessionBuilder` | profile/pack summary, mode/format/domain/length/timing controls, actual-inventory warning, deterministic preview, and start action |
| `ReviewQueue` | due summary, reason groups, scope filters, empty state, and start-review action |
| `SimulationNavigator` | actual position, answered/unanswered/current/flagged labels, timer visibility control, submit review, and final submit action |
| `ResultsSummary` | raw practice accuracy, elapsed time, actual distribution, visible sample sizes, practice-only disclaimer, and recovery actions |
| `PrintBuilder` | product type, filters, bounded count, accessibility/image/key/source settings, deterministic seed, and preview action |
| `PrintPreview` | semantic packet pages, page count/pagination status, grayscale/large-print checks, manifest, regenerate, and system-print action |
| `OfflinePackManager` | pack identity/version/compatibility/bytes/counts, lifecycle status, download/update/remove actions, eviction warning, and storage recovery |
| `SettingsForm` | boot preferences, accessibility/data settings, export/import/reset entry points, validation preview, and local save status |
| `CorrectionForm` | secure-content warning, categorized text report, optional public URL/email, offline-draft status, and explicit online submit action |

`PracticeSessionSetup`, `HazardSessionSetup`, and `SimulationSessionSetup` are
named route compositions of `SessionBuilder`. They include only the controls and
disclaimers valid for that workflow; they do not configure one setup component
with `isHazard` or `isSimulation` flags.

## 7. State, actions, and meta contract

Every React island defines one domain-specific context value with the same three
top-level parts:

```tsx
interface IslandContract<State, Actions, Meta> {
  readonly state: State
  readonly actions: Actions
  readonly meta: Meta
}
```

For the question player, the conceptual contract is:

```tsx
type QuestionPlayerState = Readonly<{
  snapshot: QuestionScreenSnapshot
}>

type QuestionPlayerActions = Readonly<{
  selectOption(optionId: OptionId): void
  toggleFlag(): void
  submitSelection(): void
  retryCommit(): void
  acknowledgeReview(): void
  goPrevious(): void
  goNext(): void
}>

type QuestionPlayerMeta = Readonly<{
  instanceId: string
  focusRequest: FocusRequest | null
  announcementRequest: AnnouncementRequest | null
  refs: Readonly<{
    heading: React.RefObject<HTMLHeadingElement | null>
    commitError: React.RefObject<HTMLElement | null>
    outcome: React.RefObject<HTMLHeadingElement | null>
  }>
  acknowledgeViewRequest(requestId: string): void
}>

type QuestionPlayerContract = IslandContract<
  QuestionPlayerState,
  QuestionPlayerActions,
  QuestionPlayerMeta
>
```

The exact snapshot is a discriminated union, not a collection of contradictory
booleans. It represents states equivalent to ready, selected, committing,
answered/revealed, reviewed, and recoverable failure. An answered/revealed
snapshot cannot exist until the authoritative durable transaction has settled or
the same attempt ID has been reconciled from database truth.

The three parts have strict meanings:

- `state` is immutable, renderer-neutral, and sufficient to render the current
  screen. Precommit variants contain no key, rationale, answer-bearing source,
  full naming description, correctness class, or target count.
- `actions` are semantic intent. They dispatch commands; they do not return data
  that lets a leaf reveal optimistically. A submit button never calls persistence
  directly and never assumes an async return means “correctness may render.”
- `meta` contains non-durable presentation coordination: stable instance IDs,
  refs, focus requests, live-region requests, and acknowledgement. It never
  becomes progress data or a second application state store.

The family creates a nullable React context. Its consumer helper reads it with
`use(QuestionPlayerContext)` and fails clearly when used outside the provider.
The provider is the only React module that subscribes to the controller and
assembles `state`, `actions`, and `meta`. Leaf components consume that interface;
they do not import controller hooks or global stores.

The provider boundary, not visual nesting, controls access. A navigation or
dialog action may be a sibling of `QuestionPlayer.Frame` and still consume the
same contract when the provider wraps both. State is never synchronized upward
through an effect or read imperatively from a ref to work around composition.

Different providers may implement the same family contract — for example a real
IndexedDB-backed practice adapter and a deterministic test adapter — while the
composed view remains unchanged. Providers do not own durable truth. They own the
React subscription, context value, view-request delivery, and cleanup.

## 8. Provider and island lifecycle

Each island follows this lifecycle:

1. The static document provides one owner element, safe precommit/fallback
   content, and a serialized non-answer-bearing bootstrap reference.
2. The lazy boot module obtains the existing browser application runtime and
   creates the renderer-neutral controller/adapter for that owner. It does not
   create one runtime per component or event.
3. One React root mounts one explicit variant inside one family provider.
4. The provider subscribes once, publishes immutable snapshots, maps actions to
   semantic commands, and owns focus/live-region request delivery.
5. Unmount disposes the subscription, observers, listeners, and React root.

There MUST be one owner for each DOM subtree. The static fallback is either
replaced by the island or retained outside its owned root; duplicate prompt/forms
must never coexist in the accessibility tree. An island failure leaves a useful
static recovery message rather than a blank page.

## 9. Route-family assignment

IDs below are conceptual route families from `ROUTES.md`; path aliases and locale
variants do not change the component assignment.

| Route IDs/family | Base delivery | UI family or explicit island |
| --- | --- | --- |
| `home` | Static public overview with local projection | `HomeDashboard` island for resume/due/profile summaries; the overview remains useful if the island fails |
| `faq` | Static document | `DocumentShell` and content/navigation patterns; no island |
| `exam-selector`, `exam-checker` | Semantic form/results shell | `ExamSelector` or `AnnouncementChecker` island for local registry search and ambiguity handling |
| `profile` | Static reference document | `Fact`, `ProfileCard`, `SourceCitation`; optional bounded selected-profile action only |
| `study-hub` | Static route shell with local projection | `SessionSummary`, `ContentAvailability`, and bounded study-dashboard island |
| `atlas-index`, `atlas-family`, `atlas-tool` | Static reference content | `ToolAtlas` filter/compare island only where the route needs client filtering; tool content remains crawlable |
| `procedures-index`, `procedure-detail`, `repair-lab` | Static reference content | Shared fact/source/figure patterns; narrowly scoped practice launcher if needed |
| `question-player` | Static practice landing plus interactive session document | `PracticeSessionSetup` on the landing; explicit `PracticeVisualQuestion` or `PracticeNonvisualQuestion` in a session |
| `hazards-index` | Static reference/setup content | `HazardSessionSetup` island; public guidance remains static |
| `hazard-player` | Interactive session document | Explicit `VisualHazardPractice` or `NonvisualHazardPractice` |
| `review-queue` | Static shell with local projection | `ReviewQueue` island |
| `review-player` | Interactive session document | `ReviewVisualQuestion`, `ReviewNonvisualQuestion`, `VisualHazardReview`, or `NonvisualHazardReview` |
| `simulation-setup` | Static guidance plus interactive setup | `SimulationSessionSetup` with practice-simulation disclaimer and actual inventory preview |
| `simulation-player` | Interactive session document | Explicit visual/nonvisual question or hazard simulation variant plus `SimulationNavigator`; no early feedback family |
| `simulation-results` | Semantic pinned-results shell | `ResultsSummary` island/projection; practice-only labels remain in static fallback |
| `print-center` | Semantic form shell | `PrintBuilder` island |
| `print-preview` | Deterministic semantic packet | `PrintPreview`; print content itself is renderer-independent HTML |
| `transparency-index` and source/corrections/FOIL/security/privacy children | Static reference documents | `SourceCitation`, `CorrectionNotice`, fact/status patterns; no island required |
| `correction-submit` | Semantic form shell | `CorrectionForm` island for drafts, validation, idempotent receipt, and online/offline truth |
| `settings` | Semantic route shell | `SettingsForm` island |
| `offline-packs` | Semantic route shell | `OfflinePackManager` island |
| `status` | Static explicit error/unavailable document | Named `PageState` composition; a bounded retry action only when a real recovery capability exists |
| `scoring-explainer`, `actual-questions-explainer`, deferred `nyc-disambiguation` | Static acquisition/reference documents | Shared fact/source/security patterns; no island unless `ROUTES.md` later promotes one for a concrete interaction |

## 10. Accessibility, focus, and reveal rules

- The semantic heading, landmark, label, list, table, and form structure MUST be
  correct before visual styling. Native controls are the default.
- Question choices use one labeled `fieldset`/`legend` and native radios.
  Selecting never submits. Option counts are data-driven.
- Focus requests are tokenized renderer-neutral effects. After the snapshot is
  rendered, the provider resolves a current live node, focuses it, delivers at
  most one useful announcement, and acknowledges the request ID.
- Successful durable commit focuses the outcome heading. Commit failure focuses
  the error summary and returns the selection to an editable state. Navigation
  focuses the next question/route heading. Dialog close restores the invoker.
- A rerender MUST NOT replace the focused radio, marker control, or navigation
  item merely because unrelated state changed. Stable IDs and keys are required.
- Sticky actions must not cover focused content. Every focus target uses the
  clearance and scroll-margin contract in `DESIGN_SYSTEM.md`.
- Visual players provide explicit zoom/reset and keyboard/touch controls. Hazard
  marking provides a non-drag path. Multi-touch, pointer precision, hover, color,
  and motion are never the only path.
- Live regions announce save, commit, pack, offline, and error changes; they do
  not narrate the entire screen. Do not announce the same outcome both through a
  focused heading and a second verbose live message.
- Before commitment, hidden DOM, accessible names/descriptions, CSS classes,
  data attributes, bootstrap data, and asset metadata MUST NOT contain the key,
  correctness, target count, rationale, answer-bearing source excerpt, or full
  naming description.
- After commitment, visual annotations and textual feedback share stable
  number/zone references. Meaning always has text/icon/shape support in addition
  to color.
- Visual and nonvisual routes are each independently keyboard and screen-reader
  operable and are tested/reported separately.

## 11. Test contracts

### Architecture and route closure

- A dependency test fails if a static-only route includes React, Effect, an
  island bootstrap, or a preload edge to one.
- A boundary test fails if a leaf compound imports persistence, runtime
  construction, content-fetching, or a global state implementation.
- Static analysis rejects `forwardRef`, `useContext`, product `renderX` props,
  prohibited boolean mode props, array-index keys, and broad UI barrels.
- Every island proves mount, unmount, remount, and listener/subscription cleanup.

### Contract and composition

- Each context consumer fails clearly outside its provider.
- The same compound composition renders against a deterministic in-memory test
  provider and the production adapter contract.
- Tests assert the pieces present in `PracticeQuestion`, `ReviewQuestion`, and
  `SimulationQuestion`; simulation tests assert that feedback/source components
  are absent before final submit.
- Visual/nonvisual variants and zero/multiple hazard-mark paths have separate
  tests. Tests do not create impossible boolean combinations.
- Content identity, not array position, preserves selection/focus across updates.

### Browser behavior

- Selection creates no attempt. Commit opens one authoritative transaction.
  Failure reveals nothing and restores editable selection; idempotent retry
  cannot duplicate attempts or review entries. Success reveals only from the
  settled/reconciled snapshot.
- Real-browser tests assert focus after successful commit, failed commit,
  navigation, dialog close, and island remount; useful nonduplicative live-region
  output is also asserted.
- Precommit leak tests inspect the DOM, accessibility tree, bootstrap data,
  styles/classes, assets, filenames, manifests, source maps, and loaded route
  closure.
- Keyboard-only, representative screen-reader, 400% reflow, forced-color,
  reduced-motion, touch-target, offline, storage-failure, and grayscale-print
  contracts are exercised against representative families.
- Screenshots MAY support visual review but cannot establish state, focus,
  accessibility, storage, or reveal-boundary correctness.

## 12. Definition of done for a new family

A new component family is planned only when it has:

1. one clear semantic responsibility and owning route family;
2. an explicit static-versus-island decision;
3. named compositions instead of boolean modes;
4. a documented state/actions/meta contract when interactive;
5. one provider owner and cleanup boundary;
6. loading, empty, offline, error, and recovery behavior where applicable;
7. focus, announcement, keyboard, reflow, forced-color, reduced-motion, and print
   behavior where applicable;
8. precommit leak analysis for any scored content;
9. direct-import and route-closure expectations; and
10. contract, browser, and accessibility acceptance tests.
