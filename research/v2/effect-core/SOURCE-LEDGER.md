# Source Ledger

## Research metadata

| Field | Value |
| --- | --- |
| Observation date | 2026-08-21 |
| Repository | `mannyc2/nycustodianexam` |
| Repository base | `8b0d26245c1d78fb0be4e79f874a7d8872056ceb` |
| Official Effect source | `Effect-TS/effect` |
| Effect source snapshot | `436f10d1efccec308426532ff3f88df9a96434f3` |
| Effect version in package manifests | `4.0.0-rc.111` |
| Research mode | Documentation and source inspection only; no implementation |

Technical API claims were taken from official repository source, migration notes, official generated guidance, standards, and platform documentation. No community blog, forum answer, or prior memo was treated as API authority.

## Repository inputs

All available repository files were read at the immutable base SHA.

| Requested input | Status | Pinned source or evidence | Use |
| --- | --- | --- | --- |
| `AGENTS.md` | Read | https://github.com/mannyc2/nycustodianexam/blob/8b0d26245c1d78fb0be4e79f874a7d8872056ceb/AGENTS.md | Repository authority, Effect v4 rule, workspace constraints, research and publication requirements |
| `product/ARCHITECTURE_CONSTRAINTS.md` | Read | https://github.com/mannyc2/nycustodianexam/blob/8b0d26245c1d78fb0be4e79f874a7d8872056ceb/product/ARCHITECTURE_CONSTRAINTS.md | Browser-first, Bun workspace, standards-first, exact Effect pin, Cloudflare Static Assets direction |
| `product/FEATURE_SPEC.md` | Read | https://github.com/mannyc2/nycustodianexam/blob/8b0d26245c1d78fb0be4e79f874a7d8872056ceb/product/FEATURE_SPEC.md | Offline packs, commit-before-reveal, append-only attempts, deterministic sessions, IndexedDB, service-worker requirements |
| `research/initial-pass/NORMALIZATION.md` | Read | https://github.com/mannyc2/nycustodianexam/blob/8b0d26245c1d78fb0be4e79f874a7d8872056ceb/research/initial-pass/NORMALIZATION.md | Prior claims to retain, reject, or revalidate |
| `research/initial-pass/REUSABLE-FINDINGS.md` | Read | https://github.com/mannyc2/nycustodianexam/blob/8b0d26245c1d78fb0be4e79f874a7d8872056ceb/research/initial-pass/REUSABLE-FINDINGS.md | Product-specific reusable findings, not current Effect API authority |
| `research/initial-pass/REDO-REQUIRED.md` | Read | https://github.com/mannyc2/nycustodianexam/blob/8b0d26245c1d78fb0be4e79f874a7d8872056ceb/research/initial-pass/REDO-REQUIRED.md | Required re-research boundaries and stale v3 warnings |
| `research/initial-pass/RAW-EFFECT-REPORTS.md` | Read | https://github.com/mannyc2/nycustodianexam/blob/8b0d26245c1d78fb0be4e79f874a7d8872056ceb/research/initial-pass/RAW-EFFECT-REPORTS.md | Index evidence for prior E04/E08 references; not a substitute for the missing raw reports |

## Requested inputs unavailable at the base

These paths or named files were searched at the pinned base and were not present. They were not reconstructed, copied from chat memory, or represented as read.

| Requested input | Status | Evidence and consequence |
| --- | --- | --- |
| `prompts/research-v2/00-SHARED-RESEARCH-CONTRACT.md` | Unavailable at base | The `prompts` tree at the pinned SHA did not contain `research-v2/00-SHARED-RESEARCH-CONTRACT.md`. The explicit user task and `AGENTS.md` governed the pass. |
| `research/prompt-curation/EFFECT-V4-BUN-RESEARCH-DOCTRINE.md` | Unavailable at base | No `research/prompt-curation` path or repository search result existed at the pinned SHA. |
| `research/prompt-curation/EFFECT-SKILL-ADAPTATION.md` | Unavailable at base | No `research/prompt-curation` path or repository search result existed at the pinned SHA. |
| `04-architecture-memo-effect-browser-first-study-app.md` | Unavailable at base | The raw index referenced an E04 item, but recursive tree and repository search did not expose the named raw file. Only normalization/index material was available. |
| `08-architecture-memo-effect-browser-first-study-app.md` | Unavailable at base | The raw index referenced an E08 item, but recursive tree and repository search did not expose the named raw file. Only normalization/index material was available. |

