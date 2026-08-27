# Consumer-language study (Plan 004)

**Status**: `decision pending`. The desk inventory is complete. No benchmark
evidence has been gathered, no participant research has been conducted, and no
direction has been selected. Result sections below are explicitly empty until
the evidence that fills them exists.

## Source coordinates

| Coordinate | Value |
|---|---|
| Planning commit | `e6f911901f7f18f6716204309fee8b103419a5e0` |
| Execution base | `115b91a3cce5a6ec4cdbe7981847f8d494e326eb` |
| Output branch | `codex/uiux-consumer-language` |
| Plan | [`plans/004-establish-consumer-language-boundary.md`](../../plans/004-establish-consumer-language-boundary.md) |

The execution base is the commit that published the reviewed Plan 004 file and
its `plans/README.md` row. Plan 004 requires an execution base that contains
both; the planning coordinate `e6f9119` does not, because the plan program was
published on `codex/uiux-research-program-plans` (draft PR #36) and has not been
merged to `main`. The base is an immutable commit pushed to `origin` and a
descendant of the planning coordinate. This deviation from the plan's literal
`git rev-parse origin/main` step is recorded here rather than silently applied;
if PR #36 merges, a successor executor should re-derive the base from the merged
`main` head and record the new SHA.

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
| Benchmark study | 8–12 dated current products across consumer exam prep, trusted public-service tools, and no-account/offline consumer experiences | Pending |
| Prototypes | Eight text-first local prototypes, piloted once, frozen per round under a locked normalization and manifest algorithm | Pending |
| Round 1 | Moderated, 5–8 qualifying participants, nine locked tasks each | Not authorized |
| Round 2 | Moderated, 5–8 new qualifying participants, every critical round-one issue retested | Not authorized |
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

Pending. No benchmark has been observed. Nothing may be written here from
memory; benchmark claims require a direct URL and an observation date.

### Round one

Not conducted. Participant recruitment, consent, compensation, research-data
handling, recording, and prototype exposure are not authorized.

### Round two

Not conducted.

### Accessibility findings

Pending.

### Prototype comparison outcomes

Pending.

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

External benchmark sources will be appended here with direct URLs and
observation dates when the benchmark study runs. None have been observed.
