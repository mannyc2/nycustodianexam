#!/usr/bin/env node
// Retained validator for the Plan 004 consumer-language study.
//
// Node built-ins only. `child_process` is used solely for argument-array `git`
// and `gh` reads; no argument is ever passed through a shell. The validator
// never writes outside the single private prototype manifest supplied on the
// command line, and never uploads anything.
//
// Phases:
//   --phase=approval-channel  bind the aggregate to this branch's open draft PR
//   --phase=prototype-set     freeze one round's eight prototypes (only write mode)
//   --phase=operations        prove operator authorization for a round
//   --phase=round-one         prove complete, bound round-one evidence
//   --phase=round-two         prove both rounds and every critical retest
//   --phase=decision          prove the owner decision is bound to the tested R2 set
//   --phase=final             prove product/CONTENT_DESIGN.md matches that decision

import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import {
  closeSync,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  readdirSync,
  readSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync
} from "node:fs"
import { dirname, isAbsolute, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

// ---------------------------------------------------------------------------
// Locked constants
// ---------------------------------------------------------------------------

const TOOL = "consumer-language-study"
const MANIFEST_SCHEMA = "consumer-language-prototypes-v1"
const NORMALIZATION = "utf8-nfc-lf-single-final-newline-v1"
const AGGREGATE_SCHEMA = "consumer-language-study-v1"
const BRANCH = "codex/uiux-consumer-language"
const BASE_REF = "main"

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..")
const AGGREGATE_PATH = join(
  REPO_ROOT,
  "research/ui-ux/consumer-language-study-2026-08-26.json"
)
const CONTRACT_PATH = join(REPO_ROOT, "product/CONTENT_DESIGN.md")

/** Locked prototype order. The manifest and aggregate must repeat it exactly. */
const PROTOTYPES = [
  { id: "home", filename: "home.html" },
  { id: "profile", filename: "profile.html" },
  { id: "practice-start", filename: "practice-start.html" },
  { id: "question-feedback", filename: "question-feedback.html" },
  { id: "hazard-feedback", filename: "hazard-feedback.html" },
  { id: "review", filename: "review.html" },
  { id: "offline-data", filename: "offline-data.html" },
  { id: "trust-recovery", filename: "trust-recovery.html" }
]
const PROTOTYPE_IDS = PROTOTYPES.map((entry) => entry.id)
const PROTOTYPE_FILENAMES = new Map(
  PROTOTYPES.map((entry) => [entry.id, entry.filename])
)

/** Locked task order and the task-to-prototype relationship. */
const TASK_TO_PROTOTYPE = [
  ["proposition-recall", "home"],
  ["profile-fit", "profile"],
  ["practice-commitment", "practice-start"],
  ["feedback-evidence", "question-feedback"],
  ["hazard-feedback", "hazard-feedback"],
  ["review-meaning", "review"],
  ["offline-failure", "offline-data"],
  ["import-reset", "offline-data"],
  ["advanced-evidence", "trust-recovery"]
]
const TASK_IDS = TASK_TO_PROTOTYPE.map((entry) => entry[0])
const TASK_PROTOTYPE = new Map(TASK_TO_PROTOTYPE)

const SHARED_OPERATIONS = [
  "recruitment",
  "outreach",
  "compensation",
  "recording",
  "private-data-retention"
]
/** Operations whose action is actually used and therefore must be allowed. */
const REQUIRED_ALLOWED_OPERATIONS = new Set([
  "recruitment",
  "outreach",
  "private-data-retention"
])

const MANIFEST_HEADER = [
  "round",
  "manifest_schema",
  "manifest_version",
  "normalization",
  "prototype_id",
  "filename",
  "prototype_version",
  "normalized_sha256",
  "manifest_sha256"
]

const OBSERVATION_HEADER = [
  "round",
  "study_id",
  "consent_status",
  "prototype_manifest_version",
  "prototype_manifest_sha256",
  "prototype_id",
  "prototype_version",
  "prototype_sha256",
  "task_id",
  "task_completed",
  "teachback_outcome",
  "unofficial_status_outcome",
  "advanced_evidence_outcome",
  "consequence_outcome",
  "security_interruption",
  "notes_code"
]

const ISSUE_HEADER = [
  "round",
  "issue_id",
  "study_id",
  "task_id",
  "severity",
  "occurrence",
  "retest_of_issue_id",
  "retest_outcome",
  "disposition"
]

const TASK_COMPLETED_VALUES = new Set(["complete", "partial", "failed"])
const OUTCOME_VALUES = new Set([
  "accurate",
  "partial",
  "incorrect",
  "not-applicable"
])
const SECURITY_VALUES = new Set(["none", "interrupted-excluded"])
const SEVERITY_VALUES = new Set(["critical", "high", "medium", "low"])
const OCCURRENCE_VALUES = new Set(["observed", "retest"])
const RETEST_OUTCOME_VALUES = new Set(["resolved", "persists", "inconclusive"])
const DISPOSITION_VALUES = new Set([
  "revised",
  "resolved",
  "persists",
  "invalid-evidence"
])

const OUTCOME_COLUMNS = [
  "teachback_outcome",
  "unofficial_status_outcome",
  "advanced_evidence_outcome",
  "consequence_outcome"
]

const PHASES = new Set([
  "approval-channel",
  "prototype-set",
  "operations",
  "round-one",
  "round-two",
  "decision",
  "final"
])

const HEX64 = /^[0-9a-f]{64}$/
const SHA40 = /^[0-9a-f]{40}$/
const ISO_DATE = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/
const GH_LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/
const PROTOTYPE_VERSION = /^CL-([1-9][0-9]*)$/

// ---------------------------------------------------------------------------
// Failure handling
// ---------------------------------------------------------------------------

class VerificationError extends Error {}

function fail(message) {
  throw new VerificationError(message)
}

function require_(condition, message) {
  if (!condition) fail(message)
}

// ---------------------------------------------------------------------------
// Argument parsing (fails closed)
// ---------------------------------------------------------------------------

const KNOWN_FLAGS = new Set([
  "phase",
  "round",
  "manifest-version",
  "prototype-root",
  "prototype-manifest",
  "observations",
  "issues"
])

function parseArgs(argv) {
  const seen = new Map()
  for (const raw of argv) {
    const match = /^--([a-z-]+)=(.*)$/.exec(raw)
    require_(match !== null, `unrecognized argument: ${raw}`)
    const [, key, value] = match
    require_(KNOWN_FLAGS.has(key), `unknown flag: --${key}`)
    require_(!seen.has(key), `duplicate flag: --${key}`)
    require_(value.length > 0, `empty value for --${key}`)
    seen.set(key, value)
  }
  return seen
}

function requireAbsolute(args, key) {
  const value = args.get(key)
  require_(value !== undefined, `missing required flag --${key}`)
  require_(isAbsolute(value), `--${key} must be an absolute path`)
  return value
}

function resolvePhasePlan(args) {
  const phase = args.get("phase")
  require_(phase !== undefined, "missing required flag --phase")
  require_(PHASES.has(phase), `unknown phase: ${phase}`)

  const plan = {
    phase,
    round: null,
    manifestVersion: null,
    prototypeRoot: null,
    prototypeManifest: null,
    observations: null,
    issues: null,
    /** Rounds whose frozen snapshot must be revalidated. */
    requiredRounds: [],
    needsMatrices: false
  }

  const needsPrototypePaths = phase !== "approval-channel"
  const needsMatrices = ["round-one", "round-two", "decision", "final"].includes(
    phase
  )

  if (phase === "prototype-set" || phase === "operations") {
    const round = args.get("round")
    require_(round !== undefined, `--round is required for --phase=${phase}`)
    require_(round === "R1" || round === "R2", "--round must be R1 or R2")
    plan.round = round
  } else {
    require_(
      !args.has("round"),
      `--round is not accepted for --phase=${phase}`
    )
  }

  if (phase === "prototype-set") {
    const version = args.get("manifest-version")
    require_(
      version !== undefined,
      "--manifest-version is required for --phase=prototype-set"
    )
    require_(
      manifestVersionPattern(plan.round).test(version),
      `--manifest-version must match CLM-${plan.round}-NNN`
    )
    plan.manifestVersion = version
  } else {
    require_(
      !args.has("manifest-version"),
      `--manifest-version is not accepted for --phase=${phase}`
    )
  }

  if (needsPrototypePaths) {
    plan.prototypeRoot = requireAbsolute(args, "prototype-root")
    plan.prototypeManifest = requireAbsolute(args, "prototype-manifest")
  } else {
    require_(
      !args.has("prototype-root") && !args.has("prototype-manifest"),
      "--phase=approval-channel does not read temporary research paths"
    )
  }

  if (needsMatrices) {
    plan.needsMatrices = true
    plan.observations = requireAbsolute(args, "observations")
    plan.issues = requireAbsolute(args, "issues")
  } else {
    require_(
      !args.has("observations") && !args.has("issues"),
      `--observations/--issues are not accepted for --phase=${phase}`
    )
  }

  if (phase === "prototype-set") {
    // The round being frozen plus every already-frozen earlier round.
    plan.requiredRounds = plan.round === "R1" ? ["R1"] : ["R1", "R2"]
  } else if (phase === "operations") {
    plan.requiredRounds = plan.round === "R1" ? ["R1"] : ["R1", "R2"]
  } else if (phase === "round-one") {
    plan.requiredRounds = ["R1"]
  } else if (needsMatrices) {
    plan.requiredRounds = ["R1", "R2"]
  }

  return plan
}

function manifestVersionPattern(round) {
  return new RegExp(`^CLM-${round}-[0-9]{3}$`)
}

function studyIdPattern(round) {
  return new RegExp(`^${round}-P[0-9]{2}$`)
}

// ---------------------------------------------------------------------------
// Hashing and normalization
// ---------------------------------------------------------------------------

function sha256Hex(input) {
  return createHash("sha256").update(input).digest("hex")
}

/**
 * Decode strict UTF-8 and apply the locked normalization:
 * reject BOM / NUL / invalid sequences, convert to NFC, convert CRLF and bare
 * CR to LF, strip terminal LF characters, append exactly one final LF.
 */
function normalizePrototypeBytes(buffer, label) {
  require_(buffer.length > 0, `${label} is empty`)
  require_(
    !(buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf),
    `${label} starts with a UTF-8 BOM`
  )
  require_(!buffer.includes(0x00), `${label} contains a NUL byte`)

  let text
  try {
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(
      buffer
    )
  } catch {
    fail(`${label} is not valid UTF-8`)
  }

  const nfc = text.normalize("NFC")
  const unixed = nfc.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const trimmed = unixed.replace(/\n+$/, "")
  require_(trimmed.length > 0, `${label} contains no content`)
  return Buffer.from(`${trimmed}\n`, "utf8")
}

/**
 * Build the round's canonical manifest serialization. The manifest hash field
 * is never part of the hashed bytes.
 */
function canonicalManifestSerialization(round, manifestVersion, rows) {
  const lines = [
    `schema=${MANIFEST_SCHEMA}`,
    `round=${round}`,
    `manifest_version=${manifestVersion}`,
    `normalization=${NORMALIZATION}`
  ]
  for (const proto of PROTOTYPES) {
    const row = rows.get(proto.id)
    require_(row !== undefined, `missing prototype ${proto.id} in ${round}`)
    lines.push(
      [proto.id, proto.filename, row.version, row.normalizedSha256].join("\t")
    )
  }
  return Buffer.from(`${lines.join("\n")}\n`, "utf8")
}

// ---------------------------------------------------------------------------
// Snapshot validation
// ---------------------------------------------------------------------------

function readRegularFileStrict(path, label) {
  const link = lstatSync(path, { throwIfNoEntry: false })
  require_(link !== undefined, `${label} does not exist`)
  require_(!link.isSymbolicLink(), `${label} is a symlink`)
  require_(link.isFile(), `${label} is not a regular file`)
  require_((link.mode & 0o222) === 0, `${label} is writable`)

  // Re-stat through the open descriptor so the bytes hashed are the bytes of
  // the file that passed the checks above.
  const fd = openSync(path, "r")
  try {
    const stat = fstatSync(fd)
    require_(stat.isFile(), `${label} is not a regular file`)
    require_((stat.mode & 0o222) === 0, `${label} is writable`)
    const buffer = Buffer.alloc(stat.size)
    let offset = 0
    while (offset < stat.size) {
      const read = readSync(fd, buffer, offset, stat.size - offset, offset)
      require_(read > 0, `${label} could not be read completely`)
      offset += read
    }
    return buffer
  } finally {
    closeSync(fd)
  }
}

/**
 * Validate one frozen round directory and return its recomputed coordinates.
 * Never trusts the manifest for hashes; always recomputes from bytes.
 */
function recomputeRoundSnapshot(prototypeRoot, round) {
  const dir = join(prototypeRoot, round)
  const dirStat = lstatSync(dir, { throwIfNoEntry: false })
  require_(dirStat !== undefined, `snapshot directory ${round} does not exist`)
  require_(!dirStat.isSymbolicLink(), `snapshot directory ${round} is a symlink`)
  require_(dirStat.isDirectory(), `snapshot path ${round} is not a directory`)
  require_(
    (dirStat.mode & 0o222) === 0,
    `snapshot directory ${round} is writable`
  )

  const entries = readdirSync(dir, { withFileTypes: true })
  const names = entries.map((entry) => entry.name).sort()
  const expected = PROTOTYPES.map((entry) => entry.filename).sort()
  require_(
    names.length === expected.length &&
      names.every((name, index) => name === expected[index]),
    `snapshot ${round} must contain exactly the eight locked prototype files; found: ${names.join(", ")}`
  )

  const rows = new Map()
  for (const proto of PROTOTYPES) {
    const path = join(dir, proto.filename)
    const label = `${round}/${proto.filename}`
    const raw = readRegularFileStrict(path, label)
    const normalized = normalizePrototypeBytes(raw, label)
    const text = normalized.toString("utf8")

    const idMatches = countExactLines(text, `<!-- Prototype ID: ${proto.id} -->`)
    require_(
      idMatches === 1,
      `${label} must declare exactly one "<!-- Prototype ID: ${proto.id} -->" line (found ${idMatches})`
    )
    const versionLines = text
      .split("\n")
      .filter((line) => /^<!-- Prototype version: CL-[0-9]+ -->$/.test(line))
    require_(
      versionLines.length === 1,
      `${label} must declare exactly one prototype version line (found ${versionLines.length})`
    )
    const version = /^<!-- Prototype version: (CL-[0-9]+) -->$/.exec(
      versionLines[0]
    )[1]
    require_(
      PROTOTYPE_VERSION.test(version),
      `${label} declares an invalid prototype version ${version}`
    )

    // The version marker lives inside the file, so bumping it always changes
    // the normalized bytes. Cross-round version rules therefore compare a
    // second hash taken over the content with that one line removed; only that
    // comparison can distinguish "the copy changed" from "only the label did".
    const contentOnly = text
      .split("\n")
      .filter((line) => !/^<!-- Prototype version: CL-[0-9]+ -->$/.test(line))
      .join("\n")

    rows.set(proto.id, {
      id: proto.id,
      filename: proto.filename,
      version,
      normalizedSha256: sha256Hex(normalized),
      contentSha256: sha256Hex(Buffer.from(contentOnly, "utf8"))
    })
  }
  return rows
}

function countExactLines(text, exact) {
  return text.split("\n").filter((line) => line === exact).length
}

// ---------------------------------------------------------------------------
// TSV reading
// ---------------------------------------------------------------------------

function readTsv(path, header, label) {
  const stat = statSync(path, { throwIfNoEntry: false })
  require_(stat !== undefined, `${label} does not exist at ${path}`)
  require_(stat.isFile(), `${label} is not a regular file`)
  const raw = readFileSync(path)
  require_(!raw.includes(0x00), `${label} contains a NUL byte`)
  let text
  try {
    text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(
      raw
    )
  } catch {
    fail(`${label} is not valid UTF-8`)
  }
  require_(!text.includes("\r"), `${label} must use LF line endings`)
  const lines = text.replace(/\n$/, "").split("\n")
  require_(lines.length >= 1, `${label} is empty`)
  require_(
    lines[0] === header.join("\t"),
    `${label} header must be exactly:\n${header.join("\t")}`
  )

  const rows = []
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index]
    if (line.length === 0) {
      fail(`${label} line ${index + 1} is blank`)
    }
    const fields = line.split("\t")
    require_(
      fields.length === header.length,
      `${label} line ${index + 1} has ${fields.length} fields; expected ${header.length}`
    )
    const row = { __line: index + 1 }
    header.forEach((name, position) => {
      const value = fields[position]
      require_(
        value.length > 0,
        `${label} line ${index + 1} has an empty ${name}`
      )
      row[name] = value
    })
    rows.push(row)
  }
  return { rows, sha256: sha256Hex(raw) }
}

