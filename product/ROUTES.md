# Route and navigation contract

**Status:** maintained implementation contract, accepted 2026-08-23.

**Navigation direction:** `NAV-CODEX-1` — separate learner-task and
utility/trust discovery, with focused players; selected 2026-08-28 under
`CODEX-ONLY-UIUX-V1`.

**Evidence label:** **NOT HUMAN-USABILITY-TESTED**. Human evidence is `none` and
the human participant count is `0`; the direction is a contract-fit selection,
not observed first-click, tree-test, task-success, preference, or
assistive-technology evidence.

## Machine-readable selected-direction closure

```json
{
  "schemaVersion": "codex-only-rule-closure-v1",
  "programVersion": "CODEX-ONLY-UIUX-V1",
  "directionId": "NAV-CODEX-1",
  "evidenceMode": "codex-only",
  "humanEvidence": "none",
  "humanParticipantCount": 0,
  "notHumanUsabilityTested": true,
  "rules": [
    {
      "id": "NAV-FOCUSED-PLAYERS",
      "statement": "Give every player a named session landmark, progress, and truthful explicit exit without acquisition or utility navigation."
    },
    {
      "id": "NAV-NATIVE-COMPACT",
      "statement": "Use a named native no-JavaScript-safe compact disclosure before global links wrap into peer rows."
    },
    {
      "id": "NAV-NOJS",
      "statement": "Keep primary discovery as static ordinary document navigation with truthful JavaScript-free fallbacks."
    },
    {
      "id": "NAV-NONVISUAL-EQUAL-DISCOVERY",
      "statement": "Give visual and text-keyboard hazard tasks equivalent discovery without claiming identical measurement."
    },
    {
      "id": "NAV-PRACTICE-TASK-HUB",
      "statement": "Lead Practice with concrete task starts and place translated capacity diagnostics after those starts."
    },
    {
      "id": "NAV-ROUTE-IDENTITY",
      "statement": "Preserve every fixed route identity, canonical path, and no-JavaScript purpose."
    },
    {
      "id": "NAV-STATIC-REVIEW-ENTRY",
      "statement": "Expose Review through a normal static parent entry while retaining local and noindex semantics."
    },
    {
      "id": "NAV-TWO-TIER",
      "statement": "Separate learner tasks from utility and trust destinations instead of presenting every destination as a peer."
    },
    {
      "id": "SHARED-EXPLICIT-PROFILE-CONTEXT",
      "statement": "Require explicit or visibly neutral profile context and never silently substitute the first jurisdiction."
    },
    {
      "id": "SHARED-HUMAN-EVIDENCE-BOUNDARY",
      "statement": "Keep human evidence none, human participant count zero, and every result labeled not human usability tested."
    },
    {
      "id": "SHARED-PRESERVE-LOAD-BEARING-TRUTH",
      "statement": "Preserve unofficial status, uncertainty, source support, local-data risk, security boundaries, and commit-before-reveal."
    }
  ]
}
```

This file turns the 21 destination families in `FEATURE_SPEC.md` into one
canonical path registry. It controls route identity, public path shape,
indexability, document/island ownership, parent navigation, offline behavior,
failure behavior, and implementation order. `SCREEN_STATES.md` controls the
legal states within each route. `COMPONENT_ARCHITECTURE.md` may refer to the
stable route IDs below but does not redefine their URLs.

The production host remains unresolved in `../docs/OPEN.md` P17. That does not
block path planning: canonical URLs are the selected production origin plus the
paths in this registry.

## Route invariants

- Generated routes end in `/`. The origin redirects an otherwise equivalent
  non-trailing-slash request to the trailing-slash canonical.
- Public route identity is a stable kebab-case `routeId`; display labels may
  change without changing that identity.
- Static generation owns documents, metadata, canonical links, navigation,
  reference content, and safe no-JavaScript fallbacks. React 19 owns only the
  explicitly named interactive islands.
- There is no client-side application router. A cross-page navigation is a
  normal document navigation. An island may use the History API only as defined
  by `SCREEN_STATES.md`; URL state is never durable study truth.
