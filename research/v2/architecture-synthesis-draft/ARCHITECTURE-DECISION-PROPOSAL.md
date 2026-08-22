# Architecture decision proposal (R2.90 DRAFT)

**Status: DRAFT, published on the planning branch — not the formal R2.90 lane.**
All ten launched lanes (R2.1–R2.5, R2.7–R2.10) are merged on `main`.
Every decision below is backed by merged lane research plus
the executed probe evidence in `research/v2/probe-execution/`. Maintained
authority (`product/ARCHITECTURE_CONSTRAINTS.md`, `docs/`) is not edited by
this draft; adoption happens in a maintainer-reviewed reconciliation PR.

Evidence labels: **OBSERVED** = executed at the exact pinned coordinate;
**MEASURED** = numeric build/bundle evidence; **SOURCE** = source-confirmed
only; **INFERRED** = architectural judgment.

---

## D1. Effect cohort for first implementation lock

`effect@4.0.0-rc.111` + `@effect/platform-browser@4.0.0-rc.111` +
`@effect/platform-bun@4.0.0-rc.111`. OBSERVED: coherent single-cohort
install, build, test, and runtime across Bun, browser, and workerd surfaces.
**Accept provisionally** — rerun the compile/probe contract at the exact GA
coordinate before the dependency freeze (an observation at rc.111 does not
prove a range). Lanes: R2.1/R2.3/R2.5 + probe-execution.

## D2. Bun version and root workspace policy

Bun **1.4.0** exactly (`packageManager` pin), one root **text `bun.lock`**,
`bun ci` frozen installs in CI, **isolated linker**, root **catalog** for the
Effect cohort and toolchain, `workspace:*` internal edges, lifecycle scripts
untrusted by default with explicit `trustedDependencies` grants. All five
R2.7 gates OBSERVED. Script mechanic: root scripts use
`bun --filter '<pattern>' <script>` (inserting `run` breaks matching at
1.4.0). No Turbo/Nx initially. **Accept now.** Lanes: R2.7 + probe-execution.

## D3. Initial workspace graph and dependency laws

```
apps/site  apps/content-compiler
packages/content  packages/study

packages/content <- packages/study <- apps/site
packages/content <- apps/content-compiler
```

No package imports an app; `content` never imports `study`; no `apps/worker`
until a real endpoint is approved; no generic core/shared/platform packages.
Falsifier retained: merge `study` into `site` if it proves single-consumer.
The exact graph installed, resolved, and ran as a fixture (R2.7 rerun).
**Accept provisionally** (graph shape is architecture, not measurement).
Lanes: R2.1 D01, R2.7, probe-execution.

## D4. Services and Layer topology

`Context.Service` with stable string identifiers; small focused Layers owned
by the host implementation, composed only at runtime roots;
`Context.Reference` only for overridable nondurable defaults. OBSERVED:
service/Layer fixtures compile and run under Bun and browser; Layer built
exactly once per web-handler lifetime (memoization proof). **Accept now.**
Lanes: R2.1 D02/D03/D07, R2.3 + probe-execution.

## D5. Runtime roots

- Browser: **one app-owned `ManagedRuntime`** per app (or bounded island),
  constructed once, disposed once; no Layer construction per event. OBSERVED
  via the bundle-lab player service.
- Content compiler: finite `BunRuntime.runMain` program. OBSERVED (R2.1
  probe; R2.3 `probe:bun`).
- No server runtime root until D17 approves an endpoint.
**Accept now.** Lanes: R2.1 D05/D06, R2.2 D03 + probe-execution.

## D6. Error architecture

Typed failures via `Schema.TaggedError`; expected failures in the error
channel, defects for bugs; commit failures never reveal correctness.
OBSERVED: tagged errors decode/propagate correctly (R2.1 fixture, R2.2
schema boundary, commit-rejected paths in the browser suite). **Accept now.**

## D7. Schema / content compiler (R2.6 folded in)

R2.6 never ran. Provisional design: `apps/content-compiler` is a finite
BunRuntime program that decodes source-backed question/content records with
v4 `Schema`, enforces relational publication gates (every scored item has
correct-rationale + distractor rationales + source lines; taxonomy/scope
references resolve; unknowns stay explicit), and emits versioned generated
content consumed by `apps/site`. Schema decode itself is OBSERVED
(valid/invalid + typed SchemaError). **Implementation spike** for the gate
design — do not launch a tenth research lane.

## D8. IndexedDB provider and transaction boundary

`@effect/platform-browser` `IndexedDbDatabase`/`IndexedDbTable`/
`IndexedDbVersion` behind a private `AppDatabase` service; public API is
cohesive business services (AttemptStore), never raw transactions. One
physical DB; append-only `attemptEvents` as authority; **attempt + projection
+ session checkpoint in one strict transaction; reveal only after
completion**. OBSERVED in Chromium: provider round-trip at rc.111, native
contract incl. injected abort, idempotent retry, duplicate rejection, and the
two-tab same-attempt race (exactly one commit). **Accept provisionally** —
Chromium-validated; Firefox/WebKit and versionchange multi-tab pending.
Caveat: provider's internal dependency on unstable Reactivity → isolate
behind the service boundary. Lanes: R2.4 D01–D05 + probe-execution.

## D9. Pack update and cross-tab protocol

