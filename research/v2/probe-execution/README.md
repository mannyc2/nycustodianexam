# V2 probe-execution pass — 2026-08-22

This directory closes the runtime-evidence gap that every v2 Effect/Bun lane
recorded as BLOCKED. The lanes' research environments had no outbound network,
no Bun executable, and a policy-locked Chromium; they published source analysis
plus pinned, ready-to-run fixtures with explicit blocked receipts. This pass
executed those fixtures — and wrote the probe code the lanes specified but
could not write — in a network-enabled environment.

## Environment

- Linux x86_64 (6.18.44), network access to registry.npmjs.org
- Bun **1.4.0** (exact pin; installed via npm `bun@1.4.0`)
- Node 22.22.2, Vite 8.2.1/8.2.2 (per-lane pins), Terser 5.50.0
- Chromium **141.0.7390.37** headless (Playwright build 1194), real
  IndexedDB on `http://127.0.0.1` origins — no policy blocks
- workerd **2026-08-22** (npm), real workerd runtime — not Node emulation
- Effect cohort: `effect@4.0.0-rc.111`, `@effect/platform-browser@4.0.0-rc.111`,
  `@effect/platform-bun@4.0.0-rc.111` (R2.3 fixture kept its declared rc.110)

## Layout

- `r2.1/ … r2.5/` — raw execution evidence per lane (lockfiles, transcripts,
  JSON results, measurements)
- `FINDINGS.md` — per-lane mapping from each blocked open question to the
  observed answer, plus defects found in the blind-written fixtures
- `code/` — probe code written or corrected by this pass, staged for adoption
  back into each lane's fixture tree

## Method notes

- Lane fixture trees were extracted from each lane's branch head; nothing on
  the lane branches was modified. Corrections to blind-written probe code are
  recorded in `FINDINGS.md` and staged under `code/`.
- All measurements use raw bytes, independent `gzip -9`, and Brotli quality 11
  per emitted chunk, source maps disabled.
- Probes not yet covered are listed at the end of `FINDINGS.md`; nothing here
  claims completeness beyond what was executed.
