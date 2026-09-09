# Utility page reconciliation

`capture-utility-pages.mjs` records first-visit Exams, Settings, and Offline at 1248/384 CSS pixels. These are current production-build captures with empty local storage, not the prototype's returning fixture counts. All six captures finish without page errors or document horizontal overflow. Settings and Offline compact captures were inspected against their current references.

The Settings mobile task cards had put actions beside the descriptions, squeezing labels into narrow columns. They now use the accepted stacked layout with full-width actions. Export uses the primary button treatment. Existing preference autosave, export/import, rebuild and delete actions remain intact.

Production build/artifact invariants and all three utility recovery tests pass: preference-record recovery, failed reload after import, and stale removal-preview invalidation.

Remaining: returning Settings summary and Offline placement; export/delete dialog visual comparison; installed/removal/unavailable Offline captures; open Exams record comparison; report layout; final cross-browser checks. This is an initial utility-family pass, not full reconciliation.

## Settings action grouping

Offline management now sits with Export, Import, Rebuild and Delete in the saved-work group, as the accepted reference shows. Its action is a native link, represented separately from command buttons in the task-card type. Desktop uses five columns; existing intermediate/compact breakpoints retain readable stacking. The obsolete standalone block above reading preferences is replaced by a no-JavaScript link to `/offline/`. No download size or stored-copy count is invented.

Build/artifact checks and five workspace typechecks pass. Eighteen design/recovery checks passed in the combined run; the no-JavaScript check then passed separately after correcting an accidental test-label edit (the final test is unchanged). Desktop/mobile captures are refreshed. Returning saved-data summaries are still outstanding.
