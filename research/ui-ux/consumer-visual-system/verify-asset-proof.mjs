#!/usr/bin/env node

import { createHash } from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { semanticFingerprintInput } from "./prototype.mjs"

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = resolve(SCRIPT_DIR, "../../..")
const AUDIT_PATH = "research/ui-ux/consumer-visual-system/asset-audit.tsv"

const QUALITATIVE_FIELDS = Object.freeze([
  "asset_type",
  "stable_id",
  "opaque_asset_id",
  "revision",
  "review_surface",
  "visual_mode",
  "aspect_ratio",
  "background_mode",
  "detail_density",
  "phone_legibility",
  "print_legibility",
  "crop_tolerance",
  "permitted_contexts",
  "prohibited_contexts",
  "identity_fit",
  "slop_flags",
  "disposition",
  "notes"
])

const PROOF_FIELDS = Object.freeze([
  "reviewMode",
  "humanEvidence",
  "humanParticipantCount",
  "humanReviewRequired",
  "notHumanUsabilityTested",
  "release_ledger_path",
  "release_ledger_sha256",
  "release_record_coordinate",
  "review_coordinate",
  "review_record_sha256",
  "rights_coordinates_json",
  "rights_records_sha256",
  "gate_kind",
  "gate_coordinate",
  "gate_text_json",
  "phone_path",
  "phone_bytes",
  "phone_sha256",
  "phone_width",
  "phone_height",
  "phone_ledger_coordinate",
  "print_path",
  "print_bytes",
  "print_sha256",
  "print_width",
  "print_height",
  "print_ledger_coordinate",
  "rendered_in_prototype",
  "prototype_usage_coordinate",
  "delivery_contract"
])

export const ASSET_AUDIT_FIELDS = Object.freeze([...QUALITATIVE_FIELDS, ...PROOF_FIELDS])

export const ASSET_PROOF_METADATA = Object.freeze({
  schemaVersion: 1,
  protocolId: "CODEX-ONLY-UIUX-V1",
  reviewMode: "codex-only",
  humanEvidence: "none",
  humanParticipantCount: 0,
  humanReviewRequired: false,
  notHumanUsabilityTested: true,
  expectedRows: 97,
  expectedCounts: Object.freeze({ tool: 65, comparison: 14, scene: 18 }),
  sourceLedgers: Object.freeze([
    Object.freeze({
      path: "content/authoring/visuals/releases/tools.json",
      sha256: "5e763aa5e12df9f2f5e1a0e5c08b84a0e523326269bcded83d17d20a1d54759e"
    }),
    Object.freeze({
      path: "content/authoring/visuals/releases/comparisons.json",
      sha256: "34414a456e8274354a41c463e06337cba5ecd5abc57c4c4e8efafd7626e0a3ca"
    }),
    Object.freeze({
      path: "content/authoring/visuals/releases/scenes.json",
      sha256: "6081789eb15f4cd49d3ba519476e56a2da05a7bdde5ea66ca64ae74e2a75018a"
    }),
    Object.freeze({
      path: "content/authoring/visuals/releases/scene-qa-ledger.json",
      sha256: "2251dcf122b1d1562060d8c20134d032044c4718f72f5e38cd4b229bce7bae31"
    })
  ]),
  qualitativeAuditSha256: "b9121211a5cb25fb99166d11393c9f7cf84ec3c422011361891c17c6d86acdb4"
})

