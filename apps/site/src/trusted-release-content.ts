import { ArtifactPathSegment } from "@nycustodian/content/model"
import { Schema } from "effect"
import {
  HazardAttemptReceipt,
  QuestionAttemptReceipt,
  type HazardAttemptReceipt as HazardAttemptReceiptValue,
  type QuestionAttemptReceipt as QuestionAttemptReceiptValue
} from "./attempt-receipt.ts"
import {
  AssetContentReceipt,
  PostcommitContentReceipt,
  type AssetContentReceipt as AssetContentReceiptValue,
  type PostcommitContentReceipt as PostcommitContentReceiptValue
} from "./verified-content.ts"

const PositiveInteger = Schema.Int.check(
  Schema.makeFilter((value) => value > 0 ? undefined : "a positive integer")
)

const UniqueOptionIds = Schema.NonEmptyArray(ArtifactPathSegment).check(
  Schema.makeFilter((optionIds) =>
    new Set(optionIds).size === optionIds.length
      ? undefined
      : "a unique, ordered option-id closure"
  )
)

const UniqueZoneOrders = Schema.NonEmptyArray(Schema.Natural).check(
  Schema.makeFilter((orders) =>
    new Set(orders).size === orders.length
      ? undefined
      : "a unique, ordered allowed-zone closure"
  )
)

const registryCoordinate = {
  releaseId: ArtifactPathSegment,
  packVersion: PositiveInteger,
  itemId: ArtifactPathSegment
} as const

export const TrustedQuestionContentEntry = Schema.Struct({
  ...registryCoordinate,
  variant: Schema.Literal("question"),
  postcommitReceipt: PostcommitContentReceipt,
  optionIds: UniqueOptionIds
})

export type TrustedQuestionContentEntry = typeof TrustedQuestionContentEntry.Type

const trustedHazardFields = {
  ...registryCoordinate,
  postcommitReceipt: PostcommitContentReceipt,
  allowedZoneOrders: UniqueZoneOrders,
  assetRevision: PositiveInteger,
  assetMasterSha256: Schema.String.check(
    Schema.isPattern(/^[a-f0-9]{64}$/, { expected: "a lowercase SHA-256 digest" })
  )
} as const

export const TrustedVisualHazardContentEntry = Schema.Struct({
  ...trustedHazardFields,
  variant: Schema.Literal("hazard-visual"),
  mode: Schema.Literal("visual"),
  visualAssetReceipt: AssetContentReceipt
})

export type TrustedVisualHazardContentEntry = typeof TrustedVisualHazardContentEntry.Type

export const TrustedNonvisualHazardContentEntry = Schema.Struct({
  ...trustedHazardFields,
  variant: Schema.Literal("hazard-nonvisual"),
  mode: Schema.Literal("nonvisual"),
  visualAssetReceipt: Schema.Null
})

export type TrustedNonvisualHazardContentEntry =
  typeof TrustedNonvisualHazardContentEntry.Type

export const TrustedReleaseContentEntry = Schema.Union([
  TrustedQuestionContentEntry,
  TrustedVisualHazardContentEntry,
  TrustedNonvisualHazardContentEntry
])

export type TrustedReleaseContentEntry = typeof TrustedReleaseContentEntry.Type

export const TrustedReleaseContentVariant = Schema.Literals([
  "question",
  "hazard-visual",
  "hazard-nonvisual"
])

export type TrustedReleaseContentVariant = typeof TrustedReleaseContentVariant.Type

export const TrustedReleaseContentCoordinate = Schema.Struct({
  ...registryCoordinate,
  variant: TrustedReleaseContentVariant
})

export type TrustedReleaseContentCoordinate = typeof TrustedReleaseContentCoordinate.Type

export class TrustedReleaseContentRegistry extends Schema.Class<TrustedReleaseContentRegistry>(
  "@nycustodian/site/TrustedReleaseContentRegistry"
)({
  schemaVersion: Schema.Literal(1),
  scope: Schema.Literal("trusted-release-content-registry"),
  entries: Schema.NonEmptyArray(TrustedReleaseContentEntry)
}) {}

export type TrustedReleaseContentFailureReason =
  | "unknown-coordinate"
  | "receipt-mismatch"
  | "option-closure-mismatch"
  | "hazard-closure-mismatch"
  | "visual-asset-receipt-mismatch"

export class TrustedReleaseContentError extends Error {
  readonly _tag = "TrustedReleaseContentError"

  constructor(
    readonly reason: TrustedReleaseContentFailureReason,
    readonly key: string,
    detail: string
  ) {
    super(detail)
    this.name = "TrustedReleaseContentError"
  }
}

