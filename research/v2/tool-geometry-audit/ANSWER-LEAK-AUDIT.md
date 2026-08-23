# Answer-leak audit

## Disposition

The recovered POC derivatives pass an asset-level metadata inspection. They are
accepted as historical pipeline evidence and retired as production-art
candidates, so they will not be published to a scored client.

This is not an application-level approval. The Codex-native production images,
delivery manifests, question pages, accessibility text, and offline packs must
be checked at their exact release hashes when they exist.

## Observed recovered surfaces

| Surface | Observation | Status |
|---|---|---|
| Research paths and filenames | POC IDs and concept names are present in the research archive | acceptable for internal evidence; do not deploy |
| SVG content | Recovered files parse; the automated scan found no forbidden answer-bearing terms or active external content | `OBSERVED_PASS` for recovered assets |
| GLB structure | Node and mesh names are neutral; no materials, cameras, top-level extras, or external URIs were found | `OBSERVED_PASS` for recovered assets |
| PNG/WebP metadata | The recovered raster probe reported no answer-bearing metadata | `OBSERVED_PASS` for recovered assets |
| Scored URL/DOM/bundle | No application fixture exists | future release gate, not a POC blocker |
| Accessible name and nonvisual equivalent | No application fixture exists | future release gate, not a POC blocker |

The machine-readable observations are in
`raw-results/recovered-bundle-audit.json`.

## Production rule

Internal authoring records may contain canonical names, taxonomy IDs, decisive
features, source paths, and review verdicts. The pre-commit scored client must
not expose those fields through filenames, URLs, metadata, DOM, accessibility
names, offline indexes, source maps, or alternate images.

For each accepted Codex-generated release image, the release process must:

1. scan image metadata and delivery paths;
2. inspect the pre-commit page, network requests, offline pack, and built bundle;
3. verify a neutral pre-commit description and a complete post-commit or
   equivalent nonvisual path;
4. confirm that no alternate image or hidden label reveals the answer; and
5. repeat the checks whenever the image bytes, delivery map, or page behavior
   changes.

The recovered POCs require no further leak, accessibility, or browser approval
unless a maintainer explicitly reopens them for deployment.
