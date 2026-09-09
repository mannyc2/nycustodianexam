# Remaining component-contract work

Initial source inspection at `6bc18eae05949b531ac13afbab03127bb67b4179`, against `product/COMPONENT_ARCHITECTURE.md` sections 2–3 and 6–12. This is an incomplete-work ledger, not acceptance from passing tests. Completed corrections and their evidence are recorded below; the table reflects those subsequent updates.

The handoff supersedes stale selected-profile/global exam selection and scheduled/due-review requirements in the architecture tables. Do not restore those features. Existing real simulation resume/progress remains required.

| Area | Direct current-source evidence | Work still required |
| --- | --- | --- |
| Settings | Controller/provider now owns preferences, export/import, deletion and rebuild workflows | Controller/provider correction completed below. Full per-family acceptance remains separate. |
| Offline | Controller/provider now owns reconciliation, download, activation, storage recovery and removal workflows | Controller/provider correction and targeted verification recorded below. Full per-family acceptance remains separate. |
| Report | Controller/provider now owns draft recovery, validation, explicit submission and receipt recovery | Controller/provider correction completed below. Intake stays dormant; full per-family acceptance remains separate. |
| Review | Provider, explicit queue pieces, queue focus requests and combined screen/history controller implemented | Inspected component correction completed below. Full per-family acceptance remains separate. |
| Study hub | Controller/provider now owns activity reads, Review subscription, projections and focus; explicit sections compose the route | Inspected controller/provider, section and builder composition corrections completed below. Full per-family acceptance remains separate. |
| Print | Builder/preview providers and explicit pieces now adapt their renderer-neutral controllers | Inspected provider/composition correction and controller lifecycle guards recorded below. Revision-specific PDF inspection is recorded separately; full product/state and physical-print acceptance remain separate. |
| Practice/Hazard builders | Separate setup controllers/providers adapt named PracticeSessionSetup and HazardSessionSetup compositions with explicit controls, preview and actions | Inspected controller/provider and setup-piece corrections recorded below. Full per-family acceptance remains open. |
| Hazard workflow pieces | Practice, saved Review and Simulation have named visual/nonvisual variants; Review context uses exact restored response data | Shared neutral zone/marker/viewport/image pieces, claim-linked sources and root-owned navigation are implemented below. Historical source composition, full per-variant acceptance and deeper lifecycle proof remain separate. |
| Architecture enforcement | AST gates cover React APIs/render props, lexical map-index keys, known leaf-capability imports, wildcard/UI-index barrels and named workflow-mode props; 46 detector fixtures | Preserve documented detector limits; inspect indirect aliases, arbitrarily named cross-family aggregation and remaining provider lifecycle requirements. |

Question workflow/control/feedback/body corrections and Simulation setup/player/results provider boundaries are recorded in QUESTION-COMPOSITION-AUDIT.md. They do not close the rows above.

For each row, verify existing real behavior before refactoring, preserve semantic DOM where possible, then run appropriate controller tests, typechecks, build/closure budgets and browser recovery/focus workflows. Finish the separate per-family state/visual acceptance and lifecycle checks before claiming the whole contract complete. Static reference families and shared Fact/SourceCitation contracts still need their own source-to-requirement mapping; this table covers inspected interactive gaps only.


## Review provider correction

`review/react/provider.tsx` now owns the controller subscription, filtered queue/history projection, actions and focus coordination. `ReviewQueueView` consumes state/actions/meta and no longer imports the controller. Per-item confirm/cancel scratch remains local; the same item IDs and semantic DOM are retained. Overlapping All/Missed/Flagged membership, unavailable-history inclusion and acknowledgment focus are unchanged.

Validation: 17 Review projection/rebuild/custom-source unit tests, site/browser typechecks, maintained layout (292 files), module boundaries (152 modules), build/artifact/bundle checks passed. All nine Review queue and Settings rebuild browser cases passed across Chromium, Firefox and WebKit (8.7 seconds), including confirmed acknowledgment, failure recovery and idempotent rebuild. Logs: `/tmp/nyc-review-provider-build.log` and `/tmp/nyc-review-provider-browser.log`.

This closes the Review subscription/dispatch boundary portion of its row. Explicit queue compound decomposition and tokenized controller-owned view requests still require reconciliation; the current provider preserves the existing focus behavior rather than claiming that broader requirement complete.


## Review compound pieces

The queue route now composes `ReviewHeader`, `ReviewItems` (with `ReviewScopeFilters`), `ReviewHistory`, `ReviewGuidance` and `ReviewStatus`. Each reads the provider contract; the route no longer hides the whole screen in one combined render. Existing DOM, item keys, confirmation controls, source/history links and focus refs remain in place.

Validation: 17 targeted Review tests, site/browser typechecks, production build and artifact/bundle checks passed. All nine Review queue/Settings rebuild browser cases passed across Chromium, Firefox and WebKit (8.5 seconds), including focus after finishing one of multiple items and retention of unavailable finished history. Logs: `/tmp/nyc-review-pieces-build.log` and `/tmp/nyc-review-pieces-browser.log`. Review's explicit-piece extraction is complete; controller-tokenized focus and full per-family acceptance remain separate requirements.

## Review controller focus requests

Review now publishes tokenized focus requests through the shared ScreenStore. The provider consumes and acknowledges those requests; local scope-filter focus remains presentation state. A successful Finish review requests focus only after the durable acknowledgment and queue rebuild finish. Errors request the error heading, and the final available item now moves focus to the unavailable-records heading when quarantined records remain. Disposed controllers reject new commands and cannot start another persistence operation.

Validation: 21 targeted unit tests (including four controller lifecycle/request cases), site and browser typechecks, layout (293 files), module boundaries (152 modules), production build and artifact/bundle checks passed. The build produced 1,352 route documents, 224 item-scoped artifacts, 291 delivery assets and 59 safe shell URLs. All 27 Review queue, Settings rebuild and Study hub browser cases passed across Chromium, Firefox and WebKit (18.3 seconds). The first run passed the 24 existing cases but failed the three new cases during fixture setup because its database version was stale; the corrected fixture uses the current database version for existing initialized storage while preserving the older-version migration fixture. Logs: `/tmp/nyc-review-focus-build.log`, `/tmp/nyc-review-focus-browser.log`, `/tmp/nyc-review-focus-browser-recheck.log`.

This closes the inspected Review provider, explicit-piece and controller-focus requirements. It does not close the remaining families or substitute these targeted results for full visual acceptance or an integrated verification rerun.

## Settings controller and provider

