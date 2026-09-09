# Hazard composition visual regression

Current application source: `933d11255311795fa7a0c75026842401bdd8cb16`; prior capture source: `f8d8bc84ce7790a2192b41074a5947d55b3d4363`. Capture script gained an output-directory override only. All 16 captures completed with zero page errors and no horizontal overflow at 1042/384 CSS widths.

Fourteen capture SHA-256 values match `../hazard-review-current/manifest.json` exactly; those identical PNGs are retained there rather than duplicated. The two changed full-page PNGs are retained here. Dimensions remain 1042×4367 and 384×6223. Pixel differences are bounded to (316,700)–(388,759) desktop and (187,1021)–(267,1031) compact, entirely within viewport controls. Every pixel outside those bounds is identical. Before/after control crops were inspected: no observed change in labels, wrapping, spacing, control dimensions or clipping. No cause is assigned to the small raster differences.

This extends the previous focused missing-state/notice acceptance with a current-build regression comparison. It does not certify all long saved-page content, open source disclosures, Practice/Simulation variants, physical devices or assistive technology. Capture log: `/tmp/nyc-hazard-composition-capture.log`.

The subsequent `full-visual-page-review.json` records readable-scale inspection of both complete visual saved-page captures, including their long explanation sections. It supersedes the earlier statement that these particular two saved pages had only control-crop inspection. The recorded desktop column limitation and uninspected variants/disclosure states remain open.
