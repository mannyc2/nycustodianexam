import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import crypto from "node:crypto"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"

// Freeze protocol: the generator emits authority/fixture/oracle without a
// validator identity. These three constants are patched once after generation.
// The validator then owns the accepted oracle and inputs independently of the
// co-editable fixture. No accepted input embeds the validator hash.
const PINNED_AUTHORITY_SHA256 = "6d9357567b3e2f504c3cb1a9dc9e252cdd86339c6b6e0a36bc19ce0d72c05d47"
const PINNED_FIXTURE_SHA256 = "a54a3c4ea5f81a2a291b8d9180baf18260e8cfc6cb141e42065caf80abd8320c"
const PINNED_ORACLE_SHA256 = "10b7bb7ab9685d2532c49a23ec6e278b97f32009d17958427c1f8471ae63d851"
const PINNED_PROOF_SHA256 = "__FREEZE_PROOF_SHA256__"
const PINNED_REPORT_SHA256 = "__FREEZE_REPORT_SHA256__"

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex")
const gitBlobSha = (bytes) => crypto.createHash("sha1").update(Buffer.from("blob " + bytes.length + "\0", "utf8")).update(bytes).digest("hex")
const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value !== null && typeof value === "object") {
    const out = {}
    for (const key of Object.keys(value).sort()) out[key] = canonicalize(value[key])
    return out
  }
  return value
}
const canonicalBytes = (value) => Buffer.from(JSON.stringify(canonicalize(value), null, 2) + "\n", "utf8")
const canonicalHash = (value) => sha256(canonicalBytes(value))
const clone = (value) => structuredClone(value)
const sameJson = (left, right) => JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right))
const unique = (values) => new Set(values).size === values.length
const structuralShape = (value) => {
  if (Array.isArray(value)) return { kind: "array", length: value.length, items: value.map(structuralShape) }
  if (value !== null && typeof value === "object") return { kind: "object", keys: Object.keys(value).sort(), fields: Object.fromEntries(Object.keys(value).sort().map((key) => [key, structuralShape(value[key])])) }
  return { kind: value === null ? "null" : typeof value }
}

class ValidationFailure extends Error {
  constructor(code, message) {
    super(message)
    this.name = "ValidationFailure"
    this.code = code
  }
}
const fail = (code, message) => { throw new ValidationFailure(code, message) }
const requireValue = (condition, code, message) => { if (!condition) fail(code, message) }
const assertExactKeys = (value, keys, code, label) => {
  requireValue(value !== null && typeof value === "object" && !Array.isArray(value), code, label + " is not an object")
  requireValue(sameJson(Object.keys(value).sort(), [...keys].sort()), code, label + " keys differ")
}

const decodePointer = (token) => token.replaceAll("~1", "/").replaceAll("~0", "~")
const pointerTokens = (pointer) => pointer === "" ? [] : pointer.startsWith("/") ? pointer.slice(1).split("/").map(decodePointer) : fail("JSON_POINTER", "invalid JSON pointer")
const getPointer = (root, pointer) => {
  let current = root
  for (const token of pointerTokens(pointer)) {
    if (current === undefined || current === null || !Object.hasOwn(current, token)) throw new Error("missing pointer")
    current = current[token]
  }
  return current
}
const parentPointer = (root, pointer) => {
  const tokens = pointerTokens(pointer)
  if (tokens.length === 0) throw new Error("cannot mutate document root")
  const key = tokens.pop()
  let parent = root
  for (const token of tokens) {
    if (parent === undefined || parent === null || !Object.hasOwn(parent, token)) throw new Error("missing mutation parent")
    parent = parent[token]
  }
  return { parent, key }
}
const applyOperation = (root, operation) => {
  const { parent, key } = parentPointer(root, operation.pointer)
  if (operation.op === "replace") {
    if (!Object.hasOwn(parent, key)) throw new Error("replace target missing")
    parent[key] = clone(operation.value)
  } else if (operation.op === "add") {
    if (Array.isArray(parent) && key === "-") parent.push(clone(operation.value))
    else parent[key] = clone(operation.value)
  } else if (operation.op === "remove") {
    if (Array.isArray(parent)) {
      const index = Number(key)
      if (!Number.isInteger(index) || index < 0 || index >= parent.length) throw new Error("remove target missing")
      parent.splice(index, 1)
    } else {
      if (!Object.hasOwn(parent, key)) throw new Error("remove target missing")
      delete parent[key]
    }
  } else throw new Error("unsupported direct mutation")
}

const modeSchemas = {
  validate: { required: ["authority", "fixture", "oracle"], optional: [] },
  suite: { required: ["authority", "fixture", "oracle", "proof-out", "report-out", "bundle-out"], optional: [] },
  "verify-bundle": { required: ["authority", "fixture", "oracle", "proof", "report", "bundle"], optional: [] }
}
const parseArgs = (argv) => {
  const [mode, ...rest] = argv
  const schema = modeSchemas[mode]
  requireValue(Boolean(schema), "CLI_ARGS", "unknown mode")
  requireValue(rest.length % 2 === 0, "CLI_ARGS", "arguments must be flag/value pairs")
  const options = { mode }
  const seen = new Set()
  for (let index = 0; index < rest.length; index += 2) {
    const token = rest[index]
    const value = rest[index + 1]
    requireValue(/^--[a-z][a-z0-9-]*$/u.test(token ?? "") && value !== undefined, "CLI_ARGS", "invalid argument")
    const key = token.slice(2)
    requireValue(!seen.has(key), "CLI_ARGS", "duplicate argument")
    requireValue([...schema.required, ...schema.optional].includes(key), "CLI_ARGS", "unknown argument")
    seen.add(key)
    options[key] = value
  }
  requireValue(schema.required.every((key) => seen.has(key)), "CLI_ARGS", "missing required argument")
  return options
}

const discoverGitRoot = (start) => {
  let current
  try { current = fs.realpathSync(start) } catch { fail("GIT_ROOT", "working directory cannot be resolved") }
  while (true) {
    const marker = path.join(current, ".git")
    if (fs.existsSync(marker)) {
      const stat = fs.lstatSync(marker)
      requireValue(stat.isDirectory() || stat.isFile(), "GIT_ROOT", "Git marker has invalid type")
      return current
    }
    const parent = path.dirname(current)
    if (parent === current) fail("GIT_ROOT", "no Git root discovered")
    current = parent
  }
}
const isWithin = (root, candidate) => candidate === root || candidate.startsWith(root + path.sep)
const resolveSafeRepoFile = (gitRoot, repoRelativePath) => {
  requireValue(typeof repoRelativePath === "string" && repoRelativePath.length > 0 && !repoRelativePath.includes("\0") && !repoRelativePath.includes("\\"), "SAFE_PATH", "unsafe repository-relative path")
  requireValue(!path.posix.isAbsolute(repoRelativePath) && !path.win32.isAbsolute(repoRelativePath), "SAFE_PATH", "unsafe repository-relative path")
  const parts = repoRelativePath.split("/")
  requireValue(parts.every((part) => part.length > 0 && part !== "." && part !== "..") && path.posix.normalize(repoRelativePath) === repoRelativePath, "SAFE_PATH", "unsafe repository-relative path")
  const realRoot = fs.realpathSync(gitRoot)
  let current = realRoot
  for (const part of parts) {
    current = path.join(current, part)
    let stat
    try { stat = fs.lstatSync(current) } catch { fail("SAFE_PATH", "repository-relative file is unavailable") }
    if (stat.isSymbolicLink()) {
      let resolved
      try { resolved = fs.realpathSync(current) } catch { fail("SAFE_PATH", "repository symlink is unresolved") }
      requireValue(isWithin(realRoot, resolved), "SAFE_PATH", "repository symlink escapes Git root")
      current = resolved
    }
  }
  const resolved = fs.realpathSync(current)
  requireValue(isWithin(realRoot, resolved) && fs.statSync(resolved).isFile(), "SAFE_PATH", "repository path does not resolve to an in-root file")
  return resolved
}

const readCanonicalJson = (filePath, code) => {
  let bytes
  try { bytes = fs.readFileSync(filePath) } catch { fail("INPUT_FILE", "required input file is unavailable") }
  let value
  try { value = JSON.parse(bytes) } catch { fail(code, "JSON is not parseable") }
  requireValue(canonicalBytes(value).compare(bytes) === 0, code, "JSON is not canonical UTF-8 LF")
  return { bytes, value }
}

const describeExistingFile = (role, filePath, { rejectSymlink = true } = {}) => {
  requireValue(typeof filePath === "string" && filePath.length > 0 && !filePath.includes("\0"), "INPUT_FILE", "file argument differs")
  const lexicalPath = path.resolve(filePath)
  let lstat
  try { lstat = fs.lstatSync(lexicalPath) } catch { fail("INPUT_FILE", "required input file is unavailable") }
  if (rejectSymlink) requireValue(!lstat.isSymbolicLink(), "INPUT_SYMLINK", "input symlink is forbidden")
  requireValue(lstat.isFile(), "INPUT_FILE", "required input is not a regular file")
  let realPath
  try { realPath = fs.realpathSync(lexicalPath) } catch { fail("INPUT_FILE", "required input file cannot be resolved") }
  const stat = fs.statSync(realPath)
  requireValue(stat.isFile(), "INPUT_FILE", "required input is not a regular file")
  return { role, kind: "input", lexicalPath, canonicalPath: realPath, device: String(stat.dev), inode: String(stat.ino) }
}
const describeOutputFile = (role, filePath) => {
  requireValue(typeof filePath === "string" && filePath.length > 0 && !filePath.includes("\0"), "OUTPUT_FILE", "output file argument differs")
  const lexicalPath = path.resolve(filePath)
  let parent
  try { parent = fs.realpathSync(path.dirname(lexicalPath)) } catch { fail("OUTPUT_FILE", "output parent is unavailable") }
  const canonicalPath = path.join(parent, path.basename(lexicalPath))
  let identity = null
  if (fs.existsSync(lexicalPath)) {
    const lstat = fs.lstatSync(lexicalPath)
    requireValue(!lstat.isSymbolicLink(), "OUTPUT_SYMLINK", "output symlink is forbidden")
    requireValue(lstat.isFile(), "OUTPUT_FILE", "output target is not a regular file")
    const stat = fs.statSync(lexicalPath)
    identity = { device: String(stat.dev), inode: String(stat.ino) }
  }
  return { role, kind: "output", lexicalPath, canonicalPath, device: identity?.device ?? null, inode: identity?.inode ?? null }
}
const assertDistinctPaths = (descriptors) => {
  for (let leftIndex = 0; leftIndex < descriptors.length; leftIndex += 1) for (let rightIndex = leftIndex + 1; rightIndex < descriptors.length; rightIndex += 1) {
    const left = descriptors[leftIndex]
    const right = descriptors[rightIndex]
    const lexicalAlias = left.lexicalPath === right.lexicalPath
    const canonicalAlias = left.canonicalPath === right.canonicalPath
    const inodeAlias = left.device !== null && right.device !== null && left.device === right.device && left.inode === right.inode
    requireValue(!lexicalAlias && !canonicalAlias && !inodeAlias, "PATH_ALIAS", "artifact, validator, source, and output paths must be distinct")
  }
}
const assertOutputSnapshotUnchanged = (descriptor) => {
  const exists = fs.existsSync(descriptor.lexicalPath)
  if (descriptor.device === null) {
    requireValue(!exists, "OUTPUT_RACE", "output target changed after preflight")
    return
  }
  requireValue(exists, "OUTPUT_RACE", "output target changed after preflight")
  const lstat = fs.lstatSync(descriptor.lexicalPath)
  requireValue(lstat.isFile() && !lstat.isSymbolicLink(), "OUTPUT_RACE", "output target changed after preflight")
  const stat = fs.statSync(descriptor.lexicalPath)
  requireValue(String(stat.dev) === descriptor.device && String(stat.ino) === descriptor.inode, "OUTPUT_RACE", "output identity changed after preflight")
}
const atomicWriteAll = (entries) => {
  const staged = []
  const backups = []
  const committed = []
  try {
    for (let index = 0; index < entries.length; index += 1) {
      const entry = entries[index]
      const target = entry.descriptor.lexicalPath
      const parent = fs.realpathSync(path.dirname(target))
      const temp = path.join(parent, ".plan008-stage-" + process.pid + "-" + index + "-" + sha256(entry.bytes).slice(0, 16))
      let fd
      try {
        fd = fs.openSync(temp, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY | (fs.constants.O_NOFOLLOW ?? 0), 0o600)
        fs.writeFileSync(fd, entry.bytes)
        fs.fsyncSync(fd)
      } finally {
        if (fd !== undefined) fs.closeSync(fd)
      }
      staged.push({ ...entry, target, temp })
    }
    for (const entry of staged) assertOutputSnapshotUnchanged(entry.descriptor)
    for (let index = 0; index < staged.length; index += 1) {
      const entry = staged[index]
      if (entry.descriptor.device !== null) {
        const backup = entry.target + ".plan008-backup-" + process.pid + "-" + index
        requireValue(!fs.existsSync(backup), "OUTPUT_WRITE", "atomic backup path is unavailable")
        fs.renameSync(entry.target, backup)
        backups.push({ target: entry.target, backup })
      }
    }
    for (const entry of staged) {
      fs.renameSync(entry.temp, entry.target)
      committed.push(entry.target)
    }
    const reopened = {}
    for (const entry of staged) {
      const lstat = fs.lstatSync(entry.target)
      requireValue(lstat.isFile() && !lstat.isSymbolicLink(), "OUTPUT_WRITE", "atomic output reopened with invalid type")
      const bytes = fs.readFileSync(entry.target)
      requireValue(bytes.compare(entry.bytes) === 0, "OUTPUT_WRITE", "atomic output reopen hash differs")
      reopened[entry.role] = sha256(bytes)
    }
    for (const parent of new Set(staged.map((entry) => path.dirname(entry.target)))) {
      let directoryFd
      try {
        directoryFd = fs.openSync(parent, fs.constants.O_RDONLY)
        fs.fsyncSync(directoryFd)
      } finally {
        if (directoryFd !== undefined) fs.closeSync(directoryFd)
      }
    }
    for (const entry of backups) {
      try { fs.unlinkSync(entry.backup) } catch {}
    }
    return reopened
  } catch (error) {
    for (const target of committed.reverse()) {
      try { if (fs.existsSync(target)) fs.unlinkSync(target) } catch {}
    }
    for (const entry of backups.reverse()) {
      try { if (fs.existsSync(entry.backup)) fs.renameSync(entry.backup, entry.target) } catch {}
    }
    for (const entry of staged) {
      try { if (fs.existsSync(entry.temp)) fs.unlinkSync(entry.temp) } catch {}
    }
    if (error instanceof ValidationFailure) throw error
    fail("OUTPUT_WRITE", "atomic output transaction failed")
  }
}

