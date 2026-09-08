# September 8 export: usable handoff; focused details remain

`NYC Custodian Component Design(1).zip` contains 217 files and 39 design PNG
screenshots. Its index identifies the correct comparison revision,
`33fcdf7d4e014f1c8e6e26841223bd6b3d458e30`. The five areas requested after
handoff(4) have substantial changes in the actual prototypes and captures.
The completed designs are usable for implementation; another broad redesign is
not needed before work starts on those screens.

All imported file contents are preserved exactly. This export uses the project
as its archive root, so files are mapped under `reference/project/` to preserve
existing review links. The manifest records that mapping and every checksum.
Application source and the 34 implementation captures remain unchanged.

## Changes substantiated by this export

- **Builder:** removes the missed-question weighting control and invented
  illustrated/written split. It shows actual inventory, unavailable lengths,
  an all-matching option, simulation duration/timer/auto-submit controls, and
  visual versus written-zone hazard tasks. The ineffective hazard setting
  picker is gone. Four setup captures cover practice, hazard, timed simulation,
  and insufficient inventory.
- **Atlas:** contains all 65 records and illustrations across nine families,
  including 12 marked reference-only. The compact specimen uses a labelled
  Family select and thumbnail rows. All 68 assets in the current export
  (65 tools and three scenes) match the existing repository assets byte for byte.
- **Hazard Player:** now draws zoom/pan/reset, adding and moving individual
  markers, saving, zero-selection confirmation, saved feedback, and written-zone
  tasks. Its state controls include storage, content, image, save, and feedback
  failures. Three new captures show marking, revealed feedback, and written zones.
- **Print:** replaces the old product checkboxes with the ten actual product
  choices and availability reasons. The specimen includes bounded counts,
  separate paper/margin controls, output flags, saved-preview facts, an
  inspection gate, and a stale-job notice.
- **Component examples:** HomeDashboard now starts practice; HistoryList
  describes saved records and Feedback links. SessionSummary explicitly retains
  genuine simulation sessions. Atlas specimens describe image loading failure
  instead of claiming that released illustrations do not exist.
- **Export index:** points to current Home 01/02 captures and adds the Practice
  read-failed capture. Completed Practice, Review, navigation, and stacked section
  headings are preserved.

## Remaining details, without reopening completed screens

1. **Synchronize the exported decisions document.**
   `exports/current/DESIGN-DECISIONS.md` is unchanged from handoff(4) and still
   claims that the entire product has no session object and that accuracy exists
   nowhere. Those global statements conflict with the corrected Component
   Library and genuine simulation behavior. Scope them to Practice's saved-record
   dashboard. Imported notes do not override the confirmed decision: remove
   global active-exam selection while retaining existing simulation sessions.
2. **Finish Builder length copy and the area-change transition.** The 34-question
   state offers “All 34 questions” while saying “Forty-five is the shortest set we
   offer.” Call 45/60/90 preset lengths and explain the all-matching option.
   The prototype also resets the selected length whenever an area changes and
   automatically chooses a shorter valid length when needed. Its preview shows
   the new length, but the prose promises no quiet shortening. Keep a still-valid
   chosen length; if it becomes unavailable, make the replacement choice explicit
   or clearly announce the change before Start. This is a focused interaction
   detail, not a request to restore the removed controls.
3. **Treat state and responsive coverage honestly.** The index explicitly lacks
   Atlas images-unavailable/record-shell captures and several Hazard Player
   confirmation/failure captures. Setup, players, simulation, and print also lack
   equivalent compact captures. Their completed wider layouts can proceed;
   missing states and compact behavior still need visual comparison as those
   screens are implemented.
4. **Use the screenshots with their documented limits.** Native checkbox and
   radio marks are absent from the element captures; selected state must come
   from the editable prototype. Print capture 38 combines configuring, generating,
   failure, saved preview, and stale specimens; it is not one simultaneous product
   state or a paginated print proof. The 03/04 Library-open images were renamed
   but their bytes are unchanged from handoff(4), so use them for navigation and
   use 01/02 for the current Home body. Separate or clearly label such specimens
   when completing the remaining captures.

These are bounded follow-ups. Preserve the received design bytes and track the
corrections here rather than silently rewriting the designer's export.

## Design references for the changed areas

These images are design references. The separate `current-screenshots/` directory
shows the older application implementation and is not an approved visual target.

| Design | Prototype | Captured states |
| --- | --- | --- |
| Builder | [Session Builder](reference/project/exports/current/Session%20Builder.dc.html) | [Practice](reference/project/exports/screenshots/22-session-builder--practice-set--1053w.png), [hazard](reference/project/exports/screenshots/29-session-builder--hazard-drill--1053w.png), [timed](reference/project/exports/screenshots/30-session-builder--simulation-timed--1053w.png), [34 available](reference/project/exports/screenshots/31-session-builder--length-unavailable--1053w.png) |
| Atlas | [Tool Atlas](reference/project/exports/current/Tool%20Atlas.dc.html) | [All families](reference/project/exports/screenshots/32-atlas--all-families--990w.png), [one family](reference/project/exports/screenshots/33-atlas--rigid-hand-tools--990w.png), [compact](reference/project/exports/screenshots/34-atlas--compact-family-select--384w.png) |
| Hazard Player | [Hazard Player](reference/project/exports/current/Hazard%20Player.dc.html) | [Marking](reference/project/exports/screenshots/35-hazard-player--marking--990w.png), [feedback](reference/project/exports/screenshots/36-hazard-player--revealed--990w.png), [written zones](reference/project/exports/screenshots/37-hazard-player--keyboard-zones--990w.png) |
| Print | [Component Library, print section](reference/project/exports/current/Component%20Library.dc.html#d-print) | [Builder and preview specimens](reference/project/exports/screenshots/38-print--builder-and-preview--699w.png) |
| Practice recovery | [Study Hub](reference/project/exports/current/Study%20Hub.dc.html) | [Read failed](reference/project/exports/screenshots/39-practice--read-failed--1248w.png) |
| Home | [Home](reference/project/exports/current/Home.dc.html) | [Desktop](reference/project/exports/screenshots/01-home--first-visit--1248w.png), [compact](reference/project/exports/screenshots/02-home--first-visit--384w.png) |

## Verification and next implementation step

Checked the changed source files, selected design screenshots, all 217 imported
file checksums, all 68 current artwork assets against the repository, and local
review links. No application source changed in this update, so application tests
were not rerun. Earlier build/type/browser results in README apply to the
unchanged implementation snapshot. No interactive browser, accessibility,
cross-device, or visual-diff certification is claimed for the imported prototypes.

Implement the shared shell and completed Home/Practice/Review screens first, then
the remaining page families. For each screen, compare the same state at the same
CSS width and content bounds, preserving the accepted layout and responsive
navigation. Use the editable prototype for controls and interaction details that
the element captures omit. Application changes, tests, Git work, and those visual
checks belong to the coding agent; design follow-ups remain layouts, copy, states,
and exports.
