import { createHash } from "node:crypto"
import { execFileSync, spawnSync } from "node:child_process"
import { readFileSync, statSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")
const researchRoot = "research/ui-ux/consumer-visual-system"
const manifestPath = `${researchRoot}/evidence-manifest.json`
const schemaPath = `${researchRoot}/evidence-manifest.schema.json`
const reportPath = `${researchRoot}/README.md`
const taskReceiptPath = `${researchRoot}/review-task-receipts.json`
const schemaProfile = "draft-2020-12-portable-subset-v1"
// Update this one value only after an intentional, reviewed schema change.
const expectedCanonicalSchemaSha256 = "f27769739c3b720ea45581e8353be76ba57e5ceda34c7adcce58c9959b96f7b4"

const STEP2_SUBJECT_SHA = "4130693dee6caaa804a116f490b2192861f53e6e"
const STEP2_MERGE_SHA = "d823e928b0b57f589fd1c64a85db4ae0f6d2f0d1"
const STEP2_TREE_SHA = "2c81903699d209516eba50a07b606ec9166e78a2"
const CONTENT_DESIGN_SHA256 = "91061006ffd60984b30bc9f7e7413d32ce3e57541260c71c932979eb7e4cd390"
const ROUTES_SHA256 = "501230759f15e6ccd13e1a49d24db1e3ee94d7a52e80634490c7ff7b08c24e98"
const TERRITORY_IDS = Object.freeze(["A", "B", "C"])
const RUBRIC_IDS = Object.freeze([
  "consumer-trust-anti-ai-slop",
  "accessibility-cognitive-load",
  "visual-component-coherence"
])
const REVIEW_TASK_PATHS = Object.freeze({
  "consumer-trust-anti-ai-slop": "/root/audit_lifecycle_precommit/review_consumer_trust_r3",
  "accessibility-cognitive-load": "/root/audit_lifecycle_precommit/review_consumer_trust_r3/review_accessibility_r3",
  "visual-component-coherence": "/root/audit_lifecycle_precommit/review_consumer_trust_r3/review_visual_coherence_r3"
})
const REVIEW_PROMPT_PATHS = Object.freeze(Object.fromEntries(RUBRIC_IDS.map((rubricId) => [rubricId, `${researchRoot}/review-prompts/${rubricId}.md`])))
const REVIEW_OUTPUT_PATHS = Object.freeze({
  "consumer-trust-anti-ai-slop": `${researchRoot}/reviews/consumer-trust-anti-ai-slop.json`,
  "accessibility-cognitive-load": `${researchRoot}/reviews/accessibility-cognitive-load.json`,
  "visual-component-coherence": `${researchRoot}/reviews/visual-component-coherence.json`
})
const REJECTED_REVIEW_SUBJECT_SHAS = new Set([
  "7fcc776e6941c7f41a504dda59ea59af88ba31fb",
  "f1a566f3eabb5bc972d75a555038e3b315a211a2"
])
const REVIEW_AUDIT_PARENT_THREAD_ID = "01a04a64-3e78-72b2-8045-a25334d3f1be"
const REJECTED_REVIEW_SESSION_UUIDS = new Set([
  "01a04a02-5ef1-79a3-b612-3179d9ee5fea",
  "01a04a02-b7b2-7fd2-aaea-3496b38b0393",
  "01a04a03-1263-7101-bdff-5ad2ff732ba4"
])
const RECEIPT_AUTHENTICATION_LIMITATION = "Local Codex state and rollout records are not cryptographic proof of task identity, timing, or cross-output non-observability; ordinary CI can validate only the committed receipt bytes and declared joins."
const TRUST_LANE_ORCHESTRATION_INSTRUCTION = `Topology duty for this lane only: after the parent audit task has completed and freed its slot, call spawn_agent with leaf task_name=review_accessibility_r3 and leaf task_name=review_visual_coherence_r3, fork_turns=none, and their exact rendered task messages. Require the exposed returned canonical task paths to equal ${REVIEW_TASK_PATHS["accessibility-cognitive-load"]} and ${REVIEW_TASK_PATHS["visual-component-coherence"]}. Send only each exact exposed raw spawn response JSON to /root; do not request, read, or relay either child output. Then complete this trust review while both child lanes remain active.`
const CHILD_LANE_RELEASE_INSTRUCTION = "Output barrier for this lane: analyze independently, but do not write or send the final JSON until /root sends the exact release token RELEASE_REVIEW_OUTPUT after the trust lane has completed. While waiting, do not request or read any other lane output."
const HISTORICAL_PREWORK_SHA = "74c6799fbcef587e44c5c5f3854258db516a9aaa"
const RUBRIC_CRITERIA = Object.freeze({
  "consumer-trust-anti-ai-slop": [
    "unofficial-and-source-trust",
    "non-institutional-impersonation",
    "specificity-and-originality",
    "anti-ai-slop-quality",
    "consumer-confidence-hierarchy"
  ],
  "accessibility-cognitive-load": [
    "semantic-and-focus-clarity",
    "zoom-reflow-and-large-text",
    "contrast-and-non-color-meaning",
    "cognitive-chunking",
    "motion-state-and-recovery"
  ],
  "visual-component-coherence": [
    "component-role-consistency",
    "token-coherence",
    "seven-archetype-coverage",
    "responsive-and-print-continuity",
    "differentiation-without-content-drift"
  ]
})
const REVIEW_OUTPUT_KEYS = Object.freeze([
  "schemaVersion", "reportId", "protocolId", "reviewMode", "evidenceClass", "humanEvidence", "humanParticipantCount", "humanReviewRequired", "notHumanUsabilityTested", "taskPath", "rubricId", "repositoryCommit", "reviewSubjectTreeSha", "acceptedStep2SubjectSha", "acceptedStep2MergeSha", "comparisonSourceSha", "prototypeBundleSha256", "prototypeFiles", "browserReceiptSha256", "promptTemplateSha256", "promptSha256", "rubricSha256", "rubricCriteria", "territoryScores", "consensusPosition", "dissent", "limitations"
])
const UNRESOLVED_DECISIONS = Object.freeze([
  "NAV-SHELL-BOUNDARY",
  "UNRESOLVED-SHORTEST-PRACTICE-PRIMARY",
  "UNRESOLVED-HOME-PRIMARY-CTA",
  "UNRESOLVED-EXACT-NAV-LABELS-GROUPING",
  "UNRESOLVED-D1-VS-D2",
  "UNRESOLVED-PRACTICE-TIMING",
  "UNRESOLVED-SOURCE-PROMINENCE"
])
const VISUAL_PROMOTION_AXES = Object.freeze([
  "typography",
  "colorDistribution",
  "spacing",
  "surfaces",
  "borderElevation",
  "composition",
  "imageFraming",
  "dataDensity"
])
const PROHIBITED_PROMOTION_KEYS = Object.freeze([
  "navShellBoundary",
  "shortestPracticePrimary",
  "homePrimaryCta",
  "navigationLabels",
  "navigationGrouping",
  "d1D2",
  "practiceTiming",
  "sourceProminence",
  "navigation",
  "cta"
])
const ROUTE_ARCHETYPES = Object.freeze([
  ["orientation", ["home", "exam-selector", "exam-checker", "profile", "scoring-explainer", "actual-questions-explainer", "about", "nyc-disambiguation"], []],
  ["study-launcher", ["study-hub", "hazards-index", "simulation-setup", "print-center"], []],
  ["browse-reference", ["atlas-index", "atlas-family", "atlas-tool", "procedures-index", "procedure-detail", "repair-lab", "faq", "transparency-index", "source", "corrections", "foil", "security", "privacy"], []],
  ["focused-task", ["question-player", "hazard-player", "review-player", "simulation-player"], []],
  ["review-results", ["review-queue", "simulation-results", "print-preview"], []],
  ["utility", ["settings", "offline-packs", "correction-submit"], []],
  ["recovery", ["status"], ["404", "410", "5xx"]]
])
const EXPECTED_ARCHETYPES = Object.freeze(ROUTE_ARCHETYPES.map(([archetypeId, routeIds, terminalDocuments]) => ({ archetypeId, routeIds, terminalDocuments })))
const EXPECTED_ROUTE_IDS = Object.freeze(EXPECTED_ARCHETYPES.flatMap(({ routeIds }) => routeIds))
const BENCHMARK_CATEGORIES = Object.freeze([
  "exam-preparation",
  "public-service-reference",
  "practical-visual-learning",
  "no-account-offline-education"
])
const PRESENTATIONS = Object.freeze([
  "default",
  "phone-320",
  "phone-390",
  "tablet-768",
  "desktop-1440",
  "large-text-125",
  "zoom-400",
  "forced-colors",
  "reduced-motion",
  "print"
])
const BROWSER_PROJECTS = Object.freeze(["chromium", "firefox", "webkit"])
const REPRESENTATIVE_COVERAGE_CONTRACT = Object.freeze({
  classification: "representative-visual-comparison-not-exhaustive-legal-state-validation",
  registryRouteIdCount: 36,
  representedRouteIdCount: 10,
  representativeFrameCount: 12,
  defaultCaseCount: 108,
  deferredHazardVariants: Object.freeze(["asset-unavailable", "region-required", "version-mismatch", "commit-failure-preservation"]),
  deferredRecoveryVariants: Object.freeze(["not-found-404", "withdrawn-410", "invalid-publication", "storage-unavailable", "service-failure"]),
  printScope: Object.freeze({
    classification: "immutable-review-queue-empty-only",
    caseCount: 9,
    frameIds: Object.freeze(["review-queue-empty"]),
    territoryIds: TERRITORY_IDS,
    browserProjects: BROWSER_PROJECTS
  })
})
const KEYBOARD_EVIDENCE_CONTRACT = Object.freeze({
  classification: "native-document-focus-order-round-trip",
  forwardTraversal: "Native Tab visits every derived enabled rendered logical document focus stop exactly once in forward order and records the exact focused element coordinate.",
  returnTraversal: "Native Shift+Tab visits the exact reverse logical document focus-stop order, records each exact engine-specific focused element coordinate, and returns to the first logical stop.",
  programmaticElementFocusUsed: false,
  firefoxAutomationLimitation: "After the final document stop, Playwright Firefox sends forward focus to browser chrome but exposes document.activeElement as the last link indefinitely; 100 additional native Tab presses in both headless and headed Xvfb runs did not expose or re-enter that chrome path. Therefore this evidence does not claim an observable forward-Tab wrap in Firefox."
})
const PROTOTYPE_PATHS = Object.freeze([
  `${researchRoot}/prototype.css`,
  `${researchRoot}/prototype.html`,
  `${researchRoot}/prototype.mjs`
])
const PRE_RECEIPT_FORBIDDEN_PATHS = Object.freeze([
  `${researchRoot}/browser-receipt.json`,
  manifestPath,
  reportPath,
  taskReceiptPath,
  ...Object.values(REVIEW_OUTPUT_PATHS)
])
// This is the text/tooling part of the immutable capture source. The asset
// ledgers, 194 delivery derivatives, and every review/rights ledger resolved
// from asset-audit.tsv are added deterministically by preReceiptSourcePaths().
const PRE_RECEIPT_STATIC_PATHS = Object.freeze([
  "apps/site/package.json",
  "bun.lock",
  "bunfig.toml",
  "package.json",
  "plans/006-consumer-visual-system-prework.md",
  "plans/006-consumer-visual-system-prework.schema.json",
  "plans/006-select-consumer-visual-system.md",
  "plans/README.md",
  "plans/validate-006-consumer-visual-system-prework.mjs",
  "product/CONTENT_DESIGN.md",
  "product/DESIGN_SYSTEM.md",
  "product/ROUTES.md",
  "research/README.md",
  `${researchRoot}/asset-audit.tsv`,
  `${researchRoot}/benchmark-sources.json`,
  `${researchRoot}/capture-browser-receipt.mjs`,
  `${researchRoot}/evidence-manifest.schema.json`,
  `${researchRoot}/extract-codex-task-receipt.mjs`,
  `${researchRoot}/playwright.config.ts`,
  `${researchRoot}/prototype.css`,
  `${researchRoot}/prototype.html`,
  `${researchRoot}/prototype.mjs`,
  `${researchRoot}/review-prompts/accessibility-cognitive-load.md`,
  `${researchRoot}/review-prompts/consumer-trust-anti-ai-slop.md`,
  `${researchRoot}/review-prompts/visual-component-coherence.md`,
  `${researchRoot}/serve-prototype.mjs`,
  `${researchRoot}/token-role-css-map.json`,
  `${researchRoot}/verify-asset-proof.mjs`,
  `${researchRoot}/verify-research.mjs`,
  `${researchRoot}/visual-system-research.pw.ts`
])
const TERMINAL_OUTPUT_PATHS = new Set([
  "plans/006-select-consumer-visual-system.md",
  "plans/README.md",
  "product/DESIGN_SYSTEM.md",
  "research/README.md",
  reportPath,
  manifestPath,
  taskReceiptPath,
  ...Object.values(REVIEW_OUTPUT_PATHS)
])
const STEP3_MUTABLE_SOURCE_PATHS = new Set([
  "plans/006-consumer-visual-system-prework.md",
  "plans/006-consumer-visual-system-prework.schema.json",
  "plans/006-select-consumer-visual-system.md",
  "plans/README.md",
  "plans/validate-006-consumer-visual-system-prework.mjs",
  `${researchRoot}/asset-audit.tsv`,
  `${researchRoot}/benchmark-sources.json`,
  `${researchRoot}/capture-browser-receipt.mjs`,
  `${researchRoot}/evidence-manifest.schema.json`,
  `${researchRoot}/extract-codex-task-receipt.mjs`,
  `${researchRoot}/playwright.config.ts`,
  `${researchRoot}/prototype.css`,
  `${researchRoot}/prototype.html`,
  `${researchRoot}/prototype.mjs`,
  `${researchRoot}/review-prompts/accessibility-cognitive-load.md`,
  `${researchRoot}/review-prompts/consumer-trust-anti-ai-slop.md`,
  `${researchRoot}/review-prompts/visual-component-coherence.md`,
  `${researchRoot}/serve-prototype.mjs`,
  `${researchRoot}/token-role-css-map.json`,
  `${researchRoot}/verify-asset-proof.mjs`,
  `${researchRoot}/verify-research.mjs`,
  `${researchRoot}/visual-system-research.pw.ts`,
  `${researchRoot}/browser-receipt.json`,
  ...TERMINAL_OUTPUT_PATHS
])
const REVIEW_COORDINATE_PATHS = new Set([
  `${researchRoot}/asset-audit.tsv`,
  `${researchRoot}/benchmark-sources.json`,
  `${researchRoot}/browser-receipt.json`,
  `${researchRoot}/prototype.css`,
  `${researchRoot}/prototype.html`,
  `${researchRoot}/prototype.mjs`,
  `${researchRoot}/token-role-css-map.json`,
  "product/CONTENT_DESIGN.md",
  "product/ROUTES.md"
])
const REVIEW_COORDINATE_PATH_INSTRUCTION = `Allowed evidence-coordinate paths (and no others): ${[...REVIEW_COORDINATE_PATHS].join(", ")}.`
const TERMINAL_REQUIRED_PATHS = new Set(TERMINAL_OUTPUT_PATHS)
const unresolvedTerminalRequiredPaths = new Set([...TERMINAL_REQUIRED_PATHS].filter((path) => path !== "product/DESIGN_SYSTEM.md"))
const GATED_ASSET_IDS = new Set(["t021", "t024", "t026", "t027", "t028", "t029", "t030", "t047", "t048", "t060", "p001", "p004", "p009"])
const decoder = new TextDecoder("utf-8", { fatal: true })
const shaPattern = /^[0-9a-f]{40}$/
const sha256Pattern = /^[0-9a-f]{64}$/

const fail = (message) => { throw new Error(message) }
const assert = (condition, message) => { if (!condition) fail(message) }
const absolute = (path) => resolve(repoRoot, path)
const sha256 = (value) => createHash("sha256").update(value).digest("hex")
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value)
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key)
const stableSort = (value) => {
  if (Array.isArray(value)) return value.map(stableSort)
  if (isObject(value)) return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableSort(value[key])]))
  return value
}
const stable = (value) => JSON.stringify(stableSort(value))
const clone = (value) => JSON.parse(JSON.stringify(value))
const equal = (actual, expected, path) => assert(stable(actual) === stable(expected), `${path}: value mismatch`)
const unique = (values, path) => assert(new Set(values.map((value) => typeof value === "string" ? value : stable(value))).size === values.length, `${path}: duplicate value`)
const exactKeys = (value, keys, path) => {
  assert(isObject(value), `${path}: object required`)
  equal(Object.keys(value).sort(), [...keys].sort(), `${path} keys`)
}
const count = (values) => Object.fromEntries([...new Set(values)].map((value) => [value, values.filter((candidate) => candidate === value).length]))
const runGit = (arguments_, encoding = "utf8") => {
  try {
    return execFileSync("git", arguments_, { cwd: repoRoot, encoding, maxBuffer: 20 * 1024 * 1024 })
  } catch {
    fail(`git ${arguments_.join(" ")}: failed`)
  }
}
const gitSucceeds = (arguments_) => spawnSync("git", arguments_, { cwd: repoRoot, stdio: "ignore" }).status === 0

const readBytes = (path) => readFileSync(absolute(path))
const decodeText = (bytes, path) => {
  let text
  try { text = decoder.decode(bytes) } catch { fail(`${path}: invalid UTF-8`) }
  assert(!text.startsWith("\uFEFF"), `${path}: BOM forbidden`)
  assert(!text.includes("\r"), `${path}: CR bytes forbidden`)
  assert(!text.includes("\0"), `${path}: NUL bytes forbidden`)
  assert(text.endsWith("\n") && !text.endsWith("\n\n"), `${path}: exactly one final LF required`)
  return text
}
const readText = (path) => decodeText(readBytes(path), path)

// JSON.parse discards duplicate keys. This deliberately small strict parser
// retains the fail-closed property needed by evidence and schema files.
const parseJsonStrict = (text, path) => {
  let cursor = 0
  const whitespace = () => { while (/\s/u.test(text[cursor] ?? "")) cursor += 1 }
  const parseString = () => {
    const start = cursor
    assert(text[cursor] === '"', `${path}: JSON string expected at ${cursor}`)
    cursor += 1
    let escaped = false
    while (cursor < text.length) {
      const char = text[cursor]
      if (escaped) escaped = false
      else if (char === "\\") escaped = true
      else if (char === '"') {
        cursor += 1
        try { return JSON.parse(text.slice(start, cursor)) } catch { fail(`${path}: invalid JSON string at ${start}`) }
      }
      cursor += 1
    }
    fail(`${path}: unterminated JSON string`)
  }
  const parseValue = () => {
    whitespace()
    const char = text[cursor]
    if (char === "{") return parseObject()
    if (char === "[") return parseArray()
    if (char === '"') return parseString()
    for (const [token, value] of [["true", true], ["false", false], ["null", null]]) {
      if (text.startsWith(token, cursor)) { cursor += token.length; return value }
    }
    const match = text.slice(cursor).match(/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/u)
    assert(match !== null, `${path}: JSON value expected at ${cursor}`)
    cursor += match[0].length
    const value = Number(match[0])
    assert(Number.isFinite(value), `${path}: non-finite JSON number`)
    return value
  }
  const parseObject = () => {
    cursor += 1
    whitespace()
    const result = Object.create(null)
    const keys = new Set()
    if (text[cursor] === "}") { cursor += 1; return result }
    while (true) {
      whitespace()
      const key = parseString()
      assert(!keys.has(key), `${path}: duplicate JSON key ${JSON.stringify(key)}`)
      keys.add(key)
      whitespace()
      assert(text[cursor] === ":", `${path}: expected colon after ${JSON.stringify(key)}`)
      cursor += 1
      result[key] = parseValue()
      whitespace()
      if (text[cursor] === "}") { cursor += 1; return result }
      assert(text[cursor] === ",", `${path}: expected comma at ${cursor}`)
      cursor += 1
    }
  }
  const parseArray = () => {
    cursor += 1
    whitespace()
    const result = []
    if (text[cursor] === "]") { cursor += 1; return result }
    while (true) {
      result.push(parseValue())
      whitespace()
      if (text[cursor] === "]") { cursor += 1; return result }
      assert(text[cursor] === ",", `${path}: expected comma at ${cursor}`)
      cursor += 1
    }
  }
  const value = parseValue()
  whitespace()
  assert(cursor === text.length, `${path}: trailing JSON bytes at ${cursor}`)
  return value
}

// This is not advertised as a general JSON Schema engine. It validates schema
// integrity and implements every Draft 2020-12 keyword used by the committed
// schema; any unimplemented keyword is itself rejected.
const supportedSchemaKeywords = new Set([
  "$schema", "$id", "$ref", "$defs", "title", "description", "type", "const", "enum",
  "required", "properties", "additionalProperties", "items", "minItems", "maxItems",
  "uniqueItems", "minLength", "pattern", "format", "minimum", "maximum", "oneOf"
])
const supportedJsonTypes = new Set(["object", "array", "string", "integer", "boolean", "null"])
const pointerPath = (path, key) => `${path}/${String(key).replaceAll("~", "~0").replaceAll("/", "~1")}`
const resolveRef = (rootSchema, reference, path) => {
  assert(typeof reference === "string" && reference.startsWith("#/"), `${path}: only local non-root JSON Pointer refs supported`)
  let target = rootSchema
  for (const token of reference.slice(2).split("/")) {
    const key = token.replaceAll("~1", "/").replaceAll("~0", "~")
    assert(isObject(target) && hasOwn(target, key), `${path}: unresolved ref ${reference}`)
    target = target[key]
  }
  assert(isObject(target), `${path}: ref must resolve to object schema`)
  return target
}
const validateSchemaNode = (node, path, rootSchema, root = false) => {
  assert(isObject(node), `${path}: object schema required by ${schemaProfile}`)
  for (const key of Object.keys(node)) {
    assert(supportedSchemaKeywords.has(key) || (root && key === "x-validationProfile"), `${path}: unsupported schema keyword ${key}`)
    if (!root) assert(!["$schema", "$id", "x-validationProfile"].includes(key), `${path}: ${key} is root-only`)
  }
  if (hasOwn(node, "$schema")) assert(node.$schema === "https://json-schema.org/draft/2020-12/schema", `${path}: Draft 2020-12 URI required`)
  if (hasOwn(node, "$id")) assert(typeof node.$id === "string" && node.$id.length > 0, `${path}.$id invalid`)
  for (const key of ["title", "description"]) if (hasOwn(node, key)) assert(typeof node[key] === "string", `${path}.${key}: string required`)
  if (hasOwn(node, "type")) assert(typeof node.type === "string" && supportedJsonTypes.has(node.type), `${path}.type unsupported`)
  if (hasOwn(node, "$ref")) resolveRef(rootSchema, node.$ref, `${path}.$ref`)
  if (hasOwn(node, "$defs")) {
    assert(isObject(node.$defs), `${path}.$defs: object required`)
    for (const [key, child] of Object.entries(node.$defs)) validateSchemaNode(child, pointerPath(`${path}/$defs`, key), rootSchema)
  }
  if (hasOwn(node, "properties")) {
    assert(isObject(node.properties), `${path}.properties: object required`)
    for (const [key, child] of Object.entries(node.properties)) validateSchemaNode(child, pointerPath(`${path}/properties`, key), rootSchema)
  }
  if (hasOwn(node, "required")) {
    assert(Array.isArray(node.required) && node.required.every((key) => typeof key === "string"), `${path}.required: string array required`)
    unique(node.required, `${path}.required`)
    assert(isObject(node.properties), `${path}.required requires sibling properties`)
    for (const key of node.required) assert(hasOwn(node.properties, key), `${path}.required: ${key} lacks sibling schema`)
  }
  if (hasOwn(node, "additionalProperties")) assert(typeof node.additionalProperties === "boolean", `${path}.additionalProperties: boolean required`)
  if (hasOwn(node, "items")) validateSchemaNode(node.items, `${path}/items`, rootSchema)
  if (hasOwn(node, "oneOf")) {
    assert(Array.isArray(node.oneOf) && node.oneOf.length > 0, `${path}.oneOf: nonempty array required`)
    node.oneOf.forEach((child, index) => validateSchemaNode(child, `${path}/oneOf/${index}`, rootSchema))
  }
  if (hasOwn(node, "enum")) {
    assert(Array.isArray(node.enum) && node.enum.length > 0, `${path}.enum: nonempty array required`)
    unique(node.enum.map(stable), `${path}.enum`)
  }
  for (const key of ["minItems", "maxItems", "minLength"]) if (hasOwn(node, key)) assert(Number.isInteger(node[key]) && node[key] >= 0, `${path}.${key}: nonnegative integer required`)
  for (const key of ["minimum", "maximum"]) if (hasOwn(node, key)) assert(typeof node[key] === "number" && Number.isFinite(node[key]), `${path}.${key}: finite number required`)
  if (hasOwn(node, "minItems") && hasOwn(node, "maxItems")) assert(node.minItems <= node.maxItems, `${path}: minItems exceeds maxItems`)
  if (hasOwn(node, "minimum") && hasOwn(node, "maximum")) assert(node.minimum <= node.maximum, `${path}: minimum exceeds maximum`)
  if (hasOwn(node, "uniqueItems")) assert(typeof node.uniqueItems === "boolean", `${path}.uniqueItems: boolean required`)
  if (hasOwn(node, "pattern")) {
    assert(typeof node.pattern === "string", `${path}.pattern: string required`)
    try { new RegExp(node.pattern, "u") } catch { fail(`${path}.pattern: invalid ECMAScript expression`) }
  }
  if (hasOwn(node, "format")) assert(node.format === "date-time", `${path}.format: only date-time supported`)
}
const instanceTypeMatches = (value, type) => {
  if (type === "null") return value === null
  if (type === "array") return Array.isArray(value)
  if (type === "object") return isObject(value)
  if (type === "integer") return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value)
  return typeof value === type
}
const isDateTime = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value) && Number.isFinite(Date.parse(value))
const isCanonicalMillisecondDateTime = (value) => isDateTime(value) && new Date(Date.parse(value)).toISOString() === value
const schemaErrors = (node, value, path, rootSchema, stack = []) => {
  const errors = []
  if (hasOwn(node, "$ref")) {
    if (stack.includes(node.$ref)) errors.push(`${path}: recursive refs unsupported`)
    else errors.push(...schemaErrors(resolveRef(rootSchema, node.$ref, `${path}.$ref`), value, path, rootSchema, [...stack, node.$ref]))
  }
  if (hasOwn(node, "const") && stable(value) !== stable(node.const)) errors.push(`${path}: const mismatch`)
  if (hasOwn(node, "enum") && !node.enum.some((candidate) => stable(candidate) === stable(value))) errors.push(`${path}: enum mismatch`)
  let typeMatches = true
  if (hasOwn(node, "type")) {
    typeMatches = instanceTypeMatches(value, node.type)
    if (!typeMatches) errors.push(`${path}: expected ${node.type}`)
  }
  if (hasOwn(node, "oneOf")) {
    const matched = node.oneOf.filter((branch) => schemaErrors(branch, value, path, rootSchema, stack).length === 0).length
    if (matched !== 1) errors.push(`${path}: oneOf matched ${matched} branches`)
  }
  if (typeMatches && isObject(value)) {
    if (hasOwn(node, "required")) for (const key of node.required) if (!hasOwn(value, key)) errors.push(`${pointerPath(path, key)}: missing required property`)
    if (hasOwn(node, "properties")) {
      for (const [key, child] of Object.entries(node.properties)) if (hasOwn(value, key)) errors.push(...schemaErrors(child, value[key], pointerPath(path, key), rootSchema, stack))
      if (node.additionalProperties === false) for (const key of Object.keys(value)) if (!hasOwn(node.properties, key)) errors.push(`${pointerPath(path, key)}: additional property forbidden`)
    }
  }
  if (typeMatches && Array.isArray(value)) {
    if (hasOwn(node, "minItems") && value.length < node.minItems) errors.push(`${path}: fewer than ${node.minItems} items`)
    if (hasOwn(node, "maxItems") && value.length > node.maxItems) errors.push(`${path}: more than ${node.maxItems} items`)
    if (node.uniqueItems === true && new Set(value.map(stable)).size !== value.length) errors.push(`${path}: items not unique`)
    if (hasOwn(node, "items")) value.forEach((entry, index) => errors.push(...schemaErrors(node.items, entry, `${path}/${index}`, rootSchema, stack)))
  }
  if (typeMatches && typeof value === "string") {
    if (hasOwn(node, "minLength") && [...value].length < node.minLength) errors.push(`${path}: shorter than minLength`)
    if (hasOwn(node, "pattern") && !new RegExp(node.pattern, "u").test(value)) errors.push(`${path}: pattern mismatch`)
    if (node.format === "date-time" && !isDateTime(value)) errors.push(`${path}: invalid date-time`)
  }
  if (typeMatches && typeof value === "number") {
    if (hasOwn(node, "minimum") && value < node.minimum) errors.push(`${path}: below minimum`)
    if (hasOwn(node, "maximum") && value > node.maximum) errors.push(`${path}: above maximum`)
  }
  return errors
}
const assertSchemaIntegrity = (schemaBytes) => {
  assert(sha256(schemaBytes) === expectedCanonicalSchemaSha256, `${schemaPath}: canonical schema SHA-256 mismatch`)
  const schemaText = decodeText(schemaBytes, schemaPath)
  const schema = parseJsonStrict(schemaText, schemaPath)
  assert(schema["x-validationProfile"] === schemaProfile, `${schemaPath}: validation profile mismatch`)
  validateSchemaNode(schema, "#", schema, true)
  return schema
}
const assertSchemaInstance = (schema, record) => {
  const errors = schemaErrors(schema, record, "$", schema)
  assert(errors.length === 0, `${manifestPath}: schema validation failed:\n${errors.slice(0, 30).join("\n")}`)
}

