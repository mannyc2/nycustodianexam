import { Effect, Schema } from "effect"
import {
  VerifiedContent,
  type PostcommitContentReceipt
} from "../verified-content.ts"

export class ReviewContentError extends Schema.TaggedError<ReviewContentError>()(
  "ReviewContentError",
  {
    url: Schema.NonEmptyString,
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export const loadReviewContent = Effect.fn("ReviewContent.loadJson")(function*(
  receipt: PostcommitContentReceipt
) {
  const verifiedContent = yield* VerifiedContent
  return yield* verifiedContent.loadJson(receipt).pipe(
    Effect.mapError(
      (cause) =>
      new ReviewContentError({
        url: receipt.postcommitPath,
        detail: "Saved-item feedback could not be verified. No replacement content was used.",
        cause
      })
    )
  )
})