const deriveCounts = (authority) => ({
  sourceCount: authority.sources.length,
  sourceClauseCount: authority.sourceClauses.length,
  dimensionCount: authority.dimensions.length,
  invalidCombinationConstraintCount: authority.constraints.filter((row) => row.kind === "invalid-combination").length,
  globalTransitionRuleCount: authority.constraints.filter((row) => row.kind === "global-transition-rule").length,
  totalConstraintCount: authority.constraints.length,
  routeCount: authority.routes.length,
  registryRouteCount: authority.routes.filter((row) => row.routeKind === "destination-family-route").length,
  spokeRouteCount: authority.routes.filter((row) => row.routeKind === "additional-acquisition-spoke").length,
  machineCount: authority.machines.length,
  machineStateCount: authority.machineStates.length,
  actionCount: authority.actions.length,
  eventCount: authority.events.length,
  outcomeCount: authority.outcomes.length,
  edgeCount: authority.edges.length,
  interpretationCount: authority.interpretations.length,
  validationRuleCount: authority.validation.validationRules.length,
  mutationCount: authority.validation.mutationMatrix.length,
  positiveControlCount: authority.validation.positiveControls.length,
  selectedDirectionRuleCount: authority.selectedDirection.rules.length,
  milestoneCount: authority.implementationMilestones.length,
  effectTypeCount: authority.effectTypes.length,
  presentationEffectCount: authority.presentationEffects.length,
  effectBindingCount: authority.effectBindings.length,
  navigationConstructionCount: authority.navigationConstructions.length,
  journeyLensCountExcluded: new Set(authority.journeyLens.journeyIds).size,
  implementationRegistryCountExcluded: authority.implementationDrift.implementationRouteIds.length,
  implementationMissingRouteCountExcluded: authority.implementationDrift.missingRouteIds.length
})
const rootKeys = ["metadata", "sources", "sourceClauses", "snapshotSchema", "dimensions", "constraints", "selectedDirection", "implementationMilestones", "machines", "routes", "machineStates", "actions", "events", "outcomes", "edges", "navigationConstructions", "effectTypes", "presentationEffects", "effectBindings", "interpretations", "validation", "implementationDrift", "journeyLens"]
const deriveRoots = (authority) => Object.fromEntries(rootKeys.map((key) => [key + "Sha256", canonicalHash(authority[key])]))

const validatePins = (authorityBytes, fixtureBytes, oracleBytes, { authority = true, fixture = true } = {}) => {
  if (authority && !PINNED_AUTHORITY_SHA256.startsWith("__")) requireValue(sha256(authorityBytes) === PINNED_AUTHORITY_SHA256, "PINNED_AUTHORITY", "authority bytes differ from validator-owned pin")
  if (fixture && !PINNED_FIXTURE_SHA256.startsWith("__")) requireValue(sha256(fixtureBytes) === PINNED_FIXTURE_SHA256, "PINNED_FIXTURE", "fixture bytes differ from validator-owned pin")
  if (!PINNED_ORACLE_SHA256.startsWith("__")) requireValue(sha256(oracleBytes) === PINNED_ORACLE_SHA256, "PINNED_ORACLE", "oracle bytes differ from validator-owned pin")
}

const validateMetadata = (authority) => {
  assertExactKeys(authority.metadata, ["reviewMode", "humanEvidence", "humanParticipantCount", "notHumanUsabilityTested", "sourcePolicy", "countPolicy"], "METADATA_KEYS", "metadata")
  requireValue(authority.metadata.reviewMode === "codex-only" && authority.metadata.humanEvidence === "none" && authority.metadata.humanParticipantCount === 0 && authority.metadata.notHumanUsabilityTested === true, "CODEX_METADATA", "CODEX-only metadata differs")
}

const deriveSourceRuntime = (authority, oracle, gitRoot) => {
  const expectedSources = oracle.expected.sources
  requireValue(sameJson(authority.sources.map((row) => row.sourceId), expectedSources.map((row) => row.sourceId)), "SOURCE_SET", "source identities/order differ")
  const runtime = new Map()
  for (const expected of expectedSources) {
    const candidate = authority.sources.find((row) => row.sourceId === expected.sourceId)
    const resolvedPath = resolveSafeRepoFile(gitRoot, candidate.repoRelativePath)
    requireValue(candidate.repoRelativePath === expected.repoRelativePath, "SOURCE_PATH", "source relative path differs")
    const bytes = fs.readFileSync(resolvedPath)
    requireValue(!bytes.includes(13) && bytes.at(-1) === 10, "SOURCE_LF", "source bytes are not UTF-8 LF with final LF")
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
    requireValue(Buffer.from(text, "utf8").compare(bytes) === 0, "SOURCE_ENCODING", "source is not canonical UTF-8")
    const lineStarts = [0]
    for (let index = 0; index < bytes.length; index += 1) if (bytes[index] === 10) lineStarts.push(index + 1)
    const actual = {
      gitBlobSha: gitBlobSha(bytes), sha256: sha256(bytes), byteLength: bytes.length,
      lineCount: lineStarts.length - 1, encoding: "UTF-8", byteOrderMark: false,
      newline: "LF", finalNewline: true
    }
    requireValue(candidate.gitBlobSha === expected.gitBlobSha, "SOURCE_BLOB", "source Git blob differs")
    requireValue(candidate.sha256 === expected.sha256 && candidate.byteLength === expected.byteLength, "SOURCE_SHA256", "source hash/length differs")
    requireValue(candidate.encoding === "UTF-8" && candidate.newline === "LF" && candidate.byteOrderMark === false && candidate.finalNewline === true, "SOURCE_LF", "source encoding declaration differs")
    requireValue(candidate.gitBlobSha === actual.gitBlobSha && candidate.sha256 === actual.sha256 && candidate.byteLength === actual.byteLength && candidate.lineCount === actual.lineCount, "SOURCE_BYTES", "source bytes differ from binding")
    runtime.set(candidate.sourceId, { bytes, lineStarts, lineCount: actual.lineCount })
  }
  return runtime
}

const validateClauses = (authority, oracle, sourceRuntime) => {
  const specs = oracle.sourceClauseSpecs
  requireValue(sameJson(authority.sourceClauses.map((row) => row.clauseId), specs.map((row) => row.clauseId)), "SOURCE_CLAUSE_SET", "source clause set/order differs")
  for (let index = 0; index < specs.length; index += 1) {
    const spec = specs[index]
    const candidate = authority.sourceClauses[index]
    const runtime = sourceRuntime.get(spec.sourceId)
    requireValue(runtime && spec.lineStart >= 1 && spec.lineEnd >= spec.lineStart && spec.lineEnd <= runtime.lineCount, "CLAUSE_DERIVATION", "validator-owned clause range is invalid")
    const byteStart = runtime.lineStarts[spec.lineStart - 1]
    const byteEndExclusive = runtime.lineStarts[spec.lineEnd]
    const slice = runtime.bytes.subarray(byteStart, byteEndExclusive)
    const derived = {
      clauseId: spec.clauseId,
      sourceId: spec.sourceId,
      clauseKind: spec.clauseKind,
      routeFamilyNumber: spec.routeFamilyNumber,
      spokeNumber: spec.spokeNumber,
      lineRange: { startInclusive: spec.lineStart, endInclusive: spec.lineEnd },
      byteRange: { startInclusive: byteStart, endExclusive: byteEndExclusive },
      byteLength: slice.length,
      sliceSha256: sha256(slice),
      textUtf8Lf: slice.toString("utf8")
    }
    requireValue(sameJson(candidate, derived), "CLAUSE_DERIVATION", "source-derived clause differs " + spec.clauseId)
  }
  const clauseIds = new Set(authority.sourceClauses.map((row) => row.clauseId))
  for (let ordinal = 1; ordinal <= 9; ordinal += 1) requireValue(clauseIds.has("SS-GLOBAL-" + String(ordinal).padStart(2, "0")), "SOURCE_CLAUSE_SET", "global clause family incomplete")
  for (let ordinal = 1; ordinal <= 10; ordinal += 1) requireValue(clauseIds.has("RT-INVARIANT-" + String(ordinal).padStart(2, "0")), "SOURCE_CLAUSE_SET", "ROUTES invariant family incomplete")
  requireValue(clauseIds.has("RT-SELECTED-RULES") && clauseIds.has("RT-MILESTONES"), "SOURCE_CLAUSE_SET", "ROUTES selected program or milestone clause is missing")
  return clauseIds
}

const assertExactIdFamily = (rows, key, expected, code) => {
  const actual = rows.map((row) => row[key])
  requireValue(unique(actual) && sameJson(actual, expected), code, key + " family differs")
}
const validateRequiredFamilies = (authority, oracle) => {
  const required = oracle.requiredIds
  assertExactIdFamily(authority.routes, "routeId", required.routes, "ROUTE_SET")
  assertExactIdFamily(authority.dimensions, "dimensionId", required.dimensions, "DIMENSION_SET")
  assertExactIdFamily(authority.constraints, "constraintId", required.constraints, "CONSTRAINT_ID_SET")
  assertExactIdFamily(authority.machines, "machineId", required.machines, "MACHINE_ID_SET")
  assertExactIdFamily(authority.machineStates, "machineStateId", required.machineStates, "STATE_ID_SET")
  assertExactIdFamily(authority.actions, "actionId", required.actions, "ACTION_ID_SET")
  assertExactIdFamily(authority.events, "eventId", required.events, "EVENT_ID_SET")
  assertExactIdFamily(authority.outcomes, "outcomeId", required.outcomes, "OUTCOME_ID_SET")
  assertExactIdFamily(authority.edges, "edgeId", required.edges, "EDGE_ID_SET")
  assertExactIdFamily(authority.presentationEffects, "effectId", required.effects, "EFFECT_ID_SET")
  assertExactIdFamily(authority.implementationMilestones, "milestoneId", required.milestones, "MILESTONE_ID_SET")
  assertExactIdFamily(authority.interpretations, "interpretationId", required.interpretations, "INTERPRETATION_ID_SET")
  assertExactIdFamily(authority.validation.validationRules, "validatorId", required.validationRules, "VALIDATOR_RULE_ID_SET")
  requireValue(authority.routes.filter((row) => row.routeKind === "destination-family-route").length === 32 && authority.routes.filter((row) => row.routeKind === "additional-acquisition-spoke").length === 4, "ROUTE_PARTITION", "route partition differs")
  requireValue(authority.dimensions.find((row) => row.dimensionId === "interaction")?.ownership === "machine-owned", "DIMENSION_INTERACTION", "interaction is not machine-owned")
  requireValue(authority.constraints.filter((row) => row.kind === "invalid-combination").length === 9 && authority.constraints.filter((row) => row.kind === "global-transition-rule").length === 9, "CONSTRAINT_SET", "constraint partition differs")
}

const walkObjects = (value, visitor, pointer = "") => {
  if (Array.isArray(value)) value.forEach((entry, index) => walkObjects(entry, visitor, pointer + "/" + index))
  else if (value !== null && typeof value === "object") {
    visitor(value, pointer)
    for (const [key, entry] of Object.entries(value)) walkObjects(entry, visitor, pointer + "/" + key.replaceAll("~", "~0").replaceAll("/", "~1"))
  }
}
const validateClosedTriggerPayload = (payload, id, code) => {
  assertExactKeys(payload, ["kind", "tagField", "tagValue", "additionalProperties", "fields"], code, "trigger payload")
  requireValue(payload.kind === "closed-tagged-object" && payload.tagField === "tag" && payload.tagValue === id && payload.additionalProperties === false, code, "trigger payload tag differs")
  requireValue(Array.isArray(payload.fields) && payload.fields.length > 0 && unique(payload.fields.map((row) => row.fieldId)), code, "trigger payload field set differs")
  for (const field of payload.fields) {
    const allowed = field.valueType === "literal" ? ["fieldId", "valueType", "required", "literal"] : field.valueType === "enum" ? ["fieldId", "valueType", "required", "legalValues"] : ["fieldId", "valueType", "required"]
    assertExactKeys(field, allowed, code, "trigger payload field")
    requireValue(typeof field.fieldId === "string" && field.fieldId.length > 0 && typeof field.valueType === "string" && field.required === true, code, "trigger payload field differs")
    if (field.valueType === "literal") requireValue(typeof field.literal === "string" && field.literal.length > 0 && (field.fieldId !== "tag" || field.literal === id), code, "trigger literal differs")
    if (field.valueType === "enum") requireValue(Array.isArray(field.legalValues) && field.legalValues.length > 0 && unique(field.legalValues), code, "trigger enum differs")
  }
  requireValue(payload.fields[0].fieldId === "tag" && payload.fields[0].literal === id, code, "trigger tag field must be first")
}
const validateTagsAndTransitionChannels = (authority) => {
  walkObjects(authority, (object, pointer) => {
    if (Object.hasOwn(object, "continuationStateId") && !pointer.startsWith("/outcomes/")) fail("TRANSITION_CHANNEL", "unknown continuation channel")
  })
  for (const action of authority.actions) validateClosedTriggerPayload(action.payload, action.actionId, "ACTION_PAYLOAD_TAG")
  for (const event of authority.events) {
    if (event.payload?.kind === "outcome-resolution") {
      assertExactKeys(event.payload, ["kind", "outcomeId", "resolution"], "EVENT_PAYLOAD_TAG", "outcome-resolution payload")
      requireValue(["presented", "accepted", "dismissed"].includes(event.payload.resolution), "EVENT_PAYLOAD_TAG", "outcome resolution differs")
    } else validateClosedTriggerPayload(event.payload, event.eventId, "EVENT_PAYLOAD_TAG")
  }
  walkObjects(authority, (object, pointer) => {
    if (Object.hasOwn(object, "continuationStateId") && !pointer.startsWith("/outcomes/")) fail("TRANSITION_CHANNEL", "unknown continuation channel")
  })
  for (const edge of authority.edges) {
    const allowed = new Set(["edgeId", "machineId", "fromSelector", "trigger", "guards", "toStateSelector", "outcomeId", "sourceClauseIds"])
    requireValue(Object.keys(edge).every((key) => allowed.has(key)), "TRANSITION_CHANNEL", "edge has an unknown endpoint channel")
    requireValue(Object.hasOwn(edge, "toStateSelector") !== Object.hasOwn(edge, "outcomeId"), "EDGE_TARGET_XOR", "edge target xor differs")
    requireValue(["initial", "machine-state", "route-state-projection", "outcome-resolution"].includes(edge.fromSelector.kind), "FROM_SELECTOR_TAG", "unknown from-selector tag")
    requireValue(["action", "event"].includes(edge.trigger.kind), "TRIGGER_TAG", "unknown trigger tag")
  }
  for (const state of authority.machineStates) for (const selector of Object.values(state.selector.dimensions)) requireValue(["equals", "oneOf", "anyLegalValue"].includes(selector.operator), "DIMENSION_SELECTOR_TAG", "unknown dimension selector operator")
}