Settings preferences, saved-work refresh, export/import, scoped deletion and Review rebuilding now run through `settings/controller.ts`. The controller owns its ScreenStore, command locks, current confirmation/preview, file-read generations, saved-work refresh generations and tokenized focus requests. `SettingsProvider` owns the React subscription and focus delivery; `SettingsForm` reads state/actions/meta and no longer imports runtime or persistence capabilities. The bootstrap injects display-preference application and file-download capabilities, attaches focus/pageshow refresh listeners and disposes those listeners, controller and root on non-persisted pagehide. The existing application runtime remains shared.

Commands cannot start while another operation is busy or after controller disposal. Changing deletion scope or cancelling invalidates confirmation. File reads retain newest-selection-wins behavior. Preferences still apply only after the authoritative save, and a failed write reloads saved choices. Import still uses the validated/sealed preview and preserves the distinct saved-import/failed-preference-reload recovery state. Background count refresh preserves an outstanding focus request. Existing labels, semantic structure and confirmation controls are retained; this is not a new visual-fidelity claim.

Validation: 18 targeted unit tests passed (14 existing transfer/preference/Review-rebuild tests and four new controller tests covering command locking, confirmation invalidation, out-of-order file reads and disposal). Site typecheck, maintained layout (296 files), module boundaries (154 modules), production build and artifact/bundle checks passed. Settings closure: 481,594 bytes raw / 145,560 gzip / 122,103 brotli, within its budget. Build: 1,352 canonical documents, 224 item-scoped artifacts, 291 delivery assets, 59 safe shell URLs.

Browser evidence: 45 selected preference, import/export, delete, saved-work, Review-rebuild and historical/custom transfer cases passed across Chromium, Firefox and WebKit (41.4 seconds). An additional three-engine check of changed parent records between import preview and apply passed (3.0 seconds). Logs: `/tmp/nyc-settings-controller-build.log`, `/tmp/nyc-settings-controller-browser.log`, `/tmp/nyc-settings-controller-drift-browser.log`. These are 48 targeted passes, not a new complete browser sweep or production certification. This closes the inspected Settings workflow/controller/provider row; other families and full per-family acceptance remain open.

## Offline controller and provider

Offline reconciliation, staging, activation, removal preview/confirmation and storage-persistence requests now run through `offline-packs/controller.ts`. The renderer-neutral controller owns command locks, snapshots and focus requests; `OfflineProvider` owns the React subscription, derived presentation state and element refs. The bootstrap injects service-worker registration, connectivity, storage APIs and page reload. The view retains the existing header portal and semantic controls, and no longer imports Effect, manager capabilities or browser workflow globals. The underlying manager still rechecks exact claims, active-session pins and historical removal impact.

Initial load reconciles records and reads storage estimates; it does not stage or activate a pack. Download/activation commands serialize and stop before starting manager work if disposal occurs while registration is pending. Removal uses the selected stored claim, requires the separate preview/confirmation, blocks a pinned preview and clears prior confirmation before a replacement preview. Storage-persistence requests cannot overlap another action. Late storage estimates retain a newer persistence result, and late initial reads preserve outstanding error-focus requests.

Validation: 35 Offline model/manager/controller unit tests passed, including five new lifecycle/concurrency/focus tests. Site typecheck, maintained layout (298 files), module boundaries (156 modules), production build and artifact/bundle checks passed. Offline closure: 395,580 bytes raw / 121,501 gzip / 103,793 brotli, within budget. Build: 1,352 canonical documents, 224 item-scoped artifacts, 291 delivery assets. Build log: `/tmp/nyc-offline-controller-final-build.log`.

Final Offline browser evidence: 21 targeted cases passed and 12 were explicitly skipped (53.6 seconds), covering reconciliation, already-offline no-work behavior, removal of an unpinned active copy, retirement, quota/storage estimates, both session-pin/removal race orderings, failed replacement previews and unreadable-storage recovery. The staged-pack case rehashed before activation and served Atlas/custom drills offline. Six Cache API/service-worker inspection cases remain Chromium-only and account for the Firefox/WebKit skips; this is not 33 passes or complete cross-engine cache certification. Log: `/tmp/nyc-offline-controller-final-browser.log`. The earlier run also passed 21 with 12 skips before the final focus-race correction. The final build contains 59 safe shell URLs. This closes the inspected Offline controller/provider correction; full visual/device acceptance and other component families remain open.

## Report controller and provider

Report draft recovery, validation, explicit status checks, local saves, submission, receipt-save retry and confirmed local deletion now run through `corrections/controller.ts`. `CorrectionProvider` owns the React subscription and tokenized focus requests. The bootstrap supplies UUID/time, confirmation and the existing intake client; the view no longer owns runtime calls or network globals. Initial load performs only local draft recovery, and commands cannot edit or resubmit while a save/submission is pending. Disposal during the required pre-submit save prevents the subsequent submission call. Intake deployment/configuration is unchanged and remains dormant.

Receipt state now distinguishes none, saving, saved and unsaved. Remote acceptance displays a focused saving state until receipt persistence finishes; it never claims a local receipt is saved merely because the report was accepted. Failed receipt persistence offers a local-only retry. A failed deletion of an accepted receipt now shows and focuses a local-action error within the receipt view, explicitly preserving the submitted report. Successful deletion and Start another report focus the form fields.

Validation: 15 controller/client unit tests passed, including six new command/lifecycle/durable-order cases. Site/browser typechecks, maintained layout (301 files), module boundaries (158 modules), production build and artifact/bundle checks passed. Report closure: 322,694 bytes raw / 102,110 gzip / 87,886 brotli, within budget. All nine targeted Report browser cases passed across Chromium, Firefox and WebKit (8.6 seconds), including dormant no-POST behavior, draft persistence before sending, pending receipt save focus, receipt-only retry, and failed accepted-receipt deletion followed by successful deletion. Browser intake responses were mocked; this is not external delivery evidence. Logs: `/tmp/nyc-correction-controller-final-build.log`, `/tmp/nyc-correction-controller-browser.log`.

This closes the inspected Report workflow/controller/provider correction. Remaining families and full visual/device acceptance remain open.

## Study controller, provider and explicit sections

The Study bootstrap now constructs a renderer-neutral controller instead of retaining activity state and repeatedly rendering the root. The controller owns activity read revisions, the Review subscription, start/disposal and recovery focus requests. `StudyProvider` subscribes once, combines unavailable Review records with activity history and owns compact-layout and initial fragment-focus behavior. Its returning-activity state explicitly guarantees readable activity when `hasActivity` is true, without converting unavailable storage into zero saved answers.

The route composes `StudyHeader`, `StudyWays`, `StudyProgress`, `StudyReview`, `StudyCoverage`, `StudyHistory` and `StudyPracticeBuilder`. Existing first-visit/returning reading order, shared-bank copy, real counts and embedded Practice controls remain. A Review recovery request focuses the Review section; when activity itself is unreadable, the primary activity-error heading takes priority. No global selected exam or scheduled reviews were added.

