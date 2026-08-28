# CODEX-ONLY-UIUX-V1 language and consumer-trust review

```yaml
programVersion: CODEX-ONLY-UIUX-V1
agentTaskId: /root/language_lane_v1
reportId: CODEX-ONLY-UIUX-V1-LANGUAGE-TRUST
actorClass: codex-agent
independent: true
findingIds: ["LT-01","LT-02","LT-03","LT-04","LT-05","LT-06","LT-07","LT-08","LT-09","LT-10","DS-01","DS-04","HC-04","HC-05","HC-06"]
recommendationIds: ["CL-H1-PLAIN-TASK-OPEN-PROOF"]
evidenceMode: codex-only
humanEvidence: none
humanParticipantCount: 0
notHumanUsabilityTested: true
statusLabel: NOT HUMAN-USABILITY-TESTED
reviewStatus: complete
```

## Audit record

| Field | Value |
|---|---|
| `reportId` | `CODEX-ONLY-UIUX-V1-LANGUAGE-TRUST` |
| `recommendationId` | `CL-H1-PLAIN-TASK-OPEN-PROOF` |
| `evidenceMode` | `codex-only` |
| `humanEvidence` | `none` |
| `humanParticipantCount` | `0` |
| `notHumanUsabilityTested` | `true` |
| Required label | **NOT HUMAN-USABILITY-TESTED** |
| Current-site implementation base | `9fc7dcacfc961752e5d9a2cedbc426deead54a05` |
| Preserved Plan 004 evidence head | `fecc71c5ea240385b3d98f896b1152022a2bbbe8` |
| Recovered prototype coordinate | `9fc7dcacfc961752e5d9a2cedbc426deead54a05` |
| Prototype set status | Recovered editable `CL-1`; unpiloted, unfrozen, unselected, and not production copy |
| Review boundary | Public wording, accessible/error wording, consumer trust, AI-slop effects, and language implications for navigation |

## Scoring rubric

All scores are Codex-only expert-review scores, not observed usability results. `1` is poor, `3` is mixed, and `5` is strong.

| Code | Dimension | A score of 5 means |
|---|---|---|
| `R1` | Task and next-action clarity | The learner immediately knows what the page is for, what to do, and what happens next. |
| `R2` | Plain-language boundary | Default copy uses ordinary task words; model, build, release, and storage terms are absent or disclosed later. |
| `R3` | Trust calibration | Independence, provenance, unknowns, privacy, and limits are accurate, economical, and do not overclaim. |
| `R4` | State and recovery clarity | Errors and status copy state what happened, what was preserved, and the next safe action. |
| `R5` | Natural voice / AI-slop resistance | Copy avoids templated cadence, repeated assurances, abstract noun stacks, and unexplained precision claims. |
| `R6` | Navigation-language fit | Labels match learner tasks and do not require knowledge of the product's internal taxonomy. |

## Immutable evidence ledger

Every line coordinate below resolves against the listed immutable commit and raw-file SHA-256.

