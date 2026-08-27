#!/usr/bin/env node
// Retained verification fixture for the Plan 005 learner-task navigation study.
//
// Node built-ins only. `child_process` is used solely for argument-array `git`
// and `gh` reads; no argument is ever passed through a shell. Every phase fails
// closed and prints exactly one success line naming the phase.
//
// IMPLEMENTATION STATE — read this before trusting a pass.
//
//   Fully implemented and exercised:
//     inventory   frozen family/route mapping, counts, uniqueness, field shape
//     candidates  eight-file candidate sets, markup contract, hierarchy
//                 signature divergence, artifact-version hashing
//     selected    the same contract against the tracked prototype/ directory
//
//   Precondition-complete, evidence-incomplete: every remaining phase enforces
//   its structural preconditions (owner binding, live draft-PR resolution,
//   approval-comment authenticity, declared thresholds, artifact locks) and
//   fails closed when the participant evidence it grades is absent. Their
//   aggregate-grading arithmetic is written against the recorded schema but has
//   never been exercised against real evidence, because no participant round
//   has been authorized. A successor MUST re-read those branches against real
//   matrices before relying on a pass.
//
// The validator never uploads data and never writes to the repository.

import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, isAbsolute, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const TOOL = "navigation-task-hierarchy"
const BRANCH = "codex/uiux-task-navigation"
const BASE_REF = "main"
const PLANNED_AT_SHA = "e6f911901f7f18f6716204309fee8b103419a5e0"

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, "..", "..", "..")
const INVENTORY_PATH = join(SCRIPT_DIR, "route-task-inventory.json")
const SUMMARY_PATH = join(SCRIPT_DIR, "research-summary.json")
const PROTOTYPE_DIR = join(SCRIPT_DIR, "prototype")

// ---------------------------------------------------------------------------
// Frozen canonical mapping, copied from product/ROUTES.md at the recorded base.
// ---------------------------------------------------------------------------

const FROZEN_FAMILIES = new Map([
  [1, ["home"]],
  [2, ["exam-selector"]],
  [3, ["exam-checker"]],
  [4, ["profile"]],
  [5, ["study-hub"]],
  [6, ["atlas-index"]],
  [7, ["atlas-family"]],
  [8, ["atlas-tool"]],
  [9, ["procedures-index", "procedure-detail"]],
  [10, ["repair-lab"]],
  [11, ["question-player"]],
  [12, ["hazards-index", "hazard-player"]],
  [13, ["review-queue", "review-player"]],
  [14, ["simulation-setup", "simulation-player", "simulation-results"]],
  [15, ["print-center", "print-preview"]],
  [16, ["faq"]],
  [17, [
    "transparency-index",
    "source",
    "corrections",
    "foil",
    "security",
    "privacy"
  ]],
  [18, ["correction-submit"]],
  [19, ["settings"]],
  [20, ["offline-packs"]],
  [21, ["status"]]
])

const FROZEN_SPOKES = [
  "about",
  "actual-questions-explainer",
  "nyc-disambiguation",
  "scoring-explainer"
]

const CORE_ROUTE_COUNT = 32

const TASK_PRIORITIES = new Set([
  "top",
  "supporting",
  "utility",
  "trust-recovery"
])

const REQUIRED_FAMILY_FIELDS = [
  "familyNumber",
  "familyLabel",
  "routeIds",
  "pathPatterns",
  "currentParentNavigation",
  "indexability",
  "renderOwnership",
  "offlineContract",
  "currentGlobalVisibility",
  "learnerTask",
  "taskPriority",
  "proposedPageArchetype",
  "proposedShell",
  "noJavaScriptPurpose",
  "evidenceStatus"
]

const REQUIRED_SPOKE_FIELDS = [
  "routeId",
  "path",
  "learnerTask",
  "publicationStatus"
]

/** The exact seven views plus the stylesheet. No extra file may appear. */
const PROTOTYPE_VIEWS = [
  "index.html",
  "practice.html",
  "profile.html",
  "atlas.html",
  "review.html",
  "player.html",
  "utility.html"
]
const PROTOTYPE_FILES = [...PROTOTYPE_VIEWS, "styles.css"]

