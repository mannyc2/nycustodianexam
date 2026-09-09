# Hazard builder integration

September 9 implementation following `731d615`.

The Hazard page now offers 1, 5, 10 or all 18 scenes, visual marking or written
zones, and a bounded repeat code. Each control affects the launched drill.
The generator uses only released neutral scene inventory. Visual and written
drills share scene order but have distinct durable response identities.

Canonical scene documents carry the safe drill inventory. The player checks the
custom set position, canonical route, mode, scene and full receipt before
starting the existing controller. Previous/Next retain the drill configuration,
and the hydrated heading retains its true position. Saved activity reconstructs
both modes; Review reconstructs visual feedback, preserving the existing rule
that written-zone responses do not enter the visual-hazard review queue.

Validation:

- 14 Chromium tests passed across Hazard builder/player and Practice builder:
  real save/navigation/history in both modes, visual Review, image failures,
  zero-marker confirmation, durable-before-fetch, persistence failure, feedback
  mismatch, keyboard controls and Blob URL lifecycle.
- 26 focused unit tests passed; workspace and browser-harness typechecks passed.
- Site build succeeded; updated artifact verification passed. Hazard-index is
  now explicitly an interactive reference route with substantive static links.
  Its safe bootstrap must equal Review's independently release-validated scene
  inventory. No answer-bearing fields are permitted.
- Shared closure budget is 485000 raw / 146000 gzip / 123000 Brotli bytes,
  including exact custom question and hazard receipt reconstruction. Settings
  measured 484180 raw bytes when introducing the hazard resolver.

Captures: `hazard-builder-screenshots/manifest.json`, with visual one/all and
keyboard five scenes at 1053 and 384 CSS viewport widths, plus viewport captures.
Element crops omit the fixed bottom navigation to avoid overlay artifacts;
viewport captures retain it. Zero page errors. Compared against reference 29:
ruled count/task controls, scope note, summary and bordered repeat disclosure are
present. Native selected marks intentionally remain visible. The scope note
explains the actual scene inventory instead of repeating question-bank copy.

Remaining: full-page composition (the original scene intro/direct links remain
above the builder), final desktop/compact fidelity audit, custom-drill offline
and import/export coverage, and the remaining player/page families. This is
functional integration evidence, not complete visual or release certification.
