# R2.90 — Architecture research synthesis and decision proposal

You are a fresh repository-backed research agent for `mannyc2/nycustodianexam`.

Reconcile the completed second-pass GitHub research lanes into a proposed Effect v4/Bun architecture and implementation sequence. Do not implement the application or edit maintained authority.

No previous conversation is an input. GitHub and the repository corpus are the durable source of project context.

## Immutable source

```text
Repository:
  mannyc2/nycustodianexam

Source branch:
  agent/chat-corpus-reconciliation

Required source SHA:
  {{POST_CURATION_SOURCE_SHA}}

Output branch:
  research/v2-architecture-synthesis

Allowed paths:
  research/v2/architecture-synthesis/**

Draft PR base:
  agent/chat-corpus-reconciliation
```

This prompt is not runnable until the SHA placeholder is replaced.

## Mandatory shared contract

Read and obey completely:

- `prompts/research-v2/00-SHARED-RESEARCH-CONTRACT.md`;
- `research/prompt-curation/EFFECT-V4-BUN-RESEARCH-DOCTRINE.md`;
- `research/prompt-curation/EFFECT-SKILL-ADAPTATION.md`.

Use the connected **`@GitHub`** capability directly. Before extended research, create the branch, commit/push `START-RECEIPT.md`, and open the draft PR. Stop if GitHub writes are unavailable.

You may change only the allowed path. Do not implement the application or edit maintained authority.

## When to run

Run only after the intended P0/P1 lane PRs are complete or explicitly marked missing. Do not wait or poll. Record which lanes were available.

Expected lanes:

- `research/v2-effect-core-topology`;
- `research/v2-effect-ui-reactivity`;
- `research/v2-effect-platform-runtimes`;
- `research/v2-effect-indexeddb-offline`;
- `research/v2-effect-browser-bundling`;
- `research/v2-effect-schema-compiler`;
- `research/v2-bun-monorepo-discipline`;
- `research/v2-testing-accessibility-observability`;
- optionally hazard and geometry lanes.

Read exact PR files, raw probe outputs, and final receipts. Do not rely only on chat summaries.

## Reconciliation law

- Maintained product/exam constraints outrank research recommendations.
- Current official v4 source outranks v3-era assumptions.
- Exact runtime observations outrank untested expectations at that coordinate.
- An observation at one coordinate does not prove a version range.
- Stable APIs are preferred, but latest v4 is mandatory; unstable APIs require isolation and explicit risk, not automatic rejection or acceptance.
- Runtime truth outranks abstraction symmetry.
- Effect does not have to wrap pure values or render the DOM.
- Bun workspace ownership does not collapse browser/Bun/workerd/service-worker runtimes.
- Static indexable HTML, durable commit-before-reveal, accessibility, offline packs, deterministic print, and security boundaries are non-negotiable.
- Do not manufacture consensus by counting duplicate inherited premises.

## Required decisions/proposals

Synthesize:

1. exact Effect v4 cohort for the first implementation lock;
2. Bun version and root workspace policy;
3. initial `apps/` / `packages/` graph and dependency laws;
4. services and Layer topology;
5. runtime roots;
6. error architecture;
7. Schema/content compiler;
8. IndexedDB provider and transaction boundary;
9. pack update and cross-tab protocol;
10. service-worker boundary;
11. UI state/reactivity and renderer;
12. static/interactive chunk boundary and budgets;
13. Vite/Cloudflare direction;
14. test runners/responsibilities;
15. accessibility gates;
16. observability/privacy;
17. optional Worker endpoint;
18. unresolved decisions and implementation measurements.

Each decision must include:

- supporting lanes/files;
- evidence status;
- alternatives;
- rationale;
- instability;
- measurement still required;
- adoption recommendation:
  - accept now;
  - accept provisionally;
  - implementation spike;
  - defer;
  - reject.

## First implementation vertical slice

Design the first slice across the recommended workspaces:

```text
source-backed question fixture
  -> v4 Schema decode
  -> relational compiler gate
  -> generated semantic HTML
  -> interactive player bootstrap
  -> v4 service/use case
  -> durable IndexedDB commit
  -> typed failure/no reveal
  -> successful reveal
  -> focus/live-region behavior
  -> reload/offline restoration
  -> bundle/accessibility/browser tests
  -> Cloudflare preview
```

Specify exact acceptance criteria and stop conditions. Do not implement it.

## Required outputs

```text
LANE-LEDGER.csv
CONFLICTS.md
ARCHITECTURE-DECISION-PROPOSAL.md
WORKSPACE-GRAPH.md
SERVICE-LAYER-TOPOLOGY.md
RUNTIME-ROOTS.md
CONTENT-COMPILER-DECISION.md
OFFLINE-STORAGE-DECISION.md
UI-RENDERER-DECISION.md
DELIVERY-BUNDLE-DECISION.md
TEST-ACCESSIBILITY-DECISION.md
VERTICAL-SLICE-PLAN.md
IMPLEMENTATION-SEQUENCE.md
UNRESOLVED.csv
```

The draft PR should clearly say that maintained authority will be updated in a separate maintainer-reviewed reconciliation PR.
