# CODEX-ONLY-UIUX-V1 learner-task navigation review

```yaml
agentTaskId: /root/navigation_lane_v1
evidenceMode: codex-only
humanEvidence: none
humanParticipantCount: 0
notHumanUsabilityTested: true
statusLabel: NOT HUMAN-USABILITY-TESTED
```

## Record

| Field | Value |
|---|---|
| `taskId` | `CODEX-ONLY-UIUX-V1-NAV-001` |
| `recommendationId` | `NAV-C2-TASK-FIRST-TWO-TIER` |
| `evidenceMode` | `codex-only` |
| `label` | `NOT HUMAN-USABILITY-TESTED` |
| `humanEvidence` | `none` |
| `humanParticipantCount` | `0` |
| `notHumanUsabilityTested` | `true` |
| Site source base | `9fc7dcacfc961752e5d9a2cedbc426deead54a05` |
| Preserved Plan 005 inventory | `9daddbfde073f1f73d806a68dac427b69efc8359` |
| Preserved Plan 004 vocabulary evidence | `fecc71c5ea240385b3d98f896b1152022a2bbbe8` |
| Observation date | `2026-08-28` |
| Decision status | Codex-only, constraint-based implementation recommendation; not product-owner approval and not a human-usability result |

## Scope and method

| Item | Observation |
|---|---|
| Audited surface | Learner-task information architecture, global and compact navigation, no-JavaScript navigation, profile entry, practice starts, question/hazard/simulation player chrome, and navigation verification coverage |
| Source inspection | Read immutable Git blobs directly from the three coordinates above. `git diff 9fc7dcacfc961752e5d9a2cedbc426deead54a05..HEAD -- apps/site` was empty, so the current site source equals the requested base. |
| Artifact inspection | Inspected and SHA-256-pinned the existing generated `apps/site/dist` HTML/CSS artifacts. These artifacts are workspace build outputs rather than Git blobs; their hashes below identify the exact observed bytes. |
| Runtime inspection | Served `apps/site/dist` locally and inspected it in headless Chromium with JavaScript disabled at 320, 390, 768, and 1280 CSS px. No analytics, external accounts, or network research were used. |
| Compact measurement | At 320 CSS px, the seven primary links occupied three rows; header height was `168.1875px`, navigation height `106.390625px`, and page-level width stayed `320px`. At 390 CSS px, the links occupied two rows and the header was `127.390625px` high. |
| No-JavaScript check | Exam/profile links, the 45/60/90 question-set starts, both visual and keyboard-native hazard starts, breadcrumbs, and next-item links remained ordinary anchors. Question controls were disabled with a truthful JavaScript prerequisite. |
| Explicit exclusions | No participant contact, personas, role-play, inferred task popularity, human-behavior claim, assistive-technology session, real-device session, or 400% manual zoom certification. |

## Rubric

Each dimension is scored from 1 to 5 against repository contracts and directly observable artifact behavior, not against inferred human preference.

| Dimension | 1 | 3 | 5 |
|---|---|---|---|
| `R1 route coverage` | Required families are absent or effectively unreachable | Most implemented families have a route, with hierarchy gaps | All fixed families/spokes have an explicit, appropriate discovery level without changing route identity |
| `R2 task hierarchy` | Feature/build model dominates and all destinations compete | Some task grouping exists, but peer links or internal structure remain prominent | Primary, contextual, utility/trust, and session tasks are explicitly separated |
| `R3 profile continuity` | Profile has no actionable continuity or relevant context | Profile can be found but selection/context is incomplete | Profile selection, current profile/version, recovery, and next study action form one continuous path |
| `R4 compact/no-JS` | Requires script or wraps into an unstructured link cloud | Static links survive, with compact hierarchy or target-size gaps | Primary links and profile context remain usable without script; compact disclosure is native/progressive and non-wrapping |
| `R5 focused players` | Acquisition/utility navigation competes and no explicit exit exists | Some session chrome exists, with competing links or an ambiguous exit | Named session landmark, position, one explicit Exit/Save-and-exit, and no acquisition/utility navigation |
| `R6 language layering` | Internal/build/storage vocabulary leads learner decisions | Mixed task and internal wording | Task labels lead; required integrity, unofficial-status, and diagnostic detail stays visible at the decision or one disclosure away |
| `R7 verifiability` | Shell behavior is implicit and untested | Some layout/state checks exist | Route-family shell mapping, compact behavior, no-JS reachability, active context, and focused exits have deterministic tests |