## Official Effect v4 source

Every GitHub source below is pinned to the same upstream commit.

| ID | Official source | Finding used |
| --- | --- | --- |
| E01 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/effect/package.json | Core package is `effect@4.0.0-rc.111`; stable and `effect/unstable/*` export boundaries |
| E02 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/MIGRATION.md | Unified v4 ecosystem versioning, package consolidation, unstable module policy, migration index |
| E03 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/migration/services.md | `Context.Service`, explicit Layers, removed accessors/dependencies, `yield*` preference, v4 naming |
| E04 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/ai-docs/src/01_effect/03_services/01_service.ts | Current class-based service and `Layer.effect` example |
| E05 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/ai-docs/src/01_effect/03_services/20_layer-composition.ts | `Layer.provide` versus `Layer.provideMerge`; root composition pattern |
| E06 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/migration/layer-memoization.md | Shared v4 Layer memoization, composition preference, `Layer.fresh`, and local memo maps |
| E07 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/ai-docs/src/01_effect/01_basics/02_effect-fn.ts | Named `Effect.fn` for reusable Effect-returning functions; `Effect.fn.Return`; operator convention |
| E08 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/ai-docs/src/01_effect/01_basics/01_effect-gen.ts | `Effect.gen` for effect values and generator control-flow convention |
| E09 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/.patterns/effect.md | No JavaScript try/catch for yielded Effect failures, `return yield*`, and limited `Effect.fnUntraced` use |
| E10 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/ai-docs/src/01_effect/04_errors/01_error-handling.ts | `Schema.TaggedError`, `catchTag`, and typed expected-error handling |
| E11 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/ai-docs/src/01_effect/04_errors/20_reason-errors.ts | Tagged reason unions, `catchReason`, `catchReasons`, and `unwrapReason` |
| E12 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/effect/src/Scope.ts | Scope as an explicit service and lifetime boundary; finalization strategies and child scopes |
| E13 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/migration/scope.md | `Scope.extend` renamed to `Scope.provide` |
| E14 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/migration/forking.md | Current `forkChild`, `forkScoped`, `forkIn`, and `forkDetach` names and ownership semantics |
| E15 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/migration/runtime.md | Removal of `Runtime<R>`; Context and `Effect.run*With`; reduced Runtime module |
| E16 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/effect/src/ManagedRuntime.ts | Lazy Layer build, cached Context, owned Scope, repeated JS boundary runners, mandatory disposal |
| E17 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/migration/fiber-keep-alive.md | Core v4 keep-alive behavior and continued recommendation for platform `runMain` roots |
| E18 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/effect/src/Clock.ts | Wall-clock and monotonic time distinctions, sleep, and replaceable test clock |
| E19 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/effect/src/Random.ts | Random service, deterministic `withSeed`, and non-security warning |
| E20 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/effect/src/DateTime.ts | UTC/zoned models, IANA zones, current-time and date operations |
| E21 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/ai-docs/src/07_datetime/20_time-zones.ts | `DateTime.now`, current-zone Layer, and explicit zone provision |
| E22 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/platform/browser/package.json | `@effect/platform-browser@4.0.0-rc.111` and its package boundary |
| E23 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/platform/browser/src/BrowserRuntime.ts | Browser root and non-persisted `pagehide` interruption; teardown caveat |
| E24 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/platform/browser/src/BrowserPersistence.ts | Current IndexedDB persistence implementation, scoped database handle, Clock use, and unstable persistence dependency |
| E25 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/platform/bun/package.json | `@effect/platform-bun@4.0.0-rc.111` |
| E26 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/platform/bun/src/BunRuntime.ts | Bun process root, signal handling, reporting, and exit behavior |
| E27 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/platform/bun/src/BunFileSystem.ts | Bun FileSystem Layer |
| E28 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/platform/bun/src/BunPath.ts | Bun Path Layers |
| E29 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/vitest/package.json | `@effect/vitest@4.0.0-rc.111` and matching peer requirements |
| E30 | https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/vitest/src/index.ts | Scoped Effect tests and suite-shared test Layers |
| E31 | https://github.com/Effect-TS/effect/tree/436f10d1efccec308426532ff3f88df9a96434f3/packages/platform | Official platform packages at the snapshot: browser, Bun, Deno, Node, and Node-shared; no Cloudflare package |

