# R2.3 - Effect v4 Platform and runtime capability matrix

This lane maps current Effect v4 capabilities across four deliberately distinct runtime edges:

- browser page;
- Bun content compiler and tooling;
- browser Service Worker;
- Cloudflare workerd.

It compares direct native APIs, native APIs inside cohesive project-owned Effect services, current official Effect v4 abstractions, and maintained alternatives only when a concrete gap requires one.

## Immutable project source

- Repository: `mannyc2/nycustodianexam`
- Source branch: `agent/chat-corpus-reconciliation`
- Required source SHA: `00155a1d555d1d4c84f3ab9682ee876dd2a57fbb`
- Output branch: `research/v2-effect-platform-runtimes`
- Draft PR: `https://github.com/mannyc2/nycustodianexam/pull/13`

## Current upstream coordinates

- Effect source: `Effect-TS/effect@436f10d1efccec308426532ff3f88df9a96434f3`
- Latest source version observed: `4.0.0-rc.111`
- Current official Bun tag: `bun-v1.4.0`
- Bun tag commit: `d6d12356646cf2f424208e8cec1261b9661c517b`
- Runtime fixture candidate: one coherent published Effect cohort at `4.0.0-rc.110`, because the Bun adapter registry line had not reached source `rc.111` at observation time.

Source existence, registry publication, executable observation, and project recommendation are kept separate throughout the lane.

## Preliminary evidence

Closed, unmerged PR #7 is inspected only as preliminary evidence. Its source map and architecture hypotheses are useful, but its Bun installation, lockfile, installed-package guidance, browser, bundle, and workerd probes were all blocked. This lane independently re-checks those gates and does not promote PR #7's blocked claims to observations.

## Evidence directories

- `fixtures/runtime-matrix/` - private exact-version probe fixture;
- `raw-results/` - environment, commands, stdout/stderr, browser/workerd observations, and bundle measurements;
- root lane files - audits, matrices, report, ledgers, receipts, and checksums.

## Evidence labels

- **CONFIRMED** - current official declarations, documentation, or source establish the claim;
- **OBSERVED** - a committed reproducible probe establishes the exact coordinate;
- **CORROBORATED** - strong secondary production evidence;
- **INFERRED** - project recommendation;
- **UNKNOWN** - not established;
- **BLOCKED** - required evidence or capability was unavailable.

This directory is architecture research and reproducible evidence. It is not application implementation, a dependency lock for production, or runtime certification.