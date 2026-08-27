# Plan 007: Specify shared UI foundations and responsive route-family contracts

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report; do not improvise. This is a research and product-contract plan. Do not
> implement or restyle the production UI. When done, update this plan's status
> row in `plans/README.md` unless a reviewer told you that they own the index.
>
> **Drift check (run first)**:
> `git diff --stat e6f9119..HEAD -- research/README.md research/ui-ux/ui-foundations-contract-2026-08-26.md product/COMPONENT_ARCHITECTURE.md product/DESIGN_SYSTEM.md product/SCREEN_STATES.md docs/OPEN.md plans/README.md apps/site/src apps/site/scripts apps/site/browser-tests`
> Plans 004-006 are expected to change maintained product contracts after this
> planning coordinate. Compare their merged decisions and every cited excerpt
> with the live tree, record the exact dependency-complete execution base, and
> refresh anchors. Stop only on unexplained semantic drift or a conflict that
> invalidates this plan; do not reject explained dependency or sibling changes
> mechanically.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: `plans/004-establish-consumer-language-boundary.md`,
  `plans/005-rebuild-learner-task-navigation.md`, and
  `plans/006-select-consumer-visual-system.md`
- **Category**: direction
- **Planned at**: commit `e6f9119`, 2026-08-26

## Why this matters

The maintained product documents already describe a strong semantic component
architecture, explicit legal states, and container-responsive route families.
The implementation does not consistently realize that contract: several
interactive families emit class names with no selector, recurring states use
different visual vocabularies, and most documented responsive transformations
do not exist. A production redesign built directly on that drift would multiply
one-off styling and preserve inconsistent behavior.

This plan produces the complete foundation, state, DOM/style, and responsive
migration specification that a later implementation agent can execute. It does
not change the product's feature inventory, state machines, static-document plus
React-island boundary, or production source.

## Current state

### Maintained contracts

- `product/COMPONENT_ARCHITECTURE.md:13-36` fixes the accepted renderer boundary:
  useful static HTML plus bounded React 19 islands; React is not the router,
  durable store, or application state machine.
- `product/COMPONENT_ARCHITECTURE.md:124-147` names the semantic foundations,
  including `DocumentShell`, `PageHeader`, layout patterns, fields,
  `ActionBar`, status/error/empty patterns, disclosures, and image viewports.
- `product/COMPONENT_ARCHITECTURE.md:335-367` defines the canonical
  `state`/`actions`/`meta` provider contract. The provider owns subscription and
  presentation coordination; leaves do not import storage or controllers.
- `product/DESIGN_SYSTEM.md:185-217` requires container-driven transformations,
  single-column 400% reflow, and bounded overflow only for intrinsically
  two-dimensional content.
- `product/DESIGN_SYSTEM.md:209-214` gives reference family thresholds:
  question `48rem`, atlas `58rem`, hazard `64rem`, and forms approximately
  `42rem`, subject to real-content testing.
- `product/DESIGN_SYSTEM.md:582-606` requires representative real-browser
  evidence for semantics, reflow, targets, focus, states, forced colors,
  reduced motion, print, and answer-leak boundaries.

These are settled constraints. Research may refine anatomy, presentation,
thresholds, and migration order; it may not silently replace the architecture.

### Implementation drift that the specification must close

`apps/site/src/styles.css:472-480` assigns the same raised surface to unrelated
families:

```css
.card,
.hazard-card,
.question-card,
.reference-card,
.tool-card {
  border: var(--border-thin) solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-raised);
}
```

`apps/site/src/styles.css:484-489` establishes a container only for the question
card, but the file contains no `@container` rule. Its only compact screen rule is
the viewport query at `apps/site/src/styles.css:889-892`.

`apps/site/src/styles.css:310`, `:316`, and `:328` combine a `20rem` minimum page
width with a 125% large-text mode. That makes the page-wide floor 400 CSS pixels
in large-text mode, contradicting the 320px/400% reflow contract.

The following implementation classes have no matching selector in either
`apps/site/src/styles.css` or the generated copy
`apps/site/public/styles.css` at this baseline:

- `status-panel`, `status-panel-danger`, and `status-panel-warning`, used by
  print and simulation views;
- `error-panel`, used by simulation views;
- `field-label`, `field-hint`, and `text-input`, used by simulation setup; and
- the `hazard-player__*` family used for prompt, viewport, image layer, markers,
  marker controls, zones, commit status, and results.

For example, `apps/site/src/hazard-player/react/marker-controls.tsx:27-67`
renders five native movement/removal buttons per marker without the `.button`
class that supplies the `2.75rem` target contract at
`apps/site/src/styles.css:531-543`.

Two token references also fail silently:

- `apps/site/src/styles.css:739` uses undefined `--shadow-card`; the defined
  token is `--shadow-raised` at line 76.
- `apps/site/src/styles.css:823` uses undefined `--text-lg`; the defined type
  scale is at lines 9-16.

### Existing exemplar to preserve

`apps/site/src/question-player/react/context.tsx:14-55` is the closest current
implementation of the documented composition contract: it defines explicit
state, actions, and meta interfaces; reads a nullable context with React 19
`use()`; fails clearly outside the provider; and uses provider shorthand.
`apps/site/src/question-player/react/question-form.tsx:5-110` composes frame,
prompt, options, form, and controls as separate leaves.

The resulting specification must retain these principles:

- explicit named variants instead of mode booleans;
- compound components with a narrow context interface;
- state management isolated in the provider/adapter;
- children for structural composition instead of `renderX` props;
- React 19 `use()` and ref-as-prop conventions; and
- native HTML when a wrapper adds no semantic or behavioral value.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Confirm toolchain | `bun run check:toolchain` | exits 0 with Bun 1.4.0 and Node 22.22.0 accepted |
| Layout contract | `bun run check:layout` | exits 0 and reports the maintained-file count |
| Module boundaries | `bun run check:boundaries` | exits 0 with no forbidden imports |
| Typecheck source | `bun run typecheck` | exits 0 with all workspace typechecks passing |
| Typecheck browser suite | `bun run typecheck:browser` | exits 0 with no browser-harness errors |
| Unit tests | `bun run test` | exits 0 with all workspace tests passing |
| Chromium evidence | `bun run test:browser:chromium` | exits 0; existing browser cases pass |
| Complete gate | `bun run verify` | exits 0; all repository verification gates pass |
| Patch hygiene | `git diff --check` | exits 0 with no whitespace errors |

Do not install or upgrade dependencies for this plan. If the locked workspace is
not already available, stop and ask the operator before running an install.

## Suggested executor toolkit

- Use the `vercel-composition-patterns` skill if available when specifying
  foundation APIs and variants. Its compound-component, provider, explicit
  variant, children-composition, and React 19 guidance matches this repository.
- Read `product/SCREEN_STATES.md` completely before building the state matrix.
- Use the W3C WCAG 2.2 reflow, focus, target-size, and involving-users guidance
  as external method references; the local product contracts remain normative.

## Scope

**In scope** (the only maintained files this plan may modify):

- `research/ui-ux/ui-foundations-contract-2026-08-26.md` (create as the concise
  inventory, method, decision, limitation, migration, and source-ledger record)
- `research/README.md`
- `product/COMPONENT_ARCHITECTURE.md`
- `product/DESIGN_SYSTEM.md`
- `docs/OPEN.md`, only for genuinely unresolved implementation/research gates
- `plans/README.md`, status only

Transient class inventories, screenshots, mockups, spreadsheets, and prototype
HTML belong under a task-specific directory in `/tmp`. They must not be copied
into the repository. If uniquely necessary research evidence must remain at
HEAD, stop and obtain approval for the exact retained path before committing it.

**Out of scope** (do not modify):

- all files under `apps/`, `packages/`, `content/`, and `illustration/`;
- production CSS, generated HTML, React components, state machines, tests, and
  browser configuration;
- route IDs, URL patterns, feature inventory, exam facts, or question content;
- a SPA router, shared UI package, Storybook dependency, CSS framework, CSS-in-JS
  system, or JavaScript-only static-page shell;
- new imagery or changes to accepted raster bytes; and
- recruitment, participant contact, recording, compensation, or deployment of a
  prototype without separate operator authorization.

