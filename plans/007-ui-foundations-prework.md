---
status: provisional-prework
participantEvidence: none
humanEvidence: none
humanParticipantCount: 0
notHumanUsabilityTested: true
reviewMode: codex-only
decisionStatus: pending
requiredDependencyShas: null
mustRebaseAndReverify: true
---

# Plan 007 UI foundations: provisional source inventory and contract packet

This packet is prework only. It inventories the current tree at
`9fc7dcacfc961752e5d9a2cedbc426deead54a05` and prepares dependency-neutral
templates for later Plan 007 execution. Exact accepted Step 2 and Step 3
Codex-only decision SHAs are not yet present. No
component API, token value, route archetype, responsive threshold, wording,
visual direction, decision, or Plan 007 gate is frozen here.

The packet intentionally does not modify
`product/COMPONENT_ARCHITECTURE.md`, `product/DESIGN_SYSTEM.md`,
`plans/007-specify-ui-foundations-and-responsive-contract.md`, or the Plan 007
status row. After the accepted Step 2 and Step 3 decisions land, all
observations and source coordinates must be rebased, rerun, reconciled against
those exact immutable outputs, and reviewed under `CODEX-ONLY-UIUX-V1` before
the real Plan 007 workflow can proceed. No Codex agent is a user or participant;
this packet has no human evidence and is not human-usability-tested.

## Source coordinate and inventory method

- Source base: `9fc7dcacfc961752e5d9a2cedbc426deead54a05`.
- Working branch: `codex/uiux-orchestration-04-component-contract`.
- CSS source: `apps/site/src/styles.css`; generated `public` output is not a
  second token or selector authority.
- Class-hook scan: direct quoted `class` and `className` attribute values in
  TypeScript/TSX render sources under `apps/site/src` plus
  `apps/site/scripts/generate-pages.tsx`. Template and conditional expressions
  are separately enumerated for inspection; they are not guessed into the
  literal-hook denominator.
- Token scan: custom-property declarations and `var()` references in the source
  stylesheet, compared by exact name.
- Route scan: `apps/site/src/route-registry.ts`, reconciled against all 21
  maintained rows in `product/ROUTES.md` and their legal-state rows in
  `product/SCREEN_STATES.md`.
- Owner scan: the static generator plus every `createRoot` entrypoint and its
  principal React render owner.
- Test scan: tracked Vitest files with separate direct `it(`, `it.each(`, and
  `it.effect(` callsite sets; literal Playwright `test(` declarations;
  configured browser projects; and focused inspection of axe, keyboard, focus,
  320px, large-text-attribute, forced-color, reduced-motion, and print coverage.
  The validator rejects any newly observed `it.*` form until the inventory is
  deliberately extended.

The executable validator recomputes the exact token, selector, literal hook,
route, React-root, and browser-test sets. It also verifies that protected
product/plan files still match the recorded base and that only this packet's
three files changed.

## Current inventory findings

At the recorded base, the source stylesheet has 927 lines, 74 distinct custom
property definitions, 63 distinct references, 121 class selectors, and 11
attribute-selector forms. Two references are unresolved:
`--shadow-card` at `apps/site/src/styles.css:739` and `--text-lg` at
`apps/site/src/styles.css:823`. Their eventual disposition depends on the later
visual-system work; this packet assigns them to characterization without naming
replacement values.

The bounded literal-hook scan finds 143 distinct source hooks, of which 41 have
no matching source CSS class selector. Four additional finite marker-modifier
hooks are generated dynamically and also have no matching selector. The
unmatched literal set includes 15
`hazard-player` hooks, split status/error/form vocabularies, simulation hooks,
print-semantic hooks, and `review-notice`. A missing selector is an inventory
fact, not proof that every hook needs a visual rule: the later migration must
choose keep/style/consolidate/remove for each exact producer.

The rendered-hook scan also records 45 distinct `data-*` attributes across the
static generator, JSX, DOM `setAttribute`/`toggleAttribute` calls, and the
tracked offline terminal document. This keeps behavioral selectors, island
mounts, route identity, presentation modes, and test-facing metadata visible
without treating generated `public/styles.css` as a second source authority.

There is no shared `components` or `foundations` source owner. The static shell
is centralized in `apps/site/scripts/generate-pages.tsx`, while 11 bounded React
roots independently emit buttons, fields, statuses, live regions, progress,
dialogs, and layouts. Current question and hazard contexts are useful
composition references because they expose narrow `state`/`actions`/`meta`
contracts, React 19 `use()`, provider shorthand, and semantic leaves. They do
not by themselves establish a cross-route API.

The current registry implements 27 stable route IDs spanning 17 of 21
destination families. `exam-checker`, both procedure routes, `repair-lab`, and
`faq` have no current implementation owner; the four acquisition spokes are
also absent. The prework maps all maintained families but never invents current
files for absent routes.

### Responsive and adaptation gaps

- `html` and `body` both impose `min-width: 20rem`; 125% root text therefore
  produces a 400 CSS-pixel floor and deterministic overflow at 320px.
- `.question-card` declares `container-type: inline-size`, but the stylesheet
  contains no `@container` rule.
- The only viewport transformation is `@media (max-width: 46rem)`, affecting
  the reference layout and question-control buttons.
- Forced colors, OS and in-product reduced motion, and print rules exist, but
  current automated coverage exercises narrow surfaces rather than route/state
  closure.
- Ten hazard marker movement/removal buttons do not receive the current
  `.button` target rule. That is a testable target-size gap, not authorization
  to restyle production in this step.

## Dependency-neutral shared contract template

Later Plan 007 records one contract per foundation or compound. Until the
dependencies land, each record keeps these fields open:

1. stable identity, purpose, and explicit non-purpose;
2. native semantic DOM and required accessible relationships;
3. content owner, static-template owner, React-leaf owner, and selector owner;
4. named structural variants and legal state projections, with no behavioral
   boolean mode API and no `renderX` structural prop;
5. slots composed through children or compound pieces;
6. interactive `state`/`actions`/`meta` responsibilities and lifecycle owner;
7. focus, announcement, loading, empty, offline, locked/unavailable, success,
   destructive confirmation, disabled, busy, failure, and retry behavior;
8. constrained, ample, large-text, forced-color, reduced-motion, and print
   behavior, with thresholds still pending real content;
9. stable test IDs or semantic locators, public-precommit/answer-bearing
   boundary, and static/React parity assertions;
10. exact current producers to migrate, counterexamples not to generalize,
    removal criteria, and a STOP boundary.

Native HTML remains the default. A React wrapper is justified only by shared
behavior, state adaptation, ownership, or reuse; CSS classes alone do not create
a component API. Interactive compounds expose explicit variants and a narrow
context. Providers adapt renderer-neutral snapshots and semantic commands; they
do not own durable truth, create runtimes during render, or let leaves call
storage/controllers directly.

### Provisional foundation checklist

The machine payload covers the exact 13 maintained foundation IDs:
`document-shell`, `page-header`, `layout-primitives`, `prose-lists`,
`action-controls`, `form-controls`, `action-bar`, `feedback-page-states`,
`live-region`, `progress-position`, `disclosure-dialog`,
`figure-image-viewport`, and `visually-hidden`. For every row, API status,
visual-token status, and decision status remain `pending`.

Cross-cutting state rules for the later contracts are:

| State family | Dependency-neutral behavior to preserve and test |
| --- | --- |
| Default/ready | Useful semantic route purpose exists before island activation; precommit render contains no correctness data. |
| Loading/busy | Preserve useful shell/content, name the operation, retain focus, prevent conflicting commands, and do not show false empty/default truth. |
| Empty | Render only from authoritative zero results with scope and recovery; never use empty for unavailable or unrestored data. |
| Error | Retain safe input, focus a titled summary after user-triggered failure, distinguish typed cause, announce once, and offer an idempotent recovery. |
| Offline/stale | Keep valid local content/actions, name exact freshness and unavailable network behavior, and do not move focus for background connectivity. |
| Locked/unavailable | Explain the exact missing capability or content closure; do not create disabled-looking affordances that still navigate or reveal. |
| Success/reveal | Render only after the owning authoritative operation settles; focus the outcome/result heading without duplicating full prose in a live region. |
| Destructive confirmation | Name exact scope and consequences, keep cancellation safe, and restore focus to the invoker. |
| Focus | Maintain visible, unobscured `:focus-visible`; route, error, reveal, dialog, and next-item targets remain explicit presentation effects. |
| Disabled | Use native disabled semantics where applicable and explain learner-fixable conditions; distinguish disabled, unavailable, and busy. |

Content ownership is also fixed as a question for every later record: `docs/`
owns exam truth; maintained product documents own behavior; reviewed content
records own learner-facing facts and explanations; the static generator owns
safe document structure/fallbacks; domain snapshots own interactive state;
React leaves render the snapshot; CSS owns presentation only. Internal enum,
storage, schema, and orchestration language must not leak into learner copy.

## Route-family and archetype templates

Seven working template labels are retained only to make later reconciliation
mechanical: `orientation`, `study-launcher`, `browse-reference`,
`focused-task`, `review-results`, `utility`, and `recovery`. Their candidate
route projection in the machine payload is pending and may be replaced after
the Step 2 and Step 3 decision SHAs land. Families 12–15 can have multiple candidate templates because
their stable routes perform different tasks.

Every template has the same dependency-neutral slots:

- route purpose and unique heading;
- navigation/context region;
- primary content/task region in DOM reading order;
- status, error, empty, offline, and recovery region;
- supporting evidence/provenance region;
- primary and secondary actions;
- static fallback and optional island owner;
- container owner and named intrinsic-overflow regions;
- compact/ample/large-text/forced-color/reduced-motion/print transformations;
- focus, announcement, history, leak, target-size, and route-closure tests.

No template in this packet has token inputs or thresholds. Those fields are
literal `null` so a later executor cannot mistake reference breakpoints or the
current stylesheet for a frozen decision.

## Proposed 30-state × 9-mode harness contract

The future harness has exactly 30 representative state IDs and nine mode IDs,
keyed uniquely by `(stateId, modeId)`. All nine modes are future automated
specifications, defining 270 planned rows: 320, 768, 1024, and 1440 CSS-pixel
widths; 125% in-product text; forced colors; reduced motion; print; and
`browser-zoom-400`. This packet contains zero harness rows because no
dependency-complete Plan 007 prototype exists. Current-site tests are
supplementary characterization only.

Each future automated row must assert, as applicable: semantic landmarks and
reading order; no page-level horizontal overflow; only named intrinsic-region
overflow; 44 CSS-pixel primary targets; visible/unobscured focus; stable focus
and announcement effects; no serious/critical axe result; non-color state cues;
forced-color operability; reduced-motion equivalence; deterministic print
separation; and public-precommit answer-leak closure. The future deterministic
400% mode must additionally record the browser/zoom mechanism, viewport,
overflow, sticky-control obstruction, and dialog/recovery operability. Codex
review of those artifacts remains non-user evidence and cannot be represented
as human usability testing.

## Eight-tranche current-file migration map

The migration map is planning input for a later implementation plan, not an
implementation authorization. Its eight ordered STOP boundaries are:

1. `characterization-and-validation`: derive exact tokens/hooks/routes and hold
   state fixtures; stop on source drift or any need to freeze dependency-owned
   choices.
2. `controls-and-feedback`: characterize controls, fields, action rows,
   statuses, errors, empty states, disabled/busy states, and recovery; stop on
   behavior, copy, focus, announcement, or persistence change.
3. `shell-and-navigation`: preserve static shell and history/route closure;
   stop because player navigation is not currently state-gated rather than
   hiding that defect with presentation.
4. `question-and-review`: preserve durable commit/reveal and explicit review
   acknowledgement; stop because review routes currently mount a practice
   variant until the intended behavior is separately established.
5. `hazard-and-simulation`: characterize shared viewport shapes without
   collapsing distinct visual/nonvisual or practice/simulation behavior; stop
   on geometry, verified-image, persistence, or final-reveal changes.
6. `atlas-and-reference`: migrate only existing owners and named intrinsic
   overflow; stop for documented-only families or dependency-owned content,
   evidence, rights, and hierarchy questions.
7. `utility-offline-correction-print`: distinguish restoration from real empty
   defaults and preserve pack/correction/print boundaries; stop because settings
   and offline islands currently initialize visible defaults before durable
   restoration.
8. `obsolete-selector-removal`: remove only after zero producers/references,
   static/React parity, full route/leak closure, dependency-complete automated
   30×9 evidence, three independent Codex review lanes, and green CI.

Every unmatched literal hook and unresolved token is assigned exactly once in
the payload. The validator derives the expected assignment set from the live
inventory, rather than trusting hand-entered totals.

## Evidence accounting and current-site validation

<!-- ui007-prework:evidence-accounting:start -->
```yaml
participantEvidence: none
humanEvidence: none
humanParticipantCount: 0
notHumanUsabilityTested: true
reviewMode: codex-only
participantEvidenceRows: 0
decisionRows: 0
humanEvidenceRows: 0
codexAgentsCountAsUsers: false
supplementaryEvidenceCanSubstituteForDependencyShas: false
realPlan007GateCredit: 0
```
<!-- ui007-prework:evidence-accounting:end -->

