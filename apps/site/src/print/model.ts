import { Schema } from "effect"
import {
  AssetContentReceipt,
  PostcommitContentReceipt
} from "../verified-content.ts"
import { DeterministicSeed } from "../deterministic-seed.ts"
import { RetainedImageDataUrl } from "../retained-image.ts"
import {
  DurableTimestamp,
  NormalizedCoordinate,
  decodeDurableTimestamp
} from "../durable-values.ts"
import { printJobIdPattern, printPreviewPathPattern } from "./identity.ts"
import { SafeQuestionMembership } from "@nycustodian/content/model"

const UniqueStrings = Schema.Array(Schema.NonEmptyString).check(
  Schema.makeFilter((values) =>
    new Set(values).size === values.length
      ? undefined
      : "print coordinates must be unique"
  )
)

const UniqueNonEmptyStrings = UniqueStrings.check(
  Schema.makeFilter((values) => values.length > 0 ? undefined : "at least one print coordinate")
)

const PositiveSafeInteger = Schema.Int.check(
  Schema.makeFilter((value) =>
    Number.isSafeInteger(value) && value > 0
      ? undefined
      : "a positive safe integer"
  )
)

export const PrintTimestamp = DurableTimestamp

export const decodePrintTimestamp = (value: unknown): number =>
  decodeDurableTimestamp(value)

export const SupportedPrintProduct = Schema.Literals([
  "blank-answer-sheet",
  "multiple-choice-questions",
  "answer-key",
  "explanations-and-sources",
  "tool-family-contrast-cards",
  "hazard-worksheet",
  "annotated-hazard-answer-packet",
  "text-equivalent-set",
  "announcement-profile-fact-sheet",
  "correction-change-log-excerpt"
])

export type SupportedPrintProduct = typeof SupportedPrintProduct.Type

export const PrintProduct = SupportedPrintProduct

export type PrintProduct = typeof PrintProduct.Type

export const PrintPaper = Schema.Literals(["us-letter", "a4"])
export type PrintPaper = typeof PrintPaper.Type

export const PrintMargin = Schema.Literals(["standard", "wide"])
export type PrintMargin = typeof PrintMargin.Type

export const PrintSize = Schema.Literals(["normal", "large"])
export type PrintSize = typeof PrintSize.Type

export const PrintJobId = Schema.String.check(
  Schema.isPattern(printJobIdPattern, { expected: "an opaque local print-job ID" })
)

export const decodePrintJobId = (value: unknown): string =>
  Schema.decodeUnknownSync(PrintJobId)(value)

export const createPrintJobId = (randomUuid: string): string =>
  decodePrintJobId(`print-${randomUuid.toLowerCase()}`)

export const printPreviewPath = (id: string): string =>
  `/print/preview/${encodeURIComponent(decodePrintJobId(id))}/`

export const parsePrintPreviewPath = (pathname: string): string | undefined => {
  const match = printPreviewPathPattern.exec(pathname)
  return match?.[1] === undefined ? undefined : decodePrintJobId(match[1])
}

export class PrintQuestionOption extends Schema.Class<PrintQuestionOption>(
  "@nycustodian/site/print/PrintQuestionOption"
)({
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString
}) {}

export class PrintSourceReference extends Schema.Class<PrintSourceReference>(
  "@nycustodian/site/print/PrintSourceReference"
)({
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  locator: Schema.NonEmptyString
}) {}

export const PrintEvidenceTier = Schema.Literals([
  "official-primary",
  "official-primary-synthesis",
  "maintained-editorial-synthesis",
  "accepted-release-record"
])

