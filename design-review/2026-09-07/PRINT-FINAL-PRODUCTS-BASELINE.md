# Remaining print-product baseline — unresolved pagination estimates

This is a failing baseline, not final print acceptance. Capture source: `378a1d218e9ff5ca5e217bf106cab268ea0b6802` using the built local preview at `http://127.0.0.1:4187`. No deployment or external submission occurred.

The capture script downloads and verifies the real offline pack, generates each product through its builder, waits for fonts and images, and exports Chromium PDFs with the selected CSS page size. The seed is `final-print-products-v5`. Normal uses standard margins; large uses wide margins. Every PDF has searchable title text; the manifest records its SHA-256 and observed page size.

| Product | Paper | Size / margin | Items | Estimate | PDF pages |
| --- | --- | --- | ---: | ---: | ---: |
| blank-answer-sheet | us-letter | Normal / standard | 45 | 2 | 3 |
| blank-answer-sheet | us-letter | Large / wide | 45 | 4 | 7 |
| blank-answer-sheet | a4 | Normal / standard | 45 | 2 | 3 |
| blank-answer-sheet | a4 | Large / wide | 45 | 4 | 6 |
| answer-key | us-letter | Normal / standard | 10 | 1 | 2 |
| answer-key | us-letter | Large / wide | 10 | 1 | 2 |
| answer-key | a4 | Normal / standard | 10 | 1 | 2 |
| answer-key | a4 | Large / wide | 10 | 1 | 2 |
| explanations-and-sources | us-letter | Normal / standard | 2 | 1 | 8 |
| explanations-and-sources | us-letter | Large / wide | 2 | 1 | 9 |
| explanations-and-sources | a4 | Normal / standard | 2 | 1 | 7 |
| explanations-and-sources | a4 | Large / wide | 2 | 1 | 9 |
| announcement-profile-fact-sheet | us-letter | Normal / standard | 1 | 1 | 30 |
| announcement-profile-fact-sheet | us-letter | Large / wide | 1 | 1 | 63 |
| announcement-profile-fact-sheet | a4 | Normal / standard | 1 | 1 | 29 |
| announcement-profile-fact-sheet | a4 | Large / wide | 1 | 1 | 60 |

## Findings and required follow-up

- All four product families still use count-only estimates. In particular, one fact-sheet item contains many facts, repeated source receipts, and change history; one item does not mean one page.
- Blank answer-sheet estimates omit opening metadata, repeated table headings, and row wrapping. In the large Letter PDF, single-digit question labels fit on one line while double-digit labels wrap; A4 wraps more labels. A fixed rows-per-page adjustment alone would not model that behavior.
- Explanations include every rationale, supported claims, source excerpts, URLs, and technical receipts. Their assembled content must inform estimates, including explanations appended to question packets.
- Correct estimates using assembled content and selected paper, type size, and margins, then regenerate this matrix. Browser pagination remains the final authority; do not imply a precise printer-independent page count.
- Inspect page composition, source legibility, table continuation, overlap, and clipping before final acceptance. No all-page visual acceptance is claimed here.

`pdftotext -bbox-layout` found **0 extracted words outside page bounds across 242 pages**, recorded in `print-final-products/text-bounds-audit.json`. This does not detect overlapping elements, all kinds of clipping, or poor page breaks.

PDFs and their checksummed manifest are retained in `print-final-products/`. The 242 raster review pages were moved to `/tmp/nycustodian-print-final-products-pages/` because the workspace had only 7 MB free. The capture script now writes regenerable raster pages there directly. Those temporary images are not durable evidence; regenerate them from the retained PDFs with `pdftoppm -scale-to 1100 -png` when needed.
