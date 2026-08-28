# Design system

**Status:** maintained visual, responsive, accessibility, and print contract.
The standard/focused shell amendment was selected under
`CODEX-ONLY-UIUX-V1` and is **NOT HUMAN-USABILITY-TESTED**.
This document supplies the shared design layer for `FEATURE_SPEC.md`,
`COMPONENT_ARCHITECTURE.md`, and the route families in `ROUTES.md`.
`SCREEN_STATES.md` controls which state and transition combinations are legal;
the matrix below controls how those legal states present and behave. This
document does not override exam facts, authored-content review, or
reveal/security rules.

Normative terms: **MUST** is release-blocking, **SHOULD** is the expected v1
default, and **MAY** is optional.

## 1. Design goals

The interface should feel calm, trustworthy, legible, and practical rather than
gamified. It must make source status, uncertainty, active profile/version,
learner intent, and recovery actions obvious without artificial urgency.

The design system follows these rules:

- Semantic HTML determines meaning; CSS determines presentation.
- Content determines when a layout changes. Device brand names do not.
- The reading order, keyboard order, and visual order agree.
- Color, animation, position, hover, gesture, and precision are never the only
  way to identify or complete an action.
- Unknown, conflicting, stale, offline, unavailable, and error are visibly and
  textually different states.
- Static documents and React islands use the same tokens and DOM patterns.
- Decisive details in reviewed images are never cropped, blurred by scaling, or
  covered by controls.
- Print is a first-class output, not a screenshot of the screen UI.

V1 has one required light color scheme. Semantic color tokens preserve a future
theme boundary, but a dark theme is not a release requirement.

## 2. CSS organization

CSS uses an explicit cascade order:

```css
@layer reset, tokens, base, layout, components, utilities, overrides;
```

- `reset` normalizes only behavior that the project deliberately owns.
- `tokens` defines the approved custom properties.
- `base` styles native elements and focus behavior.
- `layout` contains shared composition patterns such as stack, cluster, grid,
  split, sidebar, and bounded measure.
- `components` contains family-scoped styles.
- `utilities` is a small reviewed set for visually hidden content, flow, and
  print-only/screen-only behavior; it is not an ad hoc styling language.
- `overrides` contains forced-color, reduced-motion, and print adaptations.

Use logical properties (`margin-inline`, `padding-block`, `inset-block-end`) and
relative units. Raw colors, arbitrary spacing, private shadows, and unreviewed
z-index values outside the token layer are prohibited. A component may define a
private intrinsic measurement only when its content contract explains why a
shared token cannot represent it.

## 3. V1 token set

The initial release tokens are:

