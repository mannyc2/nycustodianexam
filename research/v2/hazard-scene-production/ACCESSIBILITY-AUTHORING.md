# Accessibility Authoring for Hazard Scenes

Evidence status: **CONFIRMED product constraints + standards guidance; authoring workflow is INFERRED and requires representative assistive-technology testing.**

## Core rule

The visual scene and the nonvisual equivalent should test the same source-backed concept, but they are not the same recognition construct and must be reported separately.

Before commitment, accessibility content must expose enough neutral observable information to make the task usable without revealing which observations are targets/decoys or how many targets exist. After commitment, the same stable zone order expands into explicit hazard/decoy explanations and sources.

W3C WAI guidance treats information-dense illustrations as complex images that generally need a short description plus a longer textual representation. This project adds a security boundary: the pre-answer long description must be **neutral**, while the answer-bearing full description is withheld from the active accessibility tree until submission succeeds.

## Authoring sequence

Do not write alt text as a final cleanup task. Author accessibility artifacts alongside zones and semantics:

1. freeze the candidate final static image;
2. define stable ordered zones;
3. list all materially observable facts in each zone;
4. write neutral pre-answer overview;
5. write neutral zone descriptions;
6. create the nonvisual equivalent task from those same observable facts;
7. write post-answer target/decoy explanations and full descriptions;
8. cross-check all text against final pixels and semantic manifest;
9. test with keyboard + representative screen reader;
10. test print/text-equivalent output.

If the accessibility editor discovers a condition that was not in the semantic inventory, the scene fails QA. The editor does not silently add a new hazard explanation after the fact.

## Pre-answer short description

The `<img>`/figure's short alternative should identify the content without interpreting it, for example:

> School hallway scene for a hazard-identification practice question. A detailed neutral description is available below.

Do not include:

- “hazardous” object names when that characterization is the answer;
- safe/unsafe labels;
- target count;
- “look at…” directional hints tied only to targets;
- key/correction language;
- target/decoy region IDs or semantic class names.

The exact presentation may use a figure + adjacent structured description rather than relying on one enormous `alt` string.

## Stable zone order

Every scene owns one ordered zone list used consistently by:

- neutral pre-answer description;
- nonvisual equivalent;
- post-answer full description;
- visual annotation numbering;
- print answer key;
- correction records.

Choose order from the scene's actual composition, then freeze it for the immutable version. A normal default is top-to-bottom, left-to-right within bands. Room topology can justify another order (for example doorway → passage → work area) if it is easier to understand. Record the rationale when it diverges.

Do not sort zones by “most hazardous first”; that would leak importance.

## Neutral observable-fact discipline

Neutral text should describe what a sighted learner can observe at the supported image resolution, without adding interpretation.

### Acceptable style

- “A two-step stepladder stands near the center shelving. One person's right foot is on the uppermost horizontal surface.”
- “A black power cord runs from the floor machine toward the wall. A short section of the outer covering near the plug is split.”
- “Several cardboard boxes sit on the floor in front of a wall-mounted extinguisher cabinet.”
- “A shallow irregular patch on the tile floor has a reflective wet appearance.”

### Avoid before commitment

- “The person is standing unsafely on the top step.”
- “The cord is dangerous.”
- “The extinguisher is blocked.”
- “There are three hazards.”
- “The wet floor should have a warning sign.”

The distinction is **observable condition vs safety interpretation**.

### Do not omit safe-but-suspicious facts

If the visual learner can inspect a decoy, the nonvisual learner needs the corresponding observable fact too. Otherwise the formats do not offer comparable discrimination opportunities.

Example: if a closed chemical bottle stored upright on a lower shelf is a decoy, the neutral description should mention the bottle and its observable placement without saying it is safe.

## Nonvisual zoned equivalent

Provide a separate interaction labeled as an equivalent knowledge task, not “the same visual question.”

Recommended v1 pattern:

- neutral scene overview;
- ordered zone headings;
- 1–4 concise observable statements per zone;
- a multi-select control asking which observed conditions need correction, with no announced target count and zero selections permitted;
- optional “no condition in this zone” behavior only if it does not structurally reveal how many target statements exist;
- explicit submit boundary;
- post-submit explanation mapped back to zone/statement IDs.

Do not make every target exactly one statement and every decoy exactly one statement if that regularity leaks answer count. Include sufficient safe observable facts to make selection a discrimination task rather than a counting exercise.

The nonvisual task can share concept tags/review scheduling with the visual scene, but progress analytics retain a `format` distinction.

## Post-answer full description

After successful commitment, disclose the answer-bearing layer in the same stable zone order.

For each target:

1. observable condition;
2. why it is unsafe/source-backed rule;
3. likely consequence at the level supported by the source;
4. immediate correction/control concept;
5. source citation/locator;
6. learner result: hit/miss where applicable.

For each authored decoy:

1. observable condition;
2. why it looked suspicious;
3. why it is safe **as depicted**;
4. what specific changed condition would make it unsafe;
5. source basis;
6. learner result if marked.

