// artifact-label: {"status":"provisional-prework","participantEvidence":"none","decisionStatus":"pending","requiredDependencyShas":null,"mustRebaseAndReverify":true}
import { createHash } from "node:crypto"
import { execFileSync } from "node:child_process"
import { readFileSync, statSync } from "node:fs"
import { fileURLToPath } from "node:url"

export const ARTIFACT_LABEL = Object.freeze({
  status: "provisional-prework",
  participantEvidence: "none",
  decisionStatus: "pending",
  requiredDependencyShas: null,
  mustRebaseAndReverify: true
})

const repoRoot = fileURLToPath(new URL("../", import.meta.url))
const markdownPath = "plans/006-consumer-visual-system-prework.md"
const schemaPath = "plans/006-consumer-visual-system-prework.schema.json"
const validatorPath = "plans/validate-006-consumer-visual-system-prework.mjs"
const allowedPaths = [markdownPath, schemaPath, validatorPath]
const decoder = new TextDecoder("utf-8", { fatal: true })
const shaPattern = /^[0-9a-f]{40}$/
const sha256Pattern = /^[0-9a-f]{64}$/
const schemaProfile = "draft-2020-12-portable-subset-v1"
const expectedCanonicalSchemaSha256 = "56b73a2089110edff1aa2c3b278fa97eab057ac95c261e817883ae7f8d3417c3"

const parseArguments = (arguments_) => {
  if (arguments_.length === 0) return { attachmentPath: null }
  assert(arguments_.length === 2 && arguments_[0] === "--attachment" && arguments_[1].length > 0, "usage: node plans/validate-006-consumer-visual-system-prework.mjs [--attachment PATH]")
  return { attachmentPath: arguments_[1] }
}

const attachmentRows = [
  [".thumbnail", 26456, "32475ee6c16605a782be47285d21f0ec38fdabc9c89721af9ef323100a53c4ea", null, "generated-preview-thumbnail"],
  ["Component Library.dc.html", 139026, "ae2dc4402bbe4c584f86a0ffcad17d7e3d168fa48894f5597b3244ff664fd6f6", null, "old-component-library-html"],
  ["content/assets/derivatives/scenes/s003-phone.png", 260693, "4213808a50ec91260499d7e409d22211479cb071a5643e935aa98cb37d054171", "content/assets/derivatives/scenes/s003-phone.png", "canonical-derivative-copy"],
  ["content/assets/derivatives/scenes/s008-phone.png", 281712, "5c9baf1012aa80a741e45572e0a61486ae11b9608525759617a8b00f87149b2b", "content/assets/derivatives/scenes/s008-phone.png", "canonical-derivative-copy"],
  ["content/assets/derivatives/scenes/s009-phone.png", 277833, "b8ed8646a78b6e047f47c0750e859a13fa91e53a6a0a4b51d26d5a76acb019a6", "content/assets/derivatives/scenes/s009-phone.png", "canonical-derivative-copy"],
  ["content/assets/derivatives/tools/t001-phone.png", 84072, "20982817fe806bffa8da7e2cc06ce4f5caa85400da7a1412b07e55301177234f", "content/assets/derivatives/tools/t001-phone.png", "canonical-derivative-copy"],
  ["content/assets/derivatives/tools/t002-phone.png", 70428, "baba2e79d2ada171771ea355aa6a2be3ffe0c886434970869d121e8127acd3eb", "content/assets/derivatives/tools/t002-phone.png", "canonical-derivative-copy"],
  ["content/assets/derivatives/tools/t003-phone.png", 88826, "5511fcb6a43ac0c435e7405f4f77bfe19b67fc6c87a7f8af1bdbd5a211978e1f", "content/assets/derivatives/tools/t003-phone.png", "canonical-derivative-copy"],
  ["content/assets/derivatives/tools/t004-phone.png", 62971, "72667701c86604f67f79f7d6276922fafbe8b4222f6b3e1ed5ecd468b05195d6", "content/assets/derivatives/tools/t004-phone.png", "canonical-derivative-copy"],
  ["content/assets/derivatives/tools/t005-phone.png", 43561, "22e57a774aa6e324b12ddf80be3fea469d150a7837076d7323206350af878b7e", "content/assets/derivatives/tools/t005-phone.png", "canonical-derivative-copy"],
  ["content/assets/derivatives/tools/t006-phone.png", 74561, "c4d39cd0758b807af4bbe3ca997d0370b49f67476191a88f0b19084a63ddd5fb", "content/assets/derivatives/tools/t006-phone.png", "canonical-derivative-copy"],
  ["content/assets/derivatives/tools/t007-phone.png", 60587, "539e60f55898692a3e4379eb2da0a552b8b41d6cbff6b8e2f09a2acf7a7bb319", "content/assets/derivatives/tools/t007-phone.png", "canonical-derivative-copy"],
  ["content/assets/derivatives/tools/t008-phone.png", 54322, "ec7ce4b5bdfb020972eecebd7a3d384fe58fa518a58b4e3311c95aa4cce32be6", "content/assets/derivatives/tools/t008-phone.png", "canonical-derivative-copy"],
  ["github.md", 2186, "de84e5e8a3f1f70bbc106748a02512d56a8f014ec80edbc42c1fb06b0eaa5967", null, "old-baseline-metadata"],
  ["support.js", 69150, "8fe7df74405f3c55f49b7249c74ea1397e65d07dea2b1bd3b4a489bec2e28cbe", null, "old-renderer-runtime"]
]
const expectedAttachmentEntries = attachmentRows.map(([path, bytes, digest, canonicalRepoPath, contentKind]) => ({
  bytes,
  canonicalRepoPath,
  contentKind,
  path,
  rightsStatus: "unknown-attachment-rights-not-determined",
  sha256: digest,
  useStatus: canonicalRepoPath === null ? "evidence-only-do-not-copy-to-product-or-prototype" : "use-only-via-byte-identical-canonical-repo-derivative"
}))

const fail = (message) => {
  throw new Error(message)
}
const assert = (condition, message) => {
  if (!condition) fail(message)
}
const absolute = (path) => `${repoRoot}${path}`
const sha256 = (value) => createHash("sha256").update(value).digest("hex")
const readBytes = (path) => readFileSync(absolute(path))
const runUnzip = (attachmentPath, arguments_, encoding = null) => {
  try {
    return execFileSync("unzip", [...arguments_, attachmentPath], { encoding, maxBuffer: 2 * 1024 * 1024 })
  } catch {
    fail("explicit attachment recheck: archive operation failed")
  }
}
const readZipEntry = (attachmentPath, entryPath) => {
  try {
    return execFileSync("unzip", ["-p", attachmentPath, entryPath], { encoding: null, maxBuffer: 2 * 1024 * 1024 })
  } catch {
    fail("explicit attachment recheck: unable to read a ledger entry")
  }
}
const readText = (path) => {
  const bytes = readBytes(path)
  let text
  try {
    text = decoder.decode(bytes)
  } catch {
    fail(`${path}: invalid UTF-8`)
  }
  assert(!text.startsWith("\uFEFF"), `${path}: BOM is forbidden`)
  assert(!text.includes("\r"), `${path}: CR bytes are forbidden`)
  assert(!text.includes("\0"), `${path}: NUL bytes are forbidden`)
  assert(text.endsWith("\n"), `${path}: final LF required`)
  assert(!text.endsWith("\n\n"), `${path}: exactly one final LF required`)
  return text
}
const jsonClone = (value) => JSON.parse(JSON.stringify(value))
const sortDeep = (value) => {
  if (Array.isArray(value)) return value.map(sortDeep)
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortDeep(value[key])]))
  }
  return value
}
const stable = (value) => JSON.stringify(sortDeep(value))
const equal = (actual, expected, path) => {
  assert(stable(actual) === stable(expected), `${path}: value mismatch`)
}
const exactKeys = (value, keys, path) => {
  assert(value !== null && typeof value === "object" && !Array.isArray(value), `${path}: object required`)
  const actual = Object.keys(value).sort()
  const expected = [...keys].sort()
  assert(JSON.stringify(actual) === JSON.stringify(expected), `${path}: exact keys required; got ${actual.join(",")}`)
}
const unique = (values, path) => {
  assert(new Set(values).size === values.length, `${path}: duplicate value`)
}
const exactLabel = (value, path) => {
  exactKeys(value, ["status", "participantEvidence", "decisionStatus", "requiredDependencyShas", "mustRebaseAndReverify"], path)
  equal(value, ARTIFACT_LABEL, path)
}

// A small strict JSON parser keeps duplicate object keys observable. JSON.parse
// alone cannot distinguish a duplicate key from a last-write-wins object.
const parseJsonStrict = (text, path) => {
  let cursor = 0
  const whitespace = () => {
    while (/\s/.test(text[cursor] ?? "")) cursor += 1
  }
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
        return JSON.parse(text.slice(start, cursor))
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
      if (text.startsWith(token, cursor)) {
        cursor += token.length
        return value
      }
    }
    const match = text.slice(cursor).match(/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/)
    assert(match !== null, `${path}: JSON value expected at ${cursor}`)
    cursor += match[0].length
    return Number(match[0])
  }
  const parseObject = () => {
    cursor += 1
    whitespace()
    const result = Object.create(null)
    const keys = new Set()
    if (text[cursor] === "}") {
      cursor += 1
      return result
    }
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
      if (text[cursor] === "}") {
        cursor += 1
        return result
      }
      assert(text[cursor] === ",", `${path}: expected comma at ${cursor}`)
      cursor += 1
    }
  }
  const parseArray = () => {
    cursor += 1
    whitespace()
    const result = []
    if (text[cursor] === "]") {
      cursor += 1
      return result
    }
    while (true) {
      result.push(parseValue())
      whitespace()
      if (text[cursor] === "]") {
        cursor += 1
        return result
      }
      assert(text[cursor] === ",", `${path}: expected comma at ${cursor}`)
      cursor += 1
    }
  }
  const value = parseValue()
  whitespace()
  assert(cursor === text.length, `${path}: trailing JSON bytes at ${cursor}`)
  return value
}

// This is deliberately not advertised as a general JSON Schema implementation.
// It implements every Draft 2020-12 keyword used by this packet, rejects all
// other schema keywords, permits local JSON Pointer refs only, and treats the
// date-time format as an assertion. The schema's canonical digest below makes
// any otherwise-valid weakening an explicit validator change.
const supportedSchemaKeywords = new Set([
  "$schema", "$id", "$ref", "$defs", "title", "description", "type", "const", "enum",
  "required", "properties", "additionalProperties", "items", "minItems", "maxItems",
  "uniqueItems", "minLength", "pattern", "format", "minimum", "maximum", "oneOf"
])
const supportedJsonTypes = new Set(["object", "array", "string", "integer", "boolean", "null"])
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key)
const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value)
const schemaChildPath = (path, key) => `${path}/${String(key).replaceAll("~", "~0").replaceAll("/", "~1")}`

const resolveLocalRef = (rootSchema, reference, path) => {
  assert(typeof reference === "string" && reference.startsWith("#/"), `${path}: only non-root local JSON Pointer refs are supported by ${schemaProfile}`)
  let target = rootSchema
  for (const encoded of reference.slice(2).split("/")) {
    let key
    try { key = decodeURIComponent(encoded).replaceAll("~1", "/").replaceAll("~0", "~") } catch { fail(`${path}: invalid local ref encoding`) }
    assert(isObject(target) && hasOwn(target, key), `${path}: unresolved local ref ${reference}`)
    target = target[key]
  }
  assert(isObject(target), `${path}: local ref must resolve to an object schema`)
  return target
}

