import { execFileSync, spawnSync } from "node:child_process"
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
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
  schemaVersion: Schema.Literal(2),
  status: Schema.Literals(["blocked", "certified"]),
  candidateCommitSha: Schema.NullOr(Schema.String),
  reviewedAt: Schema.NullOr(Schema.String),
  checks: CertificationChecks,
  gaps: Schema.Array(Schema.String),
  evidence: Schema.Array(Schema.String),
  notes: Schema.Array(Schema.String)
})

export type ProductionCertificationValue = typeof ProductionCertification.Type

const recordUrl = new URL("../docs/certification/production-v1.json", import.meta.url)
const repositoryRoot = fileURLToPath(new URL("../", import.meta.url))
export const certificationRecordPath = "docs/certification/production-v1.json"
const commitPattern = /^[0-9a-f]{40}$/

const parseArguments = (arguments_: readonly string[]) => {
  const allowBlocked = arguments_.includes("--allow-blocked")
  const deployCommitIndex = arguments_.indexOf("--deploy-commit")
  const deployCommit =
    deployCommitIndex === -1 ? undefined : arguments_[deployCommitIndex + 1]

  if (deployCommitIndex !== -1 && deployCommit === undefined) {
    throw new Error("--deploy-commit requires a 40-character lowercase Git SHA")
  }
  if (deployCommit !== undefined && !commitPattern.test(deployCommit)) {
    throw new Error(`Invalid deploy commit SHA: ${JSON.stringify(deployCommit)}`)
  }
  const recognized = new Set([
    "--allow-blocked",
    "--deploy-commit",
    ...(deployCommit === undefined ? [] : [deployCommit])
  ])
  const unknown = arguments_.filter((argument) => !recognized.has(argument))
  if (unknown.length > 0) throw new Error(`Unknown arguments: ${unknown.join(", ")}`)

  return { allowBlocked, deployCommit }
}

const assertNonEmptyStrings = (values: readonly string[], label: string): void => {
  if (values.some((value) => value.trim().length === 0)) {
    throw new Error(`${label} entries must not be empty`)
  }
}

export interface CertificationGitEvidence {
  readonly candidateIsAncestor: boolean
  readonly changedPaths: ReadonlyArray<string>
}

export const assertCertified = (
  record: ProductionCertificationValue,
  deployCommit: string | undefined,
  git: CertificationGitEvidence
): void => {
  if (deployCommit === undefined) {
    throw new Error("Production certification requires --deploy-commit")
  }
  if (record.status !== "certified") {
    throw new Error("Production is blocked: certification status is not certified")
  }
  if (record.candidateCommitSha === null || !commitPattern.test(record.candidateCommitSha)) {
    throw new Error("A certified record requires a 40-character candidateCommitSha")
  }
  if (!git.candidateIsAncestor) {
    throw new Error(
      `Certified candidate ${record.candidateCommitSha} is not an ancestor of deploy commit ${deployCommit}`
    )
  }
  const evidencePrefix = `docs/certification/evidence/${record.candidateCommitSha}/`
  const invalidPaths = git.changedPaths.filter(
    (path) => path !== certificationRecordPath && !path.startsWith(evidencePrefix)
  )
  if (!git.changedPaths.includes(certificationRecordPath) || invalidPaths.length > 0) {
    throw new Error(
      "Only the production certification record and candidate-scoped evidence may differ " +
      "from the manually tested candidate; " +
      `changed paths: ${git.changedPaths.length === 0 ? "none" : git.changedPaths.join(", ")}`
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

const gitEvidence = (
  candidateCommit: string,
  deployCommit: string
): CertificationGitEvidence => {
  const ancestor = spawnSync(
    "git",
    ["merge-base", "--is-ancestor", candidateCommit, deployCommit],
    { cwd: repositoryRoot, stdio: "ignore" }
  )
  if (ancestor.error !== undefined) throw ancestor.error
  if (ancestor.status !== 0 && ancestor.status !== 1) {
    throw new Error("Git could not resolve the candidate/deploy ancestry")
  }
  const output = execFileSync(
    "git",
    ["diff", "--name-only", "-z", candidateCommit, deployCommit],
    { cwd: repositoryRoot }
  )
  const changedPaths = output
    .toString("utf8")
    .split("\0")
    .filter((path) => path.length > 0)
  return { candidateIsAncestor: ancestor.status === 0, changedPaths }
}

const currentHead = (): string => execFileSync(
  "git",
  ["rev-parse", "HEAD"],
  { cwd: repositoryRoot, encoding: "utf8" }
).trim()

const main = async (): Promise<void> => {
  const { allowBlocked, deployCommit } = parseArguments(process.argv.slice(2))
  const raw = JSON.parse(await readFile(recordUrl, "utf8"))
  const record = Schema.decodeUnknownSync(ProductionCertification)(raw, {
    onExcessProperty: "error"
  })

  assertNonEmptyStrings(record.gaps, "Gap")
  assertNonEmptyStrings(record.evidence, "Evidence")
  assertNonEmptyStrings(record.notes, "Note")
  if (record.candidateCommitSha !== null && !commitPattern.test(record.candidateCommitSha)) {
    throw new Error("candidateCommitSha must be null or a 40-character lowercase Git SHA")
  }

  const validateCertified = !allowBlocked || record.status === "certified"
  const effectiveDeployCommit = deployCommit ?? (validateCertified ? currentHead() : undefined)
  if (validateCertified) {
    if (effectiveDeployCommit === undefined || record.candidateCommitSha === null) {
      throw new Error("Certified production validation requires candidate and deploy commits")
    }
    assertCertified(
      record,
      effectiveDeployCommit,
      gitEvidence(record.candidateCommitSha, effectiveDeployCommit)
    )
  }
  console.log(
    allowBlocked && record.status === "blocked"
      ? `Production certification record is valid and ${record.status}.`
      : `Production certification binds tested candidate ${record.candidateCommitSha} to deploy commit ${effectiveDeployCommit}.`
  )
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