const LOCKED_OPERATIONS = [
  "recruitment",
  "outreach",
  "compensation",
  "recording",
  "private-data-retention",
  "prototype-exposure"
]

const PHASES = new Set([
  "inventory",
  "sample-plan",
  "operations",
  "open-sort",
  "thresholds",
  "candidates",
  "exposure-round-one",
  "tree",
  "first-click-round-one",
  "language-dependency",
  "exposure-round-two",
  "first-click",
  "decision",
  "selected",
  "promotion",
  "final"
])

const SCRATCH_PHASES = new Set([
  "candidates",
  "exposure-round-one",
  "tree",
  "first-click-round-one",
  "language-dependency",
  "exposure-round-two",
  "first-click"
])

const HEX64 = /^[0-9a-f]{64}$/
const SHA40 = /^[0-9a-f]{40}$/
const GH_LOGIN = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/

class VerificationError extends Error {}
const fail = (message) => {
  throw new VerificationError(message)
}
const require_ = (condition, message) => {
  if (!condition) fail(message)
}

// ---------------------------------------------------------------------------
// Arguments
// ---------------------------------------------------------------------------

const KNOWN_FLAGS = new Set(["phase", "scratch-root"])

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
  const phase = seen.get("phase")
  require_(phase !== undefined, "missing required flag --phase")
  require_(PHASES.has(phase), `unknown phase: ${phase}`)

  let scratchRoot = null
  if (SCRATCH_PHASES.has(phase)) {
    scratchRoot = seen.get("scratch-root")
    require_(
      scratchRoot !== undefined,
      `--scratch-root is required for --phase=${phase}`
    )
    require_(isAbsolute(scratchRoot), "--scratch-root must be an absolute path")
  } else {
    require_(
      !seen.has("scratch-root"),
      `--scratch-root is not accepted for --phase=${phase}`
    )
  }
  return { phase, scratchRoot }
}

// ---------------------------------------------------------------------------
// Hashing helpers
// ---------------------------------------------------------------------------

const sha256Hex = (input) => createHash("sha256").update(input).digest("hex")

/** Recursively key-sorted canonical JSON, then SHA-256 of its UTF-8 bytes. */
function canonicalJsonSha256(value) {
  const canonicalize = (node) => {
    if (Array.isArray(node)) return node.map(canonicalize)
    if (node !== null && typeof node === "object") {
      const out = {}
      for (const key of Object.keys(node).sort()) out[key] = canonicalize(node[key])
      return out
    }
    return node
  }
  return sha256Hex(Buffer.from(JSON.stringify(canonicalize(value)), "utf8"))
}

function readJson(path, label) {
  const stat = statSync(path, { throwIfNoEntry: false })
  require_(stat !== undefined, `${label} is missing at ${path}`)
  require_(stat.isFile(), `${label} is not a regular file`)
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    fail(`${label} is not valid JSON`)
  }
}

// ---------------------------------------------------------------------------
// Inventory phase
// ---------------------------------------------------------------------------

