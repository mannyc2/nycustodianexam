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
