# Print output evidence

The fixed `print-pagination-review` set contains 45 original questions, normal text, standard margins, grayscale, without answers. `capture-print-output.mjs` generates screen captures and actual Chromium PDFs from the local production preview.

Actual output: US Letter is 13 pages (612 × 792 pt); A4 is 12 pages (594.96 × 841.92 pt). PDF text extraction finds all 45 question numbers in order and no Generate preview or inspection-checkbox controls. See `print-output/pdf-verification.json`. Sampled question pages retain prompts and choices together. This is browser PDF evidence, not physical printer certification or a complete visual audit of every product.

The initial PDFs exposed a concrete defect: applying CSS grayscale to the entire packet rasterized all text in Chromium. Print media now removes that container filter and applies grayscale to images. Text is searchable again, and the Letter PDF shrank from approximately 3.3 MB to 55 KB. Screen preview retains its existing grayscale treatment.

Validation: production build and artifact invariants passed (526 documents); all nine Chromium print browser tests passed, including separate keys, appended keys, regeneration failure, verified images, and hazard product separation. Both final PDF captures completed without page errors.

Remaining: compare preview composition against reference 38; inspect large text, wide margins, illustration-heavy packets, grayscale annotations, and all pages for clipping. Estimated page count remains an estimate and is not an observed browser pagination count. Other browser engines and physical printing remain unverified.

## Extended output pass

`capture-print-extended.mjs` installs and activates the real offline pack, then generates 10-question large-print packets with wide margins on Letter and A4, plus all nine tool families (65 verified images) on Letter. Background printing is disabled. The extended manifest records actual page counts and paper sizes, confirms searchable text, and checks every image is loaded with grayscale applied. Sampled large-text and illustrated pages remain readable with intact card borders. Both preview-inspection reminders now remain screen-only; packet metadata and original-practice statements still print. Earlier normal-text PDFs document the preceding commit.

The extended PDFs are retained for page-by-page review; sampled visual inspection is not certification of every page. The build/artifact checks and nine print browser regressions passed again after the screen-only adjustment.

## Preview layout and recovery reconciliation

The screen preview now presents its metadata as divided rows, matching the
Component Library print specimen's hierarchy. Narrow screens stack each label
and value. The inspection checkbox uses the shared 20px control and touch target;
regeneration and print actions share a row when space permits and become full
width on compact screens. These layout rules are screen-only.

The review found that the `status-panel` classes had no CSS. Print recovery states
now have bordered panels with distinct warning/error surfaces and titled messages.
A stale job names the problem, preserves its readable preview, and links to the
regeneration controls. Screen grayscale now applies to packet sections rather
than the entire preview, preserving UI warning colors and controls. In print
media, section filters are removed and image-only grayscale remains, keeping PDF
text searchable.

`capture-print-preview-states.mjs` exercises real two-question saved jobs at 779
and 384 CSS viewport widths. It captures ready metadata, inspection/actions,
system-print failure, failed durable regeneration, stale content and unavailable
restore. Its stale state is an explicit mutation of the saved job status for
review, not a claim that the current release is corrected or withdrawn. The script
verifies focus recovery, a stable URL after regeneration failure, print disabled
for stale content even after inspection, a new URL after successful regeneration,
and inspection reset on the new job. The accepted 699px specimen is a collection
of states; the implementation captures remain separate states with real content.

All 27 print browser checks pass across Chromium, Firefox and WebKit after the
final CSS changes. All five workspace typechecks and root build/artifact checks
pass. Twelve state captures completed without page errors or document overflow.

Fresh PDFs are retained in `print-preview-output/`, generated with
`PRINT_CAPTURE_OUTPUT=./print-preview-output/ node capture-print-output.mjs` from
this directory. The standard 45-question set is 12 Letter pages and 11 A4 pages.
The older 13/12-page captures predate the earlier screen-only reminder changes
and are not an equivalent immediate-before baseline. `verify-print-preview-pdfs.py`
checks all 45 question numbers in order, absence of UI controls and extracted text
within each page's bounds. The final Letter page was visually inspected: questions
42–45 and their choices remain intact. These checks do not prove all-page visual
fidelity, illustration pagination, physical printing, or exact pagination in
Firefox/WebKit. Extended large-text/tool PDFs still need their full visual audit.
