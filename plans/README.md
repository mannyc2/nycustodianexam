# Implementation Plans

Revised on 2026-08-28. Plans 001-003 record the completed visual-production and
research-normalization sequence. Plans 004-008 form a new consumer UI/UX
research program planned at commit `e6f9119`. They assume the current route and
feature inventory is the intended product, but do not assume the current copy,
navigation, visual system, layout, component presentation, or interaction
hierarchy is acceptable.

The new sequence is research and product-contract work. It does not authorize a
production redesign. Its output is the evidence and implementation-ready
specification needed before production UI work begins.

The established 65-concept tool/PPE inventory and 14 comparison records are
inputs, not a separate planning phase. The visual pilot is a mandatory
checkpoint inside production, not a separate project.

## Execution order and status

| Plan | Title | Priority | Effort | Depends on | Status |
|---|---|---:|---:|---|---|
| 001 | Generate and approve the complete tool/PPE visual library | P1 | L | — | DONE — 65 accepted masters and 14 accepted deterministic comparisons verified |
| 002 | Generate and approve the launch hazard-scene bank | P1 | L | Plan 001 pilot checkpoint | DONE — 18 accepted scenes passed exact-pixel independent review, release verification, and checksum closure |
| 003 | Normalize and reduce the research corpus through connected @GitHub | P1 | L | Plans 001 and 002 merged; exact post-visual `main` SHA | DONE — PR #27 merged; maintained authorities and the retained research map now own the reconciled result |
| 004 | Establish the consumer-language boundary | P1 | L | —; coordinate vocabulary and recruitment with Plan 005 | BLOCKED — 120-family desk audit complete (79 `REWRITE`); benchmark partial; eight `CL-1` prototypes authored but not piloted/frozen; no participant round or selected direction (open draft PR #37) |
| 005 | Rebuild navigation around learner tasks | P1 | L | — to start; Plan 004 before final first-click round and promotion | BLOCKED — unvalidated 21-family/32-route/4-spoke task inventory complete; no participant study, candidate hierarchy, accepted decision, or product-contract promotion (open draft PR #38) |
| 006 | Select a consumer visual system and route archetypes | P1 | L | Plans 004 and 005 | BLOCKED — cannot create its branch; Step 1 requires Plans 004 and 005 DONE in `origin/main` plus `product/CONTENT_DESIGN.md` |
| 007 | Specify shared UI foundations and responsive route-family contracts | P1 | L | Plans 004, 005, and 006 | BLOCKED — cannot create its branch; Step 1 requires Plans 004-006 DONE in `origin/main` plus three promoted research artifacts |
| 008 | Run integrated consumer UX and accessibility validation | P1 | L | Plans 004, 005, 006, and 007 | BLOCKED — cannot create its branch; Step 1 requires Plans 004-007 DONE in `origin/main` |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (with one-line reason) |
REJECTED (with one-line rationale)

## Current execution state

Recorded 2026-08-28 after fetching `origin/main` at
`e84f28e34549688bea6fab4c7fc574f812d72f46`.

The whole 004-008 sequence is gated on evidence that only a human can supply.
Each plan forbids substituting agents, generated personas, role-played
candidates, or expert review for participant evidence, and each requires its
authorizations to be structured, unedited comments posted by the chartered
decision owner on that plan's own draft PR. Every retained verifier resolves
those comments live through `gh`, checks the author login and that the comment
was never edited, and compares the SHA-256 of the exact body. An executor
cannot satisfy any of these gates on the owner's behalf, by design.

| Plan | Branch | Draft PR | Where it stops |
|---|---|---|---|
| 004 | `codex/uiux-consumer-language` | #37 | Steps 1-4 complete; Step 5 benchmark partial; Step 6 authoring only. Pilot, R1/R2 freezes, participant rounds, owner decision, and promotion remain undone |
| 005 | `codex/uiux-task-navigation` | #38 | Research setup and fixed route/task inventory only. Participant protocol onward remains undone; final labels/round/promotion also require Plan 004's accepted vocabulary |
| 006 | none | none | Step 1 pre-branch sequence fails: 004/005 are not DONE in `origin/main`, and `product/CONTENT_DESIGN.md` does not exist there |
| 007 | none | none | Step 1 preconditions fail: 004-006 are not DONE and none of the three required research artifacts exists in `origin/main` |
| 008 | none | none | Step 1 preconditions fail: 004-007 are not DONE in `origin/main` |

Plans 006-008 are blocked structurally rather than by effort. Each says to stop
rather than select another base or branch name, so no branch was created for
them.

PR #36 merged as `c8644c80c980a36699b526ed11d50758ee67e298`, and PR
#39 then merged the index correction as the current main head shown above.
PRs #37 and #38 remain open drafts at
`fecc71c5ea240385b3d98f896b1152022a2bbbe8` and
`9daddbfde073f1f73d806a68dac427b69efc8359`, respectively. Each draft merged
the PR #36 main head into its branch; that did not merge either draft's
research into `main`, and neither branch contains PR #39's later main commit.

The drafts retain useful partial work: PR #37 holds the desk-audit synthesis,
benchmark record, aggregate, and validator; PR #38 holds the fixed route/task
inventory, research skeleton, aggregate, and validator. This reconciliation
does not duplicate, discard, accept, close, or merge that work. The eight safe
editable Plan 004 prototype bytes that existed only in temporary storage are
preserved separately with exact provenance and hashes in
[`recovery/plan-004-consumer-language-prototypes/`](../recovery/plan-004-consumer-language-prototypes/).
That recovery set is not a formal R1/R2 snapshot or participant evidence.

Merging PRs #36 and #39 did not complete any research. Plans 004 and 005 remain
gated on authorization and real-user fieldwork, and Plans 006-008 still require
004 and 005 to reach DONE here first.

## How the sequence works

- Plan 001 immediately materializes the known inventory into production records
  and starts generation. Its pilot tranche is a stopping point: review native
  output, hard/confusable tools, style consistency, derivative behavior, and
  review labor before continuing the same plan at scale.
- After the Plan 001 checkpoint is approved, Plan 001 can continue generating
  the remaining tool/PPE masters while Plan 002 generates hazard scenes.
- Plan 003 starts only after accepted image work is on main. It is not a light
  prose refresh. It audits every tracked research file, consolidates unique
  findings, removes duplicates and obsolete/raw/generated material, repairs
  references, and leaves a small navigable research surface. Git history at the
  pre-cleanup SHA is the archive.

## Consumer UI/UX research sequence

Plans 004 and 005 can begin in parallel. They share an audience and should
coordinate recruitment and terminology, but they answer different questions:
Plan 004 establishes what the product should say; Plan 005 establishes how
learners understand and find its fixed tasks. Plan 005 may run inventory, open
sorting, and provisional hierarchy work in parallel, but it must consume Plan
004's accepted vocabulary before locking labels, running its final first-click
round, or promoting the navigation contract.

```text
004 ─┐
     ├──> 006 ──> 007 ──> 008
005 ─┘
```

- Plan 006 uses the accepted language and information architecture to compare
  coherent visual directions with real content and the existing approved image
  corpus.
- Plan 007 converts those decisions into semantic foundations, explicit
  variants, route archetypes, responsive transformations, and a migration map.
  It closes the present stylesheet/component contract before implementation.
- Plan 008 tests the integrated direction in complete learner journeys,
  including mobile and accessibility participation, then promotes accepted
  findings into the maintained product contracts.

Each plan creates its own GitHub research branch rooted at an immutable base and
opens a draft PR when it is explicitly executed. Before any plan starts, its
execution base must contain the reviewed plan file and this index; `e6f9119` is
the shared code-audit/planning coordinate, not a branch base that predates the
plans themselves. External participant outreach and prototype hosting still
require real operator resources and the applicable staged approval. The Step 2
packet fixes all eight phases as voluntary, unpaid `$0` participation with no
recording; changing either term requires a prospective protocol amendment. Raw
participant data never belongs in Git.

Plans 004 and 005 are open in parallel as draft PRs #37 and #38, but neither is
accepted or merged. Merge Plan 004 first only after its remaining criteria are
actually complete. Plan 005 must then fetch the new `main`, reconcile the
accepted vocabulary and the shared
`research/README.md`/`plans/README.md` edits without force-pushing, preserve both
map/status rows, rerun affected label tests, and only then run its final
first-click round and seek merge. Plans 006-008 begin from the exact merged head
of all dependencies.

## Program boundary

- Keep the stable route IDs, route families, product capabilities, exam-security
  rules, commit-before-reveal behavior, useful static HTML, and bounded React
  island architecture.
- Research labels, grouping, prominence, progressive disclosure, route-family
  layout, responsive behavior, component anatomy, interaction presentation, and
  the overall visual identity.
- Keep source truth, uncertainty, privacy, unofficial status, integrity, and
  recovery information available. Translate it into consumer language and move
  schema-level diagnostics out of the default learning hierarchy.
- Use the already accepted, original, non-answer-bearing visual corpus where
  imagery helps. Do not generate decorative filler or use image generation to
  manufacture a redesign direction.
- Keep production source read-only throughout Plans 004-008. A later,
  separately approved implementation plan owns code and content migration.
- Do not recruit with, solicit, store, or reconstruct secure or remembered exam
  questions, answers, drawings, photographs, admission notices, or review-room
  material.

## Established inputs

- 65 stable tool/PPE concepts are already established by
  research/illustration/TOOL_GEOMETRY_PIPELINE_2026-08-20.md and the recovered
  taxonomy inventory.
- 14 confusable/comparison records are already established. They are composed
  from independently accepted masters, not treated as 14 new model-generation
  jobs.
- Eight hazard families, twelve target environments, and an exact 18-scene
  launch matrix are now materialized: two positives per family plus two
  zero-hazard controls.
- Codex-native reviewed raster bytes are production authority. Historical
  CAD/SVG work is research evidence, not a production route.

## Research cleanup baseline

The current Git tree contains 439 tracked files under research, including 385
under research/v2. The tracked corpus is about 3.9 MB; a recovered-input ZIP is
about 2.3 MB by itself. Exact duplicate groups already exist, and many other
files repeat conclusions semantically across initial-pass, prompt-curation,
individual R2 lanes, and R2.90 synthesis.

The local workspace also contains an ignored, reproducible node_modules
directory under the Effect compiler fixture: about 152 MB and 3,859 files. It
is not present on GitHub, so Plan 003 treats its removal as a separate exact-path
workspace cleanup rather than pretending a PR can delete it.

## Audit boundary

Plans 001-003 cover visual production and research-corpus normalization. Plans
004-008 cover consumer language, learner-task navigation, visual direction,
shared UI foundations, responsive route-family behavior, and integrated user
validation.

They do not absorb runtime correctness, application security, production
performance, dependency, browser-infrastructure, or general test-suite work.
Known correctness defects that could confound research must be documented and
separated from design findings, then handled by later implementation plans.

## Alternatives deliberately rejected

- **Reopen the feature or route inventory**: rejected because this program uses
  the user's stated assumption that the currently planned product is the scope.
- **Delete transparency and provenance**: rejected because those guarantees are
  product requirements. The research question is how to make them clear,
  appropriately prominent, and progressively disclosed.
- **Generate a fresh decorative image layer**: rejected because it would add
  more synthetic visual material before the identity is chosen. The reviewed
  original corpus is the evidence base.
- **Adopt the current UI as a visual-regression baseline**: rejected because it
  would freeze known hierarchy and styling defects. Regression baselines belong
  to the later implementation after the selected direction is accepted.
- **Add analytics instead of conducting research**: rejected because the
  local-first product has no launch tracking and behavioral telemetry would not
  establish comprehension, trust, or assistive-technology usability anyway.
