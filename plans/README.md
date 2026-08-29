# Implementation Plans

Reconciled on 2026-08-28 against immutable `origin/main`
`d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1`.

Plans 001-003 record the completed visual-production and corpus-normalization
sequence. Plans 004-008 form the consumer UI/UX recovery program. The active
program is `CODEX-ONLY-UIUX-V1`; it produces technical and agent-review evidence
only and does not authorize production implementation.

## Permanent program metadata

<!-- PREADME-CLAUSE PREADME-UIUX-001 reviewMode=codex-only -->
<!-- PREADME-CLAUSE PREADME-UIUX-002 humanEvidence=none -->
<!-- PREADME-CLAUSE PREADME-UIUX-003 humanParticipantCount=0 -->
<!-- PREADME-CLAUSE PREADME-UIUX-004 participantCount=0 -->
<!-- PREADME-CLAUSE PREADME-UIUX-005 notHumanUsabilityTested=true -->
<!-- PREADME-CLAUSE PREADME-UIUX-006 agentsCountAsPeople=false -->
<!-- PREADME-CLAUSE PREADME-UIUX-007 productionAuthorization=false -->

The human participant count 0 and human evidence none labels are permanent.
Codex agents, automated
browsers, personas, simulations, and static fixtures never count as people or
participant evidence and cannot establish human behavior, comprehension,
preference, or real-device assistive-technology results. The program contains
no outreach, recruitment, participant session, recording, compensation,
moderation, human approval, or sign-off phase.

## Execution order and status

| Plan | Title | Priority | Effort | Depends on | Status |
|---|---|---:|---:|---|---|
| 001 | Generate and approve the complete tool/PPE visual library | P1 | L | — | DONE — 65 accepted masters and 14 accepted deterministic comparisons verified |
| 002 | Generate and approve the launch hazard-scene bank | P1 | L | Plan 001 pilot checkpoint | DONE — 18 accepted scenes passed exact-pixel independent review, release verification, and checksum closure |
| 003 | Normalize and reduce the research corpus through connected @GitHub | P1 | L | Plans 001 and 002 merged; exact post-visual `main` SHA | DONE — PR #27 merged; maintained authorities and the retained research map own the reconciled result |
| 004 | Establish the consumer-language boundary | P1 | L | —; coordinate vocabulary with Plan 005 | DONE — CODEX-ONLY `CL-CODEX-1`; permanent human evidence none and participant count 0; NOT HUMAN-USABILITY-TESTED |
| 005 | Rebuild navigation around learner tasks | P1 | L | Plan 004 vocabulary envelope | DONE — CODEX-ONLY `NAV-CODEX-1`; permanent human evidence none and participant count 0; NOT HUMAN-USABILITY-TESTED |
| 006 | Select a consumer visual system and route archetypes | P1 | L | Plans 004 and 005 | BLOCKED — Step 3 CODEX-only decision artifact is not accepted and merged on `main`; no visual system is selected |
| 007 | Specify shared UI foundations and responsive route-family contracts | P1 | L | Plans 004, 005, and 006 | BLOCKED — Step 4 CODEX-only contract is not accepted and merged on `main`; no component system is accepted |
| 008 | Run CODEX-only integrated consumer journey validation | P1 | L | Exact accepted CODEX-only Steps 2, 3, and 4 | BLOCKED — accepted Step 3/4 SHAs are unresolved; final evidence mode and any recommendation remain unavailable |

Status values: TODO | IN PROGRESS | DONE | BLOCKED (with one-line reason) |
REJECTED (with one-line rationale)

## Current execution state

<!-- PREADME-CLAUSE PREADME-DEP-001 step02Sha=d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1 -->
<!-- PREADME-CLAUSE PREADME-DEP-002 step03Sha=null -->
<!-- PREADME-CLAUSE PREADME-DEP-003 step04Sha=null -->
<!-- PREADME-CLAUSE PREADME-DEP-004 plan008Status=BLOCKED -->
<!-- PREADME-CLAUSE PREADME-DEP-005 finalIntegratedRunExecuted=false -->
<!-- PREADME-CLAUSE PREADME-DEP-006 mustRebaseAndReverify=true -->

