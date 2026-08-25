# Archived R2 launch contract

**Historical status:** the R2.1–R2.10/R2.90 program is closed and reconciled;
some requested runtime probes and measurements remained blocked or incomplete.
This file records intended launch rules, not a current launch contract.

The exact prior prompts, inputs, and outputs are recoverable at immutable
pre-cleanup commit
[`6701e83290c56d9c5f04275a30fc6ada6bd40435`](https://github.com/mannyc2/nycustodianexam/tree/6701e83290c56d9c5f04275a30fc6ada6bd40435).
Accepted conclusions are maintained in
[`product/ARCHITECTURE_CONSTRAINTS.md`](../../product/ARCHITECTURE_CONSTRAINTS.md),
open implementation evidence in [`docs/OPEN.md`](../../docs/OPEN.md), and the
reduced evidence map in [`research/README.md`](../../research/README.md).

## Historical launch semantics

The contract required each original lane to receive one exact immutable source
SHA in its launch message. The `{{POST_CURATION_SOURCE_SHA}}` token meant that
supplied SHA; it never meant a moving branch head or a repository edit. The
contract also required connected-GitHub verification, early branch/draft-PR
publication, incremental pushes without force, and a stop on drift or missing
writes.

Those requirements do not prove that every historical run complied. The exact
archived receipts control actual execution history and limitations. R2.6 was
later recovered from checked current main because its original placeholder was
never populated; its receipt explicitly makes no retroactive-compliance claim.

The exact original lane files at the archive coordinate retain the source
branch, output branches, path permissions, receipt requirements, fixtures, and
raw-result layouts. The current synopses and `LANE-INDEX.csv` preserve only the
question, branch/output coordinates, actual outcome, and current consumer. None
of that history instructs recreation of deleted research trees at HEAD.

## Successor rule

A new research task needs a fresh question, canonical consumer, exact immutable
source SHA, output branch, allowed mutation scope, and minimal durable evidence
set. Start from current `AGENTS.md`, maintained authority, `docs/OPEN.md`, and
`research/README.md`. Do not substitute this archived contract or relaunch an
old R2 lane unchanged.
