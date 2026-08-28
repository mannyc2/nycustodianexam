# CODEX-ONLY-UIUX-V1 — accessibility, cognitive load, language, navigation, and trust review

```yaml
agentTaskId: /root/accessibility_lane_v1
evidenceMode: codex-only
humanEvidence: none
humanParticipantCount: 0
notHumanUsabilityTested: true
statusLabel: NOT HUMAN-USABILITY-TESTED
```

## Audit record

| Field | Value |
|---|---|
| `taskId` | `CODEX-ONLY-UIUX-V1/accessibility-cognitive-review` |
| `label` | **NOT HUMAN-USABILITY-TESTED** |
| `humanEvidence` | `none` |
| `humanParticipantCount` | `0` |
| `notHumanUsabilityTested` | `true` |
| `evidenceMode` | `codex-only` |
| `reviewDate` | `2026-08-28` |
| `implementationBase` | `9fc7dcacfc961752e5d9a2cedbc426deead54a05` |
| `workspaceHeadInspected` | `7e73dfd7e76101bf96d3122c9e3917cf4725251f` |
| `implementationParityCheck` | `git diff --name-status 9fc7dca..7e73dfd -- apps/site packages/content product docs recovery` returned no paths; the audited implementation/authority/recovery bytes at current HEAD therefore match the base. |
| `plan004Evidence` | `fecc71c5ea240385b3d98f896b1152022a2bbbe8` |
| `plan005Evidence` | `9daddbfde073f1f73d806a68dac427b69efc8359` |
| `step1PrototypeBase` | `9fc7dcacfc961752e5d9a2cedbc426deead54a05` |
| `surfacesInspected` | Current page generator; generated Home and Practice documents; question, hazard, review, offline-pack, settings, and correction React surfaces; shared CSS; authored and split question artifacts; maintained product constraints; all eight recovered CL-1 prototypes; Plan 004 report/record; Plan 005 route inventory/report/record. |
| `humanContact` | None. No person was contacted, recruited, observed, interviewed, surveyed, or shown an artifact. |
| `executionBoundary` | Read-only source/generated-artifact inspection. The existing browser-test source was inspected but this audit did not rerun it. No assistive-technology session, usability task, device lab, true 400% zoom inspection, or print inspection occurred. |

## Score rubric

| Score | Codex-only meaning |
|---:|---|
| 1 | Absent, contradicted, or a severe barrier is directly evident in code/content. |
| 2 | Major code/content gaps materially obstruct the stated contract or task. |
| 3 | Mixed: useful foundations exist, with consequential unresolved gaps. |
| 4 | Strong code/content support with bounded defects; still not human-validated. |
| 5 | Complete against the inspected contract and states; this still would not substitute for required human/AT evidence. |

## Rubric scores

| Dimension | Score (1–5) | Evidence-based basis |
|---|---:|---|
| Semantic structure, focus, and announcements | 4 | Skip link, landmarks, native fieldsets/radios, focused outcome/error headings, and polite status regions are implemented; current-location and full-shell defects remain. See E05, E08–E10, E15. |
| Keyboard, motor, reflow, and display adaptations | 3 | Shared buttons/answer rows receive a 44px minimum; forced-colors/reduced-motion/print rules and question-focused automated checks exist. Hazard marker movement/removal buttons do not receive that target contract, and the mandatory manual matrix is open. See E06, E11–E12, E15, A04. |
| Nonvisual hazard equivalence | 3 | A real text-zone task and complete postcommit equivalent exist and explicitly avoid claiming identical visual measurement. Entry prominence and feedback vocabulary remain weak, and no AT user evaluated it. See E05, E12–E13, P08. |
| Cognitive load and plain task language | 2 | Primary routes expose release, storage, provenance, and internal taxonomy before or inside common tasks; Practice renders a large filter-capacity table dominated by unavailable states. See E05, G01–G02, P01. |
| Navigation, findability, and orientation | 2 | The shell is semantic but flat and wrapping; Review has no public entry link, profile selection/context is incomplete, utility pages lack current-location markup, and players retain acquisition navigation without Exit/Save-and-exit. See E05–E06, A02–A03, N01–N03. |
| Error and recovery comprehension | 2 | Several states accurately distinguish saved/not-saved and preserve input, but arbitrary `detail`/`message` strings can enter visible, focused alerts. See E07, E16–E18, P01, P09–P10. |
| Consumer trust and claim calibration | 3 | Unofficial status, original-practice boundaries, local-storage consequences, sources, and unknown facts are present. Their hierarchy is often defensive/technical, and some prototype trust copy overclaims. See E05, E13, A01, P01, P05, P12. |
| Editorial directness / AI-slop resistance | 2 | Eleven comparison stems repeat the same editorial frame and 23 rationale messages begin with “Correct.”; learner-facing feedback also exposes authoring/model vocabulary. The semantic facts remain strong. See E13–E14, G03–G04, P01, P07. |
| **Unweighted code/content mean** | **2.6** | `21 / 8`; diagnostic only, not a usability score or release certification. |

## Hard-constraint failures