```css
:root {
  color-scheme: light;

  /* Typography */
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono",
    monospace;
  --text-xs: 0.8125rem;
  --text-sm: 0.9375rem;
  --text-body: 1rem;
  --text-lead: clamp(1.0625rem, 1rem + 0.25vw, 1.25rem);
  --text-h4: clamp(1.125rem, 1.05rem + 0.3vw, 1.375rem);
  --text-h3: clamp(1.25rem, 1.12rem + 0.55vw, 1.625rem);
  --text-h2: clamp(1.5rem, 1.25rem + 0.9vw, 2rem);
  --text-h1: clamp(1.875rem, 1.45rem + 1.5vw, 2.75rem);
  --leading-tight: 1.2;
  --leading-body: 1.55;
  --leading-loose: 1.7;
  --weight-normal: 400;
  --weight-medium: 550;
  --weight-bold: 700;

  /* Spacing: one 0.25rem base with a restrained larger scale */
  --space-0: 0;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4rem;
  --space-9: 6rem;

  /* Shape and borders */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-pill: 999rem;
  --border-thin: 1px;
  --border-strong: 2px;

  /* Measures and targets */
  --measure-copy: 68ch;
  --measure-narrow: 48ch;
  --layout-wide: 80rem;
  --layout-full: 96rem;
  --target-default: 2.75rem;
  --target-minimum: 1.5rem;
  --control-block: 2.75rem;
  --focus-width: 0.1875rem;
  --focus-offset: 0.1875rem;

  /* Surfaces and text */
  --color-canvas: #f7f8fa;
  --color-surface: #ffffff;
  --color-surface-subtle: #edf2f7;
  --color-text: #17202a;
  --color-text-muted: #4b5563;
  --color-border: #b7c1cc;
  --color-border-control: #667085;
  --color-shadow: rgb(23 32 42 / 14%);

  /* Actions and selection */
  --color-action: #075985;
  --color-action-hover: #0c4a6e;
  --color-on-action: #ffffff;
  --color-link: #075985;
  --color-focus: #1d4ed8;
  --color-selected-surface: #e0f2fe;
  --color-selected-border: #075985;
  --color-disabled-surface: #e5e7eb;
  --color-disabled-text: #4b5563;

  /* Status: every use also has text and/or icon/shape */
  --color-success: #166534;
  --color-success-surface: #ecfdf3;
  --color-warning: #854d0e;
  --color-warning-surface: #fffaeb;
  --color-danger: #b42318;
  --color-danger-surface: #fef3f2;
  --color-info: #1e40af;
  --color-info-surface: #eff6ff;

  /* Elevation and motion */
  --shadow-raised: 0 0.25rem 1rem var(--color-shadow);
  --duration-fast: 120ms;
  --duration-normal: 180ms;
  --easing-standard: cubic-bezier(0.2, 0, 0, 1);

  /* Owned layers only */
  --z-header: 10;
  --z-sticky-actions: 20;
  --z-dialog: 40;
  --z-skip-link: 50;
}
```

Exact token values may change only through design-system review and automated
contrast/regression checks. Components consume semantic tokens such as
`--color-danger`; they do not create family-specific red/green aliases.

## 4. Typography and content measure

- Body copy uses `--text-body`, `--leading-body`, and `--measure-copy`.
- Long source excerpts, explanations, procedures, and privacy/security content
  do not exceed the copy measure merely because the viewport is wide.
- Headings use the token scale and a clear level hierarchy. Components do not
  select heading levels for their appearance; the route supplies the correct
  semantic level and CSS supplies the style.
- Technical identifiers, checksums, seeds, and exact versions may use the mono
  stack and must wrap or scroll inside their own labeled region.
- Instructions avoid all-caps paragraphs and letterspacing that harms reading.
- Reviewed translations and long official titles must wrap. Fixed-height text
  boxes and layout assumptions based on English string length are prohibited.
- Underlines remain the default distinction for inline links. Removing an
  underline requires another persistent non-color cue.

## 5. Responsive layout model

Responsive changes are driven by the available inline size of the component,
not by a list of phone/tablet/desktop devices.

- Route shells use fluid gutters:
  `clamp(var(--space-4), 2.5vw, var(--space-7))`.
- Reading documents are bounded by `--measure-copy`; indexes and players may use
  `--layout-wide`; intrinsic scene workspaces may use `--layout-full`.
- `minmax(min(100%, <minimum>), 1fr)` prevents grid children from forcing page
  overflow.
- Compound families establish `container-type: inline-size` and switch only when
  their required minimum columns plus gap fit.
- A component collapses back to one column whenever zoom, translation, a large
  font, a sidebar, or a narrow embedding removes that space. At 400% browser
  zoom, all standard content becomes a single reflowed column without page-level
  horizontal scrolling.
- Only an intrinsically two-dimensional image/scene/table may scroll
  horizontally, inside a named and keyboard-accessible region with explicit
  controls or instructions.

Reference thresholds for testable v1 transformations are family-container
thresholds, not device labels:

| Family container | Transformation threshold |
| --- | --- |
| Question player | Split visual body and question controls only at `48rem` or wider |
| Atlas index/family | Persistent filter/comparison rail only at `58rem` or wider |
| Hazard player | Scene and control/zone rail split only at `64rem` or wider |
| Form/action layouts | Inline labels/actions only when each control retains its minimum readable width; default reference is `42rem` |