The machine payload records deterministic current-site commands only. These
checks can characterize the source base and catch regressions in static output,
keyboard behavior, focus, axe, 320px presentation, forced colors, reduced
motion, print, durable behavior, and repository structure. They do not validate
the absent Plan 007 prototype, produce participant or human evidence, make a
design decision, replace either upstream decision SHA, or change any plan
status. Codex review is structured engineering review, never a user study.

Static test inventory finds 30 site Vitest files with 177 direct `it`, seven
`it.each`, and 40 `it.effect` callsites (224 total); the full workspace has 39
files with 224 direct, 14 `it.each`, and 40 `it.effect` callsites (278 total).
The browser source has 11 Playwright files and 70 literal `test(` callsites.
Its one axe builder callsite scans two question states. Nine large-text
assertions verify preference/attribute behavior, not route-family reflow or
overflow; that broader presentation evidence remains absent.

## Remaining real Plan 007 gates

Before this prework can inform real execution, the coordinator must:

1. provide the exact immutable accepted Step 2 and Step 3 Codex-only decision
   SHAs through the fail-closed dependency interface;
2. rebase this branch/packet onto that dependency-complete `main` and rerun the
   inventory and all current-site checks;
3. reconcile language, navigation, visual tokens, surfaces, archetype mapping,
   thresholds, and content ownership with the promoted decisions;
4. execute Plan 007's real foundation/archetype/prototype artifacts rather than
   relabeling this packet;
5. produce all 270 automated state/mode rows and repeat the three independent
   `CODEX-ONLY-UIUX-V1` engineering-review lanes with dissent preserved;
6. promote maintained product docs and Plan 007 status only through the real
   reviewed workflow; and
7. leave production migration to its separately authorized implementation.

## Machine-readable provisional inventory

The bounded JSON below is an instance of
`plans/007-ui-foundations-source-inventory.schema.json`. It is kept inline so
the prose, exact source inventory, harness specification, migration assignments,
and evidence disclaimers cannot drift independently.

