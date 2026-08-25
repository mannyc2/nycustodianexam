import {
  PostcommitQuestion,
  PostcommitScene,
  PrecommitQuestion,
  PrecommitScene
} from "@nycustodian/content/model"
import { Schema } from "effect"
import { HazardAttemptReceipt, QuestionAttemptReceipt } from "../attempt-receipt.ts"
import { DeterministicSeed } from "../deterministic-seed.ts"
import { AssetContentReceipt } from "../verified-content.ts"
import { RetainedImageAsset } from "../retained-image.ts"
import { OfflinePackGenerationClaim } from "../offline-packs/model.ts"
import {
  DurableTimestamp,
  NormalizedCoordinate,
  decodeDurableTimestamp
} from "../durable-values.ts"

const UniqueStrings = Schema.Array(Schema.NonEmptyString).check(
  Schema.makeFilter((values) =>
    values.length > 0 && new Set(values).size === values.length
      ? undefined
      : "a non-empty list of unique strings"
  )
)

const NonNegativeInt = Schema.Int.check(
  Schema.makeFilter((value) =>
    Number.isSafeInteger(value) && value >= 0
      ? undefined
      : "a non-negative safe integer"
  )
)

const PositiveInt = Schema.Int.check(
  Schema.makeFilter((value) =>
    Number.isSafeInteger(value) && value > 0
      ? undefined
      : "a positive safe integer"
  )
)

export const SimulationTimestamp = DurableTimestamp

export const decodeSimulationTimestamp = (value: unknown): number =>
  decodeDurableTimestamp(value)

export const simulationMaximumDurationSeconds = 240 * 60

const SimulationDurationSeconds = PositiveInt.check(
  Schema.makeFilter((value) =>
    value <= simulationMaximumDurationSeconds
      ? undefined
      : `a duration no greater than ${simulationMaximumDurationSeconds} seconds`
  )
)

export const SimulationId = Schema.String.check(
  Schema.isPattern(/^sim-[a-z0-9][a-z0-9-]{7,63}$/, {
    expected: "an opaque simulation id"
  })
)

export const simulationAlgorithm = "mulberry32-fisher-yates-v1" as const

export const SimulationFormat = Schema.Literals([
  "questions",
  "visual-hazards",
  "nonvisual-hazards"
])

export type SimulationFormat = typeof SimulationFormat.Type

export class SimulationProfile extends Schema.Class<SimulationProfile>(
  "@nycustodian/site/SimulationProfile"
)({
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  version: PositiveInt,
  jurisdiction: Schema.NonEmptyString,
  compatibilityKey: Schema.NonEmptyString,
  disclaimer: Schema.NonEmptyString
}) {}

export class SimulationInventoryItem extends Schema.Class<SimulationInventoryItem>(
  "@nycustodian/site/SimulationInventoryItem"
)({
  question: PrecommitQuestion,
  receipt: QuestionAttemptReceipt,
  profileIds: UniqueStrings,
  category: Schema.NonEmptyString
}) {}

export class SimulationHazardInventoryItem extends Schema.Class<SimulationHazardInventoryItem>(
  "@nycustodian/site/SimulationHazardInventoryItem"
)({
  scene: PrecommitScene,
  visualReceipt: HazardAttemptReceipt,
  nonvisualReceipt: HazardAttemptReceipt,
  visualAsset: AssetContentReceipt,
  profileIds: UniqueStrings,
  category: Schema.NonEmptyString
}) {}

export class SimulationBootstrap extends Schema.Class<SimulationBootstrap>(
  "@nycustodian/site/SimulationBootstrap"
)({
  schemaVersion: Schema.Literal(1),
  releaseId: Schema.NonEmptyString,
  packVersion: PositiveInt,
  profiles: Schema.NonEmptyArray(SimulationProfile),
  inventory: Schema.NonEmptyArray(SimulationInventoryItem),
  hazards: Schema.Array(SimulationHazardInventoryItem),
  advertisedLengths: Schema.NonEmptyArray(PositiveInt)
}) {}

export class SimulationDistributionEntry extends Schema.Class<SimulationDistributionEntry>(
  "@nycustodian/site/SimulationDistributionEntry"
)({
  label: Schema.NonEmptyString,
  count: PositiveInt
}) {}

export class SimulationTimingSettings extends Schema.Class<SimulationTimingSettings>(
  "@nycustodian/site/SimulationTimingSettings"
)({
  mode: Schema.Literals(["untimed", "timed"]),
  durationSeconds: Schema.NullOr(SimulationDurationSeconds),
  timerVisible: Schema.Boolean,
  autoSubmit: Schema.Boolean
}) {}

