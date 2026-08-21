# Source Ledger

Status: BLOCKED - preliminary source inspection only

## Research metadata

| Field | Value |
| --- | --- |
| Observation date | 2026-08-21 |
| Repository | `mannyc2/nycustodianexam` |
| Source branch | `agent/chat-corpus-reconciliation` |
| Source head at branch creation | `8b0d26245c1d78fb0be4e79f874a7d8872056ceb` |
| Source head at final drift check | `645e885748c830f7a9cbbbe90ac0f31149bfc81c` |
| Required SHA supplied by request | `<BASE_SHA>` |
| Official Effect repository | `Effect-TS/effect` |
| Effect source snapshot | `436f10d1efccec308426532ff3f88df9a96434f3` |
| Effect package version at snapshot | `4.0.0-rc.111` |
| Bun runtime coordinate used for probes | None |
| Research mode | Documentation and source inspection only; no implementation or runtime probes |

## Evidence labels

- CONFIRMED: official declarations, documentation, or source establish the claim.
- OBSERVED: a committed reproducible probe establishes the exact coordinate.
- INFERRED: a project-specific recommendation derived from evidence.
- UNKNOWN: not established.
- BLOCKED: required authority, immutable coordinate, or probe was unavailable.

No claim in this branch is labeled OBSERVED. No fixture, installation, typecheck, runtime probe, browser probe, or deployment probe was run.

## Immutable-source and governance record

### Initial checkpoint

The request supplied `<BASE_SHA>` rather than a concrete SHA. The source branch resolved to `8b0d26245c1d78fb0be4e79f874a7d8872056ceb` before branch creation. At that head, the named shared contract and prompt-curation files did not exist. The output branch and draft PR were created from that observed head before extended research.

### Final drift check

The source branch later resolved to `645e885748c830f7a9cbbbe90ac0f31149bfc81c`. That merge added the shared contract, doctrine, skill adaptation, and lane prompt. The shared contract and lane prompt still contain `{{POST_CURATION_SOURCE_SHA}}` and expressly state that the lane must not run until the placeholder is replaced by an exact source SHA.

The post-drift governance files were read only to classify the run and record the blocker. They were not silently treated as part of the original immutable research base. This lane is therefore not contract-complete.

## Repository inputs read at the branch-creation source head

| Input | Status | Pinned coordinate | Use |
| --- | --- | --- | --- |
| `AGENTS.md` | CONFIRMED, read | `mannyc2/nycustodianexam@8b0d26245c1d78fb0be4e79f874a7d8872056ceb:AGENTS.md` | Repository authority, Effect v4 constraint, workspace direction, authorized path, publication rules |
| `product/ARCHITECTURE_CONSTRAINTS.md` | CONFIRMED, read | `mannyc2/nycustodianexam@8b0d26245c1d78fb0be4e79f874a7d8872056ceb:product/ARCHITECTURE_CONSTRAINTS.md` | Browser-first architecture, Bun workspace, standards-first APIs, static Cloudflare direction |
| `product/FEATURE_SPEC.md` | CONFIRMED, read | `mannyc2/nycustodianexam@8b0d26245c1d78fb0be4e79f874a7d8872056ceb:product/FEATURE_SPEC.md` | Offline packs, commit-before-reveal, append-only attempts, deterministic sessions, IndexedDB and service-worker requirements |
| `research/initial-pass/NORMALIZATION.md` | CONFIRMED, read | `mannyc2/nycustodianexam@8b0d26245c1d78fb0be4e79f874a7d8872056ceb:research/initial-pass/NORMALIZATION.md` | Prior claims requiring retention, rejection, or v4 verification |
| `research/initial-pass/REUSABLE-FINDINGS.md` | CONFIRMED, read | `mannyc2/nycustodianexam@8b0d26245c1d78fb0be4e79f874a7d8872056ceb:research/initial-pass/REUSABLE-FINDINGS.md` | Product-specific reusable findings, not current Effect API authority |
| `research/initial-pass/REDO-REQUIRED.md` | CONFIRMED, read | `mannyc2/nycustodianexam@8b0d26245c1d78fb0be4e79f874a7d8872056ceb:research/initial-pass/REDO-REQUIRED.md` | Stale v3 claims and required second-pass boundaries |
| `research/initial-pass/RAW-EFFECT-REPORTS.md` | CONFIRMED, read as index only | `mannyc2/nycustodianexam@8b0d26245c1d78fb0be4e79f874a7d8872056ceb:research/initial-pass/RAW-EFFECT-REPORTS.md` | Evidence that prior E04/E08 reports were referenced; not a substitute for the raw reports |

