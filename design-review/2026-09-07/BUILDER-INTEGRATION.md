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
