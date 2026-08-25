import {
  ClientReceiptId,
  CorrectionCategory,
  CorrectionReport,
  type CorrectionReportValue
} from "@nycustodian/correction-intake"
import { Schema } from "effect"

const DraftText = Schema.String.check(
  Schema.makeFilter((value) =>
    value.length <= 8_000 ? undefined : "draft text must be at most 8000 characters"
  )
)

const DraftSummary = Schema.String.check(
  Schema.makeFilter((value) =>
    value.length <= 240 ? undefined : "draft summary must be at most 240 characters"
  )
)

export class CorrectionDraftRecord extends Schema.Class<CorrectionDraftRecord>(
  "@nycustodian/site/corrections/CorrectionDraftRecord"
)({
  id: ClientReceiptId,
  schemaVersion: Schema.Literal(1),
  category: CorrectionCategory,
  pagePath: DraftText,
  contentId: DraftText,
  profileId: DraftText,
  packId: DraftText,
  packVersion: Schema.Union([Schema.Natural, Schema.Null]),
  summary: DraftSummary,
  details: DraftText,
  publicSourceUrl: DraftText,
  affirmsNoSecureExamMaterial: Schema.Boolean,
  submissionState: Schema.Literals(["draft", "accepted"]),
  updatedAt: Schema.Number,
  acceptedAt: Schema.Union([Schema.Number, Schema.Null])
}) {}

export const decodeStoredCorrectionDraft = (record: unknown): CorrectionDraftRecord => {
  const draft = Schema.decodeUnknownSync(
    CorrectionDraftRecord,
    { onExcessProperty: "error" }
  )(record)
  if (
    !Number.isFinite(draft.updatedAt) ||
    draft.updatedAt < 0 ||
    (draft.submissionState === "accepted") !== (draft.acceptedAt !== null) ||
    (draft.acceptedAt !== null && (
      !Number.isFinite(draft.acceptedAt) ||
      draft.acceptedAt < 0 ||
      draft.acceptedAt > draft.updatedAt
    ))
  ) {
    throw new Error("A saved correction draft has an invalid durable state closure")
  }
  return draft
}

export const emptyCorrectionDraft = (
  id: string,
  pagePath = "/"
): CorrectionDraftRecord => new CorrectionDraftRecord({
  id,
  schemaVersion: 1,
  category: "fact",
  pagePath,
  contentId: "",
  profileId: "",
  packId: "",
  packVersion: null,
  summary: "",
  details: "",
  publicSourceUrl: "",
  affirmsNoSecureExamMaterial: false,
  submissionState: "draft",
  updatedAt: 0,
  acceptedAt: null
})

const optionalText = (value: string): string | undefined => {
  const trimmed = value.trim()
  return trimmed.length === 0 ? undefined : trimmed
}

export const correctionReportFromDraft = (
  draft: CorrectionDraftRecord
): CorrectionReportValue => Schema.decodeUnknownSync(CorrectionReport)({
  schemaVersion: 1,
  clientReceiptId: draft.id,
  category: draft.category,
  subject: {
    pagePath: draft.pagePath.trim(),
    ...(optionalText(draft.contentId) === undefined
      ? {}
      : { contentId: optionalText(draft.contentId) }),
    ...(optionalText(draft.profileId) === undefined
      ? {}
      : { profileId: optionalText(draft.profileId) }),
    ...(optionalText(draft.packId) === undefined
      ? {}
      : { packId: optionalText(draft.packId) }),
    ...(draft.packVersion === null ? {} : { packVersion: draft.packVersion })
  },
  summary: draft.summary.trim(),
  details: draft.details.trim(),
  ...(optionalText(draft.publicSourceUrl) === undefined
    ? {}
    : { publicSourceUrl: optionalText(draft.publicSourceUrl) }),
  affirmsNoSecureExamMaterial: draft.affirmsNoSecureExamMaterial
})
