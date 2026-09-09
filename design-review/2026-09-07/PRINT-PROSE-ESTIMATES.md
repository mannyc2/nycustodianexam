# Prose print estimates and text-size correction

Source `8934a27` (estimator introduced in `a08b23d`). Explanation estimates now count every rationale, claim, source excerpt and printed receipt. Fact-sheet estimates traverse actual facts, conflicts, repeated citations and change history. Appended explanations use the same content calculation without repeating packet metadata. Question selection and pairing are unchanged.

The PDF audit found that the previous large-print explanation packet was being shrunk by Chromium to roughly 14pt body text. Print-only `overflow-wrap: anywhere` prevents long receipt/prose tokens from widening the layout and triggering shrink-to-fit. The corrected large Letter and A4 explanation PDFs use 18pt body text and occupy 13 pages, rather than the previous shrunken nine pages.

| Product | Paper | Size / margin | Estimate | Actual PDF pages |
| --- | --- | --- | ---: | ---: |
| explanations-and-sources | us-letter | Normal / standard | 9 | 8 |
| explanations-and-sources | us-letter | Large / wide | 14 | 13 |
| explanations-and-sources | a4 | Normal / standard | 9 | 7 |
| explanations-and-sources | a4 | Large / wide | 13 | 13 |
| announcement-profile-fact-sheet | us-letter | Normal / standard | 35 | 30 |
| announcement-profile-fact-sheet | us-letter | Large / wide | 62 | 63 |
| announcement-profile-fact-sheet | a4 | Normal / standard | 33 | 29 |
| announcement-profile-fact-sheet | a4 | Large / wide | 59 | 60 |

These are approximate content-based estimates, not exact pagination. The captured differences range from one page below the result to five pages above it. Font metrics, nested source indentation, line wrapping, and fragmentation affect the final result. The estimate no longer equates one long fact sheet with one page. Browser print preview remains authoritative. More precise normal-size estimation remains a possible refinement; no exact-match claim is made for this matrix.

Validation:

- 42 print unit tests passed, including longer-source text in standalone/appended explanations and unchanged selection/pairing.
- Site TypeScript checks, production build, and artifact/bundle invariants passed.
- Cross-browser print workflows: 36 passed (1.5m), zero failures.
- All eight PDFs retain searchable text, exact paper dimensions and checksums in `print-prose-estimates/manifest.json`.
- `audit-print-pdfs.py` reports no extracted words outside page bounds. Dominant text size by extracted character count is 12pt for every normal PDF and 18pt for every large PDF. This does not certify every small label, detect all overlap, or replace visual inspection.
- Large Letter explanation pages 3 and 4 were visually inspected: source excerpts, labels and receipt text are readable with no observed overlap. This is sampled inspection, not all-page visual acceptance.

Reproduction from implementation root:

```sh
NYCUSTODIAN_PRINT_CAPTURE_OUTPUT=/mnt/models/dev/nycustodianexam/implementation/design-review/2026-09-07/print-prose-estimates NYCUSTODIAN_PRINT_CAPTURE_PRODUCTS=explanations-and-sources,announcement-profile-fact-sheet node design-review/2026-09-07/capture-print-final-products.mjs
python3 design-review/2026-09-07/audit-print-pdfs.py design-review/2026-09-07/print-prose-estimates
```

The retained PDFs cover all pages; regenerable raster pages remain in `/tmp/nycustodian-print-final-products-pages/`. Final print visual review and the wider handoff completion audit remain open.
