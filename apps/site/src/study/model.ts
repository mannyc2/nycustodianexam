import { Schema } from "effect"
import { ReviewQueueBootstrap } from "../review/model.ts"

const PracticePreset = Schema.Struct({
  length: Schema.Literals([45, 60, 90]),
  href: Schema.String.check(Schema.isPattern(/^\/practice\/session\/[a-z0-9][a-z0-9._-]*\/question\/1\/$/)),
  label: Schema.NonEmptyString
})

export class StudyBootstrap extends Schema.Class<StudyBootstrap>(
  "@nycustodian/site/study/StudyBootstrap"
)({
  schemaVersion: Schema.Literal(1),
  toolCount: Schema.Natural,
  questionCount: Schema.Natural,
  sceneCount: Schema.Natural,
  profileLabel: Schema.NonEmptyString,
  firstPractice: Schema.NullOr(PracticePreset),
  practiceSets: Schema.optionalKey(Schema.Array(PracticePreset)),
  reviewQueue: ReviewQueueBootstrap
}) {}

export interface StudyActivityRow {
  readonly id: string
  readonly attemptId: string
  readonly kind: "questions" | "hazards" | "reviews"
  readonly recordedAt: number
  readonly label: string
  readonly outcome: string
  readonly href: string | null
}

export interface UnavailableStudyAttempt {
  readonly id: string
  readonly recordedAt: number | null
  readonly label: string
}

export interface StudyActivity {
  readonly rows: ReadonlyArray<StudyActivityRow>
  readonly questionCount: number
  readonly hazardCount: number
  readonly reviewCount: number
  readonly unavailableAttempts: ReadonlyArray<UnavailableStudyAttempt>
}

export type StudyActivityState =
  | { readonly tag: "loading" }
  | { readonly tag: "ready"; readonly activity: StudyActivity }
  | { readonly tag: "unavailable" }
