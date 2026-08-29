# Plan 009 draft: Prepare the consumer UI hard-cut migration

<!-- PLAN_009_METADATA_START
{
  "status": "provisional-prework",
  "participantEvidence": "none",
  "humanEvidence": "none",
  "humanParticipantCount": 0,
  "notHumanUsabilityTested": true,
  "decisionStatus": "pending",
  "requiredDependencyShas": null,
  "mustRebaseAndReverify": true,
  "productionAuthorization": false,
  "productionDeploymentStatus": "blocked-live-user-reviewer",
  "productionDeploymentScope": "out-of-scope",
  "liveEnvironmentReviewerType": "User",
  "liveEnvironmentChangeAuthorization": "separate-required",
  "reviewCycleStatus": "prior-cycle-invalidated",
  "priorReviewReceiptsReusable": false,
  "reviewSubjectBaseSha": "d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1",
  "authorizationInterface": "CODEX-ONLY-UIUX-V1",
  "reviewMode": "codex-only",
  "observedAtSha": "d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1"
}
PLAN_009_METADATA_END -->

## Status and use boundary

This packet is provisional prework only. It is not a final migration plan, an
accepted upstream decision, implementation authorization, or production
authorization.

Checkpoint note (2026-08-29): the semantic-gate repair was interrupted before
its self-test passed. A fresh checkpoint run still falsely classified a safe
delayed-settings-load recovery fixture as an affirmative rollback claim. The
current validator therefore remains development material and supplies no
acceptance evidence.

The metadata block above is the sole authorization and human-evidence status
channel for this Markdown artifact. `CODEX-ONLY-UIUX-V1` applies only to UI/UX
research, review, selection, decision, and plan governance: exact repository-
attested decisions, independent Codex subagent reviews, and CI certification.
It does not replace, satisfy, or bypass the live GitHub production Environment
control. The current index marks Plans 004 and 005 `DONE` under the Codex-only
evidence model while Plans 006–008 remain blocked. This repair still leaves all
Step 02–05 coordinate fields null under the coordinator's explicit direction;
it does not infer a partial dependency binding from index status. No executor
may start a tranche from this draft.

Production deployment is blocked and out of scope while the live `production`
Environment requires a reviewer whose GitHub type is `User`. Codex cannot
satisfy or bypass that rule, and Plan 009 cannot change the Environment. Any
future Environment change requires separate authorization and repository
attestation.

The packet was mapped against the exact current `origin/main` commit
`d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1` on 2026-08-28. It must be rebased,
reconciled with the Step 04 source inventory, and reverified after accepted
Steps 02–05 land. The validator deliberately rejects an attempt to fill
dependency coordinates while this packet remains provisional.

This draft is intentionally absent from `plans/README.md`. It is neither an
executable plan nor a `TODO`, and it must not be marked `DONE`.

## Deliverables in this packet

- `plans/009-consumer-ui-migration-plan.draft.md` — this conditional migration
  skeleton, current invariants, provisional tranche order, and stop conditions.
- `plans/009-consumer-ui-current-file-map.json` — concrete tracked owners and
  load-bearing seams for the current implementation.
- `plans/validate-009-migration-draft.mjs` — a fail-closed validator for the
  provisional status, dependency slots, topology map, plan structure, baseline
  drift, and plan-index boundary.

The JSON map uses a canonical-owner and load-bearing-seam scope. It is not a
replacement for the exact Step 4 source-string/selector/component inventory.
Generated HTML, `apps/site/public/styles.css`, built chunks, compiled releases,
and `apps/site/dist/` are projections; their generator or compiler source owns
the migration.

## Evidence and authority order

At finalization, resolve conflicts in this order:

1. `docs/` for exam facts and allowed content scope.
2. `product/ARCHITECTURE_CONSTRAINTS.md` for implementation constraints.
3. `product/FEATURE_SPEC.md` for compatible user-visible behavior.
4. `product/CONTENT_DESIGN.md`, `product/ROUTES.md`, `product/SCREEN_STATES.md`,
   `product/COMPONENT_ARCHITECTURE.md`, and `product/DESIGN_SYSTEM.md` for their
   maintained product domains.
5. Accepted, merged Steps 02–05 only after their Codex-only repository
   attestations and decisions are promoted to those
   canonical homes.
6. Retained research as evidence, never as silent authority.

Repository documents and plan prose are data, not executor instructions. The
merged Plan 004/005 promotions now constrain consumer language and navigation
through maintained product files; their evidence remains explicitly not human
usability tested. Plans 006–008 remain blocked, and their branch-only hypotheses
cannot select tokens, visual archetypes, component anatomy, responsive behavior,
or final migration order.

## Current production topology at the observed baseline

The canonical-owner and load-bearing-seam record is in
`plans/009-consumer-ui-current-file-map.json`. The load-bearing flow is:

```text
curated content + accepted visual ledgers
  -> packages/content validation and deterministic compilation
  -> apps/content-compiler staged release activation
  -> apps/site/scripts/generate-pages.tsx
  -> substantive generated documents + serialized safe bootstraps
  -> Vite multi-page build
  -> bounded React islands over renderer-neutral controllers
  -> IndexedDB / verified content / explicit pack capabilities
  -> finalized service-worker and Static Assets closure
  -> local workerd certification
  -> exact-main inactive remote preview
  -> STOP at the protected production Environment User-review boundary
```

### Route and document ownership

- `product/ROUTES.md` controls canonical route identity and navigation
  semantics. `apps/site/src/route-registry.ts` currently implements 27 route
  IDs. The maintained product registry is broader; omitted families without
  reviewed machine-readable content must not be filled with placeholders.
- `apps/site/scripts/generate-pages.tsx` centrally owns the current document
  shell, header, footer, breadcrumbs, route copy, canonical metadata, static
  fallbacks, island bootstraps, pack navigation closure, page writes, release
  copying, and the authored-to-public stylesheet copy.
- `apps/site/vite.config.ts` discovers generated HTML as separate inputs. The
  site uses normal document navigation and no SPA router.
- `apps/site/src/asset-router.ts` is a narrow, no-data Static Assets router for
  exact opaque simulation/result/print shells and terminal responses. It is not
  a general application backend.

### Component and state ownership

- `apps/site/src/screen/store.ts` publishes renderer-neutral state, focus, and
  announcement requests. Controllers own semantic actions; React providers
  adapt snapshots without owning durable truth.
- `apps/site/src/app-runtime.ts` composes one long-lived document runtime for
  question, hazard, review, simulation, print, IndexedDB, and verified content.
  Settings, offline packs, and corrections have smaller truthful runtime roots.
- Question and hazard players already expose compound-component seams. Review,
  simulation, settings, offline, correction, and print routes have larger
  route-local compositions that must be changed around existing controllers and
  persistence boundaries, not by rewriting those workflows as UI state.
- The authoritative IndexedDB database is `nycustodian-study-v1`, version 5,
  with fifteen declared stores. Portable transfer is schema v2 with an explicit
  v1 normalization path. `apps/site/src/study-storage/app-database.ts` owns the
  scoped connection Layer and page lifecycle, while
  `apps/site/src/study-storage/app-database/legacy-import.ts` owns abortable
  legacy reads, atomic import/match, destination preservation, and quarantine.
  `localStorage` is only a fast preference mirror.

