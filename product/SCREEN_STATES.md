# Screen-state, transition, and recovery contract

**Status:** maintained implementation contract, accepted 2026-08-23.

This file defines the legal user-visible states for every route family in
`ROUTES.md`. It refines the recovered `loading`, `empty`, `ready`, `selected`,
`answered`, `reviewed`, `offline-stale`, and `error` vocabulary in
`FEATURE_SPEC.md` into typed, testable state machines.

The application model emits an immutable, renderer-neutral `ScreenSnapshot` and
accepts semantic commands. React renders that contract; it does not infer
application truth from the DOM. Focus, live-region, history, and viewport work
are explicit presentation effects in snapshot `meta`, acknowledged by the view
after they run. One browser `ManagedRuntime` is created at the site application
root and disposed there; state transitions do not construct runtimes or Layers.

## State is a product, not a single enum

Every screen state is the product of these orthogonal dimensions. Routes expose
only combinations permitted by the matrix below.

| Dimension | Legal values | Meaning |
|---|---|---|
| `availability` | `ready`, `empty`, `offline-stale`, `offline-unavailable`, `content-unavailable`, `not-found`, `withdrawn` | Whether reviewed content needed by the screen exists and is usable. |
| `operation` | `idle`, `loading`, `pending`, `recoverable-error`, `terminal-error` | Status of the user-requested asynchronous operation. `loading` never erases already useful static content. |
| `connectivity` | `online`, `offline` | A capability signal, shown only when it changes behavior. It is not proof that a particular resource is available. |
| `persistence` | `available`, `unavailable`, `quota-limited`, `reconciling` | Whether durable local truth can be read/written. |
| `interaction` | route-machine state such as `ready`, `selected`, `committing`, `answered-revealed`, `reviewed`, `completed` | The legal state of the current task. |
| `freshness` | `current`, `stale`, `superseded`, `retired`, `corrected` | Status of the exact profile/content revision being represented. |

The public `error` state from the recovered spec is therefore never a generic
catch-all. It must identify a typed cause and one truthful next action. The
recovered `answered` state is named `answered-revealed` for immediate-feedback players
and `recorded` for a simulation item, because simulation answers do not reveal
correctness.

### Invalid combinations

- `answered-revealed` with an uncommitted immediate-feedback attempt;
- `submitted` correction while the submission endpoint was offline or did not
  return the accepted client receipt;
- `active` pack before checksum, Schema, manifest closure, compatibility, and
  activation all succeed;
- `empty` when content may exist but is unavailable offline;
- `current` for a stale cached profile merely because the device is offline;
- `ready` player when a required pinned object or asset is missing;
- `reviewed` merely because feedback was rendered, scrolled, or visible for a
  period of time;
- simulation `answered-revealed` before final session submission; or
- a historical item silently substituted with a newer item version.

## Global transition rules

1. Commands are semantic (`selectOption`, `commitSelection`, `addMarker`,
   `submitSimulation`, `retryPersistence`, `activatePack`), not DOM events.
2. Every command is validated against the current snapshot revision. Duplicate
   commands are idempotent or rejected as stale; they do not double-count.
3. A transition that changes durable study truth settles only from authoritative
   IndexedDB transaction completion or same-ID reconciliation.
4. Navigation, focus, and announcement effects happen after the new snapshot is
   rendered. Each effect has an ID and is acknowledged once.
5. Background refresh never destroys a usable stale screen. It either replaces
   it atomically with a validated current snapshot or leaves it stale with a
   typed warning.
6. Losing connectivity does not itself move a cached screen to unavailable.
   Resource closure and pack state determine availability.
7. Active sessions remain pinned to their profile, content pack, item, asset,
   and algorithm versions across reload, connectivity changes, and pack updates.
8. Cancel/back during a pending durable command does not claim that the native
   transaction was cancelled. Re-entry reconciles by stable operation/attempt
   ID before offering another write.
9. Unknown, invalid, conflicting, or unavailable data is represented; it is
   never replaced by an inferred default.

## Canonical state machines

### Reference and index documents

```text
ready(current|stale)
  -> filter/search -> ready | empty
  -> background refresh -> ready(current) | offline-stale | recoverable-error
  -> resource withdrawn -> withdrawn

initial resource failure
  -> offline-unavailable | content-unavailable | not-found
  -> retry / choose cached parent / download pack
```

