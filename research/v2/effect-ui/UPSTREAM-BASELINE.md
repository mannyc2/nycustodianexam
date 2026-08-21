# Upstream and corpus baseline

Observed at: `2026-08-21T19:32:17Z`

## Immutable product corpus

The source branch `agent/chat-corpus-reconciliation` resolved to:

`8b0d26245c1d78fb0be4e79f874a7d8872056ceb`

The research branch was created from exactly that commit. The base contains product and architecture documents, but no root `package.json`, no application dependency graph, and no implemented question-player or hazard-player module. The complexity tests in this lane therefore use the maintained product behavior and accessibility contract, not a toy counter and not invented implementation details.

## Effect v4 coordinate

Current Effect upstream `main` was pinned at:

`436f10d1efccec308426532ff3f88df9a96434f3`

At that commit:

- `effect`: `4.0.0-rc.111`
- `@effect/atom-react`: `4.0.0-rc.111`
- `@effect/atom-solid`: `4.0.0-rc.111`
- `@effect/atom-vue`: `4.0.0-rc.111`

The inspected APIs are exported through `effect/unstable/reactivity`. Conclusions about Atom APIs are therefore version-pinned and must not be treated as a stable public contract across future v4 release candidates or the final v4 release.

Binding peer coordinates at the pinned commit:

- React binding: React `>=19.2.7 <20` and scheduler `>=0.27 <0.28`; upstream development coordinate React `19.2.8`.
- Solid binding: Solid `>=1.9.14 <2`; current Solid registry coordinate `1.9.15`.
- Vue binding: Vue `>=3.5.39 <4`; upstream development coordinate Vue `3.5.41`.

## Bun coordinate

The curation branch recorded Bun `1.3.14`. A fresh verification found the newer tag:

- tag: `bun-v1.4.0`
- tag target commit: `34cbb9a40b4bd1bd767d134a7065e66c2432a676`
- commit timestamp: `2026-08-20T00:50:33Z`

This lane therefore records Bun `1.4.0` as the current runtime coordinate, superseding the curation baseline.

## Fixture and runtime-probe gate

The execution environment initially had no Bun executable. Direct network access from the working container also failed DNS resolution. The lane did not invent a `bun.lock`, claim an install that did not happen, or report bundle/runtime measurements that were not run.

Source-level API conclusions are based on the exact Effect monorepo commit and coordinated package manifests. Runtime, typecheck, tree-shaking, and bundle-size claims remain blocked until a real Bun `1.4.0` fixture can install the exact Effect `4.0.0-rc.111` cohort and candidate renderer packages.

The official Effect skill asks researchers to inspect installed package guidance and `node_modules`. Because the fixture could not be installed, the equivalent repository source guidance (`LLMS.md`) and pinned package source were inspected instead. This substitution is recorded as a limitation, not represented as an installed-package check.

## Prior raw reports

The research index names:

- `01-effect-state-ui-rendering-v3-baseline.md`
- `03-effect-state-ui-rendering-direct-dom.md`

Neither file exists in the immutable Git tree. Exact-title and topical retrieval against the available conversation and file library did not recover them. Their normalized findings may be reused only through `NORMALIZATION.md` and `REUSABLE-FINDINGS.md`; no exact statement is attributed to the missing raw reports.

## Source-drift policy

All Effect API statements in this lane are tied to commit `436f10d1efccec308426532ff3f88df9a96434f3`. A final source-head check will record whether Effect `main`, the product source branch, or the Bun tag coordinate moved before publication.
