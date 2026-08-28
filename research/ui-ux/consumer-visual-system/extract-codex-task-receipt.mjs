#!/usr/bin/env node

import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { realpathSync, readFileSync, rmSync, statSync, writeFileSync, mkdirSync } from "node:fs"
import { mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import { dirname, isAbsolute, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { DatabaseSync } from "node:sqlite"

const SCHEMA_VERSION = "codex-task-safe-receipt-v2"
const AUTHENTICATION_STATUS = "unauthenticated-local-orchestration-summary"
const AUTHENTICATION_LIMITATION =
  "Local Codex state and rollout records are not cryptographic proof of task identity, timing, or cross-output non-observability; ordinary CI can validate only the committed receipt bytes and declared joins."
const PROVENANCE_CLASS = "native-codex-subagent-thread-spawn"
const SAFE_RECEIPT_HASH_ALGORITHM =
  "sha256(UTF-8 compact JSON.stringify of the ordered receipt payload excluding safeReceiptSha256)"
const MAX_PRE_START_ADJACENT_DELAY_MS = 1_000

const SHA_PATTERN = /^[0-9a-f]{40}$/u
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u
const TASK_PATH_PATTERN = /^\/root(?:\/[a-z0-9][a-z0-9_]{0,95})+$/u
const SAFE_ORIGINATOR_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,63}$/u

const fail = (code) => {
  const error = new Error(code)
  error.code = code
  throw error
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex")

const exactKeys = (value, keys, code) => {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    JSON.stringify(Object.keys(value)) !== JSON.stringify(keys)
  ) {
    fail(code)
  }
}

const parseJson = (text, code) => {
  try {
    return JSON.parse(text)
  } catch {
    fail(code)
  }
}

const canonicalDateTime = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)) {
    return false
  }
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value
}

const uuidV7Time = (value, code) => {
  if (!UUID_PATTERN.test(value) || value[14] !== "7") fail(code)
  const milliseconds = Number.parseInt(value.replaceAll("-", "").slice(0, 12), 16)
  if (!Number.isSafeInteger(milliseconds)) fail(code)
  return milliseconds
}

const toPortableRelativePath = (repositoryRoot, inputPath) => {
  const absolute = isAbsolute(inputPath)
    ? resolve(inputPath)
    : resolve(repositoryRoot, inputPath)
  let actual
  try {
    actual = realpathSync(absolute)
  } catch {
    fail("REPORT_NOT_READABLE")
  }
  if (actual !== absolute) fail("REPORT_SYMLINK_FORBIDDEN")
  const candidate = relative(repositoryRoot, actual)
  if (
    candidate === "" ||
    candidate === ".." ||
    candidate.startsWith(`..${sep}`) ||
    isAbsolute(candidate)
  ) {
    fail("REPORT_OUTSIDE_REPOSITORY")
  }
  const portable = candidate.split(sep).join("/")
  if (portable.split("/").includes("..") || !portable.endsWith(".json")) {
    fail("REPORT_PATH_INVALID")
  }
  return { absolute: actual, portable }
}

const forbiddenKey = (key) => {
  const normalized = key.toLowerCase().replaceAll(/[^a-z0-9]/gu, "")
  return new Set([
    "applicantid",
    "candidateid",
    "contact",
    "contactid",
    "cwd",
    "device",
    "deviceid",
    "devicename",
    "email",
    "emailaddress",
    "homedir",
    "host",
    "hostname",
    "ipaddress",
    "locator",
    "macaddress",
    "phone",
    "phonenumber",
    "privatelocator",
    "rollout",
    "rolloutpath",
    "statedb",
  ]).has(normalized)
}

