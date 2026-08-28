# Implementation Plans

Revised on 2026-08-28. Plans 001-003 record the completed visual-production and
research-normalization sequence. Plans 004-008 form a new consumer UI/UX
research program planned at commit `e6f9119`. They assume the current route and
feature inventory is the intended product, but do not assume the current copy,
navigation, visual system, layout, component presentation, or interaction
hierarchy is acceptable.

The new sequence is research and product-contract work. It does not authorize a
production redesign. Plans 004-008 use `CODEX-ONLY-UIUX-V1`: agents may identify
defects and select a bounded direction under a deterministic contract, but every
result is **NOT HUMAN-USABILITY-TESTED** and cannot be cited as observed learner
behavior.

The established 65-concept tool/PPE inventory and 14 comparison records are
inputs, not a separate planning phase. The visual pilot is a mandatory
checkpoint inside production, not a separate project.

## Execution order and status

| Plan | Title | Priority | Effort | Depends on | Status |
|---|---|---:|---:|---|---|
| 001 | Generate and approve the complete tool/PPE visual library | P1 | L | — | DONE — 65 accepted masters and 14 accepted deterministic comparisons verified |
| 002 | Generate and approve the launch hazard-scene bank | P1 | L | Plan 001 pilot checkpoint | DONE — 18 accepted scenes passed exact-pixel independent review, release verification, and checksum closure |
| 003 | Normalize and reduce the research corpus through connected @GitHub | P1 | L | Plans 001 and 002 merged; exact post-visual `main` SHA | DONE — PR #27 merged; maintained authorities and the retained research map now own the reconciled result |
| 004 | Establish the consumer-language boundary | P1 | L | —; coordinate vocabulary with Plan 005 | DONE — CODEX-ONLY scope; `CL-CODEX-1` promoted from the 120-family audit, recovered drafts, current site, and independent agent reviews; human evidence none; human participant count 0; NOT HUMAN-USABILITY-TESTED |
| 005 | Rebuild navigation around learner tasks | P1 | L | Plan 004 vocabulary envelope | DONE — CODEX-ONLY scope; `NAV-CODEX-1` promoted over the fixed 21-family/32-route/4-spoke inventory; human evidence none; human participant count 0; NOT HUMAN-USABILITY-TESTED |
| 006 | Select a consumer visual system and route archetypes | P1 | L | Plans 004 and 005 | IN PROGRESS — audit rejected `7fcc776e6941c7f41a504dda59ea59af88ba31fb`; terminal evidence, browser/token/asset proof, and three fresh exact-subject Codex reviews are being rebuilt; no territory is selected |
| 007 | Specify shared UI foundations and responsive route-family contracts | P1 | L | Plans 004, 005, and 006 | BLOCKED — exact accepted Plan 006 merge SHA is not on `main`; future execution must use the Codex-only contract and preserve Plan 006 limitations |
| 008 | Run integrated consumer UX and accessibility validation | P1 | L | Plans 004, 005, 006, and 007 | BLOCKED — exact accepted Plans 006/007 merge SHAs are not both on `main`; future evidence remains Codex-only and not human-usability-tested |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (with one-line reason) |
REJECTED (with one-line rationale)

## Current execution state

Recorded 2026-08-28 after fetching `origin/main` at accepted Step 2 merge
`d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1` (subject
`4130693dee6caaa804a116f490b2192861f53e6e`).

The owner superseded the human-fieldwork and human-approval path for this
program with `CODEX-ONLY-UIUX-V1`. There are no participants, moderators, human
reviewers, human decision owners, or sign-offs. Codex agents, personas,
simulations, corpus observations, and automated checks never count as humans or
participant evidence. The machine contract fixes human evidence none and human
participant count 0.