If real content overflows before a reference threshold, the threshold is raised.
It is never lowered merely to match a common device width.

## 6. Shell and navigation

Standard acquisition, reference, setup, result, preview, and utility routes use this
semantic order:

```text
skip link
site header
  independent/unofficial site identity
  primary navigation
  active profile/version context when relevant
main
footer
```

Focused question, hazard, review, and simulation player routes use this
deliberately reduced order:

```text
skip link
site header
  independent/unofficial site identity
  active profile/version context when relevant
main
  named session landmark
  position/progress
  task controls
  truthful Exit or Save-and-exit
```

The focused shell omits global learner-task, acquisition, trust, and utility
navigation and the global footer. Site identity carries the independent and
unofficial context. The explicit exit returns to the owning hub and may say
`Save` only when the maintained persistence contract makes that outcome true.

- The skip link is the first focusable element and becomes visibly prominent on
  focus.
- Standard-shell primary navigation uses links and `aria-current="page"`. A compact menu uses a
  named native button/disclosure pattern and remains usable without precision or
  animation. Closing it restores focus to the trigger.
- The current profile and version are visible on routes where they affect
  content. They are not hidden inside a menu on compact layouts.
- Online/offline status appears only when it changes available behavior. A stale
  profile or pack has a separate labeled status from merely being offline.
- Breadcrumbs appear on nested reference pages and use a labeled navigation
  landmark. They do not replace the route heading.
- Main content gets a stable focus target for route navigation and recovery.
- The standard shell footer includes the unofficial-status statement and direct routes to
  sources, corrections, security, and privacy.

At wider available widths, standard-shell identity, primary navigation, and
profile context may share a row. When they no longer fit without wrapping
controls below their target size, the profile context moves to its own row and
navigation becomes a compact disclosure. The header is sticky only if testing
proves that it does not reduce usable 400% reflow space; sticky primary study
actions take precedence. Focused shells do not introduce a compact global menu.

## 7. Controls, targets, and focus

- Primary controls have a minimum `2.75rem` (44 CSS px at the default root size)
  block and inline target. This includes icon buttons, choice rows, zoom controls,
  marker controls, dialog close, pagination, and sticky actions.
- No non-exempt target may be smaller than `1.5rem` (24 CSS px), the WCAG 2.2 AA
  minimum. Inline text links and native user-agent equivalents may use the
  standard exceptions. Closely placed minimum-size controls retain at least
  `var(--space-2)` separation.
- A radio/checkbox's whole visible label row is clickable. The native control
  remains in the accessibility tree and has a visible selected/check indicator.
- One route or form region has one visually dominant primary action. Destructive
  actions are separated and explicitly named; color is secondary.
- A link navigates; a button changes state or invokes behavior. Clickable cards
  with nested interactive controls are prohibited.
- Disabled controls use native `disabled` only when the action truly cannot run.
  If the learner can fix the condition, nearby text explains how. Busy and
  unavailable are not silently conflated with disabled.

All focusable elements use a high-contrast focus indicator equivalent to:

```css
:focus-visible {
  outline: var(--focus-width) solid var(--color-focus);
  outline-offset: var(--focus-offset);
}
```

On surfaces where one ring cannot contrast with both the element and its
surroundings, use a two-color ring (surface separation plus focus color). Never
remove native focus without an equal or stronger replacement. Focused elements
receive `scroll-margin-block` equal to the active sticky-action clearance plus
`var(--space-4)`.

## 8. Sticky action regions

Question/hazard commit actions and other primary actions MAY be sticky at compact
container widths. The pattern is:

- `position: sticky`, not viewport-fixed;
- `inset-block-end: 0` plus `env(safe-area-inset-bottom)` padding;
- opaque surface, strong top border, and enough inline padding for zoom;
- present in normal document flow so its height contributes to page layout;
- one primary action and at most the immediately necessary secondary action;
- no more than two wrapped rows; beyond that, actions return to normal flow;
- hidden/reflowed as ordinary content in print.