const validateSchemaNode = (node, path, rootSchema, root = false) => {
  assert(isObject(node), `${path}: ${schemaProfile} supports object schemas only`)
  for (const key of Object.keys(node)) {
    const customRootKeyword = root && (key === "x-artifactLabel" || key === "x-validationProfile")
    assert(supportedSchemaKeywords.has(key) || customRootKeyword, `${path}: unsupported schema keyword ${key}`)
    if (!root) assert(!["$schema", "$id"].includes(key), `${path}: ${key} is root-only in ${schemaProfile}`)
  }
  if (hasOwn(node, "$schema")) assert(node.$schema === "https://json-schema.org/draft/2020-12/schema", `${path}.$schema: Draft 2020-12 URI required`)
  if (hasOwn(node, "$id")) assert(typeof node.$id === "string" && node.$id.length > 0, `${path}.$id: nonempty string required`)
  for (const annotation of ["title", "description"]) if (hasOwn(node, annotation)) assert(typeof node[annotation] === "string", `${path}.${annotation}: string required`)
  if (hasOwn(node, "type")) assert(typeof node.type === "string" && supportedJsonTypes.has(node.type), `${path}.type: unsupported type or type union`)
  if (hasOwn(node, "$ref")) resolveLocalRef(rootSchema, node.$ref, `${path}.$ref`)
  if (hasOwn(node, "$defs")) {
    assert(isObject(node.$defs), `${path}.$defs: object required`)
    for (const [key, child] of Object.entries(node.$defs)) validateSchemaNode(child, schemaChildPath(`${path}/$defs`, key), rootSchema)
  }
  if (hasOwn(node, "properties")) {
    assert(isObject(node.properties), `${path}.properties: object required`)
    for (const [key, child] of Object.entries(node.properties)) validateSchemaNode(child, schemaChildPath(`${path}/properties`, key), rootSchema)
  }
  if (hasOwn(node, "required")) {
    assert(Array.isArray(node.required) && node.required.every((entry) => typeof entry === "string"), `${path}.required: string array required`)
    unique(node.required, `${path}.required`)
    assert(isObject(node.properties), `${path}.required: this profile requires sibling properties`)
    for (const key of node.required) assert(hasOwn(node.properties, key), `${path}.required: ${key} has no sibling property schema`)
  }
  if (hasOwn(node, "additionalProperties")) assert(typeof node.additionalProperties === "boolean", `${path}.additionalProperties: boolean required by ${schemaProfile}`)
  if (hasOwn(node, "items")) validateSchemaNode(node.items, `${path}/items`, rootSchema)
  if (hasOwn(node, "oneOf")) {
    assert(Array.isArray(node.oneOf) && node.oneOf.length > 0, `${path}.oneOf: nonempty schema array required`)
    node.oneOf.forEach((child, index) => validateSchemaNode(child, `${path}/oneOf/${index}`, rootSchema))
  }
  if (hasOwn(node, "enum")) {
    assert(Array.isArray(node.enum) && node.enum.length > 0, `${path}.enum: nonempty array required`)
    unique(node.enum.map(stable), `${path}.enum`)
  }
  for (const keyword of ["minItems", "maxItems", "minLength"]) {
    if (hasOwn(node, keyword)) assert(Number.isInteger(node[keyword]) && node[keyword] >= 0, `${path}.${keyword}: nonnegative integer required`)
  }
  for (const keyword of ["minimum", "maximum"]) {
    if (hasOwn(node, keyword)) assert(typeof node[keyword] === "number" && Number.isFinite(node[keyword]), `${path}.${keyword}: finite number required`)
  }
  if (hasOwn(node, "minItems") && hasOwn(node, "maxItems")) assert(node.minItems <= node.maxItems, `${path}: minItems exceeds maxItems`)
  if (hasOwn(node, "minimum") && hasOwn(node, "maximum")) assert(node.minimum <= node.maximum, `${path}: minimum exceeds maximum`)
  if (hasOwn(node, "uniqueItems")) assert(typeof node.uniqueItems === "boolean", `${path}.uniqueItems: boolean required`)
  if (hasOwn(node, "pattern")) {
    assert(typeof node.pattern === "string", `${path}.pattern: string required`)
    try { new RegExp(node.pattern, "u") } catch { fail(`${path}.pattern: invalid ECMAScript regular expression`) }
  }
  if (hasOwn(node, "format")) assert(node.format === "date-time", `${path}.format: only date-time is supported`)
}

const daysInMonth = (year, month) => {
  if (month === 2) return (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) ? 29 : 28
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}
const isRfc3339DateTime = (value) => {
  if (typeof value !== "string") return false
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:[Zz]|[+-](\d{2}):(\d{2}))$/)
  if (match === null) return false
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, offsetHourText, offsetMinuteText] = match
  const [year, month, day, hour, minute, second] = [yearText, monthText, dayText, hourText, minuteText, secondText].map(Number)
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month) || hour > 23 || minute > 59 || second > 60) return false
  if (offsetHourText !== undefined && (Number(offsetHourText) > 23 || Number(offsetMinuteText) > 59)) return false
  return true
}

const instanceTypeMatches = (value, type) => {
  if (type === "null") return value === null
  if (type === "array") return Array.isArray(value)
  if (type === "object") return isObject(value)
  if (type === "integer") return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value)
  return typeof value === type
}

const schemaInstanceErrors = (schemaNode, value, path, rootSchema, referenceStack = []) => {
  const errors = []
  if (hasOwn(schemaNode, "$ref")) {
    if (referenceStack.includes(schemaNode.$ref)) errors.push(`${path}: recursive refs are unsupported by ${schemaProfile}`)
    else errors.push(...schemaInstanceErrors(resolveLocalRef(rootSchema, schemaNode.$ref, `${path}.$ref`), value, path, rootSchema, [...referenceStack, schemaNode.$ref]))
  }
  if (hasOwn(schemaNode, "const") && stable(value) !== stable(schemaNode.const)) errors.push(`${path}: const mismatch`)
  if (hasOwn(schemaNode, "enum") && !schemaNode.enum.some((candidate) => stable(value) === stable(candidate))) errors.push(`${path}: enum mismatch`)
  let typeMatches = true
  if (hasOwn(schemaNode, "type")) {
    typeMatches = instanceTypeMatches(value, schemaNode.type)
    if (!typeMatches) errors.push(`${path}: expected ${schemaNode.type}`)
  }
  if (hasOwn(schemaNode, "oneOf")) {
    const matchingBranches = schemaNode.oneOf.filter((branch) => schemaInstanceErrors(branch, value, path, rootSchema, referenceStack).length === 0).length
    if (matchingBranches !== 1) errors.push(`${path}: oneOf matched ${matchingBranches} branches`)
  }
  if (typeMatches && isObject(value)) {
    if (hasOwn(schemaNode, "required")) for (const key of schemaNode.required) if (!hasOwn(value, key)) errors.push(`${schemaChildPath(path, key)}: required property missing`)
    if (hasOwn(schemaNode, "properties")) {
      for (const [key, child] of Object.entries(schemaNode.properties)) if (hasOwn(value, key)) errors.push(...schemaInstanceErrors(child, value[key], schemaChildPath(path, key), rootSchema, referenceStack))
      if (schemaNode.additionalProperties === false) for (const key of Object.keys(value)) if (!hasOwn(schemaNode.properties, key)) errors.push(`${schemaChildPath(path, key)}: additional property forbidden`)
    } else if (schemaNode.additionalProperties === false && Object.keys(value).length > 0) errors.push(`${path}: all properties forbidden`)
  }
  if (typeMatches && Array.isArray(value)) {
    if (hasOwn(schemaNode, "minItems") && value.length < schemaNode.minItems) errors.push(`${path}: fewer than minItems`)
    if (hasOwn(schemaNode, "maxItems") && value.length > schemaNode.maxItems) errors.push(`${path}: more than maxItems`)
    if (schemaNode.uniqueItems === true && new Set(value.map(stable)).size !== value.length) errors.push(`${path}: uniqueItems violated`)
    if (hasOwn(schemaNode, "items")) value.forEach((entry, index) => errors.push(...schemaInstanceErrors(schemaNode.items, entry, `${path}/${index}`, rootSchema, referenceStack)))
  }
  if (typeMatches && typeof value === "string") {
    if (hasOwn(schemaNode, "minLength") && [...value].length < schemaNode.minLength) errors.push(`${path}: shorter than minLength`)
    if (hasOwn(schemaNode, "pattern") && !new RegExp(schemaNode.pattern, "u").test(value)) errors.push(`${path}: pattern mismatch`)
    if (schemaNode.format === "date-time" && !isRfc3339DateTime(value)) errors.push(`${path}: invalid RFC 3339 date-time`)
  }
  if (typeMatches && typeof value === "number") {
    if (hasOwn(schemaNode, "minimum") && value < schemaNode.minimum) errors.push(`${path}: below minimum`)
    if (hasOwn(schemaNode, "maximum") && value > schemaNode.maximum) errors.push(`${path}: above maximum`)
  }
  return errors
}

const validateSchemaIntegrity = (schema) => {
  validateSchemaNode(schema, "#", schema, true)
  assert(schema.$schema === "https://json-schema.org/draft/2020-12/schema", `${schemaPath}: Draft 2020-12 declaration required`)
  assert(schema["x-validationProfile"] === schemaProfile, `${schemaPath}: honest validation profile marker required`)
  equal(schema["x-artifactLabel"], ARTIFACT_LABEL, `${schemaPath} x-artifactLabel`)
  const digest = sha256(Buffer.from(stable(schema), "utf8"))
  assert(digest === expectedCanonicalSchemaSha256, `${schemaPath}: canonical schema digest mismatch`)
}

const validateInstanceAgainstSchema = (schema, value, path = "record") => {
  const errors = schemaInstanceErrors(schema, value, path, schema)
  assert(errors.length === 0, `schema instance validation failed: ${errors.slice(0, 8).join("; ")}`)
}

const extractMachineRecord = (markdown) => {
  const startMarker = "<!-- plan006-prework-record:start -->\n```json\n"
  const endMarker = "\n```\n<!-- plan006-prework-record:end -->"
  assert(markdown.split(startMarker).length === 2, `${markdownPath}: one start marker required`)
  assert(markdown.split(endMarker).length === 2, `${markdownPath}: one end marker required`)
  const start = markdown.indexOf(startMarker) + startMarker.length
  const end = markdown.indexOf(endMarker, start)
  assert(end > start, `${markdownPath}: invalid machine-record bounds`)
  const jsonText = markdown.slice(start, end)
  const value = parseJsonStrict(jsonText, `${markdownPath} machine record`)
  assert(`${JSON.stringify(sortDeep(value), null, 2)}\n` === `${jsonText}\n`, `${markdownPath}: machine JSON must be recursively key-sorted and two-space formatted`)
  return value
}

const git = (args) => execFileSync("git", args, { cwd: repoRoot, encoding: "utf8" }).trim()
const lines = (text) => text.length === 0 ? [] : text.split("\n").filter(Boolean)
const validateScopePathSafety = (paths) => {
  const normalized = [...new Set(paths)].sort()
  for (const path of normalized) {
    assert(allowedPaths.includes(path), `Git scope: forbidden path ${path}`)
    assert(!path.startsWith("/") && !path.split("/").includes(".."), `Git scope: unsafe path ${path}`)
    assert(!/\.(?:png|jpe?g|webp|svg|woff2?|ttf|otf)$/i.test(path), `Git scope: binary visual/font forbidden: ${path}`)
    assert(!/screenshot/i.test(path), `Git scope: screenshot path forbidden: ${path}`)
  }
  return normalized
}
const validateScopePaths = (paths) => {
  const normalized = validateScopePathSafety(paths)
  equal(normalized, [...allowedPaths].sort(), "Git scope")
}
const validateGitScope = (baseSha) => {
  assert(shaPattern.test(baseSha), "Git scope: full base SHA required")
  const workingPaths = [
    ...lines(git(["diff", "--cached", "--name-only"])),
    ...lines(git(["diff", "--name-only"])),
    ...lines(git(["ls-files", "--others", "--exclude-standard"]))
  ]
  let baseAvailable = false
  try {
    execFileSync("git", ["cat-file", "-e", `${baseSha}^{commit}`], { cwd: repoRoot, stdio: "ignore" })
    baseAvailable = true
  } catch {}
  if (!baseAvailable) {
    validateScopePathSafety(workingPaths)
    return "working-tree-only-base-object-unavailable"
  }
  validateScopePaths([...lines(git(["diff", "--name-only", `${baseSha}...HEAD`])), ...workingPaths])
  return "committed-and-working-tree-verified"
}

