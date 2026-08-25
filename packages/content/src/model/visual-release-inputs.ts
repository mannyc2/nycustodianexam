import { Schema } from "effect"
import {
  ArtifactPathSegment,
  RepositoryContentPath,
  Sha256
} from "./content-primitives.ts"

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

export const AcceptedSceneSource = Schema.Struct({
  id: Schema.NonEmptyString,
  title: Schema.NonEmptyString,
  url: Schema.NonEmptyString,
  locator: Schema.NonEmptyString,
  scope: Schema.NonEmptyString
})

export const AcceptedSceneTarget = Schema.Struct({
  id: Schema.NonEmptyString,
  condition: Schema.NonEmptyString,
  correction: Schema.NonEmptyString
})

export const AcceptedSceneDecoy = Schema.Struct({
  id: Schema.NonEmptyString,
  condition: Schema.NonEmptyString,
  safeBecause: Schema.NonEmptyString
})

export const AcceptedSceneSemanticManifest = Schema.Struct({
  claim: Schema.NonEmptyString,
  sources: Schema.NonEmptyArray(AcceptedSceneSource),
  targets: Schema.Array(AcceptedSceneTarget),
  decoys: Schema.NonEmptyArray(AcceptedSceneDecoy),
  safeBackground: Schema.Array(Schema.NonEmptyString)
})

export class AcceptedSceneRelease extends Schema.Class<AcceptedSceneRelease>(
  "@nycustodian/content/AcceptedSceneRelease"
)({
  sceneId: Schema.NonEmptyString,
  opaqueAssetId: ArtifactPathSegment,
  slot: Schema.Int,
  kind: Schema.Literals(["positive", "zero-hazard"]),
  hazardFamily: Schema.NullOr(Schema.NonEmptyString),
  environment: Schema.NonEmptyString,
  productionStatus: Schema.Literal("accepted"),
  independentReviewStatus: Schema.Literal("pass"),
  semanticManifest: AcceptedSceneSemanticManifest,
  master: ReleasedMasterAsset,
  derivatives: Schema.NonEmptyArray(ReleasedDerivativeAsset),
  publicationGate: Schema.NullOr(Schema.NonEmptyString)
}) {}

export const AcceptedSceneReleaseLedger = Schema.Array(AcceptedSceneRelease)

export const NormalizedPoint = Schema.Tuple([Schema.Number, Schema.Number])
export const RegionPolygon = Schema.NonEmptyArray(NormalizedPoint)
export const RegionPolygons = Schema.NonEmptyArray(RegionPolygon)

export const SceneRegion = Schema.Struct({
  inventoryId: Schema.NonEmptyString,
  polygons: RegionPolygons
})

export const SceneZone = Schema.Struct({
  order: Schema.Int,
  label: Schema.NonEmptyString
})

export class AcceptedSceneRegions extends Schema.Class<AcceptedSceneRegions>(
  "@nycustodian/content/AcceptedSceneRegions"
)({
  sceneId: Schema.NonEmptyString,
  opaqueAssetId: ArtifactPathSegment,
  masterSha256: Sha256,
  zoneOrder: Schema.NonEmptyArray(SceneZone),
  targetRegions: Schema.Array(SceneRegion),
  decoyRegions: Schema.NonEmptyArray(SceneRegion)
}) {}

export const AcceptedSceneRegionLedger = Schema.Array(AcceptedSceneRegions)

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

export const FullSceneTarget = Schema.Struct({
  condition: Schema.NonEmptyString,
  correction: Schema.NonEmptyString,
  sourceIds: Schema.NonEmptyArray(Schema.NonEmptyString)
})

export const FullSceneDecoy = Schema.Struct({
  condition: Schema.NonEmptyString,
  safeBecause: Schema.NonEmptyString
})

export const FullSceneAccessibility = Schema.Struct({
  claim: Schema.NonEmptyString,
  targets: Schema.Array(FullSceneTarget),
  decoys: Schema.NonEmptyArray(FullSceneDecoy),
  safeBackground: Schema.Array(Schema.NonEmptyString),
  sources: Schema.NonEmptyArray(AcceptedSceneSource)
})

export const NonvisualSceneStatement = Schema.Struct({
  zone: Schema.NonEmptyString,
  role: Schema.Literals(["target", "decoy", "safe-background"]),
  statement: Schema.NonEmptyString
})

export class AcceptedSceneAccessibility extends Schema.Class<AcceptedSceneAccessibility>(
  "@nycustodian/content/AcceptedSceneAccessibility"
)({
  sceneId: Schema.NonEmptyString,
  opaqueAssetId: ArtifactPathSegment,
  neutralPreAnswer: NeutralSceneAccessibility,
  fullPostAnswer: FullSceneAccessibility,
  nonvisualZonedEquivalent: Schema.NonEmptyArray(NonvisualSceneStatement)
}) {}

export const AcceptedSceneAccessibilityLedger = Schema.Array(AcceptedSceneAccessibility)