## Baseline score

| Model | R1 | R2 | R3 | R4 | R5 | R6 | R7 | Total | Mean | Hard-constraint failures |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `NAV-BASE-CURRENT` | 2 | 2 | 1 | 2 | 1 | 2 | 1 | 11/35 | 1.57/5 | `HC-03`, `HC-04`, `HC-05` |

## Hard constraints

| ID | Constraint | Authority |
|---|---|---|
| `HC-01` | Preserve all 21 destination families, 32 core route IDs, four acquisition spokes, canonical paths, indexability, ownership, and offline contracts. | `[E04]`, `[E08]` |
| `HC-02` | Static documents own navigation and safe fallbacks; primary reading/navigation cannot depend on a SPA router or JavaScript. | `[E04]`, `[E05]` |
| `HC-03` | Compact navigation becomes a named native/progressively enhanced disclosure before links wrap below their usable target size; relevant profile/version context remains visible outside it. | `[E05]` |
| `HC-04` | Player routes expose a named session landmark and explicit Exit/Save-and-exit and do not render competing acquisition/utility navigation. | `[E04]`, `[E06]`, `[E07]` |
| `HC-05` | A selected-profile prerequisite is recoverable; practice may not silently substitute a profile, and the relevant current profile/version stays visible. | `[E04]`, `[E05]`, `[E06]` |
| `HC-06` | Keep independent/unofficial status, unknown-fact labels, site-designed-distribution and score boundaries, commit-before-reveal, source support, and secure-material prohibitions. Change layer and prominence, not required meaning. | `[E10]` |

## Findings

### `NAV-F01` — Replace the peer-flat, wrapping primary header

| Field | Value |
|---|---|
| Severity | 4/5 — high |
| Confidence | High |
| Evidence | `[E01]`, `[E03]`, `[A01]`, `[A09]` |
| Observed state | One generator function emits seven peers—Exam profile, Tool atlas, Practice, Hazards, Transparency, Offline packs, Settings—on every normal document. CSS wraps both header and navigation and has no compact-header transformation. Offline and Settings do not receive `aria-current` even on their own routes. Runtime inspection measured three rows/`168.1875px` at 320 CSS px and two rows/`127.390625px` at 390 CSS px. |
| Impact | Study destinations, trust material, and data utilities have no encoded tier. Compact layout preserves every link but loses hierarchy and consumes substantial first-screen space. This is a structural observation, not a claim about which links people use. |
| Positive retained | Native anchors, a named navigation landmark, brand-to-Home link, and `aria-current` on five sections are sound semantic foundations. No page-level horizontal overflow was observed at 320 CSS px. |
| Recommendation | Introduce explicit acquisition/study/utility and focused shell variants. At compact widths use a native `details`/`summary` or progressively enhanced button/disclosure whose unenhanced links remain present; keep current profile/version outside the disclosure. |
| Effort / change risk | M / medium: shared generator, CSS, route-to-shell registry, artifact expectations, and browser tests change together. |

### `NAV-F02` — Give question, hazard, review, and simulation players focused chrome

