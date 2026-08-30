# Visual release invariants

The maintained inventories own stable concept IDs, taxonomy evidence, visual
requirements, and comparison membership. They do not own mutable authoring or
release lifecycle state.

Lifecycle status has one canonical representation:

- `tools.json` in this directory owns tool `productionStatus`;
- `comparisons.json` in this directory owns comparison `status`; and
- `scenes.json` in this directory owns scene `productionStatus`.

`scenes.json` is also the single accepted semantic authority for each current
hazard scene. Its schema/version 2 records own the target and decoy regions,
neutral pre-answer description, ordered explanations, evidence claims, and
self-contained source-line receipts. `regions.json` and `accessibility.json`
are mechanically derived authoring/review projections; the content compiler
does not join them back into the release.

Current scene source receipts retain the broad authored source locator and
scope alongside each exact source-line locator. A source line reused across
scenes carries one globally consistent `supportedClaimIds` set, reciprocal
with every generated claim that cites it.

Candidate-selection, lineage, review, and historical-source fields remain
evidence. They do not override the active release ledgers. A superseded release
remains immutable in `tool-release-history.json` and does not become active
again through an inventory edit.

`../inventory/taxonomy-inventory.csv` preserves the established 65-row input.
Its source ZIP hash, internal member hash/path, observation date, and explicit
line-ending normalization are recorded in
`../inventory/taxonomy-inventory.provenance.json` so the maintained inventory
does not depend on the historical ZIP remaining in the working tree.

Run the read-only release gate with:

```sh
node content/authoring/visuals/releases/verify-visual-release.mjs
```

The tool builder invokes its gate after writing release records and manifests;
the scene builder does the same once independent review is fully accepted.
Pending scene-review packets remain buildable. The tool builder also rejects
lifecycle fields in inventories before touching release output.

The launch content compiler consumes all 14 accepted comparison records. It
requires every panel member and recorded member-master hash to close exactly
over the active accepted tool releases, publishes the ledger's exact
`scoredUseGate`, and includes the accepted comparison derivatives in the
delivery asset manifest. A comparison with a nonempty scored-use gate remains a
crawlable atlas reference but cannot authorize a scored distinction question.
