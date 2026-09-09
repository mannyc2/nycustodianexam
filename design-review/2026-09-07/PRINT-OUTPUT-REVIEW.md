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


## Full extended-packet pagination audit

The earlier sampled inspection missed real defects in the historical
`print-output/letter-tool-families.pdf`: nested grid fragmentation overlapped
later cards and obscured text/images. Its extracted text contains 52 overlapping
word pairs. The historical large-print A4 packet also stranded the Questions
heading before the first question. Those files are historical evidence, not
accepted final pagination proofs.

Print media now uses block flow for sections, family containers, and question
lists while retaining the two-column tool-card grid. This keeps question headings
with their content and prevents later families from overlapping prior cards.
Screen focus outlines are suppressed only in print media.

The current artifacts are in `print-extended-audit-output/`: five Letter large-print
pages, five A4 large-print pages, and 35 Letter tool-family pages. All 45 pages were
visually inspected after the fragmentation fix, including illustrations, card
labels, supported uses, recognition cues, and question choices. Following the
estimate adjustment, tool pages 2–35 were pixel-identical to that reviewed render;
the final regenerated first page was inspected again after suppressing its focus
outline. The PDF capture asserts that the print heading has no focus outline.
No physical printer or Firefox/WebKit PDF-pagination certification is claimed.

The tool estimate now counts the selected families' individual cards plus metadata,
instead of treating each family as one card. For all 65 tools it estimates 34 pages;
Chromium actually produces 35. It remains explicitly an estimate. Actual length
remains nine families. Selection/order and the selection algorithm are unchanged.
Saved jobs validate their retained page count and fingerprint rather than
recomputing the estimate, so existing jobs remain compatible; newly generated
manifests incorporate the corrected estimate in their fingerprint.

`verify-print-extended-pdfs.py` checks every current PDF page for out-of-bounds
text and overlapping word boxes, verifies all ten question numbers in order and
the first question beside its heading, and checks all 65 supported-use and
recognition-cue blocks. The retained `page-verification.json` records PDF hashes
and per-page results: zero detected word collisions or out-of-page text. These
text checks supplement visual review; they cannot detect every image-layout defect.

Validation: 33 print-generation unit tests, 27 print browser tests across three
browsers, all five workspace typechecks, and root build/artifact checks passed.
The final focus-only CSS adjustment was covered by a fresh build and PDF capture.
Hazard worksheets/annotated answer PDFs and the remaining product-specific visual
checks are still outstanding.


## Hazard packet pagination audit

`capture-print-hazards.mjs` captures two matching scenes as a Letter blank
worksheet, Letter annotated answers, A4 large-print annotated answers, and A4
text equivalents. It waits for image decode and print-media grayscale styles.
The initial worksheet had an otherwise empty border-only page. Source headings
in the initial answer PDF could split from their excerpts. Print-only block flow,
removal of trailing scene borders/padding, and break avoidance for individual
feedback/source items address those defects. Normal worksheet images are bounded
to 3.5 inches high to leave room for response lines.

Current captures contain 3 worksheet pages, 11 Letter answer pages, 19 A4
large-answer pages, and 9 A4 text-equivalent pages. All 42 pages were visually
reviewed as rasterized PDF pages. Both worksheet scenes retain their neutral
zones and all three response lines on the same sheet. Scene images and answer
outlines remain intact; feedback and source records stay together when they fit.
The text-equivalent final source page was also inspected individually at full
render size. No physical-print or Firefox/WebKit PDF-pagination certification
is claimed.

`verify-print-hazard-pdfs.py` checks every retained page for blank output, word
collisions, and text outside page bounds; verifies both scenes are present; and
checks worksheet/answer-label separation. All checks pass, and the report records
PDF hashes. All 27 print browser regressions passed. The build passed again after
the final worksheet image-size rule. These checks supplement visual inspection.

Remaining findings: large-print body text scales to 18pt but heading tokens and
printed URL pseudo-elements retain smaller fixed sizes. These need a focused
print typography correction and regenerated large-print evidence. Hazard page
estimates are also too low for source-inclusive answer packets (the two-scene
large packet estimates 2 and produces 19). Pagination is readable, but these
findings mean the print family is not yet fully reconciled.


## Printed heading and URL sizing

Print-only heading sizes now follow the large-print body: h1 27pt, h2 22.5pt,
h3 20.25pt, and h4 18pt. Printed source URLs inherit the packet's text size
(12pt normal or 18pt large) and can wrap within the page. Screen styles are
unchanged. The capture script checks every printed heading and source URL
pseudo-element against the selected minimum and retains the computed sizes.

The fresh `print-hazard-typography-output/` artifacts supersede the preceding
hazard PDFs for typography. They retain the same 3/11/19/9 page counts. All
19 large-print pages were visually inspected again; headings, full-size URLs,
images, and source records remain within page bounds. Normal Letter answer
page 10 and A4 text-equivalent page 9 were inspected individually for the URL
change. The all-page text-boundary/collision/item checks pass for all four PDFs.
Use `PRINT_VERIFY_OUTPUT=print-hazard-typography-output python3
verify-print-hazard-pdfs.py` from this directory to reproduce the report.
The root build/artifact checks passed. The prior 27 browser regressions are
historical for the pagination change; this typography change was checked by
fresh Chromium capture assertions and actual PDF inspection.

Source-inclusive hazard page estimation remains unfinished. Other large-print
product PDFs need refreshing during final integrated print validation because
the heading rule applies to all print products.