| Field | Value |
|---|---|
| Severity | 5/5 — release-contract failure |
| Confidence | High |
| Evidence | `[E01]`, `[E02]`, `[E04]`, `[E06]`, `[A05]`, `[A07]`, `[A08]` |
| Observed state | `document()` inserts the same header and footer for every generated page. Question, hazard, and simulation player artifacts each expose all seven global links. Breadcrumb and previous/next links exist, but there is no control labeled Exit or Save-and-exit and no shell-level landmark labeled as the session. |
| Impact | The generated player shell directly contradicts the maintained focused-player contract. It also makes the compact three-row global header part of every item view. No claim is made about accidental exits; the failure is the observable presence/absence mismatch. |
| Positive retained | Position labels, semantic headings, safe precommit fallbacks, ordinary previous/next anchors, and replace-history metadata already provide reusable session structure. |
| Recommendation | Render a focused shell for `question-player`, `hazard-player`, `review-player`, and `simulation-player`: site identity, current profile/version when relevant, named session landmark/position, status, and one explicit Exit or Save-and-exit to the owning hub. Omit acquisition and utility navigation. Keep results/print-preview mapping explicit rather than inferred. |
| Effort / change risk | M / medium: route mapping and history/exit semantics must remain aligned with `SCREEN_STATES.md`. |

### `NAV-F03` — Connect profile discovery, selection, context, and practice

| Field | Value |
|---|---|
| Severity | 5/5 — high correctness and IA risk |
| Confidence | High |
| Evidence | `[E02]`, `[E04]`, `[E08]`, `[A02]`, `[A03]`, `[A04]` |
| Observed state | The exam selector offers only “View this profile.” Profile pages expose facts and a single primary “Open the atlas” action; neither artifact contains a selection action or bounded selector island. The shared header has no active profile/version context. Independently, generation selects the first jurisdiction profile (falling back to the first profile) for all practice-capacity records and generated practice sessions, so the Practice page advertises Nassau sets without a preceding user selection. |
| Impact | “Confirm this profile” and “start practice for this profile” are separate, non-continuous paths, while practice silently receives a jurisdiction context. This is a source-level substitution, not an inference about visitor intent. |
| Positive retained | Both profile layers are statically readable, use stable canonical links, expose compatibility/unknown states, and remain useful without JavaScript. |
| Recommendation | Keep static profile facts, add a bounded `Use this profile` action with durable selected-profile handling and truthful pack recovery, and follow it with explicit `Start practice`/`Continue studying` actions. Show `Profile: <label> · version <n>` on study/setup routes and focused players, outside compact navigation. With JavaScript unavailable, retain profile facts plus explicit links and state that selection/local resume needs JavaScript; never silently choose a different profile. |
| Effort / change risk | L / high: selection persistence, pack compatibility, generator inputs, session derivation, and recovery tests must remain consistent. |

### `NAV-F04` — Make Practice a task start, not an inventory report

| Field | Value |
|---|---|
| Severity | 4/5 — high |
| Confidence | High for structure; human comprehension unknown |
| Evidence | `[E02]`, `[E08]`, `[E09]`, `[E10]`, `[A01]`, `[A04]`, `[A06]` |
| Observed state | Home gives Confirm profile, Learn tools, Practice retrieval, and Inspect hazards equal card treatment. Practice leads with “Choose a set the bank can actually supply,” exposes three set-length starts, then promotes a full answer-independent membership/capacity table containing 60 disabled “Unavailable” controls. Simulation and Print are secondary actions; Review has no static incoming link from Home, the global header, or Practice and appears only from JavaScript-rendered simulation results. |
| Impact | A valid no-JavaScript start path exists, but the implementation model and capacity diagnostics dominate the study-hub hierarchy, and one fixed route family lacks a normal static entry point. No task-popularity claim is made; Plan 005 task priorities remain explicitly unvalidated. |
| Positive retained | The 45/60/90 start links are real anchors and work without JavaScript. Unavailable filtered sets are disabled truthfully. Visual and keyboard-native hazard starts are equally present on the hazard landing. |
| Recommendation | Lead Practice with `Start question practice`, `Learn tools`, `Practice workplace hazards`, `Review saved misses`, `Build a longer practice set`, and `Print a study set`. Keep actual length/distribution and insufficient-inventory truth at the decision, but move the full filter-capacity matrix under a labeled `See set availability` disclosure or a supporting section after task starts. Replace “bank can supply,” “retrieval,” and answer-independent-membership language at decision points with the Plan 004 plain-task direction; retain exact technical detail in diagnostics/source support. |
| Effort / change risk | M / low-to-medium: mostly generator hierarchy/copy plus a static Review entry; content-bound disclaimers must remain intact. |

