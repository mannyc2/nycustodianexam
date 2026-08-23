# R2.90 architecture synthesis report

## Executive result

R2.90 has enough completed lane evidence to choose an implementation-ready first
architecture. This is the **first** R2.90 synthesis, not a redo. It does not claim
that the application or launch content bank already exists.

The recommended first slice is a three-workspace Bun repository:

```text
apps/site
apps/content-compiler
packages/content
```

It uses an exact synchronized Effect v4 cohort, a finite Bun compiler root, one
browser `ManagedRuntime`, semantic static HTML with a lazy direct-DOM player,
project-owned persistence contracts, native service-worker lifecycle, Vite, and
Cloudflare Static Assets. `packages/study` and `apps/worker` are not created until
their consumer or endpoint boundaries actually exist.

## Direct answers to the motivating questions

### Was R2.9 done?

Yes. R2.9 was completed and merged as **hazard-scene production architecture
research**. It defines semantic manifests, region/final-pixel agreement, review
contracts, and a deterministic-first candidate pipeline. It did not produce or
approve the launch scene bank, and its planned scene pilot did not run. “Research
lane complete” and “production visuals complete” are different states.

### Is R2.6 output enough?

Yes for the architecture decision and the first implementation handoff. The
recovered R2.6 branch contains current Effect `4.0.0-rc.111` source/API mapping,
compiler phases, diagnostic and validation contracts, deterministic addressing,
manifest-last publication, executable fixtures, four passing tests, and stable
repeat hashes.

It is not a production compiler. The workspace still must select a location-aware
JSONC adapter, freeze a canonical JSON profile, implement the full project model,
and execute the clean Bun 1.4.0 scaffold gate. Those are bounded implementation
tasks, not reasons to repeat R2.6.

### Does “run R2.90” mean redo it?

No. Before this branch, there was no published R2.90 synthesis artifact. The lane
was planned but not executed. This report performs the first cross-lane decision
pass using R2.1 through R2.10, including the recovered R2.6 evidence.

## Lane disposition

- R2.1-R2.4 and R2.7-R2.9 are merged and useful, with their original blocked or
  provisional claims preserved.
- R2.5 is merged but explicitly incomplete: it supplies a measurement topology,
  not current-v4 byte measurements or numeric budgets.
- R2.6 is recovered, executable, and published as draft PR #22. It is sufficient
  to adopt the compiler boundary.
- R2.10 is merged research but evidence-blocked: the claimed POC bundles are
  absent and no tool asset is production-approved.
- The open hazard SVG prototype is not treated as accepted lane evidence.

No missing execution has been converted into a positive claim. The first vertical
slice deliberately runs the unresolved workspace, browser, storage, bundle, and
accessibility gates.

## Accepted architecture

### Toolchain and graph

- Proposed first lock: Bun `1.4.0` and synchronized Effect
  `4.0.0-rc.111`, both exact and rechecked by a clean scaffold gate.
- Private apps/packages root, catalogs, isolated linker, `workspace:*`, real
  `bun.lock`, and runtime-specific TypeScript configurations.
- Three initial workspaces. Study policy remains a module inside the site until a
  second consumer or clear independent ownership boundary earns a package.

### Effect boundary

- Pure functions own deterministic validation, state transitions, ordering,
  scoring, canonicalization, and policy.
- Focused services own cohesive I/O, lifecycle, substitution, or host capability.
- Each host composes its own root; there is no universal browser/Bun/service-
  worker/Worker Layer.
- Expected failures are typed. Author-facing multi-errors are stable sorted data.

### Content compiler

The accepted path is:

```text
authored JSONC
  -> structural decode and migration
  -> duplicate-preserving registry
  -> relational/provenance/review/accessibility/security gates
  -> validated corpus
  -> canonical immutable objects and page inputs
  -> recomputed closure and hashes
  -> release manifest promoted last
```

Invalid, unsupported, conflicting, inaccessible, stale, or source-less material
does not publish. Exact final asset bytes participate in identity and review.