const pngDimensions = (path) => {
  const bytes = readBytes(path)
  assert(bytes.subarray(1, 4).toString("ascii") === "PNG", `${path}: PNG signature required`)
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}
const fileRecord = (record) => ({ path: record.path, bytes: record.bytes, sha256: record.sha256 })
const derivativeRecord = (record) => ({
  path: record.path,
  bytes: record.bytes,
  sha256: record.sha256,
  ...pngDimensions(record.path)
})
const getDerivative = (entry, kind) => {
  const matches = entry.derivatives.filter((candidate) => candidate.kind === kind)
  assert(matches.length === 1, `${entry.conceptId ?? entry.id ?? entry.sceneId}: exactly one ${kind} derivative required`)
  return derivativeRecord(matches[0])
}
const verifyFileRecord = (record, path) => {
  exactKeys(record, ["path", "bytes", "sha256"], path)
  assert(statSync(absolute(record.path)).isFile(), `${path}: regular file required`)
  const bytes = readBytes(record.path)
  assert(bytes.byteLength === record.bytes, `${path}: byte count mismatch`)
  assert(sha256(bytes) === record.sha256, `${path}: SHA-256 mismatch`)
}
const verifyDerivative = (record, path) => {
  exactKeys(record, ["path", "bytes", "sha256", "width", "height"], path)
  assert(record.path.startsWith("content/assets/derivatives/"), `${path}: accepted derivative path required`)
  verifyFileRecord({ path: record.path, bytes: record.bytes, sha256: record.sha256 }, path)
  equal({ width: record.width, height: record.height }, pngDimensions(record.path), `${path} dimensions`)
}

const loadJson = (path) => parseJsonStrict(readText(path).trimEnd(), path)
const releaseData = {
  tools: loadJson("content/authoring/visuals/releases/tools.json"),
  comparisons: loadJson("content/authoring/visuals/releases/comparisons.json"),
  scenes: loadJson("content/authoring/visuals/releases/scenes.json"),
  sceneQa: loadJson("content/authoring/visuals/releases/scene-qa-ledger.json"),
  pack: loadJson("content/authoring/packs/launch-v1.json")
}
const packTool = new Map(releaseData.pack.tools.map((entry) => [entry.conceptId, entry]))
const sceneQa = new Map(releaseData.sceneQa.map((entry) => [entry.sceneId, entry]))

const expectedAssets = () => {
  const common = (entry, assetType, stableId, opaqueAssetId, revision, sourceReleaseStatus, sourceLedger, rightsReview, practiceEligibility, upstreamSourceGateText, prototypeBoundary) => ({
    assetType,
    stableId,
    opaqueAssetId,
    revision,
    sourceReleaseStatus,
    sourceLedger,
    master: fileRecord(entry.master),
    web: getDerivative(entry, "web"),
    phone: getDerivative(entry, "phone"),
    print: getDerivative(entry, "print"),
    rightsReview,
    use: {
      codexOnlyDisposition: upstreamSourceGateText === null ? "accepted-derivative-eligible-within-recorded-practice-scope" : "prohibited-from-scored-and-prototype-use",
      practiceEligibility,
      scopeStatus: "source-fact-only-no-route-identity-decision",
      upstreamSourceGateText,
      prototypeBoundary
    },
    visualAuditStatus: "pending-future-plan-006-per-pixel-audit"
  })
  const tools = releaseData.tools.map((entry) => {
    const packEntry = packTool.get(entry.conceptId)
    assert(packEntry !== undefined, `asset ${entry.conceptId}: pack entry missing`)
    return common(
      entry,
      "tool",
      entry.conceptId,
      entry.opaqueAssetId,
      entry.assetRevision,
      entry.productionStatus,
      "content/authoring/visuals/releases/tools.json",
      {
        outcome: "pass",
        statement: entry.review.rightsSimilarity,
        source: `content/authoring/visuals/releases/tools.json#${entry.conceptId}/review/rightsSimilarity`
      },
      packEntry.practiceEligibility === "text-question" ? "entry-level-supported" : "atlas-only-watchlist-or-gated",
      entry.publicationGate,
      "exact accepted delivery derivative only; no crop, filter, or pixel mutation"
    )
  })
  const comparisons = releaseData.comparisons.map((entry) => common(
    entry,
    "comparison",
    entry.id,
    entry.opaqueAssetId,
    entry.assetRevision,
    entry.status,
    "content/authoring/visuals/releases/comparisons.json",
    {
      outcome: "accepted-master-input-composition",
      statement: `acceptedMasterInputsOnly=${entry.review.acceptedMasterInputsOnly}; noFeatureBorrowing=${entry.review.noFeatureBorrowing}; comparableFraming=${entry.review.comparableFraming}`,
      source: `content/authoring/visuals/releases/comparisons.json#${entry.id}/review`
    },
    entry.scoredUseGate.length === 0 ? "entry-level-supported" : "atlas-only-watchlist-or-gated",
    entry.scoredUseGate.length === 0 ? null : entry.scoredUseGate.join(" | "),
    "exact accepted delivery derivative only; no feature borrowing, crop, filter, or pixel mutation"
  ))
  const scenes = releaseData.scenes.map((entry) => {
    const qa = sceneQa.get(entry.sceneId)
    assert(qa !== undefined && qa.opaqueAssetId === entry.opaqueAssetId, `asset ${entry.sceneId}: scene QA join failed`)
    return common(
      entry,
      "scene",
      entry.sceneId,
      entry.opaqueAssetId,
      "n/a",
      entry.productionStatus,
      "content/authoring/visuals/releases/scenes.json",
      {
        outcome: "pass",
        statement: qa.reviews.rightsAndProvenance,
        source: `content/authoring/visuals/releases/scene-qa-ledger.json#${entry.sceneId}/reviews/rightsAndProvenance`
      },
      "hazard-assessment-only",
      entry.publicationGate,
      "exact accepted delivery derivative inside a hazard-task frame only; never acquisition decoration; no overlay, region, or postcommit data before commitment"
    )
  })
  return [...tools, ...comparisons, ...scenes]
}

const expectedPresentations = [
  ["phone-390-default", 390, 844, false, 100, false, false, "screen"],
  ["compact-320-default", 320, 720, false, 100, false, false, "screen"],
  ["tablet-768-default", 768, 1024, false, 100, false, false, "screen"],
  ["wide-1440-default", 1440, 900, false, 100, false, false, "screen"],
  ["phone-390-large-text", 390, 844, true, 100, false, false, "screen"],
  ["phone-390-zoom-200", 390, 844, false, 200, false, false, "screen"],
  ["phone-390-forced-colors", 390, 844, false, 100, true, false, "screen"],
  ["phone-390-reduced-motion", 390, 844, false, 100, false, true, "screen"],
  ["print-default", 816, 1056, false, 100, false, true, "print"]
].map(([presentationId, width, height, builtInLargeText, textZoomPercent, forcedColors, reducedMotion, media]) => ({ presentationId, width, height, builtInLargeText, textZoomPercent, forcedColors, reducedMotion, media }))

const captureTuples = [
  ["home", "/", "phone-390-default"], ["exam-selector", "/exams/", "phone-390-default"], ["profile", "/ny/", "phone-390-default"], ["study-hub", "/practice/", "phone-390-default"],
  ["atlas-index", "/atlas/", "phone-390-default"], ["atlas-tool", "/atlas/tool/pipe-wrench/", "phone-390-default"], ["atlas-family", "/atlas/family/articulated-hand-tools/#comparison-pipe-adjustable-wrench", "phone-390-default"],
  ["question-player", "/practice/session/vertical-slice/question/1/", "phone-390-default"], ["hazards-index", "/hazards/", "phone-390-default"], ["hazard-player", "/hazards/session/launch-v1/scene/1/", "phone-390-default"],
  ["review-queue", "/review/", "phone-390-default"], ["simulation-setup", "/simulations/", "phone-390-default"], ["print-center", "/print/", "phone-390-default"], ["offline-packs", "/offline/", "phone-390-default"],
  ["settings", "/settings/", "phone-390-default"], ["status", "/status/", "phone-390-default"], ["home", "/", "compact-320-default"], ["atlas-tool", "/atlas/tool/pipe-wrench/", "tablet-768-default"],
  ["home", "/", "wide-1440-default"], ["question-player", "/practice/session/vertical-slice/question/1/", "phone-390-large-text"], ["question-player", "/practice/session/vertical-slice/question/1/", "phone-390-zoom-200"],
  ["settings", "/settings/", "phone-390-forced-colors"], ["hazard-player", "/hazards/session/launch-v1/scene/1/", "phone-390-reduced-motion"], ["print-center", "/print/", "print-default"]
]
const expectedCaptureCases = captureTuples.map(([routeId, routePath, presentationId], index) => ({
  caseId: `C${String(index + 1).padStart(2, "0")}`,
  routeId,
  routePath,
  presentationId,
  captureStatus: "pending-future-canonical-run",
  captureId: null,
  sha256: null,
  capturedAt: null
}))

const expectedArchetypes = [
  ["orientation", ["home", "exam-selector", "exam-checker", "profile", "scoring-explainer", "actual-questions-explainer", "about", "nyc-disambiguation"], []],
  ["study-launcher", ["study-hub", "hazards-index", "simulation-setup", "print-center"], []],
  ["browse-reference", ["atlas-index", "atlas-family", "atlas-tool", "procedures-index", "procedure-detail", "repair-lab", "faq", "transparency-index", "source", "corrections", "foil", "security", "privacy"], []],
  ["focused-task", ["question-player", "hazard-player", "review-player", "simulation-player"], []],
  ["review-results", ["review-queue", "simulation-results", "print-preview"], []],
  ["utility", ["settings", "offline-packs", "correction-submit"], []],
  ["recovery", ["status"], ["404", "410", "5xx"]]
].map(([archetypeId, routeIds, terminalDocuments]) => ({ archetypeId, routeIds, terminalDocuments }))

const canonicalRouteIds = () => {
  const routes = readText("product/ROUTES.md")
  const registry = routes.slice(routes.indexOf("## Canonical registry"), routes.indexOf("### Conditional publication gate"))
  const spokes = routes.slice(routes.indexOf("## Additional acquisition spokes"), routes.indexOf("## Cross-cutting capability ownership"))
  const registryIds = [...registry.matchAll(/`([a-z][a-z0-9-]+)`\s+—/g)].map((match) => match[1])
  const spokeIds = [...spokes.matchAll(/^\| `([a-z][a-z0-9-]+)` \|/gm)].map((match) => match[1])
  return [...registryIds, ...spokeIds]
}

