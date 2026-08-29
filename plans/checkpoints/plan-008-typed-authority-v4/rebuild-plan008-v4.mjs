import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

const [seedAuthorityPath, seedFixturePath, outputPath, fixturePath, oraclePath, reportPath] = process.argv.slice(2)
if ([seedAuthorityPath, seedFixturePath, outputPath, fixturePath, oraclePath, reportPath].some((value) => !value)) {
  throw new Error("usage: node rebuild SEED_AUTHORITY SEED_FIXTURE AUTHORITY FIXTURE ORACLE REPORT")
}

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex")
const gitBlobSha = (bytes) => crypto.createHash("sha1").update(Buffer.from("blob " + bytes.length + "\0")).update(bytes).digest("hex")
const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value !== null && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]))
  return value
}
const canonicalBytes = (value) => Buffer.from(JSON.stringify(canonicalize(value), null, 2) + "\n", "utf8")
const canonicalHash = (value) => sha256(canonicalBytes(value))
const structuralShape = (value) => {
  if (Array.isArray(value)) return { kind: "array", length: value.length, items: value.map(structuralShape) }
  if (value !== null && typeof value === "object") return { kind: "object", keys: Object.keys(value).sort(), fields: Object.fromEntries(Object.keys(value).sort().map((key) => [key, structuralShape(value[key])])) }
  return { kind: value === null ? "null" : typeof value }
}
const clone = (value) => structuredClone(value)
const same = (left, right) => JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right))

const discoverGitRoot = (start) => {
  let current = fs.realpathSync(start)
  while (true) {
    if (fs.existsSync(path.join(current, ".git"))) return current
    const parent = path.dirname(current)
    if (parent === current) throw new Error("Git root not found")
    current = parent
  }
}
const root = discoverGitRoot(process.cwd())
const authority = JSON.parse(fs.readFileSync(seedAuthorityPath, "utf8"))
const seedFixture = JSON.parse(fs.readFileSync(seedFixturePath, "utf8"))
authority.schemaVersion = "plan008-typed-authority-v4-executable-boundary"
authority.projectionId = "PLAN008-CURATED-TYPED-AUTHORITY-V4"

const state = (id) => {
  const row = authority.machineStates.find((candidate) => candidate.machineStateId === id)
  if (!row) throw new Error("missing state " + id)
  return row
}
const edge = (id) => {
  const row = authority.edges.find((candidate) => candidate.edgeId === id)
  if (!row) throw new Error("missing edge " + id)
  return row
}
const action = (id) => {
  const row = authority.actions.find((candidate) => candidate.actionId === id)
  if (!row) throw new Error("missing action " + id)
  return row
}
const event = (id) => {
  const row = authority.events.find((candidate) => candidate.eventId === id)
  if (!row) throw new Error("missing event " + id)
  return row
}
const outcome = (id) => {
  const row = authority.outcomes.find((candidate) => candidate.outcomeId === id)
  if (!row) throw new Error("missing outcome " + id)
  return row
}
const route = (id) => {
  const row = authority.routes.find((candidate) => candidate.routeId === id)
  if (!row) throw new Error("missing route " + id)
  return row
}
const stableField = (substateId, valueDomain) => ({ substateId, valueDomain })
const legalField = (substateId, legalValues) => ({ substateId, legalValues })
const setSubstates = (id, fields) => { state(id).selector.substates = fields }
const setTarget = (id, { preserve = [], assignments = null, stateId = edge(id).toStateSelector.stateId } = {}) => {
  edge(id).toStateSelector = { preserve, stateId, substateAssignments: assignments }
}

const sourceRuntime = new Map()
for (const source of authority.sources) {
  const bytes = fs.readFileSync(path.join(root, source.repoRelativePath))
  const lineStarts = [0]
  for (let index = 0; index < bytes.length; index += 1) if (bytes[index] === 10) lineStarts.push(index + 1)
  sourceRuntime.set(source.sourceId, { bytes, lineStarts, lineCount: lineStarts.length - 1 })
}
const makeClause = (clauseId, sourceId, lineStart, lineEnd, clauseKind) => {
  const runtime = sourceRuntime.get(sourceId)
  const byteStart = runtime.lineStarts[lineStart - 1]
  const byteEndExclusive = runtime.lineStarts[lineEnd]
  const bytes = runtime.bytes.subarray(byteStart, byteEndExclusive)
  return {
    clauseId,
    sourceId,
    clauseKind,
    routeFamilyNumber: null,
    spokeNumber: null,
    lineRange: { startInclusive: lineStart, endInclusive: lineEnd },
    byteRange: { startInclusive: byteStart, endExclusive: byteEndExclusive },
    byteLength: bytes.length,
    sliceSha256: sha256(bytes),
    textUtf8Lf: bytes.toString("utf8")
  }
}
if (!authority.sourceClauses.some((row) => row.clauseId === "RT-MILESTONES")) {
  authority.sourceClauses.push(makeClause("RT-MILESTONES", "ROUTES", 126, 138, "implementation-milestone-program"))
}

const routesText = sourceRuntime.get("ROUTES").bytes.toString("utf8")
const selectedJson = routesText.match(/```json\n([\s\S]*?)\n```/u)
if (!selectedJson) throw new Error("selected direction JSON missing")
const selectedProgram = JSON.parse(selectedJson[1])
authority.selectedDirection = { ...selectedProgram, sourceClauseIds: ["RT-CODEX-METADATA", "RT-SELECTED-RULES"] }

const routeLines = routesText.split("\n")
authority.implementationMilestones = routeLines.slice(129, 135).map((line, index) => {
  const match = line.match(/^\| `(M[0-5])` \| (.*) \|$/u)
  if (!match) throw new Error("milestone row is not parseable")
  return { milestoneId: match[1], ordinal: index, exitCondition: match[2], sourceClauseIds: ["RT-MILESTONES"] }
})
for (const candidate of authority.routes) {
  if (candidate.routeKind === "additional-acquisition-spoke") {
    candidate.milestoneAssignment = { kind: "not-applicable", reason: "additional-acquisition-spoke-outside-21-family-milestone-table" }
    continue
  }
  const rowClause = authority.sourceClauses.find((clause) => clause.clauseId === candidate.sourceClauseIds.find((id) => /^RT-ROUTE-/u.test(id)))
  const cells = rowClause.textUtf8Lf.trim().split("|").map((cell) => cell.trim()).filter(Boolean)
  const sourceCell = cells.at(-1)
  const milestoneIds = [...sourceCell.matchAll(/\bM[0-5]\b/gu)].map((match) => match[0])
  candidate.milestoneAssignment = { kind: "assigned", milestoneIds, sourceCell }
}

const dimensionPaths = authority.dimensions.map((row) => ({
  path: "selector.dimensions." + row.dimensionId,
  valueType: "dimension-selector",
  presence: "optional",
  legalValuesSource: row.dimensionId
}))
const contextFields = [
  ["attemptDurablyCommitted", "boolean"],
  ["acceptedClientReceipt", "boolean"],
  ["allActivationGatesSucceeded", "boolean"],
  ["contentMayExistButUnavailableOffline", "boolean"],
  ["onlyBasisIsOfflineCachedProfile", "boolean"],
  ["requiredPinnedClosureComplete", "boolean"],
  ["onlyBasisIsRenderedScrolledOrTimed", "boolean"],
  ["finalSubmissionSettled", "boolean"],
  ["historicalItemRequested", "boolean"],
  ["representedItemVersion", "string"],
  ["requestedItemVersion", "string"]
].map(([field, valueType]) => ({ path: "context." + field, valueType, presence: "optional", absenceSemantics: "not-applicable" }))
authority.snapshotSchema = {
  schemaVersion: "screen-snapshot-constraint-schema-v1",
  fields: [
    { path: "machineId", valueType: "machine-id", presence: "required" },
    ...dimensionPaths,
    ...contextFields
  ],
  stateProjection: { machineIdPath: "machineId", selectorPath: "selector", contextPath: "context" },
  absentOptionalValue: { kind: "not-applicable" },
  sourceClauseIds: ["SS-CONTRACT", "SS-DIM-PRODUCT", "SS-INVALID-01", "SS-INVALID-09"]
}

const selector = (dimensions) => ({ dimensions: Object.fromEntries(Object.entries(dimensions).map(([key, value]) => [key, { operator: "equals", value }])), substates: [] })
const snapshot = (machineId, dimensions, context) => ({ machineId, selector: selector(dimensions), context })
const witnesses = [
  [snapshot("immediate-feedback", { interaction: "answered-revealed" }, { attemptDurablyCommitted: true }), snapshot("immediate-feedback", { interaction: "answered-revealed" }, { attemptDurablyCommitted: false })],
  [snapshot("correction-report", { interaction: "submitted" }, { acceptedClientReceipt: true }), snapshot("correction-report", { interaction: "submitted" }, { acceptedClientReceipt: false })],
  [snapshot("offline-pack", { interaction: "active" }, { allActivationGatesSucceeded: true }), snapshot("offline-pack", { interaction: "active" }, { allActivationGatesSucceeded: false })],
  [snapshot("reference-document", { availability: "empty" }, { contentMayExistButUnavailableOffline: false }), snapshot("reference-document", { availability: "empty" }, { contentMayExistButUnavailableOffline: true })],
  [snapshot("reference-document", { freshness: "current" }, { onlyBasisIsOfflineCachedProfile: false }), snapshot("reference-document", { freshness: "current" }, { onlyBasisIsOfflineCachedProfile: true })],
  [snapshot("immediate-feedback", { interaction: "ready" }, { requiredPinnedClosureComplete: true }), snapshot("immediate-feedback", { interaction: "ready" }, { requiredPinnedClosureComplete: false })],
  [snapshot("immediate-feedback", { interaction: "reviewed" }, { onlyBasisIsRenderedScrolledOrTimed: false }), snapshot("immediate-feedback", { interaction: "reviewed" }, { onlyBasisIsRenderedScrolledOrTimed: true })],
  [snapshot("simulation", { interaction: "answered-revealed" }, { finalSubmissionSettled: true }), snapshot("simulation", { interaction: "answered-revealed" }, { finalSubmissionSettled: false })],
  [snapshot("immediate-feedback", { interaction: "restoring" }, { historicalItemRequested: true, representedItemVersion: "v1", requestedItemVersion: "v1" }), snapshot("immediate-feedback", { interaction: "restoring" }, { historicalItemRequested: true, representedItemVersion: "v2", requestedItemVersion: "v1" })]
]
const expressions = [
  [["selector.dimensions.interaction", "equals", "answered-revealed"], ["context.attemptDurablyCommitted", "equals", false]],
  [["selector.dimensions.interaction", "equals", "submitted"], ["context.acceptedClientReceipt", "equals", false]],
  [["machineId", "equals", "offline-pack"], ["selector.dimensions.interaction", "equals", "active"], ["context.allActivationGatesSucceeded", "equals", false]],
  [["selector.dimensions.availability", "equals", "empty"], ["context.contentMayExistButUnavailableOffline", "equals", true]],
  [["selector.dimensions.freshness", "equals", "current"], ["context.onlyBasisIsOfflineCachedProfile", "equals", true]],
  [["selector.dimensions.interaction", "equals", "ready"], ["context.requiredPinnedClosureComplete", "equals", false]],
  [["selector.dimensions.interaction", "equals", "reviewed"], ["context.onlyBasisIsRenderedScrolledOrTimed", "equals", true]],
  [["machineId", "equals", "simulation"], ["selector.dimensions.interaction", "equals", "answered-revealed"], ["context.finalSubmissionSettled", "equals", false]],
  [["context.historicalItemRequested", "equals", true], ["context.representedItemVersion", "notEquals", { path: "context.requestedItemVersion" }]]
]
for (const constraint of authority.constraints.filter((row) => row.kind === "invalid-combination")) {
  const index = constraint.ordinal - 1
  constraint.expression = { forbidAll: expressions[index].map(([pathValue, operator, value]) => ({ path: pathValue, operator, value })) }
  constraint.witnesses = { legal: witnesses[index][0], forbidden: witnesses[index][1] }
}

