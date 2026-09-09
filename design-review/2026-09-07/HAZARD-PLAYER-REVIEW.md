# Hazard player reconciliation

Compared the accepted Hazard Player prototype and marking capture 35 with the real released hallway scene. The scene and response columns now use the reference’s content-driven 20rem minimum instead of a 1024px viewport breakpoint. The position and mode use plain text; the instruction is ordinary supporting text. The save panel now has its visible heading and border, matching the reference.

`capture-hazard-player.mjs` records empty, marked, and saved states at 1053, 850, and 384 CSS pixels. All nine captures complete without page errors or document horizontal overflow. Tablet and compact marked captures were visually inspected. The real scene, position label, and single centered marker differ from the prototype’s stairwell fixture and two markers. Live-region announcements remain screen-reader-only; the prototype’s visible debug live-region specimen is not product UI.

Production build and artifact invariants passed. Nine Hazard browser tests passed, covering image failure, pan/reset, durable markers, BFCache, neutral zero confirmation, storage failure, keyboard zones, and mismatched feedback. These checks preserve behavior and do not prove complete visual fidelity.

Remaining: compare revealed feedback against capture 36, keyboard zones against 37, and capture compact recovery states. Final matching-width visual audit remains required.

## Keyboard and recovery pass

Keyboard zones now share the responsive scene/response workspace, use compact divided rows inside one fieldset, and retain visible native checkbox marks. The neutral ordering/count guidance follows the prototype. Saved outcomes use a plain heading instead of the extra blue panel. Six real keyboard captures cover empty, selected, and saved states at 1053/384 CSS pixels. Desktop and compact selected captures were inspected.

Three additional 384px captures exercise actual image-request failure, neutral zero confirmation, and feedback-request failure after durable save. All complete without page errors or horizontal overflow; the saved-but-unavailable feedback capture retains a clear Retry feedback action. Scripts intercept only the relevant network request; product code has no failure toggle.

Build/artifact invariants and all nine Hazard browser regressions pass. The detailed revealed explanation/overlay composition still needs reconciliation; these captures do not close that requirement.

## Revealed composition pass

Visual feedback now shares the response column with the saved marker list. The original zoomable scene displays the reviewed overlay, eliminating the duplicated full-width image. Keyboard feedback also uses its response column. The overlay legend is visible outside the scrollable image area, while the matching caption remains available in other uses of the annotated-scene component.

An initial regression exposed the saved-image restoration boundary: the live asset URL can be absent when reopening a committed response. The viewport now selects the retained committed image before testing asset availability. All nine Hazard browser regressions pass, including restoration with original image/postcommit requests removed; all five workspace typechecks and the production build pass. Refreshed visual/keyboard captures retain all explanation and source content.

The reference has shorter fixture explanations and fewer source disclosures than real released content. Detailed source receipts and the full text equivalent remain available. Further refinement of explanation grouping, metadata disclosure, and safe/unsafe visual treatments is still needed; this pass closes image duplication and column composition, not the full visual audit.

## Explanation grouping pass

Released correction explanations now have a solid red leading border and pale red surface; safe-as-shown explanations use a dashed blue leading border and pale blue surface, matching the reference’s non-color-only distinction. Existing textual group labels, individual claim rationales, source disclosures, and scope remain intact. Styling is scoped to Hazard player results; shared print and simulation explanations keep their existing presentation. Desktop saved capture was visually inspected and all desktop/compact captures regenerated.

Build/artifact checks and nine Hazard regressions pass. The regression now explicitly checks the visible external overlay legend and exactly one rendered scene image. Its previous text-only selector became ambiguous after the external legend was added alongside the reusable component’s hidden caption; the scoped assertion verifies the intended visible element.

Remaining visual differences are the real content’s length, detailed evidence, metadata and system font. Final cross-browser and page-family audit remains open.


## Matching-width and recovery audit — September 9, 2026

`hazard-final-audit/` refreshes 15 current-release captures: visual and keyboard
empty/marked/saved states at 1042/384 CSS viewport widths, plus three compact
recovery states. The desktop card measures approximately 990 CSS pixels, matching
references 35–37. Captures wait for fonts; visual/zone captures also decode loaded
images and wait two paint frames. No page errors or horizontal document overflow
were observed. Desktop marked visual/keyboard and compact feedback failure were
visually inspected after the changes; the initial compact keyboard and revealed
visual captures were also inspected. This does not claim every final screenshot
has received detailed visual review.

