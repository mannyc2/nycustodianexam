#!/usr/bin/env node

import { execFileSync } from "node:child_process"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"

const ARTIFACT_METADATA = Object.freeze({
  status: "provisional-prework",
  participantEvidence: "none",
  decisionStatus: "pending",
  requiredDependencyShas: null,
  mustRebaseAndReverify: true
})

const ROOT_KEYS = [
  "$schema",
  "schemaVersion",
  "packetId",
  "status",
  "participantEvidence",
  "decisionStatus",
  "requiredDependencyShas",
  "mustRebaseAndReverify",
  "preparedAt",
  "sourceCoordinates",
  "classification",
  "dependencyInterface",
  "operationsBoundary",
  "participantProtocol",
  "codebooks",
  "futurePrivateRecordSchemas",
  "futureAggregateSchemas",
  "pendingFixture",
  "baselineEvidenceContract",
  "validatorContract"
]

const SOURCE_COORDINATE_KEYS = [
  "preparedAgainstOriginMainSha",
  "plan008PlanningSha",
  "protocolPath",
  "contractPath",
  "validatorPath",
  "planStatusPath"
]
const CLASSIFICATION_KEYS = [
  "evidenceKind",
  "acceptedResearch",
  "participantSubstitute",
  "designSelection",
  "integratedPrototype",
  "operationsApproved",
  "artifactApproved",
  "plan008StatusChanged",
  "productionMigration"
]
const DEPENDENCY_INTERFACE_KEYS = [
  "mode",
  "ready",
  "requiredPlans",
  "futureIntegratedLoopbackHarness"
]
const DEPENDENCY_SLOT_KEYS = [
  "planId",
  "acceptedOutput",
  "requiredSha",
  "requiredArtifactPath",
  "acceptanceStatus"
]
const HARNESS_KEYS = [
  "interfaceVersion",
  "status",
  "participantExposureAllowed",
  "host",
  "externalRequestsAllowed",
  "requiredInputs",
  "requiredTaskIds",
  "requiredStateFamilies",
  "requiredCapabilities",
  "prohibitedSources"
]
const HARNESS_INPUT_KEYS = ["slot", "type", "value"]
const HARNESS_INPUT_SLOTS = [
  "executionBaseSha",
  "acceptedDependencyShas",
  "acceptedDependencyArtifactPaths",
  "harnessManifestSha256",
  "harnessManifestCommitSha",
  "approvedAccessMethod",
  "approvedExposureBoundary"
]
const HARNESS_STATE_FAMILIES = [
  "loading",
  "empty",
  "ready",
  "selected",
  "committing",
  "answered-revealed",
  "reviewed",
  "offline-stale",
  "offline-unavailable",
  "recoverable-error",
  "content-unavailable",
  "storage-unavailable"
]
const HARNESS_CAPABILITIES = [
  "semantic-html",
  "keyboard-only",
  "focus-and-announcements",
  "320-and-1440-css-pixel-reflow",
  "large-text-and-400-percent-zoom-pilot",
  "forced-colors",
  "reduced-motion",
  "visual-and-nonvisual-hazard",
  "offline-and-degraded-network",
  "interruption-and-durable-recovery",
  "print-transformation",
  "precommit-answer-safety",
  "zero-external-requests"
]
const HARNESS_PROHIBITED_SOURCES = [
  "production-controller-imports",
  "production-storage-imports",
  "unaccepted-plan-output",
  "recovered-editable-prototype-as-accepted-direction",
  "secure-or-remembered-exam-content"
]
const OPERATIONS_BOUNDARY_KEYS = ["status", "approvalReferences", "operations"]
const OPERATION_KEYS = ["operation", "proposedUse", "status"]
const OPERATION_WITH_MODE_KEYS = [...OPERATION_KEYS, "proposedMode"]
const PARTICIPANT_PROTOCOL_KEYS = [
  "minimumAge",
  "volunteerKind",
  "payment",
  "recording",
  "automatedTranscription",
  "currentRecruitmentCount",
  "currentParticipantCount",
  "targetIfDependenciesAndApprovalsLaterExist",
  "forbiddenParticipantSubstitutions"
]
const PARTICIPANT_TARGET_KEYS = [
  "rounds",
  "minimumPerRound",
  "maximumPerRound",
  "minimumRoundTwoRelevantAccessStrategyParticipants"
]
const PRIVATE_SCHEMA_KEYS = [
  "participantContext",
  "environment",
  "taskObservation",
  "issueOccurrence",
  "withdrawalDeletion"
]
const DIAGNOSTIC_EXTENSION_KEYS = ["field", "type", "allowedValues", "decisionStatus"]
const DIAGNOSTIC_EXTENSION_FIELDS = [
  "wrongTurnAndRecoveryPath",
  "meaningfulStartDurationMilliseconds",
  "hesitationCodes",
  "trustRating",
  "trustReasonCode"
]
const FUTURE_AGGREGATE_KEYS = [
  "status",
  "participantRowsAllowed",
  "participantIdsAllowed",
  "publicationStatus",
  "roundSummary",
  "coverageSummary",
  "patternSummary",
  "evidenceValidation",
  "invariants",
  "unresolvedBeforeOperationalUse"
]
const PENDING_FIXTURE_KEYS = [
  ...Object.keys(ARTIFACT_METADATA),
  "participants",
  "environments",
  "taskObservations",
  "issueOccurrences",
  "withdrawalsAndDeletions",
  "operationApprovals",
  "artifactApprovals",
  "decisionApprovals",
  "approvalReferences",
  "aggregates",
  "evidenceValidation",
  "baselineEvidence"
]
const AGGREGATE_KEYS = [
  "participantCount",
  "roundParticipantCounts",
  "taskObservationCounts",
  "contextCounts",
  "completionCounts",
  "issueCounts"
]
const PENDING_EVIDENCE_KEYS = [
  "observationsSha256",
  "patternsSha256",
  "contextsSha256",
  "verifiedOn"
]
const BASELINE_CONTRACT_KEYS = [
  "allowedKind",
  "requiredClaimScope",
  "requiredParticipantCount",
  "requiredParticipantEvidence",
  "requiredSubstitutionForParticipants",
  "coverageCategories",
  "prohibitedClaims"
]
const VALIDATOR_CONTRACT_KEYS = [
  "mode",
  "plan008AllowedIndexStatus",
  "rejectedStructuredStates",
  "selfTestIds"
]

const TASK_IDS = [
  "orientation",
  "profile-fit",
  "begin-study",
  "question-feedback",
  "tool-comparison",
  "hazard-practice",
  "review",
  "offline-data-control"
]

