import { Schema } from "effect"
import { DurableTimestamp } from "../durable-values.ts"

const Sha256 = Schema.String.check(
  Schema.isPattern(/^[a-f0-9]{64}$/, { expected: "a lowercase SHA-256 digest" })
)

const SafePackPath = Schema.String.check(
  Schema.makeFilter((value) => {
    if (!value.startsWith("/") || value.includes("\\") || value.includes("%")) {
      return "an exact root-relative pack path"
    }
    const parsed = new URL(value, "https://pack.invalid")
    const segments = value === "/"
      ? []
      : value.slice(1, value.endsWith("/") ? -1 : undefined).split("/")
    return parsed.origin === "https://pack.invalid" &&
      parsed.pathname === value &&
      parsed.search === "" &&
      parsed.hash === "" &&
      segments.every((segment) => segment.length > 0 && segment !== "." && segment !== "..")
      ? undefined
      : "an exact canonical root-relative pack path without aliases or URL state"
  })
)

const packManagedReservedPaths = new Set([
  "/offline/",
  "/offline-pack-shell-manifest.json",
  "/sw.js"
])

export const OfflinePackReceipt = Schema.Struct({
  kind: Schema.Literals(["artifact", "asset"]),
  path: SafePackPath,
  bytes: Schema.Int.check(
    Schema.makeFilter((value) => value > 0 ? undefined : "a positive byte length")
  ),
  sha256: Sha256
})

export const OfflinePackCompatibility = Schema.Struct({
  profileId: Schema.NonEmptyString,
  label: Schema.NonEmptyString,
  compatibilityKey: Schema.NonEmptyString
})

export const OfflineShellManifestReceipt = Schema.Struct({
  path: SafePackPath,
  bytes: Schema.Int.check(
    Schema.makeFilter((value) => value > 0 ? undefined : "a positive byte length")
  ),
  sha256: Sha256
})

export const OfflineShellReceipt = Schema.Struct({
  kind: Schema.Literals(["navigation", "application-asset"]),
  path: SafePackPath,
  bytes: Schema.Int.check(
    Schema.makeFilter((value) => value > 0 ? undefined : "a positive byte length")
  ),
  sha256: Sha256
})

export class OfflineShellManifest extends Schema.Class<OfflineShellManifest>(
  "@nycustodian/site/offline-packs/OfflineShellManifest"
)({
  schemaVersion: Schema.Literal(1),
  scope: Schema.Literal("offline-application-shell"),
  packId: Schema.NonEmptyString,
  releaseId: Schema.NonEmptyString,
  packVersion: Schema.Natural,
  receipts: Schema.NonEmptyArray(OfflineShellReceipt)
}) {}

export class OfflinePackDescriptor extends Schema.Class<OfflinePackDescriptor>(
  "@nycustodian/site/offline-packs/OfflinePackDescriptor"
)({
  schemaVersion: Schema.Literal(1),
  id: Schema.NonEmptyString,
  releaseId: Schema.NonEmptyString,
  packVersion: Schema.Natural,
  locale: Schema.Literals(["en", "es"]),
  label: Schema.NonEmptyString,
  lifecycle: Schema.Literals(["preview", "published", "retired"]),
  publicationTime: Schema.Union([Schema.String, Schema.Null]),
  compatibility: Schema.NonEmptyArray(OfflinePackCompatibility),
  counts: Schema.Struct({
    profiles: Schema.Natural,
    sources: Schema.Natural,
    tools: Schema.Natural,
    questions: Schema.Natural,
    hazardScenes: Schema.Natural
  }),
  totalBytes: Schema.Natural,
  receipts: Schema.NonEmptyArray(OfflinePackReceipt),
  applicationShellManifestPath: SafePackPath,
  applicationShellManifestReceipt: Schema.Union([OfflineShellManifestReceipt, Schema.Null]),
  applicationShellBytes: Schema.Union([Schema.Natural, Schema.Null]),
  estimatedDownloadBytes: Schema.Union([Schema.Natural, Schema.Null]),
  requiredNavigation: Schema.NonEmptyArray(SafePackPath)
}) {}

export const OfflinePackStatus = Schema.Literals([
  "staging",
  "verifying",
  "staged",
  "activating",
  "active",
  "retained",
  "quarantined",
  "removing"
])