| Plan | Branch | Draft PR | Where it stops |
|---|---|---|---|
| 004 | `codex/uiux-consumer-language` | #37 | Superseded as an execution path. Its 120-family audit, benchmark work, and candidate definitions are immutable inputs at `fecc71c5ea240385b3d98f896b1152022a2bbbe8`; its human protocol and unselected status are not promoted |
| 005 | `codex/uiux-task-navigation` | #38 | Superseded as an execution path. Its fixed route/task inventory is an immutable input at `9daddbfde073f1f73d806a68dac427b69efc8359`; its human protocol is not active and its hypotheses are not treated as behavior |
| 004/005 Step 2 Codex-only synthesis | `codex/uiux-orchestration-02-fieldwork` | [#41](https://github.com/mannyc2/nycustodianexam/pull/41), merged as `d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1` | CODEX-ONLY complete; four structured agent lanes, deterministic synthesis, `CL-CODEX-1`, and `NAV-CODEX-1`; NOT HUMAN-USABILITY-TESTED |
| 006 | `codex/uiux-orchestration-03-visual-territories` | [#43](https://github.com/mannyc2/nycustodianexam/pull/43), draft | Audit repair in progress; rejected subject `7fcc776e6941c7f41a504dda59ea59af88ba31fb` and its reviews/selection are invalid; next subject will be selection-neutral and receive three fresh Codex reviews |
| 007 | `codex/uiux-orchestration-04-component-contract` | [#44](https://github.com/mannyc2/nycustodianexam/pull/44), draft at `4bc1b1d8ea42ea04603a79c5e26af0d1e394db47` | Provisional prework only; exact accepted Plan 006 merge SHA is not on `main`; execution must bind a Codex-only contract before claiming completion |
| 008 | `codex/uiux-orchestration-05-journey-validation` | [#42](https://github.com/mannyc2/nycustodianexam/pull/42), draft at `2f5e23569b44d2f8f40ffd45602ba212d57b3e6b` | Provisional prework only; exact accepted Plans 006/007 merge SHAs are not both on `main`; execution must remain Codex-only and not human-usability-tested |

Plan 006 is active on draft PR #43 and has no selected territory while the audit
repair runs. Plans 007 and 008 remain blocked by exact dependency/main gates and
their future Codex-only execution amendments. Branch existence does not pass a
dependency, execution, evidence, or acceptance gate.

PR #36 merged as `c8644c80c980a36699b526ed11d50758ee67e298`, PR #39
merged the earlier index correction, and PR #40 then landed the durable Step 1
recovery/status package as the current main head shown above.
PRs #37 and #38 remain open drafts at
`fecc71c5ea240385b3d98f896b1152022a2bbbe8` and
`9daddbfde073f1f73d806a68dac427b69efc8359`, respectively. Each draft merged
the PR #36 main head into its branch; that did not merge either draft's
research into `main`, and neither branch contains PR #39's later main commit.

The drafts retain useful partial work: PR #37 holds the desk-audit synthesis,
benchmark record, aggregate, and validator; PR #38 holds the fixed route/task
inventory, research skeleton, aggregate, and validator. PR #41 consumes only
their evidence at the exact heads above; it does not merge or mislabel their
unfinished human-study machinery. The eight safe
editable Plan 004 prototype bytes that existed only in temporary storage are
preserved separately with exact provenance and hashes in
[`recovery/plan-004-consumer-language-prototypes/`](../recovery/plan-004-consumer-language-prototypes/).
That recovery set is not a formal R1/R2 snapshot or participant evidence. CL-1
remains quarantined because it contains claims that do not match the current
product; the maintained contract defines a current CL-2 envelope instead.

PR #41 replaced its earlier volunteer packet with a concise agent-only evidence
set and is now accepted on `main` at the exact Step 2 merge above. It does not
claim participant research.

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

Plans 004 and 005 were reconciled together because they answer connected but
different questions: Plan 004 establishes what the product should say; Plan 005
establishes a task-oriented hierarchy over the fixed inventory. Four independent
Codex lanes inspected the actual site and preserved evidence. A deterministic
two-lane-support rule promoted their common contract while keeping supplied
unresolved questions explicit.

```text
004 ─┐
     ├──> 006 ──> 007 ──> 008
005 ─┘
```

- Plan 006 uses the accepted language and information-architecture envelope to
  compare coherent visual directions with real content and the approved image
  corpus. Its rejected subject and old reviews are non-reusable; only a repaired
  exact subject plus three fresh Codex review tasks may reach a decision.
- Plan 007 may convert those decisions into semantic foundations, explicit
  variants, route archetypes, responsive transformations, and a migration map
  only through a prospective Codex-only execution contract bound to the accepted
  Plan 006 merge.
- Plan 008 likewise requires a Codex-only execution contract. It may run
  independent Codex, browser, accessibility-tool, and deterministic journey
  checks, but it cannot describe any result as participant or human usability
  evidence.

Each later plan creates its own GitHub research branch rooted at an immutable
base and opens a draft PR when explicitly executed. Before any plan starts, its
execution base must contain the reviewed plan file and this index; `e6f9119` is
the shared planning coordinate, not an executable branch base. No outreach,
recruitment, consent, incentive, recording, participant storage, moderator, or
human approval resource is part of the current program.

PRs #37 and #38 remain preserved, open drafts and are not the active completion
path. Merged PR #41 promoted their reusable evidence through the explicitly
different Codex-only scope. Plans 006-008 begin from exact accepted dependency
merge commits; Plan 006 is not a `main` input for Plan 007 until draft PR #43 is
accepted and merged.

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
- Do not contact or recruit anyone. Codex review must not solicit, store, or
  reconstruct secure or remembered exam questions, answers, drawings,
  photographs, admission notices, or review-room material.

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
shared UI foundations, responsive route-family behavior, and integrated UX
evaluation. Under the current owner direction, none of that is human usability
testing.

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