### Styles, content, and generated projections

- `apps/site/src/styles.css` is the single authored stylesheet. Its declared
  layers are `reset`, `tokens`, `base`, `layout`, `components`, `utilities`, and
  `overrides`. Static templates and React leaves share this contract.
- `apps/site/public/styles.css` is generated by copying the authored source; it
  is not a migration authority.
- Scored and instructional copy is curated under `content/authoring/` and passes
  through `packages/content` and `apps/content-compiler`. Shell, navigation,
  status, form, and recovery copy also exists as literals in the page generator
  and React leaves. The parallel source inventory must assign each accepted
  language change to exactly one owner.
- `content/authoring/visuals/releases/RELEASE-INVARIANTS.md` assigns lifecycle
  truth to `tools.json`, `comparisons.json`, and `scenes.json` in that directory.
  `verify-visual-release.mjs` closes inventory order, membership, exact asset
  bytes and hashes, manifests, and scene companions. UI work consumes those
  records; it does not rewrite their accepted raster bytes or lifecycle truth.
- Initial question and hazard documents contain only precommit material plus
  receipts for later item-scoped postcommit retrieval. Styling, accessibility
  text, metadata, filenames, caches, and source maps cannot weaken that split.

### Tests, offline, print, and release

- Root `bun run verify` covers the exact toolchain, maintained layout, module
  boundaries, release-record state validation, visual hashes, content build,
  workspace and browser-harness typechecks, unit tests, site build, and artifact
  verification.
- Playwright exercises Chromium, Firefox, and WebKit. Failure screenshots and
  traces are CI evidence, not production telemetry.
- The service worker owns versioned shell/runtime caches, an exact active-pack
  pointer, pack-managed-content bypass, local opaque shells, and truthful
  offline fallback. Generated routes also feed the explicit pack navigation
  closure.
- `apps/site/scripts/service-worker-finalization.ts` is the pure cache-version
  and marker/precache primitive consumed only after the complete build tree is
  known. Any shell or asset cut must preserve its normalized path-and-byte hash
  and exact marker cardinality.
- Print is a deterministic persisted workflow. The preview is restored by
  opaque job identity, questions and answer material remain separable, and CSS
  owns screen/print transforms for Letter/A4, normal/large text, and grayscale.
- Remote preview accepts only exact merged `main` and uploads an inactive
  version. Production separately requires exact `main`, typed confirmation,
  candidate-bound certification, and the protected production Environment.
  Repository evidence and a read-only live query on 2026-08-28 establish a
  required reviewer whose GitHub type is `User`; the workflow consumes that
  Environment at its deploy job. Codex cannot satisfy or bypass that rule.
  The structured deployment-status and scope fields in this artifact are the
  controlling status record. Any future Environment change requires separate
  authorization and repository attestation and is outside this planning task.

### Explicit provisional tranche ownership for repaired topology seams

| Current owner | Provisional tranche ownership | Required invariant |
|---|---|---|
| `apps/site/scripts/service-worker-finalization.ts` | Tranche 3; reverify in Tranches 7 and 8 | Deterministic cache identity and complete safe precache closure |
| `apps/site/src/study-storage/app-database.ts` | Characterize in Tranche 1; preserve in Tranche 7 | One scoped connection owner and unchanged runtime lifecycle |
| `apps/site/src/study-storage/app-database/legacy-import.ts` | Characterize in Tranche 1; preserve in Tranche 7 | Abortability, decoding, destination truth, quarantine, and atomic import |
| `content/authoring/visuals/releases/RELEASE-INVARIANTS.md` | Tranches 4 and 6; reclose in Tranche 8 | Inventory evidence never becomes lifecycle authority |
| `content/authoring/visuals/releases/tools.json` | Tranche 4; reclose in Tranche 8 | Exact 65-record release identity, bytes, hashes, and gates |
| `content/authoring/visuals/releases/comparisons.json` | Tranche 4; reclose in Tranche 8 | Exact 14-record membership, distinctions, hashes, and scored-use gates |
| `content/authoring/visuals/releases/scenes.json` | Tranche 6; reclose in Tranche 8 | Exact 18-scene identity, artifacts, companion records, and gates |
| `content/authoring/visuals/releases/verify-visual-release.mjs` | Required in Tranches 4, 6, and 8 | Complete release graph and artifact closure |

### Current evidence limits that the final plan must reconcile