Validation: 24 targeted Study/Review/projection/custom-source unit tests passed, including four new Study lifecycle/focus tests. Site typecheck, maintained layout (304 files), module boundaries (160 modules), production build and artifact/bundle checks passed. Study closure: 462,892 bytes raw / 140,648 gzip / 118,328 brotli, within budget. Build: 1,352 route documents, 224 item-scoped artifacts, 291 delivery assets, 59 safe shell URLs.

All 36 Study hub, Practice builder and Review queue browser cases passed across Chromium, Firefox and WebKit (1.1 minutes). They cover responsive reading order, compact coverage anchors, unavailable activity, history filtering, custom-set controls/offline documents and durable Review round trips. Logs: `/tmp/nyc-study-controller-build.log`, `/tmp/nyc-study-controller-browser.log`. This closes the inspected Study controller/provider and section-composition correction, not full per-family visual acceptance. Practice builder workflow separation and Print remain open.

## Print providers, explicit pieces and lifecycle guards

`PrintBuilderProvider` now owns the subscription, configuration draft/projections and view-request delivery; its composed view exposes product, count/layout, output and generate controls. `PrintPreviewProvider` owns the subscription, inspection confirmation, focus/announcement delivery and print-media technical-detail expansion/restoration. Preview header, status, packet and actions are explicit components. Existing packet markup, print CSS, saved manifests and deterministic generation remain unchanged; no new PDF visual-acceptance claim is made.

Print controllers now reject commands after disposal and suppress late navigation or dialog opening. Regeneration checks disposal before creating a replacement after inventory loading. A `requesting-print` state retains the readable preview and disables duplicate print/regeneration commands while the durable request record is saving. Only a successful save advances to `system-print-requested` and opens the dialog. The screen-state contract now records this pending state; opening the dialog still does not claim a completed print.

Validation: all 46 Print unit tests passed, including four new lifecycle/pending-dialog cases and existing static rendering/packet integrity tests. Site/browser typechecks, maintained layout (307 files), module boundaries (162 modules), production build and artifact/bundle checks passed. Print center: 454,885 bytes raw / 137,654 gzip / 116,402 brotli; preview: 472,506 / 140,466 / 118,257. Both remain within budget. Output: 1,352 route documents, 224 item-scoped artifacts, 291 delivery assets, 59 safe shell URLs.

All 36 Print browser cases passed across Chromium, Firefox and WebKit (1.5 minutes). The pending-dialog check holds the actual IndexedDB transaction open and proves the preview remains visible, duplicate controls are disabled and the dialog has not opened before release. Other cases cover restored facts/source receipts, distinct product types, regeneration/history behavior, paired sections, retained images, missing-download recovery and nonvisual packets. Logs: `/tmp/nyc-print-providers-build.log`, `/tmp/nyc-print-providers-browser.log`.

The shared held-write fixture's Settings autosave and Report receipt-save callers also passed all six targeted cases across the three engines (6.4 seconds). Log: `/tmp/nyc-print-shared-fixture-browser.log`. These results close the inspected Print provider/composition and pending-command corrections; they do not constitute a new complete browser sweep or PDF visual acceptance.

## Practice and Hazard setup controllers

Practice question and Hazard drill setup state, inventory/count projections, seed validation, assembly and navigation commands now run through separate renderer-neutral controllers. Their providers adapt ScreenStore subscriptions and failure-focus requests. The Study and Hazard bootstrap roots inject navigation and dispose their controllers with the island; the form views no longer assemble sets or call browser navigation directly.

Practice preserves the requested length when category capacity shrinks and requires an explicit replacement. A still-fitting length remains selected when capacity increases. Hazard navigation uses the selected visual/nonvisual mode and existing deterministic assembler. Both controllers reject invalid counts or seeds, ignore commands after disposal and prevent repeated Start commands after successful navigation begins. Assembly/navigation errors preserve choices and request focus on the form's error. This does not add saved question-practice sessions or change durable answer persistence.

Validation: 22 targeted custom-source, question-set, Hazard-set and deterministic-set tests passed, including three new controller cases covering explicit length replacement, duplicate/disposed commands, exact nonvisual navigation and invalid Hazard closure recovery. Site typecheck, maintained layout (311 files), module boundaries (166 modules), build and artifact/bundle checks passed. Output: 1,352 route documents, 224 item-scoped artifacts, 291 delivery assets and 59 safe shell URLs. Study closure: 464,030 bytes raw / 140,660 gzip / 118,829 brotli; Hazard index: 313,617 / 99,718 / 85,883. Build log: `/tmp/nyc-practice-builder-controller-build.log`.

This checkpoint separates workflow/controller/provider ownership. Explicit smaller setup pieces and full per-family visual acceptance remain open.

Browser evidence: all 36 Study hub, Practice builder and Hazard builder cases passed across Chromium, Firefox and WebKit (2.0 minutes), including both Hazard modes, cached drill reopening offline, exact saved feedback/Review behavior, setup navigation, unavailable activity and responsive Study reading order. Log: `/tmp/nyc-practice-builder-controller-browser.log`. These targeted checks are not a complete browser sweep or a new visual comparison.


## Explicit Practice and Hazard setup pieces

`PracticeSessionSetup` now composes scope, content controls, length controls, deterministic preview, repeat-code controls and Start/recovery actions. `HazardSessionSetup` composes scope, scene-count controls, response-mode controls, preview, repeat-code controls and Start/recovery actions. Each piece reads its domain provider's state/actions/meta contract; neither route configures a shared form through workflow booleans. Existing semantic elements, IDs, labels, selection logic and DOM order are retained. Study and Hazard bootstrap consumers now use the named route compositions.

Validation: site typecheck, maintained layout (311 files), module boundaries (166 modules), production build and artifact/bundle checks passed. Build output: 1,352 route documents, 224 item-scoped artifacts, 291 delivery assets, 59 safe shell URLs. Study closure: 464,445 bytes raw / 140,742 gzip / 118,930 brotli; Hazard index: 313,993 / 99,793 / 86,010. All 15 targeted Practice/Hazard builder browser cases passed across Chromium, Firefox and WebKit (15.8 seconds), covering both Hazard modes, exact saved feedback/Review, explicit length selection, invalid set recovery and setup links. Offline cases were excluded from this composition-only rerun; their preceding controller-checkpoint evidence retains its own scope. Logs: `/tmp/nyc-setup-pieces-build.log`, `/tmp/nyc-setup-pieces-browser.log`.

