# Learner-task navigation hierarchy (Plan 005)

**Status**: inventory complete; every participant phase is unauthorized and has
not been run. No candidate has been built, exposed, tested, or selected. No
maintained product contract has been changed.

## 1. Research charter

The planned route and feature inventory is **not** being reopened. All 21
destination families, all 32 core route IDs, and all four acquisition spokes
remain. This study discovers and validates a consumer-facing hierarchy *over*
that fixed inventory, selects a static and no-JavaScript-safe navigation model,
specifies focused player chrome, and — only after an explicit decision gate —
records the approved direction in the maintained product contracts.

Production implementation is a separate, later plan. Nothing in this study
authorizes a navigation, header, footer, page-template, CSS, or React rewrite.

**Research question.** Over a fixed route inventory, which navigation taxonomy,
grouping, and prominence let a first-time entry-level candidate find and start
their top tasks — on a phone, without JavaScript, and without learning the
product's feature model?

## 2. Immutable source coordinate and observed implementation

| Coordinate | Value |
|---|---|
| Planning commit | `e6f911901f7f18f6716204309fee8b103419a5e0` |
| Research base | `115b91a3cce5a6ec4cdbe7981847f8d494e326eb` |
| Scope base | `115b91a3cce5a6ec4cdbe7981847f8d494e326eb` |
| Output branch | `codex/uiux-task-navigation` |
| Draft PR base | `main` |

