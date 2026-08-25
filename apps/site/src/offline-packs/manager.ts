import { Context, Effect, Layer, Schema } from "effect"
import {
  verifiedContentCacheKey,
  verifiedContentCacheName,
  verifiedContentResponseForCache
} from "../verified-content.ts"
import {
  OfflinePackDescriptor,
  OfflinePackOperationRecord,
  OfflinePackRecord,
  decodeOfflinePackDescriptor,
  decodeOfflinePackRecord,
  decodeOfflineShellManifest,
  offlinePackCacheName,
  offlinePackClaimId,
  offlinePackContentFingerprintSource,
  offlinePackOperationId,
  offlinePackRootManifestCacheKey,
  offlinePackShellBuildFingerprintSource,
  type OfflinePackRemovalImpact
} from "./model.ts"
import {
  OfflinePackPersistence,
  OfflinePackRemovalClaimBlocked,
  OfflinePackRetiredClaimConflict,
  OfflinePackStageClaimConflict
} from "./persistence.ts"

export class OfflinePackManagerError extends Schema.TaggedError<OfflinePackManagerError>()(
  "OfflinePackManagerError",
  {
    operation: Schema.NonEmptyString,
    reason: Schema.Literals([
      "active-session-pin",
      "confirmation-required",
      "integrity-failure",
      "network-failure",
      "quota-limited",
      "storage-failure",
      "state-conflict"
    ]),
    detail: Schema.NonEmptyString,
    cause: Schema.Unknown
  }
) {}

export interface OfflinePackPlatform {
  readonly deleteCache: (name: string) => Promise<boolean>
  readonly fetch: (path: string, init: RequestInit) => Promise<Response>
  readonly now: () => number
  readonly openCache: (name: string) => Promise<Cache>
  readonly origin: () => string
  readonly randomUUID: () => string
  readonly sha256: (bytes: Uint8Array) => Promise<string>
}

export const offlinePackPointerCacheName = "nycustodian-pack-pointer-v1"
export const offlinePackPointerPath = "/__nycustodian_active_pack"

const synchronizeActivePointer = async (
  platform: OfflinePackPlatform,
  packs: ReadonlyArray<OfflinePackRecord>
): Promise<void> => {
  const pointer = await platform.openCache(offlinePackPointerCacheName)
  const key = new URL(offlinePackPointerPath, platform.origin()).href
  const active = packs.find((pack) => pack.status === "active")
  if (active === undefined) {
    await pointer.delete(key)
    return
  }
  await pointer.put(key, new Response(active.cacheName, {
    status: 200,
    headers: { "content-type": "text/plain; charset=utf-8" }
  }))
}

export class OfflinePackManager extends Context.Service<
  OfflinePackManager,
  {
    readonly activate: (
      claimId: string
    ) => Effect.Effect<ReadonlyArray<OfflinePackRecord>, OfflinePackManagerError>
    readonly list: () => Effect.Effect<ReadonlyArray<OfflinePackRecord>, OfflinePackManagerError>
    readonly previewRemoval: (
      claimId: string
    ) => Effect.Effect<OfflinePackRemovalImpact, OfflinePackManagerError>
    readonly reconcileDescriptor: (
      descriptor: OfflinePackDescriptor
    ) => Effect.Effect<ReadonlyArray<OfflinePackRecord>, OfflinePackManagerError>
    readonly remove: (
      claimId: string,
      confirmedHistoricalImpact: boolean
    ) => Effect.Effect<void, OfflinePackManagerError>
    readonly stage: (
      descriptor: OfflinePackDescriptor
    ) => Effect.Effect<OfflinePackRecord, OfflinePackManagerError>
  }
>()("@nycustodian/site/OfflinePackManager") {}

const managerError = (
  operation: string,
  reason: OfflinePackManagerError["reason"],
  detail: string,
  cause: unknown
): OfflinePackManagerError => new OfflinePackManagerError({
  operation,
  reason,
  detail,
  cause
})

const bytesToResponse = (source: Response, bytes: ArrayBuffer): Response => {
  const headers = new Headers()
  const contentType = source.headers.get("content-type")
  if (contentType !== null) headers.set("content-type", contentType)
  return new Response(bytes.slice(0), { status: 200, headers })
}

