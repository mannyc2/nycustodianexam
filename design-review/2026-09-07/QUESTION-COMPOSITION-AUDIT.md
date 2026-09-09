# Question workflow/modality contract audit

Authority: `product/COMPONENT_ARCHITECTURE.md`, question-player section, especially the named Practice/Review/Simulation visual and nonvisual wrappers. Functional modality support does not alone prove this composition contract.

## Practice correction

Previously `PracticeNonvisualQuestion` rendered every Practice question while `QuestionPrompt` chose the actual body internally. The corrected route chooses `PracticeVisualQuestion` or `PracticeNonvisualQuestion` from the discriminated presentation state. Both compose the shared `PracticeQuestion` workflow with exactly one `QuestionPlayer.VisualBody` or `QuestionPlayer.NonvisualBody`. The prompt component receives that body as children; it no longer hides the modality switch.

The provider and controller remain outside the variant subtree. Selection and durable state therefore survive variant remounting. An explicit `presentation-toggle` focus request returns keyboard focus to the remounted toggle after a real presentation change; ignored/locked requests do not request focus. The existing nonvisual browser workflow now switches both directions, verifies exactly one body, preserves its selected answer, then commits, reloads, exports/imports and opens saved Review feedback.

This changes composition and focus handling, not question content, answer evaluation, receipt identity or persistence ordering. Existing markup and styles are retained.

## Still open

- Review now selects `ReviewVisualQuestion` / `ReviewNonvisualQuestion` through `ReviewQuestionRoute`. See the Review correction below. The full wider component-contract audit remains open.
- Simulation now chooses `SimulationVisualQuestion` / `SimulationNonvisualQuestion` through `SimulationQuestionRoute`; see the correction below. Wider family/provider contract requirements still require their own acceptance evidence.
- Do not close the full component-contract audit based on the Practice correction. Review and Simulation must retain their distinct workflow behavior, especially no Simulation feedback before final submission.

Validation: 16 question state/feedback/commit unit tests passed; site and browser TypeScript checks passed; build/artifact/bundle checks passed; complete question-player and historical-review suites passed across three browsers with 43 passes and two declared BFCache skips (34.8 seconds). The added switch-back assertions preserve focus and selected answers, and the existing persistence/failure checks remain green. Publication still requires the explicit approval recorded in `IMPLEMENTATION-PR-DRAFT.md`; no push was retried.


## Review correction

The shared bootstrap now selects the Review workflow for a `review-player` document, except when a custom Practice set uses that retained document with explicit set parameters. `ReviewQuestion` adds saved-answer context to the common question workflow and composes exactly one visual or nonvisual body. It reports flag and incorrect-answer reasons only from restored, verified feedback; loading/failure states do not infer correctness. Correct unflagged records do not acquire invented reasons, and viewing feedback never claims to finish the Review item.

Review now offers **Return to Review** as its completion action. The initial compact capture exposed the previous final-item **Return to Practice** action; it was corrected before the final captures. Practice navigation is unchanged. The existing static Review notice remains available without JavaScript.

`capture-review-question-context.mjs` commits an actual flagged incorrect q091 answer, restores its saved Review document, verifies the body variant and return action, and captures both modes at 1053px and 384px. Four full-page captures and a manifest are retained in `review-question-context/`; all have no page errors or horizontal overflow. The compact nonvisual capture was visually inspected for the new reason context, its separation from the question, and readable continuation into feedback. This added context adapts the existing source-note styling; no dedicated supplied saved-reason specimen is claimed.

Validation: 19 question state/feedback/commit unit tests, site/browser typechecks, build and artifact/bundle invariants passed. The complete historical Review, Practice-builder and Review-queue suites passed 42 browser cases before the return-action correction. A targeted three-browser saved-nonvisual workflow recheck verifies the final return action. The capture script independently checks that action in all four visual specimens.


## Simulation correction

`simulation/react/question-item.tsx` now defines the named visual/nonvisual variants around a shared `SimulationQuestion`. The parent passes the current ready snapshot, pinned question and response. Each wrapper supplies one body; the parent retains timer, navigation, submit confirmation, session subscription and recovery state. The markup and styles of the existing question card remain unchanged.

