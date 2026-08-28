import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const fail = (message) => {
  throw new Error(message)
}

const sha256 = (value) => createHash("sha256").update(value).digest("hex")
const hashToken = (value) => sha256(`NONPARTICIPANT-EXAMPLE:${value}`)
const utc = "2026-01-01T00:00:00Z"

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, "..")
const contractPath = resolve(scriptDirectory, "004-005-fieldwork-schema-contract.json")
const packetPath = resolve(scriptDirectory, "004-005-fieldwork-operations-packet.md")
const zeroCostKitPath = resolve(scriptDirectory, "004-005-zero-cost-fieldwork-kit.md")
const unpaidTermsPath = resolve(scriptDirectory, "004-005-fieldwork-unpaid-terms.v1.tsv")
const nonParticipantTemplatePath = resolve(scriptDirectory, "004-005-nonparticipant-evidence.v1.tsv")
const recoveryRoot = resolve(repositoryRoot, "recovery/plan-004-consumer-language-prototypes")

const contractSource = await readFile(contractPath, "utf8")
const packet = await readFile(packetPath, "utf8")
const zeroCostKit = await readFile(zeroCostKitPath, "utf8")
const unpaidTermsSource = await readFile(unpaidTermsPath, "utf8")
const nonParticipantTemplateSource = await readFile(nonParticipantTemplatePath, "utf8")

// JSON.parse accepts duplicate object keys. This scanner rejects them before
// parsing so an earlier schema member cannot be silently shadowed.
const assertNoDuplicateJsonKeys = (source, label) => {
  let index = 0
  const syntax = (message) => fail(`${label}:${index}: ${message}`)
  const whitespace = () => {
    while (/\s/.test(source[index] ?? "")) index += 1
  }
  const string = () => {
    if (source[index] !== '"') syntax("expected string")
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
    syntax("unterminated string")
  }
  const value = (path) => {
    whitespace()
    if (source[index] === "{") return object(path)
    if (source[index] === "[") return array(path)
    if (source[index] === '"') return string()
    const match = source.slice(index).match(/^(?:-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?|true|false|null)/)
    if (!match) syntax("invalid JSON value")
    index += match[0].length
  }
  const object = (path) => {
    index += 1
    whitespace()
    const keys = new Set()
    if (source[index] === "}") {
      index += 1
      return
    }
    while (index < source.length) {
      whitespace()
      const key = string()
      if (keys.has(key)) fail(`${label}: duplicate object key ${path}.${key}`)
      keys.add(key)
      whitespace()
      if (source[index] !== ":") syntax("expected colon")
      index += 1
      value(`${path}.${key}`)
      whitespace()
      if (source[index] === "}") {
        index += 1
        return
      }
      if (source[index] !== ",") syntax("expected comma")
      index += 1
    }
    syntax("unterminated object")
  }
  const array = (path) => {
    index += 1
    whitespace()
    if (source[index] === "]") {
      index += 1
      return
    }
    let position = 0
    while (index < source.length) {
      value(`${path}[${position}]`)
      position += 1
      whitespace()
      if (source[index] === "]") {
        index += 1
        return
      }
      if (source[index] !== ",") syntax("expected comma")
      index += 1
    }
    syntax("unterminated array")
  }
  whitespace()
  value("$")
  whitespace()
  if (index !== source.length) syntax("trailing JSON input")
}

assertNoDuplicateJsonKeys(contractSource, "schema-contract")
let duplicateKeyMutationRejected = false
try {
  assertNoDuplicateJsonKeys('{"a":1,"a":2}', "duplicate-key-mutation")
} catch {
  duplicateKeyMutationRejected = true
}
if (!duplicateKeyMutationRejected) fail("duplicate-key mutation was accepted")
let mutationCheckCount = 1

const contract = JSON.parse(contractSource)
const recoveryManifestSource = await readFile(resolve(recoveryRoot, "recovery-manifest.json"), "utf8")
assertNoDuplicateJsonKeys(recoveryManifestSource, "recovery-manifest")
const recoveryManifest = JSON.parse(recoveryManifestSource)

if (contract.schemaVersion !== 2) fail("unexpected contract schema version")
if (contract.protocolVersion !== "FW-004-005-v2") fail("unexpected protocol version")
if (contract.releasedMainSha !== "9fc7dcacfc961752e5d9a2cedbc426deead54a05") fail("released main SHA drift")
if (contract.recoverySetSha256 !== "f1ef0a2dec44ae04c8c2b3e8f94fe9e59b3c38a54d3310ae50b4b7dde10ecf14") fail("recovery-set SHA drift")

const zeroBudget = contract.zeroBudgetPolicy
if (zeroBudget?.version !== "ZERO-BUDGET-UNPAID-V1" || zeroBudget.programMode !== "zero-budget-pre-business") fail("zero-budget policy identity drift")
if (zeroBudget.adultParticipation !== "explicitly-voluntary-only" || zeroBudget.participantEvidenceSource !== "actual-or-likely-user-volunteers-only") fail("zero-budget participant source drift")
if (zeroBudget.normalSmallRoundTarget?.minimum !== 4 || zeroBudget.normalSmallRoundTarget?.maximum !== 8 || zeroBudget.normalSmallRoundTarget?.interpretation !== "directional-not-statistically-generalizable" || zeroBudget.normalSmallRoundTarget?.targetIsNotCompletion !== true) fail("small-round policy drift")
if (zeroBudget.recording?.recordingUsed !== false || zeroBudget.recording.recordingTypesCode !== "n/a" || zeroBudget.recording.recordingConsentCode !== "not-requested" || [zeroBudget.recording.recordingToolCode, zeroBudget.recording.recordingStorageCode, zeroBudget.recording.recordingRetentionCode, zeroBudget.recording.recordingDeletionCode].some((value) => value !== "n/a") || zeroBudget.recording.ledgerEvent !== "recording-not-used" || zeroBudget.recording.projectionState !== "not-requested") fail("no-recording policy drift")
const zeroBudgetCompensation = zeroBudget.compensation
if (zeroBudgetCompensation.termsCode !== "unpaid" || zeroBudgetCompensation.amountCurrencyMinor !== "0" || [zeroBudgetCompensation.currencyCode, zeroBudgetCompensation.fundingOwnerCode, zeroBudgetCompensation.fundingVerificationSha256, zeroBudgetCompensation.deliveryMethodCode, zeroBudgetCompensation.paymentRailCode, zeroBudgetCompensation.deliveryDeadlineCode].some((value) => value !== "n/a") || zeroBudgetCompensation.withdrawalPaymentCode !== "n/a-unpaid" || zeroBudgetCompensation.noShowChargeCurrencyMinor !== "0" || zeroBudgetCompensation.cancellationChargeCurrencyMinor !== "0") fail("unpaid compensation policy drift")
for (const [textField, hashField] of [["noShowTermsText", "noShowTermsSha256"], ["cancellationTermsText", "cancellationTermsSha256"], ["participantTermsText", "participantTermsSha256"]]) {
  if (sha256(`${zeroBudgetCompensation[textField]}\n`) !== zeroBudgetCompensation[hashField]) fail(`${textField} canonical hash drift`)
}

for (const requiredText of [
  "**Packet version:** `FW-004-005-v2`",
  "`NEEDS ATTENTION — external participant resources`",
  "### 2.1 `PRE-RECRUITMENT`",
  "### 2.2 `PRE-DISCOVERY/PILOT`",
  "### 2.3 `PRE-FORMAL-EXPOSURE`",
  "004-005-fieldwork-schema-contract.json",
  "study-id-activated",
  "keyed-HMAC",
  "exactly eight rows",
  "`treeDirectCount`",
  "`firstClickIncorrectCount`",
  "`researcher-stopped` maps exactly",
  "`ZERO-BUDGET-UNPAID-V1`",
  "`fieldwork-nonparticipant-evidence-v1`",
  "may stop, never pass",
  "NON-PARTICIPANT EVIDENCE — DOES NOT COUNT TOWARD RECRUITMENT, SAMPLE, THRESHOLDS, OR SELECTION",
  "https://www.w3.org/WAI/test-evaluate/involving-users/",
  "https://www.gov.uk/service-manual/user-research/find-user-research-participants",
  "https://www.hhs.gov/ohrp/regulations-and-policy/guidance/faq/informed-consent/index.html",
  contract.releasedMainSha,
  contract.recoverySetSha256,
]) {
  if (!packet.includes(requiredText)) fail(`packet is missing ${requiredText}`)
}

for (const forbiddenText of [
  "Step 1 has not been released",
  "Coordinator Step 1 release | `WAITING`",
  "Every row must be `READY` before the first recruitment contact",
  "formationSha256",
  '"manifest_sha256"',
  '"threshold_declaration_set_sha256"',
  "After consent, generate a private 32-byte operating-system CSPRNG seed",
  "Formal completeness is exactly 12 rows",
  "[PAID VERSION:",
  "approved paid or unpaid terms",
  "If recording is later approved",
]) {
  if (packet.includes(forbiddenText) || JSON.stringify(contract.schemas).includes(forbiddenText)) {
    fail(`retains rejected text: ${forbiddenText}`)
  }
}

if (contract.legacyMigrationSources.length !== 6) fail("legacy migration registry must contain six maintained sources")
for (const source of contract.legacyMigrationSources) {
  if (source.sourcePresence !== "absent-schema-witness" || !Array.isArray(source.exactHeader) || source.exactHeader.length !== source.expectedColumns || new Set(source.exactHeader).size !== source.exactHeader.length) {
    fail(`legacy migration header mismatch for ${source.sourceSchemaId}`)
  }
}

const requiredSchemaKeys = [
  "compensationTerms", "attritionConsent", "attritionProjection", "screener", "nonParticipantEvidence", "schemaMigration",
  "phaseInputManifest", "phaseEvidenceManifest", "plan004Allocation",
  "plan004Participants", "plan004ExposureManifest", "plan004Pilot",
  "plan004TaskObservations", "plan004Issues", "plan004Aggregate",
  "plan005TaskRegistry", "plan005OpenSortSessions", "plan005OpenSortGroups",
  "plan005OpenSortPlacements", "plan005OpenSortExpectations",
  "plan005OpenSortCoding", "plan005OpenSortAggregate",
  "plan005CandidateFormation", "plan005PilotArtifactManifest", "plan005ThresholdSchedule",
  "plan005ThresholdSessions", "plan005ThresholdTrials",
  "plan005ThresholdAggregate", "plan005ThresholdDeclarations",
  "plan005FormalAllocation", "plan005TreeSchedule", "firstClickSchedule",
  "plan005FormalTaskEvidence", "plan005Issues", "plan005FormalAggregate",
  "plan005ProgressionDecision",
]
if (JSON.stringify(Object.keys(contract.schemas).sort()) !== JSON.stringify([...requiredSchemaKeys].sort())) {
  fail("schema registry is missing or adding a schema")
}

const schemaIds = new Set()
for (const [key, schema] of Object.entries(contract.schemas)) {
  if (typeof schema.id !== "string" || schema.id.length === 0) fail(`${key}: missing schema id`)
  if (schemaIds.has(schema.id)) fail(`${key}: duplicate schema id`)
  schemaIds.add(schema.id)
  if (!packet.includes(`\`${schema.id}\``)) fail(`${key}: schema id is not cited by the packet`)

  if (schema.format === "json") {
    if (!Array.isArray(schema.requiredFields) || schema.requiredFields.length === 0 || new Set(schema.requiredFields).size !== schema.requiredFields.length) {
      fail(`${key}: invalid JSON required-field contract`)
    }
    for (const [field, rowContract] of Object.entries({...schema.arrayContracts, ...schema.objectContracts, ...schema.recordContracts})) {
      if (!schema.requiredFields.includes(field)) fail(`${key}: nested contract ${field} is not required`)
      if (!Array.isArray(rowContract.fields) || rowContract.fields.length === 0 || new Set(rowContract.fields).size !== rowContract.fields.length) {
        fail(`${key}.${field}: incomplete exact row shape`)
      }
    }
    continue
  }

  if (!Array.isArray(schema.header) || schema.header[0] !== "schema_version" || new Set(schema.header).size !== schema.header.length) {
    fail(`${key}: invalid exact TSV header`)
  }
  for (const name of [...schema.primaryKey, ...schema.sortKey, ...(schema.nullableFields ?? []), ...Object.keys(schema.enums ?? {}), ...Object.keys(schema.patterns ?? {}), ...Object.keys(schema.multiValueFields ?? {})]) {
    if (!schema.header.includes(name)) fail(`${key}: rule references absent field ${name}`)
  }
  for (const domain of Object.values(schema.multiValueFields ?? {})) {
    if (!contract.multiValueDomains[domain]) fail(`${key}: unknown multi-value domain ${domain}`)
  }
  for (const [field, values] of Object.entries(schema.enums ?? {})) {
    if (!Array.isArray(values) || values.length === 0 || values.some((value) => typeof value !== "string") || new Set(values).size !== values.length) {
      fail(`${key}.${field}: invalid enum`)
    }
  }
}

for (const [key, schema] of Object.entries(contract.schemas)) {
  for (const foreignKey of schema.foreignKeys ?? []) {
    const target = contract.schemas[foreignKey.schema]
    if (!target) fail(`${key}: unknown foreign-key schema ${foreignKey.schema}`)
    if (foreignKey.fields.length !== foreignKey.fieldsThere.length) fail(`${key}: foreign-key arity mismatch`)
    if (foreignKey.fields.some((field) => !schema.header.includes(field))) fail(`${key}: foreign-key source field absent`)
    if (foreignKey.fieldsThere.some((field) => !target.header.includes(field))) fail(`${key}: foreign-key target field absent`)
  }
  for (const foreignKey of schema.conditionalForeignKeys ?? []) {
    const target = contract.schemas[foreignKey.schema]
    if (!target || !schema.header.includes(foreignKey.when.field)) fail(`${key}: invalid conditional foreign key`)
    if (foreignKey.fields.length !== foreignKey.fieldsThere.length) fail(`${key}: conditional foreign-key arity mismatch`)
    if (foreignKey.fields.some((field) => !schema.header.includes(field)) || foreignKey.fieldsThere.some((field) => !target.header.includes(field))) fail(`${key}: conditional foreign-key field absent`)
  }
}

const integerField = (field) => field === "participant_slot" || /(?:^|_)(?:(?:amount|no_show_charge|cancellation_charge)_currency_minor|canonical_position|clarification_count|count|denominator|elapsed_ms|family_number|group_order|index|numerator|ordinal|planned_effective_n|position|response_ordinal|rotation_offset|row_count|sequence|task_sequence|time_to_first_action_ms|timeout_ms|within_group_position|wrong_branch_count|backtrack_count)$/.test(field)
const timestampField = (field) => /(?:_at_utc|^started_at_utc$|^ended_at_utc$)$/.test(field)

const validateCell = (schema, field, value, testMode) => {
  if (value === "" || /[\t\r\n\0]/.test(value)) fail(`${schema.id}.${field}: invalid control/empty value`)
  if (value.normalize("NFC") !== value) fail(`${schema.id}.${field}: non-NFC value`)
  if (!testMode && value.startsWith(contract.canonicalTsv.fixtureNamespace)) fail(`${schema.id}.${field}: fixture namespace in operational mode`)
  const nullable = (schema.nullableFields ?? []).includes(field) || (schema.enums?.[field] ?? []).includes("n/a") || new RegExp(`^(?:${schema.patterns?.[field] ?? "(?!)"})$`).test("n/a")
  if (value === "n/a") {
    if (!nullable) fail(`${schema.id}.${field}: n/a is not allowed`)
    return
  }
  if (schema.multiValueFields?.[field]) {
    const parts = value.split("+")
    const domain = contract.multiValueDomains[schema.multiValueFields[field]]
    if (parts.length === 0 || parts.some((part) => !domain.includes(part))) fail(`${schema.id}.${field}: unknown multi-value member`)
    if (new Set(parts).size !== parts.length || JSON.stringify(parts) !== JSON.stringify([...parts].sort())) fail(`${schema.id}.${field}: multi-value members must be lexical and unique`)
    if (parts.length > 1 && (parts.includes("none") || parts.includes("prefer-not-to-say"))) fail(`${schema.id}.${field}: exclusive access value combined with another value`)
    return
  }
  if (schema.enums?.[field] && !schema.enums[field].includes(value)) fail(`${schema.id}.${field}: unknown enum ${value}`)
  if (schema.patterns?.[field] && !new RegExp(`^(?:${schema.patterns[field]})$`).test(value)) fail(`${schema.id}.${field}: pattern mismatch`)
  if (field.endsWith("sha256") && !/^[0-9a-f]{64}$/.test(value)) fail(`${schema.id}.${field}: invalid SHA-256`)
  if (timestampField(field) && !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)) fail(`${schema.id}.${field}: invalid UTC timestamp`)
  if (integerField(field) && !/^(?:0|[1-9][0-9]*)$/.test(value)) fail(`${schema.id}.${field}: invalid nonnegative integer`)
  if ((schema.textFields ?? []).includes(field)) {
    if (value.trim() !== value || value.length > 1024) fail(`${schema.id}.${field}: invalid normalized text`)
  } else if (!schema.enums?.[field] && !schema.patterns?.[field] && !field.endsWith("sha256") && !timestampField(field) && !integerField(field) && !/^[A-Za-z0-9][A-Za-z0-9._:/+-]{0,255}$/.test(value)) {
    fail(`${schema.id}.${field}: invalid token`)
  }
}

const compareRows = (schema, left, right) => {
  const canonicalOrderFields = [...schema.sortKey, ...schema.primaryKey.filter((field) => !schema.sortKey.includes(field))]
  for (const field of canonicalOrderFields) {
    const order = integerField(field)
      ? Number(left[field]) - Number(right[field])
      : left[field].localeCompare(right[field], "en")
    if (order !== 0) return order
  }
  return 0
}

const serializeTsv = (schema, rows) => {
  const sorted = [...rows].sort((left, right) => compareRows(schema, left, right))
  if (sorted.length === 0) return `${schema.header.join("\t")}\n`
  return `${schema.header.join("\t")}\n${sorted.map((row) => schema.header.map((field) => row[field]).join("\t")).join("\n")}\n`
}

const parseCanonicalTsv = (schema, source, { testMode = false } = {}) => {
  const bytes = Buffer.isBuffer(source) ? source : Buffer.from(source)
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) fail(`${schema.id}: BOM rejected`)
  let text
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    fail(`${schema.id}: invalid UTF-8`)
  }
  if (text.includes("\r") || text.includes("\0")) fail(`${schema.id}: CR/NUL rejected`)
  if (!text.endsWith("\n") || text.endsWith("\n\n")) fail(`${schema.id}: requires exactly one terminal LF`)
  const lines = text.slice(0, -1).split("\n")
  if (lines.length < 1 || lines.some((line) => line === "")) fail(`${schema.id}: nonempty header/rows required`)
  const header = lines[0].split("\t")
  if (JSON.stringify(header) !== JSON.stringify(schema.header)) fail(`${schema.id}: exact header mismatch`)
  const rows = lines.slice(1).map((line, rowIndex) => {
    const values = line.split("\t")
    if (values.length !== schema.header.length) fail(`${schema.id}: row ${rowIndex + 1} field-count mismatch`)
    const row = Object.fromEntries(schema.header.map((field, position) => [field, values[position]]))
    if (row.schema_version !== schema.id) fail(`${schema.id}: schema_version mismatch`)
    for (const field of schema.header) validateCell(schema, field, row[field], testMode)
    return row
  })
  const primaryKeys = new Set()
  for (const row of rows) {
    const key = schema.primaryKey.map((field) => row[field]).join("\u001f")
    if (primaryKeys.has(key)) fail(`${schema.id}: duplicate primary key ${key}`)
    primaryKeys.add(key)
  }
  for (let index = 1; index < rows.length; index += 1) {
    if (compareRows(schema, rows[index - 1], rows[index]) > 0) fail(`${schema.id}: noncanonical sort order`)
  }
  return rows
}

const exampleValue = (schema, field) => {
  if (field === "schema_version") return schema.id
  if (field === "event_id" || field.endsWith("_event_id")) return `EVT-${"1".repeat(32)}`
  if (field === "recruitment_key") return `RK-${"2".repeat(32)}`
  if (field === "program_person_key") return `PPK-${"3".repeat(32)}`
  if (field === "study_id") return "R1-P01"
  if (field === "source_head_git_sha") return contract.releasedMainSha
  if (field === "prior_event_id" || field === "replacement_of_allocation_slot") return "n/a"
  if (field === "card_id") return "OS-C01"
  if (field === "randomization_seed_hex") return "4".repeat(64)
  if (schema.multiValueFields?.[field]) return contract.multiValueDomains[schema.multiValueFields[field]][0]
  if (schema.enums?.[field]) return schema.enums[field].find((value) => value !== "n/a") ?? "n/a"
  if (field.endsWith("sha256")) return hashToken(`${schema.id}:${field}`)
  if (timestampField(field)) return utc
  if (integerField(field)) return "1"
  if ((schema.textFields ?? []).includes(field)) return "nonparticipant example"
  return `EXAMPLE-${field.replaceAll("_", "-").toUpperCase()}`
}

const rowFor = (schemaKey, overrides = {}) => {
  const schema = contract.schemas[schemaKey]
  return Object.fromEntries(schema.header.map((field) => [field, overrides[field] ?? exampleValue(schema, field)]))
}

let tsvShapeCheckCount = 0
for (const schema of Object.values(contract.schemas).filter((value) => value.format !== "json")) {
  const example = Object.fromEntries(schema.header.map((field) => [field, exampleValue(schema, field)]))
  parseCanonicalTsv(schema, serializeTsv(schema, [example]), { testMode: true })
  tsvShapeCheckCount += 1
}
parseCanonicalTsv(contract.schemas.phaseInputManifest, serializeTsv(contract.schemas.phaseInputManifest, []), { testMode: true })
let tsvSemanticFixtureCount = 0

if (JSON.stringify(zeroBudget.appliesToPhases) !== JSON.stringify(contract.plan005.exposedPhases)) fail("zero-budget phase coverage drift")
const compensationRowForPhase = (phaseId) => rowFor("compensationTerms", {
  phase_id: phaseId,
  phase_version: zeroBudget.version,
  terms_code: zeroBudgetCompensation.termsCode,
  amount_currency_minor: zeroBudgetCompensation.amountCurrencyMinor,
  currency_code: zeroBudgetCompensation.currencyCode,
  funding_owner_code: zeroBudgetCompensation.fundingOwnerCode,
  funding_verification_sha256: zeroBudgetCompensation.fundingVerificationSha256,
  delivery_method_code: zeroBudgetCompensation.deliveryMethodCode,
  payment_rail_code: zeroBudgetCompensation.paymentRailCode,
  delivery_deadline_code: zeroBudgetCompensation.deliveryDeadlineCode,
  withdrawal_payment_code: zeroBudgetCompensation.withdrawalPaymentCode,
  no_show_charge_currency_minor: zeroBudgetCompensation.noShowChargeCurrencyMinor,
  cancellation_charge_currency_minor: zeroBudgetCompensation.cancellationChargeCurrencyMinor,
  no_show_terms_sha256: zeroBudgetCompensation.noShowTermsSha256,
  cancellation_terms_sha256: zeroBudgetCompensation.cancellationTermsSha256,
  participant_terms_sha256: zeroBudgetCompensation.participantTermsSha256,
  recording_used: String(zeroBudget.recording.recordingUsed),
  recording_types_code: zeroBudget.recording.recordingTypesCode,
  recording_consent_code: zeroBudget.recording.recordingConsentCode,
  recording_tool_code: zeroBudget.recording.recordingToolCode,
  recording_storage_code: zeroBudget.recording.recordingStorageCode,
  recording_retention_code: zeroBudget.recording.recordingRetentionCode,
  recording_deletion_code: zeroBudget.recording.recordingDeletionCode,
})
const compensationRows = zeroBudget.appliesToPhases.map(compensationRowForPhase)
const canonicalCompensationSource = serializeTsv(contract.schemas.compensationTerms, compensationRows)
const validateCompensationRows = (rows) => {
  const actual = serializeTsv(contract.schemas.compensationTerms, rows)
  if (actual !== canonicalCompensationSource) fail("zero-budget compensation rows do not byte-match canonical policy")
  if (rows.length !== 8 || new Set(rows.map((row) => row.phase_id)).size !== 8) fail("per-phase compensation matrix example failed")
}
const validateCompensationFile = (source) => {
  const parsed = parseCanonicalTsv(contract.schemas.compensationTerms, source)
  validateCompensationRows(parsed)
  if (sha256(source) !== zeroBudgetCompensation.termsFileSha256) fail("zero-budget compensation file digest mismatch")
  return parsed
}
const parsedCompensationRows = validateCompensationFile(unpaidTermsSource)
if (unpaidTermsSource !== canonicalCompensationSource) fail("tracked zero-budget compensation bytes drift")
const compensationHeaderLine = contract.schemas.compensationTerms.header.join("\t")
const compensationTermsRowShaByPhase = new Map(parsedCompensationRows.map((row) => [
  row.phase_id,
  sha256(`${compensationHeaderLine}\n${contract.schemas.compensationTerms.header.map((field) => row[field]).join("\t")}\n`),
]))
for (const phaseId of zeroBudget.appliesToPhases) {
  if (compensationTermsRowShaByPhase.get(phaseId) !== zeroBudgetCompensation.phaseRowSha256?.[phaseId]) fail(`zero-budget phase-row digest drift for ${phaseId}`)
}
if (Object.keys(zeroBudgetCompensation.phaseRowSha256 ?? {}).length !== 8) fail("zero-budget phase-row digest registry must contain eight rows")
const compensationTermsSha = (phaseId) => compensationTermsRowShaByPhase.get(phaseId) ?? fail(`missing compensation row hash for ${phaseId}`)
const expectCompensationFailure = (rows, label) => {
  let caught
  try {
    validateCompensationRows(rows)
  } catch (error) {
    caught = error
  }
  if (!caught) fail(`mutation accepted: ${label}`)
  mutationCheckCount += 1
}
for (const [field, value] of [
  ["terms_code", "paid"],
  ["amount_currency_minor", "1"],
  ["currency_code", "USD"],
  ["funding_owner_code", "OWNER"],
  ["funding_verification_sha256", hashToken("mutated-funding")],
  ["delivery_method_code", "cash"],
  ["payment_rail_code", "cash"],
  ["delivery_deadline_code", "two-days"],
  ["withdrawal_payment_code", "full-promised-amount"],
  ["no_show_charge_currency_minor", "1"],
  ["cancellation_charge_currency_minor", "1"],
  ["no_show_terms_sha256", hashToken("mutated-no-show")],
  ["cancellation_terms_sha256", hashToken("mutated-cancellation")],
  ["participant_terms_sha256", hashToken("mutated-participant-terms")],
  ["phase_version", "MUTATED-VERSION"],
  ["recording_used", "true"],
  ["recording_types_code", "audio"],
  ["recording_consent_code", "separate-opt-in"],
  ["recording_tool_code", "tool"],
  ["recording_storage_code", "store"],
  ["recording_retention_code", "retain"],
  ["recording_deletion_code", "delete"],
]) {
  expectCompensationFailure(parsedCompensationRows.map((row, index) => index === 0 ? { ...row, [field]: value } : row), `zero-budget ${field}`)
}
expectCompensationFailure(parsedCompensationRows.slice(1), "missing zero-budget phase")
let compensationDigestMutationRejected = false
try {
  validateCompensationFile(unpaidTermsSource.replace(zeroBudgetCompensation.participantTermsSha256, hashToken("file-digest-mutation")))
} catch {
  compensationDigestMutationRejected = true
}
if (!compensationDigestMutationRejected) fail("zero-budget file digest mutation accepted")
mutationCheckCount += 1
tsvSemanticFixtureCount += 1