export const PrintSourceLineReceipt = Schema.Struct({
  id: Schema.NonEmptyString,
  sourceId: Schema.NonEmptyString,
  title: Schema.NonEmptyString,
  publisher: Schema.NonEmptyString,
  evidenceTier: PrintEvidenceTier,
  version: Schema.NonEmptyString,
  rightsNotes: Schema.NonEmptyString,
  locator: Schema.NonEmptyString,
  excerpt: Schema.NonEmptyString,
  language: Schema.Literals(["en", "es"]),
  verifiedOn: Schema.String.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { expected: "an ISO calendar date" })
  ),
  supportedClaimIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  url: Schema.optionalKey(Schema.NonEmptyString)
})

const SourceBoundAnnouncementValue = Schema.Struct({
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  value: Schema.NonEmptyString,
  sourceReferences: Schema.NonEmptyArray(PrintSourceReference)
})

const SourceBoundAnnouncementUnknown = Schema.Struct({
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  detail: Schema.NonEmptyString,
  sourceReferences: Schema.NonEmptyArray(PrintSourceReference)
})

const SourceBoundAnnouncementChange = Schema.Struct({
  version: PositiveSafeInteger,
  changedOn: Schema.NonEmptyString,
  summary: Schema.NonEmptyString,
  sourceReferences: Schema.NonEmptyArray(PrintSourceReference)
})

export class LegacyPrintAnnouncementProfileFactSheet extends Schema.Class<LegacyPrintAnnouncementProfileFactSheet>(
  "@nycustodian/site/print/LegacyPrintAnnouncementProfileFactSheet"
)({
  schemaVersion: Schema.Literal(1),
  version: PositiveSafeInteger,
  lastReviewedOn: Schema.NonEmptyString,
  controllingDocumentNotice: Schema.NonEmptyString,
  seriesScopeDisclaimer: Schema.NonEmptyString,
  verifiedFacts: Schema.NonEmptyArray(SourceBoundAnnouncementValue),
  explicitUnknowns: Schema.NonEmptyArray(SourceBoundAnnouncementUnknown),
  changeHistory: Schema.NonEmptyArray(SourceBoundAnnouncementChange)
}) {}

export const PrintAnnouncementProfileFactState = Schema.Literals([
  "verified",
  "not_published",
  "unverified",
  "conflicting",
  "superseded",
  "not_applicable"
])

export const PrintAnnouncementProfileFactKind = Schema.Literals([
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

export const PrintAnnouncementProfileConflictValue = Schema.Struct({
  value: Schema.NonEmptyString,
  sourceLineIds: Schema.NonEmptyArray(Schema.NonEmptyString)
})

export const PrintAnnouncementProfileFact = Schema.Struct({
  id: Schema.NonEmptyString,
  category: PrintAnnouncementProfileFactKind,
  label: Schema.NonEmptyString,
  state: PrintAnnouncementProfileFactState,
  appliesToExamNumbers: Schema.NonEmptyArray(Schema.NonEmptyString),
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
  sourceLineIds: Schema.Array(Schema.NonEmptyString),
  conflictingValues: Schema.Array(PrintAnnouncementProfileConflictValue),
  supersededByFactId: Schema.NullOr(Schema.NonEmptyString)
})

export const PrintAnnouncementProfileChange = Schema.Struct({
  version: PositiveSafeInteger,
  changedOn: Schema.String.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { expected: "an ISO calendar date" })
  ),
  summary: Schema.NonEmptyString,
  sourceLineIds: Schema.NonEmptyArray(Schema.NonEmptyString)
})

export class PrintAnnouncementProfileFactSheet extends Schema.Class<PrintAnnouncementProfileFactSheet>(
  "@nycustodian/site/print/PrintAnnouncementProfileFactSheet"
)({
  schemaVersion: Schema.Literal(2),
  version: PositiveSafeInteger,
  lastReviewedOn: Schema.String.check(
    Schema.isPattern(/^\d{4}-\d{2}-\d{2}$/, { expected: "an ISO calendar date" })
  ),
  controllingDocumentNotice: Schema.NonEmptyString,
  seriesScopeDisclaimer: Schema.NonEmptyString,
  facts: Schema.NonEmptyArray(PrintAnnouncementProfileFact),
  sourceLines: Schema.NonEmptyArray(PrintSourceLineReceipt),
  changeHistory: Schema.NonEmptyArray(PrintAnnouncementProfileChange)
}) {}

