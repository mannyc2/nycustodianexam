# Accessibility gates

Target: WCAG 2.2 AA behavior for product surfaces and authored content. Passing automation is not conformance certification.

## Automated browser gates

Automate where the assertion is mechanically truthful:

- native control role/name/state and label association;
- keyboard reachability and no obvious traps in scripted flows;
- focus moves to the outcome only after successful durable commit;
- save/error/offline status has an appropriate programmatic announcement mechanism;
- no correctness-bearing content exists in pre-reveal DOM/accessibility-facing attributes;
- no answer-bearing full description or target count is exposed before commit;
- no correctness encoded only by CSS class/attribute that leaks the key;
- touch target geometry meets the project target where layout APIs are reliable;
- headings/landmarks/form structure remain coherent;
- reduced-motion and forced-colors media queries do not remove required meaning;
- production static output does not contain forbidden answer-bearing metadata.

Use axe/ACT-aligned rules as a regression detector, not a certification oracle.

## Manual release gates

A human must complete representative flows for:

1. keyboard-only navigation and operation;
2. visible focus and focus not obscured by sticky UI;
3. outcome/error focus behavior after commit success/failure;
4. screen-reader question-player flow from neutral pre-answer state through reveal;
5. screen-reader zoned nonvisual hazard flow;
6. 200% and 400% zoom/reflow;
7. forced-colors/high-contrast behavior;
8. reduced-motion behavior;
9. touch operation without precision dragging or multi-touch dependency;
10. timer hide/untimed alternatives and opt-in strict timing;
11. no information conveyed by color alone;
12. print and large-print output, including answer-sheet labels and key separation.

## Browser/AT matrix

At release candidate, test at least representative current combinations from these families:

- Chromium + NVDA on Windows;
- Firefox + NVDA on Windows;
- Safari + VoiceOver on macOS;
- Safari + VoiceOver on iOS.

Exact supported versions should be recorded at execution time. Do not claim parity for combinations that were not run.

## Commit-before-reveal accessibility security

Before authoritative commit, the accessibility-facing surface may include prompt, choices, current selection, neutral description, flag/timer/session state, and neutral status. It must not include the correct option identifier, correctness, rationale, answer-bearing full image description, hazard target identity/count, answer-bearing source excerpt, or correctness-dependent labels/classes.

Persistence failure must announce a recoverable save failure while retaining selection and withholding outcome. Retry must not announce success until the authoritative write is known to have completed or reconciled as the same committed attempt.

## Hazard equivalents

The nonvisual hazard task is a first-class equivalent knowledge task, not a claim of identical visual-recognition measurement. Pre-reveal ordered zones expose observations without labeling hazards/decoys or target count. Post-reveal feedback follows the same stable zone order as visual annotations.