const schemaById = new Map(Object.entries(contract.schemas).map(([key, schema]) => [schema.id, { key, schema }]))
const migrationRows = contract.legacyMigrationSources.map((source, index) => {
  const target = schemaById.get(source.targetSchemaId)
  if (!target || target.schema.format === "json") fail(`legacy migration target is absent/non-TSV: ${source.targetSchemaId}`)
  if (source.expectedColumns !== source.exactHeader.length) fail(`legacy migration source header count drift: ${source.sourceSchemaId}`)
  return rowFor("schemaMigration", {
    migration_id: `MIGRATION-${String(index + 1).padStart(2, "0")}`,
    plan_id: source.planId,
    source_schema_id: source.sourceSchemaId,
    source_presence: source.sourcePresence,
    source_path_code: "n/a",
    source_head_git_sha: contract.releasedMainSha,
    source_evidence_sha256: sha256(`${source.exactHeader.join("\t")}\n`),
    source_row_count: "0",
    source_header_sha256: sha256(`${source.exactHeader.join("\t")}\n`),
    target_schema_id: target.schema.id,
    target_path_code: target.schema.filename,
    target_header_sha256: sha256(`${target.schema.header.join("\t")}\n`),
    migration_kind: "absent-source-schema-witness",
    zero_row_assertion: "true",
    old_aggregate_sha256: hashToken(`old-zero:${source.sourceSchemaId}`),
    new_aggregate_sha256: hashToken(`new-zero:${target.schema.id}`),
    owner_comment_url_sha256: hashToken(`owner-url:${source.sourceSchemaId}`),
    owner_comment_body_sha256: hashToken(`owner-body:${source.sourceSchemaId}`),
    migrated_at_utc: "2026-01-01T00:00:00Z",
    actor_code: "HUMAN-MIGRATION-OWNER",
  })
})
const parsedMigrationRows = parseCanonicalTsv(contract.schemas.schemaMigration, serializeTsv(contract.schemas.schemaMigration, migrationRows), { testMode: true })
if (parsedMigrationRows.length !== 6 || new Set(parsedMigrationRows.map((row) => row.target_schema_id)).size !== 6 || parsedMigrationRows.some((row) => row.source_presence !== "absent-schema-witness" || row.source_path_code !== "n/a" || row.source_row_count !== "0" || row.zero_row_assertion !== "true" || row.migration_kind !== "absent-source-schema-witness" || row.source_evidence_sha256 !== row.source_header_sha256)) fail("six-source absent-schema-witness migration fixture failed")
tsvSemanticFixtureCount += 1

const expectTsvFailure = (schema, source, expectedMessage, { testMode = false } = {}) => {
  let caught
  try {
    parseCanonicalTsv(schema, source, { testMode })
  } catch (error) {
    caught = error
  }
  if (!caught) fail(`mutation accepted: ${expectedMessage}`)
  if (!String(caught.message).includes(expectedMessage)) fail(`mutation failed for wrong reason; expected ${expectedMessage}, got ${caught.message}`)
  mutationCheckCount += 1
}

const mutationSchema = contract.schemas.phaseInputManifest
const mutationRow = rowFor("phaseInputManifest", { source_file_id: "SOURCE-01" })
const mutationText = serializeTsv(mutationSchema, [mutationRow])
parseCanonicalTsv(mutationSchema, mutationText)
const fixtureMutationText = serializeTsv(mutationSchema, [rowFor("phaseInputManifest", { source_file_id: "FIXTURE-SOURCE" })])
expectTsvFailure(mutationSchema, fixtureMutationText, "fixture namespace")
expectTsvFailure(mutationSchema, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(mutationText)]), "BOM rejected")
expectTsvFailure(mutationSchema, mutationText.replaceAll("\n", "\r\n"), "CR/NUL rejected")
expectTsvFailure(mutationSchema, `${mutationText}\n`, "exactly one terminal LF")
expectTsvFailure(mutationSchema, mutationText.replace("schema_version", "schema-version"), "exact header mismatch")
expectTsvFailure(mutationSchema, mutationText.replace(/\t[^\t\n]+\n$/, "\n"), "field-count mismatch")
expectTsvFailure(mutationSchema, `${mutationText}${mutationText.split("\n")[1]}\n`, "duplicate primary key")
expectTsvFailure(mutationSchema, mutationText.replace(mutationRow.source_file_sha256, "ABC"), "invalid SHA-256")

const multiValueSchema = contract.schemas.screener
const multiValueRow = rowFor("screener", { access_strategy_codes: "keyboard-only+screen-reader" })
parseCanonicalTsv(multiValueSchema, serializeTsv(multiValueSchema, [multiValueRow]), { testMode: true })
for (const [value, reason] of [
  ["keyboard-only+unknown", "unknown multi-value member"],
  ["screen-reader+keyboard-only", "lexical and unique"],
  ["keyboard-only+keyboard-only", "lexical and unique"],
  ["none+screen-reader", "exclusive access value"],
]) {
  expectTsvFailure(multiValueSchema, serializeTsv(multiValueSchema, [{ ...multiValueRow, access_strategy_codes: value }]), reason, { testMode: true })
}

if (!zeroCostKit.includes("DO NOT COMMIT COMPLETED COPIES OR PRIVATE LOCATORS") || !zeroCostKit.includes("NON-PARTICIPANT EVIDENCE — DOES NOT COUNT TOWARD RECRUITMENT, SAMPLE, THRESHOLDS, OR SELECTION")) fail("zero-cost kit safety banner drift")
const nonParticipantSchema = contract.schemas.nonParticipantEvidence
const nonParticipantPolicy = contract.nonParticipantEvidencePolicy
const nonParticipantActorByLane = new Map(nonParticipantPolicy.lanes.map(({ laneCode, actorClass }) => [laneCode, actorClass]))
if (nonParticipantActorByLane.size !== 6 || JSON.stringify([...nonParticipantActorByLane.keys()]) !== JSON.stringify(nonParticipantSchema.enums.lane_code) || JSON.stringify([...new Set(nonParticipantActorByLane.values())].sort()) !== JSON.stringify([...nonParticipantSchema.enums.actor_class].sort())) fail("non-participant lane/actor registry drift")
const canonicalEmptyNonParticipantTemplate = `${nonParticipantSchema.header.join("\t")}\n`
const parsedEmptyNonParticipantTemplate = parseCanonicalTsv(nonParticipantSchema, nonParticipantTemplateSource)
if (parsedEmptyNonParticipantTemplate.length !== 0 || nonParticipantTemplateSource !== canonicalEmptyNonParticipantTemplate || sha256(nonParticipantTemplateSource) !== nonParticipantPolicy.blankTemplateSha256 || nonParticipantPolicy.blankTemplateFile !== "004-005-nonparticipant-evidence.v1.tsv") fail("canonical non-participant blank template drift")
for (const field of nonParticipantSchema.header) {
  if (!zeroCostKit.includes(`${field}:`)) fail(`zero-cost kit omits canonical non-participant field ${field}`)
}
for (const { laneCode, actorClass } of nonParticipantPolicy.lanes) {
  if (!packet.includes(`\`${laneCode}\``) || !packet.includes(`\`${actorClass}\``) || !zeroCostKit.includes(`\`${laneCode}\``) || !zeroCostKit.includes(`\`${actorClass}\``)) fail(`lane/actor pair is not present in packet and kit: ${laneCode}`)
}
for (const requiredKitText of [
  "amount is zero",
  "no cancellation or no-show debt to collect",
  "no audio, video, screen, or keystroke recording",
  "participant_sample_count: 0",
  "participant_threshold_use: prohibited",
  "final_selection_use: prohibited",
]) {
  if (!zeroCostKit.includes(requiredKitText)) fail(`zero-cost kit policy drift: ${requiredKitText}`)
}
for (const forbiddenField of nonParticipantPolicy.participantJoinFieldsForbidden) {
  if (nonParticipantSchema.header.includes(forbiddenField)) fail(`non-participant schema contains participant join field ${forbiddenField}`)
}
for (const [schemaKey, schema] of Object.entries(contract.schemas)) {
  for (const foreignKey of schema.foreignKeys ?? []) {
    if (foreignKey.schema === "nonParticipantEvidence") fail(`${schemaKey}: participant/decision schema points to non-participant evidence`)
  }
}
const validateNonParticipantRows = (rows, { requireAllLanes = true } = {}) => {
  if (requireAllLanes && (rows.length !== 6 || new Set(rows.map((row) => row.lane_code)).size !== 6)) fail("non-participant fixture must cover all six lanes")
  for (const row of rows) {
    if (nonParticipantActorByLane.get(row.lane_code) !== row.actor_class) fail("non-participant lane/actor mismatch")
    if (row.evidence_class !== nonParticipantPolicy.fixedFields.evidenceClass || row.participant_sample_count !== nonParticipantPolicy.fixedFields.participantSampleCount || row.participant_threshold_use !== nonParticipantPolicy.fixedFields.participantThresholdUse || row.final_selection_use !== nonParticipantPolicy.fixedFields.finalSelectionUse) fail("non-participant non-substitution invariant failed")
  }
}
const nonParticipantRows = nonParticipantPolicy.lanes.map(({ laneCode, actorClass }, index) => rowFor("nonParticipantEvidence", {
  evidence_item_id: `FIXTURE-NPE-${String(index + 1).padStart(2, "0")}`,
  target_plan_id: index % 2 === 0 ? "004" : "005",
  lane_code: laneCode,
  actor_class: actorClass,
  method_version: "FIXTURE-METHOD-V1",
  input_set_sha256: hashToken(`nonparticipant-input:${laneCode}`),
  procedure_sha256: hashToken(`nonparticipant-procedure:${laneCode}`),
  result_file_sha256: hashToken(`nonparticipant-result:${laneCode}`),
  observed_at_utc: `2026-01-01T00:00:0${index}Z`,
  output_class: ["hypothesis", "defect", "question-priority"][index % 3],
  evidence_class: "non-participant",
  participant_sample_count: "0",
  participant_threshold_use: "prohibited",
  final_selection_use: "prohibited",
}))
const parsedNonParticipantRows = parseCanonicalTsv(nonParticipantSchema, serializeTsv(nonParticipantSchema, nonParticipantRows), { testMode: true })
validateNonParticipantRows(parsedNonParticipantRows)
tsvSemanticFixtureCount += 1
const expectNonParticipantFailure = (rows, label) => {
  let caught
  try {
    validateNonParticipantRows(rows)
  } catch (error) {
    caught = error
  }
  if (!caught) fail(`mutation accepted: ${label}`)
  mutationCheckCount += 1
}
for (const [field, value] of [
  ["participant_sample_count", "1"],
  ["participant_threshold_use", "allowed"],
  ["final_selection_use", "allowed"],
  ["evidence_class", "participant"],
  ["actor_class", "project-owner"],
]) {
  expectNonParticipantFailure(parsedNonParticipantRows.map((row, index) => index === 0 ? { ...row, [field]: value } : row), `non-participant ${field}`)
}
expectTsvFailure(nonParticipantSchema, serializeTsv(nonParticipantSchema, nonParticipantRows).replace("lane_code", "lane_code\tstudy_id").replace("actor_class", "R1-P01\tactor_class"), "exact header mismatch", { testMode: true })
expectTsvFailure(nonParticipantSchema, serializeTsv(nonParticipantSchema, nonParticipantRows).replace("expert-heuristic-review", "unknown-lane"), "unknown enum", { testMode: true })
expectTsvFailure(nonParticipantSchema, nonParticipantTemplateSource.replace("evidence_item_id", "evidence-item-id"), "exact header mismatch")
if (sha256(`${nonParticipantTemplateSource} `) === nonParticipantPolicy.blankTemplateSha256) fail("non-participant blank-template hash mutation accepted")
mutationCheckCount += 1

const assertParticipantManifestBoundary = (rows) => {
  if (rows.some((row) => row.source_schema_id === nonParticipantSchema.id)) fail("non-participant evidence cannot be a phase manifest source")
}
const mutatedInputManifestRows = parseCanonicalTsv(contract.schemas.phaseInputManifest, serializeTsv(contract.schemas.phaseInputManifest, [rowFor("phaseInputManifest", { source_schema_id: nonParticipantSchema.id })]), { testMode: true })
const mutatedEvidenceManifestRows = parseCanonicalTsv(contract.schemas.phaseEvidenceManifest, serializeTsv(contract.schemas.phaseEvidenceManifest, [rowFor("phaseEvidenceManifest", { source_schema_id: nonParticipantSchema.id })]), { testMode: true })
for (const [rows, label] of [[mutatedInputManifestRows, "input"], [mutatedEvidenceManifestRows, "evidence"]]) {
  let caught
  try {
    assertParticipantManifestBoundary(rows)
  } catch (error) {
    caught = error
  }
  if (!caught) fail(`mutation accepted: non-participant ${label} manifest source`)
  mutationCheckCount += 1
}

const canonicalJsonValue = (value) => {
  if (Array.isArray(value)) return value.map(canonicalJsonValue)
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalJsonValue(value[key])]))
  }
  return value
}
const serializeCanonicalJson = (value) => `${JSON.stringify(canonicalJsonValue(value))}\n`
const canonicalJsonEqual = (left, right) => JSON.stringify(canonicalJsonValue(left)) === JSON.stringify(canonicalJsonValue(right))
const jsonIntegerField = (field) => /(?:Count|Numerator|Denominator|Cardinality|DurationSeconds|Seconds)$/.test(field) || ["count", "numerator", "denominator", "familyNumber", "tierOrder", "validTrialCount"].includes(field)
const jsonBooleanField = (field) => /Met$/.test(field) || ["eligible", "unresolved", "noRushingObserved", "fitsDeclaredDuration", "rerunRequired"].includes(field)
const assertLexicalUniqueStrings = (value, label) => {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.length === 0)) fail(`${label}: expected string array`)
  if (new Set(value).size !== value.length || JSON.stringify(value) !== JSON.stringify([...value].sort())) fail(`${label}: strings must be lexical and unique`)
}
const validateJsonScalar = (schema, field, value, label) => {
  if (field === "schemaVersion") {
    if (value !== schema.id) fail(`${label}: schemaVersion mismatch`)
    return
  }
  if (field === "protocolVersion") {
    if (value !== contract.protocolVersion) fail(`${label}: protocolVersion mismatch`)
    return
  }
  if (field === "limitations" || field.endsWith("Ids")) {
    assertLexicalUniqueStrings(value, label)
    return
  }
  if (field === "eligibilityCounts") {
    const expected = ["completed", "excluded", "included", "scheduled", "screened", "started", "withdrawn"]
    if (value === null || typeof value !== "object" || Array.isArray(value) || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(expected)) fail(`${label}: exact eligibility-count fields mismatch`)
    for (const [key, count] of Object.entries(value)) if (!Number.isSafeInteger(count) || count < 0) fail(`${label}.${key}: invalid count`)
    return
  }
  if (/Sha256$/.test(field)) {
    if (typeof value !== "string" || !/^[0-9a-f]{64}$/.test(value)) fail(`${label}: invalid SHA-256`)
    return
  }
  if (/AtUtc$/.test(field)) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value) || Number.isNaN(Date.parse(value))) fail(`${label}: invalid UTC timestamp`)
    return
  }
  if (jsonIntegerField(field)) {
    if (!Number.isSafeInteger(value) || value < 0) fail(`${label}: invalid nonnegative safe integer`)
    return
  }
  if (jsonBooleanField(field)) {
    if (typeof value !== "boolean") fail(`${label}: invalid boolean`)
    return
  }
  if (typeof value !== "string" || value.length === 0 || value.length > 1024 || /[\t\r\n\0]/.test(value)) fail(`${label}: invalid string`)
}
const compareJsonRows = (sortKey, left, right) => {
  for (const field of sortKey ?? []) {
    const a = left[field]
    const b = right[field]
    const order = typeof a === "number" && typeof b === "number" ? a - b : String(a).localeCompare(String(b), "en")
    if (order !== 0) return order
  }
  return 0
}
const validateJsonValue = (schema, value) => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) fail(`${schema.id}: expected object`)
  const keys = Object.keys(value)
  for (const field of schema.requiredFields) if (!(field in value)) fail(`${schema.id}: missing JSON field ${field}`)
  if (schema.additionalProperties === false && (keys.length !== schema.requiredFields.length || keys.some((field) => !schema.requiredFields.includes(field)))) fail(`${schema.id}: unknown JSON field`)
  const arrayContracts = { ...(schema.arrayContracts ?? {}), ...(schema.objectContracts ?? {}) }
  for (const field of schema.requiredFields) {
    const label = `${schema.id}.${field}`
    const arrayContract = arrayContracts[field]
    const recordContract = schema.recordContracts?.[field]
    if (arrayContract) {
      const rows = value[field]
      if (!Array.isArray(rows)) fail(`${label}: expected array`)
      if (arrayContract.cardinality !== undefined && rows.length !== arrayContract.cardinality) fail(`${label}: cardinality mismatch`)
      if (arrayContract.minimumCardinality !== undefined && rows.length < arrayContract.minimumCardinality) fail(`${label}: minimum cardinality mismatch`)
      const rowEncodings = new Set()
      for (const [position, row] of rows.entries()) {
        if (row === null || typeof row !== "object" || Array.isArray(row) || JSON.stringify(Object.keys(row).sort()) !== JSON.stringify([...arrayContract.fields].sort())) fail(`${label}: exact nested fields mismatch`)
        for (const nestedField of arrayContract.fields) validateJsonScalar(schema, nestedField, row[nestedField], `${label}[${position}].${nestedField}`)
        const encoding = JSON.stringify(canonicalJsonValue(row))
        if (rowEncodings.has(encoding)) fail(`${label}: duplicate row`)
        rowEncodings.add(encoding)
      }
      for (let position = 1; position < rows.length; position += 1) if (compareJsonRows(arrayContract.sortKey, rows[position - 1], rows[position]) > 0) fail(`${label}: noncanonical row sort`)
    } else if (recordContract) {
      const record = value[field]
      if (record === null || typeof record !== "object" || Array.isArray(record) || JSON.stringify(Object.keys(record).sort()) !== JSON.stringify([...recordContract.fields].sort())) fail(`${label}: exact record fields mismatch`)
      for (const nestedField of recordContract.fields) validateJsonScalar(schema, nestedField, record[nestedField], `${label}.${nestedField}`)
    } else {
      validateJsonScalar(schema, field, value[field], label)
    }
  }
}
const parseCanonicalJson = (schema, source) => {
  const bytes = Buffer.isBuffer(source) ? source : Buffer.from(source)
  let text
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    fail(`${schema.id}: invalid UTF-8 JSON`)
  }
  if (text.includes("\r") || text.includes("\0") || !text.endsWith("\n") || text.endsWith("\n\n")) fail(`${schema.id}: invalid JSON framing`)
  assertNoDuplicateJsonKeys(text, schema.id)
  const value = JSON.parse(text)
  validateJsonValue(schema, value)
  if (text !== serializeCanonicalJson(value)) fail(`${schema.id}: JSON is not recursively key-sorted canonical form`)
  return value
}
let jsonSemanticExampleCount = 0

const validateForeignKeys = (datasets) => {
  for (const [schemaKey, rows] of Object.entries(datasets)) {
    const schema = contract.schemas[schemaKey]
    for (const foreignKey of schema.foreignKeys ?? []) {
      const targetRows = datasets[foreignKey.schema]
      if (!targetRows) fail(`${schema.id}: fixture omits FK target ${foreignKey.schema}`)
      const targetKeys = new Set(targetRows.map((row) => foreignKey.fieldsThere.map((field) => row[field]).join("\u001f")))
      for (const row of rows) {
        const key = foreignKey.fields.map((field) => row[field]).join("\u001f")
        if (!targetKeys.has(key)) fail(`${schema.id}: broken example foreign key ${key}`)
      }
    }
    for (const foreignKey of schema.conditionalForeignKeys ?? []) {
      const targetRows = datasets[foreignKey.schema]
      if (!targetRows) fail(`${schema.id}: fixture omits conditional FK target ${foreignKey.schema}`)
      const targetKeys = new Set(targetRows.map((row) => foreignKey.fieldsThere.map((field) => row[field]).join("\u001f")))
      for (const row of rows.filter((candidate) => candidate[foreignKey.when.field] === foreignKey.when.equals)) {
        const value = foreignKey.fields.map((field) => row[field]).join("\u001f")
        if (!targetKeys.has(value)) fail(`${schema.id}: broken conditional example foreign key ${value}`)
      }
    }
  }
}

const parseRows = (schemaKey, rows) => {
  const parsed = parseCanonicalTsv(contract.schemas[schemaKey], serializeTsv(contract.schemas[schemaKey], rows), { testMode: true })
  if (schemaKey === "phaseInputManifest" || schemaKey === "phaseEvidenceManifest") assertParticipantManifestBoundary(parsed)
  return parsed
}

const assertZeroBudgetLedgerPolicy = (rows) => {
  for (const recruitmentKey of new Set(rows.map((row) => row.recruitment_key))) {
    const chain = rows.filter((row) => row.recruitment_key === recruitmentKey).sort((left, right) => left.event_at_utc.localeCompare(right.event_at_utc) || left.event_id.localeCompare(right.event_id))
    const phaseIds = [...new Set(chain.map((row) => row.target_phase_id).filter((value) => value !== "n/a"))]
    if (phaseIds.length > 1) fail("zero-budget ledger chain spans multiple phase IDs")
    const phaseId = phaseIds[0]
    for (const event of chain) {
      if (event.event_type.startsWith("recording-consent-")) fail("recording consent event is prohibited by zero-budget policy")
      if (event.study_id === "n/a") {
        if (event.compensation_terms_code !== "n/a" || event.compensation_terms_sha256 !== "n/a") fail("preactivation compensation fields must be n/a")
      } else {
        if (!phaseId || event.compensation_terms_code !== "unpaid" || event.compensation_terms_sha256 !== compensationTermsSha(phaseId)) fail("post-activation event does not join canonical unpaid phase row")
      }
    }
    for (const studyId of new Set(chain.map((row) => row.study_id).filter((value) => value !== "n/a"))) {
      const studyRows = chain.filter((row) => row.study_id === studyId)
      const consent = studyRows.find((row) => row.event_type === "research-consent-affirmed")
      const exposureBoundary = studyRows.find((row) => row.event_type === "session-started") ?? studyRows.find((row) => row.event_type === "session-completed")
      if (!consent || !exposureBoundary) continue
      const recordingRows = studyRows.filter((row) => row.event_type === "recording-not-used")
      if (recordingRows.length !== 1) fail("current session requires exactly one recording-not-used event")
      if (!(consent.event_at_utc < recordingRows[0].event_at_utc && recordingRows[0].event_at_utc < exposureBoundary.event_at_utc)) fail("recording-not-used must follow consent and precede exposure/start")
    }
  }
}

const scopeRank = { phase: 1, plan: 2, program: 3 }
const appliesToStudy = (event, planId, phaseId) => event.target_scope === "program" || (event.target_scope === "plan" && event.target_plan_id === planId) || (event.target_scope === "phase" && event.target_plan_id === planId && event.target_phase_id === phaseId)
const latest = (rows) => [...rows].sort((left, right) => left.event_at_utc.localeCompare(right.event_at_utc) || left.event_id.localeCompare(right.event_id)).at(-1)
const deriveAttritionProjection = (rows, studies, cutoffAtUtc, projectionVersion = "PROJECTION-2026-01-12") => {
  for (const recruitmentKey of new Set(rows.map((row) => row.recruitment_key))) {
    const chain = rows.filter((row) => row.recruitment_key === recruitmentKey).sort((left, right) => left.event_at_utc.localeCompare(right.event_at_utc) || left.event_id.localeCompare(right.event_id))
    for (const [index, event] of chain.entries()) {
      if ((index === 0 && event.prior_event_id !== "n/a") || (index > 0 && event.prior_event_id !== chain[index - 1].event_id)) fail("attrition event chain is not exact/acyclic")
      if (index > 0 && event.event_at_utc <= chain[index - 1].event_at_utc) fail("attrition event chronology is not strictly increasing")
    }
  }
  const sourceLedgerFileSha256 = sha256(serializeTsv(contract.schemas.attritionConsent, rows))
  return studies.map((study) => {
    const personRows = rows.filter((row) => row.event_at_utc <= cutoffAtUtc && (row.recruitment_key === study.recruitmentKey || (row.program_person_key !== "n/a" && row.program_person_key === study.programPersonKey)))
    const applicable = personRows.filter((row) => appliesToStudy(row, study.planId, study.phaseId))
    const consent = latest(personRows.filter((row) => row.event_id === study.consentId))
    if (!consent || consent.event_type !== "research-consent-affirmed" || consent.program_person_key !== study.programPersonKey || consent.study_id !== study.studyId) fail("attrition consent join failed")
    const terminalResearch = applicable.filter((row) => ["research-consent-revoked", "participant-withdrew", "researcher-stopped"].includes(row.event_type)).sort((left, right) => (scopeRank[right.target_scope] - scopeRank[left.target_scope]) || right.event_at_utc.localeCompare(left.event_at_utc) || right.event_id.localeCompare(left.event_id))[0]
    const contact = latest(personRows.filter((row) => row.event_type.startsWith("contact-consent-")))
    const recording = latest(personRows.filter((row) => row.event_type === "recording-not-used" || row.event_type.startsWith("recording-consent-")))
    const phaseEvent = latest(applicable.filter((row) => ["study-id-activated", "scheduled", "session-started", "session-completed", "excluded", "participant-withdrew", "researcher-stopped"].includes(row.event_type)))
    const excluded = latest(applicable.filter((row) => row.event_type === "excluded"))
    const deletionRequest = latest(applicable.filter((row) => row.event_type === "deletion-requested"))
    const deletionConfirmed = latest(applicable.filter((row) => row.event_type === "raw-deletion-confirmed"))
    const irreversible = latest(applicable.filter((row) => row.event_type === "aggregate-no-longer-separable"))
    if (irreversible && irreversible.event_at_utc <= consent.withdrawal_cutoff_at_utc) fail("irreversible aggregate predates participant withdrawal cutoff")
    const deletionTimeliness = !deletionRequest ? "no-request" : deletionRequest.event_at_utc <= consent.withdrawal_cutoff_at_utc ? "timely" : "late-after-cutoff"
    const deletionState = deletionConfirmed ? "completed" : irreversible ? "irreversibly-deidentified" : deletionRequest && deletionTimeliness === "timely" ? "pending" : "not-requested"
    const phaseStateMap = { "study-id-activated": "activated", scheduled: "scheduled", "session-started": "started", "session-completed": "completed", excluded: "excluded", "participant-withdrew": "withdrawn", "researcher-stopped": "stopped" }
    const researchConsentState = terminalResearch?.event_type === "research-consent-revoked" || terminalResearch?.event_type === "participant-withdrew" ? "withdrawn" : "consented"
    const reasons = new Set()
    if (deletionConfirmed && deletionTimeliness === "timely") reasons.add("deleted")
    if (deletionRequest && deletionTimeliness === "timely" && !deletionConfirmed) reasons.add("deletion-pending")
    if (terminalResearch?.event_type === "participant-withdrew") reasons.add("participant-withdrew")
    if (terminalResearch?.event_type === "research-consent-revoked") reasons.add("research-consent-revoked")
    if (terminalResearch?.event_type === "researcher-stopped") reasons.add("researcher-stopped")
    if (excluded) reasons.add("excluded")
    if (phaseEvent?.event_type !== "session-completed" && !["participant-withdrew", "researcher-stopped", "excluded"].includes(phaseEvent?.event_type)) reasons.add("phase-incomplete")
    const eligibilityReason = contract.attritionReasonPrecedence.find((reason) => reasons.has(reason)) ?? "eligible"
    const lastByScope = (scope) => latest(applicable.filter((row) => row.target_scope === scope))
    return rowFor("attritionProjection", {
      projection_version: projectionVersion, source_ledger_file_sha256: sourceLedgerFileSha256, cutoff_at_utc: cutoffAtUtc,
      recruitment_key: study.recruitmentKey, program_person_key: study.programPersonKey, study_id: study.studyId,
      plan_id: study.planId, phase_id: study.phaseId, research_consent_state: researchConsentState,
      research_consent_event_id: consent.event_id, withdrawal_cutoff_at_utc: consent.withdrawal_cutoff_at_utc,
      recording_state: recording?.event_type === "recording-consent-revoked" ? "withdrawn" : recording?.event_type === "recording-consent-affirmed" ? "consented" : recording?.event_type === "recording-consent-declined" ? "declined" : "not-requested",
      recording_decisive_event_id: recording?.event_id ?? "n/a",
      contact_state: contact?.event_type === "contact-consent-revoked" ? "revoked" : contact?.event_type === "contact-consent-declined" ? "declined" : contact?.event_type === "contact-consent-affirmed" ? "affirmed" : "missing",
      contact_decisive_event_id: contact?.event_id ?? "n/a", phase_state: phaseStateMap[phaseEvent?.event_type] ?? "activated",
      phase_decisive_event_id: phaseEvent?.event_id ?? "n/a", exclusion_state: excluded ? "excluded" : "included",
      exclusion_decisive_event_id: excluded?.event_id ?? "n/a", deletion_state: deletionState,
      deletion_decisive_event_id: (deletionConfirmed ?? irreversible ?? deletionRequest)?.event_id ?? "n/a",
      deletion_request_timeliness: deletionTimeliness, eligibility_state: eligibilityReason === "eligible" ? "eligible" : "ineligible",
      eligibility_reason_code: eligibilityReason, applicable_program_event_id: lastByScope("program")?.event_id ?? "n/a",
      applicable_plan_event_id: lastByScope("plan")?.event_id ?? "n/a", applicable_phase_event_id: lastByScope("phase")?.event_id ?? "n/a",
    })
  })
}
const buildPhaseProjectionFixture = ({ phaseId, ledgerRows, studies, cutoffAtUtc }) => {
  const projectionVersion = `FIXTURE-PROJECTION-${phaseId.toUpperCase()}`
  const rows = parseRows("attritionProjection", deriveAttritionProjection(ledgerRows, studies, cutoffAtUtc, projectionVersion))
  if (rows.some((row) => row.phase_id !== phaseId || row.cutoff_at_utc !== cutoffAtUtc)) fail(`phase attrition projection scope drift: ${phaseId}`)
  const eligibleRows = rows.filter((row) => row.eligibility_state === "eligible" && row.phase_state === "completed")
  return { rows, fileSha256: sha256(serializeTsv(contract.schemas.attritionProjection, rows)), eligibleStudyIds: eligibleRows.map((row) => row.study_id).sort(), eligibleProgramPersonKeys: eligibleRows.map((row) => row.program_person_key).sort() }
}
const expectSemanticFailure = (action, expectedMessage) => {
  let caught
  try { action() } catch (error) { caught = error }
  if (!caught) fail(`semantic mutation accepted: ${expectedMessage}`)
  if (!String(caught.message).includes(expectedMessage)) fail(`semantic mutation failed for wrong reason; expected ${expectedMessage}, got ${caught.message}`)
  mutationCheckCount += 1
}