Content below/behind the region receives measured block-end clearance. Focusing a
choice, error, outcome, marker, or navigation item must scroll it fully above the
sticky area. Opening the on-screen keyboard must not leave a fixed overlay over
the active field. At wider widths, actions move inline beneath their owning form
or into a non-sticky side rail.

## 9. Page and component behavior matrix

Every applicable route and interactive family implements explicit states. A
blank region or indefinite skeleton is not a state.

| State | Page-level behavior | Component behavior | Focus and announcement | Available recovery/action |
| --- | --- | --- | --- | --- |
| `loading` | Preserve shell/title and state what is loading. | Show a labeled progress indicator; skeletons are decorative and not repeated to assistive tech. | Keep focus stable; announce only loading that blocks a requested action. | Cancel/back when meaningful; never show fake empty results. |
| `empty` | Explain that a valid query/queue has no items. | Named empty composition with the active filters/scope. | Focus the empty-state heading after a user-triggered search/navigation. | Reset filters, choose profile/content, or start another supported activity. |
| `ready` | Show current profile/version and complete instructions. | Controls are enabled according to actual data; no correctness is present. | Initial focus stays at the route/step heading. | Select, filter, navigate, or begin. |
| `selected` | No route-level success styling or reveal. | Show the learner's editable selection with native checked state; explicit submit becomes available. | Selection follows native radio/marker behavior; no correctness announcement. | Change selection, flag, clear marker where supported, or submit. |
| `committing` | Do not navigate or reveal optimistically. | Preserve visible selection, set the owning form/region busy, prevent duplicate submit and conflicting edits for the in-flight transaction. | Keep focus stable; one concise “saving” status if delay is perceptible. | Await settlement; no “next” action yet. |
| `recorded` (active simulation) | Keep the learner in the active simulation and show no outcome. | Preserve the editable response plus answered/unanswered/current/flagged labels; no rationale, source, or correctness treatment exists. | Announce a saved response concisely without moving focus. | Edit, flag, navigate, or enter final confirmation. |
| `answered-revealed` | Identify the pinned item/profile/content version. | Show outcome, learner choice, every rationale, decisive feature, sources, full description, and review/report actions in the required order. | After render, focus the outcome heading; do not duplicate its full text in a live region. | Review/report/print and next/previous as applicable. |
| `reviewed` | Preserve answer history and show that review was explicitly acknowledged/advanced. | Update review reason/status without erasing the explanation. | Navigation focuses the next heading. | Continue queue, revisit explanation, or leave. |
| `offline-stale` | State both offline status and exact stale profile/pack version. | Keep valid local actions operable; external links/submission are truthfully unavailable or drafts. | Announce the transition only when behavior changes. | Continue pinned content, inspect pack, export, or retry online action later. |
| `offline-unavailable` | Explain that required content was never downloaded or is incomplete; never call this empty. | No broken player shell or partial session starts. | Focus the unavailable-state heading after the failed request. | Go to offline packs, remove inactive data, reconnect, or return. |
| `content-unavailable`, `not-found`, or `withdrawn` | Preserve the requested identity and name the exact availability condition. | Do not substitute a newer item, another series, guessed facts, or an empty component. A safe historical/correction notice renders when allowed. | Focus the state heading; a background withdrawal update is announced without stealing focus. | Return to the reviewed parent, use a retained safe version, download a required pack, or report a correction as applicable. |
| `storage-unavailable` or `quota-limited` | Keep readable/public content visible and state that durable study actions cannot be claimed as saved. | Prevent commit-before-reveal paths that require persistence; retain draft input and distinguish diagnostics from destructive cleanup. | A user-triggered write failure focuses the error summary and announces once. | Export, inspect/remove inactive packs, retry persistence, or explicitly leave the workflow. |
| `corrected`, `superseded`, or `retired` freshness | Render the exact pinned historical representation when safe plus a prominent version notice. | Never rewrite historical correctness or silently replace content in an active session. | In-page navigation to the notice focuses its heading; background discovery is polite. | Inspect correction/history, continue the retained session when valid, or start new current practice. |
| `error` | Retain the learner's input and identify the failed operation in plain language. | Error summary links to affected fields/actions; typed storage/network/content states remain distinct. | Focus the error summary after render and announce a concise error once. | Idempotent retry, edit selection/input, export/remove pack, or safe exit. |

