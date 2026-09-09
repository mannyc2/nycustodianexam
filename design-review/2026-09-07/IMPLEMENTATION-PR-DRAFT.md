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

- At implementation source `cc400cb782947fc3ce71542b694971caeb9a6db1`, 514 workspace tests, all workspace/browser typechecks, layout/boundaries, 396 visual asset hashes, production build and artifact/bundle checks passed. Root `bun run verify` exited 1 only at the historical packet validator when sandbox Git access returned EPERM; that exact read-only validator passed separately with approved access.
- Full local Chromium/Firefox/WebKit suite against the same unchanged build: **442 passed, 26 explicitly skipped, zero failures** (468 cases, 12.0 minutes). Skips are named Chromium-only BFCache and service-worker/Cache API inspection checks in Firefox/WebKit. Cloudflare-tagged checks remain separate.
- Actual installed v4-to-v5 upgrade passes in Chromium, Firefox and WebKit, including saved simulation retention. Local workerd gates pass; no deployment or intake activation occurred.
- Eight table PDF estimates match measured counts. Eight prose PDFs retain searchable text and requested 12pt/18pt body size after fixing shrink-to-fit; prose counts remain estimates.

Still draft:

- Complete the remaining handoff/component-contract and matching-reference visual acceptance. Recorded full PDF inspections cover four corrected explanation PDFs (41 pages), four corrected fact-sheet PDFs (185 pages), and eight current table PDFs (27 pages), each at its documented revision; these are not a blanket current-build or every-product certification.
- Manual assistive-technology, device and physical-printer checks remain uncertified. The production certification record is explicitly blocked.
- Historical UI/UX packet verification is historical evidence, not certification of the current interface.

The implementation now also includes named static Fact states, shared source-line rendering, and source detail citations with retained excerpts, verification dates, tier/version metadata and offline-safe external-link behavior. Desktop/compact source captures and browser checks are linked from the evidence index.

No merge or deployment is requested by this draft.
