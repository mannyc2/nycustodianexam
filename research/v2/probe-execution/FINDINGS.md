# Probe-execution findings by lane — 2026-08-22

Each section maps the lane's BLOCKED open questions to what actually happened
when the fixture ran. "Fixture defect" means the blind-written probe code was
wrong, not the architecture; corrected code is under `code/`.

---

## R2.1 — Effect core topology (`research/v2-effect-core-topology`, PR #11)

**Q02 (fixture has no bun.lock and no compile/runtime proof): RESOLVED — all
four gates pass.**

- `bun install` under Bun 1.4.0 resolved `effect@4.0.0-rc.111` +
  `@effect/platform-bun@4.0.0-rc.111` (15 packages, truthful `r2.1/r2.1-bun.lock`).
- `bun run build`: 108 modules bundled, 0.62 MB bun-target entry.
- `bun test`: 1/1 pass.
- `bun run probe`: BunRuntime entry executed the commit-attempt flow end to end
  (`r2.1/r2.1-build-test-probe.txt`).
- Installed `node_modules/effect/AGENTS.md` captured at
  `r2.1/r2.1-installed-effect-AGENTS.md` (394 lines; = CLAUDE.md). Key
  guidance: prefer `Effect.gen` + `Effect.fn("name")`, `Schema.TaggedError`
  for typed errors, no `.pipe` on `Effect.fn`.
- Q12 (coordinate at scaffold time): rc.111 remains current and installable;
  the full three-package cohort resolves coherently (see R2.3 Q-01).

## R2.2 — UI reactivity (`research/v2-effect-ui-reactivity`, PR #12)

**Q01 (Schema boundary compiles/decodes under Bun): RESOLVED — yes.**
`effect-schema-boundary.ts` typechecks under strict tsc (with
`esnext.disposable` lib) and decodes: valid input round-trips, invalid input
fails with typed `SchemaError` (`Expected string at ["version"]`).
Evidence: `r2.2/r2.2-schema-boundary.txt`.

**Q02/Q04 (renderer parity on a native origin with real IndexedDB): RESOLVED —
full pass for all three arms.** In headless Chromium 141 on a localhost origin,
direct-DOM, native-template, and lit-html arms all pass the complete behavioral
suite: commit-before-reveal with no pre-commit leak, failed-commit retry with
stable attempt id, durable reveal, focus-to-outcome, live region, flag,
next-item, reload restoration, unknown-outcome reconciliation, disposal.
Evidence: `r2.2/browser-results.json`.

**Q03 (matched Vite production closures): RESOLVED with numbers.** Vite 8.2.1
manifest closure, raw/gzip:

| arm | raw | gzip |
|---|---|---|
| direct | 13,503 B | 4,958 B |
| template | 16,509 B | 5,748 B |
| lit-html | 25,395 B | 9,321 B |

lit-html delta over direct: **+11.9 KB raw / +4.4 KB gzip**. Evidence:
`r2.2/vite-bundle-measurements.json`.

**New finding (feeds Q05 and R2.4):** `persistSession` is fire-and-forget; a
navigation immediately after a state change can lose the write (observed:
flag-toggle then instant reload lost the flag; a 300 ms settle made it
durable). Implementation should await session persistence or use
`visibilitychange`/`pagehide` flush before treating restoration as guaranteed.

**Fixture defects fixed** (`code/r2.2/`): (1) `measure-vite.mjs` keyed closures
on HTML manifest entries — Vite 8 emits none; remapped to the chunk graph.
(2) `browser_probe.py` reloaded with `?reset=1` still in the URL, wiping the
state it then asserted was restored. (3) Chromium path updated to the
installed browser.

## R2.3 — Platform/runtime matrix (`research/v2-effect-platform-runtimes`, PR #13)

**Q-01 (what cohort resolves): RESOLVED.** The declared rc.110 fixture cohort
installs cleanly, and the full rc.111 cohort (effect, platform-browser,
platform-bun) also resolves coherently — the registry lag the lane observed at
rc.110 is gone. `bun.lock` in `r2.3/` shows a single-cohort tree.

