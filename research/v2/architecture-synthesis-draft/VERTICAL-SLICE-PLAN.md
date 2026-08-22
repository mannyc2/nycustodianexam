# First implementation vertical slice (DRAFT)

One question, end to end, across the recommended workspaces. Nothing in this
plan is implemented yet; it is the acceptance contract for the first
implementation PR series.

## Slice path

1. **Source-backed question fixture** — one original multiple-choice question
   in `packages/content` source form, with correct rationale, a rationale per
   distractor, and source lines (FEATURE_SPEC non-negotiables). No real exam
   content.
2. **v4 Schema decode** — `apps/content-compiler` decodes it with the pinned
   cohort; invalid fixtures fail with typed `SchemaError`.
3. **Relational compiler gate** — missing rationale/source/taxonomy reference
   fails the build; unknowns render as explicit unknowns.
4. **Generated semantic HTML** — compiler emits a static, crawlable question
   page; zero framework JS on the static view.
5. **Interactive player bootstrap** — lazy island using the direct-DOM
   baseline renderer and one app-owned ManagedRuntime.
6. **v4 service/use case** — AttemptService.commit through Context.Service +
   focused Layers.
7. **Durable IndexedDB commit** — AttemptStore strict transaction
   (attemptEvents + projection + session checkpoint) via the platform-browser
   provider behind AppDatabase.
8. **Typed failure / no reveal** — injected commit rejection shows retry,
   never correctness; attempt id stable across retry.
9. **Successful reveal** — only after transaction completion or
   committed-record reconciliation.
10. **Focus/live-region behavior** — focus to outcome heading; polite
    announcement; no pre-commit leak in DOM or accessibility tree.
11. **Reload/offline restoration** — selection and committed state restore on
    a real origin; session persistence flushed before navigation.
12. **Bundle/accessibility/browser tests** — Playwright suite (seeded from
    the probe-execution scenarios) green in Chromium; route closure within
    the provisional budget (≤ 40 KB gzip interactive, ≤ 2 KB static);
    axe-level automated a11y scan clean.
13. **Cloudflare preview** — built site served via the Workers Static Assets
    preview path.

## Stop conditions

Stop and re-decide (do not patch around): the GA cohort breaks the compile
contract; the provider fails the transaction contract in any target browser;
the route closure exceeds budget by >25%; the compiler gate cannot express a
required publication rule; any accessibility invariant needs renderer help
the baseline cannot provide (that is the lit-html trigger, not a framework
rewrite trigger).

## Explicitly out of slice

Hazard scenes (R2.9 pilot), simulations, spaced review, offline packs beyond
the single active generation, service-worker precache policy, any Worker
endpoint, observability beyond error surfacing.
