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