export const RENDERED_DERIVATIVE_BINDINGS = Object.freeze([
  Object.freeze({
    assetType: "tool",
    stableId: "tool.pipe-wrench",
    opaqueAssetId: "t037",
    revision: "2",
    derivativeKind: "phone",
    path: "content/assets/derivatives/tools/t037-phone.png",
    bytes: 65906,
    sha256: "1030db9971d5bcee354dda2a70317c90a1db963f5578827e6efbecb39ae20770",
    width: 320,
    height: 320,
    frameId: "browse-tool-detail",
    prototypeUsageCoordinate: "research/ui-ux/consumer-visual-system/prototype.mjs#semanticFingerprintInput.frames[frameId=browse-tool-detail].asset"
  }),
  Object.freeze({
    assetType: "comparison",
    stableId: "comparison.pipe-adjustable-wrench",
    opaqueAssetId: "p002",
    revision: "2",
    derivativeKind: "phone",
    path: "content/assets/derivatives/comparisons/p002-phone.png",
    bytes: 123286,
    sha256: "55c25683fc23737094d36010ac883851b12b47dc62d75eb1df32f63bb45fae08",
    width: 640,
    height: 320,
    frameId: "browse-comparison",
    prototypeUsageCoordinate: "research/ui-ux/consumer-visual-system/prototype.mjs#semanticFingerprintInput.frames[frameId=browse-comparison].asset"
  }),
  Object.freeze({
    assetType: "scene",
    stableId: "scene.slip.hallway-wet-floor",
    opaqueAssetId: "s001",
    revision: "n/a",
    derivativeKind: "phone",
    path: "content/assets/derivatives/scenes/s001-phone.png",
    bytes: 412605,
    sha256: "39a7fb59d35b2ff5848a6294205200e34f6b78ec6dd4e11f72614d3eab0a9dd3",
    width: 720,
    height: 480,
    frameId: "focused-hazard-precommit",
    prototypeUsageCoordinate: "research/ui-ux/consumer-visual-system/prototype.mjs#semanticFingerprintInput.frames[frameId=focused-hazard-precommit].asset"
  })
])

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex")

const canonicalJson = (value) => {
  if (value === null || typeof value !== "object") return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`
}

const recordSha256 = (value) => sha256(Buffer.from(canonicalJson(value), "utf8"))

const fail = (message) => {
  throw new Error(`asset-proof: ${message}`)
}

const assert = (condition, message) => {
  if (!condition) fail(message)
}

const repoBytes = (path) => readFile(resolve(REPO_ROOT, path))

const readJson = async (path) => JSON.parse(await readFile(resolve(REPO_ROOT, path), "utf8"))

const parseTsv = (text) => {
  assert(!text.includes("\r"), `${AUDIT_PATH} must use LF line endings`)
  assert(text.endsWith("\n"), `${AUDIT_PATH} must end in one LF`)
  const lines = text.slice(0, -1).split("\n")
  const fields = lines[0].split("\t")
  const rows = lines.slice(1).map((line, rowIndex) => {
    const values = line.split("\t")
    assert(values.length === fields.length, `${AUDIT_PATH} row ${rowIndex + 2} has ${values.length} cells; expected ${fields.length}`)
    return Object.fromEntries(fields.map((field, index) => [field, values[index]]))
  })
  return { fields, rows }
}

const serializeTsv = (rows, fields = ASSET_AUDIT_FIELDS) => {
  const lines = [fields.join("\t")]
  for (const [rowIndex, row] of rows.entries()) {
    const values = fields.map((field) => {
      const value = String(row[field] ?? "")
      assert(!/[\t\r\n]/u.test(value), `row ${rowIndex + 2} field ${field} contains a TSV delimiter`)
      return value
    })
    lines.push(values.join("\t"))
  }
  return `${lines.join("\n")}\n`
}

const pngDimensions = (bytes, path) => {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  assert(bytes.length >= 24, `${path} is too short to be a PNG`)
  assert(bytes.subarray(0, 8).equals(signature), `${path} does not have a PNG signature`)
  assert(bytes.toString("ascii", 12, 16) === "IHDR", `${path} does not begin with an IHDR chunk`)
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}

const derivativeDimensions = (derivative, bytes) => {
  const measured = pngDimensions(bytes, derivative.path)
  if (derivative.dimensions !== undefined) {
    assert(derivative.dimensions.width === measured.width, `${derivative.path} ledger width does not match PNG`)
    assert(derivative.dimensions.height === measured.height, `${derivative.path} ledger height does not match PNG`)
  } else {
    const settingsDimensions = /^(\d+)x(\d+)\b/u.exec(derivative.settings ?? "")
    assert(settingsDimensions !== null, `${derivative.path} ledger settings do not declare dimensions`)
    assert(Number(settingsDimensions[1]) === measured.width, `${derivative.path} settings width does not match PNG`)
    assert(Number(settingsDimensions[2]) === measured.height, `${derivative.path} settings height does not match PNG`)
  }
  return measured
}

const acceptedEntry = (assetType, entry) => assetType === "comparison"
  ? entry.status === "accepted"
  : entry.productionStatus === "accepted"

const sourceConfig = Object.freeze([
  Object.freeze({
    assetType: "tool",
    path: "content/authoring/visuals/releases/tools.json",
    stableId: (entry) => entry.conceptId,
    revision: (entry) => String(entry.assetRevision),
    gateKind: "publicationGate"
  }),
  Object.freeze({
    assetType: "comparison",
    path: "content/authoring/visuals/releases/comparisons.json",
    stableId: (entry) => entry.id,
    revision: (entry) => String(entry.assetRevision),
    gateKind: "scoredUseGate"
  }),
  Object.freeze({
    assetType: "scene",
    path: "content/authoring/visuals/releases/scenes.json",
    stableId: (entry) => entry.sceneId,
    revision: () => "n/a",
    gateKind: "publicationGate"
  })
])

const auditKey = ({ asset_type, stable_id, opaque_asset_id, revision }) =>
  `${asset_type}\u0000${stable_id}\u0000${opaque_asset_id}\u0000${revision}`

const expectedKey = ({ assetType, stableId, opaqueAssetId, revision }) =>
  `${assetType}\u0000${stableId}\u0000${opaqueAssetId}\u0000${revision}`

const assertDerivative = async (entry, entryIndex, ledgerPath, kind) => {
  const derivativeIndex = entry.derivatives.findIndex((candidate) => candidate.kind === kind)
  assert(derivativeIndex >= 0, `${ledgerPath}#/${entryIndex} has no ${kind} derivative`)
  assert(entry.derivatives.filter((candidate) => candidate.kind === kind).length === 1, `${ledgerPath}#/${entryIndex} has duplicate ${kind} derivatives`)
  const derivative = entry.derivatives[derivativeIndex]
  assert(/^content\/assets\/derivatives\/(tools|comparisons|scenes)\/[tps]\d{3}-(phone|print)\.png$/u.test(derivative.path), `${derivative.path} is not an accepted delivery-derivative path`)
  const bytes = await repoBytes(derivative.path)
  assert(bytes.length === derivative.bytes, `${derivative.path} byte length ${bytes.length} does not match ledger ${derivative.bytes}`)
  const digest = sha256(bytes)
  assert(digest === derivative.sha256, `${derivative.path} SHA-256 ${digest} does not match ledger ${derivative.sha256}`)
  const dimensions = derivativeDimensions(derivative, bytes)
  return {
    path: derivative.path,
    bytes: derivative.bytes,
    sha256: derivative.sha256,
    width: dimensions.width,
    height: dimensions.height,
    ledgerCoordinate: `${ledgerPath}#/${entryIndex}/derivatives/${derivativeIndex}`
  }
}

