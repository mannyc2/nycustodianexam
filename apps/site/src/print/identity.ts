import type { PrintProduct, ReleasedPrintJobManifest, ReleasedPrintPacketSection } from "./model.ts"

export const printJobIdPattern = /^print-[a-z0-9][a-z0-9-]{7,63}$/

export const printPreviewPathPattern =
  /^\/print\/preview\/(print-[a-z0-9][a-z0-9-]{7,63})\/$/

export const printAlgorithmId = "print-v1-fnv1a32-xorshift32" as const

export const questionProducts = new Set<PrintProduct>([
  "blank-answer-sheet",
  "multiple-choice-questions",
  "answer-key",
  "explanations-and-sources"
])
export const fnv1a32 = (input: string, offset = 0x811c9dc5): number => {
  let hash = offset >>> 0
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash >>> 0
}

const fingerprint = (value: string): string => {
  const left = fnv1a32(value).toString(16).padStart(8, "0")
  const right = fnv1a32(value, 0x9e3779b9).toString(16).padStart(8, "0")
  return `${left}${right}`
}

export const printOptionLabel = (index: number): string => {
  let value = index + 1
  let result = ""
  while (value > 0) {
    value -= 1
    result = String.fromCharCode(65 + (value % 26)) + result
    value = Math.floor(value / 26)
  }
  return result
}

type PrintPairingFingerprintInput = Pick<
  ReleasedPrintJobManifest,
  "releaseId" | "contentVersion" | "profile" | "settings" | "questions"
>

export const computePrintPairingFingerprint = (
  manifest: PrintPairingFingerprintInput
): string | null => questionProducts.has(manifest.settings.product)
  ? fingerprint(JSON.stringify({
      algorithmId: printAlgorithmId,
      coordinateKind: "question-set-pairing-v1",
      releaseId: manifest.releaseId,
      contentVersion: manifest.contentVersion,
      profileId: manifest.profile.id,
      count: manifest.settings.count,
      seed: manifest.settings.seed,
      filters: [...manifest.settings.filters].sort(),
      questions: manifest.questions
    }))
  : null

type PrintManifestFingerprintInput = Pick<
  ReleasedPrintJobManifest,
  | "schemaVersion"
  | "algorithmId"
  | "pairingFingerprint"
  | "releaseId"
  | "contentVersion"
  | "profile"
  | "settings"
  | "questions"
  | "itemIds"
  | "assets"
  | "actualLength"
  | "actualDistribution"
  | "pageCount"
>

export const computePrintManifestFingerprint = (
  manifest: PrintManifestFingerprintInput
): string => fingerprint(JSON.stringify({
  schemaVersion: manifest.schemaVersion,
  algorithmId: manifest.algorithmId,
  pairingFingerprint: manifest.pairingFingerprint,
  releaseId: manifest.releaseId,
  contentVersion: manifest.contentVersion,
  profile: manifest.profile,
  settings: manifest.settings,
  questions: manifest.questions,
  itemIds: manifest.itemIds,
  assets: manifest.assets,
  actualLength: manifest.actualLength,
  actualDistribution: manifest.actualDistribution,
  pageCount: manifest.pageCount
}))

interface PrintPacketFingerprintInput {
  readonly schemaVersion: 1 | 2 | 3
  readonly title: string
  readonly statement: "Original practice — not an official or past exam"
  readonly sections: ReadonlyArray<ReleasedPrintPacketSection>
  readonly warnings: ReadonlyArray<string>
}

export const computePrintPacketFingerprint = (
  packet: PrintPacketFingerprintInput
): string => fingerprint(JSON.stringify({
  schemaVersion: packet.schemaVersion,
  title: packet.title,
  statement: packet.statement,
  sections: packet.sections,
  warnings: packet.warnings
}))
