# R2.90 final receipt

## Publication identity

- Repository: `mannyc2/nycustodianexam`
- Lane: R2.90 — architecture synthesis
- Canonical base: `d94981c62e3834177f0db9bc387b2c601c40636b`
- Output branch: `research/v2-architecture-synthesis`
- Draft PR: `https://github.com/mannyc2/nycustodianexam/pull/23`
- Allowed root: `research/v2/architecture-synthesis/**`
- Start receipt commit: `807aa16b692886ea0f59f4127b16d7f2ac3d04a0`
- Clean synthesis publication commit: SELF — resolve from PR/head after this receipt and
  `MANIFEST.sha256` are committed.

## Inputs synthesized

- Merged R2.1-R2.5 and R2.7-R2.10 lane artifacts at the canonical base.
- Recovered R2.6 draft PR #22 at
  `3ac16261db8a131d2feb03658d3a7e9ceb3d44f4`.
- Maintained architecture/product/research authority at the canonical base.
- Official Effect `effect@4.0.0-rc.111` tag, locally inspected at
  `648f566dd259898e7697c7fcb796183ccbc474ab`.
- Official Bun 1.4 release information.
- Maintainer direction on Tier A/B launch scope, Codex-native image generation,
  and the public released-test-image style reference.

## Principal result

The first R2.90 run proposes a three-workspace implementation graph, focused
Effect services and host-specific roots, the R2.6 compiler pipeline, strict
commit-before-reveal persistence, generation-flip offline packs, semantic static
HTML with a lazy direct-DOM player, Vite/Cloudflare Static Assets delivery, and a
truthful runner/accessibility/artifact verification split.

R2.6 is sufficient to adopt the compiler architecture and begin the compiler
spine. R2.9 was completed architecture research but did not produce the hazard
scene bank. R2.5 remains incomplete for numeric bundle evidence, and R2.10 remains
evidence-blocked for its POCs.

## Visual authority boundary

This synthesis records but does not silently resolve the conflict between current
maintainer direction and maintained R2.9 deterministic-first language. It
recommends a separate authority-reconciliation PR before scored visual production.
The proposed Codex pilot uses only public released test samples as style reference,
tests obscure-tool fidelity and batching economics, and treats accepted reviewed
final bytes as immutable compiler inputs.

## Verification performed

- All five synthesis CSV files parsed with consistent row widths:
  - 18 decisions;
  - 11 lane records;
  - 12 open questions;
  - 16 source records;
  - 15 unresolved records.
- `git diff --check` passed before the substantive commit.
- README-local artifact links resolved.
- The published synthesis diff changes only
  `research/v2/architecture-synthesis/**`.
- R2.6 evidence was independently validated before synthesis: TypeScript passed,
  four tests passed, the probe passed, repeat diagnostics/hashes were stable, and
  its manifest verified.

## Scope and remaining gates

This branch contains research and implementation handoff artifacts only. It does
not scaffold the application, merge either draft PR, approve any content or visual,
establish numeric bundle budgets, or certify accessibility.

Only official/public source-backed exam content is admissible into repository
evidence and implementation rationale. Robustness requirements use generic
variable-size and independently sourced item-format fixtures.

The version/workspace, JSONC/canonicalization, real-browser IndexedDB/offline,
provider, route-closure, manual assistive-technology, visual-authority, and visual-
fidelity gates remain explicit in `UNRESOLVED.csv` and the vertical-slice plan.

After the final commit, publication closure requires checking the remote branch
head, draft PR status, changed-file confinement, and `sha256sum -c
MANIFEST.sha256`.
