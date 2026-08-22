# Source emission blocked

This workspace is configured with explicit dependencies and its intended source shape is defined in `../../PROBE-SPEC.md`.

Effect-bearing source is intentionally not emitted in this checkpoint because the exact `bun install` could not run and the shared contract requires reading the installed `node_modules/effect/AGENTS.md` before writing Effect fixture code. This is a gate, not an omission to be silently filled from the superseded v3 fixture.