const selectorRouteIds = (selector) => {
  if (selector.kind === "exact-route") return [selector.routeId]
  if (selector.kind === "allowed-route-set") return selector.routeIds
  if (selector.kind === "route-map") return [...Object.keys(selector.bySourceRouteId), ...Object.values(selector.bySourceRouteId)]
  if (selector.kind === "same-route-next-position" || selector.kind === "same-route-position") return selector.allowedSourceRouteIds
  return []
}
const validateOutcomes = (authority, oracle) => {
  const routeIds = new Set(oracle.requiredIds.routes)
  const stateById = new Map(authority.machineStates.map((row) => [row.machineStateId, row]))
  const eventById = new Map(authority.events.map((row) => [row.eventId, row]))
  const allowedSelectorKeys = {
    "exact-route": ["kind", "routeId", "destinationStateId"],
    "allowed-route-set": ["kind", "routeIds", "selectionKey"],
    "route-map": ["kind", "discriminator", "bySourceRouteId"],
    "same-route-next-position": ["kind", "allowedSourceRouteIds", "destinationStateId"],
    "same-route-position": ["kind", "allowedSourceRouteIds", "destinationStateId"]
  }
  const resolutionEdges = new Map()
  for (const edge of authority.edges.filter((row) => row.fromSelector.kind === "outcome-resolution")) {
    const list = resolutionEdges.get(edge.fromSelector.outcomeId) ?? []
    list.push(edge)
    resolutionEdges.set(edge.fromSelector.outcomeId, list)
  }
  for (const outcome of authority.outcomes) {
    requireValue(outcome.payload?.tag === outcome.outcomeType, "OUTCOME_TAG", "outcome discriminant differs")
    if (outcome.outcomeType === "confirmation") {
      if (Object.hasOwn(outcome.payload, "continuationStateId") || Object.hasOwn(outcome.payload, "destinationStateId")) fail("OUTCOME_TRANSITION_SMUGGLING", "confirmation payload contains a state continuation")
      const allowedKeys = new Set(["tag", "confirmationId", "allowedResolutionEventIds", "revealAllowed", "exactScopeRequired", "impactReceiptRequired"])
      requireValue(Object.keys(outcome.payload).every((key) => allowedKeys.has(key)), "OUTCOME_TRANSITION_SMUGGLING", "confirmation payload has an unknown transition field")
      requireValue(Array.isArray(outcome.payload.allowedResolutionEventIds) && outcome.payload.allowedResolutionEventIds.length === 2 && unique(outcome.payload.allowedResolutionEventIds), "OUTCOME_SCHEMA", "confirmation resolution list differs")
      const edges = resolutionEdges.get(outcome.outcomeId) ?? []
      requireValue(sameJson(edges.map((edge) => edge.trigger.id).sort(), [...outcome.payload.allowedResolutionEventIds].sort()), "OUTCOME_RESOLUTION", "confirmation resolution edges differ")
      for (const eventId of outcome.payload.allowedResolutionEventIds) {
        const event = eventById.get(eventId)
        requireValue(event?.payload?.kind === "outcome-resolution" && event.payload.outcomeId === outcome.outcomeId && ["presented", "accepted", "dismissed"].includes(event.payload.resolution), "OUTCOME_RESOLUTION", "confirmation resolution event differs")
      }
    } else if (outcome.outcomeType === "navigation" || outcome.outcomeType === "exit") {
      const selector = outcome.payload.selector
      requireValue(selector && typeof selector === "object" && Object.hasOwn(allowedSelectorKeys, selector.kind), "NAV_SELECTOR", "navigation selector tag differs")
      requireValue(Object.keys(selector).every((key) => allowedSelectorKeys[selector.kind].includes(key)), "NAV_SELECTOR", "navigation selector keys differ")
      const selectedRoutes = selectorRouteIds(selector)
      requireValue(selectedRoutes.length > 0 && selectedRoutes.every((routeId) => routeIds.has(routeId)), "NAV_ROUTE", "navigation route domain differs")
      if (selector.kind !== "route-map") requireValue(unique(selectedRoutes), "NAV_SELECTOR", "navigation selector has duplicate routes")
      if (selector.destinationStateId) {
        const state = stateById.get(selector.destinationStateId)
        requireValue(state, "NAV_STATE", "navigation destination state is missing")
        const destinationRoutes = selector.kind === "exact-route" ? [selector.routeId] : selector.allowedSourceRouteIds
        requireValue(destinationRoutes.every((routeId) => state.routeScope.includes(routeId)), "NAV_STATE", "navigation destination state is route-illegal")
      }
    } else requireValue(["operation-request", "file-output"].includes(outcome.outcomeType), "OUTCOME_TAG", "unknown outcome type")
    walkObjects(outcome.payload, (object) => {
      if (Object.hasOwn(object, "continuationStateId")) fail("OUTCOME_TRANSITION_SMUGGLING", "outcome payload contains continuationStateId")
    })
  }
  const actualResolutionProjection = Object.fromEntries(authority.outcomes.filter((row) => row.outcomeType === "confirmation").map((outcome) => [outcome.outcomeId, (resolutionEdges.get(outcome.outcomeId) ?? []).map((edge) => ({ eventId: edge.trigger.id, machineId: edge.machineId, toStateSelector: edge.toStateSelector }))]))
  requireValue(sameJson(actualResolutionProjection, oracle.preservationProjection.confirmationResolutionProjection), "CONFIRMATION_DETERMINISM", "confirmation resolution targets differ")
}

const validateRouteCitationCompatibility = (authority, oracle) => {
  const allRouteRowPattern = /^(?:SS|RT)-ROUTE-\d{2}$/u
  for (const route of authority.routes) {
    const expected = oracle.routeCitationCompatibility[route.routeId]
    requireValue(expected && route.routeKind === expected.routeKind, "ROUTE_CITATION_COMPATIBILITY", "route family selector differs")
    requireValue(expected.requiredClauseIds.every((id) => route.sourceClauseIds.includes(id)), "ROUTE_CITATION_COMPATIBILITY", "route required citations differ")
    requireValue(route.sourceClauseIds.filter((id) => allRouteRowPattern.test(id)).every((id) => expected.requiredClauseIds.includes(id)), "ROUTE_CITATION_COMPATIBILITY", "route cites another family row")
    if (route.routeKind === "destination-family-route") requireValue(route.familySelector.familyNumber === expected.familyNumber && route.familySelector.routeId === route.routeId, "ROUTE_CITATION_COMPATIBILITY", "route family number differs")
    else requireValue(route.familySelector.spokeRouteId === route.routeId, "ROUTE_CITATION_COMPATIBILITY", "spoke selector differs")
    for (const binding of route.machineBindings) {
      requireValue(expected.requiredClauseIds.every((id) => binding.sourceClauseIds.includes(id)), "ROUTE_CITATION_COMPATIBILITY", "binding required citations differ")
      requireValue(binding.sourceClauseIds.filter((id) => allRouteRowPattern.test(id)).every((id) => expected.requiredClauseIds.includes(id)), "ROUTE_CITATION_COMPATIBILITY", "binding cites another family row")
    }
  }
}

const validateSyntaxSemantics = (authority, oracle) => {
  for (const state of authority.machineStates) requireValue(!/[()]/u.test(state.stateName) && !/[()]/u.test(state.machineStateId), "PARENTHETICAL_PSEUDO_STATE", "parenthetical pseudo-state")
  let literalPipe = false
  walkObjects(authority.machineStates, (object, pointer) => {
    if (pointer.includes("legalValues")) for (const value of Object.values(object)) if (typeof value === "string" && value.includes("|")) literalPipe = true
  })
  const scanPipe = (value, parentKey = "") => {
    if (Array.isArray(value)) for (const entry of value) scanPipe(entry, parentKey)
    else if (value && typeof value === "object") for (const [key, entry] of Object.entries(value)) scanPipe(entry, key)
    else if (parentKey === "legalValues" && typeof value === "string" && value.includes("|")) literalPipe = true
  }
  scanPipe(authority.machineStates)
  requireValue(!literalPipe, "LITERAL_PIPE", "literal pipe preserved as a legal value")
  const selectedError = authority.machineStates.find((row) => row.machineStateId === "immediate-feedback.selected-recoverable-error")
  requireValue(selectedError.selector.dimensions.interaction.value === "selected" && selectedError.selector.dimensions.operation.value === "recoverable-error", "PLUS_PRODUCT", "plus notation is not an orthogonal product")
  const edgeIds = new Set(authority.edges.map((row) => row.edgeId))
  for (const edgeId of oracle.expected.bidirectionalEdgeIds) requireValue(edgeIds.has(edgeId), "BIDIRECTIONAL_CLOSURE", "bidirectional edge is missing")
  const answer = authority.machineStates.find((row) => row.machineStateId === "simulation.active").selector.substates.find((row) => row.substateId === "answer")
  requireValue(sameJson(answer.legalValues, ["unanswered", "recorded"]), "ACTIVE_ANSWER_SUBSTATE", "active answer substate differs")
}

const validateStatusAndReference = (authority, oracle) => {
  const status = authority.routes.find((row) => row.routeId === "status")
  requireValue(sameJson(status.legalStateSelector.dimensionAllowlist, oracle.expected.statusDimensionAllowlist), "STATUS_TERMINAL", "status dimension allowlist differs")
  const terminalProjection = Object.fromEntries(authority.machineStates.filter((row) => row.machineId === "terminal-document").map((row) => [row.stateName, row.selector.dimensions]))
  requireValue(sameJson(terminalProjection, oracle.expected.statusProjection), "STATUS_TERMINAL", "terminal state projection differs")
  const projection = {}
  for (const route of authority.routes) {
    const binding = route.machineBindings.find((row) => row.machineId === "reference-document")
    if (binding) projection[route.routeId] = binding.legalMachineStateIds
  }
  requireValue(sameJson(projection, oracle.expected.referenceProjection), "REFERENCE_PROJECTION", "reference projection differs")
  requireValue(!projection.home.includes("reference-document.recoverable-error") && !projection.faq.includes("reference-document.recoverable-error"), "REFERENCE_STATIC_ERROR", "Home/FAQ gained recoverable error")
  const actualFreshness = Object.fromEntries(Object.keys(oracle.preservationProjection.referenceFreshnessStates).map((stateId) => {
    const state = authority.machineStates.find((row) => row.machineStateId === stateId)
    return [stateId, state ? { routeScope: state.routeScope, dimensions: state.selector.dimensions } : null]
  }))
  requireValue(sameJson(actualFreshness, oracle.preservationProjection.referenceFreshnessStates), "REFERENCE_FRESHNESS", "reference historical freshness projection differs")
  for (const edgeId of ["E-REF-024-SUPERSEDED", "E-REF-025-RETIRED", "E-REF-026-CORRECTED", "E-REF-027-CLASSIFIED-CURRENT", ...oracle.expected.referenceOverlayEdgeIds]) requireValue(authority.edges.some((row) => row.edgeId === edgeId), "REFERENCE_CONSTRUCTIBILITY", "reference state is not constructible")
}

const validatePreservation = (authority, oracle) => {
  const stateById = new Map(authority.machineStates.map((row) => [row.machineStateId, row]))
  const edgeById = new Map(authority.edges.map((row) => [row.edgeId, row]))
  const expectedStates = oracle.preservationProjection.stateSubstates
  for (const stateId of Object.keys(expectedStates).filter((id) => id.startsWith("immediate-feedback."))) requireValue(sameJson(stateById.get(stateId)?.selector.substates, expectedStates[stateId]), "QUESTION_PRESERVATION", "question draft fields differ")
  for (const stateId of Object.keys(expectedStates).filter((id) => id.startsWith("hazard-item."))) requireValue(sameJson(stateById.get(stateId)?.selector.substates, expectedStates[stateId]), "HAZARD_PRESERVATION", "hazard preservation fields differ")
  for (const stateId of Object.keys(expectedStates).filter((id) => id.startsWith("simulation."))) requireValue(sameJson(stateById.get(stateId)?.selector.substates, expectedStates[stateId]), "SIMULATION_PRESERVATION", "simulation preservation fields differ")
  for (const [edgeId, expectedTarget] of Object.entries(oracle.preservationProjection.edgeTargets)) {
    if (!/^(E-ANSWER|E-HAZARD|E-SIM)/u.test(edgeId)) continue
    const code = edgeId.startsWith("E-ANSWER") ? "QUESTION_PRESERVATION" : edgeId.startsWith("E-HAZARD") ? "HAZARD_PRESERVATION" : "SIMULATION_PRESERVATION"
    requireValue(sameJson(edgeById.get(edgeId)?.toStateSelector, expectedTarget), code, "failure/retry preservation target differs")
  }
}

const validateDataInvariant = (authority) => {
  const expected = { when: { substateId: "operationKind", equals: "projection-rebuild" }, assert: { historicalCorrectnessRewriteForbidden: true }, scope: "all data-operation states" }
  const states = authority.machineStates.filter((row) => row.machineId === "data-operation")
  requireValue(states.length > 0 && states.every((state) => state.selector.substates.some((substate) => substate.substateId === "operationKind" && substate.legalValues.includes("projection-rebuild")) && sameJson(state.context.historicalCorrectnessInvariant, expected)), "DATA_HISTORICAL_INVARIANT", "projection-rebuild invariant differs")
}

const resolveDotPath = (value, dotPath) => {
  let current = value
  for (const token of dotPath.split(".")) {
    if (current === null || current === undefined || !Object.hasOwn(current, token)) return { present: false, value: undefined }
    current = current[token]
  }
  return { present: true, value: current }
}
const dimensionLegalValues = (authority, dimensionId) => {
  const dimension = authority.dimensions.find((row) => row.dimensionId === dimensionId)
  if (Array.isArray(dimension?.legalValues)) return dimension.legalValues
  if (dimensionId === "interaction") {
    const values = []
    for (const state of authority.machineStates) {
      const selector = state.selector.dimensions.interaction
      if (selector?.operator === "equals") values.push(selector.value)
      if (selector?.operator === "oneOf") values.push(...selector.values)
    }
    return [...new Set(values)]
  }
  return []
}
const operandValues = (snapshot, operandPath, authority) => {
  const resolved = resolveDotPath(snapshot, operandPath)
  if (!resolved.present) return [{ kind: "not-applicable" }]
  if (operandPath.startsWith("selector.dimensions.")) {
    const selector = resolved.value
    const dimensionId = operandPath.split(".").at(-1)
    if (selector?.operator === "equals") return [selector.value]
    if (selector?.operator === "oneOf") return selector.values
    if (selector?.operator === "anyLegalValue") return dimensionLegalValues(authority, dimensionId)
  }
  return [resolved.value]
}
const predicateCanMatch = (snapshot, predicate, authority) => {
  const left = operandValues(snapshot, predicate.path, authority)
  const right = predicate.value && typeof predicate.value === "object" && Object.keys(predicate.value).length === 1 && typeof predicate.value.path === "string"
    ? operandValues(snapshot, predicate.value.path, authority)
    : [predicate.value]
  if (predicate.operator === "equals") return left.some((leftValue) => right.some((rightValue) => sameJson(leftValue, rightValue)))
  if (predicate.operator === "notEquals") return left.some((leftValue) => right.some((rightValue) => !sameJson(leftValue, rightValue)))
  fail("CONSTRAINT_OPERATOR", "constraint operator differs")
}
const violatesConstraint = (snapshot, constraint, authority) => constraint.expression.forbidAll.every((predicate) => predicateCanMatch(snapshot, predicate, authority))
const validateConstraintsExecutable = (authority) => {
  assertExactKeys(authority.snapshotSchema, ["schemaVersion", "fields", "stateProjection", "absentOptionalValue", "sourceClauseIds"], "SNAPSHOT_SCHEMA", "snapshot schema")
  requireValue(authority.snapshotSchema.schemaVersion === "screen-snapshot-constraint-schema-v1" && authority.snapshotSchema.absentOptionalValue.kind === "not-applicable", "SNAPSHOT_SCHEMA", "snapshot schema semantic values differ")
  const paths = authority.snapshotSchema.fields.map((row) => row.path)
  requireValue(unique(paths) && paths.includes("machineId") && authority.dimensions.every((row) => paths.includes("selector.dimensions." + row.dimensionId)), "SNAPSHOT_SCHEMA", "snapshot schema paths differ")
  for (const field of authority.snapshotSchema.fields) {
    const allowed = field.path.startsWith("selector.dimensions.") ? ["path", "valueType", "presence", "legalValuesSource"] : field.presence === "optional" ? ["path", "valueType", "presence", "absenceSemantics"] : ["path", "valueType", "presence"]
    assertExactKeys(field, allowed, "SNAPSHOT_SCHEMA", "snapshot schema field")
    requireValue(["required", "optional"].includes(field.presence), "SNAPSHOT_SCHEMA", "snapshot schema field presence differs")
  }
  const pathSet = new Set(paths)
  const invalid = authority.constraints.filter((row) => row.kind === "invalid-combination")
  requireValue(invalid.length === 9, "CONSTRAINT_SET", "invalid constraint family differs")
  for (const constraint of invalid) {
    assertExactKeys(constraint, ["constraintId", "kind", "ordinal", "expression", "witnesses", "sourceClauseIds"], "CONSTRAINT_SCHEMA", "invalid constraint")
    assertExactKeys(constraint.expression, ["forbidAll"], "CONSTRAINT_SCHEMA", "invalid constraint expression")
    assertExactKeys(constraint.witnesses, ["legal", "forbidden"], "CONSTRAINT_SCHEMA", "constraint witnesses")
    requireValue(Array.isArray(constraint.expression.forbidAll) && constraint.expression.forbidAll.length >= 2, "CONSTRAINT_SCHEMA", "constraint operands differ")
    for (const predicate of constraint.expression.forbidAll) {
      assertExactKeys(predicate, ["path", "operator", "value"], "CONSTRAINT_SCHEMA", "constraint predicate")
      requireValue(pathSet.has(predicate.path), "CONSTRAINT_PATH", "constraint operand path is unresolved")
      requireValue(["equals", "notEquals"].includes(predicate.operator), "CONSTRAINT_OPERATOR", "constraint operator differs")
      if (predicate.value && typeof predicate.value === "object") {
        assertExactKeys(predicate.value, ["path"], "CONSTRAINT_SCHEMA", "constraint path operand")
        requireValue(pathSet.has(predicate.value.path), "CONSTRAINT_PATH", "constraint comparison path is unresolved")
      }
    }
    requireValue(!violatesConstraint(constraint.witnesses.legal, constraint, authority) && violatesConstraint(constraint.witnesses.forbidden, constraint, authority), "CONSTRAINT_WITNESS", "constraint witnesses do not prove both branches")
  }
  for (const state of authority.machineStates) {
    const snapshot = { machineId: state.machineId, selector: state.selector, context: state.context }
    for (const constraint of invalid) requireValue(!violatesConstraint(snapshot, constraint, authority), "CONSTRAINT_STATE", "machine state admits an invalid combination")
  }
  for (const edge of authority.edges.filter((row) => row.toStateSelector?.stateId)) {
    const target = authority.machineStates.find((row) => row.machineStateId === edge.toStateSelector.stateId)
    const snapshot = { machineId: target.machineId, selector: target.selector, context: target.context }
    for (const constraint of invalid) requireValue(!violatesConstraint(snapshot, constraint, authority), "CONSTRAINT_TRANSITION", "transition target admits an invalid combination")
  }
}

