import { PostcommitQuestion, PostcommitScene } from "@nycustodian/content/model"
import { Effect, Schema } from "effect"
import { VerifiedContent, type VerifiedContentError } from "../verified-content.ts"
import {
  PrintQuestionAnswer,
  PrintSceneAnswer,
  type PrintQuestionSource,
  type PrintSceneSource
} from "./model.ts"

export class PrintAnswerMismatchError extends Schema.TaggedError<PrintAnswerMismatchError>()(
  "PrintAnswerMismatchError",
  {
    questionId: Schema.NonEmptyString,
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export type PrintAnswerLoadError = VerifiedContentError | PrintAnswerMismatchError

const loadOnePrintAnswer = Effect.fn("PrintAnswers.loadOne")(function*(
  question: PrintQuestionSource
) {
  if (question.answerReceipt === null) {
    return yield* new PrintAnswerMismatchError({
      questionId: question.id,
      detail: "The selected question has no exact reviewed answer receipt.",
      cause: new Error("Missing postcommit receipt")
    })
  }
  const verifiedContent = yield* VerifiedContent
  const unknown = yield* verifiedContent.loadCachedJson(question.answerReceipt)
  const answer = yield* Schema.decodeUnknownEffect(PostcommitQuestion)(unknown).pipe(
    Effect.mapError((cause) => new PrintAnswerMismatchError({
      questionId: question.id,
      detail: "The exact reviewed answer object did not match the expected schema.",
      cause
    }))
  )
  if (answer.id !== question.id) {
    return yield* new PrintAnswerMismatchError({
      questionId: question.id,
      detail: "The reviewed answer object belongs to a different question.",
      cause: new Error(`Expected ${question.id}; received ${answer.id}`)
    })
  }
  return new PrintQuestionAnswer({
    questionId: answer.id,
    correctOptionId: answer.correctOptionId,
    rationales: answer.rationales,
    sources: answer.sources
  })
})

export const loadPrintAnswers = Effect.fn("PrintAnswers.loadSelected")(function*(
  questions: ReadonlyArray<PrintQuestionSource>
) {
  const answers: Array<PrintQuestionAnswer> = []
  for (const question of questions) {
    answers.push(yield* loadOnePrintAnswer(question))
  }
  return answers as ReadonlyArray<PrintQuestionAnswer>
})

const loadOneSceneAnswer = Effect.fn("PrintAnswers.loadOneScene")(function*(
  scene: PrintSceneSource
) {
  const verifiedContent = yield* VerifiedContent
  const unknown = yield* verifiedContent.loadCachedJson(scene.answerReceipt)
  const answer = yield* Schema.decodeUnknownEffect(PostcommitScene)(unknown).pipe(
    Effect.mapError((cause) => new PrintAnswerMismatchError({
      questionId: scene.id,
      detail: "The exact reviewed scene answer did not match the expected schema.",
      cause
    }))
  )
  if (answer.opaqueAssetId !== scene.id) {
    return yield* new PrintAnswerMismatchError({
      questionId: scene.id,
      detail: "The reviewed scene answer belongs to a different released image.",
      cause: new Error(`Expected ${scene.id}; received ${answer.opaqueAssetId}`)
    })
  }
  return new PrintSceneAnswer({
    sceneId: scene.id,
    kind: answer.kind,
    hazardFamily: answer.hazardFamily,
    claim: answer.claim,
    targets: answer.targets,
    decoys: answer.decoys,
    targetRegions: answer.targetRegions,
    nonvisualStatements: answer.nonvisualZonedEquivalent,
    sourceReferences: answer.fullPostAnswer.sources.map((source) => ({
      id: source.id,
      label: source.title,
      locator: source.locator
    }))
  })
})

export const loadPrintSceneAnswers = Effect.fn("PrintAnswers.loadSelectedScenes")(function*(
  scenes: ReadonlyArray<PrintSceneSource>
) {
  const answers: Array<PrintSceneAnswer> = []
  for (const scene of scenes) answers.push(yield* loadOneSceneAnswer(scene))
  return answers as ReadonlyArray<PrintSceneAnswer>
})
