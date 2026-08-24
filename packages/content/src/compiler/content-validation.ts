import { ContentValidationError } from "../model/content-validation-error.ts"

export const schemaError = (path: string, cause: unknown): ContentValidationError =>
  new ContentValidationError({
    stage: "schema",
    detail: `Invalid content at ${path}`,
    path,
    cause
  })

export const relationError = (detail: string, path?: string): ContentValidationError =>
  new ContentValidationError({
    stage: "relation",
    detail,
    ...(path === undefined ? {} : { path })
  })

export const closureError = (detail: string, path?: string): ContentValidationError =>
  new ContentValidationError({
    stage: "closure",
    detail,
    ...(path === undefined ? {} : { path })
  })
