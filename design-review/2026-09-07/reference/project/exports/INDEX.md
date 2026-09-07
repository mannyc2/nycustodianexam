# Design export — index

Prepared September 6, 2026 against `mannyc2/nycustodianexam@716d4250` (`product/`, `content/`,
`apps/site/src/styles.css` read; no commits made from the design side).

- `current/` — one current design per page. Open any `.dc.html` directly in a browser.
- `explorations/` — historical only. Never an implementation reference.
- `screenshots/` — PNGs, named `NN-page--state--WIDTHw.png`.
- `current/DESIGN-DECISIONS.md` — the owner rules every drawing follows.
- `current/styles-additions.css` — the shared style additions handed to `apps/site/src/styles.css`.
- `current/content/assets/derivatives/` — the exact artwork the prototypes load (8 tool records,
  3 hazard scenes). Icons are Material Symbols Rounded, loaded from Google Fonts by each page's
  head; no icon file is bundled.

Each prototype opens with a dark `Settled` badge, its route family and its path. Anything under a
badge reading `Turn N — archived …` or a heading starting `Archive —` is history inside that same
file, kept for comparison; the settled design is always the first frame group.

## Page → state → prototype → screenshot

| Page | Route | State | Prototype | Screenshot (px) |
|---|---|---|---|---|
| Home | `/` (`home`) | First visit, desktop | `current/Home.dc.html` — frame `Home — ample` | `01-home--first-visit--1248x2844.png` (1248×2844) |
| Home | `/` | First visit, mobile | frame `Home — compact` | `02-home--first-visit--384x2097.png` (384×2097) |
| Home | `/` | Library disclosure open, desktop | frame `Home — ample` | `03-home--library-open--1248x2844.png` (1248×2844) |
| Home | `/` | Library sheet open, mobile | frame `Home — compact` | `04-home--library-sheet-open--384x2097.png` (384×2097) |
| Practice | `/practice/` (`study-hub`) | First visit, desktop | `current/Study Hub.dc.html` — frame `Study — new learner, ample` | `05-practice--first-visit--1248x3181.png` (1248×3181) |
| Practice | `/practice/` | First visit, mobile | frame `Study — new learner, compact` | `06-practice--first-visit--384x2237.png` (384×2237) |
| Practice | `/practice/` | Returning, 23 sessions, incl. unavailable saved attempt | frame `Study — returning, ample` | `07-practice--returning-unavailable-attempt--1248x3979.png` (1248×3979) |
| Practice | `/practice/` | Returning, mobile | frame `Study — returning, compact` | `08-practice--returning--384x2083.png` (384×2083) |
| Exams | `/exams/` (`exam-selector`) | Record open (reading), desktop | `current/Landing.dc.html` — frame `Exams — ample` | `09-exams--record-open--1248w.png` (1248×2872) |
| Exams | `/exams/` | First visit, mobile | frame `Exams — compact` | `10-exams--first-visit--384w.png` (384×2255) |
| Settings | `/settings/` | Returning, desktop | `current/Settings.dc.html` — frame `Settings — ample` | `11-settings--returning--1248w.png` (1248×2279) |
| Settings | `/settings/` | Returning, mobile | frame `Settings — compact` | `12-settings--returning--384w.png` (384×2046) |
| Settings | `/settings/` | Deletion preview, before confirmation | frame `Settings — delete preview` | `13-settings--delete-preview-confirmation--608w.png` (608×369) |
| Settings | `/settings/` | Export — what the file holds | frame `Settings — export` | `14-settings--export-file-contents--608w.png` (608×407) |
| Offline | `/offline/` | One copy turned on, desktop | `current/Offline.dc.html` — frame `Offline — turned on, ample` | `15-offline--turned-on--1248w.png` (1248×2552) |
| Offline | `/offline/` | One copy turned on, mobile | frame `Offline — turned on, compact` | `16-offline--turned-on--384w.png` (384×1735) |
| Offline | `/offline/` | Nothing downloaded yet (empty state) | frame `Offline — nothing downloaded, ample` | `17-offline--nothing-downloaded--1248w.png` (1248×1063) |
| Offline | `/offline/` | Removal preview, before confirmation | frame `Offline — removal preview` | `18-offline--removal-preview--608w.png` (608×376) |
| Offline | `/offline/` | Storage unavailable | frame `Offline — storage unavailable` | `19-offline--storage-unavailable--608w.png` (608×260) |
| Review | `/review/` (`review-queue`) | Ready for review, desktop | `current/Review Queue.dc.html` — frame `Review — ample` | `20-review--ready--1248w.png` (1248×2920) |
| Review | `/review/` | Ready for review, mobile | frame `Review — compact` | `21-review--ready--384w.png` (384×2598) |
| Session builder | practice setup | Practice set, all controls | `current/Session Builder.dc.html` | `22-session-builder--practice-set--1053w.png` (1053×1195) |

Prototypes with no screenshot in this pass, unchanged since the last export apart from the copy
listed below: `Question Player.dc.html`, `Hazard Player.dc.html`, `Simulation Navigator.dc.html`,
`Tool Atlas.dc.html`, `Component Library.dc.html` (specimens, not a route),
`Future Explorations.dc.html` (no route — unsupported capability lives only here).

