# Question-player layout reconciliation

The existing text player now uses the reference's 50rem card width and centers
it in wider pages. Explanations precede the continuation action. An unanswered
item offers Skip for now when a next question exists; answered items offer Next
question or Return to Practice at the end. The new actions preserve ordinary
links, modified-click behavior, and the existing replace-history navigation.
Custom-set query coordinates are retained. Saved-state copy no longer says the
answer can be changed. Durable commit, retry and feedback controllers remain.

`question-player-screenshots/manifest.json` records unanswered, selected and
answered states at 1053 and 384 CSS viewport widths. The desktop card is 800 CSS
pixels, matching reference 26/27's element width. Fixed bottom navigation is
excluded only from element crops. Source data and answer choices are the real
released content, not the prototype fixture.

Important content difference: reference 26/27 shows an illustrated identification
question. The released PrecommitQuestion schema contains text prompts/options,
not a reviewed question-image binding or neutral image description. This slice
reconciles the shared text-player composition; it does not manufacture an image
mapping from answer-bearing Atlas filenames or claim the illustrated player is
implemented. A reviewed pre-answer image contract remains necessary for that
modality. The invisible live region also intentionally stays invisible rather
than displaying the prototype's debugging label.

Validation: root build/artifact checks and workspace typechecks passed; all 14 targeted
question-player, custom-builder and Study browser regressions passed. One old history-test heading expectation was updated to the
previously implemented first-visit copy. Further work remains on the full visual
player modality, remaining player families and final cross-browser audit.


## Illustrated-question contract audit

At implementation commit a2c4fc8, all 90 records in
`content/authoring/packs/launch-v1.json` use text prompt/options with no image
binding fields. None refers to a pictured item or shown illustration.
`AuthoredPackQuestion` and `PrecommitQuestion` likewise contain no illustration
receipt or neutral description. Adding an Atlas image to an existing question
would change its stimulus and potentially reveal its keyed answer.

This is implementation work still to do, not a requirement to obtain a new user
approval or a claim that images are unavailable. `QuestionReviewReceipt` supports
agent-assisted editorial/source/security/accessibility review and pins the reviewed
artifact hash. An illustrated item needs a reviewed image-question pairing and
neutral delivery identity before that receipt can truthfully cover it.

Required implementation spans: authored binding and review-hash closure; compiler
validation and neutral pre-answer image receipts; delivery/cache closure without
answer-bearing filenames or metadata; accessible player image and missing-image
states; retained feedback/Review and print behavior; and deterministic custom-set
and simulation compatibility. Existing text-question receipts and saved records
must remain valid. The accepted isolated tool images can supply reviewed artwork,
but their Atlas URLs are not suitable pre-answer identifiers. No illustrated
question or review receipt was fabricated during this audit.

## Illustration review fingerprint foundation

The review projection now supports an optional illustration binding containing
the authored concept identity, exact accepted master SHA-256, and neutral
description. Each field participates in the canonical review fingerprint;
omitting the binding preserves the original text-only projection byte-for-byte.
Three focused tests verify all 90 existing authored review receipts, image-binding
drift, and stable projection order. Content-package typecheck passes.

This is the first implementation step, not a released illustrated modality.
The authored schema, accepted-artwork compiler validation, neutral delivery
identity, player and retained-history rendering, and print closure still need
implementation before any illustrated item can be published. The test binding
is synthetic and is not authored or released study content.

## Authored and compiled illustration contract

Authored questions now accept that optional reviewed binding. The compiler checks
the exact accepted tool master, membership in the authored tool set, practice
eligibility, and the absence of a publication gate. It then projects only the
neutral description, master checksum, and derivative kind/checksum/byte receipts
into both the pack and item precommit artifacts. Concept IDs and repository paths
are deliberately absent from the stimulus projection. Existing text records omit
the field entirely.