| ID | Severity | Failure | Exact evidence | Required correction boundary |
|---|---|---|---|---|
| HC-01 | Critical | Question, review, and hazard player documents are built through the universal document shell, so all seven acquisition/utility links remain present. Player bodies provide previous/next but no explicit Exit or Save-and-exit action. | E05:155–169, 185–213, 460–560; A02:154–164. | Provide a focused session landmark and one unambiguous Exit/Save-and-exit action; remove competing acquisition navigation from player routes. |
| HC-02 | High | Compact navigation is implemented as a wrapping seven-link flex row, not the required named disclosure. | E05:155–169; E06:357–370; A03:235–252. | Preserve no-JS-safe task access while introducing a named compact disclosure and a separately visible active profile/version row. |
| HC-03 | High | Utility routes are inside the `Primary` navigation, but `Offline packs` and `Settings` can never receive `aria-current="page"`; the helper is applied only to five other destinations. | E05:152–167; A03:233–239. | Mark the current destination in every rendered navigation tier, or move utilities to a distinct labeled utility navigation with equivalent current-state treatment. |
| HC-04 | High | Exam selector copy says “Choose,” but offers only “View this profile.” Profile pages expose facts and an Atlas action, not a select/change action; the shell shows no active profile/version context. | E05:1067–1124; A01:135–150, 581–584; A02:79–83; A03:221–239. | Implement explicit select/change/recovery behavior and keep the active profile/version visible wherever it changes content. |
| HC-05 | High | Review’s maintained parent is Home/Study, but no Home, header, or Practice link reaches `/review/`. Generator occurrences are limited to review-player breadcrumbs/data/route creation and the Review document itself. Plan 005’s additional “top task” label remains explicitly unvalidated. | E05:155–169, 490, 769–781, 910–956, 1127–1153, 1359–1370; A02:79–98; N01:91–106; N02:89–103. | Add a direct, comprehensible Review entry at its declared parent surface; retain empty-queue-as-success semantics. |
| HC-06 | High | Hazard marker Move/Remove buttons have no shared `.button` class and no marker-control CSS rule. The authored 44px token is applied to `.button` and answer rows, not these controls. | E06:43–46, 510–543; E11:27–68; A03:254–262, 395–415. | Apply and verify the 44px marker-control target, spacing, focus, forced-colors, and true-400%-zoom contracts to every directional/remove control. |
| HC-07 | High | `localFailureDetail` prioritizes arbitrary `cause.detail`/`cause.message` over safe fallbacks. Offline Packs and Settings place the resulting string in an alert and focus its heading; Corrections can concatenate it into a status. | E07:1–8; E16:172–198, 289–295; E17:90–114, 154–184, 362–368; E18:185–219, 418; A03:327–330; P01:180–193. | Map typed conditions to plain, operation-specific “what happened / what was preserved / next action” copy; keep internal exception text behind an explicit technical disclosure only when safe. |

## Structured findings

### F-01 — Strong semantic base does not close the accessibility gate

| Field | Finding |
|---|---|
| `severity` | Positive with release-blocking limitation |
| `observed` | Documents place the skip link first, use a stable main target and labeled breadcrumbs, and use native form semantics. Question feedback focuses the outcome/error heading and separately exposes a polite atomic status. Shared answers and `.button` controls receive visible focus and a 44px minimum. Existing test source checks serious Axe findings in two question states, question reflow at 320 CSS px, forced colors, reduced motion, and print behavior. |
| `positive` | These are concrete accessibility implementations, not placeholder intent. The question flow also preserves native selection and reports save/reveal failures without optimistic correctness. |
| `limitation` | The test source covers a narrow question slice and filters Axe output to serious/critical findings. This audit did not execute it. Maintained authority explicitly leaves NVDA, VoiceOver, TalkBack, JAWS smoke, true 400% zoom, device, paper-size, and physical grayscale print certification open. |
| `evidence` | E05:193–213, 254–257, 444–500; E06:340–347, 395–405, 508–543, 894–926; E08:22–45, 69–112; E09:6–32, 58–162; E10:31–44; E15:5–110; A04:162–170, 332–352. |
| `humanOutcomeClaim` | None. No claim is made about screen-reader comprehension, focus comfort, zoom usability, or task success. |

### F-02 — The main task path is buried under an implementation inventory

| Field | Finding |
|---|---|
| `severity` | High |
| `observed` | Practice begins with three clear whole-bank set cards, then renders a large horizontally scrollable capacity table. Its consumer-visible row labels include raw prefixes and identifiers such as `domain:`, `family:`, and `confusion-set: comparison...`; nearly every filtered length is a disabled “Unavailable” control. The explanatory copy introduces “answer-independent memberships,” release IDs, “reviewed objectives,” and “scoring boundary.” |
| `cognitiveRisk` | The dominant volume explains the content compiler rather than helping a learner start or refine a set. Disabled controls repeat an unavailable outcome without a task-level recovery choice. The horizontal wrapper contains a correctly captioned table but has no explicit focusability/instructions for a keyboard user who must scroll it. |
| `positive` | Whole-bank 45/60/90 starts are truthful, distinct, and placed before the capacity table; exact availability and the nonofficial-score boundary are preserved. |
| `candidateImplication` | Endorse CL-D1’s question-first setup and concrete insufficient-capacity explanation. Move the full matrix to a details/advanced inventory view; keep only feasible choices and one reason/recovery near the primary task. |
| `evidence` | E05:1127–1153; E06:721–731; G02:42–45; P06:13–60; P01:195–227. |
| `uncertainty` | No learner attempted this page. Whether specialists value the full table on the default path is unknown. |