| Key | Immutable file | SHA-256 |
|---|---|---|
| `E01` | `apps/site/scripts/generate-pages.tsx` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `239f102cc0cbc46053c4f4e5fd40e16e98e45c0cdff1d269771e28061dc569ba` |
| `E02` | `apps/site/src/question-player/react/question-form.tsx` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `87d846bc0d4fe218b386d21c31c35970d18293aa43c194ac1d7a0f2642e92223` |
| `E03` | `apps/site/src/question-player/react/feedback.tsx` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `b53b202e089f2a3885b9c18ab33d51d55adb085c461f4afe8c43fbb528c55725` |
| `E04` | `apps/site/src/hazard-player/react/results.tsx` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `1dadd860da45852262d82cd5b35ad73c3da3688436779da8c69d89e7a926e284` |
| `E05` | `apps/site/src/review/react/review-queue.tsx` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `c8ce32e08358bf489217ddf275b9e937dab5043e3b2bf299fff7a6a6e1119096` |
| `E06` | `apps/site/src/offline-packs/react/pack-manager.tsx` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `48c80fb01bab5976f0432c1d1c4863b4e66ebaffb41fdc7ab45bef114d27eaa0` |
| `E07` | `apps/site/src/settings/react/settings.tsx` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `0024e7c9f21bd8f3fac8dd8af31eb9335ff26f82e3c4b0cdd7df887403ebb165` |
| `E08` | `apps/site/src/local-failure-detail.ts` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `dd52b5f14999e3af4cf887683e9b6282dc6805ca4d30eb5689cd1061c4a5e2a4` |
| `E09` | `apps/site/src/simulation/react/setup.tsx` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `936da350013a6e9dfb35d173e2fae85701872fb38dc523e187edebf44de10182` |
| `E10` | `apps/site/src/simulation/react/results.tsx` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `4196fbf9c3292cfb0e7a70c46796784ac3f5aa077a098296b8ec9e9420d8074f` |
| `E11` | `apps/site/src/corrections/react/correction-form.tsx` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `a87454dc412aad5ec67af4fab3cf96a58a1391c441a58bb1e6e1617707fe9fcf` |
| `E12` | `content/authoring/packs/launch-v1.curated.mjs` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `04805eb0e7c653f035aeaf934ddfdfafd1863cbe8bd1f2f87a02d3f3c66366c1` |
| `A01` | `product/FEATURE_SPEC.md` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `a1c3d2441fd85162931d17eb3752029e533cd37b8268a842c0a1a4ee8713dd48` |
| `A02` | `product/ROUTES.md` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `9478211d12646c94688853787e652919adf4889bd7f2f920e4b37b0572eec227` |
| `A03` | `product/DESIGN_SYSTEM.md` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `12532bbb78166ae4ffb684ea15f57d400761668e55f2845fec602e4ba9394039` |
| `A04` | `illustration/VISUAL_AUTHORING_POLICY.md` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `a17d47cd976fbd4caa2b57f834216450f8316063d0b9759ef4fbd0e451d0d904` |
| `A05` | `apps/site/offline/index.html` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `b56b309f6f4faefe6fdee5958cfe1c0f4102629cfa18e2cb6a1d4708c5eb8def` |
| `P01` | `plans/004-establish-consumer-language-boundary.md` @ `fecc71c5ea240385b3d98f896b1152022a2bbbe8` | `0804b4303dd54a22764eb70b7b51026edb8cd988041f832ece8c7a7093a92880` |
| `S01` | `research/ui-ux/consumer-language-study-2026-08-26.md` @ `fecc71c5ea240385b3d98f896b1152022a2bbbe8` | `790679c137c798d45492ffbef98ac079934abb794b5c4add923781fc10913431` |
| `R00` | `recovery/plan-004-consumer-language-prototypes/recovery-manifest.json` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `a4c9f7ae8b077c7449c7ebf55a004a27559327526f0b02f8343fe59675b56bc2` |
| `R01` | `recovery/plan-004-consumer-language-prototypes/prototypes/home.html` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `05df1d5bdc797137d0b35e0a30eaf1b2781351e542b0b4d7a2c68da42d8231b2` |
| `R02` | `recovery/plan-004-consumer-language-prototypes/prototypes/profile.html` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `e672f50871d80572cdc2e6f13e3fe85e04a8c5ac186f0228093ce85e8fd79ca6` |
| `R03` | `recovery/plan-004-consumer-language-prototypes/prototypes/practice-start.html` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `cfe277890d2c6ef9490c74055c6ba94a5921a0a6c465aaf34b3b960a07a4e06e` |
| `R04` | `recovery/plan-004-consumer-language-prototypes/prototypes/question-feedback.html` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `10336e7ce3d85b587b0eea5f8e8eb6d717e1a595775e11256201f62b45c676db` |
| `R05` | `recovery/plan-004-consumer-language-prototypes/prototypes/hazard-feedback.html` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `c9441b28584f1453b8afe982f61c906a9d5f98e352fcc886b1e135e64b3e495b` |
| `R06` | `recovery/plan-004-consumer-language-prototypes/prototypes/review.html` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `207ff61103d67bdd5dd5be8d4ef154cb804aa767f2583ea57698525f664c2c67` |
| `R07` | `recovery/plan-004-consumer-language-prototypes/prototypes/offline-data.html` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `0eede6bbc7d6c7f2a2b1434eb7f2ad1fa3929c0ecf3bc9fe823151a558d42a8f` |
| `R08` | `recovery/plan-004-consumer-language-prototypes/prototypes/trust-recovery.html` @ `9fc7dcacfc961752e5d9a2cedbc426deead54a05` | `36f1cec7646ccddf7e5cd525b88517cf7372cfc5eb187beae7332bac4eafa2f4` |