For a general false positive, avoid inventing a safety claim. State only that the mark did not match an authored unsafe condition and, if useful, name the neutral object/zone after reveal.

## Security boundary in markup

Before commitment, answer-bearing full text must not be present in:

- rendered DOM hidden by CSS;
- `aria-label`, `aria-describedby`, `title`, `data-*` or SVG metadata;
- accessible but visually hidden content;
- image filenames/URLs that name the hazard;
- public debug layers/classes/IDs;
- preloaded annotation SVG exposed to page inspection where the product's security policy prohibits it.

Offline packs necessarily contain answer keys; that does not permit the active page to expose them before submission. Presentation enforces the reveal boundary.

## Pointer, keyboard, zoom, and marker controls

The scene itself is a spatial surface, but surrounding controls must be easy to operate. WCAG 2.2 SC 2.5.8 sets a 24-by-24 CSS-pixel minimum or spacing rule for pointer targets, with exceptions including equivalent controls and spatially essential targets. The project should still aim for comfortably larger controls where feasible.

Required behavior:

- Add-marker mode operable by keyboard and pointer.
- Marker list exposes each current marker with Move/Remove actions.
- Moving a marker does not require drag; allow directional/nudge controls or a replace-position workflow.
- Pan/zoom has explicit buttons/controls; pinch is supplementary.
- Reset view is available.
- Focus remains visible and is not obscured by sticky controls.
- Submission and zero-mark confirmation are keyboard operable.
- After successful submission focus moves to the outcome/feedback heading.

A future implementation can test multiple exact marker-position mechanisms; R2.9 does not require a particular DOM renderer.

## Reflow and intrinsic 2D scenes

WCAG reflow guidance recognizes that maps/diagrams and other intrinsically two-dimensional content can require two-dimensional layout. The surrounding page still reflows, and the scene gets its own bounded pan/zoom region rather than forcing the whole viewport into horizontal scrolling.

At high zoom/small viewports:

- keep critical actions reachable outside the panned canvas;
- announce current zoom level where useful;
- do not hide the alternate nonvisual route;
- preserve logical marker coordinates independent of display zoom.

## Color, contrast, and print

Pre-answer hazards cannot depend on color alone. This is stronger than merely applying accessible annotation colors because there are no correctness annotations before commitment.

Scene production should pass:

- grayscale review;
- forced-colors/high-contrast UI review for controls/overlays;
- low-ink print review;
- decisive-feature visibility without relying on red/yellow/green;
- no tiny text labels as the only safety cue.

After reveal, combine color with shape/pattern/icon/text, for example a numbered solid outline plus “Missed hazard” text.

## Phone readability

Review at the actual supported small-phone layout, not only by zooming a desktop image.

For each target/decoy record:

- visible bounding size before user zoom;
- whether the decisive feature is recognizable at fit-to-width;
- maximum number of zoom/pan actions reasonably needed;
- whether target and neighboring semantic regions remain separable;
- whether neutral zone text can locate the general area without giving the answer.

A target whose decisive feature is effectively invisible until extreme zoom is a composition failure, not a hotspot problem.

## Human figures

When people appear, neutral text can describe observable pose/contact while avoiding intent or unsafe interpretation. Use role-neutral descriptions where identity is irrelevant. Avoid adding demographic detail that the scene does not need for the tested concept.

Example:

- Neutral: “A person holds a box in front of their torso; the top of the box reaches above the person's chin.”
- Post-answer: Explain the source-backed visibility/material-handling issue only if the underlying claim is admitted and supported.

## Localization

Canonical technical/safety content remains English under the product contract. Reviewed translations may be added later, but a translation cannot change:

- zone/region identity;
- target/decoy classification;
- claim/source truth;
- correction meaning;
- scoring.

Machine translation alone is not labeled authoritative/reviewed.

## Release checklist

A scene cannot publish until reviewers can answer yes to all:

- Neutral short description identifies the scene without answer leakage.
- Neutral zone descriptions cover material visible facts including decoys.
- Target count is not inferable from headings/structure/wording.
- Full descriptions are absent from active pre-commit accessibility tree.
- Visual annotation numbering and text zone order are identical after reveal.
- Nonvisual equivalent tests the same underlying concepts and is labeled as an equivalent format.
- Keyboard-only attempt/submit/review flow succeeds.
- Representative screen-reader flow succeeds.
- Marker controls do not require precision dragging or multi-touch.
- Small-phone zoom/pan and controls pass.
- Grayscale/print pass.
- No description introduces an unauthored hazard or contradicts the final pixels.

Failures map to the `HSP-ZONE-ORDER`, `HSP-DESC-LEAK`, `HSP-DESC-DIVERGENCE`, `HSP-NONVISUAL-NONEQUIV`, `HSP-PHONE-FAIL`, `HSP-PRINT-FAIL`, and `HSP-ANSWER-LEAK` codes.