### F-03 — Language and navigation compound each other at profile selection

| Field | Finding |
|---|---|
| `severity` | High |
| `observed` | The Exam page uses the task verb “Choose” but its actions only view profiles. Profile pages lead with layer/version/pack metadata and render compatibility keys, fact-state vocabulary, accepted/scored inventory counts, and a source registry; there is no “Use this profile” action. The shell provides no active profile/version context, so subsequent Practice copy names a capacity profile without a visible selection mechanism. |
| `interactionDefect` | The label promises a state change while the control performs navigation only. Internal model language then makes it harder to tell whether viewing a profile changed anything. |
| `positive` | Unknown/conflicting facts, scope limits, official-announcement precedence, and source links are retained rather than guessed. |
| `candidateImplication` | Conditionally endorse the CL-D1 profile default (“Use this if…”, known/unknown facts) with CL-D2 source links in progressive disclosure. Add a literal Select/Use/Change profile action and persistent context. |
| `evidence` | E05:1067–1124, 1138–1151; P05:13–56; A01:30–43, 135–150, 581–584; A03:221–252. |
| `uncertainty` | A profile-first hierarchy is a Plan 005 hypothesis, not observed behavior. The missing control/context is code-evident; its effect on users is not. |

### F-04 — Review is implemented but not discoverable from its declared parents

| Field | Finding |
|---|---|
| `severity` | High |
| `observed` | `/review/` and 90 review-player routes are generated, but the header, Home task cards, and Practice hub contain no Review link. Review itself links back out to Practice and Hazards. |
| `navigationRisk` | A local due queue can exist without a learner having a public, labeled route back to it. This also weakens “Flag for review,” because the flag action names a destination that the surrounding navigation does not expose. |
| `positive` | Review empty/error states distinguish “nothing waiting” from failure, preserve attempts, and require explicit acknowledgement instead of clearing on view. |
| `candidateImplication` | Any candidate hierarchy should expose “Review” under Study and, when due items exist, from Home/Study as a stateful task—not as a peer infrastructure label. |
| `evidence` | E05:910–956, 1127–1153; E08:101–109; E19:146–170; P09:13–55; A02:79–98, 129–134. |
| `uncertainty` | The queue is `noindex` and local, but neither fact removes the maintained Home/Study parent relationship. No first-click evidence exists. |

### F-05 — Focused players expose accidental-exit opportunities but omit a deliberate exit

| Field | Finding |
|---|---|
| `severity` | Critical |
| `observed` | The same global header is inserted into all documents. Question/review and visual/nonvisual hazard players therefore expose Exam profile, Atlas, Practice, Hazards, Transparency, Offline, and Settings while offering only previous/next task navigation in the player body. |
| `cognitiveRisk` | Seven unrelated links compete during commitment and can abandon the workflow, while the safe intended leave action is unnamed. |
| `candidateImplication` | Treat focused player chrome as an invariant across every navigation candidate: session/progress landmark, one explicit Exit or Save-and-exit, and no full acquisition menu. |
| `evidence` | E05:155–213, 460–560; A02:154–164; N01:129–134, 235–240. |
| `uncertainty` | Accidental exits were not observed. The contract violation is direct; the frequency and severity in use are unknown. |

### F-06 — Hazard accessibility is thoughtfully modeled but operationally uneven

| Field | Finding |
|---|---|
| `severity` | High |
| `observed` | Visual mode supplies explicit zoom/pan controls, a keyboard-focusable scroll region, add-at-center, step movement, and removal. Nonvisual mode is an actual ordered-zone selection task, and postcommit copy says it is an equivalent knowledge activity rather than the same visual-recognition measure. The landing page, however, presents it as a secondary “keyboard-native scene” action, and marker step controls are visually unstyled default buttons without the 44px contract. Moving a center marker to an edge can require 20 presses per axis at the fixed `0.025` step. |
| `positive` | The implementation does not fake equivalence, does not require dragging, preserves a complete zoned text equivalent, and labels markers/conditions in text rather than color alone. |
| `cognitiveMotorRisk` | “Keyboard-native” names an implementation property, not a task. Repeated direction controls and percentage coordinates impose avoidable motor and spatial load. |
| `candidateImplication` | Endorse “Use the text and keyboard version” or “Use the list version” at equal visual prominence. Group each marker in a named control set; meet target/spacing rules; consider coarse/fine move or direct position choices without weakening precision truth. |
| `evidence` | E05:503–560, 1244–1258; E11:4–68; E12:17–31, 43–68, 84–209; E13:12–55, 127–177, 223–250; P08:13–60; A01:41–43, 135–142; A03:395–419. |
| `uncertainty` | No keyboard-only, switch, screen-reader, low-vision, or motor-impaired participant used either mode. The 20-press count follows the code step mathematically; burden is not human-observed. |