const checkPinnedLedgerDigests = async () => {
  for (const source of ASSET_PROOF_METADATA.sourceLedgers) {
    const digest = sha256(await repoBytes(source.path))
    assert(digest === source.sha256, `${source.path} SHA-256 ${digest} does not match pinned ${source.sha256}`)
  }
}

const qualitativeRowsSha256 = (rows) => sha256(Buffer.from(serializeTsv(rows, QUALITATIVE_FIELDS), "utf8"))

const buildContext = async () => {
  await checkPinnedLedgerDigests()
  const toolLedger = await readJson("content/authoring/visuals/releases/tools.json")
  const sceneQaLedger = await readJson("content/authoring/visuals/releases/scene-qa-ledger.json")
  const toolIndex = new Map(toolLedger.map((entry, index) => [entry.conceptId, { entry, index }]))
  const sceneQaIndex = new Map(sceneQaLedger.map((entry, index) => [entry.sceneId, { entry, index }]))
  assert(toolIndex.size === toolLedger.length, "tool ledger has duplicate concept IDs")
  assert(sceneQaIndex.size === sceneQaLedger.length, "scene QA ledger has duplicate scene IDs")
  return { toolIndex, sceneQaIndex }
}

const reviewAndRights = (assetType, entry, entryIndex, ledgerPath, context) => {
  if (assetType === "scene") {
    const qa = context.sceneQaIndex.get(entry.sceneId)
    assert(qa !== undefined, `${entry.sceneId} has no scene QA record`)
    assert(qa.entry.opaqueAssetId === entry.opaqueAssetId, `${entry.sceneId} scene QA opaque ID does not match release`)
    assert(qa.entry.overall === "accepted", `${entry.sceneId} scene QA overall is not accepted`)
    const reviewCoordinate = `content/authoring/visuals/releases/scene-qa-ledger.json#/${qa.index}/reviews`
    const rightsCoordinates = [`content/authoring/visuals/releases/scene-qa-ledger.json#/${qa.index}/reviews/rightsAndProvenance`]
    const rightsRecords = [{ coordinate: rightsCoordinates[0], value: qa.entry.reviews.rightsAndProvenance }]
    return {
      reviewCoordinate,
      reviewRecordSha256: recordSha256(qa.entry.reviews),
      rightsCoordinates,
      rightsRecordsSha256: recordSha256(rightsRecords)
    }
  }

  assert(entry.review !== null && typeof entry.review === "object", `${ledgerPath}#/${entryIndex}/review is missing`)
  const reviewCoordinate = `${ledgerPath}#/${entryIndex}/review`
  if (assetType === "tool") {
    assert(typeof entry.review.rightsSimilarity === "string" && entry.review.rightsSimilarity.length > 0, `${entry.conceptId} has no rightsSimilarity review`)
    const rightsCoordinates = [`${reviewCoordinate}/rightsSimilarity`]
    const rightsRecords = [{ coordinate: rightsCoordinates[0], value: entry.review.rightsSimilarity }]
    return {
      reviewCoordinate,
      reviewRecordSha256: recordSha256(entry.review),
      rightsCoordinates,
      rightsRecordsSha256: recordSha256(rightsRecords)
    }
  }

  assert(entry.review.acceptedMasterInputsOnly === true, `${entry.id} does not attest accepted master inputs only`)
  assert(entry.review.noFeatureBorrowing === true, `${entry.id} does not attest no feature borrowing`)
  const rightsRecords = [
    { coordinate: `${reviewCoordinate}/acceptedMasterInputsOnly`, value: entry.review.acceptedMasterInputsOnly },
    { coordinate: `${reviewCoordinate}/noFeatureBorrowing`, value: entry.review.noFeatureBorrowing }
  ]
  for (const memberId of entry.memberIds) {
    const member = context.toolIndex.get(memberId)
    assert(member !== undefined, `${entry.id} member ${memberId} has no tool release`)
    assert(acceptedEntry("tool", member.entry), `${entry.id} member ${memberId} is not accepted`)
    assert(typeof member.entry.review?.rightsSimilarity === "string", `${entry.id} member ${memberId} has no rights review`)
    rightsRecords.push({
      coordinate: `content/authoring/visuals/releases/tools.json#/${member.index}/review/rightsSimilarity`,
      value: member.entry.review.rightsSimilarity
    })
  }
  return {
    reviewCoordinate,
    reviewRecordSha256: recordSha256(entry.review),
    rightsCoordinates: rightsRecords.map(({ coordinate }) => coordinate),
    rightsRecordsSha256: recordSha256(rightsRecords)
  }
}

