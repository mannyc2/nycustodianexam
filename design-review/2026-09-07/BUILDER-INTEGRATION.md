# Builder integration findings

Inspected against implementation commit `6aa5efd` on September 9, 2026.
The accepted Practice/Hazard builder is still outstanding; simulation setup
does not satisfy that requirement.

The current question-practice route is generated for each fixed set and position
by `apps/site/scripts/practice-sessions.ts` and `generate-pages.tsx`. Its receipt
identifies the release, pack, set, position, question and exact postcommit object.
Both Review (`review/projection.ts`) and saved activity (`study/activity.ts`)
resolve those receipts against the generated bootstrap inventory. Merely making
up a new session identifier in the browser would make those saved answers
unavailable to the existing projections. Reusing an existing position receipt
for a different question would violate the content identity boundary.

The next implementation must therefore cover generation, navigation, receipt
resolution and saved activity together. An arbitrary repeat code cannot be
implemented by selecting among the three existing static set links. Preserve
those links and receipts for existing history while adding the builder path.
Keep practice set configuration separate from resumable simulation sessions.
Do not import answer-bearing simulation evaluation into the builder.

Safe question categories come from `question-category.ts`: 30 cleaning,
37 maintenance, 5 safety and 18 mixed/scenario questions in this release.
The builder must retain that fourth category and derive counts from safe
metadata. All matching is a concrete chosen length: expanding the selected
pool must not silently expand an already chosen set; shrinking below its
length must require an explicit replacement before Start.

Follow-up fixes made during inspection: the hydrated question header now
retains its generated position and Review context; hazard simulation length
guidance describes scene presets rather than question presets. These are
display fixes, not completion of the builder or player visual reconciliation.

## In-progress generation primitive

`apps/site/src/practice/set.ts` now implements the versioned `pb1` descriptor
and deterministic item selection. Its descriptor encodes the normalized repeat
code, category mask and concrete length in the existing receipt-safe alphabet.
The surrounding receipt supplies the release and pack version. Categories use
a canonical order within that release; callers must supply the pinned release's
inventory. No answers, persistence or simulation evaluation enter this module.

Unit evidence covers exact algorithm output, descriptor reconstruction after
inventory/category reordering, Unicode codes, different seeds/releases, the
four actual category capacities, invalid input and duplicate IDs, and explicit
replacement when a requested length exceeds capacity. This primitive is not yet
wired into the UI: player receipt resolution, navigation, Review/Study projection
and builder controls remain required before calling custom practice functional.

`practice/question-set.ts` now assembles question steps with distinct custom-set
receipts and canonical-document query links. Its resolver regenerates the set
from compiled safe inventory and checks the exact release, pack, position,
question, artifact path, byte count and digest. It rejects mismatched inventory
routes and mixed releases. Twelve combined unit tests cover selection and this
receipt boundary. This resolver is still an integration primitive: no production
player or projection calls it yet, and the query links are not exposed in the UI.

## Integration update

The question path is now wired into Practice, the player, saved activity and
Review. See `PRACTICE-BUILDER-REVIEW.md` for current evidence and remaining work.
The preceding primitive-only status describes the earlier commits.

## Hazard generation groundwork

`practice/hazard-set.ts` implements drill selection for the accepted 1/5/10/all
scene counts using the shared versioned repeat-code algorithm. Visual and
keyboard modes retain the same scene order but separate attempt identities,
canonical routes and mode-specific receipts. Resolution checks the exact scene,
mode, release, pack, asset revision/master digest and postcommit receipt.
Three focused tests cover every offered length, reconstruction after inventory
reordering, mode separation and changed receipt coordinates. Combined with the
shared selection suite, 11 tests pass; all workspace typechecks also pass.
This module is not yet called by the Hazard UI or saved-history projections;
that integration is still required. Existing Hazard controllers are unchanged.

Hazard integration is now implemented; see `HAZARD-BUILDER-REVIEW.md` for
current behavior, evidence and remaining audit work.