Static content remains present while an optional island loads. Island boot
failure is a recoverable enhancement failure unless the route is explicitly an
island route.

### Immediate-feedback question and review item

```text
restoring
  -> ready
ready
  -> selectOption -> selected
selected
  -> selectOption -> selected
  -> clearSelection -> ready
  -> commitSelection -> committing
committing
  -> durable transaction complete | same-ID reconciliation found -> answered-revealed
  -> typed failure -> selected + recoverable-error
answered-revealed
  -> flag/unflag -> answered-revealed
  -> markReviewed -> reviewed
reviewed
  -> next -> restoring(next) | completed
```

`selected` is a draft, not an attempt. While `committing`, selection and
navigation controls are unavailable, but the selected option remains visible.
A recoverable failure reveals no correctness or explanation, retains the
selection, focuses the error summary, and offers an idempotent retry. A changed
selection invalidates the prior draft attempt ID. `answered-revealed` exposes the outcome
and all authored rationales only after durable settlement.

### Hazard item

```text
restoring -> ready
ready <-> marking
ready|marking -> submitZero -> confirm-zero -> committing
marking -> commitMarkers -> committing
committing -> answered-revealed | previous editable state + recoverable-error
answered-revealed -> reviewed -> next | completed
```

Marker motion/pan/zoom scratch may remain renderer-local. Stable marker
add/remove/move completion is a semantic command. Zero marks is valid only after
neutral confirmation. Neither confirming nor a failure exposes target count,
regions, decoys, or correctness.

### Simulation

```text
setup -> generating -> active
active: unanswered <-> recorded; flag/unflag; navigate; autosave
active -> final-confirmation -> submitting
submitting -> results | active + recoverable-error | reconciling
reconciling -> results | active + recoverable-error
results -> reviewed/exit
```

Recorded choices are editable while `active`; no item outcome or rationale is
available. Final submission is idempotent by session/submission ID. Strict timer
expiry enters `final-confirmation` or `submitting` only when the learner opted in
before the session. Results report actual site-practice metrics and never an
official score conversion or pass prediction.

### Print job

```text
configuring -> generating -> preview-ready
generating -> configuring + recoverable-error
preview-ready -> generating (regenerate) | system-print-requested
preview-ready -> stale (referenced content corrected/removed)
stale -> regenerate | retain-versioned-preview when safely supported
```

Opening or cancelling the operating-system print dialog does not prove a print
occurred. The product may record only that system print was requested. Question
and key/explanation products remain separately controllable in every state.

### Offline pack

```text
absent -> downloading -> verifying -> staged -> activating -> active
downloading -> paused-offline | recoverable-error | absent(cancel)
verifying|activating -> quarantined | recoverable-error
active -> update-available -> downloading(new version)
active -> removing -> absent
active -> retained (blocked removal: pinned session/dependency)
```

Only `active` can satisfy a new offline session. Failed update states retain the
previous valid active version. A quarantined pack cannot be selected, and its
diagnostic must not expose answer-bearing content. Removal computes dependent
sessions/history first and requires explicit confirmation of the exact impact.

### Correction/security report

```text
draft -> validating -> ready-to-submit -> submitting -> submitted
validating -> draft + validation-errors
submitting -> ready-to-submit + recoverable-error
draft|ready-to-submit + offline -> local-draft-saved
local-draft-saved + online -> ready-to-submit (explicit learner action)
```

Going online never auto-submits. `submitted` requires an accepted response tied
to the client receipt ID. Suspected secure content enters a nonpublic handling
path; the UI never repeats or validates whether the content is genuine.

### Import, projection rebuild, and reset

```text
idle -> decoding -> validated-preview -> committing -> complete
decoding -> quarantined | recoverable-error
committing -> complete | reconciling | recoverable-error
reconciling -> complete | recoverable-error
```

Import writes nothing before the validated preview is confirmed. Reset uses the
same preview/confirmation/commit discipline with explicit scopes; export is
offered before destructive scopes. Projection rebuild reads append-only events
and atomically swaps the derived view without rewriting historical correctness.

## Route-family matrix

This matrix maps all 21 recovered destination families. State names not listed
for a family are illegal there.