export class SimulationSessionItem extends Schema.Class<SimulationSessionItem>(
  "@nycustodian/site/SimulationSessionItem"
)({
  position: PositiveInt,
  question: PrecommitQuestion,
  receipt: QuestionAttemptReceipt,
  profileIds: UniqueStrings,
  optionOrder: UniqueStrings,
  category: Schema.NonEmptyString
}) {}

export class SimulationHazardSessionItem extends Schema.Class<SimulationHazardSessionItem>(
  "@nycustodian/site/SimulationHazardSessionItem"
)({
  position: PositiveInt,
  scene: PrecommitScene,
  receipt: HazardAttemptReceipt,
  profileIds: UniqueStrings,
  mode: Schema.Literals(["visual", "nonvisual"]),
  visualAsset: Schema.NullOr(AssetContentReceipt),
  category: Schema.NonEmptyString
}) {}

export const SimulationPinnedItem = Schema.Union([
  SimulationSessionItem,
  SimulationHazardSessionItem
])

export type SimulationPinnedItem = typeof SimulationPinnedItem.Type

export const SimulationHazardMarker = Schema.Struct({
  id: Schema.NonEmptyString,
  x: NormalizedCoordinate,
  y: NormalizedCoordinate
})

export class SimulationResponse extends Schema.Class<SimulationResponse>(
  "@nycustodian/site/SimulationResponse"
)({
  questionId: Schema.NonEmptyString,
  selectedOptionId: Schema.NullOr(Schema.NonEmptyString),
  markers: Schema.optionalKey(Schema.Array(SimulationHazardMarker)),
  selectedZoneOrders: Schema.optionalKey(Schema.Array(Schema.Natural)),
  zeroHazardsConfirmed: Schema.optionalKey(Schema.Boolean),
  reviewIntent: Schema.Literals(["unflagged", "flagged"]),
  updatedAt: SimulationTimestamp
}) {}

export class SimulationSessionRecord extends Schema.Class<SimulationSessionRecord>(
  "@nycustodian/site/SimulationSessionRecord"
)({
  schemaVersion: Schema.Literals([1, 2]),
  packClaim: Schema.optionalKey(OfflinePackGenerationClaim),
  id: SimulationId,
  status: Schema.Literals(["active", "submitted", "evaluated"]),
  algorithm: Schema.Literal(simulationAlgorithm),
  format: SimulationFormat,
  seed: DeterministicSeed,
  releaseId: Schema.NonEmptyString,
  packVersion: PositiveInt,
  profile: SimulationProfile,
  selectedCategories: UniqueStrings,
  timing: SimulationTimingSettings,
  advertisedLength: PositiveInt,
  actualLength: PositiveInt,
  distribution: Schema.NonEmptyArray(SimulationDistributionEntry),
  items: Schema.NonEmptyArray(SimulationPinnedItem),
  responses: Schema.Array(SimulationResponse),
  currentPosition: PositiveInt,
  createdAt: SimulationTimestamp,
  updatedAt: SimulationTimestamp
}) {}

export const decodeSimulationSessionRecordShape = (
  value: unknown
): SimulationSessionRecord => {
  const session = Schema.decodeUnknownSync(
    SimulationSessionRecord,
    { onExcessProperty: "error" }
  )(value)
  if (
    (session.schemaVersion === 1 && session.packClaim !== undefined) ||
    (session.schemaVersion === 2 && session.packClaim === undefined)
  ) {
    throw new Error("Simulation session schema and offline-pack claim disagree")
  }
  if (
    session.packClaim !== undefined &&
    (session.packClaim.releaseId !== session.releaseId ||
      session.packClaim.packVersion !== session.packVersion)
  ) {
    throw new Error("Simulation session release is outside its offline-pack claim")
  }
  return session
}

export class SimulationSubmittedAnswer extends Schema.Class<SimulationSubmittedAnswer>(
  "@nycustodian/site/SimulationSubmittedAnswer"
)({
  questionId: Schema.NonEmptyString,
  selectedOptionId: Schema.NullOr(Schema.NonEmptyString),
  markers: Schema.optionalKey(Schema.Array(SimulationHazardMarker)),
  selectedZoneOrders: Schema.optionalKey(Schema.Array(Schema.Natural)),
  zeroHazardsConfirmed: Schema.optionalKey(Schema.Boolean),
  reviewIntent: Schema.Literals(["unflagged", "flagged"])
}) {}

