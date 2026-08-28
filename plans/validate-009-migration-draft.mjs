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
  "rejectedReviewHeadSha": "8fc6255e5b115cbf7733f5d663328ec1c8a146d3",
  "reviewSubjectBaseSha": "15b625cfe8e3cde74a91cfe824b9c270d6a08f37",
  "authorizationInterface": "CODEX-ONLY-UIUX-V1",
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
const rejectedReviewHeadSha = "8fc6255e5b115cbf7733f5d663328ec1c8a146d3"
const reviewSubjectBaseSha = "15b625cfe8e3cde74a91cfe824b9c270d6a08f37"
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
  rejectedReviewHeadSha,
  reviewSubjectBaseSha,
  authorizationInterface: "CODEX-ONLY-UIUX-V1",
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

const requiredCodexReviewTasks = Object.freeze([
  Object.freeze({
    taskId: "/root/auth_rollback_semantic_final_review",
    reviewOccurrenceId: "codex-only-uiux-v1-auth-rollback-semantic-rereview",
    reviewKind: "authorization-and-rollback-review"
  }),
  Object.freeze({
    taskId: "/root/topology_state_dependency_semantic_final_review",
    reviewOccurrenceId: "codex-only-uiux-v1-topology-state-dependency-semantic-rereview",
    reviewKind: "topology-state-and-dependency-review"
  }),
  Object.freeze({
    taskId: "/root/validator_semantic_final_review",
    reviewOccurrenceId: "codex-only-uiux-v1-validator-semantic-rereview",
    reviewKind: "validator-integrity-rereview"
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
  const destinations = []
  const visible = source
    .normalize("NFKC")
    .replace(/!?\[([^\]\n]*)\]\(([^)\n]*)\)/gu, (_match, text, destination) => {
      destinations.push(destination)
      return text
    })
    .replace(/!?\[([^\]\n]*)\][ \t]*(?:\n[ \t]*)?\[[^\]\n]*\]/gu, "$1")
    .replace(/!?\[([^\]\n]*)\]/gu, "$1")
    .replace(/<!--([\s\S]*?)-->/gu, preserveCommentBodies ? "$1" : "")
    .replace(/\\([\\`*_[\]{}()#+\-.!|>~])/gu, "$1")
    .replace(/[*_~`]/gu, "")
    .replace(/\p{Cf}/gu, "")
  return decodePercentRuns(`${visible}\n\n${destinations.join("\n")}`)
    .replace(/[ \t]*\n(?:[ \t]*\n)+[ \t]*/gu, "\u0000")
    .replace(/[ \t]*\n[ \t]*/gu, " ")
    .replaceAll("\u0000", "\n")
    .replace(/[ \t]+/gu, " ")
    .trim()
}

const semanticClaimClauses = (source) => semanticClaimProjection(source)
  .split(/(?:[.!?;\u3002\uff01\uff1f]+|\n+|\b(?:but|however|whereas)\b)/giu)
  .map((clause) => clause
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim())
  .filter((clause) => clause.length > 0)

