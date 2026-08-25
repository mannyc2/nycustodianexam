import { Schema } from "effect"

const safePathSegment = "[a-z0-9][a-z0-9._-]*"

const ReceiptId = Schema.String.check(
  Schema.isPattern(new RegExp(`^${safePathSegment}$`), {
    expected: "a safe release receipt identifier"
  })
)

const PositiveInteger = Schema.Int.check(
  Schema.makeFilter((value) => value > 0 ? undefined : "a positive integer")
)

const Sha256 = Schema.String.check(
  Schema.isPattern(/^[a-f0-9]{64}$/, { expected: "a lowercase SHA-256 digest" })
)

const QuestionPostcommitPath = Schema.String.check(
  Schema.isPattern(
    new RegExp(`^/content/vertical-slice/questions/${safePathSegment}\.postcommit\.json$`),
    { expected: "an exact root-relative question postcommit artifact path" }
  )
)

const ScenePostcommitPath = Schema.String.check(
  Schema.isPattern(
    new RegExp(`^/content/vertical-slice/scenes/${safePathSegment}\.postcommit\.json$`),
    { expected: "an exact root-relative scene postcommit artifact path" }
  )
)

const receiptFields = (postcommitPath: typeof QuestionPostcommitPath | typeof ScenePostcommitPath) => ({
  releaseId: ReceiptId,
  packVersion: PositiveInteger,
  sessionId: ReceiptId,
  position: PositiveInteger,
  postcommitPath,
  postcommitBytes: PositiveInteger,
  postcommitSha256: Sha256
})

export const QuestionAttemptReceipt = Schema.Struct({
  ...receiptFields(QuestionPostcommitPath),
  questionId: ReceiptId
})

export type QuestionAttemptReceipt = typeof QuestionAttemptReceipt.Type

export const HazardAttemptReceipt = Schema.Struct({
  ...receiptFields(ScenePostcommitPath),
  sceneId: ReceiptId,
  mode: Schema.Literals(["visual", "nonvisual"]),
  assetRevision: PositiveInteger,
  assetMasterSha256: Sha256
})

export type HazardAttemptReceipt = typeof HazardAttemptReceipt.Type

export const questionAttemptId = (receipt: QuestionAttemptReceipt): string =>
  `${receipt.releaseId}:v${receipt.packVersion}:${receipt.sessionId}:question:${receipt.position}`

export const hazardAttemptId = (receipt: HazardAttemptReceipt): string =>
  `${receipt.releaseId}:v${receipt.packVersion}:${receipt.sessionId}:hazard-${receipt.mode}:${receipt.position}`

const sameBaseReceipt = (
  left: QuestionAttemptReceipt | HazardAttemptReceipt,
  right: QuestionAttemptReceipt | HazardAttemptReceipt
): boolean =>
  left.releaseId === right.releaseId &&
  left.packVersion === right.packVersion &&
  left.sessionId === right.sessionId &&
  left.position === right.position &&
  left.postcommitPath === right.postcommitPath &&
  left.postcommitBytes === right.postcommitBytes &&
  left.postcommitSha256 === right.postcommitSha256

export const sameQuestionReceipt = (
  left: QuestionAttemptReceipt,
  right: QuestionAttemptReceipt
): boolean => sameBaseReceipt(left, right) && left.questionId === right.questionId

export const sameHazardReceipt = (
  left: HazardAttemptReceipt,
  right: HazardAttemptReceipt
): boolean =>
  sameBaseReceipt(left, right) &&
  left.sceneId === right.sceneId &&
  left.mode === right.mode &&
  left.assetRevision === right.assetRevision &&
  left.assetMasterSha256 === right.assetMasterSha256
