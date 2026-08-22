# Dependency cohort

Status: **PINNED FOR R2.5 FIXTURE; RUNTIME INSTALL BLOCKED**

Observed/published coordinates were rechecked on 2026-08-21 UTC. The first-pass Effect v3 recommendation and its package coordinates are superseded and were not reused as measurement inputs.

| Coordinate | Exact version/ref | Status | Role |
| --- | --- | --- | --- |
| Bun | `1.4.0` | stable release | package manager/runtime for fixture orchestration |
| `effect` | `4.0.0-rc.111` | v4 release candidate | core Effect measurement cohort |
| `@effect/platform-browser` | `4.0.0-rc.111` | v4 release candidate | IndexedDB and browser HTTP probes |
| `@effect/platform-bun` | `4.0.0-rc.111` | v4 release candidate | cohort completeness / Bun-side probe support if needed |
| Vite | `8.2.2` | stable release | production browser build tool |
| Rolldown | `1.2.5` | stable release; compatible with Vite `~1.2.4` | Vite native bundler implementation; explicitly overridden for a non-drifting fixture |
| Terser | `5.50.0` | stable release | minifier comparison candidate |
| Preact | `10.29.8` | stable release | small declarative renderer comparison |
| `@cloudflare/vite-plugin` | `1.53.1` | stable release | optional Worker fixture |
| Wrangler | `4.125.0` | stable release | Cloudflare Worker validation/deploy tooling coordinate |

## Effect status gate

`effect@4.0.0-rc.111` is the newest published v4 line observed for this lane. npm's `latest` dist-tag still points to v3, so the fixture deliberately names the v4 RC exactly instead of using an unqualified `effect@latest`.

The current upstream `effect` package declares `sideEffects: []`. The browser platform package is on the same RC counter. Current v4 browser IndexedDB support lives in `@effect/platform-browser/IndexedDb`; browser fetch HTTP is exposed by `@effect/platform-browser/BrowserHttpClient` but reuses the `effect/unstable/http` stack. Atom/reactivity remains under `effect/unstable/reactivity`, so it is a measurement subject, not a production-stability recommendation.

## Bun workspace discipline

The fixture root is `private: true`, uses Bun workspaces under `apps/*` and `packages/*`, uses a root catalog, uses `workspace:*` for internal edges, declares all direct external imports explicitly, and sets `linker = "isolated"` in `bunfig.toml`.

A real `bun.lock` is intentionally **absent** because Bun could not be executed and registry DNS was unavailable in the measurement environment. Creating a handwritten lockfile would violate the lane's reproducibility requirements. The first successful rerun must execute `bun install`, inspect the exact installed `node_modules/effect/AGENTS.md`, then commit the generated text lockfile before any Effect probe source is emitted or measured.

## Cloudflare and renderer scope

Cloudflare tooling is isolated to the optional Worker fixture; it is not part of the static/reference or browser-player base closure. Preact is a comparison candidate only and does not imply a maintained UI-framework decision.