export class OfflinePackRecord extends Schema.Class<OfflinePackRecord>(
  "@nycustodian/site/offline-packs/OfflinePackRecord"
)({
  id: Schema.NonEmptyString,
  packId: Schema.NonEmptyString,
  generation: Schema.NonEmptyString,
  contentFingerprint: Sha256,
  shellBuildFingerprint: Sha256,
  descriptor: OfflinePackDescriptor,
  status: OfflinePackStatus,
  cacheName: Schema.NonEmptyString,
  downloadedBytes: Schema.Natural,
  stagedAt: DurableTimestamp,
  verifiedAt: Schema.Union([DurableTimestamp, Schema.Null]),
  activatedAt: Schema.Union([DurableTimestamp, Schema.Null]),
  detail: Schema.Union([Schema.NonEmptyString, Schema.Null])
}) {}

export class OfflinePackOperationRecord extends Schema.Class<OfflinePackOperationRecord>(
  "@nycustodian/site/offline-packs/OfflinePackOperationRecord"
)({
  id: Schema.NonEmptyString,
  claimId: Schema.NonEmptyString,
  packId: Schema.NonEmptyString,
  generation: Schema.NonEmptyString,
  contentFingerprint: Sha256,
  shellBuildFingerprint: Sha256,
  kind: Schema.Literals(["stage", "activate", "remove"]),
  phase: Schema.Literals(["running", "complete", "failed"]),
  startedAt: DurableTimestamp,
  updatedAt: DurableTimestamp,
  detail: Schema.Union([Schema.NonEmptyString, Schema.Null])
}) {}

export class OfflinePackRetirementRecord extends Schema.Class<OfflinePackRetirementRecord>(
  "@nycustodian/site/offline-packs/OfflinePackRetirementRecord"
)({
  id: Schema.NonEmptyString,
  packId: Schema.NonEmptyString,
  releaseId: Schema.NonEmptyString,
  packVersion: Schema.Natural,
  lifecycle: Schema.Literal("retired"),
  observedAt: DurableTimestamp
}) {}

export class OfflinePackOrphanCacheRecord extends Schema.Class<OfflinePackOrphanCacheRecord>(
  "@nycustodian/site/offline-packs/OfflinePackOrphanCacheRecord"
)({
  id: Schema.NonEmptyString,
  cacheName: Schema.NonEmptyString,
  sourceKey: Schema.NonEmptyString,
  recordedAt: DurableTimestamp
}) {}

export interface OfflinePackRemovalImpact {
  readonly activeSessionPins: number
  readonly historicalAttempts: number
}

export const offlinePackRootManifestCacheKey =
  "https://nycustodian-pack-root.invalid/application-shell-manifest-v1"

export const offlinePackCacheName = (
  descriptor: OfflinePackDescriptor,
  generation: string
): string =>
  `nycustodian-pack-${encodeURIComponent(descriptor.id)}-${encodeURIComponent(descriptor.releaseId)}-${descriptor.packVersion}-${descriptor.locale}-${encodeURIComponent(generation)}`

export const offlinePackClaimId = (
  packId: string,
  generation: string
): string => `claim:${encodeURIComponent(packId)}:${encodeURIComponent(generation)}`

export const offlinePackRetirementId = (
  packId: string
): string => `offline-pack-retirement:${encodeURIComponent(packId)}`

export const offlinePackOrphanCacheId = (
  cacheName: string
): string => `offline-pack-orphan-cache:${encodeURIComponent(cacheName)}`

export const decodeOfflinePackOrphanCacheRecord = (
  value: unknown
): OfflinePackOrphanCacheRecord => {
  const record = Schema.decodeUnknownSync(
    OfflinePackOrphanCacheRecord,
    { onExcessProperty: "error" }
  )(value)
  if (
    !record.cacheName.startsWith("nycustodian-pack-") ||
    record.id !== offlinePackOrphanCacheId(record.cacheName)
  ) {
    throw new Error("An orphan offline-pack cache record has an invalid owned namespace")
  }
  return record
}

export const decodeOfflinePackRetirementRecord = (
  value: unknown
): OfflinePackRetirementRecord => {
  const record = Schema.decodeUnknownSync(
    OfflinePackRetirementRecord,
    { onExcessProperty: "error" }
  )(value)
  if (record.id !== offlinePackRetirementId(record.packId)) {
    throw new Error("An offline-pack retirement record has an invalid durable identity")
  }
  return record
}