Four compiler tests cover safe projection, absent editorial re-review, stale or
missing artwork, and reference-only exclusion. Together with the existing pack
and fingerprint tests, 32 tests pass; content typecheck and full production
build/artifact checks pass with unchanged released content and bundle measurements.
The tests use synthetic pairings, not newly reviewed learner questions. Neutral
image URL delivery, cache closure, rendering, and actual original illustrated
content remain unfinished; no illustrated question has been released yet.

## Neutral delivery and shared image view

Inspection corrected an earlier assumption: accepted tool derivatives already use
neutral `t001-web.png`-style paths, not answer-bearing Atlas route names. The image
receipt now reuses those validated paths, checksums and sizes. Compiler tests
assert that every emitted derivative belongs to the release asset closure. Existing
byte verification, delivery manifests and explicit offline-pack receipts cover
these images without aliases or duplicate downloads. Concept names and answer keys
remain absent from the pre-answer image projection.

A shared React image view is wired into question prompts, simulation questions
and simulation results, with responsive phone/web sources, neutral alt text, and
retryable missing-image feedback. Practice distinguishes illustrated questions
from text questions. No actual illustrated question is released yet: presentation
tests inject a synthetic binding and never submit it. Actual reviewed content,
retained Review verification, print integration and visual comparison remain.

The shared dependency symlinks had resolved workspace packages to the original
checkout. Local untracked dependency overlays now resolve workspace packages into
this implementation checkout while sharing third-party dependencies. The original
checkout is untouched. Earlier package-local compiler tests exercised new code,
but earlier site builds did not validate those schema changes. Fresh local site
and browser typechecks and the production build now pass. Reusing the existing
derivative schema keeps Settings within its unchanged limit at 487477 raw / 146602
gzip / 123330 Brotli bytes. Two image-view unit tests and three browser cases cover
responsive image loading and failure/retry recovery; these are functional tests,
not proof of final visual fidelity or illustrated answer persistence.

## Required illustrations in saved print jobs

Print bootstrap projects a reviewed question's print derivative into an exact
asset receipt. Question worksheets always include required stimulus images,
regardless of the optional-images control; the builder explains this. Generation
requires verified retained image bytes, stores them in the immutable packet,
renders the retained data URL, and validates those images against the manifest
when restoring or importing the job. No current image is substituted on restore.
Old text-only packets retain their original shape and fingerprints.

Validation: 36 print-generation tests pass, including required-image retention
with optional images off, JSON round-trip integrity and missing-byte rejection.
Three Chromium/Firefox/WebKit tests generate and reload a synthetic illustrated
print job and verify its retained image loads. Site/browser typechecks pass.
The build generated all routes and assets; artifact checks initially caught the
Settings raw closure growing by 519 bytes to 487996. Required imported-job image
validation explains this increase. Its raw limit is now 488100; compressed limits
remain 146750 gzip / 123500 Brotli (measured 146695 / 123288), and all other limits
are unchanged. Artifact verification passes under that bounded allowance.

Actual reviewed illustrated content and resulting PDF pagination/image/large-print
comparisons remain unfinished. Browser tests use explicit synthetic presentation
fixtures, not newly authored or published learner questions.

## First released illustrated item: q091

Pack version 4 adds one independently authored recognition item. The original
90 authored records remain identical to version 3; the new bank has 91 items.
The normal authoring builder consumes `launch-v1.illustrated.mjs`, the explicit
option-order row and the separate editorial review ledger. It verifies the same
image-inclusive review projection as the compiler. No build auto-approves reviews.

The September 9 agent review inspected the accepted t036 phone and grayscale print
derivatives and the maintained feature claims/source lines for t036, t037, t039
and t040. The image clearly shows a single handle, smooth parallel jaw faces and
worm adjustment gear, distinguishing it from the three offered distractors.
Each distractor explanation cites its own recognition claim and the shown tool's
claim. Neutral alt text describes the visible parts without naming the tool.
There is no secure/recalled/public-sample item input, copied item composition,
brand, answer label or scale claim. The existing accepted master is unchanged.
This is an agent-assisted review, not a human-usability or assistive-technology
certification. The exact binding and reviewed content hash are in r091.