## Git and research workflow

- Start from a clean local `main` equal to a freshly fetched `origin/main`.
  Confirm that Plans 004-006 are `DONE` in that exact commit and record the
  first-parent commit that introduced each dependency's `DONE` index row as its
  acceptance/merge coordinate. Each coordinate must be an ancestor of
  `origin/main`. The immutable
  dependency-complete `origin/main` head, not the planning coordinate
  `e6f9119`, is this plan's execution base.
- Confirm both the local and remote `codex/uiux-foundation-contract` refs are
  absent, then create that branch at the recorded execution base. If GitHub
  read/write access is unavailable, the worktree is dirty, a dependency status
  is not `DONE`, a dependency coordinate is not an ancestor, or either branch
  ref already exists, stop rather than selecting another base or branch name.
- Create the concise research record and add its active entry to
  `research/README.md`. Commit and push that truthful initial scope, current
  evidence, source ledger, and pending-decision state, then open a draft PR
  before the extended inventory/prototype work. Push incrementally without
  force.
- Use concise imperative commit subjects consistent with current history, for
  example `Specify shared UI foundation contracts`.
- Do not merge, deploy, or publish a prototype without operator instruction.

Run these preconditions exactly from the repository root before creating the
branch. `UI007_EXECUTION_BASE_SHA` and the three dependency coordinates must be
copied verbatim into `## Source coordinates` in the research record; do not
leave the shell-variable names or a shortened SHA in the document.

```sh
git fetch origin main
gh auth status
test "$(gh repo view --json nameWithOwner --jq .nameWithOwner)" = "mannyc2/nycustodianexam"
test "$(gh api repos/mannyc2/nycustodianexam --jq '.permissions.push')" = true
test -z "$(git status --porcelain)"
test "$(git branch --show-current)" = main
test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"
test -f plans/007-specify-ui-foundations-and-responsive-contract.md
awk -F'|' '$2 ~ / 004 / {count++; gsub(/^ +| +$/, "", $7); if ($7 !~ /^DONE([[:space:]]|$)/) exit 1} END {exit count != 1}' plans/README.md
awk -F'|' '$2 ~ / 005 / {count++; gsub(/^ +| +$/, "", $7); if ($7 !~ /^DONE([[:space:]]|$)/) exit 1} END {exit count != 1}' plans/README.md
awk -F'|' '$2 ~ / 006 / {count++; gsub(/^ +| +$/, "", $7); if ($7 !~ /^DONE([[:space:]]|$)/) exit 1} END {exit count != 1}' plans/README.md
UI007_DEP004_SHA="$(git log --first-parent -1 -G '^\| 004 \|.*\| DONE' --format=%H -- plans/README.md)"
UI007_DEP005_SHA="$(git log --first-parent -1 -G '^\| 005 \|.*\| DONE' --format=%H -- plans/README.md)"
UI007_DEP006_SHA="$(git log --first-parent -1 -G '^\| 006 \|.*\| DONE' --format=%H -- plans/README.md)"
test "${#UI007_DEP004_SHA}" -eq 40
test "${#UI007_DEP005_SHA}" -eq 40
test "${#UI007_DEP006_SHA}" -eq 40
git merge-base --is-ancestor "$UI007_DEP004_SHA" origin/main
git merge-base --is-ancestor "$UI007_DEP005_SHA" origin/main
git merge-base --is-ancestor "$UI007_DEP006_SHA" origin/main
git cat-file -e origin/main:product/CONTENT_DESIGN.md
git cat-file -e origin/main:research/ui-ux/navigation-task-hierarchy/research-summary.json
git cat-file -e origin/main:research/ui-ux/consumer-visual-system/README.md
git cat-file -e origin/main:research/ui-ux/consumer-visual-system/verify-research.mjs
test -z "$(git branch --list codex/uiux-foundation-contract)"
test -z "$(git ls-remote --heads origin refs/heads/codex/uiux-foundation-contract)"
UI007_EXECUTION_BASE_SHA="$(git rev-parse origin/main)"
test "${#UI007_EXECUTION_BASE_SHA}" -eq 40
git switch -c codex/uiux-foundation-contract "$UI007_EXECUTION_BASE_SHA"
test "$(git rev-parse HEAD)" = "$UI007_EXECUTION_BASE_SHA"
```

Expected: every command exits 0; the new branch points exactly at the recorded
full execution-base SHA; the plan and index already exist at that base; and all
three recorded dependency coordinates are ancestors of it.

## Required temporary artifact contract

The scratch directory is not an informal note pile. Its completed state has
this exact tree; unknown files are allowed only under `screenshots/`, and no
file in this tree is committed:

```text
$UI007_SCRATCH/
├── source-inventory.ndjson
├── foundation-contract-matrix.json
├── route-archetype-matrix.json
├── representative-state-matrix.json
├── prototype-review-matrix.json
├── migration-map.json
├── decision-record.json
├── verify-artifacts.mjs
├── screenshots/
└── prototype/
    ├── index.html
    ├── styles.css
    ├── fixtures.mjs
    ├── prototype.mjs
    ├── prototype-manifest.json
    ├── serve.mjs
    └── verify.mjs
```

All JSON uses UTF-8, a terminal newline, `schemaVersion: 1`, no duplicate keys,
and no properties beyond those named below. NDJSON uses one complete JSON
object per nonblank line and the same no-unknown-property rule. Dates are full
ISO-8601 UTC timestamps; source coordinates are repository-relative
`path:line`; IDs are lowercase kebab-case. `verify-artifacts.mjs` is the single
executable validator and accepts only these commands:

```sh
bun "$UI007_SCRATCH/verify-artifacts.mjs" inventory --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH"
bun "$UI007_SCRATCH/verify-artifacts.mjs" foundations --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH"
bun "$UI007_SCRATCH/verify-artifacts.mjs" archetypes --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH"
bun "$UI007_SCRATCH/verify-artifacts.mjs" prototype --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH"
bun "$UI007_SCRATCH/verify-artifacts.mjs" migration --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH"
bun "$UI007_SCRATCH/verify-artifacts.mjs" decision --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH"
bun "$UI007_SCRATCH/verify-artifacts.mjs" all --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH"
```

Each subcommand requires only the artifacts that can exist by that step:
`inventory` requires the validator plus `source-inventory.ndjson`;
`foundations` adds `foundation-contract-matrix.json`; `archetypes` adds
`route-archetype-matrix.json`; `prototype` requires all prior matrices,
`representative-state-matrix.json`, `prototype-review-matrix.json`, the
`screenshots/` directory, and all seven prototype files; `migration` requires
the prototype set plus `migration-map.json`; `decision` requires the completed
tree including `decision-record.json`; and `all` requires the same completed
tree and runs every check. At every phase, an existing path not in the completed
tree is an error; a not-yet-required later path may be absent but, if present,
must parse and satisfy its schema.

The script must exit nonzero on a missing phase-required file or extra file
outside `screenshots/`, a parse error, duplicate/unknown key, wrong type, empty required string or array,
nonexistent source path, invalid source line, missing/extra required ID,
duplicate primary key, broken cross-reference, hash mismatch, incomplete review
row, or a rule stated below. On success it prints exactly one line,
`ui007 <command>: PASS`; no gate may rely on a human reading JSON.

The exact data schemas are:

- `source-inventory.ndjson`: each row has `schemaVersion` (integer 1),
  `inventoryId` (unique string), `routeFamilyNumber` (integer 1-21), `routeIds`
  (nonempty unique strings), `legalState` (string from `SCREEN_STATES.md`),
  `owner` (`static` or `react`), `source` (existing `path:line`), `element`
  (string), `renderedHooks` (unique string array of classes/data attributes),
  `selectorMatches` (array of existing `path:line`, or the single string
  `unmatched`), `tokenReferences` (array of `{name,status,owner}` where `status`
  is `defined` or `undefined` and undefined owners are `null`),
  `foundationIds` (nonempty unique IDs from the exact foundation set below),
  `accessibilityResponsibilities` (nonempty string array), `disposition` (one
  of `keep`, `rename`, `consolidate`, `replace`, `remove`), and `presentations`
  (object with nonempty strings for exactly `constrained`, `ample`,
  `largeText400`, `forcedColors`, `reducedMotion`, and `print`).
