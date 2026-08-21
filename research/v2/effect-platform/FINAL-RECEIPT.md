# FINAL RECEIPT — Effect v4 platform/runtime lane

## Lane identity

- Repository: `mannyc2/nycustodianexam`
- Lane: current Effect v4 platform/runtime architecture
- Immutable source branch: `agent/chat-corpus-reconciliation`
- Immutable source SHA: `645e885748c830f7a9cbbbe90ac0f31149bfc81c`
- Output branch: `research/v2-effect-platform`
- Allowed path: `research/v2/effect-platform/**`
- Draft PR: `https://github.com/mannyc2/nycustodianexam/pull/7`

## Publication commits

- Initial GitHub checkpoint: `582c5ba53329dce1f072074711cbedf45c8b7576` — `research: initialize Effect v4 platform/runtime lane`
- Source/package baseline: `12e01c5b78ff77c05913560a0a8013357218be98` — `research: record v4 platform source baseline`
- Final substantive research: `e64b8a02e3143590f6407fdbccd7b51759ab3bb4` — `research: map Effect v4 platform/runtime capabilities`
- Receipt/manifest publication: this receipt is written in the terminal publication commit. Its resulting Git SHA is necessarily known only after Git creates the commit; the exact final branch head is recorded in PR #7 and the visible handoff rather than fabricating a self-referential commit SHA inside this file.

## Upstream coordinates

### Effect

Primary upstream source inspected:

- repository: `Effect-TS/effect`
- commit: `436f10d1efccec308426532ff3f88df9a96434f3`
- source core version: `effect@4.0.0-rc.111`
- source runtime/test package versions at that commit:
  - `@effect/platform-browser@4.0.0-rc.111`
  - `@effect/platform-bun@4.0.0-rc.111`
  - `@effect/platform-node-shared@4.0.0-rc.111`
  - `@effect/vitest@4.0.0-rc.111`

Registry status observed at the research cutoff:

- `effect`: npm rc tag `4.0.0-rc.111`; normal latest remains v3 `3.22.1`
- `@effect/vitest`: npm `4.0.0-rc.111`
- `@effect/platform-bun`: npm rc tag `4.0.0-rc.110`, creating source/registry skew
- `@effect/platform-browser`: package/source confirmed, but exact `rc.111` registry availability was not established by the available registry evidence and is recorded **UNKNOWN**

No production dependency cohort is locked by this lane.

### Bun

- Current official coordinate observed: `Bun 1.3.14`
- Bun executable in the lane execution environment: **unavailable**

## Substantive files

- `START-RECEIPT.md`
- `README.md`
- `REPORT.md`
- `CAPABILITY-MATRIX.csv`
- `PACKAGE-STATUS.csv`
- `LAYER-TOPOLOGIES.md`
- `BROWSER-PLATFORM-AUDIT.md`
- `BUN-PLATFORM-AUDIT.md`
- `SERVICE-WORKER-BOUNDARY.md`
- `CLOUDFLARE-HTTP-OPTIONS.md`
- `FALSE-PORTABILITY.md`
- `SOURCE-LEDGER.csv`
- `DECISION-MATRIX.csv`
- `OPEN-QUESTIONS.csv`
- `raw-results/ENVIRONMENT.txt`
- `fixtures/README.md`
- `FINAL-RECEIPT.md`
- `MANIFEST.sha256`

## Core findings