### F-07 — Error copy can expose internals at the moment of highest data anxiety

| Field | Finding |
|---|---|
| `severity` | High |
| `observed` | The shared helper returns any nonempty `detail` or `message` before a reviewed fallback. Settings and Offline Packs then render that string in `role="alert"` regions and focus their headings; Correction status can concatenate it into a longer message. |
| `trustRisk` | An implementation exception can replace the plain explanation of the failed operation, preservation state, and next safe action. This is a concrete leak path, not a claim that every runtime error contains sensitive data. |
| `positive` | Surrounding flows often preserve drafts/prior active packs and offer retry, export, rebuild, or cancel. Some current messages already state what remains unchanged. |
| `candidateImplication` | Endorse the three-part error structures in CL-D1 prototypes: plain operation result, preserved/deleted scope, next action. Retain safe diagnostics under a user-opened details disclosure. |
| `evidence` | E07:1–8; E16:176–275, 289–309; E17:90–184, 340–368; E18:185–219, 418; P01:180–193; P07:42–53; P10:36–92; P12:51–66. |
| `uncertainty` | The exact exception strings produced by every provider were not exhaustively induced. Reachability into the public sink is code-evident. |

### F-08 — Provenance is valuable but occupies the learner’s default reading path

| Field | Finding |
|---|---|
| `severity` | Medium–high |
| `observed` | Home opens with “Source-backed · local-first,” “retrieval questions,” “commit,” “interactive runtime,” and “source receipt.” Question feedback renders claim text followed immediately by source IDs/titles/locators for every rationale, then a second full “Source receipts” disclosure with version, evidence tier, rights, excerpt, and URL. Atlas, Offline, Settings, and Transparency similarly lead with accepted/release/checksum/version vocabulary. |
| `trustTradeoff` | Provenance and local-first limits are load-bearing. The defect is default hierarchy and duplication, not the existence of evidence. Technical density may reassure some readers and repel others; Plan 004 explicitly leaves that question unresolved. |
| `positive` | Evidence remains inspectable offline; every distractor has a rationale; publisher/locator/date/tier information exists; unofficial status appears in the footer. |
| `candidateImplication` | Use CL-D1 for the task/result default, CL-D2’s publisher/title/date link as the evidence summary, and one advanced source/technical disclosure. Do not remove exact receipts. |
| `evidence` | G01:37–54; E05:910–930, 1155–1173, 1260–1274, 1482–1524; E09:75–150; P01:195–232, 305–361; P04:21–53; P07:21–40. |
| `uncertainty` | No participant judged trust, officialness, or desired evidence depth. |

### F-09 — Repeated editorial framing is an objective AI-slop signal, not a proven user reaction

| Field | Finding |
|---|---|
| `severity` | Medium |
| `observed` | The authored pack contains 11 stems matching “In the accepted … comparison” and 23 rationale messages beginning “Correct.” Q068 is representative: the editorial frame precedes a usable tool distinction, and its review receipt identifies `reviewerKind: ai-agent` while marking content/security/accessibility outcomes passed. The generated pre/postcommit files preserve the same wording. Hazard results similarly expose “authored condition,” “scene model,” “decoy false positive,” and “visual-recognition construct.” |
| `consumerRisk` | Repetitive setup and authoring-process nouns make original practice sound templated and can obscure the direct distinction being learned. The count is code-derived; perceived “AI-ness” or distrust is not human evidence. |
| `positive` | The underlying distinctions, distractor rationales, source closure, and original-content attestations are explicit. The recovered direct-stem rewrites retain the decisive features. |
| `candidateImplication` | Conditionally endorse direct stems and rationale-first explanations, subject to full content/source/security/accessibility re-review. Never present an `ai-agent` accessibility receipt as AT-user or human-usability evidence. |
| `evidence` | E13:12–55, 127–145; E14:14106–14174 and repository counts (`11` accepted-comparison stems; `23` “Correct.” message preambles); G03:1–35; G04:15–59; P01:217–232; P07:60–75. |
| `uncertainty` | The recurrence is certain for these bytes. Its effect on comprehension or trust is unknown, and “accessibility: passed” is an internal editorial receipt, not this audit’s label and not human evidence. |

### F-10 — Trust boundaries are present, but first-impression placement is weak

| Field | Finding |
|---|---|
| `severity` | Medium |
| `observed` | Home’s hero claims source-backed/local-first study and lists release counts; independent/unofficial status appears only in the footer. Transparency and privacy provide substantial verification, correction, security, and local-data detail, but the global shell gives trust/utility destinations the same flat prominence as study tasks. The Spanish preference is truthfully disabled, though its label “architecture ready” is internal implementation language. |
| `positive` | The site does not claim affiliation, real exam questions, official item weights, a pass prediction, or launched Spanish content. It keeps correction intake truthfully dormant and local progress account-free. |
| `candidateImplication` | Put one compact independence/original-practice statement near the proposition, expose a clear “How we know” route, then stop repeating infrastructure defenses in task flows. Replace “architecture ready” with “Spanish pages are not available yet.” |
| `evidence` | G01:37–54; E05:171–177, 910–930, 1260–1274, 1482–1542; E17:370–411; A01:28–43, 345–353, 547–553; A04:143–173; P04:21–43; P12:21–40. |
| `uncertainty` | Ten-second proposition recall, officialness recognition, perceived trust, and language preference comprehension were not tested. |

