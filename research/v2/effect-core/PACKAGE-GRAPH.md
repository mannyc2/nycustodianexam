# Proposed Bun Workspace and Dependency Graph

This is an architecture proposal, not a package implementation.

## Smallest sensible topology

```text
apps/
  site/
  content-compiler/
packages/
  content/
  study/
```

Root workspaces:

```text
apps/*
packages/*
```

Proposed workspace names:

| Path | Workspace name | Published |
| --- | --- | --- |
| `apps/site` | `@nycustodian/site` | No |
| `apps/content-compiler` | `@nycustodian/content-compiler` | No |
| `packages/content` | `@nycustodian/content` | Only if a later distribution need exists |
| `packages/study` | `@nycustodian/study` | Only if a later distribution need exists |

## Dependency graph

```text
@nycustodian/content
  -> effect

@nycustodian/study
  -> effect
  -> @nycustodian/content

@nycustodian/site
  -> effect
  -> @effect/platform-browser
  -> @nycustodian/content
  -> @nycustodian/study

@nycustodian/content-compiler
  -> effect
  -> @effect/platform-bun
  -> @nycustodian/content

root development and tests
  -> @effect/vitest
  -> vitest
  -> vite
  -> typescript
```

There are no upward dependencies from `packages/*` into `apps/*`, no platform-package imports from the portable packages, and no dependency from `packages/content` into `packages/study`.

## Responsibilities and dependency rules

| Workspace | Owns | May depend on | Must not own or import |
| --- | --- | --- | --- |
| `apps/site` | Browser entry, semantic DOM integration, Vite configuration, service-worker entry, IndexedDB implementations, browser fetch implementations, Cache API integration, install/update UI, static deployment configuration | Both portable packages, `effect`, `@effect/platform-browser`, app-local browser libraries | Compiler filesystem logic; reusable content or study policy hidden inside UI code |
| `apps/content-compiler` | Bun process root, source ingestion, filesystem traversal, content compilation, validation orchestration, publication output, build-time diagnostics | `@nycustodian/content`, `effect`, `@effect/platform-bun`, compiler-only libraries | Browser APIs, study-session behavior, runtime site storage |
| `packages/content` | Schemas, IDs, source and claim models, questions, explanations, image metadata, manifests, immutable object rules, compatibility and integrity policy, pure validators | `effect` stable modules | DOM, IndexedDB, fetch, Bun, Cloudflare, Vite, service-worker globals, study progress |
| `packages/study` | Session state machine, commit-before-reveal semantics, deterministic selection policy, attempt and checkpoint models, progress and review derivation, study commands | `@nycustodian/content`, `effect` stable modules | DOM, IndexedDB, fetch, Bun, Cloudflare, Vite, content publication tooling |

## Why these are package boundaries

### `packages/content`

Both the site and compiler must agree exactly on the published content contract. A package prevents the compiler from validating one representation while the browser decodes another. It also keeps immutable content and compatibility rules independent of storage and rendering.

### `packages/study`

Study behavior is reusable across the browser UI, tests, print/simulation tooling, and possible future clients. It has a one-way dependency on content types and rules. It must remain deterministic and platform-neutral.

### `apps/site`

Browser storage and network implementations belong here because they are deployment and host choices, not portable product contracts. The service worker is another entry and runtime in this app, not another workspace by default.

### `apps/content-compiler`

Compilation is an executable with a finite process lifetime and Bun-specific capabilities. Keeping it as an app avoids leaking filesystem or process dependencies into the content model.

## Root catalog policy

The root should own one exact Effect version and expose it through Bun's dependency catalog. Every Effect ecosystem package must resolve to that same version.

At the research snapshot, the aligned set is:

```text
effect                    4.0.0-rc.111
@effect/platform-browser  4.0.0-rc.111
@effect/platform-bun      4.0.0-rc.111
@effect/vitest            4.0.0-rc.111
```

Re-resolve this set immediately before implementation. Internal workspace dependencies use `workspace:*`; they do not duplicate repository version numbers.

## Internal organization

Organize each workspace by product feature or cohesive capability. Examples include content packs, study sessions, review, correction drafts, and publication. Do not impose a repository-wide `domain/application/infrastructure` mirror.

A service contract and its portable models may live together in the package that owns the capability. A browser implementation stays in `apps/site`; a compiler implementation stays in `apps/content-compiler`. This does not require a separate package or a `ports` directory.

## Packages not justified initially

Do not create these at the start:

- `packages/shared` or `packages/common`;
- `packages/runtime`;
- `packages/services`;
- `packages/storage`;
- one package for each service;
- `packages/test-support`;
- `packages/ui` before a genuinely reusable component boundary exists;
- `apps/worker` before a backend endpoint exists.

A new workspace is justified only when it has at least one durable independent consumer boundary, a clear dependency direction, and enough cohesion that moving it prevents real coupling rather than merely shortening imports.

## Growth triggers

| Candidate | Add only when |
| --- | --- |
| `apps/worker` | A concrete correction, analytics, or administration endpoint is approved and static assets are insufficient. |
| `packages/ui` | Multiple independent app entries share a stable accessible component system. |
| `packages/test-support` | Several workspaces share substantial test Layers/builders that cannot remain local without duplication. |
| Separate service-worker workspace | It has an independent build, release, dependency set, or additional consumer beyond `apps/site`. |
| Separate storage package | More than one host implementation shares a stable storage contract and transactional behavior, not merely TypeScript types. |

Until a trigger is met, keep the graph small and make dependencies visible at the app roots.
