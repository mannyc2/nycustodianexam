# Plan 008: Run integrated consumer UX and accessibility validation

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report; do not improvise. This plan authorizes research design, a retained
> sanitized prototype fixture, moderated evaluation, synthesis, and
> product-contract updates. It does not authorize production UI implementation,
> public deployment, analytics,
> participant outreach, recording, or compensation until the named approval
> checkpoint is passed. When done, update this plan's status row in
> `plans/README.md` unless a reviewer told you that they own the index.
>
> **Drift check (run first)**:
> `git diff --stat e6f9119..HEAD -- product docs/LANDSCAPE.md docs/OPEN.md research/README.md research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md research/ui-ux/integrated-consumer-ux-validation plans/README.md apps/site/src apps/site/scripts apps/site/browser-tests packages content illustration`
> This plan intentionally depends on Plans 004-007 changing the product
> contracts after `e6f9119`. Confirm those plans are DONE and compare every
> current-state excerpt with the live tree. Any unrelated semantic drift is a
> STOP condition.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: `plans/004-establish-consumer-language-boundary.md`,
  `plans/005-rebuild-learner-task-navigation.md`,
  `plans/006-select-consumer-visual-system.md`, and
  `plans/007-specify-ui-foundations-and-responsive-contract.md`
- **Category**: direction
- **Planned at**: commit `e6f9119`, 2026-08-26

## Why this matters

The repository has strong machine verification for release integrity,
persistence, answer boundaries, and selected accessibility mechanics. It does
not yet establish that a first-time candidate understands the product, can find
the right study path, trusts the experience for the right reasons, comprehends
feedback, or can complete key tasks with their own mobile or assistive setup.

Plans 004-007 deliberately produce decisions and prototypes rather than a
production rewrite. This final research plan tests those decisions together in
complete learner journeys, makes accessibility participation part of the
evidence, and converts accepted findings into implementation-ready acceptance
criteria. It prevents a large redesign from being approved through screenshots
or internal preference alone.

## Current state

### Product constraints that remain fixed

- `product/DESIGN_SYSTEM.md:14-35` requires a calm, trustworthy, legible, and
  practical interface rather than a gamified one.
- `product/ROUTES.md` is the canonical 21-family route inventory. This study may
  change grouping, hierarchy, presentation, and labels; it does not add or
  delete route families.
- `product/SCREEN_STATES.md` controls legal states, transitions, recovery,
  focus, history, and offline behavior.
- `product/FEATURE_SPEC.md:577-602` requires commit-before-reveal, explicit
  uncertainty, visual/nonvisual operation, offline behavior, and source/security
  surfaces. It also states that screenshots alone are insufficient acceptance
  evidence.
- `product/COMPONENT_ARCHITECTURE.md:13-36` preserves useful static documents
  and bounded React 19 islands; no SPA conversion is permitted.
- `AGENTS.md` prohibits secure, remembered, reconstructed, or purchased exam
  content and requires every new research pass to have an immutable base,
  output branch, draft PR, concise result, and direct GitHub publication.

### Existing automated evidence and its boundary

`apps/site/browser-tests/accessibility-and-presentation.pw.ts:14-107` checks
axe results, 320px reflow, a subset of target sizes, forced colors, reduced
motion, and print for ready/revealed question states. It does not cover the
other route families or consumer comprehension.

`apps/site/playwright.config.ts:45-73` captures screenshots only on failure and
defines desktop Chromium, Firefox, and WebKit projects. There are no committed
visual-regression assertions or mobile-device projects.

`apps/site/browser-tests/README.md` explicitly leaves real 400% zoom,
screen-reader behavior, several offline/storage races, physical print,
grayscale, clipping, and pagination as manual certification gates. Axe is
correctly described there as incomplete accessibility evidence.

The site also intentionally has no launch analytics, ad tracking, or account.
Do not add surveillance or remote event collection to compensate for missing
research evidence.

### Correctness confounders to separate from design findings

Before presenting a prototype as representative, inspect these baseline issues:

1. `apps/site/scripts/generate-pages.tsx:493-496` and `:552-555` emit static
   previous/next links in every question/hazard state, while
   `apps/site/src/session-navigation.ts:33-47` replaces the document without a
   legal-state guard.
2. Local-data islands initialize default/empty projections before authoritative
   restoration. For example,
   `apps/site/src/offline-packs/react/pack-manager.tsx:107-170` starts with an
   empty list and reconciles asynchronously, but lines 367-375 can render a
   false empty claim during that interval.
3. `apps/site/src/question-player/react/bootstrap.tsx:31-36` mounts
   `PracticeNonvisualQuestion` for all question documents, including generated
   review-player routes.

Do not interpret a participant failure caused by one of these defects as
evidence against an otherwise sound visual or language direction. Conversely,
do not hide the defect in the report. Classify it as a pre-existing correctness
blocker and recommend a separate implementation plan.

## External method references

Use these current primary/official sources when writing the protocol:

- USWDS design principles, especially starting from real user needs:
  <https://designsystem.digital.gov/design-principles/>
- GOV.UK guidance on planning regular research rounds and participant scope:
  <https://www.gov.uk/service-manual/user-research/plan-user-research-for-your-service>
- GOV.UK moderated usability-testing method:
  <https://www.gov.uk/service-manual/user-research/using-moderated-usability-testing>
- GOV.UK prototype guidance:
  <https://www.gov.uk/service-manual/design/making-prototypes>
- W3C guidance on involving disabled users in evaluation:
  <https://www.w3.org/WAI/test-evaluate/involving-users/>
- WCAG 2.2 and the reflow understanding document:
  <https://www.w3.org/TR/WCAG22/> and
  <https://www.w3.org/WAI/WCAG22/Understanding/reflow.html>

The method references inform the study. The repository's exam-security,
privacy, architecture, and product contracts remain authoritative.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Confirm toolchain | `bun run check:toolchain` | exits 0 with the pinned Bun/Node pair accepted |
| Maintained layout | `bun run check:layout` | exits 0 with no path/name violations |
| Module boundaries | `bun run check:boundaries` | exits 0 with no forbidden imports |
| Typecheck | `bun run typecheck` | exits 0 with all workspace typechecks passing |
| Browser typecheck | `bun run typecheck:browser` | exits 0 with no browser-harness errors |
| Unit tests | `bun run test` | exits 0 with all workspace tests passing |
| Chromium browser baseline | `bun run test:browser:chromium` | exits 0 with all configured Chromium cases passing |
| Complete repository gate | `bun run verify` | exits 0 with all automated gates passing |
| Patch hygiene | `git diff --check` | exits 0 with no whitespace errors |

Do not install or upgrade dependencies. If the locked workspace is missing,
stop and ask the operator before installing anything.

## Scope

**In scope** (the only maintained files this plan may modify):

- `research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md` (create at
  the start as the living charter/protocol and finalize as the concise synthesis)
- `research/ui-ux/integrated-consumer-ux-validation/prototype/index.html`
- `research/ui-ux/integrated-consumer-ux-validation/prototype/styles.css`
- `research/ui-ux/integrated-consumer-ux-validation/prototype/prototype.mjs`
- `research/ui-ux/integrated-consumer-ux-validation/prototype/fixtures.mjs`
- `research/ui-ux/integrated-consumer-ux-validation/prototype/serve.mjs`
- `research/ui-ux/integrated-consumer-ux-validation/prototype/verify.mjs`
- `research/ui-ux/integrated-consumer-ux-validation/prototype/prototype-manifest.json`
- `research/ui-ux/integrated-consumer-ux-validation/prototype/playwright.config.ts`
- `research/ui-ux/integrated-consumer-ux-validation/prototype/integrated-validation.pw.ts`
- `research/ui-ux/integrated-consumer-ux-validation/results.json`
- `research/ui-ux/integrated-consumer-ux-validation/verify-study.mjs`
- `research/README.md`
- `docs/LANDSCAPE.md`, only for durable accepted competitive/design evidence
- `docs/OPEN.md`, for unresolved product or certification gates
- `product/CONTENT_DESIGN.md`, created by Plan 004
- `product/ROUTES.md`
- `product/SCREEN_STATES.md`, only when research exposes an ambiguity requiring a
  maintainer decision; do not change a state machine unilaterally
