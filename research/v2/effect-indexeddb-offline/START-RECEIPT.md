# R2.4 start receipt

- Repository: `mannyc2/nycustodianexam`
- Source branch: `agent/chat-corpus-reconciliation`
- Immutable source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Output branch: `research/v2-effect-indexeddb-offline`
- UTC start time: `2026-08-21T22:08:50Z`
- Lane: R2.4 — Effect v4 IndexedDB, local progress, and offline packs
- Allowed paths: `research/v2/effect-indexeddb-offline/**`
- Draft PR base: `agent/chat-corpus-reconciliation`
- GitHub access result: **CONFIRMED** — source PR #1 reports `agent/chat-corpus-reconciliation` at the exact required SHA; the output branch did not exist and was created from that SHA.
- Launch contract: `prompts/research-v2/LAUNCH-CONTRACT.md`
- Shared contract: `prompts/research-v2/00-SHARED-RESEARCH-CONTRACT.md`
- Lane prompt: `prompts/research-v2/04-effect-v4-indexeddb-offline.md`

## Intended scope

Research and probe the durable browser persistence and explicit offline-pack architecture using the latest available Effect v4 line and current browser platform support. Compare the official Effect browser IndexedDB facilities with a thin native IndexedDB service, `idb`, Dexie, and any justified maintained alternative; design durable attempt commit semantics, event/projection behavior, offline-pack state, cross-tab coordination, service-worker/cache ownership, migrations, failure taxonomy, and browser tests.

This lane will not edit application code or maintained authority and will not touch paths outside the authorized research directory.

## Initial upstream coordinates

No package or upstream version coordinate is asserted at this checkpoint. Per the controlling contract, exact current Effect v4, coordinated Effect ecosystem, Bun, browser/platform, and comparison-library coordinates will be established only after this early GitHub checkpoint and recorded in the source ledger and final receipt.
