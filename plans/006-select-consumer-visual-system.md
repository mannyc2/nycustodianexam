# Plan 006: Select and codify a consumer visual system

## Status

- **Execution protocol**: `CODEX-ONLY-UIUX-V1`
- **Status**: IN PROGRESS — every source, subject, receipt, browser run,
  review, task, and decision bound to `82d5be8a50fdafd38e5a34ffa965f48e3ea949cf`,
  `7fcc776e6941c7f41a504dda59ea59af88ba31fb`,
  `7712c8eef15f4f975ca78cfb88c763f391a5fb5a`,
  `f1a566f3eabb5bc972d75a555038e3b315a211a2`,
  `a9aa490f493b50231304d541a1a1c73d2cf7db65`,
  `58275cab4ae1a22b148831ba454f994cc644cd31`,
  `882e49bb9bbb9963b5b6497c88a87aa38b1fb0a9`, or
  `8a106b256e4a083d69dd90a0b5bac1fa42e1b70e` is invalid and non-reusable;
  no territory is selected
- **Priority / effort / risk**: P1 / L / MED
- **Category**: research and product-contract direction, not production implementation
- **Accepted dependency subject**: `4130693dee6caaa804a116f490b2192861f53e6e`
- **Accepted dependency merge on `origin/main`**: `d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1`
- **Accepted consumer-language input**: `product/CONTENT_DESIGN.md`, SHA-256 `91061006ffd60984b30bc9f7e7413d32ce3e57541260c71c932979eb7e4cd390`
- **Accepted navigation input**: `product/ROUTES.md`, SHA-256 `501230759f15e6ccd13e1a49d24db1e3ee94d7a52e80634490c7ff7b08c24e98`
- **Canonical consumer**: `product/DESIGN_SYSTEM.md`

This is the complete active Plan 006 contract. The earlier fieldwork,
participant, authorization, approval, finalist, and owner-selection protocol is
superseded and remains recoverable from Git history. It is not an alternate
completion path.

## Evidence boundary

The program is Codex-only:

```text
reviewMode=codex-only
humanEvidence=none
humanParticipantCount=0
humanReviewRequired=false
notHumanUsabilityTested=true
```

Codex agents, automated checks, route simulations, benchmark observations, and
corpus inspection are nonhuman evidence. They are never participant evidence,
user research, behavior evidence, a preference survey, a comprehension study,
or a usability test. No outreach, external hosting, deployment, or sign-off is
part of this plan.

## Exact-subject lifecycle

Plan 006 uses one hard-cutover workflow; there is no fallback to the rejected
subject or its receipts:

1. Commit the repaired prototype, token map, asset proof, benchmark record,
   prompt templates, browser harness, receipt extractor, schema, Plan 006
   contract, and terminal validator as one clean harness-source commit. The
   exact source closure is enumerated by path, byte length, and SHA-256 in the
   browser receipt. No browser receipt, terminal manifest/report, task receipt,
   or review output may exist in that source tree.
2. Run the browser capture only from that clean exact source commit. Commit the
   generated browser receipt in a selection-neutral review-subject commit whose
   sole parent is the source SHA and whose complete source-to-subject diff is
   exactly `A research/ui-ux/consumer-visual-system/browser-receipt.json`. The
   subject contains no final review files, terminal manifest/report, canonical
   promotion, or terminal result claim.
3. Launch three fresh Codex review tasks in the pinned fresh cohort topology
   against that exact review-subject SHA. Operationally, root does not
   intentionally relay one lane's output to another; the available local event stream does not expose
   a first-sharing timestamp, so this sequencing policy is not proof of
   cross-output non-observability.
4. If any candidate, harness, prompt, browser, asset, or source byte needs repair,
   invalidate the subject and all outputs, then repeat from step 1.
5. Only an unchanged clean subject may receive the explicit terminal output and
   status path set: normalized review files, safe task-receipt summaries,
   evidence manifest, report, plan/index status, and any permitted visual-only
   canonical promotion. Every candidate, prompt, asset proof, benchmark,
   harness, schema, and validator byte from the subject remains immutable at
   terminal HEAD.