function validateInventory() {
  const inventory = readJson(INVENTORY_PATH, "route-task-inventory.json")
  require_(inventory.schemaVersion === 1, "inventory schemaVersion must be 1")
  require_(
    inventory.plannedAtSha === PLANNED_AT_SHA,
    "inventory plannedAtSha does not match the planning coordinate"
  )
  require_(
    typeof inventory.researchBaseSha === "string" &&
      SHA40.test(inventory.researchBaseSha),
    "inventory researchBaseSha must be a full 40-character lowercase SHA"
  )
  require_(
    Array.isArray(inventory.families) && inventory.families.length === 21,
    `inventory must contain exactly 21 families; found ${inventory.families?.length}`
  )
  require_(
    Array.isArray(inventory.spokes) && inventory.spokes.length === 4,
    "inventory must contain exactly 4 spokes"
  )

  const seenNumbers = new Set()
  const flattened = []
  for (const family of inventory.families) {
    for (const field of REQUIRED_FAMILY_FIELDS) {
      require_(
        Object.prototype.hasOwnProperty.call(family, field),
        `family ${family.familyNumber ?? "?"} is missing ${field}`
      )
    }
    const extra = Object.keys(family).filter(
      (key) => !REQUIRED_FAMILY_FIELDS.includes(key)
    )
    require_(
      extra.length === 0,
      `family ${family.familyNumber} has unknown field(s): ${extra.join(", ")}`
    )

    const number = family.familyNumber
    require_(
      Number.isInteger(number) && number >= 1 && number <= 21,
      `invalid familyNumber ${number}`
    )
    require_(!seenNumbers.has(number), `duplicate familyNumber ${number}`)
    seenNumbers.add(number)

    require_(
      Array.isArray(family.routeIds) && family.routeIds.length > 0,
      `family ${number} must declare a non-empty routeIds array`
    )
    const frozen = FROZEN_FAMILIES.get(number)
    require_(
      family.routeIds.length === frozen.length &&
        family.routeIds.every((id, index) => id === frozen[index]),
      `family ${number} route IDs do not match the frozen mapping [${frozen.join(", ")}]`
    )
    require_(
      Array.isArray(family.pathPatterns) && family.pathPatterns.length > 0,
      `family ${number} must declare a non-empty pathPatterns array`
    )
    require_(
      TASK_PRIORITIES.has(family.taskPriority),
      `family ${number} has an invalid taskPriority "${family.taskPriority}"`
    )
    for (const field of REQUIRED_FAMILY_FIELDS) {
      if (field === "routeIds" || field === "pathPatterns") continue
      if (field === "familyNumber") continue
      require_(
        typeof family[field] === "string" && family[field].trim().length > 0,
        `family ${number} field ${field} must be a non-empty string`
      )
    }
    flattened.push(...family.routeIds)
  }

  require_(
    seenNumbers.size === 21,
    "inventory must cover family numbers 1 through 21 exactly once"
  )
  require_(
    flattened.length === CORE_ROUTE_COUNT,
    `flattened core route IDs must number ${CORE_ROUTE_COUNT}; found ${flattened.length}`
  )
  require_(
    new Set(flattened).size === CORE_ROUTE_COUNT,
    "a core route ID is claimed by more than one family"
  )
  const expectedFlat = [...FROZEN_FAMILIES.values()].flat().sort()
  require_(
    [...flattened].sort().every((id, index) => id === expectedFlat[index]),
    "the flattened route-ID set does not match the frozen canonical set"
  )

  const spokeIds = []
  for (const spoke of inventory.spokes) {
    for (const field of REQUIRED_SPOKE_FIELDS) {
      require_(
        typeof spoke[field] === "string" && spoke[field].trim().length > 0,
        `spoke ${spoke.routeId ?? "?"} is missing ${field}`
      )
    }
    const extra = Object.keys(spoke).filter(
      (key) => !REQUIRED_SPOKE_FIELDS.includes(key)
    )
    require_(
      extra.length === 0,
      `spoke ${spoke.routeId} has unknown field(s): ${extra.join(", ")}`
    )
    spokeIds.push(spoke.routeId)
  }
  require_(
    spokeIds.length === 4 && new Set(spokeIds).size === 4,
    "spokes must be four unique route IDs"
  )
  require_(
    [...spokeIds].sort().every((id, index) => id === FROZEN_SPOKES[index]),
    `spokes must be exactly: ${FROZEN_SPOKES.join(", ")}`
  )

  // A core route ID must never also be published as a spoke.
  for (const id of spokeIds) {
    require_(!flattened.includes(id), `${id} is both a core route and a spoke`)
  }

  return {
    families: inventory.families.length,
    coreRoutes: flattened.length,
    spokes: spokeIds.length
  }
}

// ---------------------------------------------------------------------------
// Prototype contract
// ---------------------------------------------------------------------------

