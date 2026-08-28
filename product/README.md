# Product specification

This directory is the implementation-facing product contract recovered and normalized from prior project work. It is deliberately separate from `../docs/`, which remains the authority for exam facts, test scope, provenance, and unresolved factual questions.

## Authority order

1. **Exam truth and scope:** `../docs/FACTBASE.md`, `../docs/SCOPE.md`, `../docs/TAXONOMY.md`, `../docs/OPEN.md`.
2. **Current implementation constraints:** `ARCHITECTURE_CONSTRAINTS.md`.
3. **Canonical page implementation:** `ROUTES.md`, `SCREEN_STATES.md`, and
   `COMPONENT_ARCHITECTURE.md`, with presentation rules in `DESIGN_SYSTEM.md`.
4. **Product behavior and UX:** `FEATURE_SPEC.md`, with public wording governed
   by `CONTENT_DESIGN.md`.
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
- `CONTENT_DESIGN.md` supplies the selected task-first copy layers, public
  vocabulary, error/recovery structure, progressive evidence disclosure, and
  explicit `CODEX-ONLY-UIUX-V1` limitations. It is **NOT
  HUMAN-USABILITY-TESTED**.

Together these files are the implementation-facing UI plan. New pages,
components, modes, and boolean behavior props must be reconciled here rather
than emerging ad hoc in `apps/site`.

## Implementation status

The accepted graph at `../apps/site`, `../apps/content-compiler`,
`../packages/content`, and `../packages/correction-intake`, plus the dormant
`../apps/correction-worker`, now contains the reviewed English launch-content
revision on the integrated M1–M5 platform. It is still not a production release
or release certification. The compiled release closes over all 65 accepted
tool/PPE masters, all 14 accepted
comparison panels, 90 original source-backed questions, all 18 hazard scenes,
the statewide profile, and a substantive source-bound Nassau profile.

The generated closure includes 65 tool pages, all 14 accepted comparison panels
at unique anchors across nine owning family pages, both profile routes, 18
visual and 18 nonvisual hazard routes, a 90-item review route set, deterministic
no-repeat practice routes for the advertised 45/60/90 whole-bank sets, and the
M4/M5 simulation, print, offline, settings, reporting, and recovery surfaces.
Every filtered pool is currently below 45, so every filtered advertised length
is rendered disabled rather than hiding repeats. Twelve watchlist or gated
tools remain crawlable in the atlas but are mechanically excluded from scored
questions.

The authored launch facts, prompts, distractors, explanations, and per-option
source bindings live in a human-reviewable curated module. A deterministic
builder may validate, join, and format those records, but may not invent
instructional text. The compiler enforces unique objective and equivalence-group
identities, claim/source-line and review-receipt closure, profile fact-sheet
history, accepted visual hash closure, and atlas-only scoring exclusions.
Postcommit, UI, and print-visible answer explanations retain their exact source
receipts.

M4 supplies deterministic simulations and immutable exact-ID print products;
M5 supplies the receipt-rooted pack lifecycle, authoritative preferences,
checksummed transfer/quarantine, scoped reset, review rebuild, and local-first
correction drafts. The correction Worker remains dormant with no production
bindings, routes, or data collection. On the integrated candidate, the exact
Bun `1.4.0` / Node `22.22.0` deterministic gate passes 352 unit tests, 396
visual hashes, five workspace typechecks plus the browser harness typecheck,
the 526-document/46-safe-shell-URL production build, and artifact, bundle,
answer-leak, and retained-asset closure. The complete browser matrix passes 172
Chromium/Firefox/WebKit cases with 26 intentional project-specific skips, and
both local workerd boundaries pass. Manual certification, the canonical
production host, credentials, and remote preview/deployment remain unresolved;
automated checks do not replace the required production matrix.

A separately authored print-system deliverable discussed in an earlier chat was **not located** as a durable Library artifact during this pass. The recovered feature specification contains the durable print contract; chat-only recollections are not silently promoted into this repository.
