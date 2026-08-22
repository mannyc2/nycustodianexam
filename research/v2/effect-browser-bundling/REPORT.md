# R2.5 Report — Effect v4 browser bundling under Bun workspaces

Status: **BLOCKED — current source/package research complete; runtime measurement set not executed**

## Executive result

R2.5 successfully passed the immutable-source/GitHub publication gate and re-pinned the lane to the current package/tool coordinates. It did **not** produce valid browser-bundle measurements because the execution environment had no Bun binary, could not resolve the npm registry, and could not materialize the native Rolldown binding required by Vite 8.2.2.

Accordingly:

- no first-pass Effect v3 byte result was reused;
- no handwritten `bun.lock` was created;
- no byte, gzip, Brotli, route-closure, minifier, or reproducibility number is reported as R2.5 evidence;
- no numeric browser-JS budget is recommended;
- the published fixture is a pinned workspace/configuration skeleton plus pure no-Effect baselines and an exact post-install probe specification;
- all runtime-dependent conclusions remain `BLOCKED` or `UNKNOWN`.

This is an intentional fail-closed outcome under the shared evidence contract.

## Current cohort

The lane is pinned to:

- Bun 1.4.0
- `effect@4.0.0-rc.111`
- `@effect/platform-browser@4.0.0-rc.111`
- `@effect/platform-bun@4.0.0-rc.111`
- Vite 8.2.2
- Rolldown 1.2.5 (explicitly fixed because Vite's `~1.2.4` range can resolve it)
- Terser 5.50.0 for minifier comparison
- Preact 10.29.8 for the declarative-renderer comparison
- `@cloudflare/vite-plugin@1.53.1`
- Wrangler 4.125.0

Effect v4 is still a release candidate. npm's unqualified `latest` tag remains on Effect v3, so R2.5 must select the v4 RC explicitly.

## Source-level findings that are current

### Package metadata and tree-shaking inputs

The current Effect core and browser-platform manifests declare no side effects. That is useful tree-shaking metadata, but it is **not** itself a browser-size result. R2.5 therefore does not translate `sideEffects: []` into a claimed size floor.

### IndexedDB moved into the current browser platform surface

Current v4 source exposes browser IndexedDB primitives through `@effect/platform-browser/IndexedDb`, including the browser `indexedDB` / `IDBKeyRange` service and a `layerWindow`. The old first-pass assumptions about v3 browser persistence are not authoritative for this lane. Its incremental bundle cost is still unknown pending P05.

### Browser HTTP reaches unstable HTTP modules

Current `@effect/platform-browser/BrowserHttpClient` exposes fetch/XHR clients, while its implementation imports multiple modules under `effect/unstable/http`. That makes it especially important to measure P08 as an independent graph and not casually pull it into the base player runtime. This is a source-graph observation, not a byte conclusion.

### Reactivity remains explicitly unstable

Current Atom source is under `effect/unstable/reactivity`. R2.5 can measure it as P07, but existence and bundle size cannot convert an unstable API into a production dependency recommendation.

### Vite/Cloudflare coordinates moved since prompt curation

Vite is now 8.2.2 and builds with Rolldown; the current compatible Rolldown coordinate observed is 1.2.5. Cloudflare's Vite plugin is 1.53.1 and its current manifest accepts Vite 8; Wrangler is 4.125.0. Those newer coordinates are used instead of stale curation-time values.

## Required measurements and status

| Probe | Required measurement | Status |
| --- | --- | --- |
| P01 | tiny no-Effect progressive enhancement | source emitted; build **BLOCKED** |
| P02 | basic executable Effect | **BLOCKED** |
| P03 | Schema decode + execution | **BLOCKED** |
| P04 | Context.Service + Layer | **BLOCKED** |
| P05 | browser IndexedDB | **BLOCKED** |
| P06 | Stream | **BLOCKED** |
| P07 | unstable reactivity/Atom | **BLOCKED** |
| P08 | BrowserHttpClient | **BLOCKED** |
| P09 | unstable HTTP/HttpApi Worker | **BLOCKED** |
| P10 | direct-DOM question player | **BLOCKED** |
| P11 | Preact question player | **BLOCKED** |
| P12 | native service worker | source emitted; build **BLOCKED** |
| P13 | Effect service worker | **BLOCKED** |

`RAW-BUNDLE-FILES.csv`, `ROUTE-CLOSURES.csv`, `IMPORT-SENSITIVITY.csv`, and `MINIFIER-COMPARISON.csv` contain blocked sentinel records rather than invented values.

## Lane questions answered as far as evidence permits

### Can acquisition/reference pages avoid Effect entirely?

**Topology target: yes; built verification: BLOCKED.** The fixture includes a standalone static/reference entrypoint with no Effect dependency or import. The actual Vite manifest/module graph still must prove its production closure contains no Effect chunk or preload edge.

### What is the current Effect v4 browser floor?

**UNKNOWN.** P02–P08 did not build. No v3 number is carried forward.

### Does narrow importing materially change current v4 size?

**UNKNOWN.** The comparison matrix is defined but not executed.

### Should Effect be placed in a manual vendor chunk?

**UNKNOWN / no recommendation.** Without current manifest and route-closure evidence, forcing a vendor chunk could accidentally preload Effect on static pages or worsen caching.

### Is Preact worth its incremental cost over direct DOM?

**UNKNOWN.** The candidate is fixed to 10.29.8, but P10/P11 equal-behavior builds are required.

### Should current Atom/reactivity be adopted?

**No production recommendation from this lane.** It is currently under an unstable export; its size is unmeasured.

### Is current browser IndexedDB acceptable?

**API existence CONFIRMED; size UNKNOWN.** P05 is required before drawing a bundle conclusion.

### Is BrowserHttpClient acceptable in the browser player?

**UNKNOWN.** Source inspection shows it reaches unstable HTTP modules, increasing the importance of a dedicated measurement.

### What is Stream's incremental cost?

**UNKNOWN.** P06 is blocked.

### What budgets should the product use?

**No numeric R2.5 budgets yet.** The v3 budgets are superseded and cannot be promoted. `BUDGET-RECOMMENDATION.csv` deliberately leaves byte fields unset.

### Does Bun isolated linking deduplicate the Effect cohort and prevent phantom dependencies?

**Configuration CONFIRMED; installed result UNKNOWN.** The workspace uses the required isolated linker, catalogs, explicit dependencies, and `workspace:*`. A real `bun.lock` and installed tree are still required to verify one cohort and no undeclared dependency access.

### Which minifier should be used?

**UNKNOWN.** Vite's current default and Terser 5.50.0 must be compared on identical current-v4 output.

## What blocked the run

The host reports Linux x86_64, Node 22.16.0 and npm 10.9.2, but `bun` is absent. A direct npm metadata request failed with `EAI_AGAIN registry.npmjs.org`; no relevant package cache was available. The available file transport also rejected the Bun release archive and the native Rolldown shared library. Substituting an older Vite, esbuild, browser/WASM Rolldown, or the recovered v3 bundle results would violate the lane.

Because the exact install could not occur, the contract's installed `node_modules/effect/AGENTS.md` gate also could not be satisfied. Effect-bearing fixture source was therefore not fabricated from old examples; `PROBE-SPEC.md` is the handoff for the first runnable pass.

## Recommendations that survive without byte measurements

1. Keep the static/reference acquisition entrypoint architecturally separate from the study engine and verify the zero-Effect closure once builds can run.
2. Keep browser IndexedDB, BrowserHttpClient, Stream, reactivity, unstable HTTP/HttpApi, renderer, and service-worker Effect usage as separate measurable increments.
3. Do not promote unstable reactivity or HTTP/HttpApi APIs on bundle evidence alone.
4. Do not adopt manual vendor chunking or numeric budgets until actual route-closure measurements exist.
5. Generate and commit the real `bun.lock`; never synthesize it from package manifests.

## Completion criteria still outstanding

R2.5 remains incomplete until a runnable environment performs the exact install, reads the installed Effect instructions, emits the Effect fixture source, executes P01–P13 plus import/minifier variants, records compressed route closures, runs two clean builds, verifies hashes, verifies one Effect cohort/no phantom dependencies, and replaces all blocked sentinel records with measured data.

The draft PR should remain draft while these conditions are outstanding.
