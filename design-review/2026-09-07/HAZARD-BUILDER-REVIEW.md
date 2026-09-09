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


## Page composition follow-up

The interactive Hazard page now leads into the custom drill builder. The old
large hero and fixed scene-one launch buttons no longer precede its controls.
A concise page heading explains saved-response feedback; setup-mode links retain
their real destinations. Direct visual/keyboard scene-one links remain inside
the generated fallback mount and are replaced only when the builder renders.
The environment inventory is available in a native disclosure below the builder.

Reference 29 was compared with the updated 1053-CSS-pixel capture (the supplied
PNG is a scaled element capture). The builder heading now uses 20px text, the
first fieldset no longer inherits an extra top margin, and the scope note has
explicit paragraph/link spacing. The real 18-scene scope copy remains instead
of the prototype's question-bank paragraph. The shell, breadcrumb, and concise
page heading are app-level context outside that reference's setup specimen.
No dedicated compact setup reference was supplied.

`hazard-composition-screenshots/` retains visual-one, all-scenes, and keyboard-five
states at 1053/384 widths, plus no-JavaScript fallback captures at both widths.
Viewport captures explicitly scroll to the page top after the element capture.
The script checks no horizontal overflow, no competing fixed start link after
hydration, and working direct visual-scene navigation without JavaScript. All
captures completed without page errors. Desktop/compact page-top captures and
compact fallback were visually inspected. Nine hazard-builder browser checks
passed across three browsers, including cached keyboard-drill reopening; the
final spacing-only changes were followed by a successful build and fresh captures.

The question Practice builder's page composition and final setup summary
comparison remain separate work. This change does not certify every setup state.