const declaredStateFields = (state) => new Map(state.selector.substates.map((field) => [field.substateId, field]))
const canonicalFieldTypeById = {
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
const stateFieldContract = (field) => {
  if (Array.isArray(field.legalValues)) return { valueType: "enum", legalValues: field.legalValues }
  return { valueType: canonicalFieldTypeById[field.substateId] ?? "opaque-" + field.substateId }
}
const requireStateFieldCompatible = (source, target, label) => {
  const sourceContract = stateFieldContract(source)
  const targetContract = stateFieldContract(target)
  requireValue(sourceContract.valueType === targetContract.valueType, "TRANSITION_CONSTRUCTIBILITY", label + " state field type differs")
  if (targetContract.valueType === "enum") requireValue(sameJson(sourceContract.legalValues, targetContract.legalValues), "TRANSITION_CONSTRUCTIBILITY", label + " enum domain differs")
  if (Object.hasOwn(target, "fixedValue")) requireValue(Object.hasOwn(source, "fixedValue") && sameJson(source.fixedValue, target.fixedValue), "TRANSITION_CONSTRUCTIBILITY", label + " fixed target is not preserved exactly")
}
const requireTriggerFieldCompatible = (triggerField, targetField, label) => {
  if (Object.hasOwn(targetField, "fixedValue")) {
    requireValue(triggerField.valueType === "literal" && sameJson(triggerField.literal, targetField.fixedValue), "TRIGGER_CONSTRUCTION", label + " trigger does not construct the fixed target")
    return
  }
  const targetContract = stateFieldContract(targetField)
  requireValue(triggerField.valueType === targetContract.valueType, "TRIGGER_CONSTRUCTION", label + " trigger field type differs")
  if (targetContract.valueType === "enum") requireValue(sameJson(triggerField.legalValues, targetContract.legalValues), "TRIGGER_CONSTRUCTION", label + " trigger enum domain differs")
}
const sourceStateIdsForSelector = (selector, authority, seen = new Set()) => {
  if (selector.kind === "machine-state") return selector.stateIds ?? []
  if (selector.kind === "route-state-projection") return [...new Set(Object.values(selector.byRouteId).flat())]
  if (selector.kind === "outcome-resolution") {
    if (seen.has(selector.outcomeId)) return []
    seen.add(selector.outcomeId)
    return [...new Set(authority.edges.filter((row) => row.outcomeId === selector.outcomeId).flatMap((row) => sourceStateIdsForSelector(row.fromSelector, authority, seen)))]
  }
  return []
}
const triggerFieldMap = (edge, authority) => {
  const row = edge.trigger.kind === "action" ? authority.actions.find((candidate) => candidate.actionId === edge.trigger.id) : authority.events.find((candidate) => candidate.eventId === edge.trigger.id)
  if (row?.payload?.kind !== "closed-tagged-object") return new Map()
  return new Map(row.payload.fields.map((field) => [field.fieldId, field]))
}
const validateConstructionRecord = ({ label, originStateIds, targetStateId, preserve, assignments, trigger }, authority) => {
  const stateById = new Map(authority.machineStates.map((row) => [row.machineStateId, row]))
  const target = stateById.get(targetStateId)
  requireValue(target, "TRANSITION_CONSTRUCTIBILITY", "construction target state is missing")
  const targetFields = declaredStateFields(target)
  requireValue(Array.isArray(preserve) && unique(preserve), "TRANSITION_CONSTRUCTIBILITY", "construction preserve set differs")
  requireValue(assignments === null || (assignments && typeof assignments === "object" && !Array.isArray(assignments)), "TRANSITION_CONSTRUCTIBILITY", "construction assignments differ")
  for (const fieldId of preserve) {
    const targetField = targetFields.get(fieldId)
    requireValue(targetField, "TRANSITION_CONSTRUCTIBILITY", "preserved target field is undeclared")
    requireValue(originStateIds.length > 0 && originStateIds.every((id) => declaredStateFields(stateById.get(id)).has(fieldId)), "TRANSITION_CONSTRUCTIBILITY", label + " preserves " + fieldId + " absent from a legal origin")
    for (const id of originStateIds) requireStateFieldCompatible(declaredStateFields(stateById.get(id)).get(fieldId), targetField, label + " preserves " + fieldId)
  }
  const triggerFields = triggerFieldMap({ trigger }, authority)
  for (const [fieldId, source] of Object.entries(assignments ?? {})) {
    requireValue(targetFields.has(fieldId), "TRANSITION_CONSTRUCTIBILITY", label + " assigns undeclared target field " + fieldId)
    requireValue(typeof source === "string" && source.length > 0, "TRANSITION_CONSTRUCTIBILITY", "assignment source differs")
    if (source.startsWith("state.")) {
      const sourceField = source.slice("state.".length)
      requireValue(originStateIds.length > 0 && originStateIds.every((id) => declaredStateFields(stateById.get(id)).has(sourceField)), "TRIGGER_CONSTRUCTION", "state assignment source is absent from a legal origin")
      for (const id of originStateIds) requireStateFieldCompatible(declaredStateFields(stateById.get(id)).get(sourceField), targetFields.get(fieldId), label + " assigns " + source)
    } else if (source.startsWith("command.") || source.startsWith("event.")) {
      const expectedPrefix = trigger.kind === "action" ? "command." : "event."
      requireValue(source.startsWith(expectedPrefix), "TRIGGER_CONSTRUCTION", "assignment uses the wrong trigger channel")
      requireValue(triggerFields.has(source.slice(expectedPrefix.length)), "TRIGGER_CONSTRUCTION", label + " reads undeclared trigger field " + source)
      requireTriggerFieldCompatible(triggerFields.get(source.slice(expectedPrefix.length)), targetFields.get(fieldId), label + " assigns " + source)
    } else {
      const targetField = targetFields.get(fieldId)
      if (Object.hasOwn(targetField, "fixedValue")) requireValue(sameJson(source, targetField.fixedValue), "TRANSITION_CONSTRUCTIBILITY", "literal assignment differs from fixed target")
      if (Array.isArray(targetField.legalValues)) requireValue(targetField.legalValues.includes(source), "TRANSITION_CONSTRUCTIBILITY", "literal assignment is outside target legal values")
    }
  }
  for (const [fieldId, field] of targetFields) {
    if (Object.hasOwn(field, "fixedValue") || Object.hasOwn(field, "initialValue")) continue
    requireValue(preserve.includes(fieldId) || Object.hasOwn(assignments ?? {}, fieldId), "TRANSITION_CONSTRUCTIBILITY", label + " drops a required dynamic field")
  }
}
const validateTransitionConstructibility = (authority) => {
  for (const edge of authority.edges.filter((row) => row.toStateSelector?.stateId)) {
    const origins = sourceStateIdsForSelector(edge.fromSelector, authority)
    validateConstructionRecord({ label: edge.edgeId, originStateIds: origins, targetStateId: edge.toStateSelector.stateId, preserve: edge.toStateSelector.preserve, assignments: edge.toStateSelector.substateAssignments, trigger: edge.trigger }, authority)
  }
  const edgeById = new Map(authority.edges.map((row) => [row.edgeId, row]))
  requireValue(unique(authority.navigationConstructions.map((row) => row.constructionId)), "NAV_CONSTRUCTION", "navigation construction IDs differ")
  for (const construction of authority.navigationConstructions) {
    assertExactKeys(construction, ["constructionId", "edgeId", "outcomeId", "destinationStateId", "preserve", "assignments", "sourceClauseIds"], "NAV_CONSTRUCTION", "navigation construction")
    const edge = edgeById.get(construction.edgeId)
    requireValue(edge?.outcomeId === construction.outcomeId, "NAV_CONSTRUCTION", "navigation construction edge/outcome differs")
    const outcome = authority.outcomes.find((row) => row.outcomeId === construction.outcomeId)
    requireValue(outcome?.payload?.selector?.destinationStateId === construction.destinationStateId, "NAV_CONSTRUCTION", "navigation construction destination differs")
    validateConstructionRecord({ label: construction.constructionId, originStateIds: sourceStateIdsForSelector(edge.fromSelector, authority), targetStateId: construction.destinationStateId, preserve: construction.preserve, assignments: construction.assignments, trigger: edge.trigger }, authority)
  }
  const expectedNavigationEdges = authority.edges.filter((row) => {
    const outcome = authority.outcomes.find((candidate) => candidate.outcomeId === row.outcomeId)
    return Boolean(outcome?.payload?.selector?.destinationStateId)
  }).map((row) => row.edgeId)
  requireValue(sameJson(authority.navigationConstructions.map((row) => row.edgeId), expectedNavigationEdges), "NAV_CONSTRUCTION", "navigation construction family differs")
}

const validateCorrectionPreservation = (authority) => {
  const fields = (id) => new Set(authority.machineStates.find((row) => row.machineStateId === id).selector.substates.map((row) => row.substateId))
  for (const id of ["correction-report.draft", "correction-report.validating", "correction-report.draft-validation-errors", "correction-report.ready-to-submit", "correction-report.submitting", "correction-report.ready-recoverable-error", "correction-report.local-draft-saved"]) requireValue(fields(id).has("safeFields"), "CORRECTION_PRESERVATION", "correction safe fields are not represented")
  for (const id of ["correction-report.submitting", "correction-report.ready-recoverable-error"]) requireValue(fields(id).has("clientReceiptId"), "CORRECTION_PRESERVATION", "correction receipt ID is not represented")
  const required = {
    "E-CORR-001-VALIDATE": ["safeFields"], "E-CORR-002-VALID": ["safeFields"], "E-CORR-003-INVALID": ["safeFields"],
    "E-CORR-010-SUBMIT": ["safeFields"], "E-CORR-012-SUBMIT-FAIL": ["safeFields", "clientReceiptId"],
    "E-CORR-020-SAVE-DRAFT": ["safeFields"], "E-CORR-021-RESUME": ["safeFields"]
  }
  for (const [edgeId, fieldIds] of Object.entries(required)) {
    const edge = authority.edges.find((row) => row.edgeId === edgeId)
    requireValue(fieldIds.every((fieldId) => edge.toStateSelector.preserve.includes(fieldId) || Object.hasOwn(edge.toStateSelector.substateAssignments ?? {}, fieldId)), "CORRECTION_PRESERVATION", "correction transition drops retained data")
  }
}

const validatePackGenerations = (authority) => {
  const fields = (id) => authority.machineStates.find((row) => row.machineStateId === id).selector.substates.map((row) => row.substateId)
  for (const id of ["offline-pack.downloading", "offline-pack.paused-offline", "offline-pack.verifying", "offline-pack.staged", "offline-pack.activating", "offline-pack.update-available", "offline-pack.quarantined", "offline-pack.recoverable-error"]) requireValue(["priorActiveGeneration", "candidateGeneration"].every((field) => fields(id).includes(field)), "PACK_GENERATION", "pack state drops dual generation identity")
  for (const id of ["offline-pack.active", "offline-pack.removing", "offline-pack.retained"]) requireValue(fields(id).includes("activeGeneration"), "PACK_GENERATION", "pack active lineage is missing")
  const activated = authority.edges.find((row) => row.edgeId === "E-PACK-021-ACTIVATED")
  requireValue(sameJson(activated.toStateSelector.substateAssignments, { activeGeneration: "state.candidateGeneration" }), "PACK_GENERATION", "pack activation is not atomic candidate promotion")
  const update = authority.edges.find((row) => row.edgeId === "E-PACK-030-UPDATE")
  requireValue(sameJson(update.toStateSelector.substateAssignments, { priorActiveGeneration: "state.activeGeneration", candidateGeneration: "event.candidateGeneration" }), "PACK_GENERATION", "pack update does not split prior/candidate generations")
}

const validateEffectLifecycle = (authority, oracle) => {
  requireValue(sameJson(authority.effectTypes, oracle.semanticProjection.effectTypes) && sameJson(authority.presentationEffects, oracle.semanticProjection.presentationEffects) && sameJson(authority.effectBindings, oracle.semanticProjection.effectBindings), "EFFECT_LIFECYCLE", "effect projection differs from immutable semantics")
  const typeIds = new Set(authority.effectTypes.map((row) => row.effectType))
  const edgeIds = new Set(authority.edges.map((row) => row.edgeId))
  const effects = new Map(authority.presentationEffects.map((row) => [row.effectId, row]))
  for (const effect of authority.presentationEffects) {
    assertExactKeys(effect, ["effectId", "effectType", "semanticTarget", "announcementPolicy", "ordering", "acknowledgement", "snapshotMetaPath", "sourceClauseIds"], "EFFECT_LIFECYCLE", "presentation effect")
    assertExactKeys(effect.semanticTarget, ["kind", "target", "fallbackTarget"], "EFFECT_LIFECYCLE", "effect semantic target")
    assertExactKeys(effect.announcementPolicy, ["mode", "hiddenAnswerExposureForbidden", "duplicateSuppression"], "EFFECT_LIFECYCLE", "announcement policy")
    assertExactKeys(effect.ordering, ["phase", "sequence", "connectedTargetRequired"], "EFFECT_LIFECYCLE", "effect ordering")
    assertExactKeys(effect.acknowledgement, ["mode", "eventId", "keyField"], "EFFECT_LIFECYCLE", "effect acknowledgement")
    requireValue(typeIds.has(effect.effectType) && effect.semanticTarget.kind === "semantic-target" && !/[.#\[]/u.test(effect.semanticTarget.target), "EFFECT_LIFECYCLE", "effect target is not semantic")
    requireValue(effect.ordering.phase === "after-render" && Number.isInteger(effect.ordering.sequence) && effect.ordering.sequence > 0, "EFFECT_LIFECYCLE", "effect is not ordered after render")
    requireValue(effect.acknowledgement.mode === "exactly-once" && effect.acknowledgement.eventId === "presentation.effect-acknowledged" && effect.acknowledgement.keyField === "effectId", "EFFECT_LIFECYCLE", "effect acknowledgement differs")
    requireValue(effect.snapshotMetaPath === "meta.presentationEffects[]" && effect.announcementPolicy.hiddenAnswerExposureForbidden === true && effect.announcementPolicy.duplicateSuppression === "effect-id", "EFFECT_LIFECYCLE", "effect snapshot/announcement policy differs")
  }
  for (const binding of authority.effectBindings) {
    assertExactKeys(binding, ["bindingId", "effectId", "edgeIds", "emissionCondition", "sourceClauseIds"], "EFFECT_LIFECYCLE", "effect binding")
    requireValue(effects.has(binding.effectId) && binding.edgeIds.length > 0 && unique(binding.edgeIds) && binding.edgeIds.every((id) => edgeIds.has(id)), "EFFECT_LIFECYCLE", "effect binding closure differs " + binding.bindingId)
  }
  requireValue(authority.presentationEffects.every((row) => authority.effectBindings.some((binding) => binding.effectId === row.effectId)), "EFFECT_LIFECYCLE", "an effect is unbound")
  const ack = authority.events.find((row) => row.eventId === "presentation.effect-acknowledged")
  requireValue(ack?.payload?.kind === "closed-tagged-object" && ack.payload.fields.some((row) => row.fieldId === "effectId"), "EFFECT_LIFECYCLE", "effect acknowledgement event differs")
}

const deriveSelectedDirection = (routesBytes) => {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(routesBytes)
  const match = text.match(/```json\n([\s\S]*?)\n```/u)
  requireValue(match, "SELECTED_DIRECTION", "selected-direction program is not parseable")
  let parsed
  try { parsed = JSON.parse(match[1]) } catch { fail("SELECTED_DIRECTION", "selected-direction JSON is invalid") }
  return { ...parsed, sourceClauseIds: ["RT-CODEX-METADATA", "RT-SELECTED-RULES"] }
}
const deriveMilestones = (routesBytes) => {
  const lines = new TextDecoder("utf-8", { fatal: true }).decode(routesBytes).split("\n")
  return lines.slice(129, 135).map((line, index) => {
    const match = line.match(/^\| `(M[0-5])` \| (.*) \|$/u)
    requireValue(match, "MILESTONE_CLOSURE", "milestone row is not parseable")
    return { milestoneId: match[1], ordinal: index, exitCondition: match[2], sourceClauseIds: ["RT-MILESTONES"] }
  })
}
const validateSelectedDirectionAndMilestones = (authority, oracle, sourceRuntime) => {
  const routesRuntime = sourceRuntime.get("ROUTES")
  const selected = deriveSelectedDirection(routesRuntime.bytes)
  requireValue(sameJson(authority.selectedDirection, selected) && sameJson(authority.selectedDirection, oracle.semanticProjection.selectedDirection), "SELECTED_DIRECTION", "selected-direction program/evidence differs")
  requireValue(authority.selectedDirection.rules.length === 11 && unique(authority.selectedDirection.rules.map((row) => row.id)) && authority.selectedDirection.evidenceMode === "codex-only" && authority.selectedDirection.humanEvidence === "none" && authority.selectedDirection.humanParticipantCount === 0 && authority.selectedDirection.notHumanUsabilityTested === true, "SELECTED_DIRECTION", "selected-direction evidence/rules differ")
  const milestones = deriveMilestones(routesRuntime.bytes)
  requireValue(sameJson(authority.implementationMilestones, milestones) && sameJson(authority.implementationMilestones, oracle.semanticProjection.implementationMilestones), "MILESTONE_CLOSURE", "milestone program differs")
  const clauseById = new Map(authority.sourceClauses.map((row) => [row.clauseId, row]))
  const assignments = {}
  for (const route of authority.routes) {
    if (route.routeKind === "additional-acquisition-spoke") assignments[route.routeId] = { kind: "not-applicable", reason: "additional-acquisition-spoke-outside-21-family-milestone-table" }
    else {
      const rowId = route.sourceClauseIds.find((id) => /^RT-ROUTE-/u.test(id))
      const cells = clauseById.get(rowId).textUtf8Lf.trim().split("|").map((cell) => cell.trim()).filter(Boolean)
      const sourceCell = cells.at(-1)
      assignments[route.routeId] = { kind: "assigned", milestoneIds: [...sourceCell.matchAll(/\bM[0-5]\b/gu)].map((match) => match[0]), sourceCell }
    }
    requireValue(sameJson(route.milestoneAssignment, assignments[route.routeId]), "MILESTONE_CLOSURE", "route milestone assignment differs")
  }
  requireValue(sameJson(assignments, oracle.semanticProjection.routeMilestoneAssignments), "MILESTONE_CLOSURE", "route milestone projection differs")
}

const sourceRoutesForEdge = (edge, authority, seen = new Set()) => {
  const selector = edge.fromSelector
  if (selector.kind === "initial" || selector.kind === "machine-state") return selector.routeIds ?? []
  if (selector.kind === "route-state-projection") return Object.keys(selector.byRouteId)
  if (selector.kind === "outcome-resolution") {
    if (seen.has(selector.outcomeId)) return []
    seen.add(selector.outcomeId)
    return [...new Set(authority.edges.filter((candidate) => candidate.outcomeId === selector.outcomeId).flatMap((candidate) => sourceRoutesForEdge(candidate, authority, seen)))]
  }
  return []
}
const validateTypedAndRouteClosure = (authority, clauseIds) => {
  const routeIds = new Set(authority.routes.map((row) => row.routeId))
  const machineIds = new Set(authority.machines.map((row) => row.machineId))
  const stateById = new Map(authority.machineStates.map((row) => [row.machineStateId, row]))
  const actionIds = new Set(authority.actions.map((row) => row.actionId))
  const eventIds = new Set(authority.events.map((row) => row.eventId))
  const outcomeById = new Map(authority.outcomes.map((row) => [row.outcomeId, row]))
  for (const machine of authority.machines) for (const routeId of machine.routeIds) requireValue(routeIds.has(routeId), "MACHINE_ROUTE", "machine route is missing")
  for (const state of authority.machineStates) {
    requireValue(machineIds.has(state.machineId), "STATE_MACHINE", "state machine is missing")
    requireValue(state.routeScope.length > 0 && unique(state.routeScope) && state.routeScope.every((routeId) => routeIds.has(routeId)), "STATE_ROUTE", "state route scope differs")
  }
  for (const route of authority.routes) for (const binding of route.machineBindings) {
    requireValue(machineIds.has(binding.machineId), "ROUTE_BINDING", "route binding machine is missing")
    if (binding.legalMachineStateIds) for (const stateId of binding.legalMachineStateIds) {
      const state = stateById.get(stateId)
      requireValue(state?.machineId === binding.machineId && state.routeScope.includes(route.routeId), "ROUTE_BINDING_STATE", "bound state is route-illegal")
    }
  }
  for (const action of authority.actions) requireValue(action.applicableMachineIds.every((id) => machineIds.has(id)), "ACTION_MACHINE", "action machine is missing")
  for (const edge of authority.edges) {
    requireValue(machineIds.has(edge.machineId), "EDGE_MACHINE", "edge machine is missing")
    requireValue(edge.sourceClauseIds.length >= 2 && unique(edge.sourceClauseIds), "EDGE_CITATION", "edge needs multiple distinct clauses")
    requireValue(edge.sourceClauseIds.every((id) => clauseIds.has(id)), "CITATION_CLOSURE", "edge citation is unresolved")
    requireValue(edge.trigger.kind === "action" ? actionIds.has(edge.trigger.id) : eventIds.has(edge.trigger.id), "EDGE_TRIGGER", "edge trigger is unresolved")
    const sourceRoutes = sourceRoutesForEdge(edge, authority)
    requireValue(sourceRoutes.every((routeId) => routeIds.has(routeId)), "EDGE_FROM_ROUTE", "edge source route is missing")
    if (edge.fromSelector.stateIds) for (const stateId of edge.fromSelector.stateIds) {
      const state = stateById.get(stateId)
      requireValue(state?.machineId === edge.machineId, "EDGE_FROM_STATE", "edge source state is missing or wrong-machine")
      requireValue(sourceRoutes.every((routeId) => state.routeScope.includes(routeId)), "EDGE_FROM_STATE_ROUTE", "edge source state is route-illegal")
    }
    if (edge.fromSelector.kind === "route-state-projection") for (const [routeId, ids] of Object.entries(edge.fromSelector.byRouteId)) for (const stateId of ids) {
      const state = stateById.get(stateId)
      requireValue(state?.machineId === edge.machineId && state.routeScope.includes(routeId), "EDGE_FROM_STATE_ROUTE", "projected edge source is route-illegal")
    }
    if (edge.toStateSelector?.stateId) {
      const state = stateById.get(edge.toStateSelector.stateId)
      requireValue(state?.machineId === edge.machineId, "EDGE_TO_STATE", "edge target state is missing or wrong-machine")
      requireValue(sourceRoutes.every((routeId) => state.routeScope.includes(routeId)), "EDGE_TO_STATE_ROUTE", "plain target state is illegal on a source route")
    }
    if (edge.toStateSelector?.stateIds) for (const stateId of edge.toStateSelector.stateIds) {
      const state = stateById.get(stateId)
      requireValue(state?.machineId === edge.machineId, "EDGE_TO_STATE", "edge alternative target is missing")
      requireValue(sourceRoutes.every((routeId) => state.routeScope.includes(routeId)), "EDGE_TO_STATE_ROUTE", "alternative target is route-illegal")
    }
    if (edge.toStateSelector?.kind === "route-state-map") for (const [routeId, ids] of Object.entries(edge.toStateSelector.byRouteId)) for (const stateId of ids) {
      const state = stateById.get(stateId)
      requireValue(state?.machineId === edge.machineId && state.routeScope.includes(routeId), "EDGE_TO_STATE_ROUTE", "mapped target is route-illegal")
    }
    if (edge.outcomeId) {
      const outcome = outcomeById.get(edge.outcomeId)
      requireValue(outcome, "EDGE_OUTCOME", "edge outcome is missing")
      if (outcome.outcomeType === "navigation" || outcome.outcomeType === "exit") {
        const selector = outcome.payload.selector
        if (selector.kind === "route-map") requireValue(sourceRoutes.every((routeId) => Object.hasOwn(selector.bySourceRouteId, routeId)), "NAV_EMITTER_DOMAIN", "route-map omits an emitting source route")
        if (selector.kind === "same-route-next-position" || selector.kind === "same-route-position") requireValue(sourceRoutes.every((routeId) => selector.allowedSourceRouteIds.includes(routeId)), "NAV_EMITTER_DOMAIN", "same-route selector omits an emitting source route")
      }
    }
  }
  const citedCollections = ["dimensions", "constraints", "implementationMilestones", "effectTypes", "presentationEffects", "effectBindings", "navigationConstructions", "machines", "routes", "machineStates", "actions", "events", "outcomes", "interpretations"]
  for (const collection of citedCollections) for (const row of authority[collection]) requireValue(Array.isArray(row.sourceClauseIds) && row.sourceClauseIds.length > 0 && row.sourceClauseIds.every((id) => clauseIds.has(id)), "CITATION_CLOSURE", "authority citation is unresolved")
  requireValue(authority.events.filter((row) => row.eventId === "resource.initial-failure").length === 1 && !authority.machineStates.some((row) => row.stateName === "initial-resource-failure"), "INITIAL_FAILURE_EVENT", "initial resource failure is not event-only")
  const commitComplete = authority.edges.filter((edge) => edge.machineId === "data-operation" && edge.fromSelector.stateIds?.includes("data-operation.committing") && edge.toStateSelector?.stateId === "data-operation.complete")
  requireValue(commitComplete.length === 1 && ["SS-DATA-COMMIT-COMPLETE-202", "SS-DATA-COMMIT-COMPLETE-204"].every((id) => commitComplete[0].sourceClauseIds.includes(id)), "DATA_COMMIT_MERGE", "committing-to-complete citations are not merged")
}

const parseRegistryRouteIds = (bytes) => {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  requireValue(Buffer.from(text, "utf8").compare(bytes) === 0 && !bytes.includes(13) && bytes.at(-1) === 10, "IMPLEMENTATION_DRIFT", "registry encoding differs")
  const match = text.match(/export const CANONICAL_ROUTE_IDS = \[([\s\S]*?)\] as const/u)
  requireValue(match, "IMPLEMENTATION_DRIFT", "registry declaration is not parseable")
  const ids = [...match[1].matchAll(/"([a-z0-9-]+)"/gu)].map((entry) => entry[1])
  requireValue(ids.length > 0 && unique(ids), "IMPLEMENTATION_DRIFT", "registry IDs are empty or duplicated")
  return ids
}
const validateImplementationDrift = (authority, oracle, gitRoot) => {
  const expected = oracle.implementationRegistry
  const resolved = resolveSafeRepoFile(gitRoot, authority.implementationDrift.inspectedRepoRelativePath)
  requireValue(authority.implementationDrift.inspectedRepoRelativePath === expected.repoRelativePath, "IMPLEMENTATION_DRIFT", "registry relative path differs")
  const bytes = fs.readFileSync(resolved)
  const routeIds = parseRegistryRouteIds(bytes)
  requireValue(sha256(bytes) === expected.sha256 && gitBlobSha(bytes) === expected.gitBlobSha && bytes.length === expected.byteLength && sameJson(routeIds, expected.routeIds), "IMPLEMENTATION_DRIFT", "live registry bytes/IDs differ")
  const authorityRouteIds = oracle.requiredIds.routes
  const missing = authorityRouteIds.filter((id) => !routeIds.includes(id))
  const extra = routeIds.filter((id) => !authorityRouteIds.includes(id))
  const drift = authority.implementationDrift
  requireValue(drift.inspectedGitBlobSha === gitBlobSha(bytes) && drift.inspectedSha256 === sha256(bytes) && drift.inspectedByteLength === bytes.length && drift.inspectedEncoding === "UTF-8" && drift.inspectedNewline === "LF", "IMPLEMENTATION_DRIFT", "registry binding fields differ")
  requireValue(drift.authorityRouteCount === authorityRouteIds.length && drift.implementationRouteCount === routeIds.length && sameJson(drift.implementationRouteIds, routeIds) && drift.missingRouteCount === missing.length && sameJson(drift.missingRouteIds, missing) && sameJson(drift.extraRouteIds, extra), "IMPLEMENTATION_DRIFT", "derived registry drift differs")
}

const validateJourney = (authority, oracle) => {
  const lens = authority.journeyLens
  requireValue(unique(lens.journeyIds) && sameJson(lens.journeyIds, oracle.requiredIds.journeyIds), "JOURNEY_DERIVATION", "journey ID set differs")
  requireValue(lens.journeyCount === new Set(lens.journeyIds).size && lens.contributesToAuthorityArrays === false && lens.contributesToAuthorityCounts === false && lens.status === "non-authority-validation-view", "JOURNEY_DERIVATION", "journey count/separation differs")
}

const validateInterpretations = (authority) => {
  const requiredTags = ["pipe", "slash", "parentheses", "plus", "grouped-routes", "inferred-actions", "review-settings-qualifications", "hazard-completion", "print-behavior", "simulation-route-allocation", "print-route-allocation", "active-answer-substate", "initial-resource-failure-event", "navigation-outcome", "confirmation-outcome", "exit-outcome", "duplicate-edge-citation-merge", "reference-machine-binding", "trigger-payload-construction", "effect-lifecycle", "pack-dual-generation"]
  const tags = new Set(authority.interpretations.flatMap((row) => row.coverageTags))
  requireValue(requiredTags.every((tag) => tags.has(tag)) && authority.interpretations.every((row) => row.resolution && row.rationale && row.limitation), "INTERPRETATION_CLOSURE", "interpretation ledger differs")
}

const validateCountsRootsAndShape = (authority, oracle) => {
  const counts = deriveCounts(authority)
  requireValue(sameJson(counts, authority.counts) && sameJson(counts, oracle.expected.counts), "DERIVED_COUNTS", "derived counts differ")
  const roots = deriveRoots(authority)
  requireValue(sameJson(roots, authority.integrityRoots) && sameJson(roots, oracle.expected.integrityRoots), "INTEGRITY_ROOT", "derived roots differ")
  requireValue(canonicalHash(structuralShape(authority)) === oracle.authorityStructuralShapeSha256, "EXACT_KEY_SHAPE", "authority object/key shape differs")
  return { counts, roots }
}

const validateAuthority = (authority, oracle, gitRoot) => {
  validateMetadata(authority)
  const sourceRuntime = deriveSourceRuntime(authority, oracle, gitRoot)
  const clauseIds = validateClauses(authority, oracle, sourceRuntime)
  validateSyntaxSemantics(authority, oracle)
  validateRequiredFamilies(authority, oracle)
  validateOutcomes(authority, oracle)
  validateTagsAndTransitionChannels(authority)
  validateRouteCitationCompatibility(authority, oracle)
  validateStatusAndReference(authority, oracle)
  validateTypedAndRouteClosure(authority, clauseIds)
  validatePreservation(authority, oracle)
  validateDataInvariant(authority)
  validateConstraintsExecutable(authority)
  validateTransitionConstructibility(authority)
  validateCorrectionPreservation(authority)
  validatePackGenerations(authority)
  validateEffectLifecycle(authority, oracle)
  validateSelectedDirectionAndMilestones(authority, oracle, sourceRuntime)
  validateImplementationDrift(authority, oracle, gitRoot)
  validateJourney(authority, oracle)
  validateInterpretations(authority)
  return { ...validateCountsRootsAndShape(authority, oracle), sourceRuntime }
}

const evaluateAssertion = (authority, assertion, context) => {
  if (assertion.kind === "semantic-validator") {
    const checks = {
      CONSTRAINT_EXECUTION: () => validateConstraintsExecutable(authority),
      TRANSITION_CONSTRUCTIBILITY: () => validateTransitionConstructibility(authority),
      EFFECT_LIFECYCLE: () => validateEffectLifecycle(authority, context.oracle),
      CONFIRMATION_DETERMINISM: () => validateOutcomes(authority, context.oracle),
      CORRECTION_PRESERVATION: () => validateCorrectionPreservation(authority),
      PACK_GENERATION: () => validatePackGenerations(authority),
      SELECTED_DIRECTION: () => validateSelectedDirectionAndMilestones(authority, context.oracle, context.sourceRuntime),
      MILESTONE_CLOSURE: () => validateSelectedDirectionAndMilestones(authority, context.oracle, context.sourceRuntime)
    }
    requireValue(Object.hasOwn(checks, assertion.targetId), "POSITIVE_CONTROL", "unknown semantic positive control")
    checks[assertion.targetId]()
    return { pass: true, actual: { validatorId: assertion.targetId, result: "accept" } }
  }
  const actual = getPointer(authority, assertion.pointer)
  if (assertion.kind === "pointer-equals") return { pass: sameJson(actual, assertion.expected), actual }
  if (assertion.kind === "pointer-includes") return { pass: Array.isArray(actual) && actual.includes(assertion.expected), actual }
  if (assertion.kind === "pointer-excludes") return { pass: Array.isArray(actual) && !actual.includes(assertion.expected), actual }
  throw new Error("unsupported positive assertion")
}
const runPositiveControls = (authority, fixture, context) => fixture.positiveControls.map((control) => {
  const observations = control.assertions.map((assertion) => ({ assertion, ...evaluateAssertion(authority, assertion, context) }))
  const pass = observations.every((row) => row.pass)
  return {
    controlId: control.controlId,
    expectedResult: "accept",
    actualResult: pass ? "accept" : "reject",
    expectedExitCode: 0,
    actualExitCode: pass ? 0 : 1,
    observationSha256: canonicalHash(observations.map((row) => row.actual)),
    observations
  }
})

const derivedMutationValue = (derivation, authority) => {
  if (derivation === "authority.interpretationCount") return authority.interpretations.length
  if (derivation === "authority.interpretationsSha256") return canonicalHash(authority.interpretations)
  if (derivation === "authority.canonicalSha256") return canonicalHash(authority)
  throw new Error("unknown mutation derivation")
}
const runMutations = (authority, fixture, oracle, gitRoot, fixtureBytes, oracleBytes) => fixture.mutations.map((mutation) => {
  const candidateAuthority = clone(authority)
  const candidateFixture = clone(fixture)
  let actualResult = "accept"
  let actualExitCode = 0
  let actualValidatorId = "ACCEPT"
  let diagnostic = "mutation unexpectedly accepted"
  try {
    for (const operation of mutation.operations.filter((entry) => entry.op !== "replace-derived")) applyOperation((operation.document ?? "authority") === "fixture" ? candidateFixture : candidateAuthority, operation)
    for (const operation of mutation.operations.filter((entry) => entry.op === "replace-derived")) {
      const target = (operation.document ?? "authority") === "fixture" ? candidateFixture : candidateAuthority
      const direct = { op: "replace", pointer: operation.pointer, value: derivedMutationValue(operation.derivation, candidateAuthority) }
      applyOperation(target, direct)
    }
    const candidateAuthorityBytes = canonicalBytes(candidateAuthority)
    const candidateFixtureBytes = canonicalBytes(candidateFixture)
    const fixtureTouched = mutation.operations.some((entry) => (entry.document ?? "authority") === "fixture")
    validatePins(candidateAuthorityBytes, candidateFixtureBytes, oracleBytes, { authority: false, fixture: true })
    requireValue(canonicalHash(structuralShape(candidateFixture)) === oracle.fixtureStructuralShapeSha256, "EXACT_FIXTURE_SHAPE", "fixture object/key shape differs")
    if (!fixtureTouched) validateAuthority(candidateAuthority, oracle, gitRoot)
    else validateAuthority(candidateAuthority, oracle, gitRoot)
  } catch (error) {
    actualResult = "reject"
    actualExitCode = 1
    actualValidatorId = error instanceof ValidationFailure ? error.code : "VALIDATOR_DEFECT"
    diagnostic = error.message
  }
  const mutatedAuthoritySha256 = canonicalHash(candidateAuthority)
  const mutatedFixtureSha256 = canonicalHash(candidateFixture)
  return {
    mutationId: mutation.mutationId,
    operations: mutation.operations,
    expectedResult: mutation.expectedResult,
    actualResult,
    expectedExitCode: mutation.expectedExitCode,
    actualExitCode,
    expectedValidatorId: mutation.expectedValidatorId,
    actualValidatorId,
    mutatedAuthoritySha256,
    mutatedFixtureSha256,
    diagnostic,
    diagnosticSha256: sha256(Buffer.from(diagnostic, "utf8"))
  }
})

const captureExpectedFailure = (caseId, expectedValidatorId, fn) => {
  let actualValidatorId = "ACCEPT"
  let diagnostic = "attack unexpectedly accepted"
  try { fn() } catch (error) {
    actualValidatorId = error instanceof ValidationFailure ? error.code : "VALIDATOR_DEFECT"
    diagnostic = error.message
  }
  const pass = actualValidatorId === expectedValidatorId
  return {
    caseId,
    expectedResult: "reject",
    actualResult: pass ? "reject" : actualValidatorId === "ACCEPT" ? "accept" : "reject",
    expectedExitCode: 1,
    actualExitCode: actualValidatorId === "ACCEPT" ? 0 : 1,
    expectedValidatorId,
    actualValidatorId,
    diagnosticSha256: sha256(Buffer.from(diagnostic, "utf8"))
  }
}
const spawnCliCase = ({ caseId, expectedValidatorId, argv, cwd, protectedInputs }) => {
  const before = protectedInputs.map((filePath) => fs.readFileSync(filePath))
  const child = spawnSync(process.execPath, [fileURLToPath(import.meta.url), ...argv], { cwd, encoding: "utf8", windowsHide: true })
  requireValue(!child.error && child.signal === null, "SPAWNED_CLI", "child process did not terminate normally")
  const stderr = child.stderr ?? ""
  const stdout = child.stdout ?? ""
  let envelope = null
  try {
    requireValue(stderr.endsWith("\n") && stderr.trim().split("\n").length === 1, "SPAWNED_CLI", "child rejection envelope is not exactly one line")
    envelope = JSON.parse(stderr.trim())
  } catch (error) {
    if (error instanceof ValidationFailure) throw error
    fail("SPAWNED_CLI", "child rejection envelope is not JSON")
  }
  assertExactKeys(envelope, ["result", "exitCode", "validatorId", "message"], "SPAWNED_CLI", "child rejection envelope")
  requireValue(envelope.result === "reject" && envelope.exitCode === 1 && envelope.validatorId === expectedValidatorId && envelope.message === "validation rejected", "SPAWNED_CLI", "child rejection envelope semantics differ")
  requireValue(stdout === "" && !/(?:\/mnt\/|\/home\/|\/tmp\/|file:\/\/|Error:| at )/u.test(stderr), "SPAWNED_CLI", "child output leaks a path or stack")
  const after = protectedInputs.map((filePath) => fs.readFileSync(filePath))
  const actualValidatorId = envelope?.validatorId ?? "INVALID_ENVELOPE"
  const actualResult = envelope?.result ?? (child.status === 0 ? "accept" : "reject")
  return {
    caseId,
    expectedResult: "reject",
    actualResult,
    expectedExitCode: 1,
    actualExitCode: child.status ?? 1,
    expectedValidatorId,
    actualValidatorId,
    protectedArtifactsUnchanged: before.every((bytes, index) => bytes.compare(after[index]) === 0),
    stdoutSha256: sha256(Buffer.from(stdout, "utf8")),
    stderrSha256: sha256(Buffer.from(stderr, "utf8")),
    envelopeSha256: canonicalHash(envelope)
  }
}
const runSpawnedCliAttacks = ({ gitRoot, authorityPath, fixturePath, oraclePath }) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "plan008-cli-boundary-"))
  const cases = []
  try {
    const missing = path.join(tempRoot, "missing.json")
    const directory = path.join(tempRoot, "directory")
    fs.mkdirSync(directory)
    const inputSymlink = path.join(tempRoot, "input-link.json")
    fs.symlinkSync(authorityPath, inputSymlink)
    const outputSymlinkTarget = path.join(tempRoot, "output-target.json")
    fs.writeFileSync(outputSymlinkTarget, "untouched\n", "utf8")
    const outputSymlink = path.join(tempRoot, "proof-link.json")
    fs.symlinkSync(outputSymlinkTarget, outputSymlink)
    const hardlinkOutput = path.join(tempRoot, "proof-hardlink.json")
    fs.linkSync(authorityPath, hardlinkOutput)
    const hardlinkInput = path.join(tempRoot, "fixture-hardlink.json")
    fs.linkSync(authorityPath, hardlinkInput)
    const realOutputDirectory = path.join(tempRoot, "real-output")
    fs.mkdirSync(realOutputDirectory)
    const aliasOutputDirectory = path.join(tempRoot, "alias-output")
    fs.symlinkSync(realOutputDirectory, aliasOutputDirectory)
    const fakeRepo = path.join(tempRoot, "fake-repo")
    fs.mkdirSync(fakeRepo)
    fs.mkdirSync(path.join(fakeRepo, ".git"))
    fs.mkdirSync(path.join(fakeRepo, "product"))
    fs.symlinkSync(resolveSafeRepoFile(gitRoot, "product/SCREEN_STATES.md"), path.join(fakeRepo, "product", "SCREEN_STATES.md"))
    const baseValidate = ["validate", "--authority", authorityPath, "--fixture", fixturePath, "--oracle", oraclePath]
    const suiteArgs = (proofPath, reportName, bundleName) => ["suite", "--authority", authorityPath, "--fixture", fixturePath, "--oracle", oraclePath, "--proof-out", proofPath, "--report-out", path.join(tempRoot, reportName), "--bundle-out", path.join(tempRoot, bundleName)]
    const specs = [
      { caseId: "CLI-SPAWN-DUPLICATE-ARG", expectedValidatorId: "CLI_ARGS", argv: [...baseValidate, "--authority", authorityPath] },
      { caseId: "CLI-SPAWN-UNKNOWN-ARG", expectedValidatorId: "CLI_ARGS", argv: [...baseValidate, "--unknown", "x"] },
      { caseId: "CLI-SPAWN-MISSING-ARG", expectedValidatorId: "CLI_ARGS", argv: ["validate", "--authority", authorityPath, "--fixture", fixturePath] },
      { caseId: "CLI-SPAWN-MISSING-INPUT", expectedValidatorId: "INPUT_FILE", argv: ["validate", "--authority", missing, "--fixture", fixturePath, "--oracle", oraclePath] },
      { caseId: "CLI-SPAWN-NONREGULAR-INPUT", expectedValidatorId: "INPUT_FILE", argv: ["validate", "--authority", directory, "--fixture", fixturePath, "--oracle", oraclePath] },
      { caseId: "CLI-SPAWN-INPUT-SYMLINK", expectedValidatorId: "INPUT_SYMLINK", argv: ["validate", "--authority", inputSymlink, "--fixture", fixturePath, "--oracle", oraclePath] },
      { caseId: "CLI-SPAWN-INPUT-HARDLINK-ALIAS", expectedValidatorId: "PATH_ALIAS", argv: ["validate", "--authority", authorityPath, "--fixture", hardlinkInput, "--oracle", oraclePath] },
      { caseId: "CLI-SPAWN-LEXICAL-OUTPUT-ALIAS", expectedValidatorId: "PATH_ALIAS", argv: suiteArgs(authorityPath, "alias-report.md", "alias-bundle.json") },
      { caseId: "CLI-SPAWN-HARDLINK-OUTPUT-ALIAS", expectedValidatorId: "PATH_ALIAS", argv: suiteArgs(hardlinkOutput, "hard-report.md", "hard-bundle.json") },
      { caseId: "CLI-SPAWN-OUTPUT-SYMLINK", expectedValidatorId: "OUTPUT_SYMLINK", argv: suiteArgs(outputSymlink, "sym-report.md", "sym-bundle.json") },
      { caseId: "CLI-SPAWN-DUPLICATE-OUTPUT", expectedValidatorId: "PATH_ALIAS", argv: suiteArgs(path.join(tempRoot, "same-output"), "same-output", "distinct-bundle.json") },
      { caseId: "CLI-SPAWN-REALPATH-OUTPUT-ALIAS", expectedValidatorId: "PATH_ALIAS", argv: ["suite", "--authority", authorityPath, "--fixture", fixturePath, "--oracle", oraclePath, "--proof-out", path.join(realOutputDirectory, "shared"), "--report-out", path.join(aliasOutputDirectory, "shared"), "--bundle-out", path.join(tempRoot, "realpath-bundle.json")] },
      { caseId: "CLI-SPAWN-SOURCE-SYMLINK-ESCAPE", expectedValidatorId: "SAFE_PATH", argv: baseValidate, cwd: fakeRepo }
    ]
    const protectedInputs = [authorityPath, fixturePath, oraclePath, outputSymlinkTarget]
    for (const spec of specs) cases.push(spawnCliCase({ ...spec, cwd: spec.cwd ?? gitRoot, protectedInputs }))
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true })
  }
  return cases
}

