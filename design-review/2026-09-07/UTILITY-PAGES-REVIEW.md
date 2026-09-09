# Utility page reconciliation

`capture-utility-pages.mjs` records first-visit Exams, Settings, and Offline at 1248/384 CSS pixels. These are current production-build captures with empty local storage, not the prototype's returning fixture counts. All six captures finish without page errors or document horizontal overflow. Settings and Offline compact captures were inspected against their current references.

The Settings mobile task cards had put actions beside the descriptions, squeezing labels into narrow columns. They now use the accepted stacked layout with full-width actions. Export uses the primary button treatment. Existing preference autosave, export/import, rebuild and delete actions remain intact.

Production build/artifact invariants and all three utility recovery tests pass: preference-record recovery, failed reload after import, and stale removal-preview invalidation.

Remaining: returning Settings summary and Offline placement; export/delete dialog visual comparison; installed/removal/unavailable Offline captures; open Exams record comparison; report layout; final cross-browser checks. This is an initial utility-family pass, not full reconciliation.

## Settings action grouping

Offline management now sits with Export, Import, Rebuild and Delete in the saved-work group, as the accepted reference shows. Its action is a native link, represented separately from command buttons in the task-card type. Desktop uses five columns; existing intermediate/compact breakpoints retain readable stacking. The obsolete standalone block above reading preferences is replaced by a no-JavaScript link to `/offline/`. No download size or stored-copy count is invented.

Build/artifact checks and five workspace typechecks pass. Eighteen design/recovery checks passed in the combined run; the no-JavaScript check then passed separately after correcting an accidental test-label edit (the final test is unchanged). Desktop/mobile captures are refreshed. Returning saved-data summaries are still outstanding.

## Delete preview cancellation

The deletion workflow now has the reference’s explicit Cancel action. It clears the preview and confirmation, closes the section, and returns keyboard focus to the originating button. It never invokes reset persistence. The enclosing disabled fieldset prevents cancellation during an active operation.

A new browser regression saves a preference, previews and confirms its deletion, cancels, reopens and confirms that a fresh preview requires fresh confirmation, then reloads to prove the preference survived. All four utility recovery tests, the production build and five workspace typechecks pass. `capture-settings-delete.mjs` records a real one-preference preview at 608/384 CSS pixels. The compact capture was visually inspected and the Cancel action remains visible.

This does not close returning-summary or export-preview requirements. The deletion section remains in flow rather than a modal, preserving the existing application’s focus/recovery structure.

## Export contents disclosure

The Export card now has a native expandable “What the file includes” note before its download button. Its categories follow the actual transfer payload: answers, finished reviews, preferences, simulations and print jobs. Downloads and import quarantine are excluded, and the review projection is rebuilt. The existing optional-drafts checkbox remains explicit. No upload, extra approval step, or new persistence is introduced.

The production build passes the unchanged closure budgets after keeping the note concise. `capture-settings-export.mjs` records the open disclosure at 608/384 CSS pixels. This provides contents guidance, not a live count preview; returning-record summaries remain outstanding.

## Real Offline states and removal treatment

`capture-offline-states.mjs` downloads, verifies and explicitly activates the actual released study pack in fresh browser contexts, then records active and removal-preview states at 1248/384 CSS pixels. No deletion is performed for the captures. The real pack is 106.0 MiB; the empty contexts have zero active session pins and historical attempts. These intentionally differ from the prototype's size/count fixtures. All four captures complete without page errors or document horizontal overflow.

Removal preview now uses the reference’s neutral surface, restrained heading, and red outlined removal button. Keep it, export, exact dependency impact and preserved-history copy remain visible. The compact removal capture was visually inspected. Build/artifact checks and the 23 local-data/pack/utility recovery browser checks pass, covering activation, real offline use, malformed metadata, imports, active-pack removal, pinned copies and stale previews.

Remaining Offline work includes storage-unavailable visual evidence and final comparison of the installed-state summary. The generic hero remains unchanged; this pass is not complete installed-state fidelity.

## Storage-unavailable recovery