## Current-site rubric score

| Candidate | `R1` | `R2` | `R3` | `R4` | `R5` | `R6` | Mean | Evidence confidence |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Current implementation at `9fc7dca` | 2 | 1 | 2 | 3 | 2 | 2 | 2.0 | High for source wording; no participant evidence |

## Structured findings

### `LT-01` — Put the learner proposition before release architecture

| Field | Finding |
|---|---|
| Severity | High |
| Rubric tags | `BUILD_RELEASE`, `TASK_HIDDEN`, `ABSTRACT`, `TRUST_REVERSAL` |
| Disposition | `REWRITE`; `MOVE_TO_DETAILS` for release/provenance machinery |
| Evidence | `E01:155-175` brands the site “NY Custodian Exam,” reserves the independent/unofficial statement for the footer, and exposes seven product-area labels. `E01:914-930` leads with “Source-backed · local-first,” “retrieval questions,” commitment, “interactive runtime,” and “source receipt.” |
| Finding | The page has a memorable heading, but it does not first say in ordinary words that this is a free, independent study site for the supported entry-level series. Integrity mechanics compete with audience, purpose, and first action. |
| Consumer impact | A first-time visitor must infer official status, intended exam level, and what “local-first” or “retrieval” means before deciding whether to trust or use the site. |
| Navigation implication | The persistent identity should contain “Study” or “Independent study”; first-page calls to action should be learner tasks, not proof that the release pipeline exists. |

### `LT-02` — Rename navigation around learner tasks while preserving route identities

| Field | Finding |
|---|---|
| Severity | High |
| Rubric tags | `INTERNAL_MODEL`, `TASK_HIDDEN`, `UNDEFINED_JARGON` |
| Disposition | `REWRITE` display labels; keep canonical route IDs and paths |
| Evidence | `E01:158-167` exposes “Exam profile,” “Tool atlas,” “Practice,” “Hazards,” “Transparency,” “Offline packs,” and “Settings” as peer primary links. `A02:18-27` explicitly allows display labels to change without changing stable route identity. `A02:154-164` assigns shell ownership and requires task-focused player navigation. `R01:27-32` supplies concrete task candidates: start practice, look up a tool, spot hazards, and check an exam. |
| Finding | The current header mirrors feature containers and technical support areas. “Atlas,” “transparency,” and “offline packs” are learned product vocabulary, while the high-value local task “Review” is absent. |
| Consumer impact | The learner must translate the site's ontology into intent; utility and trust areas compete visually with study actions. |
| Navigation implication | Candidate labels are “Check my exam,” “Start practice,” “Study tools,” “Spot hazards,” and “Review.” “Sources / How we know,” “Offline and data,” and “Settings” belong in a clearly secondary utility/help group. Final hierarchy remains owned by the navigation lane. |

### `LT-03` — Keep profile truth while moving pipeline coordinates out of the default layer

| Field | Finding |
|---|---|
| Severity | High |
| Rubric tags | `INTERNAL_MODEL`, `BUILD_RELEASE`, `ACCESSIBILITY_COMPREHENSION` |
| Disposition | `REWRITE`; `MOVE_TO_DETAILS`; `KEEP` explicit unknown/conflict meaning |
| Evidence | `E01:1078-1121` displays profile/pack versions, “fact states,” “series layer,” “compatibility,” “accepted atlas tools,” “scored-practice eligible tools,” a raw compatibility key, fact-sheet versions, and source registries. `E01:1158-1170` and `E01:1194-1203` lead the atlas with accepted/Tier/watchlist/release-ledger language. `A01:33-38` requires truthful unknowns and separate series; `A01:135-142` requires profile/version context only where it affects content. `R02:23-44` demonstrates direct exam-fit and “what we know” wording. |
| Finding | Required truth is present, but the learner must parse editorial and publication-state nouns before answering “Does this match my exam?” |
| Consumer impact | Excess precision can look official while making genuine limits harder to find. It also makes source rigor feel like product incompleteness. |
| Navigation implication | Use “Check my exam” at entry; show exam fit, known/unknown facts, and the controlling announcement first. Put keys, versions, tiers, and change history under “Technical details” or “How this page was checked.” |

