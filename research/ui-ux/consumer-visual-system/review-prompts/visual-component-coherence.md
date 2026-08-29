# Plan 006 isolated Codex review: visual and component coherence

Review only the immutable, selection-neutral Plan 006 subject and its committed evidence. This is a nonhuman Codex review, not user research or a usability test. Do not contact people, infer learner behavior, change files, or select outside this rubric.

protocolId=CODEX-ONLY-UIUX-V1
reviewMode=codex-only
humanEvidence=none
humanParticipantCount=0
humanReviewRequired=false
notHumanUsabilityTested=true
taskPath={{TASK_PATH}}
rubricId={{RUBRIC_ID}}
repositoryCommit={{REVIEW_SUBJECT_SHA}}
reviewSubjectTreeSha={{REVIEW_SUBJECT_TREE_SHA}}
acceptedStep2SubjectSha=4130693dee6caaa804a116f490b2192861f53e6e
acceptedStep2MergeSha=d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1
comparisonSourceSha={{COMPARISON_SOURCE_SHA}}
prototypeBundleSha256={{PROTOTYPE_BUNDLE_SHA256}}
browserReceiptSha256={{BROWSER_RECEIPT_SHA256}}
rubricSha256={{RUBRIC_SHA256}}

Score Territory A, B, and C independently from 1 through 5 on each exact criterion:

1. component-role-consistency — equivalent roles and states use a coherent component grammar across frames.
2. token-coherence — applied type, color, space, border/elevation, and surface roles form one legible system.
3. seven-archetype-coverage — the territory holds together across every route archetype rather than only showcase frames.
4. responsive-and-print-continuity — phone, tablet, wide, large-text, zoom, forced-color, reduced-motion, and print treatments remain coherent.
5. differentiation-without-content-drift — the visual hypothesis is materially distinct while shared language, navigation, assets, and semantics stay fixed.

For every territory and criterion, provide a concise finding and at least one exact evidence coordinate. Evidence coordinates must use repository/path:L<positive-line>. Record every blocking finding. Do not emit a recommendation field. Set consensusPosition to supports-deterministic-selection only when this lane has one unique highest territory, no blocking finding for any territory, and no dissent; otherwise use cannot-support-selection. Record dissent explicitly. A lane tie, any blocker, or any dissent must prevent lane support regardless of which territory otherwise scores highest.

Allowed evidence-coordinate paths (and no others): research/ui-ux/consumer-visual-system/asset-audit.tsv, research/ui-ux/consumer-visual-system/benchmark-sources.json, research/ui-ux/consumer-visual-system/browser-receipt.json, research/ui-ux/consumer-visual-system/prototype.css, research/ui-ux/consumer-visual-system/prototype.html, research/ui-ux/consumer-visual-system/prototype.mjs, research/ui-ux/consumer-visual-system/token-role-css-map.json, product/CONTENT_DESIGN.md, product/ROUTES.md.

Inspect all seven archetypes and every A/B/C frame in the representative 12-frame, 10-route comparison plus the committed browser special-presentation evidence; do not claim exhaustive legal-state coverage. Treat the nine committed print cases as review-queue-empty A/B/C in Chromium, Firefox, and WebKit only. Do not write to the repository; read-only inspection and /tmp-only scratch work are allowed. Run `node research/ui-ux/consumer-visual-system/verify-research.mjs --phase=render-prompts` and copy this lane's exact promptTemplateSha256 and promptSha256 from its output.

Keyboard evidence is a native document-focus-order round trip: forward Tab observes every derived enabled visible logical document stop in order through the final stop, then Shift+Tab observes the exact reverse order back to the first. The capture does not press forward Tab from the final logical stop and therefore cannot prove the absence of a forward-Tab trap there. No browser-chrome transition or forward wrap is claimed.

Operational independence rule: complete this rubric without requesting or reading another lane's output. Available local task records do not expose the first output-sharing time, so this instruction is sequencing policy rather than proof of cross-output non-observability.

Return exactly one object with these top-level keys in this order: `schemaVersion`, `reportId`, `protocolId`, `reviewMode`, `evidenceClass`, `humanEvidence`, `humanParticipantCount`, `humanReviewRequired`, `notHumanUsabilityTested`, `taskPath`, `rubricId`, `repositoryCommit`, `reviewSubjectTreeSha`, `acceptedStep2SubjectSha`, `acceptedStep2MergeSha`, `comparisonSourceSha`, `prototypeBundleSha256`, `prototypeFiles`, `browserReceiptSha256`, `promptTemplateSha256`, `promptSha256`, `rubricSha256`, `rubricCriteria`, `territoryScores`, `consensusPosition`, `dissent`, `limitations`. Use `schemaVersion` 3, `reportId` `plan-006-visual-component-coherence-review`, `evidenceClass` `nonhuman-codex-review-not-user-research`, the exact metadata and hashes above, the exact three prototype file descriptors from the browser receipt, and the five criterion IDs above in order. Each `territoryScores` entry uses exactly `territoryId`, `criterionScores`, `total`, `blockingFindings`; each criterion score uses exactly `criterionId`, `score`, `finding`, `evidenceCoordinates`; each blocking finding uses exactly `finding`, `evidenceCoordinates`; each dissent entry uses exactly `territoryId`, `reason`, `evidenceCoordinates`. Emit territory records in A, B, C order and criterion records in rubric order. `limitations` must include exactly the truthful strings `not-human-usability-tested` and `cross-output-non-observability-not-cryptographically-provable`.

Do not read or request another review lane's output before submitting your own result. Return exactly one JSON object and no Markdown fence. The completion message observed in the local rollout is hashed separately from the normalized committed review JSON.