## Consumer-language candidate assessment

Scores below measure Codex-observed contract fit and copy economy only. They are not preference, comprehension, trust, or usability outcomes; Plan 004 explicitly has no participant evidence and no selected direction (P01:3–7, 336–378; P02:68–82).

| Candidate | Contract-fit score (1–5) | Evidence confidence (1–5) | Endorsement / objection | Exact basis |
|---|---:|---:|---|---|
| CL-D1 “Plain task” | 4 | 2 | **Conditional endorsement as the default task/error layer.** It names tasks and consequences first, reduces internal nouns, and preserves required guardrails in ordinary language. **Objections:** prototype durations and 10/20/40 lengths are research examples that do not match the current 45/60/90 release; hazard examples must not be promoted without scene/source review; “never leave this device” requires precise scope. | P01:342–344, 360–394; P04:21–53; P05:21–56; P06:22–60; P07:21–75; P08:20–60; P09:19–55; P10:21–92; P12:21–68. |
| CL-D2 “Open book” | 3 | 2 | **Conditional endorsement for evidence summaries, unknown-fact links, and trust-recovery surfaces—not as the sole voice.** Publisher/title/date links are more legible than IDs/tiers. **Objections:** evidence-first presentation can compete with action; the Home/Trust prototypes say nobody outside the state has exam questions, an unsupported universal claim that must be removed; residual editorial cadence remains. | P01:345–347, 360–394; P04:34–43; P05:35–45; P06:34–40; P07:36–40; P08:30–35; P10:31–35; P12:34–40. |
| CL-D3 “Guided coach” | 2 | 1 | **Objection on present evidence; do not select.** Only a direction description exists—none of the eight recovered CL-1 files contains a CL-D3 variant. Warmth can be explored, but streaks, nudges, urgency, guilt, readiness, or mastery claims are hard-boundary risks. | P01:338–361, 380–394; P02:68–82; A01:133–142, 347–353. |

### Candidate synthesis

| Field | Codex-only disposition |
|---|---|
| `defaultTaskVoice` | Conditionally use CL-D1. |
| `evidenceLayer` | Conditionally use CL-D2’s human-readable publisher/title/date summary plus one exact-receipt disclosure. |
| `coachLayer` | Do not adopt from current evidence; CL-D3 lacks an inspected prototype and sits nearest prohibited motivational claims. |
| `selectionStatus` | `none`; no candidate is approved or human-validated. |
| `requiredBeforeDecision` | Human participant authorization and evidence remain outside this task. This audit does not convert their absence into synthetic results. |

## Navigation alternatives independently inferred from current code and the fixed inventory

Scores measure contract fit and code-level load only. Plan 005 records every priority/shell as an unvalidated desk hypothesis, reports zero participants, builds no candidates, and selects no model (N01:91–134, 136–140, 183–240; N02:23–30, 69–116; N03:1–26).

| Alternative | Contract-fit score (1–5) | Codex-only disposition | Structure | Objections / uncertainty |
|---|---:|---|---|---|
| NAV-0 — current flat shell | 2 | Object | Seven peers: Exam profile, Tool atlas, Practice, Hazards, Transparency, Offline packs, Settings; flex-wrap on compact layouts; same shell in players. | Review/Simulation/Print are absent or buried, trust/utilities compete with study, profile context is missing, and players lack deliberate exit. No human first-click result exists. |
| NAV-A — task tier + utility disclosure | 4 | Conditional endorsement for prototyping | Primary: **Check my exam**, **Study**, **Look up tools**, **Spot hazards**. Study hub owns Practice, Review, Simulation, and Print. Secondary named utility disclosure owns Transparency, Offline, Settings, and Report; active profile/version stays outside the disclosure. Focused players use only session/progress/Exit. | Group labels and order require card-sort/tree/first-click evidence. “Look up tools” and “Spot hazards” may belong inside Study; do not delete any fixed route. |
| NAV-B — profile-first orientation, then task hub | 3 | Conditional hypothesis | First visit foregrounds Confirm/select exam; after selection, Home becomes a task hub with Continue/Practice/Review/Atlas/Hazards and visible profile context. Utilities remain secondary; player shell remains focused. | Can add a gate before browsing and may overstate the importance of profile selection for users who want public reference content. Profile-first behavior is unvalidated. |
| NAV-C — activity-first minimal shell | 4 | Conditional alternative | Stable global tasks: **Practice**, **Review**, **Tools**, **Hazards**; a separate visible **Exam: … / Change** context; Transparency/Offline/Settings stay in footer plus compact utility disclosure. Focused players remove all acquisition links. | “Practice” may not cover Simulation/Print without a clear Study landing. Exact compact-menu behavior needs no-JS and AT review. |

### Navigation invariants independent of candidate

