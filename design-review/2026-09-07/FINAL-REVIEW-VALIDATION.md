# Integrated verification before draft review

Source: `718b388443e6c3bb889ef9a391db4d614e820946`, after prose estimation and print wrapping changes. The subsequent review-index edits are documentation only.

From implementation root:

```sh
PATH=/tmp/nyc-bun-1.4.0/bun-linux-x64:$PATH bun run verify
```

The command completed with exit 0 using the required Bun 1.4.0 / Node 22.22.0 toolchain.

- Maintained layout: 283 files; module boundaries: 143 modules.
- All five workspace typechecks and browser-test typecheck passed.
- 464 unit/integration tests passed: content 103, intake 3, compiler 15, correction worker 8, site 335.
- Visual/content checks and production generation passed.
- 1,352 route documents, 224 published item-scoped artifacts and 291 byte-identical delivery assets passed invariants. The build retains 59 safe shell URLs; consolidated postcommit data is absent and the shell is answer-free.
- All island byte budgets passed. Print center: 452,544 raw / 137,140 gzip / 115,773 Brotli bytes. Print preview: 470,977 / 139,988 / 117,998 bytes.
- The certification record is valid **and blocked**. This is not production certification.
- Historical UI/UX packet validation passed at `4130693dee6caaa804a116f490b2192861f53e6e`: four reviews, 41 sources, 19 promoted rules, seven unresolved rules, 61 mutation checks, zero human participants. This explicitly validates that historical packet, not the current application design.

Browser evidence is separate: `FULL-BROWSER-SWEEP.md` records the broad run and fixture corrections. The latest changed print implementation passed all 36 cross-browser print cases. `PRINT-PROSE-ESTIMATES.md` records actual PDF/font checks and the limits of sampled visual inspection. Local workerd evidence is in `LOCAL-RUNTIME-GATES.md` and `STATIC-ASSETS-SIMULATION.md`.

No merge, deployment, intake activation or manual accessibility/device/printer certification is implied by this checkpoint.


## Current implementation recheck

Source `00409514b36ad12d484736728ea4dd1290edda9f`, including the explicit Practice/Review/Simulation question variants and fact-sheet heading pagination fix. Pending worktree changes at execution were review documentation and captured evidence only.

The root `bun run verify` run passed toolchain, maintained layout (284 files), module boundaries (144 modules), certification-record validation, visual release verification, all five workspace typechecks, browser-test typecheck, all 467 unit/integration tests (content 103, intake 3, compiler 15, correction worker 8, site 338), production generation and artifact/bundle invariants. Output remains 1,352 route documents, 224 published item-scoped artifacts, 291 byte-identical assets and 59 safe shell URLs. Every island byte budget passed.

The root command exited 1 at its final historical packet validator because a `git` subprocess returned sandbox `EPERM`. The exact unchanged validator was then rerun outside that sandbox and exited 0: four reviews, 41 sources, 19 promoted rules, seven unresolved rules and 61 mutation checks. This is a successful separate recheck of the final gate, not a single exit-0 root invocation. Transient logs: `/tmp/nyc-current-integrated-verify.log` and `/tmp/nyc-current-packet-recheck.log`.

No browser suite was included in this run. Existing browser evidence retains its recorded revision and scope. The certification record remains valid and blocked, and the historical packet explicitly excludes the current implementation from its evidence scope.


## Combined component checkpoint at 6bc18ea

The integrated run after explicit question feedback/controls, shared question bodies, Simulation player/results providers and the setup controller passed all application gates: exact toolchain, layout (291 files), boundaries (151 modules), visual/content checks, five workspace typechecks, browser-test typecheck, 473 unit/integration tests (content 103, intake 3, compiler 15, correction worker 8, site 344), production build and artifact/bundle invariants. Output is 1,352 route documents, 224 item-scoped artifacts, 291 byte-identical assets and 60 safe shell URLs. Every island remains within its byte budget.

The root command again exited 1 solely at the historical packet validator's sandbox-denied `git` subprocess (`EPERM`). The exact unchanged validator then passed separately outside that sandbox. Logs: `/tmp/nyc-component-integrated-verify.log`, `/tmp/nyc-component-packet-recheck.log`. This is not an exit-0 root invocation. Historical packet scope and blocked production certification remain unchanged.

Browser verification remains separately recorded in QUESTION-COMPOSITION-AUDIT.md: the final setup controller passed all 27 Simulation cases; earlier question control/body changes have their own passing targeted suites. No new broad browser sweep or full visual acceptance is implied by this integrated checkpoint.

## Controller-family checkpoint at 94095d9

Source `94095d9f64f2bcd0f4dbc5ed89d7f46b3523e7ec`, after the Review, Settings, Offline and Report controller/provider corrections. The worktree was clean at the start of integrated verification.

All application gates passed: exact Bun 1.4.0 / Node 22.22.0, maintained layout (301 files), module boundaries (158 modules), visual release (396 hash-verified artifacts), five workspace typechecks, browser-test typecheck, 492 unit/integration tests (content 103, intake 3, compiler 15, correction worker 8, site 363), production build and artifact/bundle invariants. Output remains 1,352 route documents, 224 item-scoped artifacts, 291 byte-identical delivery assets and 59 safe shell URLs. All island byte budgets passed.