const verifyDescriptor = (descriptor, expectedPath = null, expectedCommit = "HEAD") => {
  exactKeys(descriptor, ["path", "bytes", "sha256"], `descriptor ${descriptor.path ?? "(missing)"}`)
  if (expectedPath !== null) assert(descriptor.path === expectedPath, `${expectedPath}: descriptor path mismatch`)
  assert(!descriptor.path.startsWith("/") && !descriptor.path.split("/").includes(".."), `${descriptor.path}: repository-relative path required`)
  assert(Number.isInteger(descriptor.bytes) && descriptor.bytes > 0, `${descriptor.path}: positive byte length required`)
  assert(sha256Pattern.test(descriptor.sha256), `${descriptor.path}: SHA-256 required`)
  const bytes = readBytes(descriptor.path)
  assert(bytes.byteLength === descriptor.bytes, `${descriptor.path}: byte length drift`)
  assert(sha256(bytes) === descriptor.sha256, `${descriptor.path}: SHA-256 drift`)
  assert(shaPattern.test(expectedCommit) || expectedCommit === "HEAD", `${descriptor.path}: descriptor commit invalid`)
  const committed = runGit(["show", `${expectedCommit}:${descriptor.path}`], null)
  assert(committed.byteLength === descriptor.bytes && sha256(committed) === descriptor.sha256, `${descriptor.path}: descriptor bytes do not equal ${expectedCommit}:path`)
  return bytes
}
const bytesAt = (commit, path) => runGit(["show", `${commit}:${path}`], null)
const descriptorAt = (commit, path) => {
  assert(shaPattern.test(commit), `${path}: full source commit required`)
  const bytes = bytesAt(commit, path)
  return { path, bytes: bytes.byteLength, sha256: sha256(bytes) }
}
const SOURCE_CLOSURE_ALGORITHM = "sha256(UTF-8(JSON.stringify(sorted exact {path,bytes,sha256} descriptors)) + LF)"
const sourceClosureSha256 = (files) => sha256(Buffer.from(`${JSON.stringify([...files].sort((a, b) => a.path.localeCompare(b.path)))}\n`, "utf8"))
const coordinateFilePath = (coordinate, label) => {
  assert(typeof coordinate === "string" && coordinate.includes("#"), `${label}: path#pointer coordinate required`)
  const path = coordinate.slice(0, coordinate.indexOf("#"))
  assert(path.length > 0 && !path.startsWith("/") && !path.split("/").includes(".."), `${label}: repository-relative coordinate required`)
  return path
}
const preReceiptSourcePaths = (sourceSha) => {
  const auditBytes = bytesAt(sourceSha, `${researchRoot}/asset-audit.tsv`)
  const auditText = decodeText(auditBytes, `${sourceSha}:${researchRoot}/asset-audit.tsv`)
  const lines = auditText.slice(0, -1).split("\n")
  const fields = lines[0].split("\t")
  const requiredFields = ["release_ledger_path", "review_coordinate", "rights_coordinates_json", "gate_coordinate", "phone_path", "print_path"]
  for (const field of requiredFields) assert(fields.includes(field), `source closure: asset-audit field ${field} absent`)
  const rows = lines.slice(1).map((line, rowIndex) => {
    const values = line.split("\t")
    assert(values.length === fields.length, `source closure: asset-audit row ${rowIndex + 2} width drift`)
    return Object.fromEntries(fields.map((field, index) => [field, values[index]]))
  })
  assert(rows.length === 97, "source closure: asset-audit must retain 97 rows")
  const paths = new Set(PRE_RECEIPT_STATIC_PATHS)
  for (const [index, row] of rows.entries()) {
    for (const key of ["release_ledger_path", "phone_path", "print_path"]) paths.add(row[key])
    for (const key of ["review_coordinate", "gate_coordinate"]) paths.add(coordinateFilePath(row[key], `asset row ${index + 2} ${key}`))
    let rights
    try { rights = JSON.parse(row.rights_coordinates_json) } catch { fail(`asset row ${index + 2}: rights coordinates JSON invalid`) }
    assert(Array.isArray(rights) && rights.length >= 1, `asset row ${index + 2}: rights coordinates required`)
    for (const coordinate of rights) paths.add(coordinateFilePath(coordinate, `asset row ${index + 2} rights`))
  }
  assert(new Set(rows.map(({ phone_path }) => phone_path)).size === 97, "source closure: 97 unique phone derivatives required")
  assert(new Set(rows.map(({ print_path }) => print_path)).size === 97, "source closure: 97 unique print derivatives required")
  const sorted = [...paths].sort()
  unique(sorted, "pre-receipt source closure paths")
  return sorted
}
const preReceiptSourceClosure = (sourceSha) => {
  const files = preReceiptSourcePaths(sourceSha).map((path) => descriptorAt(sourceSha, path))
  return {
    algorithm: SOURCE_CLOSURE_ALGORITHM,
    sourceSha,
    pathCount: files.length,
    files,
    sha256: sourceClosureSha256(files)
  }
}
const validateSourceClosureObject = (value, sourceSha, label) => {
  exactKeys(value, ["algorithm", "sourceSha", "pathCount", "files", "sha256"], label)
  assert(value.algorithm === SOURCE_CLOSURE_ALGORITHM, `${label}: algorithm drift`)
  assert(value.sourceSha === sourceSha, `${label}: source SHA drift`)
  const expected = preReceiptSourceClosure(sourceSha)
  assert(value.pathCount === expected.pathCount, `${label}: path count drift`)
  equal(value.files, expected.files, `${label}: exact immutable path/byte closure`)
  assert(value.sha256 === expected.sha256, `${label}: closure SHA-256 drift`)
  return expected
}
const prototypeBundleSha256 = (descriptors) => {
  const hash = createHash("sha256")
  for (const descriptor of [...descriptors].sort((a, b) => a.path.localeCompare(b.path))) {
    hash.update(descriptor.path, "utf8")
    hash.update("\0", "utf8")
    hash.update(readBytes(descriptor.path))
    hash.update("\0", "utf8")
  }
  return hash.digest("hex")
}

const validateHumanBoundary = (value, path) => {
  for (const key of ["protocolId", "reviewMode", "humanEvidence", "humanParticipantCount", "humanReviewRequired", "notHumanUsabilityTested"]) assert(hasOwn(value, key), `${path}.${key} is required`)
  assert(value.protocolId === "CODEX-ONLY-UIUX-V1", `${path}.protocolId drift`)
  assert(value.reviewMode === "codex-only", `${path}.reviewMode drift`)
  assert(value.humanEvidence === "none", `${path}.humanEvidence must be none`)
  assert(value.humanParticipantCount === 0, `${path}.humanParticipantCount must be zero`)
  assert(value.humanReviewRequired === false, `${path}.humanReviewRequired must be false`)
  assert(value.notHumanUsabilityTested === true, `${path}.notHumanUsabilityTested must be true`)
}

const validateStep2Source = (source) => {
  equal(source.unresolvedDecisionQuarantine, {
    status: "quarantined-not-promoted",
    decisionIds: UNRESOLVED_DECISIONS,
    promotionBoundary: "visual-tokens-and-composition-only",
    fixtureSemantics: "noncanonical-comparison-fixture"
  }, "source.unresolvedDecisionQuarantine")
  assert(source.acceptedStep2SubjectSha === STEP2_SUBJECT_SHA, "Step 2 subject SHA drift")
  assert(source.acceptedStep2MergeSha === STEP2_MERGE_SHA, "Step 2 merge SHA drift")
  assert(source.acceptedStep2TreeSha === STEP2_TREE_SHA, "Step 2 tree SHA drift")
  assert(gitSucceeds(["cat-file", "-e", `${STEP2_SUBJECT_SHA}^{commit}`]), "accepted Step 2 subject commit unavailable")
  assert(gitSucceeds(["cat-file", "-e", `${STEP2_MERGE_SHA}^{commit}`]), "accepted Step 2 merge commit unavailable")
  assert(gitSucceeds(["merge-base", "--is-ancestor", STEP2_SUBJECT_SHA, STEP2_MERGE_SHA]), "Step 2 subject is not an ancestor of accepted merge")
  assert(gitSucceeds(["merge-base", "--is-ancestor", STEP2_MERGE_SHA, "HEAD"]), "accepted Step 2 merge is not an ancestor of HEAD")
  assert(runGit(["show", "-s", "--format=%T", STEP2_SUBJECT_SHA]).trim() === STEP2_TREE_SHA, "Step 2 subject tree drift")
  assert(runGit(["show", "-s", "--format=%T", STEP2_MERGE_SHA]).trim() === STEP2_TREE_SHA, "Step 2 merge tree drift")
  const expectedPromotions = [
    { path: "product/CONTENT_DESIGN.md", directionId: "CL-CODEX-1", sha256: CONTENT_DESIGN_SHA256 },
    { path: "product/ROUTES.md", directionId: "NAV-CODEX-1", sha256: ROUTES_SHA256 }
  ]
  equal(source.promotions, expectedPromotions, "source.promotions")
  for (const promotion of expectedPromotions) {
    const mergeBytes = runGit(["show", `${STEP2_MERGE_SHA}:${promotion.path}`], null)
    assert(sha256(mergeBytes) === promotion.sha256, `${promotion.path}: accepted merge content hash drift`)
    assert(sha256(readBytes(promotion.path)) === promotion.sha256, `${promotion.path}: working content drift from accepted closure`)
    const text = readText(promotion.path)
    assert(text.includes(promotion.directionId), `${promotion.path}: accepted direction marker absent`)
  }
}
const validateSource = (record) => {
  validateHumanBoundary(record, "manifest")
  assert(record.artifactStatus === "complete" && ["selected", "unresolved"].includes(record.decisionStatus), "manifest terminal status invalid")
  validateStep2Source(record.source)
  validateSourceClosureObject(record.source.preReceiptSource, record.prototype.comparisonSourceSha, "manifest pre-receipt source")
}

const validateQuarantinedNavigationPresence = (territories) => {
  const navigationPresenceValues = territories.map(({ differentiationAxes }) => differentiationAxes.navigationPresence)
  assert(new Set(navigationPresenceValues).size === 1 && navigationPresenceValues[0] === "noncanonical shared navigation fixture—not a territory differentiator", "territory navigationPresence must remain identical, noncanonical, and quarantined")
}

