# Probe specification

This file defines the source shapes that must be emitted after the Bun install gate succeeds. It is deliberately a specification, not Effect source code: the shared contract requires reading the installed `node_modules/effect/AGENTS.md` before writing Effect fixture code, and the exact package could not be installed in this environment.

| Probe | Intended entrypoint | Key imports / behavior | Build surface |
| --- | --- | --- | --- |
| P01 | tiny progressive-enhancement script | no Effect; one DOM event | static reference |
| P02 | basic executable Effect | `effect/Effect`; run a synchronous workflow | isolated |
| P03 | Schema decode + execution | `effect/Schema`, `effect/Effect` | isolated |
| P04 | service/layer | current `Context.Service` + `Layer` pattern | isolated |
| P05 | browser IndexedDB | `@effect/platform-browser/IndexedDb` plus minimal Effect execution | isolated browser |
| P06 | Stream | `effect/Stream` and a bounded stream run | isolated |
| P07 | reactivity | `effect/unstable/reactivity/Atom` minimal live atom | isolated; unstable |
| P08 | browser HTTP | `@effect/platform-browser/BrowserHttpClient` fetch layer and a nonexecuted request construction path | isolated browser |
| P09 | Worker HTTP/HttpApi | current `effect/unstable/http` / `effect/unstable/httpapi` minimal worker-relevant graph | optional Worker; unstable |
| P10 | question player direct DOM | fixture content + Effect-managed commit-before-reveal workflow + imperative DOM controller | browser player |
| P11 | question player renderer candidate | same domain/use-case surface as P10 + Preact renderer only | browser player |
| P12 | native service worker | no Effect; install/activate/fetch shell | service worker |
| P13 | Effect service worker | equivalent bounded service-worker behavior using current Effect v4 | service worker |

## Required variants

For P02–P09, create both namespace/barrel and narrow-subpath import variants where the current public surface permits it. Build each variant in a clean output directory and compare route closure, not merely entry-chunk bytes.

For P10/P11, keep fixture content and domain behavior identical so the renderer delta is attributable. For P12/P13, keep cache/event behavior equivalent.

## Measurement rules

For every emitted JavaScript chunk record raw bytes, independent `gzip -9` bytes, Brotli quality 11 bytes, source-map bytes separately, content hash, static imports, dynamic imports, and entry/chunk identity. Route closures must parse the Vite manifest and independently compress every fetched chunk; dynamic chunks are reported separately from initial closure.

Run the full build twice from clean output directories and compare hashes. Record wall-clock duration for each build. Verify the installed tree resolves one Effect cohort and no workspace relies on undeclared dependencies.