function readCandidateDir(root, name) {
  const dir = join(root, name)
  const stat = statSync(dir, { throwIfNoEntry: false })
  require_(stat !== undefined, `${name}/ does not exist`)
  require_(stat.isDirectory(), `${name} is not a directory`)
  const entries = readdirSync(dir, { withFileTypes: true })
  const names = entries.map((entry) => entry.name).sort()
  const expected = [...PROTOTYPE_FILES].sort()
  require_(
    names.length === expected.length &&
      names.every((value, index) => value === expected[index]),
    `${name}/ must contain exactly ${expected.join(", ")}; found ${names.join(", ")}`
  )
  const files = new Map()
  for (const filename of PROTOTYPE_FILES) {
    const path = join(dir, filename)
    require_(statSync(path).isFile(), `${name}/${filename} is not a regular file`)
    files.set(filename, readFileSync(path))
  }
  return files
}

/**
 * Artifact version: SHA-256 of UTF-8 JSON.stringify over the lexicographically
 * sorted [relativePath, sha256(rawBytes)] pairs for the exact eight-file set.
 */
function artifactVersionSha256(files) {
  const pairs = [...files.entries()]
    .map(([name, bytes]) => [name, sha256Hex(bytes)])
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
  return sha256Hex(Buffer.from(JSON.stringify(pairs), "utf8"))
}

const attr = (tag, name) => {
  const match = new RegExp(`${name}="([^"]*)"`).exec(tag)
  return match === null ? null : match[1]
}

/**
 * Parse one controlled prototype view. The tokenizer is narrow by design, but
 * it matches complete tag and attribute signatures so a consumer word that
 * merely contains a reserved substring is never rejected.
 */
