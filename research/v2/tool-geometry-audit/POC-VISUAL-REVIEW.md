# POC fixed-view visual review

## Scope

This is an internal research inspection of the exact recovered PNG/SVG views. It
is not a qualified mechanical certification or a release-art approval.

## Common observations

- All assets are monochrome, static, and free of branding, official artwork, or
  answer annotations in the individual delivery files.
- The preview identifies the research IDs, but those labels are not embedded in
  the individual scored-view candidates.
- The two wrenches are distinguishable: one has smooth parallel jaws and a worm;
  the other has offset serrated hook/heel jaws.
- The two plunger feature views distinguish a plain cup from an extended flange.
- The style is a sparse CAD hidden-line proof rather than a polished test-style
  illustration.

## `t0004` adjustable wrench

Three-quarter and profile views are recognizable and the feature view exposes the
jaw/worm arrangement. The abstract block geometry and simplified guide/worm
mechanism would need mechanical/art-direction review before any shipping use.

Result: suitable POC evidence; not selected for production.

## `t0005` pipe wrench

The open throat and serrated opposing jaws distinguish it from the adjustable
wrench. The handle/body and adjuster remain highly simplified and the tooth form
is editorial.

Result: suitable POC evidence; not selected for production.

## `t0006` cup plunger

The close feature view clearly depicts an open plain cup. At a 320 px inspection
size, the profile and three-quarter renders contain only 8 and 16 dark pixels
respectively after the recorded thresholding probe; the long handle and thin
lines nearly disappear. The combined review mesh is also not watertight.

Result: reproducible but requires model/view rework; not selected for production.

## `t0007` flange plunger

The feature view depicts an extended lower flange, but the full profile and
three-quarter views contain only 5 and 4 dark pixels respectively at the same
phone probe. The rigid display shape is not evidence of one universal flexible
resting pose.

Result: reproducible but requires model/view rework; not selected for production.

## Final disposition

All four artifacts are accepted as POC/pipeline evidence. Their production-art
candidacy is closed. The maintained Codex-native workflow will create new final
illustrations, and may use these POCs only as internal mechanical/reference
material after ordinary provenance review—not as mandatory controlling geometry.
