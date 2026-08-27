# Consumer-language study (Plan 004)

**Status**: `decision pending`. The desk inventory is complete. No benchmark
evidence has been gathered, no participant research has been conducted, and no
direction has been selected. Result sections below are explicitly empty until
the evidence that fills them exists.

## Source coordinates

| Coordinate | Value |
|---|---|
| Planning commit | `e6f911901f7f18f6716204309fee8b103419a5e0` |
| Original execution base | `115b91a3cce5a6ec4cdbe7981847f8d494e326eb` |
| Reconciled execution base | `c8644c80c980a36699b526ed11d50758ee67e298` |
| Output branch | `codex/uiux-consumer-language` |
| Plan | [`plans/004-establish-consumer-language-boundary.md`](../../plans/004-establish-consumer-language-boundary.md) |

Plan 004 requires an execution base containing the reviewed Plan 004 file and
its `plans/README.md` row. When this study started, `origin/main` (`e6f9119`)
contained neither, because the plan program was still on
`codex/uiux-research-program-plans` (PR #36, unmerged). The original base was
therefore that plan-publication commit — immutable, pushed to `origin`, and a
descendant of the planning coordinate — and the deviation from the plan's
literal `git rev-parse origin/main` step was recorded rather than silently
applied.

PR #36 merged on 2026-08-27. `origin/main` now carries Plans 004-008 and their
index rows, so the deviation is closed: this branch was merged forward onto the
merged head `c8644c80c980a36699b526ed11d50758ee67e298`, which is the reconciled
execution base and satisfies the plan's original requirement directly. The
`plans/README.md` reconciliation preserved every plan's status row, and no
force-push was used. All findings below were collected at the original base; the
merge brought in plan and index text only and changed no audited path.

## Canonical consumer

`product/CONTENT_DESIGN.md` — the public-language contract this study exists to
justify. It does not exist yet and must not be created before the decision gate
in Plan 004 Step 9. Accepted normative rules will live there once, not here.
This document holds evidence and method only.

## Decision owner

| Field | Value |
|---|---|
| Identity | `mannyc2` |
| GitHub handle | `mannyc2` |
| Role | Repository owner and product decision owner for `mannyc2/nycustodianexam` |
| Approval channel | The `codex/uiux-consumer-language` draft PR (bound in the aggregate record) |

The owner is chartered from repository ownership. Chartering commits the owner
to nothing: every gate in this study requires them to post a structured,
unedited comment on the study's own draft PR, and the retained validator
resolves each comment live, checks its author login, checks that it was never
edited, and compares the SHA-256 of its exact body. An executor cannot satisfy
any gate on the owner's behalf.

## Scope

In scope for modification on this branch, and nothing else:

- `product/CONTENT_DESIGN.md` (after the decision gate only)
- `product/README.md`
- `research/ui-ux/consumer-language-study-2026-08-26.md`
- `research/ui-ux/consumer-language-study-2026-08-26.json`
- `research/ui-ux/verify-consumer-language-study.mjs`
- `research/README.md`
- `plans/README.md`

Production source under `apps/site`, `content/authoring`, and `packages` is
read-only for the whole plan. A later, separately approved implementation plan
owns code and content migration.

## Research questions

1. Can a first-time visitor explain what the product is, who it is for, whether
   it is official, and what to do next?
2. Which provenance and local-first details increase trust, and which make the
   site feel defensive, machine-generated, or unfinished?
3. What is the least copy required to preserve unofficial status, unknown exam
   facts, commit-before-reveal, local persistence, and source transparency at
   each decision?
4. Which details should be visible, progressively disclosed, moved to a
   dedicated support surface, or never shown?
5. Can learners distinguish "saved on this device," "available offline,"
   "downloaded but not ready," and "could not import" without learning the
   storage state machine?
6. Can learners find source evidence after an answer without claim IDs,
   source-line IDs, rights notes, and evidence-tier vocabulary dominating the
   explanation?
7. Does instructional copy assess knowledge directly, without editorial phrases
   or repetitive "Correct." preambles?
8. Do error messages state what happened, what was preserved, and the next safe
   action without exposing arbitrary internal exception text?

## Method skeleton

| Phase | Method | State |
|---|---|---|
| Desk inventory | Classify every public copy family across all 27 implemented route IDs, every copy-bearing React family, every dynamic message sink, print output, PWA metadata, and fallbacks | Complete |
| Benchmark study | 8–12 dated current products across consumer exam prep, trusted public-service tools, and no-account/offline consumer experiences | **Partial** — 10 records across all three groups; three interaction criteria not evaluable by static retrieval |
| Prototypes | Eight text-first local prototypes, piloted once, frozen per round under a locked normalization and manifest algorithm | **Authored, not piloted, not frozen** — piloting requires a person |
| Round 1 | Moderated, 5–8 qualifying participants, nine locked tasks each | **Not authorized** |
| Round 2 | Moderated, 5–8 new qualifying participants, every critical round-one issue retested | **Not authorized** |
| Decision | Explicit owner selection bound to the tested R2 manifest | Pending |

## Privacy and security boundary

- Participants are referenced only by study IDs matching `R1-P[0-9]{2}` or
  `R2-P[0-9]{2}`.
- No names, email addresses, phone numbers, employers, applicant IDs, admission
  numbers, or exact locations enter this repository.
- No raw recordings, transcripts, recruitment exports, or consent forms enter
  this repository.
- Secure or remembered exam questions, answers, drawings, photographs, admission
  notices, and review-room material are never solicited, accepted, stored, or
  reconstructed. If a participant offers such material, the session stops and
  only the fact that prohibited material was offered is reported.
- No telemetry or analytics is added to conduct this study.
- Findings report exact numerators and denominators. Small qualitative samples
  are never converted into percentage targets or claims of statistical
  significance.

## Retained validator

[`verify-consumer-language-study.mjs`](verify-consumer-language-study.mjs) is the
retained, Node-built-in-only validator for this study. Phases:

| Phase | Proves |
|---|---|
| `approval-channel` | The aggregate is bound to this branch's live open draft PR, the chartered handle resolves to a live GitHub login, and no evidence or approval is yet claimed |
| `prototype-set` | One round's exact eight prototypes are frozen, non-writable, and hashed under the locked normalization; the only write mode |
| `operations` | The five shared operator authorizations and that round's prototype-exposure approval exist as unedited, body-hash-matched owner comments |
| `round-one` | Complete, manifest-bound round-one evidence for 5–8 study IDs across all nine locked tasks |
| `round-two` | Both rounds complete and every critical round-one issue retested and resolved |
| `decision` | An explicit owner decision bound to the recomputed R2 manifest |
| `final` | `product/CONTENT_DESIGN.md` names the same direction ID and R2 manifest coordinates |

Every phase fails closed. The validator never uploads data and never reads
participant material into the repository.

## Results

### Desk inventory

Complete. The raw matrices stay outside Git per `research/README.md`; this is the
distilled result.

**Baseline.** The execution base regenerates to **526 canonical documents** and
**27 implemented route IDs**, matching the plan's expected planning-baseline
count. `bun run verify` exits 0 at this base.

**Coverage.** 120 classified copy families: every one of the 27 implemented
route IDs, the 9 planned route IDs that have no generated copy yet, all 12
copy-bearing React island families, print output, document/PWA metadata, the
maintained public offline fallback, the no-JavaScript fallback family, and the
authored comparison-question family.

| Disposition | Families |
|---|---:|
| `REWRITE` | 79 |
| `KEEP` | 24 |
| `MOVE_TO_DETAILS` | 9 |
| `INTERNAL_ONLY` | 5 |
| `REQUIRES_CONTENT_REREVIEW` | 2 |
| `RELOCATE_TO_SUPPORT` | 1 |

| Severity | Families |
|---|---:|
| critical | 30 |
| high | 39 |
| medium | 28 |
| low | 23 |

Severity here ranks desk-audit product reasoning. It is **not** participant
evidence and does not pre-empt the critical-issue rubric, which can only be
applied to observed participant behavior.

**Dynamic message sinks.** 847 candidate anchors were traced from the union of
the plan's broad and narrow patterns; every one received a disposition,
including 451 classified `not-public` with a rationale. 11 anchors are confirmed
public render sites, and 205 more are indirect producers that feed them.

**Single highest-value finding.** `apps/site/src/local-failure-detail.ts:1`
returns `cause.detail`, then `cause.message`, and only then the safe fallback.
Eleven public render sites across seven islands render that value. Every one of
them is inside a `role="alert"` or `aria-live` region, and in
`offline-packs`, `settings`, and `correction-submit` the surrounding heading
also receives focus. An arbitrary internal exception string therefore reaches
both the visible page and assistive technology at the moment a learner most
needs to know what happened to their data. One typed-condition mapper closes all
eleven. Implementing it belongs to the successor production plan.

**Representative patterns, by rubric tag.**

- `INTERNAL_MODEL` — the study hub's primary heading is "Choose a set the bank
  can actually supply," and its capacity section explains sets are "computed
  only from answer-independent memberships." The hazard results surface
  describes a "visual-recognition construct" and "granular authored locations."
  The review queue renders "directional concept relationship" and a "general
  false-positive marker" in the learner's own due list.
- `BUILD_RELEASE` — the home page's first line is the eyebrow "Source-backed ·
  local-first"; the transparency landing page leads with "Release … · version
  …"; the offline-pack page explains staging and checksum verification before
  saying what will work without a connection.
- `UNDEFINED_JARGON` — the product's single most important control is labeled
  "Commit answer," while the same button reads "Saving answer…" while in
  flight. A simulation control is labeled "Deterministic set seed."
- `DEFENSIVE_STACKING` — the review lead states in one sentence that the queue
  "never treats displayed feedback as reviewed and does not claim mastery or an
  official schedule"; the privacy page lists six separate infrastructure
  absences.
- `TRUST_REVERSAL` — "No answer bytes are embedded in this page" and "hash-bound
  in the release manifest" state real integrity guarantees in terms likelier to
  unsettle a candidate than to reassure one.
- `AI_CADENCE` — "accepted" appears twice in the atlas eyebrow alone; the
  authored comparison questions repeat "In the accepted … comparison" across
  eleven items and open every rationale with "Correct."

**What the audit did not find.** No case was found where required meaning could
be deleted. Unofficial status, unknown-fact labeling, the site-designed
distribution statement, the practice-score disclaimer, commit-before-reveal,
source retention, and the secure-material prohibition are all present and all
load-bearing. The finding is consistently about *layer and prominence*, not
about removal — which is why 24 families are marked `KEEP` and only 5 are
`INTERNAL_ONLY`.

**Contradiction to resolve with participants.** The desk audit cannot tell
whether the provenance detail that reads as defensive to an auditor reads as
trustworthy to a candidate. Research questions 2 and 4 exist precisely because
that judgment is not the executor's to make.

### Benchmark study

**Partial.** Ten products observed on **2026-08-27**, covering all three
required groups. No screenshots and no wholesale prose are retained.

| Group | Product | URL |
|---|---|---|
| A. Exam prep / learning | Anki | <https://apps.ankiweb.net/> |
| A | Mometrix Academy | <https://www.mometrix.com/academy/> |
| A | Khan Academy (failure state only) | <https://www.khanacademy.org/> |
| B. Public service / reference | GOV.UK | <https://www.gov.uk/> |
| B | USA.gov | <https://www.usa.gov/> |
| B | NYS Department of Civil Service | <https://www.cs.ny.gov/jobseeker/> |
| B | U.S. Web Design System principles | <https://designsystem.digital.gov/design-principles/> |
| C. No-account / offline / local data | Obsidian | <https://obsidian.md/> |
| C | Joplin | <https://joplinapp.org/> |
| C | W3C WAI, involving users | <https://www.w3.org/WAI/test-evaluate/involving-users/> |

Four further products were attempted and are recorded as not retrievable rather
than silently dropped: Duolingo and Excalidraw rendered no content without
JavaScript; NYC DCAS "Take an exam" and Union Test Prep returned HTTP 403.

**Why this is partial.** Observation was static document retrieval, not a driven
interactive session. Three protocol criteria — question commitment and feedback
behaviour, error and destructive-action language in situ, and advanced
diagnostic disclosure behind an account — are therefore marked
`not-evaluated (method)` for interactive products. They were **not** filled in
from memory. A successor with a driven browser should complete them.

**Findings that survive the limitation.**

- *Disclaimer economy.* Mometrix, a direct commercial analogue, discharges the
  entire unofficial-status obligation in one sentence, once: "provides
  unofficial test preparation products … All trademarks are property of their
  respective trademark owners." The audited product carries `DEFENSIVE_STACKING`
  or `DUPLICATED_GUARDRAIL` on 8 families.
- *Verifiability as a task.* USA.gov teaches the reader to check officialness
  themselves — "A .gov website belongs to an official government organization" —
  rather than asserting it repeatedly. GOV.UK does the same with "Check your
  National Insurance record." An unofficial site can invert this: state the
  negative once, show the reader how to check, stop.
- *Local-first without storage nouns.* Obsidian, a more technical product with a
  more technical audience, says "stores notes privately on your device," "plain
  text," "even offline," "never locked in" — and no storage-engine noun at all.
  The audited settings island surfaces append-only events, schema versions,
  SHA-256 checksums, projections, and quarantine.
- *Two consumer words for a scheduler.* Anki exposes its scheduling model as
  *rate* and *review*, nothing more. Directly relevant to `FEATURE_SPEC.md:353`,
  which reserves "due," "reviewed," and "practice history."
- *Error structure.* Khan Academy's no-JavaScript state names the effect, offers
  ordinary-language causes, and gives three concrete next actions, exposing no
  exception text: "A required part of this site couldn't load … check your
  connection, disable any ad blockers, or try using a different browser."
- *The candidate's real vocabulary.* NYS Civil Service uses *examination*,
  *announcement*, *eligibility*, *qualifications*, *official score*, *eligible
  list*. This is the language a candidate arrives carrying and it must not be
  "plain-languaged" away. The same page also shows the counter-pattern —
  "ELMS," "Advisory Memo #89-02" — confirming that being official does not make
  an acronym legible.

### Candidate directions

Three substantially different directions were defined and self-assessed against
the AI-slop rubric, including the preferred one. None weakens a hard constraint;
a direction that did would have been rejected rather than tested.

- **CL-D1 "Plain task"** — task-first, minimum guardrail density, evidence one
  disclosure away. Lowest `ABSTRACT`/`DEFENSIVE_STACKING` risk; carries the
  opposite risk that a candidate who cannot find evidence doubts the site.
- **CL-D2 "Open book"** — leads with independence and checkability, promotes
  evidence to a peer of the explanation as publisher/title/date rather than IDs
  and tiers. Strongest on `TRUST_REVERSAL`; residual `AI_CADENCE` risk.
- **CL-D3 "Guided coach"** — warm and progress-led. Included so a genuine
  alternative is tested, but flagged as sitting closest to two prohibitions:
  `FEATURE_SPEC.md:135-142` forbids guilt and urgency and
  `FEATURE_SPEC.md:353` prohibits premature "mastered" claims. Any CL-D3
  prototype producing a streak, nudge, or implied readiness claim is rejected at
  authoring time, not at testing time.

Rejected before testing: "trust us" minimalism (deletes required provenance),
officialese (invites the worst possible research outcome), and a mechanical
banned-word list (forbidden by the plan's own maintenance notes; 24 inventory
families are `KEEP`).

**No direction is preferred on this evidence.** Ranking them is what the
participant rounds exist to do.

### Round one

Not conducted. Participant recruitment, consent, compensation, research-data
handling, recording, and prototype exposure are not authorized.

### Round two

Not conducted.

### Accessibility findings

Pending.

### Prototype comparison outcomes

None. No prototype has been shown to anyone.

The eight required prototypes are **authored but neither piloted nor frozen**:
`home`, `profile`, `practice-start`, `question-feedback`, `hazard-feedback`,
`review`, `offline-data`, and `trust-recovery`. Each carries its locked ID and
`CL-1` version marker, its source anchor, tested hypothesis, preserved
constraint, and candidate layers, and each presents the current wording beside
CL-D1 and CL-D2 candidates plus realistic loading, empty, error, offline, and
destructive states. The `question-feedback` prototype includes three
comparison-question rewrites, marked research-only; the curated module, the
generated pack, and the review ledger are untouched.

They are deliberately **not frozen as R1**. Plan 004 Step 6 requires the
post-pilot bytes to be frozen, freezing is the gate to participant outreach, and
the pilot requires a person. Freezing now would consume the R1 coordinate that
the verifier will not let anyone reclaim. A successor should pilot the guide,
revise, and then freeze.

**The freeze machinery is proven.** The retained validator was exercised
end-to-end against disposable snapshots, which were then deleted. It accepted
valid freezes and refused: re-freezing an existing round, a file changed after
freezing, a writable snapshot directory, a ninth file, a missing file, a
symlinked file, changed copy without a version increase, and a version increase
without changed copy. It also refused `operations`, `round-one`, `decision`, and
`final` with no operator approval present, confirming that later phases cannot
bypass the authorization gate.

Testing the validator against synthetic fixtures is not participant evidence and
was never recorded as such. The tracked aggregate contains no rounds, no
issues, and no decision.

### Unresolved or contradictory evidence

Pending.

## Limitations

- This study is research and specification only. It does not authorize a
  production copy rewrite.
- Two moderated rounds of 5–8 participants cannot support statistical claims.
  All findings will be reported as exact numerators and denominators.
- Agents, generated personas, role-played candidates, and expert review are not
  valid substitutes for participant evidence and will not be recorded as such.
- The desk audit can identify candidate problems and rank them by product
  reasoning. It cannot establish comprehension, trust, or assistive-technology
  usability. Those require the participant rounds.

## Open gates

| Gate | Owner | State |
|---|---|---|
| Approval-channel binding | Executor | Pending |
| Recruitment channel | Decision owner | Not requested |
| Consent language | Decision owner | Not requested |
| Compensation authority | Decision owner | Not requested |
| Approved location for raw notes | Decision owner | Not requested |
| Retention/deletion period | Decision owner | Not requested |
| Recording authority and viewers | Decision owner | Not requested |
| Prototype exposure method (R1) | Decision owner | Not requested |
| Prototype exposure method (R2) | Decision owner | Not requested |
| Final direction selection | Decision owner | Pending |

## Source ledger

| Source | Kind | Observed | Used for |
|---|---|---|---|
| `product/FEATURE_SPEC.md` | Maintained repository authority | Execution base | Constraints that cannot be weakened |
| `product/ROUTES.md` | Maintained repository authority | Execution base | Route identity and the 36 canonical stable route IDs |
| `product/SCREEN_STATES.md` | Maintained repository authority | Execution base | Legal state families per route |
| `product/DESIGN_SYSTEM.md` | Maintained repository authority | Execution base | Existing tone and presentation contract |
| `docs/LANDSCAPE.md` | Maintained repository authority | Execution base | Positioning and prohibited claims |
| `content/authoring/packs/README.md` | Maintained repository authority | Execution base | Authored-content review boundary |

External benchmark sources, all observed **2026-08-27**:

| Source | Kind | Used for |
|---|---|---|
| <https://apps.ankiweb.net/> | Benchmark, group A | Review vocabulary economy |
| <https://www.mometrix.com/academy/> | Benchmark, group A | Unofficial-status disclaimer economy |
| <https://www.khanacademy.org/> | Benchmark, group A | Failure-state error structure |
| <https://www.gov.uk/> | Benchmark, group B | Plain task labelling; provenance marks over prose |
| <https://www.usa.gov/> | Benchmark, group B | Teaching the reader to verify officialness |
| <https://www.cs.ny.gov/jobseeker/> | Benchmark, group B | The candidate's real exam vocabulary; acronym counter-pattern |
| <https://designsystem.digital.gov/design-principles/> | Method guidance | "Trust has to be earned every time"; skim-and-scan |
| <https://obsidian.md/> | Benchmark, group C | Local-first stated as user-visible consequence |
| <https://joplinapp.org/> | Benchmark, group C | Local vs optional-cloud as a choice, not a lifecycle |
| <https://www.w3.org/WAI/test-evaluate/involving-users/> | Method guidance | Small-sample reporting limits |
| <https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service> | Method guidance | Round structure; 4–8 participants per qualitative round |

Attempted and not retrievable, recorded so the set is not silently selective:
<https://www.duolingo.com/> and <https://excalidraw.com/> (client-rendered, no
content), <https://www.nyc.gov/site/dcas/employment/take-an-exam.page> and
<https://uniontestprep.com/> (HTTP 403).