### Browser, durability, and offline

- Semantic static HTML pays no Effect cost. The player loads lazily.
- Direct DOM is the smallest first renderer; renderer-neutral snapshots and
  commands preserve a cheap lit-html exit if complexity triggers appear.
- One strict native IndexedDB transaction commits the attempt event, projections,
  and session checkpoint. No reveal occurs before completion or same-ID
  reconciliation.
- Provider choice remains private. First-party Effect IndexedDB is tried against
  the exact real-browser contract; `idb@8.0.3` is the ready fallback.
- Packs stage and verify outside transactions and activate with a short generation
  flip. BroadcastChannel invalidates views but is never truth.
- Native service-worker code owns HTTP bytes. IndexedDB owns logical pack and
  learner truth.

### Delivery and verification

- Vite builds the browser assets; Cloudflare Static Assets hosts the first site.
- There is no Worker until an authorized endpoint requires one.
- Static routes have an immediate structural budget of zero Effect closure.
- Numeric budgets wait for actual production closures from the first slice; R2.5
  did not measure them.
- Bun test, `@effect/vitest`, Playwright in real Chromium/Firefox/WebKit, artifact
  scans, axe/custom automation, manual assistive-technology QA, print, and two
  clean builds have distinct responsibilities.

## Visual-production reconciliation

Codex-native image generation is compatible with deterministic application
builds when generation is treated as authoring rather than runtime behavior. The
accepted and reviewed final bytes, digest, dimensions, descriptions, nonvisual
equivalent, regions, and review records become immutable compiler inputs. A
future rebuild need not reproduce the pixels from the model; it must reproduce
the build from the accepted bytes.

The proposed pilot asks Codex to match the visual language of **publicly released
test samples** without copying a sample's composition or using recalled/secure
exam material. It measures native output size, one-at-a-time versus contact-sheet
consistency, obscure-tool mechanical fidelity, and phone/print legibility. One
image at a time is the default unless the pilot proves batching equally reliable.

This direction conflicts with maintained R2.9 language that rejects uncontrolled
text-to-image as the scored source. R2.90 records the conflict but does not silently
rewrite authority. A separate reviewed reconciliation PR must authorize the route
before scored visual production.

All Tier A/B concepts remain launch scope. Piloting and sequencing control risk;
they do not reduce the editorial universe.

## First implementation proof

The first slice takes one source-backed question through the real compiler,
static output, lazy player, strict commit-before-reveal transaction, offline
restore, accessibility/security/print gates, production route-closure
measurement, and a Cloudflare preview. It establishes or falsifies the provisional
choices before the codebase expands.

This slice is not a content-scope reduction. Once schema and review contracts are
stable, source/claim, question, tool-image, and hazard-scene production for the
full Tier A/B launch universe can proceed in parallel.

## Decision status

The detailed disposition is in `DECISION-MATRIX.csv`. In short:

- accept now: invariants whose evidence is sufficient and host-independent;
- accept provisionally: exact versions, graph, roots, renderer, and delivery
  choices that the first slice can cheaply falsify;
- implementation spike: Bun workspace and IndexedDB provider contracts;
- defer: backend Worker until a real endpoint exists;
- content pilot after authority review: Codex-native visual production.

`OPEN-QUESTIONS.csv` and `UNRESOLVED.csv` name every carried gap, its milestone,
owner, and required resolution artifact.

## Handoff

1. Review and accept or amend this proposal.
2. Reconcile maintained visual/content authority in a separate PR.
3. Scaffold only the proposed root and three workspaces.
4. Run the version/workspace gate before domain code.
5. Implement the compiler spine and first vertical slice exactly as specified.
6. Establish real bundle/browser/accessibility/provider evidence, then revise any
   provisional choice that fails its stop condition.

R2.90 ends at an implementation-ready decision and verification plan. It does not
authorize unreviewed content, claim an exhaustive official tool list, or predict
official exam form/scoring behavior.
