# Implementation review entry point

This branch implements the reconciled handoff at `aca00668ec6f4cf002cb79c13ce6ff70c7d5baf3`, beginning with the shared shell, Home, Practice and Review, and continuing through the remaining page families. It preserves the independent/unofficial content boundary, real inventory counts, original reviewed artwork, and durable save-before-feedback behavior. There is no site-wide active exam.

The separate implementation draft is based on `design/reconciliation-2026-09-07`; design PR #49 remains the supplied-reference review. Do not merge or deploy from this index. The original dirty main checkout was preserved.

## Find the evidence

The original [snapshot README](README.md), imported exports and `current-screenshots/` describe the handoff baseline. They are not the latest application captures. The documents below contain revision-specific manifests, capture scripts, comparisons, intentional differences and limits. Functional checks alone do not prove visual fidelity.

| Area | Review entry | Evidence scope |
| --- | --- | --- |
| Shared navigation, Home, Practice, Review | [IMPLEMENTATION-REVIEW.md](IMPLEMENTATION-REVIEW.md) | First-slice comparison gallery and later focused corrections; real saved/empty/failure states. |
| Current work checklist | [IMPLEMENTATION-STATUS.md](IMPLEMENTATION-STATUS.md) | Page-family evidence and remaining work; implementation is not yet certified complete. |
| Practice builder | [PRACTICE-BUILDER-REVIEW.md](PRACTICE-BUILDER-REVIEW.md) | Preset/custom lengths, retained choices, setup navigation and durable Review history. |
| Hazard builder | [HAZARD-BUILDER-REVIEW.md](HAZARD-BUILDER-REVIEW.md) | Visual/nonvisual setup, matching-width composition and recovery. |
| Atlas and setup | [SETUP-ATLAS-REVIEW.md](SETUP-ATLAS-REVIEW.md) | Nine-family catalog and real simulation setup; no global exam selection. |
| Atlas records | [ATLAS-RECORD-REVIEW.md](ATLAS-RECORD-REVIEW.md) | All 65 tools, reference-only eligibility and sampled record/family views. |
| Question player | [QUESTION-PLAYER-REVIEW.md](QUESTION-PLAYER-REVIEW.md) | Commit-before-feedback, illustrations, authored nonvisual mode and historical receipts. |
| Hazard player | [HAZARD-PLAYER-REVIEW.md](HAZARD-PLAYER-REVIEW.md) | Marked/keyboard/nonvisual/saved/failure states and in-place marker explanations. |
| Simulation | [SIMULATION-FLOW-REVIEW.md](SIMULATION-FLOW-REVIEW.md) | Setup, timer, durable answers, submitted results and review. |
| Simulation navigation | [SIMULATION-NAVIGATOR-REVIEW.md](SIMULATION-NAVIGATOR-REVIEW.md) | Navigator state, focus, compact layout and item controls. |
| Exams and utilities | [UTILITY-PAGES-REVIEW.md](UTILITY-PAGES-REVIEW.md) | Exams, Settings, Offline and related utility behavior. |
| Exam records | [EXAM-RECORD-REVIEW.md](EXAM-RECORD-REVIEW.md) | Source-bound facts, filters, tabs and announcement hierarchy. |
| Report | [REPORT-REVIEW.md](REPORT-REVIEW.md) | Shared-component adaptation; local draft recovery and dormant intake. No dedicated supplied Report prototype. |
| Print screen and earlier PDFs | [PRINT-OUTPUT-REVIEW.md](PRINT-OUTPUT-REVIEW.md) | Preview states and earlier question/tool/hazard output passes; observations are revision-specific. |
| Latest print tables | [PRINT-TABLE-ESTIMATES.md](PRINT-TABLE-ESTIMATES.md) | Eight PDF estimates match measured pagination for the captured counts/settings. |
| Latest prose print | [PRINT-PROSE-ESTIMATES.md](PRINT-PROSE-ESTIMATES.md) | Content-based estimates and corrected 18pt body text; eight checksummed PDFs and text-layout audit. |
| Runtime gates | [LOCAL-RUNTIME-GATES.md](LOCAL-RUNTIME-GATES.md) | Local terminal withdrawal/failure and disabled intake workerd proof; not deployment. |
| Static Assets routing | [STATIC-ASSETS-SIMULATION.md](STATIC-ASSETS-SIMULATION.md) | Local Cloudflare simulation/print-shell routing; includes the original failure and isolated recheck. |
| Installed release upgrade | [UPGRADE-V4-V5.md](UPGRADE-V4-V5.md) | Actual installed v4 content and saved simulation across the v5 update. |
| Integrated verification | [INTEGRATED-VALIDATION.md](INTEGRATED-VALIDATION.md) | Root checks, source layout and explicitly historical packet validation; see latest checkpoint below. |
| Full browser sweep | [FULL-BROWSER-SWEEP.md](FULL-BROWSER-SWEEP.md) | 414-case run, diagnosed fixture failures, and passing affected suites; no invented all-green sweep. |

Start visual review with the [comparison gallery](implementation-comparison.html), then follow each page family's later audit links. The gallery is the first-slice checkpoint; later corrections are documented in the linked reviews rather than silently relabeling older screenshots as current.

## Open acceptance items

- Finish visual review of the remaining print PDFs. The latest prose pass checks all text bounds and dominant body font size, but visually inspects only two source pages. Those automated checks do not certify every page, small label, overlap or physical printer.
- Prose page counts remain estimates: the measured matrix differs by -1 to +5 pages. Final browser/printer pagination is authoritative.
- Reconcile any remaining component-contract or page/state gaps against the maintained product documents before declaring the full handoff complete.
- Manual assistive-technology, device and physical-print certification remains unverified. The production certification record is explicitly blocked; passing automated tests must not be called production certification.
- No merge, deployment, intake activation or external report delivery has occurred. Publication as a draft review does not close the above items.

## Latest automated checkpoint

See `FINAL-REVIEW-VALIDATION.md` for the integrated run following the final print changes. Earlier runs retain their exact source and scope in the individual documents; counts from separate runs are not summed into an invented single run.