const PLAN_IDS = ["004", "005", "006", "007"]
const OPERATION_IDS = [
  "recruitment",
  "outreach",
  "compensation",
  "recording",
  "private-data-retention",
  "prototype-exposure"
]
const BASELINE_CATEGORIES = [
  "accessibility",
  "keyboard",
  "responsive",
  "offline",
  "print",
  "recovery"
]
const FORBIDDEN_PARTICIPANT_SUBSTITUTIONS = [
  "agent",
  "ai-agent",
  "llm",
  "automation",
  "bot",
  "generated-persona",
  "synthetic-persona",
  "synthetic-participant",
  "simulated-participant",
  "role-played-candidate",
  "staff-proxy",
  "internal-reviewer",
  "expert-review"
]
const PARTICIPANT_ROW_KEYS = [
  "participants",
  "environments",
  "taskObservations",
  "issueOccurrences",
  "withdrawalsAndDeletions"
]
const APPROVAL_ROW_KEYS = [
  "operationApprovals",
  "artifactApprovals",
  "decisionApprovals"
]
const FORBIDDEN_SUBSTITUTION_PATTERN =
  /(^|[-_\s])(agent|ai|llm|automation|bot|persona|synthetic|simulated|role[-_\s]?play(?:ed)?|staff[-_\s]?proxy|internal[-_\s]?reviewer|expert[-_\s]?review)([-_\s]|$)/i
const SHA_40 = /^[0-9a-f]{40}$/
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url))
const protocolPath = fileURLToPath(new URL("./008-integrated-validation-prework.md", import.meta.url))
const contractPath = fileURLToPath(
  new URL("./008-integrated-validation-schema-contract.json", import.meta.url)
)
const validatorPath = fileURLToPath(import.meta.url)
const planIndexPath = fileURLToPath(new URL("./README.md", import.meta.url))

class PreworkValidationError extends Error {
  constructor(code, message) {
    super(`${code}: ${message}`)
    this.name = "PreworkValidationError"
    this.code = code
  }
}

const fail = (code, message) => {
  throw new PreworkValidationError(code, message)
}

const isRecord = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value)

const assertRecord = (value, label) => {
  if (!isRecord(value)) fail("OBJECT_REQUIRED", `${label} must be an object`)
}

const exactKeys = (value, expected, label) => {
  assertRecord(value, label)
  const actual = Object.keys(value).sort()
  const wanted = [...expected].sort()
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    fail(
      "ROOT_KEYS",
      `${label} keys differ; expected ${wanted.join(", ")}; received ${actual.join(", ")}`
    )
  }
}

const exactSet = (values, expected, code, label) => {
  if (!Array.isArray(values)) fail(code, `${label} must be an array`)
  const unique = new Set(values)
  if (unique.size !== values.length) fail(code, `${label} contains duplicates`)
  const actualSorted = [...unique].sort()
  const expectedSorted = [...expected].sort()
  if (
    actualSorted.length !== expectedSorted.length ||
    actualSorted.some((value, index) => value !== expectedSorted[index])
  ) {
    fail(code, `${label} must equal ${expectedSorted.join(", ")}`)
  }
}

const assertTextFileShape = (raw, label) => {
  if (raw.charCodeAt(0) === 0xfeff) fail("TEXT_ENCODING", `${label} has a UTF-8 BOM`)
  if (raw.includes("\r")) fail("TEXT_ENCODING", `${label} must use LF line endings`)
  if (!raw.endsWith("\n")) fail("TEXT_ENCODING", `${label} must end with one newline`)
}

const scanJsonForDuplicateKeys = (raw) => {
  let cursor = 0
  const skipWhitespace = () => {
    while (/\s/.test(raw[cursor] ?? "")) cursor += 1
  }
  const parseString = () => {
    if (raw[cursor] !== '"') fail("MALFORMED_JSON", `expected string at byte ${cursor}`)
    const start = cursor
    cursor += 1
    while (cursor < raw.length) {
      if (raw[cursor] === "\\") {
        cursor += 2
        continue
      }
      if (raw[cursor] === '"') {
        cursor += 1
        try {
          return JSON.parse(raw.slice(start, cursor))
        } catch {
          fail("MALFORMED_JSON", `invalid JSON string at byte ${start}`)
        }
      }
      cursor += 1
    }
    fail("MALFORMED_JSON", `unterminated string at byte ${start}`)
  }
  const parsePrimitive = () => {
    const match = raw.slice(cursor).match(/^(?:-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null)/)
    if (match === null) fail("MALFORMED_JSON", `invalid value at byte ${cursor}`)
    cursor += match[0].length
  }
  const parseArray = () => {
    cursor += 1
    skipWhitespace()
    if (raw[cursor] === "]") {
      cursor += 1
      return
    }
    while (cursor < raw.length) {
      parseValue()
      skipWhitespace()
      if (raw[cursor] === "]") {
        cursor += 1
        return
      }
      if (raw[cursor] !== ",") fail("MALFORMED_JSON", `expected comma at byte ${cursor}`)
      cursor += 1
      skipWhitespace()
    }
    fail("MALFORMED_JSON", "unterminated array")
  }
  const parseObject = () => {
    cursor += 1
    const keys = new Set()
    skipWhitespace()
    if (raw[cursor] === "}") {
      cursor += 1
      return
    }
    while (cursor < raw.length) {
      const key = parseString()
      if (keys.has(key)) fail("DUPLICATE_JSON_KEY", `duplicate JSON key ${JSON.stringify(key)}`)
      keys.add(key)
      skipWhitespace()
      if (raw[cursor] !== ":") fail("MALFORMED_JSON", `expected colon at byte ${cursor}`)
      cursor += 1
      skipWhitespace()
      parseValue()
      skipWhitespace()
      if (raw[cursor] === "}") {
        cursor += 1
        return
      }
      if (raw[cursor] !== ",") fail("MALFORMED_JSON", `expected comma at byte ${cursor}`)
      cursor += 1
      skipWhitespace()
    }
    fail("MALFORMED_JSON", "unterminated object")
  }
  const parseValue = () => {
    skipWhitespace()
    const token = raw[cursor]
    if (token === "{") return parseObject()
    if (token === "[") return parseArray()
    if (token === '"') {
      parseString()
      return
    }
    parsePrimitive()
  }

  skipWhitespace()
  parseValue()
  skipWhitespace()
  if (cursor !== raw.length) fail("MALFORMED_JSON", `trailing JSON at byte ${cursor}`)
}

const parseContractJson = (raw) => {
  assertTextFileShape(raw, "schema contract")
  scanJsonForDuplicateKeys(raw)
  try {
    return JSON.parse(raw)
  } catch (cause) {
    fail("MALFORMED_JSON", cause instanceof Error ? cause.message : String(cause))
  }
}

