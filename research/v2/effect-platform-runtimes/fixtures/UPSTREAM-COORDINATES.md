# R2.3 upstream and probe coordinates

Observation date: 2026-08-21 UTC.

This file records the exact upstream URLs used to establish or attempt executable evidence. It is evidence metadata, not an application dependency declaration.

## Effect source cohort

- Source repository: https://github.com/Effect-TS/effect
- Pinned source commit: https://github.com/Effect-TS/effect/commit/436f10d1efccec308426532ff3f88df9a96434f3
- Source-declared version: `4.0.0-rc.111`
- Core source manifest: https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/effect/package.json
- Browser source manifest: https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/platform/browser/package.json
- Bun source manifest: https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/platform/bun/package.json
- Node-shared source manifest: https://github.com/Effect-TS/effect/blob/436f10d1efccec308426532ff3f88df9a96434f3/packages/platform/node-shared/package.json

## Registry pages

- Core versions: https://www.npmjs.com/package/effect?activeTab=versions
- Browser versions: https://www.npmjs.com/package/%40effect%2Fplatform-browser?activeTab=versions
- Bun versions: https://www.npmjs.com/package/%40effect%2Fplatform-bun?activeTab=versions
- Node-shared versions: https://www.npmjs.com/package/%40effect%2Fplatform-node-shared?activeTab=versions
- Vitest versions: https://www.npmjs.com/package/%40effect%2Fvitest?activeTab=versions

## CDN probe inputs

`rc.111` source-aligned browser/core inputs:

- https://esm.sh/effect@4.0.0-rc.111?standalone
- https://esm.sh/effect@4.0.0-rc.111/unstable/http?standalone
- https://esm.sh/@effect/platform-browser@4.0.0-rc.111?standalone
- https://esm.sh/@effect/platform-browser@4.0.0-rc.111/BrowserHttpClient?standalone
- https://esm.sh/@effect/platform-browser@4.0.0-rc.111/IndexedDb?standalone
- https://esm.sh/@effect/platform-browser@4.0.0-rc.111/IndexedDbTable?standalone
- https://esm.sh/@effect/platform-browser@4.0.0-rc.111/IndexedDbDatabase?standalone
- https://esm.sh/@effect/platform-browser@4.0.0-rc.111/IndexedDbQueryBuilder?standalone

`rc.110` installable Bun-coherent cohort inputs:

- https://esm.sh/effect@4.0.0-rc.110?standalone
- https://esm.sh/@effect/platform-bun@4.0.0-rc.110?standalone
- https://esm.sh/@effect/platform-node-shared@4.0.0-rc.110?standalone

## Runtime coordinates

- Bun release: https://github.com/oven-sh/bun/releases/tag/bun-v1.3.14
- Bun Linux x64 release asset: https://github.com/oven-sh/bun/releases/download/bun-v1.3.14/bun-linux-x64.zip
- Bun Linux x64 release asset SHA-256: `951ee2aee855f08595aeec6225226a298d3fea83a3dcd6465c09cbccdf7e848f`
- workerd package: https://www.npmjs.com/package/workerd?activeTab=versions
- workerd source: https://github.com/cloudflare/workerd

## Interpretation rule

Source inspection uses the pinned `rc.111` monorepo commit. Executable package probes must use one registry-coherent version cohort and must never silently combine `effect@rc.111` with a Bun adapter published only at `rc.110`. Where the `rc.111` browser package resolves independently, it may be probed with `effect@rc.111`; Bun probes use the complete `rc.110` cohort unless publication changes and a new lock records otherwise.
