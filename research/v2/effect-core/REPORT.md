# Effect v4 Core Architecture Research

Status: research in progress

Repository: `mannyc2/nycustodianexam`
Base branch: `agent/chat-corpus-reconciliation`
Resolved immutable base: `8b0d26245c1d78fb0be4e79f874a7d8872056ceb`
Research cutoff: 2026-08-21

This draft PR was opened before extended research, as requested. The final report will replace this initialization note and will remain documentation-only.

Scope:

- Effect v4 service and Layer architecture
- `Effect.fn` and `Effect.gen` conventions
- typed error taxonomy and `Schema.TaggedError`
- scopes, resources, and structured concurrency
- Clock, Random, and DateTime ownership
- runtime roots and ManagedRuntime boundaries
- browser, build, service-worker, Cloudflare, and test runtime ownership
- smallest sensible Bun workspace topology under `apps/` and `packages/`

Repository note: `prompts/research-v2/00-SHARED-RESEARCH-CONTRACT.md` was not present at the resolved base. The explicit task instructions and `AGENTS.md` govern this draft; the final source ledger will record the missing requested input without claiming it was read.
