# Design export — September 7, 2026 (second pass)

Prepared against repository revision `33fcdf7d4e014f1c8e6e26841223bd6b3d458e30`,
reading `design-review/2026-09-07/DESIGN-BRIEF.md`, `LATEST-REVIEW.md`, the
application source under `apps/site/src/`, the released content under
`content/authoring/`, and the implementation captures in
`design-review/2026-09-07/current-screenshots/`.

This pass closes the five focused items in the latest review and leaves the
completed Practice and Review reconciliation, the copy corrections, the mobile
navigation and the restacked section headers exactly as they were.

- `current/` — one settled design per page, plus `styles-additions.css`,
  `support.js`, `DESIGN-DECISIONS.md` and the artwork the pages load. The tool
  artwork is now the whole released set (`t001`–`t065` phone derivatives).
- `explorations/` — history only. Not implementation references.
- `screenshots/` — element captures, named `page--state--width`.

## Page → state → prototype → screenshot

| Page | State | Prototype | Screenshot |
|---|---|---|---|
| Home `/` | First visit | `current/Home.dc.html` | `01-home--first-visit--1248w.png`, `02-…--384w.png` |
| Home `/` | Library open / Library sheet open | `current/Home.dc.html` | `03-home--library-open--1248w.png`, `04-home--library-sheet-open--384w.png` |
| Practice `/practice/` | First visit, nothing saved | `current/Study Hub.dc.html` | `05-practice--first-visit--1248w.png`, `06-…--384w.png` |
| Practice `/practice/` | Returning: 23 saved records, 5 ready to review, 2 unavailable | `current/Study Hub.dc.html` | `07-practice--returning--1248w.png`, `08-…--384w.png` |
| Practice `/practice/` | Read failed (recovery notice, review warning, history still readable) | `current/Study Hub.dc.html` — `readFailed` tweak | `39-practice--read-failed--1248w.png` |
| Exams `/exams/` | Record open / first visit | `current/Landing.dc.html` | `09-exams--record-open--1248w.png`, `10-exams--first-visit--384w.png` |
| Review `/review/` | Ready, one Finish review confirmation open | `current/Review Queue.dc.html` | `20-review--ready-with-confirmation--1248w.png`, `21-review--ready--384w.png` |
| Review `/review/` | Cleared / could not be built / finished review not saved | `current/Review Queue.dc.html` | `23-review--cleared--608w.png`, `24-review--read-failed--608w.png`, `25-review--finish-not-saved--608w.png` |
| Question player | Unanswered / answered with explanation and sources | `current/Question Player.dc.html` | `26-question-player--unanswered--800w.png`, `27-question-player--answered--800w.png` |
| Simulation | Item navigator, 45 items, submit confirmation | `current/Simulation Navigator.dc.html` | `28-simulation-navigator--45-items--928w.png` |
| Session builder | Practice set | `current/Session Builder.dc.html` | `22-session-builder--practice-set--1053w.png` |
| Session builder | Hazard drill (all 18 scenes, task construct) | `current/Session Builder.dc.html` | `29-session-builder--hazard-drill--1053w.png` |
| Session builder | Full simulation, timed controls open | `current/Session Builder.dc.html` | `30-session-builder--simulation-timed--1053w.png` |
| Session builder | One area selected: longer lengths unavailable with the real count | `current/Session Builder.dc.html` | `31-session-builder--length-unavailable--1053w.png` |
| Tool atlas `/atlas/` | All 65 records, nine family tabs | `current/Tool Atlas.dc.html` | `32-atlas--all-families--990w.png` |
| Tool atlas `/atlas/` | One family selected (rigid hand tools, 15) | `current/Tool Atlas.dc.html` | `33-atlas--rigid-hand-tools--990w.png` |
| Tool atlas `/atlas/` | Compact: nine families as one labelled control | `current/Tool Atlas.dc.html` | `34-atlas--compact-family-select--384w.png` |
| Tool atlas `/atlas/` | Illustrations not on this device (records still readable) | `current/Tool Atlas.dc.html` — `imagesAvailable` tweak | not captured |
| Hazard scene | Marking the image, two markers placed | `current/Hazard Player.dc.html` | `35-hazard-player--marking--990w.png` |
| Hazard scene | Saved, feedback open | `current/Hazard Player.dc.html` | `36-hazard-player--revealed--990w.png` |
| Hazard scene | Keyboard task, observable zones | `current/Hazard Player.dc.html` | `37-hazard-player--keyboard-zones--990w.png` |
| Hazard scene | Confirming no marks / save failed / feedback failed / storage or content unavailable | `current/Hazard Player.dc.html` — state chips | not captured |
| Print | Builder configuring, saved preview, stale job | `current/Component Library.dc.html` §d-print | `38-print--builder-and-preview--699w.png` |
| Settings `/settings/` | Returning / delete preview / export contents | `current/Settings.dc.html` | `11-settings--returning--1248w.png`, `12-…--384w.png`, `13-settings--delete-preview--608w.png`, `14-settings--export-file-contents--608w.png` |
| Offline `/offline/` | Turned on / nothing downloaded / removal preview / storage unavailable | `current/Offline.dc.html` | `15-offline--turned-on--1248w.png`, `16-…--384w.png`, `17-offline--nothing-downloaded--1248w.png`, `18-offline--removal-preview--608w.png`, `19-offline--storage-unavailable--608w.png` |
| Component library | Specimens and contracts | `current/Component Library.dc.html` | §d-print only (not a route) |
| Future work | Capability the release does not have | `current/Future Explorations.dc.html` | not captured (no route) |

