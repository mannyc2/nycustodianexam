# Simulation player, timer and results review

Reviewed the production build at implementation commit `622c6bb`, using Chromium
at 1008 and 384 CSS viewport widths. `capture-simulation-flow.mjs` installs and
activates a real verified offline pack, creates a timed 45-question simulation,
records three answers, flags item two and advances to item four. It captures the
player, hidden timer, results introduction, first answer explanation and an
unanswered result. Ten images and the assertion manifest are retained in
`simulation-flow-screenshots/`.

The desktop player has readable bounded question content, full-width answer
controls and a separate navigator/timing panel. At 384px these sections stack;
answer text, navigator states, timer copy and result explanations remain within
the content bounds. The results heading receives focus after submission. The
heading's visible focus outline in the screenshots is intentional. Result cards
retain explicit selected/correct answers, rationales, source disclosure and next
actions; unanswered items say “No answer” and remain distinguishable from
incorrect selections. The mobile results screenshot is a viewport capture, so
the fixed bottom navigation and the continuation below the viewport are expected.

The script additionally verifies hidden timer visibility survives reload, all 45
results survive reload, the summary remains three answered/42 unanswered, result
navigation focuses the selected item heading, and a flag remains attached to its
saved result. Both widths completed without page errors or results document
overflow. The captures show a short automated session; elapsed time is not evidence
of a two-hour timer run.

All 24 non-Cloudflare Simulation browser regressions passed (eight each in
Chromium, Firefox and WebKit). They cover deterministic capacity, restored edits,
commit-before-feedback, pinned release retirement, retained visual and keyboard
hazard results, unavailable offline prerequisites, failed writes with exact retry,
timer visibility/expiration, explicit auto-submit opt-in and length replacement.
Command: `NYCUSTODIAN_PLAYWRIGHT_BASE_URL=http://127.0.0.1:4187 node
node_modules/@playwright/test/cli.js test simulation.pw.ts --workers=2`, from
`apps/site`. The Static Assets-specific test is excluded by the standard preview
configuration and is not certified by this run.

The accepted export supplies a navigator and setup reference, not a dedicated full
Simulation results mockup. Navigator matching remains documented in
`SIMULATION-NAVIGATOR-REVIEW.md`; this review establishes readable composition and
real behavior rather than claiming a nonexistent exact results reference. The final integrated design audit remains.
No product code changed in the question-flow verification checkpoint.


## Hazard Simulation follow-up

`capture-simulation-hazards.mjs` now retains visual and keyboard player/result
captures at 1008 and 384 CSS widths in `simulation-hazard-screenshots/` (eight
images). Each case installs a real pack, creates a one-scene untimed simulation,
records a center marker or first-zone selection, flags the item, reloads and then
submits. The same seed is supplied to both modes; the format is part of generation
identity, so their selected scenes may differ. The captures are actual responses,
not author-selected correct answers.

Visual inspection found the no-concerns checkbox smaller than the shared controls.
Scoped Simulation CSS now makes it 20px and gives its label at least a 44px target,
with wrapped text aligned beside the checkbox. The capture script verifies these
dimensions in both modes and widths. The native disabled state remains when a
marker or zone is selected. No response or save logic changed.

The visual player retains zoom/pan controls and marker movement; the keyboard
player uses ordered neutral zones without an empty image. Results retain the
scene overlay and marker verdicts for visual responses, zone responses for the
keyboard mode, and the released correction/safe-condition explanations and source
receipts. Full result captures are long because all authored feedback is expanded;
view the original PNG at its native width to inspect typography. Both modes stayed
within document bounds with no page errors. These are adaptations of established
components, not claims of a dedicated hazard-Simulation mockup match.

After the CSS change, root build/artifact verification passed (526 routes, 220
item-scoped artifacts and 291 delivery assets). The two hazard Simulation
regressions passed in all three browsers (six passes), including restored responses
and self-contained feedback after verified cache removal. The earlier 24-check
run remains evidence for unchanged broader Simulation behavior.


### Authored nonvisual question presentation

Illustrated q091 now offers the authored nonvisual prompt and ordered facts in
simulations. Choosing a presentation creates a saved response even before an
answer is selected; that response remains unanswered until a choice is made.
Answer/flag edits retain presentation. Save failures keep the optimistic view and
support retry or another edit under the existing response-save rules. Reload
uses the saved presentation. Final submission freezes it, evaluation copies it,
and integrity validation rejects result/answer presentation mismatches and
presentations unavailable in the pinned question. Hazard responses reject this
question-only field. Legacy records without it retain their original behavior.

Results show the authored prompt/facts and explicitly identify nonvisual use.
Original options, shuffled order, feedback, timing, and commit-before-read rules
remain in force. This is an accommodation for original practice, not evidence of
an official exam format or cross-modality score equivalence.

Validation: 38 simulation unit tests; site/browser typechecks; full 1,352-route
build. All 27 simulation browser workflows excluding the separate Static Assets
case pass across Chromium/Firefox/WebKit. The initial broad run found stale
90-item inventory/category totals; assertions now verify the actual 91-item
inventory and its category partition. A legacy unit assertion likewise used the
old progress sentence; it now verifies the current zero-recorded/one-unanswered/
one-flagged values. Three rechecks pass for the corrected full workflow.

`capture-simulation-nonvisual.mjs` downloads and activates an actual study pack,
starts the deterministic 90-item set, saves q091's nonvisual presentation and
answer, reloads, and submits. Four captures in `simulation-nonvisual-audit/` show
player/results at 1008/384 CSS pixels. Compact player and desktop result were
visually inspected: ordered facts, selected option, and presentation labels fit
without horizontal overflow. Final full-page simulation/reference comparison,
Static Assets, and actual installed v4-to-v5 upgrade remain separate gates.


The actual installed v4-to-v5 test now passes in Chromium, Firefox, and WebKit:
old pack claim/version/item array and responses remain pinned; with the origin
disconnected, the old simulation submits to evaluated results. Original q091
Practice feedback and a new v5 nonvisual answer also work offline. See
UPGRADE-V4-V5.md for source coordinates, manifest hashes, and reproduction.