Blocking IndexedDB open produces “Saved downloads could not be checked,” not the empty-copy state. The page hides download actions and retains Check again. It now also links directly to readable tool references and explains that saving practice responses requires working browser storage. This corrects the prototype’s overbroad claim that practice works whenever connected; durable commit-before-feedback remains required.

`capture-offline-unavailable.mjs` captures this state at 608/384 CSS pixels without page errors or horizontal overflow. The compact capture was visually inspected. A new browser regression verifies the nonempty-state wording, absence of download actions, and working Atlas navigation while storage is blocked. All five utility recovery tests and the production build/artifact checks pass. The error heading at page level remains focused by the existing recovery logic.

## Saved-work and installed-copy summaries

Settings now shows current counts for question answers, scene responses, finished
reviews, simulations and print jobs above the saved-work actions. It reuses the
existing read-only multi-store count transaction; it does not load answer payloads
or create a delete confirmation. Draft question/hazard sessions and simulation
submission records are not counted a second time as separate learner activities.
Preferences, correction drafts, import quarantine and downloaded files are outside
this activity summary. Export's existing contents disclosure still explains its
broader scope. No prototype record count or “saved since” date is invented.

The summary loads independently of preferences, refreshes after data actions and
on window focus/history restoration, and discards obsolete read results. A failed
read says counts are unavailable instead of replacing history with zeros. These
reads do not change saved records or affect the commit-before-feedback boundary.

Offline's prominent header now reflects the reconciled active copy and displays
its version, actual question/scene/tool inventory, downloaded file bytes across
saved copies, and estimated remaining browser quota when available. A staged copy
is not described as turned on. Failed storage reads omit count/availability claims.
Downloaded bytes are labelled as files, not total browser disk consumption; quota
is labelled as an estimate. The existing generated header remains available with
JavaScript disabled. The React island owns the dynamic header through a portal
into that same section, keeping the shared page layout intact.

`capture-utility-summaries.mjs` records ten captures at 1248/384 CSS widths: empty
and returning Settings, and empty/staged/active Offline. It creates a real saved
answer and installs/activates a real verified pack. The separate
`capture-utility-summary-unavailable.mjs` records four blocked-storage captures.
Both manifests have no page errors. Desktop header facts form four columns; mobile
facts stack and the Settings summary wraps without document overflow. Real pack
size, browser quota and full released pack name differ from the prototype fixtures.

Validation: root build/artifact checks pass (526 routes, 220 item-scoped artifacts,
291 delivery assets), as do all five workspace typechecks and browser typechecking.
All 21 utility recovery checks pass across Chromium, Firefox and WebKit, including
two new summary tests for a real answer followed by scoped deletion, and a failed
count read with preferences still available. The broader local-data/pack/rebuild
run passed 44 checks and retained 12 existing browser exclusions; four Chromium
checks initially stopped on ambiguous pack-name text selectors after names appeared
in the header too. Those selectors now explicitly target the pack-list heading.
All four subsequently pass, including actual staged-pack verification and offline
study. The final targeted run also passed all six summary checks (10 passes total,
eight existing browser exclusions); no new skips were introduced.

Settings' final measured JavaScript closure is 485973 bytes raw, 146199 gzip,
122766 brotli, compared with 484994/145997/122667 before this work. The read-only
summary and its refresh/unknown states need a small Settings-only allowance of
486500/146500/123500. Other families retain the existing 485000/146000/123000 limits;
Offline remains well below them. This is a bounded feature allowance, not removal
of the artifact budget gate.

## Exams header and compact announcement cards

Reconciled the header with references 09/10: it now says “Exam announcements,
and what each one says,” explains that reading preserves practice/saved work,
and uses the prototype's responsive heading size and compact padding. Compact
summary statistics are omitted as in the reference; desktop retains real counts.
Announcement entries precede the statewide study plan, preserving their stable
record IDs and source facts.

Compact records now have an inset coverage summary and a direct See what practice
covers action, rather than only terse record-selection links. The existing link
to each record's facts remains available, while the new action goes directly to
`/practice/#covers` and focuses the rendered coverage section. Coverage copy
comes from the maintained compatible subject-plan facts; no exam is selected or
stored. Status labels remain “Announcement on file” and “Study reference” rather
than inferring a current filing state from the passage of time.

