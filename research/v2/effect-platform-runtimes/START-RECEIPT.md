# R2.3 Start Receipt

## Repository checkpoint

- Repository: `mannyc2/nycustodianexam`
- Source branch: `agent/chat-corpus-reconciliation`
- Required immutable source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Verification result: **PASS** - the source branch compared identical to the required SHA (`ahead_by: 0`, `behind_by: 0`).
- Output branch: `research/v2-effect-platform-runtimes`
- UTC start time: `2026-08-21T20:56:58Z`
- GitHub access result: **PASS** - branch creation and repository writes are available through the connected GitHub capability.

## Authorized scope

Research current Effect v4 capabilities across browser pages, Bun tooling, browser Service Workers, and Cloudflare workerd. Compare native Web APIs, project-owned Effect services, official Effect core/platform abstractions, and maintained third-party libraries only when necessary. Produce the required package/runtime matrix, audits, topology guidance, false-portability analysis, fixtures, raw probe evidence, ledgers, receipts, and checksums.

Allowed path only:

```text
research/v2/effect-platform-runtimes/**
```

No application implementation, maintained-authority edits, workflow changes, dependency-graph changes, merges, releases, tags, force-pushes, or production assets are authorized.

## Preliminary evidence checkpoint

Closed, unmerged PR #7 (`research/v2-effect-platform`, head `7fb3965056f57305ff10f418e0238fb2427ef41d`) is substantial preliminary evidence, not authority for this finalized lane. Its recorded coordinates were:

- Effect source commit `436f10d1efccec308426532ff3f88df9a96434f3`, source version `4.0.0-rc.111`;
- browser/Bun/node-shared/vitest source cohort `4.0.0-rc.111`;
- observed npm `@effect/platform-bun` release candidate `4.0.0-rc.110`;
- Bun `1.3.14`.

All coordinates, package publication state, exports, source semantics, and runtime conclusions will be independently re-checked. Special emphasis will be placed on the Bun install/runtime, real browser, browser bundle, and workerd/Cloudflare evidence that PR #7 explicitly left blocked.

## Intended checkpoints

1. Publish this start receipt and open a draft PR.
2. Complete mandatory repository reading and independently audit PR #7 artifacts.
3. Pin current upstream/package coordinates and commit the source/fixture baseline.
4. Run and preserve browser, Bun, handler/build, lifecycle-reuse, and workerd-compatible probes where supported.
5. Publish the substantive reports, matrices, raw results, manifest, final receipt, and source-drift recheck incrementally.