This closes the inspected setup-piece correction, not full per-family visual acceptance or the remaining Hazard workflow variants.

## Explicit Hazard Simulation variants

`SimulationHazardRoute` selects `VisualHazardSimulation` or `NonvisualHazardSimulation` from the item's mode. Each named variant composes a neutral header, its own input body and shared response controls. The visual body owns zoom/pan/pointer scratch and composes an explicit marker list; the nonvisual body composes ordered selectable zones. Zero-response confirmation, flagging and save status remain shared. Both use the existing Simulation provider's semantic commands and omit correctness, rationale and source feedback before final submission. Existing labels, IDs, DOM order, keyboard movement and missing-image recovery are retained.

Validation: all 42 Simulation controller/generation unit tests passed. Site typecheck, maintained layout (311 files), module boundaries (166 modules), production build and artifact/bundle checks passed after correcting an optional marker-array access found by the typecheck. Output: 1,352 route documents, 224 item-scoped artifacts, 291 delivery assets and 59 safe shell URLs. Simulation player closure: 457,221 bytes raw / 137,202 gzip / 116,106 brotli. Build log: `/tmp/nyc-hazard-simulation-variants-build.log`.

This closes the inspected named Simulation variant/input-piece gap. Hazard Review variants, their exact saved-reason context, remaining shared family pieces and full visual acceptance remain open. Practice and Simulation still use distinct provider contracts; this change does not claim their neutral input implementations have been consolidated.

Browser evidence: all six targeted visual/nonvisual Hazard Simulation cases passed across Chromium, Firefox and WebKit (15.2 seconds), covering editable inputs, restoration, final feedback and retained self-contained results. Log: `/tmp/nyc-hazard-simulation-variants-browser.log`. This is targeted functional evidence, not a complete browser sweep or new visual acceptance.

## Hazard saved-review variants and context

Hazard links from the Review queue and saved Hazard activity now add `review=1` while retaining the existing release/version path, set, position and fragment. The bootstrap selects `VisualHazardReview` or `NonvisualHazardReview`. Both wait for the existing controller's exact saved-response restoration before showing feedback. A missing response presents recovery without a new answer form. Saved-review mode removes the Practice scene navigator and offers Review/activity return links instead.

The visual context derives missed hazards, marks on safe details and unmatched marks from the restored markers and verified payload. It does not trust reason text in the URL. Written-zone context explicitly remains unscored and separate from picture marking; this adds no nonvisual scored Review queue entries. Reading does not acknowledge or finish a queued review. Existing explicit Finish review confirmation remains in the queue. No persistence identity, assessment or commit-before-feedback behavior changed.

Validation: 48 targeted Hazard state, closure, commit/reveal, drill and Review-projection unit tests passed, including path preservation and idempotent Review intent. Site/browser typechecks, maintained layout (313 files), module boundaries (168 modules), production build and artifact/bundle checks passed. The first browser pass completed all 30 selected Hazard builder, Review queue and Study hub cases across Chromium, Firefox and WebKit (25.3 seconds). New assertions exercise absent-response recovery, saved visual/nonvisual review through history, Review queue entry, and absence of save controls. Logs: `/tmp/nyc-hazard-review-browser.log`, `/tmp/nyc-hazard-review-final-build.log`.

This closes the inspected named Hazard Review variants and saved-response context gap. Remaining family source/navigation composition, neutral-input reuse and full per-family visual/offline acceptance remain separate; these browser checks exclude the offline case.

Final navigation correction: all six visual/nonvisual Hazard browser cases passed again across the three engines (11.8 seconds), including the new no-Practice-navigator assertion on a missing saved response. Log: `/tmp/nyc-hazard-review-final-browser.log`. Final build: 1,352 routes, 224 item-scoped artifacts, 291 delivery assets and 59 safe shell URLs; Hazard player closure 467,419 bytes raw / 140,111 gzip / 118,433 brotli, within budget. The two browser runs retain their separate source scopes; they are not a new full sweep.

## Hazard Review offline cache correction

The saved-review browser extension exposed a service-worker gap: the document cache normalizer accepted only the custom set/position pair, so adding `review=1` made a cached Hazard document unavailable offline. The first six-case run passed two Firefox cases and failed both modes in Chromium and WebKit (2.1 minutes). That Firefox result did not prove network-independent cache behavior.

The normalizer now accepts exactly one `review=1` parameter only on current or historical Hazard scene navigation, either alone or with the existing set/position pair. It continues to reject extra/repeated parameters, partial pairs, other review values, question review parameters, non-navigation requests and foreign origins. Normalization selects the same HTML cache entry while retaining the requested URL for exact saved-response validation in the player.

All 14 service-worker unit tests passed, including expanded cache identity cases. Site/browser typechecks and production build/artifact/bundle checks passed. Build output remains 1,352 routes, 224 item-scoped artifacts, 291 delivery assets and 59 safe shell URLs. The offline browser fixture now disconnects its server in every engine, adding browser offline emulation where supported, so a successful navigation cannot rely on a network fetch. Both visual and written-zone cases save while disconnected, reopen Review with reordered query parameters and check exact feedback, absence of save controls/navigation, and the visual image when applicable.

Final result: all six offline visual/nonvisual cases passed across Chromium, Firefox and WebKit with the fixture server disconnected (1.6 minutes). Logs: `/tmp/nyc-hazard-review-offline-browser.log` (initial failing run), `/tmp/nyc-hazard-review-offline-final-browser.log` (corrected six-pass run), `/tmp/nyc-hazard-review-offline-build.log`. This closes the observed saved-Hazard-Review document-cache gap; it is not complete device/offline certification or new visual acceptance.


## React API and render-prop enforcement

`check:boundaries` now also runs `scripts/check-react-conventions.ts`. The TypeScript AST scanner rejects React `forwardRef` and `useContext` named imports (including aliases), imported namespace/default property or literal-element access, namespace destructuring, named React re-exports, and product `renderX` JSX attributes/property signatures/object properties. It distinguishes source syntax from comments, display text and unrelated object methods. It parses `.ts` and `.tsx` with their corresponding syntax modes.

Twelve detector fixtures run with the gate, including nine prohibited examples and three accepted examples. The final gate passed on 151 site source files alongside the existing 168-module boundary check. A strict standalone TypeScript check of the new script passed; maintained layout passed for 314 files; `git diff --check` passed. No application bundle or rendering source changed, so this tooling checkpoint did not rerun browser/visual acceptance or claim a new integrated build.

This is focused enforcement of the inspected API/render-prop rules, not comprehensive React data-flow analysis. Prohibited boolean modes, index-based keys, broad UI barrels and leaf capability imports remain open. Existing `reviewsOnly` history mode and index-based keys identified during inspection must be reconciled before claiming those rules are enforced.