<!-- ui007-prework:inventory-json:start -->
```json
{
  "schemaVersion": 1,
  "status": "provisional-prework",
  "participantEvidence": "none",
  "humanEvidence": "none",
  "humanParticipantCount": 0,
  "notHumanUsabilityTested": true,
  "reviewMode": "codex-only",
  "decisionStatus": "pending",
  "requiredDependencyShas": null,
  "mustRebaseAndReverify": true,
  "sourceBaseSha": "9fc7dcacfc961752e5d9a2cedbc426deead54a05",
  "dependencyDecisionShas": {
    "status": "awaiting-exact-accepted-shas",
    "step2DecisionSha": null,
    "step3DecisionSha": null,
    "shaFormat": "40-lowercase-hex",
    "supplementaryEvidenceCanSubstitute": false
  },
  "inventoryMethod": "Exact source-CSS token and selector scan; static/JSX and set/toggle rendered data-attribute scan including the offline source document; direct quoted class-hook scan with dynamic expressions separately inspected; maintained route/state reconciliation; static-generator plus createRoot owner trace; explicit direct it, it.each, it.effect, and Playwright callsite characterization.",
  "sourceInventory": {
    "stylesheet": "apps/site/src/styles.css",
    "stylesheetLineCount": 927,
    "definedTokens": [
      "--border-strong",
      "--border-thin",
      "--color-action",
      "--color-action-hover",
      "--color-border",
      "--color-border-control",
      "--color-canvas",
      "--color-danger",
      "--color-danger-surface",
      "--color-disabled-surface",
      "--color-disabled-text",
      "--color-focus",
      "--color-info",
      "--color-info-surface",
      "--color-link",
      "--color-on-action",
      "--color-selected-border",
      "--color-selected-surface",
      "--color-shadow",
      "--color-success",
      "--color-success-surface",
      "--color-surface",
      "--color-surface-subtle",
      "--color-text",
      "--color-text-muted",
      "--color-warning",
      "--color-warning-surface",
      "--control-block",
      "--duration-fast",
      "--duration-normal",
      "--easing-standard",
      "--focus-offset",
      "--focus-width",
      "--font-mono",
      "--font-sans",
      "--layout-full",
      "--layout-wide",
      "--leading-body",
      "--leading-loose",
      "--leading-tight",
      "--measure-copy",
      "--measure-narrow",
      "--radius-lg",
      "--radius-md",
      "--radius-pill",
      "--radius-sm",
      "--shadow-raised",
      "--space-0",
      "--space-1",
      "--space-2",
      "--space-3",
      "--space-4",
      "--space-5",
      "--space-6",
      "--space-7",
      "--space-8",
      "--space-9",
      "--target-default",
      "--target-minimum",
      "--text-body",
      "--text-h1",
      "--text-h2",
      "--text-h3",
      "--text-h4",
      "--text-lead",
      "--text-sm",
      "--text-xs",
      "--weight-bold",
      "--weight-medium",
      "--weight-normal",
      "--z-dialog",
      "--z-header",
      "--z-skip-link",
      "--z-sticky-actions"
    ],
    "referencedTokens": [
      "--border-strong",
      "--border-thin",
      "--color-action",
      "--color-action-hover",
      "--color-border",
      "--color-border-control",
      "--color-canvas",
      "--color-danger",
      "--color-danger-surface",
      "--color-disabled-surface",
      "--color-disabled-text",
      "--color-focus",
      "--color-info",
      "--color-link",
      "--color-on-action",
      "--color-selected-border",
      "--color-selected-surface",
      "--color-shadow",
      "--color-success",
      "--color-success-surface",
      "--color-surface",
      "--color-surface-subtle",
      "--color-text",
      "--color-text-muted",
      "--color-warning",
      "--color-warning-surface",
      "--control-block",
      "--focus-offset",
      "--focus-width",
      "--font-mono",
      "--font-sans",
      "--layout-wide",
      "--leading-body",
      "--leading-tight",
      "--measure-copy",
      "--radius-lg",
      "--radius-md",
      "--radius-pill",
      "--radius-sm",
      "--shadow-card",
      "--shadow-raised",
      "--space-0",
      "--space-1",
      "--space-2",
      "--space-3",
      "--space-4",
      "--space-5",
      "--space-6",
      "--space-7",
      "--space-8",
      "--space-9",
      "--target-default",
      "--text-body",
      "--text-h1",
      "--text-h2",
      "--text-h3",
      "--text-h4",
      "--text-lead",
      "--text-lg",
      "--text-sm",
      "--text-xs",
      "--weight-bold",
      "--z-skip-link"
    ],
    "undefinedTokenReferences": [
      "--shadow-card",
      "--text-lg"
    ],
    "definedButUnusedTokens": [
      "--color-info-surface",
      "--duration-fast",
      "--duration-normal",
      "--easing-standard",
      "--layout-full",
      "--leading-loose",
      "--measure-narrow",
      "--target-minimum",
      "--weight-medium",
      "--weight-normal",
      "--z-dialog",
      "--z-header",
      "--z-sticky-actions"
    ],
    "cssClassSelectors": [
      "affirmation-control",
      "answer-list",
      "answer-mark",
      "answer-option",
      "brand",
      "breadcrumbs",
      "button",
      "button-primary",
      "button-secondary",
      "card",
      "card-grid",
      "claim-caveat",
      "comparison-figure",
      "comparison-table",
      "comparison-table-wrap",
      "connectivity-notice",
      "directional-nav",
      "eyebrow",
      "fact-list",
      "fact-state",
      "fact-state-conflicting",
      "fact-state-not_applicable",
      "fact-state-not_published",
      "fact-state-superseded",
      "fact-state-unverified",
      "fact-state-verified",
      "feedback",
      "feedback-answer-summary",
      "feedback-correct",
      "feedback-error",
      "feedback-rationales",
      "feedback-review",
      "feedback-sources",
      "field-error",
      "field-help",
      "form-field",
      "form-field-group",
      "hazard-card",
      "hazard-result-figure",
      "hazard-result-marker",
      "hazard-result-overlay",
      "hazard-result-region",
      "hazard-result-region--decoy",
      "hazard-result-region--target",
      "hazard-result-regions",
      "hero",
      "lead-copy",
      "link-list",
      "local-data-error",
      "local-data-form",
      "local-data-stack",
      "local-data-state",
      "local-data-warning",
      "network-only-status",
      "operation-preview",
      "pack-record-list",
      "page-shell",
      "print-a4",
      "print-annotated-scene",
      "print-answer-sheet",
      "print-appended-section",
      "print-builder",
      "print-control-grid",
      "print-explanation",
      "print-family-card",
      "print-grayscale",
      "print-hazard-page",
      "print-manifest-summary",
      "print-margin-standard",
      "print-margin-wide",
      "print-option-list",
      "print-preview",
      "print-preview-actions",
      "print-preview-header",
      "print-product-list",
      "print-product-option",
      "print-question",
      "print-question-list",
      "print-response-space",
      "print-section",
      "print-size-large",
      "print-size-normal",
      "print-tool-grid",
      "print-us-letter",
      "print-warning",
      "question-card",
      "question-controls",
      "question-prompt",
      "rationale-list",
      "rationale-sources",
      "reference-card",
      "reference-layout",
      "review-empty",
      "review-error",
      "review-heading-row",
      "review-item-card",
      "review-quarantine",
      "review-queue-list",
      "review-reason-list",
      "review-state",
      "scene-figure",
      "screen-only",
      "section-gap",
      "site-footer",
      "site-footer-inner",
      "site-header",
      "site-header-inner",
      "site-nav",
      "skip-link",
      "source-note",
      "source-receipt-context",
      "source-receipt-excerpt",
      "source-receipt-list",
      "source-receipt-rights",
      "source-record",
      "sr-only",
      "tag-list",
      "tool-card",
      "tool-figure",
      "tool-grid",
      "zone-list"
    ],
    "attributeSelectors": [
      "[data-connectivity-message=\"offline\"]",
      "[data-connectivity-message=\"stale-online\"]",
      "[data-connectivity-message]",
      "[data-connectivity=\"offline\"]",
      "[data-connectivity=\"online\"]",
      "[data-freshness=\"offline-stale\"]",
      "[data-large-text]",
      "[data-network-unavailable]",
      "[data-print-builder]",
      "[data-reduce-motion]",
      "[href]"
    ],
    "renderedDataAttributes": [
      "data-connectivity",
      "data-connectivity-message",
      "data-connectivity-notice",
      "data-correction-form",
      "data-fact-state",
      "data-freshness",
      "data-hazard-attempt-id",
      "data-hazard-mode",
      "data-hazard-player",
      "data-inventory-id",
      "data-island",
      "data-large-text",
      "data-marker-kind",
      "data-marker-x",
      "data-marker-y",
      "data-network-href",
      "data-network-only-link",
      "data-network-only-status",
      "data-network-unavailable",
      "data-offline-pack-manager",
      "data-offline-route",
      "data-option-label",
      "data-postcommit-url",
      "data-print-builder",
      "data-print-fingerprint",
      "data-print-pairing-fingerprint",
      "data-print-preview",
      "data-question-attempt-id",
      "data-question-player",
      "data-recovery-link",
      "data-reduce-motion",
      "data-requested-target",
      "data-review-queue",
      "data-route-id",
      "data-session-history",
      "data-settings",
      "data-simulation-player",
      "data-simulation-profile-compatibility-key",
      "data-simulation-profile-id",
      "data-simulation-profile-version",
      "data-simulation-results",
      "data-simulation-setup",
      "data-simulation-timer",
      "data-simulation-timer-hidden",
      "data-status-kind"
    ],
    "literalClassHooks": [
      "affirmation-control",
      "answer-list",
      "answer-mark",
      "answer-option",
      "brand",
      "breadcrumbs",
      "button",
      "button-primary",
      "button-secondary",
      "card",
      "card-grid",
      "claim-caveat",
      "comparison-figure",
      "comparison-table",
      "comparison-table-wrap",
      "connectivity-notice",
      "directional-nav",
      "error-panel",
      "eyebrow",
      "fact-list",
      "fact-state",
      "feedback",
      "feedback-answer-summary",
      "feedback-claims",
      "feedback-error",
      "feedback-rationales",
      "feedback-sources",
      "field-error",
      "field-help",
      "field-hint",
      "field-label",
      "form-field",
      "form-field-group",
      "hazard-card",
      "hazard-player",
      "hazard-player__commit",
      "hazard-player__commit-status",
      "hazard-player__image-layer",
      "hazard-player__marker",
      "hazard-player__marker-list",
      "hazard-player__marker-moves",
      "hazard-player__markers",
      "hazard-player__prompt",
      "hazard-player__results",
      "hazard-player__viewport",
      "hazard-player__viewport-controls",
      "hazard-player__visual",
      "hazard-player__zero-confirm",
      "hazard-player__zones",
      "hazard-result-figure",
      "hazard-result-overlay",
      "hazard-result-region",
      "hazard-result-region--decoy",
      "hazard-result-region--target",
      "hazard-result-regions",
      "hero",
      "lead-copy",
      "link-list",
      "local-data-error",
      "local-data-form",
      "local-data-stack",
      "local-data-state",
      "local-data-warning",
      "network-only-status",
      "operation-preview",
      "pack-record-list",
      "page-shell",
      "print-annotated-scene",
      "print-answer-key",
      "print-answer-sheet",
      "print-builder",
      "print-control-grid",
      "print-correction-excerpt",
      "print-explanation",
      "print-explanations",
      "print-family-card",
      "print-hazard-answers",
      "print-hazard-page",
      "print-hazard-worksheet",
      "print-manifest-summary",
      "print-option-list",
      "print-original-statement",
      "print-page-shell",
      "print-preview-actions",
      "print-preview-header",
      "print-product-list",
      "print-product-option",
      "print-profile-fact-sheet",
      "print-question",
      "print-question-list",
      "print-question-section",
      "print-response-space",
      "print-section",
      "print-text-equivalent",
      "print-tool-cards",
      "print-tool-grid",
      "print-warning",
      "question-card",
      "question-controls",
      "question-prompt",
      "rationale-list",
      "rationale-sources",
      "reference-card",
      "reference-layout",
      "result-list",
      "review-empty",
      "review-error",
      "review-heading-row",
      "review-item-card",
      "review-notice",
      "review-quarantine",
      "review-queue-list",
      "review-reason-list",
      "review-state",
      "screen-only",
      "section-gap",
      "simulation-navigator",
      "simulation-results",
      "simulation-setup-panel",
      "simulation-timer",
      "site-footer",
      "site-footer-inner",
      "site-header",
      "site-header-inner",
      "site-nav",
      "skip-link",
      "source-note",
      "source-receipt-context",
      "source-receipt-excerpt",
      "source-receipt-list",
      "source-receipt-rights",
      "source-record",
      "sr-only",
      "status-panel",
      "status-panel-danger",
      "status-panel-warning",
      "status-text",
      "tag-list",
      "text-input",
      "tool-card",
      "tool-figure",
      "tool-grid",
      "zone-list"
    ],
    "unmatchedLiteralHooks": [
      "error-panel",
      "feedback-claims",
      "field-hint",
      "field-label",
      "hazard-player",
      "hazard-player__commit",
      "hazard-player__commit-status",
      "hazard-player__image-layer",
      "hazard-player__marker",
      "hazard-player__marker-list",
      "hazard-player__marker-moves",
      "hazard-player__markers",
      "hazard-player__prompt",
      "hazard-player__results",
      "hazard-player__viewport",
      "hazard-player__viewport-controls",
      "hazard-player__visual",
      "hazard-player__zero-confirm",
      "hazard-player__zones",
      "print-answer-key",
      "print-correction-excerpt",
      "print-explanations",
      "print-hazard-answers",
      "print-hazard-worksheet",
      "print-original-statement",
      "print-page-shell",
      "print-profile-fact-sheet",
      "print-question-section",
      "print-text-equivalent",
      "print-tool-cards",
      "result-list",
      "review-notice",
      "simulation-navigator",
      "simulation-results",
      "simulation-setup-panel",
      "simulation-timer",
      "status-panel",
      "status-panel-danger",
      "status-panel-warning",
      "status-text",
      "text-input"
    ],
    "unmatchedDynamicHooks": [
      "hazard-result-marker--decoy-false-positive",
      "hazard-result-marker--duplicate",
      "hazard-result-marker--false-positive",
      "hazard-result-marker--hit"
    ],
    "dynamicClassExpressions": [
      {
        "source": "apps/site/scripts/generate-pages.tsx:342",
        "expressionFamily": "fact-state plus evidence-state suffix",
        "inspectionBoundary": "finite values recorded; later source changes require reinventory"
      },
      {
        "source": "apps/site/scripts/generate-pages.tsx:1117",
        "expressionFamily": "profile fact-state plus evidence-state suffix",
        "inspectionBoundary": "finite values recorded; later source changes require reinventory"
      },
      {
        "source": "apps/site/src/question-player/react/feedback.tsx:59",
        "expressionFamily": "feedback outcome named branch",
        "inspectionBoundary": "finite values recorded; later source changes require reinventory"
      },
      {
        "source": "apps/site/src/hazard-player/react/annotated-scene.tsx:42",
        "expressionFamily": "hazard marker assessment modifier",
        "inspectionBoundary": "finite values recorded; later source changes require reinventory"
      },
      {
        "source": "apps/site/src/print/react/preview.tsx:272",
        "expressionFamily": "paper margin print-size and grayscale preview modifiers",
        "inspectionBoundary": "finite values recorded; later source changes require reinventory"
      },
      {
        "source": "apps/site/src/print/react/preview.tsx:305",
        "expressionFamily": "noninitial print section pagination class",
        "inspectionBoundary": "finite values recorded; later source changes require reinventory"
      }
    ],
    "createRootEntrypoints": [
      "apps/site/src/corrections/react/bootstrap.tsx",
      "apps/site/src/hazard-player/react/bootstrap.tsx",
      "apps/site/src/offline-packs/react/bootstrap.tsx",
      "apps/site/src/print/react/builder-bootstrap.tsx",
      "apps/site/src/print/react/preview-bootstrap.tsx",
      "apps/site/src/question-player/react/bootstrap.tsx",
      "apps/site/src/review/react/bootstrap.tsx",
      "apps/site/src/settings/react/bootstrap.tsx",
      "apps/site/src/simulation/react/bootstrap-player.tsx",
      "apps/site/src/simulation/react/bootstrap-results.tsx",
      "apps/site/src/simulation/react/bootstrap-setup.tsx"
    ],
    "responsiveModes": [
      {
        "id": "base-minimum-width",
        "sources": ["apps/site/src/styles.css:310", "apps/site/src/styles.css:328"],
        "observedContract": "html and body impose a 20rem floor",
        "gap": "The floor becomes 400 CSS pixels under the current 125 percent root-text mode."
      },
      {
        "id": "large-text",
        "sources": ["apps/site/src/styles.css:316"],
        "observedContract": "data-large-text increases the root font size to 125 percent",
        "gap": "Persistence is tested, but route-state reflow and overflow are not."
      },
      {
        "id": "container-responsiveness",
        "sources": ["apps/site/src/styles.css:485"],
        "observedContract": "question-card is an inline-size container",
        "gap": "No container query consumes this owner."
      },
      {
        "id": "viewport-responsiveness",
        "sources": ["apps/site/src/styles.css:889"],
        "observedContract": "one max-width 46rem query collapses reference layout and expands question controls",
        "gap": "No route-family transformation matrix or wider exact-width coverage exists."
      },
      {
        "id": "reduced-motion",
        "sources": ["apps/site/src/styles.css:318", "apps/site/src/styles.css:894"],
        "observedContract": "OS preference and in-product attribute reduce motion",
        "gap": "Current automation checks a question surface only."
      },
      {
        "id": "forced-colors",
        "sources": ["apps/site/src/styles.css:899"],
        "observedContract": "buttons answer options and raised cards receive system-color boundaries",
        "gap": "Current automation checks one question selection indicator only."
      },
      {
        "id": "print",
        "sources": ["apps/site/src/styles.css:269", "apps/site/src/styles.css:910"],
        "observedContract": "packet and general-site print rules separate screen controls and semantic output",
        "gap": "Physical pagination, grayscale, and all-route disposition lack dependency-complete automated proof."
      }
    ]
  },
  "foundations": [
    {
      "id": "document-shell",
      "members": ["DocumentShell"],
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:185", "apps/site/src/styles.css:351"],
      "observedGaps": ["Static shell is centralized, but no equivalent contract record ties route purpose, active context, connectivity, main, and footer across every island route."],
      "decisionStatus": "pending",
      "apiStatus": "pending",
      "visualTokenStatus": "pending"
    },
    {
      "id": "page-header",
      "members": ["PageHeader"],
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:218", "apps/site/src/styles.css:455"],
      "observedGaps": ["Hero, eyebrow, breadcrumbs, metadata, and actions are assembled route by route without one content-ownership checklist."],
      "decisionStatus": "pending",
      "apiStatus": "pending",
      "visualTokenStatus": "pending"
    },
    {
      "id": "layout-primitives",
      "members": ["Stack", "Cluster", "Grid", "Split", "Sidebar"],
      "currentOwners": ["apps/site/src/styles.css:350", "apps/site/scripts/generate-pages.tsx:920"],
      "observedGaps": ["Layout is expressed through route-specific classes; one viewport query exists and no container transformation consumes the declared question container."],
      "decisionStatus": "pending",
      "apiStatus": "pending",
      "visualTokenStatus": "pending"
    },
    {
      "id": "prose-lists",
      "members": ["Prose", "DefinitionList", "MetadataList"],
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:293", "apps/site/src/styles.css:666"],
      "observedGaps": ["Fact, source, metadata, tag, and link lists repeat spacing and relationship decisions without a shared DOM/style record."],
      "decisionStatus": "pending",
      "apiStatus": "pending",
      "visualTokenStatus": "pending"
    },
    {
      "id": "action-controls",
      "members": ["Button", "Link", "IconButton"],
      "currentOwners": ["apps/site/src/styles.css:531", "apps/site/scripts/generate-pages.tsx:927"],
      "observedGaps": ["Routes apply button classes directly, while ten hazard movement/removal buttons miss the current 44px class contract."],
      "decisionStatus": "pending",
      "apiStatus": "pending",
      "visualTokenStatus": "pending"
    },
    {
      "id": "form-controls",
      "members": ["Field", "ChoiceGroup", "CheckboxField", "SelectField"],
      "currentOwners": ["apps/site/src/question-player/react/question-form.tsx:28", "apps/site/src/styles.css:508"],
      "observedGaps": ["Styled field-help and field-error vocabulary diverges from emitted field-label, field-hint, and text-input hooks."],
      "decisionStatus": "pending",
      "apiStatus": "pending",
      "visualTokenStatus": "pending"
    },
    {
      "id": "action-bar",
      "members": ["ActionBar"],
      "currentOwners": ["apps/site/src/question-player/react/question-form.tsx:77", "apps/site/src/styles.css:530"],
      "observedGaps": ["Question controls, print actions, simulation actions, and destructive actions choose layout independently; sticky behavior is documented but not shared."],
      "decisionStatus": "pending",
      "apiStatus": "pending",
      "visualTokenStatus": "pending"
    },
    {
      "id": "feedback-page-states",
      "members": ["StatusMessage", "ErrorSummary", "Notice", "EmptyState", "PageState"],
      "currentOwners": ["apps/site/src/question-player/react/feedback.tsx:59", "apps/site/src/styles.css:556"],
      "observedGaps": ["Feedback, review, local-data, status-panel, and error-panel vocabularies split equivalent semantics; several emitted hooks are unmatched."],
      "decisionStatus": "pending",
      "apiStatus": "pending",
      "visualTokenStatus": "pending"
    },
    {
      "id": "live-region",
      "members": ["LiveRegion"],
      "currentOwners": ["apps/site/src/question-player/react/provider.tsx:62", "apps/site/src/print/react/preview.tsx:254"],
      "observedGaps": ["Each island creates its own announcement endpoint; duplication, urgency, acknowledgement, and visual-heading parity need one testable rule."],
      "decisionStatus": "pending",
      "apiStatus": "pending",
      "visualTokenStatus": "pending"
    },
    {
      "id": "progress-position",
      "members": ["ProgressMeter", "PositionLabel"],
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:447", "apps/site/src/simulation/react/player.tsx:169"],
      "observedGaps": ["Question, hazard, simulation, print, and download progress use different labels and status surfaces without a shared truthfulness/testability record."],
      "decisionStatus": "pending",
      "apiStatus": "pending",
      "visualTokenStatus": "pending"
    },
    {
      "id": "disclosure-dialog",
      "members": ["Disclosure", "Dialog"],
      "currentOwners": ["apps/site/src/question-player/react/feedback.tsx:127", "apps/site/src/offline-packs/react/pack-manager.tsx:464"],
      "observedGaps": ["Destructive pack removal uses a browser confirmation while other previews are in-flow; focus restoration and presentation ownership are not unified."],
      "decisionStatus": "pending",
      "apiStatus": "pending",
      "visualTokenStatus": "pending"
    },
    {
      "id": "figure-image-viewport",
      "members": ["Figure", "ImageViewport"],
      "currentOwners": ["apps/site/src/hazard-player/react/scene-viewport.tsx:11", "apps/site/src/styles.css:647"],
      "observedGaps": ["Practice and simulation duplicate hazard viewport behavior; sharing cannot alter verified-image lifetime, coordinate geometry, or nonvisual equivalence."],
      "decisionStatus": "pending",
      "apiStatus": "pending",
      "visualTokenStatus": "pending"
    },
    {
      "id": "visually-hidden",
      "members": ["VisuallyHidden"],
      "currentOwners": ["apps/site/src/styles.css:875", "apps/site/scripts/generate-pages.tsx:452"],
      "observedGaps": ["The sr-only class is shared by convention, but answer-leak, live-region, and visible-equivalent use need explicit review."],
      "decisionStatus": "pending",
      "apiStatus": "pending",
      "visualTokenStatus": "pending"
    }
  ],
  "componentOwners": [
    {
      "id": "static-document-generator",
      "renderer": "static-generator",
      "mount": null,
      "owner": "apps/site/scripts/generate-pages.tsx:185",
      "stateOwner": "Route assembly and safe static fallback inputs",
      "contentOwner": "Reviewed catalog/profile/public precommit records and maintained product rules",
      "currentContract": "Owns shell, navigation, headings, breadcrumbs, fallbacks, route documents, and island mount elements."
    },
    {
      "id": "question-player",
      "renderer": "react-island",
      "mount": "apps/site/src/question-player/react/bootstrap.tsx:10",
      "owner": "apps/site/src/question-player/react/player.tsx:14",
      "stateOwner": "Question controller snapshot adapted through a state/actions/meta provider",
      "contentOwner": "Safe question bootstrap before commit and item-scoped verified feedback after durable commit",
      "currentContract": "Best current compound exemplar; practice and review route semantics still need characterization."
    },
    {
      "id": "hazard-player",
      "renderer": "react-island",
      "mount": "apps/site/src/hazard-player/react/bootstrap.tsx:22",
      "owner": "apps/site/src/hazard-player/react/player.tsx:12",
      "stateOwner": "Hazard controller snapshot and renderer-local viewport scratch",
      "contentOwner": "Verified neutral scene before commit and item-scoped target/correction data after durable commit",
      "currentContract": "Compound provider with visual and nonvisual compositions; emitted viewport hooks lack selectors."
    },
    {
      "id": "review-queue",
      "renderer": "react-island",
      "mount": "apps/site/src/review/react/bootstrap.tsx:9",
      "owner": "apps/site/src/review/react/review-queue.tsx:90",
      "stateOwner": "Local durable-event projection controller",
      "contentOwner": "Pinned reviewed question/hazard bootstrap references and authored review reasons",
      "currentContract": "Loading, ready, empty, recoverable error, quarantine, and explicit acknowledgement queue."
    },
    {
      "id": "print-builder",
      "renderer": "react-island",
      "mount": "apps/site/src/print/react/builder-bootstrap.tsx:8",
      "owner": "apps/site/src/print/react/builder.tsx:36",
      "stateOwner": "Print builder controller plus local input state",
      "contentOwner": "Validated retained public inventory and later item-scoped answer products",
      "currentContract": "Configuration, capacity, validation, durable job creation, and preview navigation."
    },
    {
      "id": "print-preview",
      "renderer": "react-island",
      "mount": "apps/site/src/print/react/preview-bootstrap.tsx:12",
      "owner": "apps/site/src/print/react/preview.tsx:232",
      "stateOwner": "Restored durable print manifest and preview controller",
      "contentOwner": "Exact retained packet sections identified by the durable manifest",
      "currentContract": "Semantic preview, regeneration, inspection confirmation, and system-print request."
    },
    {
      "id": "simulation-setup",
      "renderer": "react-island",
      "mount": "apps/site/src/simulation/react/bootstrap-setup.tsx:7",
      "owner": "apps/site/src/simulation/react/setup.tsx:31",
      "stateOwner": "Setup form state and simulation-generation operation",
      "contentOwner": "Answer-independent compatible inventory/capacity",
      "currentContract": "Format, length, timing, category, capacity, generating, and failure presentation."
    },
    {
      "id": "simulation-player",
      "renderer": "react-island",
      "mount": "apps/site/src/simulation/react/bootstrap-player.tsx:8",
      "owner": "apps/site/src/simulation/react/player.tsx:76",
      "stateOwner": "Pinned simulation controller and durable editable responses",
      "contentOwner": "Precommit item content during active session; evaluated content only after final submission",
      "currentContract": "Restoring, active navigation/editing, flagging, timing, final confirmation, and submission."
    },
    {
      "id": "simulation-results",
      "renderer": "react-island",
      "mount": "apps/site/src/simulation/react/bootstrap-results.tsx:7",
      "owner": "apps/site/src/simulation/react/results.tsx:261",
      "stateOwner": "Reconciled final submission and generated result projection",
      "contentOwner": "Pinned item evaluation and site-practice metrics",
      "currentContract": "Results, item summaries, sources, profile metadata, and truthful practice disclaimers."
    },
    {
      "id": "settings",
      "renderer": "react-island",
      "mount": "apps/site/src/settings/react/bootstrap.tsx:6",
      "owner": "apps/site/src/settings/react/settings.tsx:51",
      "stateOwner": "Authoritative IndexedDB preferences and import/export/reset/rebuild operations",
      "contentOwner": "Maintained settings labels and local durable diagnostics",
      "currentContract": "Currently initializes visible defaults before restoration; loading truth requires characterization."
    },
    {
      "id": "offline-packs",
      "renderer": "react-island",
      "mount": "apps/site/src/offline-packs/react/bootstrap.tsx:6",
      "owner": "apps/site/src/offline-packs/react/pack-manager.tsx:100",
      "stateOwner": "Offline-pack lifecycle manager and authoritative local records",
      "contentOwner": "Trusted release manifest, pack metadata, compatibility, and local operation results",
      "currentContract": "Currently initializes an empty array before restoration; lifecycle and destructive confirmation must remain distinct."
    },
    {
      "id": "correction-form",
      "renderer": "react-island",
      "mount": "apps/site/src/corrections/react/bootstrap.tsx:5",
      "owner": "apps/site/src/corrections/react/correction-form.tsx:62",
      "stateOwner": "Local draft, validation, dormant/online submission operation, and receipt",
      "contentOwner": "Maintained security/correction categories and learner-authored safe report fields",
      "currentContract": "Explicit local save, no automatic submission, validation errors, recovery, and generic receipt boundary."
    }
  ],
  "routeFamilies": [
    {
      "number": 1,
      "routeIds": ["home"],
      "implementedRouteIds": ["home"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:913"],
      "legalStateAnchor": "product/SCREEN_STATES.md:225",
      "candidateTemplateIds": ["orientation"],
      "decisionStatus": "pending"
    },
    {
      "number": 2,
      "routeIds": ["exam-selector"],
      "implementedRouteIds": ["exam-selector"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:1069"],
      "legalStateAnchor": "product/SCREEN_STATES.md:226",
      "candidateTemplateIds": ["orientation"],
      "decisionStatus": "pending"
    },
    {
      "number": 3,
      "routeIds": ["exam-checker"],
      "implementedRouteIds": [],
      "implementationStatus": "documented-only-currently",
      "currentOwners": [],
      "legalStateAnchor": "product/SCREEN_STATES.md:227",
      "candidateTemplateIds": ["orientation"],
      "decisionStatus": "pending"
    },
    {
      "number": 4,
      "routeIds": ["profile"],
      "implementedRouteIds": ["profile"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:1102"],
      "legalStateAnchor": "product/SCREEN_STATES.md:228",
      "candidateTemplateIds": ["orientation"],
      "decisionStatus": "pending"
    },
    {
      "number": 5,
      "routeIds": ["study-hub"],
      "implementedRouteIds": ["study-hub"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:1129"],
      "legalStateAnchor": "product/SCREEN_STATES.md:229",
      "candidateTemplateIds": ["study-launcher"],
      "decisionStatus": "pending"
    },
    {
      "number": 6,
      "routeIds": ["atlas-index"],
      "implementedRouteIds": ["atlas-index"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:1157"],
      "legalStateAnchor": "product/SCREEN_STATES.md:230",
      "candidateTemplateIds": ["browse-reference"],
      "decisionStatus": "pending"
    },
    {
      "number": 7,
      "routeIds": ["atlas-family"],
      "implementedRouteIds": ["atlas-family"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:1183"],
      "legalStateAnchor": "product/SCREEN_STATES.md:231",
      "candidateTemplateIds": ["browse-reference"],
      "decisionStatus": "pending"
    },
    {
      "number": 8,
      "routeIds": ["atlas-tool"],
      "implementedRouteIds": ["atlas-tool"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:1217"],
      "legalStateAnchor": "product/SCREEN_STATES.md:232",
      "candidateTemplateIds": ["browse-reference"],
      "decisionStatus": "pending"
    },
    {
      "number": 9,
      "routeIds": ["procedures-index", "procedure-detail"],
      "implementedRouteIds": [],
      "implementationStatus": "documented-only-currently",
      "currentOwners": [],
      "legalStateAnchor": "product/SCREEN_STATES.md:233",
      "candidateTemplateIds": ["browse-reference"],
      "decisionStatus": "pending"
    },
    {
      "number": 10,
      "routeIds": ["repair-lab"],
      "implementedRouteIds": [],
      "implementationStatus": "documented-only-currently",
      "currentOwners": [],
      "legalStateAnchor": "product/SCREEN_STATES.md:234",
      "candidateTemplateIds": ["browse-reference"],
      "decisionStatus": "pending"
    },
    {
      "number": 11,
      "routeIds": ["question-player"],
      "implementedRouteIds": ["question-player"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:1332", "apps/site/src/question-player/react/player.tsx:14"],
      "legalStateAnchor": "product/SCREEN_STATES.md:235",
      "candidateTemplateIds": ["focused-task"],
      "decisionStatus": "pending"
    },
    {
      "number": 12,
      "routeIds": ["hazards-index", "hazard-player"],
      "implementedRouteIds": ["hazards-index", "hazard-player"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:1246", "apps/site/src/hazard-player/react/player.tsx:12"],
      "legalStateAnchor": "product/SCREEN_STATES.md:236",
      "candidateTemplateIds": ["study-launcher", "focused-task"],
      "decisionStatus": "pending"
    },
    {
      "number": 13,
      "routeIds": ["review-queue", "review-player"],
      "implementedRouteIds": ["review-queue", "review-player"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:937", "apps/site/scripts/generate-pages.tsx:1359", "apps/site/src/review/react/review-queue.tsx:90", "apps/site/src/question-player/react/bootstrap.tsx:10"],
      "legalStateAnchor": "product/SCREEN_STATES.md:237",
      "candidateTemplateIds": ["review-results", "focused-task"],
      "decisionStatus": "pending"
    },
    {
      "number": 14,
      "routeIds": ["simulation-setup", "simulation-player", "simulation-results"],
      "implementedRouteIds": ["simulation-setup", "simulation-player", "simulation-results"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:999", "apps/site/src/simulation/react/setup.tsx:31", "apps/site/src/simulation/react/player.tsx:76", "apps/site/src/simulation/react/results.tsx:261"],
      "legalStateAnchor": "product/SCREEN_STATES.md:238",
      "candidateTemplateIds": ["study-launcher", "focused-task", "review-results"],
      "decisionStatus": "pending"
    },
    {
      "number": 15,
      "routeIds": ["print-center", "print-preview"],
      "implementedRouteIds": ["print-center", "print-preview"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:961", "apps/site/src/print/react/builder.tsx:36", "apps/site/src/print/react/preview.tsx:232"],
      "legalStateAnchor": "product/SCREEN_STATES.md:239",
      "candidateTemplateIds": ["study-launcher", "review-results"],
      "decisionStatus": "pending"
    },
    {
      "number": 16,
      "routeIds": ["faq"],
      "implementedRouteIds": [],
      "implementationStatus": "documented-only-currently",
      "currentOwners": [],
      "legalStateAnchor": "product/SCREEN_STATES.md:240",
      "candidateTemplateIds": ["browse-reference"],
      "decisionStatus": "pending"
    },
    {
      "number": 17,
      "routeIds": ["transparency-index", "source", "corrections", "foil", "security", "privacy"],
      "implementedRouteIds": ["transparency-index", "source", "corrections", "foil", "security", "privacy"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:1262"],
      "legalStateAnchor": "product/SCREEN_STATES.md:241",
      "candidateTemplateIds": ["browse-reference"],
      "decisionStatus": "pending"
    },
    {
      "number": 18,
      "routeIds": ["correction-submit"],
      "implementedRouteIds": ["correction-submit"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:1528", "apps/site/src/corrections/react/correction-form.tsx:62"],
      "legalStateAnchor": "product/SCREEN_STATES.md:242",
      "candidateTemplateIds": ["utility"],
      "decisionStatus": "pending"
    },
    {
      "number": 19,
      "routeIds": ["settings"],
      "implementedRouteIds": ["settings"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:1510", "apps/site/src/settings/react/settings.tsx:51"],
      "legalStateAnchor": "product/SCREEN_STATES.md:243",
      "candidateTemplateIds": ["utility"],
      "decisionStatus": "pending"
    },
    {
      "number": 20,
      "routeIds": ["offline-packs"],
      "implementedRouteIds": ["offline-packs"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:1484", "apps/site/src/offline-packs/react/pack-manager.tsx:100"],
      "legalStateAnchor": "product/SCREEN_STATES.md:244",
      "candidateTemplateIds": ["utility"],
      "decisionStatus": "pending"
    },
    {
      "number": 21,
      "routeIds": ["status"],
      "implementedRouteIds": ["status"],
      "implementationStatus": "implemented-currently",
      "currentOwners": ["apps/site/scripts/generate-pages.tsx:1055", "apps/site/src/asset-router.ts:62"],
      "legalStateAnchor": "product/SCREEN_STATES.md:245",
      "candidateTemplateIds": ["recovery"],
      "decisionStatus": "pending"
    }
  ],
  "screenStateDimensions": [
    {
      "id": "availability",
      "legalValues": ["availability=ready", "availability=empty", "availability=offline-stale", "availability=offline-unavailable", "availability=content-unavailable", "availability=not-found", "availability=withdrawn"],
      "source": "product/SCREEN_STATES.md:24"
    },
    {
      "id": "operation",
      "legalValues": ["operation=idle", "operation=loading", "operation=pending", "operation=recoverable-error", "operation=terminal-error"],
      "source": "product/SCREEN_STATES.md:25"
    },
    {
      "id": "connectivity",
      "legalValues": ["connectivity=online", "connectivity=offline"],
      "source": "product/SCREEN_STATES.md:26"
    },
    {
      "id": "persistence",
      "legalValues": ["persistence=available", "persistence=unavailable", "persistence=quota-limited", "persistence=reconciling"],
      "source": "product/SCREEN_STATES.md:27"
    },
    {
      "id": "interaction",
      "legalValues": ["interaction=ready", "interaction=selected", "interaction=committing", "interaction=answered-revealed", "interaction=reviewed", "interaction=completed", "interaction=route-specific"],
      "source": "product/SCREEN_STATES.md:28"
    },
    {
      "id": "freshness",
      "legalValues": ["freshness=current", "freshness=stale", "freshness=superseded", "freshness=retired", "freshness=corrected"],
      "source": "product/SCREEN_STATES.md:29"
    }
  ],
  "screenStateFamilies": [
    {
      "id": "reference-index-document",
      "sources": ["product/SCREEN_STATES.md:77"],
      "maintainedContractStates": ["ready(current|stale)", "filter/search -> ready|empty", "background refresh -> ready(current)|offline-stale|recoverable-error", "resource withdrawn -> withdrawn", "initial failure -> offline-unavailable|content-unavailable|not-found"],
      "currentImplementationStates": ["static document plus optional enhancement; no shared tagged union"],
      "recoveryInvariant": "Keep useful static content and distinguish empty from unavailable or stale.",
      "presentationGap": "No exact current route-state fixture set crosses all reference families and modes."
    },
    {
      "id": "question-commit-reveal",
      "sources": ["product/SCREEN_STATES.md:94", "apps/site/src/question-player/state.ts:5"],
      "maintainedContractStates": ["restoring", "ready", "interaction=selected", "committing", "answered-revealed", "reviewed", "completed", "recoverable-error", "content-unavailable"],
      "currentImplementationStates": ["tag=ready", "tag=restoring", "tag=restore_failed", "tag=content_unavailable", "tag=committing", "tag=commit_failed", "tag=reveal_failed", "tag=revealed"],
      "recoveryInvariant": "A failed durable commit retains the editable choice, focuses recovery, and reveals nothing.",
      "presentationGap": "Committing is observed only in transition, and review currently mounts a practice composition."
    },
    {
      "id": "hazard-commit-reveal",
      "sources": ["product/SCREEN_STATES.md:122", "apps/site/src/hazard-player/state.ts:4"],
      "maintainedContractStates": ["restoring", "ready", "marking", "confirm-zero", "committing", "answered-revealed", "reviewed", "completed", "recoverable-error"],
      "currentImplementationStates": ["tag=ready", "tag=confirm_zero", "tag=restoring", "tag=restore_failed", "tag=content_unavailable", "tag=asset_unavailable", "tag=committing", "tag=commit_failed", "tag=reveal_failed", "tag=revealed"],
      "recoveryInvariant": "Failure returns to neutral editable marks or zones and exposes no target count, regions, or correctness.",
      "presentationGap": "Viewport hooks are unmatched and visual/nonvisual states are not crossed with all adaptation modes."
    },
    {
      "id": "review-queue",
      "sources": ["product/SCREEN_STATES.md:237", "apps/site/src/review/model.ts:85"],
      "maintainedContractStates": ["loading", "ready", "empty", "recoverable-error", "pending rebuild", "explicit review variants", "quarantined historical object"],
      "currentImplementationStates": ["tag=loading", "tag=ready", "tag=empty", "tag=recoverable_error", "quarantined entries nested in ready or recoverable_error"],
      "recoveryInvariant": "Unavailable historical objects remain identified and are never silently substituted.",
      "presentationGap": "Current browser evidence is narrow and review-state vocabulary is separate from other page states."
    },
    {
      "id": "simulation",
      "sources": ["product/SCREEN_STATES.md:138", "apps/site/src/simulation/react/setup.tsx:73", "apps/site/src/simulation/controller.ts:26", "apps/site/src/simulation/controller.ts:744"],
      "maintainedContractStates": ["setup", "generating", "active(unanswered|recorded)", "final-confirmation", "submitting", "reconciling", "results", "recoverable-error", "completed"],
      "currentImplementationStates": ["setup tag=idle", "setup tag=creating", "setup tag=failure", "player tag=restoring", "player tag=ready", "player tag=failure", "results tag=reconciling", "results tag=results", "results tag=failure"],
      "recoveryInvariant": "Active responses stay editable and correctness remains unavailable until final durable submission reconciles.",
      "presentationGap": "Setup, player, and results use separate vocabularies and no representative matrix holds every state."
    },
    {
      "id": "print-workflow",
      "sources": ["product/SCREEN_STATES.md:155", "apps/site/src/print/controller.ts:24", "apps/site/src/print/controller.ts:40"],
      "maintainedContractStates": ["configuring", "generating", "preview-ready", "stale", "recoverable-error", "system-print-requested"],
      "currentImplementationStates": ["builder tag=configuring", "builder tag=generating", "builder tag=recoverable-error", "preview tag=restoring", "preview tag=preview-ready", "preview tag=stale", "preview tag=system-print-requested", "preview tag=regenerating", "preview tag=regenerate-error", "preview tag=content-unavailable", "preview tag=recoverable-error"],
      "recoveryInvariant": "The previous exact durable preview remains on regeneration failure; a system dialog request is not proof of print completion.",
      "presentationGap": "Many semantic print hooks are unmatched and physical pagination/grayscale lack dependency-complete automated proof."
    },
    {
      "id": "offline-pack-lifecycle",
      "sources": ["product/SCREEN_STATES.md:169", "apps/site/src/offline-packs/react/pack-manager.tsx:100"],
      "maintainedContractStates": ["absent", "downloading", "paused-offline", "verifying", "staged", "activating", "active", "update-available", "quarantined", "removing", "retained", "recoverable-error"],
      "currentImplementationStates": ["component-local packs/busy/notice/problem/completion/storage state; no shared tagged screen union"],
      "recoveryInvariant": "Only verified active data starts a new offline session; failed updates retain the prior valid generation.",
      "presentationGap": "The React owner initializes an empty list before authoritative restoration."
    },
    {
      "id": "correction-report",
      "sources": ["product/SCREEN_STATES.md:185", "apps/site/src/corrections/react/correction-form.tsx:62"],
      "maintainedContractStates": ["draft", "validating", "ready-to-submit", "submitting", "submitted", "local-draft-saved", "validation-errors", "recoverable-error"],
      "currentImplementationStates": ["component-local draft/loading/busy/notice/problem/validation/receipt state; no shared tagged screen union"],
      "recoveryInvariant": "Connectivity never auto-submits; safe input is retained and submitted requires an accepted client receipt.",
      "presentationGap": "Field/status classes split from other foundation vocabulary and the production endpoint remains dormant."
    },
    {
      "id": "settings-data-operations",
      "sources": ["product/SCREEN_STATES.md:199", "apps/site/src/settings/react/settings.tsx:51"],
      "maintainedContractStates": ["idle", "decoding", "validated-preview", "committing", "complete", "reconciling", "quarantined", "recoverable-error"],
      "currentImplementationStates": ["component-local preferences/import/reset/rebuild/busy/problem/completion state; no shared tagged screen union"],
      "recoveryInvariant": "Import/reset writes nothing before confirmed preview, and failures preserve authoritative stored values.",
      "presentationGap": "Visible default preferences precede durable restoration and can be mistaken for authoritative ready state."
    },
    {
      "id": "terminal-recovery",
      "sources": ["product/SCREEN_STATES.md:245", "apps/site/src/asset-router.ts:62"],
      "maintainedContractStates": ["not-found", "withdrawn", "offline-unavailable", "content-unavailable", "storage-unavailable", "service-unavailable", "terminal-error"],
      "currentImplementationStates": ["typed static terminal document; no shared runtime tagged union"],
      "recoveryInvariant": "Preserve the requested identity and offer one truthful primary recovery plus known cached parents.",
      "presentationGap": "Delivery checks cover only a subset of route identities and terminal states."
    }
  ],
  "archetypeTemplates": [
    {
      "id": "orientation",
      "decisionStatus": "pending",
      "tokenInputs": null,
      "thresholds": null,
      "requiredSlots": ["route purpose", "current scope or profile context", "primary next task", "supporting evidence", "recovery"],
      "responsiveQuestions": ["When may supporting facts become a rail without changing reading order?", "How do long titles and profile caveats remain in one bounded flow?"],
      "contentOwnership": "Reviewed route/profile facts and later consumer-language rules own words; the template only arranges semantic slots.",
      "accessibilityResponsibilities": ["one h1 and one main", "skip-link continuity", "profile/scope facts are text not color", "full document navigation semantics"],
      "testHooks": ["route identity", "landmark and heading order", "320px and large-text reflow", "offline-stale representation"]
    },
    {
      "id": "study-launcher",
      "decisionStatus": "pending",
      "tokenInputs": null,
      "thresholds": null,
      "requiredSlots": ["route purpose", "capacity and compatibility", "setup or launch controls", "limitations", "recovery"],
      "responsiveQuestions": ["Which compatible short controls may share a row?", "When must capacity warnings span the full container?"],
      "contentOwnership": "Answer-independent inventory and maintained feature rules own capacity/limitations; the template does not infer availability.",
      "accessibilityResponsibilities": ["real fieldset and label relationships", "error-summary focus", "disabled reason adjacent to control", "no official-length implication"],
      "testHooks": ["capacity truth", "keyboard setup", "loading versus empty", "generation failure recovery"]
    },
    {
      "id": "browse-reference",
      "decisionStatus": "pending",
      "tokenInputs": null,
      "thresholds": null,
      "requiredSlots": ["route purpose", "search or contents", "bounded reference body", "facts and provenance", "related navigation", "recovery"],
      "responsiveQuestions": ["Which table or image regions are intrinsically two-dimensional?", "When can filters or sources become a rail without detaching context?"],
      "contentOwnership": "Reviewed catalog/profile/source records own terms and evidence; route templates preserve their status and locator relationships.",
      "accessibilityResponsibilities": ["semantic lists and tables", "named overflow regions", "nonvisual image equivalent", "fragment focus continuity"],
      "testHooks": ["filter result count", "empty versus unavailable", "source relationship", "intrinsic overflow containment"]
    },
    {
      "id": "focused-task",
      "decisionStatus": "pending",
      "tokenInputs": null,
      "thresholds": null,
      "requiredSlots": ["task heading and position", "prompt or scene", "input", "commit status", "postcommit outcome", "sources", "navigation"],
      "responsiveQuestions": ["When can visual body and controls split while DOM order stays fixed?", "When may an action bar stick without obscuring focus?"],
      "contentOwnership": "Renderer-neutral snapshots and item-scoped verified content own task state; leaves never infer correctness or call persistence.",
      "accessibilityResponsibilities": ["commit-before-reveal", "focus request acknowledgement", "one live region per island", "visual and nonvisual equivalence", "44px primary targets"],
      "testHooks": ["ready through recovery state", "keyboard-only commit", "no precommit answer bytes", "focus and announcement", "history state gating"]
    },
    {
      "id": "review-results",
      "decisionStatus": "pending",
      "tokenInputs": null,
      "thresholds": null,
      "requiredSlots": ["result purpose", "pinned context", "actual metrics or queue", "explanations or packet", "provenance", "next actions", "recovery"],
      "responsiveQuestions": ["How do metric groups reflow without implying official scoring?", "Which print/result regions need page-safe separation?"],
      "contentOwnership": "Durable attempt/session/print projections own results; labels and disclaimers remain maintained consumer content.",
      "accessibilityResponsibilities": ["result-heading focus", "explicit acknowledgement", "actual sample size", "grayscale and print structure", "historical object identity"],
      "testHooks": ["reconciliation", "empty and quarantine", "result focus", "print product separation", "no historical substitution"]
    },
    {
      "id": "utility",
      "decisionStatus": "pending",
      "tokenInputs": null,
      "thresholds": null,
      "requiredSlots": ["route purpose", "authoritative local state", "operation controls", "status and errors", "destructive preview", "recovery"],
      "responsiveQuestions": ["Which local-data controls may cluster at ample width?", "How do destructive and recovery actions remain in-flow at high zoom?"],
      "contentOwnership": "Authoritative durable records and maintained privacy/security rules own state and copy; initial React defaults are never final truth.",
      "accessibilityResponsibilities": ["restoration before ready or empty", "destructive scope announcement", "trigger focus restoration", "offline capability distinction", "typed errors"],
      "testHooks": ["delayed restoration", "write failure rollback", "destructive cancellation", "offline operation", "local-only security boundary"]
    },
    {
      "id": "recovery",
      "decisionStatus": "pending",
      "tokenInputs": null,
      "thresholds": null,
      "requiredSlots": ["requested identity", "typed terminal condition", "primary recovery", "known cached alternatives", "diagnostic boundary"],
      "responsiveQuestions": ["How does the requested identity wrap without page overflow?", "Which diagnostics stay secondary at constrained widths?"],
      "contentOwnership": "Routing/delivery truth owns the condition; maintained consumer-language rules later own its plain-language presentation.",
      "accessibilityResponsibilities": ["status heading as focus target", "requested URL retained as text", "one primary recovery", "no fake destination", "no sensitive diagnostic leak"],
      "testHooks": ["404 and offline fallback route identity", "cached-link closure", "heading focus", "noindex and canonical semantics"]
    }
  ],
  "harnessSpecification": {
    "states": [
      {
        "id": "global-shell-ready",
        "routeId": "home",
        "candidateTemplateId": "orientation",
        "projection": "availability=ready; operation=idle",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "review-queue-loading",
        "routeId": "review-queue",
        "candidateTemplateId": "review-results",
        "projection": "operation=loading; useful static queue context retained",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "question-ready",
        "routeId": "question-player",
        "candidateTemplateId": "focused-task",
        "projection": "interaction=ready",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "question-committing",
        "routeId": "question-player",
        "candidateTemplateId": "focused-task",
        "projection": "interaction=committing",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "question-answered-revealed",
        "routeId": "question-player",
        "candidateTemplateId": "focused-task",
        "projection": "interaction=answered-revealed",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "question-recoverable-error",
        "routeId": "question-player",
        "candidateTemplateId": "focused-task",
        "projection": "interaction=selected; operation=recoverable-error",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "hazard-ready-visual",
        "routeId": "hazard-player",
        "candidateTemplateId": "focused-task",
        "projection": "interaction=ready; visual-equivalent",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "hazard-marking-visual",
        "routeId": "hazard-player",
        "candidateTemplateId": "focused-task",
        "projection": "interaction=marking; visual-equivalent",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "hazard-answered-revealed-visual",
        "routeId": "hazard-player",
        "candidateTemplateId": "focused-task",
        "projection": "interaction=answered-revealed; visual-equivalent",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "hazard-ready-nonvisual",
        "routeId": "hazard-player",
        "candidateTemplateId": "focused-task",
        "projection": "interaction=ready; nonvisual-equivalent",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "hazard-answered-revealed-nonvisual",
        "routeId": "hazard-player",
        "candidateTemplateId": "focused-task",
        "projection": "interaction=answered-revealed; nonvisual-equivalent",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "atlas-index-ready",
        "routeId": "atlas-index",
        "candidateTemplateId": "browse-reference",
        "projection": "availability=ready",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "atlas-family-comparison-ready",
        "routeId": "atlas-family",
        "candidateTemplateId": "browse-reference",
        "projection": "availability=ready",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "profile-progressive-evidence-ready",
        "routeId": "profile",
        "candidateTemplateId": "orientation",
        "projection": "availability=ready; freshness=current",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "simulation-setup-ready",
        "routeId": "simulation-setup",
        "candidateTemplateId": "study-launcher",
        "projection": "interaction=setup",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "simulation-results-ready",
        "routeId": "simulation-results",
        "candidateTemplateId": "review-results",
        "projection": "interaction=results",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "settings-loading",
        "routeId": "settings",
        "candidateTemplateId": "utility",
        "projection": "operation=loading",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "correction-validation-error",
        "routeId": "correction-submit",
        "candidateTemplateId": "utility",
        "projection": "operation=recoverable-error; interaction=draft; validation summary focused",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "settings-empty",
        "routeId": "settings",
        "candidateTemplateId": "utility",
        "projection": "availability=ready; zero optional local records",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "terminal-not-found",
        "routeId": "status",
        "candidateTemplateId": "recovery",
        "projection": "availability=not-found; requested identity retained; status heading focused",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "simulation-recoverable-error",
        "routeId": "simulation-player",
        "candidateTemplateId": "focused-task",
        "projection": "operation=recoverable-error; active responses retained; no reveal",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "settings-recoverable-error",
        "routeId": "settings",
        "candidateTemplateId": "utility",
        "projection": "operation=recoverable-error",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "offline-loading",
        "routeId": "offline-packs",
        "candidateTemplateId": "utility",
        "projection": "interaction=downloading",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "simulation-active",
        "routeId": "simulation-player",
        "candidateTemplateId": "focused-task",
        "projection": "interaction=active; response editing and state-gated navigation",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "offline-empty",
        "routeId": "offline-packs",
        "candidateTemplateId": "utility",
        "projection": "interaction=absent",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "simulation-final-confirmation",
        "routeId": "simulation-player",
        "candidateTemplateId": "focused-task",
        "projection": "interaction=final-confirmation; incomplete responses named; submit not yet committed",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "offline-destructive-confirmation",
        "routeId": "offline-packs",
        "candidateTemplateId": "utility",
        "projection": "interaction=active; remove-confirmation presentation",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "offline-recoverable-error",
        "routeId": "offline-packs",
        "candidateTemplateId": "utility",
        "projection": "operation=recoverable-error",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "print-preview-normal",
        "routeId": "print-preview",
        "candidateTemplateId": "review-results",
        "projection": "interaction=preview-ready; printMode=normal",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      },
      {
        "id": "print-preview-large-print",
        "routeId": "print-preview",
        "candidateTemplateId": "review-results",
        "projection": "interaction=preview-ready; printMode=large-print",
        "fixtureStatus": "specification-only",
        "publicPrecommitOnly": true,
        "answerBearing": false
      }
    ],
    "modes": [
      {
        "id": "width-320",
        "kind": "automated-specification",
        "evidence": null,
        "assertions": ["320 CSS-pixel viewport", "no page overflow", "named intrinsic overflow only", "44px primary targets"]
      },
      {
        "id": "width-768",
        "kind": "automated-specification",
        "evidence": null,
        "assertions": ["768 CSS-pixel viewport", "semantic reading order", "container transformation"]
      },
      {
        "id": "width-1024",
        "kind": "automated-specification",
        "evidence": null,
        "assertions": ["1024 CSS-pixel viewport", "bounded measure", "focus remains unobscured"]
      },
      {
        "id": "width-1440",
        "kind": "automated-specification",
        "evidence": null,
        "assertions": ["1440 CSS-pixel viewport", "no unbounded line length", "ample layout preserves DOM order"]
      },
      {
        "id": "app-text-125",
        "kind": "automated-specification",
        "evidence": null,
        "assertions": ["data-large-text active", "no clipping or page overflow", "controls and status remain reachable"]
      },
      {
        "id": "forced-colors",
        "kind": "automated-specification",
        "evidence": null,
        "assertions": ["system-color boundaries", "selected current error and focus cues are non-color-only", "essential controls remain visible"]
      },
      {
        "id": "reduced-motion",
        "kind": "automated-specification",
        "evidence": null,
        "assertions": ["OS preference active", "in-product preference active where applicable", "focus and completion do not depend on animation"]
      },
      {
        "id": "print",
        "kind": "automated-specification",
        "evidence": null,
        "assertions": ["screen controls removed", "semantic content retained", "question and answer products remain separated", "grayscale cues remain labeled"]
      },
      {
        "id": "browser-zoom-400",
        "kind": "automated-specification",
        "evidence": null,
        "assertions": ["deterministic browser zoom at 400 percent", "mechanism and viewport recorded", "no page overflow outside named region", "focused controls unobscured", "dialogs sticky actions and recovery remain operable"]
      }
    ],
    "totalPlannedRows": 270,
    "automatedPlannedRows": 270,
    "currentRows": 0,
    "rowKey": "stateId+modeId",
    "writerBoundary": "must not emit rows until exact accepted Step 2 and Step 3 decision SHAs are present and the packet is rebased",
    "codexReviewBoundary": "Codex engineering review is non-user evidence and is never human usability testing"
  },
  "migrationTranches": [
    {
      "order": 1,
      "id": "characterization-and-validation",
      "routeFamilyNumbers": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
      "currentFiles": [
        "apps/site/src/styles.css",
        "apps/site/scripts/generate-pages.tsx",
        "apps/site/src/route-registry.ts",
        "apps/site/src/asset-router.ts",
        "apps/site/public/offline.html",
        "apps/site/src/shell-route-policy.ts",
        "apps/site/test/static-site-generation.test.ts",
        "apps/site/browser-tests/delivery.pw.ts",
        "apps/site/browser-tests/accessibility-and-presentation.pw.ts"
      ],
      "prerequisiteFixtures": ["source-token-selector-inventory", "route-family-closure-characterization", "representative-state-fixture-gap-characterization"],
      "foundationIds": ["document-shell", "page-header", "layout-primitives", "prose-lists", "action-controls", "form-controls", "action-bar", "feedback-page-states", "live-region", "progress-position", "disclosure-dialog", "figure-image-viewport", "visually-hidden"],
      "presentationCases": ["width-320", "width-768", "width-1024", "width-1440", "app-text-125", "forced-colors", "reduced-motion", "print", "browser-zoom-400"],
      "answerLeakAndRouteClosureChecks": ["source-derived initial executable closure", "stable route identity and fallback closure", "no answer-bearing precommit fixture"],
      "removalCriteria": ["No production removal in characterization", "Every later selector/token disposition references an exact producer and test"],
      "stopBoundary": "STOP on incomplete extractor closure, unexplained source drift, or any need to freeze a token, API, archetype, threshold, or learner wording before the exact accepted Step 2 and Step 3 decision SHAs land."
    },
    {
      "order": 2,
      "id": "controls-and-feedback",
      "routeFamilyNumbers": [2, 3, 5, 11, 12, 13, 14, 15, 18, 19, 20, 21],
      "currentFiles": [
        "apps/site/src/styles.css",
        "apps/site/scripts/generate-pages.tsx",
        "apps/site/src/question-player/react/question-form.tsx",
        "apps/site/src/question-player/react/feedback.tsx",
        "apps/site/src/hazard-player/react/commit-controls.tsx",
        "apps/site/src/hazard-player/react/marker-controls.tsx",
        "apps/site/src/hazard-player/react/results.tsx",
        "apps/site/src/review/react/review-queue.tsx",
        "apps/site/src/simulation/react/setup.tsx",
        "apps/site/src/simulation/react/player.tsx",
        "apps/site/src/simulation/react/results.tsx",
        "apps/site/src/settings/react/settings.tsx",
        "apps/site/src/offline-packs/react/pack-manager.tsx",
        "apps/site/src/corrections/react/correction-form.tsx",
        "apps/site/src/print/react/builder.tsx",
        "apps/site/src/print/react/preview.tsx"
      ],
      "prerequisiteFixtures": ["control-disabled-busy-characterization", "feedback-focus-announcement-characterization", "destructive-cancel-focus-characterization"],
      "foundationIds": ["action-controls", "form-controls", "action-bar", "feedback-page-states", "live-region", "progress-position", "disclosure-dialog", "visually-hidden"],
      "presentationCases": ["default-ready", "loading-busy", "empty", "warning", "success", "destructive-confirmation", "recoverable-error", "offline", "forced-colors", "print"],
      "answerLeakAndRouteClosureChecks": ["disabled and busy controls never reveal or navigate early", "feedback is absent from precommit closure", "static and React field/error relationships remain equivalent"],
      "removalCriteria": ["All exact producers use the later named foundation contract", "Old hook has zero producers and its behavior/focus assertions pass"],
      "stopBoundary": "STOP if consolidation changes validation, learner copy, legal state, focus target, announcement, durable persistence, or static/React semantics; styling cannot conceal a correctness defect."
    },
    {
      "order": 3,
      "id": "shell-and-navigation",
      "routeFamilyNumbers": [1, 2, 3, 4, 5, 11, 12, 13, 14, 15, 21],
      "currentFiles": [
        "apps/site/src/styles.css",
        "apps/site/scripts/generate-pages.tsx",
        "apps/site/src/session-navigation.ts",
        "apps/site/src/shell-route-policy.ts",
        "apps/site/src/asset-router.ts",
        "apps/site/src/question-player/react/bootstrap.tsx",
        "apps/site/src/hazard-player/react/bootstrap.tsx",
        "apps/site/src/review/react/bootstrap.tsx",
        "apps/site/src/simulation/react/bootstrap-player.tsx",
        "apps/site/test/session-navigation.test.ts",
        "apps/site/browser-tests/delivery.pw.ts"
      ],
      "prerequisiteFixtures": ["navigation-state-gating-characterization", "history-replace-characterization", "offline-terminal-route-closure-characterization"],
      "foundationIds": ["document-shell", "page-header", "layout-primitives", "action-controls", "feedback-page-states", "visually-hidden"],
      "presentationCases": ["global-shell-ready", "focused-shell-ready", "compact-navigation", "ample-navigation", "offline-terminal", "print-shell-removal"],
      "answerLeakAndRouteClosureChecks": ["session navigation cannot bypass legal player state", "Back and replace history preserve one session entry", "unknown/offline routes retain requested identity"],
      "removalCriteria": ["All static and island route shells pass landmark/skip-link/history parity", "Old navigation hook has zero current producers"],
      "stopBoundary": "STOP because navigation is currently gesture-gated but not player-state-gated; resolve behavior separately and do not encode disabled-looking links. Labels and hierarchy remain dependency-owned."
    },
    {
      "order": 4,
      "id": "question-and-review",
      "routeFamilyNumbers": [11, 13],
      "currentFiles": [
        "apps/site/src/styles.css",
        "apps/site/scripts/generate-pages.tsx",
        "apps/site/src/question-player/react/bootstrap.tsx",
        "apps/site/src/question-player/react/context.tsx",
        "apps/site/src/question-player/react/provider.tsx",
        "apps/site/src/question-player/react/player.tsx",
        "apps/site/src/question-player/react/question-form.tsx",
        "apps/site/src/question-player/react/feedback.tsx",
        "apps/site/src/question-player/state.ts",
        "apps/site/src/question-player/controller.ts",
        "apps/site/src/question-player/view-requests.ts",
        "apps/site/src/review/react/bootstrap.tsx",
        "apps/site/src/review/react/review-queue.tsx",
        "apps/site/src/review/controller.ts",
        "apps/site/src/review/model.ts",
        "apps/site/browser-tests/question-player.pw.ts",
        "apps/site/browser-tests/review-queue.pw.ts"
      ],
      "prerequisiteFixtures": ["review-variant-characterization", "question-ready-commit-reveal-error-characterization", "review-acknowledgement-characterization"],
      "foundationIds": ["page-header", "action-controls", "form-controls", "action-bar", "feedback-page-states", "live-region", "progress-position", "figure-image-viewport", "visually-hidden"],
      "presentationCases": ["question-ready", "question-committing", "question-answered-revealed", "question-recoverable-error", "review-ready", "review-empty", "review-quarantine"],
      "answerLeakAndRouteClosureChecks": ["durable commit precedes feedback request and render", "review acknowledgement is explicit", "review routes compose intended review semantics", "postcommit object identity remains item-scoped"],
      "removalCriteria": ["Practice and review compositions have characterized behavior and independent tests", "Old feedback/review hooks have zero producers after parity proof"],
      "stopBoundary": "STOP because generated review routes currently mount the normal question bootstrap and practice composition; do not rename or style that into a review variant. Stop on any commit/reveal, acknowledgement, focus, or answer-boundary change."
    },
    {
      "order": 5,
      "id": "hazard-and-simulation",
      "routeFamilyNumbers": [12, 14],
      "currentFiles": [
        "apps/site/src/styles.css",
        "apps/site/scripts/generate-pages.tsx",
        "apps/site/src/hazard-player/react/player.tsx",
        "apps/site/src/hazard-player/react/context.tsx",
        "apps/site/src/hazard-player/react/provider.tsx",
        "apps/site/src/hazard-player/react/scene-viewport.tsx",
        "apps/site/src/hazard-player/react/annotated-scene.tsx",
        "apps/site/src/hazard-player/react/zone-navigator.tsx",
        "apps/site/src/hazard-player/react/marker-controls.tsx",
        "apps/site/src/hazard-player/react/commit-controls.tsx",
        "apps/site/src/hazard-player/react/results.tsx",
        "apps/site/src/hazard-player/state.ts",
        "apps/site/src/hazard-player/controller.ts",
        "apps/site/src/hazard-player/view-requests.ts",
        "apps/site/src/simulation/react/setup.tsx",
        "apps/site/src/simulation/react/bootstrap-setup.tsx",
        "apps/site/src/simulation/react/player.tsx",
        "apps/site/src/simulation/react/hazard-item.tsx",
        "apps/site/src/simulation/react/results.tsx",
        "apps/site/src/simulation/react/bootstrap-results.tsx",
        "apps/site/src/simulation/controller.ts",
        "apps/site/src/simulation/model.ts",
        "apps/site/browser-tests/hazard-player.pw.ts",
        "apps/site/browser-tests/simulation.pw.ts"
      ],
      "prerequisiteFixtures": ["hazard-visual-nonvisual-characterization", "viewport-coordinate-and-keyboard-characterization", "simulation-final-reveal-characterization"],
      "foundationIds": ["layout-primitives", "action-controls", "action-bar", "feedback-page-states", "live-region", "progress-position", "figure-image-viewport", "visually-hidden"],
      "presentationCases": ["hazard-ready-visual", "hazard-marking-visual", "hazard-revealed-visual", "hazard-ready-nonvisual", "hazard-revealed-nonvisual", "simulation-active", "simulation-results", "width-320", "forced-colors", "print"],
      "answerLeakAndRouteClosureChecks": ["verified image bytes precede visual controls", "target regions remain postcommit", "simulation items reveal only after final durable submission", "nonvisual task remains independently identified"],
      "removalCriteria": ["Shared viewport extraction preserves coordinate and lifetime proofs", "Every unmatched hazard/simulation hook has a later explicit disposition and zero obsolete producers"],
      "stopBoundary": "STOP if sharing changes marker coordinates, verified-image lifecycle, nonvisual equivalence, durable commit, simulation editing/final reveal, or requires a frozen responsive threshold. Similar markup is insufficient grounds to merge ownership."
    },
    {
      "order": 6,
      "id": "atlas-and-reference",
      "routeFamilyNumbers": [4, 6, 7, 8, 9, 10, 16, 17],
      "currentFiles": [
        "apps/site/scripts/generate-pages.tsx",
        "apps/site/src/styles.css",
        "apps/site/src/route-registry.ts",
        "apps/site/test/static-site-generation.test.ts",
        "apps/site/browser-tests/delivery.pw.ts",
        "apps/site/browser-tests/accessibility-and-presentation.pw.ts"
      ],
      "prerequisiteFixtures": ["reference-long-content-characterization", "comparison-intrinsic-overflow-characterization", "documented-only-route-owner-check"],
      "foundationIds": ["document-shell", "page-header", "layout-primitives", "prose-lists", "action-controls", "feedback-page-states", "figure-image-viewport", "visually-hidden"],
      "presentationCases": ["atlas-index-ready", "atlas-family-comparison-ready", "profile-progressive-evidence-ready", "filtered-empty", "offline-stale", "withdrawn", "width-320", "print"],
      "answerLeakAndRouteClosureChecks": ["static reference pages load no answer-bearing executable closure", "comparison overflow is named and contained", "documented-only routes are never claimed as current implementations"],
      "removalCriteria": ["Every existing generator producer migrates with stable URL/SEO/evidence semantics", "Old reference selector has zero producers and image-rights/provenance checks remain green"],
      "stopBoundary": "STOP for route families 9, 10, and 16 because they have no current implementation owner; also stop on copy, SEO, evidence, image-rights, or visual-hierarchy questions owned by earlier plans."
    },
    {
      "order": 7,
      "id": "utility-offline-correction-print",
      "routeFamilyNumbers": [15, 18, 19, 20],
      "currentFiles": [
        "apps/site/src/styles.css",
        "apps/site/scripts/generate-pages.tsx",
        "apps/site/src/settings/react/bootstrap.tsx",
        "apps/site/src/settings/react/settings.tsx",
        "apps/site/src/settings/preferences-boot.ts",
        "apps/site/src/offline-packs/react/bootstrap.tsx",
        "apps/site/src/offline-packs/react/pack-manager.tsx",
        "apps/site/src/corrections/react/bootstrap.tsx",
        "apps/site/src/corrections/react/correction-form.tsx",
        "apps/site/src/print/react/builder-bootstrap.tsx",
        "apps/site/src/print/react/builder.tsx",
        "apps/site/src/print/react/preview-bootstrap.tsx",
        "apps/site/src/print/react/preview.tsx",
        "apps/site/browser-tests/local-data-and-packs.pw.ts",
        "apps/site/browser-tests/settings-review-rebuild.pw.ts",
        "apps/site/browser-tests/print.pw.ts"
      ],
      "prerequisiteFixtures": ["local-data-restoration-characterization", "utility-destructive-confirmation-characterization", "print-product-separation-characterization"],
      "foundationIds": ["page-header", "layout-primitives", "action-controls", "form-controls", "action-bar", "feedback-page-states", "live-region", "progress-position", "disclosure-dialog", "visually-hidden"],
      "presentationCases": ["settings-loading-ready-empty-warning-error", "offline-loading-ready-empty-warning-error", "destructive-confirmation", "print-preview-normal", "print-preview-large-print", "forced-colors", "browser-zoom-400"],
      "answerLeakAndRouteClosureChecks": ["restoration precedes authoritative ready or empty", "correction stays local until explicit online submit", "question/key and blank/annotated print products remain separated", "pack operation never exposes answer-bearing diagnostics"],
      "removalCriteria": ["Delayed-read fixtures prove truthful restoration", "All utility and print producers use later contracts and old hooks have zero producers", "Print pagination and deterministic 400 percent automation remain complete"],
      "stopBoundary": "STOP because settings initializes visible default preferences and offline packs initializes an empty list before authoritative restoration. Stop on pack lifecycle, correction activation, destructive scope, print separation, or persistence changes."
    },
    {
      "order": 8,
      "id": "obsolete-selector-removal",
      "routeFamilyNumbers": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
      "currentFiles": [
        "apps/site/src/styles.css",
        "apps/site/scripts/generate-pages.tsx",
        "apps/site/test/static-site-generation.test.ts",
        "apps/site/browser-tests/accessibility-and-presentation.pw.ts"
      ],
      "prerequisiteFixtures": ["zero-producer-selector-check", "full-static-react-parity-check", "dependency-complete-state-mode-matrix"],
      "foundationIds": ["document-shell", "page-header", "layout-primitives", "prose-lists", "action-controls", "form-controls", "action-bar", "feedback-page-states", "live-region", "progress-position", "disclosure-dialog", "figure-image-viewport", "visually-hidden"],
      "presentationCases": ["all-future-automated-mode-rows", "all-browser-zoom-400-rows", "full-route-family-closure", "full-print-disposition"],
      "answerLeakAndRouteClosureChecks": ["all initial route closures remain answer-free", "all postcommit requests remain state-gated and item-scoped", "all current and documented route IDs have truthful ownership"],
      "removalCriteria": ["Every removed selector/token has zero producers/references", "All consumers migrated on one rebased base", "Complete later matrix and repository CI pass"],
      "stopBoundary": "STOP unless every consumer is migrated on one dependency-complete rebased base, zero-producer checks pass, static/React parity holds, all 270 automated rows exist, three independent Codex review lanes preserve dissent, and CI is green."
    }
  ],
  "gapAssignments": [
    {
      "trancheId": "characterization-and-validation",
      "undefinedTokens": ["--shadow-card", "--text-lg"],
      "unmatchedHooks": [],
      "unmatchedDynamicHooks": []
    },
    {
      "trancheId": "controls-and-feedback",
      "undefinedTokens": [],
      "unmatchedHooks": ["error-panel", "feedback-claims", "field-hint", "field-label", "status-panel", "status-panel-danger", "status-panel-warning", "status-text", "text-input"],
      "unmatchedDynamicHooks": []
    },
    {
      "trancheId": "shell-and-navigation",
      "undefinedTokens": [],
      "unmatchedHooks": [],
      "unmatchedDynamicHooks": []
    },
    {
      "trancheId": "question-and-review",
      "undefinedTokens": [],
      "unmatchedHooks": ["review-notice"],
      "unmatchedDynamicHooks": []
    },
    {
      "trancheId": "hazard-and-simulation",
      "undefinedTokens": [],
      "unmatchedHooks": ["hazard-player", "hazard-player__commit", "hazard-player__commit-status", "hazard-player__image-layer", "hazard-player__marker", "hazard-player__marker-list", "hazard-player__marker-moves", "hazard-player__markers", "hazard-player__prompt", "hazard-player__results", "hazard-player__viewport", "hazard-player__viewport-controls", "hazard-player__visual", "hazard-player__zero-confirm", "hazard-player__zones", "result-list", "simulation-navigator", "simulation-results", "simulation-setup-panel", "simulation-timer"],
      "unmatchedDynamicHooks": ["hazard-result-marker--decoy-false-positive", "hazard-result-marker--duplicate", "hazard-result-marker--false-positive", "hazard-result-marker--hit"]
    },
    {
      "trancheId": "atlas-and-reference",
      "undefinedTokens": [],
      "unmatchedHooks": [],
      "unmatchedDynamicHooks": []
    },
    {
      "trancheId": "utility-offline-correction-print",
      "undefinedTokens": [],
      "unmatchedHooks": ["print-answer-key", "print-correction-excerpt", "print-explanations", "print-hazard-answers", "print-hazard-worksheet", "print-original-statement", "print-page-shell", "print-profile-fact-sheet", "print-question-section", "print-text-equivalent", "print-tool-cards"],
      "unmatchedDynamicHooks": []
    },
    {
      "trancheId": "obsolete-selector-removal",
      "undefinedTokens": [],
      "unmatchedHooks": [],
      "unmatchedDynamicHooks": []
    }
  ],
  "testCoverage": {
    "siteVitestFiles": 30,
    "siteVitestDirectCallsites": 177,
    "siteVitestEachCallsites": 7,
    "siteVitestEffectCallsites": 40,
    "siteVitestCallsites": 224,
    "workspaceVitestFiles": 39,
    "workspaceVitestDirectCallsites": 224,
    "workspaceVitestEachCallsites": 14,
    "workspaceVitestEffectCallsites": 40,
    "workspaceVitestCallsites": 278,
    "playwrightFiles": 11,
    "playwrightDeclarations": 70,
    "projects": ["chromium", "firefox", "webkit"],
    "focusAssertions": 64,
    "explicitTabSequences": 2,
    "viewport320Cases": 2,
    "largeTextAttributeAssertions": 9,
    "axeCases": 1,
    "forcedColorCases": 1,
    "reducedMotionCases": 1,
    "printMediaEmulations": 4,
    "futureMatrixCoverage": "none",
    "openCodexVerificationGaps": ["deterministic 400 percent browser-zoom mechanism", "emitted accessibility-tree and speech-model checks", "Letter and A4 pagination assertions", "grayscale and clipping assertions"]
  },
  "supplementaryEvidence": [
    {
      "id": "packet-validator",
      "command": "node plans/validate-007-ui-foundations-prework.mjs",
      "result": "pass",
      "subject": "current-site-not-plan007-prototype",
      "evidenceClass": "non-user-supplementary-check",
      "userParticipant": false,
      "countsTowardHumanEvidence": false,
      "countsTowardDecision": false,
      "canSubstituteForDependencyShas": false,
      "note": "Recomputes source inventory, dependency sentinels, exact harness specification, migration closure, and promotion guards."
    },
    {
      "id": "frozen-dependency-install",
      "command": "npx --yes bun@1.4.0 install --frozen-lockfile",
      "result": "pass",
      "subject": "current-site-not-plan007-prototype",
      "evidenceClass": "non-user-supplementary-check",
      "userParticipant": false,
      "countsTowardHumanEvidence": false,
      "countsTowardDecision": false,
      "canSubstituteForDependencyShas": false,
      "note": "Exact repository Bun checked 112 installs across 192 packages with no lockfile or tracked-source change."
    },
    {
      "id": "repository-verify-pinned",
      "command": "npx --yes bun@1.4.0 run verify",
      "result": "pass",
      "subject": "current-site-not-plan007-prototype",
      "evidenceClass": "non-user-supplementary-check",
      "userParticipant": false,
      "countsTowardHumanEvidence": false,
      "countsTowardDecision": false,
      "canSubstituteForDependencyShas": false,
      "note": "Passed exact Bun/Node toolchain, 223-file layout, 117-module boundaries, blocked certification record, 396 visual hashes, content build, five workspace typechecks, browser-harness typecheck, 39 unit files with 352 tests, 526-document site build, and artifact/answer-leak closure."
    },
    {
      "id": "chromium-current-site-pinned",
      "command": "npx --yes bun@1.4.0 run test:browser:chromium",
      "result": "pass",
      "subject": "current-site-not-plan007-prototype",
      "evidenceClass": "non-user-supplementary-check",
      "userParticipant": false,
      "countsTowardHumanEvidence": false,
      "countsTowardDecision": false,
      "canSubstituteForDependencyShas": false,
      "note": "All 66 current Chromium cases passed, including existing keyboard, focus, axe, 320px, forced-color, reduced-motion, print, offline, persistence, and answer-boundary coverage; this is not the future Cartesian harness."
    },
    {
      "id": "patch-hygiene",
      "command": "git diff --check",
      "result": "pass",
      "subject": "current-site-not-plan007-prototype",
      "evidenceClass": "non-user-supplementary-check",
      "userParticipant": false,
      "countsTowardHumanEvidence": false,
      "countsTowardDecision": false,
      "canSubstituteForDependencyShas": false,
      "note": "Whitespace and patch hygiene for the three provisional artifacts only."
    }
  ],
  "codexReviewLanes": [
    {
      "laneId": "component-api-coherence",
      "protocol": "CODEX-ONLY-UIUX-V1",
      "canonicalTaskId": "/root/component_contract_review_v2",
      "completionState": "completed",
      "scope": "component-api-coherence",
      "reviewerType": "codex-subagent",
      "userParticipant": false,
      "humanEvidence": "none",
      "notHumanUsabilityTested": true,
      "evidenceCoordinates": ["plans/007-ui-foundations-prework.md:15", "plans/007-ui-foundations-prework.md:86", "plans/007-ui-foundations-prework.md:115", "plans/007-ui-foundations-prework.md:967", "plans/007-ui-foundations-prework.md:1086", "plans/007-ui-foundations-prework.md:1522", "plans/007-ui-foundations-prework.md:1934", "plans/007-ui-foundations-prework.md:2015", "product/ARCHITECTURE_CONSTRAINTS.md:219", "product/COMPONENT_ARCHITECTURE.md:59", "product/COMPONENT_ARCHITECTURE.md:85", "product/COMPONENT_ARCHITECTURE.md:286", "apps/site/src/question-player/react/context.tsx:32", "apps/site/src/question-player/react/provider.tsx:15", "apps/site/src/question-player/react/player.tsx:14", "apps/site/src/hazard-player/react/context.tsx:34", "apps/site/src/hazard-player/react/provider.tsx:15", "apps/site/src/hazard-player/react/player.tsx:12"],
      "findings": ["The provisional template coheres with the maintained composition model: semantic HTML first, children and compound pieces for structure, explicit named variants instead of behavioral booleans, and provider-adapted state/actions/meta responsibilities.", "The packet remains fail-closed: all 13 foundation API/token decisions are pending, all seven archetype token inputs and thresholds are null, and only absent exact Step 2 and Step 3 decision SHAs can release later reconciliation.", "The owner inventory matches one static generator and 11 independently mounted React roots. Question and hazard implementations demonstrate React 19 context, semantic command adapters, explicit visual/nonvisual hazard compositions, and provider-owned presentation effects without establishing a shared final API.", "Known composition drift is fenced rather than promoted: review routes currently mount the practice question composition, and migration stops before altering review semantics, persistence, focus, announcement, or reveal boundaries."],
      "consensus": "no-blocking-dissent",
      "dissent": ["Current question and hazard context values include content or modality fields alongside state/actions/meta, and their implemented named-variant surfaces are narrower than the maintained conceptual family contract."],
      "dissentDisposition": [{"dissent": "Current question and hazard context values include content or modality fields alongside state/actions/meta, and their implemented named-variant surfaces are narrower than the maintained conceptual family contract.", "disposition": "retained-provisional", "evidenceCoordinates": ["product/COMPONENT_ARCHITECTURE.md:189", "product/COMPONENT_ARCHITECTURE.md:239", "product/COMPONENT_ARCHITECTURE.md:286", "apps/site/src/question-player/react/context.tsx:32", "apps/site/src/question-player/react/player.tsx:14", "apps/site/src/hazard-player/react/context.tsx:34", "apps/site/src/hazard-player/react/player.tsx:12", "plans/007-ui-foundations-prework.md:86", "plans/007-ui-foundations-prework.md:2015"]}],
      "chainOfThoughtStored": false
    },
    {
      "laneId": "responsive-accessibility-behavior",
      "protocol": "CODEX-ONLY-UIUX-V1",
      "canonicalTaskId": "/root/responsive_accessibility_review_v2",
      "completionState": "completed",
      "scope": "responsive-accessibility-behavior",
      "reviewerType": "codex-subagent",
      "userParticipant": false,
      "humanEvidence": "none",
      "notHumanUsabilityTested": true,
      "evidenceCoordinates": ["plans/007-ui-foundations-prework.md:100", "plans/007-ui-foundations-prework.md:200", "plans/007-ui-foundations-prework.md:256", "plans/007-ui-foundations-prework.md:282", "plans/007-ui-foundations-prework.md:924", "plans/007-ui-foundations-prework.md:1601", "plans/007-ui-foundations-prework.md:2196", "plans/007-ui-foundations-source-inventory.schema.json:597", "plans/007-ui-foundations-source-inventory.schema.json:708", "plans/validate-007-ui-foundations-prework.mjs:681", "plans/validate-007-ui-foundations-prework.mjs:873", "plans/validate-007-ui-foundations-prework.mjs:954", "apps/site/src/styles.css:310", "apps/site/src/styles.css:316", "apps/site/src/styles.css:485", "apps/site/src/styles.css:889", "apps/site/src/styles.css:894", "apps/site/src/styles.css:899", "apps/site/src/styles.css:910", "apps/site/browser-tests/accessibility-and-presentation.pw.ts:14", "apps/site/browser-tests/accessibility-and-presentation.pw.ts:24", "apps/site/browser-tests/accessibility-and-presentation.pw.ts:50", "apps/site/browser-tests/accessibility-and-presentation.pw.ts:72", "apps/site/browser-tests/accessibility-and-presentation.pw.ts:89", "product/DESIGN_SYSTEM.md:185", "product/DESIGN_SYSTEM.md:254", "product/DESIGN_SYSTEM.md:526", "product/DESIGN_SYSTEM.md:582"],
      "findings": ["The seven responsive-mode observations match source: the 20rem floor, 125% root-text mode, unused inline-size container, sole 46rem viewport query, reduced-motion rules, forced-color rules, and two print-rule regions are accurately characterized as current limitations.", "The harness contains 30 unique specification-only states and nine unique automated modes spanning all seven candidate archetypes: 270 planned rows, zero current rows, and null mode evidence. The deterministic 400% browser-zoom mechanism remains explicitly open.", "Future assertions cover semantic reading order, bounded overflow, 44px primary targets, unobscured focus, announcement behavior, serious/critical axe closure, non-color cues, forced colors, reduced motion, print separation, and precommit leak closure without claiming those checks have run against a Plan 007 prototype.", "Independent source recount confirms 11 Playwright files, 70 test declarations, 64 focus assertions, two explicit Tab sequences, two 320px cases, nine large-text attribute assertions, one axe builder callsite covering two question states, one forced-color case, one reduced-motion case, and four print-media emulations.", "The packet accurately preserves current coverage gaps: large-text tests check preference propagation rather than route reflow; 400% zoom, accessibility-tree/speech behavior, Letter/A4 pagination, grayscale, and clipping remain unevidenced.", "Current target-size risk is real: five practice marker movement/removal controls and five corresponding simulation controls lack the shared button class, while the stylesheet has no dedicated marker-control button rule.", "This review makes no disposition of the separate implementation-migration lane's blocking dissent."],
      "consensus": "no-blocking-dissent",
      "dissent": [],
      "dissentDisposition": [],
      "chainOfThoughtStored": false
    },
    {
      "laneId": "implementation-migration-risk",
      "protocol": "CODEX-ONLY-UIUX-V1",
      "canonicalTaskId": "/root/migration_risk_review_v2",
      "completionState": "completed",
      "scope": "implementation-migration-risk",
      "reviewerType": "codex-subagent",
      "userParticipant": false,
      "humanEvidence": "none",
      "notHumanUsabilityTested": true,
      "evidenceCoordinates": ["plans/007-ui-foundations-prework.md:1937", "plans/007-ui-foundations-prework.md:2045", "plans/007-ui-foundations-prework.md:2051", "plans/007-ui-foundations-prework.md:2052", "plans/007-ui-foundations-prework.md:2172", "plans/007-ui-foundations-prework.md:2175", "apps/site/src/hazard-player/react/context.tsx:34", "apps/site/src/hazard-player/react/context.tsx:43", "apps/site/src/hazard-player/react/provider.tsx:15", "apps/site/src/hazard-player/react/provider.tsx:86", "apps/site/src/hazard-player/react/player.tsx:3", "apps/site/src/hazard-player/react/player.tsx:24", "apps/site/src/hazard-player/assessment.ts:5", "apps/site/src/hazard-player/react/annotated-scene.tsx:42"],
      "findings": ["The prior omission is resolved: the hazard-and-simulation tranche now lists context.tsx and provider.tsx exactly once. Both are tracked, active owners; player.tsx imports and exposes HazardPlayerProvider, while the provider constructs the context value consumed by the compound pieces.", "An independent set comparison found all 35 tracked apps/site/src TSX files represented in the eight-tranche union with no missing TSX producer. The validator independently enforces that closure.", "The four source-derived hazard marker modifiers match the payload inventory and flattened tranche assignment exactly once. Omission and duplicate adversarial checks are present.", "An independent Vitest recount found only it, it.each, and it.effect forms and reproduced site 177+7+40=224 across 30 files and workspace 224+14+40=278 across 39 files.", "The stale blocking implementation-review row may be replaced only by this real task identity and resolved-dissent disposition; the red state must not be bypassed by relabeling."],
      "consensus": "no-blocking-dissent",
      "dissent": [],
      "dissentDisposition": [{"dissent": "The migration union initially omitted the hazard context and provider TSX owners.", "disposition": "resolved", "evidenceCoordinates": ["plans/007-ui-foundations-prework.md:2051", "plans/007-ui-foundations-prework.md:2052", "apps/site/src/hazard-player/react/context.tsx:43", "apps/site/src/hazard-player/react/provider.tsx:15", "apps/site/src/hazard-player/react/player.tsx:24"]}],
      "chainOfThoughtStored": false
    }
  ],
  "humanEvidenceRows": [],
  "decisionRecords": []
}
```
<!-- ui007-prework:inventory-json:end -->