The additional static `scoring-explainer`, `actual-questions-explainer`, `about`,
and conditional `nyc-disambiguation` spokes in `ROUTES.md` use the reference
document machine (`ready`, `offline-stale`, `not-found|withdrawn`) and normal
document history; they introduce no application state.

| # / route IDs | Legal route-specific states and transitions | Recovery and focus | History / reload | Offline behavior |
|---|---|---|---|---|
| 1. `home` | `ready`, `offline-stale`; static navigation reflects only publication-safe availability | Select profile or continue to Study; no island boot may hide the public Home document | Normal document entry; no dashboard state in the URL | Cached public overview/navigation remains fully useful |
| 2. `exam-selector` | `ready` ↔ filtered `empty`; selecting compatible profile → `pending` → selected confirmation/navigation | Clear filters, retry registry, or open cached profile; result-count announcement is polite and does not move focus | Filters replace query state; explicit result navigation is a document navigation; selection is durable preference, not URL truth | Cached registry may be `offline-stale`; absent registry is `offline-unavailable`, not empty |
| 3. `exam-checker` | `ready` → `validating` → `no-match`, `ambiguous`, or `match`; match selection → profile | Validation summary receives focus; ambiguous result heading receives focus; input is retained on failure | Form fields may use replace-only query state excluding sensitive/free text; reload may restore local draft | Runs against cached registry with visible scope/version; never claims completeness offline |
| 4. `profile` | `ready` with fact freshness states; `superseded` or `retired`; select/download/resume operations can be `pending` or `recoverable-error` | Fact conflict links to both sources; incompatible/missing pack routes to Offline; selection success focuses status then preserves explicit next action | Administration URL is immutable and reloadable; selected profile change never mutates an active session pin | Cached page stays readable as `offline-stale`; external links and update checks are disabled truthfully |
| 5. `study-hub` | `ready`, `empty` (no compatible inventory), or `offline-stale`; setup action `pending` or `recoverable-error` → player | Select profile/download pack/change filters; generated-session success navigates, failure focuses setup summary | Setup query keys may be replace state; generated session ID is durable before navigation | Cached guidance works; session generation requires complete compatible local objects |
| 6. `atlas-index` | `ready` ↔ filter `empty`; optional media `loading` or `recoverable-error`; local status may be stale | Clear filters; retry image only; heading/result count follows explicit search without stealing focus while typing | Canonical excludes filters; filter changes replace history; tool links are normal documents | Cached entries work; missing optional derivative is per-item unavailable, not whole-page empty |
| 7. `atlas-family` | `ready`, `offline-stale`, or `withdrawn`; optional comparison/practice `pending` or `recoverable-error` | Back to Atlas, use nonvisual comparison, download pack; document heading is initial focus target | Immutable published slug; redirect only from reviewed slug mapping | Cached text/nonvisual comparison works; uncached alternates are named unavailable |
| 8. `atlas-tool` | `ready`, `offline-stale`, `retired`, `corrected`, or `withdrawn`; optional media viewer state stays local | Use text equivalent, family parent, correction history, retry media; viewer controls retain focus | Immutable version is content data; canonical slug resolves current public representation and history notices | Cached accepted derivatives/text work; no hidden alternate-image download |
| 9. `procedures-index`, `procedure-detail` | Index `ready` or filtered `empty`; detail `ready`, `offline-stale`, `corrected`, or `withdrawn` | Clear filters or return to index; unsafe/unsupported detail never renders guessed values; correction notice heading can receive focus after in-page jump | Query filters replace; detail is stable document URL | Cached source excerpt/instruction works; missing linked media is explicit |
| 10. `repair-lab` | `ready`, filtered `empty`, `offline-stale`, or `content-unavailable`; comparison island may have recoverable enhancement error | Clear scope/filter, return to entry-level hub, use nonvisual comparison; focus stays on scope warning when incompatible | Stable topic URL; high-level content cannot be reached by mutating a scope query | Only compatible cached content appears; absence never falls through to another series |
| 11. `question-player` | `restoring`, `ready`, `selected`, `committing`, `answered-revealed`, `reviewed`, `completed`, typed `recoverable-error`, or `content-unavailable` | Persistence failure returns to `selected`, focuses summary, retains choice, reveals nothing. Success focuses outcome. Next focuses next prompt heading | Setup → session pushes one entry; in-session position uses `replaceState` so Back exits the session. Reload reconciles durable session/attempt ID | Requires complete pinned pack. Cached active session works; missing object/asset routes to pack/session recovery |
| 12. `hazards-index`, `hazard-player` | Index `ready` or `empty`; player `restoring`, `ready`, `marking`, `confirm-zero`, `committing`, `answered-revealed`, `reviewed`, `completed`, or `recoverable-error` | Failure restores neutral editable marks and focuses summary. Marker-count updates are polite. Reveal focuses outcome; next focuses scene heading | Same one-entry session/replace-position rule as questions; reload restores stable markers, not pointer scratch | Player starts only with exact image, regions, descriptions, and sources local; missing closure is unavailable |
| 13. `review-queue`, `review-player` | Queue `loading`, `ready`, `empty`, or `recoverable-error`; rebuild `pending`; player uses explicit question/hazard review variant states | Empty queue focuses its heading only on explicit completion. Projection error offers rebuild. Missing item offers correction/history path, not substitution | Queue URL holds no due state; player position replaces one session entry; reload rebuilds/reconciles from events | Queue/review work locally; unavailable historical object is quarantined with a truthful notice |
| 14. `simulation-setup`, `simulation-player`, `simulation-results` | `setup`, `generating`, `active` (`unanswered` or `recorded`), `final-confirmation`, `submitting`, `reconciling`, `results`, `recoverable-error`, or `completed` | Generation failure retains settings. Submit failure returns to active/reconciling with no reveal. Results focus heading; item summary links focus targeted result | Setup → player pushes; positions replace. Final results replace the active-player entry to prevent history from reopening a pre-submit view. Reload reconciles session | Start requires complete local closure; active session continues offline; connectivity/update never changes pin |
| 15. `print-center`, `print-preview` | `configuring`, `generating`, `preview-ready`, `stale`, `recoverable-error`, or `system-print-requested` | Failure retains controls and focuses summary. Preview success focuses heading. Pagination/contrast warnings link to exact control | Center → preview pushes; regenerate replaces current job URL only after durable manifest creation; reload decodes job manifest | Generates from retained local content; missing resource blocks generation with exact recovery link |
| 16. `faq` | `ready` or `offline-stale`; no local interaction machine | Initial document/fragment target; broken enhancement cannot hide answers | Normal document/fragment history | Fully useful when cached; stale mutable facts link to cached profile/source status |
| 17. `transparency-index`, `source`, `corrections`, `foil`, `security`, `privacy` | `ready`, `offline-stale`, `withdrawn`, or `not-found`; source filters may be `empty` | Return to transparency index, use cached excerpt, report correction; source fragment/record heading is focus target | Stable documents and source IDs; corrected records preserve links/history | Cached records remain readable; external navigation is disabled/annotated, never faked |
| 18. `correction-submit` | `draft`, `validating`, `ready-to-submit`, `submitting`, `local-draft-saved`, `submitted`, `validation-errors`, or `recoverable-error` | First invalid field/summary gets focus; failure retains safe fields; success focuses receipt heading | No report text in URL/history. Reload restores explicitly saved local draft. Submitted receipt may be local state, not an indexable URL | Draft save works; submission never does. Reconnection requires explicit submit |
| 19. `settings` | `ready`; preference write `pending` or `recoverable-error`; import/export/reset/rebuild machines above | Failed write restores control and focuses status/summary. Destructive preview names exact scope; completion focuses result | No sensitive settings in query/history; reload reads authoritative storage | Local operations work; network-only checks are clearly deferred |
| 20. `offline-packs` | `absent`, `downloading`, `paused-offline`, `verifying`, `staged`, `activating`, `active`, `update-available`, `quarantined`, `removing`, `retained`, or `recoverable-error` | Retry/resume/remove inactive/export/free space; operation status announced without stealing focus; destructive confirmation restores trigger focus | URL does not encode pack operation state; reload reconciles persisted staging/active records and discards unsafe scratch | Offline can inspect/remove/activate already verified staged data; cannot pretend to download/update |
| 21. `status` and terminal documents | `not-found`, `withdrawn`, `offline-unavailable`, `content-unavailable`, `storage-unavailable`, `service-unavailable`, or `terminal-error` | One primary recovery plus cached Home/parent/Offline/Settings as applicable; requested URL remains visible; heading is focus target | 404/410/5xx do not rewrite to `/status/`; `/status/` is help/diagnostics. Retry keeps original target | Precached fallback names the missing target and links only to known cached destinations |

