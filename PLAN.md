# Consolidation and minimum-version plan

Status snapshot taken 2026-08-22 (UTC). This document is the finishing plan for the
open v2 research program and the path to a first shippable minimum version of the
study site. It is a working plan, not a canonical exam-fact document; `docs/` remains
controlling for facts and `product/FEATURE_SPEC.md` for product behavior.

---

## 1. Where we are

### Branch/PR topology

- `main` still holds only the initial corpus import (9 commits). Everything since
  lives on `agent/chat-corpus-reconciliation` (**PR #1**, open since 2026-08-19,
  106 commits ahead of main). That branch already absorbed recovery, normalization,
  prompt curation, the v2 launch contract, and supersession bookkeeping
  (merged PRs #3, #4, #8, #9, #10).
- Nine research-lane PRs (#11–#19) are open, all based on the same integration SHA
  (`00155a1`), each writing only under its own `research/v2/<lane>/**` allowed path.
  The paths are disjoint by contract, so the lanes merge cleanly in any order.
- Closed-unmerged PRs #2, #5, #6, #7 are recorded as superseded preliminary
  evidence; no action needed.

### Lane status (R2.x per `prompts/research-v2/LANE-INDEX.csv`)

| Lane | PR | State |
|---|---|---|
| R2.1 core topology | #11 | Substantive report published; Bun install/runtime probes **blocked** (no network/Bun in the research sandbox) |
| R2.2 UI reactivity | #12 | Closed with receipt; same runtime-probe blocks recorded |
| R2.3 platform/runtime matrix | #13 | Closed with receipt; blocked probes committed as unexecuted fixtures |
| R2.4 IndexedDB/offline | #14 | Closed with receipt; browser execution blocked by managed-Chromium policy |
| R2.5 browser bundling | #15 | **Blocked-lane receipt** — fixtures and pinned cohort committed, zero measurements executed |
| R2.6 schema/content compiler | — | **Never launched** (no branch exists) |
| R2.7 Bun monorepo discipline | #18 | Start receipt only — last commit 10:46 UTC today, possibly still running |
| R2.8 testing/a11y/perf/observability | #19 | Start receipt only — last commit 10:25 UTC today, possibly still running |
| R2.9 hazard-scene production | #16 | **Complete** as method lane; requires a 24-scene evidence pilot before production adoption |
| R2.10 tool geometry audit | #17 | Complete audit; four tools flagged `evidence-blocked` |
| R2.90 architecture synthesis | — | Not launched; gated on R2.1–R2.8 complete-or-explicitly-missing |

> **Update (2026-08-22, later the same day):** the probe-execution pass
> described in §2 step 4 has been run — see `research/v2/probe-execution/`
> (FINDINGS.md maps every blocked question to its observed answer). The
> systemic blocker below is materially closed for R2.1–R2.5; decision D3 is
> resolved (a network-enabled Bun/Chromium/workerd environment exists and
> the fixtures pass in it). R2.90 synthesis can now run on measured evidence.

### The one systemic problem

Every Effect/Bun/browser lane hit the same wall: the research environments had no
outbound network, no Bun executable, and a policy-locked browser. The lanes did the
honest thing — published source-analysis findings plus committed, pinned, ready-to-run
fixtures with explicit blocked receipts — but it means **no architecture claim has
runtime proof yet**. The backlog of unexecuted probes (bun install/lock, bundle-size
measurements, IndexedDB behavior, platform matrix) is fully specified and pinned
(Bun 1.4.0, effect@4.0.0-rc.111, Vite 8.2.2, etc.). It needs one network-enabled
execution pass, not more prose research.

A second, softer problem: the program is accumulating meta-work (receipts, ledgers,
supersession records) faster than product progress. The receipts served their purpose;
the plan below deliberately caps further bookkeeping.

---

## 2. Finish the research program

**Step 1 — Let the in-flight lanes land or time out.** R2.7 (#18) and R2.8 (#19)
committed within the last hour of this snapshot. Do not reassign or close them until
they have been quiet for a day. If they stall, relaunch each once with its existing
prompt, or descope (see decision D2).

**Step 2 — Merge the finished lane PRs into the integration branch.**
#11–#17 in any order (disjoint paths, same base). Do not wait for R2.7/R2.8 to do
this. Then merge PR #1 into `main`, retargeting/merging any remaining lane PRs first
or after — either works, but the goal is that **main becomes current within days,
not weeks**. An open integration PR carrying 100+ commits is itself a risk.

**Step 3 — Skip or descope R2.6.** The schema/content-compiler question matters for
the content pipeline, but it does not gate a minimum version (the MVP below can ship
with hand-validated JSON/Markdown content and a trivial build script). Recommended:
fold a reduced R2.6 question set into the synthesis lane instead of launching a
tenth research lane.

**Step 4 — Run the probe-execution pass, then synthesis (R2.90), as one effort in a
network-enabled environment.** This is the highest-leverage single task remaining:

1. execute the committed fixtures from R2.1/R2.3/R2.4/R2.5 (bun install, truthful
   lockfiles, bundle measurements, browser/IndexedDB probes) and commit raw results
   against each lane's open questions;
2. then write the R2.90 synthesis on top of *measured* evidence: proposed
   architecture, package graph, and an implementation sequence.

Do not launch R2.90 as prose-only over blocked evidence — that would replicate the
existing weakness. If a network-enabled environment truly cannot be had, R2.90 must
mark every unmeasured claim provisional and the MVP falls back to the static-first
track (D3).

**Step 5 — Stop opening research lanes.** After R2.90, new questions go to
`docs/OPEN.md` or become implementation tasks. The next branch after synthesis
should contain application code or shippable content.

---

## 3. Minimum version (MV1)

Derived from the MUSTs in `product/FEATURE_SPEC.md`, cut to the smallest honest
slice. MV1 is a **static-first, phone-first, free site** with:

1. **Exam profile page** rendered from versioned `docs/FACTBASE.md` data — what the
   test is, the three-subject plan, logistics, with unknowns explicitly marked
   (C1/C2 ledger discipline preserved).
2. **Tool-family study content** for the tools with rights-clean geometry: the
   existing deterministic SVG examples (step ladder, wrenches, plungers per the
   R2.10 audit — only those that clear `evidence-blocked` status or get re-derived).
3. **One original practice question set** (target: 30–60 items) with
   commit-before-reveal, a correct rationale, a rationale per distractor, and source
   lines for every item — the FEATURE_SPEC's non-negotiables.
4. **Print output** (questions, answer sheet, key/explanations, text equivalents).
5. **Sources/corrections/security/unresolved-facts page** straight from the corpus.
6. Accessibility equivalents authored with the content, not retrofitted.

**Explicitly deferred past MV1:** hazard-scene marking (gated on the R2.9 24-scene
pilot), practice simulations, spaced review, offline packs/service worker,
cross-tab sync, observability. Each has research backing already; none is needed to
put honest value in front of a candidate.

**Sequencing:** research consolidation (§2 steps 1–3) ⟶ probe pass + synthesis
(step 4) ⟶ MV1 scaffold per synthesis ⟶ MV1 content production ⟶ ship. If step 4
stays blocked >1 week, start MV1 as a plain static site (no framework commitment)
so content production is not hostage to architecture research; the Effect/Bun
decision then lands in MV2.

---

## 4. Decisions needed

- **D1 — Merge authority/order:** confirm merging #11–#17 then #1 into main as
  described in §2 step 2.
- **D2 — R2.7/R2.8 fate** if still silent after a day: relaunch once vs. descope
  into synthesis.
- **D3 — Probe environment:** can a network-enabled Bun/browser environment be
  provided for step 4? If not, adopt the static-first fallback for MV1 now.
- **D4 — MV1 question-set size and which tool families make the cut**, pending the
  R2.10 rights/evidence reconciliation.