| ID | Required invariant | Basis |
|---|---|---|
| NI-01 | Every fixed route remains available and no-JS purpose remains truthful. | N01:9–22, 91–113, 235–240. |
| NI-02 | Review has a direct parent entry; flagging names a destination the learner can later find. | A02:91, 129–130; E08:101–109. |
| NI-03 | Current profile/version remains visible when it changes available content. | A01:135–142; A03:221–252. |
| NI-04 | Compact navigation uses a named disclosure rather than an undifferentiated wrapped link cloud. | A03:233–252; E06:357–370. |
| NI-05 | Every player has a session/progress landmark and explicit Exit/Save-and-exit, without full acquisition navigation. | A02:154–164; N01:129–134, 235–240. |
| NI-06 | Visual and text/keyboard hazard starts receive equivalent task language and discoverability; neither is described as identical measurement. | A01:41–43; A03:395–419; E12:17–31; E13:127–177. |

## Positives retained in every candidate

| ID | Positive | Exact evidence |
|---|---|---|
| POS-01 | Durable commit-before-reveal is stated before selection; selection remains native/editable until submit; failure and reveal states distinguish saved from not saved. | E05:444–500; E08:22–112; E09:6–32; A01:239–259. |
| POS-02 | Outcome focus and status announcements are explicit, with every distractor rationale and exact sources available after reveal. | E09:38–162; E10:31–44; E15:14–22. |
| POS-03 | Skip/focus styling, answer/control target tokens, reduced-motion, forced-colors, and print adaptations are implemented. | E06:340–347, 395–405, 508–555, 894–926. |
| POS-04 | Hazard mode offers non-drag controls, a real nonvisual task, honest non-equivalence language, and a complete textual postcommit equivalent. | E11:12–73; E12:17–31, 84–209; E13:116–177, 223–250. |
| POS-05 | Unofficial status, unknown facts, site-designed distributions, practice-only scoring, original content, and secure-material boundaries remain visible. | E05:171–177, 1076–1123, 1138–1151, 1260–1274; A01:28–43. |
| POS-06 | Local/offline flows often state preserved state and avoid claiming a write/download occurred before it did. | E05:179–183, 1482–1524; E16:176–275, 289–309, 421–445. |
| POS-07 | Spanish is not falsely presented as launched; English remains the sole enabled content locale. | E17:370–387; A04:143–148. |
| POS-08 | No streak-loss, countdown pressure, guilt, mastery, or pass-prediction pattern was found in the inspected primary study surfaces. | E05:935–956, 1127–1153; A01:133–142, 345–353. |

## Dissent and uncertainty register

| ID | Dissent / uncertainty | Disposition |
|---|---|---|
| DU-01 | Exact provenance density may increase trust for some candidates even when it reads as defensive to a code auditor. | Unresolved; Plan 004 says participants were required to decide this (P01:229–232). Do not treat the CL-D1/CL-D2 scores as trust evidence. |
| DU-02 | The flat header may be fast for repeat users at wide widths. | Plausible but unmeasured. It still violates focused-player and compact-disclosure contracts. |
| DU-03 | Review’s lack of public indexing could be intentional because it is local/personal. | Indexability is not discoverability. The maintained parent is Home/Study and Review is a top-task desk hypothesis; first-click success is unknown. |
| DU-04 | The marker buttons may inherit usable browser-default dimensions. | They do not receive the authored 44px guarantee; rendered size was not measured in this audit. Treat HC-06 as a code-contract failure pending browser measurement, not a claim that every UA renders below 24px. |
| DU-05 | The nonvisual hazard mode is code-substantive and honestly differentiated. | Positive, but “equivalent knowledge” and zone mapping cannot be certified as cognitively equivalent or AT-usable without appropriate users and content review. |
| DU-06 | “AI-slop” is partly perceptual. | This audit establishes repetition/internal editorial vocabulary only. It does not establish that users notice AI authorship or reduce trust. |
| DU-07 | Existing automated tests and the maintained ledger report a broad passing browser matrix. | Useful non-human evidence only. This audit did not rerun it, and the mandatory manual AT/zoom/device/print matrix remains open (A04:322–352). |
| DU-08 | The generated HTML and split question JSON are not tracked at the implementation commit. | They were inspected as actual current generated artifacts and are byte-pinned below; source-of-truth findings also cite the immutable generator/authored pack. |
| DU-09 | English-only launch is an accepted scope, not an accessibility defect by itself. | The disabled Spanish choice is truthful. Its consumer label should omit “architecture ready”; reviewed translation remains a future gate. |
| DU-10 | No score above is a release approval. | The exact governing label remains **NOT HUMAN-USABILITY-TESTED**. |

## Evidence limitations

