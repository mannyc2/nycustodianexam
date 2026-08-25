# NY Entry-Level Custodians and Janitors Study Site
## Normalized product contract — recovered 2026-08-19

**Source:** normalized from the 3,427-line `CUSTODIAN_STUDY_SITE_FEATURE_SPEC_V1.md` authored 2026-08-17. Original recovered SHA-256: `1d94e4e5155ae3adf768493bf31755042709ac46f3cde356bf799ca1e39a3368`.

**Authority:** this file specifies product behavior. `../docs/FACTBASE.md`, `../docs/SCOPE.md`, `../docs/TAXONOMY.md`, and `../docs/OPEN.md` control exam facts and scope. `ARCHITECTURE_CONSTRAINTS.md` controls later implementation decisions where this recovered contract had treated them as open engineering choices.

Normative terms: **MUST** is release-blocking, **SHOULD** is the expected v1 behavior, **MAY** is optional. Editorial defaults and exact algorithms remain hypotheses unless promoted by evidence.

---

# 1. Product contract

The site provides **free, independent, original visual preparation for the New York Entry-Level Custodians and Janitors series, with every scored explanation tied to public source evidence**. It is unofficial and must never imply agency affiliation.

A learner must be able to:

1. select the correct exam/announcement profile without invented facts;
2. learn tool families and visually confusable concepts;
3. answer original multiple-choice questions before seeing correctness;
4. mark hazards in original scenes before reveal;
5. recover misses through local spaced review;
6. run site-designed simulations without claims about unknown official length/weights/scoring;
7. print questions, answer sheets, keys/explanations, and text equivalents;
8. use core study functions offline and without an account; and
9. inspect sources, corrections, change history, security policy, and unresolved facts.

## Hard constraints

- Free access; no paywall, ad inventory, sponsored placement, or pay-to-unlock progress.
- Phone-first responsive operation.
- No required account; progress is local-first.
- Mutable exam facts render from versioned data, not duplicated handwritten prose.
- Unknown, unpublished, conflicting, or unverified facts stay explicit.
- Practice inventory counts and distributions are derived from actual content, never hard-coded as exam weights.
- Simulations are always labeled **practice simulations**.
- Do not claim an official item count, official section weights, equal item values, unscored-item status, raw-to-final formula, section minimum, identical forms, predictable cadence, appointment odds, or a current review procedure unless a controlling source later establishes it.
- Entry-level and high-level series remain separate.
- All scored questions and illustrations are original or independently rights-cleared.
- FOIL access by itself is not a reuse license.
- Correctness is never revealed before commitment.
- Every scored question has a correct rationale, a rationale for every distractor, and source line(s).
- Accessibility equivalents are first-class content, not an afterthought.

---

# 2. Content and fact boundaries

## Fact states

Mutable announcement facts use a status equivalent to:

- `verified`
- `not_published`
- `unverified`
- `conflicting`
- `superseded`
- `not_applicable`

A shared fact renderer must expose status, source, verification date, and profile version. Conflicts retain both values and sources. Templates reference facts by stable IDs rather than copying dates/fees/qualifications into prose.

## Immutable/versioned content

- Typographic-only corrections may increment an item revision while retaining stable identity.
- A changed key, substantive stem, illustration, or rationale creates a new immutable item version.
- Attempts retain the exact item/profile/content versions presented.
- Retired items are removed from new sessions but remain in historical results with correction notices.
- Announcement facts retain effective-date history instead of overwriting the past.
- Concept progress can migrate through stable concept tags; historical correctness is never rewritten.

## Logical content domains

Implementation should preserve boundaries equivalent to:

- profile registry and fact history;
- source/claim registry;
- tool/concept taxonomy;
- original questions and explanations;
- hazard scenes/targets/decoys;
- image assets and rights/accessibility metadata;
- content-pack manifests;
- local attempt/progress/review/session state.

---

# 3. Information architecture

The recovered v1 route vocabulary was application-oriented. Final public SEO URLs may differ, but all capabilities below remain required unless explicitly deferred.

## Core destinations

- Home / study dashboard
- Exam selector
- “Not sure which exam?” checker
- Official-scope / announcement profile
- Study/practice hub
- Tool atlas index
- Tool-family comparison
- Tool detail
- Cleaning-procedure library + detail
- Repair-tool laboratory + subsections
- Question player
- Hazard laboratory + hazard player
- Spaced-review queue + review player
- Simulation setup + player + results
- Print center + preview
- FAQ
- Sources / corrections / FOIL-research / security page
- Correction/security submission
- Settings
- Offline packs / updates
- Explicit error/content-unavailable states