The bank's recognition count increases from 26 to 27; the other fact-kind counts
remain 41 use, 11 comparison and 12 safety. The publication verifier and compiler
inventory tests now check the expanded exact closure, including item/pack image
identity: 528 route documents, 222 published item artifacts and the same 291 image
assets. All 32 targeted compiler/review tests pass. The build's artifact verifier
passes after updating those explicit inventory contracts. Three actual-item browser
checks pass for answer commitment, reload and entry through Review. Current-release
browser fixtures now use pack version 4; historical migration fixtures remain
historical. Broad regression validation and older saved-version compatibility still
need a focused pass after this release expansion.

`capture-illustrated-question.mjs` records four actual-item desktop/compact cards,
before and after commitment, at 1053/384 CSS widths. PDF pagination, complete
visual comparison and explicit offline image-retention tests remain outstanding.

## Version-4 regression and historical receipt audit

The combined question-player/illustration matrix returned 22 passes, two skips
and three failures in the same preset-navigation test. That test used the now
collapsed preset section and a hardcoded older deterministic URL. It now opens
the native disclosure and checks the actual published Start 90 target and its
next position. All three targeted browser checks pass after that correction.

A separate code trace found a real remaining upgrade issue: Review compares saved
version-3 receipts against version-4 bootstrap sources, so older saved answers are
preserved in storage but excluded from the ready list. Custom sets additionally
need their original 90-item inventory to reproduce the saved position. Simply
relaxing the pack-version comparison would accept the wrong deterministic closure.

`content/authoring/compatibility/launch-v1-v3-review.json` preserves the exact
version-3 safe review inventory from the tracked Settings document at 78de137,
with full commit/path/source-byte SHA provenance: 90 canonical questions, 195
preset coordinates and 18 scenes. This contains safe prompts/receipts, not answer
payloads. It is an input for explicit historical resolution, not yet wired into
the browser. Historical-player links, runtime resolution and end-to-end upgrade
proof remain required before calling older saved work compatible.

## Historical question resolution implemented

Review now includes explicit previous-question inventories, indexed by full attempt
receipt identity. Canonical and preset answers resolve directly; custom sets are
reconstructed from their original 90-item inventory. Receipt equality and option
order checks remain in force. Historical links use `/history/launch-v1-v3/` and
retain the original session ID, position and pack version in the embedded receipt.
The shared path check accepts only the normal path or the exact receipt-derived
historical prefix, rejecting mismatched release/version prefixes.

The generator creates 375 noindex historical question documents: 90 canonical
Review pages, 195 preset pages and 90 canonical practice targets for custom-set
links. These reuse current item bytes only after checking both precommit and
postcommit sizes/checksums against preserved version-3 receipts. The archive now
also retains the precommit receipts and exact immutable Offline-document provenance.
A changed or unavailable historical stimulus fails the build instead of substituting
new material. Generated history output is ignored alongside other generated routes.

Nine browser checks pass across Chromium/Firefox/WebKit for historical canonical,
preset and custom answers: each opens and reloads the exact old attempt explanation.
25 related unit tests and site/browser typechecks pass. The final build verifies
903 routes, including each historical receipt and noindex declaration. Historical
question resolution adds 303 raw bytes to the shared Settings closure; its bounded
limit is now 488400 raw / 146900 gzip / 123500 Brotli, measured 488299 / 146808 /
123403. Other route limits are unchanged.

Historical hazards, import classification, explicit offline upgrade behavior and
original illustrated-item PDF validation remain outstanding. This pass proves
question explanation restoration, not all version-upgrade behavior.

## Historical hazard restoration

The explicit previous inventories now include scenes as well as questions.
Historical visual attempts resolve through exact receipt equality; custom drills
reconstruct their original scene ordering. The shared versioned-path check applies
to both visual and nonvisual drill targets. Nonvisual answers remain outside the
Review queue by the existing product rule; their historical documents restore
saved responses directly.