The terminal validator runs only from a clean commit and derives that commit
from Git. It requires the fixed base
`d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1` for source, subject,
prompt rendering, and terminal verification; a caller-supplied base is allowed
only in an explicitly diagnostic phase. A manifest cannot truthfully contain
its own commit SHA; instead, every described byte must equal `HEAD:path`, and
the immutable pre-review subject SHA is recorded explicitly in every task and
review join. Exact parent, exact diff, source-cleanliness, forbidden-source-
output, immutable-input, and terminal-path closure are fail-closed invariants,
not ancestry-only checks.

## Fixed inputs and unresolved decisions

Consume only the exact accepted Step 2 closures `CL-CODEX-1` and
`NAV-CODEX-1`. Copy, navigation, facts, actions, legal state, route identity,
and asset selection stay identical across A/B/C. Do not use recovered CL-1
prototype copy or agent score magnitudes as product authority.

The following Step 2 decisions remain unresolved and cannot be promoted by a
visual-system comparison:

1. `NAV-SHELL-BOUNDARY`
2. `UNRESOLVED-SHORTEST-PRACTICE-PRIMARY`
3. `UNRESOLVED-HOME-PRIMARY-CTA`
4. `UNRESOLVED-EXACT-NAV-LABELS-GROUPING`
5. `UNRESOLVED-D1-VS-D2`
6. `UNRESOLVED-PRACTICE-TIMING`
7. `UNRESOLVED-SOURCE-PROMINENCE`

Any needed choice is one explicitly labeled, noncanonical comparison fixture
shared by A/B/C. Exactly `question-player`, `hazard-player`, `review-player`,
and `simulation-player` use the accepted focused-player shell. The comparison
must not generalize a universal shell contract for every other route.

The promoted contract is closed-schema and visual-only. It may contain token
roles plus typography, color distribution, spacing, surfaces, borders/elevation,
route-local composition, image framing, visual action treatment, and data
density. It may not contain a Home CTA choice, collapsed-source default,
navigation presence/labels/grouping, practice timing, source prominence, D1/D2
choice, or any value for another unresolved Step 2 decision. All seven IDs stay
present as `unresolved-excluded`, and every shared fixture records
`status=noncanonical-comparison-fixture` and `promotable=false`.

## Route registry and representative comparison matrix

The accepted registry groups 36 route IDs into seven archetypes:

| Archetype | Route IDs |
|---|---|
| Orientation | `home`, `exam-selector`, `exam-checker`, `profile`, `scoring-explainer`, `actual-questions-explainer`, `about`, `nyc-disambiguation` |
| Study launcher | `study-hub`, `hazards-index`, `simulation-setup`, `print-center` |
| Browse/reference | `atlas-index`, `atlas-family`, `atlas-tool`, `procedures-index`, `procedure-detail`, `repair-lab`, `faq`, `transparency-index`, `source`, `corrections`, `foil`, `security`, `privacy` |
| Focused task | `question-player`, `hazard-player`, `review-player`, `simulation-player` |
| Review/results | `review-queue`, `simulation-results`, `print-preview` |
| Utility | `settings`, `offline-packs`, `correction-submit` |
| Recovery | `status`, plus representative 404/410/5xx document states |

The committed comparison is a representative visual comparison, not exhaustive
route or legal-state validation. It contains 12 shared frames across exactly 10
route IDs (`home`, `study-hub`, `atlas-tool`, `atlas-family`,
`question-player`, `hazard-player`, `review-queue`, `offline-packs`,
`correction-submit`, and `status`), at least one populated frame for every
archetype, and 36 territory/frame render combinations. It exercises the two
Home-action fixtures, ready/prerequisite study states, tool and comparison
reference, question and hazard precommit states, successful empty review,
offline material, dormant correction draft, and one explicitly synthetic
recovery fixture. Synthetic fixtures are noncanonical interface-state examples,
not runtime observations or proof for an unrendered registry route.

Legal-state closure remains deferred. In particular, this comparison does not
validate hazard asset unavailable, region unavailable, version mismatch, or
commit-failure/preservation states, nor recovery 404, withdrawn/410, invalid
publication, storage unavailable, or service failure states. Those omissions
must remain explicit in the manifest, report, and final limitation text.