### `LT-04` — Describe practice choices, not inventory and repeatability machinery

| Field | Finding |
|---|---|
| Severity | High |
| Rubric tags | `INTERNAL_MODEL`, `BUILD_RELEASE`, `TASK_HIDDEN`, `ABSTRACT` |
| Disposition | `REWRITE`; `MOVE_TO_DETAILS` for repeatability controls |
| Evidence | `E01:1138-1151` says the “bank” must “supply” a set and explains “filtered inventory capacity,” “answer-independent memberships,” release identity, reviewed objectives, and local commitment. `E09:152-221` adds “practice constructs,” “site-designed set length,” “deterministic set seed,” and “saved manifest … restoration truth.” `E09:232-242` exposes exact images, receipt coordinates, answer bytes, and an immutable snapshot. `E10:332-362` carries compatibility keys plus “authored targets” and false-positive taxonomies into results. `R03:24-55` instead names lengths, no-repeat behavior, truthful shortfall, and recovery in direct language. |
| Finding | The UI explains why generation is deterministic before it explains the simple choice and consequence. The required practice-only score caveat is accurate but surrounded by build vocabulary. |
| Consumer impact | Starting a set feels like configuring a content compiler. Advanced repeatability controls can distract or intimidate learners who only want a short practice set. |
| Navigation implication | Prefer “Choose a practice set” and “Make a practice set.” Put “Repeat this exact set” behind an optional advanced control, not the main flow. |

### `LT-05` — Translate commitment and source machinery at the answer boundary

| Field | Finding |
|---|---|
| Severity | High |
| Rubric tags | `UNDEFINED_JARGON`, `INTERNAL_MODEL`, `AI_CADENCE` |
| Disposition | `REWRITE`; `MOVE_TO_DETAILS`; preserve commit-before-reveal and source evidence |
| Evidence | `E02:15-17` already explains the order in ordinary words, but `E02:92-98` labels the final action “Commit answer” while its busy state says “Saving answer.” `E03:92-150` exposes claim IDs, source-line receipt IDs, locators, evidence tiers, rights notes, and raw source URLs in the explanation path. `A01:239-259` requires durable submission and a complete source-backed explanation order; it does not require internal nouns as control labels. `R04:23-34` demonstrates “Submit answer,” “Saving your answer,” publisher/title/year, and exact source in a disclosure. |
| Finding | The action consequence is reasonably explained, but the button uses a developer/legal verb and the feedback makes evidence coordinates compete with the rationale. |
| Consumer impact | “Commit” can be mistaken for saving, final submission, or progressing; raw IDs make a trustworthy explanation look generated from a database dump. |
| Navigation implication | Session-level actions should use “Submit answer,” “Next question,” and “Leave practice.” Source navigation should read “Where this comes from” or “See the exact source.” |

### `LT-06` — Translate hazard and review models into observed consequences

| Field | Finding |
|---|---|
| Severity | High |
| Rubric tags | `INTERNAL_MODEL`, `UNDEFINED_JARGON`, `ACCESSIBILITY_COMPREHENSION` |
| Disposition | `REWRITE`; keep technical assessment data internal or advanced |
| Evidence | `E04:16-55` displays “authored condition,” “scene model,” “decoy false positive,” inventory IDs, and “correction concept.” `E04:127-175` explains “visual-recognition construct,” granular authored locations, exact structural-zone labels, and postcommit equivalence. `E04:223-230` announces a “durably saved” response. `E05:5-17` displays directional concept relationships, authored hazards/decoys, marker IDs, and false-positive labels. `E05:45-59` and `E05:189-205` use “acknowledgement” as the completion action. `R05:22-38` and `R06:21-34` demonstrate unsafe/safe, missed/found, and “I'm done with this one” language. |
| Finding | The model is accurate but is narrated instead of translated. The review queue describes why its projection is valid rather than what deserves another look. |
| Consumer impact | Learners may not understand what they missed, why a safe detail was marked wrong, or whether “acknowledge” means read, agree, or dismiss. |
| Navigation implication | Keep “Review” as the task. “Spot hazards” is clearer than “Hazards” at entry; keep “visual” and “text/list version” as format choices inside that task. |

