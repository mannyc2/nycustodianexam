# START RECEIPT — Effect v4 platform/runtime lane

- Repository: `mannyc2/nycustodianexam`
- Source branch: `agent/chat-corpus-reconciliation`
- Immutable post-curation merge base: `645e885748c830f7a9cbbbe90ac0f31149bfc81c`
- Output branch: `research/v2-effect-platform`
- Allowed path: `research/v2/effect-platform/**`
- UTC start time: `2026-08-21T19:42:33Z`
- GitHub access: connected `@GitHub` read/write access confirmed; branch creation succeeded without force.

## Intended scope

Research the current Effect v4 platform/runtime architecture for the NY Custodian Exam project across:

- browser page;
- Bun build/CLI runtime;
- browser service worker;
- Cloudflare workerd;
- tests.

Build a current capability matrix covering `effect`, `effect/unstable/*`, `@effect/platform-browser`, `@effect/platform-bun`, HTTP/HttpApi, persistence, workers, sockets, crypto, and runtime integration. For each capability decide among native runtime API, native API behind a project Effect service, and official Effect abstraction. Preserve runtime-specific semantics rather than forcing false portability. Explicitly identify unstable APIs and migration risk.

## Required deliverables

At minimum this lane will publish:

- `REPORT.md`;
- `CAPABILITY-MATRIX.csv`;
- `PACKAGE-STATUS.csv`;
- runtime/Layer topology documentation;
- `SOURCE-LEDGER.csv`;
- `DECISION-MATRIX.csv`;
- `OPEN-QUESTIONS.csv`;
- `FINAL-RECEIPT.md`;
- `MANIFEST.sha256`;
- lane-specific browser/Bun/Cloudflare/service-worker audits and probe evidence where supported.

## Launch-gate resolution

The prompt-curation PR was merged as commit `645e885748c830f7a9cbbbe90ac0f31149bfc81c`. The curation prompt suite contains a `{{POST_CURATION_SOURCE_SHA}}` token and instructs maintainers to replace it with the post-merge SHA, while also requiring the source branch head itself to equal the embedded SHA. Committing that replacement on the same branch is self-referential: the stamping commit necessarily has a different SHA from the value embedded in its own tree.

For this lane, the maintainer explicitly authorized proceeding after the curation merge. The immutable research base is therefore the exact post-curation merge commit above. This receipt records the inconsistency rather than fabricating a self-referential source SHA. No application/product authority is modified by this lane.

## Initial upstream coordinates known before extended research

The curation pass previously observed Effect repository commit `436f10d1efccec308426532ff3f88df9a96434f3` with package version `4.0.0-rc.111`. That coordinate is historical input only and **must not** be treated as the current lane result. The lane will establish the actual latest Effect v4 cohort and current Bun coordinate from primary sources before making version-sensitive recommendations.
