import { createHash } from "node:crypto"
import { Result, Schema, SchemaIssue, SchemaParser } from "effect"
import {
  type CorpusFile,
  CorpusFileSchema,
  type CorpusRecord,
  type Question
} from "./model.ts"

export type Phase = "decode" | "identity" | "references" | "provenance" | "audience" | "reviews"

export interface Diagnostic {
  readonly code: string
  readonly severity: "error"
  readonly phase: Phase
  readonly file: string
  readonly pointer: string
  readonly message: string
  readonly relatedIds: ReadonlyArray<string>
}

export interface CompiledCorpus {
  readonly diagnostics: ReadonlyArray<Diagnostic>
  readonly artifact?: {
    readonly canonicalJson: string
    readonly objectDigest: string
    readonly releaseRoot: string
    readonly jsonSchema: unknown
  }
}

const phaseOrder: Readonly<Record<Phase, number>> = {
  decode: 0,
  identity: 1,
  references: 2,
  provenance: 3,
  audience: 4,
  reviews: 5
}

const sortDiagnostics = (diagnostics: ReadonlyArray<Diagnostic>) =>
  [...diagnostics].sort((left, right) =>
    phaseOrder[left.phase] - phaseOrder[right.phase] ||
    left.code.localeCompare(right.code) ||
    left.file.localeCompare(right.file) ||
    left.pointer.localeCompare(right.pointer) ||
    left.message.localeCompare(right.message)
  )

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)])
    )
  }
  return value
}

export const canonicalJson = (value: unknown) => `${JSON.stringify(canonicalize(value))}\n`
export const sha256 = (bytes: string) => `sha256:${createHash("sha256").update(bytes, "utf8").digest("hex")}`

const diagnostic = (
  code: string,
  phase: Phase,
  pointer: string,
  message: string,
  relatedIds: ReadonlyArray<string> = []
): Diagnostic => ({
  code,
  severity: "error",
  phase,
  file: "corpus.json",
  pointer,
  message,
  relatedIds: [...relatedIds].sort()
})

const indexRecords = (records: ReadonlyArray<CorpusRecord>) => {
  const buckets = new Map<string, Array<CorpusRecord>>()
  records.forEach((record) => {
    const bucket = buckets.get(record.id) ?? []
    bucket.push(record)
    buckets.set(record.id, bucket)
  })
  return buckets
}

const validateIdentity = (buckets: ReadonlyMap<string, ReadonlyArray<CorpusRecord>>) =>
  [...buckets.entries()].flatMap(([id, records]) => records.length > 1
    ? [diagnostic("IDENTITY.DUPLICATE_ID", "identity", `/records/${id}`, `ID ${id} occurs ${records.length} times`, [id])]
    : [])

const allQuestions = (records: ReadonlyArray<CorpusRecord>): ReadonlyArray<Question> =>
  records.filter((record): record is Question => record._tag === "Question")

const validateReferences = (
  records: ReadonlyArray<CorpusRecord>,
  buckets: ReadonlyMap<string, ReadonlyArray<CorpusRecord>>
) => {
  const diagnostics: Array<Diagnostic> = []
  const hasOne = (id: string) => buckets.get(id)?.length === 1
  for (const record of records) {
    if (record._tag === "SourceSpan" && !hasOne(record.sourceId)) {
      diagnostics.push(diagnostic("REFERENCE.SOURCE_MISSING", "references", `/records/${record.id}/sourceId`, `Source ${record.sourceId} does not resolve uniquely`, [record.id, record.sourceId]))
    }
    if (record._tag === "Claim") {
      for (const spanId of record.supportSpanIds) {
        if (!hasOne(spanId)) diagnostics.push(diagnostic("REFERENCE.SPAN_MISSING", "references", `/records/${record.id}/supportSpanIds`, `Span ${spanId} does not resolve uniquely`, [record.id, spanId]))
      }
    }
    if (record._tag === "Question") {
      for (const conceptId of record.conceptIds) {
        if (!hasOne(conceptId)) diagnostics.push(diagnostic("REFERENCE.CONCEPT_MISSING", "references", `/records/${record.id}/conceptIds`, `Concept ${conceptId} does not resolve uniquely`, [record.id, conceptId]))
      }
      const claimIds = record.options.flatMap((option) => option.rationale.claimIds)
      for (const claimId of claimIds) {
        if (!hasOne(claimId)) diagnostics.push(diagnostic("REFERENCE.CLAIM_MISSING", "references", `/records/${record.id}/options`, `Claim ${claimId} does not resolve uniquely`, [record.id, claimId]))
      }
      if (record.prompt.promptType === "visual" && !hasOne(record.prompt.imageId)) {
        diagnostics.push(diagnostic("REFERENCE.IMAGE_MISSING", "references", `/records/${record.id}/prompt/imageId`, `Image ${record.prompt.imageId} does not resolve uniquely`, [record.id, record.prompt.imageId]))
      }
    }
    if (record._tag === "AnnouncementProfile") {
      const claimIds = record.facts.flatMap((fact) => {
        switch (fact.status) {
          case "verified": return [fact.claimId]
          case "not_published": return []
          case "conflicting": return fact.alternativeClaimIds
          case "superseded": return [fact.previousClaimId, fact.replacementClaimId]
        }
      })
      for (const claimId of claimIds) {
        if (!hasOne(claimId)) diagnostics.push(diagnostic("REFERENCE.PROFILE_CLAIM_MISSING", "references", `/records/${record.id}/facts`, `Profile claim ${claimId} does not resolve uniquely`, [record.id, claimId]))
      }
    }
    if (record._tag === "Translation" && !hasOne(record.subjectId)) {
      diagnostics.push(diagnostic("REFERENCE.TRANSLATION_SUBJECT_MISSING", "references", `/records/${record.id}/subjectId`, `Translation subject ${record.subjectId} does not resolve uniquely`, [record.id, record.subjectId]))
    }
  }
  return diagnostics
}