### `LT-07` — Stop arbitrary internal failure strings from reaching public alerts

| Field | Finding |
|---|---|
| Severity | Critical |
| Rubric tags | `INTERNAL_MODEL`, `ACCESSIBILITY_COMPREHENSION`, `TRUST_REVERSAL` |
| Disposition | `INTERNAL_ONLY` for raw cause text; `REWRITE` via typed public condition mapping |
| Evidence | `E08:1-8` returns arbitrary `cause.detail` or `cause.message` ahead of the safe fallback. `E06:191-199`, `E06:205-217`, `E06:249-251`, and `E06:289-295` route those values into a focused `role="alert"`. `E07:249-251`, `E07:271-287`, `E07:304-307`, and `E07:362-368` do the same for import/settings/rebuild operations. `E11:90-95`, `E11:143-146`, and `E11:212-219` expose the same path in correction states. `E03:13-24` renders a state-provided message in the answer error alert. `A03:312-330` requires plain-language error states with specific recovery. |
| Finding | One shared helper deliberately prefers unbounded internal detail over reviewed public copy, and multiple high-stakes local-data surfaces render it visibly and to assistive technology. |
| Consumer impact | A browser, storage, validation, or implementation message can expose unexplained internals exactly when the learner needs a reliable statement about saved data. It can also make identical failures read differently across routes. |
| Navigation implication | Recovery links should route by the typed condition—retry, storage help, offline content, or safe exit—not by parsing an exception string. |

### `LT-08` — Name offline and local-data states by consequence

| Field | Finding |
|---|---|
| Severity | High |
| Rubric tags | `BUILD_RELEASE`, `INTERNAL_MODEL`, `DEFENSIVE_STACKING`, `TRUST_REVERSAL` |
| Disposition | `REWRITE`; `MOVE_TO_DETAILS`; `RELOCATE_TO_SUPPORT` for diagnostics |
| Evidence | `E01:1482-1523` leads with offline-pack transitions, staging, checksum verification, activation, quarantine, scoped reset, version pins, and IndexedDB. `E06:25-35` exposes exact objects, closure, generations, activation, retention, and quarantine. `E06:289-339` lists application-shell bytes, lifecycle, publication time, staging, verification, activation, and device generation. `E06:367-447` exposes shell fingerprints and durable-storage diagnostics. `E07:385-411` labels unavailable Spanish as “architecture ready” and exports append-only events, schema versions, checksums, projections, and pack bytes. `E07:424-510` exposes quarantine, exact previews, projection rebuilds, and validated event counts. `R07:23-35` demonstrates consequence-based offline states. |
| Finding | The current pages teach a state machine and reveal unfinished implementation vocabulary. The useful consumer distinctions—saved here, works offline, downloaded but not ready, and failed safely—are present but not dominant. |
| Consumer impact | Technical detail intended to prove safety can make storage feel risky, incomplete, or difficult to control. “Architecture ready” advertises missing product work rather than helping with a choice. |
| Navigation implication | Use “Offline and data” or “Use offline” as the utility entry. Inside it, label states “Ready offline,” “Downloading,” “Checking download,” “Update failed—your old copy still works,” and “Not downloaded.” |

### `LT-09` — Replace defensive operational proof with concise consumer guarantees

| Field | Finding |
|---|---|
| Severity | High |
| Rubric tags | `DEFENSIVE_STACKING`, `BUILD_RELEASE`, `DUPLICATED_GUARDRAIL`, `TRUST_REVERSAL` |
| Disposition | `REWRITE`; `MOVE_TO_DETAILS`; retain security and unofficial-status meaning |
| Evidence | `E01:1260-1273` leads transparency with release/version coordinates, durable local commitment, catalog records, diagnostics, a manifest hash claim, and answer-pack publication mechanics. `E01:1526-1541` tells learners the endpoint implementation is “committed dormant” and lists operational approvals. `E01:1544-1589` describes stable identities, a nonpublic hold, a production configuration with no database/binding/route/preview URL/logging, a generic report contract, attachment handling, and research-operation authorization. `R08:23-39` demonstrates concise source, report, privacy, and independence outcomes, while retaining a technical disclosure. |
| Finding | Important boundaries are stated as infrastructure absences and internal governance. Repeated defensive precision competes with the simple promises: independent study, public sources, local progress, nothing sent without an explicit action, and no secure exam material. |
| Consumer impact | The site can sound unfinished or evasive even when its privacy and integrity behavior is strong. Dense denials may also imply risks a learner had not suspected. |
| Navigation implication | Rename “Transparency” to a task-oriented “Sources / How we know” in consumer navigation; keep security, privacy, correction policy, and technical release details as clearly named children. |