- `product/COMPONENT_ARCHITECTURE.md`
- `product/DESIGN_SYSTEM.md`
- `plans/README.md`, status only

The listed sanitized prototype is the minimal reproducible decision fixture.
Participant contact details, consent/compensation records, recordings, raw
transcripts, raw screen captures, rejected prototype variants, and prototype
scratch belong in an operator-approved private research location or a
task-specific `/tmp` directory. They must never be committed.

**Out of scope**:

- production files under `apps/`, `packages/`, `content/`, or `illustration/`;
- route/feature expansion, exam-fact changes, new practice content, or new image
  generation;
- production deployment, public preview URLs, analytics, telemetry, accounts,
  cookies, or third-party behavior tracking;
- recruitment/outreach, participant scheduling, compensation, or recording
  before explicit operator approval;
- remembered or secure exam questions, answer choices, drawings, photographs,
  admission notices, or review-session content; and
- quantitative population claims from a small qualitative sample.

## Git and research workflow

- Fetch `origin/main`; confirm Plans 004-007 are DONE in its committed
  `plans/README.md`, identify each dependency's accepted merge/head commit, and
  assert all four commits are ancestors of that exact `origin/main` head. Record
  that dependency-complete `origin/main` head as the immutable execution-base
  SHA. It supersedes `e6f9119` for execution while the latter remains the
  original planning coordinate. A merge-base is not the execution base.
- Through the connected GitHub capability, verify that execution base, verify
  the output branch does not exist, and create
  `codex/uiux-integrated-validation` before extended work. If write access is
  unavailable, stop.
- Commit and push a truthful initial charter, dependency/source coordinates,
  privacy boundary, current evidence, and pending protocol/authorization state;
  open a draft PR before extended prototype or participant work. Push the
  completed protocol and later concise results incrementally without force.
- Use concise imperative subjects, for example `Define integrated UX validation`.
- Do not merge, deploy, or contact participants unless the operator explicitly
  instructs it.

## Research design

### Primary participants

Run two iterative moderated rounds of 6-8 primary participants each. Recruit
people who are preparing for, recently prepared for, or closely resemble the
intended audience for entry-level civil-service and custodial/maintenance study.
Across the total sample, deliberately include:

- people who primarily access services on a phone;
- varied age, reading confidence, and digital confidence;
- low-bandwidth or intermittent-connectivity users;
- limited-English participants who can evaluate the English launch experience
  without being led to believe a reviewed translation exists; and
- people who use keyboard navigation, browser zoom/text enlargement, screen
  readers, voice input, or another relevant access strategy.

Access needs can overlap with other characteristics. Do not publish a person's
diagnosis or tie a rare characteristic to a quotation.

Optionally run 3-4 secondary interviews with librarians, workforce-development
staff, civil-service preparation staff, or other people who help candidates.
Do not mix their results with primary learner task-success observations.

### Core tasks

Use complete journeys, not isolated preference questions:

1. **Ten-second orientation**: after a brief home-page exposure, explain what
   the product is, who it is for, whether it is official, and what to do first.
2. **Profile fit**: determine whether the available study profile applies to a
   supplied fictional candidate scenario without reading schema-level metadata.
3. **Begin study**: start the shortest currently supported appropriate practice
   activity and explain the choices made. Do not add a new session length merely
   to make this task easy.
4. **Question and feedback**: answer, commit, interpret why each option was right
   or wrong, find source support if desired, and say what to remember next time.
5. **Tool comparison**: find and distinguish two commonly confused tools using
   the atlas/comparison experience.
6. **Hazard practice**: complete visual or nonvisual hazard input, understand a
   miss/false positive, and recover from an input mistake.
7. **Review**: locate a saved missed/flagged item, understand why it is due, and
   complete the intended acknowledgement/continue action.
8. **Offline and data control**: explain how to make study material available
   offline, export progress, and distinguish remove/reset actions without
   interpreting checksums or device generations.

Use fictional profile/task scenarios. If a participant begins recounting a real
or secure examination item, the moderator must stop that discussion, exclude
the content from notes, and follow the repository security boundary.

### Measures and decision rules

For each task record only de-identified observations:

- completion: complete, partial, or failed;
- first action/first click;
- wrong turns and recovery path;
- time to meaningful task start, used diagnostically rather than as a speed
  contest;
- action/outcome comprehension in the participant's own words;
- unofficial-status and trust-source comprehension;
- words or labels that caused hesitation;
- access barrier and workaround, if any; and
- confidence/trust rating with the participant's short reason.

Do not turn 6-8 sessions into precise population percentages. Treat a problem as
a repeated pattern when at least two participants in a round encounter the same
task/comprehension failure. Treat any answer leak, loss-of-work implication,
inability to identify the unofficial status, inability to recover from an error,
or access-strategy blocker as critical even if observed once. A final direction
is not validated while any critical failure remains unresolved; the two-person
rule is only the threshold for calling a noncritical pattern repeated.

### Structured evidence and approval contract

Create `results.json` and `verify-study.mjs` with the initial charter. The JSON
is a compact aggregate/approval record, never a participant table. It contains:

```text
schemaVersion
plannedAtSha
executionBaseSha
decisionOwner { identity, githubHandle, role, approvalChannel }
operationsApproval[] { operation, used, decision, approvedByIdentity, approvedOn, approvalArtifact, approvalBodySha256 }
artifactApprovals[] { round, prototypeVersion, manifestSha256, manifestCommitSha, accessMethod, exposureBoundary, repositoryPublication, approvedByIdentity, approvedOn, approvalArtifact, approvalBodySha256 }
rounds[] { round, uniqueCompletedParticipants, prototypeVersion, manifestSha256, taskAggregates[], accessStrategyParticipants }
coverage { denominator, mobileFirstCount, lowerDigitalConfidenceCount, lowBandwidthCount, limitedEnglishCount, relevantAccessStrategyCount }
patternSummaries[] { round, patternId, taskId, category, severity, distinctParticipantCount, repeated, retestOutcome }
evidenceValidation { observationsSha256, patternsSha256, contextsSha256, verifiedOn }
canonicalPromotions[] { decisionId, status, canonicalPath, markerId, normalizedContentSha256, rationale }
finalDecision { status, approvedByIdentity, approvedOn, approvalArtifact, approvalBodySha256, canonicalPromotionsSha256, conditions, rationale }
```

Use an operator-approved private location for working data. Within it, create
`study-observations.tsv` with this exact header:

```text
round	study_id	prototype_version	manifest_sha256	task_id	completion	first_action_code	outcome_comprehension	unofficial_status_outcome	trust_source_outcome	access_strategy_used	access_blocker	notes_code
```

Use `study-patterns.tsv` with this exact header:

```text
round	pattern_id	study_id	task_id	category	severity	occurrence	retest_of_pattern_id	retest_outcome
```

Use `participant-contexts.tsv` with this exact header:

```text
study_id	phone_first	lower_digital_confidence	low_bandwidth	limited_english	access_strategy
```

The first matrix contains exactly one controlled-code row per completed
study-ID/task pair. The second separates issue occurrences/retests without raw
notes. The private context matrix has exactly one row per completed study ID;
its four context flags are `yes | no`, and `access_strategy` is exactly one of
`none | keyboard | zoom-text | screen-reader | voice-input | switch-or-motor |
other-declared`. IDs match `R1-P[0-9]{2}` or `R2-P[0-9]{2}`. Do not commit any
of the three files or publish context linked to a study ID.

The locked observation domains are: `completion = complete | partial | failed`;
`first_action_code = expected-primary | expected-secondary |
wrong-study-destination | utility-trust-detour | no-action`; each comprehension
outcome is `accurate | partial | incorrect | not-applicable`;
`access_strategy_used = yes | no`; `access_blocker = none | resolved |
unresolved`; and `notes_code` is `n/a` or matches `N-[0-9]{3}`. The locked
pattern domains are: `pattern_id = PAT-[0-9]{3}`; category is `language |
hierarchy | visual | interaction | correctness | access | security |
data-safety | affiliation-trust`; severity is `critical | high | medium | low`;
occurrence is `observed | retest`; and retest values follow the exact
`n/a`/referenced-ID and `n/a | resolved | persists | inconclusive` rules. Reject
all other values.