const parseProtocolMetadata = (raw) => {
  const match = raw.match(/^# [^\n]+\n\n---\n([\s\S]*?)\n---\n/)
  if (match === null) fail("PROTOCOL_METADATA", "protocol metadata front matter is missing")
  const metadata = {}
  for (const line of match[1].split("\n")) {
    const delimiter = line.indexOf(":")
    if (delimiter < 1) fail("PROTOCOL_METADATA", `invalid metadata line ${JSON.stringify(line)}`)
    const key = line.slice(0, delimiter).trim()
    const encoded = line.slice(delimiter + 1).trim()
    if (Object.hasOwn(metadata, key)) fail("PROTOCOL_METADATA", `duplicate metadata key ${key}`)
    metadata[key] = encoded === "null" ? null : encoded === "true" ? true : encoded
  }
  exactKeys(metadata, Object.keys(ARTIFACT_METADATA), "protocol metadata")
  return metadata
}

const validateArtifactMetadata = (metadata, label) => {
  if (metadata.status !== "provisional-prework") {
    fail("STATUS_PROVISIONAL", `${label}.status must be provisional-prework`)
  }
  if (metadata.participantEvidence !== "none") {
    fail("PARTICIPANT_EVIDENCE", `${label}.participantEvidence must be none`)
  }
  if (metadata.decisionStatus !== "pending") {
    fail("DECISION_PENDING", `${label}.decisionStatus must be pending`)
  }
  if (metadata.requiredDependencyShas !== null) {
    fail("DEPENDENCY_SHAS_NULL", `${label}.requiredDependencyShas must be null`)
  }
  if (metadata.mustRebaseAndReverify !== true) {
    fail("REBASE_REQUIRED", `${label}.mustRebaseAndReverify must be true`)
  }
}

const validateClassification = (classification) => {
  exactKeys(classification, CLASSIFICATION_KEYS, "classification")
  if (classification.evidenceKind !== "protocol-and-schema-prework") {
    fail("CLASSIFICATION", "classification.evidenceKind is invalid")
  }
  for (const [key, value] of Object.entries(classification)) {
    if (key !== "evidenceKind" && value !== false) {
      fail("CLASSIFICATION", `classification.${key} must remain false`)
    }
  }
}

const validateDependencies = (dependencyInterface) => {
  exactKeys(dependencyInterface, DEPENDENCY_INTERFACE_KEYS, "dependencyInterface")
  if (dependencyInterface.mode !== "null-slots-only" || dependencyInterface.ready !== false) {
    fail("DEPENDENCY_SLOT", "dependency interface must remain unresolved")
  }
  const slots = dependencyInterface.requiredPlans
  if (!Array.isArray(slots)) fail("DEPENDENCY_SLOT", "requiredPlans must be an array")
  exactSet(slots.map((slot) => slot?.planId), PLAN_IDS, "DEPENDENCY_SLOT", "dependency plan IDs")
  const acceptedOutputs = {
    "004": "consumer-language-contract",
    "005": "learner-task-navigation-contract",
    "006": "consumer-visual-system-and-route-archetypes",
    "007": "component-foundation-and-responsive-contract"
  }
  for (const slot of slots) {
    exactKeys(slot, DEPENDENCY_SLOT_KEYS, `Plan ${slot?.planId ?? "unknown"} dependency slot`)
    if (
      slot.acceptanceStatus !== "unaccepted" ||
      slot.requiredSha !== null ||
      slot.requiredArtifactPath !== null ||
      slot.acceptedOutput !== acceptedOutputs[slot.planId]
    ) {
      fail("DEPENDENCY_SLOT", `Plan ${slot?.planId ?? "unknown"} slot is not unresolved`)
    }
  }
  const harness = dependencyInterface.futureIntegratedLoopbackHarness
  exactKeys(harness, HARNESS_KEYS, "futureIntegratedLoopbackHarness")
  if (
    harness.interfaceVersion !== 1 ||
    harness.status !== "not-built" ||
    harness.participantExposureAllowed !== false
  ) {
    fail("HARNESS_STATE", "future harness must remain not-built and unexposed")
  }
  if (harness.host !== "127.0.0.1" || harness.externalRequestsAllowed !== false) {
    fail("HARNESS_STATE", "future harness boundary must remain loopback-only with no external requests")
  }
  if (!Array.isArray(harness.requiredInputs)) {
    fail("HARNESS_STATE", "future harness requiredInputs must be an array")
  }
  exactSet(
    harness.requiredInputs.map((input) => input?.slot),
    HARNESS_INPUT_SLOTS,
    "HARNESS_STATE",
    "future harness input slots"
  )
  for (const input of harness.requiredInputs) {
    exactKeys(input, HARNESS_INPUT_KEYS, `future harness input ${input?.slot ?? "unknown"}`)
    if (typeof input.type !== "string" || input.type.length === 0 || input.value !== null) {
      fail("HARNESS_STATE", `future harness input ${input?.slot ?? "unknown"} must be null`)
    }
  }
  exactSet(harness.requiredTaskIds, TASK_IDS, "TASK_CODEBOOK", "harness task IDs")
  exactSet(
    harness.requiredStateFamilies,
    HARNESS_STATE_FAMILIES,
    "HARNESS_STATE",
    "future harness state families"
  )
  exactSet(
    harness.requiredCapabilities,
    HARNESS_CAPABILITIES,
    "HARNESS_STATE",
    "future harness capabilities"
  )
  exactSet(
    harness.prohibitedSources,
    HARNESS_PROHIBITED_SOURCES,
    "HARNESS_STATE",
    "future harness prohibited sources"
  )
}

const validateOperations = (operationsBoundary) => {
  exactKeys(operationsBoundary, OPERATIONS_BOUNDARY_KEYS, "operationsBoundary")
  if (operationsBoundary.status !== "not-approved") {
    fail("APPROVAL_ROWS", "operations boundary must remain not-approved")
  }
  if (!Array.isArray(operationsBoundary.approvalReferences)) {
    fail("APPROVAL_ROWS", "approvalReferences must be an array")
  }
  if (operationsBoundary.approvalReferences.length > 0) {
    if (operationsBoundary.approvalReferences.some((value) =>
      typeof value === "string" && /github\.com\/.+\/pull\/\d+#issuecomment-\d+/.test(value)
    )) {
      fail("FAKE_APPROVAL_REFERENCE", "provisional packet cannot carry a PR approval reference")
    }
    fail("APPROVAL_ROWS", "provisional packet cannot carry approval references")
  }
  const operations = operationsBoundary.operations
  if (!Array.isArray(operations)) fail("APPROVAL_ROWS", "operations must be an array")
  exactSet(
    operations.map((operation) => operation?.operation),
    OPERATION_IDS,
    "APPROVAL_ROWS",
    "operation IDs"
  )
  const expectedOperations = {
    recruitment: { proposedUse: true },
    outreach: { proposedUse: true },
    compensation: { proposedUse: false, proposedMode: "unpaid-adult-volunteer" },
    recording: {
      proposedUse: false,
      proposedMode: "no-audio-video-screen-or-automated-transcript"
    },
    "private-data-retention": { proposedUse: true },
    "prototype-exposure": { proposedUse: true }
  }
  for (const operation of operations) {
    const expected = expectedOperations[operation.operation]
    exactKeys(
      operation,
      Object.hasOwn(expected, "proposedMode") ? OPERATION_WITH_MODE_KEYS : OPERATION_KEYS,
      `${operation.operation} operation`
    )
    if (
      operation.status !== "pending" ||
      operation.proposedUse !== expected.proposedUse ||
      (Object.hasOwn(expected, "proposedMode") && operation.proposedMode !== expected.proposedMode)
    ) {
      fail("APPROVAL_ROWS", `${operation.operation} must remain pending`)
    }
  }
}

const validateParticipantProtocol = (participantProtocol) => {
  exactKeys(participantProtocol, PARTICIPANT_PROTOCOL_KEYS, "participantProtocol")
  if (
    participantProtocol.minimumAge !== 18 ||
    participantProtocol.volunteerKind !== "real-adult-volunteer" ||
    participantProtocol.payment !== "none" ||
    participantProtocol.recording !== "none" ||
    participantProtocol.automatedTranscription !== "none" ||
    participantProtocol.currentRecruitmentCount !== 0 ||
    participantProtocol.currentParticipantCount !== 0
  ) {
    fail(
      "PARTICIPANT_PROTOCOL",
      "participant protocol must remain adult-only, unpaid, unrecorded, and zero-row"
    )
  }
  const target = participantProtocol.targetIfDependenciesAndApprovalsLaterExist
  exactKeys(target, PARTICIPANT_TARGET_KEYS, "future participant target")
  if (
    target.rounds !== 2 ||
    target.minimumPerRound !== 6 ||
    target.maximumPerRound !== 8 ||
    target.minimumRoundTwoRelevantAccessStrategyParticipants !== 2
  ) {
    fail("PARTICIPANT_PROTOCOL", "future participant target differs from the provisional protocol")
  }
  exactSet(
    participantProtocol.forbiddenParticipantSubstitutions,
    FORBIDDEN_PARTICIPANT_SUBSTITUTIONS,
    "PARTICIPANT_SUBSTITUTION",
    "forbidden participant substitutions"
  )
}

const validateCodebooks = (codebooks) => {
  const expected = {
    taskId: TASK_IDS,
    roundId: ["R1", "R2"],
    completion: ["complete", "partial", "failed"],
    firstAction: [
      "expected-primary",
      "expected-secondary",
      "wrong-study-destination",
      "utility-trust-detour",
      "no-action"
    ],
    comprehension: ["accurate", "partial", "incorrect", "not-applicable"],
    accessBlocker: ["none", "resolved", "unresolved"],
    accessStrategy: [
      "none",
      "keyboard",
      "zoom-text",
      "screen-reader",
      "voice-input",
      "switch-or-motor",
      "other-declared"
    ],
    issueCategory: [
      "language",
      "hierarchy",
      "visual",
      "interaction",
      "correctness",
      "access",
      "security",
      "data-safety",
      "affiliation-trust",
      "evidence-contract"
    ],
    severity: ["critical", "high", "medium", "low"],
    retestOutcome: ["not-applicable", "resolved", "persists", "inconclusive"],
    occurrence: ["observed", "retest"],
    accessStrategyUsed: ["yes", "no"],
    deviceClass: ["phone", "tablet", "laptop", "desktop", "other-declared"],
    networkCondition: [
      "ordinary",
      "self-reported-low-bandwidth",
      "self-reported-intermittent",
      "moderator-controlled-offline",
      "moderator-controlled-degraded",
      "unknown"
    ],
    recoveryEvent: [
      "none",
      "reload",
      "back-forward",
      "offline-transition",
      "degraded-network",
      "storage-write-failure",
      "quota-limited",
      "blocked-upgrade",
      "missing-object",
      "stale-pack",
      "cross-tab-invalidation",
      "safe-exit-and-resume"
    ],
    recoveryOutcome: [
      "recovered-independently",
      "recovered-with-assistance",
      "not-recovered",
      "not-attempted"
    ]
  }
  exactKeys(codebooks, Object.keys(expected), "codebooks")
  for (const [name, values] of Object.entries(expected)) {
    exactSet(codebooks[name], values, "CODEBOOK", `${name} codebook`)
  }
}

const validateFuturePrivateSchemas = (schemas) => {
  exactKeys(schemas, PRIVATE_SCHEMA_KEYS, "futurePrivateRecordSchemas")
  const shapes = {
    participantContext: ["storage", "requiredFields", "actorKindConstant"],
    environment: ["storage", "requiredFields", "prohibitedFields"],
    taskObservation: ["storage", "requiredFields", "prohibitedFields", "diagnosticExtensions"],
    issueOccurrence: ["storage", "requiredFields"],
    withdrawalDeletion: ["storage", "requiredFields"]
  }
  for (const [name, keys] of Object.entries(shapes)) {
    exactKeys(schemas[name], keys, `future private ${name} schema`)
    if (
      schemas[name].storage !== "approved-private-location-only-never-git" ||
      !Array.isArray(schemas[name].requiredFields) ||
      schemas[name].requiredFields.length === 0
    ) {
      fail("PRIVATE_SCHEMA", `${name} must remain a nonempty private-only interface`)
    }
  }
  if (schemas.participantContext.actorKindConstant !== "real-adult-volunteer") {
    fail("PARTICIPANT_SUBSTITUTION", "private participant schema must require a real adult volunteer")
  }
  const diagnostics = schemas.taskObservation.diagnosticExtensions
  if (!Array.isArray(diagnostics)) fail("PRIVATE_SCHEMA", "diagnosticExtensions must be an array")
  exactSet(
    diagnostics.map((entry) => entry?.field),
    DIAGNOSTIC_EXTENSION_FIELDS,
    "PRIVATE_SCHEMA",
    "diagnostic extension fields"
  )
  for (const entry of diagnostics) {
    exactKeys(entry, DIAGNOSTIC_EXTENSION_KEYS, `diagnostic extension ${entry?.field ?? "unknown"}`)
    if (
      typeof entry.type !== "string" ||
      entry.type.length === 0 ||
      entry.allowedValues !== null ||
      entry.decisionStatus !== "pending"
    ) {
      fail("PRIVATE_SCHEMA", `${entry.field} must remain unresolved and pending`)
    }
  }
}

const validateFutureAggregateSchemas = (schemas) => {
  exactKeys(schemas, FUTURE_AGGREGATE_KEYS, "futureAggregateSchemas")
  if (
    schemas.status !== "provisional-interface-only" ||
    schemas.participantRowsAllowed !== false ||
    schemas.participantIdsAllowed !== false ||
    schemas.publicationStatus !== "pending"
  ) {
    fail("AGGREGATE_SCHEMA", "aggregate interface must remain provisional, rowless, and pending")
  }
  exactKeys(
    schemas.roundSummary,
    ["requiredFields", "taskAggregateRequiredFields"],
    "aggregate roundSummary"
  )
  exactSet(
    schemas.roundSummary.requiredFields,
    [
      "roundId",
      "uniqueCompletedParticipants",
      "artifactVersion",
      "artifactManifestSha256",
      "taskAggregates",
      "accessStrategyParticipantCount"
    ],
    "AGGREGATE_SCHEMA",
    "round summary fields"
  )
  exactSet(
    schemas.roundSummary.taskAggregateRequiredFields,
    [
      "taskId",
      "eligibleParticipantDenominator",
      "completedTaskDenominator",
      "completionNumerators",
      "firstActionNumerators",
      "comprehensionNumerators",
      "accessBlockerNumerators",
      "recoveryAttemptDenominator",
      "recoveryOutcomeNumerators"
    ],
    "AGGREGATE_SCHEMA",
    "task aggregate fields"
  )
  exactKeys(
    schemas.coverageSummary,
    ["requiredFields", "rareIntersectionRowsAllowed"],
    "aggregate coverageSummary"
  )
  if (schemas.coverageSummary.rareIntersectionRowsAllowed !== false) {
    fail("AGGREGATE_SCHEMA", "rare participant intersections must remain prohibited")
  }
  exactSet(
    schemas.coverageSummary.requiredFields,
    [
      "denominator",
      "mobileFirstCount",
      "lowerDigitalConfidenceCount",
      "lowBandwidthCount",
      "limitedEnglishCount",
      "relevantAccessStrategyCount",
      "screenReaderCount",
      "physicalMobileDeviceCount"
    ],
    "AGGREGATE_SCHEMA",
    "coverage summary fields"
  )
  exactKeys(
    schemas.patternSummary,
    ["requiredFields", "participantIdsAllowed"],
    "aggregate patternSummary"
  )
  if (schemas.patternSummary.participantIdsAllowed !== false) {
    fail("AGGREGATE_SCHEMA", "pattern summaries cannot contain participant IDs")
  }
  exactSet(
    schemas.patternSummary.requiredFields,
    [
      "roundId",
      "patternId",
      "taskId",
      "category",
      "severity",
      "occurrenceCount",
      "distinctParticipantCount",
      "eligibleParticipantDenominator",
      "repeated",
      "retestOutcome"
    ],
    "AGGREGATE_SCHEMA",
    "pattern summary fields"
  )
  exactKeys(
    schemas.evidenceValidation,
    ["requiredFields", "sha256Pattern"],
    "aggregate evidenceValidation"
  )
  exactSet(
    schemas.evidenceValidation.requiredFields,
    PENDING_EVIDENCE_KEYS,
    "AGGREGATE_SCHEMA",
    "aggregate evidence validation fields"
  )
  if (schemas.evidenceValidation.sha256Pattern !== "^[0-9a-f]{64}$") {
    fail("AGGREGATE_SCHEMA", "aggregate SHA-256 pattern is invalid")
  }
  exactSet(
    schemas.invariants,
    [
      "all counts are nonnegative integers",
      "each numerator is less than or equal to its matching denominator",
      "each completed volunteer contributes at most once to a denominator",
      "only real adult volunteer records contribute to participant denominators",
      "automation contributes zero to every participant denominator",
      "round and task counts derive from the approved private matrices",
      "pattern repeated is true only for at least two distinct volunteers in one round",
      "a critical occurrence remains blocking even when its repeated value is false",
      "aggregate evidence hashes match the exact approved private matrices",
      "withdrawal deletion triggers recomputation before republication"
    ],
    "AGGREGATE_SCHEMA",
    "aggregate invariants"
  )
  exactSet(
    schemas.unresolvedBeforeOperationalUse,
    [
      "small-cell publication threshold",
      "diagnostic extension codebooks",
      "time-to-meaningful-start aggregation",
      "multi-access-strategy aggregation",
      "trust-rating scale and reason codes"
    ],
    "AGGREGATE_SCHEMA",
    "unresolved aggregate decisions"
  )
}

const inspectParticipantSubstitution = (rows) => {
  for (const row of rows) {
    const actorKind = typeof row?.actorKind === "string" ? row.actorKind : ""
    if (FORBIDDEN_SUBSTITUTION_PATTERN.test(actorKind)) {
      fail("PARTICIPANT_SUBSTITUTION", `${actorKind} cannot be a participant source`)
    }
  }
}

const validateZeroAggregate = (value, path = "aggregates") => {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value !== 0) {
      fail("PARTICIPANT_COUNT", `${path} must be zero`)
    }
    return
  }
  if (isRecord(value)) {
    for (const [key, child] of Object.entries(value)) validateZeroAggregate(child, `${path}.${key}`)
    return
  }
  fail("PARTICIPANT_COUNT", `${path} must contain only zero-valued numeric leaves`)
}

