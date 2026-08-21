# Runtime-matrix probe fixture

This is a private Bun fixture for executable R2.3 evidence. It intentionally selects one coherent published Effect cohort at `4.0.0-rc.110` rather than mixing the latest source `effect@4.0.0-rc.111` with the registry-lagging `@effect/platform-bun@4.0.0-rc.110`.

The lane separately audits upstream source at latest commit `436f10d1efccec308426532ff3f88df9a96434f3` (`4.0.0-rc.111`). Results must therefore state whether they are:

- source-confirmed at rc.111;
- registry-resolved and executable at rc.110;
- project recommendations inferred from those two evidence classes.

## Required executable gates

1. `bun install` resolves the exact declared cohort and produces a committed text `bun.lock`.
2. `node_modules/effect/AGENTS.md` is read completely before writing Effect probe code.
3. Bun runtime entry and filesystem operation execute under Bun 1.4.0.
4. Browser bundle compiles without Bun or Node implementation leakage.
5. Real Chromium runs Browser HttpClient and one first-party IndexedDB operation.
6. Effect Web handler converts a Request into a Response.
7. A Cloudflare-compatible bundle executes under workerd rather than being relabeled from a Bun or Node run.
8. Runtime and Layer reuse behavior is measured.
9. Client abort behavior is measured where the local harness exposes a truthful signal.

Every command and raw result belongs under the lane root `raw-results/`. No credentials or production application data are used.