### `NAV-F05` — Add navigation-contract verification

| Field | Value |
|---|---|
| Severity | 3/5 — medium |
| Confidence | High |
| Evidence | `[E11]`, `[E07]` |
| Observed state | The browser suite checks question-player axe results, 320px page-level reflow, targets, forced colors, reduced motion, and print. It does not assert shell variants, compact disclosure, profile-context visibility, no-JavaScript route reachability, active utility links, or focused exits. Plan 005 independently records the same boundary. |
| Impact | The current hard-constraint mismatches can pass the maintained automated gate, and a later shell change can regress without a route-family assertion. |
| Positive retained | Existing 320px, semantic, focus, forced-color, reduced-motion, print, artifact, and answer-leak tests are strong patterns to extend. |
| Recommendation | Add a table-driven route-to-shell test plus browser cases at 320px and wide layout, JavaScript disabled, keyboard disclosure operation, active profile outside the menu, and focused-player exit/history. Assert that every fixed implemented route has one owning task group and that planned IDs are represented in the navigation registry without generating unreviewed pages. |
| Effort / change risk | M / low: deterministic tests; avoid screenshot-only assertions. |

## Navigation candidates

### `NAV-C1-DIRECT-DESTINATIONS`

| Surface | Structure |
|---|---|
| Wide header | Direct links: `Exam profile`, `Practice`, `Tool atlas`, `Hazards`, `Review`; `More` holds Simulations, Print, Sources/about, Offline, Settings. |
| Compact header | Brand + visible profile/version; native `Study menu` disclosure containing the same destination list and grouped utilities. |
| Home/Practice | Existing destination cards remain, reordered and augmented with Review. Capacity detail moves below starts. |
| Profile | Adds `Use this profile` and `Start practice`. |
| Player | Focused session shell with explicit Exit; no global destination list. |
| Distinguishing choice | Keeps destination nouns as the primary IA and minimizes hierarchy change. |

### `NAV-C2-TASK-FIRST-TWO-TIER`

| Surface | Structure |
|---|---|
| Wide header | Primary tasks: `Check my exam`, `Study`, `Review`; separate utility/trust cluster: `Offline & data`, `Sources & about`. Active profile/version is a persistent context row/link, not a menu item. |
| Compact header | Brand + visible profile/version + native `Study menu` disclosure. Disclosure sections are `Study`, `Help and sources`, and `Offline and data`; the summary never replaces the visible profile context. |
| Study hub | Ordered task starts: `Start question practice`, `Learn tools`, `Practice workplace hazards`, `Review saved misses`, `Build a longer practice set`, `Print a study set`; procedures and repairs occupy the same study catalog when implemented. |
| Profile | `Use this profile` is the primary action; successful durable selection exposes `Start practice` and pack recovery without hiding the static fact document. |
| Player | Focused shell: identity, visible profile/version, named session + position/status, and one `Exit to <owning hub>` or `Save and exit`; no acquisition/utility navigation. |
| Trust/utility | FAQ, transparency/source/correction/FOIL/security/privacy, report, status, scoring/actual-questions/about spokes, offline packs, and settings remain reachable but do not compete in the primary study tier. |
| Distinguishing choice | Organizes all destinations by learner task and separates study, trust, utility, and session navigation. |

### `NAV-C3-MANDATORY-PROFILE-GATE`

