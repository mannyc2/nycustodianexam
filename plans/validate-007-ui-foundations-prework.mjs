#!/usr/bin/env node

import { execFileSync } from "node:child_process"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { createHash } from "node:crypto"
import { dirname, join, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

export const artifactMetadata = Object.freeze({
  status: "provisional-prework",
  participantEvidence: "none",
  humanEvidence: "none",
  humanParticipantCount: 0,
  notHumanUsabilityTested: true,
  reviewMode: "codex-only",
  decisionStatus: "pending",
  requiredDependencyShas: null,
  mustRebaseAndReverify: true
})

const SOURCE_BASE_SHA = "9fc7dcacfc961752e5d9a2cedbc426deead54a05"
const EXPECTED_ARTIFACTS = [
  "plans/007-ui-foundations-prework.md",
  "plans/007-ui-foundations-source-inventory.schema.json",
  "plans/validate-007-ui-foundations-prework.mjs"
]
const PROTECTED_PATHS = [
  "product/COMPONENT_ARCHITECTURE.md",
  "product/DESIGN_SYSTEM.md",
  "plans/007-specify-ui-foundations-and-responsive-contract.md",
  "plans/README.md"
]

const FOUNDATION_IDS = [
  "document-shell",
  "page-header",
  "layout-primitives",
  "prose-lists",
  "action-controls",
  "form-controls",
  "action-bar",
  "feedback-page-states",
  "live-region",
  "progress-position",
  "disclosure-dialog",
  "figure-image-viewport",
  "visually-hidden"
]

const ARCHETYPE_TEMPLATE_IDS = [
  "orientation",
  "study-launcher",
  "browse-reference",
  "focused-task",
  "review-results",
  "utility",
  "recovery"
]

const STATE_IDS = [
  "global-shell-ready",
  "review-queue-loading",
  "question-ready",
  "question-committing",
  "question-answered-revealed",
  "question-recoverable-error",
  "hazard-ready-visual",
  "hazard-marking-visual",
  "hazard-answered-revealed-visual",
  "hazard-ready-nonvisual",
  "hazard-answered-revealed-nonvisual",
  "atlas-index-ready",
  "atlas-family-comparison-ready",
  "profile-progressive-evidence-ready",
  "simulation-setup-ready",
  "simulation-results-ready",
  "settings-loading",
  "correction-validation-error",
  "settings-empty",
  "terminal-not-found",
  "simulation-recoverable-error",
  "settings-recoverable-error",
  "offline-loading",
  "simulation-active",
  "offline-empty",
  "simulation-final-confirmation",
  "offline-destructive-confirmation",
  "offline-recoverable-error",
  "print-preview-normal",
  "print-preview-large-print"
]

const MODE_IDS = [
  "width-320",
  "width-768",
  "width-1024",
  "width-1440",
  "app-text-125",
  "forced-colors",
  "reduced-motion",
  "print",
  "browser-zoom-400"
]

const TRANCHE_IDS = [
  "characterization-and-validation",
  "controls-and-feedback",
  "shell-and-navigation",
  "question-and-review",
  "hazard-and-simulation",
  "atlas-and-reference",
  "utility-offline-correction-print",
  "obsolete-selector-removal"
]

const CODEX_REVIEW_TASKS = new Map([
  ["component-api-coherence", "/root/component_contract_review_v2"],
  ["responsive-accessibility-behavior", "/root/responsive_accessibility_review_v2"],
  ["implementation-migration-risk", "/root/migration_risk_review_v2"]
])

const ROUTE_FAMILIES = [
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
  [17, ["transparency-index", "source", "corrections", "foil", "security", "privacy"]],
  [18, ["correction-submit"]],
  [19, ["settings"]],
  [20, ["offline-packs"]],
  [21, ["status"]]
]

const PROMOTION_VALUES = [
  ["accept", "ed"].join(""),
  ["DO", "NE"].join(""),
  ["select", "ed"].join("")
]
const PROHIBITED_EVIDENCE_KEYS = new Set([
  "approval",
  "approvalUrl",
  "approvedBy",
  "approver",
  "decisionOwner",
  "signoff",
  "signOff"
].map((value) => value.toLowerCase()))

const APPROVAL_CLAIM_PATTERNS = [
  /\b(?:owner|coordinator|participant|reviewer|approver|human)\s+(?:has\s+|has\s+now\s+)?(?:approved|accepted|selected|signed[- ]off)\b/i,
  /\b(?:approved|accepted|selected|signed[- ]off)\s+by\b/i,
  /\b(?:approval|sign[- ]?off)\s+(?:was\s+|has\s+been\s+)?(?:received|granted|recorded|complete|completed)\b/i,
  /\bhuman review\s+(?:is\s+|was\s+|has\s+been\s+)?(?:complete|completed|passed|satisfied)\b/i,
  /\bsupplement(?:ary|al) evidence\s+(?:can|may|does|will)\s+(?:replace|substitute|satisfy|count)\b/i,
  /\bhuman evidence\s+(?:is\s+|was\s+|has\s+been\s+)?(?:collected|present|available|used|credited)\b/i,
  /\b(?:codex )?agents?\s+(?:are|were|count(?:ed)? as)\s+(?:users|participants)\b/i
]

const UNMATCHED_DYNAMIC_HOOKS = [
  "hazard-result-marker--decoy-false-positive",
  "hazard-result-marker--duplicate",
  "hazard-result-marker--false-positive",
  "hazard-result-marker--hit"
]

const scriptPath = fileURLToPath(import.meta.url)
const repoRoot = resolve(dirname(scriptPath), "..")

const fail = (message) => {
  throw new Error(message)
}

const assert = (condition, message) => {
  if (!condition) fail(message)
}

const read = (path) => readFileSync(join(repoRoot, path), "utf8")

const git = (...args) => execFileSync("git", args, {
  cwd: repoRoot,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
}).trim()

const sortedUnique = (values) => [...new Set(values)].sort()

const sameSet = (actual, expected, label) => {
  const left = sortedUnique(actual)
  const right = sortedUnique(expected)
  assert(actual.length === left.length, `${label} contains duplicates`)
  assert(JSON.stringify(left) === JSON.stringify(right), `${label} set drifted`)
}

const exactKeys = (value, keys, label) => {
  assert(value !== null && typeof value === "object" && !Array.isArray(value), `${label} must be an object`)
  sameSet(Object.keys(value), keys, `${label} keys`)
}

const validateDynamicHookClosure = (inventoryHooks, assignmentRows, sourceHooks, label) => {
  sameSet(inventoryHooks, sourceHooks, `${label} inventory-to-source dynamic hooks`)
  sameSet(assignmentRows.flatMap((row) => row.unmatchedDynamicHooks), sourceHooks, `${label} assigned dynamic hooks`)
}

const validateCodexReviewLanes = (lanes) => {
  const reviewScopes = [...CODEX_REVIEW_TASKS.keys()]
  assert(lanes.length === 3, "Exactly three independent Codex review lanes are required")
  sameSet(lanes.map((row) => row.scope), reviewScopes, "Codex review scopes")
  sameSet(lanes.map((row) => row.laneId), reviewScopes, "Codex review lane IDs")
  sameSet(lanes.map((row) => row.canonicalTaskId), [...CODEX_REVIEW_TASKS.values()], "Codex canonical task IDs")
  for (const review of lanes) {
    assert(review.protocol === "CODEX-ONLY-UIUX-V1", `Codex lane ${review.laneId} has the wrong protocol`)
    assert(review.canonicalTaskId === CODEX_REVIEW_TASKS.get(review.scope), `Codex lane ${review.laneId} is not tied to its spawned canonical task`)
    assert(review.completionState === "completed", `Codex lane ${review.laneId} is not complete`)
    assert(review.reviewerType === "codex-subagent" && review.userParticipant === false, `Codex lane ${review.laneId} was counted as a user`)
    assert(review.humanEvidence === "none" && review.notHumanUsabilityTested === true && review.chainOfThoughtStored === false, `Codex lane ${review.laneId} claims prohibited human evidence or reasoning storage`)
    assert(review.evidenceCoordinates.length > 0, `Codex lane ${review.laneId} has no evidence coordinates`)
    for (const coordinate of review.evidenceCoordinates) validateSourceLocator(coordinate, `Codex lane ${review.laneId} evidence`)
    assert(review.findings.length > 0, `Codex lane ${review.laneId} has no structured findings`)
    for (const disposition of review.dissentDisposition) {
      exactKeys(disposition, ["dissent", "disposition", "evidenceCoordinates"], `Codex lane ${review.laneId} dissent disposition`)
      assert(["resolved", "retained-provisional", "retained-blocking"].includes(disposition.disposition), `Codex lane ${review.laneId} has an invalid dissent disposition`)
      assert(disposition.evidenceCoordinates.length > 0, `Codex lane ${review.laneId} has an unsubstantiated dissent disposition`)
      for (const coordinate of disposition.evidenceCoordinates) validateSourceLocator(coordinate, `Codex lane ${review.laneId} dissent evidence`)
    }
    for (const dissent of review.dissent) {
      assert(review.dissentDisposition.some((entry) => entry.dissent === dissent), `Codex lane ${review.laneId} has undisposed dissent`)
    }
    if (review.consensus === "blocking-dissent") {
      assert(review.dissentDisposition.some((entry) => entry.disposition === "retained-blocking"), `Codex lane ${review.laneId} does not honestly retain its blocker`)
    }
    assert(review.consensus === "no-blocking-dissent", `Codex lane ${review.laneId} retains blocking dissent`)
    assert(review.dissentDisposition.every((entry) => entry.disposition !== "retained-blocking"), `Codex lane ${review.laneId} has unresolved dissent`)
  }
  const migrationReview = lanes.find((review) => review.laneId === "implementation-migration-risk")
  assert(migrationReview.dissentDisposition.some((entry) => entry.disposition === "resolved" && entry.dissent.includes("hazard context and provider")), "Migration lane does not explicitly resolve the prior hazard-owner dissent")
}

const validateMetadata = (value, label) => {
  exactKeys(value, Object.keys(artifactMetadata), label)
  for (const [key, expected] of Object.entries(artifactMetadata)) {
    assert(value[key] === expected, `${label}.${key} must equal the provisional sentinel`)
  }
  const promotionSet = new Set(PROMOTION_VALUES.map((entry) => entry.toLowerCase()))
  for (const valueEntry of Object.values(value)) {
    if (typeof valueEntry === "string") {
      assert(!promotionSet.has(valueEntry.toLowerCase()), `${label} contains a promotion value`)
    }
  }
}

const assertNoApprovalClaims = (value, label) => {
  for (const pattern of APPROVAL_CLAIM_PATTERNS) {
    assert(!pattern.test(value), `${label} contains an approval or evidence-substitution claim`)
  }
}

const walkStructuredValues = (value, path = "payload") => {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => walkStructuredValues(entry, `${path}[${index}]`))
    return
  }
  if (value !== null && typeof value === "object") {
    for (const [key, entry] of Object.entries(value)) {
      assert(!PROHIBITED_EVIDENCE_KEYS.has(key.toLowerCase()), `${path}.${key} is approval-shaped`)
      walkStructuredValues(entry, `${path}.${key}`)
    }
    return
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    assert(!PROMOTION_VALUES.some((entry) => normalized === entry.toLowerCase()), `${path} contains a promotion value`)
    assertNoApprovalClaims(value, path)
  }
}