### `LT-10` — Remove templated editorial cadence from instructional content

| Field | Finding |
|---|---|
| Severity | High |
| Rubric tags | `AI_CADENCE`, `INTERNAL_MODEL`, `ABSTRACT` |
| Disposition | `REQUIRES_CONTENT_REREVIEW` |
| Evidence | `E12:1010-1087` contains 11 consecutive comparison prompts beginning “In the accepted … comparison” and 11 correct explanations beginning “Correct.” `R04:63-75` shows three direct, concrete candidate stems and rationales, but `R04:60-62` correctly marks them research-only and subject to the normal review boundary. `R04:27-38` shows that both CL-D1 and CL-D2 feedback samples still retain a repetitive “Correct.” preamble. |
| Finding | “Accepted” is editorial pipeline language, and the repeated setup/preamble makes otherwise specific instructional content sound mechanically generated. The recovered direct stems are clearer, but the candidate directions have not fully eliminated the cadence. |
| Consumer impact | Repetition dilutes decisive distinctions and can reduce confidence that each item was written and reviewed for its actual concept. |
| Navigation implication | None to route structure; search/results snippets and review-item labels should use the direct concept distinction, not editorial status. |

## Positive findings

| ID | Positive | Evidence |
|---|---|---|
| `POS-01` | Every generated document receives a concise independence/non-affiliation footer plus direct correction, privacy, and security links. | `E01:171-177`, SHA-256 in ledger |
| `POS-02` | Unknown and conflicting exam facts are not guessed, and the implementation keeps controlling-announcement context and change history. | `E01:1091-1121`; `A01:33-38`, SHA-256s in ledger |
| `POS-03` | The current question prompt already explains save-before-explanation in ordinary words; the recovered candidate improves the final action to “Submit answer” without weakening commit-before-reveal. | `E02:15-17`; `R04:23-25`; `A01:239-243`, SHA-256s in ledger |
| `POS-04` | Complete source evidence is retained and can support a layered presentation rather than being deleted. | `E03:127-150`; `R04:29-34`, SHA-256s in ledger |
| `POS-05` | Current pack removal and reset flows preserve scope and retained data; recovered states make “what changed / what stayed / what next” especially clear. | `E06:223-250`, `E06:461-468`; `E07:516-548`; `R07:36-84`, SHA-256s in ledger |
| `POS-06` | The actual results surface rejects an official score/pass prediction and shows actual sample sizes; no inspected implementation surface uses streak loss, guilt, or readiness/mastery claims. | `E10:332-367`; `A01:345-353`, SHA-256s in ledger |
| `POS-07` | The CL-D1 hazard and review candidates translate model states into concrete unsafe/safe distinctions and specific next actions. | `R05:22-54`; `R06:21-55`, SHA-256s in ledger |

## Hard-constraint failures and blocking gates

