# Plan 006: Select and codify a consumer visual system

## Status

- **Execution protocol**: `CODEX-ONLY-UIUX-V1`
- **Status**: IN PROGRESS until every gate below passes on one exact commit
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

## Fixed route and state matrix

The renderer must close all 36 route IDs through these seven archetypes:

| Archetype | Route IDs |
|---|---|
| Orientation | `home`, `exam-selector`, `exam-checker`, `profile`, `scoring-explainer`, `actual-questions-explainer`, `about`, `nyc-disambiguation` |
| Study launcher | `study-hub`, `hazards-index`, `simulation-setup`, `print-center` |
| Browse/reference | `atlas-index`, `atlas-family`, `atlas-tool`, `procedures-index`, `procedure-detail`, `repair-lab`, `faq`, `transparency-index`, `source`, `corrections`, `foil`, `security`, `privacy` |
| Focused task | `question-player`, `hazard-player`, `review-player`, `simulation-player` |
| Review/results | `review-queue`, `simulation-results`, `print-preview` |
| Utility | `settings`, `offline-packs`, `correction-submit` |
| Recovery | `status`, plus representative 404/410/5xx document states |

The committed comparison contains at least one populated frame for every
archetype and at least 21 territory/archetype frames. It also exercises the two
Home-action fixtures, ready/prerequisite study states, tool and comparison
reference, question and hazard precommit states, successful empty review,
offline material, dormant correction draft, and one explicitly synthetic
recovery fixture. Synthetic fixtures are interface-state examples, not runtime
observations.

## Accepted-asset boundary

Audit every accepted release row: 65 tools, 14 comparisons, and 18 scenes. Use
only immutable delivery derivatives and preserve the release ledger's stable ID,
opaque ID, revision, hashes, review coordinates, rights statement, and any
publication/scored-use gate.

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
composition, image framing, action treatment, navigation presence, and data
density. Do not create a logo, mascot, decorative image, gradient/blob identity,
stock art, generated filler, third-party icon pack, downloaded font, or new
accepted image.

The local server binds only to `127.0.0.1`, has an explicit file allowlist and
deny-by-default CSP, and serves only the prototype text files plus the three
recorded accepted derivatives used by fixtures. Screenshots, traces, and raw
browser output remain under `/tmp`.

## Independent Codex review protocol

Freeze the comparison bytes first. Hash every prototype file and compute the
bundle SHA-256 as the hash of each repository-relative path, a NUL byte, the
file bytes, and a trailing NUL byte in lexicographic path order.

Launch exactly three independent Codex subagent tasks at the same time. Each
receives only the fixed source coordinates, exact prototype hashes, common
review record contract, and one distinct rubric. An agent must set
`crossReviewOutputsReadBeforeSubmission=false` and must not read another lane's
output before submitting.

| Rubric | Five equally weighted criteria |
|---|---|
| `consumer-trust-anti-ai-slop` | unofficial/source trust; no institutional impersonation; specificity/originality; no generic AI gloss; consumer-confidence hierarchy |
| `accessibility-cognitive-load` | semantic/focus clarity; zoom/reflow/large text; contrast/non-color meaning; cognitive chunking; motion/state/recovery |
| `visual-component-coherence` | component-role consistency; token coherence; seven-archetype coverage; responsive/print continuity; differentiation without content drift |

Every lane scores each criterion for each A/B/C territory once with an integer
from 1 through 5, where higher is better. It records its immutable agent task
ID, rubric ID, exact source and prototype hashes, timestamp, evidence
coordinates, blockers, consensus position, and dissent. Scores are structured
nonhuman review evidence only.

## Deterministic decision rule

For each territory, sum its 15 unweighted criterion scores across the three
reviews. The validator recomputes every lane total and aggregate total.

A unique territory may be selected only when all of the following are true:

- exactly three distinct task IDs and exactly the three required rubrics exist;
- all receipts bind the exact comparison bytes and accepted Step 2 coordinates;
- every required score and evidence coordinate exists;
- no blocking finding exists;
- no unresolved dissent contests selection eligibility or the unique result;
- the highest aggregate total is unique; and
- browser, accessibility, asset, semantic-equality, security, schema, scope,
  and repository gates pass.

A tie, missing review, hash drift, blocker, or unresolved selection dissent
produces `decisionStatus=pending`, `selectedTerritoryId=null`, and no canonical
promotion. Do not average away dissent, invent a hybrid, or use a role/sign-off
field to override the rule.

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
- score, total, evidence-coordinate, or timestamp drift;
- tie, blocker, dissent, or selection drift;
- Step 2, prototype, file, bundle, review, asset, benchmark, route, frame, or
  semantic-equality hash drift;
- forbidden asset paths or answer/postcommit leakage; and
- canonical contract, research index, plan status, or scope drift.

Required checks on the final exact commit:

```sh
node plans/validate-006-consumer-visual-system-prework.mjs
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
research/ui-ux/consumer-visual-system/evidence-manifest.json
research/ui-ux/consumer-visual-system/evidence-manifest.schema.json
research/ui-ux/consumer-visual-system/playwright.config.ts
research/ui-ux/consumer-visual-system/prototype.css
research/ui-ux/consumer-visual-system/prototype.html
research/ui-ux/consumer-visual-system/prototype.mjs
research/ui-ux/consumer-visual-system/reviews/accessibility-cognitive-load.json
research/ui-ux/consumer-visual-system/reviews/consumer-trust-anti-ai-slop.json
research/ui-ux/consumer-visual-system/reviews/visual-component-coherence.json
research/ui-ux/consumer-visual-system/serve-prototype.mjs
research/ui-ux/consumer-visual-system/verify-research.mjs
research/ui-ux/consumer-visual-system/visual-system-research.pw.ts
```

No application source, content release, accepted image byte, illustration
authority, feature behavior, route identity, or state machine may change. The
branch is `codex/uiux-orchestration-03-visual-territories`; update draft PR #43,
push without force, keep it draft, and do not merge or deploy it.

## Completion receipt

The final report and PR body must state the gate SHAs and canonical hashes,
artifact/frame/route/asset/benchmark matrix, all three nonhuman task IDs and
review accounting, deterministic score totals and selection result, exact
commit and PR, every check and CI state, limitations, and the exact root action.
