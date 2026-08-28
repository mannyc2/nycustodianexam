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
const attachmentArchive = "/home/cjpher/.codex/attachments/3d868f50-c832-49bd-9640-def0d35c3c58/NYC Custodian Component Design.zip"
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
  rightsStatus: canonicalRepoPath === null ? "unknown-archive-provides-no-license" : "archive-adds-no-rights-canonical-release-ledger-controls",
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
const readZipEntry = (path) => execFileSync("unzip", ["-p", attachmentArchive, path], { encoding: null, maxBuffer: 2 * 1024 * 1024 })
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
    const result = {}
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
const validateScopePaths = (paths) => {
  const normalized = [...new Set(paths)].sort()
  equal(normalized, [...allowedPaths].sort(), "Git scope")
  for (const path of normalized) {
    assert(!path.startsWith("/") && !path.split("/").includes(".."), `Git scope: unsafe path ${path}`)
    assert(!/\.(?:png|jpe?g|webp|svg|woff2?|ttf|otf)$/i.test(path), `Git scope: binary visual/font forbidden: ${path}`)
    assert(!/screenshot/i.test(path), `Git scope: screenshot path forbidden: ${path}`)
  }
}
const validateGitScope = (baseSha) => {
  assert(shaPattern.test(baseSha), "Git scope: full base SHA required")
  const paths = [
    ...lines(git(["diff", "--name-only", `${baseSha}...HEAD`])),
    ...lines(git(["diff", "--cached", "--name-only"])),
    ...lines(git(["diff", "--name-only"])),
    ...lines(git(["ls-files", "--others", "--exclude-standard"]))
  ]
  validateScopePaths(paths)
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
  const common = (entry, assetType, stableId, opaqueAssetId, revision, sourceReleaseStatus, sourceLedger, rightsReview, practiceEligibility, gate, prototypeBoundary) => ({
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
      practiceEligibility,
      scopeStatus: "source-fact-only-not-route-identity-approval",
      gate,
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
      "exact accepted delivery derivative only; no crop, filter, or pixel mutation; scored use still obeys any source gate"
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
    "exact accepted delivery derivative only; no feature borrowing, crop, filter, or pixel mutation; scored use still obeys any source gate"
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
  assert(Array.isArray(snapshot.sourceFiles) && snapshot.sourceFiles.length >= 9, "sourceSnapshot.sourceFiles closure missing")
  unique(snapshot.sourceFiles.map(({ path }) => path), "sourceSnapshot.sourceFiles paths")
  for (const [index, source] of snapshot.sourceFiles.entries()) {
    exactKeys(source, ["path", "sha256"], `sourceSnapshot.sourceFiles[${index}]`)
    assert(sha256Pattern.test(source.sha256), `sourceSnapshot.sourceFiles[${index}].sha256 invalid`)
    if (options.repo) assert(fileSha(source.path) === source.sha256, `sourceSnapshot source drift: ${source.path}`)
  }
  if (options.repo) {
    assert(git(["rev-parse", "origin/main"]) === snapshot.sourceMainSha, "origin/main moved: rebase and reverify required")
    assert(git(["branch", "--show-current"]) === snapshot.branch, "wrong orchestration branch")
    const planIndex = readText("plans/README.md")
    for (const plan of ["004", "005", "006"]) {
      const row = planIndex.split("\n").find((line) => line.startsWith(`| ${plan} |`))
      assert(row?.includes("| BLOCKED"), `Plan ${plan} is no longer BLOCKED; packet must rebase and reverify`)
    }
    assert(!statExists("product/CONTENT_DESIGN.md"), "product/CONTENT_DESIGN.md now exists; packet must rebase and reverify")
    assert(!statExists("research/ui-ux/consumer-visual-system"), "canonical Plan 006 research now exists; provisional packet is stale")
  }
}
const statExists = (path) => {
  try { statSync(absolute(path)); return true } catch { return false }
}
const fileSha = (path) => sha256(readBytes(path))

const validateCaptureManifest = (capture) => {
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
  assert(tooling.freshnessChecks.length >= 8 && new Set(tooling.freshnessChecks).size === tooling.freshnessChecks.length, "capture freshness checks incomplete")
  const dry = capture.transientDryRun
  exactKeys(dry, ["label", "evidenceClass", "sourceSha", "observedAt", "browserName", "browserVersion", "caseCount", "httpSuccessCount", "defaultPhoneDistinctHashCount", "externalOriginCount", "overflowCaseIds", "presentationAdapterLimitations", "resultManifestSha256", "screenshotsRetained"], "captureManifest.transientDryRun")
  exactLabel(dry.label, "captureManifest.transientDryRun.label")
  assert(dry.evidenceClass === "supplementary-current-baseline-dry-run", "dry run evidence class mismatch")
  assert(dry.caseCount === 24 && dry.httpSuccessCount === 24 && dry.defaultPhoneDistinctHashCount === 16, "dry run closure mismatch")
  assert(dry.externalOriginCount === 0 && dry.screenshotsRetained === false, "dry run external/retention boundary violated")
  equal(dry.overflowCaseIds, ["simulation-setup-phone-390-default", "print-center-phone-390-default"], "dry run overflow cases")
  assert(dry.presentationAdapterLimitations.length >= 1 && sha256Pattern.test(dry.resultManifestSha256), "dry run limitations/receipt missing")
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
  exactKeys(entry.use, ["practiceEligibility", "scopeStatus", "gate", "prototypeBoundary"], `${path}.use`)
  assert(entry.use.scopeStatus === "source-fact-only-not-route-identity-approval", `${path}.use scope must remain provisional`)
  assert(entry.visualAuditStatus === "pending-future-plan-006-per-pixel-audit", `${path}.visualAuditStatus cannot be accepted`)
  verifyFileRecord(entry.master, `${path}.master`)
  assert(entry.master.path.startsWith("content/assets/masters/"), `${path}.master path invalid`)
  for (const kind of ["web", "phone", "print"]) verifyDerivative(entry[kind], `${path}.${kind}`)
}

const validateAttachmentBaseline = (baseline, options) => {
  exactKeys(baseline, ["label", "archive", "authority", "entryCounts", "entries", "inspection"], "assetInventory.attachmentBaseline")
  exactLabel(baseline.label, "assetInventory.attachmentBaseline.label")
  equal(baseline.archive, {
    locator: attachmentArchive,
    bytes: 1428961,
    sha256: "dcbf9fcf9a8c43e263bfbc501dfb1ec2d98f21eda5126ffa9181c50cac795442"
  }, "assetInventory.attachmentBaseline.archive")
  assert(baseline.authority === "uninformed-old-system-pass-one-baseline-not-selected-not-a-constraint", "attachment cannot become design authority")
  equal(baseline.entries, expectedAttachmentEntries, "assetInventory.attachmentBaseline.entries")
  equal(baseline.entryCounts, {
    archiveEntries: 15,
    canonicalDerivativeCopies: 11,
    evidenceOnlyFiles: 4,
    totalUncompressedBytes: 1596384
  }, "assetInventory.attachmentBaseline.entryCounts")
  equal(baseline.inspection, {
    archiveCommentPresent: false,
    embeddedLicenseFound: false,
    entryPathSafety: "pass-no-absolute-or-parent-paths",
    externalNetworkDependencyStatus: "three-runtime-cdn-fallbacks-in-old-support-js-prohibited-for-future-prototypes",
    htmlLiteralExternalSubresourceCount: 0,
    imageCopiesByteIdenticalToCanonicalRepo: 11,
    runtimeCdnFallbackCount: 3,
    runtimeCdnFallbackUrls: [
      "https://unpkg.com/react@18.3.1/umd/react.production.min.js",
      "https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js",
      "https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"
    ],
    transientExtractionRetained: false
  }, "assetInventory.attachmentBaseline.inspection")
  if (!options.assetFiles) return
  const archiveStat = statSync(attachmentArchive)
  const archiveBytes = readFileSync(attachmentArchive)
  assert(archiveStat.isFile() && archiveBytes.byteLength === baseline.archive.bytes, "attachment archive byte count mismatch")
  assert(sha256(archiveBytes) === baseline.archive.sha256, "attachment archive SHA-256 mismatch")
  const listedPaths = execFileSync("unzip", ["-Z1", attachmentArchive], { encoding: "utf8" }).trimEnd().split("\n")
  equal(listedPaths, expectedAttachmentEntries.map(({ path }) => path), "attachment archive entry closure")
  unique(listedPaths, "attachment archive paths")
  for (const [index, entry] of expectedAttachmentEntries.entries()) {
    assert(!entry.path.startsWith("/") && !entry.path.endsWith("/") && !entry.path.split("/").includes(".."), `attachment entry ${index}: unsafe path`)
    const bytes = readZipEntry(entry.path)
    assert(bytes.byteLength === entry.bytes, `attachment entry ${index}: byte count mismatch`)
    assert(sha256(bytes) === entry.sha256, `attachment entry ${index}: SHA-256 mismatch`)
    if (entry.canonicalRepoPath !== null) {
      const canonicalBytes = readBytes(entry.canonicalRepoPath)
      assert(bytes.equals(canonicalBytes), `attachment entry ${index}: canonical derivative is not byte-identical`)
    }
  }
  const html = decoder.decode(readZipEntry("Component Library.dc.html"))
  const externalSubresources = [...html.matchAll(/\b(?:src|href)="https?:\/\/[^\"]+"/gi)]
  assert(externalSubresources.length === baseline.inspection.htmlLiteralExternalSubresourceCount, "attachment HTML literal external-subresource observation changed")
  const support = decoder.decode(readZipEntry("support.js"))
  const runtimeCdnFallbackUrls = [...support.matchAll(/https:\/\/unpkg\.com\/[^\"\s]+/g)].map((match) => match[0])
  equal(runtimeCdnFallbackUrls, baseline.inspection.runtimeCdnFallbackUrls, "attachment runtime CDN fallbacks")
  assert(runtimeCdnFallbackUrls.length === baseline.inspection.runtimeCdnFallbackCount, "attachment runtime CDN fallback count changed")
  const licensingText = [html, decoder.decode(readZipEntry("github.md")), support].join("\n")
  assert(!/\b(?:license|copyright|SPDX)\b/i.test(licensingText), "attachment embedded-license observation changed")
  const zipCommentOutput = execFileSync("unzip", ["-z", attachmentArchive], { encoding: "utf8" }).trimEnd().split("\n")
  assert(zipCommentOutput.length === 1, "attachment archive comment observation changed")
}

const validateAssetInventory = (inventory, options) => {
  exactKeys(inventory, ["label", "attachmentBaseline", "counts", "sourceLedgers", "entries", "futureVisualAuditFields"], "assetInventory")
  exactLabel(inventory.label, "assetInventory.label")
  validateAttachmentBaseline(inventory.attachmentBaseline, options)
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
  assert(inventory.entries.filter(({ assetType, use }) => assetType === "tool" && use.gate !== null).length === 10, "ten gated tools required")
  assert(inventory.entries.filter(({ assetType, use }) => assetType === "comparison" && use.gate !== null).length === 3, "three gated comparisons required")
  assert(inventory.entries.filter(({ assetType, use }) => assetType === "scene" && use.gate !== null).length === 0, "scene gate closure mismatch")
  assert(inventory.entries.filter(({ assetType, use }) => assetType === "tool" && use.practiceEligibility === "entry-level-supported").length === 53, "53 entry-level-supported tools required")
  assert(inventory.entries.filter(({ assetType, use }) => assetType === "tool" && use.practiceEligibility === "atlas-only-watchlist-or-gated").length === 12, "12 atlas-only tools required")
  equal(inventory.futureVisualAuditFields, ["asset_type", "stable_id", "opaque_asset_id", "revision", "review_surface", "visual_mode", "aspect_ratio", "background_mode", "detail_density", "phone_legibility", "print_legibility", "crop_tolerance", "permitted_contexts", "prohibited_contexts", "identity_fit", "slop_flags", "disposition", "notes"], "future visual audit fields")
}

const validateBenchmark = (benchmark) => {
  exactKeys(benchmark, ["label", "acquisitionStatus", "targetValidatedRows", "categories", "acquisitionSlots", "canonicalSourceFields", "qualitativeEvaluationFields", "sources", "claimPolicy"], "benchmarkTemplate")
  exactLabel(benchmark.label, "benchmarkTemplate.label")
  assert(benchmark.acquisitionStatus === "not-started", "benchmark acquisition cannot be claimed")
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
  assert(benchmark.qualitativeEvaluationFields.length >= 20 && benchmark.sources.length === 0, "benchmark observations must remain empty")
  assert(benchmark.claimPolicy.includes("no-memory-based-claim") && benchmark.claimPolicy.includes("current-direct-https-source-required"), "benchmark claim policy incomplete")
}

const validatePrototypeEngine = (engine) => {
  exactKeys(engine, ["label", "engineStatus", "futureInputs", "sharedInvariantFields", "operations", "permittedTerritoryOverrides", "routeArchetypes", "territories", "tokenRoles", "renderContract", "prohibitions"], "prototypeEngine")
  exactLabel(engine.label, "prototypeEngine.label")
  assert(engine.engineStatus === "blocked-awaiting-future-language-and-navigation-inputs", "prototype engine cannot render yet")
  exactKeys(engine.futureInputs, ["language", "navigation"], "prototypeEngine.futureInputs")
  for (const name of ["language", "navigation"]) {
    const input = engine.futureInputs[name]
    exactKeys(input, ["required", "sourcePath", "sourceSha", "contentSha256", "verificationStatus"], `prototypeEngine.futureInputs.${name}`)
    assert(input.required === true && input.sourcePath === null && input.sourceSha === null && input.contentSha256 === null && input.verificationStatus === "unavailable", `prototypeEngine ${name} input must remain unavailable`)
  }
  equal(engine.sharedInvariantFields, ["semanticOrder", "copy", "navigation", "actions", "exampleFacts", "assetUrls", "legalState", "routeIdentity"], "prototype shared fields")
  equal(engine.operations, ["bindLanguageContract", "bindNavigationContract", "normalizeSharedContent", "renderArchetype", "semanticFingerprint", "styleFingerprint"], "prototype operations")
  equal(engine.permittedTerritoryOverrides, ["tokens", "densityRules", "imageFraming", "cssComposition"], "prototype permitted overrides")
  equal(engine.routeArchetypes, expectedArchetypes, "prototype route archetypes")
  const flattenedRoutes = engine.routeArchetypes.flatMap(({ routeIds }) => routeIds)
  unique(flattenedRoutes, "prototype route archetype assignment")
  equal([...flattenedRoutes].sort(), [...canonicalRouteIds()].sort(), "prototype canonical 36-route closure")
  assert(flattenedRoutes.length === 36, "prototype must cover exactly 36 route IDs")
  assert(engine.territories.length === 3, "prototype must expose exactly A/B/C shells")
  const expectedIds = ["A", "B", "C"]
  engine.territories.forEach((territory, index) => {
    exactKeys(territory, ["territoryId", "internalHypothesis", "participantFacingLabel", "differentiationAxes", "tokenValues", "evaluationStatus", "territoryStatus", "selectionEligible", "renderEnabled"], `prototypeEngine.territories[${index}]`)
    assert(territory.territoryId === expectedIds[index] && territory.participantFacingLabel === expectedIds[index], `territory ${index}: neutral ID mismatch`)
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
  assert(engine.tokenRoles.length >= 70, "prototype token-role shell incomplete")
  unique(engine.tokenRoles, "prototype token roles")
  const render = engine.renderContract
  exactKeys(render, ["rendererCount", "territoryCount", "archetypeCount", "minimumFrameCount", "serverBinding", "assetAllowlist", "crossTerritoryEquality"], "prototypeEngine.renderContract")
  assert(render.rendererCount === 1 && render.territoryCount === 3 && render.archetypeCount === 7 && render.minimumFrameCount === 21, "prototype render matrix mismatch")
  assert(render.serverBinding === "127.0.0.1", "prototype server must bind to loopback")
  equal(render.crossTerritoryEquality, engine.sharedInvariantFields, "prototype equality fields")
  assert(render.assetAllowlist.every((path) => /^content\/assets\/derivatives\/(tools|comparisons|scenes)\/$/.test(path)), "prototype asset allowlist invalid")
  for (const prohibition of ["external-font", "external-icon-pack", "external-image", "public-or-shared-host", "territory-selection", "canonical-promotion"]) assert(engine.prohibitions.includes(prohibition), `prototype missing prohibition ${prohibition}`)
}

const validateEvidence = (evidence) => {
  exactKeys(evidence, ["label", "interfaces", "routeSimulationTasks"], "evidenceInterfaces")
  exactLabel(evidence.label, "evidenceInterfaces.label")
  const ids = ["heuristic-review", "automated-accessibility", "corpus-use", "route-simulation", "owner-dogfood"]
  assert(evidence.interfaces.length === ids.length, "exact five supplementary interfaces required")
  evidence.interfaces.forEach((entry, index) => {
    exactKeys(entry, ["interfaceId", "label", "recordFields", "records", "evidenceClass", "participantCountContribution", "canSatisfyParticipantGate", "canSatisfyOwnerSelection"], `evidenceInterfaces.interfaces[${index}]`)
    assert(entry.interfaceId === ids[index], `evidence interface ${index} ID mismatch`)
    exactLabel(entry.label, `evidence interface ${entry.interfaceId} label`)
    assert(entry.recordFields.length >= 8 && entry.records.length === 0, `evidence interface ${entry.interfaceId} must be an empty template`)
    assert(entry.evidenceClass === "supplementary-only" && entry.participantCountContribution === 0 && entry.canSatisfyParticipantGate === false && entry.canSatisfyOwnerSelection === false, `evidence interface ${entry.interfaceId} cannot satisfy a gate`)
  })
  const taskIds = ["exam-fit-affiliation", "start-short-practice", "compare-pipe-adjustable-wrench", "precommit-primary-action", "neutral-hazard-proceed", "make-material-available-offline", "unavailable-page-recovery"]
  assert(evidence.routeSimulationTasks.length === 7, "seven deterministic route simulations required")
  evidence.routeSimulationTasks.forEach((task, index) => {
    exactKeys(task, ["taskId", "archetypeId", "routeIds", "actorType", "participantCountContribution"], `routeSimulationTasks[${index}]`)
    assert(task.taskId === taskIds[index] && task.actorType === "deterministic-harness" && task.participantCountContribution === 0, `route simulation task ${index} cannot act as a participant`)
  })
}

const validateGateAccounting = (gate) => {
  exactKeys(gate, ["label", "observedParticipantCount", "participantIds", "approvalArtifacts", "matrixRatings", "advancingTerritoryIds", "finalistTerritoryIds", "selectedTerritoryId", "winnerTerritoryId", "recommendedTerritoryId", "hybrid", "canonicalPromotionPerformed", "plan006DoneClaimed"], "gateAccounting")
  exactLabel(gate.label, "gateAccounting.label")
  assert(gate.observedParticipantCount === 0 && gate.participantIds.length === 0, "participant evidence must remain zero")
  assert(gate.approvalArtifacts.length === 0 && gate.matrixRatings.length === 0, "approval/matrix evidence must remain empty")
  assert(gate.advancingTerritoryIds.length === 0 && gate.finalistTerritoryIds.length === 0, "finalists cannot exist in prework")
  assert(gate.selectedTerritoryId === null && gate.winnerTerritoryId === null && gate.recommendedTerritoryId === null, "selection/recommendation must remain null")
  assert(gate.hybrid === false && gate.canonicalPromotionPerformed === false && gate.plan006DoneClaimed === false, "hybrid/promotion/DONE claim forbidden")
}

const validateRecord = (record, options = { repo: false, assetFiles: false }) => {
  exactKeys(record, ["schemaVersion", "artifactId", "schemaPath", "label", "sourceSnapshot", "captureManifest", "assetInventory", "benchmarkTemplate", "prototypeEngine", "evidenceInterfaces", "gateAccounting"], "record")
  assert(record.schemaVersion === 1 && record.artifactId === "plan-006-consumer-visual-system-provisional-prework" && record.schemaPath === schemaPath, "record identity mismatch")
  exactLabel(record.label, "record.label")
  validateSourceSnapshot(record.sourceSnapshot, options)
  validateCaptureManifest(record.captureManifest)
  validateAssetInventory(record.assetInventory, options)
  validateBenchmark(record.benchmarkTemplate)
  validatePrototypeEngine(record.prototypeEngine)
  validateEvidence(record.evidenceInterfaces)
  validateGateAccounting(record.gateAccounting)
}

const expectRejected = (name, record, mutate) => {
  const candidate = jsonClone(record)
  mutate(candidate)
  let rejected = false
  try { validateRecord(candidate, { repo: false, assetFiles: false }) } catch { rejected = true }
  assert(rejected, `negative self-test was accepted: ${name}`)
}

const runNegativeTests = (record) => {
  const tests = [
    ["DONE status", (x) => { x.label.status = "DONE" }],
    ["accepted workflow status", (x) => { x.label.status = "accepted" }],
    ["selected decision", (x) => { x.label.decisionStatus = "selected" }],
    ["participant evidence", (x) => { x.label.participantEvidence = "synthetic" }],
    ["participant count", (x) => { x.gateAccounting.observedParticipantCount = 1 }],
    ["participant row", (x) => { x.gateAccounting.participantIds.push("P01") }],
    ["approval artifact", (x) => { x.gateAccounting.approvalArtifacts.push("https://example.invalid/approval") }],
    ["selected territory", (x) => { x.gateAccounting.selectedTerritoryId = "A" }],
    ["dependency SHA substitution", (x) => { x.label.requiredDependencyShas = { "004": "0".repeat(40), "005": "1".repeat(40) } }],
    ["reverify disabled", (x) => { x.label.mustRebaseAndReverify = false }],
    ["supplementary selection", (x) => { x.evidenceInterfaces.interfaces[0].canSatisfyOwnerSelection = true }],
    ["dogfood participant", (x) => { x.evidenceInterfaces.interfaces[4].participantCountContribution = 1 }],
    ["capture removed", (x) => { x.captureManifest.cases.pop() }],
    ["partial capture promoted", (x) => { x.captureManifest.cases[0].captureId = "fake.png" }],
    ["asset hash tampered", (x) => { x.assetInventory.entries[0].phone.sha256 = "0".repeat(64) }],
    ["attachment hash tampered", (x) => { x.assetInventory.attachmentBaseline.entries[0].sha256 = "0".repeat(64) }],
    ["attachment HTML promoted", (x) => { x.assetInventory.attachmentBaseline.entries[1].useStatus = "use-only-via-byte-identical-canonical-repo-derivative" }],
    ["attachment rights fabricated", (x) => { x.assetInventory.attachmentBaseline.entries[1].rightsStatus = "pass" }],
    ["source ledger hash tampered", (x) => { x.assetInventory.sourceLedgers[0].sha256 = "0".repeat(64) }],
    ["candidate source", (x) => { x.assetInventory.entries[0].phone.path = "content/assets/candidates/tools/a001.png" }],
    ["use gate altered", (x) => { x.assetInventory.entries.find((entry) => entry.opaqueAssetId === "t021").use.gate = null }],
    ["route duplicated", (x) => { x.prototypeEngine.routeArchetypes[0].routeIds.push("home") }],
    ["territory copy override", (x) => { x.prototypeEngine.territories[0].copy = "invented" }],
    ["territories collapse", (x) => { x.prototypeEngine.territories[1].differentiationAxes = [...x.prototypeEngine.territories[0].differentiationAxes] }],
    ["territory token values", (x) => { x.prototypeEngine.territories[0].tokenValues = { action: "#000" } }],
    ["territory rendering enabled", (x) => { x.prototypeEngine.territories[0].renderEnabled = true }],
    ["unknown root field", (x) => { x.unreviewed = true }],
    ["matrix rating", (x) => { x.gateAccounting.matrixRatings.push({ territoryId: "A", rating: 5 }) }],
    ["recommended territory", (x) => { x.gateAccounting.recommendedTerritoryId = "A" }],
    ["canonical promotion", (x) => { x.gateAccounting.canonicalPromotionPerformed = true }],
    ["Plan 006 DONE", (x) => { x.gateAccounting.plan006DoneClaimed = true }],
    ["future language smuggled", (x) => { x.prototypeEngine.futureInputs.language.sourceSha = "0".repeat(40) }]
  ]
  for (const [name, mutate] of tests) expectRejected(name, record, mutate)
  let duplicateRejected = false
  try { parseJsonStrict('{"status":"provisional-prework","status":"DONE"}', "duplicate-key-self-test") } catch { duplicateRejected = true }
  assert(duplicateRejected, "duplicate-key self-test was accepted")
  let scopeRejected = false
  try { validateScopePaths([...allowedPaths, "product/DESIGN_SYSTEM.md"]) } catch { scopeRejected = true }
  assert(scopeRejected, "out-of-scope-path self-test was accepted")
  return tests.length + 2
}

const markdown = readText(markdownPath)
const schemaText = readText(schemaPath)
const validatorText = readText(validatorPath)
const exactComment = `{"status":"provisional-prework","participantEvidence":"none","decisionStatus":"pending","requiredDependencyShas":null,"mustRebaseAndReverify":true}`
assert(markdown.includes(`<!-- artifact-label: ${exactComment} -->`), `${markdownPath}: machine label missing`)
assert(validatorText.startsWith(`// artifact-label: ${exactComment}\n`), `${validatorPath}: machine label missing`)
const schema = parseJsonStrict(schemaText.trimEnd(), schemaPath)
equal(schema["x-artifactLabel"], ARTIFACT_LABEL, `${schemaPath} x-artifactLabel`)
assert(schema.$schema === "https://json-schema.org/draft/2020-12/schema" && schema.additionalProperties === false, `${schemaPath}: strict Draft 2020-12 root required`)
const record = extractMachineRecord(markdown)
validateRecord(record, { repo: true, assetFiles: true })
validateGitScope(record.sourceSnapshot.sourceMainSha)
const negativeTestCount = runNegativeTests(record)

console.log(
  `plan006-prework ok status=provisional-prework capture_cases=${record.captureManifest.cases.length} ` +
  `assets=${record.assetInventory.entries.length} tools=${record.assetInventory.counts.tool} ` +
  `comparisons=${record.assetInventory.counts.comparison} scenes=${record.assetInventory.counts.scene} ` +
  `attachment_entries=${record.assetInventory.attachmentBaseline.entries.length} ` +
  `benchmark_slots=${record.benchmarkTemplate.acquisitionSlots.length} territories=${record.prototypeEngine.territories.length} ` +
  `archetypes=${record.prototypeEngine.routeArchetypes.length} routes=${record.prototypeEngine.routeArchetypes.flatMap(({ routeIds }) => routeIds).length} ` +
  `participants=${record.gateAccounting.observedParticipantCount} approvals=${record.gateAccounting.approvalArtifacts.length} ` +
  `decision=${record.label.decisionStatus} negative_tests=${negativeTestCount}`
)