- `docs/OPEN.md` records a passing integrated 198-case browser matrix, and the
  retained historical
  [Certification run 33165017762](https://github.com/mannyc2/nycustodianexam/actions/runs/33165017762)
  succeeded for its exact pre-Step-2 baseline
  `9fc7dcacfc961752e5d9a2cedbc426deead54a05`.
  `apps/site/browser-tests/README.md` still carries pre-run wording that says
  the integrated candidate must rerun. Treat that README wording as stale
  documentation to reconcile at the rebased SHA; the redesigned candidate
  still requires its own fresh exact-SHA run.
- Deterministic bundle ceilings exist, but no numeric Web Vitals budget, field
  analytics, long-duration storage stress gate, or documented instant
  production rollback workflow exists.
- Launch analytics are disabled and diagnostics remain local. No runtime UI
  flag, canary, traffic split, remote error service, or production health
  dashboard was found.
- The exact Effect 4.0.0-rc.111 package guidance is installed in this worktree
  for verification. This planning task did not review or change Effect
  implementation code. Any later runtime tranche must still use the accepted
  exact package cohort and reread `node_modules/effect/AGENTS.md` completely
  before reviewing or modifying Effect code.

## Preserved invariants and deliberate exclusions

Every future tranche must preserve:

- stable route IDs, canonical paths, indexability, and normal document
  navigation unless accepted maintained contracts explicitly change them;
- useful semantic HTML for static/acquisition/reference pages and zero
  React/Effect closure on static-only routes;
- one canonical presentation per migrated surface, with no dual renderer,
  long-lived compatibility theme, or route-level old/new toggle;
- explicit commit, one authoritative IndexedDB transaction, then reveal;
- idempotent retry without duplicate attempts, sessions, review entries, or
  print jobs;
- no answer-bearing bytes in the precommit DOM, accessibility tree, initial
  executable closure, safe precache, filenames, or metadata;
- exact content, profile, pack, source, question, scene, and visual identity;
- local-first use, explicit offline pack lifecycle, truthful restoration and
  failure states, and no required account;
- deterministic simulation and print outputs;
- first-class keyboard, nonvisual, forced-color, reduced-motion, zoom/reflow,
  and print behavior; and
- independent/unofficial status, visible uncertainty and provenance, original
  practice content, and the exam-security boundary.

This migration deliberately excludes feature expansion, new route families,
new exam facts, new scored content, new imagery, a redesign of persistence,
correction-Worker activation, analytics, a backend, domain purchase, deployment,
and production authorization.

## Dependency and decision slots

All coordinates are `null` in this draft. Planning and decision values must
come only from accepted artifacts merged into the final plan's exact
`origin/main` base. The production-authorization slot is different: it remains
`null` during Plan 009 graduation. Candidate-bound production evidence belongs
to a later, separately controlled technical process.

| Slot | Canonical consumer | Current value | Required disposition before graduation or release use |
|---|---|---:|---|
| `consumer-language` | `product/CONTENT_DESIGN.md` plus assigned production copy owners | `null` | Repository-attested Codex decision, merge/artifact coordinates, independent Codex review, and CI |
| `task-navigation` | `product/ROUTES.md`, `product/SCREEN_STATES.md`, `product/COMPONENT_ARCHITECTURE.md`, and `product/DESIGN_SYSTEM.md` | `null` | Accepted hierarchy, labels, route behavior, and merge/artifact coordinates |
| `consumer-visual-system` | `product/DESIGN_SYSTEM.md` | `null` | Accepted visual territory, token contract, and merge/artifact coordinates |
| `ui-foundations-responsive-contract` | `product/COMPONENT_ARCHITECTURE.md` and `product/DESIGN_SYSTEM.md` | `null` | Accepted anatomy, route archetypes, responsive rules, migration map, and coordinates |
| `integrated-consumer-validation` | `product/CONTENT_DESIGN.md`, `product/ROUTES.md`, `product/COMPONENT_ARCHITECTURE.md`, `product/DESIGN_SYSTEM.md`, and `docs/OPEN.md` plus final retained validation evidence | `null` | Acceptable implementation disposition, zero unresolved critical failures, every condition assigned, and exact coordinates |
| `parallel-step-04-source-inventory` | This plan and the current-file map | `null` | Exact merged commit, complete path/string/selector assignment, drift reconciliation |
| `rollout-feature-flag-decision` | Release section of the final plan | `null` | Optional Git decision only if the current no-runtime-flag hard cut is replaced |
| `observability-privacy-decision` | Observability section of the final plan | `null` | Optional Git decision only if remote measurement or logging is proposed |
| `production-authorization-evidence` | Deployment handoff, production workflow, and candidate-bound certification record | `null` | Post-graduation technical evidence only; remains null, is out of scope here, and cannot bypass the live User reviewer |

The structured metadata fields are the sole evidence-state channel; narrative
text cannot populate a dependency slot. Recovered Plan 004 prototypes and
partial Plan 004/005 draft-branch artifacts do not populate any slot.

## Codex-only authorization and review evidence

The only future upstream decision inputs are exact accepted repository
attestations for Steps 02–05. Each currently has a null decision SHA, merge SHA,
CI run/head, and independent-review-record hash in the JSON map. Named contract
slots cannot be bound to a step speculatively; the accepted attestation must
declare that mapping after it lands.

| Future input | Current binding | Acceptance interface |
|---|---:|---|
| Step 02 accepted repository attestation | `null` | `CODEX-ONLY-UIUX-V1` |
| Step 03 accepted repository attestation | `null` | `CODEX-ONLY-UIUX-V1` |
| Step 04 accepted repository attestation, including the exact source inventory | `null` | `CODEX-ONLY-UIUX-V1` |
| Step 05 accepted repository attestation and integrated disposition | `null` | `CODEX-ONLY-UIUX-V1` |

Final review records use a two-commit evidence boundary. The repaired packet is
first committed as an immutable review subject with an empty ledger. Each
independent result must then name its task and occurrence IDs, review kind,
subject/base commits, all three exact packet Git blob hashes, and full-file byte
intervals. It must also preserve the native allocation prompt, spawn receipt,
allocation result, review rubric, exact follow-up prompt, and returned one-line
result as canonical UTF-8 byte envelopes with lengths, SHA-256 digests, and
base64 bytes. Finding IDs and summaries, evidence paths, disposition,
consensus/dissent, and the canonical record SHA-256 remain bound to those native
bytes. A self-authored task name or an unkeyed hash is not task proof. A second
attestation-only commit may populate only the JSON ledger and the delimited
review-record block in this plan. The validator must remain byte-identical to
the reviewed subject and rejects every other post-review change.

Every receipt produced for an earlier rejected review subject is invalid and
cannot populate this ledger. The validator pins new task/occurrence identities,
rejects both earlier subject commits, and requires another empty-ledger subject.

<!-- PLAN_009_CODEX_REVIEW_RECORDS_START -->
The current immutable-subject independent Codex reviews are pending. This block
will be populated only after the repaired packet is committed, reviewed by
exact commit and packet blob hashes, and found free of unresolved dissent.

| Codex task ID | Disposition | Consensus / dissent | Record SHA-256 |
|---|---|---|---|
<!-- PLAN_009_CODEX_REVIEW_RECORDS_END -->

Codex review receipts are machine-agent evidence and never change the structured
human-evidence fields. `CODEX-ONLY-UIUX-V1` defines the UI/UX evidence boundary
only. Candidate certification and the live production Environment are separate
technical controls; the existing required reviewer of type `User` remains
outside this interface and cannot be satisfied by Codex.

## Contract adoption procedure after Steps 02–05 land

This is a re-authoring gate, not an executor step:

1. Fetch `origin/main` and record its exact 40-character SHA.
2. Verify exactly four accepted `CODEX-ONLY-UIUX-V1` repository attestations,
   for Steps 02–05, are merged and reachable; reject an index-only or narrative
   completion claim.
3. Verify each attestation's decision SHA, merge SHA, CI run/head, independent
   Codex review task IDs and canonical record hashes, artifact hashes,
   conditions, and canonical promotions against merged Git history and bytes.
4. Verify the Step 05 integrated attestation uses one of its schema-defined
   implementation dispositions, with zero unresolved critical failures.
   Preserve every condition verbatim and assign it to a tranche and technical
   candidate gate.
5. Resolve the Step 04 attestation's exact source-inventory commit. Prove it is
   an ancestor of the new base; reconcile every mapped source string, selector,
   component, route, generated projection, and test consumer against the live
   tree.
6. Rebase this branch, regenerate the current-file map, and resolve any path,
   ownership, count, budget, route, state, cache, test, or release drift.
7. Populate only the four Step 02–05 upstream inputs, then bind named contract
   slots to those verified attestations in the same Codex-reviewed change that
   graduates this packet. Keep the post-graduation production-authorization
   slot null and model it as a technical execution/release stop. Do not paste
   SHAs into the provisional artifacts: the current validator rejects that.
8. Re-author the tranche order and evidence-linked acceptance criteria from the
   accepted migration map. Any difference from the sequence below is expected
   to be explicit, not silently normalized.
9. Replace the provisional validator with a final-plan validator that verifies
   reachable accepted coordinates and their canonical consumers.
10. Only then add an executable plan to `plans/README.md` with a truthful status.

Stop if an index, path, hash, decision, Codex review record, CI result,
condition, or canonical promotion disagrees. Do not infer the intended value.

## Provisional hard-cut mechanics

The existing release topology has no runtime UI feature-flag system. This draft
therefore assumes reviewable source commits and an inactive exact-main preview,
not learner-visible old/new variants, cookies, local-storage flags, traffic
splits, or a second renderer.

Within an implementation branch, each tranche hard-cuts all source-inventory
consumers assigned to that tranche. Static fallback and React presentation for
the same route migrate together. Old selectors may remain temporarily only when
the exact inventory assigns their last consumer to a named later tranche; old
and new selectors must never style the same migrated element. Tranche 8 removes
all obsolete selectors, copy owners, temporary assertions, and compatibility
paths before a release candidate exists.

If accepted upstream decisions require a flag or staged traffic rollout, stop
and specify its canonical owner, offline behavior, cache/version identity,
durable-state behavior, privacy/analytics impact, cleanup condition, tests, and
rollback semantics before implementation. A generic flag framework is not a
specified fallback.

Tranche-local presentation boundaries cannot weaken the global dependency-
closure rule. Direct revert is permitted only for the current
unmerged tip or a dependency-closed suffix. Any earlier or nonclosed recovery
requires a forward fix, full rebuild, inactive preview, and recertification.
Atomic file groups below identify what must move together; they do not make an
earlier tranche, arbitrary range, or isolated presentation subset revertible.

## Provisional eight-tranche dependency order

The following order is derived only from current dependency topology. Its IDs
are provisional aliases. The accepted UI-foundations migration map and Step 5
conditions must replace it or record an explicit repository disposition after
rebase.

```text
1 characterize
  -> 2 foundations and controls
  -> 3 shell and navigation
  -> 4 static reference routes
  -> 5 question and review
  -> 6 hazard and simulation
  -> 7 local data, offline, correction, status, and print
  -> 8 remove legacy projections and run candidate-bound closure
```

### Tranche 1: Characterize current behavior and close confounders

**Contract slots:** All accepted Step 02–05 repository-attestation coordinates,
including the Step 04 source-inventory commit, are prerequisites for final
sequencing. The four current confounder dispositions require explicit
maintained-contract readings;
none is supplied by this draft.

**Scope:** Reconcile the exact current path/string/selector inventory and add
behavioral characterization around `generate-pages.tsx`,
`session-navigation.ts`, the question, review, hazard, and simulation
bootstraps, and offline-pack restoration. Distinguish the simulation renderer's
existing save gating from the state-blind generated question/hazard links. Keep
settings preference restoration in scope as a separate correctness boundary.
Keep any separately repository-attested correctness repair in its own atomic
slice, separate from styling or language changes.

**Preserved invariant:** No visual observation is allowed to mask a current
state, restoration, navigation, or variant correctness defect.

**Review slice:** Characterize and, only after separate repository attestation,
resolve in its own slice:

1. generated Previous/Next links whose replace-navigation policy does not
   consult the player commit/restoration state;
2. offline pack UI that begins with `packs=[]`, restores asynchronously, and
   can project an empty message before restoration is known complete; and
3. question review documents that carry `review-player` route identity while
   the shared question bootstrap renders the current practice composition, plus
   hazard review entries that currently link to hazard-player practice routes
   even though the maintained state contract requires explicit review variants;
   and
4. `apps/site/src/settings/react/settings.tsx`, which initializes default
   preferences with `busy=false`, begins the authoritative IndexedDB load
   asynchronously, persists the current React projection, and has no restoring-
   state condition on preference controls or Save. Require an explicit
   restoring state and disable every preference control and Save until
   authoritative load or a visible handled failure completes.

**Verification:** Run focused unit and browser tests for history/reload,
pending/failed durable work, restoration-versus-empty, explicit review/practice
composition, focus, accessibility-tree state, and answer-leak closure. Add a
focused delayed-settings-load test that proves all preference edits and Save are
disabled, no default write occurs, stored values win after success, and a load
failure exits restoring only through a visible handled-failure state. Then run
`bun run verify` and the complete browser suite on exact Bun 1.4.0.

**Rollback boundary:** Direct revert is permitted only for the current unmerged
tip or a dependency-closed suffix. Any earlier or nonclosed recovery requires a
forward fix, full rebuild, inactive preview, and recertification. This tranche
cannot change database versions, record schemas, cache protocols, route scope,
content artifacts, or visual contracts.

**STOP conditions:** Stop on an incomplete inventory, irreproducible behavior,
conflict with maintained state contracts, any fix that needs a new product
decision, or unresolved disagreement about the baseline browser evidence.

### Tranche 2: Adopt semantic foundations, controls, and feedback

**Contract slots:** Accepted visual tokens, component/foundation anatomy,
accessibility behavior, responsive rules, consumer terms, and the exact selector
inventory must all be non-null in the graduated plan.

**Scope:** Hard-cut accepted controls, fields, choices, actions, status,
recovery, error, empty, notice, and feedback foundations across their assigned
static templates and React leaves. Preserve native semantics and the current
renderer-neutral provider/controller boundary.

**Preserved invariant:** Components project state and semantic actions. They do
not construct runtimes, read persistence directly, introduce workflow booleans,
or become a second source of truth.

**Review slice:** Introduce only accepted tokens and component anatomy, migrate
every inventory-assigned consumer, and delete that consumer's old selector in
the same slice when no later owner remains. Do not create a speculative shared
package or new dependency.

**Verification:** Native role/name/state assertions; provider/compound contract
tests; error-summary focus; live-region behavior; forced colors; reduced
motion; 320 CSS-pixel reflow; target sizing; static/island parity; zero
React/Effect/study-runtime closure on static routes while retaining the minimal
preference/connectivity boot; and per-family raw/gzip/Brotli measurements.

**Rollback boundary:** Direct revert is permitted only for the current unmerged
tip or a dependency-closed suffix. Any earlier or nonclosed recovery requires a
forward fix, full rebuild, inactive preview, and recertification. The atomic
unit contains component, CSS, and template changes and cannot include controller,
durable-record, content-schema, IndexedDB, service-worker, or asset-identity changes.

**STOP conditions:** Stop while any accepted token/foundation slot is null, if
one migrated element receives both old and new rules, if a component needs
runtime/persistence ownership, if static routes gain React/Effect closure, or
if any current bundle ceiling is exceeded.

### Tranche 3: Hard-cut the document shell and navigation

**Contract slots:** Accepted consumer shell language, task hierarchy, labels,
navigation behavior, visual shell contract, document-shell anatomy, responsive
behavior, and route inventory are mandatory.

**Scope:** Migrate the generator-owned header, footer, skip link, breadcrumbs,
document wrapper, primary/utility navigation, player shell, static
offline/status shell, and terminal documents as one coordinated producer cut.
Keep `apps/site/scripts/service-worker-finalization.ts` as the deterministic
cache-version and precache primitive rather than duplicating that logic.

**Preserved invariant:** The result remains a multi-document site with one
useful `main`, one route heading, truthful recovery, stable route identity,
useful no-JavaScript content, and no SPA router.

**Review slice:** Update the canonical generator and narrow terminal-shell
owners, regenerate the full document closure, update current-shell/offline
closure where required, and remove superseded shell selectors/copy owners.

**Verification:** Canonical/robots/sitemap and route-ID closure; link crawl;
landmark and heading order; skip-link behavior; active navigation; compact
keyboard navigation; no-JavaScript usefulness; 320px and true-400% reflow;
static-route closure; cached navigation; terminal identity; print chrome
removal; and Chromium/Firefox/WebKit route checks.

**Rollback boundary:** Direct revert is permitted only for the current unmerged
tip or a dependency-closed suffix. Any earlier or nonclosed recovery requires a
forward fix, full rebuild, inactive preview, and recertification. Generator,
shell, CSS, and service-worker finalization form one atomic closure; never upload
a cache namespace from a half-migrated shell.

**STOP conditions:** Stop on a path/label/grouping absent from accepted
contracts, a proposal to generate omitted route placeholders, duplicated
per-route shell authority, interactive runtime on static routes, or drift in
canonicals, offline shells, or terminal identities.

### Tranche 4: Hard-cut currently implemented static and reference routes

**Contract slots:** Accepted language, task-navigation, visual-territory,
route-archetype, responsive, fact/source presentation, and exact source-owner
assignments are mandatory.

**Scope:** Migrate only currently generated Home, exam/profile, study hub,
atlas index/family/tool, sources/transparency, privacy, security, FOIL,
corrections information, and other static/reference surfaces assigned here by
the rebased inventory. The hazard landing belongs only to Tranche 6; the status
and recovery route belongs only to Tranche 7. Omitted maintained routes remain
omitted until their existing publication gates pass.
Treat `RELEASE-INVARIANTS.md`, `tools.json`, and `comparisons.json` under
`content/authoring/visuals/releases/` as immutable consumption contracts and run
`verify-visual-release.mjs`; this tranche owns presentation, not lifecycle data.

**Preserved invariant:** Substantive semantic HTML, exact fact states,
provenance, taxonomy, practice eligibility, image identity, version identity,
offline-stale truth, and zero React/Effect/study-runtime closure beyond the
minimal preference/connectivity boot remain intact.

**Review slice:** Move each complete inventory-assigned route group to its
accepted archetype. Change only repository-attested consumer presentation/copy owners;
scored content, exam facts, source claims, eligibility, and accepted raster
bytes remain unchanged.

**Verification:** Static closure; no-JavaScript purpose; source/fact-state and
conditional-publication integrity; canonical identity; long-content and large-
text reflow; image dimensions and no decisive cropping; offline-stale behavior;
print transformation; cross-route archetype comparison; and zero React/Effect
closure.

**Rollback boundary:** Direct revert is permitted only for the current unmerged
tip or a dependency-closed suffix. Any earlier or nonclosed recovery requires a
forward fix, full rebuild, inactive preview, and recertification. Generator
templates, CSS, and copy mappings form one atomic closure and cannot change
compiled evidence, taxonomy, source records, visual bytes, or practice eligibility.

**STOP conditions:** Stop if copy changes an exam fact or unknown, an accepted
copy/archetype slot is absent, a static route gains runtime closure, an omitted
route would need a placeholder, or unrelated route families collapse into an
unattested generic template.

### Tranche 5: Hard-cut question practice and review

**Contract slots:** Accepted question/review language, navigation
responsibility, player archetypes, explicit variant anatomy, responsive rules,
and all integrated-validation conditions are mandatory.

**Scope:** After Tranche 1 closes its state gates, migrate question practice,
question review item, review queue, generated fallback, route bootstrap,
compound components, feedback, status, and in-session navigation together.
Record the hazard-review variant boundary explicitly for Tranche 6; it may not
remain an unowned practice-route link.

**Preserved invariant:** Selection stays editable until explicit commit;
authoritative persistence succeeds before any feedback read/reveal; retry is
idempotent; practice and review use explicit correct variants; precommit output
remains answer-free.

**Review slice:** After the named composition dependency is repository-attested,
make validated route/state identity project only that bound composition. Keep
renderer-neutral controllers and persistence unchanged unless a separate
repository-attested correctness slice proves a necessary change. Static fallback
and island semantics migrate together.

**Verification:** Commit failure/success/reconciliation; duplicate prevention;
practice/review variant identity; DOM/accessibility-tree/chunk/source-map/cache
answer-leak scans; keyboard completion; focus and announcements; back/forward,
reload, and BFCache; pinned offline content; long-content reflow; forced colors;
reduced motion; and bundle ceilings.

**Rollback boundary:** Direct revert is permitted only for the current unmerged
tip or a dependency-closed suffix. Any earlier or nonclosed recovery requires a
forward fix, full rebuild, inactive preview, and recertification. Route
generation, React composition, and CSS form one atomic closure. Durable schema
or event-shape changes require a separately reviewed data migration.

**STOP conditions:** Stop if feedback can reveal after in-memory-only failure,
review mounts practice composition, navigation can leave an illegal state,
visual/nonvisual identities collapse, answer-bearing material crosses the
precommit boundary, or an accepted contract slot is null.

### Tranche 6: Hard-cut hazard and simulation journeys

**Contract slots:** Accepted hazard/simulation language, navigation ownership,
player/viewport archetypes, control anatomy, responsive behavior, asset-use
rules, and integrated-validation conditions are mandatory.

**Scope:** Migrate hazard landing/player visual and nonvisual variants, the
explicit hazard-review variant assigned by Tranche 5, plus simulation
setup/player/results, shared controls, viewport, marker/zone navigation,
results, generated fallback, and bootstraps.
Consume `content/authoring/visuals/releases/scenes.json` without changing its
18-scene identity, artifact, companion-record, or publication-gate closure, and
run `verify-visual-release.mjs` for this tranche.

**Preserved invariant:** Zero marks remains a valid explicitly confirmed input;
visual and nonvisual tasks remain distinct constructs; simulation withholds
correctness until durable final submission; exact session/content/asset pins
survive reload, updates, and connectivity changes.

**Review slice:** Adopt accepted shared foundations without forcing genuinely
different hazard and simulation transitions into one universal component.
Accepted raster assets may be placed according to contract but must not be
redrawn, cropped decisively, regenerated, or reinterpreted.

**Verification:** Zero/multiple marks; keyboard marker/zone operation;
pan/zoom/reset; visual/nonvisual separation; autosave/restoration/final-submit
reconciliation; no early simulation feedback; exact asset receipt closure;
focus/live regions; 320px/400% reflow; forced colors; reduced motion; offline
continuation; grayscale and print behavior; and bundle ceilings.

**Rollback boundary:** Direct revert is permitted only for the current unmerged
tip or a dependency-closed suffix. Any earlier or nonclosed recovery requires a
forward fix, full rebuild, inactive preview, and recertification. Component,
generator, and CSS changes form one atomic closure and cannot alter persisted
records, cache keys, asset hashes, IDs, or eligibility.

**STOP conditions:** Stop if controls obscure decisive pixels or require a
precision gesture, simulation exposes early feedback, asset identity changes,
new imagery is required, accepted contracts are null, or a cache/state migration
would be needed.

### Tranche 7: Hard-cut local data, offline, correction, status, and print

**Contract slots:** Accepted utility language, navigation, local-state/recovery
foundations, utility and print archetypes, responsive/print rules, integrated
conditions, and any separately repository-attested state-migration decision are mandatory.

**Scope:** First close false restoration projections. Then migrate settings,
preferences, transfer, reset, review rebuild, offline packs, correction draft,
the status/recovery route and its terminal-state presentation, print builder,
and print preview. Recompute service-worker and pack navigation closure only
where the accepted route/component cut requires it.
Preserve `apps/site/src/study-storage/app-database.ts` as the scoped lifecycle
owner and `app-database/legacy-import.ts` as the atomic import/quarantine owner;
do not fold either into UI state. Preference controls and Save remain disabled
through the explicit restoring state until authoritative load or a visible
handled failure completes.

**Preserved invariant:** Restoration precedes empty/success claims; no pack
download or correction submit is implicit; pack states remain distinct and
prior valid packs survive failures; local records stay authoritative and
portable; print identity and question/key separation remain deterministic.

**Review slice:** Default to no database version, store, record schema, cache
key/prefix, active-pack pointer, transfer envelope, or service-worker protocol
change. If accepted requirements genuinely need persistent-state change, stop
and extract an exact versioned migration with decoders, idempotent upgrade,
quarantine, byte preservation, failure recovery, compatibility, and rollback
proof before returning to presentation work.

**Verification:** Authoritative restoration; preference mirror failure;
v4-to-v5 preservation baseline; import/export checksums, preview, atomicity, and
quarantine; reset scope; correction draft no-network behavior; quota/write and
multi-tab failures; pack stage/verify/activate/retain/remove/retry; active-pack
survival; service-worker install/wait/activate/update; offline navigation;
deterministic print regeneration; answer separation; Letter/A4 normal/large
layouts; grayscale; physical print; accessibility; and bundles.

**Rollback boundary:** Direct revert is permitted only for the current unmerged
tip or a dependency-closed suffix. Any earlier or nonclosed recovery requires a
forward fix, full rebuild, inactive preview, and recertification. An IndexedDB
or cache-protocol migration cannot be recovered by serving old JavaScript;
require backward-read compatibility or a tested forward-fix runbook before any
separately repository-attested state slice.

**STOP conditions:** Stop on any unattested state/cache change, restoring data
presented as empty, failed updates displacing the active pack, correction intake
or remote collection becoming active, print clipping or key leakage, incomplete
Codex technical print evidence, or null contract slots.

### Tranche 8: Remove obsolete projections and run candidate-bound closure

**Contract slots:** Every accepted Step 02–05 repository-attestation coordinate,
the exact Step 04 inventory commit, every integrated-validation condition and disposition, and
any separately accepted rollout/observability decision are mandatory. The live
production Environment boundary remains outside every tranche.

**Scope:** Give every old selector, token, string, template, component variant,
and generated projection one disposition: removed, retained with an accepted
reason, or owned by a non-UI compatibility boundary. Remove temporary migration
checks and produce one canonical release candidate for inactive preview.
Re-run `content/authoring/visuals/releases/verify-visual-release.mjs` to close
the unchanged tool, comparison, and scene release graph over the candidate.

**Preserved invariant:** The candidate has one implementation, no dual renderer
or hidden legacy theme, no unassigned visible string, no production-only code
path, and no production traffic or telemetry introduced by migration.

**Review slice:** Use three ordered release phases. Phase A, on the migration
branch, closes the Step 4 inventory, runs anti-AI-slop/internal-wording gates,
runs the complete automated matrix, and earns merge through independent Codex
review and CI. Phase B begins only after that exact commit is merged to `main`:
upload the inactive exact-main preview, complete Codex-executed
accessibility/zoom/device/print checks, rehearse the supported rollback
boundary, and land a certification-attestation-only follow-up when the evidence
is complete. The planning and migration sequence ends there. No Phase C
deployment action exists in Plan 009: the live `User` reviewer rule cannot be
satisfied by Codex, and Environment mutation requires separate authorization
and attestation.

**Verification:** `bun run verify`; full Chromium/Firefox/WebKit; local workerd;
route/canonical/artifact/answer-leak closure; per-family bundle measurements;
service-worker/offline/update/cache rollover; no-JavaScript static closure;
visual regression against accepted baselines; Codex-executed
assistive-technology matrix; true
400% zoom; Letter/A4 normal/large and grayscale physical print; canonical-host
preview checks; release-closure validator; inventory reconciliation; and clean
Git diff.

**Rollback boundary:** Direct revert is permitted only for the current unmerged
tip or a dependency-closed suffix. Any earlier or nonclosed recovery requires a
forward fix, full rebuild, inactive preview, and recertification. Platform
version switching cannot bypass dependency closure or durable-state and cache
compatibility proof.

**STOP conditions:** Do not enter Phase A if any accepted dependency is
null/unreachable/mismatched, Step 5 lacks an acceptable implementation
disposition or has a critical failure, or a condition has no owner. During
Phase A, stop and correct any legacy coexistence, budget, semantic,
accessibility, offline, print, or rollback failure before merge. Candidate work
stops after Phase B; production workflow dispatch is not part of this plan.

## Cross-tranche test and certification strategy

Each implementation slice must record its exact base/head, dependency snapshot,
source-inventory hash, changed canonical owners, generated projections, test
counts, bundle report, known gaps, and recovery boundary.
Verification runs at four levels:

1. **Focused characterization:** state/controller/pure-generation unit tests for
   the changed workflow and its failure paths.
2. **Route-family integration:** generated HTML, provider/React composition,
   storage, focus/live-region, history/reload, offline, print, and accessibility
   browser tests for the migrated family.
3. **Release closure after every tranche:** exact toolchain, content build,
   typechecks, all unit tests, site build, artifact/answer-leak verification,
   static zero-runtime rule, and per-family bundle ceilings.
4. **Candidate certification after Tranche 8:** all three browser engines, local
   workerd, inactive remote preview, Codex-executed
   AT/zoom/device/physical-print matrix,
   rollback rehearsal, and candidate-bound certification record. These checks
   do not satisfy the live production Environment reviewer.

Expected final-plan commands, after exact Bun 1.4.0 dependencies are installed:

| Purpose | Command | Expected result |
|---|---|---|
| Provisional packet guard | `node plans/validate-009-migration-draft.mjs` | Exit 0 only while the packet remains provisional and current |
| Full deterministic closure | `bun run verify` | Exit 0 without a toolchain override |
| Browser matrix | `bun run test:browser` | Chromium, Firefox, and WebKit pass with only documented intentional skips |
| Local Static Assets boundary | `NYCUSTODIAN_PLAYWRIGHT_PREVIEW=cloudflare bun run test:browser:chromium --grep @cloudflare` | Cloudflare-tagged Chromium cases pass |
| Terminal shell workerd | `bun run --filter @nycustodian/site test:terminal-workerd` | Exact GET/HEAD/terminal policy passes |
| Dormant correction boundary | `bun run correction-worker:test:workerd` | Disabled intake remains disabled |
| Diff hygiene | `git diff --check` | No output, exit 0 |

Do not lower, skip, or rewrite tests to make the accepted presentation pass.
Visual screenshots supplement semantic/state assertions; they cannot replace
storage, focus, announcement, history, offline, or reveal-boundary checks.

## Accessibility and performance budgets

Current automated accessibility gates cover axe WCAG A/AA serious/critical
findings, 320 CSS-pixel reflow, selected target sizes, forced colors, reduced
motion, focus/live-region mutations, and print-media behavior. Current design
constraints require 44 CSS-pixel primary targets and no unexplained exception
below the WCAG 2.2 AA minimum.

Candidate certification additionally requires Codex to execute and record the
exact candidate checks for NVDA+Firefox, VoiceOver+Safari on macOS and iOS,
TalkBack+Chrome on Android, JAWS when licensed, true 400% zoom in
Chrome/Firefox/Safari, US Letter and A4 in normal and large print, and grayscale
physical print. Missing technical capability yields preview-only evidence with
the exact gap recorded. These checks cannot satisfy the live Environment
reviewer and do not change any structured human-evidence field.

Current interactive closure ceilings are:

| Format | Ceiling | Recorded largest Settings closure | Recorded headroom |
|---|---:|---:|---:|
| Raw | 470,000 B | 468,355 B | 1,645 B |
| Gzip | 140,000 B | 139,994 B | 6 B |
| Brotli | 120,000 B | 118,248 B | 1,752 B |

Static routes retain a zero-byte React/Effect closure budget. No tranche may
raise these ceilings merely to fit the redesign. There is no current numeric
LCP/INP/CLS or field-performance budget. The final plan must either adopt an
accepted measured budget or preserve that absence as an explicit production
decision/stop; this draft does not invent numbers.

## Offline and state migration contract

The default migration is presentation-only:

- keep IndexedDB name `nycustodian-study-v1`, version 5, and all fifteen store
  identities;
- keep portable export v2 and the v1 normalization path;
- keep attempt/session/simulation/print/review/pack identity and transaction
  semantics;
- keep the preference mirror non-authoritative;
- keep cache namespaces, active-pack pointer ownership, pack receipts, safe
  precache, and item-scoped postcommit boundaries; and
- recompute route and asset closure through existing generators/finalizers.

Any accepted requirement that changes durable records, service-worker protocol,
cache identity, or transfer encoding becomes a separately repository-attested migration
before its UI tranche. It must define one canonical new representation,
ingress decoding, idempotent upgrade, quarantine, multi-tab behavior, exact
forward preservation, old-client/backward-read compatibility or an explicit
cut, and a rehearsed rollback/forward-fix path. An old static deployment is not
safe rollback proof after a forward-only state change.

## Anti-AI-slop and internal-wording removal gates

These are evidence and ownership gates, not permission to invent replacement
copy or styling:

1. The parallel source inventory must enumerate user-visible text in generated
   HTML, React leaves, error/status/recovery states, ARIA labels, live regions,
   metadata, offline fallback, print output, and no-JavaScript fallback.
2. Every visible string must map to one accepted consumer-language contract row,
   an exact fact/content owner, or an explicitly accepted technical/transparency
   exception. Unassigned strings block the next tranche.
3. Candidate internal terms currently visible in source—including
   “application-shell,” “device generation,” “shell build,” “opaque local,”
   “manifest,” “runtime,” “schema,” “claim,” and “reconcile”—must receive an
   accepted disposition. This list is an inventory seed, not a final banned-word
   list or replacement glossary.
4. Preserve canonical English exam terms, fact-state distinctions, provenance,
   privacy, unofficial status, uncertainty, security warnings, and recovery
   truth. Consumer wording must not erase them.
5. Reject fabricated official cues, pass guarantees, “actual question” claims,
   synthetic reviews/testimonials, artificial urgency, unsupported scoring or
   blueprint claims, decorative filler, and newly generated decorative imagery.
6. Compare route families side by side. Repeated hero/eyebrow/equal-card-grid/
   CTA treatment must be justified by accepted archetype assignment rather than
   generic visual repetition.
7. Require useful, specific headings and actions; no vague “explore,” “unlock,”
   “seamless,” “powerful,” or motivational filler may be introduced without an
   accepted content-contract reason.
8. Run the copy/structure checks after each tranche and over the complete built
   candidate, including accessibility and print projections.

The final automated lexicon, allowlist, route-archetype map, and copy hashes are
dependency slots. They remain undefined here.

## Analytics, observability, and rollout evidence

No launch analytics is the current accepted boundary. Diagnostics remain local;
CI retains failure traces/screenshots for 14 days. This draft adds no remote
logging, Web Vitals collector, analytics event, cookie, tracking storage,
correction intake, or production monitor.

Per-tranche evidence is commit-bound and repository-local: exact commands,
counts, artifact reports, bundle measurements, screenshots/traces on failure,
Codex technical-check records, known gaps, and rollback coordinates. If a later accepted
decision introduces remote observability, stop and specify purpose, fields,
consent, retention, deletion, redaction, network/offline behavior, security,
accessibility, owner, and shutdown path before implementation.

Rollout remains source/commit based, with branch-complete gates separated from
the merged-main closure run:

1. review hard-cut tranche commits without production traffic;
2. pass every branch-complete automated, inventory, and review gate;
3. merge the candidate and build exact current `main`;
4. upload an inactive preview version;
5. complete candidate-bound Codex technical certification and its attestation-only
   follow-up; and
6. stop before production workflow dispatch while the live required reviewer of
   type `User` remains configured.

There is no documented instant rollback workflow. Direct revert remains limited
to the current unmerged tip or a dependency-closed suffix. Every earlier or
nonclosed recovery uses a forward fix, full rebuild, inactive preview, and
recertification. Platform version switching cannot bypass source dependency
closure or compatibility with existing service-worker caches and
durable state.

## Ownership slots

The final plan must bind each UI/UX domain to exact Codex task IDs, independent
Codex review task IDs,
repository attestations, and CI evidence:

| Ownership domain | Current canonical owner | Required final Codex accountability record |
|---|---|---|
| Exam facts and scope | `docs/` authorities | Fact-check task + independent Codex review + CI |
| Consumer language | Pending accepted content-design contract | Step attestation + language task/review IDs + artifact hashes |
| Routes and navigation | `product/ROUTES.md` | Step attestation + navigation task/review IDs + generator CI |
| Visual tokens and responsive rules | `product/DESIGN_SYSTEM.md` | Step attestation + visual task/review IDs + artifact hashes |
| Component anatomy | `product/COMPONENT_ARCHITECTURE.md` | Step attestation + component task/review IDs + focused tests |
| State and persistence | `product/SCREEN_STATES.md` plus domain controllers/persistence | Implementation task + independent state/storage review + tests |
| Content/compiler | `packages/content`, `apps/content-compiler`, curated inputs | Implementation task + independent content/compiler review + CI |
| Accessibility | Product contracts and browser/AT/device gates | Codex certification task IDs + exact capability results + CI |
| Offline/service worker | Pack manager, persistence, finalizer, service worker | Implementation task + independent offline review + workerd CI |
| Print | Print model/controller/generation/CSS | Codex certification task + exact print evidence + CI |
| Release/rollback | Deployment workflows and certification record | Technical workflow evidence; no planning-task deployment authority |

Codex agents remain machine agents. Only structured metadata may encode current
human-evidence state. The external GitHub reviewer type remains a deployment
control and is not UI/UX evidence.

## Risk and rollback matrix

| Risk boundary | Evidence-backed failure mode | Required containment | Rollback boundary |
|---|---|---|---|
| Generator breadth | Shell, copy, routes, bootstraps, offline closure, and style projection share one producer | Small route-family diffs plus complete regeneration and closure checks | Global eligibility rule; generator, CSS, and every generated projection remain one atomic closure |
| Static/island parity | Shared classes and fallback/island markup can diverge | Migrate both representations in one tranche and test accessibility-tree parity | Global eligibility rule; static fallback and island presentation remain one atomic closure |
| Runtime ownership | Multiple islands can dispose shared runtime state incorrectly | One documented document-root owner and lifecycle characterization | Global eligibility rule; no per-island runtime fallback or isolated presentation recovery |
| Answer boundary | Hidden copy/assets/chunks/caches can reveal answers | Full DOM/chunk/source-map/filename/precache scan every tranche | Global eligibility rule plus a fresh answer-leak closure before candidate reuse |
| IndexedDB | Forward schema change can make old code unsafe | No schema change by default; separate migration and compatibility proof | Forward fix unless direct revert targets the current unmerged tip or a dependency-closed suffix and backward-read proof holds |
| Service worker | New shell/cache activation can strand mixed clients | Active-client update tests and exact cache closure | Global eligibility rule plus cache compatibility and a complete rebuilt closure |
| Offline pack | Route/asset change alters required navigation and receipts | Recompute descriptor/finalizer closure and prove old active pack survival | Preserve the prior active pack; use the global recovery rule for source changes |
| Bundle size | Settings has six bytes gzip headroom | Per-tranche closure measurement; no speculative dependency | Global eligibility rule; otherwise remove excess through a forward fix and recertify |
| Accessibility | Visual success can hide semantic/focus/AT regressions | Automated semantic gates plus Codex-executed exact-candidate matrix | Global eligibility rule; every recovery requires fresh affected accessibility evidence |
| Print | Screen redesign can clip or mix keys into blank packets | Deterministic and physical Letter/A4/grayscale checks | Global eligibility rule; print projection and durable job/content identity remain atomic |
| Release | No tested instant production rollback exists | Inactive preview, state/cache-compatible rehearsal, protected technical controls | Apply the global rollback contract above; otherwise mandatory forward-fix sequence |

## Explicit production stop conditions

The structured production status remains blocking if any one of these is true:

1. Any provisional lifecycle or unbound-dependency field in the structured
   metadata remains unchanged.
2. Any accepted Step 02–05 decision, merge, artifact, result, Codex review,
   condition, or Step 04 inventory coordinate is missing, unmerged, unreachable,
   mismatched, or contradicted by its canonical consumer.
3. Integrated validation is rejected, requests another round, contains an
   unresolved critical failure, or leaves an accepted condition unowned.
4. The four current correctness confounders are not characterized and given an
   explicit accepted disposition before their affected visual tranches.
5. Current-route and exact source-inventory maps disagree or an old/new consumer
   remains unassigned.
6. A static route gains React/Effect/study-runtime closure, a route placeholder is introduced,
   or normal document navigation becomes an SPA.
7. Commit-before-reveal, idempotency, answer-leak, exact content/asset identity,
   or durable restoration invariants fail.
8. A database, transfer, cache, or service-worker protocol change lacks its own
   accepted migration and compatible rollback/forward-fix proof.
9. Any raw/gzip/Brotli ceiling is exceeded, static closure is nonzero, or an
   accepted additional performance gate is unmet.
10. Automated browser/accessibility/offline/print gates fail or the exact
    Codex-executed AT/400%-zoom/device/physical-print matrix is incomplete.
11. Anti-AI-slop/internal-wording inventory has an unowned string, generic
    archetype use, unsupported claim, fabricated cue, or unaccepted exception.
12. Analytics, remote logging, tracking storage, correction intake, a runtime
    flag, traffic split, or a new backend appears without a separate accepted
    contract.
13. The exact merged candidate has not passed inactive remote preview, canonical
    host checks, and a rehearsed state/cache-compatible rollback boundary.
14. `docs/certification/production-v1.json` remains blocked, required deployment
    coordinates remain absent, or protected technical production-deployment
    controls remain unsatisfied.
15. The live `production` Environment retains its required reviewer of type
    `User`. Codex cannot satisfy that rule, and this plan cannot modify it. Any
    future Environment change requires separate authorization and repository
    attestation.

## Non-goals

- Do not implement or preview the redesign from this packet.
- Do not select final copy, terminology, labels, navigation, tokens, visual
  territory, type, spacing, color, responsive breakpoint, component anatomy,
  route archetype, or final tranche order.
- Do not reopen route/feature scope or create planned-route placeholders.
- Do not change exam facts, question content, scoring claims, taxonomy,
  eligibility, sources, accepted visual bytes, or secure-content boundaries.
- Do not introduce a UI package, design-system dependency, SPA router, dual
  renderer, universal application service, runtime-per-component, or generic
  feature-flag platform.
- Do not bump IndexedDB, rewrite local data, change cache identity, or activate
  correction submission as part of visual work.
- Do not enable analytics, remote observability, production traffic, domain
  purchase, outreach, or deployment.
- Do not dispatch the production workflow or change the live `production`
  Environment, required-reviewer rule, branch policy, secrets, or variables.
- Do not change any Plan 004–008 status or add this draft to the executable
  plan index.

## Rebase, reverify, and graduation checklist

The coordinator must provide the exact accepted Step 02–05 Codex-only
repository attestations, including decision/merge SHAs, CI run/head records,
independent Codex review hashes, canonical artifact coordinates and conditions,
and the exact Step 04 source-inventory commit. Then a future planner must:

- fetch and rebase onto current `origin/main` without force;
- reread maintained authorities and the installed Effect guidance;
- regenerate and diff the current-file map;
- reconcile the Step 04 inventory path by path;
- populate and verify dependency coordinates in a deliberately graduated
  schema;
- replace provisional tranche aliases/order with the accepted migration map;
- convert conditional verification into evidence-linked machine-checkable
  acceptance criteria;
- preserve all unresolved conditions and open release gates;
- run exact Bun 1.4.0 full verification and browser tests;
- receive independent Codex cold review; and
- only then publish an executable Plan 009 index row in a separate reviewed
  Codex-reviewed change.

## Validation for this provisional packet

These commands verify only draft integrity and scope:

```bash
node --check plans/validate-009-migration-draft.mjs
node plans/validate-009-migration-draft.mjs
node plans/validate-009-migration-draft.mjs --self-test
node --experimental-strip-types scripts/check-maintained-layout.ts
git diff --check
```

For the staged packet, the author verified the official Bun 1.4.0 Linux x64
archive against its release `SHASUMS256.txt`, installed the committed graph with
`bun install --frozen-lockfile` under Node 22.22.0, and passed `bun run verify`.
The complete local Playwright matrix also passed with 172 cases and 26
configured skips across Chromium, Firefox, and WebKit. Draft-PR Certification
must repeat the exact-toolchain and browser/workerd gates on the committed SHA;
these local results do not authorize implementation or production.