const validatePrototype = async (record) => {
  const prototype = record.prototype
  equal(prototype.fixtureSemantics, {
    status: "noncanonical-comparison-fixture",
    acceptedInputs: "exact-accepted-step2-language-and-navigation-closures",
    unresolvedChoices: "quarantined-not-promoted"
  }, "prototype.fixtureSemantics")
  equal(prototype.territoryIds, TERRITORY_IDS, "prototype.territoryIds")
  equal(prototype.archetypes, EXPECTED_ARCHETYPES, "prototype.archetypes")
  assert(prototype.routeIdCount === 36 && EXPECTED_ROUTE_IDS.length === 36, "prototype route count must be 36")
  assert(prototype.representedRouteIdCount === 10, "prototype must truthfully report ten represented route IDs")
  equal(prototype.coverageContract, REPRESENTATIVE_COVERAGE_CONTRACT, "prototype representative coverage contract")
  unique(EXPECTED_ROUTE_IDS, "canonical route IDs")
  assert(prototype.files.length === 3, "prototype: exactly three comparison files required")
  equal(prototype.files.map(({ path }) => path).sort(), [...PROTOTYPE_PATHS].sort(), "prototype file paths")
  for (const descriptor of prototype.files) verifyDescriptor(descriptor)
  assert(prototype.bundleAlgorithm === "sha256(sorted(path + NUL + bytes + NUL))", "prototype bundle algorithm drift")
  assert(prototypeBundleSha256(prototype.files) === prototype.bundleSha256, "prototype bundle SHA-256 drift")
  assert(prototype.candidateSelectionEmbedded === false, "reviewed candidate bytes must not embed a post-review selection")
  assert(shaPattern.test(prototype.comparisonSourceSha), "prototype comparison source SHA invalid")
  assert(gitSucceeds(["cat-file", "-e", `${prototype.comparisonSourceSha}^{commit}`]), "prototype comparison source commit unavailable")
  assert(gitSucceeds(["merge-base", "--is-ancestor", STEP2_MERGE_SHA, prototype.comparisonSourceSha]), "comparison source does not descend from accepted Step 2 merge")
  assert(gitSucceeds(["merge-base", "--is-ancestor", prototype.comparisonSourceSha, "HEAD"]), "comparison source is not an ancestor of HEAD")
  for (const descriptor of prototype.files) {
    const committed = runGit(["show", `${prototype.comparisonSourceSha}:${descriptor.path}`], null)
    assert(sha256(committed) === descriptor.sha256 && committed.byteLength === descriptor.bytes, `${descriptor.path}: comparison commit does not contain exact reviewed bytes`)
  }
  const prototypeUrl = `${pathToFileURL(absolute(`${researchRoot}/prototype.mjs`)).href}?sha=${prototype.bundleSha256}`
  const module = await import(prototypeUrl)
  assert(module.executionCoordinates.programVersion === "CODEX-ONLY-UIUX-V1", "prototype program version drift")
  assert(module.executionCoordinates.reviewMode === "codex-only", "prototype review mode drift")
  assert(module.executionCoordinates.humanEvidence === "none", "prototype human evidence must be none")
  assert(module.executionCoordinates.humanParticipantCount === 0, "prototype human participant count must be zero")
  assert(module.executionCoordinates.humanReviewRequired === false, "prototype human review must not be required")
  assert(module.executionCoordinates.notHumanUsabilityTested === true, "prototype must remain not-human-usability-tested")
  assert(module.executionCoordinates.acceptedStep2SubjectSha === STEP2_SUBJECT_SHA, "prototype Step 2 subject drift")
  assert(module.executionCoordinates.acceptedStep2MergeSha === STEP2_MERGE_SHA, "prototype Step 2 merge drift")
  assert(module.executionCoordinates.contentDesignSha256 === CONTENT_DESIGN_SHA256, "prototype content-design hash drift")
  assert(module.executionCoordinates.routesSha256 === ROUTES_SHA256, "prototype routes hash drift")
  equal(module.unresolvedDecisionIds, UNRESOLVED_DECISIONS, "prototype unresolved decisions")
  equal(module.routeArchetypes, EXPECTED_ARCHETYPES, "prototype route archetypes")
  assert(Array.isArray(module.territories) && module.territories.length === 3, "prototype must export exactly three territories")
  equal(module.territories.map(({ territoryId }) => territoryId), TERRITORY_IDS, "prototype territory IDs")
  const differentiationKeys = ["typography", "colorDistribution", "spacing", "surfaces", "borderElevation", "composition", "imageFraming", "actions", "navigationPresence", "dataDensity"]
  for (const territory of module.territories) {
    exactKeys(territory, ["territoryId", "name", "hypothesis", "differentiationAxes", "tokens"], `territory ${territory.territoryId}`)
    exactKeys(territory.differentiationAxes, differentiationKeys, `territory ${territory.territoryId}.differentiationAxes`)
    assert(Object.keys(territory.tokens).length >= 20, `territory ${territory.territoryId}: at least 20 token roles required`)
  }
  for (const key of differentiationKeys.filter((key) => key !== "navigationPresence")) unique(module.territories.map(({ differentiationAxes }) => differentiationAxes[key]), `territory differentiation ${key}`)
  validateQuarantinedNavigationPresence(module.territories)
  assert(Array.isArray(module.sharedFrames) && module.sharedFrames.length === 12, "prototype must retain exactly twelve representative shared frames")
  const frameIds = module.sharedFrames.map(({ frameId }) => frameId)
  unique(frameIds, "prototype frame IDs")
  equal(prototype.frameIds, frameIds, "manifest/prototype frame IDs")
  assert(prototype.sharedFrameCount === frameIds.length, "prototype shared-frame count drift")
  assert(prototype.comparableFrameCount === frameIds.length * 3 && prototype.comparableFrameCount >= 21, "prototype comparable-frame count drift")
  assert(new Set(module.sharedFrames.map(({ routeId }) => routeId)).size === prototype.representedRouteIdCount, "prototype represented-route count drift")
  equal([...new Set(module.sharedFrames.map(({ archetypeId }) => archetypeId))].sort(), EXPECTED_ARCHETYPES.map(({ archetypeId }) => archetypeId).sort(), "prototype archetype coverage")
  for (const frame of module.sharedFrames) {
    assert(frameIds.includes(frame.frameId), `prototype frame ${frame.frameId}: unknown frame`)
    const archetype = EXPECTED_ARCHETYPES.find(({ archetypeId }) => archetypeId === frame.archetypeId)
    assert(archetype !== undefined && archetype.routeIds.includes(frame.routeId), `prototype frame ${frame.frameId}: route/archetype mismatch`)
    assert(frame.routePath.startsWith("/"), `prototype frame ${frame.frameId}: repository presentation route required`)
  }
  const expectedMatrix = TERRITORY_IDS.flatMap((territoryId) => module.sharedFrames.map(({ frameId, archetypeId, routeId }) => ({ territoryId, frameId, archetypeId, routeId })))
  equal(module.territoryFrameMatrix, expectedMatrix, "prototype territory-frame matrix")
  assert(module.semanticFingerprintInput.frames.length === module.sharedFrames.length, "prototype semantic fingerprint frame drift")
  assert(module.selectedTerritoryId === null && module.selectedContract === null, "reviewed A/B/C candidate bytes must remain selection-neutral")
  assert(module.sharedNavigationFixture.status === "noncanonical-comparison-fixture", "shared navigation fixture must remain noncanonical")
  const prototypeAssetIds = module.sharedFrames.flatMap(({ asset }) => asset === null ? [] : [asset.opaqueAssetId])
  unique(prototypeAssetIds, "prototype asset IDs")
  for (const assetId of prototypeAssetIds) assert(!GATED_ASSET_IDS.has(assetId), `prototype uses gated asset ${assetId}`)
  const css = readText(`${researchRoot}/prototype.css`)
  const html = readText(`${researchRoot}/prototype.html`)
  for (const territoryId of TERRITORY_IDS) assert(css.includes(`[data-territory="${territoryId}"]`), `prototype CSS lacks territory ${territoryId}`)
  assert(html.includes('href="/prototype.css"') && html.includes('src="/prototype.mjs"'), "prototype HTML must use local comparison assets")
  assert(!/(?:@import|url\(\s*["']?https?:|<script[^>]+src=["']https?:)/iu.test(`${css}\n${html}`), "prototype may not fetch external code, fonts, or style assets")
  return { module, prototypeAssetIds }
}

const parseAssetAudit = (text, expectedFields) => {
  const lines = text.trimEnd().split("\n")
  const header = expectedFields.join("\t")
  assert(lines[0] === header, "asset-audit.tsv: exact exported header required")
  return lines.slice(1).map((line, index) => {
    const values = line.split("\t")
    assert(values.length === expectedFields.length, `asset-audit.tsv row ${index + 2}: ${expectedFields.length} columns required`)
    const row = Object.fromEntries(expectedFields.map((key, column) => [key, values[column]]))
    for (const [key, value] of Object.entries(row)) if (key !== "prototype_usage_coordinate") assert(value.length > 0, `asset-audit.tsv row ${index + 2}: ${key} must be populated`)
    assert((row.rendered_in_prototype === "true") === (row.prototype_usage_coordinate.length > 0), `asset-audit.tsv row ${index + 2}: prototype usage coordinate/rendered join drift`)
    return row
  })
}
const validateAssets = async (record, prototypeContext, overrideRows = null) => {
  assert(record.assets.rowCount === 97, "asset manifest row count drift")
  equal(record.assets.kindCounts, { tool: 65, comparison: 14, scene: 18 }, "asset manifest kind counts")
  const bytes = verifyDescriptor(record.assets.file, `${researchRoot}/asset-audit.tsv`)
  verifyDescriptor(record.assets.verifier, `${researchRoot}/verify-asset-proof.mjs`)
  const verifierUrl = `${pathToFileURL(absolute(`${researchRoot}/verify-asset-proof.mjs`)).href}?sha=${record.assets.verifier.sha256}`
  const assetProof = await import(verifierUrl)
  validateHumanBoundary(assetProof.ASSET_PROOF_METADATA, "asset proof metadata")
  const rows = overrideRows ?? parseAssetAudit(decodeText(bytes, record.assets.file.path), assetProof.ASSET_AUDIT_FIELDS)
  assert(rows.length === 97, "asset-audit.tsv: exactly 97 data rows required")
  unique(rows.map(({ opaque_asset_id }) => opaque_asset_id), "asset-audit asset IDs")
  unique(rows.map(({ stable_id }) => stable_id), "asset-audit stable IDs")
  const expectedIds = [
    ...Array.from({ length: 65 }, (_, index) => `t${String(index + 1).padStart(3, "0")}`),
    ...Array.from({ length: 14 }, (_, index) => `p${String(index + 1).padStart(3, "0")}`),
    ...Array.from({ length: 18 }, (_, index) => `s${String(index + 1).padStart(3, "0")}`)
  ]
  equal(rows.map(({ opaque_asset_id }) => opaque_asset_id).sort(), expectedIds.sort(), "asset-audit complete ID inventory")
  equal(count(rows.map(({ asset_type }) => asset_type)), { tool: 65, comparison: 14, scene: 18 }, "asset-audit kind counts")
  const releaseFiles = {
    tool: "content/authoring/visuals/releases/tools.json",
    comparison: "content/authoring/visuals/releases/comparisons.json",
    scene: "content/authoring/visuals/releases/scenes.json"
  }
  const releaseRows = Object.entries(releaseFiles).flatMap(([assetType, path]) => {
    const values = parseJsonStrict(readText(path), path)
    return values.map((value) => ({
      assetType,
      stableId: value.conceptId ?? value.id ?? value.sceneId,
      opaqueAssetId: value.opaqueAssetId,
      revision: value.assetRevision === undefined ? "n/a" : String(value.assetRevision),
      phonePath: value.derivatives.find(({ kind }) => kind === "phone")?.path,
      printPath: value.derivatives.find(({ kind }) => kind === "print")?.path,
      gated: (value.publicationGate !== null && value.publicationGate !== undefined) || (Array.isArray(value.scoredUseGate) && value.scoredUseGate.length > 0)
    }))
  })
  assert(releaseRows.length === 97, "canonical visual release ledgers must contain 97 records")
  const releaseById = Object.fromEntries(releaseRows.map((entry) => [entry.opaqueAssetId, entry]))
  for (const row of rows) {
    assert(row.reviewMode === "codex-only", `asset ${row.opaque_asset_id}: reviewMode drift`)
    assert(row.humanEvidence === "none", `asset ${row.opaque_asset_id}: humanEvidence drift`)
    assert(row.humanParticipantCount === "0", `asset ${row.opaque_asset_id}: humanParticipantCount drift`)
    assert(row.humanReviewRequired === "false", `asset ${row.opaque_asset_id}: humanReviewRequired drift`)
    assert(row.notHumanUsabilityTested === "true", `asset ${row.opaque_asset_id}: notHumanUsabilityTested drift`)
    const release = releaseById[row.opaque_asset_id]
    assert(release !== undefined, `asset ${row.opaque_asset_id}: absent from canonical release ledgers`)
    assert(row.asset_type === release.assetType && row.stable_id === release.stableId && row.revision === release.revision, `asset ${row.opaque_asset_id}: release identity/revision drift`)
    assert(row.review_surface === `phone=${release.phonePath};print=${release.printPath}`, `asset ${row.opaque_asset_id}: review-surface path drift`)
    assert(["compatible-with-framing", "assessment-only"].includes(row.identity_fit), `asset ${row.opaque_asset_id}: identity-fit status invalid`)
    assert(["none-recorded-in-release-review", "mixed-library-rendering-mode-requires-explicit-frame"].includes(row.slop_flags), `asset ${row.opaque_asset_id}: slop status invalid`)
    assert(["use-as-is", "constrain-to-reference", "constrain-to-assessment", "future-separate-review"].includes(row.disposition), `asset ${row.opaque_asset_id}: disposition invalid`)
    assert(row.notes.includes("Rights review: pass") || row.notes.includes("Rights status: covered by release-level independent review") || row.notes.includes("Rights/provenance review: pass"), `asset ${row.opaque_asset_id}: exact release-rights status marker required`)
    assert(row.permitted_contexts.length >= 8 && row.prohibited_contexts.length >= 8, `asset ${row.opaque_asset_id}: use boundary not populated`)
    if (release.gated || GATED_ASSET_IDS.has(row.opaque_asset_id)) assert(row.identity_fit === "assessment-only" && row.disposition === "future-separate-review" && row.notes.includes("Gate:"), `asset ${row.opaque_asset_id}: release gate must remain explicit`)
  }
  for (const assetId of prototypeContext.prototypeAssetIds) {
    const row = rows.find(({ opaque_asset_id }) => opaque_asset_id === assetId)
    assert(row !== undefined && !GATED_ASSET_IDS.has(assetId) && row.disposition !== "future-separate-review", `prototype asset ${assetId}: audit prevents use`)
  }
  assert(rows.filter(({ disposition }) => disposition === "future-separate-review").length === GATED_ASSET_IDS.size, "asset-audit must retain exactly the 13 known future-review gates")
  const qualitativeFields = assetProof.ASSET_AUDIT_FIELDS.slice(0, 18)
  const regeneratedRows = await assetProof.buildAssetProofRows(rows.map((row) => Object.fromEntries(qualitativeFields.map((field) => [field, row[field]]))))
  equal(rows, regeneratedRows, "asset-audit deterministic proof recomputation")
  if (overrideRows === null) {
    const proofResult = await assetProof.verifyAssetProof()
    assert(proofResult.rows === 97 && proofResult.renderedDerivativeBindings === 3, "asset proof verifier closure drift")
  }
  return rows
}

const validateBenchmarks = (record, override = null) => {
  assert(record.benchmarks.sourceCount === 12, "benchmark source count drift")
  equal(record.benchmarks.categoryCounts, Object.fromEntries(BENCHMARK_CATEGORIES.map((category) => [category, 3])), "benchmark category counts")
  const bytes = verifyDescriptor(record.benchmarks.file, `${researchRoot}/benchmark-sources.json`)
  const data = override ?? parseJsonStrict(decodeText(bytes, record.benchmarks.file.path), record.benchmarks.file.path)
  exactKeys(data, ["schemaVersion", "recordId", "protocolId", "reviewMode", "evidenceClass", "humanEvidence", "humanParticipantCount", "humanReviewRequired", "notHumanUsabilityTested", "observedAt", "sourceCount", "categoryCounts", "evidenceBoundary", "retainedThirdPartyBytes", "sources"], "benchmark-sources.json")
  assert(data.schemaVersion === "1.0.0" && data.recordId === "plan-006-benchmark-sources-2026-08-28" && data.evidenceClass === "nonhuman-desk-observation", "benchmark record identity drift")
  validateHumanBoundary(data, "benchmark-sources.json")
  assert(data.observedAt === "2026-08-28" && data.sourceCount === 12 && data.retainedThirdPartyBytes === false, "benchmark observation/count/retention boundary drift")
  equal(data.categoryCounts, Object.fromEntries(BENCHMARK_CATEGORIES.map((category) => [category, 3])), "benchmark source categoryCounts")
  assert(typeof data.evidenceBoundary === "string" && data.evidenceBoundary.includes("not user research") && data.evidenceBoundary.includes("permission to copy third-party expression"), "benchmark evidence boundary must remain explicit")
  assert(Array.isArray(data.sources) && data.sources.length === 12, "benchmark-sources.json: exactly 12 sources required")
  unique(data.sources.map(({ sourceId }) => sourceId), "benchmark IDs")
  unique(data.sources.map(({ directUrl }) => directUrl), "benchmark URLs")
  equal(data.sources.map(({ sourceId }) => sourceId).sort(), Array.from({ length: 12 }, (_, index) => `B${String(index + 1).padStart(2, "0")}`), "benchmark ID set")
  equal(count(data.sources.map(({ category }) => category)), Object.fromEntries(BENCHMARK_CATEGORIES.map((category) => [category, 3])), "benchmark category population")
  for (const [index, source] of data.sources.entries()) {
    exactKeys(source, ["sourceId", "product", "category", "directUrl", "finalUrl", "observedAt", "accessStatus", "httpStatus", "reportClaimIds", "originalObservations", "applicability", "antiCopyBoundary", "limitations"], `benchmark source ${index}`)
    assert(BENCHMARK_CATEGORIES.includes(source.category), `benchmark ${source.sourceId}: category invalid`)
    assert(typeof source.product === "string" && source.product.trim().length >= 3, `benchmark ${source.sourceId}: product not populated`)
    assert(/^https:\/\/[^\s]+$/u.test(source.directUrl) && /^https:\/\/[^\s]+$/u.test(source.finalUrl), `benchmark ${source.sourceId}: HTTPS source URLs required`)
    assert(source.observedAt === data.observedAt, `benchmark ${source.sourceId}: observation-date join drift`)
    assert(["observed", "partial"].includes(source.accessStatus), `benchmark ${source.sourceId}: access status invalid`)
    assert(Number.isInteger(source.httpStatus) && source.httpStatus >= 200 && source.httpStatus <= 599, `benchmark ${source.sourceId}: HTTP status invalid`)
    if (source.httpStatus !== 200) assert(source.accessStatus === "partial", `benchmark ${source.sourceId}: non-200 observation must be partial`)
    for (const key of ["reportClaimIds", "originalObservations", "applicability"]) assert(Array.isArray(source[key]) && source[key].length >= 1 && source[key].every((entry) => typeof entry === "string" && entry.trim().length >= 3), `benchmark ${source.sourceId}: ${key} must be populated`)
    unique(source.reportClaimIds, `benchmark ${source.sourceId}: claim IDs`)
    assert(typeof source.antiCopyBoundary === "string" && source.antiCopyBoundary.includes("do not copy"), `benchmark ${source.sourceId}: anti-copy boundary missing`)
    assert(typeof source.limitations === "string" && source.limitations.trim().length >= 8, `benchmark ${source.sourceId}: limitations missing`)
  }
  return data
}

const loadBrowserReceipt = (record) => {
  const bytes = verifyDescriptor(record.browser.file, `${researchRoot}/browser-receipt.json`)
  const receipt = parseJsonStrict(decodeText(bytes, record.browser.file.path), record.browser.file.path)
  assert(record.browser.status === "passed" && record.browser.sourceSha === record.prototype.comparisonSourceSha, "browser manifest source/status join drift")
  assert(record.browser.prototypeBundleSha256 === record.prototype.bundleSha256, "browser manifest prototype hash join drift")
  return { bytes, receipt }
}
const validateCapturePreflightSource = (source) => {
  for (const literal of [
    "if (existsSync(resolve(repositoryRoot, receiptPath))) throw new Error",
    "const dirtyWorktree = git([\"status\", \"--porcelain=v1\", \"--untracked-files=all\"])",
    "if (dirtyWorktree !== \"\") throw new Error",
    '"--phase=source"',
    "const terminalValidatorPath = \"research/ui-ux/consumer-visual-system/verify-research.mjs\""
  ]) assert(source.includes(literal), `browser capture global-clean/absent-receipt preflight drift: ${literal}`)
}
const validateTokenMapping = (record, prototypeContext, descriptor, sourceSha, overrideMapping = null) => {
  const bytes = verifyDescriptor(descriptor, `${researchRoot}/token-role-css-map.json`)
  verifyDescriptor(descriptor, descriptor.path, sourceSha)
  const mapping = overrideMapping ?? parseJsonStrict(decodeText(bytes, descriptor.path), descriptor.path)
  exactKeys(mapping, ["schemaVersion", "contractType", "protocolId", "reviewMode", "humanEvidence", "humanParticipantCount", "humanReviewRequired", "notHumanUsabilityTested", "comparisonRule", "promotableRule", "promotableRoles", "entries", "materialAxes"], "token role CSS map")
  assert(mapping.schemaVersion === 1 && mapping.contractType === "machine-readable-render-contract", "token role CSS map identity drift")
  validateHumanBoundary(mapping, "token role CSS map")
  assert(typeof mapping.comparisonRule === "string" && mapping.comparisonRule.includes("rendered frame"), "token role CSS map comparison rule missing")
  assert(typeof mapping.promotableRule === "string" && mapping.promotableRule.includes("territories A, B, and C") && mapping.promotableRule.includes("browser dependency"), "token role CSS map promotable rule missing")
  assert(Array.isArray(mapping.entries) && mapping.entries.length === prototypeContext.module.tokenRoles.length, "token role CSS map role count drift")
  equal(mapping.entries.map(({ role }) => role), prototypeContext.module.tokenRoles, "token role CSS map role order")
  unique(mapping.entries.map(({ role }) => role), "token role CSS map roles")
  unique(mapping.entries.map(({ cssCustomProperty }) => cssCustomProperty), "token role CSS custom properties")
  const expectedPromotableRoles = prototypeContext.module.tokenRoles.filter((role) => new Set(prototypeContext.module.territories.map(({ tokens }) => tokens[role])).size > 1)
  equal(mapping.promotableRoles, expectedPromotableRoles, "token role CSS map promotable-role closure")
  const frameIds = new Set(record.prototype.frameIds)
  for (const entry of mapping.entries) {
    exactKeys(entry, ["role", "cssCustomProperty", "consumer"], `token mapping ${entry.role}`)
    assert(entry.cssCustomProperty === prototypeContext.module.cssCustomPropertyForTokenRole(entry.role), `token mapping ${entry.role}: custom property drift`)
    exactKeys(entry.consumer, ["frameId", "selector", "property", "state"], `token mapping ${entry.role}.consumer`)
    assert(frameIds.has(entry.consumer.frameId), `token mapping ${entry.role}: consumer frame drift`)
    for (const key of ["selector", "property", "state"]) assert(typeof entry.consumer[key] === "string" && entry.consumer[key].length > 0, `token mapping ${entry.role}: ${key} missing`)
  }
  assert(Array.isArray(mapping.materialAxes) && mapping.materialAxes.length >= 5, "token role CSS map needs at least five material axes")
  unique(mapping.materialAxes.map(({ axisId }) => axisId), "token material axes")
  for (const axis of mapping.materialAxes) {
    exactKeys(axis, ["axisId", "selector", "property", "requiredPairwiseDistinct"], `token material axis ${axis.axisId}`)
    assert(typeof axis.axisId === "string" && axis.axisId.length > 0 && typeof axis.selector === "string" && axis.selector.length > 0 && typeof axis.property === "string" && axis.property.length > 0 && axis.requiredPairwiseDistinct === true, `token material axis ${axis.axisId}: invalid`)
  }
  return { bytes, mapping }
}
const validateBrowser = async (record, prototypeContext, receipt) => {
  exactKeys(receipt, ["schemaVersion", "receiptId", "protocolId", "reviewMode", "humanEvidence", "humanParticipantCount", "humanReviewRequired", "notHumanUsabilityTested", "status", "sourceSha", "sourceClosure", "prototypeBundleSha256", "prototypeFiles", "tokenMappingFile", "harnessFiles", "startedAt", "completedAt", "browserProjects", "presentationContracts", "defaultFrameCoverage", "coverageContract", "keyboardEvidenceContract", "specialPresentationMatrix", "axePolicy", "suiteResult", "tokenEvidence", "cases", "screenshotBytesRetained"], "browser receipt")
  assert(receipt.schemaVersion === 4 && receipt.receiptId === "plan-006-browser-evidence" && receipt.status === "passed", "browser receipt identity/status drift")
  validateHumanBoundary(receipt, "browser receipt")
  assert(receipt.sourceSha === record.prototype.comparisonSourceSha && receipt.prototypeBundleSha256 === record.prototype.bundleSha256, "browser receipt source/prototype join drift")
  validateSourceClosureObject(receipt.sourceClosure, receipt.sourceSha, "browser receipt source closure")
  equal(receipt.coverageContract, REPRESENTATIVE_COVERAGE_CONTRACT, "browser representative coverage contract")
  equal(receipt.keyboardEvidenceContract, KEYBOARD_EVIDENCE_CONTRACT, "browser keyboard evidence/nonclaim contract")
  equal(receipt.prototypeFiles, record.prototype.files, "browser/prototype file descriptors")
  assert(Array.isArray(receipt.harnessFiles) && receipt.harnessFiles.length === 4, "browser receipt requires exactly four harness files")
  unique(receipt.harnessFiles.map(({ path }) => path), "browser harness paths")
  for (const descriptor of receipt.harnessFiles) {
    verifyDescriptor(descriptor)
    verifyDescriptor(descriptor, descriptor.path, receipt.sourceSha)
  }
  const captureDescriptor = receipt.harnessFiles.find(({ path }) => path === `${researchRoot}/capture-browser-receipt.mjs`)
  assert(captureDescriptor !== undefined, "browser capture harness descriptor absent")
  const harnessUrl = `${pathToFileURL(absolute(captureDescriptor.path)).href}?sha=${captureDescriptor.sha256}`
  const harness = await import(harnessUrl)
  validateHumanBoundary(harness.evidenceCoordinates, "browser harness evidence coordinates")
  equal(harness.coverageContract, REPRESENTATIVE_COVERAGE_CONTRACT, "browser harness representative coverage contract")
  equal(harness.keyboardEvidenceContract, KEYBOARD_EVIDENCE_CONTRACT, "browser harness keyboard evidence contract")
  equal(receipt.presentationContracts, harness.presentationContracts, "browser presentation contracts")
  assert(!gitSucceeds(["cat-file", "-e", `${receipt.sourceSha}:${record.browser.file.path}`]), "browser source commit must predate and omit the terminal receipt")
  const captureSource = readText(captureDescriptor.path)
  validateCapturePreflightSource(captureSource)
  const playwrightConfig = readText(`${researchRoot}/playwright.config.ts`)
  for (const literal of ["fullyParallel: false", "workers: 1", "retries: 0"]) assert(playwrightConfig.includes(literal), `browser harness must retain stable serial setting ${literal}`)
  const tokenMapping = validateTokenMapping(record, prototypeContext, receipt.tokenMappingFile, receipt.sourceSha)
  assert(isDateTime(receipt.startedAt) && isDateTime(receipt.completedAt) && Date.parse(receipt.startedAt) <= Date.parse(receipt.completedAt), "browser receipt interval invalid")
  const comparisonCommittedAt = Date.parse(runGit(["show", "-s", "--format=%cI", record.prototype.comparisonSourceSha]).trim())
  assert(comparisonCommittedAt <= Date.parse(receipt.startedAt), "browser receipt predates immutable comparison source")
  equal(receipt.browserProjects, BROWSER_PROJECTS, "browser project coverage")
  assert(receipt.screenshotBytesRetained === false, "browser receipt may not retain screenshot bytes")
  equal(receipt.specialPresentationMatrix, harness.specialPresentationMatrix, "browser special-presentation matrix")
  equal(receipt.specialPresentationMatrix.map(({ presentation }) => presentation), PRESENTATIONS.slice(1), "browser special-presentation names/order")
  unique(receipt.specialPresentationMatrix.map(({ presentation }) => presentation), "browser special presentations")
  for (const special of receipt.specialPresentationMatrix) assert(record.prototype.frameIds.includes(special.frameId) && special.browserProjects.length >= 1 && typeof special.rationale === "string" && special.rationale.trim().length >= 20, `browser special presentation ${special.presentation}: incomplete justification`)
  equal(receipt.axePolicy, harness.axePolicy, "browser Axe policy")
  assert(Array.isArray(receipt.axePolicy.allowlist) && receipt.axePolicy.allowlist.length === 0, "browser Axe allowlist must remain the closed empty set")
  exactKeys(receipt.defaultFrameCoverage, ["contract", "territoryCount", "frameCount", "browserCount", "expectedCaseCount", "actualCaseCount"], "browser default-frame coverage")
  equal(receipt.defaultFrameCoverage, {
    contract: "all-territories-all-representative-frames-all-browsers",
    territoryCount: 3,
    frameCount: record.prototype.frameIds.length,
    browserCount: 3,
    expectedCaseCount: 3 * record.prototype.frameIds.length * 3,
    actualCaseCount: 3 * record.prototype.frameIds.length * 3
  }, "browser default-frame coverage")
  const expectedSpecialCases = 3 * receipt.specialPresentationMatrix.reduce((sum, entry) => sum + entry.browserProjects.length, 0)
  const expectedCaseCount = receipt.defaultFrameCoverage.expectedCaseCount + expectedSpecialCases
  assert(Array.isArray(receipt.cases) && receipt.cases.length === expectedCaseCount, "browser receipt complete default/special case count drift")
  assert(record.browser.caseCount === receipt.cases.length, "browser case-count join drift")
  unique(receipt.cases.map(({ caseId }) => caseId), "browser case IDs")
  equal(receipt.cases.map(({ caseId }) => caseId), receipt.cases.map((_, index) => `BRC${String(index + 1).padStart(3, "0")}`), "browser sequential case IDs")
  const expectedFrameById = Object.fromEntries(prototypeContext.module.sharedFrames.map(({ frameId, archetypeId, routePath }) => [frameId, { archetypeId, routePath }]))
  for (const browserCase of receipt.cases) {
    exactKeys(browserCase, ["caseId", "territoryId", "frameId", "archetypeId", "routePath", "repositoryRelativeUrl", "fixtureRequestPath", "presentation", "browserProject", "requestedViewportWidth", "requestedViewportHeight", "observedWindowInnerWidth", "observedWindowInnerHeight", "httpResult", "externalOriginCount", "scrollWidth", "clientWidth", "axeFindings", "unexpectedAxeFindingCount", "keyboardTraversal", "actionTargetMinimumCssPx", "presentationEvidence", "printToolbarSuppressed", "printActionRowSuppressed", "printActionsSuppressed", "printToolbarElementCount", "printActionRowElementCount", "printActionElementCount", "semanticDirectTextEntryCount", "semanticSha256", "capturedAt"], `browser case ${browserCase.caseId}`)
    assert(TERRITORY_IDS.includes(browserCase.territoryId), `browser case ${browserCase.caseId}: territory invalid`)
    assert(record.prototype.frameIds.includes(browserCase.frameId), `browser case ${browserCase.caseId}: frame invalid`)
    assert(browserCase.archetypeId === expectedFrameById[browserCase.frameId].archetypeId && browserCase.routePath === expectedFrameById[browserCase.frameId].routePath, `browser case ${browserCase.caseId}: route/archetype drift`)
    assert(PRESENTATIONS.includes(browserCase.presentation) && BROWSER_PROJECTS.includes(browserCase.browserProject), `browser case ${browserCase.caseId}: presentation/browser invalid`)
    const presentationContract = receipt.presentationContracts[browserCase.presentation]
    assert(isObject(presentationContract), `browser case ${browserCase.caseId}: presentation contract absent`)
    assert(browserCase.requestedViewportWidth === presentationContract.width && browserCase.requestedViewportHeight === presentationContract.height, `browser case ${browserCase.caseId}: requested viewport drift`)
    assert(browserCase.observedWindowInnerWidth === presentationContract.width && browserCase.observedWindowInnerHeight === presentationContract.height && browserCase.clientWidth === presentationContract.width, `browser case ${browserCase.caseId}: observed viewport/client-width drift`)
    assert(browserCase.repositoryRelativeUrl === harness.repositoryRelativeUrlFor(browserCase) && browserCase.fixtureRequestPath === harness.fixtureRequestPathFor(browserCase), `browser case ${browserCase.caseId}: stable URL/request-path drift`)
    assert(browserCase.httpResult === 200 && browserCase.externalOriginCount === 0, `browser case ${browserCase.caseId}: loopback HTTP/network failure`)
    assert(Number.isInteger(browserCase.scrollWidth) && Number.isInteger(browserCase.clientWidth) && browserCase.scrollWidth <= browserCase.clientWidth, `browser case ${browserCase.caseId}: horizontal overflow`)
    assert(Array.isArray(browserCase.axeFindings) && Number.isInteger(browserCase.unexpectedAxeFindingCount) && browserCase.unexpectedAxeFindingCount === 0 && browserCase.axeFindings.length === 0, `browser case ${browserCase.caseId}: Axe finding is not in the closed empty allowlist`)
    equal(harness.validateBrowserCase(browserCase), [], `browser case ${browserCase.caseId}: harness contract`)
    if (browserCase.presentation === "print") {
      exactKeys(browserCase.keyboardTraversal, ["performed", "mode", "reason"], `browser case ${browserCase.caseId}: print keyboard traversal`)
      assert(browserCase.keyboardTraversal.performed === false && browserCase.keyboardTraversal.mode === "not-applicable-print" && typeof browserCase.keyboardTraversal.reason === "string" && browserCase.keyboardTraversal.reason.length > 0, `browser case ${browserCase.caseId}: print keyboard evidence must be explicitly not applicable`)
      assert(browserCase.actionTargetMinimumCssPx === null && browserCase.printToolbarSuppressed === true && browserCase.printActionRowSuppressed === true && browserCase.printActionsSuppressed === true, `browser case ${browserCase.caseId}: observed print suppression failure`)
      assert([browserCase.printToolbarElementCount, browserCase.printActionRowElementCount, browserCase.printActionElementCount].every((value) => Number.isInteger(value) && value > 0), `browser case ${browserCase.caseId}: print suppression requires nonzero observed element counts`)
    } else {
      const keyboard = browserCase.keyboardTraversal
      const assertCanonicalLogicalStop = (entry, path) => {
        assert(typeof entry.logicalStopId === "string" && entry.logicalStopId.length > 0 && typeof entry.coordinate === "string" && entry.coordinate.length > 0, `${path}: logical-stop ID and element coordinate required`)
        if (entry.logicalStopId.startsWith("element:")) {
          assert(entry.logicalStopId === `element:${entry.coordinate}`, `${path}: ordinary-element logical-stop ID must bind its exact coordinate`)
          return
        }
        assert(entry.logicalStopId.startsWith("radio-group:"), `${path}: canonical element: or radio-group: logical-stop ID required`)
        const encoded = entry.logicalStopId.slice("radio-group:".length)
        let tuple
        try { tuple = JSON.parse(encoded) } catch { fail(`${path}: radio-group logical-stop tuple is not JSON`) }
        assert(Array.isArray(tuple) && tuple.length === 2 && tuple.every((value) => typeof value === "string" && value.length > 0) && JSON.stringify(tuple) === encoded, `${path}: canonical [form-coordinate,name] radio-group logical-stop tuple required`)
      }
      exactKeys(keyboard, ["performed", "mode", "expectedFocusableCount", "expectedOrder", "returnExpectedOrder", "stepCount", "tabPressCount", "cycleReturnLogicalStopId", "cycleReturnCoordinate", "cycleReturnFocusVisible", "returnedToFirst", "allStopsUnique", "exactOrder", "returnOrderExact", "noTrap", "allVisitedFocusVisible", "visited", "returnVisited"], `browser case ${browserCase.caseId}: screen keyboard traversal`)
      assert(keyboard.performed === true && keyboard.mode === "native-Tab-forward-and-Shift-Tab-return-cycle", `browser case ${browserCase.caseId}: native keyboard traversal mode failure`)
      assert(Number.isInteger(keyboard.expectedFocusableCount) && keyboard.expectedFocusableCount >= 1, `browser case ${browserCase.caseId}: expected focusable count invalid`)
      for (const key of ["expectedOrder", "returnExpectedOrder"]) {
        assert(Array.isArray(keyboard[key]), `browser case ${browserCase.caseId}: ${key} array required`)
        for (const entry of keyboard[key]) {
          exactKeys(entry, ["logicalStopId", "coordinate"], `browser case ${browserCase.caseId}: ${key} entry`)
          assertCanonicalLogicalStop(entry, `browser case ${browserCase.caseId}: ${key} entry`)
        }
      }
      assert(keyboard.expectedOrder.length === keyboard.expectedFocusableCount, `browser case ${browserCase.caseId}: forward expected focus-stop count drift`)
      assert(keyboard.returnExpectedOrder.length === keyboard.expectedFocusableCount - 1, `browser case ${browserCase.caseId}: return expected focus-stop count drift`)
      const expectedLogicalOrder = keyboard.expectedOrder.map(({ logicalStopId }) => logicalStopId)
      const expectedCoordinateOrder = keyboard.expectedOrder.map(({ coordinate }) => coordinate)
      const returnExpectedLogicalOrder = keyboard.returnExpectedOrder.map(({ logicalStopId }) => logicalStopId)
      const returnExpectedCoordinateOrder = keyboard.returnExpectedOrder.map(({ coordinate }) => coordinate)
      assert(new Set(expectedLogicalOrder).size === expectedLogicalOrder.length && new Set(expectedCoordinateOrder).size === expectedCoordinateOrder.length, `browser case ${browserCase.caseId}: exact unique forward expected focus stops invalid`)
      assert(new Set(returnExpectedLogicalOrder).size === returnExpectedLogicalOrder.length && new Set(returnExpectedCoordinateOrder).size === returnExpectedCoordinateOrder.length, `browser case ${browserCase.caseId}: exact unique return expected focus stops invalid`)
      equal(returnExpectedLogicalOrder, expectedLogicalOrder.slice(0, -1).reverse(), `browser case ${browserCase.caseId}: exact reverse logical return order`)
      for (const returnStop of keyboard.returnExpectedOrder) {
        const forwardStop = keyboard.expectedOrder.find(({ logicalStopId }) => logicalStopId === returnStop.logicalStopId)
        assert(forwardStop !== undefined, `browser case ${browserCase.caseId}: return logical stop absent from forward closure`)
        if (forwardStop.coordinate !== returnStop.coordinate) assert(browserCase.browserProject === "webkit" && returnStop.logicalStopId.startsWith("radio-group:"), `browser case ${browserCase.caseId}: direction-specific element coordinate allowed only for a WebKit radio group`)
      }
      assert(keyboard.stepCount === keyboard.expectedFocusableCount && keyboard.tabPressCount === 2 * keyboard.expectedFocusableCount - 1, `browser case ${browserCase.caseId}: keyboard step/keypress count drift`)
      for (const key of ["visited", "returnVisited"]) {
        assert(Array.isArray(keyboard[key]), `browser case ${browserCase.caseId}: ${key} array required`)
        for (const entry of keyboard[key]) {
          exactKeys(entry, ["logicalStopId", "coordinate", "focusVisible"], `browser case ${browserCase.caseId}: ${key} entry`)
          assertCanonicalLogicalStop(entry, `browser case ${browserCase.caseId}: ${key} entry`)
          assert(entry.focusVisible === true, `browser case ${browserCase.caseId}: ${key} focus-visible receipt invalid`)
        }
      }
      assert(keyboard.visited.length === keyboard.expectedFocusableCount && keyboard.returnVisited.length === keyboard.expectedFocusableCount - 1, `browser case ${browserCase.caseId}: full forward/return focus traversal required`)
      const visitedOrder = keyboard.visited.map(({ logicalStopId, coordinate }) => ({ logicalStopId, coordinate }))
      const returnVisitedOrder = keyboard.returnVisited.map(({ logicalStopId, coordinate }) => ({ logicalStopId, coordinate }))
      assert(new Set(visitedOrder.map(({ logicalStopId }) => logicalStopId)).size === visitedOrder.length && new Set(visitedOrder.map(({ coordinate }) => coordinate)).size === visitedOrder.length, `browser case ${browserCase.caseId}: forward visited focus stops must be logically and physically unique`)
      assert(new Set(returnVisitedOrder.map(({ logicalStopId }) => logicalStopId)).size === returnVisitedOrder.length && new Set(returnVisitedOrder.map(({ coordinate }) => coordinate)).size === returnVisitedOrder.length, `browser case ${browserCase.caseId}: return visited focus stops must be logically and physically unique`)
      equal(visitedOrder, keyboard.expectedOrder, `browser case ${browserCase.caseId}: exact forward logical-stop/coordinate order`)
      equal(returnVisitedOrder, keyboard.returnExpectedOrder, `browser case ${browserCase.caseId}: exact return logical-stop/coordinate order`)
      assert(keyboard.cycleReturnLogicalStopId === keyboard.expectedOrder[0].logicalStopId && keyboard.cycleReturnCoordinate === keyboard.returnExpectedOrder.at(-1)?.coordinate && keyboard.cycleReturnFocusVisible === true && keyboard.returnedToFirst === true && keyboard.allStopsUnique === true && keyboard.exactOrder === true && keyboard.returnOrderExact === true && keyboard.noTrap === true && keyboard.allVisitedFocusVisible === true, `browser case ${browserCase.caseId}: full-cycle logical-order/coordinate/trap/focus-visible proof failed`)
      assert(browserCase.actionTargetMinimumCssPx >= 44 && browserCase.printToolbarSuppressed === null && browserCase.printActionRowSuppressed === null && browserCase.printActionsSuppressed === null, `browser case ${browserCase.caseId}: screen target/print-observation contract failure`)
      assert(browserCase.printToolbarElementCount === null && browserCase.printActionRowElementCount === null && browserCase.printActionElementCount === null, `browser case ${browserCase.caseId}: screen print counts must be null`)
    }
    const evidence = browserCase.presentationEvidence
    assert(isObject(evidence) && evidence.kind === presentationContract.evidenceKind && evidence.rootPresentationDataset === presentationContract.queryPresentation, `browser case ${browserCase.caseId}: presentation-evidence identity drift`)
    if (["default", "phone-320", "phone-390", "tablet-768", "desktop-1440"].includes(browserCase.presentation)) {
      exactKeys(evidence, ["kind", "rootPresentationDataset", "expectedViewportWidth", "expectedViewportHeight"], `browser case ${browserCase.caseId}: default/viewport evidence`)
      assert(evidence.expectedViewportWidth === presentationContract.width && evidence.expectedViewportHeight === presentationContract.height, `browser case ${browserCase.caseId}: default/viewport evidence drift`)
    } else if (browserCase.presentation === "large-text-125") {
      exactKeys(evidence, ["kind", "rootPresentationDataset", "baselinePx", "scaledPx", "ratios"], `browser case ${browserCase.caseId}: large-text evidence`)
      for (const [name, values] of [["baselinePx", evidence.baselinePx], ["scaledPx", evidence.scaledPx], ["ratios", evidence.ratios]]) {
        exactKeys(values, ["root", "h1", "lead", "eyebrow"], `browser case ${browserCase.caseId}: large-text ${name}`)
        assert(Object.values(values).every((value) => Number.isFinite(value) && value > 0), `browser case ${browserCase.caseId}: large-text ${name} measurement invalid`)
      }
      for (const key of ["root", "h1", "lead", "eyebrow"]) assert(Math.abs(evidence.ratios[key] - 1.25) <= 0.01 && Math.abs(evidence.scaledPx[key] / evidence.baselinePx[key] - evidence.ratios[key]) <= 0.001, `browser case ${browserCase.caseId}: ${key} does not prove 1.25 large-text scaling`)
    } else if (browserCase.presentation === "reduced-motion") {
      exactKeys(evidence, ["kind", "rootPresentationDataset", "mediaMatches", "computedTransitionDuration", "durationMs"], `browser case ${browserCase.caseId}: reduced-motion evidence`)
      assert(evidence.mediaMatches === true && typeof evidence.computedTransitionDuration === "string" && evidence.computedTransitionDuration.length > 0 && Number.isFinite(evidence.durationMs) && evidence.durationMs <= 0.001, `browser case ${browserCase.caseId}: reduced-motion match/duration drift`)
    } else if (browserCase.presentation === "forced-colors") {
      exactKeys(evidence, ["kind", "rootPresentationDataset", "mediaMatches", "adaptation", "stableAdaptationSha256", "nativeFocusObserved"], `browser case ${browserCase.caseId}: forced-colors evidence`)
      exactKeys(evidence.adaptation, ["bodyColor", "bodyBackgroundColor", "actionColor", "actionBackgroundColor", "actionOutlineColor", "actionOutlineStyle", "actionOutlineWidth", "actionForcedColorAdjust"], `browser case ${browserCase.caseId}: forced-colors adaptation`)
      assert(evidence.mediaMatches === true && evidence.nativeFocusObserved === true && Object.values(evidence.adaptation).every((value) => typeof value === "string" && value.length > 0) && evidence.stableAdaptationSha256 === sha256(JSON.stringify(evidence.adaptation)), `browser case ${browserCase.caseId}: forced-colors match/adaptation/focus drift`)
    } else if (browserCase.presentation === "zoom-400") {
      exactKeys(evidence, ["kind", "rootPresentationDataset", "physicalViewportWidth", "zoomFactor", "expectedCssViewportWidth", "observedCssViewportWidth", "equivalenceExact"], `browser case ${browserCase.caseId}: zoom evidence`)
      equal(evidence, { kind: "zoom-400-equivalent", rootPresentationDataset: "default", physicalViewportWidth: 1280, zoomFactor: 4, expectedCssViewportWidth: 320, observedCssViewportWidth: 320, equivalenceExact: true }, `browser case ${browserCase.caseId}: 400%-equivalent zoom facts`)
    } else if (browserCase.presentation === "print") {
      exactKeys(evidence, ["kind", "rootPresentationDataset", "toolbarElementCount", "actionRowElementCount", "actionElementCount"], `browser case ${browserCase.caseId}: print evidence`)
      equal([evidence.toolbarElementCount, evidence.actionRowElementCount, evidence.actionElementCount], [browserCase.printToolbarElementCount, browserCase.printActionRowElementCount, browserCase.printActionElementCount], `browser case ${browserCase.caseId}: print evidence/count join`)
    }
    assert(Number.isInteger(browserCase.semanticDirectTextEntryCount) && browserCase.semanticDirectTextEntryCount > 0 && sha256Pattern.test(browserCase.semanticSha256), `browser case ${browserCase.caseId}: semantic direct-text/digest evidence invalid`)
    assert(isDateTime(browserCase.capturedAt) && Date.parse(browserCase.capturedAt) >= Date.parse(receipt.startedAt) && Date.parse(browserCase.capturedAt) <= Date.parse(receipt.completedAt), `browser case ${browserCase.caseId}: timestamp outside receipt interval`)
  }
  const expectedCases = []
  for (const territoryId of TERRITORY_IDS) {
    for (const frameId of record.prototype.frameIds) for (const browserProject of BROWSER_PROJECTS) expectedCases.push({ territoryId, frameId, presentation: "default", browserProject })
    for (const special of receipt.specialPresentationMatrix) for (const browserProject of special.browserProjects) expectedCases.push({ territoryId, frameId: special.frameId, presentation: special.presentation, browserProject })
  }
  equal(harness.validateRequiredCaseSet(receipt.cases, expectedCases), [], "browser required-case closure")
  for (const frameId of record.prototype.frameIds) {
    for (const browserProject of BROWSER_PROJECTS) {
      const digests = TERRITORY_IDS.map((territoryId) => receipt.cases.find((entry) => entry.territoryId === territoryId && entry.frameId === frameId && entry.presentation === "default" && entry.browserProject === browserProject)?.semanticSha256)
      assert(new Set(digests).size === 1, `browser semantic parity drift for ${frameId}/${browserProject}`)
    }
  }
  assert(record.browser.semanticParity === true, "browser semantic-parity manifest flag must be true")
  exactKeys(receipt.suiteResult, ["status", "expectedCaseCount", "actualCaseCount", "defaultCaseCount", "specialCaseCount", "printCaseCount", "caseEvidenceSha256", "totalAxeFindingCount", "unexpectedAxeFindingCount", "forcedColorsStableAdaptationSha256", "harnessAdversarialTests"], "browser suite result")
  assert(receipt.suiteResult.status === "passed" && receipt.suiteResult.expectedCaseCount === expectedCaseCount && receipt.suiteResult.actualCaseCount === receipt.cases.length, "browser suite result count/status drift")
  assert(receipt.suiteResult.defaultCaseCount === receipt.defaultFrameCoverage.actualCaseCount && receipt.suiteResult.specialCaseCount === expectedSpecialCases && receipt.suiteResult.printCaseCount === 9, "browser suite result default/special/print count drift")
  const printCases = receipt.cases.filter(({ presentation }) => presentation === "print")
  assert(printCases.length === 9, "browser immutable print receipt must contain exactly nine cases")
  equal(printCases.map(({ territoryId, frameId, browserProject }) => ({ territoryId, frameId, browserProject })), TERRITORY_IDS.flatMap((territoryId) => BROWSER_PROJECTS.map((browserProject) => ({ territoryId, frameId: "review-queue-empty", browserProject }))), "browser exact immutable nine-case print coordinate scope")
  const deterministicCases = receipt.cases.map(({ capturedAt: _capturedAt, ...browserCase }) => browserCase)
  assert(receipt.suiteResult.caseEvidenceSha256 === sha256(JSON.stringify(deterministicCases)), "browser deterministic case evidence digest drift")
  assert(receipt.suiteResult.totalAxeFindingCount === 0 && receipt.suiteResult.unexpectedAxeFindingCount === 0, "browser suite Axe aggregate drift")
  const forcedColorsCases = receipt.cases.filter(({ presentation }) => presentation === "forced-colors")
  assert(forcedColorsCases.length === 3, "browser receipt requires exactly one forced-colors case per territory")
  const forcedColorsHashes = forcedColorsCases.map(({ presentationEvidence }) => presentationEvidence.stableAdaptationSha256)
  assert(new Set(forcedColorsHashes).size === 1 && receipt.suiteResult.forcedColorsStableAdaptationSha256 === forcedColorsHashes[0] && sha256Pattern.test(forcedColorsHashes[0]), "browser forced-colors adaptation hash must be stable across A/B/C")
  equal(receipt.suiteResult.harnessAdversarialTests, ["missing-nonfocused-firefox-default-frame", "broken-nonfocused-firefox-default-frame", "keyboard-skipped-late-control", "keyboard-duplicate-or-trap", "keyboard-late-invisible-focus", "keyboard-wrong-order", "keyboard-retargeted-radio-member", "keyboard-logical-stop-drift", "keyboard-coherent-return-order-drift", "keyboard-element-coordinate-identity-drift", "keyboard-nonwebkit-radio-direction-drift", "keyboard-duplicate-logical-stop", "keyboard-cycle-logical-stop-drift", "keyboard-cycle-coordinate-drift", "unsuppressed-print-action", "zero-count-suppressed-print-action", "route-path-frame-drift", "repository-relative-url-drift", "fixture-request-path-drift", "viewport-width-drift", "semantic-signature-direct-text-erased", "large-text-root-ratio", "reduced-motion-not-matched", "forced-colors-adaptation-drift", "zoom-equivalence-drift", "moderate-axe-finding"], "browser harness adversarial receipts")
  equal(harness.runBrowserContractAdversarialTests(), receipt.suiteResult.harnessAdversarialTests, "browser live adversarial checks")
  const tokenEvidence = receipt.tokenEvidence
  exactKeys(tokenEvidence, ["observations", "computedAxes", "differentiation", "materialDifferentiationCount"], "browser token evidence")
  equal(tokenEvidence.observations.map(({ territoryId }) => territoryId), TERRITORY_IDS, "token evidence territory order")
  for (const observation of tokenEvidence.observations) {
    const territory = prototypeContext.module.territories.find(({ territoryId }) => territoryId === observation.territoryId)
    assert(territory !== undefined && observation.roles.length === tokenMapping.mapping.entries.length, `token evidence ${observation.territoryId}: role closure drift`)
    for (const roleObservation of observation.roles) {
      const mapEntry = tokenMapping.mapping.entries.find(({ role }) => role === roleObservation.role)
      exactKeys(roleObservation, ["role", "cssCustomProperty", "declaredValue", "computedCustomPropertyValue", "consumer", "consumerComputedValue", "promotable", "dependencyProof"], `token evidence ${observation.territoryId}/${roleObservation.role}`)
      assert(mapEntry !== undefined && roleObservation.cssCustomProperty === mapEntry.cssCustomProperty, `token evidence ${observation.territoryId}/${roleObservation.role}: map join drift`)
      equal(roleObservation.consumer, mapEntry.consumer, `token evidence ${observation.territoryId}/${roleObservation.role}: consumer join`)
      assert(roleObservation.declaredValue === territory.tokens[roleObservation.role] && roleObservation.computedCustomPropertyValue === roleObservation.declaredValue, `token evidence ${observation.territoryId}/${roleObservation.role}: declared/computed token drift`)
      assert(typeof roleObservation.consumerComputedValue === "string" && roleObservation.consumerComputedValue.length > 0, `token evidence ${observation.territoryId}/${roleObservation.role}: consumer value absent`)
      const promotable = tokenMapping.mapping.promotableRoles.includes(roleObservation.role)
      assert(roleObservation.promotable === promotable, `token evidence ${observation.territoryId}/${roleObservation.role}: promotable marker drift`)
      if (roleObservation.role === "manifest.themeColor") {
        exactKeys(roleObservation.dependencyProof, ["proofType", "expectedAttributeValue", "observedAttributeValue", "exact"], `token evidence ${observation.territoryId}/${roleObservation.role}.dependencyProof`)
        assert(roleObservation.dependencyProof.proofType === "explicit-dom-attribute-binding" && roleObservation.dependencyProof.expectedAttributeValue === roleObservation.declaredValue && roleObservation.dependencyProof.observedAttributeValue === roleObservation.declaredValue && roleObservation.dependencyProof.exact === true, `token evidence ${observation.territoryId}/${roleObservation.role}: explicit meta binding drift`)
      } else if (promotable) {
        exactKeys(roleObservation.dependencyProof, ["proofType", "alternateTerritoryId", "alternateDeclaredValue", "beforeConsumerComputedValue", "alternateConsumerComputedValue", "restoredConsumerComputedValue", "changed", "restored"], `token evidence ${observation.territoryId}/${roleObservation.role}.dependencyProof`)
        assert(roleObservation.dependencyProof.proofType === "browser-custom-property-dependency-mutation" && TERRITORY_IDS.includes(roleObservation.dependencyProof.alternateTerritoryId) && roleObservation.dependencyProof.alternateTerritoryId !== observation.territoryId, `token evidence ${observation.territoryId}/${roleObservation.role}: dependency proof identity drift`)
        const alternateTerritory = prototypeContext.module.territories.find(({ territoryId }) => territoryId === roleObservation.dependencyProof.alternateTerritoryId)
        assert(alternateTerritory !== undefined && roleObservation.dependencyProof.alternateDeclaredValue === alternateTerritory.tokens[roleObservation.role], `token evidence ${observation.territoryId}/${roleObservation.role}: alternate token join drift`)
        assert(roleObservation.dependencyProof.changed === true && roleObservation.dependencyProof.restored === true, `token evidence ${observation.territoryId}/${roleObservation.role}: CSS dependency not proved`)
        assert(roleObservation.dependencyProof.beforeConsumerComputedValue === roleObservation.consumerComputedValue && roleObservation.dependencyProof.restoredConsumerComputedValue === roleObservation.consumerComputedValue && roleObservation.dependencyProof.alternateConsumerComputedValue !== roleObservation.consumerComputedValue, `token evidence ${observation.territoryId}/${roleObservation.role}: consumer mutation/restoration drift`)
      } else {
        assert(roleObservation.dependencyProof === null, `token evidence ${observation.territoryId}/${roleObservation.role}: nonpromotable dependency proof must be null`)
      }
    }
  }
  equal(tokenEvidence.computedAxes.map(({ territoryId }) => territoryId), TERRITORY_IDS, "computed-axis territory order")
  for (const computed of tokenEvidence.computedAxes) {
    exactKeys(computed, ["territoryId", "axes"], `computed axes ${computed.territoryId}`)
    equal(computed.axes.map(({ axisId }) => axisId), tokenMapping.mapping.materialAxes.map(({ axisId }) => axisId), `computed axes ${computed.territoryId}: axis closure`)
    for (const axis of computed.axes) {
      const mapped = tokenMapping.mapping.materialAxes.find(({ axisId }) => axisId === axis.axisId)
      exactKeys(axis, ["axisId", "selector", "property", "computedValue"], `computed axes ${computed.territoryId}/${axis.axisId}`)
      assert(mapped !== undefined && axis.selector === mapped.selector && axis.property === mapped.property && typeof axis.computedValue === "string" && axis.computedValue.length > 0, `computed axes ${computed.territoryId}/${axis.axisId}: mapping/value drift`)
    }
  }
  equal(tokenEvidence.differentiation.map(({ axisId }) => axisId), tokenMapping.mapping.materialAxes.map(({ axisId }) => axisId), "computed-axis differentiation closure")
  for (const entry of tokenEvidence.differentiation) {
    exactKeys(entry, ["axisId", "values", "pairwiseDistinct"], `computed material differentiation ${entry.axisId}`)
    assert(entry.pairwiseDistinct === true && entry.values.length === 3 && new Set(entry.values.map(({ computedValue }) => computedValue)).size === 3, `computed material axis ${entry.axisId}: territories are not pairwise distinct`)
    for (const value of entry.values) {
      exactKeys(value, ["territoryId", "computedValue"], `computed material differentiation ${entry.axisId}/${value.territoryId}`)
      const computed = tokenEvidence.computedAxes.find(({ territoryId }) => territoryId === value.territoryId)?.axes.find(({ axisId }) => axisId === entry.axisId)?.computedValue
      assert(computed === value.computedValue, `computed material differentiation ${entry.axisId}/${value.territoryId}: evidence join drift`)
    }
  }
  assert(tokenEvidence.materialDifferentiationCount === tokenEvidence.differentiation.length && tokenEvidence.materialDifferentiationCount >= 5, "computed material differentiation count drift")
  return { harness, tokenMapping: tokenMapping.mapping }
}

const loadReviews = (record) => {
  assert(record.reviews.reviewCount === 3 && record.reviews.files.length === 3, "exactly three review files required")
  equal(record.reviews.requiredRubricIds, RUBRIC_IDS, "required rubric IDs")
  assert(record.reviews.receiptAuthenticationLimitation === RECEIPT_AUTHENTICATION_LIMITATION, "review receipt limitation drift")
  const loaded = record.reviews.files.map((descriptor) => {
    exactKeys(descriptor, ["path", "bytes", "sha256", "taskPath", "rubricId"], `review descriptor ${descriptor.path}`)
    assert(REVIEW_OUTPUT_PATHS[descriptor.rubricId] === descriptor.path, `${descriptor.path}: exact review path invalid`)
    assert(REVIEW_TASK_PATHS[descriptor.rubricId] === descriptor.taskPath, `${descriptor.path}: native task path drift`)
    const bytes = verifyDescriptor({ path: descriptor.path, bytes: descriptor.bytes, sha256: descriptor.sha256 }, descriptor.path)
    return { descriptor, bytes, review: parseJsonStrict(decodeText(bytes, descriptor.path), descriptor.path) }
  })
  const taskReceiptBytes = verifyDescriptor(record.reviews.taskReceiptFile, taskReceiptPath)
  const taskReceipt = parseJsonStrict(decodeText(taskReceiptBytes, taskReceiptPath), taskReceiptPath)
  assert(record.reviews.promptFiles.length === 3, "exactly three prompt files required")
  const prompts = record.reviews.promptFiles.map((descriptor) => {
    exactKeys(descriptor, ["path", "bytes", "sha256", "taskPath", "rubricId"], `prompt descriptor ${descriptor.path}`)
    assert(REVIEW_PROMPT_PATHS[descriptor.rubricId] === descriptor.path, `${descriptor.path}: exact prompt path invalid`)
    assert(REVIEW_TASK_PATHS[descriptor.rubricId] === descriptor.taskPath, `${descriptor.path}: prompt native task path drift`)
    const bytes = verifyDescriptor({ path: descriptor.path, bytes: descriptor.bytes, sha256: descriptor.sha256 }, descriptor.path)
    return { descriptor, bytes, text: decodeText(bytes, descriptor.path) }
  })
  return { loaded, taskReceiptBytes, taskReceipt, prompts }
}
const rubricSha256 = (rubricId) => sha256(Buffer.from(`${stable({ rubricId, rubricCriteria: RUBRIC_CRITERIA[rubricId] })}\n`, "utf8"))
const promptRenderValues = (record, browserHash, rubricId) => ({
  TASK_PATH: REVIEW_TASK_PATHS[rubricId],
  RUBRIC_ID: rubricId,
  REVIEW_SUBJECT_SHA: record.reviews.reviewSubjectSha,
  REVIEW_SUBJECT_TREE_SHA: record.reviews.reviewSubjectTreeSha,
  COMPARISON_SOURCE_SHA: record.prototype.comparisonSourceSha,
  PROTOTYPE_BUNDLE_SHA256: record.prototype.bundleSha256,
  BROWSER_RECEIPT_SHA256: browserHash,
  RUBRIC_SHA256: rubricSha256(rubricId)
})
const validatePromptTemplate = (text, rubricId, path) => {
  const requiredLiterals = [
    "protocolId=CODEX-ONLY-UIUX-V1",
    "reviewMode=codex-only",
    "humanEvidence=none",
    "humanParticipantCount=0",
    "humanReviewRequired=false",
    "notHumanUsabilityTested=true",
    "taskPath={{TASK_PATH}}",
    "rubricId={{RUBRIC_ID}}",
    "repositoryCommit={{REVIEW_SUBJECT_SHA}}",
    "reviewSubjectTreeSha={{REVIEW_SUBJECT_TREE_SHA}}",
    `acceptedStep2SubjectSha=${STEP2_SUBJECT_SHA}`,
    `acceptedStep2MergeSha=${STEP2_MERGE_SHA}`,
    "comparisonSourceSha={{COMPARISON_SOURCE_SHA}}",
    "prototypeBundleSha256={{PROTOTYPE_BUNDLE_SHA256}}",
    "browserReceiptSha256={{BROWSER_RECEIPT_SHA256}}",
    "rubricSha256={{RUBRIC_SHA256}}",
    "Evidence coordinates must use repository/path:L<positive-line>.",
    "Inspect all seven archetypes and every A/B/C frame in the representative 12-frame, 10-route comparison plus the committed browser special-presentation evidence; do not claim exhaustive legal-state coverage.",
    "Keyboard evidence is a native document-focus-order round trip: forward Tab covers every derived enabled visible stop once, then Shift+Tab follows the exact reverse return order.",
    "Firefox browser-chrome transition and forward re-entry are not observable through Playwright, so do not claim a forward-only wrap or programmatic-focus proof.",
    "Do not write to the repository; read-only inspection and /tmp-only scratch work are allowed.",
    "Do not read or request another review lane's output before submitting your own result.",
    "Return exactly one JSON object and no Markdown fence.",
    "The native completion message is hashed separately from the normalized committed review JSON."
  ]
  for (const literal of requiredLiterals) assert(text.split(literal).length === 2, `${path}: prompt-template literal must occur exactly once: ${literal}`)
  assert(text.split(REVIEW_COORDINATE_PATH_INSTRUCTION).length === 2, `${path}: exact evidence-coordinate path allowlist required once`)
  if (rubricId === "consumer-trust-anti-ai-slop") {
    assert(text.split(TRUST_LANE_ORCHESTRATION_INSTRUCTION).length === 2, `${path}: exact trust-lane spawn/non-observation instruction required once`)
    assert(!text.includes(CHILD_LANE_RELEASE_INSTRUCTION), `${path}: trust lane must not carry the child output barrier`)
  } else {
    assert(text.split(CHILD_LANE_RELEASE_INSTRUCTION).length === 2, `${path}: exact child-lane root release barrier required once`)
    assert(!text.includes(TRUST_LANE_ORCHESTRATION_INSTRUCTION), `${path}: child lane must not carry trust orchestration duty`)
  }
  for (const criterionId of RUBRIC_CRITERIA[rubricId]) assert(text.split(criterionId).length === 2, `${path}: rubric criterion must occur exactly once: ${criterionId}`)
  for (const other of RUBRIC_IDS.filter((candidate) => candidate !== rubricId)) for (const criterionId of RUBRIC_CRITERIA[other]) assert(!text.includes(criterionId), `${path}: prompt template crosses into ${other} criterion ${criterionId}`)
  for (const key of REVIEW_OUTPUT_KEYS) assert(text.includes(`\`${key}\``), `${path}: exact review-output key contract omits ${key}`)
  for (const key of ["territoryId", "criterionScores", "total", "blockingFindings", "criterionId", "score", "finding", "evidenceCoordinates", "reason"]) assert(text.includes(`\`${key}\``), `${path}: exact nested review-output key contract omits ${key}`)
  const placeholders = [...text.matchAll(/\{\{([A-Z0-9_]+)\}\}/gu)].map((match) => match[1])
  equal(placeholders.sort(), Object.keys(promptRenderValues({ reviews: { reviewSubjectSha: "", reviewSubjectTreeSha: "" }, prototype: { comparisonSourceSha: "", bundleSha256: "" } }, "", rubricId)).sort(), `${path}: exact prompt placeholder closure`)
  unique(placeholders, `${path}: prompt placeholders`)
}
const renderReviewPrompt = (text, record, browserHash, rubricId, path) => {
  validatePromptTemplate(text, rubricId, path)
  let rendered = text
  for (const [placeholder, value] of Object.entries(promptRenderValues(record, browserHash, rubricId))) rendered = rendered.replaceAll(`{{${placeholder}}}`, value)
  assert(!/\{\{[A-Z0-9_]+\}\}/u.test(rendered), `${path}: unresolved task-message placeholder`)
  return rendered
}
const validateEvidenceCoordinates = (coordinates, path, reviewSubjectSha) => {
  assert(Array.isArray(coordinates) && coordinates.length >= 1, `${path}: evidence coordinates required`)
  unique(coordinates, path)
  for (const coordinate of coordinates) {
    assert(typeof coordinate === "string", `${path}: string coordinate required`)
    const match = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))([^\r\n\0]+):L([1-9][0-9]*)$/u.exec(coordinate)
    assert(match !== null, `${path}: exact repository-relative path:L<positive-line> coordinate required`)
    const [, evidencePath, rawLine] = match
    assert(REVIEW_COORDINATE_PATHS.has(evidencePath), `${path}: coordinate path is outside the fixed review evidence set`)
    let committed
    try { committed = runGit(["show", `${reviewSubjectSha}:${evidencePath}`], null) } catch { fail(`${path}: coordinate path absent from review subject`) }
    const text = decodeText(committed, `${reviewSubjectSha}:${evidencePath}`)
    const lines = text.slice(0, -1).split("\n")
    const line = Number(rawLine)
    assert(line <= lines.length && lines[line - 1].trim().length > 0, `${path}: coordinate does not resolve to a nonblank committed line`)
  }
}
const validateReviewSubject = (record, browserReceipt) => {
  const subject = record.reviews.reviewSubjectSha
  validateSubjectTopology(subject, browserReceipt)
  assert(gitSucceeds(["merge-base", "--is-ancestor", subject, "HEAD"]), "review subject is not an ancestor of terminal HEAD")
  assert(runGit(["show", "-s", "--format=%T", subject]).trim() === record.reviews.reviewSubjectTreeSha, "review subject tree SHA drift")
  const reviewedDescriptors = [
    ...record.prototype.files,
    record.assets.file,
    record.assets.verifier,
    record.benchmarks.file,
    record.browser.file,
    ...browserReceipt.prototypeFiles,
    ...browserReceipt.harnessFiles,
    browserReceipt.tokenMappingFile,
    ...record.reviews.promptFiles
  ]
  const byPath = new Map()
  for (const descriptor of reviewedDescriptors) {
    if (descriptor === undefined) continue
    const fileDescriptor = { path: descriptor.path, bytes: descriptor.bytes, sha256: descriptor.sha256 }
    if (byPath.has(descriptor.path)) equal(fileDescriptor, byPath.get(descriptor.path), `review-subject descriptor duplicate ${descriptor.path}`)
    else byPath.set(descriptor.path, fileDescriptor)
  }
  for (const descriptor of byPath.values()) verifyDescriptor(descriptor, descriptor.path, subject)
  return subject
}
const validateTaskReceipts = (record, browserBytes, browserReceipt, loadedReviews, taskReceipt, prompts) => {
  exactKeys(taskReceipt, ["schemaVersion", "receiptId", "protocolId", "reviewMode", "evidenceClass", "humanEvidence", "humanParticipantCount", "humanReviewRequired", "notHumanUsabilityTested", "receiptContract", "authenticationStatus", "authenticationLimitation", "reviewSubjectSha", "reviewSubjectTreeSha", "comparisonSourceSha", "prototypeBundleSha256", "browserReceiptSha256", "promptTemplateRenderAlgorithm", "promptHashAlgorithm", "rubricHashAlgorithm", "reportHashAlgorithm", "nativeCompletionHashAlgorithm", "safeReceiptHashAlgorithm", "tasks"], "review task receipt")
  assert(taskReceipt.schemaVersion === 2 && taskReceipt.receiptId === "plan-006-codex-task-safe-receipts", "review task receipt identity drift")
  validateHumanBoundary(taskReceipt, "review task receipt")
  assert(taskReceipt.receiptContract === "codex-task-safe-receipt-v2", "review task receipt contract drift")
  assert(taskReceipt.evidenceClass === "unauthenticated-native-codex-task-audit-summary-not-user-research", "review task receipt evidence class drift")
  assert(taskReceipt.authenticationStatus === "unauthenticated-local-orchestration-summary" && taskReceipt.authenticationLimitation === RECEIPT_AUTHENTICATION_LIMITATION, "review task receipt authentication boundary drift")
  assert(taskReceipt.reviewSubjectSha === record.reviews.reviewSubjectSha && taskReceipt.reviewSubjectTreeSha === record.reviews.reviewSubjectTreeSha, "review task receipt subject join drift")
  assert(taskReceipt.comparisonSourceSha === record.prototype.comparisonSourceSha && taskReceipt.prototypeBundleSha256 === record.prototype.bundleSha256, "review task receipt prototype join drift")
  assert(taskReceipt.browserReceiptSha256 === sha256(browserBytes), "review task receipt browser join drift")
  assert(taskReceipt.promptTemplateRenderAlgorithm === "literal {{UPPER_SNAKE_CASE}} replacement in exact committed UTF-8 template bytes", "review prompt-template render algorithm drift")
  assert(taskReceipt.promptHashAlgorithm === "sha256(exact UTF-8 rendered task message)", "review prompt hash algorithm drift")
  assert(taskReceipt.rubricHashAlgorithm === "sha256(UTF-8(canonical JSON {rubricId,rubricCriteria}) + LF)", "review rubric hash algorithm drift")
  assert(taskReceipt.reportHashAlgorithm === "sha256(exact normalized committed UTF-8 review JSON bytes)", "review report hash algorithm drift")
  assert(taskReceipt.nativeCompletionHashAlgorithm === "sha256(exact exposed native completion UTF-8 text bytes)", "native completion hash algorithm drift")
  assert(taskReceipt.safeReceiptHashAlgorithm === "sha256(UTF-8 compact JSON.stringify of the ordered receipt payload excluding safeReceiptSha256)", "safe receipt hash algorithm drift")
  assert(Array.isArray(taskReceipt.tasks) && taskReceipt.tasks.length === 3, "task receipt needs exactly three tasks")
  const promptByRubric = Object.fromEntries(prompts.map((entry) => [entry.descriptor.rubricId, entry]))
  const reviewByRubric = Object.fromEntries(loadedReviews.map((entry) => [entry.descriptor.rubricId, entry]))
  const subjectCommittedAt = Date.parse(runGit(["show", "-s", "--format=%cI", record.reviews.reviewSubjectSha]).trim())
  equal(taskReceipt.tasks.map(({ rubricId }) => rubricId).sort(), [...RUBRIC_IDS].sort(), "task receipt rubric closure")
  unique(taskReceipt.tasks.map(({ safeReceipt }) => safeReceipt.taskPath), "task receipt task paths")
  unique(taskReceipt.tasks.map(({ safeReceipt }) => safeReceipt.sessionUuid), "task receipt session UUIDs")
  unique(taskReceipt.tasks.map(({ safeReceipt }) => safeReceipt.completionTurnId), "task receipt completion turn IDs")
  unique(taskReceipt.tasks.map(({ safeReceipt }) => safeReceipt.completionMessageSha256), "task receipt native completion messages")
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u
  const trustTask = taskReceipt.tasks.find(({ rubricId }) => rubricId === "consumer-trust-anti-ai-slop")
  assert(trustTask !== undefined && uuidPattern.test(trustTask.safeReceipt?.sessionUuid), "trust-lane native session UUID absent")
  const trustSessionUuid = trustTask.safeReceipt.sessionUuid
  const trustCreatedAt = Number.parseInt(trustSessionUuid.replaceAll("-", "").slice(0, 12), 16)
  const safePayloadKeys = ["schemaVersion", "authenticationStatus", "authenticationLimitation", "taskPath", "sessionUuid", "parentThreadId", "provenanceClass", "threadSource", "originator", "depth", "completionState", "completionEventTimestamp", "completionTurnId", "completionMessageSha256", "reportPath", "reportSha256", "repositoryCommit", "rawSpawn", "rawCompletion", "safeReceiptHashAlgorithm"]
  const rawKeys = ["source", "encoding", "byteLength", "sha256", "bytesBase64"]
  const decodeRaw = (raw, path, expectedSource) => {
    equal(Object.keys(raw), rawKeys, `${path}: physical key order and shape`)
    assert(raw.source === expectedSource && raw.encoding === "base64", `${path}: raw source/encoding drift`)
    assert(typeof raw.bytesBase64 === "string" && Buffer.from(raw.bytesBase64, "base64").toString("base64") === raw.bytesBase64, `${path}: canonical base64 required`)
    const bytes = Buffer.from(raw.bytesBase64, "base64")
    assert(raw.byteLength === bytes.byteLength && raw.sha256 === sha256(bytes), `${path}: raw byte descriptor drift`)
    assert(Buffer.from(bytes.toString("utf8"), "utf8").equals(bytes), `${path}: exact UTF-8 bytes required`)
    return bytes
  }
  const uuidV7Time = (uuid) => Number.parseInt(uuid.replaceAll("-", "").slice(0, 12), 16)
  for (const task of taskReceipt.tasks) {
    exactKeys(task, ["rubricId", "promptTemplatePath", "promptTemplateSha256", "promptSha256", "rubricSha256", "safeReceipt"], `task receipt binding ${task.rubricId}`)
    const receipt = task.safeReceipt
    equal(Object.keys(receipt), [...safePayloadKeys, "safeReceiptSha256"], `safe receipt ${task.rubricId}: physical key order and shape`)
    assert(receipt.schemaVersion === "codex-task-safe-receipt-v2", `safe receipt ${task.rubricId}: schema version drift`)
    assert(receipt.authenticationStatus === "unauthenticated-local-orchestration-summary" && receipt.authenticationLimitation === RECEIPT_AUTHENTICATION_LIMITATION, `safe receipt ${task.rubricId}: authentication boundary drift`)
    assert(REVIEW_TASK_PATHS[task.rubricId] === receipt.taskPath, `safe receipt ${task.rubricId}: exact native task path drift`)
    assert(uuidPattern.test(receipt.sessionUuid) && !REJECTED_REVIEW_SESSION_UUIDS.has(receipt.sessionUuid), `safe receipt ${task.rubricId}: invalid, old, or rejected session UUID`)
    const isTrustLane = task.rubricId === "consumer-trust-anti-ai-slop"
    const expectedParentThreadId = isTrustLane ? REVIEW_AUDIT_PARENT_THREAD_ID : trustSessionUuid
    const expectedDepth = isTrustLane ? 2 : 3
    assert(receipt.parentThreadId === expectedParentThreadId, `safe receipt ${task.rubricId}: fixed parent-thread topology drift`)
    assert(receipt.provenanceClass === "native-codex-subagent-thread-spawn" && receipt.threadSource === "subagent" && typeof receipt.originator === "string" && /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,63}$/u.test(receipt.originator) && receipt.depth === expectedDepth, `safe receipt ${task.rubricId}: provenance/depth drift`)
    assert(receipt.completionState === "completed" && uuidPattern.test(receipt.completionTurnId), `safe receipt ${task.rubricId}: completion state/turn drift`)
    assert(receipt.repositoryCommit === record.reviews.reviewSubjectSha, `safe receipt ${task.rubricId}: retargeted repository commit`)
    const rawSpawnBytes = decodeRaw(receipt.rawSpawn, `safe receipt ${task.rubricId}.rawSpawn`, "caller-supplied-exposed-spawn-response")
    const rawCompletionBytes = decodeRaw(receipt.rawCompletion, `safe receipt ${task.rubricId}.rawCompletion`, "local-rollout-task_complete.last_agent_message")
    assertNoContradictoryClaimsOrPrivateData(rawSpawnBytes.toString("utf8"), `safe receipt ${task.rubricId}.rawSpawn`)
    assertNoContradictoryClaimsOrPrivateData(rawCompletionBytes.toString("utf8"), `safe receipt ${task.rubricId}.rawCompletion`)
    let rawSpawn
    try { rawSpawn = parseJsonStrict(rawSpawnBytes.toString("utf8"), `safe receipt ${task.rubricId}.rawSpawn`) } catch { fail(`safe receipt ${task.rubricId}: raw spawn is not strict JSON`) }
    equal(rawSpawn, { task_name: receipt.taskPath }, `safe receipt ${task.rubricId}: exact exposed spawn value`)
    assert(receipt.completionMessageSha256 === receipt.rawCompletion.sha256, `safe receipt ${task.rubricId}: native completion hash drift`)
    assert(receipt.safeReceiptHashAlgorithm === "sha256(UTF-8 compact JSON.stringify of the ordered receipt payload excluding safeReceiptSha256)", `safe receipt ${task.rubricId}: hash algorithm drift`)
    const payload = Object.fromEntries(safePayloadKeys.map((key) => [key, receipt[key]]))
    assert(receipt.safeReceiptSha256 === sha256(Buffer.from(JSON.stringify(payload), "utf8")), `safe receipt ${task.rubricId}: digest mismatch`)
    const prompt = promptByRubric[task.rubricId]
    const loaded = reviewByRubric[task.rubricId]
    assert(prompt !== undefined && loaded !== undefined, `task receipt ${task.rubricId}: missing prompt/result`)
    assert(task.promptTemplatePath === prompt.descriptor.path && task.promptTemplateSha256 === prompt.descriptor.sha256, `task receipt ${task.rubricId}: prompt-template join drift`)
    const expectedRenderedTaskMessage = renderReviewPrompt(prompt.text, record, sha256(browserBytes), task.rubricId, prompt.descriptor.path)
    assert(task.promptSha256 === sha256(Buffer.from(expectedRenderedTaskMessage, "utf8")), `task receipt ${task.rubricId}: rendered prompt hash drift`)
    assert(task.rubricSha256 === rubricSha256(task.rubricId), `task receipt ${task.rubricId}: rubric hash drift`)
    assert(receipt.reportPath === loaded.descriptor.path && receipt.reportSha256 === loaded.descriptor.sha256, `safe receipt ${task.rubricId}: normalized report descriptor drift`)
    let nativeReview
    try { nativeReview = parseJsonStrict(rawCompletionBytes.toString("utf8"), `safe receipt ${task.rubricId}.rawCompletion`) } catch { fail(`safe receipt ${task.rubricId}: native completion is not strict JSON`) }
    equal(nativeReview, loaded.review, `safe receipt ${task.rubricId}: native completion/normalized report semantic join`)
    assert(isCanonicalMillisecondDateTime(receipt.completionEventTimestamp), `safe receipt ${task.rubricId}: canonical native completion timestamp invalid`)
    const createdAt = uuidV7Time(receipt.sessionUuid)
    assert(subjectCommittedAt <= createdAt, `safe receipt ${task.rubricId}: session predates immutable subject commit`)
    assert(createdAt < Date.parse(receipt.completionEventTimestamp), `safe receipt ${task.rubricId}: derived observed interval invalid`)
    assert(createdAt >= Date.parse(browserReceipt.completedAt), `safe receipt ${task.rubricId}: session predates browser evidence completion`)
    if (!isTrustLane) assert(createdAt >= trustCreatedAt, `safe receipt ${task.rubricId}: child session predates trust parent session`)
    for (const literal of [
      `taskPath=${receipt.taskPath}`,
      `rubricId=${task.rubricId}`,
      `repositoryCommit=${record.reviews.reviewSubjectSha}`,
      `reviewSubjectTreeSha=${record.reviews.reviewSubjectTreeSha}`,
      `comparisonSourceSha=${record.prototype.comparisonSourceSha}`,
      `prototypeBundleSha256=${record.prototype.bundleSha256}`,
      `browserReceiptSha256=${sha256(browserBytes)}`,
      `rubricSha256=${task.rubricSha256}`,
      "reviewMode=codex-only",
      "humanEvidence=none",
      "humanParticipantCount=0",
      "humanReviewRequired=false",
      "notHumanUsabilityTested=true",
      "Evidence coordinates must use repository/path:L<positive-line>.",
      "Do not read or request another review lane's output before submitting your own result."
    ]) assert(expectedRenderedTaskMessage.includes(literal), `${prompt.descriptor.path}: exact rendered task-message literal absent: ${literal}`)
  }
  const latestStart = Math.max(...taskReceipt.tasks.map(({ safeReceipt }) => uuidV7Time(safeReceipt.sessionUuid)))
  const earliestCompletion = Math.min(...taskReceipt.tasks.map(({ safeReceipt }) => Date.parse(safeReceipt.completionEventTimestamp)))
  assert(latestStart < earliestCompletion, "three observed Codex task intervals must have a nonempty common overlap")
  const trustCompletion = Date.parse(trustTask.safeReceipt.completionEventTimestamp)
  for (const task of taskReceipt.tasks.filter(({ rubricId }) => rubricId !== "consumer-trust-anti-ai-slop")) {
    assert(trustCompletion <= Date.parse(task.safeReceipt.completionEventTimestamp), `safe receipt ${task.rubricId}: child completion must not predate trust-lane completion barrier`)
  }
  return taskReceipt
}
const validateReviews = (record, browserBytes, browserReceipt, loadedReviews, taskReceipt, prompts) => {
  const reviewSubjectSha = validateReviewSubject(record, browserReceipt)
  validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, taskReceipt, prompts)
  unique(record.reviews.files.map(({ taskPath }) => taskPath), "review descriptor task paths")
  unique(record.reviews.files.map(({ rubricId }) => rubricId), "review descriptor rubric IDs")
  equal(record.reviews.files.map(({ rubricId }) => rubricId).sort(), [...RUBRIC_IDS].sort(), "review descriptor rubric closure")
  const browserHash = sha256(browserBytes)
  for (const { descriptor, review } of loadedReviews) {
    exactKeys(review, REVIEW_OUTPUT_KEYS, `review ${descriptor.path}`)
    equal(Object.keys(review), REVIEW_OUTPUT_KEYS, `${descriptor.path}: physical top-level key order`)
    assert(review.schemaVersion === 3 && review.reportId === `plan-006-${review.rubricId}-review`, `${descriptor.path}: review identity drift`)
    validateHumanBoundary(review, descriptor.path)
    assert(review.evidenceClass === "nonhuman-codex-review-not-user-research", `${descriptor.path}: evidence class drift`)
    assert(review.taskPath === descriptor.taskPath && review.rubricId === descriptor.rubricId && REVIEW_TASK_PATHS[review.rubricId] === review.taskPath, `${descriptor.path}: fixed task-path/rubric join drift`)
    assert(!hasOwn(review, "agentTaskId") && !hasOwn(review, "nativeTaskId") && !hasOwn(review, "independentReview") && !hasOwn(review, "crossReviewOutputsReadBeforeSubmission") && !hasOwn(review, "recommendationTerritoryId"), `${descriptor.path}: invented identity, self-attested independence, or recommendation field forbidden`)
    assert(review.repositoryCommit === reviewSubjectSha && review.reviewSubjectTreeSha === record.reviews.reviewSubjectTreeSha, `${descriptor.path}: review subject join drift`)
    assert(review.acceptedStep2SubjectSha === STEP2_SUBJECT_SHA && review.acceptedStep2MergeSha === STEP2_MERGE_SHA, `${descriptor.path}: Step 2 SHA drift`)
    assert(review.comparisonSourceSha === record.prototype.comparisonSourceSha && review.prototypeBundleSha256 === record.prototype.bundleSha256, `${descriptor.path}: comparison-source/prototype hash drift`)
    equal(review.prototypeFiles, record.prototype.files, `${descriptor.path}: prototype file descriptors`)
    assert(review.browserReceiptSha256 === browserHash, `${descriptor.path}: browser receipt hash join drift`)
    const task = taskReceipt.tasks.find(({ rubricId }) => rubricId === review.rubricId)
    assert(task !== undefined && review.promptTemplateSha256 === task.promptTemplateSha256 && review.promptSha256 === task.promptSha256 && review.rubricSha256 === task.rubricSha256, `${descriptor.path}: prompt-template/prompt/rubric receipt join drift`)
    equal(review.rubricCriteria, RUBRIC_CRITERIA[review.rubricId], `${descriptor.path}: rubric criteria`)
    assert(Array.isArray(review.territoryScores) && review.territoryScores.length === 3, `${descriptor.path}: three territory score records required`)
    equal(review.territoryScores.map(({ territoryId }) => territoryId), TERRITORY_IDS, `${descriptor.path}: territory score order`)
    for (const territory of review.territoryScores) {
      exactKeys(territory, ["territoryId", "criterionScores", "total", "blockingFindings"], `${descriptor.path}/${territory.territoryId}`)
      assert(Array.isArray(territory.criterionScores) && territory.criterionScores.length === 5, `${descriptor.path}/${territory.territoryId}: five scores required`)
      equal(territory.criterionScores.map(({ criterionId }) => criterionId), RUBRIC_CRITERIA[review.rubricId], `${descriptor.path}/${territory.territoryId}: criterion closure`)
      for (const criterion of territory.criterionScores) {
        exactKeys(criterion, ["criterionId", "score", "finding", "evidenceCoordinates"], `${descriptor.path}/${territory.territoryId}/${criterion.criterionId}`)
        assert(Number.isInteger(criterion.score) && criterion.score >= 1 && criterion.score <= 5, `${descriptor.path}/${territory.territoryId}/${criterion.criterionId}: score must be integer 1..5`)
        assert(typeof criterion.finding === "string" && criterion.finding.trim().length >= 8, `${descriptor.path}/${territory.territoryId}/${criterion.criterionId}: finding not populated`)
        validateEvidenceCoordinates(criterion.evidenceCoordinates, `${descriptor.path}/${territory.territoryId}/${criterion.criterionId}.evidenceCoordinates`, reviewSubjectSha)
      }
      assert(territory.total === territory.criterionScores.reduce((sum, { score }) => sum + score, 0), `${descriptor.path}/${territory.territoryId}: total drift`)
      assert(Array.isArray(territory.blockingFindings), `${descriptor.path}/${territory.territoryId}: blockingFindings array required`)
      for (const [index, finding] of territory.blockingFindings.entries()) {
        exactKeys(finding, ["finding", "evidenceCoordinates"], `${descriptor.path}/${territory.territoryId}.blockingFindings/${index}`)
        assert(typeof finding.finding === "string" && finding.finding.trim().length >= 8, `${descriptor.path}: blocking finding not populated`)
        validateEvidenceCoordinates(finding.evidenceCoordinates, `${descriptor.path}: blocking finding coordinates`, reviewSubjectSha)
      }
    }
    assert(["supports-deterministic-selection", "cannot-support-selection"].includes(review.consensusPosition), `${descriptor.path}: consensus position invalid`)
    assert(Array.isArray(review.dissent), `${descriptor.path}: dissent array required`)
    for (const [index, dissent] of review.dissent.entries()) {
      exactKeys(dissent, ["territoryId", "reason", "evidenceCoordinates"], `${descriptor.path}.dissent/${index}`)
      assert(TERRITORY_IDS.includes(dissent.territoryId) && typeof dissent.reason === "string" && dissent.reason.trim().length >= 8, `${descriptor.path}: dissent invalid`)
      validateEvidenceCoordinates(dissent.evidenceCoordinates, `${descriptor.path}: dissent coordinates`, reviewSubjectSha)
    }
    equal(review.limitations, ["not-human-usability-tested", "cross-output-non-observability-not-cryptographically-provable"], `${descriptor.path}: truthful limitations`)
    const totals = review.territoryScores.map(({ territoryId, total }) => ({ territoryId, total }))
    const maximum = Math.max(...totals.map(({ total }) => total))
    const laneHighest = totals.filter(({ total }) => total === maximum).map(({ territoryId }) => territoryId)
    const laneBlockerCount = review.territoryScores.reduce((sum, territory) => sum + territory.blockingFindings.length, 0)
    if (review.consensusPosition === "supports-deterministic-selection") assert(laneHighest.length === 1 && laneBlockerCount === 0 && review.dissent.length === 0, `${descriptor.path}: lane support requires unique high score, no blocker, and no dissent`)
    if (laneHighest.length !== 1 || laneBlockerCount !== 0 || review.dissent.length !== 0) assert(review.consensusPosition === "cannot-support-selection", `${descriptor.path}: lane tie/blocker/dissent must prevent support`)
  }
  unique(loadedReviews.map(({ review }) => review.taskPath), "review task paths")
  unique(loadedReviews.map(({ review }) => review.rubricId), "review rubric IDs")
  equal(loadedReviews.map(({ review }) => review.rubricId).sort(), [...RUBRIC_IDS].sort(), "review rubric closure")
}