// Coherent, in-memory open-sort example: one consented session, all 24 cards,
// valid group joins, two independent human coding rows and one adjudication.
const cardSection = packet.slice(packet.indexOf("### Open-sort cards"), packet.indexOf("The list number maps exactly"))
const openSortCardTexts = [...cardSection.matchAll(/^([1-9]|1[0-9]|2[0-4])\. (.+)$/gm)]
  .sort((left, right) => Number(left[1]) - Number(right[1]))
  .map((match) => match[2])
if (openSortCardTexts.length !== 24) fail("packet open-sort card text extraction failed")
const openSortCardSetPreimage = contract.plan005.openSortCardIds.map((cardId, index) => `${cardId}\t${openSortCardTexts[index]}\n`).join("")
const openSortCardSetSha = sha256(openSortCardSetPreimage)
const presentedOrderPreimage = (cardIds) => cardIds.map((cardId, index) => `${index + 1}\t${cardId}\n`).join("")
const openSortPresentedOrderSha = sha256(presentedOrderPreimage(contract.plan005.openSortCardIds))
const openSortProtocolSha = hashToken("open-sort-protocol")
const openSortInputManifestRows = parseRows("phaseInputManifest", [rowFor("phaseInputManifest", {
  phase_id: "p005-open-sort", phase_version: "OPEN-SORT-V1", input_manifest_id: "OPEN-SORT-INPUT-V1",
  source_file_id: "OPEN-SORT-CARD-SET", source_schema_id: "navigation-open-sort-card-set-v1",
  source_file_sha256: openSortCardSetSha, source_row_count: "24", protocol_sha256: openSortProtocolSha,
  artifact_or_card_set_sha256: openSortCardSetSha, schedule_file_sha256: "n/a", task_registry_file_sha256: "n/a",
  created_at_utc: "2025-12-31T20:00:00Z", created_by_code: "HUMAN-OPEN-SORT-OWNER",
})])
const openSortInputManifestSha = sha256(serializeTsv(contract.schemas.phaseInputManifest, openSortInputManifestRows))

const openConsent = rowFor("attritionConsent", {
  event_id: `EVT-${"a".repeat(32)}`, recruitment_key: `RK-${"a".repeat(32)}`,
  program_person_key: `PPK-${"a".repeat(32)}`, study_id: "OS-P01",
  event_at_utc: "2026-01-01T00:00:00Z",
  event_type: "research-consent-affirmed", target_scope: "phase",
  target_plan_id: "005", target_phase_id: "p005-open-sort",
  consent_document_sha256: hashToken("open-consent"), withdrawal_cutoff_at_utc: "2026-01-10T00:00:00Z", compensation_terms_code: "unpaid",
  compensation_terms_sha256: compensationTermsSha("p005-open-sort"), reason_code: "none",
  access_strategy_code: "n/a", actor_code: "HUMAN-MODERATOR", prior_event_id: "n/a",
})
const openRecordingNotUsed = rowFor("attritionConsent", {
  event_id: `EVT-${sha256("open-sort-recording-not-used").slice(0, 32)}`,
  recruitment_key: openConsent.recruitment_key, program_person_key: openConsent.program_person_key,
  study_id: openConsent.study_id, event_at_utc: "2026-01-01T00:01:00Z",
  event_type: "recording-not-used", target_scope: "recording", target_plan_id: "n/a",
  target_phase_id: "n/a", consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a",
  compensation_terms_code: "unpaid", compensation_terms_sha256: compensationTermsSha("p005-open-sort"),
  reason_code: "none", access_strategy_code: "n/a", actor_code: "HUMAN-MODERATOR", prior_event_id: openConsent.event_id,
})
const openCompletion = rowFor("attritionConsent", {
  event_id: `EVT-${sha256("open-sort-session-completed").slice(0, 32)}`,
  recruitment_key: openConsent.recruitment_key, program_person_key: openConsent.program_person_key,
  study_id: openConsent.study_id, event_at_utc: "2026-01-01T02:01:00Z",
  event_type: "session-completed", target_scope: "phase", target_plan_id: "005",
  target_phase_id: "p005-open-sort", consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a",
  compensation_terms_code: openConsent.compensation_terms_code,
  compensation_terms_sha256: openConsent.compensation_terms_sha256, reason_code: "none",
  access_strategy_code: "n/a", actor_code: "HUMAN-MODERATOR", prior_event_id: openRecordingNotUsed.event_id,
})
const openSession = rowFor("plan005OpenSortSessions", {
  study_id: "OS-P01", program_person_key: openConsent.program_person_key,
  session_id: "OS-SESSION-01", research_consent_event_id: openConsent.event_id,
  phase_input_manifest_sha256: openSortInputManifestSha, protocol_sha256: openSortProtocolSha,
  card_set_sha256: openSortCardSetSha, presented_order_sha256: openSortPresentedOrderSha,
  started_at_utc: "2026-01-01T01:00:00Z", ended_at_utc: "2026-01-01T02:00:00Z",
  session_state: "completed", candidate_exposure: "none", exclusion_code: "none",
})
const openGroups = Array.from({ length: 4 }, (_, index) => rowFor("plan005OpenSortGroups", {
  session_id: openSession.session_id, group_id: `G0${index + 1}`, group_order: String(index + 1),
  label_raw_object_sha256: hashToken(`group-${index}`), label_normalized: `group ${index + 1}`,
}))
const openPlacements = contract.plan005.openSortCardIds.map((cardId, index) => rowFor("plan005OpenSortPlacements", {
  session_id: openSession.session_id, card_id: cardId, presented_position: String(index + 1),
  group_id: `G0${Math.floor(index / 6) + 1}`, within_group_position: String((index % 6) + 1),
}))
const openExpectation = rowFor("plan005OpenSortExpectations", {
  session_id: openSession.session_id, expectation_id: "arrival-first", response_ordinal: "1",
  response_kind: "free-text", response_ref: "n/a", response_raw_object_sha256: hashToken("response"),
  response_normalized: "start here", notes_code: "none",
})
const independentRows = ["CODER-A", "CODER-B"].map((coder, index) => rowFor("plan005OpenSortCoding", {
  coding_row_id: `CODING-I${index + 1}`, session_id: openSession.session_id,
  expectation_id: openExpectation.expectation_id, response_ordinal: "1",
  source_text_sha256: openExpectation.response_raw_object_sha256, codebook_sha256: hashToken("codebook"),
  coding_stage: "independent", coder_code: coder, code_id: "arrival-orientation",
  decision: "present", independent_row_set_sha256: "n/a", adjudication_code: "n/a",
}))
const independentSetSha = sha256(serializeTsv(contract.schemas.plan005OpenSortCoding, independentRows))
const openCoding = [...independentRows, rowFor("plan005OpenSortCoding", {
  coding_row_id: "CODING-FINAL", session_id: openSession.session_id,
  expectation_id: openExpectation.expectation_id, response_ordinal: "1",
  source_text_sha256: openExpectation.response_raw_object_sha256, codebook_sha256: hashToken("codebook"),
  coding_stage: "adjudicated", coder_code: "HUMAN-ADJUDICATOR", code_id: "arrival-orientation",
  decision: "present", independent_row_set_sha256: independentSetSha, adjudication_code: "agree",
})]
const openDatasets = {
  attritionConsent: parseRows("attritionConsent", [openConsent, openRecordingNotUsed, openCompletion]),
  plan005OpenSortSessions: parseRows("plan005OpenSortSessions", [openSession]),
  plan005OpenSortGroups: parseRows("plan005OpenSortGroups", openGroups),
  plan005OpenSortPlacements: parseRows("plan005OpenSortPlacements", openPlacements),
  plan005OpenSortExpectations: parseRows("plan005OpenSortExpectations", [openExpectation]),
  plan005OpenSortCoding: parseRows("plan005OpenSortCoding", openCoding),
}
validateForeignKeys(openDatasets)
assertZeroBudgetLedgerPolicy(openDatasets.attritionConsent)
if (!(Date.parse(openConsent.event_at_utc) < Date.parse(openSession.started_at_utc) && Date.parse(openSession.started_at_utc) < Date.parse(openSession.ended_at_utc))) fail("open-sort consent/session chronology failed")
const openSortPhaseProjection = buildPhaseProjectionFixture({
  phaseId: "p005-open-sort", ledgerRows: openDatasets.attritionConsent,
  studies: [{ recruitmentKey: openConsent.recruitment_key, programPersonKey: openConsent.program_person_key, studyId: openConsent.study_id, consentId: openConsent.event_id, planId: "005", phaseId: "p005-open-sort" }],
  cutoffAtUtc: "2026-01-12T00:00:00Z",
})
if (!canonicalJsonEqual(openSortPhaseProjection.eligibleStudyIds, [openSession.study_id]) || openSession.session_state !== "completed") fail("open-sort attrition projection/session compatibility failed")
const adjudicatedCoding = openDatasets.plan005OpenSortCoding.find((row) => row.coding_stage === "adjudicated")
const recomputedIndependentSetSha = sha256(serializeTsv(contract.schemas.plan005OpenSortCoding, openDatasets.plan005OpenSortCoding.filter((row) => row.coding_stage === "independent")))
if (adjudicatedCoding.independent_row_set_sha256 !== recomputedIndependentSetSha || new Set(independentRows.map((row) => row.coder_code)).size !== 2) fail("open-sort independent coding digest/reviewer fixture failed")
expectSemanticFailure(() => validateForeignKeys({ ...openDatasets, plan005OpenSortCoding: openDatasets.plan005OpenSortCoding.map((row, index) => index === 0 ? { ...row, source_text_sha256: hashToken("wrong-open-sort-raw-text") } : row) }), "broken example foreign key")
const tiedCodingRows = ["TIE-B", "TIE-A"].map((codingRowId) => rowFor("plan005OpenSortCoding", {
  coding_row_id: codingRowId, session_id: openSession.session_id, expectation_id: openExpectation.expectation_id,
  response_ordinal: "1", source_response_kind: "free-text", source_text_sha256: openExpectation.response_raw_object_sha256,
  codebook_sha256: hashToken("tie-codebook"), coding_stage: "independent", coder_code: "HUMAN-TIE-CODER",
  code_id: "tie-code", decision: "present", independent_row_set_sha256: "n/a", adjudication_code: "n/a",
}))
const tiedCanonicalText = serializeTsv(contract.schemas.plan005OpenSortCoding, tiedCodingRows)
const [tiedHeader, ...tiedDataAndEmpty] = tiedCanonicalText.split("\n")
const tiedData = tiedDataAndEmpty.filter(Boolean)
expectTsvFailure(contract.schemas.plan005OpenSortCoding, `${tiedHeader}\n${[...tiedData].reverse().join("\n")}\n`, "noncanonical sort order", { testMode: true })
if (openDatasets.plan005OpenSortPlacements.length !== 24 || new Set(openDatasets.plan005OpenSortPlacements.map((row) => row.card_id)).size !== 24) fail("open-sort example placement coverage failed")
if (openSession.card_set_sha256 !== sha256(openSortCardSetPreimage) || openSession.presented_order_sha256 !== sha256(presentedOrderPreimage(openPlacements.sort((left, right) => Number(left.presented_position) - Number(right.presented_position)).map((row) => row.card_id)))) fail("open-sort card/order digest reproduction failed")
const openPairRows = []
for (let left = 0; left < contract.plan005.openSortCardIds.length; left += 1) {
  for (let right = left + 1; right < contract.plan005.openSortCardIds.length; right += 1) {
    const a = openPlacements[left]
    const b = openPlacements[right]
    openPairRows.push([a.card_id, b.card_id, a.group_id === b.group_id ? 1 : 0, 1])
  }
}
if (openPairRows.length !== 276 || new Set(openPairRows.map(([a, b]) => `${a}:${b}`)).size !== 276) fail("open-sort 276-pair derivation failed")
tsvSemanticFixtureCount += 1

const taskRows = contract.plan005.taskRegistryRows
const taskRegistry = taskRows.map((task) => rowFor("plan005TaskRegistry", {
  task_id: task.taskId, canonical_position: String(task.position), task_priority: task.priority,
  prompt_sha256: hashToken(`prompt:${task.taskId}`), destination_intent_code: `DEST-${task.taskId.toUpperCase()}`,
  tree_timeout_ms: "90000", first_click_timeout_ms: "30000", tree_success_code: "direct",
  first_click_success_code: "correct-first-click",
}))
const parsedTaskRegistry = parseRows("plan005TaskRegistry", taskRegistry)
const taskRegistryFileSha = sha256(serializeTsv(contract.schemas.plan005TaskRegistry, parsedTaskRegistry))
const taskById = new Map(parsedTaskRegistry.map((row) => [row.task_id, row]))
const priorityLists = new Map(["top", "supporting", "utility", "trust-recovery"].map((priority) => [priority, taskRows.filter((row) => row.priority === priority)]))
const priorities = ["top", "supporting", "utility", "trust-recovery"]
const candidates = ["candidate-a", "candidate-b"]
const candidateArtifactShaById = Object.fromEntries(candidates.map((candidateId) => [candidateId, hashToken(`candidate-artifact:${candidateId}`)]))
const candidateHierarchyShaById = Object.fromEntries(candidates.map((candidateId) => [candidateId, hashToken(`normalized-hierarchy:${candidateId}`)]))
const methods = ["tree", "first-click"]
const thresholdSchedule = []
for (let slot = 1; slot <= 3; slot += 1) {
  const candidateOrder = slot % 2 === 1 ? candidates : [...candidates].reverse()
  const methodOrder = slot % 2 === 1 ? methods : [...methods].reverse()
  let presentation = 0
  for (const candidate of candidateOrder) {
    for (const method of methodOrder) {
      for (const priority of priorities) {
        presentation += 1
        const candidateIndex = candidates.indexOf(candidate)
        const methodIndex = methods.indexOf(method)
        const list = priorityLists.get(priority)
        const task = list[(slot - 1 + candidateIndex + 2 * methodIndex) % list.length]
        const registry = taskById.get(task.taskId)
        thresholdSchedule.push(rowFor("plan005ThresholdSchedule", {
          pilot_iteration_id: "TP-ITERATION-1", participant_slot: String(slot), presentation_index: String(presentation),
          method, candidate_id: candidate, task_id: task.taskId, task_priority: priority,
          artifact_id: `PILOT-${candidate}-${method}-${task.taskId}`,
          entry_page_id: method === "tree" ? "n/a" : task.entryPageId,
          entry_state_id: method === "tree" ? "n/a" : task.entryStateId,
          entry_state_sha256: method === "tree" ? "n/a" : hashToken(`state:${task.taskId}`),
          task_registry_file_sha256: taskRegistryFileSha, prompt_sha256: registry.prompt_sha256,
          artifact_version_sha256: candidateArtifactShaById[candidate], hierarchy_sha256: candidateHierarchyShaById[candidate],
          expected_destination_id: `DEST-${candidate}-${task.taskId}`,
          expected_first_action_id: method === "tree" ? "n/a" : `ACTION-${candidate}-${task.taskId}`,
        }))
      }
    }
  }
}
const parsedThresholdSchedule = parseRows("plan005ThresholdSchedule", thresholdSchedule)
const pilotArtifacts = [...new Map(parsedThresholdSchedule.map((row) => [row.artifact_id, row])).values()].map((row) => rowFor("plan005PilotArtifactManifest", {
  pilot_iteration_id: row.pilot_iteration_id, artifact_id: row.artifact_id,
  candidate_id: row.candidate_id, method: row.method, task_id: row.task_id,
  artifact_version_sha256: row.artifact_version_sha256, hierarchy_sha256: row.hierarchy_sha256,
  entry_page_id: row.entry_page_id, entry_state_id: row.entry_state_id,
  entry_state_sha256: row.entry_state_sha256, normalization: "strict-utf8-nfc-lf-one-final-lf",
  artifact_sha256: hashToken(`pilot-bytes:${row.artifact_id}`),
}))
const parsedPilotArtifacts = parseRows("plan005PilotArtifactManifest", pilotArtifacts)
validateForeignKeys({ plan005TaskRegistry: parsedTaskRegistry, plan005PilotArtifactManifest: parsedPilotArtifacts, plan005ThresholdSchedule: parsedThresholdSchedule })
const pilotArtifactManifestFileSha = sha256(serializeTsv(contract.schemas.plan005PilotArtifactManifest, parsedPilotArtifacts))
const thresholdScheduleFileSha = sha256(serializeTsv(contract.schemas.plan005ThresholdSchedule, parsedThresholdSchedule))
const pilotArtifactSetSha = sha256([...parsedPilotArtifacts].sort((left, right) => left.artifact_id.localeCompare(right.artifact_id, "en")).map((row) => `${row.artifact_sha256}  ${row.artifact_id}\n`).join(""))
const thresholdProtocolSha = hashToken("tp-protocol")
const thresholdInputManifestRows = parseRows("phaseInputManifest", [
  rowFor("phaseInputManifest", { phase_id: "p005-threshold-pilot", phase_version: "TP-V1", input_manifest_id: "TP-INPUT-V1", source_file_id: "PILOT-ARTIFACTS", source_schema_id: contract.schemas.plan005PilotArtifactManifest.id, source_file_sha256: pilotArtifactManifestFileSha, source_row_count: String(parsedPilotArtifacts.length), protocol_sha256: thresholdProtocolSha, artifact_or_card_set_sha256: pilotArtifactSetSha, schedule_file_sha256: thresholdScheduleFileSha, task_registry_file_sha256: taskRegistryFileSha, created_at_utc: "2025-12-31T20:00:00Z", created_by_code: "HUMAN-PILOT-OWNER" }),
  rowFor("phaseInputManifest", { phase_id: "p005-threshold-pilot", phase_version: "TP-V1", input_manifest_id: "TP-INPUT-V1", source_file_id: "TASK-REGISTRY", source_schema_id: contract.schemas.plan005TaskRegistry.id, source_file_sha256: taskRegistryFileSha, source_row_count: String(parsedTaskRegistry.length), protocol_sha256: thresholdProtocolSha, artifact_or_card_set_sha256: pilotArtifactSetSha, schedule_file_sha256: thresholdScheduleFileSha, task_registry_file_sha256: taskRegistryFileSha, created_at_utc: "2025-12-31T20:00:00Z", created_by_code: "HUMAN-PILOT-OWNER" }),
  rowFor("phaseInputManifest", { phase_id: "p005-threshold-pilot", phase_version: "TP-V1", input_manifest_id: "TP-INPUT-V1", source_file_id: "THRESHOLD-SCHEDULE", source_schema_id: contract.schemas.plan005ThresholdSchedule.id, source_file_sha256: thresholdScheduleFileSha, source_row_count: String(parsedThresholdSchedule.length), protocol_sha256: thresholdProtocolSha, artifact_or_card_set_sha256: pilotArtifactSetSha, schedule_file_sha256: thresholdScheduleFileSha, task_registry_file_sha256: taskRegistryFileSha, created_at_utc: "2025-12-31T20:00:00Z", created_by_code: "HUMAN-PILOT-OWNER" }),
])
const thresholdInputManifestSha = sha256(serializeTsv(contract.schemas.phaseInputManifest, thresholdInputManifestRows))
if (parsedThresholdSchedule.length !== 48) fail("threshold pilot schedule is not three 16-trial slots")
for (let slot = 1; slot <= 3; slot += 1) {
  const rows = parsedThresholdSchedule.filter((row) => row.participant_slot === String(slot))
  const cells = new Set(rows.map((row) => `${row.candidate_id}:${row.method}:${row.task_priority}`))
  if (rows.length !== 16 || cells.size !== 16) fail(`threshold slot ${slot} coverage failed`)
}
const thresholdConsents = [1, 2].map((slot) => rowFor("attritionConsent", {
  event_id: `EVT-${String(slot + 5).repeat(32)}`, recruitment_key: `RK-${String(slot + 5).repeat(32)}`,
  program_person_key: `PPK-${String(slot + 5).repeat(32)}`, study_id: `TP-P0${slot}`,
  event_at_utc: `2025-12-31T2${slot}:00:00Z`,
  event_type: "research-consent-affirmed", target_scope: "phase", target_plan_id: "005",
  target_phase_id: "p005-threshold-pilot", consent_document_sha256: hashToken(`tp-consent:${slot}`),
  withdrawal_cutoff_at_utc: "2026-01-01T23:00:00Z",
  compensation_terms_code: "unpaid", compensation_terms_sha256: compensationTermsSha("p005-threshold-pilot"),
  reason_code: "none", access_strategy_code: "n/a", actor_code: "HUMAN-MODERATOR", prior_event_id: "n/a",
}))
const thresholdRecordingRows = thresholdConsents.map((consent, index) => rowFor("attritionConsent", {
  event_id: `EVT-${sha256(`threshold-recording-not-used:${index + 1}`).slice(0, 32)}`,
  recruitment_key: consent.recruitment_key, program_person_key: consent.program_person_key,
  study_id: consent.study_id, event_at_utc: `2025-12-31T2${index + 1}:01:00Z`,
  event_type: "recording-not-used", target_scope: "recording", target_plan_id: "n/a", target_phase_id: "n/a",
  consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a", compensation_terms_code: "unpaid",
  compensation_terms_sha256: compensationTermsSha("p005-threshold-pilot"), reason_code: "none",
  access_strategy_code: "n/a", actor_code: "HUMAN-MODERATOR", prior_event_id: consent.event_id,
}))
const thresholdSessions = thresholdConsents.map((consent, index) => rowFor("plan005ThresholdSessions", {
  study_id: consent.study_id, program_person_key: consent.program_person_key,
  session_id: `TP-SESSION-0${index + 1}`, participant_slot: String(index + 1),
  research_consent_event_id: consent.event_id, phase_input_manifest_sha256: thresholdInputManifestSha,
  protocol_sha256: thresholdProtocolSha, task_registry_file_sha256: taskRegistryFileSha,
  pilot_artifact_manifest_sha256: pilotArtifactManifestFileSha,
  threshold_schedule_file_sha256: thresholdScheduleFileSha, moderator_code: "HUMAN-MODERATOR",
  started_at_utc: `2026-01-01T0${index}:00:00Z`, ended_at_utc: `2026-01-01T0${index}:45:00Z`,
  session_state: "completed", exclusion_code: "none",
}))
const thresholdCompletionRows = thresholdConsents.map((consent, index) => rowFor("attritionConsent", {
  event_id: `EVT-${sha256(`threshold-session-completed:${index + 1}`).slice(0, 32)}`,
  recruitment_key: consent.recruitment_key, program_person_key: consent.program_person_key,
  study_id: consent.study_id, event_at_utc: `2026-01-01T1${index}:00:00Z`,
  event_type: "session-completed", target_scope: "phase", target_plan_id: "005",
  target_phase_id: "p005-threshold-pilot", consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a",
  compensation_terms_code: consent.compensation_terms_code,
  compensation_terms_sha256: consent.compensation_terms_sha256, reason_code: "none",
  access_strategy_code: "n/a", actor_code: "HUMAN-MODERATOR", prior_event_id: thresholdRecordingRows[index].event_id,
}))
const sessionBySlot = new Map(thresholdSessions.map((row) => [row.participant_slot, row]))
const thresholdTrials = parsedThresholdSchedule.filter((row) => row.participant_slot === "1" || row.participant_slot === "2").map((row) => {
  const session = sessionBySlot.get(row.participant_slot)
  return rowFor("plan005ThresholdTrials", {
    session_id: session.session_id, trial_id: `TP-TRIAL-${row.participant_slot}-${row.presentation_index}`,
    pilot_iteration_id: row.pilot_iteration_id, participant_slot: row.participant_slot,
    presentation_index: row.presentation_index, method: row.method, candidate_id: row.candidate_id,
    task_id: row.task_id, task_priority: row.task_priority, artifact_id: row.artifact_id,
    entry_page_id: row.entry_page_id, entry_state_id: row.entry_state_id,
    entry_state_sha256: row.entry_state_sha256, prompt_sha256: row.prompt_sha256,
    artifact_version_sha256: row.artifact_version_sha256, hierarchy_sha256: row.hierarchy_sha256,
    expected_destination_id: row.expected_destination_id, expected_first_action_id: row.expected_first_action_id,
    observed_destination_id: row.expected_destination_id,
    observed_first_action_id: row.method === "tree" ? "n/a" : row.expected_first_action_id,
    wrong_branch_count: "0", backtrack_count: "0", rescue_used: "false", timeout_used: "false",
    elapsed_ms: "1000", trial_status: "valid", exclusion_code: "n/a", notes_code: "n/a",
  })
})
const thresholdDatasets = {
  attritionConsent: parseRows("attritionConsent", [...thresholdConsents, ...thresholdRecordingRows, ...thresholdCompletionRows]),
  plan005TaskRegistry: parsedTaskRegistry,
  plan005PilotArtifactManifest: parsedPilotArtifacts,
  plan005ThresholdSchedule: parsedThresholdSchedule,
  plan005ThresholdSessions: parseRows("plan005ThresholdSessions", thresholdSessions),
  plan005ThresholdTrials: parseRows("plan005ThresholdTrials", thresholdTrials),
}
validateForeignKeys(thresholdDatasets)
assertZeroBudgetLedgerPolicy(thresholdDatasets.attritionConsent)
for (const session of thresholdDatasets.plan005ThresholdSessions) {
  const consent = thresholdDatasets.attritionConsent.find((row) => row.event_id === session.research_consent_event_id)
  if (consent.program_person_key !== session.program_person_key || consent.study_id !== session.study_id || Date.parse(consent.event_at_utc) >= Date.parse(session.started_at_utc) || Date.parse(session.started_at_utc) >= Date.parse(session.ended_at_utc)) fail("threshold consent/session semantic join failed")
}
const thresholdPhaseProjection = buildPhaseProjectionFixture({
  phaseId: "p005-threshold-pilot", ledgerRows: thresholdDatasets.attritionConsent,
  studies: thresholdConsents.map((consent) => ({ recruitmentKey: consent.recruitment_key, programPersonKey: consent.program_person_key, studyId: consent.study_id, consentId: consent.event_id, planId: "005", phaseId: "p005-threshold-pilot" })),
  cutoffAtUtc: "2026-01-02T00:00:00Z",
})
if (!canonicalJsonEqual(thresholdPhaseProjection.eligibleStudyIds, thresholdSessions.map((row) => row.study_id).sort()) || thresholdSessions.some((row) => row.session_state !== "completed")) fail("threshold attrition projection/session compatibility failed")
const thresholdCoverage = new Map()
const thresholdSessionMap = new Map(thresholdDatasets.plan005ThresholdSessions.map((row) => [row.session_id, row]))
for (const row of thresholdDatasets.plan005ThresholdTrials) {
  const key = `${row.candidate_id}:${row.method}:${row.task_priority}`
  if (!thresholdCoverage.has(key)) thresholdCoverage.set(key, new Set())
  thresholdCoverage.get(key).add(thresholdSessionMap.get(row.session_id).program_person_key)
}
if (thresholdCoverage.size !== 16 || [...thresholdCoverage.values()].some((people) => people.size < 2)) fail("threshold unique-person coverage failed")
const thresholdMetricCells = new Set(thresholdDatasets.plan005ThresholdTrials.map((row) => `${row.method}:${row.task_priority}`))
if (thresholdMetricCells.size !== 8 || contract.plan005.thresholdMetricMap.length !== 8 || new Set(contract.plan005.thresholdMetricMap.map((row) => `${row.method}:${row.taskPriority}`)).size !== 8) fail("threshold declaration set is not eight")
const validThresholdTrials = thresholdDatasets.plan005ThresholdTrials.filter((row) => row.trial_status === "valid")
const thresholdSuccess = (row) => row.method === "tree"
  ? row.observed_destination_id === row.expected_destination_id && row.wrong_branch_count === "0" && row.backtrack_count === "0" && row.rescue_used === "false" && row.timeout_used === "false"
  : row.observed_first_action_id === row.expected_first_action_id && row.rescue_used === "false" && row.timeout_used === "false"