// ---------------------------------------------------------------------------
// Private manifest
// ---------------------------------------------------------------------------

function readManifest(path) {
  const stat = statSync(path, { throwIfNoEntry: false })
  if (stat === undefined) {
    return { rows: [], byRound: new Map(), exists: false }
  }
  const { rows } = readTsv(path, MANIFEST_HEADER, "prototype manifest")
  const byRound = new Map()
  for (const row of rows) {
    require_(
      row.round === "R1" || row.round === "R2",
      `prototype manifest line ${row.__line} has an invalid round`
    )
    require_(
      row.manifest_schema === MANIFEST_SCHEMA,
      `prototype manifest line ${row.__line} has a foreign schema`
    )
    require_(
      row.normalization === NORMALIZATION,
      `prototype manifest line ${row.__line} has a foreign normalization`
    )
    require_(
      manifestVersionPattern(row.round).test(row.manifest_version),
      `prototype manifest line ${row.__line} has an invalid manifest version`
    )
    require_(
      HEX64.test(row.normalized_sha256),
      `prototype manifest line ${row.__line} has an invalid normalized hash`
    )
    require_(
      HEX64.test(row.manifest_sha256),
      `prototype manifest line ${row.__line} has an invalid manifest hash`
    )
    require_(
      PROTOTYPE_FILENAMES.get(row.prototype_id) === row.filename,
      `prototype manifest line ${row.__line} pairs ${row.prototype_id} with ${row.filename}`
    )
    require_(
      PROTOTYPE_VERSION.test(row.prototype_version),
      `prototype manifest line ${row.__line} has an invalid prototype version`
    )
    if (!byRound.has(row.round)) byRound.set(row.round, [])
    byRound.get(row.round).push(row)
  }

  for (const [round, roundRows] of byRound) {
    require_(
      roundRows.length === PROTOTYPES.length,
      `prototype manifest round ${round} must have exactly ${PROTOTYPES.length} rows`
    )
    roundRows.forEach((row, index) => {
      require_(
        row.prototype_id === PROTOTYPES[index].id,
        `prototype manifest round ${round} row ${index + 1} breaks the locked order`
      )
    })
    const versions = new Set(roundRows.map((row) => row.manifest_version))
    const hashes = new Set(roundRows.map((row) => row.manifest_sha256))
    require_(
      versions.size === 1 && hashes.size === 1,
      `prototype manifest round ${round} must repeat one manifest version and hash`
    )
  }

  return { rows, byRound, exists: true }
}

