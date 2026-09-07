# Design export — September 7, 2026

Prepared against repository revision `1147c7a13eaf6edc2ae0c8d4e8bfae31afc7416c`
on branch `design/reconciliation-2026-09-07`, reading
`design-review/2026-09-07/DESIGN-BRIEF.md`, `LATEST-REVIEW.md`, the application
source under `apps/site/src/`, and the implementation captures in
`design-review/2026-09-07/current-screenshots/`.

The accepted visual direction is unchanged: dark prominent header with a figures
strip, section headers with a side note, hairline tables and lists, task cards,
dark footer; inline top-bar navigation from 48rem and a four-tab bar with a
Library sheet below it. Where the implementation renders header navigation and a
popover instead, that is recorded below as an implementation difference, not a
design change.

- `current/` — one settled design per page, plus `styles-additions.css`,
  `support.js`, `DESIGN-DECISIONS.md` and the artwork the pages load.
- `explorations/` — history only. Not implementation references. The archived turns
  of Practice and Exams now live here as `Study Hub - archive.dc.html` and
  `Landing - archive.dc.html`, moved out of `current/` in this pass so that no file
  under `current/` renders a withdrawn pattern (scheduled review, practice accuracy,
  session resume and history, exam selection or an exam chip). Each carries a dated
  archive banner.
- `screenshots/` — element captures, named `page--state--width`.

## Page → state → prototype → screenshot

| Page | State | Prototype | Screenshot |
|---|---|---|---|
| Home `/` | First visit | `current/Home.dc.html` | `01-home--first-visit--1248x2844.png`, `02-…--384x2097.png` |
| Home `/` | Library open / Library sheet open | `current/Home.dc.html` | `03-home--library-open--1248x2844.png`, `04-home--library-sheet-open--384x2097.png` |
| Practice `/practice/` | First visit, nothing saved | `current/Study Hub.dc.html` | `05-practice--first-visit--1248w.png`, `06-…--384w.png` |
| Practice `/practice/` | Returning: 23 saved records, 5 ready to review, 2 unavailable | `current/Study Hub.dc.html` | `07-practice--returning--1248w.png`, `08-…--384w.png` |
| Practice `/practice/` | Read failed (recovery notice) | `current/Study Hub.dc.html` — `readFailed` tweak | not captured |
| Exams `/exams/` | Record open / first visit | `current/Landing.dc.html` | `09-exams--record-open--1248w.png`, `10-exams--first-visit--384w.png` |
| Review `/review/` | Ready, one Finish review confirmation open | `current/Review Queue.dc.html` | `20-review--ready-with-confirmation--1248w.png`, `21-review--ready--384w.png` |
| Review `/review/` | Cleared queue | `current/Review Queue.dc.html` | `23-review--cleared--608w.png` |
| Review `/review/` | Queue could not be built | `current/Review Queue.dc.html` | `24-review--read-failed--608w.png` |
| Review `/review/` | Finished review not saved | `current/Review Queue.dc.html` | `25-review--finish-not-saved--608w.png` |
| Question player | Unanswered | `current/Question Player.dc.html` | `26-question-player--unanswered--800w.png` |
| Question player | Answered, explanation and sources open | `current/Question Player.dc.html` | `27-question-player--answered--800w.png` |
| Simulation | Item navigator, 45 items, submit confirmation | `current/Simulation Navigator.dc.html` | `28-simulation-navigator--45-items--928w.png` |
| Session builder | Practice set setup | `current/Session Builder.dc.html` | `22-session-builder--practice-set--1053w.png` |
| Settings `/settings/` | Returning | `current/Settings.dc.html` | `11-settings--returning--1248w.png`, `12-…--384w.png` |
| Settings `/settings/` | Delete preview / export file contents | `current/Settings.dc.html` | `13-settings--delete-preview--608w.png`, `14-settings--export-file-contents--608w.png` |
| Offline `/offline/` | Turned on / nothing downloaded | `current/Offline.dc.html` | `15-offline--turned-on--1248w.png`, `16-…--384w.png`, `17-offline--nothing-downloaded--1248w.png` |
| Offline `/offline/` | Removal preview / storage unavailable | `current/Offline.dc.html` | `18-offline--removal-preview--608w.png`, `19-offline--storage-unavailable--608w.png` |
| Component library | Specimens and contracts | `current/Component Library.dc.html` | not captured (not a route) |
| Future work | Capability the release does not have | `current/Future Explorations.dc.html` | not captured (no route) |

Example data is shared across pages: 14 saved question answers, 5 scene
responses, 4 finished reviews (23 records), 5 items ready for review (4 missed or
misidentified, 2 flagged, one item both), and 2 saved attempts that cannot be
read — dated Aug 23 to Sep 6, 2026.

## Visible changes in this pass

