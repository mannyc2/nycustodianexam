# V2 research launch readiness

**Status:** prerequisite finalization complete; research lanes are ready once launched with one explicit immutable source SHA.

## Curation and launch foundation

Prompt-curation PR #4 merged into `agent/chat-corpus-reconciliation` as:

```text
645e885748c830f7a9cbbbe90ac0f31149bfc81c
```

Subsequent prerequisite merges finalized launch semantics and repository bookkeeping. The exact immutable SHA used for research must therefore be taken from the source branch only after all prerequisite cleanup is complete and supplied explicitly in each launch message.

## Launch-contract correction

The earlier suite treated `{{POST_CURATION_SOURCE_SHA}}` as a placeholder that should be edited into every prompt after merge. That creates avoidable churn and a self-reference problem: committing the substitution changes the branch head again.

The corrected launch model is:

- repository prompt files are stable templates;
- an individual launch message supplies one exact immutable source SHA;
- `prompts/research-v2/LAUNCH-CONTRACT.md` defines that substitution contract;
- researchers verify the supplied SHA through `@GitHub` and stop on drift;
- no prompt-file edit is required merely to launch a lane.

This makes the eventual chat prompts short pointers while retaining the complete research contract in GitHub.

## Parallelism

R2.1 through R2.10 have disjoint final output branches and paths and may be launched in parallel.

Some lanes benefit from already-available sibling PRs, but they MUST NOT wait or poll for them:

- R2.4 may inspect final R2.3 if already available;
- R2.7 should inspect any final architecture/runtime PRs already available;
- R2.8 should use final R2.5 measurements if already available, otherwise keep numeric gates provisional;
- R2.6 keeps workspace placement provisional until synthesis.

R2.90 runs only after the intended architecture lanes are complete or explicitly missing.

See `prompts/research-v2/LANE-INDEX.csv`.

## Preliminary runs preserved but superseded

Three research attempts were started before the launch foundation was completely finalized. They remain useful provenance and source analysis but are **not substitutes for the final lanes**:

| PR | Branch | Status | Final rerun |
|---|---|---|---|
| #5 | `research/v2-effect-core` | closed, unmerged, BLOCKED preliminary core analysis | R2.1 `research/v2-effect-core-topology` |
| #6 | `research/v2-effect-ui` | closed, unmerged, preliminary UI/reactivity analysis; no Bun/browser/runtime/bundle proof | R2.2 `research/v2-effect-ui-reactivity` |
| #7 | `research/v2-effect-platform` | closed, unmerged, substantial source/platform analysis; required Bun/browser/workerd runtime probes blocked | R2.3 `research/v2-effect-platform-runtimes` |

The final R2.1–R2.3 researchers should inspect those PRs and reuse valid source evidence with coordinate revalidation. They must independently satisfy the finalized source, fixture, installed-package-guidance, runtime-probe, raw-result, and GitHub publication contracts.

Synthesis must never count #5–#7 as completed final lanes or as independent corroboration of their reruns.

## Final branch-name audit

The intended final branches were checked after closing #5–#7 and were unused:

- `research/v2-effect-core-topology`;
- `research/v2-effect-ui-reactivity`;
- `research/v2-effect-platform-runtimes`;
- `research/v2-effect-indexeddb-offline`;
- `research/v2-effect-browser-bundling`;
- `research/v2-effect-schema-compiler`;
- `research/v2-bun-monorepo-discipline`;
- `research/v2-testing-accessibility-observability`;
- `research/v2-hazard-scene-production`;
- `research/v2-tool-geometry-audit`;
- `research/v2-architecture-synthesis`.

Each final lane must still perform its own branch-nonexistence check at launch.

## What is ready

The research corpus now has:

- normalized first-pass raw research;
- maintained latest-Effect-v4 constraint;
- maintained Bun/Bun-workspaces constraint;
- top-level `apps/` / `packages/` constraint;
- official Effect `SKILL.md` adaptation;
- installed-package `effect/AGENTS.md` / source-inspection doctrine;
- durable commit-before-reveal rule;
- mandatory direct `@GitHub` publication workflow;
- disjoint lane paths and final branch names;
- exact prior-research pointers;
- preliminary PR provenance for R2.1–R2.3;
- full lane-specific research specifications;
- launch-time immutable-SHA contract;
- final synthesis lane.

## What is intentionally not done before research

Do not pre-resolve these in prompt curation:

- exact Effect v4 dependency version to lock for implementation;
- final workspace package graph;
- renderer;
- IndexedDB provider;
- service-worker architecture;
- unstable v4 API adoption;
- final bundle budgets;
- test-runner combination;
- hazard-scene production method;
- geometry POC approval.

Those are the subjects of the v2 research.

## User-facing prompt policy

Do not send the full repository lane prompts to the maintainer as repeated chat walls.

When the maintainer asks for the launch prompts, provide one short individual message per lane containing only:

- repository;
- exact source SHA;
- lane prompt path;
- instruction to follow `LAUNCH-CONTRACT.md` and `00-SHARED-RESEARCH-CONTRACT.md`;
- for R2.1–R2.3, the relevant closed preliminary PR pointer;
- any genuinely additional prerequisite pointer not already encoded in the lane prompt.

The detailed instructions remain in GitHub.
