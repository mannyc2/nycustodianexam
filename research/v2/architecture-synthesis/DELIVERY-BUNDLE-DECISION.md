# Delivery and bundle decision

## Build/deploy direction

- Bun owns installation, workspace orchestration, scripts, and compiler runtime.
- Vite owns browser development/transformation/production bundles.
- The content compiler finishes before Vite/static generation consumes outputs.
- Cloudflare Static Assets is the first deployment target.
- No Worker workspace or runtime is created for static hosting.

Recheck exact Vite/Cloudflare coordinates at scaffold time. R2.5's dated candidate
was Vite 8.2.2 with the current Cloudflare Vite/Wrangler tools; those coordinates
were not executed in that lane.

## Entrypoint closure

At minimum, emit independent entry/closure measurements for:

```text
static acquisition/reference route     zero Effect imports/preload edges
question player direct DOM              lazy interactive closure
hazard player                           lazy separate increment where practical
offline/pack manager                    lazy separate increment
native service worker                   standalone worker bundle
optional Worker                         absent
```

Browser IndexedDB, BrowserHttpClient, Stream, Atom/reactivity, renderer candidate,
and any Effect service-worker code are separate measurable increments. Do not
silently pull them into the base player.

## Budget posture

R2.5 produced no current-v4 bytes. Therefore:

- no v3 number becomes a ceiling;
- no absolute raw/gzip/Brotli budget is invented in R2.90;
- the first vertical slice records raw, gzip-9, and Brotli-11 for every emitted
  transfer file and computes initial/lazy route closures from the Vite manifest;
- source maps are excluded from transfer totals but scanned for answer leakage
  and governed by deployment policy;
- the baseline is committed as evidence, then later changes require reviewed
  explanation for meaningful relative regressions until absolute targets are
  evidence-based.

Static zero-Effect closure is an absolute structural gate now. Numeric gates are
an implementation output.

## Splitting/minification

Begin with Vite's natural splitting. Do not force an Effect vendor chunk without
manifest evidence; it may preload Effect on static routes or worsen caching.
Compare the current default minifier with Terser only after identical builds exist.
Choose from measured route closures, not package claims.

## Offline payload

Ship reviewed static images/raster/SVG plus compact interaction/accessibility/data
records. Do not ship Blender/CAD/generation masters, diagnostic passes, image
models, or runtime 3D for scored v1. Low-data mode controls explicit asset
prefetch without removing answer/review behavior.

## Reproducibility

Two clean installs/builds at the exact lock must produce identical content roots
and all deterministic emitted artifacts covered by policy. Vite chunks with
tool-generated nondeterministic metadata must be investigated and normalized or
explicitly excluded from long-term content identity; content object identity
never depends on Vite filenames alone.
