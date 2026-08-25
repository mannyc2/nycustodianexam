import { Schema } from "effect"
import { ContentSource } from "./authored-pack.ts"
import {
  ArtifactPathSegment,
  ContentLocale,
  Sha256
} from "./content-primitives.ts"
import {
  QuestionOption,
  QuestionOptionConceptMappings,
  QuestionRationale
} from "./question-artifacts.ts"
import {
  AcceptedSceneDecoy,
  AcceptedSceneTarget,
  FullSceneAccessibility,
  NeutralSceneAccessibility,
  NonvisualSceneStatement,
  ReleasedDerivativeAsset,
  SceneRegion
} from "./visual-release-inputs.ts"

export const CompiledVisualAsset = Schema.Struct({
  opaqueAssetId: ArtifactPathSegment,
  revision: Schema.Int,
  masterSha256: Sha256,
  derivatives: Schema.NonEmptyArray(ReleasedDerivativeAsset)
})

export const PublicProfile = Schema.Struct({
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  jurisdiction: Schema.NonEmptyString,
  series: Schema.Literal("entry-level-custodians-janitors"),
  compatibilityKey: Schema.NonEmptyString,
  disclaimer: Schema.NonEmptyString
})

export const CatalogTool = Schema.Struct({
  conceptId: Schema.NonEmptyString,
  canonicalTerm: Schema.NonEmptyString,
  family: Schema.NonEmptyString,
  sourceIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  useSummary: Schema.NonEmptyString,
  distinguishingFeatures: Schema.NonEmptyArray(Schema.NonEmptyString),
  confusableConceptIds: Schema.Array(Schema.NonEmptyString),
  neutralDescription: Schema.NonEmptyString,
  fullDescription: Schema.NonEmptyString,
  practiceEligibility: Schema.Literals(["text-question", "atlas-only"]),
  publicationGate: Schema.NullOr(Schema.NonEmptyString),
  asset: CompiledVisualAsset
})

export class CatalogArtifact extends Schema.Class<CatalogArtifact>(
  "@nycustodian/content/CatalogArtifact"
)({
  schemaVersion: Schema.Literal(1),
  packId: ArtifactPathSegment,
  version: Schema.Int,
  locale: ContentLocale,
  sources: Schema.NonEmptyArray(ContentSource),
  profiles: Schema.NonEmptyArray(PublicProfile),
  tools: Schema.NonEmptyArray(CatalogTool)
}) {}

export const PrecommitPackQuestion = Schema.Struct({
  id: ArtifactPathSegment,
  profileIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  prompt: Schema.NonEmptyString,
  options: Schema.NonEmptyArray(QuestionOption)
})

export const PrecommitScene = Schema.Struct({
  id: ArtifactPathSegment,
  environment: Schema.NonEmptyString,
  asset: CompiledVisualAsset,
  neutralPreAnswer: NeutralSceneAccessibility
})

export class PrecommitPackArtifact extends Schema.Class<PrecommitPackArtifact>(
  "@nycustodian/content/PrecommitPackArtifact"
)({
  schemaVersion: Schema.Literal(1),
  packId: ArtifactPathSegment,
  version: Schema.Int,
  locale: ContentLocale,
  profiles: Schema.NonEmptyArray(PublicProfile),
  questions: Schema.NonEmptyArray(PrecommitPackQuestion),
  scenes: Schema.NonEmptyArray(PrecommitScene)
}) {}

export const PostcommitPackQuestion = Schema.Struct({
  id: ArtifactPathSegment,
  optionConceptIds: QuestionOptionConceptMappings,
  correctOptionId: Schema.NonEmptyString,
  rationales: Schema.NonEmptyArray(QuestionRationale),
  sourceIds: Schema.NonEmptyArray(Schema.NonEmptyString)
})

export const PostcommitScene = Schema.Struct({
  id: Schema.NonEmptyString,
  opaqueAssetId: ArtifactPathSegment,
  kind: Schema.Literals(["positive", "zero-hazard"]),
  hazardFamily: Schema.NullOr(Schema.NonEmptyString),
  claim: Schema.NonEmptyString,
  sourceIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  targets: Schema.Array(AcceptedSceneTarget),
  decoys: Schema.NonEmptyArray(AcceptedSceneDecoy),
  targetRegions: Schema.Array(SceneRegion),
  decoyRegions: Schema.NonEmptyArray(SceneRegion),
  fullPostAnswer: FullSceneAccessibility,
  nonvisualZonedEquivalent: Schema.NonEmptyArray(NonvisualSceneStatement)
})

export class PostcommitPackArtifact extends Schema.Class<PostcommitPackArtifact>(
  "@nycustodian/content/PostcommitPackArtifact"
)({
  schemaVersion: Schema.Literal(1),
  packId: ArtifactPathSegment,
  version: Schema.Int,
  locale: ContentLocale,
  sources: Schema.NonEmptyArray(ContentSource),
  questions: Schema.NonEmptyArray(PostcommitPackQuestion),
  scenes: Schema.NonEmptyArray(PostcommitScene)
}) {}