- `foundation-contract-matrix.json`: `{schemaVersion, foundations}`. Each
  foundation row has exactly `id`, `members`, `contractHeading`, `purpose`, `nonPurpose`,
  `semanticStructure`, `accessibleRelationships`, `staticOwner`, `reactOwner`,
  `variants`, `legalStates`, `slots`, `interactiveResponsibilities`,
  `domHooks`, `selectorOwner`, `focusAnnouncementErrorRecovery`,
  `presentations`, `migrationSource`, and `counterexample`. Arrays are unique
  and nonempty except `interactiveResponsibilities`, which may be empty for a
  static-only foundation; all other scalar fields are nonempty strings,
  `migrationSource` is an existing `path:line`, and `presentations` has the same
  exact six nonempty-string keys as the inventory.
- `route-archetype-matrix.json`: `{schemaVersion, plan006Decision,
  archetypes}`. `plan006Decision` has `commitSha`, `recordPath`, and `anchor`.
  Each archetype has exactly `id`, `routeFamilyNumbers`, `routeIds`,
  `legalStates`, `domReadingOrder`, `boundedMeasure`, `primaryAction`,
  `supportingProvenanceRegion`, `surfaceLevel`, `containerOwner`,
  `testedMinimumContentWidth`, `transformThresholds`, `collapseBehavior`,
  `intrinsicOverflowRegions`, `stickyBehavior`, `presentations`, and
  `contractHeading`; required text/arrays are nonempty except that
  `intrinsicOverflowRegions` may be empty, `testedMinimumContentWidth` is a
  positive integer CSS-pixel value, every transform-threshold row has exactly
  `{name,minCssPx,rationale}` with a positive integer width, and
  `presentations` has the exact six nonempty-string keys above.
- `representative-state-matrix.json`: `{schemaVersion, states}`. Each state row
  has exactly `id`, `archetypeId`, `routeId`, `legalState`, `fixtureId`,
  `publicPrecommitOnly` (literal `true`), `answerBearing` (literal `false`),
  `requiredRegions`, and `expectedRecovery`; IDs and fixture IDs are unique,
  and both arrays are nonempty.
- `prototype-review-matrix.json`: `{schemaVersion, artifactSha256,
  reviewRows}`. Each row has exactly `stateId`, `modeId`, `reviewer`,
  `reviewedAt`, `pageHorizontalOverflow` (boolean), `intrinsicOverflowRegions`
  (array), `minimumPrimaryTargetCssPx` (number), `readingOrder` (`pass` or
  `fail`), `focusAndAnnouncement` (`pass` or `fail`), `disposition` (`pass` or
  `open`), and `openCoordinate` (null for `pass`, otherwise a
  `docs/OPEN.md#...` anchor). `artifactSha256` must equal the computed lowercase
  SHA-256 of `prototype/prototype-manifest.json`.
- `migration-map.json`: `{schemaVersion, tranches, assignments}`. Each tranche
  has exactly `id`, `order`, `currentFiles`, `routeFamilyNumbers`,
  `prerequisiteFixtures`, `foundationIds`, `selectorContracts`, `legalStates`,
  `parityRequirement`, `focusAnnouncementBehavior`, `presentationCases`,
  `answerLeakAndClosureChecks`, `removalCriteria`, and `stopBoundary`.
  `assignments` rows have exactly `inventoryId`, `kind` (`unmatched-selector` or
  `undefined-token`), `name`, and `trancheId`.
- `decision-record.json`: `{schemaVersion, artifactVersion, submittedAt,
  artifactHashes, decisionOwner, approvalComment, decisions}`. `artifactHashes` has exactly the
  keys `sourceInventory`, `foundationContractMatrix`, `routeArchetypeMatrix`,
  `representativeStateMatrix`, `prototypeReviewMatrix`, `migrationMap`, and
  `prototypeManifest`, each with the lowercase SHA-256 of the corresponding
  artifact bytes. `decisionOwner` has nonempty `name`, `githubHandle`, `role`, and
  `approvalChannel`, with a real `@handle` and literal channel
  `github-pr-comment`. `approvalComment` has exactly `url`, `createdAt`,
  `updatedAt`, and `bodySha256`; the timestamps must be equal (an edited comment
  is stale evidence), and the lowercase SHA-256 must match the exact fetched
  comment body. Each decision has exactly `id`, `status`,
  `decidedByName`, `decidedByHandle`, `decidedAt`, `approvalUrl`, `rationale`,
  `evidenceIds`, and `openCoordinate`; `status` is `accepted`, `rejected`, or
  `deferred`, the approver must equal the named decision owner, and
  `approvalUrl` must equal `approvalComment.url`, the exact GitHub draft-PR
  comment URL. `rationale` is one nonempty line with no tab character and
  `evidenceIds` is a nonempty unique string array. Accepted rows use
  null `openCoordinate`; rejected/deferred rows use a `docs/OPEN.md#...` anchor.

`verify-artifacts.mjs` must compute the schema and cross-file checks directly;
it must not rewrite, normalize, or fill defaults into research evidence.

## Steps

### Step 1: Establish the research branch, record, and complete inventory

Before extended inventory work, perform the Git workflow and preconditions
above. Set the two task-specific variables once; every later command uses these
exact values:

```sh
UI007_REPO_ROOT="$(git rev-parse --show-toplevel)"
UI007_SCRATCH="$(mktemp -d /tmp/nycustodian-ui-foundations-007.XXXXXX)"
test -d "$UI007_SCRATCH"
```

Create
`research/ui-ux/ui-foundations-contract-2026-08-26.md` with these headings,
marking decisions `pending` where evidence is not complete:

- `## Status and scope`
- `## Source coordinates`
- `## Method`
- `## Inventory closure`
- `## Foundation decisions`
- `## Route archetype decisions`
- `## Migration`
- `## Limitations`
- `## Source ledger`

The initial record contains exactly one `**Status:** pending` line immediately
below its title. Step 7 changes that same line to `**Status:** accepted`; no
second status label is added.

The tracked parent does not exist at the planning baseline. Run
`mkdir -p research/ui-ux`, then create the record with `apply_patch`. Keep the
resolved `UI007_REPO_ROOT` and `UI007_SCRATCH` only in the executor's shell or
untracked operator notes; an environment-specific path that will be deleted is
not a source coordinate. Record the execution base, three dependency
coordinates and branch name immediately. Use the exact line `- Draft PR:
pending until branch push` for the draft-PR coordinate in the initial commit;
after `gh pr create`,
replace it with the canonical PR URL using `apply_patch`, commit, and push that
coordinate before inventory work. Use only the resolved scratch path for raw
inventories, screenshots, and prototype files.

Add the active investigation and canonical consumers to `research/README.md`.
Commit and push this truthful initial record and open the draft PR before the
extended inventory and prototype work. Do not claim inventory closure or
approval in the initial commit.

```sh
git add research/README.md research/ui-ux/ui-foundations-contract-2026-08-26.md
git diff --cached --check
git commit -m "Start UI foundation contract research"
git push -u origin codex/uiux-foundation-contract
gh pr create --draft --base main --head codex/uiux-foundation-contract --title "Specify shared UI foundation contracts" --body "Research-only UI foundation, state, responsive, and migration contract. Production source remains read-only."
test "$(gh pr view codex/uiux-foundation-contract --json isDraft,headRefName,baseRefName --jq '.isDraft == true and .headRefName == "codex/uiux-foundation-contract" and .baseRefName == "main"')" = "true"
test "$(gh pr view codex/uiux-foundation-contract --json headRefOid --jq .headRefOid)" = "$(git rev-parse HEAD)"
```

Expected: both PR-state and head-SHA checks exit 0. Get the canonical PR URL with
`gh pr view codex/uiux-foundation-contract --json url --jq .url`; a search
result or branch URL is not an approval coordinate. Use `apply_patch` to replace
the literal pending coordinate with exactly that URL, then run:

```sh
test "$(rg -Fxc -- "- Draft PR: $(gh pr view codex/uiux-foundation-contract --json url --jq .url)" research/ui-ux/ui-foundations-contract-2026-08-26.md)" -eq 1
git add research/ui-ux/ui-foundations-contract-2026-08-26.md
git diff --cached --check
git commit -m "Record UI foundation research coordinates"
git push origin codex/uiux-foundation-contract
```

Expected: every command exits 0. Only then begin the extended inventory.

Read all static page templates and every React island. Produce temporary
machine-readable inventories under the resolved scratch root with
these fields:

- route family and route ID;
- legal state from `product/SCREEN_STATES.md`;
- static or React owner and source `file:line`;
- rendered element and class/data attribute;
- matching selector and token owner, or `unmatched`;
- semantic foundation target;
- current accessibility responsibilities;
- proposed disposition: keep, rename, consolidate, replace, or remove; and
- affected compact, ample, large-text, forced-color, reduced-motion, and print
  presentations.

At minimum, cover all 21 route families and every foundation listed in
`product/COMPONENT_ARCHITECTURE.md:129-143`. Do not infer a class's semantics
from its name alone; open the rendering code and its legal states.

Useful inventory checks:

```sh
rg -n 'class(Name)?=' apps/site/src apps/site/scripts/generate-pages.tsx
rg -n '^\s*[.#][a-zA-Z]' apps/site/src/styles.css
rg -n 'var\(--[a-z0-9-]+\)' apps/site/src/styles.css
rg -n '@container|container-type|@media' apps/site/src/styles.css
```

The exact route-family key set is the integers 1 through 21 from
`product/ROUTES.md`. The exact foundation key set is:

```text
document-shell
page-header
layout-primitives
prose-lists
action-controls
form-controls
action-bar
feedback-page-states
live-region
progress-position
disclosure-dialog
figure-image-viewport
visually-hidden
```

`verify-artifacts.mjs inventory` must compare set equality, not just counts: the
distinct inventory route-family numbers must equal `[1,...,21]`; the union of
`foundationIds` must equal the 13 IDs above; every rendered hook discovered by
the source scans must occur in at least one inventory row; no inventory row may
contain `unclassified`; and every `unmatched` selector and undefined token must
have a stable inventory ID for the migration map.

**Verify**: create the exact inventory and validator files described above,
then run the executable gate. Record counts, representative mismatches, method,
and exact source coordinates in the concise research record and draft PR; do
not commit raw command output. The branch is
`codex/uiux-foundation-contract`, its remote draft PR targets `main`, and the
research record contains all nine required headings.

```sh
git branch --show-current
bun "$UI007_SCRATCH/verify-artifacts.mjs" inventory --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH"
test "$(rg -Fxc '**Status:** pending' research/ui-ux/ui-foundations-contract-2026-08-26.md)" -eq 1
for heading in 'Status and scope' 'Source coordinates' 'Method' 'Inventory closure' 'Foundation decisions' 'Route archetype decisions' 'Migration' 'Limitations' 'Source ledger'; do test "$(rg -Fxc "## $heading" research/ui-ux/ui-foundations-contract-2026-08-26.md)" -eq 1 || exit 1; done
test "$(gh pr view codex/uiux-foundation-contract --json isDraft,headRefName,baseRefName --jq '.isDraft == true and .headRefName == "codex/uiux-foundation-contract" and .baseRefName == "main"')" = "true"
```

Expected: the branch command prints `codex/uiux-foundation-contract`, the
validator prints `ui007 inventory: PASS`, every heading count test exits 0, and
the PR-state assertion exits 0.

### Step 2: Specify the canonical foundation anatomy and DOM/style contract

Expand `product/COMPONENT_ARCHITECTURE.md` with an implementation-facing anatomy
for each recurring foundation. Each entry must name:

- purpose and non-purpose;
- semantic HTML structure and accessible relationships;
- static-template and React-leaf ownership;
- legal named variants and states;
- required content slots expressed through children/composition;
- state/actions/meta responsibilities where interactive;
- class/data-attribute contract and selector owner;
- focus, announcement, error, disabled/busy, offline, and recovery behavior;
- constrained, ample, large-text, forced-color, reduced-motion, and print rules;
- one existing source location to migrate; and
- one counterexample that must not be generalized.

Prioritize `DocumentShell`, `PageHeader`, layout primitives, `Button`/`Link`,
fields and choices, `ActionBar`, `StatusMessage`, `ErrorSummary`, `Notice`,
`EmptyState`, `PageState`, `Disclosure`, `Figure`, and `ImageViewport`.

Do not prescribe a React wrapper for native static HTML. Define equivalent DOM
and class contracts so the generator and islands can share presentation without
sharing a renderer.

Put the new normative section between the unique comments
`<!-- ui007:foundations:start -->` and `<!-- ui007:foundations:end -->`. It must
contain each of these exact level-three headings once, with its matching matrix
ID:

| Required heading | Matrix ID | Exact `members` set |
|---|---|---|
| `### Foundation: DocumentShell` | `document-shell` | `DocumentShell` |
| `### Foundation: PageHeader` | `page-header` | `PageHeader` |
| `### Foundation: Layout primitives` | `layout-primitives` | `Stack`, `Cluster`, `Grid`, `Split`, `Sidebar` |
| `### Foundation: Prose and semantic lists` | `prose-lists` | `Prose`, `DefinitionList`, `MetadataList` |
| `### Foundation: Action controls` | `action-controls` | `Button`, `Link`, `IconButton` |
| `### Foundation: Form controls` | `form-controls` | `Field`, `ChoiceGroup`, `CheckboxField`, `SelectField` |
| `### Foundation: ActionBar` | `action-bar` | `ActionBar` |
| `### Foundation: Feedback and page states` | `feedback-page-states` | `StatusMessage`, `ErrorSummary`, `Notice`, `EmptyState`, `PageState` |
| `### Foundation: LiveRegion` | `live-region` | `LiveRegion` |
| `### Foundation: Progress and position` | `progress-position` | `ProgressMeter`, `PositionLabel` |
| `### Foundation: Disclosure and Dialog` | `disclosure-dialog` | `Disclosure`, `Dialog` |
| `### Foundation: Figure and ImageViewport` | `figure-image-viewport` | `Figure`, `ImageViewport` |
| `### Foundation: VisuallyHidden` | `visually-hidden` | `VisuallyHidden` |

The validator must extract only the text between those markers, require both
markers once and in order, require exact set equality for the 13 headings and
matrix IDs/member sets, and require every matrix `contractHeading` to resolve once inside
that bounded section. It must also scan proposed API syntax in the bounded
section. A property matching
`(is|has|show|enable|disable|use)[A-Z]*: boolean`, any of the known mode flags
below, or `render[A-Z]*:` is a hard failure; documenting the rejected spelling
in prose is permitted only outside the bounded contract section. State belongs
in named variants/snapshots, and structure belongs in children/compounds.

**Verify**:

```sh
bun "$UI007_SCRATCH/verify-artifacts.mjs" foundations --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH"
for heading in 'DocumentShell' 'PageHeader' 'Layout primitives' 'Prose and semantic lists' 'Action controls' 'Form controls' 'ActionBar' 'Feedback and page states' 'LiveRegion' 'Progress and position' 'Disclosure and Dialog' 'Figure and ImageViewport' 'VisuallyHidden'; do test "$(rg -Fxc "### Foundation: $heading" product/COMPONENT_ARCHITECTURE.md)" -eq 1 || exit 1; done
sed -n '/<!-- ui007:foundations:start -->/,/<!-- ui007:foundations:end -->/p' product/COMPONENT_ARCHITECTURE.md | if rg -n '\b(is|has|show|enable|disable|use)[A-Z][A-Za-z0-9_]*\??[[:space:]]*:[[:space:]]*boolean\b|\b(isPractice|isReview|isSimulation|isVisual|showFeedback|showSources)\??[[:space:]]*:|\brender[A-Z][A-Za-z0-9_]*\??[[:space:]]*:'; then exit 1; else exit 0; fi
```

Expected: the validator prints `ui007 foundations: PASS`, all 13 heading checks
exit 0, and the forbidden-prop scan prints nothing and exits 0. The gate must
fail if even one required foundation is missing; one alternation-regex match is
not evidence of closure.

### Step 3: Define route archetypes and component-responsive transformations

