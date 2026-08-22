# CI plan

## Recommended sequence

1. Checkout exact commit.
2. Install the exact Bun version from the root `packageManager` pin.
3. Run `bun ci` with the committed text `bun.lock`; fail if resolution would mutate it.
4. Verify one Effect cohort and reject duplicate/mismatched `effect` / `@effect/*` coordinates.
5. Run generated-content cleanliness checks: compiler output must be reproducible and `git diff --exit-code` clean where generated artifacts are committed.
6. Typecheck portable packages and runtime workspaces with their own tsconfigs.
7. Run pure/Bun tests.
8. Run Effect service/Layer tests with Vitest + `@effect/vitest`.
9. Run content compiler/publication-gate tests.
10. Build static/generated site inputs, then run Vite production build.
11. Run static-output and answer-leak checks against emitted artifacts.
12. Run route-closure/bundle measurement. Numeric byte gates remain provisional until R2.5 has current measurements.
13. Run Playwright browser tests for browser persistence, service-worker/offline behavior, accessibility, and representative interaction flows.
14. If an optional Cloudflare Worker exists, run workerd/Cloudflare integration and preview validation. Static-only deployments do not require an empty Worker test stage.

## Ordering rule

Bun filters are useful selection mechanisms; do not assume they are a full dependency-aware task DAG. Encode content-generation and build prerequisites explicitly in root scripts or a small repository-owned orchestration script. Parallelize only independent workspaces/stages.

## Long-running processes

Dev/preview/watch commands are foreground processes and should not be dependencies of finite CI commands. CI builds finite artifacts, starts a bounded preview/server when a browser suite needs it, runs the suite, and tears it down.

## External task runner

Do not add Turbo, Nx, or another task runner initially. Add one only if measured workspace growth demonstrates a real need for persistent task graph caching, remote execution, or orchestration semantics that a small Bun-owned script cannot provide clearly.