const thresholdMetricRows = contract.plan005.thresholdMetricMap.map((mapping) => {
  const rows = validThresholdTrials.filter((row) => row.method === mapping.method && row.task_priority === mapping.taskPriority)
  const perPerson = [...new Set(rows.map((row) => thresholdSessionMap.get(row.session_id).program_person_key))].sort().map((person) => {
    const personRows = rows.filter((row) => thresholdSessionMap.get(row.session_id).program_person_key === person)
    return { numerator: personRows.filter(thresholdSuccess).length, denominator: personRows.length }
  })
  const rateOrder = (left, right) => left.numerator * right.denominator - right.numerator * left.denominator
  const orderedRates = [...perPerson].sort(rateOrder)
  return {
    metricId: mapping.metricId,
    method: mapping.method,
    taskPriority: mapping.taskPriority,
    successNumerator: rows.filter(thresholdSuccess).length,
    denominator: rows.length,
    participantRateMinNumerator: orderedRates[0].numerator,
    participantRateMinDenominator: orderedRates[0].denominator,
    participantRateMaxNumerator: orderedRates.at(-1).numerator,
    participantRateMaxDenominator: orderedRates.at(-1).denominator,
    uniquePersonCount: perPerson.length,
  }
}).sort((left, right) => left.method.localeCompare(right.method, "en") || left.taskPriority.localeCompare(right.taskPriority, "en"))
const thresholdCoverageRows = thresholdDatasets.plan005ThresholdSessions.flatMap((session) => candidates.flatMap((candidateId) => priorities.map((taskPriority) => ["first-click", "tree"].map((method) => ({
  studyId: session.study_id,
  candidateId,
  method,
  taskPriority,
  validTrialCount: validThresholdTrials.filter((row) => row.session_id === session.session_id && row.candidate_id === candidateId && row.method === method && row.task_priority === taskPriority).length,
}))))).flat(2).sort((left, right) => left.studyId.localeCompare(right.studyId, "en") || left.candidateId.localeCompare(right.candidateId, "en") || left.method.localeCompare(right.method, "en") || left.taskPriority.localeCompare(right.taskPriority, "en"))
if (thresholdMetricRows.length !== 8 || thresholdMetricRows.some((row) => row.denominator !== 4 || row.successNumerator !== 4 || row.uniquePersonCount !== 2) || thresholdCoverageRows.length !== 32 || thresholdCoverageRows.some((row) => row.validTrialCount !== 1)) fail("threshold deterministic aggregate derivation failed")
const eligibleThresholdTrialIds = validThresholdTrials.map((row) => row.trial_id).sort()
const eligibleThresholdTrialSetSha = sha256(eligibleThresholdTrialIds.map((id) => `${id}\n`).join(""))
const thresholdEligibleStudyIds = thresholdDatasets.plan005ThresholdSessions.map((row) => row.study_id).sort()
const thresholdEligibleSetSha = sha256(thresholdEligibleStudyIds.map((id) => `${id}\n`).join(""))
const thresholdSessionDurations = thresholdDatasets.plan005ThresholdSessions.map((session) => (Date.parse(session.ended_at_utc) - Date.parse(session.started_at_utc)) / 1000).sort((left, right) => left - right)
const thresholdAggregateExample = {
  schemaVersion: contract.schemas.plan005ThresholdAggregate.id,
  protocolVersion: contract.protocolVersion,
  phaseVersion: "THRESHOLD-PILOT-V1",
  cutoffAtUtc: "2026-01-02T00:00:00Z",
  inputManifestSha256: thresholdInputManifestSha,
  attritionProjectionSha256: thresholdPhaseProjection.fileSha256,
  eligibleStudyIds: thresholdEligibleStudyIds,
  eligibleSetSha256: thresholdEligibleSetSha,
  eligibleTrialSetSha256: eligibleThresholdTrialSetSha,
  scheduleFileSha256: thresholdScheduleFileSha,
  coverageRows: thresholdCoverageRows,
  metricRows: thresholdMetricRows,
  exclusionRows: [],
  sessionLengthReview: {
    declaredDurationSeconds: 3600,
    eligibleSessionCount: thresholdSessionDurations.length,
    minimumDurationSeconds: thresholdSessionDurations[0],
    medianDurationNumeratorSeconds: thresholdSessionDurations[0] + thresholdSessionDurations[1],
    medianDurationDenominator: 2,
    maximumDurationSeconds: thresholdSessionDurations.at(-1),
    noRushingObserved: true,
    fitsDeclaredDuration: true,
    rerunRequired: false,
    reviewerCode: "HUMAN-DURATION-REVIEWER",
    reviewedAtUtc: "2026-01-02T00:00:00Z",
  },
}
const thresholdPilotAggregateFileSha = sha256(serializeCanonicalJson(thresholdAggregateExample))
const formalActivationAtUtc = "2026-01-03T00:00:00Z"
const thresholdDeclarationRows = thresholdMetricRows.map((metric, index) => rowFor("plan005ThresholdDeclarations", {
  declaration_id: `THRESHOLD-${String(index + 1).padStart(2, "0")}`,
  metric_id: metric.metricId,
  method: metric.method,
  task_priority: metric.taskPriority,
  pilot_input_manifest_sha256: thresholdInputManifestSha,
  pilot_aggregate_file_sha256: thresholdPilotAggregateFileSha,
  eligible_trial_set_sha256: eligibleThresholdTrialSetSha,
  success_numerator: String(metric.successNumerator),
  denominator: String(metric.denominator),
  participant_rate_min_numerator: String(metric.participantRateMinNumerator),
  participant_rate_min_denominator: String(metric.participantRateMinDenominator),
  participant_rate_max_numerator: String(metric.participantRateMaxNumerator),
  participant_rate_max_denominator: String(metric.participantRateMaxDenominator),
  threshold_numerator: "1",
  threshold_denominator: "2",
  rationale_sha256: hashToken(`threshold-rationale:${metric.metricId}`),
  declared_by_code: "HUMAN-THRESHOLD-OWNER",
  reviewed_by_code: "HUMAN-SECOND-REVIEWER",
  declared_at_utc: "2026-01-02T01:00:00Z",
}))
const validateThresholdDeclarations = (rows) => {
  if (rows.length !== 8) fail("threshold declarations require exactly eight rows")
  const cells = new Set()
  for (const row of rows) {
    const key = `${row.method}:${row.task_priority}`
    if (cells.has(key)) fail("threshold declarations contain duplicate cell")
    cells.add(key)
    const mapping = contract.plan005.thresholdMetricMap.find((candidate) => candidate.method === row.method && candidate.taskPriority === row.task_priority)
    if (!mapping || mapping.metricId !== row.metric_id) fail("threshold metric mapping mismatch")
    const aggregate = thresholdMetricRows.find((candidate) => candidate.metricId === row.metric_id)
    if (row.pilot_input_manifest_sha256 !== thresholdInputManifestSha || row.pilot_aggregate_file_sha256 !== thresholdPilotAggregateFileSha || row.eligible_trial_set_sha256 !== eligibleThresholdTrialSetSha) fail("threshold declaration upstream hash mismatch")
    const pairs = [
      [row.success_numerator, aggregate.successNumerator], [row.denominator, aggregate.denominator],
      [row.participant_rate_min_numerator, aggregate.participantRateMinNumerator], [row.participant_rate_min_denominator, aggregate.participantRateMinDenominator],
      [row.participant_rate_max_numerator, aggregate.participantRateMaxNumerator], [row.participant_rate_max_denominator, aggregate.participantRateMaxDenominator],
    ]
    for (const [actual, expected] of pairs) if (Number(actual) !== expected) fail("threshold declaration rational does not match aggregate")
    for (const [numeratorField, denominatorField] of [["success_numerator", "denominator"], ["participant_rate_min_numerator", "participant_rate_min_denominator"], ["participant_rate_max_numerator", "participant_rate_max_denominator"], ["threshold_numerator", "threshold_denominator"]]) {
      const numerator = Number(row[numeratorField])
      const denominator = Number(row[denominatorField])
      if (!Number.isSafeInteger(denominator) || denominator <= 0 || numerator < 0 || numerator > denominator) fail("threshold declaration rational is out of bounds")
    }
    if (row.declared_by_code === row.reviewed_by_code) fail("threshold declaration reviewers are not distinct")
    if (row.declared_at_utc >= formalActivationAtUtc) fail("threshold declaration is not before formal activation")
  }
}
const parsedThresholdDeclarations = parseRows("plan005ThresholdDeclarations", thresholdDeclarationRows)
validateThresholdDeclarations(parsedThresholdDeclarations)
const thresholdDeclarationFileSha = sha256(serializeTsv(contract.schemas.plan005ThresholdDeclarations, parsedThresholdDeclarations))
tsvSemanticFixtureCount += 2

expectSemanticFailure(() => validateThresholdDeclarations(parsedThresholdDeclarations.slice(1)), "exactly eight")
expectSemanticFailure(() => validateThresholdDeclarations([parsedThresholdDeclarations[0], { ...parsedThresholdDeclarations[0], declaration_id: "THRESHOLD-DUP" }, ...parsedThresholdDeclarations.slice(2)]), "duplicate cell")
expectSemanticFailure(() => validateThresholdDeclarations(parsedThresholdDeclarations.map((row, index) => index === 0 ? { ...row, metric_id: parsedThresholdDeclarations[1].metric_id } : row)), "metric mapping")
expectSemanticFailure(() => validateThresholdDeclarations(parsedThresholdDeclarations.map((row, index) => index === 0 ? { ...row, pilot_aggregate_file_sha256: hashToken("wrong-threshold-aggregate") } : row)), "upstream hash")
expectSemanticFailure(() => validateThresholdDeclarations(parsedThresholdDeclarations.map((row, index) => index === 0 ? { ...row, success_numerator: "3" } : row)), "does not match aggregate")
expectSemanticFailure(() => validateThresholdDeclarations(parsedThresholdDeclarations.map((row, index) => index === 0 ? { ...row, threshold_denominator: "0" } : row)), "out of bounds")
expectSemanticFailure(() => validateThresholdDeclarations(parsedThresholdDeclarations.map((row, index) => index === 0 ? { ...row, reviewed_by_code: row.declared_by_code } : row)), "not distinct")
expectSemanticFailure(() => validateThresholdDeclarations(parsedThresholdDeclarations.map((row, index) => index === 0 ? { ...row, declared_at_utc: formalActivationAtUtc } : row)), "before formal activation")

const fixtureSelectedCandidateId = "candidate-a"
const acceptedContentContractSha = hashToken("accepted-plan-004-content-contract")
const r2ArtifactVersionSha = hashToken(`r2-artifact:${fixtureSelectedCandidateId}`)
const firstClickRows = []
const treeRows = []
for (const candidate of candidates) {
  for (const task of taskRows) {
    const registry = taskById.get(task.taskId)
    firstClickRows.push(rowFor("firstClickSchedule", {
      round_id: "first-click-r1", candidate_id: candidate, task_id: task.taskId,
      canonical_task_position: String(task.position), task_priority: task.priority,
      task_registry_file_sha256: taskRegistryFileSha, prompt_sha256: registry.prompt_sha256,
      threshold_declaration_file_sha256: thresholdDeclarationFileSha, entry_page_id: task.entryPageId,
      entry_state_id: task.entryStateId, entry_state_sha256: hashToken(`entry:${candidate}:${task.taskId}`),
      artifact_version_sha256: candidateArtifactShaById[candidate], hierarchy_sha256: candidateHierarchyShaById[candidate],
      content_contract_sha256: "n/a", expected_destination_id: `DEST-${candidate}-${task.taskId}`,
      expected_first_action_id: `ACTION-${candidate}-${task.taskId}`,
    }))
    treeRows.push(rowFor("plan005TreeSchedule", {
      round_id: "tree-r1", candidate_id: candidate, task_id: task.taskId,
      canonical_task_position: String(task.position), task_priority: task.priority,
      task_registry_file_sha256: taskRegistryFileSha, prompt_sha256: registry.prompt_sha256,
      threshold_declaration_file_sha256: thresholdDeclarationFileSha, artifact_version_sha256: candidateArtifactShaById[candidate],
      hierarchy_sha256: candidateHierarchyShaById[candidate], expected_destination_id: `DEST-${candidate}-${task.taskId}`,
    }))
  }
}
for (const task of taskRows) {
  const registry = taskById.get(task.taskId)
  firstClickRows.push(rowFor("firstClickSchedule", {
    round_id: "first-click-r2", candidate_id: fixtureSelectedCandidateId, task_id: task.taskId,
    canonical_task_position: String(task.position), task_priority: task.priority,
    task_registry_file_sha256: taskRegistryFileSha, prompt_sha256: registry.prompt_sha256,
    threshold_declaration_file_sha256: thresholdDeclarationFileSha, entry_page_id: task.entryPageId,
    entry_state_id: task.entryStateId, entry_state_sha256: hashToken(`entry:r2:${fixtureSelectedCandidateId}:${task.taskId}`),
    artifact_version_sha256: r2ArtifactVersionSha, hierarchy_sha256: candidateHierarchyShaById[fixtureSelectedCandidateId],
    content_contract_sha256: acceptedContentContractSha,
    expected_destination_id: `DEST-${fixtureSelectedCandidateId}-${task.taskId}`,
    expected_first_action_id: `ACTION-R2-${fixtureSelectedCandidateId}-${task.taskId}`,
  }))
}
const parsedFirstClick = parseRows("firstClickSchedule", firstClickRows)
const parsedTree = parseRows("plan005TreeSchedule", treeRows)
validateForeignKeys({ plan005TaskRegistry: parsedTaskRegistry, firstClickSchedule: parsedFirstClick, plan005TreeSchedule: parsedTree })
const parsedFirstClickR1 = parsedFirstClick.filter((row) => row.round_id === "first-click-r1")
const parsedFirstClickR2 = parsedFirstClick.filter((row) => row.round_id === "first-click-r2")
if (parsedFirstClickR1.length !== 26 || parsedFirstClickR2.length !== 13 || parsedTree.length !== 26) fail("formal R1/R2 schedule coverage failed")
if (new Set(parsedFirstClickR2.map((row) => row.candidate_id)).size !== 1 || parsedFirstClickR2[0].candidate_id !== fixtureSelectedCandidateId || parsedFirstClickR2.some((row) => row.content_contract_sha256 !== acceptedContentContractSha || row.hierarchy_sha256 !== candidateHierarchyShaById[fixtureSelectedCandidateId])) fail("formal R2 selected-candidate schedule lineage failed")
for (const task of taskRows) {
  const rows = parsedFirstClickR1.filter((row) => row.task_id === task.taskId)
  if (rows.length !== 2 || rows.some((row) => row.entry_page_id !== task.entryPageId || row.entry_state_id !== task.entryStateId)) fail(`entry template drift for ${task.taskId}`)
  const r2Row = parsedFirstClickR2.find((row) => row.task_id === task.taskId)
  if (!r2Row || r2Row.entry_page_id !== task.entryPageId || r2Row.entry_state_id !== task.entryStateId) fail(`R2 entry template drift for ${task.taskId}`)
}

