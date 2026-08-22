# Bun current coordinate

Status: CONFIRMED / OBSERVED for the lane coordinate.

- Bun: `1.4.0`
- Tag: `bun-v1.4.0`
- Tag commit: `34cbb9a40b4bd1bd767d134a7065e66c2432a676`
- Effect v4 cohort evaluated: `4.0.0-rc.111`
- Effect source main observed during lane: `1144032cedda7b5eacc1ebf980d06957c7a59ddf`
- `effect`, `@effect/platform-browser`, `@effect/platform-bun`, and `@effect/vitest` source manifests all report `4.0.0-rc.111` at that Effect source coordinate.

Project policy: pin Bun exactly in `packageManager`, use the same exact version in CI setup, and update only through an explicit toolchain bump that regenerates `bun.lock` and reruns install/build/test/browser probes.

Do not infer support ranges from one exact probe coordinate.