The root `bun run verify` invocation exited 1 only at its final historical packet validator because `spawnSync git` returned sandbox `EPERM`. The exact unchanged validator then exited 0 when run separately outside that sandbox: packet `4130693dee6caaa804a116f490b2192861f53e6e`, four reviews, 41 sources, 19 promoted rules, seven unresolved rules, 61 mutation checks, no human participants. Logs: `/tmp/nyc-controller-family-integrated-verify.log` and `/tmp/nyc-controller-family-packet-recheck.log`. This is not a single exit-0 root invocation, and the historical packet excludes current implementation from its evidence scope.

Targeted browser results for these corrections are recorded in REMAINING-COMPONENT-CONTRACT.md: Review 27 passes, Settings 48 passes, Offline 21 passes with 12 declared skips, Report nine passes. Those runs are separate and retain their respective source scopes; no new complete browser sweep or full visual acceptance is claimed. Production certification remains valid and blocked. Nothing was pushed, deployed, merged or activated by this checkpoint.


## Setup and Hazard-family checkpoint at 364835e

Source `364835e61c7f381a57dad4533f93abd9d8e976df`, including Study/Print provider corrections, Practice/Hazard setup controllers and pieces, explicit Hazard Simulation/Review variants and the saved-review offline cache fix. The worktree was clean at the start and remained clean after the checks.

All application gates passed: exact Bun 1.4.0 / Node 22.22.0, maintained layout (313 files), module boundaries (168 modules), 396 hash-verified visual artifacts (65 tools, 14 comparisons, 18 scenes), all five workspace typechecks, browser-test typecheck, and 504 unit/integration tests (content 103, intake 3, compiler 15, correction worker 8, site 375). Production build and artifact/bundle checks passed: 1,352 route documents, 224 item-scoped artifacts, 291 byte-identical delivery assets and 59 safe shell URLs. Every island byte budget passed.

The root command exited 1 only at its final historical packet validator because `spawnSync git` returned sandbox `EPERM`. The exact unchanged read-only validator then exited 0 separately outside the sandbox, verifying packet `4130693dee6caaa804a116f490b2192861f53e6e`: four reviews, 41 source artifacts, 19 promoted rules, seven unresolved rules, 61 mutation checks and no human participants. The historical packet explicitly excludes the current implementation. Logs: `/tmp/nyc-hazard-family-integrated-verify.log`, `/tmp/nyc-hazard-family-packet-recheck.log`. This is not a single exit-0 root invocation.

No browser suite was included in this root run. Family-specific browser results, including the final six offline Hazard Review passes with the fixture server disconnected, retain their separate source scopes in REMAINING-COMPONENT-CONTRACT.md. Remaining architecture enforcement, component composition and visual/PDF acceptance are still open. Production certification remains valid and blocked. No publication, merge, deployment or intake activation occurred.


## Integrated checkpoint at 3a77b74

Source `3a77b749c881f5e1b8527864ada2ea415485b841`, clean before execution, exact Bun 1.4.0 and Node 22.22.0. Maintained layout passed for 317 files; boundaries for 170 modules; React conventions for 153 sources and 46 detector fixtures. All 396 visual artifact hashes passed. Five workspace typechecks and browser typecheck passed. All 506 unit/integration tests passed (content 103, intake 3, compiler 15, worker 8, site 377). Production generation and artifact/bundle checks passed: 1,352 documents, 224 published item-scoped artifacts, 291 byte-identical delivery assets and 60 safe shell URLs.

The root command exited 1 at the historical validator with `spawnSync git EPERM`; the exact read-only command rerun outside the sandbox exited 0 for packet `4130693dee6caaa804a116f490b2192861f53e6e` (4 reviews, 41 sources, 19 promoted rules, 7 unresolved rules, 61 mutation checks, no human participants). This remains two executions, not a single green root run. Logs: `/tmp/nyc-current-tables-integrated-verify.log` and `/tmp/nyc-current-tables-packet-recheck.log`. The historical validator excludes the current implementation. Production certification remains blocked; no full browser sweep or manual certification is claimed by this checkpoint. Eight current table PDFs were subsequently captured for separate visual acceptance.

## Integrated lifecycle checkpoint — 4150515

Verified source `415051547cd7050beb43be0b7165c065880a603f` with exact Bun 1.4.0 and Node 22.22.0. Maintained layout passed for 320 files, module boundaries for 171 modules, and React/leaf-capability checks for 154 sources with 46 detector fixtures. Visual release verification checked 396 artifact hashes (65 tools, 14 comparisons, 18 scenes). All five workspace typechecks and the browser typecheck passed. All 512 tests passed: 103 content, 3 intake, 15 compiler, 8 worker and 383 site tests.

Production generation and artifact/bundle verification passed: 1,352 documents, 224 item-scoped artifacts, 291 byte-identical delivery assets and 60 safe shell URLs. Root `verify` exited 1 solely at the final historical packet validator's `spawnSync git EPERM`. Running that exact read-only validator separately outside the sandbox exited 0 for packet `4130693dee6caaa804a116f490b2192861f53e6e`: 4 reviews, 41 sources, 19 promoted rules, 7 unresolved rules and 61 mutation checks. This is not a single green root invocation; the historical packet explicitly excludes current implementation certification and contains no human evidence.

Logs: `/tmp/nyc-lifecycle-integrated-verify.log`, `/tmp/nyc-lifecycle-packet-verify.log`. The separately recorded 12-case lifecycle browser suite remains the current focused browser observation; this command did not rerun the full browser suite. Production certification remains valid and blocked. No new visual comparison, physical-device, assistive-technology or printer acceptance is claimed.
