# Conflicts and resolutions

## 1. Effect source coordinates drift across lanes

Lanes cite several main-branch/source commits while reporting the same rc.111
package version. The recovery fixture pins the official `effect@4.0.0-rc.111` tag
at `648f566dd259898e7697c7fcb796183ccbc474ab` and installs that exact package.

**Resolution:** the package/tag coordinate controls the first lock. Main-branch
commits remain dated source observations, not dependency identities. Recheck the
registry tag at scaffold time and upgrade the synchronized cohort deliberately.

## 2. Bun 1.4.0 is current, but the successful compiler proof used 1.3.14

R2.7–R2.9 select Bun 1.4.0; the local R2.6 proof used the available Bun 1.3.14.
The official Bun site now identifies 1.4.0 as current.

**Resolution:** select Bun 1.4.0 provisionally. The first scaffold commit must run
the fixture/workspace/install gate under 1.4.0. The rc.111 compiler observation is
useful API evidence but does not certify Bun 1.4.0.

## 3. Four workspaces versus the smallest earned graph

R2.1/R2.7 propose `apps/site`, `apps/content-compiler`, `packages/content`, and
`packages/study`, while also documenting that `packages/study` should be merged
if it has only one private consumer. The first vertical slice has only the site
as a study-domain consumer.

**Resolution:** start with three workspaces. Keep study modules internally
portable under `apps/site/src/study`; extract `packages/study` only when a second
consumer, independent publication, or clear ownership boundary appears. This
applies the source lanes' own falsifier and reduces the initial dependency graph.

## 4. `BrowserRuntime.runMain` versus `ManagedRuntime`

R2.3 recommends `BrowserRuntime.runMain` at a browser root; R2.1/R2.2 recommend a
single `ManagedRuntime` for repeated calls from an imperative renderer boundary.

**Resolution:** the direct-DOM player creates one app-owned `ManagedRuntime` from
the browser Layer and uses it for repeated commands. A process-shaped
`BrowserRuntime.runMain` remains an alternative if the application is expressed
as one long-lived Effect program. Never create either per event.

## 5. First-party IndexedDB is attractive but unexecuted

R2.4 conditionally selects the rc.111 Effect provider; R2.3 and R2.4 both record
that the actual package provider did not run in a real browser. Native IDB
transactions did run in R2.3.

**Resolution:** keep a private project contract and make provider selection the
first implementation spike. Try the current Effect provider; immediately switch
to `idb@8.0.3` if it fails any contract, lifecycle, bundle, or browser criterion.
The domain transaction cannot be weakened to preserve a provider choice.

## 6. Direct DOM, lit-html, and Preact candidates differ

R2.2 identifies lit-html as the first declarative candidate; R2.5 prepared Preact
as a bundle comparison. Neither production closure ran.

**Resolution:** direct semantic DOM is the first slice. The first escalation
spike is lit-html because it addresses bounded template branching with less
framework surface. Preact/Solid remain later comparisons only after documented
migration triggers. No renderer is selected by package familiarity.

## 7. R2.5 did not measure bundles

No current-v4 route closure or numeric budget exists.

**Resolution:** no invented byte ceiling. The first vertical slice must establish
the baseline production manifest, gzip/Brotli closures, and zero-Effect static
route. Subsequent changes use reviewed relative regression gates until enough
data supports absolute budgets.

## 8. Codex-native visuals versus deterministic-first research — resolved

The conflict is closed by merged PR #25 and
`illustration/VISUAL_AUTHORING_POLICY.md`. Codex-native generation is the
production-art route. Publicly released official samples may guide high-level
style, while secure/recalled content and sample item/composition reconstruction
remain prohibited.

Accepted reviewed raster bytes control release/build inputs; model regeneration
and deterministic SVG/CAD/3D fallbacks are not required. R2.9's semantic,
target/decoy, region, accessibility, QA, and versioning contracts remain in
force. R2.10's four POCs are recovered research evidence and retired
production-art candidates.

The remaining visual unknowns are measurements, not authority conflicts: native
Codex dimensions, one-vs-batch fidelity, obscure-tool accuracy, phone/print
legibility, review effort, and per-asset approval.

## 9. All Tier A/B launch versus staged implementation

Maintainer direction says the Tier A/B universe is launch scope and should not be
reduced. Research lanes sometimes discuss pilots or smaller first slices.

**Resolution:** retain all Tier A/B as the launch editorial universe. A vertical
slice and production batches sequence work; they do not redefine launch scope.
Watchlist/high-level content still requires its separate scope rules.

## 10. Optional Worker

R2.3 has a credible native-fetch Worker design, but the product has no required
backend for core study use.

**Resolution:** deploy static assets only. Add `apps/worker` when a concrete
correction endpoint is approved; then test it in workerd and retain native
request/env/context ownership.
