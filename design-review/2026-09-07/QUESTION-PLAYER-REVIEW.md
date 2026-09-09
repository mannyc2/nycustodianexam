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