- Indexable documents contain substantive semantic HTML before JavaScript.
  IndexedDB state, ephemeral sessions, personalized queues, previews, settings,
  and operational status pages are `noindex` and excluded from sitemaps.
- Filters and sort keys use query parameters. They are not separate canonical
  pages. Indexable list routes emit a canonical link without those parameters.
- Opaque local IDs (`sessionId`, `printJobId`) are non-secret identifiers. They
  must not encode a learner, answer, key, score, or other sensitive state.
- `position` is one-based for people and is validated against the pinned
  session. The URL never selects an item outside that session.
- Slugs are publication data. A changed slug emits one reviewed permanent
  redirect; historical administration IDs are never recycled.
- A missing published resource is a truthful 404. A known retired resource with
  retained history stays at 200 with retired/superseded status. A deliberately
  withdrawn resource with no safe representation may be 410.
- Offline navigation may use only an already cached document and an active,
  validated pack. The app never fabricates a page, silently substitutes another
  profile/pack, or describes an unavailable resource as empty.

## Rendering and search labels

| Label | Meaning |
|---|---|
| `static` | Generated semantic HTML/CSS owns the whole useful document; no study runtime is loaded. |
| `static + island` | Generated HTML is useful alone; one lazy React 19 island owns the named interaction. |
| `island route` | The document shell and safe fallback are generated, while a lazy React island owns the application surface. |
| `index` | Self-canonical, included in a sitemap when its publication gate passes. |
| `conditional` | Indexed only when the unique-utility and content-review gates below pass. |
| `noindex` | `noindex,follow`, excluded from sitemaps; it may still link to public references. |

## Implementation milestones

| Milestone | Exit condition |
|---|---|
| `M0` | Static generator, document shell, canonical/error policy, React-island bootstrap, and route-contract tests exist. |
| `M1` | Profile/source registry and crawlable profile, study, atlas, procedure, repair, FAQ, and transparency documents publish from validated data. |
| `M2` | One source-backed question completes the React-island, one long-lived `ManagedRuntime`, IndexedDB commit-before-reveal, reload, print, accessibility, leak, and offline proof. |
| `M3` | Review and hazard families work with directional confusion data, accessible nonvisual equivalents, and truthful local queue states. |
| `M4` | Deterministic simulation, results, print generation, and full session restoration work. |
| `M5` | Explicit pack lifecycle, settings/import/export/reset, corrections workflow, recovery/status surfaces, and release-wide navigation/state tests work. |

`M2` is the first implementation vertical slice. Later milestones do not relax
the release gates in `FEATURE_SPEC.md`.

## Canonical registry: 21 destination families

The `routeId` values in the second column are stable API-like identifiers. A
family can contain multiple page routes while remaining one of the 21 recovered
destination families.

