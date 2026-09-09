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
