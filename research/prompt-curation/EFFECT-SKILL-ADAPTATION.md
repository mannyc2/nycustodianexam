# Applying the official Effect `SKILL.md` to this repository

**Upstream skill repository:** `Effect-TS/skills`  
**Pinned skill commit:** `28822c9e19998876a6b0e0d97877442012ed4391`  
**Pinned path:** `skills/effect-ts/SKILL.md`  
**Observed Effect source commit:** `436f10d1efccec308426532ff3f88df9a96434f3`

## 1. What the skill actually requires

The official Effect skill is intentionally short. It requires an agent to:

- use the user’s preferred package manager;
- install the selected Effect prerelease;
- in a monorepo, make Effect available as a root dev dependency so package source is available under `node_modules/effect/src`;
- update repository agent instructions so that, before writing Effect code, an agent reads `node_modules/effect/AGENTS.md` completely;
- follow relevant links in that file;
- search the installed package source when the guide is insufficient.

It does not define the project’s module graph or require any UI framework.

## 2. Bun adaptation

The command examples in the skill use pnpm. The project-selected package manager is Bun, so the eventual scaffold should adapt the intent:

```text
root workspace:
  exact selected Effect v4 in devDependencies
  Bun catalog containing the exact coordinated Effect cohort

runtime workspace:
  explicit effect dependency using catalog:
  matching platform/atom/vitest package dependencies where actually used
```

The root dev dependency exists for agent/source visibility and root tooling. It is not a substitute for runtime workspaces declaring dependencies. Bun isolated installs are specifically useful here because they expose undeclared imports rather than hiding them through hoisting.

At research time, before the real monorepo exists, a lane that needs runnable probes should create a private Bun fixture under its authorized research directory, pin exact versions, commit its `package.json` and `bun.lock`, and read the installed package guidance there. It must not mutate the repository root package graph.

## 3. Installed-package guidance is authoritative for code style

The Effect package ships `AGENTS.md`, `CLAUDE.md`, and linked `ai-docs`. Effect’s build copies upstream `LLMS.md` into each public package. Therefore future implementation and code-producing research must prefer:

1. the installed package’s complete `AGENTS.md`;
2. linked package-local AI documentation;
3. installed `node_modules/effect/src`;
4. pinned upstream source at the selected coordinate;
5. other official Effect documentation;
6. ecosystem examples only as corroboration.

This prevents old v3 documentation, blog posts, or copied snippets from silently defining v4 architecture.

## 4. Default patterns to carry into prompts

Unless current package guidance changes, prompts should ask agents to evaluate/use:

- `Effect.gen` for effectful workflows;
- named `Effect.fn("qualifiedName")` for effect-returning functions;
- Schema models and `Schema.TaggedError`;
- `Context.Service` as the default capability service;
- package/path-qualified service identifiers;
- focused implementation Layers;
- `Context.Reference` for defaulted values/configuration semantics;
- Scope/acquire-release for resources;
- `Layer.effectDiscard` for owned background work with no service;
- BunRuntime/Layer launch patterns for Bun entrypoints;
- ManagedRuntime only at imperative integration boundaries;
- DateTime/Clock for testable time;
- Effect Predicate utilities instead of redundant hand-written type guards;
- official Effect test integration and test Layers.

Prompts must ask agents to verify these against the exact selected v4 coordinate. They must not quote this list as timeless API law.

## 5. Anti-cargo-cult boundary

The skill is a learning and source-navigation rule. It does not mean:

- every function is a service;
- every service is a package;
- every Layer is attached statically regardless of ownership;
- every pure value is Schema-decoded repeatedly;
- every DOM event becomes a Stream;
- every event handler constructs a runtime;
- all unstable Effect modules are automatically approved;
- Effect replaces semantic HTML or the renderer;
- Bun replaces Vite, Wrangler, browsers, or specialist non-TypeScript tools.

Project prompts must continue to ask whether an abstraction preserves provider semantics, atomicity, accessibility, bundle boundaries, and testability.

## 6. Repository instruction to add at scaffold time

The eventual root `AGENTS.md` should include this operational rule:

> This workspace uses the latest selected Effect v4 cohort. Before writing or reviewing Effect code, read `node_modules/effect/AGENTS.md` completely. Follow the linked package-local documentation for the relevant API, then inspect `node_modules/effect/src` when the guide is insufficient. Do not translate v3 examples mechanically. Use the exact installed package as the source of truth.

This curation can record that rule now. It cannot make `node_modules/effect/AGENTS.md` available until the Bun workspace and dependencies are actually scaffolded.