| # / destination family | Stable route IDs and canonical path patterns | Parent navigation | Search / owner | Offline contract | Status and failure behavior | Milestone |
|---|---|---|---|---|---|---|
| 1. Home / study dashboard | `home` — `/` | global root | `index`; static overview/navigation. Personalized resume/due summaries belong to the `study-hub` island | Cached document remains fully useful | Missing local study state changes the Study call to action but is not a Home error; invalid selected profile links to profile recovery | M0 |
| 2. Exam selector | `exam-selector` — `/exams/` | Home | `index`; static published profile list + lazy `ExamSelector` filtering/selection island | Uses the cached profile registry and visibly reports its verification/version age | Zero published profiles is `empty`; invalid registry is `content-unavailable`, never a guessed list | M1 |
| 3. “Not sure which exam?” checker | `exam-checker` — `/exams/check/` | Exam selector | `noindex`; static safety guidance + lazy `ExamChecker` form island | Works against cached profiles; offline results are explicitly limited to that registry | No match and multiple plausible matches are valid results; malformed input stays editable; never silently selects | M1 |
| 4. State/jurisdiction/profile | `profile` — `/ny/`, `/ny/{jurisdictionSlug}/`, `/ny/{jurisdictionSlug}/{titleSlug}/{administrationId}/` | Home → state → jurisdiction | State hub `index`; jurisdiction `conditional`; administration `index` when reviewed; static facts + small select/resume island | Cached historical/profile documents remain readable; selection requires the referenced compatible pack or a clear download path | Unknown/conflicting facts render their fact states. Historical/superseded administrations retain URLs and link to the current jurisdiction hub. Unknown IDs are 404 | M1 |
| 5. Study/practice hub | `study-hub` — `/practice/` | Home | `index`; static study-method/content overview + lazy `StudyHub` local actions island | Cached overview works; actions are enabled only for locally available compatible content | No selected profile is a recoverable prerequisite state; insufficient compatible inventory is explicit and links to profiles/packs | M1; local actions M2–M4 |
| 6. Tool atlas index | `atlas-index` — `/atlas/` | Study | `index`; static catalog + lazy `AtlasFilters` island | Cached catalog and active-pack images remain usable; uncached media has a named unavailable state | No matching filter is `empty`; invalid taxonomy publication fails the build; missing media does not invent a tool description | M1 |
| 7. Tool-family comparison | `atlas-family` — `/atlas/family/{familySlug}/` | Atlas | `conditional` on substantive reviewed comparison; primarily static, optional local-practice actions island | Cached page remains readable; uncached alternate imagery is omitted with status | Unknown slug is 404; unpublishable/thin family is not generated; retired family may redirect only after reviewed taxonomy mapping | M1 |
| 8. Tool detail | `atlas-tool` — `/atlas/tool/{toolSlug}/` | Atlas → family | `index` after source/rights/accessibility review; primarily static, optional atlas media/practice island | Cached text and accepted derivatives remain readable; optional large/alternate views never auto-download | Unknown slug is 404; retired concept stays visible with correction/supersession notice when history exists | M1 |
| 9. Cleaning procedures | `procedures-index` — `/procedures/`; `procedure-detail` — `/procedures/{procedureSlug}/` | Study | Index is `index`; detail is `conditional` on source-backed substantive guidance; static, with optional practice action island | Cached reviewed instructions remain readable; absent linked media is explicit | Filter zero-result is `empty`; unsupported manufacturer-specific claims block publication; unknown detail is 404 | M1 |
| 10. Repair-tool laboratory | `repair-lab` — `/repairs/` and `/repairs/{topicSlug}/` | Study | Index `index`; topics `conditional`; static reference + optional comparison/practice island | Cached entry-level topics work; unavailable content is never filled from high-level material | Out-of-scope/high-level/watchlist topics are unpublished or visibly gated; unknown topic is 404 | M1 |
| 11. Question practice | `question-player` — `/practice/session/{sessionId}/question/{position}/` | Study (`study-hub`); player returns to Practice | `noindex`; safe generated fallback + lazy `QuestionPlayer` island | Player starts/resumes only with its pinned active pack and durable session; otherwise pack/session recovery is shown | Selection, commit, reveal, storage failure, correction notice, retired item, and session-complete states follow `SCREEN_STATES.md`; invalid local IDs do not reveal content | M2 |
| 12. Hazard laboratory/player | `hazards-index` — `/hazards/`; `hazard-player` — `/hazards/session/{sessionId}/scene/{position}/` | Study → Hazards | Landing `index`, static + setup island; player `noindex` island route | Requires the pinned scene bytes and nonvisual data locally; no partial start with missing assets | Zero marks is valid; asset/region/version mismatch is content-unavailable; commit failure preserves editable neutral markers and reveals nothing | M3 |
| 13. Spaced review | `review-queue` — `/review/`; `review-player` — `/review/session/{sessionId}/item/{position}/` | Home/Study → Review | Both `noindex`; generated shell + lazy review islands | Queue rebuilds from local events; active items require their pinned retained content or a correction/retirement representation | Empty due queue is success. Corrupt projection offers rebuild; missing historical object is quarantined, never silently replaced | M3 |
| 14. Simulation | `simulation-setup` — `/simulations/`; `simulation-player` — `/simulations/session/{sessionId}/question/{position}/`; `simulation-results` — `/simulations/session/{sessionId}/results/` | Study → Simulations | Setup `index` with substantive static disclaimer + island; player/results `noindex` island routes | A simulation starts only after all pinned items/assets are local; it autosaves locally and remains pinned across connectivity changes | Insufficient inventory blocks start truthfully. No item reveal before final submission. Results never claim an official converted score/pass prediction | M4 |
| 15. Print | `print-center` — `/print/`; `print-preview` — `/print/preview/{printJobId}/` | Study → Print | Center `index` with static print guidance + generator island; preview `noindex` island route and printable semantic HTML | Generation/preview work from locally retained validated content; system print needs no server | Missing inventory/asset, pagination warning, stale job, and generation failure retain settings and offer regeneration; key and question outputs stay separable | M2 fixture, full M4 |
| 16. FAQ | `faq` — `/faq/` | global Help | `index`; static only | Cached document works fully | Unknown facts remain explicitly unknown and link to profile/source pages; build failure prevents stale hand-copied fact publication | M1 |
| 17. Sources, corrections, FOIL, security, privacy | `transparency-index` — `/transparency/`; `source` — `/transparency/sources/` and `/transparency/sources/{sourceId}/`; `corrections` — `/transparency/corrections/`; `foil` — `/transparency/foil/`; `security` — `/transparency/security/`; `privacy` — `/transparency/privacy/` | global Transparency | `index` when reviewed; static only except optional local export links | Cached records remain readable; external links are visibly unavailable offline rather than simulated | Unknown source ID is 404; withdrawn/unsafe material gets a non-reproducing status record; unresolved and corrected claims remain visible | M1 for core records, M5 completion |
| 18. Correction/security submission | `correction-submit` — `/report/` | Transparency / contextual Report links | `noindex`; static prohibition/privacy text + lazy `CorrectionForm` island | Drafting is local. Offline action is “save draft,” never “submitted”; explicit later submission is required | Validation/rate/network failures retain safe fields and a client receipt ID; suspected secure content is held nonpublicly and never echoed | M5 |
| 19. Settings | `settings` — `/settings/` | global utility navigation | `noindex`; generated shell + lazy `Settings` island | All local preferences, export, pack-neutral reset preparation, and storage diagnostics work offline | Import is previewed/validated/quarantined before write; destructive reset requires explicit scope/confirmation and reports durable result | M5 |
| 20. Offline packs / updates | `offline-packs` — `/offline/` | global utility navigation / Settings | `noindex`; static explanation + lazy `OfflinePackManager` island | This route owns download, stage, verify, activate, update, remove, retention, quota, and eviction-warning UI | Partial/invalid downloads quarantine; prior valid pack stays active; active-session pins block unsafe removal; retry is idempotent | M2 single-pack proof, full M5 |
| 21. Explicit status/error/content unavailable | `status` — `/status/`; terminal 404/410/5xx documents render at the requested URL | global Help or nearest valid parent | `noindex`; static recovery guide + optional lazy local diagnostics island | A precached offline fallback links to cached Home, Offline, Settings, and available packs; it never masquerades as the requested page | Distinguish not found, withdrawn, invalid publication, offline-unavailable, storage-unavailable, and service failure; preserve safe user input/state where possible | M0 shell, full recovery M5 |

