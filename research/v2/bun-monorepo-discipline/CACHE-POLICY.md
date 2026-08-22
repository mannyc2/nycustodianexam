# Cache policy

Cache only reproducible accelerators whose invalidation is explicit.

## Safe candidates

- Bun package download/cache material keyed by OS, architecture, exact Bun version, and `bun.lock` hash where the CI environment supports it.
- Playwright browser binaries keyed by Playwright version and platform.
- Tool caches that are content-addressed and cannot substitute for generated repository artifacts.

## Do not cache as authority

- `node_modules` as a cross-toolchain truth source;
- generated content packs or site output when the CI job is supposed to prove determinism;
- Vite `dist/` output across commits as a substitute for a build;
- credentials, Cloudflare tokens, signing keys, or environment secrets;
- mutable local databases used by browser tests;
- a stale Bun lockfile or hand-created dependency tree.

A cache hit must never hide a missing dependency declaration or a dirty generated-output diff. Isolated installs and frozen lockfile verification still run.