export const ReleasedPrintAnnouncementProfileFactSheet = Schema.Union([
  LegacyPrintAnnouncementProfileFactSheet,
  PrintAnnouncementProfileFactSheet
])

export type ReleasedPrintAnnouncementProfileFactSheet =
  typeof ReleasedPrintAnnouncementProfileFactSheet.Type

export class LegacyPrintProfile extends Schema.Class<LegacyPrintProfile>(
  "@nycustodian/site/print/LegacyPrintProfile"
)({
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  version: PositiveSafeInteger,
  jurisdiction: Schema.NonEmptyString,
  compatibilityKey: Schema.NonEmptyString,
  disclaimer: Schema.NonEmptyString,
  announcementFactSheet: Schema.NullOr(LegacyPrintAnnouncementProfileFactSheet)
}) {}

export class PrintProfile extends Schema.Class<PrintProfile>(
  "@nycustodian/site/print/PrintProfile"
)({
  schemaVersion: Schema.Literal(2),
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  version: PositiveSafeInteger,
  jurisdiction: Schema.NonEmptyString,
  compatibilityKey: Schema.NonEmptyString,
  disclaimer: Schema.NonEmptyString,
  announcementFactSheet: Schema.NullOr(PrintAnnouncementProfileFactSheet)
}) {}

export const ReleasedPrintProfile = Schema.Union([
  LegacyPrintProfile,
  PrintProfile
])

export type ReleasedPrintProfile = typeof ReleasedPrintProfile.Type

export class LegacyPrintQuestionAnswer extends Schema.Class<LegacyPrintQuestionAnswer>(
  "@nycustodian/site/print/LegacyPrintQuestionAnswer"
)({
  questionId: Schema.NonEmptyString,
  correctOptionId: Schema.NonEmptyString,
  rationales: Schema.Array(Schema.Struct({
    optionId: Schema.NonEmptyString,
    message: Schema.NonEmptyString
  })),
  sources: Schema.Array(PrintSourceReference)
}) {}

export const PrintQuestionClaim = Schema.Struct({
  id: Schema.NonEmptyString,
  text: Schema.NonEmptyString,
  sourceLineIds: Schema.NonEmptyArray(Schema.NonEmptyString),
  evidenceTier: PrintEvidenceTier,
  caveat: Schema.NullOr(Schema.NonEmptyString)
})

export const PrintQuestionSourceLineReceipt = PrintSourceLineReceipt

export class PrintQuestionAnswer extends Schema.Class<PrintQuestionAnswer>(
  "@nycustodian/site/print/PrintQuestionAnswer"
)({
  schemaVersion: Schema.Literal(2),
  questionId: Schema.NonEmptyString,
  correctOptionId: Schema.NonEmptyString,
  rationales: Schema.Array(Schema.Struct({
    optionId: Schema.NonEmptyString,
    message: Schema.NonEmptyString,
    claimIds: Schema.NonEmptyArray(Schema.NonEmptyString)
  })),
  claims: Schema.NonEmptyArray(PrintQuestionClaim),
  sources: Schema.NonEmptyArray(PrintQuestionSourceLineReceipt)
}) {}

export const ReleasedPrintQuestionAnswer = Schema.Union([
  LegacyPrintQuestionAnswer,
  PrintQuestionAnswer
])

export type ReleasedPrintQuestionAnswer = typeof ReleasedPrintQuestionAnswer.Type

