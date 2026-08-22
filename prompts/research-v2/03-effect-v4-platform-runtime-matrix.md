# R2.3 — Effect v4 Platform and runtime capability matrix

You are a fresh repository-backed research agent for `mannyc2/nycustodianexam`.

Map current Effect v4 capabilities across browser, Bun tooling, browser service worker, and Cloudflare workerd, and decide where official Platform modules, native Web APIs behind project services, or no service are most truthful.

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
  research/v2-effect-platform-runtimes

Allowed paths:
  research/v2/effect-platform-runtimes/**

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

- `product/FEATURE_SPEC.md` offline/network/correction sections;
- raw E06 Platform report and E09 correction;
- current `effect` exports and source;
- current `@effect/platform-browser` and `@effect/platform-bun` complete public source/AGENTS guidance;
- current Cloudflare Workers/workerd primary documentation;
- Web specifications for cancellation/lifecycle-sensitive APIs.

## Capability matrix

For each capability compare:

A. native API directly;
B. native API inside a project Effect service;
C. current official Effect v4 core/platform abstraction;
D. another maintained library only when necessary.

Cover:

- HTTP client;
- Request/Response/Headers/URL;
- crypto/hash/random;
- Blob/File;
- readable/writable streams;
- compression;
- WebSocket;
- workers;
- browser IndexedDB;
- browser persistence/key-value store;
- Cache Storage;
- service-worker events;
- BroadcastChannel;
- Web Locks;
- StorageManager;
- online/offline signals;
- DOM events;
- clocks/time;
- Bun filesystem/path/process/runtime;
- Cloudflare bindings, fetch handler, caches, streams, request abort;
- correction endpoint;
- optional analytics endpoint.

Record:

- package/module;
- stable/unstable status;
- source coordinate;
- semantics;
- cancellation truth;
- resource ownership;
- portability value;
- testability;
- bundle cost hypothesis;
- project need;
- recommendation.

## Specific questions

### Browser package

Inspect current browser modules including IndexedDB, persistence, HTTP, crypto, worker, socket, stream, and runtime functionality. Do not infer completeness from the barrel exports.

### Bun platform

Determine what `@effect/platform-bun` adds beyond generic Effect/Web APIs and where the content compiler/tooling genuinely benefits. Account for its node-shared dependency. Do not leak it into browser/workerd graphs.

### Cloudflare

Research latest v4 approaches for:

- native `fetch` boundary plus Effect use case;
- `effect/unstable/http` Web handlers;
- `effect/unstable/httpapi`;
- request-scoped versus isolate-scoped Layers/runtimes;
- bindings;
- request abort;
- streaming;
- cold start;
- error serialization;
- testing.

The correction endpoint is small. Recommend the least complex truthful choice and when it should be revisited.

### Service worker

Determine whether any Effect runtime belongs in the service worker. Respect event lifetime and termination. Separate shared pure/Schema code from long-lived runtime assumptions.

### False portability

Identify capabilities that should remain distinct despite sharing a service shape, and cases where a project service would merely rename a deterministic native value.

## Required probes

Where supported, commit exact probes for:

- BrowserHttpClient abort/typed status/Schema decode;
- one Browser IndexedDB module operation;
- BunRuntime entry and one filesystem operation;
- Effect HTTP Web handler converted to Request→Response;
- Cloudflare-compatible handler type/build probe;
- runtime/Layer construction reuse;
- client abort behavior if it can be observed locally.

Do not claim Cloudflare runtime proof from a Node/Bun-only test.

## Required outputs

```text
PACKAGE-STATUS.csv
CAPABILITY-MATRIX.csv
BROWSER-PLATFORM-AUDIT.md
BUN-PLATFORM-AUDIT.md
CLOUDFLARE-HTTP-OPTIONS.md
SERVICE-WORKER-BOUNDARY.md
LAYER-TOPOLOGIES.md
FALSE-PORTABILITY.md
fixtures/
raw-results/
```

Include a section titled **“Where native Web APIs are the better Effect implementation.”**