### Conditional publication gate

A `conditional` jurisdiction/reference route is generated and indexed only when
it provides reviewed unique utility, not merely a substituted place or keyword.
Qualifying utility includes multiple verified local facts, eligibility or title
differences, official links, administration/list history, or genuinely distinct
instruction. Thin variants are not generated, are consolidated into a stronger
hub, or remain `noindex`; canonical tags do not launder doorway pages.

## Additional acquisition spokes

These are approved static spokes, not extra application destination families.
They obey the same source, unknown-fact, security, and publication gates.

| Stable route ID | Canonical path | Status / owner | Milestone |
|---|---|---|---|
| `scoring-explainer` | `/scoring/` | `index`; static explanation of what is known/unknown and why site practice accuracy is not an official score | M1 |
| `actual-questions-explainer` | `/actual-custodian-exam-questions/` | `index`; static lawful-public-sample/security explainer directing learners to original practice | M1 |
| `about` | `/about/` | `index`; static operator independence, editorial method, funding/privacy posture, update cadence, and correction/contact path without fabricating a real-name biography | M1 |
| `nyc-disambiguation` | `/nyc-custodian-exams/` | Deferred `conditional`; publish only with substantive, sourced disambiguation from the statewide entry-level series | post-v1 |

## Cross-cutting capability ownership