for (const id of ["immediate-feedback.selected", "immediate-feedback.committing", "immediate-feedback.selected-recoverable-error"]) state(id).context.attemptDurablyCommitted = false
state("immediate-feedback.answered-revealed").context.attemptDurablyCommitted = true
state("correction-report.submitting").context.acceptedClientReceipt = false
state("correction-report.submitted").context.acceptedClientReceipt = true
state("offline-pack.active").context.allActivationGatesSucceeded = true
for (const candidate of authority.machineStates.filter((row) => row.selector.dimensions.availability?.value === "empty")) candidate.context.contentMayExistButUnavailableOffline = false
for (const candidate of authority.machineStates.filter((row) => row.selector.dimensions.freshness?.value === "current")) candidate.context.onlyBasisIsOfflineCachedProfile = false
for (const candidate of authority.machineStates.filter((row) => row.selector.dimensions.interaction?.value === "reviewed")) candidate.context.onlyBasisIsRenderedScrolledOrTimed = false
for (const candidate of authority.machineStates.filter((row) => row.machineId === "simulation")) candidate.context.finalSubmissionSettled = ["results", "completed"].includes(candidate.stateName)

// Exact preservation fields called out by the transition audit.
for (const id of ["E-CHECK-001-VALIDATE", "E-CHECK-002-MALFORMED", "E-CHECK-01-NO-MATCH", "E-CHECK-01-AMBIGUOUS", "E-CHECK-01-MATCH", "E-CHECK-021-EDIT"]) {
  edge(id).toStateSelector.preserve = ["input"]
}
for (const id of ["E-SIM-001-GENERATE", "E-SIM-003-GENERATION-FAIL", "E-SIM-004-RETRY-GENERATION"]) edge(id).toStateSelector.preserve = ["settings"]
for (const id of ["E-SIM-010-RECORD", "E-SIM-011-CLEAR"]) edge(id).toStateSelector.preserve = ["flag", "position", "sessionId"]
for (const id of ["E-SIM-012-FLAG", "E-SIM-012-UNFLAG", "E-SIM-015-AUTOSAVE"]) {
  const row = edge(id)
  row.toStateSelector.preserve = ["answer", "position", "sessionId", ...(id === "E-SIM-015-AUTOSAVE" ? ["flag"] : [])]
}
edge("E-SIM-035-RETRY-SUBMIT").toStateSelector.preserve = ["answer", "flag", "position", "sessionId", "submissionId"]

setSubstates("hazard-item.editable-recoverable-error", [
  legalField("attemptKind", ["marked", "confirmed-zero"]),
  legalField("previousEditableState", ["ready", "marking"]),
  stableField("neutralMarkers", "same stable neutral marker set used by failed commit"),
  stableField("hazardAttemptId", "same stable opaque hazard attempt ID used by failed commit"),
  stableField("typedCause", "nonempty typed persistence error")
])
edge("E-HAZARD-021-CONFIRM-ZERO").toStateSelector.substateAssignments = { attemptKind: "confirmed-zero", previousEditableState: "state.editableOrigin" }
edge("E-HAZARD-021-CONFIRM-ZERO").toStateSelector.preserve = ["neutralMarkers", "hazardAttemptId"]
edge("E-HAZARD-022-COMMIT-MARKERS").toStateSelector.substateAssignments = { attemptKind: "marked", previousEditableState: "marking" }
edge("E-HAZARD-032-COMMIT-FAIL").toStateSelector.preserve = ["attemptKind", "previousEditableState", "neutralMarkers", "hazardAttemptId"]
edge("E-HAZARD-033-RETRY").toStateSelector.preserve = ["attemptKind", "previousEditableState", "neutralMarkers", "hazardAttemptId"]

// Split zero-confirmation resolution by exact editable origin.
edge("E-HAZARD-020-ZERO-CONFIRM").fromSelector.stateIds = ["hazard-item.ready"]
edge("E-HAZARD-020A-CONFIRM-PRESENTED").toStateSelector.substateAssignments = { editableOrigin: "ready" }
edge("E-HAZARD-020B-CONFIRM-DISMISSED").toStateSelector = { preserve: ["neutralMarkers", "hazardAttemptId"], stateId: "hazard-item.ready", substateAssignments: null }
const markingOutcome = clone(outcome("confirmation.hazard-zero"))
markingOutcome.outcomeId = "confirmation.hazard-zero-marking"
markingOutcome.payload.confirmationId = "hazard-zero-marking-origin"
markingOutcome.payload.allowedResolutionEventIds = ["confirmation.hazard-zero-marking.presented", "confirmation.hazard-zero-marking.dismissed"]
authority.outcomes.push(markingOutcome)
for (const [eventId, resolution] of [["confirmation.hazard-zero-marking.presented", "presented"], ["confirmation.hazard-zero-marking.dismissed", "dismissed"]]) {
  authority.events.push({
    eventId,
    producer: "presentation",
    meaning: "Hazard zero confirmation for marking origin was " + resolution + ".",
    payload: { kind: "outcome-resolution", outcomeId: "confirmation.hazard-zero-marking", resolution },
    sourceClauseIds: ["SS-HAZARD-MACHINE", "SS-GLOBAL-04"]
  })
}
authority.edges.push(
  {
    edgeId: "E-HAZARD-020M-ZERO-CONFIRM",
    machineId: "hazard-item",
    fromSelector: { kind: "machine-state", machineId: "hazard-item", routeIds: ["hazard-player", "review-player"], stateIds: ["hazard-item.marking"], substate: null },
    trigger: { kind: "action", id: "hazard.submit-zero" }, guards: [], outcomeId: "confirmation.hazard-zero-marking",
    sourceClauseIds: ["SS-HAZARD-MACHINE", "SS-HAZARD-SEMANTICS"]
  },
  {
    edgeId: "E-HAZARD-020MA-CONFIRM-PRESENTED", machineId: "hazard-item",
    fromSelector: { kind: "outcome-resolution", outcomeId: "confirmation.hazard-zero-marking" },
    trigger: { kind: "event", id: "confirmation.hazard-zero-marking.presented" }, guards: [],
    toStateSelector: { preserve: ["hazardAttemptId"], stateId: "hazard-item.confirm-zero", substateAssignments: { editableOrigin: "marking", neutralMarkers: "zero-stable-neutral-markers" } },
    sourceClauseIds: ["SS-HAZARD-MACHINE", "SS-GLOBAL-04"]
  },
  {
    edgeId: "E-HAZARD-020MB-CONFIRM-DISMISSED", machineId: "hazard-item",
    fromSelector: { kind: "outcome-resolution", outcomeId: "confirmation.hazard-zero-marking" },
    trigger: { kind: "event", id: "confirmation.hazard-zero-marking.dismissed" }, guards: [],
    toStateSelector: { preserve: ["neutralMarkers", "hazardAttemptId"], stateId: "hazard-item.marking", substateAssignments: null },
    sourceClauseIds: ["SS-HAZARD-MACHINE", "SS-GLOBAL-04"]
  }
)

// Split simulation confirmation by exact initiating trigger so the confirmation
// substate is constructible without a wildcard outcome payload.
edge("E-SIM-020A-CONFIRM-PRESENTED").toStateSelector.substateAssignments = { trigger: "explicit-submit" }
const timerOutcome = clone(outcome("confirmation.simulation-final"))
timerOutcome.outcomeId = "confirmation.simulation-timer-final"
timerOutcome.payload.confirmationId = "simulation-timer-final"
timerOutcome.payload.allowedResolutionEventIds = ["confirmation.simulation-timer-final.presented", "confirmation.simulation-timer-final.dismissed"]
authority.outcomes.push(timerOutcome)
edge("E-SIM-021-TIMER-CONFIRM").outcomeId = "confirmation.simulation-timer-final"
for (const [eventId, resolution] of [["confirmation.simulation-timer-final.presented", "presented"], ["confirmation.simulation-timer-final.dismissed", "dismissed"]]) {
  authority.events.push({ eventId, producer: "presentation", meaning: "Timer final confirmation was " + resolution + ".", payload: { kind: "outcome-resolution", outcomeId: "confirmation.simulation-timer-final", resolution }, sourceClauseIds: ["SS-SIMULATION-MACHINE", "SS-GLOBAL-04"] })
}
authority.edges.push(
  {
    edgeId: "E-SIM-021A-TIMER-CONFIRM-PRESENTED", machineId: "simulation",
    fromSelector: { kind: "outcome-resolution", outcomeId: "confirmation.simulation-timer-final" },
    trigger: { kind: "event", id: "confirmation.simulation-timer-final.presented" }, guards: [],
    toStateSelector: { preserve: ["answer", "flag", "position", "sessionId"], stateId: "simulation.final-confirmation", substateAssignments: { trigger: "strict-timer-opt-in" } },
    sourceClauseIds: ["SS-SIMULATION-MACHINE", "SS-SIMULATION-SEMANTICS", "SS-GLOBAL-04"]
  },
  {
    edgeId: "E-SIM-021B-TIMER-CONFIRM-DISMISSED", machineId: "simulation",
    fromSelector: { kind: "outcome-resolution", outcomeId: "confirmation.simulation-timer-final" },
    trigger: { kind: "event", id: "confirmation.simulation-timer-final.dismissed" }, guards: [],
    toStateSelector: { preserve: ["answer", "flag", "position", "sessionId"], stateId: "simulation.active", substateAssignments: null },
    sourceClauseIds: ["SS-SIMULATION-MACHINE", "SS-SIMULATION-SEMANTICS", "SS-GLOBAL-04"]
  }
)