## Governance files that appeared only after source drift

| Input | Status | Pinned coordinate | Consequence |
| --- | --- | --- | --- |
| `prompts/research-v2/00-SHARED-RESEARCH-CONTRACT.md` | CONFIRMED, read after drift | `mannyc2/nycustodianexam@645e885748c830f7a9cbbbe90ac0f31149bfc81c:prompts/research-v2/00-SHARED-RESEARCH-CONTRACT.md` | Blocks execution while the source-SHA placeholder remains; requires an early receipt, fixture, probes, CSV ledgers, receipts and checksums |
| `research/prompt-curation/EFFECT-V4-BUN-RESEARCH-DOCTRINE.md` | CONFIRMED, read after drift | `mannyc2/nycustodianexam@645e885748c830f7a9cbbbe90ac0f31149bfc81c:research/prompt-curation/EFFECT-V4-BUN-RESEARCH-DOCTRINE.md` | Requires an exact latest-v4 cohort, Bun fixture, installed package guidance, and runtime-specific roots |
| `research/prompt-curation/EFFECT-SKILL-ADAPTATION.md` | CONFIRMED, read after drift | `mannyc2/nycustodianexam@645e885748c830f7a9cbbbe90ac0f31149bfc81c:research/prompt-curation/EFFECT-SKILL-ADAPTATION.md` | Requires a private Bun fixture and complete reading of installed `node_modules/effect/AGENTS.md` before code-level recommendations |
| `prompts/research-v2/01-effect-v4-core-monorepo.md` | CONFIRMED, read after drift | `mannyc2/nycustodianexam@645e885748c830f7a9cbbbe90ac0f31149bfc81c:prompts/research-v2/01-effect-v4-core-monorepo.md` | Also blocks execution while its source-SHA placeholder remains and requires representative compile/test probes |

## Contract-required inputs not completed after drift

These were not retroactively treated as completed because the lane was already invalidated by the missing immutable SHA and source drift.

| Input or action | Status |
| --- | --- |
| `README.md` complete reading | BLOCKED / not completed for this lane |
| `CONTRIBUTING.md` complete reading | BLOCKED / not completed for this lane |
| `research/initial-pass/README.md` complete reading | BLOCKED / not completed for this lane |
| `research/initial-pass/DUPLICATION-AND-SUPERSESSION.md` complete reading | BLOCKED / not completed for this lane |
| `docs/OPEN.md` complete reading | BLOCKED / not completed for this lane |
| Private Bun fixture with exact dependencies and committed `bun.lock` | BLOCKED / not created |
| Complete installed `node_modules/effect/AGENTS.md` reading | BLOCKED / no installation existed |
| Required compile and runtime probes | BLOCKED / not run |
| Raw probe results | BLOCKED / none |

## Prior raw reports

| Requested input | Status | Evidence |
| --- | --- | --- |
| `04-architecture-memo-effect-browser-first-study-app.md` | UNKNOWN / unavailable at both observed source heads | Repository path listing and code search did not expose the named file; only normalization and index material was available |
| `08-architecture-memo-effect-browser-first-study-app.md` | UNKNOWN / unavailable at both observed source heads | Repository path listing and code search did not expose the named file; only normalization and index material was available |

Neither raw report was reconstructed from conversation memory or copied mechanically.

## Official Effect v4 sources

Every Effect source below is pinned to `Effect-TS/effect@436f10d1efccec308426532ff3f88df9a96434f3`.

