import { Effect, Schema } from "effect"
import {
  AuthoredQuestion,
  PostcommitQuestion,
  PrecommitQuestion,
  QuestionOptionConceptMappings
} from "../model/question-artifacts.ts"
import type { CompiledQuestion } from "./compiled-content.ts"
import {
  firstDuplicate,
  isBlank,
  sameMembers,
  sameOrderedValues
} from "./collection-invariants.ts"
import {
  closureError,
  relationError,
  schemaError
} from "./content-validation.ts"

const decodeQuestionOptionConceptMappings = Schema.decodeUnknownEffect(
  QuestionOptionConceptMappings
)

export const validateQuestionOptionConceptClosure = Effect.fn(
  "Content.validateQuestionOptionConceptClosure"
)(function*(questionId: string, optionIds: ReadonlyArray<string>, unknownMappings: unknown) {
  if (firstDuplicate(optionIds) !== undefined) {
    return yield* closureError(
      `question ${questionId} options must be unique before mapping concepts`,
      `questions.${questionId}.options`
    )
  }
  const mappings = yield* decodeQuestionOptionConceptMappings(unknownMappings).pipe(
    Effect.mapError((cause) =>
      schemaError(`questions.${questionId}.optionConceptIds`, cause)
    )
  )
  const mappingOptionIds = mappings.map((mapping) => mapping.optionId)

  if (!sameMembers(optionIds, mappingOptionIds)) {
    return yield* closureError(
      `question ${questionId} option-to-concept mappings must cover every option exactly once`,
      `questions.${questionId}.optionConceptIds`
    )
  }

  return mappings
})

const validateLegacyQuestion = (question: AuthoredQuestion): void => {
  const optionIds = question.options.map((option) => option.id)
  const rationaleIds = question.rationales.map((rationale) => rationale.optionId)

  if (firstDuplicate(optionIds) !== undefined) throw new Error("option ids must be unique")
  if (firstDuplicate(rationaleIds) !== undefined) throw new Error("rationale option ids must be unique")
  if (firstDuplicate(question.sources.map((source) => source.id)) !== undefined) {
    throw new Error("source ids must be unique")
  }
  if (!optionIds.includes(question.correctOptionId)) {
    throw new Error("correctOptionId must reference an option")
  }
  if (rationaleIds.some((id) => !optionIds.includes(id))) {
    throw new Error("rationale option ids must reference options")
  }
  if (optionIds.length < 2 || optionIds.some((id) => !rationaleIds.includes(id))) {
    throw new Error("every option requires a rationale and each question requires at least two options")
  }
  if (question.rationales.some((rationale) => isBlank(rationale.message))) {
    throw new Error("rationale messages must not be blank")
  }
  if (question.sources.length === 0) {
    throw new Error("at least one source receipt is required")
  }
  if (
    question.sources.some((source) =>
      [source.id, source.label, source.locator].some(isBlank)
    )
  ) {
    throw new Error("source receipt fields must not be blank")
  }
}

export const compileQuestion = (unknownInput: unknown): CompiledQuestion => {
  const question = Schema.decodeUnknownSync(AuthoredQuestion)(unknownInput)
  validateLegacyQuestion(question)
  const [firstSource, ...remainingSources] = question.sources
  if (firstSource === undefined) {
    throw new Error("at least one source receipt is required")
  }

  return {
    precommit: new PrecommitQuestion({
      schemaVersion: 1,
      id: question.id,
      profileId: question.profileId,
      prompt: question.prompt,
      options: question.options
    }),
    postcommit: new PostcommitQuestion({
      schemaVersion: 1,
      id: question.id,
      correctOptionId: question.correctOptionId,
      rationales: question.rationales,
      sources: [firstSource, ...remainingSources]
    })
  }
}

/**
 * Keeps the pre-pack vertical-slice question as a checked compatibility fixture.
 * The canonical profile and source receipts come from the authored pack, so those
 * legacy metadata fields are deliberately validated for shape but not compared.
 */
export const verifyLegacyQuestionCompatibilityFixture = Effect.fn(
  "Content.verifyLegacyQuestionCompatibilityFixture"
)(function*(canonical: CompiledQuestion, unknownFixture: unknown) {
  const fixture = yield* Effect.try({
    try: () => compileQuestion(unknownFixture),
    catch: (cause) => schemaError("legacyQuestionCompatibilityFixture", cause)
  })
  const sameQuestion =
    fixture.precommit.id === canonical.precommit.id &&
    fixture.postcommit.id === canonical.postcommit.id &&
    fixture.precommit.prompt === canonical.precommit.prompt &&
    fixture.postcommit.correctOptionId === canonical.postcommit.correctOptionId &&
    sameOrderedValues(
      fixture.precommit.options.map((option) => `${option.id}\n${option.label}`),
      canonical.precommit.options.map((option) => `${option.id}\n${option.label}`)
    ) &&
    sameOrderedValues(
      fixture.postcommit.rationales.map(
        (rationale) => `${rationale.optionId}\n${rationale.message}`
      ),
      canonical.postcommit.rationales.map(
        (rationale) => `${rationale.optionId}\n${rationale.message}`
      )
    )
  if (!sameQuestion) {
    return yield* relationError(
      "non-authoritative legacy question fixture has drifted from canonical question 1",
      "legacyQuestionCompatibilityFixture"
    )
  }
})