## Authored observation identity and direct index-key enforcement

Question nonvisual observations, Simulation result observations and Print preview observations now use the same content-based render identity. The helper retains each string exactly and pairs it with its occurrence among identical strings; this handles repeated prose without tying distinct observations to their array positions. These are ephemeral React keys, not new content or persistence IDs. No published authored bytes or saved records changed.

The AST gate now rejects a JSX key that directly uses the second parameter of its enclosing `.map` callback, including a renamed parameter or function-expression callback. Stable item IDs and first-parameter content keys remain accepted. Composite keys containing an index and more complex data-flow aliases remain outside this focused detector and are still open work.

Validation: 73 targeted observation, Print generation and Simulation generation tests passed, including two new tests for reordering, unrelated insertion, duplicate observations and delimiter-safe key identity. Site typecheck and strict standalone checker typecheck passed. Boundary checks passed for 169 modules plus 152 scanned source files and 16 detector fixtures. Maintained layout passed for 316 files. Production build/artifact/bundle checks passed: 1,352 route documents, 224 item-scoped artifacts, 291 delivery assets and 59 safe shell URLs; all island budgets remain within limits. Log: `/tmp/nyc-observation-identity-build.log`. No new browser or visual/PDF acceptance is claimed for this key-only rendering change.

## Composite index keys and canonical Review reasons

The repeated-content render helper now lives in `content-keys.ts` because question prose, printed scene statements and region polygons use the same rule. Callers supply explicit content identity: observation text; zone/condition; zone/role/statement; or polygon coordinates. Identical entries receive occurrence discriminators within their content identity. Target/decoy and owning-region IDs remain part of keys for flattened polygon lists. These render keys do not change authored content, geometry, order or persistence identity.

Review reason IDs were extracted unchanged from the projection into the pure `review/reason-id.ts` owner. The projection still exports its existing API and deduplicates reasons by those IDs; the React queue imports only the pure function and now uses those same IDs as keys.

The AST detector now follows identifier references within JSX key expressions, rejecting map/flatMap index parameters used in template strings and calls as well as direct keys. It distinguishes a property named `index` from the callback's index variable. Nineteen detector fixtures passed across 153 site sources; the existing boundary check passed for 170 modules. This is lexical reference analysis, not whole-program alias/data-flow analysis.

Validation: 82 targeted content-key, Print generation, Review projection and Hazard commit/reveal tests passed. Site and standalone checker typechecks, maintained layout, production build and artifact/bundle checks passed; `git diff --check` passed. Build log: `/tmp/nyc-composite-key-build.log`. The earlier `question-observations.ts` helper/test names are superseded by `content-keys.ts` and `content-keys.test.ts`.

All 15 targeted Review queue and saved Hazard builder browser cases passed across Chromium, Firefox and WebKit (16.5 seconds), including Review focus retention and visual/nonvisual saved feedback. Log: `/tmp/nyc-composite-key-browser.log`. This does not refresh Print PDF visual evidence or constitute a complete browser sweep. Boolean-mode, broad-barrel and leaf-capability enforcement remain open.

## Leaf capability import enforcement

The React convention gate now classifies `.tsx` views outside the maintained bootstrap/provider filename patterns as leaves. It rejects value and side-effect imports from the known runtime, controller, manager, persistence, database and verified-content module owners, plus Effect workflow/runtime construction imports. Literal dynamic capability imports and capability re-exports are checked too. Type-only imports/re-exports remain allowed, as do normal context-consumer imports and pure domain helpers. Bootstrap/provider adapters retain their distinct ownership role.

Fourteen additional detector cases cover persistence/runtime/database/verified-content imports, dynamic imports, re-exports, Effect aliases, type-only syntax and legitimate adapters/helpers. The complete 33-fixture gate passed on 153 source files alongside the 170-module boundary check. Strict standalone checker typecheck, maintained layout (317 files) and `git diff --check` passed. No application source changed in this tooling checkpoint, so no new browser/build or visual acceptance is claimed.

This enforces direct imports from known capability owners. It is not a whole-program transitive effect analysis, and it does not classify arbitrary renamed helper modules or runtime-computed dynamic import paths. Provider lifecycle/runtime-construction rules still require their own inspection. Boolean-mode and broad-barrel enforcement remain open.

## Wildcard and UI-index barrel enforcement

The convention gate now rejects wildcard runtime re-exports, including namespace wildcard exports, and value re-exports from `ui/index.ts(x)` or `react/index.ts(x)`. Explicit compound-family objects, narrow named re-exports and type-only exports remain allowed. Inspection found only the existing narrow Print identity and Review reason re-exports in current source; no UI index module required migration.

Eight additional fixtures distinguish prohibited wildcard/UI-index exports from type-only exports and explicit family APIs. The full 41-fixture gate passed across 153 site sources, together with the 170-module boundary check, maintained layout (317 files), strict checker typecheck and `git diff --check`. Application source did not change; no new browser/build or visual acceptance is claimed.

This guards the concrete wildcard and UI-index barrel forms. It does not infer whether an arbitrarily named module with selective imports/exports has become a cross-family aggregation layer. That broader ownership question remains a source-review requirement. The `reviewsOnly` history boolean mode still needs explicit composition and enforcement.

## Explicit Activity and Review history

`ActivityHistory` and `ReviewHistory` are now separate compositions; the public `reviewsOnly` workflow switch is removed. Activity owns kind filtering, empty-filter focus and unavailable-attempt presentation. Review selects finished-review rows and uses its own empty-state guidance. Shared record rendering and read-state recovery retain the existing dates, month grouping, expansion control, feedback links, stable IDs and recovery copy. The Review queue's existing section piece imports the saved-review composition under an alias to keep the two ownership roles clear.

The convention gate rejects the named workflow/modality props `isPractice`, `isReview`, `isSimulation`, `isVisual`, `isNonvisual`, `isHazard` and `reviewsOnly` in JSX, interfaces and object properties. Five new fixtures verify those failures while permitting ordinary state flags such as disabled/expanded. This is a known-name regression guard, not semantic detection of every possible boolean workflow switch.

Validation: 22 Study/Review controller and projection tests passed. Site and strict checker typechecks, maintained layout (317 files), the 170-module boundary check and the 46-fixture convention scan over 153 sources passed. Production build and artifact/bundle checks passed. Log: `/tmp/nyc-history-variants-build.log`. No new visual comparison or PDF acceptance is claimed by this composition change.

All 24 Study hub and Review queue browser cases passed across Chromium, Firefox and WebKit (16.6 seconds), including filtering/expansion, empty-result keyboard focus, unavailable saved data, finished-review history and responsive reading order. Log: `/tmp/nyc-history-variants-browser.log`. The inspected history-mode correction is complete; full per-family visual acceptance and the documented analysis limits remain open.


