# Print table estimate verification

Source `51eb50d`. The estimates now include opening metadata, repeated table headings, cell padding, and conservative two-line large-print answer-sheet labels. Appended answer keys use the same table calculation without repeating packet metadata. Browser pagination remains authoritative; estimates are not printer-independent guarantees.

Validation: 41 print unit tests, site and browser TypeScript checks, build and artifact invariants passed. The capture below generated eight actual Chromium PDFs from the rebuilt application; every estimated count matched its observed PDF count. Selection and pairing remain unchanged. Tests include a 45-row bank and verify matching question order and pairing across print settings.

| Product | Paper | Size / margin | Estimated and observed pages |
| --- | --- | --- | ---: |
| blank-answer-sheet | us-letter | Normal / standard | 3 |
| blank-answer-sheet | us-letter | Large / wide | 7 |
| blank-answer-sheet | a4 | Normal / standard | 3 |
| blank-answer-sheet | a4 | Large / wide | 6 |
| answer-key | us-letter | Normal / standard | 2 |
| answer-key | us-letter | Large / wide | 2 |
| answer-key | a4 | Normal / standard | 2 |
| answer-key | a4 | Large / wide | 2 |

Reproduction from implementation root:

```sh
NYCUSTODIAN_PRINT_CAPTURE_OUTPUT=/mnt/models/dev/nycustodianexam/implementation/design-review/2026-09-07/print-table-estimates NYCUSTODIAN_PRINT_CAPTURE_PRODUCTS=blank-answer-sheet,answer-key node design-review/2026-09-07/capture-print-final-products.mjs
```

The manifest retains exact PDF hashes, source commit, searchable-text checks, and paper dimensions. This verifies counts for the captured 45-question sheets and ten-answer keys, not every possible count, font environment, printer, or appended packet. It is not an all-page visual acceptance claim.

Explanations and announcement fact sheets remain unresolved as documented in `PRINT-FINAL-PRODUCTS-BASELINE.md`. Their complete assembled rationale/fact/source content must inform estimates; do not reuse these table metrics for prose.


## Current table capture

Source `3a77b749c881f5e1b8527864ada2ea415485b841` was rebuilt through the integrated verification command before capturing eight PDFs into `print-tables-current/`. All eight hashes match the new manifest, capture errors are empty, and all 27 pages retain the table counts in the matrix above. The text-layout audit reports no extracted words outside page bounds or orphaned receipt labels; dominant text is 12pt normal and 18pt large. Full visual inspection of these new PDFs remains pending. The older `51eb50d` answer-key PDFs were inspected on all eight pages: rows and repeated headings were intact, but their small “Saved print preview” label predates the current print CSS. That historical inspection is not acceptance of the new capture.

The new capture uses the current print providers and CSS, including hiding that screen-only label. It supersedes the older table PDFs as the next visual-review target. Exact evidence is in `print-tables-current/manifest.json` and `text-layout-audit.json`; capture log: `/tmp/nyc-current-tables-capture.log`.