| Limitation ID | Limitation |
|---|---|
| L-01 | `humanEvidence=none`; `humanParticipantCount=0`; no participant outcome, quotation, observation, timing, completion rate, first click, comprehension, preference, trust judgment, or error recovery was collected. |
| L-02 | No AT user or AT session was involved. Automated semantics/code inspection is not NVDA, JAWS, VoiceOver, TalkBack, switch, voice-control, keyboard-only-user, low-vision-user, or cognitive-access evidence. |
| L-03 | No runtime viewport screenshots, touch-target measurements, true 400% browser zoom, physical device, grayscale print, US Letter, or A4 output were inspected in this audit. |
| L-04 | Existing browser-test code was read, not rerun. Prior maintained pass claims remain prior non-human evidence, not a result produced here. |
| L-05 | CL-D1 and CL-D2 recovered files are authored, unpiloted, unfrozen research prototypes. CL-D3 has no recovered prototype. None is production copy or an approved direction. |
| L-06 | Plan 005 is an inventory of unvalidated desk hypotheses. It contains zero participants, no built candidates, no thresholds, and no selected model. |
| L-07 | Code review can establish markup, state paths, copy recurrence, and contract mismatch. It cannot establish comprehension, cognitive burden, confidence, emotional response, trust, preference, real-world task success, or equivalence. |

## Immutable evidence ledger

All SHA-256 values identify the exact bytes inspected. `commit` entries were hashed from `git show <commit>:<path>`. `generated-current` entries were present in the generated working site but are not tracked at the implementation commit; their hashes pin those inspected output bytes.

### Maintained authority

| ID | Coordinate | SHA-256 | Lines used |
|---|---|---|---|
| A01 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:product/FEATURE_SPEC.md` | `a1c3d2441fd85162931d17eb3752029e533cd37b8268a842c0a1a4ee8713dd48` | 28–43, 125–142, 146–150, 239–259, 345–353, 547–553, 581–584 |
| A02 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:product/ROUTES.md` | `9478211d12646c94688853787e652919adf4889bd7f2f920e4b37b0572eec227` | 79–98, 129–134, 154–164 |
| A03 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:product/DESIGN_SYSTEM.md` | `12532bbb78166ae4ffb684ea15f57d400761668e55f2845fec602e4ba9394039` | 219–270, 307–330, 395–419, 458–520 |
| A04 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:docs/OPEN.md` | `3dc4a398aa4a9cdc8d96e9da4d2d4f669efaecfa2a5c98c791d35170ff899f6f` | 143–173, 277–352 |

### Current implementation source