Commit failure returns from `committing` to an editable selected state plus the
error composition. It never transitions to `answered-revealed` from memory alone.

## 10. Family layout transformations

### Document and reference pages

Reference pages use one readable content column with optional in-flow metadata
or source rail. At sufficient width, a source/table-of-contents rail may sit next
to the article, but the main prose remains bounded. Facts use definition-list or
fact-card semantics; conflicts place retained values together instead of relying
on a badge alone.

On compact/reflowed layouts, all rails return to the document flow immediately
after the section they describe. Tables use responsive rows only when headers
and relationships remain explicit; otherwise the original table sits in a
labeled scroll region.

### Question player

The DOM/reading order is always:

```text
question header and position
prompt
visual or nonvisual body
choices
flag/commit/status
postcommit outcome and explanations
sources
review/navigation actions
```

- Below the `48rem` player threshold, the player is one column and the commit
  action may use the sticky-action pattern.
- At or above `48rem`, a visual question may place the reviewed figure and the
  prompt/choices in two grid columns. Grid placement MUST NOT reorder the DOM.
  The action bar belongs under the choices; feedback and sources span the
  available width below both columns.
- Nonvisual questions stay in a bounded single reading column even when wide;
  extra width does not stretch ordered observable facts into hard-to-track rows.
- Choice labels wrap without clipping. No option receives a fixed height.
- Before commit, there is no reserved “correct answer” panel containing hidden
  content. After commit, feedback enters as ordinary document flow so zoom and
  screen readers encounter it predictably.
- Images use `object-fit: contain`; zoom occurs in a bounded viewport with visible
  zoom in/out/reset controls. Reset restores the authored whole-image view.

### Tool atlas and comparisons

- Below `58rem`, search precedes a native filter disclosure, active-filter
  summary, result count, and one-column result list. Reset is adjacent to the
  active-filter summary, not hidden at the bottom.
- At or above `58rem`, filters occupy a bounded rail and results use a content-fit
  card grid. The rail is sticky only while it fits in the viewport without
  hiding its own final control.
- A comparison page switches from stacked concept sections to side-by-side
  columns only when every concept retains at least `18rem` of usable width.
  Decisive distinguishing features use aligned rows with repeated text headers,
  not image position or color alone.
- Tool images preserve the full reviewed object; uniform card crops are not
  allowed to remove distinguishing geometry. Cards may use thumbnails only when
  the full image is one direct action away.
- In print, filters disappear, active scope becomes a heading/metadata block, and
  comparisons use page-safe aligned sections with repeated concept names.

### Hazard player

The visual scene is intrinsically two-dimensional and may pan/zoom inside its own
viewport. The page itself must still reflow.

- Below `64rem`, render the neutral overview/instructions, scene viewport,
  explicit pan/zoom/mark controls, marker list or zone navigator, and commit
  actions as one column. Commit may be sticky; viewport controls remain adjacent
  to the scene.
- At or above `64rem`, the scene occupies the larger grid column and the
  marker/zone/action rail occupies the smaller column. Postcommit zone feedback
  spans below or remains in a readable rail; it never overlays decisive pixels.
- Marker controls meet the 44px target contract. A learner can add, select,
  move by explicit step controls, and remove a marker without dragging. Pointer
  and multi-touch gestures are enhancements.
- Marker visuals use a number plus outline/shape. Hits, misses, decoys, duplicate
  marks, and other false positives use text labels and matched numbered feedback
  in addition to color.