const prototypeBindingByKey = new Map(RENDERED_DERIVATIVE_BINDINGS.map((binding) => [expectedKey(binding), binding]))

const assertPrototypeBindings = () => {
  const assetFrames = semanticFingerprintInput.frames.filter(({ asset }) => asset !== null)
  assert(assetFrames.length === RENDERED_DERIVATIVE_BINDINGS.length, `prototype renders ${assetFrames.length} asset frames; expected ${RENDERED_DERIVATIVE_BINDINGS.length}`)
  const seenFrames = new Set()
  for (const binding of RENDERED_DERIVATIVE_BINDINGS) {
    const frame = assetFrames.find(({ frameId }) => frameId === binding.frameId)
    assert(frame !== undefined, `prototype frame ${binding.frameId} is missing`)
    assert(!seenFrames.has(frame.frameId), `prototype frame ${frame.frameId} is bound more than once`)
    seenFrames.add(frame.frameId)
    assert(frame.asset.stableId === binding.stableId, `${binding.frameId} stable ID does not match binding`)
    assert(frame.asset.opaqueAssetId === binding.opaqueAssetId, `${binding.frameId} opaque ID does not match binding`)
    assert(frame.asset.path === `/${binding.path}`, `${binding.frameId} path ${frame.asset.path} does not match accepted derivative /${binding.path}`)
  }
  for (const frame of assetFrames) {
    assert(/^\/content\/assets\/derivatives\/(tools|comparisons|scenes)\/[tps]\d{3}-phone\.png$/u.test(frame.asset.path), `${frame.frameId} renders a non-phone or non-delivery asset ${frame.asset.path}`)
  }
}

