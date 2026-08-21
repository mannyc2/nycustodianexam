# R2.8 — Testing, accessibility, performance, and observability

You are a fresh repository-backed research agent for `mannyc2/nycustodianexam`.

Define a current Effect v4/Bun verification system for domain workflows, browser semantics, offline behavior, accessibility, performance, and privacy-safe observability.

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
  research/v2-testing-accessibility-observability

Allowed paths:
  research/v2/testing-accessibility-observability/**

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

- `product/FEATURE_SPEC.md` acceptance/QA/privacy sections;
- `docs/LANDSCAPE.md` accessibility sections;
- raw first-pass testing recommendations across E04/E07/E08;
- latest Effect package testing guidance and `@effect/vitest`;
- official Bun test docs and compatibility caveat;
- Playwright, axe/ACT/WCAG, Web Vitals, Vite, and Cloudflare primary docs.

## Objective

Assign each test responsibility to the smallest truthful environment. Do not force all tests through Bun test, Vitest, jsdom, or Playwright.

## Test layers

Design:

- pure transition/property tests;
- Effect service/use-case tests;
- shared Layer tests;
- Schema/compiler fixtures;
- Bun-runtime integration tests;
- real-browser IndexedDB tests;
- multi-tab tests;
- service-worker lifecycle/offline tests;
- renderer/browser tests;
- Cloudflare Worker tests;
- static-output/SEO tests;
- print tests;
- geometry manifest/hash checks;
- bundle closure gates.

## Effect v4 testing

Establish current APIs and patterns for:

- `@effect/vitest`;
- test clocks/time;
- deterministic random;
- test services/Layers;
- interruption/finalizer assertions;
- log/span/metric testing;
- HttpApi in-memory testing if relevant;
- property/arbitrary generation.

Compare whether any Effect tests can run under Bun test and whether official support or compatibility exists. Do not assume compatibility from similar APIs.

## Accessibility gates

Specify automated and manual gates for:

- complete keyboard operation;
- native control semantics;
- focus order and visible focus;
- focus not obscured;
- programmatic focus after commit;
- live-region status;
- no correctness before durable commit;
- answer-bearing data absent from accessibility tree before reveal;
- text-equivalent question;
- zoned nonvisual hazard equivalent;
- 200%/400% zoom and reflow;
- forced colors;
- reduced motion;
- touch target size;
- timer control;
- no color-only states;
- print/large print;
- screen-reader/browser combinations.

State where automation cannot establish conformance.

## Failure injection

Design deterministic failures at every durable transition:

- IDB unavailable/quota/abort;
- commit retry;
- pack download/validation/activation;
- crash/reload;
- stale tab;
- service-worker termination;
- missing asset;
- corrupt content;
- network timeout/offline;
- correction endpoint failure;
- import/export partial failure.

## Performance

Coordinate with the bundling lane but define gates for:

- static route JS;
- player cold/incremental closure;
- hazard player;
- offline manager;
- service worker;
- optional GLB viewer;
- LCP/INP/CLS;
- storage/update latency;
- print generation;
- no preload leakage.

Use actual production artifacts and separate compressed files.

## Observability/privacy

Design local diagnostic and optional consented first-party events for:

- content validation;
- storage failures;
- pack state;
- restoration;
- asset failure;
- correction submission;
- Web Vitals;
- experiment assignments.

Exclude question text, free-form submissions, advertising IDs, and unnecessary location/identity. Define redaction and retention.

## Required probes

Commit representative tests in private fixtures:

- Effect service test with test Layer;
- clock/random determinism;
- interruption/finalizer;
- browser durable-commit failure and no-reveal assertion;
- accessibility-tree pre-reveal scan;
- offline reload;
- bundle gate sample;
- Cloudflare test harness if current tooling permits.

Record which runners execute each fixture.

## Required outputs

```text
TEST-LAYER-MATRIX.csv
RUNNER-COMPARISON.csv
EFFECT-V4-TEST-PATTERNS.md
ACCESSIBILITY-GATES.md
BROWSER-AT-MATRIX.csv
FAILURE-INJECTION-MATRIX.csv
PERFORMANCE-GATES.csv
OBSERVABILITY-EVENTS.csv
PRIVACY-REDACTION.md
CI-RESPONSIBILITY-MAP.md
fixtures/
raw-results/
```