| ID | Coordinate | SHA-256 | Lines used |
|---|---|---|---|
| E05 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/scripts/generate-pages.tsx` | `239f102cc0cbc46053c4f4e5fd40e16e98e45c0cdff1d269771e28061dc569ba` | 152–229, 444–560, 769–781, 910–977, 1067–1173, 1238–1274, 1359–1370, 1482–1542 |
| E06 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/styles.css` | `ec572566a43c02b356b67a56ff88126d50901ea18f76441ffb9f278cd39273a8` | 38–52, 340–405, 505–555, 721–731, 894–926 |
| E07 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/local-failure-detail.ts` | `dd52b5f14999e3af4cf887683e9b6282dc6805ca4d30eb5689cd1061c4a5e2a4` | 1–8 |
| E08 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/question-player/react/question-form.tsx` | `87d846bc0d4fe218b386d21c31c35970d18293aa43c194ac1d7a0f2642e92223` | 5–112 |
| E09 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/question-player/react/feedback.tsx` | `b53b202e089f2a3885b9c18ab33d51d55adb085c461f4afe8c43fbb528c55725` | 6–162 |
| E10 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/question-player/react/provider.tsx` | `8df88cfbb2f0fef1dfcd4136a0be0a2c6ad18c5e969316fa88453c6acb752ba4` | 15–75 |
| E11 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/hazard-player/react/marker-controls.tsx` | `2606e9ca0c8149c0bdd976c7128b77d70793ac40ed6e73272084c12233e43e05` | 4–75 |
| E12 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/hazard-player/react/scene-viewport.tsx` | `523e757a5f6f0e6306f5cce6e2c1afedb71974a160b7e52045161c86c095b563` | 11–212 |
| E13 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/hazard-player/react/results.tsx` | `1dadd860da45852262d82cd5b35ad73c3da3688436779da8c69d89e7a926e284` | 12–250 |
| E14 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:content/authoring/packs/launch-v1.json` | `779a9b0c0b4fc091ea112195c1ff44d77b26a72142f56a194970f14fb10218ed` | 14106–14174; repository-wide exact-string counts over this file |
| E15 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/browser-tests/accessibility-and-presentation.pw.ts` | `fde1dd0a9987c7e56fa28f43f1bc6b72a90de7126aa379b11623f944ed8320b3` | 1–110 |
| E16 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/offline-packs/react/pack-manager.tsx` | `48c80fb01bab5976f0432c1d1c4863b4e66ebaffb41fdc7ab45bef114d27eaa0` | 160–310, 421–445 |
| E17 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/settings/react/settings.tsx` | `0024e7c9f21bd8f3fac8dd8af31eb9335ff26f82e3c4b0cdd7df887403ebb165` | 90–184, 340–425 |
| E18 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/corrections/react/correction-form.tsx` | `a87454dc412aad5ec67af4fab3cf96a58a1391c441a58bb1e6e1617707fe9fcf` | 185–219, 418 |
| E19 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:apps/site/src/review/react/review-queue.tsx` | `c8ce32e08358bf489217ddf275b9e937dab5043e3b2bf299fff7a6a6e1119096` | 97–103, 135–170, 216 |

### Actual generated pages and split artifacts inspected

| ID | Coordinate | SHA-256 | Lines used |
|---|---|---|---|
| G01 | `generated-current:apps/site/index.html` | `f2fbcd16c88f52de788b9f34331d5e87eb44067ce101b7396c967f62d7a710fb` | 1–58 |
| G02 | `generated-current:apps/site/practice/index.html` | `bd494dbf6a173facc79d21337fb48885ec7a7337723a2a4baa5f46896c3d8f86` | 1–55 |
| G03 | `generated-current:content/releases/vertical-slice/questions/q068.precommit.json` | `820060324a690cd1f2afc2245f7e6430746c860d781f24839a4a7e1b660abd7e` | 1–35 |
| G04 | `generated-current:content/releases/vertical-slice/questions/q068.postcommit.json` | `4e3f8de731e9325517b6efb839286c105bfee4ac67fc29977684ee0531e96c72` | 1–72 |

### Preserved Plan 004 evidence

| ID | Coordinate | SHA-256 | Lines used |
|---|---|---|---|
| P01 | `fecc71c5ea240385b3d98f896b1152022a2bbbe8:research/ui-ux/consumer-language-study-2026-08-26.md` | `790679c137c798d45492ffbef98ac079934abb794b5c4add923781fc10913431` | 3–7, 90–106, 143–232, 271–378, 380–423 |
| P02 | `fecc71c5ea240385b3d98f896b1152022a2bbbe8:research/ui-ux/consumer-language-study-2026-08-26.json` | `dc84a24decffee4cac7d5cee5969826dbbf29b9f758cdc73927dbf5cb084462a` | 1–19, 47–85 |

### Preserved Plan 005 inventory

| ID | Coordinate | SHA-256 | Lines used |
|---|---|---|---|
| N01 | `9daddbfde073f1f73d806a68dac427b69efc8359:research/ui-ux/navigation-task-hierarchy/README.md` | `369eecff330c6404a3b207df549eca88187dfbb194dd784078c831d6882bea32` | 1–22, 91–140, 155–240 |
| N02 | `9daddbfde073f1f73d806a68dac427b69efc8359:research/ui-ux/navigation-task-hierarchy/research-summary.json` | `cab9477c50a892048599bee003e71936c3ac3c1106c42ee0f7edfe44196c88e7` | 1–30, 69–120 |
| N03 | `9daddbfde073f1f73d806a68dac427b69efc8359:research/ui-ux/navigation-task-hierarchy/route-task-inventory.json` | `db5536f5d376f7450e8b63590532db2ee8eea3c86ad972ab1aa353059cd587ff` | 1–26, 29–112, 115–175 |

### Recovered Step 1 CL-1 prototypes

| ID | Coordinate | SHA-256 | Lines used |
|---|---|---|---|
| P04 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:recovery/plan-004-consumer-language-prototypes/prototypes/home.html` | `05df1d5bdc797137d0b35e0a30eaf1b2781351e542b0b4d7a2c68da42d8231b2` | 1–55 |
| P05 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:recovery/plan-004-consumer-language-prototypes/prototypes/profile.html` | `e672f50871d80572cdc2e6f13e3fe85e04a8c5ac186f0228093ce85e8fd79ca6` | 1–58 |
| P06 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:recovery/plan-004-consumer-language-prototypes/prototypes/practice-start.html` | `cfe277890d2c6ef9490c74055c6ba94a5921a0a6c465aaf34b3b960a07a4e06e` | 1–63 |
| P07 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:recovery/plan-004-consumer-language-prototypes/prototypes/question-feedback.html` | `10336e7ce3d85b587b0eea5f8e8eb6d717e1a595775e11256201f62b45c676db` | 1–77 |
| P08 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:recovery/plan-004-consumer-language-prototypes/prototypes/hazard-feedback.html` | `c9441b28584f1453b8afe982f61c906a9d5f98e352fcc886b1e135e64b3e495b` | 1–62 |
| P09 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:recovery/plan-004-consumer-language-prototypes/prototypes/review.html` | `207ff61103d67bdd5dd5be8d4ef154cb804aa767f2583ea57698525f664c2c67` | 1–57 |
| P10 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:recovery/plan-004-consumer-language-prototypes/prototypes/offline-data.html` | `0eede6bbc7d6c7f2a2b1434eb7f2ad1fa3929c0ecf3bc9fe823151a558d42a8f` | 1–93 |
| P12 | `9fc7dcacfc961752e5d9a2cedbc426deead54a05:recovery/plan-004-consumer-language-prototypes/prototypes/trust-recovery.html` | `36f1cec7646ccddf7e5cd525b88517cf7372cfc5eb187beae7332bac4eafa2f4` | 1–69 |

## Final disposition

| Field | Value |
|---|---|
| `releaseEndorsement` | `withheld` |
| `languageDirectionSelection` | `none` |
| `navigationModelSelection` | `none` |
| `conditionalCodexEndorsement` | CL-D1 default task/error language + CL-D2 compact evidence summaries; NAV-A or NAV-C as prototype candidates; focused player shell as a nonoptional invariant. |
| `blockingCodeFindings` | HC-01 through HC-07. |
| `humanEvidenceStatus` | **NOT HUMAN-USABILITY-TESTED** |
