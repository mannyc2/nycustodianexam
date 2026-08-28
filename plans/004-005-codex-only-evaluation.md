# Plans 004/005 CODEX-ONLY evaluation packet

programVersion: CODEX-ONLY-UIUX-V1
evidenceMode: codex-only
humanEvidence: none
humanParticipantEvidence: none
humanParticipantCount: 0
notHumanUsabilityTested: true
statusLabel: NOT HUMAN-USABILITY-TESTED

**Status:** CODEX-ONLY scope complete on draft PR #41. This is not a human
usability study, participant study, accessibility conformance certification, or
production implementation.

## Owner-selected boundary

The owner retired the volunteer, moderator, human-review, human-decision, and
sign-off path for this program. No person is to be contacted or recruited.
There are no consent, incentive, recording, contact-registry, research-store,
facility, device-lab, or human approval dependencies.

Codex agents are not humans. Personas, simulations, automated checks, corpus
observations, browser inspection, and owner-supplied Codex findings never enter a
human sample. Every human count remains zero. The packet selects the best
available bounded direction for agent-only work and always carries
**NOT HUMAN-USABILITY-TESTED**.

The prior branch-only volunteer packet, private participant schemas, outreach
kit, compensation/recording records, and fieldwork validator have been removed
instead of being presented as an inactive alternative.

## Immutable inputs