export class PrintQuestionSource extends Schema.Class<PrintQuestionSource>(
  "@nycustodian/site/print/PrintQuestionSource"
)({
  id: Schema.NonEmptyString,
  profileIds: UniqueNonEmptyStrings,
  memberships: Schema.Array(SafeQuestionMembership),
  prompt: Schema.NonEmptyString,
  options: Schema.Array(PrintQuestionOption).check(
    Schema.makeFilter((options) => {
      if (options.length < 2) return "a printable question needs at least two options"
      return new Set(options.map((option) => option.id)).size === options.length
        ? undefined
        : "print question option IDs must be unique"
    })
  ),
  answerReceipt: Schema.NullOr(PostcommitContentReceipt)
}) {}

export class PrintToolSource extends Schema.Class<PrintToolSource>(
  "@nycustodian/site/print/PrintToolSource"
)({
  id: Schema.NonEmptyString,
  profileIds: UniqueNonEmptyStrings,
  canonicalTerm: Schema.NonEmptyString,
  family: Schema.NonEmptyString,
  useSummary: Schema.NonEmptyString,
  distinguishingFeatures: Schema.NonEmptyArray(Schema.NonEmptyString),
  neutralDescription: Schema.NonEmptyString,
  asset: AssetContentReceipt
}) {}

export class PrintSceneSource extends Schema.Class<PrintSceneSource>(
  "@nycustodian/site/print/PrintSceneSource"
)({
  id: Schema.NonEmptyString,
  profileIds: UniqueNonEmptyStrings,
  environment: Schema.NonEmptyString,
  neutralOverview: Schema.NonEmptyString,
  neutralZones: Schema.NonEmptyArray(Schema.Struct({
    order: PositiveSafeInteger,
    label: Schema.NonEmptyString,
    description: Schema.NonEmptyString
  })),
  asset: AssetContentReceipt,
  answerReceipt: PostcommitContentReceipt
}) {}

const PrintRegion = Schema.Struct({
  inventoryId: Schema.NonEmptyString,
  polygons: Schema.NonEmptyArray(
    Schema.NonEmptyArray(Schema.Tuple([NormalizedCoordinate, NormalizedCoordinate]))
  )
})

export class PrintSceneAnswer extends Schema.Class<PrintSceneAnswer>(
  "@nycustodian/site/print/PrintSceneAnswer"
)({
  sceneId: Schema.NonEmptyString,
  kind: Schema.Literals(["positive", "zero-hazard"]),
  hazardFamily: Schema.NullOr(Schema.NonEmptyString),
  claim: Schema.NonEmptyString,
  targets: Schema.Array(Schema.Struct({
    id: Schema.NonEmptyString,
    condition: Schema.NonEmptyString,
    correction: Schema.NonEmptyString
  })),
  decoys: Schema.NonEmptyArray(Schema.Struct({
    id: Schema.NonEmptyString,
    condition: Schema.NonEmptyString,
    safeBecause: Schema.NonEmptyString
  })),
  targetRegions: Schema.Array(PrintRegion),
  nonvisualStatements: Schema.NonEmptyArray(Schema.Struct({
    zone: Schema.NonEmptyString,
    role: Schema.Literals(["target", "decoy", "safe-background"]),
    statement: Schema.NonEmptyString
  })),
  sourceReferences: Schema.Array(PrintSourceReference)
}) {}

export class PrintCorrectionSource extends Schema.Class<PrintCorrectionSource>(
  "@nycustodian/site/print/PrintCorrectionSource"
)({
  id: Schema.NonEmptyString,
  effectiveDate: Schema.NonEmptyString,
  summary: Schema.NonEmptyString,
  sourceReferences: Schema.NonEmptyArray(PrintSourceReference)
}) {}

export class PrintRetainedAsset extends Schema.Class<PrintRetainedAsset>(
  "@nycustodian/site/print/PrintRetainedAsset"
)({
  receipt: AssetContentReceipt,
  dataUrl: RetainedImageDataUrl
}) {}

