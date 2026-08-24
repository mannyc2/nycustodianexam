# Tool/PPE visual release receipt

- Date: 2026-08-23
- Tool/PPE concepts accepted: 65
- Comparison layouts accepted: 14
- Native master policy: byte-identical promotion of reviewed generated candidates
- Delivery profiles: 960 px web, 320 px phone, 640 px grayscale print
- Comparison profile: 1254x627 native composition with 960x480 web/print and 640x320 phone derivatives
- Review reconciliation: Codex release reconciliation using hash-bound candidate review receipts
- Lifecycle-status authority: content/authoring/visuals/releases/tools.json and comparisons.json
- Canonical inventory provenance: content/authoring/visuals/inventory/taxonomy-inventory.provenance.json
- Superseded release records preserved: 2
- Release history: content/authoring/visuals/releases/tool-release-history.json
- Manifest: content/assets/TOOL-MANIFEST.sha256
- Read-only verification: node content/authoring/visuals/releases/verify-visual-release.mjs tools

All 65 tool release records have productionStatus=accepted. All 14 comparison records have status=accepted. Inventories define stable concepts and requirements and intentionally contain no mutable lifecycle-status fields. Pipe-wrench asset t037 is revision 2, promoted byte-identically from v2t002-b5 after blinded phone/native and reference-based mechanism review. Its prior revision and the affected p002 comparison revision remain immutable, hash-verified history. Specialist/scored-use gates remain attached to the affected content records and do not imply universal silhouettes or unsupported scope.
