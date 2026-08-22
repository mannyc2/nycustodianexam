# Implementation sequence (DRAFT)

Ordered, each step gated by the previous. Steps 1–3 are unblocked today.

1. **Consolidation close-out** — merge R2.8 (PR #19) when it publishes, or
   descope it into the implementation QA contract; follow-up PR from
   `agent/chat-corpus-reconciliation` to `main`; promote this draft through
   the formal R2.90 lane (own branch + draft PR per launch contract) or a
   maintainer decision that the draft suffices.
2. **Authority reconciliation PR** — update
   `product/ARCHITECTURE_CONSTRAINTS.md` from the accepted decisions
   (cohort, workspace policy, provider, renderer posture, SW boundary,
   budgets) — maintainer-reviewed; research directories stay evidence, not
   authority.
3. **Scaffold PR** — the four-workspace graph exactly as fixtured in
   `research/v2/probe-execution/r2.7/` (catalog, isolated linker, pinned Bun,
   root scripts in filter-then-script form), Vite 8 app shells, CI with
   `bun ci` + typecheck + test DAG. Gate: `bun ci` green, byte-reproducible
   build, budgets wired into the size script.
4. **GA/coordinate recheck** — if Effect v4 GA has landed by scaffold time,
   rerun the compile/probe contract at the exact GA coordinate and lock; else
   lock rc.111 and record the recheck trigger.
5. **Vertical slice PRs** — per `VERTICAL-SLICE-PLAN.md`, smallest reviewable
   increments: content fixture + compiler gate → static page → player island
   → durable commit → tests/preview.
6. **MV1 content production in parallel** — question set (30–60 items) with
   rationales/sources, tool-family pages for rights-clean geometry, print
   output, sources/corrections pages (PLAN.md §3). Content work does not wait
   on steps 3–5.
7. **MV1 assembly and ship** — all FEATURE_SPEC MUSTs in the MV1 cut green;
   deferred features tracked, not smuggled in.
8. **Post-MV1** — offline packs + SW precache policy, spaced review, hazard
   pilot (R2.9), simulations, Firefox/WebKit matrix, optional Worker
   endpoint per product decision.
