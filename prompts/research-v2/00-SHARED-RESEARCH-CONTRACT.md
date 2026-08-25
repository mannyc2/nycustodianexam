# Archived shared contract for the closed R2 program

**Historical status:** the R2.1–R2.10/R2.90 program is closed and reconciled.
Some requested runtime probes and measurements remained blocked or incomplete.
This contract records intended rules; it is not a runnable current launch contract.

The exact prior inputs and outputs are recoverable at immutable pre-cleanup
commit
[`6701e83290c56d9c5f04275a30fc6ada6bd40435`](https://github.com/mannyc2/nycustodianexam/tree/6701e83290c56d9c5f04275a30fc6ada6bd40435).
Accepted conclusions are maintained in
[`product/ARCHITECTURE_CONSTRAINTS.md`](../../product/ARCHITECTURE_CONSTRAINTS.md),
open implementation evidence in [`docs/OPEN.md`](../../docs/OPEN.md), and retained
supporting evidence in [`research/README.md`](../../research/README.md).

## Intended rules preserved from the historical contract

The contract required a lane to:

1. receive and verify an exact immutable source SHA with connected GitHub;
2. stop on source drift, a pre-existing output branch, or unavailable writes;
3. create its authorized branch before extended work;
4. open an early draft PR and push incrementally without force;
5. change only its authorized research output path;
6. separate current official/source evidence, documented contracts, exact
   runtime observations, inference, and unknowns;
7. use latest Effect v4 and Bun coordinates rather than v3/package-manager
   fallbacks;
8. read installed Effect package guidance/source before code-level conclusions;
9. keep browser, service-worker, Bun, workerd, and test runtime claims distinct;
10. preserve exam-security, rights, accessibility, privacy, and no-answer-leak
    boundaries; and
11. return branch, commit, head SHA, and draft PR coordinates without merging.

These are the intended rules, not a claim that every historical run satisfied
them. The exact receipts at the archive coordinate record actual execution and
limitations. In particular, R2.6 was later recovered from a checked current-main
base because its original launch placeholder had never been populated; its
receipt explicitly disclaims retroactive launch-contract compliance.

## Why the old paths are absent at HEAD

The closed program produced useful conclusions but also receipts, temporary
links, environment dumps, duplicate raw formats, generated build output,
fixtures, and overlapping reports. Plan 003 promoted accepted conclusions to
their maintained consumers and removed the working corpus. Git history at the
immutable coordinate above is the audit/recovery mechanism.

## Successor rule

A new investigation must define a new question, canonical consumer, mutation
scope, exact source SHA, output branch, and minimal durable evidence set. Read
current `AGENTS.md` and maintained authority first. Do not substitute this
historical contract or relaunch an old lane unchanged.