const recomputeDecision = (loadedReviews) => {
  const totals = Object.fromEntries(TERRITORY_IDS.map((territoryId) => [territoryId, loadedReviews.reduce((sum, { review }) => sum + review.territoryScores.find((entry) => entry.territoryId === territoryId).total, 0)]))
  const blocked = Object.fromEntries(TERRITORY_IDS.map((territoryId) => [territoryId, loadedReviews.flatMap(({ review }) => review.territoryScores.find((entry) => entry.territoryId === territoryId).blockingFindings).length]))
  const blockerCount = Object.values(blocked).reduce((sum, value) => sum + value, 0)
  const dissent = loadedReviews.flatMap(({ review }) => review.dissent.map((entry) => ({ taskPath: review.taskPath, ...entry })))
  const maximum = Math.max(...TERRITORY_IDS.map((territoryId) => totals[territoryId]))
  const highestTerritoryIds = TERRITORY_IDS.filter((territoryId) => totals[territoryId] === maximum)
  const unsupportedLaneTaskPaths = loadedReviews.filter(({ review }) => review.consensusPosition !== "supports-deterministic-selection").map(({ review }) => review.taskPath)
  const selected = blockerCount === 0 && unsupportedLaneTaskPaths.length === 0 && dissent.length === 0 && highestTerritoryIds.length === 1 ? highestTerritoryIds[0] : null
  return { totals, blocked, blockerCount, dissent, highestTerritoryIds, unsupportedLaneTaskPaths, selected }
}
const validateDecision = (record, loadedReviews) => {
  const computed = recomputeDecision(loadedReviews)
  assert(record.decision.ruleId === "sum-15-unweighted-criterion-scores-global-gates-unique-highest-v2" && record.decision.criteriaPerTerritoryPerReview === 5, "decision rule drift")
  equal(record.decision.totals, computed.totals, "decision totals")
  equal(record.decision.highestTerritoryIds, computed.highestTerritoryIds, "decision highest territories")
  assert(record.decision.blockerCount === computed.blockerCount, "decision blocker count drift")
  equal(record.decision.unsupportedLaneTaskPaths, computed.unsupportedLaneTaskPaths, "decision unsupported-lane join")
  equal(record.decision.dissent, computed.dissent, "decision dissent join")
  assert(record.decision.selectedTerritoryId === computed.selected, "decision selection drift from deterministic rule")
  if (computed.selected !== null) {
    assert(record.decisionStatus === "selected", "unique supported winner requires selected decision status")
    assert(record.decision.consensusStatus === "selected-unique-supported-no-blocker-no-dissent", "selected decision consensus status drift")
    assert(record.decision.blockerCount === 0 && record.decision.unsupportedLaneTaskPaths.length === 0 && record.decision.dissent.length === 0, "selection cannot coexist with blockers, unsupported lanes, or dissent")
    assert(record.canonical !== null && record.canonical.selectedTerritoryId === computed.selected, "selection requires matching canonical promotion")
  } else {
    assert(record.decisionStatus === "unresolved" && record.decision.consensusStatus === "unresolved-global-gate-or-nonunique", "unsupported/nonunique result must remain unresolved")
    assert(record.decision.selectedTerritoryId === null && record.canonical === null, "unresolved decision cannot promote a canonical territory")
  }
  return computed
}