const parseFrontMatter = (markdown) => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/)
  assert(match !== null, "Markdown provisional metadata front matter is missing")
  const result = {}
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/)
    assert(field !== null, `Malformed front matter line: ${line}`)
    let value = field[2]
    if (value === "null") value = null
    else if (value === "true") value = true
    else if (value === "false") value = false
    else if (/^-?[0-9]+$/.test(value)) value = Number(value)
    assert(!Object.hasOwn(result, field[1]), `Duplicate front matter key: ${field[1]}`)
    result[field[1]] = value
  }
  return result
}

const parseUniqueJson = (source, label) => {
  let index = 0
  const skipWhitespace = () => {
    while (/\s/.test(source[index] ?? "")) index += 1
  }
  const scanString = () => {
    assert(source[index] === '"', `${label} expected a JSON string at byte ${index}`)
    const start = index
    index += 1
    while (index < source.length) {
      if (source[index] === "\\") {
        index += 2
        continue
      }
      if (source[index] === '"') {
        index += 1
        return JSON.parse(source.slice(start, index))
      }
      index += 1
    }
    fail(`${label} has an unterminated JSON string`)
  }
  const scanValue = (path) => {
    skipWhitespace()
    if (source[index] === "{") {
      index += 1
      skipWhitespace()
      const keys = new Set()
      if (source[index] === "}") {
        index += 1
        return
      }
      while (index < source.length) {
        skipWhitespace()
        const key = scanString()
        assert(!keys.has(key), `${label} contains duplicate key ${path}.${key}`)
        keys.add(key)
        skipWhitespace()
        assert(source[index] === ":", `${label} expected ':' after ${path}.${key}`)
        index += 1
        scanValue(`${path}.${key}`)
        skipWhitespace()
        if (source[index] === "}") {
          index += 1
          return
        }
        assert(source[index] === ",", `${label} expected ',' in ${path}`)
        index += 1
      }
      fail(`${label} has an unterminated object at ${path}`)
    }
    if (source[index] === "[") {
      index += 1
      skipWhitespace()
      if (source[index] === "]") {
        index += 1
        return
      }
      let item = 0
      while (index < source.length) {
        scanValue(`${path}[${item}]`)
        item += 1
        skipWhitespace()
        if (source[index] === "]") {
          index += 1
          return
        }
        assert(source[index] === ",", `${label} expected ',' in ${path}`)
        index += 1
      }
      fail(`${label} has an unterminated array at ${path}`)
    }
    if (source[index] === '"') {
      scanString()
      return
    }
    const scalar = source.slice(index).match(/^(?:true|false|null|-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?)/)
    assert(scalar !== null, `${label} has an invalid JSON value at ${path}`)
    index += scalar[0].length
  }
  scanValue("$")
  skipWhitespace()
  assert(index === source.length, `${label} has trailing JSON content`)
  return JSON.parse(source)
}

const extractPayload = (markdown) => {
  const start = "<!-- ui007-prework:inventory-json:start -->"
  const end = "<!-- ui007-prework:inventory-json:end -->"
  assert(markdown.split(start).length === 2, "Inventory JSON start marker must occur once")
  assert(markdown.split(end).length === 2, "Inventory JSON end marker must occur once")
  const pattern = /<!-- ui007-prework:inventory-json:start -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- ui007-prework:inventory-json:end -->/
  const match = markdown.match(pattern)
  assert(match !== null, "Inventory JSON fence is missing or malformed")
  return parseUniqueJson(match[1], "inventory payload JSON")
}

const walkFiles = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
  const path = join(directory, entry.name)
  return entry.isDirectory() ? walkFiles(path) : [path]
})

const inventorySourceFiles = () => [
  ...walkFiles(join(repoRoot, "apps/site/src")).filter((path) => /\.(?:ts|tsx)$/.test(path)),
  join(repoRoot, "apps/site/scripts/generate-pages.tsx")
]

