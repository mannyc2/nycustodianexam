# Dependency direction laws

## Workspace graph

```text
packages/content
        ^
        |
packages/study
   ^          ^
   |          |
apps/site   optional apps/worker

packages/content
        ^
        |
apps/content-compiler
```

`apps/site` may depend on both portable packages. The compiler normally depends
only on `packages/content`. No package imports an app.

## Laws

1. Portable packages must not import `bun:*`, `node:*`, DOM/IndexedDB host values,
   workerd types, service-worker events, renderer packages, or app roots.
2. `packages/content` never imports `packages/study`; study may consume content.
3. Concrete IndexedDB/fetch/filesystem/service-worker/Bun/Worker Layers live in
   the owning app unless a second real consumer proves a package boundary.
4. Static generation may import portable models but not browser ManagedRuntime,
   DOM event wiring, or client storage implementations.
5. Renderer modules own presentation only, not commitment, storage, assembly,
   scheduling, pack activation, or correctness policy.
6. Optional Worker code is a leaf and never a dependency of the static site,
   browser app, compiler, or portable packages.
7. Feature modules export contracts/focused Layers; app roots compose them. No
   Layer imports the app root that provides it and no universal `AppLayer` package
   exists.
8. Every workspace that imports Effect or platform-bun declares it explicitly
   through the root Bun catalog; hoisting is not a dependency contract.
9. Bun may run scripts/builds, but browser/service-worker/workerd runtime files do
   not import Bun runtime APIs or types.
10. Public exports expose deliberate schemas, pure functions, and service
    contracts. Host handles and root wiring remain private.
11. Static/public outputs must not leak answers through DOM, accessibility data,
    filenames, manifests, source maps, or asset metadata.

## Suggested enforcement

Use explicit exports maps, runtime-specific tsconfigs, restricted-import checks,
browser build rejection of Bun/Node built-ins, package-manifest audits, static
build tests, and R2.5 bundle inspection. Add a graph tool only if it provides more
value than simple workspace/export rules.
