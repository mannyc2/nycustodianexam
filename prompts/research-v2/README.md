# Second-pass Effect v4 / Bun research prompts

These prompts replace the initial mixed-version architecture prompts.

## Launch with an exact source SHA

Every lane is launched with one exact immutable source SHA supplied in the launch message.

Read first:

- `LAUNCH-CONTRACT.md` — launch-time SHA semantics and minimal launch-message form;
- `00-SHARED-RESEARCH-CONTRACT.md` — complete common research/GitHub/Effect/Bun contract;
- `LANE-INDEX.csv` — branches, allowed paths, prior-research pointers, overlap rules, and hard prerequisites.

Some lane files still display the token:

```text
{{POST_CURATION_SOURCE_SHA}}
```

That token is a launch-time variable. It means the exact `Required source SHA` supplied by the launch message; it does **not** require editing the repository prompt file before launch.

If a launch message omits the exact SHA, stop. Never infer a moving branch head.

## Shared contract

Every researcher must also read:

- `research/prompt-curation/EFFECT-V4-BUN-RESEARCH-DOCTRINE.md`;
- `research/prompt-curation/EFFECT-SKILL-ADAPTATION.md`.

The shared contract makes `@GitHub` publication a completion requirement:

1. immutable-base check;
2. branch creation;
3. initial receipt commit/push;
4. early draft PR;
5. exact raw report/evidence/fixtures;
6. incremental pushes;
7. final SHA/PR receipt;
8. stop when GitHub write access is unavailable.

## Parallel run plan

### Parallel research lanes

R2.1 through R2.10 use disjoint output paths and may be launched simultaneously. A lane may inspect a sibling PR that already exists, but it must not wait or poll for another lane.

| ID | Prompt | Branch |
|---|---|---|
| R2.1 | `01-effect-v4-core-monorepo.md` | `research/v2-effect-core-topology` |
| R2.2 | `02-effect-v4-ui-reactivity.md` | `research/v2-effect-ui-reactivity` |
| R2.3 | `03-effect-v4-platform-runtime-matrix.md` | `research/v2-effect-platform-runtimes` |
| R2.4 | `04-effect-v4-indexeddb-offline.md` | `research/v2-effect-indexeddb-offline` |
| R2.5 | `05-effect-v4-browser-bundling.md` | `research/v2-effect-browser-bundling` |
| R2.6 | `06-effect-v4-schema-content-compiler.md` | `research/v2-effect-schema-compiler` |
| R2.7 | `07-bun-monorepo-build-discipline.md` | `research/v2-bun-monorepo-discipline` |
| R2.8 | `08-testing-accessibility-performance-observability.md` | `research/v2-testing-accessibility-observability` |
| R2.9 | `09-hazard-scene-production.md` | `research/v2-hazard-scene-production` |
| R2.10 | `10-tool-geometry-audit.md` | `research/v2-tool-geometry-audit` |

Dependency and overlap details live in `LANE-INDEX.csv`.

### Final reconciliation

Run `90-architecture-synthesis.md` only after the intended architecture lanes are complete or explicitly missing. The synthesis reads their PR branches directly; they do not need to be merged into the source branch first.

## Fixed project constraints

All prompts preserve:

- latest available Effect v4;
- Bun and Bun workspaces;
- top-level `apps/` and `packages/`;
- installed-package `AGENTS.md` and source workflow from the official Effect skill;
- Effect-native services/Layers/runtime ownership;
- no generic clean-architecture package tree;
- semantic static HTML/CSS;
- no Next.js;
- no renderer preselected;
- Cloudflare Workers Static Assets direction;
- durable IndexedDB commit before reveal;
- no sandbox-only research completion.

## What remains a research result

The suite does not preselect:

- exact v4 or Bun versions at implementation lock;
- exact workspace package names;
- renderer;
- IndexedDB provider;
- service-worker architecture;
- v4 unstable APIs;
- test runner combination;
- measured bundle budgets;
- hazard-scene production method;
- production geometry approval.
