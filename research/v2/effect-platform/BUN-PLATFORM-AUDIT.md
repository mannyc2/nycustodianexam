# Bun platform audit — Effect v4 RC.111 source

Upstream inspected: `Effect-TS/effect@436f10d1efccec308426532ff3f88df9a96434f3`, source package version `@effect/platform-bun@4.0.0-rc.111`.

Registry caveat at access time: npm's `rc` tag for `@effect/platform-bun` was `4.0.0-rc.110`, not rc.111. This audit describes source capability; it is not an installable-cohort certification.

## Relevant source modules

Current Bun adapter source includes focused modules for:

- runtime/process entry (`BunRuntime`);
- filesystem (`BunFileSystem`);
- paths (`BunPath`);
- crypto (`BunCrypto`);
- stdio/terminal;
- HTTP client/server/platform;
- child processes;
- workers;
- sockets;
- Redis/cluster support outside this project's current needs.

## Stable-core service candidates

### `BunRuntime.runMain`

Current source delegates to `@effect/platform-node-shared/NodeRuntime.runMain`. It provides the process entry behavior needed for an Effect CLI/compiler: root-fiber execution, error reporting, signals, exit codes and teardown.

**Decision:** use as the compiler/CLI Effect root after the exact installable cohort is verified.

### `BunFileSystem.layer`

Provides stable `effect/FileSystem`, implemented through the shared Node-compatible filesystem provider.

**Decision:** use for compiler filesystem operations that need typed failures, test substitution, scoped resources or composition. Pure path-string calculations do not become Effect merely because files eventually exist.

### `BunPath.layer`

Provides stable `effect/Path`, again through node-shared implementation.

**Decision:** use where compiler code benefits from injectable platform path semantics; keep pure URL/content-identifier manipulation separate.

### `BunCrypto.layer`

Provides stable `effect/Crypto` through node-compatible crypto.

**Decision:** use for publication checksums, secure bytes/UUIDs and digest workflows when they live in Effect. Deterministic content identifiers should remain deterministic pure calculations when cryptographic randomness is not required.

## Why not `BunServices.layer` by default

`BunServices.layer` merges filesystem, crypto, path, stdio and terminal with `BunChildProcessSpawner.layer`. `ChildProcessSpawner` lives under `effect/unstable/process`.

A compiler that validates content, reads/writes artifacts and hashes outputs does not automatically need subprocess authority.

**Decision:** build a focused `CompilerLive` from only the required layers. Add the unstable process provider only when an actual external tool is part of a documented pipeline.

Benefits:

- dependency graph exposes authority;
- unstable API surface stays localized;
- tests do not silently receive real subprocess access;
- later removal of an external tool does not leave process support embedded in the compiler root.

## Bun-native build operations

Bun's runtime includes operations such as `Bun.build`, `Bun.spawn` and shell/tooling APIs. Those operations have Bun-specific semantics that are not represented by generic `FileSystem` or `Path` services.

If the site build or content compiler uses `Bun.build` directly:

```text
BuildArtifacts / BrowserBundleCompiler
  -> project service interface
  -> BunBuildLive
       -> Bun.build
```

Use a project service only if it buys meaningful typed failures, cancellation, observability or test substitution. A one-line build script does not need ceremony merely to avoid importing `Bun`.

Do not introduce a fake cross-runtime `BuildPlatform` abstraction unless another runtime actually performs the same operation with the same contract.

## HTTP client/server

`BunHttpClient` currently re-exports `effect/unstable/http/FetchHttpClient`.

The ordinary content compiler is local/offline-oriented and should not receive network capability without a concrete source/download task.

If a compiler task later requires network access:

- native Bun/global `fetch` behind a narrow source-fetch service is the low-migration option;
- unstable Effect HttpClient is justified only when its typed HTTP model, retry/streaming/tracing, or shared client logic earns the unstable dependency.

Bun HTTP server modules are irrelevant to the normal compiler. The deployed product direction is Cloudflare Static Assets, not a Bun server.

## Child processes

`BunChildProcessSpawner` is an adapter for the unstable Effect process family.

Use only for explicit external tools, for example an audited graphics conversion or validation process that cannot run in-process. If adopted:

- isolate it in one tooling service;
- model exit status/stdout/stderr as typed expected failures where appropriate;
- make cancellation/resource ownership explicit;
- keep the external executable/version in the publication evidence ledger.

## Workers

`BunWorker` and `BunWorkerRunner` depend on `effect/unstable/workers`.

The content compiler does not currently need a worker protocol. Bun can parallelize work by other means, and Effect itself supports structured concurrency without OS/Web workers.

**Decision:** no adoption. Reopen only after profiling identifies a CPU/isolation workload that justifies a Worker boundary.

## Sockets

`BunSocket` depends on `effect/unstable/socket` and also re-exports node-shared TCP/Unix socket constructors.

No current product/compiler requirement needs raw sockets or WebSocket communication.

**Decision:** omit entirely.

## Proposed compiler Layer topology

```text
BunRuntime.runMain
  -> CompilerLive
       -> BunFileSystem.layer
       -> BunPath.layer
       -> BunCrypto.layer
       -> ContentRegistry / publication capabilities
       -> optional BuildToolLive      (Bun.build)
       -> optional ExternalToolLive   (unstable process) only when proven necessary
```

Do not create one giant "platform" layer and do not expose Bun runtime objects inside portable content/domain modules.

## Testing implications

- Effect compiler services: `@effect/vitest` Layers/fakes are a strong fit.
- Pure compiler functions: Bun test or Vitest is acceptable under the eventual workspace test policy.
- Actual Bun API usage (`Bun.build`, Bun runtime behavior): requires Bun runtime smoke tests.
- Cross-platform assumptions are not needed unless the project explicitly chooses to support another compiler runtime.

## Adoption gate

Before dependency lock:

1. install one complete published v4 cohort with Bun;
2. read installed `node_modules/effect/AGENTS.md` fully;
3. compile a minimal `BunRuntime + FileSystem + Path + Crypto` fixture;
4. record generated `bun.lock` and Bun version;
5. verify whether source rc.111 adapter artifacts are published or select a coherent earlier RC without mixing versions;
6. run compiler smoke tests under the pinned Bun runtime.

Until then the source capability is **CONFIRMED**, but exact package adoption is **BLOCKED**.
