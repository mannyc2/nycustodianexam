# Hazard player reconciliation

Compared the accepted Hazard Player prototype and marking capture 35 with the real released hallway scene. The scene and response columns now use the reference’s content-driven 20rem minimum instead of a 1024px viewport breakpoint. The position and mode use plain text; the instruction is ordinary supporting text. The save panel now has its visible heading and border, matching the reference.

`capture-hazard-player.mjs` records empty, marked, and saved states at 1053, 850, and 384 CSS pixels. All nine captures complete without page errors or document horizontal overflow. Tablet and compact marked captures were visually inspected. The real scene, position label, and single centered marker differ from the prototype’s stairwell fixture and two markers. Live-region announcements remain screen-reader-only; the prototype’s visible debug live-region specimen is not product UI.

Production build and artifact invariants passed. Nine Hazard browser tests passed, covering image failure, pan/reset, durable markers, BFCache, neutral zero confirmation, storage failure, keyboard zones, and mismatched feedback. These checks preserve behavior and do not prove complete visual fidelity.

Remaining: compare revealed feedback against capture 36, keyboard zones against 37, and capture compact recovery states. Final matching-width visual audit remains required.

## Keyboard and recovery pass

Keyboard zones now share the responsive scene/response workspace, use compact divided rows inside one fieldset, and retain visible native checkbox marks. The neutral ordering/count guidance follows the prototype. Saved outcomes use a plain heading instead of the extra blue panel. Six real keyboard captures cover empty, selected, and saved states at 1053/384 CSS pixels. Desktop and compact selected captures were inspected.

Three additional 384px captures exercise actual image-request failure, neutral zero confirmation, and feedback-request failure after durable save. All complete without page errors or horizontal overflow; the saved-but-unavailable feedback capture retains a clear Retry feedback action. Scripts intercept only the relevant network request; product code has no failure toggle.

Build/artifact invariants and all nine Hazard browser regressions pass. The detailed revealed explanation/overlay composition still needs reconciliation; these captures do not close that requirement.