export const buildAssetProofRows = async (qualitativeRows) => {
  assert(qualitativeRows.length === ASSET_PROOF_METADATA.expectedRows, `qualitative audit has ${qualitativeRows.length} rows; expected ${ASSET_PROOF_METADATA.expectedRows}`)
  const context = await buildContext()
  const qualitativeByKey = new Map()
  for (const row of qualitativeRows) {
    const key = auditKey(row)
    assert(!qualitativeByKey.has(key), `duplicate qualitative audit key ${key.replaceAll("\u0000", "/")}`)
    qualitativeByKey.set(key, row)
  }

  const generated = []
  const counts = { tool: 0, comparison: 0, scene: 0 }
  for (const source of sourceConfig) {
    const ledgerBytes = await repoBytes(source.path)
    const ledgerSha256 = sha256(ledgerBytes)
    const ledger = JSON.parse(ledgerBytes.toString("utf8"))
    for (const [entryIndex, entry] of ledger.entries()) {
      if (!acceptedEntry(source.assetType, entry)) continue
      counts[source.assetType] += 1
      const identity = {
        assetType: source.assetType,
        stableId: source.stableId(entry),
        opaqueAssetId: entry.opaqueAssetId,
        revision: source.revision(entry)
      }
      const key = expectedKey(identity)
      const qualitative = qualitativeByKey.get(key)
      assert(qualitative !== undefined, `accepted release ${key.replaceAll("\u0000", "/")} has no qualitative audit row`)
      qualitativeByKey.delete(key)

      const phone = await assertDerivative(entry, entryIndex, source.path, "phone")
      const print = await assertDerivative(entry, entryIndex, source.path, "print")
      const reviewRights = reviewAndRights(source.assetType, entry, entryIndex, source.path, context)
      const gateCoordinate = `${source.path}#/${entryIndex}/${source.gateKind}`
      assert(Object.hasOwn(entry, source.gateKind), `${gateCoordinate} is absent`)
      const binding = prototypeBindingByKey.get(key)
      if (binding !== undefined) {
        assert(binding.path === phone.path, `${identity.opaqueAssetId} rendered path does not bind its phone derivative`)
        assert(binding.bytes === phone.bytes, `${identity.opaqueAssetId} rendered byte length does not match pinned binding`)
        assert(binding.sha256 === phone.sha256, `${identity.opaqueAssetId} rendered SHA-256 does not match pinned binding`)
        assert(binding.width === phone.width && binding.height === phone.height, `${identity.opaqueAssetId} rendered dimensions do not match pinned binding`)
      }

      assert(qualitative.review_surface === `phone=${phone.path};print=${print.path}`, `${identity.opaqueAssetId} qualitative review_surface does not match accepted phone/print derivatives`)

      generated.push({
        ...Object.fromEntries(QUALITATIVE_FIELDS.map((field) => [field, qualitative[field]])),
        reviewMode: ASSET_PROOF_METADATA.reviewMode,
        humanEvidence: ASSET_PROOF_METADATA.humanEvidence,
        humanParticipantCount: String(ASSET_PROOF_METADATA.humanParticipantCount),
        humanReviewRequired: String(ASSET_PROOF_METADATA.humanReviewRequired),
        notHumanUsabilityTested: String(ASSET_PROOF_METADATA.notHumanUsabilityTested),
        release_ledger_path: source.path,
        release_ledger_sha256: ledgerSha256,
        release_record_coordinate: `${source.path}#/${entryIndex}`,
        review_coordinate: reviewRights.reviewCoordinate,
        review_record_sha256: reviewRights.reviewRecordSha256,
        rights_coordinates_json: JSON.stringify(reviewRights.rightsCoordinates),
        rights_records_sha256: reviewRights.rightsRecordsSha256,
        gate_kind: source.gateKind,
        gate_coordinate: gateCoordinate,
        gate_text_json: JSON.stringify(entry[source.gateKind]),
        phone_path: phone.path,
        phone_bytes: String(phone.bytes),
        phone_sha256: phone.sha256,
        phone_width: String(phone.width),
        phone_height: String(phone.height),
        phone_ledger_coordinate: phone.ledgerCoordinate,
        print_path: print.path,
        print_bytes: String(print.bytes),
        print_sha256: print.sha256,
        print_width: String(print.width),
        print_height: String(print.height),
        print_ledger_coordinate: print.ledgerCoordinate,
        rendered_in_prototype: String(binding !== undefined),
        prototype_usage_coordinate: binding?.prototypeUsageCoordinate ?? "",
        delivery_contract: "accepted-delivery-derivatives-byte-identical-only"
      })
    }
  }

  assert(qualitativeByKey.size === 0, `qualitative audit has ${qualitativeByKey.size} row(s) without an accepted release join`)
  for (const [assetType, expected] of Object.entries(ASSET_PROOF_METADATA.expectedCounts)) {
    assert(counts[assetType] === expected, `${assetType} accepted count ${counts[assetType]} does not match ${expected}`)
  }
  assert(generated.length === ASSET_PROOF_METADATA.expectedRows, `generated ${generated.length} proof rows; expected ${ASSET_PROOF_METADATA.expectedRows}`)
  assert(generated.filter(({ rendered_in_prototype }) => rendered_in_prototype === "true").length === RENDERED_DERIVATIVE_BINDINGS.length, "rendered derivative binding count does not close")
  assertPrototypeBindings()
  return generated
}

