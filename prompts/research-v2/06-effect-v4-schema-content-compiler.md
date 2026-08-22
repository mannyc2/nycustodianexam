# R2.6 — Effect v4 Schema content compiler and publication gates

You are a fresh repository-backed research agent for `mannyc2/nycustodianexam`.

Refresh and deepen the machine-readable content compiler design using current Effect v4 Schema, Bun tooling, and the maintained publication invariants.

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
  research/v2-effect-schema-compiler

Allowed paths:
  research/v2/effect-schema-compiler/**

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

- `docs/FACTBASE.md`;
- `docs/SCOPE.md`;
- `docs/TAXONOMY.md`;
- `docs/OPEN.md`;
- `product/FEATURE_SPEC.md` data, content, authoring, publication, and QA sections;
- raw E05 report completely;
- geometry asset schema/evidence where relevant;
- current Effect Schema guide, source, migration docs, and JSON Schema support.

## Objective

Design the compiler that transforms reviewed authoring inputs into deterministic, validated publication artifacts.

Retain the normalized principle:

```text
Schema-valid != publication-valid
```

Use Schema for individual values and encoded/decoded boundaries. Use explicit registry/relational passes for whole-corpus eligibility.

## Entity coverage

Cover at least:

- SourceCitation;
- SourceLine;
- SupportedClaim;
- AnnouncementProfile;
- TestPlan;
- ToolConcept;
- ConfusionSet;
- Procedure;
- Question;
- QuestionOption;
- Explanation;
- ImageAsset;
- GeometryAsset and render/view manifests;
- HazardScene, HazardTarget, SceneDecoy;
- TranslationRecord;
- ContentPackManifest;
- ChangeLogEntry;
- progress export/import envelopes.

## Research questions

### 1. Current v4 Schema model

Establish current patterns for:

- `Schema.Class`;
- tagged unions;
- branded IDs;
- encoded/decoded representations;
- transformations;
- filters/refinements;
- annotations;
- ParseError/SchemaError;
- default values;
- recursive models;
- canonical encoding;
- JSON Schema generation;
- arbitrary/test generation;
- versioned schemas and migrations;
- tagged errors versus validation diagnostics.

Do not mechanically translate E05 APIs.

### 2. Authoring format and source locations

Compare authored JSON, YAML, TypeScript data, and generated intermediate formats.

Requirements:

- useful file/line/record/field diagnostics;
- stable IDs;
- deterministic discovery/order;
- no executable authoring data unless justified;
- exact source excerpts and provenance;
- review state;
- translations;
- geometry asset references.

Bun file APIs may be used by the compiler app but must not contaminate shared encoded models.

### 3. Compiler phases

Specify:

```text
discover source files
  -> decode unknown
  -> structural Schema validation
  -> normalize
  -> registry construction
  -> relational validation
  -> publication eligibility
  -> derived indexes/counts
  -> canonical encode
  -> content addressing/checksums
  -> static-page inputs
  -> pack manifests
  -> validate generated outputs
  -> publish manifest last
```

### 4. Relational gates

Design explicit passes for:

- ID uniqueness and references;
- claim→source-line closure;
- fact status/source rules;
- conflict retention;
- question key/options/rationales;
- audience/test-plan scope;
- entry/high-level separation;
- image/geometry rights/review;
- neutral/full descriptions;
- nonvisual equivalent;
- answer-bearing metadata leak;
- translation review;
- immutable version history;
- content-pack closure;
- profile/pack compatibility;
- generated counts;
- historical URL stability.

Do not hide these in unreadable per-field refinements.

### 5. Error UX

Design:

- stable diagnostic codes;
- severity;
- source location;
- record/field path;
- related-record locations;
- deterministic ordering;
- collect-independent-errors behavior;
- terminal report;
- CSV/JSON diagnostics;
- GitHub annotations in a later implementation;
- no accidental secure-content echo.

### 6. Bun workspace placement

Evaluate whether the compiler should be:

- `apps/content-compiler`;
- a script inside site;
- a package with a thin app entry;
- another small topology.

Identify reusable model/compiler packages only when more than one runtime consumes them. Avoid package proliferation.

### 7. Determinism

Specify canonical serialization, hashes, timestamps, environment inputs, and reproducible build tests. Generated artifacts must not vary because of filesystem order or locale.

## Required fixtures/probes

Create a private Bun fixture that:

- defines representative current-v4 Schemas;
- decodes valid/invalid records;
- builds a small registry;
- reports multiple relational failures;
- emits deterministic JSON and hashes;
- generates JSON Schema if currently supported;
- repeats the build and compares hashes.

Include fixtures for unknown, conflicting, superseded, translated, inaccessible, and scope-incompatible content.

## Required outputs

```text
ENTITY-MODEL.md
SCHEMA-API-MAP.md
AUTHORING-FORMAT-COMPARISON.csv
COMPILER-PHASES.md
RELATIONAL-GATES.csv
DIAGNOSTIC-CATALOG.csv
GENERATED-ARTIFACTS.md
WORKSPACE-PLACEMENT.md
DETERMINISM-CONTRACT.md
CODE-SKETCHES.md
fixtures/
raw-results/
```
