# Agent instructions

This repository is a provenance-tracked research corpus for a free NY civil-service Custodian exam study site.

## Canonical documents

The canonical project state lives in `docs/`:

- `docs/FACTBASE.md` — established exam/logistics/legal facts.
- `docs/SCOPE.md` — testable content facts and source basis.
- `docs/TAXONOMY.md` — tool/hazard taxonomy and evidence tiers.
- `docs/LANDSCAPE.md` — competitive, pedagogical, accessibility, product, and SEO evidence.
- `docs/OPEN.md` — unresolved questions, conflicts, and pending work.

Do not treat generated research reports, chat summaries, old prompts, or derivative files as canonical when they conflict with these documents.

## Evidence rules

- Preserve provenance and dates.
- Distinguish official evidence, reputable secondary evidence, anecdote, and inference.
- Prefer newer official material over older official material; official material over commercial material; commercial material over anecdote.
- Do not silently resolve contradictions. Record them in `docs/OPEN.md` unless a controlling source clearly resolves the conflict.
- Do not turn an editorial recommendation into an exam fact.
- Unknown facts stay unknown.

## Exam-security boundary

Never request, reproduce, reconstruct, summarize, paraphrase, store, or publish secure or remembered examination questions, drawings, answer choices, or keys.

Officially published sample questions may be discussed only within their lawful/public context. Historical material requires an explicit rights/security determination before content ingestion.

## Site-content rules

- The site is independent and unofficial.
- Practice questions and illustrations must be original or have verified rights.
- Never advertise "actual questions," leaked answers, guaranteed passing, fabricated review counts, or unsupported official-length/weight/score claims.
- Entry-level and high-level series content remain separate unless evidence explicitly establishes overlap.
- Every scored explanation should ultimately expose a source basis.

## Research workflow

Before a research pass:

1. Read the relevant canonical docs.
2. Identify what is already established so it is not re-researched unnecessarily.
3. State the cutoff date for time-sensitive findings.
4. Search primary/official sources first.
5. Record genuine gaps as gaps rather than filling them with assumptions.

When merging research:

1. Diff against the canonical files.
2. Merge one research input at a time.
3. Preserve source URLs/citations and observation dates.
4. Update `docs/OPEN.md` for new conflicts or unresolved questions.
5. Do not delete superseded evidence when it is useful to understand a dated change; mark its status instead.

## Implementation status

The repository is docs-first. Do not introduce a framework, package manager, deployment provider, analytics vendor, or application architecture unless the task explicitly calls for implementation and the decision is supported by the current product requirements.
