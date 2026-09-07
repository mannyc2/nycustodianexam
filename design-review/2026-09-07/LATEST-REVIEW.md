# Handoff(4): core reconciliation completed; focused gaps remain

The new archive contains 95 files, including 30 PNG screenshot files. The export
index now identifies the correct review revision,
`1147c7a13eaf6edc2ae0c8d4e8bfae31afc7416c`, and says the design brief, latest review,
application source, and implementation captures were read. The earlier revision
mismatch is resolved.

All imported bytes are preserved under `reference/` and recorded in
`reference-manifest.json`. This update changes design references and review notes
only. Application source and the 34 implementation captures remain unchanged.

## What is now usable

The current Practice and Review screenshots substantiate the main corrections:

- Practice has first-visit and returning variants based on saved answers, scene
  responses, and finished reviews. The old session-resume headline, scheduled
  review, weekly totals, and per-area accuracy displays are removed from that page.
- Review shows ready items and overlapping All/Missed/Flagged filters. Read
  explanation is primary; Finish review opens an explicit confirmation. Cleared,
  read-failed, and failed-finish states have separate screenshots.
- The mobile bottom tabs and Library sheet remain the intended navigation.
- Section headings now stack their supporting text beneath the heading. This is
  a deliberate visual revision described in the export, not an implementation
  fallback.
- Question Player removes Skip for now and Mark reviewed; new question-player and
  Simulation Navigator screenshots were added.
- Settings/Offline drawings move toward actual record counts and counted removal
  previews, and the obsolete header exam-chip exception is removed from the notes.
- Historical Practice and Exams variants were moved out of their current files.

Use these improvements for the corresponding implementation work. They do not
need another wholesale redesign while the following details are finished.

## Remaining focused design work

1. **Session Builder is unchanged from handoff(3).** It still offers simulation
   weighting toward missed questions, fabricates an illustrated/written split in
   its preview, and shrinks a requested practice set when its fixture inventory is
   short. Reconcile the visible controls, preview, and unavailable state with the
   supported setup behavior. Do not reintroduce global exam selection.
2. **Atlas is unchanged.** The reference still says only 8 of 65 tools have
   illustrations. The implementation's released inventory has all 65. Complete
   the full-inventory drawing and compact nine-family filtering treatment.
3. **Hazard Player and print are explicitly unfinished.** The export says they
   were not reconciled in this pass; Hazard Player's file is unchanged. Finish
   those comparisons and add their state screenshots.
4. **Some current component examples still lag behind the page designs.** The
   Component Library HomeDashboard still renders Resume actions, and the
   HistoryList notes still describe session Resume/Results links. Bring the
   Practice dashboard/activity examples into line with the new page. Keep genuine
   simulation session behavior separate: the design note claiming the entire
   product has no session object is too broad.
5. **Screenshot selection needs a small correction.** The index still lists the
   previous `01-home--first-visit--1248x2844.png` and
   `02-home--first-visit--384x2097.png`. New captures also exist as
   `01-home--first-visit--1248w.png` and `02-home--first-visit--384w.png`; use the
   latter for current Home. The older 03/04 Library-open captures remain useful
   for the navigation state, but do not establish that the entire current Home
   body matches. Remove or clearly label the superseded Home screenshots in the
   next design export.

Practice's read-failed state is still not captured. Add that screenshot when
finishing state coverage; it does not require redesigning the ready states.

## Current design screenshots to start from

All links below point into the latest received export. These are design targets,
unlike the separate `current-screenshots/` implementation evidence.

| Design | Desktop or standalone | Mobile or other state |
| --- | --- | --- |
| Home | [Current Home](reference/project/exports/screenshots/01-home--first-visit--1248w.png) | [Current Home](reference/project/exports/screenshots/02-home--first-visit--384w.png) |
| Practice, first visit | [Desktop](reference/project/exports/screenshots/05-practice--first-visit--1248w.png) | [Mobile](reference/project/exports/screenshots/06-practice--first-visit--384w.png) |
| Practice, returning | [Desktop](reference/project/exports/screenshots/07-practice--returning--1248w.png) | [Mobile](reference/project/exports/screenshots/08-practice--returning--384w.png) |
| Review, ready/confirmation | [Desktop](reference/project/exports/screenshots/20-review--ready-with-confirmation--1248w.png) | [Mobile](reference/project/exports/screenshots/21-review--ready--384w.png) |
| Question Player | [Unanswered](reference/project/exports/screenshots/26-question-player--unanswered--800w.png) | [Answered](reference/project/exports/screenshots/27-question-player--answered--800w.png) |
| Simulation Navigator | [45 items and confirmation](reference/project/exports/screenshots/28-simulation-navigator--45-items--928w.png) | Not captured |

## Verification limits

The changed sources and selected screenshots were inspected; source-archive
checksums and local review links were checked. These are artboard element
captures at their stated widths, not application viewport captures. No browser
interaction, accessibility, or screenshot-diff certification is claimed for the
new designs. Application validation reported in README belongs to the unchanged
implementation snapshot and was not rerun for this reference-only update.

The design agent can return the remaining drawings in another ZIP. Application
changes, Git operations, and implementation tests remain the coding agent's work.