The generator adds 36 noindex historical hazard documents. It checks all 18
archived scene-precommit receipts and exact feedback receipts before reusing the
scene data. The original Offline-document provenance covers the additional
precommit receipts. The verifier independently checks each generated route's
scene, mode, saved pack version and feedback binding.

All 18 historical browser cases pass after unifying current/historical lookup:
canonical/preset/custom question answers, visual/custom hazard Review entries,
and direct nonvisual restoration, across Chromium/Firefox/WebKit. Each reloads
its explanation. 21 related unit tests pass, including mismatched historical
prefix rejection; site and browser typechecks pass. Artifact verification closes
939 routes and unchanged item/image asset counts. Historical hazard support adds
216 raw bytes to Settings; its local raw limit is 488600 (measured 488515), with
unchanged 146900 gzip / 123500 Brotli limits (measured 146875 / 123356).

Import classification, previous-version links from the Practice activity list,
and explicit offline upgrade behavior still need verification. These tests do
not prove those separate paths or full historical simulation compatibility.

## Historical activity and portable import

Practice activity and Review now share the same receipt-bound source index,
including archived question presets, custom question sets, and both hazard modes.
The generated trusted registry contains 127 current and 126 archived content
variants. Settings validates exact versioned inventory closure, rejects duplicate
or extra canonical entries, and verifies every canonical and preset receipt.
Current question/scene ID projections still describe the current inventory.

The historical browser matrix now exports each seeded version-3 record through
Settings, removes its durable source record, imports the actual exported file,
and requires one added record with zero quarantined records. It then opens the
Practice feedback link and checks restored feedback; eligible records also open
through Review. All 18 cases pass across Chromium, Firefox, and WebKit, including
canonical/preset/custom questions and visual/custom/nonvisual hazards.

29 related unit tests pass, including missing/extra/duplicate historical inventory
and altered receipt rejection. Site and browser typechecks pass. Full build and
artifact verification pass with 939 routes, 222 public item artifacts, and 291
byte-identical image assets. Settings measures 488500 raw / 146890 gzip / 123318
Brotli bytes, within the existing limits. No budget increase was needed.

This verifies portable question/hazard records and activity navigation. Explicit
offline upgrade, historical simulation compatibility, illustrated-item PDFs,
and the remaining visual comparisons still require their own evidence.

## Illustrated fallback and actual print output

Generated question HTML now includes the reviewed illustration with neutral alt
text and the same phone/web responsive selection as the interactive player.
The no-JavaScript fallback keeps answer controls disabled. Browser coverage checks
both 384px and 1053px, loaded image dimensions, responsive delivery, no horizontal
overflow, and no postcommit requests. All 12 illustration cases pass across
Chromium/Firefox/WebKit; site and browser typechecks and full build pass.

`capture-print-illustrated.mjs` generates actual q091 packets using the released
inventory, count 3, seed `illustrated-print-158` (q048/q091/q024). It first downloads
the verified local pack, generates the packet, reloads the saved preview, verifies
the retained PNG data URL, waits for fonts/image decoding, and exports/rasterizes
Letter/A4 with normal and large/wide settings. `print-illustrated-audit/` retains
four PDFs, eleven inspected page rasters, and the capture manifest. All eleven
pages were visually inspected: the required tool features are visible; prompt,
image, and choices stay together; no text/image overlap or clipping was observed.
Letter normal: 2 pages; Letter large/wide: 4; A4 normal: 2; A4 large/wide: 3.
These are Chromium PDF observations, not physical printer certification.

Two confirmed follow-ups remain from this capture:
- The page estimate is still 1 (normal) / 2 (large), undercounting the actual
  illustrated packet. The estimator must account for required images and cover
  metadata without claiming exact pagination across all browsers.
- Generating this illustrated packet before downloading its required image fails
  with the generic generation error. The local-content requirement is enforced,
  but recovery must explain the missing download and offer the relevant action.

## Missing local print content recovery

