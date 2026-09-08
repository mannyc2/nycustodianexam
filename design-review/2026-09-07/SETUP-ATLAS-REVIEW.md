# Simulation setup, Atlas, and print configuration

Continuation of `acd7a88`, on `implementation/shared-home-practice-review`.

## Implemented

- Simulation setup uses the shared statewide bank without a profile prerequisite. Saved sessions still retain their immutable compatibility/content/version references. The player no longer invites changing a removed profile selection.
- A chosen length remains selected while it fits. Reducing inventory below it disables Start, shows the actual count, and requires an explicit replacement. An all-matching choice remains selected if subsequent expansion still accommodates that length.
- Visual and written-zone hazard simulation formats retain distinct behavior. The single ineffective hazard category picker is omitted; scene inventory is stated directly.
- Setup uses the supplied scope panel, ruled control groups, summary, repeat-set disclosure and start action. Timing, timer visibility, opt-in auto-submit, and deterministic seed remain effective.
- Atlas keeps nine desktop family tabs and adds a synchronized compact Family select, URL restoration, thumbnails, and explicit eligibility. Failed images retain a readable record link and failure message.
- Print configuration starts with the shared bank. All ten real products remain represented, with availability reasons. Fact-sheet printing uses the actual reviewed document and only offers a document choice if multiple fact-bearing profiles exist. Controls lock while generating; count validity includes a finite integer check.
- Maintained product documents now reflect the accepted removal of ineffective profile controls and the explicit length-replacement transition. Imported reference bytes remain unchanged.

## Actual content differs from prototype fixtures

The current bank has 90 questions. Safe membership metadata identifies 30 cleaning, 37 maintenance, 5 safety, and 18 mixed/scenario questions without a single domain membership. The prototype uses 34/26/30. The application preserves real counts and the mixed category; assigning its questions to an area based on guesswork would violate the content boundary. The all-matching recovery capture therefore offers 30, not 34.

The nine Atlas family totals match the reference. The compact prototype shows six examples; the application retains all 65 records. The prototype print image is a collection of specimens, so configuration is captured as a separate state rather than displaying ready/failure/generating together.

## Visual evidence

[Capture manifest](setup-atlas-screenshots/manifest.json) includes viewport widths and element bounds. [Reproduction script](capture-setup-atlas.mjs) uses the local preview at `NYCUSTODIAN_REVIEW_URL` (default port 4187).

- [Timed setup](setup-atlas-screenshots/simulation-timed-1053.png), [compact setup](setup-atlas-screenshots/simulation-timed-384.png)
- [Replacement required](setup-atlas-screenshots/simulation-length-replacement-1053.png), [all matching chosen](setup-atlas-screenshots/simulation-all-matching-1053.png)
- [Visual hazard setup](setup-atlas-screenshots/simulation-hazards-1053.png), [written-zone setup](setup-atlas-screenshots/simulation-written-zones-384.png)
- [Atlas all families](setup-atlas-screenshots/atlas-all-990.png), [compact thumbnails](setup-atlas-screenshots/atlas-all-384-viewport.png), [image failure](setup-atlas-screenshots/atlas-images-unavailable-384.png)
- [Print configuration](setup-atlas-screenshots/print-builder-1053.png), [fact-sheet document](setup-atlas-screenshots/print-fact-sheet-384.png)

Reference comparisons: exports 30/31 for simulation, 32/33/34 for Atlas, and the configuring portion of 38 for print. Linux's native system font differs from the supplied element captures. Captures include the real format controls and fourth inventory category, so their content height differs from the prototype. Visual inspection prompted a corrected primary print action, summary/action order, compact record dimensions, scope-heading sizing, and suppression of an offscreen skip-link artifact while keeping keyboard focus visible.

## Verification

Bun 1.4.0 / Node 22.22.0. Root build/artifact verification passes (526 documents, 220 item-scoped artifacts, 291 delivery assets, answer boundary and route budgets). All five workspace typechecks and 401 unit tests pass; browser harness typecheck passes. All 33 targeted Chromium tests pass across the simulation, print and design-handoff suites, including new explicit length retention/replacement, responsive selector, image-failure, and existing durable-save/restore boundaries.

This is not the complete handoff: Practice/Hazard builder composition, remaining player views, print preview, utility/reference visual reconciliation and the final broad verification remain in the implementation checklist.