| Surface | Structure |
|---|---|
| Entry | Home immediately requires a durable exam-profile choice before any Study link is exposed. |
| Post-selection header | `Your exam`, `Study`, `Progress`; utilities in a disclosure; active profile/version always visible. |
| Study hub | Profile-specific starts only; changing profile returns to the gate. |
| Player | Focused shell with `Save and exit`. |
| Distinguishing choice | Treats profile selection as a mandatory gate rather than a recoverable context/action. |
| Hard failure | Fails `HC-02` and `HC-05`: a durable JavaScript-dependent choice would block the static/no-JavaScript study navigation and convert a recoverable missing-profile prerequisite into a navigation gate. |

## Candidate scores and deterministic selection

| Candidate | R1 | R2 | R3 | R4 | R5 | R6 | R7 | Total | Hard-constraint failures | Disposition |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|---|
| `NAV-C1-DIRECT-DESTINATIONS` | 4 | 3 | 3 | 4 | 5 | 3 | 4 | 26/35 | none | Viable fallback; retains too much peer-destination structure to resolve `NAV-F01` and `NAV-F04` fully |
| `NAV-C2-TASK-FIRST-TWO-TIER` | 5 | 5 | 5 | 5 | 5 | 5 | 4 | 34/35 | none | Selected |
| `NAV-C3-MANDATORY-PROFILE-GATE` | 4 | 4 | 5 | 1 | 5 | 4 | 3 | 26/35 | `HC-02`, `HC-05` | Eliminated before score comparison |

Selection algorithm:

1. Eliminate any candidate with a hard-constraint failure.
2. Select the highest total among remaining candidates.
3. If tied, compare `R5 focused players`, then `R4 compact/no-JS`, then `R3 profile continuity`, then lexical candidate ID.

Result: `NAV-C2-TASK-FIRST-TWO-TIER` is selected with 34/35. This is a deterministic contract-fit selection, not a human preference or usability finding.

## Canonical recommendation and implementation task

### `CODEX-ONLY-UIUX-V1-NAV-001`

Implement `NAV-C2-TASK-FIRST-TWO-TIER` without changing route IDs, canonical paths, indexability, static/island ownership, offline semantics, persistence/reveal state machines, or required trust/security meaning.

| Requirement | Done condition |
|---|---|
| Shell registry | Every implemented route ID maps explicitly to `acquisition`, `study`, `utility`, `focused-player`, or `focused-result/preview`; no mapping is inferred from URL text. Planned IDs remain represented without generating unreviewed pages. |
| Two-tier navigation | Wide and compact artifacts distinguish primary study tasks from trust and utility links. Settings/Offline receive the correct current state. |
| Compact behavior | At 320 CSS px the global links do not wrap into peer rows; a named native/progressive disclosure is keyboard operable with JavaScript disabled, and visible profile/version context remains outside it. |
| Profile entry | Exam selector/profile static facts remain intact. A bounded action can select a compatible profile durably, reports recovery truthfully, and exposes a next Practice action. Practice/session generation uses the selected profile or shows the existing recoverable prerequisite; it never chooses the first jurisdiction implicitly. |
| Practice starts | Practice leads with the six task starts defined in `NAV-C2`; Review has a normal static route entry. Full capacity diagnostics remain available after the starts, while actual length/distribution and insufficient inventory stay truthful. |
| Focused players | Question, hazard, review, and simulation player artifacts contain a named session landmark and one explicit Exit/Save-and-exit to the owning hub, and contain no acquisition/utility navigation. |
| No-JavaScript | Home, profiles, study/reference hubs, utility/trust pages, and player fallbacks keep truthful static navigation. No SPA router or script-only navigation is introduced. |
| Vocabulary | Use plain task labels provisionally. Preserve official candidate vocabulary (`examination`, `announcement`, `eligibility`, `qualifications`, `official score`, `eligible list`) and every required disclaimer. Do not claim that Plan 004 selected a direction. |
| Verification | Add deterministic generator/unit assertions and browser coverage for shell mapping, 320px compact disclosure, JavaScript-disabled link closure, keyboard/focus restoration, visible profile context, current links, focused exits, normal document navigation, and unchanged answer-leak/offline constraints. |

