# Atlas record and unavailable-image review

The accepted export index defines catalog states (all families, selected family, compact selection, unavailable illustrations). It supplies no separate tool-detail or family-detail mockup. Existing semantic record/family pages remain the baseline for those routes.

The unavailable-image catalog now displays each released neutral description directly, matching the reference’s readable-record fallback. It retains record links, family controls, and eligibility notices. Empty placeholder thumbnails are removed; compact descriptions span the card width. No replacement or invented image is supplied.

`capture-atlas-records.mjs` captures the pipe-wrench record, articulated-hand-tools comparison, and missing-image catalog at 1053 and 384 CSS pixels. All six captures complete without page errors or document horizontal overflow. The compact record and unavailable-image captures were visually inspected. This samples two record routes; it is not a claim that every record/comparison is visually certified.

Production build/artifact invariants pass. Three Atlas Chromium checks pass, including responsive navigation and actual failed-image requests. The failure check now confirms the released image alternative is visible as fallback text.

Remaining: final catalog matching-width comparison and cross-browser checks. All 65 generated records retain supported use, recognition cues, scope/eligibility, and source evidence in the generator; full content correctness remains governed by the released corpus and artifact checks.

## Reference-only inventory verification

`verify-atlas-records.py` parses all 65 generated main-content regions. Each has a nonempty image alternative, a released image file, and the required use/cue/evidence/scope/eligibility/source sections. Exactly 12 are reference-only; each has a restriction notice and no `/practice/` link in main content. The shared navigation remains available. Results are recorded in `atlas-record-screenshots/inventory-verification.json`. This verifies generated completeness and restrictions, not underlying source truth.

The expanded capture script records the soldering-gun restriction at 1053/384 CSS pixels and asserts that its main content has no Start practice link. The compact restriction capture was visually inspected: eligibility, publication restriction, and source trail remain readable above the bottom navigation. Eight captures now complete without page errors or document horizontal overflow.

## Catalog grid comparison — September 9

A dedicated capture now uses a 1042px viewport to obtain a measured 990px
catalog region, matching desktop reference captures 32/33. Earlier 990px
viewport captures had narrower content bounds. Compact captures use a 384px
viewport; the 352px catalog content sits inside the normal page gutters.
`capture-atlas-final.mjs` records all families, the 15 rigid hand tools, and
failed-image rigid records at both widths. It scrolls every visible card to
load lazy images, awaits image decoding and fonts, and records region bounds.

The comparison exposed a forced four-column grid. Desktop now follows the
reference's 11rem minimum auto-fill cards, 16px gaps, outer panel, 16px card
padding, 15px titles, and 13px muted family labels. At the matched width there
are five columns. Tab gaps match the prototype. Links underline on hover;
compact cards retain their existing eligibility labels while desktop cards
only repeat the reference-only warning, as in the desktop prototype. All 12
restrictions remain visible.

Visually inspected full all-family, rigid-family, and compact captures against
32/33/34; also inspected missing-image compact records. Platform font metrics
still cause different line breaks. Long names now have optional breaks after
slashes and overflow wrapping so text stays inside the card. The accepted
illustration bytes, names, family order, source records, and restrictions remain
unchanged. No new artwork was generated.

Validation: build/artifact verification and site/browser typechecks pass. Twelve
Atlas browser checks pass across Chromium, Firefox, and WebKit, covering the
reference grid, all nine family counts, URL/selector behavior, card-title
overflow, 12 desktop restriction labels, 53 compact scored labels, reflow, and
failed-image descriptions. The inventory verifier again checks all 65 record
pages, including every reference-only restriction and absence of practice links
in those main-content regions.

Remaining catalog differences: the prototype's closing release/provenance note
is absent (the current page puts eligibility totals in its introduction), and
image failures lack its page-level recovery/download message. Per-record
descriptions remain readable. These are explicit next implementation items;
this grid comparison does not declare the whole Atlas family complete.

## Release provenance and visible-image recovery — September 9

The catalog now ends with the reference's release note and native technical
disclosure. Counts come from released/scored tool inventories (65/53/12); the
content-release identity comes from catalog.packId/version (launch-v1, version
4), not the prototype's old v2.0.0 fixture. The wording says every record has a
released illustration, without claiming that every image loaded on this device.
The note identifies written descriptions, source evidence, and scored-use
restrictions; the disclosure directs readers to individual records for support.
Eligibility totals moved from the page introduction to this closing note.

An image-recovery notice appears above the grid only when a currently visible
card has an actual failed image request. Family selection recomputes visibility
from those observed failures. Its copy states that some illustrations could not
load, preserves written-record use, and links to /offline/ for downloads. It
does not diagnose missing installation from a network failure or promise that
a download fixes every failure. The existing per-record neutral descriptions
and eligibility warnings remain available.

The final capture set now has 12 artifacts: all/rigid/failed-image catalogs and
focused release-note, expanded-details, and recovery-message crops at both
viewport widths. Visually inspected those focused crops, including the compact
metadata wrapping and download action. The new elements use the accepted
reference's hierarchy with current release metadata and qualified recovery copy.
Previously listed missing provenance/recovery elements are implemented.

Validation: full build/artifact verification and site/browser typechecks pass.
All 15 Atlas browser checks pass across Chromium, Firefox, and WebKit. A partial
image-failure test verifies message visibility when the affected card is shown,
suppression for an unaffected family, return with All families, and the genuine
download destination. It also verifies current release metadata through a native
disclosure without JavaScript. All 12 captures complete without page errors.
Remaining platform typography differences and record-view sampling limits from
the earlier audit remain explicit; broad final integrated gates are still pending.