const validateProvenance = (records: ReadonlyArray<CorpusRecord>) =>
  records.flatMap((record) => record._tag === "Claim" && record.status === "verified" && record.supportSpanIds.length === 0
    ? [diagnostic("PROVENANCE.VERIFIED_WITHOUT_SPAN", "provenance", `/records/${record.id}/supportSpanIds`, `Verified claim ${record.id} has no source span`, [record.id])]
    : [])

const validateAudience = (
  records: ReadonlyArray<CorpusRecord>,
  buckets: ReadonlyMap<string, ReadonlyArray<CorpusRecord>>
) => allQuestions(records).flatMap((question) => question.conceptIds.flatMap((conceptId) => {
  const concept = buckets.get(conceptId)?.[0]
  return concept?._tag === "Concept" && concept.audience === "high-level"
    ? [diagnostic("AUDIENCE.HIGH_LEVEL_DEPENDENCY", "audience", `/records/${question.id}/conceptIds`, `Entry question ${question.id} reaches high-level concept ${conceptId}`, [question.id, conceptId])]
    : []
}))

const validateReviews = (records: ReadonlyArray<CorpusRecord>) => {
  const reviews = records.filter((record) => record._tag === "Review")
  return records.flatMap((record) => {
    if (record._tag === "Translation") {
      const passed = reviews.some((review) =>
        review.reviewType === "translation" &&
        review.subjectId === record.id &&
        review.subjectBasisDigest === record.basisDigest &&
        review.outcome === "passed"
      )
      return passed ? [] : [diagnostic(
        "REVIEW.TRANSLATION_MISSING_OR_STALE",
        "reviews",
        `/records/${record.id}`,
        `Translation ${record.id} lacks a passed review for its current basis digest`,
        [record.id]
      )]
    }
    if (record._tag !== "Image") return []
    return ["rights", "accessibility"].flatMap((reviewType) => {
      const passed = reviews.some((review) =>
        review.reviewType === reviewType &&
        review.subjectId === record.id &&
        review.subjectBasisDigest === record.basisDigest &&
        review.outcome === "passed"
      )
      return passed ? [] : [diagnostic(
        `REVIEW.${reviewType.toUpperCase()}_MISSING_OR_STALE`,
        "reviews",
        `/records/${record.id}`,
        `Image ${record.id} lacks a passed ${reviewType} review for its current basis digest`,
        [record.id]
      )]
    })
  })
}

const structuralDiagnostics = (issue: SchemaIssue.Issue): ReadonlyArray<Diagnostic> => {
  const formatted = SchemaIssue.makeFormatterStandardSchemaV1()(issue)
  return formatted.issues.map((entry) => diagnostic(
    "STRUCT.INVALID_VALUE",
    "decode",
    `/${(entry.path ?? []).map(String).join("/")}`,
    entry.message
  ))
}

export const compileCorpus = (input: unknown): CompiledCorpus => {
  const decoded = SchemaParser.decodeUnknownResult(CorpusFileSchema)(input, {
    errors: "all",
    onExcessProperty: "error",
    reportInput: false
  })
  if (Result.isFailure(decoded)) return { diagnostics: sortDiagnostics(structuralDiagnostics(decoded.failure)) }

  const corpus: CorpusFile = decoded.success
  const buckets = indexRecords(corpus.records)
  const diagnostics = sortDiagnostics([
    ...validateIdentity(buckets),
    ...validateReferences(corpus.records, buckets),
    ...validateProvenance(corpus.records),
    ...validateAudience(corpus.records, buckets),
    ...validateReviews(corpus.records)
  ])
  if (diagnostics.length > 0) return { diagnostics }

  const encoded = Schema.encodeSync(CorpusFileSchema)(corpus)
  const orderedRecords = [...encoded.records].sort((left, right) => left.id.localeCompare(right.id))
  const bytes = canonicalJson({ ...encoded, records: orderedRecords })
  const objectDigest = sha256(bytes)
  const releaseRoot = sha256(canonicalJson({ formatVersion: 1, objects: [objectDigest] }))
  return {
    diagnostics,
    artifact: {
      canonicalJson: bytes,
      objectDigest,
      releaseRoot,
      jsonSchema: Schema.toJsonSchemaDocument(CorpusFileSchema)
    }
  }
}