These capabilities do not get additional routes in v1. Their owner is explicit
so they cannot disappear between data-model and page implementation.

| Capability | Owning route(s) |
|---|---|
| Active profile, recent sessions, resumable session, and compact progress/history summaries | `study-hub`; Home links there but does not load the study runtime |
| Due reasons and detailed review history | `review-queue`; immutable attempt detail remains reachable from the applicable player/result history representation |
| Session construction and inventory shortfall | The relevant `question-player` landing, `hazards-index`, or `simulation-setup`; shared controls come from `SessionBuilder` composition |
| Import, validated preview, export, projection rebuild, and scoped reset | `settings` |
| Storage/quota/eviction diagnosis and pack cleanup | `settings`, with pack operations delegated to `offline-packs` and terminal recovery help in `status` |
| Profile history, source provenance, correction history, FOIL work, security, privacy, and operator method | `profile`, the relevant `transparency-*` route, and `about` |
| Public correction/contact and suspected-security reporting | `correction-submit`; there is no second generic contact form |
| Installation status and PWA prompt | A bounded enhancement on `offline-packs`; installability does not get a separate route |

## Locale and expansion policy

- English is the canonical content language at launch.
- A reviewed Spanish equivalent uses `/es` before the complete English path,
  for example `/es/atlas/tool/{toolSlug}/`. It is generated and indexed only
  when the page itself is substantively reviewed; locale switching never falls
  through to machine-only or partial authoritative claims.
- Locale variants use reciprocal `hreflang` links only when both documents
  exist. Missing translations link to the English original without creating a
  thin `/es/` document.
- A locale-qualified identity is `locale + routeId + route params`; the stable
  `routeId` itself does not change.
- Other jurisdictions reuse the profile path grammar only after compatibility
  and unique-utility gates pass. High-level series content requires a separate
  compatible hub/pack and never shares an entry-level session.

## Navigation contract

`NAV-CODEX-1` preserves every route ID, path, indexability value, document/island
owner, offline rule, and capability above. It changes discovery hierarchy and
display-language constraints while reaffirming the maintained focused-player
requirements. Values in the registry's
`Parent navigation` column are logical ownership coordinates; the selected
display structure below supersedes their old peer-flat presentation.

### Selected structural envelope

Do not present every destination family as a peer. Global discovery separates
links that begin or continue learner tasks from links for utility, data,
evidence, policy, and operator trust. The two semantic roles are a promoted
constraint, not selected display groups: exact labels, group count, membership,
nesting, and order remain owner-locked unresolved questions. This contract does
not create stable group IDs or infer a hierarchy from task popularity.

Route IDs remain the stable identity. A contextual task, recovery, report, or
evidence link may bypass the global regions. Downstream candidates must retain
every fixed route and compare their exact grouping within this envelope rather
than treating the navigation-lane candidate as participant consensus.

### Focused-player boundary

The four maintained player route IDs—`question-player`, `hazard-player`,
`review-player`, and `simulation-player`—use focused work chrome. Cross-lane
evidence does not select the prior proposed complement that assigned every
other fixed route to one `standard` class. Non-player shell composition remains
governed by each route's existing document/island ownership and later
implementation contracts; it may not be inferred from a path prefix.

### Wide and compact shells

Global-navigation documents own the brand/Home link and the distinct
learner-task and utility/trust regions. At ample widths the regions are visibly
distinct. At compact widths, brand and current profile context remain visible
while a named native disclosure holds navigation. Its exact summary and link
grouping are unresolved; the unenhanced HTML contains all links, works with
JavaScript disabled, exposes a programmatic name, supports keyboard operation,
and restores focus to its trigger when dismissed.

Compact navigation must transform before peer links wrap into multiple rows or
fall below the maintained target size. A menu is not a SPA router: every route
change is an ordinary document navigation. `aria-current` derives from the
current stable route ID for each rendered link (never shell, proposed group, or
path-prefix inference) and applies to Settings, Offline, trust, and study
destinations as well as the original five sections.