const baselineRecordFixture = () => ({
  evidenceId: "SELF-TEST-BASELINE",
  kind: "non-participant-automation",
  status: "passed",
  claimScope: "current-site-baseline-only",
  sourceSha: "9fc7dcacfc961752e5d9a2cedbc426deead54a05",
  recordedAt: "2026-08-28T00:00:00Z",
  command: "self-test-only",
  participantCount: 0,
  participantEvidence: "none",
  substitutionForParticipants: false,
  coverageCategories: [...BASELINE_CATEGORIES],
  environment: {
    os: "self-test",
    nodeVersion: "self-test",
    bunVersion: "self-test",
    playwrightVersion: "self-test",
    browserProjects: [],
    browserVersions: []
  },
  resultSummary: "Self-test data only; never written to the contract.",
  limitations: ["not execution evidence"]
})

const BASELINE_RECORD_KEYS = Object.keys(baselineRecordFixture())
const BASELINE_ENVIRONMENT_KEYS = Object.keys(baselineRecordFixture().environment)

const validateBaselineEvidence = (records, sourceSha) => {
  if (!Array.isArray(records)) fail("BASELINE_EVIDENCE", "baselineEvidence must be an array")
  const categories = new Set()
  const ids = new Set()
  for (const record of records) {
    exactKeys(record, BASELINE_RECORD_KEYS, "baseline evidence record")
    if (ids.has(record.evidenceId)) fail("BASELINE_EVIDENCE", "baseline evidence IDs must be unique")
    ids.add(record.evidenceId)
    if (
      record.participantCount !== 0 ||
      record.participantEvidence !== "none" ||
      record.substitutionForParticipants !== false
    ) {
      fail("BASELINE_PARTICIPANT_CLAIM", `${record.evidenceId} cannot contribute participant evidence`)
    }
    if (
      record.kind !== "non-participant-automation" ||
      record.claimScope !== "current-site-baseline-only" ||
      record.status !== "passed"
    ) {
      fail("BASELINE_EVIDENCE", `${record.evidenceId} has an invalid evidence boundary`)
    }
    if (record.sourceSha !== sourceSha || !ISO_UTC.test(record.recordedAt)) {
      fail("BASELINE_EVIDENCE", `${record.evidenceId} has invalid source/time provenance`)
    }
    if (typeof record.command !== "string" || record.command.length === 0) {
      fail("BASELINE_EVIDENCE", `${record.evidenceId} command is missing`)
    }
    exactKeys(record.environment, BASELINE_ENVIRONMENT_KEYS, "baseline environment")
    if (!Array.isArray(record.coverageCategories)) {
      fail("BASELINE_EVIDENCE", `${record.evidenceId} coverageCategories must be an array`)
    }
    for (const category of record.coverageCategories) {
      if (!BASELINE_CATEGORIES.includes(category)) {
        fail("BASELINE_EVIDENCE", `${record.evidenceId} has unknown coverage category ${category}`)
      }
      categories.add(category)
    }
    if (!Array.isArray(record.limitations) || record.limitations.length === 0) {
      fail("BASELINE_EVIDENCE", `${record.evidenceId} must state limitations`)
    }
  }
  if (records.length > 0) {
    exactSet([...categories], BASELINE_CATEGORIES, "BASELINE_EVIDENCE", "baseline coverage")
  }
}

