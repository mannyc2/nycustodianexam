# R2.8 - Testing, accessibility, performance, and observability

Repository-backed research lane for the NY Custodian Exam project.

## Immutable source

- Source branch: `agent/chat-corpus-reconciliation`
- Required source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Output branch: `research/v2-testing-accessibility-observability`
- Allowed root: `research/v2/testing-accessibility-observability/**`

## Research result

This lane assigns verification responsibility to the smallest truthful runtime instead of forcing all tests through one runner.

Primary recommendations:

- pure deterministic transitions: ordinary TypeScript property/unit tests;
- Effect services and use cases: `@effect/vitest` at the exact selected Effect v4 cohort;
- Bun-runtime behavior: Bun test only where Bun itself is the runtime under test;
- authoritative IndexedDB, cross-tab, service-worker, accessibility, and renderer behavior: real browsers;
- Cloudflare Worker semantics: Cloudflare's current Vitest/workerd harness when a Worker exists;
- static output, bundle closure, print, and SEO: production artifacts, not source-size proxies;
- accessibility: combine automation with keyboard, screen-reader, zoom/reflow, forced-colors, reduced-motion, print, and answer-leak manual gates;
- observability: local diagnostics by default and optional consented first-party telemetry with aggressive minimization/redaction.

Numeric browser bundle limits remain provisional because R2.5 did not publish final Effect-bearing production measurements.

This is research evidence, not implementation, accessibility certification, or production approval.