const runAtomicWriteControl = () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "plan008-atomic-write-"))
  try {
    const entries = ["proof", "report", "bundle"].map((role) => {
      const filePath = path.join(tempRoot, role + ".out")
      return { role, descriptor: describeOutputFile(role, filePath), bytes: Buffer.from("plan008-" + role + "-atomic-control\n", "utf8") }
    })
    assertDistinctPaths(entries.map((row) => row.descriptor))
    const reopenedHashes = atomicWriteAll(entries)
    const expectedHashes = Object.fromEntries(entries.map((row) => [row.role, sha256(row.bytes)]))
    const pass = sameJson(reopenedHashes, expectedHashes)
    return {
      caseId: "ATOMIC-WRITE-REOPEN-HASH",
      expectedResult: "accept",
      actualResult: pass ? "accept" : "reject",
      expectedExitCode: 0,
      actualExitCode: pass ? 0 : 1,
      expectedHashes,
      reopenedHashes
    }
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true })
  }
}
const runSafePathAttacks = () => {
  const results = [
    captureExpectedFailure("SAFE-PATH-TRAVERSAL", "SAFE_PATH", () => resolveSafeRepoFile(process.cwd(), "../private-host/escape")),
    captureExpectedFailure("SAFE-PATH-ABSOLUTE", "SAFE_PATH", () => resolveSafeRepoFile(process.cwd(), "/private-host/escape"))
  ]
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "plan008-safe-path-"))
  try {
    const fakeRepo = path.join(tempRoot, "repo")
    const outside = path.join(tempRoot, "outside")
    fs.mkdirSync(fakeRepo)
    fs.mkdirSync(path.join(fakeRepo, ".git"))
    fs.mkdirSync(outside)
    fs.writeFileSync(path.join(outside, "source.txt"), "outside\n", "utf8")
    fs.symlinkSync(path.join(outside, "source.txt"), path.join(fakeRepo, "escape"))
    results.push(captureExpectedFailure("SAFE-PATH-SYMLINK-ESCAPE", "SAFE_PATH", () => resolveSafeRepoFile(fakeRepo, "escape")))
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true })
  }
  return results
}

