# Visual authoring policy

**Status:** maintained production authority, adopted 2026-08-23.

This document controls production of isolated-tool illustrations, confusable
comparisons, and hazard scenes. It supersedes any R2.9 recommendation or
recovered pipeline language that requires deterministic SVG/CAD/3D artwork or
excludes native image generation from the controlling route.

## Decision

Use **Codex-native image generation** to author the site's production artwork.
The accepted, reviewed raster bytes—not a prompt, seed, SVG, CAD model, or
claimed model rerun—are the visual source of truth.

- Generate isolated tools and hazard scenes with Codex image generation.
- Keep the generated output raster-native. Do not trace or convert isolated
  tools to SVG merely to satisfy an older pipeline.
- Do not repair the four recovered R2.10 CAD/SVG POCs into production art. They
  are closed research evidence and retired production-art candidates.
- Do not add image-generation dependencies to the application, compiler, or
  browser runtime. Generation is an editorial production activity; reviewed
  image files are ordinary immutable content inputs.
- Keep every Tier A/B taxonomy concept in launch scope. Production sequencing
  may prioritize difficult/confusable concepts, but it is not a scope cut.

## Public sample style reference

Publicly released official sample artwork may be supplied to Codex as a
**visual-style reference**. The production brief should say plainly that the
desired artwork should copy or closely match the sample's high-level visual
language, including its monochrome line quality, contour weight, sparse interior
detail, restrained hatching, whitespace, object scale, view economy, and plain
test-booklet presentation.

That permission is limited:

- use only material the agency has publicly released;
- use it for visual language, not for item content;
- do not trace, reconstruct, or reproduce a sample's particular tool drawing,
  scene composition, answer choices, labels, or other expressive arrangement;
- do not use secure, remembered, candidate-recalled, or rights-unreviewed FOIL
  examination material as an input or brief;
- create original subject geometry and composition from the maintained taxonomy
  and independently sourced visual facts; and
- reject output that is confusingly close to a particular released drawing or
  implies that the site is official.

The repository's exam-security boundary remains absolute. A public style
reference does not authorize storing or describing nonpublic test content.

## Production brief

Every generation request must have a versioned brief containing:

- stable concept, comparison, or scene ID;
- current taxonomy revision;
- independently supported visual facts and source coordinates;
- decisive `must_show` features;
- confusable `must_not_show` features;
- desired view, pose, crop, aspect ratio, and background;
- the approved public style-reference asset and its public provenance, when
  used;
- prohibitions on text, pseudo-text, brands, logos, watermarks, answer labels,
  arrows, circles, color-only cues, and irrelevant props;
- requested output count and native dimensions; and
- prompt/brief version plus the resulting candidate IDs.

For an obscure or mechanically difficult tool, the brief must be strengthened
with reliable diagrams, manuals, standards-backed facts, original observation,
or independently rights-cleared references before generation. A plausible-
looking image is not evidence that the tool is correct.

## One image versus a batch

Use one-image generation by default for the first production pilot and whenever
a concept is obscure, confusable, mechanically difficult, or repeatedly wrong.
This gives each asset the full native canvas and makes correction/review clear.

Multiple images or a contact sheet are allowed only after a measured pilot
records the actual native Codex output dimensions and shows that:

- each tile retains enough native pixels for the smallest phone and print use;
- every tile can be independently cropped without shared borders, labels, or
  style/feature bleed;
- hard tools are not materially less accurate than one-image generation; and
- the rejection and cleanup rate is no worse than the one-image route.

Do not choose a tile grid from assumed dimensions. Measure the exact output
first, reserve crop/bleed margins, then calculate the largest grid that meets the
accepted per-asset pixel floor. A batch is an authoring convenience, never one
indivisible scored asset.

## Isolated-tool acceptance

Each final tool image is reviewed independently. It must:

1. depict the correct family/subtype and plausible part count/relationships;
2. show every required decisive feature at the intended phone and print size;
3. omit every forbidden confusable trait;
4. contain no invented mechanism, duplicated/fused/floating component,
   impossible connection, unsafe-use context, text, brand, or answer cue;
5. remain generic rather than copying one product's decorative contour or trade
   dress;
6. match the approved style reference closely enough to belong to the same site
   library without reproducing a particular released drawing;
7. pass content/mechanical-plausibility, rights/similarity, accessibility,
   security, and phone/print review; and
8. have exact accepted-master and delivery-derivative hashes recorded.

Confusable-pair panels are composed from two independently accepted images.
Matched scale and view are presentation decisions; neither member may borrow the
other member's decisive feature.

## Hazard-scene acceptance

Before generation, author a semantic scene manifest containing the supported
claim, target/decoy/safe-background inventory, negative-hazard inventory, zone
order, and composition constraints. After generation, the final pixels control
what is actually visible.

A scene fails if it has any missing or ambiguous target, accidental hazard,
unsafe decoy, impossible meaning-bearing geometry, answer emphasis, invented
text/signage, or mismatch between image, manifest, regions, and descriptions.
Human-author hotspot regions against the accepted final image; do not infer them
at scoring time. A changed image requires region and accessibility re-review.

## Candidate correction

Prefer regeneration when the class, silhouette, mechanism, part count, decisive
feature, pose, or scene composition is wrong. A tightly bounded raster edit is
allowed when the intended pixels are unambiguous and the edit is recorded. Any
visible edit creates a new candidate hash and repeats all affected reviews.

Never use an older deterministic rendering as semantic authority over visibly
different accepted Codex output. Deterministic SVG/3D material may be used as
internal research or a project-owned structural reference when helpful, but it
does not control the production pixels.

## Identity, lineage, and delivery

For every accepted image preserve:

- original generated master bytes and SHA-256;
- native width, height, color space, and format;
- exact prompt/brief and public reference coordinates;
- generator surface/model identifier exposed by the production system, if
  available, without pretending unavailable coordinates exist;
- candidate selection and edit lineage;
- reviewer/date/verdict records;
- neutral pre-answer and full learning descriptions;
- rights/similarity and answer-leak decisions;
- web/print derivative settings and hashes; and
- immutable content/asset version referenced by questions and historic attempts.

Exact regeneration is not a release requirement. The accepted bytes are
preserved. Deterministic delivery means the compiler emits derivatives and packs
from those pinned bytes reproducibly; it does not mean an image model must
recreate them.

Strip nonessential metadata and use opaque delivery names. Pre-answer filenames,
metadata, DOM, accessibility data, source maps, manifests, or alternate assets
must not reveal the answer.

## Initial production pilot

Before bulk generation, run the current R2.9 pilot revised around this policy:

- difficult and confusable isolated tools, including the two recovered POC
  pairs, plus representative simple and obscure tools;
- representative hazard scenes across every maintained hazard family;
- one-image generation first;
- a small multi-image trial only after native dimensions are measured; and
- blind technical, style, accidental-hazard, accessibility, phone/print, and
  rights/similarity review.

The pilot selects prompt/reference packaging, working dimensions, and safe batch
size. It does not decide whether Tier A/B concepts launch; they remain launch
scope.