SEO acquisition routes and interactive session routes may use different URL conventions. Indexable routes must contain crawlable semantic HTML; ephemeral session state must not create duplicate acquisition pages.

## Shared screen states

Every applicable screen supports explicit states rather than optimistic blanks:

- `loading`
- `empty`
- `ready`
- `selected`
- `answered`
- `reviewed`
- `offline-stale`
- `error`

A page must explain why content is unavailable and offer a relevant recovery action. Offline-unavailable is not equivalent to “no content exists.” Invalid data cannot be replaced by guessed values.

---

# 4. Global interaction principles

- Always expose the active exam/profile and profile version where it affects content.
- Show online/offline status only when it changes available behavior.
- Maintain visible keyboard focus and a skip link.
- Announce save/update/error status programmatically.
- No streak-loss, countdown-pressure, guilt, or artificial urgency language.
- Phone primary actions may use a sticky bottom region, but it must not obscure focused content.
- No required action depends solely on hover, swipe, long press, precision dragging, color, or animation.
- Prefer native HTML controls and semantics.

---

# 5. Exam/profile UX

## Selector

Search/browse by exam number, title, jurisdiction, year, competition type, and series level. Never infer level merely from number formatting. A title spanning multiple levels requires confirmation.

Profile cards expose only data-backed fields and visibly distinguish:

- Entry-Level vs High-Level;
- open-competitive vs promotion when known;
- verified date/number/jurisdiction facts;
- current content availability and last verification.

Switching profiles during a session must preserve the existing session against its pinned profile/version.

## Announcement checker

A learner may enter public announcement details—number, title, jurisdiction, competition type, test date, public subject wording—to identify a profile. The form warns users **not** to paste secure questions, choices, drawings, review notes, or reconstructed content.

Multiple plausible profiles are shown as possibilities; the product never silently chooses one.

## Scope/profile page

Must distinguish:

1. profile identity;
2. administration facts;
3. verbatim announced subjects where lawfully/publicly stored;
4. unknown test-design facts such as counts/weights/conversion/form identity;
5. what the site covers and excludes;
6. what site content is original;
7. profile change history;
8. controlling-document notice;
9. actions to select, study, print, and inspect sources.

---

# 6. Study/reference surfaces

## Tool atlas

Search/filter by canonical English name, family, distinguishing feature, use, domain, confusion set, and local review status. Each entry exposes source status and original imagery where available.

Tool-family pages compare confusable concepts side-by-side, identify the decisive distinguishing features, explain correct/incorrect uses, provide nonvisual comparison, and route directly into retrieval practice.

Tool detail includes:

- canonical English name;
- reviewed instructional translation/gloss where available;
- multiple angles/in-use images where approved;
- distinguishing physical features;
- intended and unsafe/incorrect uses;
- confusables and decisive contrast;
- neutral scored-attempt description;
- full learning description;
- nonvisual equivalent;
- source and rights basis;
- correction history;
- actions for tool/pair practice, review, and print.

Reviewed translation must preserve the canonical English term and never imply the official exam is bilingual.

## Procedures / repair

Procedure content must remain source-backed and must not universalize manufacturer-specific dilution, pad, RPM, chemical, dwell-time, or surface claims.

Repair content is data-driven from the verified entry-level universe. Tier-C/watchlist concepts and high-level operations cannot leak into entry-level practice merely because they are occupationally plausible.

---

# 7. Question player

## Commitment boundary

Immediate-feedback modes use:

`READY → SELECTED → COMMITTING → ANSWERED_REVEALED → REVIEWED`

Simulation defers reveal until session submission.

Before commitment the rendered UI/accessibility tree may contain the prompt, neutral image description, choices, selection state, neutral domain context, flag state, timer/session position, and permitted hints. It must **not** expose:

- correctness state;
- the correct option ID in user-facing markup/classes;
- rationale text;
- answer-bearing full image descriptions;
- target-identifying confusion feedback;
- source excerpts that directly answer the item;
- answer-bearing public asset metadata/filenames;
- correctness-dependent styling.

The offline content package necessarily contains keys; presentation still enforces the reveal boundary.

## Commit semantics