const portableInvocation = {
  kind: "portable-invocation-descriptor",
  program: "node",
  workingDirectory: "discovered-git-root",
  argv: ["<validator>", "suite", "--authority", "<authority>", "--fixture", "<accepted-fixture>", "--oracle", "<validator-oracle>", "--proof-out", "<proof>", "--report-out", "<report>", "--bundle-out", "<bundle>"]
}
const validateMutationOperationSchema = (operation) => {
  const prefix = Object.hasOwn(operation, "document") ? ["document"] : []
  if (operation.op === "replace" || operation.op === "add") assertExactKeys(operation, [...prefix, "op", "pointer", "value"], "PROOF_KEYS", "mutation operation")
  else if (operation.op === "remove") assertExactKeys(operation, [...prefix, "op", "pointer"], "PROOF_KEYS", "mutation operation")
  else if (operation.op === "replace-derived") assertExactKeys(operation, ["derivation", "document", "op", "pointer"], "PROOF_KEYS", "mutation operation")
  else fail("PROOF_KEYS", "mutation operation tag differs")
}
const validateProofSchema = (proof, context = null) => {
  assertExactKeys(proof, ["proofVersion", "invocation", "suiteExpectedResult", "suiteActualResult", "suiteExpectedExitCode", "suiteActualExitCode", "bindings", "baseline", "positiveControls", "mutations", "cliAttacks", "safePathAttacks", "atomicWriteControl"], "PROOF_KEYS", "proof")
  requireValue(proof.proofVersion === "plan008-portable-validation-proof-v4" && sameJson(proof.invocation, portableInvocation), "PROOF_SEMANTICS", "proof version or invocation differs")
  requireValue(proof.suiteExpectedResult === "accept" && proof.suiteActualResult === "accept" && proof.suiteExpectedExitCode === 0 && proof.suiteActualExitCode === 0, "PROOF_SEMANTICS", "proof suite result differs")
  assertExactKeys(proof.bindings, ["authoritySha256", "fixtureSha256", "oracleSha256", "sources"], "PROOF_KEYS", "proof bindings")
  for (const source of proof.bindings.sources) assertExactKeys(source, ["sourceId", "repoRelativePath", "gitBlobSha", "sha256"], "PROOF_KEYS", "proof source binding")
  assertExactKeys(proof.baseline, ["expectedResult", "actualResult", "expectedExitCode", "actualExitCode", "derivedCounts", "derivedRoots", "resultSha256"], "PROOF_KEYS", "proof baseline")
  requireValue(proof.baseline.expectedResult === "accept" && proof.baseline.actualResult === "accept" && proof.baseline.expectedExitCode === 0 && proof.baseline.actualExitCode === 0, "PROOF_SEMANTICS", "baseline proof differs")
  for (const row of proof.positiveControls) {
    assertExactKeys(row, ["controlId", "expectedResult", "actualResult", "expectedExitCode", "actualExitCode", "observationSha256", "observations"], "PROOF_KEYS", "positive-control proof")
    requireValue(row.expectedResult === "accept" && row.actualResult === "accept" && row.expectedExitCode === 0 && row.actualExitCode === 0, "PROOF_SEMANTICS", "positive-control result differs")
    for (const observation of row.observations) {
      assertExactKeys(observation, ["assertion", "pass", "actual"], "PROOF_KEYS", "positive-control observation")
      if (observation.assertion.kind === "semantic-validator") assertExactKeys(observation.assertion, ["kind", "targetId"], "PROOF_KEYS", "semantic assertion")
      else if (["pointer-equals", "pointer-includes", "pointer-excludes"].includes(observation.assertion.kind)) assertExactKeys(observation.assertion, ["expected", "kind", "pointer"], "PROOF_KEYS", "pointer assertion")
      else fail("PROOF_KEYS", "positive-control assertion tag differs")
      requireValue(observation.pass === true, "PROOF_SEMANTICS", "positive-control observation differs")
    }
  }
  for (const row of proof.mutations) {
    assertExactKeys(row, ["mutationId", "operations", "expectedResult", "actualResult", "expectedExitCode", "actualExitCode", "expectedValidatorId", "actualValidatorId", "mutatedAuthoritySha256", "mutatedFixtureSha256", "diagnostic", "diagnosticSha256"], "PROOF_KEYS", "mutation proof")
    row.operations.forEach(validateMutationOperationSchema)
    requireValue(row.expectedResult === "reject" && row.actualResult === "reject" && row.expectedExitCode === 1 && row.actualExitCode === 1 && row.expectedValidatorId === row.actualValidatorId, "PROOF_SEMANTICS", "mutation result differs")
  }
  for (const row of proof.cliAttacks) {
    assertExactKeys(row, ["caseId", "expectedResult", "actualResult", "expectedExitCode", "actualExitCode", "expectedValidatorId", "actualValidatorId", "protectedArtifactsUnchanged", "stdoutSha256", "stderrSha256", "envelopeSha256"], "PROOF_KEYS", "spawned CLI proof")
    requireValue(row.expectedResult === "reject" && row.actualResult === "reject" && row.expectedExitCode === 1 && row.actualExitCode === 1 && row.expectedValidatorId === row.actualValidatorId && row.protectedArtifactsUnchanged === true, "PROOF_SEMANTICS", "spawned CLI result differs")
  }
  for (const row of proof.safePathAttacks) {
    assertExactKeys(row, ["caseId", "expectedResult", "actualResult", "expectedExitCode", "actualExitCode", "expectedValidatorId", "actualValidatorId", "diagnosticSha256"], "PROOF_KEYS", "safe-path proof")
    requireValue(row.expectedResult === "reject" && row.actualResult === "reject" && row.expectedExitCode === 1 && row.actualExitCode === 1 && row.expectedValidatorId === row.actualValidatorId, "PROOF_SEMANTICS", "safe-path result differs")
  }
  assertExactKeys(proof.atomicWriteControl, ["caseId", "expectedResult", "actualResult", "expectedExitCode", "actualExitCode", "expectedHashes", "reopenedHashes"], "PROOF_KEYS", "atomic-write proof")
  assertExactKeys(proof.atomicWriteControl.expectedHashes, ["proof", "report", "bundle"], "PROOF_KEYS", "atomic expected hashes")
  assertExactKeys(proof.atomicWriteControl.reopenedHashes, ["proof", "report", "bundle"], "PROOF_KEYS", "atomic reopened hashes")
  requireValue(proof.atomicWriteControl.expectedResult === "accept" && proof.atomicWriteControl.actualResult === "accept" && proof.atomicWriteControl.expectedExitCode === 0 && proof.atomicWriteControl.actualExitCode === 0 && sameJson(proof.atomicWriteControl.expectedHashes, proof.atomicWriteControl.reopenedHashes), "PROOF_SEMANTICS", "atomic write control differs")
  if (context) {
    requireValue(sameJson(proof.bindings, context.bindings), "PROOF_BINDING", "proof bindings differ")
    requireValue(sameJson(proof.baseline.derivedCounts, context.counts) && sameJson(proof.baseline.derivedRoots, context.roots), "PROOF_BINDING", "proof baseline derivation differs")
  }
  requireValue(!/(?:\/mnt\/|\/home\/|\/tmp\/|file:\/\/)/u.test(JSON.stringify(proof)), "PRIVATE_PATH", "proof contains a private or absolute path")
}