`verify-study.mjs` uses Node built-ins only (including `child_process` solely
for exact `git`/`gh` reads; no package or shell interpolation) and accepts these
exact phases:
`operations`, `artifact-round-one`, `round-one`, `artifact-round-two`,
`round-two`, `decision`, and `final`. Round phases require explicit `--observations`,
`--patterns`, and `--contexts` paths. It must fail closed unless all of these
rules hold:

- the concrete decision owner and approval channel are present; the operation
  ID set is exactly `recruitment`, `outreach`, `compensation`, `recording`,
  `private-data-retention`, and `prototype-exposure`, each once, with `allow |
  deny`; recruitment, outreach, private-data retention, and prototype exposure
  are used and allowed; compensation/recording may be denied only when
  `used=false`; every used operation has a dated owner-matching approval
  artifact;
- `decisionOwner.approvalChannel` is the exact URL of this branch's open draft
  PR. Every `approvalArtifact` is an exact comment URL on that same PR in the
  form `https://github.com/{owner}/{repo}/pull/{number}#issuecomment-{id}`. The
  verifier derives `{owner}/{repo}` from `origin`, resolves the PR and comment
  through `gh`, requires the PR to remain open/draft with the expected head and
  base, requires the comment author's login to equal
  `decisionOwner.githubHandle`, requires `created_at == updated_at`, hashes the
  exact UTF-8 comment body, and matches `approvalBodySha256`. A missing,
  deleted, edited, cross-PR, cross-repository, wrong-author, or unresolvable
  comment fails closed; a non-URL string can never authorize an operation;
- each artifact approval names an exact version, SHA-256, access method,
  exposure boundary, `repositoryPublication = allow`, and Git commit. Read the
  manifest at `manifestCommitSha` with Git, hash it, and compare its version and
  digest so a prose/private approval or approval for another artifact cannot
  pass. A denied repository-publication decision is a STOP because the retained
  prototype and its descendant evidence commits must reach the draft branch;
- task IDs equal exactly `orientation`, `profile-fit`, `begin-study`,
  `question-feedback`, `tool-comparison`, `hazard-practice`, `review`, and
  `offline-data-control`; each completed round has 6–8 unique study IDs and
  exactly one row per ID/task pair, with no duplicate, dummy, partial, unknown,
  or cross-artifact row;
- aggregate task numerators/denominators, round counts, artifact coordinates,
  access-strategy counts, pattern counts, and SHA-256 of both matrices match
  `results.json` exactly; tracked JSON contains no participant rows, contact
  data, transcript excerpts, or raw notes;
- hash and derive the private context matrix into aggregate numerators and one
  exact denominator; round two has at least two participants who used a relevant
  access strategy; the combined aggregate has at least one participant in each
  required mobile, lower-confidence, low-bandwidth, limited-English, and
  access-strategy context, without committing the linked rows;
- a noncritical pattern is `repeated=true` exactly when at least two distinct
  study IDs in that round experienced it; every critical pattern, even a single
  answer leak/safety/access occurrence, is retested and resolved before final;
  every new round-two critical observation without a later accepted resolution
  blocks final; no critical issue may be waived by sample size; and
- `decision` requires two complete rounds, exact eight-task coverage, current
  aggregate/matrix-hash evidence, both exact artifact approvals, zero unresolved
  critical patterns of any cardinality, and a final decision of `accept for
  implementation` or `accept with conditions` by the concrete owner with date,
  rationale, artifact, and named non-critical conditions where applicable. It
  resolves and body-binds the final approval comment to both approved artifact
  version/manifest/commit coordinates, the decision/conditions/rationale, and
  `canonicalPromotionsSha256`; the latter is the SHA-256 of the canonical JSON
  serialization of the sorted proposed `canonicalPromotions` rows. It
  also requires every exact synthesis heading/decision field below once and the
  `research/README.md` retained-map entry. `final` reruns all decision checks and
  additionally requires the exact Plan 008 `DONE` row and the canonical
  promotion contract below.

Every successful phase prints one exact line naming the phase, artifact
coordinate, participant count where applicable, eight-task coverage, and
critical-pattern status. No phase can pass on an empty array or an unspecified
private approval. Approval comments use exact single-line records so the
verifier does not infer prose intent: `approval-kind: operations` followed by
one `operation: <id> | used: <true|false> | decision: <allow|deny>` line for
each locked operation; `approval-kind: artifact` followed by exact `round`,
`prototype-version`, `manifest-sha256`, `manifest-commit-sha`, `access-method`,
`exposure-boundary`, and `repository-publication` lines; or `approval-kind:
final-decision` followed by exact `decision`, `conditions`, `rationale`, both
round artifact coordinates, and `canonical-promotions-sha256` lines.

## Steps

### Step 1: Verify dependencies and classify prototype confounders

Use connected GitHub to verify the dependency-complete immutable base and that
`codex/uiux-integrated-validation` is absent, then create that branch. Create
`research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md` as a living
research record with status, planned and execution coordinates, dependencies,
scope, privacy/security boundary, canonical consumers, decision owner, current
evidence, limitations, and a source-ledger skeleton. Add its active entry to
`research/README.md`, commit and push this truthful initial state, and open the
required draft PR before extended work.

Run the immutable precondition mechanically before branch creation. Derive the
exact commit where each plan's index row first transitioned to DONE;
do not hand-paste an arbitrary ancestor, branch name, or moving ref:

```sh
git fetch origin main
task_008_execution_base_sha=$(git rev-parse origin/main)
find_task_008_done_commit() {
  task_008_plan_number="$1"
  for task_008_candidate_sha in $(git rev-list --reverse e6f911901f7f18f6716204309fee8b103419a5e0.."$task_008_execution_base_sha" -- plans/README.md); do
    if git show "$task_008_candidate_sha:plans/README.md" | rg -q "^\\| $task_008_plan_number \\|.*\\| DONE" &&
       ! git show "$task_008_candidate_sha^:plans/README.md" | rg -q "^\\| $task_008_plan_number \\|.*\\| DONE"; then
      printf '%s\n' "$task_008_candidate_sha"
    fi
  done
}
task_008_plan_004_sha=$(find_task_008_done_commit 004)
task_008_plan_005_sha=$(find_task_008_done_commit 005)
task_008_plan_006_sha=$(find_task_008_done_commit 006)
task_008_plan_007_sha=$(find_task_008_done_commit 007)
for sha in "$task_008_execution_base_sha" "$task_008_plan_004_sha" "$task_008_plan_005_sha" "$task_008_plan_006_sha" "$task_008_plan_007_sha"; do
  test "$(printf '%s\n' "$sha" | wc -l)" -eq 1 || exit 1
  test "$(printf '%s' "$sha" | sed -n '/^[0-9a-f]\{40\}$/p')" = "$sha" || exit 1
done
git merge-base --is-ancestor e6f911901f7f18f6716204309fee8b103419a5e0 "$task_008_execution_base_sha"
for sha in "$task_008_plan_004_sha" "$task_008_plan_005_sha" "$task_008_plan_006_sha" "$task_008_plan_007_sha"; do
  git merge-base --is-ancestor "$sha" "$task_008_execution_base_sha" || exit 1
done
git cat-file -e "$task_008_plan_004_sha:product/CONTENT_DESIGN.md"
git cat-file -e "$task_008_plan_004_sha:research/ui-ux/consumer-language-study-2026-08-26.md"
git cat-file -e "$task_008_plan_005_sha:research/ui-ux/navigation-task-hierarchy/README.md"
git cat-file -e "$task_008_plan_006_sha:research/ui-ux/consumer-visual-system/README.md"
git cat-file -e "$task_008_plan_007_sha:research/ui-ux/ui-foundations-contract-2026-08-26.md"
git cat-file -e "$task_008_execution_base_sha:plans/008-run-integrated-consumer-ux-validation.md"
for plan in 004 005 006 007; do
  git show "$task_008_execution_base_sha:plans/README.md" | rg -n "^\\| $plan \\|.*\\| DONE" || exit 1
done
test -z "$(git status --porcelain)"
test -z "$(git branch --list codex/uiux-integrated-validation)"
test -z "$(git ls-remote --heads origin refs/heads/codex/uiux-integrated-validation)"
git switch -c codex/uiux-integrated-validation "$task_008_execution_base_sha"
test "$(git rev-parse HEAD)" = "$task_008_execution_base_sha"
test "$(git merge-base HEAD "$task_008_execution_base_sha")" = "$task_008_execution_base_sha"
```

