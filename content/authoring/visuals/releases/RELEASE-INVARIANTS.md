# Visual release invariants

The maintained inventories own stable concept IDs, taxonomy evidence, visual
requirements, and comparison membership. They do not own mutable authoring or
release lifecycle state.

Lifecycle status has one canonical representation:

- `tools.json` in this directory owns tool `productionStatus`;
- `comparisons.json` in this directory owns comparison `status`; and
- `scenes.json` in this directory owns scene `productionStatus`.

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
