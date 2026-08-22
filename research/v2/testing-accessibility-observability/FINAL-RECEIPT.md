# R2.8 final receipt

## Publication identity

- Repository: `mannyc2/nycustodianexam`
- Lane: R2.8 - Testing, accessibility, performance, and observability
- Source branch: `agent/chat-corpus-reconciliation`
- Required/verified source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Output branch: `research/v2-testing-accessibility-observability`
- Draft PR: `https://github.com/mannyc2/nycustodianexam/pull/19`
- Allowed root: `research/v2/testing-accessibility-observability/**`
- Initial receipt commit: `0000925ac69087ba403d3715e2784ace7b25b49e`
- Final publication commit: SELF - resolve from PR/head after this receipt is committed.

## Exact coordinates

- Effect repository coordinate inspected: `1144032cedda7b5eacc1ebf980d06957c7a59ddf`
- `effect`: `4.0.0-rc.111`
- `@effect/vitest`: `4.0.0-rc.111`
- Vitest fixture coordinate: `4.1.10`
- Bun project research coordinate: `1.4.0`
- Cloudflare Workers SDK source inspected: `0cb86908903b87a742d1786ac8aa5aa9dce6c575`

## Key conclusions

1. Use the smallest truthful test environment; no single runner owns all verification.
2. Use `@effect/vitest` for Effect-native services/use cases/Layers/property tests.
3. Use Bun test for Bun-runtime/tooling integration, not as an assumed replacement for official Effect testing integration.
4. Real browsers are mandatory for authoritative IndexedDB, multi-tab, Service Worker, renderer/focus, offline, and accessibility-facing behavior.
5. Automated accessibility checks are release gates but cannot certify WCAG 2.2 AA; representative manual keyboard/screen-reader/zoom/forced-colors/reduced-motion/print testing remains required.
6. Durable IndexedDB completion gates correctness reveal. Persistence failure or uncertain outcome cannot reveal early.
7. Production emitted files and route closures control performance/bundle gates. Numeric byte limits remain provisional because final R2.5 current-v4 measurements were not available.
8. Local diagnostics are default. Optional network telemetry must be first-party, consented, allowlisted, minimized, redacted before transmission, and bounded by retention.

## Probes and limitations

Representative Effect and browser fixtures are committed, but executable proof remains BLOCKED where this environment could not supply a usable Bun/package installation path or unrestricted real-origin browser/service-worker execution. No `bun.lock`, runtime pass, browser IndexedDB result, bundle number, screen-reader result, or Cloudflare workerd result was fabricated.

The required unresolved evidence is recorded in `raw-results/PROBE-STATUS.csv` and `OPEN-QUESTIONS.csv`.

## Substantive files

- `README.md`
- `REPORT.md`
- `SOURCE-LEDGER.csv`
- `DECISION-MATRIX.csv`
- `OPEN-QUESTIONS.csv`
- `TEST-LAYER-MATRIX.csv`
- `RUNNER-COMPARISON.csv`
- `EFFECT-V4-TEST-PATTERNS.md`
- `ACCESSIBILITY-GATES.md`
- `BROWSER-AT-MATRIX.csv`
- `FAILURE-INJECTION-MATRIX.csv`
- `PERFORMANCE-GATES.csv`
- `OBSERVABILITY-EVENTS.csv`
- `PRIVACY-REDACTION.md`
- `CI-RESPONSIBILITY-MAP.md`
- `fixtures/effect-tests/**`
- `fixtures/browser/**`
- `raw-results/PROBE-STATUS.csv`
- `FINAL-RECEIPT.md`
- `MANIFEST.sha256`

## Drift and scope

A final source drift recheck and changed-file confinement audit must be performed after the final manifest commit. This research does not merge the PR or imply implementation, production approval, or accessibility certification.