// Coherent formal navigation fixtures bind consent, allocation, all 13 task
// rows, exact tree/first-click schedules, and independently reviewed critical
// issue lineage.
const rotateThenReverse = (values, offset, reversed) => {
  const rotated = [...values.slice(offset), ...values.slice(0, offset)]
  return reversed ? rotated.reverse() : rotated
}
const p005AllocationRows = []
let p005AllocationPosition = 0
const formalPhaseCandidates = [
  { phase: "p005-tree-test", candidateIds: candidates },
  { phase: "p005-first-click-r1", candidateIds: candidates },
  { phase: "p005-first-click-r2", candidateIds: [fixtureSelectedCandidateId] },
]
for (const { phase, candidateIds } of formalPhaseCandidates) {
  for (const candidateId of candidateIds) {
    const candidateIndex = candidates.indexOf(candidateId)
    const rotationOffset = candidateIndex
    const reversed = candidateIndex === 1
    const order = rotateThenReverse(taskRows.map((task) => task.taskId), rotationOffset, reversed)
    const orderSha = sha256(order.map((taskId) => `${taskId}\n`).join(""))
    const primarySlot = `${phase}-${candidateId}-PRIMARY`
    for (const role of ["primary", "reserve-1", "reserve-2"]) {
      p005AllocationPosition += 1
      p005AllocationRows.push(rowFor("plan005FormalAllocation", {
        phase, schedule_version: `${phase}-SCHEDULE-V1`, planned_effective_n: String(candidateIds.length),
        randomization_seed_hex: hashToken(`p005-allocation-seed:${phase}`), randomized_position: String(p005AllocationPosition),
        allocation_slot: role === "primary" ? primarySlot : `${phase}-${candidateId}-${role.toUpperCase()}`,
        slot_role: role, replacement_of_allocation_slot: role === "primary" ? "n/a" : primarySlot,
        candidate_id: candidateId, rotation_offset: String(rotationOffset), reversed: String(reversed),
        task_order_sha256: orderSha,
      }))
    }
  }
}
const parsedP005AllocationRows = parseRows("plan005FormalAllocation", p005AllocationRows)
if (new Set(parsedP005AllocationRows.map((row) => `${row.phase}:${row.schedule_version}:${row.allocation_slot}`)).size !== parsedP005AllocationRows.length) fail("Plan 005 allocation_slot uniqueness failed")
for (const primary of parsedP005AllocationRows.filter((row) => row.slot_role === "primary")) {
  const reserves = parsedP005AllocationRows.filter((row) => row.replacement_of_allocation_slot === primary.allocation_slot)
  if (reserves.length !== 2 || reserves.some((row) => row.candidate_id !== primary.candidate_id || row.rotation_offset !== primary.rotation_offset || row.reversed !== primary.reversed || row.task_order_sha256 !== primary.task_order_sha256)) fail("Plan 005 reserve allocation drift")
}
const p005FormalConsentRows = []
const p005FormalEvidenceRows = []
const p005FormalStudyConfigs = []
const formalPhaseConfigs = [
  { phase: "p005-tree-test", method: "tree", roundId: "tree-r1", studyPrefix: "TT", candidateIds: candidates, inputCreatedAtUtc: "2026-01-03T00:00:00Z", consentAtUtc: "2026-01-04T00:00:00Z", accessAtUtc: "2026-01-04T00:01:00Z", completedAtUtc: "2026-01-05T03:00:00Z", withdrawalCutoffAtUtc: "2026-01-20T00:00:00Z", aggregateCutoffAtUtc: "2026-01-21T00:00:00Z" },
  { phase: "p005-first-click-r1", method: "first-click", roundId: "first-click-r1", studyPrefix: "F1", candidateIds: candidates, inputCreatedAtUtc: "2026-01-03T00:00:00Z", consentAtUtc: "2026-01-04T00:00:00Z", accessAtUtc: "2026-01-04T00:01:00Z", completedAtUtc: "2026-01-05T03:00:00Z", withdrawalCutoffAtUtc: "2026-01-20T00:00:00Z", aggregateCutoffAtUtc: "2026-01-21T00:00:00Z" },
  { phase: "p005-first-click-r2", method: "first-click", roundId: "first-click-r2", studyPrefix: "F2", candidateIds: [fixtureSelectedCandidateId], inputCreatedAtUtc: "2026-01-23T00:00:00Z", consentAtUtc: "2026-01-24T00:00:00Z", accessAtUtc: "2026-01-24T00:01:00Z", completedAtUtc: "2026-01-25T03:00:00Z", withdrawalCutoffAtUtc: "2026-02-10T00:00:00Z", aggregateCutoffAtUtc: "2026-02-11T00:00:00Z" },
]
const formalAllocationFileShaByPhase = new Map(formalPhaseConfigs.map(({ phase }) => [phase, sha256(serializeTsv(contract.schemas.plan005FormalAllocation, parsedP005AllocationRows.filter((row) => row.phase === phase)))]))
const formalEntryScheduleFileShaByPhase = new Map(formalPhaseConfigs.map(({ phase, method, roundId }) => {
  const schema = method === "tree" ? contract.schemas.plan005TreeSchedule : contract.schemas.firstClickSchedule
  const rows = method === "tree" ? parsedTree : parsedFirstClick.filter((row) => row.round_id === roundId)
  return [phase, sha256(serializeTsv(schema, rows))]
}))
const formalInputManifestShaByPhase = new Map()
for (const { phase, method, roundId, inputCreatedAtUtc } of formalPhaseConfigs) {
  const phaseVersion = `${phase}-INPUT-V1`
  const protocolSha = hashToken(`formal-protocol:${phase}`)
  const scheduleRows = method === "tree" ? parsedTree : parsedFirstClick.filter((row) => row.round_id === roundId)
  const scheduleSchema = method === "tree" ? contract.schemas.plan005TreeSchedule : contract.schemas.firstClickSchedule
  const scheduleFileSha = formalEntryScheduleFileShaByPhase.get(phase)
  const allocationRowsForPhase = parsedP005AllocationRows.filter((row) => row.phase === phase)
  const allocationFileSha = formalAllocationFileShaByPhase.get(phase)
  const artifactSetSha = hashToken(`formal-artifact-set:${phase}`)
  const rows = parseRows("phaseInputManifest", [
    rowFor("phaseInputManifest", { phase_id: phase, phase_version: phaseVersion, input_manifest_id: `${phase}-INPUT`, source_file_id: "ALLOCATION", source_schema_id: contract.schemas.plan005FormalAllocation.id, source_file_sha256: allocationFileSha, source_row_count: String(allocationRowsForPhase.length), protocol_sha256: protocolSha, artifact_or_card_set_sha256: artifactSetSha, schedule_file_sha256: scheduleFileSha, task_registry_file_sha256: taskRegistryFileSha, created_at_utc: inputCreatedAtUtc, created_by_code: "HUMAN-NAVIGATION-OWNER" }),
    rowFor("phaseInputManifest", { phase_id: phase, phase_version: phaseVersion, input_manifest_id: `${phase}-INPUT`, source_file_id: "ENTRY-SCHEDULE", source_schema_id: scheduleSchema.id, source_file_sha256: scheduleFileSha, source_row_count: String(scheduleRows.length), protocol_sha256: protocolSha, artifact_or_card_set_sha256: artifactSetSha, schedule_file_sha256: scheduleFileSha, task_registry_file_sha256: taskRegistryFileSha, created_at_utc: inputCreatedAtUtc, created_by_code: "HUMAN-NAVIGATION-OWNER" }),
    rowFor("phaseInputManifest", { phase_id: phase, phase_version: phaseVersion, input_manifest_id: `${phase}-INPUT`, source_file_id: "TASK-REGISTRY", source_schema_id: contract.schemas.plan005TaskRegistry.id, source_file_sha256: taskRegistryFileSha, source_row_count: String(parsedTaskRegistry.length), protocol_sha256: protocolSha, artifact_or_card_set_sha256: artifactSetSha, schedule_file_sha256: scheduleFileSha, task_registry_file_sha256: taskRegistryFileSha, created_at_utc: inputCreatedAtUtc, created_by_code: "HUMAN-NAVIGATION-OWNER" }),
  ])
  formalInputManifestShaByPhase.set(phase, sha256(serializeTsv(contract.schemas.phaseInputManifest, rows)))
}
for (const { phase, method, roundId, studyPrefix, candidateIds, consentAtUtc, accessAtUtc, completedAtUtc, withdrawalCutoffAtUtc } of formalPhaseConfigs) {
  const scheduleRows = method === "tree" ? parsedTree : parsedFirstClick.filter((row) => row.round_id === roundId)
  for (const candidateId of candidateIds) {
    const candidateIndex = candidates.indexOf(candidateId)
    const primary = parsedP005AllocationRows.find((row) => row.phase === phase && row.candidate_id === candidateId && row.slot_role === "primary")
    const studyId = `${studyPrefix}-P0${candidateIndex + 1}`
    const personKey = `PPK-${sha256(`formal-person:${phase}:${candidateId}`).slice(0, 32)}`
    const eventId = `EVT-${sha256(`formal-consent:${phase}:${candidateId}`).slice(0, 32)}`
    const formalConsentRow = rowFor("attritionConsent", {
      event_id: eventId, recruitment_key: `RK-${sha256(`formal-recruitment:${phase}:${candidateId}`).slice(0, 32)}`,
      program_person_key: personKey, study_id: studyId, event_at_utc: consentAtUtc,
      event_type: "research-consent-affirmed", target_scope: "phase", target_plan_id: "005", target_phase_id: phase,
      consent_document_sha256: hashToken(`formal-consent-document:${phase}:${candidateId}`), withdrawal_cutoff_at_utc: withdrawalCutoffAtUtc,
      compensation_terms_code: "unpaid", compensation_terms_sha256: compensationTermsSha(phase), reason_code: "none",
      access_strategy_code: "n/a", actor_code: "HUMAN-MODERATOR", prior_event_id: "n/a",
    })
    const formalRecordingRow = rowFor("attritionConsent", {
      event_id: `EVT-${sha256(`formal-recording-not-used:${phase}:${candidateId}`).slice(0, 32)}`,
      recruitment_key: formalConsentRow.recruitment_key, program_person_key: personKey, study_id: studyId,
      event_at_utc: new Date(Date.parse(consentAtUtc) + 30_000).toISOString().replace(".000Z", "Z"),
      event_type: "recording-not-used", target_scope: "recording", target_plan_id: "n/a", target_phase_id: "n/a",
      consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a", compensation_terms_code: "unpaid",
      compensation_terms_sha256: compensationTermsSha(phase), reason_code: "none", access_strategy_code: "n/a",
      actor_code: "HUMAN-MODERATOR", prior_event_id: formalConsentRow.event_id,
    })
    const formalAccessRow = rowFor("attritionConsent", {
      event_id: `EVT-${sha256(`formal-access:${phase}:${candidateId}`).slice(0, 32)}`,
      recruitment_key: formalConsentRow.recruitment_key, program_person_key: personKey, study_id: studyId,
      event_at_utc: accessAtUtc, event_type: "access-strategy-used", target_scope: "phase",
      target_plan_id: "005", target_phase_id: phase, consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a",
      compensation_terms_code: "unpaid", compensation_terms_sha256: formalConsentRow.compensation_terms_sha256,
      reason_code: "none", access_strategy_code: "keyboard-only", actor_code: "HUMAN-MODERATOR", prior_event_id: formalRecordingRow.event_id,
    })
    const formalCompletionRow = rowFor("attritionConsent", {
      event_id: `EVT-${sha256(`formal-completed:${phase}:${candidateId}`).slice(0, 32)}`,
      recruitment_key: formalConsentRow.recruitment_key, program_person_key: personKey, study_id: studyId,
      event_at_utc: completedAtUtc, event_type: "session-completed", target_scope: "phase",
      target_plan_id: "005", target_phase_id: phase, consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a",
      compensation_terms_code: "unpaid", compensation_terms_sha256: formalConsentRow.compensation_terms_sha256,
      reason_code: "none", access_strategy_code: "n/a", actor_code: "HUMAN-MODERATOR", prior_event_id: formalAccessRow.event_id,
    })
    p005FormalConsentRows.push(formalConsentRow, formalRecordingRow, formalAccessRow, formalCompletionRow)
    p005FormalStudyConfigs.push({ recruitmentKey: formalConsentRow.recruitment_key, programPersonKey: personKey, studyId, consentId: eventId, planId: "005", phaseId: phase })
    const finalOrder = rotateThenReverse(taskRows.map((task) => task.taskId), Number(primary.rotation_offset), primary.reversed === "true")
    if (sha256(finalOrder.map((taskId) => `${taskId}\n`).join("")) !== primary.task_order_sha256) fail("Plan 005 allocation task-order digest failed")
    for (const [sequenceIndex, taskId] of finalOrder.entries()) {
      const schedule = scheduleRows.find((row) => row.candidate_id === candidateId && row.task_id === taskId)
      const fixtureTreeIndirect = phase === "p005-tree-test" && candidateId === "candidate-b" && taskId === taskRows[0].taskId
      const fixtureTreeFailed = phase === "p005-tree-test" && candidateId === "candidate-b" && taskId === taskRows[1].taskId
      const fixtureFirstClickIncorrect = phase === "p005-first-click-r1" && candidateId === "candidate-b" && taskId === taskRows[2].taskId
      p005FormalEvidenceRows.push(rowFor("plan005FormalTaskEvidence", {
        task_evidence_id: `${phase}-${candidateId}-${taskId}`, phase, study_id: studyId,
        program_person_key: personKey, session_id: `${phase}-${candidateId}-SESSION`, research_consent_event_id: eventId,
        phase_input_manifest_sha256: formalInputManifestShaByPhase.get(phase), allocation_schedule_version: primary.schedule_version,
        allocation_schedule_file_sha256: formalAllocationFileShaByPhase.get(phase), allocation_slot: primary.allocation_slot,
        candidate_id: candidateId, allocation_rotation_offset: primary.rotation_offset, allocation_reversed: primary.reversed,
        allocation_task_order_sha256: primary.task_order_sha256, method,
        task_registry_file_sha256: schedule.task_registry_file_sha256, prompt_sha256: schedule.prompt_sha256,
        task_priority: schedule.task_priority, threshold_declaration_file_sha256: schedule.threshold_declaration_file_sha256,
        artifact_version_sha256: schedule.artifact_version_sha256, hierarchy_sha256: schedule.hierarchy_sha256,
        entry_schedule_schema_id: method === "tree" ? contract.schemas.plan005TreeSchedule.id : contract.schemas.firstClickSchedule.id,
        entry_schedule_file_sha256: formalEntryScheduleFileShaByPhase.get(phase), schedule_round_id: roundId,
        content_contract_sha256: method === "tree" ? "n/a" : schedule.content_contract_sha256,
        task_id: taskId, canonical_task_position: schedule.canonical_task_position, task_sequence: String(sequenceIndex + 1),
        entry_page_id: method === "tree" ? "n/a" : schedule.entry_page_id,
        entry_state_id: method === "tree" ? "n/a" : schedule.entry_state_id,
        entry_state_sha256: method === "tree" ? "n/a" : schedule.entry_state_sha256,
        expected_destination_id: schedule.expected_destination_id,
        expected_first_action_id: method === "tree" ? "n/a" : schedule.expected_first_action_id,
        observed_destination_id: fixtureTreeFailed ? `WRONG-DESTINATION-${taskId}` : schedule.expected_destination_id,
        observed_first_action_id: method === "tree" ? "n/a" : fixtureFirstClickIncorrect ? `WRONG-FIRST-ACTION-${taskId}` : schedule.expected_first_action_id,
        wrong_branch_count: fixtureTreeIndirect ? "1" : "0", backtrack_count: fixtureTreeIndirect ? "1" : "0",
        elapsed_ms: "1000", rescue_used: "false", timeout_used: "false",
        analysis_disposition: "included", exclusion_code: "n/a", notes_code: "n/a",
      }))
    }
  }
}
const parsedP005FormalConsents = parseRows("attritionConsent", p005FormalConsentRows)
assertZeroBudgetLedgerPolicy(parsedP005FormalConsents)
const parsedP005FormalEvidence = parseRows("plan005FormalTaskEvidence", p005FormalEvidenceRows)
const initialCriticalEvidence = parsedP005FormalEvidence.find((row) => row.phase === "p005-tree-test" && row.candidate_id === "candidate-a" && row.task_id === "profile-fit")
const retestCriticalEvidence = parsedP005FormalEvidence.find((row) => row.phase === "p005-tree-test" && row.candidate_id === "candidate-a" && row.task_id === "quick-practice")
const p005IssueRows = parseRows("plan005Issues", [
  rowFor("plan005Issues", {
    phase: initialCriticalEvidence.phase, issue_occurrence_id: "NAV-ISSUE-INITIAL", issue_family_id: "NAV-CRITICAL-FAMILY",
    task_evidence_id: initialCriticalEvidence.task_evidence_id, candidate_id: initialCriticalEvidence.candidate_id,
    study_id: initialCriticalEvidence.study_id, task_id: initialCriticalEvidence.task_id, method: initialCriticalEvidence.method,
    artifact_version_sha256: initialCriticalEvidence.artifact_version_sha256, hierarchy_sha256: initialCriticalEvidence.hierarchy_sha256,
    task_registry_file_sha256: initialCriticalEvidence.task_registry_file_sha256, prompt_sha256: initialCriticalEvidence.prompt_sha256,
    observed_at_utc: "2026-01-05T00:00:00Z", severity: "critical", taxonomy_code: "NAV-DEAD-END",
    occurrence: "FIXTURE-CRITICAL", moderator_code: "HUMAN-MODERATOR", second_reviewer_code: "HUMAN-SECOND-REVIEWER",
    review_state: "confirmed", retest_of_issue_family_id: "n/a", retest_outcome: "not-a-retest", disposition: "open", adjudication_code: "n/a",
  }),
  rowFor("plan005Issues", {
    phase: retestCriticalEvidence.phase, issue_occurrence_id: "NAV-ISSUE-RETEST", issue_family_id: "NAV-CRITICAL-RETEST",
    task_evidence_id: retestCriticalEvidence.task_evidence_id, candidate_id: retestCriticalEvidence.candidate_id,
    study_id: retestCriticalEvidence.study_id, task_id: retestCriticalEvidence.task_id, method: retestCriticalEvidence.method,
    artifact_version_sha256: retestCriticalEvidence.artifact_version_sha256, hierarchy_sha256: retestCriticalEvidence.hierarchy_sha256,
    task_registry_file_sha256: retestCriticalEvidence.task_registry_file_sha256, prompt_sha256: retestCriticalEvidence.prompt_sha256,
    observed_at_utc: "2026-01-05T01:00:00Z", severity: "critical", taxonomy_code: "NAV-DEAD-END-RETEST",
    occurrence: "FIXTURE-RETEST", moderator_code: "HUMAN-MODERATOR", second_reviewer_code: "HUMAN-SECOND-REVIEWER",
    review_state: "confirmed", retest_of_issue_family_id: "NAV-CRITICAL-FAMILY", retest_outcome: "passed", disposition: "resolved", adjudication_code: "n/a",
  }),
])
const firstClickCandidateBCriticalEvidence = parsedP005FormalEvidence.find((row) => row.phase === "p005-first-click-r1" && row.candidate_id === "candidate-b" && row.task_id === "profile-fit")
const p005AggregateIssueRows = parseRows("plan005Issues", [
  ...p005IssueRows,
  rowFor("plan005Issues", {
    phase: firstClickCandidateBCriticalEvidence.phase, issue_occurrence_id: "NAV-F1-B-ISSUE-INITIAL",
    issue_family_id: "NAV-F1-B-CRITICAL-FAMILY", task_evidence_id: firstClickCandidateBCriticalEvidence.task_evidence_id,
    candidate_id: firstClickCandidateBCriticalEvidence.candidate_id, study_id: firstClickCandidateBCriticalEvidence.study_id,
    task_id: firstClickCandidateBCriticalEvidence.task_id, method: firstClickCandidateBCriticalEvidence.method,
    artifact_version_sha256: firstClickCandidateBCriticalEvidence.artifact_version_sha256,
    hierarchy_sha256: firstClickCandidateBCriticalEvidence.hierarchy_sha256,
    task_registry_file_sha256: firstClickCandidateBCriticalEvidence.task_registry_file_sha256,
    prompt_sha256: firstClickCandidateBCriticalEvidence.prompt_sha256,
    observed_at_utc: "2026-01-05T02:00:00Z", severity: "critical", taxonomy_code: "NAV-F1-B-DEAD-END",
    occurrence: "FIXTURE-CANDIDATE-B-CRITICAL", moderator_code: "HUMAN-MODERATOR",
    second_reviewer_code: "HUMAN-SECOND-REVIEWER", review_state: "confirmed",
    retest_of_issue_family_id: "n/a", retest_outcome: "not-a-retest", disposition: "open", adjudication_code: "n/a",
  }),
])
const p005FormalDatasets = {
  attritionConsent: parsedP005FormalConsents,
  plan005FormalAllocation: parsedP005AllocationRows,
  plan005TaskRegistry: parsedTaskRegistry,
  plan005TreeSchedule: parsedTree,
  firstClickSchedule: parsedFirstClick,
  plan005FormalTaskEvidence: parsedP005FormalEvidence,
  plan005Issues: p005AggregateIssueRows,
}
validateForeignKeys(p005FormalDatasets)
const validateP005FormalSemantics = (datasets) => {
  for (const evidenceRows of Map.groupBy(datasets.plan005FormalTaskEvidence, (row) => `${row.phase}:${row.study_id}`).values()) {
    if (evidenceRows.length !== 13 || new Set(evidenceRows.map((row) => row.task_id)).size !== 13 || new Set(evidenceRows.map((row) => row.candidate_id)).size !== 1) fail("Plan 005 formal 13-task single-candidate coverage failed")
    const ordered = [...evidenceRows].sort((left, right) => Number(left.task_sequence) - Number(right.task_sequence))
    if (ordered.some((row, index) => Number(row.task_sequence) !== index + 1) || sha256(ordered.map((row) => `${row.task_id}\n`).join("")) !== ordered[0].allocation_task_order_sha256) fail("Plan 005 formal task-order evidence failed")
    const consent = datasets.attritionConsent.find((row) => row.event_id === ordered[0].research_consent_event_id)
    if (!consent || consent.event_type !== "research-consent-affirmed" || consent.program_person_key !== ordered[0].program_person_key || consent.study_id !== ordered[0].study_id) fail("Plan 005 formal same-person consent mismatch")
  }
}
validateP005FormalSemantics(p005FormalDatasets)
const unresolvedP005CriticalFamilies = (issues, evidence) => issues.filter((issue) => issue.severity === "critical" && issue.retest_of_issue_family_id === "n/a" && !issues.some((retest) => {
  const retestEvidence = evidence.find((row) => row.task_evidence_id === retest.task_evidence_id)
  return retest.retest_of_issue_family_id === issue.issue_family_id && retest.candidate_id === issue.candidate_id && retest.hierarchy_sha256 === issue.hierarchy_sha256 && retest.observed_at_utc > issue.observed_at_utc && retest.review_state !== "pending-second-review" && retest.second_reviewer_code !== "n/a" && retest.second_reviewer_code !== retest.moderator_code && retest.retest_outcome === "passed" && retest.disposition === "resolved" && retestEvidence?.analysis_disposition === "included"
}))
if (unresolvedP005CriticalFamilies(p005IssueRows, parsedP005FormalEvidence).length !== 0) fail("valid Plan 005 critical retest lineage did not resolve")
const aggregateUnresolvedCriticals = unresolvedP005CriticalFamilies(p005AggregateIssueRows, parsedP005FormalEvidence)
if (aggregateUnresolvedCriticals.length !== 1 || aggregateUnresolvedCriticals[0].candidate_id !== "candidate-b" || aggregateUnresolvedCriticals[0].phase !== "p005-first-click-r1") fail("candidate-specific unresolved critical fixture failed")
tsvSemanticFixtureCount += 1
expectSemanticFailure(() => validateForeignKeys({ ...p005FormalDatasets, plan005FormalTaskEvidence: parsedP005FormalEvidence.map((row, index) => index === 0 ? { ...row, candidate_id: row.candidate_id === "candidate-a" ? "candidate-b" : "candidate-a" } : row) }), "broken example foreign key")
expectSemanticFailure(() => validateForeignKeys({ ...p005FormalDatasets, plan005FormalTaskEvidence: parsedP005FormalEvidence.map((row) => row.method === "first-click" && row.task_id === "profile-fit" ? { ...row, entry_state_sha256: hashToken("wrong-entry-state") } : row) }), "broken conditional example foreign key")
if (unresolvedP005CriticalFamilies(p005IssueRows.map((row) => row.issue_occurrence_id === "NAV-ISSUE-RETEST" ? { ...row, hierarchy_sha256: hashToken("changed-hierarchy") } : row), parsedP005FormalEvidence).length !== 1) fail("changed-hierarchy critical mutation was accepted")
if (unresolvedP005CriticalFamilies(p005IssueRows.map((row) => row.issue_occurrence_id === "NAV-ISSUE-RETEST" ? { ...row, second_reviewer_code: row.moderator_code } : row), parsedP005FormalEvidence).length !== 1) fail("same-reviewer critical mutation was accepted")
if (unresolvedP005CriticalFamilies(p005IssueRows.map((row) => row.issue_occurrence_id === "NAV-ISSUE-RETEST" ? { ...row, observed_at_utc: "2026-01-04T00:00:00Z" } : row), parsedP005FormalEvidence).length !== 1) fail("nonlater critical mutation was accepted")
if (unresolvedP005CriticalFamilies(p005IssueRows, parsedP005FormalEvidence.map((row) => row.task_evidence_id === retestCriticalEvidence.task_evidence_id ? { ...row, analysis_disposition: "excluded" } : row)).length !== 1) fail("ineligible critical retest mutation was accepted")
mutationCheckCount += 4

// Plan 004 balance/reserve example and independent current/candidate scoring.
const patterns = contract.plan004.allocationPatterns["6"]
const allocationRows = []
let allocationPosition = 0
for (const pattern of patterns) {
  const evenParity = [...pattern].filter((bit) => bit === "1").length % 2 === 0
  const direction = evenParity ? "CL-D1" : "CL-D2"
  const primarySlot = `CELL-${pattern}-PRIMARY`
  for (const role of ["primary", "reserve-1", "reserve-2"]) {
    allocationPosition += 1
    allocationRows.push(rowFor("plan004Allocation", {
      phase: "p004-r1", schedule_version: "R1-SCHEDULE-1", planned_effective_n: "6",
      randomization_seed_hex: "5".repeat(64), randomized_position: String(allocationPosition),
      allocation_slot: role === "primary" ? primarySlot : `CELL-${pattern}-${role.toUpperCase()}`,
      slot_role: role, replacement_of_allocation_slot: role === "primary" ? "n/a" : primarySlot,
      assigned_direction_id: direction, feedback_order: pattern[0] === "0" ? "current-first" : "candidate-first",
      offline_order: pattern[1] === "0" ? "current-first" : "candidate-first",
      import_reset_order: pattern[2] === "0" ? "current-first" : "candidate-first",
    }))
  }
}
const parsedAllocation = parseRows("plan004Allocation", allocationRows)
if (parsedAllocation.length !== 18) fail("Plan 004 primary/reserve schedule size failed")
const p004AllocationFileSha = sha256(serializeTsv(contract.schemas.plan004Allocation, parsedAllocation))
for (const primary of parsedAllocation.filter((row) => row.slot_role === "primary")) {
  const reserves = parsedAllocation.filter((row) => row.replacement_of_allocation_slot === primary.allocation_slot)
  if (reserves.length !== 2 || reserves.some((row) => row.assigned_direction_id !== primary.assigned_direction_id || row.feedback_order !== primary.feedback_order || row.offline_order !== primary.offline_order || row.import_reset_order !== primary.import_reset_order)) fail("Plan 004 reserve balance-cell drift")
}
if (new Set(parsedAllocation.map((row) => `${row.phase}:${row.schedule_version}:${row.allocation_slot}`)).size !== parsedAllocation.length) fail("Plan 004 allocation_slot uniqueness failed")