const validatePendingFixture = (fixture, sourceSha) => {
  exactKeys(fixture, PENDING_FIXTURE_KEYS, "pendingFixture")
  validateArtifactMetadata(fixture, "pendingFixture")

  const participantRows = fixture.participants
  if (Array.isArray(participantRows) && participantRows.length > 0) {
    inspectParticipantSubstitution(participantRows)
    fail("PARTICIPANT_ROWS", "provisional packet cannot contain even plausible participant rows")
  }
  for (const key of PARTICIPANT_ROW_KEYS) {
    if (!Array.isArray(fixture[key])) fail("PROVISIONAL_ROWS", `pendingFixture.${key} must be an array`)
    if (fixture[key].length > 0) {
      if (key === "participants") inspectParticipantSubstitution(fixture[key])
      fail("PROVISIONAL_ROWS", `pendingFixture.${key} must be empty`)
    }
  }
  for (const key of APPROVAL_ROW_KEYS) {
    if (!Array.isArray(fixture[key]) || fixture[key].length > 0) {
      fail("APPROVAL_ROWS", `pendingFixture.${key} must be empty`)
    }
  }
  if (!Array.isArray(fixture.approvalReferences)) {
    fail("APPROVAL_ROWS", "pendingFixture.approvalReferences must be an array")
  }
  if (fixture.approvalReferences.length > 0) {
    if (fixture.approvalReferences.some((value) =>
      typeof value === "string" && /github\.com\/.+\/pull\/\d+#issuecomment-\d+/.test(value)
    )) {
      fail("FAKE_APPROVAL_REFERENCE", "pending fixture cannot carry a PR approval reference")
    }
    fail("APPROVAL_ROWS", "pending fixture cannot carry approval references")
  }
  exactKeys(fixture.aggregates, AGGREGATE_KEYS, "pendingFixture.aggregates")
  exactKeys(
    fixture.aggregates.roundParticipantCounts,
    ["R1", "R2"],
    "pendingFixture.aggregates.roundParticipantCounts"
  )
  exactKeys(
    fixture.aggregates.taskObservationCounts,
    TASK_IDS,
    "pendingFixture.aggregates.taskObservationCounts"
  )
  exactKeys(
    fixture.aggregates.contextCounts,
    [
      "mobileFirst",
      "lowerDigitalConfidence",
      "lowBandwidth",
      "limitedEnglish",
      "relevantAccessStrategy",
      "screenReader",
      "physicalMobileDevice"
    ],
    "pendingFixture.aggregates.contextCounts"
  )
  exactKeys(
    fixture.aggregates.completionCounts,
    ["complete", "partial", "failed"],
    "pendingFixture.aggregates.completionCounts"
  )
  exactKeys(
    fixture.aggregates.issueCounts,
    ["critical", "high", "medium", "low"],
    "pendingFixture.aggregates.issueCounts"
  )
  validateZeroAggregate(fixture.aggregates)
  exactKeys(fixture.evidenceValidation, PENDING_EVIDENCE_KEYS, "pending evidence validation")
  if (Object.values(fixture.evidenceValidation).some((value) => value !== null)) {
    fail("EVIDENCE_HASH", "pending evidence hashes and verification time must remain null")
  }
  validateBaselineEvidence(fixture.baselineEvidence, sourceSha)
}