- At 400% zoom, the two-column layout collapses. The scene viewport may scroll in
  both axes; the rest of the page may not. Controls remain outside the panned
  image layer so they are not magnified away or obscured.
- The nonvisual hazard variant never displays an empty scene placeholder. It uses
  one bounded reading column of ordered zones and observable facts, then
  postcommit interpretation/correction/source sections using the same zone
  numbers.
- In print, the blank scene/worksheet and annotated answer packet are separate.
  Annotation numbers match a textual key and remain distinguishable in
  grayscale.

### Sessions, review, results, and forms

Setup/settings/correction forms use a single column by default and group related
fields in real `fieldset` elements. At sufficient width, short compatible fields
may share a row; errors remain adjacent to the owning field. Long warnings,
privacy/security copy, and inventory limitations always span the full form.

Simulation navigation wraps labeled position controls rather than shrinking
targets. On compact layouts it uses a summary/disclosure plus previous/next/flag
controls; on wide layouts it may use a persistent navigator rail. Answered,
unanswered, current, and flagged states always have text/icon/shape distinctions.

Results use actual counts and visible sample sizes. Metrics become a responsive
definition list/card grid, never a chart whose area or color implies an official
score. The practice-only disclaimer appears before interpretation/actions.

## 11. Images, illustrations, and visual feedback

- Reserve reviewed intrinsic dimensions/aspect ratios to prevent layout shift.
- Do not crop or mask a decisive tool feature to make cards uniform.
- Neutral precommit and full postcommit descriptions are different reviewed
  content fields, not CSS-expanded versions of the same hidden node.
- A precommit page MUST NOT load answer-bearing overlays, annotated scene images,
  or full descriptions merely with `display: none`.
- Captions distinguish original practice artwork and source/rights basis where
  required.
- Annotation text remains real HTML where possible. Text baked into an image
  requires an equivalent in adjacent structured content.
- Correctness uses a word (`Correct`, `Incorrect`, `Your answer`, `Miss`, `Decoy
  false positive`), an icon/shape, and border treatment. Green/red alone is never
  sufficient.
- Images remain legible in high zoom and grayscale print. The accepted immutable
  raster is the source of truth; runtime CSS does not redraw or reinterpret it.

## 12. Forced colors and high contrast

The interface honors browser/system colors rather than freezing the authored
palette:

```css
@media (forced-colors: active) {
  :focus-visible {
    outline-color: Highlight;
  }

  [aria-current="page"],
  [aria-checked="true"],
  :checked + label {
    border-color: Highlight;
  }

  .status,
  .choice,
  .panel,
  .marker-control {
    border: 1px solid CanvasText;
    box-shadow: none;
  }
}
```

- Leave `forced-color-adjust: auto` in place by default.
- System `Canvas`, `CanvasText`, `LinkText`, `ButtonText`, `Highlight`, and
  `HighlightText` supply UI meaning where custom colors are replaced.
- Selected/current/correct/error states retain text, border width/style,
  native checked state, and icon/shape cues.
- Custom icons use `currentColor`; essential icons are not background images.
- Hazard markers and annotation numbers retain visible outlines against both the
  image and forced-color UI. If a necessary overlay needs controlled colors,
  isolate and document the smallest `forced-color-adjust: none` region and still
  provide the textual equivalent.

## 13. Reduced motion

Motion is optional feedback, never a requirement or reward mechanism.

- Default transitions are limited to color, border, and small disclosure changes
  using `--duration-fast` or `--duration-normal`.
- Do not animate correctness reveals, countdown pressure, streaks, large parallax,
  auto-scrolling carousels, marker paths, or route changes.
- Focus changes and announcements occur without waiting for animation.
- Timers update text no more often than needed and never pulse.

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Any component that depends on an `animationend` event is invalid; completion and
focus behavior must also work when duration is effectively zero.

## 14. Print system

Print products are deterministic semantic documents generated from validated
content and a recorded print manifest. Screen-only styling is not the data
source.

### Print transformation

- Hide site navigation, sticky actions, dialogs, filter controls, install/offline
  banners, and unrelated chrome.