// Correction safe-fields and receipt closure across validation/failure/save/resume.
setSubstates("correction-report.draft-validation-errors", [stableField("safeFields", "retained editable non-echoing draft"), stableField("validationErrors", "nonempty field diagnostics")])
setSubstates("correction-report.ready-to-submit", [stableField("safeFields", "validated non-echoing draft")])
setSubstates("correction-report.submitting", [stableField("safeFields", "validated non-echoing draft"), stableField("clientReceiptId", "stable opaque ID")])
setSubstates("correction-report.ready-recoverable-error", [stableField("safeFields", "retained validated non-echoing draft"), stableField("clientReceiptId", "same stable opaque ID used by failed submit"), stableField("typedCause", "submission error")])
setSubstates("correction-report.local-draft-saved", [stableField("safeFields", "explicitly saved non-echoing local draft")])
setSubstates("correction-report.submitted", [stableField("acceptedClientReceipt", "matching accepted receipt")])
edge("E-CORR-001-VALIDATE").toStateSelector.preserve = ["safeFields"]
edge("E-CORR-002-VALID").toStateSelector.preserve = ["safeFields"]
edge("E-CORR-003-INVALID").toStateSelector = { preserve: ["safeFields"], stateId: "correction-report.draft-validation-errors", substateAssignments: { validationErrors: "event.validationErrors" } }
edge("E-CORR-010-SUBMIT").toStateSelector = { preserve: ["safeFields"], stateId: "correction-report.submitting", substateAssignments: { clientReceiptId: "command.clientReceiptId" } }
edge("E-CORR-011-ACCEPTED").toStateSelector = { preserve: [], stateId: "correction-report.submitted", substateAssignments: { acceptedClientReceipt: "event.acceptedClientReceipt" } }
edge("E-CORR-012-SUBMIT-FAIL").toStateSelector = { preserve: ["safeFields", "clientReceiptId"], stateId: "correction-report.ready-recoverable-error", substateAssignments: { typedCause: "event.typedCause" } }
edge("E-CORR-020-SAVE-DRAFT").toStateSelector = { preserve: ["safeFields"], stateId: "correction-report.local-draft-saved", substateAssignments: null }
edge("E-CORR-021-RESUME").toStateSelector = { preserve: ["safeFields"], stateId: "correction-report.ready-to-submit", substateAssignments: null }

// Pack update carries prior and candidate generations until atomic activation.
const generationPair = [stableField("priorActiveGeneration", "stable active generation ID or explicit none sentinel"), stableField("candidateGeneration", "stable candidate generation ID")]
for (const id of ["offline-pack.downloading", "offline-pack.paused-offline", "offline-pack.verifying", "offline-pack.staged", "offline-pack.activating", "offline-pack.update-available", "offline-pack.quarantined"]) setSubstates(id, clone(generationPair))
setSubstates("offline-pack.active", [stableField("activeGeneration", "stable active generation ID")])
setSubstates("offline-pack.removing", [stableField("activeGeneration", "stable active generation ID")])
setSubstates("offline-pack.retained", [stableField("activeGeneration", "same retained active generation ID")])
setSubstates("offline-pack.recoverable-error", [legalField("previousLifecycleState", ["downloading", "verifying", "activating"]), ...clone(generationPair), stableField("typedCause", "pack operation error")])
setTarget("E-PACK-001-DOWNLOAD", { assignments: { priorActiveGeneration: "none", candidateGeneration: "command.candidateGeneration" } })
for (const id of ["E-PACK-002-PAUSE-OFFLINE", "E-PACK-003-RESUME", "E-PACK-004-DOWNLOADED", "E-PACK-010-VERIFIED", "E-PACK-011-VERIFY-QUARANTINE", "E-PACK-020-ACTIVATE", "E-PACK-022-ACTIVATE-QUARANTINE", "E-PACK-031-DOWNLOAD-UPDATE"]) edge(id).toStateSelector.preserve = ["priorActiveGeneration", "candidateGeneration"]
for (const id of ["E-PACK-005-DOWNLOAD-FAIL", "E-PACK-012-VERIFY-FAIL", "E-PACK-023-ACTIVATE-FAIL"]) {
  edge(id).toStateSelector.preserve = ["priorActiveGeneration", "candidateGeneration"]
  edge(id).toStateSelector.substateAssignments.typedCause = "event.typedCause"
}
edge("E-PACK-021-ACTIVATED").toStateSelector = { preserve: [], stateId: "offline-pack.active", substateAssignments: { activeGeneration: "state.candidateGeneration" } }
edge("E-PACK-030-UPDATE").toStateSelector = { preserve: [], stateId: "offline-pack.update-available", substateAssignments: { priorActiveGeneration: "state.activeGeneration", candidateGeneration: "event.candidateGeneration" } }
edge("E-PACK-040A-CONFIRM-ACCEPTED").toStateSelector.preserve = ["activeGeneration"]
edge("E-PACK-040B-CONFIRM-DISMISSED").toStateSelector.preserve = ["activeGeneration"]
edge("E-PACK-043-RETAINED").toStateSelector.preserve = ["activeGeneration"]

// Presentation effects are immutable snapshot-meta records acknowledged once.
authority.effectTypes = [
  { effectType: "focus", payloadVariant: "semantic-target", sourceClauseIds: ["SS-CONTRACT", "SS-FOCUS-ISLAND"] },
  { effectType: "announcement", payloadVariant: "live-region-policy", sourceClauseIds: ["SS-GLOBAL-04", "SS-FOCUS-ISLAND"] },
  { effectType: "navigation", payloadVariant: "typed-navigation-outcome", sourceClauseIds: ["SS-GLOBAL-04", "SS-HISTORY"] },
  { effectType: "viewport", payloadVariant: "semantic-target-visibility", sourceClauseIds: ["SS-FOCUS-ISLAND", "SS-ACCEPTANCE"] }
]
const effect = (effectId, effectType, semanticTarget, announcementMode, sourceClauseIds, fallbackTarget = null) => ({
  effectId,
  effectType,
  semanticTarget: { kind: "semantic-target", target: semanticTarget, fallbackTarget },
  announcementPolicy: { mode: announcementMode, hiddenAnswerExposureForbidden: true, duplicateSuppression: "effect-id" },
  ordering: { phase: "after-render", sequence: 1, connectedTargetRequired: effectType === "focus" || effectType === "viewport" },
  acknowledgement: { mode: "exactly-once", eventId: "presentation.effect-acknowledged", keyField: "effectId" },
  snapshotMetaPath: "meta.presentationEffects[]",
  sourceClauseIds
})
authority.presentationEffects = [
  effect("FX-ERROR-SUMMARY-FOCUS", "focus", "error-summary", "none", ["SS-FOCUS-ISLAND", "SS-ACCEPTANCE"]),
  effect("FX-OUTCOME-FOCUS", "focus", "outcome", "none", ["SS-FOCUS-ISLAND", "SS-QUESTION-SEMANTICS"]),
  effect("FX-COMPLETION-ASSERTIVE", "announcement", "outcome", "assertive-concise-once", ["SS-FOCUS-ISLAND", "SS-QUESTION-SEMANTICS"]),
  effect("FX-NEXT-PROMPT-FOCUS", "focus", "prompt-heading", "none", ["SS-FOCUS-ISLAND", "SS-HISTORY"]),
  effect("FX-BACKGROUND-ACTION-POLITE", "announcement", "available-action-status", "polite-only-if-action-changed", ["SS-FOCUS-ISLAND", "SS-GLOBAL-05"]),
  effect("FX-DIALOG-RESTORE-FOCUS", "focus", "dialog-trigger", "none", ["SS-FOCUS-ISLAND", "SS-GLOBAL-04"], "owning-heading"),
  effect("FX-FRAGMENT-HEADING-FOCUS", "focus", "fragment-heading", "none", ["SS-FOCUS-DOCUMENT", "SS-GLOBAL-04"]),
  effect("FX-FOCUS-VISIBILITY", "viewport", "current-focus", "none", ["SS-FOCUS-ISLAND", "SS-ACCEPTANCE"])
]
authority.effectBindings = []
const bindEffect = (effectId, edgeIds, condition) => authority.effectBindings.push({ bindingId: "BIND-" + effectId, effectId, edgeIds, emissionCondition: condition, sourceClauseIds: ["SS-GLOBAL-04", "SS-FOCUS-ISLAND"] })
bindEffect("FX-ERROR-SUMMARY-FOCUS", authority.edges.filter((row) => row.toStateSelector?.stateId?.includes("recoverable-error") || row.toStateSelector?.stateId?.includes("validation-error")).map((row) => row.edgeId), "user-triggered validation or operation failure")
bindEffect("FX-OUTCOME-FOCUS", ["E-ANSWER-021-COMMIT-COMPLETE", "E-HAZARD-030-COMMIT-COMPLETE"], "durable immediate-feedback commit success")
bindEffect("FX-COMPLETION-ASSERTIVE", ["E-ANSWER-021-COMMIT-COMPLETE", "E-HAZARD-030-COMMIT-COMPLETE"], "durable immediate-feedback commit success")
bindEffect("FX-NEXT-PROMPT-FOCUS", ["E-ANSWER-041-NEXT", "E-HAZARD-041-NEXT"], "next item or scene rendered")
bindEffect("FX-BACKGROUND-ACTION-POLITE", ["E-REF-020-REFRESH-CURRENT", "E-REF-021-REFRESH-OFFLINE-STALE"], "background change alters an available action")
bindEffect("FX-DIALOG-RESTORE-FOCUS", authority.edges.filter((row) => row.trigger.id.endsWith(".dismissed") || row.trigger.id === "print.dialog-closed").map((row) => row.edgeId), "dialog close or cancellation")
bindEffect("FX-FRAGMENT-HEADING-FOCUS", ["E-REF-031-CACHED-PARENT"], "fragment navigation requires continuity")
bindEffect("FX-FOCUS-VISIBILITY", authority.edges.filter((row) => row.toStateSelector).map((row) => row.edgeId), "semantic focus target may be obscured at supported zoom or reflow")
if (!authority.events.some((row) => row.eventId === "presentation.effect-acknowledged")) authority.events.push({
  eventId: "presentation.effect-acknowledged", producer: "presentation", meaning: "View acknowledged one completed presentation effect by immutable effect ID.",
  payload: { kind: "closed-tagged-object", tagField: "tag", tagValue: "presentation.effect-acknowledged", additionalProperties: false, fields: [{ fieldId: "tag", valueType: "literal", literal: "presentation.effect-acknowledged", required: true }, { fieldId: "effectId", valueType: "effect-id", required: true }] },
  sourceClauseIds: ["SS-CONTRACT", "SS-GLOBAL-04", "SS-ACCEPTANCE"]
})