**Q-02 (installed AGENTS guidance): RESOLVED** — captured under R2.1.

**Q-05 (BunRuntime + filesystem layers under Bun 1.4.0): RESOLVED — pass.**
`probe:bun` executed with real filesystem write/read/cleanup
(`r2.3/r2.3-bun-probes.txt`).

**Layer reuse / web handler: RESOLVED — pass, after two API corrections.**
`HttpRouter.toWebHandler` layer built exactly once across sequential requests
(`builds: 1`, both responses `buildNumber: 1`); handler answers 200.
Fixture defects fixed (`code/r2.3/`): in rc.110/111,
(1) `HttpServerResponse.json` returns an **Effect** and must be `yield*`ed —
returning it bare produces an empty 500; (2) handler-required services must be
merged into the app layer passed to `toWebHandler`
(`Layer.mergeAll(Routes, ServiceLive)`) — `Layer.provide` at the route layer
is consumed at construction and yields "Service not found" at request time.

**Q-04 / browser capability matrix: RESOLVED for Chromium.** The committed
browser fixture ran on a localhost origin in Chromium 141: BroadcastChannel,
CacheStorage, Web Locks, module worker, blob/file handling all pass
(`r2.3/r2.3-browser-capability-results.json`). The Effect IndexedDB provider
proof is under R2.4.

**Q-07 (real workerd execution): RESOLVED — pass.** The committed worker ran
under actual `workerd 2026-08-22` (npm binary, capnp config, text binding,
http socket): POST `/api/corrections` → `{"accepted":true,...,"buildId":
"r23-workerd-probe"}`. This upgrades the Cloudflare handler evidence from
Node-emulation to real-runtime (`r2.3/r2.3-workerd-probe.txt`).

**Still open:** Q-08 (Request.signal client-disconnect under a pinned
compatibility date), Q-09 (cold/warm isolate benchmarks), Workers-Vitest
harness parity, Firefox/WebKit capability floors (Q-11).

## R2.4 — IndexedDB/offline (`research/v2-effect-indexeddb-offline`, PR #14)

**Q01 (transaction contract in a real browser): RESOLVED for Chromium — the
native fixture passes everything.** Single-page: open+migration v1→v2,
authoritative three-store attempt commit, injected abort, idempotent retry,
conflicting-duplicate rejection, staged pack + atomic activation pointer,
session pinning, error-name translation, StorageManager estimates — all pass.
Two-page CDP: same-attempt two-tab race resolves to exactly one committed
event (`committed` / `alreadyCommitted`), BroadcastChannel delivers, Web Locks
are exclusive. Evidence: `r2.4/browser-native-results.json`.

**Effect-provider half: RESOLVED — pass at rc.111.** R2.3's
`browser-indexeddb.ts` (IndexedDbDatabase/Table/Version + `withTransaction`
insert + select) was bundled for the browser and executed in Chromium:
`{"status":"ok","rows":[{"id":"attempt-001","selected":"B","committed":true}]}`
(`r2.4/r2.4-effect-provider-chromium.json`). The provider recommendation can
graduate from SOURCE-CONFIRMED to RUNTIME-VALIDATED for Chromium.

**Fixture defect fixed** (`code/r2.4/cdp.mjs`): the Web Locks exclusivity
check compared `performance.now()` across two pages — per-page time origins
made exclusive locks look overlapping. Fixed with epoch-based clocks
(`performance.timeOrigin + performance.now()`); locks are exclusive
(second grant 1.2 ms after first release).

**Still open:** Q01 for Firefox/WebKit; Q02 (two-tab `versionchange` upgrade);
storage-pressure behavior on real devices.

## R2.5 — Browser bundling (`research/v2-effect-browser-bundling`, PR #15)

