# Handoff(3): received progress and remaining comparison

The new archive is a real update: 85 files, 22 design screenshots, a page/state
index, and the five requested copy corrections. Its exact bytes are imported
under `reference/`, with checksums in `reference-manifest.json`. No application
source or implementation screenshot changed in this update.

## What improved

- Settings' export/deletion examples no longer include a saved exam choice.
- The Component Library's first-visit dashboard starts practice directly.
- Offline identifies downloaded practice material instead of “your exam.”
- Practice and Session Builder describe 45 questions as the site's offering.
- Home names the entry-level series and no longer claims all New York announcements
  or the next cycle are covered. Unsupported watch actions were also removed.
- The export now names each screenshot's page, state, and dimensions, and states
  which screens and checks are still missing.

These are useful reference improvements. The screenshots at 1248 and 384 pixels
wide can guide implementation at those dimensions. Because they are artboard
element captures, they are not interchangeable with the current application's
1280/390 viewport captures without matching the frame and fixture first.

## The reconciliation input is still wrong

The designer's [INDEX.md](reference/project/exports/INDEX.md) says the work was
prepared against `716d4250` (lines 3–4). Its final paragraph says the current
implementation screenshots and reference folder were not in the revision read.

The actual shared review snapshot is commit
`3821eb19b5570e2997ee20c5f6f2c685a0947a93`, on branch
`design/reconciliation-2026-09-07`. Its screenshots are at:

`design-review/2026-09-07/current-screenshots/`

The path is nested; it is not `current-screenshots/` at the repository root.
This branch's [README](README.md) links directly to each image. Use those
implementation captures and this branch's application source for the next pass.
Do not use `main` or the old `plans/design-handoff-update-request.md` as the sole
reconciliation input.

## Next design pass

Keep the accepted appearance, including the mobile bottom tabs and Library sheet.
Compare the actual implementation's supported activities with the current designs
and deliberately adjust the affected drawings. Do not reproduce the implementation's
accidental spacing, layout, or navigation departures.

The current drawings still contain states excluded from the requested supported
screen set. Examples visible in the new screenshots include:

- **Practice:** scheduled “Due today” reviews; “Corrected since you answered” as a
  review reason; weekly and per-area statistics; session-level resume/history
  fixtures unlike the current saved-attempt history.
- **Review Queue:** due-today/tomorrow counts and the earlier interaction model.
  Show Ready for review, overlapping All/Missed/Flagged filters, Read explanation,
  and a separate Finish review confirmation.
- **Other screens:** Atlas's eight-image fixture versus the released 65 tools,
  prototype-only player controls, offline dependency previews, and Settings counts
  still need the comparison the export explicitly lists as not performed.

The exported INDEX and DESIGN-DECISIONS still repeat an exception allowing an exam
chip in the header. Remove that obsolete exception from the design notes. There is
no saved active exam.

The player and Simulation Navigator designs have no new screenshot coverage in
this pass. Add those when those screens are reconciled. Existing screenshots and
the completed copy corrections do not need to be redone merely to change the ZIP
format.

Return updated designs and corresponding screenshots in a ZIP. Git operations,
application changes, and automated tests remain the coding agent's work.