export class PrintBuilderBootstrap extends Schema.Class<PrintBuilderBootstrap>(
  "@nycustodian/site/print/PrintBuilderBootstrap"
)({
  schemaVersion: Schema.Literal(2),
  releaseId: Schema.NonEmptyString,
  contentVersion: PositiveSafeInteger,
  profiles: Schema.Array(PrintProfile),
  questions: Schema.Array(PrintQuestionSource),
  tools: Schema.Array(PrintToolSource),
  scenes: Schema.Array(PrintSceneSource),
  corrections: Schema.Array(PrintCorrectionSource)
}) {}

export class PrintSettings extends Schema.Class<PrintSettings>(
  "@nycustodian/site/print/PrintSettings"
)({
  profileId: Schema.NonEmptyString,
  product: SupportedPrintProduct,
  count: PositiveSafeInteger,
  seed: DeterministicSeed,
  paper: PrintPaper,
  margin: PrintMargin,
  printSize: PrintSize,
  grayscalePreview: Schema.Boolean,
  includeImages: Schema.Boolean,
  answerKeyPlacement: Schema.Literals(["separate-job", "new-section"]),
  includeExplanations: Schema.Boolean,
  includeSources: Schema.Boolean,
  filters: UniqueStrings
}) {}

export class PrintQuestionCoordinate extends Schema.Class<PrintQuestionCoordinate>(
  "@nycustodian/site/print/PrintQuestionCoordinate"
)({
  questionId: Schema.NonEmptyString,
  optionIds: UniqueNonEmptyStrings
}) {}

export class PrintDistributionEntry extends Schema.Class<PrintDistributionEntry>(
  "@nycustodian/site/print/PrintDistributionEntry"
)({
  label: Schema.NonEmptyString,
  count: PositiveSafeInteger
}) {}

const printJobManifestFields = {
  algorithmId: Schema.Literal("print-v1-fnv1a32-xorshift32"),
  fingerprint: Schema.String.check(
    Schema.isPattern(/^[a-f0-9]{16}$/, { expected: "a 16-character manifest fingerprint" })
  ),
  pairingFingerprint: Schema.NullOr(Schema.String.check(
    Schema.isPattern(/^[a-f0-9]{16}$/, { expected: "a 16-character set-pairing fingerprint" })
  )),
  releaseId: Schema.NonEmptyString,
  contentVersion: PositiveSafeInteger,
  settings: PrintSettings,
  questions: Schema.Array(PrintQuestionCoordinate),
  itemIds: UniqueNonEmptyStrings,
  assets: Schema.Array(AssetContentReceipt),
  actualLength: PositiveSafeInteger,
  actualDistribution: Schema.Array(PrintDistributionEntry),
  pageCount: PositiveSafeInteger
} as const

export class LegacyPrintJobManifest extends Schema.Class<LegacyPrintJobManifest>(
  "@nycustodian/site/print/LegacyPrintJobManifest"
)({
  schemaVersion: Schema.Literal(1),
  ...printJobManifestFields,
  profile: LegacyPrintProfile
}) {}

export class PrintJobManifest extends Schema.Class<PrintJobManifest>(
  "@nycustodian/site/print/PrintJobManifest"
)({
  schemaVersion: Schema.Literal(2),
  ...printJobManifestFields,
  profile: PrintProfile
}) {}

export const ReleasedPrintJobManifest = Schema.Union([
  LegacyPrintJobManifest,
  PrintJobManifest
])

export type ReleasedPrintJobManifest = typeof ReleasedPrintJobManifest.Type

const PrintAnswerSheetSection = Schema.Struct({
  tag: Schema.Literal("answer-sheet"),
  questionNumbers: Schema.Array(PositiveSafeInteger),
  optionLabels: Schema.Array(Schema.NonEmptyString)
})