1. **The saved record is an attempt, not a session.** The product keeps one record
   per answered question, per scene response and per finished review, and has no
   session object. Practice therefore drops session-level resume and session
   history: the header offers a new 45-question set instead of “Resume at question
   31”, and **Recent activity** lists attempts (`Question 12`, `Hazard scene 3`,
   `Review · question 9`) with what was saved and a Feedback link back to the
   explanation. A review row whose attempt cannot be read reads “Explanation
   unavailable”.
2. **No scheduled review anywhere.** “Due today”, “Due tomorrow”, “Reviewed this
   week” and “Queue rebuilt from N attempts” are gone from Practice and Review.
   Practice shows **Ready for review** with the two reason counts in their own
   labelled slots; Review’s figures are Ready for review, Missed or misidentified,
   Flagged by you.
3. **“Corrected since you answered” removed as a review reason** — from the Review
   scope tabs, the Practice due list, the Component Library `ReviewQueue` specimen
   and the player’s review-context note. A correction never queues an item.
4. **No accuracy, weekly or per-area statistics.** “Where you stand” and the
   percentage bars are withdrawn; Practice states **Saved activity** — question
   practice, hazard scanning, tool reference — with what is saved for each. The
   three subject areas keep their single home in What practice covers.
5. **Review rows rebuilt to the supported interaction.** Reasons are the five
   authored sentences; “Read explanation” is primary and never completes anything;
   “Finish review” opens a confirmation group inside the card (heading focused)
   whose Confirm removes the item and whose “Keep in review” returns focus. Scopes
   All / Missed / Flagged overlap, and the status line counts the current scope.
   New states drawn: cleared queue, queue-could-not-be-built, finished-review-not-saved.
6. **Player controls limited to what exists.** “Skip for now” and “Mark reviewed”
   are gone from the question player; after an answer is saved the actions are Open
   study tools, Report a correction and Next question, with one line saying a review
   is finished on the review page.
7. **Offline removal is a counted preview.** The preview names the impact the
   product can compute — active sessions that need this exact copy, saved attempts
   that stay in history but may lose their content — and carries the confirm button
   beside “Keep it”. It no longer claims to list the exact dependent sessions and
   attempts, and “exam choice” is gone from the unaffected list.
8. **Settings counts are event records.** Export, rebuild and delete speak in
   records (23) and attempts (19) rather than sessions; the rebuild receipt reads
   “Read 19 attempts: 5 ready for review; 0 could not be checked. History unchanged.”
   and the delete preview adds “Offline downloads are not included.”
9. **The exam-chip exception is deleted** from `DESIGN-DECISIONS.md` (and from the
   project’s own rules). Identifiers live under `Technical details` with no
   exception, because no exam chip exists.
10. **Archived turns moved out of `current/`.** `Study Hub.dc.html` and
    `Landing.dc.html` now hold the settled design only; their earlier turns are in
    `explorations/`. Nothing in `current/` renders a withdrawn pattern, so a reader
    scrolling any current prototype cannot mistake one for a target.
11. **Preserved from handoff(3)**: the five copy corrections, the navigation
    structure, 45 as the lead set length, dated exam facts with “Not published”,
    the unavailable-saved-attempt treatment, and `Future Explorations.dc.html`.

## Layout change in this pass

Section headers no longer split into a heading on the left and a paragraph pushed
to the right edge. All 31 occurrences were restacked: nineteen paragraphs were
filler and are deleted, and the twelve that carry a fact or caveat the section body
does not are now one subheader sentence directly under the heading. Link rows that
rode along on the right joined the same stack. `.section-header` in
`styles-additions.css` is a grid, and the `SectionHeader` specimen states the rule.

## Intentional differences from the current implementation

- **Mobile navigation.** The designs keep the accepted four-tab bar with a Library
  sheet; the implementation captures show header navigation with a popover.
- **Section order on Practice.** The designs put What practice covers before the
  ways to practice on a first visit, and keep the ways card grid at four across;
  the implementation orders and spaces these differently.
- **Question position.** The player shows “Question 7 of 45 in this session”,
  derived from the session route the implementation already uses; the implementation
  currently renders “Practice question · Text version” in that slot instead.
- **Simulation submit copy.** The navigator’s confirmation reads “Submit this
  simulation?” with “Submit for results” / “Back to item 42”; the implementation
  says “Submit final answers?” with “Submit final answers” / “Continue editing”.
  Either is acceptable; the implementation’s wording is not wrong.
- **Figures on a first visit** carry site facts (90 questions, 18 scenes, 65 tool
  records, 3 areas) rather than zeros.

## Not exported, and not verified

- No screenshot for Practice read-failed, the hazard player, the print builder,
  the tool atlas record shell, or the Component Library specimens.
- Tool atlas: the 65-record inventory with 8 illustrated records and its
  “Not published” notice is unchanged in this pass and was not re-captured.
- Hazard player and print builder were not reconciled against the implementation
  in this pass.
- No browser, accessibility, contrast or cross-device verification was run on this
  export. The screenshots are element captures from the design prototypes at
  1248 / 928 / 800 / 608 / 384 px, not application captures, and are not a fidelity
  claim.