function parseView(filename, bytes) {
  const html = bytes.toString("utf8")

  require_(!/<\s*script\b/i.test(html), `${filename} contains a <script> element`)
  require_(
    !/\bdata-island\s*=/.test(html),
    `${filename} declares a data-island attribute`
  )
  require_(
    !/\b(?:src|href)\s*=\s*"(?:https?:)?\/\//i.test(html),
    `${filename} references an external URL`
  )
  require_(
    !/\b(?:import\s+[^\n]*from|require\()/.test(html),
    `${filename} imports a module`
  )
  require_(
    !/\bdata-postcommit\b|\bpostcommitPath\b|\bcorrectOptionId\b/.test(html),
    `${filename} contains answer-bearing or postcommit material`
  )

  const viewIds = [...html.matchAll(/\bdata-view-id="([^"]+)"/g)].map((m) => m[1])
  require_(
    viewIds.length === 1,
    `${filename} must declare exactly one data-view-id (found ${viewIds.length})`
  )
  require_(
    (html.match(/<main\b/gi) ?? []).length === 1,
    `${filename} must contain exactly one <main>`
  )
  require_(
    (html.match(/<h1\b/gi) ?? []).length === 1,
    `${filename} must contain exactly one <h1>`
  )
  require_(
    /\bclass="skip-link"|\bdata-skip-link\b/.test(html),
    `${filename} must contain a skip link`
  )

  const anchors = [...html.matchAll(/<a\b[^>]*>/g)].map((m) => m[0])
  const localLinks = []
  const navEntries = []
  for (const tag of anchors) {
    const href = attr(tag, "href")
    if (href === null || href.startsWith("#")) continue
    const routeId = attr(tag, "data-route-id")
    const canonicalPath = attr(tag, "data-canonical-path")
    require_(
      routeId !== null && canonicalPath !== null,
      `${filename} has a navigation anchor without data-route-id and data-canonical-path: ${tag}`
    )
    require_(
      PROTOTYPE_VIEWS.includes(href),
      `${filename} links to "${href}", which is not one of the seven prototype views`
    )
    localLinks.push(href)
    const tier = attr(tag, "data-nav-tier")
    if (tier !== null) {
      require_(
        ["primary", "secondary", "utility"].includes(tier),
        `${filename} has an invalid data-nav-tier "${tier}"`
      )
      navEntries.push({
        tier,
        routeId,
        canonicalPath,
        taskPriority: attr(tag, "data-task-priority"),
        parentGroup: attr(tag, "data-parent-group")
      })
    }
  }

  const isPlayer = viewIds[0] === "player"
  if (isPlayer) {
    require_(
      navEntries.length === 0,
      "player.html must not carry acquisition or utility navigation"
    )
    require_(
      /\bdata-exit-action\b/.test(html),
      "player.html must provide an exit action"
    )
  } else {
    for (const tier of ["primary", "secondary", "utility"]) {
      require_(
        navEntries.some((entry) => entry.tier === tier),
        `${filename} must declare a ${tier} navigation tier`
      )
    }
    require_(
      /\bdata-profile-context\b/.test(html),
      `${filename} must show persistent profile context`
    )
  }

  return {
    viewId: viewIds[0],
    localLinks,
    navEntries,
    routeIds: anchors
      .map((tag) => attr(tag, "data-route-id"))
      .filter((value) => value !== null),
    canonicalPaths: anchors
      .map((tag) => attr(tag, "data-canonical-path"))
      .filter((value) => value !== null),
    contentContractSha256: attr(html, "data-content-contract-sha256"),
    hasProvisionalLanguageMarker: /\bdata-provisional-language\b/.test(html)
  }
}

function analyzeCandidate(files, label) {
  const views = new Map()
  for (const filename of PROTOTYPE_VIEWS) {
    views.set(filename, parseView(`${label}/${filename}`, files.get(filename)))
  }

  const declared = [...views.values()].map((view) => view.viewId)
  require_(
    new Set(declared).size === PROTOTYPE_VIEWS.length,
    `${label} declares a duplicate view ID`
  )

  // Reachability of all seven views from index.html.
  const byFile = new Map([...views.entries()])
  const reached = new Set(["index.html"])
  const queue = ["index.html"]
  while (queue.length > 0) {
    const current = queue.shift()
    for (const href of byFile.get(current).localLinks) {
      if (!reached.has(href)) {
        reached.add(href)
        queue.push(href)
      }
    }
  }
  require_(
    reached.size === PROTOTYPE_VIEWS.length,
    `${label}: only ${reached.size} of ${PROTOTYPE_VIEWS.length} views are reachable from index.html`
  )

  // Normalized hierarchy signature: view IDs, tier membership and DOM order,
  // parent grouping, and task-priority markers. Labels, CSS, and whitespace are
  // excluded so a copy-only change cannot masquerade as a different IA.
  const signature = {
    views: [...views.entries()]
      .map(([filename, view]) => ({
        viewId: view.viewId,
        navigation: view.navEntries.map((entry) => ({
          tier: entry.tier,
          routeId: entry.routeId,
          canonicalPath: entry.canonicalPath,
          taskPriority: entry.taskPriority,
          parentGroup: entry.parentGroup
        }))
      }))
      .sort((a, b) => (a.viewId < b.viewId ? -1 : a.viewId > b.viewId ? 1 : 0))
  }

  return {
    views,
    normalizedHierarchySha256: canonicalJsonSha256(signature),
    artifactVersionSha256: artifactVersionSha256(files)
  }
}

function validateCandidates(scratchRoot) {
  const a = analyzeCandidate(readCandidateDir(scratchRoot, "candidate-a"), "candidate-a")
  const b = analyzeCandidate(readCandidateDir(scratchRoot, "candidate-b"), "candidate-b")
  require_(
    a.normalizedHierarchySha256 !== b.normalizedHierarchySha256,
    "candidate-a and candidate-b describe the same information architecture; two cosmetically different copies of one IA cannot satisfy the comparison"
  )
  for (const value of [
    a.normalizedHierarchySha256,
    b.normalizedHierarchySha256,
    a.artifactVersionSha256,
    b.artifactVersionSha256
  ]) {
    require_(HEX64.test(value), "a recomputed hash is not 64 lowercase hex characters")
  }
  return { a, b }
}

// ---------------------------------------------------------------------------
// Git and GitHub
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
  const url = readProcess("git", ["remote", "get-url", "origin"], "git remote").trim()
  const match =
    /^(?:https:\/\/github\.com\/|git@github\.com:)([^/]+)\/(.+?)(?:\.git)?$/.exec(url)
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
  require_(pr.draft === true, "the pull request is not a draft")
  require_(pr.state === "open", "the pull request is not open")
  require_(pr.base?.ref === BASE_REF, `the pull request base is not ${BASE_REF}`)
  require_(pr.head?.ref === BRANCH, `the pull request head is not ${BRANCH}`)
  return { number: pr.number, url: `https://github.com/${owner}/${repo}/pull/${pr.number}` }
}