## Review screen history ownership

The Review bootstrap still retained activity-read state and repeatedly rendered the React root. Its queue subscription also reread history when a successful focus request was merely acknowledged. `review/screen-controller.ts` now owns the combined queue/history snapshot, history read generations, retry, start and disposal. The provider subscribes once to that screen controller; the bootstrap mounts once. Initial queue completion does not duplicate the concurrent initial history read. Subsequent completed rebuilds refresh history, while focus-only snapshot changes do not. Queue focus requests survive history completion because they retain their original queue snapshot identity and acknowledgment path.

Four new controller tests cover successful-focus acknowledgment without rereading history, initial/rebuild and stale read ordering, unavailable history with retained recovery focus, and ignored late results/commands after disposal. All 22 targeted Review controller/projection tests passed. Site typecheck, 171-module boundary check, 154-source/46-fixture convention check, maintained layout (319 files), production build and artifact/bundle checks passed. All 24 Review queue and Study hub browser cases passed across Chromium, Firefox and WebKit (16.9 seconds), including durable finished history and keyboard focus. The first browser execution request timed out in automatic execution review before starting; its permitted single retry ran successfully. Logs: `/tmp/nyc-review-screen-build.log`, `/tmp/nyc-review-screen-browser.log`.

This closes the inspected Review bootstrap history-orchestration gap; it does not prove every island's mount/unmount/remount behavior or add new visual acceptance.


## Shared screen-store disposal

Disposed screen stores now ignore new subscriptions and late focus/announcement acknowledgments, in addition to publications and initialization. This preserves the final snapshot identity when an already queued provider effect runs after disposal. Two regression tests cover subscription removal/resubscription and late operations after repeated disposal.

Validation: all 383 site tests across 47 files passed, and the site TypeScript check passed. The production build log records successful generation and artifact verification for 1,352 documents, 224 item-scoped artifacts, 291 delivery assets and 60 safe shell URLs. Logs: `/tmp/nyc-screen-disposal-site-tests.log`, `/tmp/nyc-screen-disposal-build.log`. This proves the shared store behavior; every island's actual mount/unmount/remount lifecycle still requires runtime evidence. No new visual acceptance is claimed.

## Practice, Review and Offline page lifecycle observations

`island-lifecycle.pw.ts` exercises the built application at source `4d3652e`: after each island reaches its loaded empty state, synthetic persisted pagehide retains the rendered root; nonpersisted pagehide clears it; repeated cleanup and a subsequent focus event produce no page errors; reloading the document mounts one owner with the expected loaded state again. All nine cases passed across Chromium, Firefox and WebKit (5.7 seconds). Browser TypeScript and diff whitespace checks passed. The initial run had six passes and three Review fixture failures because its expected heading described unavailable records rather than the actual new-user empty state; correcting the fixture yielded the final pass. Logs: `/tmp/nyc-island-lifecycle-browser.log`, `/tmp/nyc-island-lifecycle-final-browser.log`.

These are controlled pagehide branch and fresh-document remount observations, not actual BFCache restoration, same-document remount, comprehensive listener/subscription instrumentation, or all-island lifecycle certification. Those remaining proof requirements stay open.

## Settings refresh-listener cleanup

The lifecycle suite now instruments window listener registration/removal by callback identity. Settings has one callback paired across focus and pageshow: persisted pagehide retains it; repeated nonpersisted pagehide removes each registration exactly once and empties the React owner; later focus/pageshow produce no page errors; a fresh document reload installs one pair and enables the loaded preference control. All 12 lifecycle cases passed across Chromium, Firefox and WebKit (6.7 seconds), with browser TypeScript passing. Source application remains `4d3652e`; these changes add tests only.

The first instrumented run incorrectly counted a separate pageshow callback among the Settings pair, producing three assertion failures with nine existing passes. The final fixture records only identities registered for both refresh events. Logs: `/tmp/nyc-settings-lifecycle-browser.log`, `/tmp/nyc-settings-lifecycle-final-browser.log`. This is direct evidence for the paired Settings refresh listeners, not all application listeners, actual BFCache restoration, or same-document remount.

## Shared neutral Hazard zone inputs

Practice/Review's HazardZoneNavigator and Simulation's zone navigator now compose `NeutralZoneInputs`, a capability-free ordered checkbox list that accepts only neutral zone observations, selected orders, input name and toggle command. Workflow owners retain their fieldsets, instructions, status references, edit locks and save/reveal policy. This removes duplicated input markup without introducing workflow-mode flags or feeding correctness data to the neutral renderer. Visual viewport/marker reuse and source/navigation composition remain open.

Site TypeScript passed; module boundaries passed for 172 modules and conventions for 155 sources with 46 fixtures. Production build/artifact/bundle checks passed (1,352 documents, 224 item-scoped artifacts, 291 delivery assets). All 12 selected browser cases passed across Chromium, Firefox and WebKit (28.4 seconds): keyboard nonvisual Hazard commitment, nonvisual Hazard Simulation restoration/results, custom question plus visual/written Hazard export/import into saved Review, and nonvisual question Simulation restoration. Logs: `/tmp/nyc-neutral-zones-build.log`, `/tmp/nyc-neutral-zones-browser.log`. Markup and workflow copy are retained; no new visual acceptance or full-suite rerun is claimed.

## Shared visual marker movement controls

Practice and Simulation now compose the same capability-free `MarkerMoves` buttons with one 0.025 movement step, directional labels and remove action. Callers pass marker identity, display number, edit lock and semantic commands. Practice still omits these buttons for saved responses; assessment and feedback remain outside this neutral input piece. Visual viewport reuse and source/navigation composition remain open.

Site TypeScript passed; boundaries passed for 173 modules and conventions for 156 sources with 46 fixtures. Production build and artifact/bundle checks passed. Nine targeted browser cases passed across Chromium, Firefox and WebKit (15.9 seconds), covering durable visual markers and exact restoration, saved coordinate/feedback cards, and visual Hazard Simulation restoration/results after pack removal. Logs: `/tmp/nyc-marker-moves-build.log`, `/tmp/nyc-marker-moves-browser.log`. Existing button markup and labels are retained; no new visual acceptance or all-island lifecycle proof is claimed.

## Shared Hazard viewport interaction

Practice/Review and Simulation now use `useSceneViewport` and `SceneViewportControls` for the same local zoom state, 1–2.5 bounds, quarter-step zoom, directional pan distances, reset scroll position, button states and live view percentage. Each owner supplies its existing viewport ID and retains its image, annotation, pointer commitment and unavailable-state composition. The shared controls have no persistence or answer-bearing inputs. Image-layer rendering and source/navigation composition remain separate work.

