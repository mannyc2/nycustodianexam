# Initial research pass — normalized intake

**Normalization date:** 2026-08-21  
**Source archive:** user-supplied `8f7353c8-08fd-4677-bfeb-69a595dd0638.zip` (checksum recorded; extracted research committed)  
**Source archive SHA-256:** `40cfab3f2a0a6d26782b7e24776d4d595ba6cef86389836030134844c3aaeff5`

This directory preserves the first batch of completed research that originally lived outside GitHub and reconciles it against the project's current direction.

It contains three deliberately separate layers:

1. **Raw inputs** under `raw/` — exact supplied reports plus review-relevant extracted geometry research. The exact source-archive checksum and excluded binary inventory are retained without duplicating the ZIP in GitHub.
2. **Normalization** — deduplication, conflict analysis, and reusable findings.
3. **Current constraints / redo plan** — maintainer decisions that govern the next research pass.

The normalized documents are not a substitute for rereading the raw reports. They do not silently rewrite the first-pass evidence into an Effect v4 result.

## Current maintainer direction

- target the latest Effect v4 line;
- do not use Effect v3 as the production architecture baseline;
- future research should follow current Effect v4 patterns and package organization directly;
- use Bun, Bun workspaces, and an `apps/` / `packages/` monorepo shape;
- preserve standards-first semantic HTML/CSS and Cloudflare deployment direction unless later evidence changes them;
- do not carry the first pass's proposed `src/domain/application/ports/adapters/ui` tree forward as the repository architecture;
- preserve raw research and distinguish it from maintained decisions.

## Read order

1. `CURRENT-CONSTRAINTS.md`
2. `NORMALIZATION.md`
3. `REUSABLE-FINDINGS.md`
4. `DUPLICATION-AND-SUPERSESSION.md`
5. `REDO-REQUIRED.md`
6. `DECISION-MATRIX.csv`
7. `EXCLUDED-BINARY-LEDGER.csv`
8. raw reports as needed

## Important result

The first pass contains useful behavioral invariants and research methods, but it does **not** supply an acceptable final Effect architecture under the new v4/Bun constraints. The relevant lanes need focused reruns rather than a mechanical version-number replacement.
