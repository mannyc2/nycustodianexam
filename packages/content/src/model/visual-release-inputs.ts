import { Schema } from "effect"
import {
  ArtifactPathSegment,
  RepositoryContentPath,
  Sha256
} from "./content-primitives.ts"
import {
  SourceReceipt,
  SupportedClaim
} from "./source-evidence.ts"

export const ReleasedMasterAsset = Schema.Struct({
  kind: Schema.NonEmptyString,
  path: RepositoryContentPath,
  bytes: Schema.Natural,
  sha256: Sha256
})

export const ReleasedDerivativeAsset = Schema.Struct({
  kind: Schema.Literals(["web", "phone", "print"]),
  path: RepositoryContentPath,
  bytes: Schema.Natural,
  sha256: Sha256
})

const ReleasedSceneDimensions = Schema.Struct({
  width: Schema.Natural,
  height: Schema.Natural,
  pixelFormat: Schema.Literals(["rgb24", "gray"])
})

const ReleasedSceneMasterAsset = Schema.Struct({
  kind: Schema.NonEmptyString,
  path: RepositoryContentPath,
  bytes: Schema.Natural,
  sha256: Sha256,
  dimensions: ReleasedSceneDimensions,
  settings: Schema.NonEmptyString
})

const ReleasedSceneDerivativeAsset = Schema.Struct({
  kind: Schema.Literals(["web", "phone", "print"]),
  path: RepositoryContentPath,
  bytes: Schema.Natural,
  sha256: Sha256,
  dimensions: ReleasedSceneDimensions,
  settings: Schema.NonEmptyString
})

export class AcceptedToolRelease extends Schema.Class<AcceptedToolRelease>(
  "@nycustodian/content/AcceptedToolRelease"
)({
  conceptId: Schema.NonEmptyString,
  canonicalTerm: Schema.NonEmptyString,
  opaqueAssetId: ArtifactPathSegment,
  assetRevision: Schema.Int,
  productionStatus: Schema.Literal("accepted"),
  master: ReleasedMasterAsset,
  derivatives: Schema.NonEmptyArray(ReleasedDerivativeAsset),
  publicationGate: Schema.NullOr(Schema.NonEmptyString)
}) {}

export const AcceptedToolReleaseLedger = Schema.Array(AcceptedToolRelease)

export const AcceptedComparisonMemberHash = Schema.Struct({
  conceptId: Schema.NonEmptyString,
  sha256: Sha256
})

export class AcceptedComparisonRelease extends Schema.Class<AcceptedComparisonRelease>(
  "@nycustodian/content/AcceptedComparisonRelease"
)({
  id: ArtifactPathSegment,
  opaqueAssetId: ArtifactPathSegment,
  assetRevision: Schema.Int,
  memberIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  memberMasterHashes: Schema.NonEmptyArray(AcceptedComparisonMemberHash),
  decisiveDistinction: Schema.NonEmptyString,
  status: Schema.Literal("accepted"),
  master: ReleasedMasterAsset,
  derivatives: Schema.NonEmptyArray(ReleasedDerivativeAsset),
  scoredUseGate: Schema.Array(Schema.NonEmptyString)
}) {}

export const AcceptedComparisonReleaseLedger = Schema.Array(AcceptedComparisonRelease)

export const NormalizedPoint = Schema.Tuple([Schema.Number, Schema.Number])
export const RegionPolygon = Schema.NonEmptyArray(NormalizedPoint).check(
  Schema.isMinLength(3)
)
export const RegionPolygons = Schema.NonEmptyArray(RegionPolygon)

export const NeutralSceneZone = Schema.Struct({
  order: Schema.Int,
  label: Schema.NonEmptyString,
  description: Schema.NonEmptyString
})

export const NeutralSceneAccessibility = Schema.Struct({
  overview: Schema.NonEmptyString,
  zones: Schema.NonEmptyArray(NeutralSceneZone),
  policy: Schema.NonEmptyString
})

export const AcceptedSceneTags = Schema.Struct({
  domain: Schema.Literal("health-and-safety"),
  family: Schema.Literal("hazard-scene"),
  environment: Schema.NonEmptyString,
  hazardCategory: Schema.NullOr(Schema.NonEmptyString),
  seriesScope: Schema.Literal("entry-level-custodians-janitors"),
  editorialDifficulty: Schema.Literal("application")
})

export const AcceptedSceneTarget = Schema.Struct({
  id: ArtifactPathSegment,
  zone: Schema.NonEmptyString,
  polygons: RegionPolygons,
  observableCondition: Schema.NonEmptyString,
  conceptIds: Schema.NonEmptyArray(ArtifactPathSegment),
  correctionCategory: ArtifactPathSegment,
  whyUnsafeClaimId: ArtifactPathSegment,
  likelyConsequenceClaimId: ArtifactPathSegment,
  immediateCorrectionClaimId: ArtifactPathSegment
})

export const AcceptedSceneDecoy = Schema.Struct({
  id: ArtifactPathSegment,
  zone: Schema.NonEmptyString,
  polygons: RegionPolygons,
  observableCondition: Schema.NonEmptyString,
  conceptIds: Schema.NonEmptyArray(ArtifactPathSegment),
  suspiciousBecause: Schema.NonEmptyString,
  safeAsDepictedClaimId: ArtifactPathSegment,
  unsafeIfClaimId: ArtifactPathSegment
})

export const AcceptedSceneSafeBackground = Schema.Struct({
  zone: Schema.NonEmptyString,
  observableCondition: Schema.NonEmptyString
})

export class AcceptedSceneRelease extends Schema.Class<AcceptedSceneRelease>(
  "@nycustodian/content/AcceptedSceneRelease"
)({
  schemaVersion: Schema.Literal(2),
  version: Schema.Literal(2),
  sceneId: ArtifactPathSegment,
  opaqueAssetId: ArtifactPathSegment,
  slot: Schema.Int,
  kind: Schema.Literals(["positive", "zero-hazard"]),
  hazardFamily: Schema.NullOr(Schema.NonEmptyString),
  environment: Schema.NonEmptyString,
  productionStatus: Schema.Literal("accepted"),
  independentReviewStatus: Schema.Literal("pass"),
  master: ReleasedSceneMasterAsset,
  derivatives: Schema.NonEmptyArray(ReleasedSceneDerivativeAsset),
  publicationGate: Schema.NullOr(Schema.NonEmptyString),
  tags: AcceptedSceneTags,
  neutralPreAnswer: NeutralSceneAccessibility,
  targets: Schema.Array(AcceptedSceneTarget),
  decoys: Schema.NonEmptyArray(AcceptedSceneDecoy),
  safeBackground: Schema.Array(AcceptedSceneSafeBackground),
  claims: Schema.NonEmptyArray(SupportedClaim),
  sources: Schema.NonEmptyArray(SourceReceipt)
}) {}

export const AcceptedSceneReleaseLedger = Schema.Array(AcceptedSceneRelease)
