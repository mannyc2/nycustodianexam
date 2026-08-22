# R2.2 - Effect v4 UI state, reactivity, lifecycle, and renderer integration

This lane determines how the browser UI should consume Effect v4 application logic without turning Effect or direct DOM code into a renderer framework.

## Result

The recommended boundary is:

```text
semantic DOM or renderer event
  -> semantic command
  -> one long-lived Effect runtime executes a use case
  -> typed result and renderer-neutral immutable snapshot
  -> renderer updates semantic DOM
  -> explicit focus, live-region, or scroll effect
```

Durable IndexedDB data remains authoritative. Effect owns asynchronous workflows, typed failures, services, Layers, structured lifetime, and persistence settlement. The renderer owns DOM mechanics and high-frequency interaction scratch state. `effect/unstable/reactivity` and the coordinated Atom packages are optional unstable adapters, not mandatory state authority.

The renderer decision remains provisional. Disciplined direct DOM is the baseline. `lit-html@3.3.3` is the smallest declarative candidate prepared for a matched Bun/Vite/native-browser rerun. Solid is the next candidate only if measured complexity exceeds the migration triggers. React, Preact, and Vue are not justified by this product's current requirements alone.

## Evidence status

- CONFIRMED: current Effect v4 source contracts at `effect@4.0.0-rc.111`.
- OBSERVED: pure state tests, JavaScript syntax, static precommit leak scan, policy-safe Chromium behavior for direct DOM and the native-template negative control, retry idempotency, unknown-outcome reconciliation, focus, live regions, restoration, and disposal.
- BLOCKED: Bun installation, installed-package guidance, real Effect Schema execution, native IndexedDB, the actual lit-html browser arm, and Vite production bundle closure.

No `bun.lock`, installed-package result, native IndexedDB result, or production bundle number was fabricated.

## Files

- `REPORT.md` - synthesis and recommendation.
- `V4-REACTIVITY-MAP.md` - current Ref, PubSub, Stream, Reactivity, Atom, registry, and binding map.
- `STATE-OWNERSHIP.md` - explicit ownership model for all required UI states.
- `RENDERER-COMPARISON.csv` - candidate comparison.
- `EFFECT-RENDERER-BOUNDARY.md` - runtime and adapter boundary.
- `QUESTION-PLAYER-SPIKE-SPEC.md` - matched spike and rerun contract.
- `MIGRATION-TRIGGERS.md` - objective renderer adoption triggers.
- `ANTI-CUSTOM-FRAMEWORK.md` - stop conditions for direct DOM.
- `SOURCE-LEDGER.csv`, `DECISION-MATRIX.csv`, `OPEN-QUESTIONS.csv` - evidence and handoff ledgers.
- `fixtures/question-player/` - fixture source.
- `raw-results/` - exact probe results and blockers.
