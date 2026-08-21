# Start Receipt — Chat Research Recovery

- Repository: `mannyc2/nycustodianexam`
- Source branch: `agent/chat-corpus-reconciliation`
- Required source SHA: `22bfe0badbf3badf0e13517d48c5707c63b6d38e`
- Observed source identity: identical to the required SHA (`ahead_by: 0`, `behind_by: 0`)
- Recovery branch: `research/chat-output-recovery`
- Timestamp: `2026-08-21T05:43:38-04:00` (`America/New_York`)
- GitHub access method: connected GitHub connector; repository permissions reported `admin`, `maintain`, and `push`

## Capability gates

### GitHub

**PASS.** Repository read/write access was verified. The immutable source ref was compared against the required SHA and was identical. The recovery branch did not exist and was created from the exact source SHA.

### Chat history

**PARTIAL.** Account-backed conversation discovery/search is available through the session's personal-context interface, but a direct test against `Research Effect Architecture — Browser-First Study Application` returned only a concise evidence summary and explicitly did not retrieve the complete user-visible transcript or exact assistant deliverable.

Accordingly, this recovery follows the request's limited-path rule:

- exact files that can be located and materialized may be recovered;
- transcript-only work is classified `FULL-TRANSCRIPT-UNAVAILABLE`;
- summaries, snippets, recollections, and orchestration bullets are discovery evidence only and are not committed as original research deliverables.

### Files / Library

**PASS for file discovery and exact-byte recovery.** The current conversation contains no uploaded files. Library search located `Pasted markdown(20260821-022845).md`, MIME type `text/markdown`, beginning with `# Effect browser bundling: findings and recommendation`. Exact-byte materialization, checksum calculation, security inspection, and GitHub comparison remain to be performed after this checkpoint.

## Starting branch inventory

1. `agent/chat-corpus-reconciliation`
2. `main`

The requested output branch `research/chat-output-recovery` was absent before creation.

## Starting pull-request inventory

### PR #1 — Recover and normalize prior project corpus

- URL: `https://github.com/mannyc2/nycustodianexam/pull/1`
- State: open
- Draft: yes
- Base: `main`
- Base SHA: `92efee4fb2cfd0f6032d0f9348cb8cc8ba89356c`
- Head: `agent/chat-corpus-reconciliation`
- Head SHA: `22bfe0badbf3badf0e13517d48c5707c63b6d38e`
- Commits reported: 30
- Merge status: not merged

No other pull requests were returned by the starting inventory query.

## Scope at checkpoint

Only paths under the following prefixes are authorized:

- `research/chat-recovery/**`
- `research/orchestration/**`

No maintained authority file has been edited. No prior-chat research has yet been imported. No secure or unrelated personal content has been copied.
