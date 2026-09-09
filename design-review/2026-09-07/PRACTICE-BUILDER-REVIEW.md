# Custom question-practice builder

September 9 implementation slice, following `911104e`.

The Practice hub now offers an effective question-set builder. It derives four
categories from released pre-answer metadata, supports 45/60/90 presets and all
matching, retains a chosen count when the pool expands, and requires explicit
replacement when the pool is too small. Repeat codes reproduce a set within the
same release. Answers already saved for that exact set remain saved.

Generated canonical question documents carry safe inventory metadata. Query
links identify the custom set and position; the player regenerates the order,
checks the exact document and receipt, and uses the existing durable
commit-before-feedback controller. Invalid links show an unavailable state
without an answer form. Previous/Next preserve custom coordinates. Review and
saved activity resolve custom receipts against compiled inventory; old static
set receipts and routes remain valid. No resumable practice-session feature or
new persistence store was introduced.

## Evidence and limits

- 28 focused unit tests: set identity, receipt closure, custom source resolution,
  existing Review projection and Settings rebuild.
- Seven Chromium tests passed across custom builder, Study and Review; the new
  flow covers category/length changes, save, navigation, restored feedback and
  exact Review links. The final identity guard also has a direct unit test.
- Build/artifact checks and workspace typechecks are recorded in the task.
- `practice-builder-screenshots/manifest.json`: default, unavailable length and
  all-matching at 1053 and 384 CSS viewport widths. Element captures hide only
  the fixed navigation to prevent overlay artifacts; separate viewport captures
  retain navigation. Zero page errors during capture.
- Compared with reference 22 and its native-control correction. Added the shared
  scope note, descriptive ruled subject rows and bordered repeat controls after
  inspection. The real inventory has 30/37/5/18 questions, requiring a fourth
  mixed/scenario category rather than the prototype's fixture counts.

This is an integrated question builder, not completion of the complete setup
family. Shared setup-mode navigation now links Practice, Hazard drill and Simulation with real destinations and current-page semantics. Hazard drill controls remain. The
builder currently sits within Practice; full page composition, all player
visual states, cross-browser/offline coverage and final fidelity audit remain.
Its compact composition adapts the established rows; no approved compact
builder reference was supplied.

The exact custom-receipt resolver increases shared JS closures. The artifact
budget now permits 482000 raw / 144500 gzip / 122000 Brotli bytes; measured
Settings before the last identity guard was 481058 / 143923 / 121267. This is a
bounded allowance for the actual feature; answer-bearing content remains
outside the precommit closure. Final measurements are emitted by the verifier.

Navigation follow-up: root build/artifact verification and all workspace
typechecks passed. Three Chromium builder tests passed, including traversing
all three setup destinations. Builder captures were refreshed with the new
navigation; hazard and simulation visual audits remain part of final review.


## Practice setup composition and direct links

Setup navigation now sits above the form card, with the scope note before the
20px builder heading and content fields. The first fieldset no longer adds an
extra top margin; the card fills its parent section and scope-note text/links
have explicit spacing. The builder remains an anchored section of Practice,
preserving the accepted hub's saved-activity and coverage content.

Direct `/practice/#practice-builder` navigation now focuses and scrolls to its
focusable section once the hub's independent activity and Review reads settle.
An empty Review queue is a completed read. The action runs once, so later user
interactions are not repeatedly scrolled back. Ordinary in-page links retain
native fragment navigation. Focus outlines intentionally remain visible.

The initial implementation focused before saved-content layout settled and
failed viewport checks in Chromium/WebKit. The corrected cross-browser setup
navigation test passes in all three engines, including focused target and visible
builder heading. The other ten Practice-builder checks passed in the original
run, including exact saved feedback and offline custom documents. Five workspace
typechecks and root build/artifact checks pass after the final changes.

`practice-composition-screenshots/` retains default, unavailable-length, and
all-matching states at 1053/384 CSS widths, plus direct-link entry captures.
The final capture checks focus, heading visibility, and absence of horizontal
overflow before interaction. All captures completed without page errors.
Desktop and compact entry layouts were inspected, and the desktop card-width
correction was inspected in the final refreshed capture. Reference 22 supplies
the setup composition; real four-category inventory and native checked marks
remain intentional differences. Final setup-summary comparison and the broader
Home/Practice/Review visual audit remain unfinished.


## Setup summary reconciliation

Practice and Hazard now use a titled summary card with divided definition-list
rows for task, length, timing, feedback and saved-record behavior. Practice also
names its selected content areas; an invalid requested length explicitly asks
for replacement. Hazard identifies visual marking versus written zones and
explains that those response records remain separate. The summary reflects
current controls and does not introduce sessions, quotas, or new storage.

`setup-summary-practice/` and `setup-summary-hazards/` retain desktop/compact
captures, including dedicated summary crops for each captured state. The
unavailable Practice length, default Practice set, written five-scene drill,
and all-scenes visual drill were visually compared with the accepted builder's
summary structure. Compact rows stack their labels and values. The prototype's
invented technical pack/version strings are not reproduced; repeat-code behavior
remains explained in the existing disclosure.

All 15 targeted online Practice/Hazard builder workflow checks pass across
Chromium, Firefox and WebKit, including selection, saving, Review and setup
navigation. Offline cases were not repeated for this presentation-only change.
Five workspace typechecks and root build/artifact checks pass. Both capture
scripts completed without page errors. The remaining integrated visual audit
and illustrated-question binding work are still tracked separately.