const p004Primary = parsedAllocation.find((row) => row.allocation_slot === "CELL-001-PRIMARY")
const p004RecruitmentKey = `RK-${"b".repeat(32)}`
const p004ProgramPersonKey = `PPK-${"b".repeat(32)}`
const p004TermsSha = compensationTermsSha("p004-r1")
const p004ScreenedEvent = rowFor("attritionConsent", {
  event_id: `EVT-${sha256("p004-screened").slice(0, 32)}`, recruitment_key: p004RecruitmentKey,
  program_person_key: "n/a", study_id: "n/a", event_at_utc: "2026-01-01T00:00:00Z",
  event_type: "screened-eligible", target_scope: "n/a", target_plan_id: "n/a", target_phase_id: "n/a",
  consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a", compensation_terms_code: "n/a",
  compensation_terms_sha256: "n/a", reason_code: "none", access_strategy_code: "n/a",
  actor_code: "HUMAN-MODERATOR", prior_event_id: "n/a",
})
const p004ContactEvent = rowFor("attritionConsent", {
  event_id: `EVT-${sha256("p004-contact-consent").slice(0, 32)}`, recruitment_key: p004RecruitmentKey,
  program_person_key: "n/a", study_id: "n/a", event_at_utc: "2026-01-01T00:01:00Z",
  event_type: "contact-consent-affirmed", target_scope: "contact", target_plan_id: "n/a", target_phase_id: "n/a",
  consent_document_sha256: hashToken("p004-contact-consent-document"), withdrawal_cutoff_at_utc: "n/a",
  compensation_terms_code: "n/a", compensation_terms_sha256: "n/a", reason_code: "none",
  access_strategy_code: "n/a", actor_code: "HUMAN-MODERATOR", prior_event_id: p004ScreenedEvent.event_id,
})
const p004ActivationEvent = rowFor("attritionConsent", {
  event_id: `EVT-${sha256("p004-activation").slice(0, 32)}`, recruitment_key: p004RecruitmentKey,
  program_person_key: p004ProgramPersonKey, study_id: "R1-P01", event_at_utc: "2026-01-01T00:02:00Z",
  event_type: "study-id-activated", target_scope: "phase", target_plan_id: "004", target_phase_id: "p004-r1",
  consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a", compensation_terms_code: "unpaid",
  compensation_terms_sha256: p004TermsSha, reason_code: "none", access_strategy_code: "n/a",
  actor_code: "HUMAN-MODERATOR", prior_event_id: p004ContactEvent.event_id,
})
const p004Consent = rowFor("attritionConsent", {
  event_id: `EVT-${"b".repeat(32)}`, recruitment_key: p004RecruitmentKey,
  program_person_key: p004ProgramPersonKey, study_id: "R1-P01",
  event_at_utc: "2026-01-01T00:03:00Z", event_type: "research-consent-affirmed",
  target_scope: "phase", target_plan_id: "004", target_phase_id: "p004-r1",
  consent_document_sha256: hashToken("p004-consent-document"), withdrawal_cutoff_at_utc: "2026-01-10T00:00:00Z",
  compensation_terms_code: "unpaid", compensation_terms_sha256: p004TermsSha,
  reason_code: "none", access_strategy_code: "n/a", actor_code: "HUMAN-MODERATOR", prior_event_id: p004ActivationEvent.event_id,
})
const p004RecordingNotUsedEvent = rowFor("attritionConsent", {
  event_id: `EVT-${sha256("p004-recording-not-used").slice(0, 32)}`, recruitment_key: p004RecruitmentKey,
  program_person_key: p004ProgramPersonKey, study_id: p004Consent.study_id, event_at_utc: "2026-01-01T00:03:30Z",
  event_type: "recording-not-used", target_scope: "recording", target_plan_id: "n/a", target_phase_id: "n/a",
  consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a", compensation_terms_code: "unpaid",
  compensation_terms_sha256: p004TermsSha, reason_code: "none", access_strategy_code: "n/a",
  actor_code: "HUMAN-MODERATOR", prior_event_id: p004Consent.event_id,
})
const p004AccessKeyboardEvent = rowFor("attritionConsent", {
  event_id: `EVT-${sha256("p004-access-keyboard").slice(0, 32)}`, recruitment_key: p004RecruitmentKey,
  program_person_key: p004ProgramPersonKey, study_id: p004Consent.study_id, event_at_utc: "2026-01-01T00:04:00Z",
  event_type: "access-strategy-used", target_scope: "phase", target_plan_id: "004", target_phase_id: "p004-r1",
  consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a", compensation_terms_code: "unpaid",
  compensation_terms_sha256: p004TermsSha, reason_code: "none", access_strategy_code: "keyboard-only",
  actor_code: "HUMAN-MODERATOR", prior_event_id: p004RecordingNotUsedEvent.event_id,
})
const p004AccessScreenReaderEvent = rowFor("attritionConsent", {
  event_id: `EVT-${sha256("p004-access-screen-reader").slice(0, 32)}`, recruitment_key: p004RecruitmentKey,
  program_person_key: p004ProgramPersonKey, study_id: p004Consent.study_id, event_at_utc: "2026-01-01T00:05:00Z",
  event_type: "access-strategy-used", target_scope: "phase", target_plan_id: "004", target_phase_id: "p004-r1",
  consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a", compensation_terms_code: "unpaid",
  compensation_terms_sha256: p004TermsSha, reason_code: "none", access_strategy_code: "screen-reader",
  actor_code: "HUMAN-MODERATOR", prior_event_id: p004AccessKeyboardEvent.event_id,
})
const p004ScheduledEvent = rowFor("attritionConsent", {
  event_id: `EVT-${sha256("p004-scheduled").slice(0, 32)}`, recruitment_key: p004RecruitmentKey,
  program_person_key: p004ProgramPersonKey, study_id: p004Consent.study_id, event_at_utc: "2026-01-01T00:06:00Z",
  event_type: "scheduled", target_scope: "phase", target_plan_id: "004", target_phase_id: "p004-r1",
  consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a", compensation_terms_code: "unpaid",
  compensation_terms_sha256: p004TermsSha, reason_code: "none", access_strategy_code: "n/a",
  actor_code: "HUMAN-MODERATOR", prior_event_id: p004AccessScreenReaderEvent.event_id,
})
const p004StartedEvent = rowFor("attritionConsent", {
  event_id: `EVT-${sha256("p004-started").slice(0, 32)}`, recruitment_key: p004RecruitmentKey,
  program_person_key: p004ProgramPersonKey, study_id: p004Consent.study_id, event_at_utc: "2026-01-01T01:59:00Z",
  event_type: "session-started", target_scope: "phase", target_plan_id: "004", target_phase_id: "p004-r1",
  consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a", compensation_terms_code: "unpaid",
  compensation_terms_sha256: p004TermsSha, reason_code: "none", access_strategy_code: "n/a",
  actor_code: "HUMAN-MODERATOR", prior_event_id: p004ScheduledEvent.event_id,
})
const p004CompletedEvent = rowFor("attritionConsent", {
  event_id: `EVT-${sha256("p004-completed").slice(0, 32)}`, recruitment_key: p004RecruitmentKey,
  program_person_key: p004ProgramPersonKey, study_id: p004Consent.study_id, event_at_utc: "2026-01-01T05:00:00Z",
  event_type: "session-completed", target_scope: "phase", target_plan_id: "004", target_phase_id: "p004-r1",
  consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a", compensation_terms_code: "unpaid",
  compensation_terms_sha256: p004TermsSha, reason_code: "none", access_strategy_code: "n/a",
  actor_code: "HUMAN-MODERATOR", prior_event_id: p004StartedEvent.event_id,
})
const parsedP004ConsentRows = parseRows("attritionConsent", [p004ScreenedEvent, p004ContactEvent, p004ActivationEvent, p004Consent, p004RecordingNotUsedEvent, p004AccessKeyboardEvent, p004AccessScreenReaderEvent, p004ScheduledEvent, p004StartedEvent, p004CompletedEvent])
assertZeroBudgetLedgerPolicy(parsedP004ConsentRows)
const p004Participant = rowFor("plan004Participants", {
  plan_id: "004", phase: "p004-r1", study_id: p004Consent.study_id,
  program_person_key: p004Consent.program_person_key, session_id: "P004-SESSION-01",
  research_consent_event_id: p004Consent.event_id, consent_version: "CONSENT-V1",
  consent_status: "consented", consent_at_utc: p004Consent.event_at_utc,
  recording_consent: "not-requested", assigned_direction_id: p004Primary.assigned_direction_id,
  allocation_schema_version: contract.schemas.plan004Allocation.id,
  allocation_schedule_version: p004Primary.schedule_version,
  allocation_schedule_file_sha256: p004AllocationFileSha,
  allocation_slot: p004Primary.allocation_slot,
  feedback_order: p004Primary.feedback_order, offline_order: p004Primary.offline_order,
  import_reset_order: p004Primary.import_reset_order,
  usual_access_strategy_codes: "keyboard-only+screen-reader", phase_status: "completed",
  exclusion_status: "included", exclusion_reason: "none", withdrawal_scope: "n/a",
  deletion_status: "not-requested",
})
const p004PrototypeManifestFileSha = hashToken("complete-p004-v1-prototype-manifest-file")
const p004ArtifactSetVersion = "P004-R1-ARTIFACTS-V1"
const p004ExposureDrafts = []
for (const [index, task] of contract.plan004.taskStateVariantMap.entries()) {
  const base = {
    phase: "p004-r1", artifact_set_version: p004ArtifactSetVersion,
    prototype_manifest_version: "P004-PROTOTYPES-V1",
    prototype_manifest_sha256: p004PrototypeManifestFileSha,
    prototype_id: task.prototypeId, prototype_version: "PROTOTYPE-V1",
    prototype_sha256: hashToken(`source-prototype:${task.prototypeId}`), task_id: task.taskId,
    state_id: task.stateId, copy_variant_id: task.variantFamily,
    normalization: "strict-utf8-nfc-lf-one-final-lf",
  }
  p004ExposureDrafts.push(rowFor("plan004ExposureManifest", {
    ...base, artifact_set_sha256: hashToken("placeholder"), artifact_id: `P004-CANDIDATE-${String(index + 1).padStart(2, "0")}`,
    condition_id: "candidate", exposure_direction_id: p004Primary.assigned_direction_id,
    artifact_sha256: hashToken(`p004-candidate-artifact:${task.taskId}`),
  }))
  if (contract.plan004.comparisonTasks.includes(task.taskId)) {
    p004ExposureDrafts.push(rowFor("plan004ExposureManifest", {
      ...base, artifact_set_sha256: hashToken("placeholder"), artifact_id: `P004-CURRENT-${task.taskId.toUpperCase()}`,
      condition_id: "current-control", exposure_direction_id: "current", copy_variant_id: "current",
      artifact_sha256: hashToken(`p004-current-artifact:${task.taskId}`),
    }))
  }
}
const p004ArtifactSetSha = sha256([...p004ExposureDrafts].sort((left, right) => left.artifact_id.localeCompare(right.artifact_id, "en")).map((row) => `${row.artifact_sha256}  ${row.artifact_id}\n`).join(""))
const p004ExposureRows = p004ExposureDrafts.map((row) => ({ ...row, artifact_set_sha256: p004ArtifactSetSha }))
const p004ExposureByKey = new Map(p004ExposureRows.map((row) => [`${row.task_id}:${row.condition_id}`, row]))
const p004TaskObservationRows = []
const timestampForMinute = (minute) => `2026-01-01T${String(Math.floor(minute / 60) + 2).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}:00Z`
for (const [taskIndex, task] of contract.plan004.taskStateVariantMap.entries()) {
  const comparison = contract.plan004.comparisonTasks.includes(task.taskId)
  const orderField = task.taskId === "feedback-evidence" ? "feedback_order" : task.taskId === "offline-failure" ? "offline_order" : task.taskId === "import-reset" ? "import_reset_order" : undefined
  const order = orderField ? p004Participant[orderField] : "candidate-only"
  const conditions = comparison && order === "current-first" ? ["current-control", "candidate"] : comparison ? ["candidate", "current-control"] : ["candidate"]
  for (const [position, condition] of conditions.entries()) {
    const exposure = p004ExposureByKey.get(`${task.taskId}:${condition}`)
    const excludedLateControl = task.taskId === "import-reset" && condition === "current-control"
    const startedMinute = taskIndex * 10 + position * 3
    p004TaskObservationRows.push(rowFor("plan004TaskObservations", {
      phase: "p004-r1", study_id: p004Participant.study_id, session_id: p004Participant.session_id,
      task_observation_id: `P004-OBS-${String(taskIndex + 1).padStart(2, "0")}-${condition === "candidate" ? "C" : "K"}`,
      comparison_pair_id: comparison ? `P004-PAIR-${task.taskId.toUpperCase()}` : "n/a",
      assigned_direction_id: p004Participant.assigned_direction_id,
      exposure_direction_id: exposure.exposure_direction_id, task_id: task.taskId,
      state_id: task.stateId, condition_id: condition, exposure_position: String(position + 1),
      current_candidate_order: order, artifact_id: exposure.artifact_id,
      artifact_sha256: exposure.artifact_sha256,
      prototype_manifest_version: exposure.prototype_manifest_version,
      prototype_manifest_sha256: exposure.prototype_manifest_sha256,
      prototype_id: exposure.prototype_id, prototype_version: exposure.prototype_version,
      prototype_sha256: exposure.prototype_sha256, copy_variant_id: exposure.copy_variant_id,
      access_strategy_codes: "keyboard-only+screen-reader",
      exposure_started_at_utc: timestampForMinute(startedMinute), score_locked_at_utc: timestampForMinute(startedMinute + 1),
      scoring_status: excludedLateControl ? "excluded" : "valid",
      exclusion_reason: excludedLateControl ? "technical-failure" : "n/a",
      task_completed: excludedLateControl ? "false" : "true", first_action_code: "ACTION-CORRECT",
      time_to_first_action_ms: "1000", wrong_turn_code: "none", clarification_count: "0",
      teachback_outcome: "accurate",
      unofficial_status_outcome: task.taskId === "proposition-recall" ? "accurate" : "n/a",
      advanced_evidence_outcome: task.taskId === "advanced-evidence" ? "accurate" : "n/a",
      consequence_outcome: ["practice-commitment", "offline-failure", "import-reset"].includes(task.taskId) ? "accurate" : "n/a",
      security_interruption: "false", notes_code: "n/a",
    }))
  }
}
const parsedP004ParticipantRows = parseRows("plan004Participants", [p004Participant])
const parsedP004ExposureRows = parseRows("plan004ExposureManifest", p004ExposureRows)
const parsedP004TaskRows = parseRows("plan004TaskObservations", p004TaskObservationRows)
const p004IssueSource = parsedP004TaskRows.find((row) => row.task_id === "proposition-recall")
const p004IssueRows = parseRows("plan004Issues", [rowFor("plan004Issues", {
  phase: p004IssueSource.phase, issue_occurrence_id: "P004-ISSUE-01", issue_family_id: "P004-FAMILY-01",
  study_id: p004IssueSource.study_id, task_observation_id: p004IssueSource.task_observation_id,
  comparison_pair_id: p004IssueSource.comparison_pair_id, task_id: p004IssueSource.task_id,
  condition_id: p004IssueSource.condition_id, assigned_direction_id: p004IssueSource.assigned_direction_id,
  artifact_id: p004IssueSource.artifact_id, observed_at_utc: "2026-01-01T04:00:00Z",
  severity: "low", taxonomy_code: "COPY-HESITATION", occurrence: "FIXTURE-OCCURRENCE",
  moderator_code: "HUMAN-MODERATOR", second_reviewer_code: "n/a", review_state: "confirmed",
  retest_of_issue_family_id: "n/a", retest_outcome: "not-a-retest", disposition: "open", adjudication_code: "n/a",
})])
const p004Datasets = {
  attritionConsent: parsedP004ConsentRows,
  plan004Allocation: parsedAllocation,
  plan004Participants: parsedP004ParticipantRows,
  plan004ExposureManifest: parsedP004ExposureRows,
  plan004TaskObservations: parsedP004TaskRows,
  plan004Issues: p004IssueRows,
}
validateForeignKeys(p004Datasets)
const validateP004Semantics = (datasets) => {
  const participant = datasets.plan004Participants[0]
  const consent = datasets.attritionConsent.find((row) => row.event_id === participant.research_consent_event_id)
  if (!consent || consent.event_type !== "research-consent-affirmed" || consent.program_person_key !== participant.program_person_key || consent.study_id !== participant.study_id) fail("Plan 004 same-person consent mismatch")
  const rows = datasets.plan004TaskObservations
  if (rows.filter((row) => row.condition_id === "candidate" && row.scoring_status === "valid").length !== 9 || rows.filter((row) => row.condition_id === "current-control").length !== 3) fail("Plan 004 9+3 completeness failed")
  for (const taskId of contract.plan004.comparisonTasks) {
    const pair = rows.filter((row) => row.task_id === taskId).sort((left, right) => Number(left.exposure_position) - Number(right.exposure_position))
    const orderField = taskId === "feedback-evidence" ? "feedback_order" : taskId === "offline-failure" ? "offline_order" : "import_reset_order"
    const expectedConditions = participant[orderField] === "current-first" ? ["current-control", "candidate"] : ["candidate", "current-control"]
    if (pair.length !== 2 || pair.some((row, index) => row.condition_id !== expectedConditions[index]) || pair[0].score_locked_at_utc >= pair[1].exposure_started_at_utc) fail("Plan 004 randomized order/independent score lock failed")
    const candidate = pair.find((row) => row.condition_id === "candidate")
    const control = pair.find((row) => row.condition_id === "current-control")
    if (control.scoring_status === "excluded" && control.exposure_started_at_utc < candidate.score_locked_at_utc && candidate.scoring_status === "valid") fail("Plan 004 upstream control contamination preserved candidate")
  }
}
validateP004Semantics(p004Datasets)
tsvSemanticFixtureCount += 1
expectSemanticFailure(() => validateForeignKeys({ ...p004Datasets, plan004Participants: [{ ...parsedP004ParticipantRows[0], assigned_direction_id: parsedP004ParticipantRows[0].assigned_direction_id === "CL-D1" ? "CL-D2" : "CL-D1" }] }), "broken example foreign key")
expectSemanticFailure(() => validateForeignKeys({ ...p004Datasets, plan004TaskObservations: parsedP004TaskRows.map((row, index) => index === 0 ? { ...row, state_id: "WRONG-STATE" } : row) }), "broken example foreign key")
expectSemanticFailure(() => validateForeignKeys({ ...p004Datasets, plan004TaskObservations: parsedP004TaskRows.map((row, index) => index === 0 ? { ...row, artifact_sha256: hashToken("wrong-artifact") } : row) }), "broken example foreign key")
const upstreamControlMutation = parsedP004TaskRows.map((row) => row.task_id === "feedback-evidence" && row.condition_id === "current-control" ? { ...row, scoring_status: "excluded", exclusion_reason: "technical-failure" } : row)
expectSemanticFailure(() => validateP004Semantics({ ...p004Datasets, plan004TaskObservations: upstreamControlMutation }), "upstream control contamination")

const scoringRows = contract.plan004.taskStateVariantMap.map((task, index) => ({ taskId: task.taskId, condition: "candidate", valid: true, exposure: index * 100 + 10, lock: index * 100 + 20 }))
for (const [index, taskId] of contract.plan004.comparisonTasks.entries()) {
  const candidate = scoringRows.find((row) => row.taskId === taskId)
  const currentFirst = patterns[0][index] === "0"
  if (currentFirst) {
    candidate.exposure += 30
    candidate.lock += 30
    scoringRows.push({ taskId, condition: "current-control", valid: index !== 2, exposure: candidate.exposure - 30, lock: candidate.exposure - 20 })
  } else {
    scoringRows.push({ taskId, condition: "current-control", valid: index !== 2, exposure: candidate.exposure + 30, lock: candidate.exposure + 40 })
  }
}
if (scoringRows.filter((row) => row.condition === "candidate" && row.valid).length !== 9 || scoringRows.filter((row) => row.condition === "current-control").length !== 3 || scoringRows.filter((row) => row.condition === "current-control" && row.valid).length !== 2) fail("Plan 004 candidate/control denominator separation failed")
for (const taskId of contract.plan004.comparisonTasks) {
  const pair = scoringRows.filter((row) => row.taskId === taskId).sort((a, b) => a.exposure - b.exposure)
  if (pair.length !== 2 || pair[0].lock >= pair[1].exposure) fail(`Plan 004 independent score chronology failed for ${taskId}`)
}

for (const n of contract.plan004.formalEffectiveSampleSizes) {
  const allocationPatterns = contract.plan004.allocationPatterns[String(n)]
  if (allocationPatterns.length !== n || new Set(allocationPatterns).size !== n || allocationPatterns.some((pattern) => !/^[01]{3}$/.test(pattern))) fail(`Plan 004 patterns invalid for n=${n}`)
  for (let taskIndex = 0; taskIndex < 3; taskIndex += 1) if (allocationPatterns.filter((pattern) => pattern[taskIndex] === "0").length !== n / 2) fail(`Plan 004 order imbalance n=${n}`)
  for (const round of ["R1", "R2"]) {
    const directionFor = (pattern) => {
      const r1 = [...pattern].filter((bit) => bit === "1").length % 2 === 0 ? "CL-D1" : "CL-D2"
      return round === "R1" ? r1 : r1 === "CL-D1" ? "CL-D2" : "CL-D1"
    }
    for (const direction of contract.plan004.formalDirections) if (allocationPatterns.filter((pattern) => directionFor(pattern) === direction).length !== n / 2) fail(`Plan 004 direction imbalance n=${n} ${round}`)
  }
}
if (contract.plan004.taskStateVariantMap.length !== 9 || contract.plan004.candidateRowsPerCandidateEligibleParticipant !== 9 || contract.plan004.attemptedControlRowsPerCandidateEligibleParticipant !== 3 || contract.plan004.rejectedDirection !== "CL-D3") fail("Plan 004 task/direction contract drift")

// Critical-family resolution must be same candidate, unchanged hierarchy, and
// explicit independently reviewed passing lineage.
const hierarchy = hashToken("candidate-a-hierarchy")
const criticalRows = [
  { family: "CRIT-1", candidate: "candidate-a", hierarchy, severity: "critical", review: "confirmed", retestOf: "n/a", outcome: "not-a-retest", disposition: "open" },
  { family: "CRIT-2", candidate: "candidate-a", hierarchy, severity: "critical", review: "confirmed", retestOf: "CRIT-1", outcome: "passed", disposition: "resolved" },
]
const unresolvedCriticals = (rows) => rows.filter((row) => row.severity === "critical" && row.retestOf === "n/a" && !rows.some((later) => later.retestOf === row.family && later.candidate === row.candidate && later.hierarchy === row.hierarchy && later.review !== "pending-second-review" && later.outcome === "passed" && later.disposition === "resolved"))
if (unresolvedCriticals(criticalRows).length !== 0) fail("valid critical retest lineage did not resolve")
if (unresolvedCriticals([criticalRows[0], { ...criticalRows[1], hierarchy: hashToken("changed") }]).length !== 1) fail("changed-hierarchy critical mutation was accepted")
mutationCheckCount += 1

// Shared attrition is exercised with canonical ledger rows and a derived
// cutoff projection. Contact/recording withdrawal is nonexcluding, a broader
// program withdrawal is terminal, and timely versus late deletion is explicit.
const eventToken = (label) => `EVT-${sha256(`event:${label}`).slice(0, 32)}`
const recruitmentToken = (label) => `RK-${sha256(`recruitment:${label}`).slice(0, 32)}`
const personToken = (label) => `PPK-${sha256(`person:${label}`).slice(0, 32)}`
const ledgerRows = []
const buildLedgerChain = ({ label, studyId, planId = "004", phaseId = "p004-r1", behavior }) => {
  const recruitmentKey = recruitmentToken(label)
  const programPersonKey = personToken(label)
  let prior = "n/a"
  let sequence = 0
  const append = ({ at, type, scope, plan = "n/a", phase = "n/a", preActivation = false, reason = "none", cutoff = "n/a" }) => {
    sequence += 1
    const eventId = eventToken(`${label}:${sequence}:${type}`)
    const consentEvent = type.includes("consent-") && !["recording-consent-revoked", "contact-consent-revoked", "research-consent-revoked"].includes(type)
    ledgerRows.push(rowFor("attritionConsent", {
      event_id: eventId,
      recruitment_key: recruitmentKey,
      program_person_key: preActivation ? "n/a" : programPersonKey,
      study_id: preActivation ? "n/a" : studyId,
      event_at_utc: at,
      event_type: type,
      target_scope: scope,
      target_plan_id: plan,
      target_phase_id: phase,
      consent_document_sha256: consentEvent ? hashToken(`consent-document:${label}:${type}`) : "n/a",
      withdrawal_cutoff_at_utc: type === "research-consent-affirmed" ? cutoff : "n/a",
      compensation_terms_code: preActivation ? "n/a" : "unpaid",
      compensation_terms_sha256: preActivation ? "n/a" : compensationTermsSha(phaseId),
      reason_code: reason,
      access_strategy_code: "n/a",
      actor_code: type === "participant-withdrew" || type.endsWith("-revoked") || type === "deletion-requested" ? "HUMAN-PARTICIPANT-REQUEST" : "HUMAN-MODERATOR",
      prior_event_id: prior,
    }))
    prior = eventId
    return eventId
  }
  append({ at: "2026-01-01T00:00:00Z", type: "screened-eligible", scope: "n/a", preActivation: true })
  append({ at: "2026-01-01T00:01:00Z", type: "contact-consent-affirmed", scope: "contact", preActivation: true })
  append({ at: "2026-01-01T00:02:00Z", type: "study-id-activated", scope: "phase", plan: planId, phase: phaseId })
  const consentId = append({ at: "2026-01-01T00:03:00Z", type: "research-consent-affirmed", scope: "phase", plan: planId, phase: phaseId, cutoff: "2026-01-10T00:00:00Z" })
  append({ at: "2026-01-01T00:04:00Z", type: "recording-not-used", scope: "recording" })
  append({ at: "2026-01-01T00:05:00Z", type: "scheduled", scope: "phase", plan: planId, phase: phaseId })
  append({ at: "2026-01-01T00:06:00Z", type: "session-started", scope: "phase", plan: planId, phase: phaseId })
  append({ at: "2026-01-01T01:00:00Z", type: "session-completed", scope: "phase", plan: planId, phase: phaseId })
  behavior({ append })
  return { recruitmentKey, programPersonKey, studyId, consentId, planId, phaseId }
}
const eligibleChain = buildLedgerChain({ label: "eligible", studyId: "R1-P01", behavior: ({ append }) => {
  append({ at: "2026-01-01T01:01:00Z", type: "contact-consent-revoked", scope: "contact", reason: "participant-request" })
} })
const withdrawnChain = buildLedgerChain({ label: "withdrawn", studyId: "R1-P02", behavior: ({ append }) => {
  append({ at: "2026-01-02T00:00:00Z", type: "participant-withdrew", scope: "program", reason: "participant-request" })
  append({ at: "2026-01-03T00:00:00Z", type: "research-consent-affirmed", scope: "phase", plan: "004", phase: "p004-r1", cutoff: "2026-01-10T00:00:00Z" })
} })
const timelyDeletionChain = buildLedgerChain({ label: "timely-delete", studyId: "R1-P03", behavior: ({ append }) => {
  append({ at: "2026-01-05T00:00:00Z", type: "deletion-requested", scope: "phase", plan: "004", phase: "p004-r1", reason: "participant-request" })
} })
const lateDeletionChain = buildLedgerChain({ label: "late-delete", studyId: "R1-P04", behavior: ({ append }) => {
  append({ at: "2026-01-11T00:00:00Z", type: "deletion-requested", scope: "phase", plan: "004", phase: "p004-r1", reason: "participant-request" })
  append({ at: "2026-01-11T01:00:00Z", type: "aggregate-no-longer-separable", scope: "phase", plan: "004", phase: "p004-r1" })
} })
const plan005ProjectionChain = buildLedgerChain({ label: "plan005-projection", studyId: "OS-P09", planId: "005", phaseId: "p005-open-sort", behavior: () => {} })
const parsedLedgerRows = parseRows("attritionConsent", ledgerRows)
assertZeroBudgetLedgerPolicy(parsedLedgerRows)

const projectionStudies = [eligibleChain, withdrawnChain, timelyDeletionChain, lateDeletionChain, plan005ProjectionChain]
const projectionRows = deriveAttritionProjection(parsedLedgerRows, projectionStudies, "2026-01-12T00:00:00Z")
const parsedProjectionRows = parseRows("attritionProjection", projectionRows)
const projectionByStudy = new Map(parsedProjectionRows.map((row) => [row.study_id, row]))
if (projectionByStudy.get("R1-P01").eligibility_state !== "eligible" || projectionByStudy.get("R1-P01").contact_state !== "revoked" || projectionByStudy.get("R1-P01").recording_state !== "not-requested") fail("contact/no-recording attrition projection failed")
if (projectionByStudy.get("R1-P02").eligibility_reason_code !== "participant-withdrew") fail("broader terminal withdrawal was revived")
if (projectionByStudy.get("R1-P03").eligibility_reason_code !== "deletion-pending" || projectionByStudy.get("R1-P03").deletion_request_timeliness !== "timely") fail("timely deletion projection failed")
if (projectionByStudy.get("R1-P04").eligibility_state !== "eligible" || projectionByStudy.get("R1-P04").deletion_request_timeliness !== "late-after-cutoff") fail("late deletion/irreversible projection failed")
if (projectionByStudy.get("OS-P09").eligibility_state !== "eligible" || projectionByStudy.get("OS-P09").plan_id !== "005" || projectionByStudy.get("OS-P09").phase_id !== "p005-open-sort") fail("Plan 005 attrition projection failed")
tsvSemanticFixtureCount += 1
expectSemanticFailure(() => deriveAttritionProjection(parsedLedgerRows.map((row) => row.recruitment_key === eligibleChain.recruitmentKey && row.event_type === "contact-consent-affirmed" ? { ...row, prior_event_id: "n/a" } : row), projectionStudies, "2026-01-12T00:00:00Z"), "event chain")
const prematureIrreversibleRows = parsedLedgerRows.map((row) => {
  if (row.recruitment_key !== lateDeletionChain.recruitmentKey) return row
  if (row.event_type === "deletion-requested") return { ...row, event_at_utc: "2026-01-08T00:00:00Z" }
  if (row.event_type === "aggregate-no-longer-separable") return { ...row, event_at_utc: "2026-01-09T00:00:00Z" }
  return row
})
expectSemanticFailure(() => deriveAttritionProjection(prematureIrreversibleRows, projectionStudies, "2026-01-12T00:00:00Z"), "predates participant withdrawal cutoff")
const crossRecruitmentActivation = rowFor("attritionConsent", {
  event_id: eventToken("cross-recruitment-activation"), recruitment_key: recruitmentToken("cross-recruitment"),
  program_person_key: eligibleChain.programPersonKey, study_id: "F1-P09", event_at_utc: "2026-01-01T23:00:00Z",
  event_type: "study-id-activated", target_scope: "phase", target_plan_id: "005", target_phase_id: "p005-first-click-r1",
  consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a", compensation_terms_code: "unpaid",
  compensation_terms_sha256: compensationTermsSha("p005-first-click-r1"), reason_code: "none", access_strategy_code: "n/a",
  actor_code: "HUMAN-MODERATOR", prior_event_id: "n/a",
})
const crossRecruitmentProgramWithdrawal = rowFor("attritionConsent", {
  event_id: eventToken("cross-recruitment-program-withdrawal"), recruitment_key: crossRecruitmentActivation.recruitment_key,
  program_person_key: eligibleChain.programPersonKey, study_id: "F1-P09", event_at_utc: "2026-01-02T00:00:00Z",
  event_type: "participant-withdrew", target_scope: "program", target_plan_id: "n/a", target_phase_id: "n/a",
  consent_document_sha256: "n/a", withdrawal_cutoff_at_utc: "n/a", compensation_terms_code: "unpaid",
  compensation_terms_sha256: compensationTermsSha("p005-first-click-r1"), reason_code: "participant-request", access_strategy_code: "n/a",
  actor_code: "HUMAN-PARTICIPANT-REQUEST", prior_event_id: crossRecruitmentActivation.event_id,
})
const crossRecruitmentRows = parseRows("attritionConsent", [...parsedLedgerRows, crossRecruitmentActivation, crossRecruitmentProgramWithdrawal])
assertZeroBudgetLedgerPolicy(crossRecruitmentRows)
const crossRecruitmentProjection = deriveAttritionProjection(crossRecruitmentRows, projectionStudies, "2026-01-12T00:00:00Z").find((row) => row.study_id === eligibleChain.studyId)
if (crossRecruitmentProjection.eligibility_reason_code !== "participant-withdrew" || crossRecruitmentProjection.applicable_program_event_id !== crossRecruitmentProgramWithdrawal.event_id) fail("cross-recruitment program withdrawal did not propagate by program_person_key")
mutationCheckCount += 1

expectSemanticFailure(() => assertZeroBudgetLedgerPolicy(parsedP004ConsentRows.filter((row) => row.event_type !== "recording-not-used")), "exactly one recording-not-used")
expectSemanticFailure(() => assertZeroBudgetLedgerPolicy(parsedP004ConsentRows.map((row) => row.event_type === "recording-not-used" ? { ...row, event_type: "recording-consent-affirmed" } : row)), "recording consent event is prohibited")
expectSemanticFailure(() => assertZeroBudgetLedgerPolicy(parsedP004ConsentRows.map((row) => row.event_type === "recording-not-used" ? { ...row, event_at_utc: "2026-01-01T02:30:00Z" } : row)), "precede exposure/start")
expectSemanticFailure(() => assertZeroBudgetLedgerPolicy([...parsedP004ConsentRows, { ...p004RecordingNotUsedEvent, event_id: `EVT-${sha256("duplicate-recording-not-used").slice(0, 32)}` }]), "exactly one recording-not-used")
expectSemanticFailure(() => assertZeroBudgetLedgerPolicy(parsedP004ConsentRows.map((row) => row.event_type === "recording-not-used" ? { ...row, compensation_terms_sha256: hashToken("wrong-recording-phase-terms") } : row)), "canonical unpaid phase row")
expectSemanticFailure(() => assertZeroBudgetLedgerPolicy(parsedP004ConsentRows.map((row) => row.event_type === "recording-not-used" ? { ...row, study_id: "R1-P09" } : row)), "exactly one recording-not-used")