| ID | Subject | Status | Exact failure or gate | Evidence |
|---|---|---|---|---|
| `HC-01` | Current implementation | **FAIL** | Arbitrary internal `detail`/`message` text can reach visible and assistive-technology alerts instead of a finite reviewed public error vocabulary. | `E08:1-8`; `E06:191-199`, `E06:289-295`; `E07:249-251`, `E07:362-368`; `E11:212-219` |
| `HC-02` | CL-D2 as recovered | **FAIL AS WRITTEN** | It says “14 public documents,” while the immutable current offline descriptor records `"sources":27`; it also asserts “nobody outside the state” has exam questions, an unsupported universal claim outside this site's knowledge. | `R08:34-39`; `R01:34-43`; `A05:46` |
| `HC-03` | CL-D1 as recovered | **FAIL AS WRITTEN** | It calls the hazard artwork a “workplace photo,” while the maintained production authority specifies generated raster artwork and generated hazard scenes. | `R01:27-31`; `A04:5-17` |
| `HC-04` | CL-D1 as recovered | **BLOCKING FACT/COPY REVIEW** | “65 tools and 90 questions cover this exam” can imply comprehensive exam coverage; “about 5/10/20 minutes” is an unvalidated learner-time claim. Both must be evidenced, qualified as site inventory/estimate, or removed. | `R02:23-33`; `R03:24-32`; `A01:33-39` |
| `HC-05` | CL-D3 | **NOT EVALUABLE AS COPY** | No recovered CL-D3 prototype bytes exist. Only a direction description exists, and it is explicitly closest to prohibited guilt, urgency, and premature mastery/readiness language. | `S01:336-361`; `A01:135-142`, `A01:345-353`; `R00:41-59` |
| `HC-06` | Any production promotion | **BLOCKED** | Plan 004 evidence records no participant rounds, no decision, and unpiloted/unfrozen prototypes; a Codex-only recommendation cannot promote production copy or claim comprehension/trust/usability. | `S01:3-7`, `S01:363-423`; `R00:41-59` |

## Candidate score matrix

`CL-D3*` is scored only as a direction description. `CL-H1*` is an independently recommended synthesis for the next reviewed prototype; it has no authored prototype bytes. Scores do not select production copy.

| Candidate | `R1` | `R2` | `R3` | `R4` | `R5` | `R6` | Mean | Hard-constraint status | Evidence confidence |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| `CL-D1` — Plain task | 5 | 5 | 3 | 5 | 3 | 5 | 4.3 | Fails as written on artwork type; blocking scope/time review | High for recovered wording; no usability evidence |
| `CL-D2` — Open book | 4 | 4 | 2 | 4 | 3 | 4 | 3.5 | Fails as written on stale source count and unsupported universal claim | High for recovered wording; no usability evidence |
| `CL-D3*` — Guided coach | 3 | 4 | 2 | 2 | 2 | 3 | 2.7 | Not evaluable; closest to prohibited motivation/readiness patterns | Low; description only |
| `CL-H1*` — Plain task + open proof | 5 | 5 | 4 | 5 | 4 | 5 | 4.7 | No known failure in the specification below; must pass fact/content review on authored bytes | Medium; Codex-only synthesis, no prototype or usability evidence |

### Candidate-specific observations

| Candidate | Strongest evidence | Residual issue |
|---|---|---|
| `CL-D1` | Direct tasks, consequence-based offline states, and three-part recovery consistently outperform current internal nouns (`R01:21-32`, `R03:22-55`, `R05:20-54`, `R06:19-50`, `R07:21-84`). | British “practise” is inconsistent with the New York English context; repeated “Correct.” remains; some claims overstate artwork type, timing, or coverage (`R01:23-31`, `R02:25-33`, `R03:24-32`, `R04:27`). |
| `CL-D2` | Publisher/title/date and “see how we know” links make evidence findable without leading with IDs or tiers (`R02:35-44`, `R04:36-40`, `R08:34-39`). | It reintroduces defensive absolutes, has a stale source count, and can make evidence the proposition on routine task pages. |
| `CL-D3` | A warmer register could reduce bureaucratic tone. | No bytes exist; the only retained description identifies proximity to prohibited streak/nudge/mastery behavior (`S01:348-353`). |
| `CL-H1` | Combines CL-D1's default task/recovery layer with CL-D2's adjacent proof layer, while keeping technical coordinates available but out of the default path. | Requires authored bytes, fact/content/security/accessibility review, and later participant validation; it is not a tested winner. |

## Consensus candidates and dissent

“Consensus” here means cross-artifact agreement within this Codex-only review; it does not mean participant consensus.