Suggested implementation order:

1. Add the explicit route-to-shell/task-group registry and characterize all current route IDs.
2. Split the shared generated header into acquisition/study/utility and focused variants.
3. Implement the native compact disclosure and persistent profile-context row.
4. Connect profile selection/recovery to practice-session derivation.
5. Recompose Home and Practice task starts and add a static Review entry.
6. Add route-family, compact, no-JavaScript, focus, history, and artifact assertions; run the existing full verification gate.

Verification commands from the immutable base:

```text
bun run typecheck
bun run typecheck:browser
bun run test
bun run site:build
bun run verify:artifacts
bun run test:browser:chromium
bun run verify
```

Stop conditions:

- Stop if profile selection cannot use the existing authoritative preference/storage boundary without creating a second durable truth.
- Stop if a compact solution hides active profile/version context or primary no-JavaScript links.
- Stop if a focused exit would alter the normative replace-history behavior rather than perform the required document navigation.
- Stop if copy simplification removes unofficial status, unknown facts, practice-only distribution/score limits, commit-before-reveal, sources, or the secure-material prohibition.

## Positives to preserve

| ID | Positive | Evidence |
|---|---|---|
| `NAV-P01` | Static navigation and canonical route ownership use ordinary links rather than a SPA router. | `[E01]`, `[E04]`, `[A01]` |
| `NAV-P02` | Skip links, named primary/breadcrumb landmarks, one main region, route headings, and current-page state are present on the core generated documents. | `[A01]`–`[A08]` |
| `NAV-P03` | Exam and profile documents remain substantive without JavaScript and expose compatibility, unknown-state, source, and unofficial-status content. | `[A02]`, `[A03]` |
| `NAV-P04` | Question starts and visual/nonvisual hazard starts are real no-JavaScript anchors; unavailable practice filters are disabled rather than silently substituted. | `[A04]`, `[A06]` |
| `NAV-P05` | Player fallbacks withhold answer-bearing feedback, truthfully state the JavaScript prerequisite, and retain previous/next document navigation. | `[A05]`, `[A07]` |
| `NAV-P06` | Existing automated tests cover semantic accessibility, 320px page-level reflow, minimum targets, forced colors, reduced motion, and print behavior. | `[E11]` |

## Consensus and dissent

### Evidence consensus

| ID | Consensus |
|---|---|
| `NAV-K01` | Generator source, generated artifacts, compact runtime measurements, and preserved Plan 005 agree that the current header is a flat seven-link shell that wraps on compact layouts. |
| `NAV-K02` | Maintained route/screen contracts, generated source, and player artifacts agree on a direct mismatch: focused players require explicit exit/isolation, but receive the full acquisition header and no explicit exit. |
| `NAV-K03` | Current Practice artifact and preserved Plan 004 desk evidence agree that internal/build vocabulary (“bank can supply,” answer-independent memberships, release-oriented terms) occupies learner decision surfaces. |
| `NAV-K04` | The fixed route inventory and current artifacts agree that route identity should be preserved while the discovery hierarchy changes. |

### Dissent, uncertainty, and non-claims

| ID | Unresolved point |
|---|---|
| `NAV-D01` | Plan 005 hypothesizes that profile fit belongs above practice, but explicitly labels that priority unvalidated. Plan 004 cites audience self-selection as relevant benchmark evidence, but selects no language direction. This review therefore makes profile and Study peers in the primary tier instead of asserting a popularity/order fact. |
| `NAV-D02` | Whether Review deserves a persistent global link or a first-class Study-hub action is not human-tested. The recommendation gives it a primary Study-hub action and a compact primary task entry without claiming frequency. |
| `NAV-D03` | Whether prominent provenance increases or decreases trust is unresolved in Plan 004. The recommendation preserves it and changes only layer/prominence. |
| `NAV-D04` | Candidate scores measure contract fit and inspectable structure. They do not measure comprehension, first-click success, trust, preference, task completion, or assistive-technology usability. |

