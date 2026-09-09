# First implementation slice — September 8, 2026

Base: `aca00668ec6f4cf002cb79c13ce6ff70c7d5baf3`, verified against the remote review branch before work. Branch: `implementation/shared-home-practice-review`. Isolated checkout: `/mnt/models/dev/nycustodianexam/implementation`. Original main working tree and imported reference bytes are preserved.

## Implemented

- Shared Practice / Library / Exams navigation with Settings utility, local SVG icons, four compact bottom tabs, and a scrollable Library sheet. Native disclosure, Escape/focus return, outside dismissal, and no-JavaScript navigation are preserved. Comparisons and coverage links resolve to actual sections.
- Home: series-specific introduction, inventory figures, stacked section headings, subject rows, study cards, compact announcement notice with desktop fact rows, framed trust table, and inset responsive footer.
- Practice: distinct first-visit and returning headings, one-bank coverage and exclusions, four desktop activity cards, saved-record sections and overlapping review counts. Existing practice lengths and storage recovery remain usable.
- Review: named hero, wider saved-answer rows, primary explanation links and quieter finish actions, explicit finish confirmation, overlapping filters, empty/read-failure/write-failure states. Durable state and save-before-feedback logic are unchanged.

## Evidence

[Side-by-side comparison gallery](implementation-comparison.html) pairs accepted references with implementation captures. [Capture manifest](implementation-screenshots/manifest.json) lists routes, fixture states, CSS dimensions, and viewport-image filenames. [Capture script](capture-implementation.mjs) reproduces the evidence against `NYCUSTODIAN_REVIEW_URL` (default `http://127.0.0.1:4187`).

Useful viewport captures:

- [Home desktop](implementation-screenshots/home-1248-viewport.png), [Home compact](implementation-screenshots/home-384-viewport.png)
- [Practice first visit](implementation-screenshots/practice-first-visit-1248-viewport.png), [compact Library sheet](implementation-screenshots/practice-library-open-384-viewport.png)
- [Review confirmation](implementation-screenshots/review-confirmation-1248.png), [compact confirmation](implementation-screenshots/review-confirmation-384.png)
- [Review read failure](implementation-screenshots/review-read-failed-384-viewport.png), [finish not saved](implementation-screenshots/review-finish-failed-384-viewport.png)

Visual inspection covered Home, first-visit/returning Practice, navigation open, Review confirmation, and recovery captures at 1248/384 CSS pixels. Corrections after the initial comparison include the announcement layout, trust-table frame, compact footer, hero proportions, and review action alignment. Full-page captures also include viewport-fixed navigation at its captured scroll position; use viewport images to judge fixed placement.

## Intentional differences and limits

- Home retains real Simulation, Review and Print destinations in place of prototype-only Cleaning procedures and Repair lab destinations. Simulation copy preserves user-chosen timing and does not assert an official duration. The Home CTA says Start practicing; the nominal first-visit desktop reference actually says Continue studying.
- Announcement prose and dates remain drawn from maintained machine-readable facts. The page does not turn the August 25 source review into a claim about live filing availability. Exact sources remain expandable; detailed source links and review dates increase page height.
- Practice retains the functioning 45/60/90 chooser below the hub, so the page is longer than the prototype. Its record counts use actual saved data. No global exam selection or resumable question-practice session is introduced.
- Captures use a real flagged answer saved through the player, rather than fabricating the designer's 23 saved records and five review items. Review filtering/finish persistence and unavailable records are additionally exercised by browser regression fixtures.
- The maintained native system-font stack resolves differently on Linux than in the supplied captures, affecting wrapping and height. SVG navigation glyphs replace the prototype's external Material Symbols font. This is visual comparison evidence, not pixel-perfect fidelity or manual accessibility certification.
- Scope is this first slice. Builder, Atlas, players, simulation, print and remaining utility families still need their detailed reconciliation. No deployment or merge was performed.

## Validation

Exact Bun 1.4.0 and Node 22.22.0. Root build and artifact checks pass: 526 canonical documents, 220 item-scoped artifacts, 291 byte-identical delivery assets, answer boundary and route budgets verified. Site and browser-harness typechecks pass. The four targeted Chromium suites cover 23 tests, including mobile reflow/accessibility, keyboard/no-JavaScript navigation, storage recovery, review persistence and bottom-sheet destination checks. Captures cover 24 route/state/width combinations with full-page and viewport images and no unexpected page errors.


