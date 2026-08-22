# 13-step GitHub publication contract — curation lane

**Repository:** `mannyc2/nycustodianexam`  
**Lane:** `research/curate-effect-v4-bun-prompts`  
**Immutable source:** `agent/chat-corpus-reconciliation` at `8b0d26245c1d78fb0be4e79f874a7d8872056ceb`  
**Draft PR:** #4  
**Audit date:** 2026-08-21

This checklist applies the full publication contract that future research lanes must follow. Probe-only requirements are marked `N/A` rather than fabricated.

| # | Requirement | Status | Evidence / note |
|---:|---|---|---|
| 1 | Verify immutable source SHA | PASS | GitHub comparison confirms merge base and base commit are exactly `8b0d26245c1d78fb0be4e79f874a7d8872056ceb`; lane is ahead-only. |
| 2 | Verify output branch did not already exist | PASS | A GitHub branch search was performed before creation and returned no matching `research/curate-effect-v4-bun-prompts` branch. |
| 3 | Use connected `@GitHub` capability | PASS | Branch, commits, files, PR, comparisons, and metadata were all created/read through the connected GitHub integration. |
| 4 | Create branch immediately | PASS | `research/curate-effect-v4-bun-prompts` was created directly from the immutable source SHA before extended research. |
| 5 | Commit and push initial receipt | PASS | First lane commit `123fcf28a8fbeeb1556ee52bff189936aac0a766` adds `research/prompt-curation/START-RECEIPT.md`. |
| 6 | Open a draft PR before extended research | PASS | Draft PR #4 was opened immediately after the initial receipt and before the main curation work. |
| 7 | Commit complete raw report and source ledger | PASS | `research/prompt-curation/REPORT.md` and `SOURCE-LEDGER.md` are committed, along with Effect skill adaptation and research doctrine. This curation lane consumes upstream sources rather than generating a separate binary raw-research bundle. |
| 8 | Commit machine-readable matrices / decision tables | PASS | `research/prompt-curation/DECISION-MATRIX.csv` is committed. The prompt suite itself is versioned text and the source ledger is tabular Markdown. |
| 9 | Commit exact probe source, `package.json`, `bun.lock`, and raw results for experimental lanes | N/A | This is a documentation/source-curation lane. It performed no package install, runnable fixture, bundle benchmark, storage probe, or other execution experiment. Creating a fake fixture or lockfile would violate the lane scope. Experimental second-pass prompts explicitly require these artifacts when applicable. |
| 10 | Commit raw measurements and checksums | N/A / PASS BY SCOPE | No runtime/bundle/performance measurements were produced. Immutable upstream source coordinates, package versions, repository SHAs, and Git blob history are recorded in `SOURCE-LEDGER.md` and receipts. Future measured lanes must commit raw measurements and SHA-256 manifests. |
| 11 | Push incrementally without force | PASS | The lane contains multiple sequential commits and fast-forward branch updates. No force push was used. |
| 12 | Return branch, final head SHA, commits, and PR URL | PASS AT COMPLETION | The final chat handoff will report the branch, remote head SHA after this checklist commit, commit count, and PR #4 URL. Git cannot self-embed the final commit SHA in a file that contributes to that SHA. |
| 13 | Stop when GitHub writes are unavailable | PASS | GitHub writes remained available, so the lane continued. The shared v2 research contract requires future agents to stop rather than fall back to sandbox-only completion if writes are unavailable. |

## Ahead-only verification

At the pre-final audit, GitHub comparison reported:

- base/merge-base: `8b0d26245c1d78fb0be4e79f874a7d8872056ceb`;
- status: `ahead`;
- behind: `0`;
- 13 commits before this checklist commit;
- 25 changed files before this checklist commit.

## Publication boundary

This lane deliberately does **not** contain:

- a production Bun workspace;
- application `package.json` files;
- a production `bun.lock`;
- application code;
- runtime probes;
- bundle measurements;
- Vite/Wrangler configuration;
- test or workflow implementation.

Those belong to the second-pass research/implementation lanes that have an explicit experimental mandate. The absence of those artifacts here is a scope decision, not a publication omission.
