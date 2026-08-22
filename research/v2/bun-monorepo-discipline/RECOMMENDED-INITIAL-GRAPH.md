# Recommended initial graph

Status: INFERRED from current R2.1-R2.5 architecture/runtime evidence and R2.7 workspace mechanics.

```text
apps/
  site/
  content-compiler/
packages/
  content/
  study/
```

Dependency direction:

```text
packages/content <- packages/study <- apps/site
packages/content <- apps/content-compiler
```

`apps/site` may depend directly on both portable packages. No package imports an app. `packages/content` never imports `packages/study`.

Keep browser, service-worker, Bun, and future workerd types out of portable package public APIs. Concrete host implementations stay in the owning app until a second real consumer creates a package boundary.

Do not create `apps/worker` until a real server capability exists. Do not create universal `core`, `shared`, `platform`, or package-per-service workspaces by convention.

Alternative: merge `packages/study` into `apps/site` if implementation proves it has one private consumer and no independent ownership/reuse value.
