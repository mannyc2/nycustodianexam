# Question workflow/modality contract audit

Authority: `product/COMPONENT_ARCHITECTURE.md`, question-player section, especially the named Practice/Review/Simulation visual and nonvisual wrappers. Functional modality support does not alone prove this composition contract.

## Practice correction

Previously `PracticeNonvisualQuestion` rendered every Practice question while `QuestionPrompt` chose the actual body internally. The corrected route chooses `PracticeVisualQuestion` or `PracticeNonvisualQuestion` from the discriminated presentation state. Both compose the shared `PracticeQuestion` workflow with exactly one `QuestionPlayer.VisualBody` or `QuestionPlayer.NonvisualBody`. The prompt component receives that body as children; it no longer hides the modality switch.

The provider and controller remain outside the variant subtree. Selection and durable state therefore survive variant remounting. An explicit `presentation-toggle` focus request returns keyboard focus to the remounted toggle after a real presentation change; ignored/locked requests do not request focus. The existing nonvisual browser workflow now switches both directions, verifies exactly one body, preserves its selected answer, then commits, reloads, exports/imports and opens saved Review feedback.

This changes composition and focus handling, not question content, answer evaluation, receipt identity or persistence ordering. Existing markup and styles are retained.

## Still open

- Review currently reuses the same question bootstrap and shared Practice route composition. The generator supplies Review navigation and a static saved-feedback notice, but the specified `ReviewVisualQuestion` / `ReviewNonvisualQuestion` wrappers and authored review-reason composition are not yet established.
- Simulation chooses its question body inline inside `simulation/react/player.tsx`; the named `SimulationVisualQuestion` / `SimulationNonvisualQuestion` wrappers remain absent.
- Do not close the full component-contract audit based on the Practice correction. Review and Simulation must retain their distinct workflow behavior, especially no Simulation feedback before final submission.

Validation: 16 question state/feedback/commit unit tests passed; site and browser TypeScript checks passed; build/artifact/bundle checks passed; complete question-player and historical-review suites passed across three browsers with 43 passes and two declared BFCache skips (34.8 seconds). The added switch-back assertions preserve focus and selected answers, and the existing persistence/failure checks remain green. Publication still requires the explicit approval recorded in `IMPLEMENTATION-PR-DRAFT.md`; no push was retried.