```text
coverageClassification=representative-visual-comparison-not-exhaustive-legal-state-validation
registryRouteIdCount=36
representedRouteIdCount=10
representativeFrameCount=12
deferredHazardVariants=asset-unavailable,region-required,version-mismatch,commit-failure-preservation
deferredRecoveryVariants=not-found-404,withdrawn-410,invalid-publication,storage-unavailable,service-failure
printEvidenceClassification=immutable-review-queue-empty-only
printEvidenceCaseCount=9
printEvidenceFrameIds=review-queue-empty
printEvidenceTerritoryIds=A,B,C
printEvidenceBrowserProjects=chromium,firefox,webkit
```

## Accepted-asset boundary

Audit every accepted release row: 65 tools, 14 comparisons, and 18 scenes. Use
only immutable delivery derivatives and preserve the release ledger's stable ID,
opaque ID, revision, hashes, review coordinates, rights statement, and any
publication/scored-use gate.

For every one of the 97 rows, terminal proof recomputes the phone and print path,
byte length, SHA-256, pixel dimensions, release-ledger path and digest, release
coordinate, review coordinate and record digest, rights coordinates and record
digest, and the complete gate value. The three prototype images are additionally
bound to their exact accepted delivery bytes and stable render coordinates.

Consumer prototypes may use only accepted derivatives. They may not load or
expose candidates, masters, review/contact sheets, regions, overlays,
postcommit content, or answer-bearing data. Images use intrinsic proportions,
`object-fit: contain`, no crop, no recolor, no filter, no mask, no blend, and no
pixel mutation. A scene appears only inside its neutral pre-answer hazard frame.
Specialist-gated rows remain gated.

The old attached archive is provenance-only. It is not a design constraint.
No archive or archive byte is committed, copied, published, or exposed. The
historical prework packet retains only its logical source ID, byte length,
archive hash, text ledger, scanned-entry markers, unknown rights, and the
recorded do-not-execute dynamic-code capability. Ordinary validation never
requires or infers a host attachment path.

`historicalPreworkDisposition=frozen-snapshot-only`
`historicalPreworkCommit=74c6799fbcef587e44c5c5f3854258db516a9aaa`

The prework packet and its validator preserve the earlier snapshot for audit;
they are not an active dependency, review protocol, selection path, or alternate
Plan 006 completion contract.

## Benchmark boundary

Record exactly 12 current direct sources, three in each category:

- exam preparation;
- public-service reference;
- practical visual learning; and
- no-account/offline education.

Each row records its direct URL, observation date, access result/limitation,
short original observations, applicability, and anti-copy boundary. Benchmark
rows are analogies and interface observations, not learner evidence or claims
that every source shares this product's account/offline model. Do not commit
third-party screenshots, logos, CSS, assets, or extended copied prose.

## Three comparable territories

Use one deterministic renderer and one frozen shared content/navigation object.
Create exactly three materially different visual hypotheses:

- `A` — Editorial Field Guide;
- `B` — Practical Workshop Manual; and
- `C` — Calm Study Companion.

Each territory has a complete semantic token set and differs on at least five
of typography, color distribution, spacing, surfaces, border/elevation,
composition, image framing, visual action treatment, and data density.
Navigation presence, structure, labels, grouping, and order remain one identical
noncanonical fixture across A/B/C and are never a territory differentiator or
promotion field. Do not create a logo, mascot, decorative image, gradient/blob identity,
stock art, generated filler, third-party icon pack, downloaded font, or new
accepted image.

One machine-readable role-to-CSS map is authoritative. Every promotable token
must map to a real selector/property consumer, and browser evidence must observe
its computed value in A, B, and C. At least five declared axes must have material
computed-style differences. A token listed only in JavaScript or shadowed by a
hard-coded default is not implemented and cannot be reviewed or promoted.

The local server binds only to `127.0.0.1`, has an explicit file allowlist and
deny-by-default CSP, and serves only the prototype text files plus the three
recorded accepted derivatives used by fixtures. Screenshots, traces, and raw
browser output remain under `/tmp`.

