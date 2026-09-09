# Print output evidence

The fixed `print-pagination-review` set contains 45 original questions, normal text, standard margins, grayscale, without answers. `capture-print-output.mjs` generates screen captures and actual Chromium PDFs from the local production preview.

Actual output: US Letter is 13 pages (612 × 792 pt); A4 is 12 pages (594.96 × 841.92 pt). PDF text extraction finds all 45 question numbers in order and no Generate preview or inspection-checkbox controls. See `print-output/pdf-verification.json`. Sampled question pages retain prompts and choices together. This is browser PDF evidence, not physical printer certification or a complete visual audit of every product.

The initial PDFs exposed a concrete defect: applying CSS grayscale to the entire packet rasterized all text in Chromium. Print media now removes that container filter and applies grayscale to images. Text is searchable again, and the Letter PDF shrank from approximately 3.3 MB to 55 KB. Screen preview retains its existing grayscale treatment.

Validation: production build and artifact invariants passed (526 documents); all nine Chromium print browser tests passed, including separate keys, appended keys, regeneration failure, verified images, and hazard product separation. Both final PDF captures completed without page errors.

Remaining: compare preview composition against reference 38; inspect large text, wide margins, illustration-heavy packets, grayscale annotations, and all pages for clipping. Estimated page count remains an estimate and is not an observed browser pagination count. Other browser engines and physical printing remain unverified.

## Extended output pass

`capture-print-extended.mjs` installs and activates the real offline pack, then generates 10-question large-print packets with wide margins on Letter and A4, plus all nine tool families (65 verified images) on Letter. Background printing is disabled. The extended manifest records actual page counts and paper sizes, confirms searchable text, and checks every image is loaded with grayscale applied. Sampled large-text and illustrated pages remain readable with intact card borders. Both preview-inspection reminders now remain screen-only; packet metadata and original-practice statements still print. Earlier normal-text PDFs document the preceding commit.

The extended PDFs are retained for page-by-page review; sampled visual inspection is not certification of every page. The build/artifact checks and nine print browser regressions passed again after the screen-only adjustment.
