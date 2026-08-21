# R2.5 Final GitHub Receipt

Publication status: **COMPLETE AS A BLOCKED LANE RECEIPT**  
Research/measurement status: **BLOCKED / INCOMPLETE — required Bun/Vite runtime measurements were not executed**

## Repository identity

- Repository: `mannyc2/nycustodianexam`
- Source branch: `agent/chat-corpus-reconciliation`
- Required immutable source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Output branch: `research/v2-effect-browser-bundling`
- Draft PR: `https://github.com/mannyc2/nycustodianexam/pull/15`
- Allowed path: `research/v2/effect-browser-bundling/**`
- Final source-drift recheck: **PASS / identical** at `2026-08-21T23:00:55Z` (`ahead_by=0`, `behind_by=0`)

## Lane commits

1. Start checkpoint: `18f7aebbb24568c0d5ef9737f9431e39c265d7c6` — `research(r2.5): add start receipt`
2. Cohort/fixture baseline: `ddbd7f023fe563601136440e46db7859f027a554` — `research(r2.5): pin current cohort and fixture plan`
3. Final substantive evidence head: `4bd809e71278310d16a6dea2eec5ef1661687720` — `research(r2.5): publish blocked measurement evidence`
4. Receipt/checksum commit: this file and `MANIFEST.sha256` are published together after the substantive head. A Git commit cannot embed its own SHA without changing that SHA; the immutable receipt/checksum commit SHA is therefore recorded in PR #15's body and the final chat handoff immediately after this commit is created.

## Exact pinned coordinates

- Bun `1.4.0`
- `effect@4.0.0-rc.111`
- `@effect/platform-browser@4.0.0-rc.111`
- `@effect/platform-bun@4.0.0-rc.111`
- Vite `8.2.2`
- Rolldown `1.2.5`
- Terser `5.50.0`
- Preact `10.29.8`
- `@cloudflare/vite-plugin@1.53.1`
- Wrangler `4.125.0`

## What was published

- controlling-source/source-ledger research and exact dependency cohort;
- private Bun workspace/catalog/isolated-linker fixture skeleton with the required `apps/*` / `packages/*` topology;
- explicit `workspace:*` internal edges and direct external dependency declarations;
- no-Effect static-reference and native service-worker source baselines;
- exact P01–P13 post-install probe specification;
- fixture, route-closure, import-sensitivity, minifier, decision, budget, and open-question matrices;
- raw environment, registry failure, and native-bootstrap blocker captures;
- reproducibility instructions including frozen install, independent compression, route-closure accounting, and two-clean-build hash checks;
- checksums in `MANIFEST.sha256`.

## Required artifacts that could not be truthfully produced

- `bun.lock`: **NOT PRODUCED**. Bun 1.4.0 was not available in the execution environment and registry DNS failed. The lane publishes `fixtures/bundle-lab/BUN-LOCK-BLOCKED.md` instead of fabricating a lockfile.
- Effect-bearing fixture source: **NOT PRODUCED**. The exact install could not occur, so the shared contract's required read of installed `node_modules/effect/AGENTS.md` could not be satisfied.
- raw/minified/gzip9/Brotli11 bundle measurements: **NOT PRODUCED**.
- Vite manifest/chunk graph/route-closure bytes: **NOT PRODUCED**.
- Oxc-versus-Terser comparison: **NOT PRODUCED**.
- Bun isolated-install single-Effect-cohort verification: **NOT PRODUCED**.
- two-clean-build reproducibility hashes/durations: **NOT PRODUCED**.
- numeric R2.5 budgets: **NOT RECOMMENDED**.

Blocked sentinel rows are present in the required CSVs so missing measurements cannot be mistaken for zero-byte results.

## Runtime blocker receipt

Observed host:

- Linux x86_64, kernel `6.18.35`
- Node `v22.16.0`
- npm `10.9.2`
- `bun`: command not found
- Vite/Rolldown/Docker/Podman: not on PATH
- `npm view vite version --fetch-timeout=5000 --fetch-retries=0`: failed with `EAI_AGAIN registry.npmjs.org`
- relevant npm cache queries: empty
- Bun release archive bootstrap: transport rejected `application/zip`
- Rolldown Linux x64 GNU native binding bootstrap: 19,910,424-byte response reached, then transport rejected `application/x-sharedlib`

No older toolchain, WASM substitute, or Effect v3 measurement was substituted.

## Evidence conclusion

The recovered first-pass report was used only for methodology: independent per-chunk compression, route-closure accounting, static-page isolation, source-map exclusion, import/minifier comparisons, and clean-build reproducibility. Its Effect v3 production recommendation, bundle numbers, pnpm-specific deductions, and numeric budgets are superseded.

Current source research confirms the v4 RC/browser-platform surfaces to measure, including current IndexedDB support, BrowserHttpClient's unstable HTTP reach, and Atom under `effect/unstable/reactivity`. Their production bundle cost remains unknown until the runtime lane can execute.

## Scope and safety

- No production code, product contract, dependency graph, workflow, lockfile outside the lane, repository settings, tags, releases, or maintained architecture files were modified.
- No force-push or merge was performed.
- No workflow was created, changed, or dispatched.
- The draft PR remains draft because the required measurement evidence is incomplete.

Generated at `2026-08-21T23:00:55Z`.