The terminal browser receipt captures every default A/B/C frame in Chromium,
Firefox, and WebKit: 108 immutable default cases. A separately justified
special-presentation matrix contains 33 immutable cases covering
phone, tablet, wide desktop, large text, 400%-equivalent reflow, forced colors,
reduced motion, and print without implying every combination was run. Immutable
print receipt scope is exactly nine cases: the `review-queue-empty` frame for
A/B/C in Chromium, Firefox, and WebKit. Those nine cases observe hidden
toolbars/actions in the rendered page; broader Playwright print checks are
diagnostic unless they are added to the committed receipt before source freeze.
Keyboard evidence derives the enabled, rendered, visible focusable set and
order, uses native forward Tab through the final logical document stop and
native Shift+Tab through the exact reverse order back to the first stop, and
requires every expected stop exactly once per direction, correct order, and
visible focus at every observed stop. The capture never presses native forward
Tab from the final logical stop. It therefore does not prove the absence of a
forward-Tab trap at that control, and it makes no browser-chrome transition or
forward-wrap claim. Every Axe result at every impact level is
retained; the required allowlist is closed and empty unless an exact rule, node,
rationale, and disposition are added before the review subject freezes. Firefox
runs serially or at a measured bounded concurrency that produces no navigation
timeout; a timeout is a failed suite, never a waived result.

`keyboardEvidenceClassification=native-document-focus-order-round-trip`

`finalForwardTabLimitation=No forward Tab is sent from the final document stop. The round trip does not observe browser chrome and does not prove the absence of a forward-Tab trap at the final control.`

## Codex review protocol and independence limitation

Freeze the comparison bytes first. Hash every prototype file and compute the
bundle SHA-256 as the hash of each repository-relative path, a NUL byte, the
file bytes, and a trailing NUL byte in lexicographic path order.

Launch exactly three fresh Codex subagent review tasks in one pinned fresh
cohort topology with overlapping locally observed execution intervals. Each receives the same exact subject/source/prototype/browser hashes,
one committed prompt template, the common review-record contract, and one
distinct rubric. Each safe receipt records `taskPath`, `sessionUuid`,
`parentThreadId`, provenance class/source/originator/depth, completion state,
exact locally observed task-start and completion event timestamps and turn ID,
completion-message SHA-256, normalized report path and SHA-256, repository
commit, and the `safeReceiptSha256` computed over the ordered safe payload. The
local extractor checks the session UUIDv7 time, database insertion time,
session-metadata event time, and task-start event time in nondecreasing order;
each bounded pre-start join required by the extractor. It retains the exact
completion bytes observed in the local task-complete rollout event. Native
spawn call/result bytes are not available from the retained state/rollout
source, and caller-supplied or reconstructed spawn bytes are not evidence. The
native completion text hash and normalized review JSON hash are separately
recorded and independently checked; equality is permitted when the bytes are
identical. The
exact three task paths and parent/depth topology are pinned by the validator;
each fresh session UUID is retained exactly and cross-joined throughout its
receipt but remains subject to the authentication limitation below. Copied old
output, retargeted output, arbitrary `/root` strings, reconstructed spawn
objects, and self-asserted timestamps are not evidence.

The safe receipt is an unauthenticated local orchestration audit summary, not a
signature: Codex cannot cryptographically prove native identity, timing, or
cross-output non-observability. That limitation is explicit in every terminal
artifact. Native spawn call/result bytes and the first output-sharing time are
not observable from the available source. Operationally, root launches all
three direct lanes before consuming results and does not intentionally relay
outputs between lanes, but that sequence is policy rather than authenticated
evidence. Normalized outputs are written only after all three tasks complete.
Evidence coordinates use only
`repository/path:L<line>` and must resolve to a nonblank line in the exact
review-subject commit. Native Codex does not expose a cryptographic proof of
cross-task non-observability; that remains an explicit limitation rather than a
self-attested guarantee.

`receiptAuthenticationLimitation=Local Codex state and rollout records are not cryptographic proof of task identity, timing, or cross-output non-observability. Native spawn call/result bytes are unavailable from the retained source, and no caller-supplied spawn context is acceptance evidence; ordinary CI can validate only the committed receipt bytes and declared joins.`

The four-slot limit is handled by one fresh non-evidence cohort task, a trust
lane beneath it, and the two remaining review lanes beneath the trust task. The
cohort task completes before the trust task spawns its two children, leaving
root plus exactly three concurrently active review tasks. Safe receipts preserve
the pinned parent/depth topology, distinct session IDs, and locally observed
start/completion intervals. A nonempty common interval is checked from those
local events. Neither that overlap nor the
operational no-relay policy proves when outputs were first shared or proves
cross-output non-observability.