Expected: every value is a full immutable SHA; all four accepted dependency
commits are ancestors of the exact fetched `origin/main` head; its committed
index marks all four DONE and contains this reviewed plan; the start is clean;
both branch-absence checks are empty; and the new branch points exactly at the
recorded execution base. Stop on any discrepancy.

The directory does not exist at the planning baseline. Before tracked file
creation, run
`mkdir -p research/ui-ux/integrated-consumer-ux-validation/prototype`; use
`apply_patch` for the living report and prototype source files. Do not place raw
participant or screenshot directories beneath this tracked path.

Create the living report, `results.json` skeleton, and complete
`verify-study.mjs` contract in the truthful initial commit. Push it and open the
draft PR before building the prototype. Create it explicitly with:

```sh
git add \
  research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md \
  research/ui-ux/integrated-consumer-ux-validation/results.json \
  research/ui-ux/integrated-consumer-ux-validation/verify-study.mjs \
  research/README.md
git diff --cached --check
git commit -m "Start integrated consumer UX validation"
git push -u origin codex/uiux-integrated-validation
gh pr create --draft --base main --head codex/uiux-integrated-validation \
  --title "Run integrated consumer UX validation" \
  --body "Research-only integrated consumer UX and accessibility validation; production source remains read-only."
task_008_pr_url=$(gh pr view codex/uiux-integrated-validation --json url --jq .url)
test -n "$task_008_pr_url"
```

Use `apply_patch` to replace the pending
`decisionOwner.approvalChannel` in `results.json` and the living report with
exactly `$task_008_pr_url`; commit and push that coordinate without force before
any operations approval. After that push, require:

```sh
test "$(git ls-remote --heads origin refs/heads/codex/uiux-integrated-validation | awk '{print $1}')" = "$(git rev-parse HEAD)"
test "$(jq -r '.decisionOwner.approvalChannel' research/ui-ux/integrated-consumer-ux-validation/results.json)" = "$task_008_pr_url"
test "$(gh pr view codex/uiux-integrated-validation --json isDraft,state,baseRefName,headRefName --jq '.isDraft == true and .state == "OPEN" and .baseRefName == "main" and .headRefName == "codex/uiux-integrated-validation"')" = "true"
```

Read every accepted output from Plans 004-007. Create `## Dependency decision
map` in the living report, linking each accepted consumer-language rule,
navigation hierarchy, visual territory, route archetype, and foundation
contract to the route/state where it must appear. Give every one of the eight
locked task IDs at least one row and record the exact dependency file/heading or
commit coordinate; do not keep this required mapping only in scratch.

Reproduce the three correctness confounders listed in Current state. Decide, for
each one, whether the retained sanitized prototype will:

- faithfully model the maintained intended behavior;
- exclude the affected task and state why; or
- retain the current behavior but classify resulting observations separately.

Never silently fix the production implementation or present a prototype that
misrepresents a product decision.

**Verify**: the remote draft PR exists from
`codex/uiux-integrated-validation` to `main`; the living research record names
the exact base and all four dependencies; the decision map covers all eight core
tasks and every dependency output; each known confounder has one explicit
handling decision and an owner for a later implementation plan.

### Step 2: Write the protocol, privacy boundary, screener, and moderator guide

Write the study protocol into the living research record before participant
contact. It must contain:

- immutable source coordinates, the planned tracked prototype path, and a note
  that its actual version/hash coordinates are added only after Step 4 preflight;
- research questions and explicit non-questions;
- participant matrix and exclusion criteria;
- task scripts, neutral prompts, and allowed probes;
- informed-consent and withdrawal procedure;
- whether recording is proposed and why;
- storage location, retention period, access list, and deletion procedure for
  raw research data;
- de-identification method for committed synthesis;
- exam-security interruption script;
- access accommodations and own-device/own-assistive-technology option;
- moderator and note-taker roles;
- observation schema and severity definitions;
- round-one iteration and round-two decision rules; and
- compensation/outreach proposal, if any, as a separate approval item.

The screener must not request applicant IDs, admission notices, employer data,
medical diagnoses, remembered questions, or proof of exam content.

**Verify**: the protocol has every listed section and contains no participant
contact details or secure exam material.

### Step 3: Approve the research operations boundary

Present the protocol, participant matrix, proposed recruitment channels,
compensation, recording choice, raw-data location/retention, proposed prototype
access boundary, and schedule to the operator. The exact artifact/access-method
approval remains pending until the Step 4 prototype passes internal preflight.

Do not recruit, contact, schedule, compensate, record, or publish a preview yet.
Record an explicit allow/deny decision for each proposed operation. If approval
is partial, revise the method to fit the approved boundary; do not infer broader
authority.

Copy the non-sensitive operation decisions into `results.json`; the private
record may retain operational detail, but it cannot be the only gate evidence.
Have the chartered owner post the exact `approval-kind: operations` record on
the draft PR. Record that comment URL and the SHA-256 of its exact body in every
operation row; an executor-authored summary is not approval.

```sh
node research/ui-ux/integrated-consumer-ux-validation/verify-study.mjs --phase=operations
```

**Verify**: the exact `operations` success line proves a dated allow/deny record
for every operation, the live unedited owner-authored comment and matching body
hash, all required used operations allowed, unused compensation/recording
truthfully denied or allowed, and prototype exposure still pending exact
preflight approval.

### Step 4: Build the integrated high-fidelity prototype

Build the sanitized tracked prototype listed in Scope. It realizes the accepted
outputs of Plans 004-007 across the eight core tasks and remains the
reproducibility fixture after the study. A static design tool may supplement but
not replace this code prototype for reflow, keyboard, focus, loading/error
states, and visual/nonvisual behavior.

The prototype must:

- preserve semantic HTML, the static-document/island boundary in behavior, and
  legal state transitions;
- use only existing reviewed public-safe imagery;
- include mobile-first and ample layouts;
- implement representative loading, empty, ready, selected, committing,
  revealed, reviewed, offline, and recoverable-error states;
- preserve commit-before-reveal and avoid precommit answer-bearing assets;
- expose progressive evidence without removing source access;
- support keyboard use, text enlargement, reduced motion, and forced colors; and
- clearly state that it is a research prototype if participants could confuse it
  with the live product.

Use this exact ownership:

- `fixtures.mjs`: one shared, fictional/public-precommit-safe dataset containing
  exactly the eight task IDs `orientation`, `profile-fit`, `begin-study`,
  `question-feedback`, `tool-comparison`, `hazard-practice`, `review`, and
  `offline-data-control`, plus named legal state IDs;
- `prototype.mjs`: state transitions and rendering only; no storage, analytics,
  external fetch, or production import;
- `styles.css`: the selected tokens/archetypes from Plans 006-007;
- `serve.mjs`: a loopback-only server bound to `127.0.0.1` with an allowlist for
  the listed fixture files and explicitly accepted derivative assets;
- `prototype-manifest.json`: schema version, prototype version, execution-base
  SHA, exact accepted dependency/head SHAs for Plans 004-007, task/state IDs,
  accepted asset IDs/paths, and SHA-256 for every tracked prototype source file
  except the manifest itself;
- `verify.mjs`: set equality, file/hash integrity, prohibited-path/string,
  external-request, task/state, and manifest verification; and
- the Playwright config/spec: DOM, keyboard, focus, target, reflow, large-text,
  reduced-motion, forced-color, print, precommit safety, and zero-external-
  request checks at 320 and 1440 CSS pixels. The config must require
  `NYCUSTODIAN_UIUX_SCRATCH_ROOT`, reject a missing/nonexistent path or one whose
  basename does not match the fresh SHA-scoped prefix, and set `outputDir`,
  screenshots, traces, and every generated browser artifact beneath it. The
  prototype verifier checks this contract and rejects repo-local
  `test-results/`, `playwright-report/`, or snapshot output.

