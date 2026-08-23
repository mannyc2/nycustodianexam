# Implementation sequence

## Principle

Sequence risk and dependency closure; do not redefine launch content scope. All
Tier A/B content remains launch. Content/asset production can run in parallel
once the relevant schemas/review gates are stable.

## 0. Completed prerequisites

- R2.6 compiler research merged in PR #22.
- R2.10 exact archive recovered; four POCs classified and retired in PR #24.
- Codex-native visual authority, public released-sample style boundary, accepted-
  byte authority, and Tier A/B launch scope merged in PR #25.

## 1. Version/workspace gate

Scaffold only the private root, three workspaces, catalogs, isolated linker,
tsconfigs, scripts, and CI install/cohort/phantom-dependency checks. Pin Bun 1.4.0
and current synchronized Effect v4. Generate the real lock; read installed package
guidance; run a minimal service/Schema/runtime test.

Exit: clean frozen install, one cohort, no undeclared imports, explicit runtime
type boundaries. If this fails, fix the toolchain before domain code.

## 2. Content compiler spine

Implement the minimal R2.6 models, JSONC location adapter spike, registry gates,
safe diagnostics, canonical profile spike, output Schemas, content addressing,
and manifest-last staging. Add source-backed valid/invalid fixtures.

Exit: deterministic clean builds and complete diagnostic/gate tests.

## 3. Static site shell and content surfaces

Generate semantic home/profile/source/reference/tool-atlas structure from the
validated fixture. Add Vite production build, Cloudflare Static Assets preview,
static-output/SEO/leak scans, and print foundation. No player Effect closure on
static routes.

Exit: crawlable no-script pages and zero-Effect static closure.

## 4. Player state and renderer

Implement renderer-neutral question state/commands and disciplined direct DOM.
Add one browser `ManagedRuntime`, semantic focus/live-region requests, failure
states, and commitment boundary without persistence success yet.

Exit: pure/Effect/view tests prove no model transition can reveal before a
settled commit result. Run lit spike if direct-DOM migration triggers appear.

## 5. Durable persistence provider spike

Implement private database contracts. Run the first-party Effect provider and
`idb` fallback against the exact real-browser suite. Select from transaction,
migration, error, browser, and bundle evidence. Implement strict atomic attempt
commit, reconciliation, projections, sessions, export/import skeleton.

Exit: real Chromium/Firefox/WebKit contract with failure injection; provider
decision recorded without leaking provider types.

## 6. Offline pack path

Implement durable installation state, per-object verification, atomic generation
activation, active-session pinning, native service worker/cache boundary,
BroadcastChannel invalidation, long-job locks, storage pressure UX, and offline
reload.

Exit: crash/reload/cross-tab/quota/eviction/rollback tests pass.

## 7. Complete the first vertical slice

Join compiler, static site, player, persistence, offline, accessibility, print,
route-closure measurement, and Cloudflare preview. Establish numeric baselines.

Exit: every criterion in `VERTICAL-SLICE-PLAN.md` passes. This is the point at
which the architecture is accepted or revised—not merely when a page renders.

## 8. Parallel launch content production

Freeze the full Tier A/B editorial registry and author atomic source/claim records,
original items, all rationales, translations where chosen, and nonvisual forms.
Run the Codex visual pilot under current authority; batch accepted tools/scenes
only after native dimensions and obscure-tool/scene fidelity are measured. The
compiler blocks partial or stale review state.

Exit: launch inventory completeness and content/review coverage are derived, not
estimated by prose.

## 9. Expand study modes and hazard player

Add deterministic session/simulation/print assembly, variable-size bank and
session fixtures, source-backed item formats, confusion tracking, review
scheduling, zero/multiple-hazard scenes, marker matching, decoys, pan/zoom, and
zoned nonvisual equivalent.

Exit: maintained release acceptance across bank sizes, option counts, formats,
offline packs, and print.

## 10. Backend only if authorized

If correction submission needs a server, add `apps/worker`, native fetch boundary,
narrow Effect use case, abuse/idempotency/privacy policy, and workerd tests. Do not
make core study or local corrections depend on it.

## 11. Release hardening

Run full browser/AT/manual matrix, two-clean-build reproducibility, bundle and
field-performance baseline, storage/migration recovery, source withdrawal and
content correction drills, privacy/security review, and complete offline/print
acceptance. Publish only exact immutable content/profile/asset versions.