| Rubric | Five equally weighted criteria |
|---|---|
| `consumer-trust-anti-ai-slop` | unofficial/source trust; no institutional impersonation; specificity/originality; no generic AI gloss; consumer-confidence hierarchy |
| `accessibility-cognitive-load` | semantic/focus clarity; zoom/reflow/large text; contrast/non-color meaning; cognitive chunking; motion/state/recovery |
| `visual-component-coherence` | component-role consistency; token coherence; seven-archetype coverage; responsive/print continuity; differentiation without content drift |

Every lane scores each criterion for each A/B/C territory once with an integer
from 1 through 5, where higher is better. Its normalized report records
`taskPath`, `repositoryCommit`, rubric ID, exact source and prototype hashes,
evidence coordinates, blockers, consensus position, selection-rule support, and
dissent; locally observed timing and session fields live only in the joined safe receipt.
A lane has no separate recommendation field. Scores are structured nonhuman
review evidence only.

Every prior Step 3 source, subject, receipt, task, review, and decision named in
the Status section, including all r1, r3, and r4 task sessions, is non-reusable and
cannot populate a terminal slot. Implementation concepts may be rebuilt only in
a new source whose sole parent is the accepted Step 2 merge. The receipt
contract models observed database insertion delay through ordered, bounded
local timestamp joins instead of asserting timestamp equality.

## Deterministic decision rule

For each territory, sum its 15 unweighted criterion scores across the three
reviews. The validator recomputes every lane total and aggregate total.

A unique territory may be selected only when all of the following are true:

- exactly three distinct task IDs and exactly the three required rubrics exist;
- all receipts bind the exact comparison bytes and accepted Step 2 coordinates;
- every required score and evidence coordinate exists;
- no blocking finding exists in any lane for any territory;
- every lane supports applying the deterministic selection rule;
- no dissent record exists for any territory;
- every lane has one unique high-scoring territory; and
- the highest aggregate total is unique; and
- browser, accessibility, asset, semantic-equality, security, schema, scope,
  and repository gates pass.

A per-lane or aggregate tie, missing review, hash drift, any blocker (including
one attached to a non-leading territory), an unsupported lane, or any dissent produces
`decisionStatus=unresolved`, `selectedTerritoryId=null`, and no canonical
promotion. Do not average away dissent, invent a hybrid, or use a role/sign-off
field to override the rule.

The terminal vocabulary is closed: `artifactStatus=complete` and
`decisionStatus=selected|unresolved`. `pending` and `accepted` are pre-terminal
states only and are forbidden in the terminal manifest, report, and canonical
contract.

When the rule produces one unique winner, preserve A/B/C comparison bytes,
record the selected contract separately, promote that exact token/composition/
framing direction to `product/DESIGN_SYSTEM.md`, add the evidence packet to
`research/README.md`, and mark Plan 006 DONE in `plans/README.md`. The product
contract must repeat the Codex-only limitations and must not claim human or
learner validation.

## Machine contract and verification

`evidence-manifest.json` validates against the committed schema. The portable
validator must validate both schema integrity and instance constraints, then
apply cross-file/custom invariants. If it implements only a declared Draft
2020-12 subset, it must name the subset and reject every unsupported keyword;
it must not claim full Draft support.

Adversarial tests run by default and must reject at least:

- schema digest or schema weakening/tampering;
- human/participant/approval substitution;
- missing or duplicate review/task/rubric identity;
- fake task paths, prompt/rubric/result drift, non-overlapping task intervals,
  and unresolved evidence coordinates;
- score, total, evidence-coordinate, or timestamp drift;
- tie, blocker, dissent, or selection drift;
- a unique A score combined with any B blocker still producing a selection;
- Step 2, prototype, file, bundle, review, asset, benchmark, route, frame, or
  semantic-equality hash drift;
- forbidden asset paths or answer/postcommit leakage; and
- unresolved Step 2 choice promotion;
- unrendered token declarations or fewer than five computed-style differences;
- a non-focused Firefox default frame, unsuppressed print action, or any
  unallowlisted Axe finding at any impact level;
- a skipped late keyboard control, duplicate observed focus stop, invisible
  late focus stop, or observed focus order drift;