// Replace nominal payloads with closed, exact tagged schemas.
const field = (fieldId, valueType, required = true, extra = {}) => ({ fieldId, valueType, required, ...extra })
const closedSchema = (id, fields) => ({ kind: "closed-tagged-object", tagField: "tag", tagValue: id, additionalProperties: false, fields: [field("tag", "literal", true, { literal: id }), ...fields] })
const actionExtra = {
  "answer.select-option": [field("optionId", "option-id")],
  "simulation.generate": [field("settings", "simulation-settings")],
  "simulation.navigate": [field("position", "simulation-position")],
  "pack.download": [field("candidateGeneration", "pack-generation-id")],
  "correction.submit": [field("clientReceiptId", "client-receipt-id")],
  "data.start": [field("operationKind", "enum", true, { legalValues: ["import", "scoped-reset", "projection-rebuild"] })]
}
for (const candidate of authority.actions) candidate.payload = closedSchema(candidate.actionId, [field("snapshotRevision", "snapshot-revision"), ...(actionExtra[candidate.actionId] ?? [])])
const eventExtra = {
  "operation.typed-failure": [field("typedCause", "typed-cause")],
  "correction.validation-errors": [field("validationErrors", "field-diagnostics")],
  "correction.accepted": [field("acceptedClientReceipt", "accepted-client-receipt")],
  "pack.update-available": [field("candidateGeneration", "pack-generation-id")],
  "simulation.generated": [field("answer", "enum", true, { legalValues: ["unanswered", "recorded"] }), field("flag", "enum", true, { legalValues: ["flagged", "unflagged"] }), field("position", "simulation-position"), field("sessionId", "simulation-session-id")],
  "persistence.restored": [field("neutralMarkers", "literal", true, { literal: "zero-stable-neutral-markers" }), field("hazardAttemptId", "hazard-attempt-id")]
}
for (const candidate of authority.events) {
  if (candidate.payload.kind === "outcome-resolution") continue
  if (candidate.eventId === "presentation.effect-acknowledged") continue
  candidate.payload = closedSchema(candidate.eventId, eventExtra[candidate.eventId] ?? [])
}

// Every typed failure constructs typedCause explicitly.
if (!state("data-operation.recoverable-error").selector.substates.some((row) => row.substateId === "typedCause")) {
  state("data-operation.recoverable-error").selector.substates.push(stableField("typedCause", "nonempty typed data-operation failure"))
}
for (const candidate of authority.edges.filter((row) => row.trigger.kind === "event" && row.trigger.id === "operation.typed-failure" && row.toStateSelector?.stateId)) {
  candidate.toStateSelector.substateAssignments ??= {}
  candidate.toStateSelector.substateAssignments.typedCause = "event.typedCause"
}
edge("E-ANSWER-010-SELECT").toStateSelector.substateAssignments.selectedOptionId = "command.optionId"
edge("E-HAZARD-001-RESTORED").toStateSelector = { preserve: [], stateId: "hazard-item.ready", substateAssignments: { neutralMarkers: "event.neutralMarkers", hazardAttemptId: "event.hazardAttemptId" } }

const sourceStateIds = (selector, seen = new Set()) => {
  if (selector.kind === "machine-state") return selector.stateIds ?? []
  if (selector.kind === "route-state-projection") return [...new Set(Object.values(selector.byRouteId).flat())]
  if (selector.kind === "outcome-resolution") {
    if (seen.has(selector.outcomeId)) return []
    seen.add(selector.outcomeId)
    return [...new Set(authority.edges.filter((candidate) => candidate.outcomeId === selector.outcomeId).flatMap((candidate) => sourceStateIds(candidate.fromSelector, seen)))]
  }
  return []
}
const stateField = (stateId, fieldId) => state(stateId).selector.substates.find((candidate) => candidate.substateId === fieldId)
const requiredDynamicFields = (stateId) => state(stateId).selector.substates.filter((candidate) => !Object.hasOwn(candidate, "fixedValue") && !Object.hasOwn(candidate, "initialValue")).map((candidate) => candidate.substateId)
const schemaForTrigger = (trigger) => trigger.kind === "action" ? action(trigger.id).payload : event(trigger.id).payload
const triggerTypeByTargetField = {
  selectedOptionId: "option-id",
  typedCause: "typed-cause",
  validationErrors: "field-diagnostics",
  missingPinnedClosure: "missing-pinned-closure",
  flag: "enum",
  answer: "enum",
  neutralMarkers: "neutral-marker-set",
  hazardAttemptId: "hazard-attempt-id",
  settings: "simulation-settings",
  position: "simulation-position",
  sessionId: "simulation-session-id",
  submissionId: "simulation-submission-id",
  candidateGeneration: "pack-generation-id",
  priorActiveGeneration: "pack-generation-id",
  activeGeneration: "pack-generation-id",
  clientReceiptId: "client-receipt-id",
  acceptedClientReceipt: "accepted-client-receipt",
  operationKind: "enum"
}
const ensureTriggerField = (trigger, fieldId, targetField) => {
  const schema = schemaForTrigger(trigger)
  if (schema.kind !== "closed-tagged-object") return
  if (!schema.fields.some((candidate) => candidate.fieldId === fieldId)) {
    const valueType = targetField?.legalValues ? "enum" : targetField?.fixedValue !== undefined ? "literal" : triggerTypeByTargetField[fieldId] ?? "opaque-" + fieldId
    const extra = targetField?.legalValues ? { legalValues: targetField.legalValues } : targetField?.fixedValue !== undefined ? { literal: targetField.fixedValue } : {}
    schema.fields.push(field(fieldId, valueType, true, extra))
  }
}

// Independent generic construction closure for every explicit state target.
for (const candidate of authority.edges.filter((row) => row.toStateSelector?.stateId)) {
  const targetId = candidate.toStateSelector.stateId
  const originIds = sourceStateIds(candidate.fromSelector)
  candidate.toStateSelector.preserve ??= []
  candidate.toStateSelector.substateAssignments ??= null
  for (const fieldId of [...candidate.toStateSelector.preserve]) {
    if (originIds.length > 0 && originIds.every((originId) => Boolean(stateField(originId, fieldId)))) continue
    candidate.toStateSelector.preserve = candidate.toStateSelector.preserve.filter((value) => value !== fieldId)
    candidate.toStateSelector.substateAssignments ??= {}
    const prefix = candidate.trigger.kind === "action" ? "command." : "event."
    candidate.toStateSelector.substateAssignments[fieldId] = prefix + fieldId
    ensureTriggerField(candidate.trigger, fieldId, stateField(targetId, fieldId))
  }
  for (const fieldId of requiredDynamicFields(targetId)) {
    const assigned = Object.hasOwn(candidate.toStateSelector.substateAssignments ?? {}, fieldId)
    const preserved = candidate.toStateSelector.preserve.includes(fieldId)
    if (assigned || preserved) continue
    if (originIds.length > 0 && originIds.every((originId) => Boolean(stateField(originId, fieldId)))) {
      candidate.toStateSelector.preserve.push(fieldId)
    } else {
      candidate.toStateSelector.substateAssignments ??= {}
      const prefix = candidate.trigger.kind === "action" ? "command." : "event."
      candidate.toStateSelector.substateAssignments[fieldId] = prefix + fieldId
      ensureTriggerField(candidate.trigger, fieldId, stateField(targetId, fieldId))
    }
  }
}

// Navigation destination construction is separate from outcome semantics.
authority.navigationConstructions = []
for (const candidate of authority.edges.filter((row) => row.outcomeId)) {
  const selectedOutcome = outcome(candidate.outcomeId)
  if (!new Set(["navigation", "exit"]).has(selectedOutcome.outcomeType)) continue
  const destinationStateId = selectedOutcome.payload.selector?.destinationStateId
  if (!destinationStateId) continue
  const originIds = sourceStateIds(candidate.fromSelector)
  const preserve = []
  const assignments = {}
  for (const fieldId of requiredDynamicFields(destinationStateId)) {
    if (originIds.length > 0 && originIds.every((originId) => Boolean(stateField(originId, fieldId)))) preserve.push(fieldId)
    else {
      const prefix = candidate.trigger.kind === "action" ? "command." : "event."
      assignments[fieldId] = prefix + fieldId
      ensureTriggerField(candidate.trigger, fieldId, stateField(destinationStateId, fieldId))
    }
  }
  authority.navigationConstructions.push({
    constructionId: "NAV-CONSTRUCT-" + candidate.edgeId,
    edgeId: candidate.edgeId,
    outcomeId: candidate.outcomeId,
    destinationStateId,
    preserve,
    assignments: Object.keys(assignments).length ? assignments : null,
    sourceClauseIds: [...new Set([...candidate.sourceClauseIds, "SS-GLOBAL-04"])]
  })
}