export const OfflinePackGenerationClaim = Schema.Struct({
  claimId: Schema.NonEmptyString,
  packId: Schema.NonEmptyString,
  generation: Schema.NonEmptyString,
  contentFingerprint: Sha256,
  shellBuildFingerprint: Sha256,
  releaseId: Schema.NonEmptyString,
  packVersion: Schema.Natural
}).check(
  Schema.makeFilter((claim) =>
    claim.claimId === offlinePackClaimId(claim.packId, claim.generation)
      ? undefined
      : "an exact device-local offline-pack generation claim"
  )
)

export type OfflinePackGenerationClaim = typeof OfflinePackGenerationClaim.Type

export const decodeOfflinePackGenerationClaim = (
  value: unknown
): OfflinePackGenerationClaim => Schema.decodeUnknownSync(
  OfflinePackGenerationClaim,
  { onExcessProperty: "error" }
)(value)

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)])
    )
  }
  return value
}

export const offlinePackContentFingerprintSource = (
  descriptor: OfflinePackDescriptor
): string => JSON.stringify(canonicalize({
  schemaVersion: 1,
  scope: "portable-offline-content",
  packId: descriptor.id,
  releaseId: descriptor.releaseId,
  packVersion: descriptor.packVersion,
  locale: descriptor.locale,
  compatibility: descriptor.compatibility.map(({ profileId, compatibilityKey }) => ({
    profileId,
    compatibilityKey
  })),
  counts: descriptor.counts,
  totalBytes: descriptor.totalBytes,
  receipts: descriptor.receipts
}))

export const offlinePackShellBuildFingerprintSource = (
  descriptor: OfflinePackDescriptor
): string => JSON.stringify(canonicalize({
  schemaVersion: 1,
  scope: "offline-application-shell-build",
  packId: descriptor.id,
  releaseId: descriptor.releaseId,
  packVersion: descriptor.packVersion,
  locale: descriptor.locale,
  presentation: {
    label: descriptor.label,
    lifecycle: descriptor.lifecycle,
    publicationTime: descriptor.publicationTime,
    compatibility: descriptor.compatibility
  },
  applicationShellManifestPath: descriptor.applicationShellManifestPath,
  applicationShellManifestReceipt: descriptor.applicationShellManifestReceipt,
  applicationShellBytes: descriptor.applicationShellBytes,
  estimatedDownloadBytes: descriptor.estimatedDownloadBytes,
  requiredNavigation: descriptor.requiredNavigation
}))

export const offlinePackOperationId = (
  kind: OfflinePackOperationRecord["kind"],
  claimId: string
): string => `${kind}:${encodeURIComponent(claimId)}`

export const assertClosedOfflinePackDescriptor = (
  descriptor: OfflinePackDescriptor
): OfflinePackDescriptor => {
  if (
    (descriptor.lifecycle === "preview" && descriptor.publicationTime !== null) ||
    (descriptor.lifecycle === "published" && descriptor.publicationTime === null)
  ) {
    throw new Error("Offline pack lifecycle and publication time disagree")
  }
  if (descriptor.publicationTime !== null) {
    const publicationTime = new Date(descriptor.publicationTime)
    if (
      !Number.isFinite(publicationTime.getTime()) ||
      publicationTime.toISOString() !== descriptor.publicationTime
    ) {
      throw new Error("Offline pack publication time is not canonical UTC")
    }
  }
  const paths = descriptor.receipts.map((receipt) => receipt.path)
  if (new Set(paths).size !== paths.length) {
    throw new Error("Offline pack contains duplicate receipt paths")
  }
  if (new Set(descriptor.requiredNavigation).size !== descriptor.requiredNavigation.length) {
    throw new Error("Offline pack contains duplicate navigation paths")
  }
  if (descriptor.applicationShellManifestPath !== "/offline-pack-shell-manifest.json") {
    throw new Error("Offline pack points at an unexpected application-shell manifest")
  }
  const bytes = descriptor.receipts.reduce((sum, receipt) => sum + receipt.bytes, 0)
  if (bytes !== descriptor.totalBytes) {
    throw new Error("Offline pack total byte count is not derived from its receipts")
  }
  if (
    descriptor.receipts.some((receipt) => packManagedReservedPaths.has(receipt.path)) ||
    descriptor.requiredNavigation.some((path) =>
      packManagedReservedPaths.has(path) || path !== "/" && !path.endsWith("/")
    )
  ) {
    throw new Error("Offline pack attempts to manage a trusted loader path or noncanonical navigation")
  }
  if (!descriptor.id.includes(descriptor.releaseId)) {
    throw new Error("Offline pack identity does not bind its release")
  }
  if (
    (descriptor.applicationShellManifestReceipt === null) !==
      (descriptor.applicationShellBytes === null) ||
    (descriptor.applicationShellManifestReceipt === null) !==
      (descriptor.estimatedDownloadBytes === null)
  ) {
    throw new Error("Offline pack has a partial finalized application-shell estimate")
  }
  return descriptor
}

