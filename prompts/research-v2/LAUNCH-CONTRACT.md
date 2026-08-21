# V2 research launch contract

This file defines how the second-pass research prompts are launched after prompt curation.

## Launch-time immutable source

Every launch message MUST provide one exact immutable source SHA.

```text
Repository:
  mannyc2/nycustodianexam

Source branch:
  agent/chat-corpus-reconciliation

Required source SHA:
  <supplied explicitly in the launch message>
```

The source SHA is a launch parameter, not a value that must be committed into the prompt files themselves.

Where a lane prompt or the shared contract contains:

```text
{{POST_CURATION_SOURCE_SHA}}
```

read it as:

```text
<the exact Required source SHA supplied in the launch message>
```

No repository edit is required merely to substitute that token.

If the launch message does not provide an exact source SHA, STOP. Do not infer the current branch head.

At lane start, use the connected `@GitHub` capability to verify that `agent/chat-corpus-reconciliation` still resolves to the supplied SHA. Stop on drift.

## Minimal launch-message form

A valid individual launch message only needs to identify:

1. this repository;
2. the exact immutable source SHA;
3. the lane prompt path;
4. that `LAUNCH-CONTRACT.md` and `00-SHARED-RESEARCH-CONTRACT.md` are controlling;
5. any lane-specific prerequisite PRs that must be read in addition to the prompt.

Everything else—GitHub publication rules, Effect v4/Bun doctrine, allowed paths, output branch, required reading, probes, output files, security constraints, and final receipt—is already defined in the repository prompt suite.

Do not duplicate the full shared contract into chat launch prompts.

## GitHub completion rule

Every lane must use `@GitHub` from the beginning. A lane is not complete unless its exact outputs are committed and pushed to its authorized branch and exposed through a draft PR.

If GitHub writes are unavailable, the lane stops instead of producing a sandbox-only substitute.

## Effect/Bun baseline

All lanes inherit the maintained constraints already present in the source corpus:

- latest available Effect v4 only for production-facing research;
- Effect v3 only as historical, migration, or regression evidence;
- current installed-package Effect guidance/source workflow;
- Bun and Bun workspaces;
- top-level `apps/` and `packages/`;
- Effect-native services, Layers, Schema, error, Scope, runtime, concurrency, and testing patterns;
- no generic `domain/application/ports/adapters/ui` package ontology;
- no Effect-as-renderer assumption;
- standards-first semantic HTML/CSS;
- durable IndexedDB commit before reveal;
- Cloudflare Workers Static Assets direction unless later evidence changes it.

## Synthesis source

The final synthesis lane may use the same immutable source SHA while reading completed research PR branches directly. It must not assume research PRs were merged into the source branch.