// Interpret the newly curated mechanics rather than presenting them as quotes.
authority.interpretations.push(
  { interpretationId: "INT-TRIGGER-PAYLOAD-CONSTRUCTION", coverageTags: ["trigger-payload-construction"], sourceNotation: "semantic commands and typed failures", resolution: "Each trigger is a closed tagged payload; dynamic target fields are fixed, preserved from every legal origin, or assigned from a declared trigger field.", rationale: "This makes each transition constructible without DOM inference or wildcard failure payloads.", limitation: "Provider-level field encodings are curated and require implementation conformance evidence.", sourceClauseIds: ["SS-CONTRACT", "SS-GLOBAL-01", "SS-TYPED-ERROR"] },
  { interpretationId: "INT-EFFECT-LIFECYCLE", coverageTags: ["effect-lifecycle"], sourceNotation: "render, then focus/announce; effect ID acknowledged once", resolution: "Presentation effects are immutable snapshot-meta values with semantic targets, after-render order, and exactly-once acknowledgement keyed by effectId.", rationale: "The source explicitly forbids DOM-derived application truth and requires acknowledgement.", limitation: "Exact copy strings and renderer scheduling remain implementation details.", sourceClauseIds: ["SS-CONTRACT", "SS-GLOBAL-04", "SS-FOCUS-ISLAND", "SS-ACCEPTANCE"] },
  { interpretationId: "INT-PACK-DUAL-GENERATION", coverageTags: ["pack-dual-generation"], sourceNotation: "prior valid pack remains active during update", resolution: "Update-path states carry priorActiveGeneration and candidateGeneration simultaneously until one atomic activation replaces the active generation.", rationale: "A flat pack version cannot represent retained prior truth and an in-flight candidate at once.", limitation: "Generation identifier encoding is implementation-defined.", sourceClauseIds: ["SS-PACK-MACHINE", "SS-PACK-SEMANTICS", "RT-ROUTE-20"] }
)

const mutation = (mutationId, purpose, operations, expectedValidatorId) => ({ mutationId, purpose, operations, expectedResult: "reject", expectedExitCode: 1, expectedValidatorId })
const op = (opValue, pointer, value) => ({ document: "authority", op: opValue, pointer, ...(opValue === "remove" ? {} : { value }) })
const stateIndex = (id) => authority.machineStates.findIndex((row) => row.machineStateId === id)
const edgeIndex = (id) => authority.edges.findIndex((row) => row.edgeId === id)
const constraintIndex = (id) => authority.constraints.findIndex((row) => row.constraintId === id)
const effectIndex = (id) => authority.presentationEffects.findIndex((row) => row.effectId === id)
const effectBindingIndex = (id) => authority.effectBindings.findIndex((row) => row.bindingId === id)
const actionIndex = (id) => authority.actions.findIndex((row) => row.actionId === id)
const eventIndex = (id) => authority.events.findIndex((row) => row.eventId === id)
const routeIndex = (id) => authority.routes.findIndex((row) => row.routeId === id)
const findFieldIndex = (stateId, fieldId) => state(stateId).selector.substates.findIndex((row) => row.substateId === fieldId)
const actionFieldIndex = (actionId, fieldId) => action(actionId).payload.fields.findIndex((row) => row.fieldId === fieldId)
const eventFieldIndex = (eventId, fieldId) => event(eventId).payload.fields.findIndex((row) => row.fieldId === fieldId)