Site TypeScript, 174-module boundaries and 157-source conventions with 46 fixtures passed. Production build and artifact/bundle checks passed. Nine targeted browser cases passed across Chromium, Firefox and WebKit (14.1 seconds), covering keyboard/phone pan and reset, durable visual markers and restoration, and visual Simulation restoration/results after pack removal. Logs: `/tmp/nyc-viewport-controls-build.log`, `/tmp/nyc-viewport-controls-browser.log`. This is functional verification of shared viewport interaction, not new visual or all-island lifecycle acceptance.

## Shared neutral scene rendering

Practice and Simulation now compose `NeutralSceneImage` for the released neutral image and numbered user markers. Its inputs are image URL, neutral description, and marker IDs/coordinates; it accepts no assessment or postcommit payload. Practice still switches explicitly to `AnnotatedHazardScene` after reveal. Both owners retain their exact-image availability handling, pointer interaction and edit locks. Together with the shared zone, movement and viewport pieces, this removes the inspected duplicated neutral rendering/control implementations; source/navigation composition and per-state visual acceptance remain open.

Site TypeScript, boundaries for 175 modules and conventions for 158 sources with 46 fixtures passed. Production build/artifact/bundle checks passed. All 18 selected browser cases passed across Chromium, Firefox and WebKit (19 seconds), covering unavailable released images, pan/reset, durable visual markers/restoration, saved feedback cards, and visual Simulation restoration/results after pack removal. Logs: `/tmp/nyc-neutral-scene-build.log`, `/tmp/nyc-neutral-scene-browser.log`. This is functional regression evidence, not a new screenshot comparison or full lifecycle certification.

## Named Hazard claim-source composition

`HazardClaimSources` and `HazardSourceLineReceipt` now own the exact claim-linked receipt disclosure previously embedded in scene facts. Current Practice/Review and Simulation explanations compose that source component through their existing scene facts. Publisher, title, verified date, evidence label, excerpt, URL, scope, version and exact locators remain beside the supported claim with existing missing-receipt recovery. Historical source format remains in its historical explanation branch. This does not add sources to precommit inputs. Navigation still spans generated HTML and custom-set bootstrap behavior and remains open.

Site TypeScript, 176-module boundaries and 159-source conventions with 46 fixtures passed. Build/artifact/bundle checks passed. Nine browser cases passed across Chromium, Firefox and WebKit (17.8 seconds): durable visual Hazard feedback (including opening source receipts and reading-order checks), visual Simulation restoration/results, and nonvisual zoned Simulation restoration/results. Logs: `/tmp/nyc-hazard-sources-build.log`, `/tmp/nyc-hazard-sources-browser.log`. Receipt markup is retained; no new visual acceptance is claimed.

## Hazard navigation composition

`HazardNavigation` now renders canonical/custom previous/next links through a portal owned by the existing player root into the generated navigation landmark. Bootstrap reads canonical fallback hrefs, replaces them with exact assembled custom drill coordinates when needed, and passes the appropriate end label. The old custom-drill element construction loop is removed. Generated no-JavaScript navigation remains available; invalid drills and saved Review continue removing the practice navigation landmark. Root unmount owns portal cleanup, while the existing document gesture handler retains replace-history behavior.

Site TypeScript, 177-module boundaries and 160-source conventions with 46 fixtures passed. Production build/artifact/bundle checks passed. All 15 Hazard builder and custom-set transfer browser cases passed across Chromium, Firefox and WebKit (2 minutes), covering visual/written drill order, saved history, fresh-browser import, and offline drill/Review reopening with reordered parameters. Logs: `/tmp/nyc-hazard-navigation-build.log`, `/tmp/nyc-hazard-navigation-browser.log`. This closes the inspected custom navigation rendering gap; it is not all-island lifecycle certification or new visual acceptance. Canonical fallback serialization remains in generated HTML.

## Hazard portal and navigation cleanup observations

The browser lifecycle suite now covers visual and nonvisual canonical Hazard routes at application source `c32bed9`. Instrumentation records document click listener identities: persisted pagehide retains counts and enabled controls; repeated nonpersisted pagehide removes exactly one registered click listener, empties both the player owner and external navigation portal, and produces no page errors. Fresh-document reload restores enabled controls, the next-scene link and the initial listener count. The observer tracks document click registrations/removals, not arbitrary listeners or retained heap objects.

All 18 lifecycle cases passed across Chromium, Firefox and WebKit (10.1 seconds), including the existing Practice, Review, Offline and Settings cases. Browser TypeScript and diff whitespace checks passed. Log: `/tmp/nyc-hazard-lifecycle-browser.log`. This adds direct portal cleanup evidence; synthetic pagehide is not actual BFCache restoration, same-document remount or complete subscription/heap certification.

## Simulation setup and correction-form lifecycle

Added browser observations for the Simulation seed and correction summary: local edits survive synthetic persisted pagehide/pageshow and remain editable; repeated nonpersisted pagehide empties the island; fresh-document reload mounts editable controls without page errors. No correction submission or simulation creation is performed. All 24 lifecycle cases passed across three engines (10.5 seconds). Browser TypeScript and diff whitespace checks passed. Initial run had 21 passes and three Simulation fixture timeouts because the seed disclosure was closed; the corrected fixture opens it before editing and after reload. Logs: `/tmp/nyc-setup-lifecycle-browser.log`, `/tmp/nyc-setup-lifecycle-final-browser.log`. Application source is unchanged from `c32bed9`; actual BFCache, same-document remount, complete listener accounting and other island families remain separate requirements.

## Print and Hazard builder lifecycle

The local-edit lifecycle matrix now includes Print's set code and Hazard builder's drill code. Both preserve editable local values across synthetic persisted pagehide/pageshow, empty their roots after repeated nonpersisted pagehide and mount editable controls after document reload. All 30 lifecycle cases passed across Chromium, Firefox and WebKit (12.8 seconds), with browser TypeScript and whitespace checks passing. Initial run had 27 passes and three Print fixture failures because its label includes help text; the locator now scopes to the Print owner and matches that accessible label. Logs: `/tmp/nyc-builder-lifecycle-browser.log`, `/tmp/nyc-builder-lifecycle-final-browser.log`. This tests builders only: Print preview, question/review players and active Simulation/results lifecycle evidence still needs separate coverage. Actual BFCache and same-document remount remain outside these synthetic observations.

## Question and Review-linked explanation lifecycle

