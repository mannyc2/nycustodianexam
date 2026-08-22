# R2.2 final receipt

## Repository publication

- Lane: R2.2 - Effect v4 UI state, reactivity, lifecycle, and renderer integration
- Repository: `mannyc2/nycustodianexam`
- Immutable source branch: `agent/chat-corpus-reconciliation`
- Immutable source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Output branch: `research/v2-effect-ui-reactivity`
- Draft PR: `https://github.com/mannyc2/nycustodianexam/pull/12`
- Initial commit: `cb762d88c2bccc5169ae5fdc3857caeae6b571c1`
- Final substantive commit: `5fc4a757d809037608fc7ac3db05156f77268236`
- Closing receipt/checksum commit: the commit containing this file and `MANIFEST.sha256`; its exact SHA is recorded in draft PR #12 and the final GitHub receipt because a commit cannot contain its own SHA.
- Source drift recheck: `CONFIRMED` identical at `2026-08-21T22:59:41Z`
- Allowed-path audit before closure: `CONFIRMED`; every changed file was under `research/v2/effect-ui-reactivity/**`
- Force push: none
- Merge: none

## Published commits

1. `cb762d88c2bccc5169ae5fdc3857caeae6b571c1` - mandatory `START-RECEIPT.md` checkpoint and draft PR.
2. `f3d5b444a16ec9f156e98bf2eceda81451445183` - exact upstream/runtime coordinate baseline.
3. `64b02057373ca900649bb1b8f36a283bea99c6f0` - zero-file metadata-only commit produced by a no-op content update; retained transparently.
4. `9dcb0ad6b13cd0c5511ddf0c34ec84ae841e47b0` - PR #6 and missing E01/E03 provenance evidence.
5. `b784a5a6a0092c7a684bc86eb3ef49ba82247667` - question-player fixture baseline.
6. `e3ace1f5bd78ab329c55ed80664d4caa78413776` - browser, model, environment, blocker, and measurement evidence.
7. `5fc4a757d809037608fc7ac3db05156f77268236` - reports, matrices, ledgers, renderer recommendation, and handoff.
8. Closing receipt/checksum commit - this file and `MANIFEST.sha256`.

## Exact upstream and dependency coordinates

- Effect repository tag: `effect@4.0.0-rc.111`
- Effect tag commit: `648f566d7557e33abd8da8546c42aa93343e2db9`
- `effect`: `4.0.0-rc.111`
- `@effect/atom-react`: `4.0.0-rc.111`
- `@effect/atom-solid`: `4.0.0-rc.111`
- `@effect/atom-vue`: `4.0.0-rc.111`
- React peer coordinate: `19.2.8`
- React DOM: `19.2.8`
- scheduler: `0.27.0`
- Preact: `10.29.8`
- Solid: `1.9.15`
- Vue: `3.5.41`
- lit-html: `3.3.3`
- lit-html tag commit: `20afabd3c5bfd49fdcdf1b8518e05c7f99a46db6`
- Vite: `8.2.1`
- Bun selected coordinate: `bun-v1.4.0`
- Bun tag commit: `34cbb9a40b4bd1bd767d134a7065e66c2432a676`
- Effect namespace evaluated: `effect/unstable/reactivity` (explicitly unstable)

## Substantive outputs

Required reports and ledgers:

- `README.md`
- `REPORT.md`
- `V4-REACTIVITY-MAP.md`
- `STATE-OWNERSHIP.md`
- `RENDERER-COMPARISON.csv`
- `EFFECT-RENDERER-BOUNDARY.md`
- `QUESTION-PLAYER-SPIKE-SPEC.md`
- `MIGRATION-TRIGGERS.md`
- `ANTI-CUSTOM-FRAMEWORK.md`
- `SOURCE-LEDGER.csv`
- `DECISION-MATRIX.csv`
- `OPEN-QUESTIONS.csv`
- `START-RECEIPT.md`
- `FINAL-RECEIPT.md`
- `MANIFEST.sha256`

Question-player fixture:

- pinned private `package.json` and Vite multi-entry configuration;
- Effect Schema boundary source;
- semantic direct, lit-html, and native-template negative-control HTML/view arms;
- renderer-neutral model, controller, persistence protocol, decoder, and grading boundary;
- native IndexedDB browser harness and policy-safe Chromium harness;
- asynchronous IndexedDB-shaped test double, model tests, source measurement, and Vite closure scripts.

Raw evidence:

- exact source coordinates and PR #6/provenance audits;
- environment and dependency acquisition output;
- Node model tests and JavaScript syntax checks;
- policy-safe Chromium result and managed browser policy;
- native HTTP/IndexedDB blockers;
- static answer-leak scan;
- pre-fix template focus failure trace;
- source-closure measurements;
- Vite/Bun/Effect Schema blocker records;
- normalized `probe-summary.csv`.

## Probes run

- `OBSERVED` Node renderer-neutral model tests: 3/3 passed.
- `OBSERVED` JavaScript syntax validation for fixture JS/MJS/Vite configuration: passed.
- `OBSERVED` static precommit leakage scan: no answer key or explanation literal in the served public fixture.
- `OBSERVED` policy-safe Chromium `144.0.7559.96` direct-DOM and native-template arms:
  - restoration;
  - selection;
  - injected commit rejection with no reveal;
  - error focus;
  - stable idempotency ID across retry;
  - unknown post-commit outcome reconciliation;
  - reveal after settlement in the API-shaped persistence shim;
  - outcome focus and live-region announcement;
  - flag, next-item reset, reload-style restoration, and disposal.
- `OBSERVED` a renderer defect in the native-template negative control: acknowledgement rendering replaced the focused node; the failing trace is preserved and the ordering was repaired.
- `OBSERVED` unbundled first-party source closure:
  - direct: 20,620 raw bytes / 5,553 gzip bytes;
  - native-template negative control: 21,662 / 5,864;
  - lit first-party source excluding `lit-html`: 21,001 / 5,612.

## Probes not run or blocked

- `BLOCKED` Bun executable, `bun install`, exact `bun.lock`, and `bun run` execution.
- `BLOCKED` installed `node_modules/effect/AGENTS.md` and installed package source workflow.
- `BLOCKED` Effect Schema typecheck/runtime execution at `4.0.0-rc.111`.
- `BLOCKED` native-origin IndexedDB because the managed Chromium policy blocks all navigations and `about:blank` denies IndexedDB.
- `BLOCKED` actual lit-html browser arm because dependencies could not be installed.
- `BLOCKED` Vite production build and manifest-closure bundle measurement.
- `BLOCKED` Chromium/Firefox/WebKit native-origin parity and assistive-technology smoke tests.
- `BLOCKED` exact E01/E03 raw reports because the immutable source tree contains their index entries but not their blobs.

No blocked probe was presented as observed runtime evidence. No `bun.lock`, package install result, native IndexedDB result, or production bundle number was fabricated.

## Final conclusions

- Keep five ownership layers separate: durable IndexedDB/content state, Effect workflow/lifecycle state, renderer-neutral immutable screen state, renderer-local high-frequency scratch state, and DOM/accessibility effects.
- Use one long-lived `ManagedRuntime` and deterministic child-scope disposal; never build Layers or runtimes per event.
- Enforce durable commit-before-reveal and stable idempotency-key reconciliation in the use case, not in a component boolean.
- Use stable Effect primitives only where their semantics match; do not mirror the DOM into Ref/PubSub/Stream.
- Treat Reactivity, Atom, AtomRef, AtomRegistry, and framework bindings as optional isolated unstable adapters, not durable authority or renderer selection criteria.
- Keep disciplined semantic direct DOM as the baseline.
- Rerun `lit-html@3.3.3` as the first matched declarative candidate when Bun/native-browser access is available.
- Evaluate Solid only after the documented direct/lit migration triggers are crossed.
- Reject whole-region project-owned template replacement and stop direct-DOM work if it begins recreating diffing, dependency tracking, component lifecycle, event infrastructure, or accessibility primitives.
- Keep the renderer choice provisional until native IndexedDB, actual lit execution, and Vite production closure are observed and reconciled with R2.5/R2.8.

## Integrity

`MANIFEST.sha256` hashes every lane file except the manifest itself, using paths relative to `research/v2/effect-ui-reactivity/`.