const renderReport = ({ authoritySha256, fixtureSha256, oracleSha256, proofSha256, counts, positiveControls, mutations, cliAttacks, safePathAttacks, atomicWriteControl }) => [
  "# Plan 008 typed authority projection — portable executable closure",
  "",
  "Status: LOCAL VALIDATION PASS — AUDIT CANDIDATE. This is not an independent acceptance. Review mode is CODEX-only; human evidence is none; human participant count is 0; not-human-usability-tested is true.",
  "",
  "## Path-independent invocation",
  "",
  "Program `node`; working directory `discovered-git-root`; arguments `<validator> suite --authority <authority> --fixture <accepted-fixture> --oracle <validator-oracle> --proof-out <proof> --report-out <report> --bundle-out <bundle>`.",
  "",
  "Observed result: `accept`; exit `0`. Baseline accepted; " + positiveControls.filter((row) => row.actualResult === "accept").length + "/" + positiveControls.length + " positives accepted; " + mutations.filter((row) => row.actualValidatorId === row.expectedValidatorId && row.actualResult === "reject").length + "/" + mutations.length + " mutations, " + cliAttacks.filter((row) => row.actualValidatorId === row.expectedValidatorId).length + "/" + cliAttacks.length + " spawned CLI attacks, and " + safePathAttacks.filter((row) => row.actualValidatorId === row.expectedValidatorId).length + "/" + safePathAttacks.length + " safe-path attacks rejected as expected. Atomic staged writes reopened with " + (sameJson(atomicWriteControl.expectedHashes, atomicWriteControl.reopenedHashes) ? "matching" : "non-matching") + " hashes.",
  "",
  "## Immutable bindings",
  "",
  "- Authority SHA-256: `" + authoritySha256 + "`.",
  "- Accepted fixture SHA-256: `" + fixtureSha256 + "`.",
  "- Validator-owned oracle SHA-256: `" + oracleSha256 + "`.",
  "- Validation proof SHA-256: `" + proofSha256 + "`.",
  "- The canonical parent manifest binds the standalone validator independently, avoiding a validator/proof hash cycle.",
  "",
  "## Derived typed closure",
  "",
  "Routes " + counts.routeCount + " (" + counts.registryRouteCount + "+" + counts.spokeRouteCount + "); dimensions " + counts.dimensionCount + "; constraints " + counts.totalConstraintCount + " (" + counts.invalidCombinationConstraintCount + "+" + counts.globalTransitionRuleCount + "); machines " + counts.machineCount + "; states " + counts.machineStateCount + "; actions " + counts.actionCount + "; events " + counts.eventCount + "; outcomes " + counts.outcomeCount + "; edges " + counts.edgeCount + "; interpretations " + counts.interpretationCount + ". Counts were derived during validation.",
  "",
  "## Repaired trust and semantic closure",
  "",
  "- Sources contain Git-root-relative paths only. The validator discovers the Git root, rejects traversal/absolute/symlink escape, and derives every clause range, slice, text, hash, kind, and route-family compatibility from exact source bytes.",
  "- Validator-owned pins prevent a co-edited fixture/hash/root/count from blessing changed authority. All authority objects are fail-closed by an immutable structural-shape root, with explicit tagged-union and transition-channel checks.",
  "- Superseded, retired, and corrected reference states remain availability-ready and distinct from withdrawn, with exact route-specific construction edges.",
  "- Question, hazard, and simulation failures/retries retain the required neutral draft/session identities and fields. Confirmation presentation/dismissal has deterministic state resolution.",
  "- Every invalid-combination operand resolves through the canonical snapshot schema; all nine constraints execute against legal/forbidden witnesses, states, and transition targets.",
  "- Post-render focus and announcement effects use a closed semantic-target union with effect IDs, after-render ordering, hidden-answer suppression, and exactly-once acknowledgement.",
  "- Offline pack update, verify, quarantine, failure, and activation retain distinct prior-active and candidate generations until atomic promotion.",
  "- The selected navigation program preserves all 11 ordered rules and evidence qualifications; M0-M5 and every route assignment are source-derived.",
  "- Plain state targets are legal on every emitting route, navigation outcomes cover every emitter domain, journey count derives from unique J01-J08, and implementation drift derives from exact live registry bytes.",
  "",
  "## Remaining limitations",
  "",
  "- Several source arrows omit provider-level action names or guard predicates; curated names remain interpretation records rather than quoted source wording.",
  "- The retained stale-print safety predicate remains unspecified and therefore guarded/disabled without implementation evidence.",
  "- Review-queue rebuild delegates ownership to Settings; exact UI composition remains an implementation choice.",
  "",
  "No human session, deployment, network write, or repository edit was performed.",
  ""
].join("\n")

