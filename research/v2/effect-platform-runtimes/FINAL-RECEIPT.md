# R2.3 Final Receipt

## Lane identity

- Lane: `R2.3 - Effect v4 Platform and runtime capability matrix`
- Repository: `mannyc2/nycustodianexam`
- Immutable source branch: `agent/chat-corpus-reconciliation`
- Required immutable source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Output branch: `research/v2-effect-platform-runtimes`
- Allowed path: `research/v2/effect-platform-runtimes/**`
- Draft PR: `https://github.com/mannyc2/nycustodianexam/pull/13`
- Initial lane commit: `bb37f84710befb31f5fb423866a3a68ef7b6e5b0`
- Continuation baseline observed before finalization: `206c393520e70a17ef434af03794f28b8d3995b6`
- Final substantive corpus commit before this receipt: `8d7b623a77e385e7b8f753971422dd02c6c73388`
- Terminal receipt/manifest commit: recorded in the draft PR metadata and visible final GitHub receipt after publication, because a Git commit cannot embed its own hash in its committed contents.
- Finalized at: `2026-08-22T00:28:00Z`

## Source drift recheck

At final recheck, `agent/chat-corpus-reconciliation` remained exactly equal to the required source SHA:

- status: `identical`;
- ahead by: `0`;
- behind by: `0`;
- merge base: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`.

No moving source state was silently adopted.

## Exact upstream and runtime coordinates

- Effect latest source version: `4.0.0-rc.111`.
- Effect current source audit commit: `993f4be99949d4682f79c22b9cb8dc2fda37ec7c`.
- Preliminary PR #7 Effect coordinate: `436f10d1efccec308426532ff3f88df9a96434f3`.
- Change after the preliminary coordinate: one unrelated file, `packages/effect/benchmark/Pool.ts`.
- Coherent executable Effect fixture candidate: `4.0.0-rc.110`.
- Effect `4.0.0-rc.110` tag commit: `66114151c2b4640bf773f2b3456ce70d679422f6`.
- Bun release: `1.4.0`.
- Bun tag commit: `34cbb9a40b4bd1bd767d134a7065e66c2432a676`.
- Chromium observed: `144.0.7559.96`.
- Node observed: `v22.16.0`.
- TypeScript observed: `5.8.3`.
- workerd package coordinate researched: `1.20260821.1`; workerd execution was not available.

Source existence, package publication, runtime observation, and project adoption remain distinct evidence classes throughout the lane.

## Publication history

### Initial and baseline commits

1. `bb37f84710befb31f5fb423866a3a68ef7b6e5b0` - initialize Effect platform runtime lane.
2. `08084505ce2d7b0344b28f2cd85173f8d4740a46` - pin upstream and probe coordinates.
3. `29ccf8debfd5370fb7169f00ae74fa4f93228cc1` - record immutable probe download links.
4. `894c111f1263634446f330fb7695d6aab6c329d8` - add source baseline.
5. `8b093f5f444ef89af7585e83d304ed8a671a8c8d` - record package coordinates.
6. `dce3b3222876c63f0baf1540417f7d6f45af2d44` - seed source ledger.
7. `510bfae3e988c52b913ed272151c03d87aa271ea` - add exact Effect runtime fixture manifest.
8. `fecd48dde6ecbd9c32366ce7f4ded2dbc6ce47ed` - document fixture gates.
9. `61b45fa4273fd2c75c9b572b9fcd8a2f47589dc3` - record initial probe environment.
10. `206c393520e70a17ef434af03794f28b8d3995b6` - record official artifact bootstrap coordinates.

### Finalization commits

11. `f770d302ee2fb444bc31e87f5d3bf8a173ef4250` - index runtime fixtures and verify fast-forward publication.
12. `bd8e1d074632050b0b8b6def0bbec2003d5cf492` - publish package/start/open-question matrices.
13. `98698d3a48c7eae2d49161e05f74f153b7f59784` - publish capability matrix.
14. `c12ea74a8bc1b452ee55e3c07f678ceb6f997283` - publish source and decision ledgers.
15. `7c98e0241fe65fa562283c12afa7c90b290e54ea` - publish substantive platform/runtime report.
16. `9ac15c44b6a3b4609241ac0cb76dc069819f0045` - publish browser and Bun audits.
17. `96622b1a0d7fe0ce71c98878053d3bcff6066e85` - publish Cloudflare HTTP options.
18. `b79f644752bfcb57cc5e156123161ad02ea464bd` - publish Service Worker boundary.
19. `9efb3165b24c41d5c5f76cb22818501e6436e9ba` - publish Layer topologies and false-portability analysis.
20. `8e91a2bd3ba440af737e352f232e90246c88b27c` - publish browser runtime fixture harness.
21. `cd15147617b18da4ee30bbf0ddc078e9ad3cd0b7` - publish exact blocked Effect and Bun probes.
22. `7df9ce4ec315b4cf98d33e21d62d691b15811b15` - publish Cloudflare-compatible handler fixture.
23. `d39bfa01f9e5f5bdb68d7fac369191b03441a711` - publish browser capability probe source.
24. `2062df308cb05b37adcdfbc91c263c4f7d8b5457` - publish raw environment and evidence ledger.
25. `8d7b623a77e385e7b8f753971422dd02c6c73388` - publish browser and handler raw results.

Every branch update used a normal fast-forward ref update with `force=false`. No force-push, history rewrite, merge, duplicate branch, or duplicate PR was used.

## Substantive outputs

- `README.md`
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
- `START-RECEIPT.md`
- `FINAL-RECEIPT.md`
- `MANIFEST.sha256`
- exact fixture sources under `fixtures/`;
- raw environment, commands, probe, server, build, policy-restoration, and blocker evidence under `raw-results/`.

## Probes run

### Real Chromium browser and Service Worker evidence

Chromium `144.0.7559.96` observed:

- native fetch abort and a corresponding server-side `BrokenPipeError`;
- strict IndexedDB readwrite commit;
- explicit IndexedDB transaction abort and rollback;
- Cache Storage put/match/delete;
- BroadcastChannel delivery;
- Web Locks acquisition/release;
- StorageManager estimate and persistence state;
- gzip `CompressionStream` / `DecompressionStream` round trip;
- `ReadableStream` / `WritableStream` transfer;
- Web Crypto random bytes and SHA-256 digest;
- Blob/File operations;
- a dedicated Worker message round trip;
- a DOM event;
- Service Worker install/activate/message `waitUntil` behavior;
- Service Worker `fetch` event `respondWith` behavior.

The managed Chromium policy was restored byte-for-byte after the isolated localhost probe. The restored policy SHA-256 was `3b740260e337305aaef268e6c63af8fa2796057ce46f43df5ae5a3949e085e86`.

### Cloudflare-compatible Web-handler shape evidence

TypeScript built an `ExportedHandler<Env>`-shaped module. Node `v22.16.0` executed two Web `Request` to `Response` calls with:

- two accepted responses;
- one module initialization;
- two request counts;
- one `waitUntil` registration per request.

The raw result explicitly records:

- `workerdRuntimeProof: false`;
- `effectLayerProof: false`.

## Probes not run

The execution environment had no usable Bun, workerd, Wrangler, Miniflare, Docker, Podman, GitHub CLI, outbound package installation, or cached Effect v4 cohort. Therefore the lane does not claim:

- a Bun install or generated `bun.lock`;
- installed-package `node_modules/effect/AGENTS.md` review;
- BunRuntime or BunFileSystem execution;
- Effect BrowserHttpClient execution;
- first-party Effect IndexedDB execution;
- Effect Web-handler execution;
- Effect Layer reuse execution;
- Effect browser/workerd bundle measurements;
- workerd runtime execution;
- Cloudflare request-abort, binding, streaming, or cold-start runtime proof.

Exact unexecuted fixture sources and the evidence needed to close each gate are committed. The blocked gates remain explicit in `OPEN-QUESTIONS.csv` and `raw-results/PROBE-SUMMARY.csv`.

## Key conclusions

1. Do not create one universal Platform layer. Browser page, browser Service Worker, Bun tooling, and workerd have distinct authority, cancellation, and lifecycle semantics.
2. Use one `BrowserRuntime.runMain` root per interactive application or island. Keep native DOM event and semantic HTML ownership at the UI boundary.
3. Use `BrowserHttpClient` behind cohesive project clients only when typed status/body failures, Schema decoding, retry, tracing, or substitution justify the unstable HTTP protocol. Keep trivial Web reads native.
4. Evaluate the first-party Effect v4 IndexedDB provider behind project stores, but do not approve production adoption until the committed real-package migration, transaction, interruption, reload, and bundle gates pass.
5. Keep Service Worker event ownership native: `install`, `activate`, `fetch`, `message`, `waitUntil`, and `respondWith`.
6. Use `BunRuntime` and focused Bun Layers for compiler/CLI tooling. Do not grant `BunServices.layer` or leak Bun/node-shared imports into browser/workerd graphs by default.
7. Start the correction endpoint as a native module Worker `fetch(request, env, ctx)` boundary calling a narrow Effect Schema use case. Revisit `effect/unstable/http` only when route, middleware, streaming, or resource-scope complexity earns it. Do not adopt `effect/unstable/httpapi` for one small endpoint.
8. Treat interruption as control flow, not provider rollback. Correctness still requires transactions, idempotency, atomic activation, explicit versions, and reconciliation.
9. Keep `Request`, `Response`, `Headers`, `URL`, `Blob`, `File`, DOM events, and other deterministic native Web values native when an Effect service would merely rename them.
10. Keep browser Cache Storage and Cloudflare Cache API, browser Service Workers and Cloudflare Workers, and browser IndexedDB and server storage as distinct provider semantics.

## Integrity and path validation

- Pre-receipt PR contents contained exactly 57 expected files.
- Adding this receipt and `MANIFEST.sha256` yields 59 lane files.
- Every changed path is under `research/v2/effect-platform-runtimes/**`.
- `MANIFEST.sha256` covers every lane file except itself.
- CSV files parse with consistent column counts.
- JSON and JSONL evidence parse.
- Required outputs are present.
- Text content is standard ASCII.
- Representative remote Git blob hashes matched the locally validated report, matrices, Service Worker audit, browser probe, Chromium result, server event log, and compiled Worker fixture.

## GitHub state at receipt preparation

- Draft PR: open and draft.
- Base: `agent/chat-corpus-reconciliation` at `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`.
- Head branch: `research/v2-effect-platform-runtimes`.
- Head before receipt/manifest publication: `8d7b623a77e385e7b8f753971422dd02c6c73388`.
- Source drift: none.

The terminal receipt/manifest commit and final head are recorded in the updated draft PR body and the visible final GitHub receipt.
