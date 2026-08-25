import { Schema } from "effect"
import { ArtifactPathSegment, ContentLocale } from "./content-primitives.ts"
import { QuestionRationale } from "./question-artifacts.ts"
import {
  ContentSource,
  SourceLine,
  SupportedClaim
} from "./source-evidence.ts"
import {
  AuthoredQuestionCapacity,
  AuthoredQuestionTags,
  PracticeSetLength,
  QuestionDomain,
  QuestionReviewReceipt
} from "./question-metadata.ts"

export {
  AuthoredQuestionCapacity,
  AuthoredQuestionTags,
  EditorialDifficulty,
  PracticeSetLength,
  QuestionDomain,
  QuestionFactKind,
  QuestionReviewReceipt,
  SafeQuestionMembership
} from "./question-metadata.ts"

export const ProfileCanonicalPath = Schema.String.check(
  Schema.isPattern(/^\/(?:[a-z0-9][a-z0-9-]*\/)*$/, {
    expected: "an absolute lowercase canonical directory path"
  })
)

export { ContentSource, SourceLine, SupportedClaim } from "./source-evidence.ts"

export const AnnouncementProfileFactState = Schema.Literals([
  "verified",
  "not_published",
  "unverified",
  "conflicting",
  "superseded",
  "not_applicable"
])

export const AnnouncementProfileFactKind = Schema.Literals([
  "filing_period",
  "exam_date",
  "fee",
  "jurisdictions",
  "qualifications",
  "subjects",
  "medium",
  "counts",
  "weights",
  "scoring",
  "review",
  "form_identity",
  "seniority_credit",
  "preparer_identity",
  "administration_status"
])

export const AnnouncementProfileConflictValue = Schema.Struct({
  value: Schema.NonEmptyString,
  sourceLineIds: Schema.NonEmptyArray(ArtifactPathSegment)
})

/**
 * A single mutable announcement fact. Nullable fields are deliberate: the
 * compiler applies state-specific invariants so unavailable, conflicting, and
 * superseded facts cannot be flattened into a guessed string.
 */
export const AnnouncementProfileFact = Schema.Struct({
  id: ArtifactPathSegment,
  category: AnnouncementProfileFactKind,
  label: Schema.NonEmptyString,
  state: AnnouncementProfileFactState,
  appliesToExamNumbers: Schema.Array(Schema.NonEmptyString),
  value: Schema.NullOr(Schema.NonEmptyString),
  detail: Schema.NullOr(Schema.NonEmptyString),
  reviewedOn: Schema.String.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { expected: "an ISO calendar date" })
  ),
  effectiveFrom: Schema.NullOr(Schema.String.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { expected: "an ISO calendar date" })
  )),
  effectiveThrough: Schema.NullOr(Schema.String.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { expected: "an ISO calendar date" })
  )),
  sourceLineIds: Schema.Array(ArtifactPathSegment),
  conflictingValues: Schema.Array(AnnouncementProfileConflictValue),
  supersededByFactId: Schema.NullOr(ArtifactPathSegment)
})

// Kept as a public compatibility alias while fact sheets move to the complete
// six-state wrapper above.
export const AnnouncementProfileUnknown = AnnouncementProfileFact

export const AnnouncementProfileChange = Schema.Struct({
  version: Schema.Int,
  changedOn: Schema.String.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { expected: "an ISO calendar date" })
  ),
  summary: Schema.NonEmptyString,
  sourceLineIds: Schema.NonEmptyArray(ArtifactPathSegment)
})

export class AnnouncementProfileFactSheet extends Schema.Class<AnnouncementProfileFactSheet>(
  "@nycustodian/content/AnnouncementProfileFactSheet"
)({
  schemaVersion: Schema.Literal(2),
  version: Schema.Int,
  lastReviewedOn: Schema.String.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { expected: "an ISO calendar date" })
  ),
  controllingDocumentNotice: Schema.NonEmptyString,
  seriesScopeDisclaimer: Schema.NonEmptyString,
  facts: Schema.NonEmptyArray(AnnouncementProfileFact),
  changeHistory: Schema.NonEmptyArray(AnnouncementProfileChange)
}) {}

export const ProfileCompetitionType = Schema.Literals([
  "open-competitive",
  "promotion"
])

export const ProfileExamIdentity = Schema.Struct({
  examNumber: Schema.NonEmptyString,
  title: Schema.NonEmptyString,
  competitionType: ProfileCompetitionType,
  sourceLineIds: Schema.NonEmptyArray(ArtifactPathSegment)
})