const validateBaselineContract = (contract) => {
  exactKeys(contract, BASELINE_CONTRACT_KEYS, "baselineEvidenceContract")
  if (
    contract.allowedKind !== "non-participant-automation" ||
    contract.requiredClaimScope !== "current-site-baseline-only" ||
    contract.requiredParticipantCount !== 0 ||
    contract.requiredParticipantEvidence !== "none" ||
    contract.requiredSubstitutionForParticipants !== false
  ) {
    fail("BASELINE_PARTICIPANT_CLAIM", "baseline contract cannot contribute participant evidence")
  }
  exactSet(
    contract.coverageCategories,
    BASELINE_CATEGORIES,
    "BASELINE_EVIDENCE",
    "baseline contract coverage"
  )
  exactSet(
    contract.prohibitedClaims,
    [
      "participant-validation",
      "design-direction-validation",
      "plan-008-gate-satisfaction",
      "assistive-technology-certification",
      "production-release-certification"
    ],
    "BASELINE_EVIDENCE",
    "baseline prohibited claims"
  )
}

const validateProtocol = (raw) => {
  assertTextFileShape(raw, "protocol")
  const requiredHeadings = [
    "Status and boundary",
    "Dependency slots",
    "Research questions and non-questions",
    "Adult-volunteer protocol",
    "Privacy-minimal screener",
    "Consent script",
    "Withdrawal and deletion scripts",
    "Moderator guide",
    "Interruption guide",
    "Recovery journey guide",
    "Environment accounting",
    "Aggregate schemas and codebooks",
    "Current-site automated baseline",
    "Future loopback harness interface",
    "Decision rules and remaining gates",
    "Validation commands"
  ]
  for (const heading of requiredHeadings) {
    const matches = raw.split("\n").filter((line) => line === `## ${heading}`).length
    if (matches !== 1) fail("PROTOCOL_HEADING", `expected one ## ${heading} heading; found ${matches}`)
  }
  return parseProtocolMetadata(raw)
}

const validatePlanIndex = (raw) => {
  const rows = raw.split("\n").filter((line) => line.startsWith("| 008 |"))
  if (rows.length === 0) fail("PLAN_008_STATUS", "Plan 008 row is missing")
  if (rows.some((row) => /\|\s*DONE(?:\s|—|\|)/.test(row))) {
    fail("PLAN_008_DONE", "provisional validator rejects a DONE Plan 008 row")
  }
  if (!rows.some((row) => /\|\s*BLOCKED(?:\s|—|\|)/.test(row))) {
    fail("PLAN_008_STATUS", "Plan 008 status table row must remain BLOCKED")
  }
}

