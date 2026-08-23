# Visual pilot v2 review receipt

- Date: 2026-08-23
- Scope: six alternate tool views, three monochrome scene replacements, and four new hazard/control scenes
- Generation mode: Codex built-in `image_gen`, one complete native raster per call
- Independent result: 13 pass, 0 provisional, 0 reject
- Promotion status: candidate-only; no accepted master, release record, hotspot, or question binding changed

## Verdicts

| Candidate | Concept | Verdict | Note |
| --- | --- | --- | --- |
| v2t001 | Adjustable wrench matched profile | Pass | Opaque-white normalization preserved coherent geometry. |
| v2t002 | Pipe wrench matched profile | Pass | Single assembled-packshot reference produced one horizontal traditional pipe wrench with one threaded shank, one knurled nut, and opposed serrated jaws. A blinded review and separate assembled-reference mechanism adjudication both passed the naturally occluded connection at native and 320-pixel sizes. |
| v2t003 | Cup plunger underside | Pass | Empty uninterrupted cup opening is clear. |
| v2t004 | Flange plunger underside | Pass | Projecting lower flange is clear. |
| v2t005 | Slip-joint pliers face view | Pass | Regeneration shows one pin at the left end of one continuous oblong slot and visibly empty slot length to the right. |
| v2t006 | Tongue-and-groove pliers face view | Pass | Multi-position channel and offset serrated jaws are clear. |
| v2s001 | Unidentified closet container replacement | Pass | One blank target; safe jugs use hatched identification panels. |
| v2s002 | Chemicals over foodware replacement | Pass | Above/below storage relationship is unambiguous. |
| v2s003 | Zero-hazard classroom replacement | Pass | Ladder, fan, aisle, and doorway remain safe; metadata claims protection only for the visible floor-level cord run. |
| v2s004 | Hose-across-gym-lane scene | Pass | Hose is the sole visible hazard; final metadata omits the unprovable caster-brake state. |
| v2s005 | Chemical stored with cups scene | Pass | Image edit added the missing nonreadable identification panel to the separate safe jug. |
| v2s006 | Damaged fan-cord scene | Pass | Regeneration clearly exposes exactly two insulated conductors at phone size; metadata uses the pixel-true location along the wall-edge run. |
| v2s007 | Zero-hazard loading-area scene | Pass | Pallet, hand truck, cabinet, floor, and doorway are visibly safe; metadata does not invent a marked lane. |

## Package

- `lineage.json` records exact final prompts, prompt hashes, generated-source paths, native image profiles, candidate hashes, edit lineage, and unsuccessful attempts.
- `CANDIDATES.sha256` pins the 13 review-candidate files.
- `TOOLS-PHONE-CONTACT-SHEET.png` and `SCENES-PHONE-CONTACT-SHEET.png` show the intended small-screen review sizes.
- `TOOLS-PRINT-CONTACT-SHEET.png` and `SCENES-PRINT-CONTACT-SHEET.png` provide larger grayscale review sheets.
- `independent-review.json` is the final per-candidate gate against exact hashes.
- `accessibility-draft.json` binds neutral, full, and nonvisual-equivalent authoring copy to the exact 13 candidate hashes.
- `regions-draft.json` binds target/decoy polygons to all seven exact scene hashes and records coordinate/count/non-overlap validation.
- `REGION-OVERLAYS-CONTACT-SHEET.png` is the red-target/blue-decoy maintainer review sheet; overlays are authoring-only and never learner-facing.
- `pipe-wrench-bakeoff/PHONE-CONTACT-SHEET.png` records the pipe-wrench comparison at 320 pixels. Its order is top row `v2t002-e1`, `v2t002-b1`, `v2t002-b2`, `v2t002-b3`; bottom row `v2t002-b4`, selected `v2t002-b5`, `v2t002-e4`, accepted reference master `t037`.
- `pipe-wrench-bakeoff/REVIEW.json` records the six exact prompts, source paths, hashes, reference strategies, blinded comparisons, split-verdict adjudication, and final selection.

The pipe-wrench experiment used two immutable bake-off briefs and six one-shot generations/edits. The first round showed that full patent and same-subject style references dominated composition and reproduced unwanted loop/rack geometry. The successful second-round setup used one assembled product packshot for anatomy only and expressed composition and monochrome style in text. Manufacturer evidence also corrected an earlier bad constraint: a short rounded threaded shank end beyond the nut is normal traditional geometry and must not be rejected by itself.

## Promotion gates

All 13 candidates have cleared the visual gate, but the accessibility and region files remain hash-bound authoring drafts requiring maintainer approval. Decide whether each alternate tool view is scored, atlas-only, or post-answer-only; link a reviewed nonvisual item for every scored image; preserve zero-target submission behavior; and complete keyboard/screen-reader, pan/zoom, phone, print, and answer-leak review. Promotion must use a new immutable content version and must not overwrite the existing accepted raster masters.