const addedMutations = [
  mutation("MUT-V4-CHECKER-INPUT-DELETE", "Checker validation must retain input.", [op("replace", `/edges/${edgeIndex("E-CHECK-001-VALIDATE")}/toStateSelector/preserve`, [])], "TRANSITION_CONSTRUCTIBILITY"),
  mutation("MUT-V4-SIM-SETTINGS-DELETE", "Simulation generation must retain settings.", [op("replace", `/edges/${edgeIndex("E-SIM-003-GENERATION-FAIL")}/toStateSelector/preserve`, [])], "SIMULATION_PRESERVATION"),
  mutation("MUT-V4-SIM-POSITION-DELETE", "Simulation flagging retains position and session.", [op("replace", `/edges/${edgeIndex("E-SIM-012-FLAG")}/toStateSelector/preserve`, ["answer", "sessionId"])], "SIMULATION_PRESERVATION"),
  mutation("MUT-V4-SIM-RETRY-DELETE", "Retry submit retains the entire submission identity.", [op("replace", `/edges/${edgeIndex("E-SIM-035-RETRY-SUBMIT")}/toStateSelector/preserve`, ["answer", "flag", "position", "sessionId"])], "SIMULATION_PRESERVATION"),
  mutation("MUT-V4-HAZARD-ATTEMPT-KIND-DELETE", "Hazard failure retains attempt kind.", [op("replace", `/edges/${edgeIndex("E-HAZARD-032-COMMIT-FAIL")}/toStateSelector/preserve`, ["previousEditableState", "neutralMarkers", "hazardAttemptId"])], "HAZARD_PRESERVATION"),
  mutation("MUT-V4-HAZARD-READY-ORIGIN-REPLACE", "Ready-origin dismissal returns to ready.", [op("replace", `/edges/${edgeIndex("E-HAZARD-020B-CONFIRM-DISMISSED")}/toStateSelector/stateId`, "hazard-item.marking")], "CONFIRMATION_DETERMINISM"),
  mutation("MUT-V4-CORRECTION-SAFE-FIELDS-DELETE", "Validation errors retain safe fields.", [op("remove", `/machineStates/${stateIndex("correction-report.draft-validation-errors")}/selector/substates/${findFieldIndex("correction-report.draft-validation-errors", "safeFields")}`)], "TRANSITION_CONSTRUCTIBILITY"),
  mutation("MUT-V4-CORRECTION-RECEIPT-DELETE", "Submission failure retains receipt ID.", [op("replace", `/edges/${edgeIndex("E-CORR-012-SUBMIT-FAIL")}/toStateSelector/preserve`, ["safeFields"])], "TRANSITION_CONSTRUCTIBILITY"),
  mutation("MUT-V4-TRIGGER-OPTION-ID-DELETE", "selectOption declares optionId used by construction.", [op("remove", `/actions/${actionIndex("answer.select-option")}/payload/fields/${actionFieldIndex("answer.select-option", "optionId")}`)], "TRIGGER_CONSTRUCTION"),
  mutation("MUT-V4-TRIGGER-TYPED-CAUSE-DELETE", "Typed failure declares typedCause.", [op("remove", `/events/${eventIndex("operation.typed-failure")}/payload/fields/${eventFieldIndex("operation.typed-failure", "typedCause")}`)], "TRIGGER_CONSTRUCTION"),
  mutation("MUT-V4-TRIGGER-SMUGGLE-UNKNOWN", "Assignments cannot read undeclared trigger fields.", [op("replace", `/edges/${edgeIndex("E-CORR-012-SUBMIT-FAIL")}/toStateSelector/substateAssignments/typedCause`, "event.privateCause")], "TRIGGER_CONSTRUCTION"),
  mutation("MUT-V4-CONSTRAINT-UNRESOLVED-PATH", "Every operand resolves against snapshot schema.", [op("replace", `/constraints/${constraintIndex("INVALID-01-NO-REVEAL-BEFORE-COMMIT")}/expression/forbidAll/0/path`, "dimensions.interaction")], "CONSTRAINT_PATH"),
  mutation("MUT-V4-CONSTRAINT-NEGATIVE-WITNESS", "Each negative witness must violate its constraint.", [op("replace", `/constraints/${constraintIndex("INVALID-02-NO-SUBMITTED-WITHOUT-RECEIPT")}/witnesses/forbidden/context/acceptedClientReceipt`, true)], "CONSTRAINT_WITNESS"),
  mutation("MUT-V4-EFFECT-DELETE", "Required effect lifecycle cannot be deleted.", [op("remove", `/presentationEffects/${effectIndex("FX-ERROR-SUMMARY-FOCUS")}`)], "EFFECT_ID_SET"),
  mutation("MUT-V4-EFFECT-ORDER-REPLACE", "Effects run after render.", [op("replace", `/presentationEffects/${effectIndex("FX-OUTCOME-FOCUS")}/ordering/phase`, "before-render")], "EFFECT_LIFECYCLE"),
  mutation("MUT-V4-EFFECT-ACK-REPLACE", "Effect acknowledgement is exactly once.", [op("replace", `/presentationEffects/${effectIndex("FX-COMPLETION-ASSERTIVE")}/acknowledgement/mode`, "at-least-once")], "EFFECT_LIFECYCLE"),
  mutation("MUT-V4-PACK-PRIOR-GENERATION-DELETE", "Update verification retains the prior active generation.", [op("remove", `/machineStates/${stateIndex("offline-pack.verifying")}/selector/substates/0`)], "TRANSITION_CONSTRUCTIBILITY"),
  mutation("MUT-V4-PACK-CANDIDATE-GENERATION-DELETE", "Update verification retains candidate generation.", [op("remove", `/edges/${edgeIndex("E-PACK-010-VERIFIED")}/toStateSelector/preserve/1`)], "TRANSITION_CONSTRUCTIBILITY"),
  mutation("MUT-V4-PACK-ACTIVATION-SMUGGLE", "Atomic activation selects only the verified candidate.", [op("replace", `/edges/${edgeIndex("E-PACK-021-ACTIVATED")}/toStateSelector/substateAssignments/activeGeneration`, "state.priorActiveGeneration")], "PACK_GENERATION"),
  mutation("MUT-V4-NAV-RULE-DELETE", "The exact 11-rule selected program is complete.", [op("remove", "/selectedDirection/rules/0")], "SELECTED_DIRECTION"),
  mutation("MUT-V4-NAV-RULE-REORDER", "Selected program rule order is authoritative.", [op("replace", "/selectedDirection/rules/0/id", "NAV-NATIVE-COMPACT")], "SELECTED_DIRECTION"),
  mutation("MUT-V4-NAV-RULE-STATEMENT", "Selected program statements are source exact.", [op("replace", "/selectedDirection/rules/0/statement", "drift")], "SELECTED_DIRECTION"),
  mutation("MUT-V4-MILESTONE-DELETE", "M0-M5 closure is complete.", [op("remove", "/implementationMilestones/5")], "MILESTONE_ID_SET"),
  mutation("MUT-V4-MILESTONE-ASSIGNMENT-LOSS", "Each registry route retains its source-derived milestone assignment.", [op("replace", `/routes/${routeIndex("question-player")}/milestoneAssignment/milestoneIds`, [])], "MILESTONE_CLOSURE"),
  mutation("MUT-V4-QUESTION-SELECTION-DELETE", "Question commit failure retains selectedOptionId independently of draftAttemptId.", [op("replace", `/edges/${edgeIndex("E-ANSWER-023-COMMIT-FAIL")}/toStateSelector/preserve`, ["draftAttemptId"])], "QUESTION_PRESERVATION"),
  mutation("MUT-V4-QUESTION-ATTEMPT-DOMAIN-REPLACE", "Question draftAttemptId remains a stable identity field.", [op("replace", `/machineStates/${stateIndex("immediate-feedback.selected-recoverable-error")}/selector/substates/${findFieldIndex("immediate-feedback.selected-recoverable-error", "draftAttemptId")}/valueDomain`, "ephemeral attempt")], "QUESTION_PRESERVATION"),
  mutation("MUT-V4-QUESTION-OPTION-TYPE-REPLACE", "Question option assignment has an exact option-id trigger type.", [op("replace", `/actions/${actionIndex("answer.select-option")}/payload/fields/${actionFieldIndex("answer.select-option", "optionId")}/valueType`, "free-string")], "TRIGGER_CONSTRUCTION"),
  mutation("MUT-V4-HAZARD-PREVIOUS-STATE-DELETE", "Hazard commit failure retains previousEditableState.", [op("replace", `/edges/${edgeIndex("E-HAZARD-032-COMMIT-FAIL")}/toStateSelector/preserve`, ["attemptKind", "neutralMarkers", "hazardAttemptId"])], "HAZARD_PRESERVATION"),
  mutation("MUT-V4-HAZARD-ATTEMPT-ID-DELETE", "Hazard commit failure retains hazardAttemptId.", [op("replace", `/edges/${edgeIndex("E-HAZARD-032-COMMIT-FAIL")}/toStateSelector/preserve`, ["attemptKind", "previousEditableState", "neutralMarkers"])], "HAZARD_PRESERVATION"),
  mutation("MUT-V4-HAZARD-RESTORE-MARKER-REPLACE", "Hazard restoration constructs the exact neutral marker literal.", [op("replace", `/events/${eventIndex("persistence.restored")}/payload/fields/${eventFieldIndex("persistence.restored", "neutralMarkers")}/literal`, "non-neutral-marker")], "TRIGGER_CONSTRUCTION"),
  mutation("MUT-V4-SIM-FAILURE-ANSWER-DELETE", "Simulation failure retains the current answer.", [op("replace", `/edges/${edgeIndex("E-SIM-032-SUBMIT-FAIL")}/toStateSelector/preserve`, ["flag", "position", "sessionId", "submissionId"])], "SIMULATION_PRESERVATION"),
  mutation("MUT-V4-SIM-FAILURE-POSITION-DELETE", "Simulation failure retains the current position.", [op("replace", `/edges/${edgeIndex("E-SIM-032-SUBMIT-FAIL")}/toStateSelector/preserve`, ["answer", "flag", "sessionId", "submissionId"])], "SIMULATION_PRESERVATION"),
  mutation("MUT-V4-SIM-FAILURE-SESSION-DELETE", "Simulation failure retains the session identity.", [op("replace", `/edges/${edgeIndex("E-SIM-032-SUBMIT-FAIL")}/toStateSelector/preserve`, ["answer", "flag", "position", "submissionId"])], "SIMULATION_PRESERVATION"),
  mutation("MUT-V4-SIM-FAILURE-SUBMISSION-DELETE", "Simulation failure retains the submission identity.", [op("replace", `/edges/${edgeIndex("E-SIM-032-SUBMIT-FAIL")}/toStateSelector/preserve`, ["answer", "flag", "position", "sessionId"])], "SIMULATION_PRESERVATION"),
  mutation("MUT-V4-SIM-POSITION-TYPE-REPLACE", "Simulation generated position matches the destination field contract.", [op("replace", `/events/${eventIndex("simulation.generated")}/payload/fields/${eventFieldIndex("simulation.generated", "position")}/valueType`, "free-number")], "TRIGGER_CONSTRUCTION"),
  mutation("MUT-V4-CORRECTION-VALIDATE-SAFE-DELETE", "Correction validation retains safe fields.", [op("replace", `/edges/${edgeIndex("E-CORR-001-VALIDATE")}/toStateSelector/preserve`, [])], "TRANSITION_CONSTRUCTIBILITY"),
  mutation("MUT-V4-CORRECTION-INVALID-SAFE-DELETE", "Correction validation errors retain safe fields.", [op("replace", `/edges/${edgeIndex("E-CORR-003-INVALID")}/toStateSelector/preserve`, [])], "TRANSITION_CONSTRUCTIBILITY"),
  mutation("MUT-V4-CORRECTION-SAVE-SAFE-DELETE", "Correction local save retains safe fields.", [op("replace", `/edges/${edgeIndex("E-CORR-020-SAVE-DRAFT")}/toStateSelector/preserve`, [])], "TRANSITION_CONSTRUCTIBILITY"),
  mutation("MUT-V4-CORRECTION-RESUME-SAFE-DELETE", "Correction resume retains safe fields.", [op("replace", `/edges/${edgeIndex("E-CORR-021-RESUME")}/toStateSelector/preserve`, [])], "TRANSITION_CONSTRUCTIBILITY"),
  mutation("MUT-V4-CORRECTION-SAFE-SMUGGLE", "Correction failure cannot reconstruct safe fields from an undeclared failure payload.", [op("replace", `/edges/${edgeIndex("E-CORR-012-SUBMIT-FAIL")}/toStateSelector/preserve`, ["clientReceiptId"]), op("add", `/edges/${edgeIndex("E-CORR-012-SUBMIT-FAIL")}/toStateSelector/substateAssignments/safeFields`, "event.privateSafeFields")], "TRIGGER_CONSTRUCTION"),
  mutation("MUT-V4-PACK-UPDATE-CANDIDATE-SMUGGLE", "Pack update candidate comes from the declared event field.", [op("replace", `/edges/${edgeIndex("E-PACK-030-UPDATE")}/toStateSelector/substateAssignments/candidateGeneration`, "event.privateCandidate")], "TRIGGER_CONSTRUCTION"),
  mutation("MUT-V4-PACK-DOWNLOAD-PRIOR-DELETE", "Pack update download retains the prior active generation.", [op("replace", `/edges/${edgeIndex("E-PACK-031-DOWNLOAD-UPDATE")}/toStateSelector/preserve`, ["candidateGeneration"])], "TRANSITION_CONSTRUCTIBILITY"),
  mutation("MUT-V4-PACK-QUARANTINE-PRIOR-DELETE", "Pack verification quarantine retains the prior active generation.", [op("replace", `/edges/${edgeIndex("E-PACK-011-VERIFY-QUARANTINE")}/toStateSelector/preserve`, ["candidateGeneration"])], "TRANSITION_CONSTRUCTIBILITY"),
  mutation("MUT-V4-PACK-FAILURE-CANDIDATE-DELETE", "Pack verification failure retains the candidate generation.", [op("replace", `/edges/${edgeIndex("E-PACK-012-VERIFY-FAIL")}/toStateSelector/preserve`, ["priorActiveGeneration"])], "TRANSITION_CONSTRUCTIBILITY"),
  mutation("MUT-V4-PACK-ACTIVATING-PRIOR-DELETE", "Pack activation retains the prior active generation until promotion.", [op("replace", `/edges/${edgeIndex("E-PACK-020-ACTIVATE")}/toStateSelector/preserve`, ["candidateGeneration"])], "TRANSITION_CONSTRUCTIBILITY"),
  mutation("MUT-V4-PACK-ACTIVATION-QUARANTINE-CANDIDATE-DELETE", "Pack activation quarantine retains the candidate generation.", [op("replace", `/edges/${edgeIndex("E-PACK-022-ACTIVATE-QUARANTINE")}/toStateSelector/preserve`, ["priorActiveGeneration"])], "TRANSITION_CONSTRUCTIBILITY"),
  mutation("MUT-V4-EFFECT-SEMANTIC-TARGET-REPLACE", "Presentation focus targets remain semantic rather than DOM selectors.", [op("replace", `/presentationEffects/${effectIndex("FX-ERROR-SUMMARY-FOCUS")}/semanticTarget/kind`, "dom-selector")], "EFFECT_LIFECYCLE"),
  mutation("MUT-V4-EFFECT-DOM-TARGET-REPLACE", "Presentation focus targets do not contain CSS selector syntax.", [op("replace", `/presentationEffects/${effectIndex("FX-ERROR-SUMMARY-FOCUS")}/semanticTarget/target`, "#error-summary")], "EFFECT_LIFECYCLE"),
  mutation("MUT-V4-EFFECT-ANNOUNCEMENT-REPLACE", "Presentation announcements suppress duplicate effect IDs.", [op("replace", `/presentationEffects/${effectIndex("FX-BACKGROUND-ACTION-POLITE")}/announcementPolicy/duplicateSuppression`, "none")], "EFFECT_LIFECYCLE"),
  mutation("MUT-V4-EFFECT-BINDING-DELETE", "Every effect has a nonempty emitting edge binding.", [op("replace", `/effectBindings/${effectBindingIndex("BIND-FX-FOCUS-VISIBILITY")}/edgeIds`, [])], "EFFECT_LIFECYCLE"),
  mutation("MUT-V4-EFFECT-ACK-FIELD-DELETE", "Exactly-once acknowledgement declares effectId.", [op("remove", `/events/${eventIndex("presentation.effect-acknowledged")}/payload/fields/${eventFieldIndex("presentation.effect-acknowledged", "effectId")}`)], "EFFECT_LIFECYCLE"),
  mutation("MUT-V4-EFFECT-CONTINUATION-SMUGGLE", "Presentation payloads cannot smuggle a transition continuation.", [op("add", `/presentationEffects/${effectIndex("FX-OUTCOME-FOCUS")}/semanticTarget/continuationStateId`, "immediate-feedback.completed")], "TRANSITION_CHANNEL"),
  ...authority.constraints.filter((row) => row.kind === "invalid-combination").map((row) => mutation("MUT-V4-CONSTRAINT-" + String(row.ordinal).padStart(2, "0") + "-WITNESS-REPLACE", "Constraint " + row.ordinal + " must retain a distinct forbidden witness.", [op("replace", `/constraints/${constraintIndex(row.constraintId)}/witnesses/forbidden`, clone(row.witnesses.legal))], "CONSTRAINT_WITNESS")),
  mutation("MUT-V4-CONSTRAINT-NESTED-PATH-MISSING", "Nested context operand paths must resolve in the canonical schema.", [op("replace", `/constraints/${constraintIndex("INVALID-09-HISTORY-EXACT-VERSION")}/expression/forbidAll/1/value/path`, "context.privateVersion")], "CONSTRAINT_PATH"),
  mutation("MUT-V4-CONSTRAINT-STATE-VIOLATION", "Machine states cannot instantiate a forbidden snapshot.", [op("replace", `/machineStates/${stateIndex("immediate-feedback.answered-revealed")}/context/attemptDurablyCommitted`, false)], "CONSTRAINT_STATE"),
  mutation("MUT-V4-TRIGGER-WILDCARD-REPLACE", "Every trigger payload remains a closed tagged object.", [op("replace", `/events/${eventIndex("operation.typed-failure")}/payload/kind`, "wildcard")], "EVENT_PAYLOAD_TAG"),
  mutation("MUT-V4-TRIGGER-ENUM-DOMAIN-REPLACE", "Trigger enum values match target state legal values.", [op("replace", `/events/${eventIndex("simulation.generated")}/payload/fields/${eventFieldIndex("simulation.generated", "answer")}/legalValues`, ["unknown"] )], "TRIGGER_CONSTRUCTION"),
  mutation("MUT-V4-NAV-EVIDENCE-DRIFT", "Selected navigation evidence remains CODEX-only with no human participants.", [op("replace", "/selectedDirection/humanParticipantCount", 1)], "SELECTED_DIRECTION")
]
authority.validation.mutationMatrix = [...seedFixture.mutations, ...addedMutations]