const validateSourceCoordinates = (contract, originMainSha, checkGitAncestry) => {
  const source = contract.sourceCoordinates
  exactKeys(source, SOURCE_COORDINATE_KEYS, "sourceCoordinates")
  const preparedSha = source.preparedAgainstOriginMainSha
  if (!SHA_40.test(preparedSha)) fail("SOURCE_SHA", "prepared origin/main SHA must be lowercase 40-hex")
  if (preparedSha !== originMainSha) {
    fail("REBASE_REQUIRED", `packet base ${preparedSha} differs from origin/main ${originMainSha}`)
  }
  if (!SHA_40.test(source.plan008PlanningSha)) fail("SOURCE_SHA", "planning SHA must be lowercase 40-hex")
  const expectedPaths = {
    protocolPath: "plans/008-integrated-validation-prework.md",
    contractPath: "plans/008-integrated-validation-schema-contract.json",
    validatorPath: "plans/validate-008-integrated-validation-prework.mjs",
    planStatusPath: "plans/README.md"
  }
  for (const [key, value] of Object.entries(expectedPaths)) {
    if (source[key] !== value) fail("SOURCE_PATH", `sourceCoordinates.${key} is invalid`)
  }
  if (checkGitAncestry) {
    try {
      execFileSync("git", ["merge-base", "--is-ancestor", preparedSha, "HEAD"], {
        cwd: repositoryRoot,
        stdio: "ignore"
      })
    } catch {
      fail("SOURCE_SHA", `${preparedSha} is not an ancestor of HEAD`)
    }
  }
}

const validatePacket = ({
  contract,
  protocolMetadata,
  scriptMetadata,
  planIndex,
  originMainSha,
  checkGitAncestry = false
}) => {
  exactKeys(contract, ROOT_KEYS, "contract root")
  if (
    contract.$schema !== "https://json-schema.org/draft/2020-12/schema" ||
    contract.schemaVersion !== 1 ||
    contract.packetId !== "plan-008-integrated-validation-provisional-prework-v1"
  ) {
    fail("CONTRACT_ID", "schema version or packet ID is invalid")
  }
  if (!ISO_UTC.test(contract.preparedAt)) fail("CONTRACT_TIME", "preparedAt must be whole-second UTC")
  validateArtifactMetadata(contract, "contract")
  validateArtifactMetadata(protocolMetadata, "protocol")
  validateArtifactMetadata(scriptMetadata, "validator")
  validateSourceCoordinates(contract, originMainSha, checkGitAncestry)
  validateClassification(contract.classification)
  validateDependencies(contract.dependencyInterface)
  validateOperations(contract.operationsBoundary)
  validateParticipantProtocol(contract.participantProtocol)
  validateCodebooks(contract.codebooks)
  validateFuturePrivateSchemas(contract.futurePrivateRecordSchemas)
  validateFutureAggregateSchemas(contract.futureAggregateSchemas)
  validatePendingFixture(contract.pendingFixture, contract.sourceCoordinates.preparedAgainstOriginMainSha)
  validateBaselineContract(contract.baselineEvidenceContract)
  exactKeys(contract.validatorContract, VALIDATOR_CONTRACT_KEYS, "validatorContract")
  if (
    contract.validatorContract.mode !== "fail-closed-provisional-only" ||
    contract.validatorContract.plan008AllowedIndexStatus !== "BLOCKED"
  ) {
    fail("VALIDATOR_CONTRACT", "validator mode must remain fail-closed-provisional-only")
  }
  exactSet(
    contract.validatorContract.rejectedStructuredStates,
    [
      "accepted",
      "accept-for-implementation",
      "accept-with-conditions",
      "approved",
      "complete",
      "completed",
      "DONE"
    ],
    "VALIDATOR_CONTRACT",
    "rejected structured states"
  )
  validatePlanIndex(planIndex)
}

const clone = (value) => structuredClone(value)

