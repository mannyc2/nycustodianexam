# R2.1 — Latest Effect v4 core architecture and Bun workspace topology

You are a fresh repository-backed research agent for `mannyc2/nycustodianexam`.

Determine the strongest Effect-native program/module/service/Layer/runtime architecture for the browser-first study application and propose a small Bun workspace dependency topology under `apps/` and `packages/`. This is architecture research, not a scaffold.

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
  research/v2-effect-core-topology

Allowed paths:
  research/v2/effect-core-topology/**

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

Read completely:

- `product/FEATURE_SPEC.md`;
- `docs/OPEN.md`;
- the raw E04 and E08 architecture reports under `research/initial-pass/raw/archive/`;
- `research/initial-pass/REUSABLE-FINDINGS.md`;
- `research/initial-pass/REDO-REQUIRED.md`.

## Objective

Derive the architecture from latest Effect v4 services, Layers, Schema, errors, resources, runtime roots, and dependency direction—not from the first pass's `domain/application/ports/adapters/ui` tree.

The project has these runtime/executable surfaces:

- static/site generation;
- interactive browser study application;
- Bun content compiler/tooling;
- browser service worker;
- optional Cloudflare Worker;
- tests.

The product has these behavioral domains:

- versioned announcement profiles and content;
- question commitment and explanations;
- hazard-scene attempts;
- sessions and deterministic assembly;
- attempt events and materialized progress;
- review scheduling;
- offline pack staging and activation;
- correction submission.

## Research questions

### 1. Current v4 programming model

Establish current guidance and source behavior for:

- `Effect.gen`;
- named `Effect.fn`;
- Schema classes and tagged errors;
- `Context.Service`;
- `Context.Reference`;
- service identifiers;
- Layer constructors/composition/memoization;
- Scope and acquisition/finalizers;
- Fiber and structured concurrency;
- Schedule;
- Clock, DateTime, and Random;
- Queue/PubSub/Stream;
- Ref and current state primitives;
- ManagedRuntime;
- BunRuntime;
- `Layer.launch`;
- current testing primitives.

Identify what changed materially from the initial v3 reports.

### 2. Pure modules versus services

For each candidate capability decide whether it should be:

- a pure module/function;
- a Schema model;
- an Effect service;
- a Layer only;
- runtime-root wiring;
- a separate workspace package;
- private implementation inside an app/package.

Evaluate at least:

- content/profile registry;
- session assembler;
- attempt commit;
- progress materializer;
- review scheduler;
- pack installer/activator;
- checksum;
- clock/random;
- correction client;
- view/screen-state transitions.

Reject unnecessary capability wrappers.

### 3. Service and Layer topology

Propose current-v4 service definitions and focused Layer ownership for browser, Bun, service-worker, Worker, and test runtimes.

Answer:

- which service owns atomic attempt commit;
- whether repositories expose domain-level operations or raw IDB transactions;
- where configuration/default values use `Context.Reference`;
- where background fibers belong;
- which Layers are process/application scoped;
- where ManagedRuntime is appropriate;
- where a runtime should not exist.

### 4. Error architecture

Model expected failure families using current v4 patterns, including:

- content decode/invariant failures;
- profile/content incompatibility;
- storage unavailable/quota/transaction failures;
- pack checksum/closure/activation failures;
- session-version failure;
- network/timeout/offline failure;
- correction submission failure.

Distinguish absence, expected failure, reason errors if relevant, defects, and interruption. Avoid one huge error union when local service errors and boundary translation are clearer.

### 5. Bun workspace topology

Propose 2–4 competing small workspace graphs under:

```text
apps/
packages/
```

For every proposed app/package record:

- responsibility;
- runtime;
- public API;
- direct dependencies;
- prohibited dependencies;
- consumers;
- why it is a package instead of a module;
- whether it imports Effect at runtime;
- whether it uses Bun APIs.

Do not make `core`, `domain`, `ports`, or `adapters` default package names. A package graph must reflect actual dependency/runtime/ownership boundaries.

### 6. Dependency direction laws

Define import constraints that prevent:

- browser packages importing Bun APIs;
- shared models importing platform implementations;
- static generation importing interactive runtime accidentally;
- renderer packages owning persistence/domain rules;
- optional Worker code becoming a dependency of the static site;
- cyclic Layer composition.

### 7. Runtime entrypoints

Describe likely entrypoint patterns for:

- Bun content-compiler executable;
- browser interactive bootstrap;
- imperative DOM/renderer boundary;
- service worker events;
- Cloudflare fetch handler;
- tests.

Use current v4 guidance and code sketches. Do not invent a universal root runtime.

## Required probes

Create committed latest-v4/Bun fixtures that compile and test representative:

1. `Context.Service` with a focused Layer and named methods;
2. Schema-modeled expected errors;
3. one scoped background/resource Layer;
4. BunRuntime process entry;
5. browser ManagedRuntime/imperative bridge, if current guidance supports it;
6. Layer composition and test substitution.

Record exact commands and raw results. The probes are API/lifecycle evidence, not the application scaffold.

## Required outputs

In addition to shared outputs, create:

```text
CURRENT-V4-API-MAP.md
SERVICE-CANDIDATES.csv
ERROR-ARCHITECTURE.md
RUNTIME-ROOTS.md
WORKSPACE-TOPOLOGY-OPTIONS.csv
DEPENDENCY-LAWS.md
CODE-SKETCHES.md
fixtures/
raw-results/
```

`REPORT.md` must recommend one topology for later synthesis while clearly labeling it **INFERRED**, and list the conditions that would falsify it.
