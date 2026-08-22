# R2.1 - Effect v4 core architecture and Bun workspace topology

Status: complete architecture/source research; runtime fixture execution BLOCKED by the network-isolated runner.

This directory is the durable output for R2.1. It derives a small program, service,
Layer, runtime, error, and workspace architecture for the NY Custodian Exam product
from the immutable repository source and the latest Effect v4 release-candidate
coordinates available on 2026-08-21.

## Coordinates

- Project source: `agent/chat-corpus-reconciliation@00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Effect source: `Effect-TS/effect@436f10d1efccec308426532ff3f88df9a96434f3`
- Effect core package: `effect@4.0.0-rc.111`
- Bun platform package source coordinate: `@effect/platform-bun@4.0.0-rc.111`
- Bun: `1.4.0`
- Output branch: `research/v2-effect-core-topology`
- Draft PR: `#11`

Effect v4 is still a release candidate at this coordinate. Core modules used by the
recommendation are stable package exports. No `effect/unstable/*` API is required
by the recommended four-workspace graph.

## Read order

1. `REPORT.md`
2. `CURRENT-V4-API-MAP.md`
3. `SERVICE-CANDIDATES.csv`
4. `ERROR-ARCHITECTURE.md`
5. `RUNTIME-ROOTS.md`
6. `WORKSPACE-TOPOLOGY-OPTIONS.csv`
7. `DEPENDENCY-LAWS.md`
8. `CODE-SKETCHES.md`
9. `SOURCE-LEDGER.csv`
10. `DECISION-MATRIX.csv`
11. `OPEN-QUESTIONS.csv`
12. `fixtures/current-v4-core/`
13. `raw-results/`
14. `FINAL-RECEIPT.md`
15. `MANIFEST.sha256`

## Evidence boundary

The two raw E04/E08 reports named by the lane prompt are absent from the complete
repository tree and code index. That is recorded as an input gap. Closed, unmerged
PR #5 was inspected completely as preliminary evidence, but none of its conclusions
were treated as independent authority.

The fixture source is committed for reproducibility. The runner could not acquire
Bun or npm packages because outbound DNS/TCP was unavailable, so no truthful
`bun.lock`, compile result, test result, or runtime result could be produced. Those
requirements are marked BLOCKED rather than simulated.