Update `product/DESIGN_SYSTEM.md` without creating a competing taxonomy. Use the
seven selected Plan 006 archetypes and exact route mapping:

1. orientation;
2. study launcher;
3. browse/reference;
4. focused task;
5. review/results;
6. utility; and
7. recovery.

Within those archetypes, specify distinct family compositions where their
content and state responsibilities genuinely differ—for example question,
review, visual hazard, nonvisual hazard, simulation, print, loading, empty, and
terminal presentations. These are compositions inside the selected archetypes,
not eight new route categories.

For each archetype specify DOM reading order, bounded measure, primary action,
supporting/provenance region, surface/elevation levels inherited from Plan 006,
container owner, tested minimum content widths, collapse behavior, intrinsic
overflow exceptions, sticky behavior, and print behavior.

The reference thresholds are hypotheses, not device breakpoints. Prototype with
real long titles, long answer choices, visible status/error text, 125% built-in
large text, and a 320 CSS-pixel viewport. Raise a threshold when real content
requires it; never lower one merely to create a two-column desktop layout.

Put the normative route section between the unique comments
`<!-- ui007:route-archetypes:start -->` and
`<!-- ui007:route-archetypes:end -->`. It contains exactly these seven headings
and matrix IDs: `### Route archetype: Orientation` / `orientation`, `Study
launcher` / `study-launcher`, `Browse/reference` / `browse-reference`, `Focused
task` / `focused-task`, `Review/results` / `review-results`, `Utility` /
`utility`, and `Recovery` / `recovery`.

The accepted Plan 006 mapping must be copied without reinterpretation. The
validator requires this exact one-time partition of stable route IDs:

- `orientation`: `home`, `exam-selector`, `exam-checker`, `profile`,
  `scoring-explainer`, `actual-questions-explainer`, `about`, and
  `nyc-disambiguation`; route-family numbers `1, 2, 3, 4`;
- `study-launcher`: `study-hub`, `hazards-index`, `simulation-setup`, and
  `print-center`; route-family numbers `5, 12, 14, 15`;
- `browse-reference`: `atlas-index`, `atlas-family`, `atlas-tool`,
  `procedures-index`, `procedure-detail`, `repair-lab`, `faq`,
  `transparency-index`, `source`, `corrections`, `foil`, `security`, and
  `privacy`; route-family numbers `6, 7, 8, 9, 10, 16, 17`;
- `focused-task`: `question-player`, `hazard-player`, `review-player`, and
  `simulation-player`; route-family numbers `11, 12, 13, 14`;
- `review-results`: `review-queue`, `simulation-results`, and `print-preview`;
  route-family numbers `13, 14, 15`;
- `utility`: `settings`, `offline-packs`, and `correction-submit`; route-family
  numbers `18, 19, 20`; and
- `recovery`: `status`; route-family number `21`.

The union of `routeFamilyNumbers` must equal the integers 1 through 21; a family
number may appear in more than one archetype when its stable route IDs have
different jobs. `plan006Decision.commitSha` must be a full commit that is an
ancestor of the execution base, and the record path/anchor must exist at that
commit. Each archetype's `presentations` must contain exactly `constrained`,
`ample`, `largeText400`, `forcedColors`, `reducedMotion`, and `print`, and the
validator must find the matrix row's exact contract heading once inside the
bounded normative section.

**Verify**:

```sh
bun "$UI007_SCRATCH/verify-artifacts.mjs" archetypes --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH"
for heading in 'Orientation' 'Study launcher' 'Browse/reference' 'Focused task' 'Review/results' 'Utility' 'Recovery'; do test "$(rg -Fxc "### Route archetype: $heading" product/DESIGN_SYSTEM.md)" -eq 1 || exit 1; done
```

Expected: the validator prints `ui007 archetypes: PASS` and every heading test
exits 0. Only named image, scene, or relationship-preserving table regions may
permit two-dimensional overflow; the validator rejects a generic `page`,
`document`, `shell`, or `main` intrinsic-overflow region.

### Step 4: Prototype the foundation and responsive decisions without production edits

Create the exact temporary prototype tree in the resolved scratch root. The
seven files under `prototype/` are the only prototype source; screenshots go in
the sibling `screenshots/` directory. `prototype-manifest.json` has exactly
`schemaVersion`, `artifactVersion`, `entrypoint`, `stylesheet`, `script`,
`fixtures`, `host`, `port`, `contentPolicy`, `stateIds`, and `files`.
`schemaVersion` is 1; the four path fields name `index.html`, `styles.css`,
`prototype.mjs`, and `fixtures.mjs`; host/port are `127.0.0.1`/`4177`;
`contentPolicy` has exactly `publicPrecommitOnly: true`, `answerBearing: false`,
and a nonempty `sourceCoordinates` array; `stateIds` is the exact set below;
and `files` has one `{path,sha256}` row for each other prototype file. Hashes
are lowercase SHA-256 values computed from bytes, and paths may not escape the
prototype directory.

The prototype is non-answer-bearing and must exercise exactly these 30
representative state IDs (additional visual states require an explicit plan
amendment rather than silently changing the matrix denominator):

```text
global-shell-ready
focused-shell-ready
question-ready
question-committing
question-answered-revealed
question-recoverable-error
hazard-ready-visual
hazard-marking-visual
hazard-answered-revealed-visual
hazard-ready-nonvisual
hazard-answered-revealed-nonvisual
atlas-index-ready
atlas-family-comparison-ready
profile-progressive-evidence-ready
simulation-setup-ready
simulation-results-ready
settings-loading
settings-ready
settings-empty
settings-warning
settings-destructive-confirmation
settings-recoverable-error
offline-loading
offline-ready
offline-empty
offline-warning
offline-destructive-confirmation
offline-recoverable-error
print-preview-normal
print-preview-large-print
```

The state matrix must use this exact archetype, route, and legal
state/presentation projection; it may add detail inside `requiredRegions` and
`expectedRecovery`, but may not remap a state:

| State ID | Archetype | Route ID | Legal state / projection |
|---|---|---|---|
| `global-shell-ready` | `orientation` | `home` | `availability=ready; operation=idle` |
| `focused-shell-ready` | `focused-task` | `question-player` | `interaction=ready` |
| `question-ready` | `focused-task` | `question-player` | `interaction=ready` |
| `question-committing` | `focused-task` | `question-player` | `interaction=committing` |
| `question-answered-revealed` | `focused-task` | `question-player` | `interaction=answered-revealed` |
| `question-recoverable-error` | `focused-task` | `question-player` | `interaction=selected; operation=recoverable-error` |
| `hazard-ready-visual` | `focused-task` | `hazard-player` | `interaction=ready; visual-equivalent` |
| `hazard-marking-visual` | `focused-task` | `hazard-player` | `interaction=marking; visual-equivalent` |
| `hazard-answered-revealed-visual` | `focused-task` | `hazard-player` | `interaction=answered-revealed; visual-equivalent` |
| `hazard-ready-nonvisual` | `focused-task` | `hazard-player` | `interaction=ready; nonvisual-equivalent` |
| `hazard-answered-revealed-nonvisual` | `focused-task` | `hazard-player` | `interaction=answered-revealed; nonvisual-equivalent` |
| `atlas-index-ready` | `browse-reference` | `atlas-index` | `availability=ready` |
| `atlas-family-comparison-ready` | `browse-reference` | `atlas-family` | `availability=ready` |
| `profile-progressive-evidence-ready` | `orientation` | `profile` | `availability=ready; freshness=current` |
| `simulation-setup-ready` | `study-launcher` | `simulation-setup` | `interaction=setup` |
| `simulation-results-ready` | `review-results` | `simulation-results` | `interaction=results` |
| `settings-loading` | `utility` | `settings` | `operation=loading` |
| `settings-ready` | `utility` | `settings` | `availability=ready; operation=idle` |
| `settings-empty` | `utility` | `settings` | `availability=ready; zero optional local records` |
| `settings-warning` | `utility` | `settings` | `availability=ready; persistence=quota-limited` |
| `settings-destructive-confirmation` | `utility` | `settings` | `interaction=validated-preview` |
| `settings-recoverable-error` | `utility` | `settings` | `operation=recoverable-error` |
| `offline-loading` | `utility` | `offline-packs` | `interaction=downloading` |
| `offline-ready` | `utility` | `offline-packs` | `interaction=active` |
| `offline-empty` | `utility` | `offline-packs` | `interaction=absent` |
| `offline-warning` | `utility` | `offline-packs` | `interaction=retained` |
| `offline-destructive-confirmation` | `utility` | `offline-packs` | `interaction=active; remove-confirmation presentation` |
| `offline-recoverable-error` | `utility` | `offline-packs` | `operation=recoverable-error` |
| `print-preview-normal` | `review-results` | `print-preview` | `interaction=preview-ready; printMode=normal` |
| `print-preview-large-print` | `review-results` | `print-preview` | `interaction=preview-ready; printMode=large-print` |

