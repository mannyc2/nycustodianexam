# R2.7 — Bun monorepo, workspaces, build, and CI discipline

You are a fresh repository-backed research agent for `mannyc2/nycustodianexam`.

Define current Bun-native monorepo and operational practices for the future `apps/` / `packages/` repository without prematurely scaffolding the application.

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
  research/v2-bun-monorepo-discipline

Allowed paths:
  research/v2/bun-monorepo-discipline/**

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

## Required additional reading

Read:

- the architecture constraints and prompt doctrine;
- every P0 lane PR available at execution time, without waiting for missing lanes;
- official Bun docs/source for workspaces, catalogs, isolated installs, lockfile, install/CI, filters/scripts, lifecycle/trust, TypeScript, tests, bundling, and Node compatibility;
- official Vite and Cloudflare Vite plugin docs;
- current Effect skill and v4 package metadata.

## Objective

Produce an operationally precise Bun workspace baseline and evaluate candidate package graphs supplied by the core architecture lane. This lane owns workspace mechanics, not domain decomposition by convention.

## Research questions

### 1. Root package and workspaces

Specify current valid configuration for:

- private root package;
- `apps/*`, `packages/*`;
- exact Bun version pin strategy;
- `packageManager` field if appropriate;
- workspaces object versus array;
- catalogs for Effect cohort and shared tooling;
- `workspace:*`;
- isolated linker configuration;
- text `bun.lock`;
- frozen CI;
- minimum release age if appropriate;
- trusted lifecycle dependencies;
- overrides/resolutions only when required.

### 2. Effect dependency cohort

Design enforcement for:

- one exact Effect v4 version;
- matching `@effect/platform-*`, `@effect/atom-*`, `@effect/vitest`, and other ecosystem versions;
- root dev `effect` for installed AGENTS/source access;
- explicit runtime dependencies in consumers;
- no phantom dependency imports;
- duplicate/cohort mismatch diagnostics.

Research Bun commands and lockfile inspection that can enforce this.

### 3. Script/task strategy

Evaluate:

- root scripts;
- workspace scripts;
- `bun --filter`;
- sequential versus parallel execution;
- dependency-order behavior;
- watch/dev processes;
- long-running tasks;
- build/content/test/size/preview commands;
- whether any external task runner is justified.

Do not add a task runner without a demonstrated gap.

### 4. TypeScript configuration

Design separate configs for:

- browser/Vite;
- Bun compiler/tooling;
- Cloudflare workerd;
- service worker;
- shared packages;
- tests.

Do not put Bun types in every package. Evaluate project references versus no-emit checking and workspace build order.

### 5. Vite and Cloudflare under Bun

Establish commands and ownership for:

- Vite dev/build;
- generated HTML inputs;
- Cloudflare Vite plugin;
- Wrangler;
- preview environments;
- static-only deployment;
- optional Worker;
- environment variables and bindings.

Bun manages dependencies/scripts but does not replace specialist tools by decree.

### 6. Testing

Compare:

- Bun test for pure/Bun-runtime tests;
- current Effect official testing integration;
- Vitest;
- Playwright;
- Cloudflare test tooling.

Determine which test types use which runner and whether mixing runners is justified.

### 7. CI and caching

Design a future CI sequence around:

- setup-bun;
- `bun ci`;
- lockfile integrity;
- generated-content cleanliness;
- typecheck;
- unit/effect tests;
- browser tests;
- bundle budgets;
- static-output checks;
- Cloudflare preview.

Specify cache keys and avoid caching secrets or generated outputs that hide nondeterminism.

### 8. Package topology review

Assess candidate graphs against:

- dependency direction;
- workspace count;
- independent runtime/build need;
- duplicate code risk;
- circular imports;
- static versus interactive boundary;
- browser versus Bun/workerd types;
- no universal `core`.

Recommend a small initial graph and alternatives, clearly **INFERRED**.

## Required probes

Create a private sample Bun workspace under the lane directory and commit:

- root package/workspaces/catalog;
- isolated linker configuration;
- two apps and two packages sufficient to exercise dependency direction;
- one Effect cohort dependency;
- filter scripts;
- type configs for Bun/browser;
- `bun.lock`;
- raw `bun ci`, filtering, and undeclared-dependency results;
- one known lifecycle-script trust probe using a safe fixture.

This is a research harness, not the product scaffold.

## Required outputs

```text
BUN-CURRENT-COORDINATE.md
ROOT-CONFIG-OPTIONS.md
EFFECT-COHORT-POLICY.md
SCRIPT-MATRIX.csv
TSCONFIG-TOPOLOGY.md
TEST-RUNNER-RESPONSIBILITIES.csv
CI-PLAN.md
CACHE-POLICY.md
PACKAGE-GRAPH-REVIEW.csv
RECOMMENDED-INITIAL-GRAPH.md
fixtures/
raw-results/
```