## Limitations

- `NOT HUMAN-USABILITY-TESTED`: `humanEvidence=none`, `humanParticipantCount=0`, `notHumanUsabilityTested=true`, `evidenceMode=codex-only`.
- Plan 005 reports zero participants in every phase and no built, exposed, tested, or selected candidate. Its priorities and shell assignments are reusable inventory hypotheses, not popularity or validation evidence.
- Plan 004 reports no participant research and no selected vocabulary direction. Its desk classifications and benchmark observations support candidate copy/layering only.
- Headless Chromium inspection is exact runtime observation for these bytes and viewports; it is not support for other engines, devices, zoom factors, assistive technologies, or a version interval.
- No actual screen-reader session, keyboard-only human session, true 400% zoom session, mobile-device session, or offline pack mutation was conducted.
- The generated artifact hashes pin observed bytes but do not make the ignored `dist` files Git-authoritative. The immutable generator/document contracts remain the source authority.
- No task popularity, learner behavior, comprehension, trust, or preference is inferred.

## Evidence ledger

Git-blob SHA-256 values were computed over `git show <commit>:<path>` bytes. Artifact SHA-256 values were computed over the exact existing generated file bytes.

### Immutable source and preserved evidence

| ID | Coordinate and exact lines | SHA-256 | Supports |
|---|---|---|---|
| `E01` | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/scripts/generate-pages.tsx:152-213` | `239f102cc0cbc46053c4f4e5fd40e16e98e45c0cdff1d269771e28061dc569ba` | Shared seven-link header, footer, connectivity notice, and unconditional document-shell insertion |
| `E02` | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/scripts/generate-pages.tsx:460-560,886-930,935-1152,1325-1419` | `239f102cc0cbc46053c4f4e5fd40e16e98e45c0cdff1d269771e28061dc569ba` | Player shells, implicit jurisdiction capacity profile, Home, Review, profile, Practice, question/hazard generation |
| `E03` | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/styles.css:350-370,429-440,888-892` | `ec572566a43c02b356b67a56ff88126d50901ea18f76441ffb9f278cd39273a8` | Wrapping header/navigation and absence of a compact-header transformation |
| `E04` | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:product/ROUTES.md:16-44,77-99,110-135,154-164` | `9478211d12646c94688853787e652919adf4889bd7f2f920e4b37b0572eec227` | Fixed routes, static/no-JS ownership, parent navigation, shell ownership, focused exit contract |
| `E05` | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:product/DESIGN_SYSTEM.md:185-252,347-434` | `12532bbb78166ae4ffb684ea15f57d400761668e55f2845fec602e4ba9394039` | Responsive shell, native compact disclosure, visible profile context, player and simulation transformations |
| `E06` | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:product/SCREEN_STATES.md:223-245,247-283` | `54b7b18280cbc8a6ec3300c424ee412e4fcb9c4d4cb773ecd4af7adc63c22987` | Profile/practice/player recovery, focus, ordinary navigation, replace-history, explicit exit |
| `E07` | `9daddbfde073f1f73d806a68dac427b69efc8359:plans/005-rebuild-learner-task-navigation.md:89-103,175-209,211-293,1323-1373,1654-1680` | `cb0c0b0fe68ae6999dee2b8c8ec5ba2a7885d06e38e5e52c546558c38757d294` | Preserved problem statement, fixed constraints, current implementation audit, candidate requirements, decision limits |
| `E08` | `9daddbfde073f1f73d806a68dac427b69efc8359:research/ui-ux/navigation-task-hierarchy/route-task-inventory.json:1-112,223-335,337-473,476-500` | `db5536f5d376f7450e8b63590532db2ee8eea3c86ad972ab1aa353059cd587ff` | Fixed task/family map, no-JS purpose, proposed shell hypotheses, spokes |
| `E09` | `9daddbfde073f1f73d806a68dac427b69efc8359:research/ui-ux/navigation-task-hierarchy/research-summary.json:23-30,69-117` | `cab9477c50a892048599bee003e71936c3ac3c1106c42ee0f7edfe44196c88e7` | Zero participant counts, unvalidated task priorities, no selected candidate |
| `E10` | `fecc71c5ea240385b3d98f896b1152022a2bbbe8:research/ui-ux/consumer-language-study-2026-08-26.md:1-7,145-232,271-360,413-423` | `790679c137c798d45492ffbef98ac079934abb794b5c4add923781fc10913431` | No human study/decision, desk vocabulary findings, preserved meaning, benchmark boundaries, limitations |
| `E11` | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/browser-tests/accessibility-and-presentation.pw.ts:14-48,50-111` | `fde1dd0a9987c7e56fa28f43f1bc6b72a90de7126aa379b11623f944ed8320b3` | Existing accessibility, compact reflow, forced color, reduced motion, and print coverage boundary |

### Exact generated artifacts observed

| ID | Exact file and lines | SHA-256 | Supports |
|---|---|---|---|
| `A01` | `apps/site/dist/index.html:22-47` | `3ef58401915ed871f2c6a66a83df4540fb1b5f628979d416d2985b8040a47e36` | Flat global header and four equal Home starts |
| `A02` | `apps/site/dist/exams/index.html:22-43` | `1751a5dd283dcd9e0d09393779e11997ce5c45c822ac65ffdfda5fe2319936c9` | Profile list exposes view-only links |
| `A03` | `apps/site/dist/ny/nassau-county/custodian/index.html:22-46` | `dc6f851549c5f8d53b768075ce6a47491cf02a07e0a1d0be1dd6b96e94b00d29` | Profile context, source detail, and primary Atlas action rather than select/Practice |
| `A04` | `apps/site/dist/practice/index.html:22-45` | `d69a80fa5afd8b50dd0bfc12627641ef9d68b160cfdad91c1870e5244273f029` | Nassau-labelled 45/60/90 starts, capacity table, Simulation/Print actions, no Review link |
| `A05` | `apps/site/dist/practice/session/launch-v1/question/1/index.html:30-72` | `558b0929f5012a6bc6a6a23a6036b28ae01af467b8a7d3179c69cd2a567bb93c` | Full player header, fallback, breadcrumb/next, no explicit exit |
| `A06` | `apps/site/dist/hazards/index.html:22-43` | `d8b75961010fc87862ff5e8984729558449cfded7a202f6a1b0884c88a2d936c` | Equal visual and keyboard-native starts |
| `A07` | `apps/site/dist/hazards/session/launch-v1/scene/1/index.html:31-74` | `9d25c8fedd955cbbc86b15f96ef619776aa230fb55868c9e2e801525b7c4aa45` | Full hazard-player header, fallback, next, no explicit exit |
| `A08` | `apps/site/dist/simulations/session/sim-shell0000/question/1/index.html:31-54` | `76f6669c103dea2a78d825c2395a8a41b95629893d79e1bd5b72fa8eb77e9789` | Full simulation-player header and no explicit exit |
| `A09` | `apps/site/dist/settings/index.html:30-43` | `e7112130a87b1db9daeec1abd4876361be11f3225ff43cfcf6dac8e80d9558c4` | Settings in primary navigation without current-page state |
| `A10` | `apps/site/dist/styles.css:350-370,429-440,888-892` | `ec572566a43c02b356b67a56ff88126d50901ea18f76441ffb9f278cd39273a8` | Exact built wrapping behavior and compact rule set |