export const ProfileTestPlanCompatibility = Schema.Struct({
  status: Schema.Literals(["compatible", "unverified", "incompatible"]),
  compatibilityKey: Schema.NonEmptyString,
  detail: Schema.NonEmptyString,
  sourceLineIds: Schema.Array(ArtifactPathSegment)
})

export const ProfileContentAvailability = Schema.Struct({
  status: Schema.Literals(["available", "limited", "unavailable"]),
  detail: Schema.NonEmptyString,
  lastVerifiedOn: Schema.String.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { expected: "an ISO calendar date" })
  )
})

export class AuthoredProfile extends Schema.Class<AuthoredProfile>(
  "@nycustodian/content/AuthoredProfile"
)({
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
  examIdentityState: AnnouncementProfileFactState,
  examIdentities: Schema.Array(ProfileExamIdentity),
  competitionTypeState: AnnouncementProfileFactState,
  competitionTypes: Schema.Array(ProfileCompetitionType),
  seriesLevel: Schema.Literal("entry-level"),
  testPlanCompatibility: ProfileTestPlanCompatibility,
  contentAvailability: ProfileContentAvailability,
  series: Schema.Literal("entry-level-custodians-janitors"),
  compatibilityKey: Schema.NonEmptyString,
  disclaimer: Schema.NonEmptyString,
  sourceIds: Schema.NonEmptyArray(Schema.NonEmptyString)
}) {}

export class AuthoredTool extends Schema.Class<AuthoredTool>(
  "@nycustodian/content/AuthoredTool"
)({
  conceptId: Schema.NonEmptyString,
  domain: QuestionDomain,
  family: Schema.NonEmptyString,
  evidenceTier: Schema.Literals([
    "A",
    "A/A-B overlap",
    "A/B",
    "B",
    "B/C",
    "A visual/C operational"
  ]),
  scopeStatus: Schema.Literals(["entry-level-supported", "watchlist-or-gated"]),
  sourceIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  useClaimId: ArtifactPathSegment,
  featureClaimId: ArtifactPathSegment,
  useSummary: Schema.NonEmptyString,
  distinguishingFeatures: Schema.NonEmptyArray(Schema.NonEmptyString),
  confusableConceptIds: Schema.Array(Schema.NonEmptyString),
  neutralDescription: Schema.NonEmptyString,
  fullDescription: Schema.NonEmptyString,
  practiceEligibility: Schema.Literals(["text-question", "atlas-only"])
}) {}

export class AuthoredPackQuestionOption extends Schema.Class<AuthoredPackQuestionOption>(
  "@nycustodian/content/AuthoredPackQuestionOption"
)({
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  conceptId: Schema.NonEmptyString
}) {}

export class AuthoredPackQuestion extends Schema.Class<AuthoredPackQuestion>(
  "@nycustodian/content/AuthoredPackQuestion"
)({
  id: ArtifactPathSegment,
  version: Schema.Int,
  profileIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  prompt: Schema.NonEmptyString,
  options: Schema.NonEmptyArray(AuthoredPackQuestionOption),
  correctOptionId: Schema.NonEmptyString,
  rationales: Schema.NonEmptyArray(QuestionRationale),
  claimIds: Schema.NonEmptyArray(ArtifactPathSegment),
  tags: AuthoredQuestionTags,
  capacity: AuthoredQuestionCapacity,
  originalContentAttestation: Schema.Literal(true),
  reviewReceipt: QuestionReviewReceipt
}) {}

export class AuthoredContentPack extends Schema.Class<AuthoredContentPack>(
  "@nycustodian/content/AuthoredContentPack"
)({
  schemaVersion: Schema.Literal(1),
  packId: ArtifactPathSegment,
  version: Schema.Int,
  locale: ContentLocale,
  sources: Schema.NonEmptyArray(ContentSource),
  sourceLines: Schema.NonEmptyArray(SourceLine),
  claims: Schema.NonEmptyArray(SupportedClaim),
  profiles: Schema.NonEmptyArray(AuthoredProfile),
  tools: Schema.NonEmptyArray(AuthoredTool),
  comparisonIds: Schema.Array(ArtifactPathSegment),
  comparisonSourceIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  advertisedPracticeLengths: Schema.NonEmptyArray(PracticeSetLength),
  questions: Schema.NonEmptyArray(AuthoredPackQuestion),
  sceneIds: Schema.NonEmptyArray(Schema.NonEmptyString)
}) {}
