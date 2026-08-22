# TypeScript configuration topology

Use runtime-specific configs rather than one repository-wide type environment.

## Root base

Keep a small shared base with strictness, module resolution, no implicit emit, and common language-level options. Do not place Bun, DOM, or workerd globals in the shared base.

## Browser / Vite

`apps/site/tsconfig.json` should include browser DOM libraries and Vite client types only where needed. Browser modules must not see Bun or Node globals accidentally.

## Bun compiler/tooling

`apps/content-compiler/tsconfig.json` may include Bun types and the runtime APIs needed by the finite compiler executable. Keep filesystem/process assumptions here, not in portable packages.

## Cloudflare workerd

Create a distinct workerd config only when a real Worker app exists. Use Cloudflare-generated/runtime types and Web platform libraries; do not inherit Bun types.

## Service worker

Use a worker-specific config with WebWorker libs and no DOM Window globals. The service worker remains a runtime entry within the site app unless independent build/release needs justify a workspace.

## Shared packages

Portable packages use ES libraries only and no host-global types. Any browser/Bun/workerd host value in a public signature is a dependency-boundary failure unless explicitly intentional.

## Tests

Keep test runner globals/configuration scoped to test configs. Browser E2E code may use Playwright types; Effect service tests use Vitest/@effect-vitest; Bun-native tests may use Bun test types.

## Project references

Do not add project references solely because the repository is a monorepo. Prefer per-workspace `tsc --noEmit`/tool-native checking and explicit root script ordering initially. Add references if measured incremental-build or editor correctness benefits outweigh config complexity and if the emitted/declaration graph is actually needed.
