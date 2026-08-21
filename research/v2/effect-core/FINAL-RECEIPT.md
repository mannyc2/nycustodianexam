# Final Receipt

Status: BLOCKED - not a contract-complete research lane

## GitHub receipt

| Field | Value |
| --- | --- |
| Repository | `mannyc2/nycustodianexam` |
| Requested source branch | `agent/chat-corpus-reconciliation` |
| Required source SHA supplied | `<BASE_SHA>` |
| Source head at branch creation | `8b0d26245c1d78fb0be4e79f874a7d8872056ceb` |
| Source head at final drift check | `645e885748c830f7a9cbbbe90ac0f31149bfc81c` |
| Source drifted | Yes |
| Output branch | `research/v2-effect-core` |
| Allowed path used | `research/v2/effect-core/**` |
| Initial commit | `39bbe66e87561c678df82ab913fc53eba3c34b5a` |
| Draft pull request | `https://github.com/mannyc2/nycustodianexam/pull/5` |
| Pull request state intended | Open and draft |
| Implementation changes | None |

The final branch head is intentionally reported by the branch ref, pull request, and visible final response rather than embedded here, because embedding the SHA of the commit containing this file is self-referential.

## Why the lane is blocked

1. The request supplied `<BASE_SHA>` rather than a concrete immutable SHA.
2. At the initial checkpoint, the source branch resolved to `8b0d26245c1d78fb0be4e79f874a7d8872056ceb`; the named shared contract and prompt-curation files were absent.
3. The branch and draft PR were created from that observed head before extended research.
4. During final verification, the source branch had advanced to `645e885748c830f7a9cbbbe90ac0f31149bfc81c`.
5. The later head introduced the shared contract and lane prompt. Both still contain `{{POST_CURATION_SOURCE_SHA}}` and state that the lane must not run until that placeholder is replaced.
6. The exact output branch already exists, and force-push is prohibited. Rebasing onto the new head would not repair the missing required SHA or retroactively satisfy the early receipt and probe requirements.

This PR must remain draft and must not be represented or merged as a completed v2 lane.

## Incremental commits

| Commit | Purpose |
| --- | --- |
| `39bbe66e87561c678df82ab913fc53eba3c34b5a` | Initialize the authorized path before extended research and open the draft PR |
| `80c0fe857d4e2e6faa3cfc70c90c89055740aedd` | Add the preliminary Effect v4 architecture report |
| `bc98d236b47c4b8e4e60b0e35d0396580be08006` | Add the proposed Bun workspace and package graph |
| `427f974b87e28de9cebe93292af1ca91d09d792c` | Add the service and Layer matrix |
| `3483d7321cbcfd658efae242b74c5d384e838b3c` | Add the architecture anti-pattern list |
| `7930c0f1fdb57c063a474f48da6be83624e6d4fb` | Add the pinned source ledger |
| `600a40bc4a79b551782e444cfc06548d44de01ba` | Add the initial machine-readable manifest |
| `fad70d4bc03a5c0430aca72614e4e9220d494736` | Mark the report blocked after source drift |
| `a97e7bd0a66d110c26a789e3a1092f2d59978b7f` | Record drift, post-drift governance, registry observations and missing probes in the source ledger |

Later receipt/manifest commits are visible on the branch and PR.

## Files produced

- `REPORT.md`
- `PACKAGE-GRAPH.md`
- `SERVICE-LAYER-MATRIX.md`
- `ANTI-PATTERNS.md`
- `SOURCE-LEDGER.md`
- `MANIFEST.json`
- `FINAL-RECEIPT.md`

All changes are under `research/v2/effect-core/**`.

## Upstream coordinates

| Dependency or source | Coordinate | Evidence status |
| --- | --- | --- |
| Effect source | `Effect-TS/effect@436f10d1efccec308426532ff3f88df9a96434f3` | CONFIRMED source inspection |
| `effect` | `4.0.0-rc.111` | CONFIRMED manifest and registry availability; not installed in this lane |
| `@effect/platform-browser` | `4.0.0-rc.111` | CONFIRMED upstream manifest; not installed in this lane |
| `@effect/platform-bun` | `4.0.0-rc.111` | CONFIRMED upstream manifest; not installed in this lane |
| `@effect/vitest` | `4.0.0-rc.111` | CONFIRMED manifest and registry availability; not installed in this lane |
| Bun registry publication | `1.4.0` | CONFIRMED registry publication on 2026-08-21; no local runtime observation |

## Preliminary conclusions retained

These conclusions are INFERRED project recommendations backed by the pinned source inspection, not runtime proof:

- Use `Context.Service` and explicit root-composed Layers.
- Use named `Effect.fn` for reusable effectful functions and `Effect.gen` for effect values and local orchestration.
- Use `Schema.TaggedError` for stable expected boundary failures and preserve interruption.
- Use Layer and Scope ownership at the narrowest truthful lifetime.
- Default to `forkChild` or scoped fibers; detached work requires explicit host ownership.
- Keep browser-window, service-worker, Bun compiler, future Cloudflare Worker and test roots distinct.
- Use `BrowserRuntime.runMain` for the initial interactive page and `BunRuntime.runMain` for the compiler.
- Use `ManagedRuntime` only at repeated imperative JavaScript-to-Effect boundaries and dispose it.
- Start with `apps/site`, `apps/content-compiler`, `packages/content` and `packages/study`.
- Keep browser storage and network implementations app-local.
- Do not create a Cloudflare Worker while static assets satisfy deployment.

## Probes and raw results

| Required evidence | Result |
| --- | --- |
| Private Bun fixture | Not created |
| Committed `package.json` and `bun.lock` fixture | Not created |
| Installed `node_modules/effect/AGENTS.md` complete reading | Not possible; no fixture was installed |
| `Context.Service` compile/test probe | Not run |
| Schema tagged-error compile/test probe | Not run |
| Scoped background/resource Layer probe | Not run |
| BunRuntime process-entry probe | Not run |
| Browser ManagedRuntime bridge probe | Not run |
| Layer composition and test substitution probe | Not run |
| Browser, service-worker, IndexedDB or Cloudflare runtime probe | Not run |
| Raw results directory | None |
| `MANIFEST.sha256` | Not generated; the lane is blocked and has no compliant fixture/raw-result corpus to certify |

No source inspection in this branch should be described as runtime observation, implementation, or certification.

## Restart conditions

A clean compliant rerun requires all of the following:

1. Replace the source-SHA placeholder in the maintained shared contract and lane prompt with one concrete immutable commit.
2. Verify the source branch equals that exact SHA before any extended reading.
3. Authorize a new branch and allowed path, because the exact requested branch now exists and force-push is prohibited.
4. Make the E04 and E08 raw reports available or explicitly remove/waive those required inputs.
5. Create and commit the required early `START-RECEIPT.md` before extended research.
6. Create a private Bun fixture, pin the exact Effect v4 cohort, commit `package.json` and `bun.lock`, and record the exact Bun runtime.
7. Read installed `node_modules/effect/AGENTS.md` completely and follow its linked package guidance.
8. Run and commit the required compile/test/runtime probes and raw results.
9. Produce the contract-required CSV ledgers, receipts, checksums and drift recheck.

Until those conditions are met, PR #5 is an auditable preliminary draft, not the completed lane requested by the v2 contract.
