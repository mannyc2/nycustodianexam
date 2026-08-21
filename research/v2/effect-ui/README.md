# Effect v4 UI state and rendering research

Status: COMPLETE

This lane researches UI state ownership, lifecycle, reactivity, and renderer choice for the NYCustodianExam browser-first study application.

## Coordinates

- Repository: `mannyc2/nycustodianexam`
- Immutable source branch: `agent/chat-corpus-reconciliation`
- Immutable source SHA: `8b0d26245c1d78fb0be4e79f874a7d8872056ceb`
- Research branch: `research/v2-effect-ui`
- Draft pull request: `#6`
- Research cutoff: `2026-08-21`

## Scope

The lane evaluates:

- `effect/unstable/reactivity`;
- current Effect v4 Atom and AtomRegistry APIs;
- official React, Solid, and Vue Atom bindings;
- Effect Scope and renderer lifecycle integration;
- renderer-neutral question-player and hazard-player state;
- direct DOM, standalone `lit-html`, Solid, and justified React or Preact use;
- objective renderer adoption and migration criteria.

It does not implement application code, add dependencies, choose a renderer by package availability alone, or weaken the invariant:

`durable IndexedDB commit succeeds -> reveal`

## Deliverables

- `REPORT.md`
- `UPSTREAM-BASELINE.md`
- `RENDERER-MATRIX.csv`
- `STATE-OWNERSHIP.md`
- `QUESTION-PLAYER-SPIKE.md`
- `MIGRATION-CRITERIA.md`
- `SOURCE-LEDGER.csv`
- `DECISION-MATRIX.csv`
- `OPEN-QUESTIONS.csv`
- `START-RECEIPT.md`
- `FINAL-RECEIPT.md`
- `MANIFEST.sha256`

## Evidence labels

- `CONFIRMED`: directly established from pinned repository source or an authoritative maintained product contract.
- `OBSERVED`: seen in a current package, release, or source coordinate, but not yet exercised in the target application.
- `CORROBORATED`: supported by more than one relevant primary source.
- `INFERRED`: an architectural conclusion drawn from confirmed or observed evidence.
- `UNKNOWN`: evidence is insufficient.
- `BLOCKED`: the requested check could not be performed in this lane and is explicitly handed off.

## Provenance limitations

The shared research contract and Effect v4 doctrine were absent from the immutable source SHA. They were read from the unmerged `research/curate-effect-v4-bun-prompts` branch under the user's explicit task authorization. Their unstamped source placeholder is recorded as a limitation rather than silently normalized.

The raw E01 and E03 UI reports named by the research index were not present in the immutable Git tree and were not recoverable from the available file library. Only their normalization summaries are treated as available prior evidence.
