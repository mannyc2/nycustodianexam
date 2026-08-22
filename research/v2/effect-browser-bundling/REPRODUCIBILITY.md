# Reproducibility

Status: **BLOCKED BEFORE INSTALL**

## Observed execution environment

See `raw-results/environment.txt` and `raw-results/install-blocked.txt`.

- Linux x86_64, kernel 6.18.35
- Node 22.16.0
- npm 10.9.2
- Bun absent
- no Vite/Rolldown executable on PATH
- no Docker/Podman fallback
- npm registry DNS failed with `EAI_AGAIN`
- no relevant npm cache entries

## Required clean rerun sequence

From `fixtures/bundle-lab` in an environment with Bun 1.4.0 and registry access:

```sh
bun --version
bun --revision
rm -rf node_modules apps/*/node_modules packages/*/node_modules
bun install
cat node_modules/effect/AGENTS.md
# only after the installed instructions are read: emit the Effect fixture source defined in PROBE-SPEC.md
bun install --frozen-lockfile
```

Then verify direct dependency closure and one Effect cohort using the generated `bun.lock` and installed tree. The exact inspection commands may use `bun pm ls --all`, lockfile parsing, and workspace-by-workspace import checks, but the recorded result must name every resolved `effect` / `@effect/*` version relevant to the fixture.

For every probe/variant:

1. delete its output directory;
2. build with Vite 8.2.2/Rolldown 1.2.5 at the lane's fixed target;
3. record wall-clock duration;
4. record every emitted JS chunk raw bytes and SHA-256;
5. independently compress each JS chunk with gzip level 9 and Brotli quality 11;
6. record source maps separately and exclude them from transfer closure;
7. parse the Vite manifest to compute independently compressed initial closure plus separate dynamic closure;
8. repeat with the comparison minifier where specified.

## Clean-build repeat

The full measurement must run twice from clean output directories. Compare file list, Vite manifest, content SHA-256, raw bytes, gzip9 bytes, Brotli11 bytes, route closures, and build durations.

Current status: **NOT RUN**. No reproducibility hash claim is made.

## Frozen-install requirement

Once a real `bun.lock` exists, CI/reproduction must use `bun install --frozen-lockfile`. The current marker `fixtures/bundle-lab/BUN-LOCK-BLOCKED.md` must be replaced by the generated lockfile, not by a hand-authored approximation.