Step 2 merged through PR
[#41](https://github.com/mannyc2/nycustodianexam/pull/41) as
`d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1`. Its accepted artifact is
`plans/004-005-codex-only-evaluation.md`, SHA-256
`bcfe0ffef023baa273242c5af2fac7be8eef58e04c0115f2a36da8784afb0116`,
Git blob `434d055ebefb7c7a13e80e68fa8f4d1fa023a048`.

| Program step | Plan | Branch / draft | State |
|---|---|---|---|
| 2 | 004/005 | merged PR #41 | accepted CODEX-only input on `main` |
| 3 | 006 | `codex/uiux-orchestration-03-visual-territories`, draft PR #43 | provisional prework; exact accepted SHA absent |
| 4 | 007 | `codex/uiux-orchestration-04-component-contract`, draft PR #44 | provisional prework; exact accepted SHA absent |
| 5 | 008 | `codex/uiux-orchestration-05-journey-validation`, draft PR #42 | canonical CODEX-only amendment and provisional packet only; final run prohibited |

The only remaining upstream gates for Plan 008 are exact accepted CODEX-only
Step 3 and Step 4 commit/artifact coordinates on a fetched immutable `main`.
Branch existence, draft status, provisional bytes, agent claims, or automation
cannot fill either slot.

## Consumer UI/UX sequence

```text
004 ─┐
     ├──> 006 ──> 007 ──> 008
005 ─┘
```

Plans 004 and 005 established a language and navigation envelope over the fixed
route inventory. Plan 006 owns the CODEX-only visual-system decision. Plan 007
owns the component, responsive, and route-family contract. Plan 008 validates
the exact accepted outputs together through deterministic automation and three
independently sealed Codex lanes.

Plan 008 may eventually emit a nonbinding agent-only release recommendation.
That output remains `notHumanUsabilityTested=true`, cannot predict behavior,
cannot claim real-device accessibility, and cannot authorize deployment or the
later production migration.

## Program boundary

- Keep the fixed route IDs, route families, product capabilities,
  exam-security boundary, commit-before-reveal semantics, useful static HTML,
  and bounded React-island architecture.
- Plans 004-008 may research and specify language, hierarchy, visual direction,
  component anatomy, responsive behavior, interaction presentation, and
  integrated technical validation.
- Production files remain read-only for this program. A separate accepted
  implementation plan owns migration.
- Preserve source truth, uncertainty, privacy, unofficial status, integrity,
  recovery, answer boundaries, and original rights-cleared visual evidence.
- Never request, store, reconstruct, or publish secure or remembered exam
  questions, answers, drawings, photographs, admission notices, or review-room
  material.
- Do not add surveillance, analytics, accounts, public preview infrastructure,
  or external network requests to manufacture evidence.

## Plan 008 canonical authority

`plans/008-run-integrated-consumer-ux-validation.md` is now the sole executable
Plan 008 authority. It supersedes the former human-study workflow and defines:

- immutable Step 2-4 dependency proof;
- exact critical journeys, legal states, transitions, interruptions,
  capabilities, and categories;
- contract-owned applicability and unique per-requirement assertions;
- three independent Codex first-pass receipts and structured lane outputs;
- exact failed-cell/finding coupling and consensus eligibility;
- one transitive externally checked final evidence root; and
- permanent zero-human, privacy, claim, and nonauthorization boundaries.

Historical branches and Git objects remain provenance only. They are not an
alternate executor contract and cannot reactivate superseded operations.

## Audit boundary

Plans 001-003 cover visual production and research-corpus normalization.
Plans 004-008 cover the consumer UI/UX recovery sequence. None is evidence of
human usability testing.

Runtime correctness, application security, production performance, dependency
maintenance, browser infrastructure, and migration are separate work. Plan 008
records technical blockers it encounters but does not silently implement those
separate scopes.