Because this research directory is outside the site workspace, use these exact
ESM imports instead of bare package specifiers:

```js
import { defineConfig, expect, test } from "../../../../apps/site/node_modules/@playwright/test/index.mjs"
import AxeBuilder from "../../../../apps/site/node_modules/@axe-core/playwright/dist/index.mjs"
```

Build no public route and import no production controller/storage code. Create
one fresh SHA-scoped scratch directory for screenshots, rejected variants, and
computed-style dumps; record the exact returned path. Raw participant material
uses only the separately approved private research location.

```sh
task_008_execution_base_sha="PASTE_THE_RECORDED_40_CHARACTER_EXECUTION_BASE_SHA"
test "$(printf '%s' "$task_008_execution_base_sha" | sed -n '/^[0-9a-f]\{40\}$/p')" = "$task_008_execution_base_sha"
task_008_short_base=$(printf '%s' "$task_008_execution_base_sha" | cut -c1-12)
task_008_scratch_root=$(mktemp -d "/tmp/nycustodian-integrated-validation.${task_008_short_base}.XXXXXX")
test -d "$task_008_scratch_root"
test -z "$(find "$task_008_scratch_root" -mindepth 1 -print -quit)"
```

**Verify**:

```sh
NYCUSTODIAN_UIUX_SCRATCH_ROOT="$task_008_scratch_root" \
  node research/ui-ux/integrated-consumer-ux-validation/prototype/verify.mjs
NYCUSTODIAN_UIUX_SCRATCH_ROOT="$task_008_scratch_root" \
  node apps/site/node_modules/@playwright/test/cli.js test --config=research/ui-ux/integrated-consumer-ux-validation/prototype/playwright.config.ts
test ! -e test-results
test ! -e playwright-report
git diff --check
```

Expected: the verifier reports exactly eight task IDs, the complete declared
state set, matching SHA-256 entries, approved assets only, and zero external or
postcommit references; Chromium, Firefox, and WebKit preflight cases pass at the
required presentations; diff hygiene passes. Then run and record an internal
manual pilot at 125% application text and real 400% browser zoom. Every task is
usable and no critical security/accessibility blocker remains before exposure.

Before committing the exact preflight artifact locally, stage and verify this
exact nine-file set so its manifest can be addressed by an immutable commit
SHA:

```sh
git add \
  research/ui-ux/integrated-consumer-ux-validation/prototype/index.html \
  research/ui-ux/integrated-consumer-ux-validation/prototype/styles.css \
  research/ui-ux/integrated-consumer-ux-validation/prototype/prototype.mjs \
  research/ui-ux/integrated-consumer-ux-validation/prototype/fixtures.mjs \
  research/ui-ux/integrated-consumer-ux-validation/prototype/serve.mjs \
  research/ui-ux/integrated-consumer-ux-validation/prototype/verify.mjs \
  research/ui-ux/integrated-consumer-ux-validation/prototype/prototype-manifest.json \
  research/ui-ux/integrated-consumer-ux-validation/prototype/playwright.config.ts \
  research/ui-ux/integrated-consumer-ux-validation/prototype/integrated-validation.pw.ts
task_008_artifact_staged=$(git diff --cached --name-only | sort -u)
test -z "$(comm -3 \
  <(printf '%s\n' "$task_008_artifact_staged") \
  <(printf '%s\n' \
    research/ui-ux/integrated-consumer-ux-validation/prototype/fixtures.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/index.html \
    research/ui-ux/integrated-consumer-ux-validation/prototype/integrated-validation.pw.ts \
    research/ui-ux/integrated-consumer-ux-validation/prototype/playwright.config.ts \
    research/ui-ux/integrated-consumer-ux-validation/prototype/prototype-manifest.json \
    research/ui-ux/integrated-consumer-ux-validation/prototype/prototype.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/serve.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/styles.css \
    research/ui-ux/integrated-consumer-ux-validation/prototype/verify.mjs | sort))"
if git diff --cached | rg -n -i '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}'; then exit 1; fi
```

Commit that staged artifact locally only after the gate passes. Do not push it
if doing so would expose it outside the still-pending access boundary. Any
later source change invalidates this coordinate and requires a new
manifest/version/commit.

### Step 5: Approve the exact artifact and run round one

After preflight, present the prototype version, manifest SHA-256, exact access
method/host, expiration/access controls, proposed draft-branch publication, and
internal-pilot result to the operator. Do not contact participants, expose the
prototype, or push its local commit until the operator approves that exact
artifact, method, and repository publication. Record the decision without
credentials or participant data. Any changed source file produces a new
manifest version that requires another exposure/publication decision before
use.

Record the non-sensitive approval in `results.json`, including the local
artifact commit SHA. Have the chartered owner post the exact structured
artifact record on the same draft PR, then record and hash that comment. Before
any exposure, participant contact, or repository push, run:

```sh
node research/ui-ux/integrated-consumer-ux-validation/verify-study.mjs --phase=artifact-round-one
```

Expected: the exact `artifact-round-one` success line; the verifier reads the
manifest from the recorded Git commit and proves the approved version/hash,
access boundary, and explicit repository-publication permission match that
immutable artifact.

Run 6-8 moderated primary-participant sessions. Plan 006's selected territory
is fixed; compare a residual visual variant only when the accepted Plan 006
record explicitly leaves it unresolved and the decision owner authorizes the
bounded comparison. Ask participants to act and explain; do not teach the
proposed labels before testing them.

After each session, debrief against the observation schema. After the round:

- cluster failures by user need and task, not by screen ownership;
- distinguish language, hierarchy, visual, interaction, correctness, and access
  causes;
- map every repeated pattern to evidence from at least two participants;
- retain isolated critical safety/access failures;
- record contradictory evidence rather than voting it away; and
- prioritize revisions by task impact, recurrence, confidence, and change risk.

Update aggregate `results.json` from the approved private matrices, then run:

```sh
task_008_private_research_root="PASTE_THE_OPERATOR_APPROVED_PRIVATE_RESEARCH_ROOT"
test -f "$task_008_private_research_root/study-observations.tsv"
test -f "$task_008_private_research_root/study-patterns.tsv"
test -f "$task_008_private_research_root/participant-contexts.tsv"
node research/ui-ux/integrated-consumer-ux-validation/verify-study.mjs \
  --phase=round-one \
  --observations="$task_008_private_research_root/study-observations.tsv" \
  --patterns="$task_008_private_research_root/study-patterns.tsv" \
  --contexts="$task_008_private_research_root/participant-contexts.tsv"
git add research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md research/ui-ux/integrated-consumer-ux-validation/results.json
task_008_round_one_staged=$(git diff --cached --name-only | sort -u)
for path in research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md research/ui-ux/integrated-consumer-ux-validation/results.json; do
  printf '%s\n' "$task_008_round_one_staged" | rg -Fxq "$path" || exit 1
done
test -z "$(comm -3 <(printf '%s\n' "$task_008_round_one_staged") <(printf '%s\n' research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md research/ui-ux/integrated-consumer-ux-validation/results.json | sort))"
if git ls-files research/ui-ux/integrated-consumer-ux-validation | rg -i 'raw|transcript|recording|contact|study-observations|study-patterns|participant-contexts|\.(png|jpe?g|webp|mp[34]|wav|m4a)$'; then exit 1; fi
if git diff --cached | rg -i '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}'; then exit 1; fi
```

**Verify**: the exact round-one success line proves the artifact approval,
6–8 unique de-identified IDs, exactly eight tasks per ID, aggregate/hash
agreement, and valid pattern cardinality; no raw transcript, recording, contact
detail, matrix, or secure exam content is staged in Git.

Commit and push only this verified aggregate update without force before any
later round-two revision commit.

### Step 6: Revise only evidence-backed problems

Revise the tracked sanitized prototype and record candidate contract decisions
only in the living research report/results for high-confidence round-one
findings. Do not edit canonical product contracts before the Step 9 decision and
Step 10 promotion gate, and do not add unrelated polish between rounds.
Maintain a decision log with `change`, `evidence`, `expected outcome`, and
`round-two task` fields.