const runSelfTests = (baseContext, contractRaw) => {
  const cases = []
  const executedIds = ["reject-duplicate-json-key"]
  const add = (id, expectedCode, mutate) => cases.push({ id, expectedCode, mutate })

  add("reject-extra-root-key", "ROOT_KEYS", ({ contract }) => { contract.extra = true })
  add("reject-missing-root-key", "ROOT_KEYS", ({ contract }) => { delete contract.packetId })
  add("reject-accepted-status", "STATUS_PROVISIONAL", ({ contract }) => { contract.status = "accepted" })
  add("reject-done-status", "STATUS_PROVISIONAL", ({ contract }) => { contract.status = "DONE" })
  add("reject-participant-evidence", "PARTICIPANT_EVIDENCE", ({ contract }) => {
    contract.participantEvidence = "synthetic"
  })
  add("reject-approved-decision", "DECISION_PENDING", ({ contract }) => {
    contract.decisionStatus = "accepted"
  })
  add("reject-dependency-sha", "DEPENDENCY_SHAS_NULL", ({ contract }) => {
    contract.requiredDependencyShas = { "004": "0".repeat(40) }
  })
  add("reject-rebase-flag-false", "REBASE_REQUIRED", ({ contract }) => {
    contract.mustRebaseAndReverify = false
  })
  add("reject-unexpected-pending-field", "ROOT_KEYS", ({ contract }) => {
    contract.pendingFixture.approvedByIdentity = "fake-owner"
  })
  add("reject-zero-budget-payment-change", "PARTICIPANT_PROTOCOL", ({ contract }) => {
    contract.participantProtocol.payment = "gift"
  })
  add("reject-recording-change", "PARTICIPANT_PROTOCOL", ({ contract }) => {
    contract.participantProtocol.recording = "audio"
  })
  add("reject-operation-mode-change", "APPROVAL_ROWS", ({ contract }) => {
    const recording = contract.operationsBoundary.operations.find(
      (operation) => operation.operation === "recording"
    )
    recording.proposedMode = "audio"
  })
  add("reject-removed-agent-prohibition", "PARTICIPANT_SUBSTITUTION", ({ contract }) => {
    contract.participantProtocol.forbiddenParticipantSubstitutions =
      contract.participantProtocol.forbiddenParticipantSubstitutions.filter((value) => value !== "agent")
  })
  add("reject-private-schema-agent-substitution", "PARTICIPANT_SUBSTITUTION", ({ contract }) => {
    contract.futurePrivateRecordSchemas.participantContext.actorKindConstant = "agent"
  })
  add("reject-fake-approval-body-hash", "ROOT_KEYS", ({ contract }) => {
    contract.pendingFixture.approvalBodySha256 = "0".repeat(64)
  })
  add("reject-nonnull-evidence-hash", "EVIDENCE_HASH", ({ contract }) => {
    contract.pendingFixture.evidenceValidation.observationsSha256 = "0".repeat(64)
  })
  add("reject-extra-dependency-field", "ROOT_KEYS", ({ contract }) => {
    contract.dependencyInterface.requiredPlans[0].acceptedSha = "0".repeat(40)
  })
  add("reject-markdown-metadata-mismatch", "STATUS_PROVISIONAL", ({ protocolMetadata }) => {
    protocolMetadata.status = "accepted"
  })
  add("reject-script-metadata-mismatch", "PARTICIPANT_EVIDENCE", ({ scriptMetadata }) => {
    scriptMetadata.participantEvidence = "automation"
  })
  add("reject-plan-008-done-row", "PLAN_008_DONE", (context) => {
    context.planIndex = context.planIndex.replace(/^\| 008 \|.*$/m, "| 008 | provisional | P1 | L | 004-007 | DONE |")
  })
  add("reject-nonzero-count-without-records", "PARTICIPANT_COUNT", ({ contract }) => {
    contract.pendingFixture.aggregates.participantCount = 1
  })
  add("reject-real-looking-row-in-provisional-packet", "PARTICIPANT_ROWS", ({ contract }) => {
    contract.pendingFixture.participants.push({ actorKind: "real-adult-volunteer", studyId: "R1-P01" })
  })
  for (const actorKind of ["agent", "generated-persona", "automation"]) {
    add(`reject-${actorKind}-substitution`, "PARTICIPANT_SUBSTITUTION", ({ contract }) => {
      contract.pendingFixture.participants.push({ actorKind })
    })
  }
  add("reject-fake-approval-reference", "FAKE_APPROVAL_REFERENCE", ({ contract }) => {
    contract.pendingFixture.approvalReferences.push(
      "https://github.com/example/repo/pull/123#issuecomment-456"
    )
  })
  add("reject-operation-approval", "APPROVAL_ROWS", ({ contract }) => {
    contract.pendingFixture.operationApprovals.push({ decision: "allow" })
  })
  add("reject-selected-design", "CLASSIFICATION", ({ contract }) => {
    contract.classification.designSelection = true
  })
  add("reject-built-harness", "HARNESS_STATE", ({ contract }) => {
    contract.dependencyInterface.futureIntegratedLoopbackHarness.status = "built"
  })
  add("reject-dependency-done", "DEPENDENCY_SLOT", ({ contract }) => {
    contract.dependencyInterface.requiredPlans[0].acceptanceStatus = "DONE"
  })
  add("reject-dependency-slot-sha", "DEPENDENCY_SLOT", ({ contract }) => {
    contract.dependencyInterface.requiredPlans[0].requiredSha = "0".repeat(40)
  })
  add("reject-baseline-participant-claim", "BASELINE_PARTICIPANT_CLAIM", ({ contract }) => {
    const record = baselineRecordFixture()
    record.sourceSha = contract.sourceCoordinates.preparedAgainstOriginMainSha
    record.participantCount = 1
    contract.pendingFixture.baselineEvidence.push(record)
  })
  add("reject-unknown-task", "CODEBOOK", ({ contract }) => {
    contract.codebooks.taskId[0] = "unknown-task"
  })
  add("reject-duplicate-task", "CODEBOOK", ({ contract }) => {
    contract.codebooks.taskId[0] = contract.codebooks.taskId[1]
  })
  add("reject-malformed-source-sha", "SOURCE_SHA", ({ contract }) => {
    contract.sourceCoordinates.preparedAgainstOriginMainSha = "not-a-sha"
  })

  const duplicateRaw = contractRaw.replace(
    '"schemaVersion": 1,',
    '"schemaVersion": 1,\n  "schemaVersion": 1,'
  )
  try {
    parseContractJson(duplicateRaw)
    fail("SELF_TEST_NOT_REJECTED", "reject-duplicate-json-key was not rejected")
  } catch (cause) {
    if (!(cause instanceof PreworkValidationError) || cause.code !== "DUPLICATE_JSON_KEY") {
      fail(
        "SELF_TEST_WRONG_ERROR",
        `reject-duplicate-json-key expected DUPLICATE_JSON_KEY, received ${cause?.code ?? String(cause)}`
      )
    }
  }

  for (const testCase of cases) {
    executedIds.push(testCase.id)
    const context = {
      contract: clone(baseContext.contract),
      protocolMetadata: clone(baseContext.protocolMetadata),
      scriptMetadata: clone(baseContext.scriptMetadata),
      planIndex: baseContext.planIndex,
      originMainSha: baseContext.originMainSha,
      checkGitAncestry: false
    }
    testCase.mutate(context)
    try {
      validatePacket(context)
      fail("SELF_TEST_NOT_REJECTED", `${testCase.id} was not rejected`)
    } catch (cause) {
      if (!(cause instanceof PreworkValidationError) || cause.code !== testCase.expectedCode) {
        fail(
          "SELF_TEST_WRONG_ERROR",
          `${testCase.id} expected ${testCase.expectedCode}, received ${cause?.code ?? String(cause)}`
        )
      }
    }
  }

  return executedIds
}

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length > 1 || (args.length === 1 && args[0] !== "--self-test")) {
    fail("CLI_ARGUMENT", "accepted usage: node plans/validate-008-integrated-validation-prework.mjs [--self-test]")
  }

  const [contractRaw, protocolRaw, validatorRaw, planIndex] = await Promise.all([
    readFile(contractPath, "utf8"),
    readFile(protocolPath, "utf8"),
    readFile(validatorPath, "utf8"),
    readFile(planIndexPath, "utf8")
  ])
  assertTextFileShape(validatorRaw, "validator")
  assertTextFileShape(planIndex, "plan index")
  const contract = parseContractJson(contractRaw)
  const protocolMetadata = validateProtocol(protocolRaw)
  const originMainSha = execFileSync("git", ["rev-parse", "origin/main"], {
    cwd: repositoryRoot,
    encoding: "utf8"
  }).trim()
  if (!SHA_40.test(originMainSha)) fail("SOURCE_SHA", "origin/main did not resolve to a lowercase 40-hex SHA")
  const baseContext = {
    contract,
    protocolMetadata,
    scriptMetadata: clone(ARTIFACT_METADATA),
    planIndex,
    originMainSha,
    checkGitAncestry: true
  }
  validatePacket(baseContext)
  const selfTestIds = runSelfTests(baseContext, contractRaw)
  exactSet(
    contract.validatorContract.selfTestIds,
    selfTestIds,
    "VALIDATOR_CONTRACT",
    "declared self-test IDs"
  )

  const baselineCount = contract.pendingFixture.baselineEvidence.length
  const message =
    `Plan 008 provisional prework valid: status=provisional-prework; ` +
    `participantEvidence=none; participantRows=0; approvals=0; dependencies=null; ` +
    `baselineRecords=${baselineCount}; adversarialSelfTests=${selfTestIds.length}; decisionStatus=pending`
  process.stdout.write(`${message}\n`)
}

main().catch((cause) => {
  const message = cause instanceof Error ? cause.message : String(cause)
  process.stderr.write(`Plan 008 provisional prework validation failed: ${message}\n`)
  process.exitCode = 1
})