const p004PhaseProjection = buildPhaseProjectionFixture({
  phaseId: "p004-r1", ledgerRows: parsedP004ConsentRows,
  studies: [{ recruitmentKey: p004RecruitmentKey, programPersonKey: p004ProgramPersonKey, studyId: p004Consent.study_id, consentId: p004Consent.event_id, planId: "004", phaseId: "p004-r1" }],
  cutoffAtUtc: "2026-01-12T00:00:00Z",
})
const assertPlan004ParticipantMatchesProjection = (participant, projection) => {
  if (!projection || participant.plan_id !== projection.plan_id || participant.phase !== projection.phase_id || participant.study_id !== projection.study_id || participant.program_person_key !== projection.program_person_key || participant.research_consent_event_id !== projection.research_consent_event_id) fail("Plan 004 participant/projection join mismatch")
  if (participant.consent_status !== projection.research_consent_state || participant.recording_consent !== projection.recording_state || participant.phase_status !== projection.phase_state || participant.deletion_status !== projection.deletion_state) fail("Plan 004 participant/projection exact state mismatch")
  if (projection.eligibility_state === "eligible") {
    if (participant.exclusion_status !== "included" || participant.exclusion_reason !== "none") fail("Plan 004 eligible inclusion projection mismatch")
  } else if (participant.exclusion_status !== "excluded") {
    fail("Plan 004 ineligible exclusion projection mismatch")
  }
  if (projection.eligibility_reason_code === "researcher-stopped" && (participant.phase_status !== "stopped" || participant.exclusion_status !== "excluded" || participant.exclusion_reason !== "researcher-stopped")) fail("Plan 004 researcher-stopped projection mismatch")
}
assertPlan004ParticipantMatchesProjection(p004Participant, p004PhaseProjection.rows.find((row) => row.study_id === p004Participant.study_id))
const p004ResearcherStoppedEvent = { ...p004CompletedEvent, event_type: "researcher-stopped", reason_code: "protocol-deviation" }
const parsedP004ResearcherStoppedLedger = parseRows("attritionConsent", parsedP004ConsentRows.map((row) => row.event_id === p004CompletedEvent.event_id ? p004ResearcherStoppedEvent : row))
const p004ResearcherStoppedProjection = buildPhaseProjectionFixture({
  phaseId: "p004-r1", ledgerRows: parsedP004ResearcherStoppedLedger,
  studies: [{ recruitmentKey: p004RecruitmentKey, programPersonKey: p004ProgramPersonKey, studyId: p004Consent.study_id, consentId: p004Consent.event_id, planId: "004", phaseId: "p004-r1" }],
  cutoffAtUtc: "2026-01-12T00:00:00Z",
})
const parsedP004ResearcherStoppedParticipant = parseRows("plan004Participants", [{ ...p004Participant, phase_status: "stopped", exclusion_status: "excluded", exclusion_reason: "researcher-stopped" }])[0]
validateForeignKeys({ attritionConsent: parsedP004ResearcherStoppedLedger, plan004Allocation: parsedAllocation, plan004Participants: [parsedP004ResearcherStoppedParticipant] })
const p004ResearcherStoppedProjectionRow = p004ResearcherStoppedProjection.rows.find((row) => row.study_id === parsedP004ResearcherStoppedParticipant.study_id)
if (p004ResearcherStoppedProjectionRow.phase_state !== "stopped" || p004ResearcherStoppedProjectionRow.eligibility_state !== "ineligible" || p004ResearcherStoppedProjectionRow.eligibility_reason_code !== "researcher-stopped" || p004ResearcherStoppedProjection.eligibleStudyIds.length !== 0) fail("Plan 004 researcher-stopped positive projection fixture failed")
assertPlan004ParticipantMatchesProjection(parsedP004ResearcherStoppedParticipant, p004ResearcherStoppedProjectionRow)
tsvSemanticFixtureCount += 1
expectSemanticFailure(() => assertPlan004ParticipantMatchesProjection({ ...parsedP004ResearcherStoppedParticipant, phase_status: "completed" }, p004ResearcherStoppedProjectionRow), "exact state mismatch")
expectSemanticFailure(() => assertPlan004ParticipantMatchesProjection({ ...parsedP004ResearcherStoppedParticipant, exclusion_status: "included" }, p004ResearcherStoppedProjectionRow), "ineligible exclusion projection mismatch")
expectSemanticFailure(() => assertPlan004ParticipantMatchesProjection({ ...parsedP004ResearcherStoppedParticipant, exclusion_reason: "ineligible" }, p004ResearcherStoppedProjectionRow), "researcher-stopped projection mismatch")
const formalPhaseProjectionById = new Map(formalPhaseConfigs.map(({ phase, aggregateCutoffAtUtc }) => [phase, buildPhaseProjectionFixture({
  phaseId: phase, ledgerRows: parsedP005FormalConsents,
  studies: p005FormalStudyConfigs.filter((study) => study.phaseId === phase),
  cutoffAtUtc: aggregateCutoffAtUtc,
})]))
if (!canonicalJsonEqual(p004PhaseProjection.eligibleStudyIds, [p004Participant.study_id]) || !canonicalJsonEqual(openSortPhaseProjection.eligibleStudyIds, [openSession.study_id]) || !canonicalJsonEqual(thresholdPhaseProjection.eligibleStudyIds, thresholdSessions.map((row) => row.study_id).sort()) || [...formalPhaseProjectionById.values()].some((projection) => projection.eligibleStudyIds.length === 0)) fail("phase projection eligibility fixture failed")

const assertFormalEvidenceMatchesProjection = (evidenceRows) => {
  for (const row of evidenceRows) {
    const projection = formalPhaseProjectionById.get(row.phase)
    const expectedDisposition = projection?.eligibleStudyIds.includes(row.study_id) ? "included" : "excluded"
    if (row.analysis_disposition !== expectedDisposition) fail("formal evidence disposition does not match attrition projection")
  }
}
assertFormalEvidenceMatchesProjection(parsedP005FormalEvidence)
expectSemanticFailure(() => assertFormalEvidenceMatchesProjection(parsedP005FormalEvidence.map((row, index) => index === 0 ? { ...row, analysis_disposition: "excluded", exclusion_code: "ineligible" } : row)), "does not match attrition projection")

const p004ExposureManifestFileSha = sha256(serializeTsv(contract.schemas.plan004ExposureManifest, parsedP004ExposureRows))
const p004ProtocolSha = hashToken("p004-formal-protocol")
const p004InputManifestRows = parseRows("phaseInputManifest", [
  rowFor("phaseInputManifest", { phase_id: "p004-r1", phase_version: "P004-R1-V1", input_manifest_id: "P004-R1-INPUT", source_file_id: "ALLOCATION", source_schema_id: contract.schemas.plan004Allocation.id, source_file_sha256: p004AllocationFileSha, source_row_count: String(parsedAllocation.length), protocol_sha256: p004ProtocolSha, artifact_or_card_set_sha256: p004ArtifactSetSha, schedule_file_sha256: p004AllocationFileSha, task_registry_file_sha256: "n/a", created_at_utc: "2025-12-31T20:00:00Z", created_by_code: "HUMAN-CONTENT-OWNER" }),
  rowFor("phaseInputManifest", { phase_id: "p004-r1", phase_version: "P004-R1-V1", input_manifest_id: "P004-R1-INPUT", source_file_id: "EXPOSURE-MANIFEST", source_schema_id: contract.schemas.plan004ExposureManifest.id, source_file_sha256: p004ExposureManifestFileSha, source_row_count: String(parsedP004ExposureRows.length), protocol_sha256: p004ProtocolSha, artifact_or_card_set_sha256: p004ArtifactSetSha, schedule_file_sha256: p004AllocationFileSha, task_registry_file_sha256: "n/a", created_at_utc: "2025-12-31T20:00:00Z", created_by_code: "HUMAN-CONTENT-OWNER" }),
])
const p004InputManifestSha = sha256(serializeTsv(contract.schemas.phaseInputManifest, p004InputManifestRows))

if (contract.plan005.allowedExposedCohortReusePairs.length !== 0 || new Set(contract.plan005.exposedPhases).size !== 8) fail("cohort-reuse contract drift")
const exposedPhasePeople = [
  ...parsedP004ParticipantRows.map((row) => ({ phase: row.phase, programPersonKey: row.program_person_key })),
  ...openDatasets.plan005OpenSortSessions.map((row) => ({ phase: "p005-open-sort", programPersonKey: row.program_person_key })),
  ...thresholdDatasets.plan005ThresholdSessions.map((row) => ({ phase: "p005-threshold-pilot", programPersonKey: row.program_person_key })),
  ...parsedP005FormalEvidence.map((row) => ({ phase: row.phase, programPersonKey: row.program_person_key })),
]
const validateNoExposedCohortReuse = (rows) => {
  for (const personKey of new Set(rows.map((row) => row.programPersonKey))) {
    const phases = [...new Set(rows.filter((row) => row.programPersonKey === personKey).map((row) => row.phase))]
    if (phases.length > 1) fail(`exposed cohort reuse detected for ${personKey}`)
  }
}
validateNoExposedCohortReuse(exposedPhasePeople)
expectSemanticFailure(() => validateNoExposedCohortReuse([...exposedPhasePeople, { phase: "p005-threshold-pilot", programPersonKey: openSession.program_person_key }]), "exposed cohort reuse detected")
const accessPeople = [
  ["PPK-1", "keyboard-only"], ["PPK-1", "screen-reader"], ["PPK-1", "keyboard-only"], ["PPK-2", "keyboard-only"],
]
if (new Set(accessPeople.map(([person]) => person)).size !== 2 || new Set(accessPeople.filter(([, strategy]) => strategy === "keyboard-only").map(([person]) => person)).size !== 2) fail("unique-person access derivation failed")

// Invariant-valid, recursively canonical JSON examples are derived from
// the coherent TSV fixtures above. These are test fixtures, never study data.
const validateSemanticJson = (schemaKey, value, semanticValidator) => {
  const parsed = parseCanonicalJson(contract.schemas[schemaKey], serializeCanonicalJson(value))
  semanticValidator(parsed)
  jsonSemanticExampleCount += 1
  return parsed
}
const fixtureEligibleSetSha = (ids) => sha256([...ids].sort().map((id) => `${id}\n`).join(""))
const p004ValidCandidateRows = parsedP004TaskRows.filter((row) => p004PhaseProjection.eligibleStudyIds.includes(row.study_id) && row.condition_id === "candidate" && row.scoring_status === "valid")
const p004ValidControlRows = parsedP004TaskRows.filter((row) => p004PhaseProjection.eligibleStudyIds.includes(row.study_id) && row.condition_id === "current-control" && row.scoring_status === "valid")
const p004EligibilityCounts = {
  screened: new Set(parsedP004ConsentRows.filter((row) => row.event_type === "screened-eligible").map((row) => row.recruitment_key)).size,
  scheduled: new Set(parsedP004ConsentRows.filter((row) => row.event_type === "scheduled").map((row) => row.study_id)).size,
  started: new Set(parsedP004ConsentRows.filter((row) => row.event_type === "session-started").map((row) => row.study_id)).size,
  completed: p004PhaseProjection.rows.filter((row) => row.phase_state === "completed").length,
  included: p004PhaseProjection.eligibleStudyIds.length,
  excluded: p004PhaseProjection.rows.filter((row) => row.exclusion_state === "excluded").length,
  withdrawn: p004PhaseProjection.rows.filter((row) => row.research_consent_state === "withdrawn").length,
}
const p004IssueAggregateRows = p004IssueRows.filter((row) => p004PhaseProjection.eligibleStudyIds.includes(row.study_id)).map((row) => ({
  directionId: row.assigned_direction_id, issueFamilyId: row.issue_family_id, severity: row.severity,
  openCount: row.disposition === "open" ? 1 : 0, resolvedCount: row.disposition === "resolved" ? 1 : 0,
})).sort((left, right) => left.directionId.localeCompare(right.directionId, "en") || left.issueFamilyId.localeCompare(right.issueFamilyId, "en"))
const p004AccessCoverageRows = [...new Set(parsedP004ConsentRows.filter((row) => row.event_type === "access-strategy-used" && p004PhaseProjection.eligibleProgramPersonKeys.includes(row.program_person_key)).map((row) => row.access_strategy_code))].sort().map((strategyCode) => ({
  strategyCode,
  uniquePersonCount: new Set(parsedP004ConsentRows.filter((row) => row.event_type === "access-strategy-used" && row.access_strategy_code === strategyCode && p004PhaseProjection.eligibleProgramPersonKeys.includes(row.program_person_key)).map((row) => row.program_person_key)).size,
}))
const p004ExcludedObservationRows = parsedP004TaskRows.filter((row) => p004PhaseProjection.eligibleStudyIds.includes(row.study_id) && row.scoring_status === "excluded")
const p004ExclusionRows = [...new Set(p004ExcludedObservationRows.map((row) => row.exclusion_reason))].sort().map((reasonCode) => ({ reasonCode, count: p004ExcludedObservationRows.filter((row) => row.exclusion_reason === reasonCode).length }))
const p004AggregateExample = {
  schemaVersion: contract.schemas.plan004Aggregate.id,
  protocolVersion: contract.protocolVersion,
  phase: "p004-r1",
  cutoffAtUtc: "2026-01-12T00:00:00Z",
  inputManifestSha256: p004InputManifestSha,
  attritionProjectionSha256: p004PhaseProjection.fileSha256,
  candidateEligibleStudyIds: p004PhaseProjection.eligibleStudyIds,
  candidateEligibleSetSha256: fixtureEligibleSetSha(p004PhaseProjection.eligibleStudyIds),
  controlEligibleObservationIds: p004ValidControlRows.map((row) => row.task_observation_id).sort(),
  eligibilityCounts: p004EligibilityCounts,
  candidateRows: p004ValidCandidateRows.map((row) => ({
    directionId: row.assigned_direction_id, taskId: row.task_id, candidateOrder: row.current_candidate_order,
    outcome: row.teachback_outcome, numerator: 1, denominator: 1,
  })).sort((left, right) => left.directionId.localeCompare(right.directionId, "en") || left.taskId.localeCompare(right.taskId, "en") || left.candidateOrder.localeCompare(right.candidateOrder, "en") || left.outcome.localeCompare(right.outcome, "en")),
  controlRows: p004ValidControlRows.map((row) => ({ taskId: row.task_id, currentOrder: row.current_candidate_order, outcome: row.teachback_outcome, numerator: 1, denominator: 1 }))
    .sort((left, right) => left.taskId.localeCompare(right.taskId, "en") || left.currentOrder.localeCompare(right.currentOrder, "en") || left.outcome.localeCompare(right.outcome, "en")),
  pairedRows: p004ValidControlRows.map((control) => {
    const candidate = p004ValidCandidateRows.find((row) => row.comparison_pair_id === control.comparison_pair_id)
    return { directionId: candidate.assigned_direction_id, taskId: candidate.task_id, currentCandidateOrder: candidate.current_candidate_order, candidateOutcome: candidate.teachback_outcome, currentOutcome: control.teachback_outcome, count: 1 }
  }).sort((left, right) => left.directionId.localeCompare(right.directionId, "en") || left.taskId.localeCompare(right.taskId, "en") || left.currentCandidateOrder.localeCompare(right.currentCandidateOrder, "en") || left.candidateOutcome.localeCompare(right.candidateOutcome, "en") || left.currentOutcome.localeCompare(right.currentOutcome, "en")),
  issueRows: p004IssueAggregateRows,
  accessCoverageRows: p004AccessCoverageRows,
  exclusionRows: p004ExclusionRows,
}
const validateP004Aggregate = (value) => {
  if (value.inputManifestSha256 !== p004InputManifestSha || value.attritionProjectionSha256 !== p004PhaseProjection.fileSha256) fail("Plan 004 aggregate input/attrition hash mismatch")
  for (const field of ["candidateEligibleStudyIds", "controlEligibleObservationIds", "eligibilityCounts", "candidateRows", "controlRows", "pairedRows", "issueRows", "accessCoverageRows", "exclusionRows"]) if (!canonicalJsonEqual(value[field], p004AggregateExample[field])) fail(`Plan 004 aggregate raw derivation mismatch: ${field}`)
  if (value.candidateEligibleStudyIds.length !== 1 || value.candidateEligibleSetSha256 !== fixtureEligibleSetSha(value.candidateEligibleStudyIds) || value.candidateRows.length !== 9 || value.controlRows.length !== 2 || value.pairedRows.length !== 2) fail("Plan 004 aggregate derivation fixture failed")
  if (value.candidateRows.some((row) => row.numerator > row.denominator) || value.controlRows.some((row) => row.numerator > row.denominator)) fail("Plan 004 aggregate rational bounds failed")
}
const parsedP004Aggregate = validateSemanticJson("plan004Aggregate", p004AggregateExample, validateP004Aggregate)

const openSortPairJsonRows = openPairRows.map(([cardIdA, cardIdB, sameGroupNumerator, eligibleSessionDenominator]) => ({ cardIdA, cardIdB, sameGroupNumerator, eligibleSessionDenominator }))
  .sort((left, right) => left.cardIdA.localeCompare(right.cardIdA, "en") || left.cardIdB.localeCompare(right.cardIdB, "en"))
const openSortAggregateExample = {
  schemaVersion: contract.schemas.plan005OpenSortAggregate.id,
  protocolVersion: contract.protocolVersion,
  phaseVersion: "P005-OPEN-SORT-V1",
  cutoffAtUtc: "2026-01-12T00:00:00Z",
  inputManifestSha256: openSortInputManifestSha,
  attritionProjectionSha256: openSortPhaseProjection.fileSha256,
  eligibleStudyIds: openSortPhaseProjection.eligibleStudyIds,
  eligibleSetSha256: fixtureEligibleSetSha(openSortPhaseProjection.eligibleStudyIds),
  eligibleSessionCount: openSortPhaseProjection.eligibleStudyIds.length,
  pairRows: openSortPairJsonRows,
  labelRows: openGroups.map((row) => ({ labelNormalized: row.label_normalized, count: 1 })).sort((left, right) => left.labelNormalized.localeCompare(right.labelNormalized, "en")),
  codeRows: [{ codeId: "arrival-orientation", count: 1 }],
  expectationRows: [{ expectationId: openExpectation.expectation_id, responseKind: openExpectation.response_kind, responseRef: openExpectation.response_ref, count: 1 }],
  exclusionRows: [],
}
const validateOpenSortAggregate = (value) => {
  if (value.inputManifestSha256 !== openSortInputManifestSha || value.attritionProjectionSha256 !== openSortPhaseProjection.fileSha256) fail("open-sort aggregate input/attrition hash mismatch")
  for (const field of ["eligibleStudyIds", "eligibleSessionCount", "pairRows", "labelRows", "codeRows", "expectationRows", "exclusionRows"]) if (!canonicalJsonEqual(value[field], openSortAggregateExample[field])) fail(`open-sort aggregate raw derivation mismatch: ${field}`)
  if (value.eligibleSetSha256 !== fixtureEligibleSetSha(value.eligibleStudyIds)) fail("open-sort eligible-set digest mismatch")
  const expectedPairs = []
  for (let left = 0; left < contract.plan005.openSortCardIds.length; left += 1) for (let right = left + 1; right < contract.plan005.openSortCardIds.length; right += 1) expectedPairs.push(`${contract.plan005.openSortCardIds[left]}:${contract.plan005.openSortCardIds[right]}`)
  if (value.pairRows.length !== 276 || JSON.stringify(value.pairRows.map((row) => `${row.cardIdA}:${row.cardIdB}`)) !== JSON.stringify(expectedPairs) || value.pairRows.some((row) => row.eligibleSessionDenominator !== value.eligibleSessionCount || row.sameGroupNumerator > row.eligibleSessionDenominator)) fail("open-sort aggregate 276-pair semantics failed")
}
const parsedOpenSortAggregate = validateSemanticJson("plan005OpenSortAggregate", openSortAggregateExample, validateOpenSortAggregate)

const candidateDecisionRows = candidates.flatMap((candidateId) => Array.from({ length: 21 }, (_, index) => ({
  decisionId: `${candidateId}-DECISION-${String(index + 1).padStart(2, "0")}`,
  candidateId,
  familyNumber: index + 1,
  routeIds: [`ROUTE-${String(index + 1).padStart(2, "0")}`],
  viewId: `${candidateId}-VIEW-${String(index + 1).padStart(2, "0")}`,
  parentViewId: index === 0 ? `${candidateId}-ROOT` : `${candidateId}-VIEW-${String(index).padStart(2, "0")}`,
  navigationTier: index < 5 ? "primary" : "secondary",
  tierOrder: index + 1,
  taskPriority: priorities[index % priorities.length],
  evidenceReferenceIds: [`EVIDENCE-${String(index + 1).padStart(2, "0")}`],
  rationaleCode: "FIXTURE-RATIONALE",
})))
const decisionRowsForCandidate = (candidateId, rows) => rows.filter((row) => row.candidateId === candidateId).sort((left, right) => left.familyNumber - right.familyNumber || left.decisionId.localeCompare(right.decisionId, "en"))
const candidateDecisionRowSetSha = (candidateId, rows) => sha256(serializeCanonicalJson({
  schemaVersion: "navigation-candidate-decision-row-set-v1",
  protocolVersion: contract.protocolVersion,
  candidateId,
  decisionRows: decisionRowsForCandidate(candidateId, rows),
}))
const openSortAggregateExternalSha = sha256(serializeCanonicalJson(parsedOpenSortAggregate))
const candidateFormationExample = {
  schemaVersion: contract.schemas.plan005CandidateFormation.id,
  protocolVersion: contract.protocolVersion,
  phaseInputManifestSha256: openSortInputManifestSha,
  openSortAggregateFileSha256: openSortAggregateExternalSha,
  eligibleSetSha256: parsedOpenSortAggregate.eligibleSetSha256,
  routeTaskInventorySha256: hashToken("route-task-inventory"),
  candidateBuilderVersion: "CANDIDATE-BUILDER-V1",
  candidateBuilderSha256: hashToken("candidate-builder"),
  candidateTemplateSetSha256: hashToken("candidate-template-set"),
  provisionalLabelSetSha256: hashToken("provisional-label-set"),
  codebookSha256: hashToken("open-sort-codebook"),
  candidates: candidates.map((candidateId) => ({ candidateId, decisionRowSetSha256: candidateDecisionRowSetSha(candidateId, candidateDecisionRows), normalizedHierarchySha256: hashToken(`normalized-hierarchy:${candidateId}`), artifactVersionSha256: hashToken(`candidate-artifact:${candidateId}`) })),
  decisionRows: candidateDecisionRows,
  materialDifferenceRows: [{ familyNumber: 1, candidateAParentViewId: "candidate-a-ROOT", candidateBParentViewId: "candidate-b-ROOT", differenceCode: "different-root-grouping", evidenceReferenceIds: ["EVIDENCE-01"] }],
  authorCode: "HUMAN-CANDIDATE-AUTHOR",
  secondReviewerCode: "HUMAN-CANDIDATE-REVIEWER",
  formedAtUtc: "2026-01-02T00:00:00Z",
  limitations: ["FIXTURE-ONLY"],
}
const validateCandidateFormation = (value) => {
  if (value.phaseInputManifestSha256 !== openSortInputManifestSha || value.openSortAggregateFileSha256 !== openSortAggregateExternalSha) fail("candidate formation open-sort aggregate hash/input hash mismatch")
  if (JSON.stringify(value.candidates.map((row) => row.candidateId)) !== JSON.stringify(candidates) || value.authorCode === value.secondReviewerCode || value.candidates[0].normalizedHierarchySha256 === value.candidates[1].normalizedHierarchySha256 || value.materialDifferenceRows.length < 1) fail("candidate formation people/candidate/material-difference invariant failed")
  for (const candidate of value.candidates) {
    const rows = value.decisionRows.filter((row) => row.candidateId === candidate.candidateId)
    if (rows.length !== 21 || JSON.stringify(rows.map((row) => row.familyNumber)) !== JSON.stringify(Array.from({ length: 21 }, (_, index) => index + 1)) || candidate.decisionRowSetSha256 !== candidateDecisionRowSetSha(candidate.candidateId, value.decisionRows)) fail("candidate decision-row set reproduction failed")
  }
}
const parsedCandidateFormation = validateSemanticJson("plan005CandidateFormation", candidateFormationExample, validateCandidateFormation)
for (const candidate of parsedCandidateFormation.candidates) {
  const artifacts = parsedPilotArtifacts.filter((row) => row.candidate_id === candidate.candidateId)
  if (artifacts.length === 0 || artifacts.some((row) => row.hierarchy_sha256 !== candidate.normalizedHierarchySha256 || row.artifact_version_sha256 !== candidate.artifactVersionSha256)) fail("candidate formation to pilot artifact hash lineage failed")
}

const validateThresholdAggregate = (value) => {
  if (value.inputManifestSha256 !== thresholdInputManifestSha || value.attritionProjectionSha256 !== thresholdPhaseProjection.fileSha256 || value.scheduleFileSha256 !== thresholdScheduleFileSha || value.eligibleTrialSetSha256 !== eligibleThresholdTrialSetSha || value.eligibleSetSha256 !== thresholdEligibleSetSha || !canonicalJsonEqual(value.eligibleStudyIds, thresholdEligibleStudyIds) || !canonicalJsonEqual(value.eligibleStudyIds, thresholdPhaseProjection.eligibleStudyIds) || !canonicalJsonEqual(value.coverageRows, thresholdCoverageRows) || !canonicalJsonEqual(value.metricRows, thresholdMetricRows) || value.exclusionRows.length !== 0) fail("threshold aggregate does not reproduce raw pilot rows")
  if (value.metricRows.length !== 8 || value.metricRows.some((row) => contract.plan005.thresholdMetricMap.find((mapping) => mapping.method === row.method && mapping.taskPriority === row.taskPriority)?.metricId !== row.metricId || row.denominator <= 0 || row.successNumerator > row.denominator || row.uniquePersonCount < 2)) fail("threshold aggregate metric mapping/rational coverage failed")
  if (thresholdDatasets.attritionConsent.some((consent) => consent.event_type === "research-consent-affirmed" && value.eligibleStudyIds.includes(consent.study_id) && value.cutoffAtUtc <= consent.withdrawal_cutoff_at_utc)) fail("threshold aggregate precedes participant withdrawal cutoff")
  const review = value.sessionLengthReview
  const fits = review.maximumDurationSeconds <= review.declaredDurationSeconds
  const expectedMedianNumerator = thresholdSessionDurations.length % 2 === 1 ? thresholdSessionDurations[Math.floor(thresholdSessionDurations.length / 2)] : thresholdSessionDurations[thresholdSessionDurations.length / 2 - 1] + thresholdSessionDurations[thresholdSessionDurations.length / 2]
  const expectedMedianDenominator = thresholdSessionDurations.length % 2 === 1 ? 1 : 2
  if (review.fitsDeclaredDuration !== fits || review.rerunRequired !== (!fits || !review.noRushingObserved) || review.eligibleSessionCount !== thresholdSessionDurations.length || review.minimumDurationSeconds !== thresholdSessionDurations[0] || review.maximumDurationSeconds !== thresholdSessionDurations.at(-1) || review.medianDurationNumeratorSeconds !== expectedMedianNumerator || review.medianDurationDenominator !== expectedMedianDenominator) fail("threshold session-length derivation failed")
}
const parsedThresholdAggregate = validateSemanticJson("plan005ThresholdAggregate", thresholdAggregateExample, validateThresholdAggregate)
if (sha256(serializeCanonicalJson(parsedThresholdAggregate)) !== thresholdPilotAggregateFileSha) fail("threshold aggregate external hash drift")

