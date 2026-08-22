# Human mechanical review packet

## Purpose

This packet prepares exact questions for qualified reviewers. It does not answer those questions and does not impersonate mechanical, custodial, accessibility, or rights expertise.

## Review prerequisites

Do not begin signoff until the exact archive and POC source are recovered and every reviewed object is pinned by:

- parameter-record SHA-256;
- model-source SHA-256;
- environment/container digest;
- STEP/STL/GLB/SVG hashes;
- camera/render record hash;
- rights-evidence hash;
- current taxonomy revision.

Allowed outcomes are `passed`, `failed`, `needs rework`, `blocked by evidence`, and `blocked by rights`.

## Common model questions

For every POC, the reviewer must assess:

1. Are units and coordinate axes explicit and correct?
2. Is the component count mechanically meaningful?
3. Are expected contacts present and prohibited intersections absent?
4. Are clearances plausible across the displayed state or articulation range?
5. Does STEP re-import preserve topology, units, component identity, and bounds?
6. Are review meshes watertight and faithful to the B-rep rather than silently repaired into a different shape?
7. Are all editorial dimensions identified rather than presented as standard dimensions?
8. Is the model generic enough to avoid one SKU/trade dress while remaining mechanically recognizable?
9. Does the fixed scored view reveal the intended feature without adding unintended clues?
10. Are profile, feature, print, and phone-size renders legible without false geometry?

## Adjustable wrench

- Are the gripping faces truly smooth and parallel over the useful jaw span?
- Does the movable jaw translate in a mechanically plausible guide?
- Is the worm located, oriented, and engaged plausibly?
- Are worm diameter, pitch, tooth/profile, and guide clearance defensible?
- Does the jaw open over a plausible range without impossible collision or detachment?
- Does any contour, serration, hook, or offset make it resemble a pipe wrench?
- Are handle thickness and cross-section plausible and non-SKU-specific?

## Pipe wrench

- Are the hook jaw and body/heel jaw separate and mechanically plausible?
- Are opposing serrations visible, correctly oriented, and sized for the modeled scale?
- Is tooth pitch/profile defensible rather than decorative?
- Is the throat open and offset without impossible fusion across the gripping region?
- Does the adjustment mechanism move/support the hook jaw plausibly?
- Are jaw offsets, body taper, clearances, and display pose realistic?
- Does any smooth parallel jaw pair make it read as an adjustable wrench?

## Cup plunger

- Is the cup/bell profile representative of a plain cup plunger rather than a toilet flange plunger?
- Is the rim continuous, open, and free of a lower protruding flange?
- Are cup diameter, depth, curvature, and wall thickness plausible?
- Is handle insertion depth and attachment plausible?
- Does a rigid display pose falsely imply material behavior or seal geometry?
- Is the decisive no-flange feature visible in the fixed view without needing rotation?

## Flange plunger

- Is the lower flange a real continuation/attachment of the rubber assembly rather than a floating or decorative ring?
- Are flange diameter, height, thickness, curvature, and transition to the cup plausible?
- Is the flange visible in the fixed feature/scored view at phone and print sizes?
- Does the display pose account for flexible/deformable material without claiming one universal resting shape?
- Is handle insertion/attachment plausible?
- Could the flange be mistaken for a rendering artifact or hidden cup rim?

## Review evidence to return

The reviewer should return:

- outcome for each exact hash set;
- annotated view references;
- parameter-level corrections;
- required geometry changes;
- unresolved evidence requests;
- whether re-review is needed after each change;
- name/role/competence statement and review date.

A visual impression such as "looks good" is not sufficient.
