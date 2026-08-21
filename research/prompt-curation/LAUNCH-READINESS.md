# V2 research launch readiness

**Status:** prerequisite finalization after merge of prompt-curation PR #4.

## Immutable curation point

Prompt-curation PR #4 merged into `agent/chat-corpus-reconciliation` as:

```text
645e885748c830f7a9cbbbe90ac0f31149bfc81c
```

This commit contains the maintained Effect v4/Bun doctrine and full v2 prompt suite.

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

R2.1 through R2.10 have disjoint output branches and paths and may be launched in parallel.

Some lanes benefit from already-available sibling PRs, but they MUST NOT wait or poll for them:

- R2.4 may inspect R2.3 if already available;
- R2.7 should inspect any architecture/runtime PRs already available;
- R2.8 should use R2.5 measurements if already available, otherwise keep numeric gates provisional;
- R2.6 keeps workspace placement provisional until synthesis.

R2.90 runs only after the intended architecture lanes are complete or explicitly missing.

See `prompts/research-v2/LANE-INDEX.csv`.

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
- disjoint lane paths and branches;
- exact prior-research pointers;
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
- any genuinely additional prerequisite PR pointer not already encoded in the lane prompt.

The detailed instructions remain in GitHub.