const thresholdDeclarationByCell = new Map(parsedThresholdDeclarations.map((row) => [`${row.method}:${row.task_priority}`, row]))
const allFormalTaskIds = taskRows.map((task) => task.taskId).sort()
const classifyFormalOutcome = (row) => {
  const noRescueOrTimeout = row.rescue_used === "false" && row.timeout_used === "false"
  if (row.method === "tree") {
    const reachedExpectedDestination = row.observed_destination_id === row.expected_destination_id
    if (reachedExpectedDestination && Number(row.wrong_branch_count) === 0 && Number(row.backtrack_count) === 0 && noRescueOrTimeout) return "tree-direct"
    if (reachedExpectedDestination && (Number(row.wrong_branch_count) > 0 || Number(row.backtrack_count) > 0) && noRescueOrTimeout) return "tree-indirect"
    return "tree-failed"
  }
  return row.observed_first_action_id === row.expected_first_action_id && noRescueOrTimeout ? "first-click-correct" : "first-click-incorrect"
}
const deriveFormalAggregateRows = (phase, method) => {
  const projection = formalPhaseProjectionById.get(phase)
  if (!projection) fail(`missing formal attrition projection: ${phase}`)
  const phaseEvidence = parsedP005FormalEvidence.filter((row) => row.phase === phase && row.method === method)
  const eligibleEvidence = phaseEvidence.filter((row) => projection.eligibleStudyIds.includes(row.study_id))
  const eligibleStudyIds = projection.eligibleStudyIds
  const eligiblePersonKeys = projection.eligibleProgramPersonKeys
  const candidateTaskKeys = [...new Set(eligibleEvidence.map((row) => `${row.candidate_id}:${row.task_id}`))].sort()
  const taskRowsDerived = candidateTaskKeys.map((key) => {
    const [candidateId, taskId] = key.split(":")
    const rows = eligibleEvidence.filter((row) => row.candidate_id === candidateId && row.task_id === taskId)
    const taskPriority = rows[0].task_priority
    const declaration = thresholdDeclarationByCell.get(`${method}:${taskPriority}`)
    const outcomes = rows.map(classifyFormalOutcome)
    const treeDirectCount = method === "tree" ? outcomes.filter((outcome) => outcome === "tree-direct").length : 0
    const treeIndirectCount = method === "tree" ? outcomes.filter((outcome) => outcome === "tree-indirect").length : 0
    const treeFailedCount = method === "tree" ? outcomes.filter((outcome) => outcome === "tree-failed").length : 0
    const firstClickCorrectCount = method === "first-click" ? outcomes.filter((outcome) => outcome === "first-click-correct").length : 0
    const firstClickIncorrectCount = method === "first-click" ? outcomes.filter((outcome) => outcome === "first-click-incorrect").length : 0
    const successNumerator = method === "tree" ? treeDirectCount : firstClickCorrectCount
    const denominator = rows.length
    const thresholdNumerator = Number(declaration.threshold_numerator)
    const thresholdDenominator = Number(declaration.threshold_denominator)
    return {
      candidateId, taskId, taskPriority, successNumerator, denominator,
      treeDirectCount, treeIndirectCount, treeFailedCount,
      firstClickCorrectCount, firstClickIncorrectCount,
      thresholdNumerator, thresholdDenominator,
      thresholdMet: successNumerator * thresholdDenominator >= thresholdNumerator * denominator,
    }
  }).sort((left, right) => left.candidateId.localeCompare(right.candidateId, "en") || left.taskId.localeCompare(right.taskId, "en"))
  const eligibleEvidenceIds = new Set(eligibleEvidence.map((row) => row.task_evidence_id))
  const phaseIssues = p005AggregateIssueRows.filter((row) => row.phase === phase && eligibleEvidenceIds.has(row.task_evidence_id))
  const initialIssues = phaseIssues.filter((row) => row.retest_of_issue_family_id === "n/a")
  const unresolved = new Set(unresolvedP005CriticalFamilies(phaseIssues, eligibleEvidence).map((row) => row.issue_family_id))
  const issueRowsDerived = initialIssues.map((issue) => {
    const retest = phaseIssues.find((row) => row.retest_of_issue_family_id === issue.issue_family_id)
    return { candidateId: issue.candidate_id, issueFamilyId: issue.issue_family_id, severity: issue.severity, unresolved: unresolved.has(issue.issue_family_id), retestOutcome: retest?.retest_outcome ?? "not-a-retest" }
  }).sort((left, right) => left.candidateId.localeCompare(right.candidateId, "en") || left.issueFamilyId.localeCompare(right.issueFamilyId, "en"))
  const accessEvents = parsedP005FormalConsents.filter((row) => row.event_type === "access-strategy-used" && row.target_phase_id === phase && eligiblePersonKeys.includes(row.program_person_key))
  const accessCoverageRows = [...new Set(accessEvents.map((row) => row.access_strategy_code))].sort().map((strategyCode) => ({ strategyCode, uniquePersonCount: new Set(accessEvents.filter((row) => row.access_strategy_code === strategyCode).map((row) => row.program_person_key)).size }))
  const excludedEvidence = phaseEvidence.filter((row) => !projection.eligibleStudyIds.includes(row.study_id))
  const exclusionRows = [...new Set(excludedEvidence.map((row) => row.exclusion_code))].sort().map((reasonCode) => ({ reasonCode, count: excludedEvidence.filter((row) => row.exclusion_code === reasonCode).length }))
  return { eligibleStudyIds, eligibleSetSha256: fixtureEligibleSetSha(eligibleStudyIds), eligiblePersonCount: eligiblePersonKeys.length, taskRows: taskRowsDerived, issueRows: issueRowsDerived, accessCoverageRows, exclusionRows }
}
const treeFormalDerived = deriveFormalAggregateRows("p005-tree-test", "tree")
const formalAggregateExample = {
  schemaVersion: contract.schemas.plan005FormalAggregate.id,
  protocolVersion: contract.protocolVersion,
  phase: "p005-tree-test",
  phaseVersion: "TREE-R1-V1",
  method: "tree",
  cutoffAtUtc: "2026-01-21T00:00:00Z",
  inputManifestSha256: formalInputManifestShaByPhase.get("p005-tree-test"),
  attritionProjectionSha256: formalPhaseProjectionById.get("p005-tree-test").fileSha256,
  ...treeFormalDerived,
}
const validateFormalAggregate = (value, { selectedCandidateId = "n/a" } = {}) => {
  const phaseConfig = formalPhaseConfigs.find((candidate) => candidate.phase === value.phase)
  if (!phaseConfig || phaseConfig.method !== value.method || value.cutoffAtUtc !== phaseConfig.aggregateCutoffAtUtc) fail("formal aggregate phase/method/cutoff mismatch")
  const projection = formalPhaseProjectionById.get(value.phase)
  if (value.inputManifestSha256 !== formalInputManifestShaByPhase.get(value.phase) || value.attritionProjectionSha256 !== projection.fileSha256) fail("formal aggregate input/attrition hash mismatch")
  const candidateIds = [...new Set(value.taskRows.map((row) => row.candidateId))].sort()
  const expectedCandidateIds = value.phase === "p005-first-click-r2" ? [selectedCandidateId] : candidates
  if (value.phase === "p005-first-click-r2" && !candidates.includes(selectedCandidateId)) fail("formal R2 lacks a progressed candidate")
  if (!canonicalJsonEqual(candidateIds, expectedCandidateIds)) fail("formal aggregate candidate cardinality/selection failed")
  for (const candidateId of candidateIds) {
    const rows = value.taskRows.filter((row) => row.candidateId === candidateId)
    if (rows.length !== 13 || !canonicalJsonEqual(rows.map((row) => row.taskId).sort(), allFormalTaskIds) || rows.some((row) => row.denominator <= 0 || row.thresholdDenominator <= 0 || row.thresholdMet !== (row.successNumerator * row.thresholdDenominator >= row.thresholdNumerator * row.denominator))) fail("formal aggregate 13-task gate/rational derivation failed")
    for (const row of rows) {
      if (value.method === "tree") {
        if (row.treeDirectCount + row.treeIndirectCount + row.treeFailedCount !== row.denominator || row.successNumerator !== row.treeDirectCount || row.firstClickCorrectCount !== 0 || row.firstClickIncorrectCount !== 0) fail("formal aggregate tree outcome-count invariant failed")
      } else if (row.firstClickCorrectCount + row.firstClickIncorrectCount !== row.denominator || row.successNumerator !== row.firstClickCorrectCount || row.treeDirectCount !== 0 || row.treeIndirectCount !== 0 || row.treeFailedCount !== 0) {
        fail("formal aggregate first-click outcome-count invariant failed")
      }
    }
  }
  const derived = deriveFormalAggregateRows(value.phase, value.method)
  for (const field of ["eligibleStudyIds", "eligibleSetSha256", "eligiblePersonCount", "taskRows", "issueRows", "accessCoverageRows", "exclusionRows"]) if (!canonicalJsonEqual(value[field], derived[field])) fail(`formal aggregate raw derivation mismatch: ${field}`)
  if (value.phase === "p005-first-click-r2" && value.issueRows.some((row) => row.candidateId === selectedCandidateId && row.severity === "critical" && row.unresolved)) fail("formal R2 retains unresolved selected-candidate critical")
}
const parsedFormalAggregate = validateSemanticJson("plan005FormalAggregate", formalAggregateExample, validateFormalAggregate)
const firstClickFormalAggregateExample = {
  ...formalAggregateExample,
  phase: "p005-first-click-r1",
  phaseVersion: "FIRST-CLICK-R1-V1",
  method: "first-click",
  inputManifestSha256: formalInputManifestShaByPhase.get("p005-first-click-r1"),
  attritionProjectionSha256: formalPhaseProjectionById.get("p005-first-click-r1").fileSha256,
  ...deriveFormalAggregateRows("p005-first-click-r1", "first-click"),
}
const parsedFirstClickFormalAggregate = validateSemanticJson("plan005FormalAggregate", firstClickFormalAggregateExample, validateFormalAggregate)
if (!parsedFormalAggregate.taskRows.some((row) => row.candidateId === "candidate-b" && row.treeIndirectCount === 1) || !parsedFormalAggregate.taskRows.some((row) => row.candidateId === "candidate-b" && row.treeFailedCount === 1) || parsedFormalAggregate.taskRows.some((row) => row.firstClickCorrectCount !== 0 || row.firstClickIncorrectCount !== 0)) fail("formal tree retained outcome-count positive fixture failed")
if (!parsedFirstClickFormalAggregate.taskRows.some((row) => row.candidateId === "candidate-b" && row.firstClickIncorrectCount === 1) || parsedFirstClickFormalAggregate.taskRows.some((row) => row.treeDirectCount !== 0 || row.treeIndirectCount !== 0 || row.treeFailedCount !== 0)) fail("formal first-click retained outcome-count positive fixture failed")
const treeAggregateExternalSha = sha256(serializeCanonicalJson(parsedFormalAggregate))
const firstClickR1AggregateExternalSha = sha256(serializeCanonicalJson(parsedFirstClickFormalAggregate))

const passedTaskIds = (aggregate, candidateId) => aggregate.taskRows.filter((row) => row.candidateId === candidateId && row.thresholdMet).map((row) => row.taskId).sort()
const unresolvedCriticalCount = (aggregate, candidateId) => aggregate.issueRows.filter((row) => row.candidateId === candidateId && row.severity === "critical" && row.unresolved).length
const deriveProgressionCandidateRows = (treeAggregate, firstClickR1Aggregate) => candidates.map((candidateId) => {
  const treePassedTaskIds = passedTaskIds(treeAggregate, candidateId)
  const treeUnresolvedCriticalCount = unresolvedCriticalCount(treeAggregate, candidateId)
  const firstClickR1PassedTaskIds = passedTaskIds(firstClickR1Aggregate, candidateId)
  const firstClickR1UnresolvedCriticalCount = unresolvedCriticalCount(firstClickR1Aggregate, candidateId)
  const eligible = canonicalJsonEqual(treePassedTaskIds, allFormalTaskIds) && treeUnresolvedCriticalCount === 0 && canonicalJsonEqual(firstClickR1PassedTaskIds, allFormalTaskIds) && firstClickR1UnresolvedCriticalCount === 0
  return { candidateId, treePassedTaskIds, treeUnresolvedCriticalCount, firstClickR1PassedTaskIds, firstClickR1UnresolvedCriticalCount, eligible }
})
const progressionCandidateRows = deriveProgressionCandidateRows(parsedFormalAggregate, parsedFirstClickFormalAggregate)
const progressionExample = {
  schemaVersion: contract.schemas.plan005ProgressionDecision.id,
  treeAggregateFileSha256: treeAggregateExternalSha,
  firstClickR1AggregateFileSha256: firstClickR1AggregateExternalSha,
  thresholdDeclarationFileSha256: thresholdDeclarationFileSha,
  candidateRows: progressionCandidateRows,
  eligibleCandidateIds: progressionCandidateRows.filter((row) => row.eligible).map((row) => row.candidateId),
  selectedCandidateId: fixtureSelectedCandidateId,
  ownerRationaleSha256: hashToken("owner-selection-rationale"),
  ownerCode: "HUMAN-NAVIGATION-OWNER",
  secondReviewerCode: "HUMAN-NAVIGATION-REVIEWER",
  decidedAtUtc: "2026-01-22T00:00:00Z",
}
const validateProgression = (value, { treeAggregate = parsedFormalAggregate, firstClickR1Aggregate = parsedFirstClickFormalAggregate, thresholdDeclarationSha256 = thresholdDeclarationFileSha } = {}) => {
  const expectedTreeSha = sha256(serializeCanonicalJson(treeAggregate))
  const expectedFirstClickR1Sha = sha256(serializeCanonicalJson(firstClickR1Aggregate))
  if (value.treeAggregateFileSha256 !== expectedTreeSha || value.firstClickR1AggregateFileSha256 !== expectedFirstClickR1Sha || value.thresholdDeclarationFileSha256 !== thresholdDeclarationSha256) fail("progression upstream aggregate/declaration hash mismatch")
  const expectedRows = deriveProgressionCandidateRows(treeAggregate, firstClickR1Aggregate)
  if (!canonicalJsonEqual(value.candidateRows, expectedRows)) fail("progression does not match formal aggregate inputs")
  const derivedEligible = value.candidateRows.filter((row) => row.eligible).map((row) => row.candidateId).sort()
  const validSelection = derivedEligible.length === 0 ? value.selectedCandidateId === "n/a" : derivedEligible.includes(value.selectedCandidateId)
  if (!canonicalJsonEqual(value.eligibleCandidateIds, derivedEligible) || !validSelection || value.ownerCode === value.secondReviewerCode) fail("progression selection/reviewer derivation failed")
}
const parsedProgression = validateSemanticJson("plan005ProgressionDecision", progressionExample, validateProgression)
if (parsedProgression.selectedCandidateId !== fixtureSelectedCandidateId) fail("fixture progression selected-candidate drift")
if (parsedFirstClickR2.some((row) => row.candidate_id !== parsedProgression.selectedCandidateId)) fail("formal R2 schedule is not bound to the progressed candidate")

const r2FormalAggregateExample = {
  schemaVersion: contract.schemas.plan005FormalAggregate.id,
  protocolVersion: contract.protocolVersion,
  phase: "p005-first-click-r2",
  phaseVersion: "FIRST-CLICK-R2-V1",
  method: "first-click",
  cutoffAtUtc: formalPhaseConfigs.find((row) => row.phase === "p005-first-click-r2").aggregateCutoffAtUtc,
  inputManifestSha256: formalInputManifestShaByPhase.get("p005-first-click-r2"),
  attritionProjectionSha256: formalPhaseProjectionById.get("p005-first-click-r2").fileSha256,
  ...deriveFormalAggregateRows("p005-first-click-r2", "first-click"),
}
const parsedR2FormalAggregate = validateSemanticJson("plan005FormalAggregate", r2FormalAggregateExample, (value) => validateFormalAggregate(value, { selectedCandidateId: parsedProgression.selectedCandidateId }))

const noEligibleFirstClickAggregate = {
  ...parsedFirstClickFormalAggregate,
  taskRows: parsedFirstClickFormalAggregate.taskRows.map((row) => row.taskId === allFormalTaskIds[0] ? { ...row, successNumerator: 0, firstClickCorrectCount: 0, firstClickIncorrectCount: row.denominator, thresholdMet: false } : row),
}
const noEligibleProgressionRows = deriveProgressionCandidateRows(parsedFormalAggregate, noEligibleFirstClickAggregate)
const noEligibleProgressionExample = {
  ...parsedProgression,
  treeAggregateFileSha256: treeAggregateExternalSha,
  firstClickR1AggregateFileSha256: sha256(serializeCanonicalJson(noEligibleFirstClickAggregate)),
  candidateRows: noEligibleProgressionRows,
  eligibleCandidateIds: [],
  selectedCandidateId: "n/a",
  ownerRationaleSha256: hashToken("no-eligible-owner-rationale"),
}
const parsedNoEligibleProgression = parseCanonicalJson(contract.schemas.plan005ProgressionDecision, serializeCanonicalJson(noEligibleProgressionExample))
validateProgression(parsedNoEligibleProgression, { treeAggregate: parsedFormalAggregate, firstClickR1Aggregate: noEligibleFirstClickAggregate })
jsonSemanticExampleCount += 1

const { schemaVersion: noncanonicalSchemaVersion, ...noncanonicalOpenSortRest } = parsedOpenSortAggregate
expectSemanticFailure(() => parseCanonicalJson(contract.schemas.plan005OpenSortAggregate, `${JSON.stringify({ schemaVersion: noncanonicalSchemaVersion, ...noncanonicalOpenSortRest })}\n`), "recursively key-sorted")
expectSemanticFailure(() => validateJsonValue(contract.schemas.plan005OpenSortAggregate, { ...parsedOpenSortAggregate, pairRows: [parsedOpenSortAggregate.pairRows[0], parsedOpenSortAggregate.pairRows[0], ...parsedOpenSortAggregate.pairRows.slice(2)] }), "duplicate row")
expectSemanticFailure(() => validateOpenSortAggregate({ ...parsedOpenSortAggregate, labelRows: parsedOpenSortAggregate.labelRows.map((row, index) => index === 0 ? { ...row, count: row.count + 1 } : row) }), "open-sort aggregate raw derivation mismatch")
expectSemanticFailure(() => validateCandidateFormation({ ...parsedCandidateFormation, candidates: parsedCandidateFormation.candidates.map((row, index) => index === 0 ? { ...row, decisionRowSetSha256: hashToken("wrong-row-set") } : row) }), "decision-row set")
expectSemanticFailure(() => validateCandidateFormation({ ...parsedCandidateFormation, decisionRows: parsedCandidateFormation.decisionRows.map((row, index) => index === 0 ? { ...row, rationaleCode: "CHANGED-RATIONALE" } : row) }), "decision-row set")
expectSemanticFailure(() => validateCandidateFormation({ ...parsedCandidateFormation, openSortAggregateFileSha256: hashToken("wrong-open-sort-aggregate") }), "open-sort aggregate hash")
expectSemanticFailure(() => validateP004Aggregate({ ...parsedP004Aggregate, candidateRows: parsedP004Aggregate.candidateRows.map((row, index) => index === 0 ? { ...row, numerator: 0 } : row) }), "Plan 004 aggregate raw derivation mismatch")
expectSemanticFailure(() => validateP004Aggregate({ ...parsedP004Aggregate, attritionProjectionSha256: hashToken("wrong-p004-projection") }), "Plan 004 aggregate input/attrition hash mismatch")
expectSemanticFailure(() => validateOpenSortAggregate({ ...parsedOpenSortAggregate, attritionProjectionSha256: hashToken("wrong-open-sort-projection") }), "open-sort aggregate input/attrition hash mismatch")
expectSemanticFailure(() => validateThresholdAggregate({ ...parsedThresholdAggregate, metricRows: parsedThresholdAggregate.metricRows.map((row, index) => index === 0 ? { ...row, successNumerator: row.successNumerator - 1 } : row) }), "does not reproduce raw pilot rows")
expectSemanticFailure(() => validateThresholdAggregate({ ...parsedThresholdAggregate, attritionProjectionSha256: hashToken("wrong-threshold-projection") }), "does not reproduce raw pilot rows")
expectSemanticFailure(() => validateThresholdAggregate({ ...parsedThresholdAggregate, sessionLengthReview: { ...parsedThresholdAggregate.sessionLengthReview, rerunRequired: true } }), "session-length")
expectSemanticFailure(() => validateFormalAggregate({ ...parsedFormalAggregate, taskRows: parsedFormalAggregate.taskRows.map((row, index) => index === 0 ? { ...row, thresholdMet: false } : row) }), "13-task gate")
expectSemanticFailure(() => validateFormalAggregate({ ...parsedFormalAggregate, taskRows: parsedFormalAggregate.taskRows.map((row, index) => index === 0 ? { ...row, treeFailedCount: row.treeFailedCount + 1 } : row) }), "tree outcome-count invariant")
expectSemanticFailure(() => validateFormalAggregate({ ...parsedFormalAggregate, taskRows: parsedFormalAggregate.taskRows.map((row, index) => index === 0 ? { ...row, successNumerator: 0, thresholdMet: false } : row) }), "tree outcome-count invariant")
expectSemanticFailure(() => validateFormalAggregate({ ...parsedFormalAggregate, taskRows: parsedFormalAggregate.taskRows.map((row, index) => index === 0 ? { ...row, firstClickIncorrectCount: 1 } : row) }), "tree outcome-count invariant")
expectSemanticFailure(() => validateFormalAggregate({ ...parsedFormalAggregate, taskRows: parsedFormalAggregate.taskRows.map((row) => row.candidateId === "candidate-b" && row.treeIndirectCount === 1 ? { ...row, treeDirectCount: 1, treeIndirectCount: 0, successNumerator: 1, thresholdMet: true } : row) }), "formal aggregate raw derivation mismatch: taskRows")
expectSemanticFailure(() => validateFormalAggregate({ ...parsedFirstClickFormalAggregate, taskRows: parsedFirstClickFormalAggregate.taskRows.map((row, index) => index === 0 ? { ...row, firstClickIncorrectCount: row.firstClickIncorrectCount + 1 } : row) }), "first-click outcome-count invariant")
expectSemanticFailure(() => validateFormalAggregate({ ...parsedFirstClickFormalAggregate, taskRows: parsedFirstClickFormalAggregate.taskRows.map((row, index) => index === 0 ? { ...row, successNumerator: 0, thresholdMet: false } : row) }), "first-click outcome-count invariant")
expectSemanticFailure(() => validateFormalAggregate({ ...parsedFirstClickFormalAggregate, taskRows: parsedFirstClickFormalAggregate.taskRows.map((row, index) => index === 0 ? { ...row, treeFailedCount: 1 } : row) }), "first-click outcome-count invariant")
expectSemanticFailure(() => validateFormalAggregate({ ...parsedFirstClickFormalAggregate, taskRows: parsedFirstClickFormalAggregate.taskRows.map((row) => row.candidateId === "candidate-a" && row.firstClickCorrectCount === 1 ? { ...row, firstClickCorrectCount: 0, firstClickIncorrectCount: 1, successNumerator: 0, thresholdMet: false } : row) }), "formal aggregate raw derivation mismatch: taskRows")
expectSemanticFailure(() => validateFormalAggregate({ ...parsedFormalAggregate, attritionProjectionSha256: hashToken("wrong-formal-projection") }), "formal aggregate input/attrition hash mismatch")
expectSemanticFailure(() => validateProgression({ ...parsedProgression, treeAggregateFileSha256: hashToken("wrong-tree-aggregate") }), "upstream aggregate/declaration hash")
expectSemanticFailure(() => validateProgression({ ...parsedProgression, candidateRows: parsedProgression.candidateRows.map((row, index) => index === 0 ? { ...row, firstClickR1PassedTaskIds: row.firstClickR1PassedTaskIds.slice(1) } : row) }), "does not match formal aggregate")
expectSemanticFailure(() => validateProgression({ ...parsedProgression, selectedCandidateId: "candidate-b" }), "selection/reviewer derivation failed")
expectSemanticFailure(() => validateProgression({ ...parsedProgression, candidateRows: parsedProgression.candidateRows.map((row) => row.candidateId === "candidate-b" ? { ...row, firstClickR1UnresolvedCriticalCount: 0, eligible: true } : row) }), "does not match formal aggregate")
expectSemanticFailure(() => validateProgression({ ...parsedNoEligibleProgression, selectedCandidateId: fixtureSelectedCandidateId }, { treeAggregate: parsedFormalAggregate, firstClickR1Aggregate: noEligibleFirstClickAggregate }), "selection/reviewer derivation failed")
expectSemanticFailure(() => validateFormalAggregate({ ...parsedR2FormalAggregate, taskRows: parsedR2FormalAggregate.taskRows.map((row) => ({ ...row, candidateId: "candidate-b" })) }, { selectedCandidateId: parsedProgression.selectedCandidateId }), "candidate cardinality/selection failed")
expectSemanticFailure(() => validateFormalAggregate({ ...parsedR2FormalAggregate, taskRows: parsedR2FormalAggregate.taskRows.map((row, index) => index === 0 ? { ...row, successNumerator: 0, firstClickCorrectCount: 0, firstClickIncorrectCount: row.denominator, thresholdMet: false } : row) }, { selectedCandidateId: parsedProgression.selectedCandidateId }), "formal aggregate raw derivation mismatch")

const fileDigestLines = []
for (const file of [...recoveryManifest.files].sort((left, right) => left.path.localeCompare(right.path))) {
  const bytes = await readFile(resolve(recoveryRoot, file.path))
  const digest = sha256(bytes)
  if (digest !== file.sha256) fail(`recovery hash mismatch: ${file.path}`)
  if (bytes.length !== file.bytes) fail(`recovery size mismatch: ${file.path}`)
  fileDigestLines.push(`${digest}  ${file.path.replace("prototypes/", "")}`)
}
const setDigest = sha256(`${fileDigestLines.join("\n")}\n`)
if (setDigest !== contract.recoverySetSha256 || setDigest !== recoveryManifest.setDigest.sha256) fail("recovery complete-set digest mismatch")

console.log(
  `fieldwork-packet ok protocol=${contract.protocolVersion} schemas=${requiredSchemaKeys.length} tsv_shape_checks=${tsvShapeCheckCount} tsv_semantic_fixtures=${tsvSemanticFixtureCount} json_semantic_examples=${jsonSemanticExampleCount} mutation_checks=${mutationCheckCount} joined_open_sort_cards=24 open_sort_pairs=276 threshold_schedule_cells=${parsedThresholdSchedule.length} threshold_metric_cells=8 first_click_r1_cells=${parsedFirstClickR1.length} first_click_r2_cells=${parsedFirstClickR2.length} tree_cells=${parsedTree.length} plan004_allocation_rows=${parsedAllocation.length} recovery_files=${recoveryManifest.files.length}`,
)
