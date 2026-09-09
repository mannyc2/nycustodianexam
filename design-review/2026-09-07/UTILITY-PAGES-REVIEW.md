# Utility page reconciliation

`capture-utility-pages.mjs` records first-visit Exams, Settings, and Offline at 1248/384 CSS pixels. These are current production-build captures with empty local storage, not the prototype's returning fixture counts. All six captures finish without page errors or document horizontal overflow. Settings and Offline compact captures were inspected against their current references.

The Settings mobile task cards had put actions beside the descriptions, squeezing labels into narrow columns. They now use the accepted stacked layout with full-width actions. Export uses the primary button treatment. Existing preference autosave, export/import, rebuild and delete actions remain intact.

Production build/artifact invariants and all three utility recovery tests pass: preference-record recovery, failed reload after import, and stale removal-preview invalidation.

Remaining: returning Settings summary and Offline placement; export/delete dialog visual comparison; installed/removal/unavailable Offline captures; open Exams record comparison; report layout; final cross-browser checks. This is an initial utility-family pass, not full reconciliation.

## Settings action grouping

Offline management now sits with Export, Import, Rebuild and Delete in the saved-work group, as the accepted reference shows. Its action is a native link, represented separately from command buttons in the task-card type. Desktop uses five columns; existing intermediate/compact breakpoints retain readable stacking. The obsolete standalone block above reading preferences is replaced by a no-JavaScript link to `/offline/`. No download size or stored-copy count is invented.

Build/artifact checks and five workspace typechecks pass. Eighteen design/recovery checks passed in the combined run; the no-JavaScript check then passed separately after correcting an accidental test-label edit (the final test is unchanged). Desktop/mobile captures are refreshed. Returning saved-data summaries are still outstanding.

## Delete preview cancellation

The deletion workflow now has the reference’s explicit Cancel action. It clears the preview and confirmation, closes the section, and returns keyboard focus to the originating button. It never invokes reset persistence. The enclosing disabled fieldset prevents cancellation during an active operation.

A new browser regression saves a preference, previews and confirms its deletion, cancels, reopens and confirms that a fresh preview requires fresh confirmation, then reloads to prove the preference survived. All four utility recovery tests, the production build and five workspace typechecks pass. `capture-settings-delete.mjs` records a real one-preference preview at 608/384 CSS pixels. The compact capture was visually inspected and the Cancel action remains visible.

This does not close returning-summary or export-preview requirements. The deletion section remains in flow rather than a modal, preserving the existing application’s focus/recovery structure.

## Export contents disclosure

The Export card now has a native expandable “What the file includes” note before its download button. Its categories follow the actual transfer payload: answers, finished reviews, preferences, simulations and print jobs. Downloads and import quarantine are excluded, and the review projection is rebuilt. The existing optional-drafts checkbox remains explicit. No upload, extra approval step, or new persistence is introduced.

The production build passes the unchanged closure budgets after keeping the note concise. `capture-settings-export.mjs` records the open disclosure at 608/384 CSS pixels. This provides contents guidance, not a live count preview; returning-record summaries remain outstanding.

## Real Offline states and removal treatment

`capture-offline-states.mjs` downloads, verifies and explicitly activates the actual released study pack in fresh browser contexts, then records active and removal-preview states at 1248/384 CSS pixels. No deletion is performed for the captures. The real pack is 106.0 MiB; the empty contexts have zero active session pins and historical attempts. These intentionally differ from the prototype's size/count fixtures. All four captures complete without page errors or document horizontal overflow.

Removal preview now uses the reference’s neutral surface, restrained heading, and red outlined removal button. Keep it, export, exact dependency impact and preserved-history copy remain visible. The compact removal capture was visually inspected. Build/artifact checks and the 23 local-data/pack/utility recovery browser checks pass, covering activation, real offline use, malformed metadata, imports, active-pack removal, pinned copies and stale previews.

Remaining Offline work includes storage-unavailable visual evidence and final comparison of the installed-state summary. The generic hero remains unchanged; this pass is not complete installed-state fidelity.

## Storage-unavailable recovery

Blocking IndexedDB open produces “Saved downloads could not be checked,” not the empty-copy state. The page hides download actions and retains Check again. It now also links directly to readable tool references and explains that saving practice responses requires working browser storage. This corrects the prototype’s overbroad claim that practice works whenever connected; durable commit-before-feedback remains required.

`capture-offline-unavailable.mjs` captures this state at 608/384 CSS pixels without page errors or horizontal overflow. The compact capture was visually inspected. A new browser regression verifies the nonempty-state wording, absence of download actions, and working Atlas navigation while storage is blocked. All five utility recovery tests and the production build/artifact checks pass. The error heading at page level remains focused by the existing recovery logic.

## Saved-work and installed-copy summaries

Settings now shows current counts for question answers, scene responses, finished
reviews, simulations and print jobs above the saved-work actions. It reuses the
existing read-only multi-store count transaction; it does not load answer payloads
or create a delete confirmation. Draft question/hazard sessions and simulation
submission records are not counted a second time as separate learner activities.
Preferences, correction drafts, import quarantine and downloaded files are outside
this activity summary. Export's existing contents disclosure still explains its
broader scope. No prototype record count or “saved since” date is invented.

The summary loads independently of preferences, refreshes after data actions and
on window focus/history restoration, and discards obsolete read results. A failed
read says counts are unavailable instead of replacing history with zeros. These
reads do not change saved records or affect the commit-before-feedback boundary.

Offline's prominent header now reflects the reconciled active copy and displays
its version, actual question/scene/tool inventory, downloaded file bytes across
saved copies, and estimated remaining browser quota when available. A staged copy
is not described as turned on. Failed storage reads omit count/availability claims.
Downloaded bytes are labelled as files, not total browser disk consumption; quota
is labelled as an estimate. The existing generated header remains available with
JavaScript disabled. The React island owns the dynamic header through a portal
into that same section, keeping the shared page layout intact.

`capture-utility-summaries.mjs` records ten captures at 1248/384 CSS widths: empty
and returning Settings, and empty/staged/active Offline. It creates a real saved
answer and installs/activates a real verified pack. The separate
`capture-utility-summary-unavailable.mjs` records four blocked-storage captures.
Both manifests have no page errors. Desktop header facts form four columns; mobile
facts stack and the Settings summary wraps without document overflow. Real pack
size, browser quota and full released pack name differ from the prototype fixtures.

Validation: root build/artifact checks pass (526 routes, 220 item-scoped artifacts,
291 delivery assets), as do all five workspace typechecks and browser typechecking.
All 21 utility recovery checks pass across Chromium, Firefox and WebKit, including
two new summary tests for a real answer followed by scoped deletion, and a failed
count read with preferences still available. The broader local-data/pack/rebuild
run passed 44 checks and retained 12 existing browser exclusions; four Chromium
checks initially stopped on ambiguous pack-name text selectors after names appeared
in the header too. Those selectors now explicitly target the pack-list heading.
All four subsequently pass, including actual staged-pack verification and offline
study. The final targeted run also passed all six summary checks (10 passes total,
eight existing browser exclusions); no new skips were introduced.

Settings' final measured JavaScript closure is 485973 bytes raw, 146199 gzip,
122766 brotli, compared with 484994/145997/122667 before this work. The read-only
summary and its refresh/unknown states need a small Settings-only allowance of
486500/146500/123500. Other families retain the existing 485000/146000/123000 limits;
Offline remains well below them. This is a bounded feature allowance, not removal
of the artifact budget gate.
