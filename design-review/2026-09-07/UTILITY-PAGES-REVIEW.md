# Utility page reconciliation

`capture-utility-pages.mjs` records first-visit Exams, Settings, and Offline at 1248/384 CSS pixels. These are current production-build captures with empty local storage, not the prototype's returning fixture counts. All six captures finish without page errors or document horizontal overflow. Settings and Offline compact captures were inspected against their current references.

The Settings mobile task cards had put actions beside the descriptions, squeezing labels into narrow columns. They now use the accepted stacked layout with full-width actions. Export uses the primary button treatment. Existing preference autosave, export/import, rebuild and delete actions remain intact.

Production build/artifact invariants and all three utility recovery tests pass: preference-record recovery, failed reload after import, and stale removal-preview invalidation.

Remaining: returning Settings summary and Offline placement; export/delete dialog visual comparison; installed/removal/unavailable Offline captures; open Exams record comparison; report layout; final cross-browser checks. This is an initial utility-family pass, not full reconciliation.