const assertion = (kind, targetId) => ({ kind, targetId })
const pointerAssertion = (pointer, expected) => ({ kind: "pointer-equals", pointer, expected })
authority.validation.positiveControls = [
  ...seedFixture.positiveControls.filter((row) => !["POS-HAZARD-FAILURE-PRESERVATION", "POS-PACK-VERSION-RETENTION"].includes(row.controlId)),
  { controlId: "POS-V4-ALL-TRANSITIONS-CONSTRUCTIBLE", purpose: "Every dynamic state target is fixed, preserved from all legal origins, or assigned from a declared trigger field.", expectedResult: "accept", expectedExitCode: 0, assertions: [assertion("semantic-validator", "TRANSITION_CONSTRUCTIBILITY")] },
  { controlId: "POS-V4-CONSTRAINT-WITNESSES", purpose: "All nine constraints resolve and execute over legal/forbidden witnesses plus states/transitions.", expectedResult: "accept", expectedExitCode: 0, assertions: [assertion("semantic-validator", "CONSTRAINT_EXECUTION")] },
  { controlId: "POS-V4-EFFECT-LIFECYCLE", purpose: "Focus and announcement effects are post-render, semantic, and acknowledged exactly once.", expectedResult: "accept", expectedExitCode: 0, assertions: [assertion("semantic-validator", "EFFECT_LIFECYCLE")] },
  { controlId: "POS-V4-HAZARD-ORIGINS", purpose: "Ready and marking zero-confirmation origins have constructible deterministic presentation and dismissal paths.", expectedResult: "accept", expectedExitCode: 0, assertions: [assertion("semantic-validator", "CONFIRMATION_DETERMINISM")] },
  { controlId: "POS-V4-CORRECTION-RETENTION", purpose: "Safe fields and receipt identities survive validation, failure, save, and resume.", expectedResult: "accept", expectedExitCode: 0, assertions: [assertion("semantic-validator", "CORRECTION_PRESERVATION")] },
  { controlId: "POS-V4-PACK-DUAL-GENERATION", purpose: "Update states retain prior and candidate generations until atomic activation.", expectedResult: "accept", expectedExitCode: 0, assertions: [assertion("semantic-validator", "PACK_GENERATION")] },
  { controlId: "POS-V4-SELECTED-DIRECTION", purpose: "NAV-CODEX-1 exact ordered rules and evidence fields derive from ROUTES.", expectedResult: "accept", expectedExitCode: 0, assertions: [assertion("semantic-validator", "SELECTED_DIRECTION")] },
  { controlId: "POS-V4-MILESTONE-CLOSURE", purpose: "M0-M5 and every route milestone assignment derive from ROUTES.", expectedResult: "accept", expectedExitCode: 0, assertions: [assertion("semantic-validator", "MILESTONE_CLOSURE")] },
  { controlId: "POS-V4-QUESTION-SELECTION-ATTEMPT", purpose: "Question failure and retry retain selectedOptionId and the stable draftAttemptId.", expectedResult: "accept", expectedExitCode: 0, assertions: [pointerAssertion(`/edges/${edgeIndex("E-ANSWER-023-COMMIT-FAIL")}/toStateSelector/preserve`, ["selectedOptionId", "draftAttemptId"]), pointerAssertion(`/edges/${edgeIndex("E-ANSWER-024-RETRY")}/toStateSelector/preserve`, ["selectedOptionId", "draftAttemptId"])] },
  { controlId: "POS-V4-HAZARD-FAILURE-IDENTITY", purpose: "Hazard failure and retry retain origin, marker set, attempt ID, and attempt kind.", expectedResult: "accept", expectedExitCode: 0, assertions: [pointerAssertion(`/edges/${edgeIndex("E-HAZARD-032-COMMIT-FAIL")}/toStateSelector/preserve`, ["attemptKind", "previousEditableState", "neutralMarkers", "hazardAttemptId"]), pointerAssertion(`/edges/${edgeIndex("E-HAZARD-033-RETRY")}/toStateSelector/preserve`, ["attemptKind", "previousEditableState", "neutralMarkers", "hazardAttemptId"])] },
  { controlId: "POS-V4-SIMULATION-FAILURE-IDENTITY", purpose: "Simulation submit and reconcile failures retain answer, flag, position, session, and submission IDs.", expectedResult: "accept", expectedExitCode: 0, assertions: [pointerAssertion(`/edges/${edgeIndex("E-SIM-032-SUBMIT-FAIL")}/toStateSelector/preserve`, ["answer", "flag", "position", "sessionId", "submissionId"]), pointerAssertion(`/edges/${edgeIndex("E-SIM-034-RECONCILE-FAIL")}/toStateSelector/preserve`, ["answer", "flag", "position", "sessionId", "submissionId"])] },
  { controlId: "POS-V4-CORRECTION-ALL-RETENTION-FLOWS", purpose: "Correction validate, invalid, failure, save, and resume paths preserve their safe fields and receipt IDs.", expectedResult: "accept", expectedExitCode: 0, assertions: [pointerAssertion(`/edges/${edgeIndex("E-CORR-001-VALIDATE")}/toStateSelector/preserve`, ["safeFields"]), pointerAssertion(`/edges/${edgeIndex("E-CORR-003-INVALID")}/toStateSelector/preserve`, ["safeFields"]), pointerAssertion(`/edges/${edgeIndex("E-CORR-012-SUBMIT-FAIL")}/toStateSelector/preserve`, ["safeFields", "clientReceiptId"]), pointerAssertion(`/edges/${edgeIndex("E-CORR-020-SAVE-DRAFT")}/toStateSelector/preserve`, ["safeFields"]), pointerAssertion(`/edges/${edgeIndex("E-CORR-021-RESUME")}/toStateSelector/preserve`, ["safeFields"])] },
  { controlId: "POS-V4-PACK-ALL-DUAL-GENERATION-PHASES", purpose: "Pack update, download, verify, quarantine, failure, and activation paths carry prior/candidate generations until promotion.", expectedResult: "accept", expectedExitCode: 0, assertions: [pointerAssertion(`/edges/${edgeIndex("E-PACK-031-DOWNLOAD-UPDATE")}/toStateSelector/preserve`, ["priorActiveGeneration", "candidateGeneration"]), pointerAssertion(`/edges/${edgeIndex("E-PACK-010-VERIFIED")}/toStateSelector/preserve`, ["priorActiveGeneration", "candidateGeneration"]), pointerAssertion(`/edges/${edgeIndex("E-PACK-011-VERIFY-QUARANTINE")}/toStateSelector/preserve`, ["priorActiveGeneration", "candidateGeneration"]), pointerAssertion(`/edges/${edgeIndex("E-PACK-012-VERIFY-FAIL")}/toStateSelector/preserve`, ["priorActiveGeneration", "candidateGeneration"]), pointerAssertion(`/edges/${edgeIndex("E-PACK-020-ACTIVATE")}/toStateSelector/preserve`, ["priorActiveGeneration", "candidateGeneration"])] }
]
for (const rule of [
  ["V19-CONSTRAINT-EXECUTION", "Resolve and execute all invalid-combination operands and witnesses."],
  ["V20-TRANSITION-CONSTRUCTIBILITY", "Construct every dynamic target field from fixed, preserved, or declared trigger data."],
  ["V21-EFFECT-LIFECYCLE", "Validate immutable after-render exactly-once presentation effects."],
  ["V22-TRIGGER-SCHEMAS", "Reject wildcard or undeclared trigger payload fields."],
  ["V23-PACK-DUAL-GENERATION", "Retain prior and candidate pack generations through atomic activation."],
  ["V24-SELECTED-DIRECTION", "Derive NAV-CODEX-1 exact ordered rules and evidence metadata."],
  ["V25-MILESTONES", "Derive M0-M5 and exact per-route assignments."],
  ["V26-FILESYSTEM-TRANSACTION", "Reject aliases and write all outputs atomically without following links."],
  ["V27-BUNDLE-EXACT", "Require exact canonical parent manifest semantics and bytes."],
  ["V28-SPAWNED-CLI", "Exercise actual child-process CLI rejection envelopes."]
]) authority.validation.validationRules.push({ validatorId: rule[0], statement: rule[1], sourceClauseIds: ["SS-ACCEPTANCE", "RT-ROUTE-ACCEPTANCE"] })