Each ID appears exactly once in `representative-state-matrix.json`, resolves to
a fixture exported by `fixtures.mjs`, and renders through a URL of the form
`/?state=<id>`. The fixture module exports only inert reviewed public
precommit material or visibly fabricated neutral labels, plus stable IDs; it
does not import the application, content pack, generated pages, storage, or
network code. Together, those exact states exercise:

- global and focused-player shells;
- question ready, committing, revealed, and error states;
- visual hazard viewport, marker controls, feedback, and nonvisual equivalent;
- atlas index and tool comparison;
- profile/reference with progressive evidence;
- simulation setup and results;
- settings/offline loading, ready, empty, warning, destructive confirmation, and
  recoverable error; and
- print preview in normal and large-print modes.

Use only original public precommit material already safe on the current route,
or inert fabricated labels that cannot be confused with exam content. Never copy
postcommit answers into a precommit fixture. The prototype must use the selected
Plan 006 visual tokens and Plan 004 language rules.

`serve.mjs` exports a server factory and serves only the four manifest public
assets (`entrypoint`, `stylesheet`, `script`, and `fixtures`), rejects traversal,
adds `Cache-Control: no-store`, binds only to the manifest host/port, and
supports `--check` (hash-check every manifest file, start, fetch every public
asset, close, print the success line). `verify.mjs` imports Playwright and axe from exactly
`apps/site/node_modules/@playwright/test/index.mjs` and
`apps/site/node_modules/@axe-core/playwright/dist/index.mjs`, using the
`--repo` argument to resolve those paths. It starts and closes the exported
server itself, visits every state, verifies state/fixture closure, headings and
landmarks, tab reachability, no serious/critical axe finding, no answer-bearing
fixture marker, primary target size, page overflow, and writes no evidence
outside the scratch tree.

Capture a deterministic review matrix with these exact nine mode IDs:
`width-320`, `width-768`, `width-1024`, `width-1440`, `app-text-125`,
`forced-colors`, `reduced-motion`, `print`, and `manual-zoom-400`.
`prototype-review-matrix.json` contains the exact Cartesian product of the 30
state IDs and nine mode IDs: 270 uniquely keyed rows. Automated modes are
populated by `verify.mjs` as 240 rows; the 30 `manual-zoom-400` rows require a
named human reviewer and real observation before the artifact validator may
run. The validator rejects `pageHorizontalOverflow: true`, an
intrinsic-overflow name absent from the owning archetype, or a passing row with
a primary target below 44 CSS pixels, failed reading order, or failed
focus/announcement. An `open` row must point to a real `docs/OPEN.md` anchor and
cannot be presented as passing evidence. Screenshots are transient review
artifacts; conclusions and open coordinates belong in maintained documents.

Run the automated prototype gates first:

```sh
bun "$UI007_SCRATCH/prototype/serve.mjs" --check --host 127.0.0.1 --port 4177
bun "$UI007_SCRATCH/prototype/verify.mjs" --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH" --host 127.0.0.1 --port 4177
```

Expected output is, in order, `UI007 prototype server: PASS` and `UI007
prototype: 30 states; 240 automated review rows; PASS`. `verify.mjs` must replace
only the eight automated-mode rows for each state and must never fabricate,
overwrite, or count a `manual-zoom-400` row.

Next, run `bun "$UI007_SCRATCH/prototype/serve.mjs" --host 127.0.0.1 --port
4177` in a separate terminal for the attended review; never bind it to a public
interface. A named reviewer uses actual 400% browser zoom on every state, then
stops the server with Ctrl-C and uses `apply_patch` to add exactly the 30 manual
rows with their real observation, timestamp, disposition, and open coordinate.
Only after that review run:

```sh
bun "$UI007_SCRATCH/verify-artifacts.mjs" prototype --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH"
```

Expected: prints `ui007 prototype: PASS`; it rejects 240 rows, a fabricated
automated reviewer on manual rows, a duplicate key, or any total other than
270.

**Verify**: all three gates above exit 0, the exact 30-by-9 matrix is complete,
and every row has a disposition. Any open row remains an explicit linked open
item; do not edit production CSS to make the prototype pass.

### Step 5: Define the implementation migration and verification map

Add a migration section to `product/COMPONENT_ARCHITECTURE.md` that a future
implementation planner can split safely. For every migration tranche name:

- exact current files and route families;
- prerequisite characterization/browser fixtures;
- foundation and selector contract to introduce;
- static fallback and React-island parity requirement;
- legal states and focus/announcement behavior to preserve;
- responsive/forced-color/print cases to add;
- answer-leak and route-closure checks; and
- removal criteria for old classes after all consumers migrate.

Recommended tranche order:

1. token/class validation and state fixtures;
2. buttons, fields, actions, status/error/empty foundations;
3. shell and navigation compositions;
4. question and review players;
5. hazard and simulation shared viewport patterns;
6. atlas/reference routes;
7. settings, offline, correction, and print; then
8. obsolete selector removal and full visual regression.

Use these exact tranche IDs and orders in `migration-map.json`:

| Order | Tranche ID |
|---:|---|
| 1 | `characterization-and-validation` |
| 2 | `controls-and-feedback` |
| 3 | `shell-and-navigation` |
| 4 | `question-and-review` |
| 5 | `hazard-and-simulation` |
| 6 | `atlas-and-reference` |
| 7 | `utility-offline-correction-print` |
| 8 | `obsolete-selector-removal` |

`verify-artifacts.mjs migration` must derive the expected assignment keys from
`source-inventory.ndjson`, not from hand-entered totals. Every rendered hook
whose `selectorMatches` value is `unmatched` produces one
`unmatched-selector` key, and every token reference with status `undefined`
produces one `undefined-token` key. The assignments must equal that derived set
exactly and map every key to one and only one of the eight tranche IDs. It must
specifically fail if `status-panel`, `status-panel-danger`,
`status-panel-warning`, `error-panel`, `field-label`, `field-hint`, `text-input`,
any discovered `hazard-player__*` hook, `--shadow-card`, or `--text-lg` is
unassigned. Every `currentFiles` path must exist at the execution base; every
route-family number must be 1-21; every foundation ID must be in the 13-entry
set; every tranche must name at least one prerequisite fixture, presentation
case, answer-leak/closure check, removal criterion, and STOP boundary. Across
the exact tranche set, `prerequisiteFixtures` must also contain each of
`navigation-state-gating-characterization`,
`local-data-restoration-characterization`, and
`review-variant-characterization` exactly once.

Record the following correctness findings as prerequisites rather than hiding
them inside styling work: player navigation is not currently state-gated;
local-data islands can render false default/empty states during restoration; and
review routes currently mount practice variants. This plan must not prescribe a
visual workaround for those state defects.

**Verify**: every unmatched class and undefined token from Step 1 is assigned to
exactly one tranche, and every tranche names its characterization tests and STOP
boundary.

```sh
bun "$UI007_SCRATCH/verify-artifacts.mjs" migration --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH"
```

Expected: prints `ui007 migration: PASS`. A count-only match or an assignment
without the exact inventory ID/kind/name key fails.

### Step 6: Hold the product-contract decision checkpoint

Present the foundation inventory, route archetypes, prototype matrix, migration
order, and remaining disagreements to the maintainer. Explicitly ask for approval
of:

- component anatomy and naming;
- static/React DOM parity rules;
- surface hierarchy and responsive thresholds;
- migration order; and
- which unresolved correctness findings require separate implementation plans.