const assertNoPrivateText = (text) => {
  if (typeof text !== "string") return
  const forbiddenPatterns = [
    /(?:^|[\s"'(])\/(?:home|Users|mnt|private\/var)\//u,
    /(?:^|[\s"'(])[A-Za-z]:\\/u,
    /(?:^|[\s"'(])\\\\[^\\\s]+\\/u,
    /file:\/\//iu,
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu,
    /\b(?:candidate|applicant)[ _-]?id\s*[:=]\s*[A-Za-z0-9_-]+/iu,
    /\b(?:[0-9A-F]{2}:){5}[0-9A-F]{2}\b/iu,
  ]
  if (forbiddenPatterns.some((pattern) => pattern.test(text))) fail("PRIVATE_VALUE_DETECTED")

  for (const match of text.matchAll(/https?:\/\/([^/\s"')\]}]+)/giu)) {
    const authority = match[1].replace(/^[^@]*@/u, "")
    const host = authority.startsWith("[")
      ? authority.slice(1, authority.indexOf("]"))
      : authority.split(":")[0]
    if (!new Set(["localhost", "127.0.0.1", "::1"]).has(host.toLowerCase())) {
      fail("NON_LOOPBACK_NETWORK_VALUE_DETECTED")
    }
  }

  for (const match of text.matchAll(/\b(?:\d{1,3}\.){3}\d{1,3}\b/gu)) {
    if (match[0] !== "127.0.0.1") fail("NON_LOOPBACK_NETWORK_VALUE_DETECTED")
  }
}

const assertNoPrivateValues = (value) => {
  const visit = (current) => {
    if (typeof current === "string") {
      assertNoPrivateText(current)
      return
    }
    if (Array.isArray(current)) {
      for (const item of current) visit(item)
      return
    }
    if (current === null || typeof current !== "object") return
    for (const [key, nested] of Object.entries(current)) {
      if (forbiddenKey(key)) fail("PRIVATE_KEY_DETECTED")
      visit(nested)
    }
  }
  visit(value)
}

const readRepositoryRoot = (cwd) => {
  try {
    return realpathSync(execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim())
  } catch {
    fail("REPOSITORY_ROOT_UNAVAILABLE")
  }
}

const readHead = (repositoryRoot) => {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: repositoryRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim()
  } catch {
    fail("REPOSITORY_HEAD_UNAVAILABLE")
  }
}

const parseRollout = (path) => {
  let text
  try {
    if (!statSync(path).isFile()) fail("ROLLOUT_NOT_FILE")
    text = readFileSync(path, "utf8")
  } catch (error) {
    if (error?.code === "ROLLOUT_NOT_FILE") throw error
    fail("ROLLOUT_NOT_READABLE")
  }
  if (text.length === 0 || !text.endsWith("\n")) fail("ROLLOUT_JSONL_INVALID")
  const records = []
  for (const line of text.slice(0, -1).split("\n")) {
    if (line.length === 0) fail("ROLLOUT_JSONL_INVALID")
    records.push(parseJson(line, "ROLLOUT_JSONL_INVALID"))
  }
  return records
}

const rawByteRecord = (source, bytes) => ({
  source,
  encoding: "base64",
  byteLength: bytes.length,
  sha256: sha256(bytes),
  bytesBase64: bytes.toString("base64"),
})

const extractReceipt = ({
  stateDbPath,
  rolloutPath,
  taskPath,
  reportInputPath,
  repositoryCommit,
  rawSpawnJson,
  repositoryRoot: repositoryRootOverride,
}) => {
  if (!TASK_PATH_PATTERN.test(taskPath) || taskPath.length > 1_024) fail("TASK_PATH_INVALID")
  if (!SHA_PATTERN.test(repositoryCommit)) fail("REPOSITORY_COMMIT_INVALID")

  const repositoryRoot = repositoryRootOverride ?? readRepositoryRoot(process.cwd())
  if (readHead(repositoryRoot) !== repositoryCommit) fail("REPOSITORY_COMMIT_NOT_HEAD")

  const reportLocation = toPortableRelativePath(repositoryRoot, reportInputPath)
  const reportBytes = readFileSync(reportLocation.absolute)
  const reportText = reportBytes.toString("utf8")
  if (!reportBytes.equals(Buffer.from(reportText, "utf8"))) fail("REPORT_UTF8_INVALID")
  const report = parseJson(reportText, "REPORT_JSON_INVALID")
  if (report === null || typeof report !== "object" || Array.isArray(report)) {
    fail("REPORT_JSON_INVALID")
  }
  if (report.taskPath !== taskPath) fail("REPORT_TASK_JOIN_FAILED")
  if (report.repositoryCommit !== repositoryCommit) fail("REPORT_COMMIT_JOIN_FAILED")
  const normalizedReportBytes = Buffer.from(`${JSON.stringify(report, null, 2)}\n`, "utf8")
  if (!reportBytes.equals(normalizedReportBytes)) fail("REPORT_NOT_NORMALIZED")

  const rawSpawnBytes = Buffer.from(rawSpawnJson, "utf8")
  if (!rawSpawnBytes.equals(Buffer.from(rawSpawnBytes.toString("utf8"), "utf8"))) {
    fail("RAW_SPAWN_UTF8_INVALID")
  }
  const rawSpawn = parseJson(rawSpawnJson, "RAW_SPAWN_JSON_INVALID")
  exactKeys(rawSpawn, ["task_name"], "RAW_SPAWN_SHAPE_INVALID")
  if (rawSpawn.task_name !== taskPath) fail("RAW_SPAWN_TASK_JOIN_FAILED")

  let stateDbReal
  let rolloutReal
  try {
    stateDbReal = realpathSync(resolve(stateDbPath))
    rolloutReal = realpathSync(resolve(rolloutPath))
    if (!statSync(stateDbReal).isFile() || !statSync(rolloutReal).isFile()) fail("LOCAL_INPUT_NOT_FILE")
  } catch (error) {
    if (error?.code === "LOCAL_INPUT_NOT_FILE") throw error
    fail("LOCAL_INPUT_NOT_READABLE")
  }

  let database
  let threadRows
  let edgeRows
  try {
    database = new DatabaseSync(stateDbReal, { readOnly: true })
    threadRows = database.prepare(`
      SELECT id, rollout_path, source, thread_source, agent_path, git_sha, created_at_ms
      FROM threads
      WHERE agent_path = ?
      ORDER BY created_at_ms
    `).all(taskPath)
    if (threadRows.length === 1) {
      edgeRows = database.prepare(`
        SELECT parent_thread_id, child_thread_id, status
        FROM thread_spawn_edges
        WHERE child_thread_id = ?
      `).all(threadRows[0].id)
    }
  } catch {
    fail("STATE_DB_SCHEMA_OR_READ_FAILED")
  } finally {
    try {
      database?.close()
    } catch {
      // The receipt must not depend on cleanup diagnostics.
    }
  }

  if (threadRows.length !== 1) fail("TASK_THREAD_CARDINALITY_FAILED")
  const thread = threadRows[0]
  if (thread.agent_path !== taskPath) fail("TASK_THREAD_JOIN_FAILED")
  if (thread.git_sha !== repositoryCommit) fail("THREAD_COMMIT_JOIN_FAILED")
  if (thread.thread_source !== "subagent") fail("THREAD_SOURCE_INVALID")
  if (!UUID_PATTERN.test(thread.id)) fail("SESSION_UUID_INVALID")
  if (!Number.isSafeInteger(thread.created_at_ms)) fail("THREAD_CREATED_AT_INVALID")
  const sessionUuidTime = uuidV7Time(thread.id, "SESSION_UUID_INVALID")
  if (
    sessionUuidTime > thread.created_at_ms ||
    thread.created_at_ms - sessionUuidTime > MAX_PRE_START_ADJACENT_DELAY_MS
  ) {
    fail("SESSION_CREATED_AT_JOIN_FAILED")
  }
  let recordedRolloutReal
  try {
    recordedRolloutReal = realpathSync(thread.rollout_path)
  } catch {
    fail("DB_ROLLOUT_NOT_READABLE")
  }
  if (recordedRolloutReal !== rolloutReal) fail("ROLLOUT_PATH_JOIN_FAILED")

  const dbSource = parseJson(thread.source, "THREAD_PROVENANCE_INVALID")
  exactKeys(dbSource, ["subagent"], "THREAD_PROVENANCE_INVALID")
  exactKeys(dbSource.subagent, ["thread_spawn"], "THREAD_PROVENANCE_INVALID")
  const dbSpawn = dbSource.subagent.thread_spawn
  if (dbSpawn === null || typeof dbSpawn !== "object" || Array.isArray(dbSpawn)) {
    fail("THREAD_PROVENANCE_INVALID")
  }
  if (dbSpawn.agent_path !== taskPath || !UUID_PATTERN.test(dbSpawn.parent_thread_id)) {
    fail("THREAD_PROVENANCE_JOIN_FAILED")
  }
  if (!Number.isInteger(dbSpawn.depth) || dbSpawn.depth < 1 || dbSpawn.depth > 32) {
    fail("THREAD_DEPTH_INVALID")
  }

  if (edgeRows.length !== 1) fail("SPAWN_EDGE_CARDINALITY_FAILED")
  const edge = edgeRows[0]
  if (
    edge.child_thread_id !== thread.id ||
    edge.parent_thread_id !== dbSpawn.parent_thread_id ||
    typeof edge.status !== "string" ||
    edge.status.length === 0
  ) {
    fail("SPAWN_EDGE_JOIN_FAILED")
  }

  const records = parseRollout(rolloutReal)
  const matchingSessionMeta = records.filter(
    (record) => record?.type === "session_meta" && record?.payload?.id === thread.id,
  )
  if (matchingSessionMeta.length !== 1) fail("SESSION_META_CARDINALITY_FAILED")
  const sessionMeta = matchingSessionMeta[0]
  const meta = sessionMeta.payload
  const metaSpawn = meta?.source?.subagent?.thread_spawn
  if (
    meta.agent_path !== taskPath ||
    meta.id !== thread.id ||
    meta.thread_source !== "subagent" ||
    meta.parent_thread_id !== dbSpawn.parent_thread_id ||
    metaSpawn?.parent_thread_id !== dbSpawn.parent_thread_id ||
    metaSpawn?.agent_path !== taskPath ||
    metaSpawn?.depth !== dbSpawn.depth ||
    meta.git?.commit_hash !== repositoryCommit
  ) {
    fail("SESSION_META_JOIN_FAILED")
  }
  if (!SAFE_ORIGINATOR_PATTERN.test(meta.originator)) fail("ORIGINATOR_INVALID")
  const sessionMetaEventTimestamp = sessionMeta.timestamp
  if (!canonicalDateTime(sessionMetaEventTimestamp)) fail("SESSION_META_TIMESTAMP_INVALID")
  const sessionMetaTime = Date.parse(sessionMetaEventTimestamp)
  if (
    thread.created_at_ms > sessionMetaTime ||
    sessionMetaTime - thread.created_at_ms > MAX_PRE_START_ADJACENT_DELAY_MS
  ) {
    fail("SESSION_META_TIME_JOIN_FAILED")
  }

  const currentSessionEvents = records
    .map((record, index) => ({ record, index }))
    .filter(({ record }) => {
      if (record?.type !== "event_msg") return false
      if (!["task_started", "task_complete", "turn_aborted"].includes(record?.payload?.type)) return false
      const turnId = record?.payload?.turn_id
      if (!UUID_PATTERN.test(turnId) || turnId[14] !== "7") return false
      return uuidV7Time(turnId, "COMPLETION_TURN_ID_INVALID") >= sessionUuidTime
    })
  const starts = currentSessionEvents.filter(({ record }) => record.payload.type === "task_started")
  const completions = currentSessionEvents.filter(({ record }) => record.payload.type === "task_complete")
  const aborts = currentSessionEvents.filter(({ record }) => record.payload.type === "turn_aborted")
  if (starts.length !== 1 || completions.length !== 1 || aborts.length !== 0) {
    fail("CURRENT_TURN_CARDINALITY_FAILED")
  }
  const started = starts[0]
  const completed = completions[0]
  if (
    started.record.payload.turn_id !== completed.record.payload.turn_id ||
    records.indexOf(sessionMeta) >= started.index ||
    started.index >= completed.index
  ) {
    fail("CURRENT_TURN_JOIN_FAILED")
  }
  const completionTurnId = completed.record.payload.turn_id
  const taskStartEventTimestamp = started.record.timestamp
  if (!canonicalDateTime(taskStartEventTimestamp)) fail("TASK_START_TIMESTAMP_INVALID")
  const taskStartTime = Date.parse(taskStartEventTimestamp)
  if (
    sessionMetaTime > taskStartTime ||
    taskStartTime - sessionMetaTime > MAX_PRE_START_ADJACENT_DELAY_MS ||
    !Number.isInteger(started.record.payload.started_at) ||
    Math.floor(taskStartTime / 1_000) !== started.record.payload.started_at
  ) {
    fail("TASK_START_TIMESTAMP_JOIN_FAILED")
  }
  const completionTurnTime = uuidV7Time(completionTurnId, "COMPLETION_TURN_ID_INVALID")
  if (
    completionTurnTime > taskStartTime ||
    taskStartTime - completionTurnTime > MAX_PRE_START_ADJACENT_DELAY_MS
  ) {
    fail("TASK_START_TURN_TIME_JOIN_FAILED")
  }
  const completionEventTimestamp = completed.record.timestamp
  if (!canonicalDateTime(completionEventTimestamp)) fail("COMPLETION_TIMESTAMP_INVALID")
  const completionTime = Date.parse(completionEventTimestamp)
  if (
    taskStartTime >= completionTime ||
    !Number.isInteger(completed.record.payload.completed_at) ||
    Math.floor(completionTime / 1_000) !== completed.record.payload.completed_at
  ) {
    fail("COMPLETION_TIMESTAMP_JOIN_FAILED")
  }
  const completionMessage = completed.record.payload.last_agent_message
  if (typeof completionMessage !== "string" || completionMessage.length === 0) {
    fail("COMPLETION_MESSAGE_MISSING")
  }

  const assistantMessages = records
    .map((record, index) => ({ record, index }))
    .filter(({ record, index }) =>
      index > started.index &&
      index < completed.index &&
      record?.type === "response_item" &&
      record?.payload?.type === "message" &&
      record?.payload?.role === "assistant" &&
      record?.payload?.internal_chat_message_metadata_passthrough?.turn_id === completionTurnId,
    )
  if (assistantMessages.length === 0) fail("ASSISTANT_COMPLETION_MISSING")
  const lastAssistant = assistantMessages.at(-1).record.payload
  if (!Array.isArray(lastAssistant.content)) fail("ASSISTANT_COMPLETION_INVALID")
  const outputParts = lastAssistant.content
    .filter((part) => part?.type === "output_text")
    .map((part) => part.text)
  if (
    outputParts.length === 0 ||
    outputParts.some((part) => typeof part !== "string") ||
    outputParts.join("") !== completionMessage
  ) {
    fail("RAW_COMPLETION_EVENT_MISMATCH")
  }

  const completionJson = parseJson(completionMessage, "COMPLETION_MESSAGE_NOT_JSON")
  if (completionJson === null || typeof completionJson !== "object" || Array.isArray(completionJson)) {
    fail("COMPLETION_MESSAGE_NOT_JSON")
  }
  const completionNormalizedBytes = Buffer.from(`${JSON.stringify(completionJson, null, 2)}\n`, "utf8")
  if (!completionNormalizedBytes.equals(reportBytes)) fail("COMPLETION_REPORT_MISMATCH")

  assertNoPrivateValues(rawSpawn)
  assertNoPrivateValues(report)
  assertNoPrivateText(completionMessage)
  assertNoPrivateText(meta.originator)

  const completionBytes = Buffer.from(completionMessage, "utf8")
  const receiptPayload = {
    schemaVersion: SCHEMA_VERSION,
    authenticationStatus: AUTHENTICATION_STATUS,
    authenticationLimitation: AUTHENTICATION_LIMITATION,
    taskPath,
    sessionUuid: thread.id,
    parentThreadId: dbSpawn.parent_thread_id,
    provenanceClass: PROVENANCE_CLASS,
    threadSource: thread.thread_source,
    originator: meta.originator,
    depth: dbSpawn.depth,
    taskStartEventTimestamp,
    completionState: "completed",
    completionEventTimestamp,
    completionTurnId,
    completionMessageSha256: sha256(completionBytes),
    reportPath: reportLocation.portable,
    reportSha256: sha256(reportBytes),
    repositoryCommit,
    rawSpawn: rawByteRecord("caller-supplied-exposed-spawn-response", rawSpawnBytes),
    rawCompletion: rawByteRecord(
      "local-rollout-task_complete.last_agent_message",
      completionBytes,
    ),
    safeReceiptHashAlgorithm: SAFE_RECEIPT_HASH_ALGORITHM,
  }
  assertNoPrivateValues({
    ...receiptPayload,
    rawSpawn: { ...receiptPayload.rawSpawn, bytesBase64: "" },
    rawCompletion: { ...receiptPayload.rawCompletion, bytesBase64: "" },
  })
  return {
    ...receiptPayload,
    safeReceiptSha256: sha256(Buffer.from(JSON.stringify(receiptPayload), "utf8")),
  }
}

const parseArguments = (argv) => {
  if (argv.length === 1 && argv[0] === "--self-test") return { selfTest: true }
  const allowed = new Set([
    "--state-db",
    "--rollout",
    "--task-path",
    "--report",
    "--repository-commit",
    "--raw-spawn-json",
  ])
  if (argv.length !== allowed.size * 2) fail("ARGUMENT_SET_INVALID")
  const parsed = {}
  for (let index = 0; index < argv.length; index += 2) {
    const name = argv[index]
    const value = argv[index + 1]
    if (!allowed.has(name) || typeof value !== "string" || value.length === 0 || parsed[name] !== undefined) {
      fail("ARGUMENT_SET_INVALID")
    }
    parsed[name] = value
  }
  if ([...allowed].some((name) => parsed[name] === undefined)) fail("ARGUMENT_SET_INVALID")
  return {
    selfTest: false,
    stateDbPath: parsed["--state-db"],
    rolloutPath: parsed["--rollout"],
    taskPath: parsed["--task-path"],
    reportInputPath: parsed["--report"],
    repositoryCommit: parsed["--repository-commit"],
    rawSpawnJson: parsed["--raw-spawn-json"],
  }
}

const git = (repositoryRoot, args) => execFileSync("git", args, {
  cwd: repositoryRoot,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
}).trim()

const makeSyntheticFixture = (root, mutation = "none") => {
  const repositoryRoot = resolve(root, "repository")
  mkdirSync(repositoryRoot, { recursive: true })
  git(repositoryRoot, ["init", "--quiet"])
  git(repositoryRoot, ["config", "user.name", "Synthetic Receipt Test"])
  git(repositoryRoot, ["config", "user.email", "synthetic-receipt@example.invalid"])
  writeFileSync(resolve(repositoryRoot, "anchor.txt"), "synthetic\n")
  git(repositoryRoot, ["add", "anchor.txt"])
  git(repositoryRoot, ["commit", "--quiet", "-m", "synthetic receipt fixture"])
  const repositoryCommit = git(repositoryRoot, ["rev-parse", "HEAD"])

  const taskPath = "/root/synthetic_parent/synthetic_receipt_lane"
  const sessionUuid = "0190abcd-0000-7000-8000-000000000001"
  const secondSessionUuid = "0190abcd-0000-7000-8000-000000000002"
  const parentThreadId = "0190abcc-ffff-7000-8000-000000000001"
  const wrongParentThreadId = "0190abcc-ffff-7000-8000-000000000002"
  const turnId = "0190abcd-0001-7000-8000-000000000001"
  const secondTurnId = "0190abcd-0002-7000-8000-000000000001"
  const sessionCreatedAt = uuidV7Time(sessionUuid, "SYNTHETIC_UUID_INVALID")
  let databaseCreatedAt = sessionCreatedAt
  let sessionMetaTimestampMs = sessionCreatedAt
  let taskStartTimestampMs = sessionCreatedAt + 1
  if (mutation === "positive-db-insertion-delay-3ms") {
    databaseCreatedAt = sessionCreatedAt + 3
    sessionMetaTimestampMs = sessionCreatedAt + 3
    taskStartTimestampMs = sessionCreatedAt + 4
  } else if (mutation === "db-before-uuid") {
    databaseCreatedAt = sessionCreatedAt - 1
  } else if (mutation === "db-delay-over-bound") {
    databaseCreatedAt = sessionCreatedAt + MAX_PRE_START_ADJACENT_DELAY_MS + 1
    sessionMetaTimestampMs = databaseCreatedAt
    taskStartTimestampMs = databaseCreatedAt + 1
  } else if (mutation === "session-meta-before-db") {
    databaseCreatedAt = sessionCreatedAt + 3
    sessionMetaTimestampMs = sessionCreatedAt + 2
    taskStartTimestampMs = sessionCreatedAt + 4
  } else if (mutation === "session-meta-delay-over-bound") {
    sessionMetaTimestampMs = sessionCreatedAt + MAX_PRE_START_ADJACENT_DELAY_MS + 1
    taskStartTimestampMs = sessionMetaTimestampMs + 1
  } else if (mutation === "task-start-before-session-meta") {
    sessionMetaTimestampMs = sessionCreatedAt + 5
    taskStartTimestampMs = sessionCreatedAt + 4
  } else if (mutation === "task-start-delay-over-bound") {
    taskStartTimestampMs = sessionCreatedAt + MAX_PRE_START_ADJACENT_DELAY_MS + 1
  }
  const completionTimestampMs = mutation === "task-start-not-before-completion"
    ? taskStartTimestampMs
    : sessionCreatedAt + 2_000
  const completionTimestamp = new Date(completionTimestampMs).toISOString()
  const taskStartEventTimestampMs = taskStartTimestampMs
  const sessionMetaTimestamp = mutation === "session-meta-timestamp-invalid"
    ? "not-a-timestamp"
    : new Date(sessionMetaTimestampMs).toISOString()
  const taskStartTimestamp = mutation === "task-start-timestamp-invalid"
    ? "not-a-timestamp"
    : new Date(taskStartEventTimestampMs).toISOString()
  const activeTurnId = mutation === "task-start-turn-time-after-event"
    ? "0190abcd-0100-7000-8000-000000000001"
    : turnId
  const report = {
    schemaVersion: 2,
    taskPath,
    repositoryCommit,
    result: "synthetic-pass",
  }
  if (mutation === "private-value") report.operatorContact = "private@example.invalid"
  if (mutation === "report-task") report.taskPath = "/root/synthetic_parent/retargeted_lane"
  if (mutation === "report-commit") report.repositoryCommit = "f".repeat(40)
  const completionMessage = JSON.stringify(report)
  const reportPath = resolve(repositoryRoot, "research", "synthetic-review.json")
  mkdirSync(dirname(reportPath), { recursive: true })
  const reportBytes = mutation === "report-mismatch"
    ? Buffer.from(`${JSON.stringify({ ...report, result: "different" }, null, 2)}\n`, "utf8")
    : Buffer.from(`${JSON.stringify(report, null, 2)}\n`, "utf8")
  writeFileSync(reportPath, reportBytes)

  const source = {
    subagent: {
      thread_spawn: {
        parent_thread_id: parentThreadId,
        depth: 1,
        agent_path: taskPath,
        agent_nickname: "Synthetic",
        agent_role: null,
      },
    },
  }
  const rolloutPath = resolve(root, "synthetic-rollout.jsonl")
  const records = [
    {
      timestamp: sessionMetaTimestamp,
      type: "session_meta",
      payload: {
        id: mutation === "session-mismatch" ? secondSessionUuid : sessionUuid,
        source,
        originator: "codex_exec",
        thread_source: "subagent",
        agent_path: taskPath,
        parent_thread_id: parentThreadId,
        git: { commit_hash: repositoryCommit },
      },
    },
    {
      timestamp: taskStartTimestamp,
      type: "event_msg",
      payload: {
        type: "task_started",
        turn_id: mutation === "task-start-turn-mismatch" ? secondTurnId : activeTurnId,
        started_at: mutation === "task-start-seconds-mismatch"
          ? Math.floor(taskStartEventTimestampMs / 1_000) + 1
          : Math.floor(taskStartEventTimestampMs / 1_000),
      },
    },
    {
      timestamp: new Date(sessionCreatedAt + 1_500).toISOString(),
      type: "response_item",
      payload: {
        type: "message",
        role: "assistant",
        internal_chat_message_metadata_passthrough: { turn_id: activeTurnId },
        content: [{ type: "output_text", text: mutation === "raw-mismatch" ? "{}" : completionMessage }],
      },
    },
  ]
  if (mutation !== "incomplete-turn") {
    records.push({
      timestamp: completionTimestamp,
      type: "event_msg",
      payload: {
        type: "task_complete",
        turn_id: activeTurnId,
        completed_at: Math.floor(Date.parse(completionTimestamp) / 1000),
        last_agent_message: completionMessage,
      },
    })
  }
  if (mutation === "multiple-turns") {
    const secondCompletionTimestamp = new Date(sessionCreatedAt + 4_000).toISOString()
    records.push(
      {
        timestamp: new Date(sessionCreatedAt + 3_000).toISOString(),
        type: "event_msg",
        payload: { type: "task_started", turn_id: secondTurnId },
      },
      {
        timestamp: new Date(sessionCreatedAt + 3_500).toISOString(),
        type: "response_item",
        payload: {
          type: "message",
          role: "assistant",
          internal_chat_message_metadata_passthrough: { turn_id: secondTurnId },
          content: [{ type: "output_text", text: completionMessage }],
        },
      },
      {
        timestamp: secondCompletionTimestamp,
        type: "event_msg",
        payload: {
          type: "task_complete",
          turn_id: secondTurnId,
          completed_at: Math.floor(Date.parse(secondCompletionTimestamp) / 1000),
          last_agent_message: completionMessage,
        },
      },
    )
  }
  writeFileSync(rolloutPath, `${records.map((record) => JSON.stringify(record)).join("\n")}\n`)

  const stateDbPath = resolve(root, "synthetic-state.sqlite")
  const database = new DatabaseSync(stateDbPath)
  database.exec(`
    CREATE TABLE threads (
      id TEXT PRIMARY KEY,
      rollout_path TEXT NOT NULL,
      source TEXT NOT NULL,
      thread_source TEXT NOT NULL,
      agent_path TEXT,
      git_sha TEXT,
      created_at_ms INTEGER
    );
    CREATE TABLE thread_spawn_edges (
      parent_thread_id TEXT NOT NULL,
      child_thread_id TEXT NOT NULL PRIMARY KEY,
      status TEXT NOT NULL
    );
  `)
  const dbRolloutPath = mutation === "rollout-join" ? resolve(root, "missing-rollout.jsonl") : rolloutPath
  database.prepare(`
    INSERT INTO threads (id, rollout_path, source, thread_source, agent_path, git_sha, created_at_ms)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(sessionUuid, dbRolloutPath, JSON.stringify(source), "subagent", taskPath, repositoryCommit, databaseCreatedAt)
  if (mutation === "duplicate-task") {
    database.prepare(`
      INSERT INTO threads (id, rollout_path, source, thread_source, agent_path, git_sha, created_at_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(secondSessionUuid, rolloutPath, JSON.stringify(source), "subagent", taskPath, repositoryCommit, uuidV7Time(secondSessionUuid, "SYNTHETIC_UUID_INVALID"))
  }
  database.prepare(`
    INSERT INTO thread_spawn_edges (parent_thread_id, child_thread_id, status)
    VALUES (?, ?, ?)
  `).run(mutation === "wrong-parent" ? wrongParentThreadId : parentThreadId, sessionUuid, "open")
  database.close()

  return {
    stateDbPath,
    rolloutPath,
    taskPath,
    reportInputPath: reportPath,
    repositoryCommit: mutation === "retargeted-commit" ? "0".repeat(40) : repositoryCommit,
    rawSpawnJson: JSON.stringify({ task_name: mutation === "raw-spawn-task" ? "/root/synthetic_parent/retargeted_lane" : taskPath }),
    repositoryRoot,
  }
}

const runSelfTest = async () => {
  const root = await mkdtemp(resolve(tmpdir(), "codex-safe-receipt-self-test-"))
  const negativeCases = [
    "db-before-uuid",
    "db-delay-over-bound",
    "duplicate-task",
    "incomplete-turn",
    "multiple-turns",
    "private-value",
    "raw-mismatch",
    "raw-spawn-task",
    "report-commit",
    "report-mismatch",
    "report-task",
    "retargeted-commit",
    "rollout-join",
    "session-meta-before-db",
    "session-meta-delay-over-bound",
    "session-meta-timestamp-invalid",
    "session-mismatch",
    "task-start-before-session-meta",
    "task-start-delay-over-bound",
    "task-start-not-before-completion",
    "task-start-seconds-mismatch",
    "task-start-timestamp-invalid",
    "task-start-turn-mismatch",
    "task-start-turn-time-after-event",
    "wrong-parent",
  ]
  const expectedTimingFailureCodes = new Map([
    ["db-before-uuid", "SESSION_CREATED_AT_JOIN_FAILED"],
    ["db-delay-over-bound", "SESSION_CREATED_AT_JOIN_FAILED"],
    ["session-meta-before-db", "SESSION_META_TIME_JOIN_FAILED"],
    ["session-meta-delay-over-bound", "SESSION_META_TIME_JOIN_FAILED"],
    ["session-meta-timestamp-invalid", "SESSION_META_TIMESTAMP_INVALID"],
    ["task-start-before-session-meta", "TASK_START_TIMESTAMP_JOIN_FAILED"],
    ["task-start-delay-over-bound", "TASK_START_TIMESTAMP_JOIN_FAILED"],
    ["task-start-not-before-completion", "COMPLETION_TIMESTAMP_JOIN_FAILED"],
    ["task-start-seconds-mismatch", "TASK_START_TIMESTAMP_JOIN_FAILED"],
    ["task-start-timestamp-invalid", "TASK_START_TIMESTAMP_INVALID"],
    ["task-start-turn-mismatch", "CURRENT_TURN_JOIN_FAILED"],
    ["task-start-turn-time-after-event", "TASK_START_TURN_TIME_JOIN_FAILED"],
  ])
  try {
    const positiveRoot = resolve(root, "positive")
    const receipt = extractReceipt(makeSyntheticFixture(positiveRoot))
    const delayedReceipt = extractReceipt(makeSyntheticFixture(
      resolve(root, "positive-db-insertion-delay-3ms"),
      "positive-db-insertion-delay-3ms",
    ))
    const payload = Object.fromEntries(
      Object.entries(receipt).filter(([key]) => key !== "safeReceiptSha256"),
    )
    if (
      receipt.schemaVersion !== SCHEMA_VERSION ||
      receipt.authenticationStatus !== AUTHENTICATION_STATUS ||
      receipt.safeReceiptSha256 !== sha256(Buffer.from(JSON.stringify(payload), "utf8")) ||
      receipt.completionMessageSha256 !== receipt.rawCompletion.sha256 ||
      !canonicalDateTime(receipt.taskStartEventTimestamp) ||
      !canonicalDateTime(delayedReceipt.taskStartEventTimestamp) ||
      Date.parse(delayedReceipt.taskStartEventTimestamp) - uuidV7Time(delayedReceipt.sessionUuid, "SELF_TEST_UUID_INVALID") !== 4
    ) {
      fail("SELF_TEST_POSITIVE_FAILED")
    }

    for (const mutation of negativeCases) {
      let rejected = false
      try {
        extractReceipt(makeSyntheticFixture(resolve(root, mutation), mutation))
      } catch (error) {
        rejected = true
        const expectedCode = expectedTimingFailureCodes.get(mutation)
        if (expectedCode !== undefined && error?.code !== expectedCode) {
          fail("SELF_TEST_NEGATIVE_WRONG_GATE")
        }
      }
      if (!rejected) fail("SELF_TEST_NEGATIVE_FAILED")
    }
    return {
      schemaVersion: "codex-task-safe-receipt-extractor-self-test-v1",
      status: "passed",
      positiveCases: 2,
      negativeCases: negativeCases.length,
    }
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

const main = async () => {
  const parsed = parseArguments(process.argv.slice(2))
  const output = parsed.selfTest ? await runSelfTest() : extractReceipt(parsed)
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`)
}

const isMain = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  main().catch((error) => {
    const safeCode = typeof error?.code === "string" && /^[A-Z0-9_]+$/u.test(error.code)
      ? error.code
      : "EXTRACTION_FAILED"
    process.stderr.write(`extract-codex-task-receipt: ${safeCode}\n`)
    process.exitCode = 1
  })
}