## Focus and announcement contract

### Document navigation

- The skip link is the first focusable control and targets the unique `main`.
- A full document load starts at the document, with a unique level-one heading;
  JavaScript does not steal focus during hydration.
- A fragment navigation targets a programmatically focusable heading only when
  needed for keyboard/screen-reader continuity.

### Island transitions

- User-triggered validation or operation failure: render, then focus the error
  summary; each message links to the relevant control.
- Immediate-feedback commit success: render, then focus the outcome heading and
  issue one concise assertive completion announcement. Explanation prose is not
  dumped into the live region.
- Next item/scene: render, then focus its prompt/scene heading.
- Background cache/connectivity/update change: polite announcement only when it
  changes available action; never move focus.
- Dialog close/cancel: restore focus to the still-connected trigger. If it no
  longer exists, focus the nearest owning heading.
- Sticky controls must not obscure the current focus at supported zoom/reflow.
- Focus requests refer to semantic targets (`outcome`, `error-summary`,
  `prompt-heading`), never stored DOM nodes or generated CSS selectors.

## Browser history and restoration contract

- Document navigation uses normal links and the browser's history.
- Query-backed list filters use `replaceState` during editing. An explicit Apply
  may push one state when returning to it is useful; canonical URLs omit filters.
- Entering a durable session from setup pushes one session entry. Movement
  within that session replaces its `position`, so Back exits rather than walking
  through every answered item. Explicit Exit performs a document navigation.
