# Remaining component-contract work

Initial source inspection at `6bc18eae05949b531ac13afbab03127bb67b4179`, against `product/COMPONENT_ARCHITECTURE.md` sections 2–3 and 6–12. This is an incomplete-work ledger, not acceptance from passing tests. Completed corrections and their evidence are recorded below; the table reflects those subsequent updates.

The handoff supersedes stale selected-profile/global exam selection and scheduled/due-review requirements in the architecture tables. Do not restore those features. Existing real simulation resume/progress remains required.

| Area | Direct current-source evidence | Work still required |
| --- | --- | --- |
| Settings | Controller/provider now owns preferences, export/import, deletion and rebuild workflows | Controller/provider correction completed below. Full per-family acceptance remains separate. |
| Offline | Controller/provider now owns reconciliation, download, activation, storage recovery and removal workflows | Controller/provider correction and targeted verification recorded below. Full per-family acceptance remains separate. |
| Report | `corrections/react/correction-form.tsx` executes draft/submit runtime operations | Controller/provider boundary for validation, draft recovery and submission. Keep intake dormant and explicit submit semantics. |
| Review | Provider, explicit queue pieces and controller focus requests implemented | Inspected component correction completed below. Full per-family acceptance remains separate. |
| Study hub | `study/react/study-hub.tsx` directly subscribes to Review and projects activity in its view | Domain context/provider for local projections and recovery, with responsive scratch isolated from durable state. |
| Print | `print/react/builder.tsx` and `preview.tsx` directly subscribe, acknowledge and invoke controllers | Provider boundaries and explicit pieces; preserve existing deterministic generation, restore/retry and system-print behavior. |
| Practice/Hazard builders | `practice/react/builder.tsx` and `hazard-builder.tsx` own setup state and assemble/navigate from submit handlers | Renderer-neutral setup controllers and explicit route composition; retain effective lengths, seeds and mode-specific identity. |
| Hazard workflow pieces | `hazard-player/react/player.tsx` exports Practice wrappers only; Simulation hazard input is conditional inside `simulation/react/hazard-item.tsx` | Reconcile required Review/Simulation named variants and review context, plus explicit marker/zone/source/navigation pieces. Do not claim named wrappers exist based on functional modality support. |
| Architecture enforcement | `scripts/check-module-boundaries.ts` checks import direction/private database access/global IndexedDB, but not the React composition conventions in section 11 | Add targeted analysis for prohibited UI APIs and leaf capability imports, with meaningful failure fixtures. Current boundary success does not prove these absent. |

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
