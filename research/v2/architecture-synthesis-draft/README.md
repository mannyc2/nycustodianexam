# R2.90 architecture synthesis — DRAFT

**This is a draft of the R2.90 synthesis, published on the planning branch
(`claude/research-branches-planning-w99r3u`), not the formal
`research/v2-architecture-synthesis` lane.** It exists so implementation
planning is not blocked while R2.8 finishes publishing.

Contents:

- `ARCHITECTURE-DECISION-PROPOSAL.md` — the 18 required decisions with
  evidence status and adoption recommendations
- `LANE-LEDGER.csv` — which lanes were available and their evidence ceiling
- `VERTICAL-SLICE-PLAN.md` — first implementation slice acceptance contract
- `IMPLEMENTATION-SEQUENCE.md` — ordered path to MV1
- `UNRESOLVED.csv` — every open item with its gate and owner

Inputs: the merged lane research on `main` (all ten launched lanes:
R2.1–R2.5, R2.7–R2.10) and the executed runtime evidence in
`research/v2/probe-execution/` (same branch as this draft). R2.6 never
launched (folded in as D7).

Promotion path: either run the formal R2.90 lane per
`prompts/research-v2/90-architecture-synthesis.md` using this draft as
input, or adopt this draft directly by maintainer decision. Either way,
maintained authority (`product/ARCHITECTURE_CONSTRAINTS.md`) changes only in
a separate maintainer-reviewed reconciliation PR.