/** Verify the frozen bytes still match the recorded manifest rows. */
function assertManifestMatchesSnapshot(round, manifestRows, recomputed) {
  const manifestVersion = manifestRows[0].manifest_version
  for (const row of manifestRows) {
    const live = recomputed.get(row.prototype_id)
    require_(
      live !== undefined,
      `prototype ${row.prototype_id} is absent from the ${round} snapshot`
    )
    require_(
      live.version === row.prototype_version,
      `${round}/${row.filename} declares ${live.version} but the manifest records ${row.prototype_version}`
    )
    require_(
      live.normalizedSha256 === row.normalized_sha256,
      `${round}/${row.filename} changed after freezing`
    )
  }
  const canonical = canonicalManifestSerialization(
    round,
    manifestVersion,
    recomputed
  )
  const manifestSha = sha256Hex(canonical)
  require_(
    manifestSha === manifestRows[0].manifest_sha256,
    `${round} canonical manifest hash does not match the recorded manifest hash`
  )
  return { version: manifestVersion, sha256: manifestSha }
}

/**
 * Cross-round invariant: a prototype version is scoped to its prototype ID.
 * Unchanged copy keeps the same CL-N; changed copy needs a strictly larger N.
 * Reusing a version for changed copy, or bumping a version without changed
 * copy, fails. Comparison uses the content hash (version marker excluded)
 * because the marker itself is part of the file.
 */
function assertCrossRoundVersions(r1Rows, r2Rows) {
  for (const proto of PROTOTYPES) {
    const first = r1Rows.get(proto.id)
    const second = r2Rows.get(proto.id)
    require_(first !== undefined && second !== undefined, "missing round rows")
    const firstN = Number(PROTOTYPE_VERSION.exec(first.version)[1])
    const secondN = Number(PROTOTYPE_VERSION.exec(second.version)[1])
    if (first.contentSha256 === second.contentSha256) {
      require_(
        firstN === secondN,
        `${proto.id} has identical copy across rounds but changed version ${first.version} -> ${second.version}; a version bump must accompany a copy change`
      )
    } else {
      require_(
        secondN > firstN,
        `${proto.id} changed copy but its version did not increase (${first.version} -> ${second.version})`
      )
    }
  }
}

function writeManifestRound(path, existingRows, round, manifestVersion, rows) {
  const canonical = canonicalManifestSerialization(round, manifestVersion, rows)
  const manifestSha = sha256Hex(canonical)
  const lines = [MANIFEST_HEADER.join("\t")]
  for (const row of existingRows) {
    lines.push(MANIFEST_HEADER.map((name) => row[name]).join("\t"))
  }
  for (const proto of PROTOTYPES) {
    const row = rows.get(proto.id)
    lines.push(
      [
        round,
        MANIFEST_SCHEMA,
        manifestVersion,
        NORMALIZATION,
        proto.id,
        proto.filename,
        row.version,
        row.normalizedSha256,
        manifestSha
      ].join("\t")
    )
  }
  const body = `${lines.join("\n")}\n`
  const temporary = `${path}.${process.pid}.tmp`
  writeFileSync(temporary, body, { encoding: "utf8", mode: 0o600 })
  try {
    renameSync(temporary, path)
  } catch (error) {
    try {
      unlinkSync(temporary)
    } catch {
      /* the temporary file is already gone */
    }
    throw error
  }
  return { version: manifestVersion, sha256: manifestSha }
}

// ---------------------------------------------------------------------------
// Git and GitHub reads (argument arrays only; never a shell string)
// ---------------------------------------------------------------------------

function readProcess(command, args, label) {
  try {
    return execFileSync(command, args, {
      encoding: "utf8",
      cwd: REPO_ROOT,
      maxBuffer: 32 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"]
    })
  } catch (error) {
    const detail =
      typeof error?.stderr === "string" && error.stderr.trim().length > 0
        ? error.stderr.trim().split("\n")[0]
        : error?.message
    fail(`${label} failed: ${detail}`)
  }
}

function resolveRepositoryCoordinates() {
  const url = readProcess(
    "git",
    ["remote", "get-url", "origin"],
    "git remote get-url origin"
  ).trim()
  const match =
    /^(?:https:\/\/github\.com\/|git@github\.com:)([^/]+)\/(.+?)(?:\.git)?$/.exec(
      url
    )
  require_(match !== null, `origin is not a recognized GitHub remote: ${url}`)
  return { owner: match[1], repo: match[2] }
}

function ghJson(pathAndQuery, label) {
  const output = readProcess("gh", ["api", pathAndQuery], label)
  try {
    return JSON.parse(output)
  } catch {
    fail(`${label} did not return JSON`)
  }
}

function resolveDraftPullRequest(owner, repo) {
  const list = ghJson(
    `repos/${owner}/${repo}/pulls?state=open&head=${owner}:${BRANCH}&per_page=100`,
    "gh api pulls"
  )
  require_(
    Array.isArray(list) && list.length === 1,
    `expected exactly one open pull request from ${BRANCH}; found ${Array.isArray(list) ? list.length : "a non-list"}`
  )
  const pr = list[0]
  require_(pr.state === "open", "the pull request is not open")
  require_(pr.draft === true, "the pull request is not a draft")
  require_(
    pr.base?.ref === BASE_REF,
    `the pull request base is ${pr.base?.ref}, expected ${BASE_REF}`
  )
  require_(
    pr.head?.ref === BRANCH,
    `the pull request head is ${pr.head?.ref}, expected ${BRANCH}`
  )
  const expectedUrl = `https://github.com/${owner}/${repo}/pull/${pr.number}`
  require_(
    pr.html_url === expectedUrl,
    `the pull request URL ${pr.html_url} is not ${expectedUrl}`
  )
  return { number: pr.number, url: expectedUrl }
}

