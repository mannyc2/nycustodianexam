# Workspace Integration

> **Current route notice:** Codex-native generation now supplies accepted raster
> masters outside the application workspace. Any SVG/Blender/generative-R&D
> routing below is historical. The reusable integration rule is that the content
> compiler validates and transforms pinned reviewed masters; no image generator,
> Blender runtime, or model dependency belongs in learner builds.

Evidence status: **INFERRED handoff constrained by the maintained Bun/Effect architecture direction.**

R2.9 is a content-production architecture lane. It does not scaffold the application, select the final child workspace graph, or add production dependencies.

## Current coordinates

At the R2.9 research coordinate:

- Bun current stable: `1.4.0`;
- Effect current v4 coordinate: `effect@4.0.0-rc.111`, an RC prerelease;
- Blender current LTS/stable coordinate: `5.2.0 LTS`.

Refresh and pin these at implementation/pilot time. R2.9 did not install packages, run Blender, or create an Effect fixture because no code-level Effect claim was required.

## Integration principle

Scene authoring is a **build/content-production capability**, not a browser runtime dependency.

The browser should receive only reviewed immutable publication artifacts:

- final static scene derivative;
- stable scene/item/version IDs;
- normalized zones and target/decoy regions required for local scoring;
- neutral pre-answer accessibility content;
- answer-bearing full descriptions/explanations available to the content pack but withheld from active pre-commit presentation;
- source/claim references;
- deterministic checksums and content-pack linkage.

It should not receive Blender source files, layered authoring files, project asset libraries, depth maps, segmentation passes, prompt histories, generation checkpoints, or production QA work files merely to run a hazard question.

## Bun workspace placement

The maintained repository direction requires a top-level `apps/*` and `packages/*` Bun workspace but intentionally leaves exact child names open. R2.9 therefore recommends responsibilities rather than freezing package names.

A future content compiler/build executable should own or coordinate:

- scene semantic-manifest decoding;
- source/claim reference closure;
- zone/region validation;
- QA failure-code validation;
- scene-version/change-class validation;
- immutable asset/checksum verification;
- pre-answer answer-leak checks on generated publication metadata;
- content-pack assembly and manifest publication.

If the architecture synthesis adopts an `apps/content-compiler`-like executable, these checks fit there. If the final graph chooses another build-time boundary, preserve the responsibility rather than the illustrative name.

Reusable publication schemas/types may live in a shared package only when there is a concrete multi-consumer need. Do not create a package per scene service or a universal `core` package for this lane.

## Effect boundary

Effect should be used only where its capabilities earn their role in the future content pipeline, for example:

- decoding untrusted authoring JSON and persisted publication records with the selected v4 Schema APIs;
- typed build/QA failures that preserve the `HSP-*` error identity;
- filesystem/process/resource boundaries if the final compiler orchestrates external tools;
- bounded parallel validation/render jobs;
- deterministic logging/observability of a publication run.

Keep pure geometry, normalized-coordinate math, polygon overlap tests, change classification, manifest hashing, and deterministic validation calculations as plain functions when they require no effectful capability.

Do not introduce an Effect service for every validator or asset. A cohesive scene-publication capability can expose meaningful build operations while pure validators remain ordinary modules.

Before implementation code is written, follow the repository rule: install the exact selected v4 cohort in the real Bun workspace, read `node_modules/effect/AGENTS.md` completely, follow linked package-local guidance, and inspect installed source. R2.9 does not make code-level API claims from the RC coordinate.

## Bun boundary

Bun should remain the workspace/package/script baseline. A future build command may orchestrate specialist tools, but Bun ownership does not mean Blender or image tooling must be reimplemented in TypeScript.

Recommended behavior:

- pin tool coordinates outside ad-hoc developer machines;
- run scene validation through a repeatable script/task entrypoint;
- use frozen dependency installation in CI;
- store build manifests and hashes as ordinary text artifacts;
- avoid lifecycle scripts that silently download models/assets;
- make any external renderer/model download an explicit, reviewed setup step with checksum verification.

Do not make Blender a browser, service-worker, or Cloudflare runtime dependency.

## Blender integration

For Routes B/C, the future pilot should provide a deterministic command-line render/build entrypoint around the exact pinned Blender coordinate.

Inputs should include:

- exact `.blend`/scene source or reproducible scene-generation source;
- exact project-owned asset-library revisions;
- camera/composition settings;
- line/render configuration;
- output path set;
- deterministic manifest request.

Outputs can include build-only review artifacts:

- final candidate render;
- object-ID/segmentation pass;
- depth pass;
- edge/line pass;
- optional masks/keypoints;
- tool/runtime metadata.

Only the accepted final static derivative and publication metadata flow to the site/content pack.

### CI caution

Do not declare cross-machine byte-identical Blender rendering a production invariant until the pilot measures it on the selected engine/settings/hardware. The project can still preserve reproducibility by pinning inputs/tooling, retaining accepted final output bytes, and recording whether clean repeat renders are hash-equal or only visually equivalent.

## SVG/2D integration

For Route S:

- source components remain project-owned, versioned, and sanitizable;
- publication SVGs must strip semantic target names from IDs/titles/comments/metadata;
- no scripts, event handlers, external resources, remote fonts, or `foreignObject` in scored delivery;
- optimization is pinned and followed by render-equivalence and metadata-leak checks;
- region polygons are stored separately from visible learner SVG unless a future compiler proves a secure opaque representation.

