# Question workflow/modality contract audit

Authority: `product/COMPONENT_ARCHITECTURE.md`, question-player section, especially the named Practice/Review/Simulation visual and nonvisual wrappers. Functional modality support does not alone prove this composition contract.

## Practice correction

Previously `PracticeNonvisualQuestion` rendered every Practice question while `QuestionPrompt` chose the actual body internally. The corrected route chooses `PracticeVisualQuestion` or `PracticeNonvisualQuestion` from the discriminated presentation state. Both compose the shared `PracticeQuestion` workflow with exactly one `QuestionPlayer.VisualBody` or `QuestionPlayer.NonvisualBody`. The prompt component receives that body as children; it no longer hides the modality switch.

The provider and controller remain outside the variant subtree. Selection and durable state therefore survive variant remounting. An explicit `presentation-toggle` focus request returns keyboard focus to the remounted toggle after a real presentation change; ignored/locked requests do not request focus. The existing nonvisual browser workflow now switches both directions, verifies exactly one body, preserves its selected answer, then commits, reloads, exports/imports and opens saved Review feedback.

This changes composition and focus handling, not question content, answer evaluation, receipt identity or persistence ordering. Existing markup and styles are retained.

## Still open

- Review now selects `ReviewVisualQuestion` / `ReviewNonvisualQuestion` through `ReviewQuestionRoute`. See the Review correction below. The full wider component-contract audit remains open.
- Simulation chooses its question body inline inside `simulation/react/player.tsx`; the named `SimulationVisualQuestion` / `SimulationNonvisualQuestion` wrappers remain absent.
- Do not close the full component-contract audit based on the Practice correction. Review and Simulation must retain their distinct workflow behavior, especially no Simulation feedback before final submission.

Validation: 16 question state/feedback/commit unit tests passed; site and browser TypeScript checks passed; build/artifact/bundle checks passed; complete question-player and historical-review suites passed across three browsers with 43 passes and two declared BFCache skips (34.8 seconds). The added switch-back assertions preserve focus and selected answers, and the existing persistence/failure checks remain green. Publication still requires the explicit approval recorded in `IMPLEMENTATION-PR-DRAFT.md`; no push was retried.


## Review correction

The shared bootstrap now selects the Review workflow for a `review-player` document, except when a custom Practice set uses that retained document with explicit set parameters. `ReviewQuestion` adds saved-answer context to the common question workflow and composes exactly one visual or nonvisual body. It reports flag and incorrect-answer reasons only from restored, verified feedback; loading/failure states do not infer correctness. Correct unflagged records do not acquire invented reasons, and viewing feedback never claims to finish the Review item.

Review now offers **Return to Review** as its completion action. The initial compact capture exposed the previous final-item **Return to Practice** action; it was corrected before the final captures. Practice navigation is unchanged. The existing static Review notice remains available without JavaScript.

`capture-review-question-context.mjs` commits an actual flagged incorrect q091 answer, restores its saved Review document, verifies the body variant and return action, and captures both modes at 1053px and 384px. Four full-page captures and a manifest are retained in `review-question-context/`; all have no page errors or horizontal overflow. The compact nonvisual capture was visually inspected for the new reason context, its separation from the question, and readable continuation into feedback. This added context adapts the existing source-note styling; no dedicated supplied saved-reason specimen is claimed.

Validation: 19 question state/feedback/commit unit tests, site/browser typechecks, build and artifact/bundle invariants passed. The complete historical Review, Practice-builder and Review-queue suites passed 42 browser cases before the return-action correction. A targeted three-browser saved-nonvisual workflow recheck verifies the final return action. The capture script independently checks that action in all four visual specimens.