The lane's PROBE-SPEC defined P01–P13 as a specification; this pass wrote the
probe sources (`code/r2.5/`), built them with the pinned cohort (Bun 1.4.0
isolated linker + catalogs, Vite 8.2.2, rc.111), and measured. Raw data:
`r2.5/isolated-probes-measurements.json`, `r2.5/apps-measurements.json`.

**O002 (single cohort): PASS** — `bun.lock` resolves exactly one
`effect@4.0.0-rc.111`; catalogs + `workspace:*` edges all install.

**O001/O006/O007/O008 (probe closures, minified, per entry):**

| probe | raw | gzip -9 | brotli 11 |
|---|---|---|---|
| P02 basic Effect | 33.8 KB | 11.8 KB | 10.8 KB |
| P03 + Schema decode | 69.2 KB | 23.0 KB | 21.0 KB |
| P04 service/Layer | 31.5 KB | 11.1 KB | 10.3 KB |
| P05 IndexedDB provider | 106.7 KB | 33.4 KB | 30.2 KB |
| P06 Stream | 28.6 KB | 10.0 KB | 9.2 KB |
| P07 Atom (unstable/reactivity) | 73.3 KB | 24.1 KB | 22.0 KB |
| P08 BrowserHttpClient | 99.7 KB | 32.8 KB | 29.6 KB |
| P09 unstable/http router (worker graph) | 133.5 KB | 44.4 KB | 39.8 KB |

**O003 (import sensitivity): RESOLVED — zero.** Namespace/barrel vs
narrow-subpath variants of P02–P06/P08 produce byte-identical (±6 B) closures
under rolldown-vite. Import-style discipline is not a real lever at this
cohort; drop it from review gates.

**O009 (renderer delta, matched players): direct-DOM player 75.4 KB raw /
25.5 KB gzip; Preact player 88.3 KB raw / 30.7 KB gzip → Preact costs
+12.9 KB raw / +5.1 KB gzip** over an identical-behavior direct-DOM arm
(both include the shared Effect attempt service). Consistent with R2.2's
lit-html delta (+4.4 KB gzip): renderer adoption is a single-digit-gzip-KB
decision, not a rewrite-scale one.

**O010 (service worker): native SW 379 B raw / 242 B gzip; Effect SW
38.3 KB raw / 13.4 KB gzip.** Putting Effect inside the service worker costs
the full runtime closure; the native service worker is strongly favored
unless the SW grows real orchestration needs.

**O011 (minifier): default Oxc beats Terser 5.50** on this graph by 6–9 KB raw
/ ~2–3 KB gzip per probe (e.g. P03: 69.2 vs 77.4 KB raw). Keep the default.

**O012 (reproducibility): PASS** — two clean builds of all 14 probe entries
are byte-identical (sha256 compare).

**P01 static reference:** 885 B raw / 485 B gzip — the "no framework" floor.

**Still open:** O004/O005 (multi-route app chunk closures and vendor-chunk
policy — needs a routed app fixture, deferred to scaffold time), P09 under
`@cloudflare/vite-plugin` dry-run (wrangler not exercised), Brotli-served
route budgets on a real host.

---

## Aggregate read for the synthesis lane (R2.90)

1. **The stack works as pinned.** Bun 1.4.0 + rc.111 installs, builds, tests,
   and runs across bun-target, browser, and workerd surfaces. No blocking
   incompatibility surfaced anywhere.
2. **Budget-shaping numbers are in.** A realistic Effect question player lands
   ≈25 KB gzip; +5 KB for a renderer library; IndexedDB provider ≈+20 KB gzip
   over core; keep Effect out of the service worker.
3. **Import-style rules and Terser can be dropped** from proposed gates
   (O003/O011).
4. **API gotchas for implementation:** `HttpServerResponse.json` must be
   yielded; handler services go in the app layer passed to `toWebHandler`;
   session persistence must be flushed before navigation.
5. **Remaining runtime gaps are narrow and enumerated** (Firefox/WebKit,
   versionchange multi-tab, workerd signal/benchmarks, routed-app closures) —
   none blocks scaffolding.