export const decodeHistoricalOfflinePackDescriptor = (value: unknown): OfflinePackDescriptor =>
  assertActivatableOfflinePackDescriptor(
    assertClosedOfflinePackDescriptor(
      Schema.decodeUnknownSync(OfflinePackDescriptor, { onExcessProperty: "error" })(value)
    )
  )

export const decodeAvailableOfflinePackDescriptor = (value: unknown): OfflinePackDescriptor => {
  const descriptor = decodeHistoricalOfflinePackDescriptor(value)
  if (descriptor.lifecycle === "retired") {
    throw new Error("A retired offline pack is historical and cannot be staged for a new session")
  }
  return descriptor
}

export const decodeOfflinePackDescriptor = decodeHistoricalOfflinePackDescriptor

export const assertActivatableOfflinePackDescriptor = (
  descriptor: OfflinePackDescriptor
): OfflinePackDescriptor => {
  if (
    descriptor.applicationShellManifestReceipt === null ||
    descriptor.applicationShellManifestReceipt.path !== descriptor.applicationShellManifestPath ||
    descriptor.applicationShellBytes === null ||
    descriptor.estimatedDownloadBytes === null ||
    descriptor.applicationShellBytes < descriptor.applicationShellManifestReceipt.bytes ||
    descriptor.estimatedDownloadBytes !== descriptor.totalBytes + descriptor.applicationShellBytes
  ) {
    throw new Error("Offline pack has no exact finalized application-shell receipt and byte estimate")
  }
  return descriptor
}

export const decodeGeneratedOfflinePackDescriptor = (value: unknown): OfflinePackDescriptor =>
  assertClosedOfflinePackDescriptor(
    Schema.decodeUnknownSync(OfflinePackDescriptor, { onExcessProperty: "error" })(value)
  )

export const assertClosedOfflineShellManifest = (
  manifest: OfflineShellManifest,
  descriptor: OfflinePackDescriptor
): OfflineShellManifest => {
  if (
    manifest.packId !== descriptor.id ||
    manifest.releaseId !== descriptor.releaseId ||
    manifest.packVersion !== descriptor.packVersion
  ) {
    throw new Error("Application-shell manifest does not match its content pack")
  }
  const paths = manifest.receipts.map((receipt) => receipt.path)
  if (new Set(paths).size !== paths.length) {
    throw new Error("Application-shell manifest contains duplicate receipt paths")
  }
  const available = new Set(paths)
  const missing = descriptor.requiredNavigation.filter((path) => !available.has(path))
  if (missing.length > 0) {
    throw new Error(`Application-shell manifest is missing required navigation: ${missing.join(", ")}`)
  }
  const requiredNavigation = new Set(descriptor.requiredNavigation)
  if (
    manifest.receipts.some((receipt) =>
      packManagedReservedPaths.has(receipt.path) ||
      descriptor.receipts.some((content) => content.path === receipt.path) ||
      (receipt.kind === "navigation") !== requiredNavigation.has(receipt.path)
    )
  ) {
    throw new Error("Application-shell manifest crosses the trusted loader or content boundary")
  }
  const shellBytes = (descriptor.applicationShellManifestReceipt?.bytes ?? 0) +
    manifest.receipts.reduce((sum, receipt) => sum + receipt.bytes, 0)
  if (shellBytes !== descriptor.applicationShellBytes) {
    throw new Error("Application-shell byte estimate is not derived from its exact receipt closure")
  }
  return manifest
}

