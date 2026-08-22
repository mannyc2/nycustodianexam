# Current Effect v4 compiler fixture

This private Bun fixture tests the R2.6 boundary at the exact current research
coordinate: Effect `4.0.0-rc.111`, `@effect/vitest` `4.0.0-rc.111`, Bun
`1.3.14`, and official Effect tag commit
`648f566dd259898e7697c7fcb796183ccbc474ab`.

It is a research proof, not application code. It demonstrates:

- branded IDs and tagged domain records;
- local record checks in Effect Schema;
- all-error decoding with excess-property rejection and input reporting disabled;
- explicit relational gates with stable project diagnostic codes;
- review freshness tied to the exact image basis digest;
- `Schema.encodeSync` before canonical serialization;
- Draft 2020-12 JSON Schema generation;
- deterministic object and release SHA-256 digests.

Run from this directory:

```sh
bun install --frozen-lockfile
bun run typecheck
bun run test
bun run probe
```