Panel headings now use the prototype's 1.0625rem size; the zone legend uses body
size. Prompt paragraphs retain the prototype's 68ch measure. The Add marker button
fits its content, and save-note sizing/flex behavior follows the reference rather
than compressing beside the save button. Recovery panels have explicit borders
and compact headings. Saved-but-unavailable feedback now uses amber with a clear
saved-state heading; failed saves remain errors.

All 25 applicable Hazard browser workflows pass across Chromium/Firefox/WebKit;
two BFCache checks are intentionally skipped on unsupported projects. The first
run exposed four assertions per browser still using v4 attempt IDs. Current
generated routes explicitly declare v5; fixture IDs/receipts were updated and the
full suite rerun. Durable-save-before-fetch and exact restoration assertions
remain intact. Site/browser typechecks and production build/artifact gates pass.

Remaining revealed-state discrepancy: marker feedback is a separate list while
disabled edit controls remain in the saved marker panel. The reference puts
feedback beside each saved marker and removes editing controls. Reconcile that
composition before closing the player audit. Real hallway content (four zones,
one hazard) differs from the prototype stairwell fixture, and complete source
claims/text equivalents are longer; those are intentional content differences.
System-font rendering varies by platform. Final integrated validation remains.


## Saved-marker feedback composition — September 9, 2026

Each saved visual marker now contains its existing assessed explanation beneath
the marker number and coordinates. Hit and safe-detail messages use textual
labels plus red/blue treatments. The separate duplicate marker-feedback list is
removed; missed-hazard feedback remains below the outcome. Marker movement,
removal and addition controls disappear once the response is saved, including
saved-but-unavailable feedback. During saving they remain disabled; failed saves
still permit correction/retry. Feedback is rendered only from the revealed state.

The full three-browser suite passes 28 checks, with two intentional BFCache
skips. Added coverage checks hit/safe-detail card association and exact reload,
while the existing extra-mark test verifies no edit controls or duplicate list
remain. Durable-before-fetch assertions still pass. Site/browser typechecks and
build/artifact verification pass.

The refreshed visual captures use two actual pointer selections at normalized
(0.5, 0.7) and (0.9, 0.65), exercising the hallway hazard and safe detail. The
script asserts both feedback labels after saving. Full desktop saved output and
readable marker close-ups at desktop/384px were visually inspected. A discovered
doubled full stop in condition-plus-explanation formatting was corrected.

This closes the saved-marker composition discrepancy recorded above. The full
source claims, scene metadata and linked text equivalent remain longer than the
prototype's short fixture. Final integrated validation and remaining page-family
audits still apply; these observations are not manual assistive-technology
certification.


## Saved Hazard Review context

At source `f8d8bc84ce7790a2192b41074a5947d55b3d4363`, `capture-hazard-review.mjs` captured visual/nonvisual saved and missing-response states at 1042px and 384px CSS widths (16 checksummed full-page/notice images in `hazard-review-current/`). The fixtures save actual responses before reopening `?review=1`; all eight states assert their expected heading, absence of save buttons and no horizontal overflow. No page errors were recorded. Visual markers cover one hazard and one safe detail; written mode saves the first zone separately.

All four missing-response full pages and four saved-notice crops were visually inspected. Typography, padding and link wrapping fit without observed clipping or overlap. Inspection found “1 marks”; the correction now renders singular hazard/mark counts and was rebuilt and recaptured. Site typecheck and production artifact/bundle checks passed (`/tmp/nyc-hazard-review-copy-build.log`). Capture log: `/tmp/nyc-hazard-review-capture.log`.

The export index supplies Hazard marking/revealed/keyboard references, but no dedicated saved-Hazard-Review or missing-response design. These additions adapt the established Hazard frame and notice components while preserving the separate written construct and explicit queue completion. `hazard-review-current/visual-review.json` records exact inspected images. Long saved-page explanation sections remain available in full-page captures, but this focused pass does not claim new full-page fidelity from reduced-scale previews or device/assistive-technology certification.
