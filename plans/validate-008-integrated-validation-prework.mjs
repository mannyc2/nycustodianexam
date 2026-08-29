#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process"
import { createHash, generateKeyPairSync, randomBytes, sign, verify } from "node:crypto"
import {
  mkdtempSync,
  mkdirSync,
  lstatSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs"
import { readFile } from "node:fs/promises"
import { isIP } from "node:net"
import { tmpdir } from "node:os"
import { dirname, join, posix } from "node:path"
import { fileURLToPath } from "node:url"

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url))
const paths = Object.freeze({
  protocol: "plans/008-integrated-validation-prework.md",
  contract: "plans/008-integrated-validation-schema-contract.json",
  validator: "plans/validate-008-integrated-validation-prework.mjs",
  canonicalPlan: "plans/008-run-integrated-consumer-ux-validation.md",
  planIndex: "plans/README.md"
})
const PACKET_PATH_ORDER = Object.freeze([
  paths.protocol,
  paths.contract,
  paths.validator,
  paths.canonicalPlan,
  paths.planIndex
])

const PERMANENT_METADATA = Object.freeze({
  status: "provisional-prework",
  validationModel: "CODEX-ONLY-UIUX-V1",
  reviewMode: "codex-only",
  participantEvidence: "none",
  humanEvidence: "none",
  participantCount: 0,
  humanParticipantCount: 0,
  humanSessionCount: 0,
  notHumanUsabilityTested: true,
  agentsCountAsPeople: false,
  decisionStatus: "pending",
  requiredDependencyShas: null,
  mustRebaseAndReverify: true
})

const LANE_IDS = Object.freeze([
  "journey-recovery-semantics",
  "accessibility-cognitive-load",
  "consumer-trust-internal-wording-ai-slop"
])
const AGENT_ID_BY_LANE = Object.freeze({
  "journey-recovery-semantics": "/root/plan008_final_journey_reaudit",
  "accessibility-cognitive-load": "/root/plan008_final_accessibility_reaudit",
  "consumer-trust-internal-wording-ai-slop": "/root/plan008_final_trust_reaudit"
})
const JOURNEY_IDS = Object.freeze(["J01", "J02", "J03", "J04", "J05", "J06", "J07", "J08"])
const COMMAND_IDS = Object.freeze([
  "packet-validator",
  "repository-verify",
  "loopback-preview",
  "browser-matrix"
])

const SHA_40 = /^[0-9a-f]{40}$/
const SHA_64 = /^[0-9a-f]{64}$/
const SAFE_PATH_ROOTS = new Set(["plans", "product", "docs", "apps", "packages", "content", "illustration", "fixture"])
const SELF_TEST_CAPABILITY = Symbol("plan008-private-real-fixture-capability")
const GIT_MAX_BUFFER = 64 * 1024 * 1024

const isSafeRepositoryPath = (value) => {
  if (
    typeof value !== "string" || value.length === 0 || value !== value.normalize("NFKC") ||
    value.includes("\\") || value.startsWith("/") || value.endsWith("/") || value.includes("//") ||
    posix.isAbsolute(value) || posix.normalize(value) !== value
  ) return false
  const segments = value.split("/")
  return segments.length >= 2 && SAFE_PATH_ROOTS.has(segments[0]) && segments.every((segment) =>
    segment.length > 0 && segment !== "." && segment !== ".." && /^[A-Za-z0-9._-]+$/u.test(segment)
  )
}
const assertSafeRepositoryPath = (value, code, label) => {
  if (!isSafeRepositoryPath(value)) fail(code, `${label} is not a canonical repository-relative path`)
}
const validateStaticPathContract = () => {
  const staticPaths = [
    ...Object.values(paths),
    SCREEN_STATE_AUTHORITY_EXPECTED?.sourcePath,
    ...EXPECTED_SOURCE_COORDINATES?.canonicalInputBlobs?.map(({ path }) => path) ?? []
  ].filter(Boolean)
  staticPaths.forEach((path) => assertSafeRepositoryPath(path, "SOURCE_PATH", "static source path"))
}

const rejectPublicFixturePaths = (value, capability, label = "public evidence") => {
  if (capability === SELF_TEST_CAPABILITY) return
  const visit = (nested) => {
    if (typeof nested === "string") {
      if (nested === "fixture" || nested.startsWith("fixture/")) {
        fail("REAL_PATH_MODE", `${label} contains an isolated-fixture path`)
      }
      return
    }
    if (Array.isArray(nested)) { nested.forEach(visit); return }
    if (isRecord(nested)) Object.values(nested).forEach(visit)
  }
  visit(value)
}

const EXPECTED_SOURCE_COORDINATES = Object.freeze({
  preparedAgainstOriginMainSha: "d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1",
  plan008PlanningSha: "e6f911901f7f18f6716204309fee8b103419a5e0",
  protocol: {
    path: paths.protocol,
    sha256: "5db1aded0496de48fd1b4132d6caad657df0f7046f5da2fb3cdd1a4099bfe43c",
    gitBlobSha: "1c7fef148b08857d984c783eea613b6eb1eb642d"
  },
  canonicalPlan: {
    path: paths.canonicalPlan,
    sha256: "b36ab5b0fdb2be3a773063cbafd5a761d0675cca9a7d9f151a3eac9321498258",
    gitBlobSha: "d595de94343275baa38b8ffc5e0b1de5a92048d2",
    supersedesPreparedBaseBlobSha: "2386300cff1bcb2191e6b8a3da48c49a5215e9d2"
  },
  planIndex: {
    path: paths.planIndex,
    sha256: "19b741cca53e4fbd791c7863627d86ad8895c4779ca302357633545923d4de5d",
    gitBlobSha: "65940a4f9247b12b329acfc15ea80351c5d38146",
    supersedesPreparedBaseBlobSha: "588cba659076e87bc37b9eee4a0b18b6919fb912"
  },
  contractPath: paths.contract,
  validatorPath: paths.validator,
  canonicalInputBlobs: [
    { path: "product/FEATURE_SPEC.md", blobSha: "f7f5cca987eb15c45bb9247229ea9c4dd0977e47" },
    { path: "product/ROUTES.md", blobSha: "4c40d047af8ba8c34bd4a7a1ff40da990b20add8" },
    { path: "product/SCREEN_STATES.md", blobSha: "c2d71d1f786efe99421ee5eb5167cbd3cd426023" },
    { path: "product/DESIGN_SYSTEM.md", blobSha: "24119fa451f0bc05fe091acd9a61a6be83441bf7" },
    { path: "docs/OPEN.md", blobSha: "acd4aaa87700dc43aa2434647ef7071a770508bf" },
    {
      path: "apps/site/browser-tests/accessibility-and-presentation.pw.ts",
      blobSha: "6995baff7826f647f1e84b8fd4cf2ce3529b11f2"
    },
    {
      path: "apps/site/browser-tests/README.md",
      blobSha: "8aef126f0fbf4b09289511047053d9cf81e83551"
    },
    { path: "apps/site/playwright.config.ts", blobSha: "4161343d958f49c435bab6465de400b9b7a74de4" }
  ]
})

const EXPECTED_CLASSIFICATION = Object.freeze({
  evidenceKind: "codex-only-validation-prework",
  integratedRunExecuted: false,
  realEvidenceBundleCreated: false,
  agentOnlyReleaseRecommendation: null,
  designSelected: false,
  artifactApproved: false,
  productionAuthorized: false,
  plan008StatusChanged: false,
  laterMigrationImplemented: false
})

const EXPECTED_BOUNDARY = Object.freeze({
  version: "CODEX-ONLY-UIUX-V1",
  reviewMode: "codex-only",
  humanParticipantsAllowed: false,
  moderatorsAllowed: false,
  humanReviewersAllowed: false,
  decisionOwnersAllowed: false,
  humanSignOffsAllowed: false,
  humanSessionsAllowed: false,
  recruitmentAllowed: false,
  consentWorkflowAllowed: false,
  compensationAllowed: false,
  recordingAllowed: false,
  participantCount: 0,
  humanParticipantCount: 0,
  humanSessionCount: 0,
  participantEvidence: "none",
  humanEvidence: "none",
  notHumanUsabilityTested: true,
  agentsCountAsPeople: false,
  agentsCountAsParticipants: false,
  automationCountsAsPeople: false,
  agentPredictsHumanBehavior: false,
  realDeviceAssistiveTechnologyEvidence: false,
  humanBehaviorEvidence: false,
  allowedDecisionKind: "nonbinding-agent-only-release-recommendation",
  productionAuthorization: false
})

const EXPECTED_DEPENDENCIES = Object.freeze({
  mode: "accepted-codex-only-steps-02-04",
  ready: false,
  executionBaseSha: null,
  trustedExternalAnchor: null,
  requiredSteps: [
    {
      programStepId: "02",
      planId: "005",
      acceptedOutput: "learner-task-navigation-contract",
      requiredSha: "d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1",
      requiredArtifactPath: "plans/004-005-codex-only-evaluation.md",
      artifactSha256: "bcfe0ffef023baa273242c5af2fac7be8eef58e04c0115f2a36da8784afb0116",
      artifactGitBlobSha: "434d055ebefb7c7a13e80e68fa8f4d1fa023a048",
      artifactGitMode: "100644",
      acceptanceRecordKind: "step02-legacy-evidence-manifest-v2",
      acceptanceRecordPath: "research/ui-ux/codex-only-v1/evidence-manifest.json",
      acceptanceRecordSha256: "5fe775e60787d5bcc6edea0aa38c92064b3f6ce54f3a6c026a71e07f6fa284fb",
      acceptanceRecordGitBlobSha: "d3c08181e1ca76001161f41a3c51867fdda9f0d5",
      acceptanceRecordGitMode: "100644",
      dispositionPath: "plans/README.md",
      dispositionSha256: "32abcd3279193bc7681861e660018b738be5656d9ac5007192fe953e22c80d3b",
      dispositionGitBlobSha: "588cba659076e87bc37b9eee4a0b18b6919fb912",
      dispositionGitMode: "100644",
      dispositionClauseId: "STEP-02-PLAN-005-DONE-CODEX-ONLY",
      dispositionClauseSha256: "8bd171e79afc2551b76cf81868a3d107cf471a9b04657519b08747e9b4117406",
      acceptanceStatus: "accepted-codex-only"
    },
    {
      programStepId: "03",
      planId: "006",
      acceptedOutput: "consumer-visual-system-and-route-archetypes",
      requiredSha: null,
      requiredArtifactPath: null,
      artifactSha256: null,
      artifactGitBlobSha: null,
      artifactGitMode: null,
      acceptanceRecordKind: "native-codex-only-acceptance-v1",
      acceptanceRecordPath: null,
      acceptanceRecordSha256: null,
      acceptanceRecordGitBlobSha: null,
      acceptanceRecordGitMode: null,
      dispositionPath: null,
      dispositionSha256: null,
      dispositionGitBlobSha: null,
      dispositionGitMode: null,
      dispositionClauseId: null,
      dispositionClauseSha256: null,
      acceptanceStatus: "not-landed"
    },
    {
      programStepId: "04",
      planId: "007",
      acceptedOutput: "component-foundation-and-responsive-contract",
      requiredSha: null,
      requiredArtifactPath: null,
      artifactSha256: null,
      artifactGitBlobSha: null,
      artifactGitMode: null,
      acceptanceRecordKind: "native-codex-only-acceptance-v1",
      acceptanceRecordPath: null,
      acceptanceRecordSha256: null,
      acceptanceRecordGitBlobSha: null,
      acceptanceRecordGitMode: null,
      dispositionPath: null,
      dispositionSha256: null,
      dispositionGitBlobSha: null,
      dispositionGitMode: null,
      dispositionClauseId: null,
      dispositionClauseSha256: null,
      acceptanceStatus: "not-landed"
    }
  ],
  futureResolutionRequirements: [
    "exact Step 02-04 requiredSha values resolve to Git commit objects",
    "every requiredSha is an ancestor of executionBaseSha",
    "each required artifact exists at its requiredSha",
    "artifact SHA-256 and Git blob match exact bytes",
    "each artifact is accepted CODEX-ONLY-UIUX-V1 evidence",
    "trustedExternalAnchor resolves to a separate immutable descendant of accepted Step 04 and ancestor of executionBaseSha",
    "trustedExternalAnchor binds the exact accepted Step 02-04 SHAs and an external Ed25519 verification key",
    "executionBaseSha equals freshly fetched origin/main",
    "packet is rebased and fully reverified"
  ]
})

const PLAN_CLAUSES = Object.freeze({
  "P008-MODE-001": "reviewMode=codex-only",
  "P008-MODE-002": "humanEvidence=none",
  "P008-MODE-003": "humanParticipantCount=0",
  "P008-MODE-004": "participantCount=0",
  "P008-MODE-005": "notHumanUsabilityTested=true",
  "P008-MODE-006": "agentsCountAsPeople=false",
  "P008-MODE-007": "realDeviceAssistiveTechnologyEvidence=false",
  "P008-MODE-008": "humanBehaviorEvidence=false",
  "P008-MODE-009": "decisionKind=nonbinding-agent-only-release-recommendation",
  "P008-MODE-010": "productionAuthorization=false",
  "P008-DEP-001": "requiredSteps=02,03,04",
  "P008-DEP-002": "dependencyCoordinates=exact-accepted-codex-only-shas",
  "P008-DEP-003": "unresolvedDependencyBehavior=stop-before-real-evidence",
  "P008-DEP-004": "mustRebaseAndReverify=true",
  "P008-COV-001": "interruptionRows=128",
  "P008-COV-002": "capabilityRows=96",
  "P008-COV-003": "categoryRows=56",
  "P008-COV-004": "applicability=contract-owned-all-required",
  "P008-COV-005": "perRequirementAssertions=exactly-one",
  "P008-COV-006": "assertionDigestReuse=prohibited",
  "P008-COV-007": "failedCellDisposition=open-release-blocking-finding",
  "P008-COV-008": "assertionProviders=contract-owned-result-manifests-or-first-pass-artifacts",
  "P008-COV-009": "canonicalRouteRows=36",
  "P008-COV-010": "authorityStateAtoms=204",
  "P008-COV-011": "authorityTransitionOccurrences=109",
  "P008-COV-012": "journeyLensStateOccurrences=145",
  "P008-COV-013": "journeyLensTransitionOccurrences=168",
  "P008-COV-014": "totalRequirements=978",
  "P008-COV-015": "routeTransitionSurfaceRows=36",
  "P008-EXIT-001": "allRequirementResults=passed",
  "P008-EXIT-002": "openBlockingFindingCount=0",
  "P008-EXIT-003": "laneAndConsensusRecommendation=agent-only-recommend",
  "P008-EXIT-004": "failedBundlePlanStatus=BLOCKED"
})

const README_CLAUSES = Object.freeze({
  "PREADME-UIUX-001": "reviewMode=codex-only",
  "PREADME-UIUX-002": "humanEvidence=none",
  "PREADME-UIUX-003": "humanParticipantCount=0",
  "PREADME-UIUX-004": "participantCount=0",
  "PREADME-UIUX-005": "notHumanUsabilityTested=true",
  "PREADME-UIUX-006": "agentsCountAsPeople=false",
  "PREADME-UIUX-007": "productionAuthorization=false",
  "PREADME-DEP-001": "step02Sha=d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1",
  "PREADME-DEP-002": "step03Sha=null",
  "PREADME-DEP-003": "step04Sha=null",
  "PREADME-DEP-004": "plan008Status=BLOCKED",
  "PREADME-DEP-005": "finalIntegratedRunExecuted=false",
  "PREADME-DEP-006": "mustRebaseAndReverify=true"
})

const PLAN_STATUS_CELL = "BLOCKED — accepted Step 3/4 SHAs are unresolved; final evidence mode and any recommendation remain unavailable"

const sha256Text = (value) => createHash("sha256").update(value, "utf8").digest("hex")
const sha256Bytes = (value) => createHash("sha256").update(value).digest("hex")
const gitBlobSha = (value) => {
  const bytes = Buffer.isBuffer(value) ? value : Buffer.from(value, "utf8")
  return createHash("sha1").update(Buffer.from(`blob ${bytes.length}\0`, "utf8")).update(bytes).digest("hex")
}

const canonicalJson = (value) => {
  if (value === null || typeof value !== "object") return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`
}
const sha256Canonical = (value) => sha256Text(canonicalJson(value))

class ValidationError extends Error {
  constructor(code, message) {
    super(message)
    this.name = "ValidationError"
    this.code = code
  }
}
const fail = (code, message) => { throw new ValidationError(code, message) }
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value)
const clone = (value) => structuredClone(value)
const compareUnicode = (left, right) => left < right ? -1 : left > right ? 1 : 0

const exactKeys = (value, expected, code, label) => {
  if (!isRecord(value)) fail(code, `${label} must be an object`)
  const actual = Object.keys(value).sort(compareUnicode)
  const wanted = [...expected].sort(compareUnicode)
  if (canonicalJson(actual) !== canonicalJson(wanted)) fail(code, `${label} key set is invalid`)
}
const exactValue = (actual, expected, code, label) => {
  if (canonicalJson(actual) !== canonicalJson(expected)) fail(code, `${label} differs from the exact contract`)
}
const exactSet = (actual, expected, code, label) => {
  if (!Array.isArray(actual) || new Set(actual).size !== actual.length) fail(code, `${label} must be a unique array`)
  exactValue([...actual].sort(compareUnicode), [...expected].sort(compareUnicode), code, label)
}
const assertHash = (value, code, label) => {
  if (typeof value !== "string" || !SHA_64.test(value)) fail(code, `${label} must be lowercase SHA-256`)
}
const assertGitSha = (value, code, label) => {
  if (typeof value !== "string" || !SHA_40.test(value)) fail(code, `${label} must be lowercase Git SHA`)
}

const gitOutput = (args, cwd = repositoryRoot) => execFileSync("git", args, {
  cwd,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
  maxBuffer: GIT_MAX_BUFFER
}).trim()
const isAncestor = (ancestor, descendant, cwd = repositoryRoot) => {
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", ancestor, descendant], { cwd, stdio: "ignore" })
    return true
  } catch {
    return false
  }
}
const assertRegularGitPath = (commit, path, cwd, code, label) => {
  let row
  try {
    row = gitOutput(["ls-tree", commit, "--", path], cwd)
  } catch {
    fail(code, `${label} tree entry is unavailable`)
  }
  const match = row.match(/^(100644|100755) blob ([0-9a-f]{40})\t(.+)$/u)
  if (match === null || match[3] !== path) fail(code, `${label} is not a regular Git file`)
  return { mode: match[1], blobSha: match[2] }
}

const laneTaskText = Object.freeze({
  "journey-recovery-semantics": "Inspect every contract-owned journey state transition interruption and recovery assertion against the exact canonical artifacts. Emit structured source-bound findings and reproduction task IDs only. Do not infer human behavior or real-device evidence.",
  "accessibility-cognitive-load": "Inspect semantic HTML keyboard focus status responsive forced-color reduced-motion print and cognitive-load requirements against deterministic artifacts. Emit structured source-bound findings only. Do not claim emitted assistive-technology output human behavior or real-device evidence.",
  "consumer-trust-internal-wording-ai-slop": "Inspect unofficial-status trust-source internal-language leakage false authority repetitive synthetic wording and answer-boundary claims against exact artifacts. Emit structured source-bound findings only. Do not treat agents personas or automation as people."
})
const laneRubricText = Object.freeze({
  "journey-recovery-semantics": "Exact legal state transition interruption restoration persistence and failed-cell coupling closure; no inferred human behavior.",
  "accessibility-cognitive-load": "Exact semantic keyboard focus status reflow contrast motion print and cognitive-load artifact inspection; no real-device or emitted assistive-technology claim.",
  "consumer-trust-internal-wording-ai-slop": "Exact unofficial-status source trust answer-boundary internal-wording repetition synthetic-language and false-authority inspection; no agent-as-person substitution."
})
const LANE_CONTRACTS = Object.freeze(LANE_IDS.map((laneId) => ({
  laneId,
  contractVersion: "CODEX-ONLY-UIUX-V1/LANE-V2",
  agentKind: "codex-subagent-with-declared-first-pass-isolation",
  agentId: AGENT_ID_BY_LANE[laneId],
  taskContractId: `P008-TASK-${laneId}`,
  taskContractText: laneTaskText[laneId],
  taskContractSha256: sha256Text(laneTaskText[laneId]),
  promptSha256: sha256Text(laneTaskText[laneId]),
  rubricId: `P008-RUBRIC-${laneId}`,
  rubricText: laneRubricText[laneId],
  rubricSha256: sha256Text(laneRubricText[laneId]),
  firstPassPeerOutputsVisible: false,
  hiddenReasoningRequested: false,
  permanentHumanEvidence: "none",
  permanentHumanParticipantCount: 0,
  permanentNotHumanUsabilityTested: true
})))

const COMMON_PRIVATE_PROHIBITED = Object.freeze([
  "participantId", "humanId", "learnerId", "candidateId", "applicantId",
  "studyId", "sessionId", "userId", "accountId", "admissionNumber",
  "name", "email", "phone", "address", "preciseLocation", "latitude",
  "longitude", "recording", "transcript", "rawNotes", "diagnosis",
  "humanApproval", "reviewerApproval", "moderatorApproval", "decisionOwner",
  "signOff", "fabricatedAgentApproval"
])
const RECORD_PERMANENT_METADATA = Object.freeze({
  reviewMode: "codex-only",
  humanEvidence: "none",
  humanParticipantCount: 0,
  notHumanUsabilityTested: true
})
const RECORD_METADATA_FIELDS = Object.freeze(Object.keys(RECORD_PERMANENT_METADATA))
const withRecordMetadata = (record) => ({ ...RECORD_PERMANENT_METADATA, ...record })
const validateRecordMetadata = (record, code = "REAL_RECORD_METADATA", label = "record") => {
  for (const [key, expected] of Object.entries(RECORD_PERMANENT_METADATA)) {
    if (record?.[key] !== expected) fail(code, `${label} permanent metadata differs`)
  }
}
const PRIVATE_SCHEMAS = Object.freeze({
  privateAgentTaskReceipt: {
    storage: "private-agent-orchestration-interface-no-pii-in-git",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "receiptId", "laneId", "agentId", "nativeTaskId", "taskContractSha256",
      "promptSha256", "rubricSha256", "sourceContractSha256", "manifestSha256",
      "inputEvidenceRootSha256", "startedAtUtc", "nativeReceiptPath",
      "nativeReceiptSha256", "nativeReceiptGitBlobSha", "peerOutputsVisible"
    ],
    prohibitedFields: COMMON_PRIVATE_PROHIBITED
  },
  privateFirstPassReceipt: {
    storage: "private-agent-orchestration-interface-no-pii-in-git",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "receiptId", "taskReceiptId", "laneId", "agentId",
      "nativeTaskId", "promptSha256", "rubricSha256", "sourceContractSha256",
      "startedAtUtc", "completedAtUtc", "nativeReceiptPath",
      "nativeReceiptSha256", "nativeReceiptGitBlobSha",
      "firstPassArtifactPath", "firstPassArtifactSha256", "firstPassArtifactGitBlobSha",
      "peerOutputIdsVisible", "peerOutputsVisible"
    ],
    prohibitedFields: COMMON_PRIVATE_PROHIBITED
  },
  privateEnvironmentObservation: {
    storage: "private-agent-orchestration-interface-no-pii-in-git",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "environmentId", "commandId", "runtimeId", "browserProfiles", "host",
      "externalRequestsObserved", "toolchainManifestSha256"
    ],
    prohibitedFields: [
      ...COMMON_PRIVATE_PROHIBITED,
      "homePath", "userPath", "username", "hostname", "machineId",
      "deviceId", "deviceSerial", "advertisingId", "macAddress", "ipAddress",
      "networkSsid", "geoCoordinates", "city", "streetAddress", "postalCode"
    ]
  }
})

const RECORD_SCHEMAS = Object.freeze({
  executionManifest: {
    digestField: "manifestSha256",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "manifestId", "mode", "executionBaseSha", "dependencyShas",
      "published", "publishedPacketCommit", "packetBytesRootSha256",
      "dependencyArtifacts", "trustedExternalAnchor", "canonicalSourceRootSha256",
      "journeyRequirementsSha256", "commandContractSha256",
      "artifactManifestSha256", "inputEvidenceRootSha256", "host",
      "externalRequestsAllowed", "manifestSha256"
    ],
    prohibitedFields: COMMON_PRIVATE_PROHIBITED
  },
  taskReceipt: {
    digestField: "recordSha256",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "receiptId", "laneId", "agentId", "nativeTaskId", "taskContractSha256",
      "promptSha256", "rubricSha256", "sourceContractSha256", "manifestSha256",
      "inputEvidenceRootSha256", "startedAtUtc", "nativeReceiptPath",
      "nativeReceiptSha256", "nativeReceiptGitBlobSha", "peerOutputsVisible",
      "recordSha256"
    ],
    prohibitedFields: COMMON_PRIVATE_PROHIBITED
  },
  firstPassReceipt: {
    digestField: "recordSha256",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "receiptId", "taskReceiptId", "laneId", "agentId",
      "nativeTaskId", "promptSha256", "rubricSha256", "sourceContractSha256",
      "startedAtUtc", "completedAtUtc", "nativeReceiptPath",
      "nativeReceiptSha256", "nativeReceiptGitBlobSha",
      "firstPassArtifactPath", "firstPassArtifactSha256", "firstPassArtifactGitBlobSha",
      "peerOutputIdsVisible", "peerOutputsVisible",
      "recordSha256"
    ],
    prohibitedFields: COMMON_PRIVATE_PROHIBITED
  },
  environmentObservation: {
    digestField: "recordSha256",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "environmentId", "commandId", "runtimeId", "browserProfiles", "host",
      "externalRequestsObserved", "toolchainManifestSha256", "recordSha256"
    ],
    prohibitedFields: PRIVATE_SCHEMAS.privateEnvironmentObservation.prohibitedFields
  },
  automatedRun: {
    digestField: "recordSha256",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "runId", "commandId", "environmentId", "commandContractSha256",
      "result", "assertionIds", "resultManifestId", "resultManifestCommit",
      "resultManifestPath", "resultManifestSha256", "resultManifestGitBlobSha",
      "assertionResultSequenceSha256", "recordSha256"
    ],
    prohibitedFields: COMMON_PRIVATE_PROHIBITED
  },
  requirementAssertion: {
    digestField: "recordSha256",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "assertionId", "assertionContractId", "requirementId", "coverageCellId",
      "authorityAtomId", "authorityClauseIds", "authorityBindingIds", "authorityRouteScopes",
      "providerKind", "providerId", "providerArtifactSha256",
      "providerEntrySha256", "implementationId", "implementationPath",
      "implementationBlobSha", "executionCaseId", "proofPath", "proofSha256",
      "proofGitBlobSha", "observationKind", "result",
      "deterministicOutputSha256", "sourcePath", "sourceBlobSha",
      "sourceClauseId", "recordSha256"
    ],
    prohibitedFields: COMMON_PRIVATE_PROHIBITED
  },
  coverageCell: {
    digestField: "recordSha256",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "coverageCellId", "requirementId", "journeyId", "requirementKind",
      "targetId", "sourceClauseId", "authorityAtomId", "authorityClauseIds",
      "authorityBindingIds", "authorityRouteScopes",
      "ownerLaneId", "applicable", "assertionId",
      "assertionRecordSha256", "result", "blockingFindingId", "recordSha256"
    ],
    prohibitedFields: COMMON_PRIVATE_PROHIBITED
  },
  finding: {
    digestField: "recordSha256",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "findingId", "laneId", "agentId", "requirementId", "coverageCellId",
      "sourceClauseId", "authorityAtomId", "authorityClauseIds",
      "authorityBindingIds", "authorityRouteScopes",
      "sourcePath", "sourceBlobSha", "severity", "status",
      "releaseBlocking", "recommendation", "reproductionTaskContractSha256",
      "recordSha256"
    ],
    prohibitedFields: COMMON_PRIVATE_PROHIBITED
  },
  agentRun: {
    digestField: "outputSha256",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "agentRunId", "laneId", "agentId", "taskContractSha256", "taskReceiptId",
      "taskReceiptSha256", "firstPassReceiptId", "firstPassReceiptSha256",
      "reviewedJourneyIds", "reviewedRequirementIds", "findingIds",
      "coverageSequenceSha256", "assertionSequenceSha256",
      "findingSequenceSha256", "recommendation", "basisCode", "outputSha256"
    ],
    prohibitedFields: COMMON_PRIVATE_PROHIBITED
  },
  dissentPosition: {
    digestField: "recordSha256",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "positionId", "laneId", "agentId", "consensusQuestionId", "position",
      "basisCode", "findingIds", "recordSha256"
    ],
    prohibitedFields: COMMON_PRIVATE_PROHIBITED
  },
  dissentGroup: {
    digestField: "recordSha256",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "groupId", "consensusQuestionId", "positionIds", "status", "recordSha256"
    ],
    prohibitedFields: COMMON_PRIVATE_PROHIBITED
  },
  consensus: {
    digestField: "recordSha256",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "consensusId", "laneOutputSha256ByLaneId", "findingSequenceSha256ByLaneId",
      "dissentPositionSequenceSha256", "dissentGroupSequenceSha256",
      "dissentMatrixSha256", "coverageSequenceSha256", "assertionSequenceSha256",
      "automatedRunSequenceSha256", "recommendation", "openBlockingFindingIds",
      "basisCode", "recordSha256"
    ],
    prohibitedFields: COMMON_PRIVATE_PROHIBITED
  },
  finalEvidence: {
    digestField: "recordSha256",
    requiredFields: [
      ...RECORD_METADATA_FIELDS,
      "finalEvidenceId", "contractRootSha256", "manifestSha256",
      "published", "publishedPacketCommit", "packetBytesRootSha256",
      "taskReceiptSequenceSha256", "firstPassReceiptSequenceSha256",
      "firstPassReceiptSealSha256",
      "automatedResultManifestCoordinateRootSha256",
      "firstPassArtifactCoordinateRootSha256",
      "externalAnchorSha256",
      "environmentSequenceSha256", "automatedRunSequenceSha256",
      "assertionSequenceSha256", "coverageSequenceSha256",
      "findingSequenceSha256ByLaneId", "laneOutputSha256ByLaneId",
      "dissentPositionSequenceSha256", "dissentGroupSequenceSha256",
      "dissentMatrixSha256", "consensusRecordSha256", "recordCounts",
      "recommendation", "productionAuthorization", "recordSha256"
    ],
    prohibitedFields: COMMON_PRIVATE_PROHIBITED
  }
})

const PLAYWRIGHT_PROJECT_IDS = Object.freeze(["chromium", "firefox", "webkit"])
const PUBLIC_BROWSER_PROVIDER_CONTRACT = Object.freeze({
  version: "CODEX-ONLY-UIUX-V1/PLAYWRIGHT-PROVIDER-V1",
  runnerId: "playwright-test",
  runnerVersion: "1.62.1",
  reporterId: "plan008-deterministic-reporter-v1",
  harnessPath: "apps/site/browser-tests/plan008/integrated-assertion-harness.ts",
  harnessGitBlobSha: null,
  reporterPath: "apps/site/browser-tests/plan008/deterministic-reporter.mjs",
  reporterGitBlobSha: null,
  projectIds: PLAYWRIGHT_PROJECT_IDS,
  baseUrl: "http://127.0.0.1:4175",
  deviceEvidence: "desktop-browser-automation-only",
  realDeviceEvidence: false,
  emittedAssistiveTechnologyEvidence: false
})
const BROWSER_EVIDENCE_FIELDS = Object.freeze([
  ...RECORD_METADATA_FIELDS,
  "evidenceVersion", "runnerId", "runnerVersion", "reporterId",
  "deviceEvidence", "realDeviceEvidence", "emittedAssistiveTechnologyEvidence",
  "caseId", "caseTitle", "implementationPath", "implementationGitBlobSha",
  "harnessPath", "harnessGitBlobSha", "reporterPath", "reporterGitBlobSha",
  "projectIds", "contextContractSha256", "resultPath", "resultSha256",
  "resultGitBlobSha", "reportPath", "reportSha256", "reportGitBlobSha"
])
const BROWSER_RESULT_FIELDS = Object.freeze([
  ...RECORD_METADATA_FIELDS,
  "schemaVersion", "resultId", "runnerId", "runnerVersion", "caseId", "caseTitle",
  "assertionId", "requirementId", "implementationPath", "implementationGitBlobSha",
  "harnessPath", "harnessGitBlobSha", "reporterPath", "reporterGitBlobSha",
  "projectIds", "observations", "observationSequenceSha256", "result", "exitCode",
  "recordSha256"
])
const BROWSER_REPORT_FIELDS = Object.freeze([
  ...RECORD_METADATA_FIELDS,
  "schemaVersion", "reportId", "reporterId", "runnerId", "runnerVersion",
  "caseId", "caseTitle", "implementationPath", "implementationGitBlobSha",
  "projectSummaries", "resultRecordSha256", "observationSequenceSha256",
  "result", "exitCode", "recordSha256"
])
const BROWSER_PROJECT_SUMMARY_FIELDS = Object.freeze([
  ...RECORD_METADATA_FIELDS,
  "projectId", "expectedCaseCount", "passedCaseCount", "failedCaseCount",
  "skippedCaseCount", "status"
])
const BROWSER_OBSERVATION_FIELDS = Object.freeze([
  ...RECORD_METADATA_FIELDS,
  "observationId", "assertionId", "requirementId", "caseId", "projectId",
  "contextId", "viewport", "media", "subjectRouteIds", "assertionClass",
  "checkResults", "domMetrics", "result", "recordSha256"
])
const BROWSER_VIEWPORT_FIELDS = Object.freeze(["widthCssPixels", "heightCssPixels"])
const BROWSER_MEDIA_FIELDS = Object.freeze(["mediaType", "forcedColors", "reducedMotion"])
const BROWSER_CHECK_FIELDS = Object.freeze([
  ...RECORD_METADATA_FIELDS,
  "checkId", "expected", "actual", "status"
])
const BROWSER_DOM_METRIC_FIELDS = Object.freeze([
  "mainLandmarkCount", "headingOneCount", "pageHorizontalOverflowCssPixels",
  "unlabeledInteractiveCount", "keyboardTrapCount", "obscuredFocusTargetCount",
  "missingNonvisualEquivalentCount", "statusMutationCount", "visibleRecoveryActionCount",
  "cognitiveLoadViolationCount", "printChromeVisibleCount", "motionDurationMilliseconds",
  "externalRequestCount"
])

const EVIDENCE_BUNDLE_CONTRACT = Object.freeze({
  version: "CODEX-ONLY-UIUX-V1/REAL-EVIDENCE-V1",
  modeSelection: "cli-owned-not-bundle-overridable",
  publicCli: "--validate-real-evidence <bundle> --expected-root <sha256> --anchor <commit>:<path> --seal <commit>:<path>",
  unresolvedDependencyResult: "REAL_DEPENDENCIES_PENDING",
  mandatoryNonemptyCollections: [
    "taskReceipts", "firstPassReceipts", "environmentObservations",
    "automatedRuns", "assertions", "coverageCells", "agentRuns",
    "dissentPositions", "dissentMatrix"
  ],
  conditionallyEmptyCollections: ["findings", "dissentGroups"],
  recordSchemas: RECORD_SCHEMAS,
  exactCommandIds: COMMAND_IDS,
  exactLaneIds: LANE_IDS,
  publicBrowserProvider: PUBLIC_BROWSER_PROVIDER_CONTRACT,
  assertionClosure: "one-unique-assertion-and-one-unique-output-digest-per-applicable-requirement",
  applicabilitySource: "canonical-plan-contract-all-required",
  failedCellCoupling: "exact-reciprocal-open-release-blocking-owner-lane-finding-for-every-failed-cell",
  firstPassBoundary: "committed-receipt-bytes-and-git-order-only; platform-internal-task-identity-and-peer-isolation-are-not-independently-observed",
  firstPassLimitations: [
    "platform-native-task-identity-not-independently-authenticated",
    "cross-output-non-observability-not-independently-observed"
  ],
  recommendationValues: ["agent-only-recommend", "do-not-recommend"],
  finalRootProjection: [
    "rootVersion", "finalEvidenceRecordSha256", "contractRootSha256",
    "executionBaseSha", "externalSealRequired"
  ],
  externalSealFields: [
    ...RECORD_METADATA_FIELDS,
    "sealVersion", "published", "publishedPacketCommit", "packetBytesRootSha256",
    "bundleSha256", "finalEvidenceRootSha256",
    "executionBaseSha", "contractRootSha256", "firstPassReceiptSealSha256",
    "automatedResultManifestCoordinateRootSha256",
    "firstPassArtifactCoordinateRootSha256", "externalAnchorCommit",
    "externalAnchorPath", "externalAnchorSha256", "externalAnchorGitBlobSha",
    "evidenceCommit", "evidencePath", "evidenceGitBlobSha", "sealParentSha",
    "signatureAlgorithm", "signedPayloadSha256", "signatureBase64"
  ],
  externalAnchorCoordinateFields: ["commit", "path", "sha256", "gitBlobSha"],
  externalAnchorFields: [
    ...RECORD_METADATA_FIELDS,
    "anchorVersion", "anchorId", "anchorParentSha", "dependencyShas",
    "allowedProgramStepIds", "publicKeySpkiBase64",
    "challengeBase64", "anchorRecordSha256"
  ],
  externalSealTrustRule: "ed25519-key-possession-plus-exact-signed-bytes-bound-key-coordinate-evidence-parent-and-git-order",
  externalSealLimitations: [
    "signing-key-custody-is-not-independently-attested",
    "same-key-holder-can-coherently-reseal-and-supply-a-new-root-and-seal-coordinate",
    "consumer-must-separately-pin-the-exact-root-and-seal-coordinate-for-a-non-resealable-boundary"
  ],
  automatedResultManifestFields: [
    ...RECORD_METADATA_FIELDS,
    "schemaVersion", "manifestId", "evidenceMode", "runId", "commandId",
    "executionBaseSha", "commandContractSha256", "toolchainManifestSha256",
    "assertionContractRootSha256", "exitCode", "result", "assertionResults",
    "counts", "assertionResultSequenceSha256", "manifestSha256"
  ],
  resultEntryFields: [
    ...RECORD_METADATA_FIELDS,
    "assertionId", "assertionContractId", "requirementId", "coverageCellId",
    "authorityAtomId", "authorityClauseIds", "authorityBindingIds", "authorityRouteScopes",
    "providerKind", "providerId", "sourceClauseId", "sourcePath", "sourceBlobSha", "implementationId",
    "implementationPath", "implementationBlobSha", "executionCaseId", "proofPath",
    "proofSha256", "proofGitBlobSha", "result", "observationKind",
    "observationSha256", "entrySha256"
  ],
  requirementProofFields: [
    ...RECORD_METADATA_FIELDS,
    "schemaVersion", "proofId", "evidenceMode", "executionClass",
    "assertionId", "assertionContractId", "requirementId", "coverageCellId",
    "authorityAtomId", "authorityClauseIds", "authorityBindingIds", "authorityRouteScopes",
    "providerKind", "providerId", "executionCaseId", "commandId", "commandArgv",
    "commandArgvSha256", "exitCode", "sourceClauseId", "sourcePath",
    "sourceBlobSha", "implementationId", "implementationPath",
    "implementationBlobSha", "browserEvidence", "capturedResult", "capturedResultSha256",
    "proofRecordSha256"
  ],
  capturedResultFields: [
    ...RECORD_METADATA_FIELDS,
    "caseId", "assertionKind", "subjectId", "expectedOutcome",
    "actualOutcome", "statusCode", "bindingResults", "browserResultSha256",
    "browserReportSha256"
  ],
  bindingResultFields: [...RECORD_METADATA_FIELDS, "bindingId", "routeScope", "status"],
  browserEvidenceFields: BROWSER_EVIDENCE_FIELDS,
  browserResultFields: BROWSER_RESULT_FIELDS,
  browserReportFields: BROWSER_REPORT_FIELDS,
  browserProjectSummaryFields: BROWSER_PROJECT_SUMMARY_FIELDS,
  browserObservationFields: BROWSER_OBSERVATION_FIELDS,
  browserViewportFields: BROWSER_VIEWPORT_FIELDS,
  browserMediaFields: BROWSER_MEDIA_FIELDS,
  browserCheckFields: BROWSER_CHECK_FIELDS,
  browserDomMetricFields: BROWSER_DOM_METRIC_FIELDS,
  implementationProofRule: "private-fixtures-use-unique-node-sources; public-browser-cases-use-exact-generated-playwright-tests-pinned-harness-and-reporter-and-reexecuted-report-result-bytes",
  firstPassArtifactFields: [
    ...RECORD_METADATA_FIELDS,
    "schemaVersion", "artifactId", "evidenceMode", "laneId", "agentId",
    "executionBaseSha", "manifestSha256", "taskContractSha256",
    "peerOutputsVisible", "assertionResults", "counts",
    "assertionResultSequenceSha256", "artifactRecordSha256"
  ],
  publicEvidenceMode: "real-execution",
  privateFixtureEvidenceMode: "isolated-self-test-fixture",
  firstPassReceiptSealCoordinateFields: ["commit", "path", "sha256", "gitBlobSha"],
  firstPassReceiptSealFields: [
    ...RECORD_METADATA_FIELDS,
    "sealVersion", "executionBaseSha", "manifestSha256", "taskReceipts",
    "firstPassReceipts", "peerOutputsVisible"
  ],
  nativeTaskReceiptFields: [
    ...RECORD_METADATA_FIELDS,
    "receiptVersion", "receiptId", "laneId", "agentId", "nativeTaskId",
    "taskContractSha256", "promptSha256", "rubricSha256",
    "sourceContractSha256", "manifestSha256", "inputEvidenceRootSha256",
    "startedAtUtc", "peerOutputsVisible", "receiptRecordSha256"
  ],
  nativeFirstPassReceiptFields: [
    ...RECORD_METADATA_FIELDS,
    "receiptVersion", "receiptId", "taskReceiptId", "laneId", "agentId",
    "nativeTaskId", "promptSha256", "rubricSha256", "sourceContractSha256",
    "startedAtUtc", "completedAtUtc", "firstPassArtifactPath",
    "firstPassArtifactSha256", "firstPassArtifactGitBlobSha",
    "peerOutputIdsVisible", "peerOutputsVisible", "receiptRecordSha256"
  ],
  dissentMatrixRowFields: [
    ...RECORD_METADATA_FIELDS,
    "laneId", "positionId", "position", "groupId", "positionRecordSha256"
  ],
  receiptIntervalRule: "started-before-completed-before-or-at-immutable-receipt-seal-commit-time",
  firstPassReceiptSealRequirement: "immutable-git-commit-before-evidence-and-final-seal-commits",
  externalSealRequirement: "caller-root-plus-immutable-git-seal-commit-path-blob-and-ancestry",
  syntheticOverrideSerializable: false
})

const CLAIM_POLICY = Object.freeze({
  version: "CODEX-ONLY-UIUX-V1/STRING-BOUNDARY-V3",
  scope: "every-object-key-and-string-leaf-before-schema-or-reference-validation",
  normalization: "exact-NFKC-no-bidi-no-default-ignorable-no-control-no-encoded-bypass",
  piiCategories: [
    "email", "formatted-phone", "non-loopback-ip", "home-or-user-path",
    "personal-identifier", "street-address", "precise-location"
  ],
  claimCategories: [
    "nonzero-human-evidence", "human-behavior", "design-decision-authority",
    "release-or-production-authority", "real-device-or-assistive-technology",
    "automation-substitutes-for-people", "blanket-accessibility-certification"
  ],
  errorsEchoRejectedValues: false,
  structuralStringPolicy: "exact-grammar-codebook-and-reference-closure"
})

const SCREEN_STATE_ROUTE_ORDER = Object.freeze([
  "home", "exam-selector", "exam-checker", "profile", "study-hub",
  "atlas-index", "atlas-family", "atlas-tool", "procedures-index",
  "procedure-detail", "repair-lab", "question-player", "hazards-index",
  "hazard-player", "review-queue", "review-player", "simulation-setup",
  "simulation-player", "simulation-results", "print-center", "print-preview",
  "faq", "transparency-index", "source", "corrections", "foil", "security",
  "privacy", "correction-submit", "settings", "offline-packs", "status",
  "scoring-explainer", "actual-questions-explainer", "about", "nyc-disambiguation"
])
const STATIC_SPOKE_ROUTE_IDS = Object.freeze([
  "scoring-explainer", "actual-questions-explainer", "about", "nyc-disambiguation"
])
const ACCESSIBILITY_DIMENSION_ORDER = Object.freeze([
  "semantic-html",
  "keyboard-only",
  "focus-and-status-markup",
  "320-and-1440-css-pixel-reflow",
  "forced-colors",
  "reduced-motion",
  "print-and-large-print-transformation",
  "nonvisual-operability",
  "cognitive-load"
])
const ACCESSIBILITY_SOURCE_CLAUSES = Object.freeze([
  {
    clauseId: "A11Y-SRC-FEATURE-ACCESSIBILITY",
    sourcePath: "product/FEATURE_SPEC.md",
    sourceBlobSha: "f7f5cca987eb15c45bb9247229ea9c4dd0977e47",
    lineStart: 464,
    lineEnd: 486,
    sha256: "6f89967d826c8d2e55c45f914af4fd4bdad22fe0a6f7d50a083cfb627e0cf585"
  },
  {
    clauseId: "A11Y-SRC-FEATURE-QA",
    sourcePath: "product/FEATURE_SPEC.md",
    sourceBlobSha: "f7f5cca987eb15c45bb9247229ea9c4dd0977e47",
    lineStart: 492,
    lineEnd: 494,
    sha256: "162ebe1745449b381d9fa1ba74d2ab77dfc9dc60e815a6708359373ec069a346"
  },
  {
    clauseId: "A11Y-SRC-DESIGN-READING-LOAD",
    sourcePath: "product/DESIGN_SYSTEM.md",
    sourceBlobSha: "24119fa451f0bc05fe091acd9a61a6be83441bf7",
    lineStart: 168,
    lineEnd: 204,
    sha256: "18ec95186e8f947c6cde6bb01c1450f82a41f87ae8886d628dc11395e73c0530"
  },
  {
    clauseId: "A11Y-SRC-DESIGN-STATE-RECOVERY",
    sourcePath: "product/DESIGN_SYSTEM.md",
    sourceBlobSha: "24119fa451f0bc05fe091acd9a61a6be83441bf7",
    lineStart: 312,
    lineEnd: 327,
    sha256: "806533b7b51a43c614d540826dd10e78f799ed8a00d7b831ad65232f6159de14"
  },
  {
    clauseId: "A11Y-SRC-DESIGN-QUESTION-NONVISUAL",
    sourcePath: "product/DESIGN_SYSTEM.md",
    sourceBlobSha: "24119fa451f0bc05fe091acd9a61a6be83441bf7",
    lineStart: 349,
    lineEnd: 368,
    sha256: "30952359b77b61d7f41e854910b7fc1fba4915b90c8455004fd59f7bd1c26553"
  },
  {
    clauseId: "A11Y-SRC-DESIGN-HAZARD-NONVISUAL",
    sourcePath: "product/DESIGN_SYSTEM.md",
    sourceBlobSha: "24119fa451f0bc05fe091acd9a61a6be83441bf7",
    lineStart: 400,
    lineEnd: 420,
    sha256: "b004fcd79ffc754166c669d855c9389c11231f259073d15e2a988a7273bc50a3"
  },
  {
    clauseId: "A11Y-SRC-DESIGN-FORCED-COLORS",
    sourcePath: "product/DESIGN_SYSTEM.md",
    sourceBlobSha: "24119fa451f0bc05fe091acd9a61a6be83441bf7",
    lineStart: 455,
    lineEnd: 495,
    sha256: "9812c6fc6c22122d2dff542ca6c51f4c6cd457d0be6f8cc20fcbad3123d27211"
  },
  {
    clauseId: "A11Y-SRC-DESIGN-REDUCED-MOTION",
    sourcePath: "product/DESIGN_SYSTEM.md",
    sourceBlobSha: "24119fa451f0bc05fe091acd9a61a6be83441bf7",
    lineStart: 496,
    lineEnd: 524,
    sha256: "3d67310e27097019fec337ab8d4045cc9d5ddcff1949623189c3ff884ee7ffbc"
  },
  {
    clauseId: "A11Y-SRC-DESIGN-PRINT",
    sourcePath: "product/DESIGN_SYSTEM.md",
    sourceBlobSha: "24119fa451f0bc05fe091acd9a61a6be83441bf7",
    lineStart: 529,
    lineEnd: 562,
    sha256: "d70908cb568b26df280a54d7aa7e857a594c904e3164a9147fc7c9b10c5abde0"
  }
])
const ACCESSIBILITY_DIMENSIONS = Object.freeze([
  { dimensionId: "semantic-html", sourceClauseIds: [
    "A11Y-SRC-FEATURE-ACCESSIBILITY", "A11Y-SRC-DESIGN-READING-LOAD",
    "A11Y-SRC-DESIGN-QUESTION-NONVISUAL"
  ] },
  { dimensionId: "keyboard-only", sourceClauseIds: [
    "A11Y-SRC-FEATURE-ACCESSIBILITY", "A11Y-SRC-DESIGN-STATE-RECOVERY"
  ] },
  { dimensionId: "focus-and-status-markup", sourceClauseIds: [
    "A11Y-SRC-FEATURE-ACCESSIBILITY", "A11Y-SRC-DESIGN-STATE-RECOVERY"
  ] },
  { dimensionId: "320-and-1440-css-pixel-reflow", sourceClauseIds: [
    "A11Y-SRC-FEATURE-QA", "A11Y-SRC-DESIGN-READING-LOAD",
    "A11Y-SRC-DESIGN-QUESTION-NONVISUAL", "A11Y-SRC-DESIGN-HAZARD-NONVISUAL"
  ] },
  { dimensionId: "forced-colors", sourceClauseIds: [
    "A11Y-SRC-FEATURE-QA", "A11Y-SRC-DESIGN-FORCED-COLORS"
  ] },
  { dimensionId: "reduced-motion", sourceClauseIds: [
    "A11Y-SRC-FEATURE-ACCESSIBILITY", "A11Y-SRC-DESIGN-REDUCED-MOTION"
  ] },
  { dimensionId: "print-and-large-print-transformation", sourceClauseIds: [
    "A11Y-SRC-FEATURE-QA", "A11Y-SRC-DESIGN-PRINT"
  ] },
  { dimensionId: "nonvisual-operability", sourceClauseIds: [
    "A11Y-SRC-FEATURE-ACCESSIBILITY", "A11Y-SRC-DESIGN-QUESTION-NONVISUAL",
    "A11Y-SRC-DESIGN-HAZARD-NONVISUAL"
  ] },
  { dimensionId: "cognitive-load", sourceClauseIds: [
    "A11Y-SRC-DESIGN-READING-LOAD", "A11Y-SRC-DESIGN-STATE-RECOVERY",
    "A11Y-SRC-DESIGN-QUESTION-NONVISUAL", "A11Y-SRC-DESIGN-HAZARD-NONVISUAL"
  ] }
])
const ACCESSIBILITY_SURFACE_EXPECTED = Object.freeze({
  version: "CODEX-ONLY-UIUX-V1/ROUTE-ACCESSIBILITY-SURFACE-V1",
  applicability: "all-required",
  bindingRule: "each-route-plus-all-containing-state-atoms-and-transition-binding-occurrences",
  dimensionOrder: ACCESSIBILITY_DIMENSION_ORDER,
  sourceClauses: ACCESSIBILITY_SOURCE_CLAUSES,
  dimensions: ACCESSIBILITY_DIMENSIONS
})
const SCREEN_STATE_AUTHORITY_EXPECTED = Object.freeze({
  version: "CODEX-ONLY-UIUX-V1/SCREEN-STATE-AUTHORITY-V1",
  sourcePath: "product/SCREEN_STATES.md",
  sourceGitBlobSha: "c2d71d1f786efe99421ee5eb5167cbd3cd426023",
  sourceSha256: "54b7b18280cbc8a6ec3300c424ee412e4fcb9c4d4cb773ecd4af7adc63c22987",
  authoritySha256: "7a82755f3a1a9531c5e20569e9bbdec1280fd7ab504bbaccacb955b29009ac54",
  counts: {
    routeOccurrenceCount: 36,
    routeUniqueCount: 36,
    routeBindingCount: 36,
    directStateAtomCount: 162,
    normalizedStateAtomCount: 42,
    stateAtomOccurrenceCount: 204,
    stateAtomUniqueCount: 204,
    stateLabelUniqueCount: 95,
    machineTransitionOccurrenceCount: 96,
    machineTransitionUniqueCount: 95,
    matrixTransitionOccurrenceCount: 13,
    matrixTransitionUniqueCount: 13,
    transitionOccurrenceCount: 109,
    transitionUniqueCount: 108,
    transitionBindingOccurrenceCount: 161,
    transitionBindingUniqueCount: 161,
    routeTransitionSurfaceRowCount: 36,
    lensStateOccurrenceCount: 145,
    lensStateUniqueCount: 135,
    lensTransitionOccurrenceCount: 168,
    lensTransitionUniqueCount: 166,
    interruptionRowCount: 128,
    capabilityRowCount: 96,
    categoryRowCount: 56,
    requirementCount: 978
  },
  roots: {
    routeIdsSha256: "2ac859959fad1e44e8a862e611e5f51c417f54c334990cdf1be63b587273fa06",
    sourceClausesSha256: "16a6354d8191787c50a931b47789c9bbffe87430e55dea7852a98e726173433b",
    stateAtomsSha256: "8c9083c0e01d3430ab67cff763896d197f6e13a5620279982508bdc7068216ac",
    transitionAtomsSha256: "67f0c5852211902e331ce79207d868ec6f06461563e3ebaa0b28478d0e43f316",
    machineBindingsSha256: "36838401aa2dde163ec53da4f8ef15ac982422418bff38644d75a4480d882316",
    transitionBindingOccurrencesSha256: "6ebd913562d45a988006b54c92d1c63dbfb5b8dd2db17fb5abcd98d433b7d2f3",
    routeBindingsSha256: "62392e67166f2c7ab5ef8e4f53b1a7dad38c2273d635c1bdbbf6c71b489b422a"
  },
  normalizationRules: [
    "scope-preserving-no-cartesian-expansion",
    "exact-source-clause-plus-frozen-edge-expansion",
    "filter-search-compound-action-preserved",
    "flag-unflag-and-review-exit-split",
    "navigation-outcomes-not-legal-states",
    "settings-reset-rebuild-filtered-no-export-graph",
    "three-prose-implied-recovery-atoms-explicit",
    "route-transition-surfaces-bind-full-source-clauses",
    "transition-proofs-close-every-explicit-binding-occurrence"
  ],
  authorityLimitations: [
    "simulation-print-member-state-allocation-not-source-specified",
    "settings-export-transition-graph-not-source-specified",
    "normalized-edge-actions-are-contract-owned-not-runtime-observations",
    "route-transition-surfaces-preserve-source-prose-without-inventing-unstated-edges"
  ]
})

const PLAN_JOURNEY_SUMMARY = Object.freeze({
  version: "CODEX-ONLY-UIUX-V1/JOURNEYS-V5",
  sourcePath: paths.canonicalPlan,
  sourceBlobSha: EXPECTED_SOURCE_COORDINATES.canonicalPlan.gitBlobSha,
  authorityStatePath: "product/SCREEN_STATES.md",
  authorityStateBlobSha: "c2d71d1f786efe99421ee5eb5167cbd3cd426023",
  journeyIds: JOURNEY_IDS,
  canonicalRouteRowCount: 36,
  authorityStateRowCount: 204,
  authorityTransitionRowCount: 109,
  authorityTransitionBindingOccurrenceCount: 161,
  routeTransitionSurfaceRowCount: 36,
  routeAccessibilitySurfaceRowCount: 324,
  lensStateRowCount: 145,
  lensStateUniqueCount: 135,
  lensTransitionRowCount: 168,
  lensTransitionUniqueCount: 166,
  interruptionRowCount: 128,
  capabilityRowCount: 96,
  categoryRowCount: 56,
  requirementCount: 1302,
  screenStateAuthoritySha256: SCREEN_STATE_AUTHORITY_EXPECTED.authoritySha256,
  requirementRowsSha256: "d755a1265325b71a3b14fd48e6e1c0b87ba9f8afaee2ffff500c2f2e582859e0",
  requirementIdsSha256: "646a43081fe784d55c4189a9578fab243f18cfe09062288b09299dc58a01eeab",
  applicabilityRowsSha256: "6d0cac094bfbbe5a29a31184d613061ac80a74938d734315f9c310556ffc56c9",
  ownerRowsSha256: "0bf8cf8cd4ee330cadafd12452611f1e19f101c358bdd0d62e9a331c5f2d6d69",
  providerRowsSha256: "f2d1bfa459fb17a2d6597bb6e28613134808f8d8feb0e60f7b1c845bee655ae3",
  applicability: "all-required",
  requirementKindOrder: [
    "authority-route", "authority-state", "authority-route-transition-surface", "authority-transition",
    "authority-route-accessibility",
    "journey-state", "journey-transition", "interruption", "capability", "category"
  ],
  sourceClauseIdTemplate: "P008-REQ-{globalOrdinal4}",
  assertionIdTemplate: "P008-AST-{globalOrdinal4}"
})

const BASELINE_RECORD_IDS = Object.freeze(["BASE-AUTOMATED-001", "BASE-AUTOMATED-002"])
const BASELINE_RECORD_HASHES = Object.freeze({
  "BASE-AUTOMATED-001": "e859d096f9c2d1d8c1746c50ca9f8251c0ef76da03f22c8d688eddd6ce253393",
  "BASE-AUTOMATED-002": "43d9aaef0a261009e0213858fb0d908799daf162d6770bcf75a89176061ab612"
})
const BASELINE_RUN_RESULT_HASHES = Object.freeze({
  "BASE-AUTOMATED-001": "f99f0f8636f246486fea8eb06ed0ed030a1bb4d56aea3921b78c3bf05950c577",
  "BASE-AUTOMATED-002": "2d676c008572d7fa5c4d02299b3d35bb75bcc574df802c50ee5f67b25127f5c5"
})
const BASELINE_SEQUENCE_SHA256 = "92b3d428ebd658091803d11bde5165e570f363b792b9997e41f4a41c470aaa14"

const BASELINE_CONTRACT = Object.freeze({
  lockingMode: "exact-record-and-run-result-stable-canonical-sha256",
  recordIds: BASELINE_RECORD_IDS,
  recordSha256ById: BASELINE_RECORD_HASHES,
  recordSequenceSha256: BASELINE_SEQUENCE_SHA256,
  runResultSha256ById: BASELINE_RUN_RESULT_HASHES,
  sourceSha: EXPECTED_SOURCE_COORDINATES.preparedAgainstOriginMainSha,
  allowedKind: "non-participant-automation",
  requiredClaimScope: "current-site-baseline-only",
  requiredParticipantCount: 0,
  requiredParticipantEvidence: "none",
  requiredHumanEvidence: "none",
  requiredHumanSessionCount: 0,
  requiredNotHumanUsabilityTested: true,
  requiredAgentsCountAsPeople: false,
  requiredSubstitutionForPeople: false,
  exactRecordOrderRequired: true,
  summariesAndLimitationsLockedByRecordDigest: true
})

const parseJsonNoDuplicateKeys = (raw, label = "JSON") => {
  if (typeof raw !== "string" || raw.length === 0 || raw.includes("\r")) {
    fail("MALFORMED_JSON", `${label} text shape is invalid`)
  }
  let cursor = 0
  const skip = () => { while (/\s/.test(raw[cursor] ?? "")) cursor += 1 }
  const string = () => {
    if (raw[cursor] !== "\"") fail("MALFORMED_JSON", `${label} contains malformed JSON`)
    const start = cursor
    cursor += 1
    while (cursor < raw.length) {
      if (raw[cursor] === "\\") { cursor += 2; continue }
      if (raw[cursor] === "\"") {
        cursor += 1
        try { return JSON.parse(raw.slice(start, cursor)) } catch { fail("MALFORMED_JSON", `${label} contains malformed JSON`) }
      }
      cursor += 1
    }
    fail("MALFORMED_JSON", `${label} contains malformed JSON`)
  }
  const number = () => {
    const match = raw.slice(cursor).match(/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/)
    if (match === null) fail("MALFORMED_JSON", `${label} contains malformed JSON`)
    cursor += match[0].length
  }
  const value = () => {
    skip()
    const token = raw[cursor]
    if (token === "{") return object()
    if (token === "[") return array()
    if (token === "\"") { string(); return }
    for (const literal of ["true", "false", "null"]) {
      if (raw.startsWith(literal, cursor)) { cursor += literal.length; return }
    }
    number()
  }
  const array = () => {
    cursor += 1; skip()
    if (raw[cursor] === "]") { cursor += 1; return }
    while (cursor < raw.length) {
      value(); skip()
      if (raw[cursor] === "]") { cursor += 1; return }
      if (raw[cursor] !== ",") fail("MALFORMED_JSON", `${label} contains malformed JSON`)
      cursor += 1
    }
    fail("MALFORMED_JSON", `${label} contains malformed JSON`)
  }
  const object = () => {
    cursor += 1; skip()
    const keys = new Set()
    if (raw[cursor] === "}") { cursor += 1; return }
    while (cursor < raw.length) {
      const key = string()
      if (keys.has(key)) fail("DUPLICATE_JSON_KEY", `${label} contains a duplicate key`)
      keys.add(key); skip()
      if (raw[cursor] !== ":") fail("MALFORMED_JSON", `${label} contains malformed JSON`)
      cursor += 1; value(); skip()
      if (raw[cursor] === "}") { cursor += 1; return }
      if (raw[cursor] !== ",") fail("MALFORMED_JSON", `${label} contains malformed JSON`)
      cursor += 1; skip()
    }
    fail("MALFORMED_JSON", `${label} contains malformed JSON`)
  }
  skip(); value(); skip()
  if (cursor !== raw.length) fail("MALFORMED_JSON", `${label} contains malformed JSON`)
  try { return JSON.parse(raw) } catch { fail("MALFORMED_JSON", `${label} contains malformed JSON`) }
}

const validateCanonicalJsonBytes = (raw, value, code, label) => {
  if (raw !== `${canonicalJson(value)}\n`) fail(code, `${label} bytes are not canonical JSON`)
}

const parseFrontMatter = (raw) => {
  const match = raw.match(/^# [^\n]+\n\n---\n([\s\S]*?)\n---\n/)
  if (match === null) fail("PROTOCOL_METADATA", "protocol front matter is missing")
  const metadata = {}
  for (const line of match[1].split("\n")) {
    const delimiter = line.indexOf(":")
    if (delimiter < 1) fail("PROTOCOL_METADATA", "protocol front matter is malformed")
    const key = line.slice(0, delimiter).trim()
    const encoded = line.slice(delimiter + 1).trim()
    if (Object.hasOwn(metadata, key)) fail("PROTOCOL_METADATA", "protocol front matter contains a duplicate key")
    metadata[key] = encoded === "null" ? null
      : encoded === "true" ? true
        : encoded === "false" ? false
          : /^-?\d+$/.test(encoded) ? Number(encoded)
            : encoded
  }
  exactKeys(metadata, Object.keys(PERMANENT_METADATA), "PROTOCOL_METADATA", "protocol metadata")
  exactValue(metadata, PERMANENT_METADATA, "PERMANENT_BOUNDARY", "protocol metadata")
  return metadata
}

const parseClauses = (raw, prefix) => {
  const pattern = new RegExp(`<!-- ${prefix}-CLAUSE ([A-Z0-9-]+) ([^\\s=]+=[^\\s]+) -->`, "g")
  const clauses = {}
  for (const match of raw.matchAll(pattern)) {
    if (Object.hasOwn(clauses, match[1])) fail("CANONICAL_CLAUSE", "canonical document repeats a clause ID")
    clauses[match[1]] = match[2]
  }
  return clauses
}

const HUMAN_GATE_PATTERNS = Object.freeze([
  /run\s+(?:two|2)\s+(?:iterative\s+)?moderated\s+rounds/iu,
  /\bconduct\s+(?:an?\s+)?(?:facilitated|moderated)\s+(?:evaluation|usability|review)\s+round\b/iu,
  /\b6\s*[-–]\s*8\s+(?:primary\s+)?(?:participants|people|learners)\b/iu,
  /maintainer\s+must\s+(?:sign\s*off|approve)/iu,
  /maintainer\s+(?:approval|sign[ -]?off)\s+is\s+required/iu,
  /reviewer\s+(?:must\s+)?approves?/iu,
  /\breviewer\s+must\s+sign\s*off\b/iu,
  /(?:recruitment|consent)\s+(?:is|required|gate|must)/iu,
  /\brecruit\s+(?:[1-9]\d*|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:adult\s+)?(?:volunteers?|participants?|learners?|people)\b/iu,
  /\bdecisionOwner\b/u,
  /\bapprovalArtifact\b/u,
  /participant\s+outreach\s+is\s+authorized/iu,
  /\b[1-9]\d*\s+(?:real\s+)?participants?\b.{0,80}\b(?:accepted|approved|selected|completed|validated)\b/iu,
  /\b(?:one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:learners?|participants?|candidates?)\b.{0,80}\b(?:completed|accepted|approved|validated)\b/iu,
  /\bdeployment\s+to\s+production\s+is\s+permitted\b/iu,
  /\bthe\s+release\s+may\s+go\s+live\b/iu,
  /\bthe\s+candidate\s+is\s+cleared\s+to\s+go\s+live\b/iu,
  /\brelease\s+(?:is\s+)?authorized\b/iu,
  /\bthe\s+site\s+may\s+go\s+live\b/iu,
  /\b(?:deployment|candidate|site|release)\b.{0,60}\b(?:green\s+light|go[ -]?ahead|proceed|move\s+forward|ship|blessing|rollout[ -]?ready|gate\s+passed|into\s+production)\b/iu,
  /\b(?:cohort|panel)\b.{0,80}\b(?:completed|passed|observed|preferred|supported|tested|validated)\b|\b(?:participants?|users?|people|humans?)\s+(?!(?:count\s+0|evidence\s+none)).{0,80}\b(?:completed|passed|observed|preferred|supported|tested|validated)\b/iu,
  /\b(?:participant\s+feedback|participant\s+outcomes?|user\s+research|moderated\s+validation)\b/iu,
  /\b(?:screen[ -]?reader|real[ -]?device|emitted[ -]?at|wcag\s*2\.2\s*aa)\b.{0,80}\b(?:succeeded|passed|tested|meets?|validated|verified|phone)\b/iu,
  /\bpersonas?\b.{0,40}\b(?:model|predict|represent)\w*\b.{0,40}\b(?:preferences?|behavio(?:u)?r|outcomes?)\b/iu,
  /\bautomated\s+panel\b.{0,40}\b(?:is\s+)?equivalent\b.{0,30}\b(?:users?|people|humans?)\b/iu,
  /\b(?:complete|conduct|perform|run|schedule)\b.{0,40}\b(?:moderated|facilitated)\b.{0,30}\b(?:round|session|study|test|validation)\b/iu,
  /\b(?:moderated|facilitated)\b.{0,30}\b(?:round|session|study|test|validation)\b.{0,40}\b(?:required|mandatory|before\s+(?:exit|release)|must)\b/iu,
  /\b(?:human|maintainer|reviewer)\s+sign[ -]?off\b.{0,30}\b(?:required|mandatory|must|before)\b|\b(?:required|mandatory)\b.{0,30}\b(?:human|maintainer|reviewer)\s+sign[ -]?off\b/iu,
  /\bdecision\s+owner\b.{0,30}\b(?:must|shall|required|approve|approval|sign[ -]?off)\b/iu,
  /\b(?:use|include|involve|enroll|enrol)\s+(?:[1-9]\d*|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:adult\s+)?(?:volunteers?|participants?|learners?|people)\b/iu,
  /\b(?:participants?|humans?|learners?|volunteers?|humanparticipants?|humansessions?)\s*[:=]\s*[1-9]\d*\b/iu,
  /\b(?:participantcount|humanparticipantcount|humansessioncount)\s*[:=]\s*[1-9]\d*\b/iu,
  /\b(?:humanevidence|participantevidence)\s*[:=]\s*(?!none\b)[a-z][a-z0-9_-]*\b/iu,
  /\b(?:productionauthorized|productionauthorization|releaseauthorized)\s*[:=]\s*true\b/iu,
  /^\s*(?:publishable|launchable|deployable|shippable|greenlit|productionready|rolloutready|fully[ -]?accessible)\s*[.!]?\s*$/imu,
  /^\s*(?:nvda|jaws|voiceover|talkback|orca|narrator|screenreader|real[ -]?device)[_ -]?(?:ok|passed|success|successful|worked|verified)\s*[.!]?\s*$/imu
])
const validateCanonicalDocumentSemantics = (raw, kind) => {
  for (const [index, pattern] of HUMAN_GATE_PATTERNS.entries()) {
    if (pattern.test(raw)) fail("CANONICAL_HUMAN_GATE", `${kind} restores prohibited human execution machinery at semantic rule ${index + 1}`)
  }
  const expected = kind === "canonical Plan 008" ? PLAN_CLAUSES : README_CLAUSES
  const prefix = kind === "canonical Plan 008" ? "P008" : "PREADME"
  exactValue(parseClauses(raw, prefix), expected, "CANONICAL_CLAUSE", `${kind} semantic clauses`)
}

const parsePlanJourneyContract = (raw) => {
  const match = raw.match(/<!-- PLAN008-JOURNEY-CONTRACT-START -->\n```json\n([\s\S]*?)\n```\n<!-- PLAN008-JOURNEY-CONTRACT-END -->/)
  if (match === null) fail("JOURNEY_CONTRACT", "canonical Plan 008 journey contract is missing")
  return parseJsonNoDuplicateKeys(match[1], "canonical journey contract")
}

const deriveScreenStateSourceClauses = (raw) => {
  if (typeof raw !== "string" || raw.includes("\r") || sha256Text(raw) !== SCREEN_STATE_AUTHORITY_EXPECTED.sourceSha256) {
    fail("SCREEN_STATE_SOURCE", "screen-state authority bytes differ from the bound source")
  }
  const lines = raw.split("\n")
  const sourceClauses = []
  const routeBindings = []
  const addClause = (clauseId, kind, text, lineStart, lineEnd = lineStart) => {
    sourceClauses.push({
      clauseId,
      kind,
      lineStart,
      lineEnd,
      sha256: sha256Text(text.endsWith("\n") ? text : `${text}\n`)
    })
  }
  const routeOrder = []
  for (let family = 1; family <= 21; family += 1) {
    const matches = lines.flatMap((line, index) => line.startsWith(`| ${family}. `) ? [{ line, lineNumber: index + 1 }] : [])
    if (matches.length !== 1) fail("SCREEN_STATE_ROUTE_SET", "route-family source row set differs")
    const ids = [...matches[0].line.split("|")[1].matchAll(/`([a-z0-9-]+)`/gu)].map((match) => match[1])
    if (ids.length === 0) fail("SCREEN_STATE_ROUTE_SET", "route-family source row has no route IDs")
    const clauseId = `SS-RF-${String(family).padStart(3, "0")}`
    routeOrder.push(...ids)
    for (const routeId of ids) routeBindings.push({
      routeBindingId: `SS-AUTH-ROUTE-${String(routeBindings.length + 1).padStart(4, "0")}`,
      routeId,
      sourceClauseIds: [clauseId]
    })
    addClause(clauseId, "route-family-row", matches[0].line, matches[0].lineNumber)
  }
  const staticMatch = raw.match(
    /The additional static `scoring-explainer`, `actual-questions-explainer`, `about`,\nand conditional `nyc-disambiguation` spokes in `ROUTES\.md` use the reference\ndocument machine \(`ready`, `offline-stale`, `not-found\|withdrawn`\) and normal\ndocument history; they introduce no application state\./u
  )
  if (staticMatch === null) fail("SCREEN_STATE_STATIC_SPOKES", "static-spoke authority clause is missing")
  const staticLineStart = raw.slice(0, staticMatch.index).split("\n").length
  addClause("SS-STATIC-SPOKES", "static-spoke-binding", staticMatch[0], staticLineStart, staticLineStart + 3)
  const staticIds = [...staticMatch[0].matchAll(/`([a-z0-9-]+)`/gu)]
    .map((match) => match[1])
    .filter((value) => !["ready", "offline-stale"].includes(value))
  routeOrder.push(...staticIds)
  for (const routeId of staticIds) routeBindings.push({
    routeBindingId: `SS-AUTH-ROUTE-${String(routeBindings.length + 1).padStart(4, "0")}`,
    routeId,
    sourceClauseIds: ["SS-STATIC-SPOKES"]
  })

  const machineDefinitions = [
    ["Reference and index documents", "REF", "reference"],
    ["Immediate-feedback question and review item", "Q", "immediate"],
    ["Hazard item", "H", "hazard"],
    ["Simulation", "SIM", "simulation"],
    ["Print job", "PRINT", "print"],
    ["Offline pack", "PACK", "offline-pack"],
    ["Correction/security report", "CORR", "correction"],
    ["Import, projection rebuild, and reset", "DATA", "import-projection-reset"]
  ]
  for (const [heading, code, machineId] of machineDefinitions) {
    const headingIndex = lines.findIndex((line) => line === `### ${heading}`)
    const fenceStart = lines.findIndex((line, index) => index > headingIndex && line === "```text")
    const fenceEnd = lines.findIndex((line, index) => index > fenceStart && line === "```")
    if (headingIndex < 0 || fenceStart < 0 || fenceEnd < 0) {
      fail("SCREEN_STATE_SOURCE_CLAUSE", "canonical state-machine block is missing")
    }
    const block = lines.slice(fenceStart + 1, fenceEnd).join("\n")
    addClause(`SS-M-${code}-BLOCK`, "machine-block", block, fenceStart + 2, fenceEnd)
    let transitionOrdinal = 0
    for (let index = fenceStart + 1; index < fenceEnd; index += 1) {
      if (!lines[index].includes("->")) continue
      const recoveryOnly = machineId === "reference" && lines[index].trim() === "-> retry / choose cached parent / download pack"
      const clauseId = recoveryOnly
        ? "SS-M-REF-RECOVERY-01"
        : `SS-M-${code}-${String(++transitionOrdinal).padStart(2, "0")}`
      addClause(clauseId, recoveryOnly ? "recovery-action-clause" : "machine-transition-clause", lines[index], index + 1)
    }
  }
  assertUniqueStrings(routeOrder, "SCREEN_STATE_ROUTE_SET", "screen-state route order")
  return { routeOrder, routeBindings, sourceClauses }
}

const sourceClauseBytes = (raw, lineStart, lineEnd) => {
  const lines = raw.split("\n")
  if (
    !Number.isInteger(lineStart) || !Number.isInteger(lineEnd) ||
    lineStart < 1 || lineEnd < lineStart || lineEnd >= lines.length
  ) fail("ACCESSIBILITY_SOURCE", "accessibility source clause coordinates are invalid")
  return `${lines.slice(lineStart - 1, lineEnd).join("\n")}\n`
}

const validateAccessibilitySurface = (surface, sourceRawByPath) => {
  exactValue(surface, ACCESSIBILITY_SURFACE_EXPECTED, "ACCESSIBILITY_SURFACE", "route accessibility surface")
  if (!(sourceRawByPath instanceof Map)) fail("ACCESSIBILITY_SOURCE", "accessibility source bytes are missing")
  const clauseIds = new Set()
  for (const clause of surface.sourceClauses) {
    assertSafeRepositoryPath(clause.sourcePath, "ACCESSIBILITY_SOURCE", "accessibility source path")
    assertGitSha(clause.sourceBlobSha, "ACCESSIBILITY_SOURCE", "accessibility source Git blob")
    assertHash(clause.sha256, "ACCESSIBILITY_SOURCE", "accessibility source clause SHA-256")
    const raw = sourceRawByPath.get(clause.sourcePath)
    if (
      typeof raw !== "string" || raw.includes("\r") ||
      gitBlobSha(raw) !== clause.sourceBlobSha ||
      sha256Text(sourceClauseBytes(raw, clause.lineStart, clause.lineEnd)) !== clause.sha256
    ) fail("ACCESSIBILITY_SOURCE", "accessibility source clause bytes differ")
    if (clauseIds.has(clause.clauseId)) fail("ACCESSIBILITY_SOURCE", "accessibility source clause ID is duplicated")
    clauseIds.add(clause.clauseId)
  }
  exactValue(
    surface.dimensions.map(({ dimensionId }) => dimensionId),
    ACCESSIBILITY_DIMENSION_ORDER,
    "ACCESSIBILITY_DIMENSION",
    "accessibility dimension order"
  )
  for (const dimension of surface.dimensions) {
    assertUniqueStrings(dimension.sourceClauseIds, "ACCESSIBILITY_DIMENSION", "accessibility dimension source clauses")
    if (dimension.sourceClauseIds.some((clauseId) => !clauseIds.has(clauseId))) {
      fail("ACCESSIBILITY_DIMENSION", "accessibility dimension cites an unknown source clause")
    }
  }
  const referencedClauses = new Set(surface.dimensions.flatMap(({ sourceClauseIds }) => sourceClauseIds))
  if (referencedClauses.size !== clauseIds.size) {
    fail("ACCESSIBILITY_DIMENSION", "accessibility source clause is not bound to a dimension")
  }
  return surface
}

const validateScreenStateAuthority = (authority, screenStatesRaw) => {
  exactKeys(authority, [
    "version", "sourcePath", "sourceGitBlobSha", "sourceSha256", "routeOrder",
    "staticSpokeRouteIds", "routeBindings", "sourceClauses", "stateAtoms", "transitionAtoms",
    "machineBindings", "transitionBindingOccurrences", "counts", "roots",
    "normalizationRules", "authorityLimitations"
  ], "SCREEN_STATE_AUTHORITY", "screen-state authority contract")
  if (
    sha256Text(screenStatesRaw) !== SCREEN_STATE_AUTHORITY_EXPECTED.sourceSha256 ||
    gitBlobSha(screenStatesRaw) !== SCREEN_STATE_AUTHORITY_EXPECTED.sourceGitBlobSha
  ) fail("SCREEN_STATE_SOURCE", "bound SCREEN_STATES bytes differ")
  if (
    authority.version !== SCREEN_STATE_AUTHORITY_EXPECTED.version ||
    authority.sourcePath !== SCREEN_STATE_AUTHORITY_EXPECTED.sourcePath ||
    authority.sourceGitBlobSha !== SCREEN_STATE_AUTHORITY_EXPECTED.sourceGitBlobSha ||
    authority.sourceSha256 !== SCREEN_STATE_AUTHORITY_EXPECTED.sourceSha256
  ) fail("SCREEN_STATE_AUTHORITY", "screen-state authority identity differs")
  const derivedSource = deriveScreenStateSourceClauses(screenStatesRaw)
  exactValue(authority.routeOrder, SCREEN_STATE_ROUTE_ORDER, "SCREEN_STATE_ROUTE_SET", "canonical route order")
  exactValue(derivedSource.routeOrder, SCREEN_STATE_ROUTE_ORDER, "SCREEN_STATE_ROUTE_SET", "source-derived route order")
  exactValue(authority.staticSpokeRouteIds, STATIC_SPOKE_ROUTE_IDS, "SCREEN_STATE_STATIC_SPOKES", "static-spoke route IDs")
  exactValue(authority.routeBindings, derivedSource.routeBindings, "SCREEN_STATE_ROUTE_BINDING", "source-derived route bindings")
  exactValue(authority.sourceClauses, derivedSource.sourceClauses, "SCREEN_STATE_SOURCE_CLAUSE", "source-clause projection")
  exactValue(authority.counts, SCREEN_STATE_AUTHORITY_EXPECTED.counts, "SCREEN_STATE_COUNTS", "authority counts")
  if (
    authority.routeBindings.length !== authority.counts.routeBindingCount ||
    authority.stateAtoms.length !== authority.counts.stateAtomOccurrenceCount ||
    authority.transitionAtoms.length !== authority.counts.transitionOccurrenceCount ||
    authority.transitionBindingOccurrences.length !== authority.counts.transitionBindingOccurrenceCount
  ) fail("SCREEN_STATE_COUNTS", "authority occurrence arrays differ from their exact cardinalities")
  exactValue(authority.normalizationRules, SCREEN_STATE_AUTHORITY_EXPECTED.normalizationRules, "SCREEN_STATE_NORMALIZATION", "normalization rules")
  exactValue(authority.authorityLimitations, SCREEN_STATE_AUTHORITY_EXPECTED.authorityLimitations, "SCREEN_STATE_NORMALIZATION", "authority limitations")
  if (
    sha256Canonical(authority.routeOrder) !== authority.roots.routeIdsSha256 ||
    sha256Canonical(authority.routeBindings) !== authority.roots.routeBindingsSha256 ||
    sha256Canonical(authority.sourceClauses) !== authority.roots.sourceClausesSha256 ||
    sha256Canonical(authority.stateAtoms) !== authority.roots.stateAtomsSha256 ||
    sha256Canonical(authority.transitionAtoms) !== authority.roots.transitionAtomsSha256 ||
    sha256Canonical(authority.machineBindings) !== authority.roots.machineBindingsSha256 ||
    sha256Canonical(authority.transitionBindingOccurrences) !== authority.roots.transitionBindingOccurrencesSha256
  ) fail("SCREEN_STATE_ROOT", "authority child root differs")

  const clauseIds = new Set(authority.sourceClauses.map((clause) => clause.clauseId))
  const stateKeys = new Set()
  const stateLabels = new Set()
  let directStates = 0
  for (let index = 0; index < authority.stateAtoms.length; index += 1) {
    const atom = authority.stateAtoms[index]
    exactKeys(atom, ["stateAtomId", "routeScope", "stateId", "normalizationCode", "sourceClauseIds"], "SCREEN_STATE_STATE_ATOM", "authority state atom")
    if (
      atom.stateAtomId !== `SS-AUTH-STATE-${String(index + 1).padStart(4, "0")}` ||
      !/^[a-z0-9:+()-]+$/u.test(atom.stateId)
    ) fail("SCREEN_STATE_STATE_ATOM", "authority state atom identity differs")
    assertUniqueStrings(atom.routeScope, "SCREEN_STATE_STATE_ATOM", "authority state route scope")
    assertUniqueStrings(atom.sourceClauseIds, "SCREEN_STATE_STATE_ATOM", "authority state source clauses")
    if (
      atom.routeScope.some((routeId) => !SCREEN_STATE_ROUTE_ORDER.includes(routeId)) ||
      atom.sourceClauseIds.some((clauseId) => !clauseIds.has(clauseId))
    ) fail("SCREEN_STATE_STATE_ATOM", "authority state atom source or route closure differs")
    const stateKey = `${atom.routeScope.join("+")}\u001f${atom.stateId}`
    if (stateKeys.has(stateKey)) fail("SCREEN_STATE_STATE_DUPLICATE", "authority state atom is duplicated")
    stateKeys.add(stateKey)
    stateLabels.add(atom.stateId)
    if (["direct-route-matrix", "static-reference"].includes(atom.normalizationCode)) directStates += 1
  }
  if (
    authority.stateAtoms.length !== authority.counts.stateAtomOccurrenceCount ||
    stateKeys.size !== authority.counts.stateAtomUniqueCount ||
    stateLabels.size !== authority.counts.stateLabelUniqueCount ||
    directStates !== authority.counts.directStateAtomCount ||
    authority.stateAtoms.length - directStates !== authority.counts.normalizedStateAtomCount
  ) fail("SCREEN_STATE_COUNTS", "authority state counts differ")

  const transitionKeys = new Set()
  const transitionOccurrencesByClause = new Map()
  let machineTransitions = 0
  for (let index = 0; index < authority.transitionAtoms.length; index += 1) {
    const atom = authority.transitionAtoms[index]
    exactKeys(atom, [
      "transitionAtomId", "kind", "machineId", "from", "action", "to",
      "sourceClauseId", "sourceOccurrenceOrdinal"
    ], "SCREEN_STATE_TRANSITION_ATOM", "authority transition atom")
    if (
      atom.transitionAtomId !== `SS-AUTH-TRANS-${String(index + 1).padStart(4, "0")}` ||
      !["machine-template", "route-matrix"].includes(atom.kind) ||
      !clauseIds.has(atom.sourceClauseId) ||
      !Number.isInteger(atom.sourceOccurrenceOrdinal) || atom.sourceOccurrenceOrdinal < 1 ||
      [atom.machineId, atom.from, atom.action, atom.to].some((value) => typeof value !== "string" || value.length === 0 || /[^\x20-\x7e]/u.test(value))
    ) fail("SCREEN_STATE_TRANSITION_ATOM", "authority transition atom identity differs")
    const expectedOrdinal = (transitionOccurrencesByClause.get(atom.sourceClauseId) ?? 0) + 1
    if (atom.sourceOccurrenceOrdinal !== expectedOrdinal) fail("SCREEN_STATE_TRANSITION_ATOM", "authority transition source occurrence order differs")
    transitionOccurrencesByClause.set(atom.sourceClauseId, expectedOrdinal)
    transitionKeys.add(`${atom.machineId}\u001f${atom.from}\u001f${atom.action}\u001f${atom.to}`)
    if (atom.kind === "machine-template") machineTransitions += 1
  }
  if (
    authority.transitionAtoms.length !== authority.counts.transitionOccurrenceCount ||
    transitionKeys.size !== authority.counts.transitionUniqueCount ||
    machineTransitions !== authority.counts.machineTransitionOccurrenceCount ||
    authority.transitionAtoms.length - machineTransitions !== authority.counts.matrixTransitionOccurrenceCount
  ) fail("SCREEN_STATE_COUNTS", "authority transition counts differ")

  const bindingIds = new Set()
  for (let index = 0; index < authority.machineBindings.length; index += 1) {
    const binding = authority.machineBindings[index]
    exactKeys(binding, ["bindingId", "machineId", "routeScope", "variant", "sourceClauseIds"], "SCREEN_STATE_BINDING", "machine binding")
    if (
      binding.bindingId !== `SS-BIND-${String(index + 1).padStart(2, "0")}` ||
      bindingIds.has(binding.bindingId) || typeof binding.machineId !== "string" ||
      typeof binding.variant !== "string" || binding.variant.length === 0
    ) fail("SCREEN_STATE_BINDING", "machine binding identity differs")
    assertUniqueStrings(binding.routeScope, "SCREEN_STATE_BINDING", "machine binding route scope")
    assertUniqueStrings(binding.sourceClauseIds, "SCREEN_STATE_BINDING", "machine binding source clauses")
    if (
      binding.routeScope.some((routeId) => !SCREEN_STATE_ROUTE_ORDER.includes(routeId)) ||
      binding.sourceClauseIds.some((clauseId) => !clauseIds.has(clauseId))
    ) {
      fail("SCREEN_STATE_BINDING", "machine binding route closure differs")
    }
    bindingIds.add(binding.bindingId)
  }
  const expectedBindingOccurrences = []
  const routesFromMatrixAtom = (atom) => [...new Set([atom.from, atom.to]
    .map((value) => value.split(":", 1)[0])
    .filter((routeId) => SCREEN_STATE_ROUTE_ORDER.includes(routeId)))]
  for (const atom of authority.transitionAtoms) {
    const bindings = atom.kind === "machine-template"
      ? authority.machineBindings.filter((binding) => binding.machineId === atom.machineId)
      : [{
          bindingId: `SS-MATRIX-BIND-${atom.transitionAtomId.slice(-4)}`,
          routeScope: routesFromMatrixAtom(atom),
          variant: "route-matrix-explicit",
          sourceClauseIds: [atom.sourceClauseId]
        }]
    if (bindings.length === 0) fail("SCREEN_STATE_BINDING", "authority transition machine is unbound")
    for (const binding of bindings) {
      expectedBindingOccurrences.push({
        transitionBindingOccurrenceId: `SS-AUTH-TRANS-BIND-${String(expectedBindingOccurrences.length + 1).padStart(4, "0")}`,
        transitionAtomId: atom.transitionAtomId,
        bindingId: binding.bindingId,
        routeScope: binding.routeScope,
        variant: binding.variant,
        sourceClauseIds: [...new Set([atom.sourceClauseId, ...binding.sourceClauseIds])]
      })
    }
  }
  exactValue(
    authority.transitionBindingOccurrences,
    expectedBindingOccurrences,
    "SCREEN_STATE_BINDING",
    "transition binding occurrences"
  )
  if (
    authority.transitionBindingOccurrences.length !== authority.counts.transitionBindingOccurrenceCount ||
    new Set(authority.transitionBindingOccurrences.map((entry) =>
      `${entry.transitionAtomId}\u001f${entry.bindingId}\u001f${entry.routeScope.join("+")}`
    )).size !== authority.counts.transitionBindingUniqueCount
  ) fail("SCREEN_STATE_COUNTS", "transition binding counts differ")
  if (sha256Canonical(authority) !== SCREEN_STATE_AUTHORITY_EXPECTED.authoritySha256) {
    fail("SCREEN_STATE_AUTHORITY", "screen-state authority final root differs")
  }
  return authority
}

const FORBIDDEN_KEYS = new Set([
  "email", "phone", "address", "ipaddress", "participantid", "humanid",
  "learnerid", "candidateid", "applicantid", "studyid", "sessionid", "userid",
  "accountid", "deviceid", "deviceserial", "advertisingid", "admissionnumber",
  "preciselocation", "latitude", "longitude", "geocoordinates", "streetaddress",
  "homepath", "userpath", "username", "hostname", "machineid", "macaddress",
  "networkssid", "recording", "transcript", "rawnotes", "diagnosis",
  "decisionowner", "approvalartifact", "fabricatedagentapproval"
])

const STRUCTURED_BOUNDARY_VALUES = new Map([
  ["participantcount", 0],
  ["humanparticipantcount", 0],
  ["humansessioncount", 0],
  ["sessioncount", 0],
  ["participantevidence", "none"],
  ["humanparticipantevidence", "none"],
  ["humanevidence", "none"],
  ["nothumanusabilitytested", true],
  ["agentscountaspeople", false],
  ["productionauthorization", false],
  ["productionauthorized", false],
  ["releaseauthorized", false],
  ["designselected", false],
  ["artifactapproved", false],
  ["humanbehaviorevidence", false],
  ["realdeviceassistivetechnologyevidence", false],
  ["realdeviceatevidence", false]
])

const decodeNestedJson = (trimmed) => {
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try { return JSON.parse(trimmed) } catch { return null }
  }
  if (!/^[A-Za-z0-9+/_-]{16,}={0,2}$/u.test(trimmed)) return null
  const unpadded = trimmed.replace(/=+$/u, "")
  if (unpadded.length % 4 === 1) return null
  const standardUnpadded = unpadded.replace(/-/gu, "+").replace(/_/gu, "/")
  let bytes
  try {
    bytes = Buffer.from(`${standardUnpadded}${"=".repeat((4 - standardUnpadded.length % 4) % 4)}`, "base64")
  } catch {
    return null
  }
  const standardPadded = bytes.toString("base64")
  const canonicalForms = new Set([
    standardPadded,
    standardPadded.replace(/=+$/u, ""),
    standardPadded.replace(/\+/gu, "-").replace(/\//gu, "_"),
    standardPadded.replace(/\+/gu, "-").replace(/\//gu, "_").replace(/=+$/u, "")
  ])
  if (!canonicalForms.has(trimmed)) return null
  let decodedText
  try {
    decodedText = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    return null
  }
  if (!decodedText.startsWith("{") && !decodedText.startsWith("[")) return null
  try { return JSON.parse(decodedText) } catch { return null }
}

const validateSafeString = (
  value,
  label = "evidence string",
  { semanticClaims = true, decodeDepth = 0 } = {}
) => {
  if (value !== value.normalize("NFKC")) fail("STRING_NORMALIZATION", `${label} is not exact NFKC`)
  if (
    /[\p{Bidi_Control}\p{Default_Ignorable_Code_Point}\p{Cc}\p{Cf}]/u.test(value) ||
    /%(?:[0-9a-f]{2})|&#(?:x[0-9a-f]+|\d+);/iu.test(value)
  ) fail("STRING_CONTROL", `${label} contains a prohibited encoding or control`)
  if (/[^\x20-\x7e]/u.test(value)) fail("STRING_CHARACTER_SET", `${label} contains a non-ASCII evidence character`)
  if (SHA_64.test(value) || SHA_40.test(value)) return
  if (Object.values(AGENT_ID_BY_LANE).includes(value)) return

  if (
    /[\p{L}\p{N}._%+-]+\s*@\s*[\p{L}\p{N}.-]+(?:\.[\p{L}]{2,})?/u.test(value) ||
    /[\p{L}\p{N}._%+-]+\s*(?:\[at\]|\(at\)|\bat\b)\s*[\p{L}\p{N}-]+\s*(?:\[dot\]|\(dot\)|\bdot\b|\.)\s*[\p{L}]{2,}/iu.test(value)
  ) {
    fail("PII_EMAIL", `${label} contains prohibited contact data`)
  }
  if (/(?:\+1(?:[ ./_-]+|x)?)?\(?\d{3}\)?(?:[ ./_-]+|x)?\d{3}(?:[ ./_-]+|x)?\d{4}\b|\+\d{8,15}\b/iu.test(value)) {
    fail("PII_PHONE", `${label} contains prohibited contact data`)
  }
  for (const match of value.matchAll(/(?<!\d)(?:\d{1,4}\.){3}\d{1,4}(?!\d)/gu)) {
    if (match[0] !== "127.0.0.1") fail("PII_NETWORK", `${label} contains a non-loopback network address`)
  }
  if (/(?<![A-Z0-9])(?:0x[0-9a-f]{1,8}\.){3}0x[0-9a-f]{1,8}(?![A-Z0-9])/iu.test(value)) {
    fail("PII_NETWORK", `${label} contains a non-loopback network address`)
  }
  if (/(?<![A-Z0-9])0x[0-9a-f]{8}(?![A-Z0-9])/iu.test(value)) {
    fail("PII_NETWORK", `${label} contains a non-loopback network address`)
  }
  for (const match of value.matchAll(/\[?[0-9a-f]*:[0-9a-f:]+\]?/giu)) {
    const candidate = match[0].replace(/^\[/u, "").replace(/\]$/u, "")
    if (isIP(candidate) === 6 && candidate !== "::1") {
      fail("PII_NETWORK", `${label} contains a non-loopback network address`)
    }
  }
  if (
    /\bfile:(?:\/{2,3})?(?:[A-Za-z]:[\\/])?(?:[A-Za-z0-9._ -]+[\\/])*(?:home|users|profiles|root|documents and settings)(?:[\\/][^\\/\s]+)?/iu.test(value) ||
    /(?:^|[\s"'(])\/\/[^/\s]+\/(?:[^/\s]+\/)*(?:home|users|profiles|root|documents and settings)(?:\/[^/\s]+)?/iu.test(value) ||
    /(?:^|[\s"'(])\/(?:[A-Za-z0-9._-]+\/)*(?:home|users|profiles|root|documents and settings)(?:\/[^/\s]+)?/iu.test(value) ||
    /(?:^|[\s"'(])(?:home|root|users|profiles|documents and settings)[\\/][^\\/\s]+/iu.test(value) ||
    /(?:^|[\s"'(])[A-Za-z]:[\\/](?:home|users|profiles|documents and settings)[\\/][^\\/\s]+/iu.test(value) ||
    /(?:^|[\s"'(])\\\\[^\\\s]+\\(?:[^\\\s]+\\)*(?:home|users|profiles|root|documents and settings)\\[^\\\s]+/iu.test(value) ||
    /(?:^|[\s"'(])~[\\/]/u.test(value) ||
    /\b(?:user|profile)[ _-]?(?:path|directory)\s*(?::|=|\bis\b|\s)\s*[^\s]+/iu.test(value)
  ) {
    fail("PII_PATH", `${label} contains a prohibited user path`)
  }
  if (
    /\b(?:participant|human|learner|candidate|applicant|examinee|test[ -]?taker|personnel|study|session|user|account|device|advertising|admission)[ _-]?(?:id|identifier|number|no\.?|reference|ref\.?|code|key|token|handle|asset|inventory)\s*(?::|=|#|\bis\b|\s)\s*(?:[A-Z]{1,6}[- /]?)?[A-Z0-9][A-Z0-9._ /-]{1,}\b/iu.test(value) ||
    /\bexam\s+(?:candidate|examinee|test[ -]?taker)\s+(?:[A-Z]{1,6}[- /]?)?[A-Z0-9][A-Z0-9._ /-]{1,}\b/iu.test(value) ||
    /\b(?:CAND|APP)[_/-]?\d{3,}\b/iu.test(value)
  ) {
    fail("PII_IDENTIFIER", `${label} contains a prohibited personal identifier`)
  }
  if (
    /\b(?:lat(?:itude)?|lon(?:gitude)?|gps)\s*(?::|=|\s)\s*[+-]?\d{1,3}\.\d{4,}/iu.test(value) ||
    /(?<!\d)[+-]?\d{1,2}\.\d{4,}\s*(?:[NS]\s*)?(?:,|\/)?\s*[+-]?\d{1,3}\.\d{4,}\s*[EW]?(?!\d)/iu.test(value) ||
    /\b\d{1,2}\s*(?:deg|degrees|d|\xB0)\s*\d{1,2}\s*(?:min|minutes|'|m)\s*\d{1,2}(?:\.\d+)?\s*(?:sec|seconds|"|s)?\s*[NS]\b/iu.test(value)
  ) fail("PII_LOCATION", `${label} contains prohibited precise location data`)
  if (/\b\d{1,6}\s+[\p{L}][\p{L} .'-]{1,40}\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr)\b/iu.test(value)) {
    fail("PII_ADDRESS", `${label} contains a prohibited address`)
  }
  if (/\b(?:postal|zip)[ _-]*(?:code)?\s*(?::|=|\s)\s*\d{5}(?:-\d{4})?\b|(?<![A-Z0-9-])(?:[A-Z]{2}\s+)?\d{5}(?:-\d{4})?(?![A-Z0-9-])/iu.test(value)) {
    fail("PII_POSTAL", `${label} contains prohibited precise location data`)
  }
  if (
    /\b(?:host(?:name|[ _-]*id)?|computer[ _-]*(?:name|code)|device\s*(?:serial|identifier|id|s\/?n|code|asset|inventory)|machine[ _-]*(?:serial|identifier|id|name|code)|serial\s*(?:number|no\.?)?|service[ _-]*tag|asset[ _-]*(?:tag|number)|s\/?n|ssid)\s*(?::|=|#|\bis\b|\s)\s*[A-Z0-9][A-Z0-9._:-]{1,}\b/iu.test(value)
  ) {
    fail("PII_DEVICE", `${label} contains prohibited host or device data`)
  }
  if (!semanticClaims) return

  const prose = value.toLowerCase().replace(/[‐‑‒–—]/gu, "-").replace(/\s+/gu, " ").trim()
  const controlledNegativeClauses = new Set([
    "production blocked",
    "no human evidence",
    "zero participants",
    "not human-usability-tested",
    "no real-device at evidence"
  ])
  if (controlledNegativeClauses.has(prose)) return
  const compact = prose.replace(/\s+/gu, "")
  if (
    /^(?:publishable|launchable|deployable|shippable|greenlit|productionready|rolloutready|fullyaccessible)$/u.test(compact) ||
    /^(?:participants?|humans?|learners?|volunteers?|sessions?)(?:[:=_-]?)[1-9]\d*$/u.test(compact) ||
    /^(?:participantcount|humanparticipantcount|humansessioncount)(?:[:=_-])[1-9]\d*$/u.test(compact) ||
    /^(?:humanevidence|participantevidence)(?:[:=_-])(?!none$)[a-z0-9_-]+$/u.test(compact) ||
    /^(?:nvda|jaws|voiceover|talkback|orca|narrator|screenreader|real-?device)(?:[:=_-])(?:ok|passed|success|successful|worked|verified)$/u.test(compact)
  ) fail("PROHIBITED_CLAIM", `${label} contains a prohibited evidence or authority claim`)
  const lexical = prose.replace(/[^a-z0-9]+/gu, " ").trim()
  const words = new Set(lexical.split(" ").filter(Boolean))
  const hasAnyWord = (candidates) => candidates.some((candidate) => words.has(candidate))
  const hasPhrase = (candidate) => ` ${lexical} `.includes(` ${candidate} `)
  const unstructuredProse = /\s/u.test(value.trim())
  const prohibitedClaimDomain = hasAnyWord([
    "release", "released", "deployment", "deploy", "production", "publish", "publishing", "publishable",
    "publication", "distribution", "launch", "rollout", "shipping", "gate", "site", "platform",
    "participant", "participants", "human", "humans", "learner", "learners", "people", "person",
    "persons", "users", "user", "audience", "tester", "testers", "subject", "subjects", "study",
    "research", "trial", "population", "feedback", "behavior", "behaviour", "preference", "preferences",
    "persona", "personas", "screenreader", "voiceover", "nvda", "jaws", "talkback", "orca",
    "narrator", "braille", "wcag", "distributed", "distribute"
  ]) || hasPhrase("screen reader") || hasPhrase("voice over") || hasPhrase("assistive technology") ||
    hasPhrase("assistive tech") || hasPhrase("level aa") || hasPhrase("aa conformance") ||
    hasPhrase("at output") || hasPhrase("at checks") || hasPhrase("go live") || hasPhrase("go-live") ||
    hasPhrase("braille display")
  if (unstructuredProse && prohibitedClaimDomain) {
    fail("PROHIBITED_CLAIM", `${label} contains a prohibited evidence or authority claim`)
  }
  const releaseSubject = hasAnyWord([
    "production", "deployment", "release", "rollout", "site", "website",
    "candidate", "artifact", "product", "design", "direction", "prototype", "launch",
    "publication", "distribution", "platform", "build", "gate"
  ])
  const releaseAuthority = hasAnyWord([
    "authorization", "authorized", "approval", "approved", "accepted", "selected",
    "final", "done", "clearance", "cleared", "permitted", "allowed", "ready",
    "launchable", "launch", "live", "publish", "published", "ship", "shipping",
    "commence", "proceed", "forward", "positive", "passed", "blessing", "fit",
    "released", "suitable", "green", "begin"
  ]) || hasPhrase("green light") || hasPhrase("go ahead")
  if (
    (releaseSubject && releaseAuthority) ||
    (hasAnyWord(["launch", "publish", "rollout", "release"]) && hasAnyWord(["okay", "commence", "proceed", "suitable"])) ||
    (words.has("this") && words.has("can") && hasAnyWord(["released", "published", "launch"])) ||
    (hasAnyWord(["release", "deployment", "production"]) && hasAnyWord(["gate", "verdict", "decision"]) &&
      hasAnyWord(["passed", "positive", "permits", "allows", "cleared"]))
  ) fail("PROHIBITED_CLAIM", `${label} contains a prohibited evidence or authority claim`)

  const humanActor = hasAnyWord([
    "participant", "participants", "learner", "learners", "candidate", "candidates",
    "person", "persons", "people", "human", "humans", "volunteer", "volunteers",
    "user", "users", "cohort", "cohorts", "panel", "panels", "audience", "audiences",
    "subject", "subjects"
  ])
  const humanResult = hasAnyWord([
    "observed", "observation", "completed", "passed", "preferred", "favored", "favoured",
    "supported", "feedback", "outcome", "outcomes", "tested", "testing", "validated",
    "validation", "study", "studies", "research", "moderated", "approved", "accepted",
    "selected", "behavior", "behaviour", "preference", "preferences", "found",
    "input", "endorsed", "liked", "trial", "succeeded", "choices"
  ])
  const substitutionSubject = hasAnyWord([
    "automation", "automated", "synthetic", "simulated", "persona", "personas",
    "model", "models", "panel", "panels", "agent", "agents", "codex"
  ])
  const substitutionClaim = hasAnyWord([
    "equivalent", "equal", "same", "substitute", "substitutes", "replaces", "replace",
    "proxy", "represents", "represent", "represented", "predicts", "predict", "models", "modeled",
    "mirrors", "mirror", "stands", "stand", "captures", "capture"
  ])
  if (
    (humanActor && humanResult) || hasPhrase("user research") || hasPhrase("participant feedback") ||
    (humanActor && substitutionSubject && substitutionClaim)
  ) fail("PROHIBITED_CLAIM", `${label} contains a prohibited evidence or authority claim`)

  const assistiveTechnology = hasPhrase("screen reader") || words.has("screenreader") || hasPhrase("assistive technology") ||
    hasPhrase("assistive tech") || hasPhrase("emitted at") ||
    hasPhrase("at output") || hasAnyWord(["nvda", "jaws", "voiceover", "talkback"])
  const assistiveResult = hasAnyWord([
    "emitted", "output", "succeeded", "successful", "passed", "verified", "validated",
    "tested", "testing", "checks", "phone", "device", "observed", "worked", "mobile"
  ])
  const wcagClaim = (words.has("wcag") || hasPhrase("aa conformance")) && hasAnyWord([
    "aa", "compliance", "compliant", "conformance", "conforms", "conformant",
    "achieved", "established", "meets", "met", "passed", "certified"
  ])
  if ((assistiveTechnology && assistiveResult) || wcagClaim) {
    fail("PROHIBITED_CLAIM", `${label} contains a prohibited evidence or authority claim`)
  }
  const quantifiedPeople = /\b(?:[1-9]\d*|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\s+(?:real\s+)?(?:participants?|learners?|candidates?|persons?|people|humans?|volunteers?|sessions?)\b.{0,80}\b(?:completed|accepted|approved|selected|tested|validated|preferred|passed|observed)\b/iu
  const claimPatterns = [
    quantifiedPeople,
    /\b(?:human|learner|participant|candidate)\s+behavio(?:u)?r\s+(?:was\s+)?(?:observed|validated|verified|tested|confirmed)\b/iu,
    /\b(?:design|direction|artifact|prototype|system|plan\s*008|result)\s+(?:(?:is|was|has been|now)\s+)?(?:accepted|approved|selected|final|done)\b/iu,
    /\b(?:accepted|approved|selected|final|done)\s+(?:design|direction|artifact|prototype|system|plan\s*008|result)\b/iu,
    /\bplan\s*008\s+(?:is|was|has been)\s+(?:complete|completed|approved|accepted|final|done)\b/iu,
    /\b(?:release|deployment)\s+(?:is|was|has been)?\s*(?:authorized|approved|permitted|allowed|cleared|ready)\b/iu,
    /\bproduction\s+(?:use|deployment|release)?\s*(?:is|was|has been)?\s*(?:authorized|approved|permitted|allowed|cleared|ready)\b/iu,
    /\b(?:product|site|artifact|release|candidate)\s+(?:is|was|has been)\s+(?:approved|authorized|cleared|permitted|ready)(?:\s+for\s+production)?\b/iu,
    /\b(?:product|site|artifact|release)\s+has\s+(?:final\s+)?approval\b/iu,
    /\b(?:green\s+light|go[ -]?ahead|blessing|rollout[ -]?ready|gate\s+(?:has\s+)?passed|move\s+forward|proceed|ship)\b/iu,
    /\b(?:put|move|roll)\b.{0,30}\b(?:site|product|candidate|artifact|release)\b.{0,30}\b(?:into\s+production|out|forward)\b/iu,
    /\b(?:site|product|candidate|artifact|release|deployment)\b.{0,50}\b(?:green\s+light|go[ -]?ahead|blessing|rollout[ -]?ready|gate\s+(?:has\s+)?passed|proceed|move\s+forward|ship|production)\b/iu,
    /\bdeploy(?:ment)?\b.{0,50}\bproduction\b.{0,50}\b(?:permitted|allowed|authorized|approved|ready|cleared)\b/iu,
    /\bproduction\b.{0,50}\b(?:deployment|release)\b.{0,50}\b(?:permitted|allowed|authorized|approved|ready|cleared)\b/iu,
    /\b(?:release|site|product|artifact|candidate)\b.{0,30}\b(?:may|can|is|was)\b.{0,20}\b(?:go live|go-live|ship|launch)\b/iu,
    /\b(?:candidate|artifact|site|release)\b.{0,30}\bcleared\s+to\s+go\s+live\b/iu,
    /\b(?:real|physical)[ -]?(?:mobile[ -]?)?device\b.{0,50}\b(?:checks?|testing|tested|verified|passed|used|validated|succeeded|successful)\b/iu,
    /\b(?:checks?|testing|tested|verified|passed|used|validated|succeeded|successful)\b.{0,50}\b(?:real|physical)[ -]?(?:mobile[ -]?)?device\b/iu,
    /\b(?:screen reader|nvda|jaws|voiceover|talkback|assistive technology)\b.{0,50}\b(?:tested|verified|passed|used|observed|validated)\b/iu,
    /\b(?:screen[ -]?reader|nvda|jaws|voiceover|talkback|assistive[ -]?technology|emitted[ -]?at)\b.{0,80}\b(?:checks?|testing|succeeded|successful|passed|verified|validated|phone|device)\b/iu,
    /\b(?:checks?|testing|succeeded|successful|passed|verified|validated)\b.{0,80}\b(?:screen[ -]?reader|nvda|jaws|voiceover|talkback|assistive[ -]?technology|emitted[ -]?at|real[ -]?device)\b/iu,
    /\b(?:cohorts?|panels?|participants?|learners?|users?|persons?|people|humans?|volunteers?)\b.{0,100}\b(?:completed|passed|preferred|supported|approved|accepted|observed|tested|validated|selected|saw|found)\b/iu,
    /\b(?:completed|passed|preferred|supported|approved|accepted|observed|tested|validated|selected|saw|found)\b.{0,100}\b(?:cohorts?|panels?|participants?|learners?|users?|persons?|people|humans?|volunteers?)\b/iu,
    /\b(?:participant\s+feedback|participant\s+outcomes?|user\s+research|human\s+behavio(?:u)?r|usability\s+(?:study|studies|testing|validation)|moderated\s+(?:study|validation|testing))\b/iu,
    /\b(?:we|agents?|reviewers?|moderators?)\s+(?:have\s+)?(?:observed|saw)\b.{0,80}\b(?:persons?|people|humans?|participants?|learners?|users?)\b/iu,
    /\bob(?:served)?\s+users?\b.{0,80}\b(?:preferred|supported|selected|approved|accepted)\b/iu,
    /\bmoderated\s+(?:sessions?|validations?|testing|stud(?:y|ies))\b.{0,80}\b(?:found\s+)?no\s+blockers?\b/iu,
    /\b(?:personas?|simulations?|models?)\b.{0,60}\b(?:model|predict|represent|establish)\w*\b.{0,60}\b(?:learner|user|participant|human)\s+(?:preferences?|behavio(?:u)?r|outcomes?)\b/iu,
    /\b(?:automated|synthetic|simulated)\s+(?:panels?|cohorts?|personas?)\b.{0,60}\b(?:equivalent|equal|same|substitute|proxy)\b.{0,40}\b(?:users?|people|humans?|participants?)\b/iu,
    /\b(?:users?|people|humans?|participants?)\b.{0,40}\b(?:equivalent|equal|same|substitute|proxy)\b.{0,60}\b(?:automated|synthetic|simulated)\s+(?:panels?|cohorts?|personas?)\b/iu,
    /\b(?:agents?|codex|automation|personas?|simulations?)\b.{0,50}\b(?:substitut\w*|replac\w*|stand(?:s)? in|proxy)\b.{0,50}\b(?:people|humans|participants|learners|users|volunteers)\b/iu,
    /\b(?:wcag|accessibility)\b.{0,60}\b(?:meets?|met|certified|compliant|passed|fully accessible|conforms?)\b/iu,
    /\b(?:packet|site|artifact|product)\b.{0,60}\b(?:meets?|conforms?|passes?)\b.{0,40}\b(?:wcag|accessibility)\b/iu,
    /\b(?:learner|user|participant|human)\s+(?:preferences?|behavio(?:u)?r|outcomes?)\b.{0,60}\b(?:model(?:ed|led)?|predict(?:ed)?|represent(?:ed)?)\b.{0,40}\bpersonas?\b/iu,
    /\b(?:release|deployment|production)\s+gate\b.{0,40}\b(?:passed|cleared|open)\b/iu,
    /\bgo[ -]?live\b.{0,40}\b(?:site|product|release|candidate|artifact)\b/iu,
    /\bproduction\b.{0,40}\b(?:receive|take|accept)\b.{0,40}\b(?:site|product|release|candidate|artifact)\b/iu,
    /^\s*(?:accepted|approved|selected|final|done|production-authorized)\s*$/iu
  ]
  if (claimPatterns.some((pattern) => pattern.test(prose))) {
    fail("PROHIBITED_CLAIM", `${label} contains a prohibited evidence or authority claim`)
  }
  const decoded = decodeNestedJson(value.trim())
  if (isRecord(decoded) || Array.isArray(decoded)) {
    if (decodeDepth >= 4) fail("STRING_CONTROL", `${label} exceeds the decoded-map depth limit`)
    validateSafeTree(decoded, `${label} decoded map`, { decodeDepth: decodeDepth + 1 })
  }
}

const validateSafeTree = (value, label = "evidence", options = {}) => {
  if (typeof value === "string") { validateSafeString(value, label, options); return }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => validateSafeTree(entry, `${label}[${index}]`, options))
    return
  }
  if (!isRecord(value)) return
  for (const [index, [key, nested]] of Object.entries(value).entries()) {
    if (
      key !== key.normalize("NFKC") ||
      /[\p{Bidi_Control}\p{Default_Ignorable_Code_Point}\p{Cc}\p{Cf}]/u.test(key)
    ) fail("STRING_CONTROL", `${label} contains a prohibited object key`)
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/gu, "")
    if (STRUCTURED_BOUNDARY_VALUES.has(normalizedKey) && nested !== STRUCTURED_BOUNDARY_VALUES.get(normalizedKey)) {
      fail("PROHIBITED_CLAIM", `${label} contains a prohibited structured evidence or authority claim`)
    }
    if (FORBIDDEN_KEYS.has(normalizedKey)) fail("PII_KEY", `${label} contains a prohibited object key`)
    validateSafeString(key, `${label} object key[${index}]`, options)
    validateSafeTree(nested, `${label}.field[${index}]`, options)
  }
}

const decodeImplementationLiteralContent = (content) => {
  let decoded = ""
  for (let index = 0; index < content.length; index += 1) {
    if (content[index] !== "\\") { decoded += content[index]; continue }
    const next = content[index + 1]
    if (next === undefined) { decoded += "\\"; continue }
    if (next === "\\") { decoded += "\\"; index += 1; continue }
    if (next === "u" && content[index + 2] === "{") {
      const end = content.indexOf("}", index + 3)
      const digits = end < 0 ? "" : content.slice(index + 3, end)
      if (/^[0-9a-f]{1,6}$/iu.test(digits) && Number.parseInt(digits, 16) <= 0x10ffff) {
        decoded += String.fromCodePoint(Number.parseInt(digits, 16)); index = end; continue
      }
    }
    if (next === "u" && /^[0-9a-f]{4}$/iu.test(content.slice(index + 2, index + 6))) {
      decoded += String.fromCharCode(Number.parseInt(content.slice(index + 2, index + 6), 16)); index += 5; continue
    }
    if (next === "x" && /^[0-9a-f]{2}$/iu.test(content.slice(index + 2, index + 4))) {
      decoded += String.fromCharCode(Number.parseInt(content.slice(index + 2, index + 4), 16)); index += 3; continue
    }
    const simpleEscapes = { b: "\b", f: "\f", n: "\n", r: "\r", t: "\t", v: "\v", 0: "\0" }
    decoded += Object.hasOwn(simpleEscapes, next) ? simpleEscapes[next] : next
    index += 1
  }
  return decoded
}

const validateImplementationSourceLine = (line, label) => {
  validateSafeString(line, label, { semanticClaims: false })
  const literalPattern = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/gu
  const literals = [...line.matchAll(literalPattern)]
  for (let index = 0; index < literals.length; index += 1) {
    const raw = literals[index][0]
    const decoded = decodeImplementationLiteralContent(raw.slice(1, -1))
    validateSafeString(decoded, `${label} literal[${index}]`)
  }
  const withoutLiterals = line.replace(literalPattern, "")
  const lineComment = withoutLiterals.indexOf("//")
  if (lineComment >= 0) {
    validateSafeString(
      decodeImplementationLiteralContent(withoutLiterals.slice(lineComment + 2)),
      `${label} comment`
    )
  }
  const blockComment = withoutLiterals.match(/\/\*([\s\S]*?)\*\//u)
  if (blockComment !== null) {
    validateSafeString(decodeImplementationLiteralContent(blockComment[1]), `${label} block comment`)
  }
}

const validateImplementationSource = (bytes, label = "implementation source") => {
  const lines = bytes.split(/\r?\n/u)
  lines.forEach((line, index) => {
    if (line.length > 0) validateImplementationSourceLine(line, `${label} line ${index + 1}`)
  })
  const multilineSurfaces = [
    { kind: "block comment", pattern: /\/\*([\s\S]*?)\*\//gu },
    { kind: "template literal", pattern: /`((?:\\[\s\S]|[^`\\])*)`/gu }
  ]
  for (const { kind, pattern } of multilineSurfaces) {
    let index = 0
    for (const match of bytes.matchAll(pattern)) {
      validateSafeString(
        decodeImplementationLiteralContent(match[1]).replace(/\r?\n/gu, " "),
        `${label} ${kind}[${index}]`
      )
      index += 1
    }
  }
}

const accessibilityCapabilities = new Set([
  "semantic-html", "keyboard-only", "focus-and-status-markup",
  "320-and-1440-css-pixel-reflow", "forced-colors", "reduced-motion",
  "print-and-large-print-transformation", "nonvisual-operability", "cognitive-load"
])
const trustCapabilities = new Set([
  "visual-and-nonvisual-answer-boundary", "precommit-answer-safety", "zero-external-requests"
])
const accessibilityCategories = new Set(["accessibility", "keyboard", "responsive"])

const PROVIDER_RULES = Object.freeze({
  defaultByRequirementKind: {
    "authority-route": { providerKind: "automated-result-manifest", providerId: "browser-matrix" },
    "authority-state": { providerKind: "automated-result-manifest", providerId: "browser-matrix" },
    "authority-route-transition-surface": { providerKind: "automated-result-manifest", providerId: "browser-matrix" },
    "authority-route-accessibility": { providerKind: "automated-result-manifest", providerId: "browser-matrix" },
    "authority-transition": { providerKind: "automated-result-manifest", providerId: "browser-matrix" },
    "journey-state": { providerKind: "automated-result-manifest", providerId: "browser-matrix" },
    "journey-transition": { providerKind: "automated-result-manifest", providerId: "browser-matrix" },
    interruption: { providerKind: "automated-result-manifest", providerId: "browser-matrix" },
    capability: { providerKind: "automated-result-manifest", providerId: "browser-matrix" },
    category: { providerKind: "codex-first-pass-artifact", providerId: "owner-lane" }
  },
  capabilityOverrides: {
    "precommit-answer-safety": {
      providerKind: "automated-result-manifest",
      providerId: "repository-verify"
    }
  }
})

const ownerLaneForRequirement = (kind, targetId) => {
  if (kind === "authority-route-accessibility") return "accessibility-cognitive-load"
  if ([
    "authority-route", "authority-state", "authority-route-transition-surface", "authority-transition",
    "journey-state", "journey-transition", "interruption"
  ].includes(kind)) return "journey-recovery-semantics"
  if (kind === "capability") {
    if (accessibilityCapabilities.has(targetId)) return "accessibility-cognitive-load"
    if (trustCapabilities.has(targetId)) return "consumer-trust-internal-wording-ai-slop"
    return "journey-recovery-semantics"
  }
  if (accessibilityCategories.has(targetId)) return "accessibility-cognitive-load"
  if (targetId === "answer-boundary") return "consumer-trust-internal-wording-ai-slop"
  return "journey-recovery-semantics"
}

const providerForRequirement = (kind, targetId, ownerLaneId) => {
  const provider = kind === "capability" && Object.hasOwn(PROVIDER_RULES.capabilityOverrides, targetId)
    ? PROVIDER_RULES.capabilityOverrides[targetId]
    : PROVIDER_RULES.defaultByRequirementKind[kind]
  if (provider === undefined) fail("JOURNEY_PROVIDER", "requirement provider rule is missing")
  return {
    providerKind: provider.providerKind,
    providerId: provider.providerId === "owner-lane" ? ownerLaneId : provider.providerId
  }
}

const deriveRequirementRows = (plan) => {
  const rows = []
  let ordinal = 0
  const push = ({
    requirementKind,
    targetId,
    journeyId,
    authorityAtomId,
    authorityClauseIds,
    authorityBindingIds = [],
    authorityRouteScopes = [],
    sourcePath,
    sourceBlobSha,
    authorityPath: explicitAuthorityPath,
    authorityBlobSha: explicitAuthorityBlobSha
  }) => {
    const padded = String(++ordinal).padStart(4, "0")
    const ownerLaneId = ownerLaneForRequirement(requirementKind, targetId)
    rows.push({
      requirementId: `P008-REQ-${padded}`,
      sourceClauseId: `P008-REQ-${padded}`,
      assertionContractId: `P008-AST-${padded}`,
      coverageCellId: `P008-CELL-${padded}`,
      journeyId,
      requirementKind,
      targetId,
      authorityAtomId,
      authorityClauseIds,
      authorityBindingIds,
      authorityRouteScopes,
      applicable: true,
      ownerLaneId,
      ...providerForRequirement(requirementKind, targetId, ownerLaneId),
      sourcePath,
      sourceBlobSha,
      authorityPath: explicitAuthorityPath ?? sourcePath,
      authorityBlobSha: explicitAuthorityBlobSha ?? sourceBlobSha
    })
  }
  for (let index = 0; index < plan.screenStateAuthority.routeOrder.length; index += 1) {
    const routeId = plan.screenStateAuthority.routeOrder[index]
    const routeBinding = plan.screenStateAuthority.routeBindings[index]
    push({
      requirementKind: "authority-route",
      targetId: routeId,
      journeyId: "AUTHORITY",
      authorityAtomId: routeBinding.routeBindingId,
      authorityClauseIds: routeBinding.sourceClauseIds,
      authorityBindingIds: [routeBinding.routeBindingId],
      authorityRouteScopes: [[routeId]],
      sourcePath: SCREEN_STATE_AUTHORITY_EXPECTED.sourcePath,
      sourceBlobSha: SCREEN_STATE_AUTHORITY_EXPECTED.sourceGitBlobSha
    })
  }
  for (const atom of plan.screenStateAuthority.stateAtoms) {
    push({
      requirementKind: "authority-state",
      targetId: atom.stateAtomId,
      journeyId: "AUTHORITY",
      authorityAtomId: atom.stateAtomId,
      authorityClauseIds: atom.sourceClauseIds,
      authorityBindingIds: [atom.stateAtomId],
      authorityRouteScopes: [atom.routeScope],
      sourcePath: SCREEN_STATE_AUTHORITY_EXPECTED.sourcePath,
      sourceBlobSha: SCREEN_STATE_AUTHORITY_EXPECTED.sourceGitBlobSha
    })
  }
  for (let index = 0; index < plan.screenStateAuthority.routeBindings.length; index += 1) {
    const binding = plan.screenStateAuthority.routeBindings[index]
    const surfaceId = `SS-AUTH-ROUTE-TRANSITION-${String(index + 1).padStart(4, "0")}`
    push({
      requirementKind: "authority-route-transition-surface",
      targetId: binding.routeId,
      journeyId: "AUTHORITY",
      authorityAtomId: surfaceId,
      authorityClauseIds: binding.sourceClauseIds,
      authorityBindingIds: [surfaceId],
      authorityRouteScopes: [[binding.routeId]],
      sourcePath: SCREEN_STATE_AUTHORITY_EXPECTED.sourcePath,
      sourceBlobSha: SCREEN_STATE_AUTHORITY_EXPECTED.sourceGitBlobSha
    })
  }
  for (const atom of plan.screenStateAuthority.transitionAtoms) {
    const bindingOccurrences = plan.screenStateAuthority.transitionBindingOccurrences
      .filter((binding) => binding.transitionAtomId === atom.transitionAtomId)
    push({
      requirementKind: "authority-transition",
      targetId: atom.transitionAtomId,
      journeyId: "AUTHORITY",
      authorityAtomId: atom.transitionAtomId,
      authorityClauseIds: [atom.sourceClauseId],
      authorityBindingIds: bindingOccurrences.map((binding) => binding.transitionBindingOccurrenceId),
      authorityRouteScopes: bindingOccurrences.map((binding) => binding.routeScope),
      sourcePath: SCREEN_STATE_AUTHORITY_EXPECTED.sourcePath,
      sourceBlobSha: SCREEN_STATE_AUTHORITY_EXPECTED.sourceGitBlobSha
    })
  }
  const accessibilityClauseById = new Map(
    plan.accessibilitySurface.sourceClauses.map((clause) => [clause.clauseId, clause])
  )
  for (let routeIndex = 0; routeIndex < plan.screenStateAuthority.routeOrder.length; routeIndex += 1) {
    const routeId = plan.screenStateAuthority.routeOrder[routeIndex]
    const routeBinding = plan.screenStateAuthority.routeBindings[routeIndex]
    const stateBindings = plan.screenStateAuthority.stateAtoms.filter((atom) => atom.routeScope.includes(routeId))
    const transitionBindings = plan.screenStateAuthority.transitionBindingOccurrences
      .filter((binding) => binding.routeScope.includes(routeId))
    if (stateBindings.length === 0 || transitionBindings.length === 0) {
      fail("ACCESSIBILITY_ROUTE_SURFACE", "canonical route has no complete state and transition surface")
    }
    const fullBindingIds = [
      routeBinding.routeBindingId,
      ...stateBindings.map((atom) => atom.stateAtomId),
      ...transitionBindings.map((binding) => binding.transitionBindingOccurrenceId)
    ]
    const fullRouteScopes = [
      [routeId],
      ...stateBindings.map((atom) => atom.routeScope),
      ...transitionBindings.map((binding) => binding.routeScope)
    ]
    const screenClauseIds = [...new Set([
      ...routeBinding.sourceClauseIds,
      ...stateBindings.flatMap((atom) => atom.sourceClauseIds),
      ...transitionBindings.flatMap((binding) => binding.sourceClauseIds)
    ])]
    for (let dimensionIndex = 0; dimensionIndex < plan.accessibilitySurface.dimensions.length; dimensionIndex += 1) {
      const dimension = plan.accessibilitySurface.dimensions[dimensionIndex]
      const primaryClause = accessibilityClauseById.get(dimension.sourceClauseIds[0])
      if (primaryClause === undefined) fail("ACCESSIBILITY_DIMENSION", "accessibility dimension source is missing")
      push({
        requirementKind: "authority-route-accessibility",
        targetId: `${routeId}:${dimension.dimensionId}`,
        journeyId: "AUTHORITY",
        authorityAtomId: `P008-A11Y-ROUTE-${String(routeIndex + 1).padStart(4, "0")}-DIM-${String(dimensionIndex + 1).padStart(2, "0")}`,
        authorityClauseIds: [...new Set([...screenClauseIds, ...dimension.sourceClauseIds])],
        authorityBindingIds: fullBindingIds,
        authorityRouteScopes: fullRouteScopes,
        sourcePath: primaryClause.sourcePath,
        sourceBlobSha: primaryClause.sourceBlobSha,
        authorityPath: SCREEN_STATE_AUTHORITY_EXPECTED.sourcePath,
        authorityBlobSha: SCREEN_STATE_AUTHORITY_EXPECTED.sourceGitBlobSha
      })
    }
  }
  for (const [kind, field] of [["journey-state", "stateIds"], ["journey-transition", "transitionIds"]]) {
    for (const journey of plan.journeys) {
      for (let index = 0; index < journey[field].length; index += 1) {
        const authorityAtomId = `P008-LENS-${journey.journeyId}-${kind === "journey-state" ? "STATE" : "TRANSITION"}-${String(index + 1).padStart(3, "0")}`
        push({
          requirementKind: kind,
          targetId: journey[field][index],
          journeyId: journey.journeyId,
          authorityAtomId,
          authorityClauseIds: [`P008-LENS-${journey.journeyId}`],
          authorityBindingIds: [authorityAtomId],
          authorityRouteScopes: [journey.routeIds],
          sourcePath: paths.canonicalPlan,
          sourceBlobSha: EXPECTED_SOURCE_COORDINATES.canonicalPlan.gitBlobSha
        })
      }
    }
  }
  for (const [requirementKind, field] of [
    ["interruption", "interruptionKinds"],
    ["capability", "capabilities"],
    ["category", "categories"]
  ]) {
    for (const journey of plan.journeys) {
      for (let index = 0; index < plan[field].length; index += 1) {
        const authorityAtomId = `P008-AXIS-${journey.journeyId}-${requirementKind.toUpperCase()}-${String(index + 1).padStart(2, "0")}`
        push({
          requirementKind,
          targetId: plan[field][index],
          journeyId: journey.journeyId,
          authorityAtomId,
          authorityClauseIds: [`P008-COV-${requirementKind.toUpperCase()}`],
          authorityBindingIds: [authorityAtomId],
          authorityRouteScopes: [journey.routeIds],
          sourcePath: paths.canonicalPlan,
          sourceBlobSha: EXPECTED_SOURCE_COORDINATES.canonicalPlan.gitBlobSha
        })
      }
    }
  }
  return rows
}

const assertUniqueStrings = (value, code, label, allowEmpty = false) => {
  if (
    !Array.isArray(value) || (!allowEmpty && value.length === 0) ||
    value.some((entry) => typeof entry !== "string" || entry.length === 0) ||
    new Set(value).size !== value.length
  ) fail(code, `${label} must be a ${allowEmpty ? "possibly empty " : "nonempty "}unique string array`)
}

const REQUIRED_TRANSITIONS = Object.freeze([
  "question-player:selected->question-player:selected(same-choice-idempotent)",
  "question-player:selected->question-player:selected(change)",
  "question-player:selected->question-player:ready(clear)",
  "question-player:answered-revealed->question-player:answered-revealed(flag)",
  "question-player:answered-revealed->question-player:answered-revealed(unflag)",
  "question-player:reviewed->question-player:restoring(next)",
  "hazard-player:marking->hazard-player:ready(clear)",
  "hazard-player:committing(zero-from-ready)->hazard-player:ready+recoverable-error",
  "hazard-player:committing(zero-from-marking)->hazard-player:marking+recoverable-error",
  "hazard-player:reviewed->hazard-player:restoring(next)",
  "review-player:question-selected->review-player:question-ready(clear)",
  "review-player:hazard-marking->review-player:hazard-ready(clear)",
  "review-player:hazard-committing(zero-from-ready)->review-player:hazard-ready+recoverable-error",
  "review-player:hazard-committing(zero-from-marking)->review-player:hazard-marking+recoverable-error",
  "print-preview:stale->print-center:generating(regenerate)",
  "print-preview:stale->print-preview:stale(retain-versioned-preview)",
  "offline-packs:downloading(new-version)+active(old-version-retained)->offline-packs:verifying(new-version)+active(old-version-retained)",
  "offline-packs:verifying(new-version)+active(old-version-retained)->offline-packs:staged(new-version)+active(old-version-retained)",
  "offline-packs:staged(new-version)+active(old-version-retained)->offline-packs:activating(new-version)+active(old-version-retained)",
  "offline-packs:activating(new-version)+active(old-version-retained)->offline-packs:active(new-version)",
  "offline-packs:downloading(new-version)+active(old-version-retained)->offline-packs:active(old-version-retained)+recoverable-error",
  "offline-packs:verifying(new-version)+active(old-version-retained)->offline-packs:quarantined(update)+active(old-version-retained)",
  "offline-packs:activating(new-version)+active(old-version-retained)->offline-packs:active(old-version-retained)+recoverable-error",
  "settings:import-reconciling->settings:import-recoverable-error",
  "settings:reset-reconciling->settings:reset-recoverable-error",
  "settings:rebuild-reconciling->settings:rebuild-recoverable-error"
])

const validatePlanJourneyContract = (plan, screenStatesRaw, accessibilitySourceRawByPath) => {
  exactKeys(plan, [
    "version", "journeyOrder", "interruptionKinds", "capabilities", "categories",
    "applicability", "providerRules", "sourceClauseIdTemplate", "assertionIdTemplate",
    "accessibilitySurface", "journeys", "screenStateAuthority"
  ], "JOURNEY_CONTRACT", "canonical journey contract")
  if (
    plan.version !== PLAN_JOURNEY_SUMMARY.version ||
    plan.applicability !== "all-required" ||
    plan.sourceClauseIdTemplate !== PLAN_JOURNEY_SUMMARY.sourceClauseIdTemplate ||
    plan.assertionIdTemplate !== PLAN_JOURNEY_SUMMARY.assertionIdTemplate
  ) fail("JOURNEY_CONTRACT", "canonical journey contract identity differs")
  exactValue(plan.journeyOrder, JOURNEY_IDS, "JOURNEY_CONTRACT", "journey order")
  exactValue(plan.providerRules, PROVIDER_RULES, "JOURNEY_PROVIDER", "journey provider rules")
  validateScreenStateAuthority(plan.screenStateAuthority, screenStatesRaw)
  validateAccessibilitySurface(plan.accessibilitySurface, accessibilitySourceRawByPath)
  assertUniqueStrings(plan.interruptionKinds, "JOURNEY_CONTRACT", "interruption kinds")
  assertUniqueStrings(plan.capabilities, "JOURNEY_CONTRACT", "capabilities")
  assertUniqueStrings(plan.categories, "JOURNEY_CONTRACT", "categories")
  if (plan.interruptionKinds.length !== 16 || plan.capabilities.length !== 12 || plan.categories.length !== 7) {
    fail("JOURNEY_CONTRACT", "journey Cartesian axis cardinality differs")
  }
  if (!Array.isArray(plan.journeys) || plan.journeys.length !== JOURNEY_IDS.length) {
    fail("JOURNEY_CONTRACT", "journey rows differ")
  }
  const transitionSet = new Set()
  let states = 0
  let transitions = 0
  for (let index = 0; index < plan.journeys.length; index += 1) {
    const row = plan.journeys[index]
    exactKeys(row, ["journeyId", "routeIds", "stateIds", "transitionIds"], "JOURNEY_CONTRACT", "journey row")
    if (row.journeyId !== JOURNEY_IDS[index]) fail("JOURNEY_CONTRACT", "journey row order differs")
    for (const field of ["routeIds", "stateIds", "transitionIds"]) {
      assertUniqueStrings(row[field], "JOURNEY_CONTRACT", `journey ${field}`)
    }
    if (row.routeIds.some((routeId) => !SCREEN_STATE_ROUTE_ORDER.includes(routeId))) {
      fail("JOURNEY_ROUTE_CLOSURE", "journey lens cites a route outside canonical authority")
    }
    states += row.stateIds.length
    transitions += row.transitionIds.length
    row.transitionIds.forEach((target) => transitionSet.add(target))
  }
  for (const transition of REQUIRED_TRANSITIONS) {
    if (!transitionSet.has(transition)) fail("JOURNEY_RECOVERY_EDGE", "a mandatory recovery edge is absent")
  }
  const rows = deriveRequirementRows(plan)
  const counts = {
    canonicalRoutes: plan.screenStateAuthority.routeOrder.length,
    authorityStates: plan.screenStateAuthority.stateAtoms.length,
    routeTransitionSurfaces: plan.screenStateAuthority.routeBindings.length,
    routeAccessibilitySurfaces: plan.screenStateAuthority.routeOrder.length * plan.accessibilitySurface.dimensions.length,
    authorityTransitions: plan.screenStateAuthority.transitionAtoms.length,
    authorityTransitionBindingOccurrences: plan.screenStateAuthority.transitionBindingOccurrences.length,
    lensStates: states,
    lensTransitions: transitions,
    interruption: plan.journeys.length * plan.interruptionKinds.length,
    capability: plan.journeys.length * plan.capabilities.length,
    category: plan.journeys.length * plan.categories.length
  }
  if (
    counts.canonicalRoutes !== PLAN_JOURNEY_SUMMARY.canonicalRouteRowCount ||
    counts.authorityStates !== PLAN_JOURNEY_SUMMARY.authorityStateRowCount ||
    counts.routeTransitionSurfaces !== PLAN_JOURNEY_SUMMARY.routeTransitionSurfaceRowCount ||
    counts.routeAccessibilitySurfaces !== PLAN_JOURNEY_SUMMARY.routeAccessibilitySurfaceRowCount ||
    counts.authorityTransitions !== PLAN_JOURNEY_SUMMARY.authorityTransitionRowCount ||
    counts.authorityTransitionBindingOccurrences !== PLAN_JOURNEY_SUMMARY.authorityTransitionBindingOccurrenceCount ||
    counts.lensStates !== PLAN_JOURNEY_SUMMARY.lensStateRowCount ||
    new Set(plan.journeys.flatMap((journey) => journey.stateIds)).size !== PLAN_JOURNEY_SUMMARY.lensStateUniqueCount ||
    counts.lensTransitions !== PLAN_JOURNEY_SUMMARY.lensTransitionRowCount ||
    transitionSet.size !== PLAN_JOURNEY_SUMMARY.lensTransitionUniqueCount ||
    counts.interruption !== PLAN_JOURNEY_SUMMARY.interruptionRowCount ||
    counts.capability !== PLAN_JOURNEY_SUMMARY.capabilityRowCount ||
    counts.category !== PLAN_JOURNEY_SUMMARY.categoryRowCount ||
    rows.length !== PLAN_JOURNEY_SUMMARY.requirementCount ||
    sha256Canonical(rows) !== PLAN_JOURNEY_SUMMARY.requirementRowsSha256 ||
    sha256Canonical(rows.map(({ requirementId }) => requirementId)) !== PLAN_JOURNEY_SUMMARY.requirementIdsSha256 ||
    sha256Canonical(rows.map(({ requirementId, applicable }) => [requirementId, applicable])) !== PLAN_JOURNEY_SUMMARY.applicabilityRowsSha256 ||
    sha256Canonical(rows.map(({ requirementId, ownerLaneId }) => [requirementId, ownerLaneId])) !== PLAN_JOURNEY_SUMMARY.ownerRowsSha256 ||
    sha256Canonical(rows.map(({ requirementId, providerKind, providerId }) => [requirementId, providerKind, providerId])) !== PLAN_JOURNEY_SUMMARY.providerRowsSha256
  ) fail("JOURNEY_REQUIREMENT_ROOT", "derived requirement rows differ from exact bound roots")
  return rows
}

const BASELINE_RECORD_KEYS = Object.freeze([
  "evidenceId", "kind", "status", "claimScope", "sourceSha", "recordedAt",
  "command", "reviewMode", "participantCount", "participantEvidence", "humanEvidence",
  "humanParticipantCount", "humanSessionCount", "notHumanUsabilityTested", "agentsCountAsPeople",
  "substitutionForPeople", "coverageCategories", "environment", "runResult",
  "runResultSha256", "resultSummary", "limitations"
])

const validateBaselineEvidence = (records) => {
  if (!Array.isArray(records) || records.length !== 2) fail("BASELINE_INTEGRITY", "baseline record set differs")
  const digests = []
  for (let index = 0; index < records.length; index += 1) {
    const record = records[index]
    exactKeys(record, BASELINE_RECORD_KEYS, "BASELINE_INTEGRITY", "baseline record")
    const id = BASELINE_RECORD_IDS[index]
    if (
      record.evidenceId !== id || record.kind !== "non-participant-automation" ||
      record.status !== "passed" || record.claimScope !== "current-site-baseline-only" ||
      record.sourceSha !== EXPECTED_SOURCE_COORDINATES.preparedAgainstOriginMainSha ||
      record.reviewMode !== "codex-only" ||
      record.participantCount !== 0 || record.participantEvidence !== "none" ||
      record.humanEvidence !== "none" || record.humanParticipantCount !== 0 || record.humanSessionCount !== 0 ||
      record.notHumanUsabilityTested !== true || record.agentsCountAsPeople !== false ||
      record.substitutionForPeople !== false || !Array.isArray(record.limitations) ||
      record.limitations.length === 0 || typeof record.resultSummary !== "string" ||
      record.resultSummary.length === 0
    ) fail("BASELINE_INTEGRITY", "baseline permanent fields differ")
    validateRecordMetadata(record.runResult, "BASELINE_INTEGRITY", "baseline run result")
    if (
      sha256Canonical(record.runResult) !== BASELINE_RUN_RESULT_HASHES[id] ||
      record.runResultSha256 !== BASELINE_RUN_RESULT_HASHES[id]
    ) fail("BASELINE_INTEGRITY", "baseline structured result differs")
    const digest = sha256Canonical(record)
    if (digest !== BASELINE_RECORD_HASHES[id]) fail("BASELINE_INTEGRITY", "baseline exact record digest differs")
    digests.push(digest)
  }
  if (sha256Canonical(records) !== BASELINE_SEQUENCE_SHA256) {
    fail("BASELINE_INTEGRITY", "baseline sequence digest differs")
  }
}

const contractRootProjection = (contract) => Object.fromEntries(
  Object.entries(contract).filter(([key]) => key !== "contractRootSha256")
)

const validatePrivateSchemas = (schemas) => {
  exactValue(schemas, PRIVATE_SCHEMAS, "PRIVATE_SCHEMA_CONTRACT", "private schema contracts")
  for (const [name, schema] of Object.entries(schemas)) {
    exactKeys(schema, ["storage", "requiredFields", "prohibitedFields"], "PRIVATE_SCHEMA_CONTRACT", name)
    assertUniqueStrings(schema.requiredFields, "PRIVATE_SCHEMA_CONTRACT", `${name} required fields`)
    assertUniqueStrings(schema.prohibitedFields, "PRIVATE_SCHEMA_CONTRACT", `${name} prohibited fields`)
    if (schema.requiredFields.some((field) => schema.prohibitedFields.includes(field))) {
      fail("PRIVATE_SCHEMA_CONTRACT", `${name} required and prohibited fields overlap`)
    }
  }
}

const CONTRACT_ROOT_KEYS = Object.freeze([
  "$schema", "schemaVersion", "packetId",
  ...Object.keys(PERMANENT_METADATA),
  "sourceCoordinates", "classification", "codexOnlyBoundary", "dependencyInterface",
  "canonicalSemanticClauses", "journeyContract", "laneContracts",
  "privateSchemaContracts", "evidenceBundleContract", "claimAndPiiContract",
  "contractRootSha256", "pendingFixture", "baselineEvidenceContract", "validatorContract"
])

const validateContract = (contract, requirementRows, selfTestManifest = null, validatorRaw = null) => {
  exactKeys(contract, CONTRACT_ROOT_KEYS, "CONTRACT_KEYS", "contract root")
  if (
    contract.$schema !== "https://json-schema.org/draft/2020-12/schema" ||
    contract.schemaVersion !== 3 ||
    contract.packetId !== "plan-008-codex-only-integrated-validation-prework-v2"
  ) fail("CONTRACT_ID", "contract identity differs")
  for (const [key, expected] of Object.entries(PERMANENT_METADATA)) {
    if (contract[key] !== expected) fail("PERMANENT_BOUNDARY", `contract ${key} differs`)
  }
  exactValue(contract.sourceCoordinates, EXPECTED_SOURCE_COORDINATES, "SOURCE_COORDINATES", "source coordinates")
  exactValue(contract.classification, EXPECTED_CLASSIFICATION, "CLASSIFICATION", "classification")
  exactValue(contract.codexOnlyBoundary, EXPECTED_BOUNDARY, "CODEX_ONLY_BOUNDARY", "CODEX-only boundary")
  exactValue(contract.dependencyInterface, EXPECTED_DEPENDENCIES, "DEPENDENCY_CONTRACT", "dependency interface")
  exactValue(contract.canonicalSemanticClauses, {
    canonicalPlan: PLAN_CLAUSES,
    planIndex: README_CLAUSES
  }, "CANONICAL_CLAUSE", "canonical semantic clauses")
  exactValue(contract.journeyContract, PLAN_JOURNEY_SUMMARY, "JOURNEY_CONTRACT", "journey contract summary")
  exactValue(contract.laneContracts, LANE_CONTRACTS, "LANE_CONTRACT", "lane contracts")
  validatePrivateSchemas(contract.privateSchemaContracts)
  exactValue(contract.evidenceBundleContract, EVIDENCE_BUNDLE_CONTRACT, "EVIDENCE_BUNDLE_CONTRACT", "evidence bundle contract")
  exactValue(contract.claimAndPiiContract, CLAIM_POLICY, "CLAIM_POLICY", "claim and PII contract")
  if (contract.contractRootSha256 !== sha256Canonical(contractRootProjection(contract))) {
    fail("CONTRACT_ROOT", "contract root digest differs")
  }
  if (requirementRows.length !== contract.journeyContract.requirementCount) {
    fail("JOURNEY_CONTRACT", "contract and canonical requirement counts differ")
  }

  const pendingKeys = [
    ...Object.keys(PERMANENT_METADATA), "agentOnlyReleaseRecommendation", "baselineEvidence",
    "executionManifests", "taskReceipts", "firstPassReceipts", "environmentObservations",
    "automatedRuns", "assertions", "coverageCells", "findings", "agentRuns",
    "dissentPositions", "dissentGroups", "dissentMatrix", "consensus", "finalEvidenceRoots"
  ]
  exactKeys(contract.pendingFixture, pendingKeys, "PENDING_FIXTURE", "pending fixture")
  for (const [key, expected] of Object.entries(PERMANENT_METADATA)) {
    if (contract.pendingFixture[key] !== expected) fail("PERMANENT_BOUNDARY", `pending fixture ${key} differs`)
  }
  if (contract.pendingFixture.agentOnlyReleaseRecommendation !== null) {
    fail("PENDING_FIXTURE", "pending fixture recommendation must remain null")
  }
  for (const key of [
    "executionManifests", "taskReceipts", "firstPassReceipts", "environmentObservations",
    "automatedRuns", "assertions", "coverageCells", "findings", "agentRuns",
    "dissentPositions", "dissentGroups", "dissentMatrix", "consensus", "finalEvidenceRoots"
  ]) {
    if (!Array.isArray(contract.pendingFixture[key]) || contract.pendingFixture[key].length !== 0) {
      fail("PENDING_FIXTURE", "pending fixture contains integrated evidence rows")
    }
  }
  validateBaselineEvidence(contract.pendingFixture.baselineEvidence)
  exactValue(contract.baselineEvidenceContract, BASELINE_CONTRACT, "BASELINE_CONTRACT", "baseline contract")

  exactKeys(contract.validatorContract, [
    "mode", "plan008AllowedIndexStatus", "canonicalization", "realMode",
    "rejectedStructuredStates", "selfTestCount", "selfTestIdsSha256",
    "selfTestExpectedCodesSha256", "selfTestCasesSha256",
    "validatorImplementationSha256", "validatorGitBlobSha", "validatorByteLength"
  ], "VALIDATOR_CONTRACT", "validator contract")
  if (
    contract.validatorContract.mode !== "fail-closed-codex-only-provisional" ||
    contract.validatorContract.plan008AllowedIndexStatus !== "BLOCKED" ||
    contract.validatorContract.canonicalization !== "UTF-8 stable sorted-key canonical JSON without whitespace" ||
    contract.validatorContract.realMode !== "resolved-dependencies-plus-external-root-and-git-seal"
  ) fail("VALIDATOR_CONTRACT", "validator contract mode differs")
  exactSet(contract.validatorContract.rejectedStructuredStates, [
    "accepted", "accept-for-implementation", "accept-with-conditions", "approved",
    "complete", "completed", "final", "DONE", "production-authorized"
  ], "VALIDATOR_CONTRACT", "rejected states")
  if (selfTestManifest !== null) {
    if (
      contract.validatorContract.selfTestCount !== selfTestManifest.count ||
      contract.validatorContract.selfTestIdsSha256 !== selfTestManifest.idsSha256 ||
      contract.validatorContract.selfTestExpectedCodesSha256 !== selfTestManifest.expectedCodesSha256 ||
      contract.validatorContract.selfTestCasesSha256 !== selfTestManifest.casesSha256 ||
      contract.validatorContract.validatorImplementationSha256 !== selfTestManifest.validatorImplementationSha256 ||
      contract.validatorContract.validatorGitBlobSha !== selfTestManifest.validatorGitBlobSha ||
      contract.validatorContract.validatorByteLength !== selfTestManifest.validatorByteLength
    ) fail("SELF_TEST_MANIFEST", "self-test manifest differs")
  } else if (
    !Number.isInteger(contract.validatorContract.selfTestCount) ||
    contract.validatorContract.selfTestCount < 2553 ||
    !SHA_64.test(contract.validatorContract.selfTestIdsSha256) ||
    !SHA_64.test(contract.validatorContract.selfTestExpectedCodesSha256) ||
    !SHA_64.test(contract.validatorContract.selfTestCasesSha256) ||
    !SHA_64.test(contract.validatorContract.validatorImplementationSha256) ||
    !SHA_40.test(contract.validatorContract.validatorGitBlobSha) ||
    !Number.isInteger(contract.validatorContract.validatorByteLength) ||
    contract.validatorContract.validatorByteLength < 1
  ) fail("SELF_TEST_MANIFEST", "self-test manifest is invalid")
  if (validatorRaw !== null && (
    contract.validatorContract.validatorImplementationSha256 !== sha256Text(validatorRaw) ||
    contract.validatorContract.validatorGitBlobSha !== gitBlobSha(validatorRaw) ||
    contract.validatorContract.validatorByteLength !== Buffer.byteLength(validatorRaw, "utf8")
  )) fail("VALIDATOR_IMPLEMENTATION", "validator implementation bytes differ from the bound contract")
}

const validateProtocolHeadings = (raw) => {
  for (const heading of [
    "Status and permanent evidence boundary", "Source and dependency coordinates",
    "Canonical CODEX-only Plan 008", "Critical journey and state matrix",
    "Current automated baseline", "CODEX-only adversarial lanes",
    "First-pass receipt boundary", "Per-requirement evidence and failure coupling",
    "Transitive final evidence root", "Claim and privacy boundary",
    "Real evidence mode", "Deferred integrated run", "Validation commands"
  ]) {
    const count = raw.split("\n").filter((line) => line === `## ${heading}`).length
    if (count !== 1) fail("PROTOCOL_HEADING", "protocol heading set differs")
  }
}

const validatePlanIndexStatus = (raw) => {
  const section = raw.match(/## Execution order and status\n([\s\S]*?)\nStatus values:/)
  if (section === null) fail("PLAN_008_STATUS", "plan index status section is missing")
  const rows = section[1].split("\n").filter((line) => line.startsWith("| 008 |"))
  if (rows.length !== 1) fail("PLAN_008_STATUS", "plan index must contain one Plan 008 row")
  const cells = rows[0].split("|").slice(1, -1).map((value) => value.trim())
  if (cells.length !== 6 || cells[0] !== "008" || cells[5] !== PLAN_STATUS_CELL) {
    if (cells.some((cell) => /\bDONE\b/u.test(cell))) fail("PLAN_008_DONE", "Plan 008 cannot be DONE")
    fail("PLAN_008_STATUS", "Plan 008 status differs from the exact BLOCKED cell")
  }
}

const validateSourceCoordinates = ({ protocolRaw, canonicalPlanRaw, planIndexRaw, published = false }) => {
  validateCanonicalDocumentSemantics(canonicalPlanRaw, "canonical Plan 008")
  validateCanonicalDocumentSemantics(planIndexRaw, "plan index")
  validatePlanIndexStatus(planIndexRaw)
  parseFrontMatter(protocolRaw)
  validateProtocolHeadings(protocolRaw)

  for (const [raw, expected, label] of [
    [protocolRaw, EXPECTED_SOURCE_COORDINATES.protocol, "protocol"],
    [canonicalPlanRaw, EXPECTED_SOURCE_COORDINATES.canonicalPlan, "canonical Plan 008"],
    [planIndexRaw, EXPECTED_SOURCE_COORDINATES.planIndex, "plan index"]
  ]) {
    if (sha256Text(raw) !== expected.sha256 || gitBlobSha(raw) !== expected.gitBlobSha) {
      fail("CANONICAL_FILE_INTEGRITY", `${label} exact SHA-256 or Git blob differs`)
    }
  }

  const originMain = gitOutput(["rev-parse", "origin/main"])
  if (originMain !== EXPECTED_SOURCE_COORDINATES.preparedAgainstOriginMainSha) {
    fail("REBASE_REQUIRED", "origin/main differs from the prepared base")
  }
  for (const [label, sha] of [
    ["prepared base", EXPECTED_SOURCE_COORDINATES.preparedAgainstOriginMainSha],
    ["Plan 008 planning commit", EXPECTED_SOURCE_COORDINATES.plan008PlanningSha]
  ]) {
    let type
    try { type = gitOutput(["cat-file", "-t", sha]) } catch { fail("SOURCE_GIT_OBJECT", `${label} object is missing`) }
    if (type !== "commit") fail("SOURCE_GIT_OBJECT", `${label} is not a commit object`)
  }
  if (!isAncestor(EXPECTED_SOURCE_COORDINATES.plan008PlanningSha, EXPECTED_SOURCE_COORDINATES.preparedAgainstOriginMainSha)) {
    fail("SOURCE_GIT_ANCESTRY", "Plan 008 planning commit is not an ancestor of the prepared base")
  }
  if (!isAncestor(EXPECTED_SOURCE_COORDINATES.preparedAgainstOriginMainSha, "HEAD")) {
    fail("SOURCE_GIT_ANCESTRY", "prepared base is not an ancestor of HEAD")
  }
  for (const entry of EXPECTED_SOURCE_COORDINATES.canonicalInputBlobs) {
    let blob
    try { blob = gitOutput(["rev-parse", `${EXPECTED_SOURCE_COORDINATES.preparedAgainstOriginMainSha}:${entry.path}`]) } catch {
      fail("SOURCE_BLOB", "a canonical input is absent at the prepared base")
    }
    if (blob !== entry.blobSha || gitOutput(["cat-file", "-t", blob]) !== "blob") {
      fail("SOURCE_BLOB", "a canonical input blob differs at the prepared base")
    }
  }
  for (const expected of [EXPECTED_SOURCE_COORDINATES.canonicalPlan, EXPECTED_SOURCE_COORDINATES.planIndex]) {
    const oldBlob = gitOutput(["rev-parse", `${EXPECTED_SOURCE_COORDINATES.preparedAgainstOriginMainSha}:${expected.path}`])
    if (oldBlob !== expected.supersedesPreparedBaseBlobSha) {
      fail("SUPERSEDED_BLOB", "a superseded prepared-base canonical blob differs")
    }
    if (published) {
      const headBlob = gitOutput(["rev-parse", `HEAD:${expected.path}`])
      if (headBlob !== expected.gitBlobSha) fail("PUBLISHED_BLOB", "published canonical blob differs from bound bytes")
    }
  }
}

const recordDigestField = (schemaName) => RECORD_SCHEMAS[schemaName].digestField
const projectedRecordDigest = (schemaName, record) => {
  const field = recordDigestField(schemaName)
  const projection = Object.fromEntries(Object.entries(record).filter(([key]) => key !== field))
  return sha256Canonical(projection)
}
const sealRecord = (schemaName, record) => {
  for (const [key, value] of Object.entries(RECORD_PERMANENT_METADATA)) {
    if (!Object.hasOwn(record, key)) record[key] = value
  }
  record[recordDigestField(schemaName)] = projectedRecordDigest(schemaName, record)
  return record
}
const validateRecordShapeAndDigest = (schemaName, record) => {
  const schema = RECORD_SCHEMAS[schemaName]
  exactKeys(record, schema.requiredFields, "REAL_RECORD_KEYS", `${schemaName} record`)
  validateRecordMetadata(record, "REAL_RECORD_METADATA", `${schemaName} record`)
  const recursive = (value) => {
    if (Array.isArray(value)) { value.forEach(recursive); return }
    if (!isRecord(value)) return
    for (const [key, nested] of Object.entries(value)) {
      if (schema.prohibitedFields.includes(key)) fail("REAL_RECORD_PROHIBITED", `${schemaName} contains a prohibited field`)
      recursive(nested)
    }
  }
  recursive(record)
  const digestField = schema.digestField
  assertHash(record[digestField], "REAL_RECORD_DIGEST", `${schemaName} digest`)
  if (record[digestField] !== projectedRecordDigest(schemaName, record)) {
    fail("REAL_RECORD_DIGEST", `${schemaName} digest differs from exact record bytes`)
  }
}

const validateOrderedRecords = (records, idField, code, label, allowEmpty = false) => {
  if (!Array.isArray(records) || (!allowEmpty && records.length === 0)) fail(code, `${label} collection is invalid`)
  const ids = records.map((record) => record?.[idField])
  if (
    ids.some((id) => typeof id !== "string" || id.length === 0) ||
    new Set(ids).size !== ids.length ||
    canonicalJson(ids) !== canonicalJson([...ids].sort(compareUnicode))
  ) fail(code, `${label} IDs must be unique and sorted`)
  return ids
}
const sequenceSha256 = (schemaName, records, idField) => {
  const digestField = recordDigestField(schemaName)
  const sorted = [...records].sort((left, right) => compareUnicode(left[idField], right[idField]))
  return sha256Canonical(sorted.map((record) => record[digestField]))
}
const laneSequenceMap = (findings) => Object.fromEntries(LANE_IDS.map((laneId) => [
  laneId,
  sequenceSha256("finding", findings.filter((finding) => finding.laneId === laneId), "findingId")
]))
const laneOutputMap = (agentRuns) => Object.fromEntries(LANE_IDS.map((laneId) => {
  const run = agentRuns.find((candidate) => candidate.laneId === laneId)
  return [laneId, run?.outputSha256 ?? null]
}))

const commandContractSha256 = () => sha256Canonical({
  commandIds: COMMAND_IDS,
  host: "127.0.0.1",
  externalRequestsAllowed: false,
  coverageProvider: "contract-owned-committed-result-manifests-and-first-pass-artifacts"
})

const DEPENDENCY_STEP_FIELDS = Object.freeze([
  "programStepId", "planId", "acceptedOutput", "requiredSha",
  "requiredArtifactPath", "artifactSha256", "artifactGitBlobSha", "artifactGitMode",
  "acceptanceRecordKind", "acceptanceRecordPath", "acceptanceRecordSha256",
  "acceptanceRecordGitBlobSha", "acceptanceRecordGitMode", "dispositionPath",
  "dispositionSha256", "dispositionGitBlobSha", "dispositionGitMode",
  "dispositionClauseId", "dispositionClauseSha256", "acceptanceStatus"
])
const NATIVE_ACCEPTANCE_FIELDS = Object.freeze([
  "contractVersion", "programStepId", "planId", "acceptedOutput", "primaryArtifact",
  "validationModel", "reviewMode", "participantEvidence", "humanEvidence",
  "participantCount", "humanParticipantCount", "notHumanUsabilityTested",
  "agentsCountAsPeople", "humanBehaviorEvidence", "realDeviceAssistiveTechnologyEvidence",
  "productionAuthorization", "upstreamDisposition", "programStatus", "acceptanceBasis",
  "recordSha256"
])
const NATIVE_DISPOSITION_FIELDS = Object.freeze([
  "contractVersion", "programStepId", "planId", "dispositionClauseId", "status",
  "validationModel", "reviewMode", "humanEvidence", "humanParticipantCount",
  "notHumanUsabilityTested", "productionAuthorization", "recordSha256"
])

const readDependencyFile = (step, prefix, cwd) => {
  const path = step[`${prefix}Path`]
  const sha256 = prefix === "requiredArtifact" ? step.artifactSha256 : step[`${prefix}Sha256`]
  const blobSha = prefix === "requiredArtifact" ? step.artifactGitBlobSha : step[`${prefix}GitBlobSha`]
  const mode = prefix === "requiredArtifact" ? step.artifactGitMode : step[`${prefix}GitMode`]
  if (typeof path !== "string" || !SHA_64.test(sha256) || !SHA_40.test(blobSha) || !["100644", "100755"].includes(mode)) {
    fail("REAL_DEPENDENCY_PATH", "dependency coordinate shape differs")
  }
  if (prefix === "requiredArtifact") assertSafeRepositoryPath(path, "REAL_DEPENDENCY_PATH", "dependency artifact path")
  else if (!(isSafeRepositoryPath(path) || (step.programStepId === "02" && path === "research/ui-ux/codex-only-v1/evidence-manifest.json"))) {
    fail("REAL_DEPENDENCY_PATH", "dependency metadata path differs")
  }
  let bytes
  let resolvedBlob
  try {
    bytes = execFileSync("git", ["show", `${step.requiredSha}:${path}`], {
      cwd, stdio: ["ignore", "pipe", "ignore"], maxBuffer: GIT_MAX_BUFFER
    })
    resolvedBlob = gitOutput(["rev-parse", `${step.requiredSha}:${path}`], cwd)
  } catch {
    fail("REAL_DEPENDENCY_BYTES", "dependency artifact is missing")
  }
  const tree = assertRegularGitPath(step.requiredSha, path, cwd, "REAL_DEPENDENCY_OBJECT", "dependency artifact")
  if (
    tree.mode !== mode || tree.blobSha !== blobSha || resolvedBlob !== blobSha ||
    gitBlobSha(bytes) !== blobSha || sha256Bytes(bytes) !== sha256
  ) fail("REAL_DEPENDENCY_BYTES", "dependency artifact bytes or mode differ")
  return bytes.toString("utf8")
}

const validateNativeDependencyAcceptance = (step, acceptanceRaw, dispositionRaw) => {
  const acceptance = parseJsonNoDuplicateKeys(acceptanceRaw, "dependency acceptance record")
  const disposition = parseJsonNoDuplicateKeys(dispositionRaw, "dependency disposition record")
  validateSafeTree(acceptance, "dependency acceptance record")
  validateSafeTree(disposition, "dependency disposition record")
  exactKeys(acceptance, NATIVE_ACCEPTANCE_FIELDS, "REAL_DEPENDENCY_METADATA", "dependency acceptance record")
  exactKeys(acceptance.primaryArtifact, ["path", "sha256", "gitBlobSha", "gitMode"], "REAL_DEPENDENCY_METADATA", "dependency primary artifact")
  exactKeys(disposition, NATIVE_DISPOSITION_FIELDS, "REAL_DEPENDENCY_DISPOSITION", "dependency disposition record")
  const expectedMetadata = {
    validationModel: "CODEX-ONLY-UIUX-V1", reviewMode: "codex-only",
    participantEvidence: "none", humanEvidence: "none", participantCount: 0,
    humanParticipantCount: 0, notHumanUsabilityTested: true, agentsCountAsPeople: false,
    humanBehaviorEvidence: false, realDeviceAssistiveTechnologyEvidence: false,
    productionAuthorization: false
  }
  if (
    acceptance.contractVersion !== "CODEX-ONLY-UIUX-V1/DEPENDENCY-ACCEPTANCE-V1" ||
    acceptance.programStepId !== step.programStepId || acceptance.planId !== step.planId ||
    acceptance.acceptedOutput !== step.acceptedOutput ||
    canonicalJson(acceptance.primaryArtifact) !== canonicalJson({
      path: step.requiredArtifactPath, sha256: step.artifactSha256,
      gitBlobSha: step.artifactGitBlobSha, gitMode: step.artifactGitMode
    }) || Object.entries(expectedMetadata).some(([key, value]) => acceptance[key] !== value) ||
    acceptance.upstreamDisposition !== "accepted-codex-only" ||
    acceptance.programStatus !== "codex-only-complete" ||
    acceptance.acceptanceBasis !== "merged-origin-main-plus-bound-canonical-disposition" ||
    acceptance.recordSha256 !== projectedDigest(acceptance, "recordSha256")
  ) fail("REAL_DEPENDENCY_METADATA", "dependency acceptance metadata differs")
  if (
    disposition.contractVersion !== "CODEX-ONLY-UIUX-V1/DEPENDENCY-DISPOSITION-V1" ||
    disposition.programStepId !== step.programStepId || disposition.planId !== step.planId ||
    disposition.dispositionClauseId !== step.dispositionClauseId ||
    disposition.status !== "accepted-codex-only" || disposition.validationModel !== "CODEX-ONLY-UIUX-V1" ||
    disposition.reviewMode !== "codex-only" || disposition.humanEvidence !== "none" ||
    disposition.humanParticipantCount !== 0 || disposition.notHumanUsabilityTested !== true ||
    disposition.productionAuthorization !== false ||
    disposition.recordSha256 !== projectedDigest(disposition, "recordSha256") ||
    sha256Text(`${step.dispositionClauseId}\n`) !== step.dispositionClauseSha256
  ) fail("REAL_DEPENDENCY_DISPOSITION", "dependency disposition differs")
}

const validateResolvedDependencies = (dependencyInterface, cwd, capability = null) => {
  exactKeys(dependencyInterface, [
    "mode", "ready", "executionBaseSha", "trustedExternalAnchor",
    "requiredSteps", "futureResolutionRequirements"
  ], "REAL_DEPENDENCY_SET", "resolved dependency interface")
  if (dependencyInterface.mode !== EXPECTED_DEPENDENCIES.mode || dependencyInterface.ready !== true) {
    fail("REAL_DEPENDENCIES_PENDING", "real evidence mode requires resolved dependencies")
  }
  assertGitSha(dependencyInterface.executionBaseSha, "REAL_DEPENDENCY_OBJECT", "execution base")
  if (!Array.isArray(dependencyInterface.requiredSteps) || dependencyInterface.requiredSteps.length !== 3) {
    fail("REAL_DEPENDENCY_SET", "resolved dependency set differs")
  }
  exactValue(dependencyInterface.futureResolutionRequirements, EXPECTED_DEPENDENCIES.futureResolutionRequirements, "REAL_DEPENDENCY_SET", "dependency resolution requirements")
  const expectedSteps = ["02", "03", "04"]
  const seenCommits = new Set()
  const seenPaths = new Set()
  let priorSha = null
  for (let index = 0; index < expectedSteps.length; index += 1) {
    const step = dependencyInterface.requiredSteps[index]
    exactKeys(step, DEPENDENCY_STEP_FIELDS, "REAL_DEPENDENCY_SET", "resolved dependency row")
    if (
      step.programStepId !== expectedSteps[index] || step.planId !== ["005", "006", "007"][index] ||
      step.acceptedOutput !== ["learner-task-navigation-contract", "consumer-visual-system-and-route-archetypes", "component-foundation-and-responsive-contract"][index] ||
      step.acceptanceStatus !== "accepted-codex-only" ||
      step.acceptanceRecordKind !== (capability === SELF_TEST_CAPABILITY || index > 0 ? "native-codex-only-acceptance-v1" : "step02-legacy-evidence-manifest-v2")
    ) fail("REAL_DEPENDENCY_IDENTITY", "resolved dependency identity differs")
    assertGitSha(step.requiredSha, "REAL_DEPENDENCY_OBJECT", "dependency commit")
    if (seenCommits.has(step.requiredSha)) fail("REAL_DEPENDENCY_REUSE", "dependency commit is reused")
    let type
    try { type = gitOutput(["cat-file", "-t", step.requiredSha], cwd) } catch { fail("REAL_DEPENDENCY_OBJECT", "dependency commit object is missing") }
    if (
      type !== "commit" || !isAncestor(step.requiredSha, dependencyInterface.executionBaseSha, cwd) ||
      (priorSha !== null && !isAncestor(priorSha, step.requiredSha, cwd))
    ) fail("REAL_DEPENDENCY_ANCESTRY", "dependency commit order or ancestry differs")
    seenCommits.add(step.requiredSha)
    priorSha = step.requiredSha
    const primaryRaw = readDependencyFile(step, "requiredArtifact", cwd)
    const acceptanceRaw = readDependencyFile(step, "acceptanceRecord", cwd)
    const dispositionRaw = readDependencyFile(step, "disposition", cwd)
    for (const path of [step.requiredArtifactPath, step.acceptanceRecordPath, step.dispositionPath]) {
      if (seenPaths.has(path)) fail("REAL_DEPENDENCY_REUSE", "dependency artifact path is reused")
      seenPaths.add(path)
    }
    if (capability === SELF_TEST_CAPABILITY || index > 0) {
      validateNativeDependencyAcceptance(step, acceptanceRaw, dispositionRaw)
    } else {
      const expected = EXPECTED_DEPENDENCIES.requiredSteps[0]
      for (const field of DEPENDENCY_STEP_FIELDS) {
        if (step[field] !== expected[field]) fail("REAL_DEPENDENCY_METADATA", "Step 02 legacy coordinate differs")
      }
      const legacy = parseJsonNoDuplicateKeys(acceptanceRaw, "Step 02 legacy evidence manifest")
      if (
        legacy.schemaVersion !== "codex-only-uiux-evidence-v2" || legacy.programVersion !== "CODEX-ONLY-UIUX-V1" ||
        legacy.programStatus !== "codex-only-complete" || legacy.evidenceMode !== "codex-only" ||
        legacy.humanEvidence !== "none" || legacy.humanParticipantEvidence !== "none" ||
        legacy.humanParticipantCount !== 0 || legacy.notHumanUsabilityTested !== true ||
        sha256Text(dispositionRaw.split("\n").find((line) => line.startsWith("| 005 |")) + "\n") !== step.dispositionClauseSha256
      ) fail("REAL_DEPENDENCY_METADATA", "Step 02 legacy acceptance metadata or disposition differs")
      if (!primaryRaw.startsWith("# Plans 004/005 CODEX-ONLY evaluation packet\n")) fail("REAL_DEPENDENCY_METADATA", "Step 02 primary artifact identity differs")
    }
  }
  exactKeys(
    dependencyInterface.trustedExternalAnchor,
    EVIDENCE_BUNDLE_CONTRACT.externalAnchorCoordinateFields,
    "REAL_DEPENDENCY_ANCHOR",
    "trusted external anchor coordinate"
  )
  const trustedAnchor = dependencyInterface.trustedExternalAnchor
  if (
    !SHA_40.test(trustedAnchor.commit) || !isSafeRepositoryPath(trustedAnchor.path) ||
    !SHA_64.test(trustedAnchor.sha256) || !SHA_40.test(trustedAnchor.gitBlobSha) ||
    trustedAnchor.commit === dependencyInterface.requiredSteps[2].requiredSha ||
    !isAncestor(dependencyInterface.requiredSteps[2].requiredSha, trustedAnchor.commit, cwd) ||
    !isAncestor(trustedAnchor.commit, dependencyInterface.executionBaseSha, cwd)
  ) fail("REAL_DEPENDENCY_ANCHOR", "trusted external anchor coordinate or ancestry differs")
  let baseType
  try { baseType = gitOutput(["cat-file", "-t", dependencyInterface.executionBaseSha], cwd) } catch { fail("REAL_DEPENDENCY_OBJECT", "execution base object is missing") }
  if (baseType !== "commit") fail("REAL_DEPENDENCY_OBJECT", "execution base is not a commit")
  if (capability !== SELF_TEST_CAPABILITY && gitOutput(["rev-parse", "origin/main"], cwd) !== dependencyInterface.executionBaseSha) {
    fail("REAL_DEPENDENCY_BASE", "execution base differs from fetched origin/main")
  }
}

const REAL_BUNDLE_KEYS = Object.freeze([
  "schemaVersion", "bundleId", "mode", "published", "publishedPacketCommit", "packetBytesRootSha256",
  "validationModel", "reviewMode",
  "participantEvidence", "humanEvidence", "participantCount", "humanParticipantCount",
  "humanSessionCount", "notHumanUsabilityTested", "agentsCountAsPeople",
  "productionAuthorization", "executionManifest", "taskReceipts", "firstPassReceipts",
  "firstPassReceiptSeal", "externalAnchor",
  "environmentObservations", "automatedRuns", "assertions", "coverageCells",
  "findings", "agentRuns", "dissentPositions", "dissentGroups", "dissentMatrix",
  "consensus", "finalEvidence", "finalEvidenceRootSha256"
])

const REAL_PERMANENT_VALUES = Object.freeze({
  validationModel: "CODEX-ONLY-UIUX-V1",
  reviewMode: "codex-only",
  participantEvidence: "none",
  humanEvidence: "none",
  participantCount: 0,
  humanParticipantCount: 0,
  humanSessionCount: 0,
  notHumanUsabilityTested: true,
  agentsCountAsPeople: false,
  productionAuthorization: false
})

const MANDATORY_NONEMPTY_FAILURE_CODES = Object.freeze({
  taskReceipts: "REAL_RECEIPT",
  firstPassReceipts: "REAL_RECEIPT",
  environmentObservations: "REAL_ENVIRONMENT",
  automatedRuns: "REAL_AUTOMATION",
  assertions: "REAL_ASSERTION",
  coverageCells: "REAL_COVERAGE",
  agentRuns: "REAL_AGENT_RUN",
  dissentPositions: "REAL_DISSENT",
  dissentMatrix: "REAL_DISSENT"
})

const validateMandatoryCollections = (bundle) => {
  for (const key of EVIDENCE_BUNDLE_CONTRACT.mandatoryNonemptyCollections) {
    if (!Array.isArray(bundle[key]) || bundle[key].length === 0) {
      fail(MANDATORY_NONEMPTY_FAILURE_CODES[key], `${key} must be a nonempty collection`)
    }
  }
}

const expectedEnvironmentValues = Object.freeze({
  "packet-validator": {
    environmentId: "P008-ENV-01",
    runtimeId: "node-22.22.0",
    browserProfiles: []
  },
  "repository-verify": {
    environmentId: "P008-ENV-02",
    runtimeId: "bun-1.4.0-node-22.22.0",
    browserProfiles: []
  },
  "loopback-preview": {
    environmentId: "P008-ENV-03",
    runtimeId: "vite-loopback",
    browserProfiles: []
  },
  "browser-matrix": {
    environmentId: "P008-ENV-04",
    runtimeId: "playwright-1.62.1",
    browserProfiles: ["chromium", "firefox", "webkit"]
  }
})
const expectedRunId = (commandId) => `P008-RUN-${String(COMMAND_IDS.indexOf(commandId) + 1).padStart(2, "0")}`

const validateExecutionManifest = (manifest, dependencyInterface, contractRoot, requirementRows, publication) => {
  validateRecordShapeAndDigest("executionManifest", manifest)
  if (
    manifest.manifestId !== "P008-EXECUTION-MANIFEST-01" ||
    manifest.mode !== "real-evidence" ||
    manifest.published !== publication.published ||
    manifest.publishedPacketCommit !== publication.publishedPacketCommit ||
    manifest.packetBytesRootSha256 !== publication.packetBytesRootSha256 ||
    manifest.executionBaseSha !== dependencyInterface.executionBaseSha ||
    canonicalJson(manifest.trustedExternalAnchor) !== canonicalJson(dependencyInterface.trustedExternalAnchor) ||
    manifest.canonicalSourceRootSha256 !== contractRoot ||
    manifest.journeyRequirementsSha256 !== sha256Canonical(requirementRows) ||
    manifest.commandContractSha256 !== commandContractSha256() ||
    manifest.inputEvidenceRootSha256 !== BASELINE_SEQUENCE_SHA256 ||
    manifest.host !== "127.0.0.1" || manifest.externalRequestsAllowed !== false
  ) fail("REAL_MANIFEST", "execution manifest differs from exact inputs")
  assertHash(manifest.artifactManifestSha256, "REAL_MANIFEST", "artifact manifest SHA-256")
  const dependencyShas = Object.fromEntries(dependencyInterface.requiredSteps.map((step) => [step.programStepId, step.requiredSha]))
  const dependencyArtifacts = Object.fromEntries(dependencyInterface.requiredSteps.map((step) => [
    step.programStepId,
    Object.fromEntries(Object.entries(step).filter(([key]) => key !== "requiredSha"))
  ]))
  exactValue(manifest.dependencyShas, dependencyShas, "REAL_MANIFEST", "manifest dependency SHAs")
  exactValue(manifest.dependencyArtifacts, dependencyArtifacts, "REAL_MANIFEST", "manifest dependency artifacts")
}

const assertionContractRootSha256 = (requirementRows) => sha256Canonical(requirementRows.map((row) => ({
  assertionContractId: row.assertionContractId,
  requirementId: row.requirementId,
  coverageCellId: row.coverageCellId,
  authorityAtomId: row.authorityAtomId,
  authorityClauseIds: row.authorityClauseIds,
  authorityBindingIds: row.authorityBindingIds,
  authorityRouteScopes: row.authorityRouteScopes,
  providerKind: row.providerKind,
  providerId: row.providerId,
  sourceClauseId: row.sourceClauseId
})))

const observationKindFor = (row) => row.providerKind === "codex-first-pass-artifact"
  ? "codex-structured-category-inspection"
  : `${row.requirementKind}-deterministic-technical-check`

const BROWSER_DIMENSION_CHECK_IDS = Object.freeze({
  "semantic-html": ["main-landmark-single", "heading-one-single", "semantic-reading-order", "interactive-name-closure"],
  "keyboard-only": ["keyboard-route-completion", "keyboard-trap-zero", "focus-target-visible"],
  "focus-and-status-markup": ["focus-target-not-obscured", "status-change-programmatic", "focus-restoration-deterministic"],
  "320-and-1440-css-pixel-reflow": ["page-horizontal-overflow-zero", "content-order-stable", "target-size-contract"],
  "forced-colors": ["state-not-color-only", "focus-indicator-forced-colors", "control-boundary-forced-colors"],
  "reduced-motion": ["motion-duration-zero", "state-change-immediate", "focus-restoration-after-zero-motion"],
  "print-and-large-print-transformation": ["print-chrome-hidden", "print-reading-order", "print-answer-separation", "large-print-token-contract"],
  "nonvisual-operability": ["nonvisual-equivalent-present", "nonvisual-reading-order", "visual-placeholder-empty-zero"],
  "cognitive-load": ["single-primary-task", "bounded-reading-width", "instructions-before-controls", "recovery-actions-visible"]
})

const browserDimensionFor = (row) => {
  if (row.requirementKind === "authority-route-accessibility") {
    const separator = row.targetId.lastIndexOf(":")
    const dimension = separator < 0 ? "" : row.targetId.slice(separator + 1)
    return ACCESSIBILITY_DIMENSION_ORDER.includes(dimension) ? dimension : null
  }
  return row.requirementKind === "capability" && ACCESSIBILITY_DIMENSION_ORDER.includes(row.targetId)
    ? row.targetId
    : null
}

const browserSubjectRouteIds = (row) => [...new Set(row.authorityRouteScopes.flat())]

const browserContextsFor = (row) => {
  const dimension = browserDimensionFor(row)
  if (dimension === "320-and-1440-css-pixel-reflow") return [
    {
      contextId: "screen-320",
      viewport: { widthCssPixels: 320, heightCssPixels: 720 },
      media: { mediaType: "screen", forcedColors: "none", reducedMotion: "no-preference" }
    },
    {
      contextId: "screen-1440",
      viewport: { widthCssPixels: 1440, heightCssPixels: 900 },
      media: { mediaType: "screen", forcedColors: "none", reducedMotion: "no-preference" }
    }
  ]
  if (dimension === "forced-colors") return [{
    contextId: "forced-colors-1440",
    viewport: { widthCssPixels: 1440, heightCssPixels: 900 },
    media: { mediaType: "screen", forcedColors: "active", reducedMotion: "no-preference" }
  }]
  if (dimension === "reduced-motion") return [{
    contextId: "reduced-motion-1440",
    viewport: { widthCssPixels: 1440, heightCssPixels: 900 },
    media: { mediaType: "screen", forcedColors: "none", reducedMotion: "reduce" }
  }]
  if (dimension === "print-and-large-print-transformation") return [{
    contextId: "print-1440",
    viewport: { widthCssPixels: 1440, heightCssPixels: 900 },
    media: { mediaType: "print", forcedColors: "none", reducedMotion: "no-preference" }
  }]
  return [{
    contextId: "screen-1440",
    viewport: { widthCssPixels: 1440, heightCssPixels: 900 },
    media: { mediaType: "screen", forcedColors: "none", reducedMotion: "no-preference" }
  }]
}

const browserAssertionClassFor = (row) => browserDimensionFor(row) ?? row.requirementKind

const browserCheckIdsFor = (row) => {
  const dimension = browserDimensionFor(row)
  const classChecks = dimension === null
    ? {
        "authority-route": ["route-resolved", "main-landmark-single", "heading-one-single"],
        "authority-state": ["state-rendered", "state-status-present", "state-actions-consistent"],
        "authority-route-transition-surface": ["route-transition-surface-rendered", "bound-transition-actions-present"],
        "authority-transition": ["transition-precondition-present", "transition-action-completed", "legal-next-state-present"],
        "journey-state": ["journey-state-rendered", "journey-state-route-consistent"],
        "journey-transition": ["journey-transition-precondition-present", "journey-transition-completed", "journey-next-state-consistent"],
        interruption: ["interruption-triggered", "interruption-restoration-consistent", "persisted-state-consistent"],
        capability: [`capability-${row.targetId}`]
      }[row.requirementKind] ?? []
    : BROWSER_DIMENSION_CHECK_IDS[dimension]
  const bindingChecks = row.authorityBindingIds.map((bindingId, index) =>
    `binding-${String(index + 1).padStart(4, "0")}-${sha256Text(bindingId).slice(0, 12)}`
  )
  return [...classChecks, ...bindingChecks, "external-request-count-zero"]
}

const browserCaseContract = (row, entry) => ({
  contractVersion: PUBLIC_BROWSER_PROVIDER_CONTRACT.version,
  assertionId: row.assertionContractId,
  requirementId: row.requirementId,
  caseId: entry.executionCaseId,
  caseTitle: `P008 ${entry.executionCaseId}`,
  assertionClass: browserAssertionClassFor(row),
  subjectRouteIds: browserSubjectRouteIds(row),
  authorityBindingIds: row.authorityBindingIds,
  authorityRouteScopes: row.authorityRouteScopes,
  projectIds: PLAYWRIGHT_PROJECT_IDS,
  contexts: browserContextsFor(row),
  checkIds: browserCheckIdsFor(row),
  baseUrl: PUBLIC_BROWSER_PROVIDER_CONTRACT.baseUrl,
  deviceEvidence: PUBLIC_BROWSER_PROVIDER_CONTRACT.deviceEvidence,
  realDeviceEvidence: false,
  emittedAssistiveTechnologyEvidence: false
})

const expectedPublicBrowserImplementationPath = (entry) =>
  `apps/site/browser-tests/plan008/cases/${entry.implementationId}.pw.ts`

const expectedPublicBrowserImplementationBytes = (row, entry) => {
  const contract = browserCaseContract(row, entry)
  return [
    'import { test } from "@playwright/test"',
    'import { executePlan008Assertion } from "../integrated-assertion-harness.ts"',
    "",
    `const assertionContract = ${canonicalJson(contract)} as const`,
    "",
    "test(assertionContract.caseTitle, async ({ browser, baseURL }, testInfo) => {",
    "  await executePlan008Assertion({ browser, baseURL, testInfo, assertionContract })",
    "})",
    ""
  ].join("\n")
}

const expectedPublicBrowserCommandArgv = (row, entry) => [
  "bun", "x", "playwright", "test",
  "--config=apps/site/playwright.config.ts",
  entry.implementationPath,
  "--grep", `^P008 ${entry.executionCaseId}$`,
  `--reporter=${PUBLIC_BROWSER_PROVIDER_CONTRACT.reporterPath}`,
  "--workers=1",
  ...PLAYWRIGHT_PROJECT_IDS.map((projectId) => `--project=${projectId}`)
]

const browserObservationId = (caseId, projectId, contextId) =>
  `P008-BROWSER-OBS-${caseId}-${projectId}-${contextId}`

const browserObservationSequenceSha256 = (observations) =>
  sha256Canonical(observations.map((observation) => observation.recordSha256))

const validateBrowserDomMetrics = (metrics, row, observationResult) => {
  exactKeys(metrics, BROWSER_DOM_METRIC_FIELDS, "REAL_BROWSER_OBSERVATION", "browser DOM metrics")
  for (const [key, value] of Object.entries(metrics)) {
    if (value !== null && (!Number.isInteger(value) || value < 0)) {
      fail("REAL_BROWSER_OBSERVATION", "browser DOM metric type differs")
    }
  }
  const dimension = browserDimensionFor(row)
  if (metrics.mainLandmarkCount !== 1 || metrics.headingOneCount !== 1 || metrics.externalRequestCount !== 0) {
    fail("REAL_BROWSER_OBSERVATION", "browser landmark or network observation differs")
  }
  const requiredZero = [
    [dimension === "320-and-1440-css-pixel-reflow", "pageHorizontalOverflowCssPixels"],
    [["semantic-html", "keyboard-only", "focus-and-status-markup", "nonvisual-operability"].includes(dimension), "unlabeledInteractiveCount"],
    [dimension === "keyboard-only", "keyboardTrapCount"],
    [["keyboard-only", "focus-and-status-markup"].includes(dimension), "obscuredFocusTargetCount"],
    [dimension === "nonvisual-operability", "missingNonvisualEquivalentCount"],
    [dimension === "cognitive-load", "cognitiveLoadViolationCount"],
    [dimension === "print-and-large-print-transformation", "printChromeVisibleCount"],
    [dimension === "reduced-motion", "motionDurationMilliseconds"]
  ]
  for (const [required, key] of requiredZero) {
    if (required && observationResult === "passed" && metrics[key] !== 0) {
      fail("REAL_BROWSER_OBSERVATION", "browser assertion-class DOM metric differs")
    }
    if (!required && metrics[key] !== null) {
      fail("REAL_BROWSER_OBSERVATION", "browser DOM metric is present outside its assertion class")
    }
  }
  if (
    dimension === "focus-and-status-markup" && observationResult === "passed" && metrics.statusMutationCount < 1 ||
    dimension !== "focus-and-status-markup" && metrics.statusMutationCount !== null ||
    row.requirementKind === "interruption" && observationResult === "passed" && metrics.visibleRecoveryActionCount < 1 ||
    row.requirementKind !== "interruption" && metrics.visibleRecoveryActionCount !== null
  ) fail("REAL_BROWSER_OBSERVATION", "browser status or recovery DOM metric differs")
}

const validateBrowserObservation = (observation, row, entry, projectId, context) => {
  exactKeys(observation, BROWSER_OBSERVATION_FIELDS, "REAL_BROWSER_OBSERVATION", "browser observation")
  validateRecordMetadata(observation, "REAL_BROWSER_OBSERVATION", "browser observation")
  exactKeys(observation.viewport, BROWSER_VIEWPORT_FIELDS, "REAL_BROWSER_OBSERVATION", "browser viewport")
  exactKeys(observation.media, BROWSER_MEDIA_FIELDS, "REAL_BROWSER_OBSERVATION", "browser media")
  const expectedCheckIds = browserCheckIdsFor(row)
  if (
    observation.observationId !== browserObservationId(entry.executionCaseId, projectId, context.contextId) ||
    observation.assertionId !== row.assertionContractId || observation.requirementId !== row.requirementId ||
    observation.caseId !== entry.executionCaseId || observation.projectId !== projectId ||
    observation.contextId !== context.contextId ||
    canonicalJson(observation.viewport) !== canonicalJson(context.viewport) ||
    canonicalJson(observation.media) !== canonicalJson(context.media) ||
    canonicalJson(observation.subjectRouteIds) !== canonicalJson(browserSubjectRouteIds(row)) ||
    observation.assertionClass !== browserAssertionClassFor(row) ||
    !Array.isArray(observation.checkResults) ||
    canonicalJson(observation.checkResults.map((check) => check.checkId)) !== canonicalJson(expectedCheckIds) ||
    !["passed", "failed"].includes(observation.result)
  ) fail("REAL_BROWSER_OBSERVATION", "browser observation identity or context differs")
  for (const check of observation.checkResults) {
    exactKeys(check, BROWSER_CHECK_FIELDS, "REAL_BROWSER_OBSERVATION", "browser check")
    validateRecordMetadata(check, "REAL_BROWSER_OBSERVATION", "browser check")
    if (
      check.expected !== true || typeof check.actual !== "boolean" ||
      check.status !== (check.actual ? "passed" : "failed")
    ) fail("REAL_BROWSER_OBSERVATION", "browser check result differs")
  }
  const failedChecks = observation.checkResults.filter((check) => check.actual !== true)
  if (
    (observation.result === "passed" && failedChecks.length !== 0) ||
    (observation.result === "failed" && failedChecks.length === 0)
  ) fail("REAL_BROWSER_OBSERVATION", "browser observation result is not derived from checks")
  validateBrowserDomMetrics(observation.domMetrics, row, observation.result)
  if (observation.recordSha256 !== projectedDigest(observation, "recordSha256")) {
    fail("REAL_BROWSER_OBSERVATION", "browser observation digest differs")
  }
}

const validateBrowserResultAndReport = (result, report, row, entry) => {
  exactKeys(result, BROWSER_RESULT_FIELDS, "REAL_BROWSER_RESULT", "browser result")
  exactKeys(report, BROWSER_REPORT_FIELDS, "REAL_BROWSER_REPORT", "browser report")
  validateRecordMetadata(result, "REAL_BROWSER_RESULT", "browser result")
  validateRecordMetadata(report, "REAL_BROWSER_REPORT", "browser report")
  const caseTitle = `P008 ${entry.executionCaseId}`
  const contexts = browserContextsFor(row)
  const expectedObservationCoordinates = PLAYWRIGHT_PROJECT_IDS.flatMap((projectId) =>
    contexts.map((context) => [projectId, context])
  )
  if (
    result.schemaVersion !== 1 || result.resultId !== `P008-BROWSER-RESULT-${entry.executionCaseId}` ||
    result.runnerId !== PUBLIC_BROWSER_PROVIDER_CONTRACT.runnerId ||
    result.runnerVersion !== PUBLIC_BROWSER_PROVIDER_CONTRACT.runnerVersion ||
    result.caseId !== entry.executionCaseId || result.caseTitle !== caseTitle ||
    result.assertionId !== row.assertionContractId || result.requirementId !== row.requirementId ||
    result.implementationPath !== entry.implementationPath ||
    result.implementationGitBlobSha !== entry.implementationBlobSha ||
    result.harnessPath !== PUBLIC_BROWSER_PROVIDER_CONTRACT.harnessPath ||
    result.harnessGitBlobSha !== PUBLIC_BROWSER_PROVIDER_CONTRACT.harnessGitBlobSha ||
    result.reporterPath !== PUBLIC_BROWSER_PROVIDER_CONTRACT.reporterPath ||
    result.reporterGitBlobSha !== PUBLIC_BROWSER_PROVIDER_CONTRACT.reporterGitBlobSha ||
    canonicalJson(result.projectIds) !== canonicalJson(PLAYWRIGHT_PROJECT_IDS) ||
    !Array.isArray(result.observations) || result.observations.length !== expectedObservationCoordinates.length ||
    !["passed", "failed"].includes(result.result) || result.exitCode !== (result.result === "passed" ? 0 : 1)
  ) fail("REAL_BROWSER_RESULT", "browser result identity differs")
  for (let index = 0; index < expectedObservationCoordinates.length; index += 1) {
    const [projectId, context] = expectedObservationCoordinates[index]
    validateBrowserObservation(result.observations[index], row, entry, projectId, context)
  }
  const failedObservations = result.observations.filter((observation) => observation.result === "failed")
  if (
    result.result !== entry.result ||
    (result.result === "passed" && failedObservations.length !== 0) ||
    (result.result === "failed" && failedObservations.length === 0) ||
    result.observationSequenceSha256 !== browserObservationSequenceSha256(result.observations) ||
    result.recordSha256 !== projectedDigest(result, "recordSha256")
  ) fail("REAL_BROWSER_RESULT", "browser result is not derived from observations")
  if (
    report.schemaVersion !== 1 || report.reportId !== `P008-BROWSER-REPORT-${entry.executionCaseId}` ||
    report.reporterId !== PUBLIC_BROWSER_PROVIDER_CONTRACT.reporterId ||
    report.runnerId !== PUBLIC_BROWSER_PROVIDER_CONTRACT.runnerId ||
    report.runnerVersion !== PUBLIC_BROWSER_PROVIDER_CONTRACT.runnerVersion ||
    report.caseId !== entry.executionCaseId || report.caseTitle !== caseTitle ||
    report.implementationPath !== entry.implementationPath ||
    report.implementationGitBlobSha !== entry.implementationBlobSha ||
    !Array.isArray(report.projectSummaries) || report.projectSummaries.length !== PLAYWRIGHT_PROJECT_IDS.length ||
    report.resultRecordSha256 !== result.recordSha256 ||
    report.observationSequenceSha256 !== result.observationSequenceSha256 ||
    report.result !== result.result || report.exitCode !== result.exitCode ||
    report.recordSha256 !== projectedDigest(report, "recordSha256")
  ) fail("REAL_BROWSER_REPORT", "browser report identity differs")
  for (let index = 0; index < PLAYWRIGHT_PROJECT_IDS.length; index += 1) {
    const projectId = PLAYWRIGHT_PROJECT_IDS[index]
    const summary = report.projectSummaries[index]
    const projectObservations = result.observations.filter((observation) => observation.projectId === projectId)
    const passed = projectObservations.filter((observation) => observation.result === "passed").length
    const failed = projectObservations.length - passed
    exactKeys(summary, BROWSER_PROJECT_SUMMARY_FIELDS, "REAL_BROWSER_REPORT", "browser project summary")
    validateRecordMetadata(summary, "REAL_BROWSER_REPORT", "browser project summary")
    if (
      summary.projectId !== projectId || summary.expectedCaseCount !== contexts.length ||
      summary.passedCaseCount !== passed || summary.failedCaseCount !== failed ||
      summary.skippedCaseCount !== 0 || summary.status !== (failed === 0 ? "passed" : "failed")
    ) fail("REAL_BROWSER_REPORT", "browser project summary differs")
  }
}

const validatePinnedBrowserProvider = (executionBaseSha, cwd, cache) => {
  for (const [label, path, expectedBlob] of [
    ["harness", PUBLIC_BROWSER_PROVIDER_CONTRACT.harnessPath, PUBLIC_BROWSER_PROVIDER_CONTRACT.harnessGitBlobSha],
    ["reporter", PUBLIC_BROWSER_PROVIDER_CONTRACT.reporterPath, PUBLIC_BROWSER_PROVIDER_CONTRACT.reporterGitBlobSha]
  ]) {
    if (!SHA_40.test(expectedBlob ?? "")) {
      fail("REAL_BROWSER_PROVIDER", `public browser ${label} dependency slot is unresolved`)
    }
    const key = `browser-provider:${path}:${expectedBlob}`
    if (cache.has(key)) continue
    let bytes
    let resolvedBlob
    try {
      bytes = execFileSync("git", ["show", `${executionBaseSha}:${path}`], {
        cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: GIT_MAX_BUFFER
      })
      resolvedBlob = gitOutput(["rev-parse", `${executionBaseSha}:${path}`], cwd)
    } catch {
      fail("REAL_BROWSER_PROVIDER", `public browser ${label} source is missing`)
    }
    validateImplementationSource(bytes, `public browser ${label}`)
    if (resolvedBlob !== expectedBlob || gitBlobSha(bytes) !== expectedBlob) {
      fail("REAL_BROWSER_PROVIDER", `public browser ${label} source differs`)
    }
    cache.set(key, bytes)
  }
}

const validateBrowserEvidence = (
  proof, entry, row, providerCommit, executionBaseSha, cwd, implementationCache, uniqueProofState
) => {
  validatePinnedBrowserProvider(executionBaseSha, cwd, implementationCache)
  const evidence = proof.browserEvidence
  exactKeys(evidence, BROWSER_EVIDENCE_FIELDS, "REAL_BROWSER_EVIDENCE", "browser evidence coordinate")
  validateRecordMetadata(evidence, "REAL_BROWSER_EVIDENCE", "browser evidence coordinate")
  const contract = browserCaseContract(row, entry)
  const expectedResultPath = `apps/site/test-results/plan008/${entry.executionCaseId}.result.json`
  const expectedReportPath = `apps/site/test-results/plan008/${entry.executionCaseId}.report.json`
  if (
    evidence.evidenceVersion !== PUBLIC_BROWSER_PROVIDER_CONTRACT.version ||
    evidence.runnerId !== PUBLIC_BROWSER_PROVIDER_CONTRACT.runnerId ||
    evidence.runnerVersion !== PUBLIC_BROWSER_PROVIDER_CONTRACT.runnerVersion ||
    evidence.reporterId !== PUBLIC_BROWSER_PROVIDER_CONTRACT.reporterId ||
    evidence.deviceEvidence !== "desktop-browser-automation-only" ||
    evidence.realDeviceEvidence !== false || evidence.emittedAssistiveTechnologyEvidence !== false ||
    evidence.caseId !== entry.executionCaseId || evidence.caseTitle !== contract.caseTitle ||
    evidence.implementationPath !== entry.implementationPath ||
    evidence.implementationGitBlobSha !== entry.implementationBlobSha ||
    evidence.harnessPath !== PUBLIC_BROWSER_PROVIDER_CONTRACT.harnessPath ||
    evidence.harnessGitBlobSha !== PUBLIC_BROWSER_PROVIDER_CONTRACT.harnessGitBlobSha ||
    evidence.reporterPath !== PUBLIC_BROWSER_PROVIDER_CONTRACT.reporterPath ||
    evidence.reporterGitBlobSha !== PUBLIC_BROWSER_PROVIDER_CONTRACT.reporterGitBlobSha ||
    canonicalJson(evidence.projectIds) !== canonicalJson(PLAYWRIGHT_PROJECT_IDS) ||
    evidence.contextContractSha256 !== sha256Canonical(contract) ||
    evidence.resultPath !== expectedResultPath || evidence.reportPath !== expectedReportPath
  ) fail("REAL_BROWSER_EVIDENCE", "browser evidence coordinate differs")
  for (const [path, digest, blob, label] of [
    [evidence.resultPath, evidence.resultSha256, evidence.resultGitBlobSha, "browser result"],
    [evidence.reportPath, evidence.reportSha256, evidence.reportGitBlobSha, "browser report"]
  ]) {
    assertSafeRepositoryPath(path, "REAL_BROWSER_EVIDENCE", `${label} path`)
    assertHash(digest, "REAL_BROWSER_EVIDENCE", `${label} SHA-256`)
    assertGitSha(blob, "REAL_BROWSER_EVIDENCE", `${label} Git blob`)
  }
  const resultArtifact = readCommittedCanonicalJson({
    commit: providerCommit,
    path: evidence.resultPath,
    sha256: evidence.resultSha256,
    gitBlobSha: evidence.resultGitBlobSha
  }, executionBaseSha, cwd, "REAL_BROWSER_RESULT", "browser result")
  const reportArtifact = readCommittedCanonicalJson({
    commit: providerCommit,
    path: evidence.reportPath,
    sha256: evidence.reportSha256,
    gitBlobSha: evidence.reportGitBlobSha
  }, executionBaseSha, cwd, "REAL_BROWSER_REPORT", "browser report")
  validateBrowserResultAndReport(resultArtifact.value, reportArtifact.value, row, entry)
  if (
    proof.capturedResult.browserResultSha256 !== evidence.resultSha256 ||
    proof.capturedResult.browserReportSha256 !== evidence.reportSha256
  ) fail("REAL_BROWSER_EVIDENCE", "captured result does not bind browser result and report bytes")
  for (const [setName, value] of [
    ["browserResultPaths", evidence.resultPath], ["browserReportPaths", evidence.reportPath],
    ["browserResultDigests", evidence.resultSha256], ["browserReportDigests", evidence.reportSha256],
    ["browserResultBlobs", evidence.resultGitBlobSha], ["browserReportBlobs", evidence.reportGitBlobSha]
  ]) {
    const set = uniqueProofState[setName]
    if (set.has(value)) fail("REAL_BROWSER_REUSE", "browser result or report coordinate is reused")
    set.add(value)
  }
  return {
    result: resultArtifact.value,
    report: reportArtifact.value,
    output: `${canonicalJson({ report: reportArtifact.value, result: resultArtifact.value })}\n`
  }
}

const resultEntryDigest = (entry) => sha256Canonical(
  Object.fromEntries(Object.entries(entry).filter(([key]) => key !== "entrySha256"))
)
const resultEntrySequenceSha256 = (entries) => sha256Canonical(entries.map((entry) => entry.entrySha256))
const projectedDigest = (record, digestField) => sha256Canonical(
  Object.fromEntries(Object.entries(record).filter(([key]) => key !== digestField))
)

const automatedResultManifestCoordinateRoot = (runs) => sha256Canonical(runs.map((run) => ({
  runId: run.runId,
  commit: run.resultManifestCommit,
  path: run.resultManifestPath,
  sha256: run.resultManifestSha256,
  gitBlobSha: run.resultManifestGitBlobSha
})))

const firstPassArtifactCoordinateRoot = (bundle) => sha256Canonical(bundle.firstPassReceipts.map((receipt) => ({
  receiptId: receipt.receiptId,
  commit: bundle.firstPassReceiptSeal.commit,
  path: receipt.firstPassArtifactPath,
  sha256: receipt.firstPassArtifactSha256,
  gitBlobSha: receipt.firstPassArtifactGitBlobSha
})))

const readCommittedCanonicalJson = ({
  commit, path, sha256, gitBlobSha: expectedGitBlobSha
}, executionBaseSha, cwd, code, label, relation = "descendant") => {
  if (!SHA_40.test(commit) || !isSafeRepositoryPath(path)) fail(code, `${label} coordinate is invalid`)
  assertHash(sha256, code, `${label} SHA-256`)
  assertGitSha(expectedGitBlobSha, code, `${label} Git blob`)
  let type
  let raw
  let resolvedBlob
  try {
    type = gitOutput(["cat-file", "-t", commit], cwd)
    raw = execFileSync("git", ["show", `${commit}:${path}`], {
      cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: GIT_MAX_BUFFER
    })
    resolvedBlob = gitOutput(["rev-parse", `${commit}:${path}`], cwd)
  } catch {
    fail(code, `${label} commit or path is missing`)
  }
  const treeEntry = assertRegularGitPath(commit, path, cwd, code, label)
  const provenanceValid = relation === "ancestor"
    ? commit !== executionBaseSha && isAncestor(commit, executionBaseSha, cwd)
    : relation === "descendant"
      ? commit !== executionBaseSha && isAncestor(executionBaseSha, commit, cwd)
      : false
  if (
    type !== "commit" || !provenanceValid || sha256Text(raw) !== sha256 ||
    gitBlobSha(raw) !== expectedGitBlobSha || resolvedBlob !== expectedGitBlobSha ||
    treeEntry.blobSha !== expectedGitBlobSha ||
    gitOutput(["cat-file", "-t", resolvedBlob], cwd) !== "blob"
  ) fail(code, `${label} provenance differs`)
  const value = parseJsonNoDuplicateKeys(raw, label)
  validateSafeTree(value, label)
  validateCanonicalJsonBytes(raw, value, code, label)
  return { value, raw }
}

const validatePublicBrowserImplementationBytes = (bytes, expected, entry) => {
  validateImplementationSource(bytes, "public browser implementation")
  if (
    entry.implementationPath !== expectedPublicBrowserImplementationPath(entry) ||
    bytes !== expectedPublicBrowserImplementationBytes(expected, entry)
  ) fail("REAL_BROWSER_IMPLEMENTATION", "public browser implementation differs from the closed generated Playwright case")
}

const validateImplementation = (entry, expected, executionBaseSha, cwd, capability, cache) => {
  if (!/^P008-IMPL-[0-9]{4}$/.test(entry.implementationId) || !isSafeRepositoryPath(entry.implementationPath)) {
    fail("REAL_RESULT_ENTRY", "assertion implementation coordinate is invalid")
  }
  assertGitSha(entry.implementationBlobSha, "REAL_RESULT_ENTRY", "assertion implementation blob")
  const key = `${entry.implementationPath}:${entry.implementationBlobSha}`
  let bytes = cache.get(key)
  if (bytes === undefined) {
    let resolvedBlob
    try {
      bytes = execFileSync("git", ["show", `${executionBaseSha}:${entry.implementationPath}`], {
        cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: GIT_MAX_BUFFER
      })
      resolvedBlob = gitOutput(["rev-parse", `${executionBaseSha}:${entry.implementationPath}`], cwd)
    } catch {
      fail("REAL_RESULT_ENTRY", "assertion implementation source is missing")
    }
    if (resolvedBlob !== entry.implementationBlobSha || gitBlobSha(bytes) !== entry.implementationBlobSha) {
      fail("REAL_RESULT_ENTRY", "assertion implementation source blob differs")
    }
    cache.set(key, bytes)
  }
  const lines = bytes.split(/\r?\n/u).filter((line) => line.length > 0)
  validateImplementationSource(bytes)
  if (
    lines.length === 0 || lines.every((line) => /^P008-IMPL-[0-9]{4}$/u.test(line)) ||
    !bytes.includes(JSON.stringify(entry.implementationId)) ||
    !bytes.includes(JSON.stringify(entry.executionCaseId))
  ) {
    fail("REAL_RESULT_ENTRY", "assertion implementation is not an executable case source")
  }
  if (capability === SELF_TEST_CAPABILITY) {
    if (!entry.implementationPath.endsWith(".mjs") || !bytes.startsWith("#!/usr/bin/env node\n")) {
      fail("REAL_RESULT_ENTRY", "isolated implementation is not an executable fixture case")
    }
  } else if (entry.providerKind === "automated-result-manifest") {
    const browserSource = entry.providerId === "browser-matrix" && /\.pw\.ts$/u.test(entry.implementationPath)
    const repositorySource = entry.providerId === "repository-verify" && /\.(?:test|spec)\.tsx?$|\.mjs$/u.test(entry.implementationPath)
    if (!browserSource && !repositorySource) {
      fail("REAL_RESULT_ENTRY", "public automated implementation class differs")
    }
    if (browserSource) {
      validatePublicBrowserImplementationBytes(bytes, expected, entry)
    }
  }
  return bytes
}

const validateRequirementProof = (
  entry,
  expected,
  providerCommit,
  expectedMode,
  executionBaseSha,
  cwd,
  capability,
  implementationCache,
  uniqueProofState
) => {
  const { value: proof } = readCommittedCanonicalJson({
    commit: providerCommit,
    path: entry.proofPath,
    sha256: entry.proofSha256,
    gitBlobSha: entry.proofGitBlobSha
  }, executionBaseSha, cwd, "REAL_REQUIREMENT_PROOF", "per-requirement proof artifact")
  exactKeys(proof, EVIDENCE_BUNDLE_CONTRACT.requirementProofFields, "REAL_REQUIREMENT_PROOF", "per-requirement proof artifact")
  exactKeys(proof.capturedResult, EVIDENCE_BUNDLE_CONTRACT.capturedResultFields, "REAL_REQUIREMENT_PROOF", "captured result")
  if (!Array.isArray(proof.capturedResult.bindingResults)) {
    fail("REAL_REQUIREMENT_PROOF", "captured binding results are missing")
  }
  proof.capturedResult.bindingResults.forEach((binding) => {
    exactKeys(binding, EVIDENCE_BUNDLE_CONTRACT.bindingResultFields, "REAL_REQUIREMENT_PROOF", "captured binding result")
    validateRecordMetadata(binding, "REAL_REQUIREMENT_PROOF", "captured binding result")
  })
  validateRecordMetadata(proof, "REAL_REQUIREMENT_PROOF", "per-requirement proof artifact")
  validateRecordMetadata(proof.capturedResult, "REAL_REQUIREMENT_PROOF", "captured result")
  const expectedExecutionClass = capability === SELF_TEST_CAPABILITY
    ? "isolated-executable-structural-fixture"
    : expected.providerKind === "codex-first-pass-artifact"
      ? "codex-native-first-pass-review"
      : expected.providerId === "browser-matrix"
        ? "browser-case"
        : "repository-command-case"
  const expectedCommandId = expected.providerKind === "codex-first-pass-artifact"
    ? "codex-native-review"
    : expected.providerId
  const expectedCommandArgv = capability === SELF_TEST_CAPABILITY
    ? ["node", entry.implementationPath]
    : expected.providerKind === "codex-first-pass-artifact"
      ? ["codex-native-review", entry.implementationPath, entry.executionCaseId]
      : expected.providerId === "browser-matrix"
        ? expectedPublicBrowserCommandArgv(expected, entry)
        : ["bun", entry.implementationPath, "--case", entry.executionCaseId, "--json"]
  const expectedActualOutcome = entry.result === "passed" ? "satisfied" : "not-satisfied"
  if (
    proof.schemaVersion !== 1 ||
    proof.proofId !== expected.assertionContractId.replace("P008-AST-", "P008-PROOF-") ||
    proof.evidenceMode !== expectedMode || proof.executionClass !== expectedExecutionClass ||
    proof.assertionId !== expected.assertionContractId ||
    proof.assertionContractId !== expected.assertionContractId ||
    proof.requirementId !== expected.requirementId || proof.coverageCellId !== expected.coverageCellId ||
    proof.authorityAtomId !== expected.authorityAtomId ||
    canonicalJson(proof.authorityClauseIds) !== canonicalJson(expected.authorityClauseIds) ||
    canonicalJson(proof.authorityBindingIds) !== canonicalJson(expected.authorityBindingIds) ||
    canonicalJson(proof.authorityRouteScopes) !== canonicalJson(expected.authorityRouteScopes) ||
    proof.providerKind !== expected.providerKind || proof.providerId !== expected.providerId ||
    proof.executionCaseId !== entry.executionCaseId || proof.commandId !== expectedCommandId ||
    canonicalJson(proof.commandArgv) !== canonicalJson(expectedCommandArgv) ||
    proof.commandArgvSha256 !== sha256Canonical(proof.commandArgv) ||
    proof.exitCode !== (entry.result === "passed" ? 0 : 1) ||
    proof.sourceClauseId !== expected.sourceClauseId || proof.sourcePath !== expected.sourcePath ||
    proof.sourceBlobSha !== expected.sourceBlobSha || proof.implementationId !== entry.implementationId ||
    proof.implementationPath !== entry.implementationPath || proof.implementationBlobSha !== entry.implementationBlobSha ||
    proof.capturedResult.caseId !== entry.executionCaseId ||
    proof.capturedResult.assertionKind !== expected.requirementKind ||
    proof.capturedResult.subjectId !== expected.targetId ||
    proof.capturedResult.expectedOutcome !== "satisfied" ||
    proof.capturedResult.actualOutcome !== expectedActualOutcome ||
    proof.capturedResult.statusCode !== proof.exitCode ||
    canonicalJson(proof.capturedResult.bindingResults) !== canonicalJson(expected.authorityBindingIds.map((bindingId, index) => withRecordMetadata({
      bindingId,
      routeScope: expected.authorityRouteScopes[index],
      status: expectedActualOutcome
    }))) ||
    proof.capturedResultSha256 !== sha256Text(`${canonicalJson(proof.capturedResult)}\n`) ||
    proof.proofRecordSha256 !== projectedDigest(proof, "proofRecordSha256")
  ) fail("REAL_REQUIREMENT_PROOF", "per-requirement proof does not match its executed assertion class")
  const isPublicBrowser = capability !== SELF_TEST_CAPABILITY && expected.providerId === "browser-matrix"
  if (isPublicBrowser) {
    if (!isRecord(proof.browserEvidence)) fail("REAL_BROWSER_EVIDENCE", "public browser proof is missing browser evidence")
  } else if (
    proof.browserEvidence !== null || proof.capturedResult.browserResultSha256 !== null ||
    proof.capturedResult.browserReportSha256 !== null
  ) fail("REAL_REQUIREMENT_PROOF", "non-browser proof contains browser evidence")
  assertSafeRepositoryPath(proof.sourcePath, "REAL_REQUIREMENT_PROOF", "proof source path")
  assertSafeRepositoryPath(proof.implementationPath, "REAL_REQUIREMENT_PROOF", "proof implementation path")
  if (
    uniqueProofState.paths.has(entry.proofPath) ||
    uniqueProofState.fileDigests.has(entry.proofSha256) ||
    uniqueProofState.blobs.has(entry.proofGitBlobSha) ||
    uniqueProofState.caseIds.has(entry.executionCaseId) ||
    uniqueProofState.outputs.has(proof.capturedResultSha256) ||
    uniqueProofState.implementationPaths.has(entry.implementationPath) ||
    uniqueProofState.implementationBlobs.has(entry.implementationBlobSha)
  ) fail("REAL_REQUIREMENT_PROOF_REUSE", "per-requirement proof artifact or execution result is reused")
  uniqueProofState.paths.add(entry.proofPath)
  uniqueProofState.fileDigests.add(entry.proofSha256)
  uniqueProofState.blobs.add(entry.proofGitBlobSha)
  uniqueProofState.caseIds.add(entry.executionCaseId)
  uniqueProofState.outputs.add(proof.capturedResultSha256)
  uniqueProofState.implementationPaths.add(entry.implementationPath)
  uniqueProofState.implementationBlobs.add(entry.implementationBlobSha)
  const implementationBytes = validateImplementation(
    entry, expected, executionBaseSha, cwd, capability, implementationCache
  )
  const browserArtifacts = isPublicBrowser
    ? validateBrowserEvidence(
        proof, entry, expected, providerCommit, executionBaseSha, cwd, implementationCache, uniqueProofState
      )
    : null
  const expectedObservationSha256 = browserArtifacts === null
    ? proof.capturedResultSha256
    : proof.browserEvidence.resultSha256
  if (entry.observationSha256 !== expectedObservationSha256) {
    fail("REAL_REQUIREMENT_PROOF", "observation digest differs from the executed assertion output")
  }
  if (capability === SELF_TEST_CAPABILITY || expected.providerKind === "automated-result-manifest") {
    const command = capability === SELF_TEST_CAPABILITY ? process.execPath : proof.commandArgv[0]
    const commandArgs = capability === SELF_TEST_CAPABILITY
      ? [join(cwd, entry.implementationPath)]
      : proof.commandArgv.slice(1)
    const execution = spawnSync(command, commandArgs, {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      env: isPublicBrowser
        ? { ...process.env, PLAN008_BASE_URL: PUBLIC_BROWSER_PROVIDER_CONTRACT.baseUrl }
        : process.env
    })
    if (execution.error || execution.status !== proof.exitCode) {
      fail("REAL_REQUIREMENT_PROOF", "executable proof case failed to run")
    }
    const expectedStdout = browserArtifacts?.output ?? `${canonicalJson(proof.capturedResult)}\n`
    if (
      execution.stdout !== expectedStdout ||
      (!isPublicBrowser && !implementationBytes.includes(canonicalJson(proof.capturedResult)))
    ) {
      fail(isPublicBrowser ? "REAL_BROWSER_RUNNER" : "REAL_REQUIREMENT_PROOF", "executable output differs from committed result bytes")
    }
  }
}

const validateResultEntry = (
  entry,
  expected,
  providerCommit,
  expectedMode,
  executionBaseSha,
  cwd,
  capability,
  implementationCache,
  uniqueProofState
) => {
  exactKeys(entry, EVIDENCE_BUNDLE_CONTRACT.resultEntryFields, "REAL_RESULT_ENTRY", "result entry")
  validateRecordMetadata(entry, "REAL_RESULT_ENTRY", "result entry")
  const expectedImplementationId = expected.assertionContractId.replace("P008-AST-", "P008-IMPL-")
  if (
    entry.assertionId !== expected.assertionContractId ||
    entry.assertionContractId !== expected.assertionContractId ||
    entry.requirementId !== expected.requirementId ||
    entry.coverageCellId !== expected.coverageCellId ||
    entry.authorityAtomId !== expected.authorityAtomId ||
    canonicalJson(entry.authorityClauseIds) !== canonicalJson(expected.authorityClauseIds) ||
    canonicalJson(entry.authorityBindingIds) !== canonicalJson(expected.authorityBindingIds) ||
    canonicalJson(entry.authorityRouteScopes) !== canonicalJson(expected.authorityRouteScopes) ||
    entry.providerKind !== expected.providerKind || entry.providerId !== expected.providerId ||
    entry.sourceClauseId !== expected.sourceClauseId || entry.sourcePath !== expected.sourcePath ||
    entry.sourceBlobSha !== expected.sourceBlobSha || entry.implementationId !== expectedImplementationId ||
    entry.executionCaseId !== expected.assertionContractId.replace("P008-AST-", "P008-CASE-") ||
    !isSafeRepositoryPath(entry.proofPath) || entry.observationKind !== observationKindFor(expected) ||
    !["passed", "failed"].includes(entry.result)
  ) fail("REAL_RESULT_ENTRY", "result entry differs from its exact assertion contract")
  assertHash(entry.proofSha256, "REAL_RESULT_ENTRY", "per-requirement proof SHA-256")
  assertGitSha(entry.proofGitBlobSha, "REAL_RESULT_ENTRY", "per-requirement proof Git blob")
  validateRequirementProof(
    entry,
    expected,
    providerCommit,
    expectedMode,
    executionBaseSha,
    cwd,
    capability,
    implementationCache,
    uniqueProofState
  )
  if (entry.entrySha256 !== resultEntryDigest(entry)) {
    fail("REAL_RESULT_ENTRY", "result entry digest differs")
  }
}

const validateEnvironmentsAndRuns = (bundle, requirementRows, dependencyInterface, cwd, capability) => {
  validateOrderedRecords(bundle.environmentObservations, "environmentId", "REAL_ENVIRONMENT", "environment records")
  validateOrderedRecords(bundle.automatedRuns, "runId", "REAL_AUTOMATION", "automated runs")
  if (bundle.environmentObservations.length !== 4 || bundle.automatedRuns.length !== 4) {
    fail("REAL_AUTOMATION", "exactly four environment and run records are required")
  }
  const environmentsById = new Map()
  for (const environment of bundle.environmentObservations) {
    validateRecordShapeAndDigest("environmentObservation", environment)
    if (!COMMAND_IDS.includes(environment.commandId)) fail("REAL_ENVIRONMENT", "environment command ID differs")
    const expected = expectedEnvironmentValues[environment.commandId]
    if (
      environment.environmentId !== expected.environmentId ||
      environment.runtimeId !== expected.runtimeId ||
      canonicalJson(environment.browserProfiles) !== canonicalJson(expected.browserProfiles) ||
      environment.host !== "127.0.0.1" || environment.externalRequestsObserved !== 0
    ) fail("REAL_ENVIRONMENT", "environment observation differs from the exact command contract")
    assertHash(environment.toolchainManifestSha256, "REAL_ENVIRONMENT", "toolchain manifest SHA-256")
    environmentsById.set(environment.environmentId, environment)
  }
  const runsById = new Map()
  const entriesByAssertionId = new Map()
  const implementationCache = new Map()
  const uniqueProofState = {
    paths: new Set(), fileDigests: new Set(), blobs: new Set(),
    caseIds: new Set(), outputs: new Set(),
    implementationPaths: new Set(), implementationBlobs: new Set(),
    browserResultPaths: new Set(), browserReportPaths: new Set(),
    browserResultDigests: new Set(), browserReportDigests: new Set(),
    browserResultBlobs: new Set(), browserReportBlobs: new Set()
  }
  const entryDigests = new Set()
  const observationDigests = new Set()
  const expectedMode = capability === SELF_TEST_CAPABILITY
    ? EVIDENCE_BUNDLE_CONTRACT.privateFixtureEvidenceMode
    : EVIDENCE_BUNDLE_CONTRACT.publicEvidenceMode
  for (const run of bundle.automatedRuns) {
    validateRecordShapeAndDigest("automatedRun", run)
    if (
      !COMMAND_IDS.includes(run.commandId) || run.runId !== expectedRunId(run.commandId) ||
      run.environmentId !== expectedEnvironmentValues[run.commandId].environmentId ||
      !environmentsById.has(run.environmentId) ||
      run.commandContractSha256 !== commandContractSha256()
    ) fail("REAL_AUTOMATION", "automated run differs from the exact command contract")
    assertUniqueStrings(run.assertionIds, "REAL_AUTOMATION", "run assertion IDs", true)
    assertHash(run.assertionResultSequenceSha256, "REAL_AUTOMATION", "run assertion-result sequence")
    const artifact = readCommittedCanonicalJson({
      commit: run.resultManifestCommit,
      path: run.resultManifestPath,
      sha256: run.resultManifestSha256,
      gitBlobSha: run.resultManifestGitBlobSha
    }, dependencyInterface.executionBaseSha, cwd, "REAL_RESULT_MANIFEST", "automated result manifest")
    const manifest = artifact.value
    exactKeys(
      manifest,
      EVIDENCE_BUNDLE_CONTRACT.automatedResultManifestFields,
      "REAL_RESULT_MANIFEST",
      "automated result manifest"
    )
    validateRecordMetadata(manifest, "REAL_RESULT_MANIFEST", "automated result manifest")
    const expectedRows = requirementRows.filter((row) =>
      row.providerKind === "automated-result-manifest" && row.providerId === run.commandId
    )
    if (
      manifest.schemaVersion !== 1 || manifest.manifestId !== `P008-RESULT-${run.runId}` ||
      manifest.evidenceMode !== expectedMode || manifest.runId !== run.runId ||
      manifest.commandId !== run.commandId ||
      manifest.executionBaseSha !== dependencyInterface.executionBaseSha ||
      manifest.commandContractSha256 !== commandContractSha256() ||
      manifest.toolchainManifestSha256 !== environmentsById.get(run.environmentId).toolchainManifestSha256 ||
      manifest.assertionContractRootSha256 !== assertionContractRootSha256(requirementRows) ||
      !Array.isArray(manifest.assertionResults)
    ) fail("REAL_RESULT_MANIFEST", "automated result manifest identity differs")
    const expectedIds = expectedRows.map((row) => row.assertionContractId)
    exactValue(manifest.assertionResults.map((entry) => entry.assertionId), expectedIds, "REAL_RESULT_MANIFEST", "manifest assertion order")
    for (let index = 0; index < expectedRows.length; index += 1) {
      const entry = manifest.assertionResults[index]
      validateResultEntry(
        entry,
        expectedRows[index],
        run.resultManifestCommit,
        expectedMode,
        dependencyInterface.executionBaseSha,
        cwd,
        capability,
        implementationCache,
        uniqueProofState
      )
      if (entryDigests.has(entry.entrySha256) || observationDigests.has(entry.observationSha256)) {
        fail("REAL_RESULT_REUSE", "result entry or observation digest is reused")
      }
      entryDigests.add(entry.entrySha256)
      observationDigests.add(entry.observationSha256)
      entriesByAssertionId.set(entry.assertionId, {
        entry,
        providerArtifactSha256: run.resultManifestSha256
      })
    }
    const failed = manifest.assertionResults.filter((entry) => entry.result === "failed").length
    const passed = manifest.assertionResults.length - failed
    const expectedResult = failed === 0 ? "passed" : "failed"
    if (
      canonicalJson(manifest.counts) !== canonicalJson({ assertions: expectedRows.length, passed, failed }) ||
      manifest.assertionResultSequenceSha256 !== resultEntrySequenceSha256(manifest.assertionResults) ||
      manifest.manifestSha256 !== projectedDigest(manifest, "manifestSha256") ||
      manifest.exitCode !== (failed === 0 ? 0 : 1) || manifest.result !== expectedResult ||
      run.result !== expectedResult || run.assertionResultSequenceSha256 !== manifest.assertionResultSequenceSha256
    ) fail("REAL_RESULT_MANIFEST", "automated result manifest result closure differs")
    exactValue(run.assertionIds, expectedIds, "REAL_AUTOMATION", "run assertion inverse mapping")
    runsById.set(run.runId, run)
  }
  const expectedAutomatedIds = requirementRows
    .filter((row) => row.providerKind === "automated-result-manifest")
    .map((row) => row.assertionContractId)
  exactSet([...entriesByAssertionId.keys()], expectedAutomatedIds, "REAL_AUTOMATION", "automated assertion provider set")
  return {
    runsById,
    entriesByAssertionId,
    entryDigests,
    observationDigests,
    uniqueProofState,
    manifestCommits: bundle.automatedRuns.map((run) => run.resultManifestCommit),
    coordinateRootSha256: automatedResultManifestCoordinateRoot(bundle.automatedRuns)
  }
}

const validateAssertionCoverageSkeleton = (bundle, requirementRows) => {
  validateOrderedRecords(bundle.assertions, "assertionId", "REAL_ASSERTION", "assertion records")
  validateOrderedRecords(bundle.coverageCells, "coverageCellId", "REAL_COVERAGE", "coverage cells")
  if (bundle.assertions.length !== requirementRows.length || bundle.coverageCells.length !== requirementRows.length) {
    fail("REAL_COVERAGE", "assertion and coverage cardinality differs from the exact requirement set")
  }
  const assertionsById = new Map()
  const outputDigests = new Set()
  for (let index = 0; index < requirementRows.length; index += 1) {
    const expected = requirementRows[index]
    const assertion = bundle.assertions[index]
    validateRecordShapeAndDigest("requirementAssertion", assertion)
    if (
      assertion.assertionId !== expected.assertionContractId ||
      assertion.assertionContractId !== expected.assertionContractId ||
      assertion.requirementId !== expected.requirementId ||
      assertion.coverageCellId !== expected.coverageCellId ||
      assertion.authorityAtomId !== expected.authorityAtomId ||
      canonicalJson(assertion.authorityClauseIds) !== canonicalJson(expected.authorityClauseIds) ||
      canonicalJson(assertion.authorityBindingIds) !== canonicalJson(expected.authorityBindingIds) ||
      canonicalJson(assertion.authorityRouteScopes) !== canonicalJson(expected.authorityRouteScopes) ||
      assertion.providerKind !== expected.providerKind || assertion.providerId !== expected.providerId ||
      !["passed", "failed"].includes(assertion.result) ||
      assertion.sourcePath !== expected.sourcePath ||
      assertion.sourceBlobSha !== expected.sourceBlobSha ||
      assertion.sourceClauseId !== expected.sourceClauseId
    ) fail("REAL_ASSERTION", "per-requirement assertion binding differs")
    assertHash(assertion.providerArtifactSha256, "REAL_ASSERTION", "assertion provider artifact digest")
    assertHash(assertion.providerEntrySha256, "REAL_ASSERTION", "assertion provider entry digest")
    assertHash(assertion.deterministicOutputSha256, "REAL_ASSERTION", "assertion output digest")
    if (outputDigests.has(assertion.deterministicOutputSha256)) {
      fail("REAL_ASSERTION_REUSE", "assertion output digest is reused")
    }
    outputDigests.add(assertion.deterministicOutputSha256)
    assertionsById.set(assertion.assertionId, assertion)
  }

  const cellsById = new Map()
  for (let index = 0; index < requirementRows.length; index += 1) {
    const expected = requirementRows[index]
    const cell = bundle.coverageCells[index]
    const assertion = assertionsById.get(expected.assertionContractId)
    validateRecordShapeAndDigest("coverageCell", cell)
    if (
      cell.coverageCellId !== expected.coverageCellId ||
      cell.requirementId !== expected.requirementId ||
      cell.journeyId !== expected.journeyId ||
      cell.requirementKind !== expected.requirementKind ||
      cell.targetId !== expected.targetId ||
      cell.sourceClauseId !== expected.sourceClauseId ||
      cell.authorityAtomId !== expected.authorityAtomId ||
      canonicalJson(cell.authorityClauseIds) !== canonicalJson(expected.authorityClauseIds) ||
      canonicalJson(cell.authorityBindingIds) !== canonicalJson(expected.authorityBindingIds) ||
      canonicalJson(cell.authorityRouteScopes) !== canonicalJson(expected.authorityRouteScopes) ||
      cell.ownerLaneId !== expected.ownerLaneId ||
      cell.applicable !== true ||
      cell.assertionId !== assertion.assertionId ||
      cell.assertionRecordSha256 !== assertion.recordSha256 ||
      cell.result !== assertion.result ||
      (cell.result === "passed" && cell.blockingFindingId !== null) ||
      (cell.result === "failed" && typeof cell.blockingFindingId !== "string")
    ) fail("REAL_COVERAGE", "coverage cell differs from its exact requirement and assertion")
    cellsById.set(cell.coverageCellId, cell)
  }
  return { assertionsById, cellsById }
}

const validateAssertionsAndCoverage = (bundle, requirementRows, providerEntries) => {
  const skeleton = validateAssertionCoverageSkeleton(bundle, requirementRows)
  for (const assertion of bundle.assertions) {
    const provider = providerEntries.get(assertion.assertionId)
    if (
      provider === undefined || assertion.providerArtifactSha256 !== provider.providerArtifactSha256 ||
      assertion.providerEntrySha256 !== provider.entry.entrySha256 ||
      assertion.implementationId !== provider.entry.implementationId ||
      assertion.implementationPath !== provider.entry.implementationPath ||
      assertion.implementationBlobSha !== provider.entry.implementationBlobSha ||
      assertion.executionCaseId !== provider.entry.executionCaseId ||
      assertion.proofPath !== provider.entry.proofPath ||
      assertion.proofSha256 !== provider.entry.proofSha256 ||
      assertion.proofGitBlobSha !== provider.entry.proofGitBlobSha ||
      assertion.observationKind !== provider.entry.observationKind ||
      assertion.result !== provider.entry.result ||
      assertion.deterministicOutputSha256 !== provider.entry.observationSha256
    ) fail("REAL_ASSERTION", "assertion does not derive from its committed provider entry")
  }
  exactSet([...providerEntries.keys()], requirementRows.map((row) => row.assertionContractId), "REAL_ASSERTION", "assertion provider closure")
  return skeleton
}

const validateFindingsAndFailureCoupling = (bundle, requirementRows, cellsById) => {
  validateOrderedRecords(bundle.findings, "findingId", "REAL_FINDING", "findings", true)
  const findingsById = new Map()
  for (const finding of bundle.findings) {
    validateRecordShapeAndDigest("finding", finding)
    if (
      !/^P008-FIND-[0-9]{4}$/.test(finding.findingId) ||
      !LANE_IDS.includes(finding.laneId) ||
      finding.agentId !== AGENT_ID_BY_LANE[finding.laneId] ||
      !["critical", "high"].includes(finding.severity) ||
      finding.status !== "open" || finding.releaseBlocking !== true ||
      finding.recommendation !== "do-not-recommend" ||
      finding.reproductionTaskContractSha256 !== LANE_CONTRACTS.find((lane) => lane.laneId === finding.laneId).taskContractSha256
    ) fail("REAL_FINDING", "finding is not an exact open release blocker")
    const cell = cellsById.get(finding.coverageCellId)
    const requirement = requirementRows.find((row) => row.requirementId === finding.requirementId)
    if (
      cell === undefined || requirement === undefined || cell.result !== "failed" ||
      cell.requirementId !== finding.requirementId ||
      cell.sourceClauseId !== finding.sourceClauseId ||
      cell.authorityAtomId !== finding.authorityAtomId ||
      canonicalJson(cell.authorityClauseIds) !== canonicalJson(finding.authorityClauseIds) ||
      canonicalJson(cell.authorityBindingIds) !== canonicalJson(finding.authorityBindingIds) ||
      canonicalJson(cell.authorityRouteScopes) !== canonicalJson(finding.authorityRouteScopes) ||
      cell.ownerLaneId !== finding.laneId ||
      cell.blockingFindingId !== finding.findingId ||
      finding.sourcePath !== requirement.sourcePath ||
      finding.sourceBlobSha !== requirement.sourceBlobSha ||
      finding.authorityAtomId !== requirement.authorityAtomId ||
      canonicalJson(finding.authorityClauseIds) !== canonicalJson(requirement.authorityClauseIds) ||
      canonicalJson(finding.authorityBindingIds) !== canonicalJson(requirement.authorityBindingIds) ||
      canonicalJson(finding.authorityRouteScopes) !== canonicalJson(requirement.authorityRouteScopes)
    ) fail("FAILED_CELL_FINDING", "finding does not reciprocally match its failed coverage cell")
    if (findingsById.has(finding.findingId)) fail("REAL_FINDING", "finding ID is duplicated")
    findingsById.set(finding.findingId, finding)
  }
  for (const cell of bundle.coverageCells) {
    if (cell.result === "failed") {
      const finding = findingsById.get(cell.blockingFindingId)
      if (finding === undefined || finding.coverageCellId !== cell.coverageCellId) {
        fail("FAILED_CELL_FINDING", "failed coverage cell lacks its exact reciprocal blocker")
      }
    } else if (cell.blockingFindingId !== null) {
      fail("FAILED_CELL_FINDING", "passed coverage cell cannot carry a blocker")
    }
  }
  if (bundle.findings.length !== bundle.coverageCells.filter((cell) => cell.result === "failed").length) {
    fail("FAILED_CELL_FINDING", "failed cells and blocker findings are not one-to-one")
  }
  return findingsById
}

const UTC_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u

const validateReceipts = (bundle, manifest, contractRoot) => {
  validateOrderedRecords(bundle.taskReceipts, "receiptId", "REAL_RECEIPT", "task receipts")
  validateOrderedRecords(bundle.firstPassReceipts, "receiptId", "REAL_RECEIPT", "first-pass receipts")
  if (bundle.taskReceipts.length !== 3 || bundle.firstPassReceipts.length !== 3) {
    fail("REAL_RECEIPT", "exactly three task and first-pass receipts are required")
  }
  const taskById = new Map()
  const firstById = new Map()
  const nativePaths = new Set()
  const nativeDigests = new Set()
  const artifactPaths = new Set()
  const artifactDigests = new Set()
  for (let index = 0; index < LANE_IDS.length; index += 1) {
    const laneId = LANE_IDS[index]
    const lane = LANE_CONTRACTS[index]
    const receipt = bundle.taskReceipts[index]
    validateRecordShapeAndDigest("taskReceipt", receipt)
    if (
      receipt.receiptId !== `P008-TASK-REC-${String(index + 1).padStart(2, "0")}` ||
      receipt.laneId !== laneId || receipt.agentId !== AGENT_ID_BY_LANE[laneId] ||
      receipt.nativeTaskId !== AGENT_ID_BY_LANE[laneId] ||
      receipt.taskContractSha256 !== lane.taskContractSha256 ||
      receipt.promptSha256 !== lane.promptSha256 || receipt.rubricSha256 !== lane.rubricSha256 ||
      receipt.sourceContractSha256 !== contractRoot ||
      receipt.manifestSha256 !== manifest.manifestSha256 ||
      receipt.inputEvidenceRootSha256 !== manifest.inputEvidenceRootSha256 ||
      receipt.peerOutputsVisible !== false || !UTC_INSTANT.test(receipt.startedAtUtc) ||
      !Number.isFinite(Date.parse(receipt.startedAtUtc)) ||
      !isSafeRepositoryPath(receipt.nativeReceiptPath)
    ) fail("REAL_RECEIPT", "task receipt differs from its bound lane contract")
    assertHash(receipt.nativeReceiptSha256, "REAL_RECEIPT", "native task receipt digest")
    assertGitSha(receipt.nativeReceiptGitBlobSha, "REAL_RECEIPT", "native task receipt Git blob")
    if (nativePaths.has(receipt.nativeReceiptPath) || nativeDigests.has(receipt.nativeReceiptSha256)) {
      fail("REAL_RECEIPT", "native task receipt artifact is reused")
    }
    nativePaths.add(receipt.nativeReceiptPath)
    nativeDigests.add(receipt.nativeReceiptSha256)
    taskById.set(receipt.receiptId, receipt)

    const first = bundle.firstPassReceipts[index]
    validateRecordShapeAndDigest("firstPassReceipt", first)
    if (
      first.receiptId !== `P008-FIRST-PASS-${String(index + 1).padStart(2, "0")}` ||
      first.taskReceiptId !== receipt.receiptId || first.laneId !== laneId ||
      first.agentId !== AGENT_ID_BY_LANE[laneId] ||
      first.nativeTaskId !== receipt.nativeTaskId ||
      first.promptSha256 !== lane.promptSha256 || first.rubricSha256 !== lane.rubricSha256 ||
      first.sourceContractSha256 !== contractRoot || first.startedAtUtc !== receipt.startedAtUtc ||
      !UTC_INSTANT.test(first.completedAtUtc) ||
      !Number.isFinite(Date.parse(first.startedAtUtc)) ||
      !Number.isFinite(Date.parse(first.completedAtUtc)) ||
      Date.parse(first.startedAtUtc) >= Date.parse(first.completedAtUtc) ||
      !isSafeRepositoryPath(first.nativeReceiptPath) ||
      !Array.isArray(first.peerOutputIdsVisible) || first.peerOutputIdsVisible.length !== 0 ||
      first.peerOutputsVisible !== false || !isSafeRepositoryPath(first.firstPassArtifactPath)
    ) fail("REAL_FIRST_PASS", "first-pass receipt differs from the declared no-peer-visibility boundary")
    assertHash(first.firstPassArtifactSha256, "REAL_FIRST_PASS", "first-pass artifact digest")
    assertGitSha(first.firstPassArtifactGitBlobSha, "REAL_FIRST_PASS", "first-pass artifact Git blob")
    assertHash(first.nativeReceiptSha256, "REAL_FIRST_PASS", "native first-pass receipt digest")
    assertGitSha(first.nativeReceiptGitBlobSha, "REAL_FIRST_PASS", "native first-pass receipt Git blob")
    if (
      nativePaths.has(first.nativeReceiptPath) || nativeDigests.has(first.nativeReceiptSha256) ||
      artifactPaths.has(first.firstPassArtifactPath) || artifactDigests.has(first.firstPassArtifactSha256)
    ) fail("REAL_FIRST_PASS", "native first-pass receipt artifact is reused")
    nativePaths.add(first.nativeReceiptPath)
    nativeDigests.add(first.nativeReceiptSha256)
    artifactPaths.add(first.firstPassArtifactPath)
    artifactDigests.add(first.firstPassArtifactSha256)
    firstById.set(first.receiptId, first)
  }
  if (new Set(bundle.firstPassReceipts.map((receipt) => receipt.firstPassArtifactSha256)).size !== 3) {
    fail("REAL_FIRST_PASS", "first-pass artifact digest is reused")
  }
  return { taskById, firstById }
}

const nativeTaskReceiptProjection = (receipt) => withRecordMetadata({
  receiptVersion: "CODEX-ONLY-UIUX-V1/NATIVE-TASK-RECEIPT-V1",
  receiptId: receipt.receiptId,
  laneId: receipt.laneId,
  agentId: receipt.agentId,
  nativeTaskId: receipt.nativeTaskId,
  taskContractSha256: receipt.taskContractSha256,
  promptSha256: receipt.promptSha256,
  rubricSha256: receipt.rubricSha256,
  sourceContractSha256: receipt.sourceContractSha256,
  manifestSha256: receipt.manifestSha256,
  inputEvidenceRootSha256: receipt.inputEvidenceRootSha256,
  startedAtUtc: receipt.startedAtUtc,
  peerOutputsVisible: false,
  receiptRecordSha256: "0".repeat(64)
})

const nativeFirstPassReceiptProjection = (receipt) => withRecordMetadata({
  receiptVersion: "CODEX-ONLY-UIUX-V1/NATIVE-FIRST-PASS-RECEIPT-V1",
  receiptId: receipt.receiptId,
  taskReceiptId: receipt.taskReceiptId,
  laneId: receipt.laneId,
  agentId: receipt.agentId,
  nativeTaskId: receipt.nativeTaskId,
  promptSha256: receipt.promptSha256,
  rubricSha256: receipt.rubricSha256,
  sourceContractSha256: receipt.sourceContractSha256,
  startedAtUtc: receipt.startedAtUtc,
  completedAtUtc: receipt.completedAtUtc,
  firstPassArtifactPath: receipt.firstPassArtifactPath,
  firstPassArtifactSha256: receipt.firstPassArtifactSha256,
  firstPassArtifactGitBlobSha: receipt.firstPassArtifactGitBlobSha,
  peerOutputIdsVisible: [],
  peerOutputsVisible: false,
  receiptRecordSha256: "0".repeat(64)
})

const sealProjectedReceipt = (receipt, field = "receiptRecordSha256") => {
  receipt[field] = projectedDigest(receipt, field)
  return receipt
}

const firstPassReceiptSealProjection = (bundle, executionBaseSha) => withRecordMetadata({
  sealVersion: "CODEX-ONLY-UIUX-V1/FIRST-PASS-SEAL-V1",
  executionBaseSha,
  manifestSha256: bundle.executionManifest.manifestSha256,
  taskReceipts: bundle.taskReceipts,
  firstPassReceipts: bundle.firstPassReceipts,
  peerOutputsVisible: false
})

const validateFirstPassReceiptSeal = (
  bundle,
  dependencyInterface,
  cwd,
  requirementRows,
  capability,
  existingEntryDigests,
  existingObservationDigests,
  uniqueProofState
) => {
  const coordinate = bundle.firstPassReceiptSeal
  exactKeys(
    coordinate,
    EVIDENCE_BUNDLE_CONTRACT.firstPassReceiptSealCoordinateFields,
    "REAL_FIRST_PASS_SEAL",
    "first-pass receipt seal coordinate"
  )
  if (!SHA_40.test(coordinate.commit) || !isSafeRepositoryPath(coordinate.path)) {
    fail("REAL_FIRST_PASS_SEAL", "first-pass receipt seal coordinate is invalid")
  }
  assertHash(coordinate.sha256, "REAL_FIRST_PASS_SEAL", "first-pass receipt seal SHA-256")
  assertGitSha(coordinate.gitBlobSha, "REAL_FIRST_PASS_SEAL", "first-pass receipt seal Git blob")
  let type
  let raw
  let resolvedBlob
  let parents
  let changedPaths
  try {
    type = gitOutput(["cat-file", "-t", coordinate.commit], cwd)
    raw = execFileSync("git", ["show", `${coordinate.commit}:${coordinate.path}`], {
      cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: GIT_MAX_BUFFER
    })
    resolvedBlob = gitOutput(["rev-parse", `${coordinate.commit}:${coordinate.path}`], cwd)
    parents = gitOutput(["show", "-s", "--format=%P", coordinate.commit], cwd).split(/\s+/u).filter(Boolean)
    changedPaths = gitOutput(["diff-tree", "--no-commit-id", "--name-only", "-r", coordinate.commit], cwd).split("\n").filter(Boolean).sort()
  } catch {
    fail("REAL_FIRST_PASS_SEAL", "first-pass receipt seal commit or path is missing")
  }
  const expectedChangedPaths = [
    coordinate.path,
    ...bundle.taskReceipts.map((receipt) => receipt.nativeReceiptPath),
    ...bundle.firstPassReceipts.flatMap((receipt) => [
      receipt.nativeReceiptPath,
      receipt.firstPassArtifactPath
    ]),
    ...bundle.assertions
      .filter((assertion) => assertion.providerKind === "codex-first-pass-artifact")
      .map((assertion) => assertion.proofPath)
  ].sort()
  const sealTreeEntry = assertRegularGitPath(
    coordinate.commit,
    coordinate.path,
    cwd,
    "REAL_FIRST_PASS_SEAL",
    "first-pass receipt seal"
  )
  if (
    type !== "commit" || coordinate.commit === dependencyInterface.executionBaseSha ||
    !isAncestor(dependencyInterface.executionBaseSha, coordinate.commit, cwd) ||
    parents.length !== 1 || !isAncestor(dependencyInterface.executionBaseSha, parents[0], cwd) ||
    canonicalJson(changedPaths) !== canonicalJson(expectedChangedPaths) ||
    sha256Text(raw) !== coordinate.sha256 || gitBlobSha(raw) !== coordinate.gitBlobSha ||
    resolvedBlob !== coordinate.gitBlobSha || sealTreeEntry.blobSha !== coordinate.gitBlobSha ||
    gitOutput(["cat-file", "-t", resolvedBlob], cwd) !== "blob"
  ) fail("REAL_FIRST_PASS_SEAL", "first-pass receipt seal provenance differs")
  const seal = parseJsonNoDuplicateKeys(raw, "first-pass receipt seal")
  validateSafeTree(seal, "first-pass receipt seal")
  exactKeys(
    seal,
    EVIDENCE_BUNDLE_CONTRACT.firstPassReceiptSealFields,
    "REAL_FIRST_PASS_SEAL",
    "first-pass receipt seal"
  )
  exactValue(
    seal,
    firstPassReceiptSealProjection(bundle, dependencyInterface.executionBaseSha),
    "REAL_FIRST_PASS_SEAL",
    "first-pass receipt seal bytes"
  )
  validateCanonicalJsonBytes(raw, seal, "REAL_FIRST_PASS_SEAL", "first-pass receipt seal")
  let receiptSealCommitTime
  try {
    receiptSealCommitTime = Date.parse(gitOutput(["show", "-s", "--format=%cI", coordinate.commit], cwd))
  } catch {
    fail("REAL_NATIVE_RECEIPT", "receipt-seal commit time is unavailable")
  }
  for (let index = 0; index < LANE_IDS.length; index += 1) {
    const taskReceipt = bundle.taskReceipts[index]
    const firstReceipt = bundle.firstPassReceipts[index]
    const taskArtifact = readCommittedCanonicalJson({
      commit: coordinate.commit,
      path: taskReceipt.nativeReceiptPath,
      sha256: taskReceipt.nativeReceiptSha256,
      gitBlobSha: taskReceipt.nativeReceiptGitBlobSha
    }, dependencyInterface.executionBaseSha, cwd, "REAL_NATIVE_RECEIPT", "native task receipt").value
    const firstArtifact = readCommittedCanonicalJson({
      commit: coordinate.commit,
      path: firstReceipt.nativeReceiptPath,
      sha256: firstReceipt.nativeReceiptSha256,
      gitBlobSha: firstReceipt.nativeReceiptGitBlobSha
    }, dependencyInterface.executionBaseSha, cwd, "REAL_NATIVE_RECEIPT", "native first-pass receipt").value
    exactKeys(taskArtifact, EVIDENCE_BUNDLE_CONTRACT.nativeTaskReceiptFields, "REAL_NATIVE_RECEIPT", "native task receipt")
    exactKeys(firstArtifact, EVIDENCE_BUNDLE_CONTRACT.nativeFirstPassReceiptFields, "REAL_NATIVE_RECEIPT", "native first-pass receipt")
    validateRecordMetadata(taskArtifact, "REAL_NATIVE_RECEIPT", "native task receipt")
    validateRecordMetadata(firstArtifact, "REAL_NATIVE_RECEIPT", "native first-pass receipt")
    exactValue(
      taskArtifact,
      sealProjectedReceipt(nativeTaskReceiptProjection(taskReceipt)),
      "REAL_NATIVE_RECEIPT",
      "native task receipt bytes"
    )
    exactValue(
      firstArtifact,
      sealProjectedReceipt(nativeFirstPassReceiptProjection(firstReceipt)),
      "REAL_NATIVE_RECEIPT",
      "native first-pass receipt bytes"
    )
    if (
      !Number.isFinite(receiptSealCommitTime) ||
      Date.parse(firstReceipt.completedAtUtc) > receiptSealCommitTime
    ) fail("REAL_NATIVE_RECEIPT", "first-pass completion is later than its immutable receipt seal")
  }
  const entriesByAssertionId = new Map()
  const implementationCache = new Map()
  const expectedMode = capability === SELF_TEST_CAPABILITY
    ? EVIDENCE_BUNDLE_CONTRACT.privateFixtureEvidenceMode
    : EVIDENCE_BUNDLE_CONTRACT.publicEvidenceMode
  for (let index = 0; index < LANE_IDS.length; index += 1) {
    const laneId = LANE_IDS[index]
    const receipt = bundle.firstPassReceipts[index]
    const artifact = readCommittedCanonicalJson({
      commit: coordinate.commit,
      path: receipt.firstPassArtifactPath,
      sha256: receipt.firstPassArtifactSha256,
      gitBlobSha: receipt.firstPassArtifactGitBlobSha
    }, dependencyInterface.executionBaseSha, cwd, "REAL_FIRST_PASS_ARTIFACT", "first-pass lane artifact").value
    exactKeys(
      artifact,
      EVIDENCE_BUNDLE_CONTRACT.firstPassArtifactFields,
      "REAL_FIRST_PASS_ARTIFACT",
      "first-pass lane artifact"
    )
    validateRecordMetadata(artifact, "REAL_FIRST_PASS_ARTIFACT", "first-pass lane artifact")
    const expectedRows = requirementRows.filter((row) =>
      row.providerKind === "codex-first-pass-artifact" && row.providerId === laneId
    )
    if (
      artifact.schemaVersion !== 1 ||
      artifact.artifactId !== `P008-FIRST-PASS-ARTIFACT-${String(index + 1).padStart(2, "0")}` ||
      artifact.evidenceMode !== expectedMode || artifact.laneId !== laneId ||
      artifact.agentId !== AGENT_ID_BY_LANE[laneId] ||
      artifact.executionBaseSha !== dependencyInterface.executionBaseSha ||
      artifact.manifestSha256 !== bundle.executionManifest.manifestSha256 ||
      artifact.taskContractSha256 !== LANE_CONTRACTS[index].taskContractSha256 ||
      artifact.peerOutputsVisible !== false || !Array.isArray(artifact.assertionResults)
    ) fail("REAL_FIRST_PASS_ARTIFACT", "first-pass lane artifact identity differs")
    exactValue(
      artifact.assertionResults.map((entry) => entry.assertionId),
      expectedRows.map((row) => row.assertionContractId),
      "REAL_FIRST_PASS_ARTIFACT",
      "first-pass assertion order"
    )
    for (let rowIndex = 0; rowIndex < expectedRows.length; rowIndex += 1) {
      const entry = artifact.assertionResults[rowIndex]
      validateResultEntry(
        entry,
        expectedRows[rowIndex],
        coordinate.commit,
        expectedMode,
        dependencyInterface.executionBaseSha,
        cwd,
        capability,
        implementationCache,
        uniqueProofState
      )
      if (existingEntryDigests.has(entry.entrySha256) || existingObservationDigests.has(entry.observationSha256)) {
        fail("REAL_RESULT_REUSE", "result entry or observation digest is reused")
      }
      existingEntryDigests.add(entry.entrySha256)
      existingObservationDigests.add(entry.observationSha256)
      entriesByAssertionId.set(entry.assertionId, {
        entry,
        providerArtifactSha256: receipt.firstPassArtifactSha256
      })
    }
    const failed = artifact.assertionResults.filter((entry) => entry.result === "failed").length
    const passed = artifact.assertionResults.length - failed
    if (
      canonicalJson(artifact.counts) !== canonicalJson({ assertions: expectedRows.length, passed, failed }) ||
      artifact.assertionResultSequenceSha256 !== resultEntrySequenceSha256(artifact.assertionResults) ||
      artifact.artifactRecordSha256 !== projectedDigest(artifact, "artifactRecordSha256")
    ) fail("REAL_FIRST_PASS_ARTIFACT", "first-pass lane artifact result closure differs")
  }
  return {
    coordinate,
    entriesByAssertionId,
    artifactCoordinateRootSha256: firstPassArtifactCoordinateRoot(bundle)
  }
}

const validateAgentRuns = (bundle, requirementRows, receipts) => {
  validateOrderedRecords(bundle.agentRuns, "agentRunId", "REAL_AGENT_RUN", "agent runs")
  if (bundle.agentRuns.length !== 3) fail("REAL_AGENT_RUN", "exactly three agent runs are required")
  const coverageSequence = sequenceSha256("coverageCell", bundle.coverageCells, "coverageCellId")
  const assertionSequence = sequenceSha256("requirementAssertion", bundle.assertions, "assertionId")
  const findingSequences = laneSequenceMap(bundle.findings)
  for (let index = 0; index < LANE_IDS.length; index += 1) {
    const laneId = LANE_IDS[index]
    const lane = LANE_CONTRACTS[index]
    const run = bundle.agentRuns[index]
    const taskReceipt = bundle.taskReceipts[index]
    const firstReceipt = bundle.firstPassReceipts[index]
    const ownedRequirements = requirementRows
      .filter((row) => row.ownerLaneId === laneId)
      .map((row) => row.requirementId)
    const laneFindings = bundle.findings
      .filter((finding) => finding.laneId === laneId)
      .map((finding) => finding.findingId)
    const expectedRecommendation = laneFindings.length > 0 ? "do-not-recommend" : "agent-only-recommend"
    const expectedBasis = laneFindings.length > 0 ? "open-release-blocker" : "complete-closure-no-open-blocker"
    validateRecordShapeAndDigest("agentRun", run)
    if (
      run.agentRunId !== `P008-AGENT-RUN-${String(index + 1).padStart(2, "0")}` ||
      run.laneId !== laneId || run.agentId !== AGENT_ID_BY_LANE[laneId] ||
      run.taskContractSha256 !== lane.taskContractSha256 ||
      run.taskReceiptId !== taskReceipt.receiptId ||
      run.taskReceiptSha256 !== taskReceipt.recordSha256 ||
      run.firstPassReceiptId !== firstReceipt.receiptId ||
      run.firstPassReceiptSha256 !== firstReceipt.recordSha256 ||
      run.coverageSequenceSha256 !== coverageSequence ||
      run.assertionSequenceSha256 !== assertionSequence ||
      run.findingSequenceSha256 !== findingSequences[laneId] ||
      run.recommendation !== expectedRecommendation || run.basisCode !== expectedBasis
    ) fail("REAL_AGENT_RUN", "agent run differs from its receipts, evidence roots, or derived disposition")
    exactValue(run.reviewedJourneyIds, JOURNEY_IDS, "REAL_AGENT_RUN", "reviewed journeys")
    exactValue(run.reviewedRequirementIds, ownedRequirements, "REAL_AGENT_RUN", "reviewed owned requirements")
    exactValue(run.findingIds, laneFindings, "REAL_AGENT_RUN", "agent finding IDs")
    if (ownedRequirements.length === 0) fail("REAL_AGENT_RUN", "each lane must own requirements")
    if (!receipts.taskById.has(run.taskReceiptId) || !receipts.firstById.has(run.firstPassReceiptId)) {
      fail("REAL_AGENT_RUN", "agent run receipt reference is unresolved")
    }
  }
  return { coverageSequence, assertionSequence, findingSequences, laneOutputs: laneOutputMap(bundle.agentRuns) }
}

const validateDissent = (bundle) => {
  validateOrderedRecords(bundle.dissentPositions, "positionId", "REAL_DISSENT", "dissent positions")
  validateOrderedRecords(bundle.dissentGroups, "groupId", "REAL_DISSENT", "dissent groups", true)
  if (bundle.dissentPositions.length !== 3 || !Array.isArray(bundle.dissentMatrix) || bundle.dissentMatrix.length !== 3) {
    fail("REAL_DISSENT", "dissent position or matrix cardinality differs")
  }
  const positionsById = new Map()
  for (let index = 0; index < LANE_IDS.length; index += 1) {
    const laneId = LANE_IDS[index]
    const run = bundle.agentRuns[index]
    const position = bundle.dissentPositions[index]
    validateRecordShapeAndDigest("dissentPosition", position)
    if (
      position.positionId !== `P008-POSITION-${String(index + 1).padStart(2, "0")}` ||
      position.laneId !== laneId || position.agentId !== AGENT_ID_BY_LANE[laneId] ||
      position.consensusQuestionId !== "P008-CONSENSUS-RELEASE" ||
      position.position !== run.recommendation || position.basisCode !== run.basisCode
    ) fail("REAL_DISSENT", "dissent position differs from its lane output")
    exactValue(position.findingIds, run.findingIds, "REAL_DISSENT", "dissent position finding IDs")
    positionsById.set(position.positionId, position)
  }
  const uniquePositions = new Set(bundle.dissentPositions.map((position) => position.position))
  let expectedGroupId = null
  if (uniquePositions.size === 1) {
    if (bundle.dissentGroups.length !== 0) fail("REAL_DISSENT", "unanimous positions cannot create a dissent group")
  } else {
    if (bundle.dissentGroups.length !== 1) fail("REAL_DISSENT", "differing positions require one dissent group")
    const group = bundle.dissentGroups[0]
    validateRecordShapeAndDigest("dissentGroup", group)
    if (
      group.groupId !== "P008-DISSENT-01" ||
      group.consensusQuestionId !== "P008-CONSENSUS-RELEASE" ||
      group.status !== "recorded"
    ) fail("REAL_DISSENT", "dissent group identity differs")
    exactValue(group.positionIds, bundle.dissentPositions.map((position) => position.positionId), "REAL_DISSENT", "dissent group positions")
    expectedGroupId = group.groupId
  }
  for (let index = 0; index < LANE_IDS.length; index += 1) {
    const row = bundle.dissentMatrix[index]
    const position = bundle.dissentPositions[index]
    exactKeys(row, EVIDENCE_BUNDLE_CONTRACT.dissentMatrixRowFields, "REAL_DISSENT", "dissent matrix row")
    validateRecordMetadata(row, "REAL_DISSENT", "dissent matrix row")
    if (
      row.laneId !== LANE_IDS[index] || row.positionId !== position.positionId ||
      row.position !== position.position || row.groupId !== expectedGroupId ||
      row.positionRecordSha256 !== position.recordSha256 || !positionsById.has(row.positionId)
    ) fail("REAL_DISSENT", "dissent matrix is not the exact inverse projection")
  }
  return {
    positionSequence: sequenceSha256("dissentPosition", bundle.dissentPositions, "positionId"),
    groupSequence: sequenceSha256("dissentGroup", bundle.dissentGroups, "groupId"),
    matrixSha256: sha256Canonical(bundle.dissentMatrix)
  }
}

const validateConsensus = (bundle, roots, dissentRoots) => {
  const consensus = bundle.consensus
  validateRecordShapeAndDigest("consensus", consensus)
  const openIds = bundle.findings.map((finding) => finding.findingId)
  const expectedRecommendation = openIds.length > 0 ? "do-not-recommend" : "agent-only-recommend"
  const expectedBasis = openIds.length > 0 ? "open-release-blocker" : "complete-closure-no-open-blocker"
  if (
    consensus.consensusId !== "P008-CONSENSUS-01" ||
    consensus.dissentPositionSequenceSha256 !== dissentRoots.positionSequence ||
    consensus.dissentGroupSequenceSha256 !== dissentRoots.groupSequence ||
    consensus.dissentMatrixSha256 !== dissentRoots.matrixSha256 ||
    consensus.coverageSequenceSha256 !== roots.coverageSequence ||
    consensus.assertionSequenceSha256 !== roots.assertionSequence ||
    consensus.automatedRunSequenceSha256 !== roots.automatedRunSequence ||
    consensus.recommendation !== expectedRecommendation || consensus.basisCode !== expectedBasis
  ) fail("REAL_CONSENSUS", "consensus differs from exact derived evidence")
  exactValue(consensus.laneOutputSha256ByLaneId, roots.laneOutputs, "REAL_CONSENSUS", "consensus lane outputs")
  exactValue(consensus.findingSequenceSha256ByLaneId, roots.findingSequences, "REAL_CONSENSUS", "consensus finding sequences")
  exactValue(consensus.openBlockingFindingIds, openIds, "REAL_CONSENSUS", "consensus open blockers")
  if (
    expectedRecommendation === "do-not-recommend" &&
    bundle.agentRuns.every((run) => run.recommendation !== "do-not-recommend")
  ) fail("REAL_CONSENSUS", "blocking finding does not force an owning lane disposition")
  return consensus
}

const finalRecordCounts = (bundle) => ({
  executionManifests: 1,
  taskReceipts: bundle.taskReceipts.length,
  firstPassReceipts: bundle.firstPassReceipts.length,
  environmentObservations: bundle.environmentObservations.length,
  automatedRuns: bundle.automatedRuns.length,
  assertions: bundle.assertions.length,
  coverageCells: bundle.coverageCells.length,
  findings: bundle.findings.length,
  agentRuns: bundle.agentRuns.length,
  dissentPositions: bundle.dissentPositions.length,
  dissentGroups: bundle.dissentGroups.length,
  dissentMatrixRows: bundle.dissentMatrix.length,
  consensus: 1,
  finalEvidence: 1
})

const finalEvidenceRootProjection = (bundle, contractRoot) => ({
  rootVersion: "CODEX-ONLY-UIUX-V1/FINAL-ROOT-V1",
  finalEvidenceRecordSha256: bundle.finalEvidence.recordSha256,
  contractRootSha256: contractRoot,
  executionBaseSha: bundle.executionManifest.executionBaseSha,
  published: bundle.published,
  publishedPacketCommit: bundle.publishedPacketCommit,
  packetBytesRootSha256: bundle.packetBytesRootSha256,
  externalSealRequired: true
})

const validateFinalEvidence = (bundle, contractRoot, roots, dissentRoots, consensus) => {
  const finalEvidence = bundle.finalEvidence
  validateRecordShapeAndDigest("finalEvidence", finalEvidence)
  const expected = {
    ...RECORD_PERMANENT_METADATA,
    finalEvidenceId: "P008-FINAL-EVIDENCE-01",
    contractRootSha256: contractRoot,
    manifestSha256: bundle.executionManifest.manifestSha256,
    published: bundle.published,
    publishedPacketCommit: bundle.publishedPacketCommit,
    packetBytesRootSha256: bundle.packetBytesRootSha256,
    taskReceiptSequenceSha256: sequenceSha256("taskReceipt", bundle.taskReceipts, "receiptId"),
    firstPassReceiptSequenceSha256: sequenceSha256("firstPassReceipt", bundle.firstPassReceipts, "receiptId"),
    firstPassReceiptSealSha256: bundle.firstPassReceiptSeal.sha256,
    automatedResultManifestCoordinateRootSha256: roots.automatedResultManifestCoordinateRootSha256,
    firstPassArtifactCoordinateRootSha256: roots.firstPassArtifactCoordinateRootSha256,
    externalAnchorSha256: bundle.externalAnchor.sha256,
    environmentSequenceSha256: sequenceSha256("environmentObservation", bundle.environmentObservations, "environmentId"),
    automatedRunSequenceSha256: roots.automatedRunSequence,
    assertionSequenceSha256: roots.assertionSequence,
    coverageSequenceSha256: roots.coverageSequence,
    findingSequenceSha256ByLaneId: roots.findingSequences,
    laneOutputSha256ByLaneId: roots.laneOutputs,
    dissentPositionSequenceSha256: dissentRoots.positionSequence,
    dissentGroupSequenceSha256: dissentRoots.groupSequence,
    dissentMatrixSha256: dissentRoots.matrixSha256,
    consensusRecordSha256: consensus.recordSha256,
    recordCounts: finalRecordCounts(bundle),
    recommendation: consensus.recommendation,
    productionAuthorization: false
  }
  const projection = Object.fromEntries(Object.entries(finalEvidence).filter(([key]) => key !== "recordSha256"))
  exactValue(projection, expected, "REAL_FINAL_EVIDENCE", "final evidence projection")
  const root = sha256Canonical(finalEvidenceRootProjection(bundle, contractRoot))
  if (bundle.finalEvidenceRootSha256 !== root) fail("REAL_FINAL_ROOT", "embedded final evidence root differs")
  return root
}

const externalAnchorProjection = ({
  anchorParentSha,
  dependencyShas,
  publicKeySpkiBase64,
  challengeBase64
}) => withRecordMetadata({
  anchorVersion: "CODEX-ONLY-UIUX-V1/EXTERNAL-ANCHOR-V1",
  anchorId: "P008-EXTERNAL-ANCHOR-01",
  anchorParentSha,
  dependencyShas,
  allowedProgramStepIds: ["02", "03", "04"],
  publicKeySpkiBase64,
  challengeBase64,
  anchorRecordSha256: "0".repeat(64)
})

const externalSealSignedProjection = (seal) => Object.fromEntries(
  Object.entries(seal).filter(([key]) => !["signedPayloadSha256", "signatureBase64"].includes(key))
)

const validateExternalSealSignature = (seal, publicKey) => {
  const signedProjection = externalSealSignedProjection(seal)
  const signedBytes = Buffer.from(canonicalJson(signedProjection), "utf8")
  if (
    seal.signedPayloadSha256 !== sha256Bytes(signedBytes) ||
    typeof seal.signatureBase64 !== "string"
  ) fail("REAL_EXTERNAL_SEAL", "external seal signed payload differs")
  let signatureValid = false
  try {
    const signatureBytes = Buffer.from(seal.signatureBase64, "base64")
    signatureValid = signatureBytes.toString("base64") === seal.signatureBase64 &&
      verify(null, signedBytes, publicKey, signatureBytes)
  } catch {
    signatureValid = false
  }
  if (!signatureValid) fail("REAL_EXTERNAL_SEAL_SIGNATURE", "external seal signature is invalid")
}

const validateExternalAnchor = ({
  bundle,
  anchorRef,
  dependencyInterface,
  cwd
}) => {
  exactKeys(bundle.externalAnchor, EVIDENCE_BUNDLE_CONTRACT.externalAnchorCoordinateFields, "REAL_EXTERNAL_ANCHOR", "external anchor coordinate")
  if (
    !isRecord(anchorRef) || anchorRef.commit !== bundle.externalAnchor.commit ||
    anchorRef.path !== bundle.externalAnchor.path
  ) fail("REAL_EXTERNAL_ANCHOR", "caller anchor coordinate differs from the bound external anchor")
  exactValue(
    bundle.externalAnchor,
    dependencyInterface.trustedExternalAnchor,
    "REAL_EXTERNAL_ANCHOR",
    "bundle trusted external anchor coordinate"
  )
  const { value: anchor } = readCommittedCanonicalJson({
    commit: bundle.externalAnchor.commit,
    path: bundle.externalAnchor.path,
    sha256: bundle.externalAnchor.sha256,
    gitBlobSha: bundle.externalAnchor.gitBlobSha
  }, dependencyInterface.executionBaseSha, cwd, "REAL_EXTERNAL_ANCHOR", "signing-key coordinate anchor", "ancestor")
  exactKeys(anchor, EVIDENCE_BUNDLE_CONTRACT.externalAnchorFields, "REAL_EXTERNAL_ANCHOR", "signing-key coordinate anchor")
  validateRecordMetadata(anchor, "REAL_EXTERNAL_ANCHOR", "signing-key coordinate anchor")
  const dependencyShas = Object.fromEntries(
    dependencyInterface.requiredSteps.map((step) => [step.programStepId, step.requiredSha])
  )
  let parents
  let changedPaths
  try {
    parents = gitOutput(["show", "-s", "--format=%P", bundle.externalAnchor.commit], cwd).split(/\s+/u).filter(Boolean)
    changedPaths = gitOutput(["diff-tree", "--no-commit-id", "--name-only", "-r", bundle.externalAnchor.commit], cwd).split("\n").filter(Boolean)
  } catch {
    fail("REAL_EXTERNAL_ANCHOR", "signing-key coordinate parent or change set is unavailable")
  }
  if (
    parents.length !== 1 || parents[0] !== dependencyInterface.requiredSteps[2].requiredSha ||
    changedPaths.length !== 1 || changedPaths[0] !== bundle.externalAnchor.path ||
    anchor.anchorRecordSha256 !== projectedDigest(anchor, "anchorRecordSha256") ||
    anchor.anchorVersion !== "CODEX-ONLY-UIUX-V1/EXTERNAL-ANCHOR-V1" ||
    anchor.anchorId !== "P008-EXTERNAL-ANCHOR-01" ||
    anchor.anchorParentSha !== dependencyInterface.requiredSteps[2].requiredSha ||
    canonicalJson(anchor.dependencyShas) !== canonicalJson(dependencyShas) ||
    canonicalJson(anchor.allowedProgramStepIds) !== canonicalJson(["02", "03", "04"])
  ) fail("REAL_EXTERNAL_ANCHOR", "signing-key coordinate closure differs")
  let publicKey
  try {
    const publicKeyBytes = Buffer.from(anchor.publicKeySpkiBase64, "base64")
    const challengeBytes = Buffer.from(anchor.challengeBase64, "base64")
    if (publicKeyBytes.toString("base64") !== anchor.publicKeySpkiBase64 || challengeBytes.length !== 32) throw new Error()
    publicKey = { key: publicKeyBytes, format: "der", type: "spki" }
  } catch {
    fail("REAL_EXTERNAL_ANCHOR", "signing-key coordinate key or challenge differs")
  }
  return { coordinate: bundle.externalAnchor, anchor, publicKey }
}

const validateExternalSeal = ({
  sealRef,
  expectedRoot,
  bundleRaw,
  finalRoot,
  contractRoot,
  executionBaseSha,
  firstPassReceiptSeal,
  automatedResultManifestCommits,
  automatedResultManifestCoordinateRootSha256,
  firstPassArtifactCoordinateRootSha256,
  externalAnchor,
  publication,
  cwd
}) => {
  assertHash(expectedRoot, "REAL_EXTERNAL_ROOT", "caller-supplied expected root")
  if (expectedRoot !== finalRoot) fail("REAL_EXTERNAL_ROOT", "caller-supplied expected root differs")
  if (!isRecord(sealRef) || !SHA_40.test(sealRef.commit) || !isSafeRepositoryPath(sealRef.path)) {
    fail("REAL_EXTERNAL_SEAL", "external seal reference is invalid")
  }
  let type
  let raw
  try {
    type = gitOutput(["cat-file", "-t", sealRef.commit], cwd)
    raw = execFileSync("git", ["show", `${sealRef.commit}:${sealRef.path}`], {
      cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: GIT_MAX_BUFFER
    })
  } catch {
    fail("REAL_EXTERNAL_SEAL", "external seal commit or path is missing")
  }
  if (type !== "commit" || !isAncestor(executionBaseSha, sealRef.commit, cwd)) {
    fail("REAL_EXTERNAL_SEAL", "external seal is not in a descendant commit of the execution base")
  }
  if (
    firstPassReceiptSeal.commit === sealRef.commit ||
    !isAncestor(firstPassReceiptSeal.commit, sealRef.commit, cwd)
  ) {
    fail("REAL_EXTERNAL_SEAL", "final seal does not descend from the first-pass receipt seal")
  }
  for (const commit of automatedResultManifestCommits) {
    if (commit === sealRef.commit || !isAncestor(commit, sealRef.commit, cwd)) {
      fail("REAL_EXTERNAL_SEAL", "final seal does not descend from every automated result manifest")
    }
  }
  let parents
  let changedPaths
  let evidenceRaw
  let evidenceBlob
  try {
    parents = gitOutput(["show", "-s", "--format=%P", sealRef.commit], cwd).split(/\s+/u).filter(Boolean)
    changedPaths = gitOutput(["diff-tree", "--no-commit-id", "--name-only", "-r", sealRef.commit], cwd).split("\n").filter(Boolean)
  } catch {
    fail("REAL_EXTERNAL_SEAL", "external seal parent or change set is unavailable")
  }
  const resolvedBlob = gitOutput(["rev-parse", `${sealRef.commit}:${sealRef.path}`], cwd)
  const sealTreeEntry = assertRegularGitPath(sealRef.commit, sealRef.path, cwd, "REAL_EXTERNAL_SEAL", "external seal")
  if (
    resolvedBlob !== gitBlobSha(raw) || sealTreeEntry.blobSha !== resolvedBlob ||
    gitOutput(["cat-file", "-t", resolvedBlob], cwd) !== "blob"
  ) {
    fail("REAL_EXTERNAL_SEAL", "external seal Git blob differs")
  }
  const seal = parseJsonNoDuplicateKeys(raw, "external seal")
  validateSafeTree(seal, "external seal")
  validateCanonicalJsonBytes(raw, seal, "REAL_EXTERNAL_SEAL", "external seal")
  exactKeys(seal, EVIDENCE_BUNDLE_CONTRACT.externalSealFields, "REAL_EXTERNAL_SEAL", "external seal")
  validateRecordMetadata(seal, "REAL_EXTERNAL_SEAL", "external seal")
  const expectedWithoutSignature = {
    ...RECORD_PERMANENT_METADATA,
    sealVersion: "CODEX-ONLY-UIUX-V1/EXTERNAL-SEAL-V1",
    published: publication.published,
    publishedPacketCommit: publication.publishedPacketCommit,
    packetBytesRootSha256: publication.packetBytesRootSha256,
    bundleSha256: sha256Text(bundleRaw),
    finalEvidenceRootSha256: finalRoot,
    executionBaseSha,
    contractRootSha256: contractRoot,
    firstPassReceiptSealSha256: firstPassReceiptSeal.sha256,
    automatedResultManifestCoordinateRootSha256,
    firstPassArtifactCoordinateRootSha256,
    externalAnchorCommit: externalAnchor.coordinate.commit,
    externalAnchorPath: externalAnchor.coordinate.path,
    externalAnchorSha256: externalAnchor.coordinate.sha256,
    externalAnchorGitBlobSha: externalAnchor.coordinate.gitBlobSha,
    evidenceCommit: seal.evidenceCommit,
    evidencePath: seal.evidencePath,
    evidenceGitBlobSha: seal.evidenceGitBlobSha,
    sealParentSha: seal.evidenceCommit,
    signatureAlgorithm: "ed25519"
  }
  if (
    !SHA_40.test(seal.evidenceCommit) || !isSafeRepositoryPath(seal.evidencePath) ||
    !SHA_40.test(seal.evidenceGitBlobSha) || parents.length !== 1 ||
    parents[0] !== seal.evidenceCommit || changedPaths.length !== 1 || changedPaths[0] !== sealRef.path ||
    seal.evidenceCommit === externalAnchor.coordinate.commit ||
    !isAncestor(externalAnchor.coordinate.commit, seal.evidenceCommit, cwd) ||
    gitOutput(["show", "-s", "--format=%P", seal.evidenceCommit], cwd) !== firstPassReceiptSeal.commit
  ) fail("REAL_EXTERNAL_SEAL", "external seal parent or immutable anchor ancestry differs")
  try {
    evidenceRaw = execFileSync("git", ["show", `${seal.evidenceCommit}:${seal.evidencePath}`], {
      cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: GIT_MAX_BUFFER
    })
    evidenceBlob = gitOutput(["rev-parse", `${seal.evidenceCommit}:${seal.evidencePath}`], cwd)
  } catch {
    fail("REAL_EXTERNAL_SEAL", "sealed evidence artifact is missing")
  }
  const evidenceTreeEntry = assertRegularGitPath(
    seal.evidenceCommit,
    seal.evidencePath,
    cwd,
    "REAL_EXTERNAL_SEAL",
    "sealed evidence artifact"
  )
  const evidenceChangedPaths = gitOutput(
    ["diff-tree", "--no-commit-id", "--name-only", "-r", seal.evidenceCommit],
    cwd
  ).split("\n").filter(Boolean)
  if (
    evidenceRaw !== bundleRaw || evidenceBlob !== seal.evidenceGitBlobSha ||
    evidenceTreeEntry.blobSha !== seal.evidenceGitBlobSha ||
    gitBlobSha(evidenceRaw) !== seal.evidenceGitBlobSha ||
    canonicalJson(evidenceChangedPaths) !== canonicalJson([seal.evidencePath])
  ) {
    fail("REAL_EXTERNAL_SEAL", "sealed evidence bytes differ")
  }
  const signedProjection = externalSealSignedProjection(seal)
  exactValue(signedProjection, expectedWithoutSignature, "REAL_EXTERNAL_SEAL", "external seal signed projection")
  validateExternalSealSignature(seal, externalAnchor.publicKey)
}

const validatePublicationBinding = (bundle, packetBinding, capability) => {
  const publication = capability === SELF_TEST_CAPABILITY
    ? { published: false, publishedPacketCommit: null, packetBytesRootSha256: null }
    : packetBinding
  if (
    !isRecord(publication) || bundle.published !== publication.published ||
    bundle.publishedPacketCommit !== publication.publishedPacketCommit ||
    bundle.packetBytesRootSha256 !== publication.packetBytesRootSha256 ||
    (capability !== SELF_TEST_CAPABILITY && publication.published !== true)
  ) fail("REAL_PUBLICATION", "real evidence publication binding differs")
  return publication
}

const SELF_TEST_PROVIDER_STAGE_CACHE = new Map()

const validateProviderStage = ({
  bundle,
  dependencyInterface,
  requirementRows,
  contractRoot,
  cwd,
  capability
}) => {
  const cacheKey = capability === SELF_TEST_CAPABILITY
    ? sha256Canonical({
      cwd,
      dependencyInterface,
      requirementRowsSha256: sha256Canonical(requirementRows),
      contractRoot,
      executionManifest: bundle.executionManifest,
      taskReceipts: bundle.taskReceipts,
      firstPassReceipts: bundle.firstPassReceipts,
      firstPassReceiptSeal: bundle.firstPassReceiptSeal,
      environmentObservations: bundle.environmentObservations,
      automatedRuns: bundle.automatedRuns,
      assertions: bundle.assertions
    })
    : null
  if (cacheKey !== null && SELF_TEST_PROVIDER_STAGE_CACHE.has(cacheKey)) {
    return SELF_TEST_PROVIDER_STAGE_CACHE.get(cacheKey)
  }
  const receipts = validateReceipts(bundle, bundle.executionManifest, contractRoot)
  const automation = validateEnvironmentsAndRuns(bundle, requirementRows, dependencyInterface, cwd, capability)
  const firstPass = validateFirstPassReceiptSeal(
    bundle,
    dependencyInterface,
    cwd,
    requirementRows,
    capability,
    automation.entryDigests,
    automation.observationDigests,
    automation.uniqueProofState
  )
  const validated = { receipts, automation, firstPass }
  if (cacheKey !== null) SELF_TEST_PROVIDER_STAGE_CACHE.set(cacheKey, validated)
  return validated
}

const validateRealEvidence = ({
  bundle,
  bundleRaw,
  expectedRoot,
  anchorRef,
  sealRef,
  dependencyInterface,
  requirementRows,
  contractRoot,
  packetBinding = null,
  cwd = repositoryRoot,
  capability = null
}) => {
  rejectPublicFixturePaths({ bundle, dependencyInterface, anchorRef, sealRef }, capability)
  validateSafeTree(bundle, "real evidence bundle")
  exactKeys(bundle, REAL_BUNDLE_KEYS, "REAL_BUNDLE_KEYS", "real evidence bundle")
  if (
    bundle.schemaVersion !== 1 || bundle.bundleId !== "P008-EVIDENCE-01" ||
    bundle.mode !== "real-evidence"
  ) fail("REAL_BUNDLE_ID", "real evidence bundle identity differs")
  const publication = validatePublicationBinding(bundle, packetBinding, capability)
  for (const [key, expected] of Object.entries(REAL_PERMANENT_VALUES)) {
    if (bundle[key] !== expected) fail("REAL_PERMANENT_BOUNDARY", `real evidence ${key} differs`)
  }
  validateMandatoryCollections(bundle)
  if (bundleRaw !== `${canonicalJson(bundle)}\n`) {
    fail("REAL_BUNDLE_CANONICAL", "real evidence bundle bytes are not canonical JSON plus one newline")
  }
  validateAssertionCoverageSkeleton(bundle, requirementRows)
  validateResolvedDependencies(dependencyInterface, cwd, capability)
  validateExecutionManifest(bundle.executionManifest, dependencyInterface, contractRoot, requirementRows, publication)
  const { receipts, automation, firstPass } = validateProviderStage({
    bundle,
    dependencyInterface,
    requirementRows,
    contractRoot,
    cwd,
    capability,
  })
  const externalAnchor = validateExternalAnchor({
    bundle,
    anchorRef,
    dependencyInterface,
    cwd
  })
  const providerEntries = new Map([
    ...automation.entriesByAssertionId.entries(),
    ...firstPass.entriesByAssertionId.entries()
  ])
  const { cellsById } = validateAssertionsAndCoverage(bundle, requirementRows, providerEntries)
  validateFindingsAndFailureCoupling(bundle, requirementRows, cellsById)
  const agentRoots = validateAgentRuns(bundle, requirementRows, receipts)
  const automatedRunSequence = sequenceSha256("automatedRun", bundle.automatedRuns, "runId")
  const roots = {
    ...agentRoots,
    automatedRunSequence,
    automatedResultManifestCoordinateRootSha256: automation.coordinateRootSha256,
    firstPassArtifactCoordinateRootSha256: firstPass.artifactCoordinateRootSha256
  }
  const dissentRoots = validateDissent(bundle)
  const consensus = validateConsensus(bundle, roots, dissentRoots)
  const finalRoot = validateFinalEvidence(bundle, contractRoot, roots, dissentRoots, consensus)
  validateExternalSeal({
    sealRef,
    expectedRoot,
    bundleRaw,
    finalRoot,
    contractRoot,
    executionBaseSha: dependencyInterface.executionBaseSha,
    firstPassReceiptSeal: firstPass.coordinate,
    automatedResultManifestCommits: automation.manifestCommits,
    automatedResultManifestCoordinateRootSha256: automation.coordinateRootSha256,
    firstPassArtifactCoordinateRootSha256: firstPass.artifactCoordinateRootSha256,
    externalAnchor,
    publication,
    cwd
  })
  return finalRoot
}

const makeFixtureCaseBlueprint = (row, result = "passed") => {
  const implementationId = row.assertionContractId.replace("P008-AST-", "P008-IMPL-")
  const executionCaseId = row.assertionContractId.replace("P008-AST-", "P008-CASE-")
  const capturedResult = withRecordMetadata({
    actualOutcome: result === "passed" ? "satisfied" : "not-satisfied",
    assertionKind: row.requirementKind,
    caseId: executionCaseId,
    expectedOutcome: "satisfied",
    statusCode: result === "passed" ? 0 : 1,
    subjectId: row.targetId,
    browserResultSha256: null,
    browserReportSha256: null,
    bindingResults: row.authorityBindingIds.map((bindingId, index) => withRecordMetadata({
      bindingId,
      routeScope: row.authorityRouteScopes[index],
      status: result === "passed" ? "satisfied" : "not-satisfied"
    }))
  })
  const implementationPath = `fixture/implementations/${implementationId}.mjs`
  const implementationBytes = `#!/usr/bin/env node\nconst implementationId = ${JSON.stringify(implementationId)}\nconst executionCaseId = ${JSON.stringify(executionCaseId)}\nconst capturedResult = ${canonicalJson(capturedResult)}\nif (implementationId.length === 0 || executionCaseId !== capturedResult.caseId) process.exitCode = 2\nprocess.stdout.write(JSON.stringify(capturedResult) + String.fromCharCode(10))\nif (capturedResult.statusCode !== 0) process.exitCode = capturedResult.statusCode\n`
  return { row, result, implementationId, executionCaseId, capturedResult, implementationPath, implementationBytes }
}

const makeFixtureProofAndEntry = (blueprint, capturedOutput) => {
  const { row, result, implementationId, executionCaseId, capturedResult, implementationPath, implementationBytes } = blueprint
  const expectedOutput = `${canonicalJson(capturedResult)}\n`
  if (capturedOutput !== expectedOutput) fail("FIXTURE_IMPLEMENTATION", "fixture executable output differs")
  const implementationBlobSha = gitBlobSha(implementationBytes)
  const proofPath = `fixture/results/proofs/${row.assertionContractId}.json`
  const commandArgv = ["node", implementationPath]
  const proof = withRecordMetadata({
    schemaVersion: 1,
    proofId: row.assertionContractId.replace("P008-AST-", "P008-PROOF-"),
    evidenceMode: EVIDENCE_BUNDLE_CONTRACT.privateFixtureEvidenceMode,
    executionClass: "isolated-executable-structural-fixture",
    assertionId: row.assertionContractId,
    assertionContractId: row.assertionContractId,
    requirementId: row.requirementId,
    coverageCellId: row.coverageCellId,
    authorityAtomId: row.authorityAtomId,
    authorityClauseIds: row.authorityClauseIds,
    authorityBindingIds: row.authorityBindingIds,
    authorityRouteScopes: row.authorityRouteScopes,
    providerKind: row.providerKind,
    providerId: row.providerId,
    executionCaseId,
    commandId: row.providerKind === "codex-first-pass-artifact" ? "codex-native-review" : row.providerId,
    commandArgv,
    commandArgvSha256: sha256Canonical(commandArgv),
    exitCode: result === "passed" ? 0 : 1,
    sourceClauseId: row.sourceClauseId,
    sourcePath: row.sourcePath,
    sourceBlobSha: row.sourceBlobSha,
    implementationId,
    implementationPath,
    implementationBlobSha,
    browserEvidence: null,
    capturedResult,
    capturedResultSha256: sha256Text(expectedOutput),
    proofRecordSha256: "0".repeat(64)
  })
  proof.proofRecordSha256 = projectedDigest(proof, "proofRecordSha256")
  const proofRaw = `${canonicalJson(proof)}\n`
  const entry = withRecordMetadata({
    assertionId: row.assertionContractId,
    assertionContractId: row.assertionContractId,
    requirementId: row.requirementId,
    coverageCellId: row.coverageCellId,
    authorityAtomId: row.authorityAtomId,
    authorityClauseIds: row.authorityClauseIds,
    authorityBindingIds: row.authorityBindingIds,
    authorityRouteScopes: row.authorityRouteScopes,
    providerKind: row.providerKind,
    providerId: row.providerId,
    sourceClauseId: row.sourceClauseId,
    sourcePath: row.sourcePath,
    sourceBlobSha: row.sourceBlobSha,
    implementationId,
    implementationPath,
    implementationBlobSha,
    executionCaseId,
    proofPath,
    proofSha256: sha256Text(proofRaw),
    proofGitBlobSha: gitBlobSha(proofRaw),
    result,
    observationKind: observationKindFor(row),
    observationSha256: proof.capturedResultSha256,
    entrySha256: "0".repeat(64)
  })
  entry.entrySha256 = resultEntryDigest(entry)
  return { entry, proof, proofRaw }
}

const makePositiveBundle = (dependencyInterface, requirementRows, contractRoot, resultEntries) => {
  const dependencyShas = Object.fromEntries(dependencyInterface.requiredSteps.map((step) => [step.programStepId, step.requiredSha]))
  const dependencyArtifacts = Object.fromEntries(dependencyInterface.requiredSteps.map((step) => [
    step.programStepId,
    Object.fromEntries(Object.entries(step).filter(([key]) => key !== "requiredSha"))
  ]))
  const executionManifest = sealRecord("executionManifest", {
    manifestId: "P008-EXECUTION-MANIFEST-01",
    mode: "real-evidence",
    published: false,
    publishedPacketCommit: null,
    packetBytesRootSha256: null,
    executionBaseSha: dependencyInterface.executionBaseSha,
    dependencyShas,
    dependencyArtifacts,
    trustedExternalAnchor: dependencyInterface.trustedExternalAnchor,
    canonicalSourceRootSha256: contractRoot,
    journeyRequirementsSha256: sha256Canonical(requirementRows),
    commandContractSha256: commandContractSha256(),
    artifactManifestSha256: sha256Text("isolated-real-mode-fixture-artifact-manifest"),
    inputEvidenceRootSha256: BASELINE_SEQUENCE_SHA256,
    host: "127.0.0.1",
    externalRequestsAllowed: false,
    manifestSha256: "0".repeat(64)
  })

  const taskReceipts = LANE_IDS.map((laneId, index) => sealRecord("taskReceipt", {
    receiptId: `P008-TASK-REC-${String(index + 1).padStart(2, "0")}`,
    laneId,
    agentId: AGENT_ID_BY_LANE[laneId],
    nativeTaskId: AGENT_ID_BY_LANE[laneId],
    taskContractSha256: LANE_CONTRACTS[index].taskContractSha256,
    promptSha256: LANE_CONTRACTS[index].promptSha256,
    rubricSha256: LANE_CONTRACTS[index].rubricSha256,
    sourceContractSha256: contractRoot,
    manifestSha256: executionManifest.manifestSha256,
    inputEvidenceRootSha256: executionManifest.inputEvidenceRootSha256,
    startedAtUtc: `2026-08-28T00:0${index}:00Z`,
    nativeReceiptPath: `fixture/receipts/task-${laneId}.json`,
    nativeReceiptSha256: "0".repeat(64),
    nativeReceiptGitBlobSha: "0".repeat(40),
    peerOutputsVisible: false,
    recordSha256: "0".repeat(64)
  }))
  const firstPassReceipts = LANE_IDS.map((laneId, index) => sealRecord("firstPassReceipt", {
    receiptId: `P008-FIRST-PASS-${String(index + 1).padStart(2, "0")}`,
    taskReceiptId: taskReceipts[index].receiptId,
    laneId,
    agentId: AGENT_ID_BY_LANE[laneId],
    nativeTaskId: AGENT_ID_BY_LANE[laneId],
    promptSha256: LANE_CONTRACTS[index].promptSha256,
    rubricSha256: LANE_CONTRACTS[index].rubricSha256,
    sourceContractSha256: contractRoot,
    startedAtUtc: taskReceipts[index].startedAtUtc,
    completedAtUtc: `2026-08-28T00:0${index}:30Z`,
    nativeReceiptPath: `fixture/receipts/first-pass-${laneId}.json`,
    nativeReceiptSha256: "0".repeat(64),
    nativeReceiptGitBlobSha: "0".repeat(40),
    firstPassArtifactPath: `fixture/results/first-pass-${laneId}.json`,
    firstPassArtifactSha256: "0".repeat(64),
    firstPassArtifactGitBlobSha: "0".repeat(40),
    peerOutputIdsVisible: [],
    peerOutputsVisible: false,
    recordSha256: "0".repeat(64)
  }))

  const environmentObservations = COMMAND_IDS.map((commandId) => {
    const expected = expectedEnvironmentValues[commandId]
    return sealRecord("environmentObservation", {
      environmentId: expected.environmentId,
      commandId,
      runtimeId: expected.runtimeId,
      browserProfiles: expected.browserProfiles,
      host: "127.0.0.1",
      externalRequestsObserved: 0,
      toolchainManifestSha256: sha256Text(`isolated-toolchain-${commandId}`),
      recordSha256: "0".repeat(64)
    })
  })

  const assertions = requirementRows.map((row, index) => sealRecord("requirementAssertion", {
    assertionId: row.assertionContractId,
    assertionContractId: row.assertionContractId,
    requirementId: row.requirementId,
    coverageCellId: row.coverageCellId,
    authorityAtomId: row.authorityAtomId,
    authorityClauseIds: row.authorityClauseIds,
    authorityBindingIds: row.authorityBindingIds,
    authorityRouteScopes: row.authorityRouteScopes,
    providerKind: row.providerKind,
    providerId: row.providerId,
    providerArtifactSha256: "0".repeat(64),
    providerEntrySha256: resultEntries[index].entrySha256,
    implementationId: resultEntries[index].implementationId,
    implementationPath: resultEntries[index].implementationPath,
    implementationBlobSha: resultEntries[index].implementationBlobSha,
    executionCaseId: resultEntries[index].executionCaseId,
    proofPath: resultEntries[index].proofPath,
    proofSha256: resultEntries[index].proofSha256,
    proofGitBlobSha: resultEntries[index].proofGitBlobSha,
    observationKind: resultEntries[index].observationKind,
    result: resultEntries[index].result,
    deterministicOutputSha256: resultEntries[index].observationSha256,
    sourcePath: row.sourcePath,
    sourceBlobSha: row.sourceBlobSha,
    sourceClauseId: row.sourceClauseId,
    recordSha256: "0".repeat(64)
  }))

  const findingIdByRequirementId = new Map(requirementRows.flatMap((row, index) =>
    assertions[index].result === "failed"
      ? [[row.requirementId, `P008-FIND-${String(index + 1).padStart(4, "0")}`]]
      : []
  ))
  const coverageCells = requirementRows.map((row, index) => sealRecord("coverageCell", {
    coverageCellId: row.coverageCellId,
    requirementId: row.requirementId,
    journeyId: row.journeyId,
    requirementKind: row.requirementKind,
    targetId: row.targetId,
    sourceClauseId: row.sourceClauseId,
    authorityAtomId: row.authorityAtomId,
    authorityClauseIds: row.authorityClauseIds,
    authorityBindingIds: row.authorityBindingIds,
    authorityRouteScopes: row.authorityRouteScopes,
    ownerLaneId: row.ownerLaneId,
    applicable: true,
    assertionId: assertions[index].assertionId,
    assertionRecordSha256: assertions[index].recordSha256,
    result: assertions[index].result,
    blockingFindingId: findingIdByRequirementId.get(row.requirementId) ?? null,
    recordSha256: "0".repeat(64)
  }))

  const automatedRuns = COMMAND_IDS.map((commandId) => sealRecord("automatedRun", {
    runId: expectedRunId(commandId),
    commandId,
    environmentId: expectedEnvironmentValues[commandId].environmentId,
    commandContractSha256: commandContractSha256(),
    result: "passed",
    assertionIds: requirementRows
      .filter((row) => row.providerKind === "automated-result-manifest" && row.providerId === commandId)
      .map((row) => row.assertionContractId),
    resultManifestId: `P008-RESULT-${expectedRunId(commandId)}`,
    resultManifestCommit: "0".repeat(40),
    resultManifestPath: `fixture/results/${commandId}.json`,
    resultManifestSha256: "0".repeat(64),
    resultManifestGitBlobSha: "0".repeat(40),
    assertionResultSequenceSha256: resultEntrySequenceSha256(resultEntries.filter((entry) => entry.providerKind === "automated-result-manifest" && entry.providerId === commandId)),
    recordSha256: "0".repeat(64)
  }))

  const coverageSequence = sequenceSha256("coverageCell", coverageCells, "coverageCellId")
  const assertionSequence = sequenceSha256("requirementAssertion", assertions, "assertionId")
  const findings = requirementRows.flatMap((row) => {
    const findingId = findingIdByRequirementId.get(row.requirementId)
    if (findingId === undefined) return []
    const laneIndex = LANE_IDS.indexOf(row.ownerLaneId)
    return [sealRecord("finding", {
      findingId,
      laneId: row.ownerLaneId,
      agentId: AGENT_ID_BY_LANE[row.ownerLaneId],
      requirementId: row.requirementId,
      coverageCellId: row.coverageCellId,
      sourceClauseId: row.sourceClauseId,
      authorityAtomId: row.authorityAtomId,
      authorityClauseIds: row.authorityClauseIds,
      authorityBindingIds: row.authorityBindingIds,
      authorityRouteScopes: row.authorityRouteScopes,
      sourcePath: row.sourcePath,
      sourceBlobSha: row.sourceBlobSha,
      severity: "high",
      status: "open",
      releaseBlocking: true,
      recommendation: "do-not-recommend",
      reproductionTaskContractSha256: LANE_CONTRACTS[laneIndex].taskContractSha256,
      recordSha256: "0".repeat(64)
    })]
  })
  const findingSequences = laneSequenceMap(findings)
  const agentRuns = LANE_IDS.map((laneId, index) => sealRecord("agentRun", {
    agentRunId: `P008-AGENT-RUN-${String(index + 1).padStart(2, "0")}`,
    laneId,
    agentId: AGENT_ID_BY_LANE[laneId],
    taskContractSha256: LANE_CONTRACTS[index].taskContractSha256,
    taskReceiptId: taskReceipts[index].receiptId,
    taskReceiptSha256: taskReceipts[index].recordSha256,
    firstPassReceiptId: firstPassReceipts[index].receiptId,
    firstPassReceiptSha256: firstPassReceipts[index].recordSha256,
    reviewedJourneyIds: JOURNEY_IDS,
    reviewedRequirementIds: requirementRows
      .filter((row) => row.ownerLaneId === laneId)
      .map((row) => row.requirementId),
    findingIds: findings.filter((finding) => finding.laneId === laneId).map((finding) => finding.findingId),
    coverageSequenceSha256: coverageSequence,
    assertionSequenceSha256: assertionSequence,
    findingSequenceSha256: findingSequences[laneId],
    recommendation: findings.some((finding) => finding.laneId === laneId) ? "do-not-recommend" : "agent-only-recommend",
    basisCode: findings.some((finding) => finding.laneId === laneId) ? "open-release-blocker" : "complete-closure-no-open-blocker",
    outputSha256: "0".repeat(64)
  }))

  const dissentPositions = LANE_IDS.map((laneId, index) => sealRecord("dissentPosition", {
    positionId: `P008-POSITION-${String(index + 1).padStart(2, "0")}`,
    laneId,
    agentId: AGENT_ID_BY_LANE[laneId],
    consensusQuestionId: "P008-CONSENSUS-RELEASE",
    position: agentRuns[index].recommendation,
    basisCode: agentRuns[index].basisCode,
    findingIds: agentRuns[index].findingIds,
    recordSha256: "0".repeat(64)
  }))
  const dissentGroups = new Set(dissentPositions.map((position) => position.position)).size === 1
    ? []
    : [sealRecord("dissentGroup", {
        groupId: "P008-DISSENT-01",
        consensusQuestionId: "P008-CONSENSUS-RELEASE",
        positionIds: dissentPositions.map((position) => position.positionId),
        status: "recorded",
        recordSha256: "0".repeat(64)
      })]
  const dissentMatrix = dissentPositions.map((position) => withRecordMetadata({
    laneId: position.laneId,
    positionId: position.positionId,
    position: position.position,
    groupId: dissentGroups[0]?.groupId ?? null,
    positionRecordSha256: position.recordSha256
  }))
  const automatedRunSequence = sequenceSha256("automatedRun", automatedRuns, "runId")
  const laneOutputs = laneOutputMap(agentRuns)
  const consensus = sealRecord("consensus", {
    consensusId: "P008-CONSENSUS-01",
    laneOutputSha256ByLaneId: laneOutputs,
    findingSequenceSha256ByLaneId: findingSequences,
    dissentPositionSequenceSha256: sequenceSha256("dissentPosition", dissentPositions, "positionId"),
    dissentGroupSequenceSha256: sequenceSha256("dissentGroup", dissentGroups, "groupId"),
    dissentMatrixSha256: sha256Canonical(dissentMatrix),
    coverageSequenceSha256: coverageSequence,
    assertionSequenceSha256: assertionSequence,
    automatedRunSequenceSha256: automatedRunSequence,
    recommendation: findings.length > 0 ? "do-not-recommend" : "agent-only-recommend",
    openBlockingFindingIds: findings.map((finding) => finding.findingId),
    basisCode: findings.length > 0 ? "open-release-blocker" : "complete-closure-no-open-blocker",
    recordSha256: "0".repeat(64)
  })

  const bundle = {
    schemaVersion: 1,
    bundleId: "P008-EVIDENCE-01",
    mode: "real-evidence",
    published: false,
    publishedPacketCommit: null,
    packetBytesRootSha256: null,
    ...REAL_PERMANENT_VALUES,
    executionManifest,
    taskReceipts,
    firstPassReceipts,
    firstPassReceiptSeal: {
      commit: "0".repeat(40),
      path: "fixture/first-pass-receipts.json",
      sha256: "0".repeat(64),
      gitBlobSha: "0".repeat(40)
    },
    externalAnchor: {
      ...dependencyInterface.trustedExternalAnchor
    },
    environmentObservations,
    automatedRuns,
    assertions,
    coverageCells,
    findings,
    agentRuns,
    dissentPositions,
    dissentGroups,
    dissentMatrix,
    consensus,
    finalEvidence: {
      finalEvidenceId: "P008-FINAL-EVIDENCE-01",
      contractRootSha256: contractRoot,
      manifestSha256: executionManifest.manifestSha256,
      published: false,
      publishedPacketCommit: null,
      packetBytesRootSha256: null,
      taskReceiptSequenceSha256: sequenceSha256("taskReceipt", taskReceipts, "receiptId"),
      firstPassReceiptSequenceSha256: sequenceSha256("firstPassReceipt", firstPassReceipts, "receiptId"),
      firstPassReceiptSealSha256: "0".repeat(64),
      automatedResultManifestCoordinateRootSha256: "0".repeat(64),
      firstPassArtifactCoordinateRootSha256: "0".repeat(64),
      externalAnchorSha256: "0".repeat(64),
      environmentSequenceSha256: sequenceSha256("environmentObservation", environmentObservations, "environmentId"),
      automatedRunSequenceSha256: automatedRunSequence,
      assertionSequenceSha256: assertionSequence,
      coverageSequenceSha256: coverageSequence,
      findingSequenceSha256ByLaneId: findingSequences,
      laneOutputSha256ByLaneId: laneOutputs,
      dissentPositionSequenceSha256: sequenceSha256("dissentPosition", dissentPositions, "positionId"),
      dissentGroupSequenceSha256: sequenceSha256("dissentGroup", dissentGroups, "groupId"),
      dissentMatrixSha256: sha256Canonical(dissentMatrix),
      consensusRecordSha256: consensus.recordSha256,
      recordCounts: {},
      recommendation: consensus.recommendation,
      productionAuthorization: false,
      recordSha256: "0".repeat(64)
    },
    finalEvidenceRootSha256: "0".repeat(64)
  }
  bundle.finalEvidence.recordCounts = finalRecordCounts(bundle)
  sealRecord("finalEvidence", bundle.finalEvidence)
  bundle.finalEvidenceRootSha256 = sha256Canonical(finalEvidenceRootProjection(bundle, contractRoot))
  return bundle
}

const resealBundle = (bundle, requirementRows, contractRoot) => {
  sealRecord("executionManifest", bundle.executionManifest)
  bundle.taskReceipts.forEach((record) => {
    record.manifestSha256 = bundle.executionManifest.manifestSha256
    sealRecord("taskReceipt", record)
  })
  bundle.firstPassReceipts.forEach((record) => sealRecord("firstPassReceipt", record))
  bundle.environmentObservations.forEach((record) => sealRecord("environmentObservation", record))
  bundle.assertions.forEach((record) => sealRecord("requirementAssertion", record))
  const assertionById = new Map(bundle.assertions.map((record) => [record.assertionId, record]))
  bundle.coverageCells.forEach((record) => {
    const assertion = assertionById.get(record.assertionId)
    if (assertion !== undefined) record.assertionRecordSha256 = assertion.recordSha256
    sealRecord("coverageCell", record)
  })
  bundle.findings.forEach((record) => sealRecord("finding", record))
  bundle.automatedRuns.forEach((record) => sealRecord("automatedRun", record))
  const coverageSequence = sequenceSha256("coverageCell", bundle.coverageCells, "coverageCellId")
  const assertionSequence = sequenceSha256("requirementAssertion", bundle.assertions, "assertionId")
  const findingSequences = laneSequenceMap(bundle.findings)
  for (let index = 0; index < bundle.agentRuns.length; index += 1) {
    const run = bundle.agentRuns[index]
    const taskReceipt = bundle.taskReceipts.find((receipt) => receipt.receiptId === run.taskReceiptId)
    const firstReceipt = bundle.firstPassReceipts.find((receipt) => receipt.receiptId === run.firstPassReceiptId)
    if (taskReceipt !== undefined) run.taskReceiptSha256 = taskReceipt.recordSha256
    if (firstReceipt !== undefined) run.firstPassReceiptSha256 = firstReceipt.recordSha256
    run.coverageSequenceSha256 = coverageSequence
    run.assertionSequenceSha256 = assertionSequence
    if (LANE_IDS.includes(run.laneId)) run.findingSequenceSha256 = findingSequences[run.laneId]
    sealRecord("agentRun", run)
  }
  bundle.dissentPositions.forEach((record) => sealRecord("dissentPosition", record))
  bundle.dissentGroups.forEach((record) => sealRecord("dissentGroup", record))
  bundle.dissentMatrix.forEach((row) => {
    const position = bundle.dissentPositions.find((candidate) => candidate.positionId === row.positionId)
    if (position !== undefined) row.positionRecordSha256 = position.recordSha256
  })
  const automatedRunSequence = sequenceSha256("automatedRun", bundle.automatedRuns, "runId")
  const laneOutputs = laneOutputMap(bundle.agentRuns)
  bundle.consensus.laneOutputSha256ByLaneId = laneOutputs
  bundle.consensus.findingSequenceSha256ByLaneId = findingSequences
  bundle.consensus.dissentPositionSequenceSha256 = sequenceSha256("dissentPosition", bundle.dissentPositions, "positionId")
  bundle.consensus.dissentGroupSequenceSha256 = sequenceSha256("dissentGroup", bundle.dissentGroups, "groupId")
  bundle.consensus.dissentMatrixSha256 = sha256Canonical(bundle.dissentMatrix)
  bundle.consensus.coverageSequenceSha256 = coverageSequence
  bundle.consensus.assertionSequenceSha256 = assertionSequence
  bundle.consensus.automatedRunSequenceSha256 = automatedRunSequence
  sealRecord("consensus", bundle.consensus)
  Object.assign(bundle.finalEvidence, {
    contractRootSha256: contractRoot,
    manifestSha256: bundle.executionManifest.manifestSha256,
    taskReceiptSequenceSha256: sequenceSha256("taskReceipt", bundle.taskReceipts, "receiptId"),
    firstPassReceiptSequenceSha256: sequenceSha256("firstPassReceipt", bundle.firstPassReceipts, "receiptId"),
    firstPassReceiptSealSha256: bundle.firstPassReceiptSeal.sha256,
    automatedResultManifestCoordinateRootSha256: automatedResultManifestCoordinateRoot(bundle.automatedRuns),
    firstPassArtifactCoordinateRootSha256: firstPassArtifactCoordinateRoot(bundle),
    externalAnchorSha256: bundle.externalAnchor.sha256,
    environmentSequenceSha256: sequenceSha256("environmentObservation", bundle.environmentObservations, "environmentId"),
    automatedRunSequenceSha256: automatedRunSequence,
    assertionSequenceSha256: assertionSequence,
    coverageSequenceSha256: coverageSequence,
    findingSequenceSha256ByLaneId: findingSequences,
    laneOutputSha256ByLaneId: laneOutputs,
    dissentPositionSequenceSha256: bundle.consensus.dissentPositionSequenceSha256,
    dissentGroupSequenceSha256: bundle.consensus.dissentGroupSequenceSha256,
    dissentMatrixSha256: bundle.consensus.dissentMatrixSha256,
    consensusRecordSha256: bundle.consensus.recordSha256,
    recordCounts: finalRecordCounts(bundle),
    recommendation: bundle.consensus.recommendation
  })
  sealRecord("finalEvidence", bundle.finalEvidence)
  bundle.finalEvidenceRootSha256 = sha256Canonical(finalEvidenceRootProjection(bundle, contractRoot))
  return bundle
}

const runGit = (args, cwd) => execFileSync("git", args, {
  cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: GIT_MAX_BUFFER
}).trim()
const writeFixtureFile = (root, path, bytes) => {
  assertSafeRepositoryPath(path, "FIXTURE_PATH", "isolated fixture path")
  const absolute = join(root, path)
  mkdirSync(dirname(absolute), { recursive: true })
  writeFileSync(absolute, bytes)
}
const commitFixture = (root, message) => {
  runGit(["add", "-A"], root)
  runGit(["commit", "-q", "-m", message], root)
  return runGit(["rev-parse", "HEAD"], root)
}

const makeAutomatedResultManifest = (
  run,
  environment,
  executionManifest,
  dependencyInterface,
  requirementRows,
  resultEntries
) => {
  const assertionResults = resultEntries.filter((entry) =>
    entry.providerKind === "automated-result-manifest" && entry.providerId === run.commandId
  )
  const failed = assertionResults.filter((entry) => entry.result === "failed").length
  const manifest = withRecordMetadata({
    schemaVersion: 1,
    manifestId: run.resultManifestId,
    evidenceMode: EVIDENCE_BUNDLE_CONTRACT.privateFixtureEvidenceMode,
    runId: run.runId,
    commandId: run.commandId,
    executionBaseSha: dependencyInterface.executionBaseSha,
    commandContractSha256: commandContractSha256(),
    toolchainManifestSha256: environment.toolchainManifestSha256,
    assertionContractRootSha256: assertionContractRootSha256(requirementRows),
    exitCode: failed === 0 ? 0 : 1,
    result: failed === 0 ? "passed" : "failed",
    assertionResults,
    counts: {
      assertions: assertionResults.length,
      passed: assertionResults.length - failed,
      failed
    },
    assertionResultSequenceSha256: resultEntrySequenceSha256(assertionResults),
    manifestSha256: "0".repeat(64)
  })
  manifest.manifestSha256 = projectedDigest(manifest, "manifestSha256")
  return manifest
}

const makeFirstPassArtifact = (
  laneId,
  index,
  executionManifest,
  dependencyInterface,
  requirementRows,
  resultEntries
) => {
  const assertionResults = resultEntries.filter((entry) =>
    entry.providerKind === "codex-first-pass-artifact" && entry.providerId === laneId
  )
  const failed = assertionResults.filter((entry) => entry.result === "failed").length
  const artifact = withRecordMetadata({
    schemaVersion: 1,
    artifactId: `P008-FIRST-PASS-ARTIFACT-${String(index + 1).padStart(2, "0")}`,
    evidenceMode: EVIDENCE_BUNDLE_CONTRACT.privateFixtureEvidenceMode,
    laneId,
    agentId: AGENT_ID_BY_LANE[laneId],
    executionBaseSha: dependencyInterface.executionBaseSha,
    manifestSha256: executionManifest.manifestSha256,
    taskContractSha256: LANE_CONTRACTS[index].taskContractSha256,
    peerOutputsVisible: false,
    assertionResults,
    counts: {
      assertions: assertionResults.length,
      passed: assertionResults.length - failed,
      failed
    },
    assertionResultSequenceSha256: resultEntrySequenceSha256(assertionResults),
    artifactRecordSha256: "0".repeat(64)
  })
  artifact.artifactRecordSha256 = projectedDigest(artifact, "artifactRecordSha256")
  return artifact
}

const createIsolatedRealFixture = (requirementRows, contractRoot, failedRequirementId = null) => {
  const root = mkdtempSync(join(tmpdir(), "plan008-real-evidence-fixture-"))
  runGit(["init", "-q"], root)
  runGit(["config", "user.name", "Plan 008 fixture"], root)
  runGit(["config", "user.email", "fixture@invalid.example"], root)
  const definitions = [
    ["02", "005", "learner-task-navigation-contract"],
    ["03", "006", "consumer-visual-system-and-route-archetypes"],
    ["04", "007", "component-foundation-and-responsive-contract"]
  ]
  const steps = []
  let anchorPrivateKey
  let trustedExternalAnchor
  const blueprints = requirementRows.map((row) => makeFixtureCaseBlueprint(
    row,
    row.requirementId === failedRequirementId ? "failed" : "passed"
  ))
  for (const [programStepId, planId, acceptedOutput] of definitions) {
    const path = `fixture/dependencies/step-${programStepId}-primary.md`
    const bytes = `# Isolated Step ${programStepId} primary artifact\n\nStructural evidence fixture only.\n`
    const dispositionClauseId = `P008-FIXTURE-STEP-${programStepId}-ACCEPTED`
    const acceptanceRecordPath = `fixture/dependencies/step-${programStepId}-acceptance.json`
    const dispositionPath = `fixture/dependencies/step-${programStepId}-disposition.json`
    const acceptance = {
      contractVersion: "CODEX-ONLY-UIUX-V1/DEPENDENCY-ACCEPTANCE-V1",
      programStepId,
      planId,
      acceptedOutput,
      primaryArtifact: {
        path,
        sha256: sha256Text(bytes),
        gitBlobSha: gitBlobSha(bytes),
        gitMode: "100644"
      },
      validationModel: "CODEX-ONLY-UIUX-V1",
      reviewMode: "codex-only",
      participantEvidence: "none",
      humanEvidence: "none",
      participantCount: 0,
      humanParticipantCount: 0,
      notHumanUsabilityTested: true,
      agentsCountAsPeople: false,
      humanBehaviorEvidence: false,
      realDeviceAssistiveTechnologyEvidence: false,
      productionAuthorization: false,
      upstreamDisposition: "accepted-codex-only",
      programStatus: "codex-only-complete",
      acceptanceBasis: "merged-origin-main-plus-bound-canonical-disposition",
      recordSha256: "0".repeat(64)
    }
    acceptance.recordSha256 = projectedDigest(acceptance, "recordSha256")
    const disposition = {
      contractVersion: "CODEX-ONLY-UIUX-V1/DEPENDENCY-DISPOSITION-V1",
      programStepId,
      planId,
      dispositionClauseId,
      status: "accepted-codex-only",
      validationModel: "CODEX-ONLY-UIUX-V1",
      reviewMode: "codex-only",
      humanEvidence: "none",
      humanParticipantCount: 0,
      notHumanUsabilityTested: true,
      productionAuthorization: false,
      recordSha256: "0".repeat(64)
    }
    disposition.recordSha256 = projectedDigest(disposition, "recordSha256")
    const acceptanceRaw = `${canonicalJson(acceptance)}\n`
    const dispositionRaw = `${canonicalJson(disposition)}\n`
    writeFixtureFile(root, path, bytes)
    writeFixtureFile(root, acceptanceRecordPath, acceptanceRaw)
    writeFixtureFile(root, dispositionPath, dispositionRaw)
    if (programStepId === "04") {
      for (const blueprint of blueprints) {
        writeFixtureFile(root, blueprint.implementationPath, blueprint.implementationBytes)
      }
    }
    const requiredSha = commitFixture(root, `Add isolated Step ${programStepId} fixture`)
    steps.push({
      programStepId,
      planId,
      acceptedOutput,
      requiredSha,
      requiredArtifactPath: path,
      artifactSha256: sha256Text(bytes),
      artifactGitBlobSha: gitBlobSha(bytes),
      artifactGitMode: "100644",
      acceptanceRecordKind: "native-codex-only-acceptance-v1",
      acceptanceRecordPath,
      acceptanceRecordSha256: sha256Text(acceptanceRaw),
      acceptanceRecordGitBlobSha: gitBlobSha(acceptanceRaw),
      acceptanceRecordGitMode: "100644",
      dispositionPath,
      dispositionSha256: sha256Text(dispositionRaw),
      dispositionGitBlobSha: gitBlobSha(dispositionRaw),
      dispositionGitMode: "100644",
      dispositionClauseId,
      dispositionClauseSha256: sha256Text(`${dispositionClauseId}\n`),
      acceptanceStatus: "accepted-codex-only"
    })
  }
  const { publicKey, privateKey } = generateKeyPairSync("ed25519")
  anchorPrivateKey = privateKey
  const anchorPath = "fixture/trust/external-anchor.json"
  const anchor = externalAnchorProjection({
    anchorParentSha: steps.at(-1).requiredSha,
    dependencyShas: Object.fromEntries(steps.map((step) => [step.programStepId, step.requiredSha])),
    publicKeySpkiBase64: publicKey.export({ format: "der", type: "spki" }).toString("base64"),
    challengeBase64: randomBytes(32).toString("base64")
  })
  anchor.anchorRecordSha256 = projectedDigest(anchor, "anchorRecordSha256")
  const anchorRaw = `${canonicalJson(anchor)}\n`
  writeFixtureFile(root, anchorPath, anchorRaw)
  const anchorCommit = commitFixture(root, "Commit isolated immutable signing-key coordinate")
  trustedExternalAnchor = {
    commit: anchorCommit,
    path: anchorPath,
    sha256: sha256Text(anchorRaw),
    gitBlobSha: gitBlobSha(anchorRaw)
  }
  const executionBaseRaw = `${canonicalJson({
    contractVersion: "CODEX-ONLY-UIUX-V1/ISOLATED-EXECUTION-BASE-V1",
    trustedExternalAnchor
  })}\n`
  writeFixtureFile(root, "fixture/execution-base.json", executionBaseRaw)
  const executionBaseSha = commitFixture(root, "Establish isolated execution base")
  const dependencyInterface = {
    mode: EXPECTED_DEPENDENCIES.mode,
    ready: true,
    executionBaseSha,
    trustedExternalAnchor,
    requiredSteps: steps,
    futureResolutionRequirements: EXPECTED_DEPENDENCIES.futureResolutionRequirements
  }
  const proofByAssertionId = new Map()
  const resultEntries = []
  for (const blueprint of blueprints) {
    const execution = spawnSync(process.execPath, [join(root, blueprint.implementationPath)], {
      cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"]
    })
    if (execution.error || execution.status !== (blueprint.result === "passed" ? 0 : 1)) {
      fail("FIXTURE_IMPLEMENTATION", "isolated fixture executable failed")
    }
    const proofAndEntry = makeFixtureProofAndEntry(blueprint, execution.stdout)
    proofByAssertionId.set(blueprint.row.assertionContractId, proofAndEntry)
    resultEntries.push(proofAndEntry.entry)
  }
  const bundle = makePositiveBundle(dependencyInterface, requirementRows, contractRoot, resultEntries)

  const automatedManifestRawByRunId = new Map()
  for (const entry of resultEntries.filter((candidate) => candidate.providerKind === "automated-result-manifest")) {
    writeFixtureFile(root, entry.proofPath, proofByAssertionId.get(entry.assertionId).proofRaw)
  }
  for (const run of bundle.automatedRuns) {
    const environment = bundle.environmentObservations.find((candidate) => candidate.environmentId === run.environmentId)
    const manifest = makeAutomatedResultManifest(
      run,
      environment,
      bundle.executionManifest,
      dependencyInterface,
      requirementRows,
      resultEntries
    )
    const raw = `${canonicalJson(manifest)}\n`
    automatedManifestRawByRunId.set(run.runId, { manifest, raw })
    writeFixtureFile(root, run.resultManifestPath, raw)
  }
  const automatedManifestCommit = commitFixture(root, "Commit isolated machine result manifests")
  for (const run of bundle.automatedRuns) {
    const { manifest, raw } = automatedManifestRawByRunId.get(run.runId)
    run.result = manifest.result
    run.resultManifestCommit = automatedManifestCommit
    run.resultManifestSha256 = sha256Text(raw)
    run.resultManifestGitBlobSha = gitBlobSha(raw)
    run.assertionResultSequenceSha256 = manifest.assertionResultSequenceSha256
    for (const entry of manifest.assertionResults) {
      const assertion = bundle.assertions.find((candidate) => candidate.assertionId === entry.assertionId)
      assertion.providerArtifactSha256 = run.resultManifestSha256
    }
  }

  for (const entry of resultEntries.filter((candidate) => candidate.providerKind === "codex-first-pass-artifact")) {
    writeFixtureFile(root, entry.proofPath, proofByAssertionId.get(entry.assertionId).proofRaw)
  }
  for (let index = 0; index < LANE_IDS.length; index += 1) {
    const laneId = LANE_IDS[index]
    const artifact = makeFirstPassArtifact(
      laneId,
      index,
      bundle.executionManifest,
      dependencyInterface,
      requirementRows,
      resultEntries
    )
    const raw = `${canonicalJson(artifact)}\n`
    const receipt = bundle.firstPassReceipts[index]
    receipt.firstPassArtifactSha256 = sha256Text(raw)
    receipt.firstPassArtifactGitBlobSha = gitBlobSha(raw)
    writeFixtureFile(root, receipt.firstPassArtifactPath, raw)
    for (const entry of artifact.assertionResults) {
      const assertion = bundle.assertions.find((candidate) => candidate.assertionId === entry.assertionId)
      assertion.providerArtifactSha256 = receipt.firstPassArtifactSha256
    }
  }
  for (let index = 0; index < LANE_IDS.length; index += 1) {
    const taskReceipt = bundle.taskReceipts[index]
    const firstReceipt = bundle.firstPassReceipts[index]
    const taskNative = sealProjectedReceipt(nativeTaskReceiptProjection(taskReceipt))
    const firstNative = sealProjectedReceipt(nativeFirstPassReceiptProjection(firstReceipt))
    const taskRaw = `${canonicalJson(taskNative)}\n`
    const firstRaw = `${canonicalJson(firstNative)}\n`
    taskReceipt.nativeReceiptSha256 = sha256Text(taskRaw)
    taskReceipt.nativeReceiptGitBlobSha = gitBlobSha(taskRaw)
    firstReceipt.nativeReceiptSha256 = sha256Text(firstRaw)
    firstReceipt.nativeReceiptGitBlobSha = gitBlobSha(firstRaw)
    writeFixtureFile(root, taskReceipt.nativeReceiptPath, taskRaw)
    writeFixtureFile(root, firstReceipt.nativeReceiptPath, firstRaw)
  }
  resealBundle(bundle, requirementRows, contractRoot)
  const firstPassSealRaw = `${canonicalJson(firstPassReceiptSealProjection(bundle, dependencyInterface.executionBaseSha))}\n`
  const firstPassSealPath = "fixture/first-pass-receipts.json"
  writeFixtureFile(root, firstPassSealPath, firstPassSealRaw)
  const firstPassSealCommit = commitFixture(root, "Seal isolated first-pass artifacts and receipts")
  bundle.firstPassReceiptSeal = {
    commit: firstPassSealCommit,
    path: firstPassSealPath,
    sha256: sha256Text(firstPassSealRaw),
    gitBlobSha: gitBlobSha(firstPassSealRaw)
  }
  resealBundle(bundle, requirementRows, contractRoot)
  const bundleRaw = `${canonicalJson(bundle)}\n`
  const evidencePath = "fixture/evidence.json"
  writeFixtureFile(root, evidencePath, bundleRaw)
  const evidenceCommit = commitFixture(root, "Commit isolated evidence fixture")
  const seal = withRecordMetadata({
    sealVersion: "CODEX-ONLY-UIUX-V1/EXTERNAL-SEAL-V1",
    published: bundle.published,
    publishedPacketCommit: bundle.publishedPacketCommit,
    packetBytesRootSha256: bundle.packetBytesRootSha256,
    bundleSha256: sha256Text(bundleRaw),
    finalEvidenceRootSha256: bundle.finalEvidenceRootSha256,
    executionBaseSha: dependencyInterface.executionBaseSha,
    contractRootSha256: contractRoot,
    firstPassReceiptSealSha256: bundle.firstPassReceiptSeal.sha256,
    automatedResultManifestCoordinateRootSha256: automatedResultManifestCoordinateRoot(bundle.automatedRuns),
    firstPassArtifactCoordinateRootSha256: firstPassArtifactCoordinateRoot(bundle),
    externalAnchorCommit: bundle.externalAnchor.commit,
    externalAnchorPath: bundle.externalAnchor.path,
    externalAnchorSha256: bundle.externalAnchor.sha256,
    externalAnchorGitBlobSha: bundle.externalAnchor.gitBlobSha,
    evidenceCommit,
    evidencePath,
    evidenceGitBlobSha: gitBlobSha(bundleRaw),
    sealParentSha: evidenceCommit,
    signatureAlgorithm: "ed25519",
    signedPayloadSha256: "0".repeat(64),
    signatureBase64: "pending"
  })
  const signedProjection = externalSealSignedProjection(seal)
  const signedBytes = Buffer.from(canonicalJson(signedProjection), "utf8")
  seal.signedPayloadSha256 = sha256Bytes(signedBytes)
  seal.signatureBase64 = sign(null, signedBytes, anchorPrivateKey).toString("base64")
  writeFixtureFile(root, "fixture/seal.json", `${canonicalJson(seal)}\n`)
  const sealCommit = commitFixture(root, "Add isolated external seal fixture")
  return {
    root,
    dependencyInterface,
    bundle,
    bundleRaw,
    anchorPrivateKey,
    expectedRoot: bundle.finalEvidenceRootSha256,
    anchorRef: { commit: trustedExternalAnchor.commit, path: trustedExternalAnchor.path },
    sealRef: { commit: sealCommit, path: "fixture/seal.json" }
  }
}

const validateRequirementRowExact = (candidate, expected) => {
  exactValue(candidate, expected, "SELF_REQUIREMENT_BOUNDARY", "requirement row")
}
const validateLocalAssertionContract = (candidate, expected) => {
  exactKeys(candidate, [
    "assertionId", "assertionContractId", "requirementId", "coverageCellId",
    "sourceClauseId", "applicable"
  ], "SELF_ASSERTION_BOUNDARY", "local assertion contract")
  exactValue(candidate, {
    assertionId: expected.assertionContractId,
    assertionContractId: expected.assertionContractId,
    requirementId: expected.requirementId,
    coverageCellId: expected.coverageCellId,
    sourceClauseId: expected.sourceClauseId,
    applicable: true
  }, "SELF_ASSERTION_BOUNDARY", "local assertion contract")
}

const makeTestRegistry = (context, fixtureRef) => {
  const tests = []
  const add = (id, expectedCode, run, secret = null) => tests.push({ id, expectedCode, run, secret })
  const rows = context.requirementRows

  const invalidRepositoryPaths = [
    "", "plans", "unknown/file.json", "/plans/file.json", "../plans/file.json",
    "plans/../file.json", "plans/./file.json", "plans//file.json", "plans/file.json/",
    "plans\\file.json", "plans/%2e%2e/file.json", "plans/../../product/file.json",
    "plans/．．/file.json"
  ]
  invalidRepositoryPaths.forEach((candidate, index) => add(
    `safe-path-negative-${index}`,
    "SAFE_PATH",
    () => assertSafeRepositoryPath(candidate, "SAFE_PATH", "path mutation"),
    candidate.length === 0 ? null : candidate
  ))
  for (const [index, candidate] of [
    "plans/evidence.json", "product/SCREEN_STATES.md", "apps/site/test.mjs",
    "packages/content/source.json", "fixture/results/P008-PROOF-0001.json"
  ].entries()) add(`safe-path-positive-${index}`, null, () => assertSafeRepositoryPath(candidate, "SAFE_PATH", "path control"))
  add("static-source-path-negative", "SOURCE_PATH", () =>
    assertSafeRepositoryPath("plans/../product/SCREEN_STATES.md", "SOURCE_PATH", "static source path"))

  const cliBase = [
    "--validate-real-evidence", "plans/evidence.json", "--expected-root", "a".repeat(64),
    "--anchor", `${"b".repeat(40)}:plans/anchor.json`,
    "--seal", `${"c".repeat(40)}:plans/seal.json`
  ]
  add("cli-path-positive", null, () => parseRealModeArguments(cliBase))
  for (const [index, candidate] of [
    "/plans/evidence.json", "../plans/evidence.json", "plans\\evidence.json",
    "plans/./evidence.json", "plans//evidence.json", "fixture/evidence.json"
  ].entries()) add(`cli-bundle-path-negative-${index}`, "CLI_USAGE", () => {
    const args = [...cliBase]; args[1] = candidate; parseRealModeArguments(args)
  }, candidate)
  for (const [index, candidate] of [
    `${"b".repeat(40)}:/plans/anchor.json`,
    `${"b".repeat(40)}:plans/../anchor.json`,
    `${"b".repeat(40)}:plans\\anchor.json`,
    `${"b".repeat(40)}:plans//anchor.json`
  ].entries()) add(`cli-coordinate-path-negative-${index}`, "CLI_USAGE", () => {
    const args = [...cliBase]; args[5] = candidate; parseRealModeArguments(args)
  }, candidate)

  for (const row of rows) {
    const suffix = row.requirementId.toLowerCase()
    add(`requirement-target-${suffix}`, "SELF_REQUIREMENT_BOUNDARY", () => {
      const candidate = clone(row); candidate.targetId = `${candidate.targetId}-mutated`
      validateRequirementRowExact(candidate, row)
    })
    add(`requirement-applicability-${suffix}`, "SELF_REQUIREMENT_BOUNDARY", () => {
      const candidate = clone(row); candidate.applicable = false
      validateRequirementRowExact(candidate, row)
    })
    add(`requirement-clause-${suffix}`, "SELF_REQUIREMENT_BOUNDARY", () => {
      const candidate = clone(row); candidate.sourceClauseId = "P008-REQ-9999"
      validateRequirementRowExact(candidate, row)
    })
    add(`requirement-source-blob-${suffix}`, "SELF_REQUIREMENT_BOUNDARY", () => {
      const candidate = clone(row); candidate.sourceBlobSha = "0".repeat(40)
      validateRequirementRowExact(candidate, row)
    })
    add(`requirement-owner-${suffix}`, "SELF_REQUIREMENT_BOUNDARY", () => {
      const candidate = clone(row); candidate.ownerLaneId = LANE_IDS.find((lane) => lane !== row.ownerLaneId)
      validateRequirementRowExact(candidate, row)
    })
    add(`assertion-contract-${suffix}`, "SELF_ASSERTION_BOUNDARY", () => {
      validateLocalAssertionContract({
        assertionId: "P008-AST-9999",
        assertionContractId: row.assertionContractId,
        requirementId: row.requirementId,
        coverageCellId: row.coverageCellId,
        sourceClauseId: row.sourceClauseId,
        applicable: true
      }, row)
    })
  }

  for (const [schemaName, schema] of Object.entries(PRIVATE_SCHEMAS)) {
    schema.requiredFields.forEach((field, index) => add(
      `private-schema-${schemaName}-required-${index}`,
      "PRIVATE_SCHEMA_CONTRACT",
      () => {
        const mutated = clone(PRIVATE_SCHEMAS)
        mutated[schemaName].requiredFields[index] = "fabricatedAgentApproval"
        validatePrivateSchemas(mutated)
      }
    ))
  }
  PRIVATE_SCHEMAS.privateEnvironmentObservation.prohibitedFields.forEach((field, index) => add(
    `private-environment-prohibited-${index}`,
    "PRIVATE_SCHEMA_CONTRACT",
    () => {
      const mutated = clone(PRIVATE_SCHEMAS)
      mutated.privateEnvironmentObservation.prohibitedFields =
        mutated.privateEnvironmentObservation.prohibitedFields.filter((candidate) => candidate !== field)
      validatePrivateSchemas(mutated)
    }
  ))

  const canonicalAttacks = [
    "Run two moderated rounds of 6-8 participants.",
    "The maintainer must sign off before execution.",
    "The reviewer approves the final direction.",
    "Recruitment is required before the gate.",
    "decisionOwner: fabricated",
    "approvalArtifact: fabricated",
    "99 participants accepted the selected design.",
    "Deployment to production is permitted.",
    "The release may go live.",
    "The candidate is cleared to go live.",
    "Five learners completed the usability study.",
    "Complete a moderated round before exit.",
    "Human signoff is mandatory.",
    "A decision owner must approve.",
    "Use five volunteers before the gate.",
    "participants=99",
    "humanEvidence=observed",
    "productionAuthorized=true",
    "publishable",
    "NVDA_OK",
    "Fully accessible"
  ]
  canonicalAttacks.forEach((attack, index) => {
    add(`canonical-plan-human-gate-${index}`, "CANONICAL_HUMAN_GATE", () => {
      validateCanonicalDocumentSemantics(`${context.canonicalPlanRaw}\n${attack}\n`, "canonical Plan 008")
    })
    add(`canonical-readme-human-gate-${index}`, "CANONICAL_HUMAN_GATE", () => {
      validateCanonicalDocumentSemantics(`${context.planIndexRaw}\n${attack}\n`, "plan index")
    })
  })

  add("authority-positive-canonical", null, () =>
    validateScreenStateAuthority(clone(context.planJourneyContract.screenStateAuthority), context.screenStatesRaw))
  add("authority-route-remove-procedure-detail", "SCREEN_STATE_ROUTE_SET", () => {
    const authority = clone(context.planJourneyContract.screenStateAuthority)
    authority.routeOrder = authority.routeOrder.filter((routeId) => routeId !== "procedure-detail")
    validateScreenStateAuthority(authority, context.screenStatesRaw)
  })
  add("authority-route-duplicate-procedures-index", "SCREEN_STATE_ROUTE_SET", () => {
    const authority = clone(context.planJourneyContract.screenStateAuthority)
    authority.routeOrder[authority.routeOrder.indexOf("procedure-detail")] = "procedures-index"
    validateScreenStateAuthority(authority, context.screenStatesRaw)
  })
  add("authority-route-invent-contact", "SCREEN_STATE_ROUTE_SET", () => {
    const authority = clone(context.planJourneyContract.screenStateAuthority)
    authority.routeOrder[authority.routeOrder.indexOf("procedure-detail")] = "contact"
    validateScreenStateAuthority(authority, context.screenStatesRaw)
  })
  add("authority-static-spoke-remove-actual-questions", "SCREEN_STATE_STATIC_SPOKES", () => {
    const authority = clone(context.planJourneyContract.screenStateAuthority)
    authority.staticSpokeRouteIds = authority.staticSpokeRouteIds.filter((routeId) => routeId !== "actual-questions-explainer")
    validateScreenStateAuthority(authority, context.screenStatesRaw)
  })
  add("authority-route-binding-remove-procedure-detail", "SCREEN_STATE_ROUTE_BINDING", () => {
    const authority = clone(context.planJourneyContract.screenStateAuthority)
    authority.routeBindings = authority.routeBindings.filter((binding) => binding.routeId !== "procedure-detail")
    authority.roots.routeBindingsSha256 = sha256Canonical(authority.routeBindings)
    validateScreenStateAuthority(authority, context.screenStatesRaw)
  })
  add("authority-state-remove-procedure-corrected", "SCREEN_STATE_COUNTS", () => {
    const authority = clone(context.planJourneyContract.screenStateAuthority)
    authority.stateAtoms = authority.stateAtoms.filter((atom) =>
      !(atom.routeScope.includes("procedure-detail") && atom.stateId === "corrected"))
    authority.roots.stateAtomsSha256 = sha256Canonical(authority.stateAtoms)
    validateScreenStateAuthority(authority, context.screenStatesRaw)
  })
  add("authority-state-duplicate", "SCREEN_STATE_STATE_DUPLICATE", () => {
    const authority = clone(context.planJourneyContract.screenStateAuthority)
    const duplicate = clone(authority.stateAtoms.find((atom) => atom.routeScope.includes("procedure-detail") && atom.stateId === "corrected"))
    duplicate.stateAtomId = authority.stateAtoms.at(-1).stateAtomId
    authority.stateAtoms[authority.stateAtoms.length - 1] = duplicate
    authority.roots.stateAtomsSha256 = sha256Canonical(authority.stateAtoms)
    validateScreenStateAuthority(authority, context.screenStatesRaw)
  })
  add("authority-transition-remove-correction-edge", "SCREEN_STATE_COUNTS", () => {
    const authority = clone(context.planJourneyContract.screenStateAuthority)
    const removedId = authority.transitionAtoms.find((atom) => atom.machineId === "correction")?.transitionAtomId
    authority.transitionAtoms = authority.transitionAtoms.filter((atom) => atom.transitionAtomId !== removedId)
    authority.roots.transitionAtomsSha256 = sha256Canonical(authority.transitionAtoms)
    validateScreenStateAuthority(authority, context.screenStatesRaw)
  })
  add("authority-transition-binding-remove-static-spoke", "SCREEN_STATE_COUNTS", () => {
    const authority = clone(context.planJourneyContract.screenStateAuthority)
    authority.transitionBindingOccurrences = authority.transitionBindingOccurrences.filter((entry) =>
      !(entry.transitionAtomId === "SS-AUTH-TRANS-0001" && entry.routeScope.includes("actual-questions-explainer")))
    authority.roots.transitionBindingOccurrencesSha256 = sha256Canonical(authority.transitionBindingOccurrences)
    validateScreenStateAuthority(authority, context.screenStatesRaw)
  })
  add("authority-screen-states-source-mutation", "SCREEN_STATE_SOURCE", () => {
    const mutatedSource = context.screenStatesRaw.replace("`procedure-detail`", "`procedure-details`")
    const authority = clone(context.planJourneyContract.screenStateAuthority)
    authority.sourceSha256 = sha256Text(mutatedSource)
    authority.sourceGitBlobSha = gitBlobSha(mutatedSource)
    validateScreenStateAuthority(authority, mutatedSource)
  })
  add("authority-stale-requirement-count-593", "SCREEN_STATE_COUNTS", () => {
    const authority = clone(context.planJourneyContract.screenStateAuthority)
    authority.counts.requirementCount = 593
    validateScreenStateAuthority(authority, context.screenStatesRaw)
  })
  add("authority-applicability-self-downgrade", "JOURNEY_CONTRACT", () => {
    const plan = clone(context.planJourneyContract)
    plan.applicability = "caller-selected"
    validatePlanJourneyContract(plan, context.screenStatesRaw, context.accessibilitySourceRawByPath)
  })
  add("authority-provider-self-downgrade", "JOURNEY_PROVIDER", () => {
    const plan = clone(context.planJourneyContract)
    plan.providerRules.defaultByRequirementKind["authority-route-transition-surface"].providerId = "packet-validator"
    validatePlanJourneyContract(plan, context.screenStatesRaw, context.accessibilitySourceRawByPath)
  })

  const claimSentinels = [
    "Deployment to production is permitted",
    "The release may go live",
    "The candidate is cleared to go live",
    "Five learners completed the usability study",
    "99 real participants approved production",
    "The selected design is final",
    "Plan 008 is DONE",
    "A real device was tested and validated",
    "NVDA was tested with users",
    "Automation replaces people",
    "WCAG certified and fully accessible",
    "The deployment has the green light.",
    "The candidate has the go-ahead.",
    "We can put the site into production.",
    "A cohort completed the usability study.",
    "The panel passed usability testing.",
    "We observed five people.",
    "Participant feedback supported the direction.",
    "An observed user preferred this layout.",
    "Moderated validation found no blockers.",
    "Screen-reader checks succeeded on phone.",
    "The packet meets WCAG 2.2 AA.",
    "Personas model learner preferences.",
    "The automated panel is equivalent to users.",
    "The release gate passed; proceed and ship.",
    "User research outcomes support moving forward.",
    "The rollout is ready and the site can launch.",
    "Production deployment received authorization.",
    "Authorization was granted for production deployment.",
    "Production rollout has clearance.",
    "Clearance exists to deploy the site.",
    "It is okay to launch.",
    "The website is fit to publish.",
    "The website can be published.",
    "The site is launchable.",
    "The release decision is positive.",
    "A no-blocker verdict permits release.",
    "Feedback from participants favored this direction.",
    "WCAG AA compliance was achieved.",
    "Conformance with WCAG 2.2 AA is established.",
    "Users are represented by the automated panel.",
    "Assistive tech emitted successful output.",
    "The rollout can commence.",
    "The checks passed, and the site may ship.",
    "Participants' outcomes, after review, supported the direction.",
    "REAL-device screen reader checks were successful.",
    "Publication is authorized.",
    "Distribution is approved.",
    "This can be released.",
    "This is suitable for release.",
    "The gate is green.",
    "No blockers remain; deployment can begin.",
    "The platform is cleared.",
    "The build is cleared.",
    "Learner input endorsed the layout.",
    "People liked the layout.",
    "The audience preferred the layout.",
    "Test subjects selected the layout.",
    "A human trial succeeded.",
    "The automated cohort mirrors humans.",
    "Personas stand for users.",
    "The model captures learner choices.",
    "VoiceOver worked.",
    "JAWS worked.",
    "TalkBack worked.",
    "Screenreader worked on mobile.",
    "AT output worked.",
    "AA conformance was achieved.",
    "The deployment decision was favorable.",
    "Publishing has been okayed.",
    "All release conditions are satisfied.",
    "The site got a thumbs up.",
    "Testers chose this version.",
    "A study population preferred it.",
    "Agents emulate people.",
    "The persona reflects users.",
    "Voice Over worked.",
    "AT checks worked.",
    "Conforms to Level AA.",
    "This version is publishable.",
    "NVDA behaved correctly.",
    "Go-live criteria are fulfilled.",
    "This may be distributed.",
    "Orca read it correctly.",
    "Narrator worked on Windows.",
    "Braille display output succeeded.",
    "publishable",
    "launchable",
    "participants=99",
    "humans=5",
    "humanParticipantCount=99",
    "humanEvidence=observed",
    "NVDA_OK",
    "screenreader-ok",
    "real-device-ok",
    "Fully accessible"
  ]
  claimSentinels.forEach((sentinel, index) => add(
    `claim-sentinel-${index}`,
    "PROHIBITED_CLAIM",
    () => validateSafeTree({ nested: { value: sentinel } }, "claim fixture"),
    sentinel
  ))
  claimSentinels.forEach((sentinel, index) => {
    const encoded = Buffer.from(JSON.stringify({ deep: { claim: sentinel } }), "utf8")
    add(`claim-decoded-json-${index}`, "PROHIBITED_CLAIM", () =>
      validateSafeTree({ nested: JSON.stringify({ deep: { claim: sentinel } }) }, "decoded claim fixture"), sentinel)
    add(`claim-decoded-base64-${index}`, "PROHIBITED_CLAIM", () =>
      validateSafeTree({ nested: encoded.toString("base64") }, "decoded claim fixture"), sentinel)
    add(`claim-decoded-base64-unpadded-${index}`, "PROHIBITED_CLAIM", () =>
      validateSafeTree({ nested: encoded.toString("base64").replace(/=+$/u, "") }, "decoded claim fixture"), sentinel)
    add(`claim-decoded-base64url-${index}`, "PROHIBITED_CLAIM", () =>
      validateSafeTree({ nested: encoded.toString("base64url") }, "decoded claim fixture"), sentinel)
    add(`claim-decoded-base64url-padded-${index}`, "PROHIBITED_CLAIM", () =>
      validateSafeTree({ nested: encoded.toString("base64url").padEnd(Math.ceil(encoded.toString("base64url").length / 4) * 4, "=") }, "decoded claim fixture"), sentinel)
  })

  const structuredClaimAttacks = [
    { productionAuthorized: true },
    { productionAuthorization: true },
    { humanParticipantCount: 99 },
    { participantCount: 99 },
    { humanSessionCount: 5 },
    { humanEvidence: "observed" },
    { participantEvidence: "recorded" },
    { notHumanUsabilityTested: false },
    { agentsCountAsPeople: true },
    { humanBehaviorEvidence: true },
    { realDeviceAssistiveTechnologyEvidence: true }
  ]
  structuredClaimAttacks.forEach((attack, index) => {
    const encoded = Buffer.from(JSON.stringify({ deep: attack }), "utf8")
    add(`claim-structured-raw-${index}`, "PROHIBITED_CLAIM", () =>
      validateSafeTree({ deep: attack }, "structured claim fixture"))
    add(`claim-structured-json-${index}`, "PROHIBITED_CLAIM", () =>
      validateSafeTree({ nested: JSON.stringify({ deep: attack }) }, "structured claim fixture"))
    add(`claim-structured-base64-${index}`, "PROHIBITED_CLAIM", () =>
      validateSafeTree({ nested: encoded.toString("base64") }, "structured claim fixture"))
    add(`claim-structured-base64-unpadded-${index}`, "PROHIBITED_CLAIM", () =>
      validateSafeTree({ nested: encoded.toString("base64").replace(/=+$/u, "") }, "structured claim fixture"))
    add(`claim-structured-base64url-${index}`, "PROHIBITED_CLAIM", () =>
      validateSafeTree({ nested: encoded.toString("base64url") }, "structured claim fixture"))
    add(`claim-structured-base64url-padded-${index}`, "PROHIBITED_CLAIM", () => {
      const base64url = encoded.toString("base64url")
      validateSafeTree({ nested: base64url.padEnd(Math.ceil(base64url.length / 4) * 4, "=") }, "structured claim fixture")
    })
  })

  const piiSentinels = [
    ["contact@example.test", "PII_EMAIL"],
    ["212-555-0199", "PII_PHONE"],
    ["212/555/0199", "PII_PHONE"],
    ["+12125550199", "PII_PHONE"],
    ["198.51.100.24", "PII_NETWORK"],
    ["2001:db8::1", "PII_NETWORK"],
    ["/home/sample/private.txt", "PII_PATH"],
    ["/Users/sample/private.txt", "PII_PATH"],
    ["C:\\Users\\sample\\private.txt", "PII_PATH"],
    ["c:\\users\\sample\\private.txt", "PII_PATH"],
    ["/root/private.txt", "PII_PATH"],
    ["~/private.txt", "PII_PATH"],
    ["candidate_id=CAND-0042", "PII_IDENTIFIER"],
    ["Applicant number: APP 0042", "PII_IDENTIFIER"],
    ["latitude=40.712800", "PII_LOCATION"],
    ["40.712800, -74.006000", "PII_LOCATION"],
    ["123 Sample Street", "PII_ADDRESS"],
    ["ZIP code 10001", "PII_POSTAL"],
    ["device serial is SN-482991", "PII_DEVICE"],
    ["212_555_0199", "PII_PHONE"],
    ["NY 10001", "PII_POSTAL"],
    ["10001", "PII_POSTAL"],
    ["candidate reference 0042", "PII_IDENTIFIER"],
    ["applicant ref APP/0042", "PII_IDENTIFIER"],
    ["serial number SN-482991", "PII_DEVICE"],
    ["Users/sample/private.txt", "PII_PATH"],
    ["/var/home/sample/private", "PII_PATH"],
    ["user path: documents/private", "PII_PATH"],
    ["candidate code C-0042", "PII_IDENTIFIER"],
    ["applicant code A0042", "PII_IDENTIFIER"],
    ["candidate ref: 42", "PII_IDENTIFIER"],
    ["applicant number 42", "PII_IDENTIFIER"],
    ["device code DEV-9999", "PII_IDENTIFIER"],
    ["computer name WORKSTATION-77", "PII_DEVICE"],
    ["/opt/users/sample/private", "PII_PATH"],
    ["home/sample/private", "PII_PATH"],
    ["\\\\host\\share\\Users\\sample", "PII_PATH"],
    ["sample@example", "PII_EMAIL"],
    ["sample [at] example.test", "PII_EMAIL"],
    ["0300.0250.0001.0001", "PII_NETWORK"],
    ["212x555x0199", "PII_PHONE"],
    ["212--555--0199", "PII_PHONE"],
    ["candidate key C42", "PII_IDENTIFIER"],
    ["applicant token 0042", "PII_IDENTIFIER"],
    ["exam candidate 0042", "PII_IDENTIFIER"],
    ["service tag ABC-1234", "PII_DEVICE"],
    ["asset tag DEV-1234", "PII_DEVICE"],
    ["host id HOST-42", "PII_DEVICE"],
    ["C:/profiles/sample/private", "PII_PATH"],
    ["/srv/home/sample/private", "PII_PATH"],
    ["/mnt/c/Users/sample/private", "PII_PATH"],
    ["user directory documents/private", "PII_PATH"],
    ["sample(at)example(dot)test", "PII_EMAIL"],
    ["sample @ example.test", "PII_EMAIL"],
    ["0xC0.0x00.0x02.0x01", "PII_NETWORK"],
    ["candidate handle C42", "PII_IDENTIFIER"],
    ["examinee id EX-42", "PII_IDENTIFIER"],
    ["test-taker id TT42", "PII_IDENTIFIER"],
    ["personnel id P42", "PII_IDENTIFIER"],
    ["device asset D-42", "PII_IDENTIFIER"],
    ["device inventory D42", "PII_IDENTIFIER"],
    ["asset number A42", "PII_DEVICE"],
    ["machine code M42", "PII_DEVICE"],
    ["computer code PC42", "PII_DEVICE"],
    ["C:/home/sample/file", "PII_PATH"],
    ["/mnt/d/Documents and Settings/sample/file", "PII_PATH"],
    ["profile path: docs/private", "PII_PATH"],
    ["profile directory docs/private", "PII_PATH"],
    ["sample AT example DOT test", "PII_EMAIL"],
    ["0xc0000201", "PII_NETWORK"],
    ["sample at example dot test", "PII_EMAIL"],
    ["sample [AT] example [DOT] test", "PII_EMAIL"],
    ["file:///home/sample/private.txt", "PII_PATH"],
    ["file:///C:/Users/sample/private.txt", "PII_PATH"],
    ["file://server/Profiles/sample/private.txt", "PII_PATH"],
    ["//server/Profiles/sample/private.txt", "PII_PATH"],
    ["\\\\server\\Profiles\\sample\\private.txt", "PII_PATH"],
    ["\\\\server\\Home\\sample\\private.txt", "PII_PATH"]
  ]
  piiSentinels.forEach(([sentinel, code], index) => add(
    `pii-sentinel-${index}`,
    code,
    () => validateSafeTree({ nested: { value: sentinel } }, "PII fixture"),
    sentinel
  ))
  piiSentinels.forEach(([sentinel, code], index) => add(
    `pii-decoded-json-${index}`,
    code,
    () => validateSafeTree({ nested: JSON.stringify({ deep: { value: sentinel } }) }, "decoded PII fixture"),
    sentinel
  ))
  piiSentinels.forEach(([sentinel, code], index) => {
    const encoded = Buffer.from(JSON.stringify({ deep: { value: sentinel } }), "utf8")
    add(`pii-decoded-base64-${index}`, code, () => validateSafeTree({
      nested: encoded.toString("base64")
    }, "decoded PII fixture"), sentinel)
    add(`pii-decoded-base64-unpadded-${index}`, code, () => validateSafeTree({
      nested: encoded.toString("base64").replace(/=+$/u, "")
    }, "decoded PII fixture"), sentinel)
    add(`pii-decoded-base64url-${index}`, code, () => validateSafeTree({
      nested: encoded.toString("base64url")
    }, "decoded PII fixture"), sentinel)
    add(`pii-decoded-base64url-padded-${index}`, code, () => {
      const base64url = encoded.toString("base64url")
      validateSafeTree({
        nested: base64url.padEnd(Math.ceil(base64url.length / 4) * 4, "=")
      }, "decoded PII fixture")
    }, sentinel)
  })
  const controlSentinels = ["safe\u200btext", "safe\u200dtext", "safe\u2066text", "safe\u202etext", "safe\u00adtext", "safe\ufefftext", "line\nbreak"]
  controlSentinels.forEach((sentinel, index) => add(
    `control-sentinel-${index}`,
    "STRING_CONTROL",
    () => validateSafeTree({ value: sentinel }, "control fixture"),
    sentinel
  ))
  add("normalization-decomposed", "STRING_NORMALIZATION", () => validateSafeTree({ value: "Cafe\u0301" }, "normalization fixture"))
  add("normalization-fullwidth", "STRING_NORMALIZATION", () => validateSafeTree({ value: "ＦＩＮＡＬ" }, "normalization fixture"))
  for (const [index, safe] of [
    "question-player:selected", "review-player:question-selected", "aria-selected",
    "accepted-codex-only", "finalEvidenceRootSha256", "127.0.0.1",
    AGENT_ID_BY_LANE["journey-recovery-semantics"], "plans/008-integrated-validation-prework.md",
    "product/SCREEN_STATES.md", "P008-REQ-0001", "http://[::1]:4175",
    "SCREEN-STATE-00001", "route-10001", "sources/NY-10001.md",
    "candidate-code-route", "device-code-contract", "apps/site/users-guide.md",
    "sources/SCREEN-STATE-0042.md", "home-route", "service-tag-route",
    "asset-tag-contract", "host-id-schema", "apps/site/profiles-guide.md",
    "production blocked", "no human evidence", "zero participants",
    "not human-usability-tested", "no real-device at evidence"
  ].entries()) add(`safe-string-positive-${index}`, null, () => validateSafeString(safe, "safe fixture"))

  const safeStructuredBoundary = {
    participantCount: 0,
    humanParticipantCount: 0,
    humanSessionCount: 0,
    participantEvidence: "none",
    humanEvidence: "none",
    notHumanUsabilityTested: true,
    agentsCountAsPeople: false,
    productionAuthorization: false,
    humanBehaviorEvidence: false,
    realDeviceAssistiveTechnologyEvidence: false
  }
  const safeStructuredBytes = Buffer.from(JSON.stringify({ deep: safeStructuredBoundary }), "utf8")
  add("safe-structured-boundary-raw", null, () => validateSafeTree(safeStructuredBoundary, "safe structured fixture"))
  add("safe-structured-boundary-json", null, () =>
    validateSafeTree({ nested: JSON.stringify({ deep: safeStructuredBoundary }) }, "safe structured fixture"))
  add("safe-structured-boundary-base64", null, () =>
    validateSafeTree({ nested: safeStructuredBytes.toString("base64") }, "safe structured fixture"))
  add("safe-structured-boundary-base64-unpadded", null, () =>
    validateSafeTree({ nested: safeStructuredBytes.toString("base64").replace(/=+$/u, "") }, "safe structured fixture"))
  add("safe-structured-boundary-base64url", null, () =>
    validateSafeTree({ nested: safeStructuredBytes.toString("base64url") }, "safe structured fixture"))
  add("safe-structured-boundary-base64url-padded", null, () => {
    const base64url = safeStructuredBytes.toString("base64url")
    validateSafeTree({
      nested: base64url.padEnd(Math.ceil(base64url.length / 4) * 4, "=")
    }, "safe structured fixture")
  })

  add("implementation-source-multiline-comment-claim", "PROHIBITED_CLAIM", () =>
    validateImplementationSource("const proof = true\n/* The release may go\nlive. */\n", "implementation mutation"))
  add("implementation-source-multiline-template-claim", "PROHIBITED_CLAIM", () =>
    validateImplementationSource("const claim = `The release may go\nlive.`\n", "implementation mutation"))
  add("implementation-source-compact-template-claim", "PROHIBITED_CLAIM", () =>
    validateImplementationSource("const claim = `publishable`\n", "implementation mutation"))
  add("implementation-source-escaped-string-claim", "PROHIBITED_CLAIM", () =>
    validateImplementationSource("const claim = \"\\x70ublishable\"\n", "implementation mutation"))
  add("implementation-source-escaped-template-claim", "PROHIBITED_CLAIM", () =>
    validateImplementationSource("const claim = `\\u0070ublishable`\n", "implementation mutation"))
  add("implementation-source-obfuscated-email", "PII_EMAIL", () =>
    validateImplementationSource("const contact = \"sample at example dot test\"\n", "implementation mutation"))
  add("implementation-source-escaped-line-comment-claim", "PROHIBITED_CLAIM", () =>
    validateImplementationSource("const proof = true // \\x70ublishable\n", "implementation mutation"))
  add("implementation-source-escaped-block-comment-claim", "PROHIBITED_CLAIM", () =>
    validateImplementationSource("const proof = true /* \\u0070ublishable */\n", "implementation mutation"))
  add("implementation-source-multiline-benign", null, () =>
    validateImplementationSource("const label = `P008-CASE\nREADY`\n/* deterministic fixture */\n", "implementation control"))

  add("contract-reject-prepared-at", "CONTRACT_KEYS", () => {
    const mutated = clone(context.contract); mutated.preparedAt = "2026-08-28T12:34:56Z"
    validateContract(mutated, rows)
  })
  add("contract-reject-arbitrary-valid-time", "CONTRACT_KEYS", () => {
    const mutated = clone(context.contract); mutated.preparedAt = "2099-12-31T23:59:59Z"
    validateContract(mutated, rows)
  })
  add("contract-reject-accepted-state", "PERMANENT_BOUNDARY", () => {
    const mutated = clone(context.contract); mutated.decisionStatus = "accepted"
    validateContract(mutated, rows)
  })
  add("contract-reject-done-state", "PERMANENT_BOUNDARY", () => {
    const mutated = clone(context.contract); mutated.status = "DONE"
    validateContract(mutated, rows)
  })

  const baselineMutations = [
    (records) => { records[0].resultSummary = "99 real participants approved production" },
    (records) => { records[0].limitations[0] = "The release may go live" },
    (records) => { records[0].evidenceId = "BASE-AUTOMATED-099" },
    (records) => { records[0].status = "approved" },
    (records) => { records[0].runResult.exitCode = 99; records[0].runResultSha256 = sha256Canonical(records[0].runResult) },
    (records) => { records.reverse() }
  ]
  baselineMutations.forEach((mutate, index) => add(`baseline-integrity-${index}`, "BASELINE_INTEGRITY", () => {
    const records = clone(context.contract.pendingFixture.baselineEvidence)
    mutate(records)
    validateBaselineEvidence(records)
  }))

  const fixtureBundle = () => fixtureRef.current.bundle
  const failedFixtureBundle = () => fixtureRef.current.failedFixture.bundle
  const validateFixture = (bundle, options = {}) => {
    const fixture = options.fixture ?? fixtureRef.current
    return validateRealEvidence({
    bundle,
    bundleRaw: `${canonicalJson(bundle)}\n`,
    expectedRoot: options.expectedRoot ?? fixture.expectedRoot,
    anchorRef: options.anchorRef ?? fixture.anchorRef,
    sealRef: options.sealRef ?? fixture.sealRef,
    dependencyInterface: options.dependencyInterface ?? fixture.dependencyInterface,
    requirementRows: rows,
    contractRoot: context.contract.contractRootSha256,
    cwd: fixture.root,
    capability: SELF_TEST_CAPABILITY
  })
  }
  const validateFailedFixture = (bundle, options = {}) => validateFixture(bundle, {
    ...options,
    fixture: fixtureRef.current.failedFixture
  })

  add("real-fixture-positive", null, () => validateFixture(fixtureBundle()))
  add("real-failed-fixture-structurally-valid", null, () => validateFailedFixture(failedFixtureBundle()))
  add("publication-private-binding-positive", null, () =>
    validatePublicationBinding(fixtureBundle(), null, SELF_TEST_CAPABILITY))
  add("publication-public-binding-positive", null, () => {
    const bundle = clone(fixtureBundle())
    const publication = {
      published: true,
      publishedPacketCommit: "a".repeat(40),
      packetBytesRootSha256: "b".repeat(64)
    }
    Object.assign(bundle, publication)
    validatePublicationBinding(bundle, publication, null)
  })
  add("publication-public-rejects-false", "REAL_PUBLICATION", () =>
    validatePublicationBinding(fixtureBundle(), {
      published: true,
      publishedPacketCommit: "a".repeat(40),
      packetBytesRootSha256: "b".repeat(64)
    }, null))
  add("publication-public-rejects-packet-root-mutation", "REAL_PUBLICATION", () => {
    const bundle = clone(fixtureBundle())
    Object.assign(bundle, {
      published: true,
      publishedPacketCommit: "a".repeat(40),
      packetBytesRootSha256: "c".repeat(64)
    })
    validatePublicationBinding(bundle, {
      published: true,
      publishedPacketCommit: "a".repeat(40),
      packetBytesRootSha256: "b".repeat(64)
    }, null)
  })
  add("published-packet-byte-mutation", "PUBLISHED_BLOB", () =>
    validatePublishedPacketBytes({ ...context, protocolRaw: `${context.protocolRaw}\nmutation\n` }, "HEAD"))
  const validateFixtureAnchor = (bundle = fixtureBundle(), dependencyInterface = fixtureRef.current.dependencyInterface, anchorRef = fixtureRef.current.anchorRef) =>
    validateExternalAnchor({ bundle, anchorRef, dependencyInterface, cwd: fixtureRef.current.root })
  add("external-anchor-positive", null, () => validateFixtureAnchor())
  add("external-anchor-coordinate-mutation", "REAL_EXTERNAL_ANCHOR", () => {
    const bundle = clone(fixtureBundle()); bundle.externalAnchor.sha256 = "0".repeat(64)
    validateFixtureAnchor(bundle)
  })
  add("external-anchor-caller-path-mutation", "REAL_EXTERNAL_ANCHOR", () =>
    validateFixtureAnchor(fixtureBundle(), fixtureRef.current.dependencyInterface, {
      commit: fixtureRef.current.anchorRef.commit,
      path: "fixture/trust/alternate-anchor.json"
    }))
  add("external-anchor-parent-mutation", "REAL_EXTERNAL_ANCHOR", () => {
    const dependency = clone(fixtureRef.current.dependencyInterface)
    dependency.requiredSteps[2].requiredSha = dependency.requiredSteps[1].requiredSha
    validateFixtureAnchor(fixtureBundle(), dependency)
  })
  add("real-manifest-trusted-anchor-mutation", "REAL_MANIFEST", () => {
    const bundle = clone(fixtureBundle())
    bundle.executionManifest.trustedExternalAnchor.sha256 = "0".repeat(64)
    resealBundle(bundle, rows, context.contract.contractRootSha256)
    validateFixture(bundle)
  })
  const loadFixtureSealAndAnchor = () => {
    const sealRaw = execFileSync("git", ["show", `${fixtureRef.current.sealRef.commit}:${fixtureRef.current.sealRef.path}`], {
      cwd: fixtureRef.current.root,
      encoding: "utf8"
    })
    return {
      seal: parseJsonNoDuplicateKeys(sealRaw, "external seal test record"),
      anchored: validateFixtureAnchor()
    }
  }
  add("external-seal-signature-positive", null, () => {
    const { seal, anchored } = loadFixtureSealAndAnchor()
    validateExternalSealSignature(seal, anchored.publicKey)
  })
  add("external-seal-wrong-key", "REAL_EXTERNAL_SEAL_SIGNATURE", () => {
    const { seal } = loadFixtureSealAndAnchor()
    const { publicKey } = generateKeyPairSync("ed25519")
    validateExternalSealSignature(seal, {
      key: publicKey.export({ format: "der", type: "spki" }),
      format: "der",
      type: "spki"
    })
  })
  add("external-seal-coherent-new-local-key", "REAL_EXTERNAL_SEAL_SIGNATURE", () => {
    const { seal, anchored } = loadFixtureSealAndAnchor()
    seal.finalEvidenceRootSha256 = "f".repeat(64)
    const { privateKey } = generateKeyPairSync("ed25519")
    const signedBytes = Buffer.from(canonicalJson(externalSealSignedProjection(seal)), "utf8")
    seal.signedPayloadSha256 = sha256Bytes(signedBytes)
    seal.signatureBase64 = sign(null, signedBytes, privateKey).toString("base64")
    validateExternalSealSignature(seal, anchored.publicKey)
  })
  add("external-seal-same-key-holder-reseal-limitation-positive", null, () => {
    const { seal, anchored } = loadFixtureSealAndAnchor()
    seal.finalEvidenceRootSha256 = "f".repeat(64)
    const signedBytes = Buffer.from(canonicalJson(externalSealSignedProjection(seal)), "utf8")
    seal.signedPayloadSha256 = sha256Bytes(signedBytes)
    seal.signatureBase64 = sign(null, signedBytes, fixtureRef.current.anchorPrivateKey).toString("base64")
    validateExternalSealSignature(seal, anchored.publicKey)
  })
  add("external-seal-noncanonical-bytes", "REAL_EXTERNAL_SEAL", () => {
    const { seal } = loadFixtureSealAndAnchor()
    validateCanonicalJsonBytes(`${JSON.stringify(seal, null, 2)}\n`, seal, "REAL_EXTERNAL_SEAL", "external seal mutation")
  })

  const recordMetadataTargets = [
    ["execution-manifest", (bundle) => bundle.executionManifest, false],
    ["task-receipt", (bundle) => bundle.taskReceipts[0], false],
    ["first-pass-receipt", (bundle) => bundle.firstPassReceipts[0], false],
    ["environment", (bundle) => bundle.environmentObservations[0], false],
    ["automated-run", (bundle) => bundle.automatedRuns[0], false],
    ["assertion", (bundle) => bundle.assertions[0], false],
    ["coverage", (bundle) => bundle.coverageCells[0], false],
    ["finding", (bundle) => bundle.findings[0], true],
    ["agent-run", (bundle) => bundle.agentRuns[0], false],
    ["dissent-position", (bundle) => bundle.dissentPositions[0], false],
    ["dissent-group", (bundle) => bundle.dissentGroups[0], true],
    ["consensus", (bundle) => bundle.consensus, false],
    ["final-evidence", (bundle) => bundle.finalEvidence, false]
  ]
  const badMetadataValues = {
    reviewMode: "automation-only",
    humanEvidence: "unknown",
    humanParticipantCount: 1,
    notHumanUsabilityTested: false
  }
  for (const [targetId, select, useFailedFixture] of recordMetadataTargets) {
    for (const [field, value] of Object.entries(badMetadataValues)) add(
      `real-record-metadata-${targetId}-${field}`,
      "REAL_RECORD_METADATA",
      () => {
        const bundle = clone(useFailedFixture ? failedFixtureBundle() : fixtureBundle())
        select(bundle)[field] = value
        resealBundle(bundle, rows, context.contract.contractRootSha256)
        if (useFailedFixture) validateFailedFixture(bundle)
        else validateFixture(bundle)
      }
    )
  }
  for (const [field, value] of Object.entries(badMetadataValues)) add(
    `real-record-metadata-dissent-matrix-${field}`,
    "REAL_DISSENT",
    () => {
      const bundle = clone(fixtureBundle())
      bundle.dissentMatrix[0][field] = value
      resealBundle(bundle, rows, context.contract.contractRootSha256)
      validateFixture(bundle)
    }
  )
  const artifactMetadataCodes = [
    ["result-manifest", "REAL_RESULT_MANIFEST"],
    ["result-entry", "REAL_RESULT_ENTRY"],
    ["requirement-proof", "REAL_REQUIREMENT_PROOF"],
    ["captured-result", "REAL_REQUIREMENT_PROOF"],
    ["binding-result", "REAL_REQUIREMENT_PROOF"],
    ["native-task-receipt", "REAL_NATIVE_RECEIPT"],
    ["native-first-pass-receipt", "REAL_NATIVE_RECEIPT"],
    ["first-pass-artifact", "REAL_FIRST_PASS_ARTIFACT"],
    ["external-anchor", "REAL_EXTERNAL_ANCHOR"],
    ["external-seal", "REAL_EXTERNAL_SEAL"]
  ]
  for (const [artifactId, code] of artifactMetadataCodes) {
    for (const [field, value] of Object.entries(badMetadataValues)) add(
      `artifact-record-metadata-${artifactId}-${field}`,
      code,
      () => validateRecordMetadata({ ...RECORD_PERMANENT_METADATA, [field]: value }, code, artifactId)
    )
  }
  add("real-public-dependencies-pending", "REAL_DEPENDENCIES_PENDING", () => validateRealEvidence({
    bundle: fixtureBundle(),
    bundleRaw: fixtureRef.current.bundleRaw,
    expectedRoot: fixtureRef.current.expectedRoot,
    anchorRef: fixtureRef.current.anchorRef,
    sealRef: fixtureRef.current.sealRef,
    dependencyInterface: EXPECTED_DEPENDENCIES,
    requirementRows: rows,
    contractRoot: context.contract.contractRootSha256,
    cwd: fixtureRef.current.root,
    capability: SELF_TEST_CAPABILITY
  }))
  add("real-reject-prepared-at", "REAL_BUNDLE_KEYS", () => {
    const bundle = clone(fixtureBundle()); bundle.preparedAt = "2099-12-31T23:59:59Z"
    validateFixture(bundle)
  })
  for (const key of EVIDENCE_BUNDLE_CONTRACT.mandatoryNonemptyCollections) {
    add(`real-empty-${key}`, MANDATORY_NONEMPTY_FAILURE_CODES[key], () => {
      const bundle = clone(fixtureBundle()); bundle[key] = []
      resealBundle(bundle, rows, context.contract.contractRootSha256)
      validateFixture(bundle)
    })
  }
  add("real-assertion-missing", "REAL_COVERAGE", () => {
    const bundle = clone(fixtureBundle()); bundle.assertions.pop()
    resealBundle(bundle, rows, context.contract.contractRootSha256)
    validateFixture(bundle)
  })
  add("real-assertion-id-reuse", "REAL_ASSERTION", () => {
    const bundle = clone(fixtureBundle()); bundle.assertions[1].assertionId = bundle.assertions[0].assertionId
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFixture(bundle)
  })
  add("real-assertion-output-reuse", "REAL_ASSERTION_REUSE", () => {
    const bundle = clone(fixtureBundle()); bundle.assertions[1].deterministicOutputSha256 = bundle.assertions[0].deterministicOutputSha256
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFixture(bundle)
  })
  add("real-generic-auto-provider", "REAL_ASSERTION", () => {
    const bundle = clone(fixtureBundle()); bundle.assertions[0].providerId = "AUTO-001"
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFixture(bundle)
  })
  add("real-cell-self-downgrade-na", "REAL_COVERAGE", () => {
    const bundle = clone(fixtureBundle()); bundle.coverageCells[0].applicable = false
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFixture(bundle)
  })
  add("real-cell-result-mismatch", "REAL_COVERAGE", () => {
    const bundle = clone(fixtureBundle()); bundle.coverageCells[0].result = "failed"; bundle.coverageCells[0].blockingFindingId = "P008-FIND-0001"
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFixture(bundle)
  })
  add("real-cell-target-mutation", "REAL_COVERAGE", () => {
    const bundle = clone(fixtureBundle()); bundle.coverageCells[0].targetId = "mutated-target"
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFixture(bundle)
  })

  add("real-failed-coherent-mutation-reaches-external-root", "REAL_EXTERNAL_ROOT", () => {
    const bundle = clone(failedFixtureBundle())
    bundle.findings[0].severity = "critical"
    resealBundle(bundle, rows, context.contract.contractRootSha256)
    validateFailedFixture(bundle)
  })
  add("real-failed-missing-finding", "FAILED_CELL_FINDING", () => {
    const bundle = clone(failedFixtureBundle())
    bundle.findings = []; resealBundle(bundle, rows, context.contract.contractRootSha256); validateFailedFixture(bundle)
  })
  add("real-failed-resolved-finding", "REAL_FINDING", () => {
    const bundle = clone(failedFixtureBundle())
    bundle.findings[0].status = "resolved"; resealBundle(bundle, rows, context.contract.contractRootSha256); validateFailedFixture(bundle)
  })
  add("real-failed-nonblocking-finding", "REAL_FINDING", () => {
    const bundle = clone(failedFixtureBundle())
    bundle.findings[0].releaseBlocking = false; resealBundle(bundle, rows, context.contract.contractRootSha256); validateFailedFixture(bundle)
  })
  add("real-failed-wrong-lane-finding", "FAILED_CELL_FINDING", () => {
    const bundle = clone(failedFixtureBundle())
    bundle.findings[0].laneId = "accessibility-cognitive-load"
    bundle.findings[0].agentId = AGENT_ID_BY_LANE["accessibility-cognitive-load"]
    bundle.findings[0].reproductionTaskContractSha256 = LANE_CONTRACTS[1].taskContractSha256
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFailedFixture(bundle)
  })
  add("real-failed-unrelated-finding", "FAILED_CELL_FINDING", () => {
    const bundle = clone(failedFixtureBundle())
    bundle.findings[0].requirementId = rows[1].requirementId
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFailedFixture(bundle)
  })
  add("real-failed-owner-recommends", "REAL_AGENT_RUN", () => {
    const bundle = clone(failedFixtureBundle())
    bundle.agentRuns[0].recommendation = "agent-only-recommend"
    bundle.agentRuns[0].basisCode = "complete-closure-no-open-blocker"
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFailedFixture(bundle)
  })
  add("real-failed-consensus-recommends", "REAL_CONSENSUS", () => {
    const bundle = clone(failedFixtureBundle())
    bundle.consensus.recommendation = "agent-only-recommend"
    bundle.consensus.basisCode = "complete-closure-no-open-blocker"
    bundle.consensus.openBlockingFindingIds = []
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFailedFixture(bundle)
  })
  add("real-first-pass-peer-visible", "REAL_FIRST_PASS", () => {
    const bundle = clone(fixtureBundle()); bundle.firstPassReceipts[0].peerOutputsVisible = true
    bundle.firstPassReceipts[0].peerOutputIdsVisible = ["P008-AGENT-RUN-02"]
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFixture(bundle)
  })
  add("real-task-receipt-invalid-calendar-time", "REAL_RECEIPT", () => {
    const bundle = clone(fixtureBundle()); bundle.taskReceipts[0].startedAtUtc = "2026-13-01T00:00:00Z"
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFixture(bundle)
  })
  add("real-first-pass-invalid-calendar-time", "REAL_FIRST_PASS", () => {
    const bundle = clone(fixtureBundle()); bundle.firstPassReceipts[0].completedAtUtc = "2026-13-01T00:00:30Z"
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFixture(bundle)
  })
  add("real-first-pass-invalid-interval", "REAL_FIRST_PASS", () => {
    const bundle = clone(fixtureBundle()); bundle.firstPassReceipts[0].completedAtUtc = bundle.firstPassReceipts[0].startedAtUtc
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFixture(bundle)
  })
  add("real-first-pass-receipt-reuse", "REAL_FIRST_PASS", () => {
    const bundle = clone(fixtureBundle()); bundle.firstPassReceipts[1].nativeReceiptSha256 = bundle.firstPassReceipts[0].nativeReceiptSha256
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFixture(bundle)
  })
  add("real-first-pass-seal-hash-mutation", "REAL_FIRST_PASS_SEAL", () => {
    const bundle = clone(fixtureBundle()); bundle.firstPassReceiptSeal.sha256 = "0".repeat(64)
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFixture(bundle)
  })
  add("real-first-pass-seal-path-mutation", "REAL_FIRST_PASS_SEAL", () => {
    const bundle = clone(fixtureBundle()); bundle.firstPassReceiptSeal.path = "fixture/missing-first-pass.json"
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFixture(bundle)
  })
  add("real-first-pass-seal-not-earlier-than-final", "REAL_FIRST_PASS_SEAL", () => {
    const bundle = clone(fixtureBundle()); bundle.firstPassReceiptSeal.commit = fixtureRef.current.sealRef.commit
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFixture(bundle)
  })
  add("real-coherent-mutation-rejected-by-pinned-caller-root", "REAL_EXTERNAL_ROOT", () => {
    const bundle = clone(failedFixtureBundle()); bundle.findings[0].severity = "critical"
    resealBundle(bundle, rows, context.contract.contractRootSha256); validateFailedFixture(bundle)
  })
  add("real-internal-root-mutation", "REAL_FINAL_ROOT", () => {
    const bundle = clone(fixtureBundle()); bundle.finalEvidenceRootSha256 = "f".repeat(64)
    validateFixture(bundle)
  })
  add("real-wrong-caller-root", "REAL_EXTERNAL_ROOT", () => validateFixture(fixtureBundle(), { expectedRoot: "f".repeat(64) }))
  add("real-missing-seal-path", "REAL_EXTERNAL_SEAL", () => validateFixture(fixtureBundle(), {
    sealRef: { commit: fixtureRef.current.sealRef.commit, path: "fixture/missing-seal.json" }
  }))

  const semanticResealAttacks = [
    ["Deployment to production is permitted", "PROHIBITED_CLAIM"],
    ["The release may go live", "PROHIBITED_CLAIM"],
    ["The candidate is cleared to go live", "PROHIBITED_CLAIM"],
    ["Five learners completed the usability study", "PROHIBITED_CLAIM"],
    ["contact@example.test", "PII_EMAIL"],
    ["198.51.100.42", "PII_NETWORK"],
    ["/home/sample/private", "PII_PATH"],
    ["safe\u200btext", "STRING_CONTROL"]
  ]
  semanticResealAttacks.forEach(([sentinel, code], index) => add(
    `real-coherent-semantic-reseal-${index}`,
    code,
    () => {
      const bundle = clone(fixtureBundle())
      bundle.automatedRuns[0].commandContractSha256 = sentinel
      resealBundle(bundle, rows, context.contract.contractRootSha256)
      validateFixture(bundle)
    },
    sentinel
  ))

  add("real-dependency-null", "REAL_DEPENDENCIES_PENDING", () => {
    const dependency = clone(fixtureRef.current.dependencyInterface); dependency.ready = false; dependency.executionBaseSha = null
    validateFixture(fixtureBundle(), { dependencyInterface: dependency })
  })
  add("real-dependency-noncommit", "REAL_DEPENDENCY_ANCESTRY", () => {
    const dependency = clone(fixtureRef.current.dependencyInterface)
    dependency.requiredSteps[0].requiredSha = dependency.requiredSteps[0].artifactGitBlobSha
    validateFixture(fixtureBundle(), { dependencyInterface: dependency })
  })
  add("real-dependency-wrong-artifact-hash", "REAL_DEPENDENCY_BYTES", () => {
    const dependency = clone(fixtureRef.current.dependencyInterface)
    dependency.requiredSteps[0].artifactSha256 = "0".repeat(64)
    validateFixture(fixtureBundle(), { dependencyInterface: dependency })
  })
  add("real-dependency-native-metadata-positive", null, () => {
    const step = fixtureRef.current.dependencyInterface.requiredSteps[1]
    validateNativeDependencyAcceptance(
      step,
      execFileSync("git", ["show", `${step.requiredSha}:${step.acceptanceRecordPath}`], { cwd: fixtureRef.current.root, encoding: "utf8" }),
      execFileSync("git", ["show", `${step.requiredSha}:${step.dispositionPath}`], { cwd: fixtureRef.current.root, encoding: "utf8" })
    )
  })
  for (const [id, field, value] of [
    ["review-mode", "reviewMode", "mixed"],
    ["agents-as-people", "agentsCountAsPeople", true],
    ["production-authorization", "productionAuthorization", true],
    ["human-count", "humanParticipantCount", 1]
  ]) add(`real-dependency-acceptance-${id}`, "REAL_DEPENDENCY_METADATA", () => {
    const step = fixtureRef.current.dependencyInterface.requiredSteps[1]
    const acceptance = parseJsonNoDuplicateKeys(
      execFileSync("git", ["show", `${step.requiredSha}:${step.acceptanceRecordPath}`], { cwd: fixtureRef.current.root, encoding: "utf8" }),
      "dependency acceptance mutation"
    )
    acceptance[field] = value
    acceptance.recordSha256 = projectedDigest(acceptance, "recordSha256")
    const dispositionRaw = execFileSync("git", ["show", `${step.requiredSha}:${step.dispositionPath}`], {
      cwd: fixtureRef.current.root, encoding: "utf8"
    })
    validateNativeDependencyAcceptance(step, `${canonicalJson(acceptance)}\n`, dispositionRaw)
  })
  for (const [id, field, value] of [
    ["status", "status", "pending"],
    ["review-mode", "reviewMode", "mixed"],
    ["production-authorization", "productionAuthorization", true],
    ["human-count", "humanParticipantCount", 1]
  ]) add(`real-dependency-disposition-${id}`, "REAL_DEPENDENCY_DISPOSITION", () => {
    const step = fixtureRef.current.dependencyInterface.requiredSteps[1]
    const acceptanceRaw = execFileSync("git", ["show", `${step.requiredSha}:${step.acceptanceRecordPath}`], {
      cwd: fixtureRef.current.root, encoding: "utf8"
    })
    const disposition = parseJsonNoDuplicateKeys(
      execFileSync("git", ["show", `${step.requiredSha}:${step.dispositionPath}`], { cwd: fixtureRef.current.root, encoding: "utf8" }),
      "dependency disposition mutation"
    )
    disposition[field] = value
    disposition.recordSha256 = projectedDigest(disposition, "recordSha256")
    validateNativeDependencyAcceptance(step, acceptanceRaw, `${canonicalJson(disposition)}\n`)
  })

  return tests
}

const selfTestManifest = (tests, validatorRaw) => {
  const cases = tests.map(({ id, expectedCode }) => ({ id, expectedCode }))
  return {
    count: tests.length,
    idsSha256: sha256Canonical(cases.map(({ id }) => id)),
    expectedCodesSha256: sha256Canonical(cases.map(({ expectedCode }) => expectedCode)),
    casesSha256: sha256Canonical(cases),
    validatorImplementationSha256: sha256Text(validatorRaw),
    validatorGitBlobSha: gitBlobSha(validatorRaw),
    validatorByteLength: Buffer.byteLength(validatorRaw, "utf8")
  }
}

const validatorContractForManifest = (manifest) => ({
  mode: "fail-closed-codex-only-provisional",
  plan008AllowedIndexStatus: "BLOCKED",
  canonicalization: "UTF-8 stable sorted-key canonical JSON without whitespace",
  realMode: "resolved-dependencies-plus-external-root-and-git-seal",
  rejectedStructuredStates: [
    "accepted", "accept-for-implementation", "accept-with-conditions", "approved",
    "complete", "completed", "final", "DONE", "production-authorized"
  ],
  selfTestCount: manifest.count,
  selfTestIdsSha256: manifest.idsSha256,
  selfTestExpectedCodesSha256: manifest.expectedCodesSha256,
  selfTestCasesSha256: manifest.casesSha256,
  validatorImplementationSha256: manifest.validatorImplementationSha256,
  validatorGitBlobSha: manifest.validatorGitBlobSha,
  validatorByteLength: manifest.validatorByteLength
})

const executeSelfTests = (tests) => {
  for (const test of tests) {
    try {
      test.run()
      if (test.expectedCode !== null) fail("SELF_TEST_DID_NOT_FAIL", "an adversarial self-test unexpectedly passed")
    } catch (cause) {
      if (test.expectedCode === null) throw cause
      if (!(cause instanceof ValidationError) || cause.code !== test.expectedCode) {
        const actualCode = cause instanceof ValidationError ? cause.code : "non-validation-error"
        throw new ValidationError("SELF_TEST_WRONG_FAILURE", `self-test ${test.id} failed with code ${actualCode}`)
      }
      if (test.secret !== null && cause.message.includes(test.secret)) {
        throw new ValidationError("SELF_TEST_SECRET_ECHO", `self-test ${test.id} echoed a rejected value`)
      }
    }
  }
}

const readPacketFiles = async () => {
  validateStaticPathContract()
  const [
    protocolRaw, contractRaw, canonicalPlanRaw, planIndexRaw, screenStatesRaw,
    featureSpecRaw, designSystemRaw, validatorRaw
  ] = await Promise.all([
    readFile(join(repositoryRoot, paths.protocol), "utf8"),
    readFile(join(repositoryRoot, paths.contract), "utf8"),
    readFile(join(repositoryRoot, paths.canonicalPlan), "utf8"),
    readFile(join(repositoryRoot, paths.planIndex), "utf8"),
    readFile(join(repositoryRoot, SCREEN_STATE_AUTHORITY_EXPECTED.sourcePath), "utf8"),
    readFile(join(repositoryRoot, "product/FEATURE_SPEC.md"), "utf8"),
    readFile(join(repositoryRoot, "product/DESIGN_SYSTEM.md"), "utf8"),
    readFile(join(repositoryRoot, paths.validator), "utf8")
  ])
  const accessibilitySourceRawByPath = new Map([
    ["product/FEATURE_SPEC.md", featureSpecRaw],
    ["product/DESIGN_SYSTEM.md", designSystemRaw]
  ])
  return {
    protocolRaw, contractRaw, canonicalPlanRaw, planIndexRaw, screenStatesRaw,
    accessibilitySourceRawByPath, validatorRaw
  }
}

const packetByteRows = (files) => {
  const rawByPath = new Map([
    [paths.protocol, files.protocolRaw],
    [paths.contract, files.contractRaw],
    [paths.validator, files.validatorRaw],
    [paths.canonicalPlan, files.canonicalPlanRaw],
    [paths.planIndex, files.planIndexRaw]
  ])
  return PACKET_PATH_ORDER.map((path) => {
    const raw = rawByPath.get(path)
    if (typeof raw !== "string") fail("PUBLISHED_PACKET", "published packet source bytes are missing")
    return { path, sha256: sha256Text(raw), gitBlobSha: gitBlobSha(raw) }
  })
}

const validatePublishedPacketBytes = (files, commit = "HEAD", cwd = repositoryRoot) => {
  let resolvedCommit
  try { resolvedCommit = gitOutput(["rev-parse", commit], cwd) } catch {
    fail("PUBLISHED_PACKET", "published packet commit is missing")
  }
  assertGitSha(resolvedCommit, "PUBLISHED_PACKET", "published packet commit")
  const rows = packetByteRows(files)
  for (const row of rows) {
    const treeEntry = assertRegularGitPath(resolvedCommit, row.path, cwd, "PUBLISHED_BLOB", "published packet file")
    let committedRaw
    try {
      committedRaw = execFileSync("git", ["show", `${resolvedCommit}:${row.path}`], {
        cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: GIT_MAX_BUFFER
      })
    } catch {
      fail("PUBLISHED_BLOB", "published packet file is absent")
    }
    if (
      sha256Text(committedRaw) !== row.sha256 || gitBlobSha(committedRaw) !== row.gitBlobSha ||
      treeEntry.blobSha !== row.gitBlobSha
    ) fail("PUBLISHED_BLOB", "published packet bytes differ from the executing packet")
  }
  return {
    published: true,
    publishedPacketCommit: resolvedCommit,
    packetBytesRootSha256: sha256Canonical(rows),
    packetByteRows: rows
  }
}

const loadPacketContext = async ({ published = false, validateManifest = true } = {}) => {
  const files = await readPacketFiles()
  const contract = parseJsonNoDuplicateKeys(files.contractRaw, "schema contract")
  if (files.contractRaw !== `${JSON.stringify(contract, null, 2)}\n`) {
    fail("CONTRACT_SERIALIZATION", "schema contract bytes are not deterministic pretty JSON")
  }
  validateSourceCoordinates({
    protocolRaw: files.protocolRaw,
    canonicalPlanRaw: files.canonicalPlanRaw,
    planIndexRaw: files.planIndexRaw,
    published
  })
  const planJourneyContract = parsePlanJourneyContract(files.canonicalPlanRaw)
  const requirementRows = validatePlanJourneyContract(
    planJourneyContract,
    files.screenStatesRaw,
    files.accessibilitySourceRawByPath
  )
  const context = { ...files, contract, planJourneyContract, requirementRows }
  const tests = makeTestRegistry(context, { current: null })
  const manifest = selfTestManifest(tests, files.validatorRaw)
  validateContract(contract, requirementRows, validateManifest ? manifest : null, files.validatorRaw)
  const packetBinding = published ? validatePublishedPacketBytes(files) : null
  return { ...context, selfTestManifest: manifest, packetBinding }
}

const parseRealModeArguments = (args) => {
  if (args.length !== 8) fail("CLI_USAGE", "real evidence mode requires bundle, expected-root, anchor, and seal arguments")
  if (
    args[0] !== "--validate-real-evidence" || args[2] !== "--expected-root" ||
    args[4] !== "--anchor" || args[6] !== "--seal"
  ) fail("CLI_USAGE", "real evidence mode argument order is invalid")
  const bundlePath = args[1]
  const expectedRoot = args[3]
  const parseCoordinate = (value) => {
    const delimiter = value.indexOf(":")
    if (delimiter !== 40) fail("CLI_USAGE", "external coordinate is invalid")
    const coordinate = { commit: value.slice(0, delimiter), path: value.slice(delimiter + 1) }
    if (!SHA_40.test(coordinate.commit) || !isSafeRepositoryPath(coordinate.path)) {
      fail("CLI_USAGE", "external coordinate is invalid")
    }
    return coordinate
  }
  const anchorRef = parseCoordinate(args[5])
  const sealRef = parseCoordinate(args[7])
  if (!isSafeRepositoryPath(bundlePath) || bundlePath.startsWith("fixture/")) {
    fail("CLI_USAGE", "bundle path is not a public repository-relative path")
  }
  return { bundlePath, expectedRoot, anchorRef, sealRef }
}

const buildContractTemplate = async () => {
  const files = await readPacketFiles()
  validateSourceCoordinates({
    protocolRaw: files.protocolRaw,
    canonicalPlanRaw: files.canonicalPlanRaw,
    planIndexRaw: files.planIndexRaw
  })
  const existing = parseJsonNoDuplicateKeys(files.contractRaw, "schema contract")
  const planJourneyContract = parsePlanJourneyContract(files.canonicalPlanRaw)
  const requirementRows = validatePlanJourneyContract(
    planJourneyContract,
    files.screenStatesRaw,
    files.accessibilitySourceRawByPath
  )
  const contract = {
    ...existing,
    sourceCoordinates: EXPECTED_SOURCE_COORDINATES,
    classification: EXPECTED_CLASSIFICATION,
    codexOnlyBoundary: EXPECTED_BOUNDARY,
    dependencyInterface: EXPECTED_DEPENDENCIES,
    canonicalSemanticClauses: { canonicalPlan: PLAN_CLAUSES, planIndex: README_CLAUSES },
    journeyContract: PLAN_JOURNEY_SUMMARY,
    laneContracts: LANE_CONTRACTS,
    privateSchemaContracts: PRIVATE_SCHEMAS,
    evidenceBundleContract: EVIDENCE_BUNDLE_CONTRACT,
    claimAndPiiContract: CLAIM_POLICY,
    baselineEvidenceContract: BASELINE_CONTRACT,
    contractRootSha256: "0".repeat(64)
  }
  contract.pendingFixture.baselineEvidence = contract.pendingFixture.baselineEvidence.map((record) => {
    const runResult = withRecordMetadata(record.runResult)
    return {
      ...record,
      reviewMode: "codex-only",
      humanParticipantCount: 0,
      runResult,
      runResultSha256: sha256Canonical(runResult)
    }
  })
  const context = { ...files, contract, planJourneyContract, requirementRows }
  const manifest = selfTestManifest(makeTestRegistry(context, { current: null }), files.validatorRaw)
  contract.validatorContract = validatorContractForManifest(manifest)
  contract.contractRootSha256 = sha256Canonical(contractRootProjection(contract))
  return { contract, manifest, requirementRows }
}

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length === 1 && args[0] === "--contract-template") {
    const { contract } = await buildContractTemplate()
    process.stdout.write(`${JSON.stringify(contract, null, 2)}\n`)
    return
  }
  if (args.length === 1 && args[0] === "--self-test-manifest") {
    const context = await loadPacketContext()
    process.stdout.write(`${canonicalJson(context.selfTestManifest)}\n`)
    return
  }
  if (args.length === 1 && args[0] === "--validate-isolated-real-evidence") {
    const context = await loadPacketContext()
    const fixtures = []
    try {
      fixtures.push(createIsolatedRealFixture(context.requirementRows, context.contract.contractRootSha256))
      fixtures.push(createIsolatedRealFixture(
        context.requirementRows,
        context.contract.contractRootSha256,
        context.requirementRows[0].requirementId
      ))
      for (const fixture of fixtures) {
        validateRealEvidence({
          bundle: fixture.bundle,
          bundleRaw: fixture.bundleRaw,
          expectedRoot: fixture.expectedRoot,
          anchorRef: fixture.anchorRef,
          sealRef: fixture.sealRef,
          dependencyInterface: fixture.dependencyInterface,
          requirementRows: context.requirementRows,
          contractRoot: context.contract.contractRootSha256,
          cwd: fixture.root,
          capability: SELF_TEST_CAPABILITY
        })
      }
      process.stdout.write(`isolatedMechanicsFixtures=2; passedBundle=1; failedBundle=1; requirements=${context.requirementRows.length}; humanParticipantCount=0\n`)
    } finally {
      fixtures.forEach((fixture) => rmSync(fixture.root, { recursive: true, force: true }))
    }
    return
  }
  if (args.length === 0 || (args.length === 1 && args[0] === "--published")) {
    const published = args[0] === "--published"
    const context = await loadPacketContext({ published })
    process.stdout.write(
      `Plan 008 provisional prework valid: status=provisional-prework; reviewMode=codex-only; ` +
      `humanEvidence=none; humanParticipantCount=0; notHumanUsabilityTested=true; ` +
      `requirements=${context.requirementRows.length}; baselines=2; resolvedDependencies=1/3; ` +
      `decisionStatus=pending; realRunExecuted=false; selfTests=${context.selfTestManifest.count}\n`
    )
    return
  }

  if (args.length === 1 && args[0] === "--self-test") {
    const context = await loadPacketContext()
    const fixtureRef = { current: null }
    try {
      fixtureRef.current = createIsolatedRealFixture(context.requirementRows, context.contract.contractRootSha256)
      fixtureRef.current.failedFixture = createIsolatedRealFixture(
        context.requirementRows,
        context.contract.contractRootSha256,
        context.requirementRows[0].requirementId
      )
      const tests = makeTestRegistry(context, fixtureRef)
      exactValue(selfTestManifest(tests, context.validatorRaw), context.selfTestManifest, "SELF_TEST_MANIFEST", "runtime self-test manifest")
      executeSelfTests(tests)
      process.stdout.write(
        `Plan 008 adversarial self-tests passed: ${tests.length}; ` +
        `realEvidencePositiveFixtures=1; realEvidenceNegativeFixtures=${tests.filter((test) => test.id.startsWith("real-") && test.expectedCode !== null).length}; ` +
        `requirements=${context.requirementRows.length}; humanParticipantCount=0\n`
      )
    } finally {
      if (fixtureRef.current?.failedFixture?.root) {
        rmSync(fixtureRef.current.failedFixture.root, { recursive: true, force: true })
      }
      if (fixtureRef.current?.root) rmSync(fixtureRef.current.root, { recursive: true, force: true })
    }
    return
  }

  if (args[0] === "--validate-real-evidence") {
    const { bundlePath, expectedRoot, anchorRef, sealRef } = parseRealModeArguments(args)
    const context = await loadPacketContext({ published: true })
    let bundleRaw
    const absoluteBundlePath = join(repositoryRoot, bundlePath)
    try {
      if (!lstatSync(absoluteBundlePath).isFile()) fail("REAL_BUNDLE_READ", "real evidence bundle is not a regular file")
      bundleRaw = await readFile(absoluteBundlePath, "utf8")
    } catch {
      fail("REAL_BUNDLE_READ", "real evidence bundle cannot be read")
    }
    const bundle = parseJsonNoDuplicateKeys(bundleRaw, "real evidence bundle")
    const root = validateRealEvidence({
      bundle,
      bundleRaw,
      expectedRoot,
      anchorRef,
      sealRef,
      dependencyInterface: context.contract.dependencyInterface,
      requirementRows: context.requirementRows,
      contractRoot: context.contract.contractRootSha256,
      packetBinding: context.packetBinding,
      cwd: repositoryRoot
    })
    process.stdout.write(`${root}\n`)
    return
  }

  fail("CLI_USAGE", "unsupported validator mode")
}

main().catch((cause) => {
  if (cause instanceof ValidationError) {
    process.stderr.write(`${cause.code}: ${cause.message}\n`)
  } else {
    process.stderr.write("UNEXPECTED_VALIDATOR_FAILURE: validator execution failed\n")
  }
  process.exitCode = 1
})