function loadIssueComments(owner, repo, number) {
  const comments = new Map()
  for (let page = 1; page <= 20; page += 1) {
    const batch = ghJson(
      `repos/${owner}/${repo}/issues/${number}/comments?per_page=100&page=${page}`,
      "gh api issue comments"
    )
    require_(Array.isArray(batch), "gh api issue comments did not return a list")
    for (const comment of batch) {
      const url = `https://github.com/${owner}/${repo}/pull/${number}#issuecomment-${comment.id}`
      comments.set(url, comment)
    }
    if (batch.length < 100) return comments
  }
  fail("the pull request has more comment pages than this validator will read")
}

/**
 * Resolve one durable approval artifact and prove it is an unedited comment by
 * the chartered owner whose exact UTF-8 body hashes to the recorded value.
 */
function resolveApproval(context, artifact, bodySha256, label) {
  require_(
    typeof artifact === "string",
    `${label} approvalArtifact must be a string`
  )
  const pattern = new RegExp(
    `^https://github\\.com/${escapeRegExp(context.owner)}/${escapeRegExp(context.repo)}/pull/${context.pr.number}#issuecomment-[0-9]+$`
  )
  require_(
    pattern.test(artifact),
    `${label} approvalArtifact must be a same-PR comment URL on pull ${context.pr.number}; got ${artifact}`
  )
  const comment = context.comments.get(artifact)
  require_(comment !== undefined, `${label} approvalArtifact does not resolve`)
  require_(
    comment.user?.login === context.owner_handle,
    `${label} was authored by ${comment.user?.login}, not the chartered owner ${context.owner_handle}`
  )
  require_(
    comment.created_at === comment.updated_at,
    `${label} was edited after posting`
  )
  require_(
    typeof comment.body === "string" && comment.body.length > 0,
    `${label} has an empty body`
  )
  require_(
    HEX64.test(bodySha256 ?? ""),
    `${label} approvalBodySha256 must be 64 lowercase hexadecimal characters`
  )
  const actual = sha256Hex(Buffer.from(comment.body, "utf8"))
  require_(
    actual === bodySha256,
    `${label} body hash ${actual} does not match the recorded ${bodySha256}`
  )
  return {
    comment,
    fields: parseStructuredBody(comment.body, label),
    createdDate: String(comment.created_at).slice(0, 10)
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Parse `key: value` lines, requiring each key to appear exactly once. */
function parseStructuredBody(body, label) {
  const fields = new Map()
  const duplicates = new Set()
  for (const rawLine of body.replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trim()
    if (line.length === 0) continue
    const match = /^([a-z][a-z0-9-]*):[ \t]*(.*)$/.exec(line)
    if (match === null) continue
    const [, key, value] = match
    if (fields.has(key)) duplicates.add(key)
    fields.set(key, value.trim())
  }
  return {
    get(key) {
      require_(!duplicates.has(key), `${label} repeats the "${key}" field`)
      const value = fields.get(key)
      require_(
        value !== undefined && value.length > 0,
        `${label} is missing the "${key}" field`
      )
      return value
    },
    has(key) {
      return fields.has(key)
    }
  }
}

// ---------------------------------------------------------------------------
// Aggregate record
// ---------------------------------------------------------------------------

function loadAggregate() {
  const stat = statSync(AGGREGATE_PATH, { throwIfNoEntry: false })
  require_(stat !== undefined, `aggregate record is missing at ${AGGREGATE_PATH}`)
  const raw = readFileSync(AGGREGATE_PATH, "utf8")
  let value
  try {
    value = JSON.parse(raw)
  } catch {
    fail("aggregate record is not valid JSON")
  }
  require_(
    value.schemaVersion === AGGREGATE_SCHEMA,
    `aggregate schemaVersion must be ${AGGREGATE_SCHEMA}`
  )
  require_(
    SHA40.test(value.plannedAtSha ?? ""),
    "aggregate plannedAtSha must be a full 40-character SHA"
  )
  require_(
    SHA40.test(value.executionBaseSha ?? ""),
    "aggregate executionBaseSha must be a full 40-character SHA"
  )
  requireExactList(value.prototypeIds, PROTOTYPE_IDS, "aggregate prototypeIds")
  requireExactList(value.taskIds, TASK_IDS, "aggregate taskIds")

  const owner = value.decisionOwner
  require_(
    owner !== null && typeof owner === "object" && !Array.isArray(owner),
    "aggregate decisionOwner must be an object"
  )
  requireExactKeys(
    owner,
    ["identity", "githubHandle", "role", "approvalChannel"],
    "aggregate decisionOwner"
  )
  for (const key of ["identity", "githubHandle", "role", "approvalChannel"]) {
    require_(
      typeof owner[key] === "string" && owner[key].trim().length > 0,
      `aggregate decisionOwner.${key} must be a non-empty string`
    )
  }
  require_(
    GH_LOGIN.test(owner.githubHandle),
    "aggregate decisionOwner.githubHandle is not a valid GitHub login"
  )
  require_(
    Array.isArray(value.operationsApproval),
    "aggregate operationsApproval must be an array"
  )
  require_(Array.isArray(value.rounds), "aggregate rounds must be an array")
  require_(
    Array.isArray(value.issueSummaries),
    "aggregate issueSummaries must be an array"
  )
  require_(
    value.evidenceValidation !== null &&
      typeof value.evidenceValidation === "object",
    "aggregate evidenceValidation must be an object"
  )
  require_(
    value.decision !== null && typeof value.decision === "object",
    "aggregate decision must be an object"
  )

  // Nothing participant-level may ever be retained here.
  assertNoParticipantData(raw)
  return value
}

function requireExactList(actual, expected, label) {
  require_(Array.isArray(actual), `${label} must be an array`)
  require_(
    actual.length === expected.length &&
      actual.every((value, index) => value === expected[index]),
    `${label} must be exactly: ${expected.join(", ")}`
  )
}

function requireExactKeys(object, expected, label) {
  const actual = Object.keys(object).sort()
  const wanted = [...expected].sort()
  require_(
    actual.length === wanted.length &&
      actual.every((key, index) => key === wanted[index]),
    `${label} must have exactly these fields: ${wanted.join(", ")}`
  )
}

/**
 * The tracked aggregate carries counts and cryptographic coordinates only.
 * Participant rows, contact data, raw notes, and prototype HTML are rejected.
 */
function assertNoParticipantData(raw) {
  // Deliberately narrow. Long hexadecimal runs are legitimate coordinates here,
  // so a bare digit sequence is not evidence of a telephone number; only
  // separator-formatted or internationally prefixed numbers are.
  const forbidden = [
    [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, "an email address"],
    [/\b(?:R[12]-P[0-9]{2})\b/, "a participant study ID"],
    [/<\s*(?:html|body|section|div|p|h[1-6])\b/i, "prototype HTML"],
    [/\+[0-9][0-9().\- ]{7,}[0-9]/, "an international telephone number"],
    [
      /(?<![0-9-])\(?[0-9]{3}\)?[.\- ][0-9]{3}[.\- ][0-9]{4}(?![0-9-])/,
      "a telephone number"
    ]
  ]
  for (const [pattern, description] of forbidden) {
    require_(
      !pattern.test(raw),
      `aggregate record contains ${description}; it must stay de-identified`
    )
  }
}

// ---------------------------------------------------------------------------
// Matrix validation
// ---------------------------------------------------------------------------

function validateObservations(rows, rounds, manifests) {
  const perRound = new Map()
  for (const round of rounds) perRound.set(round, new Map())

  for (const row of rows) {
    const where = `observation line ${row.__line}`
    require_(
      perRound.has(row.round),
      `${where} names round ${row.round}, which this phase does not accept`
    )
    const bucket = perRound.get(row.round)
    require_(
      studyIdPattern(row.round).test(row.study_id),
      `${where} has a study ID that does not match ${row.round}-Pnn`
    )
    require_(
      row.consent_status === "completed",
      `${where} does not record completed consent`
    )
    require_(TASK_IDS.includes(row.task_id), `${where} has an unknown task ID`)
    require_(
      PROTOTYPE_IDS.includes(row.prototype_id),
      `${where} has an unknown prototype ID`
    )
    require_(
      TASK_PROTOTYPE.get(row.task_id) === row.prototype_id,
      `${where} maps ${row.task_id} to ${row.prototype_id}; the locked mapping requires ${TASK_PROTOTYPE.get(row.task_id)}`
    )
    require_(
      TASK_COMPLETED_VALUES.has(row.task_completed),
      `${where} has an invalid task_completed value`
    )
    for (const column of OUTCOME_COLUMNS) {
      require_(
        OUTCOME_VALUES.has(row[column]),
        `${where} has an invalid ${column} value`
      )
    }
    require_(
      SECURITY_VALUES.has(row.security_interruption),
      `${where} has an invalid security_interruption value`
    )
    require_(
      row.notes_code === "n/a" || /^N-[0-9]{3}$/.test(row.notes_code),
      `${where} has a notes_code that is not "n/a" or N-NNN`
    )

    const manifest = manifests.get(row.round)
    require_(
      row.prototype_manifest_version === manifest.version,
      `${where} names manifest version ${row.prototype_manifest_version}; the frozen ${row.round} manifest is ${manifest.version}`
    )
    require_(
      row.prototype_manifest_sha256 === manifest.sha256,
      `${where} names a manifest hash that is not the recomputed ${row.round} hash`
    )
    const proto = manifest.prototypes.get(row.prototype_id)
    require_(
      row.prototype_version === proto.version,
      `${where} names prototype version ${row.prototype_version}; the frozen set has ${proto.version}`
    )
    require_(
      row.prototype_sha256 === proto.normalizedSha256,
      `${where} names a prototype hash that is not the recomputed value`
    )

    if (!bucket.has(row.study_id)) bucket.set(row.study_id, new Set())
    const tasks = bucket.get(row.study_id)
    require_(
      !tasks.has(row.task_id),
      `${where} duplicates ${row.study_id}/${row.task_id}`
    )
    tasks.add(row.task_id)
  }

  const summary = new Map()
  for (const round of rounds) {
    const bucket = perRound.get(round)
    const studyIds = [...bucket.keys()].sort()
    require_(
      studyIds.length >= 5 && studyIds.length <= 8,
      `round ${round} must have 5-8 unique study IDs; found ${studyIds.length}`
    )
    for (const studyId of studyIds) {
      const tasks = bucket.get(studyId)
      require_(
        tasks.size === TASK_IDS.length,
        `${studyId} completed ${tasks.size} of ${TASK_IDS.length} locked tasks`
      )
    }
    summary.set(round, {
      studyIds: studyIds.length,
      observations: studyIds.length * TASK_IDS.length,
      tasksPerParticipant: TASK_IDS.length
    })
  }
  return summary
}

function validateIssues(rows, rounds) {
  const byId = new Map()
  const perRound = new Map()
  for (const round of rounds) perRound.set(round, [])

  for (const row of rows) {
    const where = `issue line ${row.__line}`
    require_(
      perRound.has(row.round),
      `${where} names round ${row.round}, which this phase does not accept`
    )
    require_(
      /^ISS-[0-9]{3}$/.test(row.issue_id),
      `${where} has an invalid issue ID`
    )
    require_(
      studyIdPattern(row.round).test(row.study_id),
      `${where} has a study ID that does not match ${row.round}-Pnn`
    )
    require_(TASK_IDS.includes(row.task_id), `${where} has an unknown task ID`)
    require_(
      SEVERITY_VALUES.has(row.severity),
      `${where} has an invalid severity`
    )
    require_(
      OCCURRENCE_VALUES.has(row.occurrence),
      `${where} has an invalid occurrence`
    )
    require_(
      DISPOSITION_VALUES.has(row.disposition),
      `${where} has an invalid disposition`
    )

    if (row.round === "R1") {
      require_(
        row.occurrence === "observed",
        `${where} is a round-one row and must record occurrence=observed`
      )
      require_(
        row.retest_of_issue_id === "n/a" && row.retest_outcome === "n/a",
        `${where} is a round-one observation and must use n/a retest fields`
      )
    } else if (row.occurrence === "retest") {
      require_(
        /^ISS-[0-9]{3}$/.test(row.retest_of_issue_id),
        `${where} must name the exact round-one issue it retests`
      )
      require_(
        RETEST_OUTCOME_VALUES.has(row.retest_outcome),
        `${where} has an invalid retest outcome`
      )
    } else {
      require_(
        row.retest_of_issue_id === "n/a" && row.retest_outcome === "n/a",
        `${where} is a new round-two observation and must use n/a retest fields`
      )
    }

    if (!byId.has(row.issue_id)) byId.set(row.issue_id, [])
    byId.get(row.issue_id).push(row)
    perRound.get(row.round).push(row)
  }

  // One issue ID must not describe two different severities or rounds.
  for (const [issueId, issueRows] of byId) {
    const severities = new Set(issueRows.map((row) => row.severity))
    require_(
      severities.size === 1,
      `${issueId} records more than one severity: ${[...severities].join(", ")}`
    )
    const rounds_ = new Set(issueRows.map((row) => row.round))
    require_(
      rounds_.size === 1,
      `${issueId} appears in more than one round; use a distinct ID per round`
    )
    const studyIds = new Set(issueRows.map((row) => row.study_id))
    require_(
      studyIds.size === issueRows.length,
      `${issueId} repeats a study ID`
    )
  }

  return { byId, perRound }
}

/**
 * Every distinct round-one critical issue needs a resolved round-two retest.
 * Only a dated decision-owner artifact may exclude one as invalid evidence.
 * Noncritical themes count as repeated at two or more distinct study IDs.
 */
function validateCriticalRetests(issues, aggregate, context) {
  const r1Rows = issues.perRound.get("R1") ?? []
  const r2Rows = issues.perRound.get("R2") ?? []
  const criticalR1 = new Set(
    r1Rows.filter((row) => row.severity === "critical").map((row) => row.issue_id)
  )

  const retests = new Map()
  for (const row of r2Rows) {
    if (row.occurrence !== "retest") continue
    if (!retests.has(row.retest_of_issue_id)) {
      retests.set(row.retest_of_issue_id, new Set())
    }
    retests.get(row.retest_of_issue_id).add(row.retest_outcome)
  }

  const summaries = new Map()
  for (const summary of aggregate.issueSummaries) {
    require_(
      typeof summary?.issueId === "string" && /^ISS-[0-9]{3}$/.test(summary.issueId),
      "each aggregate issue summary needs a valid issueId"
    )
    require_(
      !summaries.has(summary.issueId),
      `aggregate repeats issue summary ${summary.issueId}`
    )
    summaries.set(summary.issueId, summary)
  }

  for (const issueId of criticalR1) {
    const summary = summaries.get(issueId)
    require_(
      summary !== undefined,
      `critical issue ${issueId} has no aggregate summary`
    )
    if (summary.disposition === "invalid-evidence") {
      require_(
        typeof summary.invalidEvidenceReason === "string" &&
          summary.invalidEvidenceReason.trim().length > 0,
        `${issueId} is marked invalid-evidence without a specific reason`
      )
      require_(
        ISO_DATE.test(summary.invalidEvidenceApprovedOn ?? ""),
        `${issueId} is marked invalid-evidence without a dated approval`
      )
      const approval = resolveApproval(
        context,
        summary.invalidEvidenceApprovalArtifact,
        summary.invalidEvidenceApprovalBodySha256,
        `${issueId} invalid-evidence approval`
      )
      require_(
        approval.fields.get("approval-kind") ===
          "consumer-language-invalid-evidence",
        `${issueId} approval is not an invalid-evidence approval`
      )
      require_(
        approval.fields.get("issue-id") === issueId,
        `${issueId} approval names a different issue`
      )
      require_(
        approval.fields.get("approved-on") === summary.invalidEvidenceApprovedOn,
        `${issueId} approval date does not match the aggregate`
      )
      require_(
        approval.fields.get("reason") === summary.invalidEvidenceReason.trim(),
        `${issueId} approval reason does not match the aggregate`
      )
      require_(
        approval.createdDate === summary.invalidEvidenceApprovedOn,
        `${issueId} approval comment date does not match approved-on`
      )
      continue
    }
    const outcomes = retests.get(issueId)
    require_(
      outcomes !== undefined && outcomes.size > 0,
      `critical issue ${issueId} was never retested in round two`
    )
    require_(
      outcomes.size === 1 && outcomes.has("resolved"),
      `critical issue ${issueId} was retested but not resolved (${[...outcomes].join(", ")})`
    )
    require_(
      summary.disposition === "resolved",
      `critical issue ${issueId} is resolved in the matrix but not in the aggregate`
    )
  }

  // No unresolved critical issue may survive round two, at any cardinality.
  for (const row of r2Rows) {
    if (row.severity !== "critical") continue
    if (row.occurrence === "retest") {
      require_(
        row.retest_outcome === "resolved",
        `round-two critical retest ${row.issue_id} is unresolved`
      )
      continue
    }
    fail(
      `round two observed a new critical issue ${row.issue_id}; it must be resolved before the decision gate`
    )
  }

  const repeatedNoncritical = []
  for (const [issueId, issueRows] of issues.byId) {
    if (issueRows[0].severity === "critical") continue
    const distinct = new Set(issueRows.map((row) => row.study_id))
    if (distinct.size >= 2) repeatedNoncritical.push(issueId)
  }

  return {
    criticalCount: criticalR1.size,
    repeatedNoncritical: repeatedNoncritical.length
  }
}

// ---------------------------------------------------------------------------
// Operations approval
// ---------------------------------------------------------------------------

const OPERATION_ROW_FIELDS = [
  "operation",
  "used",
  "decision",
  "approvedByIdentity",
  "approvedOn",
  "approvalArtifact",
  "approvalBodySha256",
  "prototypeManifestVersion",
  "prototypeManifestSha256"
]

function validateOperations(aggregate, context, rounds, manifests) {
  const rows = new Map()
  for (const row of aggregate.operationsApproval) {
    require_(
      row !== null && typeof row === "object",
      "each operationsApproval entry must be an object"
    )
    requireExactKeys(row, OPERATION_ROW_FIELDS, "operationsApproval entry")
    require_(
      !rows.has(row.operation),
      `operationsApproval repeats ${row.operation}`
    )
    rows.set(row.operation, row)
  }

  const expected = [...SHARED_OPERATIONS]
  for (const round of rounds) {
    expected.push(`prototype-exposure-${round.toLowerCase()}`)
  }
  const actual = [...rows.keys()].sort()
  const wanted = [...expected].sort()
  require_(
    actual.length === wanted.length &&
      actual.every((name, index) => name === wanted[index]),
    `operationsApproval must contain exactly: ${wanted.join(", ")}`
  )

  // The five shared rows must reference one common comment and body hash.
  const sharedArtifacts = new Set()
  const sharedHashes = new Set()
  for (const operation of SHARED_OPERATIONS) {
    const row = rows.get(operation)
    require_(
      row.prototypeManifestVersion === "n/a" &&
        row.prototypeManifestSha256 === "n/a",
      `shared operation ${operation} must use n/a prototype-manifest fields`
    )
    sharedArtifacts.add(row.approvalArtifact)
    sharedHashes.add(row.approvalBodySha256)
  }
  require_(
    sharedArtifacts.size === 1 && sharedHashes.size === 1,
    "the five shared operations must reference one common approval comment and body hash"
  )

  const sharedApproval = resolveApproval(
    context,
    [...sharedArtifacts][0],
    [...sharedHashes][0],
    "shared operations approval"
  )
  require_(
    sharedApproval.fields.get("approval-kind") ===
      "consumer-language-operations",
    "the shared operations comment is not an operations approval"
  )
  const sharedDate = sharedApproval.fields.get("approved-on")
  require_(ISO_DATE.test(sharedDate), "operations approved-on is not a date")
  require_(
    sharedApproval.createdDate === sharedDate,
    "the operations comment date does not match approved-on"
  )

  for (const operation of SHARED_OPERATIONS) {
    const row = rows.get(operation)
    require_(
      typeof row.used === "boolean",
      `${operation} used must be a boolean`
    )
    require_(
      row.decision === "allow" || row.decision === "deny",
      `${operation} decision must be allow or deny`
    )
    require_(
      row.approvedOn === sharedDate,
      `${operation} approvedOn does not match the shared comment`
    )
    require_(
      typeof row.approvedByIdentity === "string" &&
        row.approvedByIdentity.trim().length > 0,
      `${operation} needs a concrete approving identity`
    )
    require_(
      row.approvedByIdentity === aggregate.decisionOwner.identity,
      `${operation} approvedByIdentity must be the chartered owner`
    )
    const line = sharedApproval.fields.get(operation)
    const parsed = /^(allow|deny);\s*used=(true|false)$/.exec(line)
    require_(
      parsed !== null,
      `the operations comment line for ${operation} must read "<allow|deny>; used=<true|false>"`
    )
    require_(
      parsed[1] === row.decision,
      `${operation} decision disagrees with the approval comment`
    )
    require_(
      (parsed[2] === "true") === row.used,
      `${operation} used flag disagrees with the approval comment`
    )
    if (row.used) {
      require_(
        row.decision === "allow",
        `${operation} is recorded as used but was denied`
      )
    }
    if (REQUIRED_ALLOWED_OPERATIONS.has(operation)) {
      require_(
        row.decision === "allow" && row.used === true,
        `${operation} is required by this study and must be allowed and used`
      )
    } else if (row.decision === "deny") {
      require_(
        row.used === false,
        `${operation} was denied and therefore must set used=false`
      )
    }
  }

  for (const round of rounds) {
    const name = `prototype-exposure-${round.toLowerCase()}`
    const row = rows.get(name)
    const manifest = manifests.get(round)
    require_(
      manifest !== undefined,
      `${name} was recorded before the ${round} manifest exists`
    )
    require_(row.used === true, `${name} must record used=true`)
    require_(row.decision === "allow", `${name} must be allowed`)
    require_(
      row.approvedByIdentity === aggregate.decisionOwner.identity,
      `${name} approvedByIdentity must be the chartered owner`
    )
    require_(ISO_DATE.test(row.approvedOn), `${name} approvedOn is not a date`)
    require_(
      row.prototypeManifestVersion === manifest.version,
      `${name} names manifest version ${row.prototypeManifestVersion}; the recomputed ${round} version is ${manifest.version}`
    )
    require_(
      row.prototypeManifestSha256 === manifest.sha256,
      `${name} names a manifest hash that is not the recomputed ${round} hash`
    )

    const approval = resolveApproval(
      context,
      row.approvalArtifact,
      row.approvalBodySha256,
      `${name} approval`
    )
    require_(
      approval.fields.get("approval-kind") ===
        "consumer-language-prototype-exposure",
      `${name} comment is not a prototype-exposure approval`
    )
    require_(
      approval.fields.get("round") === round,
      `${name} comment names a different round`
    )
    require_(
      approval.fields.get("decision") === "allow",
      `${name} comment does not allow the exposure`
    )
    require_(
      approval.fields.get("approved-on") === row.approvedOn,
      `${name} comment date does not match the aggregate`
    )
    require_(
      approval.createdDate === row.approvedOn,
      `${name} comment was not posted on its approved-on date`
    )
    require_(
      approval.fields.get("manifest-version") === manifest.version,
      `${name} comment quotes the wrong manifest version`
    )
    require_(
      approval.fields.get("manifest-sha256") === manifest.sha256,
      `${name} comment quotes the wrong manifest hash`
    )
    approval.fields.get("exposure-method")
  }
}

// ---------------------------------------------------------------------------
// Rounds, evidence validation, and decision
// ---------------------------------------------------------------------------

function validateAggregateRounds(aggregate, rounds, manifests, observed) {
  const byRound = new Map()
  for (const entry of aggregate.rounds) {
    require_(
      entry !== null && typeof entry === "object",
      "each aggregate round must be an object"
    )
    require_(
      entry.round === "R1" || entry.round === "R2",
      "each aggregate round must name R1 or R2"
    )
    require_(!byRound.has(entry.round), `aggregate repeats round ${entry.round}`)
    byRound.set(entry.round, entry)
  }
  require_(
    byRound.size === rounds.length,
    `aggregate must contain exactly ${rounds.length} completed round(s)`
  )

  for (const round of rounds) {
    const entry = byRound.get(round)
    require_(entry !== undefined, `aggregate is missing round ${round}`)
    const counts = observed.get(round)
    require_(
      entry.studyIds === counts.studyIds,
      `aggregate round ${round} records ${entry.studyIds} study IDs; the matrix has ${counts.studyIds}`
    )
    require_(
      entry.observations === counts.observations,
      `aggregate round ${round} records ${entry.observations} observations; the matrix has ${counts.observations}`
    )
    require_(
      entry.tasksPerParticipant === TASK_IDS.length,
      `aggregate round ${round} must record ${TASK_IDS.length} tasks per participant`
    )

    const manifest = manifests.get(round)
    const recorded = entry.prototypeManifest
    require_(
      recorded !== null && typeof recorded === "object",
      `aggregate round ${round} is missing prototypeManifest`
    )
    requireExactKeys(
      recorded,
      ["schema", "version", "normalization", "sha256", "prototypes"],
      `aggregate round ${round} prototypeManifest`
    )
    require_(
      recorded.schema === MANIFEST_SCHEMA,
      `aggregate round ${round} manifest schema is wrong`
    )
    require_(
      recorded.normalization === NORMALIZATION,
      `aggregate round ${round} manifest normalization is wrong`
    )
    require_(
      recorded.version === manifest.version,
      `aggregate round ${round} manifest version is not the recomputed value`
    )
    require_(
      recorded.sha256 === manifest.sha256,
      `aggregate round ${round} manifest hash is not the recomputed value`
    )
    require_(
      Array.isArray(recorded.prototypes) &&
        recorded.prototypes.length === PROTOTYPES.length,
      `aggregate round ${round} must list exactly ${PROTOTYPES.length} prototypes`
    )
    recorded.prototypes.forEach((proto, index) => {
      requireExactKeys(
        proto,
        ["id", "filename", "version", "normalizedSha256"],
        `aggregate round ${round} prototype ${index + 1}`
      )
      const expected = PROTOTYPES[index]
      require_(
        proto.id === expected.id && proto.filename === expected.filename,
        `aggregate round ${round} prototype ${index + 1} breaks the locked order`
      )
      const live = manifest.prototypes.get(proto.id)
      require_(
        proto.version === live.version,
        `aggregate round ${round} prototype ${proto.id} has the wrong version`
      )
      require_(
        proto.normalizedSha256 === live.normalizedSha256,
        `aggregate round ${round} prototype ${proto.id} has the wrong hash`
      )
    })
  }
}

function validateEvidenceValidation(aggregate, rounds, manifests, matrixHashes) {
  const record = aggregate.evidenceValidation
  require_(
    record.observationMatrixSha256 === matrixHashes.observations,
    "evidenceValidation.observationMatrixSha256 does not match the working matrix"
  )
  require_(
    record.issueMatrixSha256 === matrixHashes.issues,
    "evidenceValidation.issueMatrixSha256 does not match the working matrix"
  )
  for (const round of ["R1", "R2"]) {
    const key = `${round.toLowerCase()}PrototypeManifestSha256`
    if (rounds.includes(round)) {
      require_(
        record[key] === manifests.get(round).sha256,
        `evidenceValidation.${key} is not the recomputed ${round} manifest hash`
      )
    } else {
      require_(
        record[key] === undefined || record[key] === "n/a",
        `evidenceValidation.${key} must be absent or n/a before ${round} exists`
      )
    }
  }
}

const DECISION_FIELDS = [
  "status",
  "approvedDirectionId",
  "approvedByIdentity",
  "approvedOn",
  "approvalArtifact",
  "approvalBodySha256",
  "winningPrototypeRound",
  "winningPrototypeManifestVersion",
  "winningPrototypeManifestSha256",
  "conditions",
  "rejectedAlternatives"
]

function validateDecision(aggregate, context, manifests) {
  const decision = aggregate.decision
  requireExactKeys(decision, DECISION_FIELDS, "aggregate decision")
  require_(
    decision.status === "approved",
    "the aggregate decision is not approved"
  )
  require_(
    typeof decision.approvedDirectionId === "string" &&
      decision.approvedDirectionId.trim().length > 0,
    "the decision needs a concrete approvedDirectionId"
  )
  require_(
    decision.approvedByIdentity === aggregate.decisionOwner.identity,
    "the decision must be approved by the chartered owner identity"
  )
  require_(ISO_DATE.test(decision.approvedOn ?? ""), "approvedOn is not a date")
  require_(
    decision.winningPrototypeRound === "R2",
    "the winning tested prototype round must be R2"
  )
  require_(
    Array.isArray(decision.conditions),
    "decision.conditions must be an array"
  )
  require_(
    Array.isArray(decision.rejectedAlternatives) &&
      decision.rejectedAlternatives.length > 0,
    "the decision must record the rejected alternatives"
  )

  const r2 = manifests.get("R2")
  require_(
    decision.winningPrototypeManifestVersion === r2.version,
    "the decision names a manifest version that is not the recomputed R2 version"
  )
  require_(
    decision.winningPrototypeManifestSha256 === r2.sha256,
    "the decision names a manifest hash that is not the recomputed R2 hash"
  )

  const approval = resolveApproval(
    context,
    decision.approvalArtifact,
    decision.approvalBodySha256,
    "final decision approval"
  )
  require_(
    approval.fields.get("approval-kind") === "consumer-language-final-decision",
    "the decision comment is not a final-decision approval"
  )
  require_(
    approval.fields.get("decision") === "approve",
    "the decision comment does not approve"
  )
  require_(
    approval.fields.get("approved-on") === decision.approvedOn,
    "the decision comment date does not match the aggregate"
  )
  require_(
    approval.createdDate === decision.approvedOn,
    "the decision comment was not posted on its approved-on date"
  )
  require_(
    approval.fields.get("approved-direction-id") === decision.approvedDirectionId,
    "the decision comment names a different direction"
  )
  require_(
    approval.fields.get("winning-prototype-round") === "R2",
    "the decision comment does not name R2"
  )
  require_(
    approval.fields.get("winning-prototype-manifest-version") === r2.version,
    "the decision comment quotes the wrong R2 manifest version"
  )
  require_(
    approval.fields.get("winning-prototype-manifest-sha256") === r2.sha256,
    "the decision comment quotes the wrong R2 manifest hash"
  )
  return decision
}

/** The `final` phase binds the promoted contract to the tested R2 set. */
function validateContract(decision, manifests) {
  const stat = statSync(CONTRACT_PATH, { throwIfNoEntry: false })
  require_(stat !== undefined, "product/CONTENT_DESIGN.md does not exist")
  const text = readFileSync(CONTRACT_PATH, "utf8").replace(/\r\n/g, "\n")
  const section = /\n## Status and authority\n([\s\S]*?)(?=\n## |$)/.exec(text)
  require_(
    section !== null,
    "product/CONTENT_DESIGN.md has no '## Status and authority' section"
  )
  const body = section[1]
  const r2 = manifests.get("R2")
  const expected = [
    ["Approved direction ID", decision.approvedDirectionId],
    ["Winning tested prototype round", "R2"],
    ["Winning tested prototype manifest version", r2.version],
    ["Winning tested prototype manifest SHA-256", r2.sha256]
  ]
  for (const [label, value] of expected) {
    const matches = body
      .split("\n")
      .filter((line) => line.trim().startsWith(`${label}:`))
    require_(
      matches.length === 1,
      `product/CONTENT_DESIGN.md must contain exactly one "${label}:" line (found ${matches.length})`
    )
    const parsed = new RegExp(`^${escapeRegExp(label)}:\\s*\`([^\`]+)\`$`).exec(
      matches[0].trim()
    )
    require_(
      parsed !== null,
      `"${label}" must record its value in backticks`
    )
    require_(
      parsed[1] === value,
      `"${label}" records ${parsed[1]}; the approved decision is ${value}`
    )
  }
}

// ---------------------------------------------------------------------------
// Phase drivers
// ---------------------------------------------------------------------------

function buildGitHubContext(aggregate) {
  const { owner, repo } = resolveRepositoryCoordinates()
  const pr = resolveDraftPullRequest(owner, repo)
  require_(
    aggregate.decisionOwner.approvalChannel === pr.url,
    `aggregate decisionOwner.approvalChannel must equal ${pr.url}`
  )
  const comments = loadIssueComments(owner, repo, pr.number)
  return {
    owner,
    repo,
    pr,
    comments,
    owner_handle: aggregate.decisionOwner.githubHandle
  }
}

function loadFrozenRounds(plan, manifest, freezingRound) {
  const manifests = new Map()
  for (const round of plan.requiredRounds) {
    if (round === freezingRound) continue
    const rows = manifest.byRound.get(round)
    require_(
      rows !== undefined,
      `round ${round} has not been frozen in the private manifest`
    )
    const recomputed = recomputeRoundSnapshot(plan.prototypeRoot, round)
    const coordinates = assertManifestMatchesSnapshot(round, rows, recomputed)
    manifests.set(round, { ...coordinates, prototypes: recomputed })
  }
  if (manifests.has("R1") && manifests.has("R2")) {
    assertCrossRoundVersions(
      manifests.get("R1").prototypes,
      manifests.get("R2").prototypes
    )
  }
  return manifests
}

function runApprovalChannel() {
  const aggregate = loadAggregate()
  require_(
    aggregate.operationsApproval.length === 0,
    "approval-channel requires an empty operationsApproval array"
  )
  require_(
    aggregate.rounds.length === 0,
    "approval-channel requires an empty rounds array"
  )
  require_(
    aggregate.issueSummaries.length === 0,
    "approval-channel requires an empty issueSummaries array"
  )
  require_(
    aggregate.decision.status === "pending",
    "approval-channel requires a pending decision"
  )
  const serialized = JSON.stringify(aggregate)
  require_(
    !/approvalArtifact|approvalBodySha256|invalidEvidenceApproval/.test(
      serialized
    ),
    "approval-channel requires that no approval-comment flags exist yet"
  )
  require_(
    !/"winningPrototype|prototypeManifest"/.test(serialized),
    "approval-channel requires that no prototype evidence exists yet"
  )

  const { owner, repo } = resolveRepositoryCoordinates()
  const pr = resolveDraftPullRequest(owner, repo)
  require_(
    aggregate.decisionOwner.approvalChannel === pr.url,
    `aggregate decisionOwner.approvalChannel must equal ${pr.url}`
  )
  const user = ghJson(
    `users/${aggregate.decisionOwner.githubHandle}`,
    "gh api users"
  )
  require_(
    user?.login === aggregate.decisionOwner.githubHandle,
    `decisionOwner.githubHandle does not resolve to a live GitHub login`
  )
  return successLine("approval-channel", {})
}

function runPrototypeSet(plan) {
  const manifest = readManifest(plan.prototypeManifest)
  require_(
    !manifest.byRound.has(plan.round),
    `the private manifest already contains ${plan.round} rows; it will not be replaced`
  )
  if (plan.round === "R2") {
    require_(
      manifest.byRound.has("R1"),
      "R2 cannot be frozen before R1 exists in the private manifest"
    )
  }

  const priorManifests = loadFrozenRounds(plan, manifest, plan.round)
  const recomputed = recomputeRoundSnapshot(plan.prototypeRoot, plan.round)

  if (plan.round === "R2") {
    assertCrossRoundVersions(priorManifests.get("R1").prototypes, recomputed)
  }

  const coordinates = writeManifestRound(
    plan.prototypeManifest,
    manifest.rows,
    plan.round,
    plan.manifestVersion,
    recomputed
  )
  const manifests = new Map(
    [...priorManifests].map(([round, value]) => [round, value])
  )
  manifests.set(plan.round, { ...coordinates, prototypes: recomputed })
  return successLine("prototype-set", { manifests })
}

function runOperations(plan) {
  const aggregate = loadAggregate()
  const manifest = readManifest(plan.prototypeManifest)
  const manifests = loadFrozenRounds(plan, manifest, null)
  if (plan.round === "R1") {
    require_(
      !manifest.byRound.has("R2") ||
        aggregate.operationsApproval.some(
          (row) => row.operation === "prototype-exposure-r2"
        ),
      "an R2 snapshot exists but no R2 exposure approval was recorded"
    )
  }
  const context = buildGitHubContext(aggregate)
  validateOperations(aggregate, context, plan.requiredRounds, manifests)
  return successLine("operations", { manifests })
}

function runEvidencePhase(plan) {
  const aggregate = loadAggregate()
  const manifest = readManifest(plan.prototypeManifest)
  const manifests = loadFrozenRounds(plan, manifest, null)
  const context = buildGitHubContext(aggregate)

  // Neither round-two nor any later phase may bypass an operations gate.
  validateOperations(aggregate, context, plan.requiredRounds, manifests)

  const observations = readTsv(
    plan.observations,
    OBSERVATION_HEADER,
    "observation matrix"
  )
  const issues = readTsv(plan.issues, ISSUE_HEADER, "issue matrix")
  const observed = validateObservations(
    observations.rows,
    plan.requiredRounds,
    manifests
  )
  const parsedIssues = validateIssues(issues.rows, plan.requiredRounds)
  validateAggregateRounds(aggregate, plan.requiredRounds, manifests, observed)
  validateEvidenceValidation(aggregate, plan.requiredRounds, manifests, {
    observations: observations.sha256,
    issues: issues.sha256
  })

  let criticalRetests = "n/a"
  if (plan.requiredRounds.includes("R2")) {
    validateCriticalRetests(parsedIssues, aggregate, context)
    criticalRetests = "resolved"
  } else {
    // Round one may not silently drop a critical finding either: every one must
    // already be represented in the aggregate summaries.
    const criticalIds = new Set(
      (parsedIssues.perRound.get("R1") ?? [])
        .filter((row) => row.severity === "critical")
        .map((row) => row.issue_id)
    )
    const summarized = new Set(
      aggregate.issueSummaries.map((summary) => summary.issueId)
    )
    for (const issueId of criticalIds) {
      require_(
        summarized.has(issueId),
        `critical round-one issue ${issueId} has no aggregate summary`
      )
    }
    criticalRetests = criticalIds.size === 0 ? "resolved" : "pending"
  }

  if (plan.phase === "decision" || plan.phase === "final") {
    const decision = validateDecision(aggregate, context, manifests)
    if (plan.phase === "final") {
      validateContract(decision, manifests)
    }
    criticalRetests = "resolved"
  }

  return successLine(plan.phase, {
    manifests,
    observed,
    criticalRetests
  })
}

function successLine(phase, { manifests, observed, criticalRetests } = {}) {
  const r1 = observed?.get("R1")
  const r2 = observed?.get("R2")
  const manifestField = (round) => {
    const entry = manifests?.get(round)
    return entry === undefined ? "n/a" : `${entry.version}:${entry.sha256}`
  }
  const tasksPerParticipant =
    r1 !== undefined || r2 !== undefined ? String(TASK_IDS.length) : "n/a"
  return [
    `${TOOL} ok`,
    `phase=${phase}`,
    `r1_participants=${r1 === undefined ? "n/a" : r1.studyIds}`,
    `r2_participants=${r2 === undefined ? "n/a" : r2.studyIds}`,
    `tasks_per_participant=${tasksPerParticipant}`,
    `critical_retests=${criticalRetests ?? "n/a"}`,
    `r1_manifest=${manifestField("R1")}`,
    `r2_manifest=${manifestField("R2")}`
  ].join(" ")
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function main() {
  const plan = resolvePhasePlan(parseArgs(process.argv.slice(2)))
  switch (plan.phase) {
    case "approval-channel":
      return runApprovalChannel()
    case "prototype-set":
      return runPrototypeSet(plan)
    case "operations":
      return runOperations(plan)
    default:
      return runEvidencePhase(plan)
  }
}

try {
  process.stdout.write(`${main()}\n`)
} catch (error) {
  if (error instanceof VerificationError) {
    process.stderr.write(`${TOOL} failed: ${error.message}\n`)
    process.exit(1)
  }
  throw error
}