Example data is shared across pages: 14 saved question answers, 5 scene
responses, 4 finished reviews (23 records), 5 items ready for review (4 missed or
misidentified, 2 flagged, one item both), and 2 saved attempts that cannot be
read — dated Aug 23 to Sep 6, 2026. The builder fixture is 34 / 26 / 30 questions
across the three areas (90 in the bank) and 18 hazard scenes.

## Visible changes in this pass

1. **Session builder reconciled with the supported setup.** The weighting choice
   (“weighted toward questions you have missed”) is gone: a set is one shuffle over
   the selected areas from the set code, and the form says so. The illustrated /
   written split is gone from the preview, which now lists only computed facts —
   format, length with the areas it draws from, timing, when feedback appears, what
   gets saved. A length the selection cannot fill is a **disabled option carrying
   the real count** (“Unavailable — 34 questions match this selection”) beside an
   “All 34 questions” option, and the notice says nothing is padded with a repeat
   and no set is quietly made shorter. Simulation timing gained the real controls:
   duration in minutes, start with the timer hidden, and auto-submit off unless you
   opt in. The hazard drill lost its setting picker — all 18 scenes sit in one
   category, so the picker changed nothing — and offers 1, 5, 10 and all 18. The
   set code moved into a “Repeat this exact set” disclosure, where the
   implementation puts it.
2. **Tool atlas drawn at full inventory.** All 65 released records with their own
   accepted illustration, nine visual families as the tab row with counts
   (cleaning implements 10, articulated hand tools 12, PPE 3, soft or deformable 7,
   carts 4, powered cleaning 8, other 4, rigid hand tools 15, ladders/access 2),
   and the count line “Showing all 65 illustrated tools.” The “57 of 65 have no
   illustration yet” notice is deleted and replaced by what is true: 53 records can
   appear in scored practice and 12 stay reference-only while a source caution or a
   specialist review is open, each marked “Reference-only: excluded from scored
   practice.” Image alternatives are the released per-record text, generated from
   each record’s accepted recognition cues.
3. **A compact treatment for nine families.** Ten tabs wrap into four rows of
   targets on a phone, so below 48rem the families become one labelled `Family`
   control with the counts in its options; the row keeps the record name, a
   thumbnail and the reference-only note.
4. **Hazard player rebuilt on the real controls.** View controls (zoom, four-way
   pan, reset, a live “N% view”), “Add marker at center”, per-marker move and
   remove, and one save button — “Save marks” for the image, “Save response” for
   the keyboard task. Saving with nothing marked opens the neutral confirmation
   (“Submit without marking a concern?”); “Clear all” and the separate
   submit-with-no-marks button are gone, as is the review workflow and its queue
   reason — a review is finished on `/review/`. States are the controller’s:
   restoring, storage unavailable, content unavailable, released-image unavailable,
   marking, confirming zero, committing, save failed, revealed, feedback failed,
   and recorded inside a simulation. Feedback reads as the release publishes it:
   the outcome sentence with its extra-mark count, per-marker “Hazard found” /
   “Safe as shown” / “Already marked”, hazards missed, and conditions grouped as
   needing correction or safe as shown. The keyboard version is selectable zones
   whose feedback says only whether you selected each one — zone choices are never
   auto-matched or scored.