The question module imports only the precommit illustration renderer and types; it has no outcome/rationale/source renderer or feedback fetch. Submission and exact-result loading remain in the existing controller. Missing authored nonvisual content cannot silently fall back to an illustrated body.

An optional saved-focus request belongs to the existing queued local operation. Presentation changes request focus on the new toggle only after the operation succeeds; failures retain recoverable-error focus and exact retry. Ordinary answer and timer saves do not request toggle focus. The browser regression switches both ways after selecting an answer, checks focus and selection, reloads, flags, submits and verifies retained nonvisual results.

Validation: 38 Simulation unit tests, site/browser typechecks, build/artifact/bundle checks, maintained layout (284 files) and module boundaries (144 modules) passed. All 27 local Simulation browser cases passed across Chromium, Firefox and WebKit (41.4 seconds). Cloudflare-tagged delivery cases are separate and were not rerun for this component-only change. This is a composition/focus correction, not new screenshot evidence; prior visual captures remain revision-specific.


## Remaining contract gaps verified at 0040951

Direct inspection of `product/COMPONENT_ARCHITECTURE.md` sections 2, 3 and 6 against the current source establishes these concrete incomplete requirements:

| Requirement | Current source evidence | Required follow-through |
| --- | --- | --- |
| Provider/adapter alone knows command dispatch | `simulation/react/question-item.tsx` accepts `SimulationPlayerController` and invokes `controller.dispatch` in presentation, choice and flag controls | Adapt the ready Simulation snapshot to a state/actions/meta contract outside the compound leaves; preserve durable save and focus acknowledgments. |
| Explicit QuestionPlayer compound pieces | `question-player/react/player.tsx` maps Outcome to the entire QuestionFeedback and CommitAction to QuestionControls; Position, FlagAction, Rationales, ConfusionFeedback, Sources, ReviewActions and Navigation are not exposed as separate pieces | Extract meaningful leaves from the existing markup and explicitly compose them in the workflow; do not add aliases that still hide the combined structure. |
| Family body composition across workflows | Practice/Review use QuestionPlayer body leaves; Simulation wrappers separately construct prompt/illustration/nonvisual markup | Share the appropriate precommit body contract or explicitly adapt it for Simulation without importing postcommit feedback into its closure. |

The existing `question-player/react/context.tsx` already has state/actions/meta and React 19 context access; preserve it rather than introduce a second state machine. `feedback.tsx` gates all successful feedback on `state.tag === "revealed"`; splitting its leaves must retain this guard for every postcommit leaf, error recovery focus, authored rationale ordering and exact source receipts. Simulation must keep editable session behavior and never acquire ordinary Practice commit/reveal semantics.

These findings are source-level architecture gaps, not evidence of newly observed learner-facing failures. Existing functional checks remain valid within their scope. Closure requires implementation, type/build/boundary checks, and the existing real-save, failure/retry, Review restoration and Simulation no-feedback browser workflows. The wider family audit remains open beyond this bounded QuestionPlayer inspection.


## Simulation question provider correction

The question-specific dispatch gap above is corrected in the working implementation. `simulation/react/question-provider.tsx` adapts the authoritative ready snapshot and controller into the `question-context.tsx` state/actions/meta contract. `question-item.tsx` and its named variants read this contract through React 19 `use`; they neither receive a controller nor dispatch commands directly. The parent supplies one provider around the route. No second reducer, runtime, persistence store or subscription was added, and the existing presentation-toggle ref remains owned by the parent focus delivery.

Validation: 38 Simulation unit tests, site/browser typechecks, maintained layout (286 files), module boundaries (146 modules), production build and all artifact/bundle budgets passed. All 27 local Simulation browser cases passed across Chromium, Firefox and WebKit (42.6 seconds), including IndexedDB failure/exact retry, presentation focus and restoration, and final results. Simulation player closure is 455,352 raw / 137,116 gzip / 115,866 Brotli bytes. Logs are `/tmp/nyc-simulation-provider-build.log` and `/tmp/nyc-simulation-provider-browser.log`.