- a non-direct source/subject parent, extra source-to-subject path, omitted dirty
  source input, receipt already present at source, evidence-schema drift, or
  terminal-validator drift;
- copied old task output, a task retargeted to another subject, or safe-receipt
  digest/native-completion drift;
- an affirmative human study, usability, approval, production authorization,
  real-device, participant, private contact/locator, candidate/applicant ID,
  host/device, or non-loopback-network claim; and
- canonical contract, research index, plan status, exact-path scope, dirty
  manifest/canonical bytes, or extra UTF-8 SVG drift.

Required checks on the final exact commit:

```sh
node research/ui-ux/consumer-visual-system/verify-research.mjs --phase=all
node apps/site/node_modules/@playwright/test/cli.js test --config=research/ui-ux/consumer-visual-system/playwright.config.ts
bun run verify:visuals
bun run verify
git diff --check
git diff --quiet d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1...HEAD -- apps/site content/assets content/authoring/visuals
git diff --quiet d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1...HEAD -- '*.png' '*.jpg' '*.jpeg' '*.webp' '*.svg' '*.woff' '*.woff2'
```

Run the prototype suite in its configured Chromium, Firefox, and WebKit
projects. Also run the repository's locked browser/preview and workerd checks
required by the current root verification contract. A cold Codex audit must
inspect the final exact commit after it is created; any repair requires a new
commit and a new cold audit of the new head.

## Exact write scope

Only these paths may differ from the accepted Step 2 merge:

```text
plans/006-consumer-visual-system-prework.md
plans/006-consumer-visual-system-prework.schema.json
plans/006-select-consumer-visual-system.md
plans/validate-006-consumer-visual-system-prework.mjs
plans/README.md
product/DESIGN_SYSTEM.md
research/README.md
research/ui-ux/consumer-visual-system/README.md
research/ui-ux/consumer-visual-system/asset-audit.tsv
research/ui-ux/consumer-visual-system/benchmark-sources.json
research/ui-ux/consumer-visual-system/browser-receipt.json
research/ui-ux/consumer-visual-system/capture-browser-receipt.mjs
research/ui-ux/consumer-visual-system/evidence-manifest.json
research/ui-ux/consumer-visual-system/evidence-manifest.schema.json
research/ui-ux/consumer-visual-system/extract-codex-task-receipt.mjs
research/ui-ux/consumer-visual-system/playwright.config.ts
research/ui-ux/consumer-visual-system/prototype.css
research/ui-ux/consumer-visual-system/prototype.html
research/ui-ux/consumer-visual-system/prototype.mjs
research/ui-ux/consumer-visual-system/review-prompts/accessibility-cognitive-load.md
research/ui-ux/consumer-visual-system/review-prompts/consumer-trust-anti-ai-slop.md
research/ui-ux/consumer-visual-system/review-prompts/visual-component-coherence.md
research/ui-ux/consumer-visual-system/review-task-receipts.json
research/ui-ux/consumer-visual-system/reviews/accessibility-cognitive-load.json
research/ui-ux/consumer-visual-system/reviews/consumer-trust-anti-ai-slop.json
research/ui-ux/consumer-visual-system/reviews/visual-component-coherence.json
research/ui-ux/consumer-visual-system/serve-prototype.mjs
research/ui-ux/consumer-visual-system/token-role-css-map.json
research/ui-ux/consumer-visual-system/verify-research.mjs
research/ui-ux/consumer-visual-system/verify-asset-proof.mjs
research/ui-ux/consumer-visual-system/visual-system-research.pw.ts
```

No application source, content release, accepted image byte, illustration
authority, feature behavior, route identity, or state machine may change. The
branch is `codex/uiux-orchestration-03-visual-territories`; update draft PR #43
and keep it draft. Because every existing Step 3 commit is explicitly invalid
and the replacement source must have the accepted Step 2 merge as its sole
parent, publish the disconnected replacement with one exact
`--force-with-lease` against the observed rejected remote head. Do not merge or
deploy it.

## Completion receipt

The final report and PR body must state the gate SHAs and canonical hashes,
artifact/frame/route/asset/benchmark matrix, all three nonhuman task IDs and
review accounting, deterministic score totals and selection result, exact
commit and PR, every check and CI state, limitations, and the exact root action.
