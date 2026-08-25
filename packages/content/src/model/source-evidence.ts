import { Schema } from "effect"
import {
  ArtifactPathSegment,
  ContentLocale
} from "./content-primitives.ts"

export const SourceEvidenceTier = Schema.Literals([
  "official-primary",
  "official-primary-synthesis",
  "maintained-editorial-synthesis",
  "accepted-release-record"
])

export class ContentSource extends Schema.Class<ContentSource>(
  "@nycustodian/content/ContentSource"
)({
  id: Schema.NonEmptyString,
  title: Schema.NonEmptyString,
  publisher: Schema.NonEmptyString,
  evidenceTier: SourceEvidenceTier,
  version: Schema.NonEmptyString,
  locator: Schema.NonEmptyString,
  scope: Schema.NonEmptyString,
  rightsNotes: Schema.NonEmptyString,
  url: Schema.optionalKey(Schema.NonEmptyString)
}) {}

export class SourceLine extends Schema.Class<SourceLine>(
  "@nycustodian/content/SourceLine"
)({
  id: ArtifactPathSegment,
  sourceId: Schema.NonEmptyString,
  locator: Schema.NonEmptyString,
  excerpt: Schema.NonEmptyString,
  language: ContentLocale,
  verifiedOn: Schema.String.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { expected: "an ISO calendar date" })
  ),
  supportedClaimIds: Schema.NonEmptyArray(ArtifactPathSegment)
}) {}

export class SupportedClaim extends Schema.Class<SupportedClaim>(
  "@nycustodian/content/SupportedClaim"
)({
  id: ArtifactPathSegment,
  text: Schema.NonEmptyString,
  sourceLineIds: Schema.NonEmptyArray(ArtifactPathSegment),
  evidenceTier: SourceEvidenceTier,
  caveat: Schema.NullOr(Schema.NonEmptyString)
}) {}

/**
 * A self-contained, offline-safe source-line receipt. Individual postcommit
 * artifacts carry these instead of depending on an external source remaining
 * reachable.
 */
export class SourceReceipt extends Schema.Class<SourceReceipt>(
  "@nycustodian/content/SourceReceipt"
)({
  id: ArtifactPathSegment,
  sourceId: Schema.NonEmptyString,
  title: Schema.NonEmptyString,
  publisher: Schema.NonEmptyString,
  evidenceTier: SourceEvidenceTier,
  version: Schema.NonEmptyString,
  rightsNotes: Schema.NonEmptyString,
  locator: Schema.NonEmptyString,
  excerpt: Schema.NonEmptyString,
  language: ContentLocale,
  verifiedOn: Schema.String.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { expected: "an ISO calendar date" })
  ),
  supportedClaimIds: Schema.NonEmptyArray(ArtifactPathSegment),
  url: Schema.optionalKey(Schema.NonEmptyString)
}) {}
