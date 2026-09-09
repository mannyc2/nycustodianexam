# Print source-pair and small-type correction

Source `c7627c7` (source-pair rule introduced in `8b5d48c`). This follows the prose baseline at `8934a27`.

Visual inspection of all 13 pages of the earlier large Letter explanation PDF found no clipping or overlap, but found stranded technical labels on pages 8 (Source record ID), 10 (Source line ID) and 12 (Locator). That exact baseline PDF has SHA-256 `8386fb039f0e070744b4f184991734be8f2075e04b80e65c319e9e2d458210c3`. Pages 3 and 4 had been inspected in the previous prose pass; the remaining pages were inspected in this pass. This is a failing baseline for label/value cohesion, not a passing final visual claim.

The print stylesheet now keeps each source `dl > div` together. The interface-only “Saved print preview” eyebrow is excluded from print, and fifth/sixth-level headings retain at least the 18pt body size in large mode. Screen layout is unchanged.

The strengthened PDF audit fails on the retained earlier Letter PDF with three orphaned labels, then passes all eight regenerated PDFs. It checks extracted word bounds, page-ending receipt labels, dominant body size and the smallest extracted font size in large mode. These checks do not detect every possible overlapping element or certify physical printers.

| Product | Paper | Mode | PDF pages |
| --- | --- | --- | ---: |
| explanations-and-sources | us-letter | Normal / standard | 8 |
| explanations-and-sources | us-letter | Large / wide | 13 |
| explanations-and-sources | a4 | Normal / standard | 7 |
| explanations-and-sources | a4 | Large / wide | 13 |
| announcement-profile-fact-sheet | us-letter | Normal / standard | 31 |
| announcement-profile-fact-sheet | us-letter | Large / wide | 63 |
| announcement-profile-fact-sheet | a4 | Normal / standard | 29 |
| announcement-profile-fact-sheet | a4 | Large / wide | 61 |

Across all 225 pages: zero out-of-page extracted words, zero page-ending receipt labels, and no extracted large-print text below 18pt. The normal PDFs retain 12pt dominant body text. Page estimates remain approximate; this pass does not recalibrate them.

Final large Letter explanation pages 1, 8, 9, 10, 11, 12 and 13 were visually inspected. The opening metadata has no preview-only eyebrow; each formerly stranded label now accompanies its value, with no observed overlap or clipping. The subsequent completion pass inspected pages 2–7, completing all 13 pages of this exact large Letter explanation PDF; `print-receipt-pairs/visual-review.json` records its SHA-256 and per-page observations. No remaining clipping, overlap or split receipt pairs were observed in that PDF. Other formats and the long fact-sheet outputs still require their remaining visual acceptance pass. Earlier screenshots and PDF counts are not silently relabeled as current.

Reproduction:

```sh
NYCUSTODIAN_PRINT_CAPTURE_OUTPUT=/mnt/models/dev/nycustodianexam/implementation/design-review/2026-09-07/print-receipt-pairs NYCUSTODIAN_PRINT_CAPTURE_PRODUCTS=explanations-and-sources,announcement-profile-fact-sheet node design-review/2026-09-07/capture-print-final-products.mjs
python3 design-review/2026-09-07/audit-print-pdfs.py design-review/2026-09-07/print-receipt-pairs
```

The production build and artifact/bundle invariants passed. No application behavior or content bytes were changed; this is print CSS plus PDF audit tooling. The new PDFs, exact hashes, source commit and audit output are retained in `print-receipt-pairs/`; raster inspection pages are regenerable temporary files.

The corrected normal A4 explanation PDF has also been visually inspected on all seven pages. `print-receipt-pairs/visual-review-a4-normal.json` records the exact PDF hash and page observations. No clipping, overlap or split technical label/value pairs were observed. This closes only that specific PDF visual pass.

All eight corrected normal Letter explanation pages are now visually inspected, with no observed clipping, overlap or split technical source pairs. See `print-receipt-pairs/visual-review-letter-normal.json` for the exact hash and page observations. Source entries may continue across pages; this review does not claim each entire source is kept on one page.

All 13 corrected large A4 explanation pages are now visually inspected; see `print-receipt-pairs/visual-review-a4-large.json`. With the other three exact-file ledgers, this completes visual inspection of the four corrected explanation PDFs (41 pages). No clipping, overlap or split technical source pairs were observed. This does not close fact-sheet, other-product, physical-printer or broader handoff acceptance.
