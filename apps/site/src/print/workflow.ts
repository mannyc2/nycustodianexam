import { Effect, Schema } from "effect"
import { VerifiedContent, type VerifiedContentError } from "../verified-content.ts"
import {
  loadPrintAnswers,
  loadPrintSceneAnswers,
  type PrintAnswerLoadError
} from "./answers.ts"
import {
  generatePrintManifest,
  makePrintPacket,
} from "./generation.ts"
import {
  PrintRetainedAsset,
  type PrintBuilderBootstrap,
  type PrintJobRecord,
  type PrintSettings
} from "./model.ts"
import {
  PrintPersistence,
  type PrintPersistenceError
} from "./persistence.ts"
import { retainImageBlob } from "../retained-image.ts"

export type CreatePrintJobError =
  | PrintWorkflowGenerationError
  | PrintLocalClosureError
  | PrintAnswerLoadError
  | VerifiedContentError
  | PrintPersistenceError

export interface CreatePrintJobInput {
  readonly id: string
  readonly bootstrap: PrintBuilderBootstrap
  readonly settings: PrintSettings
}

export class PrintWorkflowGenerationError extends Schema.TaggedError<PrintWorkflowGenerationError>()(
  "PrintWorkflowGenerationError",
  {
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export class PrintLocalClosureError extends Schema.TaggedError<PrintLocalClosureError>()(
  "PrintLocalClosureError",
  {
    detail: Schema.NonEmptyString,
    path: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

const generate = (input: CreatePrintJobInput) => Effect.try({
  try: () => generatePrintManifest({ bootstrap: input.bootstrap, settings: input.settings }),
  catch: (cause) => new PrintWorkflowGenerationError({
    detail: cause instanceof Error && cause.message.length > 0
      ? cause.message
      : "The deterministic print manifest could not be generated.",
    cause
  })
})

const renderPacket = (
  manifest: ReturnType<typeof generatePrintManifest>,
  bootstrap: Parameters<typeof makePrintPacket>[1],
  answers: Parameters<typeof makePrintPacket>[2],
  sceneAnswers: Parameters<typeof makePrintPacket>[3],
  retainedAssets: Parameters<typeof makePrintPacket>[4]
) => Effect.try({
  try: () => makePrintPacket(manifest, bootstrap, answers, sceneAnswers, retainedAssets),
  catch: (cause) => new PrintWorkflowGenerationError({
    detail: cause instanceof Error && cause.message.length > 0
      ? cause.message
      : "The semantic print packet could not be generated.",
    cause
  })
})

const retainAssets = Effect.fn("PrintWorkflow.retainAssets")(function*(
  receipts: ReturnType<typeof generatePrintManifest>["assets"]
) {
  const verifiedContent = yield* VerifiedContent
  const retained: Array<PrintRetainedAsset> = []
  for (const receipt of receipts) {
    const blob = yield* verifiedContent.loadCachedAssetBlob(receipt)
    const retainedImage = yield* Effect.tryPromise({
      try: () => retainImageBlob(receipt, blob),
      catch: (cause) => new PrintWorkflowGenerationError({
        detail: "A verified print image could not be retained for offline preview.",
        cause
      })
    })
    retained.push(new PrintRetainedAsset(retainedImage))
  }
  return retained as ReadonlyArray<PrintRetainedAsset>
})

const requireLocalClosure = Effect.fn("PrintWorkflow.requireLocalClosure")(function*(
  answerReceipts: ReadonlyArray<NonNullable<PrintBuilderBootstrap["questions"][number]["answerReceipt"]>>,
  sceneReceipts: ReadonlyArray<PrintBuilderBootstrap["scenes"][number]["answerReceipt"]>,
  assetReceipts: ReturnType<typeof generatePrintManifest>["assets"]
) {
  const verifiedContent = yield* VerifiedContent
  for (const receipt of [...answerReceipts, ...sceneReceipts]) {
    const availability = yield* verifiedContent.ensureAvailable(receipt)
    if (
      availability.path !== receipt.postcommitPath ||
      availability.source !== "verified-cache"
    ) {
      return yield* new PrintLocalClosureError({
        detail: "A required reviewed print-answer record is not retained in the verified local content closure.",
        path: receipt.postcommitPath,
        cause: new Error("Print answer receipt is not in verified cache")
      })
    }
  }
  for (const receipt of assetReceipts) {
    const availability = yield* verifiedContent.ensureAssetAvailable(receipt)
    if (availability.path !== receipt.path || availability.source !== "verified-cache") {
      return yield* new PrintLocalClosureError({
        detail: "A required print image is not retained in the verified local content closure.",
        path: receipt.path,
        cause: new Error("Print asset receipt is not in verified cache")
      })
    }
  }
})

export const createPrintJob = Effect.fn("PrintWorkflow.createPrintJob")(function*(
  input: CreatePrintJobInput
) {
  const manifest = yield* generate(input)
  const selectedIds = new Set(manifest.itemIds)
  const selected = input.bootstrap.questions.filter((question) => selectedIds.has(question.id))
  const selectedScenes = input.bootstrap.scenes.filter((scene) => selectedIds.has(scene.id))
  const needsAnswers = input.settings.product === "answer-key" ||
      input.settings.product === "explanations-and-sources" ||
      input.settings.product === "multiple-choice-questions" &&
        input.settings.answerKeyPlacement === "new-section"
  const needsSceneAnswers = input.settings.product === "annotated-hazard-answer-packet" ||
    input.settings.product === "text-equivalent-set"
  const answerReceipts = needsAnswers
    ? selected.flatMap((question) => question.answerReceipt === null ? [] : [question.answerReceipt])
    : []
  if (needsAnswers && answerReceipts.length !== selected.length) {
    return yield* new PrintLocalClosureError({
      detail: "A selected question has no exact reviewed answer receipt.",
      path: "/content/vertical-slice/questions/unavailable.postcommit.json",
      cause: new Error("Missing selected print answer receipt")
    })
  }
  yield* requireLocalClosure(
    answerReceipts,
    needsSceneAnswers ? selectedScenes.map((scene) => scene.answerReceipt) : [],
    manifest.assets
  )
  const answers = needsAnswers
    ? yield* loadPrintAnswers(selected)
    : []
  const sceneAnswers = needsSceneAnswers
    ? yield* loadPrintSceneAnswers(selectedScenes)
    : []
  const retainedAssets = yield* retainAssets(manifest.assets)
  const packet = yield* renderPacket(
    manifest,
    input.bootstrap,
    answers,
    sceneAnswers,
    retainedAssets
  )
  const persistence = yield* PrintPersistence
  return yield* persistence.savePrintJob({ id: input.id, manifest, packet })
})

export const restorePrintJob = Effect.fn("PrintWorkflow.restorePrintJob")(function*(id: string) {
  const persistence = yield* PrintPersistence
  return yield* persistence.findPrintJob(id)
})

export const recordSystemPrintRequest = Effect.fn("PrintWorkflow.recordSystemPrintRequest")(
  function*(id: string) {
    const persistence = yield* PrintPersistence
    return yield* persistence.requestSystemPrint(id)
  }
)

export type PrintWorkflowRequirements = PrintPersistence | VerifiedContent
export type PrintWorkflowRecord = PrintJobRecord