const literalClassHooks = () => {
  const hooks = new Set()
  const expression = /class(?:Name)?\s*=\s*(?:\{\s*)?(["'])([\s\S]*?)\1\s*\}?/g
  for (const file of inventorySourceFiles()) {
    const source = readFileSync(file, "utf8")
    for (const match of source.matchAll(expression)) {
      for (const hook of match[2].split(/\s+/)) {
        if (/^[A-Za-z_][A-Za-z0-9_-]*$/.test(hook)) hooks.add(hook)
      }
    }
  }
  return [...hooks].sort()
}

const renderedDataAttributes = () => sortedUnique([...inventorySourceFiles(), join(repoRoot, "apps/site/public/offline.html")].flatMap((file) => {
  const source = readFileSync(file, "utf8")
  return [
    ...[...source.matchAll(/\b(data-[a-z0-9-]+)(?=\s|=|>)/g)].map((match) => match[1]),
    ...[...source.matchAll(/\b(?:setAttribute|toggleAttribute)\s*\(\s*["'](data-[a-z0-9-]+)["']/g)].map((match) => match[1])
  ]
}))

const vitestFormInventoryFromSource = (source, label) => {
  const discoveredForms = sortedUnique([...source.matchAll(/\bit(?:\.([A-Za-z_$][A-Za-z0-9_$]*))?\s*\(/g)]
    .map((match) => match[1] === undefined ? "it" : `it.${match[1]}`))
  sameSet(discoveredForms, ["it", "it.each", "it.effect"], `${label} Vitest call forms`)
  const direct = [...source.matchAll(/\bit\s*\(/g)].length
  const each = [...source.matchAll(/\bit\.each\s*\(/g)].length
  const effect = [...source.matchAll(/\bit\.effect\s*\(/g)].length
  return { direct, each, effect, total: direct + each + effect }
}

const vitestFormInventory = (paths, label) => vitestFormInventoryFromSource(
  paths.map((path) => read(path)).join("\n"),
  label
)

const cssInventory = () => {
  const css = read("apps/site/src/styles.css")
  const definedTokens = sortedUnique([...css.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1]))
  const referencedTokens = sortedUnique([...css.matchAll(/var\((--[a-z0-9-]+)/g)].map((match) => match[1]))
  const cssClassSelectors = sortedUnique([...css.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g)].map((match) => match[1]))
  const attributeSelectors = sortedUnique([...css.matchAll(/\[[^\]]+\]/g)]
    .map((match) => match[0])
    .filter((selector) => /^\[(?:data-|href)/.test(selector)))
  const undefinedTokenReferences = referencedTokens.filter((token) => !definedTokens.includes(token))
  const definedButUnusedTokens = definedTokens.filter((token) => !referencedTokens.includes(token))
  return { css, definedTokens, referencedTokens, definedButUnusedTokens, cssClassSelectors, attributeSelectors, undefinedTokenReferences }
}

const parseCurrentRouteIds = () => {
  const source = read("apps/site/src/route-registry.ts")
  const body = source.match(/CANONICAL_ROUTE_IDS\s*=\s*\[([\s\S]*?)\]\s*as const/)
  assert(body !== null, "Current route registry shape drifted")
  return sortedUnique([...body[1].matchAll(/["']([a-z0-9-]+)["']/g)].map((match) => match[1]))
}

const currentUnmatchedDynamicHooks = (cssClassSelectors) => {
  const source = read("apps/site/src/hazard-player/assessment.ts")
  const body = source.match(/export type MarkerAssessmentKind\s*=([\s\S]*?)\n\n/)
  assert(body !== null, "Hazard marker assessment-kind union drifted")
  const generated = sortedUnique([...body[1].matchAll(/["']([a-z_]+)["']/g)]
    .map((match) => `hazard-result-marker--${match[1].replaceAll("_", "-")}`))
  return generated.filter((hook) => !cssClassSelectors.includes(hook))
}

const validateSourceLocator = (locator, label) => {
  const match = locator.match(/^([^:]+):(\d+)$/)
  assert(match !== null, `${label} must be a repository-relative path:line locator`)
  const path = resolve(repoRoot, match[1])
  assert(path.startsWith(`${repoRoot}${sep}`), `${label} escapes the repository`)
  assert(statSync(path).isFile(), `${label} does not resolve to a regular file`)
  const line = Number(match[2])
  const lines = readFileSync(path, "utf8").split("\n")
  assert(line > 0 && line <= lines.length, `${label} line is invalid`)
  assert(lines[line - 1].trim().length > 0, `${label} points to a blank line`)
  return lines[line - 1]
}

const validateLocatorContent = (locator, snippets, label) => {
  const line = validateSourceLocator(locator, label)
  for (const snippet of snippets) assert(line.includes(snippet), `${label} does not contain ${snippet}`)
}

const validateMarkdownClaims = (markdown) => {
  assertNoApprovalClaims(markdown, "Markdown")
  const claimPatterns = [
    /^\s*(?:approved by|sign[- ]?off)\s*:/gim,
    /\b(?:accepted|selected)\s+(?:direction|token|archetype|contract)\b/gi
  ]
  for (const pattern of claimPatterns) {
    assert(!pattern.test(markdown), "Markdown contains a prohibited promotion or approval claim")
  }
  const evidenceBlock = markdown.match(/<!-- ui007-prework:evidence-accounting:start -->\s*```yaml\s*([\s\S]*?)\s*```\s*<!-- ui007-prework:evidence-accounting:end -->/)
  assert(evidenceBlock !== null, "Evidence accounting block is missing")
  const expectedLines = [
    "participantEvidence: none",
    "humanEvidence: none",
    "humanParticipantCount: 0",
    "notHumanUsabilityTested: true",
    "reviewMode: codex-only",
    "participantEvidenceRows: 0",
    "decisionRows: 0",
    "humanEvidenceRows: 0",
    "codexAgentsCountAsUsers: false",
    "supplementaryEvidenceCanSubstituteForDependencyShas: false",
    "realPlan007GateCredit: 0"
  ]
  sameSet(evidenceBlock[1].trim().split("\n"), expectedLines, "evidence accounting")
}

const validateSchema = (schema) => {
  walkStructuredValues(schema, "schema")
  exactKeys(schema, [
    "$schema", "$id", "title", "description", ...Object.keys(artifactMetadata),
    "x-provisionalMetadata", "type", "additionalProperties", "required", "properties", "$defs"
  ], "schema root")
  exactKeys(schema.$defs, [
    "dependencyDecisionShas", "identifier", "nonemptyString", "uniqueStrings", "nonemptyUniqueStrings", "sourceLocator",
    "repositoryFile", "sourceInventory", "foundation", "componentOwner", "routeFamily",
    "stateDimension", "screenStateFamily", "archetypeTemplate", "stateFixture", "mode",
    "harnessSpecification", "migrationTranche", "gapAssignment", "testCoverage", "supplementaryEvidence", "codexReviewLane", "codexDissentDisposition"
  ], "schema definitions")
  validateMetadata(Object.fromEntries(Object.keys(artifactMetadata).map((key) => [key, schema[key]])), "schema artifact metadata")
  validateMetadata(schema["x-provisionalMetadata"], "schema x-provisionalMetadata")
  assert(schema.$schema === "https://json-schema.org/draft/2020-12/schema", "Schema draft drifted")
  assert(schema.type === "object" && schema.additionalProperties === false, "Schema root must fail closed")
  const properties = schema.properties
  assert(properties !== null && typeof properties === "object", "Schema properties are missing")
  for (const [key, expected] of Object.entries(artifactMetadata)) {
    assert(Object.hasOwn(properties, key), `Schema does not require ${key}`)
    assert(properties[key].const === expected, `Schema ${key} sentinel drifted`)
  }
  sameSet(schema.required, Object.keys(properties), "schema root required properties")
  assert(properties.humanEvidenceRows.maxItems === 0, "Schema must reject human-evidence rows")
  assert(properties.decisionRecords.maxItems === 0, "Schema must reject provisional decision rows")
  const dependency = schema.$defs.dependencyDecisionShas.properties
  assert(dependency.step2DecisionSha.const === null && dependency.step3DecisionSha.const === null, "Schema must fail closed until both upstream SHAs are supplied in a later revision")
  assert(dependency.supplementaryEvidenceCanSubstitute.const === false, "Schema cannot replace upstream SHA dependencies with supplementary evidence")
  const supplementary = schema.$defs.supplementaryEvidence.properties
  assert(supplementary.evidenceClass.const === "non-user-supplementary-check", "Schema supplementary evidence class drifted")
  assert(supplementary.userParticipant.const === false, "Schema supplementary evidence cannot be a user participant")
  assert(supplementary.countsTowardHumanEvidence.const === false, "Schema supplementary evidence cannot count toward human evidence")
  assert(supplementary.countsTowardDecision.const === false, "Schema supplementary evidence cannot count toward a decision")
  assert(supplementary.canSubstituteForDependencyShas.const === false, "Schema supplementary evidence cannot substitute for dependency SHAs")
  const codexLane = schema.$defs.codexReviewLane.properties
  assert(codexLane.protocol.const === "CODEX-ONLY-UIUX-V1" && codexLane.completionState.const === "completed", "Schema must require completed CODEX-ONLY-UIUX-V1 receipts")
  assert(codexLane.userParticipant.const === false && codexLane.humanEvidence.const === "none" && codexLane.notHumanUsabilityTested.const === true && codexLane.chainOfThoughtStored.const === false, "Schema must keep Codex reviews non-user, non-human, and summary-only")
}

const resolveSchemaRef = (rootSchema, reference) => {
  assert(reference.startsWith("#/"), `Unsupported schema reference ${reference}`)
  return reference.slice(2).split("/").reduce((value, segment) => {
    const key = segment.replaceAll("~1", "/").replaceAll("~0", "~")
    assert(value !== null && typeof value === "object" && Object.hasOwn(value, key), `Broken schema reference ${reference}`)
    return value[key]
  }, rootSchema)
}

const validateAgainstSchema = (value, node, rootSchema, label = "payload") => {
  if (node.$ref !== undefined) {
    validateAgainstSchema(value, resolveSchemaRef(rootSchema, node.$ref), rootSchema, label)
    return
  }
  if (node.oneOf !== undefined) {
    let successes = 0
    for (const candidate of node.oneOf) {
      try {
        validateAgainstSchema(value, candidate, rootSchema, label)
        successes += 1
      } catch {
        // A oneOf branch is expected to reject when it does not describe the value.
      }
    }
    assert(successes === 1, `${label} must match exactly one schema branch`)
    return
  }
  if (Object.hasOwn(node, "const")) {
    assert(JSON.stringify(value) === JSON.stringify(node.const), `${label} violates const`)
  }
  if (node.enum !== undefined) {
    assert(node.enum.some((entry) => JSON.stringify(entry) === JSON.stringify(value)), `${label} is outside its enum`)
  }
  if (node.type !== undefined) {
    const actualType = value === null ? "null" : Array.isArray(value) ? "array" : Number.isInteger(value) ? "integer" : typeof value
    const allowedTypes = Array.isArray(node.type) ? node.type : [node.type]
    const compatible = allowedTypes.some((type) => type === actualType || (type === "number" && actualType === "integer"))
    assert(compatible, `${label} has type ${actualType}, expected ${allowedTypes.join("|")}`)
  }
  if (typeof value === "string") {
    if (node.minLength !== undefined) assert(value.length >= node.minLength, `${label} is too short`)
    if (node.pattern !== undefined) assert(new RegExp(node.pattern).test(value), `${label} does not match its pattern`)
  }
  if (typeof value === "number") {
    if (node.minimum !== undefined) assert(value >= node.minimum, `${label} is below its minimum`)
    if (node.maximum !== undefined) assert(value <= node.maximum, `${label} is above its maximum`)
  }
  if (Array.isArray(value)) {
    if (node.minItems !== undefined) assert(value.length >= node.minItems, `${label} has too few items`)
    if (node.maxItems !== undefined) assert(value.length <= node.maxItems, `${label} has too many items`)
    if (node.uniqueItems === true) {
      assert(new Set(value.map((entry) => JSON.stringify(entry))).size === value.length, `${label} contains duplicate items`)
    }
    if (node.items !== undefined) value.forEach((entry, index) => validateAgainstSchema(entry, node.items, rootSchema, `${label}[${index}]`))
  }
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const properties = node.properties ?? {}
    for (const key of node.required ?? []) assert(Object.hasOwn(value, key), `${label}.${key} is required`)
    if (node.additionalProperties === false) {
      for (const key of Object.keys(value)) assert(Object.hasOwn(properties, key), `${label}.${key} is not allowed`)
    }
    for (const [key, childSchema] of Object.entries(properties)) {
      if (Object.hasOwn(value, key)) validateAgainstSchema(value[key], childSchema, rootSchema, `${label}.${key}`)
    }
  }
}

const validatePayload = (payload) => {
  const rootKeys = [
    "schemaVersion",
    ...Object.keys(artifactMetadata),
    "sourceBaseSha",
    "dependencyDecisionShas",
    "inventoryMethod",
    "sourceInventory",
    "foundations",
    "componentOwners",
    "routeFamilies",
    "screenStateDimensions",
    "screenStateFamilies",
    "archetypeTemplates",
    "harnessSpecification",
    "migrationTranches",
    "gapAssignments",
    "testCoverage",
    "supplementaryEvidence",
    "codexReviewLanes",
    "humanEvidenceRows",
    "decisionRecords"
  ]
  exactKeys(payload, rootKeys, "inventory payload")
  validateMetadata(Object.fromEntries(Object.keys(artifactMetadata).map((key) => [key, payload[key]])), "payload metadata")
  walkStructuredValues(payload)
  assert(payload.schemaVersion === 1, "Payload schemaVersion must be 1")
  assert(payload.sourceBaseSha === SOURCE_BASE_SHA, "Payload source base drifted")
  assert(typeof payload.inventoryMethod === "string" && payload.inventoryMethod.length > 0, "Inventory method is missing")
  exactKeys(payload.dependencyDecisionShas, ["status", "step2DecisionSha", "step3DecisionSha", "shaFormat", "supplementaryEvidenceCanSubstitute"], "dependency SHA interface")
  assert(payload.dependencyDecisionShas.status === "awaiting-exact-accepted-shas", "Dependency interface status drifted")
  assert(payload.dependencyDecisionShas.step2DecisionSha === null && payload.dependencyDecisionShas.step3DecisionSha === null, "Provisional prework cannot claim upstream decision SHAs")
  assert(payload.dependencyDecisionShas.shaFormat === "40-lowercase-hex" && payload.dependencyDecisionShas.supplementaryEvidenceCanSubstitute === false, "Dependency SHA interface is not fail closed")
  assert(payload.humanEvidenceRows.length === 0, "Human-evidence rows must remain absent")
  assert(payload.decisionRecords.length === 0, "Decision rows must remain absent in provisional prework")

  const live = cssInventory()
  const inventory = payload.sourceInventory
  exactKeys(inventory, [
    "stylesheet",
    "stylesheetLineCount",
    "definedTokens",
    "referencedTokens",
    "undefinedTokenReferences",
    "definedButUnusedTokens",
    "cssClassSelectors",
    "attributeSelectors",
    "renderedDataAttributes",
    "literalClassHooks",
    "unmatchedLiteralHooks",
    "unmatchedDynamicHooks",
    "dynamicClassExpressions",
    "createRootEntrypoints",
    "responsiveModes"
  ], "sourceInventory")
  assert(inventory.stylesheet === "apps/site/src/styles.css", "Stylesheet owner drifted")
  assert(inventory.stylesheetLineCount === live.css.split("\n").length - 1, "Stylesheet line count drifted")
  sameSet(inventory.definedTokens, live.definedTokens, "defined tokens")
  sameSet(inventory.referencedTokens, live.referencedTokens, "referenced tokens")
  sameSet(inventory.undefinedTokenReferences, live.undefinedTokenReferences, "undefined token references")
  sameSet(inventory.definedButUnusedTokens, live.definedButUnusedTokens, "defined but unused tokens")
  sameSet(inventory.cssClassSelectors, live.cssClassSelectors, "CSS class selectors")
  sameSet(inventory.attributeSelectors, live.attributeSelectors, "CSS attribute selectors")
  sameSet(inventory.renderedDataAttributes, renderedDataAttributes(), "rendered data attributes")
  const literalHooks = literalClassHooks()
  sameSet(inventory.literalClassHooks, literalHooks, "literal class hooks")
  const unmatched = literalHooks.filter((hook) => !live.cssClassSelectors.includes(hook))
  sameSet(inventory.unmatchedLiteralHooks, unmatched, "unmatched literal hooks")
  sameSet(inventory.unmatchedDynamicHooks, currentUnmatchedDynamicHooks(live.cssClassSelectors), "unmatched dynamic hooks")
  sameSet(inventory.unmatchedDynamicHooks, UNMATCHED_DYNAMIC_HOOKS, "expected unmatched dynamic hooks")
  assert(inventory.definedTokens.length === 74, "Expected 74 current token definitions")
  assert(inventory.referencedTokens.length === 63, "Expected 63 current token references")
  assert(inventory.cssClassSelectors.length === 121, "Expected 121 current CSS class selectors")
  assert(inventory.literalClassHooks.length === 143, "Expected 143 literal class hooks")
  assert(inventory.unmatchedLiteralHooks.length === 41, "Expected 41 unmatched literal hooks")
  assert(inventory.renderedDataAttributes.length === 45, "Expected 45 rendered data attributes")
  assert(inventory.dynamicClassExpressions.length === 6, "Expected six inspected dynamic class-expression producers")
  sameSet(inventory.dynamicClassExpressions.map((row) => row.source), [
    "apps/site/scripts/generate-pages.tsx:342",
    "apps/site/scripts/generate-pages.tsx:1117",
    "apps/site/src/question-player/react/feedback.tsx:59",
    "apps/site/src/hazard-player/react/annotated-scene.tsx:42",
    "apps/site/src/print/react/preview.tsx:272",
    "apps/site/src/print/react/preview.tsx:305"
  ], "dynamic class-expression producers")
  for (const row of inventory.dynamicClassExpressions) validateSourceLocator(row.source, "dynamic class source")
  assert(inventory.createRootEntrypoints.length === 11, "Expected 11 React root entrypoints")
  for (const path of inventory.createRootEntrypoints) {
    const full = resolve(repoRoot, path)
    assert(full.startsWith(`${repoRoot}${sep}`) && statSync(full).isFile(), `Missing React root entrypoint ${path}`)
    assert(readFileSync(full, "utf8").includes("createRoot"), `${path} no longer owns a React root`)
  }
  const responsiveSources = new Map([
    ["base-minimum-width", ["apps/site/src/styles.css:310", "apps/site/src/styles.css:328"]],
    ["large-text", ["apps/site/src/styles.css:316"]],
    ["container-responsiveness", ["apps/site/src/styles.css:485"]],
    ["viewport-responsiveness", ["apps/site/src/styles.css:889"]],
    ["reduced-motion", ["apps/site/src/styles.css:318", "apps/site/src/styles.css:894"]],
    ["forced-colors", ["apps/site/src/styles.css:899"]],
    ["print", ["apps/site/src/styles.css:269", "apps/site/src/styles.css:910"]]
  ])
  sameSet(inventory.responsiveModes.map((row) => row.id), [...responsiveSources.keys()], "responsive-mode IDs")
  for (const row of inventory.responsiveModes) {
    sameSet(row.sources, responsiveSources.get(row.id), `responsive mode ${row.id} sources`)
    row.sources.forEach((locator) => validateSourceLocator(locator, `responsive mode ${row.id}`))
  }
  validateLocatorContent("apps/site/src/styles.css:310", ["html", "min-width: 20rem"], "html minimum-width anchor")
  validateLocatorContent("apps/site/src/styles.css:328", ["min-width: 20rem"], "body minimum-width anchor")
  validateLocatorContent("apps/site/src/styles.css:316", ["data-large-text", "125%"], "large-text anchor")
  validateLocatorContent("apps/site/src/styles.css:485", ["container-type: inline-size"], "container owner anchor")
  validateLocatorContent("apps/site/src/styles.css:889", ["max-width: 46rem"], "viewport-query anchor")
  validateLocatorContent("apps/site/src/styles.css:894", ["prefers-reduced-motion"], "reduced-motion anchor")
  validateLocatorContent("apps/site/src/styles.css:899", ["forced-colors"], "forced-colors anchor")
  validateLocatorContent("apps/site/src/styles.css:910", ["@media print"], "general print anchor")
  assert(!live.css.includes("@container"), "Current stylesheet unexpectedly gained a container query")

  sameSet(payload.foundations.map((row) => row.id), FOUNDATION_IDS, "foundation IDs")
  assert(payload.foundations.every((row) => row.decisionStatus === "pending" && row.apiStatus === "pending" && row.visualTokenStatus === "pending"), "Foundation decisions must remain pending")
  const foundationOwners = new Map([
    ["document-shell", ["apps/site/scripts/generate-pages.tsx:185", "apps/site/src/styles.css:351"]],
    ["page-header", ["apps/site/scripts/generate-pages.tsx:218", "apps/site/src/styles.css:455"]],
    ["layout-primitives", ["apps/site/src/styles.css:350", "apps/site/scripts/generate-pages.tsx:920"]],
    ["prose-lists", ["apps/site/scripts/generate-pages.tsx:293", "apps/site/src/styles.css:666"]],
    ["action-controls", ["apps/site/src/styles.css:531", "apps/site/scripts/generate-pages.tsx:927"]],
    ["form-controls", ["apps/site/src/question-player/react/question-form.tsx:28", "apps/site/src/styles.css:508"]],
    ["action-bar", ["apps/site/src/question-player/react/question-form.tsx:77", "apps/site/src/styles.css:530"]],
    ["feedback-page-states", ["apps/site/src/question-player/react/feedback.tsx:59", "apps/site/src/styles.css:556"]],
    ["live-region", ["apps/site/src/question-player/react/provider.tsx:62", "apps/site/src/print/react/preview.tsx:254"]],
    ["progress-position", ["apps/site/scripts/generate-pages.tsx:447", "apps/site/src/simulation/react/player.tsx:169"]],
    ["disclosure-dialog", ["apps/site/src/question-player/react/feedback.tsx:127", "apps/site/src/offline-packs/react/pack-manager.tsx:464"]],
    ["figure-image-viewport", ["apps/site/src/hazard-player/react/scene-viewport.tsx:11", "apps/site/src/styles.css:647"]],
    ["visually-hidden", ["apps/site/src/styles.css:875", "apps/site/scripts/generate-pages.tsx:452"]]
  ])
  for (const row of payload.foundations) {
    assert(row.members.length > 0 && row.currentOwners.length > 0 && row.observedGaps.length > 0, `Foundation ${row.id} is incomplete`)
    sameSet(row.currentOwners, foundationOwners.get(row.id), `foundation ${row.id} owners`)
    row.currentOwners.forEach((locator) => validateSourceLocator(locator, `foundation ${row.id} owner`))
  }
  validateLocatorContent("apps/site/src/styles.css:875", [".sr-only"], "visually-hidden owner")
  validateLocatorContent("apps/site/src/styles.css:350", ["@layer layout"], "layout owner")
  validateLocatorContent("apps/site/src/styles.css:531", [".button"], "action-control owner")
  validateLocatorContent("apps/site/src/question-player/react/question-form.tsx:28", ["<fieldset"], "form-control owner")

  assert(payload.componentOwners.length === 12, "Expected one static owner and 11 React roots")
  const componentOwnerLocators = new Map([
    ["static-document-generator", "apps/site/scripts/generate-pages.tsx:185"],
    ["question-player", "apps/site/src/question-player/react/player.tsx:14"],
    ["hazard-player", "apps/site/src/hazard-player/react/player.tsx:12"],
    ["review-queue", "apps/site/src/review/react/review-queue.tsx:90"],
    ["print-builder", "apps/site/src/print/react/builder.tsx:36"],
    ["print-preview", "apps/site/src/print/react/preview.tsx:232"],
    ["simulation-setup", "apps/site/src/simulation/react/setup.tsx:31"],
    ["simulation-player", "apps/site/src/simulation/react/player.tsx:76"],
    ["simulation-results", "apps/site/src/simulation/react/results.tsx:261"],
    ["settings", "apps/site/src/settings/react/settings.tsx:51"],
    ["offline-packs", "apps/site/src/offline-packs/react/pack-manager.tsx:100"],
    ["correction-form", "apps/site/src/corrections/react/correction-form.tsx:62"]
  ])
  sameSet(payload.componentOwners.map((row) => row.id), [...componentOwnerLocators.keys()], "component owner IDs")
  for (const owner of payload.componentOwners) {
    assert(owner.owner === componentOwnerLocators.get(owner.id), `Component owner ${owner.id} locator drifted`)
    validateSourceLocator(owner.owner, `component owner ${owner.id}`)
    if (owner.mount !== null) validateSourceLocator(owner.mount, `component mount ${owner.id}`)
  }

  sameSet(payload.routeFamilies.map((row) => row.number), ROUTE_FAMILIES.map(([number]) => number), "route family numbers")
  const routeOwners = new Map([
    [1, ["apps/site/scripts/generate-pages.tsx:913"]],
    [2, ["apps/site/scripts/generate-pages.tsx:1069"]],
    [3, []],
    [4, ["apps/site/scripts/generate-pages.tsx:1102"]],
    [5, ["apps/site/scripts/generate-pages.tsx:1129"]],
    [6, ["apps/site/scripts/generate-pages.tsx:1157"]],
    [7, ["apps/site/scripts/generate-pages.tsx:1183"]],
    [8, ["apps/site/scripts/generate-pages.tsx:1217"]],
    [9, []],
    [10, []],
    [11, ["apps/site/scripts/generate-pages.tsx:1332", "apps/site/src/question-player/react/player.tsx:14"]],
    [12, ["apps/site/scripts/generate-pages.tsx:1246", "apps/site/src/hazard-player/react/player.tsx:12"]],
    [13, ["apps/site/scripts/generate-pages.tsx:937", "apps/site/scripts/generate-pages.tsx:1359", "apps/site/src/review/react/review-queue.tsx:90", "apps/site/src/question-player/react/bootstrap.tsx:10"]],
    [14, ["apps/site/scripts/generate-pages.tsx:999", "apps/site/src/simulation/react/setup.tsx:31", "apps/site/src/simulation/react/player.tsx:76", "apps/site/src/simulation/react/results.tsx:261"]],
    [15, ["apps/site/scripts/generate-pages.tsx:961", "apps/site/src/print/react/builder.tsx:36", "apps/site/src/print/react/preview.tsx:232"]],
    [16, []],
    [17, ["apps/site/scripts/generate-pages.tsx:1262"]],
    [18, ["apps/site/scripts/generate-pages.tsx:1528", "apps/site/src/corrections/react/correction-form.tsx:62"]],
    [19, ["apps/site/scripts/generate-pages.tsx:1510", "apps/site/src/settings/react/settings.tsx:51"]],
    [20, ["apps/site/scripts/generate-pages.tsx:1484", "apps/site/src/offline-packs/react/pack-manager.tsx:100"]],
    [21, ["apps/site/scripts/generate-pages.tsx:1055", "apps/site/src/asset-router.ts:62"]]
  ])
  for (const [number, routeIds] of ROUTE_FAMILIES) {
    const row = payload.routeFamilies.find((candidate) => candidate.number === number)
    sameSet(row.routeIds, routeIds, `route family ${number} IDs`)
    sameSet(row.currentOwners, routeOwners.get(number), `route family ${number} current owners`)
    assert(row.decisionStatus === "pending", `Route family ${number} was promoted`)
    row.currentOwners.forEach((locator) => validateSourceLocator(locator, `route family ${number} owner`))
    assert(row.candidateTemplateIds.every((id) => ARCHETYPE_TEMPLATE_IDS.includes(id)), `Route family ${number} has an unknown template candidate`)
  }
  const implemented = payload.routeFamilies.flatMap((row) => row.implementedRouteIds)
  sameSet(implemented, parseCurrentRouteIds(), "current implemented route IDs")
  validateLocatorContent("apps/site/scripts/generate-pages.tsx:1183", ["pages.push"], "atlas-family owner")
  validateLocatorContent("apps/site/scripts/generate-pages.tsx:1217", ["pages.push"], "atlas-tool owner")
  validateLocatorContent("apps/site/src/asset-router.ts:62", ["terminalDocument"], "terminal-document owner")
  validateLocatorContent("apps/site/src/review/react/review-queue.tsx:90", ["ReviewQueueIsland"], "review-queue owner")

  const expectedDimensionSources = new Map([
    ["availability", "product/SCREEN_STATES.md:24"],
    ["operation", "product/SCREEN_STATES.md:25"],
    ["connectivity", "product/SCREEN_STATES.md:26"],
    ["persistence", "product/SCREEN_STATES.md:27"],
    ["interaction", "product/SCREEN_STATES.md:28"],
    ["freshness", "product/SCREEN_STATES.md:29"]
  ])
  sameSet(payload.screenStateDimensions.map((row) => row.id), [...expectedDimensionSources.keys()], "screen-state dimension IDs")
  for (const row of payload.screenStateDimensions) {
    assert(row.source === expectedDimensionSources.get(row.id), `Screen-state dimension ${row.id} anchor drifted`)
    validateSourceLocator(row.source, `screen-state dimension ${row.id}`)
  }
  const expectedStateFamilies = new Map([
    ["reference-index-document", {
      sources: ["product/SCREEN_STATES.md:77"],
      maintained: ["ready(current|stale)", "filter/search -> ready|empty", "background refresh -> ready(current)|offline-stale|recoverable-error", "resource withdrawn -> withdrawn", "initial failure -> offline-unavailable|content-unavailable|not-found"],
      current: ["static document plus optional enhancement; no shared tagged union"]
    }],
    ["question-commit-reveal", {
      sources: ["product/SCREEN_STATES.md:94", "apps/site/src/question-player/state.ts:5"],
      maintained: ["restoring", "ready", "interaction=selected", "committing", "answered-revealed", "reviewed", "completed", "recoverable-error", "content-unavailable"],
      current: ["tag=ready", "tag=restoring", "tag=restore_failed", "tag=content_unavailable", "tag=committing", "tag=commit_failed", "tag=reveal_failed", "tag=revealed"]
    }],
    ["hazard-commit-reveal", {
      sources: ["product/SCREEN_STATES.md:122", "apps/site/src/hazard-player/state.ts:4"],
      maintained: ["restoring", "ready", "marking", "confirm-zero", "committing", "answered-revealed", "reviewed", "completed", "recoverable-error"],
      current: ["tag=ready", "tag=confirm_zero", "tag=restoring", "tag=restore_failed", "tag=content_unavailable", "tag=asset_unavailable", "tag=committing", "tag=commit_failed", "tag=reveal_failed", "tag=revealed"]
    }],
    ["review-queue", {
      sources: ["product/SCREEN_STATES.md:237", "apps/site/src/review/model.ts:85"],
      maintained: ["loading", "ready", "empty", "recoverable-error", "pending rebuild", "explicit review variants", "quarantined historical object"],
      current: ["tag=loading", "tag=ready", "tag=empty", "tag=recoverable_error", "quarantined entries nested in ready or recoverable_error"]
    }],
    ["simulation", {
      sources: ["product/SCREEN_STATES.md:138", "apps/site/src/simulation/react/setup.tsx:73", "apps/site/src/simulation/controller.ts:26", "apps/site/src/simulation/controller.ts:744"],
      maintained: ["setup", "generating", "active(unanswered|recorded)", "final-confirmation", "submitting", "reconciling", "results", "recoverable-error", "completed"],
      current: ["setup tag=idle", "setup tag=creating", "setup tag=failure", "player tag=restoring", "player tag=ready", "player tag=failure", "results tag=reconciling", "results tag=results", "results tag=failure"]
    }],
    ["print-workflow", {
      sources: ["product/SCREEN_STATES.md:155", "apps/site/src/print/controller.ts:24", "apps/site/src/print/controller.ts:40"],
      maintained: ["configuring", "generating", "preview-ready", "stale", "recoverable-error", "system-print-requested"],
      current: ["builder tag=configuring", "builder tag=generating", "builder tag=recoverable-error", "preview tag=restoring", "preview tag=preview-ready", "preview tag=stale", "preview tag=system-print-requested", "preview tag=regenerating", "preview tag=regenerate-error", "preview tag=content-unavailable", "preview tag=recoverable-error"]
    }],
    ["offline-pack-lifecycle", {
      sources: ["product/SCREEN_STATES.md:169", "apps/site/src/offline-packs/react/pack-manager.tsx:100"],
      maintained: ["absent", "downloading", "paused-offline", "verifying", "staged", "activating", "active", "update-available", "quarantined", "removing", "retained", "recoverable-error"],
      current: ["component-local packs/busy/notice/problem/completion/storage state; no shared tagged screen union"]
    }],
    ["correction-report", {
      sources: ["product/SCREEN_STATES.md:185", "apps/site/src/corrections/react/correction-form.tsx:62"],
      maintained: ["draft", "validating", "ready-to-submit", "submitting", "submitted", "local-draft-saved", "validation-errors", "recoverable-error"],
      current: ["component-local draft/loading/busy/notice/problem/validation/receipt state; no shared tagged screen union"]
    }],
    ["settings-data-operations", {
      sources: ["product/SCREEN_STATES.md:199", "apps/site/src/settings/react/settings.tsx:51"],
      maintained: ["idle", "decoding", "validated-preview", "committing", "complete", "reconciling", "quarantined", "recoverable-error"],
      current: ["component-local preferences/import/reset/rebuild/busy/problem/completion state; no shared tagged screen union"]
    }],
    ["terminal-recovery", {
      sources: ["product/SCREEN_STATES.md:245", "apps/site/src/asset-router.ts:62"],
      maintained: ["not-found", "withdrawn", "offline-unavailable", "content-unavailable", "storage-unavailable", "service-unavailable", "terminal-error"],
      current: ["typed static terminal document; no shared runtime tagged union"]
    }]
  ])
  sameSet(payload.screenStateFamilies.map((row) => row.id), [...expectedStateFamilies.keys()], "screen-state family IDs")
  for (const row of payload.screenStateFamilies) {
    const expected = expectedStateFamilies.get(row.id)
    sameSet(row.sources, expected.sources, `screen-state family ${row.id} sources`)
    sameSet(row.maintainedContractStates, expected.maintained, `screen-state family ${row.id} maintained states`)
    sameSet(row.currentImplementationStates, expected.current, `screen-state family ${row.id} current states`)
    row.sources.forEach((locator) => validateSourceLocator(locator, `screen-state family ${row.id}`))
  }
  validateLocatorContent("product/SCREEN_STATES.md:169", ["Offline pack"], "offline state-family anchor")
  validateLocatorContent("product/SCREEN_STATES.md:185", ["Correction/security report"], "correction state-family anchor")
  validateLocatorContent("product/SCREEN_STATES.md:199", ["Import, projection rebuild, and reset"], "settings state-family anchor")

  sameSet(payload.archetypeTemplates.map((row) => row.id), ARCHETYPE_TEMPLATE_IDS, "archetype template IDs")
  assert(payload.archetypeTemplates.every((row) => row.decisionStatus === "pending" && row.tokenInputs === null && row.thresholds === null), "Archetype templates must remain dependency-neutral and pending")

  const harness = payload.harnessSpecification
  sameSet(harness.states.map((row) => row.id), STATE_IDS, "representative state IDs")
  sameSet(harness.modes.map((row) => row.id), MODE_IDS, "mode IDs")
  sameSet(sortedUnique(harness.states.map((row) => row.candidateTemplateId)), ARCHETYPE_TEMPLATE_IDS, "represented archetype templates")
  const maintainedRouteIds = ROUTE_FAMILIES.flatMap(([, routeIds]) => routeIds)
  assert(harness.states.every((row) => maintainedRouteIds.includes(row.routeId)), "Harness contains an unknown route ID")
  const criticalCoordinates = new Map([
    ["review-queue-loading", ["review-queue", "review-results"]],
    ["correction-validation-error", ["correction-submit", "utility"]],
    ["terminal-not-found", ["status", "recovery"]],
    ["simulation-active", ["simulation-player", "focused-task"]],
    ["simulation-final-confirmation", ["simulation-player", "focused-task"]],
    ["simulation-recoverable-error", ["simulation-player", "focused-task"]]
  ])
  for (const [id, [routeId, templateId]] of criticalCoordinates) {
    const state = harness.states.find((row) => row.id === id)
    assert(state.routeId === routeId && state.candidateTemplateId === templateId, `Harness coordinate ${id} drifted`)
  }
  assert(harness.totalPlannedRows === 270, "Harness total must be 270")
  assert(harness.automatedPlannedRows === 270, "All 270 harness rows must remain automated specifications")
  assert(harness.currentRows === 0, "Provisional packet must not claim future harness rows")
  assert(harness.modes.every((row) => row.kind === "automated-specification" && row.evidence === null), "All nine modes must remain unevidenced automated specifications")
  const zoomMode = harness.modes.find((row) => row.id === "browser-zoom-400")
  assert(zoomMode !== undefined, "The deterministic 400 percent browser mode is missing")

  sameSet(payload.migrationTranches.map((row) => row.id), TRANCHE_IDS, "migration tranche IDs")
  sameSet(payload.migrationTranches.map((row) => row.order), [1, 2, 3, 4, 5, 6, 7, 8], "migration tranche orders")
  const routeUnion = []
  const prerequisiteIds = []
  const migrationFiles = []
  const migrationFoundations = []
  for (const tranche of payload.migrationTranches) {
    assert(TRANCHE_IDS[tranche.order - 1] === tranche.id, `Tranche ${tranche.id} order drifted`)
    assert(tranche.currentFiles.length > 0 && tranche.prerequisiteFixtures.length > 0 && tranche.removalCriteria.length > 0 && tranche.stopBoundary.length > 0, `Tranche ${tranche.id} is incomplete`)
    for (const path of tranche.currentFiles) {
      const full = resolve(repoRoot, path)
      assert(full.startsWith(`${repoRoot}${sep}`), `Tranche path escapes repository: ${path}`)
      assert(statSync(full).isFile(), `Tranche file is not current: ${path}`)
    }
    assert(tranche.foundationIds.every((id) => FOUNDATION_IDS.includes(id)), `Tranche ${tranche.id} has an unknown foundation ID`)
    routeUnion.push(...tranche.routeFamilyNumbers)
    prerequisiteIds.push(...tranche.prerequisiteFixtures)
    migrationFiles.push(...tranche.currentFiles)
    migrationFoundations.push(...tranche.foundationIds)
  }
  const routeNumberUnion = [...new Set(routeUnion)].sort((left, right) => left - right)
  assert(
    JSON.stringify(routeNumberUnion) === JSON.stringify(ROUTE_FAMILIES.map(([number]) => number)),
    "migration route-family union drifted"
  )
  for (const required of [
    "navigation-state-gating-characterization",
    "local-data-restoration-characterization",
    "review-variant-characterization"
  ]) {
    assert(prerequisiteIds.filter((entry) => entry === required).length === 1, `${required} must occur exactly once`)
  }
  sameSet(sortedUnique(migrationFoundations), FOUNDATION_IDS, "migration foundation coverage")
  for (const requiredFile of [
    "apps/site/public/offline.html",
    "apps/site/src/hazard-player/react/annotated-scene.tsx",
    "apps/site/src/hazard-player/react/zone-navigator.tsx",
    "apps/site/src/settings/preferences-boot.ts",
    "apps/site/src/simulation/react/bootstrap-results.tsx",
    "apps/site/src/simulation/react/bootstrap-setup.tsx"
  ]) assert(migrationFiles.includes(requiredFile), `Migration map omits current UI producer ${requiredFile}`)
  const trackedUiTsx = git("ls-files", "apps/site/src").split("\n").filter((path) => path.endsWith(".tsx"))
  for (const path of trackedUiTsx) assert(migrationFiles.includes(path), `Migration map omits tracked TSX UI producer ${path}`)

  sameSet(payload.gapAssignments.map((row) => row.trancheId), TRANCHE_IDS, "gap-assignment tranche IDs")
  const assignedTokens = payload.gapAssignments.flatMap((row) => row.undefinedTokens)
  const assignedHooks = payload.gapAssignments.flatMap((row) => row.unmatchedHooks)
  sameSet(assignedTokens, live.undefinedTokenReferences, "assigned undefined tokens")
  sameSet(assignedHooks, unmatched, "assigned unmatched hooks")
  validateDynamicHookClosure(
    inventory.unmatchedDynamicHooks,
    payload.gapAssignments,
    currentUnmatchedDynamicHooks(live.cssClassSelectors),
    "gap assignment"
  )

  const browserFiles = walkFiles(join(repoRoot, "apps/site/browser-tests")).filter((path) => path.endsWith(".pw.ts"))
  const browserDeclarations = browserFiles.reduce((count, path) => count + [...readFileSync(path, "utf8").matchAll(/\btest\s*\(/g)].length, 0)
  const browserSource = browserFiles.map((path) => readFileSync(path, "utf8")).join("\n")
  const testInventory = payload.testCoverage
  const trackedUnitFiles = git("ls-files", "apps", "packages").split("\n").filter((path) => /\.(?:test|spec)\.ts$/.test(path))
  const siteUnitFiles = trackedUnitFiles.filter((path) => path.startsWith("apps/site/test/"))
  const siteVitest = vitestFormInventory(siteUnitFiles, "site")
  const workspaceVitest = vitestFormInventory(trackedUnitFiles, "workspace")
  assert(testInventory.siteVitestFiles === siteUnitFiles.length, "Site Vitest file inventory drifted")
  assert(testInventory.siteVitestDirectCallsites === siteVitest.direct, "Site direct-it callsite inventory drifted")
  assert(testInventory.siteVitestEachCallsites === siteVitest.each, "Site it.each callsite inventory drifted")
  assert(testInventory.siteVitestEffectCallsites === siteVitest.effect, "Site it.effect callsite inventory drifted")
  assert(testInventory.siteVitestCallsites === siteVitest.total, "Site total Vitest callsite inventory drifted")
  assert(testInventory.workspaceVitestFiles === trackedUnitFiles.length, "Workspace Vitest file inventory drifted")
  assert(testInventory.workspaceVitestDirectCallsites === workspaceVitest.direct, "Workspace direct-it callsite inventory drifted")
  assert(testInventory.workspaceVitestEachCallsites === workspaceVitest.each, "Workspace it.each callsite inventory drifted")
  assert(testInventory.workspaceVitestEffectCallsites === workspaceVitest.effect, "Workspace it.effect callsite inventory drifted")
  assert(testInventory.workspaceVitestCallsites === workspaceVitest.total, "Workspace total Vitest callsite inventory drifted")
  assert(siteVitest.direct === 177 && siteVitest.each === 7 && siteVitest.effect === 40 && siteVitest.total === 224, "Expected the independently confirmed site Vitest form inventory")
  assert(workspaceVitest.direct === 224 && workspaceVitest.each === 14 && workspaceVitest.effect === 40 && workspaceVitest.total === 278, "Expected the independently confirmed workspace Vitest form inventory")
  assert(testInventory.playwrightFiles === browserFiles.length && testInventory.playwrightDeclarations === browserDeclarations, "Browser test inventory drifted")
  assert(testInventory.playwrightFiles === 11 && testInventory.playwrightDeclarations === 70, "Expected 11 browser files and 70 current test declarations")
  assert(testInventory.projects.length === 3, "Expected three configured browser projects")
  const coverageCounts = {
    focusAssertions: [...browserSource.matchAll(/toBeFocused\s*\(/g)].length,
    explicitTabSequences: [...browserSource.matchAll(/keyboard\.press\s*\(\s*["'](?:Shift\+)?Tab["']/g)].length,
    viewport320Cases: [...browserSource.matchAll(/width\s*:\s*320/g)].length,
    largeTextAttributeAssertions: [...browserSource.matchAll(/toHaveAttribute\s*\(\s*["']data-large-text["']/g)].length,
    axeCases: [...browserSource.matchAll(/new AxeBuilder/g)].length,
    forcedColorCases: [...browserSource.matchAll(/forcedColors/g)].length,
    reducedMotionCases: [...browserSource.matchAll(/reducedMotion/g)].length,
    printMediaEmulations: [...browserSource.matchAll(/media\s*:\s*["']print["']/g)].length
  }
  for (const [key, count] of Object.entries(coverageCounts)) {
    assert(testInventory[key] === count, `Browser ${key} inventory drifted`)
  }
  assert(testInventory.futureMatrixCoverage === "none", "Current tests cannot be represented as future matrix coverage")

  for (const evidence of payload.supplementaryEvidence) {
    exactKeys(evidence, [
      "id",
      "command",
      "result",
      "subject",
      "evidenceClass",
      "userParticipant",
      "countsTowardHumanEvidence",
      "countsTowardDecision",
      "canSubstituteForDependencyShas",
      "note"
    ], `supplementary evidence ${evidence.id}`)
    assert(evidence.subject === "current-site-not-plan007-prototype", `Evidence ${evidence.id} has the wrong subject`)
    assert(evidence.evidenceClass === "non-user-supplementary-check" && evidence.userParticipant === false && evidence.countsTowardHumanEvidence === false && evidence.countsTowardDecision === false && evidence.canSubstituteForDependencyShas === false, `Evidence ${evidence.id} claims prohibited credit`)
    assert(["pass", "fail", "pending"].includes(evidence.result), `Evidence ${evidence.id} has an invalid result`)
  }

  validateCodexReviewLanes(payload.codexReviewLanes)
}

const validateRepositoryState = () => {
  assert(git("rev-parse", SOURCE_BASE_SHA) === SOURCE_BASE_SHA, "Source base is unavailable")
  execFileSync("git", ["merge-base", "--is-ancestor", SOURCE_BASE_SHA, "HEAD"], { cwd: repoRoot, stdio: "ignore" })
  for (const path of PROTECTED_PATHS) {
    const baseBytes = execFileSync("git", ["show", `${SOURCE_BASE_SHA}:${path}`], { cwd: repoRoot })
    const liveBytes = readFileSync(join(repoRoot, path))
    assert(createHash("sha256").update(baseBytes).digest("hex") === createHash("sha256").update(liveBytes).digest("hex"), `${path} changed during provisional prework`)
  }
  const changed = new Set(git("diff", "--name-only", SOURCE_BASE_SHA, "--").split("\n").filter(Boolean))
  const statusLines = git("status", "--porcelain=v1", "--untracked-files=all").split("\n").filter(Boolean)
  for (const line of statusLines) changed.add(line.slice(3))
  for (const path of changed) assert(EXPECTED_ARTIFACTS.includes(path), `Out-of-scope path changed: ${path}`)
  for (const path of EXPECTED_ARTIFACTS) assert(statSync(join(repoRoot, path)).isFile(), `Missing provisional artifact ${path}`)
  const guardedPaths = [...PROTECTED_PATHS, ...EXPECTED_ARTIFACTS]
  const indexRows = git("ls-files", "-v", "--", ...guardedPaths).split("\n").filter(Boolean)
  sameSet(indexRows.map((row) => row.slice(2)), guardedPaths, "guarded indexed paths")
  for (const row of indexRows) assert(row.startsWith("H "), `Guarded path has a non-default index flag: ${row}`)

  const planIndex = read("plans/README.md")
  for (const number of ["004", "005", "006", "007"]) {
    const row = planIndex.split("\n").find((line) => line.startsWith(`| ${number} |`))
    assert(row !== undefined, `Plan ${number} status row is missing`)
    const status = row.split("|")[6]?.trim() ?? ""
    assert(!status.startsWith(PROMOTION_VALUES[1]), `Plan ${number} was marked complete`)
  }
  const plan007Row = planIndex.split("\n").find((line) => line.startsWith("| 007 |"))
  assert(plan007Row.includes("| BLOCKED"), "Plan 007 status must remain blocked")
}

const validateValidatorArtifact = () => {
  const source = read("plans/validate-007-ui-foundations-prework.mjs")
  sameSet([...source.matchAll(/\bexport const ([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g)].map((match) => match[1]), ["artifactMetadata"], "validator exports")
  assert(!/\b(?:approvedBy|approvalUrl|approver|decisionOwner|signoff)\s*(?:=|:)/i.test(source), "Validator source contains an approval-shaped assignment")
}

const expectRejected = (operation, label) => {
  let rejected = false
  try {
    operation()
  } catch {
    rejected = true
  }
  assert(rejected, `${label} mutation was not rejected`)
}

const runMutationSelfTests = (payload) => {
  for (const field of ["status", "decisionStatus"]) {
    for (const promotion of PROMOTION_VALUES) {
      const mutated = { ...artifactMetadata, [field]: promotion }
      expectRejected(() => validateMetadata(mutated, "mutation"), `promotion ${field}`)
    }
  }
  for (const key of ["approvalUrl", "approvedBy", "decisionOwner", "signoff"]) {
    expectRejected(() => walkStructuredValues({ [key]: "fabricated" }), `approval-shaped key ${key}`)
  }
  for (const [field, prohibited] of [
    ["humanEvidence", "present"],
    ["humanParticipantCount", 1],
    ["notHumanUsabilityTested", false],
    ["reviewMode", "human"]
  ]) {
    expectRejected(() => validateMetadata({ ...artifactMetadata, [field]: prohibited }, "mutation"), `human-evidence metadata ${field}`)
  }
  expectRejected(
    () => walkStructuredValues({ note: ["owner", "approved", "this direction"].join(" ") }),
    "approval prose"
  )
  expectRejected(
    () => walkStructuredValues({ note: ["Codex", "agents", "are", "users"].join(" ") }),
    "Codex agents counted as users"
  )
  expectRejected(
    () => parseFrontMatter(["---", "status: accepted", "status: provisional-prework", "---", ""].join("\n")),
    "duplicate front matter"
  )
  expectRejected(
    () => parseUniqueJson('{"decisionStatus":"accepted","decisionStatus":"pending"}', "mutation JSON"),
    "duplicate JSON key"
  )
  expectRejected(
    () => vitestFormInventoryFromSource("it(() => {}); it.skip(() => {})", "mutation"),
    "unaccounted Vitest form"
  )
  const dynamicRows = (hooks) => [{ unmatchedDynamicHooks: hooks }]
  expectRejected(
    () => validateDynamicHookClosure(UNMATCHED_DYNAMIC_HOOKS, dynamicRows(UNMATCHED_DYNAMIC_HOOKS.slice(1)), UNMATCHED_DYNAMIC_HOOKS, "mutation"),
    "dynamic-hook assignment omission"
  )
  expectRejected(
    () => validateDynamicHookClosure(UNMATCHED_DYNAMIC_HOOKS, dynamicRows([...UNMATCHED_DYNAMIC_HOOKS, UNMATCHED_DYNAMIC_HOOKS[0]]), UNMATCHED_DYNAMIC_HOOKS, "mutation"),
    "dynamic-hook assignment duplicate"
  )
  expectRejected(
    () => validateCodexReviewLanes(payload.codexReviewLanes.map((review, index) => index === 0 ? { ...review, userParticipant: true } : review)),
    "Codex lane counted as a user"
  )
  expectRejected(
    () => validateCodexReviewLanes(payload.codexReviewLanes.map((review, index) => index === 0 ? { ...review, completionState: "running" } : review)),
    "incomplete Codex receipt"
  )
  expectRejected(
    () => validateCodexReviewLanes(payload.codexReviewLanes.map((review, index) => index === 2 ? { ...review, consensus: "blocking-dissent", dissent: ["retained concern"], dissentDisposition: [{ dissent: "retained concern", disposition: "retained-blocking", evidenceCoordinates: review.evidenceCoordinates.slice(0, 1) }] } : review)),
    "retained blocking dissent"
  )
  const branchGate = ["git(\"branch\"", "\"--show-current\")"].join(", ")
  assert(!read("plans/validate-007-ui-foundations-prework.mjs").includes(branchGate), "Durable validation must remain branch-agnostic")
}

try {
  assert(process.argv.length === 2 || (process.argv.length === 3 && process.argv[2] === "--self-test"), "Usage: node plans/validate-007-ui-foundations-prework.mjs [--self-test]")
  validateMetadata(artifactMetadata, "validator artifact metadata")
  validateValidatorArtifact()
  validateRepositoryState()
  const markdown = read("plans/007-ui-foundations-prework.md")
  validateMetadata(parseFrontMatter(markdown), "Markdown front matter")
  validateMarkdownClaims(markdown)
  const schema = parseUniqueJson(read("plans/007-ui-foundations-source-inventory.schema.json"), "schema JSON")
  validateSchema(schema)
  const payload = extractPayload(markdown)
  validateAgainstSchema(payload, schema, schema)
  validatePayload(payload)
  runMutationSelfTests(payload)
  process.stdout.write("ui007 provisional-prework: PASS\n")
} catch (error) {
  process.stderr.write(`ui007 provisional-prework: FAIL — ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
}