`exams-overview-audit/` contains six current hero/registry/card crops at 1248/384
CSS widths. Inspected the compact hero and three-card list against reference 10.
`exam-record-screenshots/` was refreshed for all three records × two tabs × both
widths after ordering changed; its manifest records the actual record IDs. Every
record/tab remained readable, focusable, and free of horizontal overflow; reading
the records did not change localStorage. Six Exams reflow/axe/search/tab/navigation
checks pass across Chromium, Firefox, and WebKit, including the new compact
coverage action and destination focus. Root build/artifact verification passes.

Remaining differences: cycle-summary composition and disclosure density, desktop
status filters, and compact record labels/status details need further source-aware
reconciliation. Maintained announcement prose is preserved; the prototype's fixed
filing-status fixture is not a live availability claim. The final complete Exams
page comparison is still open.

## Exams cycle order and source disclosure

Exams now places the administration uncertainty notice before date rows on
compact screens and after them on desktop, matching references 09/10. Both
positions render the same authored notice; CSS exposes only the applicable
position, preserving visible reading order without JavaScript or duplicate IDs.
Compact notices/date cards use the reference's smaller text and padding. All
source evidence and review dates remain in a native disclosure, reducing repeated
source prose in the overview. The qualification about possible later notices
remains visible. Home and other announcement renderers are unchanged.

`exams-overview-audit/` now also includes cycle captures with the source disclosure
closed and open. Inspected the compact cycle: one notice, all date facts, the
visible uncertainty qualification, and a readable source disclosure. Root build
and artifact checks pass, all 17 static-generation tests pass, and nine Exams
checks pass across Chromium/Firefox/WebKit. The new check verifies one visible
notice, responsive order, source access, and reflow with JavaScript disabled.

Status-filter audit: current identities have no filing-status field. Their
verified filing-period facts store prose plus review/effective dates;
`effectiveThrough` is null even where the prose gives a closing date. Do not use
that null as an open-ended filing window or infer current filing availability.
Implement explicit source-backed filing metadata/classification before adding
the proposed status filters. Separate announcement date rows are currently
retained, including the two equal announced exam dates; consolidation and the
complete overview comparison remain open.

## Source-bound filing filters

Exams now offers All, Open for filing, Filing closed, and Plan only filters.
They combine with text search, restore the filing filter from the URL, and clear
a selected detail when its record is filtered out. No study preference is written.
Without JavaScript all announcement facts remain readable and controls stay hidden.
The empty result hides the choose-an-entry prompt because there is nothing to choose.

`content/authoring/announcement-filing-status.json` is an editorial classification
ledger bound to the released announcement facts. Both Nassau records are classified
closed **at their August 25, 2026 source review**, based on the authored filing facts:
the open-competitive period ended July 1; the promotion fact records the later-added
Jericho jurisdiction deadline of July 5. This is not a new live availability check.
The page explicitly qualifies the labels and prints each classification review date.
The statewide plan has no filing status. Missing classifications remain unverified.

The generator rejects stale or duplicate bindings, nonverified/nonfiling facts,
wrong exam applicability, and review-date or digest mismatch. The SHA-256 input is
JSON of the ordered array: fact ID, category, state, value, review date, sorted exam
numbers, sorted source-line IDs. The digest detects drift; it does not itself prove
the editorial classification. This separate display metadata leaves saved question
and simulation receipts unchanged.

Validation: production build/artifact checks, site and browser typechecks, 22 unit
tests, and 12 Chromium/Firefox/WebKit checks passed. `capture-exams-overview.mjs`
now records 16 desktop/compact crops, including closed, plan-only, and empty-open
filter states. Compact closed cards and desktop empty results were visually inspected;
that inspection found and corrected the redundant empty-result selection prompt.
Full-page comparison and source-aware duplicate exam-date consolidation remain.

## Consolidated, source-bound timeline and full-page audit

