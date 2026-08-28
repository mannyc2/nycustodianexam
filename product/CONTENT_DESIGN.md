# Consumer-language contract

**Direction:** `CL-CODEX-1` — consumer-language safety envelope

**Evidence mode:** `codex-only`

**Status:** maintained implementation-facing contract, selected 2026-08-28

**Evidence label:** **NOT HUMAN-USABILITY-TESTED**

```yaml
programVersion: CODEX-ONLY-UIUX-V1
humanEvidence: none
humanParticipantCount: 0
notHumanUsabilityTested: true
```

## Machine-readable selected-direction closure

```json
{
  "schemaVersion": "codex-only-rule-closure-v1",
  "programVersion": "CODEX-ONLY-UIUX-V1",
  "directionId": "CL-CODEX-1",
  "evidenceMode": "codex-only",
  "humanEvidence": "none",
  "humanParticipantCount": 0,
  "notHumanUsabilityTested": true,
  "rules": [
    {
      "id": "CL-CL1-QUARANTINE",
      "statement": "Keep recovered CL-1 bytes unchanged as evidence and author factually current U.S.-English CL-2 copy."
    },
    {
      "id": "CL-DORMANT-CORRECTION",
      "statement": "State the dormant correction boundary in consumer terms and never imply an unavailable endpoint can receive a report."
    },
    {
      "id": "CL-FOCUSED-FEEDBACK",
      "statement": "Use specific outcomes and concise plain rationales, remove internal model labels and canned cadence, and keep required proof reachable."
    },
    {
      "id": "CL-LAYER-PROOF",
      "statement": "Keep human-readable proof adjacent or disclosed and move raw identifiers and diagnostics out of the default layer."
    },
    {
      "id": "CL-NO-UNMEASURED-TIME",
      "statement": "Do not publish a practice-duration estimate without measured evidence for the exact task and conditions."
    },
    {
      "id": "CL-TASK-FIRST",
      "statement": "At each action or decision, state the learner task, material consequence, and next safe action clearly."
    },
    {
      "id": "CL-TYPED-PUBLIC-ERRORS",
      "statement": "Map typed failures to stable outcome, preserved-state, and recovery copy while keeping raw exceptions internal."
    },
    {
      "id": "CL-US-ENGLISH-FACTS",
      "statement": "Use U.S. English, current derived counts, and bounded factual claims without unsupported universal language."
    },
    {
      "id": "SHARED-EXPLICIT-PROFILE-CONTEXT",
      "statement": "Require explicit or visibly neutral profile context and never silently substitute the first jurisdiction."
    },
    {
      "id": "SHARED-HUMAN-EVIDENCE-BOUNDARY",
      "statement": "Keep human evidence none, human participant count zero, and every result labeled not human usability tested."
    },
    {
      "id": "SHARED-PRESERVE-LOAD-BEARING-TRUTH",
      "statement": "Preserve unofficial status, uncertainty, source support, local-data risk, security boundaries, and commit-before-reveal."
    }
  ]
}
```

This contract establishes the shared consumer-language safety envelope supported
by independent Codex inspection of the current site, the Plan 004 audit at
`fecc71c5ea240385b3d98f896b1152022a2bbbe8`, and the recovered CL-1 artifacts at
`9fc7dcacfc961752e5d9a2cedbc426deead54a05`. It does not select CL-D1, CL-D2,
or a hybrid between them. It is not evidence of learner comprehension, trust,
task success, preference, or assistive-technology use.

The eight recovered CL-1 files remain unchanged evidence. They are not
production copy: they contain stale or unsupported counts, timing, artwork,
coverage, source, and universal claims. New copy governed by this contract is
CL-2. It uses U.S. English and current product facts.

## Direction

`CL-CODEX-1` records constraints that any later CL-D1, CL-D2, or separately
authored implementation must satisfy; it is not a candidate-direction choice:

1. At an action or decision, make the learner's task, immediate consequence,
   and next action clear.
2. Put one necessary limit beside the decision it controls.
3. Keep proof easy to find as ordinary publisher/title/date information.
4. Put locators, IDs, versions, hashes, seeds, storage-engine terms, and release
   diagnostics in a clearly named details or support layer.
5. Never remove unofficial status, uncertainty, source support, local-data risk,
   commit-before-reveal, security boundaries, or recovery information.

This is a safe boundary for downstream specification and implementation, not a
selection between the Plan 004 candidates or a claim that people prefer one.

## Four copy roles

Every public surface accounts for the applicable roles below. Their numbering,
universal prominence, and route-specific stacking order are not selected.