| ID | Path | Evidence used |
| --- | --- | --- |
| E01 | `packages/effect/package.json` | CONFIRMED `effect@4.0.0-rc.111`; stable and `effect/unstable/*` exports |
| E02 | `MIGRATION.md` | CONFIRMED unified v4 versioning, package consolidation, unstable-module policy and migration index |
| E03 | `migration/services.md` | CONFIRMED `Context.Service`, explicit Layers, removed accessors/dependencies and `yield*` preference |
| E04 | `ai-docs/src/01_effect/03_services/01_service.ts` | CONFIRMED class-based service and `Layer.effect` examples |
| E05 | `ai-docs/src/01_effect/03_services/20_layer-composition.ts` | CONFIRMED `Layer.provide`, `Layer.provideMerge` and root composition |
| E06 | `migration/layer-memoization.md` | CONFIRMED shared v4 memoization, composition preference, `Layer.fresh` and local memo maps |
| E07 | `ai-docs/src/01_effect/01_basics/02_effect-fn.ts` | CONFIRMED named `Effect.fn` guidance for reusable effect-returning functions |
| E08 | `ai-docs/src/01_effect/01_basics/01_effect-gen.ts` | CONFIRMED `Effect.gen` use for effect values and local orchestration |
| E09 | `.patterns/effect.md` | CONFIRMED no JavaScript `try`/`catch` for yielded Effect failures, `return yield*`, limited `Effect.fnUntraced` |
| E10 | `ai-docs/src/01_effect/04_errors/01_error-handling.ts` | CONFIRMED `Schema.TaggedError`, `catchTag` and typed expected-error handling |
| E11 | `ai-docs/src/01_effect/04_errors/20_reason-errors.ts` | CONFIRMED tagged reason unions, `catchReason`, `catchReasons` and `unwrapReason` |
| E12 | `packages/effect/src/Scope.ts` | CONFIRMED Scope as an explicit service and resource lifetime boundary |
| E13 | `migration/scope.md` | CONFIRMED `Scope.extend` renamed to `Scope.provide` |
| E14 | `migration/forking.md` | CONFIRMED current `forkChild`, `forkScoped`, `forkIn` and `forkDetach` names |
| E15 | `migration/runtime.md` | CONFIRMED removal of v3 `Runtime<R>` and use of Context / `Effect.run*With` |
| E16 | `packages/effect/src/ManagedRuntime.ts` | CONFIRMED lazy Layer construction, cached Context, owned Scope and disposal requirement |
| E17 | `migration/fiber-keep-alive.md` | CONFIRMED v4 core keep-alive behavior and continuing platform `runMain` recommendation |
| E18 | `packages/effect/src/Clock.ts` | CONFIRMED wall-clock and monotonic-time distinction, sleep and replaceability |
| E19 | `packages/effect/src/Random.ts` | CONFIRMED seeded Random service and non-security warning |
| E20 | `packages/effect/src/DateTime.ts` | CONFIRMED UTC/zoned models, IANA zones and current-time operations |
| E21 | `ai-docs/src/07_datetime/20_time-zones.ts` | CONFIRMED explicit current-zone Layer patterns |
| E22 | `packages/platform/browser/package.json` | CONFIRMED `@effect/platform-browser@4.0.0-rc.111` |
| E23 | `packages/platform/browser/src/BrowserRuntime.ts` | CONFIRMED page root and non-persisted `pagehide` interruption behavior |
| E24 | `packages/platform/browser/src/BrowserPersistence.ts` | CONFIRMED generic IndexedDB persistence implementation and unstable persistence dependency |
| E25 | `packages/platform/bun/package.json` | CONFIRMED `@effect/platform-bun@4.0.0-rc.111` |
| E26 | `packages/platform/bun/src/BunRuntime.ts` | CONFIRMED Bun process root, signal handling, reporting and exit behavior |
| E27 | `packages/platform/bun/src/BunFileSystem.ts` | CONFIRMED Bun FileSystem Layer |
| E28 | `packages/platform/bun/src/BunPath.ts` | CONFIRMED Bun Path Layers |
| E29 | `packages/vitest/package.json` | CONFIRMED `@effect/vitest@4.0.0-rc.111` and aligned peer requirements |
| E30 | `packages/vitest/src/index.ts` | CONFIRMED scoped Effect tests and suite-shared test Layers |
| E31 | `packages/platform/` | CONFIRMED browser, Bun, Deno, Node and Node-shared platform directories; no Cloudflare package at this snapshot |