1. **No universal runtime/Platform Layer.** Browser page, Bun CLI, browser Service Worker and Cloudflare workerd have materially different lifetime/authority semantics. Share product capabilities and Effect use cases, not fake runtime identity.
2. **Browser page:** one `BrowserRuntime.runMain` root for interactive code; DOM remains native; durable learner writes complete before reveal.
3. **Typed v4 IndexedDB is now the preferred provider spike.** Current browser source has Schema-backed tables, migrations, query builder and transaction support that waits for native `oncomplete` and aborts on Effect failure/interruption. It is not production-approved until real-browser probes pass, and the database implementation currently depends on `effect/unstable/reactivity`.
4. **Bun compiler:** prefer focused `BunRuntime`, `BunFileSystem`, `BunPath` and `BunCrypto`. Do not default to `BunServices.layer` because it also grants unstable child-process capability.
5. **Service Worker:** native `install`/`activate`/`fetch`/`message` event ownership with Effect promises attached to `waitUntil`/`respondWith`. Neither `BrowserRuntime` nor Effect WorkerRunner is a Service Worker lifecycle abstraction.
6. **Cloudflare workerd:** native module `fetch(request, env, ctx)` is the baseline. There is no current official Cloudflare Effect platform adapter. Use native Fetch + Effect core for a tiny corrections endpoint; isolate unstable `effect/unstable/http` / `httpapi` only if server complexity earns it.
7. **Cache APIs are not portable by spelling.** Browser Cache Storage and Cloudflare Cache have different authority/lifetime/distribution semantics.
8. **Tests:** use `@effect/vitest` for Effect-aware service/Layer/property tests while retaining real-browser IndexedDB/Service Worker tests and workerd runtime tests.
9. **Unstable surfaces identified:** HTTP, HttpApi, persistence, process, reactivity, socket and workers are all explicitly unstable in the current v4 package. Provider boundaries must contain their migration surface.
10. **Version lock remains blocked.** Source packages are rc.111 while observed npm `@effect/platform-bun` rc is rc.110; a genuine Bun resolution/lock probe is mandatory before freezing dependencies.

## Probes performed

### Repository/source probes

- verified immutable project source and lane branch nonexistence before launch;
- merged reviewed curation prerequisite at exact inspected head;
- inspected current Effect upstream package manifests/source at a pinned commit;
- inspected browser runtime, crypto, persistence, IndexedDB, worker/socket and runtime source;
- inspected Bun runtime/filesystem/path/crypto/services/http/worker/socket source;
- inspected unstable HTTP/Web handler and HttpApi source families;
- inspected current `@effect/vitest` source;
- checked npm package/version publication status from primary registry pages;
- checked current Bun official version;
- checked current Cloudflare Worker handler/context/fetch/cache/request-signal documentation;
- checked browser Service Worker event lifetime semantics;
- searched current Effect upstream for a Cloudflare/workerd adapter and found none;
- rechecked source branch drift at finalization.

### Runtime probes not performed — **BLOCKED**

The available execution environment had Node `v22.16.0` but no Bun executable, and outbound package/source installation from the container could not resolve external hosts. Therefore this lane deliberately did **not** fabricate:

- a Bun install;
- `package.json`/`bun.lock` fixture claiming resolved Effect packages;
- installed `node_modules/effect/AGENTS.md` review;
- compile/runtime observation of the current v4 packages;
- real-browser IndexedDB transaction/migration/interruption tests;
- Service Worker lifecycle/update tests;
- workerd/Wrangler/Miniflare tests;
- browser bundle measurements.

Those gates are enumerated in `OPEN-QUESTIONS.csv` and `REPORT.md`.

## Source-branch drift recheck

At finalization, comparing:

```text
base: 645e885748c830f7a9cbbbe90ac0f31149bfc81c
head: agent/chat-corpus-reconciliation
```

returned **identical**, `ahead_by=0`, `behind_by=0`.

The lane therefore remained based on exactly the immutable post-curation source throughout the research. No rebase or silent source update occurred.

## Launch-gate limitation recorded

The curated suite's `{{POST_CURATION_SOURCE_SHA}}` stamping instructions are self-referential if the embedded SHA is required to equal the commit that contains it. With explicit maintainer authorization after PR #4 was merged, this lane used the exact post-curation merge commit `645e885748c830f7a9cbbbe90ac0f31149bfc81c` as immutable source and documented the inconsistency rather than inventing a hash.

## Checksums

`MANIFEST.sha256` contains SHA-256 checksums for the lane files included in the terminal publication set, excluding the manifest itself to avoid self-reference. The final Git head/PR remains the durable publication receipt.

## Research authority

This lane establishes architecture evidence and migration gates. It does **not**:

- lock dependencies;
- scaffold production packages;
- implement persistence or Service Worker behavior;
- approve unstable Effect APIs for broad use;
- certify Cloudflare compatibility flags;
- certify IndexedDB durability/cancellation across browsers;
- modify product/application code.