| Role | Required content | Examples |
|---|---|---|
| Task | Purpose, current state, primary action | “Choose a practice set”; “Review missed questions”; “Try again” |
| Consequence | One material limit, what changes, what stays | “Submitting locks this answer”; “Your old offline copy still works” |
| Proof | Human-readable evidence and uncertainty | Publisher, document title, date, known/unknown status, “Where this comes from” |
| Technical details | Reproducibility and support coordinates | Exact locator, version, checksum, internal ID, seed, schema, diagnostics |

For static, non-answer-bearing public information, layers 3 and 4 remain
semantic and keyboard reachable without JavaScript. Once answer-bearing
postcommit content is legally available, its disclosure remains native and
keyboard reachable, but it is not embedded in the initial document, executable
closure, or safe precache and is not requested or read before durable
commitment. A disclosure may reduce prominence; it may not make evidence that
is legal in the current state unavailable.

## Voice and claim rules

- Use direct verbs and concrete nouns. Prefer “start,” “submit,” “save,”
  “review,” “download,” and “try again.”
- Use sentence case, U.S. English, and short paragraphs. Do not use a warm tone
  to add urgency, guilt, streak pressure, readiness, mastery, or pass claims.
- State the proposition once near Home's H1: free, independent, unofficial study
  for the supported New York entry-level Custodians and Janitors series; no
  account required. Do not imply affiliation or endorsement.
- Keep the statewide series and Nassau layer distinct. NYC is a different exam
  system and remains deferred unless a sourced disambiguation page passes its
  publication gate.
- Describe inventory as what this site currently contains, never as complete
  coverage of an exam. Counts must be derived from the current release.
- Do not state practice duration until measured evidence supports the exact
  task, device, and conditions. A question count is not a time estimate.
- Do not use “actual questions,” past-exam equivalence, guaranteed passing,
  official score conversion, or unsupported official counts or weights.
- Never print an arbitrary exception `detail` or `message` as public copy.

## Selected public vocabulary

| Avoid in the default layer | Use | Required meaning |
|---|---|---|
| `Commit answer` | `Submit answer` | Explain before the button that submission locks the choice; save must still succeed before feedback appears. |
| `Saving answer` | `Saving your answer…` | Announce completion or a recoverable failure; preserve the selection on failure. |
| `acknowledge` an item | `Finish review` | State whether this removes the item from the current queue. |
| `deterministic set seed` | `Repeat this exact set` | Keep the seed in technical details when reproducibility is needed. |
| `local-first` | `Saved on this device` | Also state that browser data can be cleared and offer export where supported. |
| `offline pack` as the first concept | `Use offline` | Name states by consequence: ready, downloading, checking, update failed, or not downloaded. |
| `Tool atlas` as unexplained taxonomy | `Study tools` or a task-specific heading | Preserve the `atlas-*` route IDs and canonical paths. Exact global labels remain an explicit synthesis limitation. |
| `Transparency` as an unexplained destination | `Sources and methods` in task copy | Keep security, privacy, corrections, FOIL, source, and history destinations intact. |
| raw claim/source/inventory/marker IDs | `Where this comes from` | Show publisher, title, and date first; exact coordinates remain available in details. |
| `authored condition`, `scene model`, `visual-recognition construct` | the observed unsafe condition and why it matters | Preserve equivalent visual/nonvisual assessment semantics internally. |

Canonical civil-service terms such as *examination*, *announcement*,
*eligibility*, *qualifications*, *official score*, and *eligible list* remain
when they are the accurate terms. Plain language must explain them, not replace
them with a less accurate synonym.

## Surface contracts

### Home

Near the H1, state the four-part proposition: free, independent, unofficial, and
no account required. Present one visually dominant first action and secondary
task links. The exact state-neutral ordering of `Check my exam` and
`Start practice` remains unresolved; an implementation must not silently infer
exam fit to make the choice disappear.

### Exam context

Start with “Does this match my exam?” Show the selected jurisdiction/title and
the controlling announcement before versions or registry data. Keep known,
unknown, conflicting, superseded, and not-applicable states explicit. Put raw
compatibility keys and fact-sheet history under technical details.

Practice must never silently default to Nassau or the first available profile.
If no profile is selected, show a neutral context and require an explicit choice
before a jurisdiction-specific set starts. If a profile is selected, show
“Practicing for: {profile label}” with a visible change action.

### Practice start

Use “Choose a practice set.” Put feasible question-count starts before capacity
diagnostics and name every offered set's exact current count. The agent evidence
does not establish which valid count should be the primary choice; the supplied
lane's shortest-available proposal remains a one-lane hypothesis. Do not
describe any set in minutes. Move translated capacity information under “Why
some set sizes are unavailable.” Do not render raw domain, family, or
confusion-set keys or a wall of disabled controls in the default path.

### Questions, hazards, and review

Before submission, state that the choice remains editable until `Submit answer`
and that feedback opens only after the save succeeds. After submission, order
content in the exact maintained `FEATURE_SPEC.md` sequence:

