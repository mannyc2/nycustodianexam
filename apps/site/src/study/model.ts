import { Schema } from "effect"
import { ReviewQueueBootstrap } from "../review/model.ts"

export class StudyBootstrap extends Schema.Class<StudyBootstrap>(
  "@nycustodian/site/study/StudyBootstrap"
)({
  schemaVersion: Schema.Literal(1),
  toolCount: Schema.Natural,
  questionCount: Schema.Natural,
  sceneCount: Schema.Natural,
  profileLabel: Schema.NonEmptyString,
  firstPractice: Schema.NullOr(Schema.Struct({
    href: Schema.String.check(Schema.isPattern(/^\/practice\/session\/[a-z0-9][a-z0-9._-]*\/question\/1\/$/)),
    label: Schema.NonEmptyString
  })),
  reviewQueue: ReviewQueueBootstrap
}) {}

export interface StudyActivityRow {
  readonly id: string
  readonly kind: "questions" | "hazards" | "reviews"
  readonly recordedAt: number
  readonly label: string
  readonly outcome: string
  readonly href: string
}

export interface StudyActivity {
  readonly rows: ReadonlyArray<StudyActivityRow>
  readonly questionCount: number
  readonly hazardCount: number
  readonly reviewCount: number
  readonly otherAttemptCount: number
}

export type StudyActivityState =
  | { readonly tag: "loading" }
  | { readonly tag: "ready"; readonly activity: StudyActivity }
  | { readonly tag: "unavailable" }