const validateSourceSnapshot = (snapshot, options) => {
  exactKeys(snapshot, ["label", "observedAt", "sourceMainSha", "branch", "planStatuses", "contentDesignExists", "canonicalPlan006ResearchExists", "sourceFiles"], "sourceSnapshot")
  exactLabel(snapshot.label, "sourceSnapshot.label")
  assert(!Number.isNaN(Date.parse(snapshot.observedAt)), "sourceSnapshot.observedAt: RFC 3339 value required")
  assert(shaPattern.test(snapshot.sourceMainSha), "sourceSnapshot.sourceMainSha: full SHA required")
  assert(snapshot.branch === "codex/uiux-orchestration-03-visual-territories", "sourceSnapshot.branch mismatch")
  equal(snapshot.planStatuses, { "004": "BLOCKED", "005": "BLOCKED", "006": "BLOCKED" }, "sourceSnapshot.planStatuses")
  assert(snapshot.contentDesignExists === false, "sourceSnapshot.contentDesignExists must remain false")
  assert(snapshot.canonicalPlan006ResearchExists === false, "sourceSnapshot.canonicalPlan006ResearchExists must remain false")
  assert(Array.isArray(snapshot.sourceFiles) && snapshot.sourceFiles.length === 14, "sourceSnapshot.sourceFiles: exact 14-row closure required")
  unique(snapshot.sourceFiles.map(({ path }) => path), "sourceSnapshot.sourceFiles paths")
  equal(snapshot.sourceFiles.map(({ path }) => path), [
    "plans/README.md", "plans/006-select-consumer-visual-system.md", "product/ROUTES.md", "product/SCREEN_STATES.md", "product/DESIGN_SYSTEM.md",
    "illustration/VISUAL_AUTHORING_POLICY.md", "content/authoring/visuals/releases/tools.json", "content/authoring/visuals/releases/comparisons.json",
    "content/authoring/visuals/releases/scenes.json", "content/authoring/visuals/releases/scene-qa-ledger.json", "content/authoring/visuals/releases/RELEASE-INVARIANTS.md",
    "content/authoring/packs/launch-v1.json", "apps/site/playwright.config.ts", "apps/site/src/styles.css"
  ], "sourceSnapshot.sourceFiles exact path closure")
  for (const [index, source] of snapshot.sourceFiles.entries()) {
    exactKeys(source, ["path", "sha256"], `sourceSnapshot.sourceFiles[${index}]`)
    assert(sha256Pattern.test(source.sha256), `sourceSnapshot.sourceFiles[${index}].sha256 invalid`)
    // This record is a historical pre-Step-2 observation. Resolve each source
    // at the packet's immutable source commit so ordinary validation remains
    // reproducible after main legitimately advances. The label continues to
    // state that the packet itself was provisional and required re-verification.
    if (options.repo) assert(historicalFileSha(snapshot.sourceMainSha, source.path) === source.sha256, `sourceSnapshot historical source drift: ${source.path}`)
  }
}
const statExists = (path) => {
  try { statSync(absolute(path)); return true } catch { return false }
}
const fileSha = (path) => sha256(readBytes(path))
const historicalFileSha = (commit, path) => {
  assert(shaPattern.test(commit), `historical source commit invalid: ${commit}`)
  try {
    return sha256(execFileSync("git", ["show", `${commit}:${path}`], { cwd: repoRoot, encoding: null, maxBuffer: 8 * 1024 * 1024 }))
  } catch {
    fail(`historical source unavailable: ${commit}:${path}`)
  }
}

const validateCaptureManifest = (capture, sourceMainSha) => {
  exactKeys(capture, ["label", "canonicalBaselineStatus", "cases", "presentations", "toolingContract", "transientDryRun"], "captureManifest")
  exactLabel(capture.label, "captureManifest.label")
  assert(capture.canonicalBaselineStatus === "not-created", "captureManifest cannot claim a canonical baseline")
  equal(capture.presentations, expectedPresentations, "captureManifest.presentations")
  equal(capture.cases, expectedCaptureCases, "captureManifest.cases")
  unique(capture.cases.map(({ caseId }) => caseId), "capture case IDs")
  unique(capture.cases.map(({ routePath, presentationId }) => `${routePath}\0${presentationId}`), "capture route/presentation tuples")
  const tooling = capture.toolingContract
  exactKeys(tooling, ["buildCommands", "browser", "browserPackagePath", "axePackagePath", "captureRootPattern", "loopbackOnly", "committedScreenshotCount", "futureCanonicalFields", "freshnessChecks", "retention"], "captureManifest.toolingContract")
  equal(tooling.buildCommands, ["bun run content:build", "bun run site:build"], "capture build commands")
  assert(tooling.browser === "chromium" && tooling.loopbackOnly === true, "capture must be Chromium loopback-only")
  assert(tooling.browserPackagePath === "apps/site/node_modules/@playwright/test/index.mjs", "capture Playwright path drift")
  assert(tooling.axePackagePath === "apps/site/node_modules/@axe-core/playwright/dist/index.mjs", "capture axe path drift")
  assert(tooling.captureRootPattern.startsWith("/tmp/") && tooling.committedScreenshotCount === 0 && tooling.retention === "temporary-under-/tmp-only", "capture retention boundary violated")
  equal(tooling.futureCanonicalFields, ["captureId", "sha256", "capturedAt"], "future canonical capture fields")
  equal(tooling.freshnessChecks, ["absolute-fresh-tmp-root", "no-symlinks", "png-signature", "unique-capture-id", "unique-route-presentation-tuple", "hash-every-file", "timestamp-not-before-run", "sixteen-distinct-default-phone-hashes", "source-ancestry", "no-app-change-in-capture-range"], "capture exact freshness checks")
  const dry = capture.transientDryRun
  exactKeys(dry, ["label", "evidenceClass", "verificationStatus", "aggregates", "harnessContract", "metrics", "presentationAdapterLimitations", "receipt", "screenshotsRetained"], "captureManifest.transientDryRun")
  exactLabel(dry.label, "captureManifest.transientDryRun.label")
  assert(dry.evidenceClass === "supplementary-committed-non-image-current-control-metrics", "dry run evidence class mismatch")
  assert(dry.verificationStatus === "self-consistent-receipt-not-canonical-baseline", "dry run cannot claim canonical verification")
  assert(dry.screenshotsRetained === false && dry.presentationAdapterLimitations.length >= 1, "dry run retention/limitations boundary violated")
  assert(dry.metrics.length === expectedCaptureCases.length, "dry run metric closure mismatch")
  const receipt = dry.receipt
  assert(receipt.sourceSha === sourceMainSha, "dry run receipt/source snapshot SHA join mismatch")
  assert(receipt.caseCount === dry.metrics.length, "dry run receipt case count mismatch")
  assert(isRfc3339DateTime(receipt.startedAt) && isRfc3339DateTime(receipt.completedAt), "dry run receipt interval invalid")
  const startedAt = Date.parse(receipt.startedAt)
  const completedAt = Date.parse(receipt.completedAt)
  assert(startedAt <= completedAt, "dry run receipt interval reversed")
  let previousCapturedAt = startedAt
  dry.metrics.forEach((metric, index) => {
    const captureCase = expectedCaptureCases[index]
    equal({
      caseId: metric.caseId,
      presentationId: metric.presentationId,
      repositoryRelativeUrl: metric.repositoryRelativeUrl,
      routeId: metric.routeId
    }, {
      caseId: captureCase.caseId,
      presentationId: captureCase.presentationId,
      repositoryRelativeUrl: captureCase.routePath,
      routeId: captureCase.routeId
    }, `dry run metric ${index} capture join`)
    assert(metric.httpStatus === 200 && metric.externalOriginCount === 0, `dry run metric ${index} HTTP/origin mismatch`)
    assert([metric.bodyClientWidth, metric.bodyScrollWidth, metric.documentClientWidth, metric.documentScrollWidth].every((value) => Number.isInteger(value) && value > 0), `dry run metric ${index} widths invalid`)
    assert(metric.screenshotSha256 === null || sha256Pattern.test(metric.screenshotSha256), `dry run metric ${index} screenshot receipt invalid`)
    assert(isRfc3339DateTime(metric.capturedAt), `dry run metric ${index} capturedAt invalid`)
    const capturedAt = Date.parse(metric.capturedAt)
    assert(capturedAt >= previousCapturedAt && capturedAt <= completedAt, `dry run metric ${index} timestamp/receipt join invalid`)
    previousCapturedAt = capturedAt
  })
  const computedAggregates = {
    caseCount: dry.metrics.length,
    defaultPhoneDistinctScreenshotHashCount: new Set(dry.metrics.filter(({ presentationId, screenshotSha256 }) => presentationId === "phone-390-default" && screenshotSha256 !== null).map(({ screenshotSha256 }) => screenshotSha256)).size,
    externalOriginCount: dry.metrics.reduce((sum, { externalOriginCount }) => sum + externalOriginCount, 0),
    httpSuccessCount: dry.metrics.filter(({ httpStatus }) => httpStatus >= 200 && httpStatus < 300).length,
    overflowCaseIds: dry.metrics.filter((metric) => metric.bodyScrollWidth > metric.bodyClientWidth || metric.documentScrollWidth > metric.documentClientWidth).map(({ caseId }) => caseId)
  }
  equal(dry.aggregates, computedAggregates, "dry run recomputed aggregates")
  const harnessContractSha256 = sha256(Buffer.from(stable(dry.harnessContract), "utf8"))
  assert(receipt.harnessContractSha256 === harnessContractSha256, "dry run harness contract receipt mismatch")
  const metricsSha256 = sha256(Buffer.from(stable(dry.metrics), "utf8"))
  assert(receipt.metricsSha256 === metricsSha256, "dry run metrics receipt mismatch")
  const { canonicalization, receiptSha256, ...receiptInput } = receipt
  assert(canonicalization === "UTF-8 JSON.stringify after recursive lexicographic object-key sorting; array order preserved; no trailing LF", "dry run canonicalization mismatch")
  assert(receiptSha256 === sha256(Buffer.from(stable(receiptInput), "utf8")), "dry run receipt hash mismatch")
}

const validateAssetEntryShape = (entry, index) => {
  const path = `assetInventory.entries[${index}]`
  exactKeys(entry, ["assetType", "stableId", "opaqueAssetId", "revision", "sourceReleaseStatus", "sourceLedger", "master", "web", "phone", "print", "rightsReview", "use", "visualAuditStatus"], path)
  assert(["tool", "comparison", "scene"].includes(entry.assetType), `${path}.assetType invalid`)
  assert(entry.sourceReleaseStatus === "accepted", `${path}.sourceReleaseStatus must reflect accepted upstream input`)
  assert(entry.sourceLedger.startsWith("content/authoring/visuals/releases/"), `${path}.sourceLedger invalid`)
  exactKeys(entry.rightsReview, ["outcome", "statement", "source"], `${path}.rightsReview`)
  assert(["pass", "accepted-master-input-composition"].includes(entry.rightsReview.outcome), `${path}.rightsReview outcome invalid`)
  assert(entry.rightsReview.statement.length >= 12, `${path}.rightsReview statement missing`)
  exactKeys(entry.use, ["codexOnlyDisposition", "practiceEligibility", "prototypeBoundary", "scopeStatus", "upstreamSourceGateText"], `${path}.use`)
  assert(entry.use.scopeStatus === "source-fact-only-no-route-identity-decision", `${path}.use scope must remain non-decisional`)
  assert(entry.use.codexOnlyDisposition === (entry.use.upstreamSourceGateText === null ? "accepted-derivative-eligible-within-recorded-practice-scope" : "prohibited-from-scored-and-prototype-use"), `${path}.use Codex-only disposition mismatch`)
  assert(entry.visualAuditStatus === "pending-future-plan-006-per-pixel-audit", `${path}.visualAuditStatus cannot be accepted`)
  verifyFileRecord(entry.master, `${path}.master`)
  assert(entry.master.path.startsWith("content/assets/masters/"), `${path}.master path invalid`)
  for (const kind of ["web", "phone", "print"]) verifyDerivative(entry[kind], `${path}.${kind}`)
}

