# R2.7 final receipt

## Immutable source

- Repository: `mannyc2/nycustodianexam`
- Source branch: `agent/chat-corpus-reconciliation`
- Required immutable source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Output branch: `research/v2-bun-monorepo-discipline`
- Draft PR: https://github.com/mannyc2/nycustodianexam/pull/18
- Initial receipt commit: `ff51ae3a7ac6814347038b017075a303602d7b21`

## Publication state

Substantive R2.7 outputs have been pushed to the authorized remote branch. All lane changes remain under `research/v2/bun-monorepo-discipline/**`.

## Exact coordinates

- Bun: `1.4.0`
- Bun tag: `bun-v1.4.0`
- Bun tag commit: `34cbb9a40b4bd1bd767d134a7065e66c2432a676`
- Effect v4 cohort researched: `4.0.0-rc.111`
- Effect source coordinate observed during lane: `1144032cedda7b5eacc1ebf980d06957c7a59ddf`
- Source manifests at that coordinate report `effect`, `@effect/platform-browser`, `@effect/platform-bun`, and `@effect/vitest` as `4.0.0-rc.111`.

## Main conclusion

Use a private Bun workspace root with `apps/*` and `packages/*`, exact Bun pinning, a root catalog for one coordinated Effect cohort, explicit runtime dependencies in consumers, `workspace:*` for internal edges, isolated linking, committed text `bun.lock`, frozen CI installs, minimal reviewed lifecycle trust, runtime-specific TypeScript configs, explicit build prerequisite ordering, Vite for browser builds, and specialist Cloudflare tooling where justified. Do not add an external task runner until a measured orchestration gap exists.

The recommended initial package graph is INFERRED, not conventional law:

```text
apps/site
apps/content-compiler
packages/content
packages/study
```

Merge `packages/study` into `apps/site` if implementation proves it has no independent ownership/reuse value. Do not add `apps/worker` until a real backend responsibility exists.

## Files produced

- `README.md`
- `START-RECEIPT.md`
- `BUN-CURRENT-COORDINATE.md`
- `ROOT-CONFIG-OPTIONS.md`
- `EFFECT-COHORT-POLICY.md`
- `SCRIPT-MATRIX.csv`
- `TSCONFIG-TOPOLOGY.md`
- `TEST-RUNNER-RESPONSIBILITIES.csv`
- `CI-PLAN.md`
- `CACHE-POLICY.md`
- `PACKAGE-GRAPH-REVIEW.csv`
- `RECOMMENDED-INITIAL-GRAPH.md`
- `REPORT.md`
- `SOURCE-LEDGER.csv`
- `DECISION-MATRIX.csv`
- `OPEN-QUESTIONS.csv`
- `fixtures/README.md`
- `raw-results/PROBE-STATUS.md`
- `TEMP-DOWNLOAD-LINKS.md` retained only as artifact-coordinate provenance
- `FINAL-RECEIPT.md`

## Runtime/probe limitations

The connected GitHub execution path did not provide a trustworthy repository-local Bun runtime/install environment for the complete required four-workspace harness. Therefore this lane does not fabricate:

- a generated `bun.lock`;
- full `bun ci` output against the final fixture;
- filter-order runtime output;
- undeclared-dependency negative runtime proof;
- lifecycle-script trust runtime proof;
- installed dependency-tree proof of one Effect cohort.

These are explicitly BLOCKED in `OPEN-QUESTIONS.csv` and `raw-results/PROBE-STATUS.md`.

R2.5 also lacked current production bundle measurements, so numeric bundle gates remain provisional.

## Source drift recheck

At final publication recheck, the source branch had advanced beyond the immutable launch SHA by 79 commits while retaining the launch SHA as merge base. This lane remains anchored to the required immutable source SHA and did not rebase or force-push.

The additional source-branch commits are sibling research publication activity; they do not change the lane's immutable source contract.

## Final head

The exact final remote head is recorded by the PR after this receipt commit. No force push or merge was performed.
