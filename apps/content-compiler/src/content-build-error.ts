import { Schema } from "effect"

export class ContentBuildError extends Schema.TaggedError<ContentBuildError>()("ContentBuildError", {
  detail: Schema.String,
  cause: Schema.Defect()
}) {}