const terminalMetadataFields = (record) => [
  ["artifactStatus", "complete"],
  ["decisionStatus", record.decisionStatus],
  ["protocolId", "CODEX-ONLY-UIUX-V1"],
  ["reviewMode", "codex-only"],
  ["humanEvidence", "none"],
  ["humanParticipantCount", "0"],
  ["humanReviewRequired", "false"],
  ["notHumanUsabilityTested", "true"]
]
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")
const terminalMetadataMarker = (markerId, record) => `<!-- ${markerId}: ${terminalMetadataFields(record).map(([key, value]) => `${key}=${value}`).join("; ")} -->`
const terminalCoverageLiterals = () => [
  `coverageClassification=${REPRESENTATIVE_COVERAGE_CONTRACT.classification}`,
  `registryRouteIdCount=${REPRESENTATIVE_COVERAGE_CONTRACT.registryRouteIdCount}`,
  `representedRouteIdCount=${REPRESENTATIVE_COVERAGE_CONTRACT.representedRouteIdCount}`,
  `representativeFrameCount=${REPRESENTATIVE_COVERAGE_CONTRACT.representativeFrameCount}`,
  `deferredHazardVariants=${REPRESENTATIVE_COVERAGE_CONTRACT.deferredHazardVariants.join(",")}`,
  `deferredRecoveryVariants=${REPRESENTATIVE_COVERAGE_CONTRACT.deferredRecoveryVariants.join(",")}`,
  `printEvidenceClassification=${REPRESENTATIVE_COVERAGE_CONTRACT.printScope.classification}`,
  `printEvidenceCaseCount=${REPRESENTATIVE_COVERAGE_CONTRACT.printScope.caseCount}`,
  `printEvidenceFrameIds=${REPRESENTATIVE_COVERAGE_CONTRACT.printScope.frameIds.join(",")}`,
  `printEvidenceTerritoryIds=${REPRESENTATIVE_COVERAGE_CONTRACT.printScope.territoryIds.join(",")}`,
  `printEvidenceBrowserProjects=${REPRESENTATIVE_COVERAGE_CONTRACT.printScope.browserProjects.join(",")}`
]
const validateTerminalMetadataMarker = (text, path, markerId, record) => {
  const markers = text.match(new RegExp(`<!-- ${escapeRegex(markerId)}:[^\\r\\n]*-->`, "gu")) ?? []
  assert(markers.length === 1, `${path}: exactly one ${markerId} marker required`)
  assert(markers[0] === terminalMetadataMarker(markerId, record), `${path}: ${markerId} marker drift or contradictory status vocabulary`)
}
const mutateTerminalMetadataMarker = (text, markerId, record, field, replacement) => {
  const marker = terminalMetadataMarker(markerId, record)
  assert(text.includes(marker), `${markerId}: exact mutation anchor absent`)
  const expected = terminalMetadataFields(record).find(([key]) => key === field)?.[1]
  assert(expected !== undefined, `${markerId}: unknown terminal metadata field ${field}`)
  return text.replace(marker, marker.replace(`${field}=${expected}`, `${field}=${replacement}`))
}
const validateHistoricalPreworkIsolation = (plan) => {
  for (const literal of [
    "historicalPreworkDisposition=frozen-snapshot-only",
    `historicalPreworkCommit=${HISTORICAL_PREWORK_SHA}`
  ]) assert(plan.split(literal).length === 2, `plans/006-select-consumer-visual-system.md: exact single historical-prework marker absent: ${literal}`)
  assert(!plan.includes("node plans/validate-006-consumer-visual-system-prework.mjs"), "active Plan 006 cannot invoke the frozen historical prework validator as an alternate execution path")
}
const validateReportText = (record, report) => {
  validateTerminalMetadataMarker(report, reportPath, "plan-006-report-terminal-metadata", record)
  for (const literal of [
    `reviewSubjectSha=${record.reviews.reviewSubjectSha}`,
    `prototypeBundleSha256=${record.prototype.bundleSha256}`,
    `receiptAuthenticationLimitation=${RECEIPT_AUTHENTICATION_LIMITATION}`,
    `keyboardEvidenceClassification=${KEYBOARD_EVIDENCE_CONTRACT.classification}`,
    `firefoxAutomationLimitation=${KEYBOARD_EVIDENCE_CONTRACT.firefoxAutomationLimitation}`,
    ...terminalCoverageLiterals(),
    ...Object.values(REVIEW_TASK_PATHS)
  ]) assert(report.includes(literal), `${reportPath}: terminal evidence literal absent: ${literal}`)
  assertNoContradictoryClaimsOrPrivateData(report, reportPath)
}
const validatePlanText = (record, plan) => {
  validateTerminalMetadataMarker(plan, "plans/006-select-consumer-visual-system.md", "plan-006-terminal-metadata", record)
  validateHistoricalPreworkIsolation(plan)
  for (const literal of [
    `reviewSubjectSha=${record.reviews.reviewSubjectSha}`,
    `prototypeBundleSha256=${record.prototype.bundleSha256}`,
    `receiptAuthenticationLimitation=${RECEIPT_AUTHENTICATION_LIMITATION}`,
    `keyboardEvidenceClassification=${KEYBOARD_EVIDENCE_CONTRACT.classification}`,
    `firefoxAutomationLimitation=${KEYBOARD_EVIDENCE_CONTRACT.firefoxAutomationLimitation}`,
    ...terminalCoverageLiterals()
  ]) assert(plan.includes(literal), `plans/006-select-consumer-visual-system.md: terminal contract literal absent: ${literal}`)
  assertNoContradictoryClaimsOrPrivateData(plan, "plans/006-select-consumer-visual-system.md")
}
const validateIndexes = (record, plansOverride = null, researchOverride = null) => {
  verifyDescriptor(record.plansIndex, "plans/README.md")
  verifyDescriptor(record.researchIndex, "research/README.md")
  const plans = plansOverride ?? readText(record.plansIndex.path)
  const research = researchOverride ?? readText(record.researchIndex.path)
  validateTerminalMetadataMarker(plans, record.plansIndex.path, "plan-006-index-terminal-metadata", record)
  validateTerminalMetadataMarker(research, record.researchIndex.path, "plan-006-research-index-terminal-metadata", record)
  const planRows = plans.split("\n").filter((line) => line.startsWith("| 006 | Select a consumer visual system and route archetypes |"))
  assert(planRows.length === 1, "plans/README.md: exactly one Plan 006 execution-status row required")
  const researchRows = research.split("\n").filter((line) => line.startsWith("| [") && line.includes("ui-ux/consumer-visual-system/README.md"))
  assert(researchRows.length === 1, "research/README.md: exactly one Plan 006 terminal evidence row required")
  const planRow = planRows[0]
  const researchRow = researchRows[0]
  if (record.decisionStatus === "selected") {
    assert(planRow.includes("DONE") && planRow.includes(`Territory ${record.decision.selectedTerritoryId}`), "plans/README.md: selected Plan 006 terminal row drift")
    assert(researchRow.includes("Accepted supporting evidence") && researchRow.includes(`Territory ${record.decision.selectedTerritoryId}`) && researchRow.includes("product/DESIGN_SYSTEM.md"), "research/README.md: selected terminal evidence row drift")
  } else {
    assert(planRow.includes("DONE") && planRow.includes("decision unresolved") && planRow.includes("no territory selected") && !planRow.includes("COMPLETE"), "plans/README.md: unresolved Plan 006 terminal row drift")
    assert(researchRow.includes("Completed supporting evidence") && researchRow.includes("decision unresolved") && researchRow.includes("no territory selected") && !researchRow.includes("product/DESIGN_SYSTEM.md"), "research/README.md: unresolved terminal evidence row drift")
  }
  for (const row of [planRow, researchRow]) {
    assert(row.includes("CODEX-ONLY") && row.includes("NOT HUMAN-USABILITY-TESTED") && row.includes("human evidence none") && row.includes("human participant count 0"), "terminal index row CODEX-only metadata drift")
  }
}
const canonicalDesignSystemText = (promotionContract) => {
  const acceptedBase = decodeText(bytesAt(STEP2_MERGE_SHA, "product/DESIGN_SYSTEM.md"), `${STEP2_MERGE_SHA}:product/DESIGN_SYSTEM.md`)
  assert(acceptedBase.endsWith("\n"), "accepted Step 2 Design System must end in LF")
  const block = `<!-- consumer-visual-system:start -->\n\n\`\`\`json\n${JSON.stringify(promotionContract, null, 2)}\n\`\`\`\n\n<!-- consumer-visual-system:end -->\n`
  return `${acceptedBase}\n${block}`
}
const validateCanonical = (record, prototypeContext, designSystemOverride = null) => {
  verifyDescriptor(record.plan, "plans/006-select-consumer-visual-system.md")
  validatePlanText(record, readText(record.plan.path))
  verifyDescriptor(record.report, reportPath)
  const report = readText(reportPath)
  validateReportText(record, report)
  validateIndexes(record)
  if (record.canonical === null) {
    return
  }
  const selected = record.decision.selectedTerritoryId
  assert(record.canonical.selectedTerritoryId === selected, "canonical selected territory drift")
  const descriptors = [[record.canonical.designSystem, "product/DESIGN_SYSTEM.md"]]
  for (const [descriptor, path] of descriptors) verifyDescriptor(descriptor, path)
  const designSystem = designSystemOverride ?? readText("product/DESIGN_SYSTEM.md")
  assert(designSystem === canonicalDesignSystemText(record.canonical.promotionContract), "DESIGN_SYSTEM must equal accepted Step 2 bytes plus exactly one deterministic visual-only contract append")
  assert((designSystem.match(/<!-- consumer-visual-system:start -->/gu) ?? []).length === 1 && (designSystem.match(/<!-- consumer-visual-system:end -->/gu) ?? []).length === 1, "DESIGN_SYSTEM consumer visual-system markers must be unique")
  const marker = /<!-- consumer-visual-system:start -->\n\n```json\n([\s\S]+?)\n```\n\n<!-- consumer-visual-system:end -->/u.exec(designSystem)
  assert(marker !== null, "DESIGN_SYSTEM consumer visual-system marker must contain exactly one strict JSON contract block")
  const embeddedContract = parseJsonStrict(`${marker[1]}\n`, "product/DESIGN_SYSTEM.md consumer visual-system contract")
  equal(embeddedContract, record.canonical.promotionContract, "DESIGN_SYSTEM/manifest promotion contract")
  const contract = record.canonical.promotionContract
  validateHumanBoundary(contract, "canonical promotion contract")
  assert(contract.contractVersion === 1 && contract.scope === "visual-tokens-and-composition-only", "canonical promotion contract scope drift")
  assert(contract.acceptedStep2SubjectSha === STEP2_SUBJECT_SHA && contract.acceptedStep2MergeSha === STEP2_MERGE_SHA, "canonical promotion Step 2 join drift")
  assert(contract.reviewSubjectSha === record.reviews.reviewSubjectSha && contract.prototypeBundleSha256 === record.prototype.bundleSha256, "canonical promotion reviewed-byte join drift")
  assert(contract.decisionRuleId === record.decision.ruleId && contract.decisionStatus === "selected" && contract.consensusStatus === record.decision.consensusStatus, "canonical promotion decision provenance drift")
  equal(contract.aggregateScores, record.decision.totals, "canonical promotion aggregate scores")
  equal(contract.unresolvedExclusions, UNRESOLVED_DECISIONS, "canonical promotion unresolved exclusions")
  equal(contract.prohibitedPromotionKeys, PROHIBITED_PROMOTION_KEYS, "canonical promotion prohibited keys")
  equal(contract.fixtureSemantics, {
    status: "noncanonical-comparison-fixture",
    navigation: "excluded-unresolved-step2-fixture",
    homePrimaryAction: "excluded-unresolved-step2-fixture",
    practiceTiming: "excluded-unresolved-step2-fixture",
    sourceProminence: "excluded-unresolved-step2-fixture",
    d1D2: "excluded-unresolved-step2-fixture"
  }, "canonical promotion fixture semantics")
  const selectedTerritory = prototypeContext.module.territories.find(({ territoryId }) => territoryId === selected)
  assert(selectedTerritory !== undefined && contract.selectedTerritoryId === selected && contract.selectedTerritoryName === selectedTerritory.name, "canonical selected territory identity drift")
  equal(contract.tokens, Object.entries(selectedTerritory.tokens).map(([role, value]) => ({ role, value })), "canonical selected token closure")
  unique(contract.tokens.map(({ role }) => role), "canonical selected token roles")
  equal(contract.compositionAxes, VISUAL_PROMOTION_AXES.map((axisId) => ({ axisId, value: selectedTerritory.differentiationAxes[axisId] })), "canonical selected visual-composition axes")
  unique(contract.compositionAxes.map(({ axisId }) => axisId), "canonical visual-composition axes")
  const plans = readText("plans/README.md")
  const planRow = plans.split("\n").find((line) => line.startsWith("| 006 | Select a consumer visual system and route archetypes |"))
  assert(planRow !== undefined && planRow.includes("DONE") && planRow.includes("CODEX-ONLY") && planRow.includes("NOT HUMAN-USABILITY-TESTED") && planRow.includes(`Territory ${selected}`) && planRow.includes("human evidence none") && planRow.includes("human participant count 0"), "plans/README Plan 006 terminal row drift")
  const researchIndex = readText("research/README.md")
  const matchingRows = researchIndex.split("\n").filter((line) => line.startsWith("| [") && line.includes("ui-ux/consumer-visual-system/README.md") && line.includes("Accepted supporting evidence") && line.includes("product/DESIGN_SYSTEM.md"))
  assert(matchingRows.length === 1 && matchingRows[0].includes(`Territory ${selected}`), "research index selected-evidence row drift")
  assert(report.includes(`Territory ${selected}`), "research report selected territory drift")
}

