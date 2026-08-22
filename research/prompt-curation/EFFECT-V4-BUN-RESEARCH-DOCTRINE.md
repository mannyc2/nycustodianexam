# Shared Effect v4 and Bun research doctrine

This file is maintained guidance for every architecture research lane in
`prompts/research-v2/`.

## Upstream coordinates versus project constraints

The project constraint is **latest Effect v4**, not a permanently hardcoded prerelease.
Each lane must establish and record:

- latest available v4 package version;
- matching platform / atom / vitest package cohort;
- upstream tag or commit;
- whether the package is GA, RC, beta, or another prerelease;
- which imported modules are stable versus `unstable`;
- exact Bun version used for probes.

At curation time the observed Effect cohort is `4.0.0-rc.111` at Effect main commit
`436f10d1efccec308426532ff3f88df9a96434f3`, and the official Bun site reports
`1.3.14`. These coordinates are not substitutes for lane-start verification.

## Required Effect learning workflow

Before producing Effect code or code-level recommendations:

1. install the exact selected v4 cohort in a private Bun fixture under the lane’s
   authorized research directory;
2. commit the fixture’s `package.json` and `bun.lock`;
3. read `node_modules/effect/AGENTS.md` completely;
4. follow relevant linked package-local docs;
5. inspect `node_modules/effect/src` and matching platform-package source when the
   guide does not settle the question;
6. pin every cited upstream source coordinate.

Do not use v3 docs, v3 package maps, or v3 examples as implementation authority.
V3 may be cited only as historical, migration, or regression evidence.

## Default Effect code patterns to verify

The current package guidance prefers:

- `Effect.gen`;
- named `Effect.fn`;
- Schema-modeled domain values and expected errors;
- `Context.Service`;
- cohesive services and focused Layers;
- package/path-qualified service identifiers;
- `Context.Reference` for defaulted values;
- Scope and finalizers;
- runtime roots rather than scattered execution;
- current runtime packages such as BunRuntime where appropriate;
- official testing integrations.

A lane may recommend an alternative only with current official evidence and a
project-specific reason.

## Service and package law

A service models a meaningful capability with dependency, failure, lifetime, or
substitution semantics. A package exists only for a real runtime, build, ownership,
publication, or reuse boundary.

Do not create:

- service per function;
- package per service;
- generic `ports`, `adapters`, or `core` packages by default;
- one giant `Application` service;
- one giant Layer hiding all dependencies;
- Layer construction in every event handler;
- runtime construction per event;
- framework-specific packages before renderer selection;
- an empty Worker app.

Pure deterministic calculations remain plain TypeScript.

## Runtime roots to keep distinct

Research must distinguish:

- generated/static browser pages;
- interactive browser application/islands;
- Bun content compiler and development tooling;
- browser service worker;
- Cloudflare workerd Worker;
- test runtimes.

Do not force a single platform Layer where the capabilities and lifecycles differ.

## Bun workspace law

The future root uses:

```text
apps/*
packages/*
```

Research should evaluate:

- private root;
- Bun catalogs for one exact Effect cohort;
- explicit `workspace:*` dependencies;
- isolated linker;
- committed `bun.lock`;
- `bun ci`;
- reviewed trusted dependencies;
- filtered/dependency-aware scripts;
- runtime-specific tsconfigs and types;
- root dev `effect` for package source/AGENTS access;
- explicit runtime `effect` dependencies in consumers.

Bun ownership of the workspace does not authorize Bun globals in browser/workerd
packages.

## Maintained product invariants

All lanes preserve:

- semantic, indexable acquisition/reference HTML;
- no Next.js;
- no account requirement;
- local-first progress;
- durable IndexedDB commit before answer reveal in normal persistent mode;
- versioned immutable content packs;
- deterministic simulation and print;
- WCAG 2.2 behavior and nonvisual equivalents;
- no pre-answer leakage through DOM, accessibility text, filenames, manifests, SVG,
  GLB, or generated metadata;
- minimal backend;
- test-security boundary.

## Evidence labels

Use:

- **CONFIRMED** — current official declarations/docs/source establish the claim;
- **OBSERVED** — a committed, reproducible probe establishes the exact coordinate;
- **CORROBORATED** — strong non-controlling production evidence;
- **INFERRED** — project recommendation;
- **UNKNOWN** — not established;
- **BLOCKED** — required evidence/capability unavailable.

API presence is not runtime proof. Runtime proof at one coordinate is not a version
range. Research is not implementation or certification.

## GitHub completion law

A lane is incomplete unless it:

- creates its GitHub branch from the required immutable SHA;
- commits an initial receipt and opens a draft PR before long research;
- commits raw report, evidence ledger, fixtures, measurements, and checksums;
- pushes incrementally;
- returns its final branch, head SHA, commits, and draft PR URL.

If GitHub write access is unavailable, stop.
