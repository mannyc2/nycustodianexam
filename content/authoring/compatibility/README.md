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

The version-4 inventory is staged for the next release, not yet consumed by page
generation. Before changing q091, wire historical generation, retained artifact
publication, offline inventory, and trusted receipt registry to it, then verify
actual old saved answers and unfinished simulations through the release upgrade.
