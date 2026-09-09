# Retained release history

`launch-v1-v3-review.json` is the currently consumed version-3 history inventory.

`launch-v1-v4-review.json` preserves the current version-4 inventory before the
next content revision. Its provenance identifies the exact committed Settings
source and SHA-256. Only the current inventory was extracted; nested previous
inventories are deliberately excluded. All 286 question-step feedback receipts
and all 109 question/scene stimulus receipts were checked against the rebuilt
version-4 artifact bytes when archived.

`launch-v1-v4-artifacts/questions/q091.*.json` retains the exact original version-1
q091 stimulus and feedback bytes. Their lengths and hashes are bound by the
inventory and checked by `apps/site/test/historical-question-artifacts.test.ts`.
Other unchanged historical items may reuse release artifacts only after their
exact receipt hashes and lengths have been checked.

These files are authoring-side compatibility inputs. The postcommit file contains
original-practice feedback and must never enter an initial document, executable
bundle, or safe precache. It may only be published as an item-scoped postcommit
artifact subject to the existing durable-commit-before-read boundary.

Page generation, trusted registry assembly, and artifact verification now select
all archived inventories older than the current pack version through
`scripts/release-history.ts`. Version 4 is excluded while it remains current;
version 5 will include both retained inventories. Exact artifact hash/length
checks remain mandatory. Historical question files missing from the current
manifest resolve to retained files under the corresponding archive directory.
The build validates their bytes before loading original stimuli or publishing
feedback, adds them to the public manifest and explicit offline download, and
rejects any collision with different bytes at the same URL. Historical pages
resolve stimuli by the saved artifact path, never merely by current item ID.
The artifact verifier checks the published historical bytes and includes retained
feedback in its pre-answer leakage scan.

Synthetic version-5 tests exercise revised q091 paths, exact retained bytes,
unchanged-item reuse, and URL collision rejection. Actual version-5 browser,
offline, import, and unfinished-simulation upgrade verification remains required
when the revised content is published.