function loadComments(owner, repo, number) {
  const comments = new Map()
  for (let page = 1; page <= 20; page += 1) {
    const batch = ghJson(
      `repos/${owner}/${repo}/issues/${number}/comments?per_page=100&page=${page}`,
      "gh api comments"
    )
    require_(Array.isArray(batch), "gh api comments did not return a list")
    for (const comment of batch) {
      comments.set(
        `https://github.com/${owner}/${repo}/pull/${number}#issuecomment-${comment.id}`,
        comment
      )
    }
    if (batch.length < 100) return comments
  }
  fail("the pull request has more comment pages than this validator will read")
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Resolve one durable approval artifact. Executor prose, a reaction, or any
 * non-empty string is not approval.
 */
function resolveApproval(context, artifact, bodySha256, label) {
  require_(typeof artifact === "string", `${label} approvalArtifact must be a string`)
  const pattern = new RegExp(
    `^https://github\\.com/${escapeRegExp(context.owner)}/${escapeRegExp(context.repo)}/pull/${context.pr.number}#issuecomment-[0-9]+$`
  )
  require_(
    pattern.test(artifact),
    `${label} approvalArtifact must be a same-PR comment URL on pull ${context.pr.number}`
  )
  const comment = context.comments.get(artifact)
  require_(comment !== undefined, `${label} approvalArtifact does not resolve`)
  require_(
    comment.user?.login === context.handle,
    `${label} was authored by ${comment.user?.login}, not the chartered owner ${context.handle}`
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
  require_(actual === bodySha256, `${label} body hash does not match the record`)
  return { comment, lines: comment.body.replace(/\r\n/g, "\n").split("\n").map((line) => line.trim()) }
}

// ---------------------------------------------------------------------------
// Summary and shared preconditions
// ---------------------------------------------------------------------------

function loadSummary() {
  const summary = readJson(SUMMARY_PATH, "research-summary.json")
  require_(summary.schemaVersion === 1, "summary schemaVersion must be 1")
  require_(
    summary.plannedAtSha === PLANNED_AT_SHA,
    "summary plannedAtSha does not match the planning coordinate"
  )
  const owner = summary.decisionOwner
  require_(
    owner !== null && typeof owner === "object",
    "summary decisionOwner must be an object"
  )
  for (const key of ["identity", "githubHandle", "role", "approvalChannel"]) {
    require_(
      typeof owner[key] === "string" && owner[key].trim().length > 0,
      `summary decisionOwner.${key} must be a non-empty string`
    )
  }
  require_(
    GH_LOGIN.test(owner.githubHandle),
    "summary decisionOwner.githubHandle is not a valid GitHub login"
  )
  const raw = readFileSync(SUMMARY_PATH, "utf8")
  require_(
    !/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(raw),
    "summary contains an email address; it must stay de-identified"
  )
  require_(
    !/\b(?:F[12]-P[0-9]{2}|OS-P[0-9]{2}|TT-P[0-9]{2})\b/.test(raw),
    "summary contains a participant ID; it must contain aggregate data only"
  )
  return summary
}

function buildContext(summary) {
  const { owner, repo } = resolveRepositoryCoordinates()
  const pr = resolveDraftPullRequest(owner, repo)
  require_(
    summary.decisionOwner.approvalChannel === pr.url,
    `summary decisionOwner.approvalChannel must equal ${pr.url}`
  )
  return {
    owner,
    repo,
    pr,
    handle: summary.decisionOwner.githubHandle,
    comments: loadComments(owner, repo, pr.number)
  }
}

/** Exactly one allow/deny record per locked operation; used implies allowed. */
function validateOperations(summary, context) {
  const rows = new Map()
  require_(
    Array.isArray(summary.operationsApproval),
    "summary operationsApproval must be an array"
  )
  for (const row of summary.operationsApproval) {
    require_(
      typeof row?.operation === "string",
      "each operationsApproval entry needs an operation"
    )
    require_(!rows.has(row.operation), `operationsApproval repeats ${row.operation}`)
    rows.set(row.operation, row)
  }
  const actual = [...rows.keys()].sort()
  const wanted = [...LOCKED_OPERATIONS].sort()
  require_(
    actual.length === wanted.length && actual.every((v, i) => v === wanted[i]),
    `operationsApproval must contain exactly one record for each of: ${wanted.join(", ")}`
  )

  for (const operation of LOCKED_OPERATIONS) {
    const row = rows.get(operation)
    require_(typeof row.used === "boolean", `${operation} used must be a boolean`)
    require_(
      row.decision === "allow" || row.decision === "deny",
      `${operation} decision must be allow or deny`
    )
    if (row.used) {
      require_(row.decision === "allow", `${operation} is used but was denied`)
      require_(
        typeof row.approvedByIdentity === "string" &&
          row.approvedByIdentity.trim().length > 0,
        `${operation} is used and needs a concrete operator identity`
      )
      require_(
        typeof row.approvedOn === "string" &&
          /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(row.approvedOn),
        `${operation} is used and needs a dated approval`
      )
      const approval = resolveApproval(
        context,
        row.approvalArtifact,
        row.approvalBodySha256,
        `${operation} approval`
      )
      require_(
        approval.lines[0] === "approval-kind: operations",
        "the operations comment must start with 'approval-kind: operations'"
      )
      const expected = `operation: ${operation} | used: ${row.used} | decision: ${row.decision}`
      require_(
        approval.lines.includes(expected),
        `the operations comment is missing the exact line "${expected}"`
      )
    } else {
      require_(
        row.decision === "deny" || row.decision === "allow",
        `${operation} has an invalid decision`
      )
    }
  }
  return rows
}

function requireEvidence(summary, phase) {
  const counts = summary.participantCounts ?? {}
  const needed = {
    "open-sort": "openSort",
    thresholds: "thresholdPilot",
    tree: "treeTest",
    "first-click-round-one": "firstClickRound1",
    "first-click": "firstClickRound2"
  }[phase]
  if (needed === undefined) return
  require_(
    Number.isInteger(counts[needed]) && counts[needed] > 0,
    `phase ${phase} grades participant evidence, and participantCounts.${needed} is ${counts[needed] ?? "absent"}; no such round has been run`
  )
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function main() {
  const { phase, scratchRoot } = parseArgs(process.argv.slice(2))

  if (phase === "inventory") {
    const result = validateInventory()
    return `${TOOL} ok phase=inventory families=${result.families} core_routes=${result.coreRoutes} spokes=${result.spokes}`
  }

  if (phase === "candidates") {
    const { a, b } = validateCandidates(scratchRoot)
    return `${TOOL} ok phase=candidates candidate_a=${a.artifactVersionSha256} candidate_b=${b.artifactVersionSha256} hierarchies_differ=true`
  }

  if (phase === "selected") {
    const files = readCandidateDir(dirname(PROTOTYPE_DIR), "prototype")
    const analysis = analyzeCandidate(files, "prototype")
    const summary = loadSummary()
    const lock = summary.roundTwoArtifactLock
    require_(
      lock !== null && typeof lock === "object",
      "summary roundTwoArtifactLock is absent; the selected prototype cannot be bound to a tested artifact"
    )
    require_(
      lock.artifactVersionSha256 === analysis.artifactVersionSha256,
      "the tracked prototype's artifact version does not equal roundTwoArtifactLock"
    )
    require_(
      lock.normalizedHierarchySha256 === analysis.normalizedHierarchySha256,
      "the tracked prototype's hierarchy signature does not equal roundTwoArtifactLock"
    )
    return `${TOOL} ok phase=selected artifact=${analysis.artifactVersionSha256}`
  }

  // Every remaining phase requires the live owner binding first.
  const summary = loadSummary()
  const context = buildContext(summary)
  validateOperations(summary, context)
  requireEvidence(summary, phase)

  fail(
    `phase ${phase} passed its structural preconditions but grades evidence that does not exist yet; see the IMPLEMENTATION STATE note at the top of this file`
  )
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
