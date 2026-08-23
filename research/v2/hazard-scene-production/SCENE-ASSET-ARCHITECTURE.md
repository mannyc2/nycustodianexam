# Codex-native scene asset architecture

**Status:** reconciled with maintained visual authority.

Codex-native image generation creates the artwork. One semantic contract links
the authored safety meaning, the accepted final pixels, the human-authored
interaction regions, and the accessibility descriptions.

## Three authorities that must agree

### Semantic scene manifest — intended meaning

Author before generation:

- stable scene/family/version ID and applicable profile;
- exact source-backed claim IDs and correction concept;
- environment, logical aspect ratio, and composition constraints;
- ordered zones;
- each intended instance classified as target, decoy, safe background, or
  structural background;
- why each decoy is safe exactly as intended;
- explicit negative-hazard inventory;
- required and forbidden visual cues;
- neutral/full description units;
- rights/provenance coordinates; and
- review states.

The answer-bearing manifest is internal and must not enter pre-commit learner
surfaces.

### Accepted final raster — visible truth

The accepted Codex output (or its reviewed edited revision) controls what the
learner actually sees. It must be preserved at exact bytes and reviewed for
semantic closure, accidental hazards, ambiguity, style, phone/print legibility,
rights/similarity, and answer leakage.

A correct brief does not rescue incorrect pixels. A scene fails when the final
image adds, removes, merges, hides, or changes a meaning-bearing object or
relationship.

### Region/zone map — interaction truth

Author normalized regions only after final-image acceptance. Register them to
the exact logical image plane. Runtime scoring uses those authored regions and
never runs computer vision. Follow `ZONE-HOTSPOT-CONTRACT.md`.

## Codex production route

1. Select an admitted claim and complete the semantic manifest.
2. Assemble a versioned generation brief and approved public style reference.
3. Generate one full-canvas image by default.
4. Perform technical/semantic/style review; regenerate or tightly edit failures.
5. Freeze the accepted master bytes and hash.
6. Author regions and neutral/full accessibility records.
7. Run independent accidental-hazard, rights/similarity, security, phone, print,
   and nonvisual-equivalent review.
8. Emit opaque web/print/offline derivatives and record hashes.
9. Publish only when the compiler sees a closed review graph.

The old SVG, Blender, 3D+cleanup, and human-blocking routes may supply internal
references in an unusual difficult case. They are not required production routes
or fallbacks, and their outputs do not override the final reviewed pixels.

## Negative inventory

Every scene explicitly checks for unintended:

- slips/trips: spills, raised mat edges, cords/hoses, clutter;
- egress/fire: blocked routes, doors, or equipment;
- chemical: misleading containers, mixing, splashes, or PPE implications;
- electrical: damaged cords/plugs, water interaction, unsafe routing;
- sharps: glass or protruding material;
- material handling/storage: unstable stacks, loads, falling objects;
- biological/sanitation: contamination or cross-contamination cues;
- machine/tool: damage, missing guards, unsafe setups;
- correction leakage: the intended fix already shown; and
- security/accessibility: text, color, emphasis, or metadata that gives away an
  answer.

Zero unresolved findings are allowed. An unmentioned background object is not
presumed safe.

## Scene families and variants

Variants may change room, camera/framing, target location, safe clutter, decoy,
or person orientation while preserving one supported rule. Review every variant
independently; never reuse hotspot coordinates blindly. Avoid repeated locations
or templates that teach position instead of principle.

Changing the actual safety condition creates a new semantic version, not merely
a transfer variant.

## Identity and delivery

Keep separate immutable identities for semantic manifest, accepted master,
regions, accessibility record, derivatives, QA results, and item references.
Historic attempts keep their pinned versions.

Learner packs contain only reviewed opaque static images plus the minimum
content, region, and accessibility data required by the player. Prompts, public
references, candidate rejects, answer-bearing internal manifests, edit layers,
and generator history remain build/editorial evidence.

Deterministic build output begins with the accepted master bytes. Model reruns
are not part of the build.