The browser should not need to understand the authoring-layer object graph.

## Human cleanup/illustration integration

For Routes C/H, keep editable human-art source in the production corpus or controlled asset storage with exact hashes. The publication build consumes a frozen exported master, not a mutable cloud-document pointer.

Record:

- source block/render hash;
- editable source hash;
- exported final master hash;
- author/editor and rights record;
- edit/revision notes;
- whether any semantic silhouette/contact changed;
- subsequent QA/region/accessibility hashes.

If an external contractor supplies a file, intake validation should reject missing provenance/rights metadata before the file can become a scored asset.

## Optional generative R&D integration

No generative dependency belongs in the production workspace by default.

If the optional pilot is authorized later, isolate it as build/R&D tooling with:

- exact model/control weight hashes;
- explicit local/cache location;
- no implicit network download in normal application builds;
- reproducible environment lock/container record;
- project-owned structural inputs only;
- generated candidates treated as untrusted artifacts until all structural/semantic/rights gates pass.

The normal site build must remain possible when that model/provider is absent. The deterministic pre-generation render remains the fallback.

## Publication data shape

The final content schema lane owns exact field/API definitions, but R2.9 requires equivalent information to survive publication.

Conceptual scene record:

```text
scene identity/version
  environment + compatibility
  controlling image asset reference/hash
  ordered neutral zones
  target regions
  decoy regions
  matching-policy/tolerance version
  neutral overview + neutral zone observations
  full target/decoy descriptions
  claim/source references
  rights/review status
  content/security/accessibility review status
```

Build-only provenance can be richer than runtime data, but every runtime record must resolve back to a durable publication manifest.

## Answer-leak boundary

The offline pack necessarily contains target regions and answer-bearing explanations. The build/runtime boundary must still ensure that before successful commitment the UI does not expose:

- target count;
- semantic region names;
- full descriptions;
- annotated images;
- answer-bearing source excerpts;
- correctness-dependent CSS/data attributes;
- semantic filenames/URLs;
- SVG metadata that identifies targets.

Recommended asset URLs are opaque/content-addressed. Do not encode `blocked-exit`, `damaged-cord`, `target-3`, or similar answer-bearing names in public scored asset paths.

## Offline and payload behavior

The hazard runtime is static-first. A normal offline scene pack needs no 3D engine or model weights.

For each scene, payload accounting should distinguish:

- one accepted web static image;
- optional higher-resolution print derivative only if needed locally;
- compact JSON/encoded zone-region data;
- accessibility/explanation/source data.

Large authoring masters and diagnostic passes remain outside the learner pack.

The pilot records actual per-scene master/web/print bytes so the bundling/offline architecture can set measured pack budgets later.

## Testing handoff

Future implementation needs tests at several layers:

### Pure/build tests

- coordinate normalization/round-trip;
- polygon validity and maximum-tolerance overlap;
- deterministic one-to-one marker assignment;
- zero-target scene validity;
- stable zone order;
- change-class invalidation rules;
- filename/SVG metadata leak scanner;
- manifest/checksum closure;
- QA-code schema.

### Content/compiler tests

- scene cannot publish without target/decoy feedback;
- decoy requires safe-as-depicted/source rationale;
- every target/source claim resolves;
- rights/accessibility/review gates are complete;
- entry/high-level scope validation;
- final asset hash matches scene version;
- active item references exact region/tolerance versions.

### Browser tests

- no answer-bearing accessibility/DOM data before commit;
- zero-mark submit path;
- add/remove/move markers by keyboard;
- zoom/pan controls;
- one-to-one post-commit classification;
- target/decoy/general false-positive feedback;
- focus outcome after durable commit;
- grayscale/forced-colors annotations;
- small-phone behavior;
- nonvisual equivalent flow.

### Print tests

- worksheet unannotated;
- answer key separately annotated;
- stable numbering matches descriptions;
- no crop or target-detail loss;
- black-and-white legibility.

## Cloudflare/runtime handoff

The preferred delivery architecture is Cloudflare Workers Static Assets. Hazard scenes require no server capability by themselves. They should ship as immutable static content-pack objects with cache-friendly content-addressed paths.

Do not add a Worker, image API, or generation endpoint merely for scene delivery. A later corrections or account feature can justify a server independently.

## Repository/storage handoff

R2.9 does not select Git LFS or another binary store. The pilot should measure source/master sizes first.

Decision rule:

- normal source control for text schemas, manifests, SVG components, small reviewed derivatives, and QA data;
- choose LFS/object storage only if `.blend`, layered art, or lossless raster masters make ordinary Git history materially inefficient;
- whatever storage is selected must preserve immutable content hashes and durable provenance; a mutable external share link is not a sufficient production source.

## Current synthesis handoff

R2.90/final architecture synthesis must carry the reconciled decision:

- Codex-native image generation is the production authoring route;
- accepted raster bytes are the static controlling scored views;
- semantic manifest + final pixels + regions remain three agreeing authorities;
- regions and stable zone order remain human-authored;
- model regeneration and deterministic SVG/3D fallbacks are not required;
- scene/view/region/accessibility versions remain immutable; and
- the revised Codex pilot measures dimensions, batching, and review behavior
  before bulk production, without cutting Tier A/B launch scope.

Do not convert R2.9 planning priors into empirical budgets. Consume the future pilot's raw timings/failure logs instead.