const putPackCacheResponse = async (
  cache: Cache,
  key: RequestInfo | URL,
  response: Response,
  detail: string
): Promise<void> => {
  try {
    await cache.put(key, response)
  } catch (cause) {
    const quotaLimited = typeof cause === "object" && cause !== null &&
      "name" in cause && cause.name === "QuotaExceededError"
    throw managerError(
      "stage",
      quotaLimited ? "quota-limited" : "storage-failure",
      quotaLimited
        ? `${detail} Browser storage reported that its quota is exhausted.`
        : detail,
      cause
    )
  }
}

const fetchVerifiedReceipt = async (
  platform: OfflinePackPlatform,
  cache: Cache,
  receipt: { readonly path: string; readonly bytes: number; readonly sha256: string }
): Promise<{ readonly buffer: ArrayBuffer; readonly contentType: string }> => {
  let response: Response
  try {
    response = await platform.fetch(receipt.path, {
      cache: "no-store",
      credentials: "same-origin"
    })
  } catch (cause) {
    throw managerError(
      "stage",
      "network-failure",
      `Pack object could not be downloaded: ${receipt.path}`,
      cause
    )
  }
  if (!response.ok) {
    throw managerError(
      "stage",
      "network-failure",
      `Pack object returned HTTP ${response.status}: ${receipt.path}`,
      new Error(`HTTP ${response.status}`)
    )
  }
  const bytes = await response.arrayBuffer()
  const digest = await platform.sha256(new Uint8Array(bytes))
  if (bytes.byteLength !== receipt.bytes || digest !== receipt.sha256) {
    throw managerError(
      "stage",
      "integrity-failure",
      `Pack object did not match its byte receipt: ${receipt.path}`,
      new Error(`expected ${receipt.bytes}/${receipt.sha256}; received ${bytes.byteLength}/${digest}`)
    )
  }
  const contentType = response.headers.get("content-type") ?? "application/octet-stream"
  await putPackCacheResponse(
    cache,
    receipt.path,
    bytesToResponse(response, bytes),
    `The downloaded pack object could not be retained in browser storage: ${receipt.path}`
  )
  return { buffer: bytes, contentType }
}

const verifyCachedReceipt = async (
  platform: OfflinePackPlatform,
  cache: Cache,
  receipt: { readonly path: string; readonly bytes: number; readonly sha256: string }
): Promise<{ readonly buffer: ArrayBuffer; readonly contentType: string }> => {
  const response = await cache.match(receipt.path)
  if (response === undefined) {
    throw managerError(
      "verify",
      "integrity-failure",
      `A staged pack object is missing: ${receipt.path}`,
      new Error("cache miss")
    )
  }
  const bytes = await response.arrayBuffer()
  const digest = await platform.sha256(new Uint8Array(bytes))
  if (bytes.byteLength !== receipt.bytes || digest !== receipt.sha256) {
    throw managerError(
      "verify",
      "integrity-failure",
      `A staged pack object failed re-verification: ${receipt.path}`,
      new Error("staged byte receipt mismatch")
    )
  }
  return {
    buffer: bytes,
    contentType: response.headers.get("content-type") ?? "application/octet-stream"
  }
}

const fetchShellManifest = async (
  platform: OfflinePackPlatform,
  cache: Cache,
  descriptor: OfflinePackDescriptor
) => {
  const response = await platform.fetch(descriptor.applicationShellManifestPath, {
    cache: "no-store",
    credentials: "same-origin"
  })
  if (!response.ok) {
    throw new Error(`Application-shell manifest returned HTTP ${response.status}`)
  }
  const rootReceipt = descriptor.applicationShellManifestReceipt
  if (rootReceipt === null) throw new Error("Application-shell manifest has no trusted root receipt")
  const bytes = await response.arrayBuffer()
  const digest = await platform.sha256(new Uint8Array(bytes))
  if (bytes.byteLength !== rootReceipt.bytes || digest !== rootReceipt.sha256) {
    throw new Error("Application-shell manifest did not match its embedded trusted receipt")
  }
  const json = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown
  const manifest = decodeOfflineShellManifest(json, descriptor)
  await putPackCacheResponse(
    cache,
    offlinePackRootManifestCacheKey,
    bytesToResponse(response, bytes),
    "The verified application-shell manifest could not be retained in browser storage."
  )
  return manifest
}

