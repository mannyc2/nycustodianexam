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
