# R2.90 — reconciled architecture synthesis

This is the final cross-lane synthesis of the second-pass Effect v4/Bun research,
updated after R2.6, the R2.10 evidence recovery, and the maintained Codex-native
visual-authoring decision merged to `main`.

It does not redo those lanes. It consumes their completed outputs and resolves
the synthesis statements that were provisional in the earlier R2.90 draft.

## Proposed first lock

- Effect cohort: exact synchronized `4.0.0-rc.111`, rechecked at scaffold time.
- Bun: exact `1.4.0`, with the full workspace gate before adoption.
- Initial graph: `apps/site`, `apps/content-compiler`, `packages/content`.
- Static/reference routes: semantic HTML with zero Effect closure.
- Interactive player: lazy direct-DOM island, one browser `ManagedRuntime`, no
  Atom/reactivity dependency initially.
- Persistence: project-owned contracts; test the first-party Effect IndexedDB
  provider, with `idb` as the ready fallback.
- Offline: native service-worker lifecycle, Cache Storage for HTTP bytes, and
  IndexedDB for application truth.
- Delivery: Vite and Cloudflare Static Assets; no Worker until an endpoint exists.
- Verification: Bun test, `@effect/vitest`, real Playwright browsers,
  accessibility/manual gates, leak scans, and measured route closures.
- Content: merged R2.6 Schema/registry/gate compiler with manifest-last
  publication.
- Visuals: Codex-native generation outside runtime; public released samples may
  guide high-level style; exact accepted raster bytes enter the compiler.

All Tier A/B concepts remain launch scope. A vertical slice and visual pilot
sequence work and establish measurements; they do not shrink the launch corpus.

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

The remaining open items are implementation measurements and per-content release
gates, not missing R2.6/R2.9/R2.10 architecture research or a visual-authority
conflict.
