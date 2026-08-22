# R2.3 Start Receipt

## Repository checkpoint

- Repository: `mannyc2/nycustodianexam`
- Source branch: `agent/chat-corpus-reconciliation`
- Required immutable source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Verification result: **PASS** - the source branch compared identical to the required SHA (`ahead_by: 0`, `behind_by: 0`) at lane start.
- Output branch: `research/v2-effect-platform-runtimes`
- UTC start time: `2026-08-21T20:56:58Z`
- GitHub access result at initial checkpoint: **PASS** - the branch and draft PR were created through connected GitHub access.
- Draft PR: `https://github.com/mannyc2/nycustodianexam/pull/13`

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

All coordinates, package publication state, exports, source semantics, and runtime conclusions are independently re-checked. Special emphasis is placed on the Bun install/runtime, real browser, browser bundle, and workerd/Cloudflare evidence that PR #7 explicitly left blocked.

## Continuation authorization

The branch and draft PR already existed when this execution resumed. The user explicitly directed this execution to use the existing branch/PR and finish the work. The continuation did not force-push, rewrite history, create a duplicate branch, or create a duplicate PR.