interface VerifiedContentCandidate {
  readonly receipt: OfflinePackDescriptor["receipts"][number]
  readonly verified: {
    readonly buffer: ArrayBuffer
    readonly contentType: string
  }
}

const isPromotableReceipt = (
  receipt: OfflinePackDescriptor["receipts"][number]
): boolean => receipt.kind === "asset" || receipt.path.endsWith(".postcommit.json")

const promoteVerifiedContent = async (
  platform: OfflinePackPlatform,
  candidates: ReadonlyArray<VerifiedContentCandidate>,
  insertedKeys: string[]
): Promise<void> => {
  const cache = await platform.openCache(verifiedContentCacheName)
  for (const { receipt, verified } of candidates) {
    if (!isPromotableReceipt(receipt)) continue
    if (receipt.path.endsWith(".postcommit.json")) {
      JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(verified.buffer))
    }
    const key = verifiedContentCacheKey(platform.origin(), receipt)
    const existing = await cache.match(key)
    await putPackCacheResponse(
      cache,
      key,
      verifiedContentResponseForCache(
        { ...receipt, kind: receipt.kind === "asset" ? "asset" : "postcommit" },
        verified.buffer,
        verified.contentType
      ),
      `A verified runtime object could not be retained in browser storage: ${receipt.path}`
    )
    if (existing === undefined) insertedKeys.push(key)
  }
}

const purgeUnsharedPromotions = async (
  platform: OfflinePackPlatform,
  insertedKeys: ReadonlyArray<string>,
  packs: ReadonlyArray<OfflinePackRecord>,
  excludedClaimId: string
): Promise<void> => {
  if (insertedKeys.length === 0) return
  const protectedKeys = new Set(
    packs
      .filter((pack) => pack.id !== excludedClaimId && pack.status !== "quarantined")
      .flatMap((pack) => pack.descriptor.receipts)
      .filter(isPromotableReceipt)
      .map((receipt) => verifiedContentCacheKey(platform.origin(), receipt))
  )
  const cache = await platform.openCache(verifiedContentCacheName)
  for (const key of new Set(insertedKeys)) {
    if (!protectedKeys.has(key)) await cache.delete(key)
  }
}

const operation = (
  pack: Pick<
    OfflinePackRecord,
    "id" | "packId" | "generation" | "contentFingerprint" | "shellBuildFingerprint"
  >,
  kind: OfflinePackOperationRecord["kind"],
  phase: OfflinePackOperationRecord["phase"],
  now: number,
  detail: string | null = null
): OfflinePackOperationRecord => new OfflinePackOperationRecord({
  id: offlinePackOperationId(kind, pack.id),
  claimId: pack.id,
  packId: pack.packId,
  generation: pack.generation,
  contentFingerprint: pack.contentFingerprint,
  shellBuildFingerprint: pack.shellBuildFingerprint,
  kind,
  phase,
  startedAt: now,
  updatedAt: now,
  detail
})