- Retain the unofficial/original-practice statement, selected profile and
  version, content version, actual generated distribution, page numbering where
  supported, and source excerpts requested for the packet.
- Use black text, white paper, borders, line styles, labels, and annotation
  numbers that work with browser background printing disabled.
- Normal print uses at least 12pt body type with comfortable leading; large-print
  mode uses at least 18pt body type and proportionally larger controls/answer
  spaces.
- Use `break-inside: avoid` for a question with its options, one fact record, one
  comparison unit, and one zone-feedback unit when they fit on a page. Do not
  force a block taller than the printable page to remain together.
- Repeat table headers and concept/zone identifiers after page breaks.
- Prevent headings, prompts, and source labels from becoming isolated at a page
  bottom.
- Respect user paper and margin choices exposed by the print contract; do not
  silently assume Letter when a supported setting says otherwise.

### Required separation

- Question/worksheet pages and answer-key/explanation pages are separately
  controllable and begin on distinct sheets/sections.
- Blank hazard worksheets never contain answer overlays in hidden print layers.
  Annotated answer packets are separate generated content.
- Text-equivalent/nonvisual packets are first-class layouts, not image sheets with
  appended alt text.
- Answer sheets use visible labels as well as bubbles/marks.
- System print and browser “Save as PDF” are the output path; the site does not
  claim a server-generated official PDF.

Print preview must test grayscale distinction, clipped content, page count,
source readability, key separation, deterministic regeneration, and large-print
flow before enabling the final system-print action.

## 15. Route-layout matrix

| Route/layout family | Constrained inline size | Ample inline size | Print |
| --- | --- | --- | --- |
| Acquisition/reference | One bounded reading column; in-flow facts/sources | Bounded prose plus optional contents/source rail | Navigation removed; facts/sources retained |
| Index/search | Search, filter disclosure, active-filter summary, list | Persistent bounded filter rail plus content-fit grid | Controls removed; scope/results become headings |
| Question player | One-column reading order; optional sticky commit | Visual/question split at `48rem`; feedback full width | Question and key/explanation sections separated |
| Atlas comparison | Concepts stacked with repeated names | Side-by-side only with `18rem` minimum per concept | Page-safe aligned sections; no decisive cropping |
| Visual hazard | Scene, controls, marker list, commit, feedback stacked | Scene/control rail split at `64rem`; feedback unobscured | Blank and annotated packets separated |
| Nonvisual hazard | Ordered zones in one reading column | Same bounded reading model; no decorative empty canvas | Ordered zone worksheet/key |
| Simulation | Compact labeled navigator disclosure plus player | Persistent navigator rail when it fits | Results/manifest only when explicitly requested |
| Settings/correction/offline | One-column field groups and in-flow status | Compatible short fields/actions may share rows | Normally not printed; any print action uses a purpose-built summary |

## 16. Design acceptance gates

A route/family is not complete until representative real-browser checks prove:

1. usable semantic HTML and a visible route purpose before island activation;
2. no page-level horizontal scrolling at 320 CSS px or 400% zoom, except a named
   intrinsic two-dimensional region;
3. correct container transformation with long titles, long choices, translated
   instructional text, and browser text enlargement;
4. default 44px primary targets and no unexplained target below the WCAG 2.2 AA
   minimum;
5. visible, unobscured focus through navigation, errors, commit, reveal, sticky
   actions, dialogs, and viewport controls;
6. distinguishable ready/selected/committing/revealed/reviewed/offline/error
   states without color;
7. forced-color operability, reduced-motion equivalence, and grayscale print;
8. neutral/full-description and visual/nonvisual boundaries with no precommit
   answer leak;
9. deterministic print pagination/key separation for representative content; and
10. token-only colors/spacing/z-index plus no component-private responsive mode
    that contradicts this contract.

Visual screenshots support review, but DOM semantics, keyboard behavior, focus,
announcements, accessibility-tree content, route closure, and printed output need
independent assertions.