| ID | Consensus candidate | Evidence |
|---|---|---|
| `CC-01` | Use CL-D1-style concrete verbs, ordinary nouns, and immediate consequences in the default layer. | Current failures `LT-01`–`LT-08`; `R01:21-32`; `R03:22-55`; `R05:20-54`; `R06:19-50`; `R07:21-84` |
| `CC-02` | Use CL-D2-style publisher/title/date proof as a peer link or disclosure when evidence matters; do not use raw IDs, tiers, hashes, or rights notes as the explanation headline. | `E03:92-150`; `R02:35-44`; `R04:29-40`; `P01:422-469` |
| `CC-03` | Standardize every recoverable error as: what happened, what was preserved, and the next safe action. Raw exception text remains internal. | `LT-07`; `R03:51-55`; `R04:42-53`; `R05:44-54`; `R06:46-50`; `R07:36-84` |
| `CC-04` | Change display labels without changing canonical routes: task labels in primary navigation, trust/help and offline/data labels in secondary utility navigation. | `LT-02`; `A02:18-27`, `A02:154-164`; `R01:27-32` |

| ID | Dissent / unresolved point | Consequence |
|---|---|---|
| `DS-01` | Codex-only review cannot determine whether candidates trust source proof more when it is inline (CL-D2) or one disclosure away (CL-D1/CL-H1). | Preserve both as materially different prototype conditions; do not claim a tested prominence rule. |
| `DS-02` | Some advanced users may value versions, checksums, exact locators, seeds, and diagnostic IDs. | Move them to clearly named details/support surfaces; do not delete data required for verification or recovery. |
| `DS-03` | CL-D3 has no recovered copy and warmth alone is not evidence of clarity or trust. | Do not rank it as production-ready or infer its behavior from the direction name. |
| `DS-04` | The recovered CL-D1 and CL-D2 files contain factual/copy defects despite their stronger structure. | Treat them as inputs for a new version, never as promotable production bytes. |

## Canonical recommendation

| Field | Value |
|---|---|
| `reportId` | `CODEX-ONLY-UIUX-V1-LANGUAGE-TRUST` |
| `recommendationId` | `CL-H1-PLAIN-TASK-OPEN-PROOF` |
| Recommendation | Author a new, versioned hybrid prototype: CL-D1 task/action/recovery language as the default; one contextual guardrail at the decision it controls; CL-D2 publisher/title/date proof as an adjacent link or disclosure; exact IDs, versions, hashes, checksums, seeds, rights notes, and diagnostics in advanced/support or internal-only layers. |
| Required corrections | Use U.S. English; remove unsupported universal claims and stale hard-coded counts; call generated scenes artwork/images, not photos; phrase inventory as what the site contains, not comprehensive exam coverage; use “Submit answer” with explicit locking consequence; replace raw failures with typed public messages. |
| Navigation wording | Primary candidate labels: “Check my exam,” “Start practice,” “Study tools,” “Spot hazards,” “Review.” Secondary candidates: “Sources / How we know,” “Offline and data,” “Settings.” Keep canonical route IDs/paths unchanged. |
| Promotion status | **NOT HUMAN-USABILITY-TESTED**. Recommendation is for the next reviewed prototype and content contract only; it is not a production selection and does not close Plan 004. |

## Limitations

| ID | Limitation |
|---|---|
| `LIM-01` | `humanEvidence=none`, `humanParticipantCount=0`, and `notHumanUsabilityTested=true`. No participant comprehension, trust, first-click, assistive-technology, or teach-back result exists. |
| `LIM-02` | No person was contacted, recruited, observed, or asked to review these materials. |
| `LIM-03` | The recovered `CL-1` files are editable recovery artifacts, not accepted research, frozen round artifacts, tested directions, or production copy (`R00:41-59`). |
| `LIM-04` | CL-D3 and CL-H1 have no prototype bytes. Their scores have lower confidence and cannot be compared as tested interfaces. |
| `LIM-05` | The implementation audit inspected the immutable static generator, shell copy, major copy-bearing React islands, local error propagation, and authored comparison items. It did not run a browser session or manually inspect every data-driven source excerpt across all generated documents. |
| `LIM-06` | Preserved benchmark evidence was not refreshed. The evidence report itself marks the benchmark partial and the language decision pending (`S01:3-7`, `S01:234-269`, `S01:413-438`). |
| `LIM-07` | Scores are ordinal review aids. They are not percentages, statistical findings, accessibility certification, release approval, or evidence that any candidate improves real-user outcomes. |