export class SimulationQuestionResult extends Schema.Class<SimulationQuestionResult>(
  "@nycustodian/site/SimulationQuestionResult"
)({
  kind: Schema.Literal("question"),
  questionId: Schema.NonEmptyString,
  selectedOptionId: Schema.NullOr(Schema.NonEmptyString),
  correctOptionId: Schema.NonEmptyString,
  correct: Schema.Boolean,
  category: Schema.NonEmptyString,
  postcommitBase64: Schema.String.check(
    Schema.isPattern(/^[A-Za-z0-9+/]*={0,2}$/, { expected: "canonical base64 postcommit bytes" })
  ),
  postcommit: PostcommitQuestion
}) {}

export class SimulationHazardResult extends Schema.Class<SimulationHazardResult>(
  "@nycustodian/site/SimulationHazardResult"
)({
  kind: Schema.Literal("hazard"),
  questionId: Schema.NonEmptyString,
  mode: Schema.Literals(["visual", "nonvisual"]),
  category: Schema.NonEmptyString,
  hazardFamily: Schema.NullOr(Schema.NonEmptyString),
  answered: Schema.Boolean,
  correct: Schema.Boolean,
  targetCount: NonNegativeInt,
  hitCount: NonNegativeInt,
  missedCount: NonNegativeInt,
  decoyFalsePositiveCount: NonNegativeInt,
  falsePositiveCount: NonNegativeInt,
  duplicateCount: NonNegativeInt,
  retainedVisualAsset: Schema.NullOr(RetainedImageAsset),
  postcommitBase64: Schema.String.check(
    Schema.isPattern(/^[A-Za-z0-9+/]*={0,2}$/, { expected: "canonical base64 postcommit bytes" })
  ),
  postcommit: PostcommitScene
}) {}

export const SimulationResult = Schema.Union([
  SimulationQuestionResult,
  SimulationHazardResult
])

export type SimulationResult = typeof SimulationResult.Type

export class SimulationSubmissionRecord extends Schema.Class<SimulationSubmissionRecord>(
  "@nycustodian/site/SimulationSubmissionRecord"
)({
  schemaVersion: Schema.Literal(1),
  id: Schema.NonEmptyString,
  sessionId: SimulationId,
  status: Schema.Literals(["submitted", "evaluated"]),
  answers: Schema.NonEmptyArray(SimulationSubmittedAnswer),
  submittedAt: SimulationTimestamp,
  evaluatedAt: Schema.optionalKey(SimulationTimestamp),
  results: Schema.optionalKey(Schema.NonEmptyArray(SimulationResult)),
  correctCount: Schema.optionalKey(NonNegativeInt)
}) {}

export interface AssembleSimulationInput {
  readonly bootstrap: SimulationBootstrap
  readonly sessionId: string
  readonly profileId: string
  readonly format?: SimulationFormat
  readonly length: number
  readonly seed: string
  readonly selectedCategories: ReadonlyArray<string>
  readonly timing: SimulationTimingSettings
  readonly now: number
}

export interface EvaluateSimulationInput {
  readonly session: SimulationSessionRecord
  readonly submission: SimulationSubmissionRecord
  readonly postcommit: ReadonlyArray<
    Readonly<{
      readonly payload: typeof PostcommitQuestion.Type | typeof PostcommitScene.Type
      readonly postcommitBase64: string
    }>
  >
  readonly retainedVisualAssets?: ReadonlyArray<RetainedImageAsset>
}

export const simulationItemId = (item: SimulationPinnedItem): string =>
  "question" in item ? item.question.id : item.scene.id

export const simulationSubmissionId = (sessionId: string): string =>
  `${sessionId}:final`

export const simulationQuestionPath = (sessionId: string, position: number): string =>
  `/simulations/session/${encodeURIComponent(sessionId)}/question/${position}/`

export const simulationResultsPath = (sessionId: string): string =>
  `/simulations/session/${encodeURIComponent(sessionId)}/results/`

export const parseSimulationRoute = (pathname: string):
  | { readonly tag: "question"; readonly sessionId: string; readonly position: number }
  | { readonly tag: "results"; readonly sessionId: string }
  | undefined => {
  const question = /^\/simulations\/session\/(sim-[a-z0-9][a-z0-9-]{7,63})\/question\/([1-9][0-9]*)\/$/.exec(pathname)
  if (question !== null) {
    return { tag: "question", sessionId: question[1] as string, position: Number(question[2]) }
  }
  const results = /^\/simulations\/session\/(sim-[a-z0-9][a-z0-9-]{7,63})\/results\/$/.exec(pathname)
  if (results !== null) return { tag: "results", sessionId: results[1] as string }
  return undefined
}