Canonical upstream URL prefix:

```text
https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/
```

## Registry and platform observations

These are source observations, not committed runtime probes.

| ID | Authority | Coordinate | Status | Use and limitation |
| --- | --- | --- | --- | --- |
| R01 | npm package version history | `effect@4.0.0-rc.111` under the `rc` tag | CONFIRMED registry availability | The npm default `latest` tag remains on v3; this project explicitly targets latest v4. No installation was performed. |
| R02 | npm package version history | `@effect/vitest@4.0.0-rc.111` | CONFIRMED registry availability | No installation or test run was performed. |
| R03 | npm package/profile and platform binary listings | `bun@1.4.0` / Bun 1.4.0 binaries | CONFIRMED registry publication on 2026-08-21 | The Bun homepage cache still displayed 1.3.14. No local `bun --version` observation or fixture was produced, so 1.4.0 is not an OBSERVED probe coordinate for this lane. |
| P01 | Bun documentation | Workspaces and `workspace:*` | CONFIRMED documentation | Used for the proposed workspace dependency law; no workspace was created. |
| P02 | Bun documentation | Root catalogs and `catalog:` | CONFIRMED documentation | Used for aligned Effect-version recommendation; no catalog was created. |
| P03 | Cloudflare documentation | Workers Static Assets | CONFIRMED documentation | Supports static-first deployment and no empty Worker app. |
| P04 | Cloudflare documentation | `ctx.waitUntil`, module `fetch`, Web-standard APIs | CONFIRMED documentation | Supports event/request-owned Effect boundaries; no Worker probe was run. |
| P05 | W3C Service Workers specification | `respondWith`, `waitUntil`, event-driven lifetime | CONFIRMED standard | Supports separate service-worker root and termination-safe correctness; no browser probe was run. |

## Project-specific inferences

The following are INFERRED recommendations rather than direct upstream prescriptions:

- Start with `apps/site`, `apps/content-compiler`, `packages/content` and `packages/study`.
- Keep browser storage and network implementations in `apps/site`.
- Keep deterministic content and study policy platform-neutral.
- Use cohesive `ContentStore`, `StudyStore` and `PackSource` capabilities rather than a generic key/value repository or service per object store.
- Keep `LocalDatabase` app-internal.
- Use a project-owned, versioned pure PRNG for durable replay compatibility.
- Treat generic Effect browser persistence as insufficient evidence for pack activation and answer-checkpoint transaction requirements.
- Give browser windows, service workers, Bun compiler processes, future Cloudflare requests and tests distinct runtime owners.
- Do not create a Cloudflare Worker app while the product remains static-only.

## Limitations and revalidation requirements

1. The lane lacks a valid immutable required source SHA and is BLOCKED by the shared contract.
2. The source branch drifted from `8b0d26245c1d78fb0be4e79f874a7d8872056ceb` to `645e885748c830f7a9cbbbe90ac0f31149bfc81c`.
3. The newly added shared contract and lane prompt still contain an unreplaced source-SHA placeholder and expressly prohibit execution.
4. The upstream package manifests identify `4.0.0-rc.111`; Effect v4 remains a release candidate at the pinned snapshot.
5. No private Bun fixture, `bun.lock`, installed-package guidance reading, compile probe, typecheck, test, browser prototype, service-worker prototype, IndexedDB transaction test, bundle measurement or Cloudflare deployment was produced.
6. The exact Bun runtime used for a probe is UNKNOWN because no probe was run; only Bun 1.4.0 registry publication was confirmed.
7. The two requested prior raw architecture reports remain unavailable.
8. Storage adapter selection remains deferred to the dedicated Effect plus IndexedDB research lane.
9. Before implementation, a clean compliant lane must start from a stamped immutable SHA, use a newly authorized branch/path, install the exact coordinated cohort, read installed package guidance completely and commit the required probes and raw results.