When a compatible profile is selected, show `Profile: {label}` plus its relevant
version outside the compact disclosure on study, setup, and focused routes.
That context links to the profile document and may be enhanced by an island, but
it is never available only through JavaScript or only inside a menu.

### Profile and Practice continuity

Profile pages retain substantive static facts. A bounded `Use this profile`
action owns durable selection through the existing authoritative preference and
pack-recovery boundary; it must not introduce a second profile truth. After a
successful selection, offer the next Practice action. Without JavaScript,
profile facts and explicit destinations remain available and the page states
truthfully that local selection/resume needs JavaScript.

Practice never selects the first jurisdiction or Nassau implicitly. It either
uses the visible selected profile or renders the existing recoverable
prerequisite/neutral context. Feasible question-practice starts precede the
capacity diagnostics and state exact counts without timing estimates. Tool,
procedure, repair, visual/nonvisual hazard, Review, simulation, longer-set, and
print tasks remain discoverable from their fixed parent surfaces. The exact
labels, grouping, order among those task families, and primary question count
remain unresolved; a shortest-available primary is a one-lane hypothesis, not
the selected direction.

Procedures and repairs join the same study catalog when their publication gates
pass. Actual set length/distribution and insufficient-inventory truth remain at
the decision. The full capacity matrix, translated filter names, and technical
diagnostics follow the task starts under a named disclosure/supporting section;
raw keys and repeated disabled controls do not form the main navigation.

Home presents one visually dominant first action plus secondary task links, but
the agent evidence does not establish a universal preference between
`Check my exam` and `Start practice`. The implementation must keep both tasks
findable and may use explicit product state or correctness prerequisites; it may
not infer popularity or silently select an exam to manufacture a default.

### Focused work

`focused-player` routes contain only site identity, visible relevant profile
context, a named session landmark, item position/status, previous/next where
legal, and one explicit `Exit to {owning hub}` or `Save and exit`. They omit
acquisition, trust, and utility navigation. Exit/history/persistence semantics
remain those of `SCREEN_STATES.md`; a display label cannot imply a save that did
not durably succeed.

Simulation results and print preview remain in the standard shell for this
scope. A separately reduced result/preview shell appeared in one navigation
lane only and is not promoted as consensus.

Breadcrumbs are generated from the registry, never by splitting URL strings.
They show location and parentage; they do not replace the current profile or
focused-session landmark.

### Navigation verification

In addition to the route acceptance list below, implementation must prove:

1. all four fixed player route IDs map explicitly to focused work chrome,
   without inferring shell behavior from paths or assigning an unsupported
   complement to every other route;
2. 320 CSS-pixel and wide layouts preserve target size and avoid a wrapped peer
   link cloud;
3. compact disclosure operation, semantic-region separation, focus restoration,
   and link closure work with keyboard and JavaScript disabled;
4. selected profile/version remains visible outside the disclosure and Practice
   never substitutes a profile;
5. every focused player has a named session landmark and a truthful explicit
   exit, with no acquisition/utility navigation;
6. utility destinations receive correct current-page state;
7. ordinary document navigation, back/forward, offline availability, and
   answer-leak boundaries are unchanged; and
8. automated/Codex checks remain labeled non-human evidence and never claim
   first-click, tree-test, comprehension, preference, or usability success.

## Route acceptance

Route work is incomplete until automated checks prove:

1. every generated document maps to exactly one stable route ID and canonical;
2. every route parameter decodes and validates before content lookup;
3. sitemap membership matches this file's search policy;
4. static route production closures contain no React, Effect, study runtime, or
   player preload edges unless the row explicitly names an island;
5. island routes load only their declared lazy entrypoint;
6. no precommit route artifact contains keys, rationales, full naming
   descriptions, or answer-bearing metadata;
7. cached/offline navigation produces the same route identity and a truthful
   availability state;
8. 404, withdrawn, retired, stale, invalid, and offline-unavailable cases remain
   distinguishable;
9. keyboard focus reaches the document heading or state-specific recovery target
   after navigation; and
10. each route ID has a component/story/test fixture for every applicable legal
    state in `SCREEN_STATES.md`.