const validateBundleSchema = (bundle) => {
  assertExactKeys(bundle, ["bundleVersion", "kind", "invocation", "artifacts", "sourceBindings"], "BUNDLE_KEYS", "bundle")
  requireValue(bundle.bundleVersion === "plan008-portable-authority-bundle-v4" && bundle.kind === "canonical-parent-manifest", "BUNDLE_EXACT", "bundle version or kind differs")
  assertExactKeys(bundle.invocation, ["kind", "program", "workingDirectory", "argv"], "BUNDLE_KEYS", "bundle invocation")
  requireValue(sameJson(bundle.invocation, portableInvocation), "BUNDLE_EXACT", "bundle invocation differs")
  assertExactKeys(bundle.artifacts, ["authority", "fixture", "oracle", "validator", "proof", "report"], "BUNDLE_KEYS", "bundle artifacts")
  for (const value of Object.values(bundle.artifacts)) assertExactKeys(value, ["logicalName", "sha256"], "BUNDLE_KEYS", "bundle artifact")
  for (const source of bundle.sourceBindings) assertExactKeys(source, ["sourceId", "repoRelativePath", "gitBlobSha", "sha256"], "BUNDLE_KEYS", "bundle source binding")
}
const buildExpectedBundle = ({ bindings, validatorSha256, proofSha256, reportSha256 }) => ({
  bundleVersion: "plan008-portable-authority-bundle-v4",
  kind: "canonical-parent-manifest",
  invocation: portableInvocation,
  artifacts: {
    authority: { logicalName: "authority", sha256: bindings.authoritySha256 },
    fixture: { logicalName: "accepted-fixture", sha256: bindings.fixtureSha256 },
    oracle: { logicalName: "validator-owned-oracle", sha256: bindings.oracleSha256 },
    validator: { logicalName: "standalone-validator", sha256: validatorSha256 },
    proof: { logicalName: "validation-proof", sha256: proofSha256 },
    report: { logicalName: "validation-report", sha256: reportSha256 }
  },
  sourceBindings: bindings.sources
})
const validateBundleExact = (bundle, expected) => {
  validateBundleSchema(bundle)
  requireValue(sameJson(bundle, expected), "BUNDLE_EXACT", "bundle differs from validator-constructed canonical parent")
}
const buildBindings = ({ authorityBytes, fixtureBytes, oracleBytes, oracle }) => ({
  authoritySha256: sha256(authorityBytes),
  fixtureSha256: sha256(fixtureBytes),
  oracleSha256: sha256(oracleBytes),
  sources: oracle.expected.sources.map(({ sourceId, repoRelativePath, gitBlobSha, sha256: sourceSha256 }) => ({ sourceId, repoRelativePath, gitBlobSha, sha256: sourceSha256 }))
})
const readReportBytes = (filePath) => {
  let bytes
  try { bytes = fs.readFileSync(filePath) } catch { fail("INPUT_FILE", "required input file is unavailable") }
  requireValue(!bytes.includes(13) && bytes.at(-1) === 10, "CANONICAL_REPORT", "report is not UTF-8 LF with final LF")
  let text
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes) } catch { fail("CANONICAL_REPORT", "report is not UTF-8") }
  requireValue(Buffer.from(text, "utf8").compare(bytes) === 0 && !/(?:\/mnt\/|\/home\/|\/tmp\/|file:\/\/)/u.test(text), "PRIVATE_PATH", "report contains a private or absolute path")
  return bytes
}
const preflightPaths = (options, gitRoot) => {
  const validator = describeExistingFile("validator", fileURLToPath(import.meta.url))
  const inputs = [
    ["authority", "authority"], ["fixture", "fixture"], ["oracle", "oracle"],
    ...(options.mode === "verify-bundle" ? [["proof", "proof"], ["report", "report"], ["bundle", "bundle"]] : [])
  ].map(([optionKey, role]) => describeExistingFile(role, options[optionKey]))
  const outputs = options.mode === "suite" ? [
    ["proof-out", "proof"], ["report-out", "report"], ["bundle-out", "bundle"]
  ].map(([optionKey, role]) => describeOutputFile(role, options[optionKey])) : []
  assertDistinctPaths([validator, ...inputs, ...outputs])
  const byRole = Object.fromEntries([...inputs, ...outputs].map((descriptor) => [descriptor.role, descriptor]))
  const oracleRead = readCanonicalJson(byRole.oracle.canonicalPath, "CANONICAL_ORACLE")
  if (!PINNED_ORACLE_SHA256.startsWith("__")) requireValue(sha256(oracleRead.bytes) === PINNED_ORACLE_SHA256, "PINNED_ORACLE", "oracle bytes differ from validator-owned pin")
  requireValue(Array.isArray(oracleRead.value?.expected?.sources) && typeof oracleRead.value?.implementationRegistry?.repoRelativePath === "string", "ORACLE_SCHEMA", "oracle source boundary differs")
  const sourceDescriptors = oracleRead.value.expected.sources.map((source) => describeExistingFile("source:" + source.sourceId, resolveSafeRepoFile(gitRoot, source.repoRelativePath)))
  const registryDescriptor = describeExistingFile("implementation-registry", resolveSafeRepoFile(gitRoot, oracleRead.value.implementationRegistry.repoRelativePath))
  assertDistinctPaths([validator, ...inputs, ...outputs, ...sourceDescriptors, registryDescriptor])
  return { validator, byRole, oracleRead, sourceDescriptors, registryDescriptor }
}

const main = () => {
  const options = parseArgs(process.argv.slice(2))
  const gitRoot = discoverGitRoot(process.cwd())
  const preflight = preflightPaths(options, gitRoot)
  const authorityRead = readCanonicalJson(preflight.byRole.authority.canonicalPath, "CANONICAL_AUTHORITY")
  const fixtureRead = readCanonicalJson(preflight.byRole.fixture.canonicalPath, "CANONICAL_FIXTURE")
  const oracleRead = preflight.oracleRead
  const authority = authorityRead.value
  const fixture = fixtureRead.value
  const oracle = oracleRead.value
  const validatorBytes = fs.readFileSync(preflight.validator.canonicalPath)
  const validatorSha256 = sha256(validatorBytes)
  validatePins(authorityRead.bytes, fixtureRead.bytes, oracleRead.bytes)
  const expectedAuthorityPin = PINNED_AUTHORITY_SHA256.startsWith("__") ? sha256(authorityRead.bytes) : PINNED_AUTHORITY_SHA256
  const expectedFixturePin = PINNED_FIXTURE_SHA256.startsWith("__") ? sha256(fixtureRead.bytes) : PINNED_FIXTURE_SHA256
  requireValue(oracle.acceptedAuthoritySha256 === expectedAuthorityPin && oracle.acceptedFixtureSha256 === expectedFixturePin, "ORACLE_BINDING", "oracle accepted input bindings differ")
  requireValue(fixture.acceptedAuthoritySha256 === expectedAuthorityPin, "FIXTURE_BINDING", "fixture authority binding differs")
  requireValue(canonicalHash(structuralShape(fixture)) === oracle.fixtureStructuralShapeSha256, "EXACT_FIXTURE_SHAPE", "fixture object/key shape differs")
  const baseline = validateAuthority(authority, oracle, gitRoot)
  const bindings = buildBindings({ authorityBytes: authorityRead.bytes, fixtureBytes: fixtureRead.bytes, oracleBytes: oracleRead.bytes, oracle })

  if (options.mode === "validate") {
    process.stdout.write(JSON.stringify({ result: "accept", exitCode: 0, authoritySha256: bindings.authoritySha256, fixtureSha256: bindings.fixtureSha256, oracleSha256: bindings.oracleSha256, validatorSha256, counts: baseline.counts }, null, 2) + "\n")
    return
  }

  if (options.mode === "verify-bundle") {
    const proofRead = readCanonicalJson(preflight.byRole.proof.canonicalPath, "CANONICAL_PROOF")
    const reportBytes = readReportBytes(preflight.byRole.report.canonicalPath)
    const bundleRead = readCanonicalJson(preflight.byRole.bundle.canonicalPath, "CANONICAL_BUNDLE")
    requireValue(!PINNED_PROOF_SHA256.startsWith("__") && sha256(proofRead.bytes) === PINNED_PROOF_SHA256, "PINNED_PROOF", "proof bytes differ from validator-owned pin")
    requireValue(!PINNED_REPORT_SHA256.startsWith("__") && sha256(reportBytes) === PINNED_REPORT_SHA256, "PINNED_REPORT", "report bytes differ from validator-owned pin")
    validateProofSchema(proofRead.value, { bindings, counts: baseline.counts, roots: baseline.roots })
    const proofSha256 = sha256(proofRead.bytes)
    const reportSha256 = sha256(reportBytes)
    const expectedBundle = buildExpectedBundle({ bindings, validatorSha256, proofSha256, reportSha256 })
    validateBundleExact(bundleRead.value, expectedBundle)
    const artifacts = { authority: bindings.authoritySha256, fixture: bindings.fixtureSha256, oracle: bindings.oracleSha256, validator: validatorSha256, proof: proofSha256, report: reportSha256 }
    process.stdout.write(JSON.stringify({ result: "accept", exitCode: 0, bundleSha256: sha256(bundleRead.bytes), artifacts }, null, 2) + "\n")
    return
  }

  const positiveControls = runPositiveControls(authority, fixture, { oracle, sourceRuntime: baseline.sourceRuntime })
  const mutations = runMutations(authority, fixture, oracle, gitRoot, fixtureRead.bytes, oracleRead.bytes)
  const cliAttacks = runSpawnedCliAttacks({ gitRoot, authorityPath: preflight.byRole.authority.canonicalPath, fixturePath: preflight.byRole.fixture.canonicalPath, oraclePath: preflight.byRole.oracle.canonicalPath })
  const safePathAttacks = runSafePathAttacks()
  const atomicWriteControl = runAtomicWriteControl()
  const positivesPass = positiveControls.every((row) => row.actualResult === "accept" && row.actualExitCode === 0)
  const mutationsPass = mutations.every((row) => row.actualResult === row.expectedResult && row.actualExitCode === row.expectedExitCode && row.actualValidatorId === row.expectedValidatorId)
  const cliPass = cliAttacks.every((row) => row.actualResult === "reject" && row.actualValidatorId === row.expectedValidatorId && row.actualExitCode === 1 && row.protectedArtifactsUnchanged)
  const safePathPass = safePathAttacks.every((row) => row.actualValidatorId === row.expectedValidatorId && row.actualExitCode === 1)
  const atomicPass = atomicWriteControl.actualResult === "accept" && sameJson(atomicWriteControl.expectedHashes, atomicWriteControl.reopenedHashes)
  const suitePass = positivesPass && mutationsPass && cliPass && safePathPass && atomicPass
  if (!mutationsPass) {
    const mismatch = mutations.find((row) => row.actualResult !== row.expectedResult || row.actualExitCode !== row.expectedExitCode || row.actualValidatorId !== row.expectedValidatorId)
    fail("SUITE_MUTATION_" + mismatch.mutationId + "_EXPECTED_" + mismatch.expectedValidatorId + "_ACTUAL_" + mismatch.actualValidatorId, "mutation result differs")
  }
  if (!positivesPass) fail("SUITE_POSITIVE", "positive-control result differs")
  if (!cliPass) fail("SUITE_CLI", "spawned CLI result differs")
  if (!safePathPass) fail("SUITE_SAFE_PATH", "safe-path result differs")
  if (!atomicPass) fail("SUITE_ATOMIC_WRITE", "atomic-write result differs")
  requireValue(suitePass, "SUITE_CASES", "one or more executable suite cases differ")
  const proof = {
    proofVersion: "plan008-portable-validation-proof-v4",
    invocation: portableInvocation,
    suiteExpectedResult: "accept",
    suiteActualResult: suitePass ? "accept" : "reject",
    suiteExpectedExitCode: 0,
    suiteActualExitCode: suitePass ? 0 : 1,
    bindings,
    baseline: { expectedResult: "accept", actualResult: "accept", expectedExitCode: 0, actualExitCode: 0, derivedCounts: baseline.counts, derivedRoots: baseline.roots, resultSha256: canonicalHash({ derivedCounts: baseline.counts, derivedRoots: baseline.roots }) },
    positiveControls,
    mutations,
    cliAttacks,
    safePathAttacks,
    atomicWriteControl
  }
  validateProofSchema(proof, { bindings, counts: baseline.counts, roots: baseline.roots })
  const proofBytes = canonicalBytes(proof)
  const proofSha256 = sha256(proofBytes)
  const report = renderReport({ ...bindings, proofSha256, counts: baseline.counts, positiveControls, mutations, cliAttacks, safePathAttacks, atomicWriteControl })
  const reportBytes = Buffer.from(report, "utf8")
  requireValue(!/(?:\/mnt\/|\/home\/|\/tmp\/|file:\/\/)/u.test(report), "PRIVATE_PATH", "report contains a private or absolute path")
  if (!PINNED_PROOF_SHA256.startsWith("__")) requireValue(proofSha256 === PINNED_PROOF_SHA256, "PINNED_PROOF", "generated proof differs from validator-owned pin")
  if (!PINNED_REPORT_SHA256.startsWith("__")) requireValue(sha256(reportBytes) === PINNED_REPORT_SHA256, "PINNED_REPORT", "generated report differs from validator-owned pin")
  const reportSha256 = sha256(reportBytes)
  const bundle = buildExpectedBundle({ bindings, validatorSha256, proofSha256, reportSha256 })
  validateBundleExact(bundle, bundle)
  const bundleBytes = canonicalBytes(bundle)
  const outputReopenHashes = atomicWriteAll([
    { role: "proof", descriptor: preflight.byRole.proof, bytes: proofBytes },
    { role: "report", descriptor: preflight.byRole.report, bytes: reportBytes },
    { role: "bundle", descriptor: preflight.byRole.bundle, bytes: bundleBytes }
  ])
  requireValue(sameJson(outputReopenHashes, { proof: proofSha256, report: reportSha256, bundle: sha256(bundleBytes) }), "OUTPUT_WRITE", "final output reopen hashes differ")
  process.stdout.write(JSON.stringify({
    result: "accept", exitCode: 0,
    authoritySha256: bindings.authoritySha256, fixtureSha256: bindings.fixtureSha256, oracleSha256: bindings.oracleSha256,
    validatorSha256, proofSha256, reportSha256, bundleSha256: sha256(bundleBytes), counts: baseline.counts,
    mutationPassCount: mutations.length, mutationCount: mutations.length,
    positivePassCount: positiveControls.filter((row) => row.actualResult === "accept").length, positiveCount: positiveControls.length,
    cliAttackPassCount: cliAttacks.filter((row) => row.actualValidatorId === row.expectedValidatorId).length, cliAttackCount: cliAttacks.length,
    safePathAttackPassCount: safePathAttacks.filter((row) => row.actualValidatorId === row.expectedValidatorId).length, safePathAttackCount: safePathAttacks.length,
    outputReopenHashes
  }, null, 2) + "\n")
}

try {
  main()
} catch (error) {
  const code = error instanceof ValidationFailure ? error.code : "VALIDATOR_DEFECT"
  process.stderr.write(JSON.stringify({ result: "reject", exitCode: 1, validatorId: code, message: "validation rejected" }) + "\n")
  process.exitCode = 1
}