This closes direct dispatch within the question compounds only. The wider Simulation parent/hazard adapter contract, shared body composition and explicit QuestionPlayer leaf inventory remain separate outstanding work. The earlier integrated checkpoint predates this correction; the targeted validation above applies to it.


## Explicit feedback pieces

Practice/Review now compose `QuestionPlayer.FeedbackFrame`, `Outcome`, `Rationales`, `ConfusionFeedback` and `Sources` explicitly. The frame retains error/recovery presentation and successful-feedback styling. Each leaf independently checks the authoritative revealed snapshot before reading postcommit content, so mounting a leaf outside the frame cannot disclose feedback early. The compatibility `QuestionFeedback` composition uses the same leaves; it does not duplicate their markup. Authored rationale order, objective caveats, confusion text, source receipts and focus refs are retained.

Validation on the working change based on `872b8d1`: 21 targeted state/commit/feedback tests passed, including new independent-leaf precommit and source-only composition checks. Site/browser typechecks, production build and artifact/bundle invariants passed. Complete question-player and historical-review browser suites passed 43 cases with two declared BFCache skips across Chromium, Firefox and WebKit (34.7 seconds). Question/Review player closure is 450,455 raw / 136,599 gzip / 115,409 Brotli bytes. Logs: `/tmp/nyc-feedback-pieces-build.log` and `/tmp/nyc-feedback-pieces-browser.log`.

Position, flag/commit/review/navigation control composition and cross-workflow body sharing still require reconciliation; this correction closes only the feedback-piece subset of the inventory gap.


## Explicit question controls

The workflow now directly composes `Position`, `FlagAction`, `CommitAction`, `ReviewActions` and `Navigation`, plus selection/save notices and an action-bar frame. Header and action-bar structure use children. Individual controls retain their authoritative state guards: flags can change only before commitment, submit/retry remains form-driven, source-study/correction links appear after reveal, and navigation preserves custom-set history replacement and the Review return action. The compatibility controls composition uses these same leaves.

Validation: 21 targeted question tests, site/browser typechecks, maintained layout (286 files), module boundaries (146 modules), build/artifact/bundle checks all passed. The complete question-player, historical-review and Practice-builder browser suites passed 55 cases with two declared BFCache skips across Chromium, Firefox and WebKit (1.4 minutes), including offline custom-set navigation. Logs: `/tmp/nyc-question-controls-build.log` and `/tmp/nyc-question-controls-browser.log`. This completes the previously identified explicit control/feedback inventory extraction; shared cross-workflow body composition and the wider family/provider audit remain open.


## Shared precommit question bodies

`question-player/react/question-body.tsx` now owns visual prompt/illustration markup and authored nonvisual prompt/ordered facts. Practice/Review adapters and Simulation variants both compose these leaves. The shared module imports only the existing precommit illustration renderer and React types; it does not import a workflow provider, feedback renderer or controller. Heading IDs remain workflow-specific. Missing-equivalent content is supplied as children by each workflow, preserving its existing recovery wording and avoiding a silent visual fallback.

Validation: 61 question/illustration/Simulation unit tests, site/browser typechecks, maintained layout (287 files), boundaries (147 modules), production build and artifact/bundle checks passed. All six targeted Practice/Review and Simulation presentation browser workflows passed across Chromium, Firefox and WebKit (13.9 seconds), covering switch-back focus/selection, commitment, reload, export/import and final-result presentation. Logs: `/tmp/nyc-shared-question-body-build.log` and `/tmp/nyc-shared-question-body-browser.log`.

This closes the question body duplication identified above. The wider Simulation parent/hazard provider contract and remaining family audit are still open; previous full-browser evidence remains revision-specific.


## Simulation player provider boundary

