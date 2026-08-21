# Effect v4 and Bun prompt-foundation curation — start receipt

**Started:** 2026-08-21  
**Repository:** `mannyc2/nycustodianexam`  
**Base branch:** `agent/chat-corpus-reconciliation`  
**Base SHA:** `8b0d26245c1d78fb0be4e79f874a7d8872056ceb`  
**Output branch:** `research/curate-effect-v4-bun-prompts`

## Purpose

Curate and correct the maintained research-prompt foundation before launching the second parallel architecture pass.

This branch will:

- establish current Effect v4 research doctrine from current primary sources;
- establish Bun/Bun-workspace research doctrine for an `apps/` and `packages/` monorepo;
- locate and assess the intended Effect `SKILL.md` guidance or explicitly record that it remains unavailable;
- preserve reusable first-pass findings while excluding superseded v3/package-layout assumptions;
- update maintained repository guidance and create the second-generation prompt suite;
- require every future research lane to create a GitHub branch, initial receipt, early draft PR, raw research artifacts, incremental pushes, and a final SHA/PR receipt.

## Fixed maintainer constraints

- target the latest available Effect v4 line;
- do not recommend Effect v3 for production implementation;
- use v3 only as historical, migration, or regression evidence;
- use Bun as package manager and primary TypeScript tooling/runtime direction;
- use Bun workspaces with top-level `apps/` and `packages/`;
- prefer Effect-native service, Layer, Schema, typed-error, Scope, structured-concurrency, runtime-ownership, and testing patterns;
- do not impose a generic clean-architecture/ports-adapters directory tree and add Effect afterward;
- preserve standards-first semantic HTML/CSS, crawlable static acquisition pages, and Cloudflare deployment direction unless current evidence changes them;
- do not treat Effect as the renderer;
- do not scaffold application code or dependencies in this curation branch.

## Initial scope

Expected maintained updates include:

- `AGENTS.md`;
- `CONTRIBUTING.md`;
- `README.md`;
- `product/ARCHITECTURE_CONSTRAINTS.md`;
- `docs/OPEN.md`;
- `prompts/research-v2/**`;
- `research/prompt-curation/**`.

No exam fact, application package graph, production implementation, workflow, lockfile, deployment configuration, or production asset will be introduced by this pass.
