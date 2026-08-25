import { readFile } from "node:fs/promises"
import { Schema } from "effect"

const CertificationChecks = Schema.Struct({
  automatedChromiumFirefoxWebKit: Schema.Boolean,
  nvdaFirefoxWindows: Schema.Boolean,
  voiceOverSafariMacOS: Schema.Boolean,
  voiceOverSafariiOS: Schema.Boolean,
  talkBackChromeAndroid: Schema.Boolean,
  jawsSmoke: Schema.Literals(["passed", "not-licensed", "pending"]),
  zoom400Chrome: Schema.Boolean,
  zoom400Firefox: Schema.Boolean,
  zoom400Safari: Schema.Boolean,
  printUsLetterNormal: Schema.Boolean,
  printUsLetterLarge: Schema.Boolean,
  printA4Normal: Schema.Boolean,
  printA4Large: Schema.Boolean,
  grayscalePhysicalPrint: Schema.Boolean
})

const ProductionCertification = Schema.Struct({
  schemaVersion: Schema.Literal(1),
  status: Schema.Literals(["blocked", "certified"]),
  commitSha: Schema.NullOr(Schema.String),
  reviewedAt: Schema.NullOr(Schema.String),
  checks: CertificationChecks,
  gaps: Schema.Array(Schema.String),
  evidence: Schema.Array(Schema.String),
  notes: Schema.Array(Schema.String)
})

type Certification = typeof ProductionCertification.Type

const recordUrl = new URL("../docs/certification/production-v1.json", import.meta.url)
const commitPattern = /^[0-9a-f]{40}$/

const parseArguments = (arguments_: readonly string[]) => {
  const allowBlocked = arguments_.includes("--allow-blocked")
  const expectedCommitIndex = arguments_.indexOf("--expected-commit")
  const expectedCommit =
    expectedCommitIndex === -1 ? undefined : arguments_[expectedCommitIndex + 1]

  if (expectedCommitIndex !== -1 && expectedCommit === undefined) {
    throw new Error("--expected-commit requires a 40-character lowercase Git SHA")
  }
  if (expectedCommit !== undefined && !commitPattern.test(expectedCommit)) {
    throw new Error(`Invalid expected commit SHA: ${JSON.stringify(expectedCommit)}`)
  }
  const recognized = new Set([
    "--allow-blocked",
    "--expected-commit",
    ...(expectedCommit === undefined ? [] : [expectedCommit])
  ])
  const unknown = arguments_.filter((argument) => !recognized.has(argument))
  if (unknown.length > 0) throw new Error(`Unknown arguments: ${unknown.join(", ")}`)

  return { allowBlocked, expectedCommit }
}

const assertNonEmptyStrings = (values: readonly string[], label: string): void => {
  if (values.some((value) => value.trim().length === 0)) {
    throw new Error(`${label} entries must not be empty`)
  }
}

const assertCertified = (record: Certification, expectedCommit: string | undefined): void => {
  if (expectedCommit === undefined) {
    throw new Error("Production certification requires --expected-commit")
  }
  if (record.status !== "certified") {
    throw new Error("Production is blocked: certification status is not certified")
  }
  if (record.commitSha !== expectedCommit) {
    throw new Error(
      `Certification commit ${JSON.stringify(record.commitSha)} does not match ${expectedCommit}`
    )
  }
  if (record.reviewedAt === null || Number.isNaN(Date.parse(record.reviewedAt))) {
    throw new Error("A certified record requires a valid reviewedAt timestamp")
  }
  const booleanChecks = Object.entries(record.checks).filter(
    (entry): entry is [string, boolean] => typeof entry[1] === "boolean"
  )
  const failedChecks = booleanChecks.filter(([, passed]) => !passed).map(([name]) => name)
  if (failedChecks.length > 0) {
    throw new Error(`Manual certification checks are incomplete: ${failedChecks.join(", ")}`)
  }
  if (record.checks.jawsSmoke === "pending") {
    throw new Error("JAWS must be recorded as passed or not-licensed")
  }
  if (record.gaps.length > 0) {
    throw new Error(`A certified record cannot contain gaps: ${record.gaps.join("; ")}`)
  }
  if (record.evidence.length === 0) {
    throw new Error("A certified record requires at least one evidence reference")
  }
}

const main = async (): Promise<void> => {
  const { allowBlocked, expectedCommit } = parseArguments(process.argv.slice(2))
  const raw = JSON.parse(await readFile(recordUrl, "utf8"))
  const record = Schema.decodeUnknownSync(ProductionCertification)(raw, {
    onExcessProperty: "error"
  })

  assertNonEmptyStrings(record.gaps, "Gap")
  assertNonEmptyStrings(record.evidence, "Evidence")
  assertNonEmptyStrings(record.notes, "Note")
  if (record.commitSha !== null && !commitPattern.test(record.commitSha)) {
    throw new Error("commitSha must be null or a 40-character lowercase Git SHA")
  }

  if (!allowBlocked) assertCertified(record, expectedCommit)
  console.log(
    allowBlocked
      ? `Production certification record is valid and ${record.status}.`
      : `Production certification is complete for ${expectedCommit}.`
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
