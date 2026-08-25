import { Schema } from "effect"

const boundedText = (label: string, maximum: number) =>
  Schema.String.check(
    Schema.makeFilter((value) => {
      if (value.trim().length === 0) return `${label} must not be blank`
      if (value.length > maximum) return `${label} must be at most ${maximum} characters`
      if (/[^\t\n\r\x20-\u{10ffff}]/u.test(value)) {
        return `${label} contains an unsupported control character`
      }
      return undefined
    })
  )

const optionalBoundedText = (label: string, maximum: number) =>
  Schema.optionalKey(boundedText(label, maximum))

export const CorrectionCategory = Schema.Literals([
  "fact",
  "question",
  "explanation",
  "image",
  "accessibility",
  "translation",
  "rights",
  "security"
])

export type CorrectionCategory = typeof CorrectionCategory.Type

export const ClientReceiptId = Schema.String.check(
  Schema.isPattern(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    { expected: "a UUID client receipt ID" }
  )
)

export const PublicPagePath = Schema.String.check(
  Schema.isPattern(/^\/(?:[a-z0-9._~-]+\/)*[a-z0-9._~-]*\/?$/i, {
    expected: "a same-origin public page path without a query or fragment"
  })
)

export const PublicSourceUrl = Schema.String.check(
  Schema.makeFilter((value) => {
    if (value.length > 2_048) return "the public source URL must be at most 2048 characters"
    try {
      const parsed = new URL(value)
      return parsed.protocol === "https:" && parsed.username === "" && parsed.password === ""
        ? undefined
        : "the public source URL must be an HTTPS URL without credentials"
    } catch {
      return "the public source URL must be a valid HTTPS URL"
    }
  })
)

export const CorrectionSubject = Schema.Struct({
  pagePath: PublicPagePath,
  contentId: optionalBoundedText("content ID", 160),
  profileId: optionalBoundedText("profile ID", 160),
  packId: optionalBoundedText("pack ID", 160),
  packVersion: Schema.optionalKey(Schema.Natural)
})

export class CorrectionReport extends Schema.Class<CorrectionReport>(
  "@nycustodian/correction-intake/CorrectionReport"
)({
  schemaVersion: Schema.Literal(1),
  clientReceiptId: ClientReceiptId,
  category: CorrectionCategory,
  subject: CorrectionSubject,
  summary: boundedText("summary", 240),
  details: boundedText("details", 8_000),
  publicSourceUrl: Schema.optionalKey(PublicSourceUrl),
  affirmsNoSecureExamMaterial: Schema.Literal(true)
}) {}

export const CorrectionStatusResponse = Schema.Struct({
  schemaVersion: Schema.Literal(1),
  mode: Schema.Literals(["disabled", "active-v1"]),
  acceptsReports: Schema.Boolean
})

export const CorrectionAcceptedResponse = Schema.Struct({
  schemaVersion: Schema.Literal(1),
  status: Schema.Literal("accepted"),
  clientReceiptId: ClientReceiptId
})

export const CorrectionErrorResponse = Schema.Struct({
  schemaVersion: Schema.Literal(1),
  status: Schema.Literal("error"),
  code: Schema.Literals([
    "disabled",
    "invalid-origin",
    "invalid-content-type",
    "invalid-report",
    "payload-too-large",
    "rate-limited",
    "receipt-conflict",
    "service-unavailable"
  ])
})

export type CorrectionReportValue = typeof CorrectionReport.Type
export type CorrectionStatusResponseValue = typeof CorrectionStatusResponse.Type
export type CorrectionAcceptedResponseValue = typeof CorrectionAcceptedResponse.Type
export type CorrectionErrorResponseValue = typeof CorrectionErrorResponse.Type