The Exams timeline now follows the accepted Landing prototype's four desktop
milestones: June 11 opening, July 1 open-competitive closing, July 5 Jericho-only
promotion deadline, and one August 22 announced date. Compact layout shows the
three date rows, retains “Jericho only” and “not confirmed held,” and places the
review caveat in the compact notice. The desktop date stays warning-colored.
All original announcement facts and source links remain available.

`content/authoring/announcement-timeline.json` contains explicit presentation
entries. Dates were read from the released filing/date facts, not inferred from
null effective-through fields or guessed by prose parsing. Each entry is bound to
SHA-256 of ordered fact ID, category, label, state, value, detail, review date,
sorted exam numbers, and sorted source-line IDs. The generator rejects missing,
ambiguous, changed, or unrepresented date/administration facts and invalid dates.
The digest detects source drift; this implementation review supplies the editorial
interpretation. No live filing or administration status is newly asserted.

At 1248px the four timeline cards match the reference's order and hierarchy. At
384px the three single-line date rows now use 14px normal-weight labels with
monospaced dates. Capturing this layout exposed a no-JavaScript source-disclosure
scroll target behind the fixed bottom navigation. Compact root scroll padding
now reserves that occupied area; the no-JavaScript test passes in all three
browsers without forced clicks. The source disclosure remains available.

`exams-overview-audit/` now includes full first-visit and record-open pages at
1248/384 in addition to the timeline, source disclosure, cards, and filter states.
The cycle crops and full-page captures were visually compared with references
09/10 and the editable Landing prototype. The capture waits for fonts and two
paint frames. The fixed bottom bar's position in a full-page bitmap represents
the initial viewport, not a bar embedded in the document flow.

Remaining full-page differences are explicit: desktop search and filters still
stack rather than share one row; the record panel repeats per-fact technical
source disclosures, substantially increasing its height; compact first-visit
shows an additional choose-an-entry prompt. These remain implementation work.
Real counts, restrained administration claims, exact jurisdiction restrictions,
source accessibility, and genuine practice destinations remain intentional
content differences from prototype fixtures. The timeline change is complete;
the entire Exams family is not yet declared visually complete.

Validation for timeline/filing generation: 25 unit tests, site/browser typechecks,
and full build/artifact verification pass. The focused no-JavaScript scroll test
passes across Chromium, Firefox, and WebKit after the scroll-padding correction.
The complete shared-navigation/design-handoff browser suite passes after the
shared scroll-padding change: 54 checks across all three browsers.

## Exams record-source consolidation — September 9

Desktop search and filing controls now share one row; compact controls stack.
The empty choose-an-entry prompt is suppressed only at compact widths. Record
facts no longer repeat technical disclosures. One Sources for this record
disclosure follows both tab panels, retaining each applicable fact's label,
review date, source excerpt, locator, and conflict-source links. The statewide
plan retains its full subject-plan support. Exam/profile metadata remains in
that disclosure. Reading records still does not select a study exam.

Refreshed all 12 record/tab captures and the 20-state overview capture set.
Visually inspected the first desktop record panel and full desktop record-open
and compact first-visit pages against references 09/10 at 1248/384 CSS widths.
The desktop full page is now 3065px tall (reference 2907px); compact first visit
is 3505px (reference 2255px). These are observations, not fidelity certification.
The three preceding layout issues are resolved. Further work remains: compact
search/status/count copy and footer make the page longer than the reference,
and its “How the real test works” section is absent. Review those differences
against the maintained facts before adding any official-format assertions.
Real jurisdiction restrictions and unconfirmed administration remain intact.

Validation: full build/artifact verification passes (939 routes, 222 published
item artifacts, 291 byte-identical assets); site and browser typechecks pass;
25 generation/filing/timeline unit tests pass; all 60 design-handoff browser
checks pass across Chromium, Firefox, and WebKit. New checks verify desktop
control alignment, compact prompt suppression, expanded-source reflow, and
nonzero exact fact-source row counts plus every referenced excerpt/locator
without JavaScript. Capture scripts reported no page errors.