If a finding would change route inventory, exam facts, legal state semantics,
offline/persistence truth, or reveal/security behavior, stop and request a
product decision instead of incorporating it into the prototype.

**Verify**: every prototype change has a round-one evidence coordinate and a
named round-two retest; rejected suggestions have a concise rationale; the
manifest version/hashes and automated preflight are current.

### Step 7: Run round two with explicit accessibility participation

Run a second 6-8-participant round on the revised end-to-end journeys. Ensure the
combined sample includes the access strategies and mobile/low-bandwidth contexts
named in Research design. When a participant normally uses assistive technology,
let them use their own familiar setup where practical.

Before exposing or publishing the revised artifact, repeat the Step 5 exact-
version/access/repository-publication approval for its new manifest hash. A
prior version's approval does not carry forward automatically. First rerun the
complete automated preflight against the revised bytes in a new empty
SHA-scoped scratch directory:

```sh
task_008_round_two_execution_base_sha="PASTE_THE_RECORDED_40_CHARACTER_EXECUTION_BASE_SHA"
test "$(printf '%s' "$task_008_round_two_execution_base_sha" | sed -n '/^[0-9a-f]\{40\}$/p')" = "$task_008_round_two_execution_base_sha"
task_008_round_two_short_base=$(printf '%s' "$task_008_round_two_execution_base_sha" | cut -c1-12)
task_008_round_two_scratch_root=$(mktemp -d "/tmp/nycustodian-integrated-validation.${task_008_round_two_short_base}.XXXXXX")
test -z "$(find "$task_008_round_two_scratch_root" -mindepth 1 -print -quit)"
NYCUSTODIAN_UIUX_SCRATCH_ROOT="$task_008_round_two_scratch_root" \
  node research/ui-ux/integrated-consumer-ux-validation/prototype/verify.mjs
NYCUSTODIAN_UIUX_SCRATCH_ROOT="$task_008_round_two_scratch_root" \
  node apps/site/node_modules/@playwright/test/cli.js test --config=research/ui-ux/integrated-consumer-ux-validation/prototype/playwright.config.ts
test ! -e test-results
test ! -e playwright-report
```

The exact verifier and all configured Chromium, Firefox, and WebKit cases must
pass before staging or approving the revised artifact.

Stage only revised files from the exact prototype allowlist, require the updated
manifest, and reject contact data before creating the local artifact commit:

```sh
git add research/ui-ux/integrated-consumer-ux-validation/prototype
task_008_round_two_artifact_staged=$(git diff --cached --name-only | sort -u)
test -n "$task_008_round_two_artifact_staged"
printf '%s\n' "$task_008_round_two_artifact_staged" | rg -Fxq \
  research/ui-ux/integrated-consumer-ux-validation/prototype/prototype-manifest.json
test -z "$(comm -23 \
  <(printf '%s\n' "$task_008_round_two_artifact_staged") \
  <(printf '%s\n' \
    research/ui-ux/integrated-consumer-ux-validation/prototype/fixtures.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/index.html \
    research/ui-ux/integrated-consumer-ux-validation/prototype/integrated-validation.pw.ts \
    research/ui-ux/integrated-consumer-ux-validation/prototype/playwright.config.ts \
    research/ui-ux/integrated-consumer-ux-validation/prototype/prototype-manifest.json \
    research/ui-ux/integrated-consumer-ux-validation/prototype/prototype.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/serve.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/styles.css \
    research/ui-ux/integrated-consumer-ux-validation/prototype/verify.mjs | sort))"
if git diff --cached | rg -n -i '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}'; then exit 1; fi
```

Commit that verified revised preflight artifact locally, update its exact
second-round approval record in `results.json`, and run before exposure:

```sh
node research/ui-ux/integrated-consumer-ux-validation/verify-study.mjs --phase=artifact-round-two
```

Expected: the exact second-artifact success line proves the version/hash/commit
and exposure approval differ from or explicitly supersede round one's.

Repeat the same task measures. Add focused checks for:

- 400% zoom and large text;
- keyboard navigation, focus order, and recovery;
- screen-reader landmarks, labels, status, error, reveal, and source disclosure;
- target size and touch operation;
- visual/nonvisual hazard task distinction;
- reduced motion and forced colors; and
- print comprehension where print is relevant to the participant.

Update aggregate results from the same approved private matrices, then run:

```sh
task_008_private_research_root="PASTE_THE_OPERATOR_APPROVED_PRIVATE_RESEARCH_ROOT"
node research/ui-ux/integrated-consumer-ux-validation/verify-study.mjs \
  --phase=round-two \
  --observations="$task_008_private_research_root/study-observations.tsv" \
  --patterns="$task_008_private_research_root/study-patterns.tsv" \
  --contexts="$task_008_private_research_root/participant-contexts.tsv"
git add research/ui-ux/integrated-consumer-ux-validation/results.json
task_008_round_two_results_staged=$(git diff --cached --name-only | sort -u)
test -z "$(comm -3 \
  <(printf '%s\n' "$task_008_round_two_results_staged") \
  <(printf '%s\n' research/ui-ux/integrated-consumer-ux-validation/results.json))"
if git diff --cached | rg -n -i '[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}'; then exit 1; fi
if git ls-files research/ui-ux/integrated-consumer-ux-validation | rg -i 'raw|transcript|recording|contact|study-observations|study-patterns|participant-contexts|\.(png|jpe?g|webp|mp[34]|wav|m4a)$'; then exit 1; fi
```

**Verify**: the exact round-two success line proves 6–8 completed unique IDs,
all eight tasks, at least two round-two access-strategy participants, required
combined contexts, every critical round-one retest, pattern cardinality, and
zero unresolved critical failures of any cardinality. An unrepresented required context
is a BLOCKED evidence gap, not a certification claim.

Only after those checks pass, commit and push the exact aggregate result update
without force. The revised artifact commit may travel in that push only when
its approved exposure boundary permits repository publication; otherwise stop
and resolve the conflict between immutable Git evidence and the approved access
boundary before participant exposure.

### Step 8: Produce the concise evidence synthesis

Finalize
`research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md`. It must become
a concise de-identified synthesis, not a transcript/receipt archive. Include:

- status, immutable source/prototype coordinates, dates, method, and limitations;
- participant matrix in aggregate;
- task-by-task results and observed patterns;
- round-one changes and round-two outcomes;
- accessibility participation and untested access contexts;
- selected/rejected language, navigation, visual, and component decisions;
- correctness defects separated from design findings;
- contradictions and unresolved decisions;
- implementation priorities and acceptance measures; and
- a source ledger for external methodology references.

Update `research/README.md` with one retained-map entry and explain why this
evidence remains necessary. Do not create raw-data, recordings, screenshots,
receipts, or archive subdirectories.

**Verify**:

```sh
test -f research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md
test -f research/ui-ux/integrated-consumer-ux-validation/results.json
for heading in 'Status and scope' Method 'Participant matrix' 'Task findings' 'Accessibility evidence' Decisions Limitations 'Implementation priorities' 'Source ledger'; do
  test "$(rg -Fxc "## $heading" research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md)" -eq 1 || exit 1
done
rg -n 'integrated-consumer-ux-validation-2026-08-26.md' research/README.md
```

Expected: all required sections and the retained-map entry exist.

### Step 9: Hold the final decision review

Present:

- selected consumer language and navigation model;
- selected visual/foundation system;
- task and accessibility evidence;
- remaining critical/repeated failures;
- correctness blockers;
- proposed implementation order; and
- what was not researched.

The maintainer must explicitly choose one of: accept for implementation, accept
with named conditions, run another research round, or reject. Do not label the
program validated while any critical task failure remains unresolved.

Record the role, date, decision, conditions, remaining evidence gaps, and
rationale under `## Final decision` in the synthesis. An “accept with
conditions” decision may carry bounded implementation or certification
conditions; it may not waive any critical task/accessibility failure. If
the decision is “run another round” or “reject,” publish that truthful status to
the draft PR and STOP without changing canonical product contracts.

Mirror the non-sensitive decision in `results.json`, bound to the concrete
chartered owner and durable approval artifact. Compute the canonical JSON hash
of the sorted proposed promotion rows, include that hash plus both tested
artifact coordinates in the exact final-decision comment posted by the owner,
and store its URL/body hash. Then run the structured gate in addition to
checking the human-readable synthesis:

