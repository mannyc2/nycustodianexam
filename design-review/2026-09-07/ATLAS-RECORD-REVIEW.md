# Atlas record and unavailable-image review

The accepted export index defines catalog states (all families, selected family, compact selection, unavailable illustrations). It supplies no separate tool-detail or family-detail mockup. Existing semantic record/family pages remain the baseline for those routes.

The unavailable-image catalog now displays each released neutral description directly, matching the reference’s readable-record fallback. It retains record links, family controls, and eligibility notices. Empty placeholder thumbnails are removed; compact descriptions span the card width. No replacement or invented image is supplied.

`capture-atlas-records.mjs` captures the pipe-wrench record, articulated-hand-tools comparison, and missing-image catalog at 1053 and 384 CSS pixels. All six captures complete without page errors or document horizontal overflow. The compact record and unavailable-image captures were visually inspected. This samples two record routes; it is not a claim that every record/comparison is visually certified.

Production build/artifact invariants pass. Three Atlas Chromium checks pass, including responsive navigation and actual failed-image requests. The failure check now confirms the released image alternative is visible as fallback text.

Remaining: final catalog matching-width comparison and cross-browser checks. All 65 generated records retain supported use, recognition cues, scope/eligibility, and source evidence in the generator; full content correctness remains governed by the released corpus and artifact checks.

## Reference-only inventory verification

`verify-atlas-records.py` parses all 65 generated main-content regions. Each has a nonempty image alternative, a released image file, and the required use/cue/evidence/scope/eligibility/source sections. Exactly 12 are reference-only; each has a restriction notice and no `/practice/` link in main content. The shared navigation remains available. Results are recorded in `atlas-record-screenshots/inventory-verification.json`. This verifies generated completeness and restrictions, not underlying source truth.

The expanded capture script records the soldering-gun restriction at 1053/384 CSS pixels and asserts that its main content has no Start practice link. The compact restriction capture was visually inspected: eligibility, publication restriction, and source trail remain readable above the bottom navigation. Eight captures now complete without page errors or document horizontal overflow.
