# Start receipt: Effect v4 UI state and rendering

Status: IN PROGRESS

- Repository: `mannyc2/nycustodianexam`
- Source branch: `agent/chat-corpus-reconciliation`
- Resolved immutable source SHA: `8b0d26245c1d78fb0be4e79f874a7d8872056ceb`
- Output branch: `research/v2-effect-ui`
- UTC start time: `2026-08-21T19:15:43Z`
- Allowed path: `research/v2/effect-ui/**`
- GitHub access: branch creation and repository writes CONFIRMED through connected `@GitHub`
- Research cutoff: `2026-08-21`

## Intended scope

Documentation-only research against the latest available Effect v4 line covering:

- `effect/unstable/reactivity`;
- current Atom APIs and official React, Solid, and Vue bindings;
- lifecycle and `Scope` integration;
- renderer-neutral screen state;
- direct DOM, a small declarative renderer, Solid, and justified Preact/React candidates;
- Effect-native Atom integration without selecting a renderer merely because bindings exist;
- the real question player and hazard player as complexity tests;
- state ownership between Effect/application logic and renderer-local concerns;
- objective renderer adoption and migration criteria;
- preservation of `durable IndexedDB commit succeeds -> reveal`.

No application code, production dependency changes, workspace scaffolding, renderer adoption, merge, or force-push is authorized.

## Source-coordinate note

The requested `prompts/research-v2/00-SHARED-RESEARCH-CONTRACT.md` is not present at the resolved immutable source. It was located on the unmerged curation branch `research/curate-effect-v4-bun-prompts` and is being followed as an explicit task-supplied operating contract, with that provenance and the unstamped placeholder limitation to be recorded in the final source ledger.

The curation branch recorded Effect repository commit `436f10d1efccec308426532ff3f88df9a96434f3` and observed package version `4.0.0-rc.111`; this is only an initial historical coordinate. This lane will establish the actual latest coordinated Effect v4 and Atom package coordinates before making version-sensitive conclusions.