const sameStrings = (left: readonly string[], right: readonly string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const sameNumbers = (left: readonly number[], right: readonly number[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index])

const samePostcommitReceipt = (
  left: PostcommitContentReceiptValue,
  right: PostcommitContentReceiptValue
): boolean =>
  left.postcommitPath === right.postcommitPath &&
  left.postcommitBytes === right.postcommitBytes &&
  left.postcommitSha256 === right.postcommitSha256

const sameAssetReceipt = (
  left: AssetContentReceiptValue,
  right: AssetContentReceiptValue
): boolean =>
  left.path === right.path &&
  left.bytes === right.bytes &&
  left.sha256 === right.sha256

export const trustedReleaseContentKey = (
  coordinate: TrustedReleaseContentCoordinate
): string =>
  `${coordinate.releaseId}:v${coordinate.packVersion}:${coordinate.variant}:${coordinate.itemId}`

const expectedPostcommitPath = (entry: TrustedReleaseContentEntry): string =>
  entry.variant === "question"
    ? `/content/vertical-slice/questions/${entry.itemId}.postcommit.json`
    : `/content/vertical-slice/scenes/${entry.itemId}.postcommit.json`

const assertClosedRegistry = (
  registry: TrustedReleaseContentRegistry
): TrustedReleaseContentRegistry => {
  const entriesByKey = new Map<string, TrustedReleaseContentEntry>()
  const hazardPairs = new Map<
    string,
    Partial<{
      visual: TrustedVisualHazardContentEntry
      nonvisual: TrustedNonvisualHazardContentEntry
    }>
  >()

  for (const entry of registry.entries) {
    const key = trustedReleaseContentKey(entry)
    if (entriesByKey.has(key)) {
      throw new Error(`Trusted release-content registry contains duplicate key ${key}`)
    }
    entriesByKey.set(key, entry)

    if (entry.postcommitReceipt.postcommitPath !== expectedPostcommitPath(entry)) {
      throw new Error(`Trusted release-content registry contains a non-canonical path for ${key}`)
    }
    if (entry.variant === "question") continue

    const pairKey = `${entry.releaseId}:v${entry.packVersion}:hazard:${entry.itemId}`
    const pair = hazardPairs.get(pairKey) ?? {}
    if (entry.variant === "hazard-visual") {
      pair.visual = entry
    } else {
      pair.nonvisual = entry
    }
    hazardPairs.set(pairKey, pair)
  }

  for (const [pairKey, pair] of hazardPairs) {
    if (pair.visual === undefined || pair.nonvisual === undefined) {
      throw new Error(`Trusted release-content registry has an incomplete mode pair for ${pairKey}`)
    }
    if (
      !samePostcommitReceipt(pair.visual.postcommitReceipt, pair.nonvisual.postcommitReceipt) ||
      !sameNumbers(pair.visual.allowedZoneOrders, pair.nonvisual.allowedZoneOrders) ||
      pair.visual.assetRevision !== pair.nonvisual.assetRevision ||
      pair.visual.assetMasterSha256 !== pair.nonvisual.assetMasterSha256
    ) {
      throw new Error(`Trusted release-content registry has a divergent mode pair for ${pairKey}`)
    }
  }

  return registry
}

export const decodeTrustedReleaseContentRegistry = (
  value: unknown
): TrustedReleaseContentRegistry =>
  assertClosedRegistry(
    Schema.decodeUnknownSync(
      TrustedReleaseContentRegistry,
      { onExcessProperty: "error" }
    )(value)
  )

export const findTrustedReleaseContentEntry = (
  registry: TrustedReleaseContentRegistry,
  coordinate: TrustedReleaseContentCoordinate
): TrustedReleaseContentEntry | undefined => {
  const key = trustedReleaseContentKey(coordinate)
  return registry.entries.find((entry) => trustedReleaseContentKey(entry) === key)
}

export const requireTrustedReleaseContentEntry = (
  registry: TrustedReleaseContentRegistry,
  coordinate: TrustedReleaseContentCoordinate
): TrustedReleaseContentEntry => {
  const entry = findTrustedReleaseContentEntry(registry, coordinate)
  if (entry !== undefined) return entry
  const key = trustedReleaseContentKey(coordinate)
  throw new TrustedReleaseContentError(
    "unknown-coordinate",
    key,
    `No trusted release content is registered for ${key}`
  )
}

export interface TrustedQuestionContentBinding {
  readonly receipt: QuestionAttemptReceiptValue
  readonly optionIds: ReadonlyArray<string>
}

export const verifyTrustedQuestionContent = (
  registry: TrustedReleaseContentRegistry,
  input: TrustedQuestionContentBinding
): TrustedQuestionContentEntry => {
  const receipt = Schema.decodeUnknownSync(
    QuestionAttemptReceipt,
    { onExcessProperty: "error" }
  )(input.receipt)
  const optionIds = Schema.decodeUnknownSync(
    UniqueOptionIds,
    { onExcessProperty: "error" }
  )(input.optionIds)
  const coordinate = {
    releaseId: receipt.releaseId,
    packVersion: receipt.packVersion,
    variant: "question",
    itemId: receipt.questionId
  } as const
  const key = trustedReleaseContentKey(coordinate)
  const entry = requireTrustedReleaseContentEntry(registry, coordinate)
  if (entry.variant !== "question") {
    throw new TrustedReleaseContentError(
      "unknown-coordinate",
      key,
      `Trusted release content ${key} is not a question entry`
    )
  }
  if (!samePostcommitReceipt(entry.postcommitReceipt, {
    postcommitPath: receipt.postcommitPath,
    postcommitBytes: receipt.postcommitBytes,
    postcommitSha256: receipt.postcommitSha256
  })) {
    throw new TrustedReleaseContentError(
      "receipt-mismatch",
      key,
      `Question content receipt does not match trusted release content ${key}`
    )
  }
  if (!sameStrings(entry.optionIds, optionIds)) {
    throw new TrustedReleaseContentError(
      "option-closure-mismatch",
      key,
      `Question option closure does not match trusted release content ${key}`
    )
  }
  return entry
}

export interface TrustedHazardContentBinding {
  readonly receipt: HazardAttemptReceiptValue
  readonly allowedZoneOrders: ReadonlyArray<number>
  readonly visualAssetReceipt?: AssetContentReceiptValue | null
}

export const verifyTrustedHazardContent = (
  registry: TrustedReleaseContentRegistry,
  input: TrustedHazardContentBinding
): TrustedVisualHazardContentEntry | TrustedNonvisualHazardContentEntry => {
  const receipt = Schema.decodeUnknownSync(
    HazardAttemptReceipt,
    { onExcessProperty: "error" }
  )(input.receipt)
  const allowedZoneOrders = Schema.decodeUnknownSync(
    UniqueZoneOrders,
    { onExcessProperty: "error" }
  )(input.allowedZoneOrders)
  const variant = receipt.mode === "visual" ? "hazard-visual" : "hazard-nonvisual"
  const coordinate = {
    releaseId: receipt.releaseId,
    packVersion: receipt.packVersion,
    variant,
    itemId: receipt.sceneId
  } as const
  const key = trustedReleaseContentKey(coordinate)
  const entry = requireTrustedReleaseContentEntry(registry, coordinate)
  if (entry.variant !== variant) {
    throw new TrustedReleaseContentError(
      "unknown-coordinate",
      key,
      `Trusted release content ${key} is not a ${variant} entry`
    )
  }
  if (!samePostcommitReceipt(entry.postcommitReceipt, {
    postcommitPath: receipt.postcommitPath,
    postcommitBytes: receipt.postcommitBytes,
    postcommitSha256: receipt.postcommitSha256
  })) {
    throw new TrustedReleaseContentError(
      "receipt-mismatch",
      key,
      `Hazard content receipt does not match trusted release content ${key}`
    )
  }
  if (
    entry.mode !== receipt.mode ||
    !sameNumbers(entry.allowedZoneOrders, allowedZoneOrders) ||
    entry.assetRevision !== receipt.assetRevision ||
    entry.assetMasterSha256 !== receipt.assetMasterSha256
  ) {
    throw new TrustedReleaseContentError(
      "hazard-closure-mismatch",
      key,
      `Hazard mode, zones, or asset master do not match trusted release content ${key}`
    )
  }

  const suppliedAssetReceipt = input.visualAssetReceipt
  if (entry.variant === "hazard-nonvisual") {
    if (suppliedAssetReceipt !== undefined && suppliedAssetReceipt !== null) {
      throw new TrustedReleaseContentError(
        "visual-asset-receipt-mismatch",
        key,
        `Nonvisual hazard content ${key} cannot bind a visual asset receipt`
      )
    }
    return entry
  }
  if (suppliedAssetReceipt !== undefined && suppliedAssetReceipt !== null) {
    const decodedAssetReceipt = Schema.decodeUnknownSync(
      AssetContentReceipt,
      { onExcessProperty: "error" }
    )(suppliedAssetReceipt)
    if (!sameAssetReceipt(entry.visualAssetReceipt, decodedAssetReceipt)) {
      throw new TrustedReleaseContentError(
        "visual-asset-receipt-mismatch",
        key,
        `Visual asset receipt does not match trusted release content ${key}`
      )
    }
  }
  return entry
}

export const canonicalTrustedReleaseContentRegistryJson = (
  registry: TrustedReleaseContentRegistry
): string => {
  const decoded = decodeTrustedReleaseContentRegistry(registry)
  const entries = [...decoded.entries].sort((left, right) => {
    const leftKey = trustedReleaseContentKey(left)
    const rightKey = trustedReleaseContentKey(right)
    return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0
  })
  return JSON.stringify({
    schemaVersion: decoded.schemaVersion,
    scope: decoded.scope,
    entries
  })
}