Stage/validate new content packs outside any transaction; activate with a
short atomic active-generation pointer flip; sessions pin their content
generation for their lifetime; BroadcastChannel is advisory invalidation
only; Web Locks suppress duplicate long jobs, never prove correctness.
OBSERVED: staged activation, session pinning, BroadcastChannel delivery, and
exclusive Web Locks across real pages. **Accept now** (versionchange
two-tab upgrade still pending). Lanes: R2.4 D06–D09 + probe-execution.

## D10. Service-worker boundary

**Native JavaScript service worker; no Effect inside the SW.** MEASURED:
native SW 379 B vs Effect SW 38.3 KB raw (13.4 KB gzip) for equivalent
install/activate/fetch behavior. SW never caches answer-bearing content
pre-commit (security boundary from the corpus). **Accept now.**
Lanes: R2.3/R2.5 + probe-execution.

## D11. UI state, reactivity, and renderer

Baseline: **semantic direct DOM** with a renderer-neutral model/controller,
centralized patching, explicit cleanup. First declarative candidate when
triggers fire: **lit-html 3.3.3** (+4.4 KB gzip MEASURED, full behavioral
parity OBSERVED). Preact quantified as fallback (+5.1 KB gzip on a matched
player). Atom/unstable reactivity: **defer** — no multi-consumer need
demonstrated; adopt only via an isolated adapter with compile-contract
tests. State separation per R2.2 D01. Durable-state flush: session
persistence must be awaited/flushed before navigation (probe-execution
finding). **Accept baseline now; lit-html prototype-only; Atom defer.**
Lanes: R2.2 + probe-execution.

## D12. Static/interactive chunk boundary and budgets

Static acquisition/reference pages ship ~0 framework JS (885 B reference
MEASURED). Interactive islands lazy-load. MEASURED closures (gzip): Effect
core ≈11.8 KB; +Schema ≈23 KB; realistic Effect player ≈25.5 KB; IndexedDB
provider ≈33 KB standalone. Import-style rules are dead: namespace vs
subpath closures are byte-identical (MEASURED) — do not gate reviews on it.
**Provisional budgets** (binding numbers set at scaffold from routed-app
closures): interactive route initial JS ≤ 40 KB gzip; static pages ≤ 2 KB
gzip JS; provider chunk lazy. **Accept provisionally.** Lanes: R2.5 +
probe-execution.

## D13. Vite/Cloudflare direction

Vite 8.x (rolldown) with default **Oxc** minifier (MEASURED better than
Terser by 6–9 KB raw per probe); builds byte-reproducible (MEASURED).
Deploy direction stays Cloudflare Workers Static Assets; workerd itself
OBSERVED running the committed handler (real runtime, not emulation).
**Accept now** for build tooling; deploy config pinned at scaffold.
Lanes: R2.5/R2.3 + probe-execution.

## D14. Test runners and responsibilities

Per R2.8 D01–D03/D10: `@effect/vitest` for Effect-native service/Layer
tests; `bun test` for Bun-runtime integration and ordinary pure tests
(OBSERVED working); **real browsers** (Playwright) are authoritative for
IndexedDB transactions/migrations/failure semantics — never fake-indexeddb
as proof; smallest truthful environment per test, one runner never
substitutes for another's fidelity. The probe-execution suites
(commit-before-reveal, restoration, two-tab race, focus/live-region) seed
the browser regression pack; R2.8's `attempt-service` Effect test fixture
seeds the vitest workspace. Explicit CI DAG in Bun scripts per R2.8's CI
responsibility map, no task runner. `@effect/vitest` execution itself is
still unexecuted → **spike at scaffold**. **Accept now** (runner split);
spike gates the vitest wiring. Lanes: R2.8 + probe-execution.

## D15. Accessibility gates

Per R2.8's gate set: WCAG 2.2 AA target with automated axe/ACT-aligned
checks as regression detectors (never certification) plus mandatory manual
release gates (keyboard-only, visible focus, screen-reader player flow
through reveal). Release-blocking automated invariants include: no
answer-bearing content in pre-reveal DOM/accessibility tree or static
output metadata; focus moves to outcome only after durable commit;
programmatic status announcements; reduced-motion/forced-colors preserve
meaning. The behavioral halves are already OBSERVED in the renderer suite.
**Accept now.** Lanes: R2.8 D04/D05 + probe-execution.

## D16. Observability and privacy

Per R2.8 D07/D08: local diagnostics by default; optional, consented,
minimized first-party events only; consent-compatible first-party p75 Web
Vitals (LCP/INP/CLS) after launch; privacy redaction contract applies to
anything emitted. No third-party analytics, no required accounts, no
answer-bearing telemetry — ever. **Accept now** (the default);
anything beyond it stays deferred until a written decision need
(R2.3 Q-13). Lanes: R2.8.

## D17. Optional Worker endpoint

**Defer.** No `apps/worker` until the corrections-submission product
decision lands (R2.3 Q-12). When approved: native fetch handler first,
`HttpRouter.toWebHandler` when routes multiply — both OBSERVED (including
under real workerd). API gotchas recorded in probe-execution FINDINGS
(yield `HttpServerResponse.json`; services merged into the app layer).

## D18. What implementation must still measure

See `UNRESOLVED.csv`. None of the items blocks scaffolding; each has a
named gate and owner.
