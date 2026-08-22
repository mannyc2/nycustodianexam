# R2.5 private bundle lab

Status: **workspace/configuration skeleton published; install and Effect source emission blocked**

The fixture intentionally mirrors the lane-prescribed topology:

- `apps/static-reference`
- `apps/question-player-direct-dom`
- `apps/question-player-renderer-candidate`
- `apps/service-worker`
- `apps/optional-worker`
- `packages/fixture-content`
- `packages/fixture-effect-services`

The root uses Bun workspaces, a version catalog, exact coordinates, `workspace:*` internal edges, and the isolated linker.

## Why no `bun.lock` is committed yet

The measurement environment has no Bun binary and cannot resolve `registry.npmjs.org`. The Vite 8 native Rolldown binding also could not be bootstrapped through the available file transport. Therefore `bun install` never ran. A handwritten lockfile would be false evidence and is prohibited.

## Why Effect entrypoint source is not emitted yet

The shared research contract requires reading the installed `node_modules/effect/AGENTS.md` after the exact install and before writing Effect fixture code. Upstream source guidance was read for methodology, but the installed-package gate could not be satisfied. `PROBE-SPEC.md` records the exact source shapes to implement on the first runnable pass.

Pure/no-Effect fixtures are included where doing so cannot misrepresent the blocked install state.
