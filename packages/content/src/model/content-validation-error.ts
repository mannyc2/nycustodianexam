import { Schema } from "effect"

export class ContentValidationError extends Schema.TaggedError<ContentValidationError>()(
  "ContentValidationError",
  {
    stage: Schema.Literals(["schema", "relation", "closure"]),
    detail: Schema.NonEmptyString,
    path: Schema.optionalKey(Schema.NonEmptyString),
    cause: Schema.optionalKey(Schema.Defect())
  }
) {}