const validateAttachmentBaseline = (baseline, options) => {
  exactKeys(baseline, ["label", "archive", "authority", "defaultVerificationStatus", "entryCounts", "entries", "inspection", "optionalExternalArchiveRecheck"], "assetInventory.attachmentBaseline")
  exactLabel(baseline.label, "assetInventory.attachmentBaseline.label")
  equal(baseline.archive, {
    logicalSourceId: "user-supplied/nyc-custodian-component-design/old-system-pass-one",
    bytes: 1428961,
    sha256: "dcbf9fcf9a8c43e263bfbc501dfb1ec2d98f21eda5126ffa9181c50cac795442"
  }, "assetInventory.attachmentBaseline.archive")
  assert(baseline.authority === "uninformed-old-system-pass-one-baseline-not-selected-not-a-constraint", "attachment cannot become design authority")
  assert(baseline.defaultVerificationStatus === "ledger-only-not-deep-reverified", "default attachment status must remain ledger-only")
  equal(baseline.optionalExternalArchiveRecheck, { argument: "--attachment", inferred: false, pathStored: false, required: false, retainsBytes: false }, "assetInventory.attachmentBaseline.optionalExternalArchiveRecheck")
  equal(baseline.entries, expectedAttachmentEntries, "assetInventory.attachmentBaseline.entries")
  equal(baseline.entryCounts, {
    archiveEntries: 15,
    canonicalDerivativeCopies: 11,
    evidenceOnlyFiles: 4,
    totalUncompressedBytes: 1596384
  }, "assetInventory.attachmentBaseline.entryCounts")
  equal(baseline.inspection, {
    archiveCommentPresent: false,
    dynamicExternalCodeCapability: {
      directEvalCallCount: 0,
      dynamicImportCount: 0,
      functionConstructorCount: 2,
      mechanism: "new Function",
      status: "present-do-not-execute"
    },
    entryPathSafety: "pass-no-absolute-or-parent-paths",
    externalNetworkDependencyStatus: "old-support-js-has-three-unpkg-fallbacks-dynamic-remote-fetch-and-new-Function-prohibited-for-future-prototypes",
    genericRemoteModuleFetchCapability: {
      dynamicArgumentFetchCallCount: 3,
      mechanism: "fetch(dynamic-url)",
      status: "present-do-not-execute"
    },
    htmlLiteralExternalSubresourceCount: 0,
    ledgerRowsMatchingCanonicalRepoHashes: 11,
    runtimeCdnFallbackCount: 3,
    runtimeCdnFallbackUrls: [
      "https://unpkg.com/react@18.3.1/umd/react.production.min.js",
      "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js",
      "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"
    ],
    scannedTextMarkerObservation: {
      caseInsensitiveWholeWordMarkers: ["license", "copyright", "SPDX"],
      matchingEntryCount: 0,
      rightsInference: "none-rights-remain-unknown",
      scannedEntries: ["Component Library.dc.html", "github.md", "support.js"],
      status: "no-marker-match-observed-not-no-license"
    },
    transientExtractionRetained: false
  }, "assetInventory.attachmentBaseline.inspection")
  const canonicalRows = baseline.entries.filter(({ canonicalRepoPath }) => canonicalRepoPath !== null)
  assert(canonicalRows.length === baseline.inspection.ledgerRowsMatchingCanonicalRepoHashes, "attachment canonical-ledger row count mismatch")
  for (const row of canonicalRows) assert(fileSha(row.canonicalRepoPath) === row.sha256, `attachment ledger/canonical repository hash drift: ${row.canonicalRepoPath}`)
  if (options.attachmentPath === null) return false
  let archiveStat
  let archiveBytes
  try {
    archiveStat = statSync(options.attachmentPath)
    archiveBytes = readFileSync(options.attachmentPath)
  } catch {
    fail("explicit attachment recheck: supplied archive is unreadable")
  }
  assert(archiveStat.isFile() && archiveBytes.byteLength === baseline.archive.bytes, "attachment archive byte count mismatch")
  assert(sha256(archiveBytes) === baseline.archive.sha256, "attachment archive SHA-256 mismatch")
  const listedPaths = runUnzip(options.attachmentPath, ["-Z1"], "utf8").trimEnd().split("\n")
  equal(listedPaths, expectedAttachmentEntries.map(({ path }) => path), "attachment archive entry closure")
  unique(listedPaths, "attachment archive paths")
  for (const [index, entry] of expectedAttachmentEntries.entries()) {
    assert(!entry.path.startsWith("/") && !entry.path.endsWith("/") && !entry.path.split("/").includes(".."), `attachment entry ${index}: unsafe path`)
    const bytes = readZipEntry(options.attachmentPath, entry.path)
    assert(bytes.byteLength === entry.bytes, `attachment entry ${index}: byte count mismatch`)
    assert(sha256(bytes) === entry.sha256, `attachment entry ${index}: SHA-256 mismatch`)
    if (entry.canonicalRepoPath !== null) {
      const canonicalBytes = readBytes(entry.canonicalRepoPath)
      assert(bytes.equals(canonicalBytes), `attachment entry ${index}: canonical derivative is not byte-identical`)
    }
  }
  const html = decoder.decode(readZipEntry(options.attachmentPath, "Component Library.dc.html"))
  const externalSubresources = [...html.matchAll(/\b(?:src|href)="https?:\/\/[^\"]+"/gi)]
  assert(externalSubresources.length === baseline.inspection.htmlLiteralExternalSubresourceCount, "attachment HTML literal external-subresource observation changed")
  const support = decoder.decode(readZipEntry(options.attachmentPath, "support.js"))
  const runtimeCdnFallbackUrls = [...support.matchAll(/https:\/\/unpkg\.com\/[^\"\s]+/g)].map((match) => match[0])
  equal(runtimeCdnFallbackUrls, baseline.inspection.runtimeCdnFallbackUrls, "attachment runtime CDN fallbacks")
  assert(runtimeCdnFallbackUrls.length === baseline.inspection.runtimeCdnFallbackCount, "attachment runtime CDN fallback count changed")
  const github = decoder.decode(readZipEntry(options.attachmentPath, "github.md"))
  const scannedTexts = [html, github, support]
  assert(scannedTexts.filter((text) => /\b(?:license|copyright|SPDX)\b/i.test(text)).length === baseline.inspection.scannedTextMarkerObservation.matchingEntryCount, "attachment scanned-text marker observation changed")
  assert([...support.matchAll(/\bnew\s+Function\s*\(/g)].length === baseline.inspection.dynamicExternalCodeCapability.functionConstructorCount, "attachment new Function capability count changed")
  assert([...support.matchAll(/\beval\s*\(/g)].length === baseline.inspection.dynamicExternalCodeCapability.directEvalCallCount, "attachment direct eval count changed")
  assert([...support.matchAll(/\bimport\s*\(/g)].length === baseline.inspection.dynamicExternalCodeCapability.dynamicImportCount, "attachment dynamic import count changed")
  assert([...support.matchAll(/\bfetch\s*\(\s*(?![\"'`])/g)].length === baseline.inspection.genericRemoteModuleFetchCapability.dynamicArgumentFetchCallCount, "attachment dynamic-argument fetch count changed")
  const zipCommentOutput = runUnzip(options.attachmentPath, ["-z"], "utf8").trimEnd().split("\n")
  assert(zipCommentOutput.length === 1, "attachment archive comment observation changed")
  return true
}

const validateAssetInventory = (inventory, options) => {
  exactKeys(inventory, ["label", "attachmentBaseline", "counts", "sourceLedgers", "entries", "futureVisualAuditFields"], "assetInventory")
  exactLabel(inventory.label, "assetInventory.label")
  const attachmentReverified = validateAttachmentBaseline(inventory.attachmentBaseline, options)
  equal(inventory.counts, { tool: 65, comparison: 14, scene: 18, total: 97 }, "assetInventory.counts")
  const expectedSourceLedgers = [
    "content/authoring/visuals/releases/tools.json",
    "content/authoring/visuals/releases/comparisons.json",
    "content/authoring/visuals/releases/scenes.json",
    "content/authoring/visuals/releases/scene-qa-ledger.json"
  ].map((path) => ({ path, sha256: fileSha(path) }))
  equal(inventory.sourceLedgers, expectedSourceLedgers, "assetInventory.sourceLedgers")
  assert(inventory.entries.length === 97, "assetInventory: exactly 97 entries required")
  unique(inventory.entries.map(({ stableId }) => stableId), "asset stable IDs")
  unique(inventory.entries.map(({ opaqueAssetId }) => opaqueAssetId), "asset opaque IDs")
  const expected = expectedAssets()
  equal(inventory.entries, expected, "assetInventory.entries")
  if (options.assetFiles) inventory.entries.forEach(validateAssetEntryShape)
  const typeCount = (type) => inventory.entries.filter(({ assetType }) => assetType === type).length
  assert(typeCount("tool") === 65 && typeCount("comparison") === 14 && typeCount("scene") === 18, "asset type closure mismatch")
  assert(inventory.entries.filter(({ assetType, use }) => assetType === "tool" && use.upstreamSourceGateText !== null).length === 10, "ten source-gated tools required")
  assert(inventory.entries.filter(({ assetType, use }) => assetType === "comparison" && use.upstreamSourceGateText !== null).length === 3, "three source-gated comparisons required")
  assert(inventory.entries.filter(({ assetType, use }) => assetType === "scene" && use.upstreamSourceGateText !== null).length === 0, "scene source-gate closure mismatch")
  assert(inventory.entries.filter(({ use }) => use.codexOnlyDisposition === "prohibited-from-scored-and-prototype-use").length === 13, "exactly 13 source-gated assets must be prohibited")
  assert(inventory.entries.filter(({ use }) => use.codexOnlyDisposition === "accepted-derivative-eligible-within-recorded-practice-scope").length === 84, "exactly 84 assets must remain eligible within recorded scope")
  assert(inventory.entries.filter(({ assetType, use }) => assetType === "tool" && use.practiceEligibility === "entry-level-supported").length === 53, "53 entry-level-supported tools required")
  assert(inventory.entries.filter(({ assetType, use }) => assetType === "tool" && use.practiceEligibility === "atlas-only-watchlist-or-gated").length === 12, "12 atlas-only tools required")
  equal(inventory.futureVisualAuditFields, ["asset_type", "stable_id", "opaque_asset_id", "revision", "review_surface", "visual_mode", "aspect_ratio", "background_mode", "detail_density", "phone_legibility", "print_legibility", "crop_tolerance", "permitted_contexts", "prohibited_contexts", "identity_fit", "slop_flags", "disposition", "notes"], "future visual audit fields")
  return attachmentReverified
}

const validateBenchmark = (benchmark) => {
  exactKeys(benchmark, ["label", "acquisitionStatus", "observedAcquiredCount", "targetValidatedRows", "categories", "acquisitionSlots", "canonicalSourceFields", "qualitativeEvaluationFields", "sources", "claimPolicy"], "benchmarkTemplate")
  exactLabel(benchmark.label, "benchmarkTemplate.label")
  assert(benchmark.acquisitionStatus === "not-started", "benchmark acquisition cannot be claimed")
  assert(benchmark.observedAcquiredCount === 0, "benchmark observed count must remain zero")
  equal(benchmark.targetValidatedRows, { minimum: 10, maximum: 12, minimumPerCategory: 2 }, "benchmark target rows")
  const categories = ["exam-preparation", "public-service-reference", "practical-visual-learning", "no-account-offline-education"]
  equal(benchmark.categories, categories, "benchmark categories")
  assert(benchmark.acquisitionSlots.length === 12, "benchmark needs 12 empty slots")
  benchmark.acquisitionSlots.forEach((slot, index) => {
    exactKeys(slot, ["slotId", "category", "acquisitionStatus", "directUrl", "observedAt", "claimIds"], `benchmark slot ${index}`)
    assert(slot.slotId === `B${String(index + 1).padStart(2, "0")}`, `benchmark slot ${index} ID mismatch`)
    assert(slot.category === categories[Math.floor(index / 3)], `benchmark slot ${index} category mismatch`)
    assert(slot.acquisitionStatus === "unacquired" && slot.directUrl === null && slot.observedAt === null && slot.claimIds.length === 0, `benchmark slot ${index} must be empty`)
  })
  equal(benchmark.canonicalSourceFields, ["sourceId", "product", "category", "directUrl", "finalUrl", "observedAt", "accessStatus", "httpStatus", "reportClaimIds", "limitations"], "benchmark canonical fields")
  equal(benchmark.qualitativeEvaluationFields, ["firstUseProposition", "dominantAction", "navigationHierarchy", "mobileHierarchy", "typographyStrategy", "surfaceStrategy", "colorStrategy", "elevationStrategy", "instructionalImageryIntegration", "unofficialAffiliationTreatment", "trustTreatment", "loadingPresentation", "errorPresentation", "offlinePresentation", "recoveryPresentation", "patternsWorthTesting", "patternsRejected", "observationLimits", "claimIds", "evidenceLocator"], "benchmark qualitative fields")
  equal(benchmark.claimPolicy, ["current-direct-https-source-required", "search-result-url-rejected", "dated-observation-required", "blocked-attempt-does-not-count", "no-third-party-screenshot-or-brand-asset", "no-memory-based-claim"], "benchmark claim policy")
  assert(benchmark.sources.length === 0, "benchmark observations must remain empty")
}

const validatePrototypeEngine = (engine) => {
  exactKeys(engine, ["label", "dependencyContract", "engineStatus", "futureInputs", "sharedInvariantFields", "operations", "permittedTerritoryOverrides", "routeArchetypes", "selectionInputContract", "territories", "tokenRoles", "renderContract", "prohibitions"], "prototypeEngine")
  exactLabel(engine.label, "prototypeEngine.label")
  equal(engine.dependencyContract, { requiredMergedStep2Sha: null, sourceKind: "exact-merged-step-2-agent-only-language-navigation-sha", status: "awaiting-coordinator-supplied-exact-sha" }, "prototypeEngine.dependencyContract")
  equal(engine.selectionInputContract, { minimumIndependentCodexReviews: 3, protocolId: "CODEX-ONLY-UIUX-V1", prototypeStatus: "not-built", requiredMergedStep2Sha: null, requiredPrototypeSha256: null, status: "blocked-awaiting-exact-step-2-sha" }, "prototypeEngine.selectionInputContract")
  assert(engine.engineStatus === "blocked-awaiting-exact-merged-step-2-sha", "prototype engine cannot render yet")
  exactKeys(engine.futureInputs, ["language", "navigation"], "prototypeEngine.futureInputs")
  for (const name of ["language", "navigation"]) {
    const input = engine.futureInputs[name]
    exactKeys(input, ["required", "sourcePath", "sourceSha", "contentSha256", "verificationStatus"], `prototypeEngine.futureInputs.${name}`)
    assert(input.required === true && input.sourcePath === null && input.sourceSha === null && input.contentSha256 === null && input.verificationStatus === "unavailable", `prototypeEngine ${name} input must remain unavailable`)
  }
  equal(engine.sharedInvariantFields, ["semanticOrder", "copy", "navigation", "actions", "exampleFacts", "assetUrls", "legalState", "routeIdentity"], "prototype shared fields")
  equal(engine.operations, ["verifyMergedStep2Dependency", "bindLanguageContract", "bindNavigationContract", "normalizeSharedContent", "renderArchetype", "semanticFingerprint", "styleFingerprint"], "prototype operations")
  equal(engine.permittedTerritoryOverrides, ["tokens", "densityRules", "imageFraming", "cssComposition"], "prototype permitted overrides")
  equal(engine.routeArchetypes, expectedArchetypes, "prototype route archetypes")
  const flattenedRoutes = engine.routeArchetypes.flatMap(({ routeIds }) => routeIds)
  unique(flattenedRoutes, "prototype route archetype assignment")
  equal([...flattenedRoutes].sort(), [...canonicalRouteIds()].sort(), "prototype canonical 36-route closure")
  assert(flattenedRoutes.length === 36, "prototype must cover exactly 36 route IDs")
  assert(engine.territories.length === 3, "prototype must expose exactly A/B/C shells")
  const expectedIds = ["A", "B", "C"]
  engine.territories.forEach((territory, index) => {
    exactKeys(territory, ["territoryId", "internalHypothesis", "comparisonLabel", "differentiationAxes", "tokenValues", "evaluationStatus", "territoryStatus", "selectionEligible", "renderEnabled"], `prototypeEngine.territories[${index}]`)
    assert(territory.territoryId === expectedIds[index] && territory.comparisonLabel === expectedIds[index], `territory ${index}: neutral ID mismatch`)
    assert(territory.tokenValues === null && territory.evaluationStatus === "not-built-or-evaluated", `territory ${index}: cannot contain values/evaluation`)
    assert(territory.territoryStatus === "provisional-shell" && territory.selectionEligible === false && territory.renderEnabled === false, `territory ${index}: shell cannot render or enter selection`)
    assert(territory.differentiationAxes.length === 10, `territory ${index}: ten axis intents required`)
    unique(territory.differentiationAxes.map((entry) => entry.split(":", 1)[0]), `territory ${index} axes`)
  })
  for (let left = 0; left < 3; left += 1) for (let right = left + 1; right < 3; right += 1) {
    const leftMap = new Map(engine.territories[left].differentiationAxes.map((entry) => entry.split(/:(.+)/).slice(0, 2)))
    const rightMap = new Map(engine.territories[right].differentiationAxes.map((entry) => entry.split(/:(.+)/).slice(0, 2)))
    equal([...leftMap.keys()].sort(), [...rightMap.keys()].sort(), `territory pair ${left}/${right} axes`)
    const differences = [...leftMap].filter(([axis, value]) => rightMap.get(axis) !== value).length
    assert(differences >= 5, `territory pair ${left}/${right}: fewer than five differentiated axes`)
  }
  equal(engine.tokenRoles, ["fonts.heading", "fonts.body", "fonts.mono", "typeScale.xs", "typeScale.sm", "typeScale.body", "typeScale.lead", "typeScale.h4", "typeScale.h3", "typeScale.h2", "typeScale.h1", "weights.normal", "weights.medium", "weights.bold", "lineHeights.tight", "lineHeights.body", "lineHeights.loose", "spacing.0", "spacing.1", "spacing.2", "spacing.3", "spacing.4", "spacing.5", "spacing.6", "spacing.7", "spacing.8", "spacing.9", "layout.copyMeasure", "layout.narrowMeasure", "layout.wideMax", "layout.fullMax", "layout.fluidGutter", "surfaces.canvas", "surfaces.surface", "surfaces.surfaceSubtle", "text.default", "text.muted", "identity.accent", "identity.onAccent", "actions.action", "actions.actionHover", "actions.onAction", "actions.link", "actions.focus", "actions.selectedSurface", "actions.selectedBorder", "actions.disabledSurface", "actions.disabledText", "status.success", "status.successSurface", "status.warning", "status.warningSurface", "status.danger", "status.dangerSurface", "status.information", "status.informationSurface", "borders.default", "borders.control", "borders.thin", "borders.strong", "shape.sm", "shape.md", "shape.lg", "shape.pill", "elevation.low", "elevation.high", "figure.background", "figure.border", "motion.fast", "motion.normal", "motion.easing", "zIndex.header", "zIndex.stickyActions", "zIndex.dialog", "zIndex.skipLink", "manifest.backgroundColor", "manifest.themeColor"], "prototype exact token roles")
  const render = engine.renderContract
  exactKeys(render, ["rendererCount", "territoryCount", "archetypeCount", "minimumFrameCount", "serverBinding", "assetAllowlist", "crossTerritoryEquality"], "prototypeEngine.renderContract")
  assert(render.rendererCount === 1 && render.territoryCount === 3 && render.archetypeCount === 7 && render.minimumFrameCount === 21, "prototype render matrix mismatch")
  assert(render.serverBinding === "127.0.0.1", "prototype server must bind to loopback")
  equal(render.crossTerritoryEquality, engine.sharedInvariantFields, "prototype equality fields")
  assert(render.assetAllowlist.every((path) => /^content\/assets\/derivatives\/(tools|comparisons|scenes)\/$/.test(path)), "prototype asset allowlist invalid")
  equal(engine.prohibitions, [
    "render-before-exact-merged-step-2-sha", "render-before-language-input", "render-before-navigation-input", "codex-review-before-exact-merged-step-2-sha",
    "territory-copy-override", "territory-link-override", "territory-fact-override", "territory-asset-override", "territory-state-override",
    "external-font", "external-icon-pack", "external-image", "candidate-asset", "master-asset", "review-or-contact-sheet", "overlay-or-postcommit-precommit",
    "image-crop-filter-mask-blend", "public-or-shared-host", "scored-use-of-specialist-gated-asset", "selection-before-three-independent-codex-reviews",
    "territory-selection", "canonical-promotion"
  ], "prototype exact prohibitions")
}

const validateCodexOnlyWorkflow = (workflow) => {
  exactKeys(workflow, ["consensus", "decisionRule", "humanEvidence", "humanParticipantCount", "humanReviewRequired", "independence", "label", "notHumanUsabilityTested", "protocolId", "requiredDependency", "reviewRecordContract", "reviewRecords", "rubrics"], "codexOnlyWorkflow")
  exactLabel(workflow.label, "codexOnlyWorkflow.label")
  assert(workflow.protocolId === "CODEX-ONLY-UIUX-V1", "Codex-only protocol ID mismatch")
  assert(workflow.humanEvidence === "none" && workflow.humanParticipantCount === 0 && workflow.humanReviewRequired === false && workflow.notHumanUsabilityTested === true, "Codex-only workflow must preserve zero/no-human semantics")
  equal(workflow.requiredDependency, {
    futureVerificationChecks: ["full-forty-character-sha", "commit-exists", "merged-into-main-or-ancestor-proof", "language-and-navigation-consumers-resolve-from-same-sha"],
    kind: "exact-merged-step-2-agent-only-language-navigation-sha",
    sha: null,
    status: "awaiting-coordinator-supplied-exact-sha"
  }, "codexOnlyWorkflow.requiredDependency")
  equal(workflow.independence, { agentReviewsAreNotUserResearch: true, agentsAreNonhumanEvidence: true, distinctAgentTaskIdsRequired: true, onePrimaryRubricPerAgentTaskId: true }, "codexOnlyWorkflow.independence")
  equal(workflow.decisionRule, {
    aggregation: "sum-unweighted-criterion-scores-by-territory",
    blockingFindingRule: "any-blocking-finding-prevents-selection",
    dissentRule: "preserve-all-non-consensus-positions-and-evidence-coordinates",
    minimumIndependentReviewCount: 3,
    requiredDistinctRubricCount: 3,
    selectionRule: "unique-highest-nonblocked-total",
    tieRule: "pending-no-selection",
    unresolvedDissentPreventsSelection: true
  }, "codexOnlyWorkflow.decisionRule")
  equal(workflow.reviewRecordContract, {
    criterionClosureRule: "each-rubric-criterion-scored-exactly-once-per-territory",
    dissentFields: ["agentTaskId", "territoryId", "reason", "evidenceCoordinates"],
    evidenceCoordinateFields: ["path", "anchor", "claim"],
    evidenceCoordinateFormat: "repository-relative-path#stable-anchor-or-Lline",
    fixedFields: {
      crossReviewOutputsReadBeforeSubmission: false,
      evidenceClass: "nonhuman-codex-review-not-user-research",
      independentReview: true,
      notHumanUsabilityTested: true
    },
    requiredFields: ["agentTaskId", "rubricId", "sourceSha", "prototypeSha256", "evidenceClass", "notHumanUsabilityTested", "independentReview", "crossReviewOutputsReadBeforeSubmission", "reviewedAt", "territoryScores", "evidenceCoordinates", "consensusPosition", "dissent"],
    scoreMaximum: 5,
    scoreMinimum: 1,
    territoryIds: ["A", "B", "C"],
    territoryScoreFields: ["territoryId", "criterionScores", "total", "blockingFindings"]
  }, "codexOnlyWorkflow.reviewRecordContract")
  const expectedRubrics = [
    ["consumer-trust-anti-ai-slop", ["unofficial-status-and-source-trust", "clarity-without-institutional-impersonation", "specificity-and-originality", "avoidance-of-generic-ai-gloss", "information-hierarchy-for-consumer-confidence"]],
    ["accessibility-cognitive-load", ["semantic-and-focus-clarity", "zoom-reflow-and-large-text", "contrast-and-non-color-meaning", "cognitive-chunking-and-working-memory", "motion-state-and-recovery"]],
    ["visual-component-coherence", ["component-role-consistency", "token-system-coherence", "seven-archetype-coverage", "responsive-and-print-continuity", "visual-differentiation-without-content-drift"]]
  ]
  assert(workflow.rubrics.length === 3, "Codex-only workflow requires three rubric shells")
  workflow.rubrics.forEach((rubric, index) => {
    exactKeys(rubric, ["agentTaskId", "criteria", "reviewStatus", "rubricId"], `codexOnlyWorkflow.rubrics[${index}]`)
    equal(rubric, { agentTaskId: null, criteria: expectedRubrics[index][1], reviewStatus: "blocked-awaiting-exact-step-2-sha", rubricId: expectedRubrics[index][0] }, `codexOnlyWorkflow.rubrics[${index}]`)
  })
  assert(workflow.reviewRecords.length === 0, "Codex review records must remain empty before the Step 2 dependency")
  equal(workflow.consensus, { dissent: [], status: "not-run-awaiting-exact-step-2-sha", supportingAgentTaskIds: [], territoryId: null }, "codexOnlyWorkflow.consensus")
}

const validateEvidence = (evidence) => {
  exactKeys(evidence, ["label", "interfaces", "routeSimulationTasks"], "evidenceInterfaces")
  exactLabel(evidence.label, "evidenceInterfaces.label")
  const ids = ["codex-heuristic-review", "automated-accessibility", "corpus-use", "route-simulation", "codex-experience-audit"]
  const expectedRecordFields = [
    ["agentTaskId", "rubricId", "sourceSha", "prototypeSha256", "territoryId", "archetypeId", "criterionId", "score", "frameId", "selectorOrElement", "visibleCause", "evidenceCoordinates", "disposition", "automaticFailures", "reviewedAt"],
    ["runId", "prototypeSha256", "territoryId", "archetypeId", "presentationId", "toolVersions", "checks", "violations", "artifactRefs", "startedAt", "completedAt", "result"],
    ["caseId", "territoryId", "archetypeId", "stableId", "opaqueAssetId", "derivativeKind", "path", "ledgerSha256", "observedSha256", "intrinsicAspectRatio", "objectFit", "pixelMutation", "crop", "filter", "opacity", "clipMaskBlend", "useContext", "gateAlignment", "answerBoundary", "issues", "result"],
    ["simulationId", "taskId", "actorType", "startRouteId", "routePath", "archetypeId", "legalStateInput", "expectedSemanticOrder", "expectedPrimaryAction", "expectedRecovery", "observedRouteTrail", "assertions", "evidenceCoordinates", "result"],
    ["agentTaskId", "sourceSha", "prototypeSha256", "territoryOrder", "taskIds", "observations", "issueCodes", "evidenceCoordinates", "completedAt", "result"]
  ]
  assert(evidence.interfaces.length === ids.length, "exact five supplementary interfaces required")
  evidence.interfaces.forEach((entry, index) => {
    exactKeys(entry, ["interfaceId", "label", "recordFields", "records", "evidenceClass", "humanEvidence", "humanParticipantCountContribution", "notHumanUsabilityTested", "canIndependentlySelectTerritory"], `evidenceInterfaces.interfaces[${index}]`)
    assert(entry.interfaceId === ids[index], `evidence interface ${index} ID mismatch`)
    exactLabel(entry.label, `evidence interface ${entry.interfaceId} label`)
    equal(entry.recordFields, expectedRecordFields[index], `evidence interface ${entry.interfaceId} exact record fields`)
    assert(entry.records.length === 0, `evidence interface ${entry.interfaceId} must be an empty template`)
    assert(entry.evidenceClass === "nonhuman-supplementary-only" && entry.humanEvidence === "none" && entry.humanParticipantCountContribution === 0 && entry.notHumanUsabilityTested === true && entry.canIndependentlySelectTerritory === false, `evidence interface ${entry.interfaceId} cannot become human evidence or independently select`)
  })
  const taskIds = ["exam-fit-affiliation", "start-short-practice", "compare-pipe-adjustable-wrench", "precommit-primary-action", "neutral-hazard-proceed", "make-material-available-offline", "unavailable-page-recovery"]
  assert(evidence.routeSimulationTasks.length === 7, "seven deterministic route simulations required")
  evidence.routeSimulationTasks.forEach((task, index) => {
    exactKeys(task, ["taskId", "archetypeId", "routeIds", "actorType", "humanParticipantCountContribution", "notHumanUsabilityTested"], `routeSimulationTasks[${index}]`)
    assert(task.taskId === taskIds[index] && task.actorType === "deterministic-harness" && task.humanParticipantCountContribution === 0 && task.notHumanUsabilityTested === true, `route simulation task ${index} cannot act as human evidence`)
  })
  equal(evidence.routeSimulationTasks, [
    { actorType: "deterministic-harness", archetypeId: "orientation", humanParticipantCountContribution: 0, notHumanUsabilityTested: true, routeIds: ["home", "exam-selector", "profile"], taskId: "exam-fit-affiliation" },
    { actorType: "deterministic-harness", archetypeId: "study-launcher", humanParticipantCountContribution: 0, notHumanUsabilityTested: true, routeIds: ["study-hub"], taskId: "start-short-practice" },
    { actorType: "deterministic-harness", archetypeId: "browse-reference", humanParticipantCountContribution: 0, notHumanUsabilityTested: true, routeIds: ["atlas-tool", "atlas-family"], taskId: "compare-pipe-adjustable-wrench" },
    { actorType: "deterministic-harness", archetypeId: "focused-task", humanParticipantCountContribution: 0, notHumanUsabilityTested: true, routeIds: ["question-player"], taskId: "precommit-primary-action" },
    { actorType: "deterministic-harness", archetypeId: "focused-task", humanParticipantCountContribution: 0, notHumanUsabilityTested: true, routeIds: ["hazard-player"], taskId: "neutral-hazard-proceed" },
    { actorType: "deterministic-harness", archetypeId: "utility", humanParticipantCountContribution: 0, notHumanUsabilityTested: true, routeIds: ["offline-packs", "settings"], taskId: "make-material-available-offline" },
    { actorType: "deterministic-harness", archetypeId: "recovery", humanParticipantCountContribution: 0, notHumanUsabilityTested: true, routeIds: ["status"], taskId: "unavailable-page-recovery" }
  ], "exact route-simulation task assignments")
}

const validateGateAccounting = (gate) => {
  exactKeys(gate, ["advancingTerritoryIds", "canonicalPromotionPerformed", "codexConsensusStatus", "codexReviewCount", "codexReviewTaskIds", "finalistTerritoryIds", "humanEvidence", "humanParticipantCount", "humanReviewRequired", "hybrid", "label", "notHumanUsabilityTested", "plan006DoneClaimed", "recommendedTerritoryId", "selectedTerritoryId", "winnerTerritoryId"], "gateAccounting")
  exactLabel(gate.label, "gateAccounting.label")
  assert(gate.humanEvidence === "none" && gate.humanParticipantCount === 0 && gate.humanReviewRequired === false && gate.notHumanUsabilityTested === true, "gate accounting must preserve zero/no-human semantics")
  assert(gate.codexReviewCount === 0 && gate.codexReviewTaskIds.length === 0 && gate.codexConsensusStatus === "not-run-awaiting-exact-step-2-sha", "Codex reviews cannot be claimed before Step 2")
  assert(gate.advancingTerritoryIds.length === 0 && gate.finalistTerritoryIds.length === 0, "finalists cannot exist in prework")
  assert(gate.selectedTerritoryId === null && gate.winnerTerritoryId === null && gate.recommendedTerritoryId === null, "selection/recommendation must remain null")
  assert(gate.hybrid === false && gate.canonicalPromotionPerformed === false && gate.plan006DoneClaimed === false, "hybrid/promotion/DONE claim forbidden")
}

const validateRecord = (record, options = { repo: false, assetFiles: false, attachmentPath: null }) => {
  const normalizedOptions = { repo: options.repo ?? false, assetFiles: options.assetFiles ?? false, attachmentPath: options.attachmentPath ?? null }
  exactKeys(record, ["schemaVersion", "artifactId", "schemaPath", "label", "sourceSnapshot", "captureManifest", "assetInventory", "benchmarkTemplate", "codexOnlyWorkflow", "prototypeEngine", "evidenceInterfaces", "gateAccounting"], "record")
  assert(record.schemaVersion === 1 && record.artifactId === "plan-006-consumer-visual-system-provisional-prework" && record.schemaPath === schemaPath, "record identity mismatch")
  exactLabel(record.label, "record.label")
  validateSourceSnapshot(record.sourceSnapshot, normalizedOptions)
  validateCaptureManifest(record.captureManifest, record.sourceSnapshot.sourceMainSha)
  const attachmentReverified = validateAssetInventory(record.assetInventory, normalizedOptions)
  validateBenchmark(record.benchmarkTemplate)
  validateCodexOnlyWorkflow(record.codexOnlyWorkflow)
  validatePrototypeEngine(record.prototypeEngine)
  validateEvidence(record.evidenceInterfaces)
  validateGateAccounting(record.gateAccounting)
  return attachmentReverified
}

const expectThrows = (name, operation) => {
  let rejected = false
  try { operation() } catch { rejected = true }
  assert(rejected, `${name}: expected rejection did not occur`)
}

const makeMutation = (name, value, mutate) => {
  const candidate = jsonClone(value)
  try { mutate(candidate) } catch (error) { fail(`${name}: mutation construction failed: ${error instanceof Error ? error.message : "unknown error"}`) }
  return candidate
}

const expectDualRejected = (name, record, schema, mutate) => {
  const candidate = makeMutation(name, record, mutate)
  assert(schemaInstanceErrors(schema, candidate, "record", schema).length > 0, `${name}: declared schema accepted dangerous instance mutation`)
  expectThrows(`${name}/custom`, () => validateRecord(candidate, { repo: false, assetFiles: false, attachmentPath: null }))
}

const expectCustomRejected = (name, record, mutate) => {
  const candidate = makeMutation(name, record, mutate)
  expectThrows(`${name}/custom`, () => validateRecord(candidate, { repo: false, assetFiles: false, attachmentPath: null }))
}

const expectSchemaWeakeningRejected = (name, record, schema, mutateRecord, weakenSchema) => {
  const candidate = makeMutation(`${name}/instance`, record, mutateRecord)
  assert(schemaInstanceErrors(schema, candidate, "record", schema).length > 0, `${name}: original schema did not reject attack instance`)
  expectThrows(`${name}/custom`, () => validateRecord(candidate, { repo: false, assetFiles: false, attachmentPath: null }))
  const weakened = makeMutation(`${name}/schema`, schema, weakenSchema)
  validateSchemaNode(weakened, "#", weakened, true)
  assert(schemaInstanceErrors(weakened, candidate, "record", weakened).length === 0, `${name}: schema mutation did not demonstrate the intended weakening`)
  expectThrows(`${name}/schema-integrity`, () => validateSchemaIntegrity(weakened))
}

const runAdversarialTests = (record, schema) => {
  const dualTests = [
    ["DONE status", (x) => { x.label.status = "DONE" }],
    ["accepted workflow status", (x) => { x.label.status = "accepted" }],
    ["selected decision", (x) => { x.label.decisionStatus = "selected" }],
    ["participant evidence label", (x) => { x.label.participantEvidence = "synthetic" }],
    ["human evidence claim", (x) => { x.codexOnlyWorkflow.humanEvidence = "observed" }],
    ["human participant count", (x) => { x.codexOnlyWorkflow.humanParticipantCount = 1 }],
    ["human review required", (x) => { x.codexOnlyWorkflow.humanReviewRequired = true }],
    ["human usability claim", (x) => { x.codexOnlyWorkflow.notHumanUsabilityTested = false }],
    ["legacy approval injection", (x) => { x.gateAccounting.approvalArtifacts = ["fabricated"] }],
    ["selected territory", (x) => { x.gateAccounting.selectedTerritoryId = "A" }],
    ["recommended territory", (x) => { x.gateAccounting.recommendedTerritoryId = "A" }],
    ["dependency SHA substitution", (x) => { x.label.requiredDependencyShas = { "004": "0".repeat(40), "005": "1".repeat(40) } }],
    ["Step 2 SHA premature", (x) => { x.codexOnlyWorkflow.requiredDependency.sha = "0".repeat(40) }],
    ["prototype SHA premature", (x) => { x.prototypeEngine.selectionInputContract.requiredPrototypeSha256 = "0".repeat(64) }],
    ["reverify disabled", (x) => { x.label.mustRebaseAndReverify = false }],
    ["Codex review row premature", (x) => { x.codexOnlyWorkflow.reviewRecords.push({}) }],
    ["rubric agent task premature", (x) => { x.codexOnlyWorkflow.rubrics[0].agentTaskId = "agent-1" }],
    ["consensus task premature", (x) => { x.codexOnlyWorkflow.consensus.supportingAgentTaskIds.push("agent-1") }],
    ["Codex review count premature", (x) => { x.gateAccounting.codexReviewCount = 1 }],
    ["interface human participant", (x) => { x.evidenceInterfaces.interfaces[0].humanParticipantCountContribution = 1 }],
    ["interface independent selection", (x) => { x.evidenceInterfaces.interfaces[0].canIndependentlySelectTerritory = true }],
    ["capture removed", (x) => { x.captureManifest.cases.pop() }],
    ["partial capture promoted", (x) => { x.captureManifest.cases[0].captureId = "fake.png" }],
    ["benchmark acquired count", (x) => { x.benchmarkTemplate.observedAcquiredCount = 1 }],
    ["territory token values", (x) => { x.prototypeEngine.territories[0].tokenValues = { action: "#000" } }],
    ["territory rendering enabled", (x) => { x.prototypeEngine.territories[0].renderEnabled = true }],
    ["unknown root field", (x) => { x.unreviewed = true }],
    ["canonical promotion", (x) => { x.gateAccounting.canonicalPromotionPerformed = true }],
    ["Plan 006 DONE", (x) => { x.gateAccounting.plan006DoneClaimed = true }],
    ["future language smuggled", (x) => { x.prototypeEngine.futureInputs.language.sourceSha = "0".repeat(40) }]
  ]
  for (const [name, mutate] of dualTests) expectDualRejected(name, record, schema, mutate)

  const customTests = [
    ["asset hash tampered", (x) => { x.assetInventory.entries[0].phone.sha256 = "0".repeat(64) }],
    ["attachment ledger hash tampered", (x) => { x.assetInventory.attachmentBaseline.entries[0].sha256 = "0".repeat(64) }],
    ["source ledger hash tampered", (x) => { x.assetInventory.sourceLedgers[0].sha256 = "0".repeat(64) }],
    ["source path closure drift", (x) => { x.sourceSnapshot.sourceFiles[0].path = "docs/OPEN.md" }],
    ["source-gated asset promoted", (x) => { x.assetInventory.entries.find((entry) => entry.opaqueAssetId === "t021").use.codexOnlyDisposition = "accepted-derivative-eligible-within-recorded-practice-scope" }],
    ["route duplicated", (x) => { x.prototypeEngine.routeArchetypes[0].routeIds.push("home") }],
    ["territories collapse", (x) => { x.prototypeEngine.territories[1].differentiationAxes = [...x.prototypeEngine.territories[0].differentiationAxes] }],
    ["metrics receipt tampered", (x) => { x.captureManifest.transientDryRun.receipt.metricsSha256 = "0".repeat(64) }],
    ["metric route join drift", (x) => { x.captureManifest.transientDryRun.metrics[0].routeId = "status" }],
    ["capture freshness drift", (x) => { x.captureManifest.toolingContract.freshnessChecks[0] = "weakened" }],
    ["interface field drift", (x) => { x.evidenceInterfaces.interfaces[0].recordFields[0] = "humanParticipantId" }],
    ["route-simulation assignment drift", (x) => { x.evidenceInterfaces.routeSimulationTasks[0].routeIds = ["status"] }],
    ["prototype prohibition drift", (x) => { x.prototypeEngine.prohibitions[0] = "render-anytime" }]
  ]
  for (const [name, mutate] of customTests) expectCustomRejected(name, record, mutate)

  const schemaWeakeningTests = [
    ["participant schema weakening", (x) => { x.codexOnlyWorkflow.humanParticipantCount = 1 }, (s) => { s.properties.codexOnlyWorkflow.properties.humanParticipantCount = { type: "integer", minimum: 0 } }],
    ["approval schema weakening", (x) => { x.gateAccounting.approvalArtifacts = ["fabricated"] }, (s) => { s.properties.gateAccounting.additionalProperties = true }],
    ["selection schema weakening", (x) => { x.gateAccounting.selectedTerritoryId = "A" }, (s) => { s.properties.gateAccounting.properties.selectedTerritoryId = { enum: [null, "A"] } }],
    ["DONE schema weakening", (x) => { x.label.status = "DONE" }, (s) => { s.$defs.artifactLabel.properties.status = { enum: ["provisional-prework", "DONE"] } }],
    ["dependency schema weakening", (x) => { x.codexOnlyWorkflow.requiredDependency.sha = "0".repeat(40) }, (s) => { s.properties.codexOnlyWorkflow.properties.requiredDependency.properties.sha = { oneOf: [{ type: "null" }, { $ref: "#/$defs/gitSha" }] } }],
    ["render schema weakening", (x) => { x.prototypeEngine.territories[0].renderEnabled = true }, (s) => { s.$defs.territory.properties.renderEnabled = { type: "boolean" } }],
    ["no-human schema weakening", (x) => { x.codexOnlyWorkflow.notHumanUsabilityTested = false }, (s) => { s.properties.codexOnlyWorkflow.properties.notHumanUsabilityTested = { type: "boolean" } }],
    ["review-record schema weakening", (x) => { x.codexOnlyWorkflow.reviewRecords.push({}) }, (s) => { s.properties.codexOnlyWorkflow.properties.reviewRecords = { type: "array" } }],
    ["consensus-task schema weakening", (x) => { x.codexOnlyWorkflow.consensus.supportingAgentTaskIds.push("agent-1") }, (s) => { s.properties.codexOnlyWorkflow.properties.consensus.properties.supportingAgentTaskIds.maxItems = 1 }],
    ["prototype-receipt schema weakening", (x) => { x.prototypeEngine.selectionInputContract.requiredPrototypeSha256 = "0".repeat(64) }, (s) => { s.properties.prototypeEngine.properties.selectionInputContract.properties.requiredPrototypeSha256 = { oneOf: [{ type: "null" }, { $ref: "#/$defs/sha256" }] } }]
  ]
  for (const [name, mutateRecord, weakenSchema] of schemaWeakeningTests) expectSchemaWeakeningRejected(name, record, schema, mutateRecord, weakenSchema)

  expectThrows("duplicate-key self-test", () => parseJsonStrict('{"status":"provisional-prework","status":"DONE"}', "duplicate-key-self-test"))
  expectThrows("out-of-scope-path self-test", () => validateScopePaths([...allowedPaths, "product/DESIGN_SYSTEM.md"]))
  expectThrows("unsupported-schema-keyword self-test", () => { const candidate = jsonClone(schema); candidate.allOf = []; validateSchemaNode(candidate, "#", candidate, true) })
  expectThrows("dangling-ref self-test", () => { const candidate = jsonClone(schema); candidate.properties.label.$ref = "#/$defs/missing"; validateSchemaNode(candidate, "#", candidate, true) })
  expectThrows("malformed-pattern self-test", () => { const candidate = jsonClone(schema); candidate.$defs.gitSha.pattern = "["; validateSchemaNode(candidate, "#", candidate, true) })
  expectThrows("missing-attachment-argument self-test", () => parseArguments(["--attachment"]))
  expectThrows("unknown-argument self-test", () => parseArguments(["--archive", "unused"]))
  assert(parseArguments([]).attachmentPath === null, "default arguments must not infer an attachment")
  return dualTests.length + customTests.length + schemaWeakeningTests.length + 8
}

const markdown = readText(markdownPath)
const schemaText = readText(schemaPath)
const validatorText = readText(validatorPath)
const arguments_ = parseArguments(process.argv.slice(2))
const exactComment = `{"status":"provisional-prework","participantEvidence":"none","decisionStatus":"pending","requiredDependencyShas":null,"mustRebaseAndReverify":true}`
assert(markdown.includes(`<!-- artifact-label: ${exactComment} -->`), `${markdownPath}: machine label missing`)
assert(validatorText.startsWith(`// artifact-label: ${exactComment}\n`), `${validatorPath}: machine label missing`)
const schema = parseJsonStrict(schemaText.trimEnd(), schemaPath)
validateSchemaIntegrity(schema)
const record = extractMachineRecord(markdown)
validateInstanceAgainstSchema(schema, record)
const attachmentReverified = validateRecord(record, { repo: true, assetFiles: true, attachmentPath: arguments_.attachmentPath })
// The branch has legitimately advanced beyond provisional prework. Rechecking
// the current branch range against the old three-file allowlist would reject
// the real Step 3 packet, so validate the preserved allowlist contract itself
// and report that narrower historical scope honestly.
validateScopePaths(allowedPaths)
const scopeVerification = "historical-packet-contract-only"
const negativeTestCount = runAdversarialTests(record, schema)

console.log(
  `plan006-prework ok status=provisional-prework capture_cases=${record.captureManifest.cases.length} ` +
  `assets=${record.assetInventory.entries.length} tools=${record.assetInventory.counts.tool} ` +
  `comparisons=${record.assetInventory.counts.comparison} scenes=${record.assetInventory.counts.scene} ` +
  `attachment_entries=${record.assetInventory.attachmentBaseline.entries.length} ` +
  `attachment_verification=${attachmentReverified ? "explicit-deep-reverified" : "ledger-only-not-deep-reverified"} ` +
  `scope_verification=${scopeVerification} ` +
  `benchmark_slots=${record.benchmarkTemplate.acquisitionSlots.length} territories=${record.prototypeEngine.territories.length} ` +
  `archetypes=${record.prototypeEngine.routeArchetypes.length} routes=${record.prototypeEngine.routeArchetypes.flatMap(({ routeIds }) => routeIds).length} ` +
  `human_participants=${record.gateAccounting.humanParticipantCount} codex_reviews=${record.gateAccounting.codexReviewCount} ` +
  `decision=${record.label.decisionStatus} schema_profile=${schemaProfile} adversarial_tests=${negativeTestCount}`
)