- A results transition replaces the active simulation entry after durable final
  submission. Browser Back can return to setup/reference, not recreate an active
  pre-submit state.
- History state contains only route ID, validated public parameters, and an
  opaque local reference. IndexedDB/content packs remain authoritative.
- `pageshow`, reload, crash recovery, or cross-tab invalidation enters
  `restoring|reconciling`; no view renders a later state until durable truth is
  read.
- A corrected/retired object restores its historical representation plus notice
  when safe. It never silently upgrades an attempt or changes its correctness.

## Recovery-action vocabulary

Use the smallest truthful action set:

- `Retry` — rerun the same idempotent operation;
- `Reconcile saved state` — query by the same operation/attempt ID;
- `Download required pack` — go to `offline-packs` with a noncanonical safe
  compatibility hint;
- `Use retained version` — resume the already pinned valid version;
- `Free storage` — inspect inactive packs before any removal;
- `Export progress` — create a validated local export;
- `Rebuild review queue` — derive projection from append-only events;
- `Choose a compatible profile` — go to `exam-selector`;
- `Return to parent` — navigate to the nearest public registry route; and
- `Report a correction` — open `correction-submit` without copying secure or
  answer-bearing content into the form.

Do not use “Try again” when the next attempt would duplicate a non-idempotent
write or when reconciliation is required first.

## State acceptance matrix

Every route/component fixture and end-to-end suite must prove, where applicable:

1. legal state combinations render and illegal combinations are unconstructable
   or rejected at the boundary;
2. durable success, abort, quota, unknown completion, corruption, stale pack,
   missing object, and offline paths;
3. no answer-bearing bytes in precommit snapshot, HTML, accessibility tree,
   manifest, asset metadata, or lazy preload closure;
4. focus occurs after render on a connected semantic target and every request is
   acknowledged once;
5. announcements are concise, nonduplicative, and do not expose hidden answers;
6. Back, Forward, reload, crash, and a second-tab invalidation reconcile to the
   same durable truth;
7. offline-stale, offline-unavailable, empty, not-found, withdrawn, and invalid
   publication remain visually and programmatically distinguishable;
8. retry/reconciliation is idempotent and does not duplicate attempts, reviews,
   sessions, drafts, or pack activations; and
9. React island boot/teardown does not reconstruct the Effect runtime, leak
   listeners/observers, or replace focused nodes unnecessarily.
