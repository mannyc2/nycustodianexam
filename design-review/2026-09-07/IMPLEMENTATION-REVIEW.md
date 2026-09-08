# First implementation slice — September 8, 2026

Base: `aca00668ec6f4cf002cb79c13ce6ff70c7d5baf3`, verified against the remote review branch before work. Branch: `implementation/shared-home-practice-review`. Isolated checkout: `/mnt/models/dev/nycustodianexam/implementation`. Original main working tree and imported reference bytes are preserved.

## Implemented

- Shared Practice / Library / Exams navigation with Settings utility, local SVG icons, four compact bottom tabs, and a scrollable Library sheet. Native disclosure, Escape/focus return, outside dismissal, and no-JavaScript navigation are preserved. Comparisons and coverage links resolve to actual sections.
- Home: series-specific introduction, inventory figures, stacked section headings, subject rows, study cards, compact announcement notice with desktop fact rows, framed trust table, and inset responsive footer.
- Practice: distinct first-visit and returning headings, one-bank coverage and exclusions, four desktop activity cards, saved-record sections and overlapping review counts. Existing practice lengths and storage recovery remain usable.
- Review: named hero, wider saved-answer rows, primary explanation links and quieter finish actions, explicit finish confirmation, overlapping filters, empty/read-failure/write-failure states. Durable state and save-before-feedback logic are unchanged.

## Evidence

[Side-by-side comparison gallery](implementation-comparison.html) pairs accepted references with implementation captures. [Capture manifest](implementation-screenshots/manifest.json) lists routes, fixture states, CSS dimensions, and viewport-image filenames. [Capture script](capture-implementation.mjs) reproduces the evidence against `NYCUSTODIAN_REVIEW_URL` (default `http://127.0.0.1:4187`).

Useful viewport captures:

- [Home desktop](implementation-screenshots/home-1248-viewport.png), [Home compact](implementation-screenshots/home-384-viewport.png)
- [Practice first visit](implementation-screenshots/practice-first-visit-1248-viewport.png), [compact Library sheet](implementation-screenshots/practice-library-open-384-viewport.png)
- [Review confirmation](implementation-screenshots/review-confirmation-1248.png), [compact confirmation](implementation-screenshots/review-confirmation-384.png)
- [Review read failure](implementation-screenshots/review-read-failed-384-viewport.png), [finish not saved](implementation-screenshots/review-finish-failed-384-viewport.png)

Visual inspection covered Home, first-visit/returning Practice, navigation open, Review confirmation, and recovery captures at 1248/384 CSS pixels. Corrections after the initial comparison include the announcement layout, trust-table frame, compact footer, hero proportions, and review action alignment. Full-page captures also include viewport-fixed navigation at its captured scroll position; use viewport images to judge fixed placement.

## Intentional differences and limits

- Home retains real Simulation, Review and Print destinations in place of prototype-only Cleaning procedures and Repair lab destinations. Simulation copy preserves user-chosen timing and does not assert an official duration. The Home CTA says Start practicing; the nominal first-visit desktop reference actually says Continue studying.
- Announcement prose and dates remain drawn from maintained machine-readable facts. The page does not turn the August 25 source review into a claim about live filing availability. Exact sources remain expandable; detailed source links and review dates increase page height.
- Practice retains the functioning 45/60/90 chooser below the hub, so the page is longer than the prototype. Its record counts use actual saved data. No global exam selection or resumable question-practice session is introduced.
- Captures use a real flagged answer saved through the player, rather than fabricating the designer's 23 saved records and five review items. Review filtering/finish persistence and unavailable records are additionally exercised by browser regression fixtures.
- The maintained native system-font stack resolves differently on Linux than in the supplied captures, affecting wrapping and height. SVG navigation glyphs replace the prototype's external Material Symbols font. This is visual comparison evidence, not pixel-perfect fidelity or manual accessibility certification.
- Scope is this first slice. Builder, Atlas, players, simulation, print and remaining utility families still need their detailed reconciliation. No deployment or merge was performed.

## Validation

Exact Bun 1.4.0 and Node 22.22.0. Root build and artifact checks pass: 526 canonical documents, 220 item-scoped artifacts, 291 byte-identical delivery assets, answer boundary and route budgets verified. Site and browser-harness typechecks pass. The four targeted Chromium suites cover 23 tests, including mobile reflow/accessibility, keyboard/no-JavaScript navigation, storage recovery, review persistence and bottom-sheet destination checks. Captures cover 24 route/state/width combinations with full-page and viewport images and no unexpected page errors.