## Integrated core refresh after builder reconciliation

`integrated-core-screenshots/` captures the current Home, first-visit/returning
Practice, Library disclosure, question save flow, Review confirmation/failures,
and unavailable storage at 1248/384 CSS widths. All 24 states completed without
unexpected page errors using the real saved-answer flow and explicit storage
failure fixtures. These are current integration captures, not a claim that all
24 states have completed their final visual audit.

Home desktop/compact hero captures were compared with references 01/02, and
compact Review-ready was inspected. The maintained system-font stack resolves
differently on this platform; existing live-content differences remain documented
above. A concrete compact Home mismatch was corrected: its repeated coverage
intro no longer precedes the subject rows. The announcement/site-length caveat
now follows the compact list, retaining the qualification while matching the
reference hierarchy. Desktop copy is unchanged. The refreshed compact viewport
was inspected after this correction. Root build/artifact verification passes.

Capture output can be redirected with `IMPLEMENTATION_CAPTURE_OUTPUT`; the
historical first-slice evidence is preserved. Final full-page visual checks of
the remaining core states and other families remain on the implementation ledger.
The separate illustrated-question contract audit is in QUESTION-PLAYER-REVIEW.md.

## Home section audit and compact subject links

`home-final-audit/` contains desktop (1248 CSS px) and compact (384 CSS px)
Home captures, plus separate hero, coverage, study-card, cycle, trust, and footer
crops. Compared the full pages with accepted references 01/02. Compact subject
links now use blue underlined text and an arrow, with the narrower numbered-column
layout from the reference. Their interactive boxes remain at least 44px tall.
The change is scoped to Home below 47.99rem.

The capture script checks horizontal overflow, every compact subject-link target
and underline, the Start practicing destination, and unexpected page errors. All
checks passed; the root build and artifact verifier passed. No new three-browser
regression run was required for this scoped CSS change. Section crops hide fixed
navigation to avoid obscuring content; full-page captures retain it at the capture
viewport position (the compact bar appearing within the long image is not its
document-flow position).

Remaining visual differences are concrete: the compact implementation is 3227px
high versus the supplied 2097px image. Source citations and technical-details
disclosure, the cycle qualification/source disclosure, five rather than three
compact trust rows, and fuller footer copy add height. Native-font wrapping also
differs, including the hero heading. Desktop retains the intended three-column
study cards and five trust rows; compact retains the two-column study cards.
Real destinations and qualified announcement facts remain intentional content
differences. The extra compact information hierarchy and typography still need
a focused reconciliation; this evidence does not certify full Home fidelity.

## Compact Home trust hierarchy follow-up

`home-compact-audit/` supersedes `home-final-audit/` for the current Home rendering.
Compact Home now shows the reference's three trust topics: operator, saved data,
and sources. Cost and exam-security rows remain on desktop; the compact hero
still states that practice is free, and the footer retains the original-content
qualification and links to exam security and offline use. Repeated introductory
paragraphs above Ways to study and How this site works are omitted on compact
Home. Source citations, uncertainty qualifications, and their disclosures remain
available. The scope is Home only.

Inspected the fresh compact trust and study-card crops: three separated trust
rows, two-column cards, intact text, and visible links. Capture assertions verify
three visible compact trust rows, retained footer security copy/offline link,
44px subject targets, no horizontal overflow, and the Practice CTA destination.
Root build/artifact verification passes. Existing Home mobile reflow/navigation
and serious/critical axe checks pass in Chromium, Firefox, and WebKit (3 tests).
The native-font wrapping, fuller footer, and additional source disclosures still
differ from the supplied compact reference; full fidelity remains unproven.

## Home typography verification

Compared the actual stylesheet with Home.dc.html rather than inferring every
wrapping difference from screenshots. A later override had replaced the desktop
prototype's responsive heading size with a fixed 40px. Restored
`clamp(2rem, 1.5rem + 1.8vw, 2.875rem)`, the prototype's `text-wrap: pretty`
for the heading/intro, and compact heading letter spacing of -0.02em.

The refreshed `home-compact-audit/manifest.json` records computed typography and
Chromium's actual platform font: DejaVu Sans Bold, not a downloaded custom font.
At 1248px, heading size/line height/spacing are 46px/52.9px/-1.15px; at 384px
they are 26px/31.2px/-0.52px, matching the prototype declarations at these widths.
The native font stack is identical in app and prototype. The font used to produce
the supplied PNGs is not established by those PNGs. Inspected both updated hero
crops: readable, complete headings and actions, without overflow. Remaining line
break differences are retained as a platform-dependent visual difference, not
compensated with a smaller-than-specified type size.

