# Fact-sheet source-heading pagination

Source `0040951`. The prior normal Letter fact sheet (`d172ddf05a04a934986742f84d5527cca6487306638f370d9ccc1595280685db`) strands “Where this fact comes from” at the bottom of pages 2, 8 and 11. The initial visual pass inspected pages 1–3 and observed the first occurrence; the strengthened PDF check detects all three. No all-page visual acceptance is claimed for that baseline.

The print `break-after: avoid` rule now covers h5 and h6 as well as h2–h4. This joins the existing 18pt large-heading rule and the source label/value pairing rule. Fact content, source receipts and screen styling are unchanged.

Reproduction from implementation root:

```sh
NYCUSTODIAN_PRINT_CAPTURE_OUTPUT=/mnt/models/dev/nycustodianexam/implementation/design-review/2026-09-07/print-fact-headings NYCUSTODIAN_PRINT_CAPTURE_PRODUCTS=announcement-profile-fact-sheet node design-review/2026-09-07/capture-print-final-products.mjs
python3 design-review/2026-09-07/audit-print-pdfs.py design-review/2026-09-07/print-fact-headings
```

The production build and artifact/bundle checks passed. All four regenerated PDF hashes match the capture manifest, which records source `00409514b36ad12d484736728ea4dd1290edda9f` and no capture errors.

| Format | Actual pages | Estimated pages |
| --- | ---: | ---: |
| Letter normal | 31 | 35 |
| Letter large, wide margins | 64 | 62 |
| A4 normal | 29 | 33 |
| A4 large, wide margins | 61 | 59 |

The text-layout audit passes on all 185 pages: no extracted words outside page bounds, no page-ending source labels or fact source headings, dominant body text 12pt normal / 18pt large, and minimum extracted large-print size 18pt. Page estimates remain approximate.

Visual inspection of the corrected normal Letter PDF covers pages 2, 3, 8, 9, 11 and 12 at a 1100-pixel page raster. The formerly stranded headings now begin pages 3, 9 and 12 with their following source entries. No clipping, overlap or split technical label/value pair was observed on these six pages. Longer source entries continue across page boundaries; keeping the heading with the opening source entry does not keep an entire receipt on one page.

The remaining pages and formats still require visual inspection. Automated bounds/font/orphan checks do not replace complete visual review or physical-printer testing.


Normal Letter visual review is now complete: all 31 pages of SHA `530945a742517425a8f6e34ec166d8f5c2b60e8c4474dc3f0a3bd8c1a064a032` were inspected at the same raster scale. No clipping, overlap, stranded source heading or split technical label/value pair was observed. Fact summaries and longer source entries can span pages. Page 31 contains only the final source record label/value pair; this sparse ending remains a pagination limitation. The other three formats still await full visual review, and no physical-printer certification is claimed. The exact page ledger is `print-fact-headings/visual-review-letter-normal.json`.


Normal A4 visual review is complete: all 29 pages of SHA `3baea707f64ae6b59285b9540dedd4d7d02ddb4e5e8712fc664408bc86a73686` were inspected at a 1100-pixel page raster after verifying the PDF hash. No clipping, overlap, stranded source headings or split technical source label/value pairs were observed. Long facts/receipts continue across pages; printed URLs wrap within margins, occasionally leaving a short final line. The final page retains both source entries with their full technical details. The ledger is `print-fact-headings/visual-review-a4-normal.json`. Both normal formats are now fully inspected (60 pages); the 64-page Letter large and 61-page A4 large formats remain to inspect.
