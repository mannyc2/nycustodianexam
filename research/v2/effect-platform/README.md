# Effect v4 platform/runtime research lane

This directory is the repository-backed second-pass research lane for current Effect v4 platform/runtime architecture.

## Immutable coordinates

- Project source: `agent/chat-corpus-reconciliation` at `645e885748c830f7a9cbbbe90ac0f31149bfc81c`
- Lane branch: `research/v2-effect-platform`
- Effect upstream source inspected: `Effect-TS/effect` at `436f10d1efccec308426532ff3f88df9a96434f3`
- Effect core source version: `4.0.0-rc.111`
- Bun current official version observed: `1.3.14`

## Evidence model

The lane uses the repository contract statuses:

- **CONFIRMED** — official source/docs/declarations establish the claim.
- **OBSERVED** — a committed reproducible runtime probe establishes the exact coordinate.
- **CORROBORATED** — strong secondary/production evidence.
- **INFERRED** — project recommendation.
- **UNKNOWN** — not established.
- **BLOCKED** — required evidence/probe unavailable.

Source existence, registry publication, runtime observation, and project adoption are tracked separately.

## Probe limitation

The available execution environment does not contain Bun, and outbound package installation/clone attempts cannot resolve external hosts. Therefore no genuine `bun.lock` or installed-package runtime probe is fabricated. Source and registry findings are published, while the missing Bun/browser/workerd runtime probes are explicitly marked **BLOCKED** and handed off as implementation gates.

See `raw-results/ENVIRONMENT.txt` and `fixtures/README.md`.