**Verify**:

```sh
test "$(rg -Fxc '## Final decision' research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md)" -eq 1
test "$(rg -c '^Decision: (accept for implementation|accept with conditions|run another research round|reject)$' research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md)" -eq 1
test "$(rg -c '^Decision owner: .+' research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md)" -eq 1
test "$(rg -c '^Decision date: [0-9]{4}-[0-9]{2}-[0-9]{2}$' research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md)" -eq 1
node research/ui-ux/integrated-consumer-ux-validation/verify-study.mjs --phase=decision
```

Expected: the heading and all three decision fields exist exactly once, and the
exact `final` verifier line proves two valid rounds, artifact-bound approvals,
eight-task/access-context coverage, all critical retests, zero unresolved
critical failures, and an owner-matching acceptance. Proceed to Step 10
only for `accept for implementation` or `accept with conditions`.

### Step 10: Promote the accepted decisions and close the research branch

Only after the Step 9 acceptance gate, update the applicable maintained
authority once, without duplicating the research report:

- `product/CONTENT_DESIGN.md`: accepted vocabulary, voice, disclosure, and copy
  comprehension gates;
- `product/ROUTES.md`: accepted task hierarchy and navigation responsibilities;
- `product/COMPONENT_ARCHITECTURE.md`: accepted route archetypes/foundations and
  state presentation responsibilities;
- `product/DESIGN_SYSTEM.md`: accepted visual system, responsive behavior, and
  consumer UX/accessibility gates;
- `docs/LANDSCAPE.md`: only durable competitive/design evidence; and
- `docs/OPEN.md`: unresolved decisions, untested access contexts, conditional
  acceptance work, and separate correctness implementation needs.

Make promotion machine-checkable. `results.json.canonicalPromotions` must have
exactly these seven rows and fixed homes:

| Decision ID | Required status | Canonical path |
|---|---|---|
| `consumer-language` | `promoted` | `product/CONTENT_DESIGN.md` |
| `task-navigation` | `promoted` | `product/ROUTES.md` |
| `visual-system` | `promoted` | `product/DESIGN_SYSTEM.md` |
| `ui-foundations` | `promoted` | `product/COMPONENT_ARCHITECTURE.md` |
| `responsive-behavior` | `promoted` | `product/DESIGN_SYSTEM.md` |
| `consumer-ux-accessibility-gates` | `promoted` | `product/DESIGN_SYSTEM.md` |
| `correctness-confounders` | `unresolved` | `docs/OPEN.md` |

For each row, place one concise bounded section in the canonical file using
exact unique markers `<!-- plan-008:<decisionId>:start -->` and
`<!-- plan-008:<decisionId>:end -->`. Store SHA-256 of the normalized bounded
content in `normalizedContentSha256`. The study verifier must require exact row
set/path/status equality, one ordered marker pair, non-empty content, hash
equality, no duplicate canonical row, and a base-relative change to each of the
five required files. Optional `SCREEN_STATES` clarification or durable
`LANDSCAPE` evidence remains described in the synthesis and its own maintained
section; it does not add or replace a locked promotion row.

Define a future implementation sequence by route family with exact acceptance
tasks. Do not implement it. The sequence must require characterization tests for
the three correctness confounders before visual migration and cross-route
visual/accessibility regression after each tranche.

Confirm every accepted decision has exactly one canonical product home, every
unresolved issue has an owner/next evidence action in `docs/OPEN.md`, and no
conclusion is promoted to exam fact. Retain the exact tracked sanitized
prototype, its manifest, browser fixture, aggregate results, and verifiers as
the minimal reproducible decision evidence. Remove only task-specific scratch,
screenshots, computed dumps, and rejected variants from the worktree; keep or
delete private raw research solely according to the approved retention plan.

Update Plan 008's row in `plans/README.md` to `DONE` only after the Step 9
acceptance and all gates below pass. Before the final commit, verify the retained
fixture and the complete candidate path set across committed, staged, unstaged,
and untracked paths:

**Verify**:

```sh
task_008_execution_base_sha="PASTE_THE_RECORDED_40_CHARACTER_EXECUTION_BASE_SHA"
test "$(printf '%s' "$task_008_execution_base_sha" | sed -n '/^[0-9a-f]\{40\}$/p')" = "$task_008_execution_base_sha"
for path in \
  plans/README.md \
  research/README.md \
  research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md \
  research/ui-ux/integrated-consumer-ux-validation/results.json \
  research/ui-ux/integrated-consumer-ux-validation/verify-study.mjs \
  research/ui-ux/integrated-consumer-ux-validation/prototype/index.html \
  research/ui-ux/integrated-consumer-ux-validation/prototype/styles.css \
  research/ui-ux/integrated-consumer-ux-validation/prototype/prototype.mjs \
  research/ui-ux/integrated-consumer-ux-validation/prototype/fixtures.mjs \
  research/ui-ux/integrated-consumer-ux-validation/prototype/serve.mjs \
  research/ui-ux/integrated-consumer-ux-validation/prototype/verify.mjs \
  research/ui-ux/integrated-consumer-ux-validation/prototype/prototype-manifest.json \
  research/ui-ux/integrated-consumer-ux-validation/prototype/playwright.config.ts \
  research/ui-ux/integrated-consumer-ux-validation/prototype/integrated-validation.pw.ts; do
  test -f "$path" || exit 1
done
test "$(rg -c '^\| 008 \| Run integrated consumer UX and accessibility validation \|.*\| DONE' plans/README.md)" -eq 1
task_008_final_short_base=$(printf '%s' "$task_008_execution_base_sha" | cut -c1-12)
task_008_final_scratch_root=$(mktemp -d "/tmp/nycustodian-integrated-validation.${task_008_final_short_base}.XXXXXX")
NYCUSTODIAN_UIUX_SCRATCH_ROOT="$task_008_final_scratch_root" \
  node research/ui-ux/integrated-consumer-ux-validation/prototype/verify.mjs
NYCUSTODIAN_UIUX_SCRATCH_ROOT="$task_008_final_scratch_root" \
  node apps/site/node_modules/@playwright/test/cli.js test --config=research/ui-ux/integrated-consumer-ux-validation/prototype/playwright.config.ts
test ! -e test-results
test ! -e playwright-report
node research/ui-ux/integrated-consumer-ux-validation/verify-study.mjs --phase=final
bun run verify
git diff --check
git diff --quiet "$task_008_execution_base_sha"...HEAD -- apps packages content illustration
task_008_candidate_paths=$({ git diff --name-only "$task_008_execution_base_sha"...HEAD; git diff --name-only; git diff --cached --name-only; git ls-files --others --exclude-standard; } | sort -u)
for path in product/CONTENT_DESIGN.md product/ROUTES.md product/COMPONENT_ARCHITECTURE.md product/DESIGN_SYSTEM.md docs/OPEN.md; do
  printf '%s\n' "$task_008_candidate_paths" | rg -Fxq "$path" || exit 1
done
test -z "$(comm -23 \
  <(printf '%s\n' "$task_008_candidate_paths") \
  <(printf '%s\n' \
    docs/LANDSCAPE.md \
    docs/OPEN.md \
    plans/README.md \
    product/COMPONENT_ARCHITECTURE.md \
    product/CONTENT_DESIGN.md \
    product/DESIGN_SYSTEM.md \
    product/ROUTES.md \
    product/SCREEN_STATES.md \
    research/README.md \
    research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md \
    research/ui-ux/integrated-consumer-ux-validation/results.json \
    research/ui-ux/integrated-consumer-ux-validation/verify-study.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/index.html \
    research/ui-ux/integrated-consumer-ux-validation/prototype/styles.css \
    research/ui-ux/integrated-consumer-ux-validation/prototype/prototype.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/fixtures.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/serve.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/verify.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/prototype-manifest.json \
    research/ui-ux/integrated-consumer-ux-validation/prototype/playwright.config.ts \
    research/ui-ux/integrated-consumer-ux-validation/prototype/integrated-validation.pw.ts | sort))"
```

