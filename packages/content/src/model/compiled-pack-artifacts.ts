import { Schema } from "effect"
import {
  AnnouncementProfileFactSheet,
  ProfileCanonicalPath
} from "./authored-pack.ts"
import {
  ContentSource,
  SourceLine,
  SupportedClaim
} from "./source-evidence.ts"
import {
  AuthoredQuestionTags,
  PracticeSetLength,
  QuestionFactKind,
  SafeQuestionMembership
} from "./question-metadata.ts"
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
  version: Schema.Int,
  label: Schema.NonEmptyString,
  jurisdiction: Schema.NonEmptyString,
  canonicalPath: ProfileCanonicalPath,
  layer: Schema.Literals(["statewide-series", "jurisdiction"]),
  parentProfileId: Schema.NullOr(Schema.NonEmptyString),
  audience: Schema.NonEmptyString,
  scopeNotes: Schema.NonEmptyArray(Schema.NonEmptyString),
  announcementFactSheet: Schema.NullOr(AnnouncementProfileFactSheet),
  examIdentityState: Schema.Literals(["verified", "not_published", "unverified", "conflicting", "superseded", "not_applicable"]),
  examIdentities: Schema.Array(Schema.Struct({
    examNumber: Schema.NonEmptyString,
    title: Schema.NonEmptyString,
    competitionType: Schema.Literals(["open-competitive", "promotion"]),
    sourceLineIds: Schema.NonEmptyArray(ArtifactPathSegment)
  })),
  competitionTypeState: Schema.Literals(["verified", "not_published", "unverified", "conflicting", "superseded", "not_applicable"]),
  competitionTypes: Schema.Array(Schema.Literals(["open-competitive", "promotion"])),
  seriesLevel: Schema.Literal("entry-level"),
  testPlanCompatibility: Schema.Struct({
    status: Schema.Literals(["compatible", "unverified", "incompatible"]),
    compatibilityKey: Schema.NonEmptyString,
    detail: Schema.NonEmptyString,
    sourceLineIds: Schema.Array(ArtifactPathSegment)
  }),
  contentAvailability: Schema.Struct({
    status: Schema.Literals(["available", "limited", "unavailable"]),
    detail: Schema.NonEmptyString,
    lastVerifiedOn: Schema.String.check(
      Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { expected: "an ISO calendar date" })
    )
  }),
  sourceIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  series: Schema.Literal("entry-level-custodians-janitors"),
  compatibilityKey: Schema.NonEmptyString,
  disclaimer: Schema.NonEmptyString
})

export const CatalogTool = Schema.Struct({
  conceptId: Schema.NonEmptyString,
  domain: Schema.NonEmptyString,
  canonicalTerm: Schema.NonEmptyString,
  family: Schema.NonEmptyString,
  evidenceTier: Schema.NonEmptyString,
  scopeStatus: Schema.Literals(["entry-level-supported", "watchlist-or-gated"]),
  sourceIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  useClaimId: ArtifactPathSegment,
  featureClaimId: ArtifactPathSegment,
  useSummary: Schema.NonEmptyString,
  distinguishingFeatures: Schema.NonEmptyArray(Schema.NonEmptyString),
  confusableConceptIds: Schema.Array(Schema.NonEmptyString),
  neutralDescription: Schema.NonEmptyString,
  fullDescription: Schema.NonEmptyString,
  practiceEligibility: Schema.Literals(["text-question", "atlas-only"]),
  publicationGate: Schema.NullOr(Schema.NonEmptyString),
  asset: CompiledVisualAsset
})

export const CatalogComparison = Schema.Struct({
  id: ArtifactPathSegment,
  memberIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  decisiveDistinction: Schema.NonEmptyString,
  scoredUseGate: Schema.Array(Schema.NonEmptyString),
  sourceIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  asset: CompiledVisualAsset
})

export const PracticeCapacityRecord = Schema.Struct({
  profileId: Schema.NonEmptyString,
  filterKind: Schema.Literals(["all", "domain", "family", "confusion-set"]),
  filterValue: Schema.NonEmptyString,
  questionCount: Schema.Natural,
  availableSetLengths: Schema.Array(PracticeSetLength)
})

export const CatalogPracticeCapacity = Schema.Struct({
  advertisedSetLengths: Schema.NonEmptyArray(PracticeSetLength),
  records: Schema.NonEmptyArray(PracticeCapacityRecord)
})

export class CatalogArtifact extends Schema.Class<CatalogArtifact>(
  "@nycustodian/content/CatalogArtifact"
)({
  schemaVersion: Schema.Literal(1),
  packId: ArtifactPathSegment,
  version: Schema.Int,
  locale: ContentLocale,
  sources: Schema.NonEmptyArray(ContentSource),
  sourceLines: Schema.Array(SourceLine),
  profiles: Schema.NonEmptyArray(PublicProfile),
  tools: Schema.NonEmptyArray(CatalogTool),
  comparisons: Schema.Array(CatalogComparison),
  practiceCapacity: CatalogPracticeCapacity
}) {}

export const PrecommitPackQuestion = Schema.Struct({
  id: ArtifactPathSegment,
  version: Schema.Int,
  profileIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  prompt: Schema.NonEmptyString,
  options: Schema.NonEmptyArray(QuestionOption),
  memberships: Schema.Array(SafeQuestionMembership)
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
  version: Schema.Int,
  optionConceptIds: QuestionOptionConceptMappings,
  correctOptionId: Schema.NonEmptyString,
  rationales: Schema.NonEmptyArray(QuestionRationale),
  claimIds: Schema.NonEmptyArray(ArtifactPathSegment),
  tags: AuthoredQuestionTags,
  objectiveId: ArtifactPathSegment,
  equivalenceGroupId: ArtifactPathSegment,
  factKind: QuestionFactKind
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
  sourceLines: Schema.NonEmptyArray(SourceLine),
  claims: Schema.NonEmptyArray(SupportedClaim),
  questions: Schema.NonEmptyArray(PostcommitPackQuestion),
  scenes: Schema.NonEmptyArray(PostcommitScene)
}) {}