The print builder now distinguishes a missing verified local content closure from
storage or unexpected generation errors. It focuses the existing error heading,
explains that the packet needs downloaded images or answer references, and opens
Downloads in a new tab. The original tab retains the count, repeat code, and other
settings for an explicit retry. The error state contains no raw receipt paths or
diagnostics, and it never creates an incomplete print preview.

The real q091 browser test now starts without downloaded content, encounters this
state, downloads the pack in the new tab, returns to unchanged settings, retries,
and verifies the retained illustration in the resulting preview. All three
browsers pass. All 37 print unit tests pass, including private-diagnostic rejection
and download-state focus. Site/browser typechecks and full artifact verification
pass without budget changes. The two real-state crops in
`print-download-recovery-audit/` were visually inspected at 1053px and 384px:
readable copy, visible action, and no overflow. The generic error remains for
unrelated failures. Illustrated page-count estimation remains a separate open fix.

## Illustrated question page estimates

Question packets now finalize their estimate from the assembled prompts, choices,
and required illustrations. The calculation uses the print type sizes, average
text width, block spacing, 3.5-inch image allowance, Letter/A4 dimensions, margins,
and opening metadata space. It packs whole question blocks where they fit and
adds separately started answer-key/explanation estimates. This remains an
approximation: actual word wrapping, fonts, and browser fragmentation can differ.
No content, option ordering, or set-pairing fingerprint is changed by estimation.

The four refreshed q091 PDFs now report estimates matching their observed page
counts: Letter normal 2, Letter large/wide 4, A4 normal 2, A4 large/wide 3. Their
four changed cover rasters were visually inspected; all seven other page rasters
are byte-identical to the earlier inspected captures. The manifest records both
estimated and observed values. This is evidence for these samples, not a promise
that every packet/browser has exact estimates.

Saved-print identity functions now live in `print/identity.ts`, allowing
persistence/import validation to use fingerprints without loading generation and
layout estimation. Their algorithms and serialized inputs were moved unchanged.
Settings decreased from 488500 to 475483 raw bytes (143382 gzip / 120640 Brotli),
with no budget increase; other study families also shed the unnecessary generator.
47 targeted print/Settings/registry tests and both typechecks pass. Full build and
artifact verification pass with the existing route/content/image invariants.
The complete print browser suite also passes: 33 cases across Chromium, Firefox,
and WebKit, including restoration, regeneration failures, separate/appended keys,
source-bound fact sheets, tool cards, hazards, and required-image recovery.

## Downloaded feedback with the origin disconnected

New browser tests use a dedicated HTTP origin and close its listening server and
connections after downloading and activating the current pack. This uses actual
network loss in all browsers. The illustrated test first visits q091 only after
shutdown, verifies the phone image has decoded, saves a flagged answer, reloads,
and opens its explanation and image through Review while still disconnected.

The historical test seeds exact archived version-3 custom question/hazard records,
downloads the current pack, and opens both historical explanations after shutdown
without any prior visit to those documents. It reorders set parameters and reloads
both explanations. Before the fix, Chromium fell back to the offline page because
the service worker normalized custom set parameters only on current paths. The
normalizer now also recognizes the historical version prefix; it still requires
same-origin navigation and exactly one set and position parameter, with no extra
parameters. Fourteen worker tests cover both path generations and rejection cases.

This establishes feedback availability from a newly downloaded current pack with
older saved records. It does not yet establish an in-place transition from an
installed version-3 service worker/pack or full historical simulation resumption.

After the fix, all six origin-disconnected browser cases pass across Chromium,
Firefox, and WebKit. Browser typecheck, all 14 service-worker tests, full build,
and artifact verification pass. Public item and image counts and bundle limits
remain unchanged.

The installed version-3 to version-4 upgrade is now separately verified in all
three browsers. `INSTALLED-PACK-UPGRADE-REVIEW.md` records the immutable prior
build, worker hashes, reproduction, saved-question restoration, and exact pinned
simulation resumption after the upgraded origin is disconnected.