A selected answer remains editable until explicit submission. Submission writes one durable attempt transaction before reveal. Failure leaves the learner's selection editable and clearly reports that it was not saved.

A committed response is immutable. Reload restores the same answer and explanation. An active session remains pinned to its exact content version even if an update becomes available.

## Explanations

After commitment show, in order:

1. outcome;
2. correct rationale;
3. rationale for the learner's choice;
4. rationale for every other distractor;
5. decisive feature/rule when authored;
6. confusion-set feedback when applicable;
7. source lines with publisher/locator/date/tier;
8. full post-submission image description;
9. review/report/next actions.

External source-link failure cannot remove the stored source excerpt from offline explanations.

## Confusion tracking

Incorrect choices that map to a known confusion set create a **directional** event: `correct concept → selected concept`. Do not invent a pair when none is authored. Recovery practice should test both directions and vary angle/context where possible.

## Input/accessibility

- native radio behavior;
- option count is data-driven;
- keyboard completion of selection/submit/flag/navigation;
- explicit submit (never submit-on-option-tap in v1);
- zoom/reset controls for images, with pinch only supplementary;
- focus moves to the outcome after successful commitment and to the next heading after navigation.

“Answered,” “feedback presented,” and “reviewed/advanced” are separate events. Do not infer that an explanation was read from scroll position or dwell time.

---

# 8. Hazard-scene player

A scene may be visual mark-to-identify, timed visual scan, guided scan, nonvisual zoned equivalent, or print worksheet. Visual and nonvisual results may share concept tags but are reported separately because they are not identical constructs.

## Pre-reveal behavior

- unannotated original scene;
- no target count;
- learner adds/removes/moves neutral markers;
- zero marks is a valid submission with neutral confirmation;
- explicit submit before any correctness calculation or reveal.

Phone interaction needs explicit accessible mark/pan/zoom controls; multi-touch cannot be the only path.

## Matching

After commitment, assign markers to authored target regions at most one-to-one, using configurable touch tolerance. Distinguish:

- hit;
- miss;
- general false positive;
- decoy false positive;
- duplicate mark when useful diagnostically.

The scoring model cannot invent meaning for an unauthored object.

## Reveal/feedback

After submission, synchronize visual zones with textual feedback. No category relies on color alone.

For hazards reveal observable condition, why unsafe, likely consequence, immediate control/correction concept, tags, and source lines. For authored decoys explain why the detail looked suspicious, why it is safe as depicted, what change could make it unsafe, and the source basis.

Misses and decoy false positives schedule concept/discrimination review. Prefer a different scene testing the same principle before immediate repetition when inventory permits.

## Nonvisual equivalent

Before commitment provide a neutral overview, ordered zones, and observable facts without calling them safe/unsafe or disclosing target count. After commitment provide the hazard/decoy/correction/source explanation and explicitly note that this is an equivalent knowledge task rather than the same visual-recognition construct.

---

# 9. Sessions, simulations, and spaced review

## Session assembly

Inputs include profile/version, content-pack/version, mode, requested length, selected domains/families/confusion sets, format preferences, timing/hint settings, recent-item exclusions, deterministic seed, and review priorities.

Every generated set stores/displays the actual length and actual distribution. When no official blueprint exists, label it **site-designed distribution**.

Never satisfy insufficient inventory by silently importing another series, unverified concepts, or unmarked repeats.

Given the same versions/settings/seed/progress snapshot, deterministic session generation should reproduce the same ordered item IDs and option order; this supports print regeneration and diagnostics.

## Simulation

Always show a pre-start disclaimer that official item count, distribution, and conversion are unverified where that remains true.

Learners can select site-designed length, timing, content mix, visual/nonvisual formats, and other supported options. A two-hour envelope may be offered as practice without claiming official item count.

During simulation:

- choices are editable until final session submission;
- no correctness or explanation appears early;
- unanswered/current/flagged state is accessible without relying on color;
- state autosaves locally;
- timer can be hidden;
- strict auto-submit is opt-in, not default.

Results show raw practice accuracy, elapsed time, actual generated distribution, domain/family/confusion/hazard practice metrics where sample size is visible, and the explicit statement: **practice accuracy is not an official converted score or pass prediction**.

## Spaced review

Reasons may include incorrect answer, directional confusion, flag, hazard miss, decoy false positive, general false positive, routine refresh, corrected-content notice, and manually added concept.