Root build/artifact checks and updated capture assertions passed. The capture
script now asserts heading sizes and records typography for reproducibility.
Earlier three-browser compact reflow checks preceded this typography correction;
the current capture verification is Chromium only.

## Practice first-visit composition follow-up

The final comparison with reference 06 exposed an ordering mismatch: first-visit
coverage preceded Ways to practice. Moved coverage below saved activity, Review,
and recent activity, matching the reference's sequence. Returning state ordering
is unchanged. Practice activity cards now use the existing whole-card-link
component styling: four columns at ample width and two compact columns, concise
compact summaries, with the real hazard count from bootstrap. First-visit compact
saved activity now omits the repeated descriptions and action buttons, matching
the reference's concise record rows. Those destinations remain in the activity
cards and shared Library navigation.

Refreshed all 24 integrated core states in `integrated-core-screenshots/` through
real answer saves and explicit failure fixtures without unexpected page errors.
Inspected first-visit desktop and compact viewport captures: activities now follow
the hero; desktop retains four complete activity cards and compact begins its
two-column grid. Root build/artifact checks and site typecheck passed. Eighteen
existing Practice builder, saved-activity, unavailable-state, and durable Review
checks passed across Chromium, Firefox, and WebKit. Offline tests were excluded
because the content/save/cache contracts were unchanged.

The complete page remains longer than the prototype because of the functional
builder and detailed coverage. Compact hero coverage-link ordering, placement of
settings/offline links, remaining coverage density, and the separate preset chooser
still need final reconciliation. This update does not certify all integrated
captures as visually complete.

## Responsive Practice and compact Review reconciliation

Reading the complete Study Hub prototype established an intentional width-specific
order: first-visit desktop coverage precedes the activities; compact coverage
follows recent activity. The previous shared ordering matched compact only.
Practice now subscribes to the compact media query and renders the corresponding
DOM order, including the hero coverage link and settings links. This keeps reading
and keyboard order aligned with the visible layout, instead of reordering
interactive content only with CSS. Compact coverage is a single card preserving
subject scope, original-content limits, announcement independence, and source
links. The repeated closing announcement section was removed because coverage
already includes that destination.

The functional builder remains visible. The legacy whole-bank preset links and
capacity table remain in a native Quick preset sets disclosure with the same
`#practice-sets` target, available without JavaScript. Compact activity-card rules
now cover the entire compact range through 47.99rem, fixing the one-column gap
between 640px and 768px.

Review reference 21 uses two-column summary facts, no repeated paragraph above
its filters, and vertically stacked primary/secondary actions. Applied that
compact composition, including full-width confirmation actions. Finish review
still opens explicit confirmation; reading an explanation never acknowledges it.
The fuller unavailable-attempt rule and recovery actions are retained. Real
fixture counts differ from the supplied five-item example.

Validation: root build/artifact verification, site and browser typechecks pass.
Twenty-one Practice/builder checks pass across Chromium, Firefox, and WebKit,
including a new 700px-to-1248px reading-order/keyboard check and no-JavaScript
preset navigation. Six Review tests pass across those browsers, covering exact
receipt quarantine, confirmation focus, and unavailable feedback history. The
24 integrated captures were refreshed without unexpected page errors. Inspected
compact Practice hero/activity entry and Review's confirmation page against the
accepted references. Final compact confirmation widths were then corrected and
recaptured. Review's multi-item/unavailable inventory comparison and the remaining
full-page families still need final visual verification.

## Practice coverage deep-link recovery

A new browser regression reproduced `/practice/#covers` landing outside the
coverage viewport in Chromium, Firefox, and WebKit. The browser initially scrolls
to the generated fallback section, but the interactive hub replaces and moves
that section after loading saved activity. Extended the existing one-time builder
fragment recovery to the coverage section: once activity and Review finish
loading, focus the requested section without scrolling, then scroll it into view.
Coverage is programmatically focusable with tabindex -1 and does not add a Tab
stop. The guard preserves the unavailable-state focus behavior.

All three pre-fix coverage checks failed on the viewport assertion. After the fix,
nine checks passed across all three browsers: coverage viewport/focus, builder
setup navigation/focus, and storage-unavailable focus. Root build/artifact
verification passed. No document layout or saved-content contracts changed.