1. outcome;
2. correct rationale;
3. rationale for the learner's choice;
4. rationale for every other distractor;
5. decisive feature or rule when authored;
6. confusion-set feedback when applicable;
7. source lines with publisher, title, locator, date, and tier;
8. full post-submission image description; and
9. review, report, and next actions.

`FEATURE_SPEC.md`, not Codex preference evidence, controls this sequence. The
cross-lane finding controls only the specific, plain, non-canned wording inside
the required slots and the removal of internal model vocabulary.

Apply the plain-language layers within those slots; do not collapse, omit, or
reorder them. Each rationale should state its specific reason briefly, while
every authored distractor remains explained. The source slot retains the
maintained publisher/locator/date/tier proof and may render it inline or in a
native disclosure at that exact point; its route-specific prominence remains
unresolved. The full post-submission description remains directly reachable in
its ordered slot. Additional raw IDs, hashes, schema coordinates, and support
diagnostics belong under a disclosure. A disclosure may not reorder or omit a
required explanation or source slot.

Do not begin every explanation with the same “Correct.” template. Use a specific
outcome sentence. Translate hazard targets and decoys into the observed
condition and consequence. Keep “Review” as the task; do not expose projection,
directional-relationship, marker, or false-positive model names.

### Public errors

Every error has a finite reviewed message with this order:

1. what happened in task language;
2. whether the learner's answer, draft, session, prior pack, or settings remain;
3. the next safe action; and
4. a support/details route when diagnostics are useful.

Typed conditions select the message and recovery action. Unknown errors use a
stable fallback and correlation-safe support detail; raw exception strings are
internal only. Visible and live-region copy must be identical in meaning.

### Offline and local data

Say what is available on this device and what connectivity changes. Use
“Ready offline,” “Downloading,” “Checking download,” “Update failed—your old
copy still works,” and “Not downloaded.” Explain that browser data can be
cleared. Keep staging, activation, generations, checksums, IndexedDB, and shell
fingerprints in technical details.

### Corrections while intake is dormant

When the online intake is dormant, state that reports cannot be sent and do not
offer an enabled control or label that implies network submission can succeed.
Keep the correction/security policy reachable. A local note or draft action may
appear only when its exact local persistence and deletion behavior exists and
is stated truthfully; agent evidence did not select that substitute action.
Activation requires the separate production authority already defined by the
feature contract.

## AI-slop and trust rejection rules

Reject public copy that:

- repeats editorial words such as `accepted`, `reviewed`, `source-backed`, or
  `site-designed` without a decision-specific reason;
- begins a series of explanations with the same canned phrase;
- stacks denials or infrastructure absences instead of stating the consumer
  guarantee once;
- uses abstract noun chains, internal IDs, or unexplained precision to sound
  authoritative;
- invents testimonials, social proof, timing, completeness, or certainty; or
- describes incomplete architecture as a learner benefit.

Varying phrasing is not enough. Each sentence must add task, consequence,
evidence, or recovery meaning.

## Accessibility and review acceptance

- Headings, labels, instructions, errors, and actions must make sense when read
  out of visual context.
- One state change gets one concise live announcement; focus moves only where
  `SCREEN_STATES.md` requires it.
- Labels name the action, not the icon or storage mechanism. Link purpose is
  distinguishable without surrounding prose.
- Disclosures use native semantics. Static, non-answer-bearing disclosures
  remain available with JavaScript off; answer-bearing postcommit disclosures
  obey the durable commit-before-fetch boundary.
- Original answer-bearing, security, factual, source, and translation review
  gates remain unchanged.
- Automated readability, lint, accessibility, and Codex checks can reject a
  defect. They cannot establish comprehension or human usability.

## Explicit unresolved boundary

The agent evidence does not resolve the following as human preferences:

- `Check my exam` versus `Start practice` as Home's universal primary action;
- exact global-navigation labels and grouping names;
- the full choice between CL-D1 and CL-D2, including any hybrid; neither
  candidate direction is selected;
- which valid question count, if any, is the universal primary Practice start;
- any practice-time estimate; or
- whether source proof should be inline or disclosed on each individual surface.

This contract resolves the safe envelope around those choices. Later Codex work
may choose an implementation within it and must record dissent; it may not call
that choice participant consensus.

## Evidence and limitations

The supporting structured reports and deterministic synthesis live under
[`../research/ui-ux/codex-only-v1/`](../research/ui-ux/codex-only-v1/). The
Plan 004 desk audit still accounts for 120 copy families: 79 `REWRITE`, 24
`KEEP`, 9 `MOVE_TO_DETAILS`, 5 `INTERNAL_ONLY`, 2 content re-reviews, and 1
support relocation. No participant round occurred and all human counts remain
zero. Confidence is moderate for identifying source-level wording defects and
bounded design rules, and unknown for real-user outcomes.