The recovered v1 proposed configurable intervals (10 minutes, 1 day, 3 days, 7 days, then longer refreshes), but exact timing is an editorial hypothesis—not an exam fact or scientifically “optimal” claim.

Use “due,” “reviewed,” “recent accuracy,” and “practice history.” Do not label a concept “mastered” after a single success.

---

# 10. Print contract

The print center creates deterministic low-ink materials from validated content. Required product classes:

- blank answer sheet;
- original multiple-choice set;
- separately controllable answer key plus explanations/source packet;
- tool-family contrast cards;
- hazard worksheet;
- separate annotated hazard-answer packet;
- text-equivalent/nonvisual set;
- announcement-profile fact sheet;
- correction/change-log excerpt where relevant.

Controls include profile, product type, filters, site-selected count bounded by inventory, image inclusion, large-print mode, grayscale preview, answer-key placement, explanation/source inclusion, deterministic seed, and paper/margin choices.

Every practice packet says **Original practice — not an official or past exam** and includes profile/content version and actual generated distribution. No count is labeled official.

Answer keys must be physically/visually separable. Source excerpts remain readable offline. Print uses semantic HTML + print CSS and delegates “Save as PDF” to the browser rather than requiring a server PDF service.

Preview exposes pagination/page count, low-ink/grayscale issues, regeneration, system print, and a deterministic print-job manifest. Printed output excludes site navigation, ads, banners, and unrelated chrome.

Large print and text-equivalent packs are first-class. Answer sheets must include text labels in addition to bubbles/marks.

**Recovery limitation:** an earlier dedicated print-system conversation reportedly contained additional packet-length and answer-transfer rehearsal details, but no standalone durable artifact was found in the Library. Those details require source recovery/reconciliation before becoming normative here.

---

# 11. Conceptual data model

The recovered spec defined these core entities/invariants; implementation field names may change but the concepts may not disappear without explicit product review.

## Sources and claims

- `SourceCitation`: tier, title, publisher, dates, canonical/archive URL, version, rights notes.
- `SourceLine`: precise locator, excerpt, language, verification time, supported claim IDs.
- `SupportedClaim`: localized text, source-line IDs, evidence tier, caveat.

Every substantive explanation claim resolves to source line(s).

## Announcement profiles

Versioned profile includes jurisdiction/title/exam number(s), series level, competition type, test-plan compatibility, content availability, source IDs, change history, and fact-state wrappers for filing period/date/fee/jurisdictions/qualifications/subjects/medium/counts/weights/scoring/review/form identity.

Validation rejects verified-without-source facts, overlapping history, unsupported verbatim claims, high-level leakage, and bank-allocation defaults masquerading as official facts.

## Tags/confusion sets

Tags include domain, family, concept, confusion set, environment, hazard category, correction-ladder category, series scope, and editorial difficulty. A concept belongs to a domain/family. Editorial difficulty is never called official difficulty.

## Images

An image asset stores stable/versioned identity, kind, dimensions/viewBox/checksum, neutral pre-answer text, full post-answer description, nonvisual equivalent linkage, rights record, and tags.

Published scored visual content requires neutral alt, learning description, reviewed rights, and a nonvisual equivalent or a blocking exception.

## Questions/explanations

Question stores version, kind, localized prompt, optional image, options/concept mappings, key, explanation, tags, compatibility scope, accessibility links, original-content attestation, and security/content/accessibility review status.

Publication requires exactly one key for v1 single-choice items, a rationale per distractor, explicit scope, source support, rights/accessibility completion, and passed reviews.

## Hazard scenes

Store zones, target regions, decoy regions, neutral overview, localized observable/interpretive feedback, compatibility, sources, and review states. Zero-hazard authored scenes are data-model-valid; player logic cannot assume a positive target count.

## Content packs

Manifest includes locale, series/test-plan/profile compatibility, schema/source versions, immutable object IDs, derived counts, byte size, checksum, publication time, and lifecycle. Derived counts are generated, never hand-entered.

## Local progress/events

Attempt events are append-only and pin profile/content/item versions, mode/format, timing/hints, choice/markers, correctness/matches, flags, and confusion events. Materialized progress and review queues can be rebuilt from events.

Entry-level and high-level progress cannot silently merge; use an explicit scope key.

Substantive progress belongs in IndexedDB or equivalent robust browser storage; only minimal boot preferences may use `localStorage`.

Export/import must be schema/version/checksum validated, event-ID based, previewed before writing, and able to quarantine unknown references. No cloud account is required for device migration.