const PrintQuestionsSection = Schema.Struct({
  tag: Schema.Literal("questions"),
  questions: Schema.Array(Schema.Struct({
    number: PositiveSafeInteger,
    id: Schema.NonEmptyString,
    prompt: Schema.NonEmptyString,
    options: Schema.Array(Schema.Struct({
      id: Schema.NonEmptyString,
      label: Schema.NonEmptyString,
      text: Schema.NonEmptyString
    }))
  }))
})

const PrintAnswerKeySection = Schema.Struct({
  tag: Schema.Literal("answer-key"),
  answers: Schema.Array(Schema.Struct({
    number: PositiveSafeInteger,
    optionLabel: Schema.NonEmptyString
  }))
})

const LegacyPrintExplanationsSection = Schema.Struct({
  tag: Schema.Literal("explanations"),
  explanations: Schema.Array(Schema.Struct({
    number: PositiveSafeInteger,
    correctOptionLabel: Schema.NonEmptyString,
    rationales: Schema.Array(Schema.Struct({
      optionLabel: Schema.NonEmptyString,
      message: Schema.NonEmptyString
    })),
    sources: Schema.Array(PrintSourceReference)
  }))
})

const PrintExplanationsSectionV2 = Schema.Struct({
  tag: Schema.Literal("explanations"),
  explanations: Schema.Array(Schema.Struct({
    number: PositiveSafeInteger,
    correctOptionLabel: Schema.NonEmptyString,
    rationales: Schema.Array(Schema.Struct({
      optionLabel: Schema.NonEmptyString,
      message: Schema.NonEmptyString,
      claimIds: Schema.NonEmptyArray(Schema.NonEmptyString)
    })),
    claims: Schema.NonEmptyArray(PrintQuestionClaim),
    sources: Schema.Array(PrintQuestionSourceLineReceipt)
  }))
})

const PrintToolFamilyCardsSection = Schema.Struct({
  tag: Schema.Literal("tool-family-cards"),
  families: Schema.NonEmptyArray(Schema.Struct({
    family: Schema.NonEmptyString,
    tools: Schema.NonEmptyArray(Schema.Struct({
      id: Schema.NonEmptyString,
      canonicalTerm: Schema.NonEmptyString,
      useSummary: Schema.NonEmptyString,
      distinguishingFeatures: Schema.NonEmptyArray(Schema.NonEmptyString),
      neutralDescription: Schema.NonEmptyString,
      asset: Schema.NullOr(PrintRetainedAsset)
    }))
  }))
})

const PrintHazardWorksheetSection = Schema.Struct({
  tag: Schema.Literal("hazard-worksheet"),
  scenes: Schema.NonEmptyArray(Schema.Struct({
    id: Schema.NonEmptyString,
    environment: Schema.NonEmptyString,
    neutralOverview: Schema.NonEmptyString,
    neutralZones: Schema.NonEmptyArray(Schema.Struct({
      order: PositiveSafeInteger,
      label: Schema.NonEmptyString,
      description: Schema.NonEmptyString
    })),
    asset: Schema.NullOr(PrintRetainedAsset)
  }))
})

const PrintAnnotatedHazardAnswersSection = Schema.Struct({
  tag: Schema.Literal("annotated-hazard-answers"),
  scenes: Schema.NonEmptyArray(Schema.Struct({
    id: Schema.NonEmptyString,
    environment: Schema.NonEmptyString,
    asset: Schema.NullOr(PrintRetainedAsset),
    answer: PrintSceneAnswer
  }))
})

const PrintTextEquivalentScenesSection = Schema.Struct({
  tag: Schema.Literal("text-equivalent-scenes"),
  scenes: Schema.NonEmptyArray(Schema.Struct({
    id: Schema.NonEmptyString,
    environment: Schema.NonEmptyString,
    answer: PrintSceneAnswer
  }))
})

const LegacyPrintAnnouncementProfileFactSheetSection = Schema.Struct({
  tag: Schema.Literal("announcement-profile-fact-sheet"),
  profileLabel: Schema.NonEmptyString,
  jurisdiction: Schema.NonEmptyString,
  factSheet: LegacyPrintAnnouncementProfileFactSheet
})