export const decodeOfflineShellManifest = (
  value: unknown,
  descriptor: OfflinePackDescriptor
): OfflineShellManifest => assertClosedOfflineShellManifest(
  Schema.decodeUnknownSync(OfflineShellManifest, { onExcessProperty: "error" })(value),
  descriptor
)

const assertOrderedTimestamp = (
  earlier: number,
  later: number | null,
  detail: string
): void => {
  if (later !== null && later < earlier) throw new Error(detail)
}

export const assertOfflinePackRecordInvariants = (
  record: OfflinePackRecord
): OfflinePackRecord => {
  const descriptor = decodeOfflinePackDescriptor(record.descriptor)
  const estimatedBytes = descriptor.estimatedDownloadBytes
  if (estimatedBytes === null) {
    throw new Error("A persisted offline pack must have a finalized byte estimate")
  }
  if (
    record.packId !== descriptor.id ||
    record.id !== offlinePackClaimId(record.packId, record.generation) ||
    record.cacheName !== offlinePackCacheName(descriptor, record.generation)
  ) {
    throw new Error("A persisted offline pack has an invalid durable identity or cache namespace")
  }
  if (
    descriptor.lifecycle === "retired" &&
    record.status !== "retained" &&
    record.status !== "quarantined" &&
    record.status !== "removing"
  ) {
    throw new Error("A retired offline pack must remain historical")
  }
  if (record.downloadedBytes > estimatedBytes) {
    throw new Error("A persisted offline pack exceeds its finalized byte estimate")
  }
  assertOrderedTimestamp(
    record.stagedAt,
    record.verifiedAt,
    "A persisted offline pack was verified before staging began"
  )
  if (record.verifiedAt !== null) {
    assertOrderedTimestamp(
      record.verifiedAt,
      record.activatedAt,
      "A persisted offline pack was activated before verification"
    )
  } else if (record.activatedAt !== null) {
    throw new Error("A persisted offline pack was activated without a verification time")
  }

  const completeStatuses = new Set<OfflinePackRecord["status"]>([
    "verifying",
    "staged",
    "activating",
    "active",
    "retained"
  ])
  if (completeStatuses.has(record.status) && record.downloadedBytes !== estimatedBytes) {
    throw new Error("A complete offline-pack state does not contain its finalized byte closure")
  }
  if (
    (record.status === "staging" || record.status === "verifying") &&
    (record.verifiedAt !== null || record.activatedAt !== null)
  ) {
    throw new Error("An unfinished offline pack claims verification or activation")
  }
  if (
    (record.status === "staged" || record.status === "activating") &&
    record.verifiedAt === null
  ) {
    throw new Error("An activatable offline pack has no verification time")
  }
  if (
    (record.status === "active" || record.status === "retained") &&
    (record.verifiedAt === null || record.activatedAt === null)
  ) {
    throw new Error("An active or retained offline pack has incomplete lifecycle timestamps")
  }
  if (record.status === "quarantined") {
    if (record.detail === null) {
      throw new Error("A quarantined offline pack must explain why it is unusable")
    }
  } else if (record.detail !== null) {
    throw new Error("Only a quarantined offline pack may retain a failure detail")
  }
  return record
}

export const decodeOfflinePackRecord = (value: unknown): OfflinePackRecord =>
  assertOfflinePackRecordInvariants(
    Schema.decodeUnknownSync(OfflinePackRecord, { onExcessProperty: "error" })(value)
  )

export const assertOfflinePackOperationInvariants = (
  operation: OfflinePackOperationRecord
): OfflinePackOperationRecord => {
  if (
    operation.id !== offlinePackOperationId(
      operation.kind,
      operation.claimId
    ) ||
    operation.claimId !== offlinePackClaimId(operation.packId, operation.generation) ||
    operation.updatedAt < operation.startedAt
  ) {
    throw new Error("An offline-pack operation has an invalid durable identity or timeline")
  }
  if (
    (operation.phase === "failed") !== (operation.detail !== null)
  ) {
    throw new Error("An offline-pack operation has an invalid completion detail")
  }
  return operation
}

export const decodeOfflinePackOperationRecord = (
  value: unknown
): OfflinePackOperationRecord => assertOfflinePackOperationInvariants(
  Schema.decodeUnknownSync(OfflinePackOperationRecord, { onExcessProperty: "error" })(value)
)