const assertNoPrivateLocatorLiterals = (text, path) => {
  const locatorPatterns = [
    /(?:^|[\s"'`(])\/(?:home|Users|mnt|private\/var)\/[^\s"'`)]+/mu,
    /(?:^|[\s"'`(])[A-Za-z]:\\[^\s"'`)]+/mu,
    /(?:^|[\s"'`(])\\\\[^\\\s]+\\[^\s"'`)]+/mu,
    /file:\/\/[^\s"'`)]+/iu
  ]
  for (const pattern of locatorPatterns) assert(!pattern.test(text), `${path}: private host/device locator literal forbidden`)
  for (const match of text.matchAll(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/gu)) {
    const octets = match[0].split(".").map(Number)
    if (octets.every((value) => value <= 255)) assert(match[0].startsWith("127."), `${path}: non-loopback IPv4 value forbidden`)
  }
}
const assertNoPrivateData = (text, path) => {
  assertNoPrivateLocatorLiterals(text, path)
  const privatePatterns = [
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu,
    /\b(?:phone|mobile|contactNumber)\s*[=:]\s*\+?[0-9() .-]{7,}/iu,
    /\b(?:candidate|applicant)(?:[-_ ]?id)?\s*[=:]\s*[A-Za-z0-9_-]{3,}\b/iu,
    /\b(?:contact|privateContact|locator|privateLocator|host(?:name)?|device(?:Id|Identifier|Name)?|machineId|serialNumber)\s*[=:]\s*(?!none\b|null\b|loopback\b)[^\s,;]+/iu,
    /\b(?:serverUrl|baseUrl|networkOrigin)\s*[=:]\s*https?:\/\/(?!localhost(?::|\/)|127\.0\.0\.1(?::|\/)|\[::1\](?::|\/))[^\s"']+/iu
  ]
  for (const pattern of privatePatterns) assert(!pattern.test(text), `${path}: private contact/locator/identifier/host/device/network value forbidden`)
}
const assertNoContradictoryClaimsOrPrivateData = (text, path) => {
  const forbiddenClaims = [
    /\b(?:human)?participantCount["'`]?\s*[=:]\s*[1-9][0-9]*/iu,
    /\bhumanEvidence["'`]?\s*[=:]\s*(?:present|collected|available|yes)/iu,
    /\bhumanReviewRequired["'`]?\s*[=:]\s*true/iu,
    /\bnotHumanUsabilityTested["'`]?\s*[=:]\s*false/iu,
    /\bparticipantEvidence["'`]?\s*[=:]\s*(?:present|collected|available|yes)/iu,
    /(?:human|participant|user)\s+usability\s+(?:test(?:ing)?\s+)?(?:passed|complete(?:d)?|validated|approved)/iu,
    /(?<!no )(?<!not )\busability\s+(?:study|test(?:ing)?)\s+(?:was\s+)?(?:passed|complete(?:d)?|validated|approved)/iu,
    /(?<!no )(?<!not )\bhuman\s+(?:study|research)\s+(?:was\s+)?(?:completed|conducted|validated|approved|passed|finished)/iu,
    /(?<!no )(?<!not )\bhuman\s+review\s+(?:was\s+)?(?:completed|conducted|validated|approved|passed|finished)/iu,
    /(?:validated|tested|reviewed)\s+with\s+[1-9][0-9]*\s+(?:human\s+)?(?:participants?|users?|applicants?|candidates?)/iu,
    /(?:human|owner|participant)\s+(?:approval|sign[- ]?off)\s+(?:received|complete(?:d)?|passed|granted)/iu,
    /\buser\s+research\s+(?:was\s+)?(?:completed|conducted|validated|approved|passed|finished)/iu,
    /\bwe\s+(?:interviewed|observed|surveyed|tested)\s+[1-9][0-9]*\s+(?:participants?|users?|applicants?|candidates?)/iu,
    /(?<!no )(?<!not )\bhuman\s+reviewers?\s+(?:preferred|selected|chose|recommended|approved|validated|endorsed|accepted)\b/iu,
    /(?<!no )(?<!not )\b(?:participant|user|human)\s+(?:feedback|input)\s+(?:informed|drove|shaped|determined|validated|supported|selected|favou?red|preferred)\b/iu,
    /(?<!no )(?<!not )\bparticipants?\s+(?:selected|chose|preferred|recommended|approved|validated|endorsed|accepted)\s+(?:Territory\s+)?[ABC]\b/iu,
    /(?<!no )(?<!not )\b(?:the\s+)?owner\s+approved\s+(?:the\s+)?(?:release|territory|selection|result|design)/iu,
    /(?<!no )(?<!not )\bproduction\s+authorization\s+(?:received|granted|approved|complete(?:d)?)/iu,
    /(?:approved|authorized|cleared)\s+for\s+production/iu,
    /real[- ]device\s+(?:test(?:ing)?\s+)?(?:passed|complete(?:d)?|validated)/iu,
    /(?:tested|validated|reviewed)\s+on\s+[1-9][0-9]*\s+real[- ]devices?/iu,
    /(?<!not )(?<!non-)\bexhaustive\s+(?:route|legal[- ]state)\s+(?:coverage|validation|evidence)\s+(?:was\s+)?(?:complete(?:d)?|passed|validated|achieved)/iu,
    /(?<!not )(?<!non-)\bfull\s+print\s+(?:coverage|validation|evidence)\s+(?:was\s+)?(?:complete(?:d)?|passed|validated|achieved)/iu
  ]
  for (const pattern of forbiddenClaims) assert(!pattern.test(text), `${path}: contradictory Step 3 human/usability/approval/production/real-device claim forbidden`)
  assertNoPrivateData(text, path)
}
const terminalClaimTexts = () => {
  const paths = ["plans/006-select-consumer-visual-system.md", "plans/README.md", "research/README.md", reportPath, ...Object.values(REVIEW_OUTPUT_PATHS)]
  if (gitSucceeds(["cat-file", "-e", "HEAD:product/DESIGN_SYSTEM.md"])) paths.push("product/DESIGN_SYSTEM.md")
  if (gitSucceeds(["cat-file", "-e", `HEAD:${taskReceiptPath}`])) paths.push(taskReceiptPath)
  return [...new Set(paths)].filter((path) => gitSucceeds(["cat-file", "-e", `HEAD:${path}`])).map((path) => ({ path, text: readText(path) }))
}
const scanPortableText = () => {
  const paths = runGit(["ls-files", "--cached", "--others", "--exclude-standard", "--", researchRoot]).trim().split("\n").filter(Boolean).filter((path) => {
    try { return statSync(absolute(path)).isFile() } catch { return false }
  })
  for (const path of paths) {
    assert(!/\.(?:png|jpe?g|webp|gif|zip|pdf)$/iu.test(path), `${path}: binary/screenshot/archive evidence forbidden in Plan 006 research packet`)
    const text = readText(path)
    if (/\.(?:mjs|ts)$/u.test(path)) assertNoPrivateLocatorLiterals(text, path)
    else assertNoPrivateData(text, path)
  }
  for (const { path, text } of terminalClaimTexts()) assertNoContradictoryClaimsOrPrivateData(text, path)
}

const assertCleanStatus = (status) => assert(status.length === 0, `phase requires a clean exact HEAD; dirty/untracked paths:\n${status.trimEnd()}`)
const validateCleanExactCommit = () => {
  const status = runGit(["status", "--porcelain=v1", "--untracked-files=all"])
  assertCleanStatus(status)
}
const diffNameStatus = (from, to) => runGit(["diff", "--name-status", "--no-renames", `${from}..${to}`]).trim().split("\n").filter(Boolean).map((line) => {
  const [status, path, extra] = line.split("\t")
  assert(extra === undefined && /^[AMD]$/u.test(status) && typeof path === "string", `${from}..${to}: simple A/M/D path diff required`)
  return { status, path }
})
const assertExactBase = (base, phase) => {
  assert(shaPattern.test(base), "--base must be a full forty-character SHA")
  if (phase !== "scope") assert(base === STEP2_MERGE_SHA, `${phase}: base must equal accepted Step 2 merge ${STEP2_MERGE_SHA}`)
}
const validateBranchScope = (base, { requireClean = false } = {}) => {
  assert(shaPattern.test(base), "--base must be a full forty-character SHA")
  assert(gitSucceeds(["cat-file", "-e", `${base}^{commit}`]), "scope base commit unavailable")
  assert(gitSucceeds(["merge-base", "--is-ancestor", base, "HEAD"]), "scope base is not an ancestor of HEAD")
  const changes = diffNameStatus(base, "HEAD")
  unique(changes.map(({ path }) => path), "committed Step 3 scope")
  for (const { path } of changes) assert(STEP3_MUTABLE_SOURCE_PATHS.has(path), `committed Step 3 scope: unauthorized exact path ${path}`)
  if (requireClean) validateCleanExactCommit()
  return changes
}
const assertForbiddenPresence = (presentPaths, label) => assert(presentPaths.length === 0, `${label}: forbidden preterminal paths present: ${presentPaths.join(", ")}`)
const assertCommitOmits = (commit, paths, label) => {
  assertForbiddenPresence(paths.filter((path) => gitSucceeds(["cat-file", "-e", `${commit}:${path}`])), `${label} ${commit}`)
}
const assertReceiptOnlyDirectChildFacts = (parentTokens, sourceSha, changes, label) => {
  assert(parentTokens.length === 2, `${label}: review subject must have exactly one parent`)
  assert(parentTokens[1] === sourceSha, `${label}: review subject parent must equal browserReceipt.sourceSha`)
  equal(changes, [{ status: "A", path: `${researchRoot}/browser-receipt.json` }], `${label}: source-to-subject exact receipt-only diff`)
}
const assertImmutableBytes = (subjectBytes, finalBytes, path) => assert(subjectBytes.equals(finalBytes), `${path}: immutable review-subject input drifted at final HEAD`)
const assertDesignSystemEqualsAcceptedBase = (commit) => {
  const subject = bytesAt(commit, "product/DESIGN_SYSTEM.md")
  const accepted = bytesAt(STEP2_MERGE_SHA, "product/DESIGN_SYSTEM.md")
  assert(subject.equals(accepted), `${commit}: product/DESIGN_SYSTEM.md must be byte-identical to accepted Step 2`)
}
const assertSelectionNeutralTextSet = ({ plan, plans, research }, label) => {
  const planRow = plans.split("\n").find((line) => line.startsWith("| 006 | Select a consumer visual system and route archetypes |"))
  assert(planRow !== undefined, `${label}: Plan 006 index row absent`)
  assert(!/(?:\bDONE\b|\bCOMPLETE\b|decisionStatus=(?:selected|unresolved)|Territory\s+[ABC]\s+(?:selected|accepted)|selectedTerritoryId=[ABC])/u.test(planRow), `${label}: Plan 006 index contains a terminal/result claim`)
  assert(!/plan-006-terminal-metadata|selectedTerritoryId\s*[=:]\s*[ABC]|selectedTerritoryName\s*[=:]\s*[^|\r\n]+|(?:selected territory|terminal outcome)\s*[=:]\s*Territory\s+[ABC]|Territory\s+[ABC]\s+(?:was\s+)?(?:selected|accepted)/iu.test(plan), `${label}: selection-neutral Plan 006 contains an affirmative result`)
  assert(!research.includes("ui-ux/consumer-visual-system/README.md") && !/Plan 006[^\r\n|]*(?:DONE|COMPLETE|selected|accepted)/iu.test(research), `${label}: research index prematurely claims terminal Plan 006 evidence`)
}
const assertSelectionNeutralSubjectText = (commit) => {
  assertDesignSystemEqualsAcceptedBase(commit)
  assertSelectionNeutralTextSet({
    plan: decodeText(bytesAt(commit, "plans/006-select-consumer-visual-system.md"), `${commit}:plans/006-select-consumer-visual-system.md`),
    plans: decodeText(bytesAt(commit, "plans/README.md"), `${commit}:plans/README.md`),
    research: decodeText(bytesAt(commit, "research/README.md"), `${commit}:research/README.md`)
  }, commit)
}
const validatePreReceiptSourceCommit = (sourceSha, { requireHead = false } = {}) => {
  assert(shaPattern.test(sourceSha) && !REJECTED_REVIEW_SUBJECT_SHAS.has(sourceSha), "pre-receipt source SHA invalid or rejected")
  assert(gitSucceeds(["cat-file", "-e", `${sourceSha}^{commit}`]), "pre-receipt source commit unavailable")
  assert(gitSucceeds(["merge-base", "--is-ancestor", STEP2_MERGE_SHA, sourceSha]), "pre-receipt source does not descend from accepted Step 2 merge")
  if (requireHead) {
    assert(runGit(["rev-parse", "HEAD"]).trim() === sourceSha, "source phase requires HEAD equal the source SHA")
    validateCleanExactCommit()
  }
  assertCommitOmits(sourceSha, PRE_RECEIPT_FORBIDDEN_PATHS, "pre-receipt source")
  assertSelectionNeutralSubjectText(sourceSha)
  const closure = preReceiptSourceClosure(sourceSha)
  assert(closure.pathCount === 228, "pre-receipt source closure must contain exactly 228 immutable paths")
  assert(closure.files.some(({ path }) => path === schemaPath), "source closure must bind evidence schema")
  assert(closure.files.some(({ path }) => path === `${researchRoot}/verify-research.mjs`), "source closure must bind terminal validator")
  const captureSource = decodeText(bytesAt(sourceSha, `${researchRoot}/capture-browser-receipt.mjs`), `${sourceSha}:${researchRoot}/capture-browser-receipt.mjs`)
  validateCapturePreflightSource(captureSource)
  for (const rubricId of RUBRIC_IDS) {
    const path = REVIEW_PROMPT_PATHS[rubricId]
    validatePromptTemplate(decodeText(bytesAt(sourceSha, path), `${sourceSha}:${path}`), rubricId, `${sourceSha}:${path}`)
  }
  return closure
}
const validateSubjectTopology = (subjectSha, browserReceipt, { requireHead = false } = {}) => {
  assert(shaPattern.test(subjectSha) && !REJECTED_REVIEW_SUBJECT_SHAS.has(subjectSha), "review subject SHA invalid or rejected")
  assert(gitSucceeds(["cat-file", "-e", `${subjectSha}^{commit}`]), "review subject commit unavailable")
  if (requireHead) {
    assert(runGit(["rev-parse", "HEAD"]).trim() === subjectSha, "subject phase requires HEAD equal review subject")
    validateCleanExactCommit()
  }
  const parentTokens = runGit(["rev-list", "--parents", "-n", "1", subjectSha]).trim().split(" ")
  const sourceToSubjectChanges = diffNameStatus(browserReceipt.sourceSha, subjectSha)
  assertReceiptOnlyDirectChildFacts(parentTokens, browserReceipt.sourceSha, sourceToSubjectChanges, "review subject")
  validatePreReceiptSourceCommit(browserReceipt.sourceSha)
  validateSourceClosureObject(browserReceipt.sourceClosure, browserReceipt.sourceSha, "browser receipt source closure")
  assertCommitOmits(subjectSha, [manifestPath, reportPath, taskReceiptPath, ...Object.values(REVIEW_OUTPUT_PATHS)], "review subject")
  assertSelectionNeutralSubjectText(subjectSha)
  return browserReceipt.sourceSha
}
const assertTerminalOutputChanges = (terminalChanges, expected) => {
  equal(terminalChanges.map(({ path }) => path).sort(), [...expected].sort(), "subject-to-final exact terminal output/status path closure")
  for (const { status, path } of terminalChanges) {
    assert(TERMINAL_OUTPUT_PATHS.has(path), `subject-to-final unauthorized path ${path}`)
    const shouldAdd = [manifestPath, reportPath, taskReceiptPath, ...Object.values(REVIEW_OUTPUT_PATHS)].includes(path)
    assert(status === (shouldAdd ? "A" : "M"), `${path}: terminal diff status must be ${shouldAdd ? "A" : "M"}`)
  }
}
const validateFinalLifecycle = (record, browserReceipt) => {
  const subject = record.reviews.reviewSubjectSha
  validateSubjectTopology(subject, browserReceipt)
  assert(gitSucceeds(["merge-base", "--is-ancestor", subject, "HEAD"]), "review subject must be an ancestor of final HEAD")
  const closure = validateSourceClosureObject(record.source.preReceiptSource, browserReceipt.sourceSha, "manifest pre-receipt source")
  equal(record.source.preReceiptSource, browserReceipt.sourceClosure, "manifest/browser source closure")
  const mutable = TERMINAL_OUTPUT_PATHS
  for (const descriptor of closure.files) {
    if (mutable.has(descriptor.path)) continue
    const subjectBytes = bytesAt(subject, descriptor.path)
    const headBytes = bytesAt("HEAD", descriptor.path)
    assertImmutableBytes(subjectBytes, headBytes, descriptor.path)
  }
  assertImmutableBytes(bytesAt(subject, `${researchRoot}/browser-receipt.json`), bytesAt("HEAD", `${researchRoot}/browser-receipt.json`), `${researchRoot}/browser-receipt.json`)
  const terminalChanges = diffNameStatus(subject, "HEAD")
  const expected = record.canonical === null ? unresolvedTerminalRequiredPaths : TERMINAL_REQUIRED_PATHS
  assertTerminalOutputChanges(terminalChanges, expected)
  return closure
}

const parseArguments = (arguments_) => {
  let phase = "all"
  let base = STEP2_MERGE_SHA
  for (const argument of arguments_) {
    if (argument.startsWith("--phase=")) phase = argument.slice("--phase=".length)
    else if (argument.startsWith("--base=")) base = argument.slice("--base=".length)
    else fail("usage: node research/ui-ux/consumer-visual-system/verify-research.mjs [--phase=all|source|subject|render-prompts|territories|assets|reviews|decision|scope] [--base=FULL_SHA]")
  }
  assert(["all", "source", "subject", "render-prompts", "territories", "assets", "reviews", "decision", "scope"].includes(phase), `unknown phase ${phase}`)
  assertExactBase(base, phase)
  return { phase, base }
}

const loadCore = () => {
  const schemaBytes = readBytes(schemaPath)
  const schema = assertSchemaIntegrity(schemaBytes)
  const manifestText = readText(manifestPath)
  const record = parseJsonStrict(manifestText, manifestPath)
  assertSchemaInstance(schema, record)
  const describedSchemaBytes = verifyDescriptor(record.schemaFile, schemaPath)
  assert(describedSchemaBytes.byteLength === schemaBytes.byteLength && sha256(describedSchemaBytes) === sha256(schemaBytes), "manifest schema descriptor drift")
  validateSource(record)
  return { schemaBytes, schema, record }
}

const descriptorAtHead = (path) => {
  const bytes = readBytes(path)
  const descriptor = { path, bytes: bytes.byteLength, sha256: sha256(bytes) }
  verifyDescriptor(descriptor, path)
  return descriptor
}
const validateSelectionNeutralSubject = async (base) => {
  validateBranchScope(base, { requireClean: true })
  const subjectSha = runGit(["rev-parse", "HEAD"]).trim()
  assertSchemaIntegrity(readBytes(schemaPath))
  const browserDescriptor = descriptorAtHead(`${researchRoot}/browser-receipt.json`)
  const browserReceipt = parseJsonStrict(readText(browserDescriptor.path), browserDescriptor.path)
  validateSubjectTopology(subjectSha, browserReceipt, { requireHead: true })
  const promptSources = RUBRIC_IDS.map((rubricId) => {
    const path = REVIEW_PROMPT_PATHS[rubricId]
    const descriptor = descriptorAtHead(path)
    const text = readText(path)
    validatePromptTemplate(text, rubricId, path)
    return { taskPath: REVIEW_TASK_PATHS[rubricId], rubricId, descriptor, text }
  })

  validateStep2Source({
    acceptedStep2SubjectSha: STEP2_SUBJECT_SHA,
    acceptedStep2MergeSha: STEP2_MERGE_SHA,
    acceptedStep2TreeSha: STEP2_TREE_SHA,
    promotions: [
      { path: "product/CONTENT_DESIGN.md", directionId: "CL-CODEX-1", sha256: CONTENT_DESIGN_SHA256 },
      { path: "product/ROUTES.md", directionId: "NAV-CODEX-1", sha256: ROUTES_SHA256 }
    ],
    unresolvedDecisionQuarantine: {
      status: "quarantined-not-promoted",
      decisionIds: UNRESOLVED_DECISIONS,
      promotionBoundary: "visual-tokens-and-composition-only",
      fixtureSemantics: "noncanonical-comparison-fixture"
    }
  })

  const prototypeModuleUrl = `${pathToFileURL(absolute(`${researchRoot}/prototype.mjs`)).href}?subject=${subjectSha}`
  const prototypeModule = await import(prototypeModuleUrl)
  const frameIds = prototypeModule.sharedFrames.map(({ frameId }) => frameId)
  const subjectRecord = {
    prototype: {
      comparisonSourceSha: browserReceipt.sourceSha,
      territoryIds: TERRITORY_IDS,
      archetypes: EXPECTED_ARCHETYPES,
      routeIdCount: 36,
      representedRouteIdCount: 10,
      coverageContract: REPRESENTATIVE_COVERAGE_CONTRACT,
      frameIds,
      sharedFrameCount: frameIds.length,
      comparableFrameCount: frameIds.length * 3,
      files: browserReceipt.prototypeFiles,
      bundleAlgorithm: "sha256(sorted(path + NUL + bytes + NUL))",
      bundleSha256: browserReceipt.prototypeBundleSha256,
      candidateSelectionEmbedded: false,
      fixtureSemantics: {
        status: "noncanonical-comparison-fixture",
        acceptedInputs: "exact-accepted-step2-language-and-navigation-closures",
        unresolvedChoices: "quarantined-not-promoted"
      }
    },
    assets: {
      file: descriptorAtHead(`${researchRoot}/asset-audit.tsv`),
      verifier: descriptorAtHead(`${researchRoot}/verify-asset-proof.mjs`),
      rowCount: 97,
      kindCounts: { tool: 65, comparison: 14, scene: 18 }
    },
    benchmarks: {
      file: descriptorAtHead(`${researchRoot}/benchmark-sources.json`),
      sourceCount: 12,
      categoryCounts: Object.fromEntries(BENCHMARK_CATEGORIES.map((category) => [category, 3]))
    },
    browser: {
      file: browserDescriptor,
      status: "passed",
      sourceSha: browserReceipt.sourceSha,
      prototypeBundleSha256: browserReceipt.prototypeBundleSha256,
      caseCount: browserReceipt.cases.length,
      semanticParity: true
    }
  }
  const prototypeContext = await validatePrototype(subjectRecord)
  await validateAssets(subjectRecord, prototypeContext)
  validateBenchmarks(subjectRecord)
  await validateBrowser(subjectRecord, prototypeContext, browserReceipt)
  scanPortableText()
  const subjectTreeSha = runGit(["show", "-s", "--format=%T", subjectSha]).trim()
  const renderRecord = {
    reviews: { reviewSubjectSha: subjectSha, reviewSubjectTreeSha: subjectTreeSha },
    prototype: { comparisonSourceSha: subjectRecord.prototype.comparisonSourceSha, bundleSha256: subjectRecord.prototype.bundleSha256 }
  }
  const renderedPrompts = promptSources.map(({ taskPath, rubricId, descriptor, text }) => {
    const renderedTaskMessage = renderReviewPrompt(text, renderRecord, browserDescriptor.sha256, rubricId, descriptor.path)
    return {
      taskPath,
      rubricId,
      promptTemplateFile: descriptor,
      promptTemplateSha256: descriptor.sha256,
      renderedTaskMessage,
      promptSha256: sha256(Buffer.from(renderedTaskMessage, "utf8")),
      rubricSha256: rubricSha256(rubricId)
    }
  })
  return {
    subjectSha,
    subjectTreeSha,
    prototypeBundleSha256: subjectRecord.prototype.bundleSha256,
    browserReceiptSha256: browserDescriptor.sha256,
    browserCases: subjectRecord.browser.caseCount,
    sourceClosure: browserReceipt.sourceClosure,
    promptTemplates: promptSources.map(({ taskPath, rubricId, descriptor }) => ({ taskPath, rubricId, ...descriptor })),
    renderedPrompts
  }
}

const expectReject = async (label, action) => {
  let rejected = false
  try { await action() } catch { rejected = true }
  assert(rejected, `adversarial test did not reject: ${label}`)
}
const runAdversarial = async ({ schemaBytes, schema, record, prototypeContext, assetRows, benchmarks, browserBytes, browserReceipt, browserContext, loadedReviews, taskReceipt, prompts }) => {
  const tests = []
  const reject = async (label, action) => { tests.push(label); await expectReject(label, action) }
  const schemaText = decoder.decode(schemaBytes)
  const schemaWeakening = [
    ["schema review-mode weakening", '"reviewMode": { "const": "codex-only" }', '"reviewMode": { "type": "string" }'],
    ["schema human-evidence weakening", '"humanEvidence": { "const": "none" }', '"humanEvidence": { "type": "string" }'],
    ["schema participant weakening", '"humanParticipantCount": { "const": 0 }', '"humanParticipantCount": { "type": "integer" }'],
    ["schema approval weakening", '"humanReviewRequired": { "const": false }', '"humanReviewRequired": { "type": "boolean" }'],
    ["schema usability-evidence weakening", '"notHumanUsabilityTested": { "const": true }', '"notHumanUsabilityTested": { "type": "boolean" }'],
    ["schema selection weakening", '"consensusStatus": { "enum": ["selected-unique-supported-no-blocker-no-dissent", "unresolved-global-gate-or-nonunique"] }', '"consensusStatus": { "type": "string" }'],
    ["schema DONE weakening", '"artifactStatus": { "const": "complete" }', '"artifactStatus": { "enum": ["complete", "DONE"] }'],
    ["schema dependency weakening", '"acceptedStep2SubjectSha": { "const": "4130693dee6caaa804a116f490b2192861f53e6e" }', '"acceptedStep2SubjectSha": { "$ref": "#/$defs/sha1" }'],
    ["schema render weakening", '"comparableFrameCount": { "const": 36 }', '"comparableFrameCount": { "type": "integer", "minimum": 0 }'],
    ["schema review-task weakening", '"taskPath": { "enum": ["/root/audit_lifecycle_precommit/review_consumer_trust_r3", "/root/audit_lifecycle_precommit/review_consumer_trust_r3/review_accessibility_r3", "/root/audit_lifecycle_precommit/review_consumer_trust_r3/review_visual_coherence_r3"] }', '"taskPath": { "type": "string" }'],
    ["schema source-closure weakening", '"pathCount": { "const": 228 }', '"pathCount": { "type": "integer", "minimum": 0 }'],
    ["schema quarantine weakening", '"promotionBoundary": "visual-tokens-and-composition-only"', '"promotionBoundary": "anything"']
  ]
  for (const [label, from, to] of schemaWeakening) {
    assert(schemaText.includes(from), `${label}: mutation anchor absent`)
    await reject(label, () => assertSchemaIntegrity(Buffer.from(schemaText.replace(from, to))))
  }
  const mutateRecord = async (label, mutation, action) => {
    const mutated = clone(record)
    mutation(mutated)
    await reject(label, () => action(mutated))
  }
  const boundaryMutations = [
    ["protocolId", "OTHER-PROTOCOL"],
    ["reviewMode", "human-reviewed"],
    ["humanEvidence", "claimed"],
    ["humanParticipantCount", 1],
    ["humanReviewRequired", true],
    ["notHumanUsabilityTested", false]
  ]
  for (const [field, replacement] of boundaryMutations) {
    await mutateRecord(`manifest ${field} schema gate`, (value) => { value[field] = replacement }, (value) => assertSchemaInstance(schema, value))
    await mutateRecord(`manifest ${field} custom gate`, (value) => { value[field] = replacement }, (value) => validateSource(value))
  }
  await mutateRecord("instance fabricated approval field", (value) => { value.approvalEvidence = "approved" }, (value) => assertSchemaInstance(schema, value))
  await mutateRecord("instance DONE state schema gate", (value) => { value.artifactStatus = "DONE" }, (value) => assertSchemaInstance(schema, value))
  await mutateRecord("instance DONE state custom gate", (value) => { value.artifactStatus = "DONE" }, (value) => validateSource(value))
  await mutateRecord("instance dependency drift schema gate", (value) => { value.source.acceptedStep2MergeSha = STEP2_SUBJECT_SHA }, (value) => assertSchemaInstance(schema, value))
  await mutateRecord("instance dependency drift custom gate", (value) => { value.source.acceptedStep2MergeSha = STEP2_SUBJECT_SHA }, (value) => validateStep2Source(value.source))
  await mutateRecord("pre-receipt source closure file drift", (value) => { value.source.preReceiptSource.files[0].sha256 = "0".repeat(64) }, (value) => validateSource(value))
  await mutateRecord("pre-receipt source closure omission", (value) => { value.source.preReceiptSource.files.pop(); value.source.preReceiptSource.pathCount -= 1 }, (value) => validateSource(value))
  await mutateRecord("instance render count weakening", (value) => { value.prototype.comparableFrameCount = 0 }, (value) => assertSchemaInstance(schema, value))
  await mutateRecord("instance render count custom gate", (value) => { value.prototype.comparableFrameCount = 0 }, (value) => validatePrototype(value))
  await mutateRecord("instance recommendation injection schema gate", (value) => { value.decision.recommendationTerritoryId = "A" }, (value) => assertSchemaInstance(schema, value))
  await mutateRecord("instance selection vocabulary schema gate", (value) => { value.decision.consensusStatus = "selected" }, (value) => assertSchemaInstance(schema, value))
  await mutateRecord("instance selection vocabulary custom gate", (value) => { value.decision.consensusStatus = "selected" }, (value) => validateDecision(value, loadedReviews))
  await mutateRecord("prototype hash drift", (value) => { value.prototype.bundleSha256 = "0".repeat(64) }, (value) => assert(prototypeBundleSha256(value.prototype.files) === value.prototype.bundleSha256, "prototype bundle drift"))
  await mutateRecord("route inventory drift", (value) => { value.prototype.archetypes[0].routeIds.pop() }, (value) => equal(value.prototype.archetypes, EXPECTED_ARCHETYPES, "prototype route inventory"))
  await mutateRecord("frame inventory drift", (value) => { value.prototype.frameIds.pop(); value.prototype.sharedFrameCount -= 1; value.prototype.comparableFrameCount -= 3 }, (value) => equal(value.prototype.frameIds, prototypeContext.module.sharedFrames.map(({ frameId }) => frameId), "prototype frame inventory"))
  await mutateRecord("Step 2 unresolved exclusion removed schema gate", (value) => { value.source.unresolvedDecisionQuarantine.decisionIds.pop() }, (value) => assertSchemaInstance(schema, value))
  await mutateRecord("Step 2 unresolved exclusion removed custom gate", (value) => { value.source.unresolvedDecisionQuarantine.decisionIds.pop() }, (value) => validateStep2Source(value.source))
  await mutateRecord("prototype fixture promoted schema gate", (value) => { value.prototype.fixtureSemantics.status = "canonical" }, (value) => assertSchemaInstance(schema, value))
  await mutateRecord("prototype fixture promoted custom gate", (value) => { value.prototype.fixtureSemantics.status = "canonical" }, (value) => validatePrototype(value))
  const navigationPresenceMutation = clone(prototypeContext.module.territories)
  navigationPresenceMutation[1].differentiationAxes.navigationPresence = "persistent promoted navigation"
  await reject("A/B/C navigationPresence variation", () => validateQuarantinedNavigationPresence(navigationPresenceMutation))

  for (const [field, replacement] of boundaryMutations) {
    const reviewMutation = clone(loadedReviews)
    reviewMutation[0].review[field] = replacement
    await reject(`review receipt ${field} mutation`, () => validateReviews(record, browserBytes, browserReceipt, reviewMutation, taskReceipt, prompts))
    const taskMutation = clone(taskReceipt)
    taskMutation[field] = replacement
    await reject(`task-message receipt ${field} mutation`, () => validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, taskMutation, prompts))
    const benchmarkMutation = clone(benchmarks)
    benchmarkMutation[field] = replacement
    await reject(`benchmark ${field} mutation`, () => validateBenchmarks(record, benchmarkMutation))
    const browserMutation = clone(browserReceipt)
    browserMutation[field] = replacement
    await reject(`browser receipt ${field} mutation`, () => validateBrowser(record, prototypeContext, browserMutation))
    const tokenMutation = clone(browserContext.tokenMapping)
    tokenMutation[field] = replacement
    await reject(`token mapping ${field} mutation`, () => validateTokenMapping(record, prototypeContext, browserReceipt.tokenMappingFile, browserReceipt.sourceSha, tokenMutation))
    if (hasOwn(assetRows[0], field)) {
      const assetMutation = clone(assetRows)
      assetMutation[0][field] = String(replacement)
      await reject(`asset TSV ${field} mutation`, () => validateAssets(record, prototypeContext, assetMutation))
    }
    const prompt = prompts[0]
    const expectedPromptLiteral = `${field}=${terminalMetadataFields(record).find(([key]) => key === field)?.[1]}`
    assert(prompt.text.includes(expectedPromptLiteral), `prompt-template ${field} mutation anchor absent`)
    await reject(`prompt template ${field} mutation`, () => validatePromptTemplate(prompt.text.replace(expectedPromptLiteral, `${field}=${String(replacement)}`), prompt.descriptor.rubricId, prompt.descriptor.path))
    const reportMutation = mutateTerminalMetadataMarker(readText(reportPath), "plan-006-report-terminal-metadata", record, field, String(replacement))
    await reject(`terminal report ${field} mutation`, () => validateReportText(record, reportMutation))
    const planMutation = mutateTerminalMetadataMarker(readText(record.plan.path), "plan-006-terminal-metadata", record, field, String(replacement))
    await reject(`terminal plan ${field} mutation`, () => validatePlanText(record, planMutation))
    const plansIndexMutation = mutateTerminalMetadataMarker(readText(record.plansIndex.path), "plan-006-index-terminal-metadata", record, field, String(replacement))
    await reject(`plans index ${field} mutation`, () => validateIndexes(record, plansIndexMutation, readText(record.researchIndex.path)))
    const researchIndexMutation = mutateTerminalMetadataMarker(readText(record.researchIndex.path), "plan-006-research-index-terminal-metadata", record, field, String(replacement))
    await reject(`research index ${field} mutation`, () => validateIndexes(record, readText(record.plansIndex.path), researchIndexMutation))
    if (record.canonical !== null) {
      await mutateRecord(`canonical promotion ${field} schema gate`, (value) => { value.canonical.promotionContract[field] = replacement }, (value) => assertSchemaInstance(schema, value))
      await mutateRecord(`canonical promotion ${field} custom gate`, (value) => { value.canonical.promotionContract[field] = replacement }, (value) => validateCanonical(value, prototypeContext))
    }
  }
  for (const [field, replacement] of [["artifactStatus", "DONE"], ["decisionStatus", "pending"]]) {
    const reportMutation = mutateTerminalMetadataMarker(readText(reportPath), "plan-006-report-terminal-metadata", record, field, replacement)
    await reject(`terminal report ${field} vocabulary mutation`, () => validateReportText(record, reportMutation))
    const planMutation = mutateTerminalMetadataMarker(readText(record.plan.path), "plan-006-terminal-metadata", record, field, replacement)
    await reject(`terminal plan ${field} vocabulary mutation`, () => validatePlanText(record, planMutation))
    const plansIndexMutation = mutateTerminalMetadataMarker(readText(record.plansIndex.path), "plan-006-index-terminal-metadata", record, field, replacement)
    await reject(`plans index ${field} vocabulary mutation`, () => validateIndexes(record, plansIndexMutation, readText(record.researchIndex.path)))
    const researchIndexMutation = mutateTerminalMetadataMarker(readText(record.researchIndex.path), "plan-006-research-index-terminal-metadata", record, field, replacement)
    await reject(`research index ${field} vocabulary mutation`, () => validateIndexes(record, readText(record.plansIndex.path), researchIndexMutation))
  }
  const completeStatusIndexMutation = readText(record.plansIndex.path).split("\n").map((line) => line.startsWith("| 006 | Select a consumer visual system and route archetypes |") ? line.replace(/\bDONE\b/u, "COMPLETE") : line).join("\n")
  assert(completeStatusIndexMutation !== readText(record.plansIndex.path), "plans index COMPLETE-status mutation anchor absent")
  await reject("plans index out-of-vocabulary COMPLETE status", () => validateIndexes(record, completeStatusIndexMutation, readText(record.researchIndex.path)))
  await mutateRecord("plans index descriptor drift", (value) => { value.plansIndex.sha256 = "0".repeat(64) }, (value) => validateIndexes(value))
  await mutateRecord("research index descriptor drift", (value) => { value.researchIndex.sha256 = "0".repeat(64) }, (value) => validateIndexes(value))
  const terminalReportText = readText(reportPath)
  for (const literal of terminalCoverageLiterals()) {
    await reject(`terminal report coverage literal removed: ${literal.split("=")[0]}`, () => validateReportText(record, terminalReportText.replace(literal, "coverage-literal-removed")))
  }
  await reject("terminal report exhaustive legal-state overclaim", () => validateReportText(record, `${terminalReportText.trimEnd()}\n\nExhaustive legal-state validation passed.\n`))
  await reject("terminal report full-print overclaim", () => validateReportText(record, `${terminalReportText.trimEnd()}\n\nFull print coverage completed.\n`))
  const trustPrompt = prompts.find(({ descriptor }) => descriptor.rubricId === "consumer-trust-anti-ai-slop")
  const childPrompt = prompts.find(({ descriptor }) => descriptor.rubricId === "accessibility-cognitive-load")
  assert(trustPrompt !== undefined && childPrompt !== undefined, "adversarial prompt topology fixtures absent")
  await reject("trust prompt spawn/non-observation duty removed", () => validatePromptTemplate(trustPrompt.text.replace(TRUST_LANE_ORCHESTRATION_INSTRUCTION, "Topology omitted."), trustPrompt.descriptor.rubricId, trustPrompt.descriptor.path))
  await reject("child prompt root release barrier removed", () => validatePromptTemplate(childPrompt.text.replace(CHILD_LANE_RELEASE_INSTRUCTION, "Barrier omitted."), childPrompt.descriptor.rubricId, childPrompt.descriptor.path))
  await reject("child prompt given trust orchestration duty", () => validatePromptTemplate(`${childPrompt.text.trimEnd()}\n\n${TRUST_LANE_ORCHESTRATION_INSTRUCTION}\n`, childPrompt.descriptor.rubricId, childPrompt.descriptor.path))

  const fakeTaskReviews = clone(loadedReviews)
  for (const [index, fake] of ["/root/fake_a", "/root/fake_b", "/root/fake_c"].entries()) fakeTaskReviews[index].review.taskPath = fake
  await reject("arbitrary fake review task paths", () => validateReviews(record, browserBytes, browserReceipt, fakeTaskReviews, taskReceipt, prompts))
  const duplicatedReviews = clone(loadedReviews)
  duplicatedReviews[1].review.taskPath = duplicatedReviews[0].review.taskPath
  await reject("review task duplication", () => validateReviews(record, browserBytes, browserReceipt, duplicatedReviews, taskReceipt, prompts))
  const totalDriftReviews = clone(loadedReviews)
  totalDriftReviews[0].review.territoryScores[0].total += 1
  await reject("review score total drift", () => validateReviews(record, browserBytes, browserReceipt, totalDriftReviews, taskReceipt, prompts))
  for (const label of ["recommendation mismatch", "recommendation with blocker", "recommendation with dissent", "recommendation with unsupported lane", "recommendation with lane tie"]) {
    const mutation = clone(loadedReviews)
    mutation[0].review.recommendationTerritoryId = "A"
    if (label.includes("blocker")) mutation[0].review.territoryScores[1].blockingFindings.push({ finding: "Adversarial recommendation blocker", evidenceCoordinates: [`${researchRoot}/prototype.html:L1`] })
    if (label.includes("dissent")) mutation[0].review.dissent.push({ territoryId: "B", reason: "Adversarial recommendation dissent", evidenceCoordinates: [`${researchRoot}/prototype.html:L1`] })
    if (label.includes("unsupported")) mutation[0].review.consensusPosition = "cannot-support-selection"
    if (label.includes("tie")) {
      const maximum = Math.max(...mutation[0].review.territoryScores.map(({ total }) => total))
      mutation[0].review.territoryScores[0].total = maximum
      mutation[0].review.territoryScores[1].total = maximum
    }
    await reject(label, () => validateReviews(record, browserBytes, browserReceipt, mutation, taskReceipt, prompts))
  }
  const receiptDriftReviews = clone(loadedReviews)
  receiptDriftReviews[0].review.browserReceiptSha256 = "0".repeat(64)
  await reject("review browser receipt hash drift", () => validateReviews(record, browserBytes, browserReceipt, receiptDriftReviews, taskReceipt, prompts))
  const promptDriftReviews = clone(loadedReviews)
  promptDriftReviews[0].review.promptSha256 = "0".repeat(64)
  await reject("review prompt hash drift", () => validateReviews(record, browserBytes, browserReceipt, promptDriftReviews, taskReceipt, prompts))
  const promptTemplateDriftReviews = clone(loadedReviews)
  promptTemplateDriftReviews[0].review.promptTemplateSha256 = "0".repeat(64)
  await reject("review prompt-template hash drift", () => validateReviews(record, browserBytes, browserReceipt, promptTemplateDriftReviews, taskReceipt, prompts))
  const rubricDriftReviews = clone(loadedReviews)
  rubricDriftReviews[0].review.rubricSha256 = "0".repeat(64)
  await reject("review rubric hash drift", () => validateReviews(record, browserBytes, browserReceipt, rubricDriftReviews, taskReceipt, prompts))
  const subjectDriftReviews = clone(loadedReviews)
  subjectDriftReviews[0].review.repositoryCommit = "7fcc776e6941c7f41a504dda59ea59af88ba31fb"
  await reject("rejected old review subject reuse", () => validateReviews(record, browserBytes, browserReceipt, subjectDriftReviews, taskReceipt, prompts))
  const invalidRadioSubjectReviews = clone(loadedReviews)
  invalidRadioSubjectReviews[0].review.repositoryCommit = "f1a566f3eabb5bc972d75a555038e3b315a211a2"
  await reject("invalid pre-radio-repair review subject reuse", () => validateReviews(record, browserBytes, browserReceipt, invalidRadioSubjectReviews, taskReceipt, prompts))
  const fakeCoordinateReviews = clone(loadedReviews)
  fakeCoordinateReviews[0].review.territoryScores[0].criterionScores[0].evidenceCoordinates = ["no-such-file#fake-anchor"]
  await reject("unresolved fake evidence anchor", () => validateReviews(record, browserBytes, browserReceipt, fakeCoordinateReviews, taskReceipt, prompts))
  const missingLineReviews = clone(loadedReviews)
  missingLineReviews[0].review.territoryScores[0].criterionScores[0].evidenceCoordinates = [`${researchRoot}/prototype.mjs:L999999999`]
  await reject("out-of-range review evidence line", () => validateReviews(record, browserBytes, browserReceipt, missingLineReviews, taskReceipt, prompts))
  const blankLineReviews = clone(loadedReviews)
  const coordinateFile = `${researchRoot}/prototype.mjs`
  const committedCoordinateLines = decodeText(runGit(["show", `${record.reviews.reviewSubjectSha}:${coordinateFile}`], null), `${record.reviews.reviewSubjectSha}:${coordinateFile}`).slice(0, -1).split("\n")
  const blankLine = committedCoordinateLines.findIndex((line) => line.trim().length === 0) + 1
  assert(blankLine > 0, "adversarial blank-line coordinate fixture absent")
  blankLineReviews[0].review.territoryScores[0].criterionScores[0].evidenceCoordinates = [`${coordinateFile}:L${blankLine}`]
  await reject("blank review evidence line", () => validateReviews(record, browserBytes, browserReceipt, blankLineReviews, taskReceipt, prompts))
  const safePayloadKeys = ["schemaVersion", "authenticationStatus", "authenticationLimitation", "taskPath", "sessionUuid", "parentThreadId", "provenanceClass", "threadSource", "originator", "depth", "completionState", "completionEventTimestamp", "completionTurnId", "completionMessageSha256", "reportPath", "reportSha256", "repositoryCommit", "rawSpawn", "rawCompletion", "safeReceiptHashAlgorithm"]
  const recomputeSafeReceipt = (receipt) => { receipt.safeReceiptSha256 = sha256(Buffer.from(JSON.stringify(Object.fromEntries(safePayloadKeys.map((key) => [key, receipt[key]]))), "utf8")) }
  const rawSpawnMutation = clone(taskReceipt)
  const fakeSpawnBytes = Buffer.from('{"task_name":"/root/fake_a"}', "utf8")
  rawSpawnMutation.tasks[0].safeReceipt.rawSpawn.byteLength = fakeSpawnBytes.byteLength
  rawSpawnMutation.tasks[0].safeReceipt.rawSpawn.sha256 = sha256(fakeSpawnBytes)
  rawSpawnMutation.tasks[0].safeReceipt.rawSpawn.bytesBase64 = fakeSpawnBytes.toString("base64")
  recomputeSafeReceipt(rawSpawnMutation.tasks[0].safeReceipt)
  await reject("raw spawn response task path retarget", () => validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, rawSpawnMutation, prompts))
  const oldSessionMutation = clone(taskReceipt)
  oldSessionMutation.tasks[0].safeReceipt.sessionUuid = [...REJECTED_REVIEW_SESSION_UUIDS][0]
  recomputeSafeReceipt(oldSessionMutation.tasks[0].safeReceipt)
  await reject("copied old review session result", () => validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, oldSessionMutation, prompts))
  const copiedResultMutation = clone(taskReceipt)
  copiedResultMutation.tasks[1].safeReceipt.rawCompletion = clone(copiedResultMutation.tasks[0].safeReceipt.rawCompletion)
  copiedResultMutation.tasks[1].safeReceipt.completionMessageSha256 = copiedResultMutation.tasks[1].safeReceipt.rawCompletion.sha256
  recomputeSafeReceipt(copiedResultMutation.tasks[1].safeReceipt)
  await reject("copied old lane result bytes", () => validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, copiedResultMutation, prompts))
  const retargetedSubjectMutation = clone(taskReceipt)
  retargetedSubjectMutation.tasks[0].safeReceipt.repositoryCommit = "7fcc776e6941c7f41a504dda59ea59af88ba31fb"
  recomputeSafeReceipt(retargetedSubjectMutation.tasks[0].safeReceipt)
  await reject("retargeted old review subject", () => validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, retargetedSubjectMutation, prompts))
  const parentMutation = clone(taskReceipt)
  parentMutation.tasks[0].safeReceipt.parentThreadId = parentMutation.tasks[0].safeReceipt.sessionUuid
  recomputeSafeReceipt(parentMutation.tasks[0].safeReceipt)
  await reject("safe receipt parent lineage drift", () => validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, parentMutation, prompts))
  const childParentMutation = clone(taskReceipt)
  const childParentTask = childParentMutation.tasks.find(({ rubricId }) => rubricId === "accessibility-cognitive-load")
  childParentTask.safeReceipt.parentThreadId = REVIEW_AUDIT_PARENT_THREAD_ID
  recomputeSafeReceipt(childParentTask.safeReceipt)
  await reject("child receipt bypasses trust parent", () => validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, childParentMutation, prompts))
  const depthMutation = clone(taskReceipt)
  const depthTask = depthMutation.tasks.find(({ rubricId }) => rubricId === "visual-component-coherence")
  depthTask.safeReceipt.depth = 2
  recomputeSafeReceipt(depthTask.safeReceipt)
  await reject("child receipt depth drift", () => validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, depthMutation, prompts))
  const safeDigestMutation = clone(taskReceipt)
  safeDigestMutation.tasks[0].safeReceipt.safeReceiptSha256 = "0".repeat(64)
  await reject("safe receipt digest drift", () => validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, safeDigestMutation, prompts))
  const renderedPromptMutation = clone(taskReceipt)
  renderedPromptMutation.tasks[0].promptSha256 = "0".repeat(64)
  await reject("rendered task-message hash drift", () => validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, renderedPromptMutation, prompts))
  const promptDescriptorMutation = clone(taskReceipt)
  promptDescriptorMutation.tasks[0].promptTemplateSha256 = "0".repeat(64)
  await reject("task prompt-template descriptor drift", () => validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, promptDescriptorMutation, prompts))
  const intervalMutation = clone(taskReceipt)
  intervalMutation.tasks[2].safeReceipt.sessionUuid = "ffffffff-ffff-7fff-8fff-ffffffffffff"
  recomputeSafeReceipt(intervalMutation.tasks[2].safeReceipt)
  await reject("nonoverlapping review task intervals", () => validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, intervalMutation, prompts))
  const selfTimestampMutation = clone(taskReceipt)
  selfTimestampMutation.outputsFirstSharedAt = "2030-01-01T00:00:00.000Z"
  await reject("self-authored output-share timestamp forbidden", () => validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, selfTimestampMutation, prompts))
  const prematureChildCompletionMutation = clone(taskReceipt)
  const trustCompletion = Date.parse(prematureChildCompletionMutation.tasks.find(({ rubricId }) => rubricId === "consumer-trust-anti-ai-slop").safeReceipt.completionEventTimestamp)
  const childTask = prematureChildCompletionMutation.tasks.find(({ rubricId }) => rubricId === "accessibility-cognitive-load")
  childTask.safeReceipt.completionEventTimestamp = new Date(trustCompletion - 1).toISOString()
  recomputeSafeReceipt(childTask.safeReceipt)
  await reject("child completion before trust barrier", () => validateTaskReceipts(record, browserBytes, browserReceipt, loadedReviews, prematureChildCompletionMutation, prompts))

  const dissentReviews = clone(loadedReviews)
  dissentReviews[0].review.dissent.push({ territoryId: "A", reason: "Adversarial unresolved concern", evidenceCoordinates: [`${researchRoot}/prototype.html:L1`] })
  await reject("dissent hidden by selected decision", () => validateDecision(record, dissentReviews))
  const unsupportedReviews = clone(loadedReviews)
  unsupportedReviews[0].review.consensusPosition = "cannot-support-selection"
  await reject("unsupported lane hidden by selected decision", () => validateDecision(record, unsupportedReviews))
  const globalBlockerReviews = clone(loadedReviews)
  for (const loaded of globalBlockerReviews) {
    for (const territory of loaded.review.territoryScores) {
      const score = territory.territoryId === "A" ? 5 : territory.territoryId === "B" ? 4 : 3
      for (const criterion of territory.criterionScores) criterion.score = score
      territory.total = score * 5
      territory.blockingFindings = []
    }
    loaded.review.consensusPosition = "supports-deterministic-selection"
    loaded.review.dissent = []
  }
  globalBlockerReviews[0].review.territoryScores.find(({ territoryId }) => territoryId === "B").blockingFindings.push({ finding: "Adversarial B blocking finding", evidenceCoordinates: [`${researchRoot}/prototype.html:L1`] })
  const blockedDecision = recomputeDecision(globalBlockerReviews)
  assert(blockedDecision.highestTerritoryIds.length === 1 && blockedDecision.highestTerritoryIds[0] === "A", "adversarial B-blocker fixture must retain unique A high score")
  await reject("B blocker plus unique A score cannot select", () => assert(blockedDecision.selected !== null, "global blocker correctly prevented selection"))
  await reject("global blocker hidden by selected manifest", () => validateDecision(record, globalBlockerReviews))
  const tieReviews = clone(loadedReviews)
  for (const loaded of tieReviews) {
    for (const territory of loaded.review.territoryScores) {
      for (const criterion of territory.criterionScores) criterion.score = 3
      territory.total = 15
      territory.blockingFindings = []
    }
    loaded.review.consensusPosition = "supports-deterministic-selection"
    loaded.review.dissent = []
  }
  await reject("nonunique score tie selected", () => validateDecision(record, tieReviews))

  const semanticReceipt = clone(browserReceipt)
  const semanticCase = semanticReceipt.cases.find((entry) => entry.territoryId === "B" && entry.presentation === "default" && entry.browserProject === "chromium")
  semanticCase.semanticSha256 = semanticCase.semanticSha256 === "0".repeat(64) ? "1".repeat(64) : "0".repeat(64)
  await reject("semantic parity drift", () => validateBrowser(record, prototypeContext, semanticReceipt))
  const missingFirefoxReceipt = clone(browserReceipt)
  const firefoxIndex = missingFirefoxReceipt.cases.findIndex((entry) => entry.presentation === "default" && entry.browserProject === "firefox")
  missingFirefoxReceipt.cases.splice(firefoxIndex, 1)
  await reject("missing nonfocused Firefox default frame", () => validateBrowser(record, prototypeContext, missingFirefoxReceipt))
  const brokenFirefoxReceipt = clone(browserReceipt)
  brokenFirefoxReceipt.cases.find((entry) => entry.presentation === "default" && entry.browserProject === "firefox").keyboardTraversal.allVisitedFocusVisible = false
  await reject("broken nonfocused Firefox default frame", () => validateBrowser(record, prototypeContext, brokenFirefoxReceipt))
  const skippedLateControlReceipt = clone(browserReceipt)
  const skippedKeyboard = skippedLateControlReceipt.cases.find((entry) => entry.presentation === "default" && entry.browserProject === "firefox").keyboardTraversal
  skippedKeyboard.visited.pop()
  await reject("keyboard skipped late control", () => validateBrowser(record, prototypeContext, skippedLateControlReceipt))
  const duplicateTrapReceipt = clone(browserReceipt)
  const duplicateKeyboard = duplicateTrapReceipt.cases.find((entry) => entry.presentation === "default" && entry.browserProject === "firefox").keyboardTraversal
  duplicateKeyboard.visited[duplicateKeyboard.visited.length - 1] = clone(duplicateKeyboard.visited[0])
  duplicateKeyboard.allStopsUnique = false
  duplicateKeyboard.noTrap = false
  await reject("keyboard duplicate or trap", () => validateBrowser(record, prototypeContext, duplicateTrapReceipt))
  const lateInvisibleReceipt = clone(browserReceipt)
  const invisibleKeyboard = lateInvisibleReceipt.cases.find((entry) => entry.presentation === "default" && entry.browserProject === "firefox").keyboardTraversal
  invisibleKeyboard.visited[invisibleKeyboard.visited.length - 1].focusVisible = false
  invisibleKeyboard.allVisitedFocusVisible = false
  await reject("keyboard late invisible focus", () => validateBrowser(record, prototypeContext, lateInvisibleReceipt))
  const wrongOrderReceipt = clone(browserReceipt)
  const wrongOrderKeyboard = wrongOrderReceipt.cases.find((entry) => entry.presentation === "default" && entry.browserProject === "firefox").keyboardTraversal
  ;[wrongOrderKeyboard.visited[0], wrongOrderKeyboard.visited[1]] = [wrongOrderKeyboard.visited[1], wrongOrderKeyboard.visited[0]]
  wrongOrderKeyboard.exactOrder = false
  await reject("keyboard wrong order", () => validateBrowser(record, prototypeContext, wrongOrderReceipt))
  const forgedReturnOrderReceipt = clone(browserReceipt)
  const forgedReturnKeyboard = forgedReturnOrderReceipt.cases.find((entry) => entry.presentation === "default" && entry.browserProject === "firefox").keyboardTraversal
  ;[forgedReturnKeyboard.returnExpectedOrder[0], forgedReturnKeyboard.returnExpectedOrder[1]] = [forgedReturnKeyboard.returnExpectedOrder[1], forgedReturnKeyboard.returnExpectedOrder[0]]
  forgedReturnKeyboard.returnVisited = forgedReturnKeyboard.returnExpectedOrder.map(({ logicalStopId, coordinate }) => ({ logicalStopId, coordinate, focusVisible: true }))
  await reject("keyboard forged return order", () => validateBrowser(record, prototypeContext, forgedReturnOrderReceipt))
  const directionalRadioCase = browserReceipt.cases.find((entry) => entry.browserProject === "webkit" && entry.presentation !== "print" && entry.keyboardTraversal.returnExpectedOrder.some((returnStop) => {
    const forwardStop = entry.keyboardTraversal.expectedOrder.find(({ logicalStopId }) => logicalStopId === returnStop.logicalStopId)
    return returnStop.logicalStopId.startsWith("radio-group:") && forwardStop !== undefined && forwardStop.coordinate !== returnStop.coordinate
  }))
  assert(directionalRadioCase !== undefined, "browser receipt must retain an observed WebKit direction-specific radio-group member")
  const directionalRadioReturnIndex = directionalRadioCase.keyboardTraversal.returnExpectedOrder.findIndex((returnStop) => {
    const forwardStop = directionalRadioCase.keyboardTraversal.expectedOrder.find(({ logicalStopId }) => logicalStopId === returnStop.logicalStopId)
    return returnStop.logicalStopId.startsWith("radio-group:") && forwardStop !== undefined && forwardStop.coordinate !== returnStop.coordinate
  })
  assert(directionalRadioReturnIndex >= 0, "WebKit direction-specific radio-group mutation fixture absent")
  const directionalRadioLogicalStopId = directionalRadioCase.keyboardTraversal.returnExpectedOrder[directionalRadioReturnIndex].logicalStopId
  const directionalRadioForwardCoordinate = directionalRadioCase.keyboardTraversal.expectedOrder.find(({ logicalStopId }) => logicalStopId === directionalRadioLogicalStopId).coordinate
  const retargetedRadioReceipt = clone(browserReceipt)
  const retargetedRadioCase = retargetedRadioReceipt.cases.find(({ caseId }) => caseId === directionalRadioCase.caseId)
  retargetedRadioCase.keyboardTraversal.returnVisited[directionalRadioReturnIndex].coordinate = directionalRadioForwardCoordinate
  await reject("keyboard retargeted radio member", () => validateBrowser(record, prototypeContext, retargetedRadioReceipt))
  const logicalStopDriftReceipt = clone(browserReceipt)
  const logicalStopDriftCase = logicalStopDriftReceipt.cases.find(({ caseId }) => caseId === directionalRadioCase.caseId)
  logicalStopDriftCase.keyboardTraversal.returnVisited[directionalRadioReturnIndex].logicalStopId = 'radio-group:["no-form","drifted-choice"]'
  await reject("keyboard logical stop drift", () => validateBrowser(record, prototypeContext, logicalStopDriftReceipt))
  const elementIdentityDriftReceipt = clone(browserReceipt)
  const elementIdentityDriftCase = elementIdentityDriftReceipt.cases.find((entry) => entry.presentation === "default" && entry.browserProject === "chromium")
  const ordinaryIndex = elementIdentityDriftCase.keyboardTraversal.expectedOrder.findIndex(({ logicalStopId }) => logicalStopId.startsWith("element:"))
  assert(ordinaryIndex >= 0, "ordinary focus-stop mutation fixture absent")
  elementIdentityDriftCase.keyboardTraversal.expectedOrder[ordinaryIndex].coordinate = "#retargeted-ordinary-control"
  elementIdentityDriftCase.keyboardTraversal.visited[ordinaryIndex].coordinate = "#retargeted-ordinary-control"
  await reject("keyboard ordinary coordinate/logical identity drift", () => validateBrowser(record, prototypeContext, elementIdentityDriftReceipt))
  const nonWebkitDirectionalRadioReceipt = clone(browserReceipt)
  nonWebkitDirectionalRadioReceipt.cases.find(({ caseId }) => caseId === directionalRadioCase.caseId).browserProject = "firefox"
  await reject("keyboard non-WebKit direction-specific radio coordinate", () => validateBrowser(record, prototypeContext, nonWebkitDirectionalRadioReceipt))
  const cycleLogicalDriftReceipt = clone(browserReceipt)
  cycleLogicalDriftReceipt.cases.find((entry) => entry.presentation === "default" && entry.browserProject === "firefox").keyboardTraversal.cycleReturnLogicalStopId = "element:#drifted-cycle-stop"
  await reject("keyboard cycle logical-stop drift", () => validateBrowser(record, prototypeContext, cycleLogicalDriftReceipt))
  const cycleCoordinateDriftReceipt = clone(browserReceipt)
  cycleCoordinateDriftReceipt.cases.find((entry) => entry.presentation === "default" && entry.browserProject === "firefox").keyboardTraversal.cycleReturnCoordinate = "#drifted-cycle-coordinate"
  await reject("keyboard cycle coordinate drift", () => validateBrowser(record, prototypeContext, cycleCoordinateDriftReceipt))
  const coverageContractReceipt = clone(browserReceipt)
  coverageContractReceipt.coverageContract.deferredHazardVariants.pop()
  await reject("browser representative coverage contract weakening", () => validateBrowser(record, prototypeContext, coverageContractReceipt))
  const keyboardContractReceipt = clone(browserReceipt)
  keyboardContractReceipt.keyboardEvidenceContract.forwardTraversal = "Programmatic focus was sufficient."
  await reject("browser keyboard evidence contract weakening", () => validateBrowser(record, prototypeContext, keyboardContractReceipt))
  const printReceipt = clone(browserReceipt)
  printReceipt.cases.find((entry) => entry.presentation === "print").printActionsSuppressed = false
  await reject("unsuppressed print actions", () => validateBrowser(record, prototypeContext, printReceipt))
  const zeroPrintCountReceipt = clone(browserReceipt)
  const zeroPrintCase = zeroPrintCountReceipt.cases.find((entry) => entry.presentation === "print")
  zeroPrintCase.printActionElementCount = 0
  zeroPrintCase.presentationEvidence.actionElementCount = 0
  await reject("zero-count print suppression", () => validateBrowser(record, prototypeContext, zeroPrintCountReceipt))
  const duplicatePrintCoordinateReceipt = clone(browserReceipt)
  const mutatedPrintCases = duplicatePrintCoordinateReceipt.cases.filter(({ presentation }) => presentation === "print")
  mutatedPrintCases[1].browserProject = mutatedPrintCases[0].browserProject
  await reject("duplicate/missing immutable print coordinate", () => validateBrowser(record, prototypeContext, duplicatePrintCoordinateReceipt))
  const routeJoinReceipt = clone(browserReceipt)
  routeJoinReceipt.cases[0].routePath = "/fake/"
  await reject("browser route-path/frame join drift", () => validateBrowser(record, prototypeContext, routeJoinReceipt))
  const repositoryUrlReceipt = clone(browserReceipt)
  repositoryUrlReceipt.cases[0].repositoryRelativeUrl = `${researchRoot}/prototype.html?fake=true`
  await reject("browser repository-relative URL drift", () => validateBrowser(record, prototypeContext, repositoryUrlReceipt))
  const requestPathReceipt = clone(browserReceipt)
  requestPathReceipt.cases[0].fixtureRequestPath = "/?fake=true"
  await reject("browser fixture request-path drift", () => validateBrowser(record, prototypeContext, requestPathReceipt))
  const requestedViewportReceipt = clone(browserReceipt)
  requestedViewportReceipt.cases[0].requestedViewportWidth += 1
  await reject("browser requested viewport drift", () => validateBrowser(record, prototypeContext, requestedViewportReceipt))
  const observedViewportReceipt = clone(browserReceipt)
  observedViewportReceipt.cases[0].observedWindowInnerWidth -= 1
  await reject("browser observed viewport/client-width drift", () => validateBrowser(record, prototypeContext, observedViewportReceipt))
  const semanticDirectTextReceipt = clone(browserReceipt)
  semanticDirectTextReceipt.cases[0].semanticDirectTextEntryCount = 0
  await reject("browser semantic direct-text evidence erased", () => validateBrowser(record, prototypeContext, semanticDirectTextReceipt))
  const largeTextReceipt = clone(browserReceipt)
  largeTextReceipt.cases.find((entry) => entry.presentation === "large-text-125").presentationEvidence.ratios.root = 1
  await reject("browser large-text root ratio drift", () => validateBrowser(record, prototypeContext, largeTextReceipt))
  const reducedMotionReceipt = clone(browserReceipt)
  reducedMotionReceipt.cases.find((entry) => entry.presentation === "reduced-motion").presentationEvidence.mediaMatches = false
  await reject("browser reduced-motion match drift", () => validateBrowser(record, prototypeContext, reducedMotionReceipt))
  const forcedColorsReceipt = clone(browserReceipt)
  forcedColorsReceipt.cases.find((entry) => entry.presentation === "forced-colors").presentationEvidence.nativeFocusObserved = false
  await reject("browser forced-colors native-focus drift", () => validateBrowser(record, prototypeContext, forcedColorsReceipt))
  const forcedColorsStabilityReceipt = clone(browserReceipt)
  const forcedColorsStabilityCase = forcedColorsStabilityReceipt.cases.filter((entry) => entry.presentation === "forced-colors")[1]
  forcedColorsStabilityCase.presentationEvidence.adaptation.bodyColor = "rgb(1, 1, 1)"
  forcedColorsStabilityCase.presentationEvidence.stableAdaptationSha256 = sha256(JSON.stringify(forcedColorsStabilityCase.presentationEvidence.adaptation))
  await reject("browser forced-colors cross-territory stability drift", () => validateBrowser(record, prototypeContext, forcedColorsStabilityReceipt))
  const zoomReceipt = clone(browserReceipt)
  zoomReceipt.cases.find((entry) => entry.presentation === "zoom-400").presentationEvidence.observedCssViewportWidth = 321
  await reject("browser 400%-equivalent zoom drift", () => validateBrowser(record, prototypeContext, zoomReceipt))
  const axeReceipt = clone(browserReceipt)
  const axeCase = axeReceipt.cases.find((entry) => entry.presentation === "default")
  axeCase.axeFindings.push({ id: "mutation-moderate", impact: "moderate", help: "Mutation", helpUrl: "https://example.invalid/axe", tags: ["wcag2aa"], nodeCount: 1, targets: ["main"] })
  axeCase.unexpectedAxeFindingCount = 1
  await reject("moderate Axe finding", () => validateBrowser(record, prototypeContext, axeReceipt))
  const tokenObservationReceipt = clone(browserReceipt)
  tokenObservationReceipt.tokenEvidence.observations[0].roles.find(({ promotable }) => promotable).dependencyProof.changed = false
  await reject("unproved rendered promotable token", () => validateBrowser(record, prototypeContext, tokenObservationReceipt))
  const materialAxisReceipt = clone(browserReceipt)
  materialAxisReceipt.tokenEvidence.differentiation[0].pairwiseDistinct = false
  materialAxisReceipt.tokenEvidence.materialDifferentiationCount -= 1
  await reject("computed material differentiation weakening", () => validateBrowser(record, prototypeContext, materialAxisReceipt))
  const captureSource = readText(`${researchRoot}/capture-browser-receipt.mjs`)
  await reject("capture prior-receipt absence preflight removed", () => validateCapturePreflightSource(captureSource.replace("if (existsSync(resolve(repositoryRoot, receiptPath))) throw new Error", "if (false) throw new Error")))
  await reject("capture global-clean preflight narrowed", () => validateCapturePreflightSource(captureSource.replace("const dirtyWorktree = git([\"status\", \"--porcelain=v1\", \"--untracked-files=all\"])", "const dirtyWorktree = git([\"status\", \"--porcelain=v1\", \"--untracked-files=all\", \"--\", ...inputPaths])")))
  const benchmarkDrift = clone(benchmarks)
  benchmarkDrift.sources.pop()
  await reject("benchmark population drift", () => validateBenchmarks(record, benchmarkDrift))

  const assetAttacks = [
    ["asset gate text", (rows) => { rows.find(({ gate_text_json }) => gate_text_json !== "null").gate_text_json = "null" }],
    ["asset phone SHA", (rows) => { rows[0].phone_sha256 = "0".repeat(64) }],
    ["asset phone dimensions", (rows) => { rows[0].phone_width = String(Number(rows[0].phone_width) + 1) }],
    ["asset print SHA", (rows) => { rows[0].print_sha256 = "0".repeat(64) }],
    ["asset print dimensions", (rows) => { rows[0].print_height = String(Number(rows[0].print_height) + 1) }],
    ["asset rendered derivative binding", (rows) => { rows.find(({ rendered_in_prototype }) => rendered_in_prototype === "true").rendered_in_prototype = "false" }],
    ["asset review coordinate", (rows) => { rows[0].review_coordinate = "no-such-file#/fake" }],
    ["asset rights coordinate", (rows) => { rows[0].rights_coordinates_json = '["no-such-file#/fake"]' }],
    ["asset ledger digest", (rows) => { rows[0].release_ledger_sha256 = "0".repeat(64) }],
    ["asset delivery contract", (rows) => { rows.find(({ rendered_in_prototype }) => rendered_in_prototype === "true").delivery_contract = "altered" }]
  ]
  for (const [label, mutation] of assetAttacks) {
    const rows = clone(assetRows)
    mutation(rows)
    await reject(label, () => validateAssets(record, prototypeContext, rows))
  }
  const assetPopulationDrift = clone(assetRows)
  assetPopulationDrift.pop()
  await reject("asset population drift", () => validateAssets(record, prototypeContext, assetPopulationDrift))

  await mutateRecord("selection drift", (value) => {
    value.decision.selectedTerritoryId = value.decision.selectedTerritoryId === "A" ? "B" : "A"
    if (value.canonical !== null) value.canonical.selectedTerritoryId = value.decision.selectedTerritoryId
  }, (value) => validateDecision(value, loadedReviews))
  if (record.canonical !== null) {
    await mutateRecord("canonical digest drift", (value) => { value.canonical.designSystem.sha256 = "0".repeat(64) }, (value) => validateCanonical(value, prototypeContext))
    const canonicalText = canonicalDesignSystemText(record.canonical.promotionContract)
    await reject("pre-existing Design System prose drift outside visual contract", () => validateCanonical(record, prototypeContext, `${canonicalText[0] === "#" ? "X" : "#"}${canonicalText.slice(1)}`))
    for (const key of PROHIBITED_PROMOTION_KEYS) await mutateRecord(`prohibited unresolved promotion key ${key}`, (value) => { value.canonical.promotionContract[key] = "promoted" }, (value) => assertSchemaInstance(schema, value))
    await mutateRecord("Home Start practice CTA promotion", (value) => { value.canonical.promotionContract.fixtureSemantics.homePrimaryAction = "canonical-Start-practice" }, (value) => assertSchemaInstance(schema, value))
    await mutateRecord("sources collapsed by default promotion", (value) => { value.canonical.promotionContract.fixtureSemantics.sourceProminence = "sources-collapsed-by-default" }, (value) => assertSchemaInstance(schema, value))
  }

  await reject("non-direct review-subject parent", () => assertReceiptOnlyDirectChildFacts(["subject", record.prototype.comparisonSourceSha, STEP2_MERGE_SHA], record.prototype.comparisonSourceSha, [{ status: "A", path: `${researchRoot}/browser-receipt.json` }], "adversarial subject"))
  await reject("extra source-to-subject diff", () => assertReceiptOnlyDirectChildFacts(["subject", record.prototype.comparisonSourceSha], record.prototype.comparisonSourceSha, [{ status: "A", path: `${researchRoot}/browser-receipt.json` }, { status: "M", path: `${researchRoot}/prototype.css` }], "adversarial subject"))
  for (const [label, path] of [
    ["source already contains browser receipt", `${researchRoot}/browser-receipt.json`],
    ["source already contains evidence manifest", manifestPath],
    ["source already contains terminal report", reportPath],
    ["source already contains task receipt", taskReceiptPath],
    ["source already contains review output", REVIEW_OUTPUT_PATHS["consumer-trust-anti-ai-slop"]]
  ]) await reject(label, () => assertForbiddenPresence([path], "adversarial source"))
  await reject("evidence schema drift after subject", () => assertImmutableBytes(schemaBytes, Buffer.concat([schemaBytes, Buffer.from(" ")]), schemaPath))
  const validatorBytes = readBytes(`${researchRoot}/verify-research.mjs`)
  await reject("terminal validator drift after subject", () => assertImmutableBytes(validatorBytes, Buffer.concat([validatorBytes, Buffer.from(" ")]), `${researchRoot}/verify-research.mjs`))
  const acceptedDesignSystemBytes = bytesAt(STEP2_MERGE_SHA, "product/DESIGN_SYSTEM.md")
  await reject("review-subject Design System differs from accepted Step 2", () => assertImmutableBytes(acceptedDesignSystemBytes, Buffer.concat([acceptedDesignSystemBytes, Buffer.from(" ")]), "product/DESIGN_SYSTEM.md accepted-base equality"))
  const subjectNeutralTexts = {
    plan: decodeText(bytesAt(record.reviews.reviewSubjectSha, "plans/006-select-consumer-visual-system.md"), "adversarial subject plan"),
    plans: decodeText(bytesAt(record.reviews.reviewSubjectSha, "plans/README.md"), "adversarial subject plans index"),
    research: decodeText(bytesAt(record.reviews.reviewSubjectSha, "research/README.md"), "adversarial subject research index")
  }
  assertSelectionNeutralTextSet(subjectNeutralTexts, "adversarial neutral baseline")
  await reject("subject Plan injected selected territory", () => assertSelectionNeutralTextSet({ ...subjectNeutralTexts, plan: `${subjectNeutralTexts.plan.trimEnd()}\n\nselectedTerritoryId=A\n` }, "adversarial subject"))
  const selectedPlansIndex = subjectNeutralTexts.plans.split("\n").map((line) => line.startsWith("| 006 | Select a consumer visual system and route archetypes |") ? line.replace("IN PROGRESS", "DONE — Territory A selected") : line).join("\n")
  await reject("subject plans index injected DONE result", () => assertSelectionNeutralTextSet({ ...subjectNeutralTexts, plans: selectedPlansIndex }, "adversarial subject"))
  await reject("subject research index injected terminal evidence", () => assertSelectionNeutralTextSet({ ...subjectNeutralTexts, research: `${subjectNeutralTexts.research.trimEnd()}\n| [Plan 006](ui-ux/consumer-visual-system/README.md) | Accepted supporting evidence; Territory A selected |\n` }, "adversarial subject"))
  const actualTerminalChanges = diffNameStatus(record.reviews.reviewSubjectSha, "HEAD")
  const expectedTerminalPaths = record.canonical === null ? unresolvedTerminalRequiredPaths : TERMINAL_REQUIRED_PATHS
  await reject("extra terminal output path", () => assertTerminalOutputChanges([...actualTerminalChanges, { status: "A", path: `${researchRoot}/extra-terminal.txt` }], expectedTerminalPaths))
  const wrongTerminalStatus = clone(actualTerminalChanges)
  wrongTerminalStatus.find(({ path }) => path === manifestPath).status = "M"
  await reject("terminal output add/modify status drift", () => assertTerminalOutputChanges(wrongTerminalStatus, expectedTerminalPaths))
  await reject("dirty omitted source input", () => assertCleanStatus(` M ${researchRoot}/review-prompts/consumer-trust-anti-ai-slop.md\n`))
  await reject("custom base in terminal phase", () => assertExactBase(STEP2_SUBJECT_SHA, "all"))
  await reject("extra UTF-8 SVG in terminal scope", () => assert(STEP3_MUTABLE_SOURCE_PATHS.has(`${researchRoot}/extra-evidence.svg`), "extra evidence path rejected"))
  await reject("uncommitted canonical document", () => assertCleanStatus(" M product/DESIGN_SYSTEM.md\n"))
  await reject("untracked terminal manifest", () => assertCleanStatus(`?? ${manifestPath}\n`))
  await reject("fake human study claim", () => assertNoContradictoryClaimsOrPrivateData("Validated with 12 human participants.", "adversarial claim"))
  await reject("fake participant count claim", () => assertNoContradictoryClaimsOrPrivateData("participantCount=12", "adversarial claim"))
  await reject("fake user research completion claim", () => assertNoContradictoryClaimsOrPrivateData("User research completed.", "adversarial claim"))
  await reject("fake usability study completion claim", () => assertNoContradictoryClaimsOrPrivateData("Usability study completed.", "adversarial claim"))
  await reject("fake human study completion claim", () => assertNoContradictoryClaimsOrPrivateData("Human study was completed.", "adversarial claim"))
  await reject("fake human review completion claim", () => assertNoContradictoryClaimsOrPrivateData("Human review was completed.", "adversarial claim"))
  await reject("fake applicant interview claim", () => assertNoContradictoryClaimsOrPrivateData("We interviewed 12 applicants.", "adversarial claim"))
  await reject("fake human reviewer preference claim", () => assertNoContradictoryClaimsOrPrivateData("Human reviewers preferred A.", "adversarial claim"))
  await reject("fake participant feedback selection claim", () => assertNoContradictoryClaimsOrPrivateData("Participant feedback informed the selection.", "adversarial claim"))
  await reject("fake participant direct selection claim", () => assertNoContradictoryClaimsOrPrivateData("Participants selected Territory A.", "adversarial claim"))
  await reject("fake owner release approval claim", () => assertNoContradictoryClaimsOrPrivateData("Owner approved the release.", "adversarial claim"))
  await reject("fake production authorization receipt claim", () => assertNoContradictoryClaimsOrPrivateData("Production authorization received.", "adversarial claim"))
  await reject("fake human approval claim", () => assertNoContradictoryClaimsOrPrivateData("Human sign-off received.", "adversarial claim"))
  await reject("fake production authorization claim", () => assertNoContradictoryClaimsOrPrivateData("Approved for production.", "adversarial claim"))
  await reject("fake real-device claim", () => assertNoContradictoryClaimsOrPrivateData("Real-device testing passed.", "adversarial claim"))
  await reject("fake numbered real-device claim", () => assertNoContradictoryClaimsOrPrivateData("Tested on 3 real devices.", "adversarial claim"))
  await reject("fake exhaustive legal-state claim", () => assertNoContradictoryClaimsOrPrivateData("Exhaustive legal-state validation passed.", "adversarial claim"))
  await reject("fake full print claim", () => assertNoContradictoryClaimsOrPrivateData("Full print coverage completed.", "adversarial claim"))
  await reject("private applicant identifier", () => assertNoContradictoryClaimsOrPrivateData(["applicant", "Id=NYC-12345"].join(""), "adversarial private data"))
  await reject("private contact value", () => assertNoContradictoryClaimsOrPrivateData(["phone=212", "555", "0199"].join("-"), "adversarial private data"))
  await reject("private host locator", () => assertNoContradictoryClaimsOrPrivateData(["", "home", "private", "operator", "state.json"].join("/"), "adversarial private data"))
  await reject("private locator field", () => assertNoContradictoryClaimsOrPrivateData(["loc", "ator=operator-state"].join(""), "adversarial private data"))
  await reject("private device field", () => assertNoContradictoryClaimsOrPrivateData(["dev", "ice=workstation-7"].join(""), "adversarial private data"))
  await reject("non-loopback network value", () => assertNoContradictoryClaimsOrPrivateData(`network${`Origin=http://${[192, 168, 1, 7].join(".")}:4173`}`, "adversarial private data"))
  for (const negativeClaim of ["No human reviewers preferred A.", "No human review was completed.", "No participant feedback informed the selection.", "No participants selected Territory A.", "No owner approved the release.", "No production authorization was received.", "This is not user research.", "This is not exhaustive legal-state validation.", "This is not full print coverage.", "humanParticipantCount=0", "notHumanUsabilityTested=true"]) assertNoContradictoryClaimsOrPrivateData(negativeClaim, "truthful negative claim fixture")
  const descriptorMutation = clone(record.browser.file)
  descriptorMutation.sha256 = "0".repeat(64)
  await reject("descriptor bytes differ from HEAD:path", () => verifyDescriptor(descriptorMutation, descriptorMutation.path))
  assert(tests.length >= 100, "adversarial suite unexpectedly incomplete")
  return tests.length
}

const main = async () => {
  const { phase, base } = parseArguments(process.argv.slice(2))
  if (phase === "scope") {
    const changes = validateBranchScope(base)
    console.log(`Visual-system scope verified: ${changes.length} in-scope changed paths from ${base}.`)
    return
  }
  if (phase === "source") {
    validateBranchScope(base, { requireClean: true })
    assertSchemaIntegrity(readBytes(schemaPath))
    const sourceSha = runGit(["rev-parse", "HEAD"]).trim()
    const closure = validatePreReceiptSourceCommit(sourceSha, { requireHead: true })
    scanPortableText()
    process.stdout.write(`${JSON.stringify({
      schemaVersion: 1,
      receiptType: "plan-006-pre-receipt-source-closure",
      baseSha: STEP2_MERGE_SHA,
      ...closure
    }, null, 2)}\n`)
    return
  }
  if (phase === "subject" || phase === "render-prompts") {
    const subject = await validateSelectionNeutralSubject(base)
    if (phase === "render-prompts") {
      process.stdout.write(`${JSON.stringify({
        schemaVersion: 1,
        receiptType: "deterministic-review-prompt-render",
        reviewSubjectSha: subject.subjectSha,
        reviewSubjectTreeSha: subject.subjectTreeSha,
        prototypeBundleSha256: subject.prototypeBundleSha256,
        browserReceiptSha256: subject.browserReceiptSha256,
        prompts: subject.renderedPrompts
      }, null, 2)}\n`)
      return
    }
    console.log(`Visual-system review subject verified: ${subject.subjectSha} tree ${subject.subjectTreeSha}, bundle ${subject.prototypeBundleSha256}, browser ${subject.browserReceiptSha256}, ${subject.browserCases} browser cases, selection-neutral empty review ledger.`)
    return
  }
  if (phase === "all") validateBranchScope(base, { requireClean: true })
  const core = loadCore()
  const prototypeContext = await validatePrototype(core.record)
  if (phase === "territories") {
    console.log(`Visual-system territories verified: 3 territories, 7 archetypes, ${core.record.prototype.comparableFrameCount} comparable frames.`)
    return
  }
  const assetRows = await validateAssets(core.record, prototypeContext)
  const benchmarks = validateBenchmarks(core.record)
  if (phase === "assets") {
    console.log("Visual-system assets/benchmarks verified: 97 assets and 12 current source evaluations.")
    return
  }
  const { bytes: browserBytes, receipt: browserReceipt } = loadBrowserReceipt(core.record)
  const browserContext = await validateBrowser(core.record, prototypeContext, browserReceipt)
  if (phase === "all") validateFinalLifecycle(core.record, browserReceipt)
  const { loaded: loadedReviews, taskReceipt, prompts } = loadReviews(core.record)
  validateReviews(core.record, browserBytes, browserReceipt, loadedReviews, taskReceipt, prompts)
  if (phase === "reviews") {
    console.log("Visual-system reviews verified: 3 fixed Codex task receipts, 3 rubrics, 45 criterion scores; cryptographic task independence is not claimed.")
    return
  }
  const computed = validateDecision(core.record, loadedReviews)
  validateCanonical(core.record, prototypeContext)
  if (phase === "decision") {
    console.log(`Visual-system decision verified: ${computed.selected === null ? "unresolved" : `Territory ${computed.selected} selected by unique score`}.`)
    return
  }
  scanPortableText()
  const adversarialCount = await runAdversarial({ ...core, prototypeContext, assetRows, benchmarks, browserBytes, browserReceipt, browserContext, loadedReviews, taskReceipt, prompts })
  console.log(`Visual-system research verified: 3 territories, 7 archetypes, 12 representative frames covering 10 of 36 registry routes (not exhaustive legal-state validation), ${core.record.prototype.comparableFrameCount} comparable territory frames, 97 assets, 12 benchmarks, 3 unauthenticated Codex task receipt summaries, ${adversarialCount} adversarial rejections, ${computed.selected === null ? "no fabricated selection" : `Territory ${computed.selected} uniquely selected`}.`)
}

await main()
