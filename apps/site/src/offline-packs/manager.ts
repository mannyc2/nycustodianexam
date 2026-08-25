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
  offlinePackImmutableFingerprintSource,
  offlinePackOperationId,
  offlinePackRootManifestCacheKey,
  type OfflinePackRemovalImpact
} from "./model.ts"
import {
  OfflinePackPersistence,
  OfflinePackRemovalClaimBlocked
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
      packId: string
    ) => Effect.Effect<ReadonlyArray<OfflinePackRecord>, OfflinePackManagerError>
    readonly list: () => Effect.Effect<ReadonlyArray<OfflinePackRecord>, OfflinePackManagerError>
    readonly previewRemoval: (
      packId: string
    ) => Effect.Effect<OfflinePackRemovalImpact, OfflinePackManagerError>
    readonly remove: (
      packId: string,
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
  await cache.put(receipt.path, bytesToResponse(response, bytes))
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
  await cache.put(
    offlinePackRootManifestCacheKey,
    bytesToResponse(response, bytes)
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
    await cache.put(
      key,
      verifiedContentResponseForCache(
        { ...receipt, kind: receipt.kind === "asset" ? "asset" : "postcommit" },
        verified.buffer,
        verified.contentType
      )
    )
    if (existing === undefined) insertedKeys.push(key)
  }
}

const purgeUnsharedPromotions = async (
  platform: OfflinePackPlatform,
  insertedKeys: ReadonlyArray<string>,
  packs: ReadonlyArray<OfflinePackRecord>,
  excludedGeneration: string
): Promise<void> => {
  if (insertedKeys.length === 0) return
  const protectedKeys = new Set(
    packs
      .filter((pack) => pack.generation !== excludedGeneration && pack.status !== "quarantined")
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
  pack: Pick<OfflinePackRecord, "id" | "generation" | "immutableFingerprint">,
  kind: OfflinePackOperationRecord["kind"],
  phase: OfflinePackOperationRecord["phase"],
  now: number,
  detail: string | null = null
): OfflinePackOperationRecord => new OfflinePackOperationRecord({
  id: offlinePackOperationId(kind, pack.id, pack.generation),
  packId: pack.id,
  generation: pack.generation,
  immutableFingerprint: pack.immutableFingerprint,
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
    const fingerprint = yield* Effect.tryPromise({
      try: async () => platform.sha256(
        new TextEncoder().encode(
          offlinePackImmutableFingerprintSource(pack.descriptor, pack.generation)
        )
      ),
      catch: (cause) => managerError(
        "verify",
        "integrity-failure",
        "The immutable pack fingerprint could not be recalculated.",
        cause
      )
    })
    if (fingerprint !== pack.immutableFingerprint) {
      return yield* managerError(
        "verify",
        "integrity-failure",
        "The persisted pack descriptor changed after its generation was claimed.",
        new Error("immutable pack fingerprint mismatch")
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
            pack.generation
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

    const existing = yield* persistence.find(descriptor.id).pipe(
      Effect.mapError((cause) => managerError("stage", "storage-failure", cause.detail, cause))
    )
    if (existing !== undefined && existing.status !== "quarantined") {
      return yield* managerError(
        "stage",
        "state-conflict",
        "Another durable lifecycle state already owns this exact pack ID.",
        new Error(existing.status)
      )
    }

    const now = platform.now()
    const generation = platform.randomUUID()
    const cacheName = offlinePackCacheName(descriptor, generation)
    const immutableFingerprint = yield* Effect.tryPromise({
      try: () => platform.sha256(new TextEncoder().encode(
        offlinePackImmutableFingerprintSource(descriptor, generation)
      )),
      catch: (cause) => managerError(
        "stage",
        "integrity-failure",
        "The immutable pack fingerprint could not be created.",
        cause
      )
    })
    let record = decodeOfflinePackRecord(new OfflinePackRecord({
      id: descriptor.id,
      generation,
      immutableFingerprint,
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
      Effect.mapError((cause) => managerError("stage", "storage-failure", cause.detail, cause))
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
        catch: (cause) => managerError(
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
        catch: (cause) => managerError(
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
              generation
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

  const activate = Effect.fn("OfflinePackManager.activate")(function*(packId: string) {
    const pack = yield* persistence.find(packId).pipe(
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
    const now = platform.now()
    const started = operation(pack, "activate", "running", now)
    const claimed = yield* persistence.beginActivation(
      pack.id,
      pack.generation,
      pack.immutableFingerprint,
      started
    ).pipe(
      Effect.mapError((cause) => managerError("activate", "storage-failure", cause.detail, cause))
    )
    const insertedPromotionKeys: string[] = []
    const activated = yield* Effect.gen(function*() {
      // Freshly decode and rehash the non-servable root, descriptor fingerprint,
      // content closure, and shell closure after claiming this exact generation.
      const verifiedContent = yield* verifyCompletePack(claimed)
      yield* Effect.tryPromise({
        try: () => promoteVerifiedContent(platform, verifiedContent, insertedPromotionKeys),
        catch: (cause) => managerError(
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
        pack.immutableFingerprint,
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
              claimed.generation
            )
          },
          catch: () => cause
        }).pipe(Effect.ignore)
        yield* persistence.failActivation(
          claimed.id,
          claimed.generation,
          claimed.immutableFingerprint,
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

  const previewRemoval = (packId: string) => persistence.previewRemoval(packId).pipe(
    Effect.mapError((cause) => managerError("preview-removal", "storage-failure", cause.detail, cause))
  )

  const remove = Effect.fn("OfflinePackManager.remove")(function*(
    packId: string,
    confirmedHistoricalImpact: boolean
  ) {
    const pack = yield* persistence.find(packId).pipe(
      Effect.mapError((cause) => managerError("remove", "storage-failure", cause.detail, cause))
    )
    if (pack === undefined) return
    if (pack.status === "active") {
      return yield* managerError(
        "remove",
        "state-conflict",
        "Activate another verified pack before removing the current active pack.",
        new Error("active")
      )
    }
    const impact = yield* previewRemoval(packId)
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
      pack.immutableFingerprint,
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
    )).filter((candidate) => candidate.id !== packId)
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
      claimed.immutableFingerprint
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

  return OfflinePackManager.of({ activate, list, previewRemoval, remove, stage })
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
