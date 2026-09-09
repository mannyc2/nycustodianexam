# Prepared implementation draft PR

Status: prepared locally; not published.

Title: Implement reconciled Custodian study flows and review evidence

Repository: `mannyc2/nycustodianexam`

Head: `implementation/shared-home-practice-review`

Base: `design/reconciliation-2026-09-07`

The publication attempt was rejected by automatic approval review because explicit authorization was required to export this implementation source/evidence payload to the GitHub destination. No push or PR creation occurred. User approval is required before retrying; do not bypass the rejection.

## Prepared body

Implements the reconciled NYC Custodian handoff, starting with shared navigation, Home, Practice and Review and continuing through builders, Atlas, question/hazard players, Simulation, Exams, Settings, Offline, Report and Print. The app uses the real 91-question inventory, original reviewed artwork, durable save-before-feedback and exact historical receipts. No site-wide active exam is introduced.

This is a separate implementation draft stacked on `design/reconciliation-2026-09-07` at `aca00668ec6f4cf002cb79c13ce6ff70c7d5baf3`; #49 remains the design-reference review. The original dirty main checkout and imported design bytes were preserved.

Review entry point: [implementation evidence index](https://github.com/mannyc2/nycustodianexam/blob/implementation/shared-home-practice-review/design-review/2026-09-07/IMPLEMENTATION-INDEX.md). It links matching-width comparisons, state captures, intentional differences, exact release-upgrade/runtime evidence and PDF audits. Older screenshots are labeled as historical checkpoints.

Validation:

- Root `bun run verify` passes: 464 tests, all workspace/browser typechecks, layout/boundaries, build, visual/content checks and artifact/bundle invariants.
- Full browser sweep: 378 passed, 26 skipped, 10 stale-fixture failures. Corrected fixtures pass all affected suites: 45 passed, 12 declared capability skips. The latest print changes pass all 36 browser cases.
- Actual installed v4-to-v5 upgrade passes in Chromium, Firefox and WebKit, including saved simulation retention. Local workerd gates pass; no deployment or intake activation occurred.
- Eight table PDF estimates match measured counts. Eight prose PDFs retain searchable text and requested 12pt/18pt body size after fixing shrink-to-fit; prose counts remain estimates.

Still draft:

- Finish visual review of the remaining PDF pages and complete the handoff/component-contract acceptance audit.
- Manual assistive-technology, device and physical-printer checks remain uncertified. The production certification record is explicitly blocked.
- Historical UI/UX packet verification is historical evidence, not certification of the current interface.

No merge or deployment is requested by this draft.