export const verifyAssetProof = async ({ write = false } = {}) => {
  const auditText = await readFile(resolve(REPO_ROOT, AUDIT_PATH), "utf8")
  const parsed = parseTsv(auditText)
  const hasProofFields = parsed.fields.length === ASSET_AUDIT_FIELDS.length
  if (write) {
    assert(
      parsed.fields.join("\u0000") === (hasProofFields ? ASSET_AUDIT_FIELDS : QUALITATIVE_FIELDS).join("\u0000"),
      `${AUDIT_PATH} has an unsupported header`
    )
  } else {
    assert(parsed.fields.join("\u0000") === ASSET_AUDIT_FIELDS.join("\u0000"), `${AUDIT_PATH} header does not match exported contract`)
  }

  const qualitativeRows = parsed.rows.map((row) => Object.fromEntries(QUALITATIVE_FIELDS.map((field) => [field, row[field]])))
  const qualitativeDigest = qualitativeRowsSha256(qualitativeRows)
  assert(qualitativeDigest === ASSET_PROOF_METADATA.qualitativeAuditSha256, `qualitative audit SHA-256 ${qualitativeDigest} does not match pinned ${ASSET_PROOF_METADATA.qualitativeAuditSha256}`)
  const rows = await buildAssetProofRows(qualitativeRows)
  const expectedText = serializeTsv(rows)
  if (write) {
    await writeFile(resolve(REPO_ROOT, AUDIT_PATH), expectedText, "utf8")
  } else {
    assert(auditText === expectedText, `${AUDIT_PATH} bytes differ from deterministic recomputation`)
  }
  return {
    rows: rows.length,
    counts: ASSET_PROOF_METADATA.expectedCounts,
    renderedDerivativeBindings: RENDERED_DERIVATIVE_BINDINGS.length,
    qualitativeAuditSha256: qualitativeDigest,
    assetAuditSha256: sha256(Buffer.from(expectedText, "utf8")),
    wrote: write
  }
}

const isMain = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const unknownArguments = process.argv.slice(2).filter((argument) => argument !== "--write")
  assert(unknownArguments.length === 0, `unknown argument(s): ${unknownArguments.join(", ")}`)
  const result = await verifyAssetProof({ write: process.argv.includes("--write") })
  process.stdout.write(`asset-proof ok rows=${result.rows} tools=${result.counts.tool} comparisons=${result.counts.comparison} scenes=${result.counts.scene} rendered=${result.renderedDerivativeBindings} qualitative_sha256=${result.qualitativeAuditSha256} audit_sha256=${result.assetAuditSha256} wrote=${result.wrote}\n`)
}