The player now mounts `SimulationPlayerProvider`, which owns the authoritative snapshot subscription, stable semantic command actions, focus refs/delivery and request acknowledgments. `SimulationPlayerView`, timer and hazard controls consume its state/actions/meta contract. The question-specific provider projects that same action contract and retains its narrower item state; it no longer knows controller dispatch. Timer/zoom scratch remains view-local. No duplicate durable state or runtime is introduced, and final-submission/retry commands are unchanged.

Source inspection confirms that `player.tsx` only passes the controller from the public mount wrapper into the provider, while `hazard-item.tsx` and `question-provider.tsx` contain no controller dispatch. Results and setup islands are separate audit scope.

Validation: 38 Simulation unit tests, site/browser typechecks, maintained layout (288 files), module boundaries (148 modules), production build and artifact/bundle checks passed. All 27 local Simulation browser cases passed across Chromium, Firefox and WebKit (41.5 seconds), including strict opt-in timer expiry, visual/nonvisual hazard responses, failed IndexedDB save/exact retry, final submission and restored question presentation. Simulation player closure is 456,644 raw / 137,545 gzip / 116,124 Brotli bytes. Logs: `/tmp/nyc-simulation-player-provider-build.log` and `/tmp/nyc-simulation-player-provider-browser.log`. This closes the directly observed player/timer/hazard dispatch boundary gap; the broader component-family audit remains open.


## Simulation results provider boundary

`results-provider.tsx` now owns the results snapshot subscription, retry action, heading refs and focus/announcement acknowledgments. The results view reads state/actions/meta and retains the existing reconciling/failure/completed rendering. The public wrapper only mounts the provider; no result calculation, submission lookup or retry semantics changed.

Validation: 38 Simulation unit tests, site/browser typechecks, maintained layout (289 files), boundaries (149 modules), build/artifact/bundle checks passed. All 27 local Simulation browser cases passed across Chromium, Firefox and WebKit (41.8 seconds), including self-contained question/hazard results after restoration. Logs: `/tmp/nyc-results-provider-build.log` and `/tmp/nyc-results-provider-browser.log`.

Remaining setup gap verified by direct inspection: `simulation/react/setup.tsx` keeps workflow settings/status in React state and calls `assembleSimulation`, UUID/time globals and `runtime.runPromise(createLocallyClosedSimulation(...))` from its start handler. The maintained renderer-neutral controller boundary requires moving that workflow into a controller with an adapter/provider. Preserve effective length/format/timing validation, durable creation before navigation, offline availability and failure focus; a provider-only rename would not close this gap. No new setup behavior failure is claimed by this source audit.


## Renderer-neutral Simulation setup

`simulation/setup-controller.ts` now owns settings, effective capacity/length/timing projection, creation status, deterministic assembly and save-before-navigation orchestration using the shared `makeScreenStore`. The bootstrap injects ID, clock, save and navigation capabilities, and disposes the controller with the island. `setup-provider.tsx` subscribes to the immutable screen snapshot and delivers failure focus; `setup.tsx` composes controls from state/actions/meta with no React-owned workflow state, assembly or runtime calls.

Creation locks settings and rejects duplicate start commands synchronously. The controller preserves explicit length replacement and timing opt-in, publishes a focus request on failure, and suppresses navigation after disposal. No persistent store or runtime was duplicated.

Validation: 42 Simulation unit tests passed, including four new controller cases for deferred durable save/duplicate start, invalid length replacement, failure focus without navigation and disposal during save. Two initial test expectations used the wrong route/category representation and were corrected to the canonical route and existing category projection before the passing run. Site/browser typechecks, maintained layout (291 files), module boundaries (151 modules), build/artifact/bundle checks passed. All 27 Simulation browser cases passed across Chromium, Firefox and WebKit (41.4 seconds). Setup closure is 444,397 raw / 134,643 gzip / 113,784 Brotli bytes. Logs: `/tmp/nyc-setup-controller-build.log` and `/tmp/nyc-setup-controller-browser.log`.

The identified setup renderer/controller boundary gap is closed. The broader handoff still requires its remaining family/state audit, print visual review and current integrated checkpoint; no production certification or publication is implied.
