# R2.7 report - Bun monorepo, workspaces, build, and CI discipline

## Executive conclusion

Use Bun as the repository package manager, workspace orchestrator, script runner, and Bun-runtime toolchain where Bun semantics actually apply. Do not let that choice erase the distinct browser, service-worker, Vite, or Cloudflare runtime boundaries.

Recommended mechanics:

- private root package;
- `apps/*` and `packages/*` workspaces;
- exact `packageManager: bun@1.4.0` pin;
- Bun workspaces object with one root catalog;
- exact coordinated Effect v4 cohort at `4.0.0-rc.111` for this research coordinate;
- root dev `effect` for package-local guidance/source access;
- explicit `catalog:` runtime dependencies in every consumer;
- `workspace:*` for internal edges;
- isolated linking to expose undeclared imports;
- one committed text `bun.lock`;
- `bun ci` / frozen-lockfile install in CI;
- minimal reviewed lifecycle trust;
- explicit prerequisite ordering for content generation and site build;
- Bun filters for selection, not as an assumed full build DAG;
- no external task runner until repository growth demonstrates a real gap;
- Vite remains the browser development/production build owner;
- Cloudflare Vite/Wrangler tooling remains specialist deployment/runtime tooling;
- runtime-specific TypeScript configs;
- Bun test for pure/Bun-runtime tests, Vitest + `@effect/vitest` for Effect-aware tests, Playwright for real browser semantics, and workerd-specific tooling only when a Worker exists.

## Package graph evaluation

The best current graph is the four-workspace R2.1 option:

```text
apps/site
apps/content-compiler
packages/content
packages/study
```

That is an INFERRED implementation starting point, not a convention. `packages/study` should be merged into `apps/site` if implementation proves it has no independent ownership/reuse value. `apps/worker` remains unjustified until a real backend capability exists.

## Bun and dependency discipline

The root catalog centralizes coordinated versions but does not create dependency ownership. Each workspace that imports `effect`, `@effect/platform-browser`, `@effect/platform-bun`, `@effect/vitest`, or another external package must declare it directly.

Isolated linking is therefore the preferred default. A phantom import that succeeds only because another workspace/root installed the package is a defect. The future CI should include a dependency-tree/cohort audit and fail on duplicate Effect core versions or mismatched coordinated Effect adapters.

Use overrides/resolutions only for a specific transitive incompatibility or security/build issue. They are exception records, not normal version policy.

## Scripts and ordering

Root scripts should make the finite dependency order obvious:

```text
install
  -> typecheck/test as appropriate
  -> content compiler
  -> generated-content cleanliness
  -> Vite site build
  -> static/leak/size checks
  -> browser tests
  -> optional Cloudflare Worker validation
```

Independent workspace checks may run in parallel. Content generation must finish before site build when generated inputs are consumed by Vite/static generation. Long-running `dev`, `watch`, and `preview` processes remain foreground commands rather than task dependencies.

Bun `--filter` is recommended for selecting workspaces. Do not rely on undocumented/implicit dependency-order behavior as the correctness mechanism; encode cross-workspace prerequisites explicitly.

## TypeScript

Use distinct browser, Bun, service-worker, workerd, portable-package, and test configs. Shared packages must not inherit Bun/DOM/workerd host globals. The root shared config should contain only common language/compiler policy.

Project references are optional. Start with per-workspace no-emit checking and add references only if declaration output or measured incremental-build/editor needs justify the extra graph/configuration.

## Vite and Cloudflare

Bun owns package installation and command execution. Vite still owns browser transformation/dev/build. Generated HTML/content should be produced before Vite consumes it. Static-only Cloudflare deployment should not grow an empty Worker just to use Cloudflare tooling.

If a narrow Worker is later approved, keep its environment/bindings/workerd types separate from browser and Bun code, and run Cloudflare preview/integration using the specialist Cloudflare toolchain.

## Testing

Mixing runners is justified because the semantics differ:

- Bun test: pure deterministic logic and Bun-runtime compiler/tool tests;
- Vitest + `@effect/vitest`: Effect services, Layers, scopes, property tests, deterministic Effect time/random behavior;
- Playwright: real DOM, accessibility, IndexedDB, Cache Storage, Service Worker, offline/cross-tab and interaction semantics;
- workerd/Cloudflare test tooling: future Worker only.

Do not use fake browser implementations as the sole certification for IndexedDB transaction lifetime or Service Worker semantics.

## CI and cache policy

CI must install from the committed lockfile without mutation, run cohort/dependency checks, prove generated-content cleanliness, build from source, inspect emitted artifacts, and run real browser tests.

Cache package downloads/browser binaries where safe, but do not cache generated outputs as authority. A cache hit must never hide nondeterminism, a phantom dependency, or a dirty generated tree. Secrets are never cached.

## Bundle gates

R2.5 did not complete current production bundle measurements. Therefore R2.7 does not invent byte limits. Keep the build/route-closure gate structurally mandatory, but numeric thresholds remain provisional until R2.5 is rerun successfully.

## Evidence boundaries and limitations

The GitHub source and sibling R2 evidence establish the current Bun and Effect coordinates and the workspace/build recommendations above. This lane did not independently produce a complete current-package install and all required runtime probe outputs in the connected GitHub environment. Any fixture/runtime observation not durably committed under this branch should not be treated as OBSERVED proof.

The recommendations are intended to be small, auditable, and reversible. They do not authorize production scaffolding, a specific renderer, an IndexedDB provider, a backend, or domain decomposition by workspace naming convention.
