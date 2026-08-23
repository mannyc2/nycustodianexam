# R2.90 — architecture synthesis

This is the first cross-lane synthesis of the second-pass Effect v4/Bun research.
It proposes the initial implementation architecture and sequence; it does not
scaffold the application or amend maintained product authority.

## Proposed first lock

- Effect cohort: exact synchronized `4.0.0-rc.111`, rechecked at scaffold time.
- Bun: exact `1.4.0`, with the full workspace gate run before adoption.
- Initial graph: `apps/site`, `apps/content-compiler`, `packages/content`.
- Static/reference routes: semantic HTML with zero Effect closure.
- Interactive player: lazy direct-DOM island, one browser `ManagedRuntime`, no
  Atom/reactivity dependency.
- Persistence: project-owned contracts with the first-party Effect IndexedDB
  provider as a conditional implementation; `idb` is the ready fallback.
- Offline: native service-worker lifecycle, Cache Storage for HTTP bytes,
  IndexedDB for application truth.
- Delivery: Vite and Cloudflare Static Assets; no Worker until an endpoint exists.
- Verification: Bun test, `@effect/vitest`, real Playwright browsers,
  accessibility/manual gates, artifact leak scans, and route-closure measurement.
- Content: the recovered R2.6 compiler boundary; manifest-last publication.

The visual-production method remains outside the runtime graph. Current maintainer
direction permits Codex-native generation; final accepted image bytes become
immutable inputs and still pass mechanical/content, rights, accessibility,
security/leak, and scene/hotspot review.

## Navigation

- [ARCHITECTURE-DECISION-PROPOSAL.md](ARCHITECTURE-DECISION-PROPOSAL.md)
- [REPORT.md](REPORT.md)
- [DECISION-MATRIX.csv](DECISION-MATRIX.csv)
- [CONFLICTS.md](CONFLICTS.md)
- [WORKSPACE-GRAPH.md](WORKSPACE-GRAPH.md)
- [SERVICE-LAYER-TOPOLOGY.md](SERVICE-LAYER-TOPOLOGY.md)
- [RUNTIME-ROOTS.md](RUNTIME-ROOTS.md)
- [CONTENT-COMPILER-DECISION.md](CONTENT-COMPILER-DECISION.md)
- [OFFLINE-STORAGE-DECISION.md](OFFLINE-STORAGE-DECISION.md)
- [UI-RENDERER-DECISION.md](UI-RENDERER-DECISION.md)
- [DELIVERY-BUNDLE-DECISION.md](DELIVERY-BUNDLE-DECISION.md)
- [TEST-ACCESSIBILITY-DECISION.md](TEST-ACCESSIBILITY-DECISION.md)
- [VERTICAL-SLICE-PLAN.md](VERTICAL-SLICE-PLAN.md)
- [IMPLEMENTATION-SEQUENCE.md](IMPLEMENTATION-SEQUENCE.md)
- [LANE-LEDGER.csv](LANE-LEDGER.csv), [SOURCE-LEDGER.csv](SOURCE-LEDGER.csv),
  [OPEN-QUESTIONS.csv](OPEN-QUESTIONS.csv), and [UNRESOLVED.csv](UNRESOLVED.csv)
- [FINAL-RECEIPT.md](FINAL-RECEIPT.md) and
  [MANIFEST.sha256](MANIFEST.sha256)

Maintained authority, if the proposal is accepted, must be updated in a separate
maintainer-reviewed reconciliation PR.