const deriveCounts = (candidate) => ({
  sourceCount: candidate.sources.length,
  sourceClauseCount: candidate.sourceClauses.length,
  dimensionCount: candidate.dimensions.length,
  invalidCombinationConstraintCount: candidate.constraints.filter((row) => row.kind === "invalid-combination").length,
  globalTransitionRuleCount: candidate.constraints.filter((row) => row.kind === "global-transition-rule").length,
  totalConstraintCount: candidate.constraints.length,
  routeCount: candidate.routes.length,
  registryRouteCount: candidate.routes.filter((row) => row.routeKind === "destination-family-route").length,
  spokeRouteCount: candidate.routes.filter((row) => row.routeKind === "additional-acquisition-spoke").length,
  machineCount: candidate.machines.length,
  machineStateCount: candidate.machineStates.length,
  actionCount: candidate.actions.length,
  eventCount: candidate.events.length,
  outcomeCount: candidate.outcomes.length,
  edgeCount: candidate.edges.length,
  interpretationCount: candidate.interpretations.length,
  validationRuleCount: candidate.validation.validationRules.length,
  mutationCount: candidate.validation.mutationMatrix.length,
  positiveControlCount: candidate.validation.positiveControls.length,
  selectedDirectionRuleCount: candidate.selectedDirection.rules.length,
  milestoneCount: candidate.implementationMilestones.length,
  effectTypeCount: candidate.effectTypes.length,
  presentationEffectCount: candidate.presentationEffects.length,
  effectBindingCount: candidate.effectBindings.length,
  navigationConstructionCount: candidate.navigationConstructions.length,
  journeyLensCountExcluded: new Set(candidate.journeyLens.journeyIds).size,
  implementationRegistryCountExcluded: candidate.implementationDrift.implementationRouteIds.length,
  implementationMissingRouteCountExcluded: candidate.implementationDrift.missingRouteIds.length
})
const rootKeys = ["metadata", "sources", "sourceClauses", "snapshotSchema", "dimensions", "constraints", "selectedDirection", "implementationMilestones", "machines", "routes", "machineStates", "actions", "events", "outcomes", "edges", "navigationConstructions", "effectTypes", "presentationEffects", "effectBindings", "interpretations", "validation", "implementationDrift", "journeyLens"]
const deriveRoots = (candidate) => Object.fromEntries(rootKeys.map((key) => [key + "Sha256", canonicalHash(candidate[key])]))
authority.counts = deriveCounts(authority)
authority.integrityRoots = deriveRoots(authority)

const authorityBytes = canonicalBytes(authority)
fs.writeFileSync(outputPath, authorityBytes)
const authoritySha256 = sha256(authorityBytes)

const statusProjection = Object.fromEntries(authority.machineStates.filter((row) => row.machineId === "terminal-document").map((row) => [row.stateName, row.selector.dimensions]))
const referenceProjection = Object.fromEntries(authority.routes.flatMap((candidate) => {
  const binding = candidate.machineBindings.find((row) => row.machineId === "reference-document")
  return binding ? [[candidate.routeId, binding.legalMachineStateIds]] : []
}))
const overlayEdgeIds = authority.edges.filter((row) => /^E-REF-0(?:4|5)/u.test(row.edgeId)).map((row) => row.edgeId)
const confirmationResolutionProjection = Object.fromEntries(authority.outcomes.filter((row) => row.outcomeType === "confirmation").map((selectedOutcome) => [selectedOutcome.outcomeId, authority.edges.filter((candidate) => candidate.fromSelector.kind === "outcome-resolution" && candidate.fromSelector.outcomeId === selectedOutcome.outcomeId).map((candidate) => ({ eventId: candidate.trigger.id, machineId: candidate.machineId, toStateSelector: candidate.toStateSelector }))]))
const expected = {
  sources: authority.sources.map(({ sourceId, repoRelativePath, gitBlobSha: blob, sha256: sourceSha, byteLength, encoding, newline, byteOrderMark, finalNewline }) => ({ sourceId, repoRelativePath, gitBlobSha: blob, sha256: sourceSha, byteLength, encoding, newline, byteOrderMark, finalNewline })),
  sourceClauseIds: authority.sourceClauses.map((row) => row.clauseId),
  routeIds: authority.routes.map((row) => row.routeId),
  dimensionIds: authority.dimensions.map((row) => row.dimensionId),
  bidirectionalEdgeIds: ["E-SIM-010-RECORD", "E-SIM-011-CLEAR", "E-HAZARD-010-ADD", "E-HAZARD-012-CLEAR"],
  statusDimensionAllowlist: route("status").legalStateSelector.dimensionAllowlist,
  statusProjection,
  referenceProjection,
  referenceOverlayEdgeIds: overlayEdgeIds,
  selectedDirection: authority.selectedDirection,
  implementationMilestones: authority.implementationMilestones,
  routeMilestoneAssignments: Object.fromEntries(authority.routes.map((row) => [row.routeId, row.milestoneAssignment])),
  counts: authority.counts,
  integrityRoots: authority.integrityRoots,
  implementationMissingRouteIds: authority.implementationDrift.missingRouteIds
}
const fixture = {
  fixtureVersion: "plan008-typed-authority-accepted-fixture-v4-executable-boundary",
  fixtureRole: "Immutable accepted-input expectations and executable semantic/mutation cases; never an oracle that can bless co-edited authority.",
  acceptedAuthoritySha256: authoritySha256,
  expected,
  positiveControls: authority.validation.positiveControls,
  mutations: authority.validation.mutationMatrix
}
const fixtureBytes = canonicalBytes(fixture)
fs.writeFileSync(fixturePath, fixtureBytes)
const fixtureSha256 = sha256(fixtureBytes)

const routeCitationCompatibility = Object.fromEntries(authority.routes.map((candidate) => {
  if (candidate.routeKind === "destination-family-route") {
    const ordinal = String(candidate.familySelector.familyNumber).padStart(2, "0")
    return [candidate.routeId, { routeKind: candidate.routeKind, requiredClauseIds: ["SS-ROUTE-" + ordinal, "RT-ROUTE-" + ordinal], familyNumber: candidate.familySelector.familyNumber }]
  }
  const spokeOrdinal = String(authority.routes.filter((row) => row.routeKind === "additional-acquisition-spoke").findIndex((row) => row.routeId === candidate.routeId) + 1).padStart(2, "0")
  return [candidate.routeId, { routeKind: candidate.routeKind, requiredClauseIds: ["SS-STATIC-SPOKES", "RT-SPOKE-" + spokeOrdinal], spokeNumber: Number(spokeOrdinal) }]
}))
const sourceClauseSpecs = authority.sourceClauses.map((row) => ({ clauseId: row.clauseId, sourceId: row.sourceId, lineStart: row.lineRange.startInclusive, lineEnd: row.lineRange.endInclusive, clauseKind: row.clauseKind, routeFamilyNumber: row.routeFamilyNumber, spokeNumber: row.spokeNumber }))
const requiredIds = {
  routes: authority.routes.map((row) => row.routeId), dimensions: authority.dimensions.map((row) => row.dimensionId), constraints: authority.constraints.map((row) => row.constraintId),
  machines: authority.machines.map((row) => row.machineId), machineStates: authority.machineStates.map((row) => row.machineStateId), actions: authority.actions.map((row) => row.actionId),
  events: authority.events.map((row) => row.eventId), outcomes: authority.outcomes.map((row) => row.outcomeId), edges: authority.edges.map((row) => row.edgeId),
  effects: authority.presentationEffects.map((row) => row.effectId), milestones: authority.implementationMilestones.map((row) => row.milestoneId), interpretations: authority.interpretations.map((row) => row.interpretationId),
  validationRules: authority.validation.validationRules.map((row) => row.validatorId), journeyIds: authority.journeyLens.journeyIds
}
const preservationStateIds = authority.machineStates.filter((row) => ["exam-checker", "immediate-feedback", "hazard-item", "simulation", "correction-report", "offline-pack"].includes(row.machineId)).map((row) => row.machineStateId)
const preservationEdgeIds = authority.edges.filter((row) => ["exam-checker", "immediate-feedback", "hazard-item", "simulation", "correction-report", "offline-pack"].includes(row.machineId) && row.toStateSelector).map((row) => row.edgeId)
const oracle = {
  oracleVersion: "plan008-validator-owned-oracle-v4-executable-boundary",
  acceptedAuthoritySha256: authoritySha256,
  acceptedFixtureSha256: fixtureSha256,
  authorityStructuralShapeSha256: canonicalHash(structuralShape(authority)),
  fixtureStructuralShapeSha256: canonicalHash(structuralShape(fixture)),
  sourceClauseSpecs,
  routeCitationCompatibility,
  requiredIds,
  expected,
  preservationProjection: {
    stateSubstates: Object.fromEntries(preservationStateIds.map((id) => [id, state(id).selector.substates])),
    edgeTargets: Object.fromEntries(preservationEdgeIds.map((id) => [id, edge(id).toStateSelector])),
    confirmationResolutionProjection,
    referenceFreshnessStates: Object.fromEntries(["reference-document.ready-superseded", "reference-document.ready-retired", "reference-document.ready-corrected"].map((id) => [id, { routeScope: state(id).routeScope, dimensions: state(id).selector.dimensions }]))
  },
  semanticProjection: {
    snapshotSchema: authority.snapshotSchema,
    selectedDirection: authority.selectedDirection,
    implementationMilestones: authority.implementationMilestones,
    routeMilestoneAssignments: expected.routeMilestoneAssignments,
    effectTypes: authority.effectTypes,
    presentationEffects: authority.presentationEffects,
    effectBindings: authority.effectBindings,
    navigationConstructions: authority.navigationConstructions
  },
  implementationRegistry: {
    repoRelativePath: authority.implementationDrift.inspectedRepoRelativePath,
    gitBlobSha: authority.implementationDrift.inspectedGitBlobSha,
    sha256: authority.implementationDrift.inspectedSha256,
    byteLength: authority.implementationDrift.inspectedByteLength,
    routeIds: authority.implementationDrift.implementationRouteIds
  }
}
const oracleBytes = canonicalBytes(oracle)
fs.writeFileSync(oraclePath, oracleBytes)
const oracleSha256 = sha256(oracleBytes)

const report = [
  "# Plan 008 typed authority projection V4 — awaiting executable suite",
  "",
  "Status: LOCAL BUILD ONLY — AUDIT CANDIDATE. This is not independent acceptance.",
  "",
  `Authority SHA-256: \`${authoritySha256}\`. Fixture SHA-256: \`${fixtureSha256}\`. Oracle SHA-256: \`${oracleSha256}\`.`,
  "",
  `Derived closure: ${authority.counts.routeCount} routes; ${authority.counts.machineStateCount} states; ${authority.counts.edgeCount} edges; ${authority.counts.mutationCount} mutations; ${authority.counts.positiveControlCount} positive controls.`,
  "",
  "V4 adds executable transition construction, invalid-combination witnesses, exact trigger schemas, the post-render effect lifecycle, dual-generation pack state, NAV-CODEX-1 and M0-M5 source derivation, and a transactional filesystem/CLI boundary.",
  "",
  "No human session, deployment, network write, or repository edit was performed.",
  ""
].join("\n")
fs.writeFileSync(reportPath, report, "utf8")

process.stdout.write(JSON.stringify({ authoritySha256, fixtureSha256, oracleSha256, counts: authority.counts }, null, 2) + "\n")
