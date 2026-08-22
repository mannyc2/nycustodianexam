# Chunk graph

Status: **BLOCKED — no Vite manifest was produced**

The lane requires graphing static imports, dynamic imports, shared chunks, and modulepreload behavior from actual Vite output. No Vite 8.2.2 build could run, so there is no valid graph to publish.

The intended graph questions remain:

1. Does `static-reference` have an Effect-free closure?
2. Which Effect core chunks are shared by the direct-DOM player probes?
3. Does the Preact candidate add only renderer chunks, or alter shared Effect/content chunking?
4. Do natural shared chunks cause acquisition-page modulepreload?
5. Does a manual Effect vendor chunk improve repeat-route transfer while preserving static-page isolation?
6. Are service-worker and optional-Worker outputs isolated from browser route preload graphs?

Do not infer graph edges from package dependencies alone. Populate this document only from a generated Vite manifest and emitted files.
