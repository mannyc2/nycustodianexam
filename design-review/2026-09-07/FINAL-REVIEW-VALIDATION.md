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