export const makeOfflinePackManager = (
  platform: OfflinePackPlatform,
  persistence: OfflinePackPersistence["Service"]
): OfflinePackManager["Service"] => {
  const verifyCompletePack = Effect.fn("OfflinePackManager.verifyCompletePack")(function*(
    input: OfflinePackRecord
  ) {
    let pack: OfflinePackRecord
    try {
      pack = decodeOfflinePackRecord(input)
    } catch (cause) {
      return yield* managerError(
        "verify",
        "integrity-failure",
        "The persisted pack record no longer satisfies its durable invariants.",
        cause
      )
    }
    const contentFingerprint = yield* Effect.tryPromise({
      try: async () => platform.sha256(
        new TextEncoder().encode(
          offlinePackContentFingerprintSource(pack.descriptor)
        )
      ),
      catch: (cause) => managerError(
        "verify",
        "integrity-failure",
        "The portable content fingerprint could not be recalculated.",
        cause
      )
    })
    if (contentFingerprint !== pack.contentFingerprint) {
      return yield* managerError(
        "verify",
        "integrity-failure",
        "The persisted portable content descriptor changed after its generation was claimed.",
        new Error("portable content fingerprint mismatch")
      )
    }
    const shellBuildFingerprint = yield* Effect.tryPromise({
      try: async () => platform.sha256(
        new TextEncoder().encode(
          offlinePackShellBuildFingerprintSource(pack.descriptor)
        )
      ),
      catch: (cause) => managerError(
        "verify",
        "integrity-failure",
        "The application-shell build fingerprint could not be recalculated.",
        cause
      )
    })
    if (shellBuildFingerprint !== pack.shellBuildFingerprint) {
      return yield* managerError(
        "verify",
        "integrity-failure",
        "The persisted application-shell build descriptor changed after its generation was claimed.",
        new Error("application-shell build fingerprint mismatch")
      )
    }
    const cache = yield* Effect.tryPromise({
      try: () => platform.openCache(pack.cacheName),
      catch: (cause) => managerError("verify", "storage-failure", "The pack cache could not be opened.", cause)
    })
    const rootReceipt = pack.descriptor.applicationShellManifestReceipt
    if (rootReceipt === null) {
      return yield* managerError(
        "verify",
        "integrity-failure",
        "The staged pack has no trusted application-shell root receipt.",
        new Error("missing root receipt")
      )
    }
    const root = yield* Effect.tryPromise({
      try: () => verifyCachedReceipt(platform, cache, {
        ...rootReceipt,
        path: offlinePackRootManifestCacheKey
      }),
      catch: (cause) => cause instanceof OfflinePackManagerError
        ? cause
        : managerError(
            "verify",
            "integrity-failure",
            "The exact non-servable application-shell root bytes could not be reverified.",
            cause
          )
    })
    const shellManifest = yield* Effect.try({
      try: () => decodeOfflineShellManifest(
        JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(root.buffer)) as unknown,
        pack.descriptor
      ),
      catch: (cause) => managerError(
        "verify",
        "integrity-failure",
        "The exact application-shell root bytes no longer decode to the declared closure.",
        cause
      )
    })
    const verifiedContent: VerifiedContentCandidate[] = []
    for (const receipt of pack.descriptor.receipts) {
      const verified = yield* Effect.tryPromise({
        try: () => verifyCachedReceipt(platform, cache, receipt),
        catch: (cause) => cause instanceof OfflinePackManagerError
          ? cause
          : managerError("verify", "integrity-failure", "A content object could not be reverified.", cause)
      })
      verifiedContent.push({ receipt, verified })
    }
    for (const receipt of shellManifest.receipts) {
      yield* Effect.tryPromise({
        try: () => verifyCachedReceipt(platform, cache, receipt),
        catch: (cause) => cause instanceof OfflinePackManagerError
          ? cause
          : managerError("verify", "integrity-failure", "An application-shell object could not be reverified.", cause)
      })
    }
    return verifiedContent
  })

  const list = Effect.fn("OfflinePackManager.list")(function*() {
    const packs = yield* persistence.reconcile().pipe(
      Effect.mapError((cause) => managerError("list", "storage-failure", cause.detail, cause))
    )
    for (const pack of packs.filter((candidate) => candidate.status === "quarantined")) {
      yield* Effect.tryPromise({
        try: async () => {
          await platform.deleteCache(pack.cacheName)
          await purgeUnsharedPromotions(
            platform,
            pack.descriptor.receipts
              .filter(isPromotableReceipt)
              .map((receipt) => verifiedContentCacheKey(platform.origin(), receipt)),
            packs,
            pack.id
          )
        },
        catch: (cause) => managerError(
          "list",
          "storage-failure",
          `Quarantined bytes for ${pack.descriptor.label} could not be cleared.`,
          cause
        )
      })
    }
    const protectedCacheNames = new Set(packs.map((pack) => pack.cacheName))
    const orphanCaches = yield* persistence.listOrphanCaches().pipe(
      Effect.mapError((cause) => managerError("list", "storage-failure", cause.detail, cause))
    )
    for (const orphan of orphanCaches) {
      yield* Effect.tryPromise({
        try: async () => {
          if (!protectedCacheNames.has(orphan.cacheName)) {
            await platform.deleteCache(orphan.cacheName)
          }
        },
        catch: (cause) => managerError(
          "list",
          "storage-failure",
          `An orphaned offline-pack cache could not be cleared: ${orphan.cacheName}`,
          cause
        )
      })
      yield* persistence.forgetOrphanCache(orphan.cacheName).pipe(
        Effect.mapError((cause) => managerError("list", "storage-failure", cause.detail, cause))
      )
    }
    yield* Effect.tryPromise({
      try: () => synchronizeActivePointer(platform, packs),
      catch: (cause) => managerError(
        "list",
        "storage-failure",
        "The active offline-pack pointer could not be reconciled.",
        cause
      )
    })
    return packs
  })

  const reconcileDescriptor = Effect.fn("OfflinePackManager.reconcileDescriptor")(function*(
    input: OfflinePackDescriptor
  ) {
    let descriptor: OfflinePackDescriptor
    try {
      descriptor = decodeOfflinePackDescriptor(input)
    } catch (cause) {
      return yield* managerError(
        "reconcile-descriptor",
        "integrity-failure",
        "The trusted offline-pack descriptor could not be reconciled.",
        cause
      )
    }
    if (descriptor.lifecycle !== "retired") return yield* list()

    // Reconcile malformed/interrupted records before applying the trusted
    // retirement marker, without first re-publishing a CacheStorage pointer.
    // The retirement transaction then atomically writes the tombstone,
    // demotes the active record, and clears the IDB pointer.
    yield* persistence.reconcile().pipe(
      Effect.mapError((cause) => managerError(
        "retire",
        "storage-failure",
        cause.detail,
        cause
      ))
    )
    yield* persistence.retire(descriptor, platform.now()).pipe(
      Effect.mapError((cause) => managerError(
        "retire",
        "storage-failure",
        "The trusted retirement could not be recorded on this device.",
        cause
      ))
    )
    return yield* list()
  })

  const stage = Effect.fn("OfflinePackManager.stage")(function*(input: OfflinePackDescriptor) {
    let descriptor: OfflinePackDescriptor
    try {
      descriptor = decodeOfflinePackDescriptor(input)
    } catch (cause) {
      return yield* managerError(
        "stage",
        "integrity-failure",
        "The pack descriptor is invalid or not closed over exact byte receipts.",
        cause
      )
    }
    if (descriptor.lifecycle === "retired") {
      return yield* managerError(
        "stage",
        "state-conflict",
        "A retired offline pack is historical and cannot be downloaded for a new session.",
        new Error("retired pack")
      )
    }

    const now = platform.now()
    const generation = platform.randomUUID()
    const cacheName = offlinePackCacheName(descriptor, generation)
    const contentFingerprint = yield* Effect.tryPromise({
      try: () => platform.sha256(new TextEncoder().encode(
        offlinePackContentFingerprintSource(descriptor)
      )),
      catch: (cause) => managerError(
        "stage",
        "integrity-failure",
        "The portable content fingerprint could not be created.",
        cause
      )
    })
    const shellBuildFingerprint = yield* Effect.tryPromise({
      try: () => platform.sha256(new TextEncoder().encode(
        offlinePackShellBuildFingerprintSource(descriptor)
      )),
      catch: (cause) => managerError(
        "stage",
        "integrity-failure",
        "The application-shell build fingerprint could not be created.",
        cause
      )
    })
    let record = decodeOfflinePackRecord(new OfflinePackRecord({
      id: offlinePackClaimId(descriptor.id, generation),
      packId: descriptor.id,
      generation,
      contentFingerprint,
      shellBuildFingerprint,
      descriptor,
      status: "staging",
      cacheName,
      downloadedBytes: 0,
      stagedAt: now,
      verifiedAt: null,
      activatedAt: null,
      detail: null
    }))
    const started = operation(record, "stage", "running", now)
    yield* persistence.beginStage(record, started).pipe(
      Effect.mapError((cause) => managerError(
        "stage",
        cause.cause instanceof OfflinePackStageClaimConflict ||
          cause.cause instanceof OfflinePackRetiredClaimConflict
          ? "state-conflict"
          : "storage-failure",
        cause.detail,
        cause
      ))
    )

    const insertedPromotionKeys: string[] = []
    const result = yield* Effect.gen(function*() {
      yield* Effect.tryPromise({
        try: () => platform.deleteCache(cacheName),
        catch: (cause) => managerError("stage", "storage-failure", "The old staging cache could not be cleared.", cause)
      })
      const cache = yield* Effect.tryPromise({
        try: () => platform.openCache(cacheName),
        catch: (cause) => managerError("stage", "storage-failure", "The pack cache could not be opened.", cause)
      })

      for (const receipt of descriptor.receipts) {
        yield* Effect.tryPromise({
          try: () => fetchVerifiedReceipt(platform, cache, receipt),
          catch: (cause) => cause instanceof OfflinePackManagerError
            ? cause
            : managerError("stage", "network-failure", "A pack object could not be staged.", cause)
        })
        record = decodeOfflinePackRecord(new OfflinePackRecord({
          ...record,
          downloadedBytes: record.downloadedBytes + receipt.bytes
        }))
        yield* persistence.putPack(record).pipe(
          Effect.mapError((cause) => managerError("stage", "storage-failure", cause.detail, cause))
        )
      }

      const shellManifest = yield* Effect.tryPromise({
        try: () => fetchShellManifest(platform, cache, descriptor),
        catch: (cause) => cause instanceof OfflinePackManagerError
          ? cause
          : managerError(
              "stage",
              "integrity-failure",
              "The build-finalized application-shell receipt manifest is unavailable or invalid.",
              cause
            )
      })
      for (const receipt of shellManifest.receipts) {
        yield* Effect.tryPromise({
          try: () => fetchVerifiedReceipt(platform, cache, receipt),
          catch: (cause) => cause instanceof OfflinePackManagerError
            ? cause
            : managerError("stage", "network-failure", "An application-shell object could not be staged.", cause)
        })
      }
      record = decodeOfflinePackRecord(new OfflinePackRecord({
        ...record,
        status: "verifying",
        downloadedBytes: descriptor.estimatedDownloadBytes ?? record.downloadedBytes
      }))
      yield* persistence.putPack(record).pipe(
        Effect.mapError((cause) => managerError("verify", "storage-failure", cause.detail, cause))
      )

      const verifiedContent = yield* verifyCompletePack(record)
      yield* Effect.tryPromise({
        try: () => promoteVerifiedContent(platform, verifiedContent, insertedPromotionKeys),
        catch: (cause) => cause instanceof OfflinePackManagerError
          ? cause
          : managerError(
              "verify",
              "storage-failure",
              "The fully verified pack could not be promoted into the runtime cache.",
              cause
            )
      })

      const verifiedAt = platform.now()
      const staged = decodeOfflinePackRecord(new OfflinePackRecord({
        ...record,
        status: "staged",
        verifiedAt,
        detail: null
      }))
      record = yield* persistence.completeStage(staged, new OfflinePackOperationRecord({
        ...started,
        phase: "complete",
        updatedAt: verifiedAt
      })).pipe(
        Effect.mapError((cause) => managerError("verify", "storage-failure", cause.detail, cause))
      )
      return record
    }).pipe(
      Effect.catch((cause) => Effect.gen(function*() {
        const failedAt = platform.now()
        const durablePacks = yield* persistence.list().pipe(Effect.orElseSucceed(() => []))
        yield* Effect.tryPromise({
          try: async () => {
            await platform.deleteCache(cacheName)
            await purgeUnsharedPromotions(
              platform,
              insertedPromotionKeys,
              durablePacks,
              record.id
            )
          },
          catch: () => managerError(
            "stage-cleanup",
            "storage-failure",
            "A failed generation needs explicit cleanup from the offline-pack page.",
            cause
          )
        }).pipe(Effect.ignore)
        const failed = decodeOfflinePackRecord(new OfflinePackRecord({
          ...record,
          status: "quarantined",
          detail: cause.detail
        }))
        yield* persistence.putPack(failed).pipe(Effect.ignore)
        yield* persistence.putOperation(new OfflinePackOperationRecord({
          ...started,
          phase: "failed",
          updatedAt: failedAt,
          detail: cause.detail
        })).pipe(Effect.ignore)
        return yield* cause
      }))
    )
    return result
  })

  const activate = Effect.fn("OfflinePackManager.activate")(function*(claimId: string) {
    const pack = yield* persistence.find(claimId).pipe(
      Effect.mapError((cause) => managerError("activate", "storage-failure", cause.detail, cause))
    )
    if (pack === undefined || (pack.status !== "staged" && pack.status !== "retained")) {
      return yield* managerError(
        "activate",
        "state-conflict",
        "Only a verified staged or retained pack can be activated.",
        new Error(pack?.status ?? "missing")
      )
    }
    if (pack.descriptor.lifecycle === "retired") {
      return yield* managerError(
        "activate",
        "state-conflict",
        "A retired offline pack may remain for history but cannot be activated for a new session.",
        new Error("retired pack")
      )
    }
    const now = platform.now()
    const started = operation(pack, "activate", "running", now)
    const claimed = yield* persistence.beginActivation(
      pack.id,
      pack.generation,
      pack.contentFingerprint,
      pack.shellBuildFingerprint,
      started
    ).pipe(
      Effect.mapError((cause) => managerError(
        "activate",
        cause.cause instanceof OfflinePackRetiredClaimConflict
          ? "state-conflict"
          : "storage-failure",
        cause.detail,
        cause
      ))
    )
    const insertedPromotionKeys: string[] = []
    const activated = yield* Effect.gen(function*() {
      // Freshly decode and rehash the non-servable root, portable content
      // fingerprint, shell-build fingerprint, and both receipt closures after
      // claiming this exact device-local generation.
      const verifiedContent = yield* verifyCompletePack(claimed)
      yield* Effect.tryPromise({
        try: () => promoteVerifiedContent(platform, verifiedContent, insertedPromotionKeys),
        catch: (cause) => cause instanceof OfflinePackManagerError
          ? cause
          : managerError(
              "activate",
              "storage-failure",
              "Verified runtime objects could not be reconciled before activation.",
              cause
            )
      })
      const completedAt = platform.now()
      return yield* persistence.activate(
        pack.id,
        pack.generation,
        pack.contentFingerprint,
        pack.shellBuildFingerprint,
        new OfflinePackOperationRecord({
          ...started,
          phase: "complete",
          updatedAt: completedAt
        })
      ).pipe(
        Effect.mapError((cause) => managerError("activate", "state-conflict", cause.detail, cause))
      )
    }).pipe(
      Effect.catch((cause) => Effect.gen(function*() {
        const failedAt = platform.now()
        const durablePacks = yield* persistence.list().pipe(Effect.orElseSucceed(() => []))
        const promotionKeys = claimed.descriptor.receipts
          .filter(isPromotableReceipt)
          .map((receipt) => verifiedContentCacheKey(platform.origin(), receipt))
        yield* Effect.tryPromise({
          try: async () => {
            await platform.deleteCache(claimed.cacheName)
            await purgeUnsharedPromotions(
              platform,
              [...insertedPromotionKeys, ...promotionKeys],
              durablePacks,
              claimed.id
            )
          },
          catch: () => cause
        }).pipe(Effect.ignore)
        yield* persistence.failActivation(
          claimed.id,
          claimed.generation,
          claimed.contentFingerprint,
          claimed.shellBuildFingerprint,
          new OfflinePackOperationRecord({
            ...started,
            phase: "failed",
            updatedAt: failedAt,
            detail: cause.detail
          })
        ).pipe(Effect.ignore)
        return yield* cause
      }))
    )
    yield* Effect.tryPromise({
      try: () => synchronizeActivePointer(platform, activated),
      catch: (cause) => managerError(
        "activate",
        "storage-failure",
        "The pack is active locally, but its offline navigation pointer needs reconciliation.",
        cause
      )
    })
    return activated
  })

  const previewRemoval = (claimId: string) => persistence.previewRemoval(claimId).pipe(
    Effect.mapError((cause) => managerError("preview-removal", "storage-failure", cause.detail, cause))
  )

  const remove = Effect.fn("OfflinePackManager.remove")(function*(
    claimId: string,
    confirmedHistoricalImpact: boolean
  ) {
    const pack = yield* persistence.find(claimId).pipe(
      Effect.mapError((cause) => managerError("remove", "storage-failure", cause.detail, cause))
    )
    if (pack === undefined) return
    const impact = yield* previewRemoval(claimId)
    if (impact.activeSessionPins > 0) {
      return yield* managerError(
        "remove",
        "active-session-pin",
        `${impact.activeSessionPins} active session pin(s) require this exact pack.`,
        impact
      )
    }
    if (impact.historicalAttempts > 0 && !confirmedHistoricalImpact) {
      return yield* managerError(
        "remove",
        "confirmation-required",
        `${impact.historicalAttempts} historical attempt(s) will retain records but lose offline content.`,
        impact
      )
    }

    const now = platform.now()
    const started = operation(pack, "remove", "running", now)
    const claimed = yield* persistence.beginRemoval(
      pack.id,
      pack.generation,
      pack.contentFingerprint,
      pack.shellBuildFingerprint,
      confirmedHistoricalImpact,
      started
    ).pipe(Effect.mapError((cause) => {
      const blocked = cause.cause
      return blocked instanceof OfflinePackRemovalClaimBlocked
        ? managerError("remove", blocked.reason, blocked.message, blocked.impact)
        : managerError("remove", "state-conflict", cause.detail, cause)
    }))

    const remaining = (yield* persistence.list().pipe(
      Effect.mapError((cause) => managerError("remove", "storage-failure", cause.detail, cause))
    )).filter((candidate) => candidate.id !== claimId)
    const retainedReceipts = new Set(
      remaining.flatMap((candidate) =>
        candidate.descriptor.receipts.map((receipt) => `${receipt.path}:${receipt.sha256}`)
      )
    )
    yield* Effect.tryPromise({
      try: async () => {
        await platform.deleteCache(claimed.cacheName)
        const verifiedCache = await platform.openCache(verifiedContentCacheName)
        for (const receipt of claimed.descriptor.receipts) {
          if (
            (receipt.kind === "asset" || receipt.path.endsWith(".postcommit.json")) &&
            !retainedReceipts.has(`${receipt.path}:${receipt.sha256}`)
          ) {
            await verifiedCache.delete(verifiedContentCacheKey(platform.origin(), receipt))
          }
        }
      },
      catch: (cause) => managerError("remove", "storage-failure", "Pack cache removal failed and can be retried.", cause)
    })
    yield* persistence.removePack(
      claimed.id,
      claimed.generation,
      claimed.contentFingerprint,
      claimed.shellBuildFingerprint
    ).pipe(
      Effect.mapError((cause) => managerError("remove", "storage-failure", cause.detail, cause))
    )
    yield* persistence.putOperation(new OfflinePackOperationRecord({
      ...started,
      phase: "complete",
      updatedAt: platform.now()
    })).pipe(Effect.mapError((cause) =>
      managerError("remove", "storage-failure", cause.detail, cause)
    ))
    yield* Effect.tryPromise({
      try: () => synchronizeActivePointer(platform, remaining),
      catch: (cause) => managerError(
        "remove",
        "storage-failure",
        "The pack bytes were removed, but the offline pointer needs reconciliation.",
        cause
      )
    })
  })

  return OfflinePackManager.of({
    activate,
    list,
    previewRemoval,
    reconcileDescriptor,
    remove,
    stage
  })
}

const bytesToHex = (bytes: Uint8Array): string =>
  [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("")

const browserPlatform: OfflinePackPlatform = {
  deleteCache: (name) => caches.delete(name),
  fetch: (path, init) => fetch(path, init),
  now: () => Date.now(),
  openCache: (name) => caches.open(name),
  origin: () => location.origin,
  randomUUID: () => crypto.randomUUID(),
  sha256: async (bytes) => {
    const copy = new Uint8Array(bytes.byteLength)
    copy.set(bytes)
    return bytesToHex(new Uint8Array(await crypto.subtle.digest("SHA-256", copy.buffer)))
  }
}

export const offlinePackManagerLive = Layer.effect(
  OfflinePackManager,
  Effect.gen(function*() {
    const persistence = yield* OfflinePackPersistence
    return makeOfflinePackManager(browserPlatform, persistence)
  })
)
