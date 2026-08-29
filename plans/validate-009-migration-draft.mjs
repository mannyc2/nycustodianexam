/* PLAN_009_METADATA_START
{
  "status": "provisional-prework",
  "participantEvidence": "none",
  "humanEvidence": "none",
  "humanParticipantCount": 0,
  "notHumanUsabilityTested": true,
  "decisionStatus": "pending",
  "requiredDependencyShas": null,
  "mustRebaseAndReverify": true,
  "productionAuthorization": false,
  "productionDeploymentStatus": "blocked-live-user-reviewer",
  "productionDeploymentScope": "out-of-scope",
  "liveEnvironmentReviewerType": "User",
  "liveEnvironmentChangeAuthorization": "separate-required",
  "reviewCycleStatus": "prior-cycle-invalidated",
  "priorReviewReceiptsReusable": false,
  "reviewSubjectBaseSha": "d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1",
  "authorizationInterface": "CODEX-ONLY-UIUX-V1",
  "reviewMode": "codex-only",
  "observedAtSha": "d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1"
}
PLAN_009_METADATA_END */

import { spawnSync } from "node:child_process"
import { createHash } from "node:crypto"
import { lstat, readFile } from "node:fs/promises"
import { posix, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url))
const observedAtSha = "d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1"
const historicalBaselineCiHeadSha = "9fc7dcacfc961752e5d9a2cedbc426deead54a05"
/* PLAN_009_INVALIDATED_REVIEW_PROVENANCE_START */
const invalidatedReviewProvenanceRegistry = Object.freeze({
  subjectShas: Object.freeze([
    "8fc6255e5b115cbf7733f5d663328ec1c8a146d3",
    "8434567348b73004c84389bcb89a8848d5e1d84a",
    "cd9920b6b3f14824919429858a65c8810a7b5638",
    "15b625cfe8e3cde74a91cfe824b9c270d6a08f37"
  ]),
  packetBlobShas: Object.freeze([
    "52b0c45f52e092e47854c33021d74a1f5e9a08b0",
    "57497e26a5f76902544cc716b9bddb490d8fd53c",
    "6e0ffe501e7a2363dbabca501c81006078afe6e5",
    "1ee479603b06884280a457c268137faff81206cc",
    "4cad8b94158e18b87633d38d6e7656bdce37fc98"
  ]),
  taskIds: Object.freeze([
    "/root/auth_rollback_final_review",
    "/root/topology_state_dependency_final_review",
    "/root/validator_final_review",
    "/root/auth_rollback_semantic_final_review",
    "/root/topology_state_dependency_semantic_final_review",
    "/root/validator_semantic_final_review",
    "/root/auth_rollback_semantic_class_final_review",
    "/root/topology_state_dependency_semantic_class_final_review",
    "/root/validator_semantic_class_final_review",
    "/root/p009_exact_subject_review_a4",
    "/root/p009_exact_subject_review_b4",
    "/root/p009_exact_subject_review_c4",
    "/root/p009_exact_subject_review_a5",
    "/root/p009_exact_subject_review_b5",
    "/root/p009_exact_subject_review_c5",
    "/root/p009_precommit_provenance_topology_audit_v8",
    "/root/p009_precommit_rollback_state_audit_v8",
    "/root/p009_precommit_semantic_audit_v8",
    "/root/p009_semantic_repair_audit_v9",
    "/root/p009_rollback_settings_repair_v9",
    "/root/p009_precommit_semantic_audit_v9",
    "/root/p009_precommit_rollback_state_v9",
    "/root/p009_precommit_topology_provenance_v9",
    "/root/p009_exact_subject_review_a6",
    "/root/p009_exact_subject_review_b6",
    "/root/p009_exact_subject_review_c6",
    "/root/p009_worktree_rollback_design_v10",
    "/root/p009_worktree_settings_design_v10"
  ]),
  reviewOccurrenceIds: Object.freeze([
    "codex-only-uiux-v1-auth-rollback-rereview",
    "codex-only-uiux-v1-topology-state-dependency-rereview",
    "codex-only-uiux-v1-validator-rereview",
    "codex-only-uiux-v1-auth-rollback-semantic-rereview",
    "codex-only-uiux-v1-topology-state-dependency-semantic-rereview",
    "codex-only-uiux-v1-validator-semantic-rereview",
    "codex-only-uiux-v1-auth-rollback-semantic-class-rereview-v2",
    "codex-only-uiux-v1-topology-state-dependency-semantic-class-rereview-v2",
    "codex-only-uiux-v1-validator-semantic-class-rereview-v2",
    "p009-exact-subject-review-a4",
    "p009-exact-subject-review-b4",
    "p009-exact-subject-review-c4",
    "p009-exact-subject-review-a5",
    "p009-exact-subject-review-b5",
    "p009-exact-subject-review-c5",
    "p009-precommit-provenance-topology-audit-v8",
    "p009-precommit-rollback-state-audit-v8",
    "p009-precommit-semantic-audit-v8",
    "p009-semantic-repair-audit-v9",
    "p009-rollback-settings-repair-v9",
    "p009-precommit-semantic-audit-v9",
    "p009-precommit-rollback-state-v9",
    "p009-precommit-topology-provenance-v9",
    "p009-exact-subject-review-a6",
    "p009-exact-subject-review-b6",
    "p009-exact-subject-review-c6",
    "p009-worktree-rollback-design-v10",
    "p009-worktree-settings-design-v10"
  ])
})
/* PLAN_009_INVALIDATED_REVIEW_PROVENANCE_END */
const invalidatedReviewProvenanceRegistrySha256 = "ae051a733484896d0186738850928f145eb6564ea521ac08c07260cfe34809c5"
const invalidatedReviewProvenanceRegistrySourceSha256 = "0e5fa764be1c4802c932d5abc2d8156d6bab00a899fc611d4771a1a38f89c8a4"
const invalidatedReviewSubjectShas = invalidatedReviewProvenanceRegistry.subjectShas
const reviewSubjectBaseSha = "d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1"
const planPath = "plans/009-consumer-ui-migration-plan.draft.md"
const mapPath = "plans/009-consumer-ui-current-file-map.json"
const validatorPath = "plans/validate-009-migration-draft.mjs"
const packetPaths = [mapPath, planPath, validatorPath]
const indexPath = "plans/README.md"

const requiredMetadata = Object.freeze({
  status: "provisional-prework",
  participantEvidence: "none",
  humanEvidence: "none",
  humanParticipantCount: 0,
  notHumanUsabilityTested: true,
  decisionStatus: "pending",
  requiredDependencyShas: null,
  mustRebaseAndReverify: true,
  productionAuthorization: false,
  productionDeploymentStatus: "blocked-live-user-reviewer",
  productionDeploymentScope: "out-of-scope",
  liveEnvironmentReviewerType: "User",
  liveEnvironmentChangeAuthorization: "separate-required",
  reviewCycleStatus: "prior-cycle-invalidated",
  priorReviewReceiptsReusable: false,
  reviewSubjectBaseSha,
  authorizationInterface: "CODEX-ONLY-UIUX-V1",
  reviewMode: "codex-only",
  observedAtSha
})

const requiredAreas = [
  "component",
  "route",
  "state",
  "stylesheet",
  "content",
  "test",
  "build",
  "accessibility",
  "offline",
  "print",
  "deployment"
]

const requiredDependencyIds = [
  "consumer-language",
  "task-navigation",
  "consumer-visual-system",
  "ui-foundations-responsive-contract",
  "integrated-consumer-validation",
  "parallel-step-04-source-inventory",
  "rollout-feature-flag-decision",
  "observability-privacy-decision",
  "production-authorization-evidence"
]

const requiredDependencyContracts = Object.freeze({
  "consumer-language": Object.freeze({
    sourcePlan: "plans/004-establish-consumer-language-boundary.md",
    purpose: "accepted consumer vocabulary, copy ownership, and internal-wording disposition",
    canonicalConsumers: Object.freeze(["product/CONTENT_DESIGN.md"]),
    coordinateKind: "git-and-artifact",
    markdownConsumer: "`product/CONTENT_DESIGN.md` plus assigned production copy owners",
    markdownDisposition: "Repository-attested Codex decision, merge/artifact coordinates, independent Codex review, and CI"
  }),
  "task-navigation": Object.freeze({
    sourcePlan: "plans/005-rebuild-learner-task-navigation.md",
    purpose: "accepted learner-task hierarchy, labels, route relationships, and navigation behavior",
    canonicalConsumers: Object.freeze([
      "product/ROUTES.md",
      "product/SCREEN_STATES.md",
      "product/COMPONENT_ARCHITECTURE.md",
      "product/DESIGN_SYSTEM.md"
    ]),
    coordinateKind: "git-and-artifact",
    markdownConsumer: "`product/ROUTES.md`, `product/SCREEN_STATES.md`, `product/COMPONENT_ARCHITECTURE.md`, and `product/DESIGN_SYSTEM.md`",
    markdownDisposition: "Accepted hierarchy, labels, route behavior, and merge/artifact coordinates"
  }),
  "consumer-visual-system": Object.freeze({
    sourcePlan: "plans/006-select-consumer-visual-system.md",
    purpose: "accepted visual territory and token contract",
    canonicalConsumers: Object.freeze(["product/DESIGN_SYSTEM.md"]),
    coordinateKind: "git-and-artifact",
    markdownConsumer: "`product/DESIGN_SYSTEM.md`",
    markdownDisposition: "Accepted visual territory, token contract, and merge/artifact coordinates"
  }),
  "ui-foundations-responsive-contract": Object.freeze({
    sourcePlan: "plans/007-specify-ui-foundations-and-responsive-contract.md",
    purpose: "accepted component anatomy, route archetypes, responsive behavior, and authoritative migration ordering",
    canonicalConsumers: Object.freeze(["product/COMPONENT_ARCHITECTURE.md", "product/DESIGN_SYSTEM.md"]),
    coordinateKind: "git-and-artifact",
    markdownConsumer: "`product/COMPONENT_ARCHITECTURE.md` and `product/DESIGN_SYSTEM.md`",
    markdownDisposition: "Accepted anatomy, route archetypes, responsive rules, migration map, and coordinates"
  }),
  "integrated-consumer-validation": Object.freeze({
    sourcePlan: "plans/008-run-integrated-consumer-ux-validation.md",
    purpose: "accepted integrated journey, accessibility, and conditional rollout evidence",
    canonicalConsumers: Object.freeze([
      "product/CONTENT_DESIGN.md",
      "product/ROUTES.md",
      "product/COMPONENT_ARCHITECTURE.md",
      "product/DESIGN_SYSTEM.md",
      "docs/OPEN.md"
    ]),
    coordinateKind: "git-and-artifact",
    markdownConsumer: "`product/CONTENT_DESIGN.md`, `product/ROUTES.md`, `product/COMPONENT_ARCHITECTURE.md`, `product/DESIGN_SYSTEM.md`, and `docs/OPEN.md` plus final retained validation evidence",
    markdownDisposition: "Acceptable implementation disposition, zero unresolved critical failures, every condition assigned, and exact coordinates"
  }),
  "parallel-step-04-source-inventory": Object.freeze({
    sourcePlan: null,
    purpose: "exact source-string, component, selector, route, and generated-output inventory produced in parallel",
    canonicalConsumers: Object.freeze([planPath, mapPath]),
    coordinateKind: "git-and-artifact",
    markdownConsumer: "This plan and the current-file map",
    markdownDisposition: "Exact merged commit, complete path/string/selector assignment, drift reconciliation"
  }),
  "rollout-feature-flag-decision": Object.freeze({
    sourcePlan: null,
    purpose: "optional accepted decision only if the current no-runtime-flag hard cut is replaced",
    canonicalConsumers: Object.freeze([]),
    coordinateKind: "optional-git-decision",
    markdownConsumer: "Release section of the final plan",
    markdownDisposition: "Optional Git decision only if the current no-runtime-flag hard cut is replaced"
  }),
  "observability-privacy-decision": Object.freeze({
    sourcePlan: null,
    purpose: "optional accepted privacy and retention decision only if remote observability is proposed",
    canonicalConsumers: Object.freeze([]),
    coordinateKind: "optional-git-decision",
    markdownConsumer: "Observability section of the final plan",
    markdownDisposition: "Optional Git decision only if remote measurement or logging is proposed"
  }),
  "production-authorization-evidence": Object.freeze({
    sourcePlan: null,
    purpose: "post-graduation candidate-bound certification and live protected-deployment evidence; this remains null and cannot be satisfied by this planning task",
    canonicalConsumers: Object.freeze([
      "docs/DEPLOYMENT.md",
      ".github/workflows/cloudflare-production.yml",
      "docs/certification/production-v1.json"
    ]),
    coordinateKind: "technical-deployment-evidence",
    markdownConsumer: "Deployment handoff, production workflow, and candidate-bound certification record",
    markdownDisposition: "Post-graduation technical evidence only; remains null, is out of scope here, and cannot bypass the live User reviewer"
  })
})

const expectedOriginUrl = "https://github.com/mannyc2/nycustodianexam"

let activeCodexReviewEntries = Object.freeze([])

const nativeAllocationPromptUtf8 = "Allocation-only native Codex task receipt for a future exact-subject review. Do not inspect the repository, do not review any bytes, do not edit, commit, push, merge, deploy, contact humans, or claim a disposition. Reply only with: ALLOCATED-PENDING-EXACT-SUBJECT. Await a later follow-up containing the immutable subject, exact rubric, packet blobs, and byte intervals."

const requiredCodexReviewTasks = Object.freeze([
  Object.freeze({
    taskId: "/root/p009_exact_subject_review_a7",
    reviewOccurrenceId: "p009-exact-subject-review-a7",
    reviewKind: "authorization-and-rollback-review",
    rubricId: "p009-auth-rollback-semantic-rubric-v4",
    reviewRubricUtf8: "Independently audit the exact subject for free-form production/release authorization, human-study evidence, approval/pass/selection claims, Unicode or path masking, live User-reviewer gate contradictions, and every noncanonical rollback action. Exercise Markdown, decoded-map, and nested review-result surfaces. Report every blocker with a stable finding ID and exact path/line evidence. Return no hidden reasoning and no production authorization.",
    nativeAllocationResultUtf8: "ALLOCATED-PENDING-EXACT-SUBJECT."
  }),
  Object.freeze({
    taskId: "/root/p009_exact_subject_review_b7",
    reviewOccurrenceId: "p009-exact-subject-review-b7",
    reviewKind: "topology-state-and-dependency-review",
    rubricId: "p009-topology-state-provenance-rubric-v4",
    reviewRubricUtf8: "Independently audit the exact subject for complete topology contracts, exact authority/areas/role/migration seams, service-worker ownership, settings restoration correctness, dependency and docs/OPEN bindings, tranche order, stop conditions, and native Codex review provenance. Verify all claims against exact repository bytes. Report stable finding IDs and exact path/line evidence. Return no hidden reasoning and no production authorization.",
    nativeAllocationResultUtf8: "ALLOCATED-PENDING-EXACT-SUBJECT."
  }),
  Object.freeze({
    taskId: "/root/p009_exact_subject_review_c7",
    reviewOccurrenceId: "p009-exact-subject-review-c7",
    reviewKind: "validator-integrity-rereview",
    rubricId: "p009-validator-adversarial-rubric-v4",
    reviewRubricUtf8: "Adversarially audit the exact subject validator as a semantic class, including three-surface attacks, benign controls, normalization, invalid provenance exclusion, empty and populated ledger validity, source interval binding, Git parent/path/mode boundaries, attestation-only mutation, and rollback/settings contradictions. Report every accepted bypass or false-positive blocker with a stable finding ID and exact path/line evidence. Return no hidden reasoning and no production authorization.",
    nativeAllocationResultUtf8: "ALLOCATED-PENDING-EXACT-SUBJECT."
  })
])

const criticalAnchors = [
  "product/FEATURE_SPEC.md",
  "product/ARCHITECTURE_CONSTRAINTS.md",
  "product/CONTENT_DESIGN.md",
  "product/ROUTES.md",
  "product/SCREEN_STATES.md",
  "product/COMPONENT_ARCHITECTURE.md",
  "product/DESIGN_SYSTEM.md",
  "docs/FACTBASE.md",
  "docs/SCOPE.md",
  "docs/TAXONOMY.md",
  "docs/OPEN.md",
  "illustration/VISUAL_AUTHORING_POLICY.md",
  "apps/site/src/route-registry.ts",
  "apps/site/scripts/generate-pages.tsx",
  "apps/site/vite.config.ts",
  "apps/site/src/asset-router.ts",
  "apps/site/src/styles.css",
  "apps/site/src/settings/preferences-boot.ts",
  "apps/site/src/screen/store.ts",
  "apps/site/src/app-runtime.ts",
  "apps/site/src/verified-content.ts",
  "apps/site/src/attempt-receipt.ts",
  "apps/site/src/trusted-release-content.ts",
  "apps/site/src/delivery-manifest.ts",
  "apps/site/src/session-navigation.ts",
  "apps/site/src/study-storage/app-database.ts",
  "apps/site/src/study-storage/app-database/storage-model.ts",
  "apps/site/src/study-storage/app-database/legacy-import.ts",
  "apps/site/src/question-player/persistence.ts",
  "apps/site/src/question-player/commit-and-reveal.ts",
  "apps/site/src/question-player/react/player.tsx",
  "apps/site/src/hazard-player/persistence.ts",
  "apps/site/src/hazard-player/commit-and-reveal.ts",
  "apps/site/src/hazard-player/react/player.tsx",
  "apps/site/src/hazard-player/react/bootstrap.tsx",
  "apps/site/src/review/model.ts",
  "apps/site/src/review/persistence.ts",
  "apps/site/src/review/projection.ts",
  "apps/site/src/review/react/review-queue.tsx",
  "apps/site/src/simulation/model.ts",
  "apps/site/src/simulation/persistence.ts",
  "apps/site/src/simulation/react/bootstrap-player.tsx",
  "apps/site/src/simulation/react/player.tsx",
  "apps/site/src/simulation/react/results.tsx",
  "apps/site/src/settings-runtime.ts",
  "apps/site/src/settings/persistence.ts",
  "apps/site/src/settings/review-rebuild.ts",
  "apps/site/src/settings/react/bootstrap.tsx",
  "apps/site/src/settings/react/settings.tsx",
  "apps/site/src/offline-pack-runtime.ts",
  "apps/site/src/offline-packs/react/bootstrap.tsx",
  "apps/site/src/offline-packs/react/pack-manager.tsx",
  "apps/site/src/correction-runtime.ts",
  "apps/site/src/corrections/client.ts",
  "apps/site/src/corrections/persistence.ts",
  "apps/site/src/corrections/react/bootstrap.tsx",
  "apps/site/public/sw.js",
  "apps/site/scripts/service-worker-finalization.ts",
  "apps/site/src/print/workflow.ts",
  "apps/site/src/print/persistence.ts",
  "apps/site/src/print/react/builder-bootstrap.tsx",
  "apps/site/src/print/react/preview-bootstrap.tsx",
  "content/authoring/visuals/releases/RELEASE-INVARIANTS.md",
  "content/authoring/visuals/releases/tools.json",
  "content/authoring/visuals/releases/comparisons.json",
  "content/authoring/visuals/releases/scenes.json",
  "content/authoring/visuals/releases/verify-visual-release.mjs",
  "content/authoring/packs/launch-v1.curated.mjs",
  "packages/content/src/model.ts",
  "packages/content/src/compiler.ts",
  "apps/content-compiler/src/main.ts",
  "package.json",
  "bun.lock",
  "scripts/verify-artifacts.ts",
  "apps/site/playwright.config.ts",
  "apps/site/browser-tests/accessibility-and-presentation.pw.ts",
  "apps/site/browser-tests/delivery.pw.ts",
  "apps/site/browser-tests/question-player.pw.ts",
  "apps/site/browser-tests/hazard-player.pw.ts",
  "apps/site/browser-tests/review-queue.pw.ts",
  "apps/site/browser-tests/simulation.pw.ts",
  "apps/site/browser-tests/settings-review-rebuild.pw.ts",
  "apps/site/browser-tests/app-database.pw.ts",
  "apps/site/browser-tests/local-data-and-packs.pw.ts",
  "apps/site/browser-tests/offline-and-update.pw.ts",
  "apps/site/browser-tests/print.pw.ts",
  "docs/DEPLOYMENT.md",
  "docs/certification/production-v1.json",
  "scripts/check-production-certification.ts",
  ".github/workflows/certification.yml",
  ".github/workflows/cloudflare-preview.yml",
  ".github/workflows/cloudflare-production.yml",
  "apps/site/wrangler.jsonc",
  "packages/correction-intake/src/model.ts",
  "apps/correction-worker/src/worker.ts",
  "apps/correction-worker/wrangler.jsonc"
]

const requiredFileRecordContracts = Object.freeze({
  "apps/site/scripts/service-worker-finalization.ts": Object.freeze({
    path: "apps/site/scripts/service-worker-finalization.ts",
    areas: Object.freeze(["build", "offline", "deployment"]),
    role: "Pure deterministic cache-version and service-worker marker/precache finalization primitive over normalized unique path and byte inputs.",
    migrationSeam: "Tranche 3 owns the primary shell cut; Tranches 7 and 8 must reverify deterministic cache identity and complete precache closure.",
    trancheOwnership: Object.freeze(["tranche-03-primary", "tranche-07-reverify", "tranche-08-reverify"]),
    authority: "build-release"
  }),
  "apps/site/src/study-storage/app-database.ts": Object.freeze({
    path: "apps/site/src/study-storage/app-database.ts",
    areas: Object.freeze(["state", "offline", "build"]),
    role: "Public scoped database Layer that owns connection lifecycle, pagehide/pageshow handling, and legacy-import capability.",
    migrationSeam: "Tranche 7 owns this invariant after Tranche 1 characterization; UI work must preserve one connection owner and cannot change its runtime or import lifecycle.",
    trancheOwnership: Object.freeze(["tranche-01-characterization", "tranche-07-invariant"]),
    authority: "production-source"
  }),
  "apps/site/src/study-storage/app-database/legacy-import.ts": Object.freeze({
    path: "apps/site/src/study-storage/app-database/legacy-import.ts",
    areas: Object.freeze(["state", "offline", "test"]),
    role: "Abortable legacy-database reader and atomic import, match, conflict-preservation, and quarantine boundary.",
    migrationSeam: "Tranche 7 owns this invariant after Tranche 1 characterization; presentation changes cannot weaken decoding, destination truth, quarantine, or transaction atomicity.",
    trancheOwnership: Object.freeze(["tranche-01-characterization", "tranche-07-invariant"]),
    authority: "production-source"
  }),
  "content/authoring/visuals/releases/RELEASE-INVARIANTS.md": Object.freeze({
    path: "content/authoring/visuals/releases/RELEASE-INVARIANTS.md",
    areas: Object.freeze(["content", "build", "test"]),
    role: "Maintained ownership contract separating stable visual inventory evidence from canonical release-lifecycle ledgers and their verification gate.",
    migrationSeam: "Tranche 4 owns tool/comparison consumption, Tranche 6 owns scene consumption, and Tranche 8 recloses the immutable release graph without changing lifecycle authority.",
    trancheOwnership: Object.freeze(["tranche-04-tools-comparisons", "tranche-06-scenes", "tranche-08-closure"]),
    authority: "maintained-authority"
  }),
  "content/authoring/visuals/releases/tools.json": Object.freeze({
    path: "content/authoring/visuals/releases/tools.json",
    areas: Object.freeze(["content", "build", "accessibility"]),
    role: "Canonical 65-record accepted tool-release ledger binding concept identity, exact masters and derivatives, hashes, review evidence, and publication gates.",
    migrationSeam: "Tranche 4 may change only consumer presentation; Tranche 8 must reclose every unchanged tool identity, byte count, hash, and publication gate.",
    trancheOwnership: Object.freeze(["tranche-04-primary", "tranche-08-reverify"]),
    authority: "content-source"
  }),
  "content/authoring/visuals/releases/comparisons.json": Object.freeze({
    path: "content/authoring/visuals/releases/comparisons.json",
    areas: Object.freeze(["content", "build", "accessibility"]),
    role: "Canonical 14-record accepted comparison-release ledger binding members, member-master hashes, decisive distinctions, derivatives, and scored-use gates.",
    migrationSeam: "Tranche 4 may change only atlas presentation; Tranche 8 must preserve membership, hashes, decisive distinctions, and scored-use gates exactly.",
    trancheOwnership: Object.freeze(["tranche-04-primary", "tranche-08-reverify"]),
    authority: "content-source"
  }),
  "content/authoring/visuals/releases/scenes.json": Object.freeze({
    path: "content/authoring/visuals/releases/scenes.json",
    areas: Object.freeze(["content", "build", "accessibility", "offline", "print"]),
    role: "Canonical 18-record accepted hazard-scene ledger binding scene identity, semantic manifests, exact artifacts, hashes, companion records, and publication gates.",
    migrationSeam: "Tranche 6 may change only scene consumption and viewport presentation; Tranche 8 must reclose exact scene identities, bytes, hashes, and companion records.",
    trancheOwnership: Object.freeze(["tranche-06-primary", "tranche-08-reverify"]),
    authority: "content-source"
  }),
  "content/authoring/visuals/releases/verify-visual-release.mjs": Object.freeze({
    path: "content/authoring/visuals/releases/verify-visual-release.mjs",
    areas: Object.freeze(["content", "build", "test", "deployment"]),
    role: "Read-only release gate for taxonomy provenance, lifecycle ownership, inventory order, membership, exact artifact bytes/hashes, manifests, and scene companions.",
    migrationSeam: "Tranches 4 and 6 must run this gate for their visual consumers, and Tranche 8 must pass its complete release closure before candidate preview.",
    trancheOwnership: Object.freeze(["tranche-04-gate", "tranche-06-gate", "tranche-08-gate"]),
    authority: "release-gate"
  }),
  "apps/site/src/settings/react/settings.tsx": Object.freeze({
    path: "apps/site/src/settings/react/settings.tsx",
    areas: Object.freeze(["component", "state", "accessibility", "offline"]),
    role: "Large settings, preferences, transfer, reset, rebuild, and local diagnostics presentation.",
    migrationSeam: "Tranche 1 must characterize and close the default-state restoration race; Tranche 7 may migrate presentation only after explicit restoring state disables preference edits and Save until authoritative load or handled failure completes.",
    trancheOwnership: Object.freeze(["tranche-01-correctness", "tranche-07-presentation"]),
    authority: "production-source"
  })
})

const allowedAuthorities = new Set([
  "maintained-authority",
  "production-source",
  "content-source",
  "build-release",
  "test-evidence",
  "release-gate"
])

const criticalFileRecordContractSha256 = "9e9b499123e42f0419c3164f38445d6c0911c359638816dcf4a534a4dc85b66c"

const exactDisclaimer = "This packet is provisional prework only. It is not a final migration plan, an accepted upstream decision, implementation authorization, or production authorization."

const requiredPlanSections = [
  "## Status and use boundary",
  "## Current production topology at the observed baseline",
  "## Dependency and decision slots",
  "## Codex-only authorization and review evidence",
  "## Contract adoption procedure after Steps 02–05 land",
  "## Provisional hard-cut mechanics",
  "## Provisional eight-tranche dependency order",
  "## Cross-tranche test and certification strategy",
  "## Accessibility and performance budgets",
  "## Offline and state migration contract",
  "## Anti-AI-slop and internal-wording removal gates",
  "## Analytics, observability, and rollout evidence",
  "## Ownership slots",
  "## Risk and rollback matrix",
  "## Explicit production stop conditions",
  "## Non-goals",
  "## Rebase, reverify, and graduation checklist",
  "## Validation for this provisional packet"
]

const requiredTopologyTableRows = Object.freeze([
  "| `apps/site/scripts/service-worker-finalization.ts` | Tranche 3; reverify in Tranches 7 and 8 | Deterministic cache identity and complete safe precache closure |",
  "| `apps/site/src/study-storage/app-database.ts` | Characterize in Tranche 1; preserve in Tranche 7 | One scoped connection owner and unchanged runtime lifecycle |",
  "| `apps/site/src/study-storage/app-database/legacy-import.ts` | Characterize in Tranche 1; preserve in Tranche 7 | Abortability, decoding, destination truth, quarantine, and atomic import |",
  "| `content/authoring/visuals/releases/RELEASE-INVARIANTS.md` | Tranches 4 and 6; reclose in Tranche 8 | Inventory evidence never becomes lifecycle authority |",
  "| `content/authoring/visuals/releases/tools.json` | Tranche 4; reclose in Tranche 8 | Exact 65-record release identity, bytes, hashes, and gates |",
  "| `content/authoring/visuals/releases/comparisons.json` | Tranche 4; reclose in Tranche 8 | Exact 14-record membership, distinctions, hashes, and scored-use gates |",
  "| `content/authoring/visuals/releases/scenes.json` | Tranche 6; reclose in Tranche 8 | Exact 18-scene identity, artifacts, companion records, and gates |",
  "| `content/authoring/visuals/releases/verify-visual-release.mjs` | Required in Tranches 4, 6, and 8 | Complete release graph and artifact closure |"
])

const canonicalRollbackContract = "Direct revert is permitted only for the current unmerged tip or a dependency-closed suffix. Any earlier or nonclosed recovery requires a forward fix, full rebuild, inactive preview, and recertification."
const exactSettingsRaceObservedFact = "The settings island initializes default preferences with busy false, begins authoritative IndexedDB restoration asynchronously, saves the current React projection, and leaves preference controls plus Save active while restoration is unresolved."
const canonicalProductionDeploymentBoundary = "Production deployment is blocked and out of scope while the live production Environment requires a reviewer whose GitHub type is User. Codex cannot satisfy or bypass that rule, and Plan 009 cannot change the Environment. Any future Environment change requires separate authorization and repository attestation."

const requiredTrancheLabels = [
  "**Contract slots:**",
  "**Scope:**",
  "**Preserved invariant:**",
  "**Review slice:**",
  "**Verification:**",
  "**Rollback boundary:**",
  "**STOP conditions:**"
]

const forbiddenStateValues = new Set([
  "accepted",
  "approved",
  "authorized",
  "certified",
  "complete",
  "completed",
  "done",
  "final",
  "implementation-authorized",
  "production-authorized",
  "production-ready"
])

const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key)

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const assertObject = (value, label) => {
  assert(value !== null && typeof value === "object" && !Array.isArray(value), `${label} must be an object`)
}

const assertExactKeys = (value, expected, label) => {
  assertObject(value, label)
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  assert(
    JSON.stringify(actual) === JSON.stringify(wanted),
    `${label} keys differ: expected ${wanted.join(", ")}; received ${actual.join(", ")}`
  )
}

const assertNonEmptyString = (value, label) => {
  assert(typeof value === "string" && value.trim().length > 0, `${label} must be a non-empty string`)
}

const readUtf8 = (path) => readFile(resolve(repositoryRoot, path), "utf8")

const git = (arguments_, { allowFailure = false } = {}) => {
  const result = spawnSync("git", arguments_, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  })
  if (result.error !== undefined) throw result.error
  if (!allowFailure && result.status !== 0) {
    throw new Error(`git ${arguments_.join(" ")} failed: ${result.stderr.trim() || `exit ${result.status}`}`)
  }
  return result
}

const nulPaths = (output) => output.split("\0").filter((path) => path.length > 0)

const trackedRepositoryPathsAtObservedSha = new Set(nulPaths(
  git(["ls-tree", "-r", "--name-only", "-z", observedAtSha]).stdout
))

const isValidatedRepositoryPathLiteral = (value) => {
  const candidate = value.trim()
  return trackedRepositoryPathsAtObservedSha.has(candidate) || packetPaths.includes(candidate) || candidate === indexPath
}

const parseJsonNoDuplicateKeys = (source, label) => {
  let cursor = 0

  const fail = (message) => {
    throw new Error(`${label} is not valid JSON: ${message} at offset ${cursor}`)
  }

  const skipWhitespace = () => {
    while (/[ \t\n\r]/u.test(source[cursor] ?? "")) cursor += 1
  }

  const parseString = () => {
    assert(source[cursor] === '"', `${label} JSON parser expected a string at offset ${cursor}`)
    const start = cursor
    cursor += 1
    while (cursor < source.length) {
      const character = source[cursor]
      if (character === '"') {
        cursor += 1
        try {
          return JSON.parse(source.slice(start, cursor))
        } catch (cause) {
          fail(cause instanceof Error ? cause.message : String(cause))
        }
      }
      if (character === "\\") {
        cursor += 2
      } else {
        cursor += 1
      }
    }
    fail("unterminated string")
  }

  const parseValue = () => {
    skipWhitespace()
    const character = source[cursor]
    if (character === "{") {
      cursor += 1
      skipWhitespace()
      const value = Object.create(null)
      const keys = new Set()
      if (source[cursor] === "}") {
        cursor += 1
        return value
      }
      while (cursor < source.length) {
        skipWhitespace()
        if (source[cursor] !== '"') fail("object key must be a string")
        const key = parseString()
        if (keys.has(key)) throw new Error(`${label} contains duplicate JSON key ${JSON.stringify(key)}`)
        assert(!["__proto__", "constructor", "prototype"].includes(key), `${label} contains forbidden JSON key ${JSON.stringify(key)}`)
        keys.add(key)
        skipWhitespace()
        if (source[cursor] !== ":") fail("object key must be followed by a colon")
        cursor += 1
        const entry = parseValue()
        Object.defineProperty(value, key, { configurable: true, enumerable: true, value: entry, writable: true })
        skipWhitespace()
        if (source[cursor] === "}") {
          cursor += 1
          return value
        }
        if (source[cursor] !== ",") fail("object entries must be comma-separated")
        cursor += 1
      }
      fail("unterminated object")
    }
    if (character === "[") {
      cursor += 1
      skipWhitespace()
      const value = []
      if (source[cursor] === "]") {
        cursor += 1
        return value
      }
      while (cursor < source.length) {
        value.push(parseValue())
        skipWhitespace()
        if (source[cursor] === "]") {
          cursor += 1
          return value
        }
        if (source[cursor] !== ",") fail("array entries must be comma-separated")
        cursor += 1
      }
      fail("unterminated array")
    }
    if (character === '"') return parseString()
    for (const [literal, value] of [["true", true], ["false", false], ["null", null]]) {
      if (source.startsWith(literal, cursor)) {
        cursor += literal.length
        return value
      }
    }
    const number = source.slice(cursor).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/u)?.[0]
    if (number !== undefined) {
      cursor += number.length
      return Number(number)
    }
    fail("unexpected token")
  }

  const value = parseValue()
  skipWhitespace()
  if (cursor !== source.length) fail("unexpected trailing input")
  return value
}

const parseMarkedMetadata = (source, label) => {
  const starts = [...source.matchAll(/^[^\S\r\n]*(?:<!--|\/\*) PLAN_009_METADATA_START[^\S\r\n]*$/gmu)]
  const ends = [...source.matchAll(/^[^\S\r\n]*PLAN_009_METADATA_END (?:-->|\*\/)[^\S\r\n]*$/gmu)]
  assert(starts.length === 1, `${label} must contain exactly one metadata start marker; found ${starts.length}`)
  assert(ends.length === 1, `${label} must contain exactly one metadata end marker; found ${ends.length}`)
  assert(ends[0].index > starts[0].index, `${label} metadata markers are out of order`)
  const jsonStart = source.indexOf("\n", starts[0].index) + 1
  return parseJsonNoDuplicateKeys(source.slice(jsonStart, ends[0].index).trim(), `${label} metadata`)
}

const visibleMarkdown = (source) => {
  const hiddenStructuralPattern = /^(?: {0,3}#{1,6}\s| {0,3}\|| {0,3}\*\*(?:Scope|Preserved invariant|Contract-adoption slots|Implementation surface|Verification|Rollback boundary|Stop before next tranche if):\*\*)/u
  const stripContainers = (line) => {
    let current = line
    while (true) {
      const next = current
        .replace(/^ {0,3}>[ \t]?/u, "")
        .replace(/^ {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]+/u, "")
      if (next === current) return current
      current = next
    }
  }
  const assertNoHiddenStructure = (hidden, label) => {
    for (const line of hidden.split("\n")) {
      assert(
        !hiddenStructuralPattern.test(stripContainers(line)),
        `migration draft contains a structural token inside ${label}`
      )
    }
  }
  for (const comment of source.match(/<!--[\s\S]*?-->/gu) ?? []) {
    assertNoHiddenStructure(comment.slice(4, -3), "an HTML comment")
  }
  const withoutComments = source.replace(/<!--[\s\S]*?-->/gu, "")
  assert(!/<(?:\/?[a-z]|[?!])/iu.test(withoutComments), "migration draft cannot use raw HTML containers")
  const visible = []
  let fence
  for (const line of withoutComments.split("\n")) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/u)
    if (fence === undefined && marker !== null) {
      fence = { kind: marker[1][0], length: marker[1].length }
      continue
    }
    if (
      fence !== undefined &&
      marker !== null &&
      marker[1][0] === fence.kind &&
      marker[1].length >= fence.length &&
      marker[2].trim().length === 0
    ) {
      fence = undefined
      continue
    }
    if (fence === undefined) {
      visible.push(line)
    } else {
      assertNoHiddenStructure(line, "a fenced block")
    }
  }
  assert(fence === undefined, "migration draft contains an unclosed fenced block")
  return visible.join("\n")
}

const validateMarkdownContainers = (source) => {
  const lines = source.split("\n")
  for (const [index, line] of lines.entries()) {
    assert(
      !/^\s+#{1,6}\s/u.test(line),
      `migration draft contains an indented heading at visible line ${index + 1}`
    )
    assert(
      !/^\s+\|/u.test(line),
      `migration draft contains an indented table row at visible line ${index + 1}`
    )
    let reduced = line
    let containerCount = 0
    while (true) {
      const next = reduced
        .replace(/^ {0,3}>[ \t]?/u, "")
        .replace(/^ {0,3}(?:[-+*]|\d{1,9}[.)])[ \t]+/u, "")
      if (next === reduced) break
      reduced = next
      containerCount += 1
    }
    if (containerCount > 0) {
      assert(
        !/^(?: {0,3}#{1,6}\s| {0,3}\|| {0,3}\*\*(?:Scope|Preserved invariant|Contract-adoption slots|Implementation surface|Verification|Rollback boundary|Stop before next tranche if):\*\*)/u.test(reduced),
        `migration draft contains a container-hidden heading, table row, or tranche label at visible line ${index + 1}`
      )
    }
    if (index > 0 && /^ {0,3}(?:=+|-+)\s*$/u.test(line) && lines[index - 1].trim().length > 0) {
      throw new Error(`migration draft contains a Setext heading at visible line ${index + 1}`)
    }
  }
}

const normalizeWhitespace = (source) => source.replace(/\s+/gu, " ").trim()

const decodePercentRuns = (source) => {
  let current = source
  for (let pass = 0; pass < 4; pass += 1) {
    const next = current.replace(/(?:%[0-9a-f]{2})+/giu, (run) => {
      try {
        return decodeURIComponent(run)
      } catch {
        return run
      }
    })
    if (next === current) return current
    current = next
  }
  return current
}

const semanticClaimProjection = (source, { preserveCommentBodies = true } = {}) => {
  if (isValidatedRepositoryPathLiteral(source.trim())) return "repository_path"
  const destinations = []
  const withValidatedPathSentinels = decodePercentRuns(source)
    .normalize("NFKC")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .replace(/\bcan['’]t\b/giu, "cannot")
    .replace(/\bwon['’]t\b/giu, "will not")
    .replace(/\b(?:isn['’]t|ain['’]t)\b/giu, "is not")
    .replace(/\baren['’]t\b/giu, "are not")
    .replace(/\bwasn['’]t\b/giu, "was not")
    .replace(/\bweren['’]t\b/giu, "were not")
    .replace(/\bhasn['’]t\b/giu, "has not")
    .replace(/\bhaven['’]t\b/giu, "have not")
    .replace(/\bhadn['’]t\b/giu, "had not")
    .replace(/\bdidn['’]t\b/giu, "did not")
    .replace(/\bdoesn['’]t\b/giu, "does not")
    .replace(/\bdon['’]t\b/giu, "do not")
    .replace(/(?<!`)`([^`\n]+)`(?!`)/gu, (_match, code) =>
      isValidatedRepositoryPathLiteral(code) ? " REPOSITORYPATHSENTINEL " : ` ${code} `
    )
  const maskedSemanticLexemes = Object.freeze([
    "accepted",
    "active",
    "adjust",
    "adjusted",
    "adjusting",
    "adjusts",
    "adopted",
    "advised",
    "ahead",
    "agreement",
    "allowed",
    "applied",
    "apply",
    "available",
    "backing",
    "approved",
    "approval",
    "aligned",
    "authorized",
    "authorised",
    "authorization",
    "answer",
    "answered",
    "back",
    "backed",
    "backout",
    "begin",
    "blocked",
    "cleared",
    "choice",
    "commentary",
    "commit",
    "committed",
    "committing",
    "commits",
    "complete",
    "completed",
    "coalesced",
    "continue",
    "continued",
    "continuing",
    "consensus",
    "consent",
    "consulted",
    "convened",
    "criteria",
    "certified",
    "certify",
    "decision",
    "declared",
    "deployed",
    "deploy",
    "deploying",
    "deployment",
    "disabled",
    "downgrade",
    "downgraded",
    "downgrading",
    "editable",
    "edit",
    "edited",
    "editing",
    "edits",
    "enabled",
    "embargo",
    "ended",
    "empowered",
    "endorsed",
    "endorsement",
    "fallback",
    "fall",
    "fell",
    "fail",
    "failed",
    "fails",
    "falling",
    "falls",
    "feedback",
    "finished",
    "expired",
    "execute",
    "executed",
    "forward",
    "green",
    "happening",
    "hold",
    "implementation",
    "initiate",
    "initiated",
    "imminent",
    "interviewed",
    "learner",
    "learners",
    "light",
    "lifted",
    "listen",
    "listened",
    "live",
    "load",
    "loaded",
    "loading",
    "loads",
    "locked",
    "launch",
    "made",
    "may",
    "modify",
    "modified",
    "modifies",
    "modifying",
    "occurred",
    "objection",
    "objections",
    "online",
    "opened",
    "out",
    "opted",
    "participants",
    "people",
    "permitted",
    "permission",
    "perform",
    "performed",
    "possible",
    "previous",
    "published",
    "publish",
    "ready",
    "recover",
    "recovered",
    "recovering",
    "recovers",
    "recovery",
    "releasable",
    "production",
    "proceed",
    "redeploy",
    "redeployed",
    "redeploying",
    "redeploys",
    "release",
    "remarks",
    "record",
    "recorded",
    "recording",
    "records",
    "resolved",
    "restriction",
    "restrictions",
    "restore",
    "restored",
    "restoring",
    "restoration",
    "revert",
    "reverted",
    "revertible",
    "reverting",
    "reverts",
    "reversion",
    "revertibility",
    "reverse",
    "reversed",
    "reversal",
    "rollback",
    "roll",
    "rolled",
    "rolling",
    "rolls",
    "rollout",
    "resume",
    "resumed",
    "resuming",
    "revise",
    "revised",
    "revises",
    "revising",
    "sanctioned",
    "serving",
    "selected",
    "selection",
    "settings",
    "shadowed",
    "ship",
    "stands",
    "started",
    "store",
    "stored",
    "stores",
    "storing",
    "study",
    "succeeded",
    "successful",
    "suggestion",
    "suggestions",
    "support",
    "supported",
    "supplied",
    "switched",
    "switch",
    "switches",
    "switching",
    "talked",
    "underway",
    "undergo",
    "underwent",
    "unobstructed",
    "undo",
    "undid",
    "undoes",
    "undoing",
    "undone",
    "users",
    "usability",
    "validate",
    "validated",
    "victorious",
    "waiver",
    "withdrawn",
    "witnessed",
    "winner",
    "won",
    "persist",
    "persisted",
    "persisting",
    "persists",
    "run",
    "ran",
    "running",
    "runs",
    "save",
    "saved",
    "saves",
    "saving",
    "trigger",
    "triggered",
    "triggers",
    "triggering",
    "update",
    "updated",
    "updates",
    "updating",
    "write"
  ])
  const maskedJoiner = String.raw`[\p{M}\p{Cf}\p{P}\p{S}\s]*`
  const visible = maskedSemanticLexemes.reduce((candidate, lexeme) => {
    const letters = [...lexeme].map((letter) => letter.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&"))
    const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${letters.join(maskedJoiner)}(?![\\p{L}\\p{N}])`, "giu")
    return candidate.replace(pattern, (match) =>
      /^\p{Lu}/u.test(match) ? `${lexeme[0].toUpperCase()}${lexeme.slice(1)}` : lexeme
    )
  }, withValidatedPathSentinels)
    .replace(/!?\[([^\]\n]*)\]\(([^)\n]*)\)/gu, (_match, text, destination) => {
      destinations.push(destination)
      return text
    })
    .replace(/!?\[([^\]\n]*)\][ \t]*(?:\n[ \t]*)?\[[^\]\n]*\]/gu, "$1")
    .replace(/!?\[([^\]\n]*)\]/gu, "$1")
    .replace(/<!--([\s\S]*?)-->/gu, preserveCommentBodies ? "$1" : "")
    .replace(/\\([\\`*_[\]{}()#+\-.!|>~])/gu, "$1")
    .replace(/[*_~`]/gu, "")
    .replace(/[ \t]+([.,;:!?])/gu, "$1")
    .replace(/\p{Cf}/gu, "")
  return decodePercentRuns(`${visible}\n\n${destinations.join("\n")}`)
    .replace(/\n(?=[ \t]*(?:\||#{1,6}[ \t]|[-+*][ \t]|\d+\.[ \t]))/gu, "\u0000")
    .replace(/[ \t]*\n(?:[ \t]*\n)+[ \t]*/gu, "\u0000")
    .replace(/[ \t]*\n[ \t]*/gu, " ")
    .replaceAll("\u0000", "\n")
    .replace(/[ \t]+/gu, " ")
    .trim()
}

const semanticClaimClauses = (source, { project = true } = {}) => {
  const candidate = project ? semanticClaimProjection(source) : source
  const variants = candidate.includes("REPOSITORYPATHSENTINEL")
    ? [
        candidate,
        candidate.replaceAll("REPOSITORYPATHSENTINEL", " "),
        candidate.replace(/\s*REPOSITORYPATHSENTINEL\s*/gu, "")
      ]
    : [candidate]
  return [...new Set(variants.flatMap((variant) => [
    ...variant.split(/(?:[.!?;\u3002\uff01\uff1f]+|\n+)/giu),
    ...variant.split(/(?:[.!?;\u3002\uff01\uff1f]+|\n+|\b(?:anyway|but|despite|even +though|however|whereas|although|yet|while|so)\b)/giu)
  ]
    .map((clause) => clause
      .toLowerCase()
      .replace(/[\p{P}\p{S}]+/gu, " ")
      .replace(/\s+/gu, " ")
      .trim())
    .filter((clause) => clause.length > 0)))]
}

const semanticTokenIndexes = (tokens, predicate) => tokens
  .map((token, index) => predicate(token) ? index : -1)
  .filter((index) => index >= 0)

const semanticHasRoot = (token, roots) => roots.some((root) => token === root || (root.length >= 4 && token.startsWith(root)))

const semanticHasAnyRoot = (tokens, roots) => tokens.some((token) => semanticHasRoot(token, roots))

const semanticHasPhrase = (clause, phrase) => new RegExp(
  `(?:^| )${phrase.trim().split(/\s+/u).join(" +")}(?: |$)`,
  "u"
).test(clause)

const semanticIndexIsNegated = (tokens, index) => {
  const before = tokens.slice(Math.max(0, index - 3), index).join(" ")
  const after = tokens.slice(index + 1, index + 5).join(" ")
  return /(?:^| )(?:not|never|cannot|without|lacks?|lacking|missing|neither|nor|prohibited|unsafe|ineligible|separate)(?: |$)/u.test(before) ||
    /(?:^| )(?:no|zero)(?: |$)/u.test(before) ||
    /(?:^| )(?:future|must|need|needs|needed|provisional|required|requires|requiring|should)(?: |$)/u.test(before) ||
    /^(?:(?:is|are|was|were|has|have|had|remain|remains|remained) )?(?:no|not|never|none|null|false|absent|missing|blocked|pending|provisional|required|requires|unresolved|undecided|zero)(?: |$)/u.test(after) ||
    /(?:^| )(?:until|before|unless)(?: |$)/u.test(before)
}

const semanticHasAffirmativeRoot = (tokens, roots) => semanticTokenIndexes(
  tokens,
  (token) => semanticHasRoot(token, roots)
).some((index) => !semanticIndexIsNegated(tokens, index))

const semanticIsStructuralLabel = (tokens) => semanticHasAnyRoot(tokens, [
  "artifact",
  "boundary",
  "contract",
  "coordinate",
  "dependency",
  "evidence",
  "field",
  "identity",
  "identifier",
  "interface",
  "ledger",
  "metadata",
  "path",
  "record",
  "requirement",
  "rule",
  "schema",
  "slot",
  "status",
  "table",
  "workflow"
])

const semanticHasAssertionConnector = (tokens) => semanticHasAnyRoot(tokens, [
  "be",
  "became",
  "become",
  "carry",
  "exist",
  "exists",
  "face",
  "gain",
  "gave",
  "get",
  "given",
  "got",
  "grant",
  "had",
  "has",
  "have",
  "hold",
  "issue",
  "obtain",
  "receive",
  "secure",
  "stand",
  "was",
  "were",
  "went"
])

const closedStructuralSemanticEnums = Object.freeze({
  reviewKind: new Set(requiredCodexReviewTasks.map((task) => task.reviewKind)),
  disposition: new Set(["no-blocking-findings-on-exact-subject"]),
  consensus: new Set(["root-and-independent-rereviews-agree"]),
  dissent: new Set(["none-recorded-for-exact-subject"])
})

const isClosedStructuralSemanticEnum = (path, value) => {
  const field = path.at(-1)
  const exactLedgerField = path.length === 3 && path[0] === "codexReviewLedger" && /^\d+$/u.test(path[1])
  return exactLedgerField && typeof field === "string" && own(closedStructuralSemanticEnums, field) &&
    closedStructuralSemanticEnums[field].has(value)
}

const identifierProjection = (source) => decodePercentRuns(source)
  .normalize("NFKC")
  .normalize("NFKD")
  .replace(/[\p{M}\p{Cf}]/gu, "")
  .toLowerCase()
  .replace(/[\p{P}\p{S}\s]+/gu, "")

const invalidatedReviewIdentifiers = Object.freeze([
  ...invalidatedReviewProvenanceRegistry.subjectShas,
  ...invalidatedReviewProvenanceRegistry.packetBlobShas,
  ...invalidatedReviewProvenanceRegistry.taskIds,
  ...invalidatedReviewProvenanceRegistry.reviewOccurrenceIds
])

const validateNoInvalidatedReviewIdentifiers = (source, label) => {
  const projected = identifierProjection(source)
  for (const identifier of invalidatedReviewIdentifiers) {
    assert(
      !projected.includes(identifierProjection(identifier)),
      `${label} contains invalidated review provenance identifier ${identifier}`
    )
  }
}

const validatorOutsideInvalidatedProvenanceRegistry = (source) => {
  const markerPrefix = "/* PLAN_009_INVALIDATED_REVIEW_PROVENANCE_"
  const startMarker = `${markerPrefix}START */`
  const endMarker = `${markerPrefix}END */`
  const start = source.indexOf(startMarker)
  const end = source.indexOf(endMarker)
  assert(start >= 0 && start === source.lastIndexOf(startMarker), "validator must contain exactly one invalidated-review provenance start marker")
  assert(end > start && end === source.lastIndexOf(endMarker), "validator must contain exactly one invalidated-review provenance end marker")
  assert(
    createHash("sha256").update(JSON.stringify(invalidatedReviewProvenanceRegistry), "utf8").digest("hex") === invalidatedReviewProvenanceRegistrySha256,
    "immutable invalidated-review provenance registry digest differs"
  )
  const afterEnd = end + endMarker.length
  const sourceBlock = source.slice(start, afterEnd)
  assert(
    createHash("sha256").update(sourceBlock, "utf8").digest("hex") === invalidatedReviewProvenanceRegistrySourceSha256,
    "immutable invalidated-review provenance registry source bytes differ"
  )
  return `${source.slice(0, start)}${source.slice(afterEnd)}`
}

const validateNoFreeFormSemanticClaims = (source, label, { project = true } = {}) => {
  if (isValidatedRepositoryPathLiteral(source.trim())) return
  for (const clause of semanticClaimClauses(source, { project })) {
    const tokens = clause.split(" ")
    const releaseActor = semanticHasAnyRoot(tokens, ["operator", "release", "team", "we"])
    const releaseTarget = tokens.some((token) => /^(?:apps?|applications?|builds?|candidates?|deployments?|drafts?|implementation|launch|migration|packets?|plans?|products?|production|releases?|rollouts?|shipping|sites?|traffic|versions?|websites?)$/u.test(token))
    const releaseObject = semanticHasAnyRoot(tokens, ["gate", "service", "traffic", "window"])
    const releaseContext = releaseActor || releaseTarget || releaseObject
    const permissionNounIndexes = semanticTokenIndexes(
      tokens,
      (token) => /^(?:approval|authority|authorization|blessing|certification|clearance|permission|signoff|waiver)$/u.test(token)
    )
    for (const phrase of [["green", "light"], ["go", "ahead"], ["sign", "off"], ["the", "nod"], ["thumbs", "up"], ["all", "clear"]]) {
      const index = tokens.findIndex((token, tokenIndex) => token === phrase[0] && tokens[tokenIndex + 1] === phrase[1])
      if (index >= 0) permissionNounIndexes.push(index)
    }
    const idiomaticPermission = semanticHasPhrase(clause, "green light") || semanticHasPhrase(clause, "go ahead") ||
      semanticHasPhrase(clause, "sign off") || semanticHasPhrase(clause, "the nod") ||
      semanticHasPhrase(clause, "thumbs up") || semanticHasPhrase(clause, "all clear")
    const affirmativePermissionNoun = permissionNounIndexes.some((index) => !semanticIndexIsNegated(tokens, index))
    const affirmativeReleaseStatus = semanticTokenIndexes(
      tokens,
      (token) => /^(?:allow(?:ed|s|ing)?|approv(?:e|ed|es|ing)|authoris(?:e|ed|es|ing)|authoriz(?:e|ed|es|ing)|bless(?:ed|es|ing)?|certif(?:y|ied|ies|ying)|clear(?:ed|s|ing)?|deployable|eligible|empower(?:ed|s|ing)?|endors(?:e|ed|es|ing)|grant(?:ed|s|ing)?|greenlit|okay(?:ed|s|ing)?|okayed|permit(?:ted|s|ting)?|publishable|ratif(?:y|ied|ies|ying)|ready|sanction(?:ed|s|ing)?|shippable|unblocked|unobstructed)$/u.test(token)
    ).some((index) => !semanticIndexIsNegated(tokens, index))
    const connectorBackedPermission = affirmativePermissionNoun && permissionNounIndexes.some((index) =>
      !semanticIndexIsNegated(tokens, index) && semanticHasAssertionConnector(tokens.slice(Math.max(0, index - 3), index + 4))
    )
    const readinessOutcome = /(?:^| )(?:no(?: +\w+){0,2} +(?:barriers?|blockers?|impediments?|objections?|obstacles?|obstructions?)|zero +(?:barriers?|blockers?|impediments?|obstacles?)|all +(?:\w+ +){0,2}(?:barriers?|blockers?|impediments?|obstacles?|restrictions?)(?: +\w+){0,3} +(?:gone|lifted|removed|resolved|cleared)|nothing +blocks?|nothing +impedes?|nothing +stands?(?: +\w+){0,4} +between(?: +\w+){0,4} +(?:build|candidate|deployment|production|release|rollout)|all +set|everything +is +set +for(?: +the)? +(?:production +)?rollout|set +for +(?:production +)?rollout|good +to +go|(?:production|release|deployment|rollout|launch)(?: +\w+){0,2} +(?:is|was|stands?) +(?:a +)?go|(?:production|release|deployment|rollout|launch)(?: +\w+){0,3} +(?!not +authoriz)(?:not|no +longer) +(?:blocked|denied|forbidden|ineligible|prevented|prohibited|unauthorized|unapproved|uncleared|unready)|(?:release|deployment|production|rollout|launch) +gates?(?: +\w+){0,3} +(?!not )(?:open|pass\w*|clear\w*|green|satisf\w*)|(?:required|user|production|release) +gates?(?: +\w+){0,2} +no +longer +blocks?(?: +\w+){0,3} +(?:deployment|production|release|rollout)|(?:deployment|release|rollout)(?: +\w+){0,3} +(?:objections? +(?:are |were )?withdrawn|holds? +(?:are |were )?lifted|restrictions? +(?:are |were )?gone)|(?:deployment|release|rollout) +is +anything +but +blocked|there +are +no +obstructions? +to +(?:deployment|launch|release|rollout))(?: |$)/u.test(clause)
    const invertedReleaseProhibition = /(?:^| )(?:nothing +(?:bars?|blocks?|forbids?|prevents?|prohibits?|restricts?|stops?)|no +(?:policy|restriction|rule)(?: +\w+){0,3} +(?:bars?|blocks?|forbids?|prevents?|prohibits?|restricts?|stops?))(?: +\w+){0,4} +(?:deployment|launch|production|release|rollout|shipping)(?: |$)/u.test(clause) ||
      /(?:^| )(?:deployment|launch|production|release|rollout)(?: +\w+){0,3} +(?:lacks? +no|is +not +lacking) +(?:approval|authority|authorization|clearance|permission)(?: |$)/u.test(clause)
    const releaseConstraintRemoved = /(?:^| )(?:the +)?(?:embargo|gate|hold|restriction) +(?:on|to|for) +(?:deployment|launch|production|release|rollout)(?: +\w+){0,2} +(?:ended|expired|is +open|was +opened|has +ended|has +expired|has +been +lifted|has +been +removed|lifted|opened|removed|withdrawn)(?: |$)/u.test(clause) ||
      /(?:^| )(?:deployment|launch|production|release|rollout)(?: +\w+){0,2} +(?:embargo(?:es)?|gates?|holds?|objections?|restrictions?)(?: +\w+){0,2} +(?:ended|expired|is +open|are +open|was +opened|were +opened|has +ended|have +ended|has +expired|have +expired|has +been +lifted|have +been +lifted|has +been +removed|have +been +removed|gone|lifted|opened|removed|withdrawn)(?: |$)/u.test(clause) ||
      /(?:^| )(?:deployment|launch|production|release|rollout) +is +anything +but +blocked(?: |$)/u.test(clause) ||
      /(?:^| )(?:deployment|launch|production|release|rollout)(?: +\w+){0,2} +is +free +of +(?:barriers?|blockers?|obstructions?)(?: |$)/u.test(clause) ||
      /(?:^| )(?:the +)?door +to +(?:deployment|launch|production|release|rollout) +is +open(?: |$)/u.test(clause) ||
      /(?:^| )(?:the +)?(?:deployment|launch|production|release|rollout) +window +(?:is|was|stands?) +open(?: |$)/u.test(clause)
    const releaseActionIndexes = semanticTokenIndexes(tokens, (token) => /^(?:began|begin|begins|beginning|begun|ship(?:ped|s|ping)?|launch(?:ed|es|ing)?|deploy(?:ed|s|ing)?|release|released|releasing|publish(?:ed|es|ing)?|promot(?:e|ed|es|ing)|proceed(?:ed|s|ing)?|continu(?:e|ed|es|ing)|resum(?:e|ed|es|ing)|commenc(?:e|ed|es|ing)|activat(?:e|ed|es|ing)|implement(?:ed|s|ing)?|start(?:ed|s|ing)?)$/u.test(token))
    const explicitFreeToReleaseAction = /(?:^| )(?:(?:am|are|is|was|were) +(?:at +liberty|empowered|free)|(?:had|has|have) +liberty) +to +(?:begin|deploy|go +live|implement|launch|proceed|publish|rollout|ship|start)(?: |$)/u.test(clause)
    const explicitReleaseImperative = /^(?:blocked +)?(?:(?:please +)?(?:deploy|greenlight|publish|release|ship) +(?:away|it|this|that|the|a|an|build|candidate|deployment|production|release|rollout|site|version|website)|(?:activate|begin|commence|continue|resume|start) +(?:deployment|implementation|launch|production|release|rollout)|put +(?:the +)?(?:site|website|build|candidate|production) +online|promote +(?:this +|the +)?build|cut +over +to +(?:the +)?candidate|route +(?:the +)?traffic +to +production|send +(?:the +)?(?:site|website|build|candidate) +live|push +(?:the +)?(?:build|candidate|site|website) +to +production|take +(?:the +)?(?:site|website|build|candidate) +live|turn +production +on|(?:roll +out|rollout) +(?:the +)?(?:build|candidate|site|website))(?: |$)/u.test(clause)
    const releaseAuthorizationState = affirmativeReleaseStatus || connectorBackedPermission || idiomaticPermission || readinessOutcome
    const releaseAction = releaseActionIndexes.some((index) => {
      if (semanticIndexIsNegated(tokens, index)) return false
      const token = tokens[index]
      const inflected = /(?:ed|es|ing|s)$/u.test(token) && !/^(?:proceed|ship)$/u.test(token)
      const before = tokens.slice(Math.max(0, index - 4), index)
      const inherentlyReleaseAction = /^(?:deploy|launch|publish|release|ship)$/u.test(token)
      const imperative = index === 0 && (
        (tokens.length === 1 && inherentlyReleaseAction) ||
        (["immediately", "now", "the", "this", "that", "to", "with"].includes(tokens[index + 1]) && inherentlyReleaseAction)
      )
      const statusInfinitive = before.includes("to") && affirmativeReleaseStatus
      return inflected || imperative || statusInfinitive || before.some((entry) => ["can", "could", "may", "will"].includes(entry))
    }) || /(?:^| )(?:(?:can|may|could|will) +(?:\w+ +){0,3})?(?:go +live|put(?: +the)?(?: +\w+){0,3} +into +production|enter +service|be +turned +on)(?: |$)/u.test(clause) ||
      /(?:^| )(?:applications?|products?|sites?|websites?)(?: +\w+){0,2} +(?:can|could|may|will) +(?:enter +service|be +launched|be +published)(?: |$)/u.test(clause) ||
      /(?:^| )production(?: +\w+){0,2} +(?:can|could|may|will) +be +turned +on(?: |$)/u.test(clause) ||
      explicitFreeToReleaseAction ||
      /(?:^| )(?:moved|moving|move) +forward(?: |$)/u.test(clause) ||
      /(?:^| )(?:became|become|goes|is|are|was|were|went) +live(?: |$)/u.test(clause)
    const releaseActionNegated = /(?:^| )(?:cannot|not|never|must +not|may +not|will +not|should +not|do +not|does +not|did +not)(?: +\w+){0,4} +(?:go +live|beg\w*|start\w*|ship\w*|launch\w*|deploy\w*|publish\w*|proceed\w*|continu\w*|resum\w*|commenc\w*|activat\w*|move +forward|into +production)(?: |$)/u.test(clause)
    const affirmativeReleaseCompletion = releaseContext && (
      /(?:^| )(?:applications?|builds?|candidates?|deployments?|implementation|launch|production|releases?|rollouts?|sites?|traffic|versions?|websites?)(?: +\w+){0,3} +(?:is|are|was|were|has +been|have +been)? *(?:complete|completed|done|finished|happened|imminent|occurred|published|releasable|succeeded|successful|underway)(?: |$)/u.test(clause) ||
      /(?:^| )(?:applications?|builds?|candidates?|deployments?|implementation|launch|production|releases?|rollouts?|sites?|traffic|versions?|websites?)(?: +\w+){0,2} +(?:began|begun|completed|finished|happened|occurred|published|started|succeeded)(?: |$)/u.test(clause) ||
      /(?:^| )(?:traffic|production +traffic)(?: +\w+){0,2} +(?:cut +over|went +live)(?: |$)/u.test(clause) ||
      /(?:^| )(?:applications?|builds?|candidates?|products?|sites?|versions?|websites?)(?: +\w+){0,3} +(?:is|are|was|were)? *(?:fit|ready) +to +ship(?: |$)/u.test(clause) ||
      /(?:^| )(?:applications?|builds?|candidates?|products?|sites?|versions?|websites?)(?: +\w+){0,3} +(?:is|are|was|were)? *fit +for +(?:launch|production)(?: |$)/u.test(clause) ||
      /(?:^| )(?:applications?|builds?|candidates?|products?|sites?|versions?|websites?)(?: +\w+){0,3} +(?:is|are|was|were)? *publishable(?: |$)/u.test(clause) ||
      /(?:^| )(?:builds?|candidates?|deployments?|launch|releases?|rollouts?|sites?)(?: +\w+){0,3} +passed +(?:all +)?(?:checks?|gates?)(?: |$)/u.test(clause)
    ) && !releaseActionNegated && !/(?:^| )(?:must|need|needs|needed|required|requires|requiring|should|future)(?: |$)/u.test(clause)
    const affirmativeReleaseConsent = (
      /(?:^| )(?:consent|authority|permission)(?: +\w+){0,3} +to +(?:deploy|launch|release|rollout|ship)(?: +\w+){0,3} +(?:gave|given|granted|received|was|were)(?: |$)/u.test(clause) ||
      /(?:^| )(?:deployments?|launch|production|releases?|rollouts?)(?: +\w+){0,3} +(?:has|have|received|was +given|were +given) +(?:consent|authority|permission)(?: |$)/u.test(clause)
    ) && !/(?:^| )(?:no|not|never|without|pending|provisional)(?: |$)/u.test(clause)
    const affirmativeReleaseProgress = (
      /(?:^| )(?:can|could|may|will|we) *(?:can|could|may|will)? *(?:move +ahead|move +forward|proceed)(?: +\w+){0,4} +(?:deployment|launch|production|release|rollout)(?: |$)/u.test(clause) ||
      /(?:^| )there +is +nothing(?: +\w+){0,3} +(?:blocking|preventing|stopping)(?: +\w+){0,3} +(?:deployment|launch|production|release|rollout)(?: |$)/u.test(clause)
    ) && !releaseActionNegated
    const affirmativeReleasePermissionReversal = /(?:^| )(?:deployment|launch|production|release|rollout)(?: +\w+){0,3} +(?:does +not +lack|is +not +without) +(?:approval|authority|authorization|clearance|permission)(?: |$)/u.test(clause) ||
      /(?:^| )there +is +no +reason +not +to +(?:deploy|launch|publish|release|ship)(?: |$)/u.test(clause) ||
      /(?:^| )(?:deployment|release|rollout)(?: +\w+){0,3} +(?:waiver +(?:was |is )?(?:issued|received)|received +a +waiver)(?: |$)/u.test(clause) ||
      /(?:^| )no +(?:further|outstanding|remaining|required)? *approval(?: +\w+){0,3} +(?:is +)?needed +for +(?:deployment|launch|production|release|rollout)(?: |$)/u.test(clause)
    const affirmativeReleaseOperationalState = /(?:^| )(?:deployment|launch|production|release|rollout|site|website)(?: +\w+){0,3} +(?:is|are|was|were|remains?)? *(?:happening|in +progress|ongoing|online|serving +traffic)(?: |$)/u.test(clause) ||
      /(?:^| )(?:the +)?(?:build|candidate)(?: +\w+){0,3} +(?:meets?|satisfies?) +(?:the +)?launch +criteria(?: |$)/u.test(clause) ||
      /(?:^| )(?:traffic|production +traffic)(?: +\w+){0,3} +(?:is|was|has +been)? *(?:cut +over|routed|switched) +to +production(?: |$)/u.test(clause) ||
      /(?:^| )(?:deployment|launch|release)(?: +\w+){0,2} +can +happen(?: |$)/u.test(clause) ||
      /(?:^| )(?:deployment|launch|release)(?: +\w+){0,2} +(?:entered +production|kicked +off|passed +muster|went +out)(?: |$)/u.test(clause)
    const contrastReleaseAction = /(?:^| )(?:no +(?:release +)?approval|not +approved)(?: +\w+){0,4} +(?:deploy|launch|publish|release|ship)(?: +anyway| +now)?(?: |$)/u.test(clause)
    const qualifiedReleaseStatus = /(?:^| )(?:deployment|launch|production|release|rollout|site|website)(?: +\w+){0,3} +(?:is|are|was|were|became|becomes?|remains?) +(?:enabled|public|qualified|unrestricted)(?: |$)/u.test(clause) ||
      /(?:^| )(?:enabled|public|qualified|unrestricted) +(?:deployment|launch|production|release|rollout)(?: |$)/u.test(clause)
    const standaloneAffirmativeReleaseStatus = semanticTokenIndexes(
      tokens,
      (token) => /^(?:approv(?:e|ed|es|ing)|authoris(?:e|ed|es|ing)|authoriz(?:e|ed|es|ing)|bless(?:ed|es|ing)?|clear(?:ed|s|ing)?|greenlit|permit(?:ted|s|ting)?|sanction(?:ed|s|ing)?)$/u.test(token)
    ).some((index) => !semanticIndexIsNegated(tokens, index))
    const positiveReleaseFact = (
      releaseContext && (releaseAuthorizationState || (releaseAction && !releaseActionNegated))
    ) || contrastReleaseAction || invertedReleaseProhibition || releaseConstraintRemoved || affirmativeReleaseCompletion || affirmativeReleaseConsent || affirmativeReleaseProgress || affirmativeReleasePermissionReversal || qualifiedReleaseStatus ||
      affirmativeReleaseOperationalState || (explicitReleaseImperative && !releaseActionNegated) ||
      explicitFreeToReleaseAction || (affirmativeReleaseStatus && releaseAction && !releaseActionNegated) ||
      (tokens.length <= 4 && (standaloneAffirmativeReleaseStatus || idiomaticPermission || releaseAction) &&
        !/(?:^| )(?:no|not|never|without|blocked|pending|provisional|false)(?: |$)/u.test(clause))

    assert(
      !positiveReleaseFact,
      `${label} contains affirmative production or implementation authorization through a free-form authorization or release-status claim: ${JSON.stringify(clause)}`
    )

    const nonCandidateHumanActor = semanticHasAnyRoot(tokens, [
      "cohort",
      "community",
      "customer",
      "folk",
      "human",
      "individual",
      "applicant",
      "interviewee",
      "learner",
      "panel",
      "participant",
      "people",
      "person",
      "reader",
      "resident",
      "respondent",
      "student",
      "tester",
      "user",
      "volunteer"
    ])
    const strongStudyContext = semanticHasAnyRoot(tokens, [
      "evaluation",
      "interview",
      "journey",
      "moderated",
      "research",
      "study",
      "test",
      "trial",
      "usability",
      "validat"
    ])
    const studyContext = strongStudyContext || semanticHasAnyRoot(tokens, ["round", "session"]) || semanticHasPhrase(clause, "focus group")
    const humanArtifactContext = semanticHasAnyRoot(tokens, ["interface", "journey", "navigation", "prototype", "screen", "site", "website"])
    const humanActor = nonCandidateHumanActor || semanticHasPhrase(clause, "test subject") || semanticHasPhrase(clause, "test subjects") || (
      semanticHasAnyRoot(tokens, ["candidate"]) && (studyContext || humanArtifactContext)
    )
    const standaloneHumanStudyContext = semanticHasAnyRoot(tokens, ["interview", "moderated", "research", "study", "trial", "usability"]) ||
      semanticHasPhrase(clause, "focus group") ||
      /(?:^| )(?:human|learner|participant|user) +(?!interface\b)(?:evaluation|testing|validation)(?: |$)/u.test(clause)
    const humanEvidenceNoun = semanticHasAnyRoot(tokens, [
      "feedback",
      "evidence",
      "finding",
      "comment",
      "commentary",
      "insight",
      "input",
      "note",
      "observation",
      "opinion",
      "outcome",
      "preference",
      "reaction",
      "recommendation",
      "remark",
      "response",
      "result",
      "sentiment",
      "suggestion",
      "verdict",
      "view",
      "voice"
    ])
    const humanResultVerbIndexes = semanticTokenIndexes(tokens, (token) => /^(?:advis(?:e|ed|es|ing)|answer(?:ed|s|ing)?|attend(?:ed|s|ing)?|collect(?:ed|s|ing)?|complet(?:e|ed|es|ing)|conclud(?:e|ed|es|ing)|conduct(?:ed|s|ing)?|consult(?:ed|s|ing)?|contribut(?:e|ed|es|ing)|conven(?:e|ed|es|ing)|driv(?:e|en|es|ing)|drove|evaluat(?:e|ed|es|ing)|exist(?:ed|s|ing)?|favor(?:ed|s|ing)?|finish(?:ed|es|ing)?|gather(?:ed|s|ing)?|gave|give|gives|giving|guid(?:e|ed|es|ing)|happen(?:ed|s|ing)?|held|hold|holds|holding|incorporat(?:e|ed|es|ing)|inform(?:ed|s|ing)?|influenc(?:e|ed|es|ing)|interview(?:ed|s|ing)?|involv(?:e|ed|es|ing)|join(?:ed|s|ing)?|listen(?:ed|s|ing)?|met|meet|meets|meeting|observ(?:e|ed|es|ing)|occur(?:red|s|ring)?|participat(?:e|ed|es|ing)|pass(?:ed|es|ing)|perform(?:ed|s|ing)?|produc(?:e|ed|es|ing)|provid(?:e|ed|es|ing)|ran|rat(?:e|ed|es|ing)|receiv(?:e|ed|es|ing)|record(?:ed|s|ing)?|recruit(?:ed|s|ing)?|reflect(?:ed|s|ing)?|report(?:ed|s|ing)?|research(?:ed|es|ing)|respond(?:ed|s|ing)?|return(?:ed|s|ing)?|review(?:ed|s|ing)|run|running|sampl(?:e|ed|es|ing)|saw|see|seen|shadow(?:ed|s|ing)?|shap(?:e|ed|es|ing)|shar(?:e|ed|es|ing)|spoke|speak|speaks|speaking|stud(?:ied|ies|ying)|suppl(?:y|ied|ies|ying)|support(?:ed|s|ing)?|survey(?:ed|s|ing)?|talk(?:ed|s|ing)?|test(?:ed|s)|tr(?:ied|ies|ying)|us(?:e|ed|es|ing)|validat(?:e|ed|es|ing)|watch(?:ed|es|ing)?|witness(?:ed|es|ing)?|yield(?:ed|s|ing)?)$/u.test(token))
    const humanResultVerb = humanResultVerbIndexes.some((index) => !semanticIndexIsNegated(tokens, index)) ||
      semanticHasPhrase(clause, "took place") || semanticHasPhrase(clause, "take place") || semanticHasPhrase(clause, "heard from") || semanticHasPhrase(clause, "weighed in")
    const directHumanObservation = semanticTokenIndexes(
      tokens,
      (token) => /^(?:advis(?:e|ed|es|ing)|answer(?:ed|s|ing)?|ask(?:ed|s|ing)?|attend(?:ed|s|ing)?|consult(?:ed|s|ing)?|evaluat(?:e|ed|es|ing)|interview(?:ed|s|ing)?|join(?:ed|s|ing)?|listen(?:ed|s|ing)?|observ(?:e|ed|es|ing)|participat(?:e|ed|es|ing)|poll(?:ed|s|ing)?|rat(?:e|ed|es|ing)|recruit(?:ed|s|ing)?|respond(?:ed|s|ing)?|sampl(?:e|ed|es|ing)|saw|seen|shadow(?:ed|s|ing)?|spoke|speak|speaks|speaking|stud(?:ied|ies|ying)|survey(?:ed|s|ing)?|talk(?:ed|s|ing)?|test(?:ed|s)|tried|used|validat(?:e|ed|es|ing)|watch(?:ed|es|ing)?|witness(?:ed|es|ing)?)$/u.test(token)
    ).some((index) => !semanticIndexIsNegated(tokens, index)) || semanticHasPhrase(clause, "heard from") || semanticHasPhrase(clause, "weighed in") || semanticHasPhrase(clause, "spoke with") || semanticHasPhrase(clause, "spoke to") || semanticHasPhrase(clause, "met with") || semanticHasPhrase(clause, "talked to") || semanticHasPhrase(clause, "listened to")
    const directHumanInteraction = humanActor && (
      /(?:^| )we +(?:heard|listened +to|met(?: +with)?|saw|spoke +to|spoke +with|talked +to|watched|witnessed)(?: +\w+){0,4} +(?:cohorts?|customers?|humans?|learners?|panels?|participants?|people|persons?|readers?|respondents?|students?|testers?|users?|volunteers?)(?: |$)/u.test(clause) ||
      /(?:^| )(?:cohorts?|community +members?|customers?|folks?|humans?|individuals?|interviewees?|learners?|panels?|participants?|people|persons?|readers?|residents?|respondents?|students?|test +subjects?|testers?|users?|volunteers?)(?: +\w+){0,3} +(?:answered|asked|attended|evaluated|joined|listened|met|participated|polled|reacted|responded|reviewed|spoke|suggested|tested|tried|used|were +heard|were +observed|were +watched|were +witnessed)(?: |$)/u.test(clause) ||
      /(?:^| )(?:prototype|screen|site|interface|journey)(?: +\w+){0,4} +(?:was|were|has +been|have +been) +(?:evaluated|reviewed|tested|tried|used)(?: +\w+){0,3} +by +(?:applicants?|candidates?|cohorts?|community +members?|folks?|humans?|individuals?|interviewees?|learners?|panels?|participants?|people|persons?|residents?|respondents?|students?|testers?|users?)(?: |$)/u.test(clause)
    )
    const humanExperienceOutcome = humanActor && humanArtifactContext && (
      /(?:^| )(?:applicants?|candidates?|learners?|participants?|people|students?|testers?|users?)(?: +\w+){0,4} +(?:found|liked|loved|preferred|rated|reacted|responded)(?: +\w+){0,5} +(?:easy|helpful|positively|positive|simple|well)(?: |$)/u.test(clause) ||
      /(?:^| )(?:applications?|interfaces?|journeys?|navigation|prototypes?|screens?|sites?|websites?)(?: +\w+){0,4} +tested +(?:positively|well)(?: +\w+){0,3} +with +(?:applicants?|candidates?|learners?|participants?|people|students?|testers?|users?)(?: |$)/u.test(clause) ||
      /(?:^| )(?:applicants?|candidates?|learners?|participants?|people|students?|testers?|users?)(?: +\w+){0,3} +reacted +positively +to(?: +the)? +(?:interface|journey|navigation|prototype|screen|site|website)(?: |$)/u.test(clause)
    )
    const studyOccurrenceVerb = semanticTokenIndexes(
      tokens,
      (token) => /^(?:began|complet(?:e|ed|es|ing)|conclud(?:e|ed|es|ing)|conduct(?:ed|s|ing)?|conven(?:e|ed|es|ing)|finish(?:ed|es|ing)?|happen(?:ed|s|ing)?|held|met|occur(?:red|s|ring)?|pass(?:ed|es|ing)|perform(?:ed|s|ing)?|ran|run|running)$/u.test(token)
    ).some((index) => !semanticIndexIsNegated(tokens, index)) || semanticHasPhrase(clause, "took place") || semanticHasPhrase(clause, "take place")
    const releaseCandidateReference = /(?:^| )(?:a|an|one|the)(?: +\w+){0,2} +(?:build|implementation|production|release)(?: +\w+){0,2} +candidate(?: |$)/u.test(clause)
    const nonzeroHumanCount = humanActor && !releaseCandidateReference && /(?:^| )(?:[1-9]\d*|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|dozens?|scores?|several|multiple|many|a|an)(?: +\w+){0,2} +(?!nonhuman\b)(?:candidates?|cohorts?|community +members?|folks?|humans?|individuals?|interviewees?|learners?|panels?|participants?|people|persons?|residents?|respondents?|students?|test +subjects?|testers?|users?|volunteers?)(?: |$)/u.test(clause)
    const explicitNonzeroHumanCount = /(?:^| )(?:human +)?participant +count(?: +\w+){0,3} +(?:[1-9]\d*|one|two|three|four|five|six|seven|eight|nine|ten|several|multiple|many)(?: |$)/u.test(clause) ||
      /(?:^| )(?:participants?|learners?|users?|people|testers?|panelists?)(?: +\w+){0,2} +numbered +(?:[1-9]\d*|one|two|three|four|five|six|seven|eight|nine|ten|several|multiple|many)(?: |$)/u.test(clause) ||
      /(?:^| )(?:cohort|community|human|individual|interviewee|learner|panel|participant|people|person|resident|respondent|student|subject|tester|user|volunteer) +(?:count|total)(?: +\w+){0,3} +(?:[1-9]\d*|one|two|three|four|five|six|seven|eight|nine|ten|several|multiple|many)(?: |$)/u.test(clause)
    const explicitHumanMeeting = /^(?:the +)?(?:cohort|panel|participants?|learners?|users?|people|testers?) +(?:met|convened)$/u.test(clause)
    const coordinatedHumanClaim = /(?:^| )(?:and|or)(?: |$)/u.test(clause)
    const truthfulHumanNegative = /(?:^| )not +human +usability +tested$/u.test(clause) ||
      /^(?:no +human +evidence|no +participant +evidence|human +evidence(?: +is)? +none|participant +evidence(?: +is)? +none|human +participant +count(?: +is)? +zero|(?:human|user|participant)(?: +usability)? +research +(?:is|remains?) +out +of +scope)(?: +\w+){0,2}$/u.test(clause) ||
      (!coordinatedHumanClaim && /^(?:no|zero) +(?!release +candidate\b)(?:humans?|learners?|students?|testers?|respondents?|volunteers?|candidates?|participants?|users?|people|persons?|cohorts?|panels?)(?:$| +(?:completed|conducted|joined|participated +in|passed|performed|provided|tested)(?: +the)? +(?:human +|user +|usability +)?(?:evaluation|research|study|test|testing|trial))$/u.test(clause)) ||
      (!coordinatedHumanClaim && /^(?:the +)?(?:humans?|learners?|students?|testers?|respondents?|volunteers?|candidates?|participants?|users?|people|persons?|cohorts?|panels?)(?: +\w+){0,3} +(?:did +not|was +not|were +not|has +not|have +not|had +not|never)(?: +\w+){0,8}$/u.test(clause)) ||
      (!coordinatedHumanClaim && /^(?:the +)?(?:study|testing|research|validation|session)(?: +\w+){0,3} +(?:was +not|were +not|did +not|has +not|have +not|never)(?: +\w+){0,8}$/u.test(clause))
    const humanContribution = humanActor && (
      semanticHasPhrase(clause, "weighed in") || semanticHasPhrase(clause, "spoke with") ||
      humanResultVerbIndexes.some((index) =>
        !semanticIndexIsNegated(tokens, index) &&
        /^(?:driv|drove|guid|incorporat|inform|influenc|shap|spoke|speak)/u.test(tokens[index])
      )
    ) && semanticHasAnyRoot(tokens, ["choice", "decision", "design", "interface", "journey", "screen"])
    const humanDecisionContribution = humanActor && semanticTokenIndexes(
      tokens,
      (token) => /^(?:adopt(?:ed|s|ing)?|choos(?:e|es|ing)|chose|chosen|decid(?:e|ed|es|ing)|pick(?:ed|s|ing)?|prefer(?:red|s|ring)?|select(?:ed|s|ing)?|vot(?:e|ed|es|ing))$/u.test(token)
    ).some((index) => !semanticIndexIsNegated(tokens, index))
    const humanOccurrenceAction = humanActor && (
      semanticTokenIndexes(
        tokens,
        (token) => /^(?:ask(?:ed|s|ing)?|attend(?:ed|s|ing)?|conven(?:e|ed|es|ing)|evaluat(?:e|ed|es|ing)|join(?:ed|s|ing)?|observ(?:e|ed|es|ing)|participat(?:e|ed|es|ing)|poll(?:ed|s|ing)?|respond(?:ed|s|ing)?|spoke|test(?:ed|s|ing)?|tr(?:ied|ies|ying)|us(?:e|ed|es|ing))$/u.test(token)
      ).some((index) => !semanticIndexIsNegated(tokens, index)) ||
      semanticHasPhrase(clause, "took part")
    )
    const humanEvidenceSourced = /(?:^| )(?:comments?|commentary|feedback|findings?|input|insights?|notes?|observations?|opinions?|outcomes?|preferences?|reactions?|recommendations?|remarks?|responses?|results?|sentiment|suggestions?|views?)(?: +\w+){0,4} +(?:came|originated|was +received|were +received)(?: +\w+){0,2} +from +(?:the +)?(?:cohorts?|community +members?|customers?|humans?|individuals?|interviewees?|learners?|panels?|participants?|people|persons?|residents?|respondents?|students?|testers?|users?|volunteers?)(?: |$)/u.test(clause)
    const invertedHumanNegative = /(?:^| )(?:cannot +be +said +to +be|is +not|was +not|are +not|were +not) +absent(?: |$)/u.test(clause) ||
      /(?:^| )(?:untrue|false) +that +no +human +evidence(?: |$)/u.test(clause) ||
      /(?:^| )(?:participants?|people|learners?|users?|testers?)(?: +\w+){0,3} +(?:were|was) +not +unobserved(?: |$)/u.test(clause) ||
      /(?:^| )(?:participants?|people|learners?|users?|testers?)(?: +\w+){0,3} +did +not +(?:go|remain) +untested(?: |$)/u.test(clause) ||
      /(?:^| )no +(?:participants?|people|learners?|users?|testers?)(?: +\w+){0,3} +(?:were|was) +left +untested(?: |$)/u.test(clause)
    const reviewerTypeUserReference = /(?:^| )(?:reviewer +of +(?:github +)?type +user|reviewer +whose +(?:github +)?type +is +user|user +reviewer|user +review +(?:boundary|condition|gate|requirement|rule))(?: |$)/u.test(clause)
    const terseHumanEvidence = humanActor && humanEvidenceNoun && tokens.length <= 3
    const standaloneHumanEvidence = standaloneHumanStudyContext && humanEvidenceNoun && humanResultVerb && !truthfulHumanNegative
    const positiveHumanFact = invertedHumanNegative || (!truthfulHumanNegative && !reviewerTypeUserReference && (
      nonzeroHumanCount || explicitNonzeroHumanCount || explicitHumanMeeting ||
      (humanActor && studyContext) ||
      terseHumanEvidence ||
      (humanActor && directHumanObservation) ||
      directHumanInteraction ||
      humanExperienceOutcome ||
      humanContribution ||
      humanDecisionContribution ||
      humanOccurrenceAction ||
      humanEvidenceSourced ||
      (humanActor && humanResultVerb && (humanEvidenceNoun || studyContext)) ||
      (standaloneHumanStudyContext && studyOccurrenceVerb) ||
      standaloneHumanEvidence
    ))

    assert(
      !positiveHumanFact,
      `${label} contains nonzero human usability evidence, claims a human usability test, or contains nonzero participant results, a human-study occurrence/result, human observation, or a nonzero participant count through free-form text: ${JSON.stringify(clause)}`
    )

    const decisionContext = semanticHasAnyRoot(tokens, [
      "archetype",
      "candidate",
      "choice",
      "committee",
      "decision",
      "direction",
      "draft",
      "migration",
      "option",
      "packet",
      "panel",
      "plan",
      "proposal",
      "recommendation",
      "selection",
      "selector",
      "territory",
      "variant",
      "winner"
    ])
    const activeDecisionResult = semanticTokenIndexes(
      tokens,
      (token) => /^(?:adopt(?:ed|s|ing)?|advanc(?:e|ed|es|ing)|agree(?:d|s|ing)?|align(?:ed|s|ing)?|backed|backs|backing|beat|beats|beaten|broke|carried|choos(?:e|es|ing)|chose|chosen|coalesc(?:e|ed|es|ing)|converg(?:e|ed|es|ing)|decid(?:e|ed|es|ing)|declar(?:e|ed|es|ing)|emerg(?:e|ed|es|ing)|endors(?:e|ed|es|ing)|favor(?:ed|s|ing)?|greenlit|locked|made|make|makes|making|opt(?:ed|s|ing)?|pick(?:ed|s|ing)?|prefer(?:red|s|ring)?|prevail(?:ed|s|ing)?|ratif(?:y|ied|ies|ying)|recommend(?:ed|s|ing)?|resolv(?:e|ed|es|ing)|select(?:ed|s|ing)?|settle(?:d|s|ing)?|support(?:ed|s|ing)?|triumph(?:ed|s|ing)?|vot(?:e|ed|es|ing)|win|wins|winning|won)$/u.test(token)
    ).some((index) => !semanticIndexIsNegated(tokens, index)) || semanticHasPhrase(clause, "green light") || semanticHasPhrase(clause, "go ahead") || semanticHasPhrase(clause, "the nod") || semanticHasPhrase(clause, "settled on") || semanticHasPhrase(clause, "went with") || semanticHasPhrase(clause, "went for") || semanticHasPhrase(clause, "landed on")
    const decisionNounResultIndexes = semanticTokenIndexes(
      tokens,
      (token) => /^(?:accept(?:ance|ed)?|agreement|approval|blessing|choice|consensus|decision|endorsement|outcome|permission|recommendation|selection|verdict|vote|winner)$/u.test(token)
    )
    const passiveDecisionResult = decisionNounResultIndexes.some((index) => {
      if (semanticIndexIsNegated(tokens, index)) return false
      const nearby = tokens.slice(Math.max(0, index - 2), index + 3)
      const localConnector = semanticHasAssertionConnector(nearby)
      const actorBeforeAccepted = tokens[index] === "accepted" &&
        /^(?:candidates?|decisions?|drafts?|migrations?|options?|packets?|panels?|plans?|proposals?|reviews?|variants?)$/u.test(tokens[index - 1] ?? "")
      return localConnector || actorBeforeAccepted
    })
    const invertedPendingDecision = /(?:^| )(?:choice|decision|direction|selection|territory|option|variant)(?: +\w+){0,3} +(?:is|was|remains?|became)? *no +longer +(?:pending|provisional|undecided|unresolved)(?: |$)/u.test(clause)
    const pendingDecisionReference = !invertedPendingDecision && (/(?:^| )(?:pending|provisional|undecided|unresolved)(?: |$)/u.test(clause) ||
      /(?:^| )(?:not|never)(?: +\w+){0,3} +(?:adopted|approved|chosen|made|passed|preferred|selected|settled|won)(?: |$)/u.test(clause)
    )
    const explicitDecisionOutcome = /(?:^| )(?:agreement|consensus|endorsement|recommendation|selection|verdict|winner)(?: +\w+){0,4} +(?:is|was|went|received|reached|declared|named|emerged|carried)(?: +\w+){0,3}(?: |$)/u.test(clause) ||
      /(?:^| )(?:committee|panel|review +team|selector|team)(?: +\w+){0,3} +reached +(?:agreement|consensus)(?: |$)/u.test(clause) ||
      /(?:^| )(?:review|panel|committee)(?: +\w+){0,3} +outcome(?: +\w+){0,2} +(?:is|was)? *(?:positive|successful|supportive)(?: |$)/u.test(clause) ||
      /^(?:the +)?(?:candidate|choice|committee|decision|draft|option|packet|panel|plan|proposal|review|selection|selector|variant) +(?:(?:is|was|has +been) +)?passed$/u.test(clause) ||
      /(?:^| )(?:committee|panel|selector|team)(?: +\w+){0,2} +passed(?: +\w+){0,2} +(?:choice|decision|draft|option|packet|plan|proposal|review|selection|variant)(?: |$)/u.test(clause) ||
      /(?:^| )committee +named(?: +the)? +(?:option|proposal|territory|variant)? *[a-z0-9]+(?: |$)/u.test(clause) ||
      /(?:^| )(?:option|territory|variant)? *[a-z0-9]+ +(?:carried +the +vote|emerged +as +the +selection|received +the +panel +endorsement|was +declared +the +winner|was +victorious|advanced|beat(?: +\w+){0,2}|triumphed)(?: |$)/u.test(clause) ||
      /(?:^| )(?:final +)?(?:choice|decision)(?: +\w+){0,2} +(?:is|was|:) +(?:option +)?[a-z0-9]+(?: |$)/u.test(clause) ||
      /(?:^| )final +(?:choice|decision) +(?:option +)?[a-z0-9]+(?: |$)/u.test(clause) ||
      /(?:^| )(?:option|territory|variant) +[a-z0-9]+ +(?:is|was) +the +final +choice(?: |$)/u.test(clause) ||
      /(?:^| )[a-z0-9]+ +(?:is|was) +(?:our|the) +(?:choice|decision|pick|preference|selection|winner)(?: |$)/u.test(clause) ||
      /(?:^| )(?:committee|group|panel|selector|team)(?: +\w+){0,3} +(?:landed +on|went +for|went +with)(?: +\w+){0,3}(?: |$)/u.test(clause) ||
      /(?:^| )(?:committee|group|panel|selector|team) +(?:choice|decision|pick|preference|selection)(?: +is| +was| +on| +:)? +[a-z0-9]+(?: |$)/u.test(clause) ||
      /(?:^| )(?:committee|group|panel|selector|team)(?: +\w+){0,3} +(?:aligned +on|coalesced +around|converged +on|supported)(?: +\w+){0,3}(?: |$)/u.test(clause) ||
      /(?:^| )(?:the +)?vote +broke +for +(?:option +|territory +|variant +)?[a-z0-9]+(?: |$)/u.test(clause) ||
      /(?:^| )(?:direction|option|territory|variant) +[a-z0-9]+ +(?:is|was|became|has +been) +(?:the +)?(?:chosen|locked|preferred|selected|settled) +(?:choice|direction|option|standard|territory|variant)?(?: |$)/u.test(clause) ||
      /(?:^| )[a-z0-9]+ +became +(?:the +)?(?:chosen|locked|preferred|selected|settled) +(?:choice|direction|option|standard|territory|variant)(?: |$)/u.test(clause) ||
      /(?:^| )(?:direction|option|territory|variant) +[a-z0-9]+ +was +settled(?: |$)/u.test(clause) ||
      /(?:^| )(?:consensus|verdict|winner)(?: +is| +was| +:)? +(?:direction +|option +|territory +|variant +)?(?:[a-z]|[0-9]+)(?: |$)/u.test(clause) ||
      /(?:^| )(?:direction|option|territory|variant) +locked +to +[a-z0-9]+(?: |$)/u.test(clause)
      || /(?:^| )no +objections?(?: +\w+){0,4} +(?:committee|group|panel|selector|team)(?: +\w+){0,3} +(?:adopted|aligned|backed|chose|coalesced|decided|endorsed|picked|selected|settled|supported|voted)(?: +\w+){0,3}(?: |$)/u.test(clause)
    const terseDecisionOutcome = /(?:^| )(?:committee|panel|selector|territory)(?: +\w+){0,2} +(?:choice|consensus|selection|verdict|winner)(?: +\w+){0,2}(?: |$)/u.test(clause) &&
      !pendingDecisionReference
    const positiveDecisionFact = invertedPendingDecision || (!pendingDecisionReference && (
      (decisionContext && (activeDecisionResult || passiveDecisionResult)) ||
      terseDecisionOutcome || explicitDecisionOutcome
    ))

    assert(
      !positiveDecisionFact,
      `${label} contains a free-form approval, pass, or selection claim: ${JSON.stringify(clause)}`
    )
  }
}

const validateNoMarkdownReferenceLinks = (source) => {
  assert(
    !/^ {0,3}\[[^\]\n]+\]:/mu.test(source),
    "migration draft cannot use reference-style link definitions"
  )
  assert(
    !/!?\[[^\]\n]*\][ \t]*(?:\n[ \t]*)?\[[^\]\n]*\]/u.test(source),
    "migration draft cannot use full or collapsed reference-style links"
  )
}

const validateMarkdownStateAssignments = (source) => {
  const expected = Object.freeze({
    status: "provisional-prework",
    decisionstatus: "pending",
    participantevidence: "none",
    humanevidence: "none",
    humanparticipantcount: "0",
    nothumanusabilitytested: "true",
    requireddependencyshas: "null",
    productionauthorization: "false",
    productiondeploymentstatus: "blocked-live-user-reviewer",
    productiondeploymentscope: "out-of-scope",
    liveenvironmentreviewertype: "user",
    liveenvironmentchangeauthorization: "separate-required",
    reviewsubjectbasesha: reviewSubjectBaseSha,
    authorizationinterface: "codex-only-uiux-v1",
    reviewmode: "codex-only"
  })
  const assignments = source.matchAll(
    /\b(decisionStatus|decision status|participantEvidence|participant evidence|humanEvidence|human evidence|humanParticipantCount|human participant count|notHumanUsabilityTested|not human usability tested|requiredDependencyShas|required dependency SHAs|productionAuthorization|production authorization|productionDeploymentStatus|production deployment status|productionDeploymentScope|production deployment scope|liveEnvironmentReviewerType|live environment reviewer type|liveEnvironmentChangeAuthorization|live environment change authorization|reviewSubjectBaseSha|review subject base SHA|authorizationInterface|authorization interface|reviewMode|review mode|status)[`"'\s*]*(?:[:=]|\||\bis\b)\s*[`"'\s*]*([^\s|,;`]+)/giu
  )
  for (const match of assignments) {
    const field = match[1].replaceAll(" ", "").toLowerCase()
    const value = match[2].replace(/^[\[("']+|[\])}.:"']+$/gu, "").toLowerCase()
    assert(
      value === expected[field],
      `migration draft ${match[1]} assignment must remain ${expected[field]}; received ${match[2]}`
    )
  }
}

const validateNoUnstructuredStateAssignments = (source) => {
  const outsideMetadata = source.replace(
    /<!-- PLAN_009_METADATA_START[\s\S]*?PLAN_009_METADATA_END -->/u,
    ""
  )
  assert(
    !/\b(?:decisionStatus|decision status|participantEvidence|participant evidence|humanEvidence|human evidence|humanParticipantCount|human participant count|notHumanUsabilityTested|not human usability tested|requiredDependencyShas|required dependency SHAs|productionAuthorization|production authorization|productionDeploymentStatus|production deployment status|productionDeploymentScope|production deployment scope|liveEnvironmentReviewerType|live environment reviewer type|liveEnvironmentChangeAuthorization|live environment change authorization|reviewCycleStatus|review cycle status|priorReviewReceiptsReusable|prior review receipts reusable|reviewSubjectBaseSha|review subject base SHA|authorizationInterface|authorization interface|reviewMode|review mode|status)[`"'\s*]*(?:[:=]|\||\bis\b)\s*[`"'\s*]*[^\s|,;`]+/iu.test(outsideMetadata),
    "migration draft contains a state assignment outside structured metadata"
  )
}

const validateMetadata = (metadata, label) => {
  assertExactKeys(metadata, Object.keys(requiredMetadata), `${label} metadata`)
  for (const [key, expected] of Object.entries(requiredMetadata)) {
    assert(
      Object.is(metadata[key], expected),
      `${label} metadata ${key} must be ${JSON.stringify(expected)}; received ${JSON.stringify(metadata[key])}`
    )
  }
}

const validateStructuredState = (value, label, path = []) => {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => validateStructuredState(entry, label, [...path, String(index)]))
    return
  }
  if (value === null || typeof value !== "object") return
  for (const [key, entry] of Object.entries(value)) {
    const location = `${label}.${[...path, key].join(".")}`
    if (key === "participantEvidence") {
      assert(entry === "none", `${location} must remain none`)
    }
    if (key === "humanEvidence") {
      assert(entry === "none", `${location} must remain none`)
    }
    if (key === "humanParticipantCount") {
      assert(entry === 0, `${location} must remain 0`)
    }
    if (key === "notHumanUsabilityTested") {
      assert(entry === true, `${location} must remain true`)
    }
    if (key === "authorizationInterface") {
      assert(entry === "CODEX-ONLY-UIUX-V1", `${location} must remain CODEX-ONLY-UIUX-V1`)
    }
    if (/participantCount$/iu.test(key)) {
      assert(entry === 0 || entry === null, `${location} cannot contain participant evidence`)
    }
    if (key === "decisionStatus") {
      assert(entry === "pending", `${location} must remain pending`)
    }
    if (key === "requiredDependencyShas") {
      assert(entry === null, `${location} must remain null`)
    }
    if (key === "mustRebaseAndReverify") {
      assert(entry === true, `${location} must remain true`)
    }
    if (key === "productionAuthorization") {
      assert(entry === false, `${location} must remain false`)
    }
    if (key === "productionDeploymentStatus") {
      assert(entry === "blocked-live-user-reviewer", `${location} must remain blocked-live-user-reviewer`)
    }
    if (key === "productionDeploymentScope") {
      assert(entry === "out-of-scope", `${location} must remain out-of-scope`)
    }
    if (key === "productionDeploymentInScope") {
      assert(entry === false, `${location} must remain false`)
    }
    if (key === "liveEnvironmentReviewerType") {
      assert(entry === "User", `${location} must remain User`)
    }
    if (key === "liveEnvironmentChangeAuthorization") {
      assert(entry === "separate-required", `${location} must remain separate-required`)
    }
    if (key === "codexOnlyMaySatisfyLiveEnvironmentReview" || key === "codexOnlyMaySatisfyRequiredReviewer") {
      assert(entry === false, `${location} must remain false`)
    }
    if (key === "environmentChangeAuthorizedByPlan009") {
      assert(entry === false, `${location} must remain false`)
    }
    if (key === "environmentChangeRequiresSeparateAttestation") {
      assert(entry === true, `${location} must remain true`)
    }
    if (key === "requiredReviewerType") {
      assert(entry === "User", `${location} must remain User`)
    }
    if (key === "reviewCycleStatus") {
      assert(entry === "prior-cycle-invalidated", `${location} must remain prior-cycle-invalidated`)
    }
    if (key === "priorReviewReceiptsReusable") {
      assert(entry === false, `${location} must remain false`)
    }
    if (key === "reviewSubjectBaseSha") {
      assert(entry === reviewSubjectBaseSha, `${location} must remain the integrated current-main subject base`)
    }
    if (key === "reviewMode") {
      assert(entry === "codex-only", `${location} must remain codex-only`)
    }
    if (["acceptedDecisionSha", "mergeCommitSha", "ciRunId", "ciHeadSha", "independentReviewRecordSha256", "upstreamInputRef", "artifactSha256ByPath", "externalEvidenceId"].includes(key)) {
      assert(entry === null, `${location} must remain null until deliberate graduation`)
    }
    if (/status$/iu.test(key) && typeof entry === "string") {
      assert(!forbiddenStateValues.has(entry.toLowerCase()), `${location} contains forbidden state ${entry}`)
    }
    validateStructuredState(entry, label, [...path, key])
  }
}

const validateNoUnexpectedShaLiterals = (
  source,
  label,
  { allowedLiterals = [], expectedObservedCount, expectedLiteralCounts = new Map() } = {}
) => {
  const allowed = new Set([
    observedAtSha,
    historicalBaselineCiHeadSha,
    reviewSubjectBaseSha,
    ...invalidatedReviewSubjectShas,
    ...allowedLiterals
  ].map((literal) => literal.toLowerCase()))
  const matches = source.match(/\b[0-9a-f]{7,64}\b/giu) ?? []
  for (const match of matches) {
    if (!/[a-f]/iu.test(match) && match.length !== 40 && match.length !== 64) continue
    assert(allowed.has(match.toLowerCase()), `${label} contains an unverified SHA literal ${match}`)
  }
  const contextual = source.matchAll(
    /\b(?:sha(?:-?1|-?256)?|commit(?:\s+(?:sha|hash))?|decision|merge|coordinate|ref|attestation)\b[^\n]{0,64}?\b([0-9a-f]{4,64})\b/giu
  )
  for (const match of contextual) {
    assert(allowed.has(match[1].toLowerCase()), `${label} contains an unverified contextual SHA literal ${match[1]}`)
  }
  if (expectedObservedCount !== undefined) {
    const count = (source.match(new RegExp(observedAtSha, "giu")) ?? []).length
    assert(count === expectedObservedCount, `${label} must contain the observed baseline SHA exactly ${expectedObservedCount} times; found ${count}`)
  }
  for (const [literal, expectedCount] of expectedLiteralCounts) {
    const count = (source.match(new RegExp(literal, "giu")) ?? []).length
    assert(count === expectedCount, `${label} must contain attested SHA ${literal} exactly ${expectedCount} times; found ${count}`)
  }
}

const validateNoAffirmativeAuthorization = (source, label, { projectSemantic = true } = {}) => {
  assert(!/^\s*deploy(?:ment)?(?: to)? production(?: now)?[.!]?\s*$/imu.test(source), `${label} contains a production deployment imperative`)
  validateNoFreeFormSemanticClaims(source, label, { project: projectSemantic })
  for (const clause of semanticClaimClauses(source, { project: projectSemantic })) {
    const tokens = clause.split(" ")
    const reviewerGateContext = semanticHasAnyRoot(tokens, ["reviewer"]) ||
      /(?:^| )(?:required|user|production|release)(?: +\w+){0,3} +(?:gate|review|reviewer|condition|rule)(?: |$)/u.test(clause) ||
      /(?:^| )production +environment(?: +\w+){0,2} +(?:review|reviewer|condition|gate)(?: |$)/u.test(clause) ||
      /(?:^| )user +review(?:er)?(?: +\w+){0,2} +(?:condition|gate|rule)(?: |$)/u.test(clause)
    const reviewerOutcomeIndexes = semanticTokenIndexes(
      tokens,
      (token) => /^(?:clear(?:ed|s|ing)?|complet(?:e|ed|es|ing)|done|fulfil(?:l|led|ls|ling)|met|pass(?:ed|es|ing)|satisf(?:y|ied|ies|ying))$/u.test(token)
    )
    const affirmativeReviewerOutcome = reviewerOutcomeIndexes.some((index) => !semanticIndexIsNegated(tokens, index)) ||
      (semanticHasPhrase(clause, "signed off") && !/(?:^| )(?:cannot|not|never)(?: |$)/u.test(clause)) ||
      (semanticHasPhrase(clause, "checked the box") && !/(?:^| )(?:cannot|not|never)(?: |$)/u.test(clause))
    assert(
      !(reviewerGateContext && affirmativeReviewerOutcome),
      `${label} claims the live production reviewer condition is complete or satisfied`
    )
  }
  assert(
    !/\bcodex\b[^\n]{0,48}\b(?:satisfies|can satisfy|may satisfy|bypasses|can bypass|waives)\b[^\n]{0,64}\b(?:production environment|environment reviewer|required reviewer|user reviewer)\b/iu.test(source),
    `${label} claims Codex can satisfy or bypass the live production reviewer`
  )
  const affirmativeReviewerStateClaims = [
    ...source.matchAll(
      /\b(?:user[- ]review(?:er)? rule|required reviewer(?: rule)?|production environment reviewer)\b[^\n]{0,48}\b(?:is |was |has been )?\b(?:waived|removed|disabled|bypassed|satisfied)\b/giu
    )
  ].filter(([claim]) => !/\b(?:cannot|can not|can't|not|never|unable to)\b/iu.test(claim))
  assert(
    affirmativeReviewerStateClaims.length === 0,
    `${label} claims the live production reviewer is waived or satisfied`
  )
  const reviewerSatisfactionPatterns = [
    /\b(?:ci|codex|automation|the agent|the team)\b[^\n.!?]{0,64}\b(?:fulfilled|met|passed|satisfied|cleared)\b[^\n.!?]{0,64}\b(?:required[- ]review(?:er)? condition|required reviewer|user[- ]review(?:er)? (?:gate|rule)|production environment reviewer)\b/iu,
    /\b(?:required[- ]review(?:er)? condition|required review|user[- ]review(?:er)? (?:gate|rule)|production environment reviewer)\b[^\n.!?]{0,64}\b(?:fulfilled|met|passed|satisfied|cleared)\b[^\n.!?]{0,64}\b(?:by\s+)?(?:ci|codex|automation|the agent|the team)\b/iu
  ]
  const reviewerSatisfactionClaims = reviewerSatisfactionPatterns
    .map((pattern) => source.match(pattern)?.[0])
    .filter((claim) => claim !== undefined && !/\b(?:cannot|can +not|not|never|unsatisfied|unfulfilled)\b/iu.test(claim))
  assert(
    reviewerSatisfactionClaims.length === 0,
    `${label} claims Codex or automation fulfilled the live production reviewer condition`
  )
  assert(
    !/\b(?:plan 009|this plan|this packet|codex)\b[^\n]{0,32}\b(?:authorizes|permits|allows|approves)\b[^\n]{0,48}\b(?:change|changing|modify|modifying|remove|removing|disable|disabling)\b[^\n]{0,48}\b(?:production environment|environment reviewer|required reviewer|user[- ]review rule)\b/iu.test(source),
    `${label} claims authority to change the live production Environment`
  )
}

const validateNoUnsafeRollbackClaims = (source, label) => {
  const projectedSource = semanticClaimProjection(source).toLowerCase()
    .replace(/dependency[\p{Pd}_\s]+closed[\p{Pd}_\s]+suffix/gu, "dependency closed suffix")
  const safeGitTarget = "(?:the +)?(?:current +unmerged +tip|dependency +closed +suffix)"
  const recoveryAction = "(?:back +out|backout|downgrad\\w*|fall +back|fallback|recover\\w*|redeploy\\w*|restor\\w*|revers\\w*|revert\\w*|roll(?:ed|ing|s)?(?: +\\w+){0,5} +back|rollback|rollbacks|switch(?:ed|es|ing)? +back|undo\\w*)"
  const crossClauseTargetExtension = new RegExp(
    `(?:revert +the +current +unmerged +tip|(?:roll +back|rollback) +the +dependency +closed +suffix)\\s*[.;]\\s*(?:also +|include +)?(?:dns|(?:the +)?(?:application|build|database|deployment|file|layer|production|release|route|service|site|tranche|version|worker)(?: +worker)?)(?: +too)?`,
    "u"
  ).test(projectedSource) ||
    new RegExp(`(?:revert +the +current +unmerged +tip|(?:roll +back|rollback) +the +dependency +closed +suffix)\\s*[.;]\\s*[^.!?;\\n]{0,180}${recoveryAction}`, "u").test(projectedSource)
  assert(!crossClauseTargetExtension, `${label} contains an unsafe non-dependency-closed rollback claim across clauses`)

  const exactSafeGitClaims = Object.freeze([
    /^revert +the +current +unmerged +tip$/u,
    /^(?:roll +back|rollback) +the +dependency +closed +suffix$/u,
    /^direct +revert +is +permitted +only +for +the +current +unmerged +tip$/u,
    /^a +dependency +closed +suffix +may +be +reverted$/u,
    /^(?:rollback +boundary +)?direct +revert +is +permitted +only +for +the +current +unmerged +tip +or +a +dependency +closed +suffix$/u,
    /^direct +revert +remains +limited +to +the +current +unmerged +tip +or +a +dependency +closed +suffix$/u,
    /^no +tested +instant +cloudflare +production +rollback +exists +and +direct +source +revert +is +safe +only +for +the +current +unmerged +tip +or +a +dependency +closed +suffix$/u,
    /^forward +fix +unless +direct +revert +targets +the +current +unmerged +tip +or +a +dependency +closed +suffix +and +backward +read +proof +holds$/u
  ])
  const exactSafeLocalClaims = Object.freeze([
    /^restore +settings +from +(?:the +)?imported +backup$/u,
    /^restore +stored +preferences +after +(?:the +)?authoritative +load$/u,
    /^restore +the +local +study +session +after +indexeddb +opens$/u,
    /^restore +settings +after +indexeddb +loads$/u,
    /^restore +the +offline +pack$/u,
    /^restore +focus +after +the +dialog +closes$/u,
    /^undo +the +last +text +edit$/u
  ])
  const exactStructuralRecoveryReference = /^(?:(?:apply|document|record|rehearse|use) +(?:the +)?(?:actual +platform +|global +|supported +)?|(?:risk +and +)?)(?:rollback|recovery) +(boundary|contract|coordinates?|matrix|policy|proof|rehearsal|rule|semantics)(?: +(?:above|before +implementation|for +source +changes|in +the +record))?$/u
  const exactStructuralRecoveryLabel = /^rollbacks? +(boundary|contract|coordinates?|failures?|matrix|path|policy|proof|rehearsal|rule|semantics|workflow)$/u

  for (const clause of semanticClaimClauses(source)) {
    if (exactSafeGitClaims.some((pattern) => pattern.test(clause)) || exactSafeLocalClaims.some((pattern) => pattern.test(clause))) continue
    if (exactStructuralRecoveryLabel.test(clause) || exactStructuralRecoveryReference.test(clause)) continue

    const tokens = clause.split(" ")
    const eventIndexes = semanticTokenIndexes(tokens, (token) =>
      /^(?:backout|downgrad(?:e|ed|es|ing)|fallback|recover(?:ed|ing|y)?|redeploy(?:ed|s|ing)?|restor(?:ation|e|ed|es|ing)|revers(?:al|e|ed|es|ing)|reversibility|revert(?:ed|ing|ible|s)?|reversion|revertibility|rollback|rollbacks|undo|undoes|undoing|undid|undone)$/u.test(token)
    )
    const phraseEventIndexes = semanticTokenIndexes(tokens, (token, index) =>
      (["roll", "rolled", "rolling", "rolls"].includes(token) && tokens.slice(index + 1, index + 7).includes("back")) ||
      (["switch", "switched", "switches", "switching", "fall", "falls", "falling", "fell"].includes(token) && tokens.slice(index + 1, index + 7).includes("back")) ||
      (["back", "backed", "backing"].includes(token) && tokens.slice(index + 1, index + 7).includes("out"))
    )
    const recoveryEvents = [...new Set([...eventIndexes, ...phraseEventIndexes])]
      .filter((index) => !(/^rollbacks?$/u.test(tokens[index]) && /^(?:boundary|contract|coordinates?|failures?|matrix|path|policy|proof|rehearsal|rule|semantics|workflow)$/u.test(tokens[index + 1] ?? "")))
      .filter((index) => !(tokens[index] === "recovery" && /^(?:copy|description|label|text|wording)$/u.test(tokens[index + 1] ?? "")))
      .sort((left, right) => left - right)
    const previousReleaseObject = /(?:^| )(?:old|previous|prior|earlier|older) +(?:build|deployment|production +version|release|site +version|version)(?: |$)/u.test(clause)
    if (recoveryEvents.length === 0 && !previousReleaseObject) continue

    const actor = semanticHasAnyRoot(tokens, ["operator", "plan", "team", "we"])
      ? "explicit-actor"
      : (recoveryEvents.some((index) => index === 0 && /^(?:backout|downgrade|fallback|recover|redeploy|restore|reverse|revert|rollback|undo)$/u.test(tokens[index])) ? "imperative" : "implicit")
    const targetTokens = [...new Set(recoveryEvents.flatMap((index) => tokens.slice(Math.max(0, index - 6), index + 7)))]
    const targetClause = targetTokens.join(" ")
    const distanceToTargetRoots = (roots) => Math.min(...tokens.flatMap((token, tokenIndex) =>
      semanticHasRoot(token, roots)
        ? recoveryEvents.map((eventIndex) => Math.abs(eventIndex - tokenIndex))
        : []
    ), Number.POSITIVE_INFINITY)
    const gitCurrentTip = semanticHasPhrase(clause, "current unmerged tip")
    const gitClosedSuffix = semanticHasPhrase(clause, "dependency closed suffix")
    const repositoryPathObject = targetTokens.includes("repositorypathsentinel")
    const releaseTargetRoots = ["application", "build", "deployment", "dns", "production", "release", "site", "traffic", "version", "website"]
    const partialRuntimeTargetRoots = [
      "asset", "backend", "change", "component", "css", "document", "file", "frontend", "layer", "module", "navigation",
      "presentation", "range", "route", "service", "shell", "slice", "subset", "tranche", "ui", "visual", "worker"
    ]
    const localStateTargetRoots = [
      "content", "dialog", "draft", "edit", "focus", "indexeddb", "job", "manifest", "offline", "pack", "preference", "preview", "record", "session", "setting", "text"
    ]
    const ambiguousStateTargetRoots = ["database", "data", "state", "stored"]
    const releaseTargetDistance = distanceToTargetRoots(releaseTargetRoots)
    const partialRuntimeTargetDistance = distanceToTargetRoots(partialRuntimeTargetRoots)
    const localStateTargetDistance = distanceToTargetRoots(localStateTargetRoots)
    const ambiguousStateTargetDistance = distanceToTargetRoots(ambiguousStateTargetRoots)
    const releaseTarget = Number.isFinite(releaseTargetDistance)
    const partialRuntimeTarget = Number.isFinite(partialRuntimeTargetDistance) || semanticHasPhrase(targetClause, "service worker")
    const localStateTarget = Number.isFinite(localStateTargetDistance)
    const ambiguousStateTarget = Number.isFinite(ambiguousStateTargetDistance)
    const nearestTargetDistance = Math.min(releaseTargetDistance, partialRuntimeTargetDistance, localStateTargetDistance, ambiguousStateTargetDistance)
    const target = gitCurrentTip || gitClosedSuffix
      ? "git-source"
      : (repositoryPathObject ? "partial-runtime"
        : (releaseTargetDistance === nearestTargetDistance ? "production-release"
          : (partialRuntimeTargetDistance === nearestTargetDistance ? "partial-runtime"
            : (localStateTargetDistance === nearestTargetDistance ? "local-state"
              : (ambiguousStateTargetDistance === nearestTargetDistance ? "ambiguous-state" : "unspecified")))))
    const hasTargetExtension = /(?:^| )(?:and|plus|with|including|alongside|covering|along +with|together +with|as +well +as)(?: |$)/u.test(clause) &&
      (releaseTarget || partialRuntimeTarget || repositoryPathObject || ambiguousStateTarget)

    const eventIsNegated = (index) => {
      let start = 0
      let end = tokens.length
      for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
        if (["and", "but", "however", "then", "whereas", "yet"].includes(tokens[cursor])) {
          start = cursor + 1
          break
        }
      }
      for (let cursor = index + 1; cursor < tokens.length; cursor += 1) {
        if (["and", "but", "however", "then", "whereas", "yet"].includes(tokens[cursor])) {
          end = cursor
          break
        }
      }
      const segment = tokens.slice(start, end).join(" ")
      const doubleNegative = /(?:^| )(?:not +(?!allowed|permitted)(?:blocked|forbidden|ineligible|prohibited|unsafe)|no +rollbacks? +(?:is +)?unavailable|nothing +prevents?|no +barrier|cannot +fail)(?: |$)/u.test(segment)
      if (doubleNegative) return false
      return /(?:^| )(?:cannot|do +not|must +not|may +not|never|no +longer|not +allowed|not +permitted|prohibited|unsafe|ineligible)(?: |$)/u.test(segment) ||
        /(?:^| )(?:is|are|was|were|remains?) +(?:not +allowed|not +permitted|prohibited|unsafe|ineligible)(?: |$)/u.test(segment) ||
        /^(?:there +is +)?no(?: |$)/u.test(segment) || /(?:^| )unless(?: |$)/u.test(segment)
    }
    const affirmativeEvents = recoveryEvents.filter((index) => !eventIsNegated(index))
    const truthfulPreviousReleaseProhibition = /^(?:the +)?(?:old|previous|prior|earlier|older) +(?:build|deployment|production +version|release|site +version|version)(?: +is| +are| +remains?)? +(?:forbidden|prohibited|unsafe)$/u.test(clause) ||
      /^never +(?:serve|use)(?: +the)? +(?:old|previous|prior|earlier|older) +(?:build|deployment|production +version|release|site +version|version)$/u.test(clause)
    const previousReleaseAction = previousReleaseObject && /(?:^| )(?:deploy|fallback|publish|redeploy|restore|serve|switch|use)(?: |$)/u.test(clause)
    if (truthfulPreviousReleaseProhibition) continue

    const affirmativeState = affirmativeEvents.some((index) => {
      const token = tokens[index]
      const before = tokens.slice(Math.max(0, index - 5), index)
      const after = tokens.slice(index + 1, index + 7)
      const recoveryVerbForm = /^(?:backout|downgrade|fallback|recover|redeploy|restore|reverse|revert|rollback|undo)$/u.test(token) || phraseEventIndexes.includes(index)
      const imperative = recoveryVerbForm && (index === 0 || before.at(-1) === "please")
      const modal = recoveryVerbForm && before.slice(-2).some((entry) => /^(?:can|could|may|must|need|needs|plan|plans|requires?|should|will)$/u.test(entry))
      const inflectedAction = /^(?:backout|downgraded|downgrading|redeployed|redeploying|restored|restoring|reversal|reversed|reversing|reverted|reverting|reversion|rolled|switched|switching|undid|undo|undoes|undoing|undone)$/u.test(token) &&
        !(token === "restoring" && after[0] === "state")
      const operationalStatus = after.some((entry) => /^(?:active|applied|available|began|capability|certified|complete|completed|configured|done|enabled|ended|executed|exists|failed|finished|happened|initiated|occurred|option|performed|permitted|possible|ready|required|running|safe|started|succeeded|successful|supported|underway|validated)$/u.test(entry))
      const permissionState = recoveryVerbForm && (before.slice(-2).some((entry) => /^(?:allowed|available|eligible|permitted|safe|supported)$/u.test(entry)) || after.slice(0, 3).some((entry) => /^(?:allowed|available|eligible|permitted|safe|supported)$/u.test(entry)))
      return imperative || modal || inflectedAction || operationalStatus || permissionState
    })
    const explicitActorAction = affirmativeEvents.length > 0 && actor === "explicit-actor" && /(?:^| )(?:operator|plan|team|we)(?: +\w+){0,5} +(?:back +out|backout|downgrad\w*|fall +back|fallback|initiat\w* +(?:the +)?rollback|perform\w* +(?:a +)?restoration|redeploy\w*|restor\w*|revers\w*|revert\w*|roll +back|rollback|switch +back|undo\w*)(?: |$)/u.test(clause)
    const recoveryEligibilityState = affirmativeEvents.some((index) => tokens
      .slice(Math.max(0, index - 4), index + 5)
      .some((token) => /^(?:allow(?:ed|s)?|applies|configured|eligible|fine|independent|independently|permit(?:ted|s)?|reversibility|revertibility|revertible|rollbackable|safe|supported|targetable)$/u.test(token)))
    const affirmativeEligibility = affirmativeEvents.length > 0 && (recoveryEligibilityState ||
      /(?:^| )(?:nothing +prevents?|there +is +no +barrier|no +rollbacks? +(?:is +)?unavailable|rollbacks? +cannot +fail)(?: |$)/u.test(clause) ||
      /(?:^| )(?:compatibility|check)(?: +\w+){0,4} +proves?(?: +\w+){0,3} +(?:rollback|revertibility)(?: |$)/u.test(clause))
    const activeFallback = affirmativeEvents.length > 0 && (/(?:^| )(?:activate|apply|enable|engage|include|includes|included|use|uses|used)(?: +\w+){0,3} +fallback(?: |$)/u.test(clause) ||
      /(?:^| )fallback(?: +\w+){0,4} +(?:is|was|became|remains?)? *(?:active|applied|deployed|enabled|engaged|failed|happened|running|succeeded|used)(?: |$)/u.test(clause))
    const targetStatus = affirmativeEvents.length > 0 && (releaseTarget || partialRuntimeTarget || repositoryPathObject) && /(?:^| )(?:backed +out|downgraded|fell +back|redeployed|restored|reversed|reverted|rolled +back|switched +back|undone)(?: |$)/u.test(clause)
    const affirmativeRecovery = previousReleaseAction || targetStatus || affirmativeEligibility || affirmativeState || explicitActorAction || activeFallback
    if (!affirmativeRecovery) continue

    const safeGitFrame = target === "git-source" && !hasTargetExtension && !releaseTarget && !partialRuntimeTarget && !repositoryPathObject && !ambiguousStateTarget &&
      ((gitCurrentTip && !gitClosedSuffix) || (!gitCurrentTip && gitClosedSuffix) || (gitCurrentTip && gitClosedSuffix)) &&
      exactSafeGitClaims.some((pattern) => pattern.test(clause))
    const safeLocalFrame = target === "local-state" && !repositoryPathObject
    assert(
      safeGitFrame || safeLocalFrame,
      `${label} contains an unsafe non-dependency-closed rollback claim (${actor}; ${target}; affirmative): ${JSON.stringify(clause)}`
    )
  }
}

const validateNoSettingsRestorationContradictions = (source, label) => {
  const wholeClauses = [...new Set(semanticClaimProjection(source)
    .split(/(?:[.!?;\u3002\uff01\uff1f]+|\n+)/gu)
    .flatMap((clause) => [clause, ...clause.split(/\b(?:and|but|however|whereas|yet)\b/giu)])
    .map((clause) => clause.toLowerCase().replace(/[\p{P}\p{S}]+/gu, " ").replace(/\s+/gu, " ").trim())
    .filter((clause) => clause.length > 0))]
  for (const clause of wholeClauses) {
    const settingsContext = /(?:^| )(?:controls?|current +settings|form|preference|preferences|settings)(?: |$)/u.test(clause) ||
      /(?:^| )(?:save|saving)(?: +button| +control)?(?: |$)/u.test(clause) || semanticHasPhrase(clause, "submit button") || semanticHasPhrase(clause, "write access")
    const unresolvedAuthority = /(?:^| )(?:before|pending|prior +to|until|while)(?: +\w+){0,5} +(?:authoritative +)?(?:indexeddb +)?(?:load|restoration|restore)(?: +\w+){0,3} +(?:completes?|completed|fails?|failure|pending|resolves?|resolved|returns?|succeeds?)?(?: |$)/u.test(clause) ||
      /(?:^| )pending +(?:the +)?(?:authoritative +)?(?:indexeddb +)?(?:load|restoration|restore)(?: |$)/u.test(clause) ||
      /(?:^| )(?:authoritative +)?(?:load|restoration)(?: +\w+){0,3} +(?:is +)?(?:pending|unresolved|unfinished)(?: |$)/u.test(clause) ||
      /(?:^| )(?:wait|waiting)(?: +\w+){0,3} +for +(?:the +)?(?:authoritative +)?(?:indexeddb +)?(?:load|restoration|restore)(?: |$)/u.test(clause) ||
      /(?:^| )(?:during|ahead +of) +(?:the +)?(?:authoritative +)?(?:indexeddb +)?(?:load|restoration|restore)(?: |$)/u.test(clause) ||
      /(?:^| )before +indexeddb +finishes +(?:loading|initializing)(?: |$)/u.test(clause) ||
      /(?:^| )pending +indexeddb +initialization(?: |$)/u.test(clause) ||
      /(?:^| )while +(?:the +)?(?:authoritative +)?(?:indexeddb +)?(?:load|restoration|restore)(?: +is)? +(?:active|running|underway)(?: |$)/u.test(clause) ||
      /(?:^| )while +(?:the +)?(?:authoritative +)?(?:indexeddb +)?(?:load|restoration|restore) +(?:runs?|continues?|proceeds?)(?: |$)/u.test(clause) ||
      /(?:^| )while +(?:the +)?(?:authoritative +)?indexeddb(?: +read)? +(?:is +)?(?:loading|opening|pending|running|unresolved)(?: |$)/u.test(clause) ||
      /(?:^| )(?:as|while) +(?:the +)?(?:authoritative +)?(?:indexeddb +)?(?:load|read|restoration|restore)(?: +is)? +(?:continuing|loading|outstanding|pending|proceeding|running|unresolved)(?: |$)/u.test(clause) ||
      /(?:^| )(?:after|on) +(?:authoritative +)?(?:indexeddb +)?(?:load|restoration|restore) +failure(?: +\w+){0,12} +(?:before|until)(?: +the)? +(?:failure|error)(?: +is)? +handled(?: |$)/u.test(clause) ||
      /(?:^| )(?:after|on|when) +(?:authoritative +)?(?:indexeddb +)?(?:load|restoration|restore) +fails?(?: +\w+){0,12} +(?:before|until)(?: +the)? +(?:(?:failure|error)(?: +is)? +handled|recovery +completes?)(?: |$)/u.test(clause) ||
      /(?:^| )unhandled +(?:authoritative +|indexeddb +)?(?:load +|restoration +|restore +)?failure(?: |$)/u.test(clause)
    const enablingDoubleNegative = /(?:^| )(?:must|should|will|can|could|may|need|needs)? *not +(?:block(?:ed|s|ing)?|disable(?:d|s|ing)?|prevent(?:ed|s|ing)?|prohibit(?:ed|s|ing)?)(?: +\w+){0,6} +(?:chang(?:e|ed|es|ing)|controls?|edit(?:ed|s|ing)?|persist(?:ed|s|ing)?|preferences?|save|saving|writ(?:e|es|ing|ten))(?: |$)/u.test(clause) ||
      /(?:^| )(?:chang(?:e|ed|es|ing)|controls?|edit(?:ed|s|ing)?|persist(?:ed|s|ing)?|preferences?|save|saving|writ(?:e|es|ing|ten))(?: +\w+){0,5} +(?:is|are|was|were)? *not +(?:blocked|disabled|prevented|prohibited|restricted)(?: |$)/u.test(clause) ||
      /(?:^| )(?:controls?|form|preferences?|save|settings)(?: +\w+){0,5} +(?:are|is|was|were)? *not +(?:blocked|disabled|inactive|unavailable|locked|(?:turned +)?off|read +only|readonly|restricted)(?: |$)/u.test(clause) ||
      /(?:^| )(?:controls?|form|preferences?|save|settings)(?: +\w+){0,5} +(?:has|have|had) +not +been +(?:blocked|disabled|locked|prevented|prohibited|restricted)(?: |$)/u.test(clause) ||
      /(?:^| )no +(?:blocked|disabled|locked|read +only|restricted) +state(?: +\w+){0,4} +(?:exists?|is +present)(?: +\w+){0,3} +(?:controls?|preferences?|save|settings)?(?: |$)/u.test(clause) ||
      /(?:^| )(?:settings|controls?|save)(?: +\w+){0,4} +(?:are|is|was|were)? *not +required +to +(?:block|disable|lock|prevent|prohibit|restrict)(?: +\w+){0,5} +(?:changes?|controls?|editing|preferences?|save|saving|writes?|writing)(?: |$)/u.test(clause) ||
      /(?:^| )(?:settings +)?(?:saving|save|writing|writes?)(?: +\w+){0,4} +need +not +wait(?: |$)/u.test(clause) ||
      /(?:^| )nothing(?: +\w+){0,3} +(?:blocks?|disables?|prevents?|prohibits?|restricts?|stops?)(?: +\w+){0,4} +(?:changes?|controls?|editing|preferences?|save|saving|writes?|writing)(?: |$)/u.test(clause)
    const unsafeStateAction = enablingDoubleNegative ||
      /(?:^| )(?:allow(?:ed|s|ing)?|can|could|enable(?:d|s|ing)?|has|have|keep|may|must|need(?:s)?|permit(?:ted|s|ting)?|requires?|should|will)(?: +\w+){0,6} +(?:accept(?:ed|s|ing)?|active|available|chang(?:e|ed|es|ing)|click(?:ed|s|ing)?|clickable|edit(?:able|ed|s|ing)?|interactive|modify|modified|operable|overwrite|overwritten|persist(?:ed|s|ing)?|possible|save(?:d|s|ing)?|stor(?:e|ed|es|ing)|submit(?:s|ted|ting)?|unlocked|unrestricted|usable|writ(?:e|es|ing|ten)|writable)(?: |$)/u.test(clause) ||
      /(?:^| )(?:active|available|chang(?:e|ed|es|ing)|clickable|controls?|edit(?:able|ed|s|ing)?|interactive|operable|persist(?:ed|s|ing)?|preferences?|save|saving|unrestricted|usable|writ(?:e|es|ing|ten)|writable)(?: +\w+){0,5} +(?:accepted|active|allow(?:ed|s)?|available|clickable|editable|enabled|interactive|open|operable|permitted|possible|read +write|safe|unrestricted|usable|works?|writable)(?: |$)/u.test(clause) ||
      /(?:^| )(?:controls?|preferences?|save|settings)(?: +\w+){0,5} +(?:are|is|remain|remains|remained|stay|stays|stayed)(?: +\w+){0,2} +(?:active|available|clickable|editable|enabled|interactive|open|operable|possible|read +write|unrestricted|usable|works?|writable)(?: |$)/u.test(clause) ||
      /(?:^| )(?:controls?|editing|preferences?|save|settings)(?: +\w+){0,5} +(?:are|is|remain|remains|stays?)? *(?:unblocked|unlocked)(?: |$)/u.test(clause) ||
      /(?:^| )settings(?: +\w+){0,3} +(?:lets?|allows?)(?: +\w+){0,4} +(?:save|saving|write|writing)(?: |$)/u.test(clause) ||
      /(?:^| )settings(?: +\w+){0,3} +(?:accepts?|accepted|modif(?:y|ied|ies)|overwrit(?:e|es|ing|ten)|persist(?:s|ed|ing)?|saved?|saving|stor(?:e|ed|es|ing)|writes?|writing|wrote)(?: +\w+){0,4} +(?:defaults?|edits?|preferences?|default +values?)(?: |$)/u.test(clause) ||
      /(?:^| )(?:current +)?(?:preferences?|settings)(?: +\w+){0,3} +(?:are|is|was|were|gets?|got)? *(?:committed|overwritten|persisted|recorded|saved|stored|updated|written)(?: |$)/u.test(clause) ||
      /(?:^| )(?:defaults?|default +values?)(?: +\w+){0,3} +(?:saved?|written)(?: +\w+){0,3} +by +settings(?: |$)/u.test(clause) ||
      /(?:^| )(?:settings +)?save(?: +\w+){0,3} +(?:accepts?|clicked|received)(?: +\w+){0,2} +clicks?(?: |$)/u.test(clause) ||
      /(?:^| )save(?: +\w+){0,3} +(?:was|is|gets?) +clicked(?: |$)/u.test(clause) ||
      /(?:^| )(?:settings +)?save(?: +\w+){0,3} +works?(?: |$)/u.test(clause) ||
      /(?:^| )settings(?: +\w+){0,3} +(?:has|have|keeps?|retains?|write) +write +access(?: +\w+){0,3} +(?:is|remains?|stays?)? *(?:available|enabled|open)?(?: |$)/u.test(clause) ||
      /(?:^| )(?:users? +can +)?(?:modify|overwrite)(?: +\w+){0,3} +settings(?: |$)/u.test(clause) ||
      /(?:^| )(?:settings +)?form(?: +\w+){0,3} +submit(?:s|ted|ting)?(?: |$)/u.test(clause) ||
      /(?:^| )(?:settings +)?form(?: +\w+){0,3} +accept(?:s|ed|ing)? +(?:changes?|edits?|input|writes?)(?: |$)/u.test(clause) ||
      /(?:^| )users?(?: +\w+){0,2} +(?:alter|change|edit|modify|update)(?: +\w+){0,2} +(?:preferences?|settings)(?: |$)/u.test(clause) ||
      /(?:^| )(?:current +)?settings(?: +\w+){0,3} +(?:are|is|was|were|gets?|got)? *(?:committed|overwritten|persisted|recorded|saved|stored|updated|written)(?: |$)/u.test(clause) ||
      /(?:^| )(?:clicking +)?save(?: +\w+){0,4} +(?:commits?|overwrites?|persists?|records?|stores?|writes?)(?: +\w+){0,3} +(?:defaults?|default +values?|preferences?)(?: |$)/u.test(clause) ||
      /(?:^| )(?:clicking +)?save(?: +\w+){0,4} +(?:commits?|overwrites?|persists?|records?|stores?|writes?)(?: +\w+){0,3} +(?:current +)?state(?: |$)/u.test(clause) ||
      /(?:^| )(?:the +)?form(?: +\w+){0,4} +(?:commits?|overwrites?|persists?|records?|stores?|writes?)(?: +\w+){0,3} +(?:defaults?|default +values?|preferences?)(?: |$)/u.test(clause) ||
      /(?:^| )(?:defaults?|default +values?|preferences?)(?: +\w+){0,4} +(?:committed|overwritten|persisted|recorded|stored|written)(?: +\w+){0,3} +by +save(?: |$)/u.test(clause) ||
      /(?:^| )(?:settings +)?saving(?: +\w+){0,3} +succeeds?(?: |$)/u.test(clause) ||
      /(?:^| )settings(?: +\w+){0,3} +continues? +accepting +(?:changes?|edits?|input)(?: |$)/u.test(clause) ||
      /(?:^| )(?:settings +)?(?:changes?|edits?|saves?|saving|writes?|writing)(?: +\w+){0,3} +continue(?:s|d|ing)?(?: |$)/u.test(clause) ||
      /(?:^| )settings(?: +\w+){0,3} +does +not +stop +(?:changes?|editing|edits?|input|saving|writes?)(?: |$)/u.test(clause) ||
      /(?:^| )(?:controls?|submit +button)(?: +\w+){0,4} +(?:accepts? +input|remain|remains|stay|stays)(?: +\w+){0,2} +(?:active|available|clickable|editable|enabled|open|usable|writable)(?: |$)/u.test(clause) ||
      /(?:^| )(?:controls?|submit +button)(?: +\w+){0,4} +accepts? +input(?: |$)/u.test(clause)
    const truthfulDisable = !enablingDoubleNegative && (
      /(?:^| )(?:cannot|disable(?:d|s|ing)?|must +not|not +allowed|not +permitted|prohibit(?:ed|s|ing)?)(?: +\w+){0,6} +(?:active|edit(?:ed|s|ing)?|persist(?:ed|s|ing)?|save(?:d|s|ing)?|writ(?:e|es|ing|ten))(?: |$)/u.test(clause) ||
      /(?:^| )(?:active|edit(?:ed|s|ing)?|persist(?:ed|s|ing)?|save(?:d|s|ing)?|writ(?:e|es|ing|ten))(?: +\w+){0,5} +(?:disabled|prohibited)(?: |$)/u.test(clause) ||
      /(?:^| )(?:settings|controls?|save)(?: +\w+){0,4} +does +not +allow(?: +\w+){0,3} +(?:editing|edits?|saving|writes?|writing)(?: |$)/u.test(clause)
      || /^(?:no|zero) +(?:settings +)?(?:changes?|edits?|saves?|writes?)(?: +\w+){0,3} +(?:are|is) +allowed(?: |$)/u.test(clause)
    )
    assert(
      !(settingsContext && unresolvedAuthority && unsafeStateAction && !truthfulDisable),
      `${label} allows Settings to edit or save defaults before authoritative restoration completes: ${JSON.stringify(clause)}`
    )
  }
}

const validateNoGraduatedNarrativeClaims = (source, label) => {
  const graduationActor = "(?:plan(?: 009)?|this migration draft|this migration plan|this draft|this plan|this packet|the packet|the migration decision|the migration draft|the migration plan|the migration|migration|implementation|the implementation)"
  const graduatedState = "(?:done|final|approved|accepted|authorized|cleared|ready|complete|completed|completion|certified|implementation-authorized|production-ready|final status)"
  assert(
    !new RegExp(`\\b${graduationActor}\\b\\s+(?:is|was|has been|had been|became|becomes|remains|:)\\s*(?!not\\b)(?:now\\s+)?${graduatedState}\\b`, "iu").test(source),
    `${label} contains a narrative graduated-state claim`
  )
  assert(
    !new RegExp(`\\b${graduationActor}\\b[^\\n.!?]{0,40}\\b(?:has reached|had reached|reached|achieved|attained|entered)\\s+(?:a\\s+|the\\s+)?${graduatedState}\\b`, "iu").test(source),
    `${label} contains a narrative graduated-state claim`
  )
}

const validateNoHumanGateClaims = (source, label) => {
  assert(!/HUMAN-APPROVAL-V1/iu.test(source), `${label} contains a non-Codex authorization interface`)
  assert(
    !/\b(?:human approval|human review(?:er)?|human sign[- ]?off|human selector|human decision owner)\b[^\n]{0,50}\b(?:required|approved|accepted|complete|completed|granted|provided|supplied|passed|received|issued)\b/iu.test(source),
    `${label} contains an affirmative human gate or approval claim`
  )
  assert(
    !/\b(?:a\s+)?human reviewer\b[^\n]{0,40}\b(?:approved|accepted|completed|signed off)\b/iu.test(source),
    `${label} contains an affirmative human-review claim`
  )
  assert(
    !/\bhumans\b[^\n]{0,40}\b(?:approved|accepted|completed|signed off|authorized|cleared)\b/iu.test(source),
    `${label} contains an affirmative human-review claim`
  )
  assert(
    !/\bcodex agents?\s+(?:count|counts|are counted|qualify|serve)\s+as\s+humans?\b/iu.test(source),
    `${label} counts Codex agents as humans`
  )
}

const validateNoBoundUpstreamCoordinates = (source, label) => {
  assert(
    !/\b(?:step\s*0?[2-5]\b[^\n]{0,80}?\b(?:decision|merge|sha|commit|coordinate|ref|attestation)\b|(?:decision|merge|attestation)\s+(?:sha|commit|coordinate|ref)\b)[^\n]{0,80}?\b[0-9a-f]{4,64}\b/iu.test(source),
    `${label} contains a bound or invented upstream coordinate`
  )
}

const validateNoAffirmativeEvidenceClaims = (source, label, { allowExactSettingsRaceObservation = false } = {}) => {
  assert(!/&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);/iu.test(source), `${label} cannot encode claims with HTML entities`)
  const candidates = [
    [source, label, true],
    [semanticClaimProjection(source), `${label} comment-preserving semantic projection`, false],
    [semanticClaimProjection(source, { preserveCommentBodies: false }), `${label} comment-eliding semantic projection`, false]
  ]
  for (const [candidate, candidateLabel, projectSemantic] of candidates) {
    validateNoGraduatedNarrativeClaims(candidate, candidateLabel)
    validateNoHumanGateClaims(candidate, candidateLabel)
    validateNoBoundUpstreamCoordinates(candidate, candidateLabel)
    validateNoUnsafeRollbackClaims(candidate, candidateLabel)
    if (!allowExactSettingsRaceObservation) validateNoSettingsRestorationContradictions(candidate, candidateLabel)
    validateNoAffirmativeAuthorization(candidate, candidateLabel, { projectSemantic })
    assert(
      !/\bparticipant evidence (?:is )?(?:present|nonzero|complete|completed|accepted|approved)\b/iu.test(candidate),
      `${candidateLabel} contains an affirmative participant-evidence claim`
    )
    assert(
      !/\bhuman evidence (?:is )?(?:present|nonzero|complete|completed|accepted|approved)\b/iu.test(candidate),
      `${candidateLabel} contains an affirmative human-evidence claim`
    )
  }
}

const validateDecodedStringClaims = (value, label, path = [], allowedShaLiterals = []) => {
  if (typeof value === "string") {
    const location = `${label}.${path.join(".") || "root"}`
    validateNoInvalidatedReviewIdentifiers(value, location)
    const exactSettingsRaceObservation = path.length === 3 &&
      path[0] === "knownPreMigrationConfounders" && path[1] === "3" && path[2] === "observedFact" &&
      value === exactSettingsRaceObservedFact
    if (!isClosedStructuralSemanticEnum(path, value)) {
      validateNoAffirmativeEvidenceClaims(value, location, {
        allowExactSettingsRaceObservation: exactSettingsRaceObservation
      })
    }
    validateNoUnexpectedShaLiterals(value, location, { allowedLiterals: allowedShaLiterals })
    validateNoUnexpectedShaLiterals(semanticClaimProjection(value), `${location} semantic projection`, {
      allowedLiterals: allowedShaLiterals
    })
    validateNoUnexpectedShaLiterals(
      semanticClaimProjection(value, { preserveCommentBodies: false }),
      `${location} comment-eliding semantic projection`,
      { allowedLiterals: allowedShaLiterals }
    )
    return
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => validateDecodedStringClaims(entry, label, [...path, String(index)], allowedShaLiterals))
    return
  }
  if (value === null || typeof value !== "object") return
  for (const [key, entry] of Object.entries(value)) {
    validateDecodedStringClaims(entry, label, [...path, key], allowedShaLiterals)
  }
}

const validatePathShape = (path, label) => {
  assertNonEmptyString(path, label)
  assert(!path.startsWith("/"), `${label} must be repository-relative`)
  assert(!path.includes("\\"), `${label} must use forward slashes`)
  assert(!/^[a-z][a-z0-9+.-]*:/iu.test(path), `${label} must not be a URL`)
  assert(!/[?*\[\]{}]/u.test(path), `${label} must not contain a glob`)
  assert(posix.normalize(path) === path, `${label} must be normalized`)
  assert(!path.split("/").some((part) => part === "." || part === ".." || part.length === 0), `${label} has an unsafe segment`)
}

const validateTrackedBlob = async (path) => {
  const tree = git(["ls-tree", observedAtSha, "--", path]).stdout.trim()
  assert(tree.length > 0, `${path} is not tracked at observedAtSha`)
  const match = tree.match(/^(\d{6})\s+blob\s+[0-9a-f]{40}\t(.+)$/u)
  assert(match !== null && match[2] === path, `${path} is not a regular tracked blob at observedAtSha`)
  assert(match[1] === "100644" || match[1] === "100755", `${path} has unsupported Git mode ${match[1]}`)
  const stats = await lstat(resolve(repositoryRoot, path))
  assert(stats.isFile() && !stats.isSymbolicLink(), `${path} must be a current regular non-symlink file`)
}

const criticalFileRecordProjection = (record) => ({
  path: record.path,
  areas: record.areas,
  role: record.role,
  migrationSeam: record.migrationSeam,
  authority: record.authority,
  trancheOwnership: record.trancheOwnership ?? null
})

const validateCriticalFileRecordContracts = (records) => {
  const recordsByPath = new Map(records.map((record) => [record?.path, record]))
  const projection = criticalAnchors.map((path) => {
    const record = recordsByPath.get(path)
    assert(record !== undefined, `critical topology anchor missing: ${path}`)
    return criticalFileRecordProjection(record)
  })
  const digest = createHash("sha256").update(JSON.stringify(projection), "utf8").digest("hex")
  assert(
    digest === criticalFileRecordContractSha256,
    `critical topology contract digest differs: expected ${criticalFileRecordContractSha256}; received ${digest}`
  )
}

const extractRouteIds = (source) => {
  const block = source.match(/CANONICAL_ROUTE_IDS\s*=\s*\[([\s\S]*?)\]\s*as const/u)
  assert(block !== null, "route registry array could not be parsed")
  return [...block[1].matchAll(/"([^"]+)"/gu)].map((match) => match[1])
}

const extractDatabaseStores = (source) => {
  const block = source.match(/appDatabaseStores\s*=\s*\{([\s\S]*?)\}\s*as const/u)
  assert(block !== null, "appDatabaseStores could not be parsed")
  return [...block[1].matchAll(/:\s*"([^"]+)"/gu)].map((match) => match[1])
}

const validateDependencySlots = (slots) => {
  assert(Array.isArray(slots), "dependencySlots must be an array")
  assert(slots.length === requiredDependencyIds.length, `dependencySlots must contain ${requiredDependencyIds.length} entries`)
  const exactKeys = [
    "id",
    "sourcePlan",
    "purpose",
    "canonicalConsumers",
    "coordinateKind",
    "participantEvidence",
    "decisionStatus",
    "requiredDependencyShas",
    "upstreamInputRef",
    "artifactSha256ByPath",
    "externalEvidenceId",
    "status",
    "mustRebaseAndReverify"
  ]
  const ids = []
  for (const [index, slot] of slots.entries()) {
    const label = `dependencySlots[${index}]`
    assertExactKeys(slot, exactKeys, label)
    ids.push(slot.id)
    assertNonEmptyString(slot.id, `${label}.id`)
    const contract = requiredDependencyContracts[slot.id]
    assert(contract !== undefined, `${label}.id is not a required dependency contract`)
    assert(slot.purpose === contract.purpose, `${label}.purpose differs from the required slot contract`)
    assert(slot.sourcePlan === contract.sourcePlan, `${label}.sourcePlan differs from the required slot contract`)
    assert(
      JSON.stringify(slot.canonicalConsumers) === JSON.stringify(contract.canonicalConsumers),
      `${label}.canonicalConsumers differ from the required slot contract`
    )
    if (slot.sourcePlan !== null) {
      validatePathShape(slot.sourcePlan, `${label}.sourcePlan`)
      assert(
        /^100644 blob [0-9a-f]{40}\t/u.test(git(["ls-tree", observedAtSha, "--", slot.sourcePlan]).stdout),
        `${label}.sourcePlan is not a tracked regular plan at observedAtSha`
      )
    }
    assert(Array.isArray(slot.canonicalConsumers), `${label}.canonicalConsumers must be an array`)
    for (const [consumerIndex, consumer] of slot.canonicalConsumers.entries()) {
      validatePathShape(consumer, `${label}.canonicalConsumers[${consumerIndex}]`)
    }
    assert(
      slot.coordinateKind === contract.coordinateKind,
      `${label}.coordinateKind differs from the required slot contract`
    )
    assert(slot.participantEvidence === "none", `${label}.participantEvidence must remain none`)
    assert(slot.decisionStatus === "pending", `${label}.decisionStatus must remain pending`)
    assert(slot.requiredDependencyShas === null, `${label}.requiredDependencyShas must remain null`)
    assert(slot.upstreamInputRef === null, `${label}.upstreamInputRef must remain null`)
    assert(slot.artifactSha256ByPath === null, `${label}.artifactSha256ByPath must remain null`)
    assert(slot.externalEvidenceId === null, `${label}.externalEvidenceId must remain null`)
    assert(slot.status === "provisional-prework", `${label}.status must remain provisional-prework`)
    assert(slot.mustRebaseAndReverify === true, `${label}.mustRebaseAndReverify must remain true`)
  }
  assert(JSON.stringify(ids) === JSON.stringify(requiredDependencyIds), "dependency slot IDs or ordering differ")
}

const validateFileRecords = async (records, { checkGit = true } = {}) => {
  assert(Array.isArray(records) && records.length >= 50, "fileRecords must contain at least 50 load-bearing tracked files")
  const paths = new Set()
  const coveredAreas = new Set()
  for (const [index, record] of records.entries()) {
    const label = `fileRecords[${index}]`
    assert(record !== null && typeof record === "object" && !Array.isArray(record), `${label} must be an object`)
    const exactKeys = Object.hasOwn(requiredFileRecordContracts, record.path)
      ? ["path", "areas", "role", "migrationSeam", "trancheOwnership", "authority"]
      : ["path", "areas", "role", "migrationSeam", "authority"]
    assertExactKeys(record, exactKeys, label)
    validatePathShape(record.path, `${label}.path`)
    assert(!paths.has(record.path), `fileRecords contains duplicate path ${record.path}`)
    paths.add(record.path)
    assert(Array.isArray(record.areas) && record.areas.length > 0, `${label}.areas must be non-empty`)
    assert(new Set(record.areas).size === record.areas.length, `${label}.areas contains duplicates`)
    for (const area of record.areas) {
      assert(requiredAreas.includes(area), `${label}.areas contains unknown area ${area}`)
      coveredAreas.add(area)
    }
    assertNonEmptyString(record.role, `${label}.role`)
    assertNonEmptyString(record.migrationSeam, `${label}.migrationSeam`)
    if (Object.hasOwn(requiredFileRecordContracts, record.path)) {
      assertStringArray(record.trancheOwnership, `${label}.trancheOwnership`, { unique: true })
    }
    assert(allowedAuthorities.has(record.authority), `${label}.authority is unknown: ${record.authority}`)
    if (checkGit) await validateTrackedBlob(record.path)
  }
  for (const area of requiredAreas) assert(coveredAreas.has(area), `topology area ${area} has no file record`)
  for (const path of criticalAnchors) assert(paths.has(path), `critical topology anchor missing: ${path}`)
  validateCriticalFileRecordContracts(records)
  for (const [path, expected] of Object.entries(requiredFileRecordContracts)) {
    const record = records.find((entry) => entry.path === path)
    assert(record !== undefined, `required file-record contract missing: ${path}`)
    assert(JSON.stringify(record) === JSON.stringify(expected), `required file-record contract differs: ${path}`)
  }
}

const assertStringArray = (value, label, { allowEmpty = false, unique = false } = {}) => {
  assert(Array.isArray(value), `${label} must be an array`)
  if (!allowEmpty) assert(value.length > 0, `${label} must be non-empty`)
  value.forEach((entry, index) => assertNonEmptyString(entry, `${label}[${index}]`))
  if (unique) assert(new Set(value).size === value.length, `${label} must not contain duplicates`)
}

const validateAuthorizationModel = (value) => {
  assertExactKeys(
    value,
    [
      "interfaceId",
      "researchReviewDecisionSignoff",
      "humanEvidence",
      "humanParticipantCount",
      "notHumanUsabilityTested",
      "agentsCountAsHumans",
      "humanUiUxApprovalArtifactRequired",
      "requiredEvidence",
      "productionDeploymentControls",
      "productionDeploymentStatus",
      "productionDeploymentScope",
      "liveEnvironmentReviewerType",
      "codexOnlyMaySatisfyLiveEnvironmentReview",
      "liveEnvironmentChangeAuthorization",
      "productionAuthorization"
    ],
    "authorizationModel"
  )
  assert(value.interfaceId === "CODEX-ONLY-UIUX-V1", "authorization interface differs")
  assert(value.researchReviewDecisionSignoff === "codex-only", "research/review/decision/sign-off must remain Codex-only")
  assert(value.humanEvidence === "none", "authorizationModel.humanEvidence must remain none")
  assert(value.humanParticipantCount === 0, "authorizationModel.humanParticipantCount must remain 0")
  assert(value.notHumanUsabilityTested === true, "authorizationModel.notHumanUsabilityTested must remain true")
  assert(value.agentsCountAsHumans === false, "Codex agents cannot be counted as humans")
  assert(value.humanUiUxApprovalArtifactRequired === false, "human UI/UX approval artifacts cannot be required")
  assert(
    JSON.stringify(value.requiredEvidence) === JSON.stringify([
      "exact-repository-attested-step-02-through-step-05-decision-shas",
      "independent-codex-subagent-review-records",
      "exact-ci-certification-record"
    ]),
    "authorizationModel.requiredEvidence differs"
  )
  assert(value.productionDeploymentControls === "separate-technical-gates-including-live-user-reviewer", "production deployment controls differ")
  assert(value.productionDeploymentStatus === "blocked-live-user-reviewer", "production deployment status differs")
  assert(value.productionDeploymentScope === "out-of-scope", "production deployment scope differs")
  assert(value.liveEnvironmentReviewerType === "User", "live Environment reviewer type differs")
  assert(value.codexOnlyMaySatisfyLiveEnvironmentReview === false, "Codex-only review cannot satisfy the live User reviewer")
  assert(value.liveEnvironmentChangeAuthorization === "separate-required", "live Environment changes require separate authorization")
  assert(value.productionAuthorization === false, "authorization model cannot authorize production")
}

const validateUpstreamDecisionInputs = (inputs) => {
  assert(Array.isArray(inputs) && inputs.length === 4, "upstreamDecisionInputs must contain only Step 02 through Step 05")
  const exactKeys = [
    "stepId",
    "acceptanceInterface",
    "scopeBinding",
    "decisionStatus",
    "acceptedDecisionSha",
    "mergeCommitSha",
    "ciRunId",
    "ciHeadSha",
    "independentReviewRecordSha256",
    "mustRebaseAndReverify"
  ]
  const expectedIds = ["step-02", "step-03", "step-04", "step-05"]
  for (const [index, input] of inputs.entries()) {
    const label = `upstreamDecisionInputs[${index}]`
    assertExactKeys(input, exactKeys, label)
    assert(input.stepId === expectedIds[index], `${label}.stepId differs`)
    assert(input.acceptanceInterface === "CODEX-ONLY-UIUX-V1", `${label}.acceptanceInterface differs`)
    assert(
      input.scopeBinding === "resolve-from-the-accepted-repository-attestation-only-after-landing",
      `${label}.scopeBinding differs`
    )
    assert(input.decisionStatus === "pending", `${label}.decisionStatus must remain pending`)
    for (const key of ["acceptedDecisionSha", "mergeCommitSha", "ciRunId", "ciHeadSha", "independentReviewRecordSha256"]) {
      assert(input[key] === null, `${label}.${key} must remain null`)
    }
    assert(input.mustRebaseAndReverify === true, `${label}.mustRebaseAndReverify must remain true`)
  }
}

const sha256Utf8 = (value) => createHash("sha256").update(value, "utf8").digest("hex")

const encodeUtf8Evidence = (value) => ({
  encoding: "base64",
  byteLength: Buffer.byteLength(value, "utf8"),
  sha256: sha256Utf8(value),
  bytes: Buffer.from(value, "utf8").toString("base64")
})

const decodeUtf8Evidence = (value, label) => {
  assertExactKeys(value, ["encoding", "byteLength", "sha256", "bytes"], label)
  assert(value.encoding === "base64", `${label}.encoding must be base64`)
  assert(Number.isSafeInteger(value.byteLength) && value.byteLength > 0, `${label}.byteLength must be a positive safe integer`)
  assert(/^[0-9a-f]{64}$/u.test(value.sha256), `${label}.sha256 must be a lowercase SHA-256`)
  assert(typeof value.bytes === "string" && value.bytes.length > 0, `${label}.bytes must be non-empty canonical base64`)
  const decoded = Buffer.from(value.bytes, "base64")
  assert(decoded.toString("base64") === value.bytes, `${label}.bytes is not canonical base64`)
  assert(decoded.length === value.byteLength, `${label}.byteLength differs from decoded bytes`)
  assert(createHash("sha256").update(decoded).digest("hex") === value.sha256, `${label}.sha256 differs from decoded bytes`)
  const utf8 = decoded.toString("utf8")
  assert(Buffer.from(utf8, "utf8").equals(decoded), `${label}.bytes is not canonical UTF-8`)
  return utf8
}

const sourceManifestSha256 = (intervals) => sha256Utf8(JSON.stringify(intervals))

const codexReviewResultPayload = (entry) => ({
  protocol: "PLAN009-NATIVE-CODEX-REVIEW-RESULT-V1",
  taskId: entry.taskId,
  reviewOccurrenceId: entry.reviewOccurrenceId,
  reviewKind: entry.reviewKind,
  reviewedCommitSha: entry.reviewedCommitSha,
  reviewedBaseSha: entry.reviewedBaseSha,
  reviewedPacketBlobs: entry.reviewedPacketBlobs,
  reviewedSourceManifestSha256: entry.reviewedSourceManifestSha256,
  disposition: entry.disposition,
  findingIds: entry.findingIds,
  findingSummary: entry.findingSummary,
  evidencePaths: entry.evidencePaths,
  dissent: entry.dissent
})

const codexReviewPromptUtf8 = (entry, task) => JSON.stringify({
  protocol: "PLAN009-NATIVE-CODEX-REVIEW-PROMPT-V1",
  taskId: entry.taskId,
  reviewOccurrenceId: entry.reviewOccurrenceId,
  reviewKind: entry.reviewKind,
  rubricId: entry.rubricId,
  rubric: task.reviewRubricUtf8,
  rubricSha256: sha256Utf8(task.reviewRubricUtf8),
  reviewedCommitSha: entry.reviewedCommitSha,
  reviewedBaseSha: entry.reviewedBaseSha,
  reviewedPacketBlobs: entry.reviewedPacketBlobs,
  reviewedSourceIntervals: entry.reviewedSourceIntervals,
  reviewedSourceManifestSha256: entry.reviewedSourceManifestSha256,
  requiredResult: {
    encoding: "one-line-canonical-json-no-markdown",
    protocol: "PLAN009-NATIVE-CODEX-REVIEW-RESULT-V1",
    disposition: "no-blocking-findings-on-exact-subject",
    requiredFields: Object.keys(codexReviewResultPayload(entry))
  },
  constraints: [
    "read-only",
    "exact-subject-only",
    "no-hidden-reasoning",
    "no-human-contact",
    "no-production-authorization",
    "return-blocking-findings-instead-of-attesting-if-any-exist"
  ]
})

const codexReviewPayload = (entry) => ({
  taskId: entry.taskId,
  reviewOccurrenceId: entry.reviewOccurrenceId,
  reviewKind: entry.reviewKind,
  rubricId: entry.rubricId,
  reviewedCommitSha: entry.reviewedCommitSha,
  reviewedBaseSha: entry.reviewedBaseSha,
  reviewedPacketBlobs: entry.reviewedPacketBlobs,
  reviewedSourceIntervals: entry.reviewedSourceIntervals,
  reviewedSourceManifestSha256: entry.reviewedSourceManifestSha256,
  nativeEvidence: entry.nativeEvidence,
  findingIds: entry.findingIds,
  findingSummary: entry.findingSummary,
  evidencePaths: entry.evidencePaths,
  disposition: entry.disposition,
  consensus: entry.consensus,
  dissent: entry.dissent
})

const createCanonicalCodexReviewFixture = () => requiredCodexReviewTasks.map((task, index) => {
  const reviewedSourceIntervals = Object.fromEntries(packetPaths.map((path, pathIndex) => {
    const bytes = Buffer.from(`synthetic-reviewed-source-${index + 1}-${pathIndex + 1}`, "utf8")
    return [path, {
      startByte: 0,
      endByte: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex")
    }]
  }))
  const entry = {
    taskId: task.taskId,
    reviewOccurrenceId: task.reviewOccurrenceId,
    reviewKind: task.reviewKind,
    rubricId: task.rubricId,
    reviewedCommitSha: "1".repeat(40),
    reviewedBaseSha: reviewSubjectBaseSha,
    reviewedPacketBlobs: Object.fromEntries(packetPaths.map((path, pathIndex) => [path, String(pathIndex + 2).repeat(40)])),
    reviewedSourceIntervals,
    reviewedSourceManifestSha256: sourceManifestSha256(reviewedSourceIntervals),
    findingIds: [`SELF-TEST-${index + 1}`],
    findingSummary: "Synthetic no-blocker result used only by validator self-tests.",
    evidencePaths: [...packetPaths],
    disposition: "no-blocking-findings-on-exact-subject",
    consensus: "root-and-independent-rereviews-agree",
    dissent: "none-recorded-for-exact-subject"
  }
  const nativeEvidence = {
    allocationPrompt: encodeUtf8Evidence(nativeAllocationPromptUtf8),
    spawnReceipt: encodeUtf8Evidence(JSON.stringify({ task_name: task.taskId })),
    allocationResult: encodeUtf8Evidence(task.nativeAllocationResultUtf8),
    reviewRubric: encodeUtf8Evidence(task.reviewRubricUtf8),
    reviewPrompt: encodeUtf8Evidence(codexReviewPromptUtf8(entry, task)),
    reviewResult: encodeUtf8Evidence(JSON.stringify(codexReviewResultPayload(entry)))
  }
  const payload = { ...entry, nativeEvidence }
  return {
    ...payload,
    recordSha256: sha256Utf8(JSON.stringify(codexReviewPayload(payload)))
  }
})

const validateReviewSourceBindings = (entry, label) => {
  assert(git(["cat-file", "-e", `${entry.reviewedCommitSha}^{commit}`], { allowFailure: true }).status === 0, `${label}.reviewedCommitSha is not a reachable commit`)
  for (const path of packetPaths) {
    const tree = git(["ls-tree", entry.reviewedCommitSha, "--", path]).stdout.trim()
    const match = tree.match(/^100644\s+blob\s+([0-9a-f]{40})\t(.+)$/u)
    assert(match !== null && match[2] === path, `${label}.${path} is not an exact 100644 reviewed blob`)
    assert(match[1] === entry.reviewedPacketBlobs[path], `${label}.${path} reviewed Git blob differs`)
    const result = spawnSync("git", ["cat-file", "blob", match[1]], {
      cwd: repositoryRoot,
      stdio: ["ignore", "pipe", "pipe"]
    })
    if (result.error !== undefined) throw result.error
    assert(result.status === 0, `${label}.${path} reviewed blob bytes are unavailable`)
    const bytes = result.stdout
    const interval = entry.reviewedSourceIntervals[path]
    assert(interval.startByte === 0 && interval.endByte === bytes.length, `${label}.${path} must bind the full source byte interval`)
    assert(createHash("sha256").update(bytes).digest("hex") === interval.sha256, `${label}.${path} source interval SHA-256 differs`)
  }
}

const validateCodexReviewLedger = (entries, { verifySourceBindings = false } = {}) => {
  assert(Array.isArray(entries), "codexReviewLedger must be an array")
  assert(
    entries.length === 0 || entries.length === requiredCodexReviewTasks.length,
    "codexReviewLedger must be pending or contain all independent reviews"
  )
  const exactKeys = [
    "taskId",
    "reviewOccurrenceId",
    "reviewKind",
    "rubricId",
    "reviewedCommitSha",
    "reviewedBaseSha",
    "reviewedPacketBlobs",
    "reviewedSourceIntervals",
    "reviewedSourceManifestSha256",
    "nativeEvidence",
    "findingIds",
    "findingSummary",
    "evidencePaths",
    "disposition",
    "consensus",
    "dissent",
    "recordSha256"
  ]
  const hashes = []
  for (const [index, entry] of entries.entries()) {
    const label = `codexReviewLedger[${index}]`
    assertExactKeys(entry, exactKeys, label)
    validateNoInvalidatedReviewIdentifiers(JSON.stringify(entry), label)
    const expected = requiredCodexReviewTasks[index]
    const payload = codexReviewPayload(entry)
    assert(entry.taskId === requiredCodexReviewTasks[index].taskId, `${label}.taskId differs`)
    assert(entry.reviewKind === requiredCodexReviewTasks[index].reviewKind, `${label}.reviewKind differs`)
    assert(entry.reviewOccurrenceId === expected.reviewOccurrenceId, `${label}.reviewOccurrenceId differs`)
    assert(entry.rubricId === expected.rubricId, `${label}.rubricId differs`)
    assert(/^[0-9a-f]{40}$/u.test(entry.reviewedCommitSha), `${label}.reviewedCommitSha must be a full lowercase Git SHA`)
    assert(!invalidatedReviewSubjectShas.includes(entry.reviewedCommitSha), `${label}.reviewedCommitSha names an invalidated review subject`)
    assert(entry.reviewedBaseSha === reviewSubjectBaseSha, `${label}.reviewedBaseSha differs from the integrated current-main subject base`)
    assertExactKeys(entry.reviewedPacketBlobs, packetPaths, `${label}.reviewedPacketBlobs`)
    assert(
      JSON.stringify(Object.keys(entry.reviewedPacketBlobs)) === JSON.stringify(packetPaths),
      `${label}.reviewedPacketBlobs must use canonical packet-path order`
    )
    for (const path of packetPaths) {
      assert(/^[0-9a-f]{40}$/u.test(entry.reviewedPacketBlobs[path]), `${label}.reviewedPacketBlobs[${path}] is invalid`)
      assert(
        !invalidatedReviewProvenanceRegistry.packetBlobShas.includes(entry.reviewedPacketBlobs[path]),
        `${label}.reviewedPacketBlobs[${path}] names a retired or rejected packet blob`
      )
    }
    assertExactKeys(entry.reviewedSourceIntervals, packetPaths, `${label}.reviewedSourceIntervals`)
    assert(
      JSON.stringify(Object.keys(entry.reviewedSourceIntervals)) === JSON.stringify(packetPaths),
      `${label}.reviewedSourceIntervals must use canonical packet-path order`
    )
    for (const path of packetPaths) {
      const interval = entry.reviewedSourceIntervals[path]
      assertExactKeys(interval, ["startByte", "endByte", "sha256"], `${label}.reviewedSourceIntervals[${path}]`)
      assert(interval.startByte === 0, `${label}.reviewedSourceIntervals[${path}].startByte must be 0`)
      assert(Number.isSafeInteger(interval.endByte) && interval.endByte > 0, `${label}.reviewedSourceIntervals[${path}].endByte must be positive`)
      assert(/^[0-9a-f]{64}$/u.test(interval.sha256), `${label}.reviewedSourceIntervals[${path}].sha256 is invalid`)
    }
    assert(/^[0-9a-f]{64}$/u.test(entry.reviewedSourceManifestSha256), `${label}.reviewedSourceManifestSha256 is invalid`)
    assert(
      entry.reviewedSourceManifestSha256 === sourceManifestSha256(entry.reviewedSourceIntervals),
      `${label}.reviewedSourceManifestSha256 differs from its canonical intervals`
    )
    assertExactKeys(
      entry.nativeEvidence,
      ["allocationPrompt", "spawnReceipt", "allocationResult", "reviewRubric", "reviewPrompt", "reviewResult"],
      `${label}.nativeEvidence`
    )
    const allocationPrompt = decodeUtf8Evidence(entry.nativeEvidence.allocationPrompt, `${label}.nativeEvidence.allocationPrompt`)
    const spawnReceipt = decodeUtf8Evidence(entry.nativeEvidence.spawnReceipt, `${label}.nativeEvidence.spawnReceipt`)
    const allocationResult = decodeUtf8Evidence(entry.nativeEvidence.allocationResult, `${label}.nativeEvidence.allocationResult`)
    const reviewRubric = decodeUtf8Evidence(entry.nativeEvidence.reviewRubric, `${label}.nativeEvidence.reviewRubric`)
    const reviewPrompt = decodeUtf8Evidence(entry.nativeEvidence.reviewPrompt, `${label}.nativeEvidence.reviewPrompt`)
    const reviewResult = decodeUtf8Evidence(entry.nativeEvidence.reviewResult, `${label}.nativeEvidence.reviewResult`)
    assert(allocationPrompt === nativeAllocationPromptUtf8, `${label} native allocation prompt bytes differ`)
    assert(spawnReceipt === JSON.stringify({ task_name: expected.taskId }), `${label} native spawn receipt bytes differ`)
    assert(allocationResult === expected.nativeAllocationResultUtf8, `${label} native allocation result bytes differ`)
    assert(reviewRubric === expected.reviewRubricUtf8, `${label} review rubric bytes differ`)
    assert(reviewPrompt === codexReviewPromptUtf8(entry, expected), `${label} exact review prompt bytes differ`)
    assertStringArray(entry.findingIds, `${label}.findingIds`, { unique: true })
    assertNonEmptyString(entry.findingSummary, `${label}.findingSummary`)
    assertStringArray(entry.evidencePaths, `${label}.evidencePaths`, { unique: true })
    assert(entry.disposition === "no-blocking-findings-on-exact-subject", `${label}.disposition differs`)
    assert(entry.consensus === "root-and-independent-rereviews-agree", `${label}.consensus differs`)
    assert(entry.dissent === "none-recorded-for-exact-subject", `${label}.dissent differs`)
    const result = parseJsonNoDuplicateKeys(reviewResult, `${label}.nativeEvidence.reviewResult decoded JSON`)
    assert(reviewResult === JSON.stringify(result), `${label} native review result must be one-line canonical JSON`)
    assert(
      JSON.stringify(result) === JSON.stringify(codexReviewResultPayload(entry)),
      `${label} native review result differs from the attested finding fields`
    )
    for (const [findingIndex, findingId] of entry.findingIds.entries()) {
      validateNoInvalidatedReviewIdentifiers(findingId, `${label}.findingIds[${findingIndex}]`)
      validateNoAffirmativeEvidenceClaims(findingId, `${label}.findingIds[${findingIndex}]`)
    }
    validateNoInvalidatedReviewIdentifiers(entry.findingSummary, `${label}.findingSummary`)
    validateNoAffirmativeEvidenceClaims(entry.findingSummary, `${label}.findingSummary`)
    validateNoInvalidatedReviewIdentifiers(entry.dissent, `${label}.dissent`)
    validateNoAffirmativeEvidenceClaims(entry.dissent, `${label}.dissent`)
    assert(/^[0-9a-f]{64}$/u.test(entry.recordSha256), `${label}.recordSha256 must be a lowercase SHA-256`)
    const actualHash = createHash("sha256").update(JSON.stringify(payload), "utf8").digest("hex")
    assert(entry.recordSha256 === actualHash, `${label}.recordSha256 differs from its canonical payload`)
    if (verifySourceBindings) validateReviewSourceBindings(entry, label)
    hashes.push(actualHash)
  }
  return hashes
}

const incrementCount = (counts, literal, amount = 1) => {
  counts.set(literal, (counts.get(literal) ?? 0) + amount)
}

const reviewShaCounts = (entries) => {
  const counts = new Map()
  for (const entry of entries) {
    incrementCount(counts, entry.reviewedCommitSha)
    for (const path of packetPaths) incrementCount(counts, entry.reviewedPacketBlobs[path])
    for (const path of packetPaths) incrementCount(counts, entry.reviewedSourceIntervals[path].sha256)
    incrementCount(counts, entry.reviewedSourceManifestSha256)
    for (const evidence of Object.values(entry.nativeEvidence)) incrementCount(counts, evidence.sha256)
    incrementCount(counts, entry.recordSha256)
  }
  return counts
}

const codexReviewMarkerStem = ["PLAN", "009", "CODEX", "REVIEW", "RECORDS"].join("_")
const planReviewStart = `<!-- ${codexReviewMarkerStem}_START -->`
const planReviewEnd = `<!-- ${codexReviewMarkerStem}_END -->`

const locateDelimitedReviewBlock = (source, startMarker, endMarker, label) => {
  const starts = [...source.matchAll(new RegExp(`^${startMarker.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}$`, "gmu"))]
  const ends = [...source.matchAll(new RegExp(`^${endMarker.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}$`, "gmu"))]
  assert(starts.length === 1 && ends.length === 1, `${label} must contain exactly one review-record block`)
  assert(ends[0].index > starts[0].index, `${label} review-record block is out of order`)
  const end = ends[0].index + endMarker.length
  return { start: starts[0].index, end }
}

const extractDelimitedReviewBlock = (source, startMarker, endMarker, label) => {
  const range = locateDelimitedReviewBlock(source, startMarker, endMarker, label)
  return source.slice(range.start, range.end)
}

const normalizeDelimitedReviewBlock = (source, startMarker, endMarker, label) => {
  const range = locateDelimitedReviewBlock(source, startMarker, endMarker, label)
  return `${source.slice(0, range.start)}${startMarker}\n<CODEX_REVIEW_RECORDS_EXCLUDED>\n${endMarker}${source.slice(range.end)}`
}

const renderPlanReviewBlock = (entries) => {
  const introduction = entries.length === 0
    ? "The current immutable-subject independent Codex reviews are pending. This block\nwill be populated only after the repaired packet is committed, reviewed by\nexact commit and packet blob hashes, and found free of unresolved dissent."
    : "Independent Codex review evidence for this immutable subject is recorded\nwithout hidden reasoning in `codexReviewLedger`. Each result binds native\nallocation/prompt/result bytes, the exact review occurrence, subject/base\ncommits, all three packet Git blobs, and their full source byte intervals."
  const rows = entries.map((entry) =>
    `| \`${entry.taskId}\` | No blocking findings on exact subject | Root and independent rereviews agree / none recorded for exact subject | \`${entry.recordSha256}\` |`
  )
  return [
    planReviewStart,
    introduction,
    "",
    "| Codex task ID | Disposition | Consensus / dissent | Record SHA-256 |",
    "|---|---|---|---|",
    ...rows,
    planReviewEnd
  ].join("\n")
}

const locateMapReviewRecords = (raw) => {
  parseJsonNoDuplicateKeys(raw, "review-subject map")
  const marker = '  "codexReviewLedger": '
  const markerIndex = raw.indexOf(marker)
  assert(markerIndex !== -1 && raw.indexOf(marker, markerIndex + marker.length) === -1, "map must contain one canonical codexReviewLedger field")
  const start = markerIndex + marker.length
  assert(raw[start] === "[", "map codexReviewLedger must use a canonical array value")
  let depth = 0
  let inString = false
  let escaped = false
  let end = -1
  for (let index = start; index < raw.length; index += 1) {
    const character = raw[index]
    if (inString) {
      if (escaped) {
        escaped = false
      } else if (character === "\\") {
        escaped = true
      } else if (character === '"') {
        inString = false
      }
      continue
    }
    if (character === '"') {
      inString = true
      continue
    }
    if (character === "[") depth += 1
    if (character === "]") {
      depth -= 1
      if (depth === 0) {
        end = index + 1
        break
      }
    }
  }
  assert(end !== -1 && !inString, "map codexReviewLedger array boundary is invalid")
  return { start, end }
}

const normalizeMapReviewRecords = (raw) => {
  const { start, end } = locateMapReviewRecords(raw)
  return `${raw.slice(0, start)}[]${raw.slice(end)}`
}

const normalizePlanReviewRecords = (source) =>
  normalizeDelimitedReviewBlock(source, planReviewStart, planReviewEnd, "migration draft")

const assertValidatorReviewIdentity = (current, reviewed) => {
  assert(current === reviewed, "validator must remain byte-identical to the independently reviewed subject")
}

const validateReviewedSubjectReviewSurfaces = (rawMap, markdown) => {
  const reviewedMap = parseJsonNoDuplicateKeys(rawMap, "reviewed packet map")
  assert(Array.isArray(reviewedMap.codexReviewLedger) && reviewedMap.codexReviewLedger.length === 0, "reviewed packet commit must be the pending-review subject")
  const ledgerRange = locateMapReviewRecords(rawMap)
  assert(rawMap.slice(ledgerRange.start, ledgerRange.end) === "[]", "reviewed subject map ledger must be canonical empty JSON")
  assert(
    extractDelimitedReviewBlock(markdown, planReviewStart, planReviewEnd, "reviewed migration draft") === renderPlanReviewBlock([]),
    "reviewed subject plan review block must be the canonical pending block"
  )
  return reviewedMap
}

const parseReviewedPacketTreeEntry = (entry, expectedPath, label) => {
  const match = entry.match(/^(\d{6}) blob ([0-9a-f]{40})\t(.+)$/u)
  assert(match !== null && match[3] === expectedPath, `${label} could not be parsed for ${expectedPath}`)
  assert(match[1] === "100644", `${label} mode for ${expectedPath} must be 100644; received ${match[1]}`)
  return { mode: match[1], hash: match[2], path: match[3] }
}

const reviewedPacketTreeEntryAt = (commit, path) =>
  parseReviewedPacketTreeEntry(git(["ls-tree", commit, "--", path]).stdout.trim(), path, "reviewed subject packet entry")

const validateCodexReviewBinding = async (entries, { rawMap, markdown, validatorSource }) => {
  if (entries.length === 0) {
    const head = git(["rev-parse", "HEAD"]).stdout.trim()
    if (head === reviewSubjectBaseSha) return
    assert(git(["rev-parse", "HEAD^"]).stdout.trim() === reviewSubjectBaseSha, "empty-ledger review subject must descend directly from the integrated current-main base")
    const subjectChanged = nulPaths(git(["diff-tree", "--no-commit-id", "--name-only", "-r", "-z", "HEAD"]).stdout).sort()
    assert(JSON.stringify(subjectChanged) === JSON.stringify([...packetPaths].sort()), "empty-ledger review subject commit must change exactly the three packet files")
    const headMap = parseJsonNoDuplicateKeys(git(["show", `HEAD:${mapPath}`]).stdout, "HEAD review-subject map")
    assert(headMap.codexReviewLedger.length === 0, "HEAD review subject must carry an empty Codex ledger")
    assert(git(["diff", "--quiet", "HEAD", "--", ...packetPaths], { allowFailure: true }).status === 0, "empty-ledger review subject must have clean packet bytes")
    return
  }

  const reviewedCommit = entries[0].reviewedCommitSha
  assert(entries.every((entry) => entry.reviewedCommitSha === reviewedCommit), "Codex reviews must bind one immutable packet commit")
  assert(git(["cat-file", "-e", `${reviewedCommit}^{commit}`], { allowFailure: true }).status === 0, "reviewed packet commit is not reachable")
  assert(git(["rev-parse", `${reviewedCommit}^`]).stdout.trim() === reviewSubjectBaseSha, "reviewed packet commit must descend directly from the integrated current-main base")
  assert(git(["merge-base", "--is-ancestor", reviewedCommit, "HEAD"], { allowFailure: true }).status === 0, "reviewed packet commit is not an ancestor of HEAD")
  const subjectChanged = nulPaths(git(["diff-tree", "--no-commit-id", "--name-only", "-r", "-z", reviewedCommit]).stdout).sort()
  assert(JSON.stringify(subjectChanged) === JSON.stringify([...packetPaths].sort()), "reviewed subject commit must change exactly the three packet files")

  const reviewedTreeEntries = new Map(packetPaths.map((path) => [path, reviewedPacketTreeEntryAt(reviewedCommit, path)]))
  for (const entry of entries) {
    for (const path of packetPaths) {
      assert(entry.reviewedPacketBlobs[path] === reviewedTreeEntries.get(path).hash, `${entry.taskId} reviewed blob differs for ${path}`)
    }
  }

  const reviewedRawMap = git(["show", `${reviewedCommit}:${mapPath}`]).stdout
  const reviewedMarkdown = git(["show", `${reviewedCommit}:${planPath}`]).stdout
  const reviewedValidator = git(["show", `${reviewedCommit}:${validatorPath}`]).stdout
  validateReviewedSubjectReviewSurfaces(reviewedRawMap, reviewedMarkdown)
  assert(normalizeMapReviewRecords(rawMap) === normalizeMapReviewRecords(reviewedRawMap), "map changed outside its Codex review ledger after independent review")
  assert(normalizePlanReviewRecords(markdown) === normalizePlanReviewRecords(reviewedMarkdown), "migration draft changed outside its Codex review block after independent review")
  assertValidatorReviewIdentity(validatorSource, reviewedValidator)

  const head = git(["rev-parse", "HEAD"]).stdout.trim()
  if (head === reviewedCommit) {
    const workingChanged = new Set([
      ...nulPaths(git(["diff", "--name-only", "-z"]).stdout),
      ...nulPaths(git(["diff", "--cached", "--name-only", "-z"]).stdout)
    ])
    assert(
      JSON.stringify([...workingChanged].sort()) === JSON.stringify([mapPath, planPath].sort()),
      `pending attestation worktree must contain only ${mapPath} and ${planPath}`
    )
    return
  }
  assert(git(["rev-parse", "HEAD^"]).stdout.trim() === reviewedCommit, "attestation must be one commit directly after the reviewed subject")
  const attestationChanged = nulPaths(git(["diff-tree", "--no-commit-id", "--name-only", "-r", "-z", "HEAD"]).stdout).sort()
  assert(
    JSON.stringify(attestationChanged) === JSON.stringify([mapPath, planPath].sort()),
    `attestation commit must contain only ${mapPath} and ${planPath}`
  )
  assert(
    git(["diff", "--quiet", "HEAD", "--", ...packetPaths], { allowFailure: true }).status === 0,
    "attested packet must have clean working and indexed bytes"
  )
}

const validateObservationSchema = (observations) => {
  assertExactKeys(
    observations,
    [
      "routeRegistry",
      "documentDelivery",
      "stylesheetProjection",
      "appDatabase",
      "bundleBudget",
      "accessibilityEvidence",
      "rollout",
      "generatedEvidence"
    ],
    "observations"
  )

  assertExactKeys(
    observations.routeRegistry,
    ["source", "routeIds", "plannedContractIsBroaderThanImplementedRegistry", "omittedFamiliesRequireReviewedMachineReadableContent"],
    "observations.routeRegistry"
  )
  assert(observations.routeRegistry.source === "apps/site/src/route-registry.ts", "routeRegistry source differs")
  assertStringArray(observations.routeRegistry.routeIds, "observations.routeRegistry.routeIds", { unique: true })
  assert(observations.routeRegistry.plannedContractIsBroaderThanImplementedRegistry === true, "routeRegistry broader-contract fact differs")
  assert(observations.routeRegistry.omittedFamiliesRequireReviewedMachineReadableContent === true, "routeRegistry omitted-family gate differs")

  assertExactKeys(
    observations.documentDelivery,
    ["mode", "spaRouter", "generator", "buildInputDiscovery", "workerRouter"],
    "observations.documentDelivery"
  )
  assert(observations.documentDelivery.mode === "generated-multi-document-static-assets-with-react-islands", "document delivery mode differs")
  assert(observations.documentDelivery.spaRouter === false, "document delivery cannot claim an SPA router")
  const expectedDocumentPaths = Object.freeze({
    generator: "apps/site/scripts/generate-pages.tsx",
    buildInputDiscovery: "apps/site/vite.config.ts",
    workerRouter: "apps/site/src/asset-router.ts"
  })
  for (const key of ["generator", "buildInputDiscovery", "workerRouter"]) {
    validatePathShape(observations.documentDelivery[key], `observations.documentDelivery.${key}`)
    assert(observations.documentDelivery[key] === expectedDocumentPaths[key], `documentDelivery.${key} differs`)
  }

  assertExactKeys(
    observations.stylesheetProjection,
    ["authoredSource", "generatedPublicCopy", "copyOwner", "generatedPublicCopyIsTracked"],
    "observations.stylesheetProjection"
  )
  for (const key of ["authoredSource", "generatedPublicCopy", "copyOwner"]) {
    validatePathShape(observations.stylesheetProjection[key], `observations.stylesheetProjection.${key}`)
  }
  assert(observations.stylesheetProjection.authoredSource === "apps/site/src/styles.css", "stylesheet authored source differs")
  assert(observations.stylesheetProjection.generatedPublicCopy === "apps/site/public/styles.css", "generated stylesheet path differs")
  assert(observations.stylesheetProjection.copyOwner === "apps/site/scripts/generate-pages.tsx", "stylesheet copy owner differs")
  assert(observations.stylesheetProjection.generatedPublicCopyIsTracked === false, "generated stylesheet tracking fact differs")

  assertExactKeys(
    observations.appDatabase,
    [
      "source",
      "name",
      "version",
      "stores",
      "uiOnlyMigrationMayChangeSchema",
      "portableExportSchemaVersion",
      "legacyPortableVersionSupported"
    ],
    "observations.appDatabase"
  )
  validatePathShape(observations.appDatabase.source, "observations.appDatabase.source")
  assert(observations.appDatabase.source === "apps/site/src/study-storage/app-database/storage-model.ts", "app database source differs")
  assertNonEmptyString(observations.appDatabase.name, "observations.appDatabase.name")
  assert(Number.isSafeInteger(observations.appDatabase.version) && observations.appDatabase.version > 0, "app database version is invalid")
  assertStringArray(observations.appDatabase.stores, "observations.appDatabase.stores", { unique: true })
  assert(observations.appDatabase.uiOnlyMigrationMayChangeSchema === false, "UI-only migration cannot change the database schema")
  assert(observations.appDatabase.portableExportSchemaVersion === 2, "portable export schema version differs")
  assert(observations.appDatabase.legacyPortableVersionSupported === 1, "legacy portable version differs")

  assertExactKeys(
    observations.bundleBudget,
    [
      "source",
      "rawBytes",
      "gzipBytes",
      "brotliBytes",
      "recordedLargestFamily",
      "recordedLargestRawBytes",
      "recordedLargestGzipBytes",
      "recordedLargestBrotliBytes",
      "budgetMayBeRaisedByDraft",
      "staticRouteEffectClosureBudgetBytes",
      "webVitalsNumericBudget"
    ],
    "observations.bundleBudget"
  )
  validatePathShape(observations.bundleBudget.source, "observations.bundleBudget.source")
  assert(observations.bundleBudget.source === "scripts/verify-artifacts.ts", "bundle budget source differs")
  for (const key of [
    "rawBytes",
    "gzipBytes",
    "brotliBytes",
    "recordedLargestRawBytes",
    "recordedLargestGzipBytes",
    "recordedLargestBrotliBytes",
    "staticRouteEffectClosureBudgetBytes"
  ]) {
    assert(Number.isSafeInteger(observations.bundleBudget[key]) && observations.bundleBudget[key] >= 0, `bundleBudget.${key} is invalid`)
  }
  assertNonEmptyString(observations.bundleBudget.recordedLargestFamily, "observations.bundleBudget.recordedLargestFamily")
  assert(observations.bundleBudget.recordedLargestFamily === "Settings", "recorded largest bundle family differs")
  assert(observations.bundleBudget.recordedLargestRawBytes === 468355, "recorded largest raw closure differs")
  assert(observations.bundleBudget.recordedLargestGzipBytes === 139994, "recorded largest gzip closure differs")
  assert(observations.bundleBudget.recordedLargestBrotliBytes === 118248, "recorded largest brotli closure differs")
  assert(observations.bundleBudget.budgetMayBeRaisedByDraft === false, "draft cannot raise bundle budgets")
  assert(observations.bundleBudget.webVitalsNumericBudget === null, "draft cannot invent a Web Vitals budget")

  assertExactKeys(observations.accessibilityEvidence, ["automated", "codexCandidateCertificationChecks"], "observations.accessibilityEvidence")
  assertStringArray(observations.accessibilityEvidence.automated, "observations.accessibilityEvidence.automated", { unique: true })
  assertStringArray(observations.accessibilityEvidence.codexCandidateCertificationChecks, "observations.accessibilityEvidence.codexCandidateCertificationChecks", { unique: true })
  assert(
    JSON.stringify(observations.accessibilityEvidence.automated) === JSON.stringify([
      "axe WCAG A/AA serious and critical checks",
      "320 CSS-pixel reflow",
      "minimum target sizing",
      "forced colors",
      "reduced motion",
      "focus and live-region mutations",
      "print-media visibility"
    ]),
    "automated accessibility evidence differs"
  )
  assert(
    JSON.stringify(observations.accessibilityEvidence.codexCandidateCertificationChecks) === JSON.stringify([
      "NVDA with Firefox on Windows",
      "VoiceOver with Safari on macOS",
      "VoiceOver with Safari on iOS",
      "TalkBack with Chrome on Android",
      "JAWS smoke when licensed",
      "true 400 percent zoom in Chrome, Firefox, and Safari",
      "US Letter and A4 normal and large print",
      "grayscale physical print"
    ]),
    "Codex technical accessibility evidence differs"
  )

  assertExactKeys(
    observations.rollout,
    [
      "runtimeFeatureFlagSystemPresent",
      "launchAnalyticsEnabled",
      "remotePreviewActivatesTraffic",
      "productionCertificationStatus",
      "productionDeploymentStatus",
      "productionDeploymentInScope",
      "liveProductionEnvironment",
      "documentedInstantProductionRollback",
      "rollbackPolicy"
    ],
    "observations.rollout"
  )
  assert(observations.rollout.runtimeFeatureFlagSystemPresent === false, "draft cannot claim a runtime flag system")
  assert(observations.rollout.launchAnalyticsEnabled === false, "draft cannot enable launch analytics")
  assert(observations.rollout.remotePreviewActivatesTraffic === false, "preview cannot be represented as activating traffic")
  assert(observations.rollout.productionCertificationStatus === "blocked", "mapped production certification must remain blocked")
  assert(observations.rollout.productionDeploymentStatus === "blocked-live-user-reviewer", "mapped production deployment status differs")
  assert(observations.rollout.productionDeploymentInScope === false, "production deployment must remain out of scope")
  assertExactKeys(
    observations.rollout.liveProductionEnvironment,
    [
      "name",
      "repositoryEvidence",
      "liveObservationDate",
      "requiredReviewerRule",
      "requiredReviewerType",
      "codexOnlyMaySatisfyRequiredReviewer",
      "environmentChangeAuthorizedByPlan009",
      "environmentChangeRequiresSeparateAttestation"
    ],
    "observations.rollout.liveProductionEnvironment"
  )
  const productionEnvironment = observations.rollout.liveProductionEnvironment
  assert(productionEnvironment.name === "production", "live production Environment name differs")
  assert(
    JSON.stringify(productionEnvironment.repositoryEvidence) === JSON.stringify([
      "docs/DEPLOYMENT.md",
      ".github/workflows/cloudflare-production.yml"
    ]),
    "live production Environment repository evidence differs"
  )
  assert(productionEnvironment.liveObservationDate === "2026-08-28", "live production Environment observation date differs")
  assert(productionEnvironment.requiredReviewerRule === "required_reviewers", "live production Environment rule differs")
  assert(productionEnvironment.requiredReviewerType === "User", "live production Environment reviewer type differs")
  assert(productionEnvironment.codexOnlyMaySatisfyRequiredReviewer === false, "Codex cannot satisfy the live User reviewer")
  assert(productionEnvironment.environmentChangeAuthorizedByPlan009 === false, "Plan 009 cannot authorize an Environment change")
  assert(productionEnvironment.environmentChangeRequiresSeparateAttestation === true, "Environment changes require separate attestation")
  assert(observations.rollout.documentedInstantProductionRollback === false, "draft cannot claim instant rollback")
  assertExactKeys(
    observations.rollout.rollbackPolicy,
    ["directRevertAllowed", "directRevertProhibited", "mandatoryFallback"],
    "observations.rollout.rollbackPolicy"
  )
  assert(
    JSON.stringify(observations.rollout.rollbackPolicy.directRevertAllowed) === JSON.stringify([
      "current-unmerged-tip",
      "dependency-closed-suffix"
    ]),
    "rollback direct-revert allowlist differs"
  )
  assert(
    JSON.stringify(observations.rollout.rollbackPolicy.directRevertProhibited) === JSON.stringify([
      "earlier-change-with-live-dependents",
      "nonclosed-range",
      "isolated-presentation-subset"
    ]),
    "rollback direct-revert denylist differs"
  )
  assert(
    JSON.stringify(observations.rollout.rollbackPolicy.mandatoryFallback) === JSON.stringify([
      "forward-fix",
      "full-rebuild",
      "inactive-preview",
      "recertification"
    ]),
    "rollback mandatory fallback differs"
  )

  assertExactKeys(
    observations.generatedEvidence,
    [
      "recordedSource",
      "baselineCiRunId",
      "baselineCiUrl",
      "baselineCiHeadSha",
      "baselineCiConclusion",
      "recordedGeneratedDocuments",
      "recordedUnitTests",
      "recordedBrowserCases",
      "recordedBrowserPasses",
      "recordedBrowserSkips",
      "rerunByThisDraft"
    ],
    "observations.generatedEvidence"
  )
  validatePathShape(observations.generatedEvidence.recordedSource, "observations.generatedEvidence.recordedSource")
  assert(observations.generatedEvidence.recordedSource === "docs/OPEN.md", "generated evidence source differs")
  assert(observations.generatedEvidence.baselineCiRunId === 33165017762, "baseline CI run ID differs")
  assert(
    observations.generatedEvidence.baselineCiUrl === "https://github.com/mannyc2/nycustodianexam/actions/runs/33165017762",
    "baseline CI URL differs"
  )
  assert(observations.generatedEvidence.baselineCiHeadSha === historicalBaselineCiHeadSha, "historical baseline CI head SHA differs")
  assert(observations.generatedEvidence.baselineCiConclusion === "success", "baseline CI conclusion differs")
  for (const key of ["recordedGeneratedDocuments", "recordedUnitTests", "recordedBrowserCases", "recordedBrowserPasses", "recordedBrowserSkips"]) {
    assert(Number.isSafeInteger(observations.generatedEvidence[key]) && observations.generatedEvidence[key] >= 0, `generatedEvidence.${key} is invalid`)
  }
  assert(observations.generatedEvidence.recordedGeneratedDocuments === 526, "recorded generated-document count differs")
  assert(observations.generatedEvidence.recordedUnitTests === 352, "recorded unit-test count differs")
  assert(observations.generatedEvidence.recordedBrowserCases === 198, "recorded browser-case count differs")
  assert(observations.generatedEvidence.recordedBrowserPasses === 172, "recorded browser-pass count differs")
  assert(observations.generatedEvidence.recordedBrowserSkips === 26, "recorded browser-skip count differs")
  assert(observations.generatedEvidence.rerunByThisDraft === true, "draft verification rerun must be recorded")
}

const validateSupportingRecordSchema = (value) => {
  assert(Array.isArray(value.knownPreMigrationConfounders), "knownPreMigrationConfounders must be an array")
  assert(
    JSON.stringify(value.knownPreMigrationConfounders.map((entry) => entry?.id)) === JSON.stringify([
      "player-navigation-not-state-gated",
      "offline-restoration-can-project-empty-before-reconcile",
      "review-question-route-mounts-practice-composition",
      "settings-preferences-restoration-race"
    ]),
    "known pre-migration confounders differ"
  )
  for (const [index, entry] of value.knownPreMigrationConfounders.entries()) {
    const label = `knownPreMigrationConfounders[${index}]`
    assertExactKeys(entry, ["id", "status", "evidence", "observedFact", "requiredBeforeVisualMigration"], label)
    assertNonEmptyString(entry.id, `${label}.id`)
    assert(entry.status === "characterization-required", `${entry.id} must remain characterization-required`)
    assertStringArray(entry.evidence, `${label}.evidence`, { unique: true })
    assertNonEmptyString(entry.observedFact, `${label}.observedFact`)
    assertNonEmptyString(entry.requiredBeforeVisualMigration, `${label}.requiredBeforeVisualMigration`)
  }
  const settingsRace = value.knownPreMigrationConfounders[3]
  assert(
    JSON.stringify(settingsRace.evidence) === JSON.stringify([
      "apps/site/src/settings/react/settings.tsx",
      "apps/site/browser-tests/local-data-and-packs.pw.ts"
    ]),
    "settings restoration race evidence differs"
  )
  assert(
    settingsRace.observedFact === exactSettingsRaceObservedFact,
    "settings restoration race fact differs"
  )
  assert(
    settingsRace.requiredBeforeVisualMigration === "Introduce an explicit restoring state, disable every preference control and Save until authoritative load or a visible handled failure completes, and prove with a delayed-load test that no default write occurs and stored values win.",
    "settings restoration race required action differs"
  )

  assert(Array.isArray(value.unresolvedEvidence) && value.unresolvedEvidence.length === 4, "unresolvedEvidence must retain four records")
  const expectedUnresolvedSources = Object.freeze({
    "stale-browser-evidence-readme": Object.freeze(["docs/OPEN.md", "apps/site/browser-tests/README.md"]),
    "production-performance-evidence": Object.freeze(["docs/OPEN.md", "scripts/verify-artifacts.ts"]),
    "production-rollback-proof": Object.freeze(["docs/DEPLOYMENT.md", ".github/workflows/cloudflare-production.yml"]),
    "live-production-user-reviewer-incompatible-with-codex-only": Object.freeze(["docs/DEPLOYMENT.md", ".github/workflows/cloudflare-production.yml"])
  })
  assert(
    JSON.stringify(value.unresolvedEvidence.map((entry) => entry?.id)) === JSON.stringify(Object.keys(expectedUnresolvedSources)),
    "unresolvedEvidence IDs or ordering differ"
  )
  for (const [index, entry] of value.unresolvedEvidence.entries()) {
    const label = `unresolvedEvidence[${index}]`
    assertExactKeys(entry, ["id", "sources", "conflict", "requiredAction"], label)
    assertNonEmptyString(entry.id, `${label}.id`)
    assertStringArray(entry.sources, `${label}.sources`, { unique: true })
    assert(JSON.stringify(entry.sources) === JSON.stringify(expectedUnresolvedSources[entry.id]), `${label}.sources differ`)
    assertNonEmptyString(entry.conflict, `${label}.conflict`)
    assertNonEmptyString(entry.requiredAction, `${label}.requiredAction`)
  }

  assert(Array.isArray(value.prohibitedInferences) && value.prohibitedInferences.length >= 5, "prohibitedInferences is incomplete")
  assertStringArray(value.prohibitedInferences, "prohibitedInferences", { unique: true })
}

const validateMap = async (value, raw, options = {}) => {
  const topLevelKeys = [
    "schemaVersion",
    "artifact",
    "artifactKind",
    "metadata",
    "observedAt",
    "scope",
    "authorizationModel",
    "upstreamDecisionInputs",
    "codexReviewLedger",
    "dependencySlots",
    "topologyAreas",
    "fileRecords",
    "observations",
    "knownPreMigrationConfounders",
    "unresolvedEvidence",
    "prohibitedInferences"
  ]
  assertExactKeys(value, topLevelKeys, "current-file map")
  assert(value.schemaVersion === 1, "current-file map schemaVersion must be 1")
  assert(value.artifact === mapPath, `current-file map artifact must be ${mapPath}`)
  assert(value.artifactKind === "current-file-map", "current-file map artifactKind is invalid")
  validateMetadata(value.metadata, "current-file map")
  assert(value.observedAt === "2026-08-28", "current-file map observedAt is invalid")
  assertExactKeys(
    value.scope,
    [
      "coverageMode",
      "implementationRoot",
      "sourceInventoryCompleteness",
      "generatedOutputsAreCanonical",
      "productionFilesModified",
      "planIndexModified"
    ],
    "current-file map scope"
  )
  assert(value.scope.coverageMode === "canonical-owners-and-load-bearing-seams", "scope coverageMode is invalid")
  assert(value.scope.implementationRoot === ".", "scope implementationRoot must be .")
  assert(
    value.scope.sourceInventoryCompleteness === "provisional-until-parallel-step-04-inventory-is-merged-and-verified",
    "scope sourceInventoryCompleteness differs"
  )
  assert(value.scope.generatedOutputsAreCanonical === false, "generated outputs cannot be canonical")
  assert(value.scope.productionFilesModified === false, "productionFilesModified must remain false")
  assert(value.scope.planIndexModified === false, "planIndexModified must remain false")
  validateAuthorizationModel(value.authorizationModel)
  validateUpstreamDecisionInputs(value.upstreamDecisionInputs)
  validateCodexReviewLedger(value.codexReviewLedger, { verifySourceBindings: options.checkGit !== false })
  const reviewCounts = reviewShaCounts(value.codexReviewLedger)
  const mapShaCounts = new Map(reviewCounts)
  incrementCount(mapShaCounts, reviewSubjectBaseSha, 2 + value.codexReviewLedger.length)
  incrementCount(mapShaCounts, historicalBaselineCiHeadSha, 1)
  validateDependencySlots(value.dependencySlots)
  assert(JSON.stringify(value.topologyAreas) === JSON.stringify(requiredAreas), "topologyAreas differ or are out of order")
  await validateFileRecords(value.fileRecords, options)
  validateObservationSchema(value.observations)
  validateSupportingRecordSchema(value)
  validateStructuredState(value, "current-file map")
  validateDecodedStringClaims(value, "current-file map", [], [...reviewCounts.keys()])
  validateNoUnexpectedShaLiterals(raw, "current-file map", {
    allowedLiterals: [...reviewCounts.keys()],
    expectedObservedCount: 2 + value.codexReviewLedger.length,
    expectedLiteralCounts: mapShaCounts
  })

  const routeSource = await readUtf8("apps/site/src/route-registry.ts")
  const actualRouteIds = extractRouteIds(routeSource)
  assert(
    JSON.stringify(value.observations.routeRegistry.routeIds) === JSON.stringify(actualRouteIds),
    "mapped route IDs differ from apps/site/src/route-registry.ts"
  )
  assert(actualRouteIds.length === 27, `expected 27 implemented route IDs; found ${actualRouteIds.length}`)

  const storageSource = await readUtf8("apps/site/src/study-storage/app-database/storage-model.ts")
  const databaseName = storageSource.match(/appDatabaseName\s*=\s*"([^"]+)"/u)?.[1]
  const databaseVersion = Number(storageSource.match(/appDatabaseVersion\s*=\s*(\d+)/u)?.[1])
  assert(value.observations.appDatabase.name === databaseName, "mapped database name differs from source")
  assert(value.observations.appDatabase.version === databaseVersion, "mapped database version differs from source")
  assert(
    JSON.stringify(value.observations.appDatabase.stores) === JSON.stringify(extractDatabaseStores(storageSource)),
    "mapped database stores differ from source"
  )

  const budgetSource = await readUtf8("scripts/verify-artifacts.ts")
  const budget = budgetSource.match(/bundleBudgets\s*=\s*\{\s*raw:\s*([\d_]+),\s*gzip:\s*([\d_]+),\s*brotli:\s*([\d_]+)/u)
  assert(budget !== null, "bundle budget could not be parsed")
  const numeric = (text) => Number(text.replaceAll("_", ""))
  assert(value.observations.bundleBudget.rawBytes === numeric(budget[1]), "raw bundle budget differs from source")
  assert(value.observations.bundleBudget.gzipBytes === numeric(budget[2]), "gzip bundle budget differs from source")
  assert(value.observations.bundleBudget.brotliBytes === numeric(budget[3]), "brotli bundle budget differs from source")
  for (const entry of value.knownPreMigrationConfounders) {
    for (const path of entry.evidence) {
      validatePathShape(path, `${entry.id}.evidence`)
      if (options.checkGit !== false) await validateTrackedBlob(path)
    }
  }
  for (const entry of value.unresolvedEvidence) {
    for (const path of entry.sources) {
      validatePathShape(path, `${entry.id}.sources`)
      if (options.checkGit !== false) await validateTrackedBlob(path)
    }
  }
  for (const review of value.codexReviewLedger) {
    for (const path of review.evidencePaths) {
      validatePathShape(path, `${review.taskId}.evidencePaths`)
      if (options.checkGit !== false && !packetPaths.includes(path)) await validateTrackedBlob(path)
    }
  }
}

const validateMarkdown = (source, reviewEntries = activeCodexReviewEntries) => {
  validateMetadata(parseMarkedMetadata(source, "migration draft"), "migration draft")
  validateNoInvalidatedReviewIdentifiers(source, "migration draft")
  validateNoMarkdownReferenceLinks(source)
  assert(
    extractDelimitedReviewBlock(source, planReviewStart, planReviewEnd, "migration draft") === renderPlanReviewBlock(reviewEntries),
    "migration draft Codex review-record block differs from its canonical data"
  )
  const reviewCounts = new Map(reviewEntries.map((entry) => [entry.recordSha256, 1]))
  const planShaCounts = new Map(reviewCounts)
  planShaCounts.set(reviewSubjectBaseSha, 3)
  planShaCounts.set(historicalBaselineCiHeadSha, 1)
  validateNoUnexpectedShaLiterals(source, "migration draft", {
    allowedLiterals: [...reviewCounts.keys()],
    expectedObservedCount: 3,
    expectedLiteralCounts: planShaCounts
  })
  validateNoUnexpectedShaLiterals(semanticClaimProjection(source), "migration draft semantic projection", {
    allowedLiterals: [...reviewCounts.keys()]
  })
  validateNoUnexpectedShaLiterals(
    semanticClaimProjection(source, { preserveCommentBodies: false }),
    "migration draft comment-eliding semantic projection",
    { allowedLiterals: [...reviewCounts.keys()] }
  )
  validateMarkdownStateAssignments(source)
  validateNoUnstructuredStateAssignments(source)
  validateNoAffirmativeEvidenceClaims(source, "migration draft")
  const visible = visibleMarkdown(source)
  validateMarkdownContainers(visible)
  assert(
    normalizeWhitespace(semanticClaimProjection(visible)).includes(canonicalProductionDeploymentBoundary),
    "migration draft production deployment blocker differs from the canonical boundary"
  )
  const disclaimerParagraphs = visible
    .split(/\n[ \t]*\n/gu)
    .filter((paragraph) => normalizeWhitespace(paragraph) === exactDisclaimer)
  assert(
    disclaimerParagraphs.length === 1 && disclaimerParagraphs[0].split("\n").every((line) => !/^[ \t]/u.test(line)),
    "migration draft exact provisional disclaimer is missing"
  )

  let priorSectionIndex = -1
  const visibleLines = visible.split("\n")
  for (const section of requiredPlanSections) {
    const matches = visibleLines.reduce((count, line) => count + (line === section ? 1 : 0), 0)
    assert(matches === 1, `migration draft must contain exactly one visible section ${section}; found ${matches}`)
    const index = visible.indexOf(section)
    assert(index > priorSectionIndex, `migration draft section is out of order: ${section}`)
    priorSectionIndex = index
  }
  for (const row of requiredTopologyTableRows) {
    assert(visible.split("\n").filter((line) => line === row).length === 1, `migration draft topology row differs: ${row}`)
  }

  const matches = [...visible.matchAll(/^### Tranche (\d+):[^\n]+$/gmu)]
  assert(matches.length === 8, `migration draft must contain exactly eight tranche headings; found ${matches.length}`)
  assert(
    JSON.stringify(matches.map((match) => Number(match[1]))) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8]),
    "migration draft tranche headings must be ordered 1 through 8"
  )
  for (const [index, match] of matches.entries()) {
    const start = match.index
    const end = matches[index + 1]?.index ?? visible.indexOf("\n## Cross-tranche test and certification strategy")
    assert(end > start, `Tranche ${index + 1} section boundary is invalid`)
    const section = visible.slice(start, end)
    const labelPositions = requiredTrancheLabels.map((label) => {
      const pattern = new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}`, "gmu")
      const occurrences = [...section.matchAll(pattern)]
      assert(occurrences.length > 0, `Tranche ${index + 1} is missing ${label}`)
      assert(occurrences.length === 1, `Tranche ${index + 1} contains duplicate ${label}`)
      return occurrences[0].index
    })
    assert(
      labelPositions.every((position, labelIndex) => labelIndex === 0 || position > labelPositions[labelIndex - 1]),
      `Tranche ${index + 1} labels are out of order`
    )
    for (const [labelIndex, label] of requiredTrancheLabels.entries()) {
      const bodyStart = labelPositions[labelIndex] + label.length
      const bodyEnd = labelPositions[labelIndex + 1] ?? section.length
      const body = section.slice(bodyStart, bodyEnd)
      assert(body.trim().length > 0, `Tranche ${index + 1} has an empty ${label}`)
      assert(
        body.split("\n").some((line) => line.trim().length > 0 && !/^(?: {4}|\t)/u.test(line)),
        `Tranche ${index + 1} has only indented-code content for ${label}`
      )
      if (label === "**Rollback boundary:**") {
        assert(
          normalizeWhitespace(body).includes(canonicalRollbackContract),
          `Tranche ${index + 1} rollback boundary lacks the canonical dependency-closed policy`
        )
      }
    }
  }
  const trancheOne = normalizeWhitespace(visible.slice(matches[0].index, matches[1].index))
  for (const token of [
    "apps/site/src/settings/react/settings.tsx",
    "explicit restoring state",
    "disable every preference control and Save until authoritative load or a visible handled failure completes",
    "focused delayed-settings-load test",
    "no default write occurs",
    "stored values win"
  ]) {
    assert(trancheOne.includes(token), `Tranche 1 settings restoration contract is missing ${token}`)
  }

  const dependencyStart = visible.indexOf("## Dependency and decision slots")
  const dependencyEnd = visible.indexOf("\n## Codex-only authorization and review evidence", dependencyStart)
  assert(dependencyStart !== -1 && dependencyEnd > dependencyStart, "migration draft dependency section boundary is invalid")
  const dependencyTableLines = visible
    .slice(dependencyStart, dependencyEnd)
    .split("\n")
    .filter((line) => line.startsWith("|"))
  assert(
    dependencyTableLines[0] === "| Slot | Canonical consumer | Current value | Required disposition before graduation or release use |",
    "migration draft dependency table header differs"
  )
  assert(dependencyTableLines[1] === "|---|---|---:|---|", "migration draft dependency table separator differs")
  assert(
    dependencyTableLines.length === requiredDependencyIds.length + 2,
    "migration draft dependency table must contain only its header, separator, and nine contract rows"
  )
  const dependencyRows = dependencyTableLines
    .slice(2)
    .map((line) => line.slice(1, -1).split("|").map((cell) => cell.trim()))
  assert(dependencyRows.length === requiredDependencyIds.length, "migration draft dependency table row count differs")
  const dependencyIds = dependencyRows.map((cells, index) => {
    assert(cells.length === 4, `migration draft dependency row ${index + 1} must contain four cells`)
    assert(cells[2] === "`null`", `migration draft dependency row ${index + 1} current value must remain null`)
    const id = cells[0].match(/^`([^`]+)`$/u)?.[1]
    const contract = requiredDependencyContracts[id]
    assert(contract !== undefined, `migration draft dependency row ${index + 1} has an unknown slot ID`)
    assert(cells[1] === contract.markdownConsumer, `migration draft dependency row ${id} canonical consumer differs`)
    assert(cells[3] === contract.markdownDisposition, `migration draft dependency row ${id} disposition differs`)
    return id
  })
  assert(JSON.stringify(dependencyIds) === JSON.stringify(requiredDependencyIds), "migration draft dependency IDs or ordering differ")

  const codexInterfaceStart = visible.indexOf("## Codex-only authorization and review evidence")
  const codexInterfaceEnd = visible.indexOf("\n## Contract adoption procedure after Steps 02–05 land", codexInterfaceStart)
  assert(codexInterfaceStart !== -1 && codexInterfaceEnd > codexInterfaceStart, "Codex-only interface section boundary is invalid")
  const codexInterfaceTableLines = visible
    .slice(codexInterfaceStart, codexInterfaceEnd)
    .split("\n")
    .filter((line) => line.startsWith("|"))
  const expectedCodexInterfaceTableLines = [
    "| Future input | Current binding | Acceptance interface |",
    "|---|---:|---|",
    "| Step 02 accepted repository attestation | `null` | `CODEX-ONLY-UIUX-V1` |",
    "| Step 03 accepted repository attestation | `null` | `CODEX-ONLY-UIUX-V1` |",
    "| Step 04 accepted repository attestation, including the exact source inventory | `null` | `CODEX-ONLY-UIUX-V1` |",
    "| Step 05 accepted repository attestation and integrated disposition | `null` | `CODEX-ONLY-UIUX-V1` |",
    "| Codex task ID | Disposition | Consensus / dissent | Record SHA-256 |",
    "|---|---|---|---|",
    ...reviewEntries.map((entry) =>
      `| \`${entry.taskId}\` | No blocking findings on exact subject | Root and independent rereviews agree / none recorded for exact subject | \`${entry.recordSha256}\` |`
    )
  ]
  assert(
    JSON.stringify(codexInterfaceTableLines) === JSON.stringify(expectedCodexInterfaceTableLines),
    "migration draft Codex-only input/review tables differ"
  )

  validateMarkdownStateAssignments(visible)
}

const validatePlanIndexText = (source) => {
  assert(!/^\|\s*009\s*\|/gmu.test(source), "plans/README.md must not contain a Plan 009 status row")
  for (const id of ["004", "005"]) {
    const row = source.split("\n").find((line) => new RegExp(`^\\|\\s*${id}\\s*\\|`, "u").test(line))
    assert(row !== undefined, `plans/README.md is missing Plan ${id}`)
    const cells = row.split("|").map((cell) => cell.trim()).filter((cell) => cell.length > 0)
    const status = cells.at(-1) ?? ""
    assert(/^DONE\b/u.test(status), `Plan ${id} must remain the merged CODEX-ONLY DONE status at observedAtSha`)
  }
  for (const id of ["006", "007", "008"]) {
    const row = source.split("\n").find((line) => new RegExp(`^\\|\\s*${id}\\s*\\|`, "u").test(line))
    assert(row !== undefined, `plans/README.md is missing Plan ${id}`)
    const cells = row.split("|").map((cell) => cell.trim()).filter((cell) => cell.length > 0)
    const status = cells.at(-1) ?? ""
    assert(
      !/^(?:accepted|approved|complete|completed|done|final)\b/iu.test(status),
      `Plan ${id} has a graduated status; this provisional packet must be rebased and regenerated`
    )
  }
}

const validateCertificationRecord = async () => {
  const value = parseJsonNoDuplicateKeys(await readUtf8("docs/certification/production-v1.json"), "production certification")
  assert(value.status === "blocked", "production certification is no longer blocked; rebase and regenerate the draft")
  assert(value.candidateCommitSha === null, "production candidate SHA must remain null for provisional prework")
}

const workflowJobBlock = (source, jobId) => {
  const lines = source.split("\n")
  const start = lines.findIndex((line) => line === `  ${jobId}:`)
  assert(start !== -1, `production workflow is missing the ${jobId} job`)
  const relativeEnd = lines.slice(start + 1).findIndex((line) => /^  [a-z0-9_-]+:\s*$/iu.test(line))
  const end = relativeEnd === -1 ? lines.length : start + 1 + relativeEnd
  return lines.slice(start, end)
}

const validateRepositoryDeploymentSources = (deployment, workflow) => {
  assert(
    deployment.split("\n").some((line, index, lines) =>
      line === "- `production` exists, accepts deployments only from `main`, and requires" &&
      lines[index + 1] === "  approval from the repository owner `mannyc2`; and"
    ),
    "deployment handoff no longer records the production Environment owner approval"
  )
  const deploy = workflowJobBlock(workflow, "deploy")
  assert(
    deploy.filter((line) => line === "    needs: [preflight, certification]").length === 1,
    "production deploy job no longer depends on both preflight and certification"
  )
  assert(
    deploy.filter((line) => line === "    environment: production").length === 1,
    "production workflow no longer consumes the production Environment"
  )
}

const validateRepositoryDeploymentBoundary = async () => {
  const [deployment, workflow] = await Promise.all([
    readUtf8("docs/DEPLOYMENT.md"),
    readUtf8(".github/workflows/cloudflare-production.yml")
  ])
  validateRepositoryDeploymentSources(deployment, workflow)
}

const validatePlan008OpenConsumerContract = (source) => {
  assert(
    source.split("\n").filter((line) => line === "| `correctness-confounders` | `unresolved` | `docs/OPEN.md` |").length === 1,
    "Plan 008 must retain the exact correctness-confounders to docs/OPEN.md promotion contract"
  )
}

const validateIntegratedValidationConsumerBoundary = async () => {
  validatePlan008OpenConsumerContract(await readUtf8("plans/008-run-integrated-consumer-ux-validation.md"))
}

const validateTrackedIndexFlags = (output) => {
  for (const entry of nulPaths(output)) {
    assert(entry.length >= 3 && entry[1] === " ", `could not parse git index flag entry ${JSON.stringify(entry)}`)
    assert(entry[0] === "H", `tracked path uses a masking or nonstandard index flag: ${entry.slice(2)} (${entry[0]})`)
  }
}

const validatePacketFileShapes = async () => {
  for (const path of packetPaths) {
    const stats = await lstat(resolve(repositoryRoot, path))
    assert(stats.isFile() && !stats.isSymbolicLink(), `${path} must be a regular non-symlink packet file`)
    assert((stats.mode & 0o111) === 0, `${path} must not be executable`)
  }
}

const parseGitBlobEntry = (entry, expectedPath, label) => {
  const match = entry.match(/^(\d{6}) ([0-9a-f]{40}) (\d)\t(.+)$/u)
  assert(match !== null && match[4] === expectedPath, `${label} could not be parsed for ${expectedPath}`)
  return { mode: match[1], hash: match[2], stage: match[3] }
}

const validatePacketGitRepresentations = () => {
  for (const path of packetPaths) {
    const indexEntries = nulPaths(git(["ls-files", "--stage", "-z", "--", path]).stdout)
    const headEntry = git(["ls-tree", "HEAD", "--", path]).stdout.trim()
    if (headEntry.length > 0) {
      assert(indexEntries.length === 1, `${path} exists in HEAD but is missing from the index`)
      const head = headEntry.match(/^(\d{6}) blob ([0-9a-f]{40})\t(.+)$/u)
      assert(head !== null && head[3] === path, `HEAD packet entry could not be parsed for ${path}`)
      assert(head[1] === "100644", `HEAD packet mode for ${path} must be 100644; received ${head[1]}`)
    }
    if (indexEntries.length === 0) continue
    assert(indexEntries.length === 1, `${path} must have exactly one stage-zero index entry`)
    const indexed = parseGitBlobEntry(indexEntries[0], path, "index packet entry")
    assert(indexed.stage === "0", `${path} has an unresolved nonzero index stage`)
    assert(indexed.mode === "100644", `index packet mode for ${path} must be 100644; received ${indexed.mode}`)
    const workingHash = git(["hash-object", "--", path]).stdout.trim()
    assert(workingHash === indexed.hash, `${path} working bytes differ from the indexed packet blob`)
  }
}

const validateGitBoundary = (planIndex) => {
  assert(git(["cat-file", "-e", `${observedAtSha}^{commit}`], { allowFailure: true }).status === 0, "observedAtSha is not a reachable commit")
  assert(
    git(["merge-base", "--is-ancestor", observedAtSha, "HEAD"], { allowFailure: true }).status === 0,
    "observedAtSha is not an ancestor of HEAD"
  )
  assert(git(["cat-file", "-e", `${reviewSubjectBaseSha}^{commit}`], { allowFailure: true }).status === 0, "reviewSubjectBaseSha is not a reachable commit")
  assert(
    reviewSubjectBaseSha === observedAtSha,
    "reviewSubjectBaseSha must be the exact clean current-main commit"
  )
  assert(
    git(["merge-base", "--is-ancestor", reviewSubjectBaseSha, "HEAD"], { allowFailure: true }).status === 0,
    "reviewSubjectBaseSha is not an ancestor of HEAD"
  )
  for (const invalidatedSubject of invalidatedReviewSubjectShas) {
    assert(git(["cat-file", "-e", `${invalidatedSubject}^{commit}`], { allowFailure: true }).status === 0, `invalidated review subject is not locally reachable: ${invalidatedSubject}`)
    assert(
      git(["merge-base", "--is-ancestor", invalidatedSubject, "HEAD"], { allowFailure: true }).status !== 0,
      `HEAD descends from invalidated review subject ${invalidatedSubject}`
    )
  }
  const originUrls = git(["remote", "get-url", "--all", "origin"]).stdout.trim().split("\n")
  const originPushUrls = git(["remote", "get-url", "--push", "--all", "origin"]).stdout.trim().split("\n")
  assert(JSON.stringify(originUrls) === JSON.stringify([expectedOriginUrl]), `origin fetch URL differs from the pinned repository: ${originUrls.join(", ")}`)
  assert(JSON.stringify(originPushUrls) === JSON.stringify([expectedOriginUrl]), `origin push URL differs from the pinned repository: ${originPushUrls.join(", ")}`)
  const rewriteResult = git(["config", "--get-regexp", "^url\\..*\\.(insteadof|pushinsteadof)$"], { allowFailure: true })
  if (rewriteResult.status === 0) {
    for (const line of rewriteResult.stdout.trim().split("\n")) {
      const prefix = line.match(/^\S+\s+(.+)$/u)?.[1]
      assert(prefix === undefined || !expectedOriginUrl.startsWith(prefix), `Git URL rewrite can replace the pinned origin prefix: ${prefix}`)
    }
  }
  const originMain = git(["rev-parse", "origin/main"]).stdout.trim()
  assert(originMain === observedAtSha, `origin/main advanced to ${originMain}; fetch, rebase, regenerate, and reverify`)
  const remoteMainOutput = git(["ls-remote", "--heads", "origin", "refs/heads/main"]).stdout.trim()
  const remoteMain = remoteMainOutput.match(/^([0-9a-f]{40})\s+refs\/heads\/main$/u)?.[1]
  assert(remoteMain !== undefined, "could not resolve the exact remote origin/main head")
  assert(remoteMain === observedAtSha, `remote origin/main advanced to ${remoteMain}; fetch, rebase, regenerate, and reverify`)
  validateTrackedIndexFlags(git(["ls-files", "-v", "-z"]).stdout)
  validatePacketGitRepresentations()
  assert(
    git(["diff", "--quiet", observedAtSha, "--", indexPath], { allowFailure: true }).status === 0,
    `${indexPath} changed from the observed baseline`
  )
  assert(git(["show", `${observedAtSha}:${indexPath}`]).stdout === planIndex, `${indexPath} bytes differ from the observed baseline`)

  const changed = new Set([
    ...nulPaths(git(["diff", "--name-only", "-z", observedAtSha, "HEAD"]).stdout),
    ...nulPaths(git(["diff", "--name-only", "-z"]).stdout),
    ...nulPaths(git(["diff", "--cached", "--name-only", "-z"]).stdout),
    ...nulPaths(git(["ls-files", "--others", "--exclude-standard", "-z"]).stdout)
  ])
  for (const path of changed) {
    assert(packetPaths.includes(path), `out-of-scope path changed from observedAtSha: ${path}`)
  }
  for (const path of packetPaths) assert(changed.has(path), `packet path is missing from the draft diff: ${path}`)
}

const parseArguments = (arguments_) => {
  assert(new Set(arguments_).size === arguments_.length, "duplicate CLI arguments are not allowed")
  for (const argument of arguments_) assert(argument === "--self-test", `unknown argument: ${argument}`)
  return { selfTest: arguments_.includes("--self-test") }
}

const expectFailure = async (name, action, fragment) => {
  let message
  try {
    await action()
  } catch (cause) {
    message = cause instanceof Error ? cause.message : String(cause)
  }
  assert(message !== undefined, `self-test ${name} unexpectedly passed`)
  assert(message.includes(fragment), `self-test ${name} failed with unexpected message: ${message}`)
}

const clone = (value) => JSON.parse(JSON.stringify(value))

const runSelfTests = async ({ map, rawMap, markdown, planIndex, scriptMetadata, validatorSource }) => {
  let count = 0
  const negativeNames = new Set()
  const negative = async (name, action, fragment) => {
    assert(!negativeNames.has(name), `duplicate self-test name: ${name}`)
    negativeNames.add(name)
    await expectFailure(name, action, fragment)
    count += 1
  }

  const withPlanStatus = (source, id, status) => source
    .split("\n")
    .map((line) => {
      if (!new RegExp(`^\\|\\s*${id}\\s*\\|`, "u").test(line)) return line
      const cells = line.split("|")
      cells[cells.length - 2] = ` ${status} `
      return cells.join("|")
    })
    .join("\n")

  const canonicalReviewFixture = createCanonicalCodexReviewFixture()
  validateCodexReviewLedger(canonicalReviewFixture)
  const canonicalReviewMarkdown = markdown.replace(
    extractDelimitedReviewBlock(markdown, planReviewStart, planReviewEnd, "self-test migration draft"),
    renderPlanReviewBlock(canonicalReviewFixture)
  )
  validateMarkdown(canonicalReviewMarkdown, canonicalReviewFixture)
  const canonicalPopulatedRawMap = rawMap.replace(
    '  "codexReviewLedger": []',
    `  "codexReviewLedger": ${JSON.stringify(canonicalReviewFixture, null, 2)}`
  )
  assert(canonicalPopulatedRawMap !== rawMap, "self-test fully populated canonical map was not constructed")
  const canonicalPopulatedMap = parseJsonNoDuplicateKeys(canonicalPopulatedRawMap, "self-test fully populated canonical map")
  await validateMap(canonicalPopulatedMap, canonicalPopulatedRawMap, { checkGit: false })

  const pendingSubjectRawMap = normalizeMapReviewRecords(rawMap)
  const pendingSubjectMarkdown = markdown.replace(
    extractDelimitedReviewBlock(markdown, planReviewStart, planReviewEnd, "self-test migration draft"),
    renderPlanReviewBlock([])
  )
  validateReviewedSubjectReviewSurfaces(pendingSubjectRawMap, pendingSubjectMarkdown)
  await negative(
    "reviewed-subject-populated-plan-block",
    () => validateReviewedSubjectReviewSurfaces(pendingSubjectRawMap, canonicalReviewMarkdown),
    "reviewed subject plan review block must be the canonical pending block"
  )
  await negative(
    "reviewed-subject-noncanonical-empty-map-ledger",
    () => validateReviewedSubjectReviewSurfaces(
      pendingSubjectRawMap.replace('  "codexReviewLedger": []', '  "codexReviewLedger": [ ]'),
      pendingSubjectMarkdown
    ),
    "reviewed subject map ledger must be canonical empty JSON"
  )
  await negative(
    "reviewed-subject-executable-packet-mode",
    () => parseReviewedPacketTreeEntry(
      `100755 blob ${"1".repeat(40)}\t${validatorPath}`,
      validatorPath,
      "synthetic reviewed subject packet entry"
    ),
    "must be 100644"
  )

  const rejectSemanticClaimOnAllSurfaces = async (name, claim, fragment = "contains") => {
    await negative(
      `markdown-semantic-${name}`,
      () => validateMarkdown(`${markdown}\n${claim}\n`),
      fragment
    )
    await negative(
      `decoded-map-semantic-${name}`,
      () => validateDecodedStringClaims({ nested: { values: [{ claim }] } }, "decoded semantic fixture"),
      fragment
    )
    await negative(
      `review-ledger-semantic-${name}`,
      () => validateDecodedStringClaims(
        { codexReviewLedger: [{ findingSummary: claim, nested: { evidence: [claim] } }] },
        "review-ledger semantic fixture"
      ),
      fragment
    )
    await negative(
      `review-ledger-nested-only-semantic-${name}`,
      () => validateDecodedStringClaims(
        {
          codexReviewLedger: [{
            reviewKind: "authorization-and-rollback-review",
            findingSummary: "Synthetic validator fixture.",
            nested: { evidence: [{ result: claim }] }
          }]
        },
        "nested-only review-ledger semantic fixture"
      ),
      fragment
    )
  }

  const requiredExactNegativeClaims = Object.freeze([
    "The product can be launched",
    "The production gate is open",
    "Everything is set for the production rollout",
    "The application may enter service",
    "The website is publishable",
    "The site is fit for launch",
    "Production can be turned on",
    "Publish the site",
    "Users liked the prototype",
    "Students found the navigation easy",
    "The prototype tested well with applicants",
    "Candidates reacted positively to the prototype.",
    "Serve the old build.",
    "Nothing blocks saving defaults while authoritative restoration is unresolved."
  ])
  const requiredExactSafeClaims = Object.freeze([
    "Direct revert is permitted only for the current unmerged tip.",
    "A dependency-closed suffix may be reverted.",
    "Restore settings after IndexedDB loads.",
    "Restore the offline pack.",
    "Restore focus after the dialog closes.",
    "Undo the last text edit."
  ])
  const exactSurfaceCounts = {
    negative: { markdown: 0, decodedMap: 0, reviewLedger: 0 },
    positive: { markdown: 0, decodedMap: 0, reviewLedger: 0 }
  }
  for (const [index, claim] of requiredExactNegativeClaims.entries()) {
    await negative(
      `required-exact-negative-markdown-${index + 1}`,
      () => validateMarkdown(`${markdown}\n${claim}\n`),
      ""
    )
    exactSurfaceCounts.negative.markdown += 1
    await negative(
      `required-exact-negative-decoded-map-${index + 1}`,
      () => validateDecodedStringClaims(
        { levelOne: [{ levelTwo: { claims: [{ value: claim }] } }] },
        "required exact decoded-map fixture"
      ),
      ""
    )
    exactSurfaceCounts.negative.decodedMap += 1
    await negative(
      `required-exact-negative-review-ledger-${index + 1}`,
      () => validateDecodedStringClaims(
        {
          codexReviewLedger: [{
            reviewKind: "authorization-and-rollback-review",
            findingSummary: "Synthetic validator fixture.",
            nested: { findings: [{ evidence: { result: claim } }] }
          }]
        },
        "required exact nested review-ledger fixture"
      ),
      ""
    )
    exactSurfaceCounts.negative.reviewLedger += 1
  }
  for (const [index, claim] of requiredExactSafeClaims.entries()) {
    validateMarkdown(`${markdown}\n${claim}\n`)
    exactSurfaceCounts.positive.markdown += 1
    validateDecodedStringClaims(
      { levelOne: [{ levelTwo: { claims: [{ value: claim }] } }] },
      `required exact benign decoded-map fixture ${index + 1}`
    )
    exactSurfaceCounts.positive.decodedMap += 1
    validateDecodedStringClaims(
      {
        codexReviewLedger: [{
          reviewKind: "authorization-and-rollback-review",
          findingSummary: "Synthetic validator fixture.",
          nested: { findings: [{ evidence: { result: claim } }] }
        }]
      },
      `required exact benign review-ledger fixture ${index + 1}`
    )
    exactSurfaceCounts.positive.reviewLedger += 1
  }

  const freeFormEvidenceAttacks = [
    ["deployment-permitted", "Deployment to production is permitted.", "affirmative production or implementation authorization"],
    ["release-go-live", "The release may go live.", "affirmative production or implementation authorization"],
    ["candidate-cleared-go-live", "The candidate is cleared to go live.", "affirmative production or implementation authorization"],
    ["learners-completed-usability", "Five learners completed the usability study.", "free-form"],
    ["build-can-ship", "The build can ship.", "affirmative production or implementation authorization"],
    ["site-eligible-launch", "The site is eligible to launch.", "affirmative production or implementation authorization"],
    ["traffic-activated", "Production traffic may be activated.", "affirmative production or implementation authorization"],
    ["rollout-permission-launch", "The rollout has permission to launch.", "affirmative production or implementation authorization"],
    ["version-go-live", "This version can go live.", "affirmative production or implementation authorization"],
    ["launch-approved", "The launch is approved.", "affirmative production or implementation authorization"],
    ["testers-completed-usability", "Three testers completed the usability test.", "free-form"],
    ["students-passed-testing", "Four students passed user testing.", "free-form"],
    ["respondents-conducted-research", "Seven respondents conducted usability research.", "free-form"],
    ["volunteers-participated-study", "Two volunteers participated in a user study.", "free-form"],
    ["candidates-finished-evaluation", "Nine candidates finished usability evaluation.", "free-form"],
    ["people-tested-trial", "Six people tested the usability trial.", "free-form"],
    ["formatted-release-go-live", "The release may **go live**.", "affirmative production or implementation authorization"],
    ["comment-split-learners", "Five learn<!--x-->ers completed the usability study.", "free-form"],
    ["nfkc-deployment-permitted", "Deployment to production is ｐｅｒｍｉｔｔｅｄ.", "affirmative production or implementation authorization"],
    ["codex-satisfies-environment-reviewer", "Codex satisfies the production Environment reviewer.", "claims Codex can satisfy or bypass"],
    ["user-review-rule-waived", "The User-review rule is waived.", "live production reviewer is waived or satisfied"],
    ["plan-authorizes-environment-change", "Plan 009 authorizes changing the production Environment.", "contains"],
    ["deployment-has-permission", "Production deployment has permission.", "contains"],
    ["release-received-approval", "The release received approval.", "contains"],
    ["candidate-cleared-for-launch", "Candidate cleared for launch.", "contains"],
    ["plan-reached-completion", "Plan 009 has reached completion.", "contains"],
    ["packet-received-approval", "The packet received approval.", "contains"],
    ["migration-achieved-final", "The migration achieved final status.", "contains"],
    ["study-had-learners", "The usability study had five learners.", "contains"],
    ["learners-joined-study", "Five learners joined the usability study.", "contains"],
    ["students-took-part", "Five students took part in user testing.", "contains"],
    ["testing-enrolled-volunteers", "Usability testing enrolled four volunteers.", "contains"],
    ["learner-feedback-collected", "Learner feedback was collected in usability testing.", "contains"],
    ["application-go-live", "The application may go live.", "contains"],
    ["app-cleared-launch", "The app is cleared to launch.", "contains"],
    ["website-ready-ship", "The website is ready to ship.", "contains"],
    ["deployment-green-light", "The deployment has the green light.", "contains"],
    ["candidate-go-ahead", "The candidate has the go-ahead to launch.", "contains"],
    ["put-site-production", "We can put the site into production.", "contains"],
    ["cohort-completed-study", "A cohort completed the usability study.", "contains"],
    ["panel-passed-testing", "The panel passed usability testing.", "contains"],
    ["observed-five-people", "We observed five people in a usability study.", "contains"],
    ["release-no-blockers", "There are no blockers for the release.", "contains"],
    ["release-may-proceed", "The release may proceed.", "contains"],
    ["move-forward-deployment", "We can move forward with the deployment.", "contains"],
    ["ship-site", "Ship the site.", "contains"],
    ["release-blessing", "The release received the blessing.", "contains"],
    ["deployment-gate-passed", "The deployment gate passed.", "contains"],
    ["site-set-rollout", "The site is set for rollout.", "contains"],
    ["build-ready-rollout", "The build is ready for rollout.", "contains"],
    ["participant-feedback", "Participant feedback was collected.", "contains"],
    ["moderated-validation", "Moderated validation included learners.", "contains"],
    ["observed-user", "We observed a user.", "contains"],
    ["research-round", "A research round included a cohort.", "contains"],
    ["tester-results", "Tester results were positive.", "contains"],
    ["panel-outcome", "The panel outcome was successful.", "contains"],
    ["cohort-outcome-passive", "The outcome for the cohort was recorded.", "contains"],
    ["unicode-go-ahead", "The deployment has the go‑ahead.", "contains"],
    ["fullwidth-green-light", "The release has the ｇｒｅｅｎ　ｌｉｇｈｔ.", "contains"],
    ["spaced-move-forward", "We  can\nmove   forward with the rollout.", "contains"],
    ["deployment-got-approved", "The deployment got approved.", "contains"],
    ["green-light-result-first", "Green light: deployment.", "contains"],
    ["release-carries-blessing", "The release carries our blessing.", "contains"],
    ["rollout-received-blessing", "The production rollout received its blessing.", "contains"],
    ["deployment-faces-no-blockers", "Deployment faces no blockers.", "contains"],
    ["release-blockers-gone", "All blockers are gone for the release.", "contains"],
    ["rollout-all-set", "The rollout is all set.", "contains"],
    ["rollout-commence", "Rollout can commence.", "contains"],
    ["deployment-proceeds", "Deployment proceeds.", "contains"],
    ["proceeding-deployment", "We are proceeding with deployment.", "contains"],
    ["moved-forward-rollout", "We moved forward with the rollout.", "contains"],
    ["site-shipped", "The site shipped.", "contains"],
    ["shipping-approved", "Shipping was approved.", "contains"],
    ["proposal-received-approval", "The proposal received approval.", "contains"],
    ["approval-went-proposal", "Approval went to the proposal.", "contains"],
    ["committee-gave-blessing", "The committee gave its blessing.", "contains"],
    ["panel-chose-proposal", "The panel chose the proposal.", "contains"],
    ["selector-picked-option", "The selector picked option B.", "contains"],
    ["option-green-light", "The option got the green light.", "contains"],
    ["participants-gave-feedback", "Participants gave feedback.", "contains"],
    ["feedback-received-participants", "Feedback was received from participants.", "contains"],
    ["participant-feedback-informed", "Participant feedback informed the design.", "contains"],
    ["user-panel-findings", "The user panel reported findings.", "contains"],
    ["findings-by-panel", "Findings were reported by the panel.", "contains"],
    ["usability-session-took-place", "A usability session took place.", "contains"],
    ["moderated-sessions-people", "We ran moderated sessions with people.", "contains"],
    ["cohort-validated-interface", "The cohort validated the interface.", "contains"],
    ["panel-results-support-choice", "The panel’s results support the choice.", "contains"],
    ["several-participants-feedback", "Several participants provided feedback.", "contains"],
    ["learner-group-research", "The learner group completed research.", "contains"],
    ["people-feedback-validation", "People contributed feedback during validation.", "contains"],
    ["panel-outcome-favored", "The panel outcome favored the proposal.", "contains"],
    ["deployment-given-green-light", "Deployment was given a green light.", "contains"],
    ["release-no-remaining-blockers", "The release has no remaining blockers.", "contains"],
    ["all-release-gates-passed", "All release gates passed.", "contains"],
    ["release-blessed", "The release has been blessed.", "contains"],
    ["users-positive-feedback", "Users gave positive feedback.", "contains"],
    ["positive-feedback-cohort", "Positive feedback came from the cohort.", "contains"],
    ["moderated-research-occurred", "A moderated research session took place.", "contains"],
    ["users-validated-interface", "The users validated the interface.", "contains"],
    ["production-is-go", "Production is a go.", "contains"],
    ["build-got-nod", "The build got the nod.", "contains"],
    ["nothing-blocks-deployment", "Nothing blocks deployment.", "contains"],
    ["launch-gates-green", "Every launch gate is green.", "contains"],
    ["proposal-got-nod", "The proposal got the nod.", "contains"],
    ["committee-settled-option", "The committee settled on option B.", "contains"],
    ["heard-from-users", "We heard from users.", "contains"],
    ["learners-shared-reactions", "Learners shared reactions.", "contains"],
    ["research-involved-users", "Research involved users.", "contains"],
    ["panel-insights-guided", "Panel insights guided the design.", "contains"],
    ["tester-responses-count", "Five responses were gathered from testers.", "contains"],
    ["ci-met-reviewer", "CI met the required-reviewer condition.", "live production reviewer"],
    ["user-gate-no-longer-blocks", "The User gate no longer blocks release.", "contains"],
    ["review-fulfilled-codex", "Required review was fulfilled by Codex.", "live production reviewer"],
    ["deployment-despite-user-rule", "Deployment may proceed despite the User-review rule.", "contains"],
    ["blocked-and-can-ship", "Production is blocked and the site can ship.", "contains"],
    ["negative-then-human-positive", "No participants completed the study, but users validated the interface.", "contains"],
    ["negative-release-mixed-approval", "The site is not blocked and has approval.", "contains"],
    ["negative-human-mixed-observation", "No technical errors exist and users validated the interface.", "contains"],
    ["negative-participant-mixed-observation", "No participants completed research and users validated the interface.", "contains"],
    ["authority-release-granted", "Authority to release was granted.", "contains"],
    ["deployment-good-to-go", "Deployment good to go.", "contains"],
    ["nothing-between-build-release", "Nothing stands between build and release.", "contains"],
    ["rollout-not-blocked", "Rollout not blocked.", "contains"],
    ["mixed-not-approved-may-start", "Production not approved yet rollout may start.", "contains"],
    ["implementation-can-begin", "Implementation can begin.", "contains"],
    ["implementation-has-started", "Implementation has started.", "contains"],
    ["user-input-shaped-design", "User input shaped the design.", "contains"],
    ["participant-views-shaped-design", "Participant views shaped the design.", "contains"],
    ["screen-reader-users-passed", "Screen-reader users passed the journey.", "contains"],
    ["learner-commentary-informed", "Learner commentary informed the interface.", "contains"],
    ["negative-human-then-shaped-choice", "No human evidence whereas participants shaped the choice.", "contains"],
    ["choice-made", "Choice made.", "contains"],
    ["decision-made", "Decision made.", "contains"],
    ["territory-b-won", "Territory B won.", "contains"],
    ["panel-consensus-b", "Panel consensus on B.", "contains"],
    ["committee-adopted-b", "Committee adopted B.", "contains"],
    ["panel-choice-b", "Panel choice B.", "contains"],
    ["slash-release-authorized", "release/authorized", "contains"],
    ["slash-green-light", "the/green/light", "contains"],
    ["combining-ship", "sh\u034Fip", "contains"],
    ["hyphen-authorized", "auth-orized", "contains"],
    ["slash-participant-feedback", "participants provided/feedback", "contains"],
    ["slash-selection-winner", "selected/winner", "contains"],
    ["backtick-slash-release-authorized", "`release/authorized`", "contains"],
    ["backtick-slash-green-light", "`the/green/light`", "contains"],
    ["backtick-hyphen-authorized", "`auth-orized`", "contains"],
    ["backtick-participant-feedback", "`participants provided/feedback`", "contains"],
    ["backtick-selection-winner", "`selected/winner`", "contains"],
    ["free-to-deploy", "We are free to deploy.", "contains"],
    ["site-went-live", "The site went live.", "contains"],
    ["participant-opinions-drove-ui", "Participant opinions drove the UI.", "contains"],
    ["panel-agreed-b", "The panel agreed on B.", "contains"],
    ["long-punctuation-release-authorized", "The re/////lease is auth-----orized.", "contains"],
    ["long-whitespace-release-authorized", "The re     lease is auth     orized.", "contains"],
    ["site-can-be-released", "The site can be released.", "contains"],
    ["site-deployable", "The site is deployable.", "contains"],
    ["release-no-barriers", "The release has no barriers.", "contains"],
    ["user-sentiment-drove-ui", "User sentiment drove the UI.", "contains"],
    ["territory-prevailed", "Territory B prevailed.", "contains"],
    ["deployment-complete", "The deployment is complete.", "contains"],
    ["rollout-finished", "The rollout finished.", "contains"],
    ["launch-succeeded", "The launch succeeded.", "contains"],
    ["deployment-happened", "Deployment happened.", "contains"],
    ["release-occurred", "The release occurred.", "contains"],
    ["site-published", "The site was published.", "contains"],
    ["site-can-publish", "The site can be published.", "contains"],
    ["release-underway", "The release is underway.", "contains"],
    ["site-fit-to-ship", "The site is fit to ship.", "contains"],
    ["build-releasable", "The build is releasable.", "contains"],
    ["launch-consent", "The launch has consent.", "contains"],
    ["consent-to-deploy", "Consent to deploy was given.", "contains"],
    ["move-ahead-deployment", "We may move ahead with deployment.", "contains"],
    ["nothing-preventing-deployment", "There is nothing preventing deployment.", "contains"],
    ["build-passed-checks", "The build passed all checks.", "contains"],
    ["traffic-cut-over", "Traffic was cut over.", "contains"],
    ["talked-to-users", "We talked to users.", "contains"],
    ["users-consulted", "Users were consulted.", "contains"],
    ["people-reviewed-interface", "People reviewed the interface.", "contains"],
    ["interface-reflects-preferences", "The interface reflects learner preferences.", "contains"],
    ["interviews-held", "Interviews were held.", "contains"],
    ["focus-group-convened", "A focus group convened.", "contains"],
    ["usability-sessions-convened", "Usability sessions convened.", "contains"],
    ["shadowed-users", "We shadowed users.", "contains"],
    ["customers-interviewed", "Customers were interviewed.", "contains"],
    ["readers-evaluated-page", "Readers evaluated the page.", "contains"],
    ["learners-advised-team", "Learners advised the team.", "contains"],
    ["participants-supplied-remarks", "Participants supplied remarks.", "contains"],
    ["committee-resolved-b", "The committee resolved to use B.", "contains"],
    ["b-declared-winner", "B was declared the winner.", "contains"],
    ["panel-backed-b", "The panel backed B.", "contains"],
    ["committee-opted-b", "The committee opted for B.", "contains"],
    ["territory-victorious", "Territory B was victorious.", "contains"],
    ["review-outcome-positive", "The review outcome was positive.", "contains"],
    ["b-carried-vote", "B carried the vote.", "contains"],
    ["panel-reached-agreement", "The panel reached agreement on B.", "contains"],
    ["review-team-consensus", "The review team reached consensus on B.", "contains"],
    ["b-emerged-selection", "B emerged as the selection.", "contains"],
    ["b-panel-endorsement", "B received the panel endorsement.", "contains"],
    ["committee-named-b", "The committee named B.", "contains"],
    ["option-b-advanced", "Option B advanced.", "contains"],
    ["territory-b-triumphed", "Territory B triumphed.", "contains"],
    ["panel-recommendation-b", "The panel recommendation is B.", "contains"],
    ["masked-green-light", "The deployment has the gr-een light.", "contains"],
    ["masked-stands-between", "Nothing st-ands between build and release.", "contains"],
    ["masked-rollout-blocked", "Rollout is not blo-cked.", "contains"],
    ["masked-may-start", "Production is not approved yet rollout m-ay start.", "contains"],
    ["masked-implementation-begin", "Implementation can be-gin.", "contains"],
    ["masked-screen-reader-users", "Screen-reader us-ers passed the journey.", "contains"],
    ["masked-learner-commentary", "Lear-ner com-mentary informed the interface.", "contains"],
    ["masked-observed-people", "We observed five peo-ple.", "contains"],
    ["masked-usability-study", "Peo-ple completed usa-bility stu-dy.", "contains"],
    ["masked-panel-consensus", "Panel con-sensus on B.", "contains"],
    ["masked-choice-made", "Cho-ice ma-de.", "contains"],
    ["masked-territory-won", "Territory B w-on.", "contains"],
    ["inline-path-green-light", "The deployment has the green `apps/site/public/sw.js` light.", "contains"],
    ["ship-it", "Ship it.", "contains"],
    ["deploy-this-build", "Deploy this build.", "contains"],
    ["release-it", "Release it.", "contains"],
    ["begin-rollout", "Begin rollout.", "contains"],
    ["start-deployment", "Start deployment.", "contains"],
    ["activate-production", "Activate production.", "contains"],
    ["commence-rollout", "Commence rollout.", "contains"],
    ["implementation-began", "Implementation began.", "contains"],
    ["deployment-sanctioned", "The deployment was sanctioned.", "contains"],
    ["release-imminent", "The release is imminent.", "contains"],
    ["masked-site-deploy", "The site can de-ploy.", "contains"],
    ["masked-site-go-live", "The site can go l-ive.", "contains"],
    ["users-rated-interface", "Users rated the interface.", "contains"],
    ["participant-count-five", "Participant count was five.", "contains"],
    ["participants-numbered-five", "Participants numbered five.", "contains"],
    ["panel-met", "The panel met.", "contains"],
    ["panel-decided-b", "Panel decided on B.", "contains"],
    ["committee-voted-b", "Committee voted for B.", "contains"],
    ["choice-is-b", "The choice is B.", "contains"],
    ["decision-is-b", "The decision is B.", "contains"],
    ["option-b-beat-a", "Option B beat A.", "contains"],
    ["final-choice-b", "Final choice: option B.", "contains"],
    ["option-b-final-choice", "Option B is the final choice.", "contains"]
    , ["deployment-waiver-issued-v8", "A deployment waiver was issued.", "contains"]
    , ["deployment-objections-withdrawn-v8", "Deployment objections were withdrawn.", "contains"]
    , ["launch-hold-lifted-v8", "The hold on launch was lifted.", "contains"]
    , ["release-restrictions-gone-v8", "Release restrictions are gone.", "contains"]
    , ["deployment-unobstructed-v8", "Deployment is unobstructed.", "contains"]
    , ["deployment-does-not-lack-permission-v8", "Deployment does not lack permission.", "contains"]
    , ["production-not-without-approval-v8", "Production is not without approval.", "contains"]
    , ["no-reason-not-deploy-v8", "There is no reason not to deploy.", "contains"]
    , ["please-deploy-site-v8", "Please deploy the site.", "contains"]
    , ["greenlight-deployment-v8", "Greenlight deployment.", "contains"]
    , ["put-production-online-v8", "Put production online.", "contains"]
    , ["promote-build-v8", "Promote this build.", "contains"]
    , ["cut-over-candidate-v8", "Cut over to the candidate.", "contains"]
    , ["route-traffic-production-v8", "Route traffic to production.", "contains"]
    , ["publish-site-v8", "Publish the site.", "contains"]
    , ["continue-deployment-v8", "Continue with deployment.", "contains"]
    , ["resume-rollout-v8", "Resume rollout.", "contains"]
    , ["deployment-in-progress-v8", "Deployment is in progress.", "contains"]
    , ["release-ongoing-v8", "Release is ongoing.", "contains"]
    , ["launch-happening-v8", "Launch is happening now.", "contains"]
    , ["production-online-v8", "Production is online.", "contains"]
    , ["website-serving-traffic-v8", "The website is serving traffic.", "contains"]
    , ["release-authorised-v8", "The release is authorised.", "contains"]
    , ["team-empowered-deploy-v8", "The team is empowered to deploy.", "contains"]
    , ["candidate-meets-launch-criteria-v8", "The candidate meets launch criteria.", "contains"]
    , ["blocked-so-ship-v8", "Production is blocked, so ship now.", "contains"]
    , ["although-blocked-deploy-v8", "Although blocked, deploy the site.", "contains"]
    , ["release-anything-but-blocked-v8", "Release is anything but blocked.", "contains"]
    , ["rollout-waiver-v8", "The rollout received a waiver.", "contains"]
    , ["website-fit-production-v8", "The website is fit for production.", "contains"]
    , ["no-obstructions-launch-v8", "There are no obstructions to launch.", "contains"]
    , ["liberty-publish-v8", "We are at liberty to publish.", "contains"]
    , ["spoke-to-users-v8", "We spoke to users.", "contains"]
    , ["met-with-users-v8", "We met with users.", "contains"]
    , ["users-answered-questions-v8", "Users answered questions.", "contains"]
    , ["people-used-prototype-v8", "People used the prototype.", "contains"]
    , ["saw-users-use-site-v8", "We saw users use the site.", "contains"]
    , ["witnessed-people-interface-v8", "We witnessed people using the interface.", "contains"]
    , ["customer-suggestions-layout-v8", "Customer suggestions influenced the layout.", "contains"]
    , ["listened-to-learners-v8", "We listened to learners.", "contains"]
    , ["committee-went-with-b-v8", "The committee went with B.", "contains"]
    , ["b-our-selection-v8", "B is our selection.", "contains"]
    , ["launch-hold-removed-variant", "The launch hold was lifted.", "contains"]
    , ["hold-on-deployment-removed-variant", "The hold on deployment was removed.", "contains"]
    , ["deployment-restrictions-removed-variant", "Deployment restrictions were removed.", "contains"]
    , ["deployment-free-blockers-variant", "Deployment is free of blockers.", "contains"]
    , ["build-satisfies-criteria-variant", "The build satisfies launch criteria.", "contains"]
    , ["traffic-routed-production-variant", "Traffic is routed to production.", "contains"]
    , ["team-liberty-publish-variant", "The team has liberty to publish.", "contains"]
    , ["met-users-variant", "We met users.", "contains"]
    , ["heard-users-variant", "We heard users.", "contains"]
    , ["participants-suggested-variant", "Participants suggested changes.", "contains"]
    , ["users-tried-prototype-variant", "Users tried the prototype.", "contains"]
    , ["committee-went-for-b-variant", "The committee went for B.", "contains"]
    , ["group-landed-b-variant", "The group landed on B.", "contains"]
    , ["committee-preference-b-variant", "Committee preference: B.", "contains"]
    , ["launch-restriction-expired-v10", "The launch restriction expired.", "contains"]
    , ["deployment-embargo-ended-v10", "The deployment embargo ended.", "contains"]
    , ["release-hold-expired-v10", "The release hold expired.", "contains"]
    , ["production-gate-opened-v10", "The production gate opened.", "contains"]
    , ["door-release-open-v10", "The door to release is open.", "contains"]
    , ["no-outstanding-approval-v10", "No outstanding approval is needed for launch.", "contains"]
    , ["send-site-live-v10", "Send the site live.", "contains"]
    , ["push-build-production-v10", "Push the build to production.", "contains"]
    , ["take-website-live-v10", "Take the website live.", "contains"]
    , ["turn-production-on-v10", "Turn production on.", "contains"]
    , ["roll-out-build-v10", "Roll out the build.", "contains"]
    , ["deploy-away-v10", "Deploy away.", "contains"]
    , ["release-can-happen-v10", "The release can happen.", "contains"]
    , ["launch-can-happen-v10", "Launch can happen.", "contains"]
    , ["deployment-can-happen-v10", "Deployment can happen.", "contains"]
    , ["release-kicked-off-v10", "Release kicked off.", "contains"]
    , ["release-went-out-v10", "The release went out.", "contains"]
    , ["traffic-switched-production-v10", "Traffic switched to production.", "contains"]
    , ["launch-entered-production-v10", "The launch entered production.", "contains"]
    , ["release-hyphen-approval-v10", "The release has appro-val.", "contains"]
    , ["deployment-hyphen-permission-v10", "The deployment has per-mission.", "contains"]
    , ["study-produced-findings-v10", "The study produced findings.", "contains"]
    , ["research-yielded-insights-v10", "Research yielded insights.", "contains"]
    , ["usability-feedback-exists-v10", "Usability feedback exists.", "contains"]
    , ["interview-notes-exist-v10", "Interview notes exist.", "contains"]
    , ["folks-tested-page-v10", "Folks tested the page.", "contains"]
    , ["residents-evaluated-journey-v10", "Residents evaluated the journey.", "contains"]
    , ["five-individuals-prototype-v10", "Five individuals tried the prototype.", "contains"]
    , ["community-members-tested-v10", "Several community members tested the interface.", "contains"]
    , ["test-subjects-used-v10", "Test subjects used the prototype.", "contains"]
    , ["interviewees-responded-v10", "Interviewees responded to the design.", "contains"]
    , ["user-count-five-v10", "User count was five.", "contains"]
    , ["learner-total-five-v10", "The learner total is five.", "contains"]
    , ["community-members-research-v10", "Five community members participated in research.", "contains"]
    , ["zero-participant-positive-choice-v10", "Zero participants, with learner recommendations incorporated into the choice.", "contains"]
    , ["negative-human-positive-selection-v10", "No human evidence even though learners selected B.", "contains"]
    , ["direction-settled-v10", "Direction B was settled.", "contains"]
    , ["committee-aligned-v10", "The committee aligned on B.", "contains"]
    , ["panel-coalesced-v10", "The panel coalesced around B.", "contains"]
    , ["vote-broke-v10", "The vote broke for B.", "contains"]
    , ["selected-standard-v10", "B became the selected standard.", "contains"]
    , ["deploy-immediately-v10", "Deploy immediately.", "contains"]
    , ["release-window-open-v10", "The release window is open.", "contains"]
    , ["release-passed-muster-v10", "The release passed muster.", "contains"]
    , ["percent-authorized-v10", "The release is auth%2Dorized.", "contains"]
    , ["path-split-authorized-v10", "The release is auth`apps/site/public/sw.js`orized.", "contains"]
    , ["people-responded-v10", "People responded.", "contains"]
    , ["panel-convened-yesterday-v10", "The panel convened yesterday.", "contains"]
    , ["dozens-users-took-part-v10", "Dozens of users took part.", "contains"]
    , ["prototype-tried-by-users-v10", "The prototype was tried by users.", "contains"]
    , ["consensus-b-v10", "Consensus: B.", "contains"]
    , ["panel-supported-b-v10", "The panel supported B.", "contains"]
    , ["direction-locked-b-v10", "Direction locked to B.", "contains"]
    , ["nothing-prohibits-deployment-v10", "Nothing prohibits deployment.", "contains"]
    , ["no-rule-bars-release-v10", "No rule bars release.", "contains"]
    , ["deployment-lacks-no-approval-v10", "Deployment lacks no approval.", "contains"]
    , ["release-not-lacking-authorization-v10", "Release is not lacking authorization.", "contains"]
    , ["not-approved-deploy-anyway-v10", "Not approved, deploy anyway.", "contains"]
    , ["no-approval-launch-now-v10", "No release approval, launch now.", "contains"]
    , ["no-objections-selected-b-v10", "No objections, committee selected B.", "contains"]
    , ["selection-no-longer-pending-v10", "Territory selection is no longer pending.", "contains"]
    , ["human-evidence-not-absent-v10", "Human evidence cannot be said to be absent.", "contains"]
    , ["untrue-no-human-evidence-v10", "It is untrue that no human evidence exists.", "contains"]
    , ["participants-not-unobserved-v10", "Participants were not unobserved.", "contains"]
    , ["users-not-untested-v10", "Users did not go untested.", "contains"]
    , ["no-users-left-untested-v10", "No users were left untested.", "contains"]
  ]
  for (const [name, claim] of freeFormEvidenceAttacks) {
    await rejectSemanticClaimOnAllSurfaces(`free-form-${name}`, claim, "")
  }

  const semanticAuthorizationActors = ["deployment", "release", "candidate", "build", "site", "application", "website", "version", "rollout", "packet"]
  const semanticAuthorizationResults = [
    "is approved",
    "is permitted",
    "is cleared",
    "is ready",
    "has the green light",
    "has the go-ahead",
    "received the blessing",
    "got approved",
    "was given a green light",
    "faces no remaining blockers",
    "is all set",
    "can commence",
    "proceeds",
    "shipped",
    "has been blessed"
  ]
  for (const actor of semanticAuthorizationActors) {
    for (const result of semanticAuthorizationResults) {
      const name = `${actor}-${result}`.replace(/[^a-z0-9]+/gu, "-")
      const claim = `The ${actor} ${result}.`
      await rejectSemanticClaimOnAllSurfaces(`authorization-matrix-${name}`, claim)
    }
  }

  const semanticHumanActors = ["cohort", "panel", "people", "learners", "users", "participants", "students", "testers"]
  const semanticHumanResults = [
    "completed",
    "passed",
    "conducted",
    "joined",
    "were observed in",
    "took part in",
    "gave feedback during",
    "reported findings from",
    "provided results for",
    "validated the interface during"
  ]
  for (const actor of semanticHumanActors) {
    for (const result of semanticHumanResults) {
      const name = `${actor}-${result}`.replace(/[^a-z0-9]+/gu, "-")
      const claim = `The ${actor} ${result} the usability research round.`
      await rejectSemanticClaimOnAllSurfaces(`human-matrix-${name}`, claim, "human")
    }
  }

  const semanticDecisionActors = ["review", "panel", "committee", "selector", "option", "proposal"]
  const semanticDecisionResults = ["approved", "passed", "selected", "chosen"]
  for (const actor of semanticDecisionActors) {
    for (const result of semanticDecisionResults) {
      const name = `${actor}-${result}`
      const claim = `The ${actor} was ${result}.`
      await rejectSemanticClaimOnAllSurfaces(`decision-matrix-${name}`, claim)
    }
  }

  for (const [actor, verb, object] of [
    ["panel", "chose", "proposal"],
    ["selector", "picked", "option"],
    ["committee", "endorsed", "direction"],
    ["review", "favored", "variant"],
    ["panel", "settled on", "option"]
  ]) {
    await rejectSemanticClaimOnAllSurfaces(
      `decision-active-${actor}-${verb.replaceAll(" ", "-")}-${object}`,
      `The ${actor} ${verb} the ${object}.`
    )
  }

  const fullwidthSemanticFixture = (text) => [...text].map((character) => {
    const codePoint = character.codePointAt(0)
    if (codePoint === 0x20) return "\u3000"
    if (codePoint >= 0x21 && codePoint <= 0x7e) return String.fromCodePoint(codePoint + 0xfee0)
    return character
  }).join("")
  const semanticFormattingClaims = [
    ["release", "The deployment was given a green light."],
    ["action", "We moved forward with the rollout."],
    ["human", "Participants provided feedback."],
    ["study", "A moderated research session took place."],
    ["decision", "The panel chose the proposal."]
  ]
  for (const [family, claim] of semanticFormattingClaims) {
    const splitAt = Math.max(1, claim.search(/[A-Za-z]{6,}/u) + 3)
    const transforms = [
      ["uppercase", claim.toUpperCase()],
      ["fullwidth", fullwidthSemanticFixture(claim)],
      ["unicode-separators", claim.replaceAll(" ", "—")],
      ["multiline-spacing", claim.replaceAll(" ", "  \n  ")],
      ["markdown-formatting", `***${claim}***`],
      ["comment-split", `${claim.slice(0, splitAt)}<!--semantic-split-->${claim.slice(splitAt)}`]
    ]
    for (const [transform, transformedClaim] of transforms) {
      await rejectSemanticClaimOnAllSurfaces(`format-${family}-${transform}`, transformedClaim)
    }
  }

  for (const [name, claim] of [
    ["authorization", "The deployment has the green light."],
    ["release-action", "We can put the site into production."],
    ["human-study", "A cohort completed moderated validation."],
    ["human-observation", "We observed five people."],
    ["human-outcome", "Tester results were recorded."],
    ["decision", "The panel was selected."]
  ]) {
    await negative(
      `review-ledger-free-form-${name}`,
      () => validateDecodedStringClaims(
        { codexReviewLedger: [{ findingSummary: claim, evidence: { nested: [claim] } }] },
        "review-ledger semantic fixture"
      ),
      "contains"
    )
  }

  const allowSemanticClaimOnAllSurfaces = (name, claim) => {
    validateMarkdown(`${markdown}\n${claim}\n`)
    validateDecodedStringClaims({ nested: [{ claim }] }, `benign decoded semantic fixture ${name}`)
    validateDecodedStringClaims(
      { codexReviewLedger: [{ findingSummary: claim, nested: { evidence: [claim] } }] },
      `benign review-ledger semantic fixture ${name}`
    )
  }

  for (const [name, claim] of [
    ["production-blocked", "Production deployment remains blocked and out of scope."],
    ["blocked-production", "Blocked production."],
    ["site-cannot-go-live", "The site cannot go live."],
    ["candidate-not-approved", "The candidate is not approved for rollout."],
    ["application-no-permission", "The application has no permission to deploy."],
    ["human-usability-out-of-scope", "Human usability research is out of scope."],
    ["no-human-evidence", "No human evidence exists."],
    ["no-human-evidence-terse", "No human evidence."],
    ["zero-participants", "Zero participants."],
    ["no-participants", "No participants completed the usability study."],
    ["study-not-conducted", "The usability study was not conducted."],
    ["panel-did-not-pass", "The panel did not pass usability testing."],
    ["not-human-usability-tested", "This packet is not human usability tested."],
    ["not-human-usability-tested-hyphenated", "Not human-usability-tested."],
    ["review-pending", "The review remains pending."],
    ["packet-provisional", "This packet remains provisional prework."],
    ["territory-selection-pending", "Territory selection remains pending."],
    ["user-gate-unsatisfied", "The required User reviewer remains unsatisfied."],
    ["user-research-out-of-scope", "User research is out of scope."],
    ["deployment-path", "The deployment workflow path is docs/DEPLOYMENT.md."],
    ["raw-repository-path", "apps/site/public/sw.js"],
    ["backticked-repository-path", "`apps/site/public/sw.js`"],
    ["release-gates-listed", "Release gates are listed for future verification."],
    ["shipped-document-wiring", "Shipped document wiring is a regression-test boundary."],
    ["selected-target-sizes", "Selected target sizes are accessibility inputs."],
    ["future-step-inputs", "Accepted future Step inputs remain null."],
    ["launch-analytics-disabled", "Launch analytics are disabled."],
    ["compiler-recovery", "Compiler recovery requires independent verification."],
    ["independent-rollback-prohibited", "Independent rollback is prohibited."],
    ["prohibited-independent-rollback", "Prohibited independent rollback."],
    ["previous-release-prohibited", "The previous release is prohibited."],
    ["never-use-previous-release", "Never use the previous release."],
    ["allowed-current-tip-revert", "Revert the current unmerged tip."],
    ["allowed-closed-suffix-rollback", "Roll back the dependency-closed suffix."],
    ["canonical-rollback", canonicalRollbackContract],
    ["rollback-boundary-label-v8", "Rollback boundary."],
    ["rollback-policy-label-v8", "Rollback policy."],
    ["rollback-rehearsal-label-v8", "Rollback rehearsal."],
    ["restore-imported-settings-v8", "Restore settings from the imported backup."],
    ["restore-preferences-after-load-v8", "Restore stored preferences after the authoritative load."],
    ["restore-session-after-indexeddb-v8", "Restore the local study session after IndexedDB opens."],
    ["settings-does-not-allow-saving-v8", "Settings does not allow saving before authoritative restoration completes."]
  ]) {
    allowSemanticClaimOnAllSurfaces(name, claim)
  }
  validateDecodedStringClaims(
    { codexReviewLedger: [{ reviewKind: "authorization-and-rollback-review" }] },
    "closed structural review enum fixture"
  )
  await negative(
    "structural-review-kind-does-not-exempt-finding",
    () => validateDecodedStringClaims(
      {
        codexReviewLedger: [{
          reviewKind: "authorization-and-rollback-review",
          findingSummary: "authorization-and-rollback-review: Deployment good to go."
        }]
      },
      "structural review enum finding fixture"
    ),
    "contains"
  )

  const metadataFixtures = [
    ["map", map.metadata],
    ["markdown", parseMarkedMetadata(markdown, "self-test markdown")],
    ["validator", scriptMetadata]
  ]
  for (const [label, metadata] of metadataFixtures) {
    for (const key of Object.keys(requiredMetadata)) {
      const missing = clone(metadata)
      delete missing[key]
      await negative(`${label}-missing-${key}`, () => validateMetadata(missing, label), "keys differ")
    }
  }

  for (const status of ["final", "approved", "DONE", "accepted", "complete", "certified"]) {
    const value = clone(map.metadata)
    value.status = status
    await negative(`status-${status}`, () => validateMetadata(value, "status fixture"), "status must be")
  }
  for (const decisionStatus of ["final", "approved", "DONE", "accepted", "complete", "certified"]) {
    const value = clone(map.metadata)
    value.decisionStatus = decisionStatus
    await negative(`decision-${decisionStatus}`, () => validateMetadata(value, "decision fixture"), "decisionStatus must be")
  }
  for (const evidence of ["present", 1]) {
    const value = clone(map.metadata)
    value.participantEvidence = evidence
    await negative(`participant-${evidence}`, () => validateMetadata(value, "participant fixture"), "participantEvidence must be")
  }
  {
    const value = clone(map.metadata)
    value.humanEvidence = "present"
    await negative("human-evidence-present", () => validateMetadata(value, "human fixture"), "humanEvidence must be")
  }
  {
    const value = clone(map.metadata)
    value.humanParticipantCount = 1
    await negative("human-participant-count-nonzero", () => validateMetadata(value, "human fixture"), "humanParticipantCount must be")
  }
  {
    const value = clone(map.metadata)
    value.notHumanUsabilityTested = false
    await negative("human-usability-claimed", () => validateMetadata(value, "human fixture"), "notHumanUsabilityTested must be")
  }
  {
    const value = clone(map.metadata)
    value.authorizationInterface = "HUMAN-APPROVAL-V1"
    await negative("human-authorization-interface", () => validateMetadata(value, "authorization fixture"), "authorizationInterface must be")
  }
  {
    const value = clone(map.metadata)
    value.requiredDependencyShas = ["a".repeat(40)]
    await negative("dependency-collection", () => validateMetadata(value, "dependency fixture"), "requiredDependencyShas must be")
  }
  {
    const value = clone(map.metadata)
    value.mustRebaseAndReverify = false
    await negative("rebase-false", () => validateMetadata(value, "rebase fixture"), "mustRebaseAndReverify must be")
  }
  for (const authorization of [true, "authorized"]) {
    const value = clone(map.metadata)
    value.productionAuthorization = authorization
    await negative(`production-${authorization}`, () => validateMetadata(value, "production fixture"), "productionAuthorization must be")
  }
  for (const [name, key, replacement, fragment] of [
    ["metadata-production-deployment-ready", "productionDeploymentStatus", "ready", "productionDeploymentStatus must be"],
    ["metadata-production-deployment-in-scope", "productionDeploymentScope", "in-scope", "productionDeploymentScope must be"],
    ["metadata-live-reviewer-bot", "liveEnvironmentReviewerType", "Bot", "liveEnvironmentReviewerType must be"],
    ["metadata-environment-change-authorized", "liveEnvironmentChangeAuthorization", "granted", "liveEnvironmentChangeAuthorization must be"],
    ["metadata-prior-receipts-reusable", "priorReviewReceiptsReusable", true, "priorReviewReceiptsReusable must be"]
  ]) {
    const value = clone(map.metadata)
    value[key] = replacement
    await negative(name, () => validateMetadata(value, "metadata fixture"), fragment)
  }

  const markdownMarker = markdown.match(/<!-- PLAN_009_METADATA_START[\s\S]*?PLAN_009_METADATA_END -->/u)?.[0]
  const validatorMarker = validatorSource.match(/\/\* PLAN_009_METADATA_START[\s\S]*?PLAN_009_METADATA_END \*\//u)?.[0]
  assert(markdownMarker !== undefined && validatorMarker !== undefined, "self-test marker fixtures are missing")
  await negative(
    "duplicate-markdown-metadata-block",
    () => parseMarkedMetadata(`${markdown}\n${markdownMarker}\n`, "duplicate markdown fixture"),
    "exactly one metadata start marker"
  )
  await negative(
    "duplicate-validator-metadata-block",
    () => parseMarkedMetadata(`${validatorSource}\n${validatorMarker}\n`, "duplicate validator fixture"),
    "exactly one metadata start marker"
  )
  await negative(
    "validator-post-review-byte-change",
    () => assertValidatorReviewIdentity(`${validatorSource}\n`, validatorSource),
    "byte-identical"
  )
  await negative(
    "duplicate-json-key",
    () => parseJsonNoDuplicateKeys('{"outer":{"status":"pending","status":"approved"}}', "duplicate fixture"),
    "duplicate JSON key"
  )
  await negative(
    "escaped-duplicate-json-key",
    () => parseJsonNoDuplicateKeys('{"status":"pending","\\u0073tatus":"approved"}', "escaped duplicate fixture"),
    "duplicate JSON key"
  )
  await negative(
    "prototype-json-key",
    () => parseJsonNoDuplicateKeys('{"__proto__":{"status":"approved"}}', "prototype fixture"),
    "forbidden JSON key"
  )
  await negative(
    "non-json-whitespace",
    () => parseJsonNoDuplicateKeys(`{\u00a0"status":"pending"}`, "whitespace fixture"),
    "not valid JSON"
  )
  await negative(
    "indented-duplicate-markdown-metadata-block",
    () => parseMarkedMetadata(`${markdown}\n${markdownMarker.replace(/^/gmu, "  ")}\n`, "indented duplicate fixture"),
    "exactly one metadata start marker"
  )
  await negative(
    "unicode-indented-duplicate-markdown-metadata-block",
    () => parseMarkedMetadata(`${markdown}\n${markdownMarker.replace(/^/gmu, "\u00a0")}\n`, "Unicode-indented duplicate fixture"),
    "exactly one metadata start marker"
  )

  {
    const value = clone(map.authorizationModel)
    value.humanUiUxApprovalArtifactRequired = true
    await negative("human-approval-artifact", () => validateAuthorizationModel(value), "human UI/UX approval artifacts cannot be required")
  }
  {
    const value = clone(map.authorizationModel)
    value.agentsCountAsHumans = true
    await negative("agents-count-as-humans", () => validateAuthorizationModel(value), "Codex agents cannot be counted as humans")
  }
  for (const [name, key, replacement, fragment] of [
    ["authorization-human-count", "humanParticipantCount", 5, "humanParticipantCount must remain 0"],
    ["authorization-codex-satisfies-live-review", "codexOnlyMaySatisfyLiveEnvironmentReview", true, "cannot satisfy the live User reviewer"],
    ["authorization-production-status", "productionDeploymentStatus", "ready", "production deployment status differs"],
    ["authorization-production-scope", "productionDeploymentScope", "in-scope", "production deployment scope differs"],
    ["authorization-live-reviewer-type", "liveEnvironmentReviewerType", "Bot", "live Environment reviewer type differs"],
    ["authorization-environment-change", "liveEnvironmentChangeAuthorization", "granted", "require separate authorization"],
    ["authorization-production-true", "productionAuthorization", true, "cannot authorize production"]
  ]) {
    const value = clone(map.authorizationModel)
    value[key] = replacement
    await negative(name, () => validateAuthorizationModel(value), fragment)
  }
  {
    const value = clone(map.upstreamDecisionInputs)
    value[0].acceptedDecisionSha = "a".repeat(40)
    await negative("bound-upstream-decision", () => validateUpstreamDecisionInputs(value), "acceptedDecisionSha must remain null")
  }
  {
    const tampered = clone(canonicalReviewFixture)
    tampered[0].findingSummary += " Tampered."
    await negative("tampered-review-record", () => validateCodexReviewLedger(tampered), "native review result differs")

    const badHash = clone(canonicalReviewFixture)
    badHash[0].recordSha256 = "0".repeat(64)
    await negative("review-record-hash-mismatch", () => validateCodexReviewLedger(badHash), "recordSha256 differs")

    const missingNativeEvidence = clone(canonicalReviewFixture)
    delete missingNativeEvidence[0].nativeEvidence
    await negative(
      "review-record-missing-native-evidence",
      () => validateCodexReviewLedger(missingNativeEvidence),
      "keys differ"
    )

    const corruptNativeBytes = clone(canonicalReviewFixture)
    corruptNativeBytes[0].nativeEvidence.reviewPrompt.bytes = Buffer.from("corrupt", "utf8").toString("base64")
    await negative(
      "review-record-corrupt-native-bytes",
      () => validateCodexReviewLedger(corruptNativeBytes),
      "byteLength differs"
    )

    for (const [name, evidenceKey, replacement, fragment] of [
      ["allocation-prompt", "allocationPrompt", `${nativeAllocationPromptUtf8} mutated`, "native allocation prompt bytes differ"],
      ["spawn-receipt", "spawnReceipt", JSON.stringify({ task_name: "/root/self-authored-review" }), "native spawn receipt bytes differ"],
      ["allocation-result", "allocationResult", "ALLOCATED-BY-SELF-AUTHORED-NAME.", "native allocation result bytes differ"],
      ["review-rubric", "reviewRubric", `${requiredCodexReviewTasks[0].reviewRubricUtf8} mutated`, "review rubric bytes differ"],
      ["review-prompt", "reviewPrompt", `${codexReviewPromptUtf8(canonicalReviewFixture[0], requiredCodexReviewTasks[0])} `, "exact review prompt bytes differ"],
      ["review-result", "reviewResult", `${JSON.stringify(codexReviewResultPayload(canonicalReviewFixture[0]))} `, "native review result must be one-line canonical JSON"]
    ]) {
      const value = clone(canonicalReviewFixture)
      value[0].nativeEvidence[evidenceKey] = encodeUtf8Evidence(replacement)
      await negative(`review-record-native-${name}`, () => validateCodexReviewLedger(value), fragment)
    }

    const nonzeroIntervalStart = clone(canonicalReviewFixture)
    nonzeroIntervalStart[0].reviewedSourceIntervals[packetPaths[0]].startByte = 1
    await negative(
      "review-record-nonzero-source-start",
      () => validateCodexReviewLedger(nonzeroIntervalStart),
      "startByte must be 0"
    )

    const emptyInterval = clone(canonicalReviewFixture)
    emptyInterval[0].reviewedSourceIntervals[packetPaths[0]].endByte = 0
    await negative(
      "review-record-empty-source-interval",
      () => validateCodexReviewLedger(emptyInterval),
      "endByte must be positive"
    )

    const invalidIntervalHash = clone(canonicalReviewFixture)
    invalidIntervalHash[0].reviewedSourceIntervals[packetPaths[0]].sha256 = "not-a-sha"
    await negative(
      "review-record-invalid-source-interval-hash",
      () => validateCodexReviewLedger(invalidIntervalHash),
      "sha256 is invalid"
    )

    const wrongSourceManifest = clone(canonicalReviewFixture)
    wrongSourceManifest[0].reviewedSourceManifestSha256 = "0".repeat(64)
    await negative(
      "review-record-wrong-source-manifest",
      () => validateCodexReviewLedger(wrongSourceManifest),
      "differs from its canonical intervals"
    )

    const promptUnboundInterval = clone(canonicalReviewFixture)
    promptUnboundInterval[0].reviewedSourceIntervals[packetPaths[0]].endByte += 1
    promptUnboundInterval[0].reviewedSourceManifestSha256 = sourceManifestSha256(promptUnboundInterval[0].reviewedSourceIntervals)
    await negative(
      "review-record-source-interval-not-bound-to-prompt",
      () => validateCodexReviewLedger(promptUnboundInterval),
      "exact review prompt bytes differ"
    )

    const refreshNativeResultAndRecord = (entry) => {
      entry.nativeEvidence.reviewResult = encodeUtf8Evidence(JSON.stringify(codexReviewResultPayload(entry)))
      entry.recordSha256 = sha256Utf8(JSON.stringify(codexReviewPayload(entry)))
    }
    const semanticFindingSummary = clone(canonicalReviewFixture)
    semanticFindingSummary[0].findingSummary = "Deployment good to go."
    refreshNativeResultAndRecord(semanticFindingSummary[0])
    await negative(
      "review-record-semantic-finding-summary",
      () => validateCodexReviewLedger(semanticFindingSummary),
      "affirmative production or implementation authorization"
    )
    const semanticFindingId = clone(canonicalReviewFixture)
    semanticFindingId[0].findingIds = ["Territory B won."]
    refreshNativeResultAndRecord(semanticFindingId[0])
    await negative(
      "review-record-semantic-finding-id",
      () => validateCodexReviewLedger(semanticFindingId),
      "free-form approval, pass, or selection claim"
    )

    const badOccurrence = clone(canonicalReviewFixture)
    badOccurrence[0].reviewOccurrenceId = "codex-only-uiux-v1-invented"
    await negative("review-occurrence-mismatch", () => validateCodexReviewLedger(badOccurrence), "reviewOccurrenceId differs")

    const priorTask = clone(canonicalReviewFixture)
    priorTask[0].taskId = "/root/" + ["topology", "fact", "check"].join("_")
    await negative("prior-cycle-review-task", () => validateCodexReviewLedger(priorTask), "taskId differs")

    for (const [cycle, taskIds] of [
      ["843", invalidatedReviewProvenanceRegistry.taskIds.slice(0, 3)],
      ["cd9920", invalidatedReviewProvenanceRegistry.taskIds.slice(3, 6)],
      ["stale-v2", invalidatedReviewProvenanceRegistry.taskIds.slice(6, 9)],
      ["stale-a4", invalidatedReviewProvenanceRegistry.taskIds.slice(9, 12)]
    ]) {
      for (const [index, taskId] of taskIds.entries()) {
        const rejectedTask = clone(canonicalReviewFixture)
        rejectedTask[index].taskId = taskId
        await negative(
          `rejected-${cycle}-review-task-${index + 1}`,
          () => validateCodexReviewLedger(rejectedTask),
          "contains invalidated review provenance identifier"
        )
      }
    }

    for (const [cycle, occurrenceIds] of [
      ["843", invalidatedReviewProvenanceRegistry.reviewOccurrenceIds.slice(0, 3)],
      ["cd9920", invalidatedReviewProvenanceRegistry.reviewOccurrenceIds.slice(3, 6)],
      ["stale-v2", invalidatedReviewProvenanceRegistry.reviewOccurrenceIds.slice(6, 9)],
      ["stale-a4", invalidatedReviewProvenanceRegistry.reviewOccurrenceIds.slice(9, 12)]
    ]) {
      for (const [index, occurrenceId] of occurrenceIds.entries()) {
        const rejectedOccurrence = clone(canonicalReviewFixture)
        rejectedOccurrence[index].reviewOccurrenceId = occurrenceId
        await negative(
          `rejected-${cycle}-review-occurrence-${index + 1}`,
          () => validateCodexReviewLedger(rejectedOccurrence),
          "contains invalidated review provenance identifier"
        )
      }
    }

    const priorDisposition = clone(canonicalReviewFixture)
    priorDisposition[0].disposition = ["accepted", "after", "repair"].join("-")
    await negative("prior-cycle-review-disposition", () => validateCodexReviewLedger(priorDisposition), "disposition differs")

    const wrongBase = clone(canonicalReviewFixture)
    wrongBase[0].reviewedBaseSha = "0".repeat(40)
    await negative("review-record-wrong-base", () => validateCodexReviewLedger(wrongBase), "reviewedBaseSha differs")

    for (const [index, invalidatedSubject] of invalidatedReviewSubjectShas.entries()) {
      const reusedSubject = clone(canonicalReviewFixture)
      reusedSubject[0].reviewedCommitSha = invalidatedSubject
      await negative(
        `invalidated-review-subject-${index + 1}`,
        () => validateCodexReviewLedger(reusedSubject),
        "contains invalidated review provenance identifier"
      )
    }

    const missingFinding = clone(canonicalReviewFixture)
    missingFinding[0].findingIds = []
    await negative("review-record-missing-finding-id", () => validateCodexReviewLedger(missingFinding), "must be non-empty")

    for (const [identifierIndex, identifier] of invalidatedReviewIdentifiers.entries()) {
      await negative(
        `invalidated-provenance-markdown-${identifierIndex + 1}`,
        () => validateMarkdown(`${markdown}\n${identifier}\n`),
        "contains invalidated review provenance identifier"
      )
      await negative(
        `invalidated-provenance-decoded-map-${identifierIndex + 1}`,
        () => validateDecodedStringClaims(
          { deep: { nested: [{ value: identifier }] } },
          "invalidated decoded-map provenance fixture"
        ),
        "contains invalidated review provenance identifier"
      )
      const summary = clone(canonicalReviewFixture)
      summary[0].findingSummary = `Invalidated receipt ${identifier}`
      await negative(
        `invalidated-provenance-finding-summary-${identifierIndex + 1}`,
        () => validateCodexReviewLedger(summary),
        "contains invalidated review provenance identifier"
      )
      const findingId = clone(canonicalReviewFixture)
      findingId[0].findingIds[0] = identifier
      await negative(
        `invalidated-provenance-finding-id-${identifierIndex + 1}`,
        () => validateCodexReviewLedger(findingId),
        "contains invalidated review provenance identifier"
      )
    }
    for (const [blobIndex, retiredBlob] of invalidatedReviewProvenanceRegistry.packetBlobShas.entries()) {
      for (const field of ["subject", "map", "plan", "validator", "reviewedPacketBlob"]) {
        await negative(
          `retired-packet-blob-${blobIndex + 1}-${field}`,
          () => validateDecodedStringClaims(
            { packetIdentity: { [field]: retiredBlob } },
            `retired packet blob ${field} fixture`
          ),
          "contains invalidated review provenance identifier"
        )
      }
      await negative(
        `retired-packet-blob-${blobIndex + 1}-deeply-nested`,
        () => validateDecodedStringClaims(
          { outer: [{ inner: { reviewedPacket: [{ blob: retiredBlob }] } }] },
          "deeply nested retired packet blob fixture"
        ),
        "contains invalidated review provenance identifier"
      )
      const escapedBlob = `\\u${retiredBlob.codePointAt(0).toString(16).padStart(4, "0")}${retiredBlob.slice(1)}`
      const escapedDecodedFixture = parseJsonNoDuplicateKeys(
        `{"outer":{"reviewedPacketBlob":"${escapedBlob}"}}`,
        "escaped retired packet blob fixture"
      )
      await negative(
        `retired-packet-blob-${blobIndex + 1}-json-escaped`,
        () => validateDecodedStringClaims(escapedDecodedFixture, "escaped retired packet blob fixture"),
        "contains invalidated review provenance identifier"
      )
      const retiredReviewedBlob = clone(canonicalReviewFixture)
      retiredReviewedBlob[0].reviewedPacketBlobs[packetPaths[0]] = retiredBlob
      await negative(
        `retired-packet-blob-${blobIndex + 1}-ledger-reviewed-packet-blob`,
        () => validateCodexReviewLedger(retiredReviewedBlob),
        "contains invalidated review provenance identifier"
      )
    }
    const maskedInvalidIdentifier = invalidatedReviewProvenanceRegistry.taskIds[0]
      .replace("review", "re-vie\u034Fw")
      .replaceAll("_", "/")
    await negative(
      "masked-invalidated-provenance-decoded-map",
      () => validateDecodedStringClaims({ nested: maskedInvalidIdentifier }, "masked invalidated provenance fixture"),
      "contains invalidated review provenance identifier"
    )
  }

  await negative(
    "invalidated-provenance-registry-source-tamper",
    () => validatorOutsideInvalidatedProvenanceRegistry(
      validatorSource.replace(invalidatedReviewProvenanceRegistry.taskIds[0], `${invalidatedReviewProvenanceRegistry.taskIds[0]}-tampered`)
    ),
    "registry source bytes differ"
  )
  await negative(
    "invalidated-provenance-registry-duplicate-start",
    () => validatorOutsideInvalidatedProvenanceRegistry(
      `${validatorSource}\n${["/* PLAN", "009", "INVALIDATED", "REVIEW", "PROVENANCE", "START */"].join("_")}\n`
    ),
    "exactly one invalidated-review provenance start marker"
  )

  {
    const populatedRawMap = rawMap.replace(
      '  "codexReviewLedger": []',
      `  "codexReviewLedger": ${JSON.stringify(canonicalReviewFixture, null, 2)}`
    )
    assert(populatedRawMap !== rawMap, "self-test populated map fixture was not constructed")
    assert(
      normalizeMapReviewRecords(populatedRawMap) === normalizeMapReviewRecords(rawMap),
      "self-test ledger-only map mutation must normalize identically"
    )
    const whitespaceMutation = rawMap.replace('"schemaVersion": 1', '"schemaVersion" : 1')
    await negative(
      "map-outside-ledger-whitespace-byte-mutation",
      () => assert(
        normalizeMapReviewRecords(whitespaceMutation) === normalizeMapReviewRecords(rawMap),
        "map outside-ledger bytes differ"
      ),
      "map outside-ledger bytes differ"
    )
    const escapeMutation = rawMap.replace('"artifact": "plans/', '"artifact": "\\u0070lans/')
    await negative(
      "map-outside-ledger-escape-byte-mutation",
      () => assert(
        normalizeMapReviewRecords(escapeMutation) === normalizeMapReviewRecords(rawMap),
        "map outside-ledger bytes differ"
      ),
      "map outside-ledger bytes differ"
    )
    const planWhitespaceMutation = markdown.replace("This packet is provisional prework only.", "This  packet is provisional prework only.")
    await negative(
      "plan-outside-review-whitespace-byte-mutation",
      () => assert(
        normalizePlanReviewRecords(planWhitespaceMutation) === normalizePlanReviewRecords(markdown),
        "plan outside-review bytes differ"
      ),
      "plan outside-review bytes differ"
    )
  }

  for (const key of ["upstreamInputRef", "artifactSha256ByPath", "externalEvidenceId"]) {
    const value = clone(map)
    value.dependencySlots[0][key] = key === "externalEvidenceId" ? "operator-record" : "x"
    await negative(`slot-${key}`, () => validateDependencySlots(value.dependencySlots), `${key} must remain null`)
  }
  {
    const value = clone(map)
    value.dependencySlots[0].coordinateKind = "external-operator-evidence"
    await negative("slot-coordinate-kind", () => validateDependencySlots(value.dependencySlots), "coordinateKind differs")
  }
  {
    const value = clone(map)
    value.dependencySlots.pop()
    await negative("missing-dependency-slot", () => validateDependencySlots(value.dependencySlots), "must contain 9 entries")
  }
  {
    const value = clone(map.dependencySlots)
    const integrated = value.find((slot) => slot.id === "integrated-consumer-validation")
    integrated.canonicalConsumers = integrated.canonicalConsumers.filter((path) => path !== "docs/OPEN.md")
    await negative(
      "integrated-validation-missing-open-consumer",
      () => validateDependencySlots(value),
      "canonicalConsumers differ"
    )
  }
  await negative(
    "plan-008-open-consumer-contract",
    async () => validatePlan008OpenConsumerContract(
      (await readUtf8("plans/008-run-integrated-consumer-ux-validation.md")).replace(
        "| `correctness-confounders` | `unresolved` | `docs/OPEN.md` |",
        "| `correctness-confounders` | `unresolved` | `docs/LANDSCAPE.md` |"
      )
    ),
    "correctness-confounders to docs/OPEN.md"
  )
  {
    const [deploymentFixture, workflowFixture] = await Promise.all([
      readUtf8("docs/DEPLOYMENT.md"),
      readUtf8(".github/workflows/cloudflare-production.yml")
    ])
    await negative(
      "deployment-source-missing-owner-review",
      () => validateRepositoryDeploymentSources(
        deploymentFixture.replace("approval from the repository owner `mannyc2`", "no approval is configured"),
        workflowFixture
      ),
      "owner approval"
    )
    await negative(
      "deployment-source-missing-environment-binding",
      () => validateRepositoryDeploymentSources(
        deploymentFixture,
        workflowFixture.replace("    environment: production", "    environment: cloudflare-preview")
      ),
      "production Environment"
    )
    await negative(
      "deployment-source-missing-certification-dependency",
      () => validateRepositoryDeploymentSources(
        deploymentFixture,
        workflowFixture.replace("    needs: [preflight, certification]", "    needs: preflight")
      ),
      "preflight and certification"
    )
  }
  {
    const value = clone(map)
    value.unknown = true
    await negative("unknown-map-key", () => validateMap(value, JSON.stringify(value), { checkGit: false }), "keys differ")
  }
  {
    const value = clone(map)
    value.observations.routeRegistry.aliases = []
    await negative("unknown-observation-key", () => validateMap(value, JSON.stringify(value), { checkGit: false }), "routeRegistry keys differ")
  }
  {
    const value = clone(map)
    delete value.observations.rollout.launchAnalyticsEnabled
    await negative("missing-rollout-key", () => validateMap(value, JSON.stringify(value), { checkGit: false }), "rollout keys differ")
  }
  for (const [name, mutate, fragment] of [
    ["rollout-production-in-scope", (value) => { value.observations.rollout.productionDeploymentInScope = true }, "production deployment must remain out of scope"],
    ["rollout-reviewer-type", (value) => { value.observations.rollout.liveProductionEnvironment.requiredReviewerType = "Bot" }, "reviewer type differs"],
    ["rollout-codex-satisfies-reviewer", (value) => { value.observations.rollout.liveProductionEnvironment.codexOnlyMaySatisfyRequiredReviewer = true }, "cannot satisfy the live User reviewer"],
    ["rollout-environment-change-authorized", (value) => { value.observations.rollout.liveProductionEnvironment.environmentChangeAuthorizedByPlan009 = true }, "cannot authorize an Environment change"],
    ["rollout-missing-deployment-doc", (value) => { value.observations.rollout.liveProductionEnvironment.repositoryEvidence.shift() }, "repository evidence differs"],
    ["rollout-arbitrary-tranche-revert", (value) => { value.observations.rollout.rollbackPolicy.directRevertAllowed.push("any-tranche") }, "allowlist differs"],
    ["rollout-arbitrary-range-revert", (value) => { value.observations.rollout.rollbackPolicy.directRevertAllowed.push("arbitrary-range") }, "allowlist differs"],
    ["rollout-isolated-presentation-revert", (value) => { value.observations.rollout.rollbackPolicy.directRevertAllowed.push("isolated-presentation") }, "allowlist differs"],
    ["rollout-missing-forward-fix", (value) => { value.observations.rollout.rollbackPolicy.mandatoryFallback.shift() }, "mandatory fallback differs"],
    ["rollout-missing-full-rebuild", (value) => { value.observations.rollout.rollbackPolicy.mandatoryFallback.splice(1, 1) }, "mandatory fallback differs"],
    ["rollout-missing-inactive-preview", (value) => { value.observations.rollout.rollbackPolicy.mandatoryFallback.splice(2, 1) }, "mandatory fallback differs"],
    ["rollout-missing-recertification", (value) => { value.observations.rollout.rollbackPolicy.mandatoryFallback.pop() }, "mandatory fallback differs"]
  ]) {
    const value = clone(map)
    mutate(value)
    await negative(name, () => validateMap(value, JSON.stringify(value), { checkGit: false }), fragment)
  }
  {
    const value = clone(map)
    value.knownPreMigrationConfounders[0].unknownAlias = "unsafe"
    await negative("unknown-confounder-key", () => validateMap(value, JSON.stringify(value), { checkGit: false }), "knownPreMigrationConfounders[0] keys differ")
  }
  {
    const value = clone(map)
    value.knownPreMigrationConfounders = value.knownPreMigrationConfounders.filter(
      (entry) => entry.id !== "settings-preferences-restoration-race"
    )
    await negative(
      "missing-settings-restoration-race",
      () => validateSupportingRecordSchema(value),
      "known pre-migration confounders differ"
    )
  }
  {
    const value = clone(map)
    value.knownPreMigrationConfounders[3].evidence.pop()
    await negative(
      "settings-restoration-race-missing-browser-evidence",
      () => validateSupportingRecordSchema(value),
      "settings restoration race evidence differs"
    )
  }
  {
    const value = clone(map)
    value.knownPreMigrationConfounders[3].requiredBeforeVisualMigration = "Load preferences eventually."
    await negative(
      "settings-restoration-race-weakened-action",
      () => validateSupportingRecordSchema(value),
      "settings restoration race required action differs"
    )
  }
  {
    const value = clone(map)
    value.topologyAreas[0] = "components"
    await negative("unknown-topology-alias", () => validateMap(value, JSON.stringify(value), { checkGit: false }), "topologyAreas differ")
  }
  {
    const value = clone(map)
    value.prohibitedInferences[0] = ""
    await negative("empty-prohibited-inference", () => validateMap(value, JSON.stringify(value), { checkGit: false }), "must be a non-empty string")
  }
  {
    const value = clone(map)
    value.fileRecords.find((record) => !criticalAnchors.includes(record.path)).role = "Production is " + "authorized."
    await negative(
      "map-production-authorization-phrase",
      () => validateMap(value, JSON.stringify(value), { checkGit: false }),
      "affirmative production or implementation authorization"
    )
  }
  await negative(
    "decoded-map-production-authorization-phrase",
    () => validateDecodedStringClaims(
      parseJsonNoDuplicateKeys('{"claim":"Production is authoriz\\u0065d."}', "decoded fixture"),
      "decoded fixture"
    ),
    "affirmative production or implementation authorization"
  )
  for (const [name, claim, fragment] of [
    ["decoded-map-done", "Plan 009 is DONE.", "narrative graduated-state claim"],
    ["decoded-map-migration-final", "This migration plan is final.", "narrative graduated-state claim"],
    ["decoded-map-packet-approved", "This packet is approved.", "narrative graduated-state claim"],
    ["decoded-map-packet-done", "The packet is DONE.", "narrative graduated-state claim"],
    ["decoded-map-migration-approved", "The migration is approved.", "narrative graduated-state claim"],
    ["decoded-map-implementation-approved", "Implementation is approved.", "narrative graduated-state claim"],
    ["decoded-map-plan-authorizes-implementation", "This plan authorizes implementation.", "affirmative production or implementation authorization"],
    ["decoded-map-comment-split-authorization", "This plan autho<!--x-->rizes implementation.", "affirmative production or implementation authorization"],
    ["decoded-map-implementation-proceeds", "Implementation may proceed.", "affirmative production or implementation authorization"],
    ["decoded-map-ready-to-implement", "We are ready to implement.", "affirmative production or implementation authorization"],
    ["decoded-map-human-approval", "A human reviewer approved this plan.", "human gate or approval claim"],
    ["decoded-map-human-approval-received", "Human approval has been received.", "human gate or approval claim"],
    ["decoded-map-humans-approved", "Humans approved the plan.", "human-review claim"],
    ["decoded-map-usability-with-users", "A usability study with 12 users passed.", "nonzero human usability evidence"],
    ["decoded-map-usability-by-users", "Usability testing was completed by 12 users.", "nonzero human usability evidence"],
    ["decoded-map-agent-human", "Codex agents count as humans.", "counts Codex agents as humans"],
    ["decoded-map-alternate-interface", "The interface accepts HUMAN-APPROVAL-V1.", "non-Codex authorization interface"],
    ["decoded-map-release-proceed", "Release to production may proceed.", "affirmative production or implementation authorization"],
    ["decoded-map-rollout-cleared", "Production rollout is cleared.", "affirmative production or implementation authorization"],
    ["decoded-map-deploy-approval", "We have approval to deploy to production.", "affirmative production or implementation authorization"],
    ["decoded-map-upstream-sha", `Step 02 decision SHA: ${("de" + "ad" + "be" + "ef").repeat(5)}`, "bound or invented upstream coordinate"],
    ["decoded-map-unlabeled-upstream-sha", `Step 02 uses ${("de" + "ad" + "be" + "ef").repeat(5)}.`, "unverified SHA literal"],
    ["decoded-map-short-upstream-sha", `Step 2 points at ${"de" + "ad" + "be" + "e"}.`, "unverified SHA literal"]
  ]) {
    await negative(name, () => validateDecodedStringClaims({ claim }, "decoded narrative fixture"), fragment)
  }
  {
    const value = clone(map)
    const claim = `Step 02 uses ${("de" + "ad" + "be" + "ef").repeat(5)}.`
    value.fileRecords.find((record) => !criticalAnchors.includes(record.path)).role = claim
    const encodedClaim = [...claim]
      .map((character) => `\\u${character.codePointAt(0).toString(16).padStart(4, "0")}`)
      .join("")
    const raw = JSON.stringify(value).replace(JSON.stringify(claim), `"${encodedClaim}"`)
    const parsed = parseJsonNoDuplicateKeys(raw, "Unicode-escaped map fixture")
    await negative(
      "unicode-escaped-map-upstream-sha",
      () => validateMap(parsed, raw, { checkGit: false }),
      "unverified SHA literal"
    )
  }
  for (const path of ["/absolute", "../parent", "back\\slash", "https://example.test/a", "apps/*", "apps//double"]) {
    await negative(`path-${path}`, () => validatePathShape(path, "path fixture"), "path fixture")
  }
  {
    const records = clone(map.fileRecords)
    records.push(clone(records[0]))
    await negative("duplicate-file", () => validateFileRecords(records, { checkGit: false }), "duplicate path")
  }
  {
    const records = clone(map.fileRecords).filter((record) => record.path !== criticalAnchors[0])
    await negative("missing-anchor", () => validateFileRecords(records, { checkGit: false }), "critical topology anchor missing")
  }
  for (const [contractPath, contract] of Object.entries(requiredFileRecordContracts)) {
    const testStem = contractPath.replaceAll(/[^a-z0-9]+/giu, "-").replace(/^-|-$/gu, "")
    {
      const records = clone(map.fileRecords).filter((record) => record.path !== contractPath)
      await negative(
        `required-file-missing-${testStem}`,
        () => validateFileRecords(records, { checkGit: false }),
        "critical topology anchor missing"
      )
    }
    {
      const records = clone(map.fileRecords)
      records.find((record) => record.path === contractPath).migrationSeam += " Mutated."
      await negative(
        `required-file-seam-${testStem}`,
        () => validateFileRecords(records, { checkGit: false }),
        "critical topology contract digest differs"
      )
    }
    {
      const records = clone(map.fileRecords)
      records.find((record) => record.path === contractPath).trancheOwnership = ["tranche-08-invented"]
      await negative(
        `required-file-tranche-${testStem}`,
        () => validateFileRecords(records, { checkGit: false }),
        "critical topology contract digest differs"
      )
    }
    {
      const records = clone(map.fileRecords)
      records.find((record) => record.path === contractPath).authority = contract.authority === "production-source"
        ? "build-release"
        : "production-source"
      await negative(
        `required-file-authority-${testStem}`,
        () => validateFileRecords(records, { checkGit: false }),
        "critical topology contract digest differs"
      )
    }
  }
  for (const [anchorIndex, anchorPath] of criticalAnchors.entries()) {
    const stem = anchorPath.replaceAll(/[^a-z0-9]+/giu, "-").replace(/^-|-$/gu, "")
    for (const [field, mutate] of [
      ["areas", (record) => { record.areas = [...record.areas, requiredAreas.find((area) => !record.areas.includes(area))] }],
      ["role", (record) => { record.role = `${record.role} Mutated role.` }],
      ["migration-seam", (record) => { record.migrationSeam = `${record.migrationSeam} Mutated seam.` }],
      ["authority", (record) => { record.authority = record.authority === "production-source" ? "build-release" : "production-source" }],
      ["tranche-ownership", (record) => { record.trancheOwnership = ["tranche-invented"] }]
    ]) {
      const records = clone(map.fileRecords)
      const record = records.find((entry) => entry.path === anchorPath)
      mutate(record)
      await negative(
        `critical-anchor-${anchorIndex + 1}-${stem}-${field}`,
        () => validateCriticalFileRecordContracts(records),
        "critical topology contract digest differs"
      )
    }
  }
  for (const [name, field, replacement] of [
    ["service-worker-decorative-role", "role", "Decorative service-worker file."],
    ["service-worker-ignorable-seam", "migrationSeam", "This file is ignorable during migration."],
    ["service-worker-nonproduction-authority", "authority", "test-evidence"]
  ]) {
    const records = clone(map.fileRecords)
    records.find((record) => record.path === "apps/site/public/sw.js")[field] = replacement
    await negative(name, () => validateCriticalFileRecordContracts(records), "critical topology contract digest differs")
  }
  {
    const records = clone(map.fileRecords)
    records[0] = null
    await negative("null-file-record", () => validateFileRecords(records, { checkGit: false }), "must be an object")
  }
  {
    const records = clone(map.fileRecords)
    records[0].areas = ["component", "components"]
    await negative("unknown-file-area", () => validateFileRecords(records, { checkGit: false }), "unknown area")
  }
  {
    const source = markdown.replace(/^### Tranche 8:[^\n]+\n/mu, "")
    await negative("missing-tranche", () => validateMarkdown(source), "exactly eight tranche headings")
  }
  {
    const source = markdown.replace("### Tranche 1:", "### Tranche 2:")
    await negative("duplicate-tranche", () => validateMarkdown(source), "ordered 1 through 8")
  }
  for (const [index, row] of requiredTopologyTableRows.entries()) {
    {
      const source = markdown.replace(`${row}\n`, "")
      await negative(
        `missing-topology-ownership-row-${index + 1}`,
        () => validateMarkdown(source),
        "migration draft topology row differs"
      )
    }
    {
      const source = markdown.replace(row, row.replace("Tranche", "Stage"))
      await negative(
        `mutated-topology-ownership-row-${index + 1}`,
        () => validateMarkdown(source),
        "migration draft topology row differs"
      )
    }
  }
  {
    const source = markdown.replace(
      "Production deployment is blocked and out of scope while the live `production`\nEnvironment requires a reviewer whose GitHub type is `User`. Codex cannot\nsatisfy or bypass that rule, and Plan 009 cannot change the Environment. Any\nfuture Environment change requires separate authorization and repository\nattestation.\n",
      ""
    )
    await negative(
      "missing-canonical-production-blocker",
      () => validateMarkdown(source),
      "production deployment blocker differs"
    )
  }
  {
    const source = markdown.replace(
      "disable every preference control and Save until",
      "allow preference edits and Save before"
    )
    await negative(
      "weakened-tranche-one-settings-restoration",
      () => validateMarkdown(source),
      "Tranche 1 settings restoration contract is missing"
    )
  }
  for (const [name, claim] of [
    ["settings-save-before-load", "Settings may save defaults before authoritative restoration completes."],
    ["settings-remain-available", "Settings editing and saving defaults remain available until authoritative restoration resolves."],
    ["settings-controls-write-unresolved", "Controls and Save may write default values while IndexedDB restoration is unresolved."],
    ["settings-controls-enabled", "Settings controls are enabled before authoritative restoration completes."],
    ["settings-save-active", "Settings Save is active before authoritative restoration completes."],
    ["settings-editing-possible", "Settings editing is possible before authoritative restoration completes."],
    ["settings-must-not-disable", "Settings must not disable editing before authoritative restoration completes."],
    ["settings-saving-not-prohibited", "Settings saving is not prohibited before authoritative restoration completes."],
    ["settings-need-not-disable", "Settings need not disable editing before authoritative restoration completes."],
    ["settings-nothing-prevents-save", "Nothing prevents Settings Save before authoritative restoration completes."],
    ["settings-not-inactive", "Settings controls are not inactive before authoritative restoration completes."],
    ["settings-not-unavailable", "Settings controls are not unavailable before authoritative restoration completes."],
    ["settings-save-not-locked", "Settings Save is not locked before authoritative restoration completes."],
    ["settings-save-not-off", "Settings Save is not turned off before authoritative restoration completes."],
    ["settings-remain-editable", "Settings remain editable before authoritative restoration completes."],
    ["settings-save-open", "Settings Save is open before authoritative restoration completes."],
    ["settings-save-works", "The Settings Save works before authoritative restoration completes."],
    ["settings-save-accepts-clicks", "The Settings Save accepts clicks until authoritative load returns."],
    ["settings-let-save", "Settings let users save before authoritative restoration completes."],
    ["settings-nothing-stops-save", "Nothing stops Settings Save before authoritative restoration completes."],
    ["settings-write-defaults", "Settings write defaults before authoritative restoration completes."],
    ["settings-saved-defaults", "Settings saved defaults before authoritative restoration completed."],
    ["settings-defaults-saved-passive", "Default values were saved by Settings before authoritative restoration completed."],
    ["settings-saving-need-not-wait", "Settings saving need not wait for authoritative restoration."],
    ["settings-not-read-only", "Settings controls are not read-only before authoritative restoration completes."],
    ["settings-read-write", "Settings controls are read-write before authoritative restoration completes."],
    ["masked-settings-enabled", "Set-tings controls remain enabled before authoritative restoration completes."],
    ["settings-not-required-disable", "Settings are not required to disable editing before authoritative restoration completes."],
    ["settings-are-editable", "Settings are editable before authoritative restoration completes."],
    ["settings-write-access-open", "Settings write access stays open before authoritative restoration completes."],
    ["settings-edits-accepted", "Settings edits are accepted before authoritative restoration completes."],
    ["settings-must-persist-defaults", "Settings must persist defaults before authoritative restoration completes."],
    ["settings-need-persist-preferences", "Settings need to persist initial preferences while authoritative load is pending."],
    ["preference-writes-possible", "Preference writes are possible pending authoritative restoration."],
    ["controls-remain-enabled", "Controls remain enabled before authoritative restoration completes."],
    ["settings-accepts-edits", "Settings accepts edits before authoritative restoration completes."],
    ["settings-stores-defaults", "Settings stores defaults before authoritative restoration completes."],
    ["settings-persists-defaults", "Settings persists defaults before authoritative restoration completes."],
    ["settings-wrote-defaults", "Settings wrote defaults before authoritative restoration completed."],
    ["save-clicked", "Save was clicked before authoritative restoration completed."],
    ["settings-has-write-access", "Settings has write access before authoritative restoration completes."],
    ["settings-unlocked", "Settings remains unlocked before authoritative restoration completes."],
    ["settings-not-been-disabled", "Settings has not been disabled before authoritative restoration completes."],
    ["no-disabled-settings-state", "No disabled state exists for Settings before authoritative restoration completes."],
    ["settings-editing-unblocked", "Settings editing is unblocked before authoritative restoration completes."],
    ["users-modify-settings", "Users can modify Settings before authoritative restoration completes."],
    ["settings-overwrite-preference", "Settings can overwrite a preference before authoritative restoration completes."],
    ["settings-form-submits", "The Settings form submits before authoritative restoration completes."],
    ["users-edit-settings-v8", "Users edit Settings before authoritative restoration completes."],
    ["save-persists-defaults-v8", "Save persists defaults before authoritative restoration completes."],
    ["save-writes-defaults-v8", "Save writes defaults before authoritative restoration completes."],
    ["save-stores-defaults-v8", "Save stores defaults before authoritative restoration completes."],
    ["save-overwrites-defaults-v8", "Save overwrites defaults before authoritative restoration completes."],
    ["clicking-save-persists-v8", "Clicking Save persists defaults before authoritative restoration completes."],
    ["form-writes-defaults-v8", "The form writes defaults before authoritative restoration completes."],
    ["form-stores-defaults-v8", "The form stores defaults before authoritative restoration completes."],
    ["form-persists-defaults-v8", "The form persists defaults before authoritative restoration completes."],
    ["preferences-stored-by-save-v8", "Preferences are stored by Save before authoritative restoration completes."],
    ["settings-saving-succeeds-v8", "Settings saving succeeds before authoritative restoration completes."],
    ["settings-continues-accepting-v8", "Settings continues accepting changes before authoritative restoration completes."],
    ["settings-does-not-stop-v8", "Settings does not stop edits before authoritative restoration completes."],
    ["settings-save-during-restoration-v8", "Settings can save defaults during authoritative restoration."],
    ["settings-save-ahead-restoration-v8", "Settings can save defaults ahead of authoritative restoration."],
    ["settings-save-before-indexeddb-v8", "Settings can save defaults before IndexedDB finishes loading."],
    ["settings-save-after-failure-v8", "Settings can save defaults after restoration failure but before the failure is handled."],
    ["settings-editable-on-failure-v8", "On restoration failure, Settings remains editable before the error is handled."],
    ["save-records-defaults-variant", "Save records defaults before authoritative restoration completes."],
    ["users-alter-preferences-variant", "Users alter preferences before authoritative restoration completes."],
    ["submit-button-usable-variant", "The submit button stays usable before authoritative restoration completes."],
    ["settings-writable-indexeddb-variant", "Settings are writable pending IndexedDB initialization."],
    ["saving-reenabled-during-variant", "Saving is re-enabled during authoritative restoration."],
    ["controls-enabled-load-failure-variant", "On load failure, controls stay enabled until the error is handled."],
    ["controls-input-indexeddb-variant", "The controls accept input before IndexedDB finishes initializing."],
    ["form-commits-restoration-variant", "The form commits default preferences while restoration is running."],
    ["users-update-settings-v10", "Users update Settings before authoritative restoration completes."],
    ["current-settings-persisted-v10", "Current settings are persisted before authoritative restoration completes."],
    ["form-not-disabled-v10", "The Settings form is not disabled before authoritative restoration completes."],
    ["save-while-restoration-runs-v10", "Settings can save while restoration runs."],
    ["save-enabled-after-failure-v10", "After restoration fails, Save stays enabled until the error is handled."],
    ["masked-settings-save-v10", "Set-tings can sa-ve defaults before authoritative res-tor-ation completes."],
    ["current-preferences-passive-v10", "Current preferences are saved before authoritative restoration completes."],
    ["save-current-state-v10", "Save persists the current state before authoritative restoration completes."],
    ["form-accepts-input-v10", "The form accepts input before authoritative restoration completes."],
    ["update-indexeddb-loading-v10", "Users update Settings while IndexedDB is loading."],
    ["update-restoration-proceeds-v10", "Users revise Settings as authoritative restoration proceeds."],
    ["update-read-outstanding-v10", "Users adjust Settings while the authoritative read is outstanding."],
    ["unhandled-failure-save-v10", "An unhandled restoration failure leaves Save active."],
    ["mixed-disabled-enabled-v10", "Settings are disabled but Save remains enabled before authoritative restoration completes."],
    ["mixed-save-negative-update-v10", "Save cannot write, but users can update Settings before authoritative restoration completes."],
    ["failure-recovery-window-v10", "When IndexedDB restoration fails, controls stay active until recovery completes."],
    ["settings-writes-continue-v10", "Settings writes continue before authoritative restoration completes."]
  ]) {
    await rejectSemanticClaimOnAllSurfaces(
      `settings-restoration-${name}`,
      claim,
      "allows Settings to edit or save defaults"
    )
  }
  {
    const source = markdown.replace("**Rollback boundary:**", "**Reversion note:**")
    await negative("missing-rollback", () => validateMarkdown(source), "unsafe non-dependency-closed rollback claim")
  }
  for (const [name, claim] of [
    ["rollback-independent-slices", "Revert each slice independently."],
    ["rollback-ui-normal", "UI-only changes revert normally."],
    ["rollback-isolated-presentation", "Revert presentation."],
    ["rollback-precise-tranche", "Revert the precise tranche."],
    ["rollback-ordered-range", "Revert the ordered migration range."],
    ["rollback-earlier-tranche-with-dependents", "Revert Tranche 3 while later tranches remain."],
    ["rollback-serve-earlier-version", "Serve an earlier version after a compatibility check."],
    ["rollback-any-tranche-independent", "Any tranche can be reverted independently."],
    ["rollback-roll-back-presentation", "Roll back the isolated presentation subset."],
    ["rollback-presentation-layer-independent", "The presentation layer may be rolled back independently."],
    ["rollback-arbitrary-tranche-range", "Roll back an arbitrary tranche range."],
    ["rollback-tranche-on-own", "Tranche 3 can be rolled back on its own."],
    ["rollback-just-visual", "Roll back just the visual changes."],
    ["rollback-without-dependents", "Revert one tranche without its dependents."],
    ["rollback-any-slice", "Rollback any slice independently."],
    ["rollback-visual-layer-revertible", "The visual layer is revertible."],
    ["rollback-tranche-safe", "Tranche 4 rollback is safe."],
    ["rollback-css-separate", "The CSS may be reverted separately."],
    ["rollback-closed-tranche", "Roll back a dependency-closed tranche."],
    ["rollback-unrelated-negative", "No warning remains and rollback any slice independently."],
    ["rollback-only-service-worker", "Roll back only the service worker."],
    ["restore-only-service-worker", "Restore only the service worker."],
    ["route-layer-restored-alone", "The route layer was restored alone."],
    ["compatibility-any-tranche-revertible", "A compatibility check makes any tranche revertible."],
    ["back-out-tranche", "Back out Tranche 3 independently."],
    ["undo-visual-layer", "Undo only the visual layer."],
    ["restore-previous-release", "Restore the previous release."],
    ["roll-back-to-tranche", "Roll the site back to Tranche 3."],
    ["rollback-target-any-tranche", "Rollback can target any tranche."],
    ["presentation-only-rollback", "A presentation-only rollback is fine."],
    ["downgrade-route-layer", "Downgrade only the route layer."],
    ["switch-back-previous-release", "Switch back to the previous release."],
    ["redeploy-previous-release", "Redeploy the previous release."],
    ["fall-back-previous-release", "Fall back to the previous release."],
    ["combining-reverted-service-worker", "The service worker was reve\u034Frted alone."],
    ["hyphen-revert-service-worker", "Re-vert only the service worker."],
    ["mixed-prohibition-restore", "Rollback Tranche 3 is prohibited and restore only the service worker."],
    ["restore-site", "Restore the site."],
    ["restore-application", "Restore the application."],
    ["site-restored", "The site was restored."],
    ["rollback-completed", "A rollback was completed."],
    ["rollback-occurred", "The rollback occurred."],
    ["rollback-succeeded", "The rollback succeeded."],
    ["rollback-underway", "The rollback is underway."],
    ["exact-tip-plus-restore", "Revert the current unmerged tip and restore the site."],
    ["restore-navigation-module", "Restore only the navigation module."],
    ["exact-tip-plus-any-change", "Revert the current unmerged tip and any other change."],
    ["exact-tip-plus-database", "Revert the current unmerged tip and the database."],
    ["rollback-done", "The rollback is done."],
    ["rollback-complete", "The rollback is complete."],
    ["rollback-over", "The rollback is over."],
    ["rollback-failed", "The rollback failed."],
    ["rollback-ended", "The rollback ended."],
    ["fallback-active", "The fallback is active."],
    ["service-worker-state-restored", "The service worker state was restored."],
    ["route-state-restored", "The route state was restored."],
    ["tranche-reversion-occurred", "Reversion to Tranche 3 occurred."],
    ["tranche-revertibility-applies", "Revertibility applies to Tranche 3."],
    ["backout-tranche", "Backout Tranche 3."],
    ["tranche-reversed", "The tranche can be reversed."],
    ["masked-back-out-worker", "Ba-ck out the service worker."],
    ["masked-site-switched-back", "The site swit-ched back."],
    ["masked-previous-release", "Serve the pre-vious release after a compatibility check."],
    ["inline-path-switch-back", "Switch `apps/site/public/sw.js` back."],
    ["inline-path-back-out", "Back `apps/site/public/sw.js` out only the service worker."],
    ["exact-tip-with-database", "Revert the current unmerged tip with the database."],
    ["closed-suffix-including-dns", "Revert the dependency-closed suffix including DNS."],
    ["exact-tip-alongside-service", "Revert the current unmerged tip alongside the service."],
    ["closed-suffix-covering-worker", "Revert the dependency-closed suffix covering the worker."],
    ["exact-tip-together-alongside", "Revert the current unmerged tip together alongside the route layer."],
    ["must-rollback-worker", "We must rollback only the service worker."],
    ["should-revert-route", "We should revert only the route layer."],
    ["requires-reverting-worker", "The plan requires reverting the service worker."],
    ["future-release-rollback", "A future release can rollback only the service worker."],
    ["before-launch-rollback", "Before launch, rollback only the service worker."],
    ["need-back-out-css", "We need to back out only the CSS."],
    ["masked-restoring-worker", "Rest-oring only the service worker."],
    ["masked-reverting-worker", "Rever-ting only the service worker."],
    ["masked-switching-back-worker", "Switch-ing back only the service worker."],
    ["masked-downgrading-worker", "Down-grad-ing only the service worker."],
    ["restoration-succeeded-worker", "The service worker restoration succeeded."],
    ["fallback-happened-worker", "The service worker fallback happened."],
    ["restore-backup-database", "Restore the backup database."],
    ["restore-stored-data", "Restore only the stored data."],
    ["rollback-initiated", "We initiated the rollback."],
    ["rollbacks-supported", "Rollbacks are supported."],
    ["worker-underwent-rollback", "The service worker underwent rollback."],
    ["worker-rollback-configured", "The service worker rollback is configured."],
    ["tranche-rollback-support", "Each tranche has rollback support."],
    ["compatibility-proves-rollback", "The compatibility check proves Tranche 4 rollback."],
    ["fallback-succeeded", "Fallback succeeded."],
    ["fallback-failed", "Fallback failed."],
    ["activate-fallback", "Activate fallback."],
    ["use-fallback", "Use the fallback."],
    ["tranche-includes-fallback", "Each tranche includes a fallback."],
    ["masked-worker-reverting", "The service worker is rev-er-ting."],
    ["masked-route-restoring", "The route layer is res-tor-ing."],
    ["masked-site-switching-back", "The site is switch-ing back."],
    ["masked-worker-downgrading", "The worker was downgrad-ing."],
    ["masked-layer-undoing", "The visual layer is un-doing."],
    ["worker-backing-out", "The service worker is backing out."],
    ["route-reversal-underway", "The route layer reversal is underway."],
    ["cross-clause-worker-period", "Revert the current unmerged tip. The service worker too."],
    ["cross-clause-worker-semicolon", "Revert the current unmerged tip; the service worker too."],
    ["cross-clause-path", "Revert the current unmerged tip. Also `apps/site/public/sw.js`."],
    ["cross-clause-dns", "Roll back the dependency-closed suffix. Include DNS too."],
    ["conditional-restore-worker-v8", "If needed, restore the service worker."],
    ["operator-restores-worker-v8", "The operator restores the service worker."],
    ["operator-rolls-worker-back-v8", "The operator rolls the service worker back."],
    ["worker-can-be-restored-v8", "The service worker can be restored."],
    ["route-can-undergo-restoration-v8", "The route layer can undergo restoration."],
    ["worker-restore-required-v8", "A service worker restore is required."],
    ["worker-restoration-supported-v8", "Restoration of the service worker is supported."],
    ["plan-restore-worker-v8", "We plan to restore the service worker."],
    ["rollback-option-available-v8", "A rollback option is available."],
    ["rollback-double-negative-v8", "No rollback is unavailable."],
    ["nothing-prevents-rollback-v8", "Nothing prevents rollback."],
    ["no-barrier-rollback-v8", "There is no barrier to rollback."],
    ["rollback-cannot-fail-v8", "Rollback cannot fail."],
    ["rollback-mechanism-validated-v8", "The rollback mechanism passed validation."],
    ["route-falls-back-v8", "The route layer falls back."],
    ["site-falling-back-v8", "The site is falling back."],
    ["exact-tip-then-restore-worker-v8", "Revert the current unmerged tip. We should also restore the service worker."],
    ["exact-tip-conditional-route-v8", "Revert the current unmerged tip. If needed, restore the route layer."],
    ["exact-tip-restoration-available-v8", "Revert the current unmerged tip; after that, service worker restoration remains available."],
    ["masked-restoration-worker-v8", "Restor-ation of the service worker is supported."],
    ["spaced-restoration-worker-v8", "R e s t o r a t i o n of the service worker is supported."],
    ["masked-reversal-route-v8", "Rever-sal of the route layer is supported."],
    ["masked-downgraded-worker-v8", "The worker was down-grad-ed."],
    ["masked-redeployed-route-v8", "The route was re-deploy-ed."],
    ["masked-switches-back-v8", "The site swit-ches back."],
    ["masked-falls-back-v8", "The site f-all-s back."],
    ["inline-conditional-restore-v8", "If needed, restore `apps/site/public/sw.js`."],
    ["inline-restoration-supported-v8", "Restoration through `apps/site/public/sw.js` is supported."],
    ["inline-rollback-option-v8", "The rollback option for `apps/site/public/sw.js` is available."],
    ["exact-tip-inline-restoration-v8", "Revert the current unmerged tip. Then restoration through `apps/site/public/sw.js` remains available."],
    ["worker-restoration-available-variant", "The service worker restoration is available."],
    ["operator-perform-restoration-variant", "The operator will perform service-worker restoration."],
    ["site-undergo-rollback-variant", "The site can undergo rollback."],
    ["route-has-rollback-path-variant", "The route layer has a rollback path."],
    ["worker-recovery-option-passed-variant", "The worker recovery option passed its check."],
    ["exact-tip-route-restoration-supported-variant", "Revert the current unmerged tip. Restoration of the route remains supported."],
    ["inline-restore-supported-variant", "A restore through `apps/site/public/sw.js` remains supported."]
  ]) {
    await negative(
      `markdown-${name}`,
      () => validateMarkdown(`${markdown}\n${claim}\n`),
      "unsafe non-dependency-closed rollback claim"
    )
    await negative(
      `decoded-map-${name}`,
      () => validateDecodedStringClaims({ nested: { values: [{ claim }] } }, "decoded rollback fixture"),
      "unsafe non-dependency-closed rollback claim"
    )
    await negative(
      `review-ledger-${name}`,
      () => validateDecodedStringClaims(
        { codexReviewLedger: [{ findingSummary: claim, nested: { evidence: [claim] } }] },
        "review-ledger rollback fixture"
      ),
      "unsafe non-dependency-closed rollback claim"
    )
    await negative(
      `review-ledger-nested-only-${name}`,
      () => validateDecodedStringClaims(
        {
          codexReviewLedger: [{
            reviewKind: "authorization-and-rollback-review",
            findingSummary: "Synthetic validator fixture.",
            nested: { evidence: [{ rollbackResult: claim }] }
          }]
        },
        "nested-only review-ledger rollback fixture"
      ),
      "unsafe non-dependency-closed rollback claim"
    )
  }
  {
    const source = markdown.replace("## Anti-AI-slop and internal-wording removal gates", "<!-- ## Anti-AI-slop and internal-wording removal gates -->")
    await negative("comment-hidden-required-section", () => validateMarkdown(source), "structural token inside an HTML comment")
  }
  {
    const source = markdown.replace("## Anti-AI-slop and internal-wording removal gates", "<div>\n## Anti-AI-slop and internal-wording removal gates\n</div>")
    await negative("raw-html-required-section", () => validateMarkdown(source), "cannot use raw HTML containers")
  }
  {
    const source = `${markdown}\n<?hidden status=approved?>\n`
    await negative("processing-instruction", () => validateMarkdown(source), "status assignment must remain provisional-prework")
  }
  {
    const source = `${markdown}\n<![CDATA[status=approved]]>\n`
    await negative("cdata-container", () => validateMarkdown(source), "status assignment must remain provisional-prework")
  }
  {
    const source = `${markdown}\n## Anti-AI-slop and internal-wording removal gates\n`
    await negative("duplicate-required-section", () => validateMarkdown(source), "exactly one visible section")
  }
  {
    const source = markdown.replace(
      /(### Tranche 8:[\s\S]*?)(?=\n## Cross-tranche test and certification strategy)/u,
      "```text\n$1```\n"
    )
    await negative("fenced-tranche", () => validateMarkdown(source), "structural token inside a fenced block")
  }
  {
    const source = markdown.replace(
      /(## Anti-AI-slop and internal-wording removal gates[\s\S]*?)(?=\n## Analytics, observability, and rollout evidence)/u,
      "````text\n$1\n```\n````\n"
    )
    await negative("long-fence-hides-section", () => validateMarkdown(source), "structural token inside a fenced block")
  }
  {
    const source = markdown.replace("## Anti-AI-slop and internal-wording removal gates", "    ## Anti-AI-slop and internal-wording removal gates")
    await negative("indented-required-section", () => validateMarkdown(source), "indented heading")
  }
  for (const [name, line, fragment] of [
    ["one-space-extra-heading", " ### Tranche 9: Extra", "indented heading"],
    ["blockquote-extra-heading", "> ### Tranche 9: Extra", "container-hidden heading"],
    ["list-extra-heading", "- ### Tranche 9: Extra", "container-hidden heading"],
    ["nested-blockquote-heading", ">> ### Tranche 9: Extra", "container-hidden heading"],
    ["spaced-nested-blockquote-heading", "> > ### Tranche 9: Extra", "container-hidden heading"],
    ["ordered-list-heading", "1. ### Tranche 9: Extra", "container-hidden heading"],
    ["parenthesized-list-heading", "1) ### Tranche 9: Extra", "container-hidden heading"],
    ["list-blockquote-heading", "- > ### Tranche 9: Extra", "container-hidden heading"],
    ["blockquote-list-heading", "> - ### Tranche 9: Extra", "container-hidden heading"],
    ["nested-list-heading", "+ + ### Tranche 9: Extra", "container-hidden heading"],
    ["setext-heading", "Final migration plan\n====", "Setext heading"]
  ]) {
    await negative(name, () => validateMarkdown(`${markdown}\n${line}\n`), fragment)
  }
  {
    const source = markdown.replace("**Scope:**", "<!-- **Scope:** -->")
    await negative("comment-hidden-label", () => validateMarkdown(source), "structural token inside an HTML comment")
  }
  for (const [name, hidden, fragment] of [
    ["comment-hidden-extra-tranche", "<!-- ### Tranche 9: Hidden -->", "structural token inside an HTML comment"],
    ["comment-hidden-tranche-label", "<!-- **Scope:** hidden duplicate -->", "structural token inside an HTML comment"],
    ["comment-hidden-dependency-row", "<!-- | `consumer-language` | invented | `null` | waived | -->", "structural token inside an HTML comment"],
    ["fence-hidden-extra-tranche", "```text\n### Tranche 9: Hidden\n```", "structural token inside a fenced block"],
    ["fence-hidden-required-section", "```text\n## Explicit production stop conditions\n```", "structural token inside a fenced block"],
    ["fence-hidden-tranche-label", "```text\n**Scope:** hidden duplicate\n```", "structural token inside a fenced block"],
    ["fence-hidden-dependency-row", "```text\n| `consumer-language` | invented | `null` | waived |\n```", "structural token inside a fenced block"]
  ]) {
    await negative(name, () => validateMarkdown(`${markdown}\n${hidden}\n`), fragment)
  }
  {
    const source = markdown.replace("**Scope:**", "    **Scope:**")
    await negative("indented-label", () => validateMarkdown(source), "Tranche 1 is missing **Scope:**")
  }
  {
    const source = markdown.replace("**Scope:**", "**Scope:**\n\nDuplicate scope.\n\n**Scope:**")
    await negative("duplicate-label", () => validateMarkdown(source), "Tranche 1 contains duplicate **Scope:**")
  }
  {
    const source = markdown.replace(/\*\*Scope:\*\*[\s\S]*?(?=\n\n\*\*Preserved invariant:\*\*)/u, "**Scope:**")
    await negative("empty-label", () => validateMarkdown(source), "Tranche 1 has an empty **Scope:**")
  }
  {
    const source = markdown.replace(/\*\*Scope:\*\*[\s\S]*?(?=\n\n\*\*Preserved invariant:\*\*)/u, "**Scope:**\n\n    hidden code only")
    await negative("indented-only-label-body", () => validateMarkdown(source), "only indented-code content")
  }
  {
    const source = markdown.replace(/^\| `consumer-language` \|[^\n]+\n/mu, "")
    await negative("missing-markdown-dependency-row", () => validateMarkdown(source), "header, separator, and nine contract rows")
  }
  {
    const source = markdown.replace(
      "| `consumer-language` |",
      "| invented-slot | Invented consumer | null | Invented disposition |\n| `consumer-language` |"
    )
    await negative("extra-markdown-dependency-row", () => validateMarkdown(source), "header, separator, and nine contract rows")
  }
  for (const [name, row, fragment] of [
    ["indented-dependency-row", " | `consumer-language` | `invented/consumer.md` | `accepted` | waived |", "indented table row"],
    ["blockquote-dependency-row", "> | `consumer-language` | `invented/consumer.md` | `accepted` | waived |", "container-hidden heading"]
  ]) {
    const source = markdown.replace("| `consumer-language` |", `${row}\n| \`consumer-language\` |`)
    await negative(name, () => validateMarkdown(source), fragment)
  }
  {
    const source = markdown.replace(
      /^(\| `consumer-language` \| [^|]+ \|) `null` (\| [^|]+ \|)$/mu,
      "$1 `pending` $2"
    )
    await negative("populated-markdown-dependency", () => validateMarkdown(source), "current value must remain null")
  }
  {
    const source = markdown.replace("| `consumer-language` |", "| `task-navigation` |")
    await negative("duplicate-markdown-dependency-id", () => validateMarkdown(source), "canonical consumer differs")
  }
  {
    const source = markdown.replace(
      "`product/CONTENT_DESIGN.md` plus assigned production copy owners",
      "Invented canonical consumer"
    )
    await negative("mutated-markdown-dependency-consumer", () => validateMarkdown(source), "canonical consumer differs")
  }
  {
    const source = markdown.replace(
      "`product/CONTENT_DESIGN.md`, `product/ROUTES.md`, `product/COMPONENT_ARCHITECTURE.md`, `product/DESIGN_SYSTEM.md`, and `docs/OPEN.md` plus final retained validation evidence",
      "`product/CONTENT_DESIGN.md`, `product/ROUTES.md`, `product/COMPONENT_ARCHITECTURE.md`, and `product/DESIGN_SYSTEM.md` plus final retained validation evidence"
    )
    await negative(
      "markdown-integrated-validation-missing-open-consumer",
      () => validateMarkdown(source),
      "canonical consumer differs"
    )
  }
  {
    const source = markdown.replace(
      "Repository-attested Codex decision, merge/artifact coordinates, independent Codex review, and CI",
      "Invented disposition"
    )
    await negative("mutated-markdown-dependency-disposition", () => validateMarkdown(source), "disposition differs")
  }
  {
    const source = markdown.replace(
      "| Step 02 accepted repository attestation | `null` | `CODEX-ONLY-UIUX-V1` |",
      "| Step 02 accepted repository attestation | `null` | `HUMAN-APPROVAL-V1` |"
    )
    await negative("tampered-codex-interface-table", () => validateMarkdown(source), "non-Codex authorization interface")
  }
  {
    const source = canonicalReviewMarkdown.replace(canonicalReviewFixture[0].recordSha256, "0".repeat(64))
    await negative(
      "tampered-markdown-review-hash",
      () => validateMarkdown(source, canonicalReviewFixture),
      "Codex review-record block differs"
    )
  }
  for (const [name, row, fragment] of [
    ["indented-codex-review-row", " | `/root/fake_review` | Pending | No result | `null` |", "Codex review-record block differs"],
    ["blockquote-codex-review-row", "> | `/root/fake_review` | Pending | No result | `null` |", "Codex review-record block differs"]
  ]) {
    const source = markdown.replace("|---|---|---|---|", `|---|---|---|---|\n${row}`)
    await negative(name, () => validateMarkdown(source), fragment)
  }
  for (const state of ["accepted", "approved", "complete", "certified", "DONE", "final"]) {
    await negative(
      `markdown-status-${state}`,
      () => validateMarkdown(`${markdown}\nstatus=${state}\n`),
      "status assignment must remain provisional-prework"
    )
  }
  await negative(
    "markdown-decision-complete",
    () => validateMarkdown(`${markdown}\ndecisionStatus=complete\n`),
    "decisionStatus assignment must remain pending"
  )
  await negative(
    "markdown-participant-evidence",
    () => validateMarkdown(`${markdown}\nparticipantEvidence=1\n`),
    "participantEvidence assignment must remain none"
  )
  await negative(
    "markdown-participant-table",
    () => validateMarkdown(`${markdown}\n| Participant evidence | present |\n`),
    "Participant evidence assignment must remain none"
  )
  await negative(
    "markdown-human-evidence",
    () => validateMarkdown(`${markdown}\nHuman evidence is present.\n`),
    "Human evidence assignment must remain none"
  )
  await negative(
    "markdown-human-usability-test",
    () => validateMarkdown(`${markdown}\nHuman usability testing was completed.\n`),
    "claims a human usability test"
  )
  await negative(
    "markdown-participant-count",
    () => validateMarkdown(`${markdown}\nParticipant study n=25.\n`),
    "nonzero participant results"
  )
  await negative(
    "markdown-dependency-shas",
    () => validateMarkdown(`${markdown}\nrequiredDependencyShas=[upstream-coordinate]\n`),
    "requiredDependencyShas assignment must remain null"
  )
  await negative(
    "markdown-production-authorization",
    () => validateMarkdown(`${markdown}\nproductionAuthorization=true\n`),
    "productionAuthorization assignment must remain false"
  )
  for (const [name, assignment, fragment] of [
    ["markdown-human-participant-count-field", "humanParticipantCount=5", "humanParticipantCount assignment must remain 0"],
    ["markdown-production-deployment-status-field", "productionDeploymentStatus=ready", "productionDeploymentStatus assignment must remain blocked-live-user-reviewer"],
    ["markdown-production-deployment-scope-field", "productionDeploymentScope=in-scope", "productionDeploymentScope assignment must remain out-of-scope"],
    ["markdown-live-reviewer-type-field", "liveEnvironmentReviewerType=Bot", "liveEnvironmentReviewerType assignment must remain user"],
    ["markdown-environment-change-field", "liveEnvironmentChangeAuthorization=granted", "liveEnvironmentChangeAuthorization assignment must remain separate-required"],
    ["markdown-review-cycle-field", "reviewCycleStatus=complete", "state assignment outside structured metadata"],
    ["markdown-prior-review-reuse-field", "priorReviewReceiptsReusable=true", "state assignment outside structured metadata"]
  ]) {
    await negative(name, () => validateMarkdown(`${markdown}\n${assignment}\n`), fragment)
  }
  await negative(
    "markdown-production-phrase",
    () => validateMarkdown(`${markdown}\nProduction is authorized.\n`),
    "affirmative production or implementation authorization"
  )
  await negative(
    "markdown-production-deployment-phrase",
    () => validateMarkdown(`${markdown}\nProduction deployment is authorized.\n`),
    "affirmative production or implementation authorization"
  )
  await negative(
    "markdown-implementation-authorization-phrase",
    () => validateMarkdown(`${markdown}\nImplementation authorization is granted.\n`),
    "affirmative production or implementation authorization"
  )
  await negative(
    "markdown-status-is-done",
    () => validateMarkdown(`${markdown}\nstatus is DONE\n`),
    "status assignment must remain provisional-prework"
  )
  for (const [name, claim, fragment] of [
    ["markdown-plan-done", "Plan 009 is DONE.", "narrative graduated-state claim"],
    ["markdown-draft-final", "This migration draft is final.", "narrative graduated-state claim"],
    ["markdown-migration-plan-final", "This migration plan is final.", "narrative graduated-state claim"],
    ["markdown-packet-approved", "This packet is approved.", "narrative graduated-state claim"],
    ["markdown-packet-done", "The packet is DONE.", "narrative graduated-state claim"],
    ["markdown-migration-approved", "The migration is approved.", "narrative graduated-state claim"],
    ["markdown-implementation-approved", "Implementation is approved.", "narrative graduated-state claim"],
    ["markdown-plan-authorizes-implementation", "This plan authorizes implementation.", "affirmative production or implementation authorization"],
    ["markdown-implementation-proceeds", "Implementation may proceed.", "affirmative production or implementation authorization"],
    ["markdown-ready-to-implement", "We are ready to implement.", "affirmative production or implementation authorization"],
    ["markdown-inline-final", "This plan is **final**.", "narrative graduated-state claim"],
    ["markdown-comment-inline-final", "<!-- This plan is **final**. -->", "narrative graduated-state claim"],
    ["markdown-comment-split-final", "This plan is fi<!--x-->nal.", "narrative graduated-state claim"],
    ["markdown-comment-split-authorization", "This plan auth<!--x-->orizes implementation.", "affirmative production or implementation authorization"],
    ["markdown-comment-split-participants", "Twelve partici<!--x-->pants completed usability testing.", "nonzero human usability evidence"],
    ["markdown-inline-participants", "Twelve partici**pants** completed usability testing.", "nonzero human usability evidence"],
    ["markdown-decision-approved", "The migration decision is approved.", "narrative graduated-state claim"],
    ["markdown-comment-done", "<!-- Plan 009 is DONE. -->", "narrative graduated-state claim"],
    ["markdown-fenced-status", "```text\nstatus=approved\n```", "status assignment must remain provisional-prework"],
    ["markdown-numbered-participants", "12 participants completed usability testing.", "nonzero human usability evidence"],
    ["markdown-word-participants", "Twelve users completed the usability study.", "nonzero human usability evidence"],
    ["markdown-human-approval-required", "Human approval is required.", "human gate or approval claim"],
    ["markdown-human-approval-received", "Human approval has been received.", "human gate or approval claim"],
    ["markdown-humans-approved", "Humans approved the plan.", "human-review claim"],
    ["markdown-human-review-approved", "A human reviewer approved this plan.", "human gate or approval claim"],
    ["markdown-human-signoff", "Human sign-off is complete.", "human gate or approval claim"],
    ["markdown-agents-human", "Codex agents count as humans.", "counts Codex agents as humans"],
    ["markdown-alternate-interface", "The interface accepts HUMAN-APPROVAL-V1.", "non-Codex authorization interface"],
    ["markdown-production-signoff", "Production sign-off is complete.", "affirmative production or implementation authorization"],
    ["markdown-packet-permits-deploy", "This packet permits deployment to production.", "affirmative production or implementation authorization"],
    ["markdown-deploy-imperative", "Deploy to production now.", "production deployment imperative"],
    ["markdown-production-clearance", "Production clearance has been issued.", "affirmative production or implementation authorization"],
    ["markdown-release-proceed", "Release to production may proceed.", "affirmative production or implementation authorization"],
    ["markdown-rollout-cleared", "Production rollout is cleared.", "affirmative production or implementation authorization"],
    ["markdown-deploy-approval", "We have approval to deploy to production.", "affirmative production or implementation authorization"],
    ["markdown-usability-with-users", "A usability study with 12 users passed.", "nonzero human usability evidence"],
    ["markdown-usability-by-users", "Usability testing was completed by 12 users.", "nonzero human usability evidence"],
    ["markdown-encoded-authorization", "Production is authoriz&#101;d.", "cannot encode claims with HTML entities"],
    ["markdown-short-upstream-ref", `Step 02 decision ${"coord" + "inate"}: ${"d" + "ea" + "db" + "e"}`, "unverified contextual SHA literal"],
    ["markdown-numeric-upstream-ref", `Step 02 merge ${"coord" + "inate"}: ${"12" + "34" + "56" + "7"}`, "unverified contextual SHA literal"],
    ["markdown-inline-upstream-sha", "Step 02 decision SHA: dea**dbe**efd**ead**bee**fde**adb**eef**dea**dbe**efd**ead**bee**f.", "unverified SHA literal"],
    ["markdown-comment-split-upstream-sha", "Step 02 decision SHA: dea<!--x-->dbe<!--x-->efd<!--x-->ead<!--x-->bee<!--x-->fde<!--x-->adb<!--x-->eef<!--x-->dea<!--x-->dbe<!--x-->efd<!--x-->ead<!--x-->bee<!--x-->f.", "unverified SHA literal"],
    ["markdown-encoded-upstream-sha", `Step 02 decision SHA: ${"&#100;".repeat(40)}`, "cannot encode claims with HTML entities"]
  ]) {
    await negative(name, () => validateMarkdown(`${markdown}\n${claim}\n`), fragment)
  }
  for (const [name, claim] of [
    ["markdown-full-reference-link", "Production [is][gate] authorized.\n\n[gate]: /policy"],
    ["markdown-collapsed-reference-link", "Production [is][] authorized.\n\n[is]: </policy> \"gate\""],
    ["markdown-shortcut-reference-link", "This plan is [final].\n\n[final]: /status\n  'state'"],
    ["markdown-multiline-reference-link", "This plan [authorizes]\n[gate] implementation.\n\n[gate]: /policy"],
    ["markdown-reference-split-sha", "Step 02 decision SHA: [dea][r1][dbe][r2][efd][r3][ead][r4][bee][r5][fde][r6][adb][r7][eef][r8][dea][r9][dbe][r10][efd][r11][ead][r12][bee][r13][f][r14].\n\n[r1]: /1"]
  ]) {
    await negative(name, () => validateMarkdown(`${markdown}\n${claim}\n`), "reference-style")
  }
  {
    const invented = ("de" + "ad" + "be" + "ef").repeat(5)
    const encoded = [...invented]
      .map((character) => `%${character.codePointAt(0).toString(16).padStart(2, "0")}`)
      .join("")
    await negative(
      "markdown-percent-encoded-upstream-sha",
      () => validateMarkdown(`${markdown}\nStep 02 decision: [commit](https://invalid.test/${encoded}).\n`),
      "unverified SHA literal"
    )
  }
  await negative(
    "allowed-hash-reused-as-upstream",
    () => validateNoBoundUpstreamCoordinates(`Step 02 decision SHA: ${observedAtSha}`, "upstream reuse fixture"),
    "bound or invented upstream coordinate"
  )
  {
    const source = `${planIndex}\n| 009 | Draft | P1 | L | 008 | TODO |\n`
    await negative("index-row", () => validatePlanIndexText(source), "must not contain a Plan 009 status row")
  }
  for (const id of ["004", "005"]) {
    for (const status of ["TODO", "BLOCKED", "IN PROGRESS"]) {
      await negative(
        `regressed-upstream-plan-${id}-${status.replaceAll(" ", "-")}`,
        () => validatePlanIndexText(withPlanStatus(planIndex, id, status)),
        `Plan ${id} must remain the merged CODEX-ONLY DONE status`
      )
    }
  }
  for (const id of ["006", "007", "008"]) {
    for (const status of ["DONE", "approved", "complete", "final"]) {
    await negative(
      `graduated-upstream-plan-${id}-${status}`,
      () => validatePlanIndexText(withPlanStatus(planIndex, id, status)),
      "has a graduated status"
    )
    }
  }
  {
    const value = clone(map.metadata)
    value.observedAtSha = "a".repeat(40)
    await negative("invented-observed-sha", () => validateMetadata(value, "sha fixture"), "observedAtSha must be")
  }
  for (const [index, literal] of ["d" + "eadbee", observedAtSha.slice(0, 7).toUpperCase(), "A".repeat(64)].entries()) {
    await negative(
      `unexpected-sha-${literal.length}-${index + 1}`,
      () => validateNoUnexpectedShaLiterals(`${markdown}\n${literal}\n`, "SHA fixture"),
      "unverified SHA literal"
    )
  }
  await negative(
    "unexpected-contextual-short-sha",
    () => validateNoUnexpectedShaLiterals(`merge SHA: ${"d0" + "0d"}`, "contextual SHA fixture"),
    "unverified contextual SHA literal"
  )
  await negative(
    "duplicated-observed-baseline-sha",
    () => validateMarkdown(`${markdown}\nRepeated baseline: ${observedAtSha}\n`),
    "must contain the observed baseline SHA exactly 2 times"
  )
  await negative(
    "skip-worktree-index-flag",
    () => validateTrackedIndexFlags("S apps/site/src/styles.css\0"),
    "masking or nonstandard index flag"
  )
  await negative(
    "assume-unchanged-index-flag",
    () => validateTrackedIndexFlags("h plans/README.md\0"),
    "masking or nonstandard index flag"
  )
  await negative("unknown-cli", () => parseArguments(["--unknown"]), "unknown argument")
  await negative("duplicate-cli", () => parseArguments(["--self-test", "--self-test"]), "duplicate CLI arguments")
  await negative(
    "out-of-scope-drift",
    () => {
      const changed = [planPath, mapPath, validatorPath, "apps/site/src/styles.css"]
      for (const path of changed) assert(packetPaths.includes(path), `out-of-scope path changed from observedAtSha: ${path}`)
    },
    "out-of-scope path changed"
  )
  assert(count > 243, `negative self-test count regressed to ${count}; it must remain above the 243-test baseline`)
  return { count, exactSurfaceCounts }
}

const validatePacket = async () => {
  await validatePacketFileShapes()
  const [markdown, rawMap, validatorSource, planIndex] = await Promise.all([
    readUtf8(planPath),
    readUtf8(mapPath),
    readUtf8(validatorPath),
    readUtf8(indexPath)
  ])
  const map = parseJsonNoDuplicateKeys(rawMap, "current-file map")
  activeCodexReviewEntries = Object.freeze([...map.codexReviewLedger])
  assert(rawMap.endsWith("\n") && !rawMap.includes("\t"), "current-file map must end with a newline and use spaces")
  const scriptMetadata = parseMarkedMetadata(validatorSource, "validator")
  validateMetadata(scriptMetadata, "validator")
  const validatorOutsideRegistry = validatorOutsideInvalidatedProvenanceRegistry(validatorSource)
  validateNoInvalidatedReviewIdentifiers(
    validatorOutsideRegistry,
    "validator outside immutable invalidated-review provenance registry"
  )
  await validateMap(map, rawMap)
  assert(!validatorSource.includes(`${codexReviewMarkerStem}_START`), "validator cannot embed mutable Codex review records")
  validateNoUnexpectedShaLiterals(validatorOutsideRegistry, "validator outside immutable invalidated-review provenance registry", {
    allowedLiterals: [
      criticalFileRecordContractSha256,
      invalidatedReviewProvenanceRegistrySha256,
      invalidatedReviewProvenanceRegistrySourceSha256
    ],
    expectedObservedCount: 4,
    expectedLiteralCounts: new Map([
      [historicalBaselineCiHeadSha, 1],
      [reviewSubjectBaseSha, 4],
      [criticalFileRecordContractSha256, 1],
      [invalidatedReviewProvenanceRegistrySha256, 1],
      [invalidatedReviewProvenanceRegistrySourceSha256, 1]
    ])
  })
  validateMarkdown(markdown, map.codexReviewLedger)
  validatePlanIndexText(planIndex)
  await validateCertificationRecord()
  await validateRepositoryDeploymentBoundary()
  await validateIntegratedValidationConsumerBoundary()
  validateGitBoundary(planIndex)
  await validateCodexReviewBinding(map.codexReviewLedger, { rawMap, markdown, validatorSource })
  return { map, rawMap, markdown, planIndex, scriptMetadata, validatorSource }
}

const main = async () => {
  const { selfTest } = parseArguments(process.argv.slice(2))
  const packet = await validatePacket()
  if (!selfTest) {
    console.log("Plan 009 provisional migration draft valid.")
    return
  }
  const { count, exactSurfaceCounts } = await runSelfTests(packet)
  console.log(`Plan 009 provisional migration draft valid; ${count} negative self-tests passed.`)
  console.log(`Exact required negative fixtures: markdown=${exactSurfaceCounts.negative.markdown}, decoded-map=${exactSurfaceCounts.negative.decodedMap}, review-ledger=${exactSurfaceCounts.negative.reviewLedger}.`)
  console.log(`Exact required positive fixtures: markdown=${exactSurfaceCounts.positive.markdown}, decoded-map=${exactSurfaceCounts.positive.decodedMap}, review-ledger=${exactSurfaceCounts.positive.reviewLedger}.`)
}

main().catch((cause) => {
  console.error(`Plan 009 provisional migration draft invalid: ${cause instanceof Error ? cause.message : String(cause)}`)
  process.exitCode = 1
})
