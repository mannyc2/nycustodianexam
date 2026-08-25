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

export class PrintAnnouncementProfileFactSheet extends Schema.Class<PrintAnnouncementProfileFactSheet>(
  "@nycustodian/site/print/PrintAnnouncementProfileFactSheet"
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

export class PrintProfile extends Schema.Class<PrintProfile>(
  "@nycustodian/site/print/PrintProfile"
)({
  id: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  version: PositiveSafeInteger,
  jurisdiction: Schema.NonEmptyString,
  compatibilityKey: Schema.NonEmptyString,
  disclaimer: Schema.NonEmptyString,
  announcementFactSheet: Schema.NullOr(PrintAnnouncementProfileFactSheet)
}) {}

export class PrintQuestionAnswer extends Schema.Class<PrintQuestionAnswer>(
  "@nycustodian/site/print/PrintQuestionAnswer"
)({
  questionId: Schema.NonEmptyString,
  correctOptionId: Schema.NonEmptyString,
  rationales: Schema.Array(Schema.Struct({
    optionId: Schema.NonEmptyString,
    message: Schema.NonEmptyString
  })),
  sources: Schema.Array(PrintSourceReference)
}) {}

export class PrintQuestionSource extends Schema.Class<PrintQuestionSource>(
  "@nycustodian/site/print/PrintQuestionSource"
)({
  id: Schema.NonEmptyString,
  profileIds: UniqueNonEmptyStrings,
  category: Schema.NonEmptyString,
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
  schemaVersion: Schema.Literal(1),
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

export class PrintJobManifest extends Schema.Class<PrintJobManifest>(
  "@nycustodian/site/print/PrintJobManifest"
)({
  schemaVersion: Schema.Literal(1),
  algorithmId: Schema.Literal("print-v1-fnv1a32-xorshift32"),
  fingerprint: Schema.String.check(
    Schema.isPattern(/^[a-f0-9]{16}$/, { expected: "a 16-character manifest fingerprint" })
  ),
  pairingFingerprint: Schema.NullOr(Schema.String.check(
    Schema.isPattern(/^[a-f0-9]{16}$/, { expected: "a 16-character set-pairing fingerprint" })
  )),
  releaseId: Schema.NonEmptyString,
  contentVersion: PositiveSafeInteger,
  profile: PrintProfile,
  settings: PrintSettings,
  questions: Schema.Array(PrintQuestionCoordinate),
  itemIds: UniqueNonEmptyStrings,
  assets: Schema.Array(AssetContentReceipt),
  actualLength: PositiveSafeInteger,
  actualDistribution: Schema.Array(PrintDistributionEntry),
  pageCount: PositiveSafeInteger
}) {}

export const PrintPacketSection = Schema.Union([
  Schema.Struct({
    tag: Schema.Literal("answer-sheet"),
    questionNumbers: Schema.Array(PositiveSafeInteger),
    optionLabels: Schema.Array(Schema.NonEmptyString)
  }),
  Schema.Struct({
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
  }),
  Schema.Struct({
    tag: Schema.Literal("answer-key"),
    answers: Schema.Array(Schema.Struct({
      number: PositiveSafeInteger,
      optionLabel: Schema.NonEmptyString
    }))
  }),
  Schema.Struct({
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
  }),
  Schema.Struct({
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
  }),
  Schema.Struct({
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
  }),
  Schema.Struct({
    tag: Schema.Literal("annotated-hazard-answers"),
    scenes: Schema.NonEmptyArray(Schema.Struct({
      id: Schema.NonEmptyString,
      environment: Schema.NonEmptyString,
      asset: Schema.NullOr(PrintRetainedAsset),
      answer: PrintSceneAnswer
    }))
  }),
  Schema.Struct({
    tag: Schema.Literal("text-equivalent-scenes"),
    scenes: Schema.NonEmptyArray(Schema.Struct({
      id: Schema.NonEmptyString,
      environment: Schema.NonEmptyString,
      answer: PrintSceneAnswer
    }))
  }),
  Schema.Struct({
    tag: Schema.Literal("announcement-profile-fact-sheet"),
    profileLabel: Schema.NonEmptyString,
    jurisdiction: Schema.NonEmptyString,
    factSheet: PrintAnnouncementProfileFactSheet
  }),
  Schema.Struct({
    tag: Schema.Literal("correction-change-log-excerpt"),
    corrections: Schema.NonEmptyArray(PrintCorrectionSource)
  })
])

export type PrintPacketSection = typeof PrintPacketSection.Type

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

export class PrintJobRecord extends Schema.Class<PrintJobRecord>(
  "@nycustodian/site/print/PrintJobRecord"
)({
  id: PrintJobId,
  manifest: PrintJobManifest,
  packet: PrintPacket,
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