const validateNoFreeFormSemanticClaims = (source, label) => {
  const releaseActor = "(?:production(?: deployment| release| rollout| traffic)?|deployment(?: to production)?|release|candidate|build|site|application|app|website|version|rollout|traffic|launch|implementation|migration|plan(?: 009)?|packet|draft)"
  const releaseStatus = "(?:permitted|allowed|authorized|approved|cleared|certified|ready|eligible|green lit|green light|go ahead|signed off|unblocked|no blockers?|set for rollout|cleared for rollout|ready for rollout)"
  const permissionNoun = "(?:approval|permission|clearance|authorization|green light|go ahead|sign off|blessing)"
  const releaseAction = "(?:go live|launch|ship|deploy(?: to production)?|release(?: to production)?|implement|proceed|move forward|begin|start|activate(?: production traffic)?|serve(?: production traffic)?|put(?: the)? (?:site|app|application|website|build|release)? into production|move(?: the)? (?:site|app|application|website|build|release)? into production|send(?: the)? (?:site|app|application|website|build|release)? into production)"
  const actorLeadingReleaseAction = "(?:go live|launch|ship|deploy(?: to production)?|proceed|move forward|activate(?: production traffic)?|serve(?: production traffic)?|put(?: the)? (?:site|app|application|website|build|release)? into production|move(?: the)? (?:site|app|application|website|build|release)? into production|send(?: the)? (?:site|app|application|website|build|release)? into production)"
  const authorityVerb = "(?:permits?|allows?|authorizes?|approves?|clears?|certifies?|green lights?)"
  const releasePatterns = [
    new RegExp(`\\b${releaseActor}\\b\\s+(?:(?:is|was|has been|had been|became|becomes|remains|stands|looks)\\s+)?${releaseStatus}\\b`, "iu"),
    new RegExp(`\\b(?:we|codex|the team|the agent|${releaseActor})\\b(?:\\s+\\w+){0,6}\\s+(?:has|have|had|holds?|held|receives?|received|obtains?|obtained|gains?|gained|secures?|secured|gets?|got|was granted|were granted|was given|were given)\\s+(?:the\\s+)?${permissionNoun}\\b`, "iu"),
    new RegExp(`\\b${releaseActor}\\b(?:\\s+\\w+){0,5}\\s+${permissionNoun}\\b(?:\\s+\\w+){0,4}\\s+(?:granted|given|received|issued|secured|complete|completed)\\b`, "iu"),
    new RegExp(`\\b(?:we|codex|the team|the agent|${releaseActor})\\b(?:\\s+\\w+){0,6}\\s+(?:may|can|could|should|will|is able to|has permission to|has clearance to|has the go ahead to)\\s+${releaseAction}\\b`, "iu"),
    new RegExp(`\\b(?:we|codex|the team|the agent)\\b(?:\\s+\\w+){0,5}\\s+${releaseStatus}\\b(?:\\s+\\w+){0,4}\\s+(?:to\\s+)?${releaseAction}\\b`, "iu"),
    new RegExp(`\\b(?:we|codex|the team|the agent|${releaseActor})\\b(?:\\s+\\w+){0,5}\\s+${authorityVerb}\\b(?:\\s+\\w+){0,5}\\s+(?:the\\s+)?(?:${releaseActor}|${releaseAction})\\b`, "iu"),
    new RegExp(`\\b${releaseActor}\\b(?:\\s+\\w+){0,5}\\s+(?:may|can|could|should|will)\\s+be\\s+(?:activated|launched|shipped|deployed|released|served|implemented)\\b`, "iu"),
    new RegExp(`\\b(?:approved|authorized|cleared|green lit|ready|set)\\s+(?:for\\s+)?${releaseActor}\\b(?!\\s+(?:record|evidence|artifact|gate|workflow|check)\\b)`, "iu"),
    new RegExp(`\\b${permissionNoun}\\b(?:\\s+\\w+){0,6}\\s+(?:for|to)\\s+(?:the\\s+)?${releaseActor}\\b`, "iu"),
    new RegExp(`\\b${permissionNoun}\\b(?:\\s+\\w+){0,4}\\s+(?:granted|given|received|issued|secured|complete|completed)\\b(?:\\s+\\w+){0,5}\\s+(?:for|to)\\s+(?:the\\s+)?${releaseActor}\\b`, "iu"),
    new RegExp(`\\b(?:no blockers?|gate passed|passed gate)\\b(?:\\s+\\w+){0,6}\\s+(?:for|on|to)\\s+(?:the\\s+)?${releaseActor}\\b`, "iu"),
    new RegExp(`\\b(?:production|release|deployment|rollout)\\s+gate\\b(?:\\s+\\w+){0,4}\\s+(?:passed|cleared|approved)\\b`, "iu"),
    new RegExp(`^(?:please\\s+)?${actorLeadingReleaseAction}\\b(?:\\s+\\w+){0,6}\\s+(?:with|on|for|the)?\\s*(?:the\\s+)?${releaseActor}\\b`, "iu")
  ]

  const humanActor = "(?:humans?|learners?|students?|testers?|respondents?|volunteers?|candidates?|participants?|users?|people|persons?|cohorts?|panels?)"
  const count = "(?:[1-9]\\d*|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|a|an)"
  const studyKind = "(?:(?:human|user|learner|participant|usability|research|validation|moderated) (?:study|test|testing|research|session|round|evaluation|trial|validation)|moderated validation|usability|user research|human research|research round)"
  const studyResult = "(?:complete(?:d)?|conduct(?:ed)?|finish(?:ed)?|pass(?:ed)?|participat(?:e|ed)|join(?:ed)?|attend(?:ed)?|test(?:ed)?|evaluat(?:e|ed)|run|ran|perform(?:ed)?|succeed(?:ed)?|enroll(?:ed)?|recruit(?:ed)?|include(?:d)?|involve(?:d)?|observ(?:e|ed)|studied|interview(?:ed)?|watch(?:ed)?|survey(?:ed)?|sampl(?:e|ed)|happen(?:ed)?|occur(?:red)?|take part|took part|feedback|responses?|findings?|results?)"
  const humanObservation = "(?:observed|studied|tested|interviewed|watched|surveyed|sampled|enrolled|recruited|feedback (?:was )?collected|responses? (?:were |was )?collected)"
  const humanEvidenceNoun = "(?:feedback|results?|outcomes?|findings?|responses?|observations?|validation)"
  const humanEvidenceResult = "(?:collected|gathered|received|recorded|reported|returned|completed|passed|positive|successful|available|final|observed)"
  const humanActorPattern = new RegExp(`\\b${humanActor}\\b`, "iu")
  const nonzeroCountPattern = new RegExp(`\\b${count}\\s+${humanActor}\\b|\\b${humanActor}\\s+(?:count(?:ed)?|number(?:ed)?|total(?:ed)?)\\s+${count}\\b`, "iu")
  const studyKindPattern = new RegExp(`\\b${studyKind}\\b`, "iu")
  const studyResultPattern = new RegExp(`\\b${studyResult}\\b`, "iu")
  const humanObservationPatterns = [
    new RegExp(`\\b${humanObservation}\\b(?:\\s+\\w+){0,6}\\s+${humanActor}\\b`, "iu"),
    new RegExp(`\\b${humanActor}\\b(?:\\s+\\w+){0,6}\\s+${humanObservation}\\b`, "iu"),
    new RegExp(`\\b${humanActor}\\b(?:\\s+\\w+){0,5}\\s+${humanEvidenceNoun}\\b(?:\\s+\\w+){0,5}\\s+${humanEvidenceResult}\\b`, "iu"),
    new RegExp(`\\b${humanEvidenceNoun}\\b(?:\\s+\\w+){0,5}\\s+(?:from|by|of|for)\\s+(?:the\\s+)?${humanActor}\\b(?:\\s+\\w+){0,5}\\s+${humanEvidenceResult}\\b`, "iu"),
    new RegExp(`\\b${humanEvidenceResult}\\b(?:\\s+\\w+){0,5}\\s+${humanActor}\\b(?:\\s+\\w+){0,5}\\s+${humanEvidenceNoun}\\b`, "iu")
  ]

  const decisionActor = "(?:review|reviewer|panel|committee|selector|decision|option|variant|direction|territory|archetype|proposal|candidate|plan(?: 009)?|packet|draft|migration)"
  const decisionResult = "(?:approved|passed|selected|chosen|endorsed|ratified|signed off)"
  const decisionPatterns = [
    new RegExp(`\\b${decisionActor}\\b(?:\\s+\\w+){0,5}\\s+${decisionResult}\\b`, "iu"),
    new RegExp(`\\b(?:approved|selected|chosen|endorsed|ratified)\\s+(?:the\\s+)?${decisionActor}\\b`, "iu"),
    new RegExp(`\\b${decisionActor}\\b\\s+(?:(?:is|was|has been|had been|got)\\s+)?accepted\\b`, "iu")
  ]

  const negatedStatus = new RegExp(`\\b(?:not|never|no longer)\\s+${releaseStatus}\\b`, "giu")
  const negatedPermission = new RegExp(`\\b(?:no|without|lacks?|lacking|missing)\\s+(?:the\\s+)?${permissionNoun}\\b`, "giu")
  const negatedReleaseAction = new RegExp(`\\b(?:cannot|can not|may not|must not|will not|should not|is not able to)\\s+${releaseAction}\\b`, "giu")
  const negatedDecision = new RegExp(`\\b(?:not|never|no longer)\\s+${decisionResult}\\b`, "giu")
  const canonicalNegativeEvidence = /\b(?:not human usability tested|no human evidence|no participant evidence|human evidence (?:is )?none|participant evidence (?:is )?none|human participant count (?:is )?zero)\b/giu
  const negatedStudyResult = new RegExp(`\\b(?:not|never|did not|was not|were not|has not|have not|had not)\\s+${studyResult}\\b`, "giu")
  const negatedActorResult = new RegExp(`\\b${humanActor}\\s+(?:did not|was not|were not|has not|have not|had not|never)\\s+${studyResult}\\b`, "giu")
  const studyWithNoActor = new RegExp(`\\b${studyKind}\\b(?:\\s+\\w+){0,6}\\s+${studyResult}(?:\\s+\\w+){0,4}\\s+(?:no|zero)\\s+${humanActor}\\b`, "giu")
  const negatedHumanEvidence = new RegExp(`\\b${humanActor}\\b(?:\\s+\\w+){0,5}\\s+${humanEvidenceNoun}\\b(?:\\s+\\w+){0,4}\\s+(?:was not|were not|is not|are not|has not been|have not been|never)\\s+${humanEvidenceResult}\\b`, "giu")
  const negatedHumanActor = new RegExp(`\\b(?:no|zero|without)\\s+${humanActor}(?:\\s+${studyResult})?\\b`, "giu")

  for (const clause of semanticClaimClauses(source)) {
    const affirmative = clause
      .replace(canonicalNegativeEvidence, " negative_evidence ")
      .replace(negatedStatus, " negative_state ")
      .replace(negatedPermission, " negative_permission ")
      .replace(negatedReleaseAction, " negative_action ")
      .replace(negatedDecision, " negative_result ")
      .replace(studyWithNoActor, " negative_study ")
      .replace(negatedHumanEvidence, " negative_evidence ")
      .replace(negatedActorResult, " negative_study ")
      .replace(negatedStudyResult, " negative_result ")
      .replace(negatedHumanActor, " negative_group ")
      .replace(/\s+/gu, " ")

    assert(
      !releasePatterns.some((pattern) => pattern.test(affirmative)),
      `${label} contains affirmative production or implementation authorization through a free-form authorization or release-status claim`
    )
    assert(
      !decisionPatterns.some((pattern) => pattern.test(affirmative)),
      `${label} contains a free-form approval, pass, or selection claim`
    )
    assert(
      !nonzeroCountPattern.test(affirmative),
      `${label} contains nonzero human usability evidence through a free-form nonzero human participant count`
    )
    assert(
      !(studyKindPattern.test(affirmative) && (studyResultPattern.test(affirmative) || humanActorPattern.test(affirmative))),
      `${label} contains nonzero human usability evidence, claims a human usability test, or contains nonzero participant results through a free-form human-study occurrence or result`
    )
    assert(
      !humanObservationPatterns.some((pattern) => pattern.test(affirmative)),
      `${label} contains a free-form human observation or evidence result`
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
    authorizationinterface: "codex-only-uiux-v1"
  })
  const assignments = source.matchAll(
    /\b(decisionStatus|decision status|participantEvidence|participant evidence|humanEvidence|human evidence|humanParticipantCount|human participant count|notHumanUsabilityTested|not human usability tested|requiredDependencyShas|required dependency SHAs|productionAuthorization|production authorization|productionDeploymentStatus|production deployment status|productionDeploymentScope|production deployment scope|liveEnvironmentReviewerType|live environment reviewer type|liveEnvironmentChangeAuthorization|live environment change authorization|reviewSubjectBaseSha|review subject base SHA|authorizationInterface|authorization interface|status)[`"'\s*]*(?:[:=]|\||\bis\b)\s*[`"'\s*]*([^\s|,;`]+)/giu
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
    !/\b(?:decisionStatus|decision status|participantEvidence|participant evidence|humanEvidence|human evidence|humanParticipantCount|human participant count|notHumanUsabilityTested|not human usability tested|requiredDependencyShas|required dependency SHAs|productionAuthorization|production authorization|productionDeploymentStatus|production deployment status|productionDeploymentScope|production deployment scope|liveEnvironmentReviewerType|live environment reviewer type|liveEnvironmentChangeAuthorization|live environment change authorization|reviewCycleStatus|review cycle status|priorReviewReceiptsReusable|prior review receipts reusable|rejectedReviewHeadSha|rejected review head SHA|reviewSubjectBaseSha|review subject base SHA|authorizationInterface|authorization interface|status)[`"'\s*]*(?:[:=]|\||\bis\b)\s*[`"'\s*]*[^\s|,;`]+/iu.test(outsideMetadata),
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
    if (key === "rejectedReviewHeadSha") {
      assert(entry === rejectedReviewHeadSha, `${location} must remain the rejected published head`)
    }
    if (key === "reviewSubjectBaseSha") {
      assert(entry === reviewSubjectBaseSha, `${location} must remain the integrated current-main subject base`)
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
    rejectedReviewHeadSha,
    reviewSubjectBaseSha,
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

const validateNoAffirmativeAuthorization = (source, label) => {
  assert(!/^\s*deploy(?:ment)?(?: to)? production(?: now)?[.!]?\s*$/imu.test(source), `${label} contains a production deployment imperative`)
  validateNoFreeFormSemanticClaims(source, label)
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
  assert(
    !/\b(?:plan 009|this plan|this packet|codex)\b[^\n]{0,32}\b(?:authorizes|permits|allows|approves)\b[^\n]{0,48}\b(?:change|changing|modify|modifying|remove|removing|disable|disabling)\b[^\n]{0,48}\b(?:production environment|environment reviewer|required reviewer|user[- ]review rule)\b/iu.test(source),
    `${label} claims authority to change the live production Environment`
  )
}

const validateNoUnsafeRollbackClaims = (source, label) => {
  const rollbackVerb = "(?:revert(?:ed|ing)?|roll(?:ed|ing)? back)"
  const unsafeRollbackPatterns = [
    /\brevert each slice independently\b/iu,
    /\bui[- ]only changes revert normally\b/iu,
    /\brevert (?:the )?(?:isolated )?presentation(?: subset)?\b/iu,
    /\brevert (?:the )?(?:precise|exact|individual) tranche\b/iu,
    /\brevert (?:the )?(?:ordered|arbitrary|nonclosed) migration range\b/iu,
    /\brevert tranche\s+\d+\s+while later tranches remain\b/iu,
    /\bserve an earlier version after (?:a )?compatibility check\b/iu,
    /\b(?:any|each|every) tranche (?:can|may|should|will)?\s*(?:be )?revert(?:ed|ible) independently\b/iu,
    new RegExp(`\\b${rollbackVerb}\\b[^\\n.!?]{0,40}\\b(?:isolated\\s+)?presentation(?:\\s+(?:layer|subset|changes?))?\\b`, "iu"),
    /\brollback\s+(?:the\s+)?(?:isolated\s+)?presentation(?:\s+(?:layer|subset|changes?))?\b/iu,
    new RegExp(`\\bpresentation(?:\\s+(?:layer|subset|changes?))?\\b[^\\n.!?]{0,48}\\b${rollbackVerb}\\b[^\\n.!?]{0,24}\\bindependently\\b`, "iu"),
    new RegExp(`\\b${rollbackVerb}\\b[^\\n.!?]{0,40}\\b(?:arbitrary|ordered|nonclosed|non-closed)\\b[^\\n.!?]{0,24}\\b(?:tranche|migration)?\\s*range\\b`, "iu"),
    /\brollback\s+(?:an?\s+|the\s+)?(?:arbitrary|ordered|nonclosed|non-closed)\b[^\n.!?]{0,24}\b(?:tranche|migration)?\s*range\b/iu,
    new RegExp(`\\b(?:any|each|every|individual)\\s+(?:migration\\s+)?(?:tranche|slice)\\b[^\\n.!?]{0,48}\\b${rollbackVerb}\\b[^\\n.!?]{0,24}\\bindependently\\b`, "iu")
  ]
  const unsafeMatch = unsafeRollbackPatterns
    .map((pattern) => source.match(pattern))
    .find((match) => match !== null)
  assert(unsafeMatch === undefined, `${label} contains an unsafe non-dependency-closed rollback claim: ${JSON.stringify(unsafeMatch?.[0])}`)
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

const validateNoAffirmativeEvidenceClaims = (source, label) => {
  assert(!/&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);/iu.test(source), `${label} cannot encode claims with HTML entities`)
  const candidates = [
    [source, label],
    [semanticClaimProjection(source), `${label} comment-preserving semantic projection`],
    [semanticClaimProjection(source, { preserveCommentBodies: false }), `${label} comment-eliding semantic projection`]
  ]
  for (const [candidate, candidateLabel] of candidates) {
    validateNoGraduatedNarrativeClaims(candidate, candidateLabel)
    validateNoHumanGateClaims(candidate, candidateLabel)
    validateNoBoundUpstreamCoordinates(candidate, candidateLabel)
    validateNoUnsafeRollbackClaims(candidate, candidateLabel)
    validateNoAffirmativeAuthorization(candidate, candidateLabel)
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
    validateNoAffirmativeEvidenceClaims(value, location)
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
      "exact-ci-certification"
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

const codexReviewPayload = (entry) => ({
  taskId: entry.taskId,
  reviewOccurrenceId: entry.reviewOccurrenceId,
  reviewKind: entry.reviewKind,
  reviewedCommitSha: entry.reviewedCommitSha,
  reviewedBaseSha: entry.reviewedBaseSha,
  reviewedPacketBlobs: entry.reviewedPacketBlobs,
  findingIds: entry.findingIds,
  findingSummary: entry.findingSummary,
  evidencePaths: entry.evidencePaths,
  disposition: entry.disposition,
  consensus: entry.consensus,
  dissent: entry.dissent
})

const createCanonicalCodexReviewFixture = () => requiredCodexReviewTasks.map((task, index) => {
  const entry = {
    taskId: task.taskId,
    reviewOccurrenceId: task.reviewOccurrenceId,
    reviewKind: task.reviewKind,
    reviewedCommitSha: "1".repeat(40),
    reviewedBaseSha: reviewSubjectBaseSha,
    reviewedPacketBlobs: Object.fromEntries(packetPaths.map((path, pathIndex) => [path, String(pathIndex + 2).repeat(40)])),
    findingIds: [`SELF-TEST-${index + 1}`],
    findingSummary: "Synthetic canonical no-blocking review record used only by validator self-tests.",
    evidencePaths: [...packetPaths],
    disposition: "no-blocking-findings-on-exact-subject",
    consensus: "root-and-independent-rereviews-agree",
    dissent: "none-recorded-for-exact-subject"
  }
  return {
    ...entry,
    recordSha256: createHash("sha256").update(JSON.stringify(codexReviewPayload(entry)), "utf8").digest("hex")
  }
})

const validateCodexReviewLedger = (entries) => {
  assert(Array.isArray(entries), "codexReviewLedger must be an array")
  assert(
    entries.length === 0 || entries.length === requiredCodexReviewTasks.length,
    "codexReviewLedger must be pending or contain all independent reviews"
  )
  const exactKeys = [
    "taskId",
    "reviewOccurrenceId",
    "reviewKind",
    "reviewedCommitSha",
    "reviewedBaseSha",
    "reviewedPacketBlobs",
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
    const expected = requiredCodexReviewTasks[index]
    const payload = codexReviewPayload(entry)
    assert(entry.taskId === requiredCodexReviewTasks[index].taskId, `${label}.taskId differs`)
    assert(entry.reviewKind === requiredCodexReviewTasks[index].reviewKind, `${label}.reviewKind differs`)
    assert(entry.reviewOccurrenceId === expected.reviewOccurrenceId, `${label}.reviewOccurrenceId differs`)
    assert(/^[0-9a-f]{40}$/u.test(entry.reviewedCommitSha), `${label}.reviewedCommitSha must be a full lowercase Git SHA`)
    assert(entry.reviewedBaseSha === reviewSubjectBaseSha, `${label}.reviewedBaseSha differs from the integrated current-main subject base`)
    assertExactKeys(entry.reviewedPacketBlobs, packetPaths, `${label}.reviewedPacketBlobs`)
    assert(
      JSON.stringify(Object.keys(entry.reviewedPacketBlobs)) === JSON.stringify(packetPaths),
      `${label}.reviewedPacketBlobs must use canonical packet-path order`
    )
    for (const path of packetPaths) {
      assert(/^[0-9a-f]{40}$/u.test(entry.reviewedPacketBlobs[path]), `${label}.reviewedPacketBlobs[${path}] is invalid`)
    }
    assertStringArray(entry.findingIds, `${label}.findingIds`, { unique: true })
    assertNonEmptyString(entry.findingSummary, `${label}.findingSummary`)
    assertStringArray(entry.evidencePaths, `${label}.evidencePaths`, { unique: true })
    assert(entry.disposition === "no-blocking-findings-on-exact-subject", `${label}.disposition differs`)
    assert(entry.consensus === "root-and-independent-rereviews-agree", `${label}.consensus differs`)
    assert(entry.dissent === "none-recorded-for-exact-subject", `${label}.dissent differs`)
    assert(/^[0-9a-f]{64}$/u.test(entry.recordSha256), `${label}.recordSha256 must be a lowercase SHA-256`)
    const actualHash = createHash("sha256").update(JSON.stringify(payload), "utf8").digest("hex")
    assert(entry.recordSha256 === actualHash, `${label}.recordSha256 differs from its canonical payload`)
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
    : "Independent Codex review evidence for this immutable subject is recorded\nwithout hidden reasoning in `codexReviewLedger`. Each result binds the exact\nreview occurrence, subject/base commits, and all three packet Git blobs."
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
    settingsRace.observedFact === "The settings island initializes default preferences with busy false, begins authoritative IndexedDB restoration asynchronously, saves the current React projection, and leaves preference controls plus Save active while restoration is unresolved.",
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
  validateCodexReviewLedger(value.codexReviewLedger)
  const reviewCounts = reviewShaCounts(value.codexReviewLedger)
  const mapShaCounts = new Map(reviewCounts)
  incrementCount(mapShaCounts, rejectedReviewHeadSha, 1)
  incrementCount(mapShaCounts, reviewSubjectBaseSha, 1 + value.codexReviewLedger.length)
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
    expectedObservedCount: 1,
    expectedLiteralCounts: mapShaCounts
  })
  validateNoAffirmativeAuthorization(raw, "current-file map")

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
  validateNoMarkdownReferenceLinks(source)
  assert(
    extractDelimitedReviewBlock(source, planReviewStart, planReviewEnd, "migration draft") === renderPlanReviewBlock(reviewEntries),
    "migration draft Codex review-record block differs from its canonical data"
  )
  const reviewCounts = new Map(reviewEntries.map((entry) => [entry.recordSha256, 1]))
  const planShaCounts = new Map(reviewCounts)
  planShaCounts.set(rejectedReviewHeadSha, 1)
  planShaCounts.set(reviewSubjectBaseSha, 1)
  planShaCounts.set(historicalBaselineCiHeadSha, 1)
  validateNoUnexpectedShaLiterals(source, "migration draft", {
    allowedLiterals: [...reviewCounts.keys()],
    expectedObservedCount: 2,
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
  validateNoAffirmativeEvidenceClaims(source, "migration draft")
  validateMarkdownStateAssignments(source)
  validateNoUnstructuredStateAssignments(source)
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
    git(["show", "-s", "--format=%P", reviewSubjectBaseSha]).stdout.trim() === `${rejectedReviewHeadSha} ${observedAtSha}`,
    "reviewSubjectBaseSha must be the exact merge of the rejected head and current origin/main"
  )
  assert(
    git(["merge-base", "--is-ancestor", reviewSubjectBaseSha, "HEAD"], { allowFailure: true }).status === 0,
    "reviewSubjectBaseSha is not an ancestor of HEAD"
  )
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
    ["spaced-move-forward", "We  can\nmove   forward with the rollout.", "contains"]
  ]
  for (const [name, claim, fragment] of freeFormEvidenceAttacks) {
    await negative(
      `markdown-free-form-${name}`,
      () => validateMarkdown(`${markdown}\n${claim}\n`),
      fragment
    )
    await negative(
      `decoded-map-free-form-${name}`,
      () => validateDecodedStringClaims({ nested: { values: [{ claim }] } }, "decoded free-form fixture"),
      fragment
    )
  }

  const semanticAuthorizationActors = ["deployment", "release", "candidate", "build", "site", "application", "website", "version", "rollout", "packet"]
  const semanticAuthorizationResults = [
    "is approved",
    "is permitted",
    "is cleared",
    "is ready",
    "has the green light",
    "has the go-ahead",
    "received the blessing"
  ]
  for (const actor of semanticAuthorizationActors) {
    for (const result of semanticAuthorizationResults) {
      const name = `${actor}-${result}`.replace(/[^a-z0-9]+/gu, "-")
      const claim = `The ${actor} ${result}.`
      await negative(`semantic-matrix-markdown-${name}`, () => validateMarkdown(`${markdown}\n${claim}\n`), "contains")
      await negative(
        `semantic-matrix-decoded-${name}`,
        () => validateDecodedStringClaims({ outer: [{ inner: { claim } }] }, "nested semantic authorization fixture"),
        "contains"
      )
    }
  }

  const semanticHumanActors = ["cohort", "panel", "people", "learners", "users", "participants", "students", "testers"]
  const semanticHumanResults = ["completed", "passed", "conducted", "joined", "were observed in", "took part in"]
  for (const actor of semanticHumanActors) {
    for (const result of semanticHumanResults) {
      const name = `${actor}-${result}`.replace(/[^a-z0-9]+/gu, "-")
      const claim = `The ${actor} ${result} the usability research round.`
      await negative(`human-matrix-markdown-${name}`, () => validateMarkdown(`${markdown}\n${claim}\n`), "free-form")
      await negative(
        `human-matrix-decoded-${name}`,
        () => validateDecodedStringClaims({ outer: { values: [{ claim }] } }, "nested semantic human fixture"),
        "free-form"
      )
    }
  }

  const semanticDecisionActors = ["review", "panel", "committee", "selector", "option", "proposal"]
  const semanticDecisionResults = ["approved", "passed", "selected", "chosen"]
  for (const actor of semanticDecisionActors) {
    for (const result of semanticDecisionResults) {
      const name = `${actor}-${result}`
      const claim = `The ${actor} was ${result}.`
      await negative(`decision-matrix-markdown-${name}`, () => validateMarkdown(`${markdown}\n${claim}\n`), "contains")
      await negative(
        `decision-matrix-decoded-${name}`,
        () => validateDecodedStringClaims({ outer: [{ claim }] }, "nested semantic decision fixture"),
        "contains"
      )
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

  for (const [name, claim] of [
    ["production-blocked", "Production deployment remains blocked and out of scope."],
    ["site-cannot-go-live", "The site cannot go live."],
    ["candidate-not-approved", "The candidate is not approved for rollout."],
    ["application-no-permission", "The application has no permission to deploy."],
    ["no-human-evidence", "No human evidence exists."],
    ["no-participants", "No participants completed the usability study."],
    ["study-not-conducted", "The usability study was not conducted."],
    ["panel-did-not-pass", "The panel did not pass usability testing."],
    ["not-human-usability-tested", "This packet is not human usability tested."],
    ["review-pending", "The review remains pending."],
    ["packet-provisional", "This packet remains provisional prework."],
    ["user-gate-unsatisfied", "The required User reviewer remains unsatisfied."]
  ]) {
    validateNoAffirmativeEvidenceClaims(claim, `benign semantic fixture ${name}`)
    validateDecodedStringClaims({ nested: [{ claim }] }, `benign decoded semantic fixture ${name}`)
  }

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
    await negative("tampered-review-record", () => validateCodexReviewLedger(tampered), "recordSha256 differs")

    const badHash = clone(canonicalReviewFixture)
    badHash[0].recordSha256 = "0".repeat(64)
    await negative("review-record-hash-mismatch", () => validateCodexReviewLedger(badHash), "recordSha256 differs")

    const badOccurrence = clone(canonicalReviewFixture)
    badOccurrence[0].reviewOccurrenceId = "codex-only-uiux-v1-invented"
    await negative("review-occurrence-mismatch", () => validateCodexReviewLedger(badOccurrence), "reviewOccurrenceId differs")

    const priorTask = clone(canonicalReviewFixture)
    priorTask[0].taskId = "/root/" + ["topology", "fact", "check"].join("_")
    await negative("prior-cycle-review-task", () => validateCodexReviewLedger(priorTask), "taskId differs")

    for (const [index, taskId] of [
      "/root/auth_rollback_final_review",
      "/root/topology_state_dependency_final_review",
      "/root/validator_final_review"
    ].entries()) {
      const rejectedTask = clone(canonicalReviewFixture)
      rejectedTask[index].taskId = taskId
      await negative(`rejected-843-review-task-${index + 1}`, () => validateCodexReviewLedger(rejectedTask), "taskId differs")
    }

    for (const [index, occurrenceId] of [
      "codex-only-uiux-v1-auth-rollback-rereview",
      "codex-only-uiux-v1-topology-state-dependency-rereview",
      "codex-only-uiux-v1-validator-rereview"
    ].entries()) {
      const rejectedOccurrence = clone(canonicalReviewFixture)
      rejectedOccurrence[index].reviewOccurrenceId = occurrenceId
      await negative(
        `rejected-843-review-occurrence-${index + 1}`,
        () => validateCodexReviewLedger(rejectedOccurrence),
        "reviewOccurrenceId differs"
      )
    }

    const priorDisposition = clone(canonicalReviewFixture)
    priorDisposition[0].disposition = ["accepted", "after", "repair"].join("-")
    await negative("prior-cycle-review-disposition", () => validateCodexReviewLedger(priorDisposition), "disposition differs")

    const wrongBase = clone(canonicalReviewFixture)
    wrongBase[0].reviewedBaseSha = observedAtSha
    await negative("review-record-wrong-base", () => validateCodexReviewLedger(wrongBase), "reviewedBaseSha differs")

    const missingFinding = clone(canonicalReviewFixture)
    missingFinding[0].findingIds = []
    await negative("review-record-missing-finding-id", () => validateCodexReviewLedger(missingFinding), "must be non-empty")
  }

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
    value.fileRecords[0].role = "Production is " + "authorized."
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
    value.fileRecords[0].role = claim
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
        `required file-record contract differs: ${contractPath}`
      )
    }
    {
      const records = clone(map.fileRecords)
      records.find((record) => record.path === contractPath).trancheOwnership = ["tranche-08-invented"]
      await negative(
        `required-file-tranche-${testStem}`,
        () => validateFileRecords(records, { checkGit: false }),
        `required file-record contract differs: ${contractPath}`
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
        `required file-record contract differs: ${contractPath}`
      )
    }
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
  {
    const source = markdown.replace("**Rollback boundary:**", "**Reversion note:**")
    await negative("missing-rollback", () => validateMarkdown(source), "Tranche 1 is missing **Rollback boundary:**")
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
    ["rollback-arbitrary-tranche-range", "Roll back an arbitrary tranche range."]
  ]) {
    await negative(
      `markdown-${name}`,
      () => validateMarkdown(`${markdown}\n${claim}\n`),
      "unsafe non-dependency-closed rollback claim"
    )
    await negative(
      `decoded-map-${name}`,
      () => validateDecodedStringClaims({ claim }, "decoded rollback fixture"),
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
    "affirmative human-evidence claim"
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
  return count
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
  await validateMap(map, rawMap)
  assert(!validatorSource.includes(`${codexReviewMarkerStem}_START`), "validator cannot embed mutable Codex review records")
  validateNoUnexpectedShaLiterals(validatorSource, "validator", {
    expectedObservedCount: 2,
    expectedLiteralCounts: new Map([
      [historicalBaselineCiHeadSha, 1],
      [rejectedReviewHeadSha, 2],
      [reviewSubjectBaseSha, 2]
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
  const count = await runSelfTests(packet)
  console.log(`Plan 009 provisional migration draft valid; ${count} negative self-tests passed.`)
}

main().catch((cause) => {
  console.error(`Plan 009 provisional migration draft invalid: ${cause instanceof Error ? cause.message : String(cause)}`)
  process.exitCode = 1
})