Example data is the same in every prototype and its screenshot: 23 sessions, 214 attempts, 12
review items, packs 1.8.0 and 2.0.0, facts last read August 25, 2026.

## Visible changes in this pass

1. **Settings** — “your exam choice” is gone from the export card sentence, the export contents
   list, the import preview (“Adds”), the deletion preview (“Kept”) and the deletion-complete
   statement. Those rows now name the review list and these settings only.
2. **Component Library** — the first-visit `HomeDashboard` specimen no longer says “Start by
   choosing the exam you are studying for” and its action is no longer “Choose your exam”. It
   reads “Start with a set of 45 questions”, states that there is no exam to choose, and the
   first step is picking areas and a length. No selected-exam badge remains in any current
   specimen (`ExamCard` is a reading card; the shell has no exam chip).
3. **Offline** — both headers read “Your practice material is available offline.”
4. **Practice and Session Builder** — 45 questions is now described as the shortest set we offer,
   in the Practice header (both widths) and in the builder's length note. Nothing claims the
   official test guide publishes that set.
5. **Home and compact copy** — the headline names the series (“Free practice for the New York
   Entry-Level Custodians and Janitors series.”) at both widths. The subhead and the compact
   subhead now attribute the three subject areas to the state test guide *for this series* and
   say the reader's own announcement is what settles which areas their test uses; the “every New
   York custodian and janitor announcement” claim is gone, as are the figures-strip lines “3, shared
   by every exam” (Practice, both widths) and “3, set by the state test guide” / “3, set by the
   state” (Home, both widths) → “3, named for this series”.
6. **No next-cycle coverage claim** — Home's and Exams' cycle notices no longer say the plan
   “still applies to the next cycle”. They report what the August 25 read found, and state
   plainly that whether a later announcement has opened is not something the page can establish
   and that no next-cycle date has been published. The heading is now “What the August 25 read
   found” instead of the blanket “Nothing is open for filing right now”.
7. **No watch state** — the “Watch for the next announcement / next one / next cycle” buttons and
   the “watching saves a flag on this device” caveat are removed from Exams and Home. Record
   secondary actions read “Check your announcement”; the band's action reads “Read what each
   announcement says”. The settled Exams design note names the two real record actions.
8. **Archive labelling** — Home is badged `Settled` (it is the only variant for its family), and
   the archived Study Hub turn-2 heading now begins “Archive —”.

## Intentional differences from the current implementation

The screenshots in `current-screenshots/` were treated as a record of the build, not as targets.
Where they differ from the accepted design, the design is kept:

- **Mobile navigation** is a bottom tab bar (Practice, Library, Exams, Settings) with Library as a
  sheet above it. The implementation renders header navigation with a popover. Accepted design
  preserved; nothing is called Menu or More.
- **Library is a disclosure, not a route** — three rows (Tool atlas, Tool comparisons, Hazard
  scenes) plus a “What practice covers” row, each carrying its count.
- **Four destinations, Settings alone on the right**; Sources is footer-only, and Offline is
  reached from Settings or from a download/recovery action, never from the header.
- **No saved active exam anywhere** — no exam chip, no Selected/Watch state, no “Choose your exam”,
  no per-exam scoping. Exam pages are reference reading; Practice starts without choosing.
- **Identifiers stay under `Technical details`** (exam numbers, pack and registry versions, line
  ids, effective dates), except the registry version in the header exam chip that `ROUTES.md`
  requires.
- **Sentence case throughout**, no uppercase or letter-spaced labels or status chips, and status is
  marked only where it changes the reading (Not published, Superseded, Not applicable,
  Conflicting, Unverified).

## Not exported / open items

State this plainly rather than assume it was handled:

- **Screenshots are element captures at the design's own frame widths**, 1248 px (ample) and 384 px
  (compact) plus 608 px for the inline panels — not browser-viewport captures at exactly 1280 and
  390 px. The frames are the artboards the design is drawn at; both widths sit inside the same
  breakpoints as 1280/390. No screenshot was generated for a real browser window.
- **No verification pass is claimed** beyond this: each page was loaded in the preview and its
  frames measured before capture, and the copy corrections were re-read in the source. No visual
  diff against the implementation was run.
- **Tool Atlas still draws 8 illustrated tools, not 65.** Only 8 tool derivatives exist in this
  design project (`content/assets/derivatives/tools`). Copying the remaining 57 images and the
  nine-family filter drawing is a separate pass; the repository handoff note lists it.
- **The other items in the repository's remaining-updates note** (Review Queue scheduling redraw,
  Study Hub history from saved attempts, player prototype-only controls, Home/Exams six
  destinations, count-based offline removal preview, per-scope Settings counts) are not part of
  this pass, which was scoped to the five confirmed corrections plus the deliverable.
- `current-screenshots/` and `reference/project/` were not present in the repository revision that
  was read; the comparison used the design files in this project and the repository's own
  `plans/design-handoff-update-request.md`.
