# R2.3 - Effect v4 Platform and runtime capability matrix

This lane maps current Effect v4 platform capabilities across four deliberately distinct runtime edges:

- browser page;
- browser Service Worker;
- Bun content compiler and tooling;
- Cloudflare workerd.

It compares direct native APIs, native APIs inside cohesive project-owned Effect services, current official Effect v4 abstractions, and maintained alternatives only when a concrete gap requires one.

## Immutable project source

- Repository: `mannyc2/nycustodianexam`
- Source branch: `agent/chat-corpus-reconciliation`
- Required source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Output branch: `research/v2-effect-platform-runtimes`
- Draft PR: `https://github.com/mannyc2/nycustodianexam/pull/13`
- Allowed path: `research/v2/effect-platform-runtimes/**`

## Current upstream coordinates

- Effect current source: `Effect-TS/effect@993f4be99949d4682f79c22b9cb8dc2fda37ec7c`
- Effect source version: `4.0.0-rc.111`
- Preliminary Effect source coordinate: `436f10d1efccec308426532ff3f88df9a96434f3`
- Change after the preliminary coordinate: one unrelated Pool benchmark file
- Coherent executable Effect candidate: `4.0.0-rc.110`
- Effect rc.110 tag commit: `66114151c2b4640bf773f2b3456ce70d679422f6`
- Bun: `1.4.0`
- Bun tag commit: `34cbb9a40b4bd1bd767d134a7065e66c2432a676`
- Chromium observed: `144.0.7559.96`
- workerd package coordinate researched: `1.20260821.1`

Source existence, registry publication, executable observation, and project recommendation are separate evidence classes throughout the lane.

## Main recommendation

Do not build one universal Platform layer.

Share pure data, Schema models, domain/use-case Effects, and project capability contracts where the contract has real meaning. Preserve browser-page, Service Worker, Bun, and workerd lifetime, cancellation, authority, and resource ownership at their runtime boundaries.

The recommended initial topology is:

- browser page: one `BrowserRuntime.runMain` root per interactive application or island;
- browser persistence: first-party Effect IndexedDB as a provider spike behind project stores, with production adoption blocked on exact real-browser package tests;
- Service Worker: native event listeners and native `waitUntil` / `respondWith` ownership;
- Bun: `BunRuntime` plus focused `BunFileSystem`, `BunPath`, and other explicitly needed layers;
- Cloudflare: native module `fetch(request, env, ctx)` plus a narrow Effect use case for the small correction endpoint;
- tests: Effect tests, real Chromium tests, and workerd-backed Workers tests as separate responsibilities.

## Evidence completed

Real Chromium observations are recorded for:

- IndexedDB strict readwrite commit and explicit abort rollback;
- native fetch abort reaching the local server as a client disconnect;
- Cache Storage;
- Service Worker install, activate, fetch, message, `waitUntil`, and `respondWith`;
- BroadcastChannel;
- Web Locks;
- StorageManager;
- compression and decompression streams;
- readable/writable streams;
- Web Crypto;
- Blob/File;
- dedicated Worker;
- DOM events.

A Cloudflare-compatible module-handler TypeScript build and Web `Request` / `Response` execution were also observed under Node 22. That is explicitly not workerd runtime proof.

## Blocked executable gates

The execution container had no Bun, workerd, Wrangler, or Miniflare executable and no ordinary outbound package installation. Therefore this lane does not fabricate:

- a generated `bun.lock`;
- installed-package `node_modules/effect/AGENTS.md` review;
- Effect package execution;
- BrowserHttpClient execution;
- first-party Effect IndexedDB execution;
- BunRuntime or BunFileSystem execution;
- Effect browser bundle measurements;
- Effect Web-handler execution;
- workerd runtime execution;
- Cloudflare client-disconnect proof.

Exact unexecuted probe sources and terminal blocker evidence are included so the remaining gates are mechanically reproducible.

## Deliverables

- `REPORT.md`
- `PACKAGE-STATUS.csv`
- `CAPABILITY-MATRIX.csv`
- `BROWSER-PLATFORM-AUDIT.md`
- `BUN-PLATFORM-AUDIT.md`
- `CLOUDFLARE-HTTP-OPTIONS.md`
- `SERVICE-WORKER-BOUNDARY.md`
- `LAYER-TOPOLOGIES.md`
- `FALSE-PORTABILITY.md`
- `SOURCE-LEDGER.csv`
- `DECISION-MATRIX.csv`
- `OPEN-QUESTIONS.csv`
- `fixtures/`
- `raw-results/`
- `FINAL-RECEIPT.md`
- `MANIFEST.sha256`

## Evidence labels

- `CONFIRMED`: official source, declarations, or documentation establish the claim.
- `OBSERVED`: a reproducible probe establishes the exact coordinate.
- `CORROBORATED`: strong secondary evidence supports a claim.
- `INFERRED`: project recommendation derived from confirmed/observed evidence.
- `UNKNOWN`: evidence is not established.
- `BLOCKED`: the required executable capability was unavailable.

This directory is architecture research and reproducible evidence. It is not application implementation, a production dependency lock, or runtime certification.