---

# 12. Offline / low-bandwidth contract

The core browser experience must work without installation; installability is an enhancement.

Required offline architecture conceptually includes:

- web-app manifest and service worker;
- offline navigation/fallback behavior;
- explicit downloadable profile/content packs;
- immutable/versioned content objects;
- checksummed/schema-validated activation;
- atomic updates with previous valid version retained until success;
- active sessions pinned to their current version;
- no hidden bulk downloads.

A learner sees pack name, version, compatibility, estimated bytes, included counts, download/update/remove status, and browser-eviction warning.

Low-data mode may avoid prefetching alternate images/raster fallbacks and prioritize current/next content, but cannot remove core answer/review behavior.

Offline mode must not pretend external links opened, mark a draft correction as submitted, start sessions with missing required assets, silently treat an old profile as current, or block local export/reset/settings.

If durable browser storage is unavailable or full, warn before persistent study, offer inactive-pack removal/export, and never report a failed write as saved.

---

# 13. Accessibility contract

Target: **WCAG 2.2 AA behavior** for application and authored content. This is a product target, not a claim about agency accommodations.

## Scored visual content

Before commitment, provide neutral observable descriptions without naming the target/use/hazard/decoy. Full naming descriptions must not exist in the active accessibility tree before submission. Offer a linked text/nonvisual equivalent wherever the visual construct would otherwise exclude a learner.

After commitment, reveal full naming descriptions and source-backed explanations. Hazard long descriptions follow the same zone/number order as visual annotations.

## Interaction

- Complete all routes and player modes by keyboard.
- Prefer native controls.
- No keyboard trap; dialogs restore focus.
- Visible focus must not be hidden by sticky UI.
- No correctness communicated by color alone.
- Support zoom/reflow; intrinsic two-dimensional scenes get independent pan/zoom controls.
- No precision dragging required; provide alternate controls.
- Multi-touch is supplemental.
- Every timed mode has an untimed alternative; timer can be hidden; strict auto-submit is opt-in.
- Respect reduced motion.
- Programmatically announce save/submit/offline/error status.

## Language

Canonical content remains English. Reviewed instructional translations preserve the English technical term. Machine-only translation is not labeled professionally reviewed or authoritative. Language switching cannot change keys or source truth.

## Release QA

At minimum test keyboard-only completion, representative screen-reader flows for visual→nonvisual question and zoned hazard scene, zoom/reflow, reduced-motion, forced-colors/high-contrast, grayscale print, small-phone targets, focus non-obscuration, timer controls, and pre-submit absence of answer-bearing accessibility data.

---

# 14. Authoring, validation, and publication

Every publishable item follows this pipeline:

1. select compatible series/profile scope;
2. register public source and precise source lines;
3. tag concepts/family/confusions;
4. author original stem/options/key;
5. author correct + every distractor rationale;
6. attach original/rights-cleared imagery when needed;
7. author neutral/full descriptions and nonvisual equivalent;
8. perform content/source/security/rights/language/accessibility review;
9. preview phone/keyboard/screen-reader/print/offline/simulation behavior;
10. publish immutable version into validated content pack.

The build must block publication when, among other things:

- key/rationale/source invariants fail;
- a scored image lacks rights review or accessibility equivalents;
- a hazard/decoy cannot receive authored feedback;
- a verified profile fact lacks source evidence;
- conflicts are mislabeled verified;
- entry/high-level scope is invalid;
- a watchlist concept lacks appropriate scope approval;
- answer-bearing metadata leaks before reveal;
- mutable facts are hard-coded into protected templates;
- a translation is called reviewed without review metadata;
- security/content/accessibility review is pending or blocked.

Corrections never silently rewrite history.

---

# 15. Sources, corrections, security, and privacy

## Sources / transparency

The public source area should expose source registry, coverage/provenance, profile change log, content correction log, FOIL-research log, unresolved questions, test-security policy, image-rights methodology, and a correction path.

Source records distinguish official, research, official-format secondary mirror, commercial-description, anecdotal, and design-policy evidence as appropriate.

## Correction/security submission

Accept structured text reports for fact/question/explanation/image/accessibility/translation/rights/security concerns. No attachments in v1. Optional public-source URL and contact email may be accepted.

The form explicitly prohibits secure questions, options, reconstructed drawings, photographs, and review-session notes. Suspected secure content routes to a nonpublic hold and is never automatically echoed into public logs.

