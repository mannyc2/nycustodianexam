# NYS Entry-Level Custodians & Janitors — Exam Research Corpus

Provenance-tracked knowledge base for a free study site covering the New York State
**Entry-Level Custodians and Janitors** civil-service written test series (a statewide
DCS-prepared series), with a **Nassau County** logistics layer. The series is used by
40+ Nassau school-district/library/BOCES jurisdictions and by local commissions across
NY State; the site's audience rule extends coverage to any jurisdiction whose
announcement uses the same three-subject plan.

## Documents (`/docs`)
| File | Role |
|---|---|
| `FACTBASE.md` | Established facts: exam identity, format, scoring, logistics, legal framework, titles, jurisdictions |
| `SCOPE.md` | Scope-of-test extraction — individually testable facts with citations (question-bank foundation) |
| `TAXONOMY.md` | Tool & hazard taxonomy: name / use / confusable-with / source, with evidence tiers |
| `LANDSCAPE.md` | Competitive landscape, learning-science evidence, accessibility & design guidance |
| `OPEN.md` | Conflicts-and-gaps ledger: every unresolved question, contradiction, and pending action |

## Research prompts (`/prompts`)
Ready-to-run prompts for the next research passes. **Always attach or point the
researcher at the canonical `/docs` files** — two prior passes failed corpus control
by diffing against derivatives.

## Provenance rules (summary)
- Every fact carries a tier tag ([OFFICIAL]/[COMMERCIAL]/[ANECDOTE]/[INFERRED]) and date.
- Nothing enters SCOPE or TAXONOMY without a citation; conflicts are logged, never silently merged.
- Precedence: newer official > older official > commercial > anecdote.
- **Test security:** no secure, remembered, or reconstructed examination items — ever.
  The only lawfully published questions for this series are the official DCS guide samples.

## Workflow
Research outputs are merged into `/docs` one at a time with a per-input changelog;
"assemble" produces final documents plus a build brief.

## Repository status

This repository is currently **docs-first**. Application code, framework selection, deployment configuration, and a repository-wide license are intentionally deferred until the research corpus and initial content-production contracts are stable.

See [`AGENTS.md`](AGENTS.md) for agent/research rules and [`CONTRIBUTING.md`](CONTRIBUTING.md) for contribution boundaries.
