# R2.5 — Effect v4 browser bundling under Bun workspaces

You are a fresh repository-backed research agent for `mannyc2/nycustodianexam`.

Produce exact latest-v4 browser bundle measurements and a route/chunk discipline using Bun workspaces and the selected Vite/Cloudflare build path.

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
  research/v2-effect-browser-bundling

Allowed paths:
  research/v2/effect-browser-bundling/**

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

- the complete raw E02 bundling report;
- the normalized disposition and reusable findings;
- `product/FEATURE_SPEC.md` route/surface requirements;
- current Effect package exports/sideEffects and relevant transitive dependencies;
- current Vite and Cloudflare Vite plugin official docs;
- current Bun workspace/catalog/isolated-install docs.

The previous report's Effect v3 production choice is superseded. Its measurement methodology is input, not a current result.

## Required fixture workspace

Under the lane directory create a private Bun workspace fixture with:

```text
apps/
  static-reference/
  question-player-direct-dom/
  question-player-renderer-candidate/
  service-worker/
  optional-worker/
packages/
  fixture-content/
  fixture-effect-services/
```

This is a measurement harness only. Pin and commit:

- exact latest Effect v4 cohort;
- exact Bun;
- exact Vite;
- exact Cloudflare tooling where used;
- renderer candidates;
- `bun.lock`;
- build configs;
- raw manifests/results.

Use isolated installs and verify only one Effect cohort resolves.

## Isolated Effect fixtures

Measure at minimum:

1. no Effect / tiny progressive enhancement;
2. basic executable Effect;
3. Schema decode + execution;
4. `Context.Service` + focused Layer;
5. current browser IndexedDB module;
6. Stream;
7. reactivity/Atom core if considered;
8. BrowserHttpClient;
9. unstable HTTP/HttpApi for Worker;
10. direct-DOM question player;
11. declarative-renderer question player;
12. service worker native;
13. service worker with Effect only as a comparison, not presumption.

## Measurement method

For every emitted JavaScript file record:

- raw bytes;
- minified bytes;
- gzip level 9;
- Brotli quality 11;
- source map exclusion;
- chunk/entry identity.

For route closures:

1. parse the build manifest;
2. follow static imports;
3. compress each emitted file independently;
4. sum distinct files;
5. measure dynamic boundaries separately;
6. calculate incremental bytes after shared chunks;
7. record preload/prefetch behavior.

Do not use package installation size. Do not concatenate chunks before compression.

## Questions

- Can static pages avoid all Effect imports?
- What is the actual latest-v4 runtime floor?
- Which imports cause major increases?
- Does root-barrel versus public-subpath import matter in current v4/Vite?
- Does manual vendor chunking accidentally preload Effect on static pages?
- How do direct DOM and renderer candidates compare?
- What is the cost of current reactivity/Atom?
- What is the cost of official browser IndexedDB versus alternatives?
- Can HttpClient/Stream remain optional?
- What production budgets are justified by measurements rather than old estimates?
- Does Bun's isolated workspace expose duplicate/undeclared Effect dependencies?
- Which minifier/build settings are defensible?

## Reproducibility

Run clean builds twice and record output/content hash equality or explain expected nondeterminism. Record environment and build duration.

## Required outputs

```text
FIXTURE-MATRIX.csv
DEPENDENCY-COHORT.md
RAW-BUNDLE-FILES.csv
ROUTE-CLOSURES.csv
CHUNK-GRAPH.md
IMPORT-SENSITIVITY.csv
MINIFIER-COMPARISON.csv
BUDGET-RECOMMENDATION.csv
REPRODUCIBILITY.md
fixtures/
raw-results/
```

Do not turn a budget into maintained authority; hand it to synthesis.