const PrintAnnouncementProfileFactSheetSectionV2 = Schema.Struct({
  tag: Schema.Literal("announcement-profile-fact-sheet"),
  profileLabel: Schema.NonEmptyString,
  jurisdiction: Schema.NonEmptyString,
  factSheet: PrintAnnouncementProfileFactSheet
})

const PrintCorrectionChangeLogExcerptSection = Schema.Struct({
  tag: Schema.Literal("correction-change-log-excerpt"),
  corrections: Schema.NonEmptyArray(PrintCorrectionSource)
})

const commonPacketSections = [
  PrintAnswerSheetSection,
  PrintQuestionsSection,
  PrintAnswerKeySection,
  PrintToolFamilyCardsSection,
  PrintHazardWorksheetSection,
  PrintAnnotatedHazardAnswersSection,
  PrintTextEquivalentScenesSection,
  PrintCorrectionChangeLogExcerptSection
] as const

export const PrintPacketSection = Schema.Union([
  ...commonPacketSections,
  LegacyPrintAnnouncementProfileFactSheetSection,
  LegacyPrintExplanationsSection
])

export type PrintPacketSection = typeof PrintPacketSection.Type

export const PrintPacketSectionV2 = Schema.Union([
  ...commonPacketSections,
  PrintAnnouncementProfileFactSheetSectionV2,
  PrintExplanationsSectionV2
])

export type PrintPacketSectionV2 = typeof PrintPacketSectionV2.Type

export const ReleasedPrintPacketSection = Schema.Union([
  PrintPacketSection,
  PrintPacketSectionV2
])

export type ReleasedPrintPacketSection = typeof ReleasedPrintPacketSection.Type

export class PrintPacket extends Schema.Class<PrintPacket>(
  "@nycustodian/site/print/PrintPacket"
)({
  schemaVersion: Schema.Literal(1),
  fingerprint: Schema.String.check(
    Schema.isPattern(/^[a-f0-9]{16}$/, { expected: "a 16-character print-packet fingerprint" })
  ),
  title: Schema.NonEmptyString,
  statement: Schema.Literal("Original practice — not an official or past exam"),
  sections: Schema.Array(PrintPacketSection),
  warnings: Schema.Array(Schema.NonEmptyString)
}) {}

export class PrintPacketV2 extends Schema.Class<PrintPacketV2>(
  "@nycustodian/site/print/PrintPacketV2"
)({
  schemaVersion: Schema.Literal(2),
  fingerprint: Schema.String.check(
    Schema.isPattern(/^[a-f0-9]{16}$/, { expected: "a 16-character print-packet fingerprint" })
  ),
  title: Schema.NonEmptyString,
  statement: Schema.Literal("Original practice — not an official or past exam"),
  sections: Schema.Array(PrintPacketSectionV2),
  warnings: Schema.Array(Schema.NonEmptyString)
}) {}

export const ReleasedPrintPacket = Schema.Union([
  PrintPacket,
  PrintPacketV2
])

export type ReleasedPrintPacket = typeof ReleasedPrintPacket.Type

export class PrintJobRecord extends Schema.Class<PrintJobRecord>(
  "@nycustodian/site/print/PrintJobRecord"
)({
  id: PrintJobId,
  manifest: ReleasedPrintJobManifest,
  packet: ReleasedPrintPacket,
  status: Schema.Literals(["preview-ready", "stale", "system-print-requested"]),
  updatedAt: PrintTimestamp
}) {}

export class PrintProductAvailability extends Schema.Class<PrintProductAvailability>(
  "@nycustodian/site/print/PrintProductAvailability"
)({
  product: PrintProduct,
  available: Schema.Boolean,
  reason: Schema.NullOr(Schema.NonEmptyString)
}) {}