| Input | Exact coordinate | Retained use |
|---|---|---|
| Released Step 1/current-site base | `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | Actual current source, maintained contracts, recovered prototype set |
| Plan 004 draft evidence | `fecc71c5ea240385b3d98f896b1152022a2bbbe8` | 120-family audit, benchmark record, candidate definitions |
| Plan 005 draft evidence | `9daddbfde073f1f73d806a68dac427b69efc8359` | Fixed 21-family, 32-route, four-spoke inventory and hypotheses |

Exact file-level SHA-256 values and review joins are machine-readable in
[`evidence-manifest.json`](../research/ui-ux/codex-only-v1/evidence-manifest.json).
The validator resolves each Git blob at its declared commit and rejects drift.

Reusable evidence was not restarted:

- Plan 004 still accounts for 120 copy families: 79 `REWRITE`, 24 `KEEP`, 9
  `MOVE_TO_DETAILS`, 5 `INTERNAL_ONLY`, 2 content re-reviews, and 1 support
  relocation.
- All eight recovered editable CL-1 prototypes remain byte-preserved and
  quarantined. They were not piloted, frozen, or treated as current copy.
- Plan 005's 21 destination families, 32 core route IDs, four spokes, stable
  paths, and learner-task inventory remain the scope. Its priorities are
  hypotheses, not observed behavior.

## Independent review lanes

Each spawned reviewer received an independent task with no preceding review
output. The owner-supplied `/root/free_recruitment` lane was added as structured
evidence without being shown to the three reviewers. Reports retain conclusions,
scores, coordinates, positives, dissent, and limitations only; hidden reasoning
is not stored.

| Agent task ID | Scope | Structured result |
|---|---|---|
| `/root/free_recruitment` | Actual-site cross-domain audit supplied by owner | 11 findings: 8 P1, 3 P2; unresolved choices preserved; no numeric scores invented |
| `/root/language_lane_v1` | Plain language, internal leakage, trust, AI-slop | Current-site mean 2.0/5; recommends `CL-H1-PLAIN-TASK-OPEN-PROOF` |
| `/root/navigation_lane_v1` | Task IA, compact/no-JS navigation, profile, Practice, players | Current model 11/35; `NAV-C2-TASK-FIRST-TWO-TIER` 34/35 after hard-failure elimination |
| `/root/accessibility_lane_v1` | Accessibility, cognitive load, language/navigation interaction, trust | Current code/content mean 2.6/5; seven hard-constraint findings; conditional D1+D2 and task-tier navigation support |

The reports are:

- [`free-recruitment-review.md`](../research/ui-ux/codex-only-v1/free-recruitment-review.md)
- [`language-trust-review.md`](../research/ui-ux/codex-only-v1/language-trust-review.md)
- [`navigation-review.md`](../research/ui-ux/codex-only-v1/navigation-review.md)
- [`accessibility-cognitive-review.md`](../research/ui-ux/codex-only-v1/accessibility-cognitive-review.md)

The manifest also retains one machine-readable `codex-task-receipt-v1` summary
for each lane. Each receipt binds the native task path, session/parent lineage,
provenance class, originator, depth, completion event/turn/message digest,
launch-time repository coordinate, and current report path/hash. Its
`safeReceiptSha256` is SHA-256 over UTF-8 compact `JSON.stringify` of the fixed
ordered fields declared by the validator. A receipt is an audit summary, not a
signature: ordinary CI can validate its exact shape, declared digest, report
metadata, and repository joins, but cannot re-query local Codex JSONL or
cryptographically authenticate a session.

No lane supplies participant quotes, sessions, timings, first clicks, card sorts,
tree tests, preferences, comprehension results, trust judgments, or
assistive-technology-user observations.

## Deterministic synthesis

`codex-only-consensus-v1` is deliberately small:

1. Normalize a recommendation into one bounded rule without changing its
   meaning.
2. Resolve each support to an actual retained `findingId` or
   `recommendationId` in the cited report, then count unique agent task paths.
   Human evidence has weight `0`.
3. Promote a rule only when at least two independent lanes support it and no
   maintained hard constraint fails.
4. Keep a rule unresolved when it has fewer than two supports.
5. Keep the five owner-specified unresolved questions unresolved regardless of
   score or support.
6. Define each direction as the exact closure of promoted rules in its scope
   plus promoted shared rules. Record all dissent and limitations.

The validator recomputes every rule status and both direction closures. It
rejects invented, missing, duplicated, or task-mismatched support references; a
one-lane promotion; an owner-locked promotion; receipt lineage/digest/report
drift; report-metadata drift; a missing review/domain; a duplicate task; a
persona substitution; a nonzero human field; or semantic rule drift in a
canonical contract.

## Selected language boundary

`CL-CODEX-1 — Consumer-language safety envelope` is the maintained CL-2
boundary. It does not select CL-D1, CL-D2, or a hybrid. The promoted common
constraints are:

- task, consequence, and next action first;
- one decision-specific guardrail where it controls a choice;
- readable publisher/title/date proof adjacent or disclosed;
- raw IDs, versions, hashes, seeds, schema, and diagnostics in details/support;
- stable typed public errors: what happened, what was preserved, what to do;
- specific outcome and plain rationale wording without internal model terms or
  canned cadence; the maintained `FEATURE_SPEC.md`, not agent consensus,
  supplies the full rationale/source/description/next-action order;
- explicit or neutral profile context, never silent Nassau/first-profile use;
- current U.S. English facts, derived counts, no universal claims, and no
  unmeasured duration;
- dormant correction intake never implies an unavailable endpoint can receive a
  report; any local draft action must describe implemented persistence.

`CL-D3-NOT-SELECTED` remains a machine-recorded research disposition, not an
implementation rule: the language and accessibility lanes agree that no CL-D3
prototype bytes exist and that the direction sits nearest prohibited urgency,
guilt, readiness, and mastery claims. It is therefore absent from the
`CL-CODEX-1` selected-direction closure.

The exact contract is
[`product/CONTENT_DESIGN.md`](../product/CONTENT_DESIGN.md). It preserves
unofficial status, uncertainty, local-data risk, source support,
commit-before-reveal, and security boundaries.

## Selected navigation direction

`NAV-CODEX-1 — Task and utility separation with focused players` preserves
every fixed route while selecting:

- distinct learner-task and utility/trust discovery instead of seven peer
  links, while leaving exact labels and grouping unresolved;
- focused chrome for the four fixed player route IDs;
- a named native compact disclosure that works without JavaScript;
- visible profile/version context outside that disclosure;
- Practice task starts before diagnostics, without selecting a universal
  primary question count;
- a normal static Review entry;
- equally discoverable visual and text/keyboard hazard tasks; and
- focused player chrome with session/progress and one truthful Exit or
  Save-and-exit, without acquisition/utility navigation.

The exact structural contract is the `NAV-CODEX-1` section of
[`product/ROUTES.md`](../product/ROUTES.md). It intentionally selects no exact
global labels, group count, membership, nesting, or order. The earlier proposed
rule assigning every non-player route to one `standard` complement had only one
genuine task-level support and is now unresolved, not part of the selected
direction.

## Cross-lane priorities

The deterministic rule set promotes these first implementation targets:

1. replace arbitrary public exception text with typed consumer error messages;
2. remove silent profile substitution and simplify Practice around a visible
   profile, feasible count-labelled starts, and later diagnostics;
3. add focused session chrome and a truthful exit;
4. split learner tasks from trust/data utilities with native compact behavior;
5. make dormant correction behavior match the disabled network boundary; and
6. build current CL-2 copy rather than promoting CL-1 bytes.

The accessibility lane also identified marker Move/Remove target-size and motor
load as a high single-lane defect. The existing design system already requires
minimum targets, so downstream verification must cover it; this packet does not
fabricate cross-lane consensus or a human burden result.

## Explicit unresolved register

These remain explicit and are excluded from consensus:

| ID | Unresolved question | Safe boundary now |
|---|---|---|
| `UNRESOLVED-HOME-PRIMARY-CTA` | `Check my exam` versus `Start practice` as a universal Home primary action | Keep both findable; use explicit product state/correctness, never inferred popularity or a silent profile |
| `UNRESOLVED-EXACT-NAV-LABELS-GROUPING` | Exact global labels, group count, membership, nesting, and order | Separate task from utility/trust discovery without selecting exact groups |
| `UNRESOLVED-D1-VS-D2` | Full selection between D1 and D2, including any hybrid | Neither candidate direction is selected; apply only the shared safety envelope |
| `UNRESOLVED-SHORTEST-PRACTICE-PRIMARY` | Whether the shortest valid count should be the universal primary Practice start | Put feasible count-labelled starts before diagnostics; select no preferred count |
| `UNRESOLVED-PRACTICE-TIMING` | Practice duration | State exact current question count only |
| `UNRESOLVED-SOURCE-PROMINENCE` | Inline versus disclosed proof on each surface | Keep proof reachable and readable; do not lead with raw coordinates |
| `NAV-SHELL-BOUNDARY` | Whether every fixed non-player route belongs to one `standard` shell complement | Keep the four fixed players focused; do not infer or claim a selected complement |

## Product and plan effects

This PR promotes only research/contract records:

- new `product/CONTENT_DESIGN.md` for `CL-CODEX-1`;
- the `NAV-CODEX-1` navigation section in `product/ROUTES.md`;
- product/research indexes and Plan 004/005 execution-supersession notes; and
- the exact evidence manifest, task-receipt ledger, visible contract closures,
  and fail-closed validator.

`product/DESIGN_SYSTEM.md` and `product/COMPONENT_ARCHITECTURE.md` remain
unchanged from the released base and are not independent canonical promotions;
future implementation work may project the two canonical contracts into them
without treating that projection as another selected direction.

Production site source remains unchanged. A later implementation plan owns copy,
generator, shell, persistence, correction, CSS, and test changes.

Plans 004 and 005 are `DONE — CODEX-ONLY` in this branch and only become durable
on `main` if draft PR #41 merges. Plan 006 may inspect the promoted contracts
provisionally, but its exact-main branch gate remains closed until that merge.
All downstream work must propagate `NOT HUMAN-USABILITY-TESTED`. Plans 006,
007, and 008 each need a prospective Codex-only execution amendment before
formal execution because their maintained protocols still require human roles.

## Validation contract

Run:

```sh
node --check plans/validate-004-005-codex-only.mjs
node plans/validate-004-005-codex-only.mjs
git diff --check
env PATH=/tmp/nycustodian-bun-1.4.0/package/bin:/run/user/1000/fnm_multishells/277665_1787912744611/bin:/usr/local/bin:/usr/bin:/bin /tmp/nycustodian-bun-1.4.0/package/bin/bun run verify
```

The locked `bun run verify` includes the packet validator as its final gate.
Passing it proves deterministic files, source hashes, review coverage, declared
receipt digests and joins, exact support membership, semantic product-rule
closures, mutation rejection, and the existing repository checks. It does not
authenticate local sessions, prove human usability, or prove accessibility
conformance.

## Limitations

- Confidence is moderate for source-level defect detection and contract fit,
  unknown for human outcomes.
- No human evidence, participant sample, behavioral observation, or human
  approval exists.
- Headless/runtime observations are exact for the inspected bytes and stated
  environment only; they are not device, engine, or assistive-technology
  support intervals.
- Candidate scores are ordinal Codex review aids, not rates, probabilities, or
  statistics.
- The selected directions are the best safe agent-only synthesis available,
  not a substitute for people and not a claim of generalizability.