Expected: the base format gate, retained prototype hash/set verifier, all
Chromium/Firefox/WebKit prototype cases, structured study gate, and repository
verification pass; the production diff and exact committed/index/worktree/
untracked allowlist comparison have no output.

Commit and push the verified final state without force. Update the draft PR
with methods, aggregate counts, artifact coordinates/approvals, decision,
limitations, verification, and final head; leave it draft and unmerged. Then
rerun publication closure:

```sh
task_008_postcommit_short_base=$(printf '%s' "$task_008_execution_base_sha" | cut -c1-12)
task_008_postcommit_scratch_root=$(mktemp -d "/tmp/nycustodian-integrated-validation.${task_008_postcommit_short_base}.XXXXXX")
NYCUSTODIAN_UIUX_SCRATCH_ROOT="$task_008_postcommit_scratch_root" \
  node research/ui-ux/integrated-consumer-ux-validation/prototype/verify.mjs
node research/ui-ux/integrated-consumer-ux-validation/verify-study.mjs --phase=final
git diff --check "$task_008_execution_base_sha"...HEAD
task_008_committed_paths=$(git diff --name-only "$task_008_execution_base_sha"...HEAD | sort -u)
for path in product/CONTENT_DESIGN.md product/ROUTES.md product/COMPONENT_ARCHITECTURE.md product/DESIGN_SYSTEM.md docs/OPEN.md; do
  printf '%s\n' "$task_008_committed_paths" | rg -Fxq "$path" || exit 1
done
test -z "$(comm -23 \
  <(printf '%s\n' "$task_008_committed_paths") \
  <(printf '%s\n' \
    docs/LANDSCAPE.md \
    docs/OPEN.md \
    plans/README.md \
    product/COMPONENT_ARCHITECTURE.md \
    product/CONTENT_DESIGN.md \
    product/DESIGN_SYSTEM.md \
    product/ROUTES.md \
    product/SCREEN_STATES.md \
    research/README.md \
    research/ui-ux/integrated-consumer-ux-validation-2026-08-26.md \
    research/ui-ux/integrated-consumer-ux-validation/results.json \
    research/ui-ux/integrated-consumer-ux-validation/verify-study.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/index.html \
    research/ui-ux/integrated-consumer-ux-validation/prototype/styles.css \
    research/ui-ux/integrated-consumer-ux-validation/prototype/prototype.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/fixtures.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/serve.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/verify.mjs \
    research/ui-ux/integrated-consumer-ux-validation/prototype/prototype-manifest.json \
    research/ui-ux/integrated-consumer-ux-validation/prototype/playwright.config.ts \
    research/ui-ux/integrated-consumer-ux-validation/prototype/integrated-validation.pw.ts | sort))"
test -z "$(git status --porcelain)"
task_008_remote_head_sha=$(git ls-remote --heads origin refs/heads/codex/uiux-integrated-validation | awk '{print $1}')
test "$task_008_remote_head_sha" = "$(git rev-parse HEAD)"
task_008_pr_json=$(gh pr view codex/uiux-integrated-validation --json isDraft,state,baseRefName,headRefName,headRefOid,url)
test "$(printf '%s' "$task_008_pr_json" | jq -r '.isDraft')" = "true"
test "$(printf '%s' "$task_008_pr_json" | jq -r '.state')" = "OPEN"
test "$(printf '%s' "$task_008_pr_json" | jq -r '.baseRefName')" = "main"
test "$(printf '%s' "$task_008_pr_json" | jq -r '.headRefName')" = "codex/uiux-integrated-validation"
test "$(printf '%s' "$task_008_pr_json" | jq -r '.headRefOid')" = "$(git rev-parse HEAD)"
printf '%s' "$task_008_pr_json" | jq -er '.url | select(type == "string" and length > 0)'
git log --oneline "$task_008_execution_base_sha"..HEAD
```

Expected: retained evidence remains valid, only exact authorized files exist in
the final range, status is clean, remote and local heads match, and the final
commit list is reported.

## Test plan

This research plan does not add production tests. Its implementation handoff
must require:

- deterministic fixtures for every applicable legal route state;
- visual-regression screenshots for all route archetypes at constrained and
  ample widths, based on the accepted design rather than the current baseline;
- separate assertions for semantics, keyboard order, focus, announcements,
  target size, reflow, forced colors, reduced motion, print, route closure, and
  precommit answer safety;
- loading/restoring/empty/error fixtures for local-data routes;
- state-gated question/hazard/review navigation and history behavior;
- mobile projects or explicit mobile viewport fixtures;
- manual 400% zoom, assistive-technology, physical print, grayscale, and
  low-bandwidth certification; and
- task-based moderated validation after the first integrated implementation
  tranche, not only at the end of migration.

## Done criteria

All conditions must hold:

- [ ] Plans 004-007 are DONE and the exact merged execution base is recorded.
- [ ] Connected GitHub verified the immutable base and absent output branch;
      the named branch, truthful initial push, and early draft PR existed before
      extended work.
- [ ] The operator recorded an explicit allow/deny decision for recruitment,
      outreach, compensation, recording, prototype access, and data retention;
      every external action stayed within the allowed scope.
- [ ] Two primary rounds of 6-8 completed participants were run. An incomplete
      study is published truthfully and marked BLOCKED, not DONE.
- [ ] Structured operation and exact-artifact approval phases pass; both
      artifact records resolve to immutable manifest commits and approved
      exposure boundaries.
- [ ] The combined sample deliberately includes mobile-first, varied digital
      confidence, low-bandwidth, limited-English, and relevant access-strategy
      contexts; any gap is explicit.
- [ ] All eight core tasks were exercised in both rounds or have a documented
      blocker and maintainer decision.
- [ ] Every repeated pattern has at least two de-identified observations in its
      round; isolated critical safety/access failures are retained.
- [ ] No critical failure of any cardinality remains unresolved in the final
      accepted direction.
- [ ] Correctness confounders are separated and assigned to future plans.
- [ ] The concise synthesis and `research/README.md` map entry exist; no raw
      participant data or secure exam content is committed.
- [ ] The retained sanitized prototype, manifest, aggregate JSON, prototype
      verifier, browser fixture, and study verifier all pass after final
      normalization.
- [ ] Accepted conclusions are promoted once into the correct product/docs
      authority, with unresolved items in `docs/OPEN.md`.
- [ ] A maintainer decision explicitly accepts the direction for implementation
      or accepts it with named non-critical conditions.
- [ ] `bun run verify` and `git diff --check` exit 0.
- [ ] No file outside the in-scope list is modified.
- [ ] `plans/README.md` is updated.

## STOP conditions

Stop and report rather than improvising if:

- any dependency plan is not accepted and merged;
- the merged execution base or cited current behavior cannot be verified;
- the named output branch already exists unexpectedly;
- GitHub write access or an authorized private raw-research location is absent;
- participant contact, external prototype access, or raw-data storage/retention
  lacks explicit authorization; or compensation/recording is actually proposed
  but lacks explicit authorization. An explicit denial is valid when the revised
  method does not use that action;
- a participant supplies or begins reproducing secure/remembered exam content;
- safe consent, withdrawal, de-identification, accommodation, or data deletion
  cannot be provided;
- a prototype would expose answer-bearing content before commitment or imply
  official status;
- resolving a finding requires changing exam facts, route inventory, legal state
  semantics, persistence truth, or security boundaries without a maintainer
  decision;
- fewer than 6 usable primary sessions are completed in a round; publish the
  limited evidence truthfully, mark the plan BLOCKED, and do not claim
  integrated validation;
- any critical failure remains unresolved after round two; or
- any repository verification gate fails twice after a reasonable correction.

## Maintenance notes

- The committed synthesis is evidence, not a participant database. Keep raw
  research outside Git and delete it according to the approved retention plan.
- Re-run focused usability research when the audience, language, route hierarchy,
  primary practice flow, offline behavior, or visual system changes materially.
- Do not convert small-sample task observations into population statistics or
  claim accessibility certification for unrepresented technologies.
- Automated visual regression should begin only after the accepted visual system
  is implemented; baselining the current generic UI would freeze the wrong
  design.
- Preserve transparency and technical integrity through progressive disclosure.
  Future copy changes should be reviewed against the consumer-language contract,
  not by deleting evidence or uncertainty.
