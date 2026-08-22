# Question-player renderer-selection spike

## Purpose

Compare renderer mechanics while holding the model, commands, persistence protocol, static semantics, grading boundary, test sequence, and measurement method constant.

## Fixture coordinates

- Effect: `4.0.0-rc.111`;
- lit-html: `3.3.3`;
- Vite: `8.2.1`;
- Bun: `1.4.0` target;
- browser observed: Chromium `144.0.7559.96`.

## Arms

1. `direct.html` + `direct-view.js`: updates stable semantic nodes directly.
2. `lit.html` + `lit-view.js`: actual declarative candidate using lit-html and keyed `repeat`.
3. `template.html` + `template-view.js`: standards-only whole-region replacement negative control. It is not an adoption candidate.

All arms consume the same `model.js`, `controller.js`, `persistence.js`, decoded question, grading boundary, and CSS.

## Required sequence

1. load semantic initial HTML;
2. decode the question boundary;
3. restore selected answer/flag/session;
4. select an answer;
5. submit explicit commit;
6. inject rejection and assert no result/explanation DOM or accessibility leak;
7. focus the error and retain selection/attempt ID;
8. retry with the same ID;
9. wait for transaction completion;
10. reconcile an injected unknown outcome by attempt ID;
11. reveal only after settlement;
12. move focus to the outcome and announce it;
13. toggle flag;
14. advance to next item and focus the question;
15. navigate/dispose and prove no later render;
16. measure production bundle closure.

## Persistence protocol

The fixture's persistence adapter creates `attempts` and `sessions` stores. `commitAttempt` uses one readwrite transaction, reads the attempt ID, rejects collisions, writes the attempt/session, and awaits `transaction.oncomplete`. An injected `unknown` mode throws only after completion. The controller then reads the same attempt ID and accepts only a matching committed record.

The policy-safe browser harness uses an asynchronous API-shaped test double because native IndexedDB is blocked. The native HTTP harness remains committed and must be rerun in an unrestricted browser.

## Acceptance matrix

| Requirement | Direct | Native-template negative control | lit-html | Current status |
|---|---:|---:|---:|---|
| semantic initial HTML | yes | yes | yes | source inspected |
| same state/command model | yes | yes | yes | confirmed by fixture imports |
| restore/select/flag/next/dispose | yes | yes | prepared | direct/template OBSERVED; lit BLOCKED |
| rejection keeps reveal hidden | yes | yes | prepared | direct/template OBSERVED |
| stable retry attempt ID | yes | yes | prepared | direct/template OBSERVED |
| unknown outcome reconciliation | yes | yes | prepared | direct/template OBSERVED with API shim |
| focus and live region | yes | yes after defect fix | prepared | direct/template OBSERVED |
| native IndexedDB transaction | prepared | prepared | prepared | BLOCKED by managed browser |
| Effect Schema runtime decode | prepared | prepared | prepared | BLOCKED by package install |
| Bun/Vite production bundle | prepared | prepared | prepared | BLOCKED by Bun/network |

## Observed defect

The negative-control renderer originally focused the error/outcome node, acknowledged the focus intent, then replaced the focused node during the acknowledgement render. Active focus became the document body. The fixed order is:

```text
capture semantic intent
  -> acknowledge snapshot revision
  -> renderer replacement completes
  -> resolve replacement node
  -> focus replacement node
```

This defect is evidence against whole-region string-template rendering, not evidence that direct DOM itself is invalid.

## Full rerun commands

```sh
cd research/v2/effect-ui-reactivity/fixtures/question-player
bun install
bun run test:model
bun run build
bun run measure:vite
bun run test:browser:native
```

Required rerun additions:

- verify exact `bun.lock` and installed package versions;
- read installed `node_modules/effect/AGENTS.md` completely;
- typecheck and execute `effect-schema-boundary.ts`;
- execute direct and lit arms against native IndexedDB;
- inspect built HTML, JS, source maps, manifests, and static assets for answer leakage;
- report raw/gzip/brotli closure per entry and startup/interaction timing;
- run keyboard and assistive-technology smoke tests;
- reconcile bundle gates with R2.5.