## Official Bun, Cloudflare, and Web standards

These sources were observed on 2026-08-21. They are time-sensitive and should be rechecked before implementation or deployment changes.

| ID | Official source | Finding used |
| --- | --- | --- |
| P01 | https://bun.sh/docs/pm/workspaces | Bun workspace declarations and `workspace:` dependency protocol |
| P02 | https://bun.com/docs/pm/catalogs | Root dependency catalogs and `catalog:` references for one aligned Effect version set |
| P03 | https://developers.cloudflare.com/workers/static-assets/ | Workers Static Assets deployment and static-first configuration |
| P04 | https://developers.cloudflare.com/workers/best-practices/workers-best-practices/ | Recommendation to use Static Assets for static sites and avoid unnecessary Worker code |
| P05 | https://developers.cloudflare.com/workers/runtime-apis/context/ | `ctx.waitUntil` ownership for work that must continue after a response |
| P06 | https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/ | Native module Worker `fetch` handler and request/response boundary |
| P07 | https://developers.cloudflare.com/workers/runtime-apis/web-standards/ | Workers support for Web-standard APIs and standards-first adapter design |
| P08 | https://www.w3.org/TR/service-workers/ | Event-driven service-worker lifetime, `respondWith`, `waitUntil`, and host termination model |

## Findings inherited only as product constraints

The initial-pass normalization and reusable-findings documents were used to identify product requirements and stale claims requiring verification. They were not used as proof of current Effect APIs. In particular, this pass corrected or replaced prior terminology where current upstream v4 source differs:

- detached fibers are `Effect.forkDetach`, not `forkDaemon`;
- `Scope.Scope` remains an explicit service requirement;
- the v3 `Runtime<R>` model is removed;
- v4 services use `Context.Service` and explicit Layers;
- common platform functionality is consolidated into `effect`, while runtime packages remain `@effect/platform-*`;
- the inspected v4 source is on a release-candidate line, not a stable GA release.

## Architectural inferences

The following recommendations are project-specific deductions from the official APIs and product requirements, not direct quotations from one source:

- two apps and two portable packages are sufficient initially;
- browser storage and network implementations should stay in `apps/site`;
- durable study replay should own and version its PRNG algorithm rather than depend on library implementation stability;
- generic browser persistence is not sufficient evidence for the product's required multi-store atomic transactions;
- window, service worker, compiler, Cloudflare, and tests require distinct runtime owners;
- no Cloudflare Worker app should exist while deployment remains static-only.

## Limitations and revalidation requirements

1. The upstream package manifests at the snapshot declare `4.0.0-rc.111`, while the opening banner in `MIGRATION.md` still says beta. This ledger records both and uses the package manifests for the exact version status.
2. Effect v4 is a release candidate at this snapshot. API names, unstable module locations, and package details can change before GA.
3. Five requested repository inputs were absent. This pass did not invent their contents.
4. No package installation, typecheck, bundle measurement, browser prototype, service-worker prototype, IndexedDB transaction test, or Cloudflare deployment was performed.
5. Storage adapter selection remains subject to the dedicated Effect plus IndexedDB research pass.
6. Before implementation, re-resolve upstream `main` or the selected release tag, pin one exact aligned version set, and review every `effect/unstable/*` import again.
