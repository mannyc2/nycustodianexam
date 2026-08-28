import { createHash } from "node:crypto"
import { execFileSync, spawnSync } from "node:child_process"
import { readFileSync, statSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")
const researchRoot = "research/ui-ux/consumer-visual-system"
const manifestPath = `${researchRoot}/evidence-manifest.json`
const schemaPath = `${researchRoot}/evidence-manifest.schema.json`
const schemaProfile = "draft-2020-12-portable-subset-v1"
// Update this one value only after an intentional, reviewed schema change.
const expectedCanonicalSchemaSha256 = "740fc60685e313276e822cd3930054e0cbd73ff21ae8a4162f576fdae59b8951"

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
const RUBRIC_CRITERIA = Object.freeze({
  "consumer-trust-anti-ai-slop": [
    "legitimacy-and-boundary-clarity",
    "consumer-trust-signals",
    "anti-template-specificity",
    "visual-asset-integrity",
    "action-hierarchy-confidence"
  ],
  "accessibility-cognitive-load": [
    "information-hierarchy",
    "reading-and-scan-load",
    "interaction-and-focus",
    "reflow-and-presentation",
    "recovery-state-comprehension"
  ],
  "visual-component-coherence": [
    "territory-distinctness",
    "cross-archetype-coherence",
    "token-role-coherence",
    "component-state-coherence",
    "responsive-and-print-coherence"
  ]
})
const UNRESOLVED_DECISIONS = Object.freeze([
  "NAV-SHELL-BOUNDARY",
  "UNRESOLVED-SHORTEST-PRACTICE-PRIMARY",
  "UNRESOLVED-HOME-PRIMARY-CTA",
  "UNRESOLVED-EXACT-NAV-LABELS-GROUPING",
  "UNRESOLVED-D1-VS-D2",
  "UNRESOLVED-PRACTICE-TIMING",
  "UNRESOLVED-SOURCE-PROMINENCE"
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
const PROTOTYPE_PATHS = Object.freeze([
  `${researchRoot}/prototype.css`,
  `${researchRoot}/prototype.html`,
  `${researchRoot}/prototype.mjs`
])
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

const verifyDescriptor = (descriptor, expectedPath = null) => {
  exactKeys(descriptor, ["path", "bytes", "sha256"], `descriptor ${descriptor.path ?? "(missing)"}`)
  if (expectedPath !== null) assert(descriptor.path === expectedPath, `${expectedPath}: descriptor path mismatch`)
  assert(!descriptor.path.startsWith("/") && !descriptor.path.split("/").includes(".."), `${descriptor.path}: repository-relative path required`)
  assert(Number.isInteger(descriptor.bytes) && descriptor.bytes > 0, `${descriptor.path}: positive byte length required`)
  assert(sha256Pattern.test(descriptor.sha256), `${descriptor.path}: SHA-256 required`)
  const bytes = readBytes(descriptor.path)
  assert(bytes.byteLength === descriptor.bytes, `${descriptor.path}: byte length drift`)
  assert(sha256(bytes) === descriptor.sha256, `${descriptor.path}: SHA-256 drift`)
  return bytes
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
  assert(value.protocolId === "CODEX-ONLY-UIUX-V1", `${path}.protocolId drift`)
  if (hasOwn(value, "reviewMode")) assert(value.reviewMode === "codex-only", `${path}.reviewMode drift`)
  assert(value.humanEvidence === "none", `${path}.humanEvidence must be none`)
  assert(value.humanParticipantCount === 0, `${path}.humanParticipantCount must be zero`)
  assert(value.humanReviewRequired === false, `${path}.humanReviewRequired must be false`)
  assert(value.notHumanUsabilityTested === true, `${path}.notHumanUsabilityTested must be true`)
}

const validateSource = (record) => {
  validateHumanBoundary(record, "manifest")
  assert(record.status === "complete" && ["selected", "unresolved"].includes(record.decisionStatus), "manifest terminal status invalid")
  equal(record.source.unresolvedDecisionIds, UNRESOLVED_DECISIONS, "source.unresolvedDecisionIds")
  assert(record.source.acceptedStep2SubjectSha === STEP2_SUBJECT_SHA, "Step 2 subject SHA drift")
  assert(record.source.acceptedStep2MergeSha === STEP2_MERGE_SHA, "Step 2 merge SHA drift")
  assert(record.source.acceptedStep2TreeSha === STEP2_TREE_SHA, "Step 2 tree SHA drift")
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
  equal(record.source.promotions, expectedPromotions, "source.promotions")
  for (const promotion of expectedPromotions) {
    const mergeBytes = runGit(["show", `${STEP2_MERGE_SHA}:${promotion.path}`], null)
    assert(sha256(mergeBytes) === promotion.sha256, `${promotion.path}: accepted merge content hash drift`)
    assert(sha256(readBytes(promotion.path)) === promotion.sha256, `${promotion.path}: working content drift from accepted closure`)
    const text = readText(promotion.path)
    assert(text.includes(promotion.directionId), `${promotion.path}: accepted direction marker absent`)
  }
}

const validatePrototype = async (record) => {
  const prototype = record.prototype
  equal(prototype.territoryIds, TERRITORY_IDS, "prototype.territoryIds")
  equal(prototype.archetypes, EXPECTED_ARCHETYPES, "prototype.archetypes")
  assert(prototype.routeIdCount === 36 && EXPECTED_ROUTE_IDS.length === 36, "prototype route count must be 36")
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
  for (const key of differentiationKeys) unique(module.territories.map(({ differentiationAxes }) => differentiationAxes[key]), `territory differentiation ${key}`)
  assert(Array.isArray(module.sharedFrames) && module.sharedFrames.length >= 7, "prototype needs at least seven shared frames")
  const frameIds = module.sharedFrames.map(({ frameId }) => frameId)
  unique(frameIds, "prototype frame IDs")
  equal(prototype.frameIds, frameIds, "manifest/prototype frame IDs")
  assert(prototype.sharedFrameCount === frameIds.length, "prototype shared-frame count drift")
  assert(prototype.comparableFrameCount === frameIds.length * 3 && prototype.comparableFrameCount >= 21, "prototype comparable-frame count drift")
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

const parseAssetAudit = (text) => {
  const lines = text.trimEnd().split("\n")
  const header = "asset_type\tstable_id\topaque_asset_id\trevision\treview_surface\tvisual_mode\taspect_ratio\tbackground_mode\tdetail_density\tphone_legibility\tprint_legibility\tcrop_tolerance\tpermitted_contexts\tprohibited_contexts\tidentity_fit\tslop_flags\tdisposition\tnotes"
  assert(lines[0] === header, "asset-audit.tsv: exact header required")
  return lines.slice(1).map((line, index) => {
    const values = line.split("\t")
    assert(values.length === 18 && values.every((value) => value.length > 0), `asset-audit.tsv row ${index + 2}: eighteen populated columns required`)
    return Object.fromEntries(header.split("\t").map((key, column) => [key, values[column]]))
  })
}
const validateAssets = (record, prototypeContext, overrideRows = null) => {
  assert(record.assets.rowCount === 97, "asset manifest row count drift")
  equal(record.assets.kindCounts, { tool: 65, comparison: 14, scene: 18 }, "asset manifest kind counts")
  const bytes = verifyDescriptor(record.assets.file, `${researchRoot}/asset-audit.tsv`)
  const rows = overrideRows ?? parseAssetAudit(decodeText(bytes, record.assets.file.path))
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
  return rows
}

const validateBenchmarks = (record, override = null) => {
  assert(record.benchmarks.sourceCount === 12, "benchmark source count drift")
  equal(record.benchmarks.categoryCounts, Object.fromEntries(BENCHMARK_CATEGORIES.map((category) => [category, 3])), "benchmark category counts")
  const bytes = verifyDescriptor(record.benchmarks.file, `${researchRoot}/benchmark-sources.json`)
  const data = override ?? parseJsonStrict(decodeText(bytes, record.benchmarks.file.path), record.benchmarks.file.path)
  exactKeys(data, ["schemaVersion", "recordId", "protocolId", "reviewMode", "evidenceClass", "humanEvidence", "humanParticipantCount", "humanReviewRequired", "notHumanUsabilityTested", "observedAt", "sourceCount", "categoryCounts", "evidenceBoundary", "retainedThirdPartyBytes", "sources"], "benchmark-sources.json")
  assert(data.schemaVersion === "1.0.0" && data.recordId === "plan-006-benchmark-sources-2026-08-28" && data.protocolId === "CODEX-ONLY-UIUX-V1" && data.reviewMode === "CODEX-ONLY" && data.evidenceClass === "nonhuman-desk-observation", "benchmark record identity drift")
  assert(data.humanEvidence === "none" && data.humanParticipantCount === 0 && data.humanReviewRequired === false && data.notHumanUsabilityTested === true, "benchmark record cannot claim human evidence")
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
const validateBrowser = (record, prototypeContext, receipt) => {
  exactKeys(receipt, ["schemaVersion", "receiptId", "protocolId", "status", "sourceSha", "prototypeBundleSha256", "prototypeFiles", "harnessFiles", "startedAt", "completedAt", "browserProjects", "presentations", "cases", "screenshotBytesRetained"], "browser receipt")
  assert(receipt.schemaVersion === 1 && receipt.receiptId === "plan-006-browser-evidence" && receipt.protocolId === "CODEX-ONLY-UIUX-V1" && receipt.status === "passed", "browser receipt identity/status drift")
  assert(receipt.sourceSha === record.prototype.comparisonSourceSha && receipt.prototypeBundleSha256 === record.prototype.bundleSha256, "browser receipt source/prototype join drift")
  equal(receipt.prototypeFiles, record.prototype.files, "browser/prototype file descriptors")
  assert(Array.isArray(receipt.harnessFiles) && receipt.harnessFiles.length >= 3, "browser receipt requires at least three harness files")
  unique(receipt.harnessFiles.map(({ path }) => path), "browser harness paths")
  for (const descriptor of receipt.harnessFiles) verifyDescriptor(descriptor)
  assert(isDateTime(receipt.startedAt) && isDateTime(receipt.completedAt) && Date.parse(receipt.startedAt) <= Date.parse(receipt.completedAt), "browser receipt interval invalid")
  const comparisonCommittedAt = Date.parse(runGit(["show", "-s", "--format=%cI", record.prototype.comparisonSourceSha]).trim())
  assert(comparisonCommittedAt <= Date.parse(receipt.startedAt), "browser receipt predates immutable comparison source")
  equal(receipt.browserProjects, BROWSER_PROJECTS, "browser project coverage")
  equal(receipt.presentations, PRESENTATIONS, "browser presentation coverage")
  assert(receipt.screenshotBytesRetained === false, "browser receipt may not retain screenshot bytes")
  assert(Array.isArray(receipt.cases) && receipt.cases.length >= 36, "browser receipt needs at least one default case per territory/frame")
  assert(record.browser.caseCount === receipt.cases.length, "browser case-count join drift")
  unique(receipt.cases.map(({ caseId }) => caseId), "browser case IDs")
  const expectedArchetypeByFrame = Object.fromEntries(prototypeContext.module.sharedFrames.map(({ frameId, archetypeId }) => [frameId, archetypeId]))
  for (const browserCase of receipt.cases) {
    exactKeys(browserCase, ["caseId", "territoryId", "frameId", "archetypeId", "presentation", "browserProject", "httpResult", "externalOriginCount", "scrollWidth", "clientWidth", "seriousAxeViolationCount", "keyboardFocusVisible", "actionTargetMinimumCssPx", "semanticSha256", "capturedAt"], `browser case ${browserCase.caseId}`)
    assert(TERRITORY_IDS.includes(browserCase.territoryId), `browser case ${browserCase.caseId}: territory invalid`)
    assert(record.prototype.frameIds.includes(browserCase.frameId), `browser case ${browserCase.caseId}: frame invalid`)
    assert(browserCase.archetypeId === expectedArchetypeByFrame[browserCase.frameId], `browser case ${browserCase.caseId}: archetype drift`)
    assert(PRESENTATIONS.includes(browserCase.presentation) && BROWSER_PROJECTS.includes(browserCase.browserProject), `browser case ${browserCase.caseId}: presentation/browser invalid`)
    assert(browserCase.httpResult === 200 && browserCase.externalOriginCount === 0, `browser case ${browserCase.caseId}: loopback HTTP/network failure`)
    assert(Number.isInteger(browserCase.scrollWidth) && Number.isInteger(browserCase.clientWidth) && browserCase.scrollWidth <= browserCase.clientWidth, `browser case ${browserCase.caseId}: horizontal overflow`)
    assert(browserCase.seriousAxeViolationCount === 0, `browser case ${browserCase.caseId}: serious/critical axe finding`)
    if (browserCase.presentation === "print") {
      assert(browserCase.keyboardFocusVisible === false && browserCase.actionTargetMinimumCssPx === 0, `browser case ${browserCase.caseId}: print must suppress interactive actions`)
    } else {
      assert(browserCase.keyboardFocusVisible === true && browserCase.actionTargetMinimumCssPx >= 44, `browser case ${browserCase.caseId}: focus/target contract failure`)
    }
    assert(sha256Pattern.test(browserCase.semanticSha256), `browser case ${browserCase.caseId}: semantic digest invalid`)
    assert(isDateTime(browserCase.capturedAt) && Date.parse(browserCase.capturedAt) >= Date.parse(receipt.startedAt) && Date.parse(browserCase.capturedAt) <= Date.parse(receipt.completedAt), `browser case ${browserCase.caseId}: timestamp outside receipt interval`)
  }
  for (const territoryId of TERRITORY_IDS) {
    for (const frameId of record.prototype.frameIds) assert(receipt.cases.some((entry) => entry.territoryId === territoryId && entry.frameId === frameId && entry.presentation === "default" && entry.browserProject === "chromium"), `browser receipt missing chromium/default ${territoryId}/${frameId}`)
    for (const presentation of PRESENTATIONS) assert(receipt.cases.some((entry) => entry.territoryId === territoryId && entry.presentation === presentation), `browser receipt missing ${territoryId}/${presentation}`)
    for (const browserProject of BROWSER_PROJECTS) assert(receipt.cases.some((entry) => entry.territoryId === territoryId && entry.browserProject === browserProject), `browser receipt missing ${territoryId}/${browserProject}`)
  }
  for (const frameId of record.prototype.frameIds) {
    const digests = TERRITORY_IDS.map((territoryId) => receipt.cases.find((entry) => entry.territoryId === territoryId && entry.frameId === frameId && entry.presentation === "default" && entry.browserProject === "chromium")?.semanticSha256)
    assert(new Set(digests).size === 1, `browser semantic parity drift for ${frameId}`)
  }
  assert(record.browser.semanticParity === true, "browser semantic-parity manifest flag must be true")
}

const loadReviews = (record) => {
  assert(record.reviews.reviewCount === 3 && record.reviews.files.length === 3, "exactly three review files required")
  equal(record.reviews.requiredRubricIds, RUBRIC_IDS, "required rubric IDs")
  const loaded = record.reviews.files.map((descriptor) => {
    exactKeys(descriptor, ["path", "bytes", "sha256", "agentTaskId", "rubricId"], `review descriptor ${descriptor.path}`)
    assert(descriptor.path.startsWith(`${researchRoot}/reviews/`) && descriptor.path.endsWith(".json"), `${descriptor.path}: review path invalid`)
    const bytes = readBytes(descriptor.path)
    assert(bytes.byteLength === descriptor.bytes && sha256(bytes) === descriptor.sha256, `${descriptor.path}: review descriptor drift`)
    return { descriptor, bytes, review: parseJsonStrict(decodeText(bytes, descriptor.path), descriptor.path) }
  })
  return loaded
}
const validateEvidenceCoordinates = (coordinates, path) => {
  assert(Array.isArray(coordinates) && coordinates.length >= 1, `${path}: evidence coordinates required`)
  unique(coordinates, path)
  for (const coordinate of coordinates) assert(typeof coordinate === "string" && /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[^\r\n\0]+#[^\r\n\0]+$/u.test(coordinate), `${path}: repository-relative path#anchor coordinate required`)
}
const validateReviews = (record, browserBytes, browserReceipt, loadedReviews) => {
  unique(record.reviews.files.map(({ agentTaskId }) => agentTaskId), "review descriptor agent task IDs")
  unique(record.reviews.files.map(({ rubricId }) => rubricId), "review descriptor rubric IDs")
  equal(record.reviews.files.map(({ rubricId }) => rubricId).sort(), [...RUBRIC_IDS].sort(), "review descriptor rubric closure")
  const browserHash = sha256(browserBytes)
  for (const { descriptor, review } of loadedReviews) {
    exactKeys(review, ["schemaVersion", "receiptId", "protocolId", "evidenceClass", "humanEvidence", "humanParticipantCount", "humanReviewRequired", "notHumanUsabilityTested", "agentTaskId", "rubricId", "independentReview", "crossReviewOutputsReadBeforeSubmission", "acceptedStep2SubjectSha", "acceptedStep2MergeSha", "comparisonSourceSha", "prototypeBundleSha256", "prototypeFiles", "browserReceiptSha256", "rubricCriteria", "reviewedAt", "territoryScores", "recommendationTerritoryId", "consensusPosition", "dissent"], `review ${descriptor.path}`)
    assert(review.schemaVersion === 1 && review.receiptId === `plan-006-${review.rubricId}-review`, `${descriptor.path}: review identity drift`)
    validateHumanBoundary(review, descriptor.path)
    assert(review.evidenceClass === "nonhuman-codex-review-not-user-research", `${descriptor.path}: evidence class drift`)
    assert(review.agentTaskId === descriptor.agentTaskId && review.rubricId === descriptor.rubricId, `${descriptor.path}: descriptor identity join drift`)
    assert(review.independentReview === true && review.crossReviewOutputsReadBeforeSubmission === false, `${descriptor.path}: independence contract failure`)
    assert(review.acceptedStep2SubjectSha === STEP2_SUBJECT_SHA && review.acceptedStep2MergeSha === STEP2_MERGE_SHA, `${descriptor.path}: Step 2 SHA drift`)
    assert(review.comparisonSourceSha === record.prototype.comparisonSourceSha && review.prototypeBundleSha256 === record.prototype.bundleSha256, `${descriptor.path}: comparison-source/prototype hash drift`)
    equal(review.prototypeFiles, record.prototype.files, `${descriptor.path}: prototype file descriptors`)
    assert(review.browserReceiptSha256 === browserHash, `${descriptor.path}: browser receipt hash join drift`)
    equal(review.rubricCriteria, RUBRIC_CRITERIA[review.rubricId], `${descriptor.path}: rubric criteria`)
    assert(isDateTime(review.reviewedAt) && Date.parse(review.reviewedAt) >= Date.parse(browserReceipt.completedAt), `${descriptor.path}: review must follow browser receipt`)
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
        validateEvidenceCoordinates(criterion.evidenceCoordinates, `${descriptor.path}/${territory.territoryId}/${criterion.criterionId}.evidenceCoordinates`)
      }
      assert(territory.total === territory.criterionScores.reduce((sum, { score }) => sum + score, 0), `${descriptor.path}/${territory.territoryId}: total drift`)
      assert(Array.isArray(territory.blockingFindings), `${descriptor.path}/${territory.territoryId}: blockingFindings array required`)
      for (const [index, finding] of territory.blockingFindings.entries()) {
        exactKeys(finding, ["finding", "evidenceCoordinates"], `${descriptor.path}/${territory.territoryId}.blockingFindings/${index}`)
        assert(typeof finding.finding === "string" && finding.finding.trim().length >= 8, `${descriptor.path}: blocking finding not populated`)
        validateEvidenceCoordinates(finding.evidenceCoordinates, `${descriptor.path}: blocking finding coordinates`)
      }
    }
    assert(review.recommendationTerritoryId === null || TERRITORY_IDS.includes(review.recommendationTerritoryId), `${descriptor.path}: recommendation invalid`)
    assert(["supports-deterministic-selection", "cannot-support-selection"].includes(review.consensusPosition), `${descriptor.path}: consensus position invalid`)
    assert(Array.isArray(review.dissent), `${descriptor.path}: dissent array required`)
    for (const [index, dissent] of review.dissent.entries()) {
      exactKeys(dissent, ["territoryId", "reason", "evidenceCoordinates"], `${descriptor.path}.dissent/${index}`)
      assert(TERRITORY_IDS.includes(dissent.territoryId) && typeof dissent.reason === "string" && dissent.reason.trim().length >= 8, `${descriptor.path}: dissent invalid`)
      validateEvidenceCoordinates(dissent.evidenceCoordinates, `${descriptor.path}: dissent coordinates`)
    }
  }
  unique(loadedReviews.map(({ review }) => review.agentTaskId), "review agent task IDs")
  unique(loadedReviews.map(({ review }) => review.rubricId), "review rubric IDs")
  equal(loadedReviews.map(({ review }) => review.rubricId).sort(), [...RUBRIC_IDS].sort(), "review rubric closure")
}

const recomputeDecision = (loadedReviews) => {
  const totals = Object.fromEntries(TERRITORY_IDS.map((territoryId) => [territoryId, loadedReviews.reduce((sum, { review }) => sum + review.territoryScores.find((entry) => entry.territoryId === territoryId).total, 0)]))
  const blocked = Object.fromEntries(TERRITORY_IDS.map((territoryId) => [territoryId, loadedReviews.flatMap(({ review }) => review.territoryScores.find((entry) => entry.territoryId === territoryId).blockingFindings).length]))
  const dissent = loadedReviews.flatMap(({ review }) => review.dissent.map((entry) => ({ agentTaskId: review.agentTaskId, ...entry })))
  const eligible = TERRITORY_IDS.filter((territoryId) => blocked[territoryId] === 0)
  const maximum = eligible.length === 0 ? null : Math.max(...eligible.map((territoryId) => totals[territoryId]))
  const winners = maximum === null ? [] : eligible.filter((territoryId) => totals[territoryId] === maximum)
  const lanesSupport = loadedReviews.every(({ review }) => review.consensusPosition === "supports-deterministic-selection")
  const selected = winners.length === 1 && dissent.length === 0 && lanesSupport ? winners[0] : null
  return { totals, blocked, blockerCount: Object.values(blocked).reduce((sum, value) => sum + value, 0), dissent, eligible, winners, selected }
}
const validateDecision = (record, loadedReviews) => {
  const computed = recomputeDecision(loadedReviews)
  assert(record.decision.ruleId === "sum-15-unweighted-criterion-scores-unique-highest-v1" && record.decision.criteriaPerTerritoryPerReview === 5, "decision rule drift")
  equal(record.decision.totals, computed.totals, "decision totals")
  equal(record.decision.eligibleTerritoryIds, computed.eligible, "decision eligible territories")
  assert(record.decision.blockerCount === computed.blockerCount, "decision blocker count drift")
  equal(record.decision.dissent, computed.dissent, "decision dissent join")
  assert(record.decision.selectedTerritoryId === computed.selected, "decision selection drift from deterministic rule")
  if (computed.selected !== null) {
    assert(record.decisionStatus === "selected", "unique supported winner requires selected decision status")
    assert(record.decision.consensusStatus === "unique-winner-no-dissent", "selected decision consensus status drift")
    assert(record.decision.blockerCount === 0 && record.decision.dissent.length === 0, "selection cannot coexist with blockers or dissent")
    assert(record.canonical !== null && record.canonical.selectedTerritoryId === computed.selected, "selection requires matching canonical promotion")
  } else {
    assert(record.decisionStatus === "unresolved" && record.decision.consensusStatus === "unresolved-tie-dissent-or-blocker", "unsupported/nonunique result must remain unresolved")
    assert(record.decision.selectedTerritoryId === null && record.canonical === null, "unresolved decision cannot promote a canonical territory")
  }
  return computed
}

const validateCanonical = (record, prototypeContext) => {
  if (record.canonical === null) {
    const plans = readText("plans/README.md")
    assert(!/^\| 006 \|.*\| DONE(?:\s|—|\|)/mu.test(plans), "unresolved Plan 006 cannot be DONE")
    return
  }
  const selected = record.decision.selectedTerritoryId
  assert(record.canonical.selectedTerritoryId === selected, "canonical selected territory drift")
  const descriptors = [
    [record.canonical.designSystem, "product/DESIGN_SYSTEM.md"],
    [record.canonical.plansIndex, "plans/README.md"],
    [record.canonical.researchIndex, "research/README.md"]
  ]
  for (const [descriptor, path] of descriptors) verifyDescriptor(descriptor, path)
  const designSystem = readText("product/DESIGN_SYSTEM.md")
  assert((designSystem.match(/<!-- consumer-visual-system:start -->/gu) ?? []).length === 1 && (designSystem.match(/<!-- consumer-visual-system:end -->/gu) ?? []).length === 1, "DESIGN_SYSTEM consumer visual-system markers must be unique")
  for (const literal of [`"protocolId": "CODEX-ONLY-UIUX-V1"`, `"selectedTerritoryId": "${selected}"`, STEP2_SUBJECT_SHA, STEP2_MERGE_SHA, record.prototype.bundleSha256, "notHumanUsabilityTested"]) assert(designSystem.includes(literal), `DESIGN_SYSTEM selected contract missing ${literal}`)
  const selectedTerritory = prototypeContext.module.territories.find(({ territoryId }) => territoryId === selected)
  assert(selectedTerritory !== undefined && designSystem.includes(selectedTerritory.name), "DESIGN_SYSTEM selected territory name drift")
  for (const [role, value] of Object.entries(selectedTerritory.tokens)) assert(designSystem.includes(role) && designSystem.includes(value), `DESIGN_SYSTEM selected token missing ${role}`)
  const plans = readText("plans/README.md")
  const planRow = plans.split("\n").find((line) => line.startsWith("| 006 |"))
  assert(planRow !== undefined && planRow.includes("DONE") && planRow.includes("CODEX-ONLY") && planRow.includes("NOT HUMAN-USABILITY-TESTED") && planRow.includes(`Territory ${selected}`), "plans/README Plan 006 terminal row drift")
  const researchIndex = readText("research/README.md")
  const matchingRows = researchIndex.split("\n").filter((line) => line.includes("ui-ux/consumer-visual-system/README.md") && line.includes("Accepted supporting evidence") && line.includes("product/DESIGN_SYSTEM.md"))
  assert(matchingRows.length === 1 && matchingRows[0].includes(`Territory ${selected}`), "research index selected-evidence row drift")
  const report = readText(`${researchRoot}/README.md`)
  for (const literal of ["CODEX-ONLY-UIUX-V1", "humanEvidence=none", "humanParticipantCount=0", "notHumanUsabilityTested=true", `Territory ${selected}`, record.prototype.bundleSha256, ...record.reviews.files.map(({ agentTaskId }) => agentTaskId)]) assert(report.includes(literal), `research report missing ${literal}`)
}

const scanPortableText = () => {
  const paths = runGit(["ls-files", "--cached", "--others", "--exclude-standard", "--", researchRoot]).trim().split("\n").filter(Boolean)
  for (const path of paths) {
    assert(!/\.(?:png|jpe?g|webp|gif|zip|pdf)$/iu.test(path), `${path}: binary/screenshot/archive evidence forbidden in Plan 006 research packet`)
    const text = readText(path)
    assert(!/(?:^|["'`\s])\/home\/[^\s"'`]+/mu.test(text), `${path}: private host locator forbidden`)
  }
}

const allowedScopePath = (path) => [
  "plans/006-consumer-visual-system-prework.md",
  "plans/006-consumer-visual-system-prework.schema.json",
  "plans/validate-006-consumer-visual-system-prework.mjs",
  "plans/006-select-consumer-visual-system.md",
  "plans/README.md",
  "product/DESIGN_SYSTEM.md",
  "research/README.md"
].includes(path) || path.startsWith(`${researchRoot}/`)
const validateScope = (base) => {
  assert(shaPattern.test(base), "--base must be a full forty-character SHA")
  assert(gitSucceeds(["cat-file", "-e", `${base}^{commit}`]), "scope base commit unavailable")
  assert(gitSucceeds(["merge-base", "--is-ancestor", base, "HEAD"]), "scope base is not an ancestor of HEAD")
  const sets = [
    runGit(["diff", "--name-only", `${base}...HEAD`]),
    runGit(["diff", "--name-only"]),
    runGit(["diff", "--cached", "--name-only"]),
    runGit(["ls-files", "--others", "--exclude-standard"])
  ]
  const paths = [...new Set(sets.flatMap((value) => value.trim().split("\n").filter(Boolean)))]
  for (const path of paths) assert(allowedScopePath(path), `scope: unauthorized path ${path}`)
  return paths
}

const parseArguments = (arguments_) => {
  let phase = "all"
  let base = STEP2_MERGE_SHA
  for (const argument of arguments_) {
    if (argument.startsWith("--phase=")) phase = argument.slice("--phase=".length)
    else if (argument.startsWith("--base=")) base = argument.slice("--base=".length)
    else fail("usage: node research/ui-ux/consumer-visual-system/verify-research.mjs [--phase=all|territories|assets|reviews|decision|scope] [--base=FULL_SHA]")
  }
  assert(["all", "territories", "assets", "reviews", "decision", "scope"].includes(phase), `unknown phase ${phase}`)
  return { phase, base }
}

const loadCore = () => {
  const schemaBytes = readBytes(schemaPath)
  const schema = assertSchemaIntegrity(schemaBytes)
  const manifestText = readText(manifestPath)
  const record = parseJsonStrict(manifestText, manifestPath)
  assertSchemaInstance(schema, record)
  validateSource(record)
  return { schemaBytes, schema, record }
}

const expectReject = (label, action) => {
  let rejected = false
  try { action() } catch { rejected = true }
  assert(rejected, `adversarial test did not reject: ${label}`)
}
const runAdversarial = ({ schemaBytes, schema, record, prototypeContext, assetRows, benchmarks, browserBytes, browserReceipt, loadedReviews }) => {
  const tests = []
  const reject = (label, action) => { tests.push(label); expectReject(label, action) }
  const schemaText = decoder.decode(schemaBytes)
  const schemaWeakening = [
    ["schema participant weakening", '"humanParticipantCount": { "const": 0 }', '"humanParticipantCount": { "type": "integer" }'],
    ["schema approval weakening", '"humanReviewRequired": { "const": false }', '"humanReviewRequired": { "type": "boolean" }'],
    ["schema selection weakening", '"consensusStatus": { "enum": ["unique-winner-no-dissent", "unresolved-tie-dissent-or-blocker"] }', '"consensusStatus": { "type": "string" }'],
    ["schema DONE weakening", '"status": { "const": "complete" }', '"status": { "enum": ["complete", "DONE"] }'],
    ["schema dependency weakening", '"acceptedStep2SubjectSha": { "const": "4130693dee6caaa804a116f490b2192861f53e6e" }', '"acceptedStep2SubjectSha": { "$ref": "#/$defs/sha1" }'],
    ["schema render weakening", '"comparableFrameCount": { "type": "integer", "minimum": 21 }', '"comparableFrameCount": { "type": "integer", "minimum": 0 }']
  ]
  for (const [label, from, to] of schemaWeakening) {
    assert(schemaText.includes(from), `${label}: mutation anchor absent`)
    reject(label, () => assertSchemaIntegrity(Buffer.from(schemaText.replace(from, to))))
  }
  const mutateRecord = (label, mutation, action = (mutated) => { assertSchemaInstance(schema, mutated); validateSource(mutated) }) => {
    const mutated = clone(record)
    mutation(mutated)
    reject(label, () => action(mutated))
  }
  mutateRecord("instance human evidence substitution", (value) => { value.humanEvidence = "participants" })
  mutateRecord("instance participant substitution", (value) => { value.humanParticipantCount = 1 })
  mutateRecord("instance approval substitution", (value) => { value.approvalEvidence = "approved" }, (value) => assertSchemaInstance(schema, value))
  mutateRecord("instance human-review substitution", (value) => { value.humanReviewRequired = true })
  mutateRecord("instance DONE state", (value) => { value.status = "DONE" }, (value) => assertSchemaInstance(schema, value))
  mutateRecord("instance dependency drift", (value) => { value.source.acceptedStep2MergeSha = STEP2_SUBJECT_SHA })
  mutateRecord("instance render count weakening", (value) => { value.prototype.comparableFrameCount = 0 }, (value) => assertSchemaInstance(schema, value))
  mutateRecord("prototype hash drift", (value) => { value.prototype.bundleSha256 = "0".repeat(64) }, (value) => assert(prototypeBundleSha256(value.prototype.files) === value.prototype.bundleSha256, "prototype bundle drift"))
  mutateRecord("route inventory drift", (value) => { value.prototype.archetypes[0].routeIds.pop() }, (value) => equal(value.prototype.archetypes, EXPECTED_ARCHETYPES, "prototype route inventory"))
  mutateRecord("frame inventory drift", (value) => { value.prototype.frameIds.pop(); value.prototype.sharedFrameCount -= 1; value.prototype.comparableFrameCount -= 3 }, (value) => equal(value.prototype.frameIds, prototypeContext.module.sharedFrames.map(({ frameId }) => frameId), "prototype frame inventory"))

  const duplicatedReviews = clone(loadedReviews)
  duplicatedReviews[1].review.agentTaskId = duplicatedReviews[0].review.agentTaskId
  reject("review task duplication", () => validateReviews(record, browserBytes, browserReceipt, duplicatedReviews))
  const totalDriftReviews = clone(loadedReviews)
  totalDriftReviews[0].review.territoryScores[0].total += 1
  reject("review score total drift", () => validateReviews(record, browserBytes, browserReceipt, totalDriftReviews))
  const receiptDriftReviews = clone(loadedReviews)
  receiptDriftReviews[0].review.browserReceiptSha256 = "0".repeat(64)
  reject("review receipt hash drift", () => validateReviews(record, browserBytes, browserReceipt, receiptDriftReviews))
  const dissentReviews = clone(loadedReviews)
  dissentReviews[0].review.dissent.push({ territoryId: "A", reason: "Adversarial unresolved concern", evidenceCoordinates: [`${researchRoot}/prototype.html#prototype-root`] })
  reject("dissent hidden by selected decision", () => validateDecision(record, dissentReviews))
  const blockerReviews = clone(loadedReviews)
  blockerReviews[0].review.territoryScores[0].blockingFindings.push({ finding: "Adversarial blocking finding", evidenceCoordinates: [`${researchRoot}/prototype.html#prototype-root`] })
  reject("blocker hidden by selected decision", () => validateDecision(record, blockerReviews))
  const tieReviews = clone(loadedReviews)
  for (const loaded of tieReviews) {
    const first = loaded.review.territoryScores[0]
    const second = loaded.review.territoryScores[1]
    second.criterionScores = clone(first.criterionScores)
    second.total = first.total
  }
  reject("nonunique score tie selected", () => validateDecision(record, tieReviews))

  const semanticReceipt = clone(browserReceipt)
  const semanticCase = semanticReceipt.cases.find((entry) => entry.territoryId === "B" && entry.presentation === "default" && entry.browserProject === "chromium")
  semanticCase.semanticSha256 = semanticCase.semanticSha256 === "0".repeat(64) ? "1".repeat(64) : "0".repeat(64)
  reject("semantic parity drift", () => validateBrowser(record, prototypeContext, semanticReceipt))
  const benchmarkDrift = clone(benchmarks)
  benchmarkDrift.sources.pop()
  reject("benchmark population drift", () => validateBenchmarks(record, benchmarkDrift))
  const assetDrift = clone(assetRows)
  assetDrift.pop()
  reject("asset population drift", () => validateAssets(record, prototypeContext, assetDrift))
  mutateRecord("selection drift", (value) => {
    value.decision.selectedTerritoryId = value.decision.selectedTerritoryId === "A" ? "B" : "A"
    if (value.canonical !== null) value.canonical.selectedTerritoryId = value.decision.selectedTerritoryId
  }, (value) => validateDecision(value, loadedReviews))
  if (record.canonical !== null) mutateRecord("canonical digest drift", (value) => { value.canonical.designSystem.sha256 = "0".repeat(64) }, (value) => validateCanonical(value, prototypeContext))
  assert(tests.length >= 22, "adversarial suite unexpectedly incomplete")
  return tests.length
}

const main = async () => {
  const { phase, base } = parseArguments(process.argv.slice(2))
  if (phase === "scope") {
    const paths = validateScope(base)
    console.log(`Visual-system scope verified: ${paths.length} in-scope changed paths from ${base}.`)
    return
  }
  const core = loadCore()
  const prototypeContext = await validatePrototype(core.record)
  if (phase === "territories") {
    console.log(`Visual-system territories verified: 3 territories, 7 archetypes, ${core.record.prototype.comparableFrameCount} comparable frames.`)
    return
  }
  const assetRows = validateAssets(core.record, prototypeContext)
  const benchmarks = validateBenchmarks(core.record)
  if (phase === "assets") {
    console.log("Visual-system assets/benchmarks verified: 97 assets and 12 current source evaluations.")
    return
  }
  const { bytes: browserBytes, receipt: browserReceipt } = loadBrowserReceipt(core.record)
  validateBrowser(core.record, prototypeContext, browserReceipt)
  const loadedReviews = loadReviews(core.record)
  validateReviews(core.record, browserBytes, browserReceipt, loadedReviews)
  if (phase === "reviews") {
    console.log("Visual-system reviews verified: 3 independent Codex tasks, 3 rubrics, 45 criterion scores.")
    return
  }
  const computed = validateDecision(core.record, loadedReviews)
  validateCanonical(core.record, prototypeContext)
  if (phase === "decision") {
    console.log(`Visual-system decision verified: ${computed.selected === null ? "unresolved" : `Territory ${computed.selected} selected by unique score`}.`)
    return
  }
  scanPortableText()
  validateScope(base)
  const adversarialCount = runAdversarial({ ...core, prototypeContext, assetRows, benchmarks, browserBytes, browserReceipt, loadedReviews })
  console.log(`Visual-system research verified: 3 territories, 7 archetypes, 36 routes, ${core.record.prototype.comparableFrameCount} comparable frames, 97 assets, 12 benchmarks, 3 Codex reviews, ${adversarialCount} adversarial rejections, ${computed.selected === null ? "no fabricated selection" : `Territory ${computed.selected} uniquely selected`}.`)
}

await main()
