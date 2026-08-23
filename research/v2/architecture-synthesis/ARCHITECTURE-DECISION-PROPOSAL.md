# Architecture decision proposal

## Status

Proposed for maintainer review. No decision here changes maintained authority or
licenses application implementation by itself.

## Decision set

| # | Decision | Supporting evidence | Alternatives | Instability / measurement | Adoption |
|---|---|---|---|---|---|
| 1 | Pin synchronized Effect `4.0.0-rc.111` from official tag `648f566…` for the first lock | R2.6 `SCHEMA-API-MAP`, fixture; R2.1/R2.7 cohort policy | float rc; mix counters; wait indefinitely for GA | RC; recheck at scaffold and upgrade as one cohort | accept provisionally |
| 2 | Pin Bun `1.4.0`; use private apps/packages root, catalog, isolated linker, `workspace:*`, committed `bun.lock`, frozen CI | R2.7 report; official current release | Bun 1.3.14; hoisted linker; another package manager | execute full install/filter/phantom-dependency gate on 1.4 | implementation spike |
| 3 | Start with `apps/site`, `apps/content-compiler`, `packages/content`; co-locate study modules until boundary is earned | R2.1 falsifiers; R2.6 placement; architecture state-reduction lens | four workspaces with `packages/study`; site-only monolith | consumer graph after vertical slice | accept provisionally |
| 4 | Keep deterministic policies/gates pure; define cohesive services only for host I/O/lifecycle/substitution; compose one Layer root per host | R2.1; R2.3; R2.6 | service per function; giant Application/Platform service | service count review after slice | accept now |
| 5 | Use one browser `ManagedRuntime`; finite compiler via `BunRuntime.runMain`; native service-worker lifecycle; no Worker root yet | R2.1–R2.3 | runtime per event; universal root; long-lived SW fiber | run current package lifecycle probes | accept provisionally |
| 6 | Model expected operational/domain failures with Schema tagged errors; accumulate author diagnostics as sorted data; translate provider errors once | R2.1 error architecture; R2.4 taxonomy; R2.6 diagnostics | raw exceptions; one generic error; author errors in Effect channel | production redaction/failure-injection review | accept now |
| 7 | Adopt R2.6 Schema→registry gates→validated corpus→canonical outputs→manifest-last compiler | R2.6 PR #22 current fixture | manual validation; Schema-only global refinements; JSON Schema authority | JSONC parser and canonical JSON profile spikes | accept now |
| 8 | Put all durable learner/content state in one origin DB behind project contracts; try first-party Effect IDB, retain `idb` fallback | R2.4; R2.3 native IDB evidence | raw native IDB; `idb`; Dexie | provider execution/browser/bundle contract | implementation spike |
| 9 | One strict attempt transaction writes event, projections, and session checkpoint; reveal after commit or same-ID reconciliation | maintained product; R2.2/R2.4/R2.8 | optimistic reveal; eventual save | real-browser abort/quota/race/uncertain-result tests | accept now |
| 10 | Stage packs outside transactions; activate with short generation flip; BroadcastChannel advisory; Web Locks only for long duplicate jobs | R2.4 | long network transaction; messages/locks as truth | cross-tab/crash/quota test suite | accept now |
| 11 | Native service worker owns app shell/immutable response cache; page/IDB owns logical pack truth and learner state | R2.3/R2.4 | SW memory as authority; Effect SW by default | offline/update/eviction measurements | accept now |
| 12 | Static semantic HTML plus lazy direct-DOM player; renderer-neutral snapshots/commands; no Atom/reactivity in first slice | R2.2; R2.5 topology | lit-html/Preact/Solid/React first; Atom store | direct-DOM complexity/focus triggers; matched lit spike | accept provisionally |
| 13 | Keep five UI state owners distinct and high-frequency hazard scratch renderer-local | R2.2 state ownership | global store; Ref/Atom per field | hazard player implementation review | accept now |
| 14 | Use Vite for browser build and Cloudflare Static Assets; acquisition routes must have zero Effect closure; no manual vendor chunk yet | R2.5/R2.7; R2.3 | Bun bundler by decree; Worker app; manual vendor chunk | R2.5 measurement rerun in first slice | accept provisionally |
| 15 | Use Bun test for pure/Bun host tests, `@effect/vitest` for Effect, Playwright real browsers for Web semantics, manual AT/release matrix | R2.7/R2.8 | one runner; fake storage/jsdom certification | execute Chromium/Firefox/WebKit and manual matrix | accept now |
| 16 | Local diagnostics by default; any telemetry first-party, consented, allowlisted, redacted, bounded | R2.8; maintained privacy | mandatory analytics; third-party tracking | product decision and event review | accept now |
| 17 | Do not add `apps/worker`; if corrections justify it, use native module fetch plus narrow Effect use case | R2.3 | unstable HttpRouter/HttpApi now | workerd bundle/cold-start/abuse tests when authorized | defer |
| 18 | Keep visual generation outside runtime; accept final reviewed immutable bytes. Pilot Codex-native style-matched images under separate authority reconciliation | maintainer direction; R2.9 semantic contracts; R2.10 evidence gaps; R2.6 digest reviews | deterministic SVG/CAD only; generative controlling runtime | native output sizes; obscure-tool fidelity; legal/editorial/a11y/security review | implementation/content pilot after authority review |

## Cross-cutting laws

1. Static pages do not pay for the study engine.
2. Browser, service worker, Bun, workerd, and test roots never share a universal
   platform Layer.
3. No UI state can manufacture persistence success.
4. No provider abstraction promises stronger rollback/cancellation than its host.
5. No generated artifact publishes without current source/review/closure gates.
6. No package exists merely because a diagram has a box.
7. No missing bundle, browser, visual, or geometry evidence is converted to a
   positive production claim.
8. Sequencing a vertical slice does not reduce the Tier A/B launch universe.

## Approval consequence

If accepted, a separate authority reconciliation should update the maintained
architecture/product files, followed by an implementation scaffold PR that runs
the explicit version/install/provider/bundle gates. This synthesis itself remains
research-only.