5. **Print reconciled.** One product per job as a radio list of the ten real
   products, each unavailable one stating its own reason; a content filter; a count
   bounded by “Available questions: 90”; paper and margins as separate controls;
   large print, grayscale preview, released print images and source references as
   flags that stay disabled where the product does not carry them; answer-key
   placement and the appended-explanations option; the pairing label. The saved
   preview carries actual length, the per-area distribution and an estimated page
   count, with the release, pairing identifier and manifest fingerprint under
   Technical details. System print is gated on the inspection checkbox and withheld
   while a job is stale, and nothing claims printing occurred.
6. **Current component examples brought into line.** The `HomeDashboard` specimen
   no longer offers “Resume at 13”: both its ready and offline variants start a
   45-question set. `HistoryList`’s contract notes describe saved records, drop the
   Resume/Results links, and state that a simulation in progress is the one session
   and appears on its own route. The `EmptyState` specimens speak in saved
   activities, the progress meter is labelled as simulation progress, the
   PageState loading composition builds a simulation of 45, and `SessionSummary`
   opens by scoping itself: a simulation is the one activity that is a session —
   the claim that the whole product has no session object was too broad. Its
   distribution row is per subject area instead of an invented illustrated / written
   split, and its identifiers moved under Technical details.
7. **Two atlas specimens retargeted.** “Pipe wrench — no illustration yet” is
   false now that every record is illustrated, so it reads as a read failure on the
   device; and the filtered-empty card is replaced by the reason the atlas has no
   such state — every family holds at least two records, so a tab cannot return
   zero.
8. **Screenshot index cleaned.** The superseded `01-home--first-visit--1248x2844.png`
   and `02-…--384x2097.png` are deleted; the Library-open captures are renamed to
   the `--1248w` / `--384w` convention. Practice read-failed is now captured.

## Intentional differences from the current implementation

- **Mobile navigation.** The designs keep the accepted four-tab bar with a Library
  sheet; the implementation captures show header navigation with a popover.
- **No profile picker on the builder or the print form.** Both implementation forms
  still open with “Practicing for” and a study-profile select. The statewide and
  Nassau profiles draw on the same bank, so the control cannot change what is built
  — it is left out by decision, not by omission.
- **Three named setup compositions.** The design keeps practice / hazard drill /
  full simulation as separate compositions; the implementation ships one form whose
  format radio covers the same ground. Nothing in the design depends on which way
  the routes are split.
- **Section order on Practice** and the four-across card grid on a first visit.
- **Question position.** The player shows “Question 7 of 45 in this session”; the
  implementation renders “Practice question · Text version” in that slot.
- **Simulation submit copy.** “Submit this simulation?” with “Submit for results”;
  the implementation says “Submit final answers?”. Either is acceptable.
- **Figures on a first visit** carry site facts (90 questions, 18 scenes, 65 tool
  records, 3 areas) rather than zeros.

## Not exported, and not verified

- No captures for: the atlas with illustrations unavailable, the hazard player’s
  five failure and confirmation states, the atlas record shell, the remaining
  Component Library specimens, or `Future Explorations.dc.html`. Each is reachable
  in the prototype through its state chips or tweaks.
- Element captures are produced by DOM re-rendering, so **native checkboxes and
  radio buttons appear without their checked marks** in the screenshots. Their
  state is correct in the prototypes — read the count lines and the preview panel
  beside them (“34 of 90 questions selected”, “1 zone is ready to save”).
- The print sheet mock inside the preview is one page of a six-page job, not a
  paginated proof; pagination is the `@page` layer the implementation owns.
- No browser, accessibility, contrast or cross-device verification was run on this
  export. The screenshots are element captures from the design prototypes at
  1248 / 1053 / 990 / 928 / 800 / 699 / 608 / 384 px, not application captures, and
  they are not a fidelity claim.
