# Product specification

This directory is the implementation-facing product contract recovered and normalized from prior project work. It is deliberately separate from `../docs/`, which remains the authority for exam facts, test scope, provenance, and unresolved factual questions.

## Authority order

1. **Exam truth and scope:** `../docs/FACTBASE.md`, `../docs/SCOPE.md`, `../docs/TAXONOMY.md`, `../docs/OPEN.md`.
2. **Current implementation constraints:** `ARCHITECTURE_CONSTRAINTS.md`.
3. **Canonical page implementation:** `ROUTES.md`, `SCREEN_STATES.md`, and
   `COMPONENT_ARCHITECTURE.md`, with presentation rules in `DESIGN_SYSTEM.md`.
4. **Product behavior and UX:** `FEATURE_SPEC.md`.
5. **Illustration production:** `../illustration/`.
6. **Supporting investigations:** [`../research/README.md`](../research/README.md).
7. **Recovery bookkeeping:** `../recovery/CORPUS_RECOVERY.md`.

A lower layer must never silently promote an unknown exam fact into a product claim.

## Recovered feature contract

`FEATURE_SPEC.md` is a normalized durable version of the 3,427-line August 17, 2026 buildable feature specification recovered from the ChatGPT Library. The original recovered artifact is identified in the recovery ledger by SHA-256 so later source recovery can be mechanically compared.

The contract covers:

- page and route inventory plus shared loading/empty/ready/answered/reviewed/offline/error states;
- announcement/profile selection and fact-state rendering;
- tool atlas, tool families, procedures, and repair study;
- question-player commitment and explanation behavior;
- hazard-scene marking, decoys, zoned reveal, and nonvisual equivalents;
- session assembly, simulations, and local spaced review;
- print center and deterministic print output;
- conceptual content and progress data models;
- offline/PWA behavior and content-pack updates;
- WCAG 2.2 accessibility behavior;
- authoring, validation, security, privacy, and release gates;
- a deliberately tiny network surface and no required account.

## Maintained page and component plans

- `ROUTES.md` assigns stable route IDs and canonical path patterns to all 21
  recovered destination families, including child player/results/preview routes,
  indexability, static-versus-island ownership, offline behavior, navigation,
  errors, and milestones.
- `SCREEN_STATES.md` turns the broad recovered state vocabulary into legal typed
  state machines with durable transitions, recovery actions, focus/live-region
  behavior, browser history/restoration, and route-by-route offline rules.
- `COMPONENT_ARCHITECTURE.md` applies composition-first React 19 patterns to the
  selected islands. Generated acquisition/reference documents remain semantic
  HTML; React is not a SPA shell or router.
- `DESIGN_SYSTEM.md` supplies the shared token, layout, control, focus,
  responsive, forced-color, reduced-motion, and print contract used by static
  documents and islands.

Together these files are the implementation-facing UI plan. New pages,
components, modes, and boolean behavior props must be reconciled here rather
than emerging ad hoc in `apps/site`.

## Implementation status

The accepted graph began at `../apps/site`, `../apps/content-compiler`, and
`../packages/content`. The M5 lane adds `../packages/correction-intake` and the
dormant `../apps/correction-worker`; it is a controlled implementation proof,
not a release or release certification. From the validated packs, its generator emits 65
documents: two question routes, 18 visual hazard routes, 18 nonvisual hazard
routes, four public tool pages, offline/settings/report and policy routes, and the supporting documents needed to make up
that closed output.

Other planned destination families are intentionally absent when reviewed
machine-readable content is unavailable; the implementation does not substitute
placeholder pages for missing editorial inputs. M4 simulation/print remains
open. M5 now implements explicit receipt-rooted pack lifecycle, local
preferences, checksummed export/import/quarantine, scoped reset, local-first
correction drafts, and a dormant correction endpoint. M5 cannot close until the
M4 v4→v5 store/transfer/reset integration proof and complete release matrix pass.
Sitemap generation, the canonical production host, and deployment are also unresolved.

Browser CI is configured. On the current isolated M5 revision, all five
workspace typechecks, browser-test typecheck, 210 unit tests, the 65-document
production build, maintained-layout/module-boundary gates, artifact closure,
answer-leak checks, and all 34 standard Chromium cases pass locally. The seven
M5 browser cases cover dormant and accepted-but-locally-unpersisted correction
flows, authoritative preferences with mirror failure/cross-tab propagation,
transaction-counted reset, semantic portable import/apply-time drift,
generation-specific pack quarantine/restage, retained/removal actions, and
offline atlas navigation/image delivery from the active pack. This does not
replace Firefox/WebKit, manual accessibility/device/print certification, the
post-M4 integration gates, or release certification. Historical Bun `1.4.0`
frozen-install evidence remains recorded separately in `../docs/OPEN.md`.

A separately authored print-system deliverable discussed in an earlier chat was **not located** as a durable Library artifact during this pass. The recovered feature specification contains the durable print contract; chat-only recollections are not silently promoted into this repository.