The question lifecycle case selects an answer, preserves selection across synthetic persisted pagehide, flags and durably saves it, then verifies repeated nonpersisted pagehide empties the player and reload restores feedback without Save answer. It follows Read explanation from the Review queue and repeats persisted retention and cleanup/reload checks on that actual saved-answer destination. This proves the exercised queue link and canonical saved question; it does not certify every historical/custom or explicit Review route variant.

All 33 lifecycle cases passed across Chromium, Firefox and WebKit (14.7 seconds). Browser TypeScript passed. Log: `/tmp/nyc-question-lifecycle-browser.log`. No new application source, visual acceptance, actual BFCache certification or complete listener accounting is claimed. Print preview and active Simulation/results still need their own lifecycle coverage.

## Saved Print preview lifecycle

A generated blank answer-sheet packet now exercises the Print preview root: synthetic persisted pagehide retains the visible packet and fingerprint; repeated nonpersisted pagehide empties the root; subsequent beforeprint/afterprint events produce no page errors; reload restores the same saved packet URL and fingerprint. This covers the common preview lifecycle using a blank-sheet product, not every print product, actual printing or direct print-listener identity accounting.

All 36 lifecycle cases passed across Chromium, Firefox and WebKit (16.1 seconds), with browser TypeScript and diff whitespace checks passing. Log: `/tmp/nyc-preview-lifecycle-browser.log`. Active Simulation/results lifecycle and broader visual acceptance remain open.

## Active Simulation and results lifecycle

A question Simulation created through setup now exercises active-player and results roots. After a selection is durably saved, synthetic persisted pagehide retains it; repeated nonpersisted pagehide empties the root; reload restores the same session URL and selected answer. The test submits final answers through the UI, observes results, retains them across persisted pagehide, cleans up repeatedly, and restores the same results URL and item count on reload. No page errors occurred.

All three engine cases passed (5.6 seconds); browser TypeScript and whitespace checks passed. Log: `/tmp/nyc-simulation-lifecycle-browser.log`. Combined with the separately passing 36-case island lifecycle suite, each inspected bootstrap family now has a controlled lifecycle observation, but these are not one combined run or full per-variant certification. This Simulation case covers question mode; direct listener/timer accounting, actual BFCache and same-document remount remain separate gaps. Results assertions verify restoration/count, not a new full correctness audit.

## Timed Simulation interval cleanup

Browser instrumentation now tracks IDs of one-second window intervals during a timed question Simulation. One interval is present with the visible timer, persists across synthetic persisted pagehide, is removed after repeated nonpersisted pagehide/root cleanup, and is recreated once after reload. All three engines passed (3.7 seconds). The browser TypeScript check initially exposed mixed Node/Bun/DOM timer overloads; the fixture now explicitly types the actual browser timer capability and typecheck passes. Log: `/tmp/nyc-simulation-interval-browser.log`. This is direct timer-registration cleanup evidence for the exercised timed Simulation, not arbitrary scheduler/heap accounting or actual BFCache certification.

## Print preview listener accounting

The saved preview lifecycle case now instruments callback identities for beforeprint, afterprint and the print MediaQueryList change listener. The ready preview has one of each, root cleanup leaves zero of each, and fresh-document restoration installs one of each again. All three engine cases passed (2.8 seconds), with browser TypeScript and whitespace checks passing. Log: `/tmp/nyc-print-listeners-browser.log`. This strengthens the earlier late-event observation with direct registration accounting for these three event types; it is not universal heap/listener or same-document remount proof.


## Remaining-work reconciliation after ed1369f

Current inspection confirms the Hazard neutral pieces and source/navigation corrections recorded below; the opening table no longer lists those as unimplemented. Controlled lifecycle evidence now covers the inspected bootstrap families, with direct accounting added for Settings refresh listeners, Hazard document navigation, timed Simulation intervals and Print print/media events. This does not close same-document remount, all subscriptions/observers, actual BFCache or every workflow variant.

The next static-family gap is concrete: `product/COMPONENT_ARCHITECTURE.md` requires Fact.Root/Label/Value/Status/Source/VerifiedAt/ProfileVersion and six named state compositions. `apps/site/scripts/generate-pages.tsx` currently implements `factStateLabel` and `renderProfileFact` as one string renderer (around line 448), with inline branches for direct/conflicting evidence, effective dates and replacement references. It retains each conflicting candidate and its source IDs, but named Fact pieces/variants are absent. `sourceLineLinks`, `sourceProofLine` and `externalSourceLink` provide existing evidence presentation to map before introducing a shared SourceCitation contract. Preserve static semantic HTML, exact six-state data, escaping, source relationships and the removed global-selection decision during that work. Existing passing generation tests do not prove the missing composition requirement.

## Static profile Fact composition

`apps/site/scripts/profile-fact.tsx` now supplies static React Fact.Root/Label/Value/Status/Source/VerifiedAt/ProfileVersion pieces and named VerifiedFact, NotPublishedFact, UnverifiedFact, ConflictingFact, SupersededFact and NotApplicableFact compositions. `renderProfileFact` adapts its existing arguments to that renderer via server static markup; no browser island is added. All retained conflicting candidates and their source lines remain visible, missing sources still fail generation, and reviewed/effective/version/replacement metadata remains in the original semantic positions. Existing string escaping is replaced by React text escaping within this renderer. The broader SourceCitation contract and other static families remain open; these state wrappers are not a new schema-level discriminator guarantee.

All 17 static generation tests passed, including six fact states, conflict evidence and superseded intervals. Site TypeScript, boundaries/conventions, production build and artifact/bundle checks passed. Six exam-cycle and filing-filter browser cases passed across three engines (7.5 seconds), including no-JavaScript reading/source order. Logs: `/tmp/nyc-fact-generation-tests.log`, `/tmp/nyc-fact-composition-build.log`, `/tmp/nyc-fact-composition-browser.log`. The convention scanner currently covers runtime src, not this scripts module. No new visual comparison is claimed.

## Static Fact escaping and missing-evidence regression

The six-state generation test now also supplies HTML-like markup in fact labels/values, conflicting candidates, source titles, excerpts and locators. Assertions verify escaped output rather than injected image markup, including label/conflict/locator positions. Missing source-line and missing source-record maps must still throw their explicit generation errors. All 17 generation tests and site TypeScript passed; log `/tmp/nyc-fact-escaping-tests.log`. This verifies the renderer boundary changed by static React composition; it does not add new visual acceptance or source truth claims.

Validation correction: the first escaping-fixture typecheck failed because its new sourceLineIds array was inferred as string[] rather than the schema's nonempty tuple. The preceding entry was committed before that result was inspected. Adding `as const` to that fixture's source IDs resolves the mismatch; the subsequent site TypeScript command exited 0. Runtime generation tests had already passed. No application source changed.