Before requesting the checkpoint, draft `decision-record.json` with one
named accountable person—not `maintainer`, `owner`, `team`, `TBD`, `unknown`,
or a placeholder—as `decisionOwner`. Lock the reviewed artifact version by
computing all seven hashes above. After the owner posts the decision, complete
the approval-comment and decision fields before running the validator.
`decisions` must have this exact ID set:

```text
component-anatomy-naming
static-react-dom-parity
surface-hierarchy-responsive-thresholds
migration-order
correctness-followup-plans
```

Post one dated draft-PR comment that names the artifact version and all seven
hashes, records accepted/rejected/deferred plus rationale for each of the five
IDs, and is authored by that GitHub decision owner. Set every row's
`approvalUrl` to that exact comment URL and its identity fields to that named
person. Rejected/deferred rows must link a concrete `docs/OPEN.md` anchor;
accepted rows must not. Any artifact change after that comment invalidates the
decision: increment `artifactVersion`, recompute all hashes, and obtain a new
decision comment rather than editing history or treating an old approval as
current. Use exact comment lines `artifactVersion: <value>`, `<artifact-hash
key>: <sha256>`, and `<decision-id>: <status> — <single-line rationale>` so the
approval is machine-checkable.

Do not mark the plan complete based on prototype appearance alone. If the
maintainer rejects or defers a foundation, record the reason in `docs/OPEN.md`
instead of silently choosing another implementation.

**Verify**: the draft PR contains a dated decision comment or linked maintainer
decision covering all five items. Record the accepted/rejected decisions and
their evidence coordinates in the concise research record. No production file
is modified. Run:

```sh
bun "$UI007_SCRATCH/verify-artifacts.mjs" decision --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH"
UI007_REPO_SLUG="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
UI007_PR_NUMBER="$(gh pr view codex/uiux-foundation-contract --json number --jq .number)"
UI007_DECISION_URL="$(jq -r '.approvalComment.url' "$UI007_SCRATCH/decision-record.json")"
UI007_DECIDER_LOGIN="$(jq -r '.decisionOwner.githubHandle | ltrimstr("@")' "$UI007_SCRATCH/decision-record.json")"
test "$(gh api "repos/$UI007_REPO_SLUG/issues/$UI007_PR_NUMBER/comments" --paginate --jq "[.[] | select(.html_url == \"$UI007_DECISION_URL\" and .user.login == \"$UI007_DECIDER_LOGIN\")] | length")" -eq 1
UI007_DECISION_COMMENT="$(gh api "repos/$UI007_REPO_SLUG/issues/$UI007_PR_NUMBER/comments" --paginate --jq ".[] | select(.html_url == \"$UI007_DECISION_URL\")")"
UI007_DECISION_CREATED_AT="$(printf '%s\n' "$UI007_DECISION_COMMENT" | jq -r .created_at)"
UI007_DECISION_UPDATED_AT="$(printf '%s\n' "$UI007_DECISION_COMMENT" | jq -r .updated_at)"
UI007_DECISION_BODY="$(printf '%s\n' "$UI007_DECISION_COMMENT" | jq -r .body)"
test "$UI007_DECISION_CREATED_AT" = "$UI007_DECISION_UPDATED_AT"
test "$UI007_DECISION_CREATED_AT" = "$(jq -r '.approvalComment.createdAt' "$UI007_SCRATCH/decision-record.json")"
test "$UI007_DECISION_UPDATED_AT" = "$(jq -r '.approvalComment.updatedAt' "$UI007_SCRATCH/decision-record.json")"
test "$(printf '%s' "$UI007_DECISION_BODY" | sha256sum | awk '{print $1}')" = "$(jq -r '.approvalComment.bodySha256' "$UI007_SCRATCH/decision-record.json")"
test "$(printf '%s\n' "$UI007_DECISION_BODY" | rg -Fxc "artifactVersion: $(jq -r '.artifactVersion' "$UI007_SCRATCH/decision-record.json")")" -eq 1
jq -r '.artifactHashes | to_entries[] | [.key,.value] | @tsv' "$UI007_SCRATCH/decision-record.json" | while IFS=$'\t' read -r hash_key hash_value; do test "$(printf '%s\n' "$UI007_DECISION_BODY" | rg -Fxc "$hash_key: $hash_value")" -eq 1 || exit 1; done
jq -r '.decisions[] | [.id,.status,.rationale] | @tsv' "$UI007_SCRATCH/decision-record.json" | while IFS=$'\t' read -r decision_id decision_status decision_rationale; do test "$(printf '%s\n' "$UI007_DECISION_BODY" | rg -Fxc "$decision_id: $decision_status — $decision_rationale")" -eq 1 || exit 1; done
```

Expected: the validator prints `ui007 decision: PASS`; exactly one comment by
the named GitHub identity matches; its unedited timestamps and body hash match;
and its artifact version, every hash, status, ID, and rationale match the local
record. Copy the concrete person name, handle, timestamp, artifact version,
decision statuses, rationales, comment hash, and URL into the durable research
record.

The checkpoint validator may preserve a rejected/deferred row as truthful
evidence, but that is not completion. Before Step 7, require all five decisions
to be accepted:

```sh
jq -e '([.decisions[].id] | sort) == (["component-anatomy-naming","static-react-dom-parity","surface-hierarchy-responsive-thresholds","migration-order","correctness-followup-plans"] | sort) and all(.decisions[]; .status == "accepted" and .openCoordinate == null)' "$UI007_SCRATCH/decision-record.json"
```

Expected: prints `true`. Any rejected or deferred component, responsive, parity,
migration, or correctness-follow-up decision is a product-contract blocker: do
not promote the contracts, set the research record to `accepted`, or mark Plan
007 `DONE`. Leave the draft PR truthful and report the decision needed.

### Step 7: Reconcile and verify the maintained contract

Promote accepted conclusions into `product/COMPONENT_ARCHITECTURE.md` and
`product/DESIGN_SYSTEM.md`; retain genuine unknowns in `docs/OPEN.md`. Finalize
`research/ui-ux/ui-foundations-contract-2026-08-26.md` with the immutable source
coordinates, method, inventory closure, representative evidence, decisions,
limitations, implementation migration, and source ledger. Add its accepted
entry and canonical consumers to `research/README.md`. Before deleting any
scratch evidence, run the all-artifact gate and copy its exact counts, seven
hashes, artifact version, approval identity/URL, and any open coordinates into
the concise research record. Do not copy raw review rows, screenshots,
prototype code, validator code, or an archive/receipt tree into the repository.

Using `apply_patch`, change only Plan 007's row in `plans/README.md` from `TODO`
to exactly `DONE — UI foundations, responsive archetypes, and migration
contract verified`. Do this only after all decisions and gates are complete;
the research record's own status must also be `accepted`, not `pending`.

The exact allowed repository path set for this plan is:

```text
docs/OPEN.md
plans/README.md
product/COMPONENT_ARCHITECTURE.md
product/DESIGN_SYSTEM.md
research/README.md
research/ui-ux/ui-foundations-contract-2026-08-26.md
```

`docs/OPEN.md` is optional when every decision is accepted; the other five
paths must change. Enforce this allowlist independently over committed changes
since the immutable base, the index, the unstaged worktree, and untracked files.
The following commands reject an unexpected path; merely inspecting a diff is
not sufficient.

**Verify**:

```sh
bun "$UI007_SCRATCH/verify-artifacts.mjs" all --repo "$UI007_REPO_ROOT" --scratch "$UI007_SCRATCH"
bun run verify
git diff --check
UI007_ALLOWED_RE='^(docs/OPEN\.md|plans/README\.md|product/COMPONENT_ARCHITECTURE\.md|product/DESIGN_SYSTEM\.md|research/README\.md|research/ui-ux/ui-foundations-contract-2026-08-26\.md)$'
git diff --name-only "$UI007_EXECUTION_BASE_SHA"...HEAD | awk -v allowed="$UI007_ALLOWED_RE" '$0 !~ allowed {print "unexpected committed path: " $0 > "/dev/stderr"; bad=1} END {exit bad}'
git diff --cached --name-only | awk -v allowed="$UI007_ALLOWED_RE" '$0 !~ allowed {print "unexpected indexed path: " $0 > "/dev/stderr"; bad=1} END {exit bad}'
git diff --name-only | awk -v allowed="$UI007_ALLOWED_RE" '$0 !~ allowed {print "unexpected worktree path: " $0 > "/dev/stderr"; bad=1} END {exit bad}'
git ls-files --others --exclude-standard | awk -v allowed="$UI007_ALLOWED_RE" '$0 !~ allowed {print "unexpected untracked path: " $0 > "/dev/stderr"; bad=1} END {exit bad}'
awk -F'|' '$2 ~ / 007 / {count++; gsub(/^ +| +$/, "", $7); if ($7 != "DONE — UI foundations, responsive archetypes, and migration contract verified") exit 1} END {exit count != 1}' plans/README.md
test "$(rg -Fxc '**Status:** accepted' research/ui-ux/ui-foundations-contract-2026-08-26.md)" -eq 1
```

Expected: the artifact validator prints `ui007 all: PASS`; repository
verification and diff hygiene exit 0; all four path checks print nothing; the
status-row check exits 0; and the research-status count is exactly `1`. If the
shell was restarted, restore `UI007_EXECUTION_BASE_SHA` by copying the exact
full SHA from `## Source coordinates`, then first prove it is a 40-character
commit and an ancestor of HEAD. Never execute a placeholder or compare against
moving `main`.

Stage the exact allowlist, inspect it, commit, and push without force:

```sh
git add docs/OPEN.md plans/README.md product/COMPONENT_ARCHITECTURE.md product/DESIGN_SYSTEM.md research/README.md research/ui-ux/ui-foundations-contract-2026-08-26.md
git diff --cached --check
git diff --cached --name-only | awk -v allowed="$UI007_ALLOWED_RE" '$0 !~ allowed {print "unexpected indexed path: " $0 > "/dev/stderr"; bad=1} END {exit bad}'
git commit -m "Specify shared UI foundation contracts"
git push origin codex/uiux-foundation-contract
```

After the push, enforce the final range, required-file, cleanliness, ancestry,
and remote-head checks. No local-only final commit or dirty status is allowed:

```sh
git merge-base --is-ancestor "$UI007_EXECUTION_BASE_SHA" HEAD
git diff --name-only "$UI007_EXECUTION_BASE_SHA"...HEAD | awk -v allowed="$UI007_ALLOWED_RE" '$0 !~ allowed {print "unexpected final path: " $0 > "/dev/stderr"; bad=1} END {exit bad}'
for required_path in plans/README.md product/COMPONENT_ARCHITECTURE.md product/DESIGN_SYSTEM.md research/README.md research/ui-ux/ui-foundations-contract-2026-08-26.md; do test -n "$(git diff --name-only "$UI007_EXECUTION_BASE_SHA"...HEAD -- "$required_path")" || exit 1; done
test -z "$(git status --porcelain)"
UI007_REMOTE_HEAD="$(git ls-remote --heads origin refs/heads/codex/uiux-foundation-contract | awk '{print $1}')"
test "${#UI007_REMOTE_HEAD}" -eq 40
test "$(git rev-parse HEAD)" = "$UI007_REMOTE_HEAD"
test "$(gh pr view codex/uiux-foundation-contract --json isDraft,headRefName,baseRefName --jq '.isDraft == true and .headRefName == "codex/uiux-foundation-contract" and .baseRefName == "main"')" = "true"
test "$(gh pr view codex/uiux-foundation-contract --json headRefOid --jq .headRefOid)" = "$UI007_REMOTE_HEAD"
```

Expected: every command, including both PR assertions, exits 0. Only then
validate that `UI007_SCRATCH` matches
`/tmp/nycustodian-ui-foundations-007.*`, remove that one scratch directory, and
leave no research prototype running. The deletion is local and unrecoverable;
do not broaden the path or use an unresolved variable.

```sh
case "$UI007_SCRATCH" in /tmp/nycustodian-ui-foundations-007.??????) ;; *) exit 1 ;; esac
test -d "$UI007_SCRATCH"
rm -rf -- "$UI007_SCRATCH"
test ! -e "$UI007_SCRATCH"
```

## Test plan

This plan specifies tests; it does not add production or browser-test code.

- Use the current question fixture structure in
  `apps/site/browser-tests/question-player-fixtures.ts` as the model for the
  future deterministic route-state fixture contract.
- Require future implementation tests for every applicable route-family state,
  not just the question ready/revealed states currently covered by
  `apps/site/browser-tests/accessibility-and-presentation.pw.ts`.
- Require screenshot assertions at representative constrained and ample widths,
  but keep independent DOM, keyboard, focus, announcement, storage, route
  closure, answer-leak, forced-color, reduced-motion, and print assertions.
- Include threshold-boundary cases immediately below and above each selected
  container transformation.
- Include 320px plus large text and a manual real 400% browser-zoom matrix.
- Include all loading/empty/error/restoring states so a false default or empty
  projection cannot become a visual baseline.

## Done criteria

All conditions must hold:

- [ ] Plans 004, 005, and 006 are DONE and their accepted decisions are inlined.
- [ ] A verified inventory maps every rendered class, selector, token reference,
      route family, legal state, and documented foundation.
- [ ] The temporary artifacts use the exact schemas and required ID sets, and
      `verify-artifacts.mjs all` prints `ui007 all: PASS`.
- [ ] Every recurring foundation has explicit semantic anatomy, variants,
      ownership, accessibility responsibilities, and a DOM/style contract.
- [ ] No proposed component API uses mode booleans or `renderX` props where
      explicit composition is required.
- [ ] All seven selected route archetypes define constrained, ample,
      large-text/400%,
      forced-color, reduced-motion, and print behavior.
- [ ] A non-answer-bearing temporary prototype covers every representative state
      listed in Step 4 and has the exact 30-state by 9-mode, 270-row completed
      review matrix.
- [ ] Every current unmatched class and undefined token is assigned to one
      migration tranche with exact files and future tests.
- [ ] Correctness/state defects are named prerequisites, not styled around.
- [ ] The concise research record contains immutable coordinates, representative
      evidence, decision rationale, limitations, migration, and a source ledger;
      `research/README.md` maps it to the canonical product consumers.
- [ ] The concrete named decision owner accepted all five hashed
      product-contract choices in the verified draft-PR comment; no rejected or
      deferred core decision is treated as completion.
- [ ] `bun run verify` and `git diff --check` exit 0.
- [ ] The exact path allowlist passes for committed, indexed, unstaged, and
      untracked changes; all five required paths changed and no other path did.
- [ ] `plans/README.md` contains the exact Plan 007 `DONE` status.
- [ ] The final commit is pushed without force, the worktree is clean, the
      execution base is an ancestor, and local HEAD equals the remote branch
      head.

## STOP conditions

Stop and report rather than improvising if:

- any dependency plan is not accepted and merged;
- the current implementation or maintained contracts contain unexplained or
  unreconciled semantic drift that invalidates the excerpts, dependencies, or
  research scope above;
- a proposed foundation requires changing a route ID, legal state, persistence
  rule, reveal boundary, exam fact, or accepted image bytes;
- static HTML would have to import React, or a new shared UI package/SPA router
  appears necessary;
- a prototype would load answer-bearing postcommit data before commitment;
- external participant recruitment, contact, compensation, recording, hosting,
  or deployment would be required without explicit authorization;
- the selected visual system cannot meet forced-color, reflow, print, or target
  constraints without a product-level tradeoff; or
- any verification gate fails twice after a reasonable correction.

## Maintenance notes

- Treat the class/selector map as a migration aid, not a permanent duplicate of
  source. After implementation, automated coverage should own drift detection.
- Reviewers should reject visual variants that encode illegal application states
  or hide required uncertainty, recovery, or evidence information.
- A future implementation should migrate one route family at a time behind
  characterization tests; a global CSS replacement would be hard to review and
  easy to regress.
- The composition-pattern guidance influenced this plan's explicit variants,
  state/actions/meta provider boundary, children composition, and React 19 API
  requirements. Those match the repository's maintained architecture rather
  than introducing a new component-library doctrine.