The research base is the commit that published the reviewed Plan 005 file and
its `plans/README.md` row. Plan 005 requires a base containing both, and states
that the raw planning coordinate `e6f9119` is not an executable base because it
predates the plan and index. `origin/main` is still at `e6f9119` because the
plan program is on `codex/uiux-research-program-plans` (draft PR #36, unmerged),
so the base used here is that plan-publication commit — immutable, pushed to
`origin`, and a descendant of the planning coordinate. If PR #36 merges, a
successor should re-derive the base from the merged `main` head and record it.

**Observed implementation at that base**: `bun run verify` exits 0; the site
generator produces 526 canonical documents across 27 implemented route IDs. The
baseline is healthy, so no later prototype finding may be attributed to a
pre-existing failure.

**Relationship to Plan 004.** Plan 004 runs in parallel on
`codex/uiux-consumer-language` (draft PR #37) and is currently **BLOCKED** at
its participant-authorization gate. Both branches are rooted at the same
plan-publication commit, exactly as `plans/README.md` describes, so both edit
`plans/README.md` and `research/README.md` independently. Per the program index,
Plan 004 merges first; Plan 005 must then fetch the new `main`, reconcile both
shared files without force-pushing, **preserve both map and status rows**, and
only then run its final first-click round and seek merge.

Plan 005's final-round gate depends on Plan 004's accepted vocabulary. Because
Plan 004 is blocked, that gate cannot be satisfied either. This is recorded here
so a successor does not mistake the parallel start for independence.

## 3. Canonical consumer and decision owner

Canonical consumers, updated only after the decision gate:
`product/ROUTES.md`, `product/SCREEN_STATES.md`,
`product/COMPONENT_ARCHITECTURE.md`, and `product/DESIGN_SYSTEM.md`.

| Field | Value |
|---|---|
| Identity | `mannyc2` |
| GitHub handle | `mannyc2` |
| Role | Repository owner and product decision owner for `mannyc2/nycustodianexam` |
| Approval channel | This branch's open draft PR (bound in `research-summary.json`) |

**Approval artifact convention.** Every operation, sample-plan, deviation,
exposure, candidate-decision, and promotion approval must be a structured,
unedited comment posted by the chartered owner on **this** PR. The retained
verifier resolves each one live through `gh`, requires the PR to remain open and
draft with the expected head and base, requires the comment author's login to
equal `decisionOwner.githubHandle`, requires `created_at == updated_at`, and
compares the lowercase SHA-256 of the exact UTF-8 body. Executor prose, a
reaction, or a non-empty string is not approval. An executor cannot satisfy any
gate on the owner's behalf.

## 4. Fixed route and feature inventory

[`route-task-inventory.json`](route-task-inventory.json) maps all 21 families,
all 32 core route IDs, and all four spokes to a learner task statement, a task
priority, a proposed page archetype, a proposed shell, and an explicit
no-JavaScript purpose. Planned-but-unimplemented families
(`exam-checker`, `procedures-index`, `procedure-detail`, `repair-lab`, `faq`)
stay in the mapping and are marked `planned-not-implemented`.

Task statements were written from learner intent, not from destination names.

Every `taskPriority`, `proposedPageArchetype`, and `proposedShell` value is an
**unvalidated desk hypothesis**, marked `hypothesis-unvalidated`. Popularity was
not inferred from the current navigation, and there is no analytics to infer it
from. The participant phases exist to confirm or overturn these values, and a
successor should expect some to be wrong.

Verified by `node verify-research.mjs --phase=inventory`, which compares every
family number against a frozen family-to-route mapping copied from
`product/ROUTES.md` at the recorded base, requires flattened core-route length
and uniqueness of exactly 32, requires four unique spokes, rejects a route ID
claimed by two families or published as both a core route and a spoke, and
rejects any unknown or missing field.

## 5. Hypotheses

To be tested, not assumed:

1. Learners look for their **exam** before they look for study material, so
   profile fit belongs above practice in the first-run hierarchy.
2. "Practice", "Atlas", "Hazards", "Review", "Simulations", and "Print" are
   currently presented as six peers, but learners treat the last three as
   *modes of practising* rather than separate destinations.
3. Transparency, Offline, and Settings compete with study tasks for global
   prominence despite being trust-recovery and utility tasks.
4. On compact layouts the current global links wrap into a link cloud, and no
   grouping survives; a two-tier model with an explicit utility tier will be
   found faster.
5. Focused player routes should drop acquisition navigation entirely and expose
   a single unambiguous exit; the current shared header invites accidental exit
   mid-commitment.
6. The nonvisual hazard equivalent is currently reachable only as a second
   button on the hazard landing page, which under-serves the first-class
   accessibility requirement.

## 6. Participant and privacy protocol

**Not authorized. No participant has been contacted, recruited, compensated,
recorded, or shown any artifact.**

Boundaries that apply whenever it is authorized:

- Never ask for, record, transcribe, summarize, or retain remembered or secure
  exam questions, answer choices, drawings, keys, or review-session material. If
  a participant begins disclosing such content, interrupt politely, stop that
  line of discussion, and retain only a non-reproducing incident note.
- Never commit names, email addresses, phone numbers, consent forms, recordings,
  raw transcripts, recruitment lists, card-sort or first-click exports, or
  demographic combinations that could identify a participant.
- Opaque participant IDs only; raw material stays in approved research storage
  outside Git.
- Report exact numerators and denominators against thresholds predeclared
  *before* formal testing. Do not add analytics or behavioural tracking.

## 7. Card-sort protocol and aggregate result

**Not conducted.** Protocol drafted for a moderated open sort over the fixed
inventory's task statements, run before any hierarchy is proposed so the
grouping comes from learners rather than from the current navigation.

Result: none.

## 8. Threshold-pilot protocol and predeclared decision thresholds

**Not conducted, and thresholds are deliberately not declared.**

`decisionThresholds.status` is `pending` and
`declaredBeforeFormalTesting` is `false`. Declaring numeric success thresholds
without the pilot evidence they are supposed to be calibrated against would
invert the plan's intent — the pilot exists precisely so the thresholds are not
invented. The only value fixed in advance is the critical-failure gate:
`maxUnresolvedCriticalFailures: 0`.

## 9. Tree-test protocol and aggregate result

**Not conducted.** Result: none.

## 10. First-click protocol and aggregate result

**Not conducted**, for either round. Round two additionally depends on Plan
004's accepted vocabulary, which does not exist. Result: none.

## 11. Accessibility and no-JavaScript review

**Not conducted with participants.** The inventory records a no-JavaScript
purpose for every family, which is a specification input rather than a review
finding. The plan requires assistive-technology participation, and none has been
authorized.

## 12. Candidate comparison

**No candidate has been built.** Building candidate A and B before the open sort
would invent the information architecture that the sort exists to discover, so
the candidate directories are deliberately absent.

The candidate machinery is nonetheless proven. `verify-research.mjs
--phase=candidates` was exercised against disposable synthetic candidates, which
were then deleted. It accepted a valid pair and rejected: two candidates whose
information architecture is identical but whose copy differs, a `<script>`
element, an extra file in the eight-file set, and a view unreachable from
`index.html`. That last set of properties matters most — it is what stops two
cosmetically different copies of one IA from satisfying the comparison.

Exercising a validator against synthetic fixtures is not research evidence and
is not recorded as such.

## 13. Selected model and explicit decision

**None.** `decision.status` is `pending`. No navigation model has been selected,
and no maintained product contract has been changed. `product/ROUTES.md`,
`product/SCREEN_STATES.md`, `product/COMPONENT_ARCHITECTURE.md`, and
`product/DESIGN_SYSTEM.md` are untouched on this branch, which is correct: the
plan permits editing them only after the decision gate.

## 14. Limitations and unresolved questions

- The inventory mapping is desk reasoning over maintained contracts. It has no
  participant evidence behind it and should not be cited as validated IA.
- Task priorities were assigned from product purpose, not from observed
  behaviour, and the plan explicitly forbids inferring popularity from the
  current navigation.
- The verifier's participant-evidence phases are precondition-complete but
  evidence-incomplete; their grading arithmetic has never run against real
  matrices. The file says so at the top. A successor must re-read those branches
  before trusting a pass.
- Plan 005 cannot complete while Plan 004 is blocked, independent of its own
  participant gate, because its final round and promotion consume Plan 004's
  accepted vocabulary.

## 15. Production acceptance and test specification

Deferred. The plan places this after the decision gate, and writing acceptance
criteria for an unselected model would be fiction.

What can be stated now, because it derives from fixed contracts rather than from
the pending decision: any future implementation must preserve every route ID,
canonical path pattern, indexability value, static/island ownership boundary,
and offline contract recorded in the inventory; must keep every family's
no-JavaScript purpose working; and must keep focused player routes free of
acquisition navigation while providing an unambiguous exit.

## 16. Source ledger

| Source | Kind | Used for |
|---|---|---|
| `product/ROUTES.md` | Maintained authority at the research base | The frozen 21-family, 32-route, 4-spoke mapping |
| `product/SCREEN_STATES.md` | Maintained authority | Legal state families and recovery behaviour |
| `product/COMPONENT_ARCHITECTURE.md` | Maintained authority | Island boundaries and semantic shell composition |
| `product/DESIGN_SYSTEM.md` | Maintained authority | Existing responsive and presentation contract |
| `product/FEATURE_SPEC.md` | Maintained authority, read-only | Learner outcomes and accessibility requirements |
| `plans/005-rebuild-learner-task-navigation.md` | Reviewed plan at the research base | Protocol, scope, and stop conditions |

No external source has been consulted for this plan. When the participant phases
are authorized, recruitment, method, and any external research service used will
be appended here.
