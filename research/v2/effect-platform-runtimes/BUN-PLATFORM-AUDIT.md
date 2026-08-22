# Bun Platform Audit

## Current coordinates

```text
Bun: 1.4.0
Tag: bun-v1.4.0
Tag commit: 34cbb9a40b4bd1bd767d134a7065e66c2432a676

Effect source: 4.0.0-rc.111
Effect source commit: 993f4be99949d4682f79c22b9cb8dc2fda37ec7c

Coherent executable candidate:
effect 4.0.0-rc.110
@effect/platform-bun 4.0.0-rc.110
@effect/platform-node-shared 4.0.0-rc.110
Effect tag commit: 66114151c2b4640bf773f2b3456ce70d679422f6
```

Current source `@effect/platform-bun` is `4.0.0-rc.111`, while the observed registry coordinate for the adapter was still `4.0.0-rc.110`. The lane does not assume that source and registry cohorts can be mixed.

## What the Bun package adds

The package is a Bun runtime adapter, not a generic Web portability package. Its product value is concentrated at compiler/tooling boundaries.

### `BunRuntime`

`BunRuntime.runMain` establishes the CLI/process root. Current source:

- forks the Effect program as the root fiber;
- provides Bun filesystem/path/terminal services;
- listens for `beforeExit`, `SIGINT`, and `SIGTERM`;
- interrupts the root on shutdown;
- writes an error exit code for failures;
- supports options for disabling error reporting or registering a custom teardown signal.

This is appropriate for build/compiler commands. It must not be imported into browser or workerd entrypoints.

### `BunFileSystem`

`BunFileSystem.layer` provides the stable `effect/FileSystem` service and deliberately delegates to `@effect/platform-node-shared/NodeFileSystem`.

The application code should depend on cohesive compiler services and `FileSystem`, not call Bun APIs throughout domain logic. The runtime implementation remains Bun/node-shared and should be visible at the composition root.

Cancellation remains truthful: interruption can stop Effect waiters and release scoped resources, but an operating-system filesystem call may complete after interruption. Publication operations still need temporary paths, atomic rename where supported, checksums, and idempotent recovery.

### `BunPath`

`BunPath` provides the `effect/Path` service using the host path implementation. This is useful for deterministic compiler path construction while keeping platform-specific separators at the adapter boundary.

Do not use a path service for URLs or browser asset identifiers. Filesystem paths and URLs are different value domains.

### `BunCrypto`

Use the Bun crypto provider only where the compiler needs an injectable Effect `Crypto` service for checksums/UUIDs. If the content compiler has a cohesive `ContentIntegrity` service, that service should own algorithm/canonicalization policy and use the runtime crypto provider internally.

### Process and child-process capabilities

The aggregate `BunServices.layer` includes broad capabilities, including unstable child-process spawners and process runners. That is not a neutral convenience.

Default compiler composition should grant only:

- filesystem;
- path;
- terminal/logging if needed;
- crypto if needed.

Add child-process authority only for a concrete reviewed tool invocation.

### Worker, socket, HTTP, and cluster modules

These modules exist because the Bun package is a broad runtime adapter. Their presence does not create a product requirement.

The current content compiler does not need a server, cluster, socket, or worker protocol merely to parse, validate, hash, and publish content.

## Project compiler fit

The future compiler should use Effect services for meaningful boundaries:

- source file discovery and reads;
- Schema decode and validation;
- canonical serialization;
- checksum calculation;
- deterministic object/manifest output;
- atomic/staged publication;
- typed diagnostics;
- scoped temporary directories and cleanup.

Pure transformations remain ordinary TypeScript. The compiler should not create a service per validation rule or a package per service.

Recommended root shape:

```text
BunRuntime.runMain(
  CompilerCommand.pipe(
    Effect.provide(CompilerLive),
    Effect.provide(BunFileSystem.layer),
    Effect.provide(BunPath.layer),
    Effect.provide(BunCrypto.layer only if required)
  )
)
```

A more explicit Layer graph may be used, but runtime construction occurs once at the command root.

## Dependency graph rule

Browser and workerd packages must not depend on `@effect/platform-bun` or gain it through a shared package.

Safe sharing:

- Schema models;
- pure domain functions;
- Effect use cases parameterized by stable services;
- typed error/data models.

Unsafe sharing:

- a package that re-exports Bun Layers to browser code;
- a shared `platform` package whose imports pull node-shared into browser/workerd builds;
- compiler services that expose Bun-native values in their public contracts;
- a root `BunServices.layer` imported as a universal default.

The future workspace should use runtime-specific entry packages and explicit dependencies so Bun cannot become a phantom browser dependency.

## Exact executable gates

The included probe source is intended to:

1. start through `BunRuntime.runMain`;
2. provide focused `BunFileSystem` and `BunPath` Layers;
3. create a scoped temporary directory;
4. write and read a file;
5. log the exact path/value;
6. clean up on Scope close.

Required environment evidence:

- `bun --version` and revision;
- package resolution with one exact cohort;
- committed text `bun.lock`;
- complete installed `node_modules/effect/AGENTS.md` review;
- command/stdout/stderr;
- filesystem before/after evidence;
- browser/workerd bundle scans proving no runtime leakage.

## Execution status

`BLOCKED`.

The container had no Bun executable, no ordinary package-manager network, and no cached Effect cohort. A lockfile or runtime result was not fabricated.

## Bun recommendation

- Use Bun as workspace/tooling/runtime for compiler and build commands.
- Use `BunRuntime.runMain` at each CLI root.
- Use focused Layers instead of `BunServices.layer` by default.
- Keep public compiler contracts provider-neutral where the semantics are genuinely shared.
- Preserve Bun/node-shared implementation identity in diagnostics and runtime packages.
- Require the exact install/runtime/bundle gates before production dependency pinning.