Offline submissions remain drafts until the learner explicitly submits later.

## Local-first privacy

No name, email, phone, address, employer, applicant ID, or admission number is required for studying. Progress is local by default. Correction email is optional and isolated.

No ad profiling, cross-site tracking, data sale, or third-party advertising audience creation.

Optional first-party product-research participation may use a random study ID and coarse product events, but must exclude question text, free-form corrections, exact search input, advertising IDs, and IP-derived location from the stored research dataset. Core use cannot depend on consent.

---

# 16. Network surface and resilience

The original v1 contract required no progress backend. The expected network surface is predominantly immutable static content plus, optionally, a small corrections endpoint.

A corrections endpoint must validate schema/size, rate-limit accessibly, avoid attachment handling/public auto-publication, route security triggers, be idempotent by client receipt ID, and return a generic status that does not confirm whether suspected secure content is genuine.

No other server API is required until a concrete product need justifies it.

Progress integrity rules:

- commit attempts atomically;
- advance session only after durable event save;
- retry cannot double-count;
- crash cannot turn a selection into an answer;
- content updates cannot mutate active sessions;
- import/migration/queue rebuild are idempotent;
- invalid packs are quarantined while the prior valid version remains available;
- going offline does not break a cached session;
- going online does not activate a new version mid-session.

---

# 17. Release acceptance

V1 is not releasable until all of these are demonstrably true:

1. Profiles can be selected/changed without series conflation and unresolved facts render explicitly.
2. Unknown item counts/weights/scoring do not break simulations or cause fake official claims.
3. Questions cannot reveal answers before explicit commitment.
4. Every published distractor has rationale + source-backed explanation.
5. Correct-but-flagged and incorrect attempts produce different review reasons.
6. Confusion mistakes are directional.
7. Hazard scenes support multiple/zero marks, undo, zoom, commit-before-reveal, and decoys.
8. Hazard feedback distinguishes hits, misses, false positives, and decoy false positives.
9. Nonvisual question and hazard equivalents are keyboard/screen-reader operable.
10. Simulation withholds explanations until final submit and reports only practice metrics.
11. Print separates questions/keys, identifies original practice, and includes profile/content versions.
12. Explicitly downloaded active packs work offline.
13. Progress survives reload/network failure and reports storage failure truthfully.
14. Mutable announcement facts are versioned/data-backed.
15. Source/correction/security surfaces are available.
16. No ads, paywall, or required account are present.

Testing must cover verified/not-published/unverified/conflicting/superseded/not-applicable profile facts; multiple bank sizes including small uneven inventories; different option counts; visual/nonvisual items; hazard/decoy/zero-hazard cases; retired content; unavailable external sources with cached excerpts; quota/network failures; and imports with unknown references.

A screenshot alone is insufficient for interactive-state acceptance: tests must also assert storage events, focus behavior, accessibility announcements, and reveal-boundary content.

---

# 18. Deliberately outside v1

Unless explicitly reprioritized:

- high-level HVAC/boiler/supervision study bank;
- fabricated official-length/weighted/converted/pass-prediction simulations;
- accounts/cloud sync/social login;
- cross-device live sync;
- leaderboards/public profiles/competitive streaks;
- push-notification/streak-freeze systems;
- community discussion/testimonial/candidate-recollection feeds;
- user-authored questions;
- file/image uploads to corrections;
- secure/recalled/reconstructed/purchased-dump “actual” questions;
- automated ingestion of FOIL-produced item text.

The profile/data model may support future high-level content, but it must attach to a separate compatible pack.

---

# 19. Build-order implication

The recovered product contract points to a vertical-slice implementation order rather than infrastructure-first work:

1. machine-readable source/profile/fact model + validation;
2. crawlable profile/source/atlas reference pages;
3. one end-to-end sourced tool concept with original image + accessibility metadata;
4. question player + immutable attempt event;
5. confusion tracking/review;
6. hazard scene + nonvisual equivalent;
7. deterministic session/simulation and print;
8. explicit offline packs/version switching;
9. correction endpoint only when static/local functionality is stable;
10. optional research telemetry only after privacy contract and core UX are proven.

The exact build tooling and Cloudflare deployment architecture are delegated to
`ARCHITECTURE_CONSTRAINTS.md`. The current-source R2 architecture program is
complete and reconciled; remaining work is implementation and release evidence,
not a forthcoming architecture research pass.